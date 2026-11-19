'use client';

import { useEffect, useRef, useState } from 'react';
import { centers } from '../expats-data.mjs';
import { GEORGIA } from './georgia-outline.mjs';
import { Contacts, DirectionsLinks, Heading, Status, useMap, useNear, useOpenStatus, usePins, useReducedMotion } from './shared';
import c from './centers.module.css';

const CITY = {
  Tbilisi: { lng: 44.793, lat: 41.712, lens: [.6, .14], zoom: 12.15, view: [44.788, 41.7105] },
  Batumi: { lng: 41.636, lat: 41.645, lens: [.12, .1], zoom: 14.2, view: [41.6188, 41.6441] },
};
const RING = [];
for (let k = 0; k < GEORGIA.length; k += 2) RING.push([GEORGIA[k], GEORGIA[k + 1]]);
const BOUNDS = RING.reduce((b, [x, y]) => [Math.min(b[0], x), Math.min(b[1], y), Math.max(b[2], x), Math.max(b[3], y)], [180, 90, -180, -90]);
const K = Math.cos(42 * Math.PI / 180); // equirectangular, true to scale at 42°N

function inside(x, y) {
  let hit = false;
  for (let i = 0, j = RING.length - 1; i < RING.length; j = i++) {
    const [xi, yi] = RING[i], [xj, yj] = RING[j];
    if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) hit = !hit;
  }
  return hit;
}

/* C — Georgia as a field of dots, the two cities pulsing on it, and a live
   map lens over whichever city you pick. */
export default function DotMap() {
  const [ref, near] = useNear();
  const status = useOpenStatus();
  const reduce = useReducedMotion();
  const [city, setCity] = useState('Tbilisi');
  const canvas = useRef(null), stage = useRef(null);
  const [lens, setLens] = useState(null);
  const [box, api] = useMap(near, { theme: 'light', interactive: false, center: CITY.Tbilisi.view, zoom: CITY.Tbilisi.zoom, attributionControl: false });
  usePins(api, centers, null);

  // dots, city pulses, the leader line to the lens and the Batumi–Tbilisi arc
  useEffect(() => {
    const el = canvas.current, ctx = el.getContext('2d');
    let raf, dots = [], proj, w = 0, h = 0, L = null;
    function layout() {
      const box = stage.current.getBoundingClientRect();
      w = box.width; h = box.height;
      const dpr = Math.min(devicePixelRatio, 2);
      el.width = w * dpr; el.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const pad = w < 600 ? 16 : 40;
      const sx = (BOUNDS[2] - BOUNDS[0]) * K, sy = BOUNDS[3] - BOUNDS[1];
      const s = Math.min((w - pad * 2) / sx, (h - pad * 2 - (w < 600 ? 0 : 40)) / sy);
      const ox = (w - sx * s) / 2, oy = h - pad - sy * s;
      proj = (lng, lat) => [ox + (lng - BOUNDS[0]) * K * s, oy + (BOUNDS[3] - lat) * s];
      const gap = w < 600 ? 4.5 : 6;
      dots = [];
      for (let y = oy; y < oy + sy * s; y += gap) for (let x = ox + ((y / gap) % 2) * gap / 2; x < ox + sx * s; x += gap) {
        const lng = BOUNDS[0] + (x - ox) / (K * s), lat = BOUNDS[3] - (y - oy) / s;
        if (inside(lng, lat)) dots.push([x, y, .5 + .5 * Math.sin(x * .045 + Math.sin(y * .06) * 2) * Math.cos(y * .05)]);
      }
      const r = Math.min(w * (w < 600 ? .22 : .17), h * .3);
      const [lx, ly] = CITY[city].lens;
      L = { x: w * lx + r, y: h * ly + r, r };
      setLens(L);
    }
    function draw(now) {
      ctx.clearRect(0, 0, w, h);
      for (const [x, y, n] of dots) {
        ctx.fillStyle = `rgba(30,110,145,${.2 + n * .22})`;
        ctx.beginPath(); ctx.arc(x, y, 1.15, 0, Math.PI * 2); ctx.fill();
      }
      const T = proj(CITY.Tbilisi.lng, CITY.Tbilisi.lat), B = proj(CITY.Batumi.lng, CITY.Batumi.lat);
      // arc between the cities, with a dot travelling along it
      const mx = (T[0] + B[0]) / 2, my = Math.min(T[1], B[1]) - (T[0] - B[0]) * .22;
      ctx.setLineDash([2, 4]); ctx.strokeStyle = 'rgba(217,72,40,.45)'; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(B[0], B[1]); ctx.quadraticCurveTo(mx, my, T[0], T[1]); ctx.stroke(); ctx.setLineDash([]);
      if (!reduce) {
        const u = (now / 4200) % 1, q = 1 - u;
        const px = q * q * B[0] + 2 * q * u * mx + u * u * T[0], py = q * q * B[1] + 2 * q * u * my + u * u * T[1];
        ctx.fillStyle = '#d94828'; ctx.beginPath(); ctx.arc(px, py, 2.4, 0, Math.PI * 2); ctx.fill();
      }
      // leader line from the picked city to the lens
      if (L) {
        const P = city === 'Tbilisi' ? T : B, dx = L.x - P[0], dy = L.y - P[1], d = Math.hypot(dx, dy);
        ctx.strokeStyle = 'rgba(34,57,70,.35)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(P[0], P[1]); ctx.lineTo(L.x - dx / d * L.r, L.y - dy / d * L.r); ctx.stroke();
      }
      for (const [name, P] of [['Tbilisi', T], ['Batumi', B]]) {
        const on = name === city, t = reduce ? .5 : (now / 1800 + (name === 'Batumi' ? .5 : 0)) % 1;
        ctx.strokeStyle = `rgba(217,72,40,${(1 - t) * (on ? .6 : .3)})`; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.arc(P[0], P[1], 4 + t * 16, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(P[0], P[1], 5.5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = on ? '#d94828' : '#e8a191'; ctx.beginPath(); ctx.arc(P[0], P[1], 3.5, 0, Math.PI * 2); ctx.fill();
        ctx.font = `${on ? 600 : 500} 13px "Helvetica Neue", Arial, sans-serif`; ctx.fillStyle = on ? '#223946' : '#71808a';
        ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(name, P[0] + 12, P[1] + 14);
      }
      if (!reduce && visible.current) raf = requestAnimationFrame(draw);
    }
    const visible = { current: true };
    const io = new IntersectionObserver(([e]) => { visible.current = e.isIntersecting; if (e.isIntersecting) { cancelAnimationFrame(raf); raf = requestAnimationFrame(draw); } });
    const ro = new ResizeObserver(() => { layout(); cancelAnimationFrame(raf); raf = requestAnimationFrame(draw); });
    ro.observe(stage.current); io.observe(stage.current);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); };
  }, [city, reduce]);
  // the lens is sized after layout, so re-fit the map whenever it or the city changes
  useEffect(() => {
    if (!api) return;
    api.map.resize();
    api.map.jumpTo({ center: CITY[city].view, zoom: CITY[city].zoom });
  }, [api, city, lens?.r, lens?.x]);

  const list = centers.filter(cn => cn.city === city);
  return <div className={c.dots}>
    <div className={c.dotsCopy}>
      <Heading rest="In the capital and by the sea.">
        Walk in to any of our Expat Service Centers — your specialist speaks English and knows what newcomers need.
      </Heading>
      <div className={c.seg} role="group" aria-label="City">
        {Object.keys(CITY).map(name => <button key={name} type="button" aria-pressed={city === name} onClick={() => setCity(name)}>
          {name}<span>{centers.filter(cn => cn.city === name).length}</span>
        </button>)}
      </div>
      <ul className={c.dotsList} key={city}>
        {list.map((cn, i) => <li key={cn.id} style={{ '--i': i }}>
          <span className={c.dotsDistrict}>{cn.district}</span>
          <span className={c.dotsAddress}>{cn.address}</span>
          <DirectionsLinks center={cn} compact />
        </li>)}
      </ul>
      <div className={c.dotsMeta}><Status status={status} /><Contacts /></div>
    </div>
    <div className={c.dotsStage} ref={el => { stage.current = el; ref.current = el; }}>
      <canvas ref={canvas} className={c.dotsCanvas} aria-hidden="true" />
      <div className={c.lens} style={lens ? { left: lens.x - lens.r, top: lens.y - lens.r, width: lens.r * 2, height: lens.r * 2 } : { opacity: 0 }}>
        <div ref={box} className={c.mapBox} />
        <span className={c.lensTag}>{city}</span>
      </div>
      <p className={c.stageAttrib}>Map © OpenFreeMap © OpenStreetMap contributors</p>
    </div>
  </div>;
}
