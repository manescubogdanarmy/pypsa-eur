# Vizualizer - Web Dashboard

The `vizualizer/` folder contains the current Next.js dashboard for scenario creation, run orchestration, and result exploration.

> [!NOTE]
> The spelling is intentionally `vizualizer` with a z, matching the folder name.

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.2.4 App Router |
| UI | React 19.2.4, Tailwind CSS 4 |
| Language | TypeScript 5 |
| CSV parsing | papaparse 5 |
| YAML parsing | yaml 2 |
| Runtime | Node.js server route handlers |

## Main UI

The landing page is a three-tab control room:

- Scenario Builder
- Run Queue
- Results and Vizualizer

The page also supports English and Romanian labels, a theme toggle, and the dashboard styling in `src/app/globals.css`.

## Scenario Builder

The builder supports:

- Paired mode for baseline plus scenario generation
- Single mode when a reference baseline network already exists
- Snapshot window, cutout year, cluster count, solver name, and solver options
- Stress controls for load, hydro, gas, SCADA, and import cap settings
- A working YAML editor synchronized with the form controls

Template YAML is loaded from `personal_docs/` and the generated configs are written to `config/adversarial/generated/`.

## Run Queue

The queue is sequential. One job runs at a time.

- `queued` jobs wait in order
- `running` jobs stream progress from stdout or stderr
- `succeeded`, `failed`, `cancelled`, and `interrupted` capture terminal states
- Logs are tailed from `logs/planui-web/<jobId>.log`
- Restarted jobs that were still running are normalized to `interrupted`

## Results Viewer

The Results tab scans `results/` and only shows folders that contain the seven comparison CSVs:

1. `system_cost_comparison.csv`
2. `generation_mix_mwh.csv`
3. `lmp_summary_ro.csv`
4. `ens_summary.csv`
5. `curtailment_mwh.csv`
6. `daily_net_imports_mwh.csv`
7. `interconnector_flow_congestion.csv`

For each valid result folder the UI can show:

- Parsed summary metrics
- CSV previews
- PNG figures
- Drawio files
- SVG files
- `assumptions_limitations.md` when present

## API Routes

All endpoints live under `src/app/api/`.

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/scenario/template` | Load the working YAML template for a selected cutout year |
| `POST` | `/api/scenario/build` | Build working YAML from form input |
| `POST` | `/api/runs/enqueue` | Generate configs and queue a job |
| `GET` | `/api/runs/jobs` | List all queued and historical jobs |
| `POST` | `/api/runs/cancel` | Cancel a job by id |
| `POST` | `/api/runs/delete` | Delete a job by id |
| `POST` | `/api/runs/reset` | Reset the runner state |
| `GET` | `/api/runs/log` | Tail a job log by `jobId` |
| `GET` | `/api/runs/baselines` | List baseline network files |
| `GET` | `/api/results` | Scan and list valid result folders |
| `GET` | `/api/results/summary` | Return parsed summary and file lists |
| `GET` | `/api/results/csv` | Return a CSV preview |
| `GET` | `/api/results/figure` | Serve a PNG figure |
| `GET` | `/api/results/drawio` | Download a drawio asset |
| `GET` | `/api/results/svg` | Download an SVG asset |
| `POST` | `/api/results/diagrams` | Generate result diagrams |

## Runtime detection

`src/app/lib/runtime.ts` resolves the Python and Snakemake commands in this order:

1. `PLANUI_CONDA_ENV`
2. `PLANUI_CONDA_PREFIX`
3. The active non-base `CONDA_PREFIX`
4. `CONDA_DEFAULT_ENV` when it is not `base`
5. Named env candidates: `pypsa`, then `pypsa-eur`
6. System Python fallback

The code also strips proxy variables before spawning subprocesses unless `PLANUI_USE_SYSTEM_PROXY=1` is set.

## Job lifecycle

`POST /api/runs/enqueue` follows this flow:

1. Normalize the scenario inputs.
2. Build one or two YAML files in `config/adversarial/generated/`.
3. Construct the Snakemake unlock, solve, and report commands.
4. Persist the job to `vizualizer/.data/planui-state.json`.
5. Run the job when the queue is free.

Paired mode runs baseline then scenario, then generates the comparison report.
Single mode skips the baseline solve and uses the selected reference baseline network.

## Known environment issue

If Snakemake starts with `ModuleNotFoundError: No module named 'pkg_resources'`, install a newer `google-cloud-storage` into the project environment:

```bash
conda run -n pypsa pip install "google-cloud-storage>=2.10"
```

## Relationship to the legacy UI

`personal_dashboard/` is the older Tkinter interface. The Next.js dashboard is the current primary UI and the one this vault documents.