'use client';

import { useEffect, useRef } from 'react';
import { createMyCredoFluid } from '../lib/create-mycredo-fluid.mjs';
import styles from './AppShowcase.module.css';

export default function MyCredoLiquidBackground({ targetRef }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current, target = targetRef.current;
    if (!canvas || !target) return;
    let fluid = null, frame = 0, visible = false, disposed = false, failed = false;
    let lastFrame = 0, lastInput = -Infinity, inside = false;
    let ready = false;
    let position = [0.5, 0.5], lastPosition = [...position];

    function tick(now) {
      if (disposed || !visible || document.hidden || !fluid) return;
      const interval = now - lastInput < 1800 ? 1000 / 60 : 1000 / 30;
      if (now - lastFrame >= interval - 0.5) {
        const dt = Math.min(2, (now - lastFrame) / (1000 / 60));
        fluid.step(dt, position, [position[0] - lastPosition[0], position[1] - lastPosition[1]], inside && now - lastInput < 120, now / 1000, now - lastInput < 8000);
        lastPosition = [...position];
        lastFrame = now;
        if (!ready) { canvas.dataset.ready = 'true'; ready = true; }
      }
      frame = requestAnimationFrame(tick);
    }

    function synchronize() {
      cancelAnimationFrame(frame);
      canvas.dataset.rendering = 'false';
      if (disposed || failed) return;
      if (!visible || document.hidden) {
        fluid?.clear();
        inside = false;
        lastInput = -Infinity;
        return;
      }
      if (!fluid) {
        try {
          fluid = createMyCredoFluid(canvas);
          fluid?.resize();
        } catch {
          canvas.getContext('webgl2')?.getExtension('WEBGL_lose_context')?.loseContext();
          failed = true;
          return;
        }
      }
      if (fluid) {
        lastFrame = performance.now();
        canvas.dataset.rendering = 'true';
        frame = requestAnimationFrame(tick);
      }
    }

    function move(event) {
      if (event.pointerType === 'touch') return;
      const bounds = target.getBoundingClientRect();
      const next = [(event.clientX - bounds.left) / bounds.width, 1 - (event.clientY - bounds.top) / bounds.height];
      if (!inside) lastPosition = [...next];
      position = next;
      inside = true;
      lastInput = performance.now();
    }
    function leave() { inside = false; }
    function lost(event) {
      event.preventDefault();
      cancelAnimationFrame(frame);
      canvas.dataset.ready = 'false';
      ready = false;
      canvas.dataset.rendering = 'false';
      fluid?.dispose();
      fluid = null;
      failed = true;
    }
    function restored() { failed = false; synchronize(); }

    const resizeObserver = new ResizeObserver(() => fluid?.resize());
    const intersectionObserver = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; synchronize(); });
    resizeObserver.observe(target);
    intersectionObserver.observe(target);
    target.addEventListener('pointermove', move, { passive: true });
    target.addEventListener('pointerleave', leave);
    target.addEventListener('pointercancel', leave);
    canvas.addEventListener('webglcontextlost', lost);
    canvas.addEventListener('webglcontextrestored', restored);
    document.addEventListener('visibilitychange', synchronize);

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      fluid?.dispose();
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      target.removeEventListener('pointermove', move);
      target.removeEventListener('pointerleave', leave);
      target.removeEventListener('pointercancel', leave);
      canvas.removeEventListener('webglcontextlost', lost);
      canvas.removeEventListener('webglcontextrestored', restored);
      document.removeEventListener('visibilitychange', synchronize);
    };
  }, [targetRef]);

  return <div className={styles.liquidBackground} aria-hidden="true">
    <div className={styles.referenceField}>
      <div className={styles.cobaltField} />
      <div className={styles.blueAccent} />
      <div className={styles.lowerField} />
    </div>
    <canvas ref={canvasRef} className={styles.fluidCanvas} style={{ position: 'absolute' }} data-ready="false" />
  </div>;
}
