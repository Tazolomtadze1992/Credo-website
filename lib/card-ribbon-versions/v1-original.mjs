import * as THREE from 'three';

// In-gamut shades derived from Credo coral H29.48 and secondary blue H232.094.
export const CARD_RIBBON_COLORS = Object.freeze({
  paper: [0.993, 0.002, 30],
  coral: [0.87, 0.06, 29.48],
  blue: [0.84, 0.055, 232.094],
  peach: [0.955, 0.019, 29.48],
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
  varying vec2 vUv;

  float band(float distance, float width) {
    float x = distance / width;
    return exp(-x * x);
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
    float phase = uTime * .14;
    // A curved diagonal sheet with two finer folds, rather than moving blobs.
    float bend = .062 * sin(uv.x * 3.1 + phase)
               + .023 * sin(uv.x * 6.2 - phase * .73);
    float pointerBend = uPointer.y * .012 + uPointer.x * (uv.x - .5) * .018;
    float q = uv.y - .58 * uv.x - bend - pointerBend;
    float fold = .012 * sin(uv.x * 4.6 + phase * .8);
    float clearTop = 1.0 - smoothstep(.76, .94, uv.y);
    float clearBottom = smoothstep(-.02, .10, uv.y);
    float visibility = clearTop * clearBottom;

    vec3 color = uPaper;
    color = mix(color, uPeach, band(q + .035 - fold, .095) * .68 * visibility);
    color = mix(color, uCoral, band(q - .31 - fold, .135) * .65 * visibility);
    color = mix(color, uBlue, band(q - .105 + fold, .085) * .58 * visibility);

    // Narrow white crests and broad feathered bloom give the ribbon its shape.
    float crest = band(q - .205 - fold, .006) * .42
                + band(q - .018 + fold, .0045) * .32;
    float bloom = band(q - .205 - fold, .025) * .16;
    color = mix(color, uPaper, (crest + bloom) * visibility);

    // Stationary fine fibers; no animated noise or harsh specular sweep.
    float fibers = sin(q * 1550.0 + uv.x * 9.0) * .0013;
    float grain = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - .5;
    color.x += fibers * visibility * band(q - .15, .3) + grain * .0012;
    gl_FragColor = vec4(clamp(labToLinear(color), 0.0, 1.0), 1.0);
    #include <colorspace_fragment>
  }
`;

export function createCardRibbon() {
  const material = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uPointer: { value: new THREE.Vector2() },
      uPaper: { value: lab(CARD_RIBBON_COLORS.paper) },
      uCoral: { value: lab(CARD_RIBBON_COLORS.coral) },
      uBlue: { value: lab(CARD_RIBBON_COLORS.blue) },
      uPeach: { value: lab(CARD_RIBBON_COLORS.peach) },
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
