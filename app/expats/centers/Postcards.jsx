'use client';

import { useMemo, useRef } from 'react';
import { centers } from '../expats-data.mjs';
import { Contacts, DirectionsLinks, Heading, HoursTable, Status, toLngLat, useMap, useNear, useOpenStatus, usePins, useReducedMotion } from './shared';
import c from './centers.module.css';

const BEARING = [-24, 18, -12, 28];

/* One card per center: a small 3D street model of the block it sits on,
   the neighbourhood's name, live status and directions. On hover the
   camera turns slowly around the building. */
function Card({ center, i, status, reduce }) {
  const [ref, near] = useNear('200px');
  const [box, api] = useMap(near, {
    theme: 'light', extrude: true, interactive: false,
    center: toLngLat(center), zoom: 16.2, pitch: 58, bearing: BEARING[i], attributionControl: false,
  });
  const one = useMemo(() => [center], [center]);
  usePins(api, one, center.id);
  const turning = useRef(false);
  function turn(on) {
    if (!api || reduce) return;
    turning.current = on;
    api.map.easeTo({ bearing: BEARING[i] + (on ? 40 : 0), zoom: on ? 16.6 : 16.2, duration: on ? 7000 : 1200, easing: on ? t => t : undefined });
  }
  return <li className={c.card} ref={ref} onPointerEnter={e => e.pointerType === 'mouse' && turn(true)} onPointerLeave={() => turn(false)}>
    <div className={c.cardMap}>
      <div ref={box} className={c.mapBox} />
      <span className={c.cardIndex}>{String(i + 1).padStart(2, '0')} / {String(centers.length).padStart(2, '0')}</span>
    </div>
    <div className={c.cardBody}>
      <small className={c.cardCity}>{center.city}</small>
      <h3>{center.district}</h3>
      <p>{center.address}</p>
      <Status status={status} />
      <DirectionsLinks center={center} />
    </div>
  </li>;
}

export default function Postcards() {
  const status = useOpenStatus();
  const reduce = useReducedMotion();
  return <div className={c.cards}>
    <div className={c.cardsHead}>
      <Heading rest="Four doors, one team.">
        Every center has English-speaking specialists and the same opening hours.
      </Heading>
      <div className={c.cardsSide}>
        <HoursTable status={status} />
        <Contacts />
      </div>
    </div>
    <ul className={c.cardList}>
      {centers.map((cn, i) => <Card key={cn.id} center={cn} i={i} status={status} reduce={reduce} />)}
    </ul>
    <p className={c.attrib}>Maps © <a href="https://openfreemap.org" target="_blank" rel="noreferrer">OpenFreeMap</a> © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors</p>
  </div>;
}
