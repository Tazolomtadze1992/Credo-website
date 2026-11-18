'use client';

import { useEffect, useRef } from 'react';
import { createCalendarScene } from './book-calendar.mjs';
import { createClocksScene } from './book-clocks.mjs';
import { createGlobeScene } from './book-globe.mjs';
import { createCardAssembly } from './card-assembly.mjs';
import { createFaceScan } from './face-scan.mjs';
import { Check, useReducedMotion } from './shared';
import s from './steps.module.css';

/* Mounts a canvas scene; it plays from the start whenever `play` turns on
   and shows its finished frame otherwise (and always, under reduced motion). */
function useCanvasScene(create, play) {
  const canvas = useRef(null), scene = useRef(null);
  const reduce = useReducedMotion();
  useEffect(() => {
    scene.current = create(canvas.current);
    return () => scene.current.destroy();
  }, [create]);
  useEffect(() => {
    if (play && !reduce) scene.current.play(); else scene.current.rest();
  }, [play, reduce]);
  return canvas;
}

export function FaceScanScene({ play }) {
  const canvas = useCanvasScene(createFaceScan, play);
  return <div className={s.canvasScene} data-play={play}>
    <canvas ref={canvas} className={s.canvas} aria-hidden="true" />
    <div className={s.sceneChip} style={{ '--chip-delay': '3.75s' }}><Check size={13} /> ვინაობა დადასტურებულია</div>
  </div>;
}

export function CardAssemblyScene({ play }) {
  const canvas = useCanvasScene(createCardAssembly, play);
  return <div className={s.canvasScene} data-play={play}>
    <canvas ref={canvas} className={s.canvas} aria-hidden="true" />
    <div className={s.sceneChip} style={{ '--chip-delay': '3.9s' }}><span className={s.chipDot} /><span className={s.chipLabel}>ანგარიში გახსნილია ·</span> <span className={s.mono}>GE29 CD00 … 4567 89</span></div>
  </div>;
}

/* Step 1 candidates — all end on the same booked slot. */
function bookingScene(create, chipDelay) {
  return function BookingCanvasScene({ play }) {
    const canvas = useCanvasScene(create, play);
    return <div className={s.canvasScene} data-play={play}>
      <canvas ref={canvas} className={s.canvas} aria-hidden="true" />
      <div className={s.sceneChip} style={{ '--chip-delay': chipDelay }}><Check size={13} /> ზარი დაჯავშნილია<span className={s.chipLabel}> · ხუთ, 26 ნოემბერი</span></div>
    </div>;
  };
}

export const BOOK_SCENES = [
  { id: 'clocks', label: 'საათები', Scene: bookingScene(createClocksScene, '3.35s') },
  { id: 'globe', label: 'გლობუსი', Scene: bookingScene(createGlobeScene, '3.1s') },
  { id: 'calendar', label: 'კალენდარი', Scene: bookingScene(createCalendarScene, '3.75s') },
];
export const resolveBook = id => BOOK_SCENES.find(b => b.id === id) || BOOK_SCENES[0];
