import { NextRequest, NextResponse } from "next/server";

import { loadAssumptions } from "@/app/lib/results";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const name = new URL(req.url).searchParams.get("name") || "";
  if (!name) {
    return NextResponse.json({ assumptions: "" });
  }
  const assumptions = await loadAssumptions(name);
  return NextResponse.json({ assumptions });
}
