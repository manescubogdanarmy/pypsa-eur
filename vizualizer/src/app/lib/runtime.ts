import fs from "fs";
import path from "path";
import { spawnSync } from "child_process";

export type RuntimePrefixes = {
  snakemake: string[];
  python: string[];
  runtimeMode: string;
};

function safeStat(filePath: string): boolean {
  try {
    return fs.existsSync(filePath);
  } catch {
    return false;
  }
}

function findCondaExecutable(): string | null {
  const envPath = process.env.CONDA_EXE;
  if (envPath && safeStat(envPath)) {
    return envPath;
  }

  const command = process.platform === "win32" ? "where" : "which";
  const found = spawnSync(command, ["conda"], { encoding: "utf-8" });
  if (found.status === 0 && found.stdout) {
    const first = found.stdout.split(/\r?\n/).find(Boolean);
    if (first && safeStat(first.trim())) {
      return first.trim();
    }
  }

  return null;
}

function listCondaEnvNames(condaExe: string): Set<string> {
  const result = spawnSync(condaExe, ["env", "list", "--json"], { encoding: "utf-8" });
  if (result.status !== 0 || !result.stdout) {
    return new Set();
  }
  try {
    const payload = JSON.parse(result.stdout) as { envs?: string[] };
    const names = new Set<string>();
    for (const entry of payload.envs || []) {
      names.add(path.basename(entry));
    }
    return names;
  } catch {
    return new Set();
  }
}

function selectCondaEnvName(condaExe: string): string {
  const explicit = process.env.PLANUI_CONDA_ENV;
  if (explicit) {
    return explicit;
  }

  const candidates: string[] = [];
  const current = process.env.CONDA_DEFAULT_ENV;
  if (current && current !== "base") {
    candidates.push(current);
  }
  candidates.push("pypsa", "pypsa-eur");

  const available = listCondaEnvNames(condaExe);
  for (const name of candidates) {
    if (available.has(name)) {
      return name;
    }
  }

  return candidates[0] || "pypsa";
}

function selectCondaPrefix(): string | null {
  const explicit = process.env.PLANUI_CONDA_PREFIX;
  if (explicit && safeStat(explicit)) {
    return explicit;
  }

  const active = process.env.CONDA_PREFIX;
  const activeEnvName = process.env.CONDA_DEFAULT_ENV;
  if (active && safeStat(active) && activeEnvName && activeEnvName !== "base") {
    return active;
  }

  return null;
}

export function snakemakeExtraArgs(): string[] {
  const raw = (process.env.PLANUI_SNAKEMAKE_SKIP_REMOTE_CHECKS || "1").trim().toLowerCase();
  if (raw === "0" || raw === "false" || raw === "no") {
    return [];
  }
  return ["--storage-cached-http-skip-remote-checks"];
}

export function resolveRuntimePrefixes(): RuntimePrefixes {
  const condaExe = findCondaExecutable();

  if (!condaExe) {
    return {
      snakemake: ["python", "-m", "snakemake"],
      python: ["python"],
      runtimeMode: "system-python",
    };
  }

  // Try explicit conda env first
  const explicit = process.env.PLANUI_CONDA_ENV;
  if (explicit) {
    return {
      snakemake: [condaExe, "run", "-n", explicit, "python", "-m", "snakemake"],
      python: [condaExe, "run", "-n", explicit, "python"],
      runtimeMode: "conda-run",
    };
  }

  // Try conda prefix method
  const condaPrefix = selectCondaPrefix();
  if (condaPrefix) {
    return {
      snakemake: [condaExe, "run", "-p", condaPrefix, "python", "-m", "snakemake"],
      python: [condaExe, "run", "-p", condaPrefix, "python"],
      runtimeMode: "conda-run-prefix",
    };
  }

  // Fall back to named environment selection
  const envName = selectCondaEnvName(condaExe);
  return {
    snakemake: [condaExe, "run", "-n", envName, "python", "-m", "snakemake"],
    python: [condaExe, "run", "-n", envName, "python"],
    runtimeMode: "conda-run",
  };
}
