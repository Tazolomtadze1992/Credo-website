'use client';

import { useId, useRef, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { FILTER_GROUPS, copyFilters, emptyFilters, filterCount, matchesFilters, toggleFilter } from './shop-filters.mjs';
import styles from './shop-filter-drawer.module.css';

export function FilterIcon() {
  return <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M3 5h14M5.5 10h9M8 15h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /><circle cx="7" cy="5" r="1.6" fill="white" stroke="currentColor" strokeWidth="1.5" /><circle cx="12.5" cy="10" r="1.6" fill="white" stroke="currentColor" strokeWidth="1.5" /></svg>;
}

export function CloseIcon({ size = 16 }) {
  return <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="m5 5 10 10M15 5 5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>;
}

const EASE = [.32, .72, 0, 1];
const panelMotion = {
  hidden: ({ reduced, instant }) => ({ transform: reduced || instant ? 'translateX(0px)' : 'translateX(calc(100% + 16px))', opacity: reduced || instant ? 0 : 1 }),
  visible: ({ instant }) => ({ transform: 'translateX(0px)', opacity: 1, transition: { duration: instant ? 0 : .28, ease: EASE } }),
  exit: ({ reduced, instant }) => ({ transform: reduced || instant ? 'translateX(0px)' : 'translateX(calc(100% + 16px))', opacity: reduced || instant ? 0 : 1, transition: { duration: instant ? 0 : .2, ease: EASE } }),
};
const overlayMotion = {
  hidden: { opacity: 0 },
  visible: ({ instant }) => ({ opacity: 1, transition: { duration: instant ? 0 : .2, ease: 'easeOut' } }),
  exit: ({ instant }) => ({ opacity: 0, transition: { duration: instant ? 0 : .18, ease: 'easeOut' } }),
};

function CategoryIcon({ kind }) {
  const paths = {
    tech: <><rect x="4" y="3" width="12" height="10" rx="1.5" /><path d="M4 13 2 16v1h16v-1l-2-3M8 17h4" /></>,
    home: <><path d="m2.5 9 7.5-6.5L17.5 9M4.5 7.5V17h11V7.5M8 17v-6h4v6" /></>,
    fashion: <><path d="M7 3a3 3 0 0 0 6 0l5 3-2 4-2-1v8H6V9l-2 1-2-4 5-3Z" /></>,
  };
  return <span className={styles.optionIcon} aria-hidden="true"><svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">{paths[kind]}</svg></span>;
}

function CheckRow({ option, checked, onChange }) {
  return <label className={styles.option}>
    <input type="checkbox" checked={checked} onChange={onChange} />
    <span className={styles.check} aria-hidden="true"><svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="m2.5 6 2.3 2.3 4.7-4.6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
    {option.icon && <CategoryIcon kind={option.icon} />}
    <span>{option.label}</span>
  </label>;
}

function FilterSection({ group, values, onToggle, expanded, onExpand }) {
  const [query, setQuery] = useState('');
  const contentId = useId();
  const searchable = group.options.length > 6;
  const options = group.options.filter(option => option.label.toLocaleLowerCase('ka').includes(query.trim().toLocaleLowerCase('ka')));
  const chosen = group.options.filter(option => values.includes(option.id));
  return <section className={styles.group}>
    <h3><button type="button" className={styles.groupTrigger} aria-expanded={expanded} aria-controls={contentId} onClick={onExpand}>
      <span>{group.label}{values.length > 0 && <span className={styles.groupCount}>{values.length}</span>}</span>
      <svg className={styles.chevron} data-expanded={expanded} width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="m4 6 4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
    </button></h3>
    {!expanded && chosen.length > 0 && <p className={styles.selectionSummary}>{chosen.map(option => option.label).join(' · ')}</p>}
    <div id={contentId} hidden={!expanded} className={styles.groupContent}>
      {searchable && <div className={styles.search}>
        <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true"><circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" strokeWidth="1.5" /><path d="m13 13 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
        <input type="search" aria-label={`${group.label} — ძიება`} placeholder="მოძებნე ქალაქი" value={query} onChange={event => setQuery(event.target.value)} />
      </div>}
      <div role="group" aria-label={group.label} className={styles.optionList}>
        {options.map(option => <CheckRow key={option.id} option={option} checked={values.includes(option.id)} onChange={() => onToggle(group.id, option.id)} />)}
        {!options.length && <p className={styles.noOptions} role="status">ქალაქი ვერ მოიძებნა</p>}
      </div>
    </div>
  </section>;
}

export default function ShopFilterDrawer({ applied, shops, onApply }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(emptyFilters);
  const [expandedGroup, setExpandedGroup] = useState('categories');
  const [instant, setInstant] = useState(false);
  const openRef = useRef(false);
  const reduced = useReducedMotion();
  const count = filterCount(applied);
  const resultCount = shops.filter(shop => matchesFilters(shop, draft)).length;
  const motionSettings = { reduced, instant };

  function changeOpen(value) {
    openRef.current = value;
    if (value) setDraft(copyFilters(applied));
    setOpen(value);
  }

  function apply(event) {
    setInstant(event.detail === 0);
    onApply(copyFilters(draft));
    changeOpen(false);
  }

  return <Dialog.Root open={open} onOpenChange={changeOpen}>
    <Dialog.Trigger asChild><button type="button" className={styles.trigger} onClick={event => setInstant(event.detail === 0)}>
      <FilterIcon /><span>ფილტრები</span>{count > 0 && <span className={styles.triggerCount} aria-label={`${count} არჩეული`}>{count}</span>}
    </button></Dialog.Trigger>
    <AnimatePresence custom={motionSettings}>
      {open && <Dialog.Portal forceMount key="shop-filters">
        <Dialog.Overlay forceMount asChild><motion.div className={styles.overlay} custom={motionSettings} variants={overlayMotion} initial="hidden" animate="visible" exit="exit" /></Dialog.Overlay>
        <Dialog.Content forceMount asChild aria-describedby={undefined}
          onKeyDown={event => event.stopPropagation()}
          onEscapeKeyDown={() => setInstant(true)}
          onPointerDownOutside={() => setInstant(false)}
          onCloseAutoFocus={event => { if (openRef.current) event.preventDefault(); }}>
          <motion.div className={styles.drawer} custom={motionSettings} variants={panelMotion} initial="hidden" animate="visible" exit="exit">
            <header className={styles.header}>
              <Dialog.Title className={styles.title}>ფილტრები</Dialog.Title>
              <Dialog.Close asChild><button type="button" className={styles.close} aria-label="ფილტრების დახურვა" onClick={event => setInstant(event.detail === 0)}><CloseIcon size={20} /></button></Dialog.Close>
            </header>
            <div className={styles.scrollArea}>
              <fieldset className={styles.statusGroup}>
                <legend>სტატუსი</legend>
                <div className={styles.optionList}>{FILTER_GROUPS[0].options.map(option => <CheckRow key={option.id} option={option} checked={draft.statuses.includes(option.id)} onChange={() => setDraft(value => toggleFilter(value, 'statuses', option.id))} />)}</div>
              </fieldset>
              {FILTER_GROUPS.slice(1).map(group => <FilterSection key={group.id} group={group} values={draft[group.id]} expanded={expandedGroup === group.id} onExpand={() => setExpandedGroup(value => value === group.id ? '' : group.id)} onToggle={(id, value) => setDraft(current => toggleFilter(current, id, value))} />)}
            </div>
            <footer className={styles.footer}>
              <button type="button" className={`action ${styles.apply}`} onClick={apply}>მაღაზიების ჩვენება <span aria-live="polite" aria-atomic="true">({resultCount})</span></button>
              <button type="button" className={styles.clear} disabled={!filterCount(draft)} onClick={() => setDraft(emptyFilters())}>გასუფთავება</button>
            </footer>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>}
    </AnimatePresence>
  </Dialog.Root>;
}
