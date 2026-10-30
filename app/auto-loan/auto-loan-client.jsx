'use client';

import { useEffect, useRef, useState } from 'react';
import SiteHeader from '../../components/SiteHeader';
import { estimatePayment, products, resolveProduct, SOURCE_URL } from './loan-data.mjs';
import styles from './auto-loan.module.css';

const uppercase = text => text.toUpperCase();
const number = value => new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value);

function Plus({ className }) {
  return <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14M12 5v14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>;
}

function StepIcon({ index }) {
  const paths = [<><path d="M5 16V9a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v7M4 12h16M7 7l1-3h8l1 3M6 16v3m12-3v3M7 15h1m8 0h1" /></>, <><path d="M14 4H6a2 2 0 0 0-2 2v14h14v-8M9 15l1-4 8-8 3 3-8 8-4 1ZM8 7h3" /></>, <><path d="m9 12 3 3 7-8M20 12a8 8 0 1 1-5-7.4" /></>];
  return <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[index]}</svg>;
}

function Apply({ product, secondary = false }) {
  return <a className={`${styles.apply} ${secondary ? styles.secondary : ''}`} href={product.application} target="_blank" rel="noreferrer">{uppercase('მოითხოვე სესხი')}</a>;
}

function VehicleScene({ product }) {
  return <div className={styles.scene} data-type={product.id}>
    <div className={styles.horizon} aria-hidden="true" />
    <div className={styles.ground} aria-hidden="true" />
    <div className={styles.vehicles}>
      {['new', 'used'].map(id => {
        const item = resolveProduct(id);
        const shown = id === 'used' ? product.id === 'used' : product.id !== 'used';
        return <img className={styles.vehicle} key={id} src={item.image} width="1536" height="1024" alt={shown ? product.alt : ''} aria-hidden={!shown} data-visible={shown} fetchPriority={id === 'new' ? 'high' : 'auto'} draggable="false" />;
      })}
    </div>
    <div className={styles.ownership} aria-hidden={product.id !== 'cash'}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m5 12 4 4 10-10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
      <span>ავტომობილი<br />რჩება შენთან</span>
    </div>
  </div>;
}

function Calculator({ product }) {
  const [amount, setAmount] = useState('30000');
  const [term, setTerm] = useState(36);
  const payment = estimatePayment(amount, term, product.annual);
  const invalid = payment === null;
  return <section className={styles.calculator} id="auto-calculator" aria-labelledby="auto-calculator-heading">
    <div className={styles.calculatorHeading}><h2 id="auto-calculator-heading">{uppercase('გამოთვალე შენი შენატანი')}</h2><span>{product.label}</span></div>
    <div className={styles.calculatorBody}>
      <div className={styles.fields}>
        <label className={styles.amountLabel} htmlFor="auto-amount">სესხის თანხა</label>
        <div className={styles.amountShell}>
          <input id="auto-amount" type="text" inputMode="numeric" value={amount} maxLength={10} aria-invalid={invalid} aria-describedby={invalid ? 'auto-amount-error' : undefined} onChange={e => { if (/^\d*$/.test(e.target.value)) setAmount(e.target.value); }} onBlur={() => { if (amount) setAmount(String(Number(amount))); }} />
          <span>₾</span>
        </div>
        {invalid && <p className={styles.fieldError} id="auto-amount-error">შეამოწმე შეყვანილი თანხა.</p>}
        <div className={styles.termHeading}><label htmlFor="auto-term">სესხის ვადა</label><output htmlFor="auto-term">{term} თვე</output></div>
        <input className={styles.range} id="auto-term" type="range" min="12" max="72" step="1" value={term} aria-valuetext={`${term} თვე`} onChange={e => setTerm(Number(e.target.value))} style={{ '--progress': `${(term - 12) / 60 * 100}%` }} />
        <div className={styles.rangeLimits} aria-hidden="true"><span>12 თვე</span><span>72 თვე</span></div>
        <div className={styles.quickTerms} aria-label="სესხის ვადის არჩევა">{[24, 36, 48, 60].map(months => <button type="button" key={months} aria-pressed={term === months} onClick={() => setTerm(months)}>{months} თვე</button>)}</div>
      </div>
      <div className={styles.result}>
        <span className={styles.resultLabel}>სავარაუდო ყოველთვიური შენატანი</span>
        <output className={styles.payment} htmlFor="auto-amount auto-term" aria-live="polite" aria-atomic="true">{invalid ? '—' : number(payment)}<span>₾</span></output>
        <div className={styles.resultRate}><span>წლიური განაკვეთი</span><span>{product.annual}%-დან</span></div>
        <Apply product={product} />
        <p className={styles.calculatorNote}>საილუსტრაციო გამოთვლა მინიმალური წლიური განაკვეთით, საკომისიოების გარეშე. ზუსტი პირობები ინდივიდუალურია.</p>
      </div>
    </div>
  </section>;
}

function Conditions({ product }) {
  const terms = [
    ['სესხის ვადა', '12–72 თვე'],
    ['წლიური საპროცენტო განაკვეთი', `${product.annual}%-დან`],
    ['ეფექტური საპროცენტო განაკვეთი', `${product.effective}%-დან`],
    ...(product.id !== 'cash' ? [['თანამონაწილეობა', '0%-დან']] : []),
    ['გაცემის საკომისიო', '0%'],
    ['მონიტორინგის საკომისიო', '0.5 ₾-დან'],
    ['მიმდინარე ანგარიშის მომსახურება', '1 ₾ / თვე'],
  ];
  return <section className={styles.questions} aria-labelledby="auto-questions-heading">
    <h2 id="auto-questions-heading">{uppercase('კითხვები და პასუხები')}</h2>
    <div className={styles.questionList}>
      <details><summary>სესხის პირობები<Plus /></summary><div className={styles.answer}>
        <dl className={styles.conditions}>{terms.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
        <a href={product.contract} target="_blank" rel="noreferrer" className={styles.textLink}>ხელშეკრულების პირობები <span aria-hidden="true">↗</span></a>
      </div></details>
      <details><summary>{product.id === 'cash' ? 'ავტომობილი ჩემთან რჩება?' : 'შემიძლია კერძო პირისგან შეძენა?'}<Plus /></summary><div className={styles.answer}><p>{product.id === 'cash' ? 'დიახ. ავტომობილი რჩება შენს სახელზე და შენს სარგებლობაში. ის სესხის უზრუნველყოფაა.' : 'დიახ. მეორადი ავტომობილის შეძენა შესაძლებელია როგორც ავტოსალონიდან, ისე კერძო პირისგან.'}</p></div></details>
      <details><summary>{product.id === 'cash' ? 'რომელი დოკუმენტები მჭირდება?' : 'ელექტრო ავტომობილსაც ეხება?'}<Plus /></summary><div className={styles.answer}><p>{product.id === 'cash' ? 'განაცხადისთვის მოამზადე პირადობის მოწმობა და ავტომობილის ტექპასპორტი.' : 'დიახ. კრედოს ავტო სესხით ელექტრო ავტომობილის შეძენაც შეგიძლია. პარტნიორ ავტოსალონებში მოქმედი შეთავაზებების პირობები ცალკე გადაამოწმე.'}</p>{product.id !== 'cash' && <a className={styles.textLink} href="#auto-partners" target="_blank" rel="noreferrer">პარტნიორი ავტოსალონები <span aria-hidden="true">↗</span></a>}</div></details>
      <details><summary>როგორ შევავსო განაცხადი?<Plus /></summary><div className={styles.answer}><p>შეგიძლია განაცხადი შეავსო ონლაინ, Mycredo-ში ან მიმართო კრედოს სერვისცენტრს.</p><a className={styles.textLink} href="tel:*4242">დაგვიკავშირდი — *4242</a></div></details>
    </div>
  </section>;
}

export default function AutoLoan({ initialType = 'new' }) {
  const [type, setType] = useState(initialType);
  const [instant, setInstant] = useState(false);
  const tabs = useRef([]);
  const product = resolveProduct(type);
  useEffect(() => {
    const onPop = () => { setInstant(true); setType(resolveProduct(new URL(window.location.href).searchParams.get('type')).id); };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);
  function select(index, keyboard = false) {
    if (index < 0 || index >= products.length || products[index].id === type) return;
    const next = products[index];
    setInstant(keyboard); setType(next.id);
    const url = new URL(window.location.href);
    url.searchParams.set('type', next.id);
    window.history.pushState(null, '', url);
  }
  function tabKey(event, index) {
    const next = event.key === 'ArrowRight' ? (index + 1) % products.length : event.key === 'ArrowLeft' ? (index + products.length - 1) % products.length : event.key === 'Home' ? 0 : event.key === 'End' ? products.length - 1 : null;
    if (next !== null) { event.preventDefault(); select(next, true); tabs.current[next]?.focus(); }
  }
  return <div className={styles.root} data-instant={instant}>
    <a className="skip-link" href="#auto-main">მთავარ შინაარსზე გადასვლა</a>
    <SiteHeader />
    <main id="auto-main" className={styles.main}>
      <section className={styles.hero} aria-labelledby="auto-title">
        <h1 id="auto-title">{uppercase('ავტო სესხი')}</h1>
        <div className={styles.tabs} role="tablist" aria-label="ავტო სესხის მიზანი">
          {products.map((item, index) => <button id={`auto-tab-${item.id}`} type="button" key={item.id} ref={element => { tabs.current[index] = element; }} role="tab" aria-selected={item.id === type} aria-controls="auto-product" tabIndex={item.id === type ? 0 : -1} onKeyDown={e => tabKey(e, index)} onClick={e => select(index, e.detail === 0)}>{item.label}</button>)}
        </div>
        <div id="auto-product" role="tabpanel" aria-labelledby={`auto-tab-${product.id}`} tabIndex={0} className={styles.heroPanel}>
          <VehicleScene product={product} />
          <div className={styles.heroBottom}>
            <p>{product.description}</p>
            <div className={styles.heroActions}><Apply product={product} /><a className={styles.calculateLink} href="#auto-calculator">გამოთვალე შენატანი <span aria-hidden="true">↓</span></a></div>
          </div>
        </div>
      </section>
      <div className={styles.content}>
        <dl className={styles.facts} aria-label={`${product.label} — ძირითადი პირობები`}>
          <div><dt>წლიური განაკვეთი</dt><dd>{product.annual}%<span>-დან</span></dd></div>
          <div><dt>ეფექტური განაკვეთი</dt><dd>{product.effective}%<span>-დან</span></dd></div>
          <div><dt>სესხის ვადა</dt><dd>12–72<span>თვე</span></dd></div>
        </dl>
        <Calculator product={product} />
        <section className={styles.how} aria-labelledby="auto-how-heading">
          <div className={styles.howHeading}><h2 id="auto-how-heading">{uppercase('შენი შემდეგი ნაბიჯი')}</h2></div>
          <ol className={styles.steps}>{product.steps.map(([title, detail], index) => <li key={index}><StepIcon index={index} /><h3>{title}</h3><p>{detail}</p></li>)}</ol>
        </section>
        <section className={styles.partners} id="auto-partners" aria-labelledby="auto-partners-heading">
          <h2 id="auto-partners-heading">{uppercase('პარტნიორი ავტოსალონები')}</h2>
          <ul className={styles.partnerGrid}>
            {[
              { name: 'Solar Auto', image: 'Im0.png', href: 'https://solarauto.ge' },
              { name: 'E-Motions', image: 'Im1.png', href: 'https://e-motions.ge' },
              { name: 'Li Auto Georgia', image: 'Im2.png', href: 'https://www.facebook.com/liautogeorgia', square: true },
              { name: 'Sena Auto Group', image: 'Im3.png', href: 'https://senaautogroup.com' },
              { name: 'BYD Georgia', image: 'Im4.png', href: 'https://www.facebook.com/BYDGeorgia.Official', square: true },
            ].map(partner => <li key={partner.name}><a className={styles.partnerCard} href={partner.href} target="_blank" rel="noreferrer"><span className={styles.partnerLogo} data-square={partner.square || undefined}><img src={`/assets/auto-loan/partners/${partner.image}`} alt="" loading="lazy" /></span><span>{partner.name}</span></a></li>)}
          </ul>
        </section>
        <Conditions product={product} />
        <footer className={styles.footer}><a href="/#site-top">კრედო ბანკი</a><a href={SOURCE_URL} target="_blank" rel="noreferrer">პირობები და დამატებითი ინფორმაცია <span aria-hidden="true">↗</span></a></footer>
      </div>
    </main>
  </div>;
}
