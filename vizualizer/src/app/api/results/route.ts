import { NextResponse } from "next/server";

import { scanResults } from "@/app/lib/results";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const results = await scanResults();
  return NextResponse.json({ results });
}
