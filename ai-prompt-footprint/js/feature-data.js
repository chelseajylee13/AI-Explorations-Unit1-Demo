(function (global) {
  'use strict';

  // Frozen, browser-ready extracts from EcoLogits 0.11.1. The byte-identical
  // upstream JSON and its hashes remain in data/upstream/ for audit.
  const LLM_MODELS = [
    ['gpt-5.5', 'GPT-5.5', 'openai', 900, 90, 300, 40.4, 3.38],
    ['gpt-5.5-pro', 'GPT-5.5 Pro', 'openai', 5400, 540, 1800, 14.4, 46.04],
    ['gpt-5.4-mini', 'GPT-5.4 mini', 'openai', [56, 158], 56, 158, 73, 0.67],
    ['claude-opus-4-8', 'Claude Opus 4.8', 'anthropic', 670, 67, 200, 58, 1.63],
    ['claude-sonnet-4-6', 'Claude Sonnet 4.6', 'anthropic', 440, 44, 132, 41.4, 1.56],
    ['claude-haiku-4-5-20251001', 'Claude Haiku 4.5', 'anthropic', [10, 35], 10, 35, 71.1, 0.67],
    ['gemini-3.1-pro-preview', 'Gemini 3.1 Pro', 'google_genai', 1200, 120, 360, 73, 4.32],
    ['gemini-3.5-flash', 'Gemini 3.5 Flash', 'google_genai', 900, 90, 240, 130.6, 2.72],
    ['gemini-3.1-flash-lite', 'Gemini 3.1 Flash-Lite', 'google_genai', [30, 105], 30, 105, 115.4, 1.48],
  ].map(function (m) {
    return Object.freeze({ id: m[0], label: m[1], provider: m[2], total: m[3], activeMin: m[4], activeMax: m[5], tps: m[6], ttft: m[7] });
  });

  const PROVIDERS = Object.freeze({
    openai: Object.freeze({ location: 'USA', pue: [1.2, 1.2], wue: [0.569, 0.569] }),
    anthropic: Object.freeze({ location: 'USA', pue: [1.09, 1.14], wue: [0.13, 0.999] }),
    google_genai: Object.freeze({ location: 'USA', pue: [1.09, 1.09], wue: [0.999, 0.999] }),
  });

  const ELECTRICITY_MIXES = Object.freeze({
    USA: Object.freeze({ gwpKgPerKwh: 0.3844, wueLPerKwh: 3.1321 }),
    SGP: Object.freeze({ gwpKgPerKwh: 0.49709, wueLPerKwh: 3.908 }),
    SWE: Object.freeze({ gwpKgPerKwh: 0.03526, wueLPerKwh: 6.0315 }),
    WOR: Object.freeze({ gwpKgPerKwh: 0.45829, wueLPerKwh: 3.908 }),
  });

  const VIDEO_HARDWARE = Object.freeze({
    h800: Object.freeze({ accelerators: 8, powerW: [4894.93, 5974.24], serverGwpKg: 6000, acceleratorGwpKg: 273 }),
    h200: Object.freeze({ accelerators: 8, powerW: [4992.03, 8487.31], serverGwpKg: 6000, acceleratorGwpKg: 364 }),
    singleH200: Object.freeze({ accelerators: 1, powerW: [624.00375, 1060.91375], serverGwpKg: 750, acceleratorGwpKg: 364 }),
    tpuV6e: Object.freeze({ accelerators: 8, powerW: [1074.08, 2352.81], serverGwpKg: 3550, acceleratorGwpKg: 323 }),
  });

  const VIDEO_PROVIDERS = Object.freeze({
    google: Object.freeze({ location: 'USA', pue: [1.09, 1.09], wue: [0.999, 0.999] }),
    openai: Object.freeze({ location: 'USA', pue: [1.2, 1.2], wue: [0.569, 0.569] }),
    klingai: Object.freeze({ location: 'SGP', pue: [1.2, 1.2], wue: [0.5, 0.5] }),
    bytedance: Object.freeze({ location: 'SGP', pue: [1.2, 1.2], wue: [0.5, 0.5] }),
    runway: Object.freeze({ location: 'USA', pue: [1.09, 1.14], wue: [0.13, 0.999] }),
    tencent: Object.freeze({ location: 'SGP', pue: [1.2, 1.2], wue: [0.569, 0.569] }),
    alibaba: Object.freeze({ location: 'SGP', pue: [1.2, 1.2], wue: [0.569, 0.569] }),
    lightricks: Object.freeze({ location: 'USA', pue: [1.09, 1.14], wue: [0.13, 0.999] }),
  });

  // Regression tuple: n, m, m1, m2, n1, n2, g, no-audio multiplier.
  const VIDEO_MODELS = [
    ['klingai/kling-v1.6', 'Kling 1.6', 'klingai', 'h800', [[1280,720]], [5,10], false, [0,.00152,0,0,0,0,0,1]],
    ['klingai/kling-v2.6', 'Kling 2.6', 'klingai', 'h800', [[1280,720]], [5,10], true, [0,.000681,0,0,0,0,0,.5]],
    ['klingai/kling-v3', 'Kling 3', 'klingai', 'h800', [[1280,720]], [4,6,8], true, [0,.000756,0,0,0,0,0,.667]],
    ['bytedance/seedance-1.0', 'Seedance 1.0', 'bytedance', 'h800', [[854,480],[1280,720]], [5,8,10], false, [0,.000102,0,0,.000384,0,20.5,1]],
    ['bytedance/seedance-1.5-pro', 'Seedance 1.5 Pro', 'bytedance', 'h800', [[1280,720],[1920,1080]], [5,8,10], true, [0,0,0,7.2e-12,.0011,0,20.6,.5]],
    ['runway/gen-4.5', 'Runway Gen-4.5', 'runway', 'h200', [[1280,720]], [5,8,10], false, [0,.000824,0,0,0,8.8e-10,0,1]],
    ['lightricks/ltx-2-t2va', 'LTX-2 with audio', 'lightricks', 'singleH200', [[1024,576]], [3,5,8], true, [0,.000135016993574,0,0,0,1.58328656778e-10,4.33302290033,1]],
    ['lightricks/ltx-2-t2v', 'LTX-2', 'lightricks', 'singleH200', [[1024,576]], [3,5,8], false, [0,.00011213863266,0,0,0,1.58328656778e-10,2.42649282418,1]],
    ['tencent/hunyuanvideo', 'HunyuanVideo', 'tencent', 'h200', [[1280,720]], [5,8,10], false, [1.73320916013e-13,.000184153473264,0,0,0,5.19962748039e-9,.119158129759,1]],
    ['tencent/hunyuanvideo-1.5', 'HunyuanVideo 1.5', 'tencent', 'h200', [[1280,720]], [5,8,10], false, [0,.000227483702267,0,0,0,6.49953435049e-9,10.0796945219,1]],
    ['alibaba/wan2.1', 'Wan 2.1', 'alibaba', 'h200', [[1280,720]], [5,8,10], false, [0,.000545960885441,0,0,0,1.13741851134e-8,5.15629725139,1]],
    ['alibaba/wan2.2', 'Wan 2.2', 'alibaba', 'h200', [[1280,720]], [5,8,10], false, [0,.000502630656438,0,0,0,1.16125013729e-8,7.00324826265,1]],
    ['openai/sora-2-pro', 'Sora 2 Pro', 'openai', 'h200', [[1280,720],[1920,1080]], [4,8,12], true, [0,.000427,.663,0,0,7.39e-10,0,1]],
    ['google/veo-3.0', 'Veo 3.0', 'google', 'tpuV6e', [[1280,720],[1920,1080]], [5,8,10], true, [3.31e-14,.000153,0,0,0,0,33.9,.5]],
    ['google/veo-3.0-fast', 'Veo 3.0 Fast', 'google', 'tpuV6e', [[1280,720],[1920,1080]], [4,6,8], true, [3.18e-14,.000139,0,0,0,0,29.6,.667]],
    ['google/veo-3.1', 'Veo 3.1', 'google', 'tpuV6e', [[1280,720],[1920,1080]], [4,6,8], true, [0,.000341,0,0,0,0,24.4,.5]],
    ['google/veo-3.1-fast', 'Veo 3.1 Fast', 'google', 'tpuV6e', [[1280,720],[1920,1080]], [4,6,8], true, [9.6e-14,3.22e-5,0,0,0,0,38.5,.667]],
  ].map(function (m) {
    return Object.freeze({ id: m[0], label: m[1], provider: m[2], hardware: m[3], resolutions: m[4], durations: m[5], audio: m[6], regression: m[7] });
  });

  const IMAGE_MODELS = Object.freeze([
    'Stable Diffusion 1.5', 'Stable Diffusion XL', 'Stable Diffusion XL Turbo',
    'Stable Diffusion XL Lightning', 'Hyper Stable Diffusion', 'Segmind Stable Diffusion 1B',
    'LCM Segmind Stable Diffusion 1B', 'LCM Stable Diffusion XL', 'Flash Stable Diffusion',
    'Flash Stable Diffusion XL', 'PixArt-alpha', 'PixArt-sigma', 'Flash PixArt',
    'Stable Diffusion 3', 'Flash Stable Diffusion 3', 'Lumina-Next-SFT', 'Flux.1 schnell',
  ]);

  const DEVICE_POWER = Object.freeze({ phone: [1,1,1], laptop: [16.9,22,31.5], desktop: [34,222,410], television: [47.5,100,113.6], console: null });
  const MEETING_G_PER_ENDPOINT_HOUR = Object.freeze({ laptop: 55, desktop: 90, room: 295 });
  const STREAMING = Object.freeze({ infrastructureCarbonGPerHour: 27.5, routerWhPerHour: 71, peripheralWatts: Object.freeze({ none: 0, console: 89, settop: 18 }) });
  const SOCIAL = Object.freeze({
    trafficGbPerHour: Object.freeze([0.09, 0.3092, 0.84]),
    cpeKwhPerHour: Object.freeze([0.004, 0.007, 0.01]),
    accessKwhPerHour: Object.freeze([0.00224, 0.0028, 0.00336]),
    coreAccessKwhPerGb: Object.freeze([0.0063780651422208, 0.00885842380864, 0.010187187379936]),
    coreDatacenterKwhPerGb: Object.freeze([0.0063780651422208, 0.00885842380864, 0.010187187379936]),
    datacenterKwhPerGb: Object.freeze([0.0290003159, 0.0413912704, 0.0517390879]),
    infrastructureGridGPerKwh: 458.29,
  });
  const CLOUD_GAMING = Object.freeze({ pc: Object.freeze({ datacenterW: 340, networkW: 180 }), console: Object.freeze({ datacenterW: 180, networkW: 120 }), sourceGridGPerKwh: 710 });

  // Auditable coefficient-group records. Values used at runtime remain above;
  // these records keep their provenance, boundaries, and limitations together.
  const SOURCE_RECORDS = Object.freeze([
    Object.freeze({ id: 'ecologits-llm-models-0.11.1', value: 'LLM_MODELS + PROVIDERS', unit: 'model parameters and infrastructure factors', boundary: 'request inference energy, usage carbon/water, allocated hardware carbon', title: 'EcoLogits 0.11.1 LLM inference data and method', link: 'https://github.com/mlco2/ecologits/releases/tag/0.11.1', publicationDate: '2026-07-07', version: '0.11.1 / commit 886d1ebfadb51a2d6407fcea6d9778c997c85c35', geography: 'provider default, primarily USA', scenarioRole: 'lower/upper model and infrastructure combinations; central midpoint', derivation: 'Browser port of the pinned EcoLogits request equations', evidence: 'Moderate', limitation: 'Input/context processing, networking, storage, training, and embodied water are excluded; proprietary architecture and deployment may be assumed.' }),
    Object.freeze({ id: 'ecologits-video-models-0.11.1', value: 'VIDEO_MODELS + VIDEO_HARDWARE + VIDEO_PROVIDERS', unit: 'latency regressions, watts, PUE, WUE, embodied kg CO2e', boundary: 'video request electricity, usage carbon/water, allocated hardware carbon', title: 'EcoLogits 0.11.1 video generation data and method', link: 'https://ecologits.ai/latest/methodology/video_generation/', publicationDate: '2026-07-07', version: '0.11.1 / commit 886d1ebfadb51a2d6407fcea6d9778c997c85c35', geography: 'USA or Singapore provider default', scenarioRole: 'correlated compatible model/infrastructure envelope', derivation: '24 fps frames and pinned model-specific latency regressions', evidence: 'Moderate', limitation: 'Proprietary values may be extrapolated; whole assigned machine is attributed to a request; embodied water is unavailable.' }),
    Object.freeze({ id: 'bertazzini-image-energy-2025-pending', value: null, unit: 'kWh/image', boundary: 'open-model workstation electricity', title: 'The Hidden Cost of an Image', link: 'https://arxiv.org/abs/2506.17016', publicationDate: '2025-06-20', version: 'arXiv:2506.17016 source package reviewed 2026-09-21', geography: 'single RTX 4090 workstation experiment', scenarioRole: 'pending; never converted to zero', derivation: 'No coefficient stored because the required per-model/per-resolution table was unavailable', evidence: 'Limited', limitation: 'Image electricity, carbon, and water remain Not estimated until companion measurements are obtained.' }),
    Object.freeze({ id: 'uba-green-cloud-video-meeting-2021', value: Object.freeze({ laptop: 55, desktopMonitor: 90, sharedRoom: 295 }), unit: 'g CO2e/endpoint-hour', boundary: 'allocated data center, network, router, endpoint manufacture and operation', title: 'German Environment Agency Green Cloud Computing case study', link: 'https://www.umweltbundesamt.de/en/topics/digitalisation/green-it/digital-services-cloud-computing', publicationDate: '2021-06-17', version: '2021 report', geography: 'Germany', scenarioRole: 'device alternatives or fixed detailed benchmark', derivation: 'Published endpoint-hour benchmark coefficients', evidence: 'Moderate', limitation: 'Uses older German electricity, VDSL network, lifetime, and device assumptions; water boundary is incompatible.' }),
    Object.freeze({ id: 'carbon-trust-streaming-2021', value: Object.freeze({ infrastructureCarbonGPerHour: 27.5, phoneW: 1, laptopW: 22, desktopMonitorW: 115, televisionW: 100 }), unit: 'g CO2e/hour and active watts', boundary: 'allocated data center/CDN, network, router plus substituted local device operation', title: 'Carbon impact of video streaming', link: 'https://www.carbontrust.com/sites/default/files/documents/resource/public/Carbon-impact-of-video-streaming.pdf', publicationDate: '2021-06-11', version: '2021 white paper', geography: 'representative Europe; employee grid for substituted local components', scenarioRole: 'central power allocation; resolution retained only as sensitivity metadata', derivation: 'Source component table with local device substitution', evidence: 'Moderate', limitation: 'Operational electricity only; central network power is not proportional to an individual viewer’s traffic.' }),
    Object.freeze({ id: 'istrate-internet-6743642', value: SOCIAL, unit: 'kWh/hour, kWh/GB, GB/hour, g CO2e/kWh', boundary: 'generic social-use local operation and source infrastructure', title: 'Internet-use environmental footprints open model', link: 'https://github.com/robyistrate/internet-environmental-footprint/tree/67436426ae321c0f290081633a66ed355064ec27', publicationDate: '2024-04-25', version: 'commit 67436426ae321c0f290081633a66ed355064ec27', geography: 'source global/electricity assumptions; employee grid for local device', scenarioRole: 'low/central/high source sensitivity fields', derivation: 'Locally extracted reviewable workbook fields', evidence: 'Moderate', limitation: 'Generic time-based use, not measured platform or employee traffic; compatible embodied results require a separately licensed LCA database.' }),
    Object.freeze({ id: 'mills-gaming-2019', value: Object.freeze({ devicePower: DEVICE_POWER, cloudGaming: CLOUD_GAMING }), unit: 'active watts and g CO2e/kWh', boundary: 'local client/display operation plus cloud data center/network when selected', title: 'Toward Greener Gaming', link: 'https://doi.org/10.1007/s40869-019-00084-2', publicationDate: '2019-11-18', version: '2019 published study', geography: 'measured US hardware; source remote electricity assumptions', scenarioRole: 'hardware category low/median/high and source cloud scenario', derivation: 'Category observations and separately modeled cloud infrastructure', evidence: 'Moderate', limitation: 'No title-specific precision; product manufacture, water, idle time, and newer hardware are excluded.' }),
  ]);

  global.FootprintFeatureData = Object.freeze({
    LLM_MODELS, PROVIDERS, ELECTRICITY_MIXES, VIDEO_HARDWARE, VIDEO_PROVIDERS,
    VIDEO_MODELS, IMAGE_MODELS, DEVICE_POWER, MEETING_G_PER_ENDPOINT_HOUR,
    STREAMING, SOCIAL, CLOUD_GAMING, SOURCE_RECORDS,
  });
})(globalThis);
