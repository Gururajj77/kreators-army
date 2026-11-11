import { describe, expect, it } from 'vitest';
import { posterUrl, problemsFor, toAdminVideo, toPublicVideo, type PublicRow, type VideoRow } from '../src/videoRows';

// Synthetic keys (never a real link).
const K = 'xAb8Winxbew-6pdl9CyAHKrBNegZbIL-l0uw6PrYs3w';
const FK = 'AbCdEfGhIjKlMnOpQrStUv';
const K2 = 'Zz9y8XwVuTsRqPoNmLkJiHgFeDcBa_-0123456789ab';
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

  it('a MEGA file link: MEGA\'s own embed, no stream through this site, bundled copy kept, stored poster, no stream preview', async () => {
    const v = await toPublicVideo(rows.mega!);
    expect(v).toEqual({
      id: 'seed-fyndflow',
      title: 'Street interview',
      brand: 'CircleStore.in',
      category: 'Fashion',
      platform: 'Instagram Reels',
      aspect: 'vertical',
      views: 60000,
      featured: true,
      streamUrl: null,
      fallbackUrl: '/media/fyndflow.mp4',
      embedUrl: `https://mega.nz/embed/RoDe0001#${K}`,
      watchUrl: null,
      posterUrl: '/media/p/seed-fyndflow/0123456789abcdef.webp',
      previewOk: false,
      previewUrl: null,
      durationMs: 49000,
      links: { instagram: 'https://www.instagram.com/reel/CxYz123abc/', youtube: 'https://www.youtube.com/shorts/dQw4w9WgXcQ' },
      source: 'mega',
      ref: `https://mega.nz/embed/RoDe0001#${K}`,
    });
  });

  it('a MEGA row whose key is still in the secret: the embed is built from the secret line with the same handle', async () => {
    const links = `old one https://mega.nz/file/OtHeR001#${K}\nhttps://mega.nz/file/NmU3lZjR#${K2}`;
    const v = await toPublicVideo(rows.megaSecret!, links);
    expect(v).toMatchObject({ streamUrl: null, embedUrl: `https://mega.nz/embed/NmU3lZjR#${K2}`, watchUrl: null, source: 'mega', previewOk: false, fallbackUrl: '/media/circlestore-1.mp4', posterUrl: '/media/circlestore-1.jpg' });
    // No secret (or no matching line): nothing MEGA to play; the bundled copy is what v1 tabs get.
    expect(await toPublicVideo(rows.megaSecret!)).toMatchObject({ streamUrl: null, embedUrl: null, watchUrl: null, source: 'file', ref: '/media/circlestore-1.mp4', fallbackUrl: '/media/circlestore-1.mp4' });
    expect(await toPublicVideo(rows.megaSecret!, `https://mega.nz/file/OtHeR001#${K}`)).toMatchObject({ embedUrl: null });
  });

  it('a file in a shared folder has no MEGA embed: MEGA\'s own page instead; a link for another handle plays nothing', async () => {
    const f = await toPublicVideo(rows.folderFile!);
    expect(f).toMatchObject({ streamUrl: null, embedUrl: null, watchUrl: `https://mega.nz/folder/FoLdEr01#${FK}/file/NoDe0001`, previewOk: false, source: 'mega', ref: `https://mega.nz/folder/FoLdEr01#${FK}/file/NoDe0001` });
    const wrong = await toPublicVideo({ ...rows.mega!, mega_handle: 'OtHeR001' });
    expect(wrong).toMatchObject({ embedUrl: null, watchUrl: null, streamUrl: null });
  });

  it('a stored hover clip is the only preview a MEGA entry has, whatever its file facts say', async () => {
    expect((await toPublicVideo(rows.heavy!)).previewOk).toBe(false);
    expect((await toPublicVideo({ ...rows.mega!, mega_meta: META_OK })).previewOk).toBe(false);
  });

  it('a bundled file streams itself and previews', async () => {
    const v = await toPublicVideo(rows.bundled!);
    expect(v).toMatchObject({ streamUrl: '/media/rode.mp4', fallbackUrl: null, embedUrl: null, watchUrl: null, previewOk: true, source: 'file', ref: '/media/rode.mp4', posterUrl: '/media/rode.jpg' });
  });

  it('a YouTube-only entry plays the nocookie embed with YouTube\'s thumbnail; wave keeps its player', async () => {
    expect(await toPublicVideo(rows.youtube!)).toMatchObject({
      streamUrl: null,
      embedUrl: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1&rel=0&playsinline=1',
      watchUrl: null,
      posterUrl: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
      previewOk: false,
      source: 'youtube',
      ref: 'dQw4w9WgXcQ',
    });
    expect(await toPublicVideo(rows.wave!)).toMatchObject({ streamUrl: null, embedUrl: 'https://embed.wave.video/AbCdEf123', posterUrl: null, source: 'wave', ref: 'https://embed.wave.video/AbCdEf123' });
  });

  it('no address points at the Worker\'s old MEGA stream, and the JSON holds no mega_ name, no node key and no import id', async () => {
    const json = JSON.stringify(await Promise.all(Object.values(rows).map((r) => toPublicVideo({ ...r, import_id: 'imp_20261110_abcdef', mega_key: NODE_KEY } as PublicRow, `https://mega.nz/file/NmU3lZjR#${K2}`))));
    expect(json).not.toContain('/media/v/');
    expect(json).not.toContain('/media/mega-');
    expect(json).not.toContain('mega_');
    expect(json).not.toContain(NODE_KEY);
    expect(json).not.toContain('imp_');
    // MEGA addresses appear only as the two public forms (the founder accepted that an embed carries its file key).
    for (const m of json.match(/https:\/\/mega\.nz\/[^"]*/g) ?? []) expect(m).toMatch(/^https:\/\/mega\.nz\/(embed\/[\w-]{8}#[\w-]{43}|folder\/[\w-]{8}#[\w-]{22}\/file\/[\w-]{8})$/);
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
    expect(v.streamUrl).toBeNull();
    expect(v.updatedAt).toBe('2026-11-10 10:00:00.123');
  });
});
