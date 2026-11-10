// A small stand-in for the MEGA API (/cs) and a storage server (/dl/<token>/<start>-<end>), serving the fixtures that
// fixtures/build.mjs wrote. Port of the prototype's fixture/mock-mega.mjs. Binds 127.0.0.1 only.
//
//   node apps/api/test/mega/mock-mega.mjs [--port <p>] [--fixture <dir>] [--alias <handle>=<label or handle>]...
//   env: MOCK_PORT (default 0: any free port), MEGA_FIXTURE_DIR (default ../.out), MOCK_ALIAS ("a=b,c=d")
//   first stdout line: "mock MEGA listening on http://127.0.0.1:<port>/"
//
// The handle NmU3lZjR is always an alias of the rode fixture (the live legacy row), so --seed live works offline.
// Error handles for 'g': ENOENT09 -> -9, EBLOCK16 -> -16, EACCES11 -> -11, EARGS002 -> -2, ETEMP018 -> -18,
//   ETOOMA06 -> -6, EOVERQ17 -> {e:-17, tl:321}.
// Control: POST /__mode {"quota509":true} | {"hashcash":true} | {"foreignStorage":true} | {"apiStatus":503} | {"rateBps":n} |
//   {"apiMs":n,"storageMs":n};  POST /__reset (stats and modes);  POST /__expire (every storage URL expires);  GET /__stats[?log]
import crypto from 'node:crypto';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const argv = process.argv.slice(2);
const arg = (name) => (argv.includes(name) ? argv[argv.indexOf(name) + 1] : undefined);
const FIXTURE = path.resolve(arg('--fixture') || process.env.MEGA_FIXTURE_DIR || path.join(HERE, '.out'));
const PORT = Number(arg('--port') ?? process.env.MOCK_PORT ?? 0);
const meta = JSON.parse(fs.readFileSync(path.join(FIXTURE, 'meta.json'), 'utf8'));
const blobs = Object.fromEntries(Object.entries(meta.files).map(([h, f]) => [h, fs.readFileSync(path.join(FIXTURE, path.basename(f.enc)))]));
const ERR = { ENOENT09: -9, EBLOCK16: -16, EACCES11: -11, EARGS002: -2, ETEMP018: -18, ETOOMA06: -6 };

// Aliases: another handle served as one of the fixtures (by label, e.g. "rode", or by handle).
const aliases = { NmU3lZjR: 'RoDe0001' };
const aliasArgs = [...argv.flatMap((a, i) => (a === '--alias' ? [argv[i + 1]] : [])), ...(process.env.MOCK_ALIAS ?? '').split(',')].filter(Boolean);
for (const pair of aliasArgs) {
  const [from, to] = pair.split('=');
  const target = meta.labels?.[to] ?? to;
  if (from && blobs[target]) aliases[from] = target;
}
const fileOf = (h) => (blobs[h] ? h : aliases[h]);

let mode = {};
let stats = { api: 0, g: 0, f: 0, storage: 0, bytes: 0, sent: 0, hashcash402: 0, ranges: [], log: [] };
// Storage tokens are stateless (the fixture handle and a generation, base64url), so a 'g' URL the Worker cached survives a
// restart of this mock, as a real one survives a restart of the Worker. POST /__expire bumps the generation (all expire).
let generation = 0;
const newToken = (fixture) => Buffer.from(`${fixture}|${generation}|${crypto.randomBytes(4).toString('hex')}`).toString('base64url');
function tokenFile(token) {
  const [fixture, gen] = Buffer.from(token, 'base64url').toString('utf8').split('|');
  return blobs[fixture] && Number(gen) === generation ? fixture : null;
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function hashcashOk(header, token) {
  if (!header) return false;
  const [v, tok, prefix] = header.split(':');
  if (v !== '1' || tok !== token) return false;
  const t = Buffer.from(tok, 'base64url');
  const buf = Buffer.alloc(4 + 262144 * 48);
  Buffer.from(prefix, 'base64url').copy(buf, 0);
  for (let i = 0; i < 262144; i++) t.copy(buf, 4 + i * 48);
  const h = crypto.createHash('sha256').update(buf).digest();
  const e = mode.hashcashEasiness ?? 255; // 255: about one round in two succeeds
  const threshold = ((((e & 63) << 1) + 1) << ((e >> 6) * 7 + 3)) >>> 0;
  return h.readUInt32BE(0) <= threshold;
}
const HC_TOKEN = Buffer.alloc(48, 7).toString('base64url');

function gFor(fixture, host) {
  const token = newToken(fixture);
  // A local mock cannot do TLS. The Worker accepts http only from the MEGA_API origin it was given (tests).
  const base = mode.foreignStorage ? 'http://storage.evil.example' : `http://${host}`;
  return { s: blobs[fixture].length, at: meta.files[fixture].at, msd: 1, tl: 0, g: `${base}/dl/${token}`, fa: '' };
}

function command(cmd, q, host) {
  if (cmd.a === 'g') {
    stats.g++;
    if (cmd.p) {
      if (cmd.p === 'EOVERQ17') return { e: -17, tl: 321 };
      if (ERR[cmd.p]) return ERR[cmd.p];
      const f = fileOf(cmd.p);
      return f ? gFor(f, host) : -9;
    }
    if (cmd.n && q.get('n') === meta.folder.handle) {
      const node = meta.folder.nodes.find((x) => x.h === cmd.n);
      if (!node || !node.file) return -9;
      const r = gFor(node.file, host);
      r.at = node.a;
      return r;
    }
    return -2;
  }
  if (cmd.a === 'f') {
    stats.f++;
    if (q.get('n') !== meta.folder.handle) return -9;
    return { f: meta.folder.nodes.map(({ file, ...n }) => n), ok: [], s: [], noc: 1 };
  }
  return -2;
}

const server = http.createServer(async (req, res) => {
  const host = req.headers.host || `127.0.0.1:${server.address().port}`;
  const url = new URL(req.url, `http://${host}`);
  const body = await new Promise((r) => {
    let b = '';
    req.on('data', (c) => (b += c));
    req.on('end', () => r(b));
  });
  if (url.pathname === '/__stats') return res.end(JSON.stringify({ ...stats, log: url.searchParams.has('log') ? stats.log : stats.log.length }));
  if (url.pathname === '/__reset') {
    stats = { api: 0, g: 0, f: 0, storage: 0, bytes: 0, sent: 0, hashcash402: 0, ranges: [], log: [] };
    mode = {};
    return res.end('{}');
  }
  if (url.pathname === '/__mode') {
    mode = { ...mode, ...JSON.parse(body || '{}') };
    return res.end(JSON.stringify(mode));
  }
  if (url.pathname === '/__expire') {
    generation++;
    return res.end('{}');
  }

  if (url.pathname === '/cs' && req.method === 'POST') {
    stats.api++;
    if (mode.apiMs) await sleep(mode.apiMs);
    if (mode.apiStatus) {
      res.writeHead(mode.apiStatus);
      return res.end();
    }
    if (mode.hashcash && !hashcashOk(req.headers['x-hashcash'], HC_TOKEN)) {
      stats.hashcash402++;
      res.writeHead(402, { 'X-Hashcash': `1:${mode.hashcashEasiness ?? 255}:${Math.floor(Date.now() / 1000)}:${HC_TOKEN}` });
      return res.end();
    }
    let cmds;
    try {
      cmds = JSON.parse(body);
    } catch {
      res.writeHead(400);
      return res.end();
    }
    const out = cmds.map((c) => command(c, url.searchParams, host));
    stats.log.push({ q: Object.fromEntries(url.searchParams), cmds });
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify(out));
  }

  const m = /^\/dl\/([\w-]+)\/(\d+)-(\d+)$/.exec(url.pathname);
  if (m && (req.method === 'GET' || req.method === 'POST')) {
    stats.storage++;
    if (mode.storageMs) await sleep(mode.storageMs);
    if (mode.quota509) {
      res.writeHead(509, { 'x-mega-time-left': '1234' });
      return res.end();
    }
    const handle = tokenFile(m[1]);
    if (!handle) {
      res.writeHead(403);
      return res.end();
    }
    const blob = blobs[handle];
    const start = Number(m[2]);
    const end = Math.min(Number(m[3]), blob.length - 1);
    if (start > end) {
      res.writeHead(416);
      return res.end();
    }
    const slice = blob.subarray(start, end + 1);
    stats.bytes += slice.length;
    stats.ranges.push(`${start}-${end}`);
    res.writeHead(200, { 'Content-Type': 'application/octet-stream', 'Content-Length': slice.length });
    // Odd-sized pieces, so the decryptor sees pieces that do not line up with AES blocks. rateBps paces the body like MEGA's
    // storage seen from Cloudflare (about 1.5 to 2 MB/s per stream); a closed socket stops the loop.
    let off = 0;
    const step = 65537;
    let closed = false;
    res.on('close', () => {
      closed = true;
    });
    const t0 = Date.now();
    while (off < slice.length && !closed) {
      const piece = slice.subarray(off, off + step);
      if (!res.write(piece)) await new Promise((r) => res.once('drain', r));
      off += piece.length;
      stats.sent += piece.length;
      if (mode.rateBps) {
        const due = t0 + (off / mode.rateBps) * 1000;
        if (due > Date.now()) await sleep(due - Date.now());
      }
    }
    return res.end();
  }
  res.writeHead(404);
  res.end();
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`mock MEGA listening on http://127.0.0.1:${server.address().port}/`);
});
for (const sig of ['SIGTERM', 'SIGINT']) process.on(sig, () => server.close(() => process.exit(0)));
