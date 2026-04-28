import { NextRequest } from "next/server";

import { loadFigureFromResult } from "@/app/lib/results";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const name = url.searchParams.get("name") || "";
  const file = url.searchParams.get("file") || "";

  if (!name || !file) {
    return new Response("Missing parameters", { status: 400 });
  }

  try {
    const buffer = await loadFigureFromResult(name, file);
    return new Response(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return new Response(error instanceof Error ? error.message : "Not found", { status: 404 });
  }
}
