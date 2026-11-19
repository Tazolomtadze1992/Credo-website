'use client';

// Navigation proposals rendered with the production header's own markup, classes and motion
// (Radix NavigationMenu + useDesktopNavigationMotion + app/navigation.css). Only the menu data differs.
import { useEffect, useRef, useState } from 'react';
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import * as Dialog from '@radix-ui/react-dialog';
import { GlobeIcon } from '@radix-ui/react-icons';
import { AnimatePresence, motion } from 'motion/react';
import Search from '../SiteSearch';
import { Arrow, BackMark, Brand, Chevron, Destination, Featured, Group, Hamburger, MenuLink } from '../SiteHeader';
import { useDesktopNavigationMotion } from '../useDesktopNavigationMotion';
import { englishHref, navigationSections, videoHref } from '../../data/site-navigation.mjs';
import { B_SEGMENTS, businessAskBar, designSections } from './data.mjs';

const BANKING = { id: 'banking', label: 'ინტერნეტბანკი', kind: 'compact', className: 'site-panel-banking', groups: navigationSections.find(s => s.id === 'banking').groups, aside: { text: 'ბანკი ყოველთვის შენთან', link: { label: 'ვიდეო ბანკი', href: videoHref } } };

function Toggle({ options, value, onChange, label, small = false }) {
  return <div className="nvx-toggle" data-small={small ? '' : undefined} role="group" aria-label={label}>
    {options.map(o => <button key={o.value} type="button" aria-pressed={o.value === value} disabled={o.disabled} title={o.title} onClick={() => onChange(o.value)}>{o.label}</button>)}
  </div>;
}

/* ---------- Panels (same classes as SiteHeader's ConsumerPanel / CompactPanel) ---------- */
function GridPanel({ section, onChoose, desktop }) {
  const side = section.sidebar;
  return <div className={side ? 'site-consumer-panel' : 'site-consumer-panel nvx-no-sidebar'}>
    <div className="site-products-grid" style={{ '--nvx-cols': section.columns.length }}>
      {section.columns.map((col, i) => <div key={i}>{col.map(g => <Group key={g.id} group={g} desktop={desktop} onChoose={onChoose} />)}</div>)}
    </div>
    {side && <aside className="site-menu-sidebar">{side.group && <Group group={side.group} desktop={desktop} onChoose={onChoose} />}{side.featured && <Featured onChoose={onChoose} />}</aside>}
    {section.footer && <div className="site-menu-footer">{desktop ? <NavigationMenu.Link asChild><a className="site-footer-link" href={section.footer.href} onClick={onChoose}>{section.footer.label}<Arrow /></a></NavigationMenu.Link> : <a className="site-footer-link" href={section.footer.href} onClick={onChoose}>{section.footer.label}<Arrow /></a>}</div>}
  </div>;
}
function CompactPanel({ section, onChoose, desktop }) {
  return <div className={`site-compact-panel ${section.className ?? ''}`} data-groups={section.groups.length}>
    <div className="site-compact-groups">{section.groups.map(g => <Group key={g.id} group={g} desktop={desktop} onChoose={onChoose} />)}</div>
    <aside className="site-compact-aside"><p>{section.aside.text}</p><MenuLink item={section.aside.link} onChoose={onChoose} desktop={desktop} showDetail={false} /></aside>
  </div>;
}
function PanelBody({ section, onChoose, desktop }) {
  if (section.kind === 'grid') return <GridPanel section={section} onChoose={onChoose} desktop={desktop} />;
  if (section.kind === 'compact') return <CompactPanel section={section} onChoose={onChoose} desktop={desktop} />;
  return null;
}

/* ---------- Mobile drill-down (same classes as SiteHeader's MobileMenu) ---------- */
const mobileMotion = {
  enter: direction => ({ x: `${direction * 20}%`, opacity: 0 }),
  visible: { x: 0, opacity: 1 },
  exit: direction => ({ x: `${direction * -20}%`, opacity: 0 }),
};
function mobileGroups(section) {
  if (section.kind === 'grid') return [...section.columns.flat(), ...(section.sidebar?.group ? [section.sidebar.group] : [])];
  if (section.kind === 'compact') return section.groups;
  return [];
}
export function MobileMenu({ sections, intro, onOpen }) {
  const [open, setOpen] = useState(false);
  const [sectionId, setSectionId] = useState('');
  const [direction, setDirection] = useState(1);
  const backRef = useRef(null), firstRef = useRef(null);
  const all = [...sections, BANKING];
  const section = all.find(s => s.id === sectionId);
  const choose = id => { setDirection(id ? 1 : -1); setSectionId(id); };
  const close = () => setOpen(false);
  useEffect(() => {
    const desktop = window.matchMedia('(min-width:1200px)');
    const closeOnDesktop = () => { if (desktop.matches) setOpen(false); };
    desktop.addEventListener('change', closeOnDesktop);
    return () => desktop.removeEventListener('change', closeOnDesktop);
  }, []);
  useEffect(() => { if (open) (sectionId ? backRef : firstRef).current?.focus({ preventScroll: true }); }, [sectionId, open]);
  return <Dialog.Root open={open} onOpenChange={value => { setOpen(value); if (value) { setSectionId(''); onOpen(); } }}>
    <Dialog.Trigger className="site-mobile-toggle" aria-label="მენიუს გახსნა"><Hamburger /></Dialog.Trigger>
    <Dialog.Portal><Dialog.Overlay className="site-mobile-overlay" /><Dialog.Content className="site-mobile-dialog" aria-describedby={undefined}>
      <Dialog.Title className="site-sr-only">მთავარი მენიუ</Dialog.Title>
      <div className="site-mobile-heading">{section ? <button ref={backRef} className="site-back-button" onClick={() => choose('')}><BackMark />უკან</button> : <Brand onClick={close} />}<Dialog.Close className="site-mobile-close" aria-label="მენიუს დახურვა"><Hamburger open /></Dialog.Close></div>
      <AnimatePresence initial={false} custom={direction}>
        <motion.div key={sectionId || 'root'} className="site-mobile-stage" custom={direction} variants={mobileMotion} initial="enter" animate="visible" exit="exit" transition={{ x: { duration: .5, ease: [.4, 0, .2, 1] }, opacity: { duration: .25 } }}>
          {section ? <div className="site-mobile-products">{mobileGroups(section).map(g => <Group key={g.id} group={g} onChoose={close} />)}</div> : <nav aria-label="მობილური ნავიგაცია">
            {intro && <div className="nvx-mobile-intro">{intro}</div>}
            <ul className="site-mobile-root-list">
              {sections.map((s, i) => <li key={s.id}>{s.kind ? <button ref={i === 0 ? firstRef : undefined} onClick={() => choose(s.id)}>{s.label}<Chevron /></button> : <Destination href={s.href} onClick={close}>{s.label}<Arrow /></Destination>}</li>)}
              <li><button onClick={() => choose('banking')}>ინტერნეტბანკი<Chevron /></button></li>
              <li><Destination href={englishHref} lang="en" onClick={close}><span className="site-mobile-language"><GlobeIcon />English</span><Arrow /></Destination></li>
            </ul></nav>}
        </motion.div>
      </AnimatePresence>
      <div className="site-mobile-footer"><Destination href={videoHref} className="site-action site-action-secondary" onClick={close}>ვიდეო ბანკი<Arrow /></Destination><button className="site-action site-action-primary" onClick={() => choose('banking')}>ინტერნეტბანკი<Arrow /></button></div>
    </Dialog.Content></Dialog.Portal>
  </Dialog.Root>;
}

/* ---------- Desktop menu items ---------- */
function MenuItems({ sections, nav }) {
  const { value, visualValue, close } = nav;
  const panelIds = [...sections.filter(s => s.kind).map(s => s.id), 'banking'];
  const panel = section => {
    const index = panelIds.indexOf(section.id), visualIndex = panelIds.indexOf(visualValue);
    return nav.presented && <NavigationMenu.Content forceMount ref={nav.registerPanel} className="site-nav-content" data-panel={section.id} data-visible={section.id === visualValue} data-side={index < visualIndex ? 'start' : 'end'} inert={section.id !== value ? true : undefined} aria-hidden={section.id !== value}>
      <PanelBody section={section} onChoose={close} desktop />
    </NavigationMenu.Content>;
  };
  return <>
    {sections.map(s => s.kind
      ? <NavigationMenu.Item value={s.id} className="site-desktop-item" key={s.id}><NavigationMenu.Trigger className="site-nav-link" data-nav-trigger={s.id}>{s.label}<Chevron /></NavigationMenu.Trigger>{panel(s)}</NavigationMenu.Item>
      : <NavigationMenu.Item className="site-desktop-item" key={s.id}><NavigationMenu.Link asChild><Destination className="site-nav-link" href={s.href} onClick={close}>{s.label}</Destination></NavigationMenu.Link></NavigationMenu.Item>)}
  </>;
}

export function Frame({ nav, label, children }) {
  return <NavigationMenu.Root ref={nav.frameRef} className="site-nav-frame" value={nav.value} onValueChange={nav.changeValue} delayDuration={100} skipDelayDuration={300} aria-label={label} data-open={nav.presented} data-expanded={Boolean(nav.value)} data-phase={nav.phase} onKeyDownCapture={nav.onKeyDownCapture} onPointerMoveCapture={nav.onPointerMoveCapture}>
    <NavigationMenu.List className="site-nav-list">{children}</NavigationMenu.List>
    <div className="site-viewport-position"><NavigationMenu.Viewport forceMount ref={nav.viewportRef} className="site-nav-viewport" inert={!nav.value ? true : undefined} aria-hidden={!nav.value} /></div>
  </NavigationMenu.Root>;
}

function BankingItem({ nav, sections }) {
  const panelIds = [...sections.filter(s => s.kind).map(s => s.id), 'banking'];
  const visualIndex = panelIds.indexOf(nav.visualValue);
  return <NavigationMenu.Item value="banking" className="site-desktop-item site-bank-item">
    <NavigationMenu.Trigger className="site-action site-action-primary" data-nav-trigger="banking">ინტერნეტბანკი<Chevron /></NavigationMenu.Trigger>
    {nav.presented && <NavigationMenu.Content forceMount ref={nav.registerPanel} className="site-nav-content" data-panel="banking" data-visible={nav.visualValue === 'banking'} data-side={panelIds.length - 1 < visualIndex ? 'start' : 'end'} inert={nav.value !== 'banking' ? true : undefined} aria-hidden={nav.value !== 'banking'}>
      <CompactPanel section={BANKING} onChoose={nav.close} desktop />
    </NavigationMenu.Content>}
  </NavigationMenu.Item>;
}

/* ---------- Variant headers ---------- */
function SingleRowHeader({ variant, sections }) {
  const nav = useDesktopNavigationMotion();
  return <header className="site-header nvx-header" id="site-top" data-variant={variant} data-nav-input={nav.input}>
    <div className="site-nav-backdrop" data-open={Boolean(nav.value)} aria-hidden="true" onPointerDown={nav.close} />
    <div className="site-header-layout"><Frame nav={nav} label="მთავარი ნავიგაცია">
      <li className="site-brand-item"><Brand onClick={nav.close} /></li>
      <MenuItems sections={sections} nav={nav} />
      <li className="site-video-item"><Destination className="site-action site-action-secondary" href={videoHref}>ვიდეო ბანკი<Arrow /></Destination></li>
      <BankingItem nav={nav} sections={sections} />
      <li className="site-search-item"><Search onOpen={nav.close} /></li>
      <li className="site-desktop-item site-language-item"><Destination href={englishHref} className="site-language" lang="en" aria-label="English website"><GlobeIcon />EN</Destination></li>
      <li className="site-mobile-item"><MobileMenu sections={sections} onOpen={nav.close} /></li>
    </Frame></div>
  </header>;
}

export function DesignHeader() {
  return <SingleRowHeader variant="c" sections={designSections()} />;
}

export function BusinessAskHeader() {
  const [segmentId, setSegmentId] = useState('personal');
  const nav = useDesktopNavigationMotion();
  const sections = businessAskBar(segmentId);
  const chooseSegment = id => { nav.close(); setSegmentId(id); };
  return <header className="site-header nvx-header" id="site-top" data-variant="b" data-nav-input={nav.input}>
    <div className="site-nav-backdrop" data-open={Boolean(nav.value)} aria-hidden="true" onPointerDown={nav.close} />
    <div className="site-header-layout">
      <div className="nvx-segment-row">
        <Brand onClick={nav.close} />
        <nav className="nvx-segments" aria-label="სეგმენტი">
          {B_SEGMENTS.map(s => <button key={s.id} type="button" className="nvx-segment" aria-pressed={s.id === segmentId} onClick={() => chooseSegment(s.id)}>{s.label}</button>)}
        </nav>
        <div className="nvx-row-actions">
          <Destination className="site-action site-action-primary nvx-desktop-only" href="https://onelink.to/mycredo">ინტერნეტბანკი<Arrow /></Destination>
          <Search onOpen={nav.close} />
          <Destination href={englishHref} className="site-language nvx-desktop-only" lang="en" aria-label="English website"><GlobeIcon />EN</Destination>
          <span className="nvx-mobile-only"><MobileMenu key={segmentId} sections={sections} onOpen={nav.close} intro={<Toggle label="სეგმენტი" options={B_SEGMENTS.map(s => ({ value: s.id, label: s.label }))} value={segmentId} onChange={setSegmentId} />} /></span>
        </div>
      </div>
      <Frame nav={nav} label="პროდუქტების ნავიგაცია">
        <MenuItems key={segmentId} sections={sections} nav={nav} />
        <li className="site-video-item"><Destination className="site-action site-action-secondary" href={videoHref}>ვიდეო ბანკი<Arrow /></Destination></li>
      </Frame>
    </div>
  </header>;
}
