'use client';

import { useEffect, useState } from 'react';
import { centers } from '../expats-data.mjs';
import { Contacts, DirectionsLinks, Heading, HoursTable, Status, frame, useMap, useNear, useOpenStatus, usePins } from './shared';
import c from './centers.module.css';

const CITIES = [['All', centers.length], ['Tbilisi', 3], ['Batumi', 1]];

/* A — the classic locator, done properly: a list and a live map side by
   side. Picking a center flies the map to it; picking a pin opens its row. */
export default function Locator() {
  const [ref, near] = useNear();
  const status = useOpenStatus();
  const [city, setCity] = useState('All');
  const [active, setActive] = useState(null);
  const list = city === 'All' ? centers : centers.filter(cn => cn.city === city);
  const [box, api] = useMap(near, { theme: 'light', center: [43.2, 41.75], zoom: 6.2 });
  usePins(api, centers, active, { onPick: id => { setActive(id); setCity('All'); } });
  useEffect(() => {
    if (!api) return;
    frame(api, active ? centers.filter(cn => cn.id === active) : list, { padding: 72, duration: 1600 });
  }, [api, active, city]); // eslint-disable-line react-hooks/exhaustive-deps

  return <div className={c.loc}>
    <div className={c.locHead}>
      <Heading rest="Bank in person, in English.">
        Three centers in Tbilisi and one in Batumi, with specialists who look after expats every day.
      </Heading>
      <Contacts />
    </div>
    <div className={c.locFrame} ref={ref}>
      <div className={c.locPanel}>
        <div className={c.seg} role="group" aria-label="Filter by city">
          {CITIES.map(([name, n]) => <button key={name} type="button" aria-pressed={city === name} onClick={() => { setCity(name); setActive(null); }}>
            {name}<span>{n}</span>
          </button>)}
        </div>
        <ul className={c.locList}>
          {list.map(cn => { const on = cn.id === active; return <li key={cn.id} data-active={on || undefined}>
            <button type="button" className={c.locItem} aria-expanded={on} onClick={() => setActive(on ? null : cn.id)}>
              <span className={c.locNum}>{String(centers.indexOf(cn) + 1).padStart(2, '0')}</span>
              <span className={c.locText}><b>{cn.district}</b><span>{cn.address}</span><small>{cn.city}</small></span>
            </button>
            <div className={c.locMore} aria-hidden={!on}>
              <div>
                <Status status={status} />
                <HoursTable status={status} />
                <DirectionsLinks center={cn} />
              </div>
            </div>
          </li>; })}
        </ul>
        <footer className={c.locFoot}><Status status={status} /><span>Same hours at every center</span></footer>
      </div>
      <div className={c.locMap}><div ref={box} className={c.mapBox} /></div>
    </div>
  </div>;
}
