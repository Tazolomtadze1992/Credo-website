'use client';

import { useEffect, useId, useState } from 'react';
import { Converter } from '../../emigrants/rates/RateCalculator';
import { LOAN_FORM_URL, depositRates, loanOffers } from '../expats-data.mjs';
import x from './sections.module.css';

const external = { target: '_blank', rel: 'noreferrer' };
const fmt = (v, d = 2) => Number.isFinite(v) ? v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d }) : '—';
const num = v => parseFloat(String(v).replace(/,/g, ''));
const TABS = [{ id: 'loan', label: 'Loan' }, { id: 'deposit', label: 'Deposit' }, { id: 'exchange', label: 'Currency exchange' }];
const EN_LABELS = { amount: 'You exchange', fromGroup: 'Currency you have', swap: 'Swap currencies', receive: 'You get', toGroup: 'Currency you want', rate: 'Rate in Mycredo', branch: 'At a branch you’d get', mobile: 'In Mycredo you get', cta: 'Exchange in Mycredo', href: 'https://apps.apple.com/ge/app/mycredo-mobile-banking/id1535238816' };

function Field({ label, suffix, value, onChange, hint }) {
  const id = useId();
  return <label className={x.field} htmlFor={id}>
    <span className={x.fieldLabel}>{label}</span>
    <span className={x.inputShell}>
      <input id={id} inputMode="decimal" autoComplete="off" value={value} onChange={e => onChange(e.target.value.replace(/[^\d.,]/g, ''))} />
      <span className={x.suffix}>{suffix}</span>
    </span>
    {hint && <span className={x.hint}>{hint}</span>}
  </label>;
}

function Range({ label, value, min, max, step, onChange, format }) {
  const id = useId();
  const pct = (value - min) / (max - min) * 100;
  return <label className={x.field} htmlFor={id}>
    <span className={x.fieldLabel}>{label}<b>{format(value)}</b></span>
    <input id={id} className={x.range} type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(Number(e.target.value))} style={{ '--p': `${pct}%` }} />
  </label>;
}

function Chips({ label, options, value, onChange }) {
  return <div className={x.chips} role="radiogroup" aria-label={label}>
    {options.map(o => <button key={o.id} type="button" role="radio" aria-checked={o.id === value} onClick={() => onChange(o.id)}>{o.label}</button>)}
  </div>;
}

/* Annuity loan: the expats team asked for an editable rate (%) so people can
   check an offer against what they were quoted elsewhere. */
function Loan({ preset }) {
  const [kind, setKind] = useState('mortgage');
  const [amount, setAmount] = useState('250000');
  const [months, setMonths] = useState(240);
  const [rate, setRate] = useState('8');
  function pick(id) {
    setKind(id);
    const offer = loanOffers.find(o => o.id === id);
    if (!offer) return;
    setAmount(String(offer.amount)); setMonths(offer.months); setRate(String(offer.rate));
  }
  useEffect(() => { if (preset) pick(preset.id); }, [preset]);
  const P = num(amount), r = num(rate) / 100 / 12;
  const payment = r > 0 ? P * r / (1 - (1 + r) ** -months) : P / months;
  const total = payment * months, interest = total - P;
  const share = Number.isFinite(interest) && total > 0 ? interest / total * 100 : 0;
  return <div className={x.calcGrid}>
    <div className={x.calcInputs}>
      <Chips label="Loan type" value={kind} onChange={pick} options={[...loanOffers.map(o => ({ id: o.id, label: o.label.replace(' loan', '') })), { id: 'custom', label: 'Custom' }]} />
      <Field label="Loan amount" suffix="₾" value={amount} onChange={v => { setAmount(v); setKind('custom'); }} />
      <Range label="Term" value={months} min={6} max={300} step={6} onChange={v => { setMonths(v); setKind('custom'); }} format={m => m >= 24 ? `${(m / 12).toFixed(m % 12 ? 1 : 0)} years` : `${m} months`} />
      <Field label="Annual interest rate" suffix="%" value={rate} onChange={v => { setRate(v); setKind('custom'); }} hint="Type the rate you were offered to compare." />
    </div>
    <div className={x.calcResult}>
      <p className={x.resultLabel}>Monthly payment</p>
      <p className={x.resultBig}>{fmt(payment)} <span>₾</span></p>
      <div className={x.split} aria-hidden="true"><i style={{ width: `${100 - share}%` }} /><i style={{ width: `${share}%` }} /></div>
      <dl className={x.resultList}>
        <div><dt><i data-dot="principal" />Loan amount</dt><dd>{fmt(P, 0)} ₾</dd></div>
        <div><dt><i data-dot="interest" />Total interest</dt><dd>{fmt(interest)} ₾</dd></div>
        <div><dt>Total to repay</dt><dd>{fmt(total)} ₾</dd></div>
      </dl>
      <a className={`action ${x.resultCta}`} href={LOAN_FORM_URL} {...external}>Apply for a loan</a>
      <p className={x.note}>Illustrative calculation. Your rate depends on the product and your profile.</p>
    </div>
  </div>;
}

const TERMS = [3, 6, 12, 24];
function Deposit() {
  const [currency, setCurrency] = useState('GEL');
  const [amount, setAmount] = useState('10000');
  const [months, setMonths] = useState(12);
  const [rate, setRate] = useState(String(depositRates.GEL));
  const symbol = { GEL: '₾', USD: '$', EUR: '€' }[currency];
  const P = num(amount), interest = P * num(rate) / 100 * months / 12;
  return <div className={x.calcGrid}>
    <div className={x.calcInputs}>
      <Chips label="Currency" value={currency} onChange={c => { setCurrency(c); setRate(String(depositRates[c])); }} options={Object.keys(depositRates).map(c => ({ id: c, label: c }))} />
      <Field label="Deposit amount" suffix={symbol} value={amount} onChange={setAmount} />
      <div className={x.field}>
        <span className={x.fieldLabel}>Term</span>
        <Chips label="Term" value={months} onChange={setMonths} options={TERMS.map(t => ({ id: t, label: `${t} months` }))} />
      </div>
      <Field label="Annual interest rate" suffix="%" value={rate} onChange={setRate} hint="Pre-filled with an example rate; change it to compare." />
    </div>
    <div className={x.calcResult}>
      <p className={x.resultLabel}>You earn</p>
      <p className={x.resultBig}>+{fmt(interest)} <span>{symbol}</span></p>
      <div className={x.growth} aria-hidden="true">
        {Array.from({ length: months }, (_, i) => <i key={`${months}-${i}`} style={{ height: `${55 + (i + 1) / months * 45}%`, animationDelay: `${i * 18}ms` }} />)}
      </div>
      <dl className={x.resultList}>
        <div><dt>Deposit</dt><dd>{fmt(P, 0)} {symbol}</dd></div>
        <div><dt>Per month, on average</dt><dd>{fmt(interest / months)} {symbol}</dd></div>
        <div><dt>At the end of the term</dt><dd>{fmt(P + interest)} {symbol}</dd></div>
      </dl>
      <a className={`action ${x.resultCta}`} href="https://credobank.ge/en/products/deposits?filter=expats" {...external}>Open a deposit</a>
      <p className={x.note}>Illustrative rates, before tax. Actual rates depend on the deposit type.</p>
    </div>
  </div>;
}

export default function Calculators() {
  const [tab, setTab] = useState('loan');
  const [preset, setPreset] = useState(null);
  useEffect(() => {
    const onLoan = e => { setTab('loan'); setPreset({ id: e.detail, at: Date.now() }); };
    const onTab = e => { if (TABS.some(t => t.id === e.detail)) setTab(e.detail); };
    window.addEventListener('expats:loan', onLoan);
    window.addEventListener('expats:tab', onTab);
    return () => { window.removeEventListener('expats:loan', onLoan); window.removeEventListener('expats:tab', onTab); };
  }, []);
  const at = TABS.findIndex(t => t.id === tab);
  return <div className={x.calc}>
    <div className={x.tabs} role="tablist" aria-label="Calculator">
      <i className={x.tabThumb} style={{ translate: `${at * 100}% 0` }} aria-hidden="true" />
      {TABS.map(t => <button key={t.id} type="button" role="tab" id={`calc-tab-${t.id}`} aria-selected={t.id === tab} aria-controls="calc-panel" onClick={() => setTab(t.id)}>{t.label}</button>)}
    </div>
    <div className={x.calcPanel} id="calc-panel" role="tabpanel" aria-labelledby={`calc-tab-${tab}`} key={tab}>
      {tab === 'loan' && <Loan preset={preset} />}
      {tab === 'deposit' && <Deposit />}
      {tab === 'exchange' && <div className={x.exchange}><Converter labels={EN_LABELS} /></div>}
    </div>
  </div>;
}
