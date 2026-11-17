#!/usr/bin/env node
// Proves the maths of the one-hour polyrhythm clock (website /polyrhythm/clock/ and the stream page) by running the page's real <script> in node against a fake canvas
// (which applies the page's own translate/rotate, so "top" means the top of the screen) and a fake AudioContext.
// Based on polyrhythmic-world-clock tests/ring_sync.js (archived 2026-11-16, commit 54de416 there).
//
//   node tests/clock_math.js [page.html] [--query=?stream&offset=7.5&lookahead=5] [--control=old-21-ring-clock.html]
//
// Default page: page/index.html (stream repo) or polyrhythm/clock/index.html (website repo).
// --query runs the page with URL parameters (stream mode, offset, lookahead); times are compared in the page's own
// time (real + offset). --control also runs the earlier 21-ring clock, which DOES repeat at 30 min.
//
// Checks:
//   1. every ring strikes only at the top: one fixed marker per ring at the top, one gap per ring at the top,
//      notes match top crossings one to one, and the bottom crossings (the dot does pass there) are silent
//   2. every strike's sound is within 1 ms of its visual impact, with that ring's pitch
//   3. all rings strike together exactly on the hour (scheduler maths exact; sound and picture within 1 ms)
//   4. the sound pattern does NOT repeat at 30 minutes (0-30 vs 30-60)
//   5. the full sound pattern repeats at exactly 60 minutes (hour 1 vs hour 2)
//   plus: turn counts, strikes per hour, pitch layout (chain of fifths, 3.5 octaves, inner highest), pink rule,
//   geometry against the earlier 21-ring page's constants, and (optional) a control run of that page.
//
// Exits non-zero on any failure.
"use strict";
const fs = require("fs");
const path = require("path");

const HOUR = 3600 * 1000;
const FRAME_MS = 250;   // drawing sample step; impacts are interpolated (the dot's angle is linear in time)
const TOL_MS = 1;       // allowed |sound - impact|
const W = 1920, H = 1080;

function extractScript(html) {
  const m = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)];
  if (!m.length) throw new Error("no inline script");
  return m.map(x => x[1]).join("\n");
}

// Loads a page with a fake clock starting at startIso. Returns hooks to advance time and sample frames.
function load(file, startIso, query = "") {
  const code = extractScript(fs.readFileSync(file, "utf8"));
  let fake = Date.parse(startIso);
  const RealDate = Date;
  class FakeDate extends RealDate {
    constructor(...a) { if (a.length) super(...a); else super(fake); }
    static now() { return fake; }
  }

  // ---- fake canvas with a transform: records circles (fills) and arcs (strokes) in screen coordinates ----
  let m = [1, 0, 0, 1, 0, 0], rot = 0, frame = null, lineWidth = 0;
  const apply = (x, y) => [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]];
  let pending = null;
  const pen = new Proxy({}, {
    get(t, k) {
      if (k === "setTransform") return (a, b, c, d, e, f) => { m = [a, b, c, d, e, f]; rot = Math.atan2(b, a); };
      if (k === "translate") return (x, y) => { m = [m[0], m[1], m[2], m[3], m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]]; };
      if (k === "rotate") return a => { const c = Math.cos(a), s = Math.sin(a); m = [m[0] * c + m[2] * s, m[1] * c + m[3] * s, -m[0] * s + m[2] * c, -m[1] * s + m[3] * c, m[4], m[5]]; rot += a; };
      if (k === "beginPath") return () => { pending = null; };
      if (k === "arc") return (x, y, r, a0, a1) => { const [sx, sy] = apply(x, y); pending = { x: sx, y: sy, r, a0: a0 + rot, a1: a1 + rot }; };
      if (k === "fill") return () => { if (frame && pending) frame.fills.push(pending); };
      if (k === "stroke") return () => { if (frame && pending) frame.strokes.push({ ...pending, lineWidth: t.lineWidth }); };
      if (k in t) return t[k];
      return () => {};
    },
    set(t, k, v) { t[k] = v; return true; }
  });
  const el = () => ({ dataset: {}, classList: { add() {} }, textContent: "", style: {}, addEventListener() {} });
  const paper = Object.assign(el(), { clientWidth: W, clientHeight: H, height: 0, getContext: () => pen });
  Object.defineProperty(paper, "width", { get: () => W, set: () => { m = [1, 0, 0, 1, 0, 0]; rot = 0; } }); // resets state like a real canvas
  const document = { getElementById: id => (id === "paper" ? paper : el()), querySelector: () => el(), addEventListener() {}, body: el(), hidden: false };

  // ---- fake audio: records every oscillator start ----
  const starts = [];
  let ctxEpoch = null;
  class FakeAudioContext {
    constructor() { ctxEpoch = fake; this.state = "running"; this.destination = {}; }
    get currentTime() { return (fake - ctxEpoch) / 1000; }
    resume() { return Promise.resolve(); }
    createGain() { const p = { value: 0, setValueAtTime() {}, linearRampToValueAtTime() {}, exponentialRampToValueAtTime() {} }; return { gain: p, connect() {}, disconnect() {} }; }
    createDynamicsCompressor() { const p = () => ({ value: 0 }); return { threshold: p(), knee: p(), ratio: p(), attack: p(), release: p(), connect() {}, disconnect() {} }; }
    createOscillator() {
      const o = { type: "", frequency: { value: 0 }, connect() {}, stop() {}, start: when => starts.push({ when, freq: o.frequency.value }) };
      return o;
    }
  }

  const timers = [];
  const setInterval = (fn, ms) => { timers.push({ fn, ms, next: fake + ms }); return timers.length; };
  const window = { AudioContext: FakeAudioContext };
  const opt = n => `typeof ${n} !== "undefined" ? ${n} : undefined`;
  const exportsSrc = `\n;return { draw, arcs: () => arcs, settings, ringNote, handleSoundToggle, colors, PARTIALS, LYDIAN,
    BASE_NOTE, OCTAVE_SHIFT, SHIFT_PINK, TOP_TURNS: ${opt("TOP_TURNS")}, strikeTime: ${opt("strikeTime")} };`;
  const factory = new Function("Date", "document", "window", "location", "navigator", "setInterval",
    "requestAnimationFrame", "URLSearchParams", "Intl", code + exportsSrc);
  const page = factory(FakeDate, document, window, { search: query }, {}, setInterval, () => 0, URLSearchParams, Intl);
  // Pages with ?offset=<s> run ahead of real time; every time below is in the page's own time (real + offset)
  const offsetMs = (parseFloat(new URLSearchParams(query).get("offset")) || 0) * 1000;
  if (!page.settings.soundEnabled) page.handleSoundToggle(true);

  return {
    page,
    now: () => fake + offsetMs,
    advance: ms => { fake += ms; timers.forEach(tm => { while (tm.next <= fake) { tm.fn(); tm.next += tm.ms; } }); },
    sample: () => { frame = { fills: [], strokes: [] }; page.draw(); const f = frame; frame = null; return f; },
    notes: () => {
      const n = page.PARTIALS.length, out = [];
      for (let i = 0; i < starts.length; i += n) out.push({ t: ctxEpoch + starts[i].when * 1000 + offsetMs, freq: starts[i].freq });
      return out;
    }
  };
}

// Runs a page for `hours` from startIso and collects impacts (top and bottom crossings of the moving dot) and notes.
function simulate(file, startIso, seconds, query = "") {
  const L = load(file, startIso, query);
  const nRings = L.page.arcs().length;
  const cx = W / 2, cy = H / 2;
  const TOP = -Math.PI / 2, BOTTOM = Math.PI / 2;     // screen angles (y grows downwards)
  const prev = new Array(nRings).fill(null);
  const top = Array.from({ length: nRings }, () => []), bottom = Array.from({ length: nRings }, () => []);
  let firstFrame = null;

  const crossings = (pa, a, target) => {       // multiples of 2*pi offset by target, in (pa, a]
    const out = [];
    for (let k = Math.floor((pa - target) / (2 * Math.PI)) + 1; target + 2 * Math.PI * k <= a; k++) out.push(target + 2 * Math.PI * k);
    return out;
  };
  const sampleFrame = () => {
    const f = L.sample();
    if (!firstFrame) firstFrame = f;
    const maxR = Math.max(...f.fills.map(d => d.r));
    const moving = f.fills.filter(d => d.r === maxR);
    if (moving.length !== nRings) throw new Error(`expected ${nRings} moving dots, got ${moving.length}`);
    const t = L.now();
    moving.forEach((d, i) => {
      let a = Math.atan2(d.y - cy, d.x - cx);
      if (prev[i]) {
        const pa = prev[i].a;
        while (a < pa - 1e-9) a += 2 * Math.PI;
        const at = x => prev[i].t + (x - pa) / (a - pa) * (t - prev[i].t);
        crossings(pa, a, TOP).forEach(x => top[i].push(at(x)));
        crossings(pa, a, BOTTOM).forEach(x => bottom[i].push(at(x)));
      }
      prev[i] = { a, t };
    });
  };

  const t0 = L.now(), end = t0 + seconds * 1000;
  sampleFrame();
  while (L.now() < end) { L.advance(FRAME_MS); sampleFrame(); }
  const arcs = L.page.arcs();
  return { file, L, page: L.page, t0, end, nRings, arcs, top, bottom, notes: L.notes(), firstFrame };
}

// ---------- checks ----------
const results = [];
const check = (name, ok, detail) => { results.push(ok); console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? "\n      " + detail : ""}`); };
const near = (a, b, tol) => Math.abs(a - b) <= tol;

// Pairs two time lists one to one (sorted); returns null if they match within tol, else a reason.
const pairUp = (A, B, tol) => {
  if (A.length !== B.length) return `${A.length} vs ${B.length}`;
  const a = [...A].sort((x, y) => x - y), b = [...B].sort((x, y) => x - y);
  let worst = 0;
  a.forEach((t, k) => { worst = Math.max(worst, Math.abs(t - b[k])); });
  return worst <= tol ? null : `worst offset ${worst.toFixed(6)} ms`;
};

// Multiset comparison of (pitch, time-in-window) between two windows. Returns how many notes of B have no partner in A.
const unmatched = (notesA, startA, notesB, startB, tol) => {
  const key = n => n.freq;
  const pool = new Map();
  notesA.forEach(n => { const k = key(n); if (!pool.has(k)) pool.set(k, []); pool.get(k).push(n.t - startA); });
  pool.forEach(v => v.sort((x, y) => x - y));
  let miss = 0;
  notesB.forEach(n => {
    const list = pool.get(key(n)) || [], rel = n.t - startB;
    const idx = list.findIndex(x => Math.abs(x - rel) <= tol);
    if (idx < 0) miss++; else list.splice(idx, 1);
  });
  return { miss, leftover: [...pool.values()].reduce((s, v) => s + v.length, 0) };
};
const inWin = (notes, s, e) => notes.filter(n => n.t >= s - 0.5 && n.t < e - 0.5);

function main() {
  const root = path.join(__dirname, "..");
  const args = process.argv.slice(2);
  const opt = name => (args.find(a => a.startsWith(`--${name}=`)) || "").slice(name.length + 3) || undefined;
  const defaultPage = [path.join(root, "page", "index.html"), path.join(root, "polyrhythm", "clock", "index.html")].find(p => fs.existsSync(p));
  const file = args.find(a => !a.startsWith("--")) || defaultPage;
  const query = opt("query") || "";
  const oldFile = opt("control");
  const START = "2026-11-16T10:00:07.300";        // local time, 7.3 s into an hour; simulate 3 hours
  console.log(`Simulating ${path.relative(root, file)}${query} for 3 h from ${START} (local), frames every ${FRAME_MS} ms ...`);
  const r = simulate(file, START, 3 * 3600 + 5, query);
  const A = r.page.settings.startTime;           // top of the starting hour
  const T = r.arcs.map(a => a.turns);
  console.log(`  ${r.nRings} rings, ${r.notes.length} notes, hour anchor ${new Date(A).toString()}`);

  // --- configuration ---
  const consecutive = T.every((t, i) => t === r.page.TOP_TURNS - i);
  check("42 rings, turns per hour are consecutive integers TOP_TURNS..TOP_TURNS-41 (inner fastest)",
    r.nRings === 42 && consecutive && T[0] === 110 && T[41] === 69, `TOP_TURNS=${r.page.TOP_TURNS}, turns ${T[0]}..${T[41]}`);
  const perHour = T.reduce((s, t) => s + t, 0);
  check("strikes per hour ~ old page's 3,780", Math.abs(perHour - 3780) < 60, `${perHour} strikes/hour`);

  // --- 1 & 2: top only, sound within 1 ms of impact ---
  const f = r.firstFrame, cx = W / 2, cy = H / 2;
  const maxR = Math.max(...f.fills.map(d => d.r));
  const markers = f.fills.filter(d => d.r !== maxR);
  check("one fixed impact marker per ring, all at the top of the screen",
    markers.length === r.nRings && markers.every(d => near(d.x, cx, 1e-6) && d.y < cy),
    `${markers.length} markers; bottom markers: ${markers.filter(d => d.y > cy).length}`);
  const gapCentre = s => { const g = (s.a1 + s.a0 + 2 * Math.PI) / 2; return Math.atan2(Math.sin(g), Math.cos(g)); };
  check("one ring arc per ring, its only gap centred at the top",
    f.strokes.length === r.nRings && f.strokes.every(s => near(gapCentre(s), -Math.PI / 2, 1e-9) && s.a1 - s.a0 < 2 * Math.PI && s.a1 - s.a0 > 1.9 * Math.PI),
    `${f.strokes.length} arcs`);

  const lo = r.t0 + 1, hi = r.end - FRAME_MS;
  const groups = new Map();                         // pitch -> rings (17 pitches are shared by two rings)
  r.arcs.forEach((a, i) => { if (!groups.has(a.freq)) groups.set(a.freq, []); groups.get(a.freq).push(i); });
  const bad = [];
  let impacts = 0, bottoms = 0;
  groups.forEach((rings, freq) => {
    const V = rings.flatMap(i => r.top[i]).filter(t => t > lo && t < hi);
    const S = r.notes.filter(n => n.freq === freq && n.t > lo && n.t < hi).map(n => n.t);
    impacts += V.length;
    bottoms += rings.flatMap(i => r.bottom[i]).filter(t => t > lo && t < hi).length;
    const p = pairUp(V, S, TOL_MS);
    if (p) bad.push(`${freq.toFixed(2)} Hz (rings ${rings.join(",")}): ${p}`);
  });
  const allFreqs = new Set(r.arcs.map(a => a.freq));
  check(`every top impact has its ring's note within ${TOL_MS} ms, and every note has a top impact`,
    bad.length === 0 && r.notes.every(n => allFreqs.has(n.freq)), bad.length ? bad.join("\n      ") : `${impacts} impacts over ~3 h, grouped by pitch (${groups.size} pitches)`);
  check("bottom crossings are silent (dot passes the bottom, no note there)",
    bottoms > 0 && bad.length === 0, `${bottoms} bottom crossings, notes = top impacts exactly`);
  const perRing = T.map((t, i) => r.top[i].filter(x => x >= A + HOUR - 0.5 && x < A + 2 * HOUR - 0.5).length);
  check("each ring strikes exactly its turn count per hour (visual)", perRing.every((c, i) => c === T[i]));

  // --- 3: on the hour ---
  const exact = r.arcs.every(a => r.page.strikeTime(a, a.turns) === A + HOUR && r.page.strikeTime(a, 2 * a.turns) === A + 2 * HOUR);
  const hourOk = h => r.arcs.every((a, i) =>
    r.top[i].some(t => near(t, h, TOL_MS)) && r.notes.some(n => n.freq === a.freq && near(n.t, h, 1e-3)));
  check("all rings strike together exactly on the hour",
    exact && hourOk(A + HOUR) && hourOk(A + 2 * HOUR) && hourOk(A + 3 * HOUR),
    `scheduler: strikeTime(ring, turns) === hour exactly for all 42; picture within ${TOL_MS} ms, sound within 0.001 ms at 3 hour marks`);

  // --- 4 & 5: repeat period ---
  const h1 = inWin(r.notes, A + HOUR, A + 2 * HOUR), h2 = inWin(r.notes, A + 2 * HOUR, A + 3 * HOUR);
  const half1 = inWin(r.notes, A + HOUR, A + 1.5 * HOUR), half2 = inWin(r.notes, A + 1.5 * HOUR, A + 2 * HOUR);
  const u30 = unmatched(half1, A + HOUR, half2, A + 1.5 * HOUR, TOL_MS);
  check("sound does NOT repeat at 30 min (minutes 0-30 vs 30-60)", u30.miss > 0,
    `${half1.length} vs ${half2.length} notes; ${u30.miss} notes of 30-60 have no counterpart in 0-30`);
  const u60 = unmatched(h1, A + HOUR, h2, A + 2 * HOUR, 1e-3);
  check("full sound pattern repeats at exactly 60 min (hour 1 vs hour 2)",
    h1.length === h2.length && h1.length === perHour + 0 && u60.miss === 0 && u60.leftover === 0,
    `${h1.length} and ${h2.length} notes, every note matched within 0.001 ms and same pitch`);
  // and no shorter period: any period P < 60 min that divides the hour would need every ring's interval to divide P
  const shorter = [2, 3, 4, 5, 6].filter(d => T.every(t => t % d === 0));
  check("no shorter whole-hour divisor period (gcd of turn counts is 1)", shorter.length === 0);

  // --- pitches ---
  const D2 = r.page.BASE_NOTE * Math.pow(2, r.page.OCTAVE_SHIFT);
  const semis = r.arcs.map(a => Math.round(12 * Math.log2(a.freq / D2)));
  const LY = r.page.LYDIAN;
  const steps = semis.map(s => { const o = Math.floor(s / 12), k = LY.indexOf(s % 12); return k < 0 ? NaN : o * 7 + k; }).reverse(); // outer -> inner
  const expected = Array.from({ length: 42 }, (_, j) => Math.floor(j / 2) + (j % 2) * 4);
  check("pitches: outer->inner = scale step k, fifth k+4, ... (0,4,1,5,...,20,24), all in D Lydian",
    steps.every((s, j) => s === expected[j]), `steps ${steps.slice(0, 8).join(",")},...,${steps.slice(-4).join(",")}`);
  const NAMES = ["D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B", "C", "C#"];
  const pcs = semis.slice().reverse().map(s => NAMES[s % 12]);
  check("cascade walks the chain of fifths", pcs.slice(0, 8).join(" ") === "D A E B F# C# G# D", pcs.join(" "));
  const range = Math.log2(Math.max(...r.arcs.map(a => a.freq)) / Math.min(...r.arcs.map(a => a.freq)));
  check("range 3.5 octaves, lowest = old lowest (D2), inner ring highest",
    near(range, 3.5, 1e-9) && near(r.arcs[41].freq, D2, 1e-9) && r.arcs[0].freq === Math.max(...r.arcs.map(a => a.freq)),
    `${r.arcs[41].freq.toFixed(2)} Hz .. ${r.arcs[0].freq.toFixed(2)} Hz = ${range.toFixed(3)} octaves; ${groups.size} distinct pitches`);
  const pinkExpected = semis.map(s => [4, 6, 9, 11].includes(s % 12));   // F#, G#, B, C# = Lydian degrees 3,4,6,7
  check("pink tint on the shifting degrees (F#, G#, B, C#) only",
    r.arcs.every((a, i) => (a.color === r.page.SHIFT_PINK) === pinkExpected[i]), `${pinkExpected.filter(Boolean).length} pink rings`);

  // --- optional control: the earlier 21-ring page ---
  if (oldFile) {
    console.log(`Control: simulating ${path.relative(root, oldFile)} for 2 h ...`);
    const o = simulate(oldFile, START, 2 * 3600 + 5);
    const OA = o.page.settings.startTime;
    const oh1 = inWin(o.notes, OA + HOUR, OA + 1.5 * HOUR), oh2 = inWin(o.notes, OA + 1.5 * HOUR, OA + 2 * HOUR);
    const ou = unmatched(oh1, OA + HOUR, oh2, OA + 1.5 * HOUR, TOL_MS);
    check("control: the old page DOES repeat at 30 min (so the comparison above has teeth)",
      ou.miss === 0 && ou.leftover === 0 && oh1.length > 0, `${oh1.length} vs ${oh2.length} notes, ${ou.miss} unmatched`);
    check("control: old page strikes per hour = 3,780", inWin(o.notes, OA + HOUR, OA + 2 * HOUR).length === 3780);
  } else {
    console.log("Control skipped (no earlier 21-ring page given).");
  }

  // --- geometry against the earlier 21-ring page's constants (same drawing code, 21 rings,
  //     dot 0.006 and line 0.002 of the drawing length) ---
  const L = Math.min(W, H) * 0.9;
  const or = Array.from({ length: 21 }, (_, i) => L * 0.05 + (L - L * 0.05 - L * 0.03) / 2 / 21 * i);
  const oDot = L * 0.006, oLw = L * 0.002;
  const radii = fr => { const mr = Math.max(...fr.fills.map(d => d.r)); return fr.fills.filter(d => d.r === mr).map(d => Math.hypot(d.x - cx, d.y - cy)); };
  const nr = radii(r.firstFrame);
  const nDot = Math.max(...r.firstFrame.fills.map(d => d.r));
  const nLw = r.firstFrame.strokes[0].lineWidth;
  const nSp = nr[1] - nr[0], oSp = or[1] - or[0];
  check("same overall size, half the spacing, half the dot size and line width",
    near(nr[0], or[0], 1e-6) && near(nSp * 2, oSp, 1e-6) && near(nDot * 2, oDot, 1e-9) && near(nLw * 2, oLw, 1e-9) && near(nr[41] + nSp, or[20] + oSp, 1e-6),
    `spacing ${nSp.toFixed(3)} vs ${oSp.toFixed(3)} px, dot r ${nDot.toFixed(3)} vs ${oDot.toFixed(3)}, line ${nLw.toFixed(3)} vs ${oLw.toFixed(3)}, outer edge ${(nr[41] + nSp).toFixed(2)} vs ${(or[20] + oSp).toFixed(2)} px`);

  const failed = results.filter(x => !x).length;
  console.log(`\n${results.length - failed}/${results.length} checks passed.`);
  process.exit(failed ? 1 : 0);
}

main();
