# Master Index

Welcome to the consolidated PyPSA-Eur Romania documentation vault. This is the authoritative reference for the project's workflow, architecture, and operations.

## Start here — Getting oriented

- [[General]] - Vault orientation, quick reference table, and reading suggestions
- [[QuickStart]] - Fastest path from fresh clone to running dashboard (5-10 min)
- [[Installation]] - Detailed environment setup, prerequisites, and troubleshooting
- [[README.md]] - Vault welcome and getting started guide

## Core workflows and usage

- [[Usage]] - Day-to-day operations: building scenarios, monitoring runs, viewing results
- [[Running]] - How runs move through the system, job states, queue behavior, restart resilience
- [[Architecture]] - Complete system design: data flows, component responsibilities, REST API

## Reference documentation

- [[FolderStructure]] - Directory map for the repo and all major subsystems
- [[Vizualizer]] - Web dashboard technical docs: routes, API, runtime config, known issues
- [[ComplexScenario]] - Comprehensive guide: setting up complex stress-test scenarios (import cutoffs, grid resilience, 2023 data)

## Task-based reading order

If you are not sure where to start, use the task below and follow the suggested path:

- Environment setup or broken install: [[QuickStart]] → [[Installation]] → [[Running]]
- Building or editing scenarios: [[Usage]] → [[Vizualizer]] → [[Architecture]]
- Understanding job status or queue behavior: [[Running]] → [[Vizualizer]]
- Inspecting result files or contracts: [[Usage]] → [[Architecture]] → [[Vizualizer]]
- Setting up complex stress-test scenarios: [[ComplexScenario]] → [[Architecture]] → [[Usage]]
- Understanding neighbor import impacts or grid resilience: [[ComplexScenario]] → [[Running]]
- Extending stress logic: [[Architecture]] → [[CLAUDE.md]]

## Document relationships

- [[README.md]] gives the vault welcome and high-level orientation.
- [[General]] is the fastest task-oriented index when you know what you need to do.
- [[QuickStart]] is the shortest setup path.
- [[Installation]] explains prerequisites and environment setup in more detail.
- [[Usage]] explains normal day-to-day dashboard operation.
- [[Running]] explains queue semantics and lifecycle behavior.
- [[Architecture]] explains system structure, data flow, and responsibilities.
- [[Vizualizer]] explains the dashboard implementation and API surface.
- [[ComplexScenario]] provides a complete worked example: setting up advanced stress-test scenarios (Romania, import cutoffs, 2023 data) with step-by-step dashboard walkthrough and result interpretation.

## Historical and archival material

- [[Archival]] - Older notes, logs, decision records, and reference material
