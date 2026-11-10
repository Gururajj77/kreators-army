#!/usr/bin/env node
// Manages the video library and reads enquiries through the admin API (the same API the /admin screens use).
//
//   pnpm video add --mega <MEGA link or embed code> --title "..." [--brand "..."] [--instagram <url>] [--youtube <url>]
//                  [--category --platform --views 1.2M --aspect vertical|landscape --featured true|false --poster <https image>]
//                  [--draft]                         publishes by default; --draft keeps it hidden
//   pnpm video update <id> [--mega <link>|none] [--instagram <url>|none] [--youtube <url>|none] [any add option] [--published true|false]
//   pnpm video check <MEGA link>                    name, size, resolution, bitrate, length, grade, warnings
//   pnpm video list [--drafts | --bin]
//   pnpm video remove <id>                          to the bin;  pnpm video remove <id> --forever  (only from the bin)
//   pnpm video restore <id>
//   pnpm video import <file> [--yes] [--brand "..."]   pnpm video import --undo <importId>
//   pnpm leads [--status new|contacted|archived|all] [--kind trial|question] [--csv]
//
// --url still works as an alias (a MEGA link, a YouTube link or a /media/ path; wave.video can no longer be added).
// Local by default (the key comes from apps/api/.dev.vars). For the live site:
//   KREATORS_API=https://your-domain ADMIN_KEY=your-key pnpm video list
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { createInterface } from 'node:readline/promises';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const API = (process.env.KREATORS_API ?? 'http://localhost:8797').replace(/\/$/, '');

function localKey() {
  try {
    return /^ADMIN_KEY=(.*)$/m.exec(readFileSync(join(root, 'apps/api/.dev.vars'), 'utf8'))?.[1]?.trim();
  } catch {
    return undefined;
  }
}

const KEY = process.env.ADMIN_KEY ?? localKey();

function stop(message) {
  console.error(message);
  process.exit(1);
}

const USAGE = readFileSync(fileURLToPath(import.meta.url), 'utf8')
  .split('\n')
  .filter((l) => l.startsWith('//'))
  .slice(1, 17)
  .map((l) => l.slice(3))
  .join('\n');

const TEXT = ['url', 'mega', 'instagram', 'youtube', 'title', 'brand', 'category', 'platform', 'views', 'poster', 'aspect', 'order', 'featured', 'published', 'status', 'kind', 'undo'];
const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    ...Object.fromEntries(TEXT.map((k) => [k, { type: 'string' }])),
    draft: { type: 'boolean' },
    drafts: { type: 'boolean' },
    bin: { type: 'boolean' },
    forever: { type: 'boolean' },
    yes: { type: 'boolean' },
    csv: { type: 'boolean' },
  },
});

/** Same rules as packages/shared parseViews: "1.2M", "120K", "1,20,000", "1.5 lakh", "2 cr", plain digits. */
function parseViews(value) {
  const s = String(value).trim().toLowerCase().replace(/views?$/, '').trim();
  const m = /^(\d+(?:[.,]\d+)*)\s*(k|m|l|lakhs?|lac|cr|crores?)?$/.exec(s);
  if (!m) return undefined;
  const unit = { k: 1e3, m: 1e6, l: 1e5, lakh: 1e5, lakhs: 1e5, lac: 1e5, cr: 1e7, crore: 1e7, crores: 1e7 }[m[2]] ?? 1;
  const n = unit === 1 ? Number(m[1].replace(/[.,]/g, '')) : Number(m[1].replace(/,/g, ''));
  return Number.isFinite(n) ? Math.round(n * unit) : undefined;
}

/** The body for add and update. "none" clears a link. */
function body() {
  const out = {};
  const copy = { url: 'url', title: 'title', brand: 'brand', category: 'category', platform: 'platform', poster: 'posterUrl', aspect: 'aspect' };
  for (const [flag, key] of Object.entries(copy)) if (values[flag] !== undefined) out[key] = values[flag];
  for (const flag of ['mega', 'instagram', 'youtube']) if (values[flag] !== undefined) out[flag] = values[flag] === 'none' ? null : values[flag];
  if (values.poster === 'none') out.posterUrl = null;
  if (values.views !== undefined) {
    const n = parseViews(values.views);
    if (n === undefined) stop('--views must be a number such as 120000, 120K, 1.2M or 1,20,000');
    out.views = n;
  }
  if (values.order !== undefined) {
    const n = Number(values.order);
    if (!Number.isInteger(n)) stop('--order must be a whole number');
    out.sortOrder = n;
  }
  for (const flag of ['featured', 'published']) {
    if (values[flag] === undefined) continue;
    if (values[flag] !== 'true' && values[flag] !== 'false') stop(`--${flag} must be true or false`);
    out[flag] = values[flag] === 'true';
  }
  return out;
}

async function call(method, path, data, { raw = false } = {}) {
  if (!KEY) stop('No admin key. Copy apps/api/.dev.vars.example to apps/api/.dev.vars, or set ADMIN_KEY.');
  let res;
  try {
    res = await fetch(`${API}/api/admin${path}`, {
      method,
      headers: { Authorization: `Bearer ${KEY}`, ...(data ? { 'Content-Type': 'application/json' } : {}) },
      ...(data ? { body: JSON.stringify(data) } : {}),
    });
  } catch {
    stop(`Could not reach ${API}. Is the API running? (pnpm dev)`);
  }
  if (raw && res.ok) return res;
  const answer = res.status === 204 ? {} : await res.json().catch(() => null);
  if (!res.ok) {
    if (res.status === 429) stop(`Too many failed keys from this address. Try again in ${Math.max(1, Math.ceil((answer?.retryAfter ?? 60) / 60))} min.`);
    const problems = answer?.problems?.length ? ` (${answer.problems.join(', ')})` : '';
    stop(`Refused (${res.status}${answer?.code ? ` ${answer.code}` : ''}): ${answer?.error ?? 'unknown error'}${problems}`);
  }
  return answer;
}

const mb = (n) => `${Math.round(n / 1e6)} MB`;
const res = (m) => {
  if (!m?.width || !m?.height) return '?';
  const s = Math.min(m.width, m.height);
  return s >= 2160 ? '4K' : s >= 1440 ? '1440p' : s >= 1080 ? '1080p' : s >= 720 ? '720p' : s >= 480 ? '480p' : `${s}p`;
};
const streamCol = (v) => {
  if (v.source !== 'mega') return v.source;
  if (!v.mega?.meta) return v.mega?.keyIn === 'secret' ? 'mega (key in old secret)' : 'mega ?';
  return `mega ${res(v.mega.meta)}${v.mega.grade === 'heavy' || v.mega.grade === 'too-heavy' ? '!' : ''}`;
};
const printVideo = (v) =>
  console.log(`${v.id}  ${v.deletedAt ? 'bin  ' : v.published ? 'live ' : 'draft'}  ${streamCol(v).padEnd(10)}  ${String(v.views).padStart(9)}  ${v.brand || '(no brand)'}: ${v.title}${v.problems?.length ? `  [${v.problems.join(', ')}]` : ''}`);
const printWarnings = (warnings) => warnings?.forEach((w) => console.log(`  ! ${w.message}`));

function statusOf(check) {
  if (!check.ok) return ['busy', 'over-quota', 'upstream'].includes(check.problem) ? 'busy' : check.problem === 'not-video' ? 'not-video' : 'unreachable';
  if (!check.playable) return 'unplayable';
  return { ready: 'ready', heavy: 'heavy', 'too-heavy': 'too-heavy' }[check.grade] ?? 'unknown-quality';
}
const TICKED = new Set(['ready', 'heavy', 'too-heavy', 'unknown-quality']);

const [command, id] = positionals;
switch (command) {
  case 'add': {
    const data = { ...body(), published: !values.draft };
    const { video, warnings } = await call('POST', '/videos', data);
    console.log(video.published ? 'Added and published:' : 'Added as a draft:');
    printVideo(video);
    printWarnings(warnings);
    break;
  }
  case 'update': {
    if (!id) stop('Which video? pnpm video update <id> --views 12000');
    const { video, warnings } = await call('PATCH', `/videos/${encodeURIComponent(id)}`, body());
    console.log('Updated:');
    printVideo(video);
    printWarnings(warnings);
    break;
  }
  case 'check': {
    if (!id) stop('Which link? pnpm video check <MEGA link>');
    const r = await call('POST', '/mega/inspect', { link: id, refresh: true });
    if (!r.ok) stop(`${r.problem}: ${r.message}`);
    const m = r.meta;
    console.log(`${m.name ?? '(no name)'}\n  ${mb(m.size)}, ${m.width ?? '?'}x${m.height ?? '?'} (${res(m)}), ${m.bitrate ? (m.bitrate / 1e6).toFixed(1) : '?'} Mbps, ${m.durationMs ? (m.durationMs / 1000).toFixed(1) : '?'} s, ${m.codec ?? '?'}, ${m.fastStart ? 'fast start' : 'index at the end'}`);
    console.log(`  grade: ${r.grade}${r.playable ? '' : ' (cannot be published as it is)'}${r.previewOk ? ', previews on hover' : ''}`);
    printWarnings(r.warnings);
    if (r.duplicate) console.log(`  already in the library: ${r.duplicate.id} "${r.duplicate.title}"${r.duplicate.inBin ? ' (in the bin)' : ''}`);
    break;
  }
  case 'list': {
    const { videos, legacySecretCount, binCount } = await call('GET', `/videos${values.bin ? '?bin=1' : ''}`);
    const shown = values.drafts ? videos.filter((v) => !v.published) : videos;
    shown.forEach(printVideo);
    console.log(`\n${shown.length} videos${binCount && !values.bin ? `, ${binCount} in the bin` : ''}`);
    if (legacySecretCount) console.log(`${legacySecretCount} video(s) still stream from the old MEGA_LINKS secret: use "Move it into the library" in /admin.`);
    break;
  }
  case 'remove': {
    if (!id) stop('Which video? pnpm video remove <id>');
    if (values.forever) {
      await call('DELETE', `/videos/${encodeURIComponent(id)}?purge=1`);
      console.log('Deleted for good.');
    } else {
      await call('DELETE', `/videos/${encodeURIComponent(id)}`);
      console.log(`Moved to the bin (kept for 30 days). Undo: pnpm video restore ${id}`);
    }
    break;
  }
  case 'restore': {
    if (!id) stop('Which video? pnpm video restore <id>');
    const { video } = await call('POST', `/videos/${encodeURIComponent(id)}/restore`, {});
    console.log('Restored as a draft:');
    printVideo(video);
    break;
  }
  case 'import': {
    if (values.undo) {
      const r = await call('POST', `/import/${encodeURIComponent(values.undo)}/undo`);
      console.log(`${r.binned} drafts moved to the bin; ${r.kept} published videos kept.`);
      break;
    }
    if (!id) stop('Which file? pnpm video import <file>');
    let text;
    try {
      text = readFileSync(id, 'utf8');
    } catch {
      stop(`Could not read ${id}`);
    }
    if (/\.xlsx?$/i.test(id)) stop('Save the sheet as CSV first (File → Download → CSV), then import that file.');
    const preview = await call('POST', '/import/dry-run', { text, fileName: id.split('/').pop() });
    const rows = preview.rows;
    const queue = rows.filter((r) => r.status === 'checking');
    const line = (r) =>
      console.log(
        `${r.rowId.padEnd(5)} ${r.status.padEnd(15)} ${r.check?.ok ? `${res(r.check.meta).padEnd(5)} ${((r.check.meta.bitrate ?? 0) / 1e6).toFixed(1).padStart(4)} Mbps ${mb(r.check.meta.size).padStart(7)}` : ''.padEnd(25)}  "${r.title || r.fileName || ''}"  ${r.instagram ? 'IG ' : ''}${r.youtube ? 'YT' : ''}`,
      );
    rows.filter((r) => r.status !== 'checking').forEach(line);
    // Two at a time (the admin page uses three): each check is a few MEGA requests.
    for (let i = 0; i < queue.length; i += 2) {
      await Promise.all(
        queue.slice(i, i + 2).map(async (r) => {
          r.check = await call('POST', '/mega/inspect', { link: r.mega });
          r.status = statusOf(r.check);
          if (r.check.ok && !r.title) r.title = r.check.suggestedTitle;
          if (r.check.ok) r.aspect ??= r.check.suggestedAspect;
          line(r);
        }),
      );
    }
    const counts = {};
    for (const r of rows) counts[r.status] = (counts[r.status] ?? 0) + 1;
    console.log(`\n${rows.length} rows: ${Object.entries(counts).map(([k, n]) => `${n} ${k}`).join(', ')}`);
    for (const ig of preview.ignored) console.log(`  ignored line ${ig.line}: ${ig.link} (${ig.reason})`);
    const chosen = rows.filter((r) => TICKED.has(r.status));
    if (!chosen.length) stop('Nothing to import.');
    if (!values.yes) {
      const rl = createInterface({ input: process.stdin, output: process.stdout });
      const ok = /^y(es)?$/i.test((await rl.question(`Import ${chosen.length} as drafts? [y/N] `)).trim());
      rl.close();
      if (!ok) stop('Nothing imported.');
    }
    const created = [];
    for (let i = 0; i < chosen.length; i += 50) {
      const batch = chosen.slice(i, i + 50).map((r) => ({
        rowId: r.rowId,
        action: 'create',
        mega: r.mega,
        instagram: r.instagram,
        youtube: r.youtube,
        title: r.title,
        brand: r.brand || values.brand || '',
        category: r.category,
        platform: r.platform,
        views: r.views,
        aspect: r.aspect,
      }));
      const out = await call('POST', '/import/commit', { importId: preview.importId, rows: batch });
      created.push(...out.created);
      for (const s of out.skipped) console.log(`  skipped ${s.rowId}: ${s.message}`);
    }
    for (const v of created) console.log(`  ${v.id}  ${v.title}`);
    console.log(`\n${created.length} drafts added (import ${preview.importId}). Publish them in /admin.\nUndo: pnpm video import --undo ${preview.importId}`);
    break;
  }
  case 'leads': {
    const q = new URLSearchParams();
    if (values.status) q.set('status', values.status);
    if (values.kind) q.set('kind', values.kind);
    if (values.csv) {
      const r = await call('GET', `/leads.csv?${q}`, undefined, { raw: true });
      // The raw bytes: text() would drop the BOM that makes Excel read the file as UTF-8.
      process.stdout.write(Buffer.from(await r.arrayBuffer()));
      break;
    }
    q.set('limit', '100');
    const all = [];
    for (let cursor = null, page = 0; page < 50; page++) {
      if (cursor) q.set('cursor', cursor);
      const r = await call('GET', `/leads?${q}`);
      all.push(...r.leads);
      cursor = r.nextCursor;
      if (!cursor) break;
    }
    for (const l of all) {
      console.log(`${l.createdAt}  [${l.status}] ${l.kind === 'trial' ? 'trial   ' : 'question'}  ${l.name} <${l.email}>  ${l.phone}  ${l.brand}  ${l.service}`);
      if (l.message) console.log(`    ${l.message.replace(/\n/g, ' ')}`);
    }
    console.log(`\n${all.length} enquiries`);
    break;
  }
  default:
    console.log(USAGE);
}
