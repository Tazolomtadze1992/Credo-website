'use client';

import { useEffect, useRef, useState } from 'react';
import s from '../../emigrants/steps/steps.module.css';
import Dial from './Dial.jsx';
import Engraving from './Engraving.jsx';
import Glass from './Glass.jsx';
import Interface from './Interface.jsx';
import Particles from './Particles.jsx';

export const VARIANTS = [
  { id: 'interface', letter: 'A', label: 'ინტერფეისი', Component: Interface },
  { id: 'glass', letter: 'B', label: 'მინა', Component: Glass },
  { id: 'particles', letter: 'C', label: 'ნაწილაკები', Component: Particles },
  { id: 'engraving', letter: 'D', label: 'გრავირება', Component: Engraving },
  { id: 'dial', letter: 'E', label: 'ციფერბლატი', Component: Dial },
];
const resolve = id => VARIANTS.find(v => v.id === id) || VARIANTS[0];

/* Design-review switcher for the video banking section (?video=). Its dock
   takes over from the others while the section is on screen. */
export default function VideoVariants({ initial }) {
  const [id, setId] = useState(resolve(initial).id);
  const [onScreen, setOnScreen] = useState(false);
  const area = useRef(null);
  useEffect(() => {
    const root = document.documentElement;
    const observer = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting), { rootMargin: '-35% 0px -35% 0px' });
    observer.observe(area.current);
    return () => { observer.disconnect(); if (root.dataset.dock === 'video') delete root.dataset.dock; };
  }, []);
  useEffect(() => {
    const root = document.documentElement;
    if (onScreen) root.dataset.dock = 'video';
    else if (root.dataset.dock === 'video') delete root.dataset.dock;
  }, [onScreen]);
  function choose(next) {
    setId(next);
    const url = new URL(window.location.href);
    url.searchParams.set('video', next);
    window.history.replaceState(null, '', url);
  }
  const { Component } = resolve(id);
  return <div ref={area}>
    <Component key={id} />
    <div className={`${s.switcher} ${s.videoDock}`} data-visible={onScreen} inert={!onScreen || undefined}>
      <div className={s.switchGroup} role="radiogroup" aria-label="Video banking section variant">
        <span className={s.switcherLabel}>ვიდეოზარი</span>
        {VARIANTS.map(v => <button key={v.id} type="button" role="radio" aria-checked={v.id === id} onClick={() => choose(v.id)} title={v.label}>
          <b>{v.letter}</b><span>{v.label}</span>
        </button>)}
      </div>
    </div>
  </div>;
}
