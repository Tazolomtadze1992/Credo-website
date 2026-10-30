import Image from "next/image";
import Button from "../Button/Button";
import styles from "./Rcheuli.module.css";

// CAPS button style is written in Mtavruli (see Button.module.css): Mkhedruli U+10D0–10FA → U+1C90–1CBA
const caps = text => [...text].map(ch => {
  const code = ch.codePointAt(0);
  return code >= 0x10d0 && code <= 0x10fa ? String.fromCodePoint(code + 0x0bc0) : ch;
}).join("");
function More({
  label,
  href = "#",
  tone = "primary"
}) {
  return <a className={`${styles.more} ${tone === "negative" ? styles.moreNegative : ""}`} href={href}>
      {label}
      <img src={tone === "negative" ? "/design-two/icons/arrow-right-negative.svg" : "/design-two/icons/arrow-right-primary.svg"} width={20} height={20} alt="" />
    </a>;
}

/* Hero (1013:2823) */
export function RcheuliHero() {
  return <section className={styles.heroWrap} aria-labelledby="rcheuli-title">
      <div className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 id="rcheuli-title" className={styles.heroTitle}>
            კრედო რჩეული
          </h1>
          <div className={styles.heroText}>
            <p>შეიქმენი მეტი კომფორტი და ფინანსური სტაბილურობა.</p>
            <p>გახდი რჩეული და ისარგებლე პრივილეგირებული სერვისებითა და მომსახურებით.</p>
          </div>
          <Button href="#" variant="primary" size="medium" className={styles.heroCta} aria-label="გახდი რჩეული">
            {caps("გახდი რჩეული")}
          </Button>
        </div>
        <div className={styles.heroMedia}>
          <Image src="/design-two/images/rcheuli/hero.png" alt="რჩეული ლაუნჯი" width={660} height={523} className={styles.heroImage} priority />
        </div>
      </div>
    </section>;
}
const PRODUCTS = [{
  title: "სესხები",
  text: "მიიღე შენზე მორგებული პირობებით საჭირო თანხა",
  image: "/design-two/images/rcheuli/loans.png",
  href: "/loans",
  crop: true
}, {
  title: "ბარათები",
  text: "ისარგებლე მაღალი კლასის სერვისებითა და ინდივიდუალური საკრედიტო ლიმიტებით",
  image: "/design-two/images/rcheuli/cards.png",
  href: "#"
}, {
  title: "ანაბრები",
  text: "გახსენი მაღალსარგებლიანი ანაბარი და დააგროვე უსაფრთხოდ",
  image: "/design-two/images/rcheuli/deposits.png",
  href: "#"
}];

/* რჩეულის საბანკო პროდუქტები (1013:1928) */
export function RcheuliProducts() {
  return <section className={styles.products} aria-labelledby="rcheuli-products-title">
      <h2 id="rcheuli-products-title" className={styles.centerTitle}>
        რჩეულის საბანკო პროდუქტები
      </h2>
      <div className={styles.row}>
        {PRODUCTS.map((p, i) => <article key={p.title} className={styles.productCard}>
            <div className={styles.copy}>
              <h3 className={styles.cardTitle}>{p.title}</h3>
              <p className={`${styles.cardText} ${i === 0 ? styles.cardTextNarrow : ""}`}>{p.text}</p>
            </div>
            <More label="გაიგე მეტი" href={p.href} />
            <div className={styles.media}>
              {/* The loans photo uses Figma's crop (160% wide, shifted 42.87% left) */}
              <Image src={p.image} alt="" fill sizes="356px" className={p.crop ? styles.cropLoans : styles.cover} />
            </div>
          </article>)}
      </div>
    </section>;
}
const OFFERS = [{
  title: "პრემიუმ საბანკო მომსახურება",
  text: "მიიღე აგრო სესხი შენი სასოფლო-სამეურნეო საქმიანობიდან მიღებული შემოსავლის საფუძველზე.",
  image: "/design-two/images/rcheuli/premium-banking.png"
}, {
  title: "იმგაზვრე უსაფრთხოდ და დაზოგე საწვავის ხარჯი",
  text: "ბიზნეს სესხი 150 000 ლარამდე - მიიღე სწრაფი დაფინანსება და აქციე შენი იდეები წარმატებულ რეალობად!",
  image: "/design-two/images/rcheuli/safe-driving.png"
}, {
  title: "სპეციალური შეთავზება, მოგზაურებისთვის",
  text: "განავითარე ტურისტული საქმიანობა და მიიღე მეტი შემოსავალი",
  image: "/design-two/images/loans/tourism-loan.png"
}];

/* შეთავაზებები (1013:3047) */
export function Offers() {
  return <section className={styles.offers} aria-labelledby="offers-title">
      <div className={styles.offersHead}>
        <h2 id="offers-title" className={styles.sectionTitle}>
          შეთავაზებები
        </h2>
        <More label="სრულად" tone="negative" />
      </div>
      <div className={styles.row}>
        {OFFERS.map(o => <article key={o.title} className={styles.offerCard}>
            <div className={styles.offerMedia}>
              <Image src={o.image} alt="" fill sizes="387px" className={styles.cover} />
            </div>
            <div className={styles.offerBody}>
              <div className={styles.copy}>
                <h3 className={styles.cardTitle}>{o.title}</h3>
                <p className={styles.cardText}>{o.text}</p>
              </div>
              <More label="სრულად" />
            </div>
          </article>)}
      </div>
      <Button href="#" variant="primary" size="medium" aria-label="ყველა შეთავაზება">
        {caps("ყველა შეთავაზება")}
      </Button>
    </section>;
}
