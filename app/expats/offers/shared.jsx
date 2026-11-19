'use client';

import { useEffect, useRef, useState } from 'react';
import ProductIcon from '../../emigrants/products/ProductIcon';
import { CARPET, Arrows, ExpScript } from '../ExpMark';
import { LOAN_FORM_URL, PROMO_END_ISO, loanOffers } from '../expats-data.mjs';
import x from '../sections/sections.module.css';
import o from './offers.module.css';

export const external = { target: '_blank', rel: 'noreferrer' };
export const gel = v => `GEL ${Number.isInteger(v) ? v : v.toFixed(1)}`;
export const PER = { month: 'month', year: 'year' };
export const reducedMotion = () => typeof window !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/* "Calculate" on a loan pre-fills the loan calculator further down the page. */
export function calculate(id) {
  window.dispatchEvent(new CustomEvent('expats:loan', { detail: id }));
  document.getElementById('calculators')?.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth' });
}
export function openExchange() {
  window.dispatchEvent(new CustomEvent('expats:tab', { detail: 'exchange' }));
  document.getElementById('calculators')?.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth' });
}

/* True once the element has been on screen; entrance animations key off it. */
export function useSeen(ref, rootMargin = '0px 0px -20% 0px') {
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setSeen(true); observer.disconnect(); } }, { rootMargin });
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, rootMargin]);
  return seen;
}

/* Days / hours / minutes / seconds left in the sign-up window. Renders a
   placeholder on the server so hydration matches. */
export function useCountdown(iso = PROMO_END_ISO) {
  const [left, setLeft] = useState(null);
  useEffect(() => {
    const end = new Date(iso).getTime();
    const tick = () => setLeft(Math.max(0, end - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [iso]);
  if (left == null) return null;
  const s = Math.floor(left / 1000);
  return { days: Math.floor(s / 86400), hours: Math.floor(s / 3600) % 24, minutes: Math.floor(s / 60) % 60, seconds: s % 60 };
}
export const pad = n => String(n).padStart(2, '0');

export function Period({ value, onChange, className = '' }) {
  return <div className={`${x.segment} ${className}`} role="radiogroup" aria-label="Billing period">
    <i className={x.segmentThumb} style={{ translate: value === 'year' ? '100% 0' : '0 0' }} aria-hidden="true" />
    <button type="button" role="radio" aria-checked={value === 'month'} onClick={() => onChange('month')}>Monthly</button>
    <button type="button" role="radio" aria-checked={value === 'year'} onClick={() => onChange('year')}>Yearly</button>
  </div>;
}

export function Features({ items, className = '' }) {
  return <ul className={`${o.features} ${className}`}>
    {items.map(f => <li key={f}><ProductIcon kind="check" size={18} />{f}</li>)}
  </ul>;
}

export function LoanActions({ id, className = '' }) {
  return <div className={`${o.loanActions} ${className}`}>
    <a className={o.link} href={LOAN_FORM_URL} {...external}>Apply <ProductIcon kind="arrow" size={16} /></a>
    <button type="button" className={o.link} onClick={() => calculate(id)}>Calculate</button>
  </div>;
}

/* The three loan deals as a quiet row: used under the variants that spend
   their visual budget on the packages. */
export function Loans() {
  return <ul className={o.loans}>
    {loanOffers.map(l => <li key={l.id} className={o.loan}>
      <p className={o.loanLabel}>{l.label}</p>
      <p className={o.loanBig}><small>{l.unit}</small>{l.big}</p>
      <p className={o.loanNote}>{l.note}</p>
      <ul className={o.loanPoints}>{l.points.map(pt => <li key={pt}>{pt}</li>)}</ul>
      <LoanActions id={l.id} />
    </li>)}
  </ul>;
}

/* The two package cards. The Expat card is invented for this prototype from
   the EXP logo (no real card design was supplied); the Rcheuli card matches
   the one on /emigrants. Tilt follows the pointer when `tilt` is on. */
export function BankCard({ kind, tilt = false, className = '' }) {
  const ref = useRef(null);
  function move(e) {
    if (!tilt || reducedMotion()) return;
    const box = ref.current.getBoundingClientRect();
    const px = (e.clientX - box.left) / box.width - .5, py = (e.clientY - box.top) / box.height - .5;
    ref.current.style.setProperty('--rx', `${(-py * 12).toFixed(2)}deg`);
    ref.current.style.setProperty('--ry', `${(px * 16).toFixed(2)}deg`);
    ref.current.style.setProperty('--gx', `${((px + .5) * 100).toFixed(1)}%`);
    ref.current.style.setProperty('--gy', `${((py + .5) * 100).toFixed(1)}%`);
  }
  function leave() { ['--rx', '--ry', '--gx', '--gy'].forEach(v => ref.current?.style.removeProperty(v)); }
  return <div className={`${o.cardTilt} ${className}`} onPointerMove={move} onPointerLeave={leave} aria-hidden="true">
    <div className={o.card} data-kind={kind} ref={ref}>
      {kind === 'expat' ? <>
        <span className={o.cardMedallion}><img src={CARPET} alt="" draggable="false" /><Arrows className={o.cardArrows} /></span>
        <span className={o.cardTop}><span>Credo Bank</span><ExpScript className={o.cardExp} /></span>
        <span className={o.cardChip} />
        <span className={o.cardFoot}><span>•••• 2026</span></span>
      </> : <>
        <span className={o.cardTop}><b>Rcheuli</b><span>Premium</span></span>
        <span className={o.cardChip} />
        <span className={o.cardFoot}><span>•••• 2026</span><i className={o.cardRing} /></span>
      </>}
      <span className={o.cardSheen} />
    </div>
  </div>;
}
