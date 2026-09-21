# Research

> EDITING DIRECTIVE: USER AND AGENT EDIT THIS FILE COLLABORATIVELY. THE USER MUST REVIEW AND APPROVE ITS CONTENT.

Purpose of this file: Develop and record the evidence and decisions that will guide the technical specification.

## Instructions for the user

You are responsible for the ethics, accuracy, and fairness of the research. Direct the inquiry toward useful questions, judge sources and suggestions rather than accepting them at face value, and approve only results supported by verified evidence and audience needs. Seek evidence that challenges your assumptions, represent uncertainty honestly, and reject claims you cannot verify. See [UNESCO's Guidance for generative AI in education and research](https://www.unesco.org/en/articles/guidance-generative-ai-education-and-research).

## Instructions for the agent

Read AGENTS.md, brief.md, and this file. Begin with a concise orientation and one focused question.

Guide the research one stage at a time. Help the user explore options, assess sources, and identify contrary evidence or uncertainty without making decisions for them. Draft concise updates for review, and never mark research or feature choices approved on the user's behalf.

## Reference employee profiles

- Alex — Los Angeles, 24, junior video editor: Uses text, image, and video-generation tools for production work. Streams reference media and uses social platforms across a phone, laptop, and television. Wants to understand impacts beyond text prompts and is particularly attentive to water use.
- Jordan — Austin, 38, creative technologist: Uses coding agents and generative tools in long, irregular sessions. Games on a desktop PC and participates in frequent video calls. Finds "prompts per day" too simplistic and wants assumptions, ranges, and project-level totals.
- Robin — Chicago, 56, operations manager: Uses text AI occasionally but spends substantial time in video meetings, streaming media, and social platforms. Is skeptical of the company's motives and needs plain-language explanations, visible sources, and honest indications of uncertainty.

These are fictional starting profiles, not evidence about demographic groups. Research the activities, circumstances, and needs they represent rather than making assumptions based on age or location.

## Audience needs

Record information about the activities, circumstances, and needs represented by all three reference profiles. Separate evidence from assumptions that still need checking.

### Needs evidenced by the profiles

- **Professional AI beyond text:** Alex needs image and video generation represented. Jordan needs coding-agent work represented at session and project scales rather than only as prompts per day.
- **Flexible time periods:** Jordan's irregular work and Robin's occasional use require project, workweek, or custom-period totals rather than an identical average day multiplied by 365.
- **Broader digital context:** Alex needs streaming and social use across several devices; Jordan needs desktop gaming and video meetings; Robin needs meetings, streaming, and social use.
- **Water information:** Alex needs water estimates, but missing or incompatible evidence must be labeled "not estimated," not treated as zero.
- **Transparency and control:** Jordan needs visible assumptions and ranges. Robin needs plain-language methodology, direct sources, and honest limitations. Alex also benefits from seeing uncertainty in multimodal and water estimates.
- **Combined but separable results:** Employees need activity-level results, a combined total, and AI's share of that total.

### Gaps confirmed against the original calculator

The [original calculator](https://andymasley.com/visuals/ai-prompt-footprint/) and its [published source](https://andymasley.com/visuals/ai-prompt-footprint-source.txt) use rows of model, typical output, and prompts per day. They include a fixed 100,000-output-token coding/agent benchmark, regional carbon, global-basis water, ranges, citations, and lifestyle comparisons. They explicitly exclude image generation, video generation, and retries, and annualize daily use by 365.

- Alex's image and video work is excluded; streaming, social use, and device choice cannot be entered.
- Jordan's coding work is represented by one fixed benchmark rather than measured or adjustable sessions, retries, work schedules, and projects. Gaming and meetings cannot be entered.
- Robin's occasional text use and need for citations are partly served, but meetings, streaming, and social use cannot be included.
- Existing model-level ranges do not propagate through a combined AI-and-digital total or identify the most influential assumptions.

### Assumptions still to check

- Whether employees can obtain provider usage records or must estimate most sessions.
- Whether understandable device categories can be supported without implying identical power use within each category.
- Whether one time-based network boundary can be applied consistently across meetings, streaming, social use, and cloud gaming.
- Which non-AI activities have sufficiently compatible water evidence; water coverage is expected to remain partial.
- How to prevent organizational double-counting when the same full-meeting footprint is entered by multiple attendees.

## Possible features

Generate several possibilities before choosing. Keep the initial notes brief. For each idea, record:

- what it would help someone learn or do
- the profiles or needs it would serve
- any evidence or implementation challenge that might affect it

### Candidate options

| Candidate | Employee outcome | Profiles | Main challenge |
|---|---|---|---|
| Multimodal AI generation | Add generated images and video clips to professional-AI totals | Alex; Jordan secondarily | Image and video require different methods; closed-service image and water evidence are limited |
| Project-based AI workload | Enter measured usage or estimate sessions, retries, workdays, and project duration | Jordan; Alex and Robin | Current EcoLogits estimates emphasize output tokens and do not fully model long input contexts |
| Full-meeting footprint | Add duration × attendee count for a whole meeting | Jordan; Robin | Network allocation varies; multiple attendees can double-count one meeting |
| Digital media and recreation | Add streaming, generic social use, and gaming by time and device | All three | Platform-specific social estimates are weak; device power varies; water coverage is incomplete |
| Assumption and uncertainty scenarios | Recalculate lower, central, and upper scenarios and identify major drivers | All three, especially Jordan and Robin | Scenario bounds must not be mislabeled as statistical confidence intervals |
| Device-aware calculation | Change estimates by phone, laptop, desktop, television, console, or custom watts | All three | Better as a shared input than a standalone fifth feature |
| Local water context | Relate water consumption to water stress | Alex | Employee location may not match the serving data center |
| Alternative-workflow comparison | Compare an AI-assisted task with a non-AI workflow | Jordan; Robin | Counterfactual workflows are difficult to define and source consistently |
| Team or department roll-up | Aggregate employee or project totals | Robin; Jordan | No explicit profile need and substantial double-counting risk |
| Training-impact allocation | Add an individual share of model training | All three | Allocation across unknown lifetime usage is highly uncertain |
| Named social-platform estimates | Compare individual platform brands | Alex; Robin | Published estimates depend heavily on secondary data and disputed allocation methods |
| Saved profiles or export | Reuse or share inputs and results | All three | Useful support behavior but not independently eligible unless it changes the calculation |

The proposed five rank highest because they cover every explicit activity or decision need while fitting the required two professional-AI, two broader-digital, and one research-led structure. Device choice is retained as a cross-cutting input.

## Source assessments

For each source, record:

- the full citation and working link
- the claim or figure the project may use
- evidence checked directly
- important limitations or uncertainty
- confidence and decision: use, use with qualifications, or reject

### Baseline

**Andrew Masley. "AI carbon & water footprint calculator (ChatGPT, Claude, Gemini)." Source dated June 10, 2026.** [Calculator](https://andymasley.com/visuals/ai-prompt-footprint/) · [Source](https://andymasley.com/visuals/ai-prompt-footprint-source.txt)

- **Use:** Authoritative baseline for existing behavior and exclusions.
- **Checked:** Model/output/count rows, fixed coding benchmark, daily and annual calculations, regional carbon, water, ranges, citations, and explicit exclusions.
- **Limitations:** It is the implementation baseline, not independent evidence for every factor it uses. Underlying sources must be assessed before reusing figures.
- **Decision:** **Use** for baseline behavior.

### Multimodal AI

**Bertazzini, Giulia, et al. "The Hidden Cost of an Image: Quantifying the Energy Consumption of AI Image Generation." arXiv:2506.17016 (2025).** [Paper](https://arxiv.org/abs/2506.17016)

- **Potential claim:** Image-generation energy varies substantially by model and resolution.
- **Checked:** More than 9,000 measurements across 17 open diffusion models; reported medians span about 0.000086–0.00408 kWh per image, roughly 47×, while resolution effects vary by model. Prompt length was not significant in the tested setup.
- **Limitations:** Open models on experimental hardware do not directly represent proprietary hosted services. The paper does not provide complete data-center, embodied-hardware, or water impacts.
- **Decision:** Medium confidence; **use with qualifications** for broad image ranges, not proprietary-model claims or one universal value.

**Jegham, Nidhal, Boris Gamazaychikov, and Sasha Luccioni. "Lights, Camera, Carbon: Architectural Scaling Laws for Video Generation Energy Consumption." arXiv:2607.04553 (2026).** [Paper](https://arxiv.org/abs/2607.04553)

- **Potential claim:** Video energy can be modeled from resolution, duration, audio, and model-specific scaling.
- **Checked:** Validation across six open video models and three GPU configurations; the authors report below 3% mean absolute percentage error within tested conditions and then extrapolate to proprietary systems.
- **Limitations:** Proprietary-model values are extrapolations. The paper is recent and does not cover every hosted deployment.
- **Decision:** Medium confidence; **use with qualifications**.

**EcoLogits. "Video Generation" and "Environmental Impacts of Video Generation." Accessed September 20, 2026.** [Tutorial](https://ecologits.ai/latest/tutorial/video_generation/) · [Method](https://ecologits.ai/latest/methodology/video_generation/)

- **Potential use:** Supported video estimates for energy, carbon, water, and embodied impacts.
- **Checked:** Inputs include model, resolution, duration, and audio; documentation exposes ranges, warnings, assumed hardware, PUE, WUE, electricity factors, and embodied allocation.
- **Limitations:** Uses provider defaults when infrastructure is unknown, attributes the assumed whole machine to a request, and omits embodied water.
- **Decision:** Medium confidence; **use with qualifications** and preserve warnings and ranges.

### Project-based AI workload

**Rincé, Samuel, and Adrien Banse. "EcoLogits: Evaluating the Environmental Impacts of Generative AI." Journal of Open Source Software 10, no. 111 (2025): 7471.** [Current LLM method](https://ecologits.ai/dev/methodology/llm_inference/) · [DOI](https://doi.org/10.21105/joss.07471)

- **Potential use:** Per-request LLM energy, carbon, water, and embodied-impact estimates.
- **Checked:** The method uses model assumptions, output tokens, throughput, latency, batching, hardware, PUE, WUE, and electricity factors.
- **Limitations:** Input-token processing is not fully modeled; proprietary architecture, batching, hardware, and location remain uncertain. Networking, training, and employee devices are outside its boundary.
- **Decision:** Medium confidence for comparative ranges; **use with qualifications**.

**Vellaisamy, Prabhu, et al. "Characterization of Request and Token Energy Costs for LLM Inference Workloads on GPU Platforms." arXiv:2608.28044 (2026).** [Paper](https://arxiv.org/abs/2608.28044)

- **Potential use:** Contrary evidence against treating tokens or sessions as energetically identical.
- **Checked:** Experiments distinguish prefill and decode and find that model type, batch size, context length, and output length affect request energy.
- **Limitations:** Recent preprint on selected models and H100/H200 hardware; it does not supply factors for every proprietary service.
- **Decision:** Medium confidence; **use with qualifications** to explain wide project ranges.

**OpenAI. "Batch API Reference: usage object"; Anthropic. "Pricing and usage." Accessed September 20, 2026.** [OpenAI](https://platform.openai.com/docs/api-reference/batch/object?api-mode=responses) · [Anthropic](https://docs.anthropic.com/en/docs/about-claude/pricing)

- **Potential use:** Preferred measured workload inputs.
- **Checked:** OpenAI documents input, output, cached, reasoning, and total tokens. Anthropic documents input, cache creation, cache reads, output tokens, and tool-related usage examples.
- **Limitations:** Consumer interfaces may not expose these records; token records measure workload, not electricity.
- **Decision:** High confidence about the fields; **use**, with session estimates as fallback.

### Video meetings

**German Environment Agency. "Digital services / Cloud computing," videoconferencing case study.** [Source](https://www.umweltbundesamt.de/en/topics/digitalisation/green-it/digital-services-cloud-computing)

- **Potential use:** Time-based service component and boundary.
- **Checked:** Reports about 5 W and 2.27 g CO2e per participant-hour for the participating data-center component, separate from transmission and local equipment.
- **Limitations:** One case study, not a universal current factor; device and network components must be added separately.
- **Decision:** Medium confidence; **use with qualifications** as one range component.

**Guennebaud, Louis, et al. "Energy consumption of data transfer: Intensity indicators versus absolute estimates." Journal of Industrial Ecology (2024).** [DOI](https://doi.org/10.1111/jiec.13513)

- **Potential use:** Network allocation method.
- **Checked:** Tests streaming and videoconferencing and argues that simple Wh/GB indicators can misrepresent networks with fixed and dynamic power components.
- **Limitations:** Does not provide one replacement factor for every network and region.
- **Decision:** High confidence in the warning; **use** to reject one data-volume multiplier as the core formula.

**Ong, Dennis, Tim Moors, and Vijay Sivaraman. "Comparison of the energy, carbon and time costs of videoconferencing and in-person meetings." Computer Communications 50 (2014): 86–94.** [DOI](https://doi.org/10.1016/j.comcom.2014.02.009)

- **Potential use:** Meeting lifecycle components.
- **Checked:** Includes terminals, conferencing equipment, networks, and lifecycle impacts and emphasizes dependence on duration and technology.
- **Limitations:** Too old for current default coefficients.
- **Decision:** **Use with qualifications** for boundaries; reject its numerical factors as current defaults.

### Streaming, social media, and gaming

**Carbon Trust. "Carbon impact of video streaming." 2021.** [Report](https://www.carbontrust.com/sites/default/files/documents/resource/public/Carbon-impact-of-video-streaming.pdf)

- **Potential use:** Component model for data centers/CDNs, networks, routers, devices, peripherals, and grid carbon.
- **Checked:** Its 2020 European scenario estimates 188 Wh and 56 g CO2e per viewing hour for a representative mix and reports a 1.3 Wh/hour data-center/CDN component.
- **Limitations:** Industry-funded and based on 2020 European conditions. The headline result is not a global constant, and network allocation remains uncertain.
- **Decision:** Medium confidence for the component structure; **use with qualifications**.

**Mills, Evan, et al. "Toward Greener Gaming: Estimating National Energy Use and Energy Efficiency Potential." The Computer Games Journal 8 (2019).** [Study and DOI](https://energyanalysis.lbl.gov/publications/toward-greener-gaming-estimating)

- **Potential use:** Gaming categories and ranges.
- **Checked:** Measurements cover 26 gaming systems and 37 games and show wide variation by hardware and software; the study distinguishes local and cloud gaming burdens.
- **Limitations:** Hardware has changed and no value represents every desktop configuration.
- **Decision:** Medium confidence for range structure; **use with qualifications** and allow custom measured watts.

**Sony Interactive Entertainment. "Reducing the environmental impact of PlayStation products."** [Source](https://www.playstation.com/en-ca/corporate/playstation-and-the-environment/our-products/)

- **Potential use:** Current console-power examples.
- **Checked:** Describes standardized laboratory measurements; tested PS5 gaming examples vary by model and workload from below 100 W to around 200 W.
- **Limitations:** Manufacturer source covering selected PlayStation models and games only.
- **Decision:** Medium confidence for supported examples; **use with qualifications** within a broader category.

**Pirson, David, et al. "The environmental sustainability of digital content consumption." Nature Communications 15 (2024).** [DOI](https://doi.org/10.1038/s41467-024-47621-w)

- **Potential use:** Generic social-media category tied to time, device, and traffic rather than platform brands.
- **Checked:** Groups web use, social media, streaming, music, and videoconferencing and links time and devices to lifecycle inventory data.
- **Limitations:** Omits some access/core-network equipment because of limited data and models consumption patterns rather than measured application use.
- **Decision:** Medium confidence for a generic category; **use with qualifications**. Reject named-platform factors without stronger evidence.

### Uncertainty and scenario communication

**National Institute of Standards and Technology. Technical Note 1297, Appendix A; Engineering Statistics Handbook, "Uncertainty budgets and sensitivity coefficients."** [Propagation](https://www.nist.gov/pml/nist-technical-note-1297/nist-tn-1297-appendix-law-propagation-uncertainty) · [Sensitivity](https://www.itl.nist.gov/div898/handbook/mpc/section5/mpc56.htm)

- **Potential use:** Uncertainty budget and one-at-a-time sensitivity calculations.
- **Checked:** NIST describes propagating significant uncertain inputs through a measurement model and identifying influential inputs with sensitivity coefficients.
- **Limitations:** Many calculator source ranges are not probability distributions, so formal confidence claims are not justified.
- **Decision:** High confidence in the general method; **use**, labeling outputs estimate scenarios rather than confidence intervals.

**Intergovernmental Panel on Climate Change. AR6 Working Group I, Chapter 1, "Framing, Context and Methods."** [Source](https://www.ipcc.ch/report/ar6/wg1/chapter/chapter-1/)

- **Potential use:** Separate qualitative evidence confidence from numerical likelihood.
- **Checked:** Distinguishes confidence based on evidence and agreement from probabilistic likelihood.
- **Limitations:** This calculator is not conducting the IPCC's formal assessment process.
- **Decision:** High confidence in the distinction; **use with qualifications** for communication design.

### Agreed calculation boundary

- Every proposed feature contributes to the combined carbon calculation.
- Water is calculated only where compatible evidence supports consumption rather than withdrawal.
- Missing water estimates are "not estimated," never zero.
- Any combined water result is labeled partial and lists included activities.
- Water shares or rankings are not shown when missing activities would make them misleading.
- Each activity states whether its water estimate includes electricity-generation water, direct data-center cooling, both, or neither.

## Selected features

List the five selected features. Briefly explain why each was selected and how the set serves all three reference profiles. Name a few serious alternatives and explain why they were rejected.

User approval: Review the completed research directly. Confirm that sources exist and support the claims the project will use, correct the document as needed, and explicitly approve the selected features before developing the specification. The agent cannot complete this approval on the user's behalf.

### Approved feature set

1. **Multimodal AI generation (professional AI).** Separate image and video calculations inside one feature. This serves Alex and closes an explicit original-calculator exclusion. Image results use qualified ranges; supported video results use model, duration, resolution, and audio.
2. **Project-based AI workload (professional AI).** Prefer provider usage records; otherwise estimate sessions, agent runs, retries, workdays, and project duration. This serves Jordan and avoids treating every workday as identical.
3. **Full-meeting footprint (broader digital life).** Calculate duration × participant count × per-participant component ranges and add the whole meeting to the selected period. This serves Jordan and Robin, with a duplicate-entry warning.
4. **Digital media and recreation (broader digital life).** Add streaming, generic social use, and gaming through distinct sub-calculations based on time, device, region, and supported ranges. This directly covers a stated digital activity for every profile.
5. **Assumption and uncertainty scenarios (strongest remaining need).** Recalculate the complete AI-and-digital result under documented lower, central, and upper assumptions, distinguish measured inputs from models, and identify influential factors. This serves Jordan's need for ranges, Robin's trust needs, and Alex's interpretation of water and multimodal estimates.

All five change calculated results. Features 1–2 improve professional-AI representation; features 3–4 connect AI to broader digital life; feature 5 addresses the strongest remaining cross-cutting need after activity coverage.

### Serious alternatives not proposed

- **Standalone device feature:** Device choice is instead integrated into meetings and digital media so it affects calculations without inflating the feature count.
- **Local water-context score:** Employee location does not establish the serving data center's location. Retain as a future research idea.
- **Alternative-workflow comparison:** A fair non-AI counterfactual requires task-specific evidence beyond the current scope.
- **Team or department roll-up:** No profile explicitly requests it, and shared meetings or projects create double-counting risks.
- **Training allocation:** Rejected because individual allocation is highly uncertain and conflicts with the inference-focused boundary.
- **Named social-platform factors:** Rejected because evidence relies heavily on secondary data and disputed allocations, while the profiles name no platform.
- **Export-only or saved-profile feature:** Useful support behavior but not one of the five because it need not change the calculation.

### Remaining checks before approval

- Choose exact image ranges and document carbon conversion without implying proprietary-model precision.
- Define implementable low, central, and high coefficients for meetings, streaming, social use, and gaming with compatible boundaries.
- Identify which non-AI activities have defensible water inputs and label partial totals.
- Define scenario propagation rules; call no interval a confidence interval without statistical support.
- Verify every link and calculation again when the technical specification fixes exact inputs and outputs.

### User approval

- [x] The user reviewed the source assessments and confirmed that the cited sources support the intended claims on September 20, 2026.
- [x] The user explicitly approved the five selected features on September 20, 2026.

## Commands

### Start research

User: Open the project repository as your workspace, start a fresh chat, and type `start research`.

### Save transcript

Agent: After the user approves the selected features, remind them that the transcript is a deliverable and ask them to say `save transcript`. Wait for that direction.

When the user directs the agent to save the transcript, the agent saves the entire conversation in the `transcripts/` directory as `research-YYYY-MM-DD_HHMMSS.md`, marks user and agent responses clearly, and confirms the saved relative path.
