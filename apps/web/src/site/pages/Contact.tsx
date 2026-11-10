import { Check, Copy } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { ContactForm } from '../../components/ContactForm';
import { HeroCopy, Seo } from '../../components/ui';
import { SITE, SOCIALS, STEPS } from '../../lib/content';

/** The address, and a one-tap copy that answers in place. */
function EmailLine() {
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle');
  const timer = useRef(0);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = () => {
    window.clearTimeout(timer.current);
    navigator.clipboard.writeText(SITE.email).then(
      () => setState('copied'),
      () => setState('failed'),
    );
    timer.current = window.setTimeout(() => setState('idle'), 1600);
  };

  return (
    <p className="contact-email">
      <span className="text-muted">Or email us at</span>{' '}
      <a href={`mailto:${SITE.email}`} className="contact-email-link">
        {SITE.email}
      </a>
      <button type="button" className="contact-copy-btn" data-state={state} onClick={copy} aria-label={state === 'copied' ? 'Email address copied' : state === 'failed' ? 'Could not copy the email address' : 'Copy email address'}>
        <Copy className="contact-copy-a size-4" aria-hidden />
        <Check className="contact-copy-b size-4" aria-hidden />
      </button>
    </p>
  );
}

export default function Contact() {
  return (
    <section className="contact">
      {/* /contact-us is an alias that must keep working; search engines index the one address. */}
      <Seo title="Contact" description="Plan your vox pop street interview content with Kreators.Army." canonical="/contact" />
      <div className="ground" aria-hidden />
      <div className="wrap contact-in">
        <div className="contact-head">
          <HeroCopy
            eyebrow="Contact us"
            titleClass="display-md"
            title={
              <>
                Get in touch <span className="g-word">today</span>
              </>
            }
            lead="We are here to answer your questions and provide support for every video project."
          />
          <EmailLine />
        </div>

        <div className="contact-form">
          <ContactForm />
        </div>

        <div className="contact-next">
          <h2 className="h4">What happens next</h2>
          <ol className="contact-steps">
            {STEPS.map((s, i) => (
              <li key={s.name}>
                <span className="contact-step-n" aria-hidden>
                  {i + 1}
                </span>
                <div>
                  <h3 className="label m-0">{s.name}</h3>
                  <p className="m-0 small text-muted">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
          <ul className="contact-socials" aria-label="Follow us">
            {SOCIALS.map((s) => (
              <li key={s.label}>
                <a href={s.url} target="_blank" rel="noreferrer" className="link-draw">
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
