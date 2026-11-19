'use client';

import { useState } from 'react';
import ProductIcon from '../../emigrants/products/ProductIcon';
import x from '../sections/sections.module.css';
import { LOAN_FORM_URL, PROMO_END, loanOffers, packages } from '../expats-data.mjs';
import o from './offers.module.css';
import { Features, Period, calculate, external, gel } from './shared';

const RCHEULI_TILES = [
  { icon: 'services', text: 'A dedicated personal banker' },
  { icon: 'card', text: 'Visa Platinum or Mastercard World Elite' },
  { icon: 'shield', text: 'Airport lounges and personal limits' },
  { icon: 'bell', text: 'Concierge for travel and gifts' },
];

/* D — our Stripe direction, straight: a split white card with the price in its
   own panel, a dark card with a tile grid, and a woven ribbon behind both. */
export default function Split() {
  const [period, setPeriod] = useState('month');
  const [loan, setLoan] = useState(loanOffers[0].id);
  const [pack, rch] = packages;
  const l = loanOffers.find(item => item.id === loan);
  const at = loanOffers.findIndex(item => item.id === loan);
  return <div className={o.split}>
    <div className={o.ribbonClip} aria-hidden="true"><i className={o.ribbon}><span /></i></div>

    <div className={o.head}>
      <div>
        <h2 id="offers-heading">Current offers</h2>
        <p>Packages at half price when you join before {PROMO_END}, plus special loan terms for expats.</p>
      </div>
      <Period value={period} onChange={setPeriod} />
    </div>

    <div className={o.splitCards}>
      <article className={o.splitCard} data-plan="expat">
        <div className={o.splitCopy}>
          <h3>{pack.name}</h3>
          <p>{pack.tagline}</p>
          <Features items={pack.features.slice(0, 4)} />
          <a className="action" href={pack.href} {...external}>{pack.cta}</a>
        </div>
        <div className={o.splitPrice}>
          <span className={o.badge}>−50%</span>
          <b key={period}>{gel(pack.price[period])}</b>
          <span>per {period}</span>
          <s>{gel(pack.was[period])}</s>
          <span>until {PROMO_END}</span>
        </div>
      </article>

      <article className={o.splitCard} data-plan="rcheuli">
        <div className={o.splitCopy}>
          <h3>{rch.name}</h3>
          <p>{rch.tagline}</p>
          <p className={o.inlinePrice}><b key={period}>{gel(rch.price[period])}</b><span>/{period}</span><s>{gel(rch.was[period])}</s></p>
          <a className={`action ${o.onDark}`} href={rch.href} {...external}>{rch.cta}</a>
        </div>
        <ul className={o.splitTiles}>
          {RCHEULI_TILES.map(t => <li key={t.text}><ProductIcon kind={t.icon} size={22} />{t.text}</li>)}
        </ul>
      </article>
    </div>

    <div className={o.loanTabs}>
      <div className={x.tabs} role="tablist" aria-label="Loan offers">
        <i className={x.tabThumb} style={{ translate: `${at * 100}% 0` }} aria-hidden="true" />
        {loanOffers.map(item => <button key={item.id} type="button" role="tab" id={`loan-tab-${item.id}`} aria-selected={item.id === loan} aria-controls="loan-panel" onClick={() => setLoan(item.id)}>{item.label.replace(' loan', '')}</button>)}
      </div>
      <div className={o.loanPanel} id="loan-panel" role="tabpanel" aria-labelledby={`loan-tab-${loan}`} key={loan}>
        <div>
          <p className={o.loanBig}><small>{l.label} · {l.unit}</small>{l.big}</p>
          <p className={o.loanNote}>{l.note}</p>
        </div>
        <ul className={o.loanPoints}>{l.points.map(pt => <li key={pt}>{pt}</li>)}</ul>
        <div className={o.loanActions}>
          <a className="action" href={LOAN_FORM_URL} {...external}>Apply</a>
          <button type="button" className={o.link} onClick={() => calculate(l.id)}>Calculate the payment</button>
        </div>
      </div>
    </div>
  </div>;
}
