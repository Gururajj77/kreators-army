import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useRef } from 'react';
import { Link, useParams } from 'react-router';
import { MechanismChip, toneAt } from '../../components/demos';
import { Seo, Tile } from '../../components/ui';
import { MECHANISMS, POSTS, type Mechanism, type PostSection } from '../../lib/content';
import { tieLast } from '../../lib/typo';
import { NotFound } from '../../screens/NotFound';
import { GradientTail, PostCover, ReadingProgress, readingTime } from './Reading';

// A quiet reading layout: no cast, no bubbles (content §9.1). Post 5 draws its list of mechanisms as the eleven static chips; a hover plays a chip's
// tiny demo once, and nothing else here moves on its own.

const isMechanism = (s: string): s is Mechanism => (MECHANISMS as readonly string[]).includes(s);

function Section({ section }: { section: PostSection }) {
  const { heading, body, list, figure } = section;
  return (
    <section>
      {heading && <h2>{heading}</h2>}
      {body.map((p) => (
        <p key={p}>{tieLast(p)}</p>
      ))}
      {list &&
        (figure === 'mechanisms' ? (
          <ul className="read-mechs" aria-label={heading}>
            {list.filter(isMechanism).map((m, i) => (
              <MechanismChip key={m} as="li" name={m} tone={toneAt(i)} />
            ))}
          </ul>
        ) : (
          <ul className="read-list">
            {list.map((item) => (
              <li key={item}>{tieLast(item)}</li>
            ))}
          </ul>
        ))}
    </section>
  );
}

export default function BlogPost() {
  const { slug } = useParams();
  const article = useRef<HTMLElement>(null);
  const index = POSTS.findIndex((p) => p.slug === slug);
  const post = POSTS[index];
  if (!post) return <NotFound />;

  const nextIndex = (index + 1) % POSTS.length;
  const next = POSTS[nextIndex];

  return (
    <>
      <Seo title={post.title} description={post.summary} />
      <ReadingProgress target={article} />
      <article ref={article} className="read">
        <Link to="/blog" className="read-back">
          <ArrowLeft className="size-4" aria-hidden />
          Blog
        </Link>
        <h1 className="h2">
          <GradientTail text={post.title} />
        </h1>
        <p className="read-lead">{post.summary}</p>
        <p className="read-meta small">{readingTime(post)}</p>
        <div className="read-prose read-prose-post">
          {post.sections.map((s, i) => (
            <Section key={s.heading ?? i} section={s} />
          ))}
          {post.next && (
            <p className="read-onward">
              <Link to={post.next.to} className="read-onward-link">
                {post.next.label}
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </p>
          )}
        </div>
      </article>

      {next && next !== post && (
        <nav className="read-next" aria-label="Next post">
          <Tile to={`/blog/${next.slug}`} className="next-tile">
            <PostCover index={nextIndex} className="next-cover" />
            <div className="next-body">
              <span className="eyebrow">Next post</span>
              <h2 className="h4">{next.title}</h2>
              <p className="m-0 small text-muted">{next.summary}</p>
            </div>
            <ArrowRight className="next-arrow size-5" aria-hidden />
          </Tile>
        </nav>
      )}
    </>
  );
}
