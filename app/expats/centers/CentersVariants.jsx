'use client';

import { useEffect, useRef, useState } from 'react';
import s from '../../emigrants/steps/steps.module.css';
import Band from './Band.jsx';
import DotMap from './DotMap.jsx';
import Locator from './Locator.jsx';
import Night from './Night.jsx';
import Postcards from './Postcards.jsx';
import Tour from './Tour.jsx';

export const VARIANTS = [
  { id: 'locator', letter: 'A', label: 'სია და რუკა', Component: Locator },
  { id: 'night', letter: 'B', label: 'ღამის რუკა', Component: Night },
  { id: 'dots', letter: 'C', label: 'წერტილები', Component: DotMap },
  { id: 'postcards', letter: 'D', label: 'ბარათები', Component: Postcards },
  { id: 'tour', letter: 'E', label: 'ტური', Component: Tour },
  { id: 'band', letter: 'F', label: 'ახლანდელი', Component: Band },
];
const resolve = id => VARIANTS.find(v => v.id === id) || VARIANTS[0];

/* Design-review switcher for the service centers section (?centers=). */
export default function CentersVariants({ initial }) {
  const [id, setId] = useState(resolve(initial).id);
  const [onScreen, setOnScreen] = useState(false);
  const area = useRef(null);
  useEffect(() => {
    const root = document.documentElement;
    const observer = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting), { rootMargin: '-35% 0px -35% 0px' });
    observer.observe(area.current);
    return () => { observer.disconnect(); if (root.dataset.dock === 'centers') delete root.dataset.dock; };
  }, []);
  useEffect(() => {
    const root = document.documentElement;
    if (onScreen) root.dataset.dock = 'centers';
    else if (root.dataset.dock === 'centers') delete root.dataset.dock;
  }, [onScreen]);
  function choose(next) {
    setId(next);
    const url = new URL(window.location.href);
    url.searchParams.set('centers', next);
    window.history.replaceState(null, '', url);
  }
  const { Component } = resolve(id);
  return <div ref={area}>
    <Component key={id} />
    <div className={`${s.switcher} ${s.centersDock}`} data-visible={onScreen} inert={!onScreen || undefined}>
      <div className={s.switchGroup} role="radiogroup" aria-label="Service centers section variant">
        <span className={s.switcherLabel}>ცენტრები</span>
        {VARIANTS.map(v => <button key={v.id} type="button" role="radio" aria-checked={v.id === id} onClick={() => choose(v.id)} title={v.label}>
          <b>{v.letter}</b><span>{v.label}</span>
        </button>)}
      </div>
    </div>
  </div>;
}
