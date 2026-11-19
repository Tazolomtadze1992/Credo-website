'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createFaceScan } from '../../emigrants/steps/face-scan.mjs';
import { CARPET, Arrows } from '../ExpMark';
import { BankCard } from '../offers/shared';
import { createCubes } from './cubes.mjs';
import { Check, Ctas, Heading, StepList, useInView, useReducedMotion, useScene, useStepper } from './shared';
import v from './video.module.css';

const I = ({ d, size = 18 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d} /></svg>;
const VIDEO = 'M3.5 7.5h10v9h-10zM13.5 10.5l5-2.5v8l-5-2.5';
const CAL = 'M4.5 6h15v13.5h-15zM4.5 10h15M8.5 4v4M15.5 4v4';
const COPY = 'M8 8h11v11H8zM5 15V5h10';
const DAYS = [['Mon', 23], ['Tue', 24], ['Wed', 25], ['Thu', 26], ['Fri', 27]];
const SLOTS = ['10:00', '11:30', '14:00', '16:30'];
const FIELDS = [['Full name', 'Sam Taylor'], ['Citizenship', 'United Kingdom'], ['Passport number', '•••• •••• 4821'], ['Email', 'sam@example.com']];

function BookPanel() {
  return <>
    <header className={v.mHead}><h3>Video banking</h3><p>Talk to a Credo specialist, in English.</p></header>
    <div className={v.choice}>
      <span className={v.tile}><I d={VIDEO} /><b>Start now</b><small>Next free specialist</small></span>
      <span className={v.tile} data-pick><I d={CAL} /><b>Book a time</b><small>A slot that suits you</small></span>
    </div>
    <p className={v.mLabel}>November</p>
    <div className={v.days}>{DAYS.map(([d, n]) => <span key={n} data-pick={n === 26 || undefined}><small>{d}</small>{n}</span>)}</div>
    <div className={v.slots}>{SLOTS.map(s => <span key={s} data-pick={s === '14:00' || undefined}>{s}</span>)}</div>
    <footer className={v.mFoot}>
      <span className={v.zone}>14:00 in Tbilisi · <b>11:00 in Berlin</b></span>
      <span className={v.mBtn} data-press><span>Book video call</span><span><Check size={14} />Booked</span></span>
    </footer>
  </>;
}

function DetailsPanel() {
  return <>
    <header className={v.mHead}><h3>Your details</h3><p>As they appear in your passport.</p></header>
    <div className={v.fields}>
      {FIELDS.map(([k, val], i) => <label key={k} className={v.input} style={{ '--i': i }}><small>{k}</small><span><span>{val}</span></span></label>)}
    </div>
    <span className={v.consent}><i><Check size={12} /></i>I agree to the video call being recorded</span>
    <footer className={v.mFoot}><span className={v.zone}>Step 2 of 4</span><span className={v.mBtn} data-press data-late><span>Continue</span><span>Continue</span></span></footer>
  </>;
}

function VerifyPanel({ play }) {
  const canvas = useRef(null), scene = useRef(null);
  useEffect(() => { scene.current = createFaceScan(canvas.current); return () => scene.current.destroy(); }, []);
  useEffect(() => { if (play) scene.current.play(); else scene.current.rest(); }, [play]);
  return <>
    <header className={v.mHead}><h3>Identity check</h3><p>Hold your passport up when the specialist asks.</p></header>
    <div className={v.feed}>
      <canvas ref={canvas} aria-hidden="true" />
      <span className={v.rec}><i />Recording</span>
      <span className={v.agent}><span className={v.agentMark}><img src={CARPET} alt="" /><Arrows className={v.agentArrows} /></span>Credo specialist</span>
    </div>
    <ul className={v.checks}>
      <li style={{ '--d': '1.6s' }}><span className={v.spin} /><Check size={14} />Passport reviewed</li>
      <li style={{ '--d': '3.4s' }}><span className={v.spin} /><Check size={14} />Identity verified</li>
    </ul>
  </>;
}

function AccountPanel() {
  return <>
    <header className={`${v.mHead} ${v.done}`}><span className={v.badge}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12.5 4.5 4.5L19 7.5" pathLength="1" /></svg></span><h3>Welcome to Credo Bank</h3><p>Your multi-currency account is open.</p></header>
    <div className={v.iban} style={{ '--d': '.35s' }}><small>Account number</small><span>GE29 CD00 0000 0123 4567 89</span><I d={COPY} size={16} /></div>
    <div className={v.ccy} style={{ '--d': '.5s' }}>{[['GEL', '₾'], ['USD', '$'], ['EUR', '€']].map(([c, s]) => <span key={c}><i>{s}</i>{c}</span>)}</div>
    <div className={v.cardRow} style={{ '--d': '.7s' }}>
      <BankCard kind="expat" className={v.miniCard} />
      <span><b>Digital Visa card</b><small>Issued instantly in Mycredo</small></span>
    </div>
    <footer className={v.mFoot}><span className={v.zone}>Mycredo is ready</span><span className={v.mBtn}><span>Open Mycredo</span><span>Open Mycredo</span></span></footer>
  </>;
}
const PANELS = [BookPanel, DetailsPanel, VerifyPanel, AccountPanel];

/* A — AccessGrid's "few simple steps": a real-looking product dialog on a
   quiet grey stage with tumbling wireframe cubes. Each step plays the
   dialog the customer would actually see. */
export default function Interface() {
  const [ref, inView] = useInView();
  const reduce = useReducedMotion();
  const stepper = useStepper(inView && !reduce);
  const { step, hoverProps } = stepper;
  const cubes = useScene(createCubes, 0, inView, reduce);
  const inner = useRef(null);
  const [h, setH] = useState(null);
  useLayoutEffect(() => {
    const el = inner.current;
    const ro = new ResizeObserver(() => setH(el.offsetHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, [step]);
  const Panel = PANELS[step];
  return <div className={v.agWrap}>
    <div className={v.agCopy}>
      <Heading lead="Open an account" rest="from anywhere in the world.">
        All you need is a valid foreign passport and a video call. A Credo specialist verifies you on camera, opens your multi-currency account and issues your card.
      </Heading>
      <Ctas />
      <StepList {...stepper} />
    </div>
    <div className={v.agStage} ref={ref} {...hoverProps}>
      <canvas ref={cubes} className={v.cubes} aria-hidden="true" />
      <div className={v.modal} style={{ height: h ?? undefined }} aria-hidden="true">
        <div ref={inner} className={v.modalInner} key={step} data-play={inView && !reduce ? true : undefined}>
          <Panel play={inView && !reduce} />
        </div>
      </div>
    </div>
  </div>;
}
