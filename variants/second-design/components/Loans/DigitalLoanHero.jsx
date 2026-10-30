import Image from "next/image";
import Button from "../Button/Button";
import styles from "./DigitalLoan.module.css";
const AUDIENCE = ["ხარ თვითდასაქმებული: ტაქსის მძღოლი, ხელოსანი, სტილისტი, მოვაჭრე", "იღებ ფულად გზავნილებს", "გაქვს შემოსავალი ბიზნესიდან", "გაქვს შემოსავალი აგრო საქმიანობიდან", "გასამრჯელოს ხელზე იღებ", "თუ ხელფასი ბანკის ანგარიშზე გერიცხება"];
export default function DigitalLoanHero() {
  return <section className={styles.heroWrap} aria-labelledby="digital-loan-title">
      <div className={styles.hero}>
        <div className={styles.heroRow}>
          <div className={styles.heroContent}>
            <div className={styles.heroText}>
              <div className={styles.intro}>
                <h1 id="digital-loan-title" className={styles.title}>
                  ციფრული სესხი
                </h1>
                <div className={styles.lead}>
                  <p>მიიღე 70 000 ლარამდე სესხი ციფრულად - 30 წუთში, 24/7 ზე, შაბათ-კვირის ჩათვლით.</p>
                  <p>ციფრული სესხი ხელმისაწვდომია ყველასთვის. მნიშვნელობა არ აქვს, როგორ იღებ შემოსავალს:</p>
                </div>
              </div>
              <ul className={styles.audience}>
                {AUDIENCE.map(item => <li key={item}>
                    <img src="/design-two/icons/check.svg" width={20} height={20} alt="" />
                    {item}
                  </li>)}
              </ul>
            </div>
            {/* CAPS button style is written in Mtavruli (see Button.module.css) */}
            <Button href="https://credobank.ge/products/digital-loan" target="_blank" rel="noopener noreferrer" variant="primary" size="medium" className={styles.cta} aria-label="მოითხოვე სესხი">
              ᲛᲝᲘᲗᲮᲝᲕᲔ ᲡᲔᲡᲮᲘ
            </Button>
          </div>
          <div className={styles.heroMedia}>
            <Image src="/design-two/images/loans/digital-loan-hero.png" alt="ციფრული სესხი MyCredo აპლიკაციაში" width={800} height={500} className={styles.heroImage} priority />
          </div>
        </div>
      </div>
    </section>;
}
