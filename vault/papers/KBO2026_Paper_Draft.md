# KBO 2026 — Paper Draft & Author's Notebook

**Conference:** 31st International Scientific Conference "Knowledge Based Organization" (KBO 2026)
**Panel:** III – Augmenting Technical Interoperability of Complex Systems
**Topic chosen:** *Dual-Use Technologies and Contemporary Funding Mechanisms for Security* (with secondary alignment to *Risk Analysis of Industry 5.0*)
**Status:** Working draft. Use this file as the briefing for a Claude-for-Word session that will produce the final `.docx`.

---

## 0. How to use this file in Claude for Word

This document is engineered to be the single context source for a Claude-for-Word writing session. It bundles: (a) the substantive content of the paper, (b) figure references and captions, (c) style enforcement rules from the KBO template, and (d) a session protocol that tells Claude what to do, in which order, and how to behave when uncertain. The section titles match the headings the final paper should carry, so Claude can copy them verbatim once formatting is applied.

### 0.1 Setting up the Claude-for-Word session

1. Open `vault/KBOPaperTemplate2026 (1) (1).xml` in Microsoft Word (Word recognises Flat OPC XML automatically; open it with **File → Open** and select the XML file directly, or rename the extension to `.docx` if Word refuses). The file is the official KBO template and already carries the styles `KBO Title`, `KBO Author Names`, `KBO Author Affiliations`, `KBO Abstract`, `KBO Keywords`, `KBO Heading 1`, `KBO Heading 2`, `KBO Caption Figure`, `KBO Caption Table`, `KBO Text Body`, `KBO Bullet list`, `KBO References Caption`, `KBO References Text`.
2. Activate the Claude task pane in Word (**Home → Claude** or the dedicated Claude ribbon).
3. Attach this file (`KBO2026_Paper_Draft.md`) to the conversation as a reference document.
4. Attach the five SVGs from `vault/diagrams/` so Claude can refer to them when proposing figure placements (`fig01_system_architecture.svg` … `fig05_interoperability_stack.svg`).
5. Open the **Brainstorming** plugin (the Claude Brainstorming skill that ships with the Word add-in). Configure it for *Academic / Conference paper* with audience *military and civilian critical-infrastructure analysts*.

### 0.2 Suggested prompt sequence (run in this order)

The prompts are written so each one needs only the previous one's output as state, plus this draft document. Pause between prompts and approve each insertion before moving on — this avoids losing earlier formatting.

> **Prompt 1 (warm-up brainstorm).** "Use the Brainstorming plugin. Goal: critique the angle of the paper described in `KBO2026_Paper_Draft.md`. List five risks the reader from a NATO/CCDCOE audience might raise and three counter-arguments per risk. Be concise."

> **Prompt 2 (title and metadata).** "Insert the paper title, author block and affiliations from `KBO2026_Paper_Draft.md` Section 1.1. Apply styles `KBO Title`, `KBO Author Names`, `KBO Author Affiliations` exactly. Do not modify the styles."

> **Prompt 3 (abstract and keywords).** "Insert the abstract from Section 1.2 using the `KBO Abstract` style. Word count target: 195–200 words. Then insert keywords using the `KBO Keywords` style. Do not exceed five keywords."

> **Prompt 4 (each section in turn).** For each numbered section (2 through 9), run: "Insert Section N from the draft using `KBO Heading 1` for the section heading, `KBO Heading 2` for any sub-headings, and `KBO Text Body` for body text. Preserve in-text citations exactly as `[1]`, `[2]`, … Do not add abbreviations to the title. Do not insert blank lines between paragraphs."

> **Prompt 5 (figures).** "Insert each figure listed in Section 11 below in the order specified, captioned with the `KBO Caption Figure` style. Use the SVG file from `vault/diagrams/<name>.svg`. Center each figure horizontally; do not include it inside the text columns – place it across the page width. Use the caption text provided verbatim."

> **Prompt 6 (references).** "Insert References block from Section 12. Use `KBO References Caption` for the heading and `KBO References Text` for the entries. Number entries to match the in-text citations. Do not invent references; if any cited number is missing here, leave a TODO comment."

> **Prompt 7 (acknowledgements).** "Insert the Acknowledgements paragraph from Section 13 using `KBO Text Body` immediately before References."

> **Prompt 8 (length sanity check).** "Use the Brainstorming plugin: count the current page count of the paper. Target is 6 pages, hard limits 4 and 8. If outside the range, propose three specific cuts or three specific expansions, listing exact paragraphs."

> **Prompt 9 (final review).** "Run a self-review of the paper against the KBO 2026 style table (Times New Roman, A4, 2.5 cm margins, two columns 7.5 cm each with 1 cm gap, single line spacing, no paragraph indentation except References, no running heads, SI units only). Output a checklist with PASS/FAIL per item and propose surgical fixes."

### 0.3 Brainstorming prompts (use whenever a section feels thin)

Trigger the Claude Brainstorming skill explicitly between substantive sections:

- *"Brainstorm three counter-examples to the dual-use claim in Section 6 from a defence-industry sceptic's point of view."*
- *"Brainstorm five additional EU funding instruments not yet listed in Section 7 that might support the platform; flag risk of duplication."*
- *"Brainstorm three failure modes for the platform's interoperability claim in Section 8 — focus on semantic drift between national TSOs."*

### 0.4 Rules for Claude in the Word session

- **Cite carefully.** Every numbered citation `[n]` must correspond to one entry in Section 12. If you would have to invent a source, instead leave `[TODO: cite]` and list the gap.
- **Do not paraphrase the abstract** — it is already calibrated to ~200 words.
- **Do not change the figure order.** The narrative depends on it.
- **Never mention** the platform's HTTP proxy stripping behaviour, the `PLANUI_USE_SYSTEM_PROXY` variable, or proxy environment workarounds. They are an implementation detail unrelated to the paper's argument.
- **Use SI units only.** GWh, MWh, MW, EUR/MWh, EUR.
- **Do not use abbreviations in the paper title.**
- **Do not use footnotes** (KBO style).
- **Page numbers off, running heads off.**

---

## 1. Front matter

### 1.1 Title and author block

**Title (KBO Title style, all caps, bold, centred, size 12):**

> DUAL-USE ENERGY-SYSTEM MODELLING FOR CRITICAL-INFRASTRUCTURE RESILIENCE: OPEN-SOURCE STRESS-TEST ORCHESTRATION AS A LEVER FOR TECHNICAL INTEROPERABILITY

**Author block (KBO Author Names style):**

> Bogdan-Andrei MĂNESCU\*

**Affiliation (KBO Author Affiliations style):**

> \*[University / Faculty / Department, City, Country] — *to be filled by author*

**E-mail address (KBO Author Affiliations style):**

> manescu.bogdan.andrei@gmail.com

> *Note: The KBO template supports up to three authors with affiliations marked \*, \*\*, \*\*\*. If co-authors are added, follow the same format.*

### 1.2 Abstract (~200 words, italic, KBO Abstract style)

> *European energy systems are simultaneously a foundation for civilian welfare and a high-value target for hybrid disruption. This paper argues that open-source energy-system modelling stacks – exemplified by PyPSA-Eur with the Romania-specific Vizualizer dashboard – qualify as dual-use technologies whose maturation supports both Industry 5.0 resilience objectives and contemporary security funding agendas. We describe a six-layer web platform that turns multi-shock stress-tests into a deterministic, reproducible workflow accessible to non-coding analysts. A worked Romania winter case study quantifies the country's exposure under a hybrid disruption: a 30 % demand surge combined with a complete cross-border import cap and partial gas / hydro derating produces approximately 45 GWh of energy not served and a 31 % system-cost increase over a single winter week. We map these capabilities onto the four-layer European Interoperability Framework, identify EU funding instruments – Horizon Europe, the European Defence Fund, the Connecting Europe Facility and rescEU – whose objectives align with the platform's outputs, and discuss governance constraints under EU Regulation 2021/821 and the Critical Entities Resilience Directive. The paper concludes that civilian-by-design open modelling platforms are the most defensible substrate for cross-pillar interoperability in critical-infrastructure security.*

### 1.3 Keywords (KBO Keywords style)

> **Keywords:** dual-use technology, critical infrastructure resilience, energy-system modelling, technical interoperability, EU security funding

---

## 2. Introduction

The 31st KBO conference invites contributions on augmenting technical interoperability of complex systems, with explicit framing toward Industry 5.0 risk analysis and dual-use security funding. Energy systems sit at the intersection of these two themes: they are the prototypical complex socio-technical system whose disruption cascades through every other sector, and their digital control surfaces have become a contested domain in hybrid conflict [1], [2]. Romania's exposure is illustrative: as a south-eastern frontier of the European synchronous area with active interconnection to Bulgaria, Hungary and Serbia, it operates in a region where physical, market and informational disruptions are no longer hypothetical. The 2022–2024 European energy-security crisis exposed the cost of modelling deficits — analyses produced under emergency conditions had no shared interoperability surface for cross-checking results between ministries, transmission operators, regulators, and defence agencies.

This paper advances three claims. First, that an open-source modelling stack can satisfy the European Interoperability Framework's four layers — legal, organisational, semantic, and technical — when its result schema, configuration grammar and orchestration are explicitly designed as contracts rather than as artefacts [3]. Second, that such a stack qualifies as a *dual-use* technology in the sense of EU Regulation 2021/821: usable for civilian decarbonisation studies and equally for defence-relevant resilience assessments, while remaining within the public-domain carve-out of the regulation [4]. Third, that contemporary EU funding instruments — Horizon Europe Cluster 5, the European Defence Fund (EDF), the Connecting Europe Facility (CEF) and rescEU — already foresee this dual orientation, and that platforms that internalise the four-layer interoperability obligation can be co-funded across instruments without architectural duplication.

The contribution is grounded in an instantiated platform. PyPSA-Eur is the de-facto open European power-system optimisation model, built on the PyPSA library, with a Snakemake workflow orchestrating data preparation, network assembly and optimisation [5]. To this generic substrate we have added a Romania-specific extension that consumes the same data pipeline but exposes a stress-test API designed for security-relevant simulation: synthetic load multipliers, hydro and gas capacity reductions, ramp-rate constraints proxying SCADA limits, and directional caps on cross-border interconnections. A Next.js / React web dashboard ("Vizualizer") provides a three-tab control room — scenario builder, run queue, results viewer — that allows non-coding analysts to assemble paired baseline / scenario runs, monitor execution, and inspect results that satisfy a deterministic seven-CSV contract.

The remainder of the paper is structured as follows. Section 3 reviews Industry 5.0, the EU regulatory frame for critical infrastructure and dual-use export controls. Section 4 details the platform architecture (Figure 1) and lifecycle (Figure 2). Section 5 presents a Romania winter cross-border-isolation case study. Section 6 discusses dual-use applicability (Figure 4). Section 7 surveys the funding mechanisms relevant to such a platform. Section 8 maps the platform onto the EIF layers (Figure 5). Section 9 closes with limitations and future work.

---

## 3. Background

### 3.1 Industry 5.0 and critical-infrastructure resilience

Industry 5.0, in the European Commission's reformulation, augments the productivity-centric Industry 4.0 narrative with three explicit pillars: human-centricity, sustainability and resilience [6]. Energy systems are the canonical embodiment of all three. They are human-centric in the sense that supply continuity is a precondition for every other public service. They are sustainable in the sense that their decarbonisation is the largest single lever for European emissions reductions. And they are resilient — or fail to be — under the cascading dynamics that affect every linked sector. Figure 3 organises the typical risk surface that an Industry 5.0 lens applies to European energy systems.

### 3.2 The EU regulatory frame

Three legal instruments converge on the platform discussed here. The *Network and Information Systems (NIS2) Directive* (Directive (EU) 2022/2555) sets cybersecurity obligations on operators of essential services, including TSOs and DSOs [7]. The *Critical Entities Resilience Directive* (Directive (EU) 2022/2557) extends those obligations to physical and hybrid threats and requires national risk assessments that identify dependencies, vulnerabilities and stress scenarios [8]. The *Recast Dual-Use Regulation* (Regulation (EU) 2021/821) governs the export and intra-Union transfer of dual-use items, with a public-domain carve-out for openly published software and data [4]. The interplay of the three is significant: NIS2 imposes a defensive posture, the CER Directive demands quantitative resilience evidence, and the dual-use regulation determines whether modelling platforms can circulate freely across borders for collaborative analysis.

### 3.3 Why open modelling stacks matter

Closed, proprietary models force national authorities into vendor lock-in and impede cross-border peer review. Open models invert that dynamic: they are inspectable, reproducible, and naturally compatible with the open-data obligations attached to Horizon Europe and other EU R&I instruments [9], [10]. They also satisfy the dual-use public-domain carve-out by construction, since their source code and underlying data are publicly available. The corollary is that the marginal cost of producing additional dual-use capability — for example, a national stress-test playbook — is bounded by the cost of integration work rather than by relicensing or re-engineering of the modelling core.

---

## 4. Platform architecture

### 4.1 Layered system overview

Figure 1 presents the six-layer architecture of the platform. The **Presentation Layer** (a React 19 client served by Next.js 16) is bilingual (English / Romanian) and exposes three control-room tabs. The **API & Service Layer** consists of typed Next.js route handlers under `/api/scenario/*`, `/api/runs/*` and `/api/results/*`, structured as REST resources for portability. The **Domain Logic Layer** (TypeScript modules) encapsulates the scenario builder, the sequential job runner, the results handler and the runtime resolver, each with a single responsibility. The **Workflow & Optimisation Layer** is Python: a Snakemake DAG orchestrates data retrieval, network assembly and solver invocation, with a dedicated stress-test module (`romania_winter_stress.py`) that injects shocks and adds linear constraints before optimisation. The **Persistence Layer** holds generated YAML configurations, persistent job state and per-job logs, with results materialised under `results/<name>/`. The **External Data Layer** ingests open data: ECMWF ERA5 atmospheric reanalysis for renewable-resource time series, Zenodo-hosted datasets for cost, capacity and plant inventories, ENTSO-E TYNDP outputs for cross-border interconnector parameters, and GADM / NUTS administrative boundaries.

### 4.2 The seven-CSV result contract

The platform's interoperability claim hinges on a deterministic result contract. Every comparison between a baseline and a stressed scenario must produce exactly seven CSVs: `system_cost_comparison.csv`, `generation_mix_mwh.csv`, `lmp_summary_ro.csv`, `ens_summary.csv`, `curtailment_mwh.csv`, `daily_net_imports_mwh.csv` and `interconnector_flow_congestion.csv`. The dashboard hides any folder lacking one of these files; downstream tools therefore never confront partial outputs. Optional artefacts — a markdown `assumptions_limitations.md`, PNG figures `fig_01.png` through `fig_05.png`, drawio editable diagrams and SVG vector exports — are surfaced when present but never required for validity.

### 4.3 Scenario lifecycle

Figure 2 traces a scenario's lifecycle. The user configures the run through either form controls or direct YAML editing; both surfaces are kept in sync within the dashboard. On enqueue, two YAML configurations are written under `config/adversarial/generated/`: a baseline (`stress_test.enable=false`) and a scenario (`stress_test.enable=true` with shock parameters populated). The job is persisted to `vizualizer/.data/planui-state.json` and added to a sequential runner. Snakemake then unlocks the workflow, solves the baseline, solves the shocked scenario, and runs a comparison report. The runner detects the conda environment automatically from a configurable priority chain (`PLANUI_CONDA_ENV`, `PLANUI_CONDA_PREFIX`, the active prefix, then named candidates `pypsa` and `pypsa-eur`), so the orchestration layer can be deployed against pre-existing analyst environments without reinstallation. A baseline solve typically completes in seven to fifteen minutes; a paired baseline-plus-scenario plus comparison report typically completes in twenty to twenty-five minutes on a developer laptop with twenty clusters and hourly resolution.

### 4.4 Stress-test taxonomy

The shock toolkit is intentionally compact and orthogonal so that combinations are interpretable. Five shock channels are exposed: a *load multiplier* on demand, a *hydro reduction* coefficient on hydropower availability, a *gas capacity reduction* on the maximum installed power of natural-gas units, a *SCADA proxy* enabling ramp-rate constraints on controllable generators, and an *import cap* with directional limits on cross-border interconnector flows. The first three are continuous, the latter two binary toggles, yielding 2³² combinations of meaningful settings even before considering parameter sweeps within continuous shocks. Each shock is applied either before optimisation (load and capacity scaling) or as additional linear constraints, leaving the solver core unchanged.

---

## 5. Romania winter case study

### 5.1 Scenario set-up

To illustrate the platform we instantiate a stress-test configured to mirror the type of question posed by the CER Directive's national risk assessment process. The simulated week is 15 – 22 January 2023 — a real winter week with cold-snap conditions reflected in ERA5 — modelled at 20 spatial clusters covering Romania (RO) plus its three principal interconnection partners Bulgaria (BG), Hungary (HU) and Serbia (RS). Shocks apply only to Romania. The baseline runs the same network without stress. The stressed scenario applies: load multiplier 1.30 (30 % demand surge), hydro reduction 0.10 (10 % unavailable for low-flow conditions), gas capacity reduction 0.20 (20 % derating for supply-chain or maintenance constraints), SCADA proxy enabled (ramp-rate limits on thermal units of approximately 15 % of nominal capacity per hour), and an import cap of 0 MWh on every cross-border interconnector — i.e. complete electrical isolation of Romania.

### 5.2 Quantitative results

The stressed scenario produces a cost delta of approximately +570 million EUR over the eight-day window — a 31 % increase — driven by displacement of imports by costly domestic generation. Energy not served reaches roughly 45.2 GWh in Romania, concentrated in evening-peak hours and northern regions; neighbour countries are unaffected since the shock is unilateral. Mean locational marginal prices for Romania more than double, with peaks rising from 180 EUR/MWh to 380 EUR/MWh. Generation mix shifts as expected: nuclear and renewables remain saturated at the baseline level (weather is fixed); gas attempts to compensate but is bounded by capacity reduction and ramp constraints; coal increases but does not cover the gap. Daily net imports collapse to zero by construction; congestion hours on inbound interconnectors fall to zero while outbound capacity is partially used to maintain frequency in the wider synchronous area.

### 5.3 Interpretation

The case study is not predictive of any specific event; it is an *envelope* indicating order of magnitude. Three conclusions follow. First, even mild simultaneous derating (10 % hydro, 20 % gas) combined with a 30 % demand spike is enough to trigger blackouts under cross-border isolation, despite Romania's domestic baseload. Second, the problem is concentrated in evening-peak hours and northern regions, so demand-flexibility programmes and targeted storage have asymmetric leverage. Third, the cost of cross-border isolation per GWh of forgone imports — on the order of 12 to 15 million EUR per GWh from LMP signals — provides a quantitative input to the *value of interconnection* discussion that the TYNDP cycle and the PCI process require.

---

## 6. Dual-use applicability

Figure 4 maps the same platform across a civilian column, a shared engineering core and a defence/security column. The core is unchanged: identical optimisation engine, identical data pipeline, identical YAML grammar, identical result schema. The differentiation is only at the consumption side. Civilian uses include net-zero pathway studies for ministries, renewables-siting and grid-expansion analysis, wholesale-market design and climate-adaptation assessments. Defence and security uses include CER-Directive-compliant resilience evidence, hybrid-threat scenario libraries, energy-supply contingency planning, strategic reserve sizing under ENS envelopes and joint table-top exercises with Allied partners. The shared core is the *interoperability surface*: anything consumed in one column can be reproduced in the other from the same artefacts.

This is precisely what the Recast Dual-Use Regulation contemplates [4]. A platform whose codebase is openly published is exempt under the public-domain carve-out, but a *deployed* instance that integrates national-confidential data may fall back under control. The architectural response is to separate the orchestration layer (open) from the data layer (operator-controlled), so the same codebase serves both purposes without licensing collision. The platform discussed here makes that separation explicit by isolating data ingestion in `personal_data_download/` while keeping all compute logic in version-controlled, openly licensed modules.

---

## 7. Contemporary funding mechanisms

The lower band of Figure 4 lists four EU instruments whose objectives align with the platform's outputs.

**Horizon Europe — Cluster 5 (Climate, Energy & Mobility).** Cluster 5 is the principal R&I instrument funding open energy modelling. Its 2023–2024 work programme already cites "open and interoperable energy system models" as eligible activity [9]. The platform's permissive licensing satisfies the open-science obligations attached to Horizon Europe grants without further negotiation.

**European Defence Fund (EDF).** Within EDF's research strand, energy-and-environment categories explicitly support resilience-related work and explicitly contemplate dual-use leverage where civilian foundations exist [11]. Stress-test envelopes generated by the platform are admissible inputs to EDF resilience proposals; the *open-source carve-out* keeps the underlying code outside the controlled-items list while the *deployment artefacts* (national datasets, threat libraries) can be classified independently.

**Connecting Europe Facility — Energy.** CEF Energy funds cross-border interconnector projects through the Projects of Common Interest (PCI) list. Platform outputs — interconnector-flow congestion and net-import deltas under stress — feed directly into the cost-benefit analyses required by CEF and TYNDP [12]. CEF Digital adds a complementary track for the data infrastructure underpinning interoperable modelling.

**rescEU and the Critical Raw Materials Act.** Civil-protection funding under the Union Civil Protection Mechanism (rescEU) backs preparedness exercises, including energy-supply contingencies; the Critical Raw Materials Act of 2024 connects energy storage and grid hardware supply chains to the critical-resilience agenda [13].

The funding architecture is therefore multi-instrument by design. A platform that internalises EIF interoperability obligations can claim eligibility across all four without architectural duplication, because its outputs are interpretable in each instrument's terms.

---

## 8. Mapping to the European Interoperability Framework

Figure 5 maps the platform onto the four EIF layers, with an additional governance layer that the present authors propose as a fifth, cross-cutting concern.

The **legal** layer is anchored in MIT/Apache-style licensing on PyPSA, the Vizualizer dashboard's own permissive licence, and the open data licences attached to ECMWF and Zenodo upstream sources. The **organisational** layer is reflected in the three-tab UI, which maps directly to RACI roles (analyst configures, operator monitors, decision-maker reviews), and in the persistent job state that documents who initiated which run. The **semantic** layer enforces SI units, ISO-3166-1 country codes, ENTSO-E component identifiers and a result schema whose column names align with TYNDP output expectations. The **technical** layer relies on YAML for configuration, netCDF (CF conventions) for climate inputs, CSV for results, REST/HTTP for the dashboard API, and drawio + SVG for figure portability. The **governance** layer — our proposed addition — bundles persistent state, immutable templates and per-run logs into a verifiable audit envelope, with each result inheriting an `assumptions_limitations.md` so policy briefings carry their epistemic provenance forward.

The novelty is not in the layers themselves — they are EIF doctrine — but in the demonstration that each is enforced by a concrete artefact in the codebase. Interoperability becomes a *verifiable* property rather than an aspirational claim.

---

## 9. Discussion, limitations and future work

Several limitations warrant explicit treatment. First, the stress-test taxonomy is intentionally compact; real hybrid threats include attacker-adaptive components that an optimisation-based model cannot represent without a game-theoretic extension. Second, the seven-CSV contract is sufficient for a single-country case study but will require extension for multi-country assessments — particularly for non-symmetric load-shedding distributions across coupled jurisdictions. Third, the dashboard's sequential runner is appropriate for analyst-driven exploration but not for automated parameter sweeps; a parallel runner is on the roadmap. Fourth, the dual-use carve-out is currently invoked at the codebase level; a deployment that ingests classified network parameters would have to be assessed under the controlled-list framework, even though the codebase itself is exempt.

Future work has three vectors. The *modelling vector* will integrate adversarial scenarios with explicit attacker models (cyber-physical co-simulation). The *interoperability vector* will harmonise the result schema with EU-funded ontology projects and propose a public RDF/JSON-LD wrapper around the seven CSVs. The *governance vector* will formalise the assumptions-limitations file as a machine-readable provenance object aligned with W3C PROV [14].

---

## 10. Conclusions

We have argued that civilian-by-design, open-source energy-system modelling stacks are the most defensible substrate for cross-pillar interoperability in critical-infrastructure security. The paper makes three contributions: a six-layer architecture for a paired-scenario stress-test platform built on PyPSA-Eur and a Next.js dashboard; a worked Romania winter case study that demonstrates the platform's quantitative envelope under cross-border isolation; and a mapping of the platform's artefacts to the European Interoperability Framework, augmented with a governance layer. Contemporary EU funding instruments — Horizon Europe Cluster 5, the EDF, CEF Energy and rescEU — already foresee the dual orientation; platforms that internalise the EIF obligations can be co-funded across instruments without architectural duplication. The route from civilian decarbonisation studies to defence-relevant resilience evidence runs through the same codebase; the differentiation is at the data and exploitation layer, not at the modelling core.

---

## 11. Figures (insertion order, captions and source files)

The KBO template requires figures captioned *below* the figure with the `KBO Caption Figure` style (italic, centred, size 11). Each caption is reproduced verbatim in this section so the Word session can paste it directly. All five figures are SVG files exported with transparent background and light theme from `vault/diagrams/`. They are sized to fill the full page width across both columns (i.e. inserted *outside* the two-column layout); the KBO template explicitly permits this layout for figures and tables.

| Order | File (relative to repo root) | Caption (verbatim) |
|---|---|---|
| Figure 1 | `vault/diagrams/fig01_system_architecture.svg` | *Figure 1: Six-layer architecture of the PyPSA-Eur Romania platform. Source: authors, derived from the project codebase.* |
| Figure 2 | `vault/diagrams/fig02_scenario_lifecycle.svg` | *Figure 2: Stress-test scenario lifecycle from form input to comparable result, with the five shock channels exposed by the dashboard. Source: authors.* |
| Figure 3 | `vault/diagrams/fig03_risk_matrix.svg` | *Figure 3: Likelihood–severity risk matrix for European energy systems under an Industry 5.0 lens, mapped to the platform's stress-test coverage. Source: authors, categories adapted from Directive (EU) 2022/2557.* |
| Figure 4 | `vault/diagrams/fig04_dual_use_mapping.svg` | *Figure 4: Dual-use capability mapping – civilian, shared core and defence/security columns – with aligned EU funding instruments. Source: authors, instruments compiled from official EU work programmes.* |
| Figure 5 | `vault/diagrams/fig05_interoperability_stack.svg` | *Figure 5: Mapping of the platform onto the four-layer European Interoperability Framework, augmented with a governance layer. Source: authors.* |

**Insertion advice for Claude in Word.** Use *Insert → Pictures → This Device* and select the SVG. Word renders SVGs as vector graphics natively from Word 2016 SP onward. Set *Wrap Text → In Line With Text* and *Center* horizontally. The figure should sit between two paragraphs of body text; place the caption in a new paragraph immediately below the figure with the `KBO Caption Figure` style applied.

---

## 12. References (numbered to match in-text `[n]` citations)

Insert these under a `References` heading using the `KBO References Caption` style for the heading and `KBO References Text` for entries. Use *Hanging 1 cm* indentation per the template style. The list is ordered by first appearance.

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

> **Reference verification reminder for Claude.** Numbers above reflect first-appearance order. If the Word session adds, removes, or reorders citations, renumber both directions before final output. If a citation is added without a corresponding reference, leave a `[TODO: cite]` marker rather than fabricating a source.

---

## 13. Acknowledgements

> The author thanks the PyPSA-Eur open-source community for an exceptionally well-structured modelling substrate, and the Romanian academic community for ongoing exchanges on national grid resilience. Computational work was carried out on locally-managed resources; no institutional funding is reported.

---

## 14. Author's notebook (do not insert into the final paper)

The remaining sections are scratch material for the writing session and should not be inserted into the final `.docx`.

### 14.1 Word-count budget per section (target 6 pages, ~3300 words main body)

| Section | Target words |
|---|---|
| Abstract | 195–200 |
| 2. Introduction | 500–550 |
| 3. Background | 350–400 |
| 4. Platform architecture | 450–500 |
| 5. Romania case study | 350–400 |
| 6. Dual-use applicability | 250–300 |
| 7. Funding mechanisms | 350–400 |
| 8. EIF mapping | 250–300 |
| 9. Discussion / limitations | 250–300 |
| 10. Conclusions | 150–200 |

### 14.2 Cuts to make if over 8 pages

- Reduce Section 3 by removing one of the three regulatory paragraphs (likely 3.3 if the funding section already covers open-data obligations).
- Reduce Section 5 by collapsing the three interpretation bullets into one paragraph.
- Drop the optional governance row of Figure 5 if Figure 5 alone reaches the bottom margin.

### 14.3 Expansions to make if under 4 pages

- Add a Subsection 4.5 documenting the conda environment detection chain in detail.
- Add a Subsection 7.5 on national instruments (Romania's PNRR / Modernisation Fund) that complement EU instruments.
- Add a Subsection 9.3 enumerating threats to validity (model fidelity, weather-year selection, solver tolerance).

### 14.4 Diagrams already produced

All five SVG files are at `vault/diagrams/`. The matching `.drawio` source files are colocated for re-editing. Themes follow the project's `THEME_SVG_LIGHT` palette: navy `#0A3DA3`, dark navy `#072A75`, scenario orange `#F28C28`, success green `#0F7B3B`, alert red `#C4372A`, ink `#1E2B3A`, muted `#5D6A7B`, with a *transparent* paper background.

### 14.5 Additional brainstorming prompts to keep in reserve

- *"Brainstorm what would change in the paper if Romania were replaced by a different EU member state. Which sections are RO-specific and which are general?"*
- *"Brainstorm three alternative case studies (summer drought, hybrid kinetic attack, gas-supply disruption) with order-of-magnitude estimates of ENS, cost delta and LMP shift for each."*
- *"Brainstorm a one-paragraph response to a reviewer who claims that an optimisation model cannot represent adversarial behaviour."*
- *"Brainstorm three risks of mis-citation in Section 12 and a one-line mitigation for each."*

### 14.6 Style enforcement checklist

- [ ] A4, 21 × 29.7 cm, margins 2.5 cm all sides
- [ ] Two columns 7.5 cm each, gap 1 cm, equal width
- [ ] Times New Roman, single line spacing
- [ ] Title: `KBO Title` (size 12, bold, all caps, centred)
- [ ] Authors: `KBO Author Names` (size 12, bold, given name capitalised, SURNAME all caps)
- [ ] Affiliations: `KBO Author Affiliations` (size 12, bold, centred)
- [ ] Abstract: `KBO Abstract` (size 11, italic, justified, ~200 words)
- [ ] Keywords: `KBO Keywords` (size 12, bold, justified)
- [ ] Section headings: `KBO Heading 1` (size 12, bold, justified)
- [ ] Sub-headings: `KBO Heading 2` (size 12, bold, justified)
- [ ] Body: `KBO Text Body` (size 12, regular, justified, no indentation)
- [ ] Figure captions: `KBO Caption Figure` (size 11, italic, centred, *below* the figure)
- [ ] Numbered citations `[n]` in text, references with hanging 1 cm indentation
- [ ] No footnotes, no running heads, no page numbers
- [ ] SI units only
- [ ] Length: 4–8 pages
- [ ] No abbreviations in the title

### 14.7 Final delivery

Save as `KBO2026_Manescu_DualUse_Energy.docx` (the KBO submission portal accepts `.doc`/`.docx`). Verify on a different machine that the SVG figures still render before submission.
