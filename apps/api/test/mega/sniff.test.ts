import fs from 'node:fs';
import path from 'node:path';
import { streamGrade } from '@kreators/shared';
import { describe, expect, it } from 'vitest';
import { metaForD1, parseSniffMeta, sniff, type MediaInfo } from '../../src/mega/sniff';
import { previewOkFromMeta } from '../../src/videoRows';
import { MEDIA, meta } from './helpers';

const fileReader = (buf: Buffer) => async (a: number, z: number) => new Uint8Array(buf.subarray(a, z + 1));
const rodePlain = fs.readFileSync(meta.files.RoDe0001.src);
const anshPlain = fs.readFileSync(meta.files.AnSh0001.src);
const grade = (info: MediaInfo) =>
  streamGrade({ width: info.width, height: info.height, durationMs: info.durationS ? info.durationS * 1000 : null, bitrate: info.bitrateKbps ? info.bitrateKbps * 1000 : null });

describe('sniff', () => {
  it('moov first (rode.mp4): head then moov, sizes, codecs, preview ends', async () => {
    const info = await sniff(fileReader(rodePlain), rodePlain.length);
    expect(info.isoBmff).toBe(true);
    expect(info.moov).toEqual({ offset: 32, size: 91579, at: 'start' });
    expect(info.reads).toBe(2); // 64 KiB head, then the 91.6 KB moov
    expect(info.video?.fourcc).toBe('avc1');
    expect(info.video?.codec).toMatch(/^avc1\.[0-9a-f]{6}$/);
    expect(info.audio?.codec).toMatch(/^mp4a\.40\.\d+$/);
    expect([info.width, info.height]).toEqual([406, 720]);
    expect(info.durationS).toBeGreaterThan(60);
    const p = info.previewEnds;
    expect(p[3]! < p[6]! && p[6]! < p[10]! && p[10]! <= rodePlain.length).toBe(true);
    expect(grade(info)).toBe('ready');
    expect(previewOkFromMeta(metaForD1(info))).toBe(true);
  });

  it('moov at the end (ansh-mehra.mp4): found by walking box headers', async () => {
    const info = await sniff(fileReader(anshPlain), anshPlain.length);
    expect(info.moov).toEqual({ offset: 4050853, size: 11367, at: 'end' });
    expect(info.reads).toBe(3); // head, the box header after mdat, the moov
    expect(metaForD1(info).moov).toBe('end');
  });

  it('the heavy fixture (tkhd 1080x1920) grades heavy; the HEVC copy reads hvc1; the mkv is not ISO-BMFF', async () => {
    const heavyBuf = fs.readFileSync(meta.files.HeAvY001.src);
    const heavy = await sniff(fileReader(heavyBuf), heavyBuf.length);
    expect([heavy.width, heavy.height]).toEqual([1080, 1920]);
    expect(grade(heavy)).toBe('heavy');
    const hevcBuf = fs.readFileSync(meta.files.HeVc0001.src);
    const hevc = await sniff(fileReader(hevcBuf), hevcBuf.length);
    expect(hevc.video?.fourcc).toBe('hvc1');
    expect(previewOkFromMeta(metaForD1(hevc))).toBe(false);
    const mkvBuf = fs.readFileSync(meta.files.MkV00001.src);
    const mkv = await sniff(fileReader(mkvBuf), mkvBuf.length);
    expect(mkv.isoBmff).toBe(false);
    expect(mkv.moov).toBeNull();
    const txt = Buffer.from('shoot notes\n');
    expect((await sniff(fileReader(txt), txt.length)).isoBmff).toBe(false);
  });

  it('a file whose moov is past 8 top-level boxes is unknown, not an error', async () => {
    const box = (type: string, size: number) => {
      const b = Buffer.alloc(size);
      b.writeUInt32BE(size, 0);
      b.write(type, 4, 'latin1');
      return b;
    };
    const many = Buffer.concat([box('ftyp', 24), ...Array.from({ length: 9 }, () => box('free', 16)), box('moov', 16)]);
    const info = await sniff(fileReader(many), many.length);
    expect(info.isoBmff).toBe(true);
    expect(info.moov).toBeNull();
  });

  it('metaForD1 round-trips through JSON and stays small', async () => {
    const info = await sniff(fileReader(rodePlain), rodePlain.length);
    const m = metaForD1(info);
    const json = JSON.stringify(m);
    expect(json.length).toBeLessThan(4000);
    expect(parseSniffMeta(json)).toEqual(m);
    expect(parseSniffMeta('not json')).toBeNull();
    expect(Object.keys(m).sort()).toEqual(['ac', 'dur', 'frag', 'h', 'kbps', 'moov', 'prev', 'rot', 'vc', 'w']);
  });

  it('every bundled library file sniffs as H.264 and previews', async () => {
    const files = fs.readdirSync(MEDIA).filter((x) => x.endsWith('.mp4'));
    expect(files.length).toBeGreaterThanOrEqual(9);
    for (const f of files) {
      const b = fs.readFileSync(path.join(MEDIA, f));
      const info = await sniff(fileReader(b), b.length);
      expect(info.video?.fourcc, f).toBe('avc1');
      expect(info.previewEnds[6], f).toBeGreaterThan(0);
      expect(grade(info), f).toBe('ready');
    }
  });
});
