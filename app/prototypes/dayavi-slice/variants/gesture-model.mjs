export function pointInPolygons(polygons,p){
 return polygons.some(poly=>{let inside=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){
  const a=poly[i],b=poly[j];if((a.y>p.y)!==(b.y>p.y)&&p.x<(b.x-a.x)*(p.y-a.y)/(b.y-a.y)+a.x)inside=!inside;
 }return inside;});
}
export function withinBounds(p,b,padding=5){return p.x>=b.minX-padding&&p.x<=b.maxX+padding&&p.y>=b.minY-padding&&p.y<=b.maxY+padding;}
export function strokeIntent(samples){
 if(samples.length<2)return null;
 const a=samples[0],b=samples[samples.length-1],dx=b.x-a.x,dy=b.y-a.y,span=Math.hypot(dx,dy),duration=Math.max(1,b.t-a.t);
 if(span<20||duration>2200||span/duration<.065)return null;
 let travel=0,deviation=0;
 for(let i=1;i<samples.length;i++){
  travel+=Math.hypot(samples[i].x-samples[i-1].x,samples[i].y-samples[i-1].y);
  deviation=Math.max(deviation,Math.abs(dx*(samples[i].y-a.y)-dy*(samples[i].x-a.x))/span);
 }
 // Small wrist arcs are natural; a loop or a reversal is a different gesture.
 if(travel>span*1.8||deviation>Math.max(20,Math.min(55,span*.23)))return null;
 const speed=span/duration,extension=Math.min(8,span*.08),ex=dx/span*extension,ey=dy/span*extension;
 return{a:{...a,x:a.x-ex,y:a.y-ey},b:{...b,x:b.x+ex,y:b.y+ey},speed,energy:Math.max(.9,Math.min(1.16,.94+speed*.09))};
}
export function fitsPieceBudget(current,proposals,limit=6){return current+proposals.reduce((n,p)=>n+p.parts.length-1,0)<=limit;}
