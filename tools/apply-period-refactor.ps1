param(
  [string]$ProjectRoot = (Split-Path -Parent $PSScriptRoot)
)

$ErrorActionPreference = 'Stop'
$utf8NoBom = [System.Text.UTF8Encoding]::new($false)
$appPath = Join-Path $ProjectRoot 'ai-prompt-footprint\js\app.js'
$source = [System.IO.File]::ReadAllText($appPath)

function Replace-One {
  param([string]$Text, [string]$Pattern, [string]$Replacement, [string]$Label)
  $matches = [regex]::Matches($Text, $Pattern)
  if ($matches.Count -ne 1) {
    throw "Expected one $Label block; found $($matches.Count)."
  }
  return [regex]::Replace($Text, $Pattern, $Replacement, 1)
}

$outputs = @'
    function renderRunning() {
      const box = root.querySelector('#aipf-running');
      const count = totalPrompts();
      const carbon = aiPeriod('carbon'), water = aiPeriod('water'), energy = aiPeriodEnergy();
      if (count <= 0) { box.innerHTML = 'Nothing entered yet.'; return; }
      box.innerHTML =
        '<span class="aipf-impact-line">Your AI footprint for this ' + esc(periodLabel()) + ': <b>' +
        fmtMetric(state.metric === 'carbon' ? carbon : water) + '</b></span>' +
        'That is <b>' + count.toLocaleString('en-US') + '</b> prompts, costing about <b>' + fmtCarbon(carbon) +
        '</b> and <b>' + fmtWater(water) + '</b> (' + fmtEnergy(energy) + '). Counts are not annualized.';
    }

    function renderHeadline() {
      const box = root.querySelector('#aipf-headline');
      const values = aiPeriodTriple(state.metric);
      box.innerHTML =
        '<div class="aipf-verdict-fig">' + fmtMetric(values[0]) + '</div>' +
        '<p class="aipf-verdict-say">for your ' + esc(periodLabel()) + '</p>' +
        '<p class="aipf-verdict-detail">Documented estimate range: ' + fmtMetric(values[1]) + ' to ' + fmtMetric(values[2]) +
          '. These are model scenarios, not statistical confidence bounds or best/worst cases.</p>';
    }

'@
$source = Replace-One $source '(?s)    function renderRunning\(\) \{.*?(?=    function renderGridNote\(\))' $outputs 'running-output'

$words = @'
    function renderWords() {
      const box = root.querySelector('#aipf-words');
      const words = periodWords(), codeLines = periodCodeLines();
      if (words <= 0 && codeLines <= 0) { box.innerHTML = 'Add some use to see how much your AI is writing.'; return; }
      let html = '';
      if (words > 0) {
        html += 'About <b>' + fmtWords(words) + ' words</b> in this period. At the cited reading pace of ' + WPM +
          ' words a minute, that is <b>' + fmtReadingTime(words / WPM) + '</b> of reading.';
      } else {
        html += 'Almost all of your use is code, not prose to read.';
      }
      if (codeLines > 0) {
        html += '<span class="aipf-words-code">It also writes about <b>' + fmtWords(codeLines) + ' lines of code</b> in this period.</span>';
      }
      box.innerHTML = html;
    }

'@
$source = Replace-One $source '(?s)    function renderWords\(\) \{.*?(?=    function esc\(s\))' $words 'writing-output'

$context = @'
    function renderPeriodContext() {
      const ai = aiPeriod(state.metric);
      const unit = chartUnit(state.metric, 'period');
      root.querySelector('#aipf-daily-sub').innerHTML = 'Your ' + esc(periodLabel()) + ' total (highlighted below) is ' + fmtUnit(ai, unit) + '.';
      const items = state.metric === 'water' ? DAILY_WATER_ITEMS : DAILY_ITEMS;
      renderBars('#aipf-daily-bars', 'Your AI use for this period', ai, items, unit);
    }

    function updateOutputs() {
      renderPeriodControls(); renderRunning(); updateRowMeta(); renderHeadline(); renderGridNote(); renderWords(); renderPeriodContext(); renderModelTable();
    }

'@
$source = Replace-One $source '(?s)    function renderDaily\(\) \{.*?(?=    // ---- Cited report ----)' $context 'period-context'

$report = @'
    function reportHTML() {
      let rowsHtml = '', carbon = 0, carbonLower = 0, carbonUpper = 0, energy = 0, water = 0, waterLower = 0, waterUpper = 0;
      for (const row of state.rows) {
        if (!row.count) continue;
        const model = getModel(row.model);
        const carbonScenarios = perPromptTriple(model, row.size, 'carbon');
        const waterScenarios = perPromptTriple(model, row.size, 'water');
        const rowCarbon = row.count * carbonScenarios[0];
        carbon += rowCarbon; carbonLower += row.count * carbonScenarios[1]; carbonUpper += row.count * carbonScenarios[2];
        energy += row.count * model.sizes[row.size].wh;
        water += row.count * waterScenarios[0]; waterLower += row.count * waterScenarios[1]; waterUpper += row.count * waterScenarios[2];
        rowsHtml += '<tr><td>' + escXml(model.name) + '</td><td>' + escXml(sizeLabel(row.model, SIZES.find((size) => size.id === row.size))) + '</td><td class="n">' + row.count + '</td><td class="n">' + fmtCarbon(rowCarbon) + '</td><td class="n">' + fmtWater(row.count * waterScenarios[0]) + '</td></tr>';
      }
      const carbonRows = [{ label: 'My AI use for this period', v: carbon, focal: true }].concat(DAILY_ITEMS.map((item) => ({ label: item.label, v: item.c * 1000 })));
      const waterRows = [{ label: 'My AI use for this period', v: water, focal: true }].concat(DAILY_WATER_ITEMS.map((item) => ({ label: item.label, v: item.w * GAL_TO_L })));
      let refsHtml = '';
      REPORT_REFS.forEach((reference, index) => { refsHtml += '<li id="ref' + (index + 1) + '">[' + (index + 1) + '] ' + escXml(reference.label) + ' <a href="' + reference.url + '">' + escXml(reference.url) + '</a></li>'; });
      const footnote = (number) => '<sup><a href="#ref' + number + '">[' + number + ']</a></sup>';
      const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      return '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">' +
        '<title>My AI-use footprint for the selected period</title><style>' +
        'body{font-family:Georgia,"Times New Roman",serif;color:#1C1E1B;max-width:760px;margin:2.5rem auto;padding:0 1.25rem;line-height:1.55;}' +
        'h1{font-size:1.65rem;line-height:1.2;margin:0 0 .25rem;}.date{color:#6B6E66;font-size:.85rem;margin:0 0 1.5rem;}' +
        'h2{font-size:1.15rem;margin:2rem 0 .6rem;border-bottom:1px solid #ddd;padding-bottom:.25rem;}p{margin:.6rem 0;}' +
        'table{border-collapse:collapse;width:100%;font-size:.85rem;margin:.5rem 0;}th,td{text-align:left;padding:.35rem .5rem;border-bottom:1px solid #eee;}' +
        'th{color:#6B6E66;font-weight:600;font-size:.72rem;text-transform:uppercase;letter-spacing:.03em;}td.n,th.n{text-align:right;font-variant-numeric:tabular-nums;}' +
        'a{color:#1f5a7a;}sup a{text-decoration:none;}ol.refs{font-size:.8rem;color:#444;padding-left:1.2rem;}ol.refs li{margin:.35rem 0;word-break:break-word;}' +
        '.muted{color:#6B6E66;font-size:.85rem;}@media print{a{color:#000;}body{margin:0;}}</style></head><body>' +
        '<h1>My AI-use footprint for the selected period</h1>' +
        '<p class="date">Generated ' + date + ' for one ' + escXml(periodLabel()) + '. Entries are period totals and are not automatically annualized.</p>' +
        '<h2>1. What I entered</h2>' +
        '<table><thead><tr><th>Model</th><th>Typical output</th><th class="n">Prompts</th><th class="n">Carbon</th><th class="n">Water</th></tr></thead><tbody>' +
        (rowsHtml || '<tr><td colspan="5">No usage entered.</td></tr>') + '</tbody></table>' +
        '<p class="muted">Per-prompt figures come from the EcoLogits model' + footnote(1) + '; electricity uses the ' + escXml(getLoc().label) + ' grid' + footnote(2) + ', with EcoLogits embodied-hardware emissions retained.</p>' +
        '<h2>2. Carbon estimate</h2>' +
        '<p>This period is about <strong>' + fmtCarbon(carbon) + '</strong> (documented scenarios ' + fmtCarbon(carbonLower) + ' to ' + fmtCarbon(carbonUpper) + '), drawing about ' + fmtEnergy(energy) + ' of electricity.' + footnote(1) + footnote(2) + ' The span is a model range, not a statistical confidence bound or guaranteed best/worst case.</p>' +
        '<h2>3. Carbon context</h2>' + reportBarsSVG(carbonRows) +
        '<h2>4. Partial water estimate</h2>' +
        '<p>Supported components consume about <strong>' + fmtWater(water) + '</strong> (documented scenarios ' + fmtWater(waterLower) + ' to ' + fmtWater(waterUpper) + '). Water is kept separate from carbon and uses a consumption boundary.' + footnote(1) + '</p>' +
        '<h2>5. Water context</h2>' + reportBarsSVG(waterRows, fmtWater) +
        '<h2>References</h2><ol class="refs">' + refsHtml + '</ol>' +
        '</body></html>';
    }

'@
$source = Replace-One $source '(?s)    function reportHTML\(\) \{.*?(?=    function generateReport\(\))' $report 'cited-report'

$resetOld = "root.querySelector('#aipf-reset').addEventListener('click', () => { setDefaultRows(); renderRows(); updateOutputs(); });"
$resetNew = "root.querySelector('#aipf-reset').addEventListener('click', () => { state.period = 'workweek'; state.customDays = 5; setDefaultRows(); renderRows(); updateOutputs(); });"
if (-not $source.Contains($resetOld)) { throw 'Could not find the reset handler.' }
$source = $source.Replace($resetOld, $resetNew)

$eventAnchor = "      root.querySelector('#aipf-loc').addEventListener('change', (e) => {"
if (-not $source.Contains($eventAnchor)) { throw 'Could not find the event insertion point.' }
$periodEvents = @'
      root.querySelector('#aipf-period').addEventListener('change', (event) => {
        state.period = event.target.value;
        updateOutputs();
      });
      root.querySelector('#aipf-custom-days').addEventListener('input', (event) => {
        const value = Number(event.target.value);
        const valid = Number.isFinite(value) && value >= 0;
        event.target.setCustomValidity(valid ? '' : 'Enter zero or a positive number of workdays.');
        if (valid) { state.customDays = value; updateOutputs(); }
      });
'@
$source = $source.Replace($eventAnchor, $periodEvents + $eventAnchor)

[System.IO.File]::WriteAllText($appPath, $source, $utf8NoBom)
Write-Output "Applied selected-period rendering and report changes to $appPath"
