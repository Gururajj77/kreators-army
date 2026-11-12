import { describe, expect, it } from 'vitest';
import { brandCounts, brandKey, isMultiBrand, multiBrand } from './brands.ts';

const v = (id: string, brand: string) => ({ id, brand });
const ids = (list: { id: string }[]) => list.map((x) => x.id);

describe('brandKey', () => {
  it('folds case, spaces, punctuation, accents and a trailing domain', () => {
    expect(brandKey('CircleStore.in')).toBe('circlestore');
    expect(brandKey('Circlestore')).toBe('circlestore');
    expect(brandKey('Circle Store')).toBe('circlestore');
    expect(brandKey('  Waxys.com ')).toBe('waxys');
    expect(brandKey('Café')).toBe('cafe');
    expect(brandKey('')).toBe('');
    expect(brandKey(null)).toBe('');
  });
});

describe('brandCounts', () => {
  it('counts each brand once per video, across spellings, and leaves empty brands out', () => {
    const counts = brandCounts([v('a', 'CircleStore.in'), v('b', 'Circle Store'), v('c', 'circlestore'), v('d', 'Rode'), v('e', ''), v('f', '  ')]);
    expect(counts.get('circlestore')).toBe(3);
    expect(counts.get('rode')).toBe(1);
    expect(counts.has('')).toBe(false);
    expect(counts.size).toBe(2);
  });
});

describe('isMultiBrand', () => {
  it('is true for a brand with 2 or more videos only; an empty brand never is', () => {
    const all = [v('a', 'Hackdaily'), v('b', 'hackdaily'), v('c', 'Offlyn'), v('d', ''), v('e', '')];
    const multi = isMultiBrand(all);
    expect(multi(v('x', 'HACKDAILY'))).toBe(true);
    expect(multi(v('x', 'Offlyn'))).toBe(false);
    expect(multi(v('x', ''))).toBe(false);
    expect(multi(v('x', 'Unknown'))).toBe(false);
  });
});

describe('multiBrand', () => {
  const all = [v('c1', 'CircleStore'), v('o', 'Offlyn'), v('c2', 'CircleStore.in'), v('h1', 'Hackdaily'), v('r', 'Rode'), v('h2', 'Hackdaily'), v('n', '')];

  it('keeps only videos whose brand has 2 or more, in the order given', () => {
    expect(ids(multiBrand(all))).toEqual(['c1', 'c2', 'h1', 'h2']);
  });

  it('counts over `all`, not over the subset it filters', () => {
    // In the subset alone each brand has one video; in the library CircleStore has two.
    const subset = [v('c1', 'CircleStore'), v('o', 'Offlyn')];
    expect(ids(multiBrand(subset, { all }))).toEqual(['c1']);
    expect(ids(multiBrand(subset))).toEqual([]);
  });

  it('adds no single-brand video while enough multi-brand ones exist', () => {
    expect(ids(multiBrand(all, { need: 4 }))).toEqual(['c1', 'c2', 'h1', 'h2']);
    expect(ids(multiBrand(all, { need: 2 }))).toEqual(['c1', 'c2', 'h1', 'h2']);
  });

  it('tops up with single-brand videos, by `rank`, only up to `need`, keeping the given order', () => {
    expect(ids(multiBrand(all, { need: 5 }))).toEqual(['c1', 'o', 'c2', 'h1', 'h2']);
    expect(ids(multiBrand(all, { need: 5, rank: (s) => [...s].reverse() }))).toEqual(['c1', 'c2', 'h1', 'h2', 'n']);
    expect(ids(multiBrand(all, { need: 6, rank: (s) => [...s].reverse() }))).toEqual(['c1', 'c2', 'h1', 'r', 'h2', 'n']);
    expect(ids(multiBrand(all, { need: 99 }))).toEqual(ids(all));
  });

  it('works with no multi-brand videos at all (the surface still fills)', () => {
    const singles = [v('a', 'A'), v('b', 'B'), v('c', 'C')];
    expect(ids(multiBrand(singles, { need: 2 }))).toEqual(['a', 'b']);
    expect(multiBrand([], { need: 4 })).toEqual([]);
  });
});
