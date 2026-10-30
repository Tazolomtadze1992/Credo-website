// Opaque, uncoated paper. The surface field is shared by colour, roughness and
// bump, so a visible fibre has a physical response rather than acting as dirt.
// Geometry supplies all bending/crease normals; this material adds only tooth.
const FIELD_WIDTH=1024,FIELD_HEIGHT=400,PRINT_WIDTH=2048,PRINT_HEIGHT=800;
const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));

function randomSource(seed){
 let state=seed>>>0;
 return()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296;};
}
function noiseGrid(columns,rows,random){
 const values=new Float32Array((columns+1)*(rows+1));
 for(let i=0;i<values.length;i++)values[i]=random()*2-1;
 return{columns,rows,values};
}
function noise(grid,u,v){
 const x=u*grid.columns,y=v*grid.rows,ix=Math.min(grid.columns-1,Math.floor(x)),iy=Math.min(grid.rows-1,Math.floor(y));
 const px=x-ix,py=y-iy,tx=px*px*(3-2*px),ty=py*py*(3-2*py),stride=grid.columns+1;
 const a=grid.values[iy*stride+ix],b=grid.values[iy*stride+ix+1],c=grid.values[(iy+1)*stride+ix],d=grid.values[(iy+1)*stride+ix+1];
 return(a+(b-a)*tx)*(1-ty)+(c+(d-c)*tx)*ty;
}

// Exported for deterministic field checks without requiring a WebGL context.
export function createPaperField(width=FIELD_WIDTH,height=FIELD_HEIGHT,seed=17031){
 const random=randomSource(seed),formation=noiseGrid(21,9,random),cloud=noiseGrid(67,28,random),tooth=noiseGrid(173,73,random),lay=noiseGrid(30,88,random);
 const colour=new Uint8ClampedArray(width*height*4),relief=new Uint8ClampedArray(width*height*4),roughness=new Uint8ClampedArray(width*height*4);
 let colourMin=255,colourMax=0,reliefMin=255,reliefMax=0,roughMin=255,roughMax=0;
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){
  const i=(y*width+x)*4,u=x/(width-1),v=y/(height-1);
  const broad=noise(formation,u,v),medium=noise(cloud,u,v),fine=noise(tooth,u,v),direction=noise(lay,u,v),grain=random()*2-1;
  const tone=broad*1.7+medium*1.25+fine*.58+grain*.48;
  const c=clamp(Math.round(249+tone),243,253),b=clamp(Math.round(128+broad*7+medium*11+fine*8+direction*5+grain*2.2),92,164);
  const r=clamp(Math.round(234+medium*7+direction*4+fine*2+grain),217,248);
  // Very slightly cool neutral stock; no beige/aged paper tint.
  colour[i]=c;colour[i+1]=Math.min(255,c+1);colour[i+2]=c;colour[i+3]=255;
  for(const field of [relief,roughness])field[i+3]=255;
  relief[i]=relief[i+1]=relief[i+2]=b;roughness[i]=roughness[i+1]=roughness[i+2]=r;
  colourMin=Math.min(colourMin,c);colourMax=Math.max(colourMax,c);reliefMin=Math.min(reliefMin,b);reliefMax=Math.max(reliefMax,b);roughMin=Math.min(roughMin,r);roughMax=Math.max(roughMax,r);
 }
 return{width,height,colour,relief,roughness,diagnostics:{seed,colourRange:[colourMin,colourMax],reliefRange:[reliefMin,reliefMax],roughnessRange:[roughMin,roughMax]}};
}

function canvas(width,height){const result=document.createElement('canvas');result.width=width;result.height=height;return result;}
function fieldCanvas(width,height,bytes){
 const result=canvas(width,height),ctx=result.getContext('2d'),image=ctx.createImageData(width,height);image.data.set(bytes);ctx.putImageData(image,0,0);return result;
}

function addFibres(context,width,height,seed,kind){
 const random=randomSource(seed),count=kind==='relief'?14500:11000;
 context.lineCap='round';
 // Two related populations: short laid fibres, plus faint crossing fibres.
 // Each uses the same seeded geometry in all material maps.
 for(let i=0;i<count;i++){
  const x=random()*width,y=random()*height,angle=(i%5===0?Math.PI/2:0)+(random()-.5)*1.1,length=(2.2+random()*10)*(width/FIELD_WIDTH),bend=(random()-.5)*length*.23;
  const dx=Math.cos(angle)*length,dy=Math.sin(angle)*length;
  const bright=random()>.46;
  if(kind==='relief')context.strokeStyle=bright?'rgba(170,170,170,.17)':'rgba(82,82,82,.12)';
  else if(kind==='roughness')context.strokeStyle=bright?'rgba(250,250,250,.12)':'rgba(204,204,204,.10)';
  else context.strokeStyle=bright?'rgba(255,255,255,.13)':'rgba(138,149,145,.035)';
  context.lineWidth=(.35+random()*.5)*(width/FIELD_WIDTH);
  context.beginPath();context.moveTo(x,y);context.quadraticCurveTo(x+dx*.5-dy*.1,y+dy*.5+bend,x+dx,y+dy);context.stroke();
 }
}

export function createPaperMaterials(THREE,logo,renderer){
 const field=createPaperField(),base=fieldCanvas(field.width,field.height,field.colour),bumpCanvas=fieldCanvas(field.width,field.height,field.relief),roughCanvas=fieldCanvas(field.width,field.height,field.roughness);
 addFibres(base.getContext('2d'),field.width,field.height,7407,'colour');
 addFibres(bumpCanvas.getContext('2d'),field.width,field.height,7407,'relief');
 addFibres(roughCanvas.getContext('2d'),field.width,field.height,7407,'roughness');
 const frontCanvas=canvas(PRINT_WIDTH,PRINT_HEIGHT),frontCtx=frontCanvas.getContext('2d');
 frontCtx.imageSmoothingEnabled=true;frontCtx.imageSmoothingQuality='high';frontCtx.drawImage(base,0,0,PRINT_WIDTH,PRINT_HEIGHT);
 if(logo)frontCtx.drawImage(logo,190,130,1668,539);
 // Ink receives the same fine paper tooth, without washing out the brand print.
 addFibres(frontCtx,PRINT_WIDTH,PRINT_HEIGHT,7407,'colour');
 const backCanvas=canvas(FIELD_WIDTH,FIELD_HEIGHT);backCanvas.getContext('2d').drawImage(base,0,0);

 // Printed areas are a little smoother than bare fibres. White letters remain
 // uncoated, and the source print's transparency is respected.
 if(logo){
  const inkCanvas=canvas(FIELD_WIDTH,FIELD_HEIGHT),inkCtx=inkCanvas.getContext('2d');inkCtx.drawImage(logo,95,65,834,269.5);
  const ink=inkCtx.getImageData(0,0,FIELD_WIDTH,FIELD_HEIGHT).data,roughCtx=roughCanvas.getContext('2d'),rough=roughCtx.getImageData(0,0,FIELD_WIDTH,FIELD_HEIGHT),bumpCtx=bumpCanvas.getContext('2d'),bump=bumpCtx.getImageData(0,0,FIELD_WIDTH,FIELD_HEIGHT);
  for(let i=0;i<ink.length;i+=4){
   const coverage=(1-Math.min(ink[i],ink[i+1],ink[i+2])/255)*(ink[i+3]/255);
   if(coverage<.02)continue;
   const r=Math.round(rough.data[i]*(1-coverage*.34)+215*coverage*.34),b=Math.round(128+(bump.data[i]-128)*(1-coverage*.13));
   rough.data[i]=rough.data[i+1]=rough.data[i+2]=r;bump.data[i]=bump.data[i+1]=bump.data[i+2]=b;
  }
  roughCtx.putImageData(rough,0,0);bumpCtx.putImageData(bump,0,0);
 }

 const anisotropy=Math.min(8,renderer?.capabilities?.getMaxAnisotropy?.()||1),textures=[];
 function texture(source,isColour){
  const result=new THREE.CanvasTexture(source);result.colorSpace=isColour?THREE.SRGBColorSpace:THREE.NoColorSpace;
  result.anisotropy=anisotropy;result.minFilter=THREE.LinearMipmapLinearFilter;result.magFilter=THREE.LinearFilter;result.wrapS=result.wrapT=THREE.ClampToEdgeWrapping;textures.push(result);return result;
 }
 const print=texture(frontCanvas,true),backMap=texture(backCanvas,true),bump=texture(bumpCanvas,false),roughness=texture(roughCanvas,false);
 const shared={color:0xffffff,metalness:0,roughness:1,roughnessMap:roughness,bumpMap:bump,clearcoat:0,transmission:0,sheen:.065,sheenColor:0xffffff,sheenRoughness:1,specularIntensity:.32,ior:1.45,envMapIntensity:.45,dithering:true};
 const front=new THREE.MeshPhysicalMaterial({...shared,map:print,bumpScale:.018,side:THREE.FrontSide});
 const back=new THREE.MeshPhysicalMaterial({...shared,map:backMap,bumpScale:.021,side:THREE.BackSide});
 const edge=new THREE.MeshStandardMaterial({color:0xe3e8e5,metalness:0,roughness:.97,dithering:true});
 front.name='Credo uncoated paper — print';back.name='Credo uncoated paper — reverse';edge.name='Credo uncoated paper — cut fibres';
 let released=false;
 return{front,back,edge,textures,diagnostics:{...field.diagnostics,fieldSize:[FIELD_WIDTH,FIELD_HEIGHT],printSize:[PRINT_WIDTH,PRINT_HEIGHT],fibreSeed:7407,opaque:true,wholeSheetUV:true},dispose(){if(released)return;released=true;front.dispose();back.dispose();edge.dispose();textures.forEach(map=>map.dispose());}};
}
