'use client';

import { useEffect, useRef, useState } from 'react';

export default function BankCard3D({ children }) {
  const rootRef = useRef(null), canvasRef = useRef(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const ribbonVersion = new URLSearchParams(window.location.search).get('cardRibbon') === 'original' ? 'original' : 'polished';
    rootRef.current.dataset.cardRibbonVersion = ribbonVersion;
    let disposed = false, started = false, engine;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || started) return;
      started = true; observer.disconnect();
      import('../lib/create-bank-card.mjs').then(({ createBankCard }) => {
        if (disposed) return;
        engine = createBankCard({
          root: rootRef.current,
          canvas: canvasRef.current,
          ribbonVersion,
          onReady: () => { if (!disposed) setReady(true); },
          onFallback: () => { if (!disposed) setReady(false); },
        });
      }).catch(() => { /* Keep the original artwork if the renderer cannot load. */ });
    }, { rootMargin: '240px' });
    observer.observe(rootRef.current);
    return () => { disposed = true; observer.disconnect(); engine?.dispose(); };
  }, []);
  return <div ref={rootRef} className="bank-card-3d" data-ready={ready} aria-hidden="true">
    <canvas ref={canvasRef} className="bank-card-3d-canvas" />
    <div className="bank-card-3d-fallback">{children}</div>
  </div>;
}
