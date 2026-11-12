import type { ReactNode } from 'react';
import { DeckCard } from '../../components/frames';
import { HeroCopy, Reveal, ResultsNote, Seo, Tile, TileBody, type TileTone } from '../../components/ui';
import { FOUNDER_QUOTE, TESTIMONIALS } from '../../lib/content';
import { useVideos } from '../../lib/queries';

// A wall, not a row of cards: three sizes on one tight grid, the number first and the words after it. No characters here: a mascot beside a client's words undercuts them (R42).

/** Where each testimonial hangs, in reading order, with the size it gets. */
const WALL: { slot: string; size: 'xl' | 'l' | 'm'; tone?: TileTone }[] = [
  { slot: 'tm-a', size: 'xl', tone: 'sochu' },
  { slot: 'tm-b', size: 'l' },
  { slot: 'tm-c', size: 'm' },
  { slot: 'tm-d', size: 'l' },
  { slot: 'tm-e', size: 'm' },
  { slot: 'tm-f', size: 'l' },
];

function Cell({ slot, i, children }: { slot: string; i: number; children: ReactNode }) {
  return (
    <Reveal i={i} className={`tm-cell ${slot}`}>
      {children}
    </Reveal>
  );
}

export default function Testimonials() {
  // The "Watch the videos" tile is a deck of real posters from the library (M8): the most viewed first.
  const { data } = useVideos();
  const posters = [...(data ?? [])].filter((v) => v.posterUrl).sort((a, b) => b.views - a.views).slice(0, 3);
  return (
    <>
      <Seo title="Testimonials" description="What founders and marketing teams say about working with Kreators.Army on vox pop street interviews: the format, the shoot and the videos, in their own words." />
      <section className="tm-page">
        <div className="ground" aria-hidden />
        <div className="wrap tm-wall">
          <div className="tm-head">
            <HeroCopy
              eyebrow="Testimonials"
              titleClass="display-md"
              title={
                <>
                  Feedback from <span className="g-word">happy</span> clients
                </>
              }
              lead="What founders and marketing teams said once their vox pop videos went live."
            />
          </div>

          {TESTIMONIALS.map((t, n) => {
            const place = WALL[n] ?? { slot: 'tm-f', size: 'm' as const };
            return (
              <Cell key={t.quote} slot={place.slot} i={n}>
                <Tile tone={place.tone} className="h-full">
                  <TileBody>
                    <figure className="tm-figure" data-size={place.size}>
                      <p className="tm-metric">
                        {t.metric} <span className="tm-unit">{t.unit}</span>
                      </p>
                      <blockquote className="tm-quote">“{t.quote}”</blockquote>
                      <figcaption className="tm-who">{t.who}</figcaption>
                    </figure>
                  </TileBody>
                </Tile>
              </Cell>
            );
          })}

          <Cell slot="tm-q" i={6}>
            <Tile tone="ink" className="h-full">
              <TileBody className="justify-between">
                <figure className="tm-figure" data-size="quote">
                  <blockquote className="tm-quote-lg">“{FOUNDER_QUOTE.quote}”</blockquote>
                  <figcaption className="tm-who">{FOUNDER_QUOTE.who}</figcaption>
                </figure>
              </TileBody>
            </Tile>
          </Cell>

          <Cell slot="tm-v" i={7}>
            <DeckCard videos={posters} frame="polaroid" to="/video-library" label="Watch the videos in the library" className="tm-deck h-full">
              <span className="h4 tm-deck-title">Watch the videos</span>
            </DeckCard>
          </Cell>
        </div>
        <div className="wrap">
          <ResultsNote className="tm-note" />
        </div>
      </section>
    </>
  );
}
