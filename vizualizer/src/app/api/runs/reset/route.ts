import { NextResponse } from "next/server";

import { jobRunner } from "@/app/lib/job-runner";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  try {
    jobRunner.reset();
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to reset runner." },
      { status: 400 },
    );
  }
}
