"use client";

import { useEffect, useMemo, useState } from "react";
import YAML from "yaml";

import type { CsvPreview, JobRecord, ResultEntry } from "@/app/lib/types";

type TabKey = "builder" | "runs" | "results";

type ScenarioInputsState = {
  runMode: "paired" | "single";
  outputName: string;
  scenarioSlug: string;
  country: string;
  countries: string;
  snapshotStart: string;
  snapshotEnd: string;
  cutoutYear: "2020" | "2023";
  clusters: string;
  solverName: string;
  solverOptions: string;
  referenceBaselineNet: string;
  stressEnable: boolean;
  stressLoad: string;
  stressHydro: string;
  stressGas: string;
  scadaTight: string;
  scadaRelaxed: string;
  scadaRampTight: string;
  scadaRampRelaxed: string;
  importZero: string;
  importHalf: string;
  importFactor: string;
};

type ResultDetails = {
  summary: Record<string, string>;
  csvFiles: string[];
  figureFiles: string[];
  assumptions: string;
};

type ChartPack = {
  cost?: CsvPreview | null;
  generation?: CsvPreview | null;
  congestion?: CsvPreview | null;
  prices?: CsvPreview | null;
  ens?: CsvPreview | null;
};

const defaultInputs: ScenarioInputsState = {
  runMode: "paired",
  outputName: "",
  scenarioSlug: "romania-winter-stress",
  country: "RO",
  countries: "RO,BG,HU,RS",
  snapshotStart: "2020-12-01",
  snapshotEnd: "2020-12-08",
  cutoutYear: "2020",
  clusters: "10",
  solverName: "highs",
  solverOptions: "highs-simplex",
  referenceBaselineNet: "",
  stressEnable: true,
  stressLoad: "1.12",
  stressHydro: "0.60",
  stressGas: "0.70",
  scadaTight: "24",
  scadaRelaxed: "48",
  scadaRampTight: "0.10",
  scadaRampRelaxed: "0.25",
  importZero: "48",
  importHalf: "48",
  importFactor: "0.50",
};

const copy = {
  en: {
    brand: "PlanUI Vizualizer",
    title: "Romania Scenario Control Room",
    subtitle: "Build stress test runs, watch the queue, and explore new-format comparison reports.",
    metricQueue: "Queue",
    metricResults: "Results",
    metricStatus: "Status",
    metricJobsSuffix: "jobs",
    metricReadySuffix: "ready",
    metricQueueHintActive: "Active run in progress",
    metricQueueHintIdle: "Idle",
    metricResultsHint: "New-format folders",
    tabBuilder: "Scenario Builder",
    tabRuns: "Run Queue",
    tabResults: "Results",
    tabSyncYaml: "Sync YAML",
    sectionBuilderTitle: "Scenario Builder",
    sectionBuilderSubtitle:
      "Use structured controls or edit YAML directly. Generated configs go to config/adversarial/generated.",
    sectionCoreInputs: "Core Inputs",
    fieldRunMode: "Run mode",
    runModePaired: "Paired (baseline + scenario)",
    runModeSingle: "Single (reference baseline)",
    fieldOutputName: "Output name",
    fieldScenarioSlug: "Scenario slug",
    fieldStressCountry: "Stress country",
    fieldCountries: "Countries (comma separated)",
    fieldSnapshotStart: "Snapshot start",
    fieldSnapshotEnd: "Snapshot end",
    fieldCutoutYear: "Cutout year",
    fieldClusters: "Clusters",
    fieldSolverName: "Solver name",
    fieldSolverOptions: "Solver options",
    fieldReferenceBaseline: "Reference baseline network",
    fieldBaselinePlaceholder: "Select baseline network",
    sectionStressControls: "Stress Controls",
    fieldStressEnable: "Enable stress test",
    fieldStressLoad: "Load factor",
    fieldStressHydro: "Hydro factor",
    fieldStressGas: "Gas factor",
    fieldScadaTight: "SCADA tight hours",
    fieldScadaRelaxed: "SCADA relaxed hours",
    fieldScadaRampTight: "SCADA ramp tight",
    fieldScadaRampRelaxed: "SCADA ramp relaxed",
    fieldImportZero: "Import cap zero hours",
    fieldImportHalf: "Import cap half hours",
    fieldImportFactor: "Import half factor",
    buttonApplyControls: "Apply controls to YAML",
    buttonApplyYaml: "Apply YAML to controls",
    buttonRefreshBaselines: "Refresh baselines",
    buttonEnqueueRun: "Enqueue run",
    yamlWorkingTitle: "Working YAML",
    yamlTemplateTitle: "Template YAML (read-only)",
    sectionRunsTitle: "Run Queue",
    sectionRunsSubtitle:
      "Queue runs, watch progress, and open logs. Runs are executed sequentially with conda-aware commands.",
    runsQueueTitle: "Queue and history",
    buttonRefresh: "Refresh",
    tableJob: "Job",
    tableStatus: "Status",
    tableMode: "Mode",
    tableOutput: "Output",
    tableProgress: "Progress",
    tableActions: "Actions",
    buttonDetails: "Details",
    buttonCancel: "Cancel",
    runsSelectedTitle: "Selected job",
    runsOutputLabel: "Output",
    runsCreatedLabel: "Created",
    runsStatusLabel: "Status",
    runsLogLabel: "Log file",
    runsLogTail: "Log tail",
    runsLogEmpty: "No log output yet.",
    runsSelectHelp: "Select a job to inspect commands and log output.",
    sectionResultsTitle: "Results and Vizualizer",
    sectionResultsSubtitle:
      "Preview new-format comparison results with summaries, charts, CSV tables, and figures.",
    resultsFoldersTitle: "Result folders",
    resultsUpdatedLabel: "Updated",
    summaryTitle: "Summary",
    summaryBaselineCost: "Baseline cost",
    summaryScenarioCost: "Scenario cost",
    summaryDeltaPercent: "Delta percent",
    summaryEns: "ENS MWh",
    summarySheddingHours: "Shedding hours",
    summaryMaxShedding: "Max shedding MW",
    summaryImportsDelta: "Imports delta MWh",
    summaryLmpMean: "LMP mean",
    summarySelectHelp: "Select a result to preview summary metrics.",
    chartGeneration: "Generation mix",
    chartCongestion: "Congestion loading",
    chartLmp: "LMP comparison",
    chartCsvPreview: "CSV preview",
    csvSelectHelp: "Select a result to view CSV data.",
    figuresTitle: "Figures",
    figuresEmpty: "No figure files found.",
    assumptionsTitle: "Assumptions",
    assumptionsEmpty: "No assumptions_limitations.md found.",
    dataTableEmpty: "Select a CSV file to preview rows.",
    chartEmpty: "No chart data available.",
    chartBaseline: "Baseline",
    chartScenario: "Scenario",
    labelMean: "Mean",
    labelP95: "P95",
    labelMax: "Max",
    labelCarrierFallback: "Carrier",
    labelLineFallback: "Line",
    languageLabel: "Language",
    statusReady: "Ready.",
    statusBuildingYaml: "Building working YAML...",
    statusYamlUpdated: "Working YAML updated.",
    statusYamlApplied: "Controls updated from YAML.",
    statusYamlInvalid: "Invalid YAML.",
    statusLoadTemplateFailed: "Failed to load template.",
    statusBuildYamlFailed: "Failed to build YAML.",
    statusLoadBaselinesFailed: "Failed to load baselines.",
    statusLoadJobsFailed: "Failed to load jobs.",
    statusLoadResultsFailed: "Failed to load results.",
    statusQueueingRun: "Queueing run...",
    statusJobQueued: "Job queued",
    statusQueueFailed: "Failed to queue run.",
    statusCancelFailed: "Failed to cancel job.",
    statusLoadResultFailed: "Failed to load result.",
    statusLoadCsvFailed: "Failed to load CSV preview.",
  },
  ro: {
    brand: "PlanUI Vizualizer",
    title: "Camera de Control Scenarii Romania",
    subtitle: "Construieste rulari de stress, urmareste coada, exploreaza rapoarte comparatie format nou.",
    metricQueue: "Coada",
    metricResults: "Rezultate",
    metricStatus: "Status",
    metricJobsSuffix: "joburi",
    metricReadySuffix: "gata",
    metricQueueHintActive: "Rulare activa in progres",
    metricQueueHintIdle: "Inactiv",
    metricResultsHint: "Foldere format nou",
    tabBuilder: "Builder Scenarii",
    tabRuns: "Coada Rulari",
    tabResults: "Rezultate",
    tabSyncYaml: "Sincronizeaza YAML",
    sectionBuilderTitle: "Builder Scenarii",
    sectionBuilderSubtitle:
      "Foloseste controale structurate sau editeaza YAML. Configuri generate in config/adversarial/generated.",
    sectionCoreInputs: "Inputuri de baza",
    fieldRunMode: "Mod rulare",
    runModePaired: "Pereche (baza + scenariu)",
    runModeSingle: "Single (baza referinta)",
    fieldOutputName: "Nume output",
    fieldScenarioSlug: "Slug scenariu",
    fieldStressCountry: "Tara stress",
    fieldCountries: "Tari (separate prin virgula)",
    fieldSnapshotStart: "Start snapshots",
    fieldSnapshotEnd: "End snapshots",
    fieldCutoutYear: "An cutout",
    fieldClusters: "Clustere",
    fieldSolverName: "Nume solver",
    fieldSolverOptions: "Optiuni solver",
    fieldReferenceBaseline: "Retea baza referinta",
    fieldBaselinePlaceholder: "Selecteaza reteaua baza",
    sectionStressControls: "Controale Stress",
    fieldStressEnable: "Activeaza stress test",
    fieldStressLoad: "Factor load",
    fieldStressHydro: "Factor hidro",
    fieldStressGas: "Factor gaz",
    fieldScadaTight: "Ore SCADA tight",
    fieldScadaRelaxed: "Ore SCADA relaxed",
    fieldScadaRampTight: "Rampa SCADA tight",
    fieldScadaRampRelaxed: "Rampa SCADA relaxed",
    fieldImportZero: "Ore import zero",
    fieldImportHalf: "Ore import half",
    fieldImportFactor: "Factor import half",
    buttonApplyControls: "Aplica controale -> YAML",
    buttonApplyYaml: "Aplica YAML -> controale",
    buttonRefreshBaselines: "Refresh baze",
    buttonEnqueueRun: "Pune in coada",
    yamlWorkingTitle: "Working YAML",
    yamlTemplateTitle: "Template YAML (read-only)",
    sectionRunsTitle: "Coada Rulari",
    sectionRunsSubtitle:
      "Pune rulari in coada, urmareste progresul, deschide loguri. Rularile se executa secvential cu comenzi conda.",
    runsQueueTitle: "Coada si istoric",
    buttonRefresh: "Refresh",
    tableJob: "Job",
    tableStatus: "Status",
    tableMode: "Mod",
    tableOutput: "Output",
    tableProgress: "Progres",
    tableActions: "Actiuni",
    buttonDetails: "Detalii",
    buttonCancel: "Anuleaza",
    runsSelectedTitle: "Job selectat",
    runsOutputLabel: "Output",
    runsCreatedLabel: "Creat",
    runsStatusLabel: "Status",
    runsLogLabel: "Fisier log",
    runsLogTail: "Ultimele linii log",
    runsLogEmpty: "Inca nu exista log.",
    runsSelectHelp: "Selecteaza un job pentru detalii si log.",
    sectionResultsTitle: "Rezultate si Vizualizer",
    sectionResultsSubtitle:
      "Previzualizeaza rezultate format nou cu rezumat, grafice, CSV si figuri.",
    resultsFoldersTitle: "Foldere rezultate",
    resultsUpdatedLabel: "Actualizat",
    summaryTitle: "Rezumat",
    summaryBaselineCost: "Cost baza",
    summaryScenarioCost: "Cost scenariu",
    summaryDeltaPercent: "Delta procent",
    summaryEns: "ENS MWh",
    summarySheddingHours: "Ore shedding",
    summaryMaxShedding: "Max shedding MW",
    summaryImportsDelta: "Delta import MWh",
    summaryLmpMean: "LMP medie",
    summarySelectHelp: "Selecteaza un rezultat pentru rezumat.",
    chartGeneration: "Mix generatie",
    chartCongestion: "Incarcare congestie",
    chartLmp: "Comparatie LMP",
    chartCsvPreview: "Previzualizare CSV",
    csvSelectHelp: "Selecteaza un rezultat pentru date CSV.",
    figuresTitle: "Figuri",
    figuresEmpty: "Nu exista figuri.",
    assumptionsTitle: "Asumptii",
    assumptionsEmpty: "Nu exista assumptions_limitations.md.",
    dataTableEmpty: "Selecteaza un CSV pentru previzualizare.",
    chartEmpty: "Nu exista date pentru grafic.",
    chartBaseline: "Baza",
    chartScenario: "Scenariu",
    labelMean: "Medie",
    labelP95: "P95",
    labelMax: "Max",
    labelCarrierFallback: "Tehnologie",
    labelLineFallback: "Linie",
    languageLabel: "Limba",
    statusReady: "Gata.",
    statusBuildingYaml: "Construiesc YAML...",
    statusYamlUpdated: "Working YAML actualizat.",
    statusYamlApplied: "Controale actualizate din YAML.",
    statusYamlInvalid: "YAML invalid.",
    statusLoadTemplateFailed: "Nu pot incarca template.",
    statusBuildYamlFailed: "Nu pot construi YAML.",
    statusLoadBaselinesFailed: "Nu pot incarca bazele.",
    statusLoadJobsFailed: "Nu pot incarca joburile.",
    statusLoadResultsFailed: "Nu pot incarca rezultatele.",
    statusQueueingRun: "Pun rularea in coada...",
    statusJobQueued: "Job pus in coada",
    statusQueueFailed: "Nu pot pune in coada.",
    statusCancelFailed: "Nu pot anula job.",
    statusLoadResultFailed: "Nu pot incarca rezultatul.",
    statusLoadCsvFailed: "Nu pot incarca previzualizarea CSV.",
  },
} as const;

type Language = keyof typeof copy;

function formatNumber(value: string | number | undefined, digits = 2, locale = "en-US"): string {
  const num = typeof value === "string" ? Number(value) : value ?? NaN;
  if (!Number.isFinite(num)) {
    return "-";
  }
  return num.toLocaleString(locale, { maximumFractionDigits: digits });
}

function formatCurrency(value: string | number | undefined, locale = "en-US"): string {
  const num = typeof value === "string" ? Number(value) : value ?? NaN;
  if (!Number.isFinite(num)) {
    return "-";
  }
  if (Math.abs(num) >= 1e9) {
    return `${(num / 1e9).toLocaleString(locale, { maximumFractionDigits: 2 })}B EUR`;
  }
  if (Math.abs(num) >= 1e6) {
    return `${(num / 1e6).toLocaleString(locale, { maximumFractionDigits: 2 })}M EUR`;
  }
  return `${num.toLocaleString(locale, { maximumFractionDigits: 2 })} EUR`;
}

function buildPayload(inputs: ScenarioInputsState, workingYaml: string) {
  return {
    runMode: inputs.runMode,
    outputName: inputs.outputName,
    scenarioSlug: inputs.scenarioSlug,
    country: inputs.country,
    countries: inputs.countries,
    snapshotStart: inputs.snapshotStart,
    snapshotEnd: inputs.snapshotEnd,
    cutoutYear: inputs.cutoutYear,
    clusters: Number(inputs.clusters || 0),
    solverName: inputs.solverName,
    solverOptions: inputs.solverOptions,
    referenceBaselineNet: inputs.referenceBaselineNet || null,
    stressEnable: inputs.stressEnable,
    stressLoad: Number(inputs.stressLoad),
    stressHydro: Number(inputs.stressHydro),
    stressGas: Number(inputs.stressGas),
    scadaTight: Number(inputs.scadaTight),
    scadaRelaxed: Number(inputs.scadaRelaxed),
    scadaRampTight: Number(inputs.scadaRampTight),
    scadaRampRelaxed: Number(inputs.scadaRampRelaxed),
    importZero: Number(inputs.importZero),
    importHalf: Number(inputs.importHalf),
    importFactor: Number(inputs.importFactor),
    workingYaml,
  };
}

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = (await response.json()) as T & { error?: string };
  if (!response.ok) {
    const message = (data as { error?: string }).error || "Request failed.";
    throw new Error(message);
  }
  return data;
}

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-2xl font-display text-ink">{title}</h2>
      <p className="text-sm text-muted max-w-2xl">{subtitle}</p>
    </div>
  );
}

function MetricCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="glass rounded-xl p-4 flex flex-col gap-2">
      <span className="text-xs uppercase tracking-[0.2em] text-muted">{label}</span>
      <span className="text-lg font-semibold text-ink">{value}</span>
      {hint ? <span className="text-xs text-muted">{hint}</span> : null}
    </div>
  );
}

function DataTable({ preview, emptyLabel }: { preview: CsvPreview | null; emptyLabel: string }) {
  if (!preview || preview.columns.length === 0) {
    return <p className="text-sm text-muted">{emptyLabel}</p>;
  }

  return (
    <div className="overflow-auto rounded-xl border border-stroke bg-white">
      <table className="min-w-full text-sm">
        <thead className="bg-surface-muted text-muted">
          <tr>
            {preview.columns.map((col) => (
              <th key={col} className="px-3 py-2 text-left font-semibold">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {preview.rows.map((row, idx) => (
            <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-surface-muted/40"}>
              {preview.columns.map((col) => (
                <td key={col} className="px-3 py-2 text-muted">
                  {row[col] === null || row[col] === undefined ? "" : String(row[col])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function BarPairList({
  data,
  labels,
}: {
  data: Array<{ label: string; baseline: number; scenario: number }>;
  labels: { empty: string; baseline: string; scenario: string };
  locale?: string;
}) {
  if (!data.length) {
    return <p className="text-sm text-muted">{labels.empty}</p>;
  }
  const max = Math.max(...data.flatMap((item) => [item.baseline, item.scenario, 0.01]));
  return (
    <div className="space-y-4">
      {data.map((item) => (
        <div key={item.label} className="grid gap-3 lg:grid-cols-[160px_1fr]">
          <div className="text-xs uppercase tracking-[0.2em] text-muted">{item.label}</div>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="w-20 text-xs text-muted">{labels.baseline}</span>
              <div className="h-2 flex-1 rounded-full bg-surface-muted">
                <div
                  className="h-2 rounded-full bg-accent-2"
                  style={{ width: `${(item.baseline / max) * 100}%` }}
                />
              </div>
              <span className="w-24 text-right text-xs text-muted">
                {formatNumber(item.baseline, 2, locale)}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-20 text-xs text-muted">{labels.scenario}</span>
              <div className="h-2 flex-1 rounded-full bg-surface-muted">
                <div
                  className="h-2 rounded-full bg-accent"
                  style={{ width: `${(item.scenario / max) * 100}%` }}
                />
              </div>
              <span className="w-24 text-right text-xs text-muted">
                {formatNumber(item.scenario, 2, locale)}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  const [language, setLanguage] = useState<Language>("en");
  const [activeTab, setActiveTab] = useState<TabKey>("builder");
  const [inputs, setInputs] = useState<ScenarioInputsState>(defaultInputs);
  const [workingYaml, setWorkingYaml] = useState("");
  const [templateYaml, setTemplateYaml] = useState("");
  const [status, setStatus] = useState(copy.en.statusReady);
  const [baselines, setBaselines] = useState<string[]>([]);
  const [jobs, setJobs] = useState<JobRecord[]>([]);
  const [selectedJobId, setSelectedJobId] = useState("");
  const [jobLog, setJobLog] = useState("");
  const [results, setResults] = useState<ResultEntry[]>([]);
  const [selectedResult, setSelectedResult] = useState("");
  const [resultDetails, setResultDetails] = useState<ResultDetails | null>(null);
  const [selectedCsv, setSelectedCsv] = useState("");
  const [csvPreview, setCsvPreview] = useState<CsvPreview | null>(null);
  const [chartPack, setChartPack] = useState<ChartPack>({});

  const text = copy[language];
  const locale = language === "ro" ? "ro-RO" : "en-US";

  const activeJob = useMemo(() => jobs.find((job) => job.status === "running"), [jobs]);
  const jobCount = jobs.length;
  const resultCount = results.length;

  const updateInput = <K extends keyof ScenarioInputsState>(key: K, value: ScenarioInputsState[K]) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  const refreshTemplate = async (year: string) => {
    try {
      const data = await fetchJson<{ yaml: string }>(`/api/scenario/template?year=${year}`);
      setTemplateYaml(data.yaml);
      setWorkingYaml((prev) => prev || data.yaml);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : text.statusLoadTemplateFailed);
    }
  };

  const refreshWorkingYaml = async () => {
    try {
      setStatus(text.statusBuildingYaml);
      const data = await fetchJson<{ yaml: string }>("/api/scenario/build", {
        method: "POST",
        body: JSON.stringify(buildPayload(inputs, workingYaml)),
      });
      setWorkingYaml(data.yaml);
      setStatus(text.statusYamlUpdated);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : text.statusBuildYamlFailed);
    }
  };

  const applyYamlToControls = () => {
    try {
      const parsed = YAML.parse(workingYaml);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        throw new Error("Working YAML must be a mapping.");
      }
      const cfg = parsed as Record<string, any>;
      if (cfg.run?.name) {
        updateInput("scenarioSlug", String(cfg.run.name));
      }
      if (Array.isArray(cfg.countries)) {
        updateInput("countries", cfg.countries.join(","));
      }
      if (cfg.snapshots?.start) {
        updateInput("snapshotStart", String(cfg.snapshots.start));
      }
      if (cfg.snapshots?.end) {
        updateInput("snapshotEnd", String(cfg.snapshots.end));
      }
      if (cfg.scenario?.clusters?.length) {
        updateInput("clusters", String(cfg.scenario.clusters[0]));
      }
      if (cfg.solving?.solver?.name) {
        updateInput("solverName", String(cfg.solving.solver.name));
      }
      if (cfg.solving?.solver?.options) {
        updateInput("solverOptions", String(cfg.solving.solver.options));
      }
      if (cfg.atlite?.default_cutout) {
        const cutout = String(cfg.atlite.default_cutout);
        if (cutout.includes("2023")) {
          updateInput("cutoutYear", "2023");
        } else if (cutout.includes("2020")) {
          updateInput("cutoutYear", "2020");
        }
      }
      if (cfg.stress_test) {
        updateInput("stressEnable", Boolean(cfg.stress_test.enable));
        updateInput("country", String(cfg.stress_test.country || "RO"));
        if (cfg.stress_test.load_factor_full_window !== undefined) {
          updateInput("stressLoad", String(cfg.stress_test.load_factor_full_window));
        }
        if (cfg.stress_test.hydro_factor_full_window !== undefined) {
          updateInput("stressHydro", String(cfg.stress_test.hydro_factor_full_window));
        }
        if (cfg.stress_test.gas_factor_first_72h !== undefined) {
          updateInput("stressGas", String(cfg.stress_test.gas_factor_first_72h));
        }
        if (cfg.stress_test.scada) {
          updateInput("scadaTight", String(cfg.stress_test.scada.tight_hours ?? ""));
          updateInput("scadaRelaxed", String(cfg.stress_test.scada.relaxed_hours ?? ""));
          updateInput("scadaRampTight", String(cfg.stress_test.scada.ramp_tight_per_hour ?? ""));
          updateInput("scadaRampRelaxed", String(cfg.stress_test.scada.ramp_relaxed_per_hour ?? ""));
        }
        if (cfg.stress_test.import_cap) {
          updateInput("importZero", String(cfg.stress_test.import_cap.zero_hours ?? ""));
          updateInput("importHalf", String(cfg.stress_test.import_cap.half_hours ?? ""));
          updateInput("importFactor", String(cfg.stress_test.import_cap.half_factor ?? ""));
        }
      }
      setStatus(text.statusYamlApplied);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : text.statusYamlInvalid);
    }
  };

  const refreshBaselines = async () => {
    try {
      const data = await fetchJson<{ baselines: string[] }>("/api/runs/baselines");
      setBaselines(data.baselines);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : text.statusLoadBaselinesFailed);
    }
  };

  const refreshJobs = async () => {
    try {
      const data = await fetchJson<{ jobs: JobRecord[] }>("/api/runs/jobs");
      setJobs(data.jobs);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : text.statusLoadJobsFailed);
    }
  };

  const refreshResults = async () => {
    try {
      const data = await fetchJson<{ results: ResultEntry[] }>("/api/results");
      setResults(data.results);
      if (!selectedResult && data.results.length) {
        setSelectedResult(data.results[0].name);
      }
    } catch (error) {
      setStatus(error instanceof Error ? error.message : text.statusLoadResultsFailed);
    }
  };

  const refreshJobLog = async (jobId: string) => {
    if (!jobId) {
      setJobLog("");
      return;
    }
    try {
      const data = await fetchJson<{ log: string }>(`/api/runs/log?jobId=${jobId}`);
      setJobLog(data.log);
    } catch {
      setJobLog("");
    }
  };

  const enqueueRun = async () => {
    try {
      setStatus(text.statusQueueingRun);
      const data = await fetchJson<{ jobId: string }>("/api/runs/enqueue", {
        method: "POST",
        body: JSON.stringify(buildPayload(inputs, workingYaml)),
      });
      setStatus(`${text.statusJobQueued}: ${data.jobId}`);
      setActiveTab("runs");
      await refreshJobs();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : text.statusQueueFailed);
    }
  };

  const cancelJob = async (jobId: string) => {
    try {
      await fetchJson("/api/runs/cancel", {
        method: "POST",
        body: JSON.stringify({ jobId }),
      });
      await refreshJobs();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : text.statusCancelFailed);
    }
  };

  const loadResultDetails = async (name: string) => {
    try {
      const data = await fetchJson<ResultDetails>(`/api/results/summary?name=${name}`);
      setResultDetails(data);
      if (data.csvFiles.length && !data.csvFiles.includes(selectedCsv)) {
        setSelectedCsv(data.csvFiles[0]);
      }
    } catch (error) {
      setResultDetails(null);
      setStatus(error instanceof Error ? error.message : text.statusLoadResultFailed);
    }
  };

  const loadCsvPreview = async (name: string, csvName: string) => {
    if (!name || !csvName) {
      setCsvPreview(null);
      return;
    }
    try {
      const data = await fetchJson<{ preview: CsvPreview }>(
        `/api/results/csv?name=${name}&file=${csvName}&limit=200`,
      );
      setCsvPreview(data.preview);
    } catch (error) {
      setCsvPreview(null);
      setStatus(error instanceof Error ? error.message : text.statusLoadCsvFailed);
    }
  };

  const loadChartData = async (name: string, file: string, key: keyof ChartPack) => {
    try {
      const data = await fetchJson<{ preview: CsvPreview }>(`/api/results/csv?name=${name}&file=${file}`);
      setChartPack((prev) => ({ ...prev, [key]: data.preview }));
    } catch {
      setChartPack((prev) => ({ ...prev, [key]: null }));
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const saved = window.localStorage.getItem("planui-language");
    if (saved === "ro" || saved === "en") {
      setLanguage(saved);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    window.localStorage.setItem("planui-language", language);
    setStatus((prev) => {
      if (prev === copy.en.statusReady || prev === copy.ro.statusReady) {
        return copy[language].statusReady;
      }
      return prev;
    });
  }, [language]);

  useEffect(() => {
    void refreshTemplate(inputs.cutoutYear);
  }, [inputs.cutoutYear]);

  useEffect(() => {
    void refreshBaselines();
    void refreshResults();
  }, []);

  useEffect(() => {
    if (activeTab !== "runs") {
      return;
    }
    void refreshJobs();
    const interval = setInterval(() => {
      void refreshJobs();
    }, 1500);
    return () => clearInterval(interval);
  }, [activeTab]);

  useEffect(() => {
    if (activeTab !== "results") {
      return;
    }
    void refreshResults();
    const interval = setInterval(() => {
      void refreshResults();
    }, 4000);
    return () => clearInterval(interval);
  }, [activeTab]);

  useEffect(() => {
    if (!selectedResult) {
      setResultDetails(null);
      return;
    }
    setChartPack({});
    void loadResultDetails(selectedResult);
    void loadChartData(selectedResult, "system_cost_comparison.csv", "cost");
    void loadChartData(selectedResult, "generation_mix_mwh.csv", "generation");
    void loadChartData(selectedResult, "interconnector_flow_congestion.csv", "congestion");
    void loadChartData(selectedResult, "lmp_summary_ro.csv", "prices");
    void loadChartData(selectedResult, "ens_summary.csv", "ens");
  }, [selectedResult]);

  useEffect(() => {
    if (!selectedCsv || !selectedResult) {
      return;
    }
    void loadCsvPreview(selectedResult, selectedCsv);
  }, [selectedCsv, selectedResult]);

  useEffect(() => {
    if (!selectedJobId) {
      setJobLog("");
      return;
    }
    void refreshJobLog(selectedJobId);
  }, [selectedJobId]);

  const generationPairs = useMemo(() => {
    const preview = chartPack.generation;
    if (!preview) return [];
    const baseline = preview.rows.filter((row) => row.case === "baseline");
    const scenario = preview.rows.filter((row) => row.case === "scenario");
    return baseline.map((row, idx) => ({
      label: String(row.carrier || `${text.labelCarrierFallback} ${idx + 1}`),
      baseline: Number(row.generation_mwh || 0),
      scenario: Number(scenario[idx]?.generation_mwh || 0),
    }));
  }, [chartPack.generation, text.labelCarrierFallback]);

  const congestionPairs = useMemo(() => {
    const preview = chartPack.congestion;
    if (!preview) return [];
    const baseline = preview.rows.filter((row) => row.case === "baseline");
    const scenario = preview.rows.filter((row) => row.case === "scenario");
    return baseline.map((row, idx) => ({
      label: String(row.line || `${text.labelLineFallback} ${idx + 1}`),
      baseline: Number(row.mean_loading || 0) * 100,
      scenario: Number(scenario[idx]?.mean_loading || 0) * 100,
    }));
  }, [chartPack.congestion, text.labelLineFallback]);

  const pricePairs = useMemo(() => {
    const preview = chartPack.prices;
    if (!preview) return [];
    const baseline = preview.rows.find((row) => row.case === "baseline") || preview.rows[0];
    const scenario = preview.rows.find((row) => row.case === "scenario") || preview.rows[preview.rows.length - 1];
    if (!baseline || !scenario) return [];
    return [
      {
        label: text.labelMean,
        baseline: Number(baseline.mean_eur_per_mwh ?? baseline.mean ?? 0),
        scenario: Number(scenario.mean_eur_per_mwh ?? scenario.mean ?? 0),
      },
      {
        label: text.labelP95,
        baseline: Number(baseline.p95_eur_per_mwh ?? baseline.p95 ?? 0),
        scenario: Number(scenario.p95_eur_per_mwh ?? scenario.p95 ?? 0),
      },
      {
        label: text.labelMax,
        baseline: Number(baseline.max_eur_per_mwh ?? baseline.max ?? 0),
        scenario: Number(scenario.max_eur_per_mwh ?? scenario.max ?? 0),
      },
    ];
  }, [chartPack.prices, text.labelMean, text.labelP95, text.labelMax]);

  return (
    <div className="min-h-screen">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-horizon" />
        <div className="absolute -top-24 right-0 h-72 w-72 rounded-full bg-accent/20 blur-3xl" />
        <div className="absolute -bottom-16 left-10 h-60 w-60 rounded-full bg-accent-2/20 blur-3xl" />
        <header className="relative z-10 mx-auto max-w-6xl px-6 py-16">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <span className="text-xs uppercase tracking-[0.4em] text-muted">{text.brand}</span>
                <div className="flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-muted">
                  <span>{text.languageLabel}</span>
                  <div className="flex rounded-full border border-stroke bg-white/80 p-1">
                    <button
                      type="button"
                      onClick={() => setLanguage("en")}
                      className={`lang-pill ${language === "en" ? "lang-pill-active" : ""}`}
                    >
                      EN
                    </button>
                    <button
                      type="button"
                      onClick={() => setLanguage("ro")}
                      className={`lang-pill ${language === "ro" ? "lang-pill-active" : ""}`}
                    >
                      RO
                    </button>
                  </div>
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl font-display text-ink">{text.title}</h1>
              <p className="max-w-2xl text-sm md:text-base text-muted">{text.subtitle}</p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <MetricCard
                label={text.metricQueue}
                value={`${jobCount} ${text.metricJobsSuffix}`}
                hint={activeJob ? text.metricQueueHintActive : text.metricQueueHintIdle}
              />
              <MetricCard
                label={text.metricResults}
                value={`${resultCount} ${text.metricReadySuffix}`}
                hint={text.metricResultsHint}
              />
              <MetricCard label={text.metricStatus} value={status} />
            </div>
            <div className="flex flex-wrap gap-2">
              {(["builder", "runs", "results"] as TabKey[]).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`tab-button ${activeTab === tab ? "tab-active" : "tab-idle"}`}
                >
                  {tab === "builder" ? text.tabBuilder : tab === "runs" ? text.tabRuns : text.tabResults}
                </button>
              ))}
              <button type="button" onClick={refreshWorkingYaml} className="tab-button tab-ghost">
                {text.tabSyncYaml}
              </button>
            </div>
          </div>
        </header>
      </div>

      <main className="relative z-10 mx-auto max-w-6xl px-6 pb-20">
        <section className={activeTab === "builder" ? "block" : "hidden"}>
          <div className="glass rounded-2xl p-6 mb-8 reveal">
            <SectionHeader
              title={text.sectionBuilderTitle}
              subtitle={text.sectionBuilderSubtitle}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
            <div className="glass rounded-2xl p-6 reveal stagger-1">
              <h3 className="text-lg font-display text-ink mb-4">{text.sectionCoreInputs}</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="field">
                  <span>{text.fieldRunMode}</span>
                  <select
                    value={inputs.runMode}
                    onChange={(event) => updateInput("runMode", event.target.value as "paired" | "single")}
                  >
                    <option value="paired">{text.runModePaired}</option>
                    <option value="single">{text.runModeSingle}</option>
                  </select>
                </label>
                <label className="field">
                  <span>{text.fieldOutputName}</span>
                  <input
                    value={inputs.outputName}
                    onChange={(event) => updateInput("outputName", event.target.value)}
                    placeholder="romania-2023-winter-stress"
                  />
                </label>
                <label className="field">
                  <span>{text.fieldScenarioSlug}</span>
                  <input
                    value={inputs.scenarioSlug}
                    onChange={(event) => updateInput("scenarioSlug", event.target.value)}
                    placeholder="romania-winter-stress"
                  />
                </label>
                <label className="field">
                  <span>{text.fieldStressCountry}</span>
                  <input
                    value={inputs.country}
                    onChange={(event) => updateInput("country", event.target.value.toUpperCase())}
                  />
                </label>
                <label className="field md:col-span-2">
                  <span>{text.fieldCountries}</span>
                  <input
                    value={inputs.countries}
                    onChange={(event) => updateInput("countries", event.target.value)}
                  />
                </label>
                <label className="field">
                  <span>{text.fieldSnapshotStart}</span>
                  <input
                    type="date"
                    value={inputs.snapshotStart}
                    onChange={(event) => updateInput("snapshotStart", event.target.value)}
                  />
                </label>
                <label className="field">
                  <span>{text.fieldSnapshotEnd}</span>
                  <input
                    type="date"
                    value={inputs.snapshotEnd}
                    onChange={(event) => updateInput("snapshotEnd", event.target.value)}
                  />
                </label>
                <label className="field">
                  <span>{text.fieldCutoutYear}</span>
                  <select
                    value={inputs.cutoutYear}
                    onChange={(event) => updateInput("cutoutYear", event.target.value as "2020" | "2023")}
                  >
                    <option value="2020">2020</option>
                    <option value="2023">2023</option>
                  </select>
                </label>
                <label className="field">
                  <span>{text.fieldClusters}</span>
                  <input
                    type="number"
                    value={inputs.clusters}
                    onChange={(event) => updateInput("clusters", event.target.value)}
                  />
                </label>
                <label className="field">
                  <span>{text.fieldSolverName}</span>
                  <input
                    value={inputs.solverName}
                    onChange={(event) => updateInput("solverName", event.target.value)}
                  />
                </label>
                <label className="field">
                  <span>{text.fieldSolverOptions}</span>
                  <input
                    value={inputs.solverOptions}
                    onChange={(event) => updateInput("solverOptions", event.target.value)}
                  />
                </label>
                <label className="field md:col-span-2">
                  <span>{text.fieldReferenceBaseline}</span>
                  <select
                    value={inputs.referenceBaselineNet}
                    onChange={(event) => updateInput("referenceBaselineNet", event.target.value)}
                    disabled={inputs.runMode !== "single"}
                  >
                    <option value="">{text.fieldBaselinePlaceholder}</option>
                    {baselines.map((baseline) => (
                      <option key={baseline} value={baseline}>
                        {baseline}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-display text-ink mb-4">{text.sectionStressControls}</h3>
                <label className="flex items-center gap-3 text-sm text-muted mb-4">
                  <input
                    type="checkbox"
                    checked={inputs.stressEnable}
                    onChange={(event) => updateInput("stressEnable", event.target.checked)}
                    className="h-4 w-4 accent-accent"
                  />
                  {text.fieldStressEnable}
                </label>
                <div className="grid gap-4 md:grid-cols-3">
                  <label className="field">
                    <span>{text.fieldStressLoad}</span>
                    <input
                      type="number"
                      step="0.01"
                      value={inputs.stressLoad}
                      onChange={(event) => updateInput("stressLoad", event.target.value)}
                    />
                  </label>
                  <label className="field">
                    <span>{text.fieldStressHydro}</span>
                    <input
                      type="number"
                      step="0.01"
                      value={inputs.stressHydro}
                      onChange={(event) => updateInput("stressHydro", event.target.value)}
                    />
                  </label>
                  <label className="field">
                    <span>{text.fieldStressGas}</span>
                    <input
                      type="number"
                      step="0.01"
                      value={inputs.stressGas}
                      onChange={(event) => updateInput("stressGas", event.target.value)}
                    />
                  </label>
                  <label className="field">
                    <span>{text.fieldScadaTight}</span>
                    <input
                      type="number"
                      value={inputs.scadaTight}
                      onChange={(event) => updateInput("scadaTight", event.target.value)}
                    />
                  </label>
                  <label className="field">
                    <span>{text.fieldScadaRelaxed}</span>
                    <input
                      type="number"
                      value={inputs.scadaRelaxed}
                      onChange={(event) => updateInput("scadaRelaxed", event.target.value)}
                    />
                  </label>
                  <label className="field">
                    <span>{text.fieldScadaRampTight}</span>
                    <input
                      type="number"
                      step="0.01"
                      value={inputs.scadaRampTight}
                      onChange={(event) => updateInput("scadaRampTight", event.target.value)}
                    />
                  </label>
                  <label className="field">
                    <span>{text.fieldScadaRampRelaxed}</span>
                    <input
                      type="number"
                      step="0.01"
                      value={inputs.scadaRampRelaxed}
                      onChange={(event) => updateInput("scadaRampRelaxed", event.target.value)}
                    />
                  </label>
                  <label className="field">
                    <span>{text.fieldImportZero}</span>
                    <input
                      type="number"
                      value={inputs.importZero}
                      onChange={(event) => updateInput("importZero", event.target.value)}
                    />
                  </label>
                  <label className="field">
                    <span>{text.fieldImportHalf}</span>
                    <input
                      type="number"
                      value={inputs.importHalf}
                      onChange={(event) => updateInput("importHalf", event.target.value)}
                    />
                  </label>
                  <label className="field">
                    <span>{text.fieldImportFactor}</span>
                    <input
                      type="number"
                      step="0.01"
                      value={inputs.importFactor}
                      onChange={(event) => updateInput("importFactor", event.target.value)}
                    />
                  </label>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <button type="button" className="button-primary" onClick={refreshWorkingYaml}>
                  {text.buttonApplyControls}
                </button>
                <button type="button" className="button-secondary" onClick={applyYamlToControls}>
                  {text.buttonApplyYaml}
                </button>
                <button type="button" className="button-ghost" onClick={refreshBaselines}>
                  {text.buttonRefreshBaselines}
                </button>
                <button type="button" className="button-accent" onClick={enqueueRun}>
                  {text.buttonEnqueueRun}
                </button>
              </div>
            </div>

            <div className="space-y-6">
              <div className="glass rounded-2xl p-6 reveal stagger-2">
                <h3 className="text-lg font-display text-ink mb-4">{text.yamlWorkingTitle}</h3>
                <textarea
                  value={workingYaml}
                  onChange={(event) => setWorkingYaml(event.target.value)}
                  className="yaml-box"
                  spellCheck={false}
                />
              </div>
              <div className="glass rounded-2xl p-6 reveal stagger-3">
                <h3 className="text-lg font-display text-ink mb-4">{text.yamlTemplateTitle}</h3>
                <textarea value={templateYaml} readOnly className="yaml-box muted" />
              </div>
            </div>
          </div>
        </section>

        <section className={activeTab === "runs" ? "block" : "hidden"}>
          <div className="glass rounded-2xl p-6 mb-8 reveal">
            <SectionHeader
              title={text.sectionRunsTitle}
              subtitle={text.sectionRunsSubtitle}
            />
          </div>
          <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
            <div className="glass rounded-2xl p-6 reveal stagger-1">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-display text-ink">{text.runsQueueTitle}</h3>
                <button type="button" className="button-ghost" onClick={refreshJobs}>
                  {text.buttonRefresh}
                </button>
              </div>
              <div className="overflow-auto rounded-xl border border-stroke">
                <table className="min-w-full text-sm">
                  <thead className="bg-surface-muted text-muted">
                    <tr>
                      <th className="px-3 py-2 text-left">{text.tableJob}</th>
                      <th className="px-3 py-2 text-left">{text.tableStatus}</th>
                      <th className="px-3 py-2 text-left">{text.tableMode}</th>
                      <th className="px-3 py-2 text-left">{text.tableOutput}</th>
                      <th className="px-3 py-2 text-left">{text.tableProgress}</th>
                      <th className="px-3 py-2 text-left">{text.tableActions}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobs.map((job) => (
                      <tr
                        key={job.spec.jobId}
                        className={selectedJobId === job.spec.jobId ? "bg-surface-muted/60" : "bg-white"}
                      >
                        <td className="px-3 py-2 text-muted">{job.spec.jobId}</td>
                        <td className="px-3 py-2 text-muted">{job.status}</td>
                        <td className="px-3 py-2 text-muted">{job.spec.mode}</td>
                        <td className="px-3 py-2 text-muted">{job.spec.outputName}</td>
                        <td className="px-3 py-2 text-muted">{job.progressMessage}</td>
                        <td className="px-3 py-2">
                          <div className="flex gap-2">
                            <button
                              type="button"
                              className="button-ghost"
                              onClick={() => {
                                setSelectedJobId(job.spec.jobId);
                                void refreshJobLog(job.spec.jobId);
                              }}
                            >
                              {text.buttonDetails}
                            </button>
                            {job.status === "running" || job.status === "queued" ? (
                              <button
                                type="button"
                                className="button-secondary"
                                onClick={() => cancelJob(job.spec.jobId)}
                              >
                                {text.buttonCancel}
                              </button>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="glass rounded-2xl p-6 reveal stagger-2">
              <h3 className="text-lg font-display text-ink mb-4">{text.runsSelectedTitle}</h3>
              {selectedJobId ? (
                <div className="space-y-4">
                  <div className="grid gap-3 text-sm text-muted">
                    {jobs
                      .filter((job) => job.spec.jobId === selectedJobId)
                      .map((job) => (
                        <div key={job.spec.jobId} className="space-y-1">
                          <div>
                            {text.runsOutputLabel}: {job.spec.outputName}
                          </div>
                          <div>
                            {text.runsCreatedLabel}: {job.spec.createdAt}
                          </div>
                          <div>
                            {text.runsStatusLabel}: {job.status}
                          </div>
                          <div>
                            {text.runsLogLabel}: {job.spec.logPath}
                          </div>
                        </div>
                      ))}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-ink">{text.runsLogTail}</h4>
                    <pre className="log-box">{jobLog || text.runsLogEmpty}</pre>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted">{text.runsSelectHelp}</p>
              )}
            </div>
          </div>
        </section>

        <section className={activeTab === "results" ? "block" : "hidden"}>
          <div className="glass rounded-2xl p-6 mb-8 reveal">
            <SectionHeader
              title={text.sectionResultsTitle}
              subtitle={text.sectionResultsSubtitle}
            />
          </div>
          <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
            <div className="glass rounded-2xl p-4 reveal stagger-1">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-ink">{text.resultsFoldersTitle}</h3>
                <button type="button" className="button-ghost" onClick={refreshResults}>
                  {text.buttonRefresh}
                </button>
              </div>
              <div className="space-y-2 max-h-[520px] overflow-auto">
                {results.map((result) => (
                  <button
                    key={result.name}
                    type="button"
                    onClick={() => setSelectedResult(result.name)}
                    className={`result-chip ${selectedResult === result.name ? "result-chip-active" : ""}`}
                  >
                    <div className="text-left">
                      <div className="text-sm font-semibold text-ink">{result.name}</div>
                      <div className="text-xs text-muted">
                        {text.resultsUpdatedLabel} {new Date(result.timestamp).toLocaleString(locale)}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div className="glass rounded-2xl p-6 reveal stagger-2">
                <h3 className="text-lg font-display text-ink mb-4">{text.summaryTitle}</h3>
                {resultDetails ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    <MetricCard
                      label={text.summaryBaselineCost}
                      value={formatCurrency(resultDetails.summary.baseline_cost, locale)}
                    />
                    <MetricCard
                      label={text.summaryScenarioCost}
                      value={formatCurrency(resultDetails.summary.scenario_cost, locale)}
                    />
                    <MetricCard
                      label={text.summaryDeltaPercent}
                      value={`${formatNumber(resultDetails.summary.delta_percent, 2, locale)}%`}
                    />
                    <MetricCard label={text.summaryEns} value={formatNumber(resultDetails.summary.ens_mwh, 2, locale)} />
                    <MetricCard
                      label={text.summarySheddingHours}
                      value={formatNumber(resultDetails.summary.hours_with_shedding, 0, locale)}
                    />
                    <MetricCard
                      label={text.summaryMaxShedding}
                      value={formatNumber(resultDetails.summary.max_shedding_mw, 2, locale)}
                    />
                    <MetricCard
                      label={text.summaryImportsDelta}
                      value={formatNumber(resultDetails.summary.imports_delta_total_mwh, 2, locale)}
                    />
                    <MetricCard
                      label={text.summaryLmpMean}
                      value={formatNumber(resultDetails.summary.lmp_mean, 2, locale)}
                    />
                  </div>
                ) : (
                  <p className="text-sm text-muted">{text.summarySelectHelp}</p>
                )}
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <div className="glass rounded-2xl p-6 reveal stagger-3">
                  <h3 className="text-lg font-display text-ink mb-4">{text.chartGeneration}</h3>
                  <BarPairList
                    data={generationPairs}
                    labels={{ empty: text.chartEmpty, baseline: text.chartBaseline, scenario: text.chartScenario }}
                    locale={locale}
                  />
                </div>
                <div className="glass rounded-2xl p-6 reveal stagger-3">
                  <h3 className="text-lg font-display text-ink mb-4">{text.chartCongestion}</h3>
                  <BarPairList
                    data={congestionPairs}
                    labels={{ empty: text.chartEmpty, baseline: text.chartBaseline, scenario: text.chartScenario }}
                    locale={locale}
                  />
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <div className="glass rounded-2xl p-6 reveal stagger-4">
                  <h3 className="text-lg font-display text-ink mb-4">{text.chartLmp}</h3>
                  <BarPairList
                    data={pricePairs}
                    labels={{ empty: text.chartEmpty, baseline: text.chartBaseline, scenario: text.chartScenario }}
                    locale={locale}
                  />
                </div>
                <div className="glass rounded-2xl p-6 reveal stagger-4">
                  <h3 className="text-lg font-display text-ink mb-4">{text.chartCsvPreview}</h3>
                  {resultDetails ? (
                    <div className="space-y-3">
                      <select
                        value={selectedCsv}
                        onChange={(event) => setSelectedCsv(event.target.value)}
                        className="select-field"
                      >
                        {resultDetails.csvFiles.map((file) => (
                          <option key={file} value={file}>
                            {file}
                          </option>
                        ))}
                      </select>
                      <DataTable preview={csvPreview} emptyLabel={text.dataTableEmpty} />
                    </div>
                  ) : (
                    <p className="text-sm text-muted">{text.csvSelectHelp}</p>
                  )}
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <div className="glass rounded-2xl p-6 reveal stagger-5">
                  <h3 className="text-lg font-display text-ink mb-4">{text.figuresTitle}</h3>
                  {resultDetails && resultDetails.figureFiles.length ? (
                    <div className="grid gap-4 md:grid-cols-2">
                      {resultDetails.figureFiles.map((file) => (
                        <div key={file} className="rounded-xl border border-stroke bg-white p-3">
                          <img
                            src={`/api/results/figure?name=${selectedResult}&file=${file}`}
                            alt={file}
                            className="rounded-lg w-full object-cover"
                          />
                          <p className="mt-2 text-xs text-muted break-words">{file}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted">{text.figuresEmpty}</p>
                  )}
                </div>
                <div className="glass rounded-2xl p-6 reveal stagger-5">
                  <h3 className="text-lg font-display text-ink mb-4">{text.assumptionsTitle}</h3>
                  <pre className="log-box">
                    {resultDetails?.assumptions || text.assumptionsEmpty}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
