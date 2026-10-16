'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';

const GlobeDialKit = dynamic(() => import('./GlobeDialKit'), { ssr: false });

export default function TransferGlobe() {
  const rootRef = useRef(null), canvasRef = useRef(null), labelRefs = useRef([]), engineRef = useRef(null);
  const [paused, setPaused] = useState(false);
  const [ready, setReady] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [staticFallback, setStaticFallback] = useState(false);
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
      setReduced(reduce); engineRef.current?.setReduced(reduce);
    };
    readPreference(); preference.addEventListener('change', readPreference);
    import('../lib/create-transfer-globe.mjs').then(({ createTransferGlobe }) => {
      if (disposed) return;
      engineRef.current = createTransferGlobe({ root: rootRef.current, canvas: canvasRef.current, labels: labelRefs.current, reduced: preference.matches || forceReduced, onReady: ({ staticFallback }) => { if (!disposed) { setReady(true); setStaticFallback(staticFallback); } } });
      if (framingRef.current) engineRef.current.setFraming(framingRef.current);
    });
    return () => { disposed = true; preference.removeEventListener('change', readPreference); engineRef.current?.dispose(); engineRef.current = null; };
  }, []);
  useEffect(() => { engineRef.current?.setPaused(paused); }, [paused]);
  return <><div className="transfer-globe" id="transfer-globe" ref={rootRef} data-globe-state="loading">
    <canvas className="transfer-globe-canvas" ref={canvasRef} aria-hidden="true" />
    <div className="transfer-globe-labels" aria-hidden="true">
      {[0, 1, 2, 3].map(i => <div className="transfer-label" key={i} ref={el => { labelRefs.current[i] = el; }}><span className="transfer-flag"><img src="/assets/globe/flags/ge.svg" alt="" /></span><span className="transfer-label-text"><span data-amount>₾250</span><span data-currency>GEL</span></span></div>)}
    </div>
    {ready && !reduced && !staticFallback && <button type="button" className="globe-playback" aria-label={paused ? 'გლობუსის ანიმაციის გაგრძელება' : 'გლობუსის ანიმაციის შეჩერება'} aria-pressed={paused} onClick={() => setPaused(value => !value)} title={paused ? 'გაგრძელება' : 'პაუზა'}><svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">{paused ? <path d="M4 2.5 11 7 4 11.5Z" fill="currentColor" /> : <path d="M4 3v8m6-8v8" fill="none" stroke="currentColor" strokeWidth="1.6" />}</svg></button>}
  </div>{controlsEnabled && <GlobeDialKit onFramingChange={changeFraming} />}</>;
}
