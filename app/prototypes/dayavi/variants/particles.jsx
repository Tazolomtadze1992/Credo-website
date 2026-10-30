'use client';

import { useEffect, useRef } from 'react';
import { createParticleState, resetParticles, stepParticles, DAYAVI_MOTION } from '../../../../lib/dayavi-particle-physics.mjs';
import styles from './particles.module.css';

// Drawing gutter allows the existing repulsion physics to leave the resting logo bounds.
const DRAW_GUTTER = Math.ceil(620 * DAYAVI_MOTION.radius * DAYAVI_MOTION.force * 1.1 + 8);
let dotsPromise;
const loadDots = () => dotsPromise ||= fetch('/assets/dayavi/dayavi-dither-v2.json').then(response => {
  if (!response.ok) throw new Error('Dayavi coordinates unavailable');
  return response.json();
}).catch(error => { dotsPromise = null; throw error; });

export default function Particles() {
  const rootRef = useRef(null), canvasRef = useRef(null);
  useEffect(() => {
    const root = rootRef.current, canvas = canvasRef.current;
    const context = canvas.getContext('2d', { alpha: true });
    if (!context) return;
    const still = matchMedia('(prefers-reduced-motion: reduce)');
    const fine = matchMedia('(hover:hover) and (pointer:fine)');
    let data, state, ranges, frame = 0, last = 0, disposed = false, visible = false, bounds;
    let width = 0, height = 0, logoWidth = 0, logoHeight = 0, left = 0, top = 0, dpr = 1;
    const pointer = { active: false, x: -1000, y: -1000 };
    const paint = () => {
      if (!state || !width || !height) return;
      context.setTransform(dpr, 0, 0, dpr, DRAW_GUTTER * dpr, DRAW_GUTTER * dpr);
      context.clearRect(-DRAW_GUTTER, -DRAW_GUTTER, width + DRAW_GUTTER * 2, height + DRAW_GUTTER * 2);
      context.globalAlpha = .95;
      const dot = logoWidth / data.width * .83;
      for (const range of ranges) {
        context.fillStyle = range.color;
        for (let i = range.start; i < range.end; i += 2) context.fillRect(state.positions[i] - dot / 2, state.positions[i + 1] - dot / 2, dot, dot);
      }
      root.dataset.ready = 'true';
    };
    const wake = () => { if (!frame && state && visible && !disposed && !document.hidden && !still.matches) { last = 0; frame = requestAnimationFrame(tick); } };
    function tick(now) {
      frame = 0;
      if (!visible || disposed || document.hidden || still.matches) return;
      const dt = last ? (now - last) / 1000 : 1 / 60;
      last = now;
      const radius = logoWidth * DAYAVI_MOTION.radius;
      const metrics = stepParticles(state, pointer, dt, radius, radius * DAYAVI_MOTION.force);
      if (metrics.settled && !pointer.active) resetParticles(state);
      paint();
      root.dataset.displacement = metrics.maxDisplacement.toFixed(2);
      root.dataset.state = pointer.active ? 'interacting' : metrics.settled ? 'rest' : 'returning';
      if (!metrics.equilibrium) frame = requestAnimationFrame(tick);
    }
    const resize = () => {
      bounds = root.getBoundingClientRect(); width = bounds.width; height = bounds.height;
      if (!width || !height) return;
      dpr = Math.min(devicePixelRatio || 1, 2);
      canvas.width = Math.round((width + DRAW_GUTTER * 2) * dpr); canvas.height = Math.round((height + DRAW_GUTTER * 2) * dpr);
      if (!data) return;
      logoWidth = Math.min(620, width * .78);
      logoHeight = logoWidth * data.height / data.width;
      left = (width - logoWidth) / 2; top = (height - logoHeight) / 2;
      const homes = new Float32Array(data.groups.reduce((sum, group) => sum + group.length, 0));
      let at = 0; ranges = [];
      data.groups.forEach((group, role) => {
        const start = at;
        for (let i = 0; i < group.length; i += 2) {
          homes[at++] = left + (group[i] + .5) / data.width * logoWidth;
          homes[at++] = top + (group[i + 1] + .5) / data.height * logoHeight;
        }
        ranges.push({ start, end: at, color: data.colors[role] });
      });
      state = createParticleState(homes);
      root.dataset.count = String(homes.length / 2);
      root.dataset.state = 'rest'; paint();
    };
    const move = event => {
      if (!state || still.matches || !fine.matches || event.pointerType === 'touch') return;
      bounds = root.getBoundingClientRect();
      pointer.x = event.clientX - bounds.left; pointer.y = event.clientY - bounds.top;
      const radius = logoWidth * DAYAVI_MOTION.radius, wasActive = pointer.active;
      pointer.active = pointer.x > left - radius && pointer.x < left + logoWidth + radius && pointer.y > top - radius && pointer.y < top + logoHeight + radius;
      if (pointer.active || wasActive) wake();
    };
    const leave = () => { pointer.active = false; wake(); };
    const reconcile = () => {
      if (!visible || document.hidden || still.matches) {
        cancelAnimationFrame(frame); frame = 0; pointer.active = false;
        if (state) { resetParticles(state); paint(); }
      }
    };
    const resizer = new ResizeObserver(resize); resizer.observe(root);
    const observer = new IntersectionObserver(entries => { visible = entries[entries.length - 1].isIntersecting; reconcile(); }, { threshold: .01 }); observer.observe(root);
    root.addEventListener('pointermove', move, { passive: true }); root.addEventListener('pointerleave', leave);
    document.addEventListener('visibilitychange', reconcile); still.addEventListener('change', reconcile);
    resize(); loadDots().then(value => { if (!disposed) { data = value; resize(); } }).catch(() => { root.dataset.state = 'static'; });
    return () => { disposed = true; cancelAnimationFrame(frame); resizer.disconnect(); observer.disconnect(); root.removeEventListener('pointermove', move); root.removeEventListener('pointerleave', leave); document.removeEventListener('visibilitychange', reconcile); still.removeEventListener('change', reconcile); };
  }, []);
  return <div ref={rootRef} className={styles.scene} role="img" aria-label="და-ყა-ვი — ნაწილაკებისგან შედგენილი ლოგო, რომელიც კურსორთან იყოფა და ისევ ერთიანდება.">
    <img className={styles.poster} src="/assets/dayavi/dayavi-dither-v2.svg" alt="" aria-hidden="true" draggable="false" />
    <canvas ref={canvasRef} className={styles.canvas} style={{ inset: -DRAW_GUTTER, width: `calc(100% + ${DRAW_GUTTER * 2}px)`, height: `calc(100% + ${DRAW_GUTTER * 2}px)` }} aria-hidden="true" />
  </div>;
}
