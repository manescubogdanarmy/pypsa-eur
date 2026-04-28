# Installation Documentation

This note records the current project setup for the browser dashboard and the workflow it drives.

## Required tools

- Miniconda or Anaconda for the Python workflow
- Node.js 20 LTS or newer for the Next.js vizualizer
- Git for the repository itself

## Install the dashboard

```bash
cd vizualizer
npm install
```

## Install the Python environment

```bash
conda env create -f envs/environment.yaml -n pypsa
conda activate pypsa
```

If Python 3.13 is selected, apply the current fix:

```bash
conda run -n pypsa pip install "google-cloud-storage>=2.10"
```

## Download workflow data

```bash
cd personal_data_download
python download_cutout.py
python download_zenodo_files.py
```

## Environment variables used by the dashboard

- `PLANUI_CONDA_ENV` - force a named conda environment such as `pypsa`
- `PLANUI_CONDA_PREFIX` - force a conda prefix path
- `PLANUI_SNAKEMAKE_SKIP_REMOTE_CHECKS` - disable the default Snakemake remote-check skip flag
- `PLANUI_USE_SYSTEM_PROXY` - keep proxy variables when spawning subprocesses

## Build and start

```bash
cd vizualizer
npm run build
npm start
```