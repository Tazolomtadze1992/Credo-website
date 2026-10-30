import Image from "next/image";
import StoreButtons from "../StoreButtons/StoreButtons";
import styles from "./MobileBank.module.css";
const IMG = "/design-two/images/mobile-bank";
const mask = (...urls) => ({
  maskImage: urls.map(u => `url("${IMG}/${u}")`).join(", ")
});
const FEATURES = ["გადარიცხე თანხა სწრაფად და მარტივად", "გადაიხადე კომუნალური და სხვა გადასახადები", "მართე ანგარიშები და ბარათები ერთ სივრცეში"];
export default function MobileBank({
  phoneImage,
  movingLetters = false
}) {
  return <section className={styles.section} aria-labelledby="mobile-bank-title">
      {movingLetters && <div className={styles.letters} aria-hidden="true">
          <div className={styles.lettersTrack}>
            <div className={styles.lettersTile}>
              <img src="/design-two/images/emigrants/alphabet-band.png" alt="" />
            </div>
            <div className={styles.lettersTile}>
              <img src="/design-two/images/emigrants/alphabet-band.png" alt="" />
            </div>
          </div>
        </div>}
      <div className={styles.inner}>
        <div className={styles.content}>
          <div className={styles.copy}>
            <div className={styles.intro}>
              <h2 id="mobile-bank-title" className={styles.title}>
                მართე ფინანსები მარტივად,
                <br />
                პირდაპირ მობაილბანკით
              </h2>
              <p className={styles.lead}>
                ყველა საჭირო საბანკო სერვისი ერთ აპლიკაციაში - ნებისმიერ დროს, ნებისმიერი ადგილიდან.
              </p>
            </div>
            <ul className={styles.features}>
              {FEATURES.map(feature => <li key={feature}>
                  <img src="/design-two/icons/check.svg" width={20} height={20} alt="" />
                  {feature}
                </li>)}
            </ul>
          </div>

          <div className={styles.download}>
            <div className={styles.qr}>
              <img src="/design-two/icons/qr-code.svg" width={85} height={85} alt="QR კოდი აპლიკაციის ჩამოსატვირთად" />
            </div>
            <div className={styles.downloadText}>
              <div className={styles.downloadCopy}>
                <p className={styles.downloadTitle}>დაასკანერე QR</p>
                <p className={styles.downloadSub}>აპლიკაცია ხელმისაწვდომია</p>
              </div>
              <StoreButtons />
            </div>
          </div>
        </div>

        {phoneImage ? <div className={styles.phoneImage}>
            <Image src={phoneImage} alt="" fill sizes="490px" className={styles.cover} />
          </div> : (/* Two iPhone mockups: layers, masks and offsets as in Figma (frame 869:994) */
      <div className={styles.phones} aria-hidden="true">
            <div className={`${styles.layer} ${styles.p1Fix}`} style={mask("phone1-mask.svg")}>
              <img src={`${IMG}/phone1-fix.svg`} alt="" />
            </div>
            <div className={`${styles.layer} ${styles.p1Color}`} style={mask("phone1-mask.svg")}>
              <img className={styles.cover} src={`${IMG}/phone1-color.png`} alt="" />
            </div>
            <div className={`${styles.layer} ${styles.p1Screen}`} style={mask("phone1-mask.svg", "phone1-screen-mask.png")}>
              <img src={`${IMG}/phone1-screen.png`} alt="" />
            </div>
            <div className={`${styles.layer} ${styles.p1Frame}`} style={mask("phone1-mask.svg")}>
              <img className={styles.cover} src={`${IMG}/phone1-frame.png`} alt="" />
            </div>

            <div className={`${styles.layer} ${styles.p2Color}`} style={mask("phone2-mask.svg")}>
              <img className={styles.cover} src={`${IMG}/phone2-color.png`} alt="" />
            </div>
            <div className={`${styles.layer} ${styles.p2Screen}`} style={mask("phone2-mask.svg", "phone2-screen-mask.png")}>
              <img src={`${IMG}/phone2-screen.png`} alt="" />
            </div>
            <div className={`${styles.layer} ${styles.p2Frame}`} style={mask("phone2-mask.svg")}>
              <img className={styles.cover} src={`${IMG}/phone2-frame.png`} alt="" />
            </div>
          </div>)}
      </div>
    </section>;
}
