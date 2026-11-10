#!/usr/bin/env node
// The street's art, generated once into static strings (visual §1.3, §6). Run after changing the drawing:
//
//   node scripts/street-art.mjs
//
// It writes apps/web/src/components/street/art-far.ts (the skyline: the footer's whole street, ~3 kB gzip), art-full.ts (stars, shopfronts and
// footpath, for the heroes and the 404) and vignettes.ts (five small scenes cut from the street for How we work, chapter 3). Runtime code never
// draws: these modules only hold markup. Every fill is a class (.s-*) whose colour is a --st-* token, so day and night are one drawing.
// Our own flat-vector art in the brand palette: a Bengaluru street with shopfronts, a tea stall, rooftop water tanks, a metro line and a scooter.
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'apps/web/src/components/street');

// 2400 units wide, so the slice scale is height-driven at common desktop shapes: the whole height always shows, and a shorter band means a smaller
// street, never a cut one. The 1440-unit core composition starts at x 480.
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

// ---------- far: skyline haze, water tanks, a viaduct, tree line ----------
function far() {
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
    // Low on the left (under the hero copy), taller on the right (behind the deck).
    const top = x < O + 640 ? 236 + rnd() * 30 : x < O + 760 ? 190 + rnd() * 30 : 118 + rnd() * 92;
    s += `<rect class="s-far" x="${r1(x)}" y="${r1(top)}" width="${r1(w)}" height="${r1(BACK - top)}"/>`;
    if (rnd() > 0.55) {
      const sw = w * (0.35 + rnd() * 0.3);
      s += `<rect class="s-far" x="${r1(x + (w - sw) / 2)}" y="${r1(top - 14)}" width="${r1(sw)}" height="16"/>`;
    }
    if (rnd() > 0.35) {
      // a rooftop water tank, the city's most common silhouette
      const tw = 13 + rnd() * 7;
      const tx = x + 8 + rnd() * (w - tw - 16);
      s += `<rect class="s-far" x="${r1(tx)}" y="${r1(top - 13)}" width="${r1(tw)}" height="14" rx="2"/><ellipse class="s-far" cx="${r1(tx + tw / 2)}" cy="${r1(top - 13)}" rx="${r1(tw / 2)}" ry="3"/>`;
      s += `<rect class="s-far" x="${r1(tx + 2)}" y="${r1(top - 2)}" width="2" height="3"/><rect class="s-far" x="${r1(tx + tw - 4)}" y="${r1(top - 2)}" width="2" height="3"/>`;
    }
    if (rnd() > 0.8) s += `<rect class="s-far" x="${r1(x + w * 0.7)}" y="${r1(top - 30)}" width="1.6" height="30"/>`;
    // Windows that light at night, only behind the deck (never behind reading text).
    for (let wy = top + 12; wy < BACK - 40; wy += 16) {
      for (let wx = x + 8; wx < x + w - 10; wx += 13) {
        if (x >= O + 760 && rnd() > 0.78) lits.push(`<rect x="${r1(wx)}" y="${r1(wy)}" width="5" height="6" rx="1"/>`);
      }
    }
    x += w + 2 + rnd() * 10;
  }
  // a mobile tower
  s += `<path class="s-far-line" transform="translate(480 0)" d="M884 196 L896 78 L908 196 M887 170 L905 170 M890 140 L902 140 M893 110 L899 110 M887 170 L902 140 M905 170 L890 140" fill="none" stroke-width="1.6"/>`;
  s += `<g class="s-far-lit">${lits.join('')}</g>`;
  // the elevated metro viaduct
  s += `<rect class="s-far2" x="-10" y="244" width="${W + 20}" height="9"/>`;
  for (let px = 40; px < W; px += 132) s += `<rect class="s-far2" x="${px}" y="252" width="9" height="${BACK - 252}"/><rect class="s-far2" x="${px - 5}" y="252" width="19" height="4"/>`;
  // the train, in its own group so the footer can move it (one pass, transform only)
  let train = '';
  for (let i = 0; i < 3; i++) {
    const tx = i * 96;
    train += `<rect class="s-train" x="${tx}" y="226" width="92" height="17" rx="5"/><rect class="s-train-win" x="${tx + 8}" y="230" width="76" height="5" rx="2"/>`;
  }
  s += `<g class="street-train">${train}</g>`;
  return s;
}

// ---------- mid: shopfronts, the tea stall, trees ----------
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

function shop({ x, w, floors, tone, wall, sign = true, id }) {
  const shopH = 118;
  const floorH = 50;
  const top = BACK - shopH - floors * floorH;
  let s = `<g class="s-shop" data-shop="${id}" data-cx="${r1(x + w / 2)}">`;
  s += `<rect class="s-wall${wall}" x="${r1(x)}" y="${r1(top)}" width="${r1(w)}" height="${r1(BACK - top)}"/>`;
  s += `<rect class="s-trim" x="${r1(x - 3)}" y="${r1(top - 5)}" width="${r1(w + 6)}" height="7" rx="2"/>`;
  for (let f = 0; f < floors; f++) {
    const fy = top + 12 + f * floorH;
    const n = Math.max(2, Math.floor((w - 20) / 34));
    const gap = (w - 20 - n * 22) / (n - 1);
    for (let i = 0; i < n; i++) {
      const wx = x + 10 + i * (22 + gap);
      s += `<rect class="s-win" x="${r1(wx)}" y="${r1(fy)}" width="22" height="26" rx="3"/>`;
      if (rnd() > 0.42) s += `<rect class="s-win-lit" x="${r1(wx)}" y="${r1(fy)}" width="22" height="26" rx="3"/>`;
      s += `<rect class="s-sill" x="${r1(wx - 2)}" y="${r1(fy + 26)}" width="26" height="3" rx="1"/>`;
    }
    if (f === floors - 1 && w > 140 && rnd() > 0.3) {
      s += `<rect class="s-trim" x="${r1(x + 8)}" y="${r1(fy + 30)}" width="${r1(w - 16)}" height="3" rx="1"/>`;
      for (let px = x + 16; px < x + w - 16; px += 24 + rnd() * 18) s += `<circle class="s-leaf" cx="${r1(px)}" cy="${r1(fy + 26)}" r="${r1(5 + rnd() * 3)}"/>`;
    }
  }
  const sy = BACK - shopH;
  if (sign) {
    s += `<rect class="s-sign-${tone}" x="${r1(x + 10)}" y="${r1(sy + 2)}" width="${r1(w - 20)}" height="17" rx="4"/>`;
    for (let i = 0, gx = x + 18; i < 3 && gx < x + w - 40; i++, gx += 18 + rnd() * 14) s += `<rect class="s-sign-mark" x="${r1(gx)}" y="${r1(sy + 8)}" width="${r1(8 + rnd() * 12)}" height="5" rx="2.5"/>`;
  }
  s += `<rect class="s-shade" x="${r1(x)}" y="${r1(sy + 44)}" width="${r1(w)}" height="10"/>`;
  s += awning(x + 4, sy + 26, w - 8, tone);
  const dx = x + 12;
  const dy = sy + 50;
  const dw = w - 24;
  const dh = BACK - dy;
  const cid = `dr${++uid}`;
  s += `<clipPath id="${cid}"><rect x="${r1(dx)}" y="${r1(dy)}" width="${r1(dw)}" height="${r1(dh)}"/></clipPath>`;
  s += `<g clip-path="url(#${cid})"><rect class="s-inside" x="${r1(dx)}" y="${r1(dy)}" width="${r1(dw)}" height="${r1(dh)}"/>${products(dx, dy, dw, dh)}<rect class="s-inside-glow" x="${r1(dx)}" y="${r1(dy)}" width="${r1(dw)}" height="${r1(dh)}"/>`;
  let lines = '';
  for (let ly = dy + 5; ly < BACK; ly += 5) lines += `<rect class="s-shutter-line" x="${r1(dx)}" y="${r1(ly)}" width="${r1(dw)}" height="1.4"/>`;
  s += `<g class="s-shutter"><rect class="s-shutter-bg" x="${r1(dx)}" y="${r1(dy)}" width="${r1(dw)}" height="${r1(dh)}"/>${lines}<rect class="s-shutter-handle" x="${r1(dx + dw / 2 - 9)}" y="${r1(BACK - 8)}" width="18" height="4" rx="2"/></g></g>`;
  s += `<rect class="s-trim" x="${r1(dx - 3)}" y="${r1(dy - 2)}" width="${r1(dw + 6)}" height="3"/>`;
  s += '</g>';
  return s;
}

function tree(x, h = 120, r = 34) {
  const ty = BACK - h;
  let s = `<rect class="s-trunk" x="${r1(x - 3)}" y="${r1(ty + r * 0.6)}" width="6" height="${r1(BACK - ty - r * 0.6)}" rx="2"/>`;
  s += `<circle class="s-tree" cx="${r1(x)}" cy="${r1(ty)}" r="${r}"/><circle class="s-tree" cx="${r1(x - r * 0.75)}" cy="${r1(ty + r * 0.45)}" r="${r1(r * 0.68)}"/><circle class="s-tree" cx="${r1(x + r * 0.78)}" cy="${r1(ty + r * 0.4)}" r="${r1(r * 0.72)}"/>`;
  s += `<circle class="s-tree-hi" cx="${r1(x - r * 0.3)}" cy="${r1(ty - r * 0.3)}" r="${r1(r * 0.45)}"/>`;
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

function mid() {
  seed = 29;
  let s = '';
  s += shop({ x: 6, w: 180, floors: 0, tone: 'o', wall: 2, id: 'l1' });
  s += tree(214, 120, 28);
  s += shop({ x: 244, w: 220, floors: 0, tone: 'p', wall: 4, id: 'l2' });
  s += shop({ x: O - 10, w: 176, floors: 0, tone: 'g', wall: 1, id: 'a' });
  s += tree(O + 196, 112, 28);
  s += shop({ x: O + 228, w: 184, floors: 0, tone: 'y', wall: 3, id: 'b' });
  s += teaStall(O + 440);
  s += shop({ x: O + 616, w: 168, floors: 1, tone: 'p', wall: 1, id: 'c' });
  s += tree(O + 812, 150, 36);
  s += shop({ x: O + 850, w: 196, floors: 2, tone: 'o', wall: 4, id: 'd' });
  s += shop({ x: O + 1056, w: 168, floors: 3, tone: 'y', wall: 2, id: 'e' });
  s += tree(O + 1246, 140, 32);
  s += shop({ x: O + 1276, w: 180, floors: 2, tone: 'p', wall: 3, id: 'f' });
  s += shop({ x: O + 1466, w: 200, floors: 1, tone: 'g', wall: 1, id: 'r1' });
  s += tree(O + 1700, 150, 34);
  s += shop({ x: O + 1734, w: 200, floors: 3, tone: 'o', wall: 3, id: 'r2' });
  return s;
}

// ---------- near: footpath, kerb, road, lamp posts, a parked scooter, a planter ----------
function lamp(x) {
  let s = `<rect class="s-post" x="${x - 3}" y="168" width="6" height="${FRONT - 168 - 6}" rx="2"/><rect class="s-post" x="${x - 7}" y="${FRONT - 12}" width="14" height="8" rx="2"/>`;
  s += `<path class="s-post" d="M${x} 174 q 0 -10 12 -10 h 22 v 4 h -22 q -8 0 -8 6z"/>`;
  s += `<path class="s-lamp-head" d="M${x + 26} 164 h 22 l -4 9 h -14z"/>`;
  s += `<ellipse class="s-lamp-bulb" cx="${x + 37}" cy="175" rx="7" ry="2.6"/>`;
  return s;
}

function scooter(x, front = FRONT) {
  const y = front - 6;
  let s = '<g class="s-scooter">';
  s += `<circle class="s-tyre" cx="${x}" cy="${y - 11}" r="11"/><circle class="s-hub" cx="${x}" cy="${y - 11}" r="4"/>`;
  s += `<circle class="s-tyre" cx="${x + 64}" cy="${y - 11}" r="11"/><circle class="s-hub" cx="${x + 64}" cy="${y - 11}" r="4"/>`;
  s += `<path class="s-scoot" d="M${x - 14} ${y - 18} q 4 -22 30 -22 h 22 q 10 0 14 -10 l 6 -18 h 6 l -6 26 q 22 4 24 26 h -14 q -4 -14 -18 -14 h -14 q -6 0 -10 6 l -8 8 h -26 z"/>`;
  s += `<path class="s-seat" d="M${x + 4} ${y - 44} h 32 q 6 0 6 5 v 2 h -42 z"/>`;
  s += `<rect class="s-post" x="${x + 68}" y="${y - 76}" width="3" height="20" rx="1.5" transform="rotate(14 ${x + 70} ${y - 66})"/><rect class="s-post" x="${x + 64}" y="${y - 78}" width="16" height="4" rx="2"/>`;
  s += `<circle class="s-mirror" cx="${x + 84}" cy="${y - 84}" r="3.4"/>`;
  s += '</g>';
  return s;
}

function near() {
  seed = 41;
  let s = `<rect class="s-path" x="-10" y="${BACK - 2}" width="${W + 20}" height="${FRONT - BACK + 2}"/>`;
  for (let x = -20; x < W + 20; x += 64) s += `<path class="s-path-line" d="M${x} ${BACK} L${x - 8} ${FRONT}" stroke-width="1.4"/>`;
  s += `<rect class="s-path-line-h" x="-10" y="${BACK + 15}" width="${W + 20}" height="1.2"/>`;
  s += `<rect class="s-curb-a" x="-10" y="${FRONT}" width="${W + 20}" height="9"/>`;
  for (let x = -10; x < W + 20; x += 64) s += `<rect class="s-curb-b" x="${x}" y="${FRONT}" width="32" height="9"/>`;
  s += `<rect class="s-road" x="-10" y="${FRONT + 9}" width="${W + 20}" height="${H - FRONT - 9 + 4}"/>`;
  // lamp pools first, so the posts stand in their own light
  for (const x of [O + 596, O + 1196, 140, O + 1660]) s += `<ellipse class="s-pool" cx="${x + 37}" cy="${FRONT - 10}" rx="120" ry="16"/>`;
  s += lamp(O + 596) + lamp(O + 1196) + lamp(140) + lamp(O + 1660);
  s += scooter(O + 470);
  s += `<g transform="translate(480 0)"><rect class="s-planter" x="770" y="${FRONT - 28}" width="44" height="24" rx="4"/><circle class="s-leaf" cx="782" cy="${FRONT - 32}" r="10"/><circle class="s-leaf" cx="800" cy="${FRONT - 36}" r="12"/><circle class="s-leaf-hi" cx="796" cy="${FRONT - 40}" r="5"/></g>`;
  for (const x of [O + 40, O + 70, O + 1380, O + 1410]) s += `<rect class="s-bollard" x="${x}" y="${FRONT - 26}" width="10" height="22" rx="5"/><rect class="s-curb-b" x="${x}" y="${FRONT - 20}" width="10" height="4"/>`;
  return s;
}

function stars() {
  seed = 3;
  let s = '';
  for (let i = 0; i < 46; i++) s += `<circle cx="${r1(rnd() * W)}" cy="${r1(10 + rnd() * 170)}" r="${r1(0.6 + rnd() * 1.1)}"/>`;
  return `<g class="s-stars">${s}</g>`;
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
const STARS = layer('street-stars', stars());
const MID = layer('street-mid', mid());
const NEAR = layer('street-near', near());
const VIGNETTES = vignettes();

mkdirSync(OUT, { recursive: true });
const write = (file, body) => {
  writeFileSync(join(OUT, file), HEADER + body);
  return body;
};
write('art-far.ts', `\n/** The skyline (far layer): haze blocks, water tanks, the mobile tower, the metro viaduct and its train. The footer's whole street. */\nexport const FAR = ${JSON.stringify(FAR)};\n`);
write(
  'art-full.ts',
  `import './paint-full.css';\nimport './full.css';\n\n// The full scene's pointer depth, glow and wake travel with its drawing, so the skyline never downloads them.\nexport { animate } from './motion';\n\n/** The night sky's stars. */\nexport const STARS = ${JSON.stringify(STARS)};\n\n/** Shopfronts with awnings in the cast colours, the tea stall and trees. Each shop is a .s-shop with data-cx, its centre in scene units, for the wake. */\nexport const MID = ${JSON.stringify(MID)};\n\n/** The footpath, kerb and road, lamp posts and their pools, the scooter, a planter and bollards. */\nexport const NEAR = ${JSON.stringify(NEAR)};\n`,
);
write(
  'vignettes.ts',
  `import './paint.css';\nimport './paint-full.css';\n\n/** Five small static scenes cut from the street, for How we work chapter 3. Each is a 320 x 200 SVG string; render it inside an aria-hidden box. */\nexport const VIGNETTES = ${JSON.stringify(VIGNETTES, null, 2)} as const;\n\nexport type VignetteName = keyof typeof VIGNETTES;\n`,
);

const kb = (s) => `${(s.length / 1000).toFixed(1)} kB raw, ${(gzipSync(s).length / 1000).toFixed(1)} kB gzip`;
console.log(`far        ${kb(FAR)}`);
console.log(`stars      ${kb(STARS)}`);
console.log(`mid        ${kb(MID)}`);
console.log(`near       ${kb(NEAR)}`);
console.log(`full       ${kb(STARS + MID + NEAR)}`);
console.log(`vignettes  ${kb(Object.values(VIGNETTES).join(''))}`);
