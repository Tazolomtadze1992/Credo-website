// Convex panel clipping in the sheet's original, unfolded coordinates.
// The distance callback measures the currently displayed 3D surface, so the cut
// stays under the cursor even after earlier pieces have moved or tilted.
export const SHEET={width:6.4,height:2.5,panels:8,angle:.64};
const EPS=1e-7;
export function signedArea(poly){return poly.reduce((s,p,i)=>{const q=poly[(i+1)%poly.length];return s+p[0]*q[1]-q[0]*p[1];},0)/2;}
export function patchArea(patches){return patches.reduce((a,p)=>a+Math.abs(signedArea(p.poly)),0);}
export function initialPatches(){
 const w=SHEET.width/SHEET.panels,h=SHEET.height/2;
 return Array.from({length:SHEET.panels},(_,panel)=>{const l=-SHEET.width/2+panel*w;return{panel,poly:[[l,-h],[l+w,-h],[l+w,h],[l,h]]};});
}
export function foldedPoint(point,panel){
 const w=SHEET.width/SHEET.panels,local=point[0]+SHEET.width/2-panel*w;
 const direction=panel%2?-1:1;
 return[-SHEET.width*Math.cos(SHEET.angle)/2+(panel*w+local)*Math.cos(SHEET.angle),point[1],((panel%2?w:0)+direction*local)*Math.sin(SHEET.angle)-w*Math.sin(SHEET.angle)/2];
}
function clip(poly,dist,positive){
 const out=[];
 for(let i=0;i<poly.length;i++){
  const a=poly[i],b=poly[(i+1)%poly.length],da=dist(a)*(positive?1:-1),db=dist(b)*(positive?1:-1);
  if(da>=-EPS)out.push(a);
  if((da>EPS&&db<-EPS)||(da<-EPS&&db>EPS)){const t=da/(da-db);out.push([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t]);}
 }
 return out.filter((p,i)=>{const q=out[(i+out.length-1)%out.length];return Math.hypot(p[0]-q[0],p[1]-q[1])>EPS;});
}
function touching(a,b){
 for(let i=0;i<a.length;i++)for(let j=0;j<b.length;j++){
  const p=a[i],q=a[(i+1)%a.length],r=b[j],s=b[(j+1)%b.length],dx=q[0]-p[0],dy=q[1]-p[1],length=Math.hypot(dx,dy);
  if(length<EPS)continue;
  if(Math.abs(dx*(r[1]-p[1])-dy*(r[0]-p[0]))>1e-5*length||Math.abs(dx*(s[1]-p[1])-dy*(s[0]-p[0]))>1e-5*length)continue;
  const u=((r[0]-p[0])*dx+(r[1]-p[1])*dy)/length,v=((s[0]-p[0])*dx+(s[1]-p[1])*dy)/length;
  if(Math.min(length,Math.max(u,v))-Math.max(0,Math.min(u,v))>1e-5)return true;
 }
 return false;
}
function connected(patches){
 const seen=new Set(),groups=[];
 for(let i=0;i<patches.length;i++){
  if(seen.has(i))continue;const indices=[i],group=[];seen.add(i);
  while(indices.length){const n=indices.pop();group.push(patches[n]);for(let j=0;j<patches.length;j++)if(!seen.has(j)&&touching(patches[n].poly,patches[j].poly)){seen.add(j);indices.push(j);}}
  groups.push(group);
 }
 return groups;
}
export function splitPatches(patches,distance,minArea=.3){
 const sides=[[],[]];let min=Infinity,max=-Infinity;
 for(const patch of patches){
  const dist=p=>distance(foldedPoint(p,patch.panel));
  for(const p of patch.poly){const d=dist(p);min=Math.min(min,d);max=Math.max(max,d);}
  for(let side=0;side<2;side++){const poly=clip(patch.poly,dist,side===0);if(poly.length>=3&&Math.abs(signedArea(poly))>EPS)sides[side].push({panel:patch.panel,poly});}
 }
 if(min>-EPS||max<EPS)return null;
 const fragments=sides.flatMap((side,i)=>connected(side).map(p=>({patches:p,side:i===0?1:-1})));
 if(fragments.length<2||fragments.some(f=>patchArea(f.patches)<minArea))return null;
 return fragments;
}
export function centroid(patches){
 let sum=0,x=0,y=0,z=0;
 for(const patch of patches){const p=patch.poly;for(let i=1;i<p.length-1;i++){
  const a=p[0],b=p[i],c=p[i+1],area=Math.abs((b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]))/2;
  const v=foldedPoint([(a[0]+b[0]+c[0])/3,(a[1]+b[1]+c[1])/3],patch.panel);sum+=area;x+=v[0]*area;y+=v[1]*area;z+=v[2]*area;
 }}return[x/sum,y/sum,z/sum];
}
// All crossings of an infinite screen line must lie inside the finite stroke.
// This prevents a small movement within the sheet from cutting the whole object.
export function crossesPiece(polygons,a,b,minPixels=35){
 const dx=b.x-a.x,dy=b.y-a.y,length=Math.hypot(dx,dy);if(length<minPixels)return false;
 const crossings=[];
 for(const poly of polygons)for(let i=0;i<poly.length;i++){
  const p=poly[i],q=poly[(i+1)%poly.length],px=q.x-p.x,py=q.y-p.y,den=dx*py-dy*px;
  if(Math.abs(den)<EPS)continue;
  const ax=p.x-a.x,ay=p.y-a.y,t=(ax*py-ay*px)/den,u=(ax*dy-ay*dx)/den;
  if(u>=-EPS&&u<=1+EPS)crossings.push(t);
 }
 if(crossings.length<2)return false;
 const lo=Math.min(...crossings),hi=Math.max(...crossings);
 return lo>=-.015&&hi<=1.015&&(hi-lo)*length>=minPixels;
}
