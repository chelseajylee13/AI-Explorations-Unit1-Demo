(async function () {
  'use strict';

  const tests = [];
  const calculations = globalThis.FootprintCalculations;
  const sourceData = globalThis.FootprintSourceData;
  const featureData = globalThis.FootprintFeatureData;

  function test(name, run) { tests.push({ name, run }); }
  function assert(condition, message) { if (!condition) throw new Error(message); }
  function close(actual, expected, tolerance, label) {
    assert(Math.abs(actual - expected) <= tolerance, label + ': expected ' + expected + ', received ' + actual);
  }
  function sameScenario(actual, expected, label) {
    close(actual.lower, expected.lower, 1e-12, label + ' lower');
    close(actual.central, expected.central, 1e-12, label + ' central');
    close(actual.upper, expected.upper, 1e-12, label + ' upper');
  }
  function model(id) { return sourceData.MODELS.find((item) => item.id === id); }
  async function waitForCalculator(frame) {
    const deadline = Date.now() + 2000;
    while (Date.now() < deadline) {
      const document = frame.contentDocument;
      const root = document && document.getElementById('aipf');
      if (root && root.dataset.ready === '1') return document;
      await new Promise((resolve) => setTimeout(resolve, 25));
    }
    throw new Error('Calculator iframe did not reach its ready state.');
  }

  test('source data exposes the recovered model table', function () {
    assert(sourceData.MODELS.length === 9, 'Expected nine baseline models.');
    assert(model('gpt-5.5'), 'Expected GPT-5.5 source row.');
    assert(sourceData.SOURCE_RECORDS.length === 2, 'Expected traceable baseline source records.');
  });

  test('GPT-5.5 chat carbon reproduces the recovered US-grid calculation', function () {
    const result = calculations.calculateTextPrompt(model('gpt-5.5'), 'chat', 380);
    sameScenario(result.totalCarbonG, { lower: 0.731046, central: 1.080038, upper: 1.428992 }, 'carbon');
  });

  test('GPT-5.5 chat water converts milliliters to liters', function () {
    const result = calculations.calculateTextPrompt(model('gpt-5.5'), 'chat', 380);
    sameScenario(result.waterL, { lower: 0.0062811, central: 0.0095929, upper: 0.0129047 }, 'water');
  });

  test('row quantities scale all components without intermediate rounding', function () {
    const row = calculations.calculateTextRow({ count: 15, model: model('gpt-5.5'), sizeId: 'chat', gridFactor: 380, periodId: 'workweek' });
    close(row.totalCarbonG.central, 16.20057, 1e-12, 'row carbon');
    close(row.electricityKwh.central, 0.0399015, 1e-12, 'row electricity');
    close(row.waterL.central, 0.1438935, 1e-12, 'row water');
  });

  test('scenario aggregation matches the specification fixture', function () {
    const total = calculations.sumScenarios([
      calculations.scenario(10, 20, 40),
      calculations.scenario(5, 8, 11),
    ]);
    sameScenario(total, { lower: 15, central: 28, upper: 51 }, 'aggregate');
  });

  test('a fixed benchmark contributes equally to all scenarios', function () {
    const total = calculations.sumScenarios([
      calculations.scenario(15, 28, 51),
      calculations.scenario(7, 7, 7),
    ]);
    sameScenario(total, { lower: 22, central: 35, upper: 58 }, 'fixed benchmark');
  });

  test('zero activity remains a distinct valid zero result', function () {
    const row = calculations.calculateTextRow({ count: 0, model: model('gpt-5.5'), sizeId: 'chat', gridFactor: 380, periodId: 'workweek' });
    assert(row.resultState === 'zero', 'Expected zero result state.');
    sameScenario(row.totalCarbonG, { lower: 0, central: 0, upper: 0 }, 'zero carbon');
  });

  test('invalid negative and fractional prompt counts are rejected', function () {
    for (const count of [-1, 1.5, Number.NaN]) {
      let rejected = false;
      try { calculations.calculateTextRow({ count, model: model('gpt-5.5'), sizeId: 'chat', gridFactor: 380, periodId: 'workweek' }); }
      catch (error) { rejected = error instanceof RangeError; }
      assert(rejected, 'Expected count ' + count + ' to be rejected.');
    }
  });

  test('changing only the reporting-period label does not rescale activity', function () {
    const base = { count: 4, model: model('gemini-3.5-flash'), sizeId: 'summary', gridFactor: 380 };
    const project = calculations.calculateTextRow(Object.assign({ periodId: 'single-project' }, base));
    const week = calculations.calculateTextRow(Object.assign({ periodId: 'workweek' }, base));
    const custom = calculations.calculateTextRow(Object.assign({ periodId: 'custom' }, base));
    sameScenario(project.totalCarbonG, week.totalCarbonG, 'project versus week');
    sameScenario(week.totalCarbonG, custom.totalCarbonG, 'week versus custom');
  });

  test('reporting periods validate custom workdays', function () {
    const custom = calculations.createReportingPeriod('custom', { label: 'Sprint', workdays: 7.5 });
    assert(custom.label === 'Sprint' && custom.workdays === 7.5, 'Expected custom reporting-period values.');
    let rejected = false;
    try { calculations.createReportingPeriod('custom', { workdays: -1 }); } catch (error) { rejected = error instanceof RangeError; }
    assert(rejected, 'Expected negative custom workdays to be rejected.');
  });

  test('project workload fixture produces 90 calls and 90,000 output tokens', function () {
    const result = calculations.calculateWorkload({ mode: 'estimated', model: featureData.LLM_MODELS[0], periodId: 'single-project', runsPerDay: 2, callsPerRun: 3, retriesPerCall: 0.5, outputTokensPerCall: 1000, workdaysPerWeek: 5, projectWeeks: 2 }, featureData);
    close(result.requestCount, 90, 1e-12, 'effective calls');
    close(result.totalOutputTokens, 90000, 1e-12, 'output tokens');
    assert(result.totalCarbonG.central > 0 && result.waterL.central > 0, 'Expected supported impacts.');
  });

  test('measured workload rejects tokens without requests and records per-request arithmetic', function () {
    const result = calculations.calculateWorkload({ mode: 'measured', model: featureData.LLM_MODELS[0], requestCount: 10, totalOutputTokens: 5000 }, featureData);
    close(result.averageOutputTokens, 500, 1e-12, 'average output tokens');
    let rejected = false;
    try { calculations.calculateWorkload({ mode: 'measured', model: featureData.LLM_MODELS[0], requestCount: 0, totalOutputTokens: 1 }, featureData); } catch (error) { rejected = error instanceof RangeError; }
    assert(rejected, 'Expected tokens without requests to be rejected.');
  });

  test('video fixture ports EcoLogits latency and returns separated impacts', function () {
    const model = featureData.VIDEO_MODELS.find((item) => item.id === 'tencent/hunyuanvideo');
    const result = calculations.calculateVideo({ model, resolution: [1280, 720], duration: 5, withAudio: false, count: 1 }, featureData);
    assert(result.electricityKwh.lower > 0 && result.embodiedCarbonG.central > 0 && result.waterL.upper > 0, 'Expected complete video result.');
    assert(result.totalCarbonG.lower <= result.totalCarbonG.central && result.totalCarbonG.central <= result.totalCarbonG.upper, 'Expected ordered video scenarios.');
  });

  test('unknown video uses a compatible supported-model envelope', function () {
    const result = calculations.calculateVideo({ model: null, resolution: [1280, 720], duration: 5, withAudio: false, count: 2 }, featureData);
    assert(result.unknownModel && result.totalCarbonG.lower > 0, 'Expected a compatible unknown-model scenario.');
    assert(result.totalCarbonG.lower <= result.totalCarbonG.central && result.totalCarbonG.central <= result.totalCarbonG.upper, 'Expected ordered unknown-model scenarios.');
  });

  test('every expanded source record carries audit metadata', function () {
    const required = ['id','unit','boundary','title','link','publicationDate','version','geography','scenarioRole','derivation','evidence','limitation'];
    assert(featureData.SOURCE_RECORDS.length >= 7, 'Expected all expanded coefficient groups.');
    featureData.SOURCE_RECORDS.forEach(function (record) { required.forEach(function (key) { assert(Object.prototype.hasOwnProperty.call(record, key) && record[key] !== '', record.id + ' lacks ' + key); }); });
  });

  test('image generation remains explicitly not estimated', function () {
    const result = calculations.calculateImageDisclosure({ count: 4 });
    assert(result.carbon.state === 'not-estimated' && result.water.state === 'not-estimated', 'Expected missing image impacts.');
  });

  test('meeting fixtures reproduce mixed and detailed results', function () {
    const mixed = calculations.calculateMeeting({ mode: 'mixed', count: 2, durationMinutes: 90, attendees: 10 });
    sameScenario(mixed.totalCarbonG, { lower: 1650, central: 2700, upper: 8850 }, 'mixed meeting');
    const detailed = calculations.calculateMeeting({ mode: 'detailed', count: 1, durationMinutes: 60, attendees: 10, laptops: 4, desktops: 2, roomAttendees: 4, roomSystems: 1 });
    sameScenario(detailed.totalCarbonG, { lower: 695, central: 695, upper: 695 }, 'detailed meeting');
  });

  test('custom local power fixture preserves unrounded arithmetic', function () {
    const result = calculations.calculateLocalPower(5, 200, 380);
    sameScenario(result.electricityKwh, { lower: 1, central: 1, upper: 1 }, 'local electricity');
    sameScenario(result.operationalCarbonG, { lower: 380, central: 380, upper: 380 }, 'local carbon');
  });

  test('two-hour laptop streaming uses 44 Wh locally', function () {
    const result = calculations.calculateDigitalActivity({ type: 'streaming', hours: 2, watts: 22, gridFactor: 380, peripheral: 'none', displayIncluded: true }, featureData);
    close(result.electricityKwh.central, 0.044, 1e-12, 'laptop electricity');
  });

  test('cloud gaming adds remote infrastructure exactly once', function () {
    const local = calculations.calculateDigitalActivity({ type: 'gaming', gamingMode: 'local', hours: 2, watts: 100, gridFactor: 380, displayIncluded: true }, featureData);
    const cloud = calculations.calculateDigitalActivity({ type: 'gaming', gamingMode: 'cloud', cloudClass: 'pc', hours: 2, watts: 100, gridFactor: 380, displayIncluded: true }, featureData);
    const expectedRemote = 2 * (340 + 180) / 1000 * 710;
    close(cloud.totalCarbonG.central - local.totalCarbonG.central, expectedRemote, 1e-12, 'cloud infrastructure');
  });

  test('invalid detailed endpoint totals are rejected', function () {
    let rejected = false;
    try { calculations.calculateMeeting({ mode: 'detailed', count: 1, durationMinutes: 60, attendees: 5, laptops: 1, desktops: 1, roomAttendees: 1, roomSystems: 1 }); } catch (error) { rejected = /must equal total attendees/.test(error.message); }
    assert(rejected, 'Expected a field-specific endpoint-total error.');
  });

  test('AI share and stable sensitivity ranking match specification fixtures', function () {
    const share = calculations.calculateAiShare(calculations.scenario(20, 30, 50), calculations.scenario(40, 60, 125));
    close(share.lower, 50, 1e-12, 'lower share'); close(share.central, 50, 1e-12, 'central share'); close(share.upper, 40, 1e-12, 'upper share');
    assert(calculations.calculateAiShare(calculations.zeroScenario(), calculations.zeroScenario()).central === null, 'Zero denominator must be not applicable.');
    const ranked = calculations.rankSensitivity(100, [{ id: 'a', label: 'A', lowerTotal: 80, upperTotal: 130 }, { id: 'b', label: 'B', lowerTotal: 95, upperTotal: 110 }]);
    assert(ranked[0].id === 'a' && ranked[0].magnitude === 30 && ranked[0].percent === 30, 'Expected A to rank first.');
  });

  test('URL state restores a custom period and changing its label preserves counts', async function () {
    const frame = document.getElementById('calculator');
    const app = await waitForCalculator(frame);
    assert(app.getElementById('aipf-period').value === 'custom', 'Expected custom period restored from URL.');
    assert(app.getElementById('aipf-custom-days').value === '7', 'Expected custom workdays restored from URL.');
    assert(app.querySelector('.aipf-count').value === '2', 'Expected prompt count restored from URL.');
    const period = app.getElementById('aipf-period');
    period.value = 'single-project';
    period.dispatchEvent(new Event('change', { bubbles: true }));
    assert(app.querySelector('.aipf-count').value === '2', 'Changing period must not rescale prompt count.');
    assert(app.getElementById('aipf-custom-days-wrap').hidden, 'Custom-workdays field should hide outside custom mode.');
  });

  test('feature workspace supports add, edit, scenario switch, aggregation, and remove', async function () {
    const frame = document.getElementById('calculator');
    const app = await waitForCalculator(frame);
    const win = frame.contentWindow;
    for (const type of ['media', 'workload', 'meeting', 'digital']) app.querySelector('[data-add="' + type + '"]').click();
    assert(app.querySelectorAll('.impact-row').length === 4, 'Expected one row in each expanded feature.');
    const before = win.FootprintFeatureTest.collect().combined.central;
    assert(before > 0, 'Expected expanded rows to contribute to the combined result.');
    const hours = app.querySelector('#digital-rows [data-field="hours"]');
    hours.value = '4'; hours.dispatchEvent(new Event('change', { bubbles: true }));
    const afterEdit = win.FootprintFeatureTest.collect().combined.central;
    assert(afterEdit > before, 'Editing activity hours should increase the combined result.');
    app.querySelector('[data-scenario="upper"]').click();
    assert(win.FootprintFeatureTest.state.scenario === 'upper', 'Expected synchronized upper scenario.');
    const digitalBeforeRemove = win.FootprintFeatureTest.collect().digitalCarbon.upper;
    app.querySelector('#digital-rows [data-remove]').click();
    assert(win.FootprintFeatureTest.collect().digitalCarbon.upper < digitalBeforeRemove, 'Removing a row should remove its contribution exactly once.');
    assert(/Partial water/.test(app.getElementById('impact-summary').textContent), 'Expected visible partial-water coverage.');
    const sensitivity = app.querySelector('[data-sensitivity="id"]');
    if (sensitivity && sensitivity.options.length > 1) { sensitivity.selectedIndex = 1; sensitivity.dispatchEvent(new Event('change', { bubbles: true })); assert(/Recalculated carbon/.test(app.getElementById('impact-sensitivity').textContent), 'Expected one-at-a-time recalculation.'); }
  });

  test('integrated output and cited report do not restore automatic annualization', function () {
    const frame = document.getElementById('calculator');
    const visibleOutput = frame.contentDocument.getElementById('aipf-running').textContent;
    assert(visibleOutput.includes('Counts are not annualized.'), 'Expected visible non-annualization note.');
    assert(!/over a year|per year|prompts\/day/i.test(visibleOutput), 'Visible output restored daily or annual wording.');
    const report = frame.contentWindow.FootprintAppTest.reportHTML();
    assert(report.includes('not automatically annualized'), 'Expected report period note.');
    assert(report.includes('Expanded activity totals') && report.includes('omitted components are not treated as zero'), 'Expected expanded totals and coverage in the cited report.');
    assert(!/prompts\/day|per day|per year|\*\s*365/i.test(report), 'Report restored daily or annual wording.');
  });

  test('reset clears expanded activity rows and returns the scenario to a stable empty state', function () {
    const frame = document.getElementById('calculator');
    const app = frame.contentDocument;
    app.getElementById('aipf-reset').click();
    assert(app.querySelectorAll('.impact-row').length === 0, 'Expected expanded rows to reset.');
    assert(frame.contentWindow.FootprintFeatureTest.collect().digitalCarbon.central === 0, 'Expected no digital subtotal after reset.');
  });

  const results = document.getElementById('results');
  let passed = 0;
  for (const item of tests) {
    const row = document.createElement('li');
    try {
      await item.run();
      passed += 1;
      row.className = 'passed';
      row.textContent = 'PASS — ' + item.name;
    } catch (error) {
      row.className = 'failed';
      row.textContent = 'FAIL — ' + item.name + ': ' + error.message;
    }
    results.appendChild(row);
  }

  const summary = document.getElementById('summary');
  const allPassed = passed === tests.length;
  summary.className = allPassed ? 'passed' : 'failed';
  summary.textContent = passed + ' / ' + tests.length + ' tests passed.';
  document.documentElement.dataset.testStatus = allPassed ? 'passed' : 'failed';
})();
