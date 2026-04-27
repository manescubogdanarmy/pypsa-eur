import { NextRequest, NextResponse } from "next/server";

import { loadCsvFromResult } from "@/app/lib/results";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const name = url.searchParams.get("name") || "";
  const file = url.searchParams.get("file") || "";
  const limitRaw = url.searchParams.get("limit");
  const limit = limitRaw ? Number(limitRaw) : undefined;

  if (!name || !file) {
    return NextResponse.json({ error: "Result name and file required." }, { status: 400 });
  }

  try {
    const preview = await loadCsvFromResult(name, file, limit);
    return NextResponse.json({ preview });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load CSV." },
      { status: 400 },
    );
  }
}
