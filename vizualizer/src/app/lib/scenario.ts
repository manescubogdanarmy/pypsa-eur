import fs from "fs/promises";
import path from "path";
import YAML from "yaml";

import { generatedConfigDir, templatesDir } from "./paths";
import { resolveRuntimePrefixes, snakemakeExtraArgs } from "./runtime";
import type { CommandSpec, ScenarioInputs, ScenarioInputsPayload } from "./types";

const DEFAULT_TEMPLATE = "scenario_template.yaml";
const YEAR_TEMPLATE = "scenario_template_2023.yaml";

export type ConfigBuildResult = {
  generatedConfigs: { scenario: string; baseline?: string | null };
  scenarioRunName: string;
  baselineRunName?: string | null;
  scenarioNetworkTarget: string;
  baselineNetworkTarget?: string | null;
  reportOutdir: string;
  scenarioConfig: Record<string, unknown>;
  baselineConfig?: Record<string, unknown> | null;
};

function sanitizeSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-|-$/g, "") || "scenario";
}

function ensureMapping(parent: Record<string, unknown>, key: string): Record<string, unknown> {
  const current = parent[key];
  if (current && typeof current === "object" && !Array.isArray(current)) {
    return current as Record<string, unknown>;
  }
  const created: Record<string, unknown> = {};
  parent[key] = created;
  return created;
}

function parseNumber(raw: number | string | undefined, name: string): number {
  const value = typeof raw === "string" ? Number(raw) : raw;
  if (value === undefined || Number.isNaN(value) || !Number.isFinite(value)) {
    throw new Error(`Invalid ${name}.`);
  }
  return value;
}

function parseIntValue(raw: number | string | undefined, name: string): number {
  const value = parseNumber(raw, name);
  return Math.trunc(value);
}

function parseDateValue(raw: string | undefined, name: string): string {
  const value = (raw || "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error(`Invalid ${name}. Use YYYY-MM-DD.`);
  }
  return value;
}

function yearFromDate(value: string): string {
  return value.slice(0, 4);
}

export function normalizeScenarioInputs(payload: ScenarioInputsPayload): ScenarioInputs {
  const runMode = payload.runMode === "single" ? "single" : "paired";
  const cutoutYear = payload.cutoutYear === "2023" ? "2023" : "2020";
  const snapshotStart = parseDateValue(payload.snapshotStart, "snapshot start");
  const snapshotEnd = parseDateValue(payload.snapshotEnd, "snapshot end");

  if (snapshotStart > snapshotEnd) {
    throw new Error("Snapshot start must be before or equal to snapshot end.");
  }

  if (yearFromDate(snapshotStart) !== cutoutYear || yearFromDate(snapshotEnd) !== cutoutYear) {
    throw new Error("Snapshot dates must match the selected cutout year.");
  }

  return {
    runMode,
    outputName: (payload.outputName || "").trim(),
    scenarioSlug: (payload.scenarioSlug || "").trim(),
    country: (payload.country || "RO").trim().toUpperCase(),
    countries: (payload.countries || "RO,BG,HU,RS").trim(),
    snapshotStart,
    snapshotEnd,
    cutoutYear,
    clusters: parseIntValue(payload.clusters ?? 10, "clusters"),
    solverName: (payload.solverName || "highs").trim(),
    solverOptions: (payload.solverOptions || "highs-simplex").trim(),
    referenceBaselineNet: payload.referenceBaselineNet || null,
    stressEnable: payload.stressEnable !== false,
    stressLoad: parseNumber(payload.stressLoad ?? 1.12, "stress load"),
    stressHydro: parseNumber(payload.stressHydro ?? 0.6, "stress hydro"),
    stressGas: parseNumber(payload.stressGas ?? 0.7, "stress gas"),
    scadaTight: parseIntValue(payload.scadaTight ?? 24, "scada tight hours"),
    scadaRelaxed: parseIntValue(payload.scadaRelaxed ?? 48, "scada relaxed hours"),
    scadaRampTight: parseNumber(payload.scadaRampTight ?? 0.1, "scada ramp tight"),
    scadaRampRelaxed: parseNumber(payload.scadaRampRelaxed ?? 0.25, "scada ramp relaxed"),
    importZero: parseIntValue(payload.importZero ?? 48, "import zero hours"),
    importHalf: parseIntValue(payload.importHalf ?? 48, "import half hours"),
    importFactor: parseNumber(payload.importFactor ?? 0.5, "import half factor"),
    workingYaml: payload.workingYaml || null,
  };
}

function resolveTemplatePath(cutoutYear: string): string {
  if (cutoutYear === "2023") {
    const yearPath = path.join(templatesDir(), YEAR_TEMPLATE);
    return yearPath;
  }
  return path.join(templatesDir(), DEFAULT_TEMPLATE);
}

async function readTemplateText(cutoutYear: string): Promise<string> {
  const basePath = path.join(templatesDir(), DEFAULT_TEMPLATE);
  const yearPath = path.join(templatesDir(), YEAR_TEMPLATE);

  if (cutoutYear === "2023") {
    try {
      return await fs.readFile(yearPath, "utf-8");
    } catch {
      return await fs.readFile(basePath, "utf-8");
    }
  }

  return await fs.readFile(basePath, "utf-8");
}

export async function loadTemplateText(cutoutYear: string): Promise<string> {
  return readTemplateText(cutoutYear);
}

async function loadTemplateConfig(cutoutYear: string): Promise<Record<string, unknown>> {
  const raw = await readTemplateText(cutoutYear);
  const parsed = YAML.parse(raw);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("Template must be a YAML mapping.");
  }
  return parsed as Record<string, unknown>;
}

function parseWorkingYaml(text: string): Record<string, unknown> {
  const parsed = YAML.parse(text);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("Working YAML must be a mapping.");
  }
  return parsed as Record<string, unknown>;
}

function applyInputsToConfig(
  baseCfg: Record<string, unknown>,
  inputs: ScenarioInputs,
  runName: string,
  stressEnabled: boolean,
): Record<string, unknown> {
  const cfg = structuredClone(baseCfg);

  const runCfg = ensureMapping(cfg, "run");
  runCfg.name = runName;
  if (runCfg.disable_progressbar === undefined) {
    runCfg.disable_progressbar = true;
  }
  if (runCfg.shared_resources === undefined) {
    runCfg.shared_resources = { policy: false };
  }

  const scenarioCfg = ensureMapping(cfg, "scenario");
  scenarioCfg.clusters = [inputs.clusters];
  if (!scenarioCfg.opts) {
    scenarioCfg.opts = [""];
  }

  const countries = inputs.countries
    .split(",")
    .map((entry) => entry.trim().toUpperCase())
    .filter(Boolean);
  cfg.countries = countries.length ? countries : [inputs.country];

  const snapshots = ensureMapping(cfg, "snapshots");
  snapshots.start = inputs.snapshotStart;
  snapshots.end = inputs.snapshotEnd;

  const solving = ensureMapping(cfg, "solving");
  const solver = ensureMapping(solving, "solver");
  solver.name = inputs.solverName;
  solver.options = inputs.solverOptions;

  const stress = ensureMapping(cfg, "stress_test");
  stress.enable = Boolean(stressEnabled);
  stress.country = inputs.country;
  stress.load_factor_full_window = inputs.stressLoad;
  stress.hydro_factor_full_window = inputs.stressHydro;
  stress.gas_factor_first_72h = inputs.stressGas;
  stress.scada = {
    tight_hours: inputs.scadaTight,
    relaxed_hours: inputs.scadaRelaxed,
    ramp_tight_per_hour: inputs.scadaRampTight,
    ramp_relaxed_per_hour: inputs.scadaRampRelaxed,
  };
  stress.import_cap = {
    zero_hours: inputs.importZero,
    half_hours: inputs.importHalf,
    half_factor: inputs.importFactor,
  };

  return cfg;
}

function applyCutoutToConfig(cfg: Record<string, unknown>, cutoutYear: string): void {
  const cutoutName = `europe-${cutoutYear}-sarah3-era5`;
  const atlite = ensureMapping(cfg, "atlite");
  const cutouts = ensureMapping(atlite, "cutouts");
  if (!cutouts[cutoutName]) {
    throw new Error(`Cutout ${cutoutName} not defined in template.`);
  }
  atlite.default_cutout = cutoutName;

  const electricity = cfg.electricity;
  if (electricity && typeof electricity === "object" && !Array.isArray(electricity)) {
    const estimate = (electricity as Record<string, unknown>).estimate_renewable_capacities;
    if (estimate && typeof estimate === "object" && !Array.isArray(estimate)) {
      (estimate as Record<string, unknown>).year = Number(cutoutYear);
    }
  }

  const snapshots = cfg.snapshots;
  if (snapshots && typeof snapshots === "object" && !Array.isArray(snapshots)) {
    const start = String((snapshots as Record<string, unknown>).start || "");
    const end = String((snapshots as Record<string, unknown>).end || "");
    if (yearFromDate(start) !== cutoutYear || yearFromDate(end) !== cutoutYear) {
      throw new Error("Snapshot dates must match the selected cutout year.");
    }
  }
}

function nowToken(): string {
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, "0");
  return (
    now.getUTCFullYear().toString() +
    pad(now.getUTCMonth() + 1) +
    pad(now.getUTCDate()) +
    pad(now.getUTCHours()) +
    pad(now.getUTCMinutes()) +
    pad(now.getUTCSeconds())
  );
}

function networkTarget(runName: string, clusters: number): string {
  return path.join("results", runName, "networks", `base_s_${clusters}_elec_.nc`);
}

function toPosixPath(value: string): string {
  return value.split(path.sep).join(path.posix.sep);
}

export async function buildWorkingYaml(inputs: ScenarioInputs): Promise<string> {
  const templateConfig = await loadTemplateConfig(inputs.cutoutYear);
  const base = inputs.workingYaml ? parseWorkingYaml(inputs.workingYaml) : structuredClone(templateConfig);
  const runName = sanitizeSlug(inputs.scenarioSlug || "working-draft");
  const config = applyInputsToConfig(base, inputs, runName, inputs.stressEnable);
  return YAML.stringify(config);
}

export async function buildConfigs(inputs: ScenarioInputs): Promise<ConfigBuildResult> {
  if (!inputs.outputName) {
    throw new Error("Output name is required.");
  }

  const reportOutdir = path.join("results", inputs.outputName);
  try {
    await fs.access(reportOutdir);
    throw new Error("Result output folder already exists.");
  } catch {
    // ok
  }

  if (inputs.runMode === "single") {
    if (!inputs.referenceBaselineNet) {
      throw new Error("Single mode requires a reference baseline network.");
    }
    try {
      await fs.access(inputs.referenceBaselineNet);
    } catch {
      throw new Error("Reference baseline network does not exist.");
    }
  }

  const templateConfig = await loadTemplateConfig(inputs.cutoutYear);
  const base = inputs.workingYaml ? parseWorkingYaml(inputs.workingYaml) : structuredClone(templateConfig);
  const token = nowToken();
  const slug = sanitizeSlug(inputs.scenarioSlug || inputs.outputName);

  const scenarioRunName = `${slug}-scenario-${token}`;
  const baselineRunName = inputs.runMode === "paired" ? `${slug}-baseline-${token}` : null;

  const scenarioConfig = applyInputsToConfig(base, inputs, scenarioRunName, inputs.stressEnable);
  applyCutoutToConfig(scenarioConfig, inputs.cutoutYear);

  let baselineConfig: Record<string, unknown> | null = null;
  if (inputs.runMode === "paired" && baselineRunName) {
    baselineConfig = applyInputsToConfig(base, inputs, baselineRunName, false);
    applyCutoutToConfig(baselineConfig, inputs.cutoutYear);
  }

  await fs.mkdir(generatedConfigDir(), { recursive: true });
  const scenarioCfgPath = path.join(generatedConfigDir(), `${slug}_${token}_scenario.yaml`);
  await fs.writeFile(scenarioCfgPath, YAML.stringify(scenarioConfig), "utf-8");

  const generatedConfigs: { scenario: string; baseline?: string | null } = {
    scenario: scenarioCfgPath,
  };

  let baselineCfgPath: string | null = null;
  if (baselineConfig) {
    baselineCfgPath = path.join(generatedConfigDir(), `${slug}_${token}_baseline.yaml`);
    await fs.writeFile(baselineCfgPath, YAML.stringify(baselineConfig), "utf-8");
    generatedConfigs.baseline = baselineCfgPath;
  }

  const scenarioTarget = networkTarget(scenarioRunName, inputs.clusters);
  const baselineTarget = baselineRunName ? networkTarget(baselineRunName, inputs.clusters) : null;

  return {
    generatedConfigs,
    scenarioRunName,
    baselineRunName,
    scenarioNetworkTarget: scenarioTarget,
    baselineNetworkTarget: baselineTarget,
    reportOutdir,
    scenarioConfig,
    baselineConfig,
  };
}

export function buildCommands(inputs: ScenarioInputs, buildResult: ConfigBuildResult): CommandSpec[] {
  const runtime = resolveRuntimePrefixes();
  const extraArgs = snakemakeExtraArgs();
  const scenarioCfg = buildResult.generatedConfigs.scenario;
  const scenarioTarget = toPosixPath(buildResult.scenarioNetworkTarget);
  const reportOutdir = buildResult.reportOutdir;

  const commands: CommandSpec[] = [];

  if (inputs.runMode === "paired") {
    const baselineCfg = buildResult.generatedConfigs.baseline;
    const baselineTarget = buildResult.baselineNetworkTarget;
    if (!baselineCfg || !baselineTarget) {
      throw new Error("Paired mode requires a baseline config and target.");
    }

    commands.push(
      {
        argv: [...runtime.snakemake, ...extraArgs, "--unlock", "--configfile", baselineCfg],
        description: `Unlock baseline workflow [${runtime.runtimeMode}]`,
        allowFailure: true,
      },
      {
        argv: [
          ...runtime.snakemake,
          ...extraArgs,
          "-c",
          "all",
          toPosixPath(baselineTarget),
          "--configfile",
          baselineCfg,
        ],
        description: `Solve baseline scenario [${runtime.runtimeMode}]`,
      },
    );
  }

  const baselineNet =
    inputs.runMode === "paired"
      ? toPosixPath(buildResult.baselineNetworkTarget || "")
      : String(inputs.referenceBaselineNet || "");

  commands.push(
    {
      argv: [...runtime.snakemake, ...extraArgs, "--unlock", "--configfile", scenarioCfg],
      description: `Unlock scenario workflow [${runtime.runtimeMode}]`,
      allowFailure: true,
    },
    {
      argv: [
        ...runtime.snakemake,
        ...extraArgs,
        "-c",
        "all",
        scenarioTarget,
        "--configfile",
        scenarioCfg,
      ],
      description: `Solve scenario [${runtime.runtimeMode}]`,
    },
    {
      argv: [
        ...runtime.python,
        "scripts/report_romania_winter_stress.py",
        "--baseline-net",
        baselineNet,
        "--scenario-net",
        scenarioTarget,
        "--country",
        inputs.country,
        "--outdir",
        reportOutdir,
      ],
      description: `Generate comparison report [${runtime.runtimeMode}]`,
    },
  );

  return commands;
}
