import { m, useSpring } from 'motion/react';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { Character, type CastId, type CharacterHandle, type Expression } from '../../cast';
import { Reveal, SectionHead } from '../../components/ui';
import { SERVICES, STEPS } from '../../lib/content';
import { useMotionOk } from '../../lib/motionOk';
import { spring } from '../../lib/spring';
import { useVisible } from './shared';

interface Part {
  expression?: Expression;
  prop?: boolean;
}

interface Scene {
  tint: string;
  size: 'lg' | 'md' | 'sm';
  parts: Partial<Record<CastId, Part>>;
  signature?: CastId;
}

/** Who is on stage for each step (characters 7.3). */
const SCENES: Scene[] = [
  { tint: 'var(--c-yellow)', size: 'lg', parts: { sochu: { prop: true } }, signature: 'sochu' },
  { tint: 'var(--c-yellow)', size: 'lg', parts: { sochu: { expression: 'thinking', prop: true } } },
  { tint: 'var(--c-green)', size: 'md', parts: { bolu: { expression: 'talking', prop: true }, tiko: { prop: true } } },
  { tint: 'var(--c-orange)', size: 'lg', parts: { gola: { prop: true } }, signature: 'gola' },
  {
    tint: 'var(--c-purple)',
    size: 'sm',
    parts: { tiko: { expression: 'celebrating' }, sochu: { expression: 'celebrating' }, bolu: { expression: 'celebrating' }, gola: { expression: 'celebrating' } },
  },
];

const ORDER: CastId[] = ['bolu', 'tiko', 'sochu', 'gola'];

/**
 * All four stand in the wings the whole time and step on stage when it is their turn: a performer who stays for the next step just changes expression,
 * and the rig is never torn down in the middle of a scroll. Hidden ones are display:none, which the director treats as off screen and pays nothing for.
 */
function Stage({ step }: { step: number }) {
  const scene = SCENES[step] ?? SCENES[0]!;
  const box = useRef<HTMLDivElement>(null);
  const visible = useVisible(box, 0.2);
  const actors = useRef<Partial<Record<CastId, CharacterHandle | null>>>({});

  useEffect(() => {
    if (!visible || !scene.signature) return;
    const who = scene.signature;
    const cue = setTimeout(() => actors.current[who]?.play('signature'), 220);
    return () => clearTimeout(cue);
  }, [step, visible, scene.signature]);

  const onStage = ORDER.filter((who) => scene.parts[who]);

  return (
    <div ref={box} className="how-stage" data-size={scene.size} aria-hidden>
      {ORDER.map((who) => {
        const part = scene.parts[who];
        return (
          <div key={who} className="how-actor" data-on={part ? '' : undefined} style={{ '--i': Math.max(0, onStage.indexOf(who)) } as CSSProperties}>
            <Character
              ref={(handle) => {
                actors.current[who] = handle;
              }}
              who={who}
              size="var(--how-size)"
              expression={part?.expression ?? 'idle'}
              prop={part?.prop ?? false}
            />
          </div>
        );
      })}
    </div>
  );
}

export function Process() {
  const [active, setActive] = useState(0);
  const items = useRef<(HTMLLIElement | null)[]>([]);
  const list = useRef<HTMLOListElement>(null);
  const ok = useMotionOk();
  const thumb = useSpring(0, spring.snappy);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const i = items.current.indexOf(entry.target as HTMLLIElement);
          if (i >= 0) setActive(i);
        }
      },
      { rootMargin: '-45% 0px -45% 0px' },
    );
    items.current.forEach((el) => {
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  // The marker's position comes from the layout rather than from a fixed step height, so it survives any wrap. Physics spring: a fast scroll past several steps keeps its speed.
  useEffect(() => {
    const place = (animated: boolean) => {
      const y = items.current[active]?.offsetTop ?? 0;
      if (animated && ok) thumb.set(y);
      else thumb.jump(y);
    };
    place(true);
    const onResize = () => place(false);
    const ro = new ResizeObserver(onResize);
    if (list.current) ro.observe(list.current);
    return () => ro.disconnect();
  }, [active, ok, thumb]);

  return (
    <section id="how-it-works" className="band-dark">
      <div className="wrap section">
        <div className="how-grid">
          <div className="how-side">
            <SectionHead center={false} eyebrow="How it works" title="Vox pop production made simple" lead="We work step by step to turn raw street interviews into polished, professional and viral videos effortlessly." />
            <Stage step={active} />
          </div>

          <div className="how-track" style={{ '--step-c': SCENES[active]?.tint } as CSSProperties}>
            <m.span className="how-thumb" style={{ y: thumb }} aria-hidden />
            <ol ref={list} className="how-steps">
            {STEPS.map((s, i) => (
              <li
                key={s.name}
                className="how-step"
                data-active={i === active ? '' : undefined}
                ref={(el) => {
                  items.current[i] = el;
                }}
              >
                <span className="how-num" aria-hidden>
                  {i + 1}
                </span>
                <h3 className="h3">{s.name}</h3>
                <p>{s.body}</p>
              </li>
            ))}
            </ol>
          </div>
        </div>

        <div id="services" className="how-strip-block">
          <Reveal variant="rise">
            <h3 className="how-strip-title two-tone">
              <b>Vox pop as a service for brands.</b> One shoot, cut for every short-form feed your customers already watch.
            </h3>
          </Reveal>
          <Reveal className="how-strip">
            <ul>
              {SERVICES.map((s) => (
                <li key={s.name}>
                  <h4 className="label">{s.name}</h4>
                  <p>{s.body}</p>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
