import type { Video } from '@kreators/shared';
import { Character } from '../../cast';
import { HeroCopy, Reveal, Seo } from '../../components/ui';
import { FORMATS } from '../../lib/content';
import { FormatActions, FormatTitle, Reel, useFormat } from './FormatPage';

// A real shelf: three bays, with reels of different heights standing on one plank, and a label hanging off the edge of each bay.

const content = FORMATS.retail;

/** Which videos stand in which bay. Whatever is not live is filled from the rest of the format's list, so a bay is never bare. */
const BAYS = [['seed-circlestore-3'], ['seed-circlestore-1', 'seed-circlestore-2'], ['seed-waxys']];

function stockBays(picks: Video[]): Video[][] {
  const placed = new Set<string>();
  const bays = BAYS.map((ids) =>
    ids.flatMap((id) => {
      const video = picks.find((p) => p.id === id);
      if (video) placed.add(video.id);
      return video ?? [];
    }),
  );
  const spare = picks.filter((p) => !placed.has(p.id));
  return bays.map((videos, i) => (videos.length > 0 ? videos : spare.splice(0, (BAYS[i] as string[]).length)));
}

export default function Retail() {
  const { picks, player, pending } = useFormat(content);
  const bays = stockBays(picks);

  return (
    <>
      <Seo title={content.eyebrow} description={content.metaDescription} />

      <section className="page-hero rt-hero" data-align="center">
        <div className="ground" aria-hidden />
        <div className="wrap">
          <HeroCopy eyebrow={content.eyebrow} title={<FormatTitle content={content} />} lead={content.lead} titleClass="display">
            <FormatActions />
          </HeroCopy>
        </div>
      </section>

      <section className="rt-shelf-section">
        <div className="wrap">
          <div className="rt-shelf">
            <h2 className="rt-shelf-title h4">{content.cardsTitle}</h2>
            <div className="rt-bays">
              {content.cards.map((card, i) => {
                const slots = BAYS[i] ?? [];
                const stock = bays[i] ?? [];
                return (
                  <div key={card.name} className="rt-bay" data-bay={i + 1}>
                    <div className="rt-stock">
                      {Array.from({ length: pending ? slots.length : Math.max(1, stock.length) }, (_, n) => (
                        <div key={n} className="rt-item" data-item={n + 1}>
                          <Reel video={stock[n]} pending={pending} onOpen={player.open} eager />
                        </div>
                      ))}
                      {i === 2 && (
                        <div className="rt-gola">
                          <Character who="gola" size="var(--rt-gola)" prop="parcel" expression="wink" />
                        </div>
                      )}
                    </div>
                    <div className="rt-plank" aria-hidden />
                    <div className="rt-tag">
                      <h3 className="label">{card.name}</h3>
                      <p>{card.body}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap rt-why">
          <Reveal variant="rise">
            <h2 className="h2">{content.whyTitle.join('')}</h2>
          </Reveal>
          <Reveal>
            <p className="lead">{content.whyBody}</p>
          </Reveal>
        </div>
      </section>

      {player.dialog}
    </>
  );
}
