# Implementation Plan

> EDITING DIRECTIVE: USER AND AGENT EDIT THIS FILE COLLABORATIVELY. THE USER MUST REVIEW AND APPROVE ITS CONTENT.

Purpose of this file: Turn the approved specification into ordered, updatable implementation and verification work.

## Instructions for the user

Preserve the approved requirements and verify the completed work. Direct priorities, scope, and meaningful checkpoints; judge technical choices, risks, and proposed changes; and approve results only after checking them against the specification rather than relying solely on the agent's report.

If the intended result changes, update the specification. If only the route changes, update this plan and record the revision.

## Instructions for the agent

Read AGENTS.md, brief.md, research.md, spec.md, and this file, then inspect the relevant project files. Begin with a concise orientation and one focused question.

Guide planning one stage at a time. Surface dependencies, risks, and verification needs without expanding scope or making decisions for the user. Draft concise, project-specific tasks and keep them current. Never mark approval gates or user-verification items complete on the user's behalf.

## Approach

Recover the existing calculator from `origin/project-2`, then reorganize its single embedded HTML implementation into dependency-free local assets before adding features. The planned structure is `index.html` for semantic markup, `styles.css` for presentation, `js/source-data.js` for versioned coefficient and citation records, `js/calculations.js` for pure calculations and validation, and `js/app.js` for state, rendering, interaction, and cited-report generation. A browser-native harness in `tests/` will load the same calculation and source-data files and run fixtures automatically in headless Microsoft Edge; Node.js is not required.

All activity calculators will return the same structured result: lower/central/upper scenario vectors, operational and embodied components where supported, explicit `Not estimated`/zero/`Not applicable` states, boundary and coverage metadata, evidence labels, and traceable source-record identifiers. Shared aggregation will then calculate professional-AI and broader-digital subtotals, combined carbon, partial water, and AI share without rounding intermediate values. This common result contract is built before the five features so totals, exclusions, scenario switching, reporting, and tests do not develop separate rules.

Implementation proceeds in dependency order: safely recover the baseline; freeze auditable source tables; extract and regression-test existing text calculations; add explicit reporting periods; build the professional-AI features; build meetings and digital-life activities; add whole-calculator uncertainty and sensitivity; then update the remaining views, accessibility behavior, and verification evidence. Each meaningful checkpoint is tested before the next begins and committed only after checking for secrets and unrelated changes.

Important dependencies and risks:

- The checkout is four commits behind `origin/project-2`, while approved documents and transcripts are untracked. Fast-forward synchronization must preserve them byte-for-byte. Removing the recovered `water-use/` artifact or `__MACOSX/` metadata requires the user's explicit confirmation immediately before deletion.
- Several required coefficient tables are not in the current calculator. Exact values, units, compatible boundaries, versions, and derivations must be frozen from the specification's approved sources before feature calculations begin. Missing or incompatible evidence produces `Not estimated`; it is not filled with an inferred value. A source conflict that would change intended behavior requires a specification revision and user approval.
- The baseline tightly couples daily calculations, automatic 365-day annualization, rendering, lifestyle comparisons, URL sharing, and report generation. Extraction therefore keeps behavior unchanged first, proves it with regression fixtures, and only then replaces daily annualization with explicit selected-period semantics.
- Source scenario bounds may be correlated. Source-provided complete scenarios stay intact rather than combining independent component extremes. Central values and evidence labels remain model descriptions, not probability or confidence claims.
- The expanded interface risks excessive complexity. It will use repeated activity-row patterns, progressive disclosure, visible validation, and persistent coverage language while retaining keyboard operation and narrow-screen readability.

## Checklist

Replace or expand the implementation placeholders below with tasks specific to the approved specification.

### Approval gates

- [x] User reviewed, verified, and approved the research claims and selected features on September 20, 2026, as recorded in `research.md`
- [x] User reviewed and approved the complete specification on September 20, 2026, as recorded in `spec.md`
- [x] User reviewed and approved the implementation approach and task sequence on September 21, 2026

### Implementation

- [x] Record a preflight inventory and hashes for the approved documents and transcripts; verify the current branch and confirm that untracked paths will not collide with `origin/project-2`.
- [x] Fast-forward `project-2` to `origin/project-2`, then prove the approved documents and transcripts are unchanged. Ask for explicit confirmation before removing only the out-of-scope `water-use/` and `__MACOSX/` paths.
- [x] Create the dependency-free asset structure and browser-native test harness. Extract baseline source records and pure text-prompt calculations without changing results; add regression fixtures for existing model rows, unit conversion, URL/report behavior, and removal of automatic annualization.
- [ ] Freeze the approved source inputs in versioned, locally packaged records. Each record must contain a stable ID, value and unit, boundary, source title/link, publication or release date, pinned version/commit, geography, scenario role, derivation, evidence label, and limitation text. Cross-check the transcriptions and document unresolved gaps before using them.
- [ ] Implement the shared calculation foundation: explicit `Single project`, `Workweek`, and `Custom period` state; scenario-vector and component types; validation; unrounded aggregation; coverage tracking; result-state distinctions; regional electricity conversion; source lookup; and stable display formatting.
- [ ] Migrate existing text-prompt rows to selected-period semantics and the shared result contract. Preserve model selection, editable usage presets, comparison behavior, lifestyle context, citations, and cited reporting where compatible with the specification.
- [ ] Implement Feature 1, multimodal AI generation: repeatable image/video rows, supported-setting controls, frozen image and EcoLogits video methods, component results, unknown-model scenarios, source warnings, professional-AI aggregation, and image-water exclusions. Pass every Feature 1 numerical and validation fixture before continuing.
- [ ] Implement Feature 2, project-based AI workload: measured and estimated modes, editable presets, period arithmetic, retry-adjusted calls, recorded-but-unmodeled token fields, duplicate-entry warnings, project grouping, EcoLogits request calculations, and professional-AI aggregation. Pass every Feature 2 fixture before continuing.
- [ ] Implement Feature 3, full-meeting footprint: unknown/mixed and detailed endpoint modes, participant-versus-endpoint validation, whole-meeting labeling, duplicate-entry warning, benchmark calculations, broader-digital aggregation, and water exclusion. Pass every Feature 3 fixture before continuing.
- [ ] Implement Feature 4, digital media and recreation: shared activity rows plus type-specific streaming, generic social, local-gaming, and cloud-gaming controls; local-device/display accounting; infrastructure and embodied components; partial-result inclusion rules; broader-digital aggregation; and water exclusions. Pass every Feature 4 fixture before continuing.
- [ ] Implement Feature 5, assumption and uncertainty scenarios: synchronized global scenario controls, subtotals and combined totals, partial-water coverage, AI share, one-at-a-time sensitivity overrides, separate carbon/water rankings, qualitative unquantified drivers, and persistent non-confidence language. Pass every Feature 5 fixture before continuing.
- [ ] Update the cited report, model-comparison view, reset/share behavior, methodology, and lifestyle context so none restore daily annualization, conflict with the selected period, omit coverage limitations, or use unsupported impact badges or judgments.
- [ ] Complete interface integration: field-specific validation, recalculation announcements, keyboard and focus behavior, source disclosure, progressive help, add/edit/remove consistency, and responsive desktop/narrow layouts.
- [ ] At each checkpoint, review the diff for scope and secrets, run the accumulated harness, keep `spec.md` and this plan aligned with approved revisions, and create a meaningful commit only after the checkpoint is proven.

### Verification

- [ ] Run the browser-native automated harness in headless Microsoft Edge and record its output. Cover all specification fixtures for the five features plus text regressions, conversions, aggregation, scenario switching, partial coverage, zero and invalid states, add/edit/remove behavior, period changes, stable sensitivity ranking, and prohibited uncertainty wording.
- [ ] Open the calculator locally with networking unavailable and confirm that calculation, source disclosure, and the test harness work without remote APIs or package installation.
- [ ] Exercise representative Alex, Jordan, and Robin workflows at desktop and narrow viewport sizes; capture visual evidence of their activity types, totals, scenarios, citations, and visible limitations.
- [ ] Check keyboard-only operation, logical focus order, visible labels and errors, live recalculation status, non-color status communication, and readable responsive layouts.
- [ ] Trace representative displayed values through row components, aggregation, and source IDs; confirm calculations use unrounded values and that carbon and water remain separate.
- [ ] Check every citation target and every factual or numerical interface claim against the approved frozen record; record any unreachable or changed external source without silently changing the local coefficient.
- [ ] User has checked feature behavior and calculations against the specification and sources independently of the agent
- [ ] User has confirmed factual and numerical claims have working citations and communicate important limitations or uncertainty
- [ ] User has confirmed the project runs locally, serves all three reference profiles, and matches the specification

### Delivery

- [ ] Commit meaningful checkpoints and export the working chat transcripts
- [ ] Add the provided Project 2 debrief, complete it after verification, and export its transcript

## Revisions

Record material changes to the approach, sequence, or checklist and explain why they were made.

| Date | Change | Reason | Approval |
| --- | --- | --- | --- |
| September 21, 2026 | Drafted the implementation approach and ordered task sequence; selected modular local assets and a browser-native automated test harness. | The baseline is a tightly coupled 1,296-line single file, and Node.js is unavailable. Separating source data and pure calculations supports the specification's auditability and fixture requirements without adding a runtime dependency. | Approved by the user on September 21, 2026 |
| September 21, 2026 | Removed the tracked contents of the out-of-scope `water-use/` directory but retained `__MACOSX/` unchanged. An empty OneDrive placeholder named `water-use/` remains because Windows denied removal twice. | The user approved deleting only the unrelated bonus calculator, directed that the metadata directory remain untouched, and approved continuing with the empty placeholder after the access failure was reported. | Approved by the user on September 21, 2026 |

## Implementation records

### September 21, 2026 preflight and baseline recovery

- Verified branch `project-2` was four commits behind `origin/project-2`; the incoming paths had no exact collision with untracked approved documents or transcripts.
- Recorded pre-sync SHA-256 hashes: `brief.md` `C584133CBD03C88DEAA315CF55A766370A0CBACC0E3CFE20D1683E8F4AFA010A`; `research.md` `B1A925822D69C418F39287EE5E4AFCFF2012DA623B5E51AABC0D1FF598B83337`; `spec.md` `FE0940D210B2930641BB6C26B21387A2E2D2D63529F9711B3FB6DED622C5FAAA`; `plan.md` `6C0ACE3CDBAF479040655A876A895A2A27ECB28CB9839224DAD0D3C2520E0493`.
- Recorded pre-sync transcript SHA-256 hashes: `.gitkeep` `E3B0C44298FC1C149AFBF4C8996FB92427AE41E4649B934CA495991B7852B855`; `bonus-water-calculator.md` `3ED65C56A595BAE0525271A77EE94B8A4527A1C30E5A972DAC16AD13CE036A10`; `debrief-2026-09-13_222817.md` `817490E887D8E1651F08B44B66FE78444CCB6ED76B9D79F69D856654CC1B1E6D`; `plan-2026-09-21_062402.md` `AF07D371374BE298ADD6AB85820E076CAB9CE1D93483061ED959C66D55F3C317`; `research-2026-09-20_224545.md` `C811A811E97EDEBEEE498FC0D860E33A48E96E04C4131261918A86031E6F1876`; `spec-2026-09-20_232114.md` `DB98E7A79CD83BB14D40B60BF01671983E2D8944613944271EE20F0B24770FD4`.
- Fast-forwarded from `d5dec90` to `8b6bb3d` and verified every recorded hash matched afterward. The recovered baseline is `ai-prompt-footprint/index.html`. After explicit user direction, removed tracked `water-use/index.html`, retained the access-restricted empty OneDrive placeholder, and left `__MACOSX/` unchanged.

### September 21, 2026 baseline refactor and reporting-period checkpoint

- Split the standalone calculator into `index.html`, `styles.css`, `js/source-data.js`, `js/calculations.js`, and `js/app.js` without runtime dependencies. Preserved a pre-refactor screenshot and confirmed the extracted baseline rendered equivalently before changing period behavior.
- Added traceable baseline EcoLogits and regional-grid source records plus a shared pure calculation contract for lower, central, and upper scenarios; operational and embodied carbon; water; zero states; validation; unrounded scaling; and aggregation.
- Replaced daily inputs and automatic 365-day annualization with explicit `Single project`, `Workweek`, and `Custom period` labels. Text-prompt counts remain unchanged when the label changes. Updated URL restoration, visible totals, comparison context, reset behavior, and the cited report to use selected-period semantics.
- Added the browser-native harness in `tests/`. Headless Microsoft Edge passed all 12 accumulated fixtures covering the recovered model table, baseline carbon and water calculations, unit conversion, unrounded scaling, aggregation, fixed scenarios, zero and invalid inputs, period invariance and validation, URL restoration, and report non-annualization.
- Captured `tests/evidence/automated-harness.png`, `period-desktop.png`, and `period-narrow.png`. Corrected narrow-row overflow and confirmed irrelevant custom-period controls remain hidden. `git diff --check` reported no whitespace errors; the common secret-pattern scan found no matches.

## Commands

### Start planning

User: Open the project repository as your workspace, start a fresh chat, and type `start planning`.

### Start implementation

User: After approving the plan, open the project repository in a fresh chat and type `start implementation`.

Agent: Read AGENTS.md, brief.md, spec.md, and this file, then inspect only the project files relevant to the approved work. Follow AGENTS.md and the approved plan. Do not begin implementation if the plan has not been approved. Keep the plan current, but never mark approval gates or user-verification items complete on the user's behalf.

### Save transcript

Agent: At the end of planning, remind the user that the transcript is a deliverable and ask them to say `save transcript`. Wait for that direction. When directed, save the entire conversation in the `transcripts/` directory as `plan-YYYY-MM-DD_HHMMSS.md`, mark user and agent responses clearly, and confirm the saved relative path.

Agent: At the end of every implementation chat, remind the user to say `save transcript`. When directed, save the entire conversation as `build-YYYY-MM-DD_HHMMSS.md` using the same location and formatting.
