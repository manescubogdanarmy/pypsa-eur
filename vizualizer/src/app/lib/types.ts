export type RunMode = "paired" | "single";

export type JobStatus =
  | "queued"
  | "running"
  | "succeeded"
  | "failed"
  | "cancelled"
  | "interrupted";

export type ScenarioInputs = {
  runMode: RunMode;
  outputName: string;
  scenarioSlug: string;
  country: string;
  countries: string;
  snapshotStart: string;
  snapshotEnd: string;
  cutoutYear: "2020" | "2023";
  clusters: number;
  solverName: string;
  solverOptions: string;
  referenceBaselineNet?: string | null;
  stressEnable: boolean;
  stressLoad: number;
  stressHydro: number;
  stressGas: number;
  scadaTight: number;
  scadaRelaxed: number;
  scadaRampTight: number;
  scadaRampRelaxed: number;
  importZero: number;
  importHalf: number;
  importFactor: number;
  workingYaml?: string | null;
};

export type ScenarioInputsPayload = {
  runMode?: RunMode;
  outputName?: string;
  scenarioSlug?: string;
  country?: string;
  countries?: string;
  snapshotStart?: string;
  snapshotEnd?: string;
  cutoutYear?: "2020" | "2023";
  clusters?: number | string;
  solverName?: string;
  solverOptions?: string;
  referenceBaselineNet?: string | null;
  stressEnable?: boolean;
  stressLoad?: number | string;
  stressHydro?: number | string;
  stressGas?: number | string;
  scadaTight?: number | string;
  scadaRelaxed?: number | string;
  scadaRampTight?: number | string;
  scadaRampRelaxed?: number | string;
  importZero?: number | string;
  importHalf?: number | string;
  importFactor?: number | string;
  workingYaml?: string | null;
};

export type CommandSpec = {
  argv: string[];
  description: string;
  allowFailure?: boolean;
};

export type JobSpec = {
  jobId: string;
  outputName: string;
  mode: RunMode;
  createdAt: string;
  commands: CommandSpec[];
  generatedConfigs: string[];
  reportOutdir: string;
  logPath: string;
  scenarioRunName: string;
  baselineRunName?: string | null;
  country: string;
};

export type JobRecord = {
  spec: JobSpec;
  status: JobStatus;
  startedAt?: string | null;
  finishedAt?: string | null;
  exitCode?: number | null;
  errorSummary?: string | null;
  progressMessage: string;
  cancelRequested?: boolean;
};

export type ResultEntry = {
  name: string;
  timestamp: number;
  requiredFilesPresent: boolean;
  csvFiles: string[];
  figureFiles: string[];
  assumptionsFile?: string | null;
};

export type ResultSummary = Record<string, string>;

export type CsvPreview = {
  columns: string[];
  rows: Array<Record<string, string | number | null>>;
};
