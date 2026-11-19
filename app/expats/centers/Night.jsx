'use client';

import { useEffect, useState } from 'react';
import { centers } from '../expats-data.mjs';
import { Contacts, DirectionsLinks, Heading, HoursTable, Status, frame, useMap, useNear, useOpenStatus, usePins } from './shared';
import c from './centers.module.css';

const CITIES = ['Tbilisi', 'Batumi'];
const wide = () => typeof window !== 'undefined' && matchMedia('(min-width: 961px)').matches;

/* B — a full-bleed night map with a glass panel floating over it, like the
   dark AccessGrid section. Labelled pins glow in coral. */
export default function Night() {
  const [ref, near] = useNear();
  const status = useOpenStatus();
  const [city, setCity] = useState('Tbilisi');
  const [active, setActive] = useState(centers[1].id);
  const center = centers.find(cn => cn.id === active);
  const [box, api] = useMap(near, { theme: 'dark', center: [44.786, 41.712], zoom: 12.6 });
  usePins(api, centers, active, { labels: true, dark: true, onPick: id => { setActive(id); setCity(centers.find(cn => cn.id === id).city); } });
  // Follow the chosen center; in Tbilisi stay wide enough to see the others.
  useEffect(() => {
    if (!api) return;
    frame(api, [center], { zoom: center.city === 'Tbilisi' ? 13.3 : 15.2, duration: 2200, offset: wide() ? [210, 0] : [0, 0] });
  }, [api, active]); // eslint-disable-line react-hooks/exhaustive-deps
  function pickCity(name) {
    setCity(name);
    setActive(centers.find(cn => cn.city === name).id);
  }

  return <div className={c.night} ref={ref}>
    <div ref={box} className={c.mapBox} />
    <div className={c.nightShade} aria-hidden="true" />
    <div className={c.nightCard}>
      <Heading dark rest="Open six days a week." />
      <div className={`${c.seg} ${c.segDark}`} role="group" aria-label="City">
        {CITIES.map(name => <button key={name} type="button" aria-pressed={city === name} onClick={() => pickCity(name)}>
          {name}<span>{centers.filter(cn => cn.city === name).length}</span>
        </button>)}
      </div>
      <ul className={c.nightList}>
        {centers.filter(cn => cn.city === city).map(cn => <li key={cn.id}>
          <button type="button" aria-pressed={cn.id === active} onClick={() => setActive(cn.id)}>
            <b>{cn.district}</b><span>{cn.address}</span>
          </button>
        </li>)}
      </ul>
      <div className={c.nightDetail} key={active}>
        <Status status={status} className={c.statusDark} />
        <HoursTable status={status} className={c.hoursDark} />
        <DirectionsLinks center={center} dark />
      </div>
      <Contacts dark className={c.nightContacts} />
    </div>
  </div>;
}
