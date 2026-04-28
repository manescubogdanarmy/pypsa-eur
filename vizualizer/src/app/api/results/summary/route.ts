import { NextRequest, NextResponse } from "next/server";

import path from "path";

import { loadAssumptions, parseSummary, scanResults } from "@/app/lib/results";
import { resultsDir } from "@/app/lib/paths";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const name = new URL(req.url).searchParams.get("name") || "";
  if (!name) {
    return NextResponse.json({ error: "Result name required." }, { status: 400 });
  }

  const results = await scanResults();
  const entry = results.find((item) => item.name === name);
  if (!entry) {
    return NextResponse.json({ error: "Result not found." }, { status: 404 });
  }

  const resultDir = path.join(resultsDir(), entry.name);
  const summary = await parseSummary(resultDir);
  const assumptions = await loadAssumptions(entry.name);

  return NextResponse.json({
    summary,
    csvFiles: entry.csvFiles,
    figureFiles: entry.figureFiles,
    drawioFiles: entry.drawioFiles,
    svgFiles: entry.svgFiles,
    assumptions,
  });
}
