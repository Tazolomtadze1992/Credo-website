'use client';

import { useState } from 'react';
import { PROMO_END, packages } from '../expats-data.mjs';
import o from './offers.module.css';
import { BankCard, Features, Loans, Period, external, gel } from './shared';

/* B — each package is its card. The cards sit in a small fanned deck; picking
   one slides it to the front and swaps the details beside it. */
export default function Wallet() {
  const [active, setActive] = useState('expat');
  const [period, setPeriod] = useState('month');
  const pk = packages.find(p => p.id === active);
  return <div>
    <div className={o.head}>
      <div>
        <h2 id="offers-heading">Current offers</h2>
        <p>Two packages, both at half price until {PROMO_END}. Pick a card to see what’s inside.</p>
      </div>
      <Period value={period} onChange={setPeriod} />
    </div>

    <div className={o.walletGrid}>
      <div className={o.deck}>
        {packages.map(p => <button key={p.id} type="button" className={o.deckCard} data-pos={p.id === active ? 'front' : 'back'}
          onClick={() => setActive(p.id)} aria-label={`Show ${p.name}`} aria-pressed={p.id === active}>
          <BankCard kind={p.id} tilt={p.id === active} />
        </button>)}
        <span className={o.deckShadow} aria-hidden="true" />
      </div>

      <div className={o.walletInfo} key={active}>
        <div className={o.picker} role="radiogroup" aria-label="Package">
          {packages.map(p => <button key={p.id} type="button" role="radio" aria-checked={p.id === active} onClick={() => setActive(p.id)}>{p.name}</button>)}
        </div>
        <h3>{pk.name}</h3>
        <p>{pk.tagline}</p>
        <p className={o.bigPrice}><b key={period}>{gel(pk.price[period])}</b><span>/{period}</span><s>{gel(pk.was[period])}</s></p>
        <p className={o.until}>Join before {PROMO_END} · regular price {gel(pk.was[period])}/{period}</p>
        <Features items={pk.features} />
        <a className="action" href={pk.href} {...external}>{pk.cta}</a>
      </div>
    </div>

    <Loans />
  </div>;
}
