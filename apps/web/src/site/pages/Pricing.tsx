import { averagePerVideo, formatInr, quoteFee, type Quote } from '@kreators/shared';
import { Minus, Plus } from 'lucide-react';
import { useId, useState, type ChangeEvent, type CSSProperties } from 'react';
import { AddOnRow, BatchStrip, PackageCards, PackageIncludes, PricingRules } from '../../components/Packages';
import { ChipRail } from '../../components/tabs';
import { PageHero, PrimaryCta, Reveal, RollNumber, SectionHead, Seo } from '../../components/ui';
import { ADD_ON, LATE_PAYMENT, PACKAGES, PAYMENT_STEPS, PRICING_FAQ_SLUGS, faqBySlug, quote } from '../../lib/content';

// content §3.4 and §4; layout visual §2.4. Calm: no characters, no bubbles, no street (a price needs credibility, not company). The calculator follows
// content §4's rule exactly through shared quoteBatch: a price only for 5, 10 or 20 videos or 20 plus whole blocks of 5; every other number is quoted in
// writing, never estimated. Rupees in Indian digit grouping (formatInr). The result card's result is the page's only live region.

const SLIDER_MIN = 5;
const SLIDER_MAX = 60;
/** The field takes any whole number up to the brief's own limit (shared BRIEF_LIMITS.videos), so the form it hands over to always accepts it. */
const FIELD_MAX = 1000;
const BRANDS_MAX = 10;
const PICKS = ['5', '10', '20', '25', '30'] as const;
const FIRST = PACKAGES[0];

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

function Stepper({
  id,
  label,
  value,
  field,
  min,
  max,
  less,
  more,
  onStep,
  onField,
  onBlur,
  describedBy,
}: {
  id: string;
  label: string;
  value: number;
  field: string;
  min: number;
  max: number;
  less: string;
  more: string;
  onStep: (n: number) => void;
  onField: (e: ChangeEvent<HTMLInputElement>) => void;
  onBlur: () => void;
  describedBy?: string;
}) {
  return (
    <div className="calc-input">
      <label htmlFor={id} className="calc-label">
        {label}
      </label>
      <div className="calc-stepper">
        <button type="button" className="calc-step" aria-label={less} aria-controls={id} disabled={value <= min} onClick={() => onStep(value - 1)}>
          <Minus className="size-5" aria-hidden />
        </button>
        <input
          id={id}
          className="calc-field"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete="off"
          maxLength={String(max).length}
          value={field}
          onChange={onField}
          onBlur={onBlur}
          aria-describedby={describedBy}
        />
        <button type="button" className="calc-step" aria-label={more} aria-controls={id} disabled={value >= max} onClick={() => onStep(value + 1)}>
          <Plus className="size-5" aria-hidden />
        </button>
      </div>
    </div>
  );
}

/** "20 video package + 1 block of 5" for a quote made of blocks. */
const blocksLine = (blocks: number) => `${ADD_ON.after} video package + ${blocks} ${blocks === 1 ? 'block' : 'blocks'} of ${ADD_ON.blockOf}`;

function perVideoLine(q: Quote) {
  const avg = averagePerVideo(q);
  if (!avg) return null;
  return `${avg.approx ? 'about ' : ''}${formatInr(avg.amount)} per video`;
}

function Calculator() {
  const ids = useId();
  const [videos, setVideos] = useState(10);
  const [videosField, setVideosField] = useState('10');
  const [brands, setBrands] = useState(1);
  const [brandsField, setBrandsField] = useState('1');

  const q = quote(videos);
  const fee = quoteFee(q);
  const total = fee === null ? null : fee * brands;

  const setN = (n: number) => {
    const c = clamp(Math.round(n), 1, FIELD_MAX);
    setVideos(c);
    setVideosField(String(c));
  };
  const setB = (n: number) => {
    const c = clamp(Math.round(n), 1, BRANDS_MAX);
    setBrands(c);
    setBrandsField(String(c));
  };

  // The field owns its text while you type; the number behind it changes only for a whole number, so clearing it to type 25 never flashes another answer.
  const onVideosField = (e: ChangeEvent<HTMLInputElement>) => {
    const text = e.currentTarget.value.replace(/\D/g, '');
    setVideosField(text);
    if (text) setVideos(clamp(Number(text), 0, FIELD_MAX));
  };
  const onBrandsField = (e: ChangeEvent<HTMLInputElement>) => {
    const text = e.currentTarget.value.replace(/\D/g, '');
    setBrandsField(text);
    if (text && Number(text) >= 1) setBrands(clamp(Number(text), 1, BRANDS_MAX));
  };

  const snap = (n: number) => {
    const f = quoteFee(quote(n));
    return (
      <button key={n} type="button" className="calc-snap" onClick={() => setN(n)}>
        {n} videos · {f === null ? '' : formatInr(f)}
      </button>
    );
  };

  const pick = PICKS.find((p) => Number(p) === videos) ?? null;
  const helper = `${ids}-brands-help`;

  return (
    <div className="calc plate">
      <div className="calc-inputs">
        <Stepper
          id={`${ids}-videos`}
          label="How many videos?"
          value={videos}
          field={videosField}
          min={1}
          max={FIELD_MAX}
          less="Fewer videos"
          more="More videos"
          onStep={setN}
          onField={onVideosField}
          onBlur={() => setVideosField(String(videos))}
        />
        <div className="calc-range-row">
          <input
            className="calc-range"
            type="range"
            min={SLIDER_MIN}
            max={SLIDER_MAX}
            step={1}
            value={clamp(videos, SLIDER_MIN, SLIDER_MAX)}
            onChange={(e) => setN(Number(e.currentTarget.value))}
            aria-label="How many videos?"
            aria-valuetext={`${videos} videos`}
            style={{ '--fill': (clamp(videos, SLIDER_MIN, SLIDER_MAX) - SLIDER_MIN) / (SLIDER_MAX - SLIDER_MIN) } as CSSProperties}
          />
          <span className="calc-range-ends" aria-hidden>
            <span>{SLIDER_MIN}</span>
            <span>{SLIDER_MAX}</span>
          </span>
        </div>
        <ChipRail
          mode="radio"
          label="Quick picks"
          options={PICKS.map((p) => ({ value: p, label: p }))}
          value={pick}
          onChange={(v) => setN(Number(v))}
          className="calc-picks"
        />
        <div className="calc-brands">
          <Stepper
            id={`${ids}-brands`}
            label="How many brands?"
            value={brands}
            field={brandsField}
            min={1}
            max={BRANDS_MAX}
            less="Fewer brands"
            more="More brands"
            onStep={setB}
            onField={onBrandsField}
            onBlur={() => setBrandsField(String(brands))}
            describedBy={helper}
          />
          <p id={helper} className="calc-help">
            Each brand needs its own package. Same number of videos for each.
          </p>
        </div>
      </div>

      <div className="calc-out">
        <div className="calc-result" data-kind={q.kind}>
          <div className="calc-live" aria-live="polite">
            {total !== null ? (
              <p className="calc-big">
                <RollNumber value={total} prefix="₹" countUp={false} pop />
              </p>
            ) : (
              <p className="calc-big calc-big-words">{q.kind === 'written' ? 'Quoted in writing' : `From ${FIRST.videos} videos`}</p>
            )}
            {fee !== null && brands > 1 && (
              <p className="calc-line calc-each">
                for {brands} brands ({formatInr(fee)} each)
              </p>
            )}
            {q.kind === 'package' && (
              <p className="calc-line">
                {PACKAGES.find((p) => p.videos === q.videos)?.name} · {perVideoLine(q)}
              </p>
            )}
            {q.kind === 'blocks' && (
              <>
                <p className="calc-line">
                  {blocksLine(q.blocks)} · {perVideoLine(q)}
                </p>
                <p className="calc-small">
                  Each extra block of {ADD_ON.blockOf} is {formatInr(ADD_ON.fee)} ({formatInr(ADD_ON.perVideo)} a video).
                </p>
              </>
            )}
            {q.kind === 'written' && <p className="calc-line">{q.videos} videos falls between our packages, so we quote it in writing before work begins.</p>}
            {q.kind === 'below' && <p className="calc-line">Packages start at {FIRST.videos} videos.</p>}
          </div>
          {q.kind === 'written' && <div className="calc-snaps">{[q.lower, q.upper].map(snap)}</div>}
          {q.kind === 'below' && <div className="calc-snaps">{snap(FIRST.videos)}</div>}
          <p className="calc-terms">+ GST where applicable · Paid in full before production · Usage rights on full payment</p>
          <PrimaryCta intent={{ videos, brands }} className="calc-cta" />
        </div>
        <BatchStrip quote={q} animate className="calc-strip" />
      </div>
    </div>
  );
}

function Payment() {
  return (
    <section id="payment" className="section pr-pay">
      <div className="wrap">
        <SectionHead eyebrow="How payment works" title="Fully prepaid" />
        <Reveal as="ol" className="pr-track">
          {PAYMENT_STEPS.map((s, i) => (
            <li key={s} className="pr-track-step" style={{ '--i': i } as CSSProperties}>
              <span className="pr-track-n" aria-hidden>
                {i + 1}
              </span>
              <p className="pr-track-text">{s}</p>
            </li>
          ))}
        </Reveal>
        <div className="pr-pay-foot">
          <Reveal>
            <div className="plate pr-late" data-tone="ink">
              <h3 className="pr-late-title">{LATE_PAYMENT.title}</h3>
              <ul className="pr-late-list">
                {LATE_PAYMENT.lines.map((l) => (
                  <li key={l}>{l}</li>
                ))}
              </ul>
            </div>
          </Reveal>
          <div className="pr-pay-lines">
            <p>Refund and delivery guarantee terms are set out in the pilot agreement.</p>
            <p>Delivery timelines are confirmed in the pilot agreement once pre-production alignment is complete.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Pricing() {
  return (
    <div className="pr">
      <Seo
        title="Pricing"
        description="Vox pop video packages from Kreators.Army: 5 videos for ₹50,000, 10 for ₹85,000, 20 for ₹1,50,000. One brand per package, fully prepaid, GST extra."
      />
      <PageHero
        eyebrow="Pricing"
        title={
          <>
            Priced per <span className="g-word">package</span>, not per month
          </>
        }
        lead="Choose 5, 10 or 20 videos for one brand. The bigger the batch, the lower the rate per video. The trial comes first, so you see the format on your brand before you commit."
      />

      <section className="section band-alt pr-calc">
        <div className="wrap">
          <SectionHead title="Work out a batch" />
          <Reveal className="pr-calc-in">
            <Calculator />
          </Reveal>
        </div>
      </section>

      <section className="section pr-packages">
        <div className="wrap">
          <SectionHead title="Three packages" />
          <Reveal className="pr-packages-in">
            <PackageCards />
            <AddOnRow />
            <p className="pr-fine">All amounts in Indian rupees (INR), excluding GST where applicable.</p>
          </Reveal>
        </div>
      </section>

      <section className="section band-alt pr-includes">
        <div className="wrap">
          <SectionHead title="Every package includes" />
          <Reveal className="pr-includes-in">
            <PackageIncludes />
          </Reveal>
        </div>
      </section>

      <section className="section pr-rules">
        <div className="wrap">
          <SectionHead title="The rules" />
          <Reveal className="pr-rules-in">
            <PricingRules />
          </Reveal>
        </div>
      </section>

      <Payment />

      <section className="section band-alt pr-questions">
        <div className="wrap">
          <SectionHead title="Pricing questions" />
          <Reveal className="pr-questions-in">
            <ChipRail
              mode="links"
              label="Pricing questions"
              current={null}
              wrap
              links={PRICING_FAQ_SLUGS.flatMap((slug) => {
                const f = faqBySlug(slug);
                return f ? [{ to: `/faq/${slug}`, label: f.q }] : [];
              })}
            />
          </Reveal>
        </div>
      </section>
    </div>
  );
}
