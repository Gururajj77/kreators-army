// The packages and their rules (content §2.1 to §2.3, visual §1.5): the three cards, the add-on row, the batch strip that draws "per package", the list
// every package includes, and the six rules. Words come from lib/content.ts; a page's own lines (the GST note under a table, the Home row) stay in the page.
// No characters and no bubbles here, ever: a price needs credibility, not company.

import { formatInr, type Quote } from '@kreators/shared';
import { Boxes, KeyRound, PenLine, Receipt, Store, Wallet, type LucideIcon } from 'lucide-react';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { ADD_ON, PACKAGE_INCLUDES, PACKAGES, PRICING_RULES, quote, type Package } from '../lib/content';
import { useMotionOk } from '../lib/motionOk';
import { PrimaryCta, whenSeen } from './ui';

// ---------- The batch strip ----------

type Tone = 'sochu' | 'bolu' | 'tiko' | 'gola';
type Cell = { tone: Tone; dashed: boolean; gapBefore: boolean };

const PACKAGE_TONE: Record<number, Tone> = { 5: 'sochu', 10: 'bolu', 20: 'tiko' };
const MAX_DRAWN = 60;

function toneFor(videos: number): Tone {
  return videos >= 20 ? 'tiko' : videos >= 10 ? 'bolu' : 'sochu';
}

/** The cells a quote draws: one mini 9:16 frame per video. */
function cellsFor(q: Quote): Cell[] {
  const solid = (n: number, tone: Tone): Cell[] => Array.from({ length: n }, () => ({ tone, dashed: false, gapBefore: false }));
  const dashed = (n: number, tone: Tone): Cell[] => Array.from({ length: n }, () => ({ tone, dashed: true, gapBefore: false }));
  switch (q.kind) {
    case 'below':
      return dashed(5, 'sochu');
    case 'package':
      return solid(q.videos, PACKAGE_TONE[q.videos] ?? toneFor(q.videos));
    case 'blocks': {
      const cells = solid(ADD_ON.after, 'tiko');
      for (let b = 0; b < q.blocks; b++) cells.push(...solid(ADD_ON.blockOf, 'gola').map((c, i) => ({ ...c, gapBefore: i === 0 })));
      return cells;
    }
    case 'written': {
      const tone = toneFor(q.lower);
      return [...solid(q.videos, tone), ...dashed(Math.max(0, q.upper - q.videos), tone)];
    }
  }
}

/** How far each cell sits right of its grid column: 6 px more at every block boundary earlier in its own row (block gap 10 = grid gap 4 + 6). */
function shifts(cells: Cell[], perRow: number): number[] {
  let shift = 0;
  return cells.map((c, i) => {
    if (i % perRow === 0) shift = 0;
    else if (c.gapBefore) shift += 6;
    return shift;
  });
}

/**
 * "Per package", drawn: a mini frame per video (12 × 21, rows of 20, rows of 10 on phones, at most 60, then "+n"). A package is one tone (5 yellow,
 * 10 green, 20 purple); blocks are 20 purple plus orange groups of 5 with a 10 px gap between blocks; an in-between number is solid frames then dashed
 * outlines up to the next price ("quoted in writing", made visible); below 5, five dashed frames. Decorative (aria-hidden): the words beside it carry the
 * meaning. With `animate` (the calculator) the box keeps the height of 60 frames, frames that arrive pop in (12 ms apart, at most 12 animated) and frames
 * that leave fade out in 120 ms; never under Pause animations.
 */
export function BatchStrip({ quote: q, animate = false, className }: { quote: Quote; animate?: boolean; className?: string }) {
  const ok = useMotionOk();
  const cells = cellsFor(q);
  const drawn = cells.slice(0, MAX_DRAWN);
  const more = cells.length - drawn.length;
  // The count shown a moment ago: new frames pop from there; frames past the new count linger 120 ms while they fade.
  const [shown, setShown] = useState(drawn.length);
  const fading = animate && ok && shown > drawn.length;
  useEffect(() => {
    if (shown === drawn.length) return;
    // Arriving frames keep their pop flag until the pop is over; leaving frames get their fade.
    const t = window.setTimeout(() => setShown(drawn.length), !(animate && ok) ? 0 : shown < drawn.length ? 500 : 140);
    return () => window.clearTimeout(t);
  }, [drawn.length, shown, animate, ok]);
  const filler: Cell = drawn[drawn.length - 1] ?? { tone: 'sochu', dashed: true, gapBefore: false };
  const all = fading ? [...drawn, ...Array.from({ length: shown - drawn.length }, () => filler)] : drawn;
  const s20 = shifts(all, 20);
  const s10 = shifts(all, 10);
  return (
    <div className={`batch ${className ?? ''}`} aria-hidden data-kind={q.kind} data-fixed={animate ? '' : undefined}>
      <span className="batch-cells" style={{ '--w20': `${Math.max(0, ...s20)}px`, '--w10': `${Math.max(0, ...s10)}px` } as CSSProperties}>
        {all.map((c, i) => {
          const fresh = animate && ok && i >= shown && i < drawn.length && i - shown < 12;
          const gone = i >= drawn.length;
          return (
            <span
              key={i}
              className="batch-cell"
              data-tone={c.tone}
              data-dashed={c.dashed ? '' : undefined}
              data-pop={fresh ? '' : undefined}
              data-gone={gone ? '' : undefined}
              style={{ '--s20': `${s20[i]}px`, '--s10': `${s10[i]}px`, '--k': fresh ? i - shown : 0 } as CSSProperties}
            />
          );
        })}
      </span>
      {more > 0 && <span className="chip batch-more">+{more}</span>}
    </div>
  );
}

// ---------- The three packages ----------

const intentFor = (p: Package) => ({ package: String(p.videos) as '5' | '10' | '20' });

/**
 * The three package cards: name, line, the fee large, "₹{perVideo} per video", a static batch strip and the primary action (the only red). No badge, no
 * "/month". `compact` is Home's summary (smaller type, a lighter strip). The page puts "GST extra where applicable" in view beside them.
 */
export function PackageCards({ compact = false, className }: { compact?: boolean; className?: string }) {
  return (
    <div className={`pkgs ${className ?? ''}`} data-compact={compact ? '' : undefined}>
      {PACKAGES.map((p, i) => (
        <article key={p.videos} className="pkg plate" style={{ '--i': i } as CSSProperties}>
          <h3 className="pkg-name">{p.name}</h3>
          <p className="pkg-line">{p.line}</p>
          <p className="pkg-fee">{formatInr(p.fee)}</p>
          <p className="pkg-per">{formatInr(p.perVideo)} per video</p>
          <BatchStrip quote={quote(p.videos)} className="pkg-strip" />
          <PrimaryCta intent={intentFor(p)} className="pkg-cta" />
        </article>
      ))}
    </div>
  );
}

/**
 * The fourth, quieter row (content §3.4): "Beyond 20 videos · Blocks of 5 · ₹35,000 a block · ₹7,000 per video", and, unless `examples={false}`, the two
 * worked examples (25 and 30 videos).
 */
export function AddOnRow({ examples = true, className }: { examples?: boolean; className?: string }) {
  const base = PACKAGES.find((p) => p.videos === ADD_ON.after)?.fee ?? 0;
  const worked = [1, 2].map((blocks) => ({ videos: ADD_ON.after + blocks * ADD_ON.blockOf, extra: blocks * ADD_ON.fee, total: base + blocks * ADD_ON.fee }));
  return (
    <div className={`addon plate ${className ?? ''}`}>
      <p className="addon-line">
        <span>Beyond {ADD_ON.after} videos</span>
        <span aria-hidden> · </span>
        <span>Blocks of {ADD_ON.blockOf}</span>
        <span aria-hidden> · </span>
        <span className="addon-fee">{formatInr(ADD_ON.fee)} a block</span>
        <span aria-hidden> · </span>
        <span>{formatInr(ADD_ON.perVideo)} per video</span>
      </p>
      {examples && (
        <p className="addon-examples">
          {worked.map((w) => (
            <span key={w.videos} className="addon-example">
              {w.videos} videos: {formatInr(base)} + {formatInr(w.extra)} = {formatInr(w.total)}.
            </span>
          ))}
        </p>
      )}
    </div>
  );
}

// ---------- Every package includes ----------

/**
 * The ten lines every package includes (content §2.2), ticks popping once on view. `limit` shows only the first n; `phoneLimit` shows the first n on phones
 * only (Home collapses to five there).
 */
export function PackageIncludes({ limit, phoneLimit, className }: { limit?: number; phoneLimit?: number; className?: string }) {
  const ref = useRef<HTMLUListElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    return whenSeen(el, () => {
      el.dataset.in = '';
    });
  }, []);
  const items = PACKAGE_INCLUDES.slice(0, limit ?? PACKAGE_INCLUDES.length);
  return (
    <ul ref={ref} className={`includes ${className ?? ''}`} style={{ '--phone-limit': phoneLimit ?? 99 } as CSSProperties} data-phone-limit={phoneLimit ? '' : undefined}>
      {items.map((line, i) => (
        <li key={line} className="includes-item" style={{ '--i': i } as CSSProperties} data-beyond={phoneLimit !== undefined && i >= phoneLimit ? '' : undefined}>
          <span className="includes-tick" aria-hidden>
            <svg viewBox="0 0 16 16" width="14" height="14" focusable="false">
              <path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span>{line}</span>
        </li>
      ))}
    </ul>
  );
}

// ---------- The six rules ----------

const RULE_GLYPHS: LucideIcon[] = [Store, Boxes, PenLine, Receipt, Wallet, KeyRound];

/** The six pricing rules as short tiles, a glyph each (one brand, blocks of 5, in-between quoted, taxes, prepaid, rights). */
export function PricingRules({ className }: { className?: string }) {
  return (
    <ul className={`rules ${className ?? ''}`}>
      {PRICING_RULES.map((r, i) => {
        const Glyph = RULE_GLYPHS[i] ?? Store;
        return (
          <li key={r.title} className="rule plate">
            <span className="rule-glyph" aria-hidden>
              <Glyph className="size-5" />
            </span>
            <p className="rule-text">
              <strong>{r.title}</strong> {r.body}
            </p>
          </li>
        );
      })}
    </ul>
  );
}
