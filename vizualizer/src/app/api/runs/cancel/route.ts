import { NextRequest, NextResponse } from "next/server";

import { jobRunner } from "@/app/lib/job-runner";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const jobId = String(payload?.jobId || "");
    if (!jobId) {
      return NextResponse.json({ error: "Job id required." }, { status: 400 });
    }
    const ok = jobRunner.cancel(jobId);
    return NextResponse.json({ ok });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to cancel job." },
      { status: 400 },
    );
  }
}
