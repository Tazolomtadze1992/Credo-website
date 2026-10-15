import { useId } from 'react';

function TravelIllustration() {
  const id = useId().replaceAll(':', '');
  return <svg className="savings-travel" viewBox="0 0 200 200" fill="none" aria-hidden="true">
    <defs>
      <linearGradient id={`${id}-case`} x1="66" y1="63" x2="135" y2="163" gradientUnits="userSpaceOnUse">
        <stop stopColor="#3894B7" /><stop offset="1" stopColor="#155575" />
      </linearGradient>
      <linearGradient id={`${id}-side`} x1="123" y1="73" x2="148" y2="145" gradientUnits="userSpaceOnUse">
        <stop stopColor="#206985" /><stop offset="1" stopColor="#10435F" />
      </linearGradient>
      <linearGradient id={`${id}-ticket`} x1="127" y1="54" x2="157" y2="114" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FFFDF7" /><stop offset="1" stopColor="#F8EADC" />
      </linearGradient>
      <linearGradient id={`${id}-tag`} x1="109" y1="82" x2="130" y2="114" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FF9F86" /><stop offset="1" stopColor="#F77760" />
      </linearGradient>
    </defs>
    <ellipse cx="103" cy="162" rx="48" ry="5" fill="#153E50" opacity=".07" />
    <g className="savings-ticket">
      <g transform="rotate(17 142 86)">
        <rect x="120" y="49" width="43" height="73" rx="5" fill="#183F54" opacity=".06" transform="translate(1 2)" />
        <rect x="120" y="49" width="43" height="73" rx="5" fill={`url(#${id}-ticket)`} stroke="#000" strokeOpacity=".05" />
        <path d="M120 96H163" stroke="#C6BFB7" strokeDasharray="2 3" />
        <path d="M140 58L143 68L152 73V76L143 73V80L146 83V85L141 83L136 85V83L139 80V73L130 76V73L139 68V58H140Z" fill="#36768D" />
        <path d="M129 89H145" stroke="#36768D" strokeOpacity=".3" strokeWidth="2" strokeLinecap="round" />
        <path d="M128 103V113M131 103V113M135 103V113M137 103V113M141 103V113M144 103V113M148 103V113M152 103V113M155 103V113" stroke="#527381" strokeWidth="1.3" />
      </g>
    </g>
    <path d="M85 68V53C85 49 88 46 92 46H104C108 46 111 49 111 53V68" stroke="#254A5B" strokeWidth="5" />
    <path d="M88 54H108" stroke="#C5D5DA" strokeWidth="2" />
    <rect x="70" y="148" width="9" height="15" rx="4.5" fill="#284553" />
    <rect x="120" y="147" width="9" height="15" rx="4.5" fill="#284553" />
    <rect x="76" y="66" width="62" height="88" rx="13" fill={`url(#${id}-side)`} />
    <rect x="61" y="66" width="67" height="88" rx="13" fill={`url(#${id}-case)`} />
    <rect x="61.5" y="66.5" width="66" height="87" rx="12.5" stroke="#FFF" strokeOpacity=".2" />
    <path d="M78 81V138M94 81V138M110 81V138" stroke="#104764" strokeOpacity=".3" strokeWidth="4" strokeLinecap="round" />
    <path d="M79 81V138M95 81V138M111 81V138" stroke="#75BCD0" strokeOpacity=".32" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M131 89V108" stroke="#0F3F58" strokeWidth="3" strokeLinecap="round" />
    <path d="M117 69C117 75 115 82 119 88" stroke="#F0C4A1" strokeWidth="2" />
    <g transform="rotate(-12 120 100)">
      <path d="M112 85H125L130 91V110C130 112 128 114 126 114H114C112 114 110 112 110 110V91L112 85Z" fill={`url(#${id}-tag)`} />
      <circle cx="120" cy="90" r="2" fill="#B35042" />
      <path d="M116 101H124M116 105H121" stroke="#FFF2E8" strokeWidth="1.5" strokeLinecap="round" />
    </g>
    <rect x="70" y="142" width="10" height="3" rx="1.5" fill="#9EC5D1" opacity=".6" />
  </svg>;
}

export default function SavingsGoal() {
  return <div className="savings-goal" role="img" aria-label="მოგზაურობის მიზანი: დაგროვილია 7,500 ლარი 10,000 ლარიდან. საილუსტრაციო მაგალითი.">
    <div className="savings-composition" aria-hidden="true">
      <div className="savings-orbit">
        <svg className="savings-ring" viewBox="0 0 240 240" fill="none">
          <circle cx="120" cy="120" r="108" stroke="#FFF" strokeOpacity=".65" strokeWidth="7" />
          <circle className="savings-ring-progress" cx="120" cy="120" r="108" pathLength="100" stroke="#F6806E" strokeWidth="7" strokeLinecap="round" strokeDasharray="100 100" strokeDashoffset="25" transform="rotate(-90 120 120)" />
          <g className="savings-ring-tip"><circle cx="120" cy="12" r="6" fill="#F6806E" /><circle cx="120" cy="12" r="2.5" fill="#FFF7F3" /></g>
        </svg>
        <TravelIllustration />
        <div className="savings-percent"><span className="savings-percent-rest">75%</span><span className="savings-percent-added">80%</span></div>
      </div>
      <div className="savings-copy">
        <p className="savings-name">შენი შემდეგი<br />მოგზაურობა</p>
        <p className="savings-caption">დაგროვილია</p>
        <div className="savings-amount">
          <span className="savings-currency">₾</span>
          <span className="savings-digit-window"><span className="savings-digit-reel"><span>7</span><span>8</span></span></span>
          <span>,</span>
          <span className="savings-digit-window"><span className="savings-digit-reel"><span>5</span><span>0</span></span></span>
          <span>00</span>
        </div>
        <p className="savings-target">მიზანი <span>₾10,000</span></p>
        <div className="savings-deposit">
          <span className="savings-deposit-check"><svg viewBox="0 0 16 16" fill="none"><path d="M4 8L6.7 10.7L12 5.3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
          <span>+₾500</span>
        </div>
      </div>
    </div>
  </div>;
}
