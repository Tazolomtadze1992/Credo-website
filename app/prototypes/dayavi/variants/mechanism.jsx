'use client';

import { useEffect, useRef } from 'react';
import art from './mechanism-art.json';
import { mechanismPose, tourAt, PAYMENT_MODEL } from './model.mjs';
import styles from './mechanism.module.css';
import '../anatomy.css';

export default function Mechanism() {
  const rootRef = useRef(null), rangeRef = useRef(null);
  useEffect(() => {
    const root = rootRef.current, input = rangeRef.current;
    const still = matchMedia('(prefers-reduced-motion: reduce)');
    const head = root.querySelector('[data-cutting-head]');
    const headVector = head.dataset.press.split(' ').map(Number);
    const tickets = [...root.querySelectorAll('[data-ticket]')].map(element => ({ element, vector: element.dataset.spread.split(' ').map(Number) }));
    const price = root.querySelector('[data-purchase-ink]');
    const inks = [...root.querySelectorAll('[data-payment-ink]')];
    let visible = false, frame = 0, previous = 0, clock = 0, held = false, keyboard = false;
    let value = still.matches ? 1 : 0, target = value;
    const draw = () => {
      const pose = mechanismPose(value);
      head.style.transform = `translate(${headVector[0] * pose.press}px,${headVector[1] * pose.press}px)`;
      tickets.forEach(({ element, vector }) => { element.style.transform = `translate(${vector[0] * pose.spread}px,${vector[1] * pose.spread}px)`; });
      inks.forEach(element => { element.style.opacity = pose.paymentInk; });
      price.style.opacity = pose.totalInk;
      root.dataset.progress = value.toFixed(3);
      root.dataset.spread = pose.spread.toFixed(3);
      root.dataset.press = pose.press.toFixed(3);
    };
    const run = () => { if (!frame && visible && !document.hidden) { previous = 0; frame = requestAnimationFrame(tick); } };
    function tick(now) {
      frame = 0;
      if (!visible || document.hidden) return;
      const dt = previous ? Math.min((now - previous) / 1000, 1 / 30) : 1 / 60; previous = now;
      if (!held && !still.matches) { clock += dt; target = tourAt(clock); }
      value = still.matches ? target : value + (target - value) * (1 - Math.exp(-dt / .18));
      if (Math.abs(target - value) < .0001) value = target;
      draw();
      if (!still.matches && (!held || value !== target)) frame = requestAnimationFrame(tick);
    }
    const hold = () => { held = true; target = value; };
    const inputChange = () => { held = true; target = Number(input.value) / 100; input.setAttribute('aria-valuetext', target > .72 ? `${PAYMENT_MODEL.count} გადახდა, თითო ${PAYMENT_MODEL.payment} ლარი` : `ერთი შენაძენი, ${PAYMENT_MODEL.total} ლარი`); run(); };
    const pointerMove = event => {
      if (still.matches || event.pointerType === 'touch') return;
      const bounds = root.getBoundingClientRect();
      held = true; target = Math.max(0, Math.min(1, ((event.clientX - bounds.left) / bounds.width - .16) / .68));
      input.value = String(Math.round(target * 100)); run();
    };
    const release = () => { if (keyboard) return; held = false; clock = 1.5 + value * 4.2; run(); };
    const focus = () => { keyboard = true; hold(); };
    const blur = () => { keyboard = false; release(); };
    const visibility = () => { if (document.hidden) { cancelAnimationFrame(frame); frame = 0; } else run(); };
    const reduction = () => { cancelAnimationFrame(frame); frame = 0; value = target = still.matches ? 1 : 0; clock = 0; draw(); run(); };
    root.addEventListener('pointerenter', hold); root.addEventListener('pointermove', pointerMove, { passive: true }); root.addEventListener('pointerleave', release);
    input.addEventListener('input', inputChange); input.addEventListener('focus', focus); input.addEventListener('blur', blur);
    document.addEventListener('visibilitychange', visibility); still.addEventListener('change', reduction);
    const observer = new IntersectionObserver(entries => { visible = entries[entries.length - 1].isIntersecting; if (visible) run(); else { cancelAnimationFrame(frame); frame = 0; } }, { threshold: .01 }); observer.observe(root);
    draw();
    return () => { cancelAnimationFrame(frame); observer.disconnect(); root.removeEventListener('pointerenter', hold); root.removeEventListener('pointermove', pointerMove); root.removeEventListener('pointerleave', release); input.removeEventListener('input', inputChange); input.removeEventListener('focus', focus); input.removeEventListener('blur', blur); document.removeEventListener('visibilitychange', visibility); still.removeEventListener('change', reduction); };
  }, []);
  return <div ref={rootRef} className={`${styles.scene} iso`} data-theme="light">
    <div className={styles.drawing} dangerouslySetInnerHTML={{ __html: art.svg }} />
    <input ref={rangeRef} className={styles.control} type="range" min="0" max="100" defaultValue="0" aria-label="შენაძენის რვა გადახდად დაყოფა" aria-valuetext="ერთი შენაძენი, 1200 ლარი" />
  </div>;
}
