# Romania Simulation Guide

## Status Update

- **Environment**: Missing dependencies have been installed into the `pypsa` environment.
- **Configuration**: Updated `config/romania.yaml` to use default European weather data (avoiding credential errors).
- **Simulation**: Previous attempts to auto-run failed due to a locked Snakemake directory from a stuck process.

## Next Steps (Required)

Please follow these steps to proceed with the simulation:

### 1. Terminate Stuck Processes
Kill any running `python` or `snakemake` processes in your terminal to ensure a clean state.

### 2. Unlock the Directory
Run the unlock command to clear the previous lock:

```bash
conda run -n pypsa snakemake --unlock --configfile config/romania.yaml
```

### 3. Run the Simulation
Execute the main simulation command:

```bash
conda run -n pypsa snakemake -call results/romania-test/networks/base_s_5_elec_.nc --configfile config/romania.yaml
```

### 4. Verify Results
Finally, check the output using the verification script:

```bash
python check_romania.py
```