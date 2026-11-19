'use client';

import { useEffect, useRef, useState } from 'react';
import ProductIcon from '../../emigrants/products/ProductIcon';
import { LOAN_FORM_URL, PROMO_END, VIDEO_URL, packages } from '../expats-data.mjs';
import o from './offers.module.css';
import { calculate, external, gel, useSeen } from './shared';

const [pack, rch] = packages;
const short = PROMO_END.replace('January', 'Jan');

/* Each offer written as a boarding pass: where you were (regular terms) →
   where the offer takes you. Copy only uses figures from the promo pages. */
const PASSES = [
  { id: 'expat', tone: 'blue', kind: 'Expat Package', code: 'EXP', from: ['Regular', `${gel(pack.was.month)}`], to: ['With the offer', `${gel(pack.price.month)}`],
    fields: [['Per year', gel(pack.price.year)], ['Join by', short], ['Account in', '15 min']], cta: { label: 'Get the package', href: pack.href } },
  { id: 'rcheuli', tone: 'dark', kind: 'Credo Rcheuli', code: 'RCH', from: ['Regular', `${gel(rch.was.month)}`], to: ['With the offer', `${gel(rch.price.month)}`],
    fields: [['Per year', gel(rch.price.year)], ['Join by', short], ['Card', 'World Elite']], cta: { label: 'Become Rcheuli', href: rch.href } },
  { id: 'mortgage', kind: 'Mortgage loan', code: 'MTG', from: ['Down payment', '20%', true], to: ['Rate from', '8.00%'],
    fields: [['Effective', 'from 9.78%'], ['Income check', 'Not needed'], ['Homes', 'Partner devs']], loan: true },
  { id: 'business', kind: 'Business loan', code: 'BIZ', from: ['Rate from', '16%', true], to: ['Discount up to', '30%'],
    fields: [['Effective', 'from 19.04%'], ['Refinance', 'up to −20%'], ['Industries', 'All']], loan: true },
  { id: 'auto', kind: 'Auto loan', code: 'CAR', from: ['Financing', '80%', true], to: ['Borrow up to', 'GEL 30k'],
    fields: [['Vehicles', 'New or used'], ['Income', 'Any source'], ['Application', 'Quick']], loan: true },
  { id: 'video', kind: 'Video banking', code: 'VID', from: ['Branch visits', 'None', true], to: ['Account in', '15 min'],
    fields: [['From', 'Anywhere'], ['Language', 'English'], ['Hours', 'Mon–Sat']], cta: { label: 'Book a video call', href: VIDEO_URL } },
];

const Plane = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M21 15.5v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0v5l-8 5v2l8-2.5V18l-2 1.5V21l3.5-1 3.5 1v-1.5L13 18v-5z" transform="rotate(90 12 12)" /></svg>;

/* F — offers as boarding passes on a rail you can drag (mouse), swipe
   (touch) or step through with the arrows. */
export default function Passes() {
  const rail = useRef(null);
  const seen = useSeen(rail);
  const [edge, setEdge] = useState({ start: true, end: false });
  const drag = useRef(null);

  function update() {
    const el = rail.current;
    if (!el) return;
    setEdge({ start: el.scrollLeft < 8, end: el.scrollLeft + el.clientWidth > el.scrollWidth - 8 });
  }
  useEffect(() => {
    // scroll-padding % resolves against the rail itself (full bleed), so measure
    // the page frame's inset and snap passes to it
    const el = rail.current;
    const measure = () => { el.style.setProperty('--bleed', `${Math.max(0, el.parentElement.getBoundingClientRect().left)}px`); update(); };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);
  function step(dir) {
    const el = rail.current, card = el.querySelector('li');
    el.scrollBy({ left: dir * (card.offsetWidth + 20), behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }
  function down(e) {
    if (e.pointerType !== 'mouse' || e.button !== 0 || e.target.closest('a,button')) return;
    drag.current = { x: e.clientX, left: rail.current.scrollLeft, moved: false };
  }
  function move(e) {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    if (!d.moved && Math.abs(dx) > 4) { d.moved = true; rail.current.dataset.drag = ''; rail.current.setPointerCapture(e.pointerId); }
    if (d.moved) rail.current.scrollLeft = d.left - dx;
  }
  function up() {
    if (!drag.current) return;
    const el = rail.current;
    drag.current = null;
    if (el.hasAttribute('data-drag')) {
      // let snapping pick the nearest pass from where the drag left off
      const left = el.scrollLeft;
      delete el.dataset.drag;
      el.scrollLeft = left;
    }
  }

  return <div>
    <div className={o.railHead}>
      <div className={o.head} style={{ marginBottom: 0 }}>
        <div>
          <h2 id="offers-heading">Current offers</h2>
          <p>Your tickets to banking in Georgia — half-price packages until {PROMO_END}, loans on expat terms and an account by video call.</p>
        </div>
      </div>
      <div className={o.railNav}>
        <button type="button" onClick={() => step(-1)} disabled={edge.start} aria-label="Previous offers"><ProductIcon kind="arrow" size={18} /></button>
        <button type="button" onClick={() => step(1)} disabled={edge.end} aria-label="Next offers"><ProductIcon kind="arrow" size={18} /></button>
      </div>
    </div>

    <ul className={o.rail} ref={rail} data-seen={seen || undefined} aria-label="Offers" onScroll={update} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
        {PASSES.map((p, i) => <li key={p.id} className={o.pass} data-tone={p.tone} style={{ '--i': i }}>
          <div className={o.passMain}>
            <p className={o.passTop}><b>{p.kind}</b><span>CREDO · {p.code}</span></p>
            <div className={o.route}>
              <p data-plain={p.from[2] || undefined}>{p.from[0]}<b>{p.from[1]}</b></p>
              <span className={o.flight} aria-hidden="true"><Plane /></span>
              <p>{p.to[0]}<b>{p.to[1]}</b></p>
            </div>
            <dl className={o.fields}>{p.fields.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
          </div>
          <div className={o.passStub}>
            <p className={o.stubTop}>Gate<b>{p.loan ? 'Expats' : `Until ${short}`}</b></p>
            <span className={o.barcode} aria-hidden="true" />
            <div className={o.stubActions}>
              {p.loan ? <>
                <a className={o.link} href={LOAN_FORM_URL} {...external}>Apply <ProductIcon kind="arrow" size={16} /></a>
                <button type="button" className={o.link} onClick={() => calculate(p.id)}>Calculate</button>
              </> : <a className={o.link} href={p.cta.href} {...external}>{p.cta.label} <ProductIcon kind="arrow" size={16} /></a>}
            </div>
          </div>
        </li>)}
    </ul>
  </div>;
}
