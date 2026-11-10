// Builds MEGA-encrypted test fixtures with megajs's own encrypt() (independent of the Worker's code), plus attributes and
// folder node keys wrapped with node:crypto AES-ECB, the way megajs's loadMetadata unwraps them. Port of the prototype's
// fixture/build.mjs (.work/tools/v2/mega). Never the founder's real link: every key is the SHA-256 of a label.
//
//   node apps/api/test/mega/fixtures/build.mjs [--out <dir>] [--force]     (or MEGA_FIXTURE_OUT=<dir>)
//   default output: apps/api/test/mega/.out/  (gitignored): meta.json and <handle>.enc
//
// Files: rode.mp4 (moov first), ansh-mehra.mp4 (moov at the end), an HEVC-tagged copy of circlestore-1.mp4, a copy of
// rode.mp4 whose video tkhd says 1080x1920 (grades "heavy"), a .txt and a .mkv; a shared folder with a subfolder, a .txt,
// a .mkv and a node whose first key alternative is someone else's. meta.json also gives the legacy alias NmU3lZjR -> rode.
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { pipeline } from 'node:stream/promises';
import { fileURLToPath } from 'node:url';
import { encrypt } from 'megajs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const MEDIA = path.resolve(HERE, '../../../../web/public/media');
const argv = process.argv.slice(2);
const argOut = argv.includes('--out') ? argv[argv.indexOf('--out') + 1] : undefined;
const OUT = path.resolve(argOut || process.env.MEGA_FIXTURE_OUT || path.resolve(HERE, '../.out'));
const FORCE = argv.includes('--force');
const VERSION = 2;
fs.mkdirSync(OUT, { recursive: true });

const META = path.join(OUT, 'meta.json');
if (!FORCE && fs.existsSync(META)) {
  try {
    const old = JSON.parse(fs.readFileSync(META, 'utf8'));
    if (old.version === VERSION && Object.values(old.files).every((f) => fs.existsSync(f.enc))) {
      console.log(JSON.stringify({ out: OUT, reused: true }));
      process.exit(0);
    }
  } catch {
    // rebuild
  }
}

const e64 = (b) => Buffer.from(b).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const label = (s) => crypto.createHash('sha256').update(`kreators-fixture:${s}`).digest();
const aesFold = (k) => Buffer.from(k.subarray(0, 16).map((x, i) => x ^ k[16 + i]));
function encAttr(obj, key16) {
  const s = Buffer.from('MEGA' + JSON.stringify(obj));
  const padded = Buffer.alloc(Math.ceil((s.length + 1) / 16) * 16); // at least one zero byte, like megajs packAttributes
  s.copy(padded);
  const c = crypto.createCipheriv('aes-128-cbc', key16, Buffer.alloc(16)).setAutoPadding(false);
  return e64(Buffer.concat([c.update(padded), c.final()]));
}
function ecbEnc(key16, data) {
  const c = crypto.createCipheriv('aes-128-ecb', key16, null).setAutoPadding(false);
  return Buffer.concat([c.update(data), c.final()]);
}

/** A copy of an MP4 whose video sample entry says hvc1 instead of avc1: only the sniffer reads it. */
function hevcCopy(src, dst) {
  const b = fs.readFileSync(src);
  const i = b.indexOf(Buffer.from('avc1'), b.indexOf(Buffer.from('stsd'))); // not the ftyp brand list
  if (i < 0) throw new Error('no avc1 in ' + src);
  b.write('hvc1', i, 'latin1');
  fs.writeFileSync(dst, b);
  return dst;
}

/** A copy of an MP4 whose video track header (tkhd, 16.16 width and height) says w x h. */
function resizedCopy(src, dst, w, h) {
  const b = fs.readFileSync(src);
  // Only inside the moov box (top-level walk), so bytes in mdat that happen to spell "tkhd" are never touched.
  let moovAt = 0;
  let moovEnd = 0;
  for (let off = 0; off + 8 <= b.length; ) {
    const size = b.readUInt32BE(off);
    if (b.toString('latin1', off + 4, off + 8) === 'moov') {
      moovAt = off;
      moovEnd = off + size;
      break;
    }
    if (size < 8) break;
    off += size;
  }
  if (!moovEnd) throw new Error('no moov in ' + src);
  let patched = 0;
  for (let i = b.indexOf('tkhd', moovAt); i >= 0 && i < moovEnd; i = b.indexOf('tkhd', i + 4)) {
    const body = i + 4; // after the type; the box header started 4 bytes before it
    const version = b[body];
    const at = body + (version === 1 ? 88 : 76);
    if (b.readUInt32BE(at) === 0) continue; // the audio track has no size
    b.writeUInt32BE(w * 65536, at);
    b.writeUInt32BE(h * 65536, at + 4);
    patched++;
  }
  if (patched !== 1) throw new Error(`expected one video tkhd in ${src}, patched ${patched}`);
  fs.writeFileSync(dst, b);
  return dst;
}

async function encryptFile(src, handle) {
  const key24 = label(handle).subarray(0, 24); // deterministic fixtures
  const enc = encrypt(key24);
  const dst = path.join(OUT, handle + '.enc');
  await pipeline(fs.createReadStream(src), enc, fs.createWriteStream(dst));
  return { src, enc: dst, size: fs.statSync(src).size, fileKey: enc.key }; // 32 bytes, merged by megajs mergeKeyMac
}

const files = {};
async function addFile(handle, src, name) {
  const f = await encryptFile(src, handle);
  files[handle] = { ...f, name, at: encAttr({ n: name, c: 'fixture' }, aesFold(f.fileKey)) };
  return files[handle];
}

const rode = await addFile('RoDe0001', path.join(MEDIA, 'rode.mp4'), 'rode.mp4');
const ansh = await addFile('AnSh0001', path.join(MEDIA, 'ansh-mehra.mp4'), 'ansh-mehra.mp4');
const hevc = await addFile('HeVc0001', hevcCopy(path.join(MEDIA, 'circlestore-1.mp4'), path.join(OUT, 'hevc.mp4')), 'hevc-test.mov');
await addFile('HeAvY001', resizedCopy(path.join(MEDIA, 'rode.mp4'), path.join(OUT, 'heavy.mp4'), 1080, 1920), 'rode 1080p export.mp4');
const txt = path.join(OUT, 'notes.txt');
fs.writeFileSync(txt, 'shoot notes\n');
const notes = await addFile('NoTe0001', txt, 'notes.txt');
const mkvPath = path.join(OUT, 'raw.mkv');
fs.writeFileSync(mkvPath, Buffer.concat([Buffer.from([0x1a, 0x45, 0xdf, 0xa3]), Buffer.alloc(4092)]));
const mkv = await addFile('MkV00001', mkvPath, 'raw take.mkv');

// A shared folder:  Kreators library/{ansh-mehra.mp4, rode.mp4, notes.txt, raw take.mkv, Brand A/{hevc-test.mov, 2 rode copy.mp4}}
const folderKey = label('folder').subarray(0, 16);
const subKey = label('subfolder').subarray(0, 16);
const R = 'RoOtNoDe';
const S = 'SuBfOlDr';
const wrap = (k) => `${R}:${e64(ecbEnc(folderKey, k))}`;
const fileNode = (h, parent, f, name, ts, extraK = '') => ({
  h,
  p: parent,
  t: 0,
  s: f.size,
  a: encAttr({ n: name }, aesFold(f.fileKey)),
  k: extraK + wrap(f.fileKey),
  ts,
  file: Object.keys(files).find((x) => files[x] === f),
});
const folder = {
  handle: 'FoLdEr01',
  key: folderKey,
  nodes: [
    { h: R, p: 'OwNeRrOt', t: 1, a: encAttr({ n: 'Kreators library' }, folderKey), k: `${R}:${e64(ecbEnc(folderKey, folderKey))}`, ts: 1700000000 },
    fileNode('NoDe0001', R, ansh, 'ansh-mehra.mp4', 1700000001),
    // Two key alternatives: the first belongs to someone else and does not open the node (megajs loadMetadata loops).
    fileNode('NoDe0002', R, rode, 'rode.mp4', 1700000002, `XxXxXxXx:${e64(label('not-ours'))}/`),
    fileNode('NoDe0003', R, notes, 'notes.txt', 1700000003),
    fileNode('NoDe0004', R, mkv, 'raw take.mkv', 1700000004),
    { h: S, p: R, t: 1, a: encAttr({ n: 'Brand A' }, subKey), k: wrap(subKey), ts: 1700000005 },
    fileNode('NoDe0005', S, hevc, 'hevc-test.mov', 1700000006),
    fileNode('NoDe0006', S, rode, '2 rode copy.mp4', 1700000007),
  ],
};

const fileMeta = Object.fromEntries(
  Object.entries(files).map(([h, f]) => [h, { name: f.name, src: f.src, enc: f.enc, size: f.size, fileKey: e64(f.fileKey), at: f.at, link: `https://mega.nz/file/${h}#${e64(f.fileKey)}` }]),
);
const meta = {
  version: VERSION,
  labels: { rode: 'RoDe0001', ansh: 'AnSh0001', hevc: 'HeVc0001', heavy: 'HeAvY001', notes: 'NoTe0001', mkv: 'MkV00001' },
  files: fileMeta,
  folder: {
    handle: folder.handle,
    key: e64(folder.key),
    nodes: folder.nodes,
    link: `https://mega.nz/folder/${folder.handle}#${e64(folder.key)}`,
    fileLink: `https://mega.nz/folder/${folder.handle}#${e64(folder.key)}/file/NoDe0001`,
    subLink: `https://mega.nz/folder/${folder.handle}#${e64(folder.key)}/folder/${S}`,
  },
  // The live legacy row's handle, served by the mock as the rode fixture, so --seed live and adopt-secret work offline.
  legacy: { handle: 'NmU3lZjR', of: 'RoDe0001', link: `https://mega.nz/file/NmU3lZjR#${fileMeta.RoDe0001.fileKey}` },
};
fs.writeFileSync(META, JSON.stringify(meta, null, 2));
console.log(JSON.stringify({ out: OUT, files: Object.keys(files), folder: folder.handle }));
