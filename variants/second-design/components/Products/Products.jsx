import DayaviParticleLogo from "./DayaviParticleLogo";
import TransferGlobe from "./TransferGlobe";
import HoverMotionCard from "./HoverMotionCard";
import styles from "./Products.module.css";
function MoreLink({
  tone,
  href = "#",
  className
}) {
  return <a href={href} className={`${styles.more} ${styles[tone]} ${className ?? ""}`}>
      სრულად
      <img src={`/design-two/icons/arrow-right-${tone}.svg`} width={20} height={20} alt="" />
    </a>;
}
function BankCard({
  variant
}) {
  return <div className={`${styles.bankCardSlot} ${styles[`bankCardSlot_${variant}`]}`}>
      <div className={`${styles.bankCard} ${styles[`bankCard_${variant}`]}`} data-motion={variant === "left" ? "swayLeft" : "swayRight"}>
        <img className={styles.bankCardLogo} src="/design-two/icons/card-logo.svg" width={48} height={7} alt="" />
        {variant === "left" ? <img className={styles.bankCardMark} src="/design-two/icons/card-chip-mark.svg" width={18} height={11} alt="" /> : <span className={styles.visa}>
            <img src="/design-two/icons/visa.svg" width={28} height={9} alt="VISA" />
          </span>}
      </div>
    </div>;
}
export default function Products() {
  return <section className={styles.section} id="products" aria-labelledby="products-title">
      <h2 id="products-title" className={styles.heading}>
        მომხმარებლები ირჩევენ
      </h2>

      <div className={styles.mosaic}>
        <div className={styles.row}>
          {/* Consumer loan */}
          <HoverMotionCard className={`${styles.card} ${styles.loan}`}>
            <div className={styles.loanContent}>
              <div className={styles.loanTitleWrap}>
                <h3 className={styles.title}>
                  სესხი ციფრულად 70,000
                  <br />
                  ლარამდე ნებისმიერი
                  <br />
                  შემოსავლით
                </h3>
              </div>
              <MoreLink tone="primary" href="/loans/digital-loan" />
              <dl className={styles.limits} data-motion="wobble">
                <div className={styles.limitsRow}>
                  <dt>ლიმიტი</dt>
                  <dd>მიიღე 70,000 ლარამდე</dd>
                </div>
                <div className={styles.limitsDivider} />
                <div className={styles.limitsRow}>
                  <dt>ვადა</dt>
                  <dd>მაქს 48 თვით</dd>
                </div>
              </dl>
            </div>
            <div className={styles.photos} aria-hidden="true">
              <div className={`${styles.photoSlot} ${styles.photoSlotFirst}`}>
                <div className={styles.photo} data-motion="swayLeft">
                  <img src="/design-two/images/products/loan-building.png" alt="" />
                </div>
              </div>
              <div className={`${styles.photoSlot} ${styles.photoSlotSecond}`}>
                <div className={styles.photo} data-motion="swayLeft">
                  <img src="/design-two/images/products/loan-tractor.png" alt="" />
                </div>
              </div>
            </div>
          </HoverMotionCard>

          {/* Installments: particle logo from Credo-web-variants */}
          <article className={`${styles.card} ${styles.dayavi} product-split figma-dayavi-card`}>
            <h3 className={`${styles.title} ${styles.dayaviTitle}`}>
              და-ყა-ვი შენს ტემპში
              <br />
              10 თვემდე 0%
            </h3>
            <MoreLink tone="informative" />
            <DayaviParticleLogo />
          </article>
        </div>

        <div className={styles.row}>
          {/* Savings */}
          <HoverMotionCard className={`${styles.card} ${styles.savings}`}>
            <h3 className={styles.title}>ანაბარი შენი მიზნებისთვის</h3>
            <MoreLink tone="notice" />
            <ul className={styles.categories} aria-label="ანაბრის მიზნები" data-motion="bounce">
              <li>
                <img src="/design-two/icons/plane-outline.svg" width={24} height={24} alt="" />
                მოგზაურობისთვის
              </li>
              <li>
                <img src="/design-two/icons/buying.svg" width={24} height={24} alt="" />
                შოპინგისთვის
              </li>
            </ul>
          </HoverMotionCard>

          {/* Debit cards */}
          <HoverMotionCard className={`${styles.card} ${styles.cards}`}>
            <div className={styles.cardArt} aria-hidden="true">
              <div className={styles.cardArtInner}>
                <BankCard variant="left" />
                <BankCard variant="right" />
              </div>
            </div>
            <h3 className={`${styles.title} ${styles.cardsTitle}`}>
              ბარათები ყოველდღიური
              <br />
              ფინანსებისთვის
            </h3>
            <MoreLink tone="positive" />
          </HoverMotionCard>

          {/* Money transfers: globe from Credo-web-variants */}
          <article className={`${styles.card} ${styles.transfer} product-transfer figma-transfer-card`}>
            <h3 className={`${styles.title} ${styles.transferText} figma-transfer-text`}>
              ფულადი გზავნილები საზღვრების გარეშე
            </h3>
            <MoreLink tone="secondary" className={`${styles.transferText} figma-transfer-text`} />
            <div className="figma-transfer-art">
              <TransferGlobe />
            </div>
          </article>
        </div>
      </div>
    </section>;
}
