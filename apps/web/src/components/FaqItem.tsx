import { useRef, type SyntheticEvent } from 'react';
import type { Faq } from '../lib/content';

/**
 * One question and its answer (M5e): a plus that turns 45° into a cross on --spring-bouncy, the open row's tint fading in, the answer's first line
 * rising 6 px. `name` groups items so only one stays open, using the browser's own exclusive accordion. `onOpen` gets the answer element (Sochu looks at
 * it on the FAQ page). Styles: `.faqi` in components.css.
 */
export function FaqItem({ faq, open, name, onOpen, id }: { faq: Faq; open?: boolean; name?: string; onOpen?: (answer: HTMLElement) => void; id?: string }) {
  const answer = useRef<HTMLParagraphElement>(null);
  const onToggle = (e: SyntheticEvent<HTMLDetailsElement>) => {
    if (e.currentTarget.open && answer.current) onOpen?.(answer.current);
  };
  return (
    <details className="faqi" id={id} open={open} name={name} onToggle={onOpen ? onToggle : undefined}>
      <summary>
        <span>{faq.q}</span>
        <span className="faqi-icon" aria-hidden />
      </summary>
      <div className="faqi-a">
        <div className="faqi-a-in">
          <p ref={answer}>{faq.a}</p>
        </div>
      </div>
    </details>
  );
}
