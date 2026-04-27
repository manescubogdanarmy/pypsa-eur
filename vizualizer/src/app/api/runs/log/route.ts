import { NextRequest, NextResponse } from "next/server";

import { jobRunner } from "@/app/lib/job-runner";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const jobId = new URL(req.url).searchParams.get("jobId") || "";
  if (!jobId) {
    return NextResponse.json({ log: "" });
  }
  const log = await jobRunner.getLog(jobId, 200);
  return NextResponse.json({ log });
}
