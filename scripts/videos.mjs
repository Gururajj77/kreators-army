#!/usr/bin/env node
// Manages the video library and reads enquiries through the admin API. The public site has no admin screens; this is the backend's front door.
//
//   pnpm video add --url <youtube link or wave.video embed code> --title "..." --brand "..." [options]
//   pnpm video list
//   pnpm video update <id> [options]
//   pnpm video remove <id>
//   pnpm leads
//
// Options: --category --platform --views 110000 --poster <https image> --aspect vertical|landscape
//          --order 1 --featured true|false --published true|false
//
// Local by default (the key comes from apps/api/.dev.vars). For the live site:
//   KREATORS_API=https://your-domain ADMIN_KEY=your-key pnpm video list
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
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

const USAGE = readFileSync(fileURLToPath(import.meta.url), 'utf8').split('\n').filter((l) => l.startsWith('//')).slice(1, 12).map((l) => l.slice(3)).join('\n');

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: Object.fromEntries(['url', 'title', 'brand', 'category', 'platform', 'views', 'poster', 'aspect', 'order', 'featured', 'published'].map((k) => [k, { type: 'string' }])),
});

function body() {
  const out = {};
  const copy = { url: 'url', title: 'title', brand: 'brand', category: 'category', platform: 'platform', poster: 'posterUrl', aspect: 'aspect' };
  for (const [flag, key] of Object.entries(copy)) if (values[flag] !== undefined) out[key] = values[flag];
  for (const [flag, key] of [['views', 'views'], ['order', 'sortOrder']]) {
    if (values[flag] === undefined) continue;
    const n = Number(values[flag]);
    if (!Number.isInteger(n)) stop(`--${flag} must be a whole number`);
    out[key] = n;
  }
  for (const flag of ['featured', 'published']) {
    if (values[flag] === undefined) continue;
    if (values[flag] !== 'true' && values[flag] !== 'false') stop(`--${flag} must be true or false`);
    out[flag] = values[flag] === 'true';
  }
  return out;
}

async function call(method, path, data) {
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
  const answer = await res.json().catch(() => null);
  if (!res.ok) stop(`Refused (${res.status}): ${answer?.error ?? 'unknown error'}`);
  return answer;
}

const printVideo = (v) => console.log(`${v.id}  ${v.published ? 'live ' : 'draft'}  ${v.source.padEnd(7)}  ${String(v.views).padStart(9)}  ${v.brand}: ${v.title}`);

const [command, id] = positionals;
switch (command) {
  case 'add': {
    const { video } = await call('POST', '/videos', body());
    console.log('Added:');
    printVideo(video);
    break;
  }
  case 'list': {
    const { videos } = await call('GET', '/videos');
    videos.forEach(printVideo);
    console.log(`\n${videos.length} videos`);
    break;
  }
  case 'update': {
    if (!id) stop('Which video? pnpm video update <id> --views 12000');
    const { video } = await call('PATCH', `/videos/${encodeURIComponent(id)}`, body());
    console.log('Updated:');
    printVideo(video);
    break;
  }
  case 'remove': {
    if (!id) stop('Which video? pnpm video remove <id>');
    await call('DELETE', `/videos/${encodeURIComponent(id)}`);
    console.log('Removed.');
    break;
  }
  case 'leads': {
    const { leads } = await call('GET', '/leads');
    for (const l of leads) console.log(`${l.createdAt}  ${l.name} <${l.email}>  ${l.phone}  ${l.service}\n    ${l.message.replace(/\n/g, ' ')}\n`);
    console.log(`${leads.length} enquiries`);
    break;
  }
  default:
    console.log(USAGE);
}
