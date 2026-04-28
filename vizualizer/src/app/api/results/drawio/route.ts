import path from "path";
import fs from "fs/promises";
import { NextRequest } from "next/server";

import { resultsDir } from "@/app/lib/paths";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function safeName(name: string): boolean {
  return /^[a-zA-Z0-9._-]+$/.test(name);
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const name = url.searchParams.get("name") || "";
  const file = url.searchParams.get("file") || "";

  if (!name || !file) {
    return new Response("Missing parameters", { status: 400 });
  }
  if (!safeName(name) || !safeName(file) || !file.endsWith(".drawio")) {
    return new Response("Invalid request", { status: 400 });
  }

  const filePath = path.join(resultsDir(), name, file);
  try {
    const buffer = await fs.readFile(filePath);
    return new Response(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/xml",
        "Content-Disposition": `attachment; filename="${file}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
