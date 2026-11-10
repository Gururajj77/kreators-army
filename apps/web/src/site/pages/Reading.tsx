import { useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from 'react';
import { Link } from 'react-router';
import { Seo } from '../../components/ui';
import { type Post } from '../../lib/content';

// What the quiet pages share: the post covers, reading time, the progress hairline, section tracking and the legal layout.

/** A URL-safe id from a heading. */
export const anchor = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

/** Words at 200 a minute, never less than one. Worked out from the post itself, lists included. */
export function readingTime(post: Post): string {
  const words = post.sections
    .flatMap((s) => [s.heading ?? '', ...s.body, ...(s.list ?? [])])
    .join(' ')
    .split(/\s+/)
    .filter(Boolean).length;
  return `${Math.max(1, Math.round(words / 200))} min read`;
}

/**
 * A title with its last word as the page's one gradient word (G3). Posts have no word marked in content.md, and every public page carries exactly one,
 * so a post takes the last word of its title ("What goes in a vox pop brief"). The words themselves are unchanged.
 */
export function GradientTail({ text }: { text: string }) {
  const m = /^(.*\s)?(\S+?)([?.!,:]*)$/.exec(text);
  if (!m) return <>{text}</>;
  const [, head = '', word = '', tail = ''] = m;
  return (
    <>
      {head}
      <span className="g-word">{word}</span>
      {tail}
    </>
  );
}

/** Which section a sticky index should mark: the last one whose top has passed a line a third of the way down the window, and the first of all at the top of the page. */
export function useActiveSection(ids: string[]): string | undefined {
  const [active, setActive] = useState(ids[0]);
  const key = ids.join('|');
  useEffect(() => {
    const list = key.split('|');
    let frame = 0;
    const read = () => {
      frame = 0;
      const line = window.innerHeight * 0.33;
      let current = list[0];
      for (const id of list) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= line) current = id;
      }
      setActive(current);
    };
    const queue = () => {
      if (!frame) frame = requestAnimationFrame(read);
    };
    read();
    window.addEventListener('scroll', queue, { passive: true });
    window.addEventListener('resize', queue, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', queue);
      window.removeEventListener('resize', queue);
    };
  }, [key]);
  return active;
}

/** A hairline at the very top of the window: how far through the article you are, not the page. One passive listener, written straight to the transform. */
export function ReadingProgress({ target }: { target: RefObject<HTMLElement | null> }) {
  const bar = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let frame = 0;
    const paint = () => {
      frame = 0;
      const el = target.current;
      const b = bar.current;
      if (!el || !b) return;
      const scrollable = el.getBoundingClientRect().bottom + window.scrollY - window.innerHeight;
      b.style.opacity = scrollable > 16 ? '1' : '0';
      b.style.transform = `scaleX(${scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 1})`;
    };
    const queue = () => {
      if (!frame) frame = requestAnimationFrame(paint);
    };
    paint();
    window.addEventListener('scroll', queue, { passive: true });
    window.addEventListener('resize', queue, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', queue);
      window.removeEventListener('resize', queue);
    };
  }, [target]);
  return <div ref={bar} className="read-progress" aria-hidden />;
}

// ---------- Post covers: G1, one hue each, with art made only from the idea of the post. No characters. ----------

/** Voice of the people: a microphone and the sound coming off it. */
function Rings() {
  return (
    <g fill="#fff">
      {[390, 300, 214, 132].map((r) => (
        <circle key={r} cx="430" cy="226" r={r} opacity=".1" />
      ))}
      <rect x="412" y="250" width="36" height="300" rx="18" opacity=".92" />
      <circle cx="430" cy="226" r="74" />
    </g>
  );
}

/** Six parts of an interaction, setup to edit, climbing. */
function Stairs() {
  return (
    <g fill="#fff">
      {[0.2, 0.26, 0.32, 0.4, 0.5, 0.94].map((opacity, i) => {
        const h = 84 + i * 50;
        return <rect key={i} x={78 + i * 82} y={440 - h} width="64" height={h + 80} rx="18" opacity={opacity} />;
      })}
    </g>
  );
}

/** Five feeds: one shoot, cut for every phone. */
function Phones() {
  const fan = [
    [-27, 0.24],
    [-13.5, 0.36],
    [13.5, 0.36],
    [27, 0.24],
    [0, 0.94],
  ] as const;
  return (
    <g fill="#fff">
      {fan.map(([angle, opacity]) => (
        <rect key={angle} x="257" y="120" width="126" height="224" rx="26" opacity={opacity} transform={`rotate(${angle} 320 880)`} />
      ))}
    </g>
  );
}

/** The brief: six lines on a sheet, the ones already decided ticked. */
function Sheet() {
  const rows = [0, 1, 2, 3, 4, 5];
  return (
    <g fill="#fff" transform="translate(0 22)">
      <rect x="196" y="64" width="248" height="352" rx="30" opacity=".3" />
      <rect x="214" y="82" width="212" height="316" rx="22" opacity=".94" />
      <rect x="276" y="48" width="88" height="42" rx="21" opacity=".94" />
      {rows.map((i) => (
        <g key={i} opacity={i < 3 ? 1 : 0.55}>
          <circle
            cx="252"
            cy={132 + i * 46}
            r="12"
            fill={i < 3 ? 'var(--cover-ink)' : 'none'}
            stroke="var(--cover-ink)"
            strokeWidth="4"
            opacity={i < 3 ? 0.9 : 0.3}
          />
          <rect x="278" y={124 + i * 46} width={i % 2 ? 104 : 128} height="16" rx="8" fill="var(--cover-ink)" opacity=".22" />
        </g>
      ))}
    </g>
  );
}

/** Eleven ways in: one shape each, no two alike in size or weight. */
function Eleven() {
  const dots: [number, number, number, number][] = [
    [150, 140, 46, 0.94],
    [262, 118, 30, 0.4],
    [356, 150, 56, 0.6],
    [478, 128, 38, 0.3],
    [120, 270, 30, 0.34],
    [222, 250, 54, 0.7],
    [340, 282, 34, 0.92],
    [452, 256, 60, 0.46],
    [168, 380, 40, 0.5],
    [298, 384, 48, 0.3],
    [424, 384, 32, 0.8],
  ];
  return (
    <g fill="#fff">
      {dots.map(([cx, cy, r, opacity], i) => (
        <circle key={i} cx={cx} cy={cy} r={r} opacity={opacity} />
      ))}
    </g>
  );
}

const COVERS = [
  { tone: 'tiko', Art: Rings },
  { tone: 'gola', Art: Stairs },
  { tone: 'bolu', Art: Phones },
  { tone: 'sochu', Art: Sheet },
  { tone: 'tiko', Art: Eleven },
] as const;

/** A post's cover. Goes by its place in POSTS, so a new post gets the next one. Four hues for five posts: the first and the last share purple, far apart on the index. */
export function PostCover({ index, className }: { index: number; className?: string }) {
  const cover = COVERS[index % COVERS.length] ?? COVERS[0];
  const { Art } = cover;
  return (
    <div className={`post-cover ${className ?? ''}`} data-tone={cover.tone} aria-hidden>
      <svg viewBox="0 0 640 480" preserveAspectRatio="xMidYMid slice" focusable="false">
        <Art />
      </svg>
    </div>
  );
}

// ---------- Legal ----------

export interface LegalSection {
  heading: string;
  body: ReactNode;
}

/** A small title, a 65-character measure and section links. The words are the page. `heading` is the H1 when it carries markup (the gradient word). */
export function LegalPage({
  title,
  heading,
  description,
  updated,
  intro,
  sections,
}: {
  title: string;
  heading?: ReactNode;
  description: string;
  updated: string;
  intro: ReactNode;
  sections: LegalSection[];
}) {
  const items = useMemo(() => sections.map((s) => ({ ...s, id: anchor(s.heading) })), [sections]);
  const active = useActiveSection(items.map((s) => s.id));
  return (
    <div className="wrap legal">
      <Seo title={title} description={description} />
      <header className="legal-head">
        <h1 className="h2-sm">{heading ?? title}</h1>
        <p className="legal-updated small">Last updated {updated}</p>
      </header>
      <aside className="legal-index">
        <nav aria-label="On this page">
          <p className="caption legal-index-title">On this page</p>
          <div className="legal-index-links">
            {items.map((s) => (
              <Link key={s.id} to={`#${s.id}`} className="legal-index-link" aria-current={active === s.id ? 'true' : undefined}>
                {s.heading}
              </Link>
            ))}
          </div>
        </nav>
      </aside>
      <article className="legal-body">
        <div className="read-prose">
          <p>{intro}</p>
          {items.map((s) => (
            <section key={s.id} id={s.id} aria-labelledby={`${s.id}-h`}>
              <h2 id={`${s.id}-h`}>{s.heading}</h2>
              {s.body}
            </section>
          ))}
        </div>
      </article>
    </div>
  );
}
