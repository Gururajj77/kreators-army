import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type RefObject } from 'react';
import { Link } from 'react-router';
import { Character, type CastId, type CharacterHandle, type Expression } from '../../cast';
import { CastBubble, useCastLine } from '../../components/chat';
import { Reveal, SectionHead } from '../../components/ui';
import { EditTimeline, type TimelineStep } from '../../components/visuals';
import { JOURNEY, PLATFORMS_HEAD, type CastLineKey } from '../../lib/content';
import { PlatformStrip } from './Platforms';
import { TextArrow } from '../../components/TextArrow';

// #how-it-works and #services (V2-SPEC 5.2 row 4), dark in both themes. The journey is an editing timeline in a 160 vh stage (M9): the playhead follows
// the scroll, the clip under it lights, and v1's cast scenes stand on the plate's top edge, re-mapped to the v2 steps (content §2.4). Each step's
// speaker says its line once as the playhead lands. Round 16: the scene walks left to right over the clips with the scroll and stands on the active
// one (EditTimeline travel). Phones get the vertical list, with the step's speaker walking a mini-track above it.

interface Part {
  expression?: Expression;
  prop?: boolean;
}

interface Scene {
  size: 'lg' | 'md' | 'sm';
  parts: Partial<Record<CastId, Part>>;
  /** Plays its signature move as the scene arrives. */
  signature?: CastId;
  /** Says the step's line. */
  speaker: CastId;
  /** Stands on the step's clip as the scene walks (round 16); the others trail behind. Default: the scene is centred on the clip. */
  lead?: CastId;
}

/** content §2.4: 1 Sochu with the clipboard, 2 the shoot (Bolu talking with Tiko), 3 Sochu thinking, 4 Sochu ticks the lock list, 5 Gola, then all four
 * (Gola in front, on the last clip, the others trailing behind: the sm stage runs right to left). */
const SCENES: Scene[] = [
  { size: 'lg', parts: { sochu: { prop: true } }, signature: 'sochu', speaker: 'sochu' },
  { size: 'md', parts: { bolu: { expression: 'talking', prop: true }, tiko: { prop: true } }, speaker: 'bolu' },
  { size: 'lg', parts: { sochu: { expression: 'thinking', prop: true } }, speaker: 'sochu' },
  { size: 'lg', parts: { sochu: { prop: true } }, signature: 'sochu', speaker: 'sochu' },
  {
    size: 'sm',
    parts: { gola: { expression: 'celebrating', prop: true }, bolu: { expression: 'celebrating' }, tiko: { expression: 'celebrating' }, sochu: { expression: 'celebrating' } },
    signature: 'gola',
    speaker: 'gola',
    lead: 'gola',
  },
];

const ORDER: CastId[] = ['gola', 'bolu', 'tiko', 'sochu'];

const STEPS: TimelineStep[] = JOURNEY.map((s, i) => ({ ...s, who: SCENES[i]?.speaker }));

const lineOf = (k: number) => `home.how.${k + 1}` as CastLineKey;

/**
 * All four stand in the wings the whole time and step on stage when it is their turn: a performer who stays for the next step just changes expression,
 * and the rig is never torn down mid-scroll. Hidden ones are display: none, which the director treats as off screen.
 */
function Stage({ step, actors, cast }: { step: number; actors: RefObject<Partial<Record<CastId, CharacterHandle | null>>>; cast: ReturnType<typeof useCastLine> }) {
  const scene = SCENES[Math.max(0, step)] ?? SCENES[0]!;
  const onStage = ORDER.filter((who) => scene.parts[who]);

  // (walk17) A performer who stays on stage but changes place (step 4 to 5: Sochu walks alone, then Gola leads the four and Sochu trails at the back)
  // would snap across the stage against the walk. It pops in again at its new place instead, so the lead carries the walk and the others join behind.
  const els = useRef<Partial<Record<CastId, HTMLDivElement | null>>>({});
  const placed = useRef<{ size: Scene['size']; at: Partial<Record<CastId, number>> } | null>(null);
  useLayoutEffect(() => {
    const before = placed.current;
    const at: Partial<Record<CastId, number>> = {};
    onStage.forEach((who, i) => (at[who] = i));
    placed.current = { size: scene.size, at };
    if (!before) return;
    for (const who of onStage) {
      if (before.at[who] === undefined || (before.size === scene.size && before.at[who] === at[who])) continue;
      const el = els.current[who];
      if (!el) continue;
      // Its pop has long finished (and a finished CSS animation is gone from getAnimations()), so restart it the CSS way: off, a style flush, on.
      el.style.animation = 'none';
      void el.offsetWidth;
      el.style.animation = '';
    }
  });

  // (walk17) Scrolling back: a line whose speaker has left the stage goes with them (its bubble is display: none but would still hold the token).
  const { shown, bubble, hide } = cast;
  useEffect(() => {
    if (shown && !scene.parts[bubble(shown).who]) hide();
  }, [shown, bubble, hide, scene]);

  useEffect(() => {
    if (!scene.signature) return;
    const who = scene.signature;
    const cue = window.setTimeout(() => actors.current[who]?.play('signature'), 220);
    return () => window.clearTimeout(cue);
  }, [step, scene.signature, actors]);

  return (
    <div className="how-stage" data-size={scene.size}>
      {ORDER.map((who) => {
        const part = scene.parts[who];
        return (
          <div
            key={who}
            ref={(el) => {
              els.current[who] = el;
            }}
            className="how-actor"
            data-on={part ? '' : undefined}
            data-lead={part && scene.lead === who ? '' : undefined}
            style={{ '--i': Math.max(0, onStage.indexOf(who)) } as CSSProperties}>
            <Character
              ref={(handle) => {
                actors.current[who] = handle;
              }}
              who={who}
              size="var(--how-size)"
              expression={part?.expression ?? 'idle'}
              prop={part?.prop ?? false}
            >
              {SCENES.map((s, k) => (s.speaker === who ? <CastBubble key={k} {...cast.bubble(lineOf(k))} side={who === 'gola' && s.size === 'sm' ? 'end' : 'center'} /> : null))}
            </Character>
          </div>
        );
      })}
    </div>
  );
}

/** Phones: the step's speaker alone, small, on the mini-track over the list. All four stay mounted; the one off duty is display: none. */
function Walker({ step }: { step: number }) {
  const scene = SCENES[Math.max(0, step)] ?? SCENES[0]!;
  return (
    <span className="how-walker">
      {ORDER.map((who) => (
        <span key={who} className="how-walker-actor" data-on={scene.speaker === who ? '' : undefined}>
          <Character who={who} size={44} expression={scene.speaker === who ? (scene.parts[who]?.expression ?? 'idle') : 'idle'} />
        </span>
      ))}
    </span>
  );
}

export function Process() {
  const cast = useCastLine();
  const { say, hide } = cast;
  const actors = useRef<Partial<Record<CastId, CharacterHandle | null>>>({});
  // The step whose line is due. Said after the render that put its speaker on stage, so the speaker is on screen when it speaks.
  const [due, setDue] = useState<number | null>(null);
  const onStep = useCallback((k: number) => setDue(k), []);

  useEffect(() => {
    if (due === null) return;
    const who = SCENES[due]?.speaker;
    if (!who) return;
    // (walk17) The last step's line goes as the next step lands. It holds the one site-wide bubble token for its whole dwell, so at a reading pace
    // Bolu (step 2) and Gola (step 5) never got theirs, and step 5 showed Sochu's step-4 line from the back of the group.
    hide();
    // The previous speaker's signature move can still hold the token (say waits 600 ms, then gives up), so while this step stays lit it asks twice more.
    let t = 0;
    let gone = false;
    let tries = 0;
    const ask = () =>
      void say(lineOf(due), { by: actors.current[who], expression: null }).then((ok) => {
        if (!ok && !gone && ++tries < 3) t = window.setTimeout(ask, 300);
      });
    t = window.setTimeout(ask, 160);
    return () => {
      gone = true;
      window.clearTimeout(t);
    };
  }, [due, say, hide]);

  return (
    <section id="how-it-works" className="band-dark how-section" data-bubble-bounds="">
      <div className="wrap section">
        <SectionHead center={false} eyebrow="How it works" title="From trial to batch" lead="Start with a trial on your own brand. If you want to continue, this is how it runs." />

        <EditTimeline
          className="how-timeline"
          steps={STEPS}
          mode="stage"
          travel
          onStep={onStep}
          label="From trial to batch, in five steps"
          scene={(active) => <Stage step={active} actors={actors} cast={cast} />}
          mini={(active) => <Walker step={active} />}
        />

        <p className="how-links">
          <Link to="/trial#after" className="how-link">
            Every step after the trial<TextArrow />
          </Link>
          <Link to="/how-we-work" className="how-link">
            How we work<TextArrow />
          </Link>
        </p>

        <div id="services" className="how-strip-block">
          <Reveal variant="rise">
            <h3 className="how-strip-title two-tone">
              <b>{PLATFORMS_HEAD.strong}</b> {PLATFORMS_HEAD.rest}
            </h3>
          </Reveal>
          <PlatformStrip className="how-platforms" />
        </div>
      </div>
    </section>
  );
}
