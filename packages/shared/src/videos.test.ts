import { describe, expect, it } from 'vitest';
import { formatViews, isMegaStream, isValidPosterUrl, parseVideoRef, previewSrc, probeSrc, videoEmbedUrl, videoPoster } from './videos.ts';

const ID = 'dQw4w9WgXcQ';

describe('parseVideoRef', () => {
  it.each([
    `https://www.youtube.com/watch?v=${ID}`,
    `https://www.youtube.com/watch?list=abc&v=${ID}&t=4s`,
    `https://youtu.be/${ID}?si=abc`,
    `https://www.youtube.com/shorts/${ID}`,
    `https://www.youtube.com/embed/${ID}`,
    `https://www.youtube-nocookie.com/embed/${ID}`,
    `<iframe width="560" src="https://www.youtube.com/embed/${ID}?si=x&amp;a=1" allowfullscreen></iframe>`,
  ])('reads a YouTube id from %s', (input) => {
    expect(parseVideoRef(input)).toEqual({ source: 'youtube', ref: ID });
  });

  it('keeps a wave.video player address whole', () => {
    const url = 'https://embed.wave.video/AbCdEf123';
    expect(parseVideoRef(url)).toEqual({ source: 'wave', ref: url });
    expect(parseVideoRef(`<iframe src='${url}'></iframe>`)).toEqual({ source: 'wave', ref: url });
  });

  it('accepts a file under /media/', () => {
    expect(parseVideoRef('/media/rode.mp4')).toEqual({ source: 'file', ref: '/media/rode.mp4' });
  });

  it.each([
    'https://evil.example/embed/x',
    'https://wave.video.evil.example/embed/x',
    'https://notyoutube.com/watch?v=dQw4w9WgXcQ',
    'https://www.youtube.com/watch?v=short',
    'http://embed.wave.video/AbCdEf123',
    'https://wave.video/pricing',
    'https://www.wave.video/',
    'javascript:alert(1)',
    '/media/../secret.mp4',
    'not a url',
    '<iframe src="https://evil.example/x"></iframe>',
  ])('refuses %s', (input) => {
    expect(parseVideoRef(input)).toBeNull();
  });
});

describe('embeds and posters', () => {
  it('uses the privacy-enhanced YouTube player', () => {
    expect(videoEmbedUrl({ source: 'youtube', ref: ID })).toContain('https://www.youtube-nocookie.com/embed/');
  });

  it('has no iframe for a file', () => {
    expect(videoEmbedUrl({ source: 'file', ref: '/media/a.mp4' })).toBeNull();
  });

  it('falls back to the YouTube thumbnail only when no poster is set', () => {
    expect(videoPoster({ source: 'youtube', ref: ID, posterUrl: null })).toContain(ID);
    expect(videoPoster({ source: 'youtube', ref: ID, posterUrl: '/media/a.jpg' })).toBe('/media/a.jpg');
    expect(videoPoster({ source: 'wave', ref: 'https://embed.wave.video/a', posterUrl: null })).toBeNull();
  });

  it('checks poster addresses', () => {
    expect(isValidPosterUrl('/media/a.jpg')).toBe(true);
    expect(isValidPosterUrl('https://cdn.example/a.png')).toBe(true);
    expect(isValidPosterUrl('javascript:alert(1)')).toBe(false);
    expect(isValidPosterUrl('http://cdn.example/a.png')).toBe(false);
  });
});

describe('formatViews', () => {
  it.each([
    [11_000_000, '11M'],
    [1_500_000, '1.5M'],
    [210_000, '210K'],
    [999, '999'],
  ])('%d reads %s', (n, label) => {
    expect(formatViews(n)).toBe(label);
  });
});

describe('v2 stream helpers', () => {
  const mega = { streamUrl: '/media/v/seed-fyndflow.mp4?v=0123abcd' };
  const file = { streamUrl: '/media/ansh-mehra.mp4' };
  const embed = { streamUrl: null };

  it('tells a MEGA stream from a bundled file', () => {
    expect(isMegaStream(mega)).toBe(true);
    expect(isMegaStream(file)).toBe(false);
    expect(isMegaStream(embed)).toBe(false);
  });

  it('previews MEGA bounded to 6 s, a bundled file as it is, and never an embed', () => {
    expect(previewSrc(mega)).toBe('/media/v/seed-fyndflow.mp4?v=0123abcd&preview=6');
    expect(previewSrc({ streamUrl: '/media/v/x.mp4' })).toBe('/media/v/x.mp4?preview=6');
    expect(previewSrc(file)).toBe('/media/ansh-mehra.mp4');
    expect(previewSrc(embed)).toBeNull();
  });

  it('probes only MEGA streams', () => {
    expect(probeSrc(mega)).toBe('/media/v/seed-fyndflow.mp4?v=0123abcd&probe=1');
    expect(probeSrc(file)).toBeNull();
    expect(probeSrc(embed)).toBeNull();
  });
});
