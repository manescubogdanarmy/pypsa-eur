# Quick Start Guide

This guide covers the shortest path from a fresh clone to the current browser dashboard running locally.

---

## Prerequisites (5 minutes to verify)

| Tool | Check | Install |
|---|---|---|
| Miniconda/Anaconda | `conda --version` | [conda-forge.org](https://conda-forge.org) |
| Node.js 20 LTS+ | `node --version` | [nodejs.org](https://nodejs.org) or `winget install OpenJS.NodeJS.LTS` |

---

## 1. Create the Conda Environment (3-5 minutes)

From the repo root:

```bash
conda env create -f envs/environment.yaml -n pypsa
conda activate pypsa
```

**What this does:**
- Creates a new conda environment named `pypsa`
- Installs Python 3.11/3.12, PyPSA, Snakemake, SCIP solver, and all dependencies
- Activates the environment for your current terminal session

**Verification:**
```bash
python --version          # Should show 3.11 or 3.12
snakemake --version       # Should show 8.0 or newer
```

**If Python 3.13 is selected**, apply this fix after environment creation:

```bash
conda run -n pypsa pip install "google-cloud-storage>=2.10"
```

---

## 2. Download Required Data (5-10 minutes, depending on internet)

The repo does not ship the large weather and cost datasets. Download them before running scenarios:

```bash
cd personal_data_download
python download_cutout.py              # ~2GB ERA5 weather data
python download_zenodo_files.py        # ~500MB cost/capacity data
```

**What this does:**
- `download_cutout.py` - Fetches ERA5 weather cutouts via ECMWF MARS API; caches to `data/cutout/archive/v0.8/`
- `download_zenodo_files.py` - Downloads from Zenodo; auto-decompresses to `data/`

**Verification:**
```bash
ls data/cutout/archive/v0.8/ | head    # Should list .nc files
ls data/                       # Should list cost_*.csv, etc.
```

**If download is slow:**
- Check internet connection: `python check_url.py` (from `personal_diagnostics/`)
- On corporate networks, proxy settings may need configuration
- Downloads are cached; subsequent runs use local files

---

## 3. Install the Vizualizer Dependencies (2-3 minutes)

```bash
cd vizualizer
npm install
```

**What this does:**
- Reads `package.json` and `package-lock.json`
- Downloads and installs React, Next.js, TypeScript, and all UI dependencies
- Caches to `node_modules/` (~500 MB)

**Verification:**
```bash
ls node_modules/@next             # Should list many packages
```

---

## 4. Start the Web Dashboard (1 minute)

```bash
cd vizualizer
npm run dev
```

**Expected output:**
```
> next dev
  ▲ Next.js 16.2.4
  - Local:        http://localhost:3000
  - Environments: .env.local

Ready in 3.2s
```

Open http://localhost:3000 in your browser.

---

## 5. Verify the Dashboard Works (2-5 minutes)

### Step 5a: Scenario Builder
- The **Scenario Builder** tab should load a YAML template
- Form fields should be visible: Scenario Slug, Countries, Snapshot Window, etc.
- YAML editor on the right should show a valid YAML config

### Step 5b: Configuration Validation
Open a new terminal and run:
```bash
cd personal_diagnostics
python check_romania.py
```

**Expected result:** No errors. Output should list valid scenario templates and settings.

### Step 5c: Quick Test Run (optional, ~30-60 seconds)
If you want to verify everything can run:
```bash
cd personal_runners
python run_baseline_only.bat
```

This solves a quick baseline network without stress shocks. Should complete with "SUCCESS" message.

---

## 6. First Things to Verify

✅ **Scenario Builder loads a template** and allows form edits
✅ **Form → YAML sync works** (toggle "Sync to YAML" button)
✅ **"Check Romania" validation passes** with no errors
✅ **Quick baseline test completes** (optional, but recommended)

If all checks pass, you're ready to build and run scenarios!

---

## Next Steps

- **[[Usage]]** - How to build scenarios, enqueue runs, and view results
- **[[Running]]** - Understanding job states and queue behavior
- **[[Vizualizer]]** - API documentation and configuration details
- **[[CLAUDE.md]]** - Common workflows and troubleshooting

---

## Troubleshooting Quick Start

| Issue | Fix |
|---|---|
| `conda: command not found` | Reinstall Miniconda or add conda to PATH |
| `node: command not found` | Reinstall Node.js or add to PATH |
| Download fails (429, 403) | Check internet connection or try `check_url.py` |
| Port 3000 in use | Use different port: `PORT=3001 npm run dev` |
| Blank dashboard page | Check browser console for errors; try hard refresh (Ctrl+F5) |
| SCIP solver not found | Run `conda install -c conda-forge scip` |

For more help, see [[Installation]] or [[Running]].