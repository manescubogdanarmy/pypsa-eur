# Architecture

This note summarizes how the PyPSA-Eur Romania project is structured and how data flows through the system.

## High-level flow

Configuration (config/*.yaml)
  -> Snakemake rules (Snakefile + rules/)
  -> Workflow scripts (scripts/)
  -> Intermediate artifacts (resources/)
  -> Results and reports (results/)
  -> Analysis (personal_analysis/)
  -> Visualization (vizualizer/ or personal_dashboard/)

## Core workflow layers

- Snakefile and rules/ define the workflow graph and targets.
- scripts/ implements data retrieval, network building, solving, and reporting.
- config/ holds scenario configs, templates, and schema.
- data/ stores the raw and processed datasets.
- resources/ caches intermediate files produced by early rules.
- results/ stores final networks, CSVs, figures, and comparison outputs.

## Romania-specific extensions

- Stress-test logic lives in scripts/romania_winter_stress.py and
  scripts/report_romania_winter_stress.py.
- Templates and notes are in personal_docs/.
- Generated configs land in config/adversarial/generated/.
- Runner scripts are in personal_runners/.
- Analysis and reporting helpers are in personal_analysis/.
- Validation scripts are in personal_diagnostics/.
- Legacy UI is in personal_dashboard/ (Tkinter).

## Visualization layer

- vizualizer/ is the primary Next.js dashboard with scenario builder, run queue,
  and results viewer.
- Logs are written to logs/planui-web/ and job state to vizualizer/.data/.
- The dashboard reads templates from personal_docs/ and writes configs to
  config/adversarial/generated/.

## Environments and tooling

- envs/environment.yaml supports conda-based installs.
- pixi.toml and pixi.lock support Pixi-based installs.
- The repo uses ruff for linting and pytest for tests.

## Documentation

- vault/ is the Obsidian knowledge base kept in sync with the repo.
- doc/ contains the Sphinx documentation for the upstream PyPSA-Eur workflow.