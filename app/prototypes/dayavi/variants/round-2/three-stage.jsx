'use client';
import {useEffect,useRef} from 'react';
import * as THREE from 'three';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {settle} from './motion-model.mjs';
import {P} from './palette.mjs';
import {measureMotionBounds,fitMotionCamera,applyMotionCamera} from './framing.mjs';
import {makeCake} from './cake-scene.mjs';
import {makePaper} from './paper-scene.mjs';
import {makeOrb} from './orb-scene.mjs';
import Poster from './poster';
import {attachPosterMotion} from './poster-motion.mjs';
import styles from './stage.module.css';

const builders={cake:makeCake,paper:makePaper,orb:makeOrb};
const labels={cake:'ტორტის რვა თანაბარ ნაწილად დაყოფა',paper:'დაკეცილი ქაღალდის ორ ნაწილად გაყოფა',orb:'ფაიფურის სფეროს რვა თანაბარ ნაწილად გახსნა'};

export default function ThreeStage({kind}){
  const rootRef=useRef(null),canvasRef=useRef(null);
  useEffect(()=>{
    const root=rootRef.current,canvas=canvasRef.current,still=matchMedia('(prefers-reduced-motion: reduce)');
    let disposed=false,destroy=()=>{};
    async function init(){
      await Promise.resolve();
      if(disposed)return;
      let logo=null;
      if(kind==='paper') logo=await new Promise(resolve=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>resolve(null);img.src='/assets/dayavi/dayavi-mark.png';});
      if(disposed)return;
      const context=canvas.getContext('webgl2',{alpha:true,antialias:true,powerPreference:'low-power'});
      if(!context){root.dataset.renderer='fallback';destroy=attachPosterMotion(root);return;}
      const renderer=new THREE.WebGLRenderer({canvas,context,alpha:true,antialias:true,powerPreference:'low-power'});
      renderer.setClearColor(0xffffff,0);renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.75));
      renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.NeutralToneMapping;renderer.toneMappingExposure=.95;
      renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.VSMShadowMap;
      const scene=new THREE.Scene();
      const pmrem=new THREE.PMREMGenerator(renderer),room=new RoomEnvironment();
      const environment=pmrem.fromScene(room,.03);scene.environment=environment.texture;scene.environmentIntensity=.55;room.dispose();pmrem.dispose();
      scene.add(new THREE.HemisphereLight(0xffffff,P.bluePale,1.05));
      const key=new THREE.DirectionalLight(0xffffff,2.4);key.position.set(-3.5,8,7);key.castShadow=true;
      key.shadow.mapSize.set(1024,1024);key.shadow.camera.left=-7;key.shadow.camera.right=7;key.shadow.camera.top=7;key.shadow.camera.bottom=-7;
      key.shadow.camera.near=.5;key.shadow.camera.far=24;key.shadow.normalBias=.025;key.shadow.bias=-.00008;key.shadow.radius=4;key.shadow.blurSamples=8;scene.add(key);
      const fill=new THREE.DirectionalLight(P.bluePale,.8);fill.position.set(5,3,-3);scene.add(fill);
      const subject=builders[kind]({THREE,logo});scene.add(subject.group);
      const floor=new THREE.Mesh(new THREE.PlaneGeometry(40,40),new THREE.ShadowMaterial({color:P.ink,opacity:.025}));
      floor.rotation.x=-Math.PI/2;floor.position.y=subject.floor;floor.receiveShadow=true;scene.add(floor);
      const shadowCanvas=document.createElement('canvas');shadowCanvas.width=shadowCanvas.height=128;const sc=shadowCanvas.getContext('2d');const gradient=sc.createRadialGradient(64,64,3,64,64,62);gradient.addColorStop(0,'rgba(27,52,65,.23)');gradient.addColorStop(.42,'rgba(27,52,65,.14)');gradient.addColorStop(1,'rgba(27,52,65,0)');sc.fillStyle=gradient;sc.fillRect(0,0,128,128);
      const contact=new THREE.Mesh(new THREE.PlaneGeometry(subject.shadowSize||5.8,subject.shadowSize||5.8),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(shadowCanvas),transparent:true,depthWrite:false,opacity:kind==='paper'?.48:.7}));contact.rotation.x=-Math.PI/2;contact.position.y=subject.floor+.005;scene.add(contact);
      const camera=new THREE.OrthographicCamera(-6,6,3,-3,.1,50);
      camera.position.set(...subject.camera);camera.lookAt(...(subject.lookAt||[0,0,0]));
      const motionBounds=measureMotionBounds(THREE,subject,camera);
      let frame=0,last=0,visible=false,hover=false,latched=false,yaw=0,targetYaw=0,framing=null;
      const progress={x:0,v:0};
      const draw=()=>{subject.group.rotation.y=yaw;subject.update(progress.x);if(framing)applyMotionCamera(camera,framing,subject.framing?subject.framing(progress.x):subject.halfHeight);root.dataset.progress=progress.x.toFixed(3);renderer.render(scene,camera);};
      const target=()=>hover||latched?1:0;
      function tick(now){
        frame=0;if(disposed||!visible||document.hidden)return;
        const dt=last?Math.min((now-last)/1000,1/30):1/60;last=now;
        let moving;
        if(still.matches){progress.x=target();progress.v=0;yaw=targetYaw;moving=false;}
        else{moving=settle(progress,target(),dt,kind==='paper'?.26:.17);yaw+=(targetYaw-yaw)*(1-Math.exp(-dt/.22));if(Math.abs(targetYaw-yaw)<.0001)yaw=targetYaw;}
        draw();if(moving||yaw!==targetYaw)frame=requestAnimationFrame(tick);
      }
      const run=()=>{if(!frame&&visible&&!document.hidden&&!disposed){last=0;frame=requestAnimationFrame(tick);}};
      const state=()=>{root.setAttribute('aria-pressed',String(Boolean(target())));run();};
      const enter=e=>{if(e.pointerType==='touch')return;hover=true;state();};
      const leave=()=>{hover=false;targetYaw=0;state();};
      const move=e=>{if(e.pointerType==='touch'||still.matches)return;const b=root.getBoundingClientRect();targetYaw=((e.clientX-b.left)/b.width-.5)*.13;run();};
      const up=e=>{if(e.pointerType==='touch'){latched=!latched;state();}};
      const keydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();latched=!latched;state();}else if(e.key==='Escape'){latched=false;hover=false;state();}};
      const visibility=()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;}else run();};
      const resize=()=>{const b=root.getBoundingClientRect();if(!b.width||!b.height)return;renderer.setSize(b.width,b.height,false);framing=fitMotionCamera(camera,motionBounds,b.width,b.height);root.dataset.framePadding=framing.paddingY.toFixed(0);draw();};
      const reduction=()=>{progress.x=target();progress.v=0;draw();run();};
      const observer=new IntersectionObserver(entries=>{visible=entries[entries.length-1].isIntersecting;if(visible)run();else{cancelAnimationFrame(frame);frame=0;}},{threshold:.01});observer.observe(root);
      const resizer=new ResizeObserver(resize);resizer.observe(root);
      root.addEventListener('pointerenter',enter);root.addEventListener('pointerleave',leave);root.addEventListener('pointermove',move,{passive:true});root.addEventListener('pointerup',up);root.addEventListener('keydown',keydown);
      document.addEventListener('visibilitychange',visibility);still.addEventListener('change',reduction);
      resize();root.dataset.renderer='webgl';root.dataset.parts=String(subject.parts);
      destroy=()=>{cancelAnimationFrame(frame);observer.disconnect();resizer.disconnect();root.removeEventListener('pointerenter',enter);root.removeEventListener('pointerleave',leave);root.removeEventListener('pointermove',move);root.removeEventListener('pointerup',up);root.removeEventListener('keydown',keydown);document.removeEventListener('visibilitychange',visibility);still.removeEventListener('change',reduction);
        const geometries=new Set(),materials=new Set(),textures=new Set();scene.traverse(n=>{if(n.geometry)geometries.add(n.geometry);if(n.material)for(const m of Array.isArray(n.material)?n.material:[n.material]){materials.add(m);for(const v of Object.values(m))if(v?.isTexture)textures.add(v);}});geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());environment.dispose();renderer.dispose();queueMicrotask(()=>{if(!canvas.isConnected)renderer.forceContextLoss();});};
    }
    init().catch(error=>{destroy();root.dataset.renderer='fallback';root.dataset.error=error.message;destroy=attachPosterMotion(root);});
    return()=>{disposed=true;destroy();};
  },[kind]);
  return <div ref={rootRef} className={styles.scene} data-renderer="loading" data-kind={kind} role="button" tabIndex={0} aria-label={labels[kind]} aria-pressed="false"><div className={styles.poster}><Poster kind={kind}/></div><canvas ref={canvasRef} className={styles.canvas} aria-hidden="true"/></div>;
}
