'use client';

import { useState } from 'react';
import styles from './AppBanner.module.css';

export default function AppShowcase() {
  const [storeDownloads, setStoreDownloads] = useState(true);
  const [instantSwitch, setInstantSwitch] = useState(false);
  return <section className={`section-container ${styles.section}`} id="mycredo" aria-labelledby="mycredo-title" data-download-variant={storeDownloads ? 'stores' : 'button'}>
    <button type="button" role="switch" aria-checked={storeDownloads} aria-label="ჩამოტვირთვის ვარიანტის გადართვა" aria-controls="mycredo-download-options" className={styles.variantSwitch} data-instant={instantSwitch} onClick={event => { setInstantSwitch(event.detail === 0); setStoreDownloads(value => !value); }}>
      <span className={styles.switchTrack} aria-hidden="true"><span className={styles.switchThumb} /></span>
    </button>
    <img className={styles.background} src="/assets/mycredo/app-banner/blue-fold-v1.webp" width="1998" height="787" alt="" loading="lazy" draggable={false} />
    <div className={styles.copy}>
      <h2 id="mycredo-title">{'ყველა შენი საბანკო საქმე ერთ სივრცეში'.toUpperCase()}</h2>
      <div id="mycredo-download-options">
        {storeDownloads ? <div className={styles.downloads}>
        <a className={styles.qr} href="https://onelink.to/mycredo" target="_blank" rel="noopener noreferrer" aria-label="დაასკანერე QR კოდი MyCredo-ს გადმოსაწერად" title="დაასკანერე MyCredo-ს გადმოსაწერად">
          <img src="/assets/mycredo/app-banner/mycredo-download-qr.svg" width="99" height="99" alt="MyCredo-ს გადმოსაწერი QR კოდი" loading="lazy" />
        </a>
        <div className={styles.storeLinks}>
          <a className={styles.storeLink} href="https://apps.apple.com/app/mycredo-mobile-banking/id1535238816" target="_blank" rel="noopener noreferrer" aria-label="გადმოწერე MyCredo App Store-დან">
            <img className={styles.appleBadge} src="/assets/mycredo/app-banner/app-store-badge.svg" width="126" height="42" alt="Download on the App Store" loading="lazy" />
          </a>
          <a className={styles.storeLink} href="https://play.google.com/store/apps/details?id=ge.qwerty.credo" target="_blank" rel="noopener noreferrer" aria-label="გადმოწერე MyCredo Google Play-დან">
            <img className={styles.googleBadge} src="/assets/mycredo/app-banner/google-play-badge.png" width="646" height="250" alt="Get it on Google Play" loading="lazy" />
          </a>
        </div>
      </div> : <a href="https://onelink.to/mycredo" target="_blank" rel="noopener noreferrer" className={`action ${styles.download}`}>
          {'გადმოწერე მობაილბანკი'.toUpperCase()}
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M10 3v9m-3-3 3 3 3-3M4 13v3a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </a>}
      </div>
    </div>
    <div className={styles.artwork} aria-hidden="true">
      <div className={styles.phone}>
        <div className={styles.screen}>
          <img src="/assets/mycredo/app-banner/mycredo-home.webp" width="1170" height="2532" alt="" loading="lazy" draggable={false} />
          <div className={styles.statusBar}><span>9:41</span><i className={styles.island} /><svg width="35" height="10" viewBox="0 0 35 10" fill="none"><path d="M1 7v2M4 5v4M7 3v6M10 1v8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /><path d="M14 4a6 6 0 0 1 7 0m-5.5 2a3.6 3.6 0 0 1 4 0M17.5 8h.01" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /><rect x="25" y="2" width="8" height="6" rx="1.5" stroke="currentColor" strokeWidth=".8" /><path d="M34 4v2" stroke="currentColor" /><rect x="26.5" y="3.5" width="5" height="3" rx=".5" fill="currentColor" /></svg></div>
        </div>
      </div>
    </div>
  </section>;
}
