import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Link, useParams } from 'react-router';
import { Seo } from '../../components/ui';
import { FAQS } from '../../lib/content';
import { tieLast } from '../../lib/typo';
import { NotFound } from '../../screens/NotFound';

// A quiet reading layout: no cast (content §9.1). Every v1 slug resolves (content §7.1 keeps them all).

/** The answer as a meta description: whole sentences up to 160 characters, or the first sentence cut at a word with an ellipsis. */
function metaOf(answer: string, max = 160): string {
  if (answer.length <= max) return answer;
  const sentences = answer.match(/[^.!?]+[.!?]+(\s+|$)/g) ?? [answer];
  let out = '';
  for (const s of sentences) {
    if ((out + s).trim().length > max) break;
    out += s;
  }
  if (out.trim().length >= 70) return out.trim();
  const cut = answer.slice(0, max - 1);
  return cut.slice(0, cut.lastIndexOf(' ')).replace(/[,;:\s]+$/, '') + '\u2026';
}

export default function FaqAnswer() {
  const { slug } = useParams();
  const faq = FAQS.find((f) => f.slug === slug);
  if (!faq) return <NotFound />;

  const related = [...FAQS.filter((f) => f.group === faq.group && f.slug !== faq.slug), ...FAQS.filter((f) => f.group !== faq.group)].slice(0, 3);

  return (
    <article className="read">
      <Seo title={faq.q} description={metaOf(faq.a)} />
      <Link to="/faq" className="read-back">
        <ArrowLeft className="size-4" aria-hidden />
        All questions
      </Link>
      <p className="read-eyebrow small">{faq.group}</p>
      <h1 className="h2-sm">{faq.q}</h1>
      <p className="read-answer">{tieLast(faq.a)}</p>

      <nav className="read-related" aria-labelledby="read-related-h">
        {/* The page's one gradient word. content.md marks none on answer pages, and the question itself is never the place for one ("Is the trial free?"). */}
        <h2 id="read-related-h" className="label">
          Related <span className="g-word">questions</span>
        </h2>
        <ul>
          {related.map((f) => (
            <li key={f.slug}>
              <Link to={`/faq/${f.slug}`}>
                <span>{f.q}</span>
                <ArrowRight className="size-4 flex-none" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </article>
  );
}
