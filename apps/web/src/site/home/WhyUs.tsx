import { ArrowRight } from 'lucide-react';
import { useRef, type CSSProperties, type FocusEvent, type PointerEvent } from 'react';
import { Link } from 'react-router';
import { Character, type CastId, type CharacterHandle } from '../../cast';
import { CastBubble, useCastLine } from '../../components/chat';
import { Reveal, RollNumber, SectionHead, Tile } from '../../components/ui';
import { ARMY_SENTENCE, CAST, TEAM, castById, type CastLineKey } from '../../lib/content';
import { ArmySentence } from './ArmySentence';

// #about, Why us (V2-SPEC 5.2 row 3): the two-tone statement with the word scrub (M12), the Army sentence stage (M2) when ARMY_SENTENCE is set, then
// the Meet the Army bento (id="features"): the copy tile, four army tiles that are real buttons, the team figures, and the mascots note under it.

const LEDE_INK = 'We build videos around real reactions.';
const LEDE_REST = 'Natural conversations with real people, made into native short-form content. Planned for attention and retention, never scripted.';

/** The statement's words for the scrub, numbered across both tones so the whole sentence brightens in one reading order. */
function Lede() {
  const ink = LEDE_INK.split(' ');
  const rest = LEDE_REST.split(' ');
  const word = (w: string, i: number) => (
    <span key={i} className="scrub-word" style={{ '--w': i } as CSSProperties}>
      {w}
    </span>
  );
  const spaced = (words: string[], offset: number) => words.flatMap((w, i) => (i === 0 ? [word(w, offset + i)] : [' ', word(w, offset + i)]));
  return (
    <>
      <span className="sr-only">
        {LEDE_INK} {LEDE_REST}
      </span>
      <span aria-hidden style={{ '--words': ink.length + rest.length } as CSSProperties}>
        <b>{spaced(ink, 0)}</b> {spaced(rest, ink.length)}
      </span>
    </>
  );
}

/** A tile that is a real button: a tap, a hover or keyboard focus plays the signature move, and the character says its line once, in the plate tone. */
function ArmyTile({ id, i, className }: { id: CastId; i: number; className: string }) {
  const actor = useRef<CharacterHandle>(null);
  const member = castById(id);
  const cast = useCastLine();
  const line = `home.army.${id}` as CastLineKey;
  const say = () => void cast.say(line, { by: actor.current, expression: null });

  const onEnter = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    actor.current?.play('signature', { source: 'hover' });
    say();
  };
  const onFocus = (e: FocusEvent<HTMLElement>) => {
    if (!e.target.matches(':focus-visible')) return;
    actor.current?.play('signature', { source: 'hover' });
    say();
  };

  return (
    <Reveal i={i} className={className}>
      <div
        className="h-full"
        onPointerEnter={onEnter}
        onFocus={onFocus}
        onPointerDown={() => actor.current?.press(true)}
        onPointerUp={() => actor.current?.press(false)}
        onPointerLeave={() => actor.current?.press(false)}
        onPointerCancel={() => actor.current?.press(false)}
        data-bubble-bounds=""
      >
        <Tile
          tone={id}
          onClick={() => {
            actor.current?.play('signature', { source: 'tap' });
            say();
          }}
          label={`${member.name}, ${member.role}. Plays their move.`}
          className="army-tile h-full"
        >
          <span className="army-words">
            <span className="h4">{member.name}</span>
            <span className="army-role">{member.role}</span>
          </span>
          <span className="army-stand">
            <Character ref={actor} who={id} size="var(--army-size)">
              <CastBubble {...cast.bubble(line)} side={id === 'sochu' || id === 'gola' ? 'end' : 'center'} />
            </Character>
          </span>
        </Tile>
      </div>
    </Reveal>
  );
}

const MASCOTS = CAST.map((c) => c.name)
  .join(', ')
  .replace(/, ([^,]*)$/, ' and $1');

export function WhyUs() {
  return (
    <section id="about" className="band-alt why-section">
      <div className="section">
        <div className="wrap">
          <SectionHead className="why-head" center={false} eyebrow="Why us" title={<Lede />} scrub />
        </div>

        {ARMY_SENTENCE && <ArmySentence />}

        <div className="wrap">
          <div id="features" className="why-bento">
            <Reveal className="why-slot-copy">
              <Tile className="h-full">
                <div className="why-copy">
                  <span className="eyebrow">Meet the Army</span>
                  <h3 className="why-copy-title">Not another editing agency</h3>
                  <p className="why-copy-body">Most influencer and UGC videos today feel scripted. So we do the opposite: we take the conversation to the street and capture real reactions around your product category.</p>
                  <p className="why-copy-foot">Every batch carries what we've learned from campaigns across consumer brands.</p>
                  <Link to="/careers" className="why-copy-link">
                    Who makes the videos <ArrowRight className="size-4" aria-hidden />
                  </Link>
                </div>
              </Tile>
            </Reveal>
            <ArmyTile id="sochu" i={1} className="why-slot-sochu" />
            <ArmyTile id="tiko" i={2} className="why-slot-tiko" />
            <ArmyTile id="bolu" i={1} className="why-slot-bolu" />
            <ArmyTile id="gola" i={2} className="why-slot-gola" />
            <Reveal i={3} className="why-slot-stats">
              <Tile className="h-full">
                <dl className="why-stats">
                  {TEAM.map((s) => (
                    <div key={s.label}>
                      <dt>{s.label}</dt>
                      <dd>
                        <RollNumber value={s.end} suffix={s.suffix} />
                      </dd>
                    </div>
                  ))}
                </dl>
              </Tile>
            </Reveal>
          </div>
          {/* The four are cartoons standing in for real jobs; the team is people. Said here as on /careers, from the same names. */}
          <Reveal as="p" className="why-note small">
            {MASCOTS} are our mascots. The people behind the camera are real.
          </Reveal>
        </div>
      </div>
    </section>
  );
}
