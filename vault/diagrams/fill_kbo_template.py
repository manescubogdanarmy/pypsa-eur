"""
Fill the KBO 2026 Word Flat-OPC XML template with the paper content.

Reads the original template, replaces the visible <w:body>...</w:body> contents
inside /word/document.xml with our paper paragraphs (using the KBO* styles
already defined in the template), and writes the result to:

  vault/KBOPaperTemplate2026 (1) (1).xml

The template's section properties (page size, margins, two-column layout)
live inside <w:body> too; we preserve them by capturing the trailing
<w:sectPr>...</w:sectPr> block and re-emitting it after our paragraphs.

Run from the repo root:
  python "vault/diagrams/fill_kbo_template.py"
"""

from __future__ import annotations
import re
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]
SRC  = Path(r"C:\Users\Bogdan\Downloads\KBOPaperTemplate2026 (1) (1).xml")
DST  = REPO / "vault" / "KBOPaperTemplate2026 (1) (1).xml"

# ---- helpers ----------------------------------------------------------------

def esc(text: str) -> str:
    return (text.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;"))

def para(style: str, text: str) -> str:
    """One styled paragraph with a single run."""
    return (f'<w:p><w:pPr><w:pStyle w:val="{style}"/></w:pPr>'
            f'<w:r><w:t xml:space="preserve">{esc(text)}</w:t></w:r></w:p>')

def para_runs(style: str, runs: list[tuple[str, dict]]) -> str:
    """Paragraph with multiple runs.

    Each run is (text, props) where props can include {"bold": True,
    "italic": True}. Used for the abstract heading + abstract text in one
    paragraph etc."""
    out = [f'<w:p><w:pPr><w:pStyle w:val="{style}"/></w:pPr>']
    for text, props in runs:
        rPr_bits = []
        if props.get("bold"): rPr_bits.append("<w:b/>")
        if props.get("italic"): rPr_bits.append("<w:i/>")
        rPr = f"<w:rPr>{''.join(rPr_bits)}</w:rPr>" if rPr_bits else ""
        out.append(f'<w:r>{rPr}<w:t xml:space="preserve">{esc(text)}</w:t></w:r>')
    out.append('</w:p>')
    return "".join(out)

def heading1(text: str) -> str:
    return para("KBOHeading1", text)

def heading2(text: str) -> str:
    return para("KBOHeading2", text)

def body_para(text: str) -> str:
    return para("KBOTextBody", text)

def figure_caption(text: str) -> str:
    return para("KBOCaptionFigure", text)

def empty_figure_holder(filename: str) -> str:
    """A KBOFigure-styled paragraph that simply names the SVG to insert.

    We do not embed the image binary here (Flat OPC can hold it but it would
    inflate the XML enormously); instead we leave a textual placeholder that
    the Word session replaces via Insert -> Pictures."""
    return para("KBOFigure", f"[ Insert SVG: {filename} ]")

def reference(text: str) -> str:
    return para("KBOReferences", text)

# ---- paper content ----------------------------------------------------------

TITLE = ("DUAL-USE ENERGY-SYSTEM MODELLING FOR CRITICAL-INFRASTRUCTURE "
         "RESILIENCE: OPEN-SOURCE STRESS-TEST ORCHESTRATION AS A LEVER "
         "FOR TECHNICAL INTEROPERABILITY")

AUTHOR = "Bogdan-Andrei MĂNESCU*"
AFFILIATION = "*University, Faculty, City, Country"
EMAIL = "E-mail: manescu.bogdan.andrei@gmail.com"

ABSTRACT_TEXT = (
    "European energy systems are simultaneously a foundation for civilian "
    "welfare and a high-value target for hybrid disruption. This paper argues "
    "that open-source energy-system modelling stacks – exemplified by "
    "PyPSA-Eur with the Romania-specific Vizualizer dashboard – qualify as "
    "dual-use technologies whose maturation supports both Industry 5.0 "
    "resilience objectives and contemporary security funding agendas. We "
    "describe a six-layer web platform that turns multi-shock stress-tests "
    "into a deterministic, reproducible workflow accessible to non-coding "
    "analysts. A worked Romania winter case study quantifies the country's "
    "exposure under a hybrid disruption: a 30 % demand surge combined with a "
    "complete cross-border import cap and partial gas / hydro derating "
    "produces approximately 45 GWh of energy not served and a 31 % "
    "system-cost increase over a single winter week. We map these "
    "capabilities onto the four-layer European Interoperability Framework, "
    "identify EU funding instruments – Horizon Europe, the European Defence "
    "Fund, the Connecting Europe Facility and rescEU – whose objectives "
    "align with the platform's outputs, and discuss governance constraints "
    "under EU Regulation 2021/821 and the Critical Entities Resilience "
    "Directive. The paper concludes that civilian-by-design open modelling "
    "platforms are the most defensible substrate for cross-pillar "
    "interoperability in critical-infrastructure security."
)

KEYWORDS = ("Keywords: dual-use technology, critical infrastructure resilience, "
            "energy-system modelling, technical interoperability, "
            "EU security funding")

SECTIONS = [
    ("1. Introduction",
     [("body",
       "The 31st KBO conference invites contributions on augmenting technical "
       "interoperability of complex systems, with explicit framing toward "
       "Industry 5.0 risk analysis and dual-use security funding. Energy "
       "systems sit at the intersection of these two themes: they are the "
       "prototypical complex socio-technical system whose disruption cascades "
       "through every other sector, and their digital control surfaces have "
       "become a contested domain in hybrid conflict [1], [2]. Romania's "
       "exposure is illustrative: as a south-eastern frontier of the "
       "European synchronous area with active interconnection to Bulgaria, "
       "Hungary and Serbia, it operates in a region where physical, market "
       "and informational disruptions are no longer hypothetical."),
      ("body",
       "This paper advances three claims. First, that an open-source "
       "modelling stack can satisfy the European Interoperability "
       "Framework's four layers – legal, organisational, semantic, and "
       "technical – when its result schema, configuration grammar and "
       "orchestration are explicitly designed as contracts rather than as "
       "artefacts [3]. Second, that such a stack qualifies as a dual-use "
       "technology in the sense of EU Regulation 2021/821: usable for "
       "civilian decarbonisation studies and equally for defence-relevant "
       "resilience assessments, while remaining within the public-domain "
       "carve-out of the regulation [4]. Third, that contemporary EU funding "
       "instruments – Horizon Europe Cluster 5, the European Defence Fund "
       "(EDF), the Connecting Europe Facility (CEF) and rescEU – already "
       "foresee this dual orientation, and that platforms that internalise "
       "the four-layer interoperability obligation can be co-funded across "
       "instruments without architectural duplication."),
      ("body",
       "The contribution is grounded in an instantiated platform. PyPSA-Eur "
       "is the de-facto open European power-system optimisation model, "
       "built on the PyPSA library, with a Snakemake workflow orchestrating "
       "data preparation, network assembly and optimisation [5]. To this "
       "generic substrate we have added a Romania-specific extension that "
       "consumes the same data pipeline but exposes a stress-test API "
       "designed for security-relevant simulation: synthetic load "
       "multipliers, hydro and gas capacity reductions, ramp-rate "
       "constraints proxying SCADA limits, and directional caps on "
       "cross-border interconnections. A Next.js / React web dashboard "
       "(\"Vizualizer\") provides a three-tab control room – scenario "
       "builder, run queue, results viewer – that allows non-coding analysts "
       "to assemble paired baseline / scenario runs, monitor execution, and "
       "inspect results that satisfy a deterministic seven-CSV contract."),
      ("body",
       "The remainder of the paper is structured as follows. Section 2 "
       "reviews Industry 5.0, the EU regulatory frame for critical "
       "infrastructure and dual-use export controls. Section 3 details the "
       "platform architecture (Figure 1) and lifecycle (Figure 2). Section 4 "
       "presents a Romania winter cross-border-isolation case study. "
       "Section 5 discusses dual-use applicability (Figure 4). Section 6 "
       "surveys the funding mechanisms relevant to such a platform. Section "
       "7 maps the platform onto the EIF layers (Figure 5). Section 8 "
       "closes with limitations and future work."),
      ]),
    ("2. Background",
     [("h2", "2.1. Industry 5.0 and critical-infrastructure resilience"),
      ("body",
       "Industry 5.0, in the European Commission's reformulation, augments "
       "the productivity-centric Industry 4.0 narrative with three explicit "
       "pillars: human-centricity, sustainability and resilience [6]. "
       "Energy systems are the canonical embodiment of all three. They are "
       "human-centric in the sense that supply continuity is a precondition "
       "for every other public service. They are sustainable in the sense "
       "that their decarbonisation is the largest single lever for European "
       "emissions reductions. And they are resilient – or fail to be – "
       "under the cascading dynamics that affect every linked sector. "
       "Figure 3 organises the typical risk surface that an Industry 5.0 "
       "lens applies to European energy systems."),
      ("h2", "2.2. The EU regulatory frame"),
      ("body",
       "Three legal instruments converge on the platform discussed here. "
       "The Network and Information Systems (NIS2) Directive (Directive "
       "(EU) 2022/2555) sets cybersecurity obligations on operators of "
       "essential services, including transmission and distribution system "
       "operators [7]. The Critical Entities Resilience Directive "
       "(Directive (EU) 2022/2557) extends those obligations to physical "
       "and hybrid threats and requires national risk assessments that "
       "identify dependencies, vulnerabilities and stress scenarios [8]. "
       "The Recast Dual-Use Regulation (Regulation (EU) 2021/821) governs "
       "the export and intra-Union transfer of dual-use items, with a "
       "public-domain carve-out for openly published software and data "
       "[4]. The interplay of the three is significant: NIS2 imposes a "
       "defensive posture, the CER Directive demands quantitative "
       "resilience evidence, and the dual-use regulation determines "
       "whether modelling platforms can circulate freely across borders."),
      ("h2", "2.3. Why open modelling stacks matter"),
      ("body",
       "Closed, proprietary models force national authorities into vendor "
       "lock-in and impede cross-border peer review. Open models invert "
       "that dynamic: they are inspectable, reproducible, and naturally "
       "compatible with the open-data obligations attached to Horizon "
       "Europe and other EU R&I instruments [9], [10]. They also satisfy "
       "the dual-use public-domain carve-out by construction. The "
       "corollary is that the marginal cost of producing additional "
       "dual-use capability – for example, a national stress-test playbook "
       "– is bounded by the cost of integration work rather than by "
       "relicensing or re-engineering of the modelling core."),
      ]),
    ("3. Platform architecture",
     [("h2", "3.1. Layered system overview"),
      ("body",
       "Figure 1 presents the six-layer architecture of the platform. The "
       "Presentation Layer (a React 19 client served by Next.js 16) is "
       "bilingual (English / Romanian) and exposes three control-room "
       "tabs. The API & Service Layer consists of typed Next.js route "
       "handlers under /api/scenario/, /api/runs/ and /api/results/, "
       "structured as REST resources for portability. The Domain Logic "
       "Layer (TypeScript modules) encapsulates the scenario builder, the "
       "sequential job runner, the results handler and the runtime "
       "resolver, each with a single responsibility. The Workflow & "
       "Optimisation Layer is Python: a Snakemake DAG orchestrates data "
       "retrieval, network assembly and solver invocation, with a "
       "dedicated stress-test module that injects shocks and adds linear "
       "constraints before optimisation. The Persistence Layer holds "
       "generated YAML configurations, persistent job state and per-job "
       "logs, with results materialised under results/<name>/. The "
       "External Data Layer ingests open data: ECMWF ERA5 atmospheric "
       "reanalysis, Zenodo-hosted datasets, ENTSO-E TYNDP outputs, and "
       "GADM / NUTS administrative boundaries."),
      ("figure", "fig01_system_architecture.svg"),
      ("caption", "Figure 1: Six-layer architecture of the PyPSA-Eur Romania "
                  "platform. Source: authors, derived from the project codebase."),
      ("h2", "3.2. The seven-CSV result contract"),
      ("body",
       "The platform's interoperability claim hinges on a deterministic "
       "result contract. Every comparison between a baseline and a "
       "stressed scenario must produce exactly seven CSVs: "
       "system_cost_comparison, generation_mix_mwh, lmp_summary_ro, "
       "ens_summary, curtailment_mwh, daily_net_imports_mwh and "
       "interconnector_flow_congestion. The dashboard hides any folder "
       "lacking one of these files; downstream tools therefore never "
       "confront partial outputs. Optional artefacts – a markdown "
       "assumptions file, PNG figures, drawio editable diagrams and SVG "
       "vector exports – are surfaced when present but never required for "
       "validity."),
      ("h2", "3.3. Scenario lifecycle"),
      ("body",
       "Figure 2 traces a scenario's lifecycle. The user configures the "
       "run through either form controls or direct YAML editing; both "
       "surfaces are kept in sync within the dashboard. On enqueue, two "
       "YAML configurations are written: a baseline (stress disabled) and "
       "a scenario (stress enabled with shock parameters populated). The "
       "job is persisted and added to a sequential runner. Snakemake then "
       "unlocks the workflow, solves the baseline, solves the shocked "
       "scenario, and runs a comparison report. A baseline solve "
       "typically completes in seven to fifteen minutes; a paired run "
       "with comparison report typically completes in twenty to "
       "twenty-five minutes on a developer laptop with twenty clusters "
       "and hourly resolution."),
      ("figure", "fig02_scenario_lifecycle.svg"),
      ("caption", "Figure 2: Stress-test scenario lifecycle from form input to "
                  "comparable result, with the five shock channels exposed by "
                  "the dashboard. Source: authors."),
      ("h2", "3.4. Stress-test taxonomy"),
      ("body",
       "The shock toolkit is intentionally compact and orthogonal so that "
       "combinations are interpretable. Five shock channels are exposed: "
       "a load multiplier on demand, a hydro reduction coefficient on "
       "hydropower availability, a gas capacity reduction on the maximum "
       "installed power of natural-gas units, a SCADA proxy enabling "
       "ramp-rate constraints on controllable generators, and an import "
       "cap with directional limits on cross-border interconnector flows. "
       "Each shock is applied either before optimisation (load and "
       "capacity scaling) or as additional linear constraints, leaving "
       "the solver core unchanged."),
      ("figure", "fig03_risk_matrix.svg"),
      ("caption", "Figure 3: Likelihood-severity risk matrix for European "
                  "energy systems under an Industry 5.0 lens, mapped to the "
                  "platform's stress-test coverage. Source: authors, categories "
                  "adapted from Directive (EU) 2022/2557."),
      ]),
    ("4. Romania winter case study",
     [("h2", "4.1. Scenario set-up"),
      ("body",
       "To illustrate the platform we instantiate a stress-test "
       "configured to mirror the type of question posed by the CER "
       "Directive's national risk assessment process. The simulated week "
       "is 15-22 January 2023 – a real winter week with cold-snap "
       "conditions reflected in ERA5 – modelled at 20 spatial clusters "
       "covering Romania (RO) plus its three principal interconnection "
       "partners Bulgaria (BG), Hungary (HU) and Serbia (RS). Shocks "
       "apply only to Romania. The baseline runs the same network "
       "without stress. The stressed scenario applies: load multiplier "
       "1.30 (30 % demand surge), hydro reduction 0.10 (10 % unavailable "
       "for low-flow conditions), gas capacity reduction 0.20 (20 % "
       "derating for supply-chain or maintenance constraints), SCADA "
       "proxy enabled (ramp-rate limits on thermal units of approximately "
       "15 % of nominal capacity per hour), and an import cap of 0 MWh "
       "on every cross-border interconnector – complete electrical "
       "isolation of Romania."),
      ("h2", "4.2. Quantitative results"),
      ("body",
       "The stressed scenario produces a cost delta of approximately "
       "+570 million EUR over the eight-day window – a 31 % increase – "
       "driven by displacement of imports by costly domestic generation. "
       "Energy not served reaches roughly 45.2 GWh in Romania, "
       "concentrated in evening-peak hours and northern regions; "
       "neighbour countries are unaffected since the shock is unilateral. "
       "Mean locational marginal prices for Romania more than double, "
       "with peaks rising from 180 EUR/MWh to 380 EUR/MWh. Generation mix "
       "shifts as expected: nuclear and renewables remain saturated at "
       "the baseline level (weather is fixed); gas attempts to compensate "
       "but is bounded by capacity reduction and ramp constraints; coal "
       "increases but does not cover the gap. Daily net imports collapse "
       "to zero by construction; congestion hours on inbound "
       "interconnectors fall to zero."),
      ("h2", "4.3. Interpretation"),
      ("body",
       "The case study is not predictive of any specific event; it is an "
       "envelope indicating order of magnitude. Three conclusions follow. "
       "First, even mild simultaneous derating combined with a 30 % "
       "demand spike is enough to trigger blackouts under cross-border "
       "isolation, despite Romania's domestic baseload. Second, the "
       "problem is concentrated in evening-peak hours and northern "
       "regions, so demand-flexibility programmes and targeted storage "
       "have asymmetric leverage. Third, the cost of cross-border "
       "isolation per GWh of forgone imports – on the order of 12 to 15 "
       "million EUR per GWh – provides a quantitative input to the "
       "value-of-interconnection discussion that the TYNDP cycle and the "
       "PCI process require."),
      ]),
    ("5. Dual-use applicability",
     [("body",
       "Figure 4 maps the same platform across a civilian column, a "
       "shared engineering core and a defence/security column. The core "
       "is unchanged: identical optimisation engine, identical data "
       "pipeline, identical YAML grammar, identical result schema. The "
       "differentiation is only at the consumption side. Civilian uses "
       "include net-zero pathway studies for ministries, "
       "renewables-siting and grid-expansion analysis, wholesale-market "
       "design and climate-adaptation assessments. Defence and security "
       "uses include CER-Directive-compliant resilience evidence, "
       "hybrid-threat scenario libraries, energy-supply contingency "
       "planning, strategic reserve sizing under ENS envelopes and joint "
       "table-top exercises with Allied partners. The shared core is the "
       "interoperability surface: anything consumed in one column can be "
       "reproduced in the other from the same artefacts."),
      ("body",
       "This is precisely what the Recast Dual-Use Regulation "
       "contemplates [4]. A platform whose codebase is openly published "
       "is exempt under the public-domain carve-out, but a deployed "
       "instance that integrates national-confidential data may fall "
       "back under control. The architectural response is to separate "
       "the orchestration layer (open) from the data layer "
       "(operator-controlled), so the same codebase serves both purposes "
       "without licensing collision."),
      ("figure", "fig04_dual_use_mapping.svg"),
      ("caption", "Figure 4: Dual-use capability mapping – civilian, shared "
                  "core and defence/security columns – with aligned EU funding "
                  "instruments. Source: authors, instruments compiled from "
                  "official EU work programmes."),
      ]),
    ("6. Contemporary funding mechanisms",
     [("body",
       "The lower band of Figure 4 lists four EU instruments whose "
       "objectives align with the platform's outputs."),
      ("body",
       "Horizon Europe – Cluster 5 (Climate, Energy & Mobility). Cluster "
       "5 is the principal R&I instrument funding open energy modelling. "
       "Its 2023-2024 work programme already cites \"open and "
       "interoperable energy system models\" as eligible activity [9]. "
       "The platform's permissive licensing satisfies the open-science "
       "obligations attached to Horizon Europe grants without further "
       "negotiation."),
      ("body",
       "European Defence Fund. Within the EDF's research strand, "
       "energy-and-environment categories explicitly support "
       "resilience-related work and explicitly contemplate dual-use "
       "leverage where civilian foundations exist [11]. Stress-test "
       "envelopes generated by the platform are admissible inputs to "
       "EDF resilience proposals; the open-source carve-out keeps the "
       "underlying code outside the controlled-items list while the "
       "deployment artefacts can be classified independently."),
      ("body",
       "Connecting Europe Facility – Energy. CEF Energy funds "
       "cross-border interconnector projects through the Projects of "
       "Common Interest list. Platform outputs – interconnector-flow "
       "congestion and net-import deltas under stress – feed directly "
       "into the cost-benefit analyses required by CEF and TYNDP [12]. "
       "CEF Digital adds a complementary track for the data "
       "infrastructure underpinning interoperable modelling."),
      ("body",
       "rescEU and the Critical Raw Materials Act. Civil-protection "
       "funding under the Union Civil Protection Mechanism (rescEU) "
       "backs preparedness exercises, including energy-supply "
       "contingencies; the Critical Raw Materials Act of 2024 connects "
       "energy storage and grid hardware supply chains to the "
       "critical-resilience agenda [13]."),
      ("body",
       "The funding architecture is therefore multi-instrument by "
       "design. A platform that internalises EIF interoperability "
       "obligations can claim eligibility across all four without "
       "architectural duplication, because its outputs are interpretable "
       "in each instrument's terms."),
      ]),
    ("7. Mapping to the European Interoperability Framework",
     [("body",
       "Figure 5 maps the platform onto the four EIF layers, with an "
       "additional governance layer that the present authors propose as "
       "a fifth, cross-cutting concern."),
      ("body",
       "The legal layer is anchored in MIT/Apache-style licensing on "
       "PyPSA, the dashboard's own permissive licence, and the open data "
       "licences attached to ECMWF and Zenodo upstream sources. The "
       "organisational layer is reflected in the three-tab UI, which "
       "maps directly to RACI roles, and in the persistent job state "
       "that documents who initiated which run. The semantic layer "
       "enforces SI units, ISO-3166-1 country codes, ENTSO-E component "
       "identifiers and a result schema whose column names align with "
       "TYNDP output expectations. The technical layer relies on YAML "
       "for configuration, netCDF (CF conventions) for climate inputs, "
       "CSV for results, REST/HTTP for the dashboard API, and drawio + "
       "SVG for figure portability. The governance layer – our proposed "
       "addition – bundles persistent state, immutable templates and "
       "per-run logs into a verifiable audit envelope, with each result "
       "inheriting an assumptions-and-limitations file so policy "
       "briefings carry their epistemic provenance forward."),
      ("body",
       "The novelty is not in the layers themselves – they are EIF "
       "doctrine – but in the demonstration that each is enforced by a "
       "concrete artefact in the codebase. Interoperability becomes a "
       "verifiable property rather than an aspirational claim."),
      ("figure", "fig05_interoperability_stack.svg"),
      ("caption", "Figure 5: Mapping of the platform onto the four-layer "
                  "European Interoperability Framework, augmented with a "
                  "governance layer. Source: authors."),
      ]),
    ("8. Discussion, limitations and future work",
     [("body",
       "Several limitations warrant explicit treatment. First, the "
       "stress-test taxonomy is intentionally compact; real hybrid "
       "threats include attacker-adaptive components that an "
       "optimisation-based model cannot represent without a "
       "game-theoretic extension. Second, the seven-CSV contract is "
       "sufficient for a single-country case study but will require "
       "extension for multi-country assessments. Third, the dashboard's "
       "sequential runner is appropriate for analyst-driven exploration "
       "but not for automated parameter sweeps; a parallel runner is on "
       "the roadmap. Fourth, the dual-use carve-out is currently invoked "
       "at the codebase level; a deployment that ingests classified "
       "network parameters would have to be assessed under the "
       "controlled-list framework, even though the codebase itself is "
       "exempt."),
      ("body",
       "Future work has three vectors. The modelling vector will "
       "integrate adversarial scenarios with explicit attacker models "
       "(cyber-physical co-simulation). The interoperability vector "
       "will harmonise the result schema with EU-funded ontology "
       "projects and propose a public RDF/JSON-LD wrapper around the "
       "seven CSVs. The governance vector will formalise the "
       "assumptions-limitations file as a machine-readable provenance "
       "object aligned with W3C PROV [14]."),
      ]),
    ("9. Conclusions",
     [("body",
       "We have argued that civilian-by-design, open-source "
       "energy-system modelling stacks are the most defensible "
       "substrate for cross-pillar interoperability in "
       "critical-infrastructure security. The paper makes three "
       "contributions: a six-layer architecture for a paired-scenario "
       "stress-test platform built on PyPSA-Eur and a Next.js "
       "dashboard; a worked Romania winter case study that demonstrates "
       "the platform's quantitative envelope under cross-border "
       "isolation; and a mapping of the platform's artefacts to the "
       "European Interoperability Framework, augmented with a "
       "governance layer. Contemporary EU funding instruments – Horizon "
       "Europe Cluster 5, the EDF, CEF Energy and rescEU – already "
       "foresee the dual orientation; platforms that internalise the "
       "EIF obligations can be co-funded across instruments without "
       "architectural duplication. The route from civilian "
       "decarbonisation studies to defence-relevant resilience evidence "
       "runs through the same codebase; the differentiation is at the "
       "data and exploitation layer, not at the modelling core."),
      ]),
]

ACK_TEXT = (
    "The author thanks the PyPSA-Eur open-source community for an "
    "exceptionally well-structured modelling substrate, and the Romanian "
    "academic community for ongoing exchanges on national grid resilience. "
    "Computational work was carried out on locally-managed resources; no "
    "institutional funding is reported."
)

REFERENCES_TEXT = [
    "[1] European Union Agency for Cybersecurity (ENISA). Threat Landscape "
    "for the Energy Sector. Athens: ENISA; 2023.",
    "[2] International Energy Agency. Power Systems in Transition: "
    "Challenges and Opportunities Ahead for Electricity Security. Paris: "
    "OECD/IEA; 2020.",
    "[3] European Commission. European Interoperability Framework – "
    "Implementation Strategy. COM(2017) 134 final. Brussels: European "
    "Commission; 2017.",
    "[4] European Parliament and Council. Regulation (EU) 2021/821 of 20 "
    "May 2021 setting up a Union regime for the control of exports, "
    "brokering, technical assistance, transit and transfer of dual-use "
    "items (recast). Official Journal of the European Union L 206; 11 "
    "June 2021.",
    "[5] Hörsch J., Hofmann F., Schlachtberger D., Brown T. PyPSA-Eur: An "
    "open optimisation model of the European transmission system. Energy "
    "Strategy Reviews. 2018; 22: 207-215.",
    "[6] Breque M., De Nul L., Petridis A. Industry 5.0 – Towards a "
    "sustainable, human-centric and resilient European industry. "
    "Luxembourg: Publications Office of the European Union; 2021.",
    "[7] European Parliament and Council. Directive (EU) 2022/2555 of 14 "
    "December 2022 on measures for a high common level of cybersecurity "
    "across the Union (NIS2). Official Journal of the European Union L "
    "333; 27 December 2022.",
    "[8] European Parliament and Council. Directive (EU) 2022/2557 of 14 "
    "December 2022 on the resilience of critical entities. Official "
    "Journal of the European Union L 333; 27 December 2022.",
    "[9] European Commission. Horizon Europe Work Programme 2023-2024 – "
    "Cluster 5: Climate, Energy and Mobility. Brussels: European "
    "Commission; 2023.",
    "[10] Pfenninger S., Hawkes A., Keirstead J. Energy systems modeling "
    "for twenty-first century energy challenges. Renewable and Sustainable "
    "Energy Reviews. 2014; 33: 74-86.",
    "[11] European Commission. European Defence Fund Annual Work Programme "
    "2024. Brussels: European Commission; 2024.",
    "[12] European Network of Transmission System Operators for "
    "Electricity (ENTSO-E). Ten-Year Network Development Plan 2024 – "
    "Methodology. Brussels: ENTSO-E; 2024.",
    "[13] European Parliament and Council. Regulation (EU) 2024/1252 of "
    "11 April 2024 establishing a framework for ensuring a secure and "
    "sustainable supply of critical raw materials. Official Journal of "
    "the European Union L 173; 22 April 2024.",
    "[14] World Wide Web Consortium. PROV-O: The PROV Ontology, W3C "
    "Recommendation 30 April 2013. Cambridge MA: W3C; 2013.",
]

# ---- build the new body XML ------------------------------------------------

def build_body_xml() -> str:
    parts: list[str] = []

    # Title block
    parts.append(para("KBOTitle", TITLE))
    parts.append(para("KBOAuthors", AUTHOR))
    parts.append(para("KBOAffiliation", AFFILIATION))
    parts.append(para("KBOAffiliation", EMAIL))

    # Abstract: one paragraph, italic. The KBOAbstract style already enforces
    # italic + size 11 + justified, so we keep it as a single styled run with
    # an explicit "Abstract:" lead-in.
    parts.append(para_runs("KBOAbstract", [
        ("Abstract: ", {"bold": True, "italic": True}),
        (ABSTRACT_TEXT, {"italic": True}),
    ]))

    # Keywords
    parts.append(para("KBOKeywords", KEYWORDS))

    # Sections
    for heading, items in SECTIONS:
        parts.append(heading1(heading))
        for kind, payload in items:
            if kind == "body":
                parts.append(body_para(payload))
            elif kind == "h2":
                parts.append(heading2(payload))
            elif kind == "figure":
                parts.append(empty_figure_holder(payload))
            elif kind == "caption":
                parts.append(figure_caption(payload))

    # Acknowledgements
    parts.append(heading1("Acknowledgements"))
    parts.append(body_para(ACK_TEXT))

    # References
    parts.append(para("KBOReferencesCaption", "References"))
    for ref in REFERENCES_TEXT:
        parts.append(reference(ref))

    return "".join(parts)

# ---- splice into template ---------------------------------------------------

def main() -> None:
    if not SRC.exists():
        raise SystemExit(f"Template not found: {SRC}")

    raw = SRC.read_text(encoding="utf-8")

    # Locate /word/document.xml part (the OPC layout puts each part inside
    # <pkg:part pkg:name="..."> ... <pkg:xmlData>...</pkg:xmlData> ... </pkg:part>).
    # We will operate on the *content of <w:body>* inside that part.

    # Find <w:body> opening tag (with attributes) and matching closing.
    m_open  = re.search(r"<w:body(\s[^>]*)?>", raw)
    m_close = re.search(r"</w:body>", raw[m_open.end():] if m_open else "") if m_open else None
    if not (m_open and m_close):
        raise SystemExit("Could not locate <w:body> in the template – aborting.")

    body_open_end  = m_open.end()
    body_close_start = body_open_end + m_close.start()
    body_inner = raw[body_open_end:body_close_start]

    # Preserve the trailing <w:sectPr>...</w:sectPr> block (page setup, columns).
    sect_match = re.search(r"<w:sectPr\b.*?</w:sectPr>", body_inner, flags=re.DOTALL)
    sect_pr = sect_match.group(0) if sect_match else ""

    new_body = build_body_xml() + sect_pr
    new_raw  = raw[:body_open_end] + new_body + raw[body_close_start:]

    DST.parent.mkdir(parents=True, exist_ok=True)
    DST.write_text(new_raw, encoding="utf-8")
    size_kb = DST.stat().st_size / 1024
    print(f"Wrote {DST} ({size_kb:.1f} KiB)")

if __name__ == "__main__":
    main()
