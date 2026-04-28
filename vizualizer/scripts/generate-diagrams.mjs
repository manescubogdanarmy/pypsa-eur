#!/usr/bin/env node
/**
 * generate-diagrams.mjs
 *
 * Generates draw.io diagrams from simulation result CSVs, then exports each to PNG
 * via the draw.io desktop CLI.
 *
 * Usage:
 *   node vizualizer/scripts/generate-diagrams.mjs <result-name>
 *
 * Outputs (inside results/<result-name>/):
 *   diagram_cost_ens.drawio / .png         — Cost comparison + ENS
 *   diagram_generation_mix.drawio / .png   — Generation mix by carrier
 *   diagram_price_curtail.drawio / .png    — LMP prices + curtailment
 *   diagram_interconnectors.drawio / .png  — Interconnector loading
 */

import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { spawnSync } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, "../..");
const RESULTS_DIR = path.join(REPO_ROOT, "results");
const DRAWIO_EXE = "C:\\Program Files\\draw.io\\draw.io.exe";

// ── CSV parser ───────────────────────────────────────────────────────────────

function splitCsvLine(line) {
  const result = [];
  let field = "";
  let inQuotes = false;
  for (const ch of line) {
    if (ch === '"') { inQuotes = !inQuotes; }
    else if (ch === "," && !inQuotes) { result.push(field.trim()); field = ""; }
    else { field += ch; }
  }
  result.push(field.trim());
  return result;
}

function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length < 1) return { columns: [], rows: [] };
  const columns = splitCsvLine(lines[0]);
  const rows = lines.slice(1).map((line) => {
    const vals = splitCsvLine(line);
    const row = {};
    columns.forEach((col, i) => { row[col] = vals[i] ?? ""; });
    return row;
  });
  return { columns, rows };
}

async function loadCsv(filePath) {
  try {
    const text = await fs.readFile(filePath, "utf-8");
    return parseCsv(text);
  } catch {
    return { columns: [], rows: [] };
  }
}

// ── Formatting ───────────────────────────────────────────────────────────────

function esc(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function fmtM(n, digits = 2) {
  const v = parseFloat(n);
  if (isNaN(v)) return "—";
  return (v / 1_000_000).toFixed(digits) + " M€";
}

function fmtNum(n, digits = 1) {
  const v = parseFloat(n);
  if (isNaN(v)) return "—";
  return v.toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

function fmtPct(n, digits = 1) {
  const v = parseFloat(n);
  if (isNaN(v)) return "—";
  return (v >= 0 ? "+" : "") + v.toFixed(digits) + "%";
}

function fmtMwh(n) {
  const v = parseFloat(n);
  if (isNaN(v)) return "—";
  if (Math.abs(v) >= 1000) return fmtNum(v / 1000, 1) + " GWh";
  return fmtNum(v, 0) + " MWh";
}

function deltaColor(n) {
  const v = parseFloat(n);
  if (isNaN(v) || v === 0) return "#444444";
  return v > 0 ? "#BB2200" : "#006633";
}

// ── mxGraph XML builder ──────────────────────────────────────────────────────

let _id = 0;
const uid = () => `x${(++_id).toString(36)}`;

function cell({ x, y, w, h, fill = "#FFFFFF", stroke = "#CCCCCC", label = "",
                fontSize = 10, fontStyle = 0, fontColor = "#333333",
                align = "left", vAlign = "middle", pad = 8, rounded = 0 }) {
  const padL = align === "left" ? pad : 0;
  const padR = align === "right" ? pad : 0;
  const style = [
    "text", "html=1",
    `strokeColor=${stroke}`, `fillColor=${fill}`,
    `align=${align}`, `verticalAlign=${vAlign}`,
    "whiteSpace=wrap", `rounded=${rounded}`,
    `fontSize=${fontSize}`, `fontStyle=${fontStyle}`,
    `fontColor=${fontColor}`,
    `spacingLeft=${padL}`, `spacingRight=${padR}`,
  ].join(";");
  return `        <mxCell id="${uid()}" value="${esc(label)}" style="${style};" vertex="1" parent="1">`
    + `\n          <mxGeometry x="${x}" y="${y}" width="${w}" height="${h}" as="geometry" />`
    + `\n        </mxCell>`;
}

function banner(x, y, w, title, subtitle) {
  return [
    cell({ x, y, w, h: 56, fill: "#001F3F", stroke: "#001F3F", label: title, fontSize: 18, fontStyle: 1, fontColor: "#FFFFFF", align: "center" }),
    cell({ x, y: y + 56, w, h: 26, fill: "#003366", stroke: "#003366", label: subtitle, fontSize: 9, fontColor: "#AACCEE", align: "center" }),
  ].join("\n");
}

// Table: header + rows
// cols: [{label, width, align?}]
// rows: array of arrays of {value, color?}
function table(x, y, cols, dataRows, rowH = 28) {
  const cells = [];
  const hdrH = 34;

  // Header
  let cx = x;
  for (const col of cols) {
    cells.push(cell({ x: cx, y, w: col.width, h: hdrH, fill: "#003366", stroke: "#002147", label: col.label, fontSize: 10, fontStyle: 1, fontColor: "#FFFFFF", align: col.align ?? "center" }));
    cx += col.width;
  }

  // Rows
  dataRows.forEach((row, ri) => {
    const bg = ri % 2 === 0 ? "#EEF4FB" : "#FFFFFF";
    cx = x;
    row.forEach((cell_, ci) => {
      const val = typeof cell_ === "object" ? cell_.value : cell_;
      const fc = typeof cell_ === "object" && cell_.color ? cell_.color : "#333333";
      const colDef = cols[ci];
      cells.push(cell({ x: cx, y: y + hdrH + ri * rowH, w: colDef.width, h: rowH, fill: bg, stroke: "#DDDDDD", label: String(val ?? "—"), fontSize: 10, fontColor: fc, align: colDef.align ?? "center", pad: colDef.align === "left" ? 8 : 4 }));
      cx += colDef.width;
    });
  });

  return cells.join("\n");
}

function metricCard(x, y, w, h, title, value, unit, accent = "#0055AA") {
  return [
    cell({ x, y, w, h, fill: "#FFFFFF", stroke: "#CCDDEE", label: "", rounded: 1 }),
    cell({ x, y, w, h: 5, fill: accent, stroke: accent, label: "", rounded: 0 }),
    cell({ x: x + 6, y: y + 10, w: w - 12, h: 18, fill: "#FFFFFF", stroke: "none", label: title, fontSize: 9, fontColor: "#666666", align: "center" }),
    cell({ x: x + 6, y: y + 30, w: w - 12, h: 38, fill: "#FFFFFF", stroke: "none", label: String(value), fontSize: 22, fontStyle: 1, fontColor: "#001F3F", align: "center" }),
    cell({ x: x + 6, y: y + 68, w: w - 12, h: 18, fill: "#FFFFFF", stroke: "none", label: String(unit), fontSize: 9, fontColor: accent, align: "center" }),
  ].join("\n");
}

function sectionLabel(x, y, w, label) {
  return cell({ x, y, w, h: 22, fill: "#E8EEF4", stroke: "#AABBCC", label, fontSize: 10, fontStyle: 1, fontColor: "#003366", align: "center" });
}

function wrapDiagram(name, id, bodyXml, pageW = 1400, pageH = 850) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<mxfile host="pypsa-eur-romania" version="24.7.5" type="device">
  <diagram name="${esc(name)}" id="${esc(id)}">
    <mxGraphModel dx="1422" dy="762" grid="0" gridSize="10" guides="0" tooltips="1"
                  connect="0" arrows="0" fold="0" page="0" pageScale="1"
                  pageWidth="${pageW}" pageHeight="${pageH}" math="0" shadow="0">
      <root>
        <mxCell id="0" />
        <mxCell id="1" parent="0" />
${bodyXml}
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>`;
}

// ── Diagram 1: Cost + ENS ────────────────────────────────────────────────────

function buildCostEns(cost, ens, resultName) {
  _id = 200;
  const parts = [];
  const W = 1360, PAD = 20;

  // Banner
  parts.push(banner(PAD, PAD, W, "SYSTEM COST &amp; ENERGY NOT SERVED", `Scenario: ${resultName}`));

  // Cost table
  const crow = cost.rows[0] ?? {};
  const baseC = parseFloat(crow.baseline_total_system_cost_eur ?? 0);
  const scenC = parseFloat(crow.scenario_total_system_cost_eur ?? 0);
  const deltaEur = parseFloat(crow.delta_eur ?? scenC - baseC);
  const deltaPct = parseFloat(crow.delta_percent ?? 0);

  parts.push(sectionLabel(PAD, 118, 680, "TOTAL SYSTEM COST"));
  const costCols = [
    { label: "Metric", width: 200, align: "left" },
    { label: "Baseline", width: 160, align: "center" },
    { label: "Stress Scenario", width: 160, align: "center" },
    { label: "Delta (M€)", width: 160, align: "center" },
  ];
  const costRows = [
    ["Total System Cost", fmtM(baseC), fmtM(scenC), { value: (deltaEur >= 0 ? "+" : "") + fmtM(deltaEur), color: deltaColor(deltaEur) }],
    [`Delta (%)`, "", "", { value: fmtPct(deltaPct), color: deltaColor(deltaPct) }],
  ];
  parts.push(table(PAD, 140, costCols, costRows, 32));

  // ENS cards
  parts.push(sectionLabel(PAD, 260, 680, "ENERGY NOT SERVED (ENS)"));
  const ensBase = ens.rows.find((r) => r.case === "baseline") ?? {};
  const ensScen = ens.rows.find((r) => r.case === "scenario") ?? {};

  const cardW = 160, cardH = 100, cardY = 286;
  parts.push(metricCard(PAD,       cardY, cardW, cardH, "ENS — Baseline",  fmtMwh(ensBase.ens_mwh ?? 0), `${fmtNum(ensBase.hours_with_shedding ?? 0, 0)} h shedding`, "#3377BB"));
  parts.push(metricCard(PAD + 170, cardY, cardW, cardH, "ENS — Scenario",  fmtMwh(ensScen.ens_mwh ?? 0), `${fmtNum(ensScen.hours_with_shedding ?? 0, 0)} h shedding`, "#BB3300"));
  parts.push(metricCard(PAD + 340, cardY, cardW, cardH, "Peak Shedding",   fmtNum(ensScen.max_shedding_mw ?? 0, 0) + " MW", "stress scenario peak", "#885500"));
  parts.push(metricCard(PAD + 510, cardY, cardW, cardH, "Δ ENS",
    fmtMwh((parseFloat(ensScen.ens_mwh ?? 0) - parseFloat(ensBase.ens_mwh ?? 0))),
    "scenario − baseline", "#660066"));

  return wrapDiagram("Cost & ENS", "cost-ens", parts.join("\n"), 1400, 420);
}

// ── Diagram 2: Generation Mix ────────────────────────────────────────────────

function buildGenerationMix(mix, resultName) {
  _id = 400;
  const parts = [];
  const W = 1360, PAD = 20;

  parts.push(banner(PAD, PAD, W, "GENERATION MIX — Romania", `Scenario: ${resultName}`));

  // Pivot: carrier → {baseline, scenario}
  const byCarrier = {};
  for (const row of mix.rows) {
    const c = row.carrier ?? "unknown";
    if (!byCarrier[c]) byCarrier[c] = { baseline: 0, scenario: 0 };
    byCarrier[c][row.case] = parseFloat(row.generation_mwh ?? 0);
  }

  const carriers = Object.entries(byCarrier)
    .sort((a, b) => (b[1].baseline + b[1].scenario) - (a[1].baseline + a[1].scenario));

  const cols = [
    { label: "Carrier / Technology", width: 220, align: "left" },
    { label: "Baseline (MWh)", width: 180, align: "center" },
    { label: "Scenario (MWh)", width: 180, align: "center" },
    { label: "Δ MWh", width: 160, align: "center" },
    { label: "Δ %", width: 120, align: "center" },
  ];

  const dataRows = carriers.map(([carrier, vals]) => {
    const delta = vals.scenario - vals.baseline;
    const pct = vals.baseline !== 0 ? (delta / vals.baseline) * 100 : 0;
    return [
      carrier,
      fmtMwh(vals.baseline),
      fmtMwh(vals.scenario),
      { value: (delta >= 0 ? "+" : "") + fmtMwh(delta), color: deltaColor(-delta) }, // more gen from RES = good
      { value: fmtPct(pct), color: "#444444" },
    ];
  });

  parts.push(table(PAD, 100, cols, dataRows, 28));

  const tableH = 34 + dataRows.length * 28;
  return wrapDiagram("Generation Mix", "gen-mix", parts.join("\n"), 1400, 120 + tableH);
}

// ── Diagram 3: Price + Curtailment ───────────────────────────────────────────

function buildPriceCurtail(lmp, curtail, resultName) {
  _id = 600;
  const parts = [];
  const PAD = 20;

  parts.push(banner(PAD, PAD, 1360, "PRICE (LMP) &amp; CURTAILMENT", `Scenario: ${resultName}`));

  // LMP table
  parts.push(sectionLabel(PAD, 100, 660, "LOCATIONAL MARGINAL PRICE — Romania Buses (avg)"));
  const lmpBase = lmp.rows.find((r) => r.case === "baseline") ?? {};
  const lmpScen = lmp.rows.find((r) => r.case === "scenario") ?? {};
  const lmpCols = [
    { label: "Metric", width: 220, align: "left" },
    { label: "Baseline (€/MWh)", width: 200, align: "center" },
    { label: "Scenario (€/MWh)", width: 200, align: "center" },
    { label: "Δ €/MWh", width: 160, align: "center" },
  ];
  const lmpRows = [
    ["Mean LMP", fmtNum(lmpBase.mean_eur_per_mwh, 2), fmtNum(lmpScen.mean_eur_per_mwh, 2),
      { value: (parseFloat(lmpScen.mean_eur_per_mwh ?? 0) >= parseFloat(lmpBase.mean_eur_per_mwh ?? 0) ? "+" : "") + fmtNum(parseFloat(lmpScen.mean_eur_per_mwh ?? 0) - parseFloat(lmpBase.mean_eur_per_mwh ?? 0), 2), color: deltaColor(parseFloat(lmpScen.mean_eur_per_mwh ?? 0) - parseFloat(lmpBase.mean_eur_per_mwh ?? 0)) }],
    ["P95 LMP", fmtNum(lmpBase.p95_eur_per_mwh, 2), fmtNum(lmpScen.p95_eur_per_mwh, 2),
      { value: "", color: "#444444" }],
    ["Max LMP", fmtNum(lmpBase.max_eur_per_mwh, 2), fmtNum(lmpScen.max_eur_per_mwh, 2),
      { value: "", color: "#444444" }],
  ];
  parts.push(table(PAD, 122, lmpCols, lmpRows, 30));

  // Curtailment table
  const byCarrier = {};
  for (const row of curtail.rows) {
    const c = row.carrier ?? "unknown";
    if (!byCarrier[c]) byCarrier[c] = { baseline: 0, scenario: 0 };
    byCarrier[c][row.case] = parseFloat(row.curtailment_mwh ?? 0);
  }
  const curtailCarriers = Object.entries(byCarrier)
    .sort((a, b) => (b[1].baseline + b[1].scenario) - (a[1].baseline + a[1].scenario));

  parts.push(sectionLabel(680 + PAD, 100, 640, "CURTAILMENT BY CARRIER"));
  const curtCols = [
    { label: "Carrier", width: 200, align: "left" },
    { label: "Baseline (MWh)", width: 180, align: "center" },
    { label: "Scenario (MWh)", width: 180, align: "center" },
    { label: "Δ MWh", width: 140, align: "center" },
  ];
  const curtRows = curtailCarriers.map(([carrier, vals]) => {
    const delta = vals.scenario - vals.baseline;
    return [carrier, fmtMwh(vals.baseline), fmtMwh(vals.scenario),
      { value: (delta >= 0 ? "+" : "") + fmtMwh(delta), color: "#444444" }];
  });

  if (curtRows.length === 0) {
    curtRows.push(["No curtailment data", "—", "—", "—"]);
  }

  parts.push(table(680 + PAD, 122, curtCols, curtRows, 30));

  const maxRows = Math.max(3, curtRows.length);
  const tableH = 34 + maxRows * 30;
  return wrapDiagram("Price & Curtailment", "price-curtail", parts.join("\n"), 1400, 140 + tableH);
}

// ── Diagram 4: Interconnectors ───────────────────────────────────────────────

function buildInterconnectors(flows, resultName) {
  _id = 800;
  const parts = [];
  const W = 1360, PAD = 20;

  parts.push(banner(PAD, PAD, W, "INTERCONNECTOR LOADING — Border Assets", `Scenario: ${resultName}`));

  // Pivot by asset
  const byAsset = {};
  for (const row of flows.rows) {
    const key = row.asset ?? "unknown";
    if (!byAsset[key]) byAsset[key] = { component: row.component ?? "", baseline: null, scenario: null };
    byAsset[key][row.case] = row;
  }

  const assets = Object.entries(byAsset).sort((a, b) => a[0].localeCompare(b[0]));

  const cols = [
    { label: "Asset", width: 260, align: "left" },
    { label: "Type", width: 80, align: "center" },
    { label: "Mean Loading B", width: 140, align: "center" },
    { label: "Mean Loading S", width: 140, align: "center" },
    { label: "P95 Loading S", width: 130, align: "center" },
    { label: "Congested h (B)", width: 130, align: "center" },
    { label: "Congested h (S)", width: 130, align: "center" },
    { label: "Flow B (MWh)", width: 140, align: "center" },
    { label: "Flow S (MWh)", width: 140, align: "center" },
  ];

  const dataRows = assets.map(([asset, data]) => {
    const b = data.baseline ?? {};
    const s = data.scenario ?? {};
    const bLoad = parseFloat(b.mean_loading ?? 0);
    const sLoad = parseFloat(s.mean_loading ?? 0);
    const loadDelta = sLoad - bLoad;
    return [
      asset,
      data.component,
      { value: fmtNum(bLoad * 100, 1) + "%", color: bLoad > 0.9 ? "#CC2200" : "#333333" },
      { value: fmtNum(sLoad * 100, 1) + "%", color: loadDelta > 0 ? "#BB3300" : "#006633" },
      { value: fmtNum(parseFloat(s.p95_loading ?? 0) * 100, 1) + "%", color: parseFloat(s.p95_loading ?? 0) > 0.9 ? "#CC2200" : "#333333" },
      fmtNum(b.congested_hours ?? 0, 0),
      { value: fmtNum(s.congested_hours ?? 0, 0), color: parseInt(s.congested_hours ?? 0) > parseInt(b.congested_hours ?? 0) ? "#BB3300" : "#006633" },
      fmtMwh(b.total_abs_flow_mwh ?? 0),
      fmtMwh(s.total_abs_flow_mwh ?? 0),
    ];
  });

  if (dataRows.length === 0) {
    dataRows.push(["No interconnector data available", "—", "—", "—", "—", "—", "—", "—", "—"]);
  }

  parts.push(table(PAD, 100, cols, dataRows, 28));

  // Legend
  const legendY = 100 + 34 + dataRows.length * 28 + 16;
  parts.push(cell({ x: PAD, y: legendY, w: 800, h: 20, fill: "#F5F5F5", stroke: "#CCCCCC", label: "B = Baseline  |  S = Stress Scenario  |  Loading &gt; 90% shown in red  |  Congested = loading &gt; 95%", fontSize: 9, fontColor: "#666666", align: "center" }));

  const pageH = legendY + 36;
  return wrapDiagram("Interconnectors", "interconnectors", parts.join("\n"), 1400, pageH);
}

// ── draw.io CLI export ───────────────────────────────────────────────────────

function exportPng(drawioPath, pngPath) {
  console.log(`  Exporting ${path.basename(drawioPath)} → ${path.basename(pngPath)}`);
  const result = spawnSync(
    DRAWIO_EXE,
    ["--export", "--format", "png", "--border", "20", "--output", pngPath, drawioPath],
    { encoding: "utf-8", timeout: 30_000 }
  );
  if (result.status !== 0) {
    console.warn(`  draw.io export warning (exit ${result.status}): ${result.stderr || result.error?.message || "unknown"}`);
    return false;
  }
  return true;
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const resultName = process.argv[2];
  if (!resultName) {
    console.error("Usage: node generate-diagrams.mjs <result-name>");
    process.exit(1);
  }

  const resultDir = path.join(RESULTS_DIR, resultName);

  try {
    await fs.access(resultDir);
  } catch {
    console.error(`Result directory not found: ${resultDir}`);
    process.exit(1);
  }

  console.log(`Generating diagrams for: ${resultName}`);

  // Load CSVs
  const [cost, ens, mix, lmp, curtail, flows] = await Promise.all([
    loadCsv(path.join(resultDir, "system_cost_comparison.csv")),
    loadCsv(path.join(resultDir, "ens_summary.csv")),
    loadCsv(path.join(resultDir, "generation_mix_mwh.csv")),
    loadCsv(path.join(resultDir, "lmp_summary_ro.csv")),
    loadCsv(path.join(resultDir, "curtailment_mwh.csv")),
    loadCsv(path.join(resultDir, "interconnector_flow_congestion.csv")),
  ]);

  const diagrams = [
    { name: "diagram_cost_ens",       xml: buildCostEns(cost, ens, resultName) },
    { name: "diagram_generation_mix", xml: buildGenerationMix(mix, resultName) },
    { name: "diagram_price_curtail",  xml: buildPriceCurtail(lmp, curtail, resultName) },
    { name: "diagram_interconnectors",xml: buildInterconnectors(flows, resultName) },
  ];

  for (const { name, xml } of diagrams) {
    const drawioPath = path.join(resultDir, `${name}.drawio`);
    const pngPath    = path.join(resultDir, `${name}.png`);

    console.log(`  Writing ${name}.drawio`);
    await fs.writeFile(drawioPath, xml, "utf-8");
    exportPng(drawioPath, pngPath);
  }

  console.log("Done.");
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
