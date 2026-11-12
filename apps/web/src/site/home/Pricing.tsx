import { formatInr } from '@kreators/shared';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router';
import { PackageCards, PackageIncludes } from '../../components/Packages';
import { Reveal, SectionHead } from '../../components/ui';
import { ADD_ON, FOUNDER_QUOTE, OBJECTION_SLUGS } from '../../lib/content';
import { TextArrow } from '../../components/TextArrow';

// #pricing (V2-SPEC 5.2 row 7, content §3.1.7): a summary of /pricing. The three packages with their static batch strips, the add-on and GST line in
// view of every price, what every package includes, the founder's words, and the four doubts people have at a price, each linking to its answer.
// No characters here: a price needs credibility, not company.

/** content §3.1.7's labels for the four objection links, in OBJECTION_SLUGS order. */
const OBJECTION_LABELS: Record<string, string> = {
  'is-the-trial-free': 'Is the trial free?',
  'can-an-agency-split-a-package': 'Can an agency split a package?',
  'how-does-payment-work': 'How does payment work?',
  'where-can-i-use-the-videos': 'Where can I use the videos?',
};

export function Pricing() {
  return (
    <section id="pricing" className="section price-section">
      <div className="wrap">
        <SectionHead eyebrow="Pricing" title="Pay per batch, not per month" lead="Every package is for one brand and paid in full before production. The bigger the batch, the lower the rate per video." />
        <PackageCards compact className="price-cards" />

        <Reveal className="price-row">
          <p>
            More than {ADD_ON.after}? Add blocks of {ADD_ON.blockOf} videos at {formatInr(ADD_ON.fee)} a block.
          </p>
          <p className="price-gst">Prices in INR. GST extra where it applies.</p>
          <Link to="/pricing" className="price-link">
            See full pricing<TextArrow />
          </Link>
        </Reveal>

        <div className="price-more">
          <Reveal className="price-includes">
            <h3 className="eyebrow">Every package includes</h3>
            <PackageIncludes phoneLimit={5} />
          </Reveal>
          <div className="price-side">
            <Reveal className="price-quote">
              <figure>
                <blockquote>“{FOUNDER_QUOTE.quote}”</blockquote>
                <figcaption>{FOUNDER_QUOTE.who}</figcaption>
              </figure>
            </Reveal>
            <Reveal as="ul" className="price-answers" i={1}>
              {OBJECTION_SLUGS.map((slug) => (
                <li key={slug}>
                  <Link to={`/faq/${slug}`} className="price-answer">
                    <span>{OBJECTION_LABELS[slug] ?? slug}</span>
                    <ArrowRight className="size-4" aria-hidden />
                  </Link>
                </li>
              ))}
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
