import fs from "fs";
import fsPromises from "fs/promises";
import path from "path";
import { spawn } from "child_process";

import { ensureDir, logsDir, repoRoot, stateFilePath } from "./paths";
import type { JobRecord, JobSpec } from "./types";

type StatePayload = {
  jobs: JobRecord[];
};

function nowIso(): string {
  return new Date().toISOString();
}

function sanitizeEnv(): NodeJS.ProcessEnv {
  const env: NodeJS.ProcessEnv = { ...process.env };
  const keepProxy = (env.PLANUI_USE_SYSTEM_PROXY || "").trim().toLowerCase() === "1";
  if (keepProxy) {
    return env;
  }
  for (const key of [
    "HTTP_PROXY",
    "HTTPS_PROXY",
    "ALL_PROXY",
    "NO_PROXY",
    "http_proxy",
    "https_proxy",
    "all_proxy",
    "no_proxy",
  ]) {
    delete env[key];
  }
  return env;
}

function safeJsonParse(raw: string): StatePayload | null {
  try {
    const data = JSON.parse(raw) as StatePayload;
    if (!data || !Array.isArray(data.jobs)) {
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

function normalizeJobs(jobs: JobRecord[]): JobRecord[] {
  return jobs.map((job) => {
    if (job.status === "running") {
      return {
        ...job,
        status: "interrupted",
        progressMessage: "Interrupted by app restart.",
        cancelRequested: false,
        finishedAt: job.finishedAt || job.startedAt || job.spec.createdAt,
      };
    }
    return job;
  });
}

function tailLines(text: string, count: number): string {
  const lines = text.split(/\r?\n/);
  return lines.slice(Math.max(0, lines.length - count)).join("\n");
}

export class JobRunner {
  private jobs: JobRecord[] = [];
  private activeProcess: ReturnType<typeof spawn> | null = null;
  private activeJobId: string | null = null;
  private isRunning = false;

  constructor() {
    this.loadState();
  }

  private loadState(isInitial = false): void {
    const statePath = stateFilePath();
    try {
      if (!fs.existsSync(statePath)) {
        this.jobs = [];
        return;
      }
      const content = fs.readFileSync(statePath, "utf-8");
      const parsed = safeJsonParse(content);
      let loadedJobs = parsed?.jobs || [];
      if (isInitial) {
        loadedJobs = normalizeJobs(loadedJobs);
      }
      this.jobs = loadedJobs;
    } catch (err) {
      console.error("Failed to load state:", err);
      if (isInitial) {
        this.jobs = [];
      }
    }
  }

  private saveState(): void {
    const statePath = stateFilePath();
    ensureDir(path.dirname(statePath));
    const payload: StatePayload = { jobs: this.jobs };
    fs.writeFileSync(statePath, JSON.stringify(payload, null, 2), "utf-8");
  }

  getJobs(): JobRecord[] {
    this.loadState();
    return structuredClone(this.jobs);
  }

  enqueue(spec: JobSpec): JobRecord {
    this.loadState();
    const record: JobRecord = {
      spec,
      status: "queued",
      progressMessage: "Queued.",
      startedAt: null,
      finishedAt: null,
      exitCode: null,
      errorSummary: null,
      cancelRequested: false,
    };
    this.jobs.push(record);
    this.saveState();
    this.runNext();
    return record;
  }

  cancel(jobId: string): boolean {
    const job = this.jobs.find((item) => item.spec.jobId === jobId);
    if (!job) {
      return false;
    }
    if (job.status === "queued") {
      job.status = "cancelled";
      job.finishedAt = nowIso();
      job.progressMessage = "Cancelled before start.";
      this.saveState();
      return true;
    }
    if (job.status === "running") {
      job.cancelRequested = true;
      job.progressMessage = "Cancellation requested.";
      if (this.activeProcess && this.activeJobId === jobId) {
        this.activeProcess.kill();
      }
      this.saveState();
      return true;
    }
    return false;
  }

  delete(jobId: string): boolean {
    this.loadState();
    const jobIndex = this.jobs.findIndex((item) => item.spec.jobId === jobId);
    if (jobIndex === -1) {
      return false;
    }
    if (this.activeProcess && this.activeJobId === jobId) {
      this.activeProcess.kill();
    }
    this.jobs.splice(jobIndex, 1);
    this.saveState();
    this.runNext();
    return true;
  }

  reset(): void {
    if (this.activeProcess) {
      this.activeProcess.kill();
    }
    this.activeProcess = null;
    this.activeJobId = null;
    this.isRunning = false;
    this.loadState();
    // Also normalize any jobs that might be stuck in "running" status
    this.jobs = this.jobs.map(job => {
      if (job.status === "running") {
        return {
          ...job,
          status: "interrupted",
          progressMessage: "Reset by user.",
          finishedAt: nowIso()
        };
      }
      return job;
    });
    this.saveState();
    this.runNext();
  }

  async getLog(jobId: string, maxLines = 200): Promise<string> {
    const job = this.jobs.find((item) => item.spec.jobId === jobId);
    if (!job) {
      return "";
    }
    try {
      const content = await fsPromises.readFile(job.spec.logPath, "utf-8");
      return tailLines(content, maxLines);
    } catch {
      return "";
    }
  }

  private runNext(): void {
    if (this.isRunning) {
      return;
    }
    this.loadState();
    const next = this.jobs.find((job) => job.status === "queued");
    if (!next) {
      return;
    }
    this.isRunning = true;
    void this.runJob(next).finally(() => {
      this.isRunning = false;
      this.runNext();
    });
  }

  private async runJob(job: JobRecord): Promise<void> {
    job.status = "running";
    job.startedAt = nowIso();
    job.progressMessage = "Running.";
    this.saveState();

    ensureDir(logsDir());
    ensureDir(path.dirname(job.spec.logPath));
    const logStream = fs.createWriteStream(job.spec.logPath, { flags: "a" });

    try {
      for (const command of job.spec.commands) {
        if (job.cancelRequested) {
          this.markCancelled(job, "Cancelled by user.");
          return;
        }

        job.progressMessage = command.description;
        this.saveState();
        logStream.write(`\n[${nowIso()}] ${command.description}\n$ ${command.argv.join(" ")}\n`);

        const exitCode = await this.runCommand(job, command.argv, logStream);

        if (job.cancelRequested) {
          this.markCancelled(job, "Cancelled by user.");
          return;
        }

        if (exitCode !== 0) {
          if (command.allowFailure) {
            job.progressMessage = `${command.description} failed with exit code ${exitCode}; continuing.`;
            this.saveState();
            continue;
          }
          this.markFailed(job, exitCode, job.progressMessage || "Command failed.");
          return;
        }
      }

      job.status = "succeeded";
      job.exitCode = 0;
      job.finishedAt = nowIso();
      job.progressMessage = "Completed successfully.";
      this.saveState();
    } finally {
      logStream.end();
      this.activeProcess = null;
      this.activeJobId = null;
    }
  }

  private runCommand(job: JobRecord, argv: string[], logStream: fs.WriteStream): Promise<number> {
    return new Promise((resolve) => {
      const [command, ...args] = argv;
      const env = sanitizeEnv();

      if (job.spec.useProxy) {
        env.http_proxy = "http://manescu.bogdan:GdJh%23Pdg9b3%40@175.16.3.253:3128";
        env.https_proxy = "http://manescu.bogdan:GdJh%23Pdg9b3%40@175.16.3.253:3128";
      }

      const child = spawn(command, args, {
        cwd: repoRoot(),
        env,
        shell: process.platform === "win32",
        windowsHide: true,
      });

      this.activeProcess = child;
      this.activeJobId = job.spec.jobId;

      let lastLine = "";
      const updateLine = (chunk: Buffer) => {
        const text = chunk.toString("utf-8");
        logStream.write(text);
        const lines = text.split(/\r?\n/).filter(Boolean);
        if (lines.length) {
          lastLine = lines[lines.length - 1].slice(0, 300);
          job.progressMessage = lastLine;
          this.saveState();
        }
      };

      child.stdout?.on("data", updateLine);
      child.stderr?.on("data", updateLine);

      child.on("error", (err) => {
        lastLine = err.message;
        job.progressMessage = lastLine;
        this.saveState();
        resolve(1);
      });

      child.on("close", (code) => {
        if (lastLine) {
          job.progressMessage = lastLine;
          this.saveState();
        }
        resolve(code ?? 0);
      });
    });
  }

  private markFailed(job: JobRecord, exitCode: number, message: string): void {
    job.status = "failed";
    job.exitCode = exitCode;
    job.errorSummary = message;
    job.finishedAt = nowIso();
    job.progressMessage = message;
    this.saveState();
  }

  private markCancelled(job: JobRecord, message: string): void {
    job.status = "cancelled";
    job.finishedAt = nowIso();
    job.progressMessage = message;
    this.saveState();
  }
}

export const jobRunner = new JobRunner();
