import { describe, expect, it } from 'vitest';
import { sha256Hex } from '../src/mega/protocol';
import { posterUrl, problemsFor, toAdminVideo, toPublicVideo, type PublicRow, type VideoRow } from '../src/videoRows';

// Synthetic keys (never a real link).
const K = 'xAb8Winxbew-6pdl9CyAHKrBNegZbIL-l0uw6PrYs3w';
const FK = 'AbCdEfGhIjKlMnOpQrStUv';
const NODE_KEY = 'zCrPnjartIGIkPYb7mUuosmoCbN6lZa-uO4KOEk8ox0';
const META_OK = JSON.stringify({ w: 720, h: 1280, rot: 0, dur: 49000, kbps: 3100, vc: 'avc1.64001f', ac: 'mp4a.40.2', moov: 'start', frag: false, prev: { 3: 400000, 6: 900000, 10: 1500000 } });
const META_4K = JSON.stringify({ w: 2160, h: 3840, rot: 0, dur: 49883, kbps: 23344, vc: 'avc1.640033', ac: 'mp4a.40.2', moov: 'start', frag: false, prev: { 3: 9e6, 6: 19643049, 10: 3e7 } });

const base: PublicRow = {
  id: 'v1',
  title: 'Street interview',
  brand: 'CircleStore.in',
  category: 'Fashion',
  platform: 'Instagram Reels',
  aspect: 'vertical',
  views: 60000,
  featured: 1,
  mega_handle: null,
  mega_url: null,
  mega_meta: null,
  mega_duration_ms: null,
  file_ref: null,
  wave_ref: null,
  instagram_url: null,
  youtube_url: null,
  poster_url: null,
  poster_sha: null,
  poster_mime: null,
};

const rows: Record<string, PublicRow> = {
  mega: { ...base, id: 'seed-fyndflow', mega_handle: 'RoDe0001', mega_url: `https://mega.nz/file/RoDe0001#${K}`, mega_meta: META_OK, mega_duration_ms: 49000, file_ref: '/media/fyndflow.mp4', instagram_url: 'https://www.instagram.com/reel/CxYz123abc/', youtube_url: 'https://www.youtube.com/shorts/dQw4w9WgXcQ', poster_sha: '0123456789abcdef', poster_mime: 'image/webp' },
  megaSecret: { ...base, id: 'seed-circlestore-1', mega_handle: 'NmU3lZjR', mega_url: null, file_ref: '/media/circlestore-1.mp4', poster_url: '/media/circlestore-1.jpg' },
  heavy: { ...base, id: 'heavy', mega_handle: 'HeAvY001', mega_url: `https://mega.nz/file/HeAvY001#${K}`, mega_meta: META_4K, mega_duration_ms: 49883 },
  folderFile: { ...base, id: 'folder', mega_handle: 'NoDe0001', mega_url: `https://mega.nz/folder/FoLdEr01#${FK}/file/NoDe0001`, mega_meta: META_OK },
  bundled: { ...base, id: 'seed-rode', file_ref: '/media/rode.mp4', poster_url: '/media/rode.jpg' },
  youtube: { ...base, id: 'legacy-yt', youtube_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
  wave: { ...base, id: 'legacy-wave', wave_ref: 'https://embed.wave.video/AbCdEf123', youtube_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
};

describe('toPublicVideo (V2-SPEC 2.10)', () => {
  it('(pv) a stored hover clip gives previewUrl at its versioned address, whatever previewOk says', async () => {
    const v = await toPublicVideo({ ...rows.heavy!, preview_sha: '0123456789abcdef', preview_mime: 'video/mp4' });
    expect(v.previewOk).toBe(false);
    expect(v.previewUrl).toBe('/media/pv/heavy/0123456789abcdef.mp4');
    expect((await toPublicVideo({ ...rows.bundled!, preview_sha: 'fedcba9876543210', preview_mime: 'video/webm' })).previewUrl).toBe('/media/pv/seed-rode/fedcba9876543210.webm');
  });

  it('a MEGA row: same-origin stream with the version tag, bundled fallback, stored poster, measured preview, links', async () => {
    const v = await toPublicVideo(rows.mega!);
    const tag = await sha256Hex(`https://mega.nz/file/RoDe0001#${K}`, 8);
    expect(v).toEqual({
      id: 'seed-fyndflow',
      title: 'Street interview',
      brand: 'CircleStore.in',
      category: 'Fashion',
      platform: 'Instagram Reels',
      aspect: 'vertical',
      views: 60000,
      featured: true,
      streamUrl: `/media/v/seed-fyndflow.mp4?v=${tag}`,
      fallbackUrl: '/media/fyndflow.mp4',
      embedUrl: null,
      posterUrl: '/media/p/seed-fyndflow/0123456789abcdef.webp',
      previewOk: true,
      previewUrl: null,
      durationMs: 49000,
      links: { instagram: 'https://www.instagram.com/reel/CxYz123abc/', youtube: 'https://www.youtube.com/shorts/dQw4w9WgXcQ' },
      source: 'file',
      ref: `/media/v/seed-fyndflow.mp4?v=${tag}`,
    });
  });

  it('a MEGA row whose key is still in the secret: tag of "secret:<handle>", no preview until sniffed', async () => {
    const v = await toPublicVideo(rows.megaSecret!);
    expect(v.streamUrl).toBe(`/media/v/seed-circlestore-1.mp4?v=${await sha256Hex('secret:NmU3lZjR', 8)}`);
    expect(v.previewOk).toBe(false);
    expect(v.fallbackUrl).toBe('/media/circlestore-1.mp4');
    expect(v.posterUrl).toBe('/media/circlestore-1.jpg');
  });

  it('the 4K file never previews; a file in a folder streams by its own id', async () => {
    expect((await toPublicVideo(rows.heavy!)).previewOk).toBe(false);
    const f = await toPublicVideo(rows.folderFile!);
    expect(f.streamUrl).toMatch(/^\/media\/v\/folder\.mp4\?v=[0-9a-f]{8}$/);
    expect(f.previewOk).toBe(true);
  });

  it('a bundled file streams itself and previews', async () => {
    const v = await toPublicVideo(rows.bundled!);
    expect(v).toMatchObject({ streamUrl: '/media/rode.mp4', fallbackUrl: null, embedUrl: null, previewOk: true, source: 'file', ref: '/media/rode.mp4', posterUrl: '/media/rode.jpg' });
  });

  it('a YouTube-only entry plays the nocookie embed with YouTube\'s thumbnail; wave keeps its player', async () => {
    expect(await toPublicVideo(rows.youtube!)).toMatchObject({
      streamUrl: null,
      embedUrl: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1&rel=0&playsinline=1',
      posterUrl: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
      previewOk: false,
      source: 'youtube',
      ref: 'dQw4w9WgXcQ',
    });
    expect(await toPublicVideo(rows.wave!)).toMatchObject({ streamUrl: null, embedUrl: 'https://embed.wave.video/AbCdEf123', posterUrl: null, source: 'wave', ref: 'https://embed.wave.video/AbCdEf123' });
  });

  it('the JSON of every kind holds no mega.nz, no mega_ name, no key, no folder handle and no import id', async () => {
    const json = JSON.stringify(await Promise.all(Object.values(rows).map((r) => toPublicVideo({ ...r, import_id: 'imp_20261110_abcdef' } as PublicRow))));
    expect(json).not.toContain('mega.nz');
    expect(json).not.toContain('mega_');
    expect(json).not.toContain(K);
    expect(json).not.toContain(FK);
    expect(json).not.toContain(NODE_KEY);
    expect(json).not.toContain('FoLdEr01');
    expect(json).not.toContain('imp_');
    // A handle appears only inside a poster or stream path of its own row, never as a field: here, never at all.
    expect(json).not.toMatch(/RoDe0001|NmU3lZjR|HeAvY001|NoDe0001/);
  });
});

describe('posterUrl order (V2-SPEC 2.5)', () => {
  it('stored, then v1, then YouTube for a YouTube-only entry, else null', () => {
    expect(posterUrl({ ...base, poster_sha: 'ffffffffffffffff', poster_mime: 'image/jpeg', poster_url: '/media/a.jpg' })).toBe('/media/p/v1/ffffffffffffffff.jpg');
    expect(posterUrl({ ...base, poster_url: '/media/a.jpg', youtube_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' })).toBe('/media/a.jpg');
    expect(posterUrl({ ...base, file_ref: '/media/a.mp4', youtube_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' })).toBeNull();
    expect(posterUrl(base)).toBeNull();
  });
});

describe('admin rows: problems and the admin shape', () => {
  const admin = (over: Partial<VideoRow>): VideoRow =>
    ({
      ...base,
      sort_order: 10,
      published: 0,
      created_at: '2026-11-10 10:00:00',
      updated_at: '2026-11-10 10:00:00.123',
      source: 'none',
      mega_name: null,
      mega_size: null,
      mega_width: null,
      mega_height: null,
      mega_bitrate: null,
      mega_codec: null,
      mega_fast_start: null,
      mega_checked_at: null,
      mega_error: null,
      import_id: null,
      deleted_at: null,
      poster_width: null,
      poster_height: null,
      poster_time_ms: null,
      ...over,
    }) as VideoRow;
  const facts = { mega_name: 'clip.mov', mega_size: 145561719, mega_width: 2160, mega_height: 3840, mega_duration_ms: 49883, mega_bitrate: 23344000, mega_codec: 'hvc1+mp4a', mega_fast_start: 1 };

  it('blocking problems first: no brand, no stream; HEVC; then warnings', () => {
    expect(problemsFor(admin({ brand: ' ', source: 'none' }))).toEqual(['no-brand', 'no-stream', 'no-poster']);
    const hevc = admin({ mega_handle: 'HeVc0001', mega_url: `https://mega.nz/file/HeVc0001#${K}`, source: 'mega', ...facts });
    expect(problemsFor(hevc)).toEqual(['hevc', 'no-poster', 'mega-too-heavy']);
    expect(problemsFor(admin({ mega_handle: 'NmU3lZjR', source: 'mega', file_ref: '/media/x.mp4', poster_url: '/media/x.jpg' }))).toEqual(['mega-key-in-secret']);
    expect(problemsFor(admin({ mega_handle: 'GoNe0001', mega_url: `https://mega.nz/file/GoNe0001#${K}`, source: 'mega', mega_error: 'not-found', poster_url: '/media/x.jpg' }))).toEqual(['mega-unreachable']);
    expect(problemsFor(admin({ youtube_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', source: 'youtube' }))).toEqual(['no-mega']);
  });

  it('the admin shape carries the MEGA facts, grade and embed (admin only)', async () => {
    const v = await toAdminVideo(admin({ mega_handle: 'RoDe0001', mega_url: `https://mega.nz/file/RoDe0001#${K}`, source: 'mega', ...facts, mega_codec: 'avc1+mp4a', mega_checked_at: '2026-11-10 10:00:00', mega_meta: META_4K }));
    expect(v.mega).toMatchObject({ handle: 'RoDe0001', kind: 'file', keyIn: 'library', grade: 'too-heavy', playable: true, previewOk: false, embedUrl: `https://mega.nz/embed/RoDe0001#${K}`, checkedAt: '2026-11-10T10:00:00.000Z' });
    expect(v.mega?.meta).toMatchObject({ width: 2160, height: 3840, codec: 'avc1+mp4a', fastStart: true });
    expect(v.streamUrl).toMatch(/^\/media\/v\/v1\.mp4\?v=[0-9a-f]{8}$/);
    expect(v.updatedAt).toBe('2026-11-10 10:00:00.123');
  });
});
