'use client';

import {useCallback,useEffect,useLayoutEffect,useRef,useState} from 'react';
import './picker.css';

const designs=['Variant\u00a01','Variant\u00a02'];
const commonSections=['products','calculator','news'];

export default function DesignComparison({initialDesign=1,ours,other}){
  const [selected,setSelected]=useState(initialDesign);
  const [replay,setReplay]=useState(0);
  const [ready,setReady]=useState(false);
  const highlight=useRef(null),items=useRef([]),anchor=useRef(null);

  const choose=useCallback(value=>{
    if(value!==1&&value!==2)return;
    if(value===1&&!ours){
      document.cookie='credo-design=1; Path=/; Max-Age=31536000; SameSite=Lax';
      window.location.assign('/?v=1');
      return;
    }
    // Keep comparisons in the same section when the layouts have a counterpart.
    anchor.current=commonSections.filter(id=>{
      const section=document.getElementById(id);
      return section&&section.getBoundingClientRect().top<=120;
    }).at(-1)||null;
    setSelected(value);
    setReplay(value=>value+1);
  },[ours]);

  useEffect(()=>{
    const url=new URL(window.location.href);
    url.searchParams.set('v',selected);
    history.replaceState(null,'',url);
    document.cookie=`credo-design=${selected}; Path=/; Max-Age=31536000; SameSite=Lax`;
  },[selected]);

  useLayoutEffect(()=>{
    const move=()=>{
      const item=items.current[selected-1];
      if(!item||!highlight.current)return;
      highlight.current.style.width=item.offsetWidth+'px';
      highlight.current.style.transform=`translateX(${item.offsetLeft}px)`;
    };
    move();
    window.addEventListener('resize',move);
    return()=>window.removeEventListener('resize',move);
  },[selected]);

  useLayoutEffect(()=>{
    if(anchor.current){
      document.getElementById(anchor.current)?.scrollIntoView({behavior:'instant',block:'start'});
      anchor.current=null;
    }
  },[selected,replay]);

  useEffect(()=>{
    let second;
    const first=requestAnimationFrame(()=>{second=requestAnimationFrame(()=>setReady(true))});
    return()=>{cancelAnimationFrame(first);cancelAnimationFrame(second)};
  },[]);

  useEffect(()=>{
    const onKey=event=>{
      if(event.defaultPrevented||event.metaKey||event.ctrlKey||event.altKey||event.shiftKey)return;
      if(/^(INPUT|TEXTAREA|SELECT)$/.test(event.target.tagName)||event.target.isContentEditable)return;
      // Existing menus, calculator tabs and news retain their own arrow controls.
      if(event.target.closest('.design-two header,.site-header,.site-mobile-dialog,[role="dialog"],dialog,[role="tablist"],.home-news'))return;
      if(event.key==='1'||event.key==='2')choose(Number(event.key));
      else if(event.key==='ArrowLeft'||event.key==='ArrowRight'){
        event.preventDefault();choose(selected===1?2:1);
      }else if(event.key.toLowerCase()==='r')setReplay(value=>value+1);
    };
    document.addEventListener('keydown',onKey);
    return()=>document.removeEventListener('keydown',onKey);
  },[choose,selected]);

  return <>
    <div className="design-comparison-stage" data-design={selected===1?'ours':'other'} key={`${selected}-${replay}`}>{selected===1?ours:other}</div>
    <nav className="website-design-picker" aria-label="Prototype variants" data-ready={ready?'':undefined}>
      <span className="website-design-picker-highlight" aria-hidden="true" ref={highlight}/>
      {designs.map((name,index)=><button key={name} ref={element=>{items.current[index]=element}} className="website-design-picker-item" data-active={selected===index+1?'':undefined} aria-current={selected===index+1?'true':undefined} onClick={()=>choose(index+1)}>{name}</button>)}
      <span className="website-design-picker-divider" aria-hidden="true"/>
      <button className="website-design-picker-item website-design-picker-replay" aria-label="Replay animation (R)" onClick={()=>setReplay(value=>value+1)}>↻</button>
    </nav>
  </>;
}
