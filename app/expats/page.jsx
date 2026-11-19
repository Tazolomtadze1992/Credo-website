import SiteHeader from '../../components/SiteHeader';
import { CONDITIONS_URL } from './expats-data.mjs';
import HeroVariants from './hero/HeroVariants';
import CentersVariants from './centers/CentersVariants.jsx';
import OffersVariants from './offers/OffersVariants';
import ProductsVariants from './products/ProductsVariants.jsx';
import Calculators from './sections/Calculators';
import VideoVariants from './video/VideoVariants';
import x from './sections/sections.module.css';

export const metadata = {
  title: 'Banking for expats in Georgia · Credo Bank',
  description: 'Expat Package and Credo Rcheuli at half price, loans and deposits for expats, currency exchange and video banking — in English.',
};

const external = { target: '_blank', rel: 'noreferrer' };
const Out = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M8 16 16 8M9 8h7v7" /></svg>;

export default async function ExpatsPage({ searchParams }) {
  const query = await searchParams;
  return <div className={x.root} lang="en">
    <a className="skip-link" href="#expats-main">Skip to content</a>
    <SiteHeader />
    <main id="expats-main" className={x.main}>
      <HeroVariants initial={query?.hero} />

      <div className={x.content}>
        <section className={x.section} id="offers" aria-labelledby="offers-heading">
          <OffersVariants initial={query?.offers} />
        </section>

        <section className={x.section} id="video-banking" aria-labelledby="video-heading">
          <VideoVariants initial={query?.video} />
        </section>

        <section className={x.section} id="calculators" aria-labelledby="calc-heading">
          <div className={x.heading}>
            <h2 id="calc-heading">Calculate before you decide</h2>
            <p>Monthly loan payments, deposit earnings and today’s exchange rates — with the numbers in plain sight.</p>
          </div>
          <Calculators />
        </section>

        <section className={x.section} id="products" aria-labelledby="products-heading">
          <div className={x.headingRow}>
            <div className={x.heading}>
              <h2 id="products-heading">Everything else you might need</h2>
            </div>
            <a className={x.link} href={CONDITIONS_URL} {...external}>Products & conditions <Out /></a>
          </div>
          <ProductsVariants initial={query?.products} />
        </section>

        <section className={x.section} id="centers" aria-labelledby="centers-heading">
          <CentersVariants initial={query?.centers} />
        </section>

        <footer className={x.footer}>
          <a href="/#site-top">Credo Bank</a>
          <a href="https://credobank.ge/en/expats" {...external}>Current expats page <Out /></a>
        </footer>
      </div>
    </main>
  </div>;
}
