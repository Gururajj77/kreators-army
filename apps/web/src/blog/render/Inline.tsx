// Inline markup to React (FORMAT.md section 3), through the one parser the validator uses. Markup errors are the validator's to report: here a bad
// span simply shows as text. Internal links are plain <a href>: the live page turns a click into a route change (site/pages/blogLinks.ts), and the
// build's static HTML works as it is.

import { Check, Copy } from 'lucide-react';
import { Fragment, useEffect, useRef, useState, type ReactNode } from 'react';
import { parseInline, type InlineNode } from '../inline';
import { useBlog, type BlogRender } from './context';

const BLOG_LINK = /^\/blog\/([a-z0-9]+(?:-[a-z0-9]+)*)(?:[?#]|$)/;

function Link({ href, children, ctx }: { href: string; children: ReactNode; ctx: BlogRender }) {
  const post = BLOG_LINK.exec(href);
  // A planned post with no page yet: the words stay, the link waits for the post.
  if (post && !ctx.liveSlugs.has(post[1] as string)) return <>{children}</>;
  if (/^https?:\/\//.test(href))
    return (
      <a href={href} target="_blank" rel="noopener">
        {children}
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
    );
  return <a href={href}>{children}</a>;
}

function Cite({ id, ctx }: { id: string; ctx: BlogRender }) {
  const n = ctx.cites.get(id);
  if (!n) return null;
  const source = ctx.sources.get(id);
  return (
    <sup className="bp-cite">
      <a href={`#source-${id}`} aria-label={`Source ${n}${source ? `: ${source.title}` : ''}`}>
        {n}
      </a>
    </sup>
  );
}

function node(n: InlineNode, key: number, ctx: BlogRender): ReactNode {
  switch (n.kind) {
    case 'text':
      return <Fragment key={key}>{n.text}</Fragment>;
    case 'bold':
      return <strong key={key}>{n.text}</strong>;
    case 'italic':
      return <em key={key}>{n.text}</em>;
    case 'link':
      return (
        <Link key={key} href={n.href} ctx={ctx}>
          {n.text}
        </Link>
      );
    case 'cite':
      return <Cite key={key} id={n.id} ctx={ctx} />;
  }
}

/** One Inline string. */
export function Inline({ text }: { text: string }) {
  const ctx = useBlog();
  if (!text) return null;
  const { nodes } = parseInline(text);
  return <>{nodes.map((n, i) => node(n, i, ctx))}</>;
}

// ---------- Copy ----------

/**
 * Copies `text` and says so: the icon turns to a check and the site's toast rises (the .copy styles in components.css). `visible` gives a labelled
 * ghost button ("Copy all") instead of the icon. The button's own name changes too, so a screen reader hears the result.
 */
export function CopyButton({ text, label, visible }: { text: string; label: string; visible?: string }) {
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle');
  const timer = useRef(0);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const copy = () => {
    window.clearTimeout(timer.current);
    const done = (next: 'copied' | 'failed') => {
      setState(next);
      timer.current = window.setTimeout(() => setState('idle'), 1600);
    };
    if (!navigator.clipboard) return done('failed');
    navigator.clipboard.writeText(text).then(
      () => done('copied'),
      () => done('failed'),
    );
  };
  const name = state === 'copied' ? 'Copied' : state === 'failed' ? 'Could not copy' : label;
  return (
    <span className="copy" data-state={state}>
      {visible ? (
        <button type="button" className="btn btn-ghost btn-sm bw-copy-all" onClick={copy}>
          <Copy className="size-4" aria-hidden />
          {state === 'copied' ? 'Copied' : visible}
        </button>
      ) : (
        <button type="button" className="copy-btn" onClick={copy} aria-label={name}>
          <Copy className="copy-a size-4" aria-hidden />
          <Check className="copy-b size-4" aria-hidden />
        </button>
      )}
      <span className="copy-toast" aria-live="polite">
        {state === 'idle' ? '' : name}
      </span>
    </span>
  );
}

// ---------- Dates and durations ----------

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/** '2026-11-11' → '11 November 2026'; '2026-11' → 'November 2026'; '2026' → '2026'. Anything else as it is. */
export function longDate(iso: string): string {
  const m = /^(\d{4})(?:-(\d{2}))?(?:-(\d{2}))?$/.exec(iso);
  if (!m) return iso;
  const [, y, mo, d] = m;
  const month = mo ? MONTHS[Number(mo) - 1] : undefined;
  if (!month) return y as string;
  return d ? `${Number(d)} ${month} ${y}` : `${month} ${y}`;
}

/** An ISO 8601 duration ('PT1H30M', 'P30D') in words, or null. */
export function durationWords(iso: string | undefined): string | null {
  if (!iso) return null;
  const m = /^P(?:(\d+)W)?(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?)?$/.exec(iso);
  if (!m) return null;
  const parts: string[] = [];
  const unit = (n: string | undefined, one: string) => {
    if (n && Number(n) > 0) parts.push(`${Number(n)} ${one}${Number(n) === 1 ? '' : 's'}`);
  };
  unit(m[1], 'week');
  unit(m[2], 'day');
  unit(m[3], 'hour');
  unit(m[4], 'minute');
  return parts.length ? parts.join(' ') : null;
}
