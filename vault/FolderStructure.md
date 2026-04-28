# Project Directory Structure

This note maps the repo at a practical level, with emphasis on the current dashboard and workflow paths.

## Root folders to know

- `config/` - scenario configs, templates, schema, and generated configs
- `data/` - downloaded and curated input datasets
- `doc/` - upstream Sphinx documentation
- `envs/` - conda environment specifications
- `logs/` - Snakemake and dashboard logs
- `personal_data_download/` - data acquisition scripts
- `personal_docs/` - YAML templates and operational notes used by the dashboard
- `personal_dashboard/` - legacy Tkinter UI
- `personal_runners/` - older scenario runner scripts
- `results/` - solved networks and comparison folders
- `rules/` - Snakemake workflow rules
- `scripts/` - build, solve, report, and diagram scripts
- `vault/` - Obsidian documentation
- `vizualizer/` - current Next.js dashboard

## Vizualizer layout

- `package.json` - scripts and dependencies
- `src/app/page.tsx` - three-tab dashboard UI
- `src/app/api/` - route handlers for scenarios, runs, and results
- `src/app/lib/` - shared logic for YAML, jobs, runtime, and results
- `.data/planui-state.json` - persisted queue state
- `public/` - static assets
- `scripts/generate-diagrams.mjs` - result diagram generation helper

## Workflow folders

- `config/adversarial/generated/` - configs written by the dashboard
- `logs/planui-web/` - job logs created by the dashboard runner
- `results/` - folders scanned by the Results tab

## Notes on older material

- `personal_dashboard/` and `personal_runners/` remain in the repo for historical reference.
- The vault documentation should describe the Next.js app as the primary interface.