import { NextRequest, NextResponse } from "next/server";

import { buildWorkingYaml, normalizeScenarioInputs } from "@/app/lib/scenario";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const inputs = normalizeScenarioInputs(payload);
    const yaml = await buildWorkingYaml(inputs);
    return NextResponse.json({ yaml });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to build YAML." },
      { status: 400 },
    );
  }
}
