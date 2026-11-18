'use client';

import { useEffect, useState } from 'react';
import { BOOK_SCENES, resolveBook } from './CanvasScenes';
import LiveCall from './LiveCall';
import Stage from './Stage';
import s from './steps.module.css';

// Design-review switcher for the "how it works" section. The choice lives in
// ?steps=… and ?book=… (shareable, survive reload); remove the switcher once one is picked.
export const VARIANTS = [
  { id: 'live', letter: 'A', label: 'ცოცხალი ზარი', Component: LiveCall },
  { id: 'stage', letter: 'C', label: 'სცენა', Component: Stage },
];

export const resolveVariant = id => VARIANTS.find(v => v.id === id) || VARIANTS[0];

export default function StepsVariants({ initial, initialBook }) {
  const [id, setId] = useState(resolveVariant(initial).id);
  const [book, setBook] = useState(resolveBook(initialBook).id);
  useEffect(() => {
    const onPop = () => {
      const params = new URL(window.location.href).searchParams;
      setId(resolveVariant(params.get('steps')).id);
      setBook(resolveBook(params.get('book')).id);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);
  function remember(key, value) {
    const url = new URL(window.location.href);
    url.searchParams.set(key, value);
    window.history.replaceState(null, '', url);
  }
  const { Component } = resolveVariant(id);
  const { Scene } = resolveBook(book);
  return <>
    {/* keyed on both choices, so a switch restarts the section at step 1 */}
    <div className={s.variantBody} key={`${id}-${book}`}><Component Book={Scene} /></div>
    <div className={s.switcher}>
      <div className={s.switchGroup} role="radiogroup" aria-label="ნაბიჯების სექციის ვარიანტი">
        <span className={s.switcherLabel}>ნაბიჯები</span>
        {VARIANTS.map(v => <button key={v.id} type="button" role="radio" aria-checked={v.id === id} onClick={() => { setId(v.id); remember('steps', v.id); }} title={v.label}>
          <b>{v.letter}</b><span>{v.label}</span>
        </button>)}
      </div>
      <i className={s.switchDivider} aria-hidden="true" />
      <div className={s.switchGroup} role="radiogroup" aria-label="პირველი ნაბიჯის ანიმაცია">
        <span className={s.switcherLabel}>ნაბიჯი 1</span>
        {BOOK_SCENES.map((b, i) => <button key={b.id} type="button" role="radio" aria-checked={b.id === book} onClick={() => { setBook(b.id); remember('book', b.id); }} title={b.label}>
          <b>{i + 1}</b><span>{b.label}</span>
        </button>)}
      </div>
    </div>
  </>;
}
