# PyPSA-Eur Romania — Comprehensive Briefing for Claude-in-Word

**Purpose:** Single-source-of-truth reference for writing/improving the doctorate report (`Raport_2_citatii_verificate.xml`) using Claude for Word. This document bundles all project knowledge, architecture details, quantitative results, regulatory context, and session instructions.

**Generated:** 2026-05-04
**Target Document:** `C:\Users\Bogdan\Desktop\Programs\pypsa-eur\vault\papers\Raport_2_citatii_verificate.xml`
**CRITICAL:** The target document is a Flat OPC XML Word file with its own style definitions already embedded. **Preserve all existing formatting, styles, fonts, spacing, margins, page layout, and section properties exactly as they are in the XML.** Only improve the text content, insert the new diagrams, and update references. Do NOT apply any external template or style overrides.

---

## 0. How to Use This File in Claude for Word

### 0.1 Setting Up the Session

1. Open the target document in Microsoft Word: **File → Open** → select `Raport_2_citatii_verificate.xml`. Word recognises Flat OPC XML natively (it may also open if renamed to `.docx`).
2. Activate the Claude task pane in Word (**Home → Claude** or the dedicated Claude ribbon).
3. Attach this file (`Claude_Word_Briefing.md`) to the conversation as the primary reference document.
4. Attach all eight SVGs from `vault/diagrams/` (`fig01_system_architecture.svg` through `fig08_eu_regulatory_framework.svg`) for figure placement.
5. Open the **Brainstorming** plugin. Configure it for *Academic / Doctoral thesis* with audience *energy-system analysts, critical-infrastructure planners, and EU policy stakeholders*.

### 0.2 CRITICAL: Style Preservation Rule

The target document (`Raport_2_citatii_verificate.xml`) is a Flat OPC XML file with its own style definitions already embedded in the XML. **These styles must be preserved exactly as they are.** Claude in Word must:

- **NEVER** apply KBO template styles, KBO Title, KBO Heading 1, KBO Text Body, or any external style set
- **NEVER** change page margins, column layout, fonts, line spacing, or section properties
- **NEVER** modify the `<w:sectPr>` block or any `<w:pPr>` / `<w:rPr>` formatting already in the XML
- **ONLY** improve the text content inside existing paragraphs, insert new diagrams, and update references
- When inserting a new paragraph or figure, **match the adjacent paragraph's style** — look at the `w:pStyle` value of neighbouring paragraphs and reuse that exact style ID
- When inserting a figure, use the same figure-placement pattern already used by existing figures in the document

### 0.3 Suggested Prompt Sequence

Run these prompts in order. Pause between each and approve insertions before proceeding.

> **Prompt 1 (Warm-up Brainstorm).** "Use the Brainstorming plugin. Goal: review the current doctorate report open in Word and critique its structure. List five risks a reviewer from an energy-systems or critical-infrastructure background might raise, with three counter-arguments per risk. Do NOT change anything in the document yet. Be concise."

> **Prompt 2 (Document Audit).** "Read the entire document and tell me: (a) what styles are defined and used, (b) what sections/chapters exist with their headings, (c) what figures or diagrams are already placed, (d) what citation format is used, (e) what the current page count and structure looks like. Do NOT modify anything. This is reconnaissance only."

> **Prompt 3 (Content Improvement Plan).** "Based on the document audit and the content in `Claude_Word_Briefing.md`, propose a section-by-section improvement plan. For each section, list: what stays as-is, what text should be improved with content from the briefing, and where each of the 8 new diagrams (fig01 through fig08) should be placed. Wait for my approval before making any changes."

> **Prompt 4 (Title, Abstract, and Introduction).** "Improve the title, abstract, and introduction sections. Use the quantitative results and architectural detail from `Claude_Word_Briefing.md`. Preserve the existing paragraph styles exactly. Do not change any formatting — only the text content within existing paragraphs. If you need to add a paragraph, match the style of its neighbours."

> **Prompt 5 (Core Sections — One at a Time).** For each major section: "Improve this section using the detailed content from `Claude_Word_Briefing.md`. Preserve the existing heading and body styles exactly as they are in the document. Only change the text. Preserve in-text citations in the format already used by the document. If the document uses a different citation style than [1], [2], match the document's existing convention."

> **Prompt 6 (Insert Figures).** "Insert the 8 SVG figures from `vault/diagrams/` into the document at the appropriate locations we agreed in the plan. Place each figure between paragraphs using the same figure-placement pattern already used in the document. Use the same caption style as existing figures. Caption text for each figure is in Section 11 of the briefing. Center figures horizontally. Do NOT change any page layout — match existing figure formatting."

> **Prompt 7 (References).** "Review and improve the References / Bibliography section. Ensure every in-text citation has a corresponding reference entry. Use the references from Section 12 of `Claude_Word_Briefing.md` to supplement, but preserve the citation format already used in the document. Do not invent references; if something is missing, leave a `[TODO: cite]` marker."

> **Prompt 8 (Acknowledgements).** "Review and improve the Acknowledgements section using content from Section 13 of the briefing."

> **Prompt 9 (Length Check).** "Use the Brainstorming plugin: report the current page count. If the document needs trimming or expansion, propose three specific changes listing exact paragraphs to cut or expand."

> **Prompt 10 (Final Review).** "Run a self-review of the entire document: check for consistent terminology, SI units only (GWh, MWh, MW, EUR/MWh, EUR), proper citation numbering, no broken cross-references, and alignment with `Claude_Word_Briefing.md`. Confirm that all formatting is preserved as originally found. Output a PASS/FAIL checklist."

### 0.4 Brainstorming Prompts (Use Between Sections)

Trigger the Claude Brainstorming skill between substantive sections:

- *"Brainstorm three counter-examples to the dual-use claim from a defence-industry sceptic's point of view."*
- *"Brainstorm five additional EU funding instruments not yet listed that might support the platform; flag risk of duplication."*
- *"Brainstorm three failure modes for the platform's interoperability claim — focus on semantic drift between national TSOs."*
- *"Brainstorm what would change in the analysis if Romania were replaced by a different EU member state. Which sections are RO-specific and which are general?"*
- *"Brainstorm three alternative case studies (summer drought, hybrid kinetic attack, gas-supply disruption) with order-of-magnitude estimates of ENS, cost delta, and LMP shift for each."*
- *"Brainstorm a one-paragraph response to a reviewer who claims that an optimisation model cannot represent adversarial behaviour."*
- *"Brainstorm three risks of mis-citation and a one-line mitigation for each."*

### 0.5 Rules for Claude in the Word Session

- **PRESERVE ALL EXISTING FORMATTING.** Never change styles, fonts, margins, columns, spacing, or section properties. The document's XML already defines these correctly.
- **Match adjacent styles.** When inserting new content, copy the `w:pStyle` value from the nearest paragraph of the same type.
- **Cite carefully.** Every citation must correspond to one reference entry. If you would have to invent a source, leave `[TODO: cite]` and list the gap.
- **Do not change the figure order.** The narrative depends on the sequence (Fig 1 → Fig 8).
- **Never mention** HTTP proxy stripping behaviour, the `PLANUI_USE_SYSTEM_PROXY` variable, or proxy environment workarounds.
- **Use SI units only.** GWh, MWh, MW, EUR/MWh, EUR.
- **Do not use abbreviations in section titles.**
- **Do not add footnotes** unless the document already uses them — match the existing convention.
- **Do not apply any KBO template, KBO styles, or external style sets.** The existing document is self-contained.

---

## 1. Project Overview

### 1.1 What is PyPSA-Eur Romania?

PyPSA-Eur Romania is a comprehensive energy system modeling project that combines:

- **Core Modeling:** PyPSA-based optimization using Snakemake workflows for energy system simulations. PyPSA (Python for Power System Analysis) is the de-facto open European power-system optimisation model.
- **Scenario Management:** Python-based scenario builder and configuration system with immutable template patterns.
- **Interactive Visualization:** Next.js/React web dashboard (in `vizualizer/` folder, intentional spelling with 'z') for scenario management and results visualization.
- **Analysis & Reporting:** Post-processing and stress-test analysis tools.
- **Documentation:** Obsidian vault (in `vault/`) containing architecture, planning, and configuration guides.

### 1.2 Technology Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js App Router | 16.2.4 |
| UI Library | React | 19.2.4 |
| Language (Frontend) | TypeScript | 5 |
| Styling | Tailwind CSS | 4 |
| CSV Parsing | papaparse | 5 |
| YAML Parsing | yaml | 2 |
| Runtime | Node.js server-side routes | (no Edge Runtime) |
| Workflow Orchestration | Snakemake | 8.0+ |
| Energy System Modeling | PyPSA | latest |
| Solver | SCIP (linear/integer programming) | latest |
| Data Processing | pandas, numpy, scipy, geopandas | |
| Weather Data | ERA5 cutouts via ECMWF MARS API | |
| Datasets | Zenodo-hosted (costs, capacities, plant inventories) | |
| Diagram Generation | draw.io desktop CLI | 24.7.5+ |

### 1.3 Repository Map

| Directory | Purpose |
|---|---|
| `config/` | Scenario YAMLs, templates, schemas, and generated config inputs |
| `scripts/` | Modeling and solving logic, including scenario shock application and network assembly |
| `rules/` | Snakemake orchestration and task wiring |
| `personal_runners/` | Convenience entry points for end-to-end scenario execution |
| `personal_analysis/` | Reporting, summarization, and interpretation of solved results |
| `personal_diagnostics/` | Validation and environment checks before or after runs |
| `vizualizer/` | Primary web UI for scenario creation, queue management, and result browsing |
| `personal_dashboard/` | Legacy Tkinter UI retained as a fallback and reference implementation |
| `personal_docs/` | Long-form project documentation, templates, and implementation notes |
| `personal_data_download/` | ERA5 cutout and Zenodo dataset acquisition |
| `vault/` | Obsidian knowledge base with architecture and process documentation |

---

## 2. High-Level System Architecture

### 2.1 Complete Scenario Lifecycle

```
User input in browser
  ↓
Template YAML in personal_docs/
  ↓ (merge + normalize)
Scenario builder (vizualizer/src/app/lib/scenario.ts)
  ↓ (POST /api/scenario/build)
Generated YAML written to config/adversarial/generated/
  ↓ (POST /api/runs/enqueue)
Job queued and persisted to vizualizer/.data/planui-state.json
  ↓ (when runner is free)
Snakemake unlock/solve commands spawned (with conda/Python detection)
  ↓
Network optimization and solving
  ↓
Results written to results/<output_name>/
  ↓
Comparison report generated (system_cost_comparison.csv, figures, etc.)
  ↓
Dashboard auto-scans and displays valid result folders
```

### 2.2 Six-Layer Architecture

**Layer 1 — Presentation Layer:**
- React 19 client served by Next.js 16
- Bilingual (English / Romanian) with language toggle
- Theme toggle (light/dark mode) persisted to localStorage
- Three control-room tabs: Scenario Builder, Run Queue, Results Viewer

**Layer 2 — API & Service Layer:**
- Typed Next.js route handlers structured as REST resources
- `/api/scenario/*` — template loading, YAML building
- `/api/runs/*` — enqueue, cancel, delete, reset, log tailing, baseline discovery
- `/api/results/*` — folder scanning, summary extraction, CSV preview, figure serving, drawio/SVG export, diagram generation

**Layer 3 — Domain Logic & Orchestration:**
- `scenario.ts` — Loads year-specific YAML templates, validates form inputs, merges defaults with user shocks, generates paired baseline + scenario YAMLs
- `job-runner.ts` — Sequential execution queue (one job at a time), conda env detection, subprocess spawn with real-time stdout/stderr tailing, state persistence with restart resilience
- `results.ts` — Recursive scan of results/, 7-CSV contract validation, summary metric extraction, figure/drawio/SVG asset serving
- `runtime.ts` — Conda environment priority chain, cross-platform process execution, Snakemake CLI prefixing, environment isolation

**Layer 4 — Workflow & Optimisation Layer (Python):**
- Snakemake Workflow: DAG orchestration of data retrieval, network assembly, solver invocation
- PyPSA Network Model: Component assembly and constraint API
- Stress-Test Module (`romania_winter_stress.py`): Shock injection (pre-solve timeseries shocks), SCADA proxy (ramp-rate constraints), import caps (directional flow constraints)
- Report Module (`report_romania_winter_stress.py`): Baseline vs. scenario comparison, CSV generation, figure creation
- SCIP Solver: Mixed-integer linear programming, conda-managed binary

**Layer 5 — Persistence & Data Layer:**
- `config/adversarial/generated/` — Generated baseline + scenario YAMLs
- `results/<name>/` — 7 required CSVs, PNG figures, SVG/drawio diagrams, assumptions markdown
- `vizualizer/.data/planui-state.json` — Job queue with lifecycle state, survives app restarts
- `logs/planui-web/<jobId>.log` — Per-job stdout/stderr archive

**Layer 6 — External Data Sources:**
- ECMWF ERA5 — Atmospheric reanalysis for renewable-resource time series (~2 GB per year)
- Zenodo Datasets — Cost, capacity, plant inventories (~500 MB)
- ENTSO-E TYNDP — Cross-border interconnector parameters
- GADM / NUTS — Administrative boundaries

### 2.3 Data Flow Diagram

```
vizualizer/ reads  → results/                        (comparison outputs)
                   → config/adversarial/generated/   (scenario configs)
                   → personal_docs/                  (templates, read-only)
vizualizer/ writes → config/adversarial/generated/   (newly generated configs)
                   → logs/planui-web/                (per-job log files)
                   → vizualizer/.data/               (job state JSON)
```

---

## 3. Scenario Builder System

### 3.1 Supported Modes

**Paired Mode (default):**
- Generates `<slug>_baseline.yaml` (stress_test.enable=false) and `<slug>_scenario.yaml` (stress_test.enable=true)
- Runs baseline first (no stress), then scenario (with stress)
- Report script compares baseline vs. scenario
- Best for stress test analysis

**Single Mode:**
- Generates only `<slug>_scenario.yaml`
- Uses existing baseline network for comparison
- Baseline solve skipped; saves time if reference already exists

### 3.2 Form Fields

| Field | Purpose | Example |
|---|---|---|
| Scenario Slug | Short name (alphanumeric + underscore) | `winter_stress_v2` |
| Countries | Comma-separated country codes | `RO,BG,HU,RS` |
| Cutout Year | Year for weather data | `2023` |
| Snapshot Start | Start date YYYY-MM-DD | `2023-01-15` |
| Snapshot End | End date (≥ start) | `2023-01-22` |
| Cluster Count | Network nodes (1-50) | `20` |
| Solver Name | Linear/integer solver | `scip` |
| Solver Options | Additional flags (pipe-delimited) | `solver_logfile=false` |

### 3.3 Template System
- Year-specific templates auto-detected from `personal_docs/scenario_template_<year>.yaml`
- Falls back to `scenario_template.yaml` if year not found
- Immutable Template Pattern: templates are read-only; user configs generated to `config/adversarial/generated/`
- Dual editing modes: structured form controls OR raw YAML editor (both update same config)

### 3.4 Form Validation Rules
- Snapshot dates: start ≤ end, both valid YYYY-MM-DD, must fall within selected cutout year
- Cluster count: positive integer, 1-50 typical
- Slug: alphanumeric + underscores only
- Reference baseline (single mode): must be valid path to existing network

---

## 4. Stress Test System

### 4.1 Five Shock Channels

The shock toolkit is intentionally compact and orthogonal so that combinations are interpretable:

| Shock | Type | Range | Effect |
|---|---|---|---|
| **Load Multiplier** | Continuous | 0.5 – 2.0 | Demand scaling (1.3 = +30%) |
| **Hydro Reduction** | Continuous | 0.0 – 1.0 | Hydro availability cut (0.3 = -70%) |
| **Gas Capacity Reduction** | Continuous | 0.0 – 1.0 | Gas plant pmax reduction (0.5 = -50%) |
| **SCADA Proxy** | Binary toggle | on/off | Ramp-rate constraints on thermal generators (~15%/h) |
| **Import Cap** | Binary toggle + value | on/off + MWh | Directional flow caps on border interconnectors |

**Orthogonality:** 2⁵ = 32 test combinations from binary toggles alone, plus continuous parameter sweeps.

### 4.2 Shock Application Mechanism

1. **Pre-solve timeseries shocks** — `apply_timeseries_shocks()` in `romania_winter_stress.py`:
   - Load multiplier: scales demand time series
   - Hydro reduction: scales hydro inflow availability
   - Gas capacity reduction: scales gas plant p_max_pu

2. **Constraint generation** — Added as linear constraints before optimization:
   - `add_scada_proxy_constraints()` — Ramp-rate limits on controllable generators
   - `add_import_cap_constraints()` — Directional flow caps on border interconnectors

3. **Solver core unchanged** — Shocks alter inputs or add constraints; the SCIP solver formulation remains the same

### 4.3 Configuration Architecture

- **Baseline Configs:** No shocks applied, `stress_test.enable=false`
- **Stress Configs:** Shock parameters defined, `stress_test.enable=true`
- **Paired Scenarios:** Baseline + stress run together for comparison
- **Geographic Scope:** Romania stress tests typically cover `[RO, BG, HU, RS]`; shocks applied only to RO
- **Time Windows:** Specified in UTC; conversions to local EET handled in reporting

---

## 5. Job Execution System

### 5.1 Job States

| State | Meaning | Can Transition To | Notes |
|---|---|---|---|
| `queued` | Waiting for runner | `running`, `cancelled` | User can cancel before start |
| `running` | Currently executing | `succeeded`, `failed`, `cancelled`, `interrupted` | Only one job at a time |
| `succeeded` | Completed with exit code 0 | (terminal) | Results should be discoverable |
| `failed` | Failed with non-zero exit code | (terminal) | Check log for error details |
| `cancelled` | User requested cancellation | (terminal) | SIGTERM sent to process |
| `interrupted` | App restarted while running | (terminal) | Manual re-run needed |

### 5.2 Paired Mode Execution Flow

```bash
# Commands assembled and run sequentially:
conda run -n pypsa snakemake --unlock --configfile config/adversarial/generated/<slug>_baseline.yaml
conda run -n pypsa snakemake --solve --configfile config/adversarial/generated/<slug>_baseline.yaml
conda run -n pypsa snakemake --solve --configfile config/adversarial/generated/<slug>_scenario.yaml
conda run -n pypsa python scripts/report_romania_winter_stress.py --baseline <path> --scenario <path> --output <path>
```

### 5.3 Conda Environment Detection Chain

Priority order for Python/Snakemake discovery:
1. `PLANUI_CONDA_ENV` env var (named environment)
2. `PLANUI_CONDA_PREFIX` env var (prefix path)
3. Active conda prefix (`$CONDA_PREFIX` if not `base`)
4. `CONDA_DEFAULT_ENV` (if not `base`)
5. Named environment candidates: `pypsa`, then `pypsa-eur`
6. System Python fallback

### 5.4 Typical Solve Times
- Baseline solve: 7-15 minutes (20 clusters, hourly resolution)
- Stress scenario solve: 8-12 minutes (usually ±10% due to constraint additions)
- Report generation: 2-3 minutes
- Total paired run: 20-25 minutes

### 5.5 Monitoring and Debugging
- Real-time log tailing from `logs/planui-web/<jobId>.log`
- Progress text extracted and displayed in UI
- Log retention: indefinite (manual cleanup recommended)
- Common log messages: "Building DAG of jobs", "Unlocking workflow", "Solving network", "Generating report"
- Error indicators: `[INFEASIBLE]`, "SCIP not found", solver convergence warnings

---

## 6. Results Contract (The Seven-CSV System)

### 6.1 Required CSVs

Every comparison between baseline and stressed scenario must produce exactly 7 CSVs:

| # | CSV File | Required Columns | Content |
|---|---|---|---|
| 1 | `system_cost_comparison.csv` | `metric`, `baseline_value`, `scenario_value`, `delta_meur`, `delta_percent` | Total cost, generation costs, transmission costs |
| 2 | `generation_mix_mwh.csv` | `technology`, `baseline_mwh`, `scenario_mwh`, `delta_mwh`, `delta_percent` | MWh by technology (wind, solar, hydro, gas, coal, nuclear) |
| 3 | `lmp_summary_ro.csv` | `metric`, `baseline_eur_mwh`, `scenario_eur_mwh`, `delta_eur_mwh` | Min/mean/max locational marginal prices |
| 4 | `ens_summary.csv` | `metric`, `baseline_gwh`, `scenario_gwh`, `delta_gwh`, `delta_percent` | Energy not served (unmet demand) by country |
| 5 | `curtailment_mwh.csv` | `technology`, `baseline_mwh`, `scenario_mwh`, `delta_mwh`, `delta_percent` | Curtailed renewable generation |
| 6 | `daily_net_imports_mwh.csv` | `date`, `baseline_mwh`, `scenario_mwh`, `delta_mwh` | Daily aggregated net imports |
| 7 | `interconnector_flow_congestion.csv` | `line`, `congestion_hours_baseline`, `congestion_hours_scenario`, `delta_hours` | Congestion hours per interconnector |

**Critical rule:** The dashboard hides any folder lacking one of these files. Downstream tools never confront partial outputs. If a result folder does not appear in the dashboard, the CSV contract is the first thing to check.

### 6.2 Optional Files
- `assumptions_limitations.md` — Markdown note on shock formulation, constraints, and interpretation limits
- PNG figures (`fig_01.png` through `fig_05.png`) — Rendered charts and diagrams
- `.drawio` files — Editable diagram assets
- `.svg` files — Vector graphics exports

### 6.3 Interoperability Significance

The seven-CSV contract is the compatibility boundary for the entire workflow. Both the dashboard and the reporting scripts share the same expectation about the result folder layout. This is the core of the platform's interoperability claim: any downstream tool that understands these seven CSVs can consume results from any deployment of the platform.

---

## 7. Romania Winter Case Study — Quantitative Results

### 7.1 Scenario Configuration

| Parameter | Value |
|---|---|
| Time Window | 15-22 January 2023 (8-day winter week) |
| Countries | RO, BG, HU, RS |
| Spatial Resolution | 20 clusters |
| Solver | SCIP |
| Load Multiplier | 1.30 (30% demand surge) |
| Hydro Reduction | 0.10 (10% unavailable) |
| Gas Capacity Reduction | 0.20 (20% derating) |
| SCADA Proxy | Enabled (ramp-rate limits on thermal units) |
| Import Cap | 0 MWh (complete cross-border electrical isolation of Romania) |

### 7.2 Headline Results

| Metric | Baseline | Scenario | Delta |
|---|---|---|---|
| **Total System Cost** | ~1,850 M EUR | ~2,420 M EUR | **+570 M EUR (+31%)** |
| **Energy Not Served (RO)** | 0.0 GWh | 45.2 GWh | **+45.2 GWh** |
| **Mean LMP (RO)** | 65 EUR/MWh | 145 EUR/MWh | **+80 EUR/MWh (+123%)** |
| **Max LMP (RO)** | 180 EUR/MWh | 380 EUR/MWh | **+200 EUR/MWh (+111%)** |
| **Daily Net Imports (RO)** | ~+450 MWh/h | 0 MWh/h | **Complete cutoff** |

### 7.3 Generation Mix Shift

| Technology | Baseline | Scenario | Delta | Note |
|---|---|---|---|---|
| Wind | 250 GWh | 250 GWh | 0 | Weather-fixed |
| Solar | 120 GWh | 120 GWh | 0 | Weather-fixed |
| Hydro | 280 GWh | 252 GWh | -10% | Reduction applied |
| Gas | 580 GWh | 950 GWh | +37% | Compensating but bounded by ramp |
| Coal | 420 GWh | 510 GWh | +21% | Partially compensates |
| Nuclear | 400 GWh | 400 GWh | 0 | Already at max |

### 7.4 Key Interpretations

1. **Vulnerability confirmed.** Even mild simultaneous derating (10% hydro, 20% gas) combined with a 30% demand spike triggers blackouts under cross-border isolation, despite Romania's domestic baseload.

2. **Temporal concentration.** ENS concentrated in evening-peak hours (18:00-21:00) and morning ramp-up (06:00-08:00). Northern regions hit harder than Bucharest area. ~80% of ENS in peak hours suggests demand-flexibility programmes and targeted storage have asymmetric leverage.

3. **Cost of isolation.** ~12-15 M EUR per GWh of forgone imports (from LMP signals). This provides a quantitative input to the value-of-interconnection discussion required by TYNDP and PCI processes.

4. **Capacity gap.** ~45 GWh shortfall over 8 days ≈ 5.6 GWh/day average gap → need 1-2 large plants or major renewable + storage deployment.

### 7.5 Important Caveats

- The case study is not predictive of any specific event; it is an **envelope** indicating order of magnitude.
- Deterministic, not probabilistic — no sensitivity analysis, no confidence intervals.
- Single year of weather data (2023); different weather years would produce different renewables output.
- The 2⁵ orthogonal shock combinations are designed for sensitivity sweeps; the case study is one cell.
- **The numbers' purpose is calibration, not forecast.**

---

## 8. Dual-Use Technology Framework

### 8.1 The Dual-Use Argument

The same platform serves two distinct use-case columns from a single, unchanged engineering core:

**Civilian Applications:**
- Net-zero pathway studies for ministries, regulators, TSOs
- Renewables siting and grid expansion analysis
- Wholesale market design (LMP, congestion, cross-border flows)
- Climate adaptation studies (heatwave, drought, cold-snap)
- Public engagement and education

**Shared Core Capabilities (unchanged across both uses):**
- Network optimisation engine (PyPSA + Snakemake + SCIP)
- Stress/shock injection (load multipliers, capacity reductions, ramp-rate & flow caps)
- Open data ingestion (ECMWF ERA5, ENTSO-E, Zenodo)
- Reproducible result contract (7-CSV deterministic schema)
- Web orchestration & queueing (Vizualizer dashboard)

**Defence/Security Applications:**
- Critical Entities Resilience assessments (Directive (EU) 2022/2557)
- Hybrid threat modelling (cyber-physical, supply-chain, kinetic disruption playbooks)
- Energy-supply contingency planning
- Strategic reserve sizing against worst-case ENS envelopes
- Allied interoperability exercises (NATO/EU table-top resilience drills)

### 8.2 Regulatory Alignment

Three EU legal instruments converge:

1. **NIS2 Directive (EU) 2022/2555** — Cybersecurity obligations on operators of essential services (TSOs, DSOs). Imposes a defensive posture.

2. **Critical Entities Resilience Directive (EU) 2022/2557** — Extends obligations to physical and hybrid threats. Requires national risk assessments identifying dependencies, vulnerabilities, and stress scenarios. Demands quantitative resilience evidence.

3. **Recast Dual-Use Regulation (EU) 2021/821** — Governs export and intra-Union transfer of dual-use items. Contains a public-domain carve-out for openly published software and data. A platform whose codebase is openly published is exempt, but a deployed instance that integrates national-confidential data may fall back under control.

### 8.3 Architectural Separation

The orchestration layer (open, MIT/Apache-licensed) is separated from the data layer (operator-controlled). This means:
- Same codebase serves civilian and defence purposes without licensing collision
- Codebase remains open and peer-reviewable (satisfying dual-use carve-out)
- National deployment with classified parameters can be assessed independently

---

## 9. EU Funding Mechanisms

### 9.1 Horizon Europe — Cluster 5 (Climate, Energy & Mobility)

- Principal R&I instrument funding open energy modelling
- 2023-2024 work programme cites "open and interoperable energy system models" as eligible activity
- Platform's permissive licensing satisfies open-science obligations
- Supports renewable and grid optimisation R&I

### 9.2 European Defence Fund (EDF)

- Energy & environment category explicitly supports resilience-related work
- Explicitly contemplates dual-use leverage where civilian foundations exist
- Stress-test envelopes generated by the platform are admissible inputs to EDF resilience proposals
- Open-source carve-out keeps code outside controlled-items list; deployment artefacts can be classified independently

### 9.3 Connecting Europe Facility (CEF) — Energy

- Funds cross-border interconnector projects through Projects of Common Interest (PCI) list
- Platform outputs (interconnector-flow congestion, net-import deltas under stress) feed directly into CBA requirements
- CEF Digital adds complementary track for data infrastructure

### 9.4 rescEU and Critical Raw Materials Act

- Civil-protection funding under Union Civil Protection Mechanism backs preparedness exercises
- Includes energy-supply contingencies
- Critical Raw Materials Act (2024) connects energy storage and grid hardware supply chains to resilience agenda

### 9.5 Multi-Instrument Funding Architecture

A platform that internalises EIF interoperability obligations can claim eligibility across all four instruments without architectural duplication, because its outputs are interpretable in each instrument's terms:
- R&I code → Horizon Europe
- Resilience evidence → EDF
- CBA inputs → CEF Energy
- Preparedness exercises → rescEU

---

## 10. European Interoperability Framework (EIF) Mapping

### 10.1 The Five-Layer Mapping

| EIF Layer | Generic Concern | Realisation in PyPSA-Eur Romania |
|---|---|---|
| **LEGAL** | Compatible licensing, data-protection, dual-use export controls, public-procurement compliance | MIT/Apache-style licensing on PyPSA + permissive licensing on Vizualizer. Public ECMWF/Zenodo provenance avoids licensing collisions. Open-source carve-out under EU Reg. 2021/821 simplifies cross-border collaboration. |
| **ORGANISATIONAL** | Aligned business processes, role definitions, governance, change management | Three-tab UI (Builder · Runs · Results) maps to RACI roles: analyst configures, operator monitors, decision-maker reviews. Sequential queue documents runs; persistent state provides organisational audit trail. |
| **SEMANTIC** | Shared meaning, units, vocabularies, ontologies | SI units enforced (MWh, MW, EUR/MWh). Country codes follow ISO-3166-1 (RO, BG, HU, RS). ENTSO-E component identifiers. Result schema names align with TYNDP expectations. Bilingual UI (EN/RO) preserves single semantic layer. |
| **TECHNICAL** | Standard formats, protocols, API contracts | YAML configuration, netCDF (CF conventions) for climate, CSV results, REST/HTTP for API, drawio + SVG for figure portability, Snakemake DAG for reproducible execution, Conda env spec for deterministic dependency resolution. |
| **GOVERNANCE** (proposed addition) | Coordination, monitoring, accountability | Job state JSON, immutable templates and per-run logs constitute a governance audit envelope. Snakemake provenance is reproducible from form input to figure. Each result inherits `assumptions_limitations.md` for epistemic provenance. |

### 10.2 The Core Claim

Interoperability becomes a **verifiable** property rather than an aspirational claim — each layer is enforced by a concrete artefact in the codebase.

---

## 11. Figures (Insertion Order, Captions, and Source Files)

All eight figures are SVG files exported with transparent background and light theme from `vault/diagrams/`. Theme colours: navy `#0A3DA3`, dark navy `#072A75`, scenario orange `#F28C28`, success green `#0F7B3B`, alert red `#C4372A`, ink `#1E2B3A`, muted `#5D6A7B`.

| Order | File (relative to repo root) | Caption (verbatim) |
|---|---|---|
| Figure 1 | `vault/diagrams/fig01_system_architecture.svg` | *Figure 1: Six-layer architecture of the PyPSA-Eur Romania platform. Source: authors, derived from the project codebase.* |
| Figure 2 | `vault/diagrams/fig02_scenario_lifecycle.svg` | *Figure 2: Stress-test scenario lifecycle from form input to comparable result, with the five shock channels exposed by the dashboard. Source: authors.* |
| Figure 3 | `vault/diagrams/fig03_risk_matrix.svg` | *Figure 3: Likelihood–severity risk matrix for European energy systems under an Industry 5.0 lens, mapped to the platform's stress-test coverage. Source: authors, categories adapted from Directive (EU) 2022/2557.* |
| Figure 4 | `vault/diagrams/fig07_shock_taxonomy.svg` | *Figure 4: Stress-test shock taxonomy — classification of the five shock channels by threat domain, type/range, operational effect, and real-world analogue. Source: authors.* |
| Figure 5 | `vault/diagrams/fig06_case_study_results.svg` | *Figure 5: Romania winter case study quantitative results — system cost, ENS, LMP shift, and generation mix under cross-border isolation (15–22 January 2023). Source: authors.* |
| Figure 6 | `vault/diagrams/fig04_dual_use_mapping.svg` | *Figure 6: Dual-use capability mapping – civilian, shared core and defence/security columns – with aligned EU funding instruments. Source: authors, instruments compiled from official EU work programmes.* |
| Figure 7 | `vault/diagrams/fig08_eu_regulatory_framework.svg` | *Figure 7: EU regulatory framework interaction — how NIS2, the CER Directive, the Dual-Use Regulation, and EU funding instruments converge on the platform. Source: authors.* |
| Figure 8 | `vault/diagrams/fig05_interoperability_stack.svg` | *Figure 8: Mapping of the platform onto the four-layer European Interoperability Framework, augmented with a governance layer. Source: authors.* |

**Figure placement note:** Match the existing figure-placement pattern already in the document (page width, caption positioning, text wrapping). SVGs render as vector graphics natively in Word 2016 SP and later. Do NOT change the document's page layout to accommodate figures — use whatever figure formatting convention the document already employs.

### 11.1 Figure Descriptions for In-Text References

**Figure 1 — System Architecture:** Six horizontal layers from Presentation (top) through External Data (bottom). Each layer contains component blocks with role annotations. Colour-coded: navy for core infrastructure, blue for API/services, green for workflow, orange for stress-test components, grey for persistence.

**Figure 2 — Scenario Lifecycle:** Five-phase horizontal flow (CONFIGURE → GENERATE → QUEUE → SOLVE → VALIDATE & SHOW) with arrows. Below the flow, five stress shock boxes show injection points and parameter ranges, annotated with the orthogonal composition principle (2⁵ combinations).

**Figure 3 — Risk Matrix:** 3×3 likelihood-severity grid with colour gradient (green → yellow → red). Nine risk items placed across cells from routine variability to critical compound threats. Legend maps colours to modelling coverage. Bottom band maps Industry 5.0 pillars (human-centric, sustainability, resilience) to platform capabilities.

**Figure 4 — Shock Taxonomy:** Five-row classification table (Demand-Side / Supply-Side ×2 / Control-Plane / Cross-Border) with columns for threat domain, shock channel, type/range, operational effect, and real-world analogue. Bottom section shows the shock application mechanism: pre-solve injection → constraint generation → unchanged solver core. Orthogonality principle annotated.

**Figure 5 — Case Study Results:** Five headline metric cards (Cost Delta +570 M EUR, ENS 45.2 GWh, LMP 65→145 EUR/MWh, Gas Generation +37%, Isolation Cost 12–15 M EUR/GWh). Generation mix bar chart comparison for all six technology groups. LMP summary table (min/mean/max). ENS distribution analysis (temporal concentration, regional asymmetry, neighbour impact, capacity gap estimate). Four policy-implication panels at bottom.

**Figure 6 — Dual-Use Mapping:** Three-column layout: Civilian Applications (green, left), Shared Core Capabilities (navy, centre), Defence/Security Applications (red, right). Double-headed arrows show bidirectional data flow. Lower band lists four EU funding instruments with colour-coded alignment.

**Figure 7 — EU Regulatory Framework:** Three-pillar layout (NIS2 Directive, CER Directive, Dual-Use Regulation) converging into a platform convergence zone. Four funding instrument detail cards (Horizon Europe Cluster 5, EDF, CEF, rescEU + CRMA) with output-to-instrument alignment. Architectural separation principle annotated at bottom.

**Figure 8 — Interoperability Stack:** Five-row table with columns: EIF Layer, Generic Concern, Realisation in PyPSA-Eur Romania. Rows: Legal, Organisational, Semantic, Technical (blue), Governance (orange, proposed fifth layer). Bottom caption notes that each layer is enforced by a concrete artefact in the codebase.

---

## 12. References

Numbered to match in-text [n] citations. First-appearance order.

1. European Union Agency for Cybersecurity (ENISA). *Threat Landscape for the Energy Sector*. Athens: ENISA; 2023.

2. International Energy Agency. *Power Systems in Transition: Challenges and Opportunities Ahead for Electricity Security*. Paris: OECD/IEA; 2020.

3. European Commission. *European Interoperability Framework – Implementation Strategy*. COM(2017) 134 final. Brussels: European Commission; 2017.

4. European Parliament and Council. *Regulation (EU) 2021/821 of 20 May 2021 setting up a Union regime for the control of exports, brokering, technical assistance, transit and transfer of dual-use items (recast)*. Official Journal of the European Union L 206; 11 June 2021.

5. Hörsch J., Hofmann F., Schlachtberger D., Brown T. PyPSA-Eur: An open optimisation model of the European transmission system. *Energy Strategy Reviews*. 2018; 22: 207–215.

6. Breque M., De Nul L., Petridis A. *Industry 5.0 – Towards a sustainable, human-centric and resilient European industry*. Luxembourg: Publications Office of the European Union; 2021.

7. European Parliament and Council. *Directive (EU) 2022/2555 of 14 December 2022 on measures for a high common level of cybersecurity across the Union (NIS2)*. Official Journal of the European Union L 333; 27 December 2022.

8. European Parliament and Council. *Directive (EU) 2022/2557 of 14 December 2022 on the resilience of critical entities*. Official Journal of the European Union L 333; 27 December 2022.

9. European Commission. *Horizon Europe Work Programme 2023–2024 – Cluster 5: Climate, Energy and Mobility*. Brussels: European Commission; 2023.

10. Pfenninger S., Hawkes A., Keirstead J. Energy systems modeling for twenty-first century energy challenges. *Renewable and Sustainable Energy Reviews*. 2014; 33: 74–86.

11. European Commission. *European Defence Fund Annual Work Programme 2024*. Brussels: European Commission; 2024.

12. European Network of Transmission System Operators for Electricity (ENTSO-E). *Ten-Year Network Development Plan 2024 – Methodology*. Brussels: ENTSO-E; 2024.

13. European Parliament and Council. *Regulation (EU) 2024/1252 of 11 April 2024 establishing a framework for ensuring a secure and sustainable supply of critical raw materials*. Official Journal of the European Union L 173; 22 April 2024.

14. World Wide Web Consortium. *PROV-O: The PROV Ontology, W3C Recommendation 30 April 2013*. Cambridge MA: W3C; 2013.

---

## 13. Acknowledgements

> The author thanks the PyPSA-Eur open-source community for an exceptionally well-structured modelling substrate, and the Romanian academic community for ongoing exchanges on national grid resilience. Computational work was carried out on locally-managed resources; no institutional funding is reported.

---

## 14. Key Architectural Decisions (Reference)

1. **Immutable Template Pattern** — Templates in `personal_docs/` are read-only; user configs generated to `config/adversarial/generated/`
2. **Year-Specific Templates** — Auto-select logic eliminates manual template management; fallback safety if template missing
3. **Web-First Dashboard** — `vizualizer/` (Next.js) is the primary UI; Tkinter UI retained as stable fallback
4. **Queue-Based Execution** — Async subprocess management prevents blocking; job state persisted across app restarts
5. **New-Format Results Only** — Results page only displays comparison outputs meeting CSV validation criteria
6. **Dual Editing Modes** — Form + YAML allows both guided and power-user workflows
7. **Stress Test Modular Design** — Shock logic isolated in `romania_winter_stress.py` for testability and reusability
8. **Conda Auto-Discovery** — Web dashboard detects the conda env at startup

---

## 15. Extension Guidance

### Adding New Stress Types
1. Define new shock parameters in template YAML under `stress_test`
2. Implement shock application logic in `scripts/romania_winter_stress.py`
3. Add constraint generation in the same script
4. Update UI surface in `vizualizer/src/app/`
5. Add new result metrics to reporting script

### Supporting New Geographic Regions
1. Extend PyPSA-Eur config scope
2. Create region-specific template: `personal_docs/scenario_template_<region>.yaml`
3. Update shock logic to apply only to target countries
4. Add region-specific result visualizations

### Adding Support for a New Year
1. Create `personal_docs/scenario_template_<year>.yaml`
2. Verify cutout file exists: `data/cutout/archive/v0.8/europe-<year>-sarah3-era5.nc`
3. No code changes needed; `resolve_template_path()` auto-detects new template
4. Restart web dashboard; year appears in Cutout Year dropdown

---

## 16. Validation and Diagnostics

### Pre-Run Validation Checklist:
1. `python personal_diagnostics/check_romania.py` — Validates YAML config syntax, cutout references, solver availability
2. `personal_runners/run_baseline_only.bat` — Quick baseline test (30-60 seconds)
3. `python personal_diagnostics/check_csv.py` — Validates result CSVs match expected schema
4. `python personal_diagnostics/check_url.py` — Tests external data source connectivity

### Common Issues:
- `FileNotFoundError: cutout not found` → Run `personal_data_download/download_cutout.py`
- `ModuleNotFoundError: pkg_resources` → `conda run -n pypsa pip install "google-cloud-storage>=2.10"`
- `SCIP solver not found` → `conda install -c conda-forge scip`

---

## 17. NATO/CCDCOE Critique & Counter-Arguments (For Defence Reviewers)

**Critique 1: "Optimisation models can't represent adversaries."**
- Counter A: The platform is positioned as the consequence-quantification layer that complements (not replaces) red-team and attack-graph tools.
- Counter B: CER Directive Art. 13 national risk assessments explicitly require quantitative impact estimates — exactly what optimisation provides.
- Counter C: The paper already books cyber-physical co-simulation as future work; the current claim is bounded to post-compromise system response.

**Critique 2: "'Dual-use' framing is asserted, not demonstrated."**
- Counter A: The contribution is explicitly *substrate*, not deployment — analogous to how GIS stacks became dual-use long before any specific military adoption.
- Counter B: TYNDP and PCI cost-benefit analyses are already consumed by ENTSO-E and DG ENER for cross-border resilience decisions.
- Counter C: Allied table-top exercises need reproducible scenario libraries — the seven-CSV contract is a concrete artefact for that.

**Critique 3: "Open-source + critical infrastructure = attacker reconnaissance gift."**
- Counter A: The network data ingested (ENTSO-E TYNDP, ECMWF ERA5, GADM) is already public; the platform composes public data.
- Counter B: The architectural separation (open orchestration / operator-controlled data) means classified deployments inherit the codebase without publishing their parameterisation.
- Counter C: Security-through-obscurity has a poor track record; peer-reviewable models produce more defensible policy than vendor black boxes.

**Critique 4: "The headline number is fragile (deterministic, no sensitivity analysis)."**
- Counter A: The paper explicitly disclaims prediction ("envelope indicating order of magnitude").
- Counter B: The 2⁵ orthogonal shock combinations support sensitivity sweeps; the case study is one cell, not the methodology's ceiling.
- Counter C: Deterministic worst-case envelopes are the convention in CER Art. 13 and N-k contingency studies.

**Critique 5: "EU-funding pitch reads as opportunism."**
- Counter A: The instruments cited each fund a *distinct* artefact (R&I code, resilience evidence, CBA inputs, preparedness exercises).
- Counter B: Cross-instrument alignment is EU policy — the Strategic Compass and 2024 Defence Industrial Strategy explicitly call for civil-military convergence on critical-infrastructure tooling.
- Counter C: The dual-use carve-out under Reg. 2021/821 is invoked at the codebase level; deployment-level funding is independently classifiable.

---

## 18. Diagram Generation Reference (for draw.io MCP)

### 18.1 Generating New Diagrams

The draw.io desktop application is at `C:\Program Files\draw.io\draw.io.exe`. Use the MCP server or CLI to generate diagrams.

**CLI export commands:**
```bash
# Export to PNG
"C:\Program Files\draw.io\draw.io.exe" --export --format png --border 20 --output output.png input.drawio

# Export to SVG (transparent background)
"C:\Program Files\draw.io\draw.io.exe" --export --format svg --border 8 --output output.svg input.drawio
```

### 18.2 Theme Reference (from generate-diagrams.mjs)

**Default theme palette:**
- Navy (primary): `#0A3DA3`
- Navy dark (header, accents): `#072A75`
- Sky (background fills): `#EDF5FF`
- Paper (page background): `#F7FAFF`
- Line (borders): `#C7D5EF`
- Baseline data colour: `#0A3DA3` (navy)
- Scenario data colour: `#F28C28` (orange)
- Positive/improvement: `#0F7B3B` (green)
- Negative/deterioration: `#C4372A` (red)
- Track (bar chart background): `#E3ECFA`
- Ink (primary text): `#1E2B3A`
- Muted (secondary text): `#5D6A7B`

**SVG light theme (transparent background):**
- Same colours as default
- Paper: `none` (transparent)

### 18.3 draw.io XML Structure Template

```xml
<?xml version="1.0" encoding="UTF-8"?>
<mxfile host="pypsa-eur-romania" version="29.6.6" type="device">
  <diagram name="Diagram Name" id="diagram-id">
    <mxGraphModel dx="1422" dy="800" grid="0" gridSize="10" guides="0" tooltips="1"
                  connect="0" arrows="0" fold="0" page="0" pageScale="1"
                  pageWidth="1240" pageHeight="900" math="0" shadow="0" background="none">
      <root>
        <mxCell id="0" />
        <mxCell id="1" parent="0" />
        <!-- Diagram content here -->
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>
```

### 18.4 Existing Diagrams in vault/diagrams/

| File | Description | Page Size |
|---|---|---|
| `fig01_system_architecture.drawio` | Six-layer architecture diagram | 1240×900 |
| `fig02_scenario_lifecycle.drawio` | Five-phase scenario lifecycle with shock channels | 1300×640 |
| `fig03_risk_matrix.drawio` | 3×3 risk matrix with Industry 5.0 pillars | 1200×820 |
| `fig04_dual_use_mapping.drawio` | Three-column dual-use mapping with funding instruments | 1280×900 |
| `fig05_interoperability_stack.drawio` | EIF five-layer mapping table | 1240×780 |

All five have corresponding `.svg` and `.png` exports.

---

## 19. Known Environment Issues

### Python 3.13 + linopy → `pkg_resources` error
**Symptom:** `ModuleNotFoundError: No module named 'pkg_resources'`
**Fix:** `conda run -n pypsa pip install "google-cloud-storage>=2.10"`

### SCIP solver not found
**Symptom:** `ERROR: You have not found the SCIP solver`
**Fix:** `conda install -c conda-forge scip`

### Port 3000 already in use
**Fix:** `PORT=3001 npm run dev`

---

## 20. Vault Documentation Map

### Primary Vault Files (read in full above)
- `Index.md` — Master index to all vault documentation
- `General.md` — Vault orientation, quick reference table, reading suggestions
- `QuickStart.md` — Fastest path from fresh clone to running dashboard (5-10 min)
- `Installation.md` — Detailed environment setup, prerequisites, troubleshooting
- `Usage.md` — Day-to-day operations: building scenarios, monitoring runs, viewing results
- `Running.md` — How runs move through the system, job states, queue behavior, restart resilience
- `Architecture.md` — Complete system design: data flows, component responsibilities, REST API
- `Vizualizer.md` — Web dashboard technical docs: routes, API, runtime config, known issues
- `ComplexScenario.md` — Comprehensive guide: setting up complex stress-test scenarios
- `README.md` — Vault welcome and getting started guide

### Archival Files
- `archival/Index.md` — Historical index
- `archival/Architecture.md` — Older architecture notes
- `archival/FolderStructure.md` — Historical directory map
- Other archival copies of primary files

### Papers
- `papers/KBO2026_Paper_Draft.md` — Full working draft for KBO 2026 conference paper
- `papers/Raport_2_citatii_verificate.xml` — Doctorate report (target document for improvement)
- `papers/KBOPaperTemplate2026 (1) (1).xml` — Official KBO 2026 Word template
- `papers/KBOPieleManescu.docx` / `.pdf` — Prior paper version
- `papers/Invitatie_KBO_2026 (1).pdf` — Conference invitation

---

## 21. Session Quick-Reference Card

### For the Claude-in-Word Session:

**Key files to attach:**
1. This briefing file (`Claude_Word_Briefing.md`)
2. `vault/diagrams/fig01_system_architecture.svg`
3. `vault/diagrams/fig02_scenario_lifecycle.svg`
4. `vault/diagrams/fig03_risk_matrix.svg`
5. `vault/diagrams/fig07_shock_taxonomy.svg`
6. `vault/diagrams/fig06_case_study_results.svg`
7. `vault/diagrams/fig04_dual_use_mapping.svg`
8. `vault/diagrams/fig08_eu_regulatory_framework.svg`
9. `vault/diagrams/fig05_interoperability_stack.svg`

**Golden rule:** Preserve all existing formatting, styles, and layout from the target XML document. Only improve text content and insert diagrams. Match the document's own conventions for everything.

**Content rules:**
- SI units only (GWh, MWh, MW, EUR/MWh, EUR)
- No abbreviations in section titles
- No mention of proxy environment variables
- Every citation must have a corresponding reference
- Match the document's existing citation format — do not impose a new one

---

*End of briefing. This document is the complete reference for the Claude-in-Word session. Every section, every number, every figure reference, every citation, and every architectural detail needed to write or improve the paper is contained here.*
