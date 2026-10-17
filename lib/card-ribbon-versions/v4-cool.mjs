import * as THREE from 'three';

// The saved flowing wave, on cool white paper with a clear heading area.
export const CARD_RIBBON_COLORS = Object.freeze({
  paper: [0.993, 0.002, 232.094],
  coral: [0.87, 0.06, 29.48],
  blue: [0.84, 0.055, 232.094],
  peach: [0.955, 0.019, 29.48],
  blueFold: [0.71, 0.075, 232.094],
});

function lab([lightness, chroma, hue]) {
  const angle = hue * Math.PI / 180;
  return new THREE.Vector3(lightness, chroma * Math.cos(angle), chroma * Math.sin(angle));
}

const vertexShader = /* glsl */`
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */`
  uniform float uTime;
  uniform vec2 uPointer;
  uniform vec3 uPaper;
  uniform vec3 uCoral;
  uniform vec3 uBlue;
  uniform vec3 uPeach;
  uniform vec3 uBlueFold;
  varying vec2 vUv;

  float band(float d, float width) { return exp(-pow(d / width, 2.0)); }
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0)), f.x), f.y);
  }
  vec3 labToLinear(vec3 lab) {
    float l = lab.x + .3963377774 * lab.y + .2158037573 * lab.z;
    float m = lab.x - .1055613458 * lab.y - .0638541728 * lab.z;
    float s = lab.x - .0894841775 * lab.y - 1.291485548 * lab.z;
    vec3 lms = vec3(l * l * l, m * m * m, s * s * s);
    return vec3(
      dot(lms, vec3(4.0767416621, -3.3077115913, .2309699292)),
      dot(lms, vec3(-1.2684380046, 2.6097574011, -.3413193965)),
      dot(lms, vec3(-.0041960863, -.7034186147, 1.7076147010))
    );
  }

  void main() {
    vec2 uv = vUv;
    float t = uTime * .42;
    float along = uv.x + uv.y * .22;
    // The sheet keeps its diagonal composition while folds travel along it.
    // Independent phase velocities prevent a rigid, oscillating stripe.
    float bend = .055 * sin(along * 2.3 - t * .63)
               + .025 * sin(along * 4.3 - t * .91);
    float pointer = uPointer.y * .012 + uPointer.x * (uv.x - .5) * .018;
    float q = uv.y - .43 * uv.x - .13 * uv.x * uv.x - bend - pointer;
    float roll = .026 * sin(along * 3.8 - t)
               + .012 * sin(along * 7.0 - t * .72);
    float spread = .88 + .18 * sin(along * 2.2 - t * .38) + .14 * uv.x;
    float visible = (1.0 - smoothstep(.58, .76, uv.y)) * smoothstep(-.04, .08, uv.y);
    vec3 paper = mix(uPaper, vec3(1.0, 0.0, 0.0), smoothstep(.5, .9, uv.y));

    // Broad asymmetrical layers: a warm upper sheet, cool body, warm underside.
    float blueCenter = .105 + roll;
    float coralCenter = .325 + roll * .58;
    float peachCenter = -.055 + roll * .75;
    vec3 color = mix(paper, uPeach, band(q - peachCenter, .115 * spread) * .84 * visible);
    color = mix(color, uCoral, band(q - coralCenter, .17 * spread) * .76 * visible);
    color = mix(color, uBlue, band(q - blueCenter, .112 * spread) * .72 * visible);
    float depth = band(q - blueCenter + .035, .055 * spread);
    color = mix(color, uBlueFold, depth * .17 * visible);

    // Satin crests have a soft shoulder, a narrow light edge and a shaded side.
    float crestCenter = .218 + roll * .85;
    float crestWidth = .013 + .008 * (.5 + .5 * sin(along * 4.8 - t * .77));
    float crest = band(q - crestCenter, crestWidth) * .35;
    float bloom = band(q - crestCenter - .011, .045 * spread) * .27;
    float lowerCrest = band(q + .026 - roll * .7, .013 * spread) * .17;
    float highlight = crest + bloom + lowerCrest;
    color = mix(color, paper, highlight * visible);
    color.x -= band(q - crestCenter + .023, .022 * spread) * .009 * visible;

    // Long fibers advect with the surface, rather than flickering screen noise.
    float flow = along - uTime * .035;
    float fibers = noise(vec2(flow * 4.2, (q - roll * .7) * 210.0)) - .5;
    float detail = noise(vec2(flow * 9.0, (q - roll) * 430.0)) - .5;
    float textureMask = band(q - .15, .32) * visible;
    color.x += (fibers * .004 + detail * .0015) * textureMask;

    vec3 linearColor = clamp(labToLinear(color), 0.0, 1.0);
    gl_FragColor = vec4(linearColor, 1.0);
    #include <colorspace_fragment>
    // Static output dither removes banding without a crawling grain layer.
    float grain = hash(gl_FragCoord.xy) - .5;
    gl_FragColor.rgb += grain * .0022;
  }
`;

export function createCardRibbon() {
  const material = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 }, uPointer: { value: new THREE.Vector2() },
      uPaper: { value: lab(CARD_RIBBON_COLORS.paper) },
      uCoral: { value: lab(CARD_RIBBON_COLORS.coral) },
      uBlue: { value: lab(CARD_RIBBON_COLORS.blue) },
      uPeach: { value: lab(CARD_RIBBON_COLORS.peach) },
      uBlueFold: { value: lab(CARD_RIBBON_COLORS.blueFold) },
    },
    vertexShader, fragmentShader,
    depthTest: false, depthWrite: false, toneMapped: false,
  });
  const geometry = new THREE.PlaneGeometry(1, 1);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.z = -1.4;
  mesh.renderOrder = -10;
  mesh.frustumCulled = false;

  return {
    mesh,
    update(elapsed, pointerX, pointerY) {
      material.uniforms.uTime.value = elapsed;
      material.uniforms.uPointer.value.set(pointerX, pointerY);
    },
    resize(camera) {
      const height = 2 * (camera.position.z - mesh.position.z) * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
      mesh.scale.set(height * camera.aspect, height, 1);
    },
    dispose() { geometry.dispose(); material.dispose(); },
  };
}
