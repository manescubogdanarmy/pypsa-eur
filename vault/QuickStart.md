# Quick Start Guide

This guide covers the shortest path from a fresh clone to the current browser dashboard.

---

## Prerequisites

| Tool | Why | Install |
|---|---|---|
| Miniconda or Anaconda | Python environment manager for the workflow | Download installer |
| Node.js 20 LTS or newer | Runs the Next.js vizualizer | Download installer or use `winget install OpenJS.NodeJS.LTS` |

---

## 1. Create the Conda Environment

From the repo root:

```bash
conda env create -f envs/environment.yaml -n pypsa
conda activate pypsa
```

The environment file installs Snakemake, Python packages, and the solver stack used by the workflow.

If Python 3.13 is selected, apply the current `google-cloud-storage` fix after creating the environment:

```bash
conda run -n pypsa pip install "google-cloud-storage>=2.10"
```

---

## 2. Download Required Data

The repo does not ship the large `data/` payload. Download the cutout and Zenodo-backed datasets before running scenarios:

```bash
cd personal_data_download
python download_cutout.py
python download_zenodo_files.py
```

---

## 3. Install the Vizualizer Dependencies

```bash
cd vizualizer
npm install
```

---

## 4. Start the Web Dashboard

```bash
cd vizualizer
npm run dev
```

Open http://localhost:3000 in the browser.

If the server does not pick up the intended conda environment automatically, set `PLANUI_CONDA_ENV=pypsa` before starting `npm run dev`.

---

## 5. First Things to Verify

- The Scenario Builder loads a YAML template and allows edits through the form controls.
- The Run Queue tab can list and tail jobs.
- The Results tab shows only folders with the required comparison CSVs.

---

## Optional Production Start

```bash
cd vizualizer
npm run build
npm start
```