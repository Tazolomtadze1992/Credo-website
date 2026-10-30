'use client';
import {useEffect,useRef} from 'react';
import art from './cake-art.json';
import {settle,cakeSpread} from './motion-model.mjs';
import styles from './stage.module.css';
export default function CakeDrawing(){
 const rootRef=useRef(null);
 useEffect(()=>{
  const root=rootRef.current,still=matchMedia('(prefers-reduced-motion: reduce)'),pieces=[...root.querySelectorAll('[data-cake-piece]')].map(el=>({el,i:Number(el.dataset.cakePiece),vector:el.dataset.vector.split(' ').map(Number),cuts:[...el.querySelectorAll('[data-cake-cut]')]}));
  let frame=0,last=0,visible=false,hover=false,latched=false;const p={x:0,v:0};
  const target=()=>hover||latched?1:0;
  const draw=()=>{for(const {el,i,vector,cuts} of pieces){const s=cakeSpread(p.x,i);el.setAttribute('transform',`translate(${vector[0]*s} ${vector[1]*s})`);for(const face of cuts)face.style.opacity=String(Math.min(1,s*5));}root.dataset.progress=p.x.toFixed(3);};
  function tick(now){frame=0;if(!visible||document.hidden)return;const dt=last?Math.min((now-last)/1000,1/30):1/60;last=now;let moving=false;if(still.matches){p.x=target();p.v=0;}else moving=settle(p,target(),dt,.18);draw();if(moving)frame=requestAnimationFrame(tick);}
  const run=()=>{root.setAttribute('aria-pressed',String(Boolean(target())));if(!frame&&visible&&!document.hidden){last=0;frame=requestAnimationFrame(tick);}};
  const enter=e=>{if(e.pointerType!=='touch'){hover=true;run();}},leave=()=>{hover=false;run();},up=e=>{if(e.pointerType==='touch'){latched=!latched;run();}},key=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();latched=!latched;run();}else if(e.key==='Escape'){latched=hover=false;run();}};
  const visibility=()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;}else run();};
  const observer=new IntersectionObserver(entries=>{visible=entries[entries.length-1].isIntersecting;if(visible)run();else{cancelAnimationFrame(frame);frame=0;}},{threshold:.01});observer.observe(root);
  root.addEventListener('pointerenter',enter);root.addEventListener('pointerleave',leave);root.addEventListener('pointerup',up);root.addEventListener('keydown',key);document.addEventListener('visibilitychange',visibility);still.addEventListener('change',run);draw();
  return()=>{cancelAnimationFrame(frame);observer.disconnect();root.removeEventListener('pointerenter',enter);root.removeEventListener('pointerleave',leave);root.removeEventListener('pointerup',up);root.removeEventListener('keydown',key);document.removeEventListener('visibilitychange',visibility);still.removeEventListener('change',run);};
 },[]);
 return <div ref={rootRef} className={styles.scene} data-kind="cake-drawing" data-parts="8" tabIndex={0} role="button" aria-label="ილუსტრირებული ტორტის რვა თანაბარ ნაწილად დაყოფა" aria-pressed="false"><div className={styles.poster} dangerouslySetInnerHTML={{__html:art.svg}}/></div>;
}
