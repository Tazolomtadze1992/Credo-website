'use client';

// Ported from Credo-web-variants: components/split-versions/v2-particle-logo.jsx
// (the optional ?dayaviControls=1 DialKit editor is not included).
import { useEffect, useRef } from 'react';
import './dayavi-particle-logo.css';

export default function DayaviParticleLogo() {
  const rootRef = useRef(null), canvasRef = useRef(null);
  useEffect(() => {
    let disposed = false, engine;
    import('../../lib/dayavi-particles.mjs').then(({ createDayaviParticles }) => {
      if (disposed) return;
      const forceStatic = process.env.NODE_ENV === 'development'
        && new URLSearchParams(window.location.search).get('dayaviRenderer') === 'static';
      engine = createDayaviParticles({ root: rootRef.current, canvas: canvasRef.current, forceStatic });
    }).catch(() => { if (!disposed && rootRef.current) rootRef.current.dataset.particlesState = 'static'; });
    return () => { disposed = true; engine?.dispose(); };
  }, []);
  return <div className="dayavi-artwork" data-dayavi-version="particles">
    <div ref={rootRef} className="dayavi-particle-art" data-particles-state="loading" role="img"
      aria-label="და-ყა-ვი: ლურჯი და მარჯნისფერი წერტილებისგან შექმნილი ლოგო. კურსორთან ნაწილაკები იყოფა და შემდეგ საკუთარ ადგილს უბრუნდება.">
      <div className="dayavi-particle-light" aria-hidden="true" />
      <img className="dayavi-particle-poster" src="/design-two/assets/dayavi/dayavi-dither-v2.svg" alt="" aria-hidden="true" draggable="false" />
      <canvas ref={canvasRef} className="dayavi-particle-canvas" aria-hidden="true" />
    </div>
  </div>;
}
