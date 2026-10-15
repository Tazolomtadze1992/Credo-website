'use client';

import { useEffect, useId, useRef, useState } from 'react';
import styles from './SharedBentoBackground.module.css';
import { latestSharedVersion, loadSharedBentoVersion } from '../lib/shared-bento-versions/catalog.mjs';

const PAD = 12;
export default function SharedBentoBackground({ version = latestSharedVersion }) {
  const rootRef = useRef(null), canvasRef = useRef(null), engineRef = useRef(null);
  const clipId = `bento-field-${useId().replace(/:/g,'')}`;
  const [layout,setLayout] = useState(null);
  const [renderer,setRenderer] = useState('loading');

  useEffect(() => {
    const root = rootRef.current, grid = root.parentElement;
    const cards = [grid.querySelector('.product-loan'),grid.querySelector('.product-split')];
    const desktop = window.matchMedia('(min-width:940px) and (hover:hover) and (pointer:fine)');
    const hovered = [false,false];
    let geometry, visible = false, disposed = false;
    const updateActive = () => engineRef.current?.setActive(visible && document.visibilityState !== 'hidden');
    const measure = (animate = false) => {
      const rects = cards.map(card => ({ x:card.offsetLeft+PAD, y:card.offsetTop+PAD, width:card.offsetWidth, height:card.offsetHeight }));
      const width = grid.clientWidth+PAD*2, height = Math.max(...rects.map(r=>r.y+r.height))+PAD;
      const stacked = rects[1].y>rects[0].y+20;
      const windows = rects.map((r,i) => {
        const gy = desktop.matches && hovered[i] ? (i===0?4:6) : 0;
        const gx = r.width/r.height*gy;
        return { x:r.x+1-gx, y:r.y+1-gy, width:r.width-2+gx*2, height:r.height-2+gy*2 };
      });
      geometry = {width,height,rects,stacked};
      setLayout({width,height,windows,animate:animate===true});
      engineRef.current?.resize(width,height,rects,stacked);
    };
    const handlers = cards.map((card,i) => {
      const enter = () => {hovered[i]=true;measure(true);};
      const leave = () => {hovered[i]=false;measure(true);};
      card.addEventListener('pointerenter',enter);card.addEventListener('pointerleave',leave);
      return {card,enter,leave};
    });
    const resize = new ResizeObserver(measure);
    resize.observe(grid);cards.forEach(card=>resize.observe(card));
    const visibility = new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;updateActive();});
    visibility.observe(root);
    document.addEventListener('visibilitychange',updateActive);
    desktop.addEventListener('change',measure);
    measure();
    loadSharedBentoVersion(version).then(({createSharedBentoField})=>{
      if (disposed) return;
      try {
        const engine = createSharedBentoField(canvasRef.current);
        engineRef.current = engine;
        engine.resize(geometry.width,geometry.height,geometry.rects,geometry.stacked);
        setRenderer('live');updateActive();
      } catch {setRenderer('fallback');}
    }).catch(()=>{if(!disposed)setRenderer('fallback');});
    const lost = event => {event.preventDefault();engineRef.current?.setActive(false);setRenderer('fallback');};
    canvasRef.current.addEventListener('webglcontextlost',lost);
    const canvas = canvasRef.current;
    return () => {
      disposed=true;resize.disconnect();visibility.disconnect();engineRef.current?.dispose();engineRef.current=null;
      document.removeEventListener('visibilitychange',updateActive);desktop.removeEventListener('change',measure);
      canvas.removeEventListener('webglcontextlost',lost);
      handlers.forEach(({card,enter,leave})=>{card.removeEventListener('pointerenter',enter);card.removeEventListener('pointerleave',leave);});
    };
  },[version]);

  return <div ref={rootRef} className={`shared-bento-field ${styles.field}`} data-version={version} data-renderer={renderer} data-hover-transition={layout?.animate || undefined} style={{width:layout?.width,height:layout?.height,clipPath:layout?`url(#${clipId})`:undefined,visibility:layout?'visible':'hidden'}} aria-hidden="true">
    <svg className={styles.clipDefinitions} width="0" height="0"><defs><clipPath id={clipId} clipPathUnits="userSpaceOnUse">
      {layout?.windows.map((rect,i)=><rect key={i} className={styles.window} x={rect.x} y={rect.y} width={rect.width} height={rect.height} rx="15" style={{x:rect.x,y:rect.y,width:rect.width,height:rect.height}} />)}
    </clipPath></defs></svg>
    <canvas ref={canvasRef} className={styles.canvas} />
  </div>;
}
