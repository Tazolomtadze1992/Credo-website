import Image from "next/image";
import Button from "../Button/Button";
import styles from "./Emigrants.module.css";
const IMG = "/design-two/images/emigrants";
const HERO_FEATURES = ["გააქტიურო და მიიღო ფულადი", "განახორციელო ადგილობრივი და საერთაშორისო", "გაანაღდო საკუთარ სახელზე გაგზავნილი თანხა პირად ანგარიშზე"];
const OFFERS = [{
  title: "ანაბარზე შეთავაზება ემიგრანტებისთვის",
  text: "განათავსე თანხა კრედო ბანკის ანგარიშზე, გახსენი მინ. 3 000 ლარის ანაბარი და მიიღე სტანდარტულზე მაღალი სარგებელი.",
  image: `${IMG}/offer-deposit.png`
}, {
  title: "იპოთეკური სესხი ემიგრანტებისთვის",
  text: "თუ ემიგრაციაში ყოფნისას ხშირად ფიქრობ საქართველოში ბინის შეძენაზე, ახლა საუკეთესო დროა ამისთვის.",
  image: `${IMG}/offer-mortgage.png`
}, {
  title: "შეთავაზება ემიგრანტებისთვის",
  text: "ადრე მიღებული ფინანსური გადაწყვეტილებები ხელს გიშლის ახალი ნაბიჯის გადადგმაში?",
  image: `${IMG}/offer-other.png`
}];
const product = (title, text, image, href = "#") => ({
  title,
  text,
  image: `${IMG}/${image}.png`,
  href
});
const PRODUCTS = [product("Keepz-ის QR ტერმინალი", "მიიღე შენზე მორგებული პირობებით საჭირო თანხა", "product-keepz"), product("სესხები", "ისარგებლე მაღალი კლასის სერვისებითა და ინდივიდუალური საკრედიტო ლიმიტებით", "product-loans", "/loans"), product("ბარათები", "გახსენი მაღალსარგებლიანი ანაბარი და დააგროვე უსაფრთხოდ", "product-cards"), product("ანაბრები", "მიიღე შენზე მორგებული პირობებით საჭირო თანხა", "product-deposits"), product("გზავნილები", "ისარგებლე მაღალი კლასის სერვისებითა და ინდივიდუალური საკრედიტო ლიმიტებით", "product-remittances"), product("სერვისები", "გახსენი მაღალსარგებლიანი ანაბარი და დააგროვე უსაფრთხოდ", "product-services"), product("ბინოთეკა", "მიიღე შენზე მორგებული პირობებით საჭირო თანხა", "product-binoteka"), product("გადარიცხვები", "ისარგებლე მაღალი კლასის სერვისებითა და ინდივიდუალური საკრედიტო ლიმიტებით", "product-transfers")];
export function EmigrantsHero() {
  return <section className={styles.heroWrap} aria-labelledby="emigrants-title">
      <div className={styles.hero}>
        <img className={styles.heroLetters} src={`${IMG}/hero-letters.svg`} alt="" />
        <div className={styles.heroFade} />
        <div className={styles.heroRow}>
          <div className={styles.heroContent}>
            <h1 id="emigrants-title" className={styles.heroTitle}>
              კრედო ემიგრანტებისთვის
            </h1>
            <p className={styles.heroLead}>
              ისარგებლე შენს საჭიროებებზე მორგებული საბანკო მომსახურებით უმარტივესად გახდი კრედო ბანკის მომხმარებელი დისტანციურად ვიდეობანკინგის საშუალებით.
            </p>
            <ul className={styles.heroFeatures}>
              {HERO_FEATURES.map(feature => <li key={feature}>
                  <img src="/design-two/icons/check.svg" width={20} height={20} alt="" />
                  {feature}
                </li>)}
              <li>
                <img src="/design-two/icons/check.svg" width={20} height={20} alt="" />
                <span>
                  გახსნა მაღალსარგებლიანი <strong>ანაბარი</strong> - დააგროვო თანხა საიმედოდ
                </span>
              </li>
            </ul>
            <Button href="#" size="medium">
              ᲕᲘᲓᲔᲝᲑᲐᲜᲙᲘᲜᲒᲘ
            </Button>
          </div>
          <div className={styles.heroMedia}>
            <Image src={`${IMG}/hero.png`} alt="" fill sizes="430px" className={styles.cover} priority />
          </div>
        </div>
      </div>
    </section>;
}
function MoreLink({
  href,
  label
}) {
  return <a className={styles.more} href={href}>
      {label}
      <img src="/design-two/icons/arrow-right-primary.svg" width={20} height={20} alt="" />
    </a>;
}
export function SegmentOffers({
  offers
}) {
  return <section className={styles.offers} aria-labelledby="emigrant-offers-title">
      <div className={styles.offersHead}>
        <h2 id="emigrant-offers-title" className={styles.sectionTitle}>
          შეთავაზებები
        </h2>
        <a className={`${styles.more} ${styles.moreNegative}`} href="#">
          სრულად
          <img src="/design-two/icons/arrow-right-negative.svg" width={20} height={20} alt="" />
        </a>
      </div>
      <div className={styles.offersBody}>
        <div className={styles.offersRow}>
          {offers.map(offer => <article key={offer.title} className={styles.offerCard}>
              <div className={styles.offerMedia}>
                <Image src={offer.image} alt="" fill sizes="(max-width: 768px) 100vw, 387px" className={styles.cover} />
              </div>
              <div className={styles.offerBody}>
                <div className={styles.copy}>
                  <h3 className={styles.cardTitle}>{offer.title}</h3>
                  <p className={styles.cardText}>{offer.text}</p>
                </div>
                <MoreLink href="#" label="სრულად" />
              </div>
            </article>)}
        </div>
        <Button href="#" size="medium">
          ᲧᲕᲔᲚᲐ ᲨᲔᲗᲐᲕᲐᲖᲔᲑᲐ
        </Button>
      </div>
    </section>;
}
export function SegmentProducts({
  title,
  products,
  id,
  decoration,
  cardClassName = ""
}) {
  return <section id={id} className={styles.products} aria-labelledby="segment-products-title">
      {decoration}
      <h2 id="segment-products-title" className={`${styles.sectionTitle} ${styles.productsTitle}`}>
        {title}
      </h2>
      <div className={styles.productsGrid}>
        {products.map(item => <article key={item.title} className={`${styles.productCard} ${cardClassName}`}>
            <div className={styles.copy}>
              <h3 className={styles.cardTitle}>{item.title}</h3>
              <p className={`${styles.cardText} ${styles.productText}`}>{item.text}</p>
            </div>
            <MoreLink href={item.href} label="გაიგე მეტი" />
            <div className={styles.productMedia}>
              <Image src={item.image} alt="" fill sizes="(max-width: 768px) 100vw, 355px" className={styles.cover} />
            </div>
          </article>)}
      </div>
    </section>;
}
export function EmigrantOffers() {
  return <SegmentOffers offers={OFFERS} />;
}
export function EmigrantProducts() {
  return <SegmentProducts title="პროდუქტები ემიგრანტებისთვის" products={PRODUCTS} decoration={<div className={styles.productsLetters} aria-hidden="true">
          <img src={`${IMG}/products-letters.svg`} alt="" />
        </div>} />;
}
