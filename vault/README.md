# PyPSA-Eur Romania Documentation Vault

Welcome to the operational documentation for the PyPSA-Eur Romania energy system modeling project.

This vault is the living reference for the current next-generation workflows, from scenario building through network optimization to result analysis.

## What you'll find here

- **Getting started** - Setup guides, installation steps, quick-start instructions
- **Using the system** - Day-to-day workflows for building scenarios, running simulations, and viewing results
- **Architecture** - Deep technical documentation: system design, data flows, component responsibilities
- **Operations** - Job lifecycle, queue management, state persistence, deployment

## Where to start

**Fresh setup?** → [[QuickStart]] (5-10 min from clone to first run)

**Already running?** → [[Usage]] (scenario builder, run queue, results browser)

**Need details?** → [[Architecture]] or [[Vizualizer]] (technical deep dives)

**Troubleshooting?** → [[Installation]], [[Running]], or [[CLAUDE.md]]

## Navigation

See [[Index]] for the complete map of all vault documents.

Or [[General]] for a quick reference table organized by task.

---

## Technology stack

- **Scenario Management**: Next.js 16.2.4 web dashboard (React 19, TypeScript 5, Tailwind CSS 4)
- **Workflow Orchestration**: Snakemake + Python scripts for network optimization
- **Energy System Modeling**: PyPSA for network representation and optimization
- **Solver**: SCIP (linear/integer programming)
- **Data Processing**: pandas, numpy, scipy, geopandas
- **Weather Data**: ERA5 cutouts via ECMWF MARS API
- **Legacy UI**: Tkinter-based scenario manager (stable fallback, being phased out)

---

## Project structure

```
pypsa-eur/
├── vizualizer/             ← Next.js web dashboard (primary UI)
├── config/                 ← Scenario templates and generated configs
├── scripts/                ← Core execution scripts (solving, reporting)
├── results/                ← Output folder (CSVs, figures, comparison data)
├── personal_docs/          ← YAML templates, configuration guides
├── personal_runners/       ← Convenience scripts for running scenarios
├── personal_analysis/      ← Post-processing and analysis tools
├── personal_diagnostics/   ← Validation and health-check tools
├── personal_dashboard/     ← Legacy Tkinter UI (deprecated)
├── vault/                  ← This documentation (Obsidian vault)
└── ...
```

For a complete directory map, see [[FolderStructure]].

---

## Quick reference

| Task | Documentation |
|---|---|
| Set up the environment | [[QuickStart]], [[Installation]] |
| Build and run scenarios | [[Usage]] - Scenario Builder |
| Monitor job execution | [[Usage]] - Run Queue |
| View and export results | [[Usage]] - Results Browser |
| Understand job states | [[Running]] |
| Troubleshoot errors | [[Installation]], [[Running]], [[CLAUDE.md]] |
| Add new stress types | [[Architecture]] - Extensibility |
| Configure the dashboard | [[Vizualizer]] - Runtime configuration |
| Extend with new features | [[Architecture]] - Technical deep dive |

---

## Key concepts

**Scenario** - A complete configuration defining network, time window, solver options, and optional stress test parameters

**Paired run** - Two sequential simulations: baseline (no stress) + scenario (with stress) for comparison

**Single run** - Single scenario simulation using an existing baseline for comparison

**Stress test** - Shock parameters (load multiplier, hydro reduction, etc.) applied to network before optimization

**Result** - Valid output folder containing all 7 required CSVs, figures, and optional metadata

---

## Getting help

- **Quick questions?** Check [[General]] quick reference table
- **Step-by-step guidance?** Follow [[Usage]] for scenario building and execution workflows
- **Technical details?** See [[Architecture]] or [[Vizualizer]]
- **Environment issues?** Check [[Installation]] troubleshooting section
- **Job execution problems?** See [[Running]] for job lifecycle and state management

---

## Contributing and updates

This vault is maintained alongside the repository. When you:
- Add a new feature or workflow → Update relevant documentation
- Fix a bug or change behavior → Update documentation to reflect change
- Add new stress types or shock parameters → Document in [[Architecture]]

See [[General]] and [[Index]] for document organization principles.
