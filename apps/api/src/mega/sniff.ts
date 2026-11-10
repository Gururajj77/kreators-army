/**
 * Reads what the admin screen needs to know about a video without downloading it: walks the top-level MP4/QuickTime
 * boxes with small range reads (at most 8 hops), fetches only the moov box (at most 4 MiB), and parses the track headers
 * and sample tables. Port of the prototype's sniff.ts; its verdict() is replaced by shared streamGrade() (V2-SPEC 2.11).
 *
 * Box layouts: ISO/IEC 14496-12 (mvhd, tkhd, mdhd, hdlr, stsd, stts, stsc, stsz/stz2, stco/co64) and 14496-15 (avcC);
 * QuickTime File Format for .mov (same boxes; 'wave' may wrap 'esds').
 */

/** Reads plaintext bytes [start, end] (inclusive). */
export type ReadFn = (start: number, end: number) => Promise<Uint8Array>;

export interface TrackInfo {
  kind: 'video' | 'audio' | 'other';
  /** Sample entry four-character code: avc1, avc3, hvc1, hev1, av01, vp09, mp4a, ac-3, ... */
  fourcc: string;
  /** RFC 6381 codec string when known (avc1.640033, mp4a.40.2), else the fourcc. */
  codec: string;
  durationS: number | null;
  width?: number;
  height?: number;
  /** Byte offset just past the last sample that starts before each preview time (see previewEnds). */
  ends: Record<string, number>;
}

export interface MediaInfo {
  size: number;
  /** The first box is one an MP4 or MOV file starts with (ftyp, moov, wide, free, skip, mdat). False: not a video file. */
  isoBmff: boolean;
  brand: string;
  container: 'mp4' | 'mov' | 'unknown';
  /** Where the moov box is. 'end' means the player must fetch the file's tail before it can start. */
  moov: { offset: number; size: number; at: 'start' | 'end' } | null;
  fragmented: boolean;
  durationS: number | null;
  /** Display size, after the track matrix's rotation. */
  width: number | null;
  height: number | null;
  rotation: 0 | 90 | 180 | 270;
  video: TrackInfo | null;
  audio: TrackInfo | null;
  /** size * 8 / duration, in kilobits per second. */
  bitrateKbps: number | null;
  /** For each preview length in seconds: bytes [0, end) hold every sample of every track that starts before it. */
  previewEnds: Record<string, number>;
  reads: number;
  bytesRead: number;
}

export const PREVIEW_SECONDS = [3, 6, 10];
const HEAD = 64 * 1024;
const MAX_MOOV = 4 * 1024 * 1024;
const MAX_HOPS = 8;
const FIRST_BOXES = new Set(['ftyp', 'moov', 'wide', 'free', 'skip', 'mdat']);

const fourcc = (b: Uint8Array, o: number) => String.fromCharCode(b[o]!, b[o + 1]!, b[o + 2]!, b[o + 3]!);
const hex2 = (n: number) => n.toString(16).padStart(2, '0');

interface Box {
  type: string;
  start: number; // offset of the header
  body: number; // offset of the payload
  end: number; // exclusive
}

/** Child boxes of the payload [from, to) of a buffer. */
function children(b: Uint8Array, from: number, to: number): Box[] {
  const dv = new DataView(b.buffer, b.byteOffset, b.byteLength);
  const out: Box[] = [];
  let off = from;
  while (off + 8 <= to) {
    let size = dv.getUint32(off);
    const type = fourcc(b, off + 4);
    let header = 8;
    if (size === 1) {
      if (off + 16 > to) break;
      size = Number(dv.getBigUint64(off + 8));
      header = 16;
    } else if (size === 0) size = to - off;
    if (size < header || off + size > to) break;
    out.push({ type, start: off, body: off + header, end: off + size });
    off += size;
  }
  return out;
}

const child = (b: Uint8Array, box: Box | undefined, type: string, skip = 0) => (box ? children(b, box.body + skip, box.end).find((c) => c.type === type) : undefined);

function readMoov(b: Uint8Array, moov: Box) {
  const dv = new DataView(b.buffer, b.byteOffset, b.byteLength);
  const mvhd = child(b, moov, 'mvhd');
  let durationS: number | null = null;
  if (mvhd) {
    const v = b[mvhd.body]!;
    const ts = dv.getUint32(mvhd.body + (v === 1 ? 20 : 12));
    const dur = v === 1 ? Number(dv.getBigUint64(mvhd.body + 24)) : dv.getUint32(mvhd.body + 16);
    if (ts > 0 && dur > 0 && dur !== 0xffffffff) durationS = dur / ts;
  }
  const fragmented = !!child(b, moov, 'mvex');
  const tracks: Array<TrackInfo & { rotation: 0 | 90 | 180 | 270; tkW: number; tkH: number }> = [];

  for (const trak of children(b, moov.body, moov.end).filter((c) => c.type === 'trak')) {
    const tkhd = child(b, trak, 'tkhd');
    const mdia = child(b, trak, 'mdia');
    const hdlr = child(b, mdia, 'hdlr');
    const mdhd = child(b, mdia, 'mdhd');
    const stbl = child(b, child(b, mdia, 'minf'), 'stbl');
    if (!mdia || !hdlr || !mdhd || !stbl) continue;
    const handler = fourcc(b, hdlr.body + 8);
    const kind: TrackInfo['kind'] = handler === 'vide' ? 'video' : handler === 'soun' ? 'audio' : 'other';

    const mv = b[mdhd.body]!;
    const timescale = dv.getUint32(mdhd.body + (mv === 1 ? 20 : 12));
    const mdur = mv === 1 ? Number(dv.getBigUint64(mdhd.body + 24)) : dv.getUint32(mdhd.body + 16);

    let rotation: 0 | 90 | 180 | 270 = 0;
    let tkW = 0;
    let tkH = 0;
    if (tkhd) {
      const v = b[tkhd.body]!;
      const m = tkhd.body + (v === 1 ? 52 : 40);
      const a = dv.getInt32(m) / 65536;
      const bb = dv.getInt32(m + 4) / 65536;
      const deg = ((Math.round((Math.atan2(bb, a) * 180) / Math.PI) % 360) + 360) % 360;
      rotation = (deg === 90 || deg === 180 || deg === 270 ? deg : 0) as 0 | 90 | 180 | 270;
      tkW = Math.round(dv.getUint32(m + 36) / 65536);
      tkH = Math.round(dv.getUint32(m + 40) / 65536);
    }

    // Sample description: the codec, and the coded size for video.
    const stsd = child(b, stbl, 'stsd');
    let fc = '????';
    let codec = '????';
    let width: number | undefined;
    let height: number | undefined;
    if (stsd) {
      const entry = children(b, stsd.body + 8, stsd.end)[0];
      if (entry) {
        fc = entry.type;
        codec = fc;
        if (kind === 'video' && entry.end - entry.body >= 28) {
          width = dv.getUint16(entry.body + 24);
          height = dv.getUint16(entry.body + 26);
          const avcC = children(b, entry.body + 78, entry.end).find((c) => c.type === 'avcC');
          if (avcC && (fc === 'avc1' || fc === 'avc3')) codec = `${fc}.${hex2(b[avcC.body + 1]!)}${hex2(b[avcC.body + 2]!)}${hex2(b[avcC.body + 3]!)}`;
        }
        if (kind === 'audio' && fc === 'mp4a') {
          const aot = esdsAudioObjectType(b, entry.body, entry.end);
          if (aot) codec = `mp4a.40.${aot}`;
        }
      }
    }

    const ends = sampleEnds(b, dv, stbl, timescale);
    tracks.push({ kind, fourcc: fc, codec, durationS: timescale > 0 && mdur > 0 ? mdur / timescale : null, width, height, ends, rotation, tkW, tkH });
  }
  return { durationS, fragmented, tracks };
}

/** Audio object type from the esds inside an mp4a entry (QuickTime may nest it in 'wave'); scans for the box. */
function esdsAudioObjectType(b: Uint8Array, from: number, to: number): number | null {
  for (let i = from; i + 8 < to; i++) {
    if (b[i] !== 0x65 || fourcc(b, i) !== 'esds') continue;
    let p = i + 8; // past type, version and flags
    const end = to;
    const len = () => {
      let n = 0;
      for (let k = 0; k < 4 && p < end; k++) {
        const x = b[p++]!;
        n = (n << 7) | (x & 0x7f);
        if (!(x & 0x80)) break;
      }
      return n;
    };
    if (b[p++] !== 0x03) return null;
    len();
    p += 2;
    const flags = b[p++]!;
    if (flags & 0x80) p += 2;
    if (flags & 0x40) p += 1 + b[p]!;
    if (flags & 0x20) p += 2;
    if (b[p++] !== 0x04) return null;
    len();
    p += 13;
    if (b[p++] !== 0x05) return null;
    len();
    let aot = b[p]! >> 3;
    if (aot === 31) aot = 32 + (((b[p]! & 7) << 3) | (b[p + 1]! >> 5));
    return aot || null;
  }
  return null;
}

/** For each preview time, the byte offset just past the last sample (of this track) whose decode time is before it. */
function sampleEnds(b: Uint8Array, dv: DataView, stbl: Box, timescale: number): Record<string, number> {
  const out: Record<string, number> = {};
  const stts = child(b, stbl, 'stts');
  const stsc = child(b, stbl, 'stsc');
  const stsz = child(b, stbl, 'stsz') ?? child(b, stbl, 'stz2');
  const stco = child(b, stbl, 'stco') ?? child(b, stbl, 'co64');
  if (!stts || !stsc || !stsz || !stco || !(timescale > 0)) return out;

  const sttsN = dv.getUint32(stts.body + 4);
  const stscN = dv.getUint32(stsc.body + 4);
  const chunkN = dv.getUint32(stco.body + 4);
  const wide = stco.type === 'co64';
  const chunkOffset = (i: number) => (wide ? Number(dv.getBigUint64(stco.body + 8 + i * 8)) : dv.getUint32(stco.body + 8 + i * 4));
  let sampleSize: (i: number) => number;
  if (stsz.type === 'stsz') {
    const fixed = dv.getUint32(stsz.body + 4);
    sampleSize = fixed ? () => fixed : (i) => dv.getUint32(stsz.body + 12 + i * 4);
  } else {
    const field = b[stsz.body + 7]!;
    sampleSize = (i) => (field === 16 ? dv.getUint16(stsz.body + 12 + i * 2) : field === 8 ? b[stsz.body + 12 + i]! : (b[stsz.body + 12 + (i >> 1)]! >> (i & 1 ? 0 : 4)) & 15);
  }

  for (const sec of PREVIEW_SECONDS) {
    // How many samples start before `sec`.
    const limit = sec * timescale;
    let t = 0;
    let n = 0;
    for (let e = 0; e < sttsN && t < limit; e++) {
      const count = dv.getUint32(stts.body + 8 + e * 8);
      const delta = dv.getUint32(stts.body + 12 + e * 8);
      if (!delta) {
        n += count;
        continue;
      }
      const take = Math.min(count, Math.ceil((limit - t) / delta));
      n += take;
      t += take * delta;
    }
    // Walk chunks until n samples are placed.
    let sample = 0;
    let maxEnd = 0;
    let run = 0;
    for (let c = 0; c < chunkN && sample < n; c++) {
      while (run + 1 < stscN && dv.getUint32(stsc.body + 8 + (run + 1) * 12) - 1 <= c) run++;
      const perChunk = dv.getUint32(stsc.body + 12 + run * 12);
      let off = chunkOffset(c);
      for (let s = 0; s < perChunk && sample < n; s++, sample++) {
        off += sampleSize(sample);
        if (off > maxEnd) maxEnd = off;
      }
    }
    out[sec] = maxEnd;
  }
  return out;
}

/** Walks top-level boxes with small reads and parses the moov box. Three to four reads for most files. */
export async function sniff(read: ReadFn, size: number): Promise<MediaInfo> {
  let reads = 0;
  let bytesRead = 0;
  const get = async (a: number, z: number) => {
    reads++;
    const out = await read(a, z);
    bytesRead += out.length;
    return out;
  };
  const head = await get(0, Math.min(size, HEAD) - 1);
  const dvh = new DataView(head.buffer, head.byteOffset, head.byteLength);
  const brand = head.length >= 12 && fourcc(head, 4) === 'ftyp' ? fourcc(head, 8) : '';
  const container: MediaInfo['container'] = brand === 'qt  ' ? 'mov' : brand ? 'mp4' : 'unknown';

  // Top-level walk.
  let off = 0;
  let moov: { offset: number; size: number } | null = null;
  let sawMdat = false;
  let fragmented = false;
  for (let guard = 0; off + 8 <= size && guard < MAX_HOPS; guard++) {
    let hdr: Uint8Array;
    let hv: DataView;
    let base: number;
    if (off + 16 <= head.length) {
      hdr = head;
      hv = dvh;
      base = off;
    } else {
      hdr = await get(off, Math.min(size, off + 16) - 1);
      hv = new DataView(hdr.buffer, hdr.byteOffset, hdr.byteLength);
      base = 0;
    }
    let len = hv.getUint32(base);
    const type = fourcc(hdr, base + 4);
    if (len === 1) len = Number(hv.getBigUint64(base + 8));
    else if (len === 0) len = size - off;
    if (len < 8 || !/^[\x20-\x7e]{4}$/.test(type)) break;
    if (type === 'moov') {
      moov = { offset: off, size: len };
      break;
    }
    if (type === 'mdat') sawMdat = true;
    if (type === 'moof') fragmented = true;
    off += len;
  }

  const info: MediaInfo = {
    size,
    isoBmff: head.length >= 8 && FIRST_BOXES.has(fourcc(head, 4)),
    brand,
    container,
    moov: null,
    fragmented,
    durationS: null,
    width: null,
    height: null,
    rotation: 0,
    video: null,
    audio: null,
    bitrateKbps: null,
    previewEnds: {},
    reads,
    bytesRead,
  };
  if (!moov || moov.size > MAX_MOOV) {
    info.reads = reads;
    info.bytesRead = bytesRead;
    return info;
  }

  const buf = moov.offset + moov.size <= head.length ? head.subarray(moov.offset, moov.offset + moov.size) : await get(moov.offset, moov.offset + moov.size - 1);
  const parsed = readMoov(buf, { type: 'moov', start: 0, body: 8, end: buf.length });
  info.moov = { ...moov, at: sawMdat ? 'end' : 'start' };
  info.fragmented = fragmented || parsed.fragmented;
  const v = parsed.tracks.find((t) => t.kind === 'video') ?? null;
  const a = parsed.tracks.find((t) => t.kind === 'audio') ?? null;
  info.durationS = parsed.durationS ?? v?.durationS ?? a?.durationS ?? null;
  if (v) {
    const w = v.tkW || v.width || 0;
    const h = v.tkH || v.height || 0;
    info.rotation = v.rotation;
    [info.width, info.height] = v.rotation === 90 || v.rotation === 270 ? [h, w] : [w, h];
  }
  const strip = (t: (typeof parsed.tracks)[number] | null): TrackInfo | null => (t ? { kind: t.kind, fourcc: t.fourcc, codec: t.codec, durationS: t.durationS, width: t.width, height: t.height, ends: t.ends } : null);
  info.video = strip(v);
  info.audio = strip(a);
  if (info.durationS && info.durationS > 0) info.bitrateKbps = Math.round((size * 8) / info.durationS / 1000);
  // A preview needs every track's samples up to the time, plus the moov when it sits at the end.
  for (const sec of PREVIEW_SECONDS) {
    const ends = parsed.tracks.filter((t) => t.kind !== 'other').map((t) => t.ends[sec] ?? 0);
    if (ends.length && ends.every((e) => e > 0)) info.previewEnds[sec] = Math.max(...ends, info.moov.at === 'start' ? moov.offset + moov.size : 0);
  }
  info.reads = reads;
  info.bytesRead = bytesRead;
  return info;
}

/**
 * What D1 keeps (videos.mega_meta and mega_probes.meta, JSON) so the stream and the lists never sniff again. `prev` holds the
 * byte offsets that hold the first 3, 6 and 10 seconds, which bound the stream's ?preview= answers (V2-SPEC 2.4.4).
 */
export interface SniffMeta {
  w: number | null;
  h: number | null;
  rot: 0 | 90 | 180 | 270;
  dur: number | null;
  kbps: number | null;
  vc: string | null;
  ac: string | null;
  moov: 'start' | 'end' | null;
  frag: boolean;
  prev: Record<string, number>;
}

export function metaForD1(info: MediaInfo): SniffMeta {
  return {
    w: info.width,
    h: info.height,
    rot: info.rotation,
    dur: info.durationS ? Math.round(info.durationS * 1000) : null,
    kbps: info.bitrateKbps,
    vc: info.video?.codec ?? null,
    ac: info.audio?.codec ?? null,
    moov: info.moov?.at ?? null,
    frag: info.fragmented,
    prev: info.previewEnds,
  };
}

export function parseSniffMeta(json: string | null | undefined): SniffMeta | null {
  if (!json) return null;
  try {
    const m = JSON.parse(json) as SniffMeta;
    return m && typeof m === 'object' ? m : null;
  } catch {
    return null;
  }
}
