'use client';

import { useEffect, useRef } from 'react';

export function ArtStage({ width, height, children, className = '' }) {
  const ref = useRef(null);
  useEffect(() => {
    const element = ref.current;
    const resize = () => element.style.setProperty('--art-scale', element.clientWidth / width);
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(element);
    return () => observer.disconnect();
  }, [width]);
  return <div ref={ref} className={`art-stage ${className}`} style={{ aspectRatio: `${width} / ${height}` }} aria-hidden="true"><div className="art-canvas" style={{ width, height }}>{children}</div></div>;
}

export function CredoPhoneVideo() {
  const videoRef = useRef(null);
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) video.play().catch(() => {});
      else video.pause();
    }, { rootMargin: '120px 0px' });
    observer.observe(video);
    return () => { observer.disconnect(); video.pause(); };
  }, []);
  return <div className="loan-phone-video">
    <video ref={videoRef} src="https://tazolomtadze.com/videos/credo/thumbnail.mp4" width="234" height="512" muted loop playsInline preload="none" tabIndex={-1} aria-hidden="true" />
  </div>;
}
