# Installation Documentation



---
# Source: 1_piele_data_download\README.md

# 📥 Data Download - External Data Acquisition

Utilities for downloading required datasets from external sources. PyPSA-Eur needs environmental and geographic data for simulations.

## Data Download Scripts

### **download_cutout.py**
Downloads atmospheric/weather data cutouts for renewable energy profiles.

**Purpose:**
- Fetch ERA5 reanalysis data
- Download SARAH solar radiation data
- Extract cutouts for simulation region

**Data Downloaded:**
```
Cutout: europe-2020-sarah3-era5.nc
├── Solar irradiance (SARAH-3)
├── Wind speed (ERA5)
├── Temperature (ERA5)
├── Runoff/precipitation (ERA5)
└── Other meteorological variables
```

**Data Source:** 
- ERA5: Copernicus Climate Data Store
- SARAH-3: Satellite-based radiation data

**How to Run:**
```bash
python download_cutout.py
```

**Output:**
```
data/cutout/
├── archive/
│   └── v0.8/europe-2020-sarah3-era5.nc     (1.2 GB)
└── europe-2020-sarah3-era5.nc (symlink)
```

**Time Required:** 10-30 minutes (internet dependent)

**Storage:** ~1.2 GB (compressed netCDF format)

---

### **download_zenodo_files.py**
Downloads pre-processed datasets and benchmarks from Zenodo repository.

**Purpose:**
- Fetch power plant datasets
- Download preprocessed transmission networks
- Get cost data and technology specifications
- Retrieve benchmark configurations

**Data Downloaded:**
```
Power Plant Data
├── powerplants.csv          (Generator locations/capacities)
└── refineries.csv           (Industrial facility data)

Network Data
├── transmission_projects/   (Future expansion plans)
├── osm_boundaries/          (Geographic boundaries)
└── natura_sites/            (Environmental protections)

Cost Data
├── costs_2050.csv           (Technology cost projections)
└── parameter_corrections/   (Regional adjustments)

Benchmark Data
├── tutorial_configs/        (Example scenarios)
└── validation_datasets/     (Validation data)
```

**Data Source:** Zenodo.org (PyPSA-Eur community repository)

**How to Run:**
```bash
python download_zenodo_files.py
```

**Output:**
```
data/
├── powerplants/
│   └── primary/0.7.1/powerplants.csv
├── costs/
│   └── primary/v0.13.3/costs_2050.csv
├── entsoegridkit/
├── osm_boundaries/
└── ... (other datasets)
```

**Time Required:** 30 minutes - 2 hours (varies by dataset size and internet)

**Storage:** ~5-10 GB total for all datasets

---

## Data Organization

After successful download, data is organized as:

```
data/
├── corine/                    # Land cover data
├── costs/                     # Technology costs
│   └── primary/v0.13.3/costs_2050.csv
├── cutout/                    # Weather/atmospheric data
│   └── europe-2020-sarah3-era5.nc (1.2GB)
├── entsoegridkit/            # European grid data (ENTSOE)
├── eez/                      # Exclusive economic zones
├── eu_nuts2021/              # Regional boundaries
├── existing_infrastructure/  # Current power plants
├── gdp_per_capita/           # Economic data
├── jrc_ardeco/               # Industrial data
├── luisa_land_cover/         # High-res land cover
├── natura/                   # Protected areas
├── osm/                      # OpenStreetMap data
├── osm_boundaries/           # Geographic boundaries
├── population_count/         # Population distribution
├── powerplants/              # Generator database
│   └── primary/0.7.1/powerplants.csv
├── retro/                    # Building retrofit data
├── ship_raster/              # Shipping routes
└── synthetic_electricity_demand/  # Demand profiles
```

---

## Download Workflow

**First-Time Setup:**
```
1. Download cutout (weather data)
   python download_cutout.py

2. Download Zenodo datasets
   python download_zenodo_files.py

3. Verify downloads (see ../diagnostics/check_csv.py)
   python ../diagnostics/check_csv.py

4. Ready for scenario execution
   python ../runners/run_baseline_only.bat
```

**Subsequent Runs:**
- Datasets are cached locally
- Only run if missing data error appears
- Pre-downloaded data is reused

---

## Data Requirements Summary

| Dataset | Size | Time | Required? |
|---------|------|------|-----------|
| Cutout (Weather) | 1.2 GB | 10-30 min | ✅ YES |
| Power Plants | 50 MB | <5 min | ✅ YES |
| Costs | 30 MB | <5 min | ✅ YES |
| Boundaries | 200 MB | 5-10 min | ✅ YES |
| OSM Grid | 500 MB | 10-20 min | ✅ YES |
| ENTSOE Grid | 100 MB | 5 min | ✅ YES |
| Natura/EEZ | 100 MB | 5 min | ⚠️ Optional |
| CORINE Land | 300 MB | 10-15 min | ⚠️ Optional |

**Minimum Install:** ~2.5 GB (11000 required datasets)
**Full Install:** ~10 GB (all datasets)

---

## Troubleshooting Download Issues

### Issue: Download fails due to network error
```bash
# Retry download
python download_cutout.py  # Automatic retry built-in

# Check internet connectivity
ping www.copernicus-climate.eu
```

### Issue: Out of disk space
```bash
# Check current disk usage
dir data/ | measure-object -Sum Length

# Download individually
python download_cutout.py      # Required first
python download_zenodo_files.py  # Optional later
```

### Issue: Timeout downloading large files
```bash
# Increase timeout (modify script):
# timeout = 3600  # seconds (1 hour)

# Or download manually from:
# - CDS: https://cds.climate.copernicus.eu/
# - Zenodo: https://zenodo.org/search?q=pypsa-eur
```

### Issue: Incomplete download detected
```bash
# Delete corrupted file and retry
rm data/cutout/europe-2020-sarah3-era5.nc
python download_cutout.py
```

---

## Data Caching & Reuse

Downloaded data is automatically cached in `data/` folder:
- Future scenario runs reuse existing data
- No re-downloading unless explicitly deleted
- Archive versions kept for reproducibility

**Archive locations:**
```
data/cutout/archive/v0.8/
data/costs/primary/v0.13.3/
data/powerplants/primary/0.7.1/
```

---

## Integration with Workflow

```
1. Data Download (this folder)
   download_cutout.py
   download_zenodo_files.py
          ↓
2. Diagnostics (validate)
   check_csv.py
   check_url.py
          ↓
3. Scenario Configuration
   config/*.yaml
          ↓
4. Run Simulations (runners/)
   run_baseline_only.bat
   run_all_scenarios.py
          ↓
5. Analyze Results (analysis/)
          ↓
6. Visualize (dashboard/)
   visualize_scenarios_ui_v2.py
```

---

## File Organization

```
data_download/
├── download_cutout.py              # Download weather data
└── download_zenodo_files.py        # Download general datasets
```

---

## Data Sources

**Cutout Data:**
- **CDS (Copernicus):** https://cds.climate.copernicus.eu/
- **Source:** ERA5 reanalysis + SARAH-3 satellite radiation
- **Coverage:** Europe, hourly, 2010-2020

**Zenodo Data:**
- **Repository:** https://zenodo.org/
- **Collections:** PyPSA-Eur community datasets
- **Content:** Power plants, network data, costs, boundaries

---

## Advanced Configuration

To modify data downloads, edit the scripts:

```python
# download_cutout.py
CUTOUT_NAME = "europe-2020-sarah3-era5"
CUTOUT_DIR = Path("data/cutout")
# Modify years, region, resolution here

# download_zenodo_files.py
ZENODO_RECORDS = [
    12345,  # Dataset record ID
    67890,
    # Add more record IDs
]
```

---

## Next Steps

1. **First time:** Run both scripts in sequence
   ```bash
   python download_cutout.py
   python download_zenodo_files.py
   ```

2. **Validate:** Check for completeness
   ```bash
   python ../diagnostics/check_csv.py
   ```

3. **Ready to simulate:** Proceed to runners
   ```bash
   python ../runners/run_baseline_only.bat
   ```

4. **For troubleshooting:** See diagnostics/ folder


---
# Source: 1_piele_docs\CUTOUT_CONFIG.md

# Cutout Year Configuration Guide

## Overview

The PyPSA-EUR scenario manager now supports multiple years of weather data (cutout files) for simulations. This allows you to run energy system analyses using different years of weather conditions.

## Supported Cutout Years

- **2020** (Default) - Original cutout used for all existing scenarios
  - File: `data/cutout/archive/v0.8/europe-2020-sarah3-era5.nc`
  - Template: `1_piele_docs/scenario_template.yaml`
  - Default snapshots: 2020-12-01 to 2020-12-08 (winter stress period)
  - ERA5 reanalysis + SARAH-3 satellite radiation data

- **2023** (New) - Additional year for comparison and stress testing
  - File: `data/cutout/archive/v0.8/europe-2023-sarah3-era5.nc`
  - Template: `1_piele_docs/scenario_template_2023.yaml` (auto-selected when 2023 cutout year chosen)
  - Default snapshots: 2023-01-15 to 2023-01-22 (winter stress period)
  - ERA5 reanalysis + SARAH-3 satellite radiation data

## How to Use

### Via Scenario Manager UI

1. **Open the Scenario Builder tab**
2. **Fill in scenario parameters as usual** (output name, countries, clusters, solver, etc.)
3. **Set Snapshot Dates** - Enter the date range for your simulation
   - Example: `2020-12-01` to `2020-12-08` (for 2020 cutout)
   - Example: `2023-01-15` to `2023-01-22` (for 2023 cutout)
4. **Select Cutout Year** - New dropdown field:
   - Choose `2020` (default) or `2023`
   - The year should match your snapshot dates
5. **Configure Stress Parameters** (if needed)
6. **Click "Enqueue run"** to start the simulation

### Intelligent Template Selection

The system **automatically selects the appropriate YAML template** based on your cutout year choice:

- **Select 2020 cutout** → Uses `1_piele_docs/scenario_template.yaml`
  - Default snapshots: 2020-12-01 to 2020-12-08
  - Electricity year: 2020

- **Select 2023 cutout** → Uses `1_piele_docs/scenario_template_2023.yaml`
  - Default snapshots: 2023-01-15 to 2023-01-22
  - Electricity year: 2023
  - Pre-configured with 2023 weather data

**You don't need to manually select templates** – the system handles it for you based on the cutout year dropdown selection.

### Via Configuration File

If you prefer direct YAML configuration:

```yaml
atlite:
  default_cutout: "europe-2020-sarah3-era5"  # or "europe-2023-sarah3-era5"
```

Both cutout definitions are available in `1_piele_docs/scenario_template.yaml`:

```yaml
atlite:
  default_cutout: europe-2020-sarah3-era5
  cutouts:
    europe-2020-sarah3-era5:
      module: era5
      x: [-12.0, 35.0]
      y: [33.0, 72.0]
      dx: 0.3
      dy: 0.3
      time: ["2020", "2020"]
    
    europe-2023-sarah3-era5:
      module: era5
      x: [-12.0, 35.0]
      y: [33.0, 72.0]
      dx: 0.3
      dy: 0.3
      time: ["2023", "2023"]
```

## Important Validation Rules

### Date-Year Matching

The system validates that your snapshot dates match the selected cutout year:

✅ **Valid combinations:**
- Cutout Year: 2020, Dates: 2020-12-01 to 2020-12-08
- Cutout Year: 2023, Dates: 2023-01-15 to 2023-01-22

❌ **Invalid combinations (will error):**
- Cutout Year: 2020, Dates: 2023-12-01 to 2023-12-08
- Cutout Year: 2023, Dates: 2020-01-15 to 2020-01-22

**Error message if mismatch:** 
```
Snapshot dates don't match cutout year 2020: got 2023-12-01 to 2023-12-08.
Cutout year must match snapshot year.
```

### Supported Snapshot Ranges

**For 2020 cutout:**
- All dates within 2020 (January 1 - December 31, 2020)
- Minimum recommended: 3-7 days for testing
- Common usage: 7-14 day winter stress periods

**For 2023 cutout:**
- All dates within 2023 (January 1 - December 31, 2023)
- Same flexibility as 2020

## Default Behavior

- **Default cutout year:** 2020 (backward compatible with existing workflows)
- **UI dropdown:** Remembers your last selection between sessions
- **Recommendation:** Use 2020 for baseline runs, compare with 2023 for climate sensitivity analysis

## Troubleshooting

### Error: "Unsupported cutout year: 20XX"
- Ensure you select only 2020 or 2023 from the dropdown
- Other years are not currently available

### Error: "Snapshot dates don't match cutout year"
- Check that your snapshot start/end dates match the selected year
- Example: If you select 2023, use dates like 2023-MM-DD, not 2020-MM-DD

### Error: "Cutout X not defined in template"
- Verify `1_piele_docs/scenario_template.yaml` contains both cutout definitions
- Ensure the template file hasn't been modified or corrupted

### File not found: "europe-2023-sarah3-era5.nc"
- Verify the cutout file exists at: `data/cutout/archive/v0.8/europe-2023-sarah3-era5.nc`
- If missing, download it via `python download_cutout.py --year 2023`

## Programmatic Usage

When building scenarios programmatically:

```python
from scenario_manager.types import ScenarioInputs

inputs = ScenarioInputs(
    run_mode="paired",
    output_name="scenario-2023-comparison",
    scenario_slug="romania-winter-2023",
    country="RO",
    countries=["RO", "BG", "HU", "RS"],
    snapshot_start="2023-01-15",
    snapshot_end="2023-01-22",
    clusters=10,
    solver_name="highs",
    solver_options="highs-simplex",
    cutout_year="2023",  # NEW: Specify cutout year
    stress_enable=True,
    # ... stress parameters
)

from scenario_manager.config_builder import build_configs

result = build_configs(
    repo_root=Path("."),
    inputs=inputs,
    template_path=Path("1_piele_docs/scenario_template.yaml")
)
```

## Configuration Pipeline

1. **User Input (UI)** → cutout_year selected from dropdown
2. **Validation** → Year must be 2020 or 2023
3. **ScenarioInputs** → cutout_year stored in dataclass
4. **Config Builder** → `_apply_cutout_to_config()` function processes year
5. **Date Validation** → Snapshot dates checked against year
6. **Config Generation** → Correct cutout name set in generated YAML
7. **Snakemake Execution** → Uses specified cutout for weather data

## File Locations

```
pypsa-eur/
├── 1_piele_dashboard/
│   ├── scenario_manager_ui.py          # UI with cutout_year dropdown
│   ├── scenario_manager/
│   │   ├── types.py                    # ScenarioInputs dataclass
│   │   ├── config_builder.py           # _apply_cutout_to_config() function
│   │   └── i18n.py                     # English/Romanian labels
│   └── scenario_manager_state.json     # Persisted UI state (includes cutout_year)
├── 1_piele_docs/
│   └── scenario_template.yaml          # Cutout definitions for both years
└── data/
    └── cutout/
        └── archive/
            └── v0.8/
                ├── europe-2020-sarah3-era5.nc  # 2020 cutout file
                └── europe-2023-sarah3-era5.nc  # 2023 cutout file
```

## Best Practices

1. **Backward Compatibility** - Always use 2020 cutout for baseline/reference scenarios
2. **Comparison Studies** - Run same scenario with both 2020 and 2023 cutouts to assess climate variations
3. **Stress Testing** - Use 2023 data for updated extreme weather scenarios
4. **Documentation** - Always record which cutout year was used in results metadata
5. **Reproducibility** - Document the exact start/end dates used in each scenario

## Adding New Cutout Years (Future)

To support additional years (2024, 2025, etc.):

1. Download cutout file: `europe-YYYY-sarah3-era5.nc`
2. Place in: `data/cutout/archive/v0.8/`
3. Update `scenario_template.yaml`:
   ```yaml
   europe-YYYY-sarah3-era5:
     module: era5
     x: [-12.0, 35.0]
     y: [33.0, 72.0]
     dx: 0.3
     dy: 0.3
     time: ["YYYY", "YYYY"]
   ```
4. Update UI dropdown in `scenario_manager_ui.py` line 133:
   ```python
   ("cutout_year", self.cutout_year, ["2020", "2023", "YYYY"]),
   ```
5. Config builder validation will automatically work for new years

## Support

For issues or questions:
- Check scenario logs in `logs/planui/`
- Verify template YAML syntax
- Ensure snapshot dates are in YYYY-MM-DD format
- Contact: [project maintainers]


---
# Source: 1_piele_docs\FORMAT_SUPPORT.md

# Suport Format Date - Dashboard v2

## 📊 Două Formate de Date Detectate

Dashboard v2 suportă acum **ambele formate** de date disponibile în proiect:

### ✅ FORMAT NOU (Report)
**Fișier:** `romania-2020-winter-stress-comparison/`

**Fișiere CSV:**
- `system_cost_comparison.csv` - Costuri totale bază vs. scenariu
- `generation_mix_mwh.csv` - Mix energetic
- `ens_summary.csv` - Energy not served (blackout)
- `interconnector_flow_congestion.csv` - Congestie linii
- `lmp_summary_ro.csv` - Preț marginal local
- `curtailment_mwh.csv` - Energie curtată
- `daily_net_imports_mwh.csv` - Importuri zilnice

**Status:** ✅ **SUPORT COMPLET**
- Toate 6 taburi funcționale
- Grafice interactive cu date comparative
- Metrici detaliate (bază vs. scenariu)

---

### 📋 FORMAT LEGACY (Rezultate Native)
**Fișiere:** `romania-2020-summer/csvs`, `romania-2020-autumn/csvs`, etc.

**Fișiere CSV disponibile:**
- `capacities.csv` - Capacități instalate
- `capacity_factors.csv` - Factori de capacitate
- `costs.csv` - Costuri pe componentă
- `curtailment.csv` - Energie curtată
- `energy.csv` - Producție de energie
- `energy_balance.csv` - Bilanț energetic
- `market_values.csv` - Valori de piață
- `metrics.csv` - Metrici aggregate
- `nodal_capacities.csv`, `nodal_costs.csv`, etc. - Date pe nod
- `prices.csv`, `weighted_prices.csv` - Preț

**Status:** ⚠️ **SUPORT PARȚIAL**
- Tab **Rezumat** arată fișierele disponibile
- Taburi **Costuri**, **Generare**, **Congestie**, **Preț** → Mesaj informativ
- Tab **Date Brute** → ✅ Funcțional (exploreaza orice CSV)

---

## 🔄 Cum Lucreaza Detectia

Cand se incarca un scenariu, programul:

1. **Cauta** `system_cost_comparison.csv`
   - ✅ Gasit? → Format NOU, toate taburile active
   - ❌ Nu?: Continua...

2. **Cauta** `costs.csv` + `energy.csv`
   - ✅ Ambele gasite? → Format LEGACY
   - Afiseaza: "⚠️ Format Legacy - Date Disponibile"

3. **Afiseaza status** in barra: `[FORMAT NOU (Report)]` sau `[FORMAT LEGACY (Rezultate native)]`

---

## 🎯 Cazuri de Utilizare

### Cand folositi FORMAT NOU (Winter Stress):
```bash
python visualize_scenarios_ui_v2.py
→ Select: romania-2020-winter-stress-comparison
→ Toate taburile trabalhe perfect
→ Grafice comparare Baza vs. Stres
```

### Cand folositi FORMAT LEGACY (Summer/Autumn/Spring/December):
```bash
python visualize_scenarios_ui_v2.py
→ Select: romania-2020-summer/csvs
→ Tab Rezumat: Arata fisierele disponibile
→ Tab Date Brute: Exploreaza raw CSVs
→ Alte taburi: Mesaj "Necesita format NOU"
```

---

## 💡 Solutii

### Pentru a folosi complet taburile cu date legacy:
Ar fi nevoie de transformation datelor:
- `costs.csv` → `system_cost_comparison.csv`
- `energy.csv` → `generation_mix_mwh.csv`
- etc.

Aceasta ar necesita mapping coloane si agregare pe `case` (baza vs. scenariu).

### Pentru o analiza completa:
**Recomandare:** Rulati raport pe orice scenariu legacy:
```bash
python scripts/report_romania_winter_stress.py \
  --baseline-net results/[scenariul]/networks/base_s_*_elec_.nc \
  --scenario-net results/[scenariul]/networks/base_s_*_elec_.nc \
  --country RO \
  --outdir results/[scenariul]-comparison
```

Aceasta va genera Format NOU cu toate tabelele compatible.

---

## 📊 Tabel Suport

| Tab | Format NOU | Format Legacy |
|-----|----------|---|
| 📊 Rezumat | ✅ Metrici comparative | ⚠️ Lista fișiere |
| 💰 Costuri | ✅ Grafic bază vs. stres | ❌ Mesaj informativ |
| ⚡ Generare | ✅ Mix energetic comparat | ❌ Mesaj informativ |
| 🔌 Congestie | ✅ Linii congestionare | ❌ Mesaj informativ |
| 💹 Preț | ✅ Preț marginal local | ❌ Mesaj informativ |
| 📋 Date Brute | ✅ Toate CSVs + Export | ✅ Toate CSVs + Export |

---

**Versiune:** v2.1  
**Data:** 18 februarie 2026  
**Status:** ✅ Production Ready

Ambele formate sunt acum suportate cu mesaje clare pentru utilizator!


---
# Source: doc\romania_guide.md

# Romania Simulation Guide (Updated 2020 Scenarios)

## 1. Setup New Data
We have added support for **2020 Scenarios**. Before running them, you must download the 2020 weather data (cutout).

Run one of the following scripts:
```bash
# Downloads both 2013 and 2020 cutouts
python download_cutout.py
```
*Alternatively, `python download_zenodo_files.py` now also includes the 2020 cutout.*

## 2. Available Scenarios (2020)
We have created 5 new configuration files representing different periods in 2020:

| Config File | Period | Season |
|---|---|---|
| `config/romania_2020_winter.yaml` | Jan 1 - Jan 8 | Winter |
| `config/romania_2020_spring.yaml` | Apr 1 - Apr 8 | Spring |
| `config/romania_2020_summer.yaml` | Jul 1 - Jul 8 | Summer |
| `config/romania_2020_autumn.yaml` | Oct 1 - Oct 8 | Autumn |
| `config/romania_2020_december.yaml`| Dec 1 - Dec 8 | Early Winter |

## 3. How to Run a Scenario
To run a specific scenario, use the standard Snakemake command pointing to the desired config file.

**Example: Running the Summer 2020 Scenario**

1. **Unlock directory** (if needed):
   ```bash
   conda run -n pypsa snakemake --unlock --configfile config/romania_2020_summer.yaml
   ```

2. **Run Simulation**:
   ```bash
   conda run -n pypsa snakemake -call results/romania-2020-summer/networks/base_s_5_elec_.nc --configfile config/romania_2020_summer.yaml
   ```

3. **Verify Results**:
   You can manually inspect the results in `results/romania-2020-summer/`.

## 4. Troubleshooting
- **Locked Directory**: If you see "Locked directory", always run the `--unlock` command for the **specific config file** you are using.
- **Missing Data**: Ensure `data/cutout/archive/v0.8/europe-2020-sarah3-era5.nc` exists. If not, run checking/download scripts.

---
# Source: doc\requirements.txt

# SPDX-FileCopyrightText: Contributors to PyPSA-Eur <https://github.com/pypsa/pypsa-eur>
#
# SPDX-License-Identifier: CC0-1.0

setuptools
sphinx
sphinx_book_theme
sphinxcontrib-bibtex
myst-parser  # recommark is deprecated, https://stackoverflow.com/a/71660856/13573820

pypsa
powerplantmatching>=0.5.5
atlite>=0.2.9
dask[distributed]
matplotlib>3.5.1,<3.6
tabula-py

# HTML map retrieval
requests

# cartopy
scikit-learn
pyyaml
seaborn
memory_profiler
tables
descartes
fiona
