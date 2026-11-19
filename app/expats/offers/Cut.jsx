'use client';

import { useRef, useState } from 'react';
import { PROMO_END, packages } from '../expats-data.mjs';
import o from './offers.module.css';
import { Features, Loans, Period, external, gel, useSeen } from './shared';

/* A — the halving, acted out: the regular price is sliced in two, the halves
   fall away and the promo price rises in its place. Plays once on scroll-in
   and again when the period changes (the stage is keyed by period). */
export default function Cut() {
  const [period, setPeriod] = useState('month');
  const area = useRef(null);
  const seen = useSeen(area);
  return <div className={o.cut} ref={area} data-seen={seen || undefined}>
    <div className={o.cutHead}>
      <div>
        <p className={o.kicker}>Join before {PROMO_END}</p>
        <h2 id="offers-heading">Half price <em>for expats</em></h2>
        <p>The Expat Package and Credo Rcheuli cost half as much when you join before {PROMO_END}.</p>
      </div>
      <Period value={period} onChange={setPeriod} />
    </div>

    <div className={o.coupons}>
      {packages.map((pk, i) => <article key={pk.id} className={o.coupon} data-plan={pk.id} style={{ '--delay': `${i * 260}ms` }}>
        <div className={o.couponTop}>
          <div className={o.couponHead}>
            <div><h3>{pk.name}</h3><p>{pk.tagline}</p></div>
            <span className={o.badge}>−50%</span>
          </div>
          <div className={o.cutStage} key={period} style={{ '--slash-w': `${gel(pk.was[period]).length * .58}em` }}>
            <span className={o.srOnly}>{gel(pk.price[period])} per {period}, regular price {gel(pk.was[period])}</span>
            <span className={o.oldHalf} data-h="top" aria-hidden="true">{gel(pk.was[period])}</span>
            <span className={o.oldHalf} data-h="bottom" aria-hidden="true">{gel(pk.was[period])}</span>
            <i className={o.slash} aria-hidden="true" />
            <span className={o.newPrice} aria-hidden="true"><b>{gel(pk.price[period])}</b><span>/{period}</span></span>
          </div>
          <p className={o.was}>Regular price <s>{gel(pk.was[period])}</s> per {period}</p>
        </div>
        <div className={o.couponBottom}>
          <Features items={pk.features} />
          <a className={`action ${pk.id === 'rcheuli' ? o.onDark : ''}`} href={pk.href} {...external}>{pk.cta}</a>
        </div>
      </article>)}
    </div>

    <Loans />
  </div>;
}
