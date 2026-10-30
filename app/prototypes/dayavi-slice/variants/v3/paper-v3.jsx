'use client';
import {useEffect,useRef} from 'react';
import {createPortal} from 'react-dom';
import * as THREE from 'three';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import Poster from '../../../dayavi/variants/round-2/poster';
import {zeroPose,inheritPieceMotion,stepPose,interruptReturn,beginReturn,AXES} from '../physical-model.mjs';
import {strokeIntent,withinBounds,fitsPieceBudget} from '../gesture-model.mjs';
import {seedSheet,surfacePoint,surfaceNormal,splitSurface,areaOf,pivotOf,boundarySegments,buildSurfaceGeometry,updateSurfaceGeometry} from './curved-paper.mjs';
import {createPaperMaterials} from './paper-material.mjs';
import {crossesSegments,getScreenBounds,fitPaperCamera} from './screen-geometry.mjs';
import styles from './paper-v3.module.css';

const GUTTER=48,MAX_SEAM=1024;
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
function spring(value,target,dt,omega){const delta=value.x-target,v=value.v,e=Math.exp(-omega*dt),s=(v+omega*delta)*dt;value.x=target+(delta+s)*e;value.v=(v-omega*s)*e;const moving=Math.abs(value.x-target)+Math.abs(value.v)>.00012;if(!moving){value.x=target;value.v=0;}return moving;}

export default function PaperV3(){
 const rootRef=useRef(null),canvasRef=useRef(null),overlayRef=useRef(null),bladeRef=useRef(null);
 useEffect(()=>{
  const root=rootRef.current,canvas=canvasRef.current,overlay=overlayRef.current,blade=bladeRef.current;
  let disposed=false,destroy=()=>{};
  async function init(){
   await Promise.resolve();if(disposed)return;
   const logo=await new Promise(resolve=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>resolve(null);image.src='/assets/dayavi/dayavi-mark.png';});
   if(disposed)return;
   const context=canvas.getContext('webgl2',{alpha:true,antialias:true,powerPreference:'low-power'});
   if(!context){root.dataset.renderer='unavailable';root.removeAttribute('tabindex');return;}
   const renderer=new THREE.WebGLRenderer({canvas,context,alpha:true,antialias:true,powerPreference:'low-power'});
   renderer.setClearColor(0xffffff,0);renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.75));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.NeutralToneMapping;renderer.toneMappingExposure=1;
   renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.VSMShadowMap;renderer.shadowMap.autoUpdate=false;
   const scene=new THREE.Scene(),room=new RoomEnvironment(),pmrem=new THREE.PMREMGenerator(renderer),environment=pmrem.fromScene(room,.04);scene.environment=environment.texture;scene.environmentIntensity=.36;room.dispose();pmrem.dispose();
   scene.add(new THREE.HemisphereLight(0xfafcff,0x9daeb7,.72));
   const key=new THREE.DirectionalLight(0xffffff,2.9);key.position.set(-3.2,10,7);key.castShadow=true;key.shadow.mapSize.set(1024,1024);Object.assign(key.shadow.camera,{left:-7,right:7,top:7,bottom:-7,near:.5,far:26});key.shadow.normalBias=.008;key.shadow.bias=-.00004;key.shadow.radius=5;key.shadow.blurSamples=12;scene.add(key);
   const fill=new THREE.DirectionalLight(0xe8f2f7,.7);fill.position.set(4,3,-2);scene.add(fill);
   const floor=new THREE.Mesh(new THREE.PlaneGeometry(30,30),new THREE.ShadowMaterial({color:0x233d4b,opacity:.025}));floor.rotation.x=-Math.PI/2;floor.position.y=-1.48;floor.receiveShadow=true;scene.add(floor);
   const materials=createPaperMaterials(THREE,logo,renderer);
   const camera=new THREE.OrthographicCamera(-5,5,2,-2,.1,40);camera.position.set(.65,1.8,10);camera.lookAt(0,0,0);camera.updateMatrixWorld(true);
   const raycaster=new THREE.Raycaster(),still=matchMedia('(prefers-reduced-motion: reduce)');
   const seed=seedSheet(),totalArea=areaOf(seed);
   let width=0,height=0,framing=null,frame=0,last=0,visible=false,inside=false,returning=false,returnReason='',nextId=0,cutCount=0;
   let leaveTimer=0,completeTimer=0,strokeTimer=0,seamTimer=0,pendingCommit=false,pendingLeave=false,projectionDirty=true,renderDirty=true,seamDirty=true;
   let queue=[],previous=null,previousHit=false,gesture=null,trail=[],exitTailUntil=0,deferredStroke=null,hoverBend=0;
   let bounds={minX:0,maxX:0,minY:0,maxY:0};

   const seamLineGeometry=new THREE.BufferGeometry(),seamRibbonGeometry=new THREE.BufferGeometry();
   const seamPositions=new Float32Array(MAX_SEAM*6),ribbonPositions=new Float32Array(MAX_SEAM*18);
   seamLineGeometry.setAttribute('position',new THREE.BufferAttribute(seamPositions,3).setUsage(THREE.DynamicDrawUsage));seamLineGeometry.setDrawRange(0,0);
   seamRibbonGeometry.setAttribute('position',new THREE.BufferAttribute(ribbonPositions,3).setUsage(THREE.DynamicDrawUsage));seamRibbonGeometry.setDrawRange(0,0);
   const seamInkMaterial=new THREE.LineBasicMaterial({color:0x42545d,transparent:true,opacity:.28,depthWrite:false});
   const seamLipMaterial=new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.8,side:THREE.DoubleSide,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1});
   const seamInk=new THREE.LineSegments(seamLineGeometry,seamInkMaterial),seamLip=new THREE.Mesh(seamRibbonGeometry,seamLipMaterial);seamInk.frustumCulled=seamLip.frustumCulled=false;seamInk.renderOrder=9;seamLip.renderOrder=8;scene.add(seamInk,seamLip);

   function applyPose(p){const v=p.pose;p.group.position.set(p.pivot.x+v.x,p.pivot.y+v.y,p.pivot.z+v.z);p.group.rotation.set(v.rx,v.ry,v.rz);p.group.updateMatrixWorld(true);}
   function makePiece(patches,parent=null){
    const bend=parent?{...parent.bend}:{x:0,v:0,target:0},pivot=new THREE.Vector3(...pivotOf(patches,bend.x)),group=new THREE.Group();
    const geometries=buildSurfaceGeometry(THREE,patches,pivot,bend.x),motion=parent?inheritPieceMotion(THREE,parent,pivot):{pose:zeroPose(),target:zeroPose(),velocity:zeroPose()};
    const front=new THREE.Mesh(geometries.surface,materials.front),back=new THREE.Mesh(geometries.surface,materials.back),edge=new THREE.Mesh(geometries.edges,materials.edge);
    front.castShadow=front.receiveShadow=true;back.castShadow=back.receiveShadow=true;group.add(front,back,edge);scene.add(group);
    const p={id:++nextId,patches,pivot,group,front,geometries,...motion,bend,flex:0,area:areaOf(patches),omega:17,boundary:boundarySegments(patches),screenEdges:[]};front.userData.piece=p;applyPose(p);return p;
   }
   function disposePiece(p){scene.remove(p.group);p.geometries.surface.dispose();p.geometries.edges.dispose();}
   const whole=makePiece(seed);let pieces=[whole];
   function toNdc(p){return new THREE.Vector2((p.x+GUTTER)/framing.renderWidth*2-1,1-(p.y+GUTTER)/framing.renderHeight*2);}
   function project(v){const q=v.clone().project(camera);return{x:(q.x+1)*framing.renderWidth/2-GUTTER,y:(1-q.y)*framing.renderHeight/2-GUTTER};}
   function worldPoint(piece,uv){return new THREE.Vector3(...surfacePoint(uv,piece.bend.x)).sub(piece.pivot).applyMatrix4(piece.group.matrixWorld);}
   function updateProjection(){
    if(!projectionDirty||!framing)return;
    const edges=[];for(const p of pieces){p.group.updateMatrixWorld(true);p.screenEdges=p.boundary.map(s=>({a:project(worldPoint(p,s.a)),b:project(worldPoint(p,s.b))}));edges.push(...p.screenEdges);}
    bounds=getScreenBounds(edges);projectionDirty=false;
   }
   function hit(p){
    if(!framing||!withinBounds(p,bounds,4))return null;
    raycaster.setFromCamera(toNdc(p),camera);return raycaster.intersectObjects(pieces.map(piece=>piece.front),false)[0]||null;
   }
   function worldPlane(a,b){const av=new THREE.Vector3(...toNdc(a).toArray(),0).unproject(camera),bv=new THREE.Vector3(...toNdc(b).toArray(),0).unproject(camera);const normal=bv.sub(av).cross(camera.getWorldDirection(new THREE.Vector3())).normalize();return new THREE.Plane().setFromNormalAndCoplanarPoint(normal,av);}
   function clearSeam(){clearTimeout(seamTimer);seamLineGeometry.setDrawRange(0,0);seamRibbonGeometry.setDrawRange(0,0);seamDirty=false;renderDirty=true;}
   function buildSeam(){
    if(!seamDirty)return;
    seamDirty=false;
    if(!gesture||!framing){seamLineGeometry.setDrawRange(0,0);seamRibbonGeometry.setDrawRange(0,0);return;}
    const a=gesture.a,b=gesture.last,dx=b.x-a.x,dy=b.y-a.y,lenSq=dx*dx+dy*dy;if(lenSq<64){seamLineGeometry.setDrawRange(0,0);seamRibbonGeometry.setDrawRange(0,0);return;}
    const plane=worldPlane(a,b),seen=new Set();let count=0;
    const pa=new THREE.Vector3(),pb=new THREE.Vector3(),pc=new THREE.Vector3();
    for(const piece of pieces){
     const surface=piece.geometries.surface,localPlane=plane.clone().applyMatrix4(piece.group.matrixWorld.clone().invert()),attr=surface.attributes.position,index=surface.index,vertices=index?index.count:attr.count;
     for(let i=0;i<vertices&&count<MAX_SEAM;i+=3){
      const indices=index?[index.getX(i),index.getX(i+1),index.getX(i+2)]:[i,i+1,i+2];
      const verts=[pa.fromBufferAttribute(attr,indices[0]).clone(),pb.fromBufferAttribute(attr,indices[1]).clone(),pc.fromBufferAttribute(attr,indices[2]).clone()],d=verts.map(v=>localPlane.distanceToPoint(v)),cuts=[];
      for(let j=0;j<3;j++){
       const k=(j+1)%3;if(Math.abs(d[j])<1e-7)cuts.push(verts[j].clone());
       else if(d[j]*d[k]<0)cuts.push(verts[j].clone().lerp(verts[k],d[j]/(d[j]-d[k])));
      }
      const unique=cuts.filter((v,n)=>!cuts.slice(0,n).some(q=>q.distanceToSquared(v)<1e-12));if(unique.length<2)continue;
      let start=unique[0].applyMatrix4(piece.group.matrixWorld),end=unique[1].applyMatrix4(piece.group.matrixWorld);
      const s=project(start),e=project(end),ts=((s.x-a.x)*dx+(s.y-a.y)*dy)/lenSq,te=((e.x-a.x)*dx+(e.y-a.y)*dy)/lenSq;
      const lo=Math.max(0,Math.min(ts,te)),hi=Math.min(1,Math.max(ts,te));if(hi-lo<1e-5||Math.abs(te-ts)<1e-8)continue;
      const start0=start.clone(),end0=end.clone();start=start0.clone().lerp(end0,(lo-ts)/(te-ts));end=start0.clone().lerp(end0,(hi-ts)/(te-ts));
      const hash=[start.toArray().map(n=>n.toFixed(5)).join(','),end.toArray().map(n=>n.toFixed(5)).join(',')].sort().join(':');if(seen.has(hash))continue;seen.add(hash);
      const normal=verts[1].clone().sub(verts[0]).cross(verts[2].clone().sub(verts[0])).normalize().transformDirection(piece.group.matrixWorld),side=end.clone().sub(start).normalize().cross(normal).multiplyScalar(.006);
      start.addScaledVector(normal,.004);end.addScaledVector(normal,.004);
      const inkA=start.clone().addScaledVector(side,.7),inkB=end.clone().addScaledVector(side,.7);seamPositions.set([...inkA.toArray(),...inkB.toArray()],count*6);
      const corners=[start.clone().sub(side),start.clone().add(side),end.clone().add(side),end.clone().sub(side)];let at=count*18;for(const n of [0,1,2,0,2,3]){ribbonPositions.set(corners[n].toArray(),at);at+=3;}
      count++;
     }
    }
    seamLineGeometry.attributes.position.needsUpdate=seamRibbonGeometry.attributes.position.needsUpdate=true;seamLineGeometry.setDrawRange(0,count*2);seamRibbonGeometry.setDrawRange(0,count*6);root.dataset.seamSegments=String(count);renderDirty=true;
   }
   function publish(){root.dataset.pieces=String(pieces.length);root.dataset.cuts=String(cutCount);root.dataset.state=returning?'returning':pieces.length===6?'complete':pieces.length===1?'whole':'cut';root.dataset.returnReason=returnReason;root.setAttribute('aria-pressed',String(pieces.length>1));}
   function clearGesture(){clearTimeout(strokeTimer);pendingCommit=false;gesture=null;clearSeam();}
   function completeAfter(delay=1700){clearTimeout(completeTimer);if(pieces.length===6&&!returning)completeTimer=setTimeout(()=>startReturn('complete'),delay);}
   function startReturn(reason='leave'){
    clearTimeout(leaveTimer);clearTimeout(completeTimer);clearGesture();previous=null;previousHit=false;if(pieces.length===1)return;
    returning=true;returnReason=reason;beginReturn(pieces);for(const p of pieces){p.flex=0;p.bend.target=0;}publish();wake();
   }
   function cancelReturn(){
    if(!returning||returnReason==='complete')return;
    returning=false;returnReason='';interruptReturn(pieces);for(const p of pieces)p.bend.target=p.bend.x;clearGesture();previous=null;previousHit=false;publish();completeAfter();wake();
   }
   function cut(a,b,energy=1){
    updateProjection();if(pieces.length===6){deferredStroke={a,b,energy,at:performance.now()};startReturn('complete');return false;}
    const plane=worldPlane(a,b),proposals=[];
    for(const p of pieces){
     if(!crossesSegments(p.screenEdges,a,b,18))continue;
     const distance=v=>plane.distanceToPoint(new THREE.Vector3(...v).sub(p.pivot).applyMatrix4(p.group.matrixWorld));
     const parts=splitSurface(p.patches,distance,p.bend.x,.24);if(parts)proposals.push({piece:p,parts});
    }
    if(!proposals.length)return false;
    if(!fitsPieceBudget(pieces.length,proposals)){deferredStroke={a,b,energy,at:performance.now()};startReturn('complete');return false;}
    for(const {piece,parts} of proposals){
     const children=parts.map(part=>{
      const p=makePiece(part.patches,piece),lightness=Math.min(1.55,Math.sqrt(totalArea/(p.area*2))),distance=.105*lightness*energy,n=plane.normal.clone().multiplyScalar(part.side*distance);
      p.target.x+=n.x;p.target.y+=n.y;p.target.z+=n.z;p.target.rx+=part.side*.013*lightness;p.target.ry+=part.side*.012*lightness;p.target.rz+=part.side*.014*lightness;
      p.flex=part.side*.42*lightness*energy;p.bend.v+=part.side*.25*energy;p.omega=16+lightness*2;return p;
     });
     pieces.splice(pieces.indexOf(piece),1,...children);if(piece===whole)whole.group.visible=false;else disposePiece(piece);
    }
    const factor=Math.min(1,...pieces.flatMap(p=>[.43/Math.max(.001,Math.abs(p.target.x)),.24/Math.max(.001,Math.abs(p.target.y)),.16/Math.max(.001,Math.abs(p.target.z)),.06/Math.max(.001,Math.abs(p.target.rz))]));
    if(factor<1)for(const p of pieces)for(const axis of AXES)p.target[axis]*=factor;
    cutCount++;projectionDirty=renderDirty=true;publish();completeAfter();wake();return true;
   }
   function finishGesture(){pendingCommit=false;clearTimeout(strokeTimer);if(!gesture)return;const intent=strokeIntent(gesture.samples);gesture=null;clearSeam();if(intent)cut(intent.a,intent.b,intent.energy);wake();}
   function processPoint(p){
    updateProjection();trail.push(p);if(trail.length>40)trail.shift();
    if(!inside&&!gesture&&!pendingLeave){previous=null;previousHit=false;return;}
    if(returning&&inside)cancelReturn();
    const currentHit=Boolean(hit(p)),prior=previous;
    if(!gesture&&prior&&!previousHit){if(currentHit||pieces.some(piece=>crossesSegments(piece.screenEdges,prior,p,18)))gesture={samples:[prior,p],a:prior,last:p};}
    else if(gesture){gesture.samples.push(p);gesture.last=p;if(gesture.samples.length>80)gesture.samples.splice(1,1);if(p.t-gesture.a.t>2200)clearGesture();}
    if(gesture){
     gesture.last=p;seamDirty=true;clearTimeout(seamTimer);seamTimer=setTimeout(()=>{clearGesture();wake();},1400);
     if(!withinBounds(p,bounds,7))finishGesture();else if(!currentHit){clearTimeout(strokeTimer);strokeTimer=setTimeout(()=>{pendingCommit=true;wake();},95);}else{clearTimeout(strokeTimer);pendingCommit=false;}
    }
    if(!gesture&&!returning){hoverBend=currentHit?clamp((p.x/width-.5)*.16+.08,-.05,.18):0;}
    previous=p;previousHit=currentHit;
   }
   function tick(now){
    frame=0;if(disposed||!visible||document.hidden)return;
    const dt=last?Math.min((now-last)/1000,1/30):1/60;last=now;let moving=false;
    for(const p of pieces){
     const flexActive=Math.abs(p.flex)>.0002;if(flexActive){p.flex*=Math.exp(-dt*4.2);moving=true;}else p.flex=0;
     const targetBend=returning?0:inside?hoverBend+p.flex:p.bend.target;
     p.bend.target=clamp(targetBend,-.8,.8);const oldBend=p.bend.x;
     if(still.matches){if(AXES.some(k=>p.pose[k]!==p.target[k]))projectionDirty=renderDirty=true;p.pose={...p.target};p.velocity=zeroPose();p.bend.x=p.bend.target;p.bend.v=0;}
     else{if(stepPose(p,p.target,dt,returning?12:p.omega))moving=true;if(spring(p.bend,p.bend.target,dt,11))moving=true;}
     if(oldBend!==p.bend.x){updateSurfaceGeometry(p.geometries,p.patches,p.pivot,p.bend.x);projectionDirty=renderDirty=seamDirty=true;}
     applyPose(p);
    }
    if(moving||returning)projectionDirty=renderDirty=seamDirty=true;
    if(returning&&!moving){
     for(const p of pieces)if(p!==whole)disposePiece(p);pieces=[whole];whole.pose=zeroPose();whole.target=zeroPose();whole.velocity=zeroPose();whole.bend={x:0,v:0,target:0};whole.flex=0;whole.group.visible=true;updateSurfaceGeometry(whole.geometries,whole.patches,whole.pivot,0);applyPose(whole);
     returning=false;returnReason='';cutCount=0;projectionDirty=renderDirty=true;publish();const pending=deferredStroke;deferredStroke=null;if(pending&&inside&&now-pending.at<1500)cut(pending.a,pending.b,pending.energy);
    }
    updateProjection();for(const p of queue.splice(0))processPoint(p);if(pendingCommit)finishGesture();
    if(pendingLeave){clearGesture();previous=null;previousHit=false;pendingLeave=false;if(pieces.length>1)leaveTimer=setTimeout(()=>startReturn('leave'),850);}
    updateProjection();buildSeam();
    trail=trail.filter(p=>now-p.t<135);blade.setAttribute('d',trail.map((p,i)=>`${i?'L':'M'}${p.screenX.toFixed(1)} ${p.screenY.toFixed(1)}`).join(''));blade.style.opacity=trail.length>1?String(.2*Math.max(0,1-(now-trail[trail.length-1].t)/135)):0;
    root.dataset.stroke=gesture?'engaged':'ready';
    if(renderDirty){renderer.shadowMap.needsUpdate=true;renderer.render(scene,camera);renderDirty=false;}
    if(!frame&&(moving||renderDirty||queue.length||trail.length>1))frame=requestAnimationFrame(tick);
   }
   function wake(){if(!frame&&visible&&!document.hidden&&!disposed){last=0;frame=requestAnimationFrame(tick);}}
   function sample(e){const b=root.getBoundingClientRect();return{x:e.clientX-b.left,y:e.clientY-b.top,screenX:e.clientX,screenY:e.clientY,t:performance.now()};}
   function enter(e){inside=true;pendingLeave=false;queue=[];clearTimeout(leaveTimer);cancelReturn();clearGesture();previous=sample(e);updateProjection();previousHit=Boolean(hit(previous));hoverBend=.08;wake();}
   function move(e){
    if(e.pointerType==='touch'&&e.buttons===0)return;
    const now=performance.now();if(!inside&&!gesture&&now>exitTailUntil)return;
    queue.push(sample(e));if(queue.length>20)queue.splice(0,queue.length-20);wake();
   }
   function leave(e){
    inside=false;deferredStroke=null;hoverBend=0;exitTailUntil=performance.now()+220;clearTimeout(leaveTimer);clearTimeout(strokeTimer);pendingLeave=true;
    if(Number.isFinite(e.clientX)&&Number.isFinite(e.clientY))queue.push(sample(e));else{queue=[];clearGesture();}for(const p of pieces)p.bend.target=0;wake();
   }
   function keyboard(e){
    if(e.key==='Escape'){e.preventDefault();startReturn('keyboard');}
    else if(e.key==='Enter'||e.key===' '){e.preventDefault();clearTimeout(leaveTimer);cancelReturn();if(pieces.length===6)startReturn('complete');else{const angle=cutCount%3===0?0:cutCount%3===1?Math.PI/2:.58,dx=Math.cos(angle)*width,dy=Math.sin(angle)*height;cut({x:width/2-dx,y:height/2-dy},{x:width/2+dx,y:height/2+dy});}}
   }
   function resize(){
    if(getComputedStyle(canvas).position!=='absolute')return;
    const b=root.getBoundingClientRect();width=b.width;height=b.height;if(!width||!height||width>8192||height>4096)return;
    clearGesture();previous=null;previousHit=false;queue=[];trail=[];framing=fitPaperCamera(THREE,camera,seed,surfacePoint,width,height,GUTTER);renderer.setSize(framing.renderWidth,framing.renderHeight,false);
    overlay.setAttribute('viewBox',`0 0 ${window.innerWidth} ${window.innerHeight}`);projectionDirty=renderDirty=true;updateProjection();renderer.shadowMap.needsUpdate=true;renderer.render(scene,camera);renderDirty=false;
   }
   function visibility(){if(document.hidden){cancelAnimationFrame(frame);frame=0;queue=[];trail=[];clearGesture();previous=null;previousHit=false;}else wake();}
   const observer=new IntersectionObserver(entries=>{visible=entries[entries.length-1].isIntersecting;if(visible)wake();else{cancelAnimationFrame(frame);frame=0;queue=[];trail=[];clearGesture();previous=null;previousHit=false;blade.style.opacity=0;}},{threshold:.01});observer.observe(root);
   const resizer=new ResizeObserver(resize);resizer.observe(root);
   root.addEventListener('pointerenter',enter);root.addEventListener('pointerleave',leave);root.addEventListener('keydown',keyboard);root.addEventListener('blur',leave);window.addEventListener('pointermove',move,{passive:true});window.addEventListener('resize',resize);document.addEventListener('visibilitychange',visibility);still.addEventListener('change',wake);
   resize();publish();root.dataset.renderer='webgl';root.dataset.triangles=String((whole.geometries.surface.index?.count||whole.geometries.surface.attributes.position.count)/3);
   destroy=()=>{
    clearTimeout(leaveTimer);clearTimeout(completeTimer);clearTimeout(strokeTimer);clearTimeout(seamTimer);cancelAnimationFrame(frame);observer.disconnect();resizer.disconnect();root.removeEventListener('pointerenter',enter);root.removeEventListener('pointerleave',leave);root.removeEventListener('keydown',keyboard);root.removeEventListener('blur',leave);window.removeEventListener('pointermove',move);window.removeEventListener('resize',resize);document.removeEventListener('visibilitychange',visibility);still.removeEventListener('change',wake);
    for(const p of pieces)if(p!==whole)disposePiece(p);disposePiece(whole);materials.dispose();floor.geometry.dispose();floor.material.dispose();seamLineGeometry.dispose();seamRibbonGeometry.dispose();seamInkMaterial.dispose();seamLipMaterial.dispose();key.shadow.dispose();environment.dispose();renderer.dispose();queueMicrotask(()=>{if(!canvas.isConnected)renderer.forceContextLoss();});
   };
  }
  init().catch(error=>{destroy();root.dataset.renderer='unavailable';root.dataset.error=error.message;});
  return()=>{disposed=true;destroy();};
 },[]);
 return <><div ref={rootRef} className={styles.scene} data-kind="paper-v3" data-renderer="loading" role="button" tabIndex={0} aria-label="გაუსვი კურსორი ქაღალდს გასაჭრელად. Enter — გაჭრა, Escape — აღდგენა." aria-pressed="false">
  <div className={styles.poster}><Poster kind="paper"/></div><canvas ref={canvasRef} className={styles.canvas} style={{inset:-GUTTER,width:`calc(100% + ${GUTTER*2}px)`,height:`calc(100% + ${GUTTER*2}px)`}} aria-hidden="true"/>
 </div>{typeof document!=='undefined'&&createPortal(<svg ref={overlayRef} className={styles.bladeOverlay} aria-hidden="true"><path ref={bladeRef} className={styles.blade}/></svg>,document.body)}</>;
}
