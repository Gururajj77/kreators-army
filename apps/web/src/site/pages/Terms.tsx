import { SITE } from '../../lib/content';
import { LegalPage, type LegalSection } from './Reading';

const UPDATED = '10 November 2026';

const SECTIONS: LegalSection[] = [
  {
    heading: 'Using this site',
    body: <p>You may browse the site and watch the videos for your own information. Please do not copy, republish or misuse the videos, text or brand names without permission.</p>,
  },
  {
    heading: 'Prices and availability',
    body: <p>Plans and prices shown can change, and slots depend on availability. An agreement is only made when both sides confirm it directly.</p>,
  },
  {
    heading: 'Results',
    body: <p>Views and engagement shown come from past work. They are not a promise of what any new video will achieve.</p>,
  },
  {
    heading: 'Contact',
    body: (
      <p>
        Questions about these terms can be sent to <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.
      </p>
    ),
  },
];

export default function Terms() {
  return (
    <LegalPage
      title="Terms of Service"
      description="The terms for using the Kreators.Army website."
      updated={UPDATED}
      intro={<>These terms cover your use of this website, which is managed and owned by {SITE.owner.name}. Work for clients is covered by the agreement made for that work.</>}
      sections={SECTIONS}
    />
  );
}
