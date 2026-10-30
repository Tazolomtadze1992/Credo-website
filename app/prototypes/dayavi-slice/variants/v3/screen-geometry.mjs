const EPSILON=1e-8;

// A cut must cross the complete displayed boundary. Looking at all infinite-line
// intersections prevents a short movement inside the paper from slicing it all.
// The caller extends an intentional stroke by up to 8px; only 1px of numerical
// tolerance is added here, so the physical crossing does not grow a second time.
export function crossesSegments(segments,a,b,minPixels=18){
 const dx=b.x-a.x,dy=b.y-a.y,length=Math.hypot(dx,dy);
 if(!Number.isFinite(length)||length<minPixels)return false;
 const intersections=[];let lowSide=Infinity,highSide=-Infinity;
 for(const {a:p,b:q} of segments){
  const sx=q.x-p.x,sy=q.y-p.y,den=dx*sy-dy*sx;
  const sideP=(dx*(p.y-a.y)-dy*(p.x-a.x))/length;
  const sideQ=(dx*(q.y-a.y)-dy*(q.x-a.x))/length;
  lowSide=Math.min(lowSide,sideP,sideQ);highSide=Math.max(highSide,sideP,sideQ);
  if(Math.abs(den)<EPSILON*length*Math.max(1,Math.hypot(sx,sy)))continue;
  const px=p.x-a.x,py=p.y-a.y,t=(px*sy-py*sx)/den,u=(px*dy-py*dx)/den;
  if(u>=-EPSILON&&u<=1+EPSILON)intersections.push(t);
 }
 // Touching a corner or running along an exterior edge is not a cut.
 if(lowSide>=-EPSILON||highSide<=EPSILON||intersections.length<2)return false;
 intersections.sort((x,y)=>x-y);
 const unique=intersections.filter((t,i)=>i===0||Math.abs(t-intersections[i-1])*length>1e-5);
 if(unique.length<2)return false;
 const low=unique[0],high=unique[unique.length-1],tolerance=1/length;
 return low>=-tolerance&&high<=1+tolerance&&(high-low)*length>=minPixels;
}

export function getScreenBounds(segments){
 const bounds={minX:Infinity,maxX:-Infinity,minY:Infinity,maxY:-Infinity};
 for(const {a,b} of segments)for(const p of [a,b]){
  bounds.minX=Math.min(bounds.minX,p.x);bounds.maxX=Math.max(bounds.maxX,p.x);
  bounds.minY=Math.min(bounds.minY,p.y);bounds.maxY=Math.max(bounds.maxY,p.y);
 }
 return bounds;
}

// Fit the logical stage first, then extend its camera by a matching pixel gutter.
// With the overscanned canvas placed at (-gutter,-gutter), project into its full
// render dimensions and subtract gutter to get root-local pointer coordinates.
export function fitPaperCamera(THREE,camera,seedPatches,surfacePoint,width,height,gutter=48){
 if(!Number.isFinite(width)||!Number.isFinite(height)||width<=0||height<=0)throw new Error('Paper camera needs positive stage dimensions');
 camera.updateMatrixWorld(true);
 const unique=new Map();
 for(const {poly} of seedPatches)for(const uv of poly)unique.set(`${Math.round(uv[0]*1e7)},${Math.round(uv[1]*1e7)}`,uv);
 let minX=Infinity,maxX=-Infinity,minY=Infinity,maxY=-Infinity;
 const point=new THREE.Vector3();
 for(const bend of [-.8,0,.8])for(const uv of unique.values()){
  const p=surfacePoint(uv,bend);
  if(Array.isArray(p))point.set(...p);else point.copy(p);
  point.applyMatrix4(camera.matrixWorldInverse);
  minX=Math.min(minX,point.x);maxX=Math.max(maxX,point.x);minY=Math.min(minY,point.y);maxY=Math.max(maxY,point.y);
 }
 // Rigid fragment travel is reserved in view space. The wider actual drawing
 // buffer remains available for soft shadows and very brief transient motion.
 minX-=.45;maxX+=.45;minY-=.38;maxY+=.38;
 point.set(0,-1.48,0).applyMatrix4(camera.matrixWorldInverse);
 minX=Math.min(minX,point.x);maxX=Math.max(maxX,point.x);minY=Math.min(minY,point.y);maxY=Math.max(maxY,point.y);
 const cx=(minX+maxX)/2,cy=(minY+maxY)/2;
 const marginX=Math.min(32,width*.12),marginY=Math.min(24,height*.12);
 const worldPerPixel=Math.max((maxX-minX)/Math.max(1,width-2*marginX),(maxY-minY)/Math.max(1,height-2*marginY));
 const renderWidth=width+2*gutter,renderHeight=height+2*gutter;
 camera.left=cx-renderWidth*worldPerPixel/2;camera.right=cx+renderWidth*worldPerPixel/2;
 camera.top=cy+renderHeight*worldPerPixel/2;camera.bottom=cy-renderHeight*worldPerPixel/2;
 camera.updateProjectionMatrix();
 return{renderWidth,renderHeight,gutter,worldPerPixel,cx,cy};
}
