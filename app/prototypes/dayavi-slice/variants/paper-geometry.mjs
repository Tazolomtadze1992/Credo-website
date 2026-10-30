// Work in the original sheet coordinates. Adjacent pleats share boundaries in
// this space even when their normals differ in 3D. Only the unshared spans get
// a thickness wall; an internal fold is not a separate strip of cardboard.
const EPSILON=1e-6;
const cross=(ax,ay,bx,by)=>ax*by-ay*bx;

export function exposedEdges(patches,epsilon=EPSILON){
 const edges=[];
 patches.forEach((patch,patchIndex)=>{
  patch.poly.forEach((a,i)=>{
   const b=patch.poly[(i+1)%patch.poly.length],dx=b[0]-a[0],dy=b[1]-a[1],length=Math.hypot(dx,dy);
   if(length>epsilon)edges.push({panel:patch.panel,patchIndex,a,b,dx,dy,length});
  });
 });
 const exposed=[];
 for(const edge of edges){
  const {a,dx,dy,length}=edge,covered=[];
  for(const other of edges){
   if(other.patchIndex===edge.patchIndex)continue;
   if(Math.abs(cross(dx,dy,other.a[0]-a[0],other.a[1]-a[1]))>epsilon*length||Math.abs(cross(dx,dy,other.b[0]-a[0],other.b[1]-a[1]))>epsilon*length)continue;
   const project=p=>((p[0]-a[0])*dx+(p[1]-a[1])*dy)/length;
   const t0=project(other.a),t1=project(other.b),start=Math.max(0,Math.min(t0,t1)),end=Math.min(length,Math.max(t0,t1));
   if(end-start>epsilon)covered.push([start,end]);
  }
  covered.sort((x,y)=>x[0]-y[0]);
  const point=t=>[a[0]+dx*t/length,a[1]+dy*t/length];
  let cursor=0;
  const add=(start,end)=>{if(end-start>epsilon)exposed.push({panel:edge.panel,patchIndex:edge.patchIndex,a:point(start),b:point(end)});};
  for(const [start,end] of covered){if(start>cursor+epsilon)add(cursor,start);cursor=Math.max(cursor,end);}
  add(cursor,length);
 }
 return exposed;
}

export function buildPaperGeometry(THREE,patches,pivot,foldedPoint,{width=6.4,height=2.5,thickness=.006}={}){
 const positions=[],uvs=[],edgePositions=[],normals=new Map();
 const origin=Array.isArray(pivot)?new THREE.Vector3(...pivot):pivot;
 const vertex=(uv,panel)=>new THREE.Vector3(...foldedPoint(uv,panel)).sub(origin);
 for(const patch of patches){
  const points=patch.poly.map(uv=>vertex(uv,patch.panel));
  if(points.length<3)continue;
  // Locate a nondegenerate triangle; clipping may leave collinear boundary points.
  let normal;
  for(let i=1;i<points.length-1;i++){
   const n=points[i].clone().sub(points[0]).cross(points[i+1].clone().sub(points[0]));
   if(n.lengthSq()>1e-16){normal=n.normalize();break;}
  }
  if(!normal)continue;
  normals.set(patch.panel,normal);
  for(let i=1;i<points.length-1;i++)for(const index of [0,i,i+1]){
   positions.push(...points[index].toArray());
   const uv=patch.poly[index];uvs.push(uv[0]/width+.5,uv[1]/height+.5);
  }
 }
 for(const edge of exposedEdges(patches)){
  const normal=normals.get(edge.panel)?.clone().multiplyScalar(thickness/2);
  if(!normal)continue;
  const a=vertex(edge.a,edge.panel),b=vertex(edge.b,edge.panel);
  const corners=[a.clone().add(normal),a.clone().sub(normal),b.clone().sub(normal),b.clone().add(normal)];
  for(const index of [0,1,2,0,2,3])edgePositions.push(...corners[index].toArray());
 }
 const surface=new THREE.BufferGeometry();
 surface.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
 surface.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));
 surface.computeVertexNormals();
 const edges=new THREE.BufferGeometry();
 edges.setAttribute('position',new THREE.Float32BufferAttribute(edgePositions,3));
 edges.computeVertexNormals();
 return{surface,edges};
}
