'use client';

import { createEngraving } from './engraving-scene.mjs';
import { Check, Ctas, Heading, StepList, useInView, useReducedMotion, useScene, useStepper } from './shared';
import v from './video.module.css';

const CHIPS = [
  <><i className={v.liveDot} />Connected to a specialist</>,
  <><Check size={13} />Details received</>,
  <><Check size={13} />Identity verified</>,
  <><i className={v.liveDot} />Account open<span className={v.mono}>GE29 CD00 … 4567 89</span></>,
];
const CHIP_DELAY = ['1.6s', '3.1s', '3.9s', '2.3s'];

/* D — a card engraved like a banknote while the call goes on. */
export default function Engraving() {
  const [ref, inView] = useInView();
  const reduce = useReducedMotion();
  const stepper = useStepper(inView && !reduce);
  const canvas = useScene(createEngraving, stepper.step, inView, reduce);
  return <div className={v.agWrap}>
    <div className={v.agCopy}>
      <Heading lead="Your card is made" rest="while you’re still on the call.">
        A Credo specialist verifies you on camera and opens your multi-currency account. By the time you hang up, your digital card is ready in Mycredo.
      </Heading>
      <Ctas />
      <StepList {...stepper} />
    </div>
    <div className={`${v.agStage} ${v.engStage}`} ref={ref} {...stepper.hoverProps} data-play={inView && !reduce ? true : undefined}>
      <canvas ref={canvas} className={v.fullCanvas} aria-hidden="true" />
      <p className={v.ptChip} key={stepper.step} style={{ '--chip-delay': CHIP_DELAY[stepper.step] }} aria-hidden="true">{CHIPS[stepper.step]}</p>
    </div>
  </div>;
}
