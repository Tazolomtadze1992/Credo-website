import {P} from './palette.mjs';
import {paperPose,clamp} from './motion-model.mjs';
export function makePaper({THREE,logo}){
 const group=new THREE.Group(),halves=[new THREE.Group(),new THREE.Group()],panels=[],lines=[];halves.forEach(x=>group.add(x));
 const count=8,width=.88,height=2.48;
 const back=new THREE.MeshPhysicalMaterial({color:P.paper,roughness:.8,side:THREE.BackSide,sheen:.25});
 const cutMat=new THREE.MeshBasicMaterial({color:P.coral,transparent:true,opacity:.75,depthWrite:false});
 function print(i){const c=document.createElement('canvas');c.width=256;c.height=640;const cx=c.getContext('2d');cx.fillStyle='#fbfdfe';cx.fillRect(0,0,256,640);if(logo)cx.drawImage(logo,270-i*256,126,1500,485);
  cx.fillStyle='#d9e5ed';cx.fillRect(18,18,220,1);cx.fillRect(18,620,220,1);
  const texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=8;return texture;}
 for(let i=0;i<count;i++){
  const texture=print(i),front=new THREE.MeshPhysicalMaterial({color:0xffffff,map:texture,roughness:.83,metalness:0,sheen:.26,side:THREE.FrontSide});
  for(let half=0;half<2;half++){
   const panel=new THREE.Group(),geometry=new THREE.PlaneGeometry(width,height/2,16,8),uv=geometry.attributes.uv;
   for(let v=0;v<uv.count;v++)uv.setY(v,uv.getY(v)*.5+(half===0?.5:0));
   const pos=geometry.attributes.position;for(let v=0;v<pos.count;v++){const x=pos.getX(v);pos.setZ(v,Math.sin((x/width+.5)*Math.PI)*.023);}geometry.computeVertexNormals();
   const face=new THREE.Mesh(geometry,front),reverse=new THREE.Mesh(geometry,back);face.castShadow=reverse.castShadow=true;face.receiveShadow=reverse.receiveShadow=true;panel.add(face,reverse);
   const edge=new THREE.Mesh(new THREE.BoxGeometry(width,.009,.009),new THREE.MeshStandardMaterial({color:P.creamSide,roughness:.9}));edge.position.y=half===0?-height/4:height/4;panel.add(edge);
   halves[half].add(panel);panels.push({panel,i,half});
  }
  const line=new THREE.Mesh(new THREE.PlaneGeometry(width,.014),cutMat.clone());group.add(line);lines.push(line);
 }
 return {group,parts:2,camera:[.8,3.1,10],lookAt:[0,-.04,0],halfHeight:1.52,framing:p=>1.52+paperPose(p).split*.5,shadowSize:4.2,floor:-1.92,
  update(p){const pose=paperPose(p),angle=1.16-pose.split*.15,span=count*width*Math.cos(angle);let x=-span/2,z=width*Math.sin(angle)/2;
   for(let i=0;i<count;i++){
    const theta=i%2?-angle:angle,cx=x+width/2*Math.cos(theta),cz=z-width/2*Math.sin(theta);
    for(let half=0;half<2;half++){const item=panels[i*2+half];item.panel.rotation.y=theta;item.panel.position.set(cx,(half===0?1:-1)*(height/4+pose.split*.47),cz);}
    const amount=clamp(pose.cut*count-i),line=lines[i];line.rotation.y=theta;const localX=(amount-1)*width/2;line.position.set(cx+Math.cos(theta)*localX+Math.sin(theta)*.028,0,cz-Math.sin(theta)*localX+Math.cos(theta)*.028);line.scale.x=amount;line.material.opacity=pose.ink*.8;
    x+=width*Math.cos(theta);z-=width*Math.sin(theta);
   }
  }};
}
