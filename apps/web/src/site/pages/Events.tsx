import type { ReactNode } from 'react';
import { useEffect, useRef } from 'react';
import { Character, type CharacterHandle } from '../../cast';
import { HeroCopy, SectionHead, Seo, Tile, TileBody } from '../../components/ui';
import { FORMATS, STEPS } from '../../lib/content';
import { FormatActions, FormatTitle, Reel, useFormat } from './FormatPage';

// A run of show: three beats down one spine. The spine fills as you scroll, from CSS alone, and just sits lit when animations are paused.

const content = FORMATS.events;

const CUES = [
  { id: 'before-the-doors', name: 'Before the doors', job: 'Plan the questions' },
  { id: 'on-the-floor', name: 'On the floor', job: 'Interview people' },
  { id: 'the-recap', name: 'The recap', job: 'Edit the best reactions' },
];

function Beat({ id, name, lead, notes, children }: { id: string; name: string; lead: ReactNode; notes?: ReactNode; children: ReactNode }) {
  return (
    <li id={id} className="ev-beat">
      <span className="ev-dot" aria-hidden />
      <div className="ev-copy">
        <h3 className="h2">{name}</h3>
        <div className="lead ev-lead">{lead}</div>
        {notes && <div className="ev-notes">{notes}</div>}
      </div>
      <div className="ev-media">{children}</div>
    </li>
  );
}

function Note({ name, body }: { name: string; body: string }) {
  return (
    <div className="ev-note">
      <h4 className="label">{name}</h4>
      <p>{body}</p>
    </div>
  );
}

export default function Events() {
  const { picks, player, pending } = useFormat(content);
  const ansh = picks.find((v) => v.id === 'seed-ansh-mehra') ?? picks[0];
  const rode = picks.find((v) => v.id === 'seed-rode') ?? picks.find((v) => v !== ansh);
  const [launches, meetups, shows] = content.cards as [(typeof content.cards)[number], (typeof content.cards)[number], (typeof content.cards)[number]];
  const [strategy, questions, shoots, editing, delivery] = STEPS as [(typeof STEPS)[number], (typeof STEPS)[number], (typeof STEPS)[number], (typeof STEPS)[number], (typeof STEPS)[number]];

  // Camera up, tally light on, once, when the host arrives.
  const tiko = useRef<CharacterHandle>(null);
  useEffect(() => {
    tiko.current?.play('signature');
  }, []);

  return (
    <>
      <Seo title={content.eyebrow} description={content.metaDescription} />

      <section className="page-hero ev-hero" data-align="left">
        <div className="ground" aria-hidden />
        <div className="wrap ev-hero-in">
          <HeroCopy eyebrow={content.eyebrow} title={<FormatTitle content={content} />} lead={content.lead} titleClass="display-xl">
            <FormatActions />
          </HeroCopy>
          <div className="ev-callsheet">
            <Character ref={tiko} who="tiko" size="clamp(112px, 30vw, 150px)" prop className="ev-tiko" />
            <nav className="plate ev-cues" aria-label="Run of show">
              {CUES.map((cue) => (
                <a key={cue.id} href={`#${cue.id}`} className="ev-cue">
                  <span className="ev-cue-dot" aria-hidden />
                  <span className="label">{cue.name}</span>
                  <span className="small ev-cue-job">{cue.job}</span>
                </a>
              ))}
            </nav>
          </div>
        </div>
      </section>

      <section className="ev-run-section">
        <div className="wrap">
          <SectionHead center={false} eyebrow="Run of show" title={content.whyTitle.join('')} lead={content.whyBody} />
          <ol className="ev-run">
            <Beat id="before-the-doors" name="Before the doors" lead="We plan the questions before the doors open.">
              <Tile tone="tiko" className="ev-sheet">
                <TileBody>
                  <ul>
                    {[strategy, questions].map((step) => (
                      <li key={step.name}>
                        <h4 className="h4">{step.name}</h4>
                        <p>{step.body}</p>
                      </li>
                    ))}
                  </ul>
                </TileBody>
              </Tile>
            </Beat>

            <Beat
              id="on-the-floor"
              name="On the floor"
              lead={shoots.body}
              notes={
                <>
                  <p className="eyebrow ev-notes-title">{content.cardsTitle}</p>
                  <Note name={launches.name} body={launches.body} />
                  <Note name={meetups.name} body={meetups.body} />
                </>
              }
            >
              <Reel video={ansh} pending={pending} onOpen={player.open} />
            </Beat>

            <Beat
              id="the-recap"
              name="The recap"
              lead={
                <>
                  {editing.body} {delivery.body}
                </>
              }
              notes={<Note name={shows.name} body={shows.body} />}
            >
              <Reel video={rode} pending={pending} onOpen={player.open} />
            </Beat>
          </ol>
        </div>
      </section>

      {player.dialog}
    </>
  );
}
