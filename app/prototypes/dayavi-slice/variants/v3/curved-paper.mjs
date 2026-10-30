// One continuous rest-space sheet drives its mesh, normals, hit tests and cuts.
// Integrating the cross-section tangent preserves paper length through a fold.
export const PAPER={width:6.4,height:2.5,columns:80,rows:12,thickness:.008};
const EPS=1e-8,KEY_SCALE=1e6;
const profileSteps=4096,profileX=new Float64Array(profileSteps+1),profileZ=new Float64Array(profileSteps+1);
let lowZ=0,highZ=0;
for(let i=1;i<=profileSteps;i++){
 const s=(i-.5)/profileSteps*PAPER.width,angle=.54*Math.tanh(1.8*Math.sin(Math.PI*s/.8)),ds=PAPER.width/profileSteps;
 profileX[i]=profileX[i-1]+Math.cos(angle)*ds;profileZ[i]=profileZ[i-1]+Math.sin(angle)*ds;
 lowZ=Math.min(lowZ,profileZ[i]);highZ=Math.max(highZ,profileZ[i]);
}
const profileCenterX=profileX[profileSteps]/2,profileCenterZ=(lowZ+highZ)/2;
function profile(u){
 const t=Math.max(0,Math.min(profileSteps,(u/PAPER.width+.5)*profileSteps)),i=Math.min(profileSteps-1,Math.floor(t)),f=t-i;
 return[profileX[i]+(profileX[i+1]-profileX[i])*f-profileCenterX,profileZ[i]+(profileZ[i+1]-profileZ[i])*f-profileCenterZ];
}
export function surfacePoint(uv,bend=0){
 const [u,v]=uv,U=u/(PAPER.width/2),V=v/(PAPER.height/2),p=profile(u);
 const bow=.105*Math.cos(U*Math.PI/2)*Math.cos(V*Math.PI/3);
 const sideCurl=.080*U**6*(.55+.45*V);
 const lip=.055*V**4*(.5+.5*Math.sin(u*.9+.2));
 return[
  p[0]+.025*V*Math.sin(U*Math.PI/2),
  v+.035*Math.sin(U*1.5+.25)+.012*U*V,
  p[1]+bow+sideCurl+lip+bend*.085*Math.sin(u*.9+.6)*V,
 ];
}
export function surfaceNormal(uv,bend=0){
 const h=.0002,u=surfacePoint([Math.min(PAPER.width/2,uv[0]+h),uv[1]],bend),l=surfacePoint([Math.max(-PAPER.width/2,uv[0]-h),uv[1]],bend),v=surfacePoint([uv[0],Math.min(PAPER.height/2,uv[1]+h)],bend),d=surfacePoint([uv[0],Math.max(-PAPER.height/2,uv[1]-h)],bend);
 const ax=u[0]-l[0],ay=u[1]-l[1],az=u[2]-l[2],bx=v[0]-d[0],by=v[1]-d[1],bz=v[2]-d[2];
 const x=ay*bz-az*by,y=az*bx-ax*bz,z=ax*by-ay*bx,n=Math.hypot(x,y,z);
 return[x/n,y/n,z/n];
}
export function seedSheet(){
 const patches=[],{width,height,columns,rows}=PAPER;
 const point=(x,y)=>[-width/2+x/columns*width,-height/2+y/rows*height];
 for(let y=0;y<rows;y++)for(let x=0;x<columns;x++){
  const a=point(x,y),b=point(x+1,y),c=point(x+1,y+1),d=point(x,y+1);
  // Alternating diagonals remove a directional bias from the silhouette and cuts.
  if((x+y)%2)patches.push({poly:[a,b,d]},{poly:[b,c,d]});else patches.push({poly:[a,b,c]},{poly:[a,c,d]});
 }
 return patches;
}
export function signedArea(poly){return poly.reduce((sum,p,i)=>{const q=poly[(i+1)%poly.length];return sum+p[0]*q[1]-q[0]*p[1];},0)/2;}
export function areaOf(patches){return patches.reduce((sum,p)=>sum+Math.abs(signedArea(p.poly)),0);}
const pointKey=p=>`${Math.round(p[0]*KEY_SCALE)},${Math.round(p[1]*KEY_SCALE)}`;
function edgeKey(a,b){const ka=pointKey(a),kb=pointKey(b);return ka<kb?`${ka}|${kb}`:`${kb}|${ka}`;}
function edgeTable(patches){
 const map=new Map();
 patches.forEach((patch,index)=>patch.poly.forEach((a,i)=>{
  const b=patch.poly[(i+1)%patch.poly.length];if(Math.hypot(a[0]-b[0],a[1]-b[1])<EPS)return;
  const key=edgeKey(a,b),entry=map.get(key);if(entry)entry.indices.push(index);else map.set(key,{a,b,indices:[index]});
 }));
 return map;
}
export function boundarySegments(patches){return Array.from(edgeTable(patches).values()).filter(edge=>edge.indices.length===1).map(({a,b})=>({a,b}));}
function connected(patches){
 const parents=patches.map((_,i)=>i),root=i=>{while(parents[i]!==i){parents[i]=parents[parents[i]];i=parents[i];}return i;};
 for(const edge of edgeTable(patches).values())if(edge.indices.length>1){const a=root(edge.indices[0]);for(let i=1;i<edge.indices.length;i++)parents[root(edge.indices[i])]=a;}
 const groups=new Map();patches.forEach((p,i)=>{const r=root(i);if(!groups.has(r))groups.set(r,[]);groups.get(r).push(p);});return Array.from(groups.values());
}
function clipPolygon(poly,distances,positive){
 const out=[],sign=positive?1:-1;
 for(let i=0;i<poly.length;i++){
  const j=(i+1)%poly.length,a=poly[i],b=poly[j],da=distances[i]*sign,db=distances[j]*sign;
  if(da>=-EPS)out.push(a);
  if((da>EPS&&db<-EPS)||(da<-EPS&&db>EPS)){const t=da/(da-db);out.push([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t]);}
 }
 return out.filter((p,i)=>{const q=out[(i+out.length-1)%out.length];return Math.hypot(p[0]-q[0],p[1]-q[1])>EPS;});
}
export function splitSurface(patches,worldDistance,bend=0,minArea=.24){
 const sides=[[],[]];let min=Infinity,max=-Infinity;
 for(const patch of patches){
  const distances=patch.poly.map(uv=>worldDistance(surfacePoint(uv,bend)));for(const d of distances){min=Math.min(min,d);max=Math.max(max,d);}
  for(let side=0;side<2;side++){const poly=clipPolygon(patch.poly,distances,side===0);if(poly.length>=3&&Math.abs(signedArea(poly))>1e-10)sides[side].push({poly});}
 }
 if(min>-EPS||max<EPS)return null;
 const result=sides.flatMap((side,i)=>connected(side).map(p=>({patches:p,side:i===0?1:-1})));
 if(result.length<2||result.some(p=>areaOf(p.patches)<minArea))return null;
 return result;
}
export function pivotOf(patches,bend=0){
 let sum=0,x=0,y=0,z=0;
 for(const {poly} of patches)for(let i=1;i<poly.length-1;i++){
  const a=poly[0],b=poly[i],c=poly[i+1],area=Math.abs((b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]))/2;
  // The displayed tessellated triangle is linear between these three vertices.
  const pa=surfacePoint(a,bend),pb=surfacePoint(b,bend),pc=surfacePoint(c,bend);sum+=area;
  x+=(pa[0]+pb[0]+pc[0])/3*area;y+=(pa[1]+pb[1]+pc[1])/3*area;z+=(pa[2]+pb[2]+pc[2])/3*area;
 }
 return[x/sum,y/sum,z/sum];
}
export function buildSurfaceGeometry(THREE,patches,pivot,bend=0){
 const rest=[],indices=[],lookup=new Map();
 function vertex(uv){const key=pointKey(uv);if(lookup.has(key))return lookup.get(key);const index=rest.length;lookup.set(key,index);rest.push(uv);return index;}
 for(const {poly} of patches)for(let i=1;i<poly.length-1;i++)indices.push(vertex(poly[0]),vertex(poly[i]),vertex(poly[i+1]));
 const surface=new THREE.BufferGeometry(),edges=new THREE.BufferGeometry(),segments=boundarySegments(patches);
 surface.setAttribute('position',new THREE.Float32BufferAttribute(rest.length*3,3));surface.setAttribute('normal',new THREE.Float32BufferAttribute(rest.length*3,3));surface.setIndex(indices);
 surface.setAttribute('uv',new THREE.Float32BufferAttribute(rest.flatMap(([u,v])=>[u/PAPER.width+.5,v/PAPER.height+.5]),2));
 edges.setAttribute('position',new THREE.Float32BufferAttribute(segments.length*18,3));
 const result={surface,edges};surface.userData.paperRest=rest;edges.userData.paperSegments=segments;
 updateSurfaceGeometry(result,patches,pivot,bend);return result;
}
export function updateSurfaceGeometry(geometries,patches,pivot,bend=0){
 const {surface,edges}=geometries,origin=Array.isArray(pivot)?pivot:[pivot.x,pivot.y,pivot.z],positions=surface.attributes.position,normals=surface.attributes.normal;
 surface.userData.paperRest.forEach((uv,i)=>{const p=surfacePoint(uv,bend),n=surfaceNormal(uv,bend);positions.setXYZ(i,p[0]-origin[0],p[1]-origin[1],p[2]-origin[2]);normals.setXYZ(i,...n);});
 positions.needsUpdate=normals.needsUpdate=true;surface.computeBoundingBox();surface.computeBoundingSphere();
 let at=0;const edgePositions=edges.attributes.position,half=PAPER.thickness/2;
 for(const {a,b} of edges.userData.paperSegments){
  const pa=surfacePoint(a,bend),pb=surfacePoint(b,bend),na=surfaceNormal(a,bend),nb=surfaceNormal(b,bend);
  const corners=[pa.map((v,i)=>v+na[i]*half-origin[i]),pa.map((v,i)=>v-na[i]*half-origin[i]),pb.map((v,i)=>v-nb[i]*half-origin[i]),pb.map((v,i)=>v+nb[i]*half-origin[i])];
  for(const i of [0,1,2,0,2,3])edgePositions.setXYZ(at++,...corners[i]);
 }
 edgePositions.needsUpdate=true;edges.computeVertexNormals();edges.computeBoundingBox();edges.computeBoundingSphere();return geometries;
}
