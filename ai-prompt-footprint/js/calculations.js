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

  function midpointScenario(lower, upper) {
    return scenario(lower, (lower + upper) / 2, upper);
  }

  function fixedScenario(value) {
    const number = requireFiniteNonNegative(value, 'Fixed scenario');
    return scenario(number, number, number);
  }

  function notEstimated(reason) {
    return Object.freeze({ state: 'not-estimated', reason: String(reason || 'No compatible estimate is available.') });
  }

  function estimated(values, options) {
    const settings = options || {};
    return Object.freeze({
      state: values.central === 0 ? 'zero' : 'estimated',
      scenarios: values,
      operational: settings.operational || null,
      embodied: settings.embodied || null,
      evidence: settings.evidence || 'Moderate',
      quantifiedUncertainty: settings.quantifiedUncertainty !== false,
    });
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

  function powerOfTwoCeiling(value) {
    if (value <= 1) return 1;
    return Math.pow(2, Math.ceil(Math.log(value) / Math.log(2)));
  }

  // Port of the EcoLogits 0.11.1 LLM inference equations. Only GWP, energy,
  // and WCF outputs used by this calculator are retained.
  function calculateLlmRequest(model, outputTokens, featureData) {
    const tokens = requireFiniteNonNegative(outputTokens, 'Output tokens');
    if (!model) throw new RangeError('A supported EcoLogits model is required.');
    const provider = featureData.PROVIDERS[model.provider];
    const mix = featureData.ELECTRICITY_MIXES[provider.location];
    const totals = Array.isArray(model.total) ? model.total : [model.total, model.total];
    const endpoints = [];
    for (const active of [model.activeMin, model.activeMax]) {
      for (const total of totals) {
        for (const pue of provider.pue) {
          for (const wue of provider.wue) {
            const latency = tokens / model.tps + model.ttft;
            const gpuCount = powerOfTwoCeiling((1.2 * total * 16 / 8) / 80);
            const gpuEnergyPerTokenKwh = (1.1665273170451914e-6 * Math.exp(-0.011205921025579175 * 64) * active + 4.052928146734005e-5) / 1000;
            const gpuEnergy = tokens * gpuEnergyPerTokenKwh;
            const serverEnergy = (latency / 3600) * 1.2 * (gpuCount / 8) / 64;
            const itEnergy = serverEnergy + gpuCount * gpuEnergy;
            const energy = pue * itEnergy;
            const usageCarbonG = energy * mix.gwpKgPerKwh * 1000;
            const embodiedServerKg = (gpuCount / 8) * 5700 + gpuCount * 273;
            const embodiedCarbonG = latency * embodiedServerKg / ((3 * 365 * 24 * 60 * 60) * 64) * 1000;
            endpoints.push({ energy, usageCarbonG, embodiedCarbonG, totalCarbonG: usageCarbonG + embodiedCarbonG, waterL: itEnergy * (wue + pue * mix.wueLPerKwh) });
          }
        }
      }
    }
    function span(key) {
      const values = endpoints.map(function (item) { return item[key]; });
      return midpointScenario(Math.min.apply(null, values), Math.max.apply(null, values));
    }
    return Object.freeze({
      electricityKwh: span('energy'), operationalCarbonG: span('usageCarbonG'),
      embodiedCarbonG: span('embodiedCarbonG'), totalCarbonG: span('totalCarbonG'), waterL: span('waterL'),
    });
  }

  function calculateWorkload(input, featureData) {
    const mode = input.mode;
    let requests;
    let totalOutputTokens;
    let periodWorkdays = null;
    if (mode === 'measured') {
      requests = requireWholeNumber(input.requestCount, 'Request count');
      totalOutputTokens = requireFiniteNonNegative(input.totalOutputTokens, 'Total output tokens');
      if (totalOutputTokens > 0 && requests === 0) throw new RangeError('Request count must be positive when output tokens are entered.');
    } else if (mode === 'estimated') {
      const runs = requireFiniteNonNegative(input.runsPerDay, 'Runs per workday');
      const calls = requireFiniteNonNegative(input.callsPerRun, 'Calls per run');
      const retries = requireFiniteNonNegative(input.retriesPerCall, 'Average retries');
      if (input.periodId === 'single-project') periodWorkdays = requireFiniteNonNegative(input.workdaysPerWeek, 'Workdays per week') * requireFiniteNonNegative(input.projectWeeks, 'Project weeks');
      else if (input.periodId === 'workweek') periodWorkdays = requireFiniteNonNegative(input.workdaysPerWeek, 'Workdays per week');
      else periodWorkdays = requireFiniteNonNegative(input.customWorkdays, 'Custom workdays');
      requests = runs * calls * periodWorkdays * (1 + retries);
      totalOutputTokens = requests * requireFiniteNonNegative(input.outputTokensPerCall, 'Output tokens per call');
    } else throw new RangeError('Unsupported workload mode.');
    const average = requests === 0 ? 0 : totalOutputTokens / requests;
    if (!input.model) return Object.freeze({ kind: 'ai-workload', resultState: 'not-estimated', requestCount: requests, totalOutputTokens, averageOutputTokens: average, impact: notEstimated('Other or unknown models are not mapped to a supported model.') });
    const perRequest = calculateLlmRequest(input.model, average, featureData);
    return Object.freeze({
      kind: 'ai-workload', resultState: requests === 0 ? 'zero' : 'estimated', requestCount: requests,
      totalOutputTokens, averageOutputTokens: average, periodWorkdays,
      electricityKwh: scaleScenario(perRequest.electricityKwh, requests),
      operationalCarbonG: scaleScenario(perRequest.operationalCarbonG, requests),
      embodiedCarbonG: scaleScenario(perRequest.embodiedCarbonG, requests),
      totalCarbonG: scaleScenario(perRequest.totalCarbonG, requests),
      waterL: scaleScenario(perRequest.waterL, requests),
      coverage: Object.freeze({ carbon: 'partial-lifecycle', water: 'usage-phase-consumption' }),
      sourceIds: Object.freeze(['ecologits-llm-models-0.11.1', 'ecologits-electricity-mixes-0.11.1']),
    });
  }

  function calculateVideo(input, featureData) {
    const count = requireWholeNumber(input.count, 'Generation count');
    const duration = requireFiniteNonNegative(input.duration, 'Video duration');
    if (count > 0 && duration <= 0) throw new RangeError('Video duration must be greater than zero.');
    const model = input.model;
    if (!model) {
      const compatible = featureData.VIDEO_MODELS.filter(function (candidate) {
        return candidate.resolutions.some(function (r) { return r[0] === input.resolution[0] && r[1] === input.resolution[1]; }) &&
          candidate.durations.indexOf(duration) >= 0 && (!input.withAudio || candidate.audio);
      }).map(function (candidate) { return calculateVideo(Object.assign({}, input, { model: candidate }), featureData); });
      if (!compatible.length) return Object.freeze({ kind: 'video', resultState: 'not-estimated', impact: notEstimated('No supported video model has this resolution, duration, and audio combination.') });
      function envelope(key) {
        const values = compatible.reduce(function (all, result) { return all.concat([result[key].lower, result[key].central, result[key].upper]); }, []);
        return midpointScenario(Math.min.apply(null, values), Math.max.apply(null, values));
      }
      return Object.freeze({ kind: 'video', resultState: count === 0 ? 'zero' : 'estimated', unknownModel: true,
        electricityKwh: envelope('electricityKwh'), operationalCarbonG: envelope('operationalCarbonG'),
        embodiedCarbonG: envelope('embodiedCarbonG'), totalCarbonG: envelope('totalCarbonG'), waterL: envelope('waterL'),
        coverage: Object.freeze({ carbon: 'partial-lifecycle', water: 'usage-phase-consumption' }),
        sourceIds: Object.freeze(['ecologits-video-models-0.11.1', 'ecologits-electricity-mixes-0.11.1']) });
    }
    const resolution = input.resolution;
    if (!model.resolutions.some(function (r) { return r[0] === resolution[0] && r[1] === resolution[1]; })) throw new RangeError('The selected resolution is not supported by this model.');
    if (model.durations.indexOf(duration) < 0) throw new RangeError('The selected duration is not supported by this model.');
    if (input.withAudio && !model.audio) throw new RangeError('This model does not support generated audio.');
    const width = resolution[0], height = resolution[1], frames = Math.floor(duration * 24 + 1);
    const volume = width * height * frames / 1000;
    const r = model.regression;
    const audioWeight = input.withAudio ? 1 : r[7];
    const latency = (r[0] * frames * Math.pow(width * height, 2) + r[1] * volume + r[2] * frames + r[3] * Math.pow(width * height, 2) + r[4] * Math.pow(frames, 2) + r[5] * Math.pow(volume, 2) + r[6]) * audioWeight;
    const hardware = featureData.VIDEO_HARDWARE[model.hardware];
    const provider = featureData.VIDEO_PROVIDERS[model.provider];
    const mix = featureData.ELECTRICITY_MIXES[provider.location];
    const combinations = [];
    for (const powerW of hardware.powerW) for (const pue of provider.pue) for (const wue of provider.wue) {
      const serverEnergy = latency / 3600 * powerW / 1000;
      const energy = pue * serverEnergy;
      const usageG = energy * mix.gwpKgPerKwh * 1000;
      const embodiedG = latency / (3 * 365 * 24 * 60 * 60) * (hardware.serverGwpKg + hardware.accelerators * hardware.acceleratorGwpKg) * 1000;
      combinations.push({ energy, usageG, embodiedG, totalG: usageG + embodiedG, waterL: serverEnergy * (wue + pue * mix.wueLPerKwh) });
    }
    function span(key) { const v = combinations.map(function (x) { return x[key] * count; }); return midpointScenario(Math.min.apply(null, v), Math.max.apply(null, v)); }
    return Object.freeze({ kind: 'video', resultState: count === 0 ? 'zero' : 'estimated', latencySeconds: latency,
      electricityKwh: span('energy'), operationalCarbonG: span('usageG'), embodiedCarbonG: span('embodiedG'),
      totalCarbonG: span('totalG'), waterL: span('waterL'), coverage: Object.freeze({ carbon: 'partial-lifecycle', water: 'usage-phase-consumption' }),
      sourceIds: Object.freeze(['ecologits-video-models-0.11.1', 'ecologits-electricity-mixes-0.11.1']) });
  }

  function calculateImageDisclosure(input) {
    const count = requireWholeNumber(input.count, 'Generation count');
    return Object.freeze({ kind: 'image', resultState: 'not-estimated', quantity: count,
      electricity: notEstimated('The approved per-model/per-resolution companion data are unavailable.'),
      carbon: notEstimated('Image electricity is unavailable, so carbon is not calculated.'),
      water: notEstimated('The image study does not provide compatible water data.'),
      sourceIds: Object.freeze(['bertazzini-image-energy-2025-pending']) });
  }

  function calculateMeeting(input) {
    const count = requireWholeNumber(input.count, 'Meeting count');
    const minutes = requireFiniteNonNegative(input.durationMinutes, 'Meeting duration');
    const attendees = requireWholeNumber(input.attendees, 'Attendees');
    const participantHours = count * minutes / 60 * attendees;
    let carbon;
    let endpointHours;
    if (input.mode === 'mixed') {
      carbon = scenario(participantHours * 55, participantHours * 90, participantHours * 295);
      endpointHours = participantHours;
    } else if (input.mode === 'detailed') {
      const laptops = requireWholeNumber(input.laptops, 'Laptop attendees');
      const desktops = requireWholeNumber(input.desktops, 'Desktop attendees');
      const roomAttendees = requireWholeNumber(input.roomAttendees, 'Shared-room attendees');
      const rooms = requireWholeNumber(input.roomSystems, 'Shared-room systems');
      if (laptops + desktops + roomAttendees !== attendees) throw new RangeError('Laptop, desktop, and shared-room attendees must equal total attendees.');
      if ((roomAttendees > 0 && (rooms < 1 || rooms > roomAttendees)) || (roomAttendees === 0 && rooms !== 0)) throw new RangeError('Shared-room systems must be between one and the shared-room attendee count, or zero when no one shares a room.');
      const hours = count * minutes / 60;
      endpointHours = hours * (laptops + desktops + rooms);
      carbon = fixedScenario(hours * (laptops * 55 + desktops * 90 + rooms * 295));
    } else throw new RangeError('Unsupported meeting endpoint mode.');
    return Object.freeze({ kind: 'meeting', resultState: carbon.central === 0 ? 'zero' : 'estimated', participantHours, endpointHours,
      totalCarbonG: carbon, averageCarbonPerAttendeeHourG: participantHours ? carbon.central / participantHours : null,
      water: notEstimated('The source has no compatible whole-meeting water coefficient.'),
      quantifiedUncertainty: input.mode === 'mixed', sourceIds: Object.freeze(['uba-green-cloud-video-meeting-2021']) });
  }

  function calculateLocalPower(hours, watts, gridFactor) {
    const h = requireFiniteNonNegative(hours, 'Hours');
    const grid = requireFiniteNonNegative(gridFactor, 'Electricity factor');
    const values = Array.isArray(watts) ? watts : [watts, watts, watts];
    const electricity = scenario(h * requireFiniteNonNegative(values[0], 'Lower watts') / 1000, h * requireFiniteNonNegative(values[1], 'Central watts') / 1000, h * requireFiniteNonNegative(values[2], 'Upper watts') / 1000);
    return Object.freeze({ electricityKwh: electricity, operationalCarbonG: scaleScenario(electricity, grid) });
  }

  function calculateDigitalActivity(input, featureData) {
    const hours = requireFiniteNonNegative(input.hours, 'Hours');
    const local = calculateLocalPower(hours, input.watts, input.gridFactor);
    let operational = local.operationalCarbonG;
    const notes = [];
    if (input.displayWatts != null && !input.displayIncluded) operational = sumScenarios([operational, calculateLocalPower(hours, input.displayWatts, input.gridFactor).operationalCarbonG]);
    if (input.type === 'streaming') {
      const peripheral = featureData.STREAMING.peripheralWatts[input.peripheral || 'none'] || 0;
      operational = sumScenarios([operational, fixedScenario(hours * featureData.STREAMING.infrastructureCarbonGPerHour), calculateLocalPower(hours, peripheral, input.gridFactor).operationalCarbonG]);
      notes.push('Resolution is recorded as a traffic sensitivity; it does not rescale the central power-allocation result.');
    } else if (input.type === 'social') {
      const s = featureData.SOCIAL;
      const infrastructure = [0,1,2].map(function (i) {
        const kwh = s.cpeKwhPerHour[i] + s.accessKwhPerHour[i] + s.trafficGbPerHour[i] * (s.coreAccessKwhPerGb[i] + s.coreDatacenterKwhPerGb[i] + s.datacenterKwhPerGb[i]);
        return hours * kwh * s.infrastructureGridGPerKwh;
      });
      operational = sumScenarios([operational, scenario(infrastructure[0], infrastructure[1], infrastructure[2])]);
      notes.push('Embodied carbon is not estimated because the pinned open inventory requires a separately licensed LCA database to reproduce it.');
    } else if (input.type === 'gaming' && input.gamingMode === 'cloud') {
      const cloud = featureData.CLOUD_GAMING[input.cloudClass || 'pc'];
      operational = sumScenarios([operational, fixedScenario(hours * (cloud.datacenterW + cloud.networkW) / 1000 * featureData.CLOUD_GAMING.sourceGridGPerKwh)]);
      notes.push('Cloud infrastructure uses the source 2016 electricity and network assumptions.');
    }
    return Object.freeze({ kind: input.type, resultState: operational.central === 0 ? 'zero' : 'estimated', electricityKwh: local.electricityKwh,
      operationalCarbonG: operational, embodiedCarbon: notEstimated('No compatible standalone embodied coefficient is included.'),
      totalCarbonG: operational, water: notEstimated('Water is not estimated for digital-media activities.'), notes: Object.freeze(notes) });
  }

  function aggregateResults(rows, key) {
    const included = [], excluded = [];
    for (const row of rows) {
      if (row && row[key] && row[key].lower != null) included.push(row[key]);
      else excluded.push(row && row.kind ? row.kind : 'unknown activity');
    }
    return Object.freeze({ scenarios: sumScenarios(included), includedCount: included.length, excluded: Object.freeze(excluded) });
  }

  function calculateAiShare(ai, combined) {
    const values = {};
    for (const key of SCENARIO_KEYS) values[key] = combined[key] === 0 ? null : ai[key] / combined[key] * 100;
    return Object.freeze(values);
  }

  function rankSensitivity(centralTotal, assumptions) {
    return assumptions.map(function (item, index) {
      const magnitude = Math.max(Math.abs(item.lowerTotal - centralTotal), Math.abs(item.upperTotal - centralTotal));
      return Object.freeze({ id: item.id, label: item.label, magnitude, percent: centralTotal > 0 ? magnitude / centralTotal * 100 : null, order: index });
    }).sort(function (a, b) { return b.magnitude - a.magnitude || a.order - b.order; });
  }

  global.FootprintCalculations = Object.freeze({
    SCENARIO_KEYS,
    aggregateTextRows,
    aggregateResults,
    calculateAiShare,
    calculateDigitalActivity,
    calculateImageDisclosure,
    calculateLlmRequest,
    calculateLocalPower,
    calculateMeeting,
    calculateTextPrompt,
    calculateTextRow,
    calculateVideo,
    calculateWorkload,
    createReportingPeriod,
    estimated,
    fixedScenario,
    midpointScenario,
    notEstimated,
    rankSensitivity,
    scaleScenario,
    scenario,
    sumScenarios,
    zeroScenario,
  });
})(globalThis);
