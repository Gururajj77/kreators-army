import { useSyncExternalStore } from 'react';
import { TestimonialCard } from '../../components/TestimonialCard';
import { Cta, Reveal, ResultsNote, SectionHead } from '../../components/ui';
import { TESTIMONIALS } from '../../lib/content';

// Below 735 the row scrolls sideways (home.css), and holds nothing focusable, so it takes a Tab stop itself there to be scrollable by keyboard. Above, it is a
// static grid and a stop would do nothing.
const ROW_QUERY = '(max-width: 734px)';

function subscribeRow(onChange: () => void) {
  const mq = matchMedia(ROW_QUERY);
  mq.addEventListener('change', onChange);
  return () => mq.removeEventListener('change', onChange);
}

const useScrollingRow = () =>
  useSyncExternalStore(
    subscribeRow,
    () => matchMedia(ROW_QUERY).matches,
    () => false,
  );

/** Static on desktop and a hand-scrolled row on phones. Never a marquee: every quote is reachable, once, by everyone. No characters beside a client's words (R42). The results note sits under the row. */
export function Testimonials() {
  const scrolls = useScrollingRow();
  return (
    <section className="section band-alt t-section">
      <div className="wrap">
        <SectionHead
          center={false}
          eyebrow="Testimonials"
          title="What clients told us"
          lead="What founders and marketing teams said after their vox pop videos went live."
          action={
            <Cta to="/testimonials" kind="ghost" arrow>
              Read them all
            </Cta>
          }
        />
      </div>
      <div className="t-grid" role="region" aria-label="Client feedback" tabIndex={scrolls ? 0 : undefined}>
        {TESTIMONIALS.map((t, i) => (
          <Reveal key={t.quote} i={i % 3} className="t-grid-item">
            <TestimonialCard t={t} />
          </Reveal>
        ))}
      </div>
      <div className="wrap">
        <ResultsNote short="phone" className="t-note" />
      </div>
    </section>
  );
}
