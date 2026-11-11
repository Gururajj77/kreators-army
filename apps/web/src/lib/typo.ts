/**
 * No orphan words. CSS does most of this: short copy sets with `text-wrap: balance` (body default, base.css) and long prose with `pretty`.
 * What CSS leaves behind is fixed here: browsers without `pretty` (Safari before 26), Chrome's `pretty` (it leaves a long last word alone)
 * and blocks past six lines, where Chrome stops balancing. The wording never changes.
 */
import { createElement, type ReactNode } from 'react';

const NBSP = '\u00A0';

/** Where the last two words start, or -1 for copy under three words (balance sets those: one line, or a stack, never an orphan). */
function pairStart(end: string): number {
  const lastSpace = end.lastIndexOf(' ');
  return lastSpace > 0 ? end.lastIndexOf(' ', lastSpace - 1) : -1;
}

/**
 * `text` with its last two words joined by a no-break space, so the last line always carries at least two words. A pair longer than `max`
 * characters is left alone, since it could overflow a narrow column.
 */
export function tieLast(text: string, max = 16): string {
  const end = text.trimEnd();
  const before = pairStart(end);
  if (before < 0 || end.length - before - 1 > max) return text;
  const lastSpace = end.lastIndexOf(' ');
  return end.slice(0, lastSpace) + NBSP + end.slice(lastSpace + 1) + text.slice(end.length);
}

/**
 * For copy in narrow columns: the last two words in a `.tie` span, an inline-block capped at the line's width (base.css). The pair moves to
 * the last line together when the column can hold it, and wraps inside its own box when it can't, so it never overflows. The text itself is
 * untouched.
 */
export function tieLastSpan(text: string): ReactNode {
  const end = text.trimEnd();
  const before = pairStart(end);
  if (before < 0) return text;
  return [end.slice(0, before + 1), createElement('span', { className: 'tie', key: 'tie' }, end.slice(before + 1))];
}
