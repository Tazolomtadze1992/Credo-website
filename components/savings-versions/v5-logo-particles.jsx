'use client';

import { useEffect, useRef } from 'react';
import SavingsBalancedGoal from './v3-balanced';

export default function SavingsLogoParticleGoal() {
  const rootRef = useRef(null), canvasRef = useRef(null);
  useEffect(() => {
    let disposed = false, engine;
    import('./v5-logo-particles-renderer.mjs').then(({ createSavingsLogoParticles }) => {
      if (disposed) return;
      const forceStatic = process.env.NODE_ENV === 'development'
        && new URLSearchParams(window.location.search).get('savingsParticles') === 'static';
      engine = createSavingsLogoParticles({ root: rootRef.current, canvas: canvasRef.current, forceStatic });
    });
    return () => { disposed = true; engine?.dispose(); };
  }, []);
  return <div className="savings-goal-v5" ref={rootRef} data-particles-state="loading">
    <div className="savings-v5-halo" aria-hidden="true" />
    <canvas className="savings-v5-canvas" ref={canvasRef} aria-hidden="true" />
    <SavingsBalancedGoal />
  </div>;
}
