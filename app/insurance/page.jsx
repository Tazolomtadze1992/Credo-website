import SiteHeader from '../../components/SiteHeader';
import styles from './insurance.module.css';

export const metadata = {
  title: 'დაზღვევა · კრედო ბანკი',
  description: 'ჯანმრთელობის, ავტომობილის, ქონებისა და მოსავლის დაზღვევა კრედო ბანკში.',
};

const packages = [
  { id: 'health', title: 'ჯანმრთელობის დაზღვევა', description: 'ვიტამინი — სამედიცინო მომსახურება კრედო რჩეულისთვის.', image: '/assets/insurance/health.webp', alt: 'მამა და შვილი ერთად თამაშობენ', slug: 'health-insurance-vitamini', badge: 'რჩეულისთვის', icon: 'health' },
  { id: 'benefits', title: 'დაზღვევა და მეტი', description: 'სიცოცხლის დაზღვევა და ფასდაკლებები სამედიცინო სერვისებზე.', image: '/assets/insurance/benefits.webp', alt: 'კრედოს დაზღვევა და მეტი ბარათი', slug: 'benefits-and-more', icon: 'card' },
  { id: 'property', title: 'ქონების დაზღვევა', description: 'დაიცავი შენი სახლი გაუთვალისწინებელი შემთხვევებისგან.', image: '/assets/insurance/house.webp', alt: 'ნათელი თანამედროვე სახლის ექსტერიერი', slug: 'property-insurance', icon: 'home' },
  { id: 'car', title: 'ავტომობილის დაზღვევა', description: 'CASCO — ავტომობილის, მძღოლისა და მგზავრების დაზღვევა.', image: '/assets/auto-loan/silver-crossover.webp', alt: 'ვერცხლისფერი ავტომობილი', slug: 'car-insurance', icon: 'car', contain: true },
  { id: 'crop', title: 'მოსავლის დაზღვევა', description: 'დაიცავი მოსავალი სტიქიური მოვლენებით გამოწვეული ზარალისგან.', image: '/assets/insurance/vineyard.webp', alt: 'მწვანე ვენახის რიგები და გორაკები', slug: 'crop-insurance', icon: 'leaf' },
  { id: 'tpl', title: 'მესამე პირის დაზღვევა', description: 'TPL — პასუხისმგებლობის დაზღვევა გზაზე.', image: '/assets/insurance/tpl.webp', alt: 'ავტომობილის უსაფრთხოების ღვედი', slug: 'car-insurance-tpl', icon: 'shield' },
];

function Shield({ rim = false }) {
  // Reference motion: 800ms ease fades, 300ms between planes; an 80px
  // radial light follows each outline continuously over eight seconds.
  const shape = 'M151 8Q175 1 199 8L330 44Q349 49 349 68V333Q349 347 337 355L187 444Q175 452 163 444L13 355Q1 347 1 333V68Q1 49 20 44Z';
  const layers = [{ x: 0, y: 0, scale: 1 }, { x: 33, y: 43, scale: .81 }, { x: 66, y: 86, scale: .62 }];
  return <svg className={`${styles.shield} ${rim ? styles.rim : ''}`} viewBox="0 0 350 452" fill="none" aria-hidden="true">
    {!rim && <defs>
      <linearGradient id="insurance-glass" x1="0" y1="220" x2="350" y2="220" gradientUnits="userSpaceOnUse"><stop stopColor="#fff" stopOpacity=".55" /><stop offset=".47" stopColor="#e4edf1" stopOpacity=".045" /><stop offset="1" stopColor="#7796a5" stopOpacity=".09" /></linearGradient>
      <linearGradient id="insurance-glass-edge" x1="0" y1="30" x2="350" y2="420" gradientUnits="userSpaceOnUse"><stop stopColor="#426d80" stopOpacity=".09" /><stop offset=".46" stopColor="#fff" stopOpacity=".85" /><stop offset="1" stopColor="#658391" stopOpacity=".17" /></linearGradient>
    </defs>}
    {rim && <defs>
      <radialGradient id="insurance-edge-light"><stop stopColor="#25566c" stopOpacity=".35" /><stop offset=".35" stopColor="#25566c" stopOpacity=".12" /><stop offset="1" stopColor="#25566c" stopOpacity="0" /></radialGradient>
      {layers.map((layer, index) => <mask id={`insurance-outline-${index}`} key={index} maskUnits="userSpaceOnUse" x="0" y="0" width="350" height="452"><path d={shape} transform={`translate(${layer.x} ${layer.y}) scale(${layer.scale})`} fill="none" stroke="white" strokeWidth={.75 / layer.scale} /></mask>)}
    </defs>}
    {layers.map((layer, index) => <g key={index} className={styles.shieldPlane} style={{ animationDelay: `${index * .3}s` }}>
      <g transform={`translate(${layer.x} ${layer.y}) scale(${layer.scale})`}>
        <path d={shape} fill={rim ? 'none' : 'url(#insurance-glass)'} stroke={rim ? '#fff' : 'url(#insurance-glass-edge)'} strokeWidth={rim ? .55 : 1} opacity={rim ? .72 : 1} />
        {!rim && <path d="M175 6V449" stroke="#fff" strokeOpacity=".21" strokeWidth=".8" />}
      </g>
      {rim && <g mask={`url(#insurance-outline-${index})`}>
        <rect width="350" height="452" fill="#25566c" fillOpacity=".04" />
        <g className={styles.edgeLight} transform={`translate(${layer.x} ${layer.y}) scale(${layer.scale})`}><circle r={80 / layer.scale} fill="url(#insurance-edge-light)"><animateMotion dur="8s" path={shape} repeatCount="indefinite" /></circle></g>
      </g>}
    </g>)}
  </svg>;
}

function HeadingCopy({ blurred = false }) {
  const Tag = blurred ? 'div' : 'h1';
  return <div className={`${styles.copy} ${blurred ? styles.copyBlur : styles.copySharp}`} aria-hidden={blurred || undefined}>
    <Tag className={styles.headline} id={blurred ? undefined : 'insurance-title'}><span className={styles.headingWord}>{'დაზღვევა'.toUpperCase()}</span></Tag>
  </div>;
}

function PackageIcon({ kind }) {
  const paths = {
    health: <><path d="M20 10c0 4-8 9-8 9s-8-5-8-9a4.5 4.5 0 0 1 8-3 4.5 4.5 0 0 1 8 3Z" /><path d="M8 12h3l1-3 2 6 1-3h2" /></>,
    card: <><rect x="3" y="5" width="18" height="14" rx="3" /><path d="M3 10h18M7 15h4" /></>,
    home: <><path d="m3 11 9-8 9 8M5 10v11h14V10M9 21v-8h6v8" /></>,
    car: <><path d="m5 8 2-4h10l2 4M4 8h16v9H4zM6 17v3m12-3v3M7 12h2m6 0h2" /></>,
    leaf: <><path d="M19 4C8 3 3 8 5 14s13 7 14-10Z" /><path d="M4 21c1-6 5-10 11-13" /></>,
    shield: <><path d="m12 3 8 3v6c0 4-8 9-8 9s-8-5-8-9V6l8-3Z" /><path d="m8 12 3 3 5-6" /></>,
  };
  return <svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[kind]}</svg>;
}

export default function InsurancePage() {
  return <div className={styles.root}>
    <a className="skip-link" href="#insurance-packages">პაკეტებზე გადასვლა</a>
    <SiteHeader />
    <main className={styles.main}>
      <section className={styles.hero} aria-labelledby="insurance-title">
        <div className={styles.stage}>
          <div className={styles.halo} aria-hidden="true" />
          <div className={styles.glassLayer}><Shield /></div>
          <HeadingCopy />
          <HeadingCopy blurred />
          <div className={styles.rimLayer}><Shield rim /></div>
          <p className={styles.description}>შენთვის მნიშვნელოვანის დასაცავად.</p>
        </div>
      </section>
      <section className={styles.packages} id="insurance-packages" aria-labelledby="insurance-packages-title">
        <h2 id="insurance-packages-title">{'პაკეტები'.toUpperCase()}</h2>
        <ul className={styles.grid}>
          {packages.map(item => <li key={item.id} id={`insurance-${item.id}`}><a className={styles.card} href={`https://credobank.ge/products/${item.slug}`} target="_blank" rel="noreferrer">
            <div className={`${styles.cover} ${item.contain ? styles.carCover : ''}`}><img className={styles.photo} src={item.image} alt={item.alt} loading="lazy" width="800" height="500" />{item.badge && <span className={styles.badge}>{item.badge}</span>}</div>
            <div className={styles.body}><span className={styles.icon}><PackageIcon kind={item.icon} /></span><h3>{item.title}</h3><p>{item.description}</p></div>
          </a></li>)}
        </ul>
      </section>
      <footer className={styles.footer}><a href="/#site-top">კრედო ბანკი</a><a href="https://credobank.ge/contact" target="_blank" rel="noreferrer">დაგვიკავშირდი</a></footer>
    </main>
  </div>;
}
