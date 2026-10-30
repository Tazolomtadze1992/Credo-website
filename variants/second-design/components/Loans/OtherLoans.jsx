import Image from "next/image";
import styles from "./Loans.module.css";
const OTHER = [{
  title: "აგრო სესხი",
  description: "მიიღე აგრო სესხი შენი სასოფლო-სამეურნეო საქმიანობიდან მიღებული შემოსავლის საფუძველზე.",
  image: "/design-two/images/loans/agro-loan.png",
  href: "https://credobank.ge/products/agro-loan"
}, {
  title: "ბიზნეს სესხი",
  description: "ბიზნეს სესხი 150 000 ლარამდე - მიიღე სწრაფი დაფინანსება და აქციე შენი იდეები წარმატებულ რეალობად!",
  image: "/design-two/images/loans/business-loan.png",
  href: "https://credobank.ge/products/business-loan"
}, {
  title: "ტურისტული სესხი",
  description: "განავითარე ტურისტული საქმიანობა და მიიღე მეტი შემოსავალი",
  image: "/design-two/images/loans/tourism-loan.png",
  href: "#"
}];
export default function OtherLoans() {
  return <section className={styles.other} aria-labelledby="other-loans-title">
      <div className={styles.otherHead}>
        <h2 id="other-loans-title" className={styles.sectionTitle}>
          სხვა სესხები
        </h2>
        <a className={`${styles.more} ${styles.moreNegative}`} href="https://credobank.ge/products" target="_blank" rel="noopener noreferrer">
          სრულად
          <img src="/design-two/icons/arrow-right-negative.svg" width={20} height={20} alt="" />
        </a>
      </div>
      <div className={styles.otherRow}>
        {OTHER.map(loan => <article key={loan.title} className={styles.otherCard}>
            <div className={styles.otherMedia}>
              <Image src={loan.image} alt="" fill sizes="387px" className={styles.photoCover} />
            </div>
            <div className={styles.otherBody}>
              <div className={styles.copy}>
                <h3 className={styles.cardTitle}>{loan.title}</h3>
                <p className={styles.cardText}>{loan.description}</p>
              </div>
              <a className={styles.more} href={loan.href} {...loan.href.startsWith("https:") ? {
            target: "_blank",
            rel: "noopener noreferrer"
          } : {}}>
                სრულად
                <img src="/design-two/icons/arrow-right-primary.svg" width={20} height={20} alt="" />
              </a>
            </div>
          </article>)}
      </div>
    </section>;
}
