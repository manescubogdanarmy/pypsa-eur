# Quick Start Guide

This guide covers everything needed to set up a fresh machine and run the PyPSA-Eur Romania project end-to-end.

---

## Prerequisites (install once, system-level)

| Tool | Why | Install |
|---|---|---|
| [Miniconda or Anaconda](https://docs.conda.io/en/latest/miniconda.html) | Python environment manager | Download installer |
| [Node.js ≥ 20 LTS](https://nodejs.org/) | Required for the vizualizer web dashboard | Download installer or `winget install OpenJS.NodeJS.LTS` |

---

## 1. Create and Activate the Conda Environment

```bash
# From the repo root — creates environment named "pypsa" (overrides the name in the yaml)
conda env create -f envs/environment.yaml -n pypsa

# Activate it
conda activate pypsa
```

> [!NOTE]
> The environment file (`envs/environment.yaml`) installs all Python packages, Snakemake, and solvers (HiGHS, GLPK, SCIP, Gurobi). This step takes 5–15 minutes.

### Fix for Python 3.13+ (linopy / pkg_resources)

If conda resolves Python 3.13 or newer, run this after environment creation:

```bash
conda run -n pypsa pip install "google-cloud-storage>=2.10"
```

**Symptom without fix:** `ModuleNotFoundError: No module named 'pkg_resources'` when Snakemake starts. See [[Vizualizer#Known Environment Issue]] for details.

---

## 2. Download Required Data

The `data/` folder is not in the repo (~5–10 GB). Download it before running any scenario:

```bash
cd personal_data_download

# 1. Weather cutout (ERA5 + SARAH-3, ~1.2 GB) — takes 10–30 min
python download_cutout.py

# 2. Zenodo datasets (power plants, grid, costs, boundaries, ~5–10 GB) — takes 30–120 min
python download_zenodo_files.py
```

> [!WARNING]
> Zenodo occasionally rate-limits downloads and returns a 403 HTML page instead of the actual file. If a later pipeline step fails with a CSV parse error on a file in `AppData\Roaming\powerplantmatching\`, that file is a corrupted 403 page — delete it and re-download. See [[Running#Additional Troubleshooting]] for the full fix.

---

## 3. Install Web Dashboard Dependencies

`node_modules` is not committed to the repo. Run once after cloning:

```bash
cd vizualizer
npm install
```

---

## 4. Launch the Web Dashboard (recommended)

```bash
cd vizualizer
npm run dev        # http://localhost:3000
```

> [!NOTE]
> The dashboard auto-discovers the `pypsa` conda environment. If detection fails (e.g. you started the server while `base` was active), set `PLANUI_CONDA_ENV=pypsa` before running. See [[Vizualizer]] for full documentation.

---

## 5. (Optional) Legacy Tkinter UI

The Tkinter dashboard is still functional as a fallback:

```bash
# From the repo root
python personal_dashboard/visualize_scenarios_ui_v2.py
```

> [!NOTE]
> The dashboard auto-scans `results/` and shows only folders with the 7 required new-format CSVs. Legacy formats are not displayed.

---

## Summary Checklist (new machine)

- [ ] Miniconda / Anaconda installed
- [ ] Node.js ≥ 20 LTS installed
- [ ] `conda env create -f envs/environment.yaml -n pypsa`
- [ ] `google-cloud-storage>=2.10` fix applied (if Python 3.13+)
- [ ] `python personal_data_download/download_cutout.py`
- [ ] `python personal_data_download/download_zenodo_files.py`
- [ ] `cd vizualizer && npm install`
- [ ] `npm run dev` → open http://localhost:3000
