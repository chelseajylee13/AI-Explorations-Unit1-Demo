(async function () {
  'use strict';

  const tests = [];
  const calculations = globalThis.FootprintCalculations;
  const sourceData = globalThis.FootprintSourceData;

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

  test('integrated output and cited report do not restore automatic annualization', function () {
    const frame = document.getElementById('calculator');
    const visibleOutput = frame.contentDocument.getElementById('aipf-running').textContent;
    assert(visibleOutput.includes('Counts are not annualized.'), 'Expected visible non-annualization note.');
    assert(!/over a year|per year|prompts\/day/i.test(visibleOutput), 'Visible output restored daily or annual wording.');
    const report = frame.contentWindow.FootprintAppTest.reportHTML();
    assert(report.includes('not automatically annualized'), 'Expected report period note.');
    assert(!/prompts\/day|per day|per year|\*\s*365/i.test(report), 'Report restored daily or annual wording.');
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
