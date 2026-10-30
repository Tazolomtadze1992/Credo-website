// Measure the complete motion envelope once, then keep a stable camera on hover.
export function projectedBounds(THREE,group,camera){
 const bounds={minX:Infinity,maxX:-Infinity,minY:Infinity,maxY:-Infinity};
 group.updateMatrixWorld(true);camera.updateMatrixWorld(true);
 const matrix=new THREE.Matrix4();
 group.traverse(mesh=>{
  if(!mesh.isMesh||!mesh.visible||!mesh.geometry?.attributes.position)return;
  const materials=Array.isArray(mesh.material)?mesh.material:[mesh.material];
  if(materials.every(m=>m.transparent&&m.opacity===0))return;
  matrix.multiplyMatrices(camera.matrixWorldInverse,mesh.matrixWorld);
  const m=matrix.elements,p=mesh.geometry.attributes.position;
  for(let i=0;i<p.count;i++){
   const x=p.getX(i),y=p.getY(i),z=p.getZ(i);
   const px=m[0]*x+m[4]*y+m[8]*z+m[12],py=m[1]*x+m[5]*y+m[9]*z+m[13];
   bounds.minX=Math.min(bounds.minX,px);bounds.maxX=Math.max(bounds.maxX,px);
   bounds.minY=Math.min(bounds.minY,py);bounds.maxY=Math.max(bounds.maxY,py);
  }
 });
 return bounds;
}
export function measureMotionBounds(THREE,subject,camera){
 const bounds={minX:Infinity,maxX:-Infinity,minY:Infinity,maxY:-Infinity,frames:[]},oldYaw=subject.group.rotation.y;
 for(let step=0;step<=16;step++)for(const yaw of [-.07,0,.07]){
  subject.update(step/16);subject.group.rotation.y=yaw;
  const b=projectedBounds(THREE,subject.group,camera);
  bounds.frames.push({...b,halfHeight:subject.framing?subject.framing(step/16):subject.halfHeight});
  for(const key of ['minX','minY'])bounds[key]=Math.min(bounds[key],b[key]);
  for(const key of ['maxX','maxY'])bounds[key]=Math.max(bounds[key],b[key]);
 }
 // Keep the center of the contact shadow in frame as well.
 const floor=new THREE.Vector3(0,subject.floor,0).applyMatrix4(camera.matrixWorldInverse);
 bounds.minY=Math.min(bounds.minY,floor.y);bounds.maxY=Math.max(bounds.maxY,floor.y);
 subject.update(0);subject.group.rotation.y=oldYaw;subject.group.updateMatrixWorld(true);
 return bounds;
}
export function fitMotionCamera(camera,bounds,width,height,padding=26){
 const px=Math.min(padding,width*.12),py=Math.min(padding,height*.12),aspect=width/height;
 const cx=(bounds.minX+bounds.maxX)/2,cy=(bounds.minY+bounds.maxY)/2;
 let scale=1;
 for(const frame of bounds.frames){
  const x=Math.max(Math.abs(frame.minX-cx),Math.abs(frame.maxX-cx));
  const y=Math.max(Math.abs(frame.minY-cy),Math.abs(frame.maxY-cy));
  scale=Math.max(scale,y/frame.halfHeight/(1-2*py/height),x/(frame.halfHeight*aspect)/(1-2*px/width));
 }
 const framing={scale,cx,cy,aspect,paddingX:px,paddingY:py};
 applyMotionCamera(camera,framing,bounds.frames[0].halfHeight);
 return framing;
}
export function applyMotionCamera(camera,framing,baseHalfHeight){
 const hh=baseHalfHeight*framing.scale,hw=hh*framing.aspect;
 camera.left=framing.cx-hw;camera.right=framing.cx+hw;camera.top=framing.cy+hh;camera.bottom=framing.cy-hh;camera.updateProjectionMatrix();
}
