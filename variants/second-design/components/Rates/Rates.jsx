"use client";

import { useEffect, useRef, useState } from "react";
import Button from "../Button/Button";
import styles from "./Rates.module.css";
const RATE_TYPES = [{
  id: "commercial",
  label: "კომერციული"
}, {
  id: "nbg",
  label: "ეროვნული ბანკის"
}];

// Values are the design's placeholders; replace with live rates per type from the rates API.
const RATES = [{
  code: "USD",
  name: "აშშ დოლარი",
  flag: "/design-two/icons/flags/usd.svg",
  buy: 2.875,
  sell: 2.8718
}, {
  code: "EUR",
  name: "ევრო",
  flag: "/design-two/icons/flags/eur.svg",
  buy: 2.875,
  sell: 2.8718
}, {
  code: "RUB",
  name: "რუსული რუბლი",
  flag: "/design-two/icons/flags/rub.svg",
  buy: 2.875,
  sell: 2.8718
}];
const formatRate = value => `${value.toFixed(4)} ₾`;
export default function Rates() {
  const [rateType, setRateType] = useState("commercial");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  useEffect(() => {
    if (!menuOpen) return;
    const close = event => {
      if (event instanceof KeyboardEvent ? event.key === "Escape" : !menuRef.current?.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", close);
    };
  }, [menuOpen]);
  const current = RATE_TYPES.find(t => t.id === rateType);
  return <section className={styles.section} aria-labelledby="rates-title">
      <div className={styles.head}>
        <h2 id="rates-title" className={styles.title}>
          ვალუტის კურსი
        </h2>
        <div className={styles.typeMenu} ref={menuRef}>
          <button className={styles.typeButton} aria-haspopup="listbox" aria-expanded={menuOpen} onClick={() => setMenuOpen(open => !open)}>
            {current.label}
            <img src="/design-two/icons/chevron-down-small.svg" width={20} height={20} alt="" />
          </button>
          {menuOpen && <ul className={styles.typeList} role="listbox" aria-label="კურსის ტიპი">
              {RATE_TYPES.map(type => <li key={type.id} role="option" aria-selected={type.id === rateType} tabIndex={0} onClick={() => {
            setRateType(type.id);
            setMenuOpen(false);
          }} onKeyDown={e => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setRateType(type.id);
              setMenuOpen(false);
            }
          }}>
                  {type.label}
                </li>)}
            </ul>}
        </div>
      </div>

      <div className={styles.cards}>
        {RATES.map(rate => <article key={rate.code} className={styles.card}>
            <div className={styles.currency}>
              <img src={rate.flag} width={44} height={44} alt="" />
              <div className={styles.currencyText}>
                <h3>{rate.code}</h3>
                <p>{rate.name}</p>
              </div>
            </div>
            <dl className={styles.values}>
              <div>
                <dt>ყიდვა</dt>
                <dd>{formatRate(rate.buy)}</dd>
              </div>
              <div>
                <dt>გაყიდვა</dt>
                <dd>{formatRate(rate.sell)}</dd>
              </div>
            </dl>
          </article>)}
      </div>

      {/* CAPS button style is written in Mtavruli (see Button.module.css) */}
      <Button variant="secondary" size="medium" className={styles.all} aria-label="ყველა ვალუტა">
        ᲧᲕᲔᲚᲐ ᲕᲐᲚᲣᲢᲐ
      </Button>
    </section>;
}
