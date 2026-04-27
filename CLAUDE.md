# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**PyPSA-Eur Romania** is a comprehensive energy system modeling project combining:
- **Core Modeling**: PyPSA-based optimization using Snakemake workflows for energy system simulations
- **Scenario Management**: Python-based scenario builder and configuration system
- **Interactive Visualization**: Next.js/React dashboard (in `vizualizer/` folder) for scenario management and results visualization
- **Analysis & Reporting**: Post-processing and stress-test analysis tools
- **Documentation**: Obsidian vault (in `vault/`) containing architecture, planning, and configuration guides

## Architecture Overview

### High-Level Flow
```
Configuration (YAML) 
    ↓
Snakemake Workflow (rules/, scripts/)
    ↓
Network Optimization & Solving
    ↓
Results (networks/, CSVs, figures)
    ↓
Analysis & Reporting (personal_analysis/)
    ↓
Visualization & Dashboard (vizualizer/)
```

### Directory Organization

**Core PyPSA-Eur Directories:**
- `config/` - YAML scenario configurations (base settings + year-specific templates in `personal_docs/`)
- `scripts/` - Core PyPSA-Eur execution scripts (data prep, network building, optimization)
- `rules/` - Snakemake workflow rule definitions
- `data/` - Raw/processed datasets (weather cutouts, power plant data, geographic boundaries)
- `resources/` - Intermediate processed files from Snakemake rules
- `results/` - Output networks (.nc files), CSVs, and figures

**Custom Romania Project Directories:**
- `personal_dashboard/` - Tkinter UI + Next.js React app (scenario manager, results viewer)
- `personal_runners/` - Scripts to execute baseline/stress scenarios without Snakemake CLI
- `personal_analysis/` - Post-processing: CSV generation, reporting, figure creation
- `personal_diagnostics/` - Validation tools (config checks, data integrity, URL testing)
- `personal_data_download/` - ERA5 cutout and Zenodo dataset acquisition
- `personal_docs/` - Implementation documentation and scenario templates
- `vault/` - **Obsidian knowledge base** with architecture, running guides, configuration explanations (EN/RO)

### Scenario Manager System

The scenario manager (in `personal_dashboard/scenario_manager/`) uses:
- **Immutable Template Pattern**: Read-only canonical YAML templates in `personal_docs/`
- **Year-Specific Templates**: `scenario_template.yaml` (default/2020) and `scenario_template_2023.yaml` auto-selected based on cutout year
- **Config Builder**: Generates YAML by merging user inputs with template defaults
- **Dual Editing Modes**: Structured form controls OR raw YAML editor (both update same config)
- **Bilingual Support**: English/Romanian UI via static i18n map
- **Queue-Based Execution**: Non-blocking subprocess management; status persisted to JSON

Key modules:
- `config_builder.py` - `resolve_template_path()` intelligently selects year-specific templates; `build_configs()` generates paired baseline+stress YAMLs
- `run_manager.py` - Queue management, subprocess orchestration, job state tracking
- `results_index.py` - Scans `results/` for new-format comparison outputs; validates required CSV presence
- `state_store.py` - Persistent JSON state for jobs, history, language preference

## Visualizer Sub-Project (Next.js Dashboard)

**Location:** `vizualizer/` (Note: intentional spelling with 'z')

**Stack:**
- Next.js 16.2.4 (App Router)
- React 19.2.4
- TypeScript 5
- Tailwind CSS 4

**Current State:** Minimal scaffolding (layout.tsx, page.tsx)

**Planned Feature:** Scenario management and visualization dashboard
- Integration with scenario manager outputs (baseline + stress results)
- Interactive scenario comparison (CSVs, figures, metrics)
- Results browsing and export

**Development:**
```bash
cd vizualizer
npm install        # Install dependencies (already in node_modules)
npm run dev        # Start dev server (http://localhost:3000)
npm run build      # Production build
npm run lint       # ESLint check
```

## Key Concepts & Patterns

### Configuration Architecture
- **Baseline Configs**: No shocks applied, `stress_test.enable=false`
- **Stress Configs**: Shock parameters defined, `stress_test.enable=true`
- **Paired Scenarios**: Typically run baseline + stress together for comparison
- **Geographic Scope**: Romania stress tests typically cover `[RO, BG, HU, RS]` (shocks applied only to RO)
- **Time Windows**: Specified in UTC; conversions to local EET handled in reporting

### Stress Test Parameters
Defined in `stress_test` YAML block (only in stress configs):
- **Timeseries Shocks**: Load multiplier, hydro availability reduction, gas capacity reduction for specific hours
- **SCADA Proxy**: Ramp rate constraints on controllable generators (hour-dependent limits)
- **Import Caps**: Directional constraints on border interconnectors (time-window dependent)
- **Shock Application**: Pre-solve (in `scripts/romania_winter_stress.py`) via `apply_timeseries_shocks()`, then constraint addition via `add_scada_proxy_constraints()` and `add_import_cap_constraints()`

### Results Format
New-format results (required for scenario manager):
- **Required CSVs**: `system_cost_comparison.csv`, `generation_mix_mwh.csv`, `lmp_summary_ro.csv`, `ens_summary.csv`, `curtailment_mwh.csv`, `daily_net_imports_mwh.csv`, `interconnector_flow_congestion.csv`
- **Figures**: PNG + PDF versions (fig_01 through fig_05)
- **Assumptions Note**: `assumptions_limitations.md` documenting shock formulation, constraints, and interpretation limits
- **Storage**: Results organized by comparison name in `results/<output_name>/`

### Data Validation & Diagnostics
- `check_romania.py` - Validates scenario configs, cutout references, and network requirements
- `check_csv.py` - Validates output CSV structure and data quality
- `check_url.py` - Verifies external data source availability (ERA5, Zenodo)

## Documentation References

**For architecture, planning, and configuration details:**
- `vault/Index.md` - Master index to all Obsidian documentation
- `vault/Architecture.md` - Stress test implementation plan, shock logic, reporting specs
- `vault/FolderStructure.md` - Directory roles and organization
- `personal_docs/PLAN.md` - Original project scope and acceptance criteria
- `personal_docs/TEMPLATE_ARCHITECTURE.md` - Year-specific template selection system (400+ lines)
- `personal_docs/romania_config_explanation.md` - YAML configuration guide (English)
- `personal_docs/romania_config_explanation_ro.md` - YAML configuration guide (Romanian)
- `personal_docs/PROJECT_ORGANIZATION.md` - Updated folder structure guide with quick-start workflows

**For dashboard/UI details:**
- `personal_docs/planui.md` - Scenario Manager UI architecture and implementation notes
- `personal_dashboard/README.md` - Dashboard usage guide

## Common Development Tasks

**Run scenario simulations:**
```bash
cd personal_runners
python run_romania_winter_stress.py          # Baseline + stress with comparison
python run_baseline_only.bat                 # Quick baseline test
python run_all_scenarios.py                  # All seasonal scenarios
```

**Validate environment and configuration:**
```bash
cd personal_diagnostics
python check_romania.py                      # Validate configs
python check_csv.py                          # Validate result outputs
python check_url.py                          # Verify data sources
```

**Generate analysis and reports:**
```bash
cd personal_analysis
python run_summary.py                        # Generate scenario summaries
python interpret_results.py                  # Analyze network results
python explore_scenarios.py                  # Discover available scenarios
```

**View results with dashboard:**
```bash
cd personal_dashboard
python visualize_scenarios_ui_v2.py          # Tkinter UI (legacy, Python-based)
# Coming: vizualizer/npm run dev              # Next.js web dashboard
```

**Add new year support (e.g., 2024):**
1. Create `personal_docs/scenario_template_2024.yaml` (copy from 2023, update year references)
2. Update UI dropdown in `scenario_manager_ui.py` to include "2024"
3. Ensure cutout file exists: `data/cutout/archive/v0.8/europe-2024-sarah3-era5.nc`
4. Function `resolve_template_path()` in `config_builder.py` automatically detects and uses new template

## Key Architectural Decisions

1. **Immutable Template Pattern**: Templates in `personal_docs/` are read-only; user configs generated to `config/adversarial/generated/`
2. **Year-Specific Templates**: Auto-select logic eliminates manual template management; fallback safety if template missing
3. **Bilingual UI**: Static i18n map (no external library); easily extensible to more languages
4. **Queue-Based Execution**: Async subprocess management prevents blocking; job state persisted across app restarts
5. **New-Format Results Only**: Results page only displays comparison outputs meeting CSV validation criteria (discards legacy formats)
6. **Dual Editing Modes**: Form + YAML allows both guided and power-user workflows updating same underlying config
7. **Stress Test Modular Design**: Shock logic isolated in `romania_winter_stress.py` for testability and reusability

## Integration Points for New Dashboard (vizualizer)

When building scenario management and visualization in `vizualizer/`:

1. **Results Data Source**: Read from `results/` directory; validate CSV presence and parse metrics for summary display
2. **Scenario Templates**: Reference `personal_docs/scenario_template*.yaml` for default parameters (read-only reference)
3. **Configuration Discovery**: Query `config/adversarial/generated/` to list available scenario configs
4. **Figure Rendering**: Load PNG/PDF figures from `results/<output_name>/` for display in tabs
5. **CSV Previewing**: Parse and display sample rows from required CSVs in structured tabs
6. **Assumptions Display**: Render `assumptions_limitations.md` as text/markdown in UI

**Data Flow:**
```
vizualizer/ reads → results/ (comparison outputs)
                  → config/adversarial/generated/ (scenario configs)
                  → personal_docs/ (templates, for reference)
```

## Testing

**Unit tests for stress logic:**
```bash
pytest test/test_romania_winter_stress.py
```

**Manual validation (before large runs):**
1. Verify config: `python personal_diagnostics/check_romania.py`
2. Run baseline test: `python personal_runners/run_baseline_only.bat`
3. Check outputs: `python personal_diagnostics/check_csv.py`

## Notes for Future Development

- **Consolidation Opportunity**: Tkinter UI (`visualize_scenarios_ui_v2.py`) and Next.js app (`vizualizer/`) have overlapping features; plan eventual unification
- **Cutout Management**: Weather data (ERA5 cutouts) is heavy; `personal_data_download/download_cutout.py` pre-caches to `data/cutout/archive/v0.8/`
- **Bilingual Expansion**: Add more language pairs by updating i18n maps in `scenario_manager/i18n.py`
- **Template Versioning**: As new years are added, keep all templates in sync for consistency; document breaking changes in `personal_docs/`
- **Performance**: Large networks solve slowly; clustering and temporal resolution settings in config significantly impact runtime
