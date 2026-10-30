'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import SiteHeader from '../../../components/SiteHeader';
import Particles from './variants/particles';
import CakeDrawing from './variants/round-2/cake-drawing';
import Poster from './variants/round-2/poster';
import PaperFallback from './variants/paper-fallback';
import Shops from './shops';
import styles from './preview.module.css';
import './picker.css';

const Fold = dynamic(() => import('./variants/fold'), { ssr: false, loading: () => <PaperFallback /> });
const Cake3D = dynamic(() => import('./variants/round-2/cake-3d'), { ssr: false, loading: () => <Poster kind="cake" /> });
const PaperSlice = dynamic(() => import('./variants/round-3/paper-slice'), { ssr: false, loading: () => <Poster kind="paper" /> });
const variants = [
  { name: 'Particles', Scene: Particles },
  { name: 'Cake 3D', Scene: Cake3D },
  { name: 'Fold', Scene: Fold },
  { name: 'Drawn', Scene: CakeDrawing },
  { name: 'Slice', Scene: PaperSlice },
];
const DESCRIPTION = 'შეიძინე სასურველი ნივთი პარტნიორ მაღაზიებში და გადაანაწილე გადახდა.';

export default function DayaviPreview({ initialVariant = 0 }) {
  const [selected, setSelected] = useState(initialVariant);
  const [replay, setReplay] = useState(0);
  const [ready, setReady] = useState(false);
  const itemRefs = useRef([]), highlightRef = useRef(null);
  const selectedRef = useRef(selected);
  const router = useRouter();
  selectedRef.current = selected;

  function choose(index) {
    if (index < 0 || index >= variants.length) return;
    setSelected(index);
    setReplay(value => value + 1);
    const url = new URL(window.location.href);
    url.searchParams.set('v', index + 1);
    window.history.replaceState(null, '', url);
  }
  useLayoutEffect(() => {
    const measure = () => {
      const item = itemRefs.current[selectedRef.current];
      if (!item || !highlightRef.current) return;
      highlightRef.current.style.width = `${item.offsetWidth}px`;
      highlightRef.current.style.transform = `translateX(${item.offsetLeft}px)`;
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [selected]);
  useEffect(() => {
    let second;
    const warm = window.requestIdleCallback?.(() => { Promise.allSettled([import('./variants/fold'), import('./variants/round-2/three-stage')]); });
    const first = requestAnimationFrame(() => { second = requestAnimationFrame(() => setReady(true)); });
    const url = new URL(window.location.href);
    url.searchParams.set('v', selectedRef.current + 1);
    window.history.replaceState(null, '', url);
    const keyDown = event => {
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(event.target.tagName) || event.target.isContentEditable) return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const number = Number.parseInt(event.key, 10);
      if (number >= 1 && number <= variants.length) choose(number - 1);
      else if (event.key === 'ArrowRight') { event.preventDefault(); choose((selectedRef.current + 1) % variants.length); }
      else if (event.key === 'ArrowLeft') { event.preventDefault(); choose((selectedRef.current - 1 + variants.length) % variants.length); }
      else if (event.key.toLowerCase() === 'r') setReplay(value => value + 1);
    };
    document.addEventListener('keydown', keyDown);
    return () => { cancelAnimationFrame(first); cancelAnimationFrame(second); if (warm !== undefined) window.cancelIdleCallback?.(warm); document.removeEventListener('keydown', keyDown); };
  }, []);

  function headerDestination(event) {
    const link = event.target.closest('a');
    const href = link?.getAttribute('href');
    if (!href?.startsWith('#')) return;
    event.preventDefault();
    router.push(href === '#site-top' ? '/' : `/${href}`);
  }

  const Scene = variants[selected].Scene;
  return <div className={styles.root}>
    <div onClickCapture={headerDestination}><SiteHeader /></div>
    <main className={styles.main} id="dayavi-content">
      <div className={styles.heroStage} data-dayavi-direction={variants[selected].name}>
        <Scene key={`${selected}:${replay}`} />
      </div>
      <h1 className={styles.descriptionTitle}>და-ყა-ვი <strong>0%</strong> საკომისიოთი.</h1>
      <p className={styles.description}>{DESCRIPTION}</p>
      <div className={styles.actions}><a className={`action ${styles.limitAction}`} href="https://lending.credo.ge/loans/loan-limits" target="_blank" rel="noopener noreferrer" aria-label="მოითხოვე ლიმიტი">{'მოითხოვე ლიმიტი'.toUpperCase()}</a></div>
      <Shops />
    </main>
    <nav className="proto-picker" aria-label="Prototype variants" data-ready={ready ? '' : undefined}>
      <span ref={highlightRef} className="proto-picker-highlight" aria-hidden="true" />
      {variants.map((variant, index) => <button key={variant.name} ref={element => { itemRefs.current[index] = element; }} className="proto-picker-item" data-active={index === selected ? '' : undefined} aria-current={index === selected ? 'true' : undefined} onClick={() => choose(index)}>{variant.name.replaceAll(' ', '\u00a0')}</button>)}
      <span className="proto-picker-divider" aria-hidden="true" />
      <button className="proto-picker-item proto-picker-replay" aria-label="Replay animation (R)" onClick={() => setReplay(value => value + 1)}>↻</button>
    </nav>
  </div>;
}
