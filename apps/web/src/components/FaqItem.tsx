import { useRef, type SyntheticEvent } from 'react';
import { Link } from 'react-router';
import { Character, type CharacterHandle } from '../cast';
import { FAQS, type Faq } from '../lib/content';
import { Reveal } from './ui';

/** One question and its answer. `name` groups items so only one stays open, using the browser's own exclusive-accordion behaviour. */
export function FaqItem({ faq, open, name, onOpen }: { faq: Faq; open?: boolean; name?: string; onOpen?: (answer: HTMLElement) => void }) {
  const answer = useRef<HTMLParagraphElement>(null);
  const onToggle = (e: SyntheticEvent<HTMLDetailsElement>) => {
    if (e.currentTarget.open && answer.current) onOpen?.(answer.current);
  };
  return (
    <details className="faq-item" open={open} name={name} onToggle={onOpen ? onToggle : undefined}>
      <summary>
        <span>{faq.q}</span>
        <span className="faq-icon" aria-hidden />
      </summary>
      <div className="faq-a">
        <p ref={answer}>{faq.a}</p>
      </div>
    </details>
  );
}

export function FaqSection() {
  const sochu = useRef<CharacterHandle>(null);
  // A <details> that starts open fires toggle on mount. Only a person's own click should make Sochu react.
  const touched = useRef(false);

  const onOpen = (answer: HTMLElement) => {
    if (!touched.current) return;
    sochu.current?.lookAt(answer);
    sochu.current?.play('nod', { source: 'tap' });
  };

  return (
    <section id="faq" className="section">
      <div className="wrap faq-grid">
        <div className="faq-side">
          <Reveal className="faq-panel plate">
            <div className="faq-panel-copy">
              <span className="eyebrow">FAQ</span>
              <h2 className="h2-sm">Your questions, our answers</h2>
              <p className="faq-panel-lead">We answer the most common questions to help you understand our services clearly.</p>
              <div>
                <Link to="/faq" className="btn btn-ghost">
                  All questions
                </Link>
              </div>
            </div>
            <div className="faq-sochu" aria-hidden>
              <Character ref={sochu} who="sochu" size="var(--faq-sochu)" expression="thinking" peek />
            </div>
          </Reveal>
        </div>
        <div className="faq-list" onClickCapture={() => (touched.current = true)} onKeyDownCapture={() => (touched.current = true)}>
          {FAQS.map((faq, i) => (
            <FaqItem key={faq.slug} faq={faq} open={i === 0} name="home-faq" onOpen={onOpen} />
          ))}
        </div>
      </div>
    </section>
  );
}
