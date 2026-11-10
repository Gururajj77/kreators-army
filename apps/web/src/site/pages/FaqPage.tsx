import { ArrowRight } from 'lucide-react';
import { useEffect, useRef, type SyntheticEvent } from 'react';
import { Link, useLocation } from 'react-router';
import { Character, type CharacterHandle } from '../../cast';
import { Reveal, Seo } from '../../components/ui';
import { FAQS, SITE } from '../../lib/content';
import { anchor, useActiveSection } from './Reading';

const GROUPS = [...new Set(FAQS.map((f) => f.group))].map((label) => ({ label, id: anchor(label), items: FAQS.filter((f) => f.group === label) }));
const GROUP_IDS = GROUPS.map((g) => g.id);

export default function FaqPage() {
  const sochu = useRef<CharacterHandle>(null);
  const userToggled = useRef(false);
  const active = useActiveSection(GROUP_IDS);
  const { hash } = useLocation();
  // With a question in the URL the first answer stays shut, or closing it would move the page out from under the scroll below.
  const deepLinked = FAQS.some((f) => `#${f.slug}` === hash);

  // A link straight to a question opens it. This page is a lazy chunk, so on a cold load the shell's hash scroll has already run and found nothing.
  useEffect(() => {
    const el = hash ? document.getElementById(hash.slice(1)) : null;
    if (!el) return;
    if (el instanceof HTMLDetailsElement) el.open = true;
    el.scrollIntoView({ behavior: 'instant' });
  }, [hash]);

  const onToggle = (e: SyntheticEvent<HTMLDetailsElement>) => {
    const details = e.currentTarget;
    if (!details.open || !userToggled.current) return;
    userToggled.current = false;
    const answer = details.querySelector('.qa-a');
    if (answer) sochu.current?.lookAt(answer, 1600);
    sochu.current?.play('nod');
  };

  return (
    <div className="faq">
      <Seo title="FAQ" description="Answers about vox pop content, production, revisions and where you can use your videos." />
      <div className="ground" aria-hidden />
      <div className="wrap faq-in">
        <div className="faq-page-col">
          <div className="faq-sticky">
            <span className="eyebrow">FAQ</span>
            <h1 className="display-md">
              Your questions, our <span className="g-word">answers</span>
            </h1>
            <p className="lead">We answer the most common questions to help you understand our services clearly.</p>
            <div className="faq-rail">
              <nav className="faq-index" aria-label="Question groups">
                {GROUPS.map((g) => (
                  <Link key={g.id} to={`#${g.id}`} className="faq-index-link" aria-current={active === g.id ? 'true' : undefined}>
                    <span>{g.label}</span>
                    <span className="faq-index-n">{g.items.length}</span>
                  </Link>
                ))}
              </nav>
              <Character ref={sochu} who="sochu" size="clamp(96px, 8.4vw, 120px)" expression="thinking" />
            </div>
          </div>
        </div>

        <div className="faq-main">
          {GROUPS.map((g, groupIndex) => (
            <Reveal key={g.id} as="section" id={g.id} className="qa-group" i={groupIndex}>
              <h2 className="h4 qa-group-title">{g.label}</h2>
              <div className="qa-plate">
                {g.items.map((f, i) => (
                  <details key={f.slug} id={f.slug} name="faq" className="qa" open={!deepLinked && groupIndex === 0 && i === 0} onToggle={onToggle}>
                    <summary
                      onClick={() => {
                        userToggled.current = true;
                      }}
                    >
                      <span>{f.q}</span>
                      <span className="qa-icon" aria-hidden />
                    </summary>
                    <div className="qa-a">
                      <div className="qa-a-in">
                        <p>{f.a}</p>
                        <Link to={`/faq/${f.slug}`} className="qa-more">
                          Related questions
                          <ArrowRight className="size-4" aria-hidden />
                        </Link>
                      </div>
                    </div>
                  </details>
                ))}
              </div>
            </Reveal>
          ))}

          <p className="faq-more small">
            Still have a question? Email{' '}
            <a href={`mailto:${SITE.email}`}>
              {SITE.email}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
