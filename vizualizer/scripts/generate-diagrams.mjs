#!/usr/bin/env node
/**
 * generate-diagrams.mjs
 *
 * Generates draw.io diagrams from simulation result CSVs, then exports each to PNG
 * (optionally SVG) via the draw.io desktop CLI.
 *
 * Usage:
 *   node vizualizer/scripts/generate-diagrams.mjs <result-name> [--svg] [--svg-only]
 *
 * Outputs (inside results/<result-name>/):
 *   diagram_cost_ens.drawio / .png         — Cost comparison + ENS
 *   diagram_generation_mix.drawio / .png   — Generation mix by carrier
 *   diagram_price_curtail.drawio / .png    — LMP prices + curtailment
 *   diagram_net_imports.drawio / .png      — Daily net imports comparison
 *   diagram_interconnectors.drawio / .png  — Interconnector loading
 *   diagram_*.svg (when --svg/--svg-only)  — Transparent background, light theme
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

const THEME_DEFAULT = {
  ink: "#1E2B3A",
  muted: "#5D6A7B",
  navy: "#0A3DA3",
  navyDark: "#072A75",
  sky: "#EDF5FF",
  paper: "#F7FAFF",
  line: "#C7D5EF",
  baseline: "#0A3DA3",
  scenario: "#F28C28",
  positive: "#0F7B3B",
  negative: "#C4372A",
  track: "#E3ECFA",
};

const THEME_SVG_LIGHT = {
  ...THEME_DEFAULT,
  paper: "none",
};

let THEME = THEME_DEFAULT;

function esc(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function num(value) {
  const v = parseFloat(value);
  return Number.isFinite(v) ? v : 0;
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

function fmtSignedMwh(n) {
  const v = parseFloat(n);
  if (isNaN(v)) return "—";
  const sign = v > 0 ? "+" : "";
  return sign + fmtMwh(v);
}

function deltaColor(n) {
  const v = parseFloat(n);
  if (isNaN(v) || v === 0) return THEME.muted;
  return v > 0 ? THEME.negative : THEME.positive;
}

// ── mxGraph XML builder ──────────────────────────────────────────────────────

let _id = 0;
const uid = () => `x${(++_id).toString(36)}`;

function cell({ x, y, w, h, fill = "#FFFFFF", stroke = "#CCCCCC", label = "",
                fontSize = 10, fontStyle = 0, fontColor = THEME.ink,
                align = "left", vAlign = "middle", pad = 8, rounded = 0,
                shape = "text", fontFamily = "Helvetica" }) {
  const padL = align === "left" ? pad : 0;
  const padR = align === "right" ? pad : 0;
  const shapeStyle = shape === "text" ? "text" : `shape=${shape}`;
  const style = [
    shapeStyle, "html=1",
    `strokeColor=${stroke}`, `fillColor=${fill}`,
    `align=${align}`, `verticalAlign=${vAlign}`,
    "whiteSpace=wrap", `rounded=${rounded}`,
    `fontSize=${fontSize}`, `fontStyle=${fontStyle}`,
    `fontColor=${fontColor}`,
    `spacingLeft=${padL}`, `spacingRight=${padR}`,
    `fontFamily=${fontFamily}`,
  ].join(";");
  return `        <mxCell id="${uid()}" value="${esc(label)}" style="${style};" vertex="1" parent="1">`
    + `\n          <mxGeometry x="${x}" y="${y}" width="${w}" height="${h}" as="geometry" />`
    + `\n        </mxCell>`;
}

function rect({ x, y, w, h, fill = "#FFFFFF", stroke = "none", rounded = 0, opacity = 100 }) {
  const style = [
    "shape=rect", "html=1",
    `strokeColor=${stroke}`,
    `fillColor=${fill}`,
    `rounded=${rounded}`,
    `opacity=${opacity}`,
  ].join(";");
  return `        <mxCell id="${uid()}" value="" style="${style};" vertex="1" parent="1">`
    + `\n          <mxGeometry x="${x}" y="${y}" width="${w}" height="${h}" as="geometry" />`
    + `\n        </mxCell>`;
}

function backgroundRect(pageW, pageH) {
  if (THEME.paper === "none") {
    return "";
  }
  return rect({ x: 0, y: 0, w: pageW, h: pageH, fill: THEME.paper, stroke: THEME.paper });
}

function banner(x, y, w, title, subtitle) {
  return [
    cell({ x, y, w, h: 56, fill: THEME.navy, stroke: THEME.navy, label: title, fontSize: 18, fontStyle: 1, fontColor: "#FFFFFF", align: "center" }),
    cell({ x, y: y + 56, w, h: 26, fill: THEME.navyDark, stroke: THEME.navyDark, label: subtitle, fontSize: 9, fontColor: "#C9D7F5", align: "center" }),
  ].join("\n");
}

function table(x, y, cols, dataRows, rowH = 28) {
  const cells = [];
  const hdrH = 34;

  let cx = x;
  for (const col of cols) {
    cells.push(cell({ x: cx, y, w: col.width, h: hdrH, fill: THEME.navyDark, stroke: THEME.navyDark, label: col.label, fontSize: 10, fontStyle: 1, fontColor: "#FFFFFF", align: col.align ?? "center" }));
    cx += col.width;
  }

  dataRows.forEach((row, ri) => {
    const bg = ri % 2 === 0 ? "#F3F7FF" : "#FFFFFF";
    cx = x;
    row.forEach((cell_, ci) => {
      const val = typeof cell_ === "object" ? cell_.value : cell_;
      const fc = typeof cell_ === "object" && cell_.color ? cell_.color : THEME.ink;
      const colDef = cols[ci];
      cells.push(cell({ x: cx, y: y + hdrH + ri * rowH, w: colDef.width, h: rowH, fill: bg, stroke: THEME.line, label: String(val ?? "—"), fontSize: 10, fontColor: fc, align: colDef.align ?? "center", pad: colDef.align === "left" ? 8 : 4 }));
      cx += colDef.width;
    });
  });

  return cells.join("\n");
}

function metricCard(x, y, w, h, title, value, unit, accent = THEME.navy) {
  return [
    rect({ x, y, w, h, fill: "#FFFFFF", stroke: THEME.line, rounded: 1 }),
    rect({ x, y, w, h: 4, fill: accent, stroke: accent, rounded: 0 }),
    cell({ x: x + 8, y: y + 8, w: w - 16, h: 14, fill: "none", stroke: "none", label: title, fontSize: 8, fontStyle: 1, fontColor: THEME.muted, align: "center" }),
    cell({ x: x + 8, y: y + 24, w: w - 16, h: 30, fill: "none", stroke: "none", label: String(value), fontSize: 18, fontStyle: 1, fontColor: THEME.ink, align: "center" }),
    cell({ x: x + 8, y: y + h - 18, w: w - 16, h: 14, fill: "none", stroke: "none", label: String(unit), fontSize: 8, fontColor: accent, align: "center" }),
  ].join("\n");
}

function panel(x, y, w, h, title, accent = THEME.navy) {
  const headerH = 26;
  return [
    rect({ x, y, w, h, fill: "#FFFFFF", stroke: THEME.line, rounded: 1 }),
    rect({ x, y, w, h: headerH, fill: accent, stroke: accent, rounded: 1 }),
    cell({ x: x + 10, y: y + 4, w: w - 20, h: 18, fill: "none", stroke: "none", label: title, fontSize: 9, fontStyle: 1, fontColor: "#FFFFFF", align: "left" }),
  ].join("\n");
}

function legendPair(x, y, labelA, labelB, colorA, colorB) {
  return [
    rect({ x, y, w: 12, h: 12, fill: colorA, stroke: colorA, rounded: 1 }),
    cell({ x: x + 16, y: y - 2, w: 80, h: 16, fill: "none", stroke: "none", label: labelA, fontSize: 8, fontColor: THEME.muted, align: "left" }),
    rect({ x: x + 88, y, w: 12, h: 12, fill: colorB, stroke: colorB, rounded: 1 }),
    cell({ x: x + 104, y: y - 2, w: 80, h: 16, fill: "none", stroke: "none", label: labelB, fontSize: 8, fontColor: THEME.muted, align: "left" }),
  ].join("\n");
}

function barPairList({ x, y, w, labelWidth = 240, rowH = 42, barH = 10,
                      rows, maxValue, baselineColor = THEME.baseline,
                      scenarioColor = THEME.scenario, valueFormatter = fmtNum }) {
  const valueWidth = 100;
  const barX = x + labelWidth + 12;
  const barW = Math.max(40, w - labelWidth - valueWidth - 20);
  const max = maxValue > 0 ? maxValue : 1;
  const cells = [];

  rows.forEach((row, i) => {
    const rowY = y + i * rowH;
    const baseVal = num(row.baseline);
    const scenVal = num(row.scenario);
    const baseW = Math.max(4, (Math.abs(baseVal) / max) * barW);
    const scenW = Math.max(4, (Math.abs(scenVal) / max) * barW);

    cells.push(cell({ x, y: rowY + 4, w: labelWidth, h: rowH - 8, fill: "none", stroke: "none", label: row.label, fontSize: 9, fontColor: THEME.ink, align: "left" }));
    cells.push(rect({ x: barX, y: rowY + 6, w: barW, h: barH, fill: THEME.track, stroke: "none", rounded: 1 }));
    cells.push(rect({ x: barX, y: rowY + 22, w: barW, h: barH, fill: THEME.track, stroke: "none", rounded: 1 }));
    cells.push(rect({ x: barX, y: rowY + 6, w: baseW, h: barH, fill: baselineColor, stroke: "none", rounded: 1 }));
    cells.push(rect({ x: barX, y: rowY + 22, w: scenW, h: barH, fill: scenarioColor, stroke: "none", rounded: 1 }));
    cells.push(cell({ x: barX + barW + 6, y: rowY + 2, w: valueWidth, h: 16, fill: "none", stroke: "none", label: `B: ${valueFormatter(baseVal)}`, fontSize: 8, fontColor: baselineColor, align: "left" }));
    cells.push(cell({ x: barX + barW + 6, y: rowY + 20, w: valueWidth, h: 16, fill: "none", stroke: "none", label: `S: ${valueFormatter(scenVal)}`, fontSize: 8, fontColor: scenarioColor, align: "left" }));
  });

  return cells.join("\n");
}

function barPairListWithDelta({
  x,
  y,
  w,
  labelWidth = 240,
  rowH = 42,
  barH = 10,
  rows,
  maxValue,
  baselineColor = THEME.baseline,
  scenarioColor = THEME.scenario,
  valueFormatter = fmtNum,
  deltaFormatter = fmtNum,
}) {
  const valueWidth = 96;
  const deltaWidth = 100;
  const barX = x + labelWidth + 12;
  const barW = Math.max(40, w - labelWidth - valueWidth - deltaWidth - 28);
  const deltaX = barX + barW + valueWidth + 10;
  const max = maxValue > 0 ? maxValue : 1;
  const cells = [];

  rows.forEach((row, i) => {
    const rowY = y + i * rowH;
    const baseVal = num(row.baseline);
    const scenVal = num(row.scenario);
    const deltaVal = num(row.delta ?? scenVal - baseVal);
    const baseW = Math.max(4, (Math.abs(baseVal) / max) * barW);
    const scenW = Math.max(4, (Math.abs(scenVal) / max) * barW);

    cells.push(cell({ x, y: rowY + 4, w: labelWidth, h: rowH - 8, fill: "none", stroke: "none", label: row.label, fontSize: 9, fontColor: THEME.ink, align: "left" }));
    cells.push(rect({ x: barX, y: rowY + 6, w: barW, h: barH, fill: THEME.track, stroke: "none", rounded: 1 }));
    cells.push(rect({ x: barX, y: rowY + 22, w: barW, h: barH, fill: THEME.track, stroke: "none", rounded: 1 }));
    cells.push(rect({ x: barX, y: rowY + 6, w: baseW, h: barH, fill: baselineColor, stroke: "none", rounded: 1 }));
    cells.push(rect({ x: barX, y: rowY + 22, w: scenW, h: barH, fill: scenarioColor, stroke: "none", rounded: 1 }));
    cells.push(cell({ x: barX + barW + 6, y: rowY + 2, w: valueWidth, h: 16, fill: "none", stroke: "none", label: `B: ${valueFormatter(baseVal)}`, fontSize: 8, fontColor: baselineColor, align: "left" }));
    cells.push(cell({ x: barX + barW + 6, y: rowY + 20, w: valueWidth, h: 16, fill: "none", stroke: "none", label: `S: ${valueFormatter(scenVal)}`, fontSize: 8, fontColor: scenarioColor, align: "left" }));
    cells.push(cell({ x: deltaX, y: rowY + 12, w: deltaWidth, h: 16, fill: "none", stroke: "none", label: `Δ ${deltaFormatter(deltaVal)}`, fontSize: 8, fontColor: deltaColor(deltaVal), align: "left" }));
  });

  return cells.join("\n");
}

function wrapDiagram(name, id, bodyXml, pageW = 1400, pageH = 850) {
  const bg = THEME.paper === "none" ? " background=\"none\"" : "";
  return `<?xml version="1.0" encoding="UTF-8"?>
<mxfile host="pypsa-eur-romania" version="24.7.5" type="device">
  <diagram name="${esc(name)}" id="${esc(id)}">
    <mxGraphModel dx="1422" dy="762" grid="0" gridSize="10" guides="0" tooltips="1"
                  connect="0" arrows="0" fold="0" page="0" pageScale="1"
                  pageWidth="${pageW}" pageHeight="${pageH}" math="0" shadow="0"${bg}>
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
  const pageW = 1400;
  const pageH = 520;
  const PAD = 20;
  const contentW = 1360;
  const panelY = 110;
  const panelW = 660;
  const panelH = 260;

  parts.push(backgroundRect(pageW, pageH));
  parts.push(banner(PAD, PAD, contentW, "SYSTEM COST &amp; ENERGY NOT SERVED", `Scenario: ${resultName}`));

  const crow = cost.rows[0] ?? {};
  const baseC = num(crow.baseline_total_system_cost_eur);
  const scenC = num(crow.scenario_total_system_cost_eur);
  const deltaEur = num(crow.delta_eur ?? (scenC - baseC));
  const deltaPct = num(crow.delta_percent ?? (baseC ? ((scenC - baseC) / baseC) * 100 : 0));
  const ratio = baseC ? (scenC / baseC) * 100 : 0;

  parts.push(panel(PAD, panelY, panelW, panelH, "COST COMPARISON"));
  parts.push(legendPair(PAD + 20, panelY + 34, "Baseline", "Scenario", THEME.baseline, THEME.scenario));
  parts.push(barPairList({
    x: PAD + 20,
    y: panelY + 50,
    w: panelW - 40,
    labelWidth: 210,
    rows: [{ label: "Total system cost", baseline: baseC, scenario: scenC }],
    maxValue: Math.max(Math.abs(baseC), Math.abs(scenC), 1),
    valueFormatter: (v) => fmtM(v),
  }));

  const cardY = panelY + 140;
  const cardW = 200;
  const cardGap = 12;
  parts.push(metricCard(PAD + 20, cardY, cardW, 90, "Delta (M EUR)", fmtM(deltaEur), "scenario - baseline", deltaColor(deltaEur)));
  parts.push(metricCard(PAD + 20 + cardW + cardGap, cardY, cardW, 90, "Delta (%)", fmtPct(deltaPct, 1), "percent change", deltaColor(deltaPct)));
  parts.push(metricCard(PAD + 20 + (cardW + cardGap) * 2, cardY, cardW, 90, "Scenario / Baseline", baseC ? fmtNum(ratio, 1) + "%" : "—", "relative size", THEME.navy));

  const ensBase = ens.rows.find((r) => r.case === "baseline") ?? {};
  const ensScen = ens.rows.find((r) => r.case === "scenario") ?? {};
  const ensBaseVal = num(ensBase.ens_mwh);
  const ensScenVal = num(ensScen.ens_mwh);
  const ensDelta = ensScenVal - ensBaseVal;

  const ensX = PAD + panelW + 20;
  parts.push(panel(ensX, panelY, panelW, panelH, "ENS SNAPSHOT"));
  parts.push(legendPair(ensX + 20, panelY + 34, "Baseline", "Scenario", THEME.baseline, THEME.scenario));
  parts.push(barPairList({
    x: ensX + 20,
    y: panelY + 50,
    w: panelW - 40,
    labelWidth: 180,
    rows: [{ label: "Energy not served", baseline: ensBaseVal, scenario: ensScenVal }],
    maxValue: Math.max(Math.abs(ensBaseVal), Math.abs(ensScenVal), 1),
    valueFormatter: (v) => fmtMwh(v),
  }));

  const ensCardW = 190;
  parts.push(metricCard(ensX + 20, cardY, ensCardW, 90, "Shedding hours", fmtNum(ensScen.hours_with_shedding ?? 0, 0), "scenario hours", THEME.scenario));
  parts.push(metricCard(ensX + 20 + ensCardW + cardGap, cardY, ensCardW, 90, "Max shedding", fmtNum(ensScen.max_shedding_mw ?? 0, 0) + " MW", "scenario peak", THEME.scenario));
  parts.push(metricCard(ensX + 20 + (ensCardW + cardGap) * 2, cardY, ensCardW, 90, "ENS delta", fmtMwh(ensDelta), "scenario - baseline", deltaColor(ensDelta)));

  return wrapDiagram("Cost & ENS", "cost-ens", parts.join("\n"), pageW, pageH);
}

// ── Diagram 2: Generation Mix ────────────────────────────────────────────────

function buildGenerationMix(mix, resultName) {
  _id = 400;
  const parts = [];
  const pageW = 1400;
  const PAD = 20;
  const contentW = 1360;
  const panelY = 110;
  const rowH = 44;

  const byCarrier = {};
  for (const row of mix.rows) {
    const c = row.carrier ?? "unknown";
    if (!byCarrier[c]) byCarrier[c] = { baseline: 0, scenario: 0 };
    byCarrier[c][row.case] = num(row.generation_mwh ?? 0);
  }

  const carriers = Object.entries(byCarrier)
    .sort((a, b) => (b[1].baseline + b[1].scenario) - (a[1].baseline + a[1].scenario))
    .slice(0, 10);

  const rows = carriers.map(([carrier, vals]) => ({
    label: carrier,
    baseline: vals.baseline,
    scenario: vals.scenario,
  }));

  if (rows.length === 0) {
    rows.push({ label: "No generation data", baseline: 0, scenario: 0 });
  }

  const maxValue = Math.max(
    ...rows.map((row) => Math.max(Math.abs(num(row.baseline)), Math.abs(num(row.scenario)))),
    1,
  );

  const panelH = 80 + rowH * rows.length + 30;
  const pageH = panelY + panelH + 20;

  parts.push(backgroundRect(pageW, pageH));
  parts.push(banner(PAD, PAD, contentW, "GENERATION MIX — Romania", `Scenario: ${resultName}`));
  parts.push(panel(PAD, panelY, contentW, panelH, "GENERATION MIX BY CARRIER"));
  parts.push(legendPair(PAD + 20, panelY + 34, "Baseline", "Scenario", THEME.baseline, THEME.scenario));
  parts.push(barPairList({
    x: PAD + 20,
    y: panelY + 50,
    w: contentW - 40,
    labelWidth: 260,
    rowH,
    rows,
    maxValue,
    valueFormatter: (v) => fmtMwh(v),
  }));

  return wrapDiagram("Generation Mix", "gen-mix", parts.join("\n"), pageW, pageH);
}

// ── Diagram 3: Price + Curtailment ───────────────────────────────────────────

function buildPriceCurtail(lmp, curtail, resultName) {
  _id = 600;
  const parts = [];
  const pageW = 1400;
  const PAD = 20;
  const contentW = 1360;
  const panelY = 110;
  const panelW = 660;
  const rowH = 44;

  const lmpBase = lmp.rows.find((r) => r.case === "baseline") ?? {};
  const lmpScen = lmp.rows.find((r) => r.case === "scenario") ?? {};
  const lmpRows = [
    {
      label: "Mean LMP",
      baseline: num(lmpBase.mean_eur_per_mwh ?? lmpBase.mean),
      scenario: num(lmpScen.mean_eur_per_mwh ?? lmpScen.mean),
    },
    {
      label: "P95 LMP",
      baseline: num(lmpBase.p95_eur_per_mwh ?? lmpBase.p95),
      scenario: num(lmpScen.p95_eur_per_mwh ?? lmpScen.p95),
    },
    {
      label: "Max LMP",
      baseline: num(lmpBase.max_eur_per_mwh ?? lmpBase.max),
      scenario: num(lmpScen.max_eur_per_mwh ?? lmpScen.max),
    },
  ];
  const lmpMax = Math.max(
    ...lmpRows.map((row) => Math.max(Math.abs(num(row.baseline)), Math.abs(num(row.scenario)))),
    1,
  );

  const byCarrier = {};
  for (const row of curtail.rows) {
    const c = row.carrier ?? "unknown";
    if (!byCarrier[c]) byCarrier[c] = { baseline: 0, scenario: 0 };
    byCarrier[c][row.case] = num(row.curtailment_mwh ?? 0);
  }
  const curtailRows = Object.entries(byCarrier)
    .sort((a, b) => (b[1].baseline + b[1].scenario) - (a[1].baseline + a[1].scenario))
    .slice(0, 8)
    .map(([carrier, vals]) => ({
      label: carrier,
      baseline: vals.baseline,
      scenario: vals.scenario,
    }));

  if (curtailRows.length === 0) {
    curtailRows.push({ label: "No curtailment data", baseline: 0, scenario: 0 });
  }

  const curtailMax = Math.max(
    ...curtailRows.map((row) => Math.max(Math.abs(num(row.baseline)), Math.abs(num(row.scenario)))),
    1,
  );

  const rowsCount = Math.max(lmpRows.length, curtailRows.length);
  const panelH = 80 + rowH * rowsCount + 30;
  const pageH = panelY + panelH + 20;

  parts.push(backgroundRect(pageW, pageH));
  parts.push(banner(PAD, PAD, contentW, "PRICE (LMP) &amp; CURTAILMENT", `Scenario: ${resultName}`));

  parts.push(panel(PAD, panelY, panelW, panelH, "PRICE SIGNALS (€/MWh)"));
  parts.push(legendPair(PAD + 20, panelY + 34, "Baseline", "Scenario", THEME.baseline, THEME.scenario));
  parts.push(barPairList({
    x: PAD + 20,
    y: panelY + 50,
    w: panelW - 40,
    labelWidth: 200,
    rowH,
    rows: lmpRows,
    maxValue: lmpMax,
    valueFormatter: (v) => fmtNum(v, 2),
  }));

  const curtailX = PAD + panelW + 20;
  parts.push(panel(curtailX, panelY, panelW, panelH, "CURTAILMENT BY CARRIER"));
  parts.push(legendPair(curtailX + 20, panelY + 34, "Baseline", "Scenario", THEME.baseline, THEME.scenario));
  parts.push(barPairList({
    x: curtailX + 20,
    y: panelY + 50,
    w: panelW - 40,
    labelWidth: 240,
    rowH,
    rows: curtailRows,
    maxValue: curtailMax,
    valueFormatter: (v) => fmtMwh(v),
  }));

  return wrapDiagram("Price & Curtailment", "price-curtail", parts.join("\n"), pageW, pageH);
}

// ── Diagram 4: Daily Net Imports ─────────────────────────────────────────────

function buildNetImports(imports, resultName) {
  _id = 700;
  const parts = [];
  const pageW = 1400;
  const PAD = 20;
  const contentW = 1360;
  const panelY = 110;
  const rowH = 42;

  const rowsAll = imports.rows.map((row) => ({
    label: String(row.local_day ?? row.day ?? row.date ?? "—"),
    baseline: num(row.baseline_mwh ?? 0),
    scenario: num(row.scenario_mwh ?? 0),
    delta: num(row.delta_mwh ?? 0),
  }));

  let rows = rowsAll;
  let subtitle = "Daily net imports (MWh)";
  if (rowsAll.length > 14) {
    rows = [...rowsAll]
      .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
      .slice(0, 14)
      .sort((a, b) => a.label.localeCompare(b.label));
    subtitle = "Top 14 delta days (MWh)";
  }

  if (rows.length === 0) {
    rows = [{ label: "No net import data", baseline: 0, scenario: 0, delta: 0 }];
  }

  const maxValue = Math.max(
    ...rows.map((row) => Math.max(Math.abs(num(row.baseline)), Math.abs(num(row.scenario)))),
    1,
  );

  const panelH = 80 + rowH * rows.length + 30;
  const pageH = panelY + panelH + 20;

  parts.push(backgroundRect(pageW, pageH));
  parts.push(banner(PAD, PAD, contentW, "DAILY NET IMPORTS — Romania", `Scenario: ${resultName}`));
  parts.push(panel(PAD, panelY, contentW, panelH, subtitle));
  parts.push(legendPair(PAD + 20, panelY + 34, "Baseline", "Scenario", THEME.baseline, THEME.scenario));
  parts.push(barPairListWithDelta({
    x: PAD + 20,
    y: panelY + 50,
    w: contentW - 40,
    labelWidth: 200,
    rowH,
    rows,
    maxValue,
    valueFormatter: (v) => fmtSignedMwh(v),
    deltaFormatter: (v) => fmtSignedMwh(v),
  }));

  return wrapDiagram("Daily Net Imports", "net-imports", parts.join("\n"), pageW, pageH);
}

// ── Diagram 5: Interconnectors ───────────────────────────────────────────────

function buildInterconnectors(flows, resultName) {
  _id = 800;
  const parts = [];
  const pageW = 1400;
  const PAD = 20;
  const contentW = 1360;
  const panelY = 110;
  const panelW = 660;
  const rowH = 44;

  const byAsset = {};
  for (const row of flows.rows) {
    const key = row.asset ?? "unknown";
    if (!byAsset[key]) byAsset[key] = { component: row.component ?? "", baseline: null, scenario: null };
    byAsset[key][row.case] = row;
  }

  const assets = Object.entries(byAsset)
    .map(([asset, data]) => ({
      asset,
      data,
      scenarioLoad: num(data.scenario?.mean_loading ?? 0),
    }))
    .sort((a, b) => b.scenarioLoad - a.scenarioLoad)
    .slice(0, 8);

  const rowsLoading = assets.map(({ asset, data }) => ({
    label: asset,
    baseline: num(data.baseline?.mean_loading ?? 0) * 100,
    scenario: num(data.scenario?.mean_loading ?? 0) * 100,
  }));

  const rowsCongested = assets.map(({ asset, data }) => ({
    label: asset,
    baseline: num(data.baseline?.congested_hours ?? 0),
    scenario: num(data.scenario?.congested_hours ?? 0),
  }));

  if (rowsLoading.length === 0) {
    rowsLoading.push({ label: "No interconnector data", baseline: 0, scenario: 0 });
    rowsCongested.push({ label: "No interconnector data", baseline: 0, scenario: 0 });
  }

  const loadMax = Math.max(
    ...rowsLoading.map((row) => Math.max(Math.abs(num(row.baseline)), Math.abs(num(row.scenario)))),
    1,
  );
  const congMax = Math.max(
    ...rowsCongested.map((row) => Math.max(Math.abs(num(row.baseline)), Math.abs(num(row.scenario)))),
    1,
  );

  const rowsCount = Math.max(rowsLoading.length, rowsCongested.length);
  const panelH = 80 + rowH * rowsCount + 30;
  const pageH = panelY + panelH + 20;

  parts.push(backgroundRect(pageW, pageH));
  parts.push(banner(PAD, PAD, contentW, "INTERCONNECTOR LOADING — Border Assets", `Scenario: ${resultName}`));

  parts.push(panel(PAD, panelY, panelW, panelH, "MEAN LOADING (%)"));
  parts.push(legendPair(PAD + 20, panelY + 34, "Baseline", "Scenario", THEME.baseline, THEME.scenario));
  parts.push(barPairList({
    x: PAD + 20,
    y: panelY + 50,
    w: panelW - 40,
    labelWidth: 220,
    rowH,
    rows: rowsLoading,
    maxValue: loadMax,
    valueFormatter: (v) => fmtNum(v, 1) + "%",
  }));

  const congX = PAD + panelW + 20;
  parts.push(panel(congX, panelY, panelW, panelH, "CONGESTED HOURS"));
  parts.push(legendPair(congX + 20, panelY + 34, "Baseline", "Scenario", THEME.baseline, THEME.scenario));
  parts.push(barPairList({
    x: congX + 20,
    y: panelY + 50,
    w: panelW - 40,
    labelWidth: 220,
    rowH,
    rows: rowsCongested,
    maxValue: congMax,
    valueFormatter: (v) => fmtNum(v, 0) + " h",
  }));

  return wrapDiagram("Interconnectors", "interconnectors", parts.join("\n"), pageW, pageH);
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

function exportSvg(drawioPath, svgPath) {
  console.log(`  Exporting ${path.basename(drawioPath)} → ${path.basename(svgPath)}`);
  const result = spawnSync(
    DRAWIO_EXE,
    ["--export", "--format", "svg", "--border", "8", "--output", svgPath, drawioPath],
    { encoding: "utf-8", timeout: 30_000 }
  );
  if (result.status !== 0) {
    console.warn(`  draw.io export warning (exit ${result.status}): ${result.stderr || result.error?.message || "unknown"}`);
    return false;
  }
  return true;
}

function buildDiagrams(resultName, data) {
  return [
    { name: "diagram_cost_ens",        xml: buildCostEns(data.cost, data.ens, resultName) },
    { name: "diagram_generation_mix", xml: buildGenerationMix(data.mix, resultName) },
    { name: "diagram_price_curtail",  xml: buildPriceCurtail(data.lmp, data.curtail, resultName) },
    { name: "diagram_net_imports",    xml: buildNetImports(data.imports, resultName) },
    { name: "diagram_interconnectors",xml: buildInterconnectors(data.flows, resultName) },
  ];
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const resultName = args.find((arg) => !arg.startsWith("--"));
  const svgEnabled = args.includes("--svg") || args.includes("--svg-only");
  const svgOnly = args.includes("--svg-only");

  if (!resultName) {
    console.error("Usage: node generate-diagrams.mjs <result-name> [--svg] [--svg-only]");
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
  const [cost, ens, mix, lmp, curtail, imports, flows] = await Promise.all([
    loadCsv(path.join(resultDir, "system_cost_comparison.csv")),
    loadCsv(path.join(resultDir, "ens_summary.csv")),
    loadCsv(path.join(resultDir, "generation_mix_mwh.csv")),
    loadCsv(path.join(resultDir, "lmp_summary_ro.csv")),
    loadCsv(path.join(resultDir, "curtailment_mwh.csv")),
    loadCsv(path.join(resultDir, "daily_net_imports_mwh.csv")),
    loadCsv(path.join(resultDir, "interconnector_flow_congestion.csv")),
  ]);

  const data = { cost, ens, mix, lmp, curtail, imports, flows };

  if (!svgOnly) {
    THEME = THEME_DEFAULT;
    const diagrams = buildDiagrams(resultName, data);
    for (const { name, xml } of diagrams) {
      const drawioPath = path.join(resultDir, `${name}.drawio`);
      const pngPath    = path.join(resultDir, `${name}.png`);

      console.log(`  Writing ${name}.drawio`);
      await fs.writeFile(drawioPath, xml, "utf-8");
      exportPng(drawioPath, pngPath);
    }
  }

  if (svgEnabled) {
    THEME = THEME_SVG_LIGHT;
    const diagrams = buildDiagrams(resultName, data);
    for (const { name, xml } of diagrams) {
      const tempDrawioPath = path.join(resultDir, `${name}.svg.drawio`);
      const svgPath        = path.join(resultDir, `${name}.svg`);

      console.log(`  Writing ${path.basename(tempDrawioPath)}`);
      await fs.writeFile(tempDrawioPath, xml, "utf-8");
      exportSvg(tempDrawioPath, svgPath);
      await fs.unlink(tempDrawioPath).catch(() => {});
    }
  }

  console.log("Done.");
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
