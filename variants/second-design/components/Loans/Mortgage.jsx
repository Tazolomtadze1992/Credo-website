import Image from "next/image";
import Button from "../Button/Button";
import styles from "./Loans.module.css";
const POINTS = ["ბინის, სახლის ან კომერციული ფართის შეძენა", "უძრავი ქონების მშენებლობა ან რემონტი", "არსებული სესხის გადაფარვა ან გაერთიანება", "გაარემონტე ან განაახლე შენი საცხოვრებელი - დააფინანსე სარემონტო სამუშაოები იპოთეკური სესხით"];
export default function Mortgage() {
  return <section className={styles.mortgageWrap} aria-labelledby="mortgage-title">
      <div className={styles.mortgage}>
        <div className={styles.mortgageMedia}>
          <Image src="/design-two/images/loans/mortgage-loan.png" alt="" fill sizes="544px" className={styles.photo} />
        </div>
        <div className={styles.mortgageContent}>
          <div className={styles.mortgageText}>
            <div className={styles.copy}>
              <h2 id="mortgage-title" className={styles.cardTitle}>
                იპოთეკური სესხი
              </h2>
              <p className={styles.cardText}>
                კრედო ბანკში იპოთეკური სესხის მიღება შეგიძლია. თუ შენი შემოსავალი სეზონურია ან რამდენიმე წყაროდან
                ფორმირდება, გადახდის გრაფიკს სრულად მოვარგებთ შენი შემოსავლების სპეციფიკას
              </p>
            </div>
            <ul className={styles.points}>
              {POINTS.map(point => <li key={point}>
                  <img src="/design-two/icons/check.svg" width={20} height={20} alt="" />
                  {point}
                </li>)}
            </ul>
          </div>
          {/* CAPS button style is written in Mtavruli (see Button.module.css) */}
          <Button href="https://credobank.ge/products/mortgage-loan" target="_blank" rel="noopener noreferrer" variant="primary" size="medium" className={styles.cta} aria-label="მოითხოვე სესხი">
            ᲛᲝᲘᲗᲮᲝᲕᲔ ᲡᲔᲡᲮᲘ
          </Button>
        </div>
      </div>
    </section>;
}
