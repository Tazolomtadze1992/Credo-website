"use client";

import { useId, useState } from "react";
import styles from "./DigitalLoan.module.css";
// Only the second answer is in the Figma design; the rest still need copy from the bank.
const ITEMS = [{
  question: "როგორ მოვითხოვო სესხი ციფრულად?"
}, {
  question: "სწრაფი სესხის პირობები",
  answer: "პირობების ნახვა შეგიძლია მობაილბანკში, ინტერნეტბანკში და სერვისცენტრში"
}, {
  question: "რა დრო სჭირდება ონლაინ სესხის დამტკიცებას?"
}, {
  question: "თუ მოთხოვნა არ დამტკიცდა, როდის შემიძლია სესხი ხელახლა მოვითხოვო?"
}, {
  question: "როგორ მივიღო ონლაინ სეხი?"
}];
export default function Faq() {
  // The design shows the second question open
  const [open, setOpen] = useState(1);
  const ids = useId();
  return <section className={styles.faq} aria-labelledby={`${ids}-title`}>
      <h2 id={`${ids}-title`} className={styles.faqTitle}>
        ხშირად დასმული კითხვები
      </h2>
      <div className={styles.faqList}>
        {ITEMS.map((item, i) => {
        const isOpen = open === i && Boolean(item.answer);
        return <div key={item.question} className={`${styles.faqItem} ${isOpen ? styles.faqItemOpen : ""}`}>
              <h3 className={styles.faqHeading}>
                <button className={styles.faqButton} aria-expanded={isOpen} aria-controls={`${ids}-answer-${i}`} aria-disabled={!item.answer} onClick={() => item.answer && setOpen(isOpen ? -1 : i)}>
                  <span className={styles.faqNumber}>{i + 1}.</span>
                  <span className={styles.faqQuestion}>{item.question}</span>
                  <img className={styles.faqChevron} src={isOpen ? "/design-two/icons/faq-chevron-up.svg" : "/design-two/icons/faq-chevron-down.svg"} width={31.15} height={30.55} alt="" />
                </button>
              </h3>
              {item.answer && <div id={`${ids}-answer-${i}`} className={styles.faqAnswer} hidden={!isOpen}>
                  <p>{item.answer}</p>
                </div>}
            </div>;
      })}
      </div>
    </section>;
}
