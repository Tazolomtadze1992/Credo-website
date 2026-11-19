'use client';

import { useEffect, useRef, useState } from 'react';
import { CALLBACK_URL, CALL_URL, videoSteps } from '../expats-data.mjs';
import v from './video.module.css';

export { Check, useInView, useReducedMotion } from '../../emigrants/steps/shared';
export const external = { target: '_blank', rel: 'noreferrer' };
export const STEP_MS = 6200;

/* Two-tone heading, AccessGrid style: the claim in ink, the qualifier quiet. */
export function Heading({ lead, rest, children, dark = false, center = false, className = '' }) {
  return <div className={`${v.heading} ${className}`} data-dark={dark || undefined} data-center={center || undefined}>
    <h2 id="video-heading">{lead}<span>{rest}</span></h2>
    {children && <p>{children}</p>}
  </div>;
}

export function Ctas({ dark = false, className = '' }) {
  return <div className={`${v.ctas} ${className}`}>
    <a className={`${v.btn} ${dark ? v.btnLight : ''}`} href={CALL_URL} {...external}>Start a video call</a>
    <a className={`${v.btnGhost} ${dark ? v.btnGhostDark : ''}`} href={CALLBACK_URL} {...external}>Request a callback</a>
  </div>;
}

/* Steps advance on their own while the section is on screen; the active
   step's rule fills as the timer, and its animation end moves to the next. */
export function useStepper(playing) {
  const [step, setStep] = useState(0);
  const [hover, setHover] = useState(false);
  return {
    step, setStep,
    run: playing && !hover,
    next: () => setStep(s => (s + 1) % videoSteps.length),
    hoverProps: { onPointerEnter: e => { if (e.pointerType === 'mouse') setHover(true); }, onPointerLeave: () => setHover(false) },
  };
}

export function Timer({ run, onDone, className = '' }) {
  return <i className={`${v.timer} ${className}`} aria-hidden="true">
    <i style={{ animationDuration: `${STEP_MS}ms`, animationPlayState: run ? 'running' : 'paused' }} onAnimationEnd={onDone} />
  </i>;
}

const ICONS = [
  'M3.5 7.5h10v9h-10zM13.5 10.5l5-2.5v8l-5-2.5',
  'M5 4.5h10l3 3v12H5zM8 10h7M8 13h7M8 16h4',
  'M4 8V5.5A1.5 1.5 0 0 1 5.5 4H8M16 4h2.5A1.5 1.5 0 0 1 20 5.5V8M20 16v2.5a1.5 1.5 0 0 1-1.5 1.5H16M8 20H5.5A1.5 1.5 0 0 1 4 18.5V16M9 10.5h.01M15 10.5h.01M9.5 15c1.5 1.2 3.5 1.2 5 0',
  'M3.5 6.5h17v11h-17zM3.5 10h17M7 14.5h4',
];
export function StepIcon({ i, size = 16 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={ICONS[i]} /></svg>;
}

/* The step list from AccessGrid's "few simple steps": icon + short title,
   the active one in a tinted pill with its description underneath. */
export function StepList({ step, setStep, run, next, className = '' }) {
  return <ol className={`${v.steps} ${className}`}>
    {videoSteps.map((st, i) => <li key={st.id} data-active={i === step || undefined}>
      <button type="button" className={v.stepBtn} aria-current={i === step ? 'step' : undefined} onClick={() => setStep(i)}>
        <StepIcon i={i} /><span>{i + 1}. {st.title}</span>
      </button>
      <div className={v.stepBody} aria-hidden={i !== step}>
        <div>
          <p>{i === step && <Timer run={run} onDone={next} />}<b>{st.lead}</b> {st.text}</p>
        </div>
      </div>
    </li>)}
  </ol>;
}

/* Runs a canvas scene (createScene from ./canvas.mjs) while `active`, and
   tells it which step is showing. */
export function useScene(create, step, active, reduce) {
  const canvas = useRef(null), scene = useRef(null);
  useEffect(() => {
    scene.current = create(canvas.current);
    return () => scene.current.destroy();
  }, [create]);
  useEffect(() => { scene.current.setStep(step, reduce); }, [step, reduce]);
  useEffect(() => { if (active && !reduce) scene.current.start(); else scene.current.stop(); }, [active, reduce]);
  return canvas;
}
