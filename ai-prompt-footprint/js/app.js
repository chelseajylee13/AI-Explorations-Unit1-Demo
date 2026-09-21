(function () {
    'use strict';

    const {
      MODELS, SIZES, SIZE_LABEL_OVERRIDES, WPM, TOKENS_PER_WORD, TOKENS_PER_LINE,
      CODE_FRACTION, DEFAULT_ROWS, PRESETS, WORLD_GRID, LOCATIONS, HOMES, DRIVING,
      DIETS, FLYING, COUNTRY_DIET, REPORT_REFS, DAILY_ITEMS, ANNUAL_ITEMS,
      DAILY_WATER_ITEMS, ANNUAL_WATER_ITEMS, GAL_TO_L, DAYS,
    } = globalThis.FootprintSourceData;
    const calculations = globalThis.FootprintCalculations;
    let uidSeq = 1;
    const state = { rows: [], metric: 'carbon', loc: 'us', home: 'med', drive: 'davg', diet: 'avg', fly: 'some', cmpSize: 'chat', period: 'workweek', customDays: 5 };

    let root = null;
    const getModel = (id) => MODELS.find((m) => m.id === id) || MODELS[0];
    const getLoc = () => LOCATIONS.find((x) => x.id === state.loc) || LOCATIONS[0];

    // ---- Formatting ----
    function fmtNum(n) {
      if (n >= 100) return Math.round(n).toLocaleString('en-US');
      if (n >= 10) return n.toFixed(1);
      if (n >= 1) return n.toFixed(2);
      if (n >= 0.01) return n.toFixed(3);
      return n > 0 ? n.toPrecision(2) : '0';
    }
    function fmtCarbon(g) {
      if (g >= 1e6) return fmtNum(g / 1e6) + ' t CO₂e';
      if (g >= 1000) return fmtNum(g / 1000) + ' kg CO₂e';
      return fmtNum(g) + ' g CO₂e';
    }
    function fmtWater(l) {
      if (l >= 1) return fmtNum(l) + ' L';
      return fmtNum(l * 1000) + ' mL';
    }
    const fmtMetric = (v) => (state.metric === 'carbon' ? fmtCarbon(v) : fmtWater(v));
    const metricWord = () => (state.metric === 'carbon' ? 'carbon' : 'water');
    // ~2 significant figures, rounded not padded, for chart labels.
    function sig(n) {
      if (!isFinite(n) || n === 0) return '0';
      const a = Math.abs(n);
      if (a >= 1000) return Math.round(n).toLocaleString('en-US');
      if (a >= 10) return String(Math.round(n));
      if (a >= 1) return String(Math.round(n * 10) / 10);
      if (a >= 0.1) return String(Math.round(n * 100) / 100);
      return String(Number(n.toPrecision(2)));
    }
    // One fixed unit per chart so bar values are directly comparable.
    function chartUnit(metric, scale) {
      if (metric === 'carbon') return scale === 'annual' ? 'kg' : 'g';
      return 'L';
    }
    function fmtUnit(v, unit) {
      if (unit === 'g') return sig(v) + ' g CO₂e';
      if (unit === 'kg') return sig(v / 1000) + ' kg CO₂e';
      if (unit === 't') return sig(v / 1e6) + ' t CO₂e';
      if (unit === 'mL') return sig(v * 1000) + ' mL';
      if (unit === 'L') return sig(v) + ' L';
      return sig(v);
    }
    function fmtEnergy(wh) { return wh >= 1000 ? fmtNum(wh / 1000) + ' kWh' : fmtNum(wh) + ' Wh'; }

    // ---- Math (base units: carbon grams, water liters) ----
    function perPromptTriple(model, size, metric) {
      const result = calculations.calculateTextPrompt(model, size, getLoc().grid);
      const values = metric === 'carbon' ? result.totalCarbonG : result.waterL;
      // The baseline UI consumes central, lower, upper while the shared contract stores lower, central, upper.
      return [values.central, values.lower, values.upper];
    }
    function totalPrompts() { let n = 0; for (const r of state.rows) n += r.count || 0; return n; }
    function aiPeriodTriple(metric) {
      const rows = state.rows.map((row) => calculations.calculateTextRow({
        count: row.count || 0,
        model: getModel(row.model),
        sizeId: row.size,
        gridFactor: getLoc().grid,
        periodId: state.period,
        sourceIds: ['baseline-ecologits-v0.10-text-inference', 'baseline-regional-grid-2024'],
      }));
      const result = calculations.aggregateTextRows(rows);
      const values = metric === 'carbon' ? result.totalCarbonG : result.waterL;
      return [values.central, values.lower, values.upper];
    }
    const aiPeriod = (metric) => aiPeriodTriple(metric)[0];
    function aiPeriodEnergy() { let t = 0; for (const r of state.rows) if (r.count) t += r.count * getModel(r.model).sizes[r.size].wh; return t; }
    function reportingPeriod() {
      return calculations.createReportingPeriod(state.period, { workdays: state.customDays, label: 'Custom period' });
    }
    function periodLabel() { return reportingPeriod().label.toLowerCase(); }
    function dailyFootprint(metric) {
      const loc = getLoc();
      const home = HOMES.find((x) => x.id === state.home) || HOMES[1];
      const drive = DRIVING.find((x) => x.id === state.drive) || DRIVING[2];
      const diet = DIETS.find((x) => x.id === state.diet);
      const fly = FLYING.find((x) => x.id === state.fly);
      if (metric === 'carbon') return ((loc.c + home.c + drive.c + diet.c + fly.c) * 1000) / DAYS;
      return ((loc.w + home.w + drive.w + diet.w + fly.w) * GAL_TO_L) / DAYS;
    }
    function itemBase(item, metric) { return metric === 'carbon' ? item.c * 1000 : item.w * GAL_TO_L; }

    function isCodeRow(row) {
      if (row.size !== 'agent') return false;
      const o = SIZE_LABEL_OVERRIDES[row.model];
      return !(o && o.agent);
    }
    function linesForSize(s) { return Math.round((s.w / TOKENS_PER_WORD) * CODE_FRACTION / TOKENS_PER_LINE); }
    function periodWords() {
      let n = 0;
      for (const r of state.rows) if (r.count && !isCodeRow(r)) n += r.count * (SIZES.find((s) => s.id === r.size) || { w: 0 }).w;
      return n;
    }
    function periodCodeLines() {
      let n = 0;
      for (const r of state.rows) if (r.count && isCodeRow(r)) { const s = SIZES.find((x) => x.id === r.size); if (s) n += r.count * linesForSize(s); }
      return n;
    }
    function fmtWords(n) { return n >= 1e6 ? fmtNum(n / 1e6) + ' million' : Math.round(n).toLocaleString('en-US'); }
    function fmtReadingTime(minutes) {
      if (minutes < 1) return 'under a minute';
      if (minutes < 90) { const m = Math.round(minutes); return m + ' minute' + (m === 1 ? '' : 's'); }
      const hours = minutes / 60;
      if (hours < 48) return fmtNum(hours) + ' hours';
      const days = hours / 24;
      if (days < 14) return fmtNum(days) + ' days';
      const weeks = days / 7;
      if (weeks < 9) return fmtNum(weeks) + ' weeks';
      const months = days / 30.44;
      if (months < 18) return fmtNum(months) + ' months';
      return fmtNum(days / 365) + ' years';
    }

    // ---- DOM helpers ----
    function el(tag, cls, html) { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
    function option(value, text, selected) { const o = document.createElement('option'); o.value = value; o.textContent = text; if (selected) o.selected = true; return o; }

    // ---- URL state ----
    function buildShareURL() {
      const r = state.rows.map((row) => MODELS.findIndex((m) => m.id === row.model) + '-' + SIZES.findIndex((s) => s.id === row.size) + '-' + (row.count || 0)).join('.');
      const p = new URLSearchParams();
      p.set('k', state.metric); p.set('l', state.loc); p.set('h', state.home); p.set('v', state.drive); p.set('d', state.diet); p.set('f', state.fly); p.set('p', state.period); p.set('w', state.customDays); p.set('r', r);
      return location.origin + location.pathname + '#' + p.toString();
    }
    function readURL() {
      try {
        const h = (location.hash || '').replace(/^#/, '');
        if (!h) return;
        const p = new URLSearchParams(h);
        const k = p.get('k'); if (k === 'carbon' || k === 'water') state.metric = k;
        const l = p.get('l'); if (l && LOCATIONS.some((x) => x.id === l)) state.loc = l;
        const hh = p.get('h'); if (hh && HOMES.some((x) => x.id === hh)) state.home = hh;
        const vv = p.get('v'); if (vv && DRIVING.some((x) => x.id === vv)) state.drive = vv;
        const d = p.get('d'); if (d && DIETS.some((x) => x.id === d)) state.diet = d;
        const f = p.get('f'); if (f && FLYING.some((x) => x.id === f)) state.fly = f;
        const period = p.get('p'); if (['single-project', 'workweek', 'custom'].includes(period)) state.period = period;
        const customDays = Number(p.get('w')); if (Number.isFinite(customDays) && customDays >= 0) state.customDays = customDays;
        const r = p.get('r');
        if (r) {
          const rows = [];
          for (const part of r.split('.')) {
            const a = part.split('-').map(Number);
            if (MODELS[a[0]] && SIZES[a[1]] && a[2] >= 0) rows.push({ uid: uidSeq++, model: MODELS[a[0]].id, size: SIZES[a[1]].id, count: Math.min(100000, a[2]) });
          }
          if (rows.length) state.rows = rows;
        }
      } catch (e) { /* ignore */ }
    }
    function setDefaultRows() { state.rows = DEFAULT_ROWS.map((r) => ({ uid: uidSeq++, model: r[0], size: r[1], count: r[2] })); }
    function renderPeriodControls() {
      const period = root.querySelector('#aipf-period');
      const customDays = root.querySelector('#aipf-custom-days');
      const customWrap = root.querySelector('#aipf-custom-days-wrap');
      period.value = state.period;
      customDays.value = state.customDays;
      customWrap.hidden = state.period !== 'custom';
      root.querySelector('#aipf-period-summary').textContent = 'for ' + periodLabel();
    }

    // ---- Usage rows ----
    function modelSelect(row) {
      const sel = el('select', 'aipf-rsel');
      sel.setAttribute('aria-label', 'Model');
      const groups = [];
      for (const m of MODELS) { let g = groups.find((x) => x.name === m.group); if (!g) { g = { name: m.group, items: [] }; groups.push(g); } g.items.push(m); }
      for (const g of groups) { const og = document.createElement('optgroup'); og.label = g.name; for (const m of g.items) og.appendChild(option(m.id, m.name, m.id === row.model)); sel.appendChild(og); }
      sel.addEventListener('change', () => { row.model = sel.value; renderRows(); updateOutputs(); });
      return sel;
    }
    function sizeSelect(row) {
      const sel = el('select', 'aipf-rsel');
      sel.setAttribute('aria-label', 'Typical output length');
      for (const s of SIZES) sel.appendChild(option(s.id, sizeLabel(row.model, s) + ' (' + s.words + ')', s.id === row.size));
      sel.addEventListener('change', () => { row.size = sel.value; updateOutputs(); });
      return sel;
    }
    function stepper(row) {
      const ctrl = el('div', 'aipf-stepper');
      const minus = el('button', 'aipf-step', '−'); minus.type = 'button'; minus.setAttribute('aria-label', 'Fewer');
      const input = document.createElement('input');
      input.type = 'text'; input.inputMode = 'numeric'; input.className = 'aipf-count'; input.value = String(row.count || 0); input.setAttribute('aria-label', 'Prompts in reporting period');
      const plus = el('button', 'aipf-step', '+'); plus.type = 'button'; plus.setAttribute('aria-label', 'More');
      minus.addEventListener('click', () => bump(row, input, -1));
      plus.addEventListener('click', () => bump(row, input, 1));
      input.addEventListener('input', () => { row.count = Math.max(0, Math.min(100000, parseInt(input.value.replace(/[^0-9]/g, ''), 10) || 0)); updateOutputs(); });
      input.addEventListener('blur', () => { input.value = String(row.count || 0); });
      ctrl.appendChild(minus); ctrl.appendChild(input); ctrl.appendChild(plus);
      return ctrl;
    }
    function bump(row, input, dir) {
      const cur = row.count || 0;
      let step = 1; if (cur >= 50) step = 10; else if (cur >= 20) step = 5;
      let next = cur + dir * step; if (dir < 0 && cur > 0 && cur <= step) next = 0;
      row.count = Math.max(0, Math.min(100000, next)); input.value = String(row.count); updateOutputs();
    }
    function renderRows() {
      const wrap = root.querySelector('#aipf-rows');
      wrap.innerHTML = '';
      for (const row of state.rows) {
        const wrapEl = el('div', 'aipf-rowwrap'); wrapEl.dataset.uid = String(row.uid);
        const r = el('div', 'aipf-row');
        r.appendChild(modelSelect(row));
        r.appendChild(sizeSelect(row));
        r.appendChild(stepper(row));
        const rm = el('button', 'aipf-rowdel', '×'); rm.type = 'button'; rm.setAttribute('aria-label', 'Remove this row');
        rm.addEventListener('click', () => { state.rows = state.rows.filter((x) => x.uid !== row.uid); renderRows(); updateOutputs(); });
        r.appendChild(rm);
        wrapEl.appendChild(r);
        wrapEl.appendChild(el('div', 'aipf-row-meta'));
        wrap.appendChild(wrapEl);
      }
      if (!state.rows.length) wrap.appendChild(el('p', 'aipf-empty', 'No usage yet. Add a kind of use to begin.'));
    }
    function updateRowMeta() {
      const total = aiPeriod(state.metric);
      for (const row of state.rows) {
        const wrapEl = root.querySelector('.aipf-rowwrap[data-uid="' + row.uid + '"] .aipf-row-meta');
        if (!wrapEl) continue;
        const per = perPromptTriple(getModel(row.model), row.size, state.metric)[0];
        const contr = (row.count || 0) * per;
        const share = total > 0 ? (contr / total) * 100 : 0;
        const shareStr = share >= 10 ? Math.round(share) : share.toFixed(1);
        wrapEl.textContent = fmtMetric(per) + ' each, ' + fmtMetric(contr) + ' for this period, ' + shareStr + '% of your AI ' + metricWord();
      }
    }
    function renderLifeSelects() {
      function fill(id, list, cur) { const sel = root.querySelector(id); sel.innerHTML = ''; for (const x of list) sel.appendChild(option(x.id, x.label, x.id === cur)); }
      fill('#aipf-loc', LOCATIONS, state.loc);
      fill('#aipf-home', HOMES, state.home);
      fill('#aipf-drive', DRIVING, state.drive);
      fill('#aipf-diet', DIETS, state.diet);
      fill('#aipf-fly', FLYING, state.fly);
    }

    // ---- Feature: usage presets ----
    function renderPresets() {
      const wrap = root.querySelector('#aipf-presets');
      wrap.innerHTML = '';
      for (const p of PRESETS) {
        const b = el('button', 'aipf-preset-btn', esc(p.label));
        b.type = 'button';
        b.addEventListener('click', () => {
          state.rows = p.rows.map((r) => ({ uid: uidSeq++, model: r[0], size: r[1], count: r[2] }));
          renderRows(); updateOutputs();
        });
        wrap.appendChild(b);
      }
    }

    // ---- Feature: model comparison table ----
    function renderCmpSizeSelect() {
      const sel = root.querySelector('#aipf-cmp-size');
      sel.innerHTML = '';
      for (const s of SIZES) sel.appendChild(option(s.id, s.label, s.id === state.cmpSize));
    }
    function renderModelTable() {
      const size = state.cmpSize;
      const usedIds = new Set(state.rows.filter((r) => r.count > 0).map((r) => r.model));
      const list = MODELS.map((m) => ({
        id: m.id,
        name: m.name,
        c: perPromptTriple(m, size, 'carbon')[0],
        w: perPromptTriple(m, size, 'water')[0],
      }));
      list.sort((a, b) => (state.metric === 'water' ? a.w - b.w : a.c - b.c));
      const body = root.querySelector('#aipf-cmp-body');
      body.innerHTML = '';
      for (const item of list) {
        const tr = document.createElement('tr');
        if (usedIds.has(item.id)) tr.className = 'aipf-cmp-row--used';
        const nameHtml = esc(item.name) + (usedIds.has(item.id) ? ' <span class="aipf-cmp-used-tag">in use</span>' : '');
        tr.innerHTML = '<td>' + nameHtml + '</td><td class="n">' + fmtCarbon(item.c) + '</td><td class="n">' + fmtWater(item.w) + '</td>';
        body.appendChild(tr);
      }
    }

    // ---- Outputs ----
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
    function renderGridNote() {
      const box = root.querySelector('#aipf-grid-note');
      box.style.display = '';
      if (state.metric === 'carbon') box.textContent = 'AI carbon uses the ' + getLoc().label + ' grid for electricity, plus EcoLogits’ embodied hardware emissions.';
      else box.textContent = 'Water is blue water only: freshwater drawn from rivers, lakes, and aquifers. Green rainwater (most of food’s footprint) is excluded.';
    }

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
    function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
    function renderBars(targetId, focalLabel, focalVal, items, unit) {
      const rows = [{ label: focalLabel, v: focalVal, focal: true }];
      for (const it of items) {
        const v = itemBase(it, state.metric);
        if (v <= 0) continue; // skip items with no impact in this metric (keeps the water view clean)
        rows.push({ label: it.label, v: v, dir: it.dir });
      }
      rows.sort((a, b) => b.v - a.v);
      const max = Math.max.apply(null, rows.map((r) => r.v).concat([1e-9]));
      const box = root.querySelector(targetId);
      box.innerHTML = '';
      for (const r of rows) {
        const row = el('div', 'aipf-bar-row' + (r.focal ? ' is-focal' : ''));
        let labelHtml = esc(r.label);
        if (r.dir === 'save') labelHtml += ' <span class="aipf-tag aipf-tag--save">saved</span>';
        else if (r.dir === 'add') labelHtml += ' <span class="aipf-tag aipf-tag--add">added</span>';
        row.appendChild(el('div', 'aipf-bar-label', labelHtml));
        const track = el('div', 'aipf-bar-track');
        const fill = el('div', 'aipf-bar-fill'); fill.style.width = Math.max(0.4, (r.v / max) * 100).toFixed(2) + '%';
        track.appendChild(fill);
        row.appendChild(track);
        row.appendChild(el('div', 'aipf-bar-val', fmtUnit(r.v, unit)));
        box.appendChild(row);
      }
    }
    function renderPeriodContext() {
      const ai = aiPeriod(state.metric);
      const unit = chartUnit(state.metric, 'period');
      root.querySelector('#aipf-daily-sub').innerHTML = 'Your ' + esc(periodLabel()) + ' total (highlighted below) is ' + fmtUnit(ai, unit) + '.';
      const items = state.metric === 'water' ? DAILY_WATER_ITEMS : DAILY_ITEMS;
      renderBars('#aipf-daily-bars', 'Your AI use for this period', ai, items, unit);
    }

    function updateOutputs() {
      renderPeriodControls(); renderRunning(); updateRowMeta(); renderHeadline(); renderGridNote(); renderWords(); renderPeriodContext(); renderModelTable();
      const carbon = aiPeriodTriple('carbon');
      const water = aiPeriodTriple('water');
      document.dispatchEvent(new CustomEvent('footprint:text-update', { detail: {
        carbon: calculations.scenario(carbon[1], carbon[0], carbon[2]),
        water: calculations.scenario(water[1], water[0], water[2]),
        periodId: state.period,
        periodLabel: periodLabel(),
        customDays: state.customDays,
        gridFactor: getLoc().grid,
        regionLabel: getLoc().label,
      } }));
    }
    // ---- Cited report ----
    function escXml(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
    function reportBarsSVG(rows, fmt) {
      fmt = fmt || fmtCarbon;
      rows = rows.slice().sort((a, b) => b.v - a.v);
      const W = 700, padL = 250, padR = 90, rowH = 26, top = 8;
      const max = Math.max.apply(null, rows.map((r) => r.v).concat([1e-9]));
      const barMax = W - padL - padR;
      const H = top * 2 + rows.length * rowH;
      let s = '<svg viewBox="0 0 ' + W + ' ' + H + '" width="100%" style="max-width:' + W + 'px" role="img">';
      rows.forEach((r, i) => {
        const y = top + i * rowH, cy = y + rowH / 2;
        const bw = Math.max(2, (r.v / max) * barMax);
        const col = r.focal ? '#1f5a7a' : '#bcbfb2';
        s += '<text x="' + (padL - 8) + '" y="' + (cy + 4) + '" text-anchor="end" font-size="12.5" fill="#1C1E1B">' + escXml(r.label) + '</text>';
        s += '<rect x="' + padL + '" y="' + (y + 5) + '" width="' + bw.toFixed(1) + '" height="' + (rowH - 12) + '" fill="' + col + '"/>';
        s += '<text x="' + (padL + bw + 6).toFixed(1) + '" y="' + (cy + 4) + '" font-size="11.5" fill="#555">' + escXml(fmt(r.v)) + '</text>';
      });
      return s + '</svg>';
    }
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
        (globalThis.FootprintFeatureReport ? globalThis.FootprintFeatureReport() : '<p class="muted">Expanded activity rows were not available when this report was generated.</p>') +
        '<h2>References</h2><ol class="refs">' + refsHtml + '</ol>' +
        '</body></html>';
    }
    function generateReport() {
      try {
        const blob = new Blob([reportHTML()], { type: 'text/html' });
        window.open(URL.createObjectURL(blob), '_blank');
      } catch (e) { /* ignore */ }
    }

    function renderMetricToggle() {
      root.querySelectorAll('.aipf-metric').forEach((b) => { const on = b.dataset.metric === state.metric; b.classList.toggle('is-active', on); b.setAttribute('aria-pressed', on ? 'true' : 'false'); });
    }
    function bindEvents() {
      root.querySelector('#aipf-addrow').addEventListener('click', () => { state.rows.push({ uid: uidSeq++, model: 'gpt-5.5', size: 'chat', count: 1 }); renderRows(); updateOutputs(); });
      root.querySelector('#aipf-reset').addEventListener('click', () => { state.period = 'workweek'; state.customDays = 5; setDefaultRows(); renderRows(); document.dispatchEvent(new CustomEvent('footprint:reset')); updateOutputs(); });
      root.querySelector('#aipf-share').addEventListener('click', (e) => {
        const btn = e.currentTarget;
        const done = () => { btn.textContent = 'Text-use link copied'; setTimeout(() => { btn.textContent = 'Copy text-use link'; }, 1800); };
        try { if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(buildShareURL()).then(done, done); else done(); } catch (err) { done(); }
      });
      const rb = root.querySelector('#aipf-report'); if (rb) rb.addEventListener('click', generateReport);
      const eb = root.querySelector('#aipf-embed-copy');
      if (eb) eb.addEventListener('click', () => {
        const code = root.querySelector('#aipf-embed-code');
        const done = () => { eb.textContent = 'Embed code copied'; setTimeout(() => { eb.textContent = 'Copy the embed code'; }, 1800); };
        try { if (code && navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(code.textContent).then(done, done); else done(); } catch (err) { done(); }
      });
      root.querySelector('#aipf-period').addEventListener('change', (event) => {
        state.period = event.target.value;
        updateOutputs();
      });
      root.querySelector('#aipf-custom-days').addEventListener('input', (event) => {
        const value = Number(event.target.value);
        const valid = Number.isFinite(value) && value >= 0;
        event.target.setCustomValidity(valid ? '' : 'Enter zero or a positive number of workdays.');
        if (valid) { state.customDays = value; updateOutputs(); }
      });      root.querySelector('#aipf-loc').addEventListener('change', (e) => {
        state.loc = e.target.value;
        const d = COUNTRY_DIET[state.loc];
        if (d) { state.diet = d; const ds = root.querySelector('#aipf-diet'); if (ds) ds.value = d; }
        updateOutputs();
      });
      root.querySelector('#aipf-home').addEventListener('change', (e) => { state.home = e.target.value; updateOutputs(); });
      root.querySelector('#aipf-drive').addEventListener('change', (e) => { state.drive = e.target.value; updateOutputs(); });
      root.querySelector('#aipf-diet').addEventListener('change', (e) => { state.diet = e.target.value; updateOutputs(); });
      root.querySelector('#aipf-fly').addEventListener('change', (e) => { state.fly = e.target.value; updateOutputs(); });
      root.querySelectorAll('.aipf-metric').forEach((b) => { b.addEventListener('click', () => { state.metric = b.dataset.metric; renderMetricToggle(); updateOutputs(); }); });
      root.querySelector('#aipf-cmp-size').addEventListener('change', (e) => { state.cmpSize = e.target.value; renderModelTable(); });
    }
    function init() {
      root = document.getElementById('aipf');
      if (!root || root.dataset.ready === '1') return;
      root.dataset.ready = '1';
      setDefaultRows(); readURL();
      renderRows(); renderLifeSelects(); renderMetricToggle(); renderPresets(); renderCmpSizeSelect(); bindEvents(); updateOutputs();
    }
    globalThis.FootprintAppTest = Object.freeze({ buildShareURL, reportHTML });
    document.addEventListener('astro:page-load', init);
    if (document.readyState !== 'loading') init();
    else document.addEventListener('DOMContentLoaded', init);
  })();
