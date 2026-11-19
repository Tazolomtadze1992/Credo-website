import { ARROW_BLUE, ARROW_CORAL, BLUE, CORAL, EXP, EXP_VIEWBOX, ICON_VIEWBOX, WORDMARK } from './logo-parts.mjs';

// The carpet from the EXP logo as a square, unclipped — crop it to a disc in CSS.
export const CARPET = '/assets/expats/carpet.svg';

/* The two exchange arrows. The SVG box is centred on the carpet, so rotating
   the whole element turns the arrows around the medallion. */
export function Arrows({ className, style }) {
  return <svg className={className} style={style} viewBox={ICON_VIEWBOX} aria-hidden="true">
    <path data-arrow="coral" fill={CORAL} d={ARROW_CORAL} />
    <path data-arrow="blue" fill={BLUE} d={ARROW_BLUE} />
  </svg>;
}

export function ExpScript({ className }) {
  return <svg className={className} viewBox={EXP_VIEWBOX} aria-hidden="true">{EXP.map(d => <path key={d.slice(0, 24)} fill={CORAL} d={d} />)}</svg>;
}

/* "CREDO BANK exp" lockup with the carpet icon, for small brand moments. */
export function Lockup({ className }) {
  return <span className={className} role="img" aria-label="Credo Bank Exp">
    <svg viewBox="540 476 1245 230" aria-hidden="true">
      {WORDMARK.map((s, i) => s.tag === 'polygon'
        ? <polygon key={i} fill={BLUE} points={s.v} />
        : <path key={i} fill={BLUE} d={s.v} />)}
      {EXP.map(d => <path key={d.slice(0, 24)} fill={CORAL} d={d} />)}
    </svg>
  </span>;
}

/* The full round icon: carpet disc + arrows, static. */
export function Emblem({ className, carpetClassName, arrowsClassName }) {
  return <span className={className} aria-hidden="true">
    <span className={carpetClassName}><img src={CARPET} alt="" draggable="false" /></span>
    <Arrows className={arrowsClassName} />
  </span>;
}
