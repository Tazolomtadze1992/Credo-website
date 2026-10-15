'use client';

import { useCallback, useState } from 'react';
import dynamic from 'next/dynamic';
import styles from './LoanShaderBackground.module.css';

// Reuse the approved snapshot without changing the saved comparison versions.
const OrganicFieldsShader = dynamic(() => import('../app/previews/loan-shader/versions/v5-organic'), { ssr: false });

export default function LoanShaderBackground() {
  const [renderer, setRenderer] = useState('loading');
  const ready = useCallback(() => setRenderer('live'), []);
  const unavailable = useCallback(() => setRenderer('fallback'), []);

  return <div className={`loan-shader-background ${styles.background}`} data-renderer={renderer} aria-hidden="true">
    <div className={styles.fallback} />
    <OrganicFieldsShader className={styles.shader} onReady={ready} onUnavailable={unavailable} />
    <div className={styles.whiteSpace} />
  </div>;
}
