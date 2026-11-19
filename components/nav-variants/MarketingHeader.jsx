'use client';

// A · Marketing — Mariam's "სეგმენტური მეგა-მენიუ" (Menu-v2, claude.ai/artifact/BHk843Qzwa4f9aebQNhthV),
// rebuilt one-to-one: segment chips beside the logo, a coral/navy bar with the ფიზიკური ⇄ ბიზნესი switch,
// a tab row inside პროდუქტები, columns with counts and „საკუთარი გვერდი" badges, and the „მთავარი პროდუქტი" card.
// Data is her own file (menu-v2.json); open/close motion is the production header's.
import { useState } from 'react';
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import { GlobeIcon } from '@radix-ui/react-icons';
import Search from '../SiteSearch';
import { Arrow, Brand, Chevron, Destination } from '../SiteHeader';
import { useDesktopNavigationMotion } from '../useDesktopNavigationMotion';
import { englishHref, videoHref } from '../../data/site-navigation.mjs';
import DATA from './menu-v2.json';
import { Frame, MobileMenu } from './VariantHeader';
import { href } from './data.mjs';

const SEGS = [['all', 'ყველა'], ['rcheuli', 'რჩეული'], ['emigrants', 'ემიგრანტები'], ['expats', 'ექსპატები']];
const SEGFOR = { all: 'ყველასთვის', rcheuli: 'რჩეულის სეგმენტისთვის', emigrants: 'ემიგრანტებისთვის', expats: 'ექსპატებისთვის' };
// Her one segment-specific featured override.
const FEAT_SEG = { personal: { emigrants: 'იპოთეკური სესხი' }, business: {} };
const SECTION_IDS = ['products', 'services', 'offers', 'about', 'career', 'contact', 'media', 'hub'];

/* ---------- Her filtering rules, unchanged ---------- */
function rules(biz, seg) {
  const set = biz ? DATA.business : DATA.personal;
  const ok = it => (it.only ? it.only.includes(seg) : seg === 'all' || Boolean(it.av?.[seg]));
  // a product listed in two columns is still one product
  const countOf = node => new Set((node.cols ?? []).flatMap(c => c.items.filter(ok).map(i => i.name))).size;
  const secCount = s => (s.tabs ? set.tabs.reduce((n, t) => n + countOf(t), 0) : countOf(s));
  // what the segment has nothing in disappears from the menu
  const emptySec = s => Boolean(s.tabs || s.cols?.length) && secCount(s) === 0;
  const query = seg === 'all' ? '' : `${biz ? '?business&filter=' : '?filter='}${seg}`;
  const itemHref = i => href((seg !== 'all' && i.av?.[seg]) || i.url || '') || '#';
  const columns = node => (node.cols ?? []).map((c, n) => ({
    id: `${n}-${c.name}`, name: c.name, count: c.items.filter(ok).length,
    href: c.url ? href(c.url + query) : undefined,
    items: c.items.filter(ok).map(i => ({ name: i.name, href: itemHref(i), own: seg !== 'all' && Boolean(i.av?.[seg]) && i.av[seg] !== i.url, kids: (i.kids ?? []).map(k => ({ name: k.name, href: href(k.url) })) })),
  })).filter(c => c.items.length);
  return { set, ok, countOf, secCount, emptySec, columns, query };
}

/* ---------- Panel ---------- */
function Featured({ feat, cols, onChoose }) {
  const product = feat.product || '[მთავარი პროდუქტი]';
  const match = cols.flatMap(c => c.items).find(i => i.name === product || product.includes(i.name) || i.name.includes(product));
  return <aside className="nvm-feat">
    <span className="nvm-feat-eyebrow">მთავარი პროდუქტი</span>
    <strong>{product}</strong>
    {feat.line && <p>{feat.line}</p>}
    <div className="nvm-feat-visual" aria-hidden="true" />
    <NavigationMenu.Link asChild><Destination className="nvm-feat-cta" href={match?.href ?? cols[0]?.href ?? '#'} onClick={onChoose}>{feat.cta || 'მეტის ნახვა'}<Arrow /></Destination></NavigationMenu.Link>
  </aside>;
}
function Columns({ cols, onChoose }) {
  const [shut, setShut] = useState({});
  return <div className="nvm-cols">{cols.map(c => <section key={c.id} className="nvm-col">
    {c.name && <h3>{c.href ? <NavigationMenu.Link asChild><Destination href={c.href} onClick={onChoose}>{c.name} <span>({c.count})</span></Destination></NavigationMenu.Link> : <>{c.name} <span>({c.count})</span></>}</h3>}
    <ul>{c.items.map(i => <li key={i.name}>
      <div className="nvm-item">
        <NavigationMenu.Link asChild><Destination className="site-product-link" href={i.href} onClick={onChoose}><span className="site-product-title">{i.name}<Arrow /></span></Destination></NavigationMenu.Link>
        {i.kids.length > 0 && <button type="button" className="nvm-kids-toggle" aria-expanded={!shut[i.name]} aria-label={`${i.name}: ქვეგვერდები`} onClick={() => setShut(s => ({ ...s, [i.name]: !s[i.name] }))}>{shut[i.name] ? '+' : '−'}</button>}
        {i.own && <span className="nvm-own">საკუთარი გვერდი</span>}
      </div>
      {i.kids.length > 0 && !shut[i.name] && <ul className="nvm-kids">{i.kids.map(k => <li key={k.name}><NavigationMenu.Link asChild><Destination className="site-product-link" href={k.href} onClick={onChoose}><span className="site-product-title">{k.name}<Arrow /></span></Destination></NavigationMenu.Link></li>)}</ul>}
    </li>)}</ul>
  </section>)}</div>;
}
function Empty({ title, seg }) {
  return <div className="nvm-empty">
    <strong>{title} {SEGFOR[seg]} ამჟამად ხელმისაწვდომი არ არის</strong>
    <div><a className="nvm-whatsapp" href="#whatsapp-url-later">WhatsApp-ით მოგვწერე</a><Destination className="site-action site-action-secondary" href={videoHref}>ვიდეო ბანკი<Arrow /></Destination></div>
  </div>;
}
function Panel({ section, r, biz, seg, onChoose }) {
  const [tab, setTab] = useState(0);
  const live = section.tabs ? r.set.tabs.map((t, i) => ({ t, i, n: r.countOf(t) })).filter(x => x.n > 0) : [];
  const ti = live.some(x => x.i === tab) ? tab : live[0]?.i ?? 0;
  const src = section.tabs ? r.set.tabs[ti] : section;
  const cols = r.columns(src);
  let feat = src.feat ?? {};
  const fx = FEAT_SEG[biz ? 'business' : 'personal'][seg];
  if (fx && section.tabs) feat = { product: fx, cta: feat.cta || 'მეტის ნახვა', line: feat.line };
  return <div className="nvm-panel">
    {section.tabs && <div className="nvm-tabs" role="tablist" aria-label="პროდუქტის კატეგორია">
      {live.map(({ t, i, n }) => <button key={t.title} type="button" role="tab" aria-selected={i === ti} className="nvm-tab" onClick={() => setTab(i)}>{t.label || t.title}{seg !== 'all' && <span> ({n})</span>}</button>)}
    </div>}
    <div className="nvm-body">
      {cols.length ? <Columns key={`${ti}-${seg}-${biz}`} cols={cols} onChoose={onChoose} /> : <Empty title={src.title} seg={seg} />}
      {cols.length > 0 && <Featured feat={feat} cols={cols} onChoose={onChoose} />}
    </div>
  </div>;
}

/* ---------- Mobile: her sections as drill-down groups ---------- */
function mobileSections(r, sections, seg) {
  return sections.map(({ s, id }) => {
    const label = s.title;
    // The shared mobile Group keys links by href, and her data reuses a URL inside some columns.
    const unique = list => list.map((l, n) => (list.findIndex(x => x.href === l.href) === n ? l : { ...l, href: `${l.href}#${n}` }));
    const toGroups = (node, prefix) => r.columns(node).map(c => ({ id: `${id}-${prefix}-${c.id}`, label: [prefix, c.name].filter(Boolean).join(' · ') || label, href: c.href, links: unique(c.items.flatMap(i => [{ label: i.name, href: i.href }, ...i.kids.map(k => ({ label: k.name, href: k.href }))])) }));
    if (s.tabs) return { id, label, kind: 'compact', groups: r.set.tabs.filter(t => r.countOf(t) > 0).flatMap(t => toGroups(t, t.label || t.title)) };
    if (s.dd) return { id, label, kind: 'compact', groups: toGroups(s, '') };
    return { id, label, href: href(s.url + (seg === 'all' ? '' : r.query)) };
  });
}

export function MarketingHeader() {
  const [biz, setBiz] = useState(false);
  const [seg, setSeg] = useState('all');
  const nav = useDesktopNavigationMotion();
  const r = rules(biz, seg);
  const sections = r.set.sections.map((s, i) => ({ s, id: SECTION_IDS[i] ?? `s${i}` })).filter(({ s }) => !r.emptySec(s));
  const pickSeg = value => { setSeg(value); if (value === 'emigrants') setBiz(false); };
  // ბიზნესი has no emigrants column, so that pair falls back to ყველა
  const toggleAudience = () => { nav.close(); if (!biz && seg === 'emigrants') setSeg('all'); setBiz(!biz); };
  const panelIds = sections.filter(({ s }) => s.dd || s.tabs).map(({ id }) => id);
  const visualIndex = panelIds.indexOf(nav.visualValue);
  const chips = <div className="nvm-chips" role="group" aria-label="სეგმენტი">
    {SEGS.map(([value, label]) => <button key={value} type="button" className="nvm-chip" data-premium={value === 'rcheuli' ? '' : undefined} aria-pressed={seg === value} onClick={() => pickSeg(value)}>{label}</button>)}
  </div>;
  const audienceSwitch = <button type="button" className="nvm-audience" role="switch" aria-checked={biz} aria-label="ბიზნესი" onClick={toggleAudience}>
    <span data-on={!biz}>ფიზიკური</span><span className="nvm-track"><span /></span><span data-on={biz}>ბიზნესი</span>
  </button>;

  return <header className="site-header nvx-header nvm-header" id="site-top" data-variant="a" data-audience={biz ? 'business' : 'personal'} data-nav-input={nav.input}>
    <div className="site-nav-backdrop" data-open={Boolean(nav.value)} aria-hidden="true" onPointerDown={nav.close} />
    <div className="site-header-layout">
      <div className="nvx-segment-row nvm-top">
        <Brand onClick={nav.close} />
        <span className="nvx-desktop-only">{chips}</span>
        <div className="nvx-row-actions">
          <Destination className="site-action site-action-secondary nvx-desktop-only" href={videoHref}>ვიდეო ბანკი<Arrow /></Destination>
          <Destination className="site-action site-action-primary nvx-desktop-only" href="https://onelink.to/mycredo">ინტერნეტბანკი<Arrow /></Destination>
          <Destination href={englishHref} className="site-language nvx-desktop-only" lang="en" aria-label="English website"><GlobeIcon />EN</Destination>
          <Search onOpen={nav.close} />
          <span className="nvx-mobile-only"><MobileMenu key={`${biz}-${seg}`} sections={mobileSections(r, sections, seg)} onOpen={nav.close} intro={<div className="nvm-mobile-intro">{audienceSwitch}{chips}</div>} /></span>
        </div>
      </div>
      <Frame nav={nav} label="მთავარი ნავიგაცია">
        <li className="site-desktop-item nvm-audience-item">{audienceSwitch}</li>
        {sections.map(({ s, id }) => {
          const count = r.secCount(s);
          const label = <>{s.title}{count > 0 && <span className="nvm-count"> ({count})</span>}</>;
          if (!(s.dd || s.tabs)) return <NavigationMenu.Item key={id} className="site-desktop-item"><NavigationMenu.Link asChild><Destination className="site-nav-link" href={href(s.url + (seg === 'all' ? '' : r.query))} onClick={nav.close}>{label}</Destination></NavigationMenu.Link></NavigationMenu.Item>;
          const index = panelIds.indexOf(id);
          return <NavigationMenu.Item key={id} value={id} className="site-desktop-item">
            <NavigationMenu.Trigger className="site-nav-link" data-nav-trigger={id}>{label}<Chevron /></NavigationMenu.Trigger>
            {nav.presented && <NavigationMenu.Content forceMount ref={nav.registerPanel} className="site-nav-content" data-panel={id} data-visible={id === nav.visualValue} data-side={index < visualIndex ? 'start' : 'end'} inert={id !== nav.value ? true : undefined} aria-hidden={id !== nav.value}>
              <Panel key={`${biz}-${seg}`} section={s} r={r} biz={biz} seg={seg} onChoose={nav.close} />
            </NavigationMenu.Content>}
          </NavigationMenu.Item>;
        })}
      </Frame>
    </div>
  </header>;
}
