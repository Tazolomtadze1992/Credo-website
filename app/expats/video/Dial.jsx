'use client';

import { BankCard } from '../offers/shared';
import { createDial } from './dial-scene.mjs';
import { Check, Ctas, Heading, StepList, useInView, useReducedMotion, useScene, useStepper } from './shared';
import v from './video.module.css';

/* E — the 15-minute call as a chronograph dial. */
export default function Dial() {
  const [ref, inView] = useInView();
  const reduce = useReducedMotion();
  const stepper = useStepper(inView && !reduce);
  const canvas = useScene(createDial, stepper.step, inView, reduce);
  return <div className={v.agWrap}>
    <div className={v.agCopy}>
      <Heading lead="An account in 15 minutes." rest="No branch, no queue.">
        One video call with a Credo specialist, from wherever you are. You hang up with a multi-currency account, Mycredo and a digital card.
      </Heading>
      <Ctas />
      <StepList {...stepper} />
    </div>
    <div className={`${v.agStage} ${v.dialStage}`} ref={ref} {...stepper.hoverProps} data-play={inView && !reduce ? true : undefined}>
      <canvas ref={canvas} className={v.fullCanvas} aria-hidden="true" />
      <div className={v.dialCard} key={stepper.step} data-on={stepper.step === 3 || undefined} aria-hidden="true">
        <BankCard kind="expat" />
        <span className={v.dialDone}><Check size={13} />Account open</span>
      </div>
    </div>
  </div>;
}
