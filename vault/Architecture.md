# Architecture

This note summarizes the current repo layout and how the web dashboard fits into the workflow.

## High-level flow

**Complete scenario lifecycle:**

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

## Dashboard layers and responsibilities

Each layer has a distinct role in the architecture:

- **UI Layer** (`vizualizer/src/app/page.tsx`)
  - React client component with three tabs: Scenario Builder, Run Queue, Results Viewer
  - Form controls synchronized with YAML editor via `useStateWithSync()`
  - Bilingual support (EN/RO) with language toggle
  - Theme toggle (light/dark mode) persisted to localStorage

- **API Layer** (`vizualizer/src/app/api/`)
  - RESTful endpoints for scenario, runs, and results operations
  - Each route handles specific responsibilities (see API section below)
  - Error handling with appropriate HTTP status codes and messages
  - File I/O and subprocess orchestration isolated here

- **Scenario Builder** (`vizualizer/src/app/lib/scenario.ts`)
  - Loads templates from `personal_docs/scenario_template_*.yaml`
  - Validates form inputs before generating YAML
  - Merges user settings with template defaults
  - Generates paired baseline + scenario configs when requested
  - Returns normalized YAML ready for file write

- **Job Runner** (`vizualizer/src/app/lib/job-runner.ts`)
  - Maintains a sequential execution queue (one job at a time)
  - Spawns child processes with conda/Python environment detection
  - Tails stdout/stderr in real time, writes to `logs/planui-web/<jobId>.log`
  - Tracks job state (queued → running → succeeded/failed)
  - Handles cancellation by sending SIGTERM to subprocess

- **Results Handler** (`vizualizer/src/app/lib/results.ts`)
  - Scans `results/` directory recursively for valid output folders
  - Validates presence of all 7 required CSVs before exposing a result
  - Parses summary metrics (baseline cost, delta %, ENS, etc.)
  - Returns file lists for figures, assumptions, drawio, and SVG assets

- **Runtime Resolver** (`vizualizer/src/app/lib/runtime.ts`)
  - Detects available conda environment or falls back to system Python
  - Priority order: `PLANUI_CONDA_ENV` → `PLANUI_CONDA_PREFIX` → active conda prefix → named env candidates
  - Constructs conda-aware command prefixes for spawning subprocesses
  - Strips proxy variables to avoid external network interference unless `PLANUI_USE_SYSTEM_PROXY=1`

## Data flow through the dashboard (detailed)

### Scenario Creation Workflow

1. **Template Loading** (`GET /api/scenario/template`)
   - User selects a cutout year (e.g., 2020, 2023)
   - Dashboard detects year-specific template
   - `resolve_template_path()` checks `personal_docs/scenario_template_<year>.yaml`
   - Falls back to `scenario_template.yaml` if year-specific not found
   - YAML is parsed with `yaml.parse()` and returned as JSON

2. **Form Editing** (client-side React state)
   - User fills form fields: slug, countries, snapshot window, cluster count, solver options
   - User toggles stress-test controls: load multiplier, hydro reduction, gas reduction, SCADA, import caps
   - `useStateWithSync()` hook synchronizes form state ↔ YAML editor
   - Real-time validation: snapshot dates must match cutout year, start ≤ end, etc.

3. **YAML Normalization** (`POST /api/scenario/build`)
   - Form inputs are merged with template defaults
   - Missing fields inherit from template
   - Stress parameters are included only if `stress_test.enable=true`
   - Generated YAML is returned and displayed in the editor
   - User can further edit YAML before enqueueing

4. **Enqueuing** (`POST /api/runs/enqueue`)
   - Scenario inputs are validated one final time
   - In **paired mode**: generates two YAML files
     - `<slug>_baseline.yaml` (stress_test.enable=false)
     - `<slug>_scenario.yaml` (stress_test.enable=true with all shocks)
   - In **single mode**: generates one YAML file, uses reference baseline network path
   - YAML files written to `config/adversarial/generated/`
   - Job record created with unique job ID and persisted to `vizualizer/.data/planui-state.json`
   - Job moved to `queued` state and added to runner queue

### Job Execution Workflow

1. **Runner Dequeues** (`job-runner.ts` main loop)
   - Checks if any job is currently running
   - If not, moves first queued job to `running` state
   - Saves updated job list to `planui-state.json`

2. **Command Construction** (`scenario.ts` and `job-runner.ts`)
   - **Paired mode** constructs three sequential commands:
     ```bash
     snakemake unlock --configfile config/adversarial/generated/<slug>_baseline.yaml
     snakemake solve --configfile config/adversarial/generated/<slug>_baseline.yaml
     snakemake solve --configfile config/adversarial/generated/<slug>_scenario.yaml
     python scripts/report_romania_winter_stress.py
     ```
   - **Single mode** skips baseline solve and uses provided baseline network

3. **Environment Detection** (`runtime.ts`)
   - Checks `PLANUI_CONDA_ENV` env var; if set, uses that named environment
   - Otherwise checks `PLANUI_CONDA_PREFIX`; if set, uses that prefix path
   - Falls back to detecting active conda prefix from `CONDA_PREFIX`
   - If no conda found, tries system Python
   - Constructs prefix like: `conda run -n pypsa` or `conda run --prefix /path/to/env`

4. **Process Spawning**
   - Child process spawned with stdout/stderr captured
   - Log file opened at `logs/planui-web/<jobId>.log`
   - Stdout/stderr tailed in real time and written to log file
   - Progress text extracted from log output (e.g., "Step 1/5 completed")

5. **Job Completion**
   - Process exits with code 0 → job state set to `succeeded`
   - Process exits with non-zero code → job state set to `failed`
   - User cancels → SIGTERM sent, state set to `cancelled` after termination
   - App restarted while job running → state set to `interrupted`
   - Job record updated in `planui-state.json` and persisted

### Result Discovery Workflow

1. **Folder Scan** (`GET /api/results`)
   - Recursive walk of `results/` directory
   - For each subfolder, check presence of all 7 required CSVs
   - Valid folders collected and sorted by modification time (newest first)

2. **Summary Extraction** (`GET /api/results/summary`)
   - Parse `system_cost_comparison.csv` to extract cost delta and percentage
   - Parse `ens_summary.csv` for energy not served metrics
   - Parse `curtailment_mwh.csv` for shedding statistics
   - Parse `lmp_summary_ro.csv` for LMP min/mean/max
   - Parse `daily_net_imports_mwh.csv` for import delta
   - List PNG figures (fig_01.png through fig_05.png)
   - Return all metrics as JSON for UI display

3. **CSV Preview** (`GET /api/results/csv?file=<name>`)
   - Read CSV with `papaparse`
   - Return first 20 rows as JSON for tabular display in browser
   - Full CSV available for download

4. **Asset Serving**
   - PNG figures served directly as image blobs
   - Drawio and SVG files returned with appropriate MIME types
   - `assumptions_limitations.md` returned as markdown text

## Result contract (detailed)

The dashboard only considers a folder valid result if it contains **all 7 CSVs**:

1. **`system_cost_comparison.csv`**
   - Required columns: `metric`, `baseline_value`, `scenario_value`, `delta_meur`, `delta_percent`
   - One row per cost component (total, generation, transmission, etc.)

2. **`generation_mix_mwh.csv`**
   - Required columns: `technology`, `baseline_mwh`, `scenario_mwh`, `delta_mwh`, `delta_percent`
   - One row per technology type (wind, solar, hydro, gas, coal, nuclear, etc.)

3. **`lmp_summary_ro.csv`**
   - Required columns: `metric`, `baseline_eur_mwh`, `scenario_eur_mwh`, `delta_eur_mwh`
   - Rows: `min`, `mean`, `max` for different regions

4. **`ens_summary.csv`**
   - Required columns: `metric`, `baseline_gwh`, `scenario_gwh`, `delta_gwh`, `delta_percent`
   - Energy not served (unserved demand) totals by country

5. **`curtailment_mwh.csv`**
   - Required columns: `technology`, `baseline_mwh`, `scenario_mwh`, `delta_mwh`, `delta_percent`
   - Curtailed generation by technology

6. **`daily_net_imports_mwh.csv`**
   - Required columns: `date`, `baseline_mwh`, `scenario_mwh`, `delta_mwh`
   - Daily aggregated net imports

7. **`interconnector_flow_congestion.csv`**
   - Required columns: `line`, `congestion_hours_baseline`, `congestion_hours_scenario`, `delta_hours`
   - Congestion indicators for each interconnector

**Optional files (shown when present):**
- `assumptions_limitations.md` - Markdown note on shock formulation and caveats
- PNG figures (`fig_01.png` through `fig_05.png`) - Rendered charts and diagrams
- `.drawio` files - Editable diagram assets
- `.svg` files - Vector graphics exports

If any of the 7 CSVs is missing, the result folder is treated as invalid and hidden from the Results tab.

## Runtime behavior (detailed)

### Conda/Python Resolution

The dashboard uses this priority order to find a Python environment:

1. **`PLANUI_CONDA_ENV`** - If set, use this named conda environment
   ```bash
   export PLANUI_CONDA_ENV=pypsa
   npm run dev
   ```

2. **`PLANUI_CONDA_PREFIX`** - If set, use this conda prefix path
   ```bash
   export PLANUI_CONDA_PREFIX=/usr/local/envs/pypsa
   npm run dev
   ```

3. **Active conda prefix** - Use the currently activated environment (`$CONDA_PREFIX`)
   - Only if not `base` (base environment is skipped)

4. **`CONDA_DEFAULT_ENV`** - If set and not `base`, use this named environment

5. **Named environment candidates** - Try in order: `pypsa`, then `pypsa-eur`

6. **System Python** - Fallback to `/usr/bin/python3` or `python.exe` on Windows

### Environment Variable Management

**Proxy variable stripping:**
- By default, proxy variables (`HTTP_PROXY`, `HTTPS_PROXY`, etc.) are stripped before spawning subprocesses
- Reason: Conda and Snakemake can sometimes experience issues with corporate proxies
- To keep proxy variables: `export PLANUI_USE_SYSTEM_PROXY=1`

**Conda environment variables:**
- Standard conda env vars are preserved (e.g., `CONDA_CHANNELS`, `CONDA_SOLVER`)
- Snakemake-specific vars are passed through (e.g., `SNAKEMAKE_CORES`)

### Logging and Debugging

- All subprocess output captured to `logs/planui-web/<jobId>.log`
- Log file created before subprocess starts; updated in real time
- Logs available for download via the Run Queue details view
- If subprocess fails, full log available for troubleshooting
- Log retention: indefinite (manual cleanup recommended after archiving results)

## Deployment and state management (detailed)

**Log storage:**
- Location: `logs/planui-web/`
- Naming: `<jobId>.log` (e.g., `job-20260428-132455.log`)
- Format: Plain text, one event per line, ISO 8601 timestamps
- Retention: Indefinite; periodically archive to `logs/archive/` for disk space management

**Queue state persistence:**
- Location: `vizualizer/.data/planui-state.json`
- Format: JSON with job array and runner state
- Schema:
  ```json
  {
    "version": 1,
    "jobs": [
      {
        "id": "job-20260428-132455",
        "status": "running",
        "createdAt": "2026-04-28T13:24:55Z",
        "startedAt": "2026-04-28T13:25:00Z",
        "completedAt": null,
        "mode": "paired",
        "slug": "winter_stress_test",
        "output": "results/winter_stress_test",
        "progress": "Step 2/3: Solving scenario network"
      }
    ],
    "runner": {
      "activeJobId": "job-20260428-132455",
      "processId": 12345
    }
  }
  ```
- Persistence: Updated every 1-2 seconds during job execution, immediately on state changes
- Restart behavior: App restart reads persisted state; any running job marked as `interrupted`

**Application runtime:**
- Framework: Next.js 16.2.4 (App Router)
- Runtime: Node.js server route handlers (not Edge Runtime)
- Port: Default 3000 (can override via `PORT` env var)
- Build: `npm run build` creates optimized production bundle in `.next/`
- Start: `npm start` runs production server or `npm run dev` runs dev server

## Relationship to the rest of the repo (detailed)

**Configuration layer:**
- `config/` - Holds scenario templates and generated configs
  - `config/config.default.yaml` - Default PyPSA-Eur configuration
  - `config/romania*.yaml` - Year/season-specific templates
  - `config/adversarial/generated/` - User-generated scenario configs (written by dashboard)
  - Auto-generated configs follow naming pattern: `<slug>_baseline.yaml`, `<slug>_scenario.yaml`

**Execution layer:**
- `scripts/` - Core execution scripts
  - `scripts/romania_winter_stress.py` - Shock application and constraint generation
  - `scripts/report_romania_winter_stress.py` - CSV generation and comparison report
  - `scripts/run_network_solver.py` - Network optimization entry point
- `rules/` - Snakemake workflow definitions
  - `rules/solve.smk` - Main solve rule
  - `rules/prepare.smk` - Data preparation rules
  - Rules called by dashboard via `snakemake` CLI with `--configfile`

**Result layer:**
- `results/` - Output storage
  - Created folders: `results/<output_name>/` (e.g., `results/winter_stress_test/`)
  - Contains CSVs, figures (PNG/PDF), and other result assets
  - Dashboard scans this directory via `GET /api/results`
  - Results visible only if all 7 required CSVs present

**Analysis and reporting:**
- `personal_analysis/` - Post-processing scripts
  - `run_summary.py` - Generate summary statistics
  - `interpret_results.py` - Analyze flows and LMPs
  - Scripts run independently or via dashboard Results page
- `personal_diagnostics/` - Validation tools
  - `check_romania.py` - Validate configs before runs
  - `check_csv.py` - Validate result CSVs after runs
  - `check_url.py` - Verify external data source connectivity

**Data layer:**
- `data/` - Raw and processed datasets
  - `data/cutout/` - Weather data (ERA5 cutouts)
  - `data/` - Power plant data, cost data, geographic boundaries
  - `personal_data_download/` - Scripts to fetch and cache data

**Documentation:**
- `doc/` - Upstream Sphinx documentation (PyPSA-Eur project docs)
- `vault/` - Obsidian notes (this repository's operational docs)
- `personal_docs/` - Templates and implementation guides
  - `scenario_template_*.yaml` - Year-specific scenario templates (read by dashboard)
  - `TEMPLATE_ARCHITECTURE.md` - Detailed template design documentation
  - `romania_config_explanation*.md` - Configuration field reference (EN/RO)

**Legacy UI (deprecated but maintained):**
- `personal_dashboard/` - Tkinter-based scenario manager
  - `visualize_scenarios_ui_v2.py` - Main UI entry point
  - `scenario_manager/` - Scenario building and job queue logic
  - Covers same workflows as Next.js dashboard but with older technology stack