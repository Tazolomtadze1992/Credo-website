'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';

const GlobeDialKit = dynamic(() => import('./GlobeDialKit'), { ssr: false });

export default function TransferGlobe() {
  const rootRef = useRef(null), canvasRef = useRef(null), labelRefs = useRef([]), engineRef = useRef(null);
  const [controlsEnabled, setControlsEnabled] = useState(false);
  const framingRef = useRef(null);
  const changeFraming = useCallback(values => {
    framingRef.current = values;
    engineRef.current?.setFraming(values);
  }, []);
  useEffect(() => {
    let disposed = false;
    setControlsEnabled(new URLSearchParams(window.location.search).get('globeControls') === '1');
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    // Development-only preview for checking the same reduced-motion branch.
    const forceReduced = process.env.NODE_ENV === 'development' && new URLSearchParams(window.location.search).get('globeMotion') === 'reduce';
    const readPreference = () => {
      const reduce = preference.matches || forceReduced;
      engineRef.current?.setReduced(reduce);
    };
    readPreference(); preference.addEventListener('change', readPreference);
    import('../lib/create-transfer-globe.mjs').then(({ createTransferGlobe }) => {
      if (disposed) return;
      engineRef.current = createTransferGlobe({ root: rootRef.current, canvas: canvasRef.current, labels: labelRefs.current, reduced: preference.matches || forceReduced });
      if (framingRef.current) engineRef.current.setFraming(framingRef.current);
    });
    return () => { disposed = true; preference.removeEventListener('change', readPreference); engineRef.current?.dispose(); engineRef.current = null; };
  }, []);
  return <><div className="transfer-globe" id="transfer-globe" ref={rootRef} data-globe-state="loading">
    <canvas className="transfer-globe-canvas" ref={canvasRef} aria-hidden="true" />
    <div className="transfer-globe-labels" aria-hidden="true">
      {[0, 1, 2, 3].map(i => <div className="transfer-label" key={i} ref={el => { labelRefs.current[i] = el; }}><span className="transfer-flag"><img src="/assets/globe/flags/ge.svg" alt="" /></span><span className="transfer-label-text"><span data-amount>₾250</span><span data-currency>GEL</span></span></div>)}
    </div>
  </div>{controlsEnabled && <GlobeDialKit onFramingChange={changeFraming} />}</>;
}
