'use client';
import {useEffect,useLayoutEffect,useRef,useState} from 'react';
import {useRouter} from 'next/navigation';
import SiteHeader from '../../../components/SiteHeader';
import Credo from './variants/credo';
import Archive from './variants/archive';
import Beginning from './variants/beginning';
import './history.css';
import './vendor/utilities.css';
import './vendor/intro.css';
import './picker.css';
const variants=[{name:'Credo',Scene:Credo},{name:'Archive',Scene:Archive},{name:'From start',Scene:Beginning}];
export default function Preview({initialVariant=0}){
 const [selected,setSelected]=useState(initialVariant);const [replay,setReplay]=useState(0);const [ready,setReady]=useState(false);
 const router=useRouter();
 const current=useRef(selected);current.current=selected;const items=useRef([]);const highlight=useRef(null);
 function choose(i){if(i<0||i>=variants.length)return;setSelected(i);setReplay(x=>x+1);const u=new URL(location.href);u.searchParams.set('v',i+1);history.replaceState(null,'',u)}
 useLayoutEffect(()=>{function measure(){const b=items.current[current.current];if(b&&highlight.current){highlight.current.style.width=b.offsetWidth+'px';highlight.current.style.transform=`translateX(${b.offsetLeft}px)`}}measure();window.addEventListener('resize',measure);return()=>window.removeEventListener('resize',measure)},[selected]);
 useEffect(()=>{let b;const a=requestAnimationFrame(()=>{b=requestAnimationFrame(()=>setReady(true))});const u=new URL(location.href);u.searchParams.set('v',current.current+1);history.replaceState(null,'',u);
 function key(e){if(document.querySelector('.history-lightbox'))return;if(/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)||e.target.isContentEditable||e.metaKey||e.ctrlKey||e.altKey)return;const n=parseInt(e.key,10);if(n>=1&&n<=variants.length){e.preventDefault();choose(n-1)}else if(e.key==='ArrowRight'){e.preventDefault();choose((current.current+1)%variants.length)}else if(e.key==='ArrowLeft'){e.preventDefault();choose((current.current-1+variants.length)%variants.length)}else if(e.key.toLowerCase()==='r')setReplay(x=>x+1)}
 document.addEventListener('keydown',key);return()=>{cancelAnimationFrame(a);cancelAnimationFrame(b);document.removeEventListener('keydown',key)}},[]);
 function headerDestination(event){const link=event.target.closest('a');const href=link?.getAttribute('href');if(!href?.startsWith('#'))return;event.preventDefault();router.push(href==='#site-top'?'/':`/${href}`)}
 const Scene=variants[selected].Scene;
 return <div className={`history-page history-direction-${selected===1?'archive':'credo'}`}>
  <div className="history-site-header" onClickCapture={headerDestination}><SiteHeader/></div>
  <main className="history-main"><div className="history-title"><h1>ჩვენი ისტორია</h1><p>1997 — 2026</p></div><Scene key={`${selected}:${replay}`}/></main>

  <nav className="proto-picker" aria-label="Prototype variants" data-ready={ready?'':undefined}>
   <span ref={highlight} className="proto-picker-highlight" aria-hidden="true"/>
   {variants.map((v,i)=><button key={v.name} ref={el=>{items.current[i]=el}} className="proto-picker-item" data-active={selected===i?'':undefined} aria-current={selected===i?'true':undefined} onClick={()=>choose(i)}>{v.name}</button>)}
   <span className="proto-picker-divider" aria-hidden="true"/><button className="proto-picker-item proto-picker-replay" aria-label="Replay animation (R)" onClick={()=>setReplay(x=>x+1)}>↻</button>
  </nav>
 </div>;
}
