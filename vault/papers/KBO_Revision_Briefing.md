# KBO 2026 — Revision Briefing for Reviewer Feedback (Submission 90)

**Target document:** `vault/papers/KBOPieleManescu.xml` (also available as `KBOPieleManescu.docx`).
**Source paper:** "Dual-Use Energy-System Modelling for Critical-Infrastructure Resilience: Open-Source Stress-Test Orchestration as a Lever for Technical Interoperability."
**Decision received:** *ACCEPTED WITH MINOR CHANGES — THE PAPER WILL BE REVIEWED AGAIN.* (Reviewer 1: minor revisions; Reviewer 2: accepted as-is.)
**Score:** 43 (acceptance threshold: 35).

**Golden rule for the Claude-for-Word session:** Do **not** touch styles, fonts, margins, columns, page layout, headers, footers, the `<w:sectPr>` block, or any `<w:pPr>`/`<w:rPr>` formatting. Replace text **only** inside existing paragraphs by matching the surrounding `w:pStyle`. Two figures may be inserted as described in §5 of this briefing; if inserting figures risks breaking the KBO column layout, leave them out and keep only the textual revisions — the reviewers did not request more figures.

---

## 1. What the reviewers asked for

Reviewer 1 marked the following criteria below "good": **clarity of research question (poor)**, accuracy of analysis methods (fair), contribution to knowledge (fair), coherence of conclusions (fair). The narrative comments are precise:

1. *"The introduction needs to be revised and expanded. References to KBO content are unnecessary. Additionally, the three claims need to be reformulated as research questions for greater clarity."*
2. *"The conclusions of the paper need to be revised to highlight aspects related to resilience and its measurement. The three contributions mentioned in the Conclusions should be presented in greater detail and in the form of research findings or proposals."*

Reviewer 2 accepted as-is and rated clarity of research question as excellent — confirming that the underlying argument is sound and only the framing of Introduction and Conclusion needs to be adjusted.

**Therefore the revision is bounded to:**
- The **Introduction** (currently §1 of the submitted paper).
- The **Conclusions** (currently the final numbered section before References).
- Nothing else. Do not re-open any other section, do not add or remove citations elsewhere, do not change figures already inserted in the submitted document.

---

## 2. Diagnosis of the submitted text against the feedback

Two issues in the current Introduction trigger Reviewer 1's comment:

- The opening paragraph references the KBO 31st conference invitation ("The 31st KBO conference invites contributions on augmenting technical interoperability of complex systems…"). KBO articles are not supposed to advertise the conference in their own body — this is what the reviewer means by *"references to KBO content are unnecessary."* Remove the sentence in its entirety.
- The third paragraph announces *"This paper advances three claims. First… Second… Third…"*. Each claim is phrased as a declarative statement before the evidence has been presented. The reviewer wants these reformulated as **research questions** so the reader knows what the paper is asking, not what it is concluding in advance.

Two issues in the current Conclusion trigger Reviewer 1's second comment:

- The Conclusion mentions resilience once in passing ("civilian-by-design, open-source energy-system modelling stacks are the most defensible substrate…") without giving any operational definition of resilience or showing how the paper actually measures it. The reviewer wants resilience and *its measurement* explicitly highlighted — i.e. the metrics the platform produces, the indicators they correspond to in the resilience literature, and what magnitudes were observed.
- The three contributions are listed in a single dense sentence. The reviewer wants them unpacked as **research findings or proposals** — i.e. each contribution stated with its supporting evidence (a finding) or with its call to action (a proposal).

The proposed rewrites in §3 and §4 below resolve both items.

---

## 3. Drop-in replacement: Section 1 — Introduction

Paste the following text verbatim in place of the current Section 1. Keep the existing `KBO Heading 1` paragraph that says *"1. Introduction"*; replace only the four body paragraphs that follow. The structure preserves the four-paragraph rhythm of the original so column balance is unaffected.

> Energy systems sit at the intersection of two contemporary policy concerns. They are the prototypical complex socio-technical systems whose disruption cascades through every other sector, and their digital control surfaces have become a contested domain in hybrid conflict [1], [2]. Romania's exposure is illustrative: as a south-eastern frontier of the European synchronous area, with active interconnection to Bulgaria, Hungary and Serbia, it operates in a region where physical, market and informational disruptions are no longer hypothetical. The 2022–2024 European energy-security crisis exposed the cost of modelling deficits — analyses produced under emergency conditions had no shared interoperability surface for cross-checking results between ministries, transmission operators, regulators and defence agencies.
>
> This paper investigates whether an open-source energy-system modelling stack — instantiated here by PyPSA-Eur and a Romania-specific orchestration dashboard — can serve as a verifiable substrate for technical interoperability in the security of critical infrastructure. The investigation is grounded in an instantiated platform. PyPSA-Eur is an open European power-system optimisation model, built on the PyPSA library, with a Snakemake workflow orchestrating data preparation, network assembly and optimisation [5]. To this substrate we have added a Romania-specific extension that consumes the same data pipeline but exposes a stress-test interface designed for security-relevant simulation: synthetic load multipliers, hydro and gas capacity reductions, ramp-rate constraints proxying SCADA limits, and directional caps on cross-border interconnections. A web dashboard ("Vizualizer") provides a three-tab control room — scenario builder, run queue, results viewer — that allows non-coding analysts to assemble paired baseline / stressed runs, monitor execution, and inspect results that satisfy a deterministic seven-CSV contract.
>
> Three research questions structure the work that follows.
>
> - **RQ1 — Interoperability.** *Can an open-source modelling stack satisfy the four layers of the European Interoperability Framework — legal, organisational, semantic and technical — when its result schema, configuration grammar and orchestration are deliberately designed as contracts rather than as artefacts [3]?*
> - **RQ2 — Dual-use qualification.** *Does such a stack qualify as a dual-use technology in the sense of EU Regulation 2021/821, that is, usable for civilian decarbonisation studies and equally for defence-relevant resilience assessments while remaining within the public-domain carve-out of the regulation [4]?*
> - **RQ3 — Funding alignment.** *Do contemporary EU funding instruments — Horizon Europe Cluster 5, the European Defence Fund, the Connecting Europe Facility and rescEU — already foresee this dual orientation in a way that lets a platform internalise the four-layer interoperability obligation be co-funded across instruments without architectural duplication?*
>
> The remainder of the paper is organised to answer these questions in turn. Section 2 reviews Industry 5.0, the EU regulatory frame for critical infrastructure, and dual-use export controls. Section 3 details the platform architecture and lifecycle. Section 4 presents a Romania winter cross-border-isolation case study and the resilience metrics it produces. Section 5 discusses dual-use applicability. Section 6 surveys the funding mechanisms relevant to such a platform. Section 7 maps the platform onto the European Interoperability Framework layers. Section 8 closes with limitations and avenues for further work, before Section 9 returns to the three research questions in the form of evidenced findings and forward-looking proposals.

### Why this text answers the feedback

- The KBO conference is no longer referenced.
- The Introduction is **expanded** from three short paragraphs to four full paragraphs plus an explicit research-questions block — visually heavier on the page and substantively more informative.
- The three claims have been reformulated as **three labelled research questions** (RQ1, RQ2, RQ3), each phrased as an interrogative. Each question retains the citation that anchored the original claim, so no reference renumbering is needed.
- The closing paragraph maps each question to the section where it is answered, which gives the reader the road map Reviewer 1 implicitly asked for under "clarity of research question."

### Optional cut if the column overflows

If the four-paragraph Introduction overruns its column, delete the sentence beginning *"The 2022–2024 European energy-security crisis exposed the cost of modelling deficits…"* — it is the only sentence in the paragraph that is not load-bearing.

---

## 4. Drop-in replacement: final section — Conclusions

Paste the following text verbatim in place of the current Conclusions section. Keep the existing `KBO Heading 1` heading paragraph; replace only its body. The new text reframes the three contributions as one *finding* and two *proposals*, and adds a focused paragraph on resilience and its measurement, which is exactly what the reviewer requested.

> **Resilience and its measurement.** This paper has treated resilience as an operational, measurable property rather than a rhetorical one. The platform's seven-CSV result contract surfaces five families of resilience indicators: a cost envelope (`system_cost_comparison.csv`) expressing the macroeconomic cost of recovery; an unserved-energy envelope (`ens_summary.csv`) expressing the loss-of-service magnitude; a price envelope (`lmp_summary_ro.csv`) expressing the marginal stress placed on the wholesale layer; a generation-mix shift (`generation_mix_mwh.csv`) expressing the substitution effort exerted by the remaining controllable fleet; and a congestion-and-flow envelope (`interconnector_flow_congestion.csv`, `daily_net_imports_mwh.csv`) expressing the loss of cross-border buffering. Read together, these five indicators populate the standard *recovery, absorption and adaptation* triplet used in the resilience literature, with explicit quantities in SI units. Under the Romania winter envelope examined in Section 4, absorption is measured by the +570 M EUR additional system cost and the displacement of approximately 370 GWh of gas generation; loss of service is measured by 45.2 GWh of unserved energy concentrated in evening-peak hours and in the northern half of the country; the marginal-stress signal is the doubling of the locational marginal price from approximately 65 EUR/MWh to 145 EUR/MWh, with peaks rising from 180 EUR/MWh to 380 EUR/MWh; and the loss-of-buffering signal is the collapse of cross-border net imports to zero. Each indicator is reproducible from the same artefacts and is therefore inter-comparable across scenarios, across deployments and across borders.
>
> **Finding 1 — A six-layer architecture for paired-scenario stress testing is feasible on an open substrate.** The platform demonstrates that a Presentation, API, Domain Logic, Workflow and Optimisation, Persistence and External Data stack can be assembled around PyPSA-Eur and a Next.js dashboard without modifying the optimisation core. The architecture is reproducible on a developer workstation and produces a paired baseline-plus-stressed run with the comparison report in twenty to twenty-five minutes at twenty spatial clusters and hourly resolution. The architecture is therefore a candidate substrate for national risk-assessment work under Directive (EU) 2022/2557 [8] without bespoke development per analyst.
>
> **Finding 2 — Compact orthogonal shocks already produce CER-Directive-grade evidence.** Five orthogonal shock channels — load multiplier, hydro reduction, gas capacity reduction, SCADA-proxy ramp-rate constraints and directional import caps — combine into a parameter space whose envelopes are interpretable for resilience decision-making. The Romania winter case study confirms that even moderate simultaneous derating, combined with electrical isolation, produces order-of-magnitude resilience signals (≈45 GWh of unserved energy; +31 % system-cost increase; doubling of locational marginal price) on a single weekly window. The finding is that compact shock taxonomies are sufficient as the *measurement instrument* for the recovery, absorption and adaptation axes — provided the result schema is contractual.
>
> **Proposal 1 — A governance layer should be added to the European Interoperability Framework for critical-infrastructure modelling.** The four-layer European Interoperability Framework [3] is necessary but not sufficient for security-relevant deployment. We propose a fifth, cross-cutting *governance* layer that bundles persistent job state, immutable templates, per-run logs and a machine-readable assumptions-and-limitations object into a verifiable audit envelope. The proposal turns interoperability into a property that can be **audited**, not only **claimed** — which is the threshold a national risk assessment under the Critical Entities Resilience Directive must meet to be admissible.
>
> **Proposal 2 — Civilian-by-design platforms should be the default substrate for cross-pillar EU funding in critical-infrastructure security.** The route from civilian decarbonisation studies to defence-relevant resilience evidence runs through the same codebase; the differentiation is at the data and exploitation layer, not at the modelling core. Civilian-by-design open platforms therefore satisfy the public-domain carve-out under Regulation (EU) 2021/821 [4] by construction, and let Horizon Europe Cluster 5, the European Defence Fund, the Connecting Europe Facility and rescEU finance complementary deliverables of a single architecture rather than four parallel architectures. We propose that this *single-substrate* posture be made an explicit eligibility criterion in the next work-programme cycle of each of these four instruments.
>
> Future work has three vectors. The *modelling* vector will integrate adversarial scenarios with explicit attacker models through cyber-physical co-simulation. The *interoperability* vector will harmonise the result schema with EU-funded ontology projects and propose a public RDF/JSON-LD wrapper around the seven CSVs. The *governance* vector will formalise the assumptions-and-limitations file as a machine-readable provenance object aligned with W3C PROV [14].

### Why this text answers the feedback

- A dedicated paragraph titled *"Resilience and its measurement"* opens the Conclusions. It defines resilience operationally, names the five indicator families, references the result-contract CSVs that carry them, and quantifies each one for the case study. This is exactly the "highlight aspects related to resilience and its measurement" that Reviewer 1 asked for.
- The three contributions are restated as **two evidenced findings and two forward-looking proposals**, each in a full paragraph rather than a single sentence. The labels (*Finding 1*, *Finding 2*, *Proposal 1*, *Proposal 2*) make the genre of each contribution unambiguous to a reviewer scanning for "research findings or proposals."
- The closing future-work paragraph is preserved so the section still ends with forward direction, but it is now subordinate to the findings and proposals rather than competing with them.
- No new references are introduced. All citations ([3], [4], [8], [14]) already exist in the submitted bibliography.

### Optional cut if the column overflows

If the Conclusions paragraph runs into a third page that the section did not previously occupy, the most expendable sentence is in *Finding 1*: drop *"The architecture is reproducible on a developer workstation and produces a paired baseline-plus-stressed run with the comparison report in twenty to twenty-five minutes at twenty spatial clusters and hourly resolution."* — the timing claim is not strictly load-bearing for the finding.

---

## 5. Optional new figures

The reviewers did **not** ask for new figures. Insert these only if there is a natural empty slot near the Conclusions paragraph on resilience and only if doing so does not force a column rebalance. If in doubt, do not insert. Two SVG files are provided:

| Order in revised paper | File (relative to repo root) | Caption (verbatim) |
|---|---|---|
| New Figure 6 *(or Figure A if appendix-style is preferred)* | `vault/diagrams/fig09_resilience_measurement.svg` | *Figure 6: Operational definition of resilience measured by the platform. The recovery / absorption / adaptation axes are mapped to the seven-CSV result contract, with magnitudes observed for the Romania winter envelope.* |
| New Figure 7 | `vault/diagrams/fig10_research_questions_findings.svg` | *Figure 7: Mapping of the three research questions to the corresponding findings and proposals in the Conclusions.* |

Both figures are rendered as transparent SVGs in the project theme so they sit on the page without a visible bounding box. If Word objects to SVG, both are also exported as PNG at the same paths with extension `.png`.

---

## 6. Suggested prompt sequence for the Claude-for-Word session

Run these prompts in order. Approve each before moving on.

> **Prompt 1 — Reconnaissance.** "Read the document. Identify the paragraph style ID used for body text inside Section 1 (Introduction) and for body text inside the Conclusions section. Identify the paragraph style ID used for bullet lists. Report exactly the `w:pStyle` values you found and the section boundaries. Do not modify anything."

> **Prompt 2 — Replace the Introduction body.** "Replace the body paragraphs of Section 1 (Introduction) with the four paragraphs and the research-questions bullet block in Section 3 of `KBO_Revision_Briefing.md`. Keep the existing heading paragraph untouched. Each new paragraph must reuse the same `w:pStyle` value you reported in Prompt 1. The bullet items use the bullet-list style you reported in Prompt 1. Preserve all citation tokens (`[1]`, `[2]`, …) exactly. Do not change figures or section numbering."

> **Prompt 3 — Replace the Conclusions body.** "Replace the body paragraphs of the Conclusions section with the six paragraphs in Section 4 of `KBO_Revision_Briefing.md`. Keep the existing heading paragraph untouched. Apply bold to the lead-in phrases *Resilience and its measurement.*, *Finding 1 — …*, *Finding 2 — …*, *Proposal 1 — …*, *Proposal 2 — …* using the document's existing inline bold run pattern (`<w:rPr><w:b/></w:rPr>` if it is already used elsewhere in the same section)."

> **Prompt 4 — Citation sanity check.** "List every numbered citation (`[n]`) that appears in the new Introduction and the new Conclusions. Confirm that every number is already present in the References section of the document. If any number is missing from References, stop and report it — do not invent references."

> **Prompt 5 — Optional figure insertion.** "Only execute this prompt if the user explicitly confirms. Insert `vault/diagrams/fig09_resilience_measurement.svg` between the *Resilience and its measurement* paragraph and *Finding 1* in the Conclusions, with the caption from Section 5 of `KBO_Revision_Briefing.md` (`Figure 6: …`). Match the existing figure-insertion pattern in the document. If the insertion causes a column overflow or pushes any section onto a new page, undo the insertion and report."

> **Prompt 6 — Length verification.** "Report the current page count and the number of lines that the Introduction and Conclusions now occupy. If the document exceeds 8 pages (KBO hard upper limit) or falls below 4 pages, propose specific sentences to cut or expand using the optional cuts noted in Sections 3 and 4 of `KBO_Revision_Briefing.md`."

> **Prompt 7 — Final style-preservation audit.** "Confirm that no `<w:sectPr>` has changed, no `<w:pPr>` paragraph property was overridden, no style was created, no font was changed, no margin was changed, and no column was changed. Produce a PASS/FAIL list and stop."

---

## 7. Things the session must **not** do

- Do not change the abstract, keywords, author block, affiliations or e-mail line.
- Do not change Sections 2 through 8 (Background through Discussion). The reviewer praised the structure, the bibliography and the figures already there.
- Do not renumber existing citations or add new ones. Every reference token in the rewrite is already in the document.
- Do not insert a "Response to reviewers" paragraph inside the paper. That goes in a separate cover letter, not in the body.
- Do not insert TODO markers, change-tracking comments or revision marks into the body. Revisions in KBO submissions are delivered clean.
- Do not mention the platform's HTTP proxy stripping behaviour, the `PLANUI_USE_SYSTEM_PROXY` variable, or any proxy environment workarounds.

---

## 8. Cover-letter draft (for the editor, separate file from the paper)

A cover letter for the resubmission portal — paste the following into a fresh email or the portal's response field, not into the paper itself.

> Dear Editor,
>
> Thank you for the constructive feedback on Submission 90, "Dual-Use Energy-System Modelling for Critical-Infrastructure Resilience: Open-Source Stress-Test Orchestration as a Lever for Technical Interoperability." We have prepared a revised manuscript that addresses the two narrative comments from Reviewer 1 while preserving the structure, methods and contributions that both reviewers found sound.
>
> The Introduction has been revised and expanded. The reference to the KBO conference invitation has been removed, and the three claims that previously opened the paper have been reformulated as three explicit research questions (RQ1 – Interoperability, RQ2 – Dual-use qualification, RQ3 – Funding alignment). Each research question is mapped to the section that answers it, which we hope improves clarity of the research question — the criterion the reviewer marked as needing the most attention.
>
> The Conclusions have been revised to open with a dedicated paragraph on resilience and its measurement. The paragraph defines resilience operationally through five indicator families that the platform's result contract surfaces, maps them onto the standard recovery / absorption / adaptation triplet, and reports the quantities observed for the Romania winter envelope. The three contributions previously listed in a single sentence have been unpacked into two evidenced findings and two forward-looking proposals, each in its own paragraph.
>
> No additional references have been introduced and no figure has been removed or repositioned. Sections 2 through 8 are unchanged. We trust that these targeted revisions meet the reviewer's expectations and remain at the disposal of the editorial board for any further adjustment.
>
> Yours sincerely,
>
> Bogdan-Andrei Mănescu

---

*End of revision briefing. This file is the complete reference for the Claude-for-Word resubmission session. Open it as a side reference in the Word add-in, attach `vault/papers/KBOPieleManescu.xml` for editing, and run the prompts in Section 6 in order.*
