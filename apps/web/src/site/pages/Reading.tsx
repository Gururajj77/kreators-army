import { useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from 'react';
import { Link } from 'react-router';
import { Seo } from '../../components/ui';

// What the quiet pages share: the title's gradient word, the progress hairline, section tracking and the legal layout. The post covers and the gradient
// word live in blog/render/covers.tsx, which the build's prerender also draws.

export { GradientTail } from '../../blog/render/covers';

/** A URL-safe id from a heading. */
export const anchor = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

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
