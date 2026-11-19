'use client';

// Homepage header. `?nav=a|b|c` swaps in a navigation proposal and shows the variant picker;
// `?nav=current` shows today's header with the picker. Without the query the page is unchanged.
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import SiteHeader from '../SiteHeader';
import { BusinessAskHeader, DesignHeader } from './VariantHeader';
import { MarketingHeader } from './MarketingHeader';
import '../../app/prototypes/dayavi/picker.css';
import './nav-variants.css';

const VARIANTS = [
  { id: 'current', label: 'Current', Header: SiteHeader },
  { id: 'a', label: 'A · Marketing', Header: MarketingHeader },
  { id: 'b', label: 'B · Business ask', Header: BusinessAskHeader },
  { id: 'c', label: 'C · Design team', Header: DesignHeader },
];

export default function HeaderSwitch() {
  const [selected, setSelected] = useState(null);
  const [ready, setReady] = useState(false);
  const itemRefs = useRef([]), highlightRef = useRef(null);
  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get('nav');
    const index = VARIANTS.findIndex(v => v.id === requested);
    if (index >= 0) setSelected(index);
  }, []);
  useEffect(() => {
    if (selected === null) return;
    let second;
    const first = requestAnimationFrame(() => { second = requestAnimationFrame(() => setReady(true)); });
    const keyDown = event => {
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(event.target.tagName) || event.target.isContentEditable || event.metaKey || event.ctrlKey || event.altKey) return;
      const number = Number.parseInt(event.key, 10);
      if (number >= 0 && number < VARIANTS.length) choose(number);
    };
    document.addEventListener('keydown', keyDown);
    return () => { cancelAnimationFrame(first); cancelAnimationFrame(second); document.removeEventListener('keydown', keyDown); };
  }, [selected === null]);
  useLayoutEffect(() => {
    const measure = () => {
      const item = itemRefs.current[selected];
      if (!item || !highlightRef.current) return;
      highlightRef.current.style.width = `${item.offsetWidth}px`;
      highlightRef.current.style.transform = `translateX(${item.offsetLeft}px)`;
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [selected]);
  function choose(index) {
    setSelected(index);
    const url = new URL(window.location.href);
    url.searchParams.set('nav', VARIANTS[index].id);
    window.history.replaceState(null, '', url);
  }
  if (selected === null) return <SiteHeader />;
  const { Header } = VARIANTS[selected];
  return <>
    <Header key={selected} />
    <nav className="proto-picker" aria-label="Navigation variants" data-ready={ready ? '' : undefined}>
      <span ref={highlightRef} className="proto-picker-highlight" aria-hidden="true" />
      {VARIANTS.map((v, index) => <button key={v.id} ref={el => { itemRefs.current[index] = el; }} className="proto-picker-item" data-active={index === selected ? '' : undefined} aria-current={index === selected ? 'true' : undefined} onClick={() => choose(index)}>{v.label.replaceAll(' ', ' ')}</button>)}
    </nav>
  </>;
}
