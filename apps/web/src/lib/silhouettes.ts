/**
 * (sil16, tuned in sil17, made subtler and random per load in subtle17) The silhouettes in the glass cards (styles/components.css,
 * "Silhouettes in the glass"). The founder: "more subtle, these are too distracting, maybe randomize when it loads". So each card carries
 * ONE faint shape, and every page load deals the shapes afresh:
 *   - One Math.random seed per load drives a small PRNG; in page order each card gets a shape (the four cast outlines, faces left out, and
 *     three flowers), a placement from a small set that all sit in the lower right and are cropped by an edge (data-sil-at), a tilt of up to
 *     12 degrees either way and a hue from the cast palette (data-sil-hue). A card never shares its shape with the three cards either side
 *     of it in page order (so a row of a grid and the row above it differ too), nor its hue with the card before or after it.
 *   - The shape and its tilt are one SVG data URI, set as --sil-m on the card (CSS cannot rotate a mask image), then data-sil names the
 *     shape; the CSS draws only once data-sil is there. The prerendered HTML has none of this (the app renders with createRoot after this
 *     runs; no hydration), so a page without script shows no shapes.
 *   - data-sil-fit, from the card's size: 'card', 'strip' (a wide short row) or 'none' (too small for a shape), and --sil-u, the card's
 *     shorter side in px (rounded to 8 px), which the shape's size is a share of.
 *   - A brand plate draws its shape tone on tone in its own ink (CSS), whatever hue it was dealt.
 * Sizes come from one ResizeObserver (no layout reads of our own), dealing from one MutationObserver that only reacts to added subtrees
 * holding a card, coalesced into one microtask. A card keeps what it was dealt; a card added later (a rail loading, a route change) is
 * dealt from the same sequence. Without either observer (old browsers, prerender), no card is marked and no shape is drawn.
 */
export const SIL_CARDS = [
  // The cards16 liquid-glass list (components.css), less .bp-table-scroll (a scroller, not a card).
  '.lglass',
  '.plate:not([data-tone])',
  '.stat',
  '.frame',
  '.t-card',
  '.platform',
  '.price-row',
  '.faqchat-a',
  '.split-control',
  '.mech-card',
  ".etl[data-tone='plate'] .etl-plate",
  '.cf-card',
  '.qa-plate',
  '.rt-shelf',
  '.vp-street',
  '.hww-chain',
  '.post-answer',
  '.post-takeaways li',
  '.bp-def',
  '.bp-script',
  '.bp-steps',
  '.bp-fw',
  '.bp-compare-col',
  '.bp-stat',
  '.bp-cta',
  '.bp-verdict',
  '.bw',
  // The four brand-coloured plates: their own character, tone on tone.
  ".plate:is([data-tone='sochu'], [data-tone='bolu'], [data-tone='gola'], [data-tone='tiko']):not(.army-tile)",
].join(', ');

/** The shapes: [centre x, centre y, extent] in their own units, and the SVG body. Cast outlines from cast/rest.tsx BODY_PATH. */
const SHAPES = {
  tiko: [240, 259, 312, "<path d='M271.14 136.42L391.3 346.29A35.88 35.88 0 0 1 360.16 400L119.84 400A35.88 35.88 0 0 1 88.7 346.29L208.86 136.42A35.88 35.88 0 0 1 271.14 136.42Z'/>"],
  sochu: [240, 256.5, 290, "<path d='M240 142.79A83.35 83.35 0 1 1 361.69 256.31A83.35 83.35 0 1 1 240 369.82A83.35 83.35 0 1 1 118.31 256.31A83.35 83.35 0 1 1 240 142.79Z'/>"],
  bolu: [240, 265, 304, "<path transform='rotate(-10 240 265.2)' d='M135.58 130.43H344.42A30.37 30.37 0 0 1 374.79 160.8V369.63A30.37 30.37 0 0 1 344.42 400H135.58A30.37 30.37 0 0 1 105.21 369.63V160.8A30.37 30.37 0 0 1 135.58 130.43Z'/>"],
  gola: [240, 256, 288, "<circle cx='240' cy='256.26' r='143.74'/>"],
  daisy: [0, 0, 100, "<mask id='m'><rect x='-60' y='-60' width='120' height='120' fill='#fff'/><circle r='15'/></mask><g mask='url(#m)'><ellipse cy='-27' rx='11' ry='21'/><ellipse cy='-27' rx='11' ry='21' transform='rotate(72)'/><ellipse cy='-27' rx='11' ry='21' transform='rotate(144)'/><ellipse cy='-27' rx='11' ry='21' transform='rotate(216)'/><ellipse cy='-27' rx='11' ry='21' transform='rotate(288)'/></g><circle r='10.5'/>"],
  bloom: [0, 0, 92, "<mask id='m'><rect x='-56' y='-56' width='112' height='112' fill='#fff'/><circle r='11'/></mask><g mask='url(#m)'><circle cx='27' r='17'/><circle cx='27' r='17' transform='rotate(60)'/><circle cx='27' r='17' transform='rotate(120)'/><circle cx='27' r='17' transform='rotate(180)'/><circle cx='27' r='17' transform='rotate(240)'/><circle cx='27' r='17' transform='rotate(300)'/></g><circle r='7'/>"],
  sprig: [33, 50, 100, "<path d='M28 98C29 70 33 40 40 7' fill='none' stroke='#000' stroke-width='3.4' stroke-linecap='round'/><ellipse cx='20' cy='70' rx='6.5' ry='14' transform='rotate(-48 20 70)'/><ellipse cx='42' cy='54' rx='6.5' ry='14' transform='rotate(46 42 54)'/><ellipse cx='22' cy='38' rx='6' ry='13' transform='rotate(-44 22 38)'/><ellipse cx='45' cy='23' rx='5.5' ry='12' transform='rotate(42 45 23)'/><ellipse cx='40' cy='7' rx='5' ry='7.5'/>"],
} satisfies Record<string, [number, number, number, string]>;
type Shape = keyof typeof SHAPES;
const SHAPE_NAMES = Object.keys(SHAPES) as Shape[];
/** Where the shape sits (components.css): all in the lower right, all cropped by an edge, away from where headings and copy start. */
const PLACES = ['corner', 'edge', 'floor', 'heel'];
const HUES = ['purple', 'yellow', 'green', 'orange'];
type Fit = 'card' | 'strip' | 'none';

/** The shape, tilted, as a square SVG with room to turn in (1.2 x its extent), as a CSS url(). */
function maskOf(name: Shape, tilt: number): string {
  const [cx, cy, ext, body] = SHAPES[name];
  const side = ext * 1.2;
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='${cx - side / 2} ${cy - side / 2} ${side} ${side}'><g transform='rotate(${tilt} ${cx} ${cy})'>${body}</g></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

/** mulberry32: a small seeded PRNG, so one Math.random per load deals the whole page. */
function prng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** The fit and the unit (shorter side, 8 px steps) for a card of this border-box size. */
function fitOf(w: number, h: number): [Fit, number] {
  const short = Math.min(w, h);
  // Too small to carry a shape without crowding its words (a phone's three-up stat tiles, a chip-sized card).
  if (short < 96 && !(h >= 56 && w >= 280)) return ['none', 0];
  if (w < 150) return ['none', 0];
  // A wide short row (a price row, a chain, a verdict line): one small shape at its right end.
  if (h < 132 || w / h >= 3.2) return ['strip', Math.round(h / 8) * 8];
  return ['card', Math.round(short / 8) * 8];
}

let installed = false;

export function installSilhouettes() {
  if (installed || typeof document === 'undefined' || typeof MutationObserver === 'undefined' || typeof ResizeObserver === 'undefined') return;
  installed = true;

  const watched = new Set<HTMLElement>();

  const sizes = new ResizeObserver((entries) => {
    for (const e of entries) {
      const el = e.target as HTMLElement;
      if (!el.isConnected) {
        sizes.unobserve(el);
        watched.delete(el);
        continue;
      }
      const box = e.borderBoxSize?.[0];
      const w = box ? box.inlineSize : e.contentRect.width;
      const h = box ? box.blockSize : e.contentRect.height;
      if (w === 0 && h === 0) continue; // Hidden for now (display: none, a closed panel): keep the last fit.
      const [fit, u] = fitOf(w, h);
      if (el.dataset.silFit !== fit) el.dataset.silFit = fit;
      const unit = `${u}px`;
      if (el.style.getPropertyValue('--sil-u') !== unit) el.style.setProperty('--sil-u', unit);
    }
  });

  const rand = prng(Math.floor(Math.random() * 4294967296));
  const pick = <T,>(list: T[]): T => list[Math.floor(rand() * list.length)] as T;

  const deal = (el: HTMLElement, near: (string | undefined)[], hueNear: (string | undefined)[]) => {
    const shapes = SHAPE_NAMES.filter((n) => !near.includes(n));
    const shape = pick(shapes.length ? shapes : SHAPE_NAMES);
    const hue = pick(HUES.filter((h) => !hueNear.includes(h)));
    const tilt = Math.round((rand() * 2 - 1) * 12);
    el.style.setProperty('--sil-m', maskOf(shape, tilt));
    el.dataset.silAt = pick(PLACES);
    el.dataset.silHue = hue;
    el.dataset.silTilt = String(tilt);
    el.dataset.sil = shape; // Last: the CSS draws only once this is set (and --sil-m with it).
  };

  const number = () => {
    const cards = [...document.querySelectorAll<HTMLElement>(SIL_CARDS)];
    cards.forEach((el, i) => {
      if (el.dataset.sil === undefined) {
        // Not the shape of the three cards before or after it in page order (a grid row and the one above it differ too).
        const near = [...cards.slice(Math.max(0, i - 3), i), ...cards.slice(i + 1, i + 4)].map((c) => c.dataset.sil);
        deal(el, near, [cards[i - 1]?.dataset.silHue, cards[i + 1]?.dataset.silHue]);
      }
      if (!watched.has(el)) {
        watched.add(el);
        sizes.observe(el);
      }
    });
    // Let go of cards a route change removed (the observer would otherwise keep them alive).
    for (const el of watched) {
      if (!el.isConnected) {
        sizes.unobserve(el);
        watched.delete(el);
      }
    }
  };

  let queued = false;
  const run = () => {
    queued = false;
    number();
  };
  // Only an added subtree that is or holds a card queues a pass (a ticker or a chat line adding nodes costs a selector match, not a page scan).
  new MutationObserver((records) => {
    if (queued) return;
    for (const r of records) {
      for (const n of r.addedNodes) {
        if (n.nodeType === 1 && ((n as Element).matches(SIL_CARDS) || (n as Element).querySelector(SIL_CARDS))) {
          queued = true;
          queueMicrotask(run);
          return;
        }
      }
    }
  }).observe(document.documentElement, { childList: true, subtree: true });
  number();
}
