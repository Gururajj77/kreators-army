import { ArrowRight } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { Link, useSearchParams } from 'react-router';
import { ContactForm, initialMode } from '../../components/ContactForm';
import type { Mode } from '../../components/brief/state';
import { CopyButton, HeroCopy, Seo } from '../../components/ui';
import { SITE, SOCIALS, whatsappHref, whatsappPhone } from '../../lib/content';

// content §3.5 and §5; layout visual §2.5, V2-SPEC 5.6. The page is the form. Left column on desktop (above the form on phones): the header and the
// direct contacts, one tap each. Beside or under the form: what happens next (trial mode) or the one line (question mode), and the socials.
// /contact-us is an alias that must keep working; search engines index the one address.

/** content §3.5, "What happens next", trial mode. */
const NEXT_STEPS = [
  'We read your brief.',
  "We confirm the trial's scope, number of videos and any fee in writing.",
  'We make the trial on your brand.',
  'You review it and decide whether to continue.',
];

/** Four brand marks in one weight, on a 24 px grid (lucide has no brand icons). The same drawings as the footer's. */
const SOCIAL_ICON: Record<string, ReactNode> = {
  Instagram: (
    <>
      <path
        fillRule="evenodd"
        d="M7.6 2h8.8A5.6 5.6 0 0 1 22 7.6v8.8a5.6 5.6 0 0 1-5.6 5.6H7.6A5.6 5.6 0 0 1 2 16.4V7.6A5.6 5.6 0 0 1 7.6 2Zm0 2A3.6 3.6 0 0 0 4 7.6v8.8A3.6 3.6 0 0 0 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6A3.6 3.6 0 0 0 16.4 4H7.6Z"
      />
      <path fillRule="evenodd" d="M12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" />
      <circle cx="17.4" cy="6.6" r="1.25" />
    </>
  ),
  LinkedIn: (
    <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12Zm1.78 13.02H3.56V9h3.56v11.45Z" />
  ),
  X: (
    <path d="M17.75 2.5h3.07l-6.71 7.67L22 21.5h-6.18l-4.84-6.33-5.54 6.33H2.37l7.18-8.21L2 2.5h6.34l4.38 5.79 5.03-5.79Zm-1.08 17.2h1.7L7.4 4.2H5.57l11.1 15.5Z" />
  ),
  TikTok: (
    <path d="M12.74 2h3.1c.17 1.6.74 2.74 1.74 3.57.82.68 1.86 1.12 3.2 1.24v3.13a8.5 8.5 0 0 1-4.78-1.47l-.03 6.84a6.4 6.4 0 0 1-1.92 4.73A6.5 6.5 0 0 1 9.32 22a6.38 6.38 0 0 1-4.64-1.97A6.47 6.47 0 0 1 2.9 15.2c.13-1.66.86-3.2 2.1-4.33A6.34 6.34 0 0 1 9.4 9.2c.5 0 .98.05 1.44.16l-.02 3.17a3.4 3.4 0 0 0-1.42-.3 3.3 3.3 0 0 0-3.32 3.1c-.06.96.26 1.84.9 2.5.62.65 1.46 1 2.36 1 .9.01 1.74-.34 2.37-.97.62-.62.97-1.46.97-2.36L12.74 2Z" />
  ),
};

const TONES = ['tiko', 'sochu', 'bolu', 'gola'];

/** Email (with the copy toast), WhatsApp, call numbers and the city: content §3.5's compact list. A phone the founder removes disappears (D3). */
function Reach() {
  const wa = whatsappHref();
  const waPhone = whatsappPhone();
  return (
    <div className="reach">
      <dl className="reach-list">
        <div className="reach-row">
          <dt>Email</dt>
          <dd className="reach-email">
            <a href={`mailto:${SITE.email}`} className="reach-link">
              {SITE.email}
            </a>
            <CopyButton text={SITE.email} />
          </dd>
        </div>
        {wa && waPhone && (
          <div className="reach-row">
            <dt>WhatsApp</dt>
            <dd>
              <a href={wa} target="_blank" rel="noreferrer" className="reach-link">
                {waPhone.display}
              </a>
            </dd>
          </div>
        )}
        {SITE.phones.length > 0 && (
          <div className="reach-row">
            <dt>Call</dt>
            <dd className="reach-calls">
              {SITE.phones.map((p, i) => (
                <span key={p.tel}>
                  {i > 0 && (
                    <span className="reach-sep" aria-hidden>
                      {' · '}
                    </span>
                  )}
                  <a href={`tel:${p.tel}`} className="reach-link">
                    {p.display}
                  </a>
                </span>
              ))}
            </dd>
          </div>
        )}
      </dl>
      <p className="reach-city">{SITE.city}</p>
    </div>
  );
}

function Socials() {
  return (
    <ul className="contact-socials" aria-label="Follow us">
      {SOCIALS.map((s, i) => (
        <li key={s.label}>
          <a className="contact-social" href={s.url} target="_blank" rel="noreferrer" aria-label={s.label} data-tone={TONES[i % TONES.length]}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden focusable="false">
              {SOCIAL_ICON[s.label]}
            </svg>
          </a>
        </li>
      ))}
    </ul>
  );
}

export default function Contact() {
  const [params] = useSearchParams();
  const [mode, setMode] = useState<Mode>(() => initialMode(params));
  return (
    <section className="contact">
      <Seo
        title="Request a trial video"
        description="Send Kreators.Army your trial brief or a question. Email, WhatsApp and the guided brief form."
        canonical="/contact"
      />
      <div className="ground" aria-hidden />
      <div className="wrap contact-in">
        <div className="contact-head">
          <HeroCopy
            eyebrow="Request a trial video"
            titleClass="display-md"
            title={
              <>
                Tell us about your <span className="g-word">brand</span>
              </>
            }
            lead="Send the trial brief, or as much of it as you have now. We'll confirm the trial's scope, number of videos and any fee in writing."
          />
          <Reach />
        </div>

        <div className="contact-form">
          <ContactForm onMode={setMode} />
        </div>

        <div className="contact-next">
          {mode === 'trial' ? (
            <>
              <h2 className="h4">What happens next</h2>
              <ol className="contact-steps">
                {NEXT_STEPS.map((s, i) => (
                  <li key={s}>
                    <span className="contact-step-n" aria-hidden>
                      {i + 1}
                    </span>
                    <p className="m-0">{s}</p>
                  </li>
                ))}
              </ol>
              <Link to="/trial#after" className="contact-after">
                Every step after the trial
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </>
          ) : (
            <p className="contact-q-line">Ask us anything about the format, the trial or the packages.</p>
          )}
          <Socials />
        </div>
      </div>
    </section>
  );
}
