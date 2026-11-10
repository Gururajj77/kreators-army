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

/** Words at 200 a minute, never less than one. Worked out from the post itself. */
export function readingTime(post: Post): string {
  const words = post.sections.flatMap((s) => [s.heading ?? '', ...s.body]).join(' ').split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.round(words / 200))} min read`;
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

/** Five steps, first call to ready-to-post. */
function Stairs() {
  return (
    <g fill="#fff">
      {[0.22, 0.3, 0.38, 0.48, 0.94].map((opacity, i) => {
        const h = 92 + i * 58;
        return <rect key={i} x={92 + i * 94} y={440 - h} width="74" height={h + 80} rx="20" opacity={opacity} />;
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

function Petals() {
  return (
    <g fill="#fff" opacity=".9">
      <circle cx="262" cy="182" r="86" />
      <circle cx="378" cy="182" r="86" />
      <circle cx="262" cy="298" r="86" />
      <circle cx="378" cy="298" r="86" />
    </g>
  );
}

const COVERS = [
  { tone: 'tiko', Art: Rings },
  { tone: 'gola', Art: Stairs },
  { tone: 'bolu', Art: Phones },
  { tone: 'sochu', Art: Petals },
] as const;

/** A post's cover. Goes by its place in POSTS, so a new post gets the next hue. */
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

/** A small title, a 65-character measure and section links. The words are the page. */
export function LegalPage({ title, description, updated, intro, sections }: { title: string; description: string; updated: string; intro: ReactNode; sections: LegalSection[] }) {
  const items = useMemo(() => sections.map((s) => ({ ...s, id: anchor(s.heading) })), [sections]);
  const active = useActiveSection(items.map((s) => s.id));
  return (
    <div className="wrap legal">
      <Seo title={title} description={description} />
      <header className="legal-head">
        <h1 className="h2-sm">{title}</h1>
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
