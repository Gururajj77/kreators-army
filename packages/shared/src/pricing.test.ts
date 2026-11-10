import { describe, expect, it } from 'vitest';
import { averagePerVideo, formatInr, quoteBatch, quoteFee, type PriceTable } from './pricing.ts';

// content 2.1, as lib/content.ts holds it.
const TABLE: PriceTable = {
  PACKAGES: [
    { videos: 5, fee: 50000, perVideo: 10000 },
    { videos: 10, fee: 85000, perVideo: 8500 },
    { videos: 20, fee: 150000, perVideo: 7500 },
  ],
  ADD_ON: { blockOf: 5, fee: 35000, perVideo: 7000, after: 20 },
};
const q = (n: number) => quoteBatch(n, TABLE);
const price = (n: number, brands = 1) => {
  const fee = quoteFee(q(n));
  return fee === null ? null : formatInr(fee * brands);
};

describe('quoteBatch: content 4 check values', () => {
  it.each([
    [5, '₹50,000'],
    [10, '₹85,000'],
    [20, '₹1,50,000'],
    [25, '₹1,85,000'],
    [30, '₹2,20,000'],
    [40, '₹2,90,000'],
  ])('%d videos -> %s', (n, label) => {
    expect(price(n)).toBe(label);
  });
  it('averages', () => {
    expect(averagePerVideo(q(25))).toEqual({ amount: 7400, approx: false });
    expect(averagePerVideo(q(30))).toEqual({ amount: 7333, approx: true });
    expect(averagePerVideo(q(40))).toEqual({ amount: 7250, approx: false });
    expect(averagePerVideo(q(10))).toEqual({ amount: 8500, approx: false });
    expect(averagePerVideo(q(7))).toBeNull();
  });
  it('in-between numbers are quoted in writing, never estimated', () => {
    expect(q(7)).toEqual({ kind: 'written', videos: 7, lower: 5, upper: 10 });
    expect(q(15)).toEqual({ kind: 'written', videos: 15, lower: 10, upper: 20 });
    expect(q(23)).toEqual({ kind: 'written', videos: 23, lower: 20, upper: 25 });
    expect(price(23)).toBeNull();
  });
  it('below 5 and odd input', () => {
    expect(q(3)).toEqual({ kind: 'below' });
    expect(q(0)).toEqual({ kind: 'below' });
    expect(q(7.5)).toEqual({ kind: 'below' });
    expect(q(Number.NaN)).toEqual({ kind: 'below' });
  });
  it('blocks above 20', () => {
    expect(q(25)).toEqual({ kind: 'blocks', videos: 25, blocks: 1, fee: 185000 });
  });
  it('10 videos for 2 brands', () => {
    expect(price(10, 2)).toBe('₹1,70,000');
  });
});
