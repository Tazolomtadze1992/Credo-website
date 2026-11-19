import { CARPET } from '../ExpMark';
import { FACEBOOK_URL, HOURS, PHONE, WHATSAPP_URL, centers } from '../expats-data.mjs';
import x from '../sections/sections.module.css';
import { external } from './shared';

const Out = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M8 16 16 8M9 8h7v7" /></svg>;

/* F — the band the page had before, kept for comparison. */
export default function Band() {
  return <div className={x.centersBand} style={{ '--carpet': `url(${CARPET})` }}>
    <div className={x.centersCopy}>
      <h2 id="centers-heading">Expat Service Centers</h2>
      <p>{HOURS}</p>
      <div className={x.centersLinks}>
        <a href={`tel:${PHONE.replace(/\s/g, '')}`}>{PHONE}</a>
        <a href={WHATSAPP_URL} {...external}>WhatsApp <Out /></a>
        <a href={FACEBOOK_URL} {...external}>Credo Bank for Expats on Facebook <Out /></a>
      </div>
    </div>
    <ul className={x.centers}>
      {centers.map(cn => <li key={cn.address}><b>{cn.city}</b><span>{cn.address}</span></li>)}
    </ul>
  </div>;
}
