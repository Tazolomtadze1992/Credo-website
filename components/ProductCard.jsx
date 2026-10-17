'use client';

import { useEffect, useRef } from 'react';
import BentoBackground from './BentoBackground';

export default function ProductCard({ title, kind, onExplore, children, background }) {
  const rootRef = useRef(null), glowRef = useRef(null), buttonRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current, glow = glowRef.current;
    const desktop = window.matchMedia('(min-width:940px) and (hover:hover) and (pointer:fine)');
    let lastMove = 0;
    const measure = () => {
      const { width, height } = root.getBoundingClientRect();
      // Stripe expands its lead payment card by 8px, and the others by 12px.
      const growY = desktop.matches ? (kind === 'loan' ? 4 : 6) : 0;
      root.style.setProperty('--bento-grow-x', `${height ? width / height * growY : 0}px`);
      root.style.setProperty('--bento-grow-y', `${growY}px`);
    };
    const move = event => {
      if (!desktop.matches || event.pointerType === 'touch') return;
      const now = performance.now();
      if (now - lastMove < 50) return;
      lastMove = now;
      const rect = root.getBoundingClientRect();
      const dx = event.clientX - rect.left - rect.width / 2;
      const dy = event.clientY - rect.top - rect.height / 2;
      if (!dx && !dy) return;
      // Project the pointer's direction onto the perimeter, as in the reference.
      const distance = Math.min(rect.width / 2 / Math.abs(dx), rect.height / 2 / Math.abs(dy));
      glow.style.transform = `translate3d(${dx * distance}px, ${dy * distance}px, 0)`;
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    desktop.addEventListener('change', measure);
    root.addEventListener('pointermove', move, { passive: true });
    return () => {
      observer.disconnect();
      desktop.removeEventListener('change', measure);
      root.removeEventListener('pointermove', move);
    };
  }, [kind]);

  function exploreFromCard(event) {
    if (event.target.closest('button, a, input, select, textarea')) return;
    buttonRef.current.focus({ preventScroll: true });
    onExplore();
  }

  return <article ref={rootRef} id={kind === 'card' ? 'bank-card' : kind === 'savings' ? 'savings' : undefined} className={`product-card product-${kind}`} onClick={exploreFromCard}>
    <div className="bento-border" aria-hidden="true">
      <div className="bento-border-color"><div ref={glowRef} className="bento-border-gradient" /></div>
    </div>
    <div className="product-heading">
      <h3>{title.toUpperCase()}</h3>
      <button ref={buttonRef} type="button" className="expand" onClick={onExplore} aria-label={`${title} — გაიგე მეტი`}>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="M13.75 6.75L10.25 6.75L10.25 5L15.5 5L15.5 10.25L13.75 10.25L13.75 6.75Z" />
          <path d="M6.75 10.25L5 10.25L5 15.5L10.25 15.5L10.25 13.75L6.75 13.75L6.75 10.25Z" />
        </svg>
      </button>
    </div>
    <div className="product-card-surface">
      {background}
      {kind !== 'loan' && kind !== 'split' && <BentoBackground />}
      <div className="product-card-content">{children}</div>
    </div>
  </article>;
}
