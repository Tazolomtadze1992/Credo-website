import {P} from './palette.mjs';
import {smooth} from './motion-model.mjs';
import {facesGeometry} from './geometry.mjs';

export function makeOrb({THREE}){
 const group=new THREE.Group(),pieces=[],r=1.42;
 const outer=new THREE.MeshPhysicalMaterial({color:P.blue,roughness:.40,metalness:0,clearcoat:.28,clearcoatRoughness:.45,envMapIntensity:.55});
 const inner=new THREE.MeshPhysicalMaterial({color:P.coral,roughness:.68,metalness:0,envMapIntensity:.4});
 for(const sx of [-1,1])for(const sy of [-1,1])for(const sz of [-1,1]){
  const positions=[],normals=[],uvs=[],N=44;
  const at=(a,b)=>[sx*r*Math.sin(a)*Math.cos(b),sy*r*Math.cos(a),sz*r*Math.sin(a)*Math.sin(b)];
  const tri=(ps)=>{const a=new THREE.Vector3(...ps[0]),b=new THREE.Vector3(...ps[1]),c=new THREE.Vector3(...ps[2]);const centre=a.clone().add(b).add(c);if(b.clone().sub(a).cross(c.clone().sub(a)).dot(centre)<0)ps=[ps[0],ps[2],ps[1]];for(const p of ps){positions.push(...p);normals.push(...p.map(x=>x/r));uvs.push(0,0);}};
  for(let i=0;i<N;i++)for(let j=0;j<N;j++){const a=i/N*Math.PI/2,b=j/N*Math.PI/2,aa=(i+1)/N*Math.PI/2,bb=(j+1)/N*Math.PI/2;tri([at(a,b),at(aa,b),at(aa,bb)]);if(i>0)tri([at(a,b),at(aa,bb),at(a,bb)]);}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(normals,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));
  const piece=new THREE.Group(),shell=new THREE.Mesh(g,outer);shell.castShadow=true;shell.receiveShadow=true;piece.add(shell);
  const faces=[];
  for(let axis=0;axis<3;axis++){
   const other=[0,1,2].filter(a=>a!==axis),signs=[sx,sy,sz],normal=[0,0,0];normal[axis]=-signs[axis];
   const points=[[0,0,0]];
   for(let i=0;i<=N;i++){const p=[0,0,0],t=i/N*Math.PI/2;p[other[0]]=signs[other[0]]*r*Math.cos(t);p[other[1]]=signs[other[1]]*r*Math.sin(t);points.push(p);}
   faces.push({points,normal,material:0});
  }
  const cut=new THREE.Mesh(facesGeometry(THREE,faces),inner);cut.castShadow=true;cut.receiveShadow=true;piece.add(cut);group.add(piece);pieces.push({piece,sx,sy,sz});
 }
 return {group,parts:8,camera:[6,4.8,8],lookAt:[0,-.2,0],halfHeight:1.65,framing:p=>1.65+smooth(0,1,p)*.60,shadowSize:4.3,floor:-2.2,
  update(p){group.position.y=-.22;const gap=smooth(.02,.99,p)*.46;pieces.forEach(({piece,sx,sy,sz})=>piece.position.set(sx*gap,sy*gap,sz*gap));}};
}
