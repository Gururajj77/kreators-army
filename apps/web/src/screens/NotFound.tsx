import { useEffect, useRef, type CSSProperties } from 'react';
import { bubbleToken, Character, castLookAt, type CastId, type CharacterHandle, type Expression } from '../cast';
import { CastBubble, useCastLine } from '../components/chat';
import { Street } from '../components/street';
import { Cta, Seo } from '../components/ui';
import type { CastLineKey } from '../lib/content';

// The 404 (visual §2.9, V2-SPEC 5.10): the street at night inside a dark card, and an interview that goes nowhere. Bolu puts the question, the other
// three answer in turn, one bubble at a time, then everybody looks at the way home. Once per page view. The sequence takes the one-speaker token
// once for its whole run. Under still the bubbles appear and leave with opacity only, on the same timing.

interface Crew {
  who: CastId;
  /** Width in px on desktop; every character is 72 on phones. */
  size: number;
  expression: Expression;
  /** The face for their answer. */
  answer?: Expression;
  side?: 'start' | 'end';
  line: CastLineKey;
}

// Left to right on the footpath, as prototyped: a line-up, not one height.
const CREW: Crew[] = [
  { who: 'sochu', size: 96, expression: 'idle', answer: 'confused', side: 'start', line: 'notFound.sochu' },
  { who: 'bolu', size: 132, expression: 'talking', line: 'notFound.ask' },
  { who: 'tiko', size: 120, expression: 'idle', answer: 'confused', line: 'notFound.tiko' },
  { who: 'gola', size: 104, expression: 'idle', answer: 'wink', side: 'end', line: 'notFound.gola' },
];

const ORDER: CastLineKey[] = ['notFound.ask', 'notFound.sochu', 'notFound.tiko', 'notFound.gola'];

export function NotFound() {
  const crew = useRef<Partial<Record<CastId, CharacterHandle | null>>>({});
  const card = useRef<HTMLDivElement>(null);
  const home = useRef<HTMLDivElement>(null);
  const cast = useCastLine();

  useEffect(() => {
    const el = card.current;
    if (!el) return;
    const seq = { interview: true };
    let alive = true;
    let held = false;
    const run = async () => {
      // One take of the token for the whole interview; each line is said under it.
      held = await bubbleToken.wait(seq, 2000);
      if (!held || !alive) return;
      const bolu = crew.current.bolu;
      for (const key of ORDER) {
        if (!alive) break;
        const c = CREW.find((m) => m.line === key)!;
        const by = crew.current[c.who];
        // Bolu turns to whoever is answering. Bolu's talking face has drawn eyes, which cannot look, so it opens them for the glance.
        if (c.who !== 'bolu' && by?.el()) {
          bolu?.setExpression('open', { hold: 900 });
          bolu?.lookAt(by.el(), 900);
        }
        await cast.say(key, { by, owner: seq, untilGone: true, expression: c.answer ?? 'talking' });
        await new Promise((r) => window.setTimeout(r, 250));
      }
      if (!alive) return;
      bolu?.setExpression('happy');
      const link = home.current?.querySelector('a');
      if (link) castLookAt(link, 1800);
    };
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e?.isIntersecting || e.intersectionRatio < 0.5) return;
        io.disconnect();
        void run();
      },
      { threshold: [0, 0.5] },
    );
    io.observe(el);
    return () => {
      alive = false;
      io.disconnect();
      if (held) bubbleToken.release(seq);
    };
  }, [cast]);

  return (
    <section className="nf">
      <Seo title="Page not found" description="This page could not be found." noindex />
      <div className="wrap">
        <div ref={card} className="nf-card band-dark" data-bubble-bounds="">
          <Street variant="band" time="night" className="nf-street">
            <div className="nf-cast">
              {CREW.map((c) => (
                <Character
                  key={c.who}
                  ref={(h) => {
                    crew.current[c.who] = h;
                  }}
                  who={c.who}
                  size="var(--nf-size)"
                  style={{ '--nf-size-d': `${c.size}px` } as CSSProperties}
                  expression={c.expression}
                  onDark
                >
                  <CastBubble {...cast.bubble(c.line)} side={c.side} />
                </Character>
              ))}
            </div>
          </Street>
          <div className="nf-copy">
            <h1 className="display-md nf-title">
              Nobody on the street has <span className="g-word">heard</span> of this page
            </h1>
            <div ref={home} className="nf-action">
              <Cta to="/" kind="light">
                Go home
              </Cta>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
