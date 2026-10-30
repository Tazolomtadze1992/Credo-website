"use client";

import { useId, useState } from "react";
import Button from "../Button/Button";
import styles from "./Calculator.module.css";
const MIN_AMOUNT = 1500;
const MAX_AMOUNT = 80000;
const TERMS = [6, 12, 24, 36, 48];

// Illustrative annual rates (loan rates match the design's 22% example; deposit as in Credo-web-variants)
const PRODUCTS = {
  loan: [{
    id: "consumer",
    label: "სამომხმარებლო სესხი",
    rate: 0.22
  }, {
    id: "auto",
    label: "ავტო სესხი",
    rate: 0.18
  }],
  deposit: [{
    id: "term",
    label: "ვადიანი ანაბარი",
    rate: 0.08
  }]
};
const COPY = {
  loan: {
    product: "აირჩიე სესხი",
    amount: "სესხის თანხა",
    term: "სესხის ვადა",
    result: "ყოველთვიური შენატანი",
    total: "სულ გადასახდელი",
    // CAPS button style is written in Mtavruli (see Button.module.css)
    cta: "ᲛᲝᲘᲗᲮᲝᲕᲔ ᲡᲔᲡᲮᲘ",
    ctaLabel: "მოითხოვე სესხი"
  },
  deposit: {
    product: "აირჩიე ანაბარი",
    amount: "ანაბრის თანხა",
    term: "ანაბრის ვადა",
    result: "ვადის ბოლოს მიიღებ",
    total: "საპროცენტო სარგებელი",
    cta: "ᲒᲐᲮᲡᲔᲜᲘ ᲐᲜᲐᲑᲐᲠᲘ",
    ctaLabel: "გახსენი ანაბარი"
  }
};

// "1 867.61" — space-grouped thousands, as in the design
const formatMoney = (value, decimals = 2) => new Intl.NumberFormat("en-US", {
  minimumFractionDigits: decimals,
  maximumFractionDigits: decimals
}).format(value).replace(/,/g, " ");
const DEFAULT_NOTE = "სესხის ზუსტი პირობები განისაზღვრება ჯამური შემოსავლებისა და ვალდებულებების ანალიზის შემდგომ";
export default function Calculator({
  loanOnly = false,
  startingFrom = false,
  note = DEFAULT_NOTE
}) {
  const from = startingFrom ? " - დან" : "";
  const [mode, setMode] = useState("loan");
  const [productId, setProductId] = useState(PRODUCTS.loan[0].id);
  const [amountInput, setAmountInput] = useState("1500");
  // The design's results are computed for 24 months
  const [term, setTerm] = useState(24);
  const ids = useId();
  const copy = COPY[mode];
  const products = PRODUCTS[mode];
  const product = products.find(p => p.id === productId) ?? products[0];
  const amount = Number(amountInput);
  const valid = amount >= MIN_AMOUNT && amount <= MAX_AMOUNT;
  const monthlyRate = product.rate / 12;
  const payment = amount * monthlyRate / (1 - Math.pow(1 + monthlyRate, -term));
  const maturity = amount * Math.pow(1 + monthlyRate, term);
  const headline = mode === "loan" ? payment : maturity;
  const total = mode === "loan" ? payment * term : maturity - amount;
  const switchMode = next => {
    setMode(next);
    setProductId(PRODUCTS[next][0].id);
  };
  return <section className={styles.section} id="calculator" aria-labelledby={`${ids}-title`}>
      <h2 id={`${ids}-title`} className={`${styles.heading} ${startingFrom ? styles.headingSmall : ""}`}>
        გამოთვალე მარტივად
      </h2>

      {!loanOnly && <div className={styles.tabs} role="tablist" aria-label="კალკულატორი">
        {[["loan", "სესხი"], ["deposit", "ანაბარი"]].map(([id, label]) => <button key={id} role="tab" aria-selected={mode === id} className={`${styles.tab} ${mode === id ? styles.tabActive : ""}`} onClick={() => switchMode(id)}>
            {label}
          </button>)}
      </div>}

      <div className={styles.box}>
        <div className={styles.form}>
          <div className={styles.field}>
            <label htmlFor={`${ids}-product`} className={styles.label}>
              {copy.product}
            </label>
            <div className={styles.control}>
              <select id={`${ids}-product`} className={styles.input} value={product.id} onChange={e => setProductId(e.target.value)}>
                {products.map(p => <option key={p.id} value={p.id}>
                    {p.label}
                  </option>)}
              </select>
              <img className={styles.chevron} src="/design-two/icons/keyboard-arrow-down.svg" width={20} height={20} alt="" />
            </div>
          </div>

          <div className={styles.field}>
            <label htmlFor={`${ids}-amount`} className={styles.label}>
              {copy.amount}
            </label>
            <div className={styles.inputField}>
              <div className={styles.control}>
                <input id={`${ids}-amount`} className={styles.input} inputMode="numeric" autoComplete="off" value={amountInput ? Number(amountInput).toLocaleString("en-US") : ""} onChange={e => setAmountInput(e.target.value.replace(/\D/g, "").slice(0, 6))} aria-invalid={!valid} aria-describedby={`${ids}-amount-hint`} />
              </div>
              <p id={`${ids}-amount-hint`} className={`${styles.hint} ${valid ? "" : styles.hintError}`}>
                მინ. 1,500 და მაქს. 80,000 ₾
              </p>
            </div>
          </div>

          <div className={styles.field}>
            <label htmlFor={`${ids}-term`} className={styles.label}>
              ვადა
            </label>
            <div className={styles.control}>
              <select id={`${ids}-term`} className={styles.input} value={term} onChange={e => setTerm(Number(e.target.value))}>
                {TERMS.map(n => <option key={n} value={n}>
                    {n} თვე
                  </option>)}
              </select>
              <img className={styles.chevron} src="/design-two/icons/keyboard-arrow-down.svg" width={20} height={20} alt="" />
            </div>
          </div>

          <div className={styles.divider} aria-hidden="true">
            <img src="/design-two/icons/divider-line.svg" width={344} height={1} alt="" />
          </div>
        </div>

        <div className={styles.results} aria-live="polite">
          <div className={styles.headline}>
            <p className={styles.headlineLabel}>{copy.result}</p>
            <p className={styles.headlineValue}>{valid ? `${formatMoney(headline)} ₾${from}` : "— ₾"}</p>
          </div>

          <dl className={styles.details}>
            <div className={styles.detailsRow}>
              <div className={styles.detail}>
                <dt>{copy.amount}</dt>
                <dd>{valid ? `${formatMoney(amount, 0)} ₾${from}` : "—"}</dd>
              </div>
              <div className={styles.detail}>
                <dt>{copy.term}</dt>
                <dd>{term} თვე</dd>
              </div>
            </div>
            <div className={styles.detailsRow}>
              <div className={styles.detail}>
                <dt>წლიური განაკვეთი (საილუსტრ.)</dt>
                <dd>
                  {Math.round(product.rate * 100)}%{from}
                </dd>
              </div>
              {!startingFrom && <div className={styles.detail}>
                  <dt>{copy.total}</dt>
                  <dd>{valid ? `${formatMoney(total)} ₾` : "—"}</dd>
                </div>}
            </div>
          </dl>

          {mode === "loan" && <p className={styles.note}>{note}</p>}

          <Button variant="primary" size="medium" className={styles.cta} disabled={!valid} aria-label={copy.ctaLabel}>
            {copy.cta}
          </Button>
        </div>
      </div>
    </section>;
}
