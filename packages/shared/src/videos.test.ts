import { describe, expect, it } from 'vitest';
import { formatViews, isMegaEmbed, isValidPosterUrl, megaPlayerUrls, parseVideoRef, playerEmbedSrc, previewSrc, videoEmbedUrl, videoPoster } from './videos.ts';

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

describe('MEGA embed helpers (pub8)', () => {
  const K = 'xAb8Winxbew-6pdl9CyAHKrBNegZbIL-l0uw6PrYs3w';
  const FK = 'AbCdEfGhIjKlMnOpQrStUv';

  it('a file link has MEGA\'s embed; a file in a folder has MEGA\'s page; a folder has neither', () => {
    expect(megaPlayerUrls({ kind: 'file', handle: 'RoDe0001', key43: K })).toEqual({ embedUrl: `https://mega.nz/embed/RoDe0001#${K}`, watchUrl: null });
    expect(megaPlayerUrls({ kind: 'folder-file', folderHandle: 'FoLdEr01', folderKey22: FK, nodeHandle: 'NoDe0001' })).toEqual({ embedUrl: null, watchUrl: `https://mega.nz/folder/FoLdEr01#${FK}/file/NoDe0001` });
    expect(megaPlayerUrls({ kind: 'folder', folderHandle: 'FoLdEr01', folderKey22: FK })).toEqual({ embedUrl: null, watchUrl: null });
  });

  it('only a clean MEGA embed counts, and only it gets MEGA\'s autoplay option', () => {
    const embed = `https://mega.nz/embed/RoDe0001#${K}`;
    expect(isMegaEmbed(embed)).toBe(true);
    expect(isMegaEmbed(`${embed}!1a`)).toBe(false);
    expect(isMegaEmbed('https://mega.nz.evil.test/embed/RoDe0001#' + K)).toBe(false);
    expect(isMegaEmbed(null)).toBe(false);
    expect(playerEmbedSrc(embed)).toBe(`${embed}!1a`);
    expect(playerEmbedSrc('https://embed.wave.video/AbCdEf123')).toBe('https://embed.wave.video/AbCdEf123');
  });

  it('a stream preview is a bundled file only, never the old MEGA stream or an embed', () => {
    expect(previewSrc({ streamUrl: '/media/ansh-mehra.mp4' })).toBe('/media/ansh-mehra.mp4');
    expect(previewSrc({ streamUrl: '/media/v/x.mp4?v=0123abcd' })).toBeNull();
    expect(previewSrc({ streamUrl: null })).toBeNull();
  });
});
