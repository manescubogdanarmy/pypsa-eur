# Quick Start Guide

This guide covers the absolute bare minimum commands to set up a new Python environment and launch the PyPSA-Eur Romania UI.

## 1. Create and Activate the Conda Environment
The project relies on a specific set of dependencies defined in the environment file.

```bash
# Create the environment named "pypsa" using the provided specification
conda env create -f envs/environment.yaml -n pypsa

# Activate the new environment
conda activate pypsa
```

## 2. Launch the Scenario Manager
The **Scenario Manager UI** is the entry point for creating scenarios, queueing Snakemake runs, and configuring outputs.

```bash
# From the root directory of the project
python personal_dashboard/scenario_manager_ui.py
```

## 3. Visualize Results
Once your scenarios finish running, use the **Dashboard v2** to analyze the output CSVs and generate figures. The v2 dashboard exclusively supports the new 7-CSV reporting format.

```bash
# From the root directory of the project
python personal_dashboard/visualize_scenarios_ui_v2.py
```

> [!NOTE]
> The dashboard will automatically scan your `results/` folder and populate the dropdown with any scenario directories containing the new-format CSVs. Legacy formats are no longer supported.
