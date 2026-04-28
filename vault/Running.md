# Running Documentation

This note describes how runs move through the current Next.js dashboard from start to finish.

## Start the dashboard

```bash
cd vizualizer
npm run dev
```

The app opens on http://localhost:3000. You should see three tabs: Scenario Builder, Run Queue, Results.

**Environment setup (if needed):**
If the dashboard doesn't detect the correct conda environment:
```bash
PLANUI_CONDA_ENV=pypsa npm run dev
```

---

## How runs are executed (detailed)

### Step 1: User Enqueues a Scenario

1. User fills form or edits YAML in Scenario Builder
2. Clicks "Enqueue Run"
3. `POST /api/runs/enqueue` is called with form data

### Step 2: Job Preparation

1. Scenario inputs are validated (dates, paths, formats)
2. In **paired mode**: Two YAML files are generated
   - `<slug>_baseline.yaml` (no stress)
   - `<slug>_scenario.yaml` (with stress shocks)
3. In **single mode**: One YAML file generated; uses existing baseline network
4. YAML files written to `config/adversarial/generated/`
5. Job record created with unique ID: `job-<timestamp>`
6. Job persisted to `vizualizer/.data/planui-state.json`
7. **Status**: `queued`

### Step 3: Runner Dequeues

The job runner runs in the background and checks the queue:
1. If another job is running, wait
2. Otherwise, move first queued job to `running` state
3. Save updated state to `planui-state.json`

### Step 4: Environment Detection

Before launching commands, detect Python/Snakemake location:
1. Check `PLANUI_CONDA_ENV` env var (if set, use named env)
2. Check `PLANUI_CONDA_PREFIX` env var (if set, use prefix path)
3. Try active conda prefix (`$CONDA_PREFIX` if not `base`)
4. Try `CONDA_DEFAULT_ENV` (if not `base`)
5. Try named candidates: `pypsa`, then `pypsa-eur`
6. Fallback to system Python

Result: Command prefix like `conda run -n pypsa` or `conda run --prefix /path/to/env`

### Step 5: Command Construction

Snakemake and Python commands are assembled based on mode:

**Paired mode (baseline + scenario):**
```bash
conda run -n pypsa snakemake \
  --unlock \
  --configfile config/adversarial/generated/<slug>_baseline.yaml

conda run -n pypsa snakemake \
  --solve \
  --configfile config/adversarial/generated/<slug>_baseline.yaml

conda run -n pypsa snakemake \
  --solve \
  --configfile config/adversarial/generated/<slug>_scenario.yaml

conda run -n pypsa python scripts/report_romania_winter_stress.py \
  --baseline results/.../<slug>_baseline/ \
  --scenario results/.../<slug>_scenario/ \
  --output results/.../<slug>/
```

**Single mode (scenario only, with reference baseline):**
```bash
conda run -n pypsa snakemake \
  --solve \
  --configfile config/adversarial/generated/<slug>_scenario.yaml
  
conda run -n pypsa python scripts/report_romania_winter_stress.py \
  --baseline <reference-baseline-path> \
  --scenario results/.../<slug>_scenario/ \
  --output results/.../<slug>/
```

### Step 6: Process Spawning and Monitoring

1. Log file created: `logs/planui-web/<jobId>.log`
2. Child process spawned with stdout/stderr captured
3. Real-time log tailing begins
4. Progress text extracted and updated in UI (e.g., "Step 2/3: Solving...")
5. **Status**: `running`

### Step 7: Process Completion

**Success path (exit code 0):**
- Job status → `succeeded`
- UI shows "✓ Succeeded"
- Log file finalized

**Failure path (exit code non-zero):**
- Job status → `failed`
- UI shows error indicator
- Log file contains error output for debugging

**Cancellation (user clicks Cancel):**
- SIGTERM signal sent to process
- Process terminates (normally exits within seconds)
- Job status → `cancelled`
- Log file shows termination message

**Restart/interruption (app restarts while running):**
- App reads persisted job list from `planui-state.json`
- Any job with status `running` is reset to `interrupted`
- UI shows "⚠ Interrupted"

### Step 8: Result Discovery

Once job completes successfully:
1. Dashboard scans `results/` directory
2. Looks for folders with all 7 required CSVs
3. Valid results appear in Results tab
4. Summary metrics parsed and displayed

---

## Job states (complete reference)

| State | Meaning | Can transition to | Notes |
|---|---|---|---|
| `queued` | Waiting for runner | `running`, `cancelled` | User can cancel before start |
| `running` | Currently executing | `succeeded`, `failed`, `cancelled`, `interrupted` | Only one job running at a time |
| `succeeded` | Completed successfully (exit code 0) | (terminal) | Results should be discoverable |
| `failed` | Failed with non-zero exit code | (terminal) | Check log for error details |
| `cancelled` | User requested cancellation | (terminal) | SIGTERM was sent to process |
| `interrupted` | App restarted while running | (terminal) | Job was not cleaned up; consider manual re-run |

**State transitions:**
```
queued → (immediately) → running
running → (on completion) → succeeded / failed / cancelled
running → (app restart) → interrupted
```

---

## Result discovery process

The Results tab actively scans `results/` for new output:

1. **Scan timing**: Triggered when user opens Results tab or every 5 seconds
2. **Validation**: For each subfolder, check for all 7 required CSVs:
   - `system_cost_comparison.csv`
   - `generation_mix_mwh.csv`
   - `lmp_summary_ro.csv`
   - `ens_summary.csv`
   - `curtailment_mwh.csv`
   - `daily_net_imports_mwh.csv`
   - `interconnector_flow_congestion.csv`

3. **Result ranking**: Valid results sorted by modification time (newest first)

4. **Summary extraction**: For each valid result:
   - Parse CSVs to extract metrics (cost delta, ENS, LMP stats, etc.)
   - Detect figures (PNG, SVG, Drawio files)
   - Check for `assumptions_limitations.md`
   - Return complete result metadata

---

## When a run is considered complete

A run is complete when:

1. **Paired mode**: 
   - Baseline solve finishes ✓
   - Scenario solve finishes ✓
   - Report script generates CSVs and figures ✓

2. **Single mode**:
   - Scenario solve finishes ✓
   - Report script generates CSVs and figures ✓

3. **Result validation**:
   - All 7 required CSVs present ✓
   - CSVs contain valid numeric data ✓
   - Result folder appears in Results tab ✓

---

## Practical notes and common scenarios

### Scenario: Network solver is slow

**Typical solve times:**
- Baseline solve: 5-15 min (10 clusters, hourly resolution)
- Stress scenario solve: Usually ±10% slower due to constraint additions
- Report generation: 1-2 min

**If solve is taking very long:**
- Check Snakemake logs for solver progress: `tail -f logs/planui-web/<jobId>.log`
- Network size (clusters, temporal resolution) significantly impacts solve time
- SCIP solver can be slower on first run; subsequent runs may be faster

### Scenario: Run failed with a solver error

**Common causes:**
- Infeasible constraint combination (too much stress)
- Missing solver (SCIP not installed)
- Corrupt network file
- Insufficient system memory

**Debug steps:**
1. Open Run Queue tab → select failed job → view log tail
2. Look for "Infeasible" or "SCIP not found" messages
3. Check `personal_diagnostics/check_romania.py` for config validation
4. Try a simpler scenario (less stress, fewer clusters) to isolate issue

### Scenario: App restarted while job was running

**What happens:**
1. App loads persisted job list from `vizualizer/.data/planui-state.json`
2. Any job with status `running` is marked as `interrupted`
3. UI shows "⚠ Interrupted" indicator
4. Manual action needed: cancel the interrupted job or retry

**To clean up:**
1. Click "Delete" in Run Queue to remove the interrupted job record
2. If Snakemake process is still running on system, kill manually:
   ```bash
   pkill -f snakemake
   ```
3. Enqueue the run again to retry

### Scenario: Using custom conda environment

**If you have a different Python environment:**

```bash
export PLANUI_CONDA_ENV=my-custom-env
cd vizualizer && npm run dev
```

Or directly specify prefix:
```bash
export PLANUI_CONDA_PREFIX=/path/to/my/env
cd vizualizer && npm run dev
```

The dashboard will use that environment for all Snakemake and Python calls.

### Scenario: Proxy environment interference

**If you're behind a corporate proxy and experiencing network errors:**

By default, the dashboard strips proxy variables to avoid Conda/Snakemake issues. If you need proxy variables passed through:

```bash
export PLANUI_USE_SYSTEM_PROXY=1
npm run dev
```

---

## Monitoring and debugging

### Viewing job logs

**From the UI:**
1. Open Run Queue tab
2. Click the job you want to inspect
3. Log tail appears in details panel on the right
4. Scroll to see full output

**From the filesystem:**
```bash
tail -f logs/planui-web/<jobId>.log    # Watch in real time
cat logs/planui-web/<jobId>.log        # View complete log
grep -i error logs/planui-web/*.log    # Find errors across all jobs
```

### Common log messages

| Message | Meaning |
|---|---|
| `Unlocking workflow` | Removing Snakemake locks (normal) |
| `Building DAG of jobs` | Planning workflow (normal, can take ~30 sec) |
| `Step X/Y` | Progress indicator |
| `Solving network` | Running optimization (longest step) |
| `[INFEASIBLE]` | Solver found no solution (too much stress?) |
| `SCIP not found` | Solver missing (install: `conda install scip`) |
| `Generating report` | Creating CSVs and figures (1-2 min) |

### Job state persistence

Queue state is saved to `vizualizer/.data/planui-state.json`:

```bash
cat vizualizer/.data/planui-state.json | jq .
```

This JSON file is updated:
- Every 1-2 seconds during job execution
- Immediately when state changes (queued → running, etc.)
- On app startup to detect unfinished jobs

Queue survives app restarts; running jobs marked as `interrupted`.