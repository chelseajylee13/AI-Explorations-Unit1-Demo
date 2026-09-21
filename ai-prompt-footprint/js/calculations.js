(function (global) {
  'use strict';

  const SCENARIO_KEYS = Object.freeze(['lower', 'central', 'upper']);

  function requireFiniteNonNegative(value, label) {
    const number = Number(value);
    if (!Number.isFinite(number) || number < 0) {
      throw new RangeError(label + ' must be a finite, non-negative number.');
    }
    return number;
  }

  function requireWholeNumber(value, label) {
    const number = requireFiniteNonNegative(value, label);
    if (!Number.isInteger(number)) {
      throw new RangeError(label + ' must be a whole number.');
    }
    return number;
  }

  function scenario(lower, central, upper) {
    const result = {
      lower: requireFiniteNonNegative(lower, 'Lower scenario'),
      central: requireFiniteNonNegative(central, 'Central scenario'),
      upper: requireFiniteNonNegative(upper, 'Upper scenario'),
    };
    if (result.lower > result.central || result.central > result.upper) {
      throw new RangeError('Scenario values must satisfy lower <= central <= upper.');
    }
    return Object.freeze(result);
  }

  function zeroScenario() {
    return scenario(0, 0, 0);
  }

  function scaleScenario(values, multiplier) {
    const factor = requireFiniteNonNegative(multiplier, 'Scenario multiplier');
    return scenario(values.lower * factor, values.central * factor, values.upper * factor);
  }

  function sumScenarios(values) {
    const totals = { lower: 0, central: 0, upper: 0 };
    for (const value of values) {
      for (const key of SCENARIO_KEYS) {
        totals[key] += requireFiniteNonNegative(value[key], key + ' scenario');
      }
    }
    return scenario(totals.lower, totals.central, totals.upper);
  }

  function calculateTextPrompt(model, sizeId, gridFactor) {
    if (!model || !model.sizes || !model.sizes[sizeId]) {
      throw new RangeError('A supported model and output size are required.');
    }
    const grid = requireFiniteNonNegative(gridFactor, 'Electricity factor');
    const source = model.sizes[sizeId];
    const electricityKwh = scenario(source.whmin / 1000, source.wh / 1000, source.whmax / 1000);
    const embodiedCarbonG = scenario(source.embmin, source.emb, source.embmax);
    const operationalCarbonG = scenario(
      electricityKwh.lower * grid,
      electricityKwh.central * grid,
      electricityKwh.upper * grid
    );
    const totalCarbonG = scenario(
      operationalCarbonG.lower + embodiedCarbonG.lower,
      operationalCarbonG.central + embodiedCarbonG.central,
      operationalCarbonG.upper + embodiedCarbonG.upper
    );
    const waterL = scenario(source.mlmin / 1000, source.ml / 1000, source.mlmax / 1000);

    return Object.freeze({
      electricityKwh,
      operationalCarbonG,
      embodiedCarbonG,
      totalCarbonG,
      waterL,
    });
  }

  function calculateTextRow(input) {
    const count = requireWholeNumber(input.count, 'Prompt count');
    const perPrompt = calculateTextPrompt(input.model, input.sizeId, input.gridFactor);
    const resultState = count === 0 ? 'zero' : 'estimated';
    return Object.freeze({
      kind: 'text-prompt',
      resultState,
      quantity: count,
      periodId: input.periodId,
      electricityKwh: scaleScenario(perPrompt.electricityKwh, count),
      operationalCarbonG: scaleScenario(perPrompt.operationalCarbonG, count),
      embodiedCarbonG: scaleScenario(perPrompt.embodiedCarbonG, count),
      totalCarbonG: scaleScenario(perPrompt.totalCarbonG, count),
      waterL: scaleScenario(perPrompt.waterL, count),
      coverage: Object.freeze({ carbon: 'partial-lifecycle', water: 'usage-phase-consumption' }),
      sourceIds: Object.freeze((input.sourceIds || []).slice()),
    });
  }

  function aggregateTextRows(rows) {
    return Object.freeze({
      electricityKwh: sumScenarios(rows.map((row) => row.electricityKwh)),
      operationalCarbonG: sumScenarios(rows.map((row) => row.operationalCarbonG)),
      embodiedCarbonG: sumScenarios(rows.map((row) => row.embodiedCarbonG)),
      totalCarbonG: sumScenarios(rows.map((row) => row.totalCarbonG)),
      waterL: sumScenarios(rows.map((row) => row.waterL)),
    });
  }

  function createReportingPeriod(mode, options) {
    const settings = options || {};
    if (mode === 'single-project') {
      return Object.freeze({ id: mode, label: 'Single project', workdays: null });
    }
    if (mode === 'workweek') {
      return Object.freeze({ id: mode, label: 'Workweek', workdays: requireFiniteNonNegative(settings.workdays, 'Workdays') });
    }
    if (mode === 'custom') {
      return Object.freeze({ id: mode, label: String(settings.label || 'Custom period').trim() || 'Custom period', workdays: requireFiniteNonNegative(settings.workdays, 'Workdays') });
    }
    throw new RangeError('Unsupported reporting period.');
  }

  global.FootprintCalculations = Object.freeze({
    SCENARIO_KEYS,
    aggregateTextRows,
    calculateTextPrompt,
    calculateTextRow,
    createReportingPeriod,
    scaleScenario,
    scenario,
    sumScenarios,
    zeroScenario,
  });
})(globalThis);
