import nodeCrypto from 'node:crypto';
import fs from 'node:fs';
import { ecb } from '@noble/ciphers/aes.js';
// The Node build, as `node` resolves it (vitest may otherwise pick the browser build, whose decrypt({start}) differs).
import { API, decrypt as megajsDecrypt, File as MegaFile } from 'megajs/dist/main.node-es.mjs';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { keyFromSecret } from '../../src/mega/lookup';
import {
  b64urlDecode,
  cbcDecryptNoPad,
  decryptAt,
  decryptAttributes,
  ecbDecrypt,
  fileCipher,
  getFile,
  listFolder,
  megaClient,
  MegaError,
  solveHashcash,
  splitFileKey,
  storageUrlAllowed,
  videoFiles,
  type MegaClient,
} from '../../src/mega/protocol';
import { meta, startMock, type Mock } from './helpers';

const RODE = meta.files.RoDe0001;
const ANSH = meta.files.AnSh0001;
const rodePlain = fs.readFileSync(RODE.src);
const anshPlain = fs.readFileSync(ANSH.src);

let mock: Mock;
let client: MegaClient;
beforeAll(async () => {
  mock = await startMock();
  client = { apiBase: mock.base, testStorageOrigin: mock.origin };
  // Nodes inside a folder use megajs's global API object: point it at the mock too, never at real MEGA.
  (API as any).globalApi = new API(false, { gateway: mock.base });
});
afterAll(() => mock?.stop());
beforeEach(() => mock.ctl('__reset'));

describe('fixtures, mock and our code agree with megajs', () => {
  it('megajs reads the file link through the mock: name, size, full download with MAC verification', async () => {
    const api = new API(false, { gateway: mock.base });
    const file = MegaFile.fromURL(RODE.link, { api } as any);
    await file.loadAttributes();
    expect(file.name).toBe('rode.mp4');
    expect(file.size).toBe(rodePlain.length);
    const buf = await file.downloadBuffer({ forceHttps: false, maxConnections: 1 } as any);
    expect(Buffer.compare(buf, rodePlain)).toBe(0);
  });

  it('megajs lists the folder and our listFolder finds the same names, sizes and node keys', async () => {
    const api = new API(false, { gateway: mock.base });
    const root: any = await MegaFile.fromURL(meta.folder.link, { api } as any).loadAttributes();
    const theirs = new Map<string, { size: number; key: string }>();
    const walk = (n: any) => {
      for (const c of n.children ?? []) {
        if (!c.directory) theirs.set(c.name, { size: c.size, key: Buffer.from(c.key).toString('hex') });
        walk(c);
      }
    };
    walk(root);
    expect(root.name).toBe('Kreators library');
    const ours = await listFolder(client, meta.folder.handle, b64urlDecode(meta.folder.key));
    expect(ours.root.name).toBe('Kreators library');
    const files = ours.nodes.filter((n) => n.type === 'file');
    expect(files.length).toBe(theirs.size);
    for (const f of files) expect(theirs.get(f.name!)).toEqual({ size: f.size, key: Buffer.from(f.key!).toString('hex') });
  });

  it('megajs downloads the file inside the folder (ECB-unwrapped key), byte exact', async () => {
    const api = new API(false, { gateway: mock.base });
    const node: any = await MegaFile.fromURL(meta.folder.fileLink, { api } as any).loadAttributes();
    expect(node.name).toBe('ansh-mehra.mp4');
    const buf = await node.downloadBuffer({ forceHttps: false });
    expect(Buffer.compare(buf, anshPlain)).toBe(0);
  });

  it('our CTR decrypt of a mid-file range equals megajs decrypt({start}) on the same ciphertext', async () => {
    const enc = fs.readFileSync(RODE.enc);
    const key = b64urlDecode(RODE.fileKey);
    const start = 16 * 70001;
    const slice = enc.subarray(start, start + 300000);
    const theirs: Buffer = await new Promise((res, rej) => {
      const d = megajsDecrypt(Buffer.from(key), { start, disableVerification: true } as any);
      const parts: Buffer[] = [];
      d.on('data', (c: Buffer) => parts.push(c))
        .on('end', () => res(Buffer.concat(parts)))
        .on('error', rej);
      d.end(Buffer.from(slice)); // a copy: megajs's CTR decrypts in place
    });
    const ours = await decryptAt(await fileCipher(key), slice, start);
    expect(Buffer.compare(Buffer.from(ours), theirs)).toBe(0);
    expect(Buffer.compare(theirs, rodePlain.subarray(start, start + 300000))).toBe(0);
  });

  it('ecbDecrypt (node:crypto, empty IV) equals @noble/ciphers ECB; cbcDecryptNoPad equals node aes-128-cbc', () => {
    for (let i = 0; i < 20; i++) {
      const k = nodeCrypto.randomBytes(16);
      const c = nodeCrypto.randomBytes(32);
      expect(Buffer.from(ecbDecrypt(k, c))).toEqual(Buffer.from(ecb(k, { disablePadding: true }).decrypt(c)));
    }
    const k = nodeCrypto.randomBytes(16);
    const c = nodeCrypto.randomBytes(80);
    const d = nodeCrypto.createDecipheriv('aes-128-cbc', k, Buffer.alloc(16)).setAutoPadding(false);
    expect(Buffer.from(cbcDecryptNoPad(k, c))).toEqual(Buffer.concat([d.update(c), d.final()]));
  });

  it('key folding matches the published layout (aes = k[0..3] ^ k[4..7], nonce = k[4..5])', () => {
    const key = b64urlDecode(RODE.fileKey);
    const { aes, nonce } = splitFileKey(key);
    const w = (b: Uint8Array, i: number) => new DataView(b.buffer, b.byteOffset).getUint32(i * 4);
    for (let i = 0; i < 4; i++) expect(w(aes, i)).toBe((w(key, i) ^ w(key, i + 4)) >>> 0);
    expect(Buffer.from(nonce)).toEqual(Buffer.from(key.subarray(16, 24)));
  });

  it('decryptAttributes reads MEGA{...} and refuses a wrong key', () => {
    expect(decryptAttributes(RODE.at, b64urlDecode(RODE.fileKey))).toMatchObject({ n: 'rode.mp4' });
    expect(decryptAttributes(RODE.at, b64urlDecode(ANSH.fileKey))).toBeNull();
  });

  it('decryptAt is byte exact at every offset inside a block', async () => {
    const enc = fs.readFileSync(RODE.enc);
    const cipher = await fileCipher(b64urlDecode(RODE.fileKey));
    for (let off = 4096; off < 4096 + 17; off++) {
      const out = await decryptAt(cipher, enc.subarray(off, off + 101), off);
      expect(Buffer.compare(Buffer.from(out), rodePlain.subarray(off, off + 101))).toBe(0);
    }
  });
});

describe('getFile and listFolder against the mock', () => {
  it('file: size, name, storage URL; sends g:1, ssl:1, no v:2', async () => {
    const r = await getFile(client, { p: 'RoDe0001' }, b64urlDecode(RODE.fileKey));
    expect(r).toMatchObject({ size: rodePlain.length, name: 'rode.mp4' });
    expect(r.url.startsWith(`${mock.origin}/dl/`)).toBe(true);
    expect((await mock.stats()).log[0].cmds[0]).toEqual({ a: 'g', g: 1, ssl: 1, p: 'RoDe0001' });
  });

  it('file in folder: g with n=<node> and ?n=<folder>', async () => {
    const r = await getFile(client, { n: 'NoDe0001', folder: 'FoLdEr01' }, b64urlDecode(ANSH.fileKey));
    expect(r.name).toBe('ansh-mehra.mp4');
    expect((await mock.stats()).log[0]).toMatchObject({ q: { n: 'FoLdEr01' }, cmds: [{ a: 'g', n: 'NoDe0001' }] });
  });

  it('a wrong key is caught before streaming', async () => {
    await expect(getFile(client, { p: 'RoDe0001' }, b64urlDecode(ANSH.fileKey))).rejects.toMatchObject({ kind: 'bad-key' });
  });

  it('the legacy alias NmU3lZjR serves the rode fixture', async () => {
    const r = await getFile(client, { p: 'NmU3lZjR' }, b64urlDecode(RODE.fileKey));
    expect(r).toMatchObject({ size: rodePlain.length, name: 'rode.mp4' });
  });

  it.each([
    ['ENOENT09', 'not-found', -9],
    ['EARGS002', 'not-found', -2],
    ['EBLOCK16', 'blocked', -16],
    ['EACCES11', 'removed', -11],
    ['ETOOMA06', 'removed', -6],
    ['ETEMP018', 'busy', -18],
    ['EOVERQ17', 'over-quota', -17],
  ])('API error for %s -> %s (V2-SPEC 2.4.5)', async (h, kind, code) => {
    const err = await getFile(client, { p: h }, b64urlDecode(RODE.fileKey)).catch((e) => e);
    expect(err).toBeInstanceOf(MegaError);
    expect(err).toMatchObject({ kind, code });
    if (code === -17) expect(err.retryAfter).toBe(321);
  });

  it('an HTTP 5xx from the API is busy', async () => {
    await mock.ctl('__mode', { apiStatus: 503 });
    await expect(getFile(client, { p: 'RoDe0001' }, b64urlDecode(RODE.fileKey))).rejects.toMatchObject({ kind: 'busy' });
  });

  it('hashcash: solved within the budget, and busy at once with 0 rounds (the Free-plan default)', async () => {
    await mock.ctl('__mode', { hashcash: true });
    await expect(getFile({ ...client, hashcashRounds: 0 }, { p: 'RoDe0001' }, b64urlDecode(RODE.fileKey))).rejects.toMatchObject({ kind: 'busy' });
    const r = await getFile({ ...client, hashcashRounds: 16 }, { p: 'RoDe0001' }, b64urlDecode(RODE.fileKey));
    expect(r.size).toBe(rodePlain.length);
    expect((await mock.stats()).hashcash402).toBeGreaterThanOrEqual(2);
    await expect(solveHashcash('2:bad', 4)).rejects.toMatchObject({ kind: 'upstream' });
  });

  it('listFolder: root, paths, both key alternatives; videoFiles filters and sorts', async () => {
    const l = await listFolder(client, 'FoLdEr01', b64urlDecode(meta.folder.key));
    const s = await mock.stats();
    expect(s.log[0]).toEqual({ q: { id: s.log[0].q.id, n: 'FoLdEr01' }, cmds: [{ a: 'f', c: 1, ca: 1, r: 1 }] });
    expect(l.nodes.find((n) => n.handle === 'NoDe0002')?.name).toBe('rode.mp4'); // the second key alternative opened it
    expect(videoFiles(l).map((f) => [f.path.join('/'), f.name, f.playable])).toEqual([
      ['', 'ansh-mehra.mp4', 'video'],
      ['', 'raw take.mkv', 'unsupported-container'],
      ['', 'rode.mp4', 'video'],
      ['Brand A', '2 rode copy.mp4', 'video'],
      ['Brand A', 'hevc-test.mov', 'video'],
    ]);
    expect(videoFiles(l, 'SuBfOlDr').map((f) => f.name)).toEqual(['2 rode copy.mp4', 'hevc-test.mov']);
  });

  it('listFolder with a wrong folder key opens nothing; an unknown folder is not-found', async () => {
    const l = await listFolder(client, 'FoLdEr01', new Uint8Array(16));
    expect(l.nodes.every((n) => n.key === null)).toBe(true);
    expect(videoFiles(l)).toEqual([]);
    await expect(listFolder(client, 'NoSuChFo', b64urlDecode(meta.folder.key))).rejects.toMatchObject({ kind: 'not-found' });
  });
});

describe('storage allowlist and MEGA_API (V2-SPEC 2.4.8)', () => {
  it('only *.userstorage.mega.co.nz, rewritten to https; the mock origin only when MEGA_API was honoured', () => {
    expect(storageUrlAllowed('http://gfs214n196.userstorage.mega.co.nz/dl/abc', {})).toBe('https://gfs214n196.userstorage.mega.co.nz/dl/abc');
    expect(storageUrlAllowed('https://gfs1.userstorage.mega.co.nz:8443/dl/abc', {})).toBe('https://gfs1.userstorage.mega.co.nz:8443/dl/abc');
    for (const bad of ['https://evil.example/dl/x', 'https://userstorage.mega.co.nz.evil.example/x', 'https://a.userstorage.mega.co.nz.evil/x', 'http://127.0.0.1:9/dl/x', 'file:///etc/passwd']) {
      expect(() => storageUrlAllowed(bad, {}), bad).toThrow(MegaError);
    }
    expect(storageUrlAllowed('http://127.0.0.1:9/dl/x', { testStorageOrigin: 'http://127.0.0.1:9' })).toBe('http://127.0.0.1:9/dl/x');
    expect(() => storageUrlAllowed('http://127.0.0.1:10/dl/x', { testStorageOrigin: 'http://127.0.0.1:9' })).toThrow(MegaError);
  });

  it('a g answer pointing at another host is upstream, and nothing is fetched from it', async () => {
    await mock.ctl('__mode', { foreignStorage: true });
    await expect(getFile(client, { p: 'RoDe0001' }, b64urlDecode(RODE.fileKey))).rejects.toMatchObject({ kind: 'upstream' });
  });

  it('MEGA_API is honoured only for http://127.0.0.1:<port> or http://localhost:<port>', () => {
    expect(megaClient({ MEGA_API: 'http://127.0.0.1:21803/' })).toMatchObject({ apiBase: 'http://127.0.0.1:21803/', testStorageOrigin: 'http://127.0.0.1:21803' });
    expect(megaClient({ MEGA_API: 'http://localhost:9' })).toMatchObject({ apiBase: 'http://localhost:9/' });
    for (const v of ['https://evil.example/', 'http://10.0.0.1:80/', 'http://127.0.0.1.evil.example:1/', 'http://127.0.0.1:1/cs']) {
      const c = megaClient({ MEGA_API: v });
      expect(c.apiBase, v).toBeUndefined();
      expect(c.testStorageOrigin, v).toBeUndefined();
    }
    expect(megaClient({ MEGA_HASHCASH_ROUNDS: '8' }).hashcashRounds).toBe(8);
    expect(megaClient({}).hashcashRounds).toBe(0);
  });
});

describe('the legacy MEGA_LINKS secret', () => {
  it('gives a key only for its own handle, from a link or an embed code', () => {
    const links = `${RODE.link}\n<iframe src="https://mega.nz/embed/AnSh0001#${ANSH.fileKey}!1a1m"></iframe>`;
    expect(keyFromSecret('AnSh0001', links)).toBe(ANSH.fileKey);
    expect(keyFromSecret('RoDe0001', links)).toBe(RODE.fileKey);
    expect(keyFromSecret('ZzZzZzZz', links)).toBeNull();
    expect(keyFromSecret('RoDe0001', undefined)).toBeNull();
    expect(keyFromSecret('RoDe0001', `${RODE.link},${meta.files.HeVc0001.link}`)).toBe(RODE.fileKey);
  });
});
