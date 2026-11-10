import { describe, expect, it } from 'vitest';
import { parseInstagram, parseYouTube, youTubeIdOf } from './socialLinks.ts';

describe('parseInstagram', () => {
  it.each([
    ['https://www.instagram.com/reel/CxYz123abc/?igsh=MWQ1', 'https://www.instagram.com/reel/CxYz123abc/'],
    ['https://www.instagram.com/reels/MnO345pqr/', 'https://www.instagram.com/reel/MnO345pqr/'],
    ['https://instagram.com/p/GhI789jkl', 'https://www.instagram.com/p/GhI789jkl/'],
    ['https://m.instagram.com/tv/AbC123xyz/', 'https://www.instagram.com/tv/AbC123xyz/'],
    ['https://www.instagram.com/kreators.army/reel/DeF456ghi/', 'https://www.instagram.com/reel/DeF456ghi/'],
    ['instagram.com/reel/CxYz123abc', 'https://www.instagram.com/reel/CxYz123abc/'],
    ['https://instagr.am/p/GhI789jkl/', 'https://www.instagram.com/p/GhI789jkl/'],
  ])('%s', (input, url) => {
    expect(parseInstagram(input)).toEqual({ ok: true, url });
  });

  it.each([
    ['https://www.instagram.com/kreators.army/', 'not-a-post'],
    ['https://www.instagram.com/reel/abc/', 'not-a-post'],
    ['https://www.instagram.com/a/b/reel/CxYz123abc/', 'not-a-post'],
    ['https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'not-instagram'],
    ['javascript:alert(1)', 'not-instagram'],
    ['https://instagram.com.evil.example/reel/CxYz123abc/', 'not-instagram'],
  ])('refuses %s (%s)', (input, problem) => {
    expect(parseInstagram(input)).toEqual({ ok: false, problem });
  });
});

describe('parseYouTube', () => {
  const ID = 'dQw4w9WgXcQ';
  it.each([
    [`https://www.youtube.com/watch?v=${ID}&t=4s`, `https://www.youtube.com/watch?v=${ID}`, false],
    [`https://youtube.com/shorts/${ID}?si=abc`, `https://www.youtube.com/shorts/${ID}`, true],
    [`https://youtu.be/${ID}?si=abc`, `https://www.youtube.com/watch?v=${ID}`, false],
    [`https://m.youtube.com/watch?v=${ID}`, `https://www.youtube.com/watch?v=${ID}`, false],
    [`https://music.youtube.com/watch?v=${ID}`, `https://www.youtube.com/watch?v=${ID}`, false],
    [`https://www.youtube.com/live/${ID}?feature=share`, `https://www.youtube.com/watch?v=${ID}`, false],
    [`https://www.youtube-nocookie.com/embed/${ID}`, `https://www.youtube.com/watch?v=${ID}`, false],
    [`https://www.youtube.com/v/${ID}`, `https://www.youtube.com/watch?v=${ID}`, false],
    [`youtu.be/${ID}`, `https://www.youtube.com/watch?v=${ID}`, false],
  ])('%s', (input, url, shorts) => {
    expect(parseYouTube(input)).toEqual({ ok: true, url, id: ID, shorts });
  });

  it.each([
    ['https://www.youtube.com/@kreators', 'not-a-video'],
    ['https://www.youtube.com/channel/UC123', 'not-a-video'],
    ['https://www.youtube.com/watch?v=short', 'not-a-video'],
    ['https://notyoutube.com/watch?v=dQw4w9WgXcQ', 'not-youtube'],
    ['https://www.instagram.com/reel/CxYz123abc/', 'not-youtube'],
  ])('refuses %s (%s)', (input, problem) => {
    expect(parseYouTube(input)).toEqual({ ok: false, problem });
  });

  it('reads the id of a stored link', () => {
    expect(youTubeIdOf(`https://www.youtube.com/shorts/${ID}`)).toBe(ID);
  });
});
