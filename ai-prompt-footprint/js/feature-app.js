(function () {
  'use strict';

  const C = globalThis.FootprintCalculations;
  const D = globalThis.FootprintFeatureData;
  const root = document.getElementById('impact-workspace');
  if (!root || !C || !D) return;

  let sequence = 1;
  const state = {
    scenario: 'central',
    sensitivityId: '', sensitivityLevel: 'central',
    text: { carbon: C.zeroScenario(), water: C.zeroScenario(), periodId: 'workweek', periodLabel: 'workweek', customDays: 5, gridFactor: 380, regionLabel: 'the US' },
    media: [], workloads: [], meetings: [], digital: [],
  };

  const sources = [
    ['ecologits-video-models-0.11.1', 'EcoLogits 0.11.1 video method', 'https://github.com/mlco2/ecologits/releases/tag/0.11.1', 'July 7, 2026 · pinned release · provider infrastructure may be assumed; embodied water unavailable.'],
    ['bertazzini-image-energy-2025-pending', 'Bertazzini et al., The Hidden Cost of an Image', 'https://arxiv.org/abs/2506.17016', '2025 · measured open models · companion per-model table unavailable, so impacts are not estimated.'],
    ['ecologits-llm-models-0.11.1', 'EcoLogits 0.11.1 LLM method', 'https://ecologits.ai/latest/methodology/llm_inference/', 'Pinned 0.11.1 · output-token inference model · input/context processing, networking, storage, training, and embodied water excluded.'],
    ['uba-green-cloud-video-meeting-2021', 'German Environment Agency, Green Cloud Computing', 'https://www.umweltbundesamt.de/en/topics/digitalisation/green-it/digital-services-cloud-computing', '2021 German case study · full meeting boundary · older electricity, network, lifetime, and device assumptions.'],
    ['carbon-trust-streaming-2021', 'Carbon Trust, Carbon impact of video streaming', 'https://www.carbontrust.com/sites/default/files/documents/resource/public/Carbon-impact-of-video-streaming.pdf', '2021 European allocation study · central power method is not proportional to video resolution.'],
    ['istrate-internet-6743642', 'Istrate et al., internet-use environmental footprints', 'https://github.com/robyistrate/internet-environmental-footprint/tree/67436426ae321c0f290081633a66ed355064ec27', 'Pinned commit 6743642 · generic social-use infrastructure; no platform-specific claim.'],
    ['mills-gaming-2019', 'Mills et al., Toward Greener Gaming', 'https://doi.org/10.1007/s40869-019-00084-2', '2019 study · measured hardware categories and modeled cloud-gaming infrastructure; no game-title precision.'],
  ];

  function id(prefix) { return prefix + '-' + sequence++; }
  function esc(value) { return String(value == null ? '' : value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); }
  function n(value, fallback) { const parsed = Number(value); return Number.isFinite(parsed) ? parsed : fallback; }
  function selected(a, b) { return a === b ? ' selected' : ''; }
  function checked(value) { return value ? ' checked' : ''; }
  function options(items, value, getValue, getLabel) {
    return items.map(function (item) { const v = getValue ? getValue(item) : item; const label = getLabel ? getLabel(item) : item; return '<option value="' + esc(v) + '"' + selected(String(v), String(value)) + '>' + esc(label) + '</option>'; }).join('');
  }
  function fmt(value, unit) {
    if (value == null || !Number.isFinite(value)) return 'Not applicable';
    const abs = Math.abs(value);
    let text;
    if (abs >= 1000) text = Math.round(value).toLocaleString('en-US');
    else if (abs >= 100) text = value.toFixed(1);
    else if (abs >= 1) text = value.toFixed(2);
    else if (abs >= 0.01) text = value.toFixed(3);
    else text = value === 0 ? '0' : value.toPrecision(2);
    return text + (unit ? ' ' + unit : '');
  }
  function range(values, unit) { return fmt(values.lower, unit) + ' – ' + fmt(values.upper, unit); }
  function field(label, name, value, attrs) {
    return '<label>' + esc(label) + '<input data-field="' + name + '" value="' + esc(value) + '" ' + (attrs || '') + '></label>';
  }
  function selectField(label, name, list, value) {
    return '<label>' + esc(label) + '<select data-field="' + name + '">' + list + '</select></label>';
  }
  function card(row, title, fields, result, extraClass) {
    return '<article class="impact-row ' + (extraClass || '') + '" data-id="' + row.id + '"><div class="impact-row-title"><h5>' + esc(title) + '</h5><button type="button" data-remove aria-label="Remove ' + esc(title) + '">Remove</button></div><div class="impact-fields">' + fields + '</div>' + result + '</article>';
  }
  function errorResult(error) { return '<div class="impact-error" role="alert">' + esc(error.message || error) + '</div>'; }
  function resultBlock(result, notes) {
    if (!result || result.resultState === 'not-estimated') {
      const reason = result && result.impact ? result.impact.reason : 'No compatible estimate is available.';
      return '<div class="impact-result"><strong>Not estimated</strong><p>' + esc(reason) + '</p>' + (notes || '') + '</div>';
    }
    return '<div class="impact-result"><div><span>Carbon · ' + esc(state.scenario) + '</span><strong>' + fmt(result.totalCarbonG[state.scenario], 'g CO₂e') + '</strong><small>Range ' + range(result.totalCarbonG, 'g') + '</small></div>' +
      (result.waterL ? '<div><span>Water consumption · ' + esc(state.scenario) + '</span><strong>' + fmt(result.waterL[state.scenario], 'L') + '</strong><small>Range ' + range(result.waterL, 'L') + '</small></div>' : '<div><span>Water</span><strong>Not estimated</strong><small>Excluded from the partial-water total</small></div>') +
      (result.operationalCarbonG ? '<p>Operational ' + fmt(result.operationalCarbonG[state.scenario], 'g') + '; embodied ' + fmt(result.embodiedCarbonG[state.scenario], 'g') + ' CO₂e.</p>' : '') + (notes || '') + '</div>';
  }

  function defaultMedia() { return { id: id('media'), kind: 'video', count: 1, imageModel: 'Other or unknown', imageResolution: '512 × 512', imageLocation: 'unknown', videoModel: D.VIDEO_MODELS[0].id, resolution: D.VIDEO_MODELS[0].resolutions[0].join('x'), duration: D.VIDEO_MODELS[0].durations[0], audio: false }; }
  function defaultWorkload() { return { id: id('workload'), name: 'Creative project', mode: 'estimated', model: D.LLM_MODELS[0].id, runsPerDay: 2, callsPerRun: 3, retriesPerCall: 0.5, outputTokensPerCall: 1000, workdaysPerWeek: 5, projectWeeks: 2, requestCount: 10, totalOutputTokens: 5000, inputTokens: 0, cachedTokens: 0, reasoningTokens: 0 }; }
  function defaultMeeting() { return { id: id('meeting'), name: 'Team meeting', mode: 'mixed', count: 1, durationMinutes: 60, attendees: 4, laptops: 2, desktops: 1, roomAttendees: 1, roomSystems: 1 }; }
  function defaultDigital() { return { id: id('digital'), name: 'Reference viewing', type: 'streaming', hours: 2, device: 'laptop', customWatts: 22, useCustom: false, displayIncluded: true, displayWatts: 0, peripheral: 'none', resolution: '1080p', gamingMode: 'local', cloudClass: 'pc' }; }

  function mediaResult(row) {
    if (row.kind === 'image') return C.calculateImageDisclosure({ count: n(row.count, 0) });
    const model = D.VIDEO_MODELS.find(function (item) { return item.id === row.videoModel; });
    const resolution = String(row.resolution).split('x').map(Number);
    return C.calculateVideo({ model: model || null, resolution: resolution, duration: n(row.duration, 0), withAudio: !!row.audio, count: n(row.count, 0) }, D);
  }
  function renderMedia() {
    root.querySelector('#media-rows').innerHTML = state.media.map(function (row) {
      let fields = selectField('Media type', 'kind', options([['image','Generated image'],['video','Generated video']], row.kind, function (x) { return x[0]; }, function (x) { return x[1]; }), row.kind);
      if (row.kind === 'image') {
        const modelItems = ['Other or unknown'].concat(D.IMAGE_MODELS);
        fields += selectField('Model', 'imageModel', options(modelItems, row.imageModel), row.imageModel) + selectField('Resolution', 'imageResolution', options(['512 × 512','768 × 1024','1024 × 1024'], row.imageResolution), row.imageResolution) + selectField('Generation location', 'imageLocation', options([['unknown','Unknown'],['hosted','Hosted service'],['local','Local device']], row.imageLocation, function (x) { return x[0]; }, function (x) { return x[1]; }), row.imageLocation) + field('Generation count, including retries', 'count', row.count, 'type="number" min="0" step="1"');
        let result;
        try { result = mediaResult(row); } catch (error) { return card(row, 'Image generation', fields, errorResult(error)); }
        return card(row, 'Image generation', fields, '<div class="impact-result"><strong>Electricity, carbon, and water: Not estimated</strong><p>The approved companion measurements are unavailable. The entry is recorded and excluded from numerical totals; it is never treated as zero.</p><p class="impact-meta">Measured open-model study · limited evidence · source gap documented</p></div>');
      }
      const model = D.VIDEO_MODELS.find(function (item) { return item.id === row.videoModel; }) || null;
      const resolutions = model ? model.resolutions : Array.from(new Map(D.VIDEO_MODELS.reduce(function (all, item) { return all.concat(item.resolutions); }, []).map(function (r) { return [r.join('x'), r]; })).values());
      const durations = model ? model.durations : Array.from(new Set(D.VIDEO_MODELS.reduce(function (all, item) { return all.concat(item.durations); }, []))).sort(function (a, b) { return a - b; });
      if (!resolutions.some(function (r) { return r.join('x') === row.resolution; })) row.resolution = resolutions[0].join('x');
      if (durations.indexOf(n(row.duration, 0)) < 0) row.duration = durations[0];
      fields += selectField('Video model', 'videoModel', '<option value="">Other or unknown</option>' + options(D.VIDEO_MODELS, row.videoModel, function (x) { return x.id; }, function (x) { return x.label; }), row.videoModel) +
        selectField('Resolution', 'resolution', options(resolutions, row.resolution, function (x) { return x.join('x'); }, function (x) { return x[0] + ' × ' + x[1]; }), row.resolution) +
        selectField('Clip duration', 'duration', options(durations, String(row.duration), String, function (x) { return x + ' seconds'; }), String(row.duration)) +
        ((!model || model.audio) ? '<label class="impact-check"><input data-field="audio" type="checkbox"' + checked(row.audio) + '> Include generated audio</label>' : '') + field('Generation count, including retries', 'count', row.count, 'type="number" min="0" step="1"');
      try {
        const result = mediaResult(row);
        return card(row, 'Video generation', fields, resultBlock(result, '<p class="impact-meta">' + (result.unknownModel ? 'Unknown-model scenario · Limited evidence' : 'Modeled hosted-service estimate · Moderate evidence') + ' · EcoLogits 0.11.1. Provider infrastructure and proprietary-model values may be assumed.</p>'));
      } catch (error) { return card(row, 'Video generation', fields, errorResult(error)); }
    }).join('') || '<p class="impact-empty">No image or video generation entered.</p>';
  }

  function workloadResult(row) {
    const model = D.LLM_MODELS.find(function (item) { return item.id === row.model; }) || null;
    const common = { mode: row.mode, model: model, periodId: state.text.periodId, customWorkdays: state.text.customDays };
    if (row.mode === 'measured') return C.calculateWorkload(Object.assign(common, { requestCount: n(row.requestCount, 0), totalOutputTokens: n(row.totalOutputTokens, 0) }), D);
    return C.calculateWorkload(Object.assign(common, { runsPerDay: n(row.runsPerDay, 0), callsPerRun: n(row.callsPerRun, 0), retriesPerCall: n(row.retriesPerCall, 0), outputTokensPerCall: n(row.outputTokensPerCall, 0), workdaysPerWeek: n(row.workdaysPerWeek, 0), projectWeeks: n(row.projectWeeks, 0) }), D);
  }
  function renderWorkloads() {
    root.querySelector('#workload-rows').innerHTML = state.workloads.map(function (row) {
      let fields = field('Project name', 'name', row.name, 'type="text"') + selectField('Entry method', 'mode', options([['measured','Measured usage'],['estimated','Estimated workload']], row.mode, function (x) { return x[0]; }, function (x) { return x[1]; }), row.mode) + selectField('Model', 'model', '<option value="">Other or unknown</option>' + options(D.LLM_MODELS, row.model, function (x) { return x.id; }, function (x) { return x.label; }), row.model);
      if (row.mode === 'measured') fields += field('Provider-recorded requests', 'requestCount', row.requestCount, 'type="number" min="0" step="1"') + field('Total output tokens', 'totalOutputTokens', row.totalOutputTokens, 'type="number" min="0" step="1"') + field('Input/context tokens (recorded, unmodeled)', 'inputTokens', row.inputTokens, 'type="number" min="0" step="1"') + field('Cached input tokens (recorded, unmodeled)', 'cachedTokens', row.cachedTokens, 'type="number" min="0" step="1"') + field('Reasoning tokens included in output', 'reasoningTokens', row.reasoningTokens, 'type="number" min="0" step="1"');
      else fields += field('Runs per workday', 'runsPerDay', row.runsPerDay, 'type="number" min="0" step="0.1"') + field('Model calls per run', 'callsPerRun', row.callsPerRun, 'type="number" min="0" step="0.1"') + field('Average retries per call', 'retriesPerCall', row.retriesPerCall, 'type="number" min="0" step="0.1"') + '<label>Output-size preset<select data-preset><option value="">Custom</option><option value="400">Chatbot reply · 400</option><option value="5000">Five-page report · 5,000</option><option value="15000">Long document · 15,000</option><option value="100000">Coding/agent benchmark · 100,000</option></select></label>' + field('Average output tokens per call', 'outputTokensPerCall', row.outputTokensPerCall, 'type="number" min="0" step="1"') + field('Workdays per week', 'workdaysPerWeek', row.workdaysPerWeek, 'type="number" min="0" step="0.5"') + (state.text.periodId === 'single-project' ? field('Project duration, weeks', 'projectWeeks', row.projectWeeks, 'type="number" min="0" step="0.5"') : '');
      try {
        const result = workloadResult(row);
        const arithmetic = '<p>Arithmetic: <strong>' + fmt(result.periodWorkdays, 'workdays') + '</strong>, <strong>' + fmt(result.requestCount, 'retry-adjusted calls') + '</strong>, <strong>' + fmt(result.totalOutputTokens, 'output tokens') + '</strong>.</p>';
        const context = n(row.inputTokens, 0) || n(row.cachedTokens, 0) || n(row.reasoningTokens, 0) ? '<p class="impact-warning">Input, cached, and reasoning detail is recorded but does not add to the output-token estimate. Long context, prefill, tools, and caching may materially change actual use.</p>' : '';
        const duplicate = state.workloads.some(function (other) { return other.id !== row.id && other.name.trim().toLowerCase() === row.name.trim().toLowerCase() && other.model === row.model && other.mode !== row.mode; }) ? '<p class="impact-warning">Possible duplicate: a measured and estimated row use the same project label and model. Check whether they cover the same activity.</p>' : '';
        return card(row, row.name || 'AI workload', fields, resultBlock(result, arithmetic + context + duplicate + '<p class="impact-meta">' + (row.mode === 'measured' ? 'Provider record' : 'Employee estimate') + ' · Moderate evidence · output-token method</p>'));
      } catch (error) { return card(row, row.name || 'AI workload', fields, errorResult(error)); }
    }).join('') || '<p class="impact-empty">No project workload entered.</p>';
  }

  function meetingResult(row) { return C.calculateMeeting({ mode: row.mode, count: n(row.count, 0), durationMinutes: n(row.durationMinutes, 0), attendees: n(row.attendees, 0), laptops: n(row.laptops, 0), desktops: n(row.desktops, 0), roomAttendees: n(row.roomAttendees, 0), roomSystems: n(row.roomSystems, 0) }); }
  function renderMeetings() {
    root.querySelector('#meeting-rows').innerHTML = state.meetings.map(function (row) {
      let fields = field('Meeting name', 'name', row.name, 'type="text"') + field('Meeting count', 'count', row.count, 'type="number" min="0" step="1"') + field('Minutes per meeting', 'durationMinutes', row.durationMinutes, 'type="number" min="0" step="1"') + field('Total attendees', 'attendees', row.attendees, 'type="number" min="0" step="1"') + selectField('Endpoint detail', 'mode', options([['mixed','Unknown or mixed devices'],['detailed','Detailed endpoints']], row.mode, function (x) { return x[0]; }, function (x) { return x[1]; }), row.mode);
      if (row.mode === 'detailed') fields += field('Laptop attendees', 'laptops', row.laptops, 'type="number" min="0" step="1"') + field('Desktop + monitor attendees', 'desktops', row.desktops, 'type="number" min="0" step="1"') + field('Shared-room attendees', 'roomAttendees', row.roomAttendees, 'type="number" min="0" step="1"') + field('Shared-room display systems', 'roomSystems', row.roomSystems, 'type="number" min="0" step="1"');
      try {
        const result = meetingResult(row);
        return card(row, row.name || 'Meeting', fields, resultBlock(result, '<p><strong>' + fmt(result.participantHours, 'participant-hours') + '</strong>; ' + (result.averageCarbonPerAttendeeHourG == null ? 'average not applicable' : fmt(result.averageCarbonPerAttendeeHourG, 'g per attendee-hour')) + '.</p><p class="impact-warning">Whole-meeting activity total—not a personal allocation. Avoid duplicate entry across attendees.</p><p class="impact-meta">2021 German case study · ' + (result.quantifiedUncertainty ? 'device scenarios' : 'quantified uncertainty unavailable') + ' · Moderate evidence</p>'));
      } catch (error) { return card(row, row.name || 'Meeting', fields, errorResult(error)); }
    }).join('') || '<p class="impact-empty">No meetings entered.</p>';
  }

  function digitalResult(row) {
    const preset = D.DEVICE_POWER[row.device];
    const watts = row.useCustom ? n(row.customWatts, 0) : (preset || n(row.customWatts, 0));
    return C.calculateDigitalActivity({ type: row.type, hours: n(row.hours, 0), watts: watts, gridFactor: state.text.gridFactor, displayIncluded: !!row.displayIncluded, displayWatts: row.displayIncluded ? null : n(row.displayWatts, 0), peripheral: row.peripheral, gamingMode: row.gamingMode, cloudClass: row.cloudClass }, D);
  }
  function renderDigital() {
    root.querySelector('#digital-rows').innerHTML = state.digital.map(function (row) {
      let fields = field('Activity name', 'name', row.name, 'type="text"') + selectField('Activity type', 'type', options([['streaming','Video streaming'],['social','Social media'],['gaming','Gaming']], row.type, function (x) { return x[0]; }, function (x) { return x[1]; }), row.type) + field('Hours in period', 'hours', row.hours, 'type="number" min="0" step="0.25"') + selectField('Client device', 'device', options([['phone','Phone'],['laptop','Laptop'],['desktop','Desktop'],['television','Television'],['console','Console / custom']], row.device, function (x) { return x[0]; }, function (x) { return x[1]; }), row.device) + '<label class="impact-check"><input data-field="useCustom" type="checkbox"' + checked(row.useCustom || !D.DEVICE_POWER[row.device]) + '> Use measured custom active watts</label>';
      if (row.useCustom || !D.DEVICE_POWER[row.device]) fields += field('Average active wall power, watts', 'customWatts', row.customWatts, 'type="number" min="0" step="0.1"');
      fields += '<label class="impact-check"><input data-field="displayIncluded" type="checkbox"' + checked(row.displayIncluded) + '> Display power is included</label>' + (!row.displayIncluded ? field('Separate display watts', 'displayWatts', row.displayWatts, 'type="number" min="0" step="0.1"') : '');
      if (row.type === 'streaming') fields += selectField('Resolution (recorded sensitivity)', 'resolution', options(['480p','720p','1080p','4K'], row.resolution), row.resolution) + selectField('Streaming peripheral', 'peripheral', options([['none','None'],['settop','Set-top box'],['console','Console']], row.peripheral, function (x) { return x[0]; }, function (x) { return x[1]; }), row.peripheral);
      if (row.type === 'gaming') fields += selectField('Gaming mode', 'gamingMode', options([['local','Local gaming'],['cloud','Cloud gaming']], row.gamingMode, function (x) { return x[0]; }, function (x) { return x[1]; }), row.gamingMode) + (row.gamingMode === 'cloud' ? selectField('Cloud hardware scenario', 'cloudClass', options([['pc','PC-class'],['console','Console-class']], row.cloudClass, function (x) { return x[0]; }, function (x) { return x[1]; }), row.cloudClass) : '');
      try {
        const result = digitalResult(row);
        const sourceNote = row.type === 'streaming' ? 'Carbon Trust allocation study' : row.type === 'social' ? 'Pinned Istrate generic-use model' : 'Berkeley Lab gaming evidence';
        return card(row, row.name || 'Digital activity', fields, resultBlock(result, '<p>Local client electricity: <strong>' + fmt(result.electricityKwh[state.scenario], 'kWh') + '</strong>.</p>' + result.notes.map(function (note) { return '<p>' + esc(note) + '</p>'; }).join('') + '<p class="impact-meta">' + sourceNote + ' · Moderate/limited evidence · water not estimated</p>'));
      } catch (error) { return card(row, row.name || 'Digital activity', fields, errorResult(error)); }
    }).join('') || '<p class="impact-empty">No streaming, social, or gaming activity entered.</p>';
  }

  function collect() {
    const ai = [{ kind: 'text prompts', totalCarbonG: state.text.carbon, waterL: state.text.water }];
    const digital = [];
    const excludedCarbon = [];
    const excludedWater = [];
    state.media.forEach(function (row) { try { const result = mediaResult(row); if (result.totalCarbonG) ai.push(result); else excludedCarbon.push('image generation'); if (!result.waterL) excludedWater.push(row.kind + ' generation'); } catch (_) { excludedCarbon.push(row.kind + ' generation (invalid)'); excludedWater.push(row.kind + ' generation'); } });
    state.workloads.forEach(function (row) { try { const result = workloadResult(row); if (result.totalCarbonG) ai.push(result); else excludedCarbon.push('AI workload'); if (!result.waterL) excludedWater.push('AI workload'); } catch (_) { excludedCarbon.push('AI workload (invalid)'); excludedWater.push('AI workload'); } });
    state.meetings.forEach(function (row) { try { digital.push(meetingResult(row)); excludedWater.push('meetings'); } catch (_) { excludedCarbon.push('meeting (invalid)'); excludedWater.push('meetings'); } });
    state.digital.forEach(function (row) { try { digital.push(digitalResult(row)); excludedWater.push(row.type); } catch (_) { excludedCarbon.push(row.type + ' (invalid)'); excludedWater.push(row.type); } });
    const aiCarbon = C.aggregateResults(ai, 'totalCarbonG').scenarios;
    const digitalCarbon = C.aggregateResults(digital, 'totalCarbonG').scenarios;
    const combined = C.sumScenarios([aiCarbon, digitalCarbon]);
    const aiWater = C.aggregateResults(ai, 'waterL').scenarios;
    return { ai, digital, aiCarbon, digitalCarbon, combined, water: aiWater, share: C.calculateAiShare(aiCarbon, combined), excludedCarbon, excludedWater: Array.from(new Set(excludedWater)) };
  }
  function renderSummary() {
    const totals = collect();
    const s = state.scenario;
    root.querySelector('#impact-summary').innerHTML = '<div><span>Professional AI</span><strong>' + fmt(totals.aiCarbon[s], 'g CO₂e') + '</strong><small>' + range(totals.aiCarbon, 'g') + '</small></div><div><span>Broader digital</span><strong>' + fmt(totals.digitalCarbon[s], 'g CO₂e') + '</strong><small>' + range(totals.digitalCarbon, 'g') + '</small></div><div class="impact-summary-primary"><span>Combined carbon · ' + esc(s) + '</span><strong>' + fmt(totals.combined[s], 'g CO₂e') + '</strong><small>Scenario range ' + range(totals.combined, 'g') + '</small></div><div><span>Partial water · ' + esc(s) + '</span><strong>' + fmt(totals.water[s], 'L') + '</strong><small>Excludes ' + esc(totals.excludedWater.join(', ') || 'no entered supported gaps') + '</small></div><div><span>AI share of carbon</span><strong>' + fmt(totals.share[s], '%') + '</strong><small>Not applicable when combined carbon is zero</small></div><div><span>Reporting period</span><strong>' + esc(state.text.periodLabel) + '</strong><small>Entries are not annualized</small></div>';

    const assumptions = [];
    totals.ai.concat(totals.digital).forEach(function (row, index) { if (row.totalCarbonG && row.totalCarbonG.lower !== row.totalCarbonG.upper) assumptions.push({ id: 'row-' + index, label: (row.kind || 'activity') + ' scenario', values: row.totalCarbonG, lowerTotal: totals.combined.central - row.totalCarbonG.central + row.totalCarbonG.lower, upperTotal: totals.combined.central - row.totalCarbonG.central + row.totalCarbonG.upper }); });
    const ranking = C.rankSensitivity(totals.combined.central, assumptions);
    if (state.sensitivityId && !assumptions.some(function (a) { return a.id === state.sensitivityId; })) state.sensitivityId = '';
    const selectedAssumption = assumptions.find(function (a) { return a.id === state.sensitivityId; });
    const sensitivityTotal = selectedAssumption ? totals.combined.central - selectedAssumption.values.central + selectedAssumption.values[state.sensitivityLevel] : totals.combined.central;
    const sensitivityControls = assumptions.length ? '<div class="impact-sensitivity-controls"><label>Assumption to vary<select data-sensitivity="id"><option value="">None · central total</option>' + assumptions.map(function (a) { return '<option value="' + a.id + '"' + selected(a.id, state.sensitivityId) + '>' + esc(a.label) + '</option>'; }).join('') + '</select></label><label>Documented value<select data-sensitivity="level">' + options([['lower','Lower'],['central','Central'],['upper','Upper']], state.sensitivityLevel, function (x) { return x[0]; }, function (x) { return x[1]; }) + '</select></label><p><strong>Recalculated carbon:</strong> ' + fmt(sensitivityTotal, 'g CO₂e') + ' (' + (sensitivityTotal >= totals.combined.central ? '+' : '') + fmt(sensitivityTotal - totals.combined.central, 'g vs central') + ')</p></div>' : '';
    root.querySelector('#impact-sensitivity').innerHTML = '<h4>One-at-a-time carbon sensitivity</h4>' + sensitivityControls + (ranking.length ? '<ol class="impact-ranking">' + ranking.map(function (item) { return '<li><span>' + esc(item.label) + '</span><strong>± up to ' + fmt(item.magnitude, 'g') + (item.percent == null ? '' : ' · ' + fmt(item.percent, '%')) + '</strong></li>'; }).join('') + '</ol>' : '<p>No quantified varying assumption is active.</p>') + '<p class="impact-note">This local sensitivity screen changes one documented row scenario at a time. It is not a probability or causal attribution. Unquantified drivers include image coefficients, meeting-platform and device variation, long-context processing, product manufacture where omitted, and all listed water gaps.</p><p class="impact-note"><strong>Carbon coverage:</strong> ' + (totals.excludedCarbon.length ? 'Partial; excluded ' + esc(totals.excludedCarbon.join(', ')) + '.' : 'All valid entered carbon rows included within their stated boundaries.') + ' <strong>Water coverage:</strong> Partial; only compatible text, workload, and video usage-phase consumption is included.</p>';
    root.querySelector('#impact-sources').innerHTML = '<h4>Frozen source records</h4><div class="impact-source-list">' + sources.map(function (source) { return '<article><a href="' + source[2] + '" target="_blank" rel="noopener">' + esc(source[1]) + '</a><code>' + esc(source[0]) + '</code><p>' + esc(source[3]) + '</p></article>'; }).join('') + '</div>';
    root.querySelector('#impact-status').textContent = 'Results recalculated for the ' + s + ' scenario and ' + state.text.periodLabel + ' reporting period.';
    globalThis.FootprintFeatureTest = Object.freeze({ state: state, collect: collect, add: add, remove: remove });
  }

  function reportSection() {
    const totals = collect();
    return '<h2>6. Expanded activity totals</h2>' +
      '<p>Professional AI is <strong>' + fmt(totals.aiCarbon.central, 'g CO₂e') + '</strong> (scenarios ' + range(totals.aiCarbon, 'g') + '); broader digital activity is <strong>' + fmt(totals.digitalCarbon.central, 'g CO₂e') + '</strong> (scenarios ' + range(totals.digitalCarbon, 'g') + '). The combined central result is <strong>' + fmt(totals.combined.central, 'g CO₂e') + '</strong>. These are documented model scenarios, not confidence intervals or guaranteed extremes.</p>' +
      '<p>The supported partial-water result is <strong>' + fmt(totals.water.central, 'L') + '</strong>. It excludes ' + esc(totals.excludedWater.join(', ') || 'no entered unsupported activity') + '; omitted components are not treated as zero. Carbon and water remain separate.</p>' +
      '<p class="muted">Image generation remains not estimated pending the approved companion measurements. Meetings are whole-meeting totals. Digital-media water, training, and other feature-specific exclusions remain outside the calculation. See the calculator’s frozen source records for versions, boundaries, geography, and limitations.</p>';
  }

  function render() { renderMedia(); renderWorkloads(); renderMeetings(); renderDigital(); renderSummary(); root.querySelectorAll('[data-scenario]').forEach(function (button) { const active = button.dataset.scenario === state.scenario; button.classList.toggle('is-active', active); button.setAttribute('aria-pressed', String(active)); }); }
  function collectionFor(element) { if (element.closest('#media-rows')) return state.media; if (element.closest('#workload-rows')) return state.workloads; if (element.closest('#meeting-rows')) return state.meetings; return state.digital; }
  function add(type) { if (type === 'media') state.media.push(defaultMedia()); if (type === 'workload') state.workloads.push(defaultWorkload()); if (type === 'meeting') state.meetings.push(defaultMeeting()); if (type === 'digital') state.digital.push(defaultDigital()); render(); }
  function remove(element) { const cardElement = element.closest('[data-id]'); if (!cardElement) return; const collection = collectionFor(element); const index = collection.findIndex(function (row) { return row.id === cardElement.dataset.id; }); if (index >= 0) collection.splice(index, 1); render(); }
  function applyExample(name) {
    state.media.length = 0; state.workloads.length = 0; state.meetings.length = 0; state.digital.length = 0; state.scenario = 'central';
    if (name === 'alex') {
      const image = defaultMedia(); image.kind = 'image'; image.count = 24; image.imageModel = 'Other or unknown'; state.media.push(image);
      const video = defaultMedia(); video.count = 3; state.media.push(video);
      const stream = defaultDigital(); stream.name = 'Streaming reference media'; stream.hours = 6; state.digital.push(stream);
      const social = defaultDigital(); social.name = 'Social research'; social.type = 'social'; social.device = 'phone'; social.hours = 4; state.digital.push(social);
    } else if (name === 'jordan') {
      state.workloads.push(defaultWorkload());
      const meeting = defaultMeeting(); meeting.name = 'Project calls'; meeting.count = 4; meeting.attendees = 10; state.meetings.push(meeting);
      const game = defaultDigital(); game.name = 'Desktop cloud gaming'; game.type = 'gaming'; game.device = 'desktop'; game.hours = 5; game.gamingMode = 'cloud'; state.digital.push(game);
    } else if (name === 'robin') {
      const meeting = defaultMeeting(); meeting.name = 'Operations meetings'; meeting.count = 8; meeting.durationMinutes = 45; meeting.attendees = 6; state.meetings.push(meeting);
      const stream = defaultDigital(); stream.name = 'Television streaming'; stream.device = 'television'; stream.hours = 8; state.digital.push(stream);
      const social = defaultDigital(); social.name = 'Social media'; social.type = 'social'; social.device = 'phone'; social.hours = 3; state.digital.push(social);
    }
    render();
  }

  root.addEventListener('click', function (event) {
    const addButton = event.target.closest('[data-add]'); if (addButton) { add(addButton.dataset.add); return; }
    const removeButton = event.target.closest('[data-remove]'); if (removeButton) { remove(removeButton); return; }
    const scenarioButton = event.target.closest('[data-scenario]'); if (scenarioButton) { state.scenario = scenarioButton.dataset.scenario; render(); }
    const exampleButton = event.target.closest('[data-example]'); if (exampleButton) applyExample(exampleButton.dataset.example);
  });
  root.addEventListener('change', function (event) {
    if (event.target.dataset.sensitivity === 'id') { state.sensitivityId = event.target.value; renderSummary(); return; }
    if (event.target.dataset.sensitivity === 'level') { state.sensitivityLevel = event.target.value; renderSummary(); return; }
    const cardElement = event.target.closest('[data-id]');
    if (!cardElement) return;
    const collection = collectionFor(event.target);
    const row = collection.find(function (item) { return item.id === cardElement.dataset.id; });
    if (!row) return;
    if (event.target.matches('[data-preset]') && event.target.value) row.outputTokensPerCall = Number(event.target.value);
    else if (event.target.dataset.field) row[event.target.dataset.field] = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    render();
  });
  document.addEventListener('footprint:text-update', function (event) { state.text = event.detail; render(); });
  document.addEventListener('footprint:reset', function () { state.media.length = 0; state.workloads.length = 0; state.meetings.length = 0; state.digital.length = 0; render(); });

  globalThis.FootprintFeatureReport = reportSection;
  try { const example = new URLSearchParams(location.hash.replace(/^#/, '')).get('demo'); if (example) { applyExample(example); setTimeout(function () { root.scrollIntoView(); }, 0); } }
  catch (_) { /* A malformed fragment should not prevent local calculation. */ }
  render();
})();
