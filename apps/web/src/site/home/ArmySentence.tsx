import { m, useMotionValue, useMotionValueEvent, useScroll, useTransform, type MotionValue } from 'motion/react';
import { useLayoutEffect, useRef, useState, type ReactNode, type RefObject } from 'react';
import { Character, cascade, type CastId, type CharacterHandle } from '../../cast';
import { ARMY_SENTENCE, FOOTER_CAST_ORDER } from '../../lib/content';
import { useMotionOk } from '../../lib/motionOk';

// The Army sentence (motion M2, V2-SPEC 5.2 row 3): a box that hugs the sentence (grpE13; was screen-tall) and scrolls with the page (home11: no longer a pinned 220 vh stage, which held
// the page still under the visitor's scroll and read as stuck). The four stand in a line-up at the bottom; as the box rises up the screen each flies
// into its slot in the sentence, just before its own phrase, which brightens as it lands. All four have landed by the time the box is centred.
//
// The markup with no JavaScript, under Pause animations, or if motion is refused is the end state: no pinning, the four already sitting in their slots
// (their rest pose needs no rig). Motion opts in from there. Words and slots are aria-hidden; screen readers get the plain sentence once.

const PHONE = '(max-width: 734px)';
/** Each flight: 0.12 to 0.35 of the stage, one character 0.05 after the other, so the last lands at 0.5 and the sentence holds after that. */
const START = 0.12;
const FLIGHT = 0.23;
const STAGGER = 0.05;
const LAND = START + FLIGHT + STAGGER * 3;

interface Point {
  x: number;
  y: number;
}

interface Geo {
  /** Rendered size of a flyer (its width; the box is 13:12). */
  size: number;
  from: Record<CastId, Point>;
  slot: Record<CastId, Point & { s: number }>;
}

const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

function Phrase({ p, index, live, children }: { p: MotionValue<number>; index: number; live: boolean; children: ReactNode }) {
  const w0 = START + STAGGER * index;
  // A function, not a keyframe range: Motion hands a range on scroll progress to a native ScrollTimeline, whose effect lets go past its end and drops
  // the phrase back to 0.3. A function keeps it on the JavaScript side, clamped.
  const opacity = useTransform(p, (v) => 0.3 + 0.7 * clamp01((v - w0) / FLIGHT));
  return (
    <m.span className="army-phrase" style={live ? { opacity } : undefined}>
      {children}
    </m.span>
  );
}

function Flyer({ who, index, p, geo, version, handle }: { who: CastId; index: number; p: MotionValue<number>; geo: RefObject<Geo | null>; version: MotionValue<number>; handle: (h: CharacterHandle | null) => void }) {
  const w0 = START + STAGGER * index;
  const at = (v: number) => {
    const g = geo.current;
    if (!g) return { x: 0, y: 0, s: 1 };
    const from = g.from[who];
    const slot = g.slot[who];
    const t = clamp01((v - w0) / FLIGHT);
    const e = ease(t);
    return { x: lerp(from.x, slot.x, e), y: lerp(from.y, slot.y, e) - Math.sin(Math.PI * t) * 40, s: lerp(1, slot.s, e) };
  };
  const x = useTransform([p, version], ([v]: number[]) => at(v ?? 0).x);
  const y = useTransform([p, version], ([v]: number[]) => at(v ?? 0).y);
  const scale = useTransform([p, version], ([v]: number[]) => at(v ?? 0).s);
  return (
    <m.div className="army-flyer" style={{ x, y, scale }}>
      <Character ref={handle} who={who} size="var(--army-fly)" />
    </m.div>
  );
}

export function ArmySentence() {
  const sentence = ARMY_SENTENCE;
  const stage = useRef<HTMLDivElement>(null);
  const sticky = useRef<HTMLDivElement>(null);
  const slots = useRef<Partial<Record<CastId, HTMLSpanElement | null>>>({});
  const handles = useRef<Partial<Record<CastId, CharacterHandle | null>>>({});
  const geo = useRef<Geo | null>(null);
  const version = useMotionValue(0);
  const ok = useMotionOk();
  // Opted in after the first paint, so the static end state is what renders without JavaScript.
  const [armed, setArmed] = useState(false);
  const live = armed && ok;
  // 0 as the box's top enters the bottom tenth of the screen, 1 as its bottom leaves the top tenth: the flights (0.12 to 0.5) run while the box rises
  // from the lower screen to about the middle, and the sentence then stays whole as it scrolls away.
  const { scrollYProgress: p } = useScroll({ target: stage, offset: ['start 90%', 'end 10%'] });

  useLayoutEffect(() => setArmed(true), []);

  // Where everything is, inside the box (offsets inside it do not change as it scrolls).
  useLayoutEffect(() => {
    const box = sticky.current;
    if (!live || !box || !sentence) return;
    const measure = () => {
      const r = box.getBoundingClientRect();
      const phone = matchMedia(PHONE).matches;
      const size = phone ? 96 : 150;
      const h = (size * 12) / 13;
      const span = Math.min(r.width - size, phone ? 300 : 720);
      const order = FOOTER_CAST_ORDER;
      const from = {} as Geo['from'];
      const slot = {} as Geo['slot'];
      order.forEach((who, i) => {
        // The line-up: centres spread across the middle of the stage, just under the box (grpE13: the box hugs the sentence now, so the four wait
        // below it, under the fold when their flights start, and rise into their slots).
        from[who] = { x: r.width / 2 - span / 2 + (span * i) / Math.max(1, order.length - 1) - size / 2, y: r.height + (phone ? 8 : 16) };
        const s = slots.current[who]?.getBoundingClientRect();
        // The slot's centre is the flyer's centre at the end of its flight; it scales about its own centre.
        slot[who] = s ? { x: s.left - r.left + s.width / 2 - size / 2, y: s.top - r.top + s.height / 2 - h / 2, s: s.width / size } : { ...from[who], s: 1 };
      });
      geo.current = { size, from, slot };
      box.style.setProperty('--army-fly', `${size}px`);
      version.set(version.get() + 1);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(box);
    void document.fonts?.ready.then(measure);
    return () => ro.disconnect();
  }, [live, sentence, version]);

  // One small hop for all four when the last one lands, once.
  const hopped = useRef(false);
  useMotionValueEvent(p, 'change', (v) => {
    if (!live || hopped.current || v < LAND) return;
    hopped.current = true;
    cascade(
      FOOTER_CAST_ORDER.map((who) => handles.current[who]),
      'hop',
      { small: true },
    );
  });

  if (!sentence) return null;

  return (
    <div ref={stage} className="army" data-armed={live ? '' : undefined}>
      <div ref={sticky} className="army-sticky">
        <p className="army-sentence">
          <span className="sr-only">{sentence.plain}</span>
          <span aria-hidden>
            {sentence.parts.map((part, i) => {
              // The slot and the name never part at a line break.
              const [first, ...rest] = part.text.split(' ');
              return (
                <Phrase key={part.who} p={p} index={i} live={live}>
                  <span className="army-lead">
                    <span
                      className="army-slot"
                      data-who={part.who}
                      ref={(el) => {
                        slots.current[part.who] = el;
                      }}
                    >
                      <Character who={part.who} size="100%" track={false} />
                    </span>
                    {first}
                  </span>{' '}
                  {rest.join(' ')}{' '}
                </Phrase>
              );
            })}
          </span>
        </p>
        {live && (
          <div className="army-flyers" aria-hidden>
            {FOOTER_CAST_ORDER.map((who) => (
              <Flyer
                key={who}
                who={who}
                index={sentence.parts.findIndex((part) => part.who === who)}
                p={p}
                geo={geo}
                version={version}
                handle={(h) => {
                  handles.current[who] = h;
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
