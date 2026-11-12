// Owner: type (round 17). Text arrows drawn as icons. Google Sans Flex's shipped subsets (public/fonts, the same files kreators.app uses) have no
// arrows (U+2190–2193, U+2197: checked in the woff2 cmaps with fontTools), so a typed → fell back to Arial and looked thin and long beside the
// text. kreators.app draws its link arrows as lucide icons (`SiteArrow`); this does the same. The character stays in the DOM, visually hidden,
// so the text, the accessible name and the copy checks read exactly as before; the icon is aria-hidden and sized and weighted to the text.
// Styles: .t-arrow in styles/base.css.
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, ArrowUpRight, type LucideIcon } from 'lucide-react';
import { Fragment, type ReactNode } from 'react';

const GLYPHS: Record<string, LucideIcon> = {
  '→': ArrowRight,
  '←': ArrowLeft,
  '↑': ArrowUp,
  '↓': ArrowDown,
  '↗': ArrowUpRight,
};

type Glyph = '→' | '←' | '↑' | '↓' | '↗';

/**
 * One arrow. `lead` puts the space after it ("→ How we work"); otherwise the space comes before it ("How we work →"). Write it flush against the
 * words, with no space in the JSX: the space travels inside the hidden text, and the gap is a margin, so it holds inside inline-flex links too.
 * `bare` drops the space (a lone arrow, such as a key in a shortcut list).
 */
export function TextArrow({ glyph = '→', lead = false, bare = false }: { glyph?: Glyph; lead?: boolean; bare?: boolean }) {
  const Icon = GLYPHS[glyph] ?? ArrowRight;
  const text = bare ? glyph : lead ? `${glyph} ` : ` ${glyph}`;
  return (
    <span className="t-arrow" data-side={bare ? undefined : lead ? 'lead' : 'trail'} data-glyph={glyph === '↗' ? 'out' : undefined}>
      <span className="t-arrow-text">{text}</span>
      <Icon className="t-arrow-icon" aria-hidden focusable="false" strokeWidth={2.25} />
    </span>
  );
}

/**
 * A plain string with any arrows in it drawn as icons (admin messages and key hints). The text itself is unchanged. One wrapping span, so a grid
 * or flex parent (the shortcut list's <kbd>) still sees a single child.
 */
export function withArrows(text: string | null | undefined): ReactNode {
  if (!text || !/[←↑→↓↗]/.test(text)) return text;
  return (
    <span>
      {text.split(/([←↑→↓↗])/).map((part, i) =>
        part in GLYPHS ? <TextArrow key={i} glyph={part as Glyph} bare /> : <Fragment key={i}>{part}</Fragment>,
      )}
    </span>
  );
}
