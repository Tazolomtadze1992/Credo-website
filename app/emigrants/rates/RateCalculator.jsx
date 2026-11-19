'use client';

import { useId, useState } from 'react';
import { calcCurrencies, convert, currencies, money, rate } from './rates-data.mjs';
import r from './rates.module.css';

const bySymbol = Object.fromEntries(calcCurrencies.map(c => [c.code, c.symbol]));
const byCode = Object.fromEntries(currencies.map(c => [c.code, c]));

export function RateIcon({ kind, size = 20 }) {
  const shapes = {
    calc: <><rect x="5" y="3" width="14" height="18" rx="3" /><path d="M8.5 7h7" /><path d="M8.5 12h.01M12 12h.01M15.5 12h.01M8.5 15.5h.01M12 15.5h.01M15.5 15.5h.01" strokeWidth="2.2" /></>,
    swap: <path d="M8 4v16M8 4 4.5 7.5M8 4l3.5 3.5M16 20V4m0 16-3.5-3.5M16 20l3.5-3.5" />,
    close: <path d="M6 6l12 12M18 6 6 18" />,
    arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
    external: <path d="M8 16 16 8M9 8h7v7" />,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{shapes[kind]}</svg>;
}

function Chips({ label, value, onChange }) {
  return <div className={r.chips} role="radiogroup" aria-label={label}>
    {calcCurrencies.map(c => <button key={c.code} type="button" role="radio" aria-checked={c.code === value} onClick={() => onChange(c.code)} title={c.name}>
      <span aria-hidden="true">{c.symbol}</span><span className={r.chipCode}>{c.code}</span>
    </button>)}
  </div>;
}

function rateLine(from, to) {
  if (from === 'GEL') return `1 ${to} = ${rate(byCode[to].mobile.sell)} ₾`;
  if (to === 'GEL') return `1 ${from} = ${rate(byCode[from].mobile.buy)} ₾`;
  return `1 ${from} = ${rate(convert(1, from, to))} ${to}`;
}

// Georgian by default; /expats passes English labels.
const LABELS = { amount: 'გადასაცვლელი თანხა', fromGroup: 'გადასაცვლელი ვალუტა', swap: 'ვალუტების გაცვლა', receive: 'მიიღებ', toGroup: 'მისაღები ვალუტა', rate: 'კურსი Mycredo-ში', branch: 'ფილიალში მიიღებდი', mobile: 'Mycredo-ში მიიღებ', cta: 'გადაცვალე Mycredo-ში', href: '#mycredo' };

/* The converter itself — used inside the modal, inline in variant D and on /expats. */
export function Converter({ onDone, compact = false, labels }) {
  const t = { ...LABELS, ...labels };
  const id = useId();
  const [amount, setAmount] = useState('100');
  const [from, setFrom] = useState('GEL');
  const [to, setTo] = useState('USD');
  const [turns, setTurns] = useState(0);
  const value = parseFloat(amount.replace(',', '.'));
  const mobile = convert(value, from, to, 'mobile');
  const branch = convert(value, from, to, 'branch');
  const gain = mobile - branch;

  // picking the currency already on the other side swaps the two
  const pickFrom = code => { if (code === to) setTo(from); setFrom(code); };
  const pickTo = code => { if (code === from) setFrom(to); setTo(code); };
  const swap = () => { setFrom(to); setTo(from); setTurns(t => t + 1); };

  return <div className={r.converter} data-compact={compact || undefined}>
    <div className={r.side}>
      <label className={r.field} htmlFor={`${id}-amount`}>
        <span className={r.fieldLabel}>{t.amount}</span>
        <input id={`${id}-amount`} inputMode="decimal" autoComplete="off" value={amount}
          onChange={e => setAmount(e.target.value.replace(/[^\d.,]/g, ''))} />
        <span className={r.fieldUnit} aria-hidden="true">{bySymbol[from]}</span>
      </label>
      <Chips label={t.fromGroup} value={from} onChange={pickFrom} />
    </div>

    <div className={r.swapRow}>
      <button type="button" className={r.swap} onClick={swap} aria-label={t.swap} style={{ rotate: `${turns * 180}deg` }}><RateIcon kind="swap" /></button>
    </div>

    <div className={r.side}>
      <div className={r.field} data-readonly>
        <span className={r.fieldLabel}>{t.receive}</span>
        <output htmlFor={`${id}-amount`} aria-live="polite">{money(mobile)}</output>
        <span className={r.fieldUnit} aria-hidden="true">{bySymbol[to]}</span>
      </div>
      <Chips label={t.toGroup} value={to} onChange={pickTo} />
    </div>

    <dl className={r.summary}>
      <div><dt>{t.rate}</dt><dd>{rateLine(from, to)}</dd></div>
      <div><dt>{t.branch}</dt><dd><s>{money(branch)} {bySymbol[to]}</s></dd></div>
      <div className={r.summaryWin}><dt>{t.mobile}</dt><dd>
        {money(mobile)} {bySymbol[to]}
        {gain > 0.004 && <span className={r.gain}>+{money(gain)} {bySymbol[to]}</span>}
      </dd></div>
    </dl>

    <a className={`action ${r.convertCta}`} href={t.href} onClick={onDone}>{t.cta}</a>
  </div>;
}

/* Modal wrapper. Native <dialog>: focus trap, Esc and top layer for free. */
export function CalculatorDialog({ dialogRef }) {
  const close = () => dialogRef.current?.close();
  return <dialog ref={dialogRef} className={r.dialog} aria-labelledby="rate-calc-title"
    onClick={e => { if (e.target === e.currentTarget) close(); }}
    onClose={() => { document.documentElement.style.overflow = ''; }}>
    <div className={r.dialogInner}>
      <div className={r.dialogHead}>
        <h2 id="rate-calc-title">ვალუტის კალკულატორი</h2>
        <button type="button" className={r.dialogClose} onClick={close} aria-label="დახურვა"><RateIcon kind="close" /></button>
      </div>
      <Converter onDone={close} />
    </div>
  </dialog>;
}
