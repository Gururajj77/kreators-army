import { ArrowUpRight, Mail } from 'lucide-react';
import { useRef, type FocusEvent, type PointerEvent as ReactPointerEvent } from 'react';
import { Character, type CharacterHandle } from '../../cast';
import { HeroCopy, Reveal, RollNumber, SectionHead, Seo } from '../../components/ui';
import { CAST, SITE, TEAM, type CastId } from '../../lib/content';

// A crew roster. The cast are mascots, one for each job on a shoot, and the page says so beside the roster, next to the real headcount.

/** What each role does, in the words the site already uses for those stages of a shoot. */
const ROLE_BODY: Record<CastId, string> = {
  bolu: 'Take the mic to the street and get real people answering on camera.',
  tiko: 'Go out with the anchors and capture real reactions, picture and sound.',
  gola: 'Turn the best reactions into short videos for Reels, Shorts and TikTok.',
  sochu: 'Design simple but powerful questions that trigger honest responses.',
};

const mailto = (subject: string) => `mailto:${SITE.email}?subject=${encodeURIComponent(subject)}`;

const crew = TEAM[0] as (typeof TEAM)[number];

function RoleCard({ id, name, role, i }: { id: CastId; name: string; role: string; i: number }) {
  const mascot = useRef<CharacterHandle>(null);

  const onEnter = (e: ReactPointerEvent) => {
    if (e.pointerType === 'mouse') mascot.current?.play('signature', { source: 'hover' });
  };
  // Keyboard focus only: a mouse click on the link has already had the hover.
  const onFocus = (e: FocusEvent<HTMLElement>) => {
    if (e.target.matches(':focus-visible')) mascot.current?.play('signature', { source: 'hover' });
  };
  // A tap anywhere on the card that is not the link.
  const onTap = (e: ReactPointerEvent) => {
    if (!(e.target as Element).closest('a')) mascot.current?.play('signature', { source: 'tap' });
  };

  return (
    <Reveal as="li" i={i} className="cr-cell">
      <article className="plate cr-card" onPointerEnter={onEnter} onFocus={onFocus} onPointerUp={onTap}>
        <div className="cr-stage">
          <Character ref={mascot} who={id} size="clamp(120px, 11vw, 144px)" />
        </div>
        <div className="cr-card-body">
          <p className="caption cr-mascot">Mascot: {name}</p>
          <h3 className="h3">{role}</h3>
          <p className="cr-role">{ROLE_BODY[id]}</p>
          <a className="cr-apply" href={mailto(`${role} at Kreators.Army`)} aria-label={`Send us your work for ${role}`}>
            <span className="link-draw">Send your work</span>
            <ArrowUpRight className="size-4" aria-hidden />
          </a>
        </div>
      </article>
    </Reveal>
  );
}

export default function Careers() {
  return (
    <>
      <Seo title="Careers" description="Work on real street interviews with Kreators.Army." />

      <section className="page-hero cr-hero" data-align="left">
        <div className="ground" aria-hidden />
        <div className="wrap cr-hero-in">
          <HeroCopy
            eyebrow="Careers"
            title={
              <>
                Talk to <span className="g-word">strangers</span> for a living
              </>
            }
            lead="We are a team of creative professionals who take the conversation to the street and turn real reactions into content people actually watch."
          />
          <Character who="bolu" size="clamp(112px, 30vw, 150px)" prop expression="talking" className="cr-hero-bolu" />
        </div>
      </section>

      <section className="cr-roster-section">
        <div className="wrap">
          <div className="cr-head">
            <SectionHead center={false} title="Who makes the videos" />
            <Reveal className="cr-crew">
              <RollNumber value={crew.end} suffix={crew.suffix} className="cr-crew-num" />
              <p>
                <b>{crew.label}.</b> {CAST.map((c) => c.name).join(', ').replace(/, ([^,]*)$/, ' and $1')} are our mascots. The people behind the camera are real.
              </p>
            </Reveal>
          </div>
          <ul className="cr-roster">
            {CAST.map((c, i) => (
              <RoleCard key={c.id} id={c.id} name={c.name} role={c.role} i={i} />
            ))}
          </ul>
        </div>
      </section>

      <section className="cr-close-section">
        <div className="wrap">
          <Reveal>
            <div className="plate cr-close">
              <div>
                <h2 className="h2">Show us something you made</h2>
                <p className="lead">If this is your craft, write to us and send your work.</p>
              </div>
              <div className="cr-close-action">
                <a href={mailto('Working with Kreators.Army')} className="btn btn-ink btn-lg">
                  <Mail className="size-4" aria-hidden /> Send us your work
                </a>
                <a className="small link-draw cr-email" href={`mailto:${SITE.email}`}>
                  {SITE.email}
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
