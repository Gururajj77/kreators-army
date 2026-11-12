#!/usr/bin/env node
// The street's art, generated once into static strings (visual §1.3, §6). Run after changing the drawing:
//
//   node scripts/street-art.mjs
//
// It writes apps/web/src/components/street/art-far.ts (the quiet far layer behind the heroes), art-skyline.ts (the footer's night skyline), art-full.ts (the shopfront row and the footpath, for
// the heroes and the 404) and vignettes.ts (five small scenes cut from the street for How we work, chapter 3). Runtime code never draws: these modules
// only hold markup. Every fill is a class (.s-*) whose colour is a --st-* token, so day and night are one drawing.
// Our own flat-vector art: a Bengaluru street as a quiet backdrop. A low skyline with rooftop water tanks, a mobile tower and the metro line, a row of
// shopfront silhouettes with scalloped awnings, and the footpath the cast stands on. No props: the street is noticed second, never first.
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'apps/web/src/components/street');

// 2400 units wide, so the slice scale is height-driven at common desktop shapes: the whole height always shows, and a shorter band means a smaller
// street, never a cut one. The 1440-unit core composition starts at x 480. The footpath's edges (BACK, FRONT) are fixed: styles/cast.css derives
// --floor-back and --floor-front from them, and the cast and the deck stand there.
const W = 2400;
const O = 480;
const H = 400;
const BACK = 340; // back edge of the footpath: shop fronts stand here
const FRONT = 372; // front edge of the footpath

let seed = 7;
const rnd = () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const r1 = (n) => Math.round(n * 10) / 10;
let uid = 0;

// Round 16 ("reduce lighting dots in footer"): the footer's lit windows are thinned after they are drawn, with a generator of their own, so rnd()
// runs exactly as before and every block, tank and tower keeps its place. A window survives only at or below `low` (the canvas's lower rows,
// near the skyline, never up behind the links) and then with chance `keep`.
function thin(wins, { keep, low, seed: s0 }) {
  let t0 = s0;
  const r = () => {
    t0 = (t0 + 0x6d2b79f5) | 0;
    let t = Math.imul(t0 ^ (t0 >>> 15), 1 | t0);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return wins.filter((w) => r() < keep && w.y >= low).map((w) => w.svg).join('');
}

// ---------- far: a low skyline, water tanks, the mobile tower, the metro viaduct, a soft tree line ----------
function far() {
  seed = 11;
  let s = '';
  for (let x = -30; x < W + 40; x += 34 + rnd() * 20) {
    const r = 18 + rnd() * 16;
    s += `<circle class="s-far2" cx="${r1(x)}" cy="${r1(306 - rnd() * 14)}" r="${r1(r)}"/>`;
  }
  let x = -20;
  const lits = [];
  while (x < W + 20) {
    const w = 54 + rnd() * 92;
    // Low everywhere, lowest on the left (under the hero copy); never taller than the bottom half of the box.
    const top = x < O + 640 ? 248 + rnd() * 24 : x < O + 760 ? 220 + rnd() * 20 : 186 + rnd() * 48;
    s += `<rect class="s-far" x="${r1(x)}" y="${r1(top)}" width="${r1(w)}" height="${r1(BACK - top)}"/>`;
    if (rnd() > 0.6) {
      const sw = w * (0.35 + rnd() * 0.3);
      s += `<rect class="s-far" x="${r1(x + (w - sw) / 2)}" y="${r1(top - 12)}" width="${r1(sw)}" height="14"/>`;
    }
    if (rnd() > 0.4) {
      // a rooftop water tank, the city's most common silhouette
      const tw = 13 + rnd() * 7;
      const tx = x + 8 + rnd() * (w - tw - 16);
      s += `<rect class="s-far" x="${r1(tx)}" y="${r1(top - 12)}" width="${r1(tw)}" height="13" rx="2"/>`;
    }
    // A rare warm window at night, only right of the copy column.
    if (x >= O + 760 && rnd() > 0.7) lits.push(`<rect x="${r1(x + 10 + rnd() * (w - 26))}" y="${r1(top + 14 + rnd() * 30)}" width="5" height="6" rx="1"/>`);
    x += w + 2 + rnd() * 10;
  }
  // the mobile tower, short and thin
  s += `<path class="s-far-line" transform="translate(480 0)" d="M884 214 L896 136 L908 214 M887 194 L905 194 M890 170 L902 170 M887 194 L902 170" fill="none" stroke-width="1.4"/>`;
  s += `<g class="s-far-lit">${lits.join('')}</g>`;
  // the elevated metro viaduct
  s += `<rect class="s-far2" x="-10" y="250" width="${W + 20}" height="7"/>`;
  for (let px = 40; px < W; px += 132) s += `<rect class="s-far2" x="${px}" y="256" width="8" height="${BACK - 256}"/>`;
  // the train, in its own group so the footer can move it (one pass, transform only)
  let train = '';
  for (let i = 0; i < 3; i++) {
    const tx = i * 96;
    train += `<rect class="s-train" x="${tx}" y="234" width="92" height="15" rx="5"/><rect class="s-train-win" x="${tx + 8}" y="238" width="76" height="4" rx="2"/>`;
  }
  s += `<g class="street-train">${train}</g>`;
  return s;
}

// ---------- skyline: the footer's own night skyline ----------
// The footer keeps the fuller night city it had before the hero street was quietened: taller blocks right of the copy column, rooftop water tanks on
// legs, a couple of antennas, a grid of warm lit windows, the tall mobile tower, the metro viaduct with capped pillars and its train. Only the footer
// draws it (art-skyline.ts); the heroes keep the quiet far layer above. Same seed as far(), so the haze and the blocks keep their old places.
function skyline() {
  seed = 11;
  let s = '';
  for (let x = -30; x < W + 40; x += 34 + rnd() * 20) {
    const r = 18 + rnd() * 16;
    s += `<circle class="s-far2" cx="${r1(x)}" cy="${r1(300 - rnd() * 18)}" r="${r1(r)}"/>`;
  }
  let x = -20;
  const lits = [];
  while (x < W + 20) {
    const w = 54 + rnd() * 92;
    const top = x < O + 640 ? 236 + rnd() * 30 : x < O + 760 ? 190 + rnd() * 30 : 118 + rnd() * 92;
    s += `<rect class="s-far" x="${r1(x)}" y="${r1(top)}" width="${r1(w)}" height="${r1(BACK - top)}"/>`;
    if (rnd() > 0.5) {
      const sw = w * (0.35 + rnd() * 0.3);
      s += `<rect class="s-far" x="${r1(x + (w - sw) / 2)}" y="${r1(top - 14)}" width="${r1(sw)}" height="16"/>`;
    }
    if (rnd() > 0.35) {
      // a rooftop water tank on two legs
      const tw = 13 + rnd() * 7;
      const tx = x + 8 + rnd() * (w - tw - 16);
      s += `<rect class="s-far" x="${r1(tx)}" y="${r1(top - 13)}" width="${r1(tw)}" height="14" rx="2"/>`;
      s += `<ellipse class="s-far" cx="${r1(tx + tw / 2)}" cy="${r1(top - 13)}" rx="${r1(tw / 2)}" ry="3"/>`;
      s += `<rect class="s-far" x="${r1(tx + 2)}" y="${r1(top - 2)}" width="2" height="3"/><rect class="s-far" x="${r1(tx + tw - 4)}" y="${r1(top - 2)}" width="2" height="3"/>`;
    }
    if (rnd() > 0.8 && top < 250) s += `<rect class="s-far" x="${r1(x + w * 0.7)}" y="${r1(top - 30)}" width="1.6" height="30"/>`;
    // A grid of windows on the tall blocks, a few of them lit.
    if (x >= O + 760) {
      for (let wy = top + 12; wy < BACK - 40; wy += 16) {
        for (let wx = x + 8; wx < x + w - 10; wx += 13) {
          if (rnd() > 0.78 && wx - x < 120) lits.push({ y: wy, svg: `<rect x="${r1(wx)}" y="${r1(wy)}" width="4" height="5" rx="1"/>` });
        }
      }
    }
    x += w + 2 + rnd() * 10;
  }
  s += `<path class="s-far-line" transform="translate(480 0)" d="M884 196 L896 78 L908 196 M887 170 L905 170 M890 140 L902 140 M893 110 L899 110 M887 170 L902 140 M905 170 L890 140" fill="none" stroke-width="1.6"/>`;
  s += `<g class="s-far-lit">${thin(lits, LIT_SKYLINE)}</g>`;
  s += `<rect class="s-far2" x="-10" y="244" width="${W + 20}" height="9"/>`;
  for (let px = 40; px < W; px += 132) s += `<rect class="s-far2" x="${px}" y="252" width="9" height="${BACK - 252}"/><rect class="s-far2" x="${px - 5}" y="252" width="19" height="4"/>`;
  let train = '';
  for (let i = 0; i < 3; i++) {
    const tx = i * 96;
    train += `<rect class="s-train" x="${tx}" y="226" width="92" height="17" rx="5"/><rect class="s-train-win" x="${tx + 8}" y="230" width="76" height="5" rx="2"/>`;
  }
  s += `<g class="street-train">${train}</g>`;
  return s;
}

// ---------- the footer's landscape: two deeper layers that rise from the skyline up toward the band's buttons (round 11) ----------
// Drawn on taller canvases (2400 x 900 and 2400 x 600, bottom-aligned like every layer), so behind the links they read as the city's depth while
// the skyline above (with the viaduct and its train) stays at the base. Calm by design: the footer paints them faint and soft (footer.css), a
// distant haze that fades out toward the buttons, the nearer blocks lower. Windows are tiny, sparse and only a few are lit.
const HAZE_H = 900;
const MIDS_H = 600;
// Round 16: how many lit windows each footer layer keeps (see thin()). The skyline (behind the wordmark) keeps about a third; the middle distance
// only its lower rows (y 400 of 600: below the legal row at every width); the far city only its lowest rows (y 790 of 900: behind the wordmark,
// never behind the links or the contacts). About a quarter of round 15's 514 windows in all, a size smaller.
const LIT_SKYLINE = { keep: 0.34, low: 0, seed: 1601 };
const LIT_MIDS = { keep: 0.42, low: 400, seed: 1602 };
const LIT_HAZE = { keep: 0.7, low: 790, seed: 1603 };
const layerH = (cls, h, body) =>
  `<svg class="street-layer ${cls}" viewBox="0 0 ${W} ${h}" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">${body}</svg>`;

// The far city: slender towers in two clusters (a business district right of centre, a second one left), a TV mast and two cranes.
function skylineHaze() {
  seed = 23;
  const g = (x, c, w) => Math.exp(-(((x - c) / w) ** 2));
  const env = (x) => 330 + 520 * g(x, 1560, 300) + 380 * g(x, 760, 230) + 300 * g(x, 2120, 200) + 200 * g(x, 300, 220);
  let s = '';
  const lit = [];
  let x = -20;
  let k = 0;
  while (x < W + 20) {
    const w = 26 + rnd() * 48;
    const h = env(x + w / 2) * (0.55 + rnd() * 0.45);
    const top = HAZE_H - h;
    const tone = k++ % 3 === 1 ? 's-hz2' : 's-hz';
    s += `<rect class="${tone}" x="${r1(x)}" y="${r1(top)}" width="${r1(w)}" height="${r1(h)}"/>`;
    const r = rnd();
    if (r > 0.72 && h > 260) {
      // a setback crown
      const sw = w * (0.45 + rnd() * 0.25);
      const sh = 18 + rnd() * 34;
      s += `<rect class="${tone}" x="${r1(x + (w - sw) / 2)}" y="${r1(top - sh)}" width="${r1(sw)}" height="${r1(sh + 1)}"/>`;
      if (rnd() > 0.5) s += `<rect class="${tone}" x="${r1(x + w / 2 - 1)}" y="${r1(top - sh - 26 - rnd() * 30)}" width="2" height="${r1(sh + 30)}"/>`;
    } else if (r > 0.52 && h > 200) {
      // a slanted roof
      s += `<path class="${tone}" d="M${r1(x)} ${r1(top + 0.5)} L${r1(x + w)} ${r1(top - 16 - rnd() * 22)} L${r1(x + w)} ${r1(top + 0.5)} Z"/>`;
    } else if (r > 0.4) {
      // a rooftop mast
      s += `<rect class="${tone}" x="${r1(x + w * (0.3 + rnd() * 0.4))}" y="${r1(top - 22 - rnd() * 18)}" width="1.6" height="${r1(42)}"/>`;
    }
    // A loose grid of windows; a few lit.
    for (let wy = top + 14; wy < HAZE_H - 30; wy += 22) {
      for (let wx = x + 6; wx < x + w - 8; wx += 11) {
        if (rnd() > 0.93) lit.push({ y: wy, svg: `<rect x="${r1(wx)}" y="${r1(wy)}" width="3" height="4"/>` });
      }
    }
    x += w + 1 + rnd() * 8;
  }
  // the TV mast, slim and tall, with its pod
  s += `<path class="s-hz-line" d="M1386 900 L1396 150 L1406 900 M1389 700 L1403 700 M1391 520 L1401 520 M1393 360 L1399 360" fill="none" stroke-width="2"/>`;
  s += `<rect class="s-hz2" x="1386" y="236" width="20" height="16" rx="5"/><rect class="s-hz2" x="1395" y="96" width="2" height="56"/>`;
  // two tower cranes over the new blocks
  for (const [cx, cy, arm] of [
    [560, 300, 170],
    [1930, 360, -150],
  ]) {
    const a = arm > 0 ? cx - 40 : cx + 40;
    s += `<path class="s-hz-line" d="M${cx} 900 L${cx} ${cy} M${a} ${cy} L${cx + arm} ${cy} M${cx} ${cy - 30} L${a} ${cy} M${cx} ${cy - 30} L${cx + arm * 0.8} ${cy} M${cx + arm * 0.7} ${cy} L${cx + arm * 0.7} ${cy + 60}" fill="none" stroke-width="2.4"/>`;
  }
  s += `<g class="s-hz-lit">${thin(lit, LIT_HAZE)}</g>`;
  return s;
}

// The middle distance: mid-rise blocks with rooftop water tanks on legs, a few domes and a soft tree line at their feet.
function skylineMids() {
  seed = 31;
  let s = '';
  const lit = [];
  let x = -20;
  let k = 0;
  while (x < W + 20) {
    const w = 50 + rnd() * 90;
    const h = 120 + rnd() * 150 + (rnd() > 0.82 ? 90 : 0);
    const top = MIDS_H - h;
    const tone = k++ % 2 ? 's-md2' : 's-md';
    s += `<rect class="${tone}" x="${r1(x)}" y="${r1(top)}" width="${r1(w)}" height="${r1(h)}"/>`;
    const r = rnd();
    if (r > 0.45) {
      const tw = 12 + rnd() * 8;
      const tx = x + 6 + rnd() * (w - tw - 12);
      s += `<rect class="${tone}" x="${r1(tx)}" y="${r1(top - 14)}" width="${r1(tw)}" height="12" rx="2"/><rect class="${tone}" x="${r1(tx + 2)}" y="${r1(top - 3)}" width="2" height="4"/><rect class="${tone}" x="${r1(tx + tw - 4)}" y="${r1(top - 3)}" width="2" height="4"/>`;
    } else if (r > 0.33) {
      const dw = w * 0.5;
      s += `<path class="${tone}" d="M${r1(x + w / 2 - dw / 2)} ${r1(top + 0.5)} A${r1(dw / 2)} ${r1(dw / 2.4)} 0 0 1 ${r1(x + w / 2 + dw / 2)} ${r1(top + 0.5)} Z"/>`;
    }
    for (let wy = top + 12; wy < MIDS_H - 40; wy += 18) {
      for (let wx = x + 7; wx < x + w - 9; wx += 13) {
        if (rnd() > 0.9) lit.push({ y: wy, svg: `<rect x="${r1(wx)}" y="${r1(wy)}" width="4" height="5" rx="1"/>` });
      }
    }
    x += w + 2 + rnd() * 14;
  }
  // a soft tree line at the base
  for (let tx = -30; tx < W + 40; tx += 30 + rnd() * 24) s += `<circle class="s-md2" cx="${r1(tx)}" cy="${r1(MIDS_H - 18 - rnd() * 14)}" r="${r1(16 + rnd() * 14)}"/>`;
  s += `<g class="s-md-lit">${thin(lit, LIT_MIDS)}</g>`;
  return s;
}

// ---------- mid: a row of shopfront silhouettes ----------
function awning(x, y, w, tone) {
  const id = `aw${++uid}`;
  const sc = Math.max(4, Math.round(w / 22));
  const step = w / sc;
  let d = `M${r1(x)} ${r1(y)}H${r1(x + w)}V${r1(y + 18)}`;
  for (let i = 0; i < sc; i++) d += `a${r1(step / 2)} ${r1(step / 2.4)} 0 0 1 ${r1(-step)} 0`;
  d += 'Z';
  let stripes = '';
  for (let i = 0; i < sc; i += 2) stripes += `<rect x="${r1(x + i * step)}" y="${r1(y)}" width="${r1(step)}" height="40" class="s-aw-w"/>`;
  return `<clipPath id="${id}"><path d="${d}"/></clipPath><g class="s-awning"><path class="s-aw-${tone}" d="${d}"/><g clip-path="url(#${id})">${stripes}</g><rect class="s-aw-edge" x="${r1(x - 3)}" y="${r1(y - 4)}" width="${r1(w + 6)}" height="5" rx="2"/></g>`;
}

function products(x, y, w, h) {
  // three shelves of things: bottles, boxes and jars in the cast colours (a D2C shop, in other words)
  const tones = ['y', 'p', 'g', 'o'];
  let s = '';
  for (let row = 0; row < 3; row++) {
    const sy = y + 10 + row * ((h - 14) / 3);
    s += `<rect class="s-shelf" x="${r1(x + 4)}" y="${r1(sy + (h - 14) / 3 - 4)}" width="${r1(w - 8)}" height="2.4"/>`;
    for (let px = x + 10; px < x + w - 18; px += 15 + rnd() * 8) {
      const t = tones[Math.floor(rnd() * 4)];
      const ph = 8 + rnd() * 6;
      const base = sy + (h - 14) / 3 - 4;
      s += rnd() > 0.45 ? `<rect class="s-prod-${t}" x="${r1(px)}" y="${r1(base - ph)}" width="8" height="${r1(ph)}" rx="3"/>` : `<rect class="s-prod-${t}" x="${r1(px)}" y="${r1(base - 7)}" width="11" height="7" rx="2"/>`;
    }
  }
  return s;
}


/** A flat scalloped awning, one tint, no stripes. */
function flatAwning(x, y, w, tone) {
  const sc = Math.max(4, Math.round(w / 26));
  const step = w / sc;
  let d = `M${r1(x)} ${r1(y)}H${r1(x + w)}V${r1(y + 14)}`;
  for (let i = 0; i < sc; i++) d += `a${r1(step / 2)} ${r1(step / 2.6)} 0 0 1 ${r1(-step)} 0`;
  return `<path class="s-aw-${tone}" d="${d}Z"/>`;
}

/** One shopfront: a wall, a floor or none above, a sign band, an awning and a shutter. */
function front({ x, w, floors, tone, wall }) {
  const shopH = 108;
  const floorH = 44;
  const top = BACK - shopH - floors * floorH;
  let s = `<rect class="s-wall${wall}" x="${r1(x)}" y="${r1(top)}" width="${r1(w)}" height="${r1(BACK - top)}"/>`;
  s += `<rect class="s-trim" x="${r1(x - 2)}" y="${r1(top - 4)}" width="${r1(w + 4)}" height="5" rx="2"/>`;
  if (floors && rnd() > 0.5) {
    const tw = 16 + rnd() * 6;
    s += `<rect class="s-trim" x="${r1(x + 12 + rnd() * (w - tw - 24))}" y="${r1(top - 17)}" width="${r1(tw)}" height="14" rx="2"/>`;
  }
  for (let f = 0; f < floors; f++) {
    const fy = top + 10 + f * floorH;
    const n = Math.max(2, Math.floor((w - 20) / 38));
    const gap = (w - 20 - n * 20) / (n - 1);
    for (let i = 0; i < n; i++) {
      const wx = x + 10 + i * (20 + gap);
      s += `<rect class="${rnd() > 0.86 ? 's-win-lit' : 's-win'}" x="${r1(wx)}" y="${r1(fy)}" width="20" height="22" rx="3"/>`;
    }
  }
  const sy = BACK - shopH;
  s += `<rect class="s-sign-${tone}" x="${r1(x + 10)}" y="${r1(sy + 4)}" width="${r1(w - 20)}" height="14" rx="4"/>`;
  s += flatAwning(x + 6, sy + 24, w - 12, tone);
  const dx = x + 14;
  const dy = sy + 46;
  const dw = w - 28;
  s += `<rect class="s-shutter-bg" x="${r1(dx)}" y="${r1(dy)}" width="${r1(dw)}" height="${r1(BACK - dy)}"/>`;
  for (let ly = dy + 10; ly < BACK - 4; ly += 10) s += `<rect class="s-shutter-line" x="${r1(dx)}" y="${r1(ly)}" width="${r1(dw)}" height="1.4"/>`;
  return s;
}

function mid() {
  seed = 29;
  const tones = ['o', 'p', 'g', 'y'];
  let s = '';
  let x = -14;
  let i = 0;
  while (x < W + 10) {
    const w = 150 + rnd() * 64;
    // One storey under the hero copy; a floor above some shops further right.
    const floors = x + w < O + 620 ? 0 : rnd() > 0.45 ? 1 : 0;
    s += front({ x, w, floors, tone: tones[i % 4], wall: (i % 4) + 1 });
    x += w + 8 + rnd() * 8;
    i++;
  }
  return s;
}

function teaStall(x, back = BACK, id = 'tea') {
  // a corner tea stall: a slanted tin roof, a counter, a kettle, glasses and a string of bulbs
  let s = `<g class="s-shop" data-shop="${id}" data-cx="${x + 70}">`;
  s += `<rect class="s-wall2" x="${x}" y="${back - 112}" width="140" height="112"/>`;
  s += `<path class="s-roof" d="M${x - 10} ${back - 96}L${x + 150} ${back - 110}L${x + 150} ${back - 100}L${x - 10} ${back - 86}Z"/>`;
  for (let i = 0; i < 9; i++) s += `<rect class="s-roof-line" x="${x - 6 + i * 17.5}" y="${r1(back - 108 + i * -0.2)}" width="2" height="14" transform="rotate(-5 ${x + i * 17.5} ${back - 100})"/>`;
  s += `<rect class="s-inside" x="${x + 10}" y="${back - 86}" width="120" height="48"/>`;
  s += `<rect class="s-inside-glow" x="${x + 10}" y="${back - 86}" width="120" height="48"/>`;
  s += `<rect class="s-wood" x="${x + 4}" y="${back - 40}" width="132" height="40" rx="3"/><rect class="s-wood-top" x="${x}" y="${back - 44}" width="140" height="6" rx="2"/>`;
  s += `<circle class="s-kettle" cx="${x + 40}" cy="${back - 54}" r="9"/><path class="s-kettle" d="M${x + 48} ${back - 56}l10 -6l1 3l-8 6z"/><rect class="s-kettle" x="${x + 36}" y="${back - 66}" width="8" height="4" rx="2"/>`;
  for (let i = 0; i < 4; i++) s += `<rect class="s-glass" x="${x + 70 + i * 9}" y="${back - 54}" width="6" height="10" rx="1.5"/><rect class="s-chai" x="${r1(x + 70.6 + i * 9)}" y="${back - 50}" width="4.8" height="5.4" rx="1"/>`;
  s += `<rect class="s-stool" x="${x - 26}" y="${back - 18}" width="18" height="5" rx="2"/><rect class="s-stool" x="${x - 20}" y="${back - 13}" width="4" height="13"/>`;
  s += `<rect class="s-stool" x="${x + 150}" y="${back - 18}" width="18" height="5" rx="2"/><rect class="s-stool" x="${x + 157}" y="${back - 13}" width="4" height="13"/>`;
  let bulbs = `<path class="s-wire" d="M${x - 8} ${back - 84} Q ${x + 70} ${back - 64} ${x + 148} ${back - 98}" fill="none" stroke-width="1.2"/>`;
  for (let i = 1; i < 8; i++) {
    const t = i / 8;
    const bx = (1 - t) * (1 - t) * (x - 8) + 2 * (1 - t) * t * (x + 70) + t * t * (x + 148);
    const by = (1 - t) * (1 - t) * (back - 84) + 2 * (1 - t) * t * (back - 64) + t * t * (back - 98);
    bulbs += `<circle class="s-bulb" cx="${r1(bx)}" cy="${r1(by + 3)}" r="2.6"/>`;
  }
  s += `<g class="s-bulbs">${bulbs}</g></g>`;
  return s;
}


// ---------- near: the footpath, a kerb line and the road ----------
function near() {
  let s = `<rect class="s-path" x="-10" y="${BACK - 2}" width="${W + 20}" height="${FRONT - BACK + 2}"/>`;
  s += `<rect class="s-path-line-h" x="-10" y="${BACK + 15}" width="${W + 20}" height="1.2"/>`;
  s += `<rect class="s-curb-a" x="-10" y="${FRONT}" width="${W + 20}" height="5"/>`;
  s += `<rect class="s-road" x="-10" y="${FRONT + 5}" width="${W + 20}" height="${H - FRONT - 5 + 4}"/>`;
  return s;
}

const layer = (cls, body) => `<svg class="street-layer ${cls}" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">${body}</svg>`;

// ---------- vignettes: five small scenes cut from the street (How we work, chapter 3) ----------
// 320 x 200 each. A slice of shopfront and footpath, plus one motif. No words anywhere: the tile's own heading says it.
const VW = 320;
const VH = 200;
const VB = 156; // the vignettes' footpath back edge
const VF = 182; // front edge

let vgIndex = 0;
function vgBase({ tone = 'g', wall = 1, shutter = 0.42, stall = false } = {}) {
  seed = 61;
  // Clip ids apart from the street's own and from each other.
  uid = 900 + 10 * vgIndex++;
  let s = `<rect class="s-vg-sky" width="${VW}" height="${VH}"/>`;
  // two far blocks with a tank, the metro line
  s += `<rect class="s-far" x="-4" y="62" width="96" height="${VB - 62}"/><rect class="s-far" x="214" y="40" width="110" height="${VB - 40}"/>`;
  s += `<rect class="s-far" x="240" y="27" width="16" height="14" rx="2"/><ellipse class="s-far" cx="248" cy="27" rx="8" ry="3"/>`;
  s += `<rect class="s-far2" x="-4" y="84" width="${VW + 8}" height="7"/>`;
  if (stall) {
    s += teaStall(98, VB, 'vg');
  } else {
    // one shopfront, its shutter part-open
    const x = 52;
    const w = 216;
    const sy = VB - 110;
    s += `<rect class="s-wall${wall}" x="${x}" y="${sy}" width="${w}" height="${VB - sy}"/>`;
    s += `<rect class="s-sign-${tone}" x="${x + 12}" y="${sy + 4}" width="${w - 24}" height="16" rx="4"/>`;
    s += `<rect class="s-sign-mark" x="${x + 24}" y="${sy + 10}" width="22" height="5" rx="2.5"/><rect class="s-sign-mark" x="${x + 52}" y="${sy + 10}" width="12" height="5" rx="2.5"/>`;
    s += awning(x + 4, sy + 26, w - 8, tone);
    const dx = x + 14;
    const dy = sy + 50;
    const dw = w - 28;
    const dh = VB - dy;
    s += `<rect class="s-inside" x="${dx}" y="${dy}" width="${dw}" height="${dh}"/>`;
    seed = 77;
    s += products(dx, dy, dw, dh);
    let lines = '';
    for (let ly = dy + 5; ly < VB; ly += 5) lines += `<rect class="s-shutter-line" x="${dx}" y="${ly}" width="${dw}" height="1.4"/>`;
    const cut = r1(dh * (1 - shutter));
    s += `<g><rect class="s-shutter-bg" x="${dx}" y="${dy}" width="${dw}" height="${cut}"/>${lines.replace(/y="([\d.]+)"/g, (m, y) => (Number(y) < dy + cut ? m : 'y="-99"'))}</g>`;
    s += `<rect class="s-trim" x="${dx - 3}" y="${dy - 2}" width="${dw + 6}" height="3"/>`;
  }
  // footpath, kerb, road
  s += `<rect class="s-path" x="-4" y="${VB - 2}" width="${VW + 8}" height="${VF - VB + 2}"/>`;
  for (let x = 10; x < VW + 20; x += 52) s += `<path class="s-path-line" d="M${x} ${VB} L${x - 6} ${VF}" stroke-width="1.2"/>`;
  s += `<rect class="s-curb-a" x="-4" y="${VF}" width="${VW + 8}" height="7"/>`;
  for (let x = -4; x < VW + 8; x += 40) s += `<rect class="s-curb-b" x="${x}" y="${VF}" width="20" height="7"/>`;
  s += `<rect class="s-road" x="-4" y="${VF + 7}" width="${VW + 8}" height="${VH - VF}"/>`;
  return s;
}

/** A simple person standing on the footpath: a head and a rounded body. `turn` faces them left or right. */
function person(x, tone, { h = 70, turn = 1 } = {}) {
  const top = VF - 6 - h;
  let s = `<g class="s-person s-person-${tone}">`;
  s += `<rect x="${x - 15}" y="${top + 28}" width="30" height="${h - 28}" rx="13"/>`;
  s += `<circle cx="${x}" cy="${top + 13}" r="13"/>`;
  s += `<circle class="s-person-face" cx="${x + 5 * turn}" cy="${top + 11}" r="1.8"/>`;
  s += '</g>';
  return s;
}

const vgSvg = (name, body) => `<svg class="street-vignette" data-vignette="${name}" viewBox="0 0 ${VW} ${VH}" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">${body}</svg>`;

function vignettes() {
  const out = {};
  // Natural, not a pitch: a passer-by has stopped to talk; the interviewer holds out the mic; a bubble of "...".
  {
    let s = vgBase({ tone: 'g', wall: 1 });
    s += person(124, 'a', { h: 74, turn: 1 });
    s += `<g class="s-mic"><rect x="138" y="${VF - 58}" width="22" height="4.5" rx="2.2" transform="rotate(-18 138 ${VF - 56})"/><circle cx="162" cy="${VF - 63}" r="6"/></g>`;
    s += person(198, 'b', { h: 66, turn: -1 });
    s += `<g class="s-vg-bubble"><rect x="206" y="44" width="62" height="34" rx="14"/><path d="M216 76 l-6 10 l14 -9z"/><circle class="s-vg-dot" cx="223" cy="61" r="3.6"/><circle class="s-vg-dot" cx="237" cy="61" r="3.6"/><circle class="s-vg-dot" cx="251" cy="61" r="3.6"/></g>`;
    out.passerby = vgSvg('passerby', s);
  }
  // Clear about who's asking: the interviewer wears a badge on a lanyard; a large badge, ticked.
  {
    let s = vgBase({ tone: 'p', wall: 3 });
    s += person(118, 'a', { h: 76, turn: 1 });
    s += `<path class="s-lanyard" d="M108 ${VF - 70} L118 ${VF - 50} L128 ${VF - 70}" fill="none" stroke-width="2.4"/>`;
    s += `<rect class="s-badge" x="112" y="${VF - 52}" width="12" height="15" rx="2"/>`;
    s += `<g class="s-badge-big" transform="translate(178 48)"><rect width="92" height="64" rx="12"/><circle class="s-badge-av" cx="24" cy="26" r="11"/><rect class="s-badge-line" x="42" y="18" width="38" height="6" rx="3"/><rect class="s-badge-line" x="42" y="30" width="26" height="6" rx="3"/><g class="s-badge-tick"><circle cx="80" cy="56" r="13"/><path d="M73 56 l5 5 l9 -10" fill="none" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></g></g>`;
    out.intro = vgSvg('intro', s);
  }
  // A reason to stop: a small wrapped gift on the tea stall's counter.
  {
    let s = vgBase({ stall: true });
    s += `<g class="s-gift" transform="translate(148 ${VB - 68})"><rect class="s-gift-box" x="0" y="8" width="34" height="24" rx="3"/><rect class="s-gift-lid" x="-3" y="2" width="40" height="9" rx="2"/><rect class="s-gift-ribbon" x="14" y="2" width="6" height="30"/><path class="s-gift-bow" d="M17 2 C 8 -10 0 -2 10 2 Z M17 2 C 26 -10 34 -2 24 2 Z"/></g>`;
    s += person(262, 'b', { h: 66, turn: -1 });
    out.gift = vgSvg('gift', s);
  }
  // Room to follow a good moment: the footpath line branches in two, with a dot at the fork.
  {
    let s = vgBase({ tone: 'o', wall: 4 });
    s += `<g class="s-branch"><path d="M20 ${VF - 8} H138 C 168 ${VF - 8} 178 ${VB - 40} 214 ${VB - 52} H300" fill="none" stroke-width="5" stroke-linecap="round"/><path d="M138 ${VF - 8} H300" fill="none" stroke-width="5" stroke-linecap="round" class="s-branch-alt"/><circle class="s-branch-dot" cx="138" cy="${VF - 8}" r="8"/><path class="s-branch-head" d="M296 ${VB - 60} l12 8 l-12 8z"/><path class="s-branch-head s-branch-alt" d="M296 ${VF - 16} l12 8 l-12 8z"/></g>`;
    out.branch = vgSvg('branch', s);
  }
  // Professional, and varied: camera framing corners over the street, a tally dot and a level line.
  {
    let s = vgBase({ tone: 'y', wall: 2, shutter: 0.7 });
    s += person(160, 'a', { h: 72, turn: 1 });
    const c = 'fill="none" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"';
    s += `<g class="s-frame"><path d="M40 70 V44 H66" ${c}/><path d="M254 44 H280 V70" ${c}/><path d="M40 150 V176 H66" ${c}/><path d="M254 176 H280 V150" ${c}/><path class="s-frame-thin" d="M150 110 H170 M160 100 V120" fill="none" stroke-width="2" stroke-linecap="round"/></g>`;
    s += `<circle class="s-tally" cx="268" cy="30" r="6"/>`;
    out.framing = vgSvg('framing', s);
  }
  return out;
}


// ---------- write ----------
const HEADER = `// Generated by scripts/street-art.mjs. Do not edit by hand: change the drawing there and run \`node scripts/street-art.mjs\`.
// Static, build-time markup with no visitor or admin input in it. The street injects these strings with dangerouslySetInnerHTML, the one documented
// exception to the site's no-innerHTML rule (V2-SPEC 8.4); every colour is a class whose fill is a --st-* token in components/street/paint.css and paint-full.css.
`;

uid = 0;
const FAR = layer('street-far', far());
const SKYLINE = layer('street-far', skyline());
const MID = layer('street-mid', mid());
const NEAR = layer('street-near', near());
const VIGNETTES = vignettes();
const SKYLINE_HAZE = layerH('street-haze', HAZE_H, skylineHaze());
const SKYLINE_MIDS = layerH('street-mids', MIDS_H, skylineMids());

mkdirSync(OUT, { recursive: true });
const write = (file, body) => {
  writeFileSync(join(OUT, file), HEADER + body);
  return body;
};
write('art-far.ts', `\n/** The skyline (far layer): a low haze of blocks and water tanks, the mobile tower, the metro viaduct and its train. The footer's whole street. */\nexport const FAR = ${JSON.stringify(FAR)};\n`);
write(
  'art-skyline.ts',
  `\n/** The footer's skyline: the fuller night city (taller blocks, water tanks on legs, lit windows, the tower, the viaduct and its train). Footer only. */\nexport const SKYLINE = ${JSON.stringify(SKYLINE)};\n\n/** The footer's far city (round 11): slender towers, a TV mast and two cranes, rising toward the band's buttons. Painted faint and soft. */\nexport const SKYLINE_HAZE = ${JSON.stringify(SKYLINE_HAZE)};\n\n/** The footer's middle distance (round 11): mid-rise blocks with water tanks and domes, and a tree line, between the far city and the skyline. */\nexport const SKYLINE_MIDS = ${JSON.stringify(SKYLINE_MIDS)};\n`,
);
write(
  'art-full.ts',
  `import './paint-full.css';\nimport './full.css';\n\n/** The shopfront row: walls, sign bands, flat awnings and shutters, a floor above some. */\nexport const MID = ${JSON.stringify(MID)};\n\n/** The footpath, a kerb line and the road. */\nexport const NEAR = ${JSON.stringify(NEAR)};\n`,
);
write(
  'vignettes.ts',
  `import './paint.css';\nimport './paint-full.css';\n\n/** Five small static scenes cut from the street, for How we work chapter 3. Each is a 320 x 200 SVG string; render it inside an aria-hidden box. */\nexport const VIGNETTES = ${JSON.stringify(VIGNETTES, null, 2)} as const;\n\nexport type VignetteName = keyof typeof VIGNETTES;\n`,
);

const kb = (s) => `${(s.length / 1000).toFixed(1)} kB raw, ${(gzipSync(s).length / 1000).toFixed(1)} kB gzip`;
console.log(`far        ${kb(FAR)}`);
console.log(`skyline    ${kb(SKYLINE)}`);
console.log(`haze       ${kb(SKYLINE_HAZE)}`);
console.log(`mids       ${kb(SKYLINE_MIDS)}`);
console.log(`mid        ${kb(MID)}`);
console.log(`near       ${kb(NEAR)}`);
console.log(`full       ${kb(MID + NEAR)}`);
console.log(`vignettes  ${kb(Object.values(VIGNETTES).join(''))}`);
