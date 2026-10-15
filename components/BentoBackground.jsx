'use client';

import { useEffect, useRef } from 'react';

export default function BentoBackground() {
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    let inView = false;
    const update = () => {
      root.dataset.active = String(inView && document.visibilityState !== 'hidden');
    };
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      update();
    }, { rootMargin: '120px' });

    observer.observe(root);
    document.addEventListener('visibilitychange', update);
    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', update);
    };
  }, []);

  return <div ref={rootRef} className="bento-background" data-active="false" aria-hidden="true">
    <span className="bento-background-pool bento-background-blue" />
    <span className="bento-background-pool bento-background-coral" />
    <span className="bento-background-pool bento-background-peach" />
    <span className="bento-background-clear" />
  </div>;
}
