import Image from "next/image";
import styles from "./Loans.module.css";
const FEATURED = [{
  title: "ციფრული სესხი",
  description: "მიიღე სესხი ნებისმიერი მიზნობრიობით და აქციე სურვილები რეალობად!",
  image: "/design-two/images/loans/consumer-loan.png",
  href: "/loans/digital-loan"
}, {
  title: "ავტო სესხი",
  description: "შეიძინე ახალი ან მეორადი ავტომობილი კრედო ბანკის ავტო სესხით - მარტივად, შენზე მორგებული პირობებით.",
  image: "/design-two/images/loans/auto-loan.png",
  href: "https://credobank.ge/products/auto-loan"
}];
export default function FeaturedLoans() {
  return <section className={styles.featured} aria-label="სესხები">
      <div className={styles.featuredRow}>
        {FEATURED.map((loan, i) => <article key={loan.title} className={styles.featuredCard}>
            <div className={styles.copy}>
              <h2 className={styles.cardTitle}>{loan.title}</h2>
              {/* The first description is set to 292px in the design */}
              <p className={`${styles.cardText} ${i === 0 ? styles.cardTextNarrow : ""}`}>{loan.description}</p>
            </div>
            <a className={styles.more} href={loan.href} {...loan.href.startsWith("https:") ? {
          target: "_blank",
          rel: "noopener noreferrer"
        } : {}}>
              მოითხოვე
              <img src="/design-two/icons/arrow-right-primary.svg" width={20} height={20} alt="" />
            </a>
            <div className={styles.featuredMedia}>
              <Image src={loan.image} alt="" fill sizes="526px" className={styles.photo} priority />
            </div>
          </article>)}
      </div>
    </section>;
}
