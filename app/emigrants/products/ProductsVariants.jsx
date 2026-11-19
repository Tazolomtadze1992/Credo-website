'use client';

import { useEffect, useRef, useState } from 'react';
import { products } from '../emigrants-data.mjs';
import s from '../steps/steps.module.css';
import ProductIcon from './ProductIcon';
import p from './products.module.css';

const byId = Object.fromEntries(products.map(item => [item.id, item]));
const external = { target: '_blank', rel: 'noreferrer' };
const More = () => <span className={p.more}>გაიგე მეტი <ProductIcon kind="arrow" size={16} /></span>;

/* A — the first draft: one bordered card per product. */
function Cards() {
  return <ul className={p.cards}>
    {products.map(item => <li key={item.id}><a className={`${p.card} ${p.hot}`} href={item.href} {...external}>
      <span className={p.cardIcon}><ProductIcon kind={item.icon} /></span>
      <h3>{item.title}</h3>
      <p>{item.description}</p>
      <More />
    </a></li>)}
  </ul>;
}

/* B — Swiss grid: no boxes, hairlines only; the hovered cell gets scan-frame corners. */
function Grid() {
  return <div className={p.gridFrame}>
    <ul className={p.grid}>
      {products.map((item, i) => <li key={item.id}><a className={`${p.cell} ${p.hot}`} href={item.href} {...external}>
        <span className={p.cellTop}>
          <ProductIcon kind={item.icon} size={28} className={p.cellIcon} />
          <span className={p.index}>{String(i + 1).padStart(2, '0')}</span>
        </span>
        <h3>{item.title}</h3>
        <p>{item.description}</p>
        <ProductIcon kind="arrow" size={18} className={p.cellArrow} />
      </a></li>)}
    </ul>
    <i className={p.plus} style={{ left: 0, top: 0 }} aria-hidden="true" />
    <i className={p.plus} style={{ left: '100%', top: 0 }} aria-hidden="true" />
    <i className={p.plus} style={{ left: 0, top: '100%' }} aria-hidden="true" />
    <i className={p.plus} style={{ left: '100%', top: '100%' }} aria-hidden="true" />
  </div>;
}

/* C — an editorial index, grouped by what the money is for. */
const GROUPS = [
  { title: 'ფულის გადაადგილება', ids: ['remittances', 'transfers', 'cards'] },
  { title: 'დაზოგვა და დაფინანსება', ids: ['deposits', 'loans', 'binoteka'] },
  { title: 'ბიზნესი და სერვისები', ids: ['keepz', 'services'] },
];
function Index() {
  return <div className={p.list}>
    {GROUPS.map((group, g) => <div className={p.group} key={group.title}>
      <h3 className={p.groupLabel}><span className={p.index}>{String(g + 1).padStart(2, '0')}</span>{group.title}</h3>
      <ul className={p.rows}>
        {group.ids.map(id => { const item = byId[id]; return <li key={id}><a className={`${p.row} ${p.hot}`} href={item.href} {...external}>
          <span className={p.rowIcon}><ProductIcon kind={item.icon} /></span>
          <h4>{item.title}</h4>
          <p>{item.description}</p>
          <span className={p.rowArrow}><ProductIcon kind="arrow" size={18} /></span>
        </a></li>; })}
      </ul>
    </div>)}
  </div>;
}

/* D — bento: the two things emigrants use most get a live UI snippet,
   the rest sit in an open hairline grid underneath. */
const FEED = [
  { flag: '/assets/globe/flags/it.svg', who: 'ლუკა · რომი', amount: '+180 €', fresh: true },
  { flag: '/assets/emigrants/flag-gr.svg', who: 'ნინო · ათენი', amount: '+250 €' },
  { flag: '/assets/globe/flags/de.svg', who: 'გიორგი · ბერლინი', amount: '+400 €' },
  { flag: '/assets/globe/flags/es.svg', who: 'მარიამი · მადრიდი', amount: '+120 €' },
];
function Bento() {
  const remit = byId.remittances, card = byId.cards;
  const rest = products.filter(item => item !== remit && item !== card);
  return <div className={p.bento}>
    <a className={`${p.feature} ${p.featureRemit} ${p.hot}`} href={remit.href} {...external}>
      <span className={p.featureCopy}>
        <ProductIcon kind={remit.icon} size={28} className={p.cellIcon} />
        <h3>{remit.title}</h3>
        <p>{remit.description}</p>
        <More />
      </span>
      <span className={p.feed} aria-hidden="true">
        <span className={p.feedList}>
          {FEED.map(row => <span className={p.feedRow} data-fresh={row.fresh || undefined} key={row.who}>
            <img src={row.flag} width="20" height="14" alt="" />
            <span className={p.feedWho}>{row.who}</span>
            <span className={p.feedAmount}>{row.amount}</span>
            <span className={p.feedChip}>{row.fresh ? 'ახლახან' : 'ჩაირიცხა'}</span>
          </span>)}
        </span>
      </span>
    </a>
    <a className={`${p.feature} ${p.featureCard} ${p.hot}`} href={card.href} {...external}>
      <span className={p.featureCopy}>
        <ProductIcon kind={card.icon} size={28} className={p.cellIcon} />
        <h3>{card.title}</h3>
        <p>{card.description}</p>
        <More />
      </span>
      <span className={p.cardStage} aria-hidden="true">
        <span className={`${p.plastic} ${p.plasticBack}`} />
        <span className={p.plastic}>
          <i className={p.emblem} />
          <span className={p.plasticChip} />
          <span className={p.plasticNumber}>•••• 4567</span>
          <span className={p.plasticTag}>ციფრული</span>
        </span>
      </span>
    </a>
    <ul className={p.rest}>
      {rest.map(item => <li key={item.id}><a className={`${p.restItem} ${p.hot}`} href={item.href} {...external}>
        <ProductIcon kind={item.icon} className={p.cellIcon} />
        <span><h3>{item.title}</h3><p>{item.description}</p></span>
        <ProductIcon kind="arrow" size={18} className={p.cellArrow} />
      </a></li>)}
    </ul>
  </div>;
}

/* E — every product in D's lower grid style: open, hairlines only, three across. */
function Lines() {
  return <ul className={`${p.rest} ${p.restOnly}`}>
    {products.map(item => <li key={item.id}><a className={`${p.restItem} ${p.hot}`} href={item.href} {...external}>
      <ProductIcon kind={item.icon} className={p.cellIcon} />
      <span><h3>{item.title}</h3><p>{item.description}</p></span>
      <ProductIcon kind="arrow" size={18} className={p.cellArrow} />
    </a></li>)}
  </ul>;
}

// Design-review switcher, like the steps one: the choice lives in ?products=…
// and the dock swaps to these options while the section is on screen.
export const VARIANTS = [
  { id: 'cards', letter: 'A', label: 'ბარათები', Component: Cards },
  { id: 'grid', letter: 'B', label: 'ბადე', Component: Grid },
  { id: 'index', letter: 'C', label: 'სია', Component: Index },
  { id: 'bento', letter: 'D', label: 'ბენტო', Component: Bento },
  { id: 'lines', letter: 'E', label: 'ხაზები', Component: Lines },
];
const resolve = id => VARIANTS.find(v => v.id === id) || VARIANTS[0];

export default function ProductsVariants({ initial }) {
  const [id, setId] = useState(resolve(initial).id);
  const [onScreen, setOnScreen] = useState(false);
  const area = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting), { rootMargin: '-35% 0px -35% 0px' });
    observer.observe(area.current);
    return () => { observer.disconnect(); if (document.documentElement.dataset.dock === 'products') delete document.documentElement.dataset.dock; };
  }, []);
  useEffect(() => {
    if (onScreen) document.documentElement.dataset.dock = 'products';
    else if (document.documentElement.dataset.dock === 'products') delete document.documentElement.dataset.dock;
  }, [onScreen]);
  function choose(next) {
    setId(next);
    const url = new URL(window.location.href);
    url.searchParams.set('products', next);
    window.history.replaceState(null, '', url);
  }
  const { Component } = resolve(id);
  return <>
    <div ref={area}><div className={p.variantBody} key={id}><Component /></div></div>
    <div className={`${s.switcher} ${s.productsDock}`} data-visible={onScreen} inert={!onScreen || undefined}>
      <div className={s.switchGroup} role="radiogroup" aria-label="პროდუქტების სექციის ვარიანტი">
        <span className={s.switcherLabel}>პროდუქტები</span>
        {VARIANTS.map(v => <button key={v.id} type="button" role="radio" aria-checked={v.id === id} onClick={() => choose(v.id)} title={v.label}>
          <b>{v.letter}</b><span>{v.label}</span>
        </button>)}
      </div>
    </div>
  </>;
}
