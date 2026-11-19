'use client';

import { useEffect, useRef, useState } from 'react';
import s from '../../emigrants/steps/steps.module.css';
import Bento from './Bento';
import Cut from './Cut';
import Passes from './Passes';
import Saver from './Saver';
import Split from './Split';
import Wallet from './Wallet';

export const VARIANTS = [
  { id: 'cut', letter: 'A', label: 'გაჭრა', Component: Cut },
  { id: 'wallet', letter: 'B', label: 'ბარათები', Component: Wallet },
  { id: 'bento', letter: 'C', label: 'ბენტო', Component: Bento },
  { id: 'split', letter: 'D', label: 'სტრაიპი', Component: Split },
  { id: 'saver', letter: 'E', label: 'დაზოგვა', Component: Saver },
  { id: 'passes', letter: 'F', label: 'ბილეთები', Component: Passes },
];
const resolve = id => VARIANTS.find(v => v.id === id) || VARIANTS[0];

/* Design-review switcher for the Current offers section (?offers=). Its dock
   takes over from the hero's while the section is on screen. */
export default function OffersVariants({ initial }) {
  const [id, setId] = useState(resolve(initial).id);
  const [onScreen, setOnScreen] = useState(false);
  const area = useRef(null);
  useEffect(() => {
    const root = document.documentElement;
    const observer = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting), { rootMargin: '-35% 0px -35% 0px' });
    observer.observe(area.current);
    return () => { observer.disconnect(); if (root.dataset.dock === 'offers') delete root.dataset.dock; };
  }, []);
  useEffect(() => {
    const root = document.documentElement;
    if (onScreen) root.dataset.dock = 'offers';
    else if (root.dataset.dock === 'offers') delete root.dataset.dock;
  }, [onScreen]);
  function choose(next) {
    setId(next);
    const url = new URL(window.location.href);
    url.searchParams.set('offers', next);
    window.history.replaceState(null, '', url);
  }
  const { Component } = resolve(id);
  return <div ref={area}>
    <Component key={id} />
    <div className={`${s.switcher} ${s.offersDock}`} data-visible={onScreen} inert={!onScreen || undefined}>
      <div className={s.switchGroup} role="radiogroup" aria-label="Offers section variant">
        <span className={s.switcherLabel}>შეთავაზებები</span>
        {VARIANTS.map(v => <button key={v.id} type="button" role="radio" aria-checked={v.id === id} onClick={() => choose(v.id)} title={v.label}>
          <b>{v.letter}</b><span>{v.label}</span>
        </button>)}
      </div>
    </div>
  </div>;
}
