import { oklchToLinearSrgb } from './mycredo-fluid-palette.mjs';

// The accepted Credo / EBRD blues, blended in linear light without adding hues.
export const MYCREDO_BACKGROUND_OKLCH = Object.freeze({
  ink: [0.13, 0.033, 259.224],
  midnight: [0.201, 0.064, 264.012],
  cobalt: [0.265, 0.1, 264.222],
  blue: [0.357, 0.12, 263.396],
});

const vertexSource = `
  attribute vec2 position;
  varying vec2 uv;
  void main() {
    uv = position * 0.5 + 0.5;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const fragmentSource = `
  precision highp float;
  varying vec2 uv;
  uniform vec2 resolution;
  uniform float time;
  uniform vec3 ink, midnight, cobalt, blue;

  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    f = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
    return mix(mix(hash(i), hash(i + vec2(1., 0.)), f.x),
               mix(hash(i + vec2(0., 1.)), hash(i + vec2(1.)), f.x), f.y);
  }

  float field(vec2 p) {
    return noise(p) * 0.75 + noise(p * 2.03 + 7.1) * 0.25;
  }

  float pool(vec2 p, vec2 center, vec2 size) {
    vec2 d = (p - center) / size;
    return exp(-dot(d, d) * 1.7);
  }

  vec3 encodeSrgb(vec3 linearColor) {
    return mix(linearColor * 12.92,
               1.055 * pow(max(linearColor, vec3(0.)), vec3(1. / 2.4)) - 0.055,
               step(vec3(0.0031308), linearColor));
  }

  void main() {
    float aspect = resolution.x / resolution.y;
    vec2 p = uv * vec2(aspect, 1.);
    float t = time * 0.1;

    // Two broad, independently advected fields bend the color areas, not their edges.
    vec2 warp = vec2(
      field(p * 1.3 + vec2(t * 0.36, -t * 0.22)),
      field(p * 1.3 + vec2(-t * 0.25, t * 0.3) + 12.7)
    ) - 0.5;
    vec2 q = p + warp * 0.42;
    float clouds = field(q * 1.65 + vec2(-t * 0.18, t * 0.12));

    float left = pool(q,
      vec2(aspect * (0.17 + 0.09 * sin(t * 0.8)), 0.67 + 0.12 * cos(t * 0.7)),
      vec2(aspect * 0.64, 0.78));
    float lowerRight = pool(q,
      vec2(aspect * (0.94 + 0.08 * cos(t * 0.65)), 0.1 + 0.1 * sin(t * 0.8)),
      vec2(aspect * 0.55, 0.53));
    float depth = smoothstep(0.17, 0.83, clouds);
    float body = clamp(left * 0.95 + lowerRight * 0.55, 0., 1.);

    vec3 color = mix(ink, midnight, 0.24 + body * 0.65);
    color = mix(color, cobalt, body * (0.48 + depth * 0.5));
    float bloom = smoothstep(0.26, 0.87, clouds) * left * 0.8;
    bloom += lowerRight * depth * 0.24;
    color = mix(color, blue, clamp(bloom, 0., 0.78));

    // Stable sub-pixel grain prevents steps in the deep blue gradients.
    float grain = hash(gl_FragCoord.xy) - 0.5;
    gl_FragColor = vec4(encodeSrgb(color) + grain / 255., 1.);
  }
`;

export function createMyCredoBackground(canvas) {
  const gl = canvas.getContext('webgl', {
    alpha: false, antialias: false, depth: false, stencil: false,
    powerPreference: 'low-power', preserveDrawingBuffer: false,
  });
  if (!gl) return null;

  const shaders = [];
  let program, buffer;
  const dispose = () => {
    if (buffer) gl.deleteBuffer(buffer);
    if (program) gl.deleteProgram(program);
    shaders.forEach(shader => gl.deleteShader(shader));
  };

  try {
    function compile(type, source) {
      const shader = gl.createShader(type);
      if (!shader) throw new Error('Unable to allocate background shader');
      shaders.push(shader);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        throw new Error(gl.getShaderInfoLog(shader) || 'Background shader compilation failed');
      }
      return shader;
    }

    program = gl.createProgram();
    if (!program) throw new Error('Unable to allocate background program');
    gl.attachShader(program, compile(gl.VERTEX_SHADER, vertexSource));
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fragmentSource));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(gl.getProgramInfoLog(program) || 'Background shader linking failed');
    }
    gl.useProgram(program);
    buffer = gl.createBuffer();
    if (!buffer) throw new Error('Unable to allocate background geometry');
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    const resolution = gl.getUniformLocation(program, 'resolution');
    const time = gl.getUniformLocation(program, 'time');
    for (const [name, color] of Object.entries(MYCREDO_BACKGROUND_OKLCH)) {
      gl.uniform3fv(gl.getUniformLocation(program, name), oklchToLinearSrgb(color));
    }

    return {
      resize() {
        const { width, height } = canvas.getBoundingClientRect();
        const ratio = Math.min(window.devicePixelRatio || 1, 1.25, 1280 / Math.max(width, height, 1));
        const w = Math.max(1, Math.round(width * ratio));
        const h = Math.max(1, Math.round(height * ratio));
        if (canvas.width !== w || canvas.height !== h) {
          canvas.width = w;
          canvas.height = h;
        }
        gl.viewport(0, 0, w, h);
        gl.uniform2f(resolution, w, h);
      },
      render(elapsed) {
        gl.uniform1f(time, elapsed);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      },
      dispose,
    };
  } catch (error) {
    dispose();
    throw error;
  }
}
