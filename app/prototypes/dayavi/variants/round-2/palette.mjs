// Brand-derived colors: OKLCH lightness/chroma changes retain each brand hue.
export function oklchHex(l, c, h) {
  const a=c*Math.cos(h*Math.PI/180),b=c*Math.sin(h*Math.PI/180);
  const ll=(l+.3963377774*a+.2158037573*b)**3;
  const mm=(l-.1055613458*a-.0638541728*b)**3;
  const ss=(l-.0894841775*a-1.291485548*b)**3;
  const rgb=[4.0767416621*ll-3.3077115913*mm+.2309699292*ss,-1.2684380046*ll+2.6097574011*mm-.3413193965*ss,-.0041960863*ll-.7034186147*mm+1.707614701*ss];
  return rgb.reduce((hex,x)=>{const n=Math.max(0,Math.min(1,x<=.0031308?12.92*x:1.055*x**(1/2.4)-.055));return (hex<<8)+Math.round(n*255);},0);
}
export const P={
  coral:0xfc6250, blue:0x1e6e91,
  coralDeep:oklchHex(.59,.165,29), coralSoft:oklchHex(.79,.112,29), jam:oklchHex(.48,.125,25),
  blueDeep:oklchHex(.34,.070,232), blueSoft:oklchHex(.83,.032,232), bluePale:oklchHex(.945,.012,232),
  cream:oklchHex(.967,.017,77), creamSide:oklchHex(.911,.031,77), sponge:oklchHex(.84,.070,75),
  spongeDark:oklchHex(.76,.065,75), paper:oklchHex(.984,.004,232), ink:oklchHex(.39,.043,232),
};
