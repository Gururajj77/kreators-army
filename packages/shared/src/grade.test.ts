import { describe, expect, it } from 'vitest';
import type { MegaMeta } from './admin.ts';
import { gradeLabel, isPlayable, megaWarnings, resolutionLabel, streamGrade } from './grade.ts';

const meta = (over: Partial<MegaMeta> = {}): MegaMeta => ({
  name: 'clip.mp4',
  size: 18_400_000,
  width: 720,
  height: 1280,
  durationMs: 49_000,
  bitrate: 3_100_000,
  codec: 'avc1+mp4a',
  fastStart: true,
  ...over,
});

// The founder's real test file, as measured (the numbers only; never the link).
const FOUNDER_4K = meta({ name: 'bad second hand buying experience.mov', size: 145_561_719, width: 2160, height: 3840, durationMs: 49_883, bitrate: Math.round((145_561_719 * 8) / 49.883) });

describe('streamGrade', () => {
  it('the 4K test file is too heavy', () => {
    expect(FOUNDER_4K.bitrate! / 1e6).toBeCloseTo(23.3, 1);
    expect(streamGrade(FOUNDER_4K)).toBe('too-heavy');
    expect(gradeLabel('too-heavy', FOUNDER_4K)).toBe(
      'This is 4K at 23.3 Mbps (145.6 MB), much heavier than the site needs, and phones will buffer. Upload a 720p H.264 version, about 2.5 to 5 Mbps.',
    );
  });
  it.each([
    [meta(), 'ready'],
    [meta({ width: 406, height: 720, bitrate: 760_000 }), 'ready'],
    [meta({ width: 1080, height: 1920, bitrate: 4_000_000 }), 'heavy'],
    [meta({ bitrate: 6_000_000 }), 'heavy'],
    [meta({ width: 1440, height: 2560 }), 'too-heavy'],
    [meta({ bitrate: 16_000_000 }), 'too-heavy'],
    [meta({ width: null }), 'unknown'],
    [meta({ durationMs: null }), 'unknown'],
    [null, 'unknown'],
  ] as const)('%#: %s', (m, grade) => {
    expect(streamGrade(m)).toBe(grade);
  });
  it('labels', () => {
    expect(gradeLabel('ready', meta())).toBe('Ready to stream. 720p at 3.1 Mbps, 18.4 MB.');
    expect(gradeLabel('heavy', meta({ width: 1080, height: 1920, bitrate: 4_000_000 }))).toMatch(/^This is 1080p at 4\.0 Mbps \(18\.4 MB\)\. Upload a 720p version/);
    expect(resolutionLabel(406, 720)).toBe('406p');
    expect(resolutionLabel(1920, 1080)).toBe('1080p');
  });
});

describe('megaWarnings and playability', () => {
  it('HEVC blocks publishing and says so', () => {
    const hevc = meta({ codec: 'hvc1+mp4a' });
    expect(isPlayable(hevc)).toBe(false);
    expect(megaWarnings(hevc).map((w) => w.code)).toEqual(['hevc']);
    expect(megaWarnings(hevc)[0]!.message).toBe("This file uses HEVC (H.265), which many browsers can't play. It can stay a draft; export it as H.264 to publish.");
  });
  it.each([
    [meta({ codec: 'av01+mp4a' }), ['video-codec'], false],
    [meta({ codec: 'avc1+lpcm' }), ['audio-codec'], true],
    [meta({ codec: 'avc1' }), ['no-audio'], true],
    [meta({ fastStart: false }), ['not-fast-start'], true],
    [meta({ codec: null, width: null, height: null, durationMs: null, bitrate: null, fastStart: null }), ['no-header-info'], true],
    [meta(), [], true],
  ] as const)('%#', (m, codes, playable) => {
    expect(megaWarnings(m).map((w) => w.code)).toEqual(codes);
    expect(isPlayable(m)).toBe(playable);
  });
});
