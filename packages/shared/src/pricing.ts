/**
 * The pricing rule (content 4, from the founder's doc [6], [6.1], [6.3]): the three packages, blocks of 5 above 20, and
 * every other quantity quoted in writing. Never an estimated price for an in-between number.
 */

export interface PricePackage {
  videos: number;
  fee: number;
  perVideo: number;
}
export interface PriceAddOn {
  /** Videos per block (5). */
  blockOf: number;
  /** Fee per block (35000). */
  fee: number;
  perVideo: number;
  /** Blocks start above this many videos (20, the largest package). */
  after: number;
}
export interface PriceTable {
  PACKAGES: readonly PricePackage[];
  ADD_ON: PriceAddOn;
}

export type Quote =
  | { kind: 'below' }
  | { kind: 'package'; videos: number; fee: number; perVideo: number }
  | { kind: 'blocks'; videos: number; fee: number; blocks: number }
  | { kind: 'written'; videos: number; lower: number; upper: number };

/** The quote for n videos for one brand. A total for several brands is fee * brands (one package per brand). */
export function quoteBatch(n: number, table: PriceTable): Quote {
  const packages = [...table.PACKAGES].sort((a, b) => a.videos - b.videos);
  const smallest = packages[0];
  if (!smallest || !Number.isInteger(n) || n < smallest.videos) return { kind: 'below' };
  const exact = packages.find((p) => p.videos === n);
  if (exact) return { kind: 'package', videos: exact.videos, fee: exact.fee, perVideo: exact.perVideo };
  const { ADD_ON } = table;
  const base = packages.find((p) => p.videos === ADD_ON.after);
  if (n < ADD_ON.after || !base) {
    const lower = [...packages].reverse().find((p) => p.videos < n)!;
    const upper = packages.find((p) => p.videos > n);
    return { kind: 'written', videos: n, lower: lower.videos, upper: upper?.videos ?? lower.videos };
  }
  const extra = n - ADD_ON.after;
  if (extra % ADD_ON.blockOf === 0) {
    const blocks = extra / ADD_ON.blockOf;
    return { kind: 'blocks', videos: n, blocks, fee: base.fee + blocks * ADD_ON.fee };
  }
  const lower = ADD_ON.after + Math.floor(extra / ADD_ON.blockOf) * ADD_ON.blockOf;
  return { kind: 'written', videos: n, lower, upper: lower + ADD_ON.blockOf };
}

/** The fee for one brand, or null when there is no price (below the smallest package, or quoted in writing). */
export function quoteFee(quote: Quote): number | null {
  return quote.kind === 'package' || quote.kind === 'blocks' ? quote.fee : null;
}

/** Average per video, rounded to the rupee; `approx` when it is not whole ("about ₹7,333"). Null without a fee. */
export function averagePerVideo(quote: Quote): { amount: number; approx: boolean } | null {
  if (quote.kind === 'package') return { amount: quote.perVideo, approx: false };
  if (quote.kind !== 'blocks') return null;
  const exact = quote.fee / quote.videos;
  return { amount: Math.round(exact), approx: !Number.isInteger(exact) };
}

const INR = /* @__PURE__ */ new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });

/** Rupees with Indian digit grouping and the rupee sign: 150000 -> "₹1,50,000". */
export function formatInr(n: number): string {
  return `₹${INR.format(Math.round(n))}`;
}
