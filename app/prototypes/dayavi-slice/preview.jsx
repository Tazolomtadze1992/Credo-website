'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import SiteHeader from '../../../components/SiteHeader';
import Shops from '../dayavi/shops';
import Poster from '../dayavi/variants/round-2/poster';
import styles from './preview.module.css';
import './picker.css';

const Original = dynamic(() => import('../dayavi/variants/round-3/paper-slice'), {
  ssr: false,
  loading: () => <Poster kind="paper" />,
});
const Refined = dynamic(() => import('./variants/refined-slice'), {
  ssr: false,
  loading: () => <Poster kind="paper" />,
});

const Paper = dynamic(() => import('./variants/v3/paper-v3'), {
  ssr: false,
  loading: () => <Poster kind="paper" />,
});

// Add future Slice explorations here; each mounts independently at full size.
const variants = [
  { name: 'Original', Scene: Original },
  { name: 'Refined', Scene: Refined },
  { name: 'Paper', Scene: Paper },
];
const DESCRIPTION = 'და-ყა-ვი არის განვადების ფორმა, რომელიც გეხმარება შეიძინო სასურველი ნივთი და გადაიხადო თანხა გარკვეულ პერიოდზე გადანაწილებით. ეს სისტემა საშუალებას გაძლევს, რომ უფრო მარტივად და კომფორტულად მოიძიო და შეიძინო ის ნივთები.';

export default function SlicePreview({ initialVariant = 0, presentation = false }) {
  const [selected, setSelected] = useState(initialVariant);
  const [replay, setReplay] = useState(0);
  const [ready, setReady] = useState(false);
  const selectedRef = useRef(selected);
  const itemRefs = useRef([]);
  const highlightRef = useRef(null);
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
    let secondFrame;
    const firstFrame = requestAnimationFrame(() => {
      secondFrame = requestAnimationFrame(() => setReady(true));
    });
    const url = new URL(window.location.href);
    url.searchParams.set('v', selectedRef.current + 1);
    window.history.replaceState(null, '', url);

    const keyDown = event => {
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(event.target.tagName) || event.target.isContentEditable) return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const number = Number.parseInt(event.key, 10);
      if (number >= 1 && number <= variants.length) choose(number - 1);
      else if (event.key === 'ArrowRight') {
        event.preventDefault();
        choose((selectedRef.current + 1) % variants.length);
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        choose((selectedRef.current - 1 + variants.length) % variants.length);
      } else if (event.key.toLowerCase() === 'r') setReplay(value => value + 1);
    };
    document.addEventListener('keydown', keyDown);
    return () => {
      cancelAnimationFrame(firstFrame);
      cancelAnimationFrame(secondFrame);
      document.removeEventListener('keydown', keyDown);
    };
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
      <h1 className={styles.srOnly}>და-ყა-ვი</h1>
      <div className={styles.heroStage} data-slice-variant={variants[selected].name}>
        <Scene key={`${selected}:${replay}`} />
      </div>
      <p className={styles.description}>{DESCRIPTION}</p>
      <div className={styles.actions}>
        <a className={`action ${styles.limitAction}`} href="https://lending.credo.ge/loans/loan-limits" target="_blank" rel="noopener noreferrer" aria-label="გაიგე ლიმიტი">{'გაიგე ლიმიტი'.toUpperCase()}</a>
      </div>
      <Shops />
    </main>
    {!presentation && <nav className="proto-picker" aria-label="Prototype variants" data-ready={ready ? '' : undefined}>
      <span ref={highlightRef} className="proto-picker-highlight" aria-hidden="true" />
      {variants.map((variant, index) => <button key={variant.name} ref={element => { itemRefs.current[index] = element; }} className="proto-picker-item" data-active={index === selected ? '' : undefined} aria-current={index === selected ? 'true' : undefined} onClick={() => choose(index)}>{variant.name}</button>)}
      <span className="proto-picker-divider" aria-hidden="true" />
      <button className="proto-picker-item proto-picker-replay" aria-label="Replay animation (R)" onClick={() => setReplay(value => value + 1)}>↻</button>
    </nav>}
  </div>;
}
