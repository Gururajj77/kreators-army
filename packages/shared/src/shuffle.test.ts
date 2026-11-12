import { describe, expect, it } from 'vitest';
import { seededKey, seededRandom, seededShuffle } from './shuffle.ts';

const ids = Array.from({ length: 40 }, (_, i) => ({ id: `v${i}`, poster: i % 3 !== 0 }));

describe('seededRandom', () => {
  it('repeats for a seed and stays in [0, 1)', () => {
    const a = seededRandom('abc');
    const b = seededRandom('abc');
    for (let i = 0; i < 100; i++) {
      const x = a();
      expect(x).toBe(b());
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThan(1);
    }
  });

  it('keeps the library shuffle generator (shared ?seed= links)', () => {
    // mulberry32 as videoFind had it before it moved here: the first value for seed '1'.
    expect(seededRandom('1')()).toBeCloseTo(0.09638231410644948, 15);
  });
});

describe('seededShuffle', () => {
  it('is the same for the same seed', () => {
    expect(seededShuffle(ids, 's1').map((v) => v.id)).toEqual(seededShuffle(ids, 's1').map((v) => v.id));
  });

  it('differs between seeds', () => {
    const orders = new Set(['a', 'b', 'c', 'd', 'e'].map((s) => seededShuffle(ids, s).map((v) => v.id).join(',')));
    expect(orders.size).toBe(5);
  });

  it('loses and duplicates nothing', () => {
    for (const seed of ['x', 'y', 'z']) {
      const out = seededShuffle(ids, seed);
      expect(out).toHaveLength(ids.length);
      expect(new Set(out.map((v) => v.id)).size).toBe(ids.length);
      expect([...out].sort((a, b) => Number(a.id.slice(1)) - Number(b.id.slice(1)))).toEqual(ids);
    }
  });

  it('does not change the input', () => {
    const copy = [...ids];
    seededShuffle(ids, 'q');
    expect(ids).toEqual(copy);
  });

  it('puts lower tiers first and shuffles within them', () => {
    const out = seededShuffle(ids, 't', { tier: (v) => (v.poster ? 0 : 1) });
    const firstPosterless = out.findIndex((v) => !v.poster);
    expect(out.slice(0, firstPosterless).every((v) => v.poster)).toBe(true);
    expect(out.slice(firstPosterless).every((v) => !v.poster)).toBe(true);
    const plain = ids.filter((v) => v.poster).map((v) => v.id).join(',');
    expect(out.slice(0, firstPosterless).map((v) => v.id).join(',')).not.toBe(plain);
  });

  it('keeps a subset in the whole list order under the same seed', () => {
    const whole = seededShuffle(ids, 'k').map((v) => v.id);
    const part = seededShuffle(ids.filter((v) => v.poster), 'k').map((v) => v.id);
    expect(part).toEqual(whole.filter((id) => part.includes(id)));
  });

  it('shuffles strings and keeps duplicates', () => {
    const out = seededShuffle(['a', 'b', 'a', 'c'], 'd');
    expect([...out].sort()).toEqual(['a', 'a', 'b', 'c']);
  });

  it('spreads the first place over the list', () => {
    const firsts = new Set(Array.from({ length: 400 }, (_, i) => seededShuffle(ids, `load-${i}`)[0]!.id));
    expect(firsts.size).toBeGreaterThan(30);
    expect(seededKey('a', 'b')).toBe(seededKey('a', 'b'));
  });
});
