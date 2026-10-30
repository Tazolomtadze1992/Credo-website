'use client';

import { useId, useRef, useState } from 'react';
import Link from 'next/link';
import * as Dialog from '@radix-ui/react-dialog';
import { MagnifyingGlassIcon } from '@radix-ui/react-icons';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { SEARCH_STARTS, findSearchResults } from '../data/site-search.mjs';
import styles from './SiteSearch.module.css';
import { resolveDesignHref } from '../lib/site-design-navigation.mjs';

function Mark({ kind }) {
  const paths = {
    loans: <><rect x="3" y="5" width="14" height="11" rx="2" /><path d="M3 8h14M6 12h3M7 5V3m6 2V3" /></>,
    cards: <><rect x="3" y="6" width="14" height="10" rx="2" /><path d="M3 9h14M6 13h3M6 3h9a2 2 0 0 1 2 2" /></>,
    deposits: <><ellipse cx="10" cy="5" rx="6" ry="2.5" /><path d="M4 5v5c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5V5M4 10v5c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5v-5" /></>,
    installments: <><rect x="2" y="4" width="4" height="12" rx="1" /><rect x="8" y="4" width="4" height="12" rx="1" /><rect x="14" y="4" width="4" height="12" rx="1" /></>,
    help: <><path d="M17 9a6.5 6.5 0 0 1-6.5 6.5H6L3 18V5.5A2.5 2.5 0 0 1 5.5 3H11a6 6 0 0 1 6 6Z" /><path d="M8.5 7a1.6 1.6 0 1 1 2.1 1.5c-.6.2-.6.7-.6 1M10 12h.01" /></>,
    video: <><rect x="2" y="5" width="11" height="11" rx="2" /><path d="m13 9 5-3v9l-5-3Z" /></>,
    phone: <><rect x="5" y="2" width="10" height="16" rx="2.5" /><path d="M9 15h2M9 5h2" /></>,
    insurance: <><path d="m10 2 7 3v5c0 3.8-7 8-7 8s-7-4.2-7-8V5l7-3Z" /><path d="m7 10 2 2 4-4" /></>,
    services: <><path d="M3 6h13l-3-3M17 14H4l3 3M16 6l-3 3M4 14l3-3" /></>,
    page: <><path d="M11 2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-6-6Z" /><path d="M11 2v6h6M7 12h6M7 15h4" /></>,
  };
  return <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[kind] || paths.page}</svg>;
}
function Cross({ circle = false }) {
  return <svg width={circle ? 18 : 20} height={circle ? 18 : 20} viewBox="0 0 20 20" fill="none" aria-hidden="true">{circle && <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.25" />}<path d={circle ? 'm7.5 7.5 5 5m0-5-5 5' : 'm5 5 10 10M15 5 5 15'} stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>;
}

const panelMotion = {
  hidden: ({ instant, reduced }) => ({ opacity: 0, transform: instant || reduced ? 'none' : 'translateY(6px) scale(.985)' }),
  visible: ({ instant }) => ({ opacity: 1, transform: 'translateY(0px) scale(1)', transition: { duration: instant ? 0 : .18, ease: [.22, 1, .36, 1] } }),
  exit: ({ instant, reduced }) => ({ opacity: 0, transform: instant || reduced ? 'none' : 'translateY(-4px) scale(.99)', transition: { duration: instant ? 0 : .13, ease: 'easeOut' } }),
};
const overlayMotion = {
  hidden: { opacity: 0 },
  visible: ({ instant }) => ({ opacity: 1, transition: { duration: instant ? 0 : .16 } }),
  exit: ({ instant }) => ({ opacity: 0, transition: { duration: instant ? 0 : .12 } }),
};

export default function SiteSearch({ onOpen, design = 1 }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [group, setGroup] = useState(null);
  const [active, setActive] = useState(-1);
  const [instant, setInstant] = useState(false);
  const inputRef = useRef(null);
  const rowsRef = useRef([]);
  const openRef = useRef(false);
  const navigatingRef = useRef(false);
  const listId = useId();
  const reduced = useReducedMotion();
  const motionSettings = { instant, reduced };
  const searching = Boolean(query.trim());
  const items = searching ? findSearchResults(query) : group ? group.items : SEARCH_STARTS;

  function changeOpen(value) {
    openRef.current = value;
    setOpen(value);
    if (value) {
      setQuery(''); setGroup(null); setActive(-1); navigatingRef.current = false;
      onOpen();
    }
  }
  function browse(item) {
    setGroup(item); setQuery(''); setActive(-1);
    inputRef.current?.focus({ preventScroll: true });
  }
  function reset() {
    setGroup(null); setQuery(''); setActive(-1);
    inputRef.current?.focus({ preventScroll: true });
  }
  function choose(event) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    setInstant(event.detail === 0); navigatingRef.current = true; changeOpen(false);
  }
  function keys(event) {
    if (event.nativeEvent.isComposing || event.metaKey || event.ctrlKey || event.altKey) return;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (!items.length) return;
      const next = event.key === 'ArrowDown' ? (active + 1) % items.length : (active < 0 ? items.length - 1 : (active - 1 + items.length) % items.length);
      setActive(next);
      rowsRef.current[next]?.scrollIntoView({ block: 'nearest' });
    } else if (event.key === 'Enter') {
      event.preventDefault();
      rowsRef.current[active >= 0 ? active : 0]?.click();
    }
  }

  return <Dialog.Root open={open} onOpenChange={changeOpen}>
    <Dialog.Trigger className="site-icon-button" aria-label="ძიება" onClick={event => setInstant(event.detail === 0)}><MagnifyingGlassIcon /></Dialog.Trigger>
    <AnimatePresence custom={motionSettings}>
      {open && <Dialog.Portal forceMount key="site-search">
        <Dialog.Overlay forceMount asChild><motion.div className={styles.overlay} custom={motionSettings} variants={overlayMotion} initial="hidden" animate="visible" exit="exit" /></Dialog.Overlay>
        <Dialog.Content forceMount asChild aria-describedby={undefined}
          onOpenAutoFocus={event => { event.preventDefault(); inputRef.current?.focus({ preventScroll: true }); }}
          onCloseAutoFocus={event => { if (openRef.current || navigatingRef.current) event.preventDefault(); }}
          onEscapeKeyDown={() => setInstant(true)} onPointerDownOutside={() => setInstant(false)}
          onKeyDown={event => event.stopPropagation()}>
          <motion.div className={styles.panel} custom={motionSettings} variants={panelMotion} initial="hidden" animate="visible" exit="exit">
            <Dialog.Title className={styles.srOnly}>ძიება კრედოში</Dialog.Title>
            <div className={styles.header}>
              <div className={styles.field}>
                <MagnifyingGlassIcon className={styles.searchIcon} />
                <input ref={inputRef} type="text" role="combobox" aria-label="მოძებნე კრედოში" aria-autocomplete="list" aria-expanded="true" aria-controls={listId} aria-activedescendant={active >= 0 && active < items.length ? `${listId}-${active}` : undefined}
                  placeholder="მოძებნე კრედოში" autoComplete="off" spellCheck={false} value={query} onKeyDown={keys}
                  onChange={event => { setQuery(event.target.value); setGroup(null); setActive(-1); }} />
                {query && <button type="button" className={styles.clear} aria-label="აკრეფილის გასუფთავება" onClick={reset}><Cross circle /></button>}
              </div>
              <Dialog.Close asChild><button type="button" className={styles.close} aria-label="ძიების დახურვა" onClick={event => setInstant(event.detail === 0)}><Cross /></button></Dialog.Close>
            </div>
            {group && <div className={styles.context}><button type="button" onClick={reset} aria-label="ყველა კატეგორიაზე დაბრუნება"><svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="m7 3-5 5 5 5M2 8h12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>{group.label}</button></div>}
            <p className={styles.srOnly} role="status" aria-live="polite">{searching ? `${items.length} შედეგი` : group ? group.label : 'აირჩიე კატეგორია ან ჩაწერე საძიებო სიტყვა'}</p>
            <div className={styles.body}>
              <div id={listId} role="listbox" aria-label={searching ? 'ძიების შედეგები' : group ? group.label : 'ძიების კატეგორიები'}>
                {items.map((item, index) => {
                  const href = item.href && resolveDesignHref(item.href, design);
                  const props = {
                    id: `${listId}-${index}`, role: 'option', 'aria-selected': active === index,
                    className: styles.row, ref: element => { rowsRef.current[index] = element; },
                    onPointerMove: event => { if (event.pointerType === 'mouse') setActive(index); },
                    onFocus: () => setActive(index),
                  };
                  const content = <><span className={styles.mark}><Mark kind={item.icon} /></span><span className={styles.label}>{item.label}</span>{item.items && <svg className={styles.chevron} width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="m6 4 4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>}</>;
                  return item.items ? <button key={item.id} type="button" {...props} onClick={() => browse(item)}>{content}</button>
                    : href.startsWith('/') ? <Link key={item.href} {...props} href={href} onClick={choose}>{content}</Link>
                    : <a key={item.href} {...props} href={href} target="_blank" rel="noopener noreferrer" onClick={choose}>{content}</a>;
                })}
              </div>
              {!items.length && <div className={styles.empty}><MagnifyingGlassIcon /><p>შედეგი ვერ მოიძებნა</p><span>სცადე სხვა სიტყვა.</span><button type="button" onClick={reset}>ყველა კატეგორია</button></div>}
            </div>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>}
    </AnimatePresence>
  </Dialog.Root>;
}
