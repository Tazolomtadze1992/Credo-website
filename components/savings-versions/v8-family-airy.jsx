'use client';

import { useEffect, useRef } from 'react';

export default function CredoFamilyAiry() {
  const rootRef = useRef(null), canvasRef = useRef(null);
  useEffect(() => {
    let disposed = false, engine;
    import('./v8-family-airy-renderer.mjs').then(({ createCredoFamilyAiry }) => {
      if (disposed) return;
      const forceStatic = process.env.NODE_ENV === 'development'
        && new URLSearchParams(window.location.search).get('savingsParticles') === 'static';
      engine = createCredoFamilyAiry({ root: rootRef.current, canvas: canvasRef.current, forceStatic });
    });
    return () => { disposed = true; engine?.dispose(); };
  }, []);
  return <div className="credo-family-v8" id="credo-family" ref={rootRef} data-particles-state="loading" role="img" aria-label="კრედოს ემბლემა ლურჯი და მარჯნისფერი ნაწილაკებით. მსუბუქი ნაწილაკები ფორმის გარშემო მოძრაობს და კურსორთან ახლოს იფანტება.">
    <div className="family-v8-halo" aria-hidden="true" />
    <canvas className="family-v8-canvas" ref={canvasRef} aria-hidden="true" />
  </div>;
}
