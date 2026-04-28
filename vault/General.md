# General Documentation

This vault is the living documentation for the PyPSA-Eur Romania workspace. Start with [[Index]], then open [[Vizualizer]] for the current dashboard details.

## What the vault covers

- The Next.js vizualizer and its route handlers, API endpoints, and component architecture
- The scenario generation and run queue workflow, including job lifecycle and persistence
- The result folder structure consumed by the dashboard, with validation rules and data contracts
- The supporting repo layout and setup steps, from environment creation to first run
- Troubleshooting guides for common configuration and execution issues
- Best practices for scenario building, stress test parameters, and result interpretation

## Source notes and organization

- `vault/` - Obsidian notes kept in sync with the repo (this documentation)
- `doc/` - Upstream Sphinx documentation from the PyPSA-Eur project
- `personal_docs/` - YAML templates, scenario builders, and operational guides used by the dashboard
- `README.md` - Repo entry point and high-level overview
- `CLAUDE.md` - Repo conventions, architecture guidance, and assistant guidance for developers

## Navigation and reading order

**Getting started:**
- [[QuickStart]] - Fastest path from fresh clone to first running dashboard (5-10 minutes)
- [[Installation]] - Detailed environment setup, tool requirements, and troubleshooting
- [[General]] - This document; vault orientation and documentation map

**Using the system:**
- [[Usage]] - Day-to-day workflows: building scenarios, running jobs, viewing results
- [[Running]] - Job lifecycle, queue behavior, state management, and restart resilience
- [[Architecture]] - Deep dive into the Next.js app structure, data flows, and component responsibilities

**Reference and advanced topics:**
- [[Vizualizer]] - Complete API documentation, runtime configuration, known issues
- [[FolderStructure]] - Directory map and role of each major folder
- [[Index]] - Master index of all vault documents

## Quick reference by task

| Task | See |
|---|---|
| Fresh setup | [[QuickStart]] |
| Install dependencies | [[Installation]] |
| Build a scenario | [[Usage]] - Scenario Builder section |
| Monitor a job | [[Usage]] - Run Queue section |
| View results | [[Usage]] - Results Browser section |
| Understand job states | [[Running]] |
| Troubleshoot a failure | [[Installation]] or [[Running]] |
| Extend with new stress types | [[Architecture]] - Extensibility section |
| Add support for new year | [[CLAUDE.md]] - Adding Support for a New Year |
| Configure the dashboard | [[Vizualizer]] - Runtime configuration section |
| Understand the system flow | [[Architecture]] - High-level flow diagram |