import { NextResponse } from "next/server";

import { jobRunner } from "@/app/lib/job-runner";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ jobs: jobRunner.getJobs() });
}
