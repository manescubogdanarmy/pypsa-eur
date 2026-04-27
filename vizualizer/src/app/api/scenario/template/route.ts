import { NextRequest, NextResponse } from "next/server";

import { loadTemplateText } from "@/app/lib/scenario";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const year = new URL(req.url).searchParams.get("year") || "2020";
  try {
    const yaml = await loadTemplateText(year);
    return NextResponse.json({ yaml });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load template." },
      { status: 400 },
    );
  }
}
