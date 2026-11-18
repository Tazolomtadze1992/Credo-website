'use client';

import { useState } from 'react';
import { CardAssemblyScene, FaceScanScene } from './CanvasScenes';
import { STEP_MS, STEPS, useInView, useReducedMotion } from './shared';
import s from './steps.module.css';

// C · AccessGrid-style: one wide wireframe stage, short points underneath.
// The active point is outlined by a stroke that draws itself as the timer.
export default function Stage({ Book }) {
  const STAGES = [Book, FaceScanScene, CardAssemblyScene];
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduce = useReducedMotion();
  const [ref, inView] = useInView();
  const next = () => setActive(i => (i + 1) % STEPS.length);
  return <div ref={ref} className={s.stageWrap}>
    <div className={s.stageBox} aria-live="polite">
      <div className={s.stageGrid} aria-hidden="true" />
      {STAGES.map((Scene, i) => <div key={i} className={s.stageScene} data-active={i === active} data-play={i === active && inView} aria-hidden={i !== active}><Scene play={i === active && inView} /></div>)}
    </div>
    <ol className={s.stageItems}>
      {STEPS.map((step, i) => <li key={step.id} data-active={i === active}>
        {i === active && !reduce && <svg className={s.outline} aria-hidden="true"><rect x="1" y="1" rx="13" pathLength="100" style={{ animationDuration: `${STEP_MS}ms`, animationPlayState: paused || !inView ? 'paused' : 'running' }} onAnimationEnd={next} /></svg>}
        <button type="button" className={s.stageItemBtn} aria-pressed={i === active} onClick={() => setActive(i)}>
          <span className={s.stageNum}>0{i + 1}</span>
          <strong>{step.title}.</strong> {step.detail}
        </button>
        {i === active && !reduce && <button type="button" className={s.pause} onClick={() => setPaused(p => !p)} aria-label={paused ? 'გაგრძელება' : 'პაუზა'}>
          {paused ? <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true"><path d="M2 1l7 4-7 4z" fill="currentColor" /></svg> : <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true"><path d="M2 1h2v8H2zM6 1h2v8H6z" fill="currentColor" /></svg>}
        </button>}
      </li>)}
    </ol>
  </div>;
}
