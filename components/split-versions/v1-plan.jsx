// Illustrative eight-payment plan for Credo's და-ყა-ვი product.
// Product reference: https://credobank.ge/products/split
export default function SplitPayment() {
  return <div className="split-payment" role="img" aria-label="და-ყა-ვი: 1,200 ლარის შენაძენი, რვა გადახდა 150 ლარით. საილუსტრაციო მაგალითი.">
    <div className="split-payment-stack" aria-hidden="true"><div className="split-plan">
      <div className="split-plan-header">
        <span className="split-plan-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M5 8H19L20 21H4L5 8Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /><path d="M8 9V6A4 4 0 0 1 16 6V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg></span>
        <span className="split-plan-name">გადახდის გეგმა</span>
        <span className="split-plan-term">8 თვე</span>
      </div>
      <div className="split-plan-amount"><span><small>₾</small>150</span><span className="split-plan-period">/ თვეში</span></div>
      <div className="split-plan-schedule">{Array.from({ length: 8 }, (_, i) => <span key={i} className={i === 0 ? 'split-plan-current' : ''} />)}</div>
      <div className="split-plan-footer"><span>₾1,200</span><span>8 გადახდა</span></div>
    </div>
    <div className="split-plan split-upcoming">
      <p className="split-upcoming-caption">მომდევნო გადახდები</p>
      {['1-ლი თვე', 'მე-2 თვე', 'მე-3 თვე'].map((month, i) => <div className="split-upcoming-row" key={month}><span className="split-upcoming-number">{i + 1}</span><span>{month}</span><strong>₾150</strong></div>)}
    </div></div>
  </div>;
}
