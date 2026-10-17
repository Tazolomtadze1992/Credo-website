'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useRef, useState } from 'react';

const DayaviDialKit = dynamic(() => import('../DayaviDialKit'), { ssr: false });

export default function DayaviParticleLogo() {
  const rootRef = useRef(null), canvasRef = useRef(null);
  const engineRef = useRef(null), settingsRef = useRef(null);
  const [controls, setControls] = useState(null);
  const updateSettings = useCallback(values => {
    settingsRef.current = values;
    engineRef.current?.update(values);
  }, []);
  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    if (query.get('dayaviControls') === '1') setControls({ mountRoot: query.get('globeControls') !== '1' });
    let disposed = false, engine;
    import('../../lib/dayavi-particles.mjs').then(({ createDayaviParticles }) => {
      if (disposed) return;
      const forceStatic = process.env.NODE_ENV === 'development'
        && new URLSearchParams(window.location.search).get('dayaviRenderer') === 'static';
      engine = createDayaviParticles({ root: rootRef.current, canvas: canvasRef.current, forceStatic });
      engineRef.current = engine;
      if (settingsRef.current) engine.update(settingsRef.current);
    }).catch(() => { if (!disposed && rootRef.current) rootRef.current.dataset.particlesState = 'static'; });
    return () => { disposed = true; engine?.dispose(); engineRef.current = null; };
  }, []);
  return <><div ref={rootRef} className="dayavi-particle-art" data-particles-state="loading" role="img"
    aria-label="და-ყა-ვი: ლურჯი და მარჯნისფერი წერტილებისგან შექმნილი ლოგო. კურსორთან ნაწილაკები იყოფა და შემდეგ საკუთარ ადგილს უბრუნდება.">
    <div className="dayavi-particle-light" aria-hidden="true" />
    <img className="dayavi-particle-poster" src="/assets/dayavi/dayavi-dither-v2.svg" alt="" aria-hidden="true" draggable="false" />
    <canvas ref={canvasRef} className="dayavi-particle-canvas" aria-hidden="true" />
  </div>
    {controls && <DayaviDialKit onSettingsChange={updateSettings} mountRoot={controls.mountRoot} />}
  </>;
}
