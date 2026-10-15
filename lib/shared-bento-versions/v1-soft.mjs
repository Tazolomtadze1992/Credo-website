import * as THREE from 'three';
const CARD_RIBBON_COLORS = Object.freeze({
  paper: [0.993, 0.002, 30], coral: [0.87, 0.06, 29.48],
  blue: [0.84, 0.055, 232.094], peach: [0.955, 0.019, 29.48],
});

// The bank-card artwork's palette, expanded within the same two brand hues.
export const SHARED_BENTO_COLORS = Object.freeze({
  ...CARD_RIBBON_COLORS,
  rose: [0.91, 0.04, 29.48],
  mist: [0.95, 0.021, 232.094],
});
const lab = ([l, c, h]) => new THREE.Vector3(l, c * Math.cos(h * Math.PI / 180), c * Math.sin(h * Math.PI / 180));

const vertexShader = `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`;
const fragmentShader = `
  varying vec2 vUv;
  uniform float uTime;
  uniform float uStacked;
  uniform vec2 uSize;
  uniform vec4 uCardA;
  uniform vec4 uCardB;
  uniform vec3 uPaper;
  uniform vec3 uCoral;
  uniform vec3 uBlue;
  uniform vec3 uPeach;
  uniform vec3 uRose;
  uniform vec3 uMist;
  const float TAU = 6.28318530718;

  vec3 labToLinear(vec3 lab) {
    float l = lab.x + .3963377774 * lab.y + .2158037573 * lab.z;
    float m = lab.x - .1055613458 * lab.y - .0638541728 * lab.z;
    float s = lab.x - .0894841775 * lab.y - 1.291485548 * lab.z;
    vec3 lms = vec3(l*l*l, m*m*m, s*s*s);
    return vec3(dot(lms,vec3(4.0767416621,-3.3077115913,.2309699292)),
      dot(lms,vec3(-1.2684380046,2.6097574011,-.3413193965)),
      dot(lms,vec3(-.0041960863,-.7034186147,1.7076147010)));
  }
  float pool(vec2 p, vec2 center, vec2 size) {
    // Circular x-distance makes colors leave the right and re-enter the left.
    float dx = atan(sin((p.x-center.x)*TAU), cos((p.x-center.x)*TAU)) / TAU;
    vec2 d = vec2(dx, p.y-center.y) / size;
    return exp(-dot(d,d)*1.8);
  }
  void main() {
    vec2 uv = vec2(vUv.x,1.0-vUv.y);
    vec2 pixel = uv*uSize;
    float second = mix(step((uCardA.x+uCardA.z+uCardB.x)*.5,pixel.x),
      step((uCardA.y+uCardA.w+uCardB.y)*.5,pixel.y), uStacked);
    vec4 card = mix(uCardA,uCardB,second);
    float localY = (pixel.y-card.y)/card.w;
    // The same field follows the two windows when they stack on a phone.
    vec2 p = mix(uv,uv.yx,uStacked);
    float t = uTime;
    float travel = t/22.0;
    p.x -= travel;
    p += vec2(.065*sin(p.y*4.4+t*.27)+.025*sin(p.y*7.0-t*.19),
      .10*sin(p.x*TAU+t*.20)+.045*cos(p.x*TAU*2.0-t*.17));
    float coral = pool(p,vec2(.08,.72+.09*sin(t*.24)),vec2(.24,.5));
    float blue = pool(p,vec2(.56,.61+.11*cos(t*.21)),vec2(.26,.49));
    float peach = pool(p,vec2(.31,.94+.06*cos(t*.31)),vec2(.22,.37));
    float rose = pool(p,vec2(.88,.85+.09*sin(t*.18)),vec2(.23,.42));
    float mist = pool(p,vec2(.78,.33+.08*sin(t*.23)),vec2(.23,.43));
    float total = coral+blue+peach+rose+mist+.12;
    vec3 field = (uCoral*coral+uBlue*blue+uPeach*peach+uRose*rose+uMist*mist+uPaper*.12)/total;
    float opening = .2+.045*sin(uv.x*TAU+t*.18);
    float reveal = smoothstep(opening,opening+.26,localY);
    vec3 color = mix(uPaper,field,reveal*.94);
    // Fine stationary grain, without contours or moving highlight seams.
    float grain = fract(sin(dot(gl_FragCoord.xy,vec2(12.9898,78.233)))*43758.5453)-.5;
    color.x += grain*.0016*reveal;
    gl_FragColor = vec4(clamp(labToLinear(color),0.0,1.0),1.0);
    #include <colorspace_fragment>
  }
`;

export function createSharedBentoField(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: 'low-power' });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  const uniforms = {
    uTime: { value: 0 }, uStacked: { value: 0 }, uSize: { value: new THREE.Vector2(1,1) },
    uCardA: { value: new THREE.Vector4() }, uCardB: { value: new THREE.Vector4() },
    ...Object.fromEntries(Object.entries(SHARED_BENTO_COLORS).map(([name,color]) => [`u${name[0].toUpperCase()+name.slice(1)}`,{value:lab(color)}])),
  };
  const material = new THREE.ShaderMaterial({ uniforms, vertexShader, fragmentShader, depthTest: false, depthWrite: false, toneMapped: false });
  const geometry = new THREE.PlaneGeometry(2,2);
  const scene = new THREE.Scene();
  scene.add(new THREE.Mesh(geometry,material));
  const camera = new THREE.Camera();
  let active = false, frame = 0, last = 0, elapsed = 0, disposed = false;
  const draw = now => {
    frame = 0;
    if (disposed || !active) return;
    if (last) elapsed += Math.min((now-last)/1000,.05);
    last = now; uniforms.uTime.value = elapsed;
    renderer.render(scene,camera);
    frame = requestAnimationFrame(draw);
  };
  return {
    resize(width,height,rects,stacked) {
      renderer.setSize(width,height,false);
      uniforms.uSize.value.set(width,height);
      uniforms.uStacked.value = Number(stacked);
      uniforms.uCardA.value.set(rects[0].x,rects[0].y,rects[0].width,rects[0].height);
      uniforms.uCardB.value.set(rects[1].x,rects[1].y,rects[1].width,rects[1].height);
      renderer.render(scene,camera);
    },
    setActive(value) {
      active = value;
      if (!value) { cancelAnimationFrame(frame); frame = 0; last = 0; }
      else if (!frame) frame = requestAnimationFrame(draw);
    },
    dispose() { disposed = true; cancelAnimationFrame(frame); geometry.dispose(); material.dispose(); renderer.dispose(); },
  };
}
