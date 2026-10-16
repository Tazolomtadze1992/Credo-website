'use client';

import { useEffect, useRef } from 'react';

export default function CredoFamilyParticles() {
  const rootRef = useRef(null), canvasRef = useRef(null);
  useEffect(() => {
    let disposed = false, engine;
    import('./v6-family-particles-renderer.mjs').then(({ createCredoFamilyParticles }) => {
      if (disposed) return;
      const forceStatic = process.env.NODE_ENV === 'development'
        && new URLSearchParams(window.location.search).get('savingsParticles') === 'static';
      engine = createCredoFamilyParticles({ root: rootRef.current, canvas: canvasRef.current, forceStatic });
    });
    return () => { disposed = true; engine?.dispose(); };
  }, []);
  return <div className="credo-family-v6" id="credo-family" ref={rootRef} data-particles-state="loading" role="img" aria-label="კრედოს ემბლემა ლურჯი და მარჯნისფერი ნაწილაკებით. კურსორთან ახლოს ნაწილაკები იშლება და შემდეგ ემბლემის ფორმას უბრუნდება.">
    <div className="family-v6-halo" aria-hidden="true" />
    <canvas className="family-v6-canvas" ref={canvasRef} aria-hidden="true" />
  </div>;
}
