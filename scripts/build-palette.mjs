#!/usr/bin/env node
// Builds the "Colours I've named" palette card for the GitHub profile README.
//
// Reads profile/colours.json (hand-maintained: name, hex, PR url) and writes:
//   profile/colours-dark.svg, profile/colours-light.svg
// and regenerates the block between the palette markers in README.md.
//
// A local tool: add a colour to profile/colours.json, run
//   node scripts/build-palette.mjs
// then review, commit and push the output yourself. No network, no token.
// Plain Node, no dependencies.

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const SOURCE = "meodai/color-names";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = join(ROOT, "profile");
const DATA = join(OUT_DIR, "colours.json");
const README = join(ROOT, "README.md");
const MARK_START = "<!-- palette:start -->";
const MARK_END = "<!-- palette:end -->";

const THEMES = {
  dark: {
    ground: "#050505",
    panel: "#111111",
    border: "rgba(236,153,185,0.15)",
    heading: "#f8f8f8",
    secondary: "#d6c8cf",
    accent: "#ec99b9",
  },
  light: {
    ground: "#f7f3f5",
    panel: "#ffffff",
    border: "rgba(160,60,100,0.18)",
    heading: "#151114",
    secondary: "#5c4c55",
    accent: "#a83d68",
  },
};

const SANS = `system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`;
const MONO = `ui-monospace, SFMono-Regular, 'Cascadia Mono', Consolas, 'Liberation Mono', Menlo, monospace`;

const log = (...a) => console.log("[palette]", ...a);

// ------------------------------------------------------------------- loading

const rel = (p) => relative(ROOT, p).split("\\").join("/");

async function loadColours() {
  log(`reading ${rel(DATA)}`);
  const raw = await readFile(DATA, "utf8");
  let list;
  try {
    list = JSON.parse(raw);
  } catch (err) {
    throw new Error(`${DATA} is not valid JSON: ${err.message}`);
  }
  if (!Array.isArray(list) || list.length === 0) throw new Error(`${DATA} must be a non-empty JSON array.`);
  const seen = new Set();
  return list.map((c, i) => {
    const where = `colours.json[${i}]`;
    if (typeof c.name !== "string" || !c.name.trim()) throw new Error(`${where}: missing "name"`);
    if (typeof c.hex !== "string" || !/^#[0-9a-fA-F]{6}$/.test(c.hex)) throw new Error(`${where} (${c.name}): "hex" must look like #rrggbb, got ${JSON.stringify(c.hex)}`);
    const m = typeof c.url === "string" && /\/pull\/(\d+)\/?$/.exec(c.url);
    if (!m) throw new Error(`${where} (${c.name}): "url" must be a pull request URL ending in /pull/<number>, got ${JSON.stringify(c.url)}`);
    const key = c.name.trim().toLowerCase();
    if (seen.has(key)) throw new Error(`${where}: duplicate colour name "${c.name}"`);
    seen.add(key);
    const out = { name: c.name.trim(), hex: c.hex.toLowerCase(), pr: Number(m[1]), prUrl: c.url };
    log(`  colour ${out.name} ${out.hex} (PR #${out.pr}) ${out.prUrl}`);
    return out;
  });
}

// ------------------------------------------------------------------ SVG card

const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

function luminance(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
const contrast = (a, b) => {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

// SVG in <img> can't measure text, so truncate by a conservative estimate.
function fit(text, px, fontSize) {
  const max = Math.floor(px / (fontSize * 0.58));
  return text.length <= max ? text : text.slice(0, max - 1).trimEnd() + "…";
}

const L = {
  margin: 8, // ground visible around the panel
  pad: 24,
  tileW: 192,
  gap: 16,
  swatchH: 88,
  tileH: 88 + 46,
  titleH: 44,
  footerH: 36,
  maxCols: 4,
};

function renderSvg(colours, theme, variant) {
  const n = colours.length;
  const cols = Math.max(1, Math.min(L.maxCols, n));
  const rows = Math.max(1, Math.ceil(n / cols));
  const panelW = L.pad * 2 + cols * L.tileW + (cols - 1) * L.gap;
  const gridH = rows * L.tileH + (rows - 1) * L.gap;
  const panelH = L.pad + L.titleH + gridH + L.footerH;
  const W = panelW + L.margin * 2;
  const H = panelH + L.margin * 2;
  const x0 = L.margin + L.pad;
  const y0 = L.margin + L.pad + L.titleH;

  const tiles = colours.map((c, i) => {
    const x = x0 + (i % cols) * (L.tileW + L.gap);
    const y = y0 + Math.floor(i / cols) * (L.tileH + L.gap);
    const needsEdge = contrast(c.hex, theme.panel) < 1.6;
    const edge = needsEdge ? ` stroke="${theme.border}" stroke-width="1"` : "";
    const prLabel = `#${c.pr}`;
    return [
      `  <g>`,
      `    <title>${esc(`${c.name} ${c.hex} (PR #${c.pr})`)}</title>`,
      `    <rect x="${x + 0.5}" y="${y + 0.5}" width="${L.tileW - 1}" height="${L.swatchH - 1}" rx="8" fill="${c.hex}"${edge}/>`,
      `    <text x="${x}" y="${y + L.swatchH + 22}" font-family="${SANS}" font-size="14" font-weight="600" fill="${theme.heading}">${esc(fit(c.name, L.tileW, 14))}</text>`,
      `    <text x="${x}" y="${y + L.swatchH + 41}" font-family="${MONO}" font-size="12" fill="${theme.secondary}">${esc(c.hex)}</text>`,
      `    <text x="${x + L.tileW}" y="${y + L.swatchH + 41}" text-anchor="end" font-family="${MONO}" font-size="11" fill="${theme.accent}">${esc(prLabel)}</text>`,
      `  </g>`,
    ].join("\n");
  });

  const label = `Colours I've named: ${colours.map((c) => `${c.name} ${c.hex}`).join(", ")}`;
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="t">`,
    `  <title id="t">${esc(label)}</title>`,
    `  <!-- generated by scripts/build-palette.mjs (${variant}); do not edit by hand -->`,
    `  <rect width="${W}" height="${H}" rx="12" fill="${theme.ground}"/>`,
    `  <rect x="${L.margin + 0.5}" y="${L.margin + 0.5}" width="${panelW - 1}" height="${panelH - 1}" rx="8" fill="${theme.panel}" stroke="${theme.border}" stroke-width="1"/>`,
    `  <text x="${x0}" y="${L.margin + L.pad + 20}" font-family="${SANS}" font-size="20" font-weight="600" fill="${theme.heading}">Colours I&#39;ve named</text>`,
    ...tiles,
    `  <text x="${x0}" y="${L.margin + panelH - 16}" font-family="${SANS}" font-size="11" fill="${theme.secondary}">from ${esc(SOURCE)}</text>`,
    `</svg>`,
    ``,
  ].join("\n");
}

// -------------------------------------------------------------------- README

function readmeBlock(colours, eol) {
  const alt = esc(`Colours I've named: ${colours.map((c) => `${c.name} ${c.hex}`).join(", ")}`);
  const lines = [
    MARK_START,
    `<picture>`,
    `  <source media="(prefers-color-scheme: dark)" srcset="profile/colours-dark.svg">`,
    `  <source media="(prefers-color-scheme: light)" srcset="profile/colours-light.svg">`,
    `  <img src="profile/colours-dark.svg" alt="${alt}">`,
    `</picture>`,
    ``,
    `| Colour | Hex | PR |`,
    `|---|---|---|`,
    ...colours.map((c) => `| ${c.name.replace(/\|/g, "\\|")} | \`${c.hex}\` | [#${c.pr}](${c.prUrl}) |`),
    MARK_END,
  ];
  return lines.join(eol);
}

async function updateReadme(colours) {
  const src = await readFile(README, "utf8");
  const starts = src.split(MARK_START).length - 1;
  const ends = src.split(MARK_END).length - 1;
  if (starts !== 1 || ends !== 1) {
    throw new Error(`README.md must contain exactly one "${MARK_START}" and one "${MARK_END}" (found ${starts} and ${ends}).`);
  }
  const i = src.indexOf(MARK_START);
  const j = src.indexOf(MARK_END) + MARK_END.length;
  if (j < i) throw new Error("README.md palette end marker comes before the start marker.");
  const eol = src.includes("\r\n") ? "\r\n" : "\n";
  const next = src.slice(0, i) + readmeBlock(colours, eol) + src.slice(j);
  if (next === src) {
    log(`README.md unchanged`);
  } else {
    await writeFile(README, next, "utf8");
    log(`wrote README.md (palette block, ${colours.length} rows)`);
  }
}

// ---------------------------------------------------------------------- main

async function main() {
  const colours = await loadColours();
  log(`${colours.length} colour(s)`);

  await mkdir(OUT_DIR, { recursive: true });
  for (const [file, theme] of [["colours-dark.svg", "dark"], ["colours-light.svg", "light"]]) {
    const content = renderSvg(colours, THEMES[theme], theme);
    const path = join(OUT_DIR, file);
    await writeFile(path, content, "utf8");
    log(`wrote ${rel(path)} (${Buffer.byteLength(content)} bytes)`);
  }
  await updateReadme(colours);
  log("done");
}

main().catch((err) => {
  console.error(`[palette] ERROR: ${err.stack || err}`);
  process.exit(1);
});
