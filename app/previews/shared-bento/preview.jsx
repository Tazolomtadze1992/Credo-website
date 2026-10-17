'use client';

import { useEffect, useRef, useState } from 'react';
import ProductCard from '../../../components/ProductCard';
import SplitPayment from '../../../components/SplitPayment';
import SharedBentoBackground from '../../../components/SharedBentoBackground';
import { ArtStage, CredoPhoneVideo } from '../../../components/LoanCardArtwork';
import { sharedBentoVersions, sharedVersionById } from '../../../lib/shared-bento-versions/catalog.mjs';
import styles from './preview.module.css';

function BentoStudy({ version, showDetail }) {
  return <section className={styles.study} aria-label={`${version.number} ${version.name}`}>
    <header className={styles.caption}>
      <h2>{version.number} · {version.name}</h2><span>Saved version</span>
    </header>
    <div className={`product-grid ${styles.pair}`}>
      <ProductCard kind="loan" title="მიიღე სესხი სახლიდან გაუსვლელად" onExplore={() => showDetail('მიიღე სესხი სახლიდან გაუსვლელად')}><ArtStage width={733} height={698}><CredoPhoneVideo /></ArtStage></ProductCard>
      <ProductCard kind="split" title="და-ყა-ვი შენს ტემპში" onExplore={() => showDetail('და-ყა-ვი შენს ტემპში')}><SplitPayment version="original" /></ProductCard>
      <SharedBentoBackground version={version.id} />
    </div>
    <p className={styles.detail}>{version.detail}</p>
  </section>;
}

export default function SharedBentoPreview({ initialVersion, initialCompare = false }) {
  const [selected, setSelected] = useState(sharedVersionById(initialVersion).id);
  const [compare, setCompare] = useState(initialCompare);
  const [dialogTitle, setDialogTitle] = useState('');
  const dialogRef = useRef(null), returnFocus = useRef(null);
  const version = sharedVersionById(selected);

  useEffect(() => {
    const restore = () => {
      const query = new URLSearchParams(window.location.search);
      setSelected(sharedVersionById(query.get('version')).id);
      setCompare(query.get('compare') === '1');
    };
    window.addEventListener('popstate', restore);
    return () => window.removeEventListener('popstate', restore);
  }, []);

  function update(id, comparing) {
    setSelected(id); setCompare(comparing);
    const query = new URLSearchParams({ version: id });
    if (comparing) query.set('compare', '1');
    window.history.pushState(null, '', `?${query}`);
  }
  function showDetail(title) {
    returnFocus.current = document.activeElement;
    setDialogTitle(title); dialogRef.current.showModal();
  }

  return <main className={styles.page}>
    <header className={styles.intro}>
      <div className={styles.topline}><p>CREDO / SHARED BENTO STUDIES</p><a href="/#products">Back to homepage ↗</a></div>
      <h1>Shared color flow</h1>
      <p className={styles.description}>Saved treatments for the loan and და-ყა-ვი cards. Switch versions or compare both at their original size.</p>
      <div className={styles.controls}>
        <nav className={styles.picker} aria-label="Saved shared shader versions">
          {sharedBentoVersions.map(item => <button key={item.id} type="button" aria-pressed={selected === item.id} onClick={() => update(item.id, compare)}><span>{item.number}</span>{item.name}</button>)}
        </nav>
        <button className={styles.compare} type="button" aria-pressed={compare} onClick={() => update(selected, !compare)}>{compare ? 'Single view' : 'Compare V1 and V2'}</button>
      </div>
    </header>
    <div className={styles.studies}>
      {(compare ? sharedBentoVersions : [version]).map(item => <BentoStudy key={item.id} version={item} showDetail={showDetail} />)}
    </div>
    <footer className={styles.footer}><p>V1 and V2 are preserved independently. The white space, artwork and circulation speed stay consistent.</p><a href="/previews/loan-shader?version=organic">Earlier loan studies · V2–V5 ↗</a></footer>
    <dialog ref={dialogRef} className="detail-dialog" aria-labelledby="study-dialog-title" onClose={() => returnFocus.current?.focus()} onClick={event => { if (event.target === event.currentTarget) event.currentTarget.close(); }}>
      <button className="dialog-close" type="button" aria-label="დახურვა" onClick={() => dialogRef.current.close()}>×</button>
      <h2 id="study-dialog-title">{dialogTitle}</h2><p>ეს დიზაინის ინტერაქტიული პროტოტიპია.</p>
      <button className="action action-secondary" type="button" onClick={() => dialogRef.current.close()}>დახურვა</button>
    </dialog>
  </main>;
}
