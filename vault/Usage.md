# Usage Documentation

This note explains the day-to-day workflow for the browser dashboard. From building scenarios to viewing results.

---

## Scenario Builder Tab

Use the Builder tab to create the YAML configuration for a scenario run.

### Form layout and fields

**Top section — Run mode:**
- **Paired mode** ✓ (default) - Generates both baseline and scenario YAMLs; runs both sequentially
- **Single mode** - Generates only scenario YAML; uses an existing baseline network for comparison

### Paired mode fields

| Field | Purpose | Example |
|---|---|---|
| **Scenario Slug** | Short name for this scenario (alphanumeric + underscore) | `winter_stress_v2` |
| **Countries** | Comma-separated country codes to include | `RO,BG,HU,RS` |
| **Cutout Year** | Year for weather data (must match available cutout) | `2023` |
| **Snapshot Start** | Start date in YYYY-MM-DD format | `2023-01-15` |
| **Snapshot End** | End date (must be ≥ start date) | `2023-01-22` |
| **Cluster Count** | Number of nodes in network clustering | `10` |
| **Solver Name** | Linear/integer solver to use | `scip` |
| **Solver Options** | Additional solver flags (pipe-delimited) | `solver_logfile=false` |

**Stress test controls** (only if stress testing enabled):
- **Load Multiplier** - Multiplier for electricity demand (1.0 = no change, 1.2 = +20%)
- **Hydro Reduction** - Fraction of hydro capacity unavailable (0.0 = all available, 0.5 = 50% unavailable)
- **Gas Capacity Reduction** - Gas plant capacity reduction factor
- **SCADA Proxy Enabled** - Toggle ramp rate constraints on controllable generators
- **Import Cap Enabled** - Toggle directional caps on interconnector flows

### Single mode fields

Same as Paired, except:
- **Reference Baseline Network** - Path to existing baseline network (must be in `results/` or `networks/`)
- Baseline solve step is skipped; only scenario solve runs

---

## Building a Scenario (step-by-step)

### Step 1: Select Run Mode

Click **Paired Mode** (default) for baseline + stress comparison, or **Single Mode** if you already have a baseline network.

### Step 2: Fill Form Fields

**Required fields:**
1. **Scenario Slug** - Choose a short name without spaces or special chars
   - Example: `winter_stress_test_v1`
   - Used as prefix for output folders

2. **Countries** - List countries to include (comma-separated)
   - Example: `RO,BG,HU,RS` (Romania + Balkans)
   - Shocks typically applied only to RO

3. **Cutout Year** - Select year matching available weather data
   - Options: 2020, 2023, or other years with downloaded cutouts
   - Year determines which template is auto-loaded

4. **Snapshot Window** - Date range for simulation
   - Start date (YYYY-MM-DD) and end date (same format)
   - Must match the selected cutout year
   - Typical: winter months (Jan, Dec) or summer (Jul, Aug)

5. **Cluster Count** - Number of network nodes (5-50 typical)
   - Lower = faster solve but less spatial detail
   - Higher = more detail but longer solve time
   - Start with 10 for testing, 20 for production

### Step 3: Configure Stress Test (if applicable)

If stress testing:
1. Check **"Enable Stress Test"** checkbox
2. Set shock parameters:
   - **Load Multiplier** - 1.2 = 20% demand increase
   - **Hydro Reduction** - 0.3 = 70% hydro availability (30% reduction)
   - **Gas Capacity Reduction** - 0.5 = 50% less gas capacity
   - **SCADA Proxy** - Toggle for ramp rate constraints
   - **Import Cap** - Toggle for flow directional caps

3. For single shock testing, leave others at default (1.0, 0.0, etc.)

### Step 4: Sync and Review YAML

Click **"Sync to YAML"** to generate YAML from form state:
- YAML editor on the right updates
- Review the generated configuration

Or edit YAML directly in the editor; click **"Sync to Form"** to sync back to form (if possible).

### Step 5: Enqueue the Run

Click **"Enqueue Run"** to:
1. Validate all inputs
2. Generate config YAML file(s) to `config/adversarial/generated/`
3. Create job record and add to queue
4. Auto-switch to Run Queue tab to show job status

---

## Form Validation Rules

**Snapshot dates:**
- Start date must be ≤ end date
- Both dates must be valid (YYYY-MM-DD format)
- Dates must fall within the selected cutout year
- Example: If cutout is 2023, snapshot must be 2023-xx-xx

**Cluster count:**
- Must be a positive integer (1-50 typical)
- Higher clusters = slower solve

**Slug:**
- Must be alphanumeric + underscores (no spaces or special chars)
- Used as filename prefix; must be valid for filesystem

**Reference baseline (single mode only):**
- Must be a valid path to existing baseline network
- Typically `results/<baseline_name>/` or specific network file

**If validation fails:**
- Error message appears in red below the field
- Fix the field and try enqueueing again

---

## Run Queue Tab

Use the Run Queue tab to monitor and control job execution.

### Queue interface

**Left side — Job list:**
- All jobs in order (queued first, then running, then completed)
- Shows: Job ID, Status, Mode, Output folder, Progress text

**Right side — Details panel:**
- Selected job's full configuration
- Live log tail (stdout + stderr)
- Cancel button (for queued or running jobs)
- Delete button (for completed or cancelled jobs)

### Job control actions

**Cancel**
- Queued jobs: Stopped immediately before they start
- Running jobs: SIGTERM signal sent; process terminates within seconds
- Completed jobs: Cannot cancel (only delete)

**Delete**
- Removes job record from queue
- Does NOT delete generated config files or results
- Useful for cleanup after job completes

**Reset**
- Clears runner state and forces re-check of queue
- Use if queue appears stuck
- Any `running` job is marked as `interrupted`

### Monitoring a running job

1. Click the job in the queue to see details
2. Log tail shows output in real time
3. Progress text updates as steps complete
4. Watch for errors or solver warnings
5. Job transitions to `succeeded` or `failed` when complete

**Typical progress sequence:**
```
Building DAG of jobs...     (Snakemake planning)
Unlocking workflow...       (Removing old locks)
Solving network...          (Optimization - longest step)
Solving network...          (might show % complete)
Generating report...        (Creating CSVs and figures)
Completed successfully
```

---

## Results Browser Tab

Use the Results tab to inspect comparison outputs and explore results.

### Results discovery

The Results tab scans `results/` directory and shows only folders with all 7 required CSVs:

| CSV | Content |
|---|---|
| `system_cost_comparison.csv` | Total system cost, generation costs, etc. |
| `generation_mix_mwh.csv` | MWh by technology (wind, solar, gas, hydro, etc.) |
| `lmp_summary_ro.csv` | Locational marginal prices for Romania regions |
| `ens_summary.csv` | Energy not served (unmet demand) by country |
| `curtailment_mwh.csv` | Curtailed renewable generation |
| `daily_net_imports_mwh.csv` | Daily net imports by country |
| `interconnector_flow_congestion.csv` | Congestion hours per interconnector line |

If any CSV is missing, result folder is hidden from Results tab.

### Summary metrics view

At the top of each result, key metrics are displayed:

| Metric | Meaning | Example |
|---|---|---|
| **Baseline Cost** | System cost in baseline scenario | €2,450 M |
| **Scenario Cost** | System cost with stress applied | €3,120 M |
| **Cost Delta** | Difference and percentage change | +€670 M (+27.3%) |
| **ENS (Baseline)** | Energy not served in baseline | 0.5 GWh |
| **ENS (Scenario)** | Energy not served with stress | 15.2 GWh |
| **Shedding** | Max load shedding in scenario | 450 MW |
| **LMP (Baseline)** | Min/mean/max marginal prices baseline | €45 / €82 / €150 |
| **LMP (Scenario)** | Min/mean/max marginal prices scenario | €52 / €95 / €280 |
| **Imports Delta** | Change in net imports | +2,150 MWh/day |

### Tabbed result view

**Summary tab** (default)
- Metrics overview and comparison chart (baseline vs. scenario)

**CSV Data tabs**
- Tab for each CSV file (system_cost, generation_mix, lmp_summary, etc.)
- Shows first 20 rows as preview
- Download button for full CSV

**Figures tab**
- All PNG/PDF figures (fig_01.png through fig_05.png)
- Rendered directly in UI for quick review

**Assumptions tab**
- Contents of `assumptions_limitations.md` (if present)
- Documents shock formulation and interpretation caveats

**Drawio & SVG tab**
- Downloadable diagram assets for use in reports or presentations

### Exporting results

**Download CSV:**
- Click CSV tab → "Download" button → saves full file to Downloads folder

**Download figures:**
- Click Figures tab → right-click image → "Save image as"

**Share results:**
- Copy result folder path: `results/<result_name>/`
- Share folder or individual CSVs with colleagues

### Result interpretation tips

- Compare the baseline and scenario values together rather than reading a single number in isolation.
- Check the CSV tabs first if a summary metric looks unexpected; the preview often shows whether the issue is a data gap or a real model change.
- Use the Assumptions tab when presenting results externally so the stress formulation is clear.
- Treat missing figures or missing CSVs as a workflow issue, not a display issue, until the result folder passes the documented contract.

---

## Typical day-to-day workflow

### Scenario 1: Run a quick test
1. Builder tab → accept defaults or make small changes
2. Click "Enqueue Run"
3. Run Queue tab → watch for completion (~5-30 min depending on settings)
4. Results tab → review metrics and figures

### Scenario 2: Compare two stress levels
1. Builder tab → set Load Multiplier = 1.2, Slug = "stress_20pct"
2. Enqueue Run
3. When done, Builder tab → set Load Multiplier = 1.5, Slug = "stress_50pct"
4. Enqueue Run
5. Results tab → compare both results side-by-side

### Scenario 3: Run a seasonal suite
1. Prepare 4 configs (winter, spring, summer, autumn)
2. Enqueue all 4 scenarios (they'll run sequentially)
3. Monitor in Run Queue tab
4. Results tab → load each result and export metrics to consolidated spreadsheet

---

## Keyboard shortcuts and tips

| Action | Shortcut / Tip |
|---|---|
| Sync form ↔ YAML | Click "Sync to YAML" or "Sync to Form" buttons |
| Cancel running job | Select job in queue → click "Cancel" |
| Reload results | Close Results tab and reopen (auto-scans) |
| Find error in log | Open Run Queue → select failed job → search log tail |
| Edit generated config | Edit YAML in Builder, save to `config/adversarial/generated/` manually if needed |

---

## Common workflows and patterns

### Building a sensitivity study
1. Create baseline scenario (no stress)
2. Create variants with incrementally higher load multiplier (1.0, 1.1, 1.2, 1.3)
3. Enqueue all; monitor in Run Queue
4. Results tab → compare cost delta across all variants
5. Export CSVs for plotting

### Debugging a failed scenario
1. Check result CSVs are present
2. If not, open Run Queue → select failed job → review log tail
3. Common issues: infeasibility (stress too high), solver missing, cutout not found
4. Fix issue (e.g., reduce load multiplier, install solver, download cutout)
5. Enqueue again

### Creating a report
1. Run scenario to completion
2. Results tab → open result folder
3. Export all CSVs and figures
4. Use templates in `personal_docs/` to assemble report
5. Include `assumptions_limitations.md` as appendix

### Adding a new scenario variant
1. Duplicate an existing scenario configuration that is already known to work
2. Change only one or two parameters first so the effect is easy to interpret
3. Re-run the validation checks before increasing complexity
4. Confirm the result folder still contains all required CSVs and figures

This workflow keeps comparisons meaningful and makes it easier to spot regressions in either the model or the dashboard.

---

## Useful paths and files

**Dashboard state:**
- `vizualizer/.data/planui-state.json` - Job queue persistence (survives restart)
- `logs/planui-web/<jobId>.log` - Complete job log

**Generated configs:**
- `config/adversarial/generated/<slug>_baseline.yaml` - Baseline config
- `config/adversarial/generated/<slug>_scenario.yaml` - Scenario config

**Templates:**
- `personal_docs/scenario_template_2023.yaml` - Example 2023 template
- `personal_docs/scenario_template.yaml` - Default fallback template

**Results:**
- `results/<result_name>/` - Result folder (auto-created on completion)
- `results/<result_name>/*.csv` - Data tables