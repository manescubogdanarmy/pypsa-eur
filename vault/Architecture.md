# Architecture Documentation



---
# Source: 1_piele_docs\PLAN.md

==================================================================
## Romania Winter 2019 Stress Scenario (Baseline + Shocked) in PyPSA-Eur

### Summary
Implement two new reproducible runs and one comparison report:
1. `Baseline` run with no shocks.
2. `Stress` run with all requested Romania shocks in one solve.
3. Automated post-processing that emits required CSVs, PNG/PDF figures, and a 1-page assumptions/limitations note.

This plan uses:
- Geographic scope: `RO + BG + HU + RS` (shocks applied only to Romania).
- Time window in snapshots (UTC): **2019-01-13 22:00 to 2019-01-20 22:00**, `inclusive: left`, hourly (168 snapshots).  
  This matches local EET: **2019-01-14 00:00 to 2019-01-21 00:00**.
- Hybrid ops mode: no generation/storage/H2 expansion, but limited transmission expansion (`+500 MW` per line/link).
- SCADA proxy: ramp cap `10%/h` for first 24h, then `25%/h` for next 48h.

### Files To Add
1. `config/adversarial/romania_2019_winter_baseline.yaml`
2. `config/adversarial/romania_2019_winter_stress.yaml`
3. `scripts/romania_winter_stress.py`
4. `scripts/report_romania_winter_stress.py`
5. `run_romania_winter_stress.py`
6. `test/test_romania_winter_stress.py`

### Files To Modify
1. `scripts/solve_network.py`  
   Add pre-model shock application call and post-model custom constraints call.

---

### 1) Config Implementation

Create `baseline` and `stress` configs with:
1. `run.name` as:
   - `romania-2019-winter-baseline`
   - `romania-2019-winter-stress`
2. `countries: [RO, BG, HU, RS]`
3. `scenario.clusters: [10]`, `scenario.opts: ['']`
4. `snapshots.start: '2019-01-13 22:00'`, `snapshots.end: '2019-01-20 22:00'`, `snapshots.inclusive: 'left'`
5. `clustering.temporal.resolution_elec: false` (hourly)
6. `atlite.default_cutout: europe-2019-era5` and matching `atlite.cutouts.europe-2019-era5` block
7. `electricity.extendable_carriers.Generator/StorageUnit/Store/Link: []`
8. `lines.max_extension: 500`, `links.max_extension: 500`
9. `solving.options.load_shedding: 100000` (EUR/MWh)
10. `electricity.renewable_carriers` includes hydro (`hydro` present)

Add `stress_test` section only in stress config:
1. `enable: true`
2. `country: RO`
3. `load_factor_full_window: 1.12`
4. `hydro_factor_full_window: 0.60`
5. `gas_factor_first_72h: 0.70`
6. `scada.tight_hours: 24`, `scada.relaxed_hours: 48`
7. `scada.ramp_tight_per_hour: 0.10`, `scada.ramp_relaxed_per_hour: 0.25`
8. `import_cap.zero_hours: 48`, `import_cap.half_hours: 48`, `import_cap.half_factor: 0.5`

---

### 2) Shock Logic Module (`scripts/romania_winter_stress.py`)

Implement pure functions:

1. `apply_timeseries_shocks(n, snapshots, cfg)`  
   Applies pre-model series changes:
   - Load shock: multiply `n.loads_t.p_set` for RO loads by `1.12` over all 168h.
   - Hydro shock: for RO hydro generators (`ror`, `hydro`) scale `p_max_pu` by `0.60`; for RO hydro storage (`hydro`, `PHS`) scale inflow (and storage dispatch availability if present) by `0.60`.
   - Gas shock: for RO gas generators (`OCGT`, `CCGT`) scale `p_max_pu` by `0.70` for first 72h only.
   - Add validation logs if expected components are absent.

2. `add_scada_proxy_constraints(n, snapshots, cfg)`  
   Adds linear ramp constraints on RO controllable generators:
   - Hours 1-24: `|p_t - p_{t-1}| <= 0.10 * p_nom_effective`
   - Hours 25-72: `|p_t - p_{t-1}| <= 0.25 * p_nom_effective`
   - `p_nom_effective` uses decision variable for extendables, static value for fixed assets.

3. `add_import_cap_constraints(n, snapshots, cfg)`  
   Adds directional constraints on RO border interconnectors:
   - First 48h: inbound cap = 0% of line/link capacity.
   - Next 48h: inbound cap = 50% of line/link capacity.
   - Remaining 72h: no additional import cap.
   - Apply to both AC lines (`Line-s`) and links (`Link-p`) with orientation-aware sign.
   - If no RO border assets exist, log and expose flag for reporting fallback note.

---

### 3) Integrate With Solver (`scripts/solve_network.py`)

1. Import functions from `scripts/romania_winter_stress.py`.
2. In `prepare_network(...)`, after snapshot clipping and before model creation:
   - If `config.get("stress_test", {}).get("enable")`, call `apply_timeseries_shocks(...)`.
3. In `extra_functionality(...)`:
   - If stress enabled, call `add_scada_proxy_constraints(...)` then `add_import_cap_constraints(...)`.
4. Keep behavior unchanged when `stress_test.enable` is false or absent.

---

### 4) Reporting & Deliverables (`scripts/report_romania_winter_stress.py`)

CLI inputs:
1. `--baseline-net`
2. `--scenario-net`
3. `--country RO`
4. `--outdir results/romania-2019-winter-stress-comparison`

Generate CSVs:
1. `ens_summary.csv` with ENS MWh, shedding hours, max shedding MW.
2. `system_cost_comparison.csv` with baseline cost, scenario cost, delta absolute and percent.
3. `daily_net_imports_mwh.csv` (baseline/scenario) aggregated by day.
4. `interconnector_flow_congestion.csv` with mean/p95/max loading and congested hours.
5. `generation_mix_mwh.csv` by technology and case.
6. `curtailment_mwh.csv` by technology and case.
7. `lmp_summary_ro.csv` with mean, p95, max (optional, always attempted).

Generate figures in both PNG and PDF:
1. `fig_01_shedding_timeseries.(png|pdf)`
2. `fig_02_daily_net_imports.(png|pdf)`
3. `fig_03_generation_mix.(png|pdf)`
4. `fig_04_interconnector_loading.(png|pdf)`
5. `fig_05_ro_price_distribution.(png|pdf)` if LMP available.

Generate 1-page note:
1. `assumptions_limitations.md`  
   Must include exact dates, SCADA proxy formula, import-constraint formulation, fallback behavior if missing interconnectors, and interpretation limits.

Implementation detail for daily aggregation:
1. Treat snapshots as UTC.
2. Convert to `Europe/Bucharest` for daily MWh/day grouping to align with local-window reporting.

---

### 5) Run Orchestration (`run_romania_winter_stress.py`)

Implement a single script that:
1. Unlocks Snakemake for baseline config.
2. Solves baseline target `results/romania-2019-winter-baseline/networks/base_s_10_elec_.nc`.
3. Unlocks Snakemake for stress config.
4. Solves stress target `results/romania-2019-winter-stress/networks/base_s_10_elec_.nc`.
5. Runs `scripts/report_romania_winter_stress.py`.
6. Prints output paths for all deliverables.

Use `conda run -n pypsa-eur ...` in this repo (detected env naming).

---

### 6) Tests (`test/test_romania_winter_stress.py`)

Add unit tests on synthetic tiny networks:
1. `test_apply_timeseries_shocks_windows`  
   Verifies +12% load full window, hydro 60% full window, gas 70% first 72h only.
2. `test_scada_constraints_created`  
   Verifies constraint names exist and are indexed over expected snapshot ranges.
3. `test_import_constraints_directional`  
   Verifies inbound RO caps for both line orientations and links.
4. `test_stress_disabled_no_changes`  
   Verifies no-op path.

No full optimization run in tests.

---

### 7) Acceptance Criteria

1. Baseline and stress scenarios both solve for exactly 168 hourly snapshots.
2. Stress run applies all five requested shocks with exact hour windows.
3. Load shedding exists as explicit high-penalty carrier and ENS metrics are non-null.
4. Comparison output folder contains all required CSVs and PNG/PDF figures.
5. 1-page assumptions/limitations note exists and documents SCADA proxy and limitations.
6. Unit tests for shock and constraint logic pass.

---

### Public Interfaces / Schema Additions

1. New config block: `stress_test`
2. New script CLI: `scripts/report_romania_winter_stress.py --baseline-net ... --scenario-net ... --country ... --outdir ...`
3. New runner script: `run_romania_winter_stress.py`

---

### Assumptions And Defaults Locked

1. UTC snapshot window is used in config: `2019-01-13 22:00` to `2019-01-20 22:00` (`inclusive: left`).
2. Local EET interpretation is `2019-01-14 00:00` to `2019-01-21 00:00`.
3. Country set is exactly `[RO, BG, HU, RS]`.
4. Hybrid mode means no generation/storage expansion and limited grid expansion (`+500 MW` per asset).
5. SCADA proxy uses moderate levels (`10%/h`, then `25%/h`).
6. If 2019 cutout is missing locally, workflow retrieves `europe-2019-era5` from configured archive source.





---
# Source: 1_piele_docs\romania_config_explanation.md

==================================================================
# Explanation of `config/romania.yaml`

This file is a configuration file for **PyPSA-Eur**, customized for a specific scenario involving **Romania**. It overrides default settings to define the scope, resolution, and constraints of the energy system simulation.

## 1. General Settings
- **`tutorial: true`**: Indicates this might be a simplified or tutorial run, potentially skipping some heavy pre-processing steps suitable for full-scale runs.
- **`run`**:
  - `name: "romania-test"`: The name of this simulation run. Outputs will likely be stored in a directory with this name.
  - `disable_progressbar: true`: Turns off the progress bar, likely to keep logs cleaner.

## 2. Scenario & Scope
- **`scenario`**:
  - `clusters: [5]`: The network will be reduced (clustered) to **5 nodes/regions**. This is very coarse and good for quick testing.
  - `opts: ['']`: No specific optimization options (like line expansion or transmission limits) are applied here.
- **`countries: ['RO']`**: The simulation is restricted geographically to **Romania** only.

## 3. Timeframe (`snapshots`)
- **Period**: `2013-03-01` to `2013-03-08`.
- **Duration**: **1 week** (7 days). This is a short snapshot used for testing, as full-year runs take much longer.

## 4. Electricity Settings (`electricity`)
- **CO2 Limits**:
  - Enabled (`co2limit_enable: true`) with a limit of `100.e+6` (100 million tonnes). This is a very loose constraint effectively allowing the model to focus on cost minimization without strict decarbonization for this test.
- **Technological Choices** (`extendable_carriers`):
  - **Generators**: Solar, Onshore Wind, Offshore Wind (AC), Gas (OCGT, CCGT), and Nuclear are allowed to be expanded.
  - **Storage**: Batteries are allowed.
  - **Hydrogen**: H2 Stores and pipelines are allowed.
- **Renewable Potentials**:
  - Uses **GEM** (Global Energy Monitor) data to estimate existing capacities (`estimate_renewable_capacities: from_gem: true`).

## 5. Weather Data (`atlite`)
- **Cutout**: `europe-2013-sarah3-era5`.
- Defines the spatial (`x`, `y`) and temporal bounds for weather data (solar radiation, wind speed) used to calculate renewable potentials.
- **Resolution**: 0.3 degrees grid.

## 6. Clustering Details (`clustering`)
- **Exclusions**: `OCGT`, `offwind-ac`, and `coal` are excluded from the clustering process, meaning their capacities might be aggregated differently or preserved.
- **Temporal Resolution**: `resolution_elec: 24h`. The model operates on **daily** steps (24 hours) rather than hourly. This significantly reduces computational complexity, making the solving process very fast.

## 7. Solver (`solving`)
- **Solver**: `highs`.
- **Options**: `highs-simplex`.
- HiGHS is an open-source high-performance linear optimization solver.

---
**Summary for User:**
This config creates a **miniature simulation** of the Romanian power system. It aggregates the country into just **5 regions**, runs for only **one week** (March 2013), and uses **daily time steps**. It allows investment in renewables, gas, nuclear, and hydrogen. This is likely intended for debugging, teaching, or quickly validating that the setup works before running expensive full-scale simulations.





---
# Source: 1_piele_docs\romania_config_explanation_ro.md

==================================================================
# Explicarea fișierului `config/romania.yaml`

Acest fișier este un fișier de configurare pentru **PyPSA-Eur**, personalizat pentru un scenariu specific care implică **România**. Acesta suprascrie setările implicite pentru a defini aria de acoperire, rezoluția și constrângerile simulării sistemului energetic.

## 1. Setări Generale
- **`tutorial: true`**: Indică faptul că aceasta ar putea fi o rulare simplificată sau de tip tutorial, sărindu-se probabil peste unele etape complexe de pre-procesare potrivite pentru rulări la scară largă.
- **`run`**:
  - `name: "romania-test"`: Numele acestei sesiuni de simulare. Rezultatele vor fi probabil stocate într-un director cu acest nume.
  - `disable_progressbar: true`: Dezactivează bara de progres, probabil pentru a menține jurnalele (logs) mai curate.

## 2. Scenariu & Arie de Acoperire
- **`scenario`**:
  - `clusters: [5]`: Rețeaua va fi redusă (clusterizată) la **5 noduri/regiuni**. Aceasta este o granularitate foarte mare, bună pentru teste rapide.
  - `opts: ['']`: Nu se aplică aici opțiuni specifice de optimizare (cum ar fi extinderea liniilor sau limitele de transmisie).
- **`countries: ['RO']`**: Simularea este restrânsă geografic doar la **România**.

## 3. Intervalul de Timp (`snapshots`)
- **Perioada**: `2013-03-01` până la `2013-03-08`.
- **Durata**: **1 săptămână** (7 zile). Acesta este un instantaneu scurt folosit pentru testare, deoarece rulările pentru un an întreg durează mult mai mult.

## 4. Setări Electricitate (`electricity`)
- **Limite CO2**:
  - Activat (`co2limit_enable: true`) cu o limită de `100.e+6` (100 milioane de tone). Aceasta este o constrângere foarte relaxată, permițând efectiv modelului să se concentreze pe minimizarea costurilor fără o decarbonizare strictă pentru acest test.
- **Alegeri Tehnologice** (`extendable_carriers`):
  - **Generatoare**: Solar, Eolian Onshore, Eolian Offshore (AC), Gaz (OCGT, CCGT) și Nuclear sunt permise pentru extindere.
  - **Stocare**: Bateriile sunt permise.
  - **Hidrogen**: Stocarea H2 și conductele de H2 sunt permise.
- **Potențiale Regenerabile**:
  - Utilizează datele **GEM** (Global Energy Monitor) pentru a estima capacitățile existente (`estimate_renewable_capacities: from_gem: true`).

## 5. Date Meteo (`atlite`)
- **Cutout**: `europe-2013-sarah3-era5`.
- Definește limitele spațiale (`x`, `y`) și temporale pentru datele meteo (radiație solară, viteza vântului) utilizate pentru calcularea potențialelor regenerabile.
- **Rezoluție**: Grilă de 0.3 grade.

## 6. Detalii Clusterizare (`clustering`)
- **Excluderi**: `OCGT`, `offwind-ac` și `coal` (cărbune) sunt excluse din procesul de clusterizare, ceea ce înseamnă că capacitățile lor ar putea fi agregate diferit sau păstrate.
- **Rezoluție Temporală**: `resolution_elec: 24h`. Modelul funcționează pe pași **zilnici** (24 de ore) mai degrabă decât orari. Acest lucru reduce semnificativ complexitatea computațională, făcând procesul de rezolvare foarte rapid.

## 7. Rezolvitor / Solver (`solving`)
- **Solver**: `highs`.
- **Opțiuni**: `highs-simplex`.
- HiGHS este un solver de optimizare liniară de înaltă performanță, open-source.

---
**Rezumat pentru Utilizator:**
Această configurație creează o **simulare miniaturală** a sistemului energetic românesc. Agregă țara în doar **5 regiuni**, rulează pentru doar **o săptămână** (Mecrtie 2013) și folosește **pași de timp zilnici**. Permite investiții în regenerabile, gaz, nuclear și hidrogen. Aceasta este probabil destinată depanării, predării sau validării rapide a faptului că configurarea funcționează înainte de a rula simulări costisitoare la scară largă.





---
# Source: 1_piele_docs\TEMPLATE_ARCHITECTURE.md

==================================================================
# Year-Specific YAML Template Architecture

## Overview

The scenario manager now supports **intelligent template selection** based on the chosen cutout year. When you select 2023 from the UI dropdown, the system automatically loads the 2023-specific YAML template with pre-configured settings optimized for 2023 weather data.

## Template Files

### Primary Templates

| Template File | Purpose | Used When |
|---|---|---|
| `scenario_template.yaml` | Default template for 2020 cutout year | Cutout year = 2020 (default) |
| `scenario_template_2023.yaml` | Optimized template for 2023 cutout year | Cutout year = 2023 |

Both templates reside in: `1_piele_docs/`

### Template Selection Logic

```
User selects cutout_year from UI dropdown
        ↓
build_working_config() or build_configs() called with ScenarioInputs
        ↓
resolve_template_path(template_path, inputs.cutout_year)
        ↓
If cutout_year == "2020" → Use scenario_template.yaml (default)
If cutout_year == "2023" → Use scenario_template_2023.yaml (if exists, else default)
        ↓
load_template(resolved_path)
        ↓
Configuration applied with year-appropriate defaults
```

## Configuration Differences

### scenario_template.yaml (2020)
```yaml
snapshots:
  start: "2020-12-01"
  end: "2020-12-08"

electricity:
  estimate_renewable_capacities:
    year: 2020

atlite:
  default_cutout: europe-2020-sarah3-era5
```

### scenario_template_2023.yaml (2023)
```yaml
snapshots:
  start: "2023-01-15"
  end: "2023-01-22"

electricity:
  estimate_renewable_capacities:
    year: 2023

atlite:
  default_cutout: europe-2023-sarah3-era5
```

## How It Works

### Step-by-Step Flow

1. **User Opens Scenario Manager UI**
   - Loads default template path: `1_piele_docs/scenario_template.yaml`

2. **User Selects Cutout Year**
   - Dropdown shows: [2020, 2023]
   - Selection stored in `cutout_year` StringVar

3. **User Provides Scenario Details**
   - Sets all other parameters (clusters, solver, countries, stress parameters, etc.)

4. **User Clicks "Build Config" or "Enqueue Run"**
   - Calls `build_working_config()` or `build_configs()`
   - Passes `inputs.cutout_year` to function

5. **System Resolves Template Path**
   - Calls `resolve_template_path(template_path, inputs.cutout_year)`
   - Logic:
     ```python
     if cutout_year == "2020":
         return base_template_path  # scenario_template.yaml
     elif cutout_year == "2023":
         year_specific = parent_dir / "scenario_template_2023.yaml"
         if year_specific.exists():
             return year_specific
         return base_template_path  # Fallback if not found
     ```

6. **System Loads Selected Template**
   - `load_template()` reads YAML from resolved path
   - Returns configuration dictionary

7. **Configuration Applied**
   - User inputs merged with template defaults
   - Cutout year validated and applied via `_apply_cutout_to_config()`
   - Generated config has correct settings for chosen year

8. **Run Execution**
   - Generated config sent to Snakemake
   - Snakemake uses europe-20XX-sarah3-era5 cutout file

## Implementation Details

### resolve_template_path() Function

Location: `1_piele_dashboard/scenario_manager/config_builder.py`

```python
def resolve_template_path(base_template_path: Path, cutout_year: str = "2020") -> Path:
    """Resolve template path based on cutout year.
    
    Intelligently selects year-specific templates:
    - If cutout_year = "2023", looks for scenario_template_2023.yaml
    - If cutout_year = "2020", uses default scenario_template.yaml
    - Falls back to base template if year-specific not found
    
    Args:
        base_template_path: Path to default template (e.g., scenario_template.yaml)
        cutout_year: Year as string ("2020" or "2023")
    
    Returns:
        Path to the template file to use
    """
```

### Integration Points

1. **build_working_config()** (Line ~360)
   ```python
   resolved_template_path = resolve_template_path(template_path, inputs.cutout_year)
   template_cfg = load_template(resolved_template_path)
   ```

2. **build_configs()** (Line ~390)
   ```python
   resolved_template_path = resolve_template_path(template_path, inputs.cutout_year)
   template_cfg = load_template(resolved_template_path)
   ```

## Why Year-Specific Templates?

### Advantages

✅ **Appropriate Defaults** - Each year gets realistic default snapshot dates
✅ **Correct Electricity Year** - Renewable capacity estimates use matching year
✅ **Pre-Configured Cutouts** - Cutout name set correctly from the start
✅ **Flexibility** - Easy to add 2024, 2025, etc. in future
✅ **Clarity** - Users understand they're working with year-consistent data
✅ **Fallback Safety** - Missing year-specific template falls back gracefully

### Example Scenario

**User creates 2023 winter stress scenario:**

```
1. Selects "Cutout year: 2023"
2. System auto-selects scenario_template_2023.yaml
3. Template has:
   - snapshots: 2023-01-15 to 2023-01-22 (2023 winter baseline)
   - electricity.year: 2023 (correct for capacity estimates)
   - atlite.default_cutout: europe-2023-sarah3-era5 (correct weather file)
4. User accepts or overrides these defaults as needed
5. Config generated with year-consistent values
6. Simulation runs with 2023 weather data
```

## Adding New Year Templates

To add support for year 2024 or later:

### 1. Create Template File
```bash
cp 1_piele_docs/scenario_template_2023.yaml 1_piele_docs/scenario_template_2024.yaml
```

### 2. Update Contents
```yaml
snapshots:
  start: "2024-01-15"  # Update to 2024 dates
  end: "2024-01-22"

electricity:
  estimate_renewable_capacities:
    year: 2024  # Update year

atlite:
  default_cutout: europe-2024-sarah3-era5  # Update cutout name
  cutouts:
    europe-2024-sarah3-era5:
      time:
        - "2024"
        - "2024"
```

### 3. Update UI Dropdown
```python
# scenario_manager_ui.py, line ~133
("cutout_year", self.cutout_year, ["2020", "2023", "2024"]),
```

### 4. Ensure Cutout File Exists
```bash
# Must have: data/cutout/archive/v0.8/europe-2024-sarah3-era5.nc
```

### 5. Update Template Validation (Optional)
```python
# config_builder.py, _apply_cutout_to_config()
if cutout_year not in ("2020", "2023", "2024"):
    raise ValueError(...)
```

That's it! The `resolve_template_path()` function will automatically detect and use `scenario_template_2024.yaml`.

## Debugging Template Issues

### Template Not Found
If system falls back to default template:
```bash
# Check file exists
ls -la 1_piele_docs/scenario_template_2023.yaml

# Check file permissions (must be readable)
chmod 644 1_piele_docs/scenario_template_2023.yaml
```

### Wrong Template Loaded
Add debug logging to verify:
```python
# In config_builder.py
import logging
logger = logging.getLogger(__name__)

def resolve_template_path(...):
    resolved = ...
    logger.info(f"Using template: {resolved}")
    return resolved
```

### Snapshot Dates Wrong
If defaults are not from selected year:
- Check `scenario_template_2023.yaml` has correct snapshots section
- Verify YAML syntax is valid: `yamllint 1_piele_docs/scenario_template_2023.yaml`

## File Locations

```
pypsa-eur/
├── 1_piele_dashboard/
│   ├── scenario_manager_ui.py          # UI dropdown (lines ~60, ~133)
│   └── scenario_manager/
│       └── config_builder.py            # resolve_template_path() function
├── 1_piele_docs/
│   ├── scenario_template.yaml           # Default (2020)
│   ├── scenario_template_2023.yaml      # Year-specific (2023)
│   └── CUTOUT_CONFIG.md                 # User documentation
└── data/
    └── cutout/archive/v0.8/
        ├── europe-2020-sarah3-era5.nc
        └── europe-2023-sarah3-era5.nc
```

## Best Practices

1. **Keep Templates Synchronized**
   - Both templates should have identical structure
   - Only differences: year values, snapshot dates, cutout names

2. **Validate YAML Syntax**
   ```bash
   python -c "import yaml; yaml.safe_load(open('scenario_template_2023.yaml'))"
   ```

3. **Version Control**
   - Track both template files in git
   - Document any customizations

4. **Test New Templates**
   - Create test scenario with new template
   - Verify cutout year, snapshot dates, electricity year match
   - Check generated config before running Snakemake

5. **Fallback Planning**
   - Always keep default `scenario_template.yaml`
   - Year-specific templates should be optional enhancement
   - Missing template gracefully falls back to default

## Technical Architecture

```
UI Layer
  ↓
build_working_config(inputs, template_path)
  ↓
resolve_template_path(template_path, inputs.cutout_year)
  ├─ 2020 → scenario_template.yaml
  └─ 2023 → scenario_template_2023.yaml (if exists)
  ↓
load_template(resolved_path)
  ↓
_base_config_from_inputs(template_cfg, working_yaml)
  ↓
_apply_inputs_to_config(...)
  ↓
_apply_cutout_to_config(...)
  ↓
Generated YAML written to config/adversarial/generated/
```

## Support & Troubleshooting

For issues with year-specific templates:
1. Verify both template files exist and are readable
2. Check template YAML syntax: `yamllint scenario_template_*.yaml`
3. Verify cutout files exist: `ls data/cutout/archive/v0.8/europe-*.nc`
4. Check UI dropdown has year option selected
5. Verify generated config has correct cutout name and snapshot dates
6. See CUTOUT_CONFIG.md for user-level troubleshooting

---

**Implementation Date:** January 24, 2025  
**Version:** 1.0  
**Status:** Production Ready





---
# Source: vault\Core\PLAN.md

==================================================================
# PlanUI: Scenario Wizard + Run Manager + New-Format Results Viewer

## Summary
Build a new Tkinter desktop application that lets you create scenarios via guided controls or advanced YAML editing, enqueue and run Snakemake workflows without blocking navigation, and view only the new report-format outputs (like `results/romania-2020-winter-stress-comparison`) from a self-updating results list.  
The implementation will also add a read-only canonical template in docs and produce implementation documentation at `1_piele_docs/planui.md`.

## Scope
- In scope: new Python app, config generation, queue-based run execution, spinner/status UI, always-available page navigation, self-updating new-format results page, bilingual toggle (EN/RO), persistent run/history state.
- Out of scope: auto-reattach to already-running OS processes after app restart, legacy-format results rendering, overwrite behavior for existing output names.

## Target Files
- `1_piele_docs/planui.md`
- `1_piele_docs/scenario_template.yaml`
- `1_piele_dashboard/scenario_manager_ui.py`
- `1_piele_dashboard/scenario_manager/types.py`
- `1_piele_dashboard/scenario_manager/config_builder.py`
- `1_piele_dashboard/scenario_manager/run_manager.py`
- `1_piele_dashboard/scenario_manager/results_index.py`
- `1_piele_dashboard/scenario_manager/state_store.py`
- `1_piele_dashboard/scenario_manager/i18n.py`

## App Architecture
1. Navigation shell:
- Sidebar/top nav with pages always accessible: `Scenario Builder`, `Runs`, `Results`.
- Global language toggle EN/RO.
- Global active-run spinner indicator.

2. Scenario Builder page:
- Run mode selector: `Paired (baseline+scenario)` or `Single scenario with reference baseline`.
- Two editing modes:
- `Core + Stress Controls`: structured form fields update an in-memory working config.
- `Advanced YAML`: editable working YAML panel plus read-only canonical template panel.
- Template source is fixed: `1_piele_docs/scenario_template.yaml`.
- Template file is never modified.

3. Runs page:
- Job submission form and queue list.
- Status lifecycle: `queued`, `running`, `succeeded`, `failed`, `cancelled`, `interrupted`.
- One active job max; additional jobs queued.
- Per-job logs path and progress text.
- Spinner visible while any job is `running`.

4. Results page:
- Auto-refresh index (polling) of new-format result folders only.
- Selection list from `results/` updates while app runs.
- Native tabs for selected result:
- `Summary` (cost delta, ENS, imports, price stats).
- `CSV Data` (dropdown/table preview for required CSVs).
- `Figures` (PNG picker and image viewer).
- `Assumptions` (markdown/text panel).

## Run Flows
1. Paired flow:
- Generate `baseline` config by cloning scenario config and forcing `stress_test.enable=false`.
- Generate `scenario` config with stress settings.
- Execute commands in active environment:
- `snakemake --unlock --configfile <baseline_cfg>`
- `snakemake -c all <baseline_target_nc> --configfile <baseline_cfg>`
- `snakemake --unlock --configfile <scenario_cfg>`
- `snakemake -c all <scenario_target_nc> --configfile <scenario_cfg>`
- `python scripts/report_romania_winter_stress.py --baseline-net <baseline_target_nc> --scenario-net <scenario_target_nc> --country <country> --outdir results/<output_name>`

2. Single flow:
- Require user-selected solved baseline network from discovered list (`results/*/networks/*.nc`).
- Run only scenario config solve, then report using selected baseline network:
- `snakemake --unlock --configfile <scenario_cfg>`
- `snakemake -c all <scenario_target_nc> --configfile <scenario_cfg>`
- `python scripts/report_romania_winter_stress.py --baseline-net <selected_baseline_nc> --scenario-net <scenario_target_nc> --country <country> --outdir results/<output_name>`

## Naming and Validation Rules
- User-provided output name is required.
- If `results/<output_name>` exists, submission is blocked and rename is required.
- Generated config files go to `config/adversarial/generated/`.
- Run names derived from user scenario slug to keep uniqueness and traceability.
- Required new-format CSVs for result eligibility:
- `system_cost_comparison.csv`
- `generation_mix_mwh.csv`
- `lmp_summary_ro.csv`
- `ens_summary.csv`
- `curtailment_mwh.csv`
- `daily_net_imports_mwh.csv`
- `interconnector_flow_congestion.csv`

## Persistent State
- Persist queue/history/settings in JSON at app-level state file.
- On restart:
- Reload completed/failed history.
- Mark previously `running` jobs as `interrupted` (no auto-reattach).
- Keep language and last UI selections.

## Public Interfaces and Types
- `ScenarioInputs`: run mode, names, country, snapshots, clusters, solver, stress params, reference baseline path.
- `ConfigBuildResult`: generated config file paths, run names, expected network targets.
- `JobSpec`: command list, output_name, mode, created_at.
- `JobRecord`: job_id, status, timestamps, output_dir, log_path, exit_code, error_summary.
- `ResultEntry`: folder path, detected files, timestamp, validity flags.
- `scan_new_format_results(results_dir) -> list[ResultEntry]`
- `build_configs(inputs, template_path) -> ConfigBuildResult`
- `enqueue(job_spec)`, `cancel(job_id)`, `load_state()`, `save_state()`.

## Test Cases and Scenarios
1. Config/template:
- Template hash unchanged after both editing modes.
- Paired build creates two YAMLs and baseline has `stress_test.enable=false`.
- Single build requires valid baseline network path.

2. Queue/runtime:
- Submitting two jobs yields one `running`, one `queued`.
- Navigation remains responsive during long running subprocess.
- Failed command marks job `failed` with captured stderr snippet.
- Restart reloads history and converts stale `running` to `interrupted`.

3. Results indexing/viewing:
- Only folders with all 7 required CSVs appear.
- New result folder appears without restart during polling.
- Summary metrics parse correctly from sample comparison output.
- Figures/assumptions tabs handle missing optional files gracefully.

4. UX rules:
- Bilingual toggle updates visible labels on all pages.
- Name conflict blocks submission.
- Spinner appears only when any job is active.

## Implementation Sequence
1. Create `1_piele_docs/scenario_template.yaml` and `1_piele_docs/planui.md`.
2. Implement shared types, i18n map, and state store.
3. Implement config builder with immutable-template workflow.
4. Implement run manager queue and subprocess orchestration.
5. Implement results indexer and parser for required new-format files.
6. Build Tkinter shell + 3 pages + always-available navigation.
7. Add persistence/reload behavior and polling loops.
8. Add tests and a short usage section in `1_piele_docs/planui.md`.

## Assumptions and Defaults
- App runs in already-activated environment and uses plain `snakemake`/`python`.
- Poll intervals default to 5 seconds for queue and results refresh.
- Results page is new-format only.
- No overwrite behavior is allowed for existing output folders.
- Bilingual support uses static key-based translations (EN/RO), no external i18n dependency.





---
# Source: vault\Piele-Docs\PLAN.md

==================================================================
## Romania Winter 2019 Stress Scenario (Baseline + Shocked) in PyPSA-Eur

### Summary
Implement two new reproducible runs and one comparison report:
1. `Baseline` run with no shocks.
2. `Stress` run with all requested Romania shocks in one solve.
3. Automated post-processing that emits required CSVs, PNG/PDF figures, and a 1-page assumptions/limitations note.

This plan uses:
- Geographic scope: `RO + BG + HU + RS` (shocks applied only to Romania).
- Time window in snapshots (UTC): **2019-01-13 22:00 to 2019-01-20 22:00**, `inclusive: left`, hourly (168 snapshots).  
  This matches local EET: **2019-01-14 00:00 to 2019-01-21 00:00**.
- Hybrid ops mode: no generation/storage/H2 expansion, but limited transmission expansion (`+500 MW` per line/link).
- SCADA proxy: ramp cap `10%/h` for first 24h, then `25%/h` for next 48h.

### Files To Add
1. `config/adversarial/romania_2019_winter_baseline.yaml`
2. `config/adversarial/romania_2019_winter_stress.yaml`
3. `scripts/romania_winter_stress.py`
4. `scripts/report_romania_winter_stress.py`
5. `run_romania_winter_stress.py`
6. `test/test_romania_winter_stress.py`

### Files To Modify
1. `scripts/solve_network.py`  
   Add pre-model shock application call and post-model custom constraints call.

---

### 1) Config Implementation

Create `baseline` and `stress` configs with:
1. `run.name` as:
   - `romania-2019-winter-baseline`
   - `romania-2019-winter-stress`
2. `countries: [RO, BG, HU, RS]`
3. `scenario.clusters: [10]`, `scenario.opts: ['']`
4. `snapshots.start: '2019-01-13 22:00'`, `snapshots.end: '2019-01-20 22:00'`, `snapshots.inclusive: 'left'`
5. `clustering.temporal.resolution_elec: false` (hourly)
6. `atlite.default_cutout: europe-2019-era5` and matching `atlite.cutouts.europe-2019-era5` block
7. `electricity.extendable_carriers.Generator/StorageUnit/Store/Link: []`
8. `lines.max_extension: 500`, `links.max_extension: 500`
9. `solving.options.load_shedding: 100000` (EUR/MWh)
10. `electricity.renewable_carriers` includes hydro (`hydro` present)

Add `stress_test` section only in stress config:
1. `enable: true`
2. `country: RO`
3. `load_factor_full_window: 1.12`
4. `hydro_factor_full_window: 0.60`
5. `gas_factor_first_72h: 0.70`
6. `scada.tight_hours: 24`, `scada.relaxed_hours: 48`
7. `scada.ramp_tight_per_hour: 0.10`, `scada.ramp_relaxed_per_hour: 0.25`
8. `import_cap.zero_hours: 48`, `import_cap.half_hours: 48`, `import_cap.half_factor: 0.5`

---

### 2) Shock Logic Module (`scripts/romania_winter_stress.py`)

Implement pure functions:

1. `apply_timeseries_shocks(n, snapshots, cfg)`  
   Applies pre-model series changes:
   - Load shock: multiply `n.loads_t.p_set` for RO loads by `1.12` over all 168h.
   - Hydro shock: for RO hydro generators (`ror`, `hydro`) scale `p_max_pu` by `0.60`; for RO hydro storage (`hydro`, `PHS`) scale inflow (and storage dispatch availability if present) by `0.60`.
   - Gas shock: for RO gas generators (`OCGT`, `CCGT`) scale `p_max_pu` by `0.70` for first 72h only.
   - Add validation logs if expected components are absent.

2. `add_scada_proxy_constraints(n, snapshots, cfg)`  
   Adds linear ramp constraints on RO controllable generators:
   - Hours 1-24: `|p_t - p_{t-1}| <= 0.10 * p_nom_effective`
   - Hours 25-72: `|p_t - p_{t-1}| <= 0.25 * p_nom_effective`
   - `p_nom_effective` uses decision variable for extendables, static value for fixed assets.

3. `add_import_cap_constraints(n, snapshots, cfg)`  
   Adds directional constraints on RO border interconnectors:
   - First 48h: inbound cap = 0% of line/link capacity.
   - Next 48h: inbound cap = 50% of line/link capacity.
   - Remaining 72h: no additional import cap.
   - Apply to both AC lines (`Line-s`) and links (`Link-p`) with orientation-aware sign.
   - If no RO border assets exist, log and expose flag for reporting fallback note.

---

### 3) Integrate With Solver (`scripts/solve_network.py`)

1. Import functions from `scripts/romania_winter_stress.py`.
2. In `prepare_network(...)`, after snapshot clipping and before model creation:
   - If `config.get("stress_test", {}).get("enable")`, call `apply_timeseries_shocks(...)`.
3. In `extra_functionality(...)`:
   - If stress enabled, call `add_scada_proxy_constraints(...)` then `add_import_cap_constraints(...)`.
4. Keep behavior unchanged when `stress_test.enable` is false or absent.

---

### 4) Reporting & Deliverables (`scripts/report_romania_winter_stress.py`)

CLI inputs:
1. `--baseline-net`
2. `--scenario-net`
3. `--country RO`
4. `--outdir results/romania-2019-winter-stress-comparison`

Generate CSVs:
1. `ens_summary.csv` with ENS MWh, shedding hours, max shedding MW.
2. `system_cost_comparison.csv` with baseline cost, scenario cost, delta absolute and percent.
3. `daily_net_imports_mwh.csv` (baseline/scenario) aggregated by day.
4. `interconnector_flow_congestion.csv` with mean/p95/max loading and congested hours.
5. `generation_mix_mwh.csv` by technology and case.
6. `curtailment_mwh.csv` by technology and case.
7. `lmp_summary_ro.csv` with mean, p95, max (optional, always attempted).

Generate figures in both PNG and PDF:
1. `fig_01_shedding_timeseries.(png|pdf)`
2. `fig_02_daily_net_imports.(png|pdf)`
3. `fig_03_generation_mix.(png|pdf)`
4. `fig_04_interconnector_loading.(png|pdf)`
5. `fig_05_ro_price_distribution.(png|pdf)` if LMP available.

Generate 1-page note:
1. `assumptions_limitations.md`  
   Must include exact dates, SCADA proxy formula, import-constraint formulation, fallback behavior if missing interconnectors, and interpretation limits.

Implementation detail for daily aggregation:
1. Treat snapshots as UTC.
2. Convert to `Europe/Bucharest` for daily MWh/day grouping to align with local-window reporting.

---

### 5) Run Orchestration (`run_romania_winter_stress.py`)

Implement a single script that:
1. Unlocks Snakemake for baseline config.
2. Solves baseline target `results/romania-2019-winter-baseline/networks/base_s_10_elec_.nc`.
3. Unlocks Snakemake for stress config.
4. Solves stress target `results/romania-2019-winter-stress/networks/base_s_10_elec_.nc`.
5. Runs `scripts/report_romania_winter_stress.py`.
6. Prints output paths for all deliverables.

Use `conda run -n pypsa-eur ...` in this repo (detected env naming).

---

### 6) Tests (`test/test_romania_winter_stress.py`)

Add unit tests on synthetic tiny networks:
1. `test_apply_timeseries_shocks_windows`  
   Verifies +12% load full window, hydro 60% full window, gas 70% first 72h only.
2. `test_scada_constraints_created`  
   Verifies constraint names exist and are indexed over expected snapshot ranges.
3. `test_import_constraints_directional`  
   Verifies inbound RO caps for both line orientations and links.
4. `test_stress_disabled_no_changes`  
   Verifies no-op path.

No full optimization run in tests.

---

### 7) Acceptance Criteria

1. Baseline and stress scenarios both solve for exactly 168 hourly snapshots.
2. Stress run applies all five requested shocks with exact hour windows.
3. Load shedding exists as explicit high-penalty carrier and ENS metrics are non-null.
4. Comparison output folder contains all required CSVs and PNG/PDF figures.
5. 1-page assumptions/limitations note exists and documents SCADA proxy and limitations.
6. Unit tests for shock and constraint logic pass.

---

### Public Interfaces / Schema Additions

1. New config block: `stress_test`
2. New script CLI: `scripts/report_romania_winter_stress.py --baseline-net ... --scenario-net ... --country ... --outdir ...`
3. New runner script: `run_romania_winter_stress.py`

---

### Assumptions And Defaults Locked

1. UTC snapshot window is used in config: `2019-01-13 22:00` to `2019-01-20 22:00` (`inclusive: left`).
2. Local EET interpretation is `2019-01-14 00:00` to `2019-01-21 00:00`.
3. Country set is exactly `[RO, BG, HU, RS]`.
4. Hybrid mode means no generation/storage expansion and limited grid expansion (`+500 MW` per asset).
5. SCADA proxy uses moderate levels (`10%/h`, then `25%/h`).
6. If 2019 cutout is missing locally, workflow retrieves `europe-2019-era5` from configured archive source.





---
# Source: vault\Piele-Docs\TEMPLATE_ARCHITECTURE.md

==================================================================
# Year-Specific YAML Template Architecture

## Overview

The scenario manager now supports **intelligent template selection** based on the chosen cutout year. When you select 2023 from the UI dropdown, the system automatically loads the 2023-specific YAML template with pre-configured settings optimized for 2023 weather data.

## Template Files

### Primary Templates

| Template File | Purpose | Used When |
|---|---|---|
| `scenario_template.yaml` | Default template for 2020 cutout year | Cutout year = 2020 (default) |
| `scenario_template_2023.yaml` | Optimized template for 2023 cutout year | Cutout year = 2023 |

Both templates reside in: `1_piele_docs/`

### Template Selection Logic

```
User selects cutout_year from UI dropdown
        ↓
build_working_config() or build_configs() called with ScenarioInputs
        ↓
resolve_template_path(template_path, inputs.cutout_year)
        ↓
If cutout_year == "2020" → Use scenario_template.yaml (default)
If cutout_year == "2023" → Use scenario_template_2023.yaml (if exists, else default)
        ↓
load_template(resolved_path)
        ↓
Configuration applied with year-appropriate defaults
```

## Configuration Differences

### scenario_template.yaml (2020)
```yaml
snapshots:
  start: "2020-12-01"
  end: "2020-12-08"

electricity:
  estimate_renewable_capacities:
    year: 2020

atlite:
  default_cutout: europe-2020-sarah3-era5
```

### scenario_template_2023.yaml (2023)
```yaml
snapshots:
  start: "2023-01-15"
  end: "2023-01-22"

electricity:
  estimate_renewable_capacities:
    year: 2023

atlite:
  default_cutout: europe-2023-sarah3-era5
```

## How It Works

### Step-by-Step Flow

1. **User Opens Scenario Manager UI**
   - Loads default template path: `1_piele_docs/scenario_template.yaml`

2. **User Selects Cutout Year**
   - Dropdown shows: [2020, 2023]
   - Selection stored in `cutout_year` StringVar

3. **User Provides Scenario Details**
   - Sets all other parameters (clusters, solver, countries, stress parameters, etc.)

4. **User Clicks "Build Config" or "Enqueue Run"**
   - Calls `build_working_config()` or `build_configs()`
   - Passes `inputs.cutout_year` to function

5. **System Resolves Template Path**
   - Calls `resolve_template_path(template_path, inputs.cutout_year)`
   - Logic:
     ```python
     if cutout_year == "2020":
         return base_template_path  # scenario_template.yaml
     elif cutout_year == "2023":
         year_specific = parent_dir / "scenario_template_2023.yaml"
         if year_specific.exists():
             return year_specific
         return base_template_path  # Fallback if not found
     ```

6. **System Loads Selected Template**
   - `load_template()` reads YAML from resolved path
   - Returns configuration dictionary

7. **Configuration Applied**
   - User inputs merged with template defaults
   - Cutout year validated and applied via `_apply_cutout_to_config()`
   - Generated config has correct settings for chosen year

8. **Run Execution**
   - Generated config sent to Snakemake
   - Snakemake uses europe-20XX-sarah3-era5 cutout file

## Implementation Details

### resolve_template_path() Function

Location: `1_piele_dashboard/scenario_manager/config_builder.py`

```python
def resolve_template_path(base_template_path: Path, cutout_year: str = "2020") -> Path:
    """Resolve template path based on cutout year.
    
    Intelligently selects year-specific templates:
    - If cutout_year = "2023", looks for scenario_template_2023.yaml
    - If cutout_year = "2020", uses default scenario_template.yaml
    - Falls back to base template if year-specific not found
    
    Args:
        base_template_path: Path to default template (e.g., scenario_template.yaml)
        cutout_year: Year as string ("2020" or "2023")
    
    Returns:
        Path to the template file to use
    """
```

### Integration Points

1. **build_working_config()** (Line ~360)
   ```python
   resolved_template_path = resolve_template_path(template_path, inputs.cutout_year)
   template_cfg = load_template(resolved_template_path)
   ```

2. **build_configs()** (Line ~390)
   ```python
   resolved_template_path = resolve_template_path(template_path, inputs.cutout_year)
   template_cfg = load_template(resolved_template_path)
   ```

## Why Year-Specific Templates?

### Advantages

✅ **Appropriate Defaults** - Each year gets realistic default snapshot dates
✅ **Correct Electricity Year** - Renewable capacity estimates use matching year
✅ **Pre-Configured Cutouts** - Cutout name set correctly from the start
✅ **Flexibility** - Easy to add 2024, 2025, etc. in future
✅ **Clarity** - Users understand they're working with year-consistent data
✅ **Fallback Safety** - Missing year-specific template falls back gracefully

### Example Scenario

**User creates 2023 winter stress scenario:**

```
1. Selects "Cutout year: 2023"
2. System auto-selects scenario_template_2023.yaml
3. Template has:
   - snapshots: 2023-01-15 to 2023-01-22 (2023 winter baseline)
   - electricity.year: 2023 (correct for capacity estimates)
   - atlite.default_cutout: europe-2023-sarah3-era5 (correct weather file)
4. User accepts or overrides these defaults as needed
5. Config generated with year-consistent values
6. Simulation runs with 2023 weather data
```

## Adding New Year Templates

To add support for year 2024 or later:

### 1. Create Template File
```bash
cp 1_piele_docs/scenario_template_2023.yaml 1_piele_docs/scenario_template_2024.yaml
```

### 2. Update Contents
```yaml
snapshots:
  start: "2024-01-15"  # Update to 2024 dates
  end: "2024-01-22"

electricity:
  estimate_renewable_capacities:
    year: 2024  # Update year

atlite:
  default_cutout: europe-2024-sarah3-era5  # Update cutout name
  cutouts:
    europe-2024-sarah3-era5:
      time:
        - "2024"
        - "2024"
```

### 3. Update UI Dropdown
```python
# scenario_manager_ui.py, line ~133
("cutout_year", self.cutout_year, ["2020", "2023", "2024"]),
```

### 4. Ensure Cutout File Exists
```bash
# Must have: data/cutout/archive/v0.8/europe-2024-sarah3-era5.nc
```

### 5. Update Template Validation (Optional)
```python
# config_builder.py, _apply_cutout_to_config()
if cutout_year not in ("2020", "2023", "2024"):
    raise ValueError(...)
```

That's it! The `resolve_template_path()` function will automatically detect and use `scenario_template_2024.yaml`.

## Debugging Template Issues

### Template Not Found
If system falls back to default template:
```bash
# Check file exists
ls -la 1_piele_docs/scenario_template_2023.yaml

# Check file permissions (must be readable)
chmod 644 1_piele_docs/scenario_template_2023.yaml
```

### Wrong Template Loaded
Add debug logging to verify:
```python
# In config_builder.py
import logging
logger = logging.getLogger(__name__)

def resolve_template_path(...):
    resolved = ...
    logger.info(f"Using template: {resolved}")
    return resolved
```

### Snapshot Dates Wrong
If defaults are not from selected year:
- Check `scenario_template_2023.yaml` has correct snapshots section
- Verify YAML syntax is valid: `yamllint 1_piele_docs/scenario_template_2023.yaml`

## File Locations

```
pypsa-eur/
├── 1_piele_dashboard/
│   ├── scenario_manager_ui.py          # UI dropdown (lines ~60, ~133)
│   └── scenario_manager/
│       └── config_builder.py            # resolve_template_path() function
├── 1_piele_docs/
│   ├── scenario_template.yaml           # Default (2020)
│   ├── scenario_template_2023.yaml      # Year-specific (2023)
│   └── CUTOUT_CONFIG.md                 # User documentation
└── data/
    └── cutout/archive/v0.8/
        ├── europe-2020-sarah3-era5.nc
        └── europe-2023-sarah3-era5.nc
```

## Best Practices

1. **Keep Templates Synchronized**
   - Both templates should have identical structure
   - Only differences: year values, snapshot dates, cutout names

2. **Validate YAML Syntax**
   ```bash
   python -c "import yaml; yaml.safe_load(open('scenario_template_2023.yaml'))"
   ```

3. **Version Control**
   - Track both template files in git
   - Document any customizations

4. **Test New Templates**
   - Create test scenario with new template
   - Verify cutout year, snapshot dates, electricity year match
   - Check generated config before running Snakemake

5. **Fallback Planning**
   - Always keep default `scenario_template.yaml`
   - Year-specific templates should be optional enhancement
   - Missing template gracefully falls back to default

## Technical Architecture

```
UI Layer
  ↓
build_working_config(inputs, template_path)
  ↓
resolve_template_path(template_path, inputs.cutout_year)
  ├─ 2020 → scenario_template.yaml
  └─ 2023 → scenario_template_2023.yaml (if exists)
  ↓
load_template(resolved_path)
  ↓
_base_config_from_inputs(template_cfg, working_yaml)
  ↓
_apply_inputs_to_config(...)
  ↓
_apply_cutout_to_config(...)
  ↓
Generated YAML written to config/adversarial/generated/
```

## Support & Troubleshooting

For issues with year-specific templates:
1. Verify both template files exist and are readable
2. Check template YAML syntax: `yamllint scenario_template_*.yaml`
3. Verify cutout files exist: `ls data/cutout/archive/v0.8/europe-*.nc`
4. Check UI dropdown has year option selected
5. Verify generated config has correct cutout name and snapshot dates
6. See CUTOUT_CONFIG.md for user-level troubleshooting

---

**Implementation Date:** January 24, 2025  
**Version:** 1.0  
**Status:** Production Ready





---
# Source: PLAN.md

==================================================================
# PlanUI: Scenario Wizard + Run Manager + New-Format Results Viewer

## Summary
Build a new Tkinter desktop application that lets you create scenarios via guided controls or advanced YAML editing, enqueue and run Snakemake workflows without blocking navigation, and view only the new report-format outputs (like `results/romania-2020-winter-stress-comparison`) from a self-updating results list.  
The implementation will also add a read-only canonical template in docs and produce implementation documentation at `1_piele_docs/planui.md`.

## Scope
- In scope: new Python app, config generation, queue-based run execution, spinner/status UI, always-available page navigation, self-updating new-format results page, bilingual toggle (EN/RO), persistent run/history state.
- Out of scope: auto-reattach to already-running OS processes after app restart, legacy-format results rendering, overwrite behavior for existing output names.

## Target Files
- `1_piele_docs/planui.md`
- `1_piele_docs/scenario_template.yaml`
- `1_piele_dashboard/scenario_manager_ui.py`
- `1_piele_dashboard/scenario_manager/types.py`
- `1_piele_dashboard/scenario_manager/config_builder.py`
- `1_piele_dashboard/scenario_manager/run_manager.py`
- `1_piele_dashboard/scenario_manager/results_index.py`
- `1_piele_dashboard/scenario_manager/state_store.py`
- `1_piele_dashboard/scenario_manager/i18n.py`

## App Architecture
1. Navigation shell:
- Sidebar/top nav with pages always accessible: `Scenario Builder`, `Runs`, `Results`.
- Global language toggle EN/RO.
- Global active-run spinner indicator.

2. Scenario Builder page:
- Run mode selector: `Paired (baseline+scenario)` or `Single scenario with reference baseline`.
- Two editing modes:
- `Core + Stress Controls`: structured form fields update an in-memory working config.
- `Advanced YAML`: editable working YAML panel plus read-only canonical template panel.
- Template source is fixed: `1_piele_docs/scenario_template.yaml`.
- Template file is never modified.

3. Runs page:
- Job submission form and queue list.
- Status lifecycle: `queued`, `running`, `succeeded`, `failed`, `cancelled`, `interrupted`.
- One active job max; additional jobs queued.
- Per-job logs path and progress text.
- Spinner visible while any job is `running`.

4. Results page:
- Auto-refresh index (polling) of new-format result folders only.
- Selection list from `results/` updates while app runs.
- Native tabs for selected result:
- `Summary` (cost delta, ENS, imports, price stats).
- `CSV Data` (dropdown/table preview for required CSVs).
- `Figures` (PNG picker and image viewer).
- `Assumptions` (markdown/text panel).

## Run Flows
1. Paired flow:
- Generate `baseline` config by cloning scenario config and forcing `stress_test.enable=false`.
- Generate `scenario` config with stress settings.
- Execute commands in active environment:
- `snakemake --unlock --configfile <baseline_cfg>`
- `snakemake -c all <baseline_target_nc> --configfile <baseline_cfg>`
- `snakemake --unlock --configfile <scenario_cfg>`
- `snakemake -c all <scenario_target_nc> --configfile <scenario_cfg>`
- `python scripts/report_romania_winter_stress.py --baseline-net <baseline_target_nc> --scenario-net <scenario_target_nc> --country <country> --outdir results/<output_name>`

2. Single flow:
- Require user-selected solved baseline network from discovered list (`results/*/networks/*.nc`).
- Run only scenario config solve, then report using selected baseline network:
- `snakemake --unlock --configfile <scenario_cfg>`
- `snakemake -c all <scenario_target_nc> --configfile <scenario_cfg>`
- `python scripts/report_romania_winter_stress.py --baseline-net <selected_baseline_nc> --scenario-net <scenario_target_nc> --country <country> --outdir results/<output_name>`

## Naming and Validation Rules
- User-provided output name is required.
- If `results/<output_name>` exists, submission is blocked and rename is required.
- Generated config files go to `config/adversarial/generated/`.
- Run names derived from user scenario slug to keep uniqueness and traceability.
- Required new-format CSVs for result eligibility:
- `system_cost_comparison.csv`
- `generation_mix_mwh.csv`
- `lmp_summary_ro.csv`
- `ens_summary.csv`
- `curtailment_mwh.csv`
- `daily_net_imports_mwh.csv`
- `interconnector_flow_congestion.csv`

## Persistent State
- Persist queue/history/settings in JSON at app-level state file.
- On restart:
- Reload completed/failed history.
- Mark previously `running` jobs as `interrupted` (no auto-reattach).
- Keep language and last UI selections.

## Public Interfaces and Types
- `ScenarioInputs`: run mode, names, country, snapshots, clusters, solver, stress params, reference baseline path.
- `ConfigBuildResult`: generated config file paths, run names, expected network targets.
- `JobSpec`: command list, output_name, mode, created_at.
- `JobRecord`: job_id, status, timestamps, output_dir, log_path, exit_code, error_summary.
- `ResultEntry`: folder path, detected files, timestamp, validity flags.
- `scan_new_format_results(results_dir) -> list[ResultEntry]`
- `build_configs(inputs, template_path) -> ConfigBuildResult`
- `enqueue(job_spec)`, `cancel(job_id)`, `load_state()`, `save_state()`.

## Test Cases and Scenarios
1. Config/template:
- Template hash unchanged after both editing modes.
- Paired build creates two YAMLs and baseline has `stress_test.enable=false`.
- Single build requires valid baseline network path.

2. Queue/runtime:
- Submitting two jobs yields one `running`, one `queued`.
- Navigation remains responsive during long running subprocess.
- Failed command marks job `failed` with captured stderr snippet.
- Restart reloads history and converts stale `running` to `interrupted`.

3. Results indexing/viewing:
- Only folders with all 7 required CSVs appear.
- New result folder appears without restart during polling.
- Summary metrics parse correctly from sample comparison output.
- Figures/assumptions tabs handle missing optional files gracefully.

4. UX rules:
- Bilingual toggle updates visible labels on all pages.
- Name conflict blocks submission.
- Spinner appears only when any job is active.

## Implementation Sequence
1. Create `1_piele_docs/scenario_template.yaml` and `1_piele_docs/planui.md`.
2. Implement shared types, i18n map, and state store.
3. Implement config builder with immutable-template workflow.
4. Implement run manager queue and subprocess orchestration.
5. Implement results indexer and parser for required new-format files.
6. Build Tkinter shell + 3 pages + always-available navigation.
7. Add persistence/reload behavior and polling loops.
8. Add tests and a short usage section in `1_piele_docs/planui.md`.

## Assumptions and Defaults
- App runs in already-activated environment and uses plain `snakemake`/`python`.
- Poll intervals default to 5 seconds for queue and results refresh.
- Results page is new-format only.
- No overwrite behavior is allowed for existing output folders.
- Bilingual support uses static key-based translations (EN/RO), no external i18n dependency.





---
# Source: PROJECT_ORGANIZATION.md

==================================================================
# PyPSA-Eur Romania - Project Organization Guide

Welcome to the PyPSA-Eur Romania Analysis project! This guide explains the new folder structure created January 2026, organizing all custom analysis tools and workflows.

## 📁 Folder Structure Overview

```
pypsa-eur/
│
├── 📊 1_piele_dashboard/            → Interactive visualization dashboards
│   ├── visualize_scenarios_ui_v2.py    (v1 - baseline vs. stress)
│   ├── visualize_scenarios_ui_v2.py (v2 - dynamic scenarios)
│   ├── test_legacy_display.py       (data validation)
│   └── README.md                    (full guide)
│
├── 🚀 1_piele_runners/              → Scenario execution scripts
│   ├── run_all_scenarios.py         (execute all 5 seasons)
│   ├── run_remaining_scenarios.py   (execute 3 seasons)
│   ├── run_romania_winter_stress.py (baseline + stress)
│   ├── run_romania_winter_stress_direct.py
│   ├── *.bat files                  (Windows batch runners)
│   └── README.md                    (full guide)
│
├── 📈 1_piele_analysis/             → Results processing & reporting
│   ├── generate_configs.py          (create scenario configs)
│   ├── generate_adversarial_configs.py (create 10 stress tests)
│   ├── interpret_results.py         (analyze network results)
│   ├── explore_scenarios.py         (discover available scenarios)
│   ├── summarize_results.py         (generate summary tables)
│   ├── run_summary.py               (batch processing)
│   ├── analyze_scenario_11.py       (failure analysis)
│   └── README.md                    (full guide)
│
├── 🔍 1_piele_diagnostics/          → Testing & validation tools
│   ├── check_csv.py                 (validate CSV data)
│   ├── check_romania.py             (validate configs)
│   ├── check_url.py                 (test data sources)
│   ├── test_snakemake.ps1           (test workflow DAG)
│   └── README.md                    (full guide)
│
├── 📥 1_piele_data_download/        → External data acquisition
│   ├── download_cutout.py           (download weather data)
│   ├── download_zenodo_files.py     (download datasets)
│   └── README.md                    (full guide)
│
├── 📚 1_piele_docs/                 → Project documentation
│   ├── PLAN.md                      (original project plan)
│   ├── DASHBOARD_README.md          (v1 guide)
│   ├── VISUALIZER_COMPARISON.md     (v1 vs v2)
│   ├── DASHBOARD_V2_IMPLEMENTATION.md (v2 technical)
│   ├── FORMAT_SUPPORT.md            (data format specs)
│   ├── romania_config_explanation.md (config guide EN)
│   ├── romania_config_explanation_ro.md (config guide RO)
│   ├── results_summary.md           (example results)
│   ├── scenario_11_failure_log.md   (failure analysis)
│   ├── README2.md & README3.md      (supplementary)
│   └── README.md                    (docs index)
│
├── 🌍 Original PyPSA-Eur Folders
│   ├── config/                      (configuration files)
│   ├── scripts/                     (main workflow scripts)
│   ├── rules/                       (Snakemake rules)
│   ├── data/                        (input datasets)
│   ├── results/                     (scenario outputs)
│   ├── resources/                   (preprocessed data)
│   ├── benchmarks/                  (performance data)
│   ├── doc/                         (original documentation)
│   └── ... (other standard folders)
│
└── 📝 Root Level Files
    ├── README.md                     (main project readme)
    ├── Snakefile                     (workflow definition)
    ├── pixi.toml                     (dependency management)
    └── ... (other config files)
```

---

## 🚀 Quick Start Workflows

### Workflow 1: View Existing Results
**Time:** 2 minutes | **Skills:** None required

```bash
# Navigate to dashboard folder and run v2
cd 1_piele_dashboard
python visualize_scenarios_ui_v2.py

# Tips:
# 1. Select scenario from dropdown
# 2. Click tabs to explore data
# 3. Use "Browse" for custom folder selection
```

**See:** [1_piele_dashboard/README.md](1_piele_dashboard/README.md)

---

### Workflow 2: Run New Scenarios
**Time:** 1-6 hours | **Skills:** PyPSA, Snakemake basic knowledge

```bash
# 1. Validate environment
cd 1_piele_diagnostics
python check_romania.py

# 2. Run baseline scenario only (quick test)
cd ../1_piele_runners
run_baseline_only.bat

# 3. View results with dashboard
cd ../1_piele_dashboard
python visualize_scenarios_ui_v2.py
```

**See:** [1_piele_runners/README.md](1_piele_runners/README.md)

---

### Workflow 3: Analyze & Generate Reports
**Time:** 30 minutes | **Skills:** Python, data analysis

```bash
# 1. Generate scenario summaries
cd 1_piele_analysis
python run_summary.py

# 2. Explore available scenarios
python explore_scenarios.py

# 3. Interpret specific results
python interpret_results.py

# 4. Visualize outputs
cd ../1_piele_dashboard
python visualize_scenarios_ui_v2.py
```

**See:** [1_piele_analysis/README.md](1_piele_analysis/README.md)

---

### Workflow 4: Stress-Test Scenarios
**Time:** 2+ hours | **Skills:** Advanced - Network understanding

```bash
# 1. Generate adversarial configs
cd 1_piele_analysis
python generate_adversarial_configs.py

# 2. Run specific scenario via runners
cd ../1_piele_runners
python run_romania_winter_stress.py

# 3. Analyze failure cases
cd ../1_piele_analysis
python analyze_scenario_11.py
```

**See:** [1_piele_analysis/README.md](1_piele_analysis/README.md)

---

### Workflow 5: Troubleshoot Issues
**Time:** 15-45 minutes | **Skills:** Debugging

```bash
# 1. Check data sources
cd 1_piele_diagnostics
python check_url.py

# 2. Validate configurations
python check_romania.py

# 3. Check output data quality
python check_csv.py

# 4. Test Snakemake workflow
.\test_snakemake.ps1
```

**See:** [1_piele_diagnostics/README.md](1_piele_diagnostics/README.md)

---

## 📚 Finding What You Need

### I want to...

**View existing simulation results**
→ See [1_piele_dashboard/README.md](1_piele_dashboard/README.md)

**Run a new scenario**
→ See [1_piele_runners/README.md](1_piele_runners/README.md)

**Generate reports & analysis**
→ See [1_piele_analysis/README.md](1_piele_analysis/README.md)

**Validate data or configuration**
→ See [1_piele_diagnostics/README.md](1_piele_diagnostics/README.md)

**Download missing datasets**
→ See [1_piele_data_download/README.md](1_piele_data_download/README.md)

**Understand the project**
→ See [1_piele_docs/README.md](1_piele_docs/README.md)

**Configure a scenario**
→ See [1_piele_docs/romania_config_explanation.md](1_piele_docs/romania_config_explanation.md)

**Understand data formats**
→ See [1_piele_docs/FORMAT_SUPPORT.md](1_piele_docs/FORMAT_SUPPORT.md)

---

## 🔄 Typical User Journeys

### Journey 1: Quick Visualization
```
User: "I just want to see the results"

Steps:
1. cd 1_piele_dashboard
2. python visualize_scenarios_ui_v2.py
3. Select scenario → Explore tabs

Time: 2 minutes
Skills: None
Result: Interactive dashboard open
```

---

### Journey 2: Run & Analyze
```
User: "I want to run a scenario and see results"

Steps:
1. cd 1_piele_runners
2. run_baseline_only.bat (quick test)
3. cd ../1_piele_analysis
4. python run_summary.py
5. cd ../1_piele_dashboard
6. python visualize_scenarios_ui_v2.py

Time: 1-2 hours
Skills: Basic
Result: New scenario results visualized
```

---

### Journey 3: Full Workflow
```
User: "I want to do everything"

Steps:
1. cd 1_piele_diagnostics
   python check_romania.py    (validate)
2. cd ../1_piele_runners
   run_all_scenarios.py       (run all 5)
3. cd ../1_piele_analysis
   python run_summary.py      (analyze)
4. cd ../1_piele_dashboard
   python visualize_scenarios_ui_v2.py (view)

Time: 6-8 hours
Skills: Intermediate
Result: Complete analysis suite
```

---

### Journey 4: Troubleshoot
```
User: "Something failed, help!"

Steps:
1. cd 1_piele_diagnostics
   python check_url.py        (data sources?)
   python check_romania.py    (config?)
   python check_csv.py        (data integrity?)
   .\test_snakemake.ps1       (workflow?)
2. Check error logs in logs/
3. Consult 1_piele_docs/scenario_11_failure_log.md

Time: 15-45 minutes
Skills: Debugging
Result: Issue identified & resolved
```

---

## 📖 Documentation Map

| Document | Purpose | Link |
|----------|---------|------|
| **Getting Started** | New users intro | [1_piele_docs/PLAN.md](1_piele_docs/PLAN.md) |
| **Dashboard Guide** | UI walkthrough | [1_piele_docs/DASHBOARD_README.md](1_piele_docs/DASHBOARD_README.md) |
| **Data Formats** | Understand data structure | [1_piele_docs/FORMAT_SUPPORT.md](1_piele_docs/FORMAT_SUPPORT.md) |
| **Config Guide** | Modify scenarios | [1_piele_docs/romania_config_explanation.md](1_piele_docs/romania_config_explanation.md) |
| **v2 Technical** | Implementation details | [1_piele_docs/DASHBOARD_V2_IMPLEMENTATION.md](1_piele_docs/DASHBOARD_V2_IMPLEMENTATION.md) |
| **Failures** | Known issues | [1_piele_docs/scenario_11_failure_log.md](1_piele_docs/scenario_11_failure_log.md) |

---

## ⚡ Key Features by Folder

| Folder | Features | Status |
|--------|----------|--------|
| **1_piele_dashboard/** | v1+v2 visualization, 6 taburi, live data | ✅ Production |
| **1_piele_runners/** | 7 execution scripts, batch+Python | ✅ Tested |
| **1_piele_analysis/** | Config generation, summaries, reporting | ✅ Ready |
| **1_piele_diagnostics/** | Validation, testing, troubleshooting | ✅ Ready |
| **1_piele_data_download/** | ERA5 weather, Zenodo datasets | ✅ Ready |
| **1_piele_docs/** | Comprehensive guides (EN/RO) | ✅ Complete |

---

## 🎯 Organization Benefits

**Before (Root Directory - Cluttered):**
```
pypsa-eur/
├── visualize_scenarios_ui_v2.py     (What is this?)
├── visualize_scenarios_ui_v2.py  (Different version?)
├── download_cutout.py            (Data related?)
├── run_all_scenarios.py          (Runner?)
├── generate_adversarial_configs.py
├── check_csv.py                  (Validation?)
├── analyze_scenario_11.py        (Analysis?)
└── 20+ more files...
```
**Problem:** No clear purpose, hard to navigate

---

**After (Organized Structure):**
```
pypsa-eur/
├── 📊 1_piele_dashboard/        → All visualization (3 files)
├── 🚀 1_piele_runners/          → All runners (7 files)
├── 📈 1_piele_analysis/         → All analysis (6 files)
├── 🔍 1_piele_diagnostics/      → All validation (4 files)
├── 📥 1_piele_data_download/    → All downloads (2 files)
└── 📚 1_piele_docs/             → All documentation (12+ files)
```
**Benefit:** Clear purpose, easy to find, logical workflow at top

---

## 🔗 Integration Points

```
workflow: data → run → analyze → visualize → understand

1. Data Download (1_piele_data_download/)
   └─→ Check with 1_piele_diagnostics/check_url.py
   
2. Configuration (config/)
   └─→ Validate with 1_piele_diagnostics/check_romania.py
   
3. Scenario Execution (1_piele_runners/)
   └─→ Check with 1_piele_diagnostics/check_csv.py
   
4. Analysis (1_piele_analysis/)
   └─→ Generate summaries
   
5. Visualization (1_piele_dashboard/)
   └─→ v2 auto-detects format & renders
   
6. Understanding (1_piele_docs/)
   └─→ Reference throughout
```

---

## 📋 Folder Checklist

After organizing, verify:

- [x] **1_piele_dashboard/** - Contains 3 .py files + README
- [x] **1_piele_runners/** - Contains 7 script files + README
- [x] **1_piele_analysis/** - Contains 6 .py files + README
- [x] **1_piele_diagnostics/** - Contains 4 validation files + README
- [x] **1_piele_data_download/** - Contains 2 .py files + README
- [x] **1_piele_docs/** - Contains 12+ .md files + README
- [x] All READMEs created with clear purposes
- [x] Cross-references between folders working
- [x] Original PyPSA-Eur structure preserved

---

## 🎓 Learning Path

**Beginner (Want to view results):**
1. Read: [1_piele_dashboard/README.md](1_piele_dashboard/README.md)
2. Run: `python 1_piele_dashboard/visualize_scenarios_ui_v2.py`
3. Explore: Click through tabs

**Intermediate (Want to run scenarios):**
1. Read: [1_piele_runners/README.md](1_piele_runners/README.md)
2. Run: `python 1_piele_runners/run_baseline_only.bat`
3. Analyze: See [1_piele_analysis/README.md](1_piele_analysis/README.md)
4. Visualize: Use dashboard

**Advanced (Want to modify everything):**
1. Read: [1_piele_docs/README.md](1_piele_docs/README.md)
2. Understand: [1_piele_docs/PLAN.md](1_piele_docs/PLAN.md)
3. Configure: Edit `config/*.yaml`
4. Generate: Use [1_piele_analysis/generate_adversarial_configs.py](1_piele_analysis/generate_adversarial_configs.py)
5. Run: Use [1_piele_runners/](1_piele_runners/)
6. Analyze: Use [1_piele_analysis/](1_piele_analysis/)

---

## 📝 Last Updated

**Date:** January 2026  
**Changes:** Project reorganization after 7 January 2026  
**Files Organized:** 30+ custom analysis files into 6 logical folders  
**Documentation:** 12+ files with cross-references

---

## 🆘 Need Help?

1. **Can't find a file?** → Check [1_piele_docs/README.md](1_piele_docs/README.md) (file index)
2. **How to use dashboard?** → See [1_piele_dashboard/README.md](1_piele_dashboard/README.md)
3. **How to run scenarios?** → See [1_piele_runners/README.md](1_piele_runners/README.md)
4. **Data validation?** → See [1_piele_diagnostics/README.md](1_piele_diagnostics/README.md)
5. **Results analysis?** → See [1_piele_analysis/README.md](1_piele_analysis/README.md)
6. **Understand project?** → See [1_piele_docs/PLAN.md](1_piele_docs/PLAN.md)

---

## 🌟 Quick Links

- **Main Dashboard:** `python 1_piele_dashboard/visualize_scenarios_ui_v2.py`
- **Run All Scenarios:** `python 1_piele_runners/run_all_scenarios.py`
- **Quick Test:** `python 1_piele_runners/run_baseline_only.bat`
- **Analyze Results:** `python 1_piele_analysis/explorer_scenarios.py`
- **Generate Reports:** `python 1_piele_analysis/run_summary.py`
- **Validate Data:** `python 1_piele_diagnostics/check_csv.py`

---

**Happy analyzing! 🚀**





---
# Source: YEAR_SPECIFIC_TEMPLATES_UPDATE.md

==================================================================
# Year-Specific Templates Implementation - UPDATE

**Date Completed:** January 24, 2025  
**Status:** ✅ COMPLETE  

## What Was Added

The scenario manager now intelligently selects **year-specific YAML templates** based on the cutout year you choose. This ensures proper default configurations for each year.

---

## New Files Created

### 1. `scenario_template_2023.yaml`
- **Location:** `1_piele_docs/scenario_template_2023.yaml`
- **Purpose:** Optimized template for 2023 cutout year
- **Key Differences from 2020 template:**
  - `snapshots.start`: "2023-01-15" (vs 2020-12-01)
  - `snapshots.end`: "2023-01-22" (vs 2020-12-08)
  - `electricity.estimate_renewable_capacities.year`: 2023 (vs 2020)
  - `atlite.default_cutout`: "europe-2023-sarah3-era5" (vs 2020)
- **Status:** ✅ Valid YAML syntax verified

### 2. `TEMPLATE_ARCHITECTURE.md`
- **Location:** `1_piele_docs/TEMPLATE_ARCHITECTURE.md`
- **Purpose:** Complete technical documentation of template system
- **Contents:** 400+ lines covering:
  - Template selection logic
  - Configuration differences between years
  - How to add new year templates
  - Debugging guide
  - File locations & architecture

---

## Code Updates

### 1. `config_builder.py` - New Function `resolve_template_path()`

**Location:** `1_piele_dashboard/scenario_manager/config_builder.py`

**What it does:**
```python
def resolve_template_path(base_template_path: Path, cutout_year: str = "2020") -> Path:
    """Intelligently selects year-specific templates"""
```

**Logic:**
- If `cutout_year == "2020"` → Returns default `scenario_template.yaml`
- If `cutout_year == "2023"` → Returns `scenario_template_2023.yaml` (if exists)
- If year-specific not found → Falls back to default template
- **Result:** Right template loaded automatically ✅

### 2. `config_builder.py` - Updated `build_working_config()`

**Before:**
```python
def build_working_config(*, inputs, template_path):
    template_cfg = load_template(template_path)  # Always default
    ...
```

**After:**
```python
def build_working_config(*, inputs, template_path):
    # Intelligently select template based on cutout_year
    resolved_template_path = resolve_template_path(template_path, inputs.cutout_year)
    template_cfg = load_template(resolved_template_path)
    ...
```

### 3. `config_builder.py` - Updated `build_configs()`

**Same update as above** - Now uses `resolve_template_path()` to select year-appropriate template

---

## How It Works - User Perspective

### Scenario 1: User selects 2020 cutout
```
1. Opens Scenario Manager
2. Selects "Cutout year: 2020"
3. Clicks "Build Config"
4. System uses scenario_template.yaml
5. Default dates: 2020-12-01 to 2020-12-08 ✓
```

### Scenario 2: User selects 2023 cutout
```
1. Opens Scenario Manager
2. Selects "Cutout year: 2023"
3. Clicks "Build Config"
4. System uses scenario_template_2023.yaml
5. Default dates: 2023-01-15 to 2023-01-22 ✓
6. 2023 weather data automatically configured ✓
```

---

## Template Files Now Available

| File | Used For | Default Snapshots |
|------|----------|-------------------|
| `scenario_template.yaml` | 2020 cutout year (default) | 2020-12-01 to 2020-12-08 |
| `scenario_template_2023.yaml` | 2023 cutout year | 2023-01-15 to 2023-01-22 |

**Both located in:** `1_piele_docs/`

---

## Configuration Comparison

### scenario_template.yaml (2020)
```yaml
snapshots:
  start: "2020-12-01"
  end: "2020-12-08"
electricity:
  estimate_renewable_capacities:
    year: 2020
atlite:
  default_cutout: europe-2020-sarah3-era5
```

### scenario_template_2023.yaml (2023)
```yaml
snapshots:
  start: "2023-01-15"
  end: "2023-01-22"
electricity:
  estimate_renewable_capacities:
    year: 2023
atlite:
  default_cutout: europe-2023-sarah3-era5
```

---

## Benefits

✅ **Automatic** - System picks right template, no user action needed  
✅ **Correct Defaults** - Each year gets appropriate snapshot dates  
✅ **Year Consistency** - Electricity year matches cutout year  
✅ **Scalable** - Easy to add 2024, 2025, etc. templates in future  
✅ **Safe Fallback** - Missing template gracefully falls back to default  
✅ **Zero Breaking Changes** - Existing workflows unchanged  

---

## Architecture Flow

```
User selects cutout_year from UI
    ↓
build_config() called with ScenarioInputs
    ↓
resolve_template_path(template_path, inputs.cutout_year)
    ├─ 2020 → scenario_template.yaml
    └─ 2023 → scenario_template_2023.yaml
    ↓
load_template(resolved_path)
    ↓
Configuration merged with user inputs
    ↓
_apply_cutout_to_config() validates year match
    ↓
Generated YAML has correct settings
    ↓
Snakemake uses correct cutout file
```

---

## Adding New Year Templates (Future)

To support 2024, 2025, etc:

### 1. Copy Template
```bash
cp 1_piele_docs/scenario_template_2023.yaml 1_piele_docs/scenario_template_2024.yaml
```

### 2. Update Year
```yaml
snapshots:
  start: "2024-01-15"
  end: "2024-01-22"
electricity:
  estimate_renewable_capacities:
    year: 2024
atlite:
  default_cutout: europe-2024-sarah3-era5
```

### 3. Update UI Dropdown
```python
# Line ~133
("cutout_year", self.cutout_year, ["2020", "2023", "2024"]),
```

**That's it!** The `resolve_template_path()` function automatically finds and uses the new template.

---

## Validation Status

✅ All YAML files are syntactically valid  
✅ `resolve_template_path()` function correct  
✅ Integration points updated  
✅ No errors in modified code  
✅ Backward compatible (2020 still uses default template)  
✅ All documentation complete  

---

## Testing

### Manual Test: 2023 Scenario Creation
1. Open Scenario Manager UI
2. Select "Cutout year: 2023"
3. Set snapshot dates: 2023-01-15 to 2023-01-22
4. Build config
5. Verify in generated YAML:
   - `atlite.default_cutout: europe-2023-sarah3-era5` ✓
   - `snapshots.start: "2023-01-15"` ✓
   - `electricity.estimate_renewable_capacities.year: 2023` ✓

### Manual Test: 2020 Scenario Creation
1. Open Scenario Manager UI
2. Select "Cutout year: 2020"
3. Build config
4. Verify in generated YAML:
   - `atlite.default_cutout: europe-2020-sarah3-era5` ✓
   - Uses `scenario_template.yaml` (default) ✓

---

## Files Modified

| File | Changes |
|------|---------|
| `config_builder.py` | +1 new function (`resolve_template_path`), 2 functions updated |
| `CUTOUT_CONFIG.md` | +15 lines (template selection section) |

## Files Created

| File | Lines | Purpose |
|------|-------|---------|
| `scenario_template_2023.yaml` | 120 | 2023 year-specific template |
| `TEMPLATE_ARCHITECTURE.md` | 400+ | Technical documentation |

---

## Documentation

**For End Users:**
- See `1_piele_docs/CUTOUT_CONFIG.md` → "Intelligent Template Selection" section
- Templates auto-selected, no manual action needed

**For Developers:**
- See `1_piele_docs/TEMPLATE_ARCHITECTURE.md` → Complete technical guide
- How to add new templates, debug issues, customize behavior

---

## Summary

✅ **Smart template selection implemented**  
✅ **2023 template created with correct defaults**  
✅ **2020 template remains as fallback**  
✅ **Code updated to intelligently resolve templates**  
✅ **Full documentation provided**  
✅ **Ready for production use**  

When users select 2023 from the cutout year dropdown, the system automatically loads `scenario_template_2023.yaml` with pre-configured 2023 settings. No manual template selection needed!

---

**Implementation Status:** Complete and Ready for Testing ✅



