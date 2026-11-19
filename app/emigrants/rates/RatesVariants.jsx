'use client';

import { useEffect, useRef, useState } from 'react';
import s from '../steps/steps.module.css';
import p from '../products/products.module.css';
import { CalculatorDialog, Converter, RateIcon } from './RateCalculator';
import { RATES_URL, UPDATED, currencies, rate, signed } from './rates-data.mjs';
import r from './rates.module.css';

const external = { target: '_blank', rel: 'noreferrer' };

const Flag = ({ c, size = 40 }) => <img className={r.flag} src={c.flag} width={size} height={size} alt="" />;
const Delta = ({ c }) => <span className={r.delta} data-dir={c.change >= 0 ? 'up' : 'down'}>
  <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true"><path d={c.change >= 0 ? 'M5 8.5V1.5M2 4.5l3-3 3 3' : 'M5 1.5v7M2 5.5l3 3 3-3'} fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
  {signed(c.change)}
</span>;

const Foot = () => <div className={r.foot}>
  <span>საილუსტრაციო კურსები · განახლდა {UPDATED}</span>
  <a href={RATES_URL} {...external}>ყველა ვალუტა <RateIcon kind="external" size={16} /></a>
</div>;

// points for a sparkline / area chart inside a w×h box
function series(values, w, h, pad = 4) {
  const min = Math.min(...values), max = Math.max(...values), span = max - min || 1;
  return values.map((v, i) => [i / (values.length - 1) * w, pad + (1 - (v - min) / span) * (h - pad * 2)]);
}
const linePath = pts => pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join('');

/* A — BOG's layout in our skin: white cards with a shadow ring instead of grey fills. */
function Cards() {
  return <ul className={r.cards}>
    {currencies.map(c => <li key={c.code} className={r.card}>
      <div className={r.cardTop}>
        <Flag c={c} />
        <div>
          <p className={r.code}>{c.code}<span>ოფიციალური</span></p>
          <p className={r.officialRow}><span className={r.official}>{rate(c.official)}</span><Delta c={c} /></p>
        </div>
      </div>
      <table className={r.mini}>
        <thead><tr><td /><th scope="col">ყიდვა</th><th scope="col">გაყიდვა</th></tr></thead>
        <tbody>
          <tr data-best><th scope="row">Mycredo</th><td>{rate(c.mobile.buy)}</td><td>{rate(c.mobile.sell)}</td></tr>
          <tr><th scope="row">ფილიალი</th><td>{rate(c.branch.buy)}</td><td>{rate(c.branch.sell)}</td></tr>
        </tbody>
      </table>
    </li>)}
  </ul>;
}

/* B — Swiss grid like the products one; the fourth cell is the calculator. */
function Grid({ onCalc }) {
  return <div className={p.gridFrame}>
    <ul className={r.grid}>
      {currencies.map(c => <li key={c.code} className={r.gridCell}>
        <span className={r.gridTop}><span className={p.index}>{c.code} / GEL</span><Flag c={c} size={24} /></span>
        <span className={r.gridOfficial}>{rate(c.official)}</span>
        <span className={r.gridMeta}><Delta c={c} /><span>ოფიციალური · {c.name}</span></span>
        <dl className={r.gridPair}>
          <div><dt>ყიდვა</dt><dd>{rate(c.mobile.buy)}</dd></div>
          <div><dt>გაყიდვა</dt><dd>{rate(c.mobile.sell)}</dd></div>
        </dl>
      </li>)}
      <li className={r.gridCell}>
        <button type="button" className={r.gridCalc} onClick={onCalc}>
          <span className={r.gridTop}><span className={p.index}>04</span><RateIcon kind="calc" size={24} /></span>
          <span className={r.gridCalcTitle}>ვალუტის კალკულატორი</span>
          <span className={r.gridCalcText}>დაითვალე, რამდენს მიიღებ Mycredo-ში და რამდენით მეტს, ვიდრე ფილიალში.</span>
          <span className={r.gridCalcGo}>გამოთვლა <RateIcon kind="arrow" size={18} /></span>
        </button>
      </li>
    </ul>
    <i className={p.plus} style={{ left: 0, top: 0 }} aria-hidden="true" />
    <i className={p.plus} style={{ left: '100%', top: 0 }} aria-hidden="true" />
    <i className={p.plus} style={{ left: 0, top: '100%' }} aria-hidden="true" />
    <i className={p.plus} style={{ left: '100%', top: '100%' }} aria-hidden="true" />
  </div>;
}

/* C — a rates table with a Mycredo / branch toggle and a 14-day trend line. */
const CHANNELS = [{ id: 'mobile', label: 'Mycredo' }, { id: 'branch', label: 'ფილიალი' }];
function Table() {
  const [channel, setChannel] = useState('mobile');
  const at = CHANNELS.findIndex(ch => ch.id === channel);
  return <div>
    <div className={r.tableTools}>
      <div className={r.segment} role="radiogroup" aria-label="სად ცვლი">
        <i className={r.segmentThumb} style={{ translate: `${at * 100}% 0` }} aria-hidden="true" />
        {CHANNELS.map(ch => <button key={ch.id} type="button" role="radio" aria-checked={ch.id === channel} onClick={() => setChannel(ch.id)}>{ch.label}</button>)}
      </div>
      {channel === 'mobile' && <span className={r.tableHint}>Mycredo-ში კურსი უკეთესია</span>}
    </div>
    <table className={r.table}>
      <thead><tr>
        <th scope="col">ვალუტა</th><th scope="col">ყიდვა</th><th scope="col">გაყიდვა</th>
        <th scope="col" className={r.wide}>ოფიციალური</th><th scope="col" className={r.wide}>14 დღე</th>
      </tr></thead>
      <tbody>
        {currencies.map(c => {
          const pts = series(c.history, 120, 32);
          return <tr key={c.code}>
            <th scope="row"><span className={r.who}><Flag c={c} size={32} /><span><b>{c.code}</b><small>{c.name}</small></span></span></th>
            <td key={`b-${channel}`} className={r.num}>{rate(c[channel].buy)}</td>
            <td key={`s-${channel}`} className={r.num}>{rate(c[channel].sell)}</td>
            <td className={r.wide}><span className={r.stack}>{rate(c.official)}<Delta c={c} /></span></td>
            <td className={r.wide}><svg className={r.spark} data-dir={c.change >= 0 ? 'up' : 'down'} width="120" height="32" viewBox="0 0 120 32" aria-hidden="true">
              <path d={linePath(pts)} pathLength="1" />
              <circle cx={pts.at(-1)[0] - 2} cy={pts.at(-1)[1]} r="2.5" />
            </svg></td>
          </tr>;
        })}
      </tbody>
    </table>
  </div>;
}

/* D — the calculator is the section: converter on the left, today's Mycredo rates on the right. */
function Inline() {
  return <div className={r.inline}>
    <div className={r.inlineCalc}>
      <h3 className={r.inlineTitle}><RateIcon kind="calc" />ვალუტის კალკულატორი</h3>
      <Converter compact />
    </div>
    <div className={r.inlineRates}>
      <p className={r.inlineLabel}><span>დღის კურსი Mycredo-ში</span><span>ყიდვა / გაყიდვა</span></p>
      <ul>
        {currencies.map(c => <li key={c.code} className={r.inlineRow}>
          <Flag c={c} size={36} />
          <span className={r.inlineWho}><b>{c.code}</b><small>ოფიც. {rate(c.official)} <Delta c={c} /></small></span>
          <span className={r.inlinePair}>{rate(c.mobile.buy)}<i>/</i>{rate(c.mobile.sell)}</span>
        </li>)}
      </ul>
      <p className={r.inlineNote}>ვალუტას Mycredo-ში 24/7 ცვლი — ფილიალზე უკეთეს კურსად, საზღვარგარეთიდანაც.</p>
    </div>
  </div>;
}

/* E — big numbers with a 14-day chart you can scrub, Stripe-dashboard style. */
const W = 300, H = 88;
function Chart({ c }) {
  const pts = series(c.history, W, H, 8);
  const [hover, setHover] = useState(null);
  const i = hover ?? pts.length - 1;
  const [x, y] = pts[i];
  const daysAgo = pts.length - 1 - i;
  function move(e) {
    const box = e.currentTarget.getBoundingClientRect();
    setHover(Math.max(0, Math.min(pts.length - 1, Math.round((e.clientX - box.left) / box.width * (pts.length - 1)))));
  }
  return <div className={r.chart} onPointerMove={move} onPointerLeave={() => setHover(null)} data-dir={c.change >= 0 ? 'up' : 'down'}>
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden="true">
      <defs><linearGradient id={`fill-${c.code}`} x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="currentColor" stopOpacity=".16" /><stop offset="1" stopColor="currentColor" stopOpacity="0" /></linearGradient></defs>
      <path d={`${linePath(pts)}L${W} ${H}L0 ${H}Z`} fill={`url(#fill-${c.code})`} />
      <path className={r.chartLine} d={linePath(pts)} pathLength="1" vectorEffect="non-scaling-stroke" />
      <line className={r.chartCursor} x1={x} x2={x} y1="0" y2={H} vectorEffect="non-scaling-stroke" data-on={hover != null || undefined} />
    </svg>
    <i className={r.chartDot} style={{ left: `${x / W * 100}%`, top: `${y / H * 100}%` }} aria-hidden="true" />
    <span className={r.chartTip} data-on={hover != null || undefined}>{rate(c.history[i])} · {daysAgo ? `${daysAgo} დღის წინ` : 'დღეს'}</span>
  </div>;
}
function Charts() {
  return <ul className={r.charts}>
    {currencies.map(c => <li key={c.code} className={r.chartCol}>
      <p className={r.chartHead}><Flag c={c} size={24} /><b>{c.code}</b><span>{c.name}</span></p>
      <p className={r.chartBig}>{rate(c.official)}</p>
      <p className={r.chartMeta}><Delta c={c} /><span>ოფიციალური, დღეს</span></p>
      <Chart c={c} />
      <p className={r.chartAxis}><span>14 დღის წინ</span><span>დღეს</span></p>
      <dl className={r.chartPair}>
        <div><dt>ყიდვა Mycredo-ში</dt><dd>{rate(c.mobile.buy)}</dd></div>
        <div><dt>გაყიდვა</dt><dd>{rate(c.mobile.sell)}</dd></div>
      </dl>
    </li>)}
  </ul>;
}

// Design-review switcher: the choice lives in ?rates=… and the dock swaps to
// these options while the section is on screen.
export const VARIANTS = [
  { id: 'cards', letter: 'A', label: 'ბარათები', Component: Cards },
  { id: 'grid', letter: 'B', label: 'ბადე', Component: Grid, ownCalc: true },
  { id: 'table', letter: 'C', label: 'ცხრილი', Component: Table },
  { id: 'inline', letter: 'D', label: 'კალკულატორი', Component: Inline, ownCalc: true },
  { id: 'charts', letter: 'E', label: 'გრაფიკი', Component: Charts },
];
const resolve = id => VARIANTS.find(v => v.id === id) || VARIANTS[0];

export default function RatesVariants({ initial, heading }) {
  const [id, setId] = useState(resolve(initial).id);
  const [onScreen, setOnScreen] = useState(false);
  const area = useRef(null);
  const dialog = useRef(null);
  useEffect(() => {
    const root = document.documentElement;
    const observer = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting), { rootMargin: '-35% 0px -35% 0px' });
    observer.observe(area.current);
    return () => { observer.disconnect(); if (root.dataset.dock === 'rates') delete root.dataset.dock; };
  }, []);
  useEffect(() => {
    const root = document.documentElement;
    if (onScreen) root.dataset.dock = 'rates';
    else if (root.dataset.dock === 'rates') delete root.dataset.dock;
  }, [onScreen]);
  function choose(next) {
    setId(next);
    const url = new URL(window.location.href);
    url.searchParams.set('rates', next);
    window.history.replaceState(null, '', url);
  }
  function openCalc() {
    document.documentElement.style.overflow = 'hidden';
    dialog.current?.showModal();
  }
  const { Component, ownCalc } = resolve(id);
  return <>
    <div className={r.head}>
      {heading}
      {!ownCalc && <button type="button" className={`action action-secondary ${r.calcButton}`} onClick={openCalc}>კალკულატორი</button>}
    </div>
    <div ref={area}>
      <div className={`${p.variantBody} ${r.body}`} key={id}><Component onCalc={openCalc} /><Foot /></div>
    </div>
    <CalculatorDialog dialogRef={dialog} />
    <div className={`${s.switcher} ${s.ratesDock}`} data-visible={onScreen} inert={!onScreen || undefined}>
      <div className={s.switchGroup} role="radiogroup" aria-label="კურსების სექციის ვარიანტი">
        <span className={s.switcherLabel}>კურსები</span>
        {VARIANTS.map(v => <button key={v.id} type="button" role="radio" aria-checked={v.id === id} onClick={() => choose(v.id)} title={v.label}>
          <b>{v.letter}</b><span>{v.label}</span>
        </button>)}
      </div>
    </div>
  </>;
}
