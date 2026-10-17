'use client';

import { useEffect, useRef } from 'react';
import styles from './LoanRibbonBackground.module.css';

export default function LoanRibbonBackground() {
  const rootRef = useRef(null), canvasRef = useRef(null);
  useEffect(() => {
    const root = rootRef.current;
    // Retain the previous homepage treatment and its saved shared-flow studies.
    if (new URLSearchParams(window.location.search).get('loanBackground') === 'shared') {
      root.hidden = true;
      return;
    }
    let disposed = false, engine;
    import('../lib/create-loan-ribbon.mjs').then(({ createLoanRibbon }) => {
      if (!disposed) engine = createLoanRibbon({ root, canvas: canvasRef.current });
    }).catch(() => { if (!disposed) root.dataset.renderer = 'fallback'; });
    return () => { disposed = true; engine?.dispose(); };
  }, []);
  return <div ref={rootRef} className={`loan-ribbon-background ${styles.background}`}
    data-renderer="loading" data-direction="left-to-right" aria-hidden="true">
    <div className={styles.fallback} />
    <canvas ref={canvasRef} className={styles.canvas} style={{ position:'absolute' }} />
  </div>;
}
