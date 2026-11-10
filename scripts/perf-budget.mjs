#!/usr/bin/env node
// The front-end size budget. Run after a build:  pnpm perf:budget  [dist directory]  [--kit]
//
// It reads <dist>/assets/*.js (default apps/web/dist) and fails (exit 1) when
//   1. the entry chunk (the index-*.js that index.html loads) is over ENTRY_MAX,
//   2. the first download (the entry plus every file index.html preloads) is over INITIAL_MAX,
//   3. any other single chunk is over CHUNK_MAX (the vendor-* files are exempt: they are libraries, split out on purpose; admin is not exempt),
//   4. an admin-* file is in the first download (the admin is one lazy chunk, V2-SPEC 3.6),
//   5. the service worker's precache list names an admin file (the admin is never precached),
//   6. "__kit" appears anywhere in the build (the component kit exists only in a VITE_KIT=1 build; pass --kit to check such a build).
// It also prints the street chunks (street-far, street-full) raw and gzip, as visual §3.3 asks.
// Raise a budget only on purpose, in the same change that explains why.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { dirname, isAbsolute, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const kit = args.includes('--kit');
const distArg = args.find((a) => !a.startsWith('--'));
const dist = distArg ? (isAbsolute(distArg) ? distArg : resolve(process.cwd(), distArg)) : join(root, 'apps/web/dist');
const dir = join(dist, 'assets');

const ENTRY_MAX = 480_000; // bytes, raw
const INITIAL_MAX = 1_500_000; // bytes, raw
const CHUNK_MAX = 400_000; // bytes, raw

let files;
try {
  files = readdirSync(dir).filter((f) => f.endsWith('.js'));
} catch {
  console.error(`No build found in ${dist}. Run \`pnpm build\` first, or pass the dist directory.`);
  process.exit(2);
}

console.log(`Budget for ${relative(process.cwd(), dist) || '.'}${kit ? ' (kit build)' : ''}`);

const rows = files.map((f) => {
  const buf = readFileSync(join(dir, f));
  return { file: f, raw: statSync(join(dir, f)).size, gzip: gzipSync(buf).length };
});

// What index.html loads at once: the entry script and its modulepreload links.
const html = readFileSync(join(dist, 'index.html'), 'utf8');
const initial = new Set([...html.matchAll(/(?:src|href)="\/assets\/([^"]+\.js)"/g)].map((m) => m[1]));
const entry = [...initial].find((f) => /^index-/.test(f));

const kb = (n) => `${(n / 1000).toFixed(1)} kB`.padStart(11);
console.log('\nchunk'.padEnd(34) + 'raw'.padStart(11) + 'gzip'.padStart(11) + '  first download');
for (const r of rows.sort((a, b) => b.raw - a.raw).slice(0, 16)) {
  console.log(`${r.file}`.padEnd(33) + kb(r.raw) + kb(r.gzip) + (initial.has(r.file) ? '  yes' : ''));
}
if (rows.length > 16) console.log(`... and ${rows.length - 16} smaller chunks`);

const sum = (list, key) => list.reduce((n, r) => n + r[key], 0);
const first = rows.filter((r) => initial.has(r.file));
const failures = [];

const entryRow = rows.find((r) => r.file === entry);
if (!entryRow) failures.push('Could not find the entry chunk in dist/index.html.');
else if (entryRow.raw > ENTRY_MAX) failures.push(`Entry chunk ${entry} is ${kb(entryRow.raw).trim()} (budget ${kb(ENTRY_MAX).trim()}).`);

console.log(`\nentry      ${kb(entryRow?.raw ?? 0)} raw, ${kb(entryRow?.gzip ?? 0)} gzip   (budget ${kb(ENTRY_MAX).trim()})`);
console.log(`first load ${kb(sum(first, 'raw'))} raw, ${kb(sum(first, 'gzip'))} gzip   (budget ${kb(INITIAL_MAX).trim()}, ${first.length} files)`);
console.log(`all chunks ${kb(sum(rows, 'raw'))} raw, ${kb(sum(rows, 'gzip'))} gzip   (${rows.length} files, downloaded as they are opened and kept for offline)`);

if (sum(first, 'raw') > INITIAL_MAX) failures.push(`First download is ${kb(sum(first, 'raw')).trim()} (budget ${kb(INITIAL_MAX).trim()}).`);
for (const r of rows) {
  if (r.file === entry || r.file.startsWith('vendor-')) continue;
  if (r.raw > CHUNK_MAX) failures.push(`${r.file} is ${kb(r.raw).trim()} (one chunk may be at most ${kb(CHUNK_MAX).trim()}).`);
}

// 4. The admin never rides with the first download: no admin-* script or stylesheet in index.html.
const firstAll = [...html.matchAll(/(?:src|href)="\/assets\/([^"]+)"/g)].map((m) => m[1]);
for (const f of firstAll) if (/^admin-/.test(f)) failures.push(`${f} is in the first download; the admin must stay a lazy chunk.`);

// The admin chunk, reported (it is held to CHUNK_MAX above like any page).
const admin = rows.filter((r) => r.file.startsWith('admin-'));
if (admin.length) console.log(`admin      ${kb(sum(admin, 'raw'))} raw, ${kb(sum(admin, 'gzip'))} gzip   (${admin.map((r) => r.file).join(', ')})`);
else console.log('admin      no admin-* chunk found (expected one once the admin is built)');

// 5. The service worker's precache list. The navigation route's own "/admin" exclusion is code, not an entry, so only the manifest is read.
let sw = null;
try {
  sw = readFileSync(join(dist, 'sw.js'), 'utf8');
} catch {
  console.log('sw.js      not found (no service worker in this build)');
}
if (sw !== null) {
  const urls = [...sw.matchAll(/\burl\s*:\s*"([^"]+)"/g)].map((m) => m[1]);
  const adminUrls = urls.filter((u) => /(^|\/)admin[-./]/.test(u));
  console.log(`sw.js      ${urls.length} precached files${adminUrls.length ? `, ${adminUrls.length} admin` : ', none admin'}`);
  for (const u of adminUrls) failures.push(`sw.js precaches ${u}; the admin must never be precached.`);
  if (urls.length === 0) failures.push('sw.js has no precache list that this script can read; check the Workbox output.');
}

// 6. No component kit in a normal build.
if (!kit) {
  const walk = (d) => readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(join(d, e.name)) : [join(d, e.name)]));
  const hits = walk(dist).filter((p) => /\.(js|html|css|webmanifest|json)$/.test(p) && readFileSync(p, 'utf8').includes('__kit'));
  for (const p of hits) failures.push(`${relative(dist, p)} mentions __kit; the component kit must exist only in a VITE_KIT=1 build.`);
}

// The street, reported (visual §3.3: street-far about 3.5 kB gzip with its CSS; the full scene about 10 kB gzip more).
const cssDir = readdirSync(dir).filter((f) => f.endsWith('.css'));
const css = cssDir.map((f) => {
  const buf = readFileSync(join(dir, f));
  return { file: f, raw: buf.length, gzip: gzipSync(buf).length };
});
// The street's two paint sheets are shared with How we work's vignettes, so they keep their own names: paint-* loads with the skyline (street-far),
// paint-full-* with the rest of the drawing (street-full).
const street = [...rows, ...css].filter((r) => /^(street-|paint-)/.test(r.file));
if (street.length) {
  console.log('\nstreet chunks');
  for (const r of street) console.log(`  ${r.file}`.padEnd(33) + kb(r.raw) + kb(r.gzip));
  const far = street.filter((r) => r.file.startsWith('street-far') || /^paint-(?!full)/.test(r.file));
  const full = street.filter((r) => r.file.startsWith('street-full') || r.file.startsWith('paint-full'));
  console.log(`  street-far  ${kb(sum(far, 'gzip')).trim()} gzip (with its CSS)   street-full ${kb(sum(full, 'gzip')).trim()} gzip`);
} else {
  console.log('\nstreet chunks: none found (street-far-*, street-full-*)');
}

if (failures.length) {
  console.error('\nOver budget or out of bounds:');
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}
console.log('\nWithin budget.');
