import { TESTIMONIALS } from '../lib/content';

/** Metric first, then the words, then who said them. A plain plate: a client's quote stands on its own, with no tint or character beside it. */
export function TestimonialCard({ t, className }: { t: (typeof TESTIMONIALS)[number]; className?: string }) {
  return (
    <figure className={`t-card ${className ?? ''}`}>
      <p className="t-metric">
        {t.metric} <span>{t.unit}</span>
      </p>
      <blockquote>“{t.quote}”</blockquote>
      <figcaption>{t.who}</figcaption>
    </figure>
  );
}
