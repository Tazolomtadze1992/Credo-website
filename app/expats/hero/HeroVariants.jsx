'use client';

import { useEffect, useRef, useState } from 'react';
import s from '../../emigrants/steps/steps.module.css';
import { Arrows, CARPET, Lockup } from '../ExpMark';
import { PACKAGE_URL, PROMO_END, VIDEO_URL, packages } from '../expats-data.mjs';
import h from './hero.module.css';

const external = { target: '_blank', rel: 'noreferrer' };
const reducedMotion = () => typeof window !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
const Carpet = ({ className }) => <img className={className} src={CARPET} alt="" draggable="false" />;

/* Same copy for every variant. The offer ticket sits on the first screen, as the
   expats team asked: current deals before anything else. */
function Copy() {
  const [pack, rch] = packages;
  return <div className={h.copy}>
    <Lockup className={h.lockup} />
    <h1 id="expats-title">Banking in Georgia, made for expats</h1>
    <p className={h.lede}>Open a multi-currency account in 15 minutes, get Visa and Mastercard cards and bank by video call — in English, from anywhere.</p>
    <div className={h.actions}>
      <a className="action" href="#offers">See current offers</a>
      <a className={h.textLink} href={VIDEO_URL} {...external}>Bank by video call <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M8 16 16 8M9 8h7v7" /></svg></a>
    </div>
    <a className={h.ticket} href={PACKAGE_URL} {...external}>
      <span className={h.ticketBadge}>−50%</span>
      <span className={h.ticketText}>
        <b>Until {PROMO_END}</b>
        <span>{pack.name} GEL {pack.price.month}/mo <s>{pack.was.month}</s> · {rch.name} GEL {rch.price.month}/mo <s>{rch.was.month}</s></span>
      </span>
      <svg className={h.ticketArrow} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
    </a>
  </div>;
}

/* A — the logo, alive: carpet turns one way, the exchange arrows the other,
   currencies orbit. Hover speeds the arrows up (playbackRate, so no jump). */
function Orbit() {
  const arrows = useRef(null);
  const speed = rate => arrows.current?.getAnimations().forEach(a => a.updatePlaybackRate(rate));
  return <div className={h.stage}>
    <div className={h.orbit} onPointerEnter={() => speed(5)} onPointerLeave={() => speed(1)}>
      <span className={h.orbitRing} />
      <span className={h.disc}><Carpet className={h.orbitCarpet} /></span>
      <span className={h.orbitArrows} ref={arrows}><Arrows className={h.fill} /></span>
      <span className={h.coins} aria-hidden="true">
        {['₾', '$', '€', '£'].map((c, i) => <i key={c} style={{ '--i': i }}><span><b>{c}</b></span></i>)}
      </span>
    </div>
  </div>;
}

/* B — the carpet weaves itself row by row, then lifts off as a flying carpet
   and follows the pointer a little. */
function Flying() {
  const tilt = useRef(null);
  function move(e) {
    if (reducedMotion()) return;
    const box = e.currentTarget.getBoundingClientRect();
    tilt.current.style.setProperty('--px', ((e.clientX - box.left) / box.width - .5).toFixed(3));
    tilt.current.style.setProperty('--py', ((e.clientY - box.top) / box.height - .5).toFixed(3));
  }
  const leave = () => { tilt.current.style.removeProperty('--px'); tilt.current.style.removeProperty('--py'); };
  return <div className={h.stage} onPointerMove={move} onPointerLeave={leave}>
    <div className={h.fly}>
      <div className={h.flyTilt} ref={tilt}>
        <div className={h.flyPose}>
          <div className={h.flyBob}>
            <div className={h.rug}>
              <span className={h.rugWeave}><Carpet className={h.fill} /></span>
              <i className={h.shuttle} />
            </div>
          </div>
        </div>
      </div>
      <span className={h.flyShadow} />
    </div>
  </div>;
}

/* C — kaleidoscope: eight mirrored wedges of the carpet. The pattern drifts on
   its own and turns with the pointer; the edges always match because each wedge
   is a reflection of its neighbour. */
function Kaleidoscope() {
  const disc = useRef(null);
  const target = useRef({ a: 0, x: 0, y: 0 });
  useEffect(() => {
    if (reducedMotion()) return;
    let raf, a = 0, x = 0, y = 0, t = 0, last = performance.now();
    const tick = now => {
      const dt = Math.min(64, now - last); last = now; t += dt;
      const goal = target.current;
      a += (goal.a + t * .006 - a) * .06;
      x += (goal.x + Math.sin(t / 2600) * 6 - x) * .06;
      y += (goal.y + Math.cos(t / 3100) * 6 - y) * .06;
      disc.current.style.setProperty('--a', `${a.toFixed(2)}deg`);
      disc.current.style.setProperty('--x', `${x.toFixed(2)}%`);
      disc.current.style.setProperty('--y', `${y.toFixed(2)}%`);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  function move(e) {
    const box = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - box.left) / box.width - .5, py = (e.clientY - box.top) / box.height - .5;
    target.current = { a: px * 120, x: px * 14, y: py * 14 };
  }
  return <div className={h.stage} onPointerMove={move} onPointerLeave={() => { target.current = { a: target.current.a, x: 0, y: 0 }; }}>
    <div className={h.kaleido}>
      <div className={h.kDisc} ref={disc}>
        {Array.from({ length: 8 }, (_, k) => <div key={k} className={h.wedge} style={{ '--k': k }} data-odd={k % 2 || undefined}><Carpet className={h.wedgeImg} /></div>)}
      </div>
      <span className={h.kArrows}><Arrows className={h.fill} /></span>
    </div>
  </div>;
}

/* D — the whole hero is a faint carpet; a lens framed by the logo's arrows
   follows the pointer and shows it in full colour. */
function Lens() {
  const field = useRef(null);
  const target = useRef(null);
  useEffect(() => {
    const el = field.current;
    let raf, x = 0, y = 0, t = 0, last = performance.now(), first = true;
    const tick = now => {
      const dt = Math.min(64, now - last); last = now; t += dt;
      const w = el.clientWidth, hgt = el.clientHeight, r = parseFloat(getComputedStyle(el).getPropertyValue('--r')) || 170;
      const wide = w > 900, ring = r * 1.3375; // the arrows ring is 2.675 × r wide
      const restX = wide ? w * .72 : w * .5, restY = wide ? hgt * .5 : hgt - ring - 28;
      let gx = restX + Math.sin(t / 2200) * 40, gy = restY + Math.cos(t / 2900) * 28;
      if (target.current) { gx = target.current.x; gy = target.current.y; }
      if (wide) gx = Math.max(w * .5 + r * .4, gx); // keep the lens off the copy
      else { // keep the whole ring on screen and below the copy
        gx = Math.min(w - ring - 8, Math.max(ring + 8, gx));
        gy = Math.min(hgt - ring - 8, Math.max(hgt - ring * 2.4, gy));
      }
      if (first) { x = gx; y = gy; first = false; }
      x += (gx - x) * .12; y += (gy - y) * .12;
      el.style.setProperty('--x', `${x.toFixed(1)}px`);
      el.style.setProperty('--y', `${y.toFixed(1)}px`);
      if (!reducedMotion()) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  function move(e) {
    const box = field.current.getBoundingClientRect();
    target.current = { x: e.clientX - box.left, y: e.clientY - box.top };
  }
  return <div className={h.lensField} ref={field} onPointerMove={move} onPointerLeave={() => { target.current = null; }} aria-hidden="true">
    <span className={h.lensBase} />
    <span className={h.lensWash} />
    <span className={h.lensColor} />
    <span className={h.lensRing}><Arrows className={h.fill} /></span>
  </div>;
}

/* E — four quarters of the carpet fly in, lock together, round off into the
   medallion and the arrows close around it: the logo assembles itself. */
const QUARTERS = [[-1, -1, -90], [1, -1, 120], [-1, 1, 160], [1, 1, -70]];
function Puzzle() {
  return <div className={h.stage}>
    <div className={h.puzzle}>
      <div className={h.board}>
        {QUARTERS.map(([dx, dy, r], q) => <span key={q} className={h.tile} style={{ '--q': q, '--dx': dx, '--dy': dy, '--r': `${r}deg` }} />)}
      </div>
      <span className={h.pArrows}><Arrows className={h.fill} /></span>
    </div>
  </div>;
}

export const VARIANTS = [
  { id: 'orbit', letter: 'A', label: 'ორბიტა', Visual: Orbit },
  { id: 'flying', letter: 'B', label: 'მფრინავი ხალიჩა', Visual: Flying },
  { id: 'kaleidoscope', letter: 'C', label: 'კალეიდოსკოპი', Visual: Kaleidoscope },
  { id: 'lens', letter: 'D', label: 'ლინზა', Visual: Lens, fullBleed: true },
  { id: 'puzzle', letter: 'E', label: 'ფაზლი', Visual: Puzzle },
];
const resolve = id => VARIANTS.find(v => v.id === id) || VARIANTS[0];

export default function HeroVariants({ initial }) {
  const [id, setId] = useState(resolve(initial).id);
  function choose(next) {
    setId(next);
    const url = new URL(window.location.href);
    url.searchParams.set('hero', next);
    window.history.replaceState(null, '', url);
  }
  const { Visual, fullBleed } = resolve(id);
  return <>
    <section className={h.hero} data-variant={id} data-full={fullBleed || undefined} aria-labelledby="expats-title" key={id}>
      {fullBleed && <Visual />}
      <Copy />
      {!fullBleed && <Visual />}
    </section>
    <div className={s.switcher}>
      <div className={s.switchGroup} role="radiogroup" aria-label="Hero variant">
        <span className={s.switcherLabel}>ჰირო</span>
        {VARIANTS.map(v => <button key={v.id} type="button" role="radio" aria-checked={v.id === id} onClick={() => choose(v.id)} title={v.label}>
          <b>{v.letter}</b><span>{v.label}</span>
        </button>)}
      </div>
    </div>
  </>;
}
