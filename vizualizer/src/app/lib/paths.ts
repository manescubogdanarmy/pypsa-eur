import fs from "fs";
import path from "path";

export function repoRoot(): string {
  return path.resolve(process.cwd(), "..");
}

export function resultsDir(): string {
  return path.join(repoRoot(), "results");
}

export function generatedConfigDir(): string {
  return path.join(repoRoot(), "config", "adversarial", "generated");
}

export function templatesDir(): string {
  return path.join(repoRoot(), "personal_docs");
}

export function logsDir(): string {
  return path.join(repoRoot(), "logs", "planui-web");
}

export function stateFilePath(): string {
  return path.join(repoRoot(), "vizualizer", ".data", "planui-state.json");
}

export function ensureDir(dirPath: string): void {
  fs.mkdirSync(dirPath, { recursive: true });
}
