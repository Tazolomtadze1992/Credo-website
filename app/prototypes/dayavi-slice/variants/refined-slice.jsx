'use client';
import {useEffect,useId,useRef} from 'react';
import * as THREE from 'three';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {SHEET,initialPatches,foldedPoint,splitPatches,centroid,patchArea,crossesPiece} from '../../dayavi/variants/round-3/slice-geometry.mjs';
import {P} from '../../dayavi/variants/round-2/palette.mjs';
import Poster from '../../dayavi/variants/round-2/poster';
import {buildPaperGeometry} from './paper-geometry.mjs';
import {AXES,zeroPose,inheritPieceMotion,stepPose,interruptReturn,beginReturn} from './physical-model.mjs';
import {pointInPolygons,withinBounds,strokeIntent,fitsPieceBudget} from './gesture-model.mjs';
import styles from './refined-slice.module.css';

export default function RefinedSlice(){
 const rootRef=useRef(null),canvasRef=useRef(null),bladeRef=useRef(null),clipRef=useRef(null),seamLightRef=useRef(null),seamInkRef=useRef(null);
 const clipId=`paper-seam-${useId().replaceAll(':','')}`;
 useEffect(()=>{
  const root=rootRef.current,canvas=canvasRef.current,blade=bladeRef.current,clip=clipRef.current,seamLight=seamLightRef.current,seamInk=seamInkRef.current;
  let disposed=false,destroy=()=>{};
  async function init(){
   await Promise.resolve();if(disposed)return;
   const logo=await new Promise(resolve=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>resolve(null);image.src='/assets/dayavi/dayavi-mark.png';});
   if(disposed)return;
   const context=canvas.getContext('webgl2',{alpha:true,antialias:true,powerPreference:'low-power'});
   if(!context){root.dataset.renderer='unavailable';root.removeAttribute('tabindex');return;}
   const renderer=new THREE.WebGLRenderer({canvas,context,alpha:true,antialias:true,powerPreference:'low-power'});
   renderer.setClearColor(0xffffff,0);renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.75));
   renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.NeutralToneMapping;renderer.toneMappingExposure=.95;
   renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.VSMShadowMap;renderer.shadowMap.autoUpdate=false;
   const scene=new THREE.Scene(),room=new RoomEnvironment(),pmrem=new THREE.PMREMGenerator(renderer),environment=pmrem.fromScene(room,.03);
   scene.environment=environment.texture;scene.environmentIntensity=.45;room.dispose();pmrem.dispose();
   scene.add(new THREE.HemisphereLight(0xffffff,P.bluePale,1.06));
   const key=new THREE.DirectionalLight(0xffffff,2.15);key.position.set(-3,11,7);key.castShadow=true;
   key.shadow.mapSize.set(1024,1024);Object.assign(key.shadow.camera,{left:-6,right:6,top:6,bottom:-6,near:.5,far:26});
   key.shadow.normalBias=.012;key.shadow.bias=-.00006;key.shadow.radius=6;key.shadow.blurSamples=12;scene.add(key);
   const fill=new THREE.DirectionalLight(P.bluePale,.82);fill.position.set(5,3,-3);scene.add(fill);
   const floor=new THREE.Mesh(new THREE.PlaneGeometry(30,30),new THREE.ShadowMaterial({color:P.ink,opacity:.034}));floor.rotation.x=-Math.PI/2;floor.position.y=-1.5;floor.receiveShadow=true;scene.add(floor);
   const print=document.createElement('canvas');print.width=2048;print.height=800;const ctx=print.getContext('2d');ctx.fillStyle='#fcfdfe';ctx.fillRect(0,0,2048,800);
   if(logo)ctx.drawImage(logo,190,130,1668,539);
   ctx.fillStyle='#e5edf1';ctx.fillRect(45,34,1958,1);ctx.fillRect(45,765,1958,1);
   const texture=new THREE.CanvasTexture(print);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
   const grainCanvas=document.createElement('canvas');grainCanvas.width=grainCanvas.height=128;const grainCtx=grainCanvas.getContext('2d'),pixels=grainCtx.createImageData(128,128);let seed=17;
   for(let i=0;i<pixels.data.length;i+=4){seed=(seed*1664525+1013904223)>>>0;const n=123+(seed%11);pixels.data[i]=pixels.data[i+1]=pixels.data[i+2]=n;pixels.data[i+3]=255;}grainCtx.putImageData(pixels,0,0);
   const grain=new THREE.CanvasTexture(grainCanvas);grain.wrapS=grain.wrapT=THREE.RepeatWrapping;grain.repeat.set(12,5);
   const front=new THREE.MeshPhysicalMaterial({map:texture,color:0xffffff,roughness:.94,sheen:.13,bumpMap:grain,bumpScale:.007,side:THREE.FrontSide});
   const back=new THREE.MeshPhysicalMaterial({color:P.paper,roughness:.95,sheen:.13,bumpMap:grain,bumpScale:.007,side:THREE.BackSide});
   const edgeMaterial=new THREE.MeshStandardMaterial({color:0xdce5ea,roughness:.95});
   const camera=new THREE.OrthographicCamera(-5,5,2,-2,.1,40);camera.position.set(.45,1.9,10);camera.lookAt(0,0,0);camera.updateMatrixWorld(true);
   const still=matchMedia('(prefers-reduced-motion: reduce)');
   let width=0,height=0,frame=0,last=0,visible=false,inside=false,returning=false,returnReason='',cutCount=0,nextId=0;
   let leaveTimer=0,completionTimer=0,strokeTimer=0,pendingCommit=false,pendingLeave=false,projectionDirty=true,renderDirty=true,queue=[],previous=null,gesture=null,trail=[],seamUntil=0,seamD='',deferredStroke=null;
   let bounds={minX:0,minY:0,maxX:0,maxY:0},allPolygons=[];

   function applyPose(p){const v=p.pose;p.group.position.set(p.pivot.x+v.x,p.pivot.y+v.y,p.pivot.z+v.z);p.group.rotation.set(v.rx,v.ry,v.rz);p.group.updateMatrixWorld(true);}
   function makePiece(patches,parent=null){
    const pivot=new THREE.Vector3(...centroid(patches)),group=new THREE.Group(),geometries=buildPaperGeometry(THREE,patches,pivot,foldedPoint);
    for(const material of [front,back]){const mesh=new THREE.Mesh(geometries.surface,material);mesh.castShadow=mesh.receiveShadow=true;group.add(mesh);}
    group.add(new THREE.Mesh(geometries.edges,edgeMaterial));
    const motion=parent?inheritPieceMotion(THREE,parent,pivot):{pose:zeroPose(),target:zeroPose(),velocity:zeroPose()};
    const p={id:++nextId,patches,pivot,group,...motion,area:patchArea(patches),omega:17,polygons:[]};scene.add(group);applyPose(p);return p;
   }
   function disposePiece(p){scene.remove(p.group);const geometries=new Set();p.group.traverse(mesh=>{if(mesh.geometry)geometries.add(mesh.geometry);});geometries.forEach(g=>g.dispose());}
   const whole=makePiece(initialPatches());let pieces=[whole];
   const worldPoint=(piece,uv,panel)=>new THREE.Vector3(...foldedPoint(uv,panel)).sub(piece.pivot).applyMatrix4(piece.group.matrixWorld);
   const project=v=>{const p=v.project(camera);return{x:(p.x+1)*width/2,y:(1-p.y)*height/2};};
   function updateProjection(){
    if(!projectionDirty||!width||!height)return;
    allPolygons=[];bounds={minX:Infinity,minY:Infinity,maxX:-Infinity,maxY:-Infinity};
    for(const p of pieces){p.group.updateMatrixWorld(true);p.polygons=p.patches.map(patch=>patch.poly.map(uv=>project(worldPoint(p,uv,patch.panel))));allPolygons.push(...p.polygons);}
    for(const poly of allPolygons)for(const p of poly){bounds.minX=Math.min(bounds.minX,p.x);bounds.maxX=Math.max(bounds.maxX,p.x);bounds.minY=Math.min(bounds.minY,p.y);bounds.maxY=Math.max(bounds.maxY,p.y);}
    clip.setAttribute('d',allPolygons.map(poly=>poly.map((p,i)=>`${i?'L':'M'}${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join('')+'Z').join(''));
    projectionDirty=false;
   }
   function publish(){
    root.dataset.pieces=String(pieces.length);root.dataset.cuts=String(cutCount);root.dataset.state=returning?'returning':pieces.length===6?'complete':pieces.length===1?'whole':'cut';
    root.dataset.returnReason=returnReason;root.setAttribute('aria-pressed',String(pieces.length>1));
   }
   function clearGesture(){clearTimeout(strokeTimer);pendingCommit=false;gesture=null;seamUntil=0;seamD='';}
   function completionAfter(delay=1500){
    clearTimeout(completionTimer);
    if(pieces.length===6&&!returning)completionTimer=setTimeout(()=>startReturn('complete'),delay);
   }
   function startReturn(reason='leave'){
    clearTimeout(leaveTimer);clearTimeout(completionTimer);clearGesture();previous=null;
    if(pieces.length===1)return;
    returning=true;returnReason=reason;beginReturn(pieces);publish();wake();
   }
   function cancelReturn(){
    // Completion finishes its cycle; a new stroke is retained and replayed on
    // the assembled sheet. Leave/keyboard returns remain directly interruptible.
    if(!returning||returnReason==='complete')return;
    returning=false;returnReason='';interruptReturn(pieces);clearGesture();previous=null;publish();completionAfter(1700);wake();
   }
   function cut(a,b,energy=1){
    updateProjection();
    if(pieces.length===6){deferredStroke={a,b,energy,at:performance.now()};startReturn('complete');return false;}
    const av=new THREE.Vector3(a.x/width*2-1,1-a.y/height*2,0).unproject(camera),bv=new THREE.Vector3(b.x/width*2-1,1-b.y/height*2,0).unproject(camera);
    const normal=new THREE.Vector3().subVectors(bv,av).cross(camera.getWorldDirection(new THREE.Vector3())).normalize();
    const proposals=[];
    for(const p of pieces){
     if(!crossesPiece(p.polygons,a,b,18))continue;
     const distance=v=>normal.dot(new THREE.Vector3(...v).sub(p.pivot).applyMatrix4(p.group.matrixWorld).sub(av));
     const parts=splitPatches(p.patches,distance,.24);if(parts)proposals.push({piece:p,parts});
    }
    if(!proposals.length)return false;
    // A gesture commits as one operation. A limit can never cut only half its path.
    if(!fitsPieceBudget(pieces.length,proposals)){deferredStroke={a,b,energy,at:performance.now()};startReturn('complete');return false;}
    for(const {piece,parts} of proposals){
     const children=parts.map(part=>{
      const p=makePiece(part.patches,piece),lightness=Math.min(1.55,Math.sqrt(SHEET.width*SHEET.height/(p.area*2))),distance=.115*lightness*energy;
      const n=normal.clone().multiplyScalar(part.side*distance);
      p.target.x+=n.x;p.target.y+=n.y;p.target.z+=n.z;
      p.target.rx+=part.side*.017*lightness;p.target.ry+=part.side*.014*lightness;p.target.rz+=part.side*.018*lightness;
      p.omega=16+lightness*2;return p;
     });
     pieces.splice(pieces.indexOf(piece),1,...children);if(piece===whole)whole.group.visible=false;else disposePiece(piece);
    }
    // Uniformly bound travel rather than pushing crowded fragments back together.
    const factor=Math.min(1,...pieces.flatMap(p=>[.43/Math.max(.001,Math.abs(p.target.x)),.25/Math.max(.001,Math.abs(p.target.y)),.14/Math.max(.001,Math.abs(p.target.z)),.065/Math.max(.001,Math.abs(p.target.rz))]));
    if(factor<1)for(const p of pieces)for(const axis of AXES)p.target[axis]*=factor;
    cutCount++;returning=false;returnReason='';projectionDirty=renderDirty=true;publish();completionAfter();wake();return true;
   }
   function finishGesture(){
    pendingCommit=false;clearTimeout(strokeTimer);
    if(!gesture)return;
    const samples=gesture.samples,intent=strokeIntent(samples);gesture=null;
    if(intent)cut(intent.a,intent.b,intent.energy);
    seamUntil=performance.now()+100;wake();
   }
   function processPoint(p){
    updateProjection();
    if(returning&&inside)cancelReturn();
    const hit=pointInPolygons(allPolygons,p),prior=previous;
    trail.push(p);if(trail.length>36)trail.shift();
    if(!gesture&&prior&&!pointInPolygons(allPolygons,prior)){
     const crossing=hit||pieces.some(piece=>crossesPiece(piece.polygons,prior,p,18));
     if(crossing)gesture={samples:[prior,p],a:prior};
    }else if(gesture){
     gesture.samples.push(p);if(gesture.samples.length>80)gesture.samples.splice(1,1);
     if(p.t-gesture.a.t>2200){clearGesture();}
    }
    if(gesture){
     const a=gesture.a;seamD=`M${a.x.toFixed(2)} ${a.y.toFixed(2)}L${p.x.toFixed(2)} ${p.y.toFixed(2)}`;seamUntil=p.t+150;
     if(!withinBounds(p,bounds,7)){finishGesture();}
     else if(!hit){clearTimeout(strokeTimer);strokeTimer=setTimeout(()=>{pendingCommit=true;wake();},95);}
     else{clearTimeout(strokeTimer);pendingCommit=false;}
    }
    previous=p;
   }
   function tick(now){
    frame=0;if(disposed||!visible||document.hidden)return;
    const dt=last?Math.min((now-last)/1000,1/30):1/60;last=now;let moving=false;
    for(const p of pieces){
     if(still.matches){if(AXES.some(axis=>p.pose[axis]!==p.target[axis]))projectionDirty=renderDirty=true;p.pose={...p.target};p.velocity=zeroPose();}
     else if(stepPose(p,p.target,dt,returning?12:p.omega))moving=true;
     applyPose(p);
    }
    if(moving||returning)projectionDirty=renderDirty=true;
    if(returning&&!moving){
     for(const p of pieces)if(p!==whole)disposePiece(p);pieces=[whole];whole.pose=zeroPose();whole.target=zeroPose();whole.velocity=zeroPose();whole.group.visible=true;applyPose(whole);
     returning=false;returnReason='';cutCount=0;projectionDirty=renderDirty=true;publish();
     const pending=deferredStroke;deferredStroke=null;if(pending&&inside&&now-pending.at<1500)cut(pending.a,pending.b,pending.energy);
    }
    updateProjection();
    for(const p of queue.splice(0))processPoint(p);
    if(pendingCommit)finishGesture();
    if(pendingLeave){clearGesture();previous=null;pendingLeave=false;if(pieces.length>1)leaveTimer=setTimeout(()=>startReturn('leave'),850);}
    updateProjection();
    trail=trail.filter(p=>now-p.t<125);
    blade.setAttribute('d',trail.map((p,i)=>`${i?'L':'M'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(''));
    blade.style.opacity=trail.length>1?String(.22*Math.max(0,1-(now-trail[trail.length-1].t)/125)):0;
    const seamOpacity=seamD&&(gesture||seamUntil>now)?(gesture ? .88 : Math.max(0,(seamUntil-now)/100)*.75):0;
    for(const path of [seamLight,seamInk])path.setAttribute('d',seamD);
    seamLight.style.opacity=seamOpacity;seamInk.style.opacity=seamOpacity*.6;
    root.dataset.stroke=gesture?'engaged':'ready';
    if(renderDirty){renderer.shadowMap.needsUpdate=true;renderer.render(scene,camera);renderDirty=false;}
    if(!frame&&(moving||renderDirty||trail.length>1||seamUntil>now||queue.length))frame=requestAnimationFrame(tick);
   }
   function wake(){if(!frame&&visible&&!document.hidden&&!disposed){last=0;frame=requestAnimationFrame(tick);}}
   function sample(e){const rect=root.getBoundingClientRect();return{x:e.clientX-rect.left,y:e.clientY-rect.top,t:performance.now()};}
   function enter(e){inside=true;pendingLeave=false;queue=[];clearTimeout(leaveTimer);cancelReturn();clearGesture();previous=sample(e);}
   function move(e){
    if(e.pointerType==='touch'&&e.buttons===0)return;
    inside=true;clearTimeout(leaveTimer);queue.push(sample(e));if(queue.length>24)queue.splice(0,queue.length-24);wake();
   }
   function leave(e){
    inside=false;deferredStroke=null;clearTimeout(leaveTimer);clearTimeout(strokeTimer);pendingLeave=true;
    if(Number.isFinite(e.clientX)&&Number.isFinite(e.clientY))queue.push(sample(e));else{queue=[];clearGesture();}
    wake();
   }
   function keyboard(e){
    if(e.key==='Escape'){e.preventDefault();startReturn('keyboard');}
    else if(e.key==='Enter'||e.key===' '){
     e.preventDefault();clearTimeout(leaveTimer);cancelReturn();
     if(pieces.length===6)startReturn('complete');else{const angle=cutCount%3===0?0:cutCount%3===1?Math.PI/2:.58,dx=Math.cos(angle)*width,dy=Math.sin(angle)*height;cut({x:width/2-dx,y:height/2-dy},{x:width/2+dx,y:height/2+dy});}
    }
   }
   function resize(){
    if(getComputedStyle(canvas).position!=='absolute')return;
    const rect=root.getBoundingClientRect();width=rect.width;height=rect.height;if(!width||!height||width>8192||height>4096)return;
    clearGesture();previous=null;queue=[];renderer.setSize(width,height,false);root.querySelector('svg[data-overlay]').setAttribute('viewBox',`0 0 ${width} ${height}`);
    const aspect=width/height,hh=Math.max(1.88,3/aspect),hw=hh*aspect;camera.left=-hw;camera.right=hw;camera.top=hh;camera.bottom=-hh;camera.updateProjectionMatrix();projectionDirty=renderDirty=true;updateProjection();renderer.shadowMap.needsUpdate=true;renderer.render(scene,camera);renderDirty=false;
   }
   function visibility(){if(document.hidden){cancelAnimationFrame(frame);frame=0;queue=[];clearGesture();previous=null;}else wake();}
   const observer=new IntersectionObserver(entries=>{visible=entries[entries.length-1].isIntersecting;if(visible)wake();else{cancelAnimationFrame(frame);frame=0;queue=[];clearGesture();previous=null;}},{threshold:.01});observer.observe(root);
   const resizer=new ResizeObserver(resize);resizer.observe(root);
   root.addEventListener('pointerenter',enter);root.addEventListener('pointermove',move,{passive:true});root.addEventListener('pointerleave',leave);root.addEventListener('keydown',keyboard);root.addEventListener('blur',leave);
   document.addEventListener('visibilitychange',visibility);still.addEventListener('change',wake);
   resize();publish();root.dataset.renderer='webgl';
   destroy=()=>{
    clearTimeout(leaveTimer);clearTimeout(completionTimer);clearTimeout(strokeTimer);cancelAnimationFrame(frame);observer.disconnect();resizer.disconnect();
    root.removeEventListener('pointerenter',enter);root.removeEventListener('pointermove',move);root.removeEventListener('pointerleave',leave);root.removeEventListener('keydown',keyboard);root.removeEventListener('blur',leave);document.removeEventListener('visibilitychange',visibility);still.removeEventListener('change',wake);
    for(const p of pieces)if(p!==whole)disposePiece(p);disposePiece(whole);front.dispose();back.dispose();edgeMaterial.dispose();texture.dispose();grain.dispose();floor.geometry.dispose();floor.material.dispose();key.shadow.dispose();environment.dispose();renderer.dispose();queueMicrotask(()=>{if(!canvas.isConnected)renderer.forceContextLoss();});
   };
  }
  init().catch(error=>{destroy();root.dataset.renderer='unavailable';root.dataset.error=error.message;});
  return()=>{disposed=true;destroy();};
 },[]);
 return <div ref={rootRef} className={styles.scene} data-kind="refined-slice" data-renderer="loading" role="button" tabIndex={0} aria-label="გაუსვი კურსორი ქაღალდს გასაჭრელად. Enter — გაჭრა, Escape — აღდგენა." aria-pressed="false">
  <div className={styles.poster}><Poster kind="paper"/></div>
  <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true"/>
  <svg className={styles.overlay} data-overlay aria-hidden="true">
   <defs><clipPath id={clipId}><path ref={clipRef}/></clipPath></defs>
   <g clipPath={`url(#${clipId})`}><path ref={seamLightRef} className={styles.seamLight}/><path ref={seamInkRef} className={styles.seamInk}/></g>
   <path ref={bladeRef} className={styles.blade}/>
  </svg>
 </div>;
}
