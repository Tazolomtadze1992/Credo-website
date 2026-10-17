'use client';

import { useEffect, useRef, useState } from 'react';
import { BlueFieldArt } from './DesignArt';
import { ArtStage } from './LoanCardArtwork';
import MyCredoShaderBackground from './MyCredoShaderBackground';
import styles from './AppShowcase.module.css';

const APP_VIDEO = 'https://tazolomtadze.com/videos/credo/thumbnail.mp4';

export default function AppShowcase({ onDownload }) {
  const sectionRef = useRef(null);
  const videoRef = useRef(null);
  const [classic, setClassic] = useState(false);

  useEffect(() => {
    setClassic(new URLSearchParams(window.location.search).get('appBackground') === 'classic');
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    const video = videoRef.current;
    let visible = false;
    let disposed = false;

    function syncPlayback() {
      const active = visible && !document.hidden;
      section.dataset.active = String(active);
      if (active) {
        // The same recording as the loan card; load only when this section is seen.
        if (!video.getAttribute('src')) video.src = APP_VIDEO;
        video.play().then(() => {
          if (disposed || !visible || document.hidden) video.pause();
        }).catch(() => {});
      } else video.pause();
    }

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      syncPlayback();
    }, { threshold: 0.08 });

    observer.observe(section);
    document.addEventListener('visibilitychange', syncPlayback);
    return () => {
      disposed = true;
      observer.disconnect();
      document.removeEventListener('visibilitychange', syncPlayback);
      video.pause();
    };
  }, []);

  return <section ref={sectionRef} className={`mycredo ${styles.section}`} id="mycredo" aria-labelledby="mycredo-title" data-active="false" data-background={classic ? 'classic' : 'shader'}>
    {classic ? <div className={`blue-field ${styles.background}`} aria-hidden="true">
      <ArtStage width={1440} height={844}><BlueFieldArt /></ArtStage>
    </div> : <MyCredoShaderBackground targetRef={sectionRef} />}
    <h2 id="mycredo-title">{'ყველა შენი საბანკო საქმე ერთ სივრცეში'.toUpperCase()}</h2>
    <div className={`mycredo-phone ${styles.phoneSlot}`} aria-hidden="true">
      <div className={styles.phone}>
        <div className={styles.screen}>
          <video ref={videoRef} width="1170" height="2532" muted loop playsInline preload="none" tabIndex={-1} />
        </div>
      </div>
    </div>
    <button type="button" className="action action-white" onClick={onDownload}>
      {'გადმოწერე მობაილბანკი'.toUpperCase()}
      <img src="/assets/b0100.svg" width="20" height="20" alt="" />
    </button>
  </section>;
}
