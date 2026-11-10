import type { ReactNode } from 'react';
import { useEffect, useRef } from 'react';
import { Character, type CharacterHandle } from '../../cast';
import { CastBubble } from '../../components/chat';
import { HeroCopy, SectionHead, Seo, Tile, TileBody } from '../../components/ui';
import { FORMATS, LOCK_LIST } from '../../lib/content';
import { FormatActions, FormatIdeas, FormatTitle, VideoDeck, useFormat, useLineOnView } from './FormatPage';

// A run of show: three beats down one spine. The spine fills as you scroll, from CSS alone, and just sits lit when animations are paused. Each beat's
// video is a deck of posters (M8); Tiko hosts with the tally light on.

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

  // Camera up, tally light on, once, when the host arrives; then its line.
  const tiko = useRef<CharacterHandle>(null);
  const sheet = useRef<HTMLDivElement>(null);
  const cast = useLineOnView('events.hero', tiko, sheet, 1100);
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
            <FormatActions content={content} />
          </HeroCopy>
          <div ref={sheet} className="ev-callsheet" data-bubble-bounds="">
            <Character ref={tiko} who="tiko" size="clamp(112px, 30vw, 150px)" prop className="ev-tiko">
              <CastBubble {...cast.bubble('events.hero')} side="start" />
            </Character>
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
                  <h4 className="h4">What we lock before each shoot</h4>
                  <ul className="ev-lock">
                    {LOCK_LIST.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </TileBody>
              </Tile>
            </Beat>

            <Beat
              id="on-the-floor"
              name="On the floor"
              lead="We interview people on the floor."
              notes={
                <>
                  <p className="eyebrow ev-notes-title">{content.cardsTitle}</p>
                  <Note name={launches.name} body={launches.body} />
                  <Note name={meetups.name} body={meetups.body} />
                </>
              }
            >
              <VideoDeck video={ansh} others={picks} pending={pending} onOpen={player.open} />
            </Beat>

            <Beat
              id="the-recap"
              name="The recap"
              lead="We edit the best reactions for your feeds."
              notes={<Note name={shows.name} body={shows.body} />}
            >
              <VideoDeck video={rode} others={picks} pending={pending} onOpen={player.open} />
            </Beat>
          </ol>
        </div>
      </section>

      <FormatIdeas content={content} />

      {player.dialog}
    </>
  );
}
