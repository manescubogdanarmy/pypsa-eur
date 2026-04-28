# Installation Documentation

This note records the current project setup for the browser dashboard and the workflow it drives.

## Required tools

| Tool | Version | Why | Install |
|---|---|---|---|
| Miniconda or Anaconda | Latest | Python environment manager for the workflow | Download from conda-forge |
| Node.js | 20 LTS or newer | Runs the Next.js vizualizer | Download from nodejs.org or use `winget install OpenJS.NodeJS.LTS` |
| Git | Latest | Repository control and version management | Download from git-scm.com or use system package manager |
| Snakemake | 8.0+ | Workflow orchestration (installed via conda) | Included in `envs/environment.yaml` |
| SCIP solver | Latest | Linear/integer programming (optional, recommended) | Included in `envs/environment.yaml` |

**Platform notes:**
- **Windows**: All tools available via direct download or `winget`
- **macOS**: Conda and Node.js available via Homebrew; Git likely already installed
- **Linux**: All tools available via system package managers

## Install the dashboard

From the repo root:

```bash
cd vizualizer
npm install
```

This installs all Node.js dependencies listed in `package.json`, including:
- Next.js 16.2.4 (React framework)
- React 19.2.4 (UI library)
- TypeScript 5 (type checking)
- Tailwind CSS 4 (styling)
- papaparse (CSV parsing)
- yaml (YAML parsing)

Dependencies are cached in `node_modules/` and locked via `package-lock.json`.

## Install the Python environment

From the repo root:

```bash
conda env create -f envs/environment.yaml -n pypsa
conda activate pypsa
```

This creates a new conda environment named `pypsa` with:
- Python 3.11 or 3.12 (configurable in `environment.yaml`)
- PyPSA for network optimization
- Snakemake for workflow orchestration
- pandas, numpy, scipy for data processing
- SCIP solver for mixed-integer problems
- Additional geospatial and power-systems libraries

**Environment activation:**
- After creation, always activate before running scenarios: `conda activate pypsa`
- Check activation: `which python` (macOS/Linux) or `where python` (Windows) should point to `envs/pypsa/`

### Known environment issues

**Python 3.13 + linopy → pkg_resources error**

If Snakemake fails with `ModuleNotFoundError: No module named 'pkg_resources'`:

```bash
conda run -n pypsa pip install "google-cloud-storage>=2.10"
```

This installs a newer version that doesn't use the deprecated `pkg_resources` API.

**Missing SCIP solver**

If solver errors occur, verify SCIP is installed:

```bash
conda list | grep scip
```

If missing, install explicitly:

```bash
conda install -c conda-forge scip
```

**SSL/Certificate errors**

On corporate networks, set conda SSL verification:

```bash
conda config --set ssl_verify false
```

(Not recommended for public networks; better to configure proxy settings instead)

## Download workflow data

The repo does not ship large datasets. Download before running scenarios:

```bash
cd personal_data_download

# Download ERA5 weather cutouts (~2GB per year)
python download_cutout.py

# Download Zenodo-hosted datasets (costs, capacities, etc.)
python download_zenodo_files.py
```

**What each script does:**
- `download_cutout.py` - Fetches ERA5 weather data via ECMWF MARS API; caches to `data/cutout/archive/v0.8/`
- `download_zenodo_files.py` - Downloads datasets from Zenodo; auto-decompresses to `data/`

**Storage requirements:**
- ~2 GB per year of ERA5 weather data
- ~500 MB for Zenodo datasets
- Total: ~3 GB per scenario year

**Offline use:**
- Once downloaded, data is cached locally; runs work offline afterward
- Zenodo datasets require internet for first download only (then cached)

## Environment variables used by the dashboard

### Conda resolution

| Variable | Purpose | Example |
|---|---|---|
| `PLANUI_CONDA_ENV` | Force a named conda environment | `export PLANUI_CONDA_ENV=pypsa` |
| `PLANUI_CONDA_PREFIX` | Force a conda prefix path | `export PLANUI_CONDA_PREFIX=/usr/local/envs/pypsa` |
| `CONDA_DEFAULT_ENV` | Default env if not using named/prefix mode | (auto-detected) |
| `CONDA_PREFIX` | Active conda environment path | (auto-detected) |

### Snakemake/execution options

| Variable | Purpose | Example |
|---|---|---|
| `PLANUI_SNAKEMAKE_SKIP_REMOTE_CHECKS` | Disable remote-check skip flag | `export PLANUI_SNAKEMAKE_SKIP_REMOTE_CHECKS=1` |
| `PLANUI_USE_SYSTEM_PROXY` | Keep proxy variables during subprocess spawn | `export PLANUI_USE_SYSTEM_PROXY=1` |
| `SNAKEMAKE_CORES` | Number of cores for Snakemake | `export SNAKEMAKE_CORES=8` |

### Application options

| Variable | Purpose | Example |
|---|---|---|
| `PORT` | Web server port (default 3000) | `export PORT=8080` |
| `NODE_ENV` | Environment mode (development/production) | `export NODE_ENV=production` |

**Priority order for conda detection:**
1. `PLANUI_CONDA_ENV` (if set)
2. `PLANUI_CONDA_PREFIX` (if set)
3. Active conda prefix (`$CONDA_PREFIX` if not `base`)
4. `CONDA_DEFAULT_ENV` (if set and not `base`)
5. Named env search: `pypsa`, then `pypsa-eur`
6. System Python fallback

## Build and start

### Development mode (hot reload, debug info)

```bash
cd vizualizer
npm run dev
```

Opens at http://localhost:3000. Changes to source files trigger fast refresh (no full rebuild needed).

### Production mode (optimized build)

```bash
cd vizualizer
npm run build  # Creates optimized bundle in .next/
npm start      # Serves production build
```

Production build is smaller and faster; use for deployment or performance testing.

### Additional npm scripts

| Script | Purpose |
|---|---|
| `npm run lint` | Run ESLint to check code quality |
| `npm test` | Run unit tests (if configured) |
| `npm run format` | Format code with Prettier (if configured) |

## Verification checklist

After installation, verify everything is working:

1. **Check conda environment:**
   ```bash
   conda activate pypsa
   python --version          # Should be 3.11 or 3.12
   snakemake --version       # Should be 8.0+
   ```

2. **Check Node.js:**
   ```bash
   node --version             # Should be 20.x or higher
   npm --version              # Should be 10.x or higher
   ```

3. **Verify data files:**
   ```bash
   ls data/cutout/archive/v0.8/ | head   # Should list cutout files
   ls data/ | head                        # Should list cost, capacity, etc.
   ```

4. **Start the dashboard:**
   ```bash
   cd vizualizer && npm run dev           # Should start without errors
   # Then visit http://localhost:3000 in browser
   ```

5. **Run a validation check:**
   ```bash
   cd personal_diagnostics
   python check_romania.py                # Should pass with no errors
   ```

## Troubleshooting installation issues

### "conda: command not found"
- **Cause**: Conda not installed or not in PATH
- **Fix**: Reinstall Miniconda/Anaconda or add conda to PATH

### "npm: command not found"
- **Cause**: Node.js not installed or not in PATH
- **Fix**: Reinstall Node.js or add to PATH

### "Module not found" errors when running scenarios
- **Cause**: Python environment not activated or package missing
- **Fix**: `conda activate pypsa` and/or reinstall: `pip install <package>`

### "SCIP solver not available"
- **Cause**: Solver not installed in conda environment
- **Fix**: `conda install -c conda-forge scip`

### "Port 3000 already in use"
- **Cause**: Another process is using port 3000
- **Fix**: Use different port: `PORT=3001 npm run dev`

### "ModuleNotFoundError: pkg_resources"
- **Cause**: Old `google-cloud-storage` version in Python 3.13
- **Fix**: `conda run -n pypsa pip install "google-cloud-storage>=2.10"`

For additional help, see [[Running]] or [[Usage]] guides.