import art from './cake-art.json';
const size={height:'100%',width:'100%'};
export default function Poster({kind}){
 if(kind==='cake')return <div style={size} dangerouslySetInnerHTML={{__html:art.svg}}/>;
 if(kind==='paper'){
  const sheet=<g transform="translate(254 65)"><path d="M0 10 42 0 84 14 126 0 168 14 210 0 252 14 294 4V263L252 274 210 262 168 275 126 262 84 274 42 260 0 274Z" fill="url(#paper-poster)" stroke="oklch(.8 .015 232)" strokeWidth=".5"/><image href="/assets/dayavi/dayavi-mark.png" x="15" y="86" width="264" height="85"/></g>;
  return <svg style={size} viewBox="0 0 800 400" aria-hidden="true"><defs><linearGradient id="paper-poster"><stop stopColor="oklch(.88 .015 232)"/><stop offset=".5" stopColor="white"/><stop offset="1" stopColor="oklch(.92 .01 232)"/></linearGradient><clipPath id="paper-top"><rect x="0" y="0" width="800" height="200"/></clipPath><clipPath id="paper-bottom"><rect x="0" y="200" width="800" height="200"/></clipPath></defs><g data-poster-piece data-vector="0 -30"><g clipPath="url(#paper-top)">{sheet}</g></g><g data-poster-piece data-vector="0 30"><g clipPath="url(#paper-bottom)">{sheet}</g></g></svg>;
 }
 return <svg style={size} viewBox="0 0 800 400" aria-hidden="true"><defs><radialGradient id="orb-poster" cx="30%" cy="23%"><stop stopColor="oklch(.7 .08 232)"/><stop offset=".5" stopColor="oklch(.51 .09 232)"/><stop offset="1" stopColor="oklch(.34 .07 232)"/></radialGradient></defs><ellipse cx="400" cy="324" rx="92" ry="13" fill="oklch(.6 .025 232 / .08)"/>{Array.from({length:8},(_,i)=>{const a=i*Math.PI/4,b=(i+1)*Math.PI/4,m=(a+b)/2;return <g key={i} data-poster-piece data-vector={`${Math.cos(m)*30} ${Math.sin(m)*30}`}><path d={`M400 190L${400+122*Math.cos(a)} ${190+122*Math.sin(a)}A122 122 0 0 1 ${400+122*Math.cos(b)} ${190+122*Math.sin(b)}Z`} fill="url(#orb-poster)"/></g>;})}</svg>;
}
