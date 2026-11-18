'use client';

import { useState } from 'react';
import { countries, topics } from './emigrants-data.mjs';
import styles from './emigrants.module.css';

const hours = Array.from({ length: 11 }, (_, i) => `${String(9 + i).padStart(2, '0')}:00`);

// Prototype only: validates in the browser and shows a confirmation; nothing is sent.
export default function BookingForm() {
  const [sent, setSent] = useState(false);
  const [from, setFrom] = useState('10:00');
  const [to, setTo] = useState('13:00');
  const today = new Date().toISOString().slice(0, 10);
  if (sent) return <div className={styles.formCard} role="status">
    <div className={styles.sent}>
      <span className={styles.sentIcon} aria-hidden="true"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 4 4 10-10" /></svg></span>
      <h3>მოთხოვნა მიღებულია</h3>
      <p>ბანკირი დაგიკავშირდება არჩეულ დროს და ვიდეოზარის ბმულს გამოგიგზავნის.</p>
      <button type="button" className={styles.textLink} onClick={() => setSent(false)}>ახალი მოთხოვნა</button>
    </div>
  </div>;
  return <form className={styles.formCard} onSubmit={event => { event.preventDefault(); setSent(true); }}>
    <div className={styles.formGrid}>
      <label className={styles.field}><span>სახელი</span><input name="name" autoComplete="given-name" required /></label>
      <label className={styles.field}><span>გვარი</span><input name="surname" autoComplete="family-name" required /></label>
      <label className={styles.field}><span>ქვეყანა, სადაც ცხოვრობ</span><select name="country" required defaultValue=""><option value="" disabled>აირჩიე ქვეყანა</option>{countries.map(country => <option key={country}>{country}</option>)}</select></label>
      <label className={styles.field}><span>ტელეფონის ნომერი</span><input name="phone" type="tel" autoComplete="tel" inputMode="tel" placeholder="+30 …" required /></label>
      <label className={`${styles.field} ${styles.wide}`}><span>რა საკითხზე გსურს კონსულტაცია?</span><select name="topic" required defaultValue=""><option value="" disabled>აირჩიე საკითხი</option>{topics.map(topic => <option key={topic}>{topic}</option>)}</select></label>
      <label className={styles.field}><span>სასურველი დღე</span><input name="date" type="date" min={today} required suppressHydrationWarning /></label>
      <div className={styles.field}>
        <span id="booking-time">სასურველი დრო (თბილისის დროით)</span>
        <div className={styles.timeRange} role="group" aria-labelledby="booking-time">
          <select aria-label="საათიდან" value={from} onChange={e => { setFrom(e.target.value); if (e.target.value >= to) setTo(hours[Math.min(hours.indexOf(e.target.value) + 1, hours.length - 1)]); }}>{hours.slice(0, -1).map(hour => <option key={hour}>{hour}</option>)}</select>
          <span aria-hidden="true">–</span>
          <select aria-label="საათამდე" value={to} onChange={e => setTo(e.target.value)}>{hours.filter(hour => hour > from).map(hour => <option key={hour}>{hour}</option>)}</select>
        </div>
      </div>
      <label className={`${styles.field} ${styles.wide}`}><span>პირადი ნომერი</span><input name="personalId" inputMode="numeric" pattern="\d{11}" maxLength={11} title="11-ნიშნა პირადი ნომერი" required /></label>
    </div>
    <label className={styles.consent}><input type="checkbox" required /><span>ვადასტურებ, რომ მოწოდებული ინფორმაცია ზუსტია და ვეთანხმები კრედო ბანკის მიერ ჩემი პერსონალური მონაცემების დამუშავებას.</span></label>
    <button type="submit" className={`action ${styles.submit}`}>დაჯავშნე ვიდეოზარი</button>
  </form>;
}
