# Running Documentation

This note describes how runs move through the current Next.js dashboard.

## Start the dashboard

```bash
cd vizualizer
npm run dev
```

The app opens on http://localhost:3000.

## How runs are executed

- Scenario inputs are normalized in `src/app/lib/scenario.ts`.
- `POST /api/runs/enqueue` generates the scenario YAML, writes it into `config/adversarial/generated/`, and queues the job.
- Jobs are run sequentially by `src/app/lib/job-runner.ts`; only one command is active at a time.
- The runner calls conda-aware Snakemake and Python commands, then writes logs under `logs/planui-web/`.

## Job states

- `queued`
- `running`
- `succeeded`
- `failed`
- `cancelled`
- `interrupted`

Queued jobs can be canceled before they start. Running jobs can be canceled by signaling the active process. The Reset button clears the active process and normalizes any stuck jobs to `interrupted`.

## Result discovery

The Results tab only shows folders in `results/` that contain the seven comparison CSVs listed in [[Vizualizer]].

## When a run is considered complete

- The baseline solve finishes in paired mode.
- The scenario solve finishes.
- `scripts/report_romania_winter_stress.py` generates the comparison report into the selected output folder.

## Practical notes

- If the dashboard starts from the wrong conda context, set `PLANUI_CONDA_ENV=pypsa` before launching it.
- If logs show proxy-related side effects, `PLANUI_USE_SYSTEM_PROXY=1` keeps the inherited proxy variables.