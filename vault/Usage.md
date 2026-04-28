# Usage Documentation

This note explains the day-to-day workflow for the browser dashboard.

## Scenario Builder

Use the Builder tab to create the YAML for a scenario run.

- Choose paired mode when you want baseline and scenario runs generated together.
- Choose single mode when you already have a reference baseline network.
- Set the scenario slug, country list, snapshot window, cutout year, cluster count, and solver options.
- Toggle the stress-test controls for load, hydro, gas, SCADA, and import caps.
- Use the YAML sync buttons to move between the form state and the working YAML editor.

Important validation rules:

- Snapshot start must be before or equal to snapshot end.
- Snapshot dates must match the selected cutout year.
- Single mode requires a reference baseline network path.

## Run Queue

Use the Run Queue tab to inspect jobs and control execution.

- Jobs are executed one at a time.
- The table shows job id, status, mode, output folder, and progress text.
- Details view shows the selected job spec and the log tail.
- Cancel stops a queued job immediately or requests termination for a running job.
- Delete removes the job record.
- Reset clears the runner state and marks any interrupted job accordingly.

## Results Browser

Use the Results tab to inspect comparison outputs.

- The dashboard scans `results/` and only shows folders with the required seven CSV files.
- Summary metrics include baseline cost, scenario cost, delta percent, ENS, shedding hours, max shedding MW, imports delta, and LMP statistics.
- CSV previews are available for each supported file.
- PNG figures are shown directly in the UI.
- `assumptions_limitations.md` is displayed when present.
- Drawio and SVG assets are exposed for download.

## Typical workflow

1. Open the Builder tab and prepare the scenario.
2. Sync or edit the YAML if needed.
3. Enqueue the run.
4. Watch the Run Queue until the job completes.
5. Open the result folder in the Results tab and review the summary and artifacts.

## Useful paths

- Generated configs are written to `config/adversarial/generated/`.
- Job logs go to `logs/planui-web/`.
- Persistent queue state is stored in `vizualizer/.data/planui-state.json`.