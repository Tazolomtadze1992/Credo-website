'use client';

import { useState } from 'react';
import ShopFilterDrawer, { CloseIcon } from './shop-filter-drawer';
import { PREVIEW_AVAILABILITY, emptyFilters, matchesFilters, selectedFilters, toggleFilter } from './shop-filters.mjs';
import styles from './shops.module.css';

const asset = name => `/assets/dayavi/shops/${name}`;
const PARTNER_LIST_URL = 'https://s3.eu-central-1.amazonaws.com/cms-storage.noxtton.com/4d1adfab-72a3-4e62-8634-b2211be4f51f.pdf';
const shops = [
  { id: 'elite', months: 10, name: 'Elite', category: 'tech', description: 'ტექნიკა სახლისა და ყოველდღიურობისთვის', url: 'https://ee.ge/', image: 'elite.webp', logo: 'elite-mark.png', alt: 'Elite-ის მაღაზიის ფასადი' },
  { id: 'zoommer', months: 6, name: 'Zoommer', category: 'tech', description: 'სმარტფონები, კომპიუტერები და აქსესუარები', url: 'https://zoommer.ge/', image: 'zoommer.webp', logo: 'zoommer-mark.png', alt: 'ლეპტოპი ზუმერის კოლექციიდან', photoClass: 'zoommerPhoto' },
  { id: 'ispace', months: 4, name: 'iSpace', category: 'tech', description: 'Apple-ის ტექნიკა და აქსესუარები', url: 'https://ispace.ge/', image: 'ispace.webp', logo: 'ispace-logo.webp', alt: 'iSpace-ის მაღაზიის ინტერიერი' },
  { id: 'dressup', months: 4, name: 'Dressup', category: 'fashion', description: 'ტანსაცმელი, ფეხსაცმელი და აქსესუარები', url: 'https://dressup.ge/ka/', image: 'dressup.webp', logo: 'dressup-mark.png', alt: 'Dressup-ის ტანსაცმლის კოლექცია' },
  { id: 'embawood', months: 10, name: 'Embawood', category: 'home', description: 'ავეჯი შენი სახლისთვის', url: 'https://embawood.ge/', image: 'embawood.webp', logo: 'embawood-mark.png', alt: 'Embawood-ის რბილი ავეჯი', photoClass: 'embawoodPhoto' },
  { id: 'domino', months: 10, name: 'Domino', category: 'home', description: 'სახლი, რემონტი და ბაღი', url: 'https://www.domino.com.ge/', image: 'domino.webp', logo: 'domino-logo.webp', alt: 'დომინოს ინტერიერის კოლექცია', photoClass: 'dominoPhoto' },
];
const previewShops = shops.map(shop => ({ ...shop, ...PREVIEW_AVAILABILITY[shop.id] }));

export default function Shops() {
  const [applied, setApplied] = useState(emptyFilters);
  const visible = previewShops.filter(shop => matchesFilters(shop, applied));
  const selections = selectedFilters(applied);
  return <section className={styles.section} id="dayavi-shops" aria-labelledby="dayavi-shops-title">
    <header className={styles.header}>
      <h2 id="dayavi-shops-title">პარტნიორი მაღაზიები</h2>
      <ShopFilterDrawer applied={applied} shops={previewShops} onApply={setApplied} />
    </header>
    <p className={styles.srOnly} role="status">{visible.length} მაღაზია</p>
    {selections.length > 0 && <div className={styles.appliedFilters}>
      <ul className={styles.chips} aria-label="არჩეული ფილტრები">
        {selections.map(selection => <li key={`${selection.group}:${selection.id}`}><button type="button" className={styles.chip} aria-label={`მოხსნა: ${selection.label}`} onClick={() => setApplied(value => toggleFilter(value, selection.group, selection.id))}>{selection.label}<CloseIcon size={12} /></button></li>)}
      </ul>
      <button type="button" className={styles.clearAll} onClick={() => setApplied(emptyFilters())}>გასუფთავება</button>
    </div>}
    {!visible.length && <div className={styles.empty}>
      <h3>მაღაზია ვერ მოიძებნა</h3>
      <p>სცადე სხვა ფილტრები.</p>
      <button type="button" className={`action action-secondary ${styles.reset}`} onClick={() => setApplied(emptyFilters())}>ფილტრების გასუფთავება</button>
    </div>}
    <ul className={styles.grid}>
      {visible.map(shop => <li key={shop.id}>
        <a className={styles.card} href={shop.url} target="_blank" rel="noopener noreferrer" aria-label={`${shop.name} — დაყავი ${shop.months} თვემდე 0% — მაღაზიის ვებსაიტი`}>
          <div className={styles.cover}><img className={`${styles.photo} ${shop.photoClass ? styles[shop.photoClass] : ''}`} src={asset(shop.image)} alt={shop.alt} width="800" height="450" loading="lazy" /><span className={styles.badge}>დაყავი {shop.months} თვემდე 0%</span></div>
          <div className={styles.body}>
            <span className={styles.logo}><img src={asset(shop.logo)} data-shop={shop.id} alt="" width="56" height="56" loading="lazy" /></span>
            <h3>{shop.name}</h3>
            <p>{shop.description}</p>
          </div>
        </a>
      </li>)}
    </ul>
    {visible.length > 0 && <div className={styles.footer}><a className={`action action-secondary ${styles.showAll}`} href={PARTNER_LIST_URL} target="_blank" rel="noopener noreferrer" aria-label="ყველას ჩვენება">{'ყველას ჩვენება'.toUpperCase()}</a></div>}
  </section>;
}
