'use client';

import { useEffect, useRef, useState } from 'react';
import s from './steps.module.css';

// Illustrative content only: dates follow the week after 2026-11-17,
// Athens is UTC+2 and Tbilisi UTC+4 in winter.
export const STEPS = [
  { id: 'book', title: 'დაჯავშნე ვიდეოზარი', detail: 'აირჩიე დღე და საათი შენი ქვეყნის დროით — ჩვენ თბილისის დროს თავად გადავიყვანთ.' },
  { id: 'verify', title: 'გაიარე იდენტიფიკაცია', detail: 'ბანკირი ზარში დაადასტურებს შენს ვინაობას პირადობის მოწმობით ან პასპორტით.' },
  { id: 'open', title: 'გახსენი ანგარიში', detail: 'იმავე ზარში მიიღებ ანგარიშის ნომერს და ციფრულ ბარათს Mycredo-ში.' },
];

export const STEP_MS = 5600;

export function useReducedMotion() {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const read = () => setReduce(query.matches);
    read(); query.addEventListener('change', read);
    return () => query.removeEventListener('change', read);
  }, []);
  return reduce;
}

/* True while the element is at least 35% on screen — autoplay and scene
   animations wait for it, so nobody misses the start. */
export function useInView() {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: .35 });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return [ref, inView];
}

/* A thin bar whose CSS animation is the timer: when it ends, the next step starts. */
export function TimerBar({ active, paused, onDone, className = '' }) {
  if (!active) return <span className={`${s.timer} ${className}`} aria-hidden="true" />;
  return <span className={`${s.timer} ${className}`} aria-hidden="true"><span className={s.timerFill} style={{ animationDuration: `${STEP_MS}ms`, animationPlayState: paused ? 'paused' : 'running' }} onAnimationEnd={onDone} /></span>;
}

export function Check({ size = 14 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m5 12 4.5 4.5L19 7" /></svg>;
}

const days = [['ორშ', 23], ['სამ', 24], ['ოთხ', 25], ['ხუთ', 26], ['პარ', 27]];

/* Scene 1 — choosing a slot, with the local → Tbilisi time conversion. */
export function BookingScene({ play }) {
  return <div className={s.ui} data-play={play}>
    <div className={s.uiHead}><span className={s.uiDot} /><span>ვიდეოზარი ბანკირთან</span></div>
    <div className={s.days}>{days.map(([day, date], i) => <span key={date} className={s.day} data-picked={i === 3}><small>{day}</small>{date}</span>)}</div>
    <div className={s.zones}>
      <div className={s.zone}><small><img src="/assets/emigrants/flag-gr.svg" alt="" width="16" height="11" />ათენი</small><strong>12:00</strong></div>
      <svg className={s.zoneArrow} width="36" height="12" viewBox="0 0 36 12" fill="none" aria-hidden="true"><path d="M1 6h32m-5-5 5 5-5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
      <div className={s.zone}><small><img src="/assets/globe/flags/ge.svg" alt="" width="16" height="11" />თბილისი</small><strong>14:00</strong></div>
    </div>
    <div className={s.confirm}><span className={s.confirmIdle}>დაადასტურე</span><span className={s.confirmDone}><Check /> დაჯავშნილია · ხუთ, 26 ნოემბერი</span></div>
  </div>;
}

/* Scene 2 — the video call: banker tile, self view, ID card scan. */
export function VerifyScene({ play }) {
  return <div className={s.call} data-play={play}>
    <div className={s.callVideo}>
      <div className={s.banker}><span>ბ</span></div>
      <span className={s.callName}>ბანკირი · კრედო</span>
      <div className={s.selfView}><span>შენ</span></div>
      <div className={s.idCard}>
        <div className={s.idPhoto} />
        <div className={s.idLines}><i /><i /><i /></div>
        <span className={s.idScan} />
      </div>
    </div>
    <div className={s.callBar}><span /><span /><span className={s.callEnd} /></div>
    <div className={s.verified}><Check /> ვინაობა დადასტურებულია</div>
  </div>;
}

/* Scene 3 — account number appears, then the digital card. */
export function AccountScene({ play }) {
  return <div className={s.account} data-play={play}>
    <div className={s.ui}>
      <div className={s.uiHead}><span className={s.uiDot} data-tone="green" /><span>ანგარიში გახსნილია</span></div>
      <small className={s.ibanLabel}>ანგარიშის ნომერი</small>
      <div className={s.iban}><span>GE29 CD00 0000 0123 4567 89</span></div>
      <div className={s.accountRows}><span>მიმდინარე ანგარიში</span><span>GEL · EUR · USD</span></div>
    </div>
    <div className={s.card}><span className={s.cardBrand}>CREDO</span><span className={s.cardChip} /><span className={s.cardNum}>•••• 4821</span><span className={s.cardMc}><i /><i /></span></div>
  </div>;
}

export const SCENES = [BookingScene, VerifyScene, AccountScene];
