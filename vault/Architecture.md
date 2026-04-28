# Architecture

This note summarizes the current repo layout and how the web dashboard fits into the workflow.

## High-level flow

Template YAML in `personal_docs/`
  -> Next.js builder in `vizualizer/src/app/page.tsx`
  -> API route handlers in `vizualizer/src/app/api/`
  -> Scenario YAML written to `config/adversarial/generated/`
  -> Snakemake and Python commands spawned by `vizualizer/src/app/lib/job-runner.ts`
  -> Results and comparison files in `results/`
  -> Dashboard scans and previews results back through API routes

## Dashboard layers

- `vizualizer/src/app/page.tsx` is the client-side control room UI.
- `vizualizer/src/app/api/` contains the server route handlers.
- `vizualizer/src/app/lib/scenario.ts` builds YAML, config files, and command lists.
- `vizualizer/src/app/lib/job-runner.ts` runs the queue, tracks status, and tails logs.
- `vizualizer/src/app/lib/results.ts` discovers valid result folders and parses summaries.
- `vizualizer/src/app/lib/runtime.ts` resolves the conda or Python execution mode.

## Data flow through the dashboard

1. The builder loads a YAML template from `personal_docs/` via `GET /api/scenario/template`.
2. The user edits fields or the working YAML.
3. `POST /api/scenario/build` normalizes the inputs and returns generated YAML.
4. `POST /api/runs/enqueue` writes scenario YAML files and queues a job.
5. The runner executes Snakemake unlock/solve steps and the report script.
6. Results are discovered under `results/` when the folder contains the required CSV set.

## Result contract

The dashboard only considers a folder valid if it contains:

- `system_cost_comparison.csv`
- `generation_mix_mwh.csv`
- `lmp_summary_ro.csv`
- `ens_summary.csv`
- `curtailment_mwh.csv`
- `daily_net_imports_mwh.csv`
- `interconnector_flow_congestion.csv`

## Runtime behavior

- If `PLANUI_CONDA_ENV` is set, the dashboard uses that named conda environment.
- If `PLANUI_CONDA_PREFIX` is set, it uses that prefix.
- Otherwise it tries the active non-base conda prefix, then `CONDA_DEFAULT_ENV`, then `pypsa`, then `pypsa-eur`.
- If no conda executable is found, it falls back to system Python.
- Proxy environment variables are stripped before subprocesses run unless `PLANUI_USE_SYSTEM_PROXY=1` is set.

## Deployment and state

- Logs go to `logs/planui-web/`.
- Queue state persists in `vizualizer/.data/planui-state.json`.
- The app runs on the Node.js runtime, not the Edge runtime.

## Relationship to the rest of the repo

- `config/` holds the scenario templates and generated configs.
- `results/` holds the outputs surfaced in the dashboard.
- `scripts/` contains the reporting and diagram generation scripts called by the dashboard.
- `personal_dashboard/` remains the legacy Tkinter UI.
- `doc/` remains the upstream Sphinx documentation tree.