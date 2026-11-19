'use client';

import { useEffect, useRef, useState } from 'react';
import ProductIcon from '../../emigrants/products/ProductIcon';
import p from '../../emigrants/products/products.module.css';
import s from '../../emigrants/steps/steps.module.css';
import { CONDITIONS_URL, products } from '../expats-data.mjs';
import e from './products.module.css';

/* The emigrants products variants, in English with the expats products.
   The layouts and their styles are shared; products.module.css here only
   fits them to nine products. */

const byId = Object.fromEntries(products.map(item => [item.id, item]));
const external = { target: '_blank', rel: 'noreferrer' };
const More = () => <span className={p.more}>Learn more <ProductIcon kind="arrow" size={16} /></span>;

/* A — the current list: open, hairlines only, three across. */
function Lines() {
  return <ul className={`${p.rest} ${p.restOnly}`}>
    {products.map(item => <li key={item.id}><a className={`${p.restItem} ${p.hot}`} href={item.href} {...external}>
      <ProductIcon kind={item.icon} className={p.cellIcon} />
      <span><h3>{item.title}</h3><p>{item.description}</p></span>
      <ProductIcon kind="arrow" size={18} className={p.cellArrow} />
    </a></li>)}
  </ul>;
}

/* B — one bordered card per product. */
function Cards() {
  return <ul className={`${p.cards} ${e.three}`}>
    {products.map(item => <li key={item.id}><a className={`${p.card} ${p.hot}`} href={item.href} {...external}>
      <span className={p.cardIcon}><ProductIcon kind={item.icon} /></span>
      <h3>{item.title}</h3>
      <p>{item.description}</p>
      <More />
    </a></li>)}
  </ul>;
}

/* C — Swiss grid: hairlines only; the hovered cell gets scan-frame corners. */
function Grid() {
  return <div className={p.gridFrame}>
    <ul className={`${p.grid} ${e.three}`}>
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
    {[[0, 0], ['100%', 0], [0, '100%'], ['100%', '100%']].map(([left, top]) => <i key={`${left}${top}`} className={p.plus} style={{ left, top }} aria-hidden="true" />)}
  </div>;
}

/* D — an editorial index, grouped by what the money is for. */
const GROUPS = [
  { title: 'Moving money', ids: ['remittances', 'transfers', 'cards'] },
  { title: 'Saving and borrowing', ids: ['deposits', 'loans', 'installments'] },
  { title: 'Home, health and more', ids: ['binoteka', 'insurance', 'services'] },
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

/* E — bento: money from home and the card get a live UI snippet, the rest
   sit in an open hairline grid with a last cell to every product. */
const FEED = [
  { flag: '/assets/globe/flags/gb.svg', who: 'Emma · London', amount: '+£300', fresh: true },
  { flag: '/assets/globe/flags/us.svg', who: 'Daniel · New York', amount: '+$450' },
  { flag: '/assets/globe/flags/de.svg', who: 'Lena · Berlin', amount: '+€200' },
  { flag: '/assets/globe/flags/nl.svg', who: 'Sanne · Amsterdam', amount: '+€150' },
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
            <span className={p.feedChip}>{row.fresh ? 'Just now' : 'Received'}</span>
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
          <span className={p.plasticTag}>Digital</span>
        </span>
      </span>
    </a>
    <ul className={p.rest}>
      {rest.map(item => <li key={item.id}><a className={`${p.restItem} ${p.hot}`} href={item.href} {...external}>
        <ProductIcon kind={item.icon} className={p.cellIcon} />
        <span><h3>{item.title}</h3><p>{item.description}</p></span>
        <ProductIcon kind="arrow" size={18} className={p.cellArrow} />
      </a></li>)}
      <li className={e.allCell}><a className={`${p.restItem} ${e.all} ${p.hot}`} href={CONDITIONS_URL} {...external}>
        <span><h3>All products and conditions</h3><p>Rates, fees and terms for expats, in one place.</p></span>
        <ProductIcon kind="arrow" size={18} className={p.cellArrow} />
      </a></li>
    </ul>
  </div>;
}

// Design-review switcher: the choice lives in ?products=… and the dock swaps
// to these options while the section is on screen.
export const VARIANTS = [
  { id: 'lines', letter: 'A', label: 'ხაზები', Component: Lines },
  { id: 'cards', letter: 'B', label: 'ბარათები', Component: Cards },
  { id: 'grid', letter: 'C', label: 'ბადე', Component: Grid },
  { id: 'index', letter: 'D', label: 'სია', Component: Index },
  { id: 'bento', letter: 'E', label: 'ბენტო', Component: Bento },
];
const resolve = id => VARIANTS.find(v => v.id === id) || VARIANTS[0];

export default function ProductsVariants({ initial }) {
  const [id, setId] = useState(resolve(initial).id);
  const [onScreen, setOnScreen] = useState(false);
  const area = useRef(null);
  useEffect(() => {
    const root = document.documentElement;
    const observer = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting), { rootMargin: '-35% 0px -35% 0px' });
    observer.observe(area.current);
    return () => { observer.disconnect(); if (root.dataset.dock === 'products') delete root.dataset.dock; };
  }, []);
  useEffect(() => {
    const root = document.documentElement;
    if (onScreen) root.dataset.dock = 'products';
    else if (root.dataset.dock === 'products') delete root.dataset.dock;
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
      <div className={s.switchGroup} role="radiogroup" aria-label="Products section variant">
        <span className={s.switcherLabel}>პროდუქტები</span>
        {VARIANTS.map(v => <button key={v.id} type="button" role="radio" aria-checked={v.id === id} onClick={() => choose(v.id)} title={v.label}>
          <b>{v.letter}</b><span>{v.label}</span>
        </button>)}
      </div>
    </div>
  </>;
}
