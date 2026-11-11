import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router';
import { Character, type CharacterHandle } from '../../cast';
import { CastBubble, useCastLine } from '../../components/chat';
import { FaqItem } from '../../components/FaqItem';
import { useSectionAt } from '../../components/brief/onView';
import { ChipRail, IndexRail } from '../../components/tabs';
import { Cta, HeroCopy, Reveal, Seo } from '../../components/ui';
import { FAQ_GROUPS, FAQS, SITE, callPhone, contactHref, whatsappHref, whatsappPhone } from '../../lib/content';

// content §3.14 and §7.1; layout V2-SPEC 5.9 and visual §2.9. Two calm columns on desktop: the left one stays with you and holds the group index and
// Sochu, thinking. Phones get the groups as a sticky row of chips under the nav. Single-open accordions. The first time a person opens an answer, Sochu
// looks at it, nods and says "Good question." (once per page view).

const GROUPS = FAQ_GROUPS.map((g) => ({ ...g, items: FAQS.filter((f) => f.group === g.label) }));
const GROUP_IDS = GROUPS.map((g) => g.id);

function Count({ n }: { n: number }) {
  return <span className="faq-index-n">{n}</span>;
}

export default function FaqPage() {
  const sochu = useRef<CharacterHandle>(null);
  const userOpened = useRef(false);
  const reacted = useRef(false);
  const cast = useCastLine();
  const spy = useSectionAt(GROUP_IDS);
  const { hash } = useLocation();
  // With a question in the URL the first answer stays shut, or closing it would move the page out from under the scroll below.
  const deepLinked = FAQS.some((f) => `#${f.slug}` === hash);
  const wa = whatsappHref();
  const phone = whatsappPhone();
  const call = callPhone();

  // A link straight to a question opens it. This page is a lazy chunk, so on a cold load the shell's hash scroll has already run and found nothing.
  useEffect(() => {
    const el = hash ? document.getElementById(hash.slice(1)) : null;
    if (!el) return;
    if (el instanceof HTMLDetailsElement) el.open = true;
    el.scrollIntoView({ behavior: 'instant' });
  }, [hash]);

  // Only a person's own click counts: a <details> that starts open fires toggle on mount.
  const onOpen = (answer: HTMLElement) => {
    if (!userOpened.current) return;
    userOpened.current = false;
    const s = sochu.current;
    if (!s) return;
    s.lookAt(answer, 1600);
    if (reacted.current) return;
    reacted.current = true;
    s.play('nod');
    void cast.say('faq.open', { by: s, expression: 'happy' });
  };

  return (
    <div className="faq">
      <Seo title="FAQ" description="Straight answers about the format, the trial, packages, production, rights and results." />
      <div className="ground" aria-hidden />
      <div className="wrap faq-in">
        <div className="faqp-side">
          <div className="faq-sticky">
            <HeroCopy
              eyebrow="FAQ"
              titleClass="display-md"
              title={
                <>
                  Your questions, our <span className="g-word">answers</span>
                </>
              }
              lead="Straight answers about the format, the trial, packages, production, rights and results."
            />
            <div className="faq-rail" data-bubble-bounds="">
              <IndexRail
                className="faq-index"
                active={spy}
                items={GROUPS.map((g) => ({
                  id: g.id,
                  label: (
                    <>
                      <span>{g.label}</span>
                      <Count n={g.items.length} />
                    </>
                  ),
                }))}
              />
              <span className="faqp-sochu">
                <Character ref={sochu} who="sochu" size="var(--faq-k)" expression="thinking">
                  <CastBubble {...cast.bubble('faq.open')} side="end" />
                </Character>
              </span>
            </div>
          </div>
        </div>

        <div className="faq-chips">
          <ChipRail
            mode="links"
            label="Question groups"
            currentKind="location"
            current={`#${spy}`}
            links={GROUPS.map((g) => ({ to: `#${g.id}`, label: g.label, count: g.items.length }))}
          />
        </div>

        <div
          className="faq-main"
          onClickCapture={(e) => {
            if ((e.target as Element).closest('summary')) userOpened.current = true;
          }}
        >
          {GROUPS.map((g, groupIndex) => (
            <Reveal key={g.id} as="section" id={g.id} className="qa-group" i={groupIndex}>
              <h2 className="h4 qa-group-title">{g.label}</h2>
              <div className="qa-plate">
                {g.items.map((f, i) => (
                  <FaqItem key={f.slug} id={f.slug} faq={f} name="faq" open={!deepLinked && groupIndex === 0 && i === 0} onOpen={onOpen} />
                ))}
              </div>
            </Reveal>
          ))}

          <div className="faq-foot">
            <p className="faq-more">
              Still have a question? Email <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
              {wa && phone ? (
                <>
                  {' '}
                  or{' '}
                  <a href={wa} target="_blank" rel="noreferrer">
                    WhatsApp
                  </a>{' '}
                  / call <a href={`tel:${phone.tel}`}>{phone.display}</a>.
                </>
              ) : call ? (
                <>
                  {' '}
                  or call <a href={`tel:${call.tel}`}>{call.display}</a>.
                </>
              ) : (
                '.'
              )}
            </p>
            <Cta to={contactHref({ topic: 'question' })} kind="ghost" arrow>
              Ask a question
            </Cta>
          </div>
        </div>
      </div>
    </div>
  );
}
