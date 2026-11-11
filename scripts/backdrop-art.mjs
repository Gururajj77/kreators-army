#!/usr/bin/env node
// The field's metal, generated once into two static images (round 4: "very dark, metallic, fractal"). Run after changing the look:
//
//   node scripts/backdrop-art.mjs [--look forged|agate|titanium] [--out <dir>] [--w 2160] [--h 3600] [--aq 40] [--q 60] [--png]
//   tuning: [--tint 0.26] [--spec 0.1] [--env 0.04] [--spread 0.24] [--feed 2.4] [--fine 0.16] [--dither 2] [--relief 7]
//
// Pure Node: noise, shading and a PNG encoder (node:zlib) live here. When `sharp` is installed in the workspace (today it is, as a transitive dev
// dependency) each plate is written as AVIF (what the site loads) and WebP (the fallback for a browser without AVIF); without sharp the script writes
// PNGs and says so (--png keeps them as well).
//
// What it draws: a tall plate of metal, 2160 x 3600 (3:5; the site covers the screen with it, so a 1440 px wide 2x screen upscales it 1.33x at
// most). Its height field is a twice domain-warped fBm cut by two ridged-multifractal vein networks (a large one and one about 4x finer that
// branches between it), with a level brushed grain; it is shaded as metal through a fake normal map: a grazing key light from the top left,
// anisotropic highlights broken by the grain, a cool rim on the slopes and a soft reflection bent by the relief, all tinted by the zone's metal
// (dark albedo, coloured highlights: anodised, not painted). Its heat tint runs down the plate from navy (top) through oxblood (middle) to bottle
// green (end); each hue holds a plateau so it reads as its own colour at normal brightness, and hues meet only through near-black (never purple).
// The site slides the plate up as the page scrolls, so the hue that dominates shifts. Two plates come out:
//   plate-dark   very dark metal (relative luminance about 0.001 to 0.07, median 0.006), for the dark theme
//   plate-light  the same relief as cool pewter for the light theme, held between luminance 0.75 and 0.92 so muted text keeps 5:1 on it
// A +-1 level dither is added before encoding. It prints both plates' luminance range and file sizes. The look `forged` is the site's; `agate` and
// `titanium` are the round 4 alternatives it was chosen over.
// The light itself is not drawn here: styles/backdrop.css brightens the plate under soft windows with a backdrop filter.
import { mkdirSync, writeFileSync, statSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { deflateSync } from 'node:zlib';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const argv = process.argv.slice(2);
const arg = (name, dflt) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : dflt;
};
const LOOK = arg('look', 'forged');
const OUT = arg('out', join(ROOT, 'apps/web/src/assets/field'));
const W = Number(arg('w', 2160));
const H = Number(arg('h', 3600));
const Q = Number(arg('q', 60));
const AQ = Number(arg('aq', 40));

// ---------- noise ----------
function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Classic gradient noise, about -1..1. */
function perlin(seed) {
  const r = rng(seed);
  const p = new Uint8Array(512);
  const base = Array.from({ length: 256 }, (_, i) => i);
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [base[i], base[j]] = [base[j], base[i]];
  }
  for (let i = 0; i < 512; i++) p[i] = base[i & 255];
  const GX = new Float64Array(16);
  const GY = new Float64Array(16);
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2 + 0.2;
    GX[i] = Math.cos(a);
    GY[i] = Math.sin(a);
  }
  const fade = (t) => t * t * t * (t * (t * 6 - 15) + 10);
  return (x, y) => {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const xf = x - xi;
    const yf = y - yi;
    const X = xi & 255;
    const Y = yi & 255;
    const g = (h, dx, dy) => GX[h & 15] * dx + GY[h & 15] * dy;
    const aa = p[p[X] + Y];
    const ab = p[p[X] + Y + 1];
    const ba = p[p[X + 1] + Y];
    const bb = p[p[X + 1] + Y + 1];
    const u = fade(xf);
    const v = fade(yf);
    const x1 = g(aa, xf, yf) + u * (g(ba, xf - 1, yf) - g(aa, xf, yf));
    const x2 = g(ab, xf, yf - 1) + u * (g(bb, xf - 1, yf - 1) - g(ab, xf, yf - 1));
    return (x1 + v * (x2 - x1)) * 1.42;
  };
}

const N1 = perlin(11);
const N2 = perlin(23);
const N3 = perlin(37);
const N4 = perlin(41);

// Each octave is rotated a little so the lattice never shows.
const ROT_C = Math.cos(0.6);
const ROT_S = Math.sin(0.6);
function fbm(n, x, y, oct = 6, gain = 0.5) {
  let a = 0.5;
  let s = 0;
  let norm = 0;
  for (let i = 0; i < oct; i++) {
    s += a * n(x, y);
    norm += a;
    const nx = (x * ROT_C - y * ROT_S) * 2.02 + 3.1;
    y = (x * ROT_S + y * ROT_C) * 2.02 + 1.7;
    x = nx;
    a *= gain;
  }
  return s / norm;
}

/** Brushed grain: noise stretched along x (the brushing direction), no octave rotation so the streaks stay level. 0..1. */
function brushed(x, y) {
  // Two octaves only: a third (a 1.5 px period at 2160 wide) was sub-pixel hair that no encoder keeps and that cost most of the file.
  const a = N3(x * 3, y * 90) * 0.65 + N3(x * 7 + 11, y * 210 + 5) * 0.35;
  return 0.5 + 0.5 * a;
}

/** Ridged multifractal (Musgrave): sharp crests that branch, 0..1. */
function ridged(n, x, y, oct = 6, feed = 1.8) {
  let s = 0;
  let w = 1;
  let a = 0.5;
  let norm = 0;
  for (let i = 0; i < oct; i++) {
    let v = 1 - Math.abs(n(x, y));
    v *= v;
    v *= w;
    w = Math.min(1, Math.max(0, v * feed));
    s += v * a;
    norm += a;
    const nx = (x * ROT_C - y * ROT_S) * 2.05 + 5.3;
    y = (x * ROT_S + y * ROT_C) * 2.05 + 2.9;
    x = nx;
    a *= 0.55;
  }
  return s / norm;
}

const clamp = (v, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
const smooth = (a, b, v) => {
  const t = clamp((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const mix = (a, b, t) => a + (b - a) * t;

// ---------- the height field and the tint parameters, per look ----------
// u, v: plate coordinates scaled by the width (v runs 0..H/W). yf: 0..1 down the plate. Returns [height, detail, vein].
const FEED = Number(arg('feed', 2.4));
const FINE = Number(arg('fine', 0.16));
const SPREAD = Number(arg('spread', 0.24));
const TINT = Number(arg('tint', 0.26));
const DITHER = Number(arg('dither', 2));
const SPEC = Number(arg('spec', 0.1));
const ENVK = Number(arg('env', 0.04));
const LOOKS = {
  // Forged steel: a twice domain-warped fBm body, cut by ridged-multifractal veins that branch down to a few pixels, with a fine grain along the
  // forging direction. The fourth value is the heat-tint field (the thickness of the oxide film), warped the same way so colour follows the relief.
  forged(u, v) {
    const px = u * 3.2;
    const py = v * 3.2;
    const qx = fbm(N1, px * 0.55, py * 0.55, 5);
    const qy = fbm(N2, px * 0.55 + 5.2, py * 0.55 + 1.3, 5);
    const rx = fbm(N3, px + 2.4 * qx + 1.7, py + 2.4 * qy + 9.2, 4);
    const ry = fbm(N1, px + 2.4 * qx + 8.3, py + 2.4 * qy + 2.8, 4);
    const f = fbm(N2, px + 1.6 * rx, py + 1.6 * ry, 8);
    // The big veins, ridged down to a few pixels (8 octaves, a gentler weight feedback so the small branches survive), and a second, finer ridged
    // network at about 4x, warped by the same field, so smaller veins branch off between the big ones: detail at every scale.
    const vein = ridged(N4, px * 1.15 + 1.2 * rx + 7.1, py * 1.15 + 1.2 * ry + 3.3, 8, FEED);
    const fine = ridged(N1, px * 4.4 + 2.2 * rx + 3.3, py * 4.4 + 2.2 * ry + 8.1, 6, FEED);
    const v3 = vein * vein * vein;
    const f3 = fine * fine * fine;
    const grain = brushed(px + 0.25 * qx, py + 0.25 * qy);
    const film = fbm(N4, px * 0.45 + 1.1 * qx + 0.6 * rx, py * 0.45 + 1.1 * qy + 0.6 * ry, 5);
    return [0.3 * f + 0.5 * v3 + FINE * f3 + 0.012 * grain, grain, Math.max(v3, 0.6 * f3), film];
  },
  // A polished mineral cross-section: agate bands following a twice-warped fBm, cut through by fine veins.
  agate(u, v) {
    const px = u * 2.0;
    const py = v * 2.0;
    const qx = fbm(N1, px, py, 5);
    const qy = fbm(N2, px + 5.2, py + 1.3, 5);
    const rx = fbm(N3, px + 4 * qx + 1.7, py + 4 * qy + 9.2, 5);
    const ry = fbm(N1, px + 4 * qx + 8.3, py + 4 * qy + 2.8, 5);
    const f = fbm(N2, px + 3.5 * rx, py + 3.5 * ry, 6);
    const band = 0.5 + 0.5 * Math.sin(f * 26 + 4 * Math.hypot(rx, ry));
    const vein = Math.pow(ridged(N4, px * 1.7 + 1.5 * rx, py * 1.7 + 1.5 * ry, 6), 5);
    return [0.5 * f + 0.05 * band + 0.3 * vein, band, vein, f];
  },
  // Brushed titanium with heat tint: fine streaks along the grain over a soft hammered relief; the tint follows a warped field.
  titanium(u, v) {
    const px = u * 2.0;
    const py = v * 2.0;
    const qx = fbm(N1, px * 0.6, py * 0.6, 4);
    const qy = fbm(N2, px * 0.6 + 3.1, py * 0.6 + 7.7, 4);
    const f = fbm(N3, px + 2.2 * qx, py + 2.2 * qy, 6);
    const streak = fbm(N4, px * 1.5, py * 160, 3) * 0.6 + fbm(N4, px * 4 + 9, py * 420, 2) * 0.4;
    const dents = ridged(N1, px * 3 + 2 * qx, py * 3 + 2 * qy, 4);
    return [0.3 * f + 0.05 * streak + 0.1 * Math.pow(dents, 2), 0.5 + 0.5 * streak, Math.pow(dents, 4), f];
  },
};

// ---------- tint, in linear light ----------
const lin = (c) => {
  c /= 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
};
const srgb = (l) => {
  l = clamp(l);
  return 255 * (l <= 0.0031308 ? l * 12.92 : 1.055 * Math.pow(l, 1 / 2.4) - 0.055);
};
const hex = (h) => [lin(parseInt(h.slice(1, 3), 16)), lin(parseInt(h.slice(3, 5), 16)), lin(parseInt(h.slice(5, 7), 16))];

// The heat tint: a cyclic palette of the three metals with near-black between them, so a change of hue always passes through black (navy and oxblood
// never meet as purple). Where on the cycle a point sits: the plate's position (navy at the top, oxblood in the middle, bottle green at the end) plus
// the film field, so each zone is mostly its own colour with fractal islands of black and, rarely, of its neighbours.
// Each hue holds a plateau (so each third of the plate reads as its own colour at normal brightness) and the hues meet only through a short step of
// near-black. Body: the albedo of the tinted film; sheen: the colour its highlights take.
const NAVY = [hex('#12224f'), hex('#86a2e6')];
const OX = [hex('#4f1219'), hex('#de877c')];
const GREEN = [hex('#0f3b24'), hex('#7fd0a8')];
const BLK = [hex('#08090c'), hex('#8f96a8')];
// Light theme: pewter. A cool base (about #e3e6ea), the relief at about twice the old contrast so the veins read as fine raised lines, and less of the
// brushed grain (that is what read as paper).
const PEWTER = [0.935, 0.962, 1.0];
const LS = { base: 0.95, key: 0.1, spec: 0.08, env: 0.16, grain: 0.015, vein: 0.07 };
const DARK = {
  stops: [
    [0.0, ...NAVY],
    [0.085, ...NAVY],
    [0.167, ...BLK],
    [0.25, ...OX],
    [0.415, ...OX],
    [0.5, ...BLK],
    [0.583, ...GREEN],
    [0.75, ...GREEN],
    [0.833, ...BLK],
    [0.915, ...NAVY],
    [1.0, ...NAVY],
  ],
  black: hex('#07080a'),
  rim: hex('#8aa4d8'), // the cool rim on the slopes
};

function heat(h) {
  h -= Math.floor(h);
  const st = DARK.stops;
  let k = 0;
  while (k < st.length - 2 && h > st[k + 1][0]) k++;
  const t = smooth(0, 1, (h - st[k][0]) / (st[k + 1][0] - st[k][0]));
  return [0, 1].map((j) => [0, 1, 2].map((c) => mix(st[k][j + 1][c], st[k + 1][j + 1][c], t)));
}

// ---------- render ----------
// The plate wraps around left to right (the site repeats it on screens wider than the plate): the last SEAM of every row is cross-faded with the noise
// one plate-width to the left, before shading, so the relief itself is continuous across the join.
const SEAM = 0.18;

function fields() {
  const look = LOOKS[LOOK];
  if (!look) throw new Error(`unknown look ${LOOK}`);
  const n = W * H;
  const f = { hgt: new Float32Array(n), det: new Float32Array(n), vein: new Float32Array(n), fld: new Float32Array(n) };
  const keys = ['hgt', 'det', 'vein', 'fld'];
  const s0 = Math.floor(W * (1 - SEAM));
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = y * W + x;
      let r = look(x / W, y / W);
      if (x >= s0) {
        const t = smooth(0, 1, (x - s0) / (W - s0));
        const r2 = look((x - W) / W, y / W);
        r = r.map((v, k) => mix(v, r2[k], t));
      }
      for (let k = 0; k < 4; k++) f[keys[k]][i] = r[k];
    }
  }
  return f;
}

function render() {
  const t0 = Date.now();
  const { hgt, det, vein, fld } = fields();
  const tNoise = Date.now() - t0;
  const n = W * H;
  // Normals from the height field (central differences, wrapping in x), shallow: metal, not rock.
  const K = Number(arg('relief', 7)) * (W / 900);
  const plateD = new Uint8Array(n * 3);
  const plateL = new Uint8Array(n * 3);
  const L1 = norm3([-0.55, -0.75, 0.55]); // key light, grazing from the top left
  const H1 = norm3([L1[0], L1[1], L1[2] + 1]);
  const dither = rng(5);
  const lum = (c) => 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  const statsD = [];
  const statsL = [];
  const ENV = perlin(53);

  for (let y = 0; y < H; y++) {
    const yf = y / (H - 1);
    for (let x = 0; x < W; x++) {
      const i = y * W + x;
      const xl = y * W + ((x - 1 + W) % W);
      const xr = y * W + ((x + 1) % W);
      const yu = y > 0 ? i - W : i;
      const yd = y < H - 1 ? i + W : i;
      const dx = (hgt[xr] - hgt[xl]) * K;
      const dy = (hgt[yd] - hgt[yu]) * K;
      const N = norm3([-dx, -dy, 1]);
      const ndl = Math.max(0, dot(N, L1));
      const ndh = Math.max(0, dot(N, H1));
      const nz = N[2];

      // Which metal: where the point sits on the heat-tint cycle.
      const [body, sheen] = heat(yf * 0.667 - 0.02 + SPREAD * fld[i] + 0.02 * vein[i]);
      // Albedo: gunmetal, the tint strongest where the film is thick and on the veins.
      const tintAmt = clamp(0.45 + 0.35 * smooth(-0.3, 0.4, fld[i]) + 0.25 * vein[i]);
      const alb = [0, 1, 2].map((c) => mix(DARK.black[c], body[c], TINT * tintAmt));
      // Polished metal mirrors its surroundings: a soft, large-scale reflection (a far window) bent by the relief's normals.
      const ex = x / W + N[0] * 0.22;
      const ey = y / W + N[1] * 0.22;
      const env = smooth(-0.2, 0.5, fbm(ENV, ex * 1.2 - ey * 0.35, ey * 0.75 + ex * 0.2, 4));
      // Anisotropic sheen: the grain (det) breaks the highlight into streaks.
      const aniso = 0.55 + 0.9 * det[i] * det[i];
      const spec = Math.pow(ndh, 70) * aniso;
      const rim = Math.pow(1 - nz, 1.5); // the slopes catch a cool rim
      const amb = 0.32 + 0.8 * ndl;
      const dk = [0, 1, 2].map(
        (c) =>
          alb[c] * amb * 1.1 +
          sheen[c] * (spec * SPEC + env * env * ENVK * (0.35 + tintAmt)) +
          DARK.rim[c] * rim * 0.012 +
          sheen[c] * vein[i] * 0.006,
      );
      const dd = (dither() - 0.5) * DITHER;
      for (let c = 0; c < 3; c++) plateD[i * 3 + c] = clamp(Math.round(srgb(dk[c]) + dd), 0, 255);
      statsD.push(lum(dk));

      // Light theme: pale pewter with the same relief and reflection; the zone's colour is a faint cast in the folds. Luminance is held between
      // LMIN and LMAX so the muted text (#5f5d58) stays at 5.0:1 or better anywhere on it.
      const shade =
        LS.base +
        LS.key * (ndl - 0.55) +
        LS.spec * Math.pow(ndh, 30) * aniso +
        LS.env * (env - 0.45) +
        LS.grain * (det[i] - 0.5) -
        LS.vein * vein[i] -
        0.02 * smooth(-0.3, 0.5, fld[i]);
      const cast = 0.1 * tintAmt;
      const lc = [0, 1, 2].map((c) => shade * mix(1, 0.55 + body[c] * 5, cast) * PEWTER[c]);
      const ll = lum(lc);
      const LMIN = 0.75;
      const LMAX = 0.92;
      const fix = ll < LMIN ? LMIN / ll : ll > LMAX ? LMAX / ll : 1;
      for (let c = 0; c < 3; c++) plateL[i * 3 + c] = clamp(Math.round(srgb(lc[c] * fix) + dd), 0, 255);
      statsL.push(ll * fix);
    }
  }
  return { plateD, plateL, tNoise, statsD, statsL };
}

function dot(a, b) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}
function norm3(v) {
  const l = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / l, v[1] / l, v[2] / l];
}

// ---------- PNG (node:zlib) ----------
const CRC = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC[(c ^ buf[i]) & 255] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}
function png(pixels, w, h, channels) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8;
  ihdr[9] = channels === 4 ? 6 : 2;
  const stride = w * channels;
  const raw = Buffer.alloc((stride + 1) * h);
  for (let y = 0; y < h; y++) {
    raw[y * (stride + 1)] = 1; // Sub filter
    for (let x = 0; x < stride; x++) {
      const cur = pixels[y * stride + x];
      const left = x >= channels ? pixels[y * stride + x - channels] : 0;
      raw[y * (stride + 1) + 1 + x] = (cur - left) & 255;
    }
  }
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))]);
}

// ---------- WebP, when sharp is around ----------
async function loadSharp() {
  const req = createRequire(join(ROOT, 'package.json'));
  for (const p of ['sharp', join(ROOT, 'node_modules/.pnpm/node_modules/sharp')]) {
    try {
      return req(p);
    } catch {}
  }
  return null;
}

const t0 = Date.now();
const { plateD, plateL, tNoise, statsD, statsL } = render();
const pct = (a, q) => a[Math.min(a.length - 1, Math.floor(a.length * q))];
for (const [name, st] of [['dark', statsD], ['light', statsL]]) {
  const a = Float64Array.from(st).sort();
  console.log(`${name} relative luminance: min ${a[0].toFixed(4)}  p50 ${pct(a, 0.5).toFixed(4)}  p99 ${pct(a, 0.99).toFixed(4)}  max ${a[a.length - 1].toFixed(4)}`);
}
mkdirSync(OUT, { recursive: true });
const files = [
  ['plate-dark', plateD, 3],
  ['plate-light', plateL, 3],
];
const sharp = await loadSharp();
const keepPng = argv.includes('--png') || !sharp;
for (const [name, px, ch] of files) {
  const buf = png(px, W, H, ch);
  if (keepPng) writeFileSync(join(OUT, `${name}.png`), buf);
  if (sharp) {
    // AVIF is what the site loads (Backdrop.tsx); WebP is the fallback for a browser that cannot decode AVIF. At this detail AVIF keeps more of the
    // fine veins for less: dark plate about 120 kB AVIF against 148 kB WebP at q60 (q90 WebP would be 580 kB).
    const avif = join(OUT, `${name}.avif`);
    await sharp(buf).avif({ quality: AQ, effort: 6, chromaSubsampling: '4:2:0' }).toFile(avif);
    const file = join(OUT, `${name}.webp`);
    await sharp(buf)
      .webp({ quality: Q, effort: 6, smartSubsample: true })
      .toFile(file);
    console.log(`${name}.avif  ${(statSync(avif).size / 1024).toFixed(1)} kB   ${name}.webp  ${(statSync(file).size / 1024).toFixed(1)} kB`);
  } else {
    console.log(`${name}.png  ${(buf.length / 1024).toFixed(1)} kB  (no sharp: PNG only)`);
  }
}
console.log(`${LOOK} ${W}x${H}: noise ${tNoise} ms, total ${Date.now() - t0} ms -> ${OUT}`);
