# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PyPSA-Eur is an open optimisation model of the European energy system built using the PyPSA framework. It includes a Snakemake-based workflow for data processing, network building, and optimization solving. This repository has been extended with custom Romania-focused analysis tools and scenarios.

## Development Commands

### Environment Management
- `pixi install` - Install all dependencies via pixi package manager
- `pixi shell` - Activate the development environment

### Testing
- `pixi run integration-tests` - Run complete integration tests (electricity, overnight, myopic scenarios)
- `pixi run unit-tests` - Run unit tests with pytest
- `pixi run all-tests` - Run both integration and unit tests
- `pixi run clean-tests` - Clean up test outputs

### Code Quality
- `pre-commit run --all-files` - Run all pre-commit hooks (ruff, codespell, snakefmt)
- `ruff check .` - Run linting
- `ruff format .` - Run code formatting

### Workflow Execution
- `snakemake -n` - Dry run to show workflow plan
- `snakemake -j1` - Execute workflow with single core
- `snakemake --configfile config/romania.yaml -n` - Run with specific config
- `snakemake solve_elec_networks --configfile config/test/config.electricity.yaml` - Run specific rule

### Documentation
- `pixi run -e doc build-docs` - Build documentation using Sphinx

## Architecture Overview

### Core Structure
- **Snakefile** - Main workflow definition using Snakemake
- **scripts/** - Python scripts for data processing, network building, and analysis
- **rules/** - Modular Snakemake rule files for different workflow components
- **config/** - YAML configuration files defining scenarios and parameters
- **data/** - Input data files and external datasets
- **resources/** - Intermediate workflow outputs
- **results/** - Final optimization results and analysis outputs

### Key Components

#### Workflow Rules (rules/)
- `build_electricity.smk` - Electrical network construction
- `build_sector.smk` - Multi-sector coupling (heat, transport, industry)
- `solve_electricity.smk` - Power-only optimization
- `solve_overnight.smk` - Long-term capacity expansion
- `solve_myopic.smk` - Multi-period planning
- `postprocess.smk` - Results processing and visualization

#### Script Categories (scripts/)
- **build_*.py** - Data preparation and network assembly
- **add_*.py** - Component addition (electricity, brownfield, transmission)
- **retrieve_*.py** - External data downloading
- **plot_*.py** - Visualization and reporting
- **lib/validation/** - Configuration validation schemas

#### Configuration System
- `config.default.yaml` - Base configuration template
- `romania*.yaml` - Romania-specific scenario configurations  
- `adversarial/` - Stress testing scenarios
- `test/` - Test configurations for CI/CD

### Custom Romania Analysis Extensions

#### Analysis Tools (1_piele_analysis/)
- Configuration generation for scenario studies
- Results interpretation and summary reporting
- Adversarial scenario creation (10 stress test types)

#### Execution Scripts (1_piele_runners/)
- Automated scenario batch execution
- Seasonal analysis workflows (5 seasons: winter, spring, summer, autumn, december)

#### Visualization (1_piele_dashboard/)
- Interactive Streamlit dashboards for scenario comparison
- Network analysis and plotting tools

#### Diagnostics (1_piele_diagnostics/)
- Configuration validation utilities
- Data source connectivity testing
- Workflow integrity checks

## Configuration Patterns

### Scenario Definition
Scenarios are defined through YAML configuration files that override defaults:
- Country selection via `countries` key
- Technology constraints via `renewable`, `conventional` sections
- Solver options via `solving` section
- Time periods via `snapshots` section

### Custom Romania Scenarios
- **Baseline scenarios** - Standard operations across seasons
- **Stress scenarios** - Infrastructure failure simulations
- **Adversarial scenarios** - Combined crisis conditions

## Data Flow

1. **Retrieve** - Download external data (ENTSO-E, weather, costs)
2. **Build** - Process data into network components
3. **Add** - Assemble complete network models
4. **Solve** - Run optimization with PyPSA
5. **Postprocess** - Generate reports and visualizations

## Dependencies and Tools

- **PyPSA** - Core optimization framework
- **Snakemake** - Workflow management (≥9.0 required)
- **Atlite** - Weather data processing for renewables
- **Ruff** - Code linting and formatting
- **Pytest** - Unit testing framework
- **Gurobi/HiGHS** - Optimization solvers
- **Streamlit** - Interactive dashboards

## Development Workflow

1. Use `pixi shell` to activate environment
2. Create/modify configuration in `config/`
3. Test changes with `snakemake -n` dry run
4. Run `pre-commit run --all-files` before committing
5. Execute relevant test suites before major changes
6. Use `pixi run integration-tests` to validate workflow integrity