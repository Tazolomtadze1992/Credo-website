export function attachPosterMotion(root){
 const pieces=[...root.querySelectorAll('[data-poster-piece],[data-cake-piece]')].map(el=>({el,vector:el.dataset.vector.split(' ').map(Number)}));
 let latched=false,hover=false;
 const draw=()=>{const open=hover||latched;root.dataset.progress=open?'1.000':'0.000';root.setAttribute('aria-pressed',String(open));for(const {el,vector} of pieces){el.style.transform=`translate(${open?vector[0]:0}px,${open?vector[1]:0}px)`;for(const f of el.querySelectorAll('[data-cake-cut]'))f.style.opacity=open?'1':'0';}};
 const enter=e=>{if(e.pointerType!=='touch'){hover=true;draw();}},leave=()=>{hover=false;draw();},up=e=>{if(e.pointerType==='touch'){latched=!latched;draw();}},key=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();latched=!latched;draw();}else if(e.key==='Escape'){latched=hover=false;draw();}};
 root.addEventListener('pointerenter',enter);root.addEventListener('pointerleave',leave);root.addEventListener('pointerup',up);root.addEventListener('keydown',key);draw();
 return()=>{root.removeEventListener('pointerenter',enter);root.removeEventListener('pointerleave',leave);root.removeEventListener('pointerup',up);root.removeEventListener('keydown',key);};
}
