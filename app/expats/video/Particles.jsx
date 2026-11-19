'use client';

import { videoSteps } from '../expats-data.mjs';
import { createParticles } from './particles-scene.mjs';
import { Check, Ctas, Heading, StepIcon, Timer, useInView, useReducedMotion, useScene, useStepper } from './shared';
import v from './video.module.css';

const CHIPS = [
  <><i className={v.liveDot} />Video call · Berlin → Tbilisi</>,
  <><Check size={13} />Details received</>,
  <><Check size={13} />Identity verified</>,
  <><i className={v.liveDot} />Account open<span className={v.mono}>GE29 CD00 … 4567 89</span></>,
];
const CHIP_DELAY = ['2.9s', '2.4s', '4.3s', '2.6s'];

/* C — the whole call as one cloud of points: the globe and the call arc,
   your passport page being read, your face being scanned, your card. */
export default function Particles() {
  const [ref, inView] = useInView();
  const reduce = useReducedMotion();
  const { step, setStep, run, next, hoverProps } = useStepper(inView && !reduce);
  const canvas = useScene(createParticles, step, inView, reduce);
  return <div className={v.ptWrap}>
    <div className={v.ptHead}>
      <Heading lead="From your passport" rest="to your account, on camera.">
        One video call takes you from wherever you are to a Credo account and card. All it asks for is a valid foreign passport.
      </Heading>
      <Ctas />
    </div>
    <div className={v.ptStage} ref={ref} {...hoverProps} data-play={inView && !reduce ? true : undefined}>
      <div className={v.ptGrid} aria-hidden="true" />
      <canvas ref={canvas} className={v.ptCanvas} aria-hidden="true" />
      <p className={v.ptChip} key={step} style={{ '--chip-delay': CHIP_DELAY[step] }} aria-hidden="true">{CHIPS[step]}</p>
    </div>
    <ol className={`${v.cols} ${v.colsLight}`}>
      {videoSteps.map((st, i) => <li key={st.id}>
        <button type="button" aria-current={i === step ? 'step' : undefined} onClick={() => setStep(i)}>
          {i === step ? <Timer run={run} onDone={next} className={v.colTimer} /> : <i className={v.colRule} />}
          <StepIcon i={i} />
          <span><b>{st.lead}</b> {st.text}</span>
        </button>
      </li>)}
    </ol>
  </div>;
}
