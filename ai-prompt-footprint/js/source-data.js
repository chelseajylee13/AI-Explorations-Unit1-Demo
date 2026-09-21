// ---- Data: per-prompt model impacts from EcoLogits v0.10 (mean + 95% range) ----
const MODELS = [{"id":"gpt-5.5","name":"GPT-5.5","group":"OpenAI","sizes":{"tweet":{"wh":0.4064,"whmin":0.2917,"whmax":0.5212,"emb":0.0241,"embmin":0.0241,"embmax":0.0241,"ml":1.4658,"mlmin":1.0518,"mlmax":1.8797},"email":{"wh":1.1791,"whmin":0.7888,"whmax":1.5694,"emb":0.0395,"embmin":0.0395,"embmax":0.0395,"ml":4.2522,"mlmin":2.8447,"mlmax":5.6597},"summary":{"wh":1.6942,"whmin":1.1203,"whmax":2.2682,"emb":0.0498,"embmin":0.0498,"embmax":0.0498,"ml":6.1098,"mlmin":4.0399,"mlmax":8.1797},"chat":{"wh":2.6601,"whmin":1.7417,"whmax":3.5784,"emb":0.0692,"embmin":0.0692,"embmax":0.0692,"ml":9.5929,"mlmin":6.2811,"mlmax":12.9047},"report":{"wh":32.279,"whmin":20.7997,"whmax":43.7584,"emb":0.6622,"embmin":0.6622,"embmax":0.6622,"ml":116.4068,"mlmin":75.0091,"mlmax":157.8045},"long":{"wh":96.6681,"whmin":62.23,"whmax":131.1063,"emb":1.9514,"embmin":1.9514,"embmax":1.9514,"ml":348.611,"mlmin":224.4178,"mlmax":472.8041},"agent":{"wh":644.1723,"whmin":414.5847,"whmax":873.76,"emb":12.9507,"embmin":12.9507,"embmax":12.9507,"ml":2323.0577,"mlmin":1495.103,"mlmax":3151.012},"novel":{"wh":3219.5382,"whmin":2071.5998,"whmax":4367.4766,"emb":64.4772,"embmin":64.4772,"embmax":64.4772,"ml":11610.5134,"mlmin":7470.7415,"mlmax":15750.2854}}},{"id":"gpt-5.5-pro","name":"GPT-5.5 Pro","group":"OpenAI","sizes":{"tweet":{"wh":20.758,"whmin":15.2479,"whmax":26.2681,"emb":2.063,"embmin":2.063,"embmax":2.063,"ml":74.859,"mlmin":54.9881,"mlmax":94.7299},"email":{"wh":48.4781,"whmin":29.7437,"whmax":67.2124,"emb":2.4102,"embmin":2.4102,"embmax":2.4102,"ml":174.8249,"mlmin":107.2638,"mlmax":242.386},"summary":{"wh":66.9581,"whmin":39.4076,"whmax":94.5086,"emb":2.6417,"embmin":2.6417,"embmax":2.6417,"ml":241.4689,"mlmin":142.1143,"mlmax":340.8234},"chat":{"wh":101.6082,"whmin":57.5274,"whmax":145.689,"emb":3.0757,"embmin":3.0757,"embmax":3.0757,"ml":366.4263,"mlmin":207.459,"mlmax":525.3935},"report":{"wh":1164.2105,"whmin":613.2001,"whmax":1715.2209,"emb":16.3859,"embmin":16.3859,"embmax":16.3859,"ml":4198.4535,"mlmin":2211.363,"mlmax":6185.5441},"long":{"wh":3474.2155,"whmin":1821.1842,"whmax":5127.2468,"emb":45.3211,"embmin":45.3211,"embmax":45.3211,"ml":12528.9476,"mlmin":6567.676,"mlmax":18490.2193},"agent":{"wh":23130.7433,"whmin":12110.535,"whmax":34150.952,"emb":295.7463,"embmin":295.7463,"embmax":295.7463,"ml":83415.629,"mlmin":43673.818,"mlmax":123157.44},"novel":{"wh":115509.4586,"whmin":60408.4155,"whmax":170610.5016,"emb":1448.6776,"embmin":1448.6776,"embmax":1448.6776,"ml":416557.9101,"mlmin":217848.8553,"mlmax":615266.9648}}},{"id":"gpt-5.4-mini","name":"GPT-5.4 mini","group":"OpenAI","sizes":{"tweet":{"wh":0.041,"whmin":0.0108,"whmax":0.0711,"emb":0.0011,"embmin":0.0004,"embmax":0.0018,"ml":0.1477,"mlmin":0.039,"mlmax":0.2564},"email":{"wh":0.133,"whmin":0.0342,"whmax":0.2317,"emb":0.0024,"embmin":0.001,"embmax":0.0039,"ml":0.4795,"mlmin":0.1234,"mlmax":0.8356},"summary":{"wh":0.1943,"whmin":0.0498,"whmax":0.3388,"emb":0.0033,"embmin":0.0013,"embmax":0.0053,"ml":0.7008,"mlmin":0.1798,"mlmax":1.2217},"chat":{"wh":0.3093,"whmin":0.0791,"whmax":0.5395,"emb":0.005,"embmin":0.002,"embmax":0.008,"ml":1.1155,"mlmin":0.2854,"mlmax":1.9457},"report":{"wh":3.8366,"whmin":0.9771,"whmax":6.6961,"emb":0.0563,"embmin":0.0225,"embmax":0.0901,"ml":13.8358,"mlmin":3.5236,"mlmax":24.148},"long":{"wh":11.5045,"whmin":2.9291,"whmax":20.08,"emb":0.1678,"embmin":0.0671,"embmax":0.2684,"ml":41.4884,"mlmin":10.5631,"mlmax":72.4137},"agent":{"wh":76.688,"whmin":19.524,"whmax":133.8523,"emb":1.1167,"embmin":0.4467,"embmax":1.7867,"ml":276.558,"mlmin":70.4083,"mlmax":482.7073},"novel":{"wh":383.3997,"whmin":97.6029,"whmax":669.1964,"emb":5.5745,"embmin":2.2298,"embmax":8.9193,"ml":1382.6414,"mlmin":351.9819,"mlmax":2413.3008}}},{"id":"claude-opus-4-8","name":"Claude Opus 4.8","group":"Anthropic","sizes":{"tweet":{"wh":0.2673,"whmin":0.1938,"whmax":0.3408,"emb":0.013,"embmin":0.013,"embmax":0.013,"ml":0.9982,"mlmin":0.6301,"mlmax":1.3662},"email":{"wh":0.818,"whmin":0.5701,"whmax":1.0659,"emb":0.0238,"embmin":0.0238,"embmax":0.0238,"ml":3.0632,"mlmin":1.8537,"mlmax":4.2727},"summary":{"wh":1.1852,"whmin":0.821,"whmax":1.5493,"emb":0.0309,"embmin":0.0309,"embmax":0.0309,"ml":4.4398,"mlmin":2.6693,"mlmax":6.2103},"chat":{"wh":1.8735,"whmin":1.2914,"whmax":2.4557,"emb":0.0444,"embmin":0.0444,"embmax":0.0444,"ml":7.0211,"mlmin":4.1987,"mlmax":9.8434},"report":{"wh":22.9837,"whmin":15.7164,"whmax":30.2509,"emb":0.4575,"embmin":0.4575,"embmax":0.4575,"ml":86.179,"mlmin":51.0998,"mlmax":121.2581},"long":{"wh":68.8752,"whmin":47.0752,"whmax":90.6752,"emb":1.3555,"embmin":1.3555,"embmax":1.3555,"ml":258.2614,"mlmin":153.0588,"mlmax":363.464},"agent":{"wh":459.042,"whmin":313.7117,"whmax":604.3727,"emb":9.0083,"embmin":9.0083,"embmax":9.0083,"ml":1721.2837,"mlmin":1019.991,"mlmax":2422.5763},"novel":{"wh":2294.617,"whmin":1567.9779,"whmax":3021.256,"emb":44.9079,"embmin":44.9079,"embmax":44.9079,"ml":8604.2603,"mlmin":5098.0702,"mlmax":12110.4504}}},{"id":"claude-sonnet-4-6","name":"Claude Sonnet 4.6","group":"Anthropic","sizes":{"tweet":{"wh":0.1135,"whmin":0.0886,"whmax":0.1384,"emb":0.0072,"embmin":0.0072,"embmax":0.0072,"ml":0.4214,"mlmin":0.2881,"mlmax":0.5547},"email":{"wh":0.3424,"whmin":0.2588,"whmax":0.426,"emb":0.0148,"embmin":0.0148,"embmax":0.0148,"ml":1.2745,"mlmin":0.8414,"mlmax":1.7077},"summary":{"wh":0.495,"whmin":0.3722,"whmax":0.6178,"emb":0.0198,"embmin":0.0198,"embmax":0.0198,"ml":1.8433,"mlmin":1.2102,"mlmax":2.4764},"chat":{"wh":0.7811,"whmin":0.5849,"whmax":0.9773,"emb":0.0292,"embmin":0.0292,"embmax":0.0292,"ml":2.9097,"mlmin":1.9018,"mlmax":3.9176},"report":{"wh":9.5558,"whmin":7.1079,"whmax":12.0038,"emb":0.3186,"embmin":0.3186,"embmax":0.3186,"ml":35.6133,"mlmin":23.1103,"mlmax":48.1162},"long":{"wh":28.6313,"whmin":21.2882,"whmax":35.9744,"emb":0.9476,"embmin":0.9476,"embmax":0.9476,"ml":106.708,"mlmin":69.2157,"mlmax":144.2002},"agent":{"wh":190.8147,"whmin":141.8623,"whmax":239.7673,"emb":6.3037,"embmin":6.3037,"embmax":6.3037,"ml":711.1667,"mlmin":461.246,"mlmax":961.0873},"novel":{"wh":953.79,"whmin":709.0334,"whmax":1198.5467,"emb":31.4554,"embmin":31.4554,"embmax":31.4554,"ml":3554.8002,"mlmin":2305.3271,"mlmax":4804.2734}}},{"id":"claude-haiku-4-5-20251001","name":"Claude Haiku 4.5","group":"Anthropic","sizes":{"tweet":{"wh":0.0062,"whmin":0.0035,"whmax":0.0089,"emb":0.0003,"embmin":0.0002,"embmax":0.0004,"ml":0.0236,"mlmin":0.0114,"mlmax":0.0358},"email":{"wh":0.0194,"whmin":0.0107,"whmax":0.028,"emb":0.0007,"embmin":0.0005,"embmax":0.001,"ml":0.0735,"mlmin":0.0349,"mlmax":0.1121},"summary":{"wh":0.0281,"whmin":0.0156,"whmax":0.0407,"emb":0.001,"embmin":0.0007,"embmax":0.0014,"ml":0.1068,"mlmin":0.0506,"mlmax":0.163},"chat":{"wh":0.0446,"whmin":0.0246,"whmax":0.0645,"emb":0.0015,"embmin":0.001,"embmax":0.002,"ml":0.1693,"mlmin":0.0801,"mlmax":0.2585},"report":{"wh":0.5485,"whmin":0.3023,"whmax":0.7946,"emb":0.0173,"embmin":0.0116,"embmax":0.0231,"ml":2.084,"mlmin":0.9829,"mlmax":3.1851},"long":{"wh":1.6439,"whmin":0.9059,"whmax":2.3818,"emb":0.0517,"embmin":0.0344,"embmax":0.0689,"ml":6.2465,"mlmin":2.9455,"mlmax":9.5474},"agent":{"wh":10.9567,"whmin":6.038,"whmax":15.8757,"emb":0.344,"embmin":0.2293,"embmax":0.4587,"ml":41.634,"mlmin":19.6317,"mlmax":63.6363},"novel":{"wh":54.7726,"whmin":30.1826,"whmax":79.3626,"emb":1.717,"embmin":1.1447,"embmax":2.2894,"ml":208.1266,"mlmin":98.1348,"mlmax":318.1184}}},{"id":"gemini-3.1-pro-preview","name":"Gemini 3.1 Pro","group":"Google","sizes":{"tweet":{"wh":0.8453,"whmin":0.607,"whmax":1.0837,"emb":0.0521,"embmin":0.0521,"embmax":0.0521,"ml":3.4225,"mlmin":2.4575,"mlmax":4.3874},"email":{"wh":2.4033,"whmin":1.5929,"whmax":3.2136,"emb":0.0693,"embmin":0.0693,"embmax":0.0693,"ml":9.73,"mlmin":6.4492,"mlmax":13.0107},"summary":{"wh":3.4419,"whmin":2.2502,"whmax":4.6336,"emb":0.0807,"embmin":0.0807,"embmax":0.0807,"ml":13.9349,"mlmin":9.1103,"mlmax":18.7596},"chat":{"wh":5.3893,"whmin":3.4827,"whmax":7.296,"emb":0.1021,"embmin":0.1021,"embmax":0.1021,"ml":21.8193,"mlmin":14.0999,"mlmax":29.5387},"report":{"wh":65.1103,"whmin":41.2769,"whmax":88.9437,"emb":0.7585,"embmin":0.7585,"embmax":0.7585,"ml":263.6065,"mlmin":167.1144,"mlmax":360.0987},"long":{"wh":194.9386,"whmin":123.4384,"whmax":266.4387,"emb":2.1854,"embmin":2.1854,"embmax":2.1854,"ml":789.2309,"mlmin":499.7544,"mlmax":1078.7075},"agent":{"wh":1298.9363,"whmin":822.2687,"whmax":1775.604,"emb":14.4193,"embmin":14.4193,"embmax":14.4193,"ml":5258.8917,"mlmin":3329.048,"mlmax":7188.7353},"novel":{"wh":6491.6081,"whmin":4108.2694,"whmax":8874.9469,"emb":71.392,"embmin":71.392,"embmax":71.392,"ml":26282.014,"mlmin":16632.7959,"mlmax":35931.2321}}},{"id":"gemini-3.5-flash","name":"Gemini 3.5 Flash","group":"Google","sizes":{"tweet":{"wh":0.305,"whmin":0.2305,"whmax":0.3795,"emb":0.0162,"embmin":0.0162,"embmax":0.0162,"ml":1.2348,"mlmin":0.9333,"mlmax":1.5364},"email":{"wh":0.8888,"whmin":0.6355,"whmax":1.142,"emb":0.0209,"embmin":0.0209,"embmax":0.0209,"ml":3.5982,"mlmin":2.573,"mlmax":4.6234},"summary":{"wh":1.2779,"whmin":0.9055,"whmax":1.6503,"emb":0.0241,"embmin":0.0241,"embmax":0.0241,"ml":5.1738,"mlmin":3.6661,"mlmax":6.6815},"chat":{"wh":2.0076,"whmin":1.4118,"whmax":2.6035,"emb":0.0301,"embmin":0.0301,"embmax":0.0301,"ml":8.1281,"mlmin":5.7158,"mlmax":10.5404},"report":{"wh":24.3849,"whmin":16.937,"whmax":31.8328,"emb":0.2136,"embmin":0.2136,"embmax":0.2136,"ml":98.7251,"mlmin":68.5713,"mlmax":128.8789},"long":{"wh":73.0312,"whmin":50.6874,"whmax":95.375,"emb":0.6124,"embmin":0.6124,"embmax":0.6124,"ml":295.6751,"mlmin":205.2137,"mlmax":386.1366},"agent":{"wh":486.6687,"whmin":337.71,"whmax":635.6273,"emb":4.0353,"embmin":4.0353,"embmax":4.0353,"ml":1970.334,"mlmin":1367.258,"mlmax":2573.41},"novel":{"wh":2432.3763,"whmin":1687.583,"whmax":3177.1697,"emb":19.9542,"embmin":19.9542,"embmax":19.9542,"ml":9847.7523,"mlmin":6832.3716,"mlmax":12863.1329}}},{"id":"gemini-3.1-flash-lite","name":"Gemini 3.1 Flash-Lite","group":"Google","sizes":{"tweet":{"wh":0.0159,"whmin":0.0045,"whmax":0.0273,"emb":0.0008,"embmin":0.0003,"embmax":0.0012,"ml":0.0644,"mlmin":0.0182,"mlmax":0.1105},"email":{"wh":0.0478,"whmin":0.0128,"whmax":0.0827,"emb":0.0012,"embmin":0.0005,"embmax":0.0019,"ml":0.1933,"mlmin":0.0517,"mlmax":0.335},"summary":{"wh":0.069,"whmin":0.0183,"whmax":0.1197,"emb":0.0015,"embmin":0.0006,"embmax":0.0024,"ml":0.2793,"mlmin":0.074,"mlmax":0.4846},"chat":{"wh":0.1088,"whmin":0.0286,"whmax":0.189,"emb":0.002,"embmin":0.0008,"embmax":0.0032,"ml":0.4405,"mlmin":0.1159,"mlmax":0.7652},"report":{"wh":1.3299,"whmin":0.3458,"whmax":2.3141,"emb":0.0182,"embmin":0.0073,"embmax":0.0292,"ml":5.3844,"mlmin":1.3999,"mlmax":9.369},"long":{"wh":3.9846,"whmin":1.0352,"whmax":6.9339,"emb":0.0535,"embmin":0.0214,"embmax":0.0856,"ml":16.1321,"mlmin":4.1913,"mlmax":28.0729},"agent":{"wh":26.5553,"whmin":6.898,"whmax":46.2123,"emb":0.3547,"embmin":0.142,"embmax":0.5673,"ml":107.5117,"mlmin":27.9277,"mlmax":187.0957},"novel":{"wh":132.7348,"whmin":34.4741,"whmax":230.9956,"emb":1.7636,"embmin":0.7054,"embmax":2.8218,"ml":537.3921,"mlmin":139.5723,"mlmax":935.2119}}}];

const SIZES = [
  { id: 'tweet',   label: 'A tweet',                 words: '40 words',      w: 38 },
  { id: 'email',   label: 'A short email',           words: '130 words',     w: 128 },
  { id: 'summary', label: 'An article summary',      words: '190 words',     w: 188 },
  { id: 'chat',    label: 'A chatbot reply',         words: '300 words',     w: 300 },
  { id: 'report',  label: 'A 5-page report',         words: '3,800 words',   w: 3750 },
  { id: 'long',    label: 'A long document',         words: '11,000 words',  w: 11250 },
  { id: 'agent',   label: 'A coding / agent session', words: '~100,000 tokens', w: 75000 }, // EcoLogits' 100k-token "assist application development" benchmark
  { id: 'novel',   label: 'Re-write the Lord of the Rings trilogy', words: '~480,000 words', w: 480000 },
];
const SIZE_LABEL_OVERRIDES = { 'gpt-5.5-pro': { agent: 'A very long answer' } };
function sizeLabel(modelId, s) {
  const o = SIZE_LABEL_OVERRIDES[modelId];
  return (o && o[s.id]) ? o[s.id] : s.label;
}
const WPM = 238;
const TOKENS_PER_WORD = 0.75;
const TOKENS_PER_LINE = 10;   // rough tokens per line of code
const CODE_FRACTION = 0.15;   // only ~15% of an agent session's output is final code; the rest is reasoning, tool calls, file exploration, and explanation (wide uncertainty)

const DEFAULT_ROWS = [
  ['gpt-5.5', 'chat', 15],
  ['claude-sonnet-4-6', 'chat', 8],
  ['gemini-3.5-flash', 'summary', 4],
];

// Usage presets: one-click row sets for the "quick-fill" buttons.
const PRESETS = [
  { label: 'Light user', rows: [['gpt-5.5', 'chat', 3]] },
  { label: 'Average user', rows: [['gpt-5.5', 'chat', 15], ['claude-sonnet-4-6', 'chat', 8], ['gemini-3.5-flash', 'summary', 4]] },
  { label: 'Power user', rows: [['gpt-5.5', 'chat', 40], ['claude-opus-4-8', 'report', 5], ['gemini-3.1-pro-preview', 'summary', 10]] },
  { label: 'Heavy coder', rows: [['claude-opus-4-8', 'agent', 6], ['gpt-5.5', 'chat', 10]] },
];

// Impact-badge thresholds: % of your own daily footprint that your AI use adds.
function impactBand(pct) {
  if (pct < 1) return { cls: 'low', emoji: '🟢', label: 'Low' };
  if (pct < 5) return { cls: 'moderate', emoji: '🟡', label: 'Moderate' };
  if (pct < 15) return { cls: 'high', emoji: '🟠', label: 'High' };
  return { cls: 'veryhigh', emoji: '🔴', label: 'Very high' };
}

const WORLD_GRID = 480; // global-average grid carbon intensity, g CO2e/kWh (Ember)
// location = regional baseline for goods, services, shared infrastructure
// (home energy and driving are separate knobs below, so they are excluded here)
// w = BLUE water footprint per capita (freshwater from rivers/lakes/aquifers),
// gal/yr; green rainwater excluded. The full blue footprint sits on "location";
// home/diet water are folded in (set to 0) to avoid double-counting.
const LOCATIONS = [
  { id: 'us',    label: 'the US',    c: 3000, w: 119000, grid: 380 },
  { id: 'eu',    label: 'the EU',    c: 1800, w: 66000,  grid: 215 },
  { id: 'uk',    label: 'the UK',    c: 1700, w: 45000,  grid: 125 },
  { id: 'cn',    label: 'China',     c: 2500, w: 79000,  grid: 580 },
  { id: 'in',    label: 'India',     c: 900,  w: 106000, grid: 700 },
  { id: 'world', label: 'the world', c: 1800, w: 40000,  grid: WORLD_GRID },
];
const HOMES = [
  { id: 'apt', label: 'a small apartment', c: 1500, w: 0 },
  { id: 'med', label: 'a medium home',     c: 3500, w: 0 },
  { id: 'big', label: 'a big house',       c: 7000, w: 0 },
];
const DRIVING = [
  { id: 'd0',   label: 'not at all',        c: 0,     w: 0 },
  { id: 'dlo',  label: 'a little',          c: 1200,  w: 0 },
  { id: 'davg', label: 'an average amount', c: 4800,  w: 0 },
  { id: 'dhi',  label: 'a lot',             c: 10000, w: 0 },
];
// Diet water (w) set to 0: on a blue-water basis the personal footprint is
// dominated by irrigated agriculture and counted in the regional figure above.
const DIETS = [
  { id: 'heavy', label: 'a lot of meat',   c: 3200, w: 0 },
  { id: 'avg',   label: 'an average diet', c: 2500, w: 0 },
  { id: 'light', label: 'little meat',     c: 2000, w: 0 },
  { id: 'pesc',  label: 'a pescatarian diet', c: 1700, w: 0 },
  { id: 'veg',   label: 'a vegetarian diet',  c: 1500, w: 0 },
  { id: 'vegan', label: 'a vegan diet',    c: 1050, w: 0 },
];
const FLYING = [
  { id: 'never', label: 'never',     c: 0,    w: 0 },
  { id: 'rare',  label: 'rarely',    c: 560,  w: 0 },
  { id: 'some',  label: 'sometimes', c: 2300, w: 0 },
  { id: 'often', label: 'often',     c: 8000, w: 0 },
];
// Typical diet by region; the diet default follows the country you pick.
const COUNTRY_DIET = { us: 'avg', eu: 'light', uk: 'avg', cn: 'light', in: 'light', world: 'light' };

// Sources cited in the generated report (footnote order).
const REPORT_REFS = [
  { url: 'https://ecologits.ai/', label: 'EcoLogits (v0.10) — per-prompt energy, carbon, and water for each model, behind the EcoLogits calculator.' },
  { url: 'https://ember-energy.org/latest-insights/global-electricity-review-2024/', label: 'Ember, Global Electricity Review 2024, with Our World in Data — grid carbon intensity by region, used to cost the electricity.' },
  { url: 'https://ourworldindata.org/co2-emissions', label: 'Our World in Data — consumption-based emissions, used for the regional baseline.' },
  { url: 'https://www.eia.gov/consumption/residential/', label: 'US EIA Residential Energy Consumption Survey, with Goldstein et al. 2020 (PNAS) — home energy.' },
  { url: 'https://www.epa.gov/greenvehicles/greenhouse-gas-emissions-typical-passenger-vehicle', label: 'US EPA (~400 g CO2 per vehicle-mile) and FHWA (annual mileage) — driving.' },
  { url: 'https://www.science.org/doi/10.1126/science.aaq0216', label: 'Poore & Nemecek 2018 (Science) and Scarborough et al. 2023 (Nature Food) — diet footprints.' },
  { url: 'https://iopscience.iop.org/article/10.1088/1748-9326/aa7541', label: 'Wynes & Nicholas 2017 — flights and lifestyle cuts.' },
  { url: 'https://iopscience.iop.org/article/10.1088/1748-9326/ab8589', label: 'Ivanova et al. 2020 — housing and transport mitigation options.' },
  { url: 'https://www.founderspledge.com/research/climate-and-lifestyle-report', label: 'Founders Pledge, Climate & Lifestyle report — the lifestyle-cut comparison.' },
  { url: 'https://www.waterfootprint.org/', label: 'Water Footprint Network (Mekonnen & Hoekstra) and the Water Footprint Calculator — water-consumption figures and the personal water footprint.' },
];

// Daily reference points (all things that emit, so no add/save direction)
const DAILY_ITEMS = [
  { label: 'A cup of coffee',          c: 0.21, w: 37 },
  { label: 'An hour on a PS5',         c: 0.08, w: 0.1 },
  { label: '3 minutes in the microwave', c: 0.02, w: 0.05 },
  { label: 'A mile in a gas car',      c: 0.40, w: 0.1 },
  { label: 'A 10-minute hot shower',   c: 0.7,  w: 21 },
  { label: 'A dishwasher load',        c: 0.5,  w: 3.5 },
  { label: 'A dryer load',             c: 1.2,  w: 0.1 },
  { label: 'Printing a 400-page book', c: 2.7,  w: 300 },
  { label: 'A beef burger',            c: 3.0,  w: 460 },
];
// Annual reference points. dir: 'add' = emissions you cause, 'save' = a cut you make.
// Lifestyle-cut figures from Founders Pledge / Wynes & Nicholas via AndyMasley.Substack.com.
const ANNUAL_ITEMS = [
  { label: 'A cotton T-shirt',                c: 7,    w: 0,      dir: 'add' },
  { label: 'A new pair of jeans',             c: 33,   w: 2640,   dir: 'add' },
  { label: 'A new smartphone',                c: 70,   w: 3370,   dir: 'add' },
  { label: 'A year of daily coffee',          c: 77,   w: 0,      dir: 'add' },
  { label: 'A new sofa',                      c: 90,   w: 0,      dir: 'add' },
  { label: 'A new bicycle',                   c: 100,  w: 0,      dir: 'add' },
  { label: 'A beef burger every week (1 yr)', c: 156,  w: 0,      dir: 'add' },
  { label: 'A new laptop',                    c: 250,  w: 0,      dir: 'add' },
  { label: 'A short-haul round-trip flight',  c: 250,  w: 0,      dir: 'add' },
  { label: 'A new flat-screen TV',            c: 350,  w: 0,      dir: 'add' },
  { label: 'A round-trip US cross-country flight', c: 1000, w: 0, dir: 'add' },
  { label: 'One transatlantic flight',        c: 1600, w: 5,      dir: 'add' },
  { label: 'A year of driving (12,000 mi)',   c: 4800, w: 50,     dir: 'add' },
  { label: 'Manufacturing a new car',         c: 6000, w: 0,      dir: 'add' },
  { label: 'Buying LED bulbs',                c: 30,   w: 0,      dir: 'save' },
  { label: 'Recycling for a year',            c: 140,  w: 0,      dir: 'save' },
  { label: 'Hang-drying your clothes',        c: 140,  w: 0,      dir: 'save' },
  { label: 'Switching to a hybrid car',       c: 480,  w: 0,      dir: 'save' },
  { label: 'Buying green electricity',        c: 1380, w: 0,      dir: 'save' },
  { label: 'Switching to an electric car',    c: 1380, w: 0,      dir: 'save' },
  { label: 'Going vegan for a year',          c: 1450, w: 270000, dir: 'save' },
  { label: 'A deep retrofit of your home',    c: 1580, w: 0,      dir: 'save' },
  { label: 'Switching to green heating',      c: 1990, w: 0,      dir: 'save' },
  { label: 'Living car-free',                 c: 2400, w: 0,      dir: 'save' },
];

// Blue-water comparisons (gal): freshwater actually withdrawn, green rain excluded.
// Irrigated crops (almonds, cotton) and lawns dominate; rain-fed foods nearly vanish.
const DAILY_WATER_ITEMS = [
  { label: 'A cup of coffee',        w: 1 },
  { label: 'A beef burger',          w: 1.6 },
  { label: 'A slice of bread',       w: 2 },
  { label: 'An egg',                 w: 4 },
  { label: 'A glass of milk',        w: 6 },
  { label: 'A bowl of rice',         w: 7 },
  { label: 'An hour of air conditioning', w: 1.4 },
  { label: 'Printing a book',        w: 5 },
  { label: 'A day of home electricity',   w: 14 },
  { label: 'An avocado',             w: 16 },
  { label: 'A handful of almonds',   w: 32 },
];
const ANNUAL_WATER_ITEMS = [
  { label: 'A year of daily coffee',           w: 365,    dir: 'add' },
  { label: 'A cotton T-shirt',                 w: 396,    dir: 'add' },
  { label: 'A new pair of jeans',              w: 1321,   dir: 'add' },
  { label: 'A new smartphone',                 w: 3370,   dir: 'add' },
  { label: 'A year of daily almonds',          w: 11700,  dir: 'add' },
  { label: 'Buying five fewer cotton garments (1 yr)', w: 2000, dir: 'save' },
  { label: 'Replacing a lawn with native plants', w: 15000, dir: 'save' },
  { label: 'Letting your lawn go unwatered (1 yr)', w: 20000, dir: 'save' },
];

const GAL_TO_L = 3.785411784;
const DAYS = 365;
const SOURCE_RECORDS = Object.freeze([
  Object.freeze({
    id: 'baseline-ecologits-v0.10-text-inference',
    valueRef: 'MODELS[*].sizes',
    unit: 'Wh, g CO2e, and mL per request',
    boundary: 'Inference electricity, usage-phase water consumption, and allocated embodied hardware carbon',
    sourceTitle: 'EcoLogits text-generation model data and methodology',
    sourceUrl: 'https://ecologits.ai/',
    publicationDate: '2026-06-10',
    pinnedVersion: '0.10 baseline transcription',
    geography: 'Provider assumptions; electricity carbon is replaced by the employee-selected regional factor',
    scenarioRole: 'Lower, central, and upper per-request model scenarios',
    derivation: 'Recovered baseline table; Wh is converted to kWh, multiplied by the selected grid factor, then added to embodied carbon. mL is converted to liters.',
    evidenceLabel: 'Moderate',
    limitation: 'Closed-model architecture, hardware, batching, and serving location are uncertain; training, networking, storage, employee devices, and embodied water are excluded.',
  }),
  Object.freeze({
    id: 'baseline-regional-grid-2024',
    valueRef: 'LOCATIONS[*].grid',
    unit: 'g CO2e/kWh',
    boundary: 'Average operational electricity carbon intensity',
    sourceTitle: 'Ember Global Electricity Review 2024 and Our World in Data electricity carbon intensity',
    sourceUrl: 'https://ourworldindata.org/grapher/carbon-intensity-electricity',
    publicationDate: '2024',
    pinnedVersion: 'Recovered Project 1 regional table',
    geography: 'US, EU, UK, China, India, and world averages',
    scenarioRole: 'Employee-selected regional electricity conversion',
    derivation: 'Selected regional g CO2e/kWh multiplied by request electricity in kWh.',
    evidenceLabel: 'Moderate',
    limitation: 'Regional annual averages do not identify the actual data-center grid, marginal generation, or time of use.',
  }),
]);
globalThis.FootprintSourceData = Object.freeze({
  MODELS,
  SIZES,
  SIZE_LABEL_OVERRIDES,
  WPM,
  TOKENS_PER_WORD,
  TOKENS_PER_LINE,
  CODE_FRACTION,
  DEFAULT_ROWS,
  PRESETS,
  WORLD_GRID,
  LOCATIONS,
  HOMES,
  DRIVING,
  DIETS,
  FLYING,
  COUNTRY_DIET,
  REPORT_REFS,
  DAILY_ITEMS,
  ANNUAL_ITEMS,
  DAILY_WATER_ITEMS,
  ANNUAL_WATER_ITEMS,
  GAL_TO_L,
  DAYS,
  SOURCE_RECORDS,
});
