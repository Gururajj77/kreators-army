import { SITE } from '../../lib/content';
import { GradientTail, LegalPage, type LegalSection } from './Reading';

// content §7.2, word for word. The doc's own proprietor name appears here and nowhere else on the site (content §6.4).

/** The day these terms shipped. Change it whenever the words below change. */
const UPDATED = '10 November 2026';

const mail = (address: string) => <a href={`mailto:${address}`}>{address}</a>;

const SECTIONS: LegalSection[] = [
  {
    heading: '1. Who we are',
    body: <p>Kreators.Army is managed and owned by BrandingBum, a proprietorship of Shubham Aggarwal, based in Bengaluru, Karnataka, India.</p>,
  },
  {
    heading: '2. Using this site',
    body: (
      <p>
        You may browse the site and watch the videos for your own information. Please don't copy, republish or misuse the videos, text or brand names without
        permission.
      </p>
    ),
  },
  {
    heading: '3. The trial',
    body: (
      <p>
        A trial is a short evaluation of our work on your brand. Its scope, the number of trial videos and any trial fee are confirmed in writing. A trial
        doesn't oblige either side to continue to a paid engagement.
      </p>
    ),
  },
  {
    heading: '4. Trial content',
    body: (
      <p>
        Trial content is for evaluation and approval only. It may not be published, distributed, boosted, advertised, repurposed, sublicensed or otherwise used
        commercially unless a paid engagement is confirmed in writing. If the engagement doesn't go ahead, unpublished trial content must stay unused and
        published trial content must be removed on request. The trial alone doesn't transfer ownership or usage rights; commercial rights are set by the final
        engagement agreement. Either side may end discussions over a conflict of interest or competitive overlap, and we may ask for trial content to be removed
        from active use if we find one.
      </p>
    ),
  },
  {
    heading: '5. Prices',
    body: (
      <p>
        Prices on this site are in Indian rupees and exclude applicable taxes, including GST. Each package covers one brand and can't be combined, pooled or
        split across brands, including by agencies. Quantities between packages are quoted in writing. Prices on the site may change; the price that applies is
        the one in your signed agreement.
      </p>
    ),
  },
  {
    heading: '6. Payment',
    body: (
      <p>
        All payments are prepaid. The full package fee is due in advance, before pre-production or production begins, and production begins on receipt of
        payment. If payment is late or partial, work may be paused, delivery of edited videos or raw footage may be withheld, and usage rights stay suspended.
        Refund and delivery guarantee terms are in the pilot engagement agreement.
      </p>
    ),
  },
  {
    heading: '7. Usage rights',
    body: <p>Usage rights for final videos transfer on full payment, on the terms of the pilot engagement agreement.</p>,
  },
  {
    heading: '8. Revisions',
    body: (
      <p>
        Minor, edit-level revisions are included in the agreed process. Requests needing a fundamentally different concept, format, production setup, new
        footage or a reshoot are discussed separately before any work starts.
      </p>
    ),
  },
  {
    heading: '9. Results',
    body: (
      <p>
        Views and engagement shown on this site come from past work. We optimise for attention, retention, engagement and your objective, but we cannot
        guarantee specific views, virality, reach, engagement, conversions, CAC, ROAS or sales outcomes.
      </p>
    ),
  },
  {
    heading: '10. Confidentiality',
    body: <p>Our agreements keep non-public information exchanged between us confidential, for five years after the engagement ends.</p>,
  },
  {
    heading: '11. Governing law',
    body: (
      <p>
        Our agreements are governed by the laws of India, with exclusive jurisdiction in the courts of Bengaluru, Karnataka. These website terms follow the same
        law and courts.
      </p>
    ),
  },
  {
    heading: '12. Contact',
    body: (
      <p>
        Questions about these terms or an agreement: {mail(SITE.legalEmail)}. Everything else: {mail(SITE.email)}.
      </p>
    ),
  },
];

const TITLE = 'Terms of Service';

export default function Terms() {
  return (
    <LegalPage
      title={TITLE}
      heading={<GradientTail text={TITLE} />}
      description="The terms for using the Kreators.Army website, and a summary of how our engagements work."
      updated={UPDATED}
      intro={
        <>
          These terms cover your use of this website. The sections on trials, pricing and payment summarise how we work so you know what to expect. They are not
          a contract: any trial or paid engagement is governed by the agreement we both sign, and where this page and a signed agreement differ, the signed
          agreement wins.
        </>
      }
      sections={SECTIONS}
    />
  );
}
