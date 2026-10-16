export default function SavingsPhotoGoal() {
  return <div className="savings-goal-v2" role="img" aria-label="იტალიაში მოგზაურობის მიზანი: დაგროვილია 7,500 ლარი 10,000 ლარიდან. თანხის დამატების ანიმაცია აჩვენებს კიდევ 500 ლარის დაგროვებას. საილუსტრაციო მაგალითი.">
    <div className="savings-v2-panel" aria-hidden="true">
      <div className="savings-v2-photo">
        <img src="/assets/savings/positano-kevin-mcmahon.webp" alt="" width="1440" height="960" loading="lazy" decoding="async" />
        <div className="savings-v2-toast">
          <span className="savings-v2-toast-label">თანხა დაემატა</span>
          <span className="savings-v2-toast-value">+₾500</span>
        </div>
      </div>
      <div className="savings-v2-body">
        <p className="savings-v2-name">იტალიაში მოგზაურობა</p>
        <div className="savings-v2-balance-heading">
          <span>დაგროვილია</span>
          <span className="savings-v2-percent"><span className="savings-v2-percent-rest">75%</span><span className="savings-v2-percent-added">80%</span></span>
        </div>
        <div className="savings-v2-amount">
          <span className="savings-v2-currency">₾</span>
          <span className="savings-v2-digit"><span className="savings-v2-reel"><span>7</span><span>8</span></span></span>
          <span>,</span>
          <span className="savings-v2-digit"><span className="savings-v2-reel"><span>5</span><span>0</span></span></span>
          <span>00</span>
        </div>
        <div className="savings-v2-track"><div className="savings-v2-fill" /></div>
        <div className="savings-v2-target"><span>მიზანი</span><strong>₾10,000</strong></div>
      </div>
    </div>
  </div>;
}
