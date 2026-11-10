import { FaqChat } from '../../components/chat';
import { SectionHead } from '../../components/ui';
import { HOME_FAQ_SLUGS } from '../../lib/content';

// #faq (V2-SPEC 5.2 row 8, content §3.1.8): six questions as a chat. The visitor asks on the right, Kreators.Army answers on the left with its mark,
// never a mascot. Sochu peeks at the panel's corner, thinking, with no bubble (FaqChat draws it). "All questions →" closes every answer.

export function Faq() {
  return (
    <section id="faq" className="section band-alt faq-section">
      <div className="wrap">
        <SectionHead center={false} eyebrow="FAQ" title="Your questions, our answers" className="faq-head" />
        <FaqChat slugs={HOME_FAQ_SLUGS} className="home-faqchat" />
      </div>
    </section>
  );
}
