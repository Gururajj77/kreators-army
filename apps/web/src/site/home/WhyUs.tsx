import { ArrowRight } from 'lucide-react';
import { useRef, type PointerEvent, type FocusEvent } from 'react';
import { Link } from 'react-router';
import { Character, type CastId, type CharacterHandle } from '../../cast';
import { Reveal, RollNumber, Tile } from '../../components/ui';
import { CAST, TEAM, castById } from '../../lib/content';

/** A tile that is a real button, so a tap performs instead of navigating. Hovering or focusing it plays the same signature move, within the hover cool-down. */
function ArmyTile({ id, i, className }: { id: CastId; i: number; className: string }) {
  const actor = useRef<CharacterHandle>(null);
  const member = castById(id);

  const onEnter = (e: PointerEvent) => {
    if (e.pointerType === 'mouse') actor.current?.play('signature', { source: 'hover' });
  };
  const onFocus = (e: FocusEvent<HTMLElement>) => {
    if (e.target.matches(':focus-visible')) actor.current?.play('signature', { source: 'hover' });
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
      >
        <Tile tone={id} onClick={() => actor.current?.play('signature', { source: 'tap' })} label={`${member.name}, ${member.role}. Plays their move.`} className="army-tile h-full">
          <span className="army-words">
            <span className="h4">{member.name}</span>
            <span className="army-role">{member.role}</span>
          </span>
          <span className="army-stand">
            <Character ref={actor} who={id} size="var(--army-size)" />
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
    <section id="about" className="section">
      <div className="wrap">
        <Reveal variant="rise">
          <span className="eyebrow">Why us</span>
          <h2 className="why-lede two-tone">
            <b>We create scroll-stopping videos.</b> Authentic reactions and natural conversations, made into native feed content people trust. Short-form ready, built for high engagement.
          </h2>
        </Reveal>

        <div id="features" className="why-bento">
          <Reveal className="why-slot-copy">
            <Tile className="h-full">
              <div className="why-copy">
                <span className="eyebrow">Meet the Army</span>
                <h3 className="why-copy-title">Not another editing agency</h3>
                <p className="why-copy-body">Most influencer and UGC videos today feel scripted. So, we do the opposite. We take the conversation to the street and capture real reactions around your product category.</p>
                <p className="why-copy-foot">An award-winning team. Since 2014 &amp; beyond.</p>
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
        {/* The four are cartoons standing in for real jobs; the award-winning team is people. Said here as on /careers, from the same names. */}
        <Reveal as="p" className="why-note small">
          {MASCOTS} are our mascots. The people behind the camera are real.
        </Reveal>
      </div>
    </section>
  );
}
