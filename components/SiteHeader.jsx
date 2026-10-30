'use client';

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import * as Dialog from '@radix-ui/react-dialog';
import { GlobeIcon } from '@radix-ui/react-icons';
import Search from './SiteSearch';
import { resolveDesignHref } from '../lib/site-design-navigation.mjs';
import { AnimatePresence, motion } from 'motion/react';
import { LogoArt } from './DesignArt';
import { useDesktopNavigationMotion } from './useDesktopNavigationMotion';
import { consumerGroups, contactHref, englishHref, navigationSections, spaceLinks, videoHref } from '../data/site-navigation.mjs';

const HeaderDesignContext = createContext(1);

// These three navigation marks preserve the paths from the captured Stripe reference.
function Chevron() {
  return <svg className="site-chevron" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path className="site-chevron-left" d="M4.67065 6L9.3 10.6" stroke="currentColor" strokeWidth="1.75" /><path className="site-chevron-right" d="M12.6707 6L8.67065 10" stroke="currentColor" strokeWidth="1.75" /></svg>;
}
function Arrow({ className = '' }) {
  return <svg className={`site-hover-arrow ${className}`} width="10" height="8" viewBox="0 0 10 8" fill="none" aria-hidden="true"><path fill="currentColor" d="M9.752 3.913 5.87 7.825l-.959-.951 2.27-2.287H0v-1.35h7.18L4.912.951 5.871 0z" /></svg>;
}
function Hamburger({ open = false }) {
  return <svg className="site-hamburger" data-open={open} width="40" height="40" viewBox="0 0 100 100" aria-hidden="true"><rect className="site-hamburger-bg" width="100" height="100" /><rect className="site-hamburger-line line-1" width="40" height="5" x="30" y="38" /><rect className="site-hamburger-line line-2" width="40" height="5" x="30" y="48" /><rect className="site-hamburger-line line-3" width="40" height="5" x="30" y="48" /><rect className="site-hamburger-line line-4" width="40" height="5" x="30" y="58" /></svg>;
}
function BackMark() {
  return <svg width="6" height="10" viewBox="0 0 6 10" fill="none" aria-hidden="true"><path fill="currentColor" d="M.618 5.238 0 4.62.618 4l4-4 1.238 1.238-3.38 3.381L5.856 8 4.618 9.238z" /></svg>;
}
function Destination({ href: originalHref, children, ...props }) {
  const design = useContext(HeaderDesignContext);
  const href = resolveDesignHref(originalHref, design);
  return <a href={href} {...(href.startsWith('https:') ? { target: '_blank', rel: 'noreferrer' } : {})} {...props}>{children}</a>;
}
function Brand({ onClick }) {
  return <Destination className="site-brand" href="/#site-top" aria-label="კრედო ბანკი" onClick={onClick}><LogoArt /></Destination>;
}
function MenuLink({ item, onChoose, desktop = false, showDetail = true }) {
  const link = <Destination className="site-product-link" href={item.href} onClick={onChoose}><span className="site-product-title">{item.label}<Arrow /></span>{showDetail && item.detail && <span className="site-product-detail">{item.detail}</span>}</Destination>;
  return desktop ? <NavigationMenu.Link asChild>{link}</NavigationMenu.Link> : link;
}
function Group({ group, desktop = false, onChoose }) {
  const design = useContext(HeaderDesignContext);
  const href = design === 2 && group.id === 'loans' ? '/loans' : group.href;
  const trackSide = event => {
    const bounds = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty('--entry-side', event.clientX < bounds.x + bounds.width / 2 ? 'left' : 'right');
  };
  return <section className="site-product-group" onPointerEnter={trackSide} aria-labelledby={`nav-${desktop ? 'desktop' : 'mobile'}-${group.id}`}>
    <h3 id={`nav-${desktop ? 'desktop' : 'mobile'}-${group.id}`}>{href ? (desktop ? <NavigationMenu.Link asChild><Destination className="site-group-heading-link" href={href} onClick={onChoose}>{group.label}</Destination></NavigationMenu.Link> : <Destination className="site-group-heading-link" href={href} onClick={onChoose}>{group.label}</Destination>) : group.label}</h3>
    <ul>{group.links.map(item => <li key={item.href}><MenuLink item={item} desktop={desktop} onChoose={onChoose} showDetail={false} /></li>)}</ul>
  </section>;
}
function Featured({ onChoose }) {
  return <Destination href="https://credobank.ge/rcheuli" className="site-featured" onClick={onChoose}><img src="/assets/news/credo/rcheuli-lounge-saburtalo.webp" alt="კრედოს რჩეული ლაუნჯი" /><div className="site-featured-copy"><span>კრედო რჩეული</span><p>შენზე მორგებული საბანკო გამოცდილება.</p><span className="site-featured-cta">გაიცანი რჩეული<Arrow /></span></div></Destination>;
}
function ConsumerPanel({ onChoose }) {
  const byId = id => consumerGroups.find(group => group.id === id);
  return <div className="site-consumer-panel">
    <div className="site-products-grid">
      <div><Group group={byId('loans')} desktop onChoose={onChoose} /></div>
      <div><Group group={byId('cards')} desktop onChoose={onChoose} /></div>
      <div><Group group={byId('deposits')} desktop onChoose={onChoose} /><Group group={byId('installments')} desktop onChoose={onChoose} /></div>
      <div><Group group={byId('insurance')} desktop onChoose={onChoose} /></div>
    </div>
    <aside className="site-menu-sidebar"><Group group={byId('services')} desktop onChoose={onChoose} /><Featured onChoose={onChoose} /></aside>
    <div className="site-menu-footer"><NavigationMenu.Link asChild><Destination className="site-footer-link" href="/#products" onClick={onChoose}>ყველა სამომხმარებლო პროდუქტი<Arrow /></Destination></NavigationMenu.Link></div>
  </div>;
}
function SpacesPanel({ onChoose, desktop = false }) {
  return <ul className="site-spaces-panel">{spaceLinks.map(item => <li key={item.href}><MenuLink item={item} desktop={desktop} onChoose={onChoose} showDetail={false} /></li>)}</ul>;
}
function CompactPanel({ section, onChoose }) {
  return <div className={`site-compact-panel site-panel-${section.id}`}>
    <div className="site-compact-groups">{section.groups.map(group => <Group key={group.id} group={group} desktop onChoose={onChoose} />)}</div>
    <aside className="site-compact-aside"><p>{section.id === 'banking' ? 'ბანკი ყოველთვის შენთან' : 'შენთან ერთად, ყოველდღე'}</p><MenuLink item={{ label: 'ვიდეო ბანკი', href: videoHref }} onChoose={onChoose} desktop showDetail={false} /></aside>
  </div>;
}
const mobileMotion = {
  enter: direction => ({ x: `${direction * 20}%`, opacity: 0 }),
  visible: { x: 0, opacity: 1 },
  exit: direction => ({ x: `${direction * -20}%`, opacity: 0 }),
};
function MobileMenu({ onOpen }) {
  const [open, setOpen] = useState(false);
  const [sectionId, setSectionId] = useState('');
  const [direction, setDirection] = useState(1);
  const backRef = useRef(null);
  const firstRef = useRef(null);
  const section = navigationSections.find(item => item.id === sectionId);
  const chooseSection = id => { setDirection(id ? 1 : -1); setSectionId(id); };
  const close = () => setOpen(false);
  useEffect(() => {
    const desktop = window.matchMedia('(min-width:1200px)');
    const closeOnDesktop = () => { if (desktop.matches) setOpen(false); };
    desktop.addEventListener('change', closeOnDesktop);
    return () => desktop.removeEventListener('change', closeOnDesktop);
  }, []);
  useEffect(() => {
    if (open) (sectionId ? backRef : firstRef).current?.focus({ preventScroll: true });
  }, [sectionId, open]);
  return <Dialog.Root open={open} onOpenChange={value => { setOpen(value); if (value) { setSectionId(''); onOpen(); } }}>
    <Dialog.Trigger className="site-mobile-toggle" aria-label="მენიუს გახსნა"><Hamburger /></Dialog.Trigger>
    <Dialog.Portal><Dialog.Overlay className="site-mobile-overlay" /><Dialog.Content className="site-mobile-dialog" aria-describedby={undefined}>
      <Dialog.Title className="site-sr-only">მთავარი მენიუ</Dialog.Title>
      <div className="site-mobile-heading">{section ? <button ref={backRef} className="site-back-button" onClick={() => chooseSection('')}><BackMark />უკან</button> : <Brand onClick={close} />}<Dialog.Close className="site-mobile-close" aria-label="მენიუს დახურვა"><Hamburger open /></Dialog.Close></div>
      <AnimatePresence initial={false} custom={direction}>
        <motion.div key={sectionId || 'root'} className="site-mobile-stage" custom={direction} variants={mobileMotion} initial="enter" animate="visible" exit="exit" transition={{ x: { duration: .5, ease: [.4, 0, .2, 1] }, opacity: { duration: .25 } }}>
          {section ? <div className="site-mobile-products">{sectionId === 'space' ? <SpacesPanel onChoose={close} /> : section.groups.map(group => <Group key={group.id} group={group} onChoose={close} />)}{sectionId === 'consumer' && <Featured onChoose={close} />}</div> : <nav aria-label="მობილური ნავიგაცია"><ul className="site-mobile-root-list">
            {navigationSections.filter(item => item.id !== 'banking').map((item, index) => <li key={item.id}><button ref={index === 0 ? firstRef : undefined} onClick={() => chooseSection(item.id)}>{item.label}<Chevron /></button></li>)}
            <li><Destination href={contactHref} onClick={close}>კონტაქტი<Arrow /></Destination></li>
            <li><button onClick={() => chooseSection('banking')}>ინტერნეტბანკი<Chevron /></button></li>
            <li><Destination href={englishHref} lang="en" onClick={close}><span className="site-mobile-language"><GlobeIcon />English</span><Arrow /></Destination></li>
          </ul><Destination href="/#products" className="site-mobile-all" onClick={close}><span>ყველა პროდუქტი<small>შენზე მორგებული შესაძლებლობები</small></span><Arrow /></Destination></nav>}
        </motion.div>
      </AnimatePresence>
      <div className="site-mobile-footer"><Destination href={videoHref} className="site-action site-action-secondary" onClick={close}>ვიდეო ბანკი<Arrow /></Destination><button className="site-action site-action-primary" onClick={() => chooseSection('banking')}>ინტერნეტბანკი<Arrow /></button></div>
    </Dialog.Content></Dialog.Portal>
  </Dialog.Root>;
}
function DesktopPanel({ section, value, visualValue, onChoose, panelRef }) {
  const index = navigationSections.findIndex(item => item.id === section.id);
  const visualIndex = navigationSections.findIndex(item => item.id === visualValue);
  return <NavigationMenu.Content forceMount ref={panelRef} className="site-nav-content" data-panel={section.id} data-visible={section.id === visualValue} data-side={index < visualIndex ? 'start' : 'end'} inert={section.id !== value ? true : undefined} aria-hidden={section.id !== value}>
    {section.id === 'consumer' ? <ConsumerPanel onChoose={onChoose} /> : section.id === 'space' ? <SpacesPanel onChoose={onChoose} desktop /> : <CompactPanel section={section} onChoose={onChoose} />}
  </NavigationMenu.Content>;
}
export default function SiteHeader({ design = 1 }) {
  const nav = useDesktopNavigationMotion();
  const { value, visualValue, close } = nav;
  return <HeaderDesignContext.Provider value={design}><header className="site-header" id="site-top" data-nav-input={nav.input}>
    <div className="site-nav-backdrop" data-open={Boolean(value)} aria-hidden="true" onPointerDown={close} />
    <div className="site-header-layout"><NavigationMenu.Root ref={nav.frameRef} className="site-nav-frame" value={value} onValueChange={nav.changeValue} delayDuration={100} skipDelayDuration={300} aria-label="მთავარი ნავიგაცია" data-open={nav.presented} data-expanded={Boolean(value)} data-phase={nav.phase} onKeyDownCapture={nav.onKeyDownCapture} onPointerMoveCapture={nav.onPointerMoveCapture}>
      <NavigationMenu.List className="site-nav-list">
        <li className="site-brand-item"><Brand onClick={close} /></li>
        {navigationSections.filter(section => section.id !== 'banking').map(section => <NavigationMenu.Item value={section.id} className="site-desktop-item" key={section.id}>
          <NavigationMenu.Trigger className="site-nav-link" data-nav-trigger={section.id}>{section.label}<Chevron /></NavigationMenu.Trigger>
          {nav.presented && <DesktopPanel section={section} value={value} visualValue={visualValue} onChoose={close} panelRef={nav.registerPanel} />}
        </NavigationMenu.Item>)}
        <NavigationMenu.Item className="site-desktop-item"><NavigationMenu.Link asChild><Destination className="site-nav-link" href={contactHref} onClick={close}>კონტაქტი</Destination></NavigationMenu.Link></NavigationMenu.Item>
        <li className="site-video-item"><Destination className="site-action site-action-secondary" href={videoHref}>ვიდეო ბანკი<Arrow /></Destination></li>
        <NavigationMenu.Item value="banking" className="site-desktop-item site-bank-item"><NavigationMenu.Trigger className="site-action site-action-primary" data-nav-trigger="banking">ინტერნეტბანკი<Chevron /></NavigationMenu.Trigger>{nav.presented && <DesktopPanel section={navigationSections.find(section => section.id === 'banking')} value={value} visualValue={visualValue} onChoose={close} panelRef={nav.registerPanel} />}</NavigationMenu.Item>
        <li className="site-search-item"><Search onOpen={close} design={design} /></li>
        <li className="site-desktop-item site-language-item"><Destination href={englishHref} className="site-language" lang="en" aria-label="English website"><GlobeIcon />EN</Destination></li>
        <li className="site-mobile-item"><MobileMenu onOpen={close} /></li>
      </NavigationMenu.List>
      <div className="site-viewport-position"><NavigationMenu.Viewport forceMount ref={nav.viewportRef} className="site-nav-viewport" inert={!value ? true : undefined} aria-hidden={!value} /></div>
    </NavigationMenu.Root></div>
  </header></HeaderDesignContext.Provider>;
}
