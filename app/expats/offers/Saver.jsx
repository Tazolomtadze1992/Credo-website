'use client';

import { useEffect, useId, useRef, useState } from 'react';
import x from '../sections/sections.module.css';
import { PROMO_END, packages } from '../expats-data.mjs';
import o from './offers.module.css';
import { BankCard, Loans, external, gel, reducedMotion } from './shared';

/* Cheapest way to cover `months`: whole years at the yearly price plus the
   remaining months at the monthly price (a year can also cover a remainder). */
function cost(months, { month, year }) {
  let best = { total: months * month, years: 0 };
  for (let years = 1; years <= Math.ceil(months / 12); years++) {
    const total = years * year + Math.max(0, months - years * 12) * month;
    if (total < best.total) best = { total, years };
  }
  return best;
}

/* Counts to the new value instead of jumping, so the saving visibly grows. */
function useTween(value, duration = 520) {
  const [shown, setShown] = useState(value);
  const from = useRef(value);
  useEffect(() => {
    if (reducedMotion()) { setShown(value); from.current = value; return; }
    const start = performance.now(), a = from.current;
    let raf;
    const step = now => {
      const t = Math.min(1, (now - start) / duration), eased = 1 - (1 - t) ** 3;
      const v = a + (value - a) * eased;
      from.current = v; setShown(v);
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);
  return shown;
}

const stay = m => m < 12 ? `${m} month${m > 1 ? 's' : ''}` : m % 12 ? `${Math.floor(m / 12)} yr ${m % 12} mo` : `${m / 12} year${m > 12 ? 's' : ''}`;

/* E — sells with the customer's own number: how long they stay, which
   package, and what the half price saves them over that time. */
export default function Saver() {
  const [plan, setPlan] = useState('expat');
  const [months, setMonths] = useState(12);
  const rangeId = useId();
  const pk = packages.find(p => p.id === plan);
  const promo = cost(months, pk.price), regular = cost(months, pk.was);
  const saved = useTween(regular.total - promo.total);
  return <div>
    <div className={o.head}>
      <div>
        <p className={o.kicker}>Join before {PROMO_END}</p>
        <h2 id="offers-heading">Half price — see what it means for you</h2>
        <p>Pick a package and tell us how long you’re staying. We’ll show the cheapest way to pay and what you keep.</p>
      </div>
    </div>

    <div className={o.saver}>
      <div className={o.saverInputs}>
        <div>
          <p className={o.saverLabel}>Package</p>
          <div className={o.planChoice} role="radiogroup" aria-label="Package">
            {packages.map(p => <button key={p.id} type="button" role="radio" aria-checked={p.id === plan} onClick={() => setPlan(p.id)}>
              <BankCard kind={p.id} />
              <span>{p.name}<small>{gel(p.price.month)}/mo · was {gel(p.was.month)}</small></span>
            </button>)}
          </div>
        </div>
        <div>
          <label className={o.saverLabel} htmlFor={rangeId}>How long are you staying in Georgia?<b>{stay(months)}</b></label>
          <input id={rangeId} className={`${x.range} ${o.saverRange}`} type="range" min={1} max={36} step={1} value={months}
            onChange={e => setMonths(Number(e.target.value))} style={{ '--p': `${(months - 1) / 35 * 100}%` }} aria-valuetext={stay(months)} />
          <div className={o.saverScale} aria-hidden="true"><span>1 month</span><span>1 year</span><span>2 years</span><span>3 years</span></div>
        </div>
        <p className={o.saverNote}>Illustrative: assumes the promo price applies for your whole stay and that the regular price is double. Check the promotion terms before you join.</p>
      </div>

      <div className={o.saverResult} data-plan={plan} aria-live="polite">
        <p>Over {stay(months)} you save</p>
        <p className={o.saveBig}>{gel(Math.round(saved * 10) / 10)}</p>
        <ul className={o.bars}>
          <li><span>Regular price</span><b>{gel(regular.total)}</b><i style={{ '--w': '100%', '--c': 'rgb(255 255 255 / .45)' }} /></li>
          <li><span>You pay with the offer</span><b>{gel(promo.total)}</b><i style={{ '--w': `${promo.total / regular.total * 100}%`, '--c': '#ff8f7f' }} /></li>
        </ul>
        <p className={o.billingHint}>{promo.years
          ? `Cheapest: pay yearly — ${gel(pk.price.year)} covers 12 months`
          : `Cheapest: pay monthly — ${gel(pk.price.month)} a month`}</p>
        <a className={`action ${o.onDark}`} href={pk.href} {...external}>{pk.cta}</a>
      </div>
    </div>

    <Loans />
  </div>;
}
