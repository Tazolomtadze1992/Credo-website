import Image from "next/image";
import Button from "../Button/Button";
import { SegmentOffers, SegmentProducts } from "../Emigrants/Emigrants";
import segment from "../Emigrants/Emigrants.module.css";
import styles from "./Expats.module.css";
const IMG = "/design-two/images/expats";
const OFFERS = [{
  title: "სპეციალური შეთავაზება ექსპატებისთვის",
  text: "5 წელია, რაც საქართველოში თქვენს გვერდით ვართ. კრედო ბანკი ექსპატ მომხმარებლებს განსაკუთრებულ შეთავაზებებს სთავაზობს.",
  image: `${IMG}/offer-anniversary.png`
}, {
  title: "ავტო სესხი E-Motions-ში მანქანის შესაძენად!",
  text: "სპეციალური შეთავაზება როგორც ტაქსის მძღოლებისთვის, ასევე პირადი გამოყენებისათვის!",
  image: `${IMG}/offer-auto.png`
}, {
  title: "ვიდეობანკი უცხო ქვეყნის მოქალაქეებისთვის",
  text: "დაიწყე საერთაშორისო საბანკო მომსახურებით სარგებლობა კრედო ბანკში - მსოფლიოს ნებისმიერი წერტილიდან.",
  image: `${IMG}/offer-videobank.png`
}];
const AMOUNT_TEXT = "მიიღე შენზე მორგებული პირობებით საჭირო თანხა";
const LIMITS_TEXT = "ისარგებლე მაღალი კლასის სერვისებითა და ინდივიდუალური საკრედიტო ლიმიტებით";
const DEPOSIT_TEXT = "გახსენი მაღალსარგებლიანი ანაბარი და დააგროვე უსაფრთხოდ";
const product = (title, text, image, href = "#") => ({
  title,
  text,
  image: `${IMG}/${image}.png`,
  href
});
const PRODUCTS = [product("ბინოთეკა", AMOUNT_TEXT, "product-binoteka"), product("სესხები", LIMITS_TEXT, "product-loans", "/loans"), product("ბარათები", DEPOSIT_TEXT, "product-cards"), product("ანაბრები", AMOUNT_TEXT, "product-deposits"), product("დაზღვევები", LIMITS_TEXT, "product-insurance"), product("გზავნილები", DEPOSIT_TEXT, "product-remittances"), product("სერვისები", AMOUNT_TEXT, "product-services"), product("და-ყა-ვი", LIMITS_TEXT, "product-dakavi"), product("გადარიცხვები", LIMITS_TEXT, "product-transfers")];

/* Twelve frames in Figma; the first orange one is its own (near-identical) export */
const ORNAMENTS = Array.from({
  length: 12
}, (_, index) => {
  const blue = index % 2 === 0;
  return {
    blue,
    src: `${IMG}/${blue ? "ornament-blue" : index === 1 ? "ornament-orange-1" : "ornament-orange"}.svg`
  };
});
/* credo-transfer-logo: two arrows around a carpet pattern; each Figma size has its own export */
function TransferLogo({
  assets,
  className
}) {
  return <div className={`${styles.logo} ${className}`} aria-hidden="true">
      <img className={styles.logoLeft} src={`${IMG}/${assets}-left.svg`} alt="" />
      <img className={styles.logoRight} src={`${IMG}/${assets}-right.svg`} alt="" />
      <div className={styles.logoPattern} style={{
      maskImage: `url("${IMG}/${assets}-mask.svg")`
    }}>
        <img src={`${IMG}/${assets}-pattern.svg`} alt="" />
      </div>
    </div>;
}
export function ExpatsHero() {
  return <section className={segment.heroWrap} aria-labelledby="expats-title">
      <div className={`${segment.hero} ${styles.hero}`}>
        <div className={styles.ornaments} aria-hidden="true">
          <div className={styles.ornamentsTrack}>
            {ORNAMENTS.map((ornament, index) => <div key={index} className={styles.ornament}>
                <img className={ornament.blue ? styles.ornamentBlue : styles.ornamentOrange} src={ornament.src} alt="" />
              </div>)}
          </div>
        </div>
        <div className={segment.heroRow}>
          <div className={segment.heroContent}>
            <h1 id="expats-title" className={segment.heroTitle}>
              კრედო ექსპატებისთვის
            </h1>
            <p className={segment.heroLead}>
              კრედო ბანკმა საქართველოში მცხოვრები უცხო ქვეყნის მოქალაქეებისთვის შექმნა სპეციალური სერვისები და ექსპატ სერვისცენტრები, რაც საშუალებას გაძლევს, ისარგებლო საბანკო პროდუქტებსა და მომსახურებაზე განსაკუთრებული პირობებითა და მაქსიმალური კომფორტით.
            </p>
            <Button href="#expat-products" size="medium">
              ᲞᲠᲝᲓᲣᲥᲢᲔᲑᲘ &amp; ᲡᲔᲠᲕᲘᲡᲔᲑᲘ
              <span className={styles.buttonIcon}>
                <img src="/design-two/icons/arrow-up-right-white.svg" width={11.538} height={11.538} alt="" />
              </span>
            </Button>
          </div>
          <div className={styles.heroMediaWrap}>
            <div className={segment.heroMedia}>
              <Image src={`${IMG}/hero.png`} alt="" fill sizes="430px" className={segment.cover} priority />
            </div>
            <TransferLogo assets="logo-small" className={styles.heroLogo} />
          </div>
        </div>
      </div>
    </section>;
}
export function ExpatProducts() {
  return <SegmentProducts id="expat-products" title="პროდუქტები ექსპატებისთვის" products={PRODUCTS} cardClassName={styles.productCard} decoration={<>
          <TransferLogo assets="logo" className={styles.logoMiddle} />
          <TransferLogo assets="logo-large" className={styles.logoBottom} />
        </>} />;
}
export function ExpatOffers() {
  return <SegmentOffers offers={OFFERS} />;
}
