'use client';

import { useEffect, useRef, useState } from 'react';
import { centers } from '../expats-data.mjs';
import { Contacts, DirectionsLinks, Heading, Icon, Status, toLngLat, useMap, useNear, useOpenStatus, usePins, useReducedMotion } from './shared';
import c from './centers.module.css';

const DWELL = 7000;
const BEARING = [-30, 20, -10, 35];

/* E — a slow, cinematic flight between the centers over a white 3D model
   of the city. Each stop holds for a few seconds while the camera turns;
   hovering pauses, the arrows step through by hand. */
export default function Tour() {
  const [ref, near] = useNear();
  const [seen, setSeen] = useState(false);
  const status = useOpenStatus();
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);
  const [hover, setHover] = useState(false);
  const [box, api] = useMap(near, {
    theme: 'light', extrude: true, interactive: false,
    center: toLngLat(centers[0]), zoom: 15.6, pitch: 62, bearing: BEARING[0], attributionControl: { compact: true },
  });
  usePins(api, centers, centers[i].id);
  const stage = useRef(null);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setSeen(e.isIntersecting), { threshold: .3 });
    io.observe(stage.current);
    return () => io.disconnect();
  }, []);

  // fly to the stop, then turn slowly around it
  useEffect(() => {
    if (!api) return;
    const { map } = api, to = centers[i], b = BEARING[i];
    const far = map.getCenter().distanceTo(new api.lib.LngLat(to.lng, to.lat)) > 50000;
    if (reduce) { map.jumpTo({ center: toLngLat(to), zoom: 15.6, pitch: 62, bearing: b }); return; }
    map.flyTo({ center: toLngLat(to), zoom: 15.6, pitch: 62, bearing: b, duration: far ? 4200 : 2600, curve: far ? 1.8 : 1.3, essential: true });
    const turn = () => map.easeTo({ bearing: b + 24, duration: DWELL + 4000, easing: t => t, essential: true });
    map.once('moveend', turn);
    return () => map.off('moveend', turn);
  }, [api, i, reduce]);

  const run = seen && !hover && !reduce && !!api;
  const next = () => setI(k => (k + 1) % centers.length);
  const prev = () => setI(k => (k - 1 + centers.length) % centers.length);
  const cn = centers[i];

  return <div className={c.tour}>
    <div className={c.tourHead}>
      <Heading rest="Take the tour before you visit." />
      <Contacts />
    </div>
    <div className={c.tourStage} ref={el => { stage.current = el; ref.current = el; }} onPointerEnter={e => e.pointerType === 'mouse' && setHover(true)} onPointerLeave={() => setHover(false)}>
      <div ref={box} className={c.mapBox} />
      <div className={c.tourCard}>
        <div className={c.tourTop}>
          <span className={c.tourCount}><b>{String(i + 1).padStart(2, '0')}</b> / {String(centers.length).padStart(2, '0')}</span>
          <span className={c.tourNav}>
            <button type="button" onClick={prev} aria-label="Previous center"><Icon d="M15 6l-6 6 6 6" /></button>
            <button type="button" onClick={next} aria-label="Next center"><Icon d="M9 6l6 6-6 6" /></button>
          </span>
        </div>
        <div className={c.tourBody} key={i}>
          <small>{cn.city}</small>
          <h3>{cn.district}</h3>
          <p>{cn.address}</p>
          <Status status={status} />
          <DirectionsLinks center={cn} />
        </div>
        <div className={c.tourBars}>
          {centers.map((x, k) => <button key={x.id} type="button" aria-label={`${x.district}, ${x.city}`} aria-current={k === i || undefined} onClick={() => setI(k)}>
            {k === i && <i key={i} style={{ animationDuration: `${DWELL}ms`, animationPlayState: run ? 'running' : 'paused' }} onAnimationEnd={next} />}
          </button>)}
        </div>
      </div>
    </div>
  </div>;
}
