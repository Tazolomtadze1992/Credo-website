import AppShowcase from '../../components/AppShowcase';
import SiteHeader from '../../components/SiteHeader';
import TransferGlobe from '../../components/TransferGlobe';
import BookingForm from './booking-form';
import ProductsVariants from './products/ProductsVariants';
import RatesVariants from './rates/RatesVariants';
import RcheuliVariants from './rcheuli/RcheuliVariants';
import StepsVariants from './steps/StepsVariants';
import { FACEBOOK_URL, SOURCE_URL, VIDEO_BANKING_URL } from './emigrants-data.mjs';
import styles from './emigrants.module.css';

export const metadata = {
  title: 'ემიგრანტებისთვის · კრედო ბანკი',
  description: 'გახდი კრედო ბანკის მომხმარებელი საქართველოში ჩამოსვლის გარეშე — ვიდეობანკინგით.',
};

function Icon({ kind, size = 24 }) {
  const paths = {
    arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
    external: <path d="M8 16 16 8M9 8h7v7" />,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[kind]}</svg>;
}

export default async function EmigrantsPage({ searchParams }) {
  const query = await searchParams;
  return <div className={styles.root}>
    <a className="skip-link" href="#emigrants-main">მთავარ შინაარსზე გადასვლა</a>
    <SiteHeader />
    <main id="emigrants-main" className={styles.main}>
      <section className={styles.hero} aria-labelledby="emigrants-title">
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>ემიგრანტებისთვის</p>
          <h1 id="emigrants-title">შენი ბანკი საქართველოში — ჩამოსვლის გარეშე</h1>
          <p className={styles.lede}>გახსენი ანგარიში, შეუკვეთე ბარათი, მიიღე გზავნილები და დააგროვე ანაბარზე — საზღვარგარეთიდან, ერთი ვიდეოზარით.</p>
          <div className={styles.heroActions}>
            <a className="action" href="#booking">დაჯავშნე ვიდეოზარი</a>
            <a className={styles.textLink} href={VIDEO_BANKING_URL} target="_blank" rel="noreferrer">ვიდეობანკინგი <Icon kind="external" size={18} /></a>
          </div>
        </div>
        <div className={styles.globeStage}>
          <TransferGlobe />
        </div>
      </section>

      <div className={styles.content}>
        <section className={styles.section} aria-labelledby="remote-heading">
          <div className={styles.sectionHeading}>
            <h2 id="remote-heading">როგორ ხდები მომხმარებელი</h2>
            <p>რეგისტრაცია, იდენტიფიკაცია და მომსახურება — ბანკირთან ვიდეოზარით, სახლიდან გაუსვლელად.</p>
          </div>
          <StepsVariants initial={query?.steps} initialBook={query?.book} />
        </section>

        <section className={styles.section} aria-labelledby="products-heading">
          <div className={styles.sectionHeading}>
            <h2 id="products-heading">პროდუქტები და სერვისები</h2>
          </div>
          <ProductsVariants initial={query?.products} />
        </section>

        <section className={styles.section} id="rates" aria-labelledby="rates-heading">
          <RatesVariants initial={query?.rates} heading={<div className={styles.sectionHeading}>
            <h2 id="rates-heading">ვალუტის კურსები</h2>
            <p>გადაცვალე Mycredo-ში, ფილიალზე უკეთეს კურსად — საზღვარგარეთიდანაც.</p>
          </div>} />
        </section>

        <section className={`${styles.section} ${styles.booking}`} id="booking" aria-labelledby="booking-heading">
          <div className={styles.bookingCopy}>
            <h2 id="booking-heading">დაჯავშნე ვიდეოზარი</h2>
            <p>აირჩიე შენთვის მოსახერხებელი დრო და მიიღე კონსულტაცია საბანკო პროდუქტებზე.</p>
            <p className={styles.bookingNote}>ბანკირი დაგიკავშირდება მითითებულ ნომერზე და გამოგიგზავნის ზარის ბმულს.</p>
          </div>
          <BookingForm />
        </section>

        <AppShowcase id="mycredo" title="მართე ფინანსები Mycredo-თი" className={styles.appBanner} switchable={false} />

        <RcheuliVariants initial={query?.rcheuli} className={styles.rcheuliBlock} />

        <footer className={styles.footer}>
          <a href="/#site-top">კრედო ბანკი</a>
          <span className={styles.footerLinks}>
            <a href={FACEBOOK_URL} target="_blank" rel="noreferrer">ემიგრანტების Facebook გვერდი <span aria-hidden="true">↗</span></a>
            <a href={SOURCE_URL} target="_blank" rel="noreferrer">მიმდინარე გვერდი <span aria-hidden="true">↗</span></a>
          </span>
          <p className={styles.credit}>3D სკანი: „Infinite“ — Lee Perry-Smith (Infinite Realities), <a href="https://creativecommons.org/licenses/by/3.0/" target="_blank" rel="noreferrer">CC BY 3.0</a></p>
        </footer>
      </div>
    </main>
  </div>;
}
