import { Check } from 'lucide-react';
import { PLANS } from '../lib/content';
import { PrimaryCta, Reveal } from './ui';

// The price list. No characters here: a price needs credibility, not company.
export function Plans() {
  return (
    <div className="plans">
      {PLANS.map((plan, i) => {
        const hot = plan.badge !== null;
        return (
          <Reveal key={plan.name} i={i} className="plan">
            <div className="plan-in" data-hot={hot ? '' : undefined}>
              <div className="plan-head">
                <h3 className="h3">{plan.name}</h3>
                {plan.badge && <span className="plan-badge">{plan.badge}</span>}
              </div>
              <p className="plan-body">{plan.body}</p>
              <p className="plan-price">
                {plan.price}
                <span>/month</span>
              </p>
              <ul className="plan-list">
                {plan.items.map((item) => (
                  <li key={item}>
                    <Check className="plan-tick" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="plan-foot">
                <PrimaryCta plan={plan.slug} className="w-full" />
              </div>
            </div>
          </Reveal>
        );
      })}
    </div>
  );
}
