import { STEPS } from './shared';
import s from './steps.module.css';

// B · Linear-style figures: hairline isometric drawings, one per step.
// Hover (or keyboard focus) separates the layers and sends a coral dot along the route.
const iso = 'matrix(.866 .5 -.866 .5 0 0)';

function Clocks() {
  const face = (cx, cy, hour) => <g transform={`translate(${cx} ${cy})`}>
    <circle r="54" className={s.figStroke} />
    <circle r="46" className={s.figFaint} />
    {Array.from({ length: 12 }, (_, i) => <line key={i} x1="0" y1="-46" x2="0" y2={i % 3 ? -42 : -38} className={s.figStroke} transform={`rotate(${i * 30})`} />)}
    <line x1="0" y1="0" x2="0" y2="-26" className={`${s.figStroke} ${s.hand}`} style={{ '--to': `${hour * 30}deg` }} />
    <line x1="0" y1="0" x2="0" y2="-38" className={`${s.figStroke} ${s.minute}`} />
    <circle r="2.5" className={s.figFill} />
  </g>;
  return <svg viewBox="0 0 320 240" className={s.figure} aria-hidden="true">
    <g className={s.layerBack}>{face(108, 128, 12)}</g>
    <g className={s.layerFront}>{face(212, 112, 14)}</g>
    <path id="fig-route-1" d="M108 128 Q160 40 212 112" className={s.figDash} />
    <circle r="4" className={s.dot} style={{ offsetPath: "path('M108 128 Q160 40 212 112')" }} />
    <text x="108" y="210" className={s.figLabel} textAnchor="middle">ათენი</text>
    <text x="212" y="196" className={s.figLabel} textAnchor="middle">თბილისი</text>
  </svg>;
}

function IdLayers() {
  const card = (key, cls) => <g key={key} className={cls}>
    <g transform={`translate(160 ${key}) ${iso}`}>
      <rect x="-70" y="-46" width="140" height="92" rx="10" className={s.figPlate} />
      {key === 132 && <>
        <rect x="-58" y="-34" width="38" height="46" rx="4" className={s.figStroke} />
        <circle cx="-39" cy="-16" r="8" className={s.figStroke} />
        <line x1="-8" y1="-26" x2="56" y2="-26" className={s.figStroke} />
        <line x1="-8" y1="-12" x2="40" y2="-12" className={s.figStroke} />
        <line x1="-8" y1="2" x2="48" y2="2" className={s.figStroke} />
        <line x1="-58" y1="28" x2="56" y2="28" className={s.figFaint} />
      </>}
    </g>
  </g>;
  return <svg viewBox="0 0 320 240" className={s.figure} aria-hidden="true">
    {card(176, s.layerBack)}{card(154, s.layerMid)}{card(132, s.layerFront)}
    <g className={s.scanBeam}><g transform={`translate(160 132) ${iso}`}><line x1="-74" y1="-46" x2="-74" y2="46" /></g></g>
  </svg>;
}

function PhoneCard() {
  return <svg viewBox="0 0 320 240" className={s.figure} aria-hidden="true">
    <g className={s.layerBack}><g transform={`translate(150 150) ${iso}`}>
      <rect x="-48" y="-92" width="96" height="184" rx="16" className={s.figPlate} />
      <rect x="-40" y="-82" width="80" height="164" rx="10" className={s.figFaint} />
      <line x1="-14" y1="-74" x2="14" y2="-74" className={s.figStroke} />
    </g></g>
    <g className={s.cardSlide}><g transform={`translate(176 112) ${iso}`}>
      <rect x="-56" y="-35" width="112" height="70" rx="8" className={s.figPlate} />
      <rect x="-44" y="-22" width="18" height="14" rx="3" className={s.figStroke} />
      <line x1="-44" y1="16" x2="8" y2="16" className={s.figStroke} />
      <circle cx="34" cy="16" r="7" className={s.figStroke} /><circle cx="44" cy="16" r="7" className={s.figStroke} />
    </g></g>
  </svg>;
}

const FIGS = [Clocks, IdLayers, PhoneCard];

export default function Figures() {
  return <ol className={s.figs}>
    {STEPS.map((step, i) => { const Fig = FIGS[i]; return <li key={step.id} tabIndex={0} className={s.fig}>
      <span className={s.figTag}>FIG 0.{i + 1}</span>
      <div className={s.figArt}><Fig /></div>
      <h3>{step.title}</h3>
      <p>{step.detail}</p>
    </li>; })}
  </ol>;
}
