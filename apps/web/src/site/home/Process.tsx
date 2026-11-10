import { useCallback, useEffect, useRef, useState, type CSSProperties, type RefObject } from 'react';
import { Link } from 'react-router';
import { Character, type CastId, type CharacterHandle, type Expression } from '../../cast';
import { CastBubble, useCastLine } from '../../components/chat';
import { Reveal, SectionHead } from '../../components/ui';
import { EditTimeline, type TimelineStep } from '../../components/visuals';
import { JOURNEY, PLATFORMS_HEAD, type CastLineKey } from '../../lib/content';
import { PlatformStrip } from './Platforms';

// #how-it-works and #services (V2-SPEC 5.2 row 4), dark in both themes. The journey is an editing timeline in a 160 vh stage (M9): the playhead follows
// the scroll, the clip under it lights, and v1's cast scenes stand on the plate's top edge, re-mapped to the v2 steps (content §2.4). Each step's
// speaker says its line once as the playhead lands. Phones get the timeline's vertical list without the scene.

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
}

/** content §2.4: 1 Sochu with the clipboard, 2 the shoot (Bolu talking with Tiko), 3 Sochu thinking, 4 Sochu ticks the lock list, 5 Gola, then all four. */
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
          <div key={who} className="how-actor" data-on={part ? '' : undefined} style={{ '--i': Math.max(0, onStage.indexOf(who)) } as CSSProperties}>
            <Character
              ref={(handle) => {
                actors.current[who] = handle;
              }}
              who={who}
              size="var(--how-size)"
              expression={part?.expression ?? 'idle'}
              prop={part?.prop ?? false}
            >
              {SCENES.map((s, k) => (s.speaker === who ? <CastBubble key={k} {...cast.bubble(lineOf(k))} side={who === 'gola' && s.size === 'sm' ? 'start' : 'center'} /> : null))}
            </Character>
          </div>
        );
      })}
    </div>
  );
}

export function Process() {
  const cast = useCastLine();
  const { say } = cast;
  const actors = useRef<Partial<Record<CastId, CharacterHandle | null>>>({});
  // The step whose line is due. Said after the render that put its speaker on stage, so the speaker is on screen when it speaks.
  const [due, setDue] = useState<number | null>(null);
  const onStep = useCallback((k: number) => setDue(k), []);

  useEffect(() => {
    if (due === null) return;
    const who = SCENES[due]?.speaker;
    if (!who) return;
    const t = window.setTimeout(() => void say(lineOf(due), { by: actors.current[who], expression: null }), 160);
    return () => window.clearTimeout(t);
  }, [due, say]);

  return (
    <section id="how-it-works" className="band-dark how-section" data-bubble-bounds="">
      <div className="wrap section">
        <SectionHead center={false} eyebrow="How it works" title="From trial to batch" lead="Start with a trial on your own brand. If you want to continue, this is how it runs." />

        <EditTimeline className="how-timeline" steps={STEPS} mode="stage" onStep={onStep} label="From trial to batch, in five steps" scene={(active) => <Stage step={active} actors={actors} cast={cast} />} />

        <p className="how-links">
          <Link to="/trial#after" className="how-link">
            Every step after the trial →
          </Link>
          <Link to="/how-we-work" className="how-link">
            How we work →
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
