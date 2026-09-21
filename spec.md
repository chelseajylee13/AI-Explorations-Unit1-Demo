# Technical Specification

> EDITING DIRECTIVE: USER AND AGENT EDIT THIS FILE COLLABORATIVELY. THE USER MUST REVIEW AND APPROVE ITS CONTENT.

Purpose of this file: Define what the completed project must do so it can be planned, built, and verified.

## Instructions for the user

Translate the approved research into a specification without distorting its evidence, limitations, or uncertainty. Direct the work toward the intended result, judge gaps and trade-offs rather than accepting invented requirements, and approve only a complete, testable specification grounded in the research.

## Instructions for the agent

Read AGENTS.md, brief.md, research.md, and this file. Begin with a concise orientation and one focused question.

Guide the specification one feature at a time. Help turn approved decisions into precise requirements and surface gaps or trade-offs without inventing requirements or making product decisions. Draft concise updates for review, focus on the intended result rather than implementation steps, and never approve the specification on the user's behalf.

## Goal

State what the completed project should accomplish for its intended audience.

Create a locally running calculator that helps creative-media employees estimate the carbon impacts of professional text, image, video, and project-based AI use alongside meetings, streaming, social media, and gaming. It should provide activity-level and combined results, supported water estimates where defensible, flexible time periods, documented lower, central, and upper scenarios, visible sources, and clear limitations—helping employees form informed conclusions without portraying estimates as certain or advocating that AI is harmless or harmful.

## Features

For each feature, define:

- the need it addresses and intended audience outcome
- its behavior, inputs, and outputs
- its calculations, supporting evidence, and uncertainty
- its interface expectations and acceptance checks

### 1. Multimodal AI generation

#### Need and intended outcome

The original calculator excludes image and video generation, so it cannot represent Alex's production work or help other employees understand how multimodal work differs from text prompting. Employees must be able to add generated images and video clips to the same selected-period carbon total as their other activities, see the two media types separately, and understand when a result is a measured open-model benchmark, a modeled hosted-service estimate, or an unknown-model scenario.

#### Behavior, inputs, and outputs

- Employees can add, edit, and remove any number of image-generation and video-generation rows. Each row has a non-negative whole-number generation count for the selected reporting period.
- An image row accepts one of the 17 open models tested by Bertazzini et al. or `Other or unknown`; one of the tested resolutions (`512 × 512`, `768 × 1024`, or `1024 × 1024`); and a generation location of `Local device`, `Hosted service`, or `Unknown`. `Other or unknown` is the default model, and `Unknown` is the default location.
- The supported image-model list is limited to Stable Diffusion 1.5, Stable Diffusion XL, Stable Diffusion XL Turbo, Stable Diffusion XL Lightning, Hyper Stable Diffusion, Segmind Stable Diffusion 1B, LCM Segmind Stable Diffusion 1B, LCM Stable Diffusion XL, Flash Stable Diffusion, Flash Stable Diffusion XL, PixArt-alpha, PixArt-sigma, Flash PixArt, Stable Diffusion 3, Flash Stable Diffusion 3, Lumina-Next-SFT, and Flux.1 schnell. A proprietary service must not be silently mapped to one of these models.
- A video row accepts a model from the supported-model table in EcoLogits `0.11.1` or `Other or unknown`; a resolution supported by that model; clip duration in seconds; audio on/off when the model supports both; and generation count. Unsupported model-setting combinations are unavailable rather than silently substituted.
- Each row outputs lower, central, and upper estimates for electricity in kWh and carbon in g CO2e. A video row also outputs a supported usage-phase water-consumption estimate in liters. Image water displays `Not estimated` and is excluded—not entered as zero—from water totals.
- Image and video subtotals contribute to the selected-period professional-AI carbon total and the combined calculator total. Video contributes to the partial water total; image generation is named in the list of activities omitted from that partial total.
- Every result identifies its basis as `measured open-model benchmark`, `modeled hosted-service estimate`, or `unknown-model scenario` and links to its source and limitations.

#### Calculations, evidence, and uncertainty

For an image row, the calculator uses a versioned source table transcribed from the measurements reported by Bertazzini et al. for the selected open model and resolution. The table and its derivation must be stored with the calculator so the result works locally and can be audited. The row calculation is:

`image electricity scenario (kWh) = generation count × per-image electricity scenario (kWh/image)`

For a named open model, the lower, central, and upper values come from the reported spread and median for that tested model and resolution. For `Other or unknown`, the lower, central, and upper values are respectively the minimum, median, and maximum across the supported models for the selected resolution. These are comparison scenarios, not confidence intervals and not measurements of proprietary services. As a cross-check on the source table, the reported all-setting model medians must retain the paper's documented overall span from `0.000086 kWh` to `0.00408 kWh` per image. Prompt text or prompt length does not change the calculation because the study found no statistically significant effect under its test conditions.

Image carbon is:

`image carbon scenario (g CO2e) = image electricity scenario (kWh) × electricity factor (g CO2e/kWh)`

`Local device` uses the employee-selected regional electricity factor. `Hosted service` and `Unknown` use the calculator's cited world-average electricity factor because the serving location is unknown. The result must state that the image measurements came from open diffusion models on one RTX 4090 workstation and exclude data-center overhead, networking, model training, hardware embodied impacts, and water. Resolution effects must come from each tested model's data rather than one universal resolution multiplier because the study found inconsistent scaling.

For a supported video model, the calculator uses the video method and model data from EcoLogits `0.11.1`, published July 7, 2026. It derives frames at 24 fps from duration, applies the model-specific latency regression for resolution, frame count, and audio, converts latency and the assigned machine-power interval into request electricity, and applies the documented provider assumptions for PUE, electricity mix, WUE, and hardware. Per-request lower and upper results are multiplied by generation count. The central scenario is the midpoint of the source interval and is labeled a scenario rather than an observed mean. Carbon includes usage-phase and allocated embodied-hardware carbon and shows those components separately; water includes direct cooling and electricity-generation consumption for the usage phase but excludes embodied water.

`Other or unknown` video uses the minimum, midpoint, and maximum of compatible supported-model results for the entered resolution, duration, and audio setting. If no compatible supported model exists, the calculator displays `Not estimated` instead of extrapolating. Video results must retain EcoLogits warnings, including that proprietary-model values may be extrapolated, provider infrastructure is often assumed, the whole assigned machine is attributed to a request, and embodied water is unavailable.

Evidence: [Bertazzini et al., “The Hidden Cost of an Image”](https://arxiv.org/abs/2506.17016); [Jegham, Gamazaychikov, and Luccioni, “Lights, Camera, Carbon”](https://arxiv.org/abs/2607.04553); [EcoLogits 0.11.1](https://github.com/mlco2/ecologits/releases/tag/0.11.1); and [EcoLogits video-generation methodology](https://ecologits.ai/latest/methodology/video_generation/).

#### Interface expectations and acceptance checks

- Image and video controls are visibly separate, use plain-language labels, and reveal only fields relevant to the chosen media type and model. Help text explains `generation count` as all attempts, including discarded results and retries.
- Model selectors distinguish directly tested open image models, EcoLogits-supported video models, and `Other or unknown`. Unknown selections display their wider-range warning beside the result.
- Each row shows its selected-period result, scenario range, water-coverage status, calculation boundary, and direct source link without requiring the employee to infer them from a combined total.
- Inputs reject negative counts, fractional counts, zero or negative video duration, non-numeric values, and unsupported combinations with an inline explanation. A zero count produces zero electricity and carbon without producing `NaN`, infinity, or negative results.
- Doubling only the generation count exactly doubles every supported result for that row. Adding or removing a row changes the image or video subtotal and combined carbon total by exactly that row's displayed result.
- Changing image model or resolution retrieves the corresponding source-table values; the same universal resolution multiplier is never applied to all models. Choosing a hosted or unknown image location uses the world factor, while choosing local uses the selected regional factor.
- Image water always reads `Not estimated`; it never displays zero and never lowers or dilutes a partial combined water total. The water-total coverage note explicitly lists image generation as omitted.
- For a supported video fixture, the displayed electricity, usage carbon, embodied carbon, and usage-phase water match the frozen EcoLogits version within the calculator's displayed rounding tolerance. Changing duration, resolution, or audio status recalculates through that model's supported method; doubling count exactly doubles the result.
- All three scenario values satisfy `lower ≤ central ≤ upper`. No range is called a confidence interval unless the cited source supports that interpretation for that exact value.

### 2. Project-based AI workload

#### Need and intended outcome

The original calculator's prompts-per-day input and fixed 100,000-output-token coding benchmark cannot represent Jordan's long, irregular agent sessions, retries, or finite projects. Alex and Robin also need occasional work to remain occasional rather than being annualized as an identical day repeated 365 times. Employees must be able to use provider records when available or construct an explicit estimate when records are unavailable, then see a workweek, project, or custom-period total with the assumptions that drive it.

#### Behavior, inputs, and outputs

- The feature provides separate `Measured usage` and `Estimated workload` modes and labels measured usage as preferred. Rows from both modes can coexist, but the interface warns employees not to enter the same activity twice.
- Every row requires a model from the EcoLogits `0.11.1` model table or `Other or unknown`. An unsupported model is never silently mapped to a supported one.
- A measured row accepts provider-recorded request count and total output tokens. It also accepts optional total input tokens, cached-input tokens, reasoning-token detail, and notes about the source or export. Output reasoning tokens that are already included in the provider's output-token total are recorded as a subset and never added again.
- An estimated row accepts sessions or agent runs per workday, model calls per run, average retries per call, average output tokens per call, workdays per week, and project duration in weeks. Average retries may be fractional; counts and durations must be non-negative. The interface calculates and displays effective model calls and total output tokens before environmental results.
- Optional output-size presets reuse documented baseline values: chatbot reply (`400` output tokens), five-page report (`5,000`), long document (`15,000`), and coding or agent benchmark (`100,000`). Selecting a preset fills the editable output-token field; it does not lock the value or claim that all sessions have that size.
- The employee selects `Single project`, `Workweek`, or `Custom period`. `Single project` uses the entered workdays-per-week and project weeks. `Workweek` fixes the period to one entered workweek. `Custom period` accepts an explicit number of workdays. No mode automatically multiplies a day by 365.
- Each row outputs lower, central, and upper estimates for electricity, usage carbon, embodied-hardware carbon, total carbon, and usage-phase water for the selected period. It also outputs request count, output tokens used by the calculation, any recorded-but-unmodeled token fields, and the data-quality label `provider record` or `employee estimate`.
- Row results contribute to the professional-AI subtotal and combined calculator totals. The interface can group rows into one named project and shows the project's total without losing row-level results.

#### Calculations, evidence, and uncertainty

For measured usage:

`average output tokens per request = total output tokens ÷ request count`

For an estimated project:

`period workdays = workdays per week × project weeks`

`base model calls = runs per workday × model calls per run × period workdays`

`effective model calls = base model calls × (1 + average retries per call)`

`total output tokens = effective model calls × average output tokens per call`

For `Workweek`, `period workdays` is the entered workdays in that week. For `Custom period`, it is the explicit custom workday count. Fractional effective calls are permitted as an expected-value estimate and are labeled as such; measured request counts remain whole numbers.

Each supported-model row runs the EcoLogits `0.11.1` request method using the row's average output tokens per request or call, then multiplies the per-request results by measured request count or estimated effective model calls. It must retain the per-request calculation rather than treating all output tokens as one request because request latency includes a per-request component. EcoLogits estimates GPU energy from output tokens, model assumptions, and a fixed batch-size assumption; adds allocated non-GPU server energy, PUE, usage impacts, and embodied hardware impacts; and provides provider-level location and water assumptions. The central scenario is the midpoint of the returned interval and is not labeled an observed mean or confidence interval.

Input, cached-input, and context tokens are stored and displayed when entered but do not change the environmental result because EcoLogits `0.11.1` does not fully model their energy. The result must place a visible limitation beside any row with those values: prefill energy, long context, tool activity, and cache behavior may materially change actual consumption. Output reasoning tokens affect the estimate only through the provider's total output-token field. Training, networking, storage, employee-device energy, and embodied water are outside this calculation.

For `Other or unknown`, the calculator applies the entered workload to the minimum, median, and maximum compatible results across the supported EcoLogits model table and labels them unknown-model scenarios. If a compatible comparison cannot be produced, the result is `Not estimated` rather than zero. All EcoLogits warnings about unreleased architectures, assumed model size, hardware, batch size, deployment location, PUE, WUE, and electricity factors remain attached to the affected result.

Evidence: [EcoLogits 0.11.1](https://github.com/mlco2/ecologits/releases/tag/0.11.1) and its [LLM inference methodology](https://ecologits.ai/latest/methodology/llm_inference/); [OpenAI API usage fields](https://developers.openai.com/api/reference/resources/batches); [Anthropic usage-field examples](https://platform.claude.com/docs/en/about-claude/pricing); and [Vellaisamy et al., request and token energy](https://arxiv.org/abs/2608.28044).

#### Interface expectations and acceptance checks

- The two entry modes are visibly distinct. Switching modes does not discard entered data without confirmation, and measured fields are never presented as values the calculator inferred.
- Plain-language help shows employees where request and token counts may appear in provider records. It explains the difference between a work session, an agent run, a model call, and a retry before estimated fields are used.
- The interface shows the workload arithmetic—period workdays, base calls, retry-adjusted calls, and total output tokens—next to estimated results. Presets disclose their token values and remain editable.
- Required numeric inputs reject negative or non-numeric values. Measured request count must be a positive whole number when total output tokens are greater than zero. Zero activity produces zero supported impacts without division by zero, `NaN`, infinity, or negative results.
- A measured fixture with `10` requests and `5,000` total output tokens calculates `500` average output tokens per request and matches ten EcoLogits requests of that size within displayed rounding tolerance. Adding reasoning-token detail that is already included in output tokens does not change the result.
- An estimated fixture with `2` runs/day, `3` calls/run, `0.5` average retries/call, `1,000` output tokens/call, `5` workdays/week, and `2` project weeks produces `90` effective calls and `90,000` total output tokens. Doubling only project duration doubles calls, tokens, and every supported impact.
- Selecting the `100,000`-token agent preset fills that value but permits immediate editing. Changing a preset or custom output size recalculates the workload and result; the interface never claims the preset is typical for every coding task.
- Entering input, cached-input, or context tokens displays them as recorded but unmodeled and triggers the context limitation. Those fields do not silently change the EcoLogits output-token calculation.
- `Single project`, `Workweek`, and `Custom period` produce only their stated period totals. None silently annualizes usage, and changing the period updates row, project, professional-AI, and combined totals consistently.
- Adding or removing a row changes project and combined totals by exactly that row's displayed result. A duplicate-entry warning appears when measured and estimated rows use the same project label, model, and overlapping period; the employee decides whether to remove either row.
- Every row exposes its data-quality label, scenario range, water boundary, model and infrastructure warnings, method version, and direct source links.

### 3. Full-meeting footprint

#### Need and intended outcome

The original calculator excludes video meetings, although meetings are a substantial part of Jordan's and Robin's digital work. Employees must be able to estimate the carbon footprint of a whole meeting from its duration and participation, see how endpoint choices affect the result, and distinguish an activity-level meeting total from an allocation to one employee. The result must also make organizational double-counting risk unmistakable.

#### Behavior, inputs, and outputs

- Each row accepts a meeting name or identifier, meeting count in the selected period, duration in minutes, total attendee count, and either `Unknown or mixed devices` or `Detailed endpoints`.
- `Unknown or mixed devices` requires only total attendees and produces lower, central, and upper benchmark scenarios.
- `Detailed endpoints` accepts individual laptop attendees, individual desktop-plus-monitor attendees, shared-room attendee count, and number of shared-room display systems. Individual laptop and desktop counts represent one conferencing endpoint per attendee. A shared-room system represents one desktop, router, connection, and large display used by one or more colocated attendees.
- The supported detailed categories are limited to `Laptop`, `Desktop + monitor`, and `Shared room display`. Phone and tablet participation is not estimated because the approved evidence does not provide compatible full-boundary coefficients for those devices.
- The sum of laptop attendees, desktop attendees, and shared-room attendees must equal total attendees. Shared-room system count must be a positive whole number no greater than shared-room attendees when any shared-room attendees are entered; otherwise it must be zero.
- Each row outputs whole-meeting carbon in g CO2e for the selected period, participant-hours, endpoint breakdown, and average carbon per attendee-hour. It is labeled `whole-meeting activity total—not a personal allocation`.
- The meeting result contributes to the broader-digital subtotal and combined carbon total. Meeting water is `Not estimated`, excluded rather than treated as zero, and listed in the partial-water coverage note.

#### Calculations, evidence, and uncertainty

The source boundary includes allocated data-center hardware manufacturing and operation, the data network, router, and endpoint manufacturing and operation. Its benchmark coefficients are `55 g CO2e` per laptop endpoint-hour, `90 g CO2e` per desktop-plus-monitor endpoint-hour, and `295 g CO2e` per large-display-plus-desktop endpoint-hour. A shared-room coefficient is applied once per active room system, not once per person in that room, because colocated attendees share the endpoint.

For unknown or mixed devices:

`participant-hours = meeting count × duration hours × total attendees`

`lower carbon = participant-hours × 55 g CO2e`

`central carbon = participant-hours × 90 g CO2e`

`upper carbon = participant-hours × 295 g CO2e`

For detailed endpoints:

`endpoint carbon per meeting-hour = (laptop attendees × 55) + (desktop attendees × 90) + (shared-room systems × 295)`

`whole-meeting carbon = meeting count × duration hours × endpoint carbon per meeting-hour`

`average carbon per attendee-hour = whole-meeting carbon ÷ participant-hours`

The unknown/mixed range is a device scenario range, not a statistical confidence interval. A detailed result uses the single published benchmark for each selected endpoint and displays `quantified uncertainty unavailable` rather than inventing lower and upper bounds. The complete uncertainty feature must carry this meeting value unchanged across numerical scenarios while flagging it as an influential unquantified assumption when appropriate.

These coefficients are a 2021 German case study using older network, device, lifetime, and electricity assumptions, including a 2018 German electricity factor and 2017 VDSL network model. They are not universal present-day factors and are not regionalized to the employee's location. The network figure is retained only as part of the study's internally consistent full-boundary totals; the calculator does not apply a separate Wh/GB multiplier because network power is not simply proportional to an individual user's traffic. Camera state, meeting platform, video quality, participant geography, newer equipment, and idle infrastructure are not separately modeled.

The source's water method covers direct data-center water only and does not provide a compatible whole-meeting water coefficient covering networks and endpoints. Meeting water is therefore `Not estimated`.

Evidence: German Environment Agency, [Green Cloud Computing report](https://www.umweltbundesamt.de/system/files/medien/5750/publikationen/2021-06-17_texte_94-2021_green-cloud-computing.pdf) and [English case-study summary](https://www.umweltbundesamt.de/en/topics/digitalisation/green-it/digital-services-cloud-computing); and Guennebaud and Bugeau, [“Energy consumption of data transfer: Intensity indicators versus absolute estimates”](https://doi.org/10.1111/jiec.13513).

#### Interface expectations and acceptance checks

- The simple unknown/mixed path is the default. Detailed endpoint fields are optional and appear only when selected. All coefficients, boundaries, publication dates, and direct source links are visible from the meeting result.
- Help text distinguishes people from endpoints and explains that six people sharing one room system create six participant-hours but only one room-system endpoint-hour.
- The whole-meeting label and duplicate-entry warning appear next to both the row result and combined total. The warning tells employees not to add the same whole meeting in multiple employee records; the calculator does not claim to detect duplicates across devices or users.
- Meeting count and attendee and endpoint counts accept only non-negative whole numbers. Duration must be non-negative. Invalid endpoint totals produce a specific inline message and no result; zero meetings, attendees, or duration produce zero carbon without `NaN`, infinity, or negative values.
- An unknown/mixed fixture of `2` meetings, `90` minutes, and `10` attendees produces `30` participant-hours and lower, central, and upper results of `1,650`, `2,700`, and `8,850 g CO2e` before display rounding.
- A detailed one-hour, one-meeting fixture with `4` laptop attendees, `2` desktop attendees, and `4` attendees sharing `1` room system has `10` participant-hours and `695 g CO2e`. Increasing shared-room attendees without adding another room system changes participant-hours and per-attendee average but does not multiply the shared endpoint coefficient.
- Doubling only meeting count or duration exactly doubles participant-hours and whole-meeting carbon. Adding or removing a meeting row changes the broader-digital and combined carbon totals by exactly that row's displayed whole-meeting result.
- Unknown/mixed results show all three device scenarios and never call them confidence intervals. Detailed results show the benchmark and `quantified uncertainty unavailable`; they do not display three identical numbers as if these established certainty.
- Phone or tablet selections are not offered as calculated categories. The interface identifies them as an evidence gap rather than mapping them to laptops or reporting zero.
- Meeting water always displays `Not estimated`, is excluded from the partial water total, and is named in its coverage note.

### 4. Digital media and recreation

#### Need and intended outcome

The original calculator does not let Jordan or Robin compare professional AI use with common digital activities outside meetings. Employees need a consistent way to enter video streaming, social-media use, and gaming without implying that an hour has one universal footprint. The result should show which impacts come from the employee's device, which retain source-specific infrastructure assumptions, and where lifecycle or water evidence is absent.

#### Behavior, inputs, and outputs

- A shared activity-row pattern accepts activity name, activity type (`Video streaming`, `Social media`, or `Gaming`), hours in the selected period, client device, and either a sourced device-power preset or measured custom watts. Supported device choices appear only where evidence is compatible and may include phone, tablet, laptop, desktop, television, and console. Every preset shows its source date and remains editable through the custom-watts path.
- Custom watts means average active wall power for the entered activity, not nameplate or maximum power. For a desktop, console, or streaming peripheral, the interface asks whether display power is included. If it is not, a separate display preset or custom display watts is required.
- Video streaming also accepts connection type when supported by the source, resolution (`SD/480p`, `HD/720p`, `Full HD/1080p`, or `UHD/4K`), and optional streaming peripheral. Resolution is recorded even when the selected source method does not make operational power proportional to traffic.
- Social media is entered as generic time, without platform names or platform-specific precision. The row accepts a supported client device and may use the pinned study's generic social-media data-traffic assumption only within that study's boundary.
- Gaming requires `Local gaming` or `Cloud gaming`. Local gaming uses the active client/console and display. Cloud gaming uses the active client/display plus a distinct cloud-rendering, data-center, and network scenario; it is never calculated as ordinary video streaming or added on top of a separately entered local-gaming row for the same hours.
- Each row outputs selected-period energy where derivable, operational carbon, embodied carbon where a compatible source supports it, combined carbon, lower/central/upper scenarios where quantified, data-quality labels, and boundary notes. Infrastructure and local-device components remain visible rather than being collapsed into an unexplained hourly factor.
- These rows contribute to the broader-digital subtotal and combined carbon total. Water is `Not estimated` for all three activity types and is excluded from the partial-water total rather than treated as zero.

#### Calculations, evidence, and uncertainty

For a local device or display component:

`local electricity (kWh) = hours × active watts ÷ 1,000`

`local operational carbon (g CO2e) = local electricity × employee-region electricity factor (g CO2e/kWh)`

Custom watts replace only the selected local device or display operational-power value. They do not silently replace data-center, network, router, or embodied assumptions.

Video streaming uses a versioned local coefficient table derived from the Carbon Trust white paper. Its central power-allocation method separates data center/CDN, transmission network, home router, streaming peripheral, and screen/device. The published representative European average is `188 Wh per viewing hour` and `56 g CO2e per viewing hour`; its component table reports approximately `1.3 Wh/h` for data centers, `20 Wh/h` for networks, `71 Wh/h` for the home router, `10 Wh/h` for the representative TV peripheral, and `86 Wh/h` for the representative screen mix. The calculator does not apply `188 Wh/h` to every row. It substitutes the selected device and peripheral power and applies the employee-region factor only to those local components; source data-center, network, and router carbon retain the study's geography and allocation assumptions.

The Carbon Trust table supplies central device presets including phone `1 W`, laptop `22 W`, desktop plus monitor `115 W`, television `100 W`, console used as a streaming peripheral `89 W`, and set-top box `18 W`. Tablet or other presets may be exposed only if a value with a compatible boundary exists in the pinned source table; otherwise the interface requires custom watts or shows `Not estimated`. The central power-allocation result does not change merely because resolution changes, because largely always-on network power is not proportional to one viewer's traffic. Where the source provides resolution/bitrate traffic-allocation results, those appear as a separately labeled sensitivity scenario, not as a more accurate central estimate.

Generic social-media coefficients come from a local, reviewable table extracted from Istrate et al.'s open workbook at repository commit `67436426ae321c0f290081633a66ed355064ec27`. The table must retain the study's device, data-center, network, customer-premises-equipment, operational, embodied, geography, lifetime, and sensitivity fields; it may not store only a single unexplained total. For a supported device:

`social carbon = local device operational carbon + source infrastructure carbon + compatible embodied carbon`

`source component carbon = hours × pinned source coefficient per hour`

The study's generic social-media traffic assumption, approximately `0.31 GB/h`, is metadata for its infrastructure model and is not presented as measured usage for a particular platform or employee. The local device operational component is recalculated with the employee-region electricity factor; infrastructure and embodied components retain the study's source assumptions. Embodied carbon is displayed separately only where the extraction provides a compatible per-hour allocation. Otherwise it is `Not estimated`.

Local gaming applies the local device/display formulas to either custom measured watts or a versioned preset range derived from the Berkeley Lab measurements of 26 systems across 37 games and 11 benchmarks. A preset represents an evidence-backed hardware category and range, not a claim about a specific title. The lower, central, and upper values are respectively the compatible low, median, and high active-power observations within that category; all display-inclusion rules are stored with the preset.

Cloud gaming adds the Berkeley Lab source's separately modeled cloud data-center and network energy scenarios to the selected local client/display energy. The implementation must preserve the source's scenario bounds and identify the remote electricity and network assumptions; it must not substitute the Carbon Trust's ordinary-video CDN value for interactive cloud rendering. If the pinned evidence cannot provide a separable cloud infrastructure coefficient for a requested combination, cloud infrastructure is `Not estimated` and the interface may show the local client component, but it may not label that partial result as the whole cloud-gaming footprint.

The Carbon Trust study covers operational electricity rather than product manufacture. The Istrate study can supply operational and embodied carbon only for compatible table entries. Gaming product manufacture, water for all three activities, unmeasured idle/standby time, content production, advertising systems, recommendation-model computation, account storage, and rebound behavior are outside these calculations. Source years, electricity mixes, device lifetimes, allocation choices, and network architectures are visible limitations. Scenario ranges express model and device variation, not statistical confidence intervals.

Evidence: Carbon Trust, [Carbon impact of video streaming](https://www.carbontrust.com/sites/default/files/documents/resource/public/Carbon-impact-of-video-streaming.pdf); Istrate et al., [internet-use environmental footprints](https://doi.org/10.1038/s41467-024-47621-w) and the [pinned open model repository](https://github.com/robyistrate/internet-environmental-footprint/tree/67436426ae321c0f290081633a66ed355064ec27); Mills et al., [Toward Greener Gaming](https://doi.org/10.1007/s40869-019-00084-2); and Sony Interactive Entertainment's [console energy disclosures](https://www.playstation.com/en-ca/corporate/playstation-and-the-environment/our-products/) as a dated cross-check rather than a universal gaming-power coefficient.

#### Interface expectations and acceptance checks

- The three activity types share period, hours, device, custom-watts, result, source, and uncertainty controls, while type-specific controls appear only when relevant. Switching activity type does not silently retain incompatible hidden inputs.
- Help text distinguishes measured wall power, preset active power, and device nameplate power. It also distinguishes a client device, display, and peripheral so their energy cannot be counted twice without a visible warning.
- Required numeric inputs reject negative or non-numeric values. Hours and watts may be fractional. Zero hours produces zero for supported impacts without `NaN`, infinity, or negative results; missing evidence produces `Not estimated`, not zero.
- A custom-power fixture of `200 W` for `5` hours produces exactly `1.0 kWh` of local electricity. With a test electricity factor of `380 g CO2e/kWh`, the local operational result is `380 g CO2e` before rounding. Marking a separately entered display as already included removes exactly that display component.
- A two-hour laptop-streaming fixture uses `44 Wh` for the local laptop component before regional carbon conversion. It adds only the selected source infrastructure and peripheral components, exposes their assumptions, and does not apply the published `188 Wh/h` average as an additional total.
- Changing only streaming resolution leaves the central power-allocation result unchanged and updates only a source-supported traffic sensitivity. The interface explains this outcome and never claims that 4K universally consumes a fixed multiple of 1080p network electricity.
- A social-media fixture reproduces the pinned workbook's component total for one supported device and scenario within displayed rounding tolerance. Doubling only hours doubles every compatible component. Choosing custom watts changes only local device operation; source infrastructure and compatible embodied components remain unchanged.
- A local-gaming fixture with a custom console/client value and separate display equals the sum of those local components. Selecting a preset shows its low/median/high category values and source vintage. Changing a game title is not offered as false precision.
- Switching the same gaming row from local to cloud adds the pinned cloud-rendering and network scenario exactly once and retains the client/display component exactly once. If cloud evidence is unavailable, the incomplete row is labeled partial and is excluded from any whole-footprint comparison unless the employee explicitly chooses to include the visible partial component.
- Operational and embodied carbon are displayed separately before any compatible combined value. `Not estimated` components are never numerically added as zeros, and every row exposes its method, version or commit, geography, date, boundary, data-quality label, scenario explanation, and direct source links.
- All digital-media and recreation water fields show `Not estimated`; the combined result names these exclusions in its partial-water coverage note.

### 5. Assumption and uncertainty scenarios

#### Need and intended outcome

Every activity estimate depends on incomplete or variable evidence, but isolated row ranges do not show how uncertainty affects the complete result. Jordan needs to see which assumptions drive a project total, Robin needs ranges and limitations that can be audited, and Alex needs to understand which carbon and water conclusions are supported. Employees must be able to compare documented lower, central, and upper whole-calculator scenarios without mistaking them for confidence intervals or changing their recorded activity.

#### Behavior, inputs, and outputs

- The calculator produces `Lower`, `Central`, and `Upper` scenarios for every activity row, the professional-AI subtotal, the broader-digital subtotal, the combined carbon total, the supported partial-water total, and AI's share of combined carbon. The selected reporting period and all employee-entered activity quantities remain identical across the three scenarios.
- `Central` is the default headline result, always shown with the lower-to-upper scenario span. The interface never uses a central estimate alone when a quantified range exists.
- Every input is classified as `Measured or employee-entered`, `Sourced/model assumption`, or `Not quantified`. Employees can inspect the value, unit, source, date or version, geography, boundary, and scenario rule for each modeled assumption.
- An advanced sensitivity panel permits one documented assumption at a time to be set to its lower, central, or upper value. It shows the recalculated complete result and difference from central, then resets before another assumption is explored. This version does not allow an unrestricted mixture of overrides to be saved or presented as a fourth authoritative scenario.
- The calculator ranks influential quantified assumptions by their one-at-a-time effect on the combined carbon total and, separately, on the supported partial-water total. It also lists influential unquantified assumptions and excluded components qualitatively; those gaps are never assigned invented numerical rankings.
- Results with incomplete boundaries remain marked `Partial`. Employees may inspect their supported components, but a partial component is included in combined totals only according to the inclusion rule defined by its feature. Every subtotal and total states exactly what was included and excluded.

#### Calculations, evidence, and uncertainty

Each compatible row exposes a scenario vector:

`row scenarios = [row lower, row central, row upper]`

For each result level and impact type:

`scenario total[s] = sum of included row result[s] for scenario s`

where `s` is lower, central, or upper. Scenario propagation preserves correlations already built into a source method or coefficient table. It must not independently combine subcomponent extremes when the source supplies only internally consistent complete scenarios. When a source supplies alternatives whose numerical order is not guaranteed, the lowest result is displayed as lower and the highest as upper while the underlying alternative names remain visible.

Employee-entered counts, hours, durations, tokens, resolutions, devices, regions, and measured watts do not automatically vary between scenarios. Correcting one of those inputs changes the base activity and recalculates all scenarios; it is not described as uncertainty propagation. Preset device-power ranges and other sourced coefficients are modeled assumptions and may vary as their feature specifies.

If a feature has a supported single benchmark but no quantified range, that value is carried unchanged into all three arithmetic totals and marked `Quantified uncertainty unavailable`. The interface does not display three identical values as evidence of certainty. If an impact is `Not estimated`, it remains absent from all numerical scenarios and appears in the coverage note; it is never converted to zero. This means the displayed scenario span is an evidence-limited model range, not a bound guaranteed to contain the true footprint.

For quantified assumption `i`, one-at-a-time influence is:

`downward effect[i] = total with assumption i at lower − central total`

`upward effect[i] = total with assumption i at upper − central total`

`influence magnitude[i] = max(abs(downward effect[i]), abs(upward effect[i]))`

Assumptions are ranked by influence magnitude. When the central total is greater than zero, the interface may also show `influence magnitude ÷ central total × 100%`; otherwise it shows the absolute effect only. Ties retain a stable activity-and-assumption order. The ranking is a local sensitivity screen, not a probability, causal attribution, or claim that assumptions are independent.

For scenario `s`:

`AI carbon share[s] = professional-AI carbon subtotal[s] ÷ combined carbon total[s] × 100%`

If the denominator is zero, AI share is `Not applicable`. The three shares describe the three aligned scenarios; they are not claimed to be the mathematical minimum and maximum possible share under every combination of assumptions.

Water is propagated separately from carbon and never converted into a carbon-equivalent score. Its total is labeled `Partial water total` and names every included and excluded activity. A lower, central, or upper water result is shown only for included components with compatible water-consumption boundaries. Withdrawal and consumption figures are not summed. If no compatible water component is present, water is `Not estimated`, not zero.

The approach follows NIST's general principles of propagating significant modeled inputs and examining sensitivity, but the calculator lacks probability distributions and correlation evidence needed for formal combined standard uncertainty or confidence intervals. Qualitative evidence strength is therefore kept separate from numerical scenario width. Each row receives a plain-language evidence label—`Higher`, `Moderate`, or `Limited`—based on source directness, recency, boundary compatibility, and input specificity, with the reasons shown; these labels are not statistical confidence levels.

Evidence: NIST Technical Note 1297, [law of propagation of uncertainty](https://www.nist.gov/pml/nist-technical-note-1297/nist-tn-1297-appendix-law-propagation-uncertainty) and the NIST/SEMATECH handbook's [uncertainty budgets and sensitivity coefficients](https://www.itl.nist.gov/div898/handbook/mpc/section5/mpc56.htm); and IPCC AR6 Working Group I, [Chapter 1: Framing, Context and Methods](https://www.ipcc.ch/report/ar6/wg1/chapter/chapter-1/), for separating qualitative confidence concepts from numerical likelihood.

#### Interface expectations and acceptance checks

- Lower, central, and upper controls update every row, subtotal, combined carbon total, partial-water total, and AI share together. Each displayed value identifies its active scenario and selected reporting period.
- A persistent explanation says the scenarios are documented model alternatives, not confidence intervals, best/worst cases, or guarantees. The central scenario is not labeled “most likely” unless a cited source explicitly supports that interpretation.
- The assumption panel distinguishes entered activity from modeled coefficients and exposes direct sources. Changing a sensitivity control shows exactly one changed assumption, its before/after value, affected components, and delta from the fixed central total.
- For a fixture with two compatible carbon rows having vectors `[10, 20, 40]` and `[5, 8, 11] g CO2e`, the combined vector is exactly `[15, 28, 51] g CO2e` before display rounding. Removing either row changes each scenario total by exactly that row's corresponding value.
- Adding a `7 g CO2e` single-benchmark row with no quantified range changes those totals to `[22, 35, 58]` and flags the row as unquantified; it does not claim that the unchanged contribution has zero uncertainty.
- Adding a `Not estimated` carbon component leaves numerical totals unchanged and adds the component to every carbon coverage note. No result view presents the unchanged total as covering that component.
- In a sensitivity fixture with a `100 g CO2e` central total, assumption A producing `80` and `130` at its alternatives has an influence magnitude of `30 g` or `30%`; assumption B producing `95` and `110` has `10 g` or `10%`. A ranks above B, and moving A does not also move B.
- If professional AI and combined carbon are respectively `[20, 30, 50]` and `[40, 60, 125] g CO2e`, AI share is `[50%, 50%, 40%]`. A zero combined total produces `Not applicable` rather than division by zero, `NaN`, or infinity.
- Carbon and water rankings are calculated separately. An excluded water component cannot lower the partial-water total, appear as zero, or receive a numerical sensitivity rank. The partial-water coverage note remains visible beside every water scenario.
- Rounding occurs only for display. Totals, differences, ratios, and rankings use unrounded internal values and remain consistent when users switch views or periods.
- An automated fixture verifies that global scenarios preserve measured counts and time values, that source-correlated scenario records stay intact, and that no control or accessible label uses `confidence interval`, `most likely`, `best case`, or `worst case` for these scenario bounds.

## Shared product requirements

### Existing calculator and local operation

- The product extends the existing standalone calculator at `ai-prompt-footprint/index.html` from `origin/project-2`. The working checkout is currently four commits behind that branch reference and must be synchronized deliberately during planning or implementation without overwriting the approved documents or other uncommitted work.
- Existing text-prompt entry, model comparison, usage presets, lifestyle context, methodology, and cited-report behavior remain available unless this specification explicitly replaces a behavior. Text-prompt rows use the selected reporting period and participate in activity results, professional-AI subtotals, complete scenarios, combined totals, and partial-water coverage.
- Existing daily input multiplied automatically by `365` is replaced by explicit `Single project`, `Workweek`, or `Custom period` reporting. Entries represent totals for the selected period unless a feature explicitly derives a total from workdays or weeks. Changing the period label never silently rescales already entered activity.
- The calculator runs locally as a standalone client-side application. All coefficient tables, scenario records, and calculations needed for results are packaged locally; no account, analytics, remote API, or network connection is required to calculate. Following external citations requires a network connection.
- User-entered data remains in the current browser session unless the employee deliberately uses an existing browser capability. It is not transmitted or persisted by a new application service.

### Shared results and evidence

- Carbon uses grams of CO2-equivalent internally, energy uses kWh, and water consumption uses liters. The interface may choose readable display units, but it always shows the unit and converts without changing the unrounded stored value.
- Results show each activity row, professional-AI subtotal, broader-digital subtotal, combined carbon total, supported partial-water total, and AI share. A displayed total lists included and excluded activity types and never implies full lifecycle coverage where the underlying rows are partial.
- Every factual or numerical claim used in the calculation or explanatory interface has a nearby citation or a direct route to its source record. Each coefficient record includes a stable identifier, value and unit, impact boundary, source title and link, publication date, accessed or pinned version, geography, scenario role, and limitation text.
- Versioned source data are separated from calculation logic so a coefficient can be traced from interface result to stored record. Updating a source value requires updating its version/date, affected fixtures, and revision note; a live webpage changing must not silently change past calculations.
- The cited report and model-comparison views either incorporate the new selected-period calculations and coverage language or state their narrower scope prominently. No secondary view may show a conflicting total, restore automatic annualization, or omit a material `Not estimated` limitation.
- Carbon and water are never added together or converted into a single score. Operational and embodied carbon remain distinguishable wherever both are available. `Not estimated`, zero, and `Not applicable` are separate states in data and presentation.
- Green/yellow/orange/red “impact” badges and unsupported good/bad thresholds are removed. They are replaced by the neutral scenario and evidence-quality labels defined in Feature 5. Explanatory language presents estimates and trade-offs without concluding that AI or another activity is harmless, harmful, acceptable, or unacceptable.

### Shared validation, usability, and verification

- All controls have visible labels and instructions in plain language. The calculator is usable with a keyboard, preserves a logical focus order, exposes validation and recalculation status to assistive technology, does not rely on color alone, and remains readable at narrow and wide viewport sizes.
- Invalid input receives a field-specific message and does not produce or contaminate a total. Removing or changing a row updates all affected components exactly once. No valid interaction produces `NaN`, infinity, a negative footprint from non-negative activity, or an unlabeled stale result.
- Calculations use unrounded values and round only for display. Shared formatting rules avoid false precision and keep enough significant digits to distinguish small nonzero values from zero.
- Automated tests cover every numerical fixture in the five approved features plus text-prompt regression fixtures, unit conversion, aggregation, scenario switching, partial coverage, zero values, invalid values, add/edit/remove behavior, and period changes.
- Before completion, the standalone application is opened and exercised locally at desktop and narrow viewport sizes. Verification records test output and visual evidence that representative Alex, Jordan, and Robin workflows can be completed, their expected activity types appear in totals, citations open to the intended sources, and important limitations remain visible.

## User approval

Review the completed specification directly and explicitly approve it before planning begins. The agent cannot complete this approval on the user's behalf.

- [x] Feature 1, Multimodal AI generation, approved by the user on September 20, 2026.
- [x] Feature 2, Project-based AI workload, approved by the user on September 20, 2026.
- [x] Feature 3, Full-meeting footprint, approved by the user on September 20, 2026.
- [x] Feature 4, Digital media and recreation, approved by the user on September 20, 2026.
- [x] Feature 5, Assumption and uncertainty scenarios, approved by the user on September 20, 2026.
- [x] Complete technical specification approved by the user on September 20, 2026.

## Out of scope

- Team, department, or company roll-ups and automatic duplicate detection across employees.
- Accounts, cloud synchronization, server-side storage, analytics, telemetry, and collection of employee activity.
- Saved profiles, shareable URLs, file import/export, and new report formats beyond keeping the existing cited report accurate.
- Automatic provider billing-log ingestion, browser-history inspection, device telemetry, or direct watt-meter integration; employees enter records or measured values themselves.
- A local water-stress score based on employee location, because that location does not establish the serving data center or electricity generator's watershed.
- Combining water withdrawal with water consumption, estimating unsupported water components, or converting water and carbon into one score.
- Model-training allocation, because defensible allocation across unknown lifetime use is unavailable.
- Comparisons against a hypothetical non-AI workflow or claims that AI replaces travel, labor, or another activity.
- Named social-platform factors, game-title factors, unsupported proprietary image-model matching, and calculated phone/tablet meeting coefficients.
- Product-manufacturing or other embodied impacts where a selected source lacks a compatible allocation.
- Automatic live coefficient updates. New evidence is incorporated only through a reviewed, versioned specification revision.
- Recommendations, targets, employee scoring, compliance decisions, or claims that an estimated footprint is good, bad, harmless, or harmful.

## Revisions

If implementation changes the intended result, update the specification and record what changed and why.

| Date | Change | Reason | Approval |
| --- | --- | --- | --- |
| September 20, 2026 | Initial five-feature technical specification drafted from the approved research. | Establish the product behavior, calculations, evidence boundaries, uncertainty treatment, interface expectations, and acceptance checks before planning. | Approved by the user on September 20, 2026 |
| September 21, 2026 | Until the Bertazzini et al. companion measurements are obtained, keep image-generation entry and evidence-gap disclosure but report its electricity, carbon, and water as `Not estimated`. Continue the supported video calculation and the other four features; do not infer image coefficients from chart pixels or the paper's overall range. | The repository contains no per-model/per-resolution companion table, and the user chose to continue with an explicit missing-evidence result rather than pause the build. | Approved by the user on September 21, 2026 |

## Commands

### Start specification

User: Open the project repository as your workspace, start a fresh chat, and type `start specification`.

### Save transcript

Agent: After the user approves the specification, remind them that the transcript is a deliverable and ask them to say `save transcript`. Wait for that direction.

When the user directs the agent to save the transcript, the agent saves the entire conversation in the `transcripts/` directory as `spec-YYYY-MM-DD_HHMMSS.md`, marks user and agent responses clearly, and confirms the saved relative path.
