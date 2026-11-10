import type { ReactNode } from 'react';
import { HeroCopy, Reveal, Seo, Tile, TileBody, TileMedia, type TileTone } from '../../components/ui';
import { FOUNDER_QUOTE, TESTIMONIALS } from '../../lib/content';

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
  return (
    <>
      <Seo title="Testimonials" description="What clients say about working with Kreators.Army on vox pop street interviews." />
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
            <Tile to="/video-library" tone="media" className="h-full" label="Watch the videos in the library">
              <TileMedia scrim>
                <img src="/media/circlestore-2.jpg" alt="" loading="lazy" style={{ objectPosition: '50% 18%' }} />
              </TileMedia>
              <TileBody className="justify-end">
                <p className="h4 text-white">Watch the videos</p>
              </TileBody>
            </Tile>
          </Cell>
        </div>
      </section>
    </>
  );
}
