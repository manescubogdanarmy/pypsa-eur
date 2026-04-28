# Vizualizer - Web Dashboard

The `vizualizer/` folder contains the current Next.js dashboard for scenario creation, run orchestration, and result exploration.

> [!NOTE]
> The spelling is intentionally `vizualizer` with a z, matching the folder name.

## Stack and Technology

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js App Router | 16.2.4 |
| UI Library | React | 19.2.4 |
| Language | TypeScript | 5 |
| Styling | Tailwind CSS | 4 |
| CSV Parsing | papaparse | 5 |
| YAML Parsing | yaml | 2 |
| Runtime | Node.js server-side routes | (no Edge Runtime) |

**Browser support:**
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Bilingual support: English (default) and Romanian

## Main UI Structure

The landing page (`src/app/page.tsx`) is a three-tab control room:

### Tab 1: Scenario Builder
- Form with fields for slug, countries, dates, cluster count, solver options
- Stress test controls: load multiplier, hydro reduction, gas reduction, SCADA, import caps
- Working YAML editor with real-time syntax highlighting
- Form ↔ YAML synchronization buttons
- Enqueue button to submit completed scenario

### Tab 2: Run Queue
- Table of queued and historical jobs
- Live progress indicators and status badges
- Details panel showing job spec and log tail
- Cancel button for running/queued jobs
- Delete button for completed jobs
- Reset button for queue maintenance

### Tab 3: Results and Vizualizer
- List of valid result folders (with all 7 required CSVs)
- Summary metrics display (cost, ENS, LMP, etc.)
- Tabbed result details: Summary, CSV Data, Figures, Assumptions, Drawio/SVG
- CSV preview (first 20 rows) and download
- PNG figures rendered inline
- Markdown rendering for assumptions

The UI supports English and Romanian labels via language toggle, a theme toggle (light/dark mode), and responsive layout styling in `src/app/globals.css`.

## Scenario Builder Details

### Supported modes

**Paired mode** (default)
- Generates `<slug>_baseline.yaml` and `<slug>_scenario.yaml`
- Runs baseline first (no stress), then scenario (with stress)
- Report script compares baseline vs. scenario
- Best for stress test analysis

**Single mode**
- Generates only `<slug>_scenario.yaml`
- Uses existing baseline network for comparison
- Baseline solve skipped; saves time if reference already exists
- Use when comparing multiple scenarios against same baseline

### Form fields

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

### Stress test parameters

When stress testing enabled:

| Parameter | Range | Default | Effect |
|---|---|---|---|
| **Load Multiplier** | 0.5 - 2.0 | 1.0 | Demand scaling (1.2 = +20%) |
| **Hydro Reduction** | 0.0 - 1.0 | 0.0 | Hydro availability cut (0.3 = -70%) |
| **Gas Capacity Reduction** | 0.0 - 1.0 | 0.0 | Gas plant capacity cut (0.5 = -50%) |
| **SCADA Proxy Enabled** | yes/no | no | Enable ramp rate constraints |
| **Import Cap Enabled** | yes/no | no | Enable flow directional caps |

### Template system

**Template loading:**
- Year-specific templates auto-detected: `personal_docs/scenario_template_<year>.yaml`
- Falls back to `personal_docs/scenario_template.yaml` if year not found
- Templates contain all default values and stress test structure

## Run Queue

The queue is sequential. One job runs at a time.

**Job states:**
- `queued` - Waiting in queue
- `running` - Currently executing
- `succeeded` - Completed successfully (exit code 0)
- `failed` - Failed with non-zero exit code
- `cancelled` - User requested cancellation (SIGTERM sent)
- `interrupted` - App restarted while job was running

**Features:**
- Real-time progress tracking with log tailing from `logs/planui-web/<jobId>.log`
- Cancel button for queued/running jobs (stops before start or sends SIGTERM)
- Delete button to remove completed job records
- Reset button to clear runner state if queue appears stuck
- Job history persisted to `vizualizer/.data/planui-state.json` (survives app restarts)

## Results Viewer

The Results tab scans `results/` and only shows folders that contain all seven comparison CSVs:

1. `system_cost_comparison.csv` - Total cost, generation costs, etc.
2. `generation_mix_mwh.csv` - MWh by technology (wind, solar, hydro, gas, coal, nuclear)
3. `lmp_summary_ro.csv` - Locational marginal prices for Romania regions
4. `ens_summary.csv` - Energy not served (unmet demand) by country
5. `curtailment_mwh.csv` - Curtailed renewable generation
6. `daily_net_imports_mwh.csv` - Daily net imports by country
7. `interconnector_flow_congestion.csv` - Congestion hours per interconnector line

**For each valid result folder the UI shows:**
- Parsed summary metrics (cost delta, ENS, shedding, LMP stats)
- CSV previews (first 20 rows, with full download)
- PNG figures rendered inline
- Drawio diagram files for export
- SVG files for export
- `assumptions_limitations.md` when present (markdown rendering)

## API Routes (Complete Reference)

All endpoints live under `src/app/api/`. Complete documentation for each:

### Scenario Management

**`GET /api/scenario/template`**
- Load YAML template for selected cutout year
- Query params: `?year=2023`
- Response: `{ yaml: string }`
- Used by Builder tab to initialize form

**`POST /api/scenario/build`**
- Build YAML from form inputs
- Request body: `{ mode: "paired"|"single", slug: string, countries: string, ... }`
- Response: `{ yaml: string, errors?: string[] }`
- Validates inputs and merges with template defaults

### Job Management

**`GET /api/runs/jobs`**
- List all queued and historical jobs
- Response: `{ jobs: JobRecord[] }`
- Used by Run Queue tab

**`POST /api/runs/enqueue`**
- Generate configs and queue a job
- Request body: scenario inputs
- Response: `{ jobId: string, status: "queued" }`

**`POST /api/runs/cancel`**
- Cancel a queued or running job
- Request body: `{ jobId: string }`
- Response: `{ status: "cancelled" }`

**`POST /api/runs/delete`**
- Delete a job record (does NOT delete results/configs)
- Request body: `{ jobId: string }`
- Response: `{ status: "deleted" }`

**`POST /api/runs/reset`**
- Reset runner state and recheck queue
- Response: `{ status: "reset" }`

**`GET /api/runs/log`**
- Tail a job log by ID
- Query params: `?jobId=<id>&lines=50`
- Response: `{ log: string }`

**`GET /api/runs/baselines`**
- List available baseline network files
- Response: `{ baselines: string[] }`

### Results Management

**`GET /api/results`**
- Scan and list valid result folders
- Response: `{ results: { name: string, timestamp: number }[] }`
- Only returns folders with all 7 required CSVs

**`GET /api/results/summary`**
- Parse summary metrics from a result folder
- Query params: `?result=<name>`
- Returns: cost delta, ENS, max shedding, LMP stats, figure list

**`GET /api/results/csv`**
- Return CSV preview (first 20 rows)
- Query params: `?result=<name>&file=system_cost_comparison.csv`
- Response: `{ rows: Array<Record<string, string>> }`

**`GET /api/results/figure`**
- Serve a PNG figure
- Query params: `?result=<name>&file=fig_01.png`
- Response: Binary PNG data

**`GET /api/results/drawio`**
- Download a Drawio file
- Query params: `?result=<name>&file=diagram.drawio`
- Response: Drawio XML file

**`GET /api/results/svg`**
- Download an SVG file
- Query params: `?result=<name>&file=diagram.svg`
- Response: SVG XML

**`POST /api/results/diagrams`**
- Generate result diagrams (if not already present)
- Request body: `{ result: string }`
- Response: `{ status: "generating" }`

## Runtime Detection and Configuration

**File: `src/app/lib/runtime.ts`**

Resolves Python and Snakemake commands in this priority order:

1. **`PLANUI_CONDA_ENV`** env var (if set, use named environment)
   ```bash
   export PLANUI_CONDA_ENV=pypsa
   npm run dev
   ```

2. **`PLANUI_CONDA_PREFIX`** env var (if set, use prefix path)
   ```bash
   export PLANUI_CONDA_PREFIX=/usr/local/envs/pypsa
   npm run dev
   ```

3. **Active conda prefix** (`$CONDA_PREFIX` if not `base`)
   - Auto-detected if user has activated an environment

4. **`CONDA_DEFAULT_ENV`** env var (if set and not `base`)

5. **Named environment candidates** (in order):
   - `pypsa`
   - `pypsa-eur`

6. **System Python fallback** (`/usr/bin/python3` on Unix, `python.exe` on Windows)

**Command prefix construction:**
```javascript
// If PLANUI_CONDA_ENV="pypsa"
commandPrefix = "conda run -n pypsa"

// If PLANUI_CONDA_PREFIX="/path/to/env"
commandPrefix = "conda run --prefix /path/to/env"

// If auto-detected active conda env
commandPrefix = "conda run -n <active-env>"
```

### Environment variable management

**Proxy stripping (default behavior):**
- By default, `HTTP_PROXY`, `HTTPS_PROXY`, `ALL_PROXY`, etc. are removed from subprocess environment
- Reason: Conda and Snakemake can malfunction behind proxies

**To keep proxy variables:**
```bash
export PLANUI_USE_SYSTEM_PROXY=1
npm run dev
```

**Other env vars preserved:**
- Standard conda vars: `CONDA_CHANNELS`, `CONDA_SOLVER`, etc.
- Snakemake vars: `SNAKEMAKE_CORES`, etc.

## Job Lifecycle and State Management

**Job record structure:**
```typescript
interface JobRecord {
  id: string;                  // Unique job ID (job-TIMESTAMP)
  status: JobStatus;           // queued | running | succeeded | failed | cancelled | interrupted
  mode: "paired" | "single";   // Run mode
  slug: string;                // Scenario slug
  output: string;              // Result folder path
  configBaseline?: string;     // Baseline config path (paired mode)
  configScenario: string;      // Scenario config path
  createdAt: string;           // ISO 8601 timestamp
  startedAt?: string;          // When job started
  completedAt?: string;        // When job completed
  progress?: string;           // Current progress text
  exitCode?: number;           // Process exit code
}
```

**State persistence:**
- File: `vizualizer/.data/planui-state.json`
- Updated every 1-2 seconds during execution
- Immediately updated on state changes
- Survives app restarts; running jobs marked as `interrupted`

**Paired mode flow:**
1. Generate `<slug>_baseline.yaml` and `<slug>_scenario.yaml`
2. Unlock workflow
3. Solve baseline
4. Solve scenario
5. Generate comparison report (CSVs, figures)
6. Result validation (all 7 CSVs present)

**Single mode flow:**
1. Generate `<slug>_scenario.yaml`
2. Solve scenario
3. Generate report (using provided baseline network)
4. Result validation

## Known Environment Issues

### Python 3.13 + linopy → `pkg_resources` error

**Symptom:** `ModuleNotFoundError: No module named 'pkg_resources'` when running Snakemake

**Cause:** Old `google-cloud-storage` (v1.31.2) depends on deprecated `pkg_resources` API, removed in Python 3.13

**Fix:**
```bash
conda run -n pypsa pip install "google-cloud-storage>=2.10"
```

### Proxy-related Snakemake failures

**Symptom:** Snakemake fails with network-related errors, especially behind corporate proxy

**Fix:**
```bash
export PLANUI_USE_SYSTEM_PROXY=1
npm run dev
```

### SCIP solver not found

**Symptom:** `ERROR: You have not found the SCIP solver` during optimization

**Fix:**
```bash
conda install -c conda-forge scip
```