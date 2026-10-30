'use client';

// Ported from Credo-web-variants: components/SiteHeader.jsx (consumer dropdown only).
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import { consumerGroups } from '../../data/site-navigation.mjs';
import './navigation.css';

export function Arrow({ className = '' }) {
  return <svg className={`site-hover-arrow ${className}`} width="10" height="8" viewBox="0 0 10 8" fill="none" aria-hidden="true"><path fill="currentColor" d="M9.752 3.913 5.87 7.825l-.959-.951 2.27-2.287H0v-1.35h7.18L4.912.951 5.871 0z" /></svg>;
}
function Destination({ href, children, ...props }) {
  return <a href={href} {...(href.startsWith('https:') ? { target: '_blank', rel: 'noreferrer' } : {})} {...props}>{children}</a>;
}
function MenuLink({ item, onChoose, desktop = false, showDetail = true }) {
  const link = <Destination className="site-product-link" href={item.href} onClick={onChoose}><span className="site-product-title">{item.label}<Arrow /></span>{showDetail && item.detail && <span className="site-product-detail">{item.detail}</span>}</Destination>;
  return desktop ? <NavigationMenu.Link asChild>{link}</NavigationMenu.Link> : link;
}
function Group({ group, desktop = false, onChoose }) {
  const trackSide = event => {
    const bounds = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty('--entry-side', event.clientX < bounds.x + bounds.width / 2 ? 'left' : 'right');
  };
  return <section className="site-product-group" onPointerEnter={trackSide} aria-labelledby={`nav-${desktop ? 'desktop' : 'mobile'}-${group.id}`}>
    <h3 id={`nav-${desktop ? 'desktop' : 'mobile'}-${group.id}`}>{group.href ? <a href={group.href} onClick={onChoose}>{group.label}</a> : group.label}</h3>
    <ul>{group.links.map(item => <li key={item.href + item.label}><MenuLink item={item} desktop={desktop} onChoose={onChoose} showDetail={false} /></li>)}</ul>
  </section>;
}
function Featured({ onChoose }) {
  return <Destination href="https://credobank.ge/rcheuli" className="site-featured" onClick={onChoose}><img src="/design-two/images/news/rcheuli-lounge-saburtalo.webp" alt="კრედოს რჩეული ლაუნჯი" /><div className="site-featured-copy"><span>კრედო რჩეული</span><p>შენზე მორგებული საბანკო გამოცდილება.</p><span className="site-featured-cta">გაიცანი რჩეული<Arrow /></span></div></Destination>;
}
export function ConsumerPanel({ onChoose }) {
  const byId = id => consumerGroups.find(group => group.id === id);
  return <div className="site-consumer-panel">
    <div className="site-products-grid">
      <div><Group group={byId('loans')} desktop onChoose={onChoose} /></div>
      <div><Group group={byId('cards')} desktop onChoose={onChoose} /></div>
      <div><Group group={byId('deposits')} desktop onChoose={onChoose} /><Group group={byId('installments')} desktop onChoose={onChoose} /></div>
      <div><Group group={byId('insurance')} desktop onChoose={onChoose} /></div>
    </div>
    <aside className="site-menu-sidebar"><Group group={byId('services')} desktop onChoose={onChoose} /><Featured onChoose={onChoose} /></aside>
    <div className="site-menu-footer"><NavigationMenu.Link asChild><a className="site-footer-link" href="/?v=2#products" onClick={onChoose}>ყველა სამომხმარებლო პროდუქტი<Arrow /></a></NavigationMenu.Link></div>
  </div>;
}
