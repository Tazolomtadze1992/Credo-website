'use client';

import { useEffect, useRef, useState } from 'react';
import { RCHEULI_URL } from '../emigrants-data.mjs';
import ProductIcon from '../products/ProductIcon';
import p from '../products/products.module.css';
import s from '../steps/steps.module.css';
import c from './rcheuli.module.css';

// Rcheuli is Credo's premium tier; its own site runs dark (#14161d), deep
// navy-teal (#023042) and the Credo coral (#ff5b46). These variants borrow that.
const ABOUT_URL = 'https://credobank.ge/rcheuli';
const LOUNGE = 'https://imagedelivery.net/d_EE26O5eWcJDRYn-qMBOg/45931469-9f04-4339-af67-f261feb5ca00/public';
const external = { target: '_blank', rel: 'noreferrer' };

const BENEFITS = [
  { icon: 'card', title: 'უფასო პრემიუმ ბარათი', text: 'ინდივიდუალური ლიმიტები და ლაუნჯები აეროპორტებში' },
  { icon: 'deposit', title: 'მეტი სარგებელი ანაბრებზე', text: 'განსაკუთრებული განაკვეთები რჩეულებისთვის' },
  { icon: 'loan', title: 'სპეციალური პირობები სესხებზე', text: 'შენზე მორგებული საკრედიტო პროდუქტები' },
  { icon: 'bell', title: 'კონსიერჟი და პირადი ბანკირი', text: 'მოგზაურობა, საჩუქრები და მომსახურება რიგის გარეშე' },
];
const TICKER = ['უფასო პრემიუმ ბარათი', 'ლაუნჯები აეროპორტებში', 'მეტი სარგებელი ანაბრებზე', 'სპეციალური პირობები სესხებზე', 'პირადი ბანკირი', 'კონსიერჟ-სერვისი', 'მომსახურება რიგის გარეშე', 'უფასო დისტანციური სერვისები'];

const TITLE = 'გახდი რჩეული';
const LEDE = 'პრივილეგირებული მომსახურება — საზღვარგარეთიდანაც, დისტანციურად.';

const Eyebrow = () => <p className={c.eyebrow}><i aria-hidden="true" />კრედო რჩეული</p>;
const Apply = ({ tone = 'coral' }) => <a className={`${c.apply} ${c[tone]}`} href={RCHEULI_URL} {...external}>
  შეავსე განაცხადი <ProductIcon kind="arrow" size={18} />
</a>;
const More = () => <a className={c.more} href={ABOUT_URL} {...external}>
  გაიგე მეტი <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M8 16 16 8M9 8h7v7" /></svg>
</a>;

/* A — dark panel in rcheuli's own palette, benefits on a hairline grid. */
function Dark() {
  return <div className={c.dark}>
    <div className={c.darkTop}>
      <div>
        <Eyebrow />
        <h2 className={c.title}>{TITLE}</h2>
        <p className={c.lede}>{LEDE}</p>
      </div>
      <div className={c.actions}><Apply /><More /></div>
    </div>
    <ul className={c.darkGrid}>
      {BENEFITS.map(b => <li key={b.title} className={p.hot}>
        <ProductIcon kind={b.icon} size={26} className={c.benefitIcon} />
        <h3>{b.title}</h3>
        <p>{b.text}</p>
      </li>)}
    </ul>
  </div>;
}

/* B — the lounge photo carries it, copy on a dark wash like rcheuli's hero. */
function Photo() {
  return <div className={c.photo}>
    <img className={c.photoImg} src={LOUNGE} alt="" loading="lazy" />
    <div className={c.photoCopy}>
      <Eyebrow />
      <h2 className={c.title}>{TITLE}</h2>
      <p className={c.lede}>{LEDE}</p>
      <ul className={c.checks}>
        {BENEFITS.map(b => <li key={b.title}><ProductIcon kind="check" size={16} />{b.title}</li>)}
      </ul>
      <div className={c.actions}><Apply /><More /></div>
    </div>
  </div>;
}

/* C — light surface with a premium card that tilts toward the pointer. */
function Card() {
  const card = useRef(null);
  function tilt(e) {
    if (!matchMedia('(hover: hover) and (prefers-reduced-motion: no-preference)').matches) return;
    const box = card.current.getBoundingClientRect();
    const x = (e.clientX - box.left) / box.width - .5, y = (e.clientY - box.top) / box.height - .5;
    card.current.style.setProperty('--rx', `${(-y * 14).toFixed(2)}deg`);
    card.current.style.setProperty('--ry', `${(x * 18).toFixed(2)}deg`);
    card.current.style.setProperty('--gx', `${((x + .5) * 100).toFixed(1)}%`);
  }
  function reset() { ['--rx', '--ry', '--gx'].forEach(v => card.current.style.removeProperty(v)); }
  return <div className={c.light}>
    <div className={c.lightCopy}>
      <Eyebrow />
      <h2 className={c.title}>{TITLE}</h2>
      <p className={c.lede}>{LEDE}</p>
      <ul className={c.lightList}>
        {BENEFITS.map(b => <li key={b.title}><ProductIcon kind={b.icon} size={22} /><span><b>{b.title}</b>{b.text}</span></li>)}
      </ul>
      <div className={c.actions}><Apply tone="ink" /><More /></div>
    </div>
    <div className={c.cardStage} onPointerMove={tilt} onPointerLeave={reset} aria-hidden="true">
      <div className={c.premium} ref={card}>
        <span className={c.premiumTop}><b>რჩეული</b><span>Premium</span></span>
        <span className={c.premiumChip} />
        <span className={c.premiumNumber}>•••• •••• •••• 2026</span>
        <span className={c.premiumFoot}><span>ლაუნჯი · კონსიერჟი</span><i /></span>
      </div>
      <div className={c.cardShadow} />
    </div>
  </div>;
}

/* D — open editorial layout with hairlines, like the products grid. */
function Index() {
  return <div className={c.index}>
    <div className={c.indexCopy}>
      <Eyebrow />
      <h2 className={c.bigTitle}>{TITLE}</h2>
      <p className={c.lede}>{LEDE}</p>
      <div className={c.actions}><Apply tone="ink" /><More /></div>
    </div>
    <ol className={c.indexList}>
      {BENEFITS.map((b, i) => <li key={b.title} className={p.hot}>
        <span className={c.num}>{String(i + 1).padStart(2, '0')}</span>
        <span><h3>{b.title}</h3><p>{b.text}</p></span>
        <ProductIcon kind={b.icon} size={26} className={c.benefitIcon} />
      </li>)}
    </ol>
  </div>;
}

/* E — a compact dark strip with the benefits running past; hard to miss, short. */
function Strip() {
  const row = TICKER.map(t => <span key={t}>{t}<i aria-hidden="true" /></span>);
  return <div className={c.strip}>
    <div className={c.stripHead}>
      <Eyebrow />
      <h2 className={c.stripTitle}>{TITLE}</h2>
    </div>
    <div className={c.ticker}>
      <p className={c.srOnly}>{TICKER.join(', ')}</p>
      <div className={c.tickerTrack} aria-hidden="true">{row}{row}</div>
    </div>
    <Apply />
  </div>;
}

// Design-review switcher: the choice lives in ?rcheuli=…
export const VARIANTS = [
  { id: 'dark', letter: 'A', label: 'მუქი', Component: Dark },
  { id: 'photo', letter: 'B', label: 'ფოტო', Component: Photo },
  { id: 'card', letter: 'C', label: 'ბარათი', Component: Card },
  { id: 'index', letter: 'D', label: 'სია', Component: Index },
  { id: 'strip', letter: 'E', label: 'ზოლი', Component: Strip },
];
const resolve = id => VARIANTS.find(v => v.id === id) || VARIANTS[0];

export default function RcheuliVariants({ initial, className }) {
  const [id, setId] = useState(resolve(initial).id);
  const [onScreen, setOnScreen] = useState(false);
  const area = useRef(null);
  useEffect(() => {
    const root = document.documentElement;
    const observer = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting), { rootMargin: '-30% 0px -30% 0px' });
    observer.observe(area.current);
    return () => { observer.disconnect(); if (root.dataset.dock === 'rcheuli') delete root.dataset.dock; };
  }, []);
  useEffect(() => {
    const root = document.documentElement;
    if (onScreen) root.dataset.dock = 'rcheuli';
    else if (root.dataset.dock === 'rcheuli') delete root.dataset.dock;
  }, [onScreen]);
  function choose(next) {
    setId(next);
    const url = new URL(window.location.href);
    url.searchParams.set('rcheuli', next);
    window.history.replaceState(null, '', url);
  }
  const { Component } = resolve(id);
  return <>
    <section className={className} ref={area} aria-label="კრედო რჩეული">
      <div className={`${p.variantBody} ${c.body}`} key={id}><Component /></div>
    </section>
    <div className={`${s.switcher} ${s.rcheuliDock}`} data-visible={onScreen} inert={!onScreen || undefined}>
      <div className={s.switchGroup} role="radiogroup" aria-label="რჩეულის ბლოკის ვარიანტი">
        <span className={s.switcherLabel}>რჩეული</span>
        {VARIANTS.map(v => <button key={v.id} type="button" role="radio" aria-checked={v.id === id} onClick={() => choose(v.id)} title={v.label}>
          <b>{v.letter}</b><span>{v.label}</span>
        </button>)}
      </div>
    </div>
  </>;
}
