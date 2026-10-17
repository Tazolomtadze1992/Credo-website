'use client';

import { useRef, useState } from 'react';
import { CardArt } from '../components/DesignArt';
import AppShowcase from '../components/AppShowcase';
import SiteHeader from '../components/SiteHeader';
import TransferGlobe from '../components/TransferGlobe';
import NewsSection from '../components/NewsSection';
import BankCard3D from '../components/BankCard3D';
import SavingsGoal from '../components/SavingsGoal';
import ProductCard from '../components/ProductCard';
import SplitPayment from '../components/SplitPayment';
import SharedBentoBackground from '../components/SharedBentoBackground';
import LoanRibbonBackground from '../components/LoanRibbonBackground';
import { ArtStage, CredoPhoneVideo } from '../components/LoanCardArtwork';

const modes = ['სესხი', 'ანაბარი', 'ვალუტის კურსი'];
const fmt = (value, digits = 2) => new Intl.NumberFormat('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(value);
const exampleRates = { GEL: 1, USD: 2.7, EUR: 3.1 };

function Action({ children, onClick, white = false, className = '' }) {
  return <button type="button" onClick={onClick} className={`action ${white ? 'action-white' : ''} ${className}`}>{typeof children === 'string' ? children.toUpperCase() : children}</button>;
}

function NumberField({ label, sublabel, value, onChange, unit, max = 1000000 }) {
  return <label className="field"><span className="field-label">{label}</span><span className="input-shell"><span><span className="input-caption">{sublabel}</span><input type="number" inputMode="decimal" min="1" max={max} step="any" value={value} onChange={e => onChange(e.target.value)} aria-label={label} /></span>{unit && <span className="input-unit">{unit}</span>}</span></label>;
}

function Calculator({ mode, setMode, onAction }) {
  const [amount, setAmount] = useState('1500');
  const [term, setTerm] = useState('24');
  const [loanType, setLoanType] = useState('digital');
  const [from, setFrom] = useState('GEL');
  const [to, setTo] = useState('USD');
  const [instant, setInstant] = useState(false);
  const tabs = useRef([]);
  const principal = Number(amount), months = Number(term);
  const validAmount = amount !== '' && Number.isFinite(principal) && principal > 0 && principal <= 1000000;
  const validTerm = term !== '' && Number.isInteger(months) && months >= 1 && months <= 120;
  const valid = validAmount && (mode === 2 || validTerm);
  const annual = loanType === 'auto' ? .18 : .22;
  const monthlyRate = annual / 12;
  const payment = valid ? principal * monthlyRate / (1 - Math.pow(1 + monthlyRate, -months)) : 0;
  const savings = valid ? principal * Math.pow(1 + .08 / 12, months) : 0;
  const converted = valid ? principal * exampleRates[from] / exampleRates[to] : 0;
  function changeMode(next, keyboard = false) { setInstant(keyboard); setMode(next); }
  function keyTab(e, index) {
    let next;
    if (e.key === 'ArrowRight') next = (index + 1) % 3;
    if (e.key === 'ArrowLeft') next = (index + 2) % 3;
    if (e.key === 'Home') next = 0;
    if (e.key === 'End') next = 2;
    if (next !== undefined) { e.preventDefault(); changeMode(next, true); tabs.current[next].focus(); }
  }
  return <section className="calculator section-container" id="calculator" aria-labelledby="calculator-title">
    <h2 id="calculator-title">{'გამოთვალე მარტივად'.toUpperCase()}</h2>
    <div className="calculator-tabs" role="tablist" aria-label="კალკულატორის ტიპი" data-instant={instant}>
      <span className="tab-indicator" style={{ transform: `translateX(${mode * 100}%)` }} />
      {modes.map((label, i) => <button key={label} ref={el => { tabs.current[i] = el; }} type="button" role="tab" id={`calculator-tab-${i}`} aria-controls="calculator-panel" aria-selected={i === mode} tabIndex={i === mode ? 0 : -1} onClick={e => changeMode(i, e.detail === 0)} onKeyDown={e => keyTab(e, i)}>{label.toUpperCase()}</button>)}
    </div>
    <div className="calculator-box" role="tabpanel" id="calculator-panel" aria-labelledby={`calculator-tab-${mode}`} tabIndex={0} data-instant={instant}>
      <div className="calculator-content" key={mode}>
        <div className="calculator-form">
          {mode === 0 && <label className="field"><span className="field-label">აირჩიე სესხი</span><select className="product-select" aria-label="სესხის ტიპი" value={loanType} onChange={e => setLoanType(e.target.value)}><option value="digital">ციფრული სესხი</option><option value="auto">ავტო სესხი</option></select></label>}
          {mode === 1 && <label className="field"><span className="field-label">აირჩიე ანაბარი</span><select className="product-select" aria-label="ანაბრის ტიპი"><option>ვადიანი ანაბარი</option></select></label>}
          {mode === 2 && <div className="currency-pair"><label>გასაყიდი ვალუტა<select aria-label="გასაყიდი ვალუტა" value={from} onChange={e => setFrom(e.target.value)}>{Object.keys(exampleRates).map(c => <option key={c}>{c}</option>)}</select></label><button type="button" className="swap-currencies" aria-label="ვალუტების გაცვლა" onClick={() => { setFrom(to); setTo(from); }}>⇄</button><label>მისაღები ვალუტა<select aria-label="მისაღები ვალუტა" value={to} onChange={e => setTo(e.target.value)}>{Object.keys(exampleRates).map(c => <option key={c}>{c}</option>)}</select></label></div>}
          <div><NumberField label={mode === 0 ? 'სესხის თანხა' : mode === 1 ? 'ანაბრის თანხა' : 'თანხა'} sublabel="თანხა" value={amount} onChange={setAmount} unit={mode === 2 ? from : '₾'} /><p className="field-hint">{!validAmount ? 'შეიყვანე თანხა 1-დან 1,000,000-მდე' : `1 ${mode === 2 ? from : '₾'}-დან 1,000,000 ${mode === 2 ? from : '₾'}-მდე`}</p></div>
          {mode !== 2 && <div><NumberField label={mode === 0 ? 'სესხის ვადა' : 'ანაბრის ვადა'} sublabel="თვე" value={term} onChange={setTerm} max={120} />{!validTerm && <p className="field-hint">შეიყვანე 1–120 სრული თვე</p>}</div>}
        </div>
        <div className="calculator-divider"><img src="/assets/2e8c2.svg" alt="" /></div>
        <div className="calculator-result">
          <div aria-live="polite" aria-atomic="true">
            <p className="result-caption">{mode === 0 ? 'თვიური გადასახადი' : mode === 1 ? 'ვადის ბოლოს მიიღებ' : 'მიიღებ'}</p>
            <p className="result-value">{valid ? fmt(mode === 0 ? payment : mode === 1 ? savings : converted) : '—'} {mode === 2 ? to : '₾'}</p>
            <div className="result-rule"><img src="/assets/29889.svg" alt="" /></div>
            <dl className="result-details"><div><dt>{mode === 2 ? 'კურსი' : 'სულ თანხა'}</dt><dd>{mode === 2 ? `1 ${from} = ${fmt(exampleRates[from] / exampleRates[to], 4)} ${to}` : `${validAmount ? fmt(principal, 0) : '—'} ₾`}</dd></div><div><dt>{mode === 2 ? 'ვალუტის წყვილი' : mode === 0 ? 'სესხის ვადა' : 'ანაბრის ვადა'}</dt><dd>{mode === 2 ? `${from} / ${to}` : `${validTerm ? months : '—'} თვე`}</dd></div></dl>
            <div className="result-rule"><img src="/assets/29889.svg" alt="" /></div>
            {mode !== 2 && <dl className="result-details"><div><dt>წლიური პროცენტი</dt><dd>{mode === 0 ? fmt(annual * 100, 0) : '8'}%</dd></div><div><dt>{mode === 0 ? 'ეფექტური პროცენტი' : 'საპროცენტო სარგებელი'}</dt><dd>{mode === 0 ? `${fmt((Math.pow(1 + monthlyRate, 12) - 1) * 100)}%` : `${valid ? fmt(savings - principal) : '—'} ₾`}</dd></div></dl>}
            <p className="example-note">საილუსტრაციო გამოთვლა · პირობები და კურსები სატესტოა</p>
          </div>
          <Action onClick={() => onAction(mode === 2 ? 'ვალუტის გადაცვლა' : mode === 1 ? 'ანაბრის გახსნა' : 'გაიგე შენი ლიმიტი')}>{mode === 0 ? 'გაიგე შენი ლიმიტი' : mode === 1 ? 'გახსენი ანაბარი' : 'გადაცვალე MyCredo-ში'}</Action>
        </div>
      </div>
    </div>
  </section>;
}

export default function Home() {
  const [mode, setMode] = useState(0);
  const [dialog, setDialog] = useState('');
  const dialogRef = useRef(null);
  const returnFocusRef = useRef(null);
  function showDialog(title) { returnFocusRef.current = document.activeElement; setDialog(title); dialogRef.current.showModal(); }
  function explore(next) {
    setMode(next);
    document.getElementById('calculator').scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
    requestAnimationFrame(() => document.getElementById(`calculator-tab-${next}`).focus({ preventScroll: true }));
  }
  return <>
    <a className="skip-link" href="#products">გადადით მთავარ შინაარსზე</a>
    <SiteHeader />
    <main id="top">
      <section className="hero section-container" aria-labelledby="hero-title"><div className="hero-content"><h1 id="hero-title">{'ავტო სესხი'.toUpperCase()}</h1><p>შეიძინე ახალი ან მეორადი ავტომობილი მარტივი პირობებით და მართე განაცხადი შენთვის მოსახერხებლად.</p><Action onClick={() => explore(0)}>გაიგე მეტი</Action></div><div className="hero-photo"><img src="/assets/2fed6.png" alt="ნარინჯისფერი ავტომობილი ქალაქის ქუჩაზე" fetchPriority="high" /></div><div className="hero-controls" aria-label="კამპანიის ნავიგაცია"><button type="button" disabled aria-label="წინა კამპანია"><img src="/assets/2409b.svg" alt="" /></button><button type="button" disabled aria-label="შემდეგი კამპანია"><img src="/assets/2409b.svg" alt="" /></button></div></section>
      <section className="products section-container" id="products" aria-labelledby="products-title"><h2 id="products-title">{'იპოვე შენთვის საჭირო პროდუქტი'.toUpperCase()}</h2><div className="product-grid">
        <ProductCard kind="loan" title="მიიღე სესხი სახლიდან გაუსვლელად" background={<LoanRibbonBackground />} onExplore={() => explore(0)}><ArtStage width={733} height={698}><CredoPhoneVideo /></ArtStage></ProductCard>
        <ProductCard kind="split" title="და-ყა-ვი შენს ტემპში" onExplore={() => showDialog('და-ყა-ვი შენს ტემპში')}><SplitPayment /></ProductCard>
      <SavingsGoal onExploreSavings={() => explore(1)} onJoinFamily={() => window.location.assign('https://credobank.ge/products/current-account')} />
        <ProductCard kind="card" title="ბარათი ყოველდღიური ფინანსებისთვის" onExplore={() => showDialog('ბარათი ყოველდღიური ფინანსებისთვის')}><BankCard3D><div className="bank-card-art"><ArtStage width={244} height={387}><CardArt /></ArtStage></div></BankCard3D></ProductCard>
        <ProductCard kind="transfer" title="გააგზავნე და მიიღე ფული საზღვარგარეთ" onExplore={() => explore(2)}><TransferGlobe /></ProductCard>
        <SharedBentoBackground />
      </div></section>
      <AppShowcase onDownload={() => showDialog('გადმოწერე მობაილბანკი')} />
      <Calculator mode={mode} setMode={setMode} onAction={showDialog} />
      <NewsSection />
    </main>
    <dialog ref={dialogRef} className="detail-dialog" onClose={() => { setDialog(''); returnFocusRef.current?.focus(); }} onClick={e => { if (e.target === e.currentTarget) e.currentTarget.close(); }} aria-labelledby="dialog-title"><button type="button" className="dialog-close" aria-label="დახურვა" onClick={() => dialogRef.current.close()}>×</button><h2 id="dialog-title">{dialog}</h2><p>ეს დიზაინის ინტერაქტიული პროტოტიპია. საბანკო განაცხადის გაგზავნა და აპის გადმოწერის პროცესი მოგვიანებით დაემატება.</p><Action onClick={() => dialogRef.current.close()}>დახურვა</Action></dialog>
  </>;
}
