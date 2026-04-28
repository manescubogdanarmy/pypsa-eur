import fs from "fs/promises";
import path from "path";

import { loadCsvPreview } from "./csv";
import { resultsDir } from "./paths";
import type { CsvPreview, ResultEntry, ResultSummary } from "./types";

const REQUIRED_CSVS = [
  "system_cost_comparison.csv",
  "generation_mix_mwh.csv",
  "lmp_summary_ro.csv",
  "ens_summary.csv",
  "curtailment_mwh.csv",
  "daily_net_imports_mwh.csv",
  "interconnector_flow_congestion.csv",
];

function safeName(name: string): boolean {
  return /^[a-zA-Z0-9._-]+$/.test(name);
}

async function statMtime(filePath: string): Promise<number> {
  try {
    const stats = await fs.stat(filePath);
    return stats.mtimeMs;
  } catch {
    return 0;
  }
}

export async function scanResults(): Promise<ResultEntry[]> {
  const root = resultsDir();
  let entries: ResultEntry[] = [];

  try {
    const dirents = await fs.readdir(root, { withFileTypes: true });
    for (const dirent of dirents) {
      if (!dirent.isDirectory()) {
        continue;
      }
      const folder = path.join(root, dirent.name);
      const requiredPresent = await Promise.all(
        REQUIRED_CSVS.map(async (file) => {
          try {
            await fs.access(path.join(folder, file));
            return true;
          } catch {
            return false;
          }
        }),
      );
      if (!requiredPresent.every(Boolean)) {
        continue;
      }

      const allFiles = await fs.readdir(folder);
      const csvFiles = allFiles.filter((name: string) => name.endsWith(".csv"));
      const figureFiles = allFiles.filter((name: string) => name.endsWith(".png"));
      const drawioFiles = allFiles.filter((name: string) => name.endsWith(".drawio"));
      const assumptionsFile = path.join(folder, "assumptions_limitations.md");

      const mtimes = await Promise.all<number>([
        ...csvFiles.map((name: string) => statMtime(path.join(folder, name))),
        ...figureFiles.map((name: string) => statMtime(path.join(folder, name))),
        statMtime(assumptionsFile),
      ]);

      entries.push({
        name: dirent.name,
        timestamp: mtimes.length ? Math.max(...mtimes) : 0,
        requiredFilesPresent: true,
        csvFiles,
        figureFiles,
        drawioFiles,
        assumptionsFile: (await statMtime(assumptionsFile)) ? assumptionsFile : null,
      });
    }
  } catch {
    entries = [];
  }

  entries.sort((a, b) => b.timestamp - a.timestamp || b.name.localeCompare(a.name));
  return entries;
}

export async function getResultPath(name: string): Promise<string> {
  if (!safeName(name)) {
    throw new Error("Invalid result name.");
  }
  return path.join(resultsDir(), name);
}

export async function parseSummary(resultDir: string): Promise<ResultSummary> {
  const summary: ResultSummary = {};

  const costPath = path.join(resultDir, "system_cost_comparison.csv");
  const ensPath = path.join(resultDir, "ens_summary.csv");
  const importsPath = path.join(resultDir, "daily_net_imports_mwh.csv");
  const lmpPath = path.join(resultDir, "lmp_summary_ro.csv");

  try {
    const cost = await loadCsvPreview(costPath);
    const row = cost.rows[0];
    if (row) {
      summary.baseline_cost = String(row.baseline_total_system_cost_eur ?? "0");
      summary.scenario_cost = String(row.scenario_total_system_cost_eur ?? "0");
      summary.delta_percent = String(row.delta_percent ?? "0");
    }
  } catch {
    // ignore
  }

  try {
    const ens = await loadCsvPreview(ensPath);
    const scenarioRow = ens.rows.find((r) => String(r.case) === "scenario") || ens.rows[ens.rows.length - 1];
    if (scenarioRow) {
      summary.ens_mwh = String(scenarioRow.ens_mwh ?? "0");
      summary.hours_with_shedding = String(scenarioRow.hours_with_shedding ?? "0");
      summary.max_shedding_mw = String(scenarioRow.max_shedding_mw ?? "0");
    }
  } catch {
    // ignore
  }

  try {
    const imports = await loadCsvPreview(importsPath);
    const total = imports.rows.reduce((acc, row) => acc + Number(row.delta_mwh || 0), 0);
    summary.imports_delta_total_mwh = total.toFixed(2);
  } catch {
    // ignore
  }

  try {
    const lmp = await loadCsvPreview(lmpPath);
    const scenarioRow = lmp.rows.find((r) => String(r.case) === "scenario") || lmp.rows[lmp.rows.length - 1];
    if (scenarioRow) {
      summary.lmp_mean = String(scenarioRow.mean_eur_per_mwh ?? scenarioRow.mean ?? "0");
      summary.lmp_p95 = String(scenarioRow.p95_eur_per_mwh ?? scenarioRow.p95 ?? "0");
      summary.lmp_max = String(scenarioRow.max_eur_per_mwh ?? scenarioRow.max ?? "0");
    }
  } catch {
    // ignore
  }

  return summary;
}

export async function listBaselineNetworks(): Promise<string[]> {
  const root = resultsDir();
  const matches: string[] = [];

  try {
    const folders = await fs.readdir(root, { withFileTypes: true });
    for (const folder of folders) {
      if (!folder.isDirectory()) {
        continue;
      }
      const networks = path.join(root, folder.name, "networks");
      try {
        const files = await fs.readdir(networks);
        for (const file of files) {
          if (file.startsWith("base_s_") && file.endsWith("_elec_.nc")) {
            matches.push(path.join(networks, file));
          }
        }
      } catch {
        // ignore
      }
    }
  } catch {
    return [];
  }

  return matches.sort();
}

export async function loadCsvFromResult(
  resultName: string,
  csvName: string,
  limit?: number,
): Promise<CsvPreview> {
  if (!safeName(resultName) || !safeName(csvName) || !csvName.endsWith(".csv")) {
    throw new Error("Invalid file request.");
  }
  const csvPath = path.join(resultsDir(), resultName, csvName);
  return loadCsvPreview(csvPath, limit);
}

export async function loadFigureFromResult(resultName: string, fileName: string): Promise<Buffer> {
  if (!safeName(resultName) || !safeName(fileName) || !fileName.endsWith(".png")) {
    throw new Error("Invalid file request.");
  }
  const filePath = path.join(resultsDir(), resultName, fileName);
  return fs.readFile(filePath);
}

export async function loadAssumptions(resultName: string): Promise<string> {
  if (!safeName(resultName)) {
    throw new Error("Invalid file request.");
  }
  const filePath = path.join(resultsDir(), resultName, "assumptions_limitations.md");
  try {
    return await fs.readFile(filePath, "utf-8");
  } catch {
    return "";
  }
}
