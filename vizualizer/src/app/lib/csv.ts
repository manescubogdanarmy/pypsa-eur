import fs from "fs/promises";
import Papa from "papaparse";

import type { CsvPreview } from "./types";

export function parseCsvText(text: string, limit?: number): CsvPreview {
  const parsed = Papa.parse<Record<string, string | number | null>>(text, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: true,
  });

  const rows = (parsed.data || []).filter((row) => row && Object.keys(row).length > 0);
  const sliced = typeof limit === "number" ? rows.slice(0, limit) : rows;
  const columns = parsed.meta.fields || (sliced[0] ? Object.keys(sliced[0]) : []);

  return { columns, rows: sliced };
}

export async function loadCsvPreview(filePath: string, limit?: number): Promise<CsvPreview> {
  const content = await fs.readFile(filePath, "utf-8");
  return parseCsvText(content, limit);
}
