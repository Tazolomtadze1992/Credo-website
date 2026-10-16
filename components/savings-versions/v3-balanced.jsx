export default function SavingsBalancedGoal() {
  return <div className="savings-goal-v3" role="img" aria-label="იტალიაში მოგზაურობის მიზანი: დაგროვილია 7,500 ლარი 10,000 ლარიდან. თანხის დამატების ანიმაცია აჩვენებს კიდევ 500 ლარის დაგროვებას. საილუსტრაციო მაგალითი.">
    <div className="savings-v3-panel" aria-hidden="true">
      <div className="savings-v3-header">
        <div className="savings-v3-photo">
          <img src="/assets/savings/positano-kevin-mcmahon.webp" alt="" width="1440" height="960" loading="lazy" decoding="async" />
        </div>
        <div className="savings-v3-goal-copy">
          <span className="savings-v3-eyebrow">შენი მიზანი</span>
          <p className="savings-v3-name">იტალიაში მოგზაურობა</p>
        </div>
      </div>
      <div className="savings-v3-body">
        <div className="savings-v3-balance-heading">
          <span>დაგროვილია</span>
          <span className="savings-v3-percent"><span className="savings-v3-percent-rest">75%</span><span className="savings-v3-percent-added">80%</span></span>
        </div>
        <div className="savings-v3-amount">
          <span className="savings-v3-currency">₾</span>
          <span className="savings-v3-digit"><span className="savings-v3-reel"><span>7</span><span>8</span></span></span>
          <span>,</span>
          <span className="savings-v3-digit"><span className="savings-v3-reel"><span>5</span><span>0</span></span></span>
          <span>00</span>
        </div>
        <div className="savings-v3-track"><div className="savings-v3-fill" /></div>
        <div className="savings-v3-target"><span>მიზანი</span><strong>₾10,000</strong></div>
      </div>
      <div className="savings-v3-toast">
        <span className="savings-v3-toast-label">თანხა დაემატა</span>
        <span className="savings-v3-toast-value">+₾500</span>
      </div>
    </div>
  </div>;
}
