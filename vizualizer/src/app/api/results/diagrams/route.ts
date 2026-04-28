import path from "path";
import { spawnSync } from "child_process";
import { NextRequest } from "next/server";

import { getResultPath } from "@/app/lib/results";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const url = new URL(req.url);
  const name = url.searchParams.get("name") || "";
  const svg = url.searchParams.get("svg") || "";
  const svgOnly = url.searchParams.get("svgOnly") || "";

  if (!name) {
    return new Response("Missing parameter: name", { status: 400 });
  }

  try {
    await getResultPath(name); // validates name is safe
  } catch {
    return new Response("Invalid result name", { status: 400 });
  }

  const scriptPath = path.resolve(process.cwd(), "scripts", "generate-diagrams.mjs");

  const args = [scriptPath, name];
  if (svgOnly === "1" || svgOnly === "true") {
    args.push("--svg-only");
  } else if (svg === "1" || svg === "true") {
    args.push("--svg");
  }

  const result = spawnSync(process.execPath, args, {
    encoding: "utf-8",
    timeout: 120_000,
    cwd: path.resolve(process.cwd(), ".."),
  });

  if (result.status !== 0) {
    const stderr = result.stderr || result.error?.message || "Unknown error";
    return new Response(JSON.stringify({ ok: false, error: stderr }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ ok: true, output: result.stdout }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
