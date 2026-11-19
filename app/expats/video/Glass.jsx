'use client';

import { videoSteps } from '../expats-data.mjs';
import { BankCard } from '../offers/shared';
import { Check, Ctas, Heading, StepIcon, Timer, useInView, useReducedMotion, useStepper } from './shared';
import v from './video.module.css';

/* The cards around the centre: what the account opens up. Out of focus on purpose. */
const GHOSTS = [
  { label: 'GEL account', glyph: '₾' }, { label: 'Mycredo', glyph: '' }, { label: 'USD account', glyph: '$' },
  { label: 'Transfers', glyph: '' }, { label: 'EUR account', glyph: '€' },
  { label: 'Deposits', glyph: '' }, { label: 'Mastercard', glyph: '' }, { label: 'Exchange', glyph: '' },
];
const Wave = () => <svg className={v.ghostWave} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M8.5 8.5a5 5 0 0 1 0 7M12 6a8.5 8.5 0 0 1 0 12M15.5 3.5a12 12 0 0 1 0 17" /></svg>;
const ROWS = [['Full name', 'Sam Taylor'], ['Citizenship', 'United Kingdom'], ['Passport', '•••• •••• 4821']];

/* B — AccessGrid's dark card wall: a field of out-of-focus glass cards and
   one sharp card in the middle that becomes, step by step, your Credo card. */
export default function Glass() {
  const [ref, inView] = useInView();
  const reduce = useReducedMotion();
  const { step, setStep, run, next, hoverProps } = useStepper(inView && !reduce);
  function tilt(e) {
    if (e.pointerType !== 'mouse' || reduce) return;
    const box = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mx', ((e.clientX - box.left) / box.width - .5).toFixed(3));
    e.currentTarget.style.setProperty('--my', ((e.clientY - box.top) / box.height - .5).toFixed(3));
  }
  return <div className={v.glassPanel}>
    <Heading dark center lead="Your account and card," rest="one video call away.">
      No branch, no queue. A Credo specialist meets you on camera and opens your multi-currency account — with a digital card ready the moment you’re done.
    </Heading>

    <div className={v.field} ref={ref} data-step={step} data-play={inView && !reduce ? true : undefined} onPointerMove={tilt} {...hoverProps} aria-hidden="true">
      {GHOSTS.map((g, i) => <span key={g.label} className={v.ghost} data-at={i}>
        <span className={v.ghostTop}><b>{g.glyph}</b><Wave /></span>
        <span className={v.ghostFoot}><span>{g.label}</span><i /></span>
      </span>)}

      <div className={v.hero}>
        <div className={v.face} data-on={step === 0 || undefined}>
          <span className={v.camRings}><i /><i /><i /></span>
          <svg className={v.camArt} viewBox="0 0 64 64" fill="none" strokeLinecap="round" strokeLinejoin="round"><rect x="10" y="20" width="30" height="24" rx="5" pathLength="1" /><path d="M40 28l14-7v22l-14-7z" pathLength="1" /></svg>
          <p className={v.faceTitle}>Video call</p>
          <p className={v.faceSub}>Connecting you to a specialist<span className={v.dots}><i /><i /><i /></span></p>
        </div>
        <div className={`${v.face} ${v.faceForm}`} data-on={step === 1 || undefined}>
          {ROWS.map(([k, val], i) => <span key={k} className={v.gRow} style={{ '--i': i }}><small>{k}</small><span>{val}</span></span>)}
          <span className={v.gConsent}><i><Check size={10} /></i>Call recording agreed</span>
        </div>
        <div className={v.face} data-on={step === 2 || undefined}>
          <svg className={v.passArt} viewBox="0 0 220 150" fill="none" strokeLinecap="round">
            <rect x="1" y="1" width="218" height="148" rx="10" pathLength="1" />
            <rect x="16" y="22" width="52" height="66" rx="5" pathLength="1" />
            <path d="M84 30h80M84 46h104M84 62h64M84 78h92" pathLength="1" />
            <path d="M16 112h188M16 128h188" className={v.mrz} />
          </svg>
          <span className={v.beam} />
          <span className={v.okChip}><Check size={12} />Identity verified</span>
        </div>
        <div className={`${v.face} ${v.faceCard}`} data-on={step === 3 || undefined}>
          <BankCard kind="expat" className={v.heroCard} />
        </div>
      </div>
    </div>

    <ol className={v.cols}>
      {videoSteps.map((st, i) => <li key={st.id}>
        <button type="button" aria-current={i === step ? 'step' : undefined} onClick={() => setStep(i)}>
          {i === step ? <Timer run={inView && !reduce && run} onDone={next} className={v.colTimer} /> : <i className={v.colRule} />}
          <StepIcon i={i} />
          <span><b>{st.lead}</b> {st.text}</span>
        </button>
      </li>)}
    </ol>
    <Ctas dark className={v.glassCtas} />
  </div>;
}
