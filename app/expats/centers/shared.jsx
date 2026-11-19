'use client';

import { useEffect, useRef, useState } from 'react';
import 'maplibre-gl/dist/maplibre-gl.css';
import { CARPET } from '../ExpMark';
import { FACEBOOK_URL, OPENING, PHONE, WHATSAPP_URL, appleMapsUrl, directionsUrl } from '../expats-data.mjs';
import { createMap, toLngLat } from './map.mjs';

export { toLngLat };
import c from './centers.module.css';

export const external = { target: '_blank', rel: 'noreferrer' };
export const TEL = `tel:${PHONE.replace(/\s/g, '')}`;

/* ───── time: is a center open right now (Tbilisi time)? ───── */
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const SHORT = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
const mins = hhmm => { const [h, m] = hhmm.split(':').map(Number); return h * 60 + m; };
function tbilisiNow() {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Tbilisi', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
    .formatToParts(new Date()).map(p => [p.type, p.value]));
  return { day: SHORT[parts.weekday], minute: Number(parts.hour) * 60 + Number(parts.minute) };
}
function statusAt({ day, minute }) {
  const today = OPENING[day];
  if (today && minute >= mins(today[0]) && minute < mins(today[1])) {
    const left = mins(today[1]) - minute;
    return { open: true, text: left <= 45 ? `Open · closes in ${left} min` : `Open · until ${today[1]}`, day };
  }
  if (today && minute < mins(today[0])) return { open: false, text: `Closed · opens at ${today[0]}`, day };
  for (let k = 1; k <= 7; k++) {
    const d = (day + k) % 7;
    if (OPENING[d]) return { open: false, text: `Closed · opens ${k === 1 ? 'tomorrow' : DAYS[d]} at ${OPENING[d][0]}`, day };
  }
  return { open: false, text: 'Closed', day };
}
/* All centers keep the same hours, so one status serves them all. Null on
   the server and in the first client render, to avoid a hydration mismatch. */
export function useOpenStatus() {
  const [status, setStatus] = useState(null);
  useEffect(() => {
    const tick = () => setStatus(statusAt(tbilisiNow()));
    tick();
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, []);
  return status;
}

export function Status({ status, className = '' }) {
  return <span className={`${c.status} ${className}`} data-open={status?.open || undefined} data-ready={status ? true : undefined}>
    <i />{status?.text ?? 'Mon–Sat'}
  </span>;
}

const ROWS = [['Monday – Friday', [1, 2, 3, 4, 5], OPENING[1]], ['Saturday', [6], OPENING[6]], ['Sunday', [0], null]];
export function HoursTable({ status, className = '' }) {
  return <dl className={`${c.hours} ${className}`}>
    {ROWS.map(([label, days, h]) => <div key={label} data-today={status && days.includes(status.day) ? true : undefined}>
      <dt>{label}</dt><dd>{h ? `${h[0]} – ${h[1]}` : 'Closed'}</dd>
    </div>)}
  </dl>;
}

/* ───── icons ───── */
const Icon = ({ d, size = 16 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d} /></svg>;
export const ICON = {
  route: 'M5 19 19 5M9 5h10v10',
  nav: 'M12 3 20 20 12 16 4 20z',
  phone: 'M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2',
  chat: 'M4 19.5 5.3 15A8 8 0 1 1 8.6 18.4z',
  pin: 'M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21zM12 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2',
  out: 'M8 16 16 8M9 8h7v7',
};
export { Icon };

export function DirectionsLinks({ center, dark = false, compact = false, className = '' }) {
  return <div className={`${c.actions} ${className}`} data-dark={dark || undefined}>
    <a className={c.go} href={directionsUrl(center)} {...external}><Icon d={ICON.nav} size={15} />Directions</a>
    {!compact && <a className={c.goGhost} href={appleMapsUrl(center)} {...external}>Apple Maps</a>}
  </div>;
}

export function Contacts({ dark = false, className = '' }) {
  return <ul className={`${c.contacts} ${className}`} data-dark={dark || undefined}>
    <li><a href={TEL}><Icon d={ICON.phone} />{PHONE}</a></li>
    <li><a href={WHATSAPP_URL} {...external}><Icon d={ICON.chat} />WhatsApp</a></li>
    <li><a href={FACEBOOK_URL} {...external}><Icon d={ICON.out} />Credo Bank for Expats on Facebook</a></li>
  </ul>;
}

export function Heading({ lead = 'Expat Service Centers', rest, children, dark = false, className = '' }) {
  return <div className={`${c.heading} ${className}`} data-dark={dark || undefined}>
    <h2 id="centers-heading">{lead}{rest && <span>{rest}</span>}</h2>
    {children && <p>{children}</p>}
  </div>;
}

/* ───── map plumbing ───── */

/* Starts once the element is within a screen of the viewport, then stays. */
export function useNear(margin = '400px') {
  const ref = useRef(null);
  const [near, setNear] = useState(false);
  useEffect(() => {
    const el = ref.current;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setNear(true); io.disconnect(); } }, { rootMargin: margin });
    io.observe(el);
    return () => io.disconnect();
  }, [margin]);
  return [ref, near];
}

export function useReducedMotion() {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    const q = matchMedia('(prefers-reduced-motion: reduce)');
    const on = () => setReduce(q.matches);
    on(); q.addEventListener('change', on);
    return () => q.removeEventListener('change', on);
  }, []);
  return reduce;
}

/* Creates a map in a container once `start` is true. Returns
   [containerRef, { map, lib } | null]. */
export function useMap(start, options) {
  const container = useRef(null);
  const [api, setApi] = useState(null);
  const opts = useRef(options);
  useEffect(() => {
    if (!start) return;
    let gone = false, made;
    createMap(container.current, opts.current).then(res => {
      made = res.map;
      if (gone) { made.remove(); return; }
      if (made.loaded()) setApi(res); else made.once('load', () => !gone && setApi(res));
    }).catch(err => console.warn('Map failed to load', err));
    return () => { gone = true; made?.remove(); setApi(null); };
  }, [start]);
  return [container, api];
}

/* A pin: the Credo carpet medallion in a white ring, with an optional label. */
export function pinElement({ label, sub, onClick, dark = false } = {}) {
  const el = document.createElement('button');
  el.type = 'button';
  el.className = c.pin;
  if (dark) el.dataset.dark = 'true';
  el.innerHTML = `<span class="${c.pinPulse}"></span><span class="${c.pinHead}"><img src="${CARPET}" alt=""></span>${label ? `<span class="${c.pinLabel}"><b>${label}</b>${sub ? `<small>${sub}</small>` : ''}</span>` : ''}`;
  el.setAttribute('aria-label', [label, sub].filter(Boolean).join(', ') || 'Credo Bank');
  if (onClick) el.addEventListener('click', e => { e.stopPropagation(); onClick(); });
  return el;
}

/* Adds one pin per center; returns the markers keyed by id, and keeps the
   active pin marked. */
export function usePins(api, list, active, { labels = false, dark = false, onPick } = {}) {
  const markers = useRef({});
  const pick = useRef(onPick);
  pick.current = onPick;
  useEffect(() => {
    if (!api) return;
    const made = {};
    for (const center of list) {
      const el = pinElement({ label: labels ? center.district : null, sub: labels ? center.city : null, dark, onClick: () => pick.current?.(center.id) });
      made[center.id] = new api.lib.Marker({ element: el, anchor: 'bottom' }).setLngLat(toLngLat(center)).addTo(api.map);
    }
    markers.current = made;
    return () => { Object.values(made).forEach(m => m.remove()); markers.current = {}; };
  }, [api, list, labels, dark]);
  useEffect(() => {
    for (const [id, m] of Object.entries(markers.current)) {
      const el = m.getElement();
      if (id === active) { el.dataset.active = 'true'; el.style.zIndex = 2; } else { delete el.dataset.active; el.style.zIndex = 1; }
    }
  }, [api, active, list]);
  return markers;
}

/* Fits the camera to a set of centers (one center gets a street-level zoom). */
export function frame(api, list, { padding = 60, zoom = 15.2, duration = 1400, offset = [0, 0] } = {}) {
  if (!api || !list.length) return;
  const { map, lib } = api;
  if (list.length === 1) { map.flyTo({ center: toLngLat(list[0]), zoom, duration, offset, curve: 1.6 }); return; }
  const b = new lib.LngLatBounds();
  list.forEach(cn => b.extend(toLngLat(cn)));
  map.fitBounds(b, { padding, duration, maxZoom: 14, offset });
}
