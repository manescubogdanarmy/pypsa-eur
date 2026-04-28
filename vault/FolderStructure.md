# Project Directory Structure

This note maps the repo from the root down one level. For large folders, only the first-level inventory is shown.

## Root directories

- .claude/ - local Claude config
- .github/ - GitHub workflows and metadata
- .git/ - git data
- .obsidian/ - root Obsidian config (not the vault)
- .pixi/ - Pixi environment cache
- .snakemake/ - Snakemake working state
- .vscode/ - VS Code settings
- benchmarks/ - benchmark and run outputs
- config/ - scenario configs and templates
- cutouts/ - cutout cache pointer
- data/ - input datasets and overrides
- doc/ - Sphinx documentation sources
- docker/ - dev environment assets
- envs/ - conda environment specs and pins
- LICENSES/ - license texts
- logs/ - runtime logs (snakemake, planui, retrieval)
- personal_analysis/ - analysis and reporting scripts
- personal_dashboard/ - Tkinter UI and scenario manager
- personal_data_download/ - dataset download scripts
- personal_diagnostics/ - validation and diagnostics
- personal_docs/ - templates and internal guides
- personal_runners/ - scenario runner scripts and batch files
- personal_scratch/ - scratch utilities
- personal_tests/ - custom tests
- profiles/ - snakemake profiles
- resources/ - intermediate workflow outputs
- results/ - scenario results and reports
- rules/ - Snakemake rules
- scripts/ - workflow scripts (build, retrieve, solve, report)
- test/ - repository tests
- utils/ - utility scripts
- vault/ - Obsidian documentation
- vizualizer/ - Next.js web dashboard

## Root files and artifacts

- CITATION.cff - citation metadata
- CLAUDE.md - repo guidance for assistants
- README.md - entry point (points to vault Index)
- REUSE.toml - licensing metadata
- ruff.toml - lint config
- matplotlibrc - plotting defaults
- Snakefile - Snakemake entry point
- pixi.toml, pixi.lock - Pixi environment definition
- ExampleDiagram.drawio - diagram source
- gurobi.log, run.log - solver and run logs
- borg-it - local borg backup helper
- 2.10 - pip install log for google-cloud-storage
- 2026-04-27-225416-fix-errors-listed-in-cusersbogdandesktoppr.txt - captured debug log

## Core workflow folders

### config/

- adversarial/
- examples/
- test/
- create_scenarios.py
- config.default.yaml
- plotting.default.yaml
- romania.yaml
- romania_2020_autumn.yaml
- romania_2020_december.yaml
- romania_2020_spring.yaml
- romania_2020_summer.yaml
- romania_2020_winter.yaml
- romania_2023_autumn.yaml
- romania_2023_december.yaml
- romania_2023_spring.yaml
- romania_2023_summer.yaml
- romania_2023_winter.yaml
- scenarios.template.yaml
- schema.default.json

### rules/

- build_electricity.smk
- build_sector.smk
- collect.smk
- common.smk
- development.smk
- postprocess.smk
- retrieve.smk
- solve_electricity.smk
- solve_myopic.smk
- solve_overnight.smk
- solve_perfect.smk

### scripts/

Subfolders:

- build_central_heating_temperature_profiles/
- build_cop_profiles/
- build_ptes_operations/
- build_surface_water_heat_potentials/
- definitions/
- lib/
- plot_cop_profiles/

Script families:

- add_*.py (component addition)
- build_*.py (data prep and network assembly)
- retrieve_*.py (data download)
- plot_*.py (reporting and charts)
- prepare_*.py (network assembly)
- solve_*.py (solving)

Custom logic:

- romania_winter_stress.py
- report_romania_winter_stress.py

### data/

First-level folders:

- corine/
- costs/
- country_runoff/
- cutout/
- eez/
- entsoegridkit/
- eu_nuts2021/
- existing_infrastructure/
- gdp_per_capita/
- jrc_ardeco/
- luisa_land_cover/
- natura/
- osm/
- osm_boundaries/
- population_count/
- powerplants/
- retro/
- ship_raster/
- synthetic_electricity_demand/
- transmission_projects/

Top-level files:

- agg_p_nom_minmax.csv
- ammonia_plants.csv
- biomass_transport_costs_supplychain1.csv
- biomass_transport_costs_supplychain2.csv
- cement-plants-noneu.csv
- ch_cantons.csv
- ch_industrial_production_per_subsector.csv
- custom_costs.csv
- custom_extra_functionality.py
- custom_powerplants.csv
- district_heat_share.csv
- egs_costs.json
- eia_hydro_annual_capacity.csv
- eia_hydro_annual_generation.csv
- electricity_demand_raw.csv
- heat_load_profile_BDEW.csv
- hydro_capacities.csv
- links_p_nom.csv
- nuclear_p_max_pu.csv
- parameter_corrections.yaml
- refineries-noneu.csv
- switzerland-new_format-all_years.csv
- unit_commitment.csv
- versions.csv

### resources/

- .gitkeep
- romania-winter-stress-baseline-20260428051622/
- romania-winter-stress-baseline-20260428062824/
- romania-winter-stress-baseline-20260428070142/
- romania-winter-stress-scenario-20260428070142/

### results/

- .gitkeep
- r2456/
- romania-winter-stress-baseline-20260428070142/
- romania-winter-stress-scenario-20260428070142/

### logs/

- .gitkeep
- build_osm_boundaries_BA.log
- build_osm_boundaries_MD.log
- build_osm_boundaries_UA.log
- build_osm_boundaries_XK.log
- planui/
- planui-web/
- retrieve_cutout/
- retrieve_electricity_demand.log
- retrieve_natura.log
- retrieve_osm_archive.log
- retrieve_ship_raster.log
- romania-test/
- romania-winter-stress-baseline-20260428051622/
- romania-winter-stress-baseline-20260428062824/
- romania-winter-stress-baseline-20260428070142/
- romania-winter-stress-scenario-20260428070142/

### benchmarks/

- .gitkeep
- romania-test/
- romania-winter-stress-baseline-20260428051622/
- romania-winter-stress-baseline-20260428062824/
- romania-winter-stress-baseline-20260428070142/
- romania-winter-stress-scenario-20260428070142/

### cutouts/

- .gitkeep

### profiles/

- default/

### envs/

- environment.yaml
- default_linux-64.pin.txt
- default_osx-64.pin.txt
- default_osx-arm64.pin.txt
- default_win-64.pin.txt

### docker/

- dev-env/

### LICENSES/

- CC-BY-4.0.txt
- CC-BY-SA-4.0.txt
- CC0-1.0.txt
- MIT.txt

### utils/

- create_zenodo_deposition_cli.py

### test/

- conftest.py
- test_base_network.py
- test_build_powerplants.py
- test_build_shapes.py
- test_config_schema.py
- test_data/
- test_data_versions_layer.py
- test_romania_winter_stress.py
- test_scenario_manager.py

### doc/

Subfolders:

- configtables/
- img/

Key files:

- conf.py
- index.rst
- installation.rst
- introduction.rst
- configuration.rst
- data-base-network.rst
- data-cutouts.rst
- data-repos.rst
- data_sources.rst
- preparation.rst
- solving.rst
- plotting.rst
- validation.rst
- validation_dev.rst
- sector.rst
- supply_demand.rst
- spatial_resolution.rst
- tutorial.rst
- tutorial_sector.rst
- publications.rst
- release_notes.rst
- licenses.rst
- limitations.rst
- support.rst
- wildcards.rst
- make.bat
- Makefile
- romania_guide.pdf
- data_inventory.csv
- publications.bib
- oetc.rst

## Romania-specific folders

### personal_analysis/

- analyze_scenario_11.py
- explore_scenarios.py
- generate_adversarial_configs.py
- generate_complex_config.py
- generate_configs.py
- interpret_results.py
- run_summary.py
- summarize_results.py

### personal_dashboard/

- scenario_manager/
- scenario_manager_state.json
- scenario_manager_ui.py
- visualize_scenarios_ui_v2.py

### personal_data_download/

- download_cutout.py
- download_zenodo_files.py

### personal_diagnostics/

- check_csv.py
- check_romania.py
- check_url.py
- test_snakemake.ps1

### personal_docs/

- HIGHS_GPU_SETUP_PLAN.md
- results_summary.md
- scenario_template.yaml
- scenario_template_2023.yaml
- scenario_template_complex.yaml

### personal_runners/

- run_all_scenarios.py
- run_baseline_only.bat
- run_complex_scenario.bat
- run_remaining_scenarios.py
- run_romania_winter_stress.py
- run_romania_winter_stress_direct.py
- run_scenario.bat
- run_scenario_v2.bat

### personal_scratch/

- scratch_update.py
- strip_legacy.py

### personal_tests/

- test_cutout_implementation.py

## Visualization and docs

### vizualizer/

- .claude/
- .data/
- .gitignore
- .next/
- 2026-04-28-111935-this-session-is-being-continued-from-a-previous-c.txt
- eslint.config.mjs
- next-env.d.ts
- next.config.ts
- node_modules/
- package-lock.json
- package.json
- postcss.config.mjs
- public/
- scripts/
- src/
- tsconfig.json

### vault/

- .obsidian/
- Architecture.md
- FolderStructure.md
- General.md
- Index.md
- Installation.md
- QuickStart.md
- README.md
- Running.md
- Usage.md
- Vizualizer.md
- Core/CLAUDE.md