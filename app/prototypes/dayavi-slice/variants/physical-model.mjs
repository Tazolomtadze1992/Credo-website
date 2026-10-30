export const AXES=['x','y','z','rx','ry','rz'];
export const zeroPose=()=>({x:0,y:0,z:0,rx:0,ry:0,rz:0});

export function inheritPieceMotion(THREE,parent,pivot){
 const childPivot=Array.isArray(pivot)?new THREE.Vector3(...pivot):pivot;
 const parentPivot=Array.isArray(parent.pivot)?new THREE.Vector3(...parent.pivot):parent.pivot;
 const delta=childPivot.clone().sub(parentPivot),inherited={};
 for(const key of ['pose','target']){
  const p=parent[key],rotated=delta.clone().applyEuler(new THREE.Euler(p.rx,p.ry,p.rz));
  inherited[key]={...p,x:p.x+rotated.x-delta.x,y:p.y+rotated.y-delta.y,z:p.z+rotated.z-delta.z};
 }
 // The child origin is a point on the moving parent, not the old origin.
 // Include its angular velocity contribution. Differentiating the actual Euler
 // transform avoids assuming Euler rates are world-space angular rates.
 const p=parent.pose,v=parent.velocity,h=1e-5;
 const plus=delta.clone().applyEuler(new THREE.Euler(p.rx+v.rx*h,p.ry+v.ry*h,p.rz+v.rz*h));
 const minus=delta.clone().applyEuler(new THREE.Euler(p.rx-v.rx*h,p.ry-v.ry*h,p.rz-v.rz*h));
 const angular=plus.sub(minus).multiplyScalar(1/(2*h));
 inherited.velocity={...v,x:v.x+angular.x,y:v.y+angular.y,z:v.z+angular.z};
 return inherited;
}

// Exact critically damped spring integration. Position and velocity survive
// target changes, so a cut or a returning sheet can be interrupted mid-flight.
export function stepPose(piece,target,dt,omega=17){
 let moving=false;
 const decay=Math.exp(-omega*dt);
 for(const key of AXES){
  const delta=piece.pose[key]-target[key],velocity=piece.velocity[key],travel=(velocity+omega*delta)*dt;
  piece.pose[key]=target[key]+(delta+travel)*decay;
  piece.velocity[key]=(velocity-omega*travel)*decay;
  if(Math.abs(piece.pose[key]-target[key])+Math.abs(piece.velocity[key])>.00015)moving=true;
  else{piece.pose[key]=target[key];piece.velocity[key]=0;}
 }
 return moving;
}

export function interruptReturn(pieces){
 for(const piece of pieces)piece.target={...piece.pose};
 return pieces;
}

export function beginReturn(pieces){
 for(const piece of pieces)piece.target=zeroPose();
 return pieces;
}
