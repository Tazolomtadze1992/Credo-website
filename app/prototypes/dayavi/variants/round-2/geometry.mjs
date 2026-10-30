export function facesGeometry(THREE,faces){
  const positions=[],normals=[],uvs=[],groups=[];
  for(const {points,normal,material=0,uv} of faces){
    const a=new THREE.Vector3(...points[0]),b=new THREE.Vector3(...points[1]),c=new THREE.Vector3(...points[2]);
    const n=new THREE.Vector3(...normal).normalize();const reverse=new THREE.Vector3().crossVectors(b.clone().sub(a),c.clone().sub(a)).dot(n)<0;
    const start=positions.length/3;
    for(let j=1;j<points.length-1;j++){
      const ids=reverse?[0,j+1,j]:[0,j,j+1];
      for(const i of ids){positions.push(...points[i]);normals.push(...normal);uvs.push(...(uv?.[i]||[points[i][0]*.2+.5,points[i][1]*.5]));}
    }
    groups.push([start,positions.length/3-start,material]);
  }
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(normals,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));for(const args of groups)g.addGroup(...args);g.computeBoundingSphere();return g;
}
export function sectorGeometry(THREE,r,y0,y1,a0,a1){
 const faces=[],segments=32,at=(angle,y)=>[r*Math.cos(angle),y,r*Math.sin(angle)];
 for(let i=0;i<segments;i++){
  const a=a0+(a1-a0)*i/segments,b=a0+(a1-a0)*(i+1)/segments,m=(a+b)/2;
  faces.push({points:[[0,y1,0],at(a,y1),at(b,y1)],normal:[0,1,0],material:0},
   {points:[at(a,y0),at(b,y0),at(b,y1),at(a,y1)],normal:[Math.cos(m),0,Math.sin(m)],material:1},
   {points:[[0,y0,0],at(b,y0),at(a,y0)],normal:[0,-1,0],material:0});
 }
 const cuts=[[a0,[Math.sin(a0),0,-Math.cos(a0)]],[a1,[-Math.sin(a1),0,Math.cos(a1)]]];
 for(const [a,normal] of cuts)faces.push({points:[[0,y0,0],at(a,y0),at(a,y1),[0,y1,0]],normal,material:2,uv:[[0,0],[1,0],[1,1],[0,1]]});
 return facesGeometry(THREE,faces);
}
