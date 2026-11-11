// The blog's inline markup (FORMAT.md §3). One parser for the renderer, the prerender and the validator, so they always agree.
//
//   **bold**          <strong>
//   _italic_          <em>; the underscores sit at word edges, so snake_case stays text
//   [text](/route)    an internal link (a route from ./routes.ts, optional ?query and #hash)
//   [text](#id)       a heading or widget id in the same post
//   [text](https://…) an external link (new tab, rel="noopener noreferrer")
//   [^source-id]      a citation: a superscript number linking to the post's sources list
//   \*  \_  \[  \]  \\   a literal character
//
// No nesting (link text, bold and italic hold plain text), no HTML, no line breaks. A lone * is literal text.

export type InlineNode =
  | { kind: 'text'; text: string }
  | { kind: 'bold'; text: string }
  | { kind: 'italic'; text: string }
  | { kind: 'link'; text: string; href: string }
  | { kind: 'cite'; id: string };

export interface InlineParse {
  nodes: InlineNode[];
  /** Problems a writer must fix. The renderer ignores them: the bad markup shows as text. */
  errors: string[];
}

const ESCAPABLE = '\\*_[]';
const isWordChar = (c: string | undefined) => c !== undefined && /[\p{L}\p{N}]/u.test(c);
const isSpace = (c: string | undefined) => c !== undefined && /\s/u.test(c);

/** Index of `needle` at or after `from`, skipping backslash escapes; -1 when absent. */
function findUnescaped(src: string, needle: string, from: number): number {
  for (let i = from; i < src.length; i++) {
    if (src[i] === '\\') {
      i++;
      continue;
    }
    if (src.startsWith(needle, i)) return i;
  }
  return -1;
}

const unescape = (s: string) => s.replace(/\\([\\*_[\]])/g, '$1');

/** True when `s` holds markup that would be nesting (bold, italic or a link inside another span). */
function hasMarkup(s: string): boolean {
  const bare = s.replace(/\\[\\*_[\]]/g, '');
  return bare.includes('**') || /\[[^\]]*\]\(/.test(bare) || /\[\^/.test(bare) || /(^|[^\p{L}\p{N}])_\S/u.test(bare);
}

export function parseInline(src: string): InlineParse {
  const nodes: InlineNode[] = [];
  const errors: string[] = [];
  let buf = '';
  const flush = () => {
    if (buf) nodes.push({ kind: 'text', text: buf });
    buf = '';
  };
  const near = (i: number) => `"${src.slice(Math.max(0, i - 15), i + 25)}"`;

  let i = 0;
  while (i < src.length) {
    const c = src[i] as string;

    if (c === '\\' && i + 1 < src.length && ESCAPABLE.includes(src[i + 1] as string)) {
      buf += src[i + 1];
      i += 2;
      continue;
    }

    if (c === '*' && src[i + 1] === '*') {
      const end = findUnescaped(src, '**', i + 2);
      if (end < 0) {
        errors.push(`unclosed ** near ${near(i)}`);
        buf += '**';
        i += 2;
        continue;
      }
      const raw = src.slice(i + 2, end);
      if (!raw.trim()) errors.push(`empty **bold** near ${near(i)}`);
      else if (raw !== raw.trim()) errors.push(`**bold** must not start or end with a space near ${near(i)}`);
      if (hasMarkup(raw)) errors.push(`markup inside **bold** (nesting is not supported) near ${near(i)}`);
      flush();
      nodes.push({ kind: 'bold', text: unescape(raw) });
      i = end + 2;
      continue;
    }

    if (c === '_' && !isWordChar(src[i - 1]) && src[i + 1] !== undefined && !isSpace(src[i + 1]) && src[i + 1] !== '_') {
      let end = -1;
      for (let j = i + 1; j < src.length; j++) {
        if (src[j] === '\\') {
          j++;
          continue;
        }
        if (src[j] === '_' && !isSpace(src[j - 1]) && !isWordChar(src[j + 1])) {
          end = j;
          break;
        }
      }
      if (end < 0) {
        errors.push(`unclosed _italic_ near ${near(i)} (escape a literal underscore as \\_)`);
        buf += '_';
        i++;
        continue;
      }
      const raw = src.slice(i + 1, end);
      if (hasMarkup(raw)) errors.push(`markup inside _italic_ (nesting is not supported) near ${near(i)}`);
      flush();
      nodes.push({ kind: 'italic', text: unescape(raw) });
      i = end + 1;
      continue;
    }

    if (c === '[' && src[i + 1] === '^') {
      const end = src.indexOf(']', i + 2);
      const id = end < 0 ? '' : src.slice(i + 2, end);
      if (end < 0 || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(id)) {
        errors.push(`bad citation near ${near(i)}: write [^source-id] with a kebab-case source id`);
        buf += '[';
        i++;
        continue;
      }
      flush();
      nodes.push({ kind: 'cite', id });
      i = end + 1;
      continue;
    }

    if (c === '[') {
      const close = findUnescaped(src, ']', i + 1);
      if (close < 0 || src[close + 1] !== '(') {
        errors.push(`"[" that is not a link near ${near(i)}: write [text](/route), or escape it as \\[`);
        buf += '[';
        i++;
        continue;
      }
      const paren = src.indexOf(')', close + 2);
      if (paren < 0) {
        errors.push(`link with no closing ")" near ${near(i)}`);
        buf += '[';
        i++;
        continue;
      }
      const rawText = src.slice(i + 1, close);
      const href = src.slice(close + 2, paren);
      if (!rawText.trim()) errors.push(`link with empty text near ${near(i)}`);
      if (hasMarkup(rawText)) errors.push(`markup inside link text (nesting is not supported) near ${near(i)}`);
      if (!href || /\s/.test(href)) errors.push(`link target is empty or has a space near ${near(i)} (write %20, and %29 for a ")" in a URL)`);
      flush();
      nodes.push({ kind: 'link', text: unescape(rawText), href });
      i = paren + 1;
      continue;
    }

    if (c === ']') errors.push(`stray "]" near ${near(i)} (escape it as \\])`);
    buf += c;
    i++;
  }
  flush();
  return { nodes, errors };
}

/** The visible text, markup removed and citations dropped. For JSON-LD, meta tags, word counts and copy buttons. */
export function plainInline(src: string): string {
  return parseInline(src)
    .nodes.map((n) => (n.kind === 'cite' ? '' : n.text))
    .join('');
}

/** Every link in the text. */
export function inlineLinks(src: string): { text: string; href: string }[] {
  return parseInline(src).nodes.flatMap((n) => (n.kind === 'link' ? [{ text: n.text, href: n.href }] : []));
}

/** Every citation id in the text. */
export function inlineCites(src: string): string[] {
  return parseInline(src).nodes.flatMap((n) => (n.kind === 'cite' ? [n.id] : []));
}
