#!/usr/bin/env node
// Builds the "Colours I've named" palette card for the GitHub profile README.
//
// Reads profile/colours.json (hand-maintained: name, hex, PR url; array order
// is the grid order, left to right then top to bottom) and writes:
//   profile/colours.svg   a square grid of solid colour blocks, text on top
// and regenerates the block between the palette markers in README.md.
//
// A local tool: edit profile/colours.json, run
//   node scripts/build-palette.mjs
// then review, commit and push the output yourself. No network, no token.
// Plain Node, no dependencies.

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const SOURCE_URL = "https://github.com/meodai/color-names";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = join(ROOT, "profile");
const DATA = join(OUT_DIR, "colours.json");
const OUT_SVG = join(OUT_DIR, "colours.svg");
const README = join(ROOT, "README.md");
const MARK_START = "<!-- palette:start -->";
const MARK_END = "<!-- palette:end -->";

const SANS = `system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`;
const LIGHT_TEXT = "#ffffff";
const DARK_TEXT = "#111111";

const L = {
  tile: 250, // square block edge
  pad: 12, // min space between text and block edge
  nameSize: 20,
  nameLine: 24,
  hexSize: 14,
  hexGap: 8, // space between name and hex
};

const log = (...a) => console.log("[palette]", ...a);
const rel = (p) => relative(ROOT, p).split("\\").join("/");

// ------------------------------------------------------------------- loading

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
  String(s).replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]);

function luminance(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function contrast(a, b) {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}
// White or near-black text, whichever reads better on the swatch.
function textOn(hex) {
  const w = contrast(hex, LIGHT_TEXT);
  const d = contrast(hex, DARK_TEXT);
  const pick = w >= d ? LIGHT_TEXT : DARK_TEXT;
  log(`  text on ${hex}: ${pick} (white ${w.toFixed(2)}:1, dark ${d.toFixed(2)}:1)`);
  return pick;
}

// SVG in <img> can't measure text, so estimate (bold sans ~0.56em per char).
const maxChars = (px, size) => Math.floor(px / (size * 0.56));

// One line if it fits, else split at the space nearest the middle.
function nameLines(name) {
  const max = maxChars(L.tile - L.pad * 2, L.nameSize);
  if (name.length <= max) return [name];
  const spaces = [...name.matchAll(/ /g)].map((m) => m.index);
  if (spaces.length === 0) {
    log(`  WARNING: "${name}" is too long and has no space to wrap at, truncating`);
    return [name.slice(0, max - 1) + "…"];
  }
  const mid = name.length / 2;
  const at = spaces.reduce((best, s) => (Math.abs(s - mid) < Math.abs(best - mid) ? s : best));
  const lines = [name.slice(0, at), name.slice(at + 1)];
  return lines.map((ln) => {
    if (ln.length <= max) return ln;
    log(`  WARNING: line "${ln}" of "${name}" is too long even when wrapped, truncating`);
    return ln.slice(0, max - 1).trimEnd() + "…";
  });
}

function renderSvg(colours) {
  const cols = Math.ceil(Math.sqrt(colours.length));
  const rows = Math.ceil(colours.length / cols);
  const W = cols * L.tile;
  const H = rows * L.tile;
  log(`grid ${cols} x ${rows}, ${W} x ${H}px`);

  const blocks = colours.map((c, i) => {
    const x = (i % cols) * L.tile;
    const y = Math.floor(i / cols) * L.tile;
    const ink = textOn(c.hex);
    const lines = nameLines(c.name);
    // Vertically centre [name lines + gap + hex] in the block.
    const total = lines.length * L.nameLine + L.hexGap + L.hexSize;
    const top = y + (L.tile - total) / 2;
    const cx = x + L.tile / 2;
    const out = [`  <rect x="${x}" y="${y}" width="${L.tile}" height="${L.tile}" fill="${c.hex}"/>`];
    lines.forEach((ln, k) => {
      const baseline = Math.round(top + k * L.nameLine + L.nameSize);
      out.push(`  <text x="${cx}" y="${baseline}" text-anchor="middle" font-family="${SANS}" font-size="${L.nameSize}" font-weight="700" fill="${ink}">${esc(ln)}</text>`);
    });
    const hexBase = Math.round(top + lines.length * L.nameLine + L.hexGap + L.hexSize - 2);
    out.push(`  <text x="${cx}" y="${hexBase}" text-anchor="middle" font-family="${SANS}" font-size="${L.hexSize}" fill="${ink}">${esc(c.hex)}</text>`);
    return out.join("\n");
  });

  const label = `Colours I've named: ${colours.map((c) => `${c.name} ${c.hex}`).join(", ")}`;
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="t">`,
    `  <title id="t">${esc(label)}</title>`,
    `  <!-- generated by scripts/build-palette.mjs; do not edit by hand -->`,
    ...blocks,
    `</svg>`,
    ``,
  ].join("\n");
}

// -------------------------------------------------------------------- README

// "Alien Conspiracy Pink ([#234](url)) · Berlin Pink, Teal Beak, ... ([#262](url))"
// Groups colours by PR in order of first appearance; names sorted within a PR.
function prLine(colours) {
  const groups = new Map();
  for (const c of colours) {
    if (!groups.has(c.pr)) groups.set(c.pr, { url: c.prUrl, names: [] });
    groups.get(c.pr).names.push(c.name);
  }
  return [...groups]
    .map(([pr, g]) => `${g.names.sort((a, b) => a.localeCompare(b)).join(", ")} ([#${pr}](${g.url}))`)
    .join(" · ");
}

function readmeBlock(colours, eol) {
  const alt = esc(`Colours I've named: ${colours.map((c) => `${c.name} ${c.hex}`).join(", ")}`);
  return [
    MARK_START,
    `<a href="${SOURCE_URL}"><img src="${rel(OUT_SVG)}" width="${L.tile * Math.ceil(Math.sqrt(colours.length))}" alt="${alt}"></a>`,
    ``,
    prLine(colours),
    MARK_END,
  ].join(eol);
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
    log(`wrote README.md (palette block, ${colours.length} colours)`);
  }
}

// ---------------------------------------------------------------------- main

async function main() {
  const colours = await loadColours();
  log(`${colours.length} colour(s)`);

  await mkdir(OUT_DIR, { recursive: true });
  const content = renderSvg(colours);
  await writeFile(OUT_SVG, content, "utf8");
  log(`wrote ${rel(OUT_SVG)} (${Buffer.byteLength(content)} bytes)`);

  await updateReadme(colours);
  log("done");
}

main().catch((err) => {
  console.error(`[palette] ERROR: ${err.stack || err}`);
  process.exit(1);
});
