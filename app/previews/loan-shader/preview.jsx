'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { versions, versionById, latestVersion, comparisonById, legacyComparisonId } from './versions/catalog';
import styles from './preview.module.css';

const shaders = {
  curved: dynamic(() => import('./versions/v2-curved'), { ssr: false }),
  flowing: dynamic(() => import('./versions/v3-flowing'), { ssr: false }),
  soft: dynamic(() => import('./versions/v4-soft'), { ssr: false }),
  organic: dynamic(() => import('./versions/v5-organic'), { ssr: false }),
};

function LoanCard({ version, backgroundOnly }) {
  const [renderer, setRenderer] = useState('loading');
  const videoRef = useRef(null);
  const ready = useCallback(() => setRenderer('live'), []);
  const unavailable = useCallback(() => setRenderer('fallback'), []);
  const ShaderView = shaders[version.id];

  useEffect(() => {
    const video = videoRef.current;
    if (backgroundOnly) video.pause();
    else video.play().catch(() => {});
    return () => video.pause();
  }, [backgroundOnly]);

  return <figure className={styles.study}>
    <figcaption className={styles.caption}>
      <span><strong>{version.number} · {version.name}</strong><span className={styles.versionLabel}>{version.saved ? 'Saved' : 'New'}</span></span>
      <span className={styles.motionStatus} role="status"><i data-state={renderer} />{renderer === 'live' ? 'Live · slow flow' : renderer === 'fallback' ? 'Static fallback' : 'Starting…'}</span>
    </figcaption>
    <article className={styles.card} data-background-only={backgroundOnly} data-renderer={renderer} data-version={version.id} aria-label={`${version.number} ${version.name} loan card`}>
      <div className={styles.field}>
        <div className={styles.fallback} />
        <ShaderView className={styles.shader} onReady={ready} onUnavailable={unavailable} />
      </div>
      <div className={styles.whiteSpace} />
      <header className={styles.cardHeading}>
        <h2>{'მიიღე სესხი სახლიდან გაუსვლელად'.toUpperCase()}</h2>
        <span className={styles.corner} aria-hidden="true"><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M14 5H19V10M10 19H5V14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="square" /></svg></span>
      </header>
      <div className={styles.artwork} aria-hidden="true">
        <div className={styles.phone}>
          <video ref={videoRef} src="https://tazolomtadze.com/videos/credo/thumbnail.mp4" width="234" height="512" muted loop playsInline autoPlay preload="auto" tabIndex={-1} />
        </div>
      </div>
    </article>
  </figure>;
}

export default function LoanPreview({ initialVersion, initialCompare = false, initialAgainst }) {
  const [selected, setSelected] = useState(versionById(initialVersion).id);
  const [against, setAgainst] = useState(comparisonById(versionById(initialVersion).id, initialAgainst).id);
  const [compare, setCompare] = useState(initialCompare);
  const [backgroundOnly, setBackgroundOnly] = useState(false);
  const version = versionById(selected);
  const partner = comparisonById(selected, against);
  const shownVersions = compare
    ? selected === latestVersion.id ? [partner, version] : [version, partner]
    : [version];

  useEffect(() => {
    const restore = () => {
      const query = new URLSearchParams(window.location.search);
      const id = versionById(query.get('version')).id;
      const comparing = query.get('compare') === '1';
      const target = query.get('against') || (comparing ? legacyComparisonId(id) : undefined);
      setSelected(id);
      setCompare(comparing);
      setAgainst(comparisonById(id, target).id);
    };
    window.addEventListener('popstate', restore);
    return () => window.removeEventListener('popstate', restore);
  }, []);

  function updateAddress(nextVersion, nextCompare, nextAgainst) {
    const query = new URLSearchParams();
    query.set('version', nextVersion);
    if (nextCompare) {
      query.set('compare', '1');
      query.set('against', nextAgainst);
    }
    window.history.pushState(null, '', `?${query.toString()}`);
  }

  function selectVersion(id) {
    if (id === selected) return;
    const target = comparisonById(id, against).id;
    setSelected(id);
    setAgainst(target);
    updateAddress(id, compare, target);
  }

  function toggleCompare() {
    setCompare(!compare);
    updateAddress(selected, !compare, partner.id);
  }

  function selectComparison(id) {
    setAgainst(id);
    updateAddress(selected, compare, id);
  }

  return <main className={styles.page}>
    <header className={styles.intro}>
      <p className={styles.eyebrow}>CREDO / LOAN CARD STUDIES</p>
      <div className={styles.titleRow}><h1>ციფრული სესხი</h1><span className={styles.badge}>Separate preview</span></div>
      <p className={styles.description}>Saved versions stay here. Switch between them or choose any two treatments to compare.</p>
      <nav className={styles.versionPicker} aria-label="Saved shader versions">
        {versions.map(item => <button key={item.id} type="button" aria-pressed={selected === item.id} onClick={() => selectVersion(item.id)}><span>{item.number}{!item.saved && <small>New</small>}</span><strong>{item.name}</strong></button>)}
      </nav>
      <div className={styles.selectionRow}><p>{version.detail}</p><button type="button" className={styles.compareButton} aria-pressed={compare} onClick={toggleCompare}>{compare ? 'Single view' : 'Compare versions'}</button></div>
      {compare && <label className={styles.compareTarget}>Compare against<select aria-label="Compare against version" value={partner.id} onChange={event => selectComparison(event.target.value)}>{versions.filter(item => item.id !== selected).map(item => <option value={item.id} key={item.id}>{item.number} · {item.name}</option>)}</select></label>}
    </header>
    <div className={`${styles.stage} ${compare ? styles.comparing : ''}`}>
      {shownVersions.map(item => <LoanCard key={item.id} version={item} backgroundOnly={backgroundOnly} />)}
    </div>
    <footer className={styles.toolbar}>
      <span className={styles.savedNote}>{versions.filter(item => item.saved).map(item => item.number).join(', ')} are preserved.</span>
      <button type="button" aria-pressed={backgroundOnly} onClick={() => setBackgroundOnly(value => !value)}>{backgroundOnly ? 'Show loan artwork' : 'Show background only'}</button>
    </footer>
    <p className={styles.note}>White space and loan artwork kept consistent. Homepage and other cards unchanged.</p>
  </main>;
}
