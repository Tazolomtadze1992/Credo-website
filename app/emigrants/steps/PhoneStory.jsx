'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, STEPS } from './shared';
import s from './steps.module.css';

// D · Vercel-style scroll story: steps scroll on the left, a sticky phone on the
// right swaps its screen for the step in the middle of the viewport. No scroll hijacking.
function BookedScreen() {
  return <div className={s.screenBooked}>
    <span className={s.screenIcon}><Check size={22} /></span>
    <strong>ზარი დაჯავშნილია</strong>
    <span>ხუთშაბათი, 26 ნოემბერი</span>
    <div className={s.screenTimes}><div><small>ათენი</small>12:00</div><div><small>თბილისი</small>14:00</div></div>
    <span className={s.screenBtn}>კალენდარში დამატება</span>
  </div>;
}

function CallScreen() {
  return <div className={s.screenCall}>
    <div className={s.screenBanker}><span>ბ</span></div>
    <strong>ბანკირი · კრედო</strong>
    <span className={s.screenTimer}>04:12</span>
    <div className={s.screenId}><i /><div><b /><b /></div><span className={s.idScan} /></div>
    <div className={s.screenControls}><i /><i /><i data-end /></div>
  </div>;
}

function AppScreen() {
  return <img className={s.screenApp} src="/assets/mycredo/app-banner/mycredo-home.webp" alt="" width="1170" height="2532" loading="lazy" />;
}

const SCREENS = [BookedScreen, CallScreen, AppScreen];

export default function PhoneStory() {
  const [active, setActive] = useState(0);
  const refs = useRef([]);
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting) setActive(Number(entry.target.dataset.index));
    }, { rootMargin: '-45% 0px -45% 0px' });
    refs.current.forEach(el => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);
  return <div className={s.story}>
    <ol className={s.storySteps}>
      {STEPS.map((step, i) => <li key={step.id} ref={el => { refs.current[i] = el; }} data-index={i} data-active={i === active}>
        <span className={s.storyNum}>0{i + 1}</span>
        <h3>{step.title}</h3>
        <p>{step.detail}</p>
      </li>)}
    </ol>
    <div className={s.storyPhoneWrap}>
      <div className={s.storyPhone} aria-hidden="true">
        <span className={s.notch} />
        {SCREENS.map((Screen, i) => <div key={i} className={s.screen} data-active={i === active}><Screen /></div>)}
      </div>
      <div className={s.storyDots} aria-hidden="true">{STEPS.map((step, i) => <i key={step.id} data-active={i === active} />)}</div>
    </div>
  </div>;
}
