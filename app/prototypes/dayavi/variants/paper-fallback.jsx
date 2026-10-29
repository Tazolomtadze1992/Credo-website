import styles from './fold.module.css';

export default function PaperFallback() {
  return <svg className={styles.fallback} viewBox="0 0 1000 430" aria-hidden="true">
    <defs><linearGradient id="paper-a" x1="0" x2="1"><stop stopColor="#fdfefe" /><stop offset="1" stopColor="#e4edf2" /></linearGradient><linearGradient id="paper-b" x1="0" x2="1"><stop stopColor="#e0e9ef" /><stop offset="1" stopColor="#f9fbfc" /></linearGradient></defs>
    {Array.from({ length: 8 }, (_, index) => {
      const x = 270 + index * 57, y = index % 2 ? 126 : 100;
      const slope = index % 2 ? -26 / 256 : 26 / 256;
      return <g key={index} transform={`matrix(${57 / 256} ${slope} 0 .3 ${x} ${y})`}>
        <svg width="256" height="640" viewBox="0 0 256 640" overflow="hidden">
          <rect width="256" height="640" fill={`url(#paper-${index % 2 ? 'b' : 'a'})`} />
          <image href="/assets/dayavi/dayavi-mark.png" x={274 - index * 256} y="50" width="1500" height="485" />
          <text x="128" y="600" textAnchor="middle" fill="#526c7b" fontFamily="Arial,Georgian,sans-serif" fontSize="32">150 ₾</text>
        </svg>
      </g>;
    })}
  </svg>;
}
