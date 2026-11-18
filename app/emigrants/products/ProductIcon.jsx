/* Line icons for the product list. Each is split into named parts so CSS can
   move one piece on hover (products.module.css → "icon motion"). */
const PARTS = {
  remittance: [['arrow', <path d="M4 12h12M12 8l4 4-4 4" />], ['bar', <path d="M20 5v14" />]],
  transfer: [['top', <path d="M4 8h14l-3-3" />], ['bottom', <path d="M20 16H6l3 3" />]],
  deposit: [['roof', <path d="M3 10l9-6 9 6" />], ['base', <path d="M5 10h14v9H5z" />], ['slot', <path d="M9 14h6" />]],
  card: [['body', <rect x="3" y="5" width="18" height="14" rx="3" />], ['stripe', <path d="M3 10h18" />], ['digits', <path d="M7 15h4" pathLength="1" />]],
  home: [['roof', <path d="m3 11 9-8 9 8" />], ['walls', <path d="M5 10v11h14V10" />], ['door', <path d="M10 21v-6h4v6" />]],
  loan: [['ring', <circle cx="12" cy="12" r="8" />], ['coin', <path d="M14.5 9.5c-.5-1-1.5-1.5-2.5-1.5-1.5 0-2.5.8-2.5 2s1 1.6 2.5 2 2.5.8 2.5 2-1 2-2.5 2c-1 0-2-.5-2.5-1.5M12 6.5V8m0 8v1.5" />]],
  qr: [['a', <path d="M4 4h6v6H4z" />], ['b', <path d="M14 4h6v6h-6z" />], ['c', <path d="M4 14h6v6H4z" />], ['d', <path d="M14 14h2v2h-2z" />], ['e', <path d="M18 18h2v2h-2z" />], ['f', <path d="M14 18v2M18 14h2" />]],
  services: [['hub', <circle cx="12" cy="12" r="3" />], ['rays', <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" />]],
  arrow: [['shaft', <path d="M5 12h14M13 6l6 6-6 6" />]],
};

export default function ProductIcon({ kind, size = 24, className }) {
  return <svg className={className} data-kind={kind} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {PARTS[kind].map(([part, shape]) => <g key={part} data-part={part}>{shape}</g>)}
  </svg>;
}
