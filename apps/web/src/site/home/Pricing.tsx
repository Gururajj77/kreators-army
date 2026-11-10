import { Plans } from '../../components/Plans';
import { Reveal, SectionHead } from '../../components/ui';
import { FAQS, FOUNDER_QUOTE } from '../../lib/content';

/** The doubts people have at the moment they look at a price, answered in the FAQ's own words. */
const OBJECTIONS = [
  { slug: 'will-this-work-for-my-brand', q: 'Will it work for my brand?', a: 'Vox pop works best for brands with physical products, because real people can interact with the product and share honest reactions on camera.' },
  { slug: 'how-long-does-production-take', q: 'How long does it take?', a: 'Our team usually plans, shoots and edits within a few days, delivering ready-to-post short videos.' },
  { slug: 'do-you-handle-the-shoot', q: 'Do you handle the shoot?', a: 'Yes. Our team handles the entire process, including interview planning, street shooting and editing.' },
  { slug: 'do-i-post-on-your-channel', q: 'Do I post on your channel?', a: 'No. The videos are delivered directly to you, so they become long-term content assets for your own brand channels.' },
] as const;

const known = new Set(FAQS.map((f) => f.slug));

export function Pricing() {
  return (
    <section id="pricing" className="band-alt">
      <div className="wrap section">
        <SectionHead eyebrow="Pricing" title="Simple plans for everyone" lead="Flexible retainer plans designed to help startups and D2C brands succeed with vox pop." />
        <div className="price-plans">
          <Plans />
        </div>

        <div className="price-more">
          <Reveal className="price-quote">
            <figure>
              <blockquote>“{FOUNDER_QUOTE.quote}”</blockquote>
              <figcaption>{FOUNDER_QUOTE.who}</figcaption>
            </figure>
          </Reveal>
          <dl className="price-answers">
            {OBJECTIONS.filter((o) => known.has(o.slug)).map((o, i) => (
              <Reveal key={o.slug} i={i}>
                <dt>{o.q}</dt>
                <dd>{o.a}</dd>
              </Reveal>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
