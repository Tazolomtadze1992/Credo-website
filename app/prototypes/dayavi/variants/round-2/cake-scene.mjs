import {P} from './palette.mjs';
import {PARTS,cakeSpread} from './motion-model.mjs';
import {sectorGeometry} from './geometry.mjs';

export function makeCake({THREE}){
 const group=new THREE.Group(),slices=[];
 const mat=(color,extra={})=>new THREE.MeshPhysicalMaterial({color,roughness:.65,metalness:0,envMapIntensity:.5,...extra});
 const cream=mat(P.cream,{roughness:.84}),icing=mat(P.cream,{roughness:.7}),jam=mat(P.jam,{roughness:.28,clearcoat:.25}),glaze=mat(P.coral,{roughness:.28,clearcoat:.42,clearcoatRoughness:.3});
 const grain=document.createElement('canvas');grain.width=grain.height=128;const gc=grain.getContext('2d');
 gc.fillStyle=`#${P.sponge.toString(16).padStart(6,'0')}`;gc.fillRect(0,0,128,128);
 let seed=84;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
 for(let i=0;i<1800;i++){const a=.025+rand()*.11;gc.fillStyle=`rgba(106,73,36,${a})`;gc.beginPath();gc.ellipse(rand()*128,rand()*128,.3+rand()*1.25,.2+rand()*.6,rand()*Math.PI,0,Math.PI*2);gc.fill();}
 const spongeMap=new THREE.CanvasTexture(grain);spongeMap.colorSpace=THREE.SRGBColorSpace;spongeMap.wrapS=spongeMap.wrapT=THREE.RepeatWrapping;
 const sponge=mat(0xffffff,{map:spongeMap,bumpMap:spongeMap,bumpScale:.006,roughness:.97});
 const berryMat=mat(P.coralDeep,{roughness:.42,clearcoat:.2});
 function mesh(geometry,material,parent=group){const m=new THREE.Mesh(geometry,material);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
 const plate=mat(P.bluePale,{roughness:.31,clearcoat:.42}),edge=mat(P.blue,{roughness:.37,clearcoat:.3});
 mesh(new THREE.CylinderGeometry(2.74,2.68,.09,128),plate).position.y=.015;
 mesh(new THREE.CylinderGeometry(2.68,2.62,.055,128),edge).position.y=-.045;
 mesh(new THREE.CylinderGeometry(1.77,1.74,.045,96),edge).position.y=-.085;
 const rim=mesh(new THREE.TorusGeometry(2.65,.042,12,144),mat(P.blue,{roughness:.35}));rim.rotation.x=Math.PI/2;rim.position.y=.07;
 const dollopGeometry=new THREE.LatheGeometry([[0,0],[.15,0],[.18,.04],[.15,.10],[.13,.16],[.08,.23],[.025,.29],[0,.3]].map(p=>new THREE.Vector2(...p)),40);
 const dp=dollopGeometry.attributes.position;
 for(let i=0;i<dp.count;i++){const x=dp.getX(i),z=dp.getZ(i),a=Math.atan2(z,x),r=1+.075*Math.cos(a*8+dp.getY(i)*8);dp.setXYZ(i,x*r,dp.getY(i),z*r);}dollopGeometry.computeVertexNormals();
 const bubbleGeometry=new THREE.SphereGeometry(.049,10,8);
 const layers=[
  [.10,.36,sponge],[.36,.405,jam],[.405,.50,cream],[.50,.76,sponge],[.76,.805,jam],[.805,.90,cream],[.90,1.13,sponge],[1.13,1.19,glaze],
 ];
 for(let i=0;i<PARTS;i++){
  const piece=new THREE.Group();group.add(piece);const a0=i*Math.PI/4+.00012,a1=(i+1)*Math.PI/4-.00012,angle=(a0+a1)/2;
  for(const [y0,y1,material] of layers)mesh(sectorGeometry(THREE,2,y0,y1,a0,a1),[material,material===glaze?glaze:icing,material],piece);
  const rolled=mesh(new THREE.TorusGeometry(1.975,.025,8,40,a1-a0),glaze,piece);rolled.rotation.x=Math.PI/2;rolled.rotation.z=a0;rolled.position.y=1.165;
  const rosette=mesh(dollopGeometry,cream,piece);rosette.position.set(Math.cos(angle)*1.47,1.185,Math.sin(angle)*1.47);rosette.rotation.y=angle;
  const berry=new THREE.Group();berry.position.set(Math.cos(angle)*1.47,1.46,Math.sin(angle)*1.47);berry.rotation.z=.13;piece.add(berry);
  for(let ring=0;ring<3;ring++)for(let j=0;j<6;j++){const a=j*Math.PI/3+(ring%2)*.3,r=.085*(1-ring*.25);const bead=mesh(bubbleGeometry,berryMat,berry);bead.position.set(r*Math.cos(a),ring*.064,r*Math.sin(a));bead.scale.setScalar(1-ring*.10);}
  slices.push({piece,angle});
 }
 return {group,parts:8,camera:[6.5,6.8,9],lookAt:[0,.47,0],halfHeight:1.8,floor:-.115,
  update(p){slices.forEach(({piece,angle},i)=>{const spread=cakeSpread(p,i)*.55;piece.position.set(Math.cos(angle)*spread,0,Math.sin(angle)*spread);});}};
}
