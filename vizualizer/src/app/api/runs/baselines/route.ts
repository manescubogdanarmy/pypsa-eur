import { NextResponse } from "next/server";

import { listBaselineNetworks } from "@/app/lib/results";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const baselines = await listBaselineNetworks();
  return NextResponse.json({ baselines });
}
