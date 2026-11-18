'use client';

import { useState } from 'react';
import { CardAssemblyScene, FaceScanScene } from './CanvasScenes';
import { STEPS, TimerBar, useInView, useReducedMotion } from './shared';
import s from './steps.module.css';

// A · Stripe Atlas-style: the product acts out the journey; the list on the
// left is an accordion whose open item carries the autoplay timer.
export default function LiveCall({ Book }) {
  const SCENES = [Book, FaceScanScene, CardAssemblyScene];
  const [active, setActive] = useState(0);
  const [hold, setHold] = useState(false);
  const reduce = useReducedMotion();
  const [ref, inView] = useInView();
  const next = () => setActive(i => (i + 1) % STEPS.length);
  return <div ref={ref} className={s.live} onMouseEnter={() => setHold(true)} onMouseLeave={() => setHold(false)} onFocus={() => setHold(true)} onBlur={() => setHold(false)}>
    <ol className={s.liveList}>
      {STEPS.map((step, i) => <li key={step.id} data-active={i === active}>
        <button type="button" aria-expanded={i === active} aria-controls="live-stage" onClick={() => setActive(i)}>
          <span className={s.liveIndex}>0{i + 1}</span>{step.title}
        </button>
        <div className={s.liveDetail}><p>{step.detail}</p></div>
        {!reduce && <TimerBar active={i === active} paused={hold || !inView} onDone={next} />}
      </li>)}
    </ol>
    <div className={s.liveStage} id="live-stage" aria-live="polite">
      <div className={s.aurora} aria-hidden="true" />
      {SCENES.map((Scene, i) => <div key={i} className={s.liveScene} data-active={i === active} aria-hidden={i !== active}><Scene play={i === active && inView} /></div>)}
    </div>
  </div>;
}
