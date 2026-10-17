import * as THREE from 'three';
import { createCardRibbon } from './card-ribbon-versions/v4-cool.mjs';

/** The fourth card's exact saved wave, with mirrored UVs and no bank-card scene. */
export function createLoanRibbon({ root, canvas }) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha:true, antialias:false,
      preserveDrawingBuffer:true, powerPreference:'low-power' });
  } catch {
    root.dataset.renderer = 'fallback';
    return { dispose() {} };
  }
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(35, 1, .5, 30);
  camera.position.z = 4;
  const ribbon = createCardRibbon();
  // Mirror the field itself; keep the phone, pointer hit area and heading upright.
  const uv = ribbon.mesh.geometry.attributes.uv;
  for (let i = 0; i < uv.count; i++) uv.setX(i, 1 - uv.getX(i));
  uv.needsUpdate = true;
  scene.add(ribbon.mesh);
  const card = root.closest('.product-card');
  const finePointer = window.matchMedia('(hover:hover) and (pointer:fine)');
  let disposed=false, visible=false, lost=false, frame=0, last=0, elapsed=0, bounds;
  let x=0, y=0, targetX=0, targetY=0;
  const canPlay = () => !disposed && !lost && visible && !document.hidden;
  function requestDraw() { if (canPlay() && !frame) frame=requestAnimationFrame(draw); }
  function draw(now) {
    frame=0;
    if (!canPlay()) return;
    const moving=Math.abs(targetX-x)+Math.abs(targetY-y)>.0005;
    if (!moving && last && now-last<1000/30) { requestDraw();return; }
    const dt=last?Math.min((now-last)/1000,.05):1/60;
    last=now;elapsed+=dt;
    const blend=1-Math.exp(-dt*13);
    x+=(targetX-x)*blend;y+=(targetY-y)*blend;
    if (Math.abs(targetX-x)+Math.abs(targetY-y)<=.0005) { x=targetX;y=targetY; }
    ribbon.update(elapsed,x,y);
    renderer.render(scene,camera);
    if (root.dataset.renderer!=='live') root.dataset.renderer='live';
    requestDraw();
  }
  function resize() {
    if (disposed || lost || !root.clientWidth || !root.clientHeight) return;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
    renderer.setSize(root.clientWidth,root.clientHeight,false);
    camera.aspect=root.clientWidth/root.clientHeight;camera.updateProjectionMatrix();
    ribbon.resize(camera);bounds=null;
    requestDraw();
  }
  const clamp = value => Math.max(-1,Math.min(1,value));
  function move(event) {
    if (!finePointer.matches || event.pointerType==='touch') return;
    bounds ||= card.getBoundingClientRect();
    targetX=-clamp((event.clientX-bounds.left)/bounds.width*2-1);
    targetY=clamp((event.clientY-bounds.top)/bounds.height*2-1);
    requestDraw();
  }
  function leave() { targetX=0;targetY=0;bounds=null;requestDraw(); }
  const refreshBounds = () => { bounds=null; };
  function reconcile() {
    root.dataset.state=canPlay()?'playing':'paused';
    if (canPlay()) requestDraw();
    else { cancelAnimationFrame(frame);frame=0;last=0; }
  }
  const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(root);
  const visibilityObserver=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;reconcile();},{rootMargin:'80px'});
  visibilityObserver.observe(root);
  const contextLost = event => {
    event.preventDefault();lost=true;root.dataset.renderer='fallback';reconcile();
  };
  const contextRestored = () => { lost=false;resize();reconcile(); };
  card.addEventListener('pointermove',move,{passive:true});card.addEventListener('pointerleave',leave);
  finePointer.addEventListener('change',leave);
  window.addEventListener('scroll',refreshBounds,{passive:true,capture:true});
  document.addEventListener('visibilitychange',reconcile);
  canvas.addEventListener('webglcontextlost',contextLost);canvas.addEventListener('webglcontextrestored',contextRestored);
  resize();
  return { dispose() {
    disposed=true;cancelAnimationFrame(frame);resizeObserver.disconnect();visibilityObserver.disconnect();
    card.removeEventListener('pointermove',move);card.removeEventListener('pointerleave',leave);
    finePointer.removeEventListener('change',leave);window.removeEventListener('scroll',refreshBounds,true);
    document.removeEventListener('visibilitychange',reconcile);
    canvas.removeEventListener('webglcontextlost',contextLost);canvas.removeEventListener('webglcontextrestored',contextRestored);
    ribbon.dispose();renderer.dispose();
  } };
}
