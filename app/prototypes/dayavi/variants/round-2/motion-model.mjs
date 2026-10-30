export const PARTS=8;
export const clamp=x=>Math.max(0,Math.min(1,x));
export const smooth=(a,b,x)=>{const t=clamp((x-a)/(b-a));return t*t*(3-2*t);};
export function paperPose(p){return {cut:smooth(.03,.54,p),split:smooth(.59,.99,p),ink:1-smooth(.55,.75,p)};}
export function settle(s,target,dt,tau=.18){
  const w=1/tau;
  for(let i=0;i<4;i++){s.v+=(w*w*(target-s.x)-2*w*s.v)*dt/4;s.x+=s.v*dt/4;}
  if(Math.abs(target-s.x)<.00015&&Math.abs(s.v)<.00015){s.x=target;s.v=0;}
  return s.x!==target||s.v!==0;
}
export function cakeSpread(p,i){return smooth(.02+i*.009,.91+i*.009,p);}
