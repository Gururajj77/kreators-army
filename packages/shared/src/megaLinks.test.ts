import { describe, expect, it } from 'vitest';
import { canonicalMegaLink, findMegaLinks, joinMegaKey, megaStreamHandle, parseMegaLink, type ParsedMegaLink } from './megaLinks.ts';

// Synthetic keys only (never a real link).
const K = 'xAb8Winxbew-6pdl9CyAHKrBNegZbIL-l0uw6PrYs3w';
const FK = 'AbCdEfGhIjKlMnOpQrStUv';
const FILE = `https://mega.nz/file/RoDe0001#${K}`;

function link(input: string): ParsedMegaLink {
  const r = parseMegaLink(input);
  if (!r.ok) throw new Error(`not parsed: ${input} (${r.problem})`);
  return r.link;
}

describe('parseMegaLink: file links in every form', () => {
  it.each([
    [`https://mega.nz/file/RoDe0001#${K}`],
    [`https://mega.nz/#!RoDe0001!${K}`],
    [`https://mega.co.nz/#!RoDe0001!${K}`],
    [`https://mega.nz/embed/RoDe0001#${K}`],
    [`https://mega.nz/embed/RoDe0001#${K}!1a1m`],
    [`https://mega.nz/embed#!RoDe0001!${K}`],
    [`https://www.mega.nz/file/RoDe0001#${K}`],
    [`https://mega.app/file/RoDe0001#${K}`],
    [`https://mega.io/file/RoDe0001#${K}`],
    [`https://www.mega.io/embed/RoDe0001#${K}`],
    [`http://mega.nz/file/RoDe0001#${K}`],
    [`mega.nz/file/RoDe0001#${K}`],
    [`www.mega.nz/file/RoDe0001#${K}`],
    [`MEGA.NZ/file/RoDe0001#${K}`],
    [`  https://mega.nz/file/RoDe0001#${K}/  `],
    [`<iframe width="640" height="360" frameborder="0" src="https://mega.nz/embed/RoDe0001#${K}!1a1m" allowfullscreen allow="autoplay;"></iframe>`],
    [`&lt;iframe src=&quot;https://mega.nz/embed/RoDe0001#${K}!1a1m&quot;&gt;&lt;/iframe&gt;`],
    [`Watch: https://mega.nz/file/RoDe0001#${K} (720p)`],
    [`https://mega.nz/file/RoDe0001#${K},https://www.instagram.com/reel/abcde/`],
  ])('%s', (input) => {
    const l = link(input);
    expect(l).toEqual({ kind: 'file', handle: 'RoDe0001', key43: K });
    expect(canonicalMegaLink(l)).toBe(FILE);
    expect(megaStreamHandle(l)).toBe('RoDe0001');
  });
});

describe('parseMegaLink: folders', () => {
  it('a folder, a subfolder, and a file in a folder (new and legacy forms)', () => {
    expect(link(`https://mega.nz/folder/FoLdEr01#${FK}`)).toEqual({ kind: 'folder', folderHandle: 'FoLdEr01', folderKey22: FK });
    expect(link(`https://mega.nz/folder/FoLdEr01#${FK}/folder/SuBfOlDr`)).toEqual({ kind: 'folder', folderHandle: 'FoLdEr01', folderKey22: FK, subfolder: 'SuBfOlDr' });
    expect(canonicalMegaLink(link(`https://mega.nz/#F!FoLdEr01!${FK}`))).toBe(`https://mega.nz/folder/FoLdEr01#${FK}`);
    for (const s of [`https://mega.nz/folder/FoLdEr01#${FK}/file/NoDe0001`, `https://mega.nz/#F!FoLdEr01!${FK}!NoDe0001`, `mega.co.nz/#F!FoLdEr01!${FK}!NoDe0001`]) {
      const l = link(s);
      expect(l).toEqual({ kind: 'folder-file', folderHandle: 'FoLdEr01', folderKey22: FK, nodeHandle: 'NoDe0001' });
      expect(canonicalMegaLink(l)).toBe(`https://mega.nz/folder/FoLdEr01#${FK}/file/NoDe0001`);
      expect(megaStreamHandle(l)).toBe('NoDe0001');
    }
    expect(megaStreamHandle(link(`https://mega.nz/folder/FoLdEr01#${FK}`))).toBeNull();
  });
});

describe('parseMegaLink: problems', () => {
  it.each([
    ['', 'not-mega'],
    ['not a url', 'not-mega'],
    [`https://example.com/file/RoDe0001#${K}`, 'not-mega'],
    [`https://omega.nz/file/RoDe0001#${K}`, 'not-mega'],
    [`https://mega.nz.evil.example/file/RoDe0001#${K}`, 'not-mega'],
    ['https://mega.nz/file/RoDe0001', 'no-key'],
    ['https://mega.nz/file/RoDe0001#', 'no-key'],
    ['https://mega.nz/folder/FoLdEr01', 'no-key'],
    ['https://mega.nz/file/RoDe0001#short', 'bad-key'],
    [`https://mega.nz/file/RoDe0001#${K}A`, 'bad-key'],
    [`https://mega.nz/folder/FoLdEr01#${'A'.repeat(21)}`, 'bad-key'],
    [`https://mega.nz/file/RoDe00#${K}`, 'bad-link'],
    ['https://mega.nz/chat/abc#def', 'bad-link'],
    ['https://mega.nz/', 'bad-link'],
  ])('%j is %s', (input, problem) => {
    const r = parseMegaLink(input);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.problem).toBe(problem);
  });

  it('a keyless link says what it points at, and a key sent separately joins it', () => {
    expect(parseMegaLink('https://mega.nz/file/RoDe0001')).toEqual({ ok: false, problem: 'no-key', kind: 'file', handle: 'RoDe0001' });
    expect(joinMegaKey('https://mega.nz/file/RoDe0001', K)).toEqual({ ok: true, link: { kind: 'file', handle: 'RoDe0001', key43: K } });
    expect(joinMegaKey('https://mega.nz/file/RoDe0001', `#${K}!1a1m`)).toMatchObject({ ok: true });
    expect(joinMegaKey('https://mega.nz/file/RoDe0001', 'nope')).toEqual({ ok: false, problem: 'bad-key' });
    expect(joinMegaKey('https://mega.nz/folder/FoLdEr01#/file/NoDe0001', FK)).toEqual({ ok: true, link: { kind: 'folder-file', folderHandle: 'FoLdEr01', folderKey22: FK, nodeHandle: 'NoDe0001' } });
  });
});

describe('findMegaLinks', () => {
  it('pulls every link out of a pasted list, once each, with its line', () => {
    const text = [
      `CircleStore 1, ${FILE}, https://www.instagram.com/reel/abcde/`,
      `<iframe src="https://mega.nz/embed/RoDe0001#${K}!1a1m"></iframe>`,
      `folder: https://mega.nz/folder/FoLdEr01#${FK}`,
      'https://mega.nz/file/BadKey00#nope',
    ].join('\n');
    expect(findMegaLinks(text).map((f) => [f.line, f.ok ? f.link.kind : f.problem])).toEqual([
      [1, 'file'],
      [3, 'folder'],
      [4, 'bad-key'],
    ]);
  });
});
