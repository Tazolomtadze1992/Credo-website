'use client';

import { useEffect, useRef } from 'react';
import { createMyCredoBackground } from '../lib/create-mycredo-background.mjs';
import styles from './AppShowcase.module.css';

export default function MyCredoShaderBackground({ targetRef }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current, target = targetRef.current;
    if (!canvas || !target) return;
    let renderer = null, frame = 0, visible = false, disposed = false, failed = false;
    let lastFrame = 0, elapsed = 0;

    function tick(now) {
      if (disposed || !visible || document.hidden || !renderer) return;
      if (now - lastFrame >= 1000 / 30 - 0.5) {
        elapsed += Math.min((now - lastFrame) / 1000, 0.1);
        lastFrame = now;
        renderer.render(elapsed);
      }
      frame = requestAnimationFrame(tick);
    }

    function synchronize() {
      cancelAnimationFrame(frame);
      canvas.dataset.rendering = 'false';
      if (disposed || failed || !visible || document.hidden) return;
      if (!renderer) {
        try {
          renderer = createMyCredoBackground(canvas);
          if (!renderer) { failed = true; return; }
          renderer.resize();
          renderer.render(elapsed);
          canvas.dataset.ready = 'true';
        } catch {
          failed = true;
          return;
        }
      }
      lastFrame = performance.now();
      canvas.dataset.rendering = 'true';
      frame = requestAnimationFrame(tick);
    }

    function lost(event) {
      event.preventDefault();
      cancelAnimationFrame(frame);
      canvas.dataset.ready = 'false';
      canvas.dataset.rendering = 'false';
      renderer?.dispose();
      renderer = null;
      failed = true;
    }
    function restored() { failed = false; synchronize(); }

    const resizeObserver = new ResizeObserver(() => {
      renderer?.resize();
      if (renderer && visible && !document.hidden) renderer.render(elapsed);
    });
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      synchronize();
    });
    resizeObserver.observe(target);
    intersectionObserver.observe(target);
    canvas.addEventListener('webglcontextlost', lost);
    canvas.addEventListener('webglcontextrestored', restored);
    document.addEventListener('visibilitychange', synchronize);

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      renderer?.dispose();
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      canvas.removeEventListener('webglcontextlost', lost);
      canvas.removeEventListener('webglcontextrestored', restored);
      document.removeEventListener('visibilitychange', synchronize);
    };
  }, [targetRef]);

  return <div className={styles.shaderBackground} aria-hidden="true">
    <div className={styles.referenceField}>
      <div className={styles.cobaltField} />
      <div className={styles.blueAccent} />
      <div className={styles.lowerField} />
    </div>
    <canvas ref={canvasRef} className={styles.shaderCanvas} data-ready="false" />
  </div>;
}
