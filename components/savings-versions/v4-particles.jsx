'use client';

import { useEffect, useRef } from 'react';
import SavingsBalancedGoal from './v3-balanced';

export default function SavingsParticleGoal() {
  const rootRef = useRef(null), canvasRef = useRef(null);
  useEffect(() => {
    let disposed = false, engine;
    import('./v4-particles-renderer.mjs').then(({ createSavingsParticles }) => {
      if (disposed) return;
      const forceStatic = process.env.NODE_ENV === 'development'
        && new URLSearchParams(window.location.search).get('savingsParticles') === 'static';
      engine = createSavingsParticles({ root: rootRef.current, canvas: canvasRef.current, forceStatic });
    });
    return () => { disposed = true; engine?.dispose(); };
  }, []);
  return <div className="savings-goal-v4" ref={rootRef} data-particles-state="loading">
    <div className="savings-v4-halo" aria-hidden="true" />
    <canvas className="savings-v4-canvas" ref={canvasRef} aria-hidden="true" />
    <SavingsBalancedGoal />
  </div>;
}
