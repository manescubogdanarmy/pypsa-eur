import { NextRequest, NextResponse } from "next/server";
import path from "path";

import { jobRunner } from "@/app/lib/job-runner";
import { logsDir } from "@/app/lib/paths";
import { buildCommands, buildConfigs, normalizeScenarioInputs } from "@/app/lib/scenario";
import type { JobSpec } from "@/app/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const inputs = normalizeScenarioInputs(payload);
    const buildResult = await buildConfigs(inputs);
    const commands = buildCommands(inputs, buildResult);

    const jobId = crypto.randomUUID().slice(0, 12);
    const logPath = path.join(logsDir(), `${jobId}.log`);

    const spec: JobSpec = {
      jobId,
      outputName: inputs.outputName,
      mode: inputs.runMode,
      createdAt: new Date().toISOString(),
      commands: commands.map((command) => ({
        argv: command.argv,
        description: command.description,
        allowFailure: Boolean(command.allowFailure),
      })),
      generatedConfigs: Object.values(buildResult.generatedConfigs).filter(Boolean) as string[],
      reportOutdir: buildResult.reportOutdir,
      logPath,
      scenarioRunName: buildResult.scenarioRunName,
      baselineRunName: buildResult.baselineRunName || null,
      country: inputs.country,
      useProxy: inputs.useProxy || false,
    };

    jobRunner.enqueue(spec);
    return NextResponse.json({ jobId });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to enqueue run." },
      { status: 400 },
    );
  }
}
