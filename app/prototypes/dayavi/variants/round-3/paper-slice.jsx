'use client';
import {useEffect,useRef} from 'react';
import * as THREE from 'three';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {SHEET,initialPatches,foldedPoint,splitPatches,centroid,crossesPiece} from './slice-geometry.mjs';
import {P} from '../round-2/palette.mjs';
import Poster from '../round-2/poster';
import styles from './paper-slice.module.css';

const AXES=['x','y','z','rx','ry','rz'];
const zero=()=>Object.fromEntries(AXES.map(k=>[k,0]));
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));

export default function PaperSlice(){
 const rootRef=useRef(null),canvasRef=useRef(null),bladeRef=useRef(null);
 useEffect(()=>{
  const root=rootRef.current,canvas=canvasRef.current,blade=bladeRef.current;
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
   renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.VSMShadowMap;
   const scene=new THREE.Scene(),room=new RoomEnvironment(),pmrem=new THREE.PMREMGenerator(renderer),env=pmrem.fromScene(room,.03);scene.environment=env.texture;scene.environmentIntensity=.55;room.dispose();pmrem.dispose();
   scene.add(new THREE.HemisphereLight(0xffffff,P.bluePale,1.1));
   const light=new THREE.DirectionalLight(0xffffff,2.3);light.position.set(-3,8,7);light.castShadow=true;light.shadow.mapSize.set(1024,1024);light.shadow.camera.left=-6;light.shadow.camera.right=6;light.shadow.camera.top=6;light.shadow.camera.bottom=-6;light.shadow.camera.near=.5;light.shadow.camera.far=24;light.shadow.normalBias=.018;light.shadow.bias=-.00008;light.shadow.radius=4;light.shadow.blurSamples=8;scene.add(light);
   const fill=new THREE.DirectionalLight(P.bluePale,.6);fill.position.set(5,3,-3);scene.add(fill);
   const floor=new THREE.Mesh(new THREE.PlaneGeometry(30,30),new THREE.ShadowMaterial({color:P.ink,opacity:.045}));floor.rotation.x=-Math.PI/2;floor.position.y=-1.62;floor.receiveShadow=true;scene.add(floor);
   const print=document.createElement('canvas');print.width=2048;print.height=800;const ctx=print.getContext('2d');
   ctx.fillStyle='#fcfdfe';ctx.fillRect(0,0,2048,800);
   if(logo)ctx.drawImage(logo,190,130,1668,539);
   ctx.fillStyle='#e5edf1';ctx.fillRect(45,34,1958,1);ctx.fillRect(45,765,1958,1);
   const texture=new THREE.CanvasTexture(print);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
   const front=new THREE.MeshPhysicalMaterial({map:texture,color:0xffffff,roughness:.83,sheen:.24,side:THREE.FrontSide});
   const back=new THREE.MeshPhysicalMaterial({color:P.paper,roughness:.85,sheen:.24,side:THREE.BackSide});
   const edgeMaterial=new THREE.MeshStandardMaterial({color:0xd6e1e8,roughness:.9});
   const camera=new THREE.OrthographicCamera(-5,5,2,-2,.1,40);camera.position.set(.45,1.9,10);camera.lookAt(0,0,0);camera.updateMatrixWorld(true);
   let width=0,height=0,frame=0,last=0,visible=false,resetTimer=0,resetting=false,history=[],trail=[],lastCut=-Infinity,cutCount=0;
   const still=matchMedia('(prefers-reduced-motion: reduce)');

   function makePiece(patches,parent=null){
    const pivot=new THREE.Vector3(...centroid(patches)),group=new THREE.Group(),positions=[],uvs=[],edges=[];
    for(const patch of patches){
     const points=patch.poly.map(p=>new THREE.Vector3(...foldedPoint(p,patch.panel)).sub(pivot));
     for(let i=1;i<points.length-1;i++)for(const n of [0,i,i+1]){const p=points[n],uv=patch.poly[n];positions.push(p.x,p.y,p.z);uvs.push(uv[0]/SHEET.width+.5,uv[1]/SHEET.height+.5);}
     const normal=new THREE.Vector3().subVectors(points[1],points[0]).cross(new THREE.Vector3().subVectors(points[2],points[0])).normalize().multiplyScalar(.005);
     for(let i=0;i<points.length;i++){
      const a=points[i],b=points[(i+1)%points.length],corners=[a.clone().add(normal),a.clone().sub(normal),b.clone().sub(normal),b.clone().add(normal)];
      for(const n of [0,1,2,0,2,3])edges.push(...corners[n].toArray());
     }
    }
    const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));geometry.computeVertexNormals();
    for(const material of [front,back]){const mesh=new THREE.Mesh(geometry,material);mesh.castShadow=mesh.receiveShadow=true;group.add(mesh);}
    const edgeGeometry=new THREE.BufferGeometry();edgeGeometry.setAttribute('position',new THREE.Float32BufferAttribute(edges,3));edgeGeometry.computeVertexNormals();group.add(new THREE.Mesh(edgeGeometry,edgeMaterial));
    const piece={patches,pivot,group,pose:zero(),target:zero(),velocity:zero()};
    if(parent){
     // A new pivot preserves every displayed vertex at the instant of the cut.
     const delta=pivot.clone().sub(parent.pivot);
     for(const key of ['pose','target']){
      const p=parent[key],rot=new THREE.Euler(p.rx,p.ry,p.rz),offset=delta.clone().applyEuler(rot).sub(delta);
      piece[key]={...p,x:p.x+offset.x,y:p.y+offset.y,z:p.z+offset.z};
     }
     piece.velocity={...parent.velocity};
    }
    scene.add(group);applyPose(piece);return piece;
   }
   function applyPose(p){const v=p.pose;p.group.position.set(p.pivot.x+v.x,p.pivot.y+v.y,p.pivot.z+v.z);p.group.rotation.set(v.rx,v.ry,v.rz);p.group.updateMatrixWorld(true);}
   function disposePiece(p){scene.remove(p.group);const geometries=new Set();p.group.traverse(m=>{if(m.geometry)geometries.add(m.geometry);});geometries.forEach(g=>g.dispose());}
   const whole=makePiece(initialPatches());let pieces=[whole];
   const worldPoint=(p,uv,panel)=>new THREE.Vector3(...foldedPoint(uv,panel)).sub(p.pivot).applyMatrix4(p.group.matrixWorld);
   const screenPoint=v=>{const p=v.clone().project(camera);return{x:(p.x+1)*width/2,y:(1-p.y)*height/2};};
   function polygons(piece){piece.group.updateMatrixWorld(true);return piece.patches.map(p=>p.poly.map(uv=>screenPoint(worldPoint(piece,uv,p.panel))));}
   function publish(){root.dataset.pieces=String(pieces.length);root.dataset.cuts=String(cutCount);root.dataset.state=resetting?'returning':pieces.length===1?'whole':'cut';root.setAttribute('aria-pressed',String(pieces.length>1));}
   function slice(a,b){
    if(resetting||pieces.length>=6||!width||!height)return false;
    const av=new THREE.Vector3(a.x/width*2-1,1-a.y/height*2,0).unproject(camera),bv=new THREE.Vector3(b.x/width*2-1,1-b.y/height*2,0).unproject(camera);
    const normal=new THREE.Vector3().subVectors(bv,av).cross(camera.getWorldDirection(new THREE.Vector3())).normalize();
    let didCut=false;
    for(const piece of [...pieces]){
     if(!crossesPiece(polygons(piece),a,b))continue;
     const distance=v=>normal.dot(new THREE.Vector3(...v).sub(piece.pivot).applyMatrix4(piece.group.matrixWorld).sub(av));
     const result=splitPatches(piece.patches,distance,.34);
     if(!result||pieces.length+result.length-1>6)continue;
     const children=result.map(part=>{
      const p=makePiece(part.patches,piece),n=normal.clone().multiplyScalar(part.side*.16);
      p.target.x=clamp(p.target.x+n.x,-.45,.45);p.target.y=clamp(p.target.y+n.y,-.31,.31);p.target.z=clamp(p.target.z+n.z,-.16,.16);
      p.target.rx=clamp(p.target.rx+part.side*.025,-.06,.06);p.target.ry=clamp(p.target.ry+part.side*.025,-.07,.07);p.target.rz=clamp(p.target.rz+part.side*.026,-.07,.07);
      return p;
     });
     pieces.splice(pieces.indexOf(piece),1,...children);
     if(piece===whole)whole.group.visible=false;else disposePiece(piece);
     didCut=true;
    }
    if(didCut){cutCount++;publish();wake();}return didCut;
   }
   function reset(){history=[];resetting=true;for(const p of pieces)p.target=zero();publish();wake();}
   function tick(now){
    frame=0;if(disposed||!visible||document.hidden)return;
    const dt=last?Math.min((now-last)/1000,1/30):1/60;last=now;let moving=false;
    for(const p of pieces){
     for(const k of AXES){
      if(still.matches){p.pose[k]=p.target[k];p.velocity[k]=0;continue;}
      const omega=resetting?12:17,delta=p.pose[k]-p.target[k],v=p.velocity[k],decay=Math.exp(-omega*dt),t=(v+omega*delta)*dt;
      p.pose[k]=p.target[k]+(delta+t)*decay;p.velocity[k]=(v-omega*t)*decay;
      if(Math.abs(p.pose[k]-p.target[k])+Math.abs(p.velocity[k])>.00015)moving=true;else{p.pose[k]=p.target[k];p.velocity[k]=0;}
     }
     applyPose(p);
    }
    if(resetting&&!moving){for(const p of pieces)if(p!==whole)disposePiece(p);pieces=[whole];whole.pose=zero();whole.target=zero();whole.velocity=zero();whole.group.visible=true;applyPose(whole);resetting=false;cutCount=0;publish();}
    trail=trail.filter(p=>now-p.t<155);
    blade.setAttribute('d',trail.map((p,i)=>`${i?'L':'M'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(''));
    blade.style.opacity=trail.length>1?String(.26*Math.max(0,1-(now-trail[trail.length-1].t)/155)):0;
    renderer.render(scene,camera);if(moving||trail.length>1)frame=requestAnimationFrame(tick);
   }
   function wake(){if(!frame&&visible&&!document.hidden&&!disposed){last=0;frame=requestAnimationFrame(tick);}}
   function move(e){
    if(e.pointerType==='touch'&&e.buttons===0)return;
    clearTimeout(resetTimer);
    const rect=root.getBoundingClientRect(),p={x:e.clientX-rect.left,y:e.clientY-rect.top,t:performance.now()};
    trail.push(p);if(trail.length>32)trail.shift();history=history.filter(a=>p.t-a.t<1200);history.push(p);
    if(p.t-lastCut>180&&!resetting){
     // Try the shortest complete crossing first. Tiny in-place cursor motions do nothing.
     for(let i=history.length-2;i>=0;i--){const a=history[i],distance=Math.hypot(p.x-a.x,p.y-a.y);if(distance<45||distance/Math.max(1,p.t-a.t)<.22)continue;
      if(history.slice(i+1,-1).some(q=>Math.abs((p.x-a.x)*(q.y-a.y)-(p.y-a.y)*(q.x-a.x))/distance>14))continue;
      if(slice(a,p)){lastCut=p.t;history=[p];break;}
     }
    }
    wake();
   }
   function enter(){clearTimeout(resetTimer);history=[];}
   function leave(){history=[];clearTimeout(resetTimer);if(pieces.length>1)resetTimer=setTimeout(reset,650);}
   function keyboard(e){
    if(e.key==='Escape'){e.preventDefault();clearTimeout(resetTimer);reset();}
    else if(e.key==='Enter'||e.key===' '){e.preventDefault();clearTimeout(resetTimer);
     if(pieces.length>=6)reset();else{const angle=cutCount%3===0?0:cutCount%3===1?Math.PI/2:.58,dx=Math.cos(angle)*width,dy=Math.sin(angle)*height;slice({x:width/2-dx,y:height/2-dy},{x:width/2+dx,y:height/2+dy});}
    }
   }
   function resize(){
    const rect=root.getBoundingClientRect();width=rect.width;height=rect.height;if(!width||!height)return;
    history=[];renderer.setSize(width,height,false);root.querySelector('svg[data-blade]').setAttribute('viewBox',`0 0 ${width} ${height}`);
    // Reserve the full separation envelope; the camera never jumps after a cut.
    const aspect=width/height,hh=Math.max(1.83,3.0/aspect),hw=hh*aspect;camera.left=-hw;camera.right=hw;camera.top=hh;camera.bottom=-hh;camera.updateProjectionMatrix();
    renderer.render(scene,camera);
   }
   function visibility(){if(document.hidden){cancelAnimationFrame(frame);frame=0;}else wake();}
   const observer=new IntersectionObserver(entries=>{visible=entries[entries.length-1].isIntersecting;if(visible)wake();else{cancelAnimationFrame(frame);frame=0;}},{threshold:.01});observer.observe(root);
   const resizer=new ResizeObserver(resize);resizer.observe(root);
   root.addEventListener('pointerenter',enter);root.addEventListener('pointermove',move,{passive:true});root.addEventListener('pointerleave',leave);root.addEventListener('keydown',keyboard);root.addEventListener('blur',leave);
   document.addEventListener('visibilitychange',visibility);still.addEventListener('change',wake);
   resize();publish();root.dataset.renderer='webgl';
   destroy=()=>{clearTimeout(resetTimer);cancelAnimationFrame(frame);observer.disconnect();resizer.disconnect();root.removeEventListener('pointerenter',enter);root.removeEventListener('pointermove',move);root.removeEventListener('pointerleave',leave);root.removeEventListener('keydown',keyboard);root.removeEventListener('blur',leave);document.removeEventListener('visibilitychange',visibility);still.removeEventListener('change',wake);
    for(const p of pieces)if(p!==whole)disposePiece(p);disposePiece(whole);front.dispose();back.dispose();edgeMaterial.dispose();texture.dispose();floor.geometry.dispose();floor.material.dispose();light.shadow.dispose();env.dispose();renderer.dispose();queueMicrotask(()=>{if(!canvas.isConnected)renderer.forceContextLoss();});};
  }
  init().catch(error=>{destroy();root.dataset.renderer='unavailable';root.dataset.error=error.message;});
  return()=>{disposed=true;destroy();};
 },[]);
 return <div ref={rootRef} className={styles.scene} data-kind="slice" data-renderer="loading" role="button" tabIndex={0} aria-label="გაუსვი კურსორი ქაღალდს გასაჭრელად. Enter — გაჭრა, Escape — აღდგენა." aria-pressed="false">
  <div className={styles.poster}><Poster kind="paper"/></div>
  <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true"/>
  <svg className={styles.trail} data-blade aria-hidden="true"><path ref={bladeRef} className={styles.blade}/></svg>
 </div>;
}
