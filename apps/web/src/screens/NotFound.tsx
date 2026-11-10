import { useEffect, useRef } from 'react';
import { Character, cascade, castLookAt, type CastId, type CharacterHandle, type Expression } from '../cast';
import { Cta, Seo } from '../components/ui';

const CREW: { who: CastId; expression: Expression; prop?: boolean }[] = [
  { who: 'sochu', expression: 'confused' },
  { who: 'bolu', expression: 'talking', prop: true },
  { who: 'tiko', expression: 'confused' },
  { who: 'gola', expression: 'wink' },
];

/** The best line on the site, with four witnesses. Bolu puts the question to each of the others, they all shrug, and everybody looks at the way out. Once. */
export function NotFound() {
  const crew = useRef<(CharacterHandle | null)[]>([]);
  const action = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const [sochu, bolu, tiko, gola] = crew.current;
    // Bolu's talking pose has drawn eyes, which cannot look anywhere: it opens them for the three glances, then goes back to talking.
    const timers = [
      window.setTimeout(() => bolu?.setExpression('open', { hold: 1560 }), 420),
      window.setTimeout(() => bolu?.lookAt(document.querySelector('[data-who="sochu"]'), 520), 420),
      window.setTimeout(() => bolu?.lookAt(document.querySelector('[data-who="tiko"]'), 520), 940),
      window.setTimeout(() => bolu?.lookAt(document.querySelector('[data-who="gola"]'), 520), 1460),
      window.setTimeout(() => cascade([sochu, tiko, gola, bolu], 'shrug', { stagger: 180, force: true }), 2020),
      window.setTimeout(() => {
        bolu?.setExpression('happy');
        const home = action.current?.querySelector('a');
        if (home) castLookAt(home, 1600);
      }, 3400),
    ];
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, []);

  return (
    <section className="lost">
      <Seo title="Page not found" description="This page could not be found." noindex />
      <div className="ground" aria-hidden />
      <div className="wrap lost-in">
        <div className="lost-crew">
          {CREW.map((c, i) => (
            <Character
              key={c.who}
              ref={(h) => {
                crew.current[i] = h;
              }}
              who={c.who}
              size="clamp(min(72px, calc((87.5vw - 36px) / 4)), 10.4vw, 150px)"
              expression={c.expression}
              prop={c.prop}
            />
          ))}
        </div>
        <h1 className="display">
          Nobody on the street has <span className="g-word">heard</span> of this page
        </h1>
        <div ref={action}>
          <Cta to="/">Go home</Cta>
        </div>
      </div>
    </section>
  );
}
