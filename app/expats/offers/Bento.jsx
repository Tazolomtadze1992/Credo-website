'use client';

import { useEffect, useRef, useState } from 'react';
import { currencies } from '../../emigrants/rates/rates-data.mjs';
import { CARPET, Arrows } from '../ExpMark';
import { HOURS, LOAN_FORM_URL, PROMO_END, VIDEO_URL, loanOffers, packages } from '../expats-data.mjs';
import o from './offers.module.css';
import { Features, calculate, external, gel, openExchange, pad, reducedMotion, useCountdown } from './shared';

const Plus = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>;
const Close = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>;
const EASE = 'cubic-bezier(.19,1,.22,1)';

function Clock() {
  const left = useCountdown();
  const parts = left ? [[left.days, 'days'], [left.hours, 'hours'], [left.minutes, 'min'], [left.seconds, 'sec']] : [['—', 'days'], ['—', 'hours'], ['—', 'min'], ['—', 'sec']];
  return <p className={o.clock} role="timer" aria-label={left ? `${left.days} days left` : 'Time left'}>
    {parts.map(([v, l]) => <span key={l}><b>{typeof v === 'number' ? pad(v) : v}</b><small>{l}</small></span>)}
  </p>;
}

/* What each "+" opens. */
function Detail({ id, onCalculate }) {
  const pk = packages.find(p => p.id === id);
  if (pk) return <>
    <h3>{pk.name}</h3>
    <p>{pk.tagline}. {gel(pk.price.month)} a month or {gel(pk.price.year)} a year when you join before {PROMO_END} (regular {gel(pk.was.month)} / {gel(pk.was.year)}).</p>
    <Features items={pk.features} />
    <a className={`action ${id === 'rcheuli' ? o.onDark : ''}`} href={pk.href} {...external}>{pk.cta}</a>
  </>;
  const loan = loanOffers.find(l => l.id === id);
  return <>
    <h3>{loan.label}</h3>
    <p>{loan.unit} {loan.big} · {loan.note}</p>
    <ul className={o.loanPoints}>{loan.points.map(pt => <li key={pt}>{pt}</li>)}</ul>
    <div className={o.loanActions} style={{ alignItems: 'center', gap: 24 }}>
      <a className="action" href={LOAN_FORM_URL} {...external}>Apply</a>
      <button type="button" className={o.link} onClick={() => onCalculate(loan.id)}>Calculate</button>
    </div>
  </>;
}

/* C — one fact per tile, Apple-style. "+" grows the tile into a detail sheet
   (FLIP on the panel, so closing shrinks it back into the same tile). */
export default function Bento() {
  const [open, setOpen] = useState(null);
  const dialog = useRef(null);
  const panel = useRef(null);
  const origin = useRef(null);
  const closing = useRef(false);

  function morph(reverse) {
    const tile = origin.current, el = panel.current;
    if (!tile || !el || reducedMotion()) return null;
    const a = tile.getBoundingClientRect(), b = el.getBoundingClientRect();
    const start = { transform: `translate(${a.left - b.left}px, ${a.top - b.top}px) scale(${a.width / b.width}, ${a.height / b.height})`, opacity: .2 };
    const end = { transform: 'none', opacity: 1 };
    el.querySelector('[data-body]')?.animate([{ opacity: 0 }, { opacity: 1 }], { duration: reverse ? 120 : 260, delay: reverse ? 0 : 140, easing: 'ease-out', fill: 'backwards', direction: reverse ? 'reverse' : 'normal' });
    return el.animate(reverse ? [end, start] : [start, end], { duration: reverse ? 300 : 460, easing: EASE });
  }
  useEffect(() => {
    if (!open) return;
    dialog.current.showModal();
    document.documentElement.style.overflow = 'hidden';
    morph(false);
    return () => { document.documentElement.style.overflow = ''; };
  }, [open]);
  async function close() {
    if (closing.current) return;
    closing.current = true;
    const anim = morph(true);
    // never let a stalled animation (e.g. a background tab) keep the sheet open
    if (anim) await Promise.race([anim.finished.catch(() => {}), new Promise(r => setTimeout(r, 360))]);
    dialog.current?.close();
    document.documentElement.style.overflow = '';
    closing.current = false;
    setOpen(null);
  }
  const show = id => e => { origin.current = e.currentTarget.closest('[data-tile]'); setOpen(id); };
  const [pack, rch] = packages;
  const loans = Object.fromEntries(loanOffers.map(l => [l.id, l]));
  const usd = currencies.find(c => c.code === 'USD'), eur = currencies.find(c => c.code === 'EUR');

  const LoanTile = ({ id }) => <article className={`${o.tile} ${o[`${id}Tile`]}`} data-tile>
    <h3>{loans[id].label}</h3>
    <p className={o.tileBig}><small>{loans[id].unit}</small>{loans[id].big}</p>
    <p className={o.tileNote}>{loans[id].note}</p>
    <button type="button" className={o.tileCta} onClick={show(id)} aria-label={`${loans[id].label}: details`} />
    <span className={o.plus} aria-hidden="true"><Plus /></span>
  </article>;

  return <div>
    <div className={o.head}>
      <div>
        <h2 id="offers-heading">Current offers</h2>
        <p>Everything on offer for expats right now, one fact per tile. Tap + for the details.</p>
      </div>
    </div>

    <div className={o.bento}>
      <article className={`${o.tile} ${o.promoTile}`}>
        <p className={o.kicker}>Join before {PROMO_END}</p>
        <p className={o.promoBig}>−50%</p>
        <p>on the Expat Package and Credo Rcheuli. The offer ends in</p>
        <Clock />
        <span className={o.promoMedal} aria-hidden="true"><img src={CARPET} alt="" draggable="false" /><Arrows /></span>
      </article>

      {[pack, rch].map(pk => <article key={pk.id} className={`${o.tile} ${o[`${pk.id}Tile`]}`} data-tile data-tone={pk.id === 'rcheuli' ? 'dark' : undefined}>
        <h3>{pk.name}</h3>
        <p className={o.tileBig}>{gel(pk.price.month)}<span>/mo</span></p>
        <p className={o.tileNote}>was <s>{gel(pk.was.month)}</s> · or {gel(pk.price.year)} a year</p>
        <button type="button" className={o.tileCta} onClick={show(pk.id)} aria-label={`${pk.name}: details`} />
        <span className={o.plus} aria-hidden="true"><Plus /></span>
      </article>)}

      <LoanTile id="mortgage" />
      <LoanTile id="business" />
      <LoanTile id="auto" />

      <article className={`${o.tile} ${o.exchangeTile}`} data-tile>
        <h3>Currency exchange</h3>
        <p className={o.tileNote} style={{ marginTop: 4 }}>Buy in Mycredo today</p>
        <ul className={o.ratesMini}>
          <li><span>$1</span>₾{usd.mobile.buy.toFixed(4)}</li>
          <li><span>€1</span>₾{eur.mobile.buy.toFixed(4)}</li>
        </ul>
        <button type="button" className={o.tileCta} onClick={openExchange} aria-label="Open the currency calculator" />
        <span className={o.plus} aria-hidden="true"><Plus /></span>
      </article>

      <article className={`${o.tile} ${o.videoTile}`}>
        <div>
          <p className={o.live}><i />Bankers online {HOURS.split(' · ')[0]}</p>
          <p className={o.tileBig}>Open your account by video call</p>
          <p className={o.tileNote}>No branch visit — a banker checks your passport on camera.</p>
        </div>
        <span className={o.callMock} aria-hidden="true"><img src={CARPET} alt="" draggable="false" /><i /><span>Credo banker</span></span>
        <a className={o.tileCta} href={VIDEO_URL} {...external} aria-label="Book a video call" />
      </article>
    </div>

    <dialog ref={dialog} className={o.sheet} aria-label="Offer details"
      onCancel={e => { e.preventDefault(); close(); }}
      onClick={e => { if (e.target === dialog.current) close(); }}>
      {open && <div className={o.sheetPanel} ref={panel} data-tone={open === 'rcheuli' ? 'dark' : undefined} style={{ transformOrigin: '0 0' }}>
        <button type="button" className={o.sheetClose} onClick={close} aria-label="Close"><Close /></button>
        <div data-body><Detail id={open} onCalculate={async id => { await close(); calculate(id); }} /></div>
      </div>}
    </dialog>
  </div>;
}
