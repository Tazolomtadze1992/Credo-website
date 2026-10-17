// Adapted from the approved portfolio LiquidTrail prototype.
import { MYCREDO_FLUID_RGB } from './mycredo-fluid-palette.mjs';

const vertex = `#version 300 es
in vec2 position;
out vec2 uv;
void main() { uv = position * 0.5 + 0.5; gl_Position = vec4(position, 0., 1.); }`;
const header = `#version 300 es
precision highp float;
in vec2 uv;
out vec4 result;
uniform vec2 texel;
`;

const fragments = {
  splat: `uniform sampler2D source;
    uniform vec2 point;
    uniform vec2 amount;
    uniform float aspect;
    void main() {
      vec2 distance = uv - point;
      distance.x *= max(aspect, 1.);
      distance.y *= max(1. / aspect, 1.);
      float ink = exp(-dot(distance, distance) / (0.09 * 0.09));
      result = texture(source, uv) + vec4(ink * amount, 0., 0.);
    }`,
  advect: `uniform sampler2D velocity;
    uniform sampler2D source;
    uniform float decay;
    uniform float dt;
    void main() {
      vec2 departure = uv - texture(velocity, uv).xy * texel * dt;
      result = texture(source, departure) * decay;
    }`,
  divergence: `uniform sampler2D velocity;
    void main() {
      vec2 left = texture(velocity, uv - vec2(texel.x, 0.)).xy;
      vec2 right = texture(velocity, uv + vec2(texel.x, 0.)).xy;
      vec2 bottom = texture(velocity, uv - vec2(0., texel.y)).xy;
      vec2 top = texture(velocity, uv + vec2(0., texel.y)).xy;
      if (uv.x < texel.x) left.x = -texture(velocity, uv).x;
      if (uv.x > 1. - texel.x) right.x = -texture(velocity, uv).x;
      if (uv.y < texel.y) bottom.y = -texture(velocity, uv).y;
      if (uv.y > 1. - texel.y) top.y = -texture(velocity, uv).y;
      result = vec4(0.5 * (right.x - left.x + top.y - bottom.y), 0., 0., 1.);
    }`,
  pressure: `uniform sampler2D source;
    uniform sampler2D divergence;
    void main() {
      float left = texture(source, uv - vec2(texel.x, 0.)).r;
      float right = texture(source, uv + vec2(texel.x, 0.)).r;
      float bottom = texture(source, uv - vec2(0., texel.y)).r;
      float top = texture(source, uv + vec2(0., texel.y)).r;
      result = vec4((left + right + bottom + top - texture(divergence, uv).r) * 0.25, 0., 0., 1.);
    }`,
  project: `uniform sampler2D velocity;
    uniform sampler2D pressure;
    void main() {
      float left = texture(pressure, uv - vec2(texel.x, 0.)).r;
      float right = texture(pressure, uv + vec2(texel.x, 0.)).r;
      float bottom = texture(pressure, uv - vec2(0., texel.y)).r;
      float top = texture(pressure, uv + vec2(0., texel.y)).r;
      result = vec4(texture(velocity, uv).xy - 0.5 * vec2(right - left, top - bottom), 0., 1.);
    }`,
  display: `uniform sampler2D density;
    uniform vec3 surfaceColor;
    void main() {
      float ink = max(0., texture(density, uv).r);
      float mask = smoothstep(0.35, 0.55, pow(ink, 1.5));
      // Keep the heading clear, even after several overlapping strokes.
      mask *= 1.0 - smoothstep(0.77, 0.98, uv.y) * 0.72;
      float grain = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
      // One matte tone, with no surface lighting or bright highlight.
      result = vec4(surfaceColor + (grain - 0.5) / 255., min(mask, 0.45));
    }`,
};

export function createMyCredoFluid(canvas) {
  const gl = canvas.getContext('webgl2', { alpha: true, premultipliedAlpha: false, antialias: false, depth: false, stencil: false });
  if (!gl || !gl.getExtension('EXT_color_buffer_float')) return null;
  const buffer = gl.createBuffer();
  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

  function shader(type, source) {
    const compiled = gl.createShader(type);
    gl.shaderSource(compiled, source);
    gl.compileShader(compiled);
    if (!gl.getShaderParameter(compiled, gl.COMPILE_STATUS)) {
      const error = gl.getShaderInfoLog(compiled);
      gl.deleteShader(compiled);
      throw new Error(error || 'Unable to compile fluid shader');
    }
    return compiled;
  }

  const passes = Object.fromEntries(Object.entries(fragments).map(([name, fragment]) => {
    const program = gl.createProgram();
    const vs = shader(gl.VERTEX_SHADER, vertex);
    const fs = shader(gl.FRAGMENT_SHADER, header + fragment);
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.bindAttribLocation(program, 0, 'position');
    gl.linkProgram(program);
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program) || 'Unable to link fluid shader');
    return [name, { program, uniforms: new Map() }];
  }));
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  gl.disable(gl.BLEND);

  let targets = [];
  let velocity;
  let density;
  let pressure;
  let divergence;
  let width = 1;
  let height = 1;
  let simulationWidth = 1;
  let simulationHeight = 1;

  function target() {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, simulationWidth, simulationHeight, 0, gl.RGBA, gl.HALF_FLOAT, null);
    const framebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) throw new Error('Fluid render target is unsupported');
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    const created = { texture, framebuffer, width: simulationWidth, height: simulationHeight };
    targets.push(created);
    return created;
  }
  function pair() {
    return { read: target(), write: target(), swap() { [this.read, this.write] = [this.write, this.read]; } };
  }
  function releaseTargets() {
    targets.forEach(item => { gl.deleteTexture(item.texture); gl.deleteFramebuffer(item.framebuffer); });
    targets = [];
  }
  function clear() {
    gl.clearColor(0, 0, 0, 0);
    targets.forEach(item => {
      gl.bindFramebuffer(gl.FRAMEBUFFER, item.framebuffer);
      gl.clear(gl.COLOR_BUFFER_BIT);
    });
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }
  function render(pass, destination, uniforms) {
    gl.useProgram(pass.program);
    gl.bindFramebuffer(gl.FRAMEBUFFER, destination?.framebuffer ?? null);
    gl.viewport(0, 0, destination?.width ?? canvas.width, destination?.height ?? canvas.height);
    let unit = 0;
    const values = { texel: [1 / simulationWidth, 1 / simulationHeight], ...uniforms };
    for (const [name, value] of Object.entries(values)) {
      if (!pass.uniforms.has(name)) pass.uniforms.set(name, gl.getUniformLocation(pass.program, name));
      const location = pass.uniforms.get(name);
      if (location === null) continue;
      if (typeof value === 'number') gl.uniform1f(location, value);
      else if (Array.isArray(value)) {
        if (value.length === 3) gl.uniform3fv(location, value);
        else gl.uniform2f(location, value[0], value[1]);
      }
      else {
        gl.activeTexture(gl.TEXTURE0 + unit);
        gl.bindTexture(gl.TEXTURE_2D, value.texture);
        gl.uniform1i(location, unit++);
      }
    }
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
  function resize() {
    const bounds = canvas.getBoundingClientRect();
    width = Math.max(2, bounds.width);
    height = Math.max(2, bounds.height);
    const ratio = Math.min(window.devicePixelRatio || 1, 1.25, 1600 / Math.max(width, height));
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    const scale = Math.min(0.4, 320 / Math.max(width, height));
    simulationWidth = Math.max(2, Math.round(width * scale));
    simulationHeight = Math.max(2, Math.round(height * scale));
    releaseTargets();
    velocity = pair(); density = pair(); pressure = pair(); divergence = target();
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.clear(gl.COLOR_BUFFER_BIT);
  }
  function step(dt, point, delta, active, time, simulate = true) {
    const aspect = width / height;
    if (!simulate) {
      render(passes.display, null, { density: density.read, time, aspect, ...MYCREDO_FLUID_RGB });
      return;
    }
    if (active) {
      render(passes.splat, velocity.write, { source: velocity.read, point, amount: [delta[0] * 70, delta[1] * 70], aspect });
      velocity.swap();
      render(passes.splat, density.write, { source: density.read, point, amount: [Math.min(dt, 1.5) * 0.8, 0], aspect });
      density.swap();
    }
    render(passes.advect, velocity.write, { source: velocity.read, velocity: velocity.read, dt, decay: Math.pow(0.99, dt) });
    velocity.swap();
    render(passes.divergence, divergence, { velocity: velocity.read });
    for (let iteration = 0; iteration < 16; iteration++) {
      render(passes.pressure, pressure.write, { source: pressure.read, divergence });
      pressure.swap();
    }
    render(passes.project, velocity.write, { velocity: velocity.read, pressure: pressure.read });
    velocity.swap();
    render(passes.advect, density.write, { source: density.read, velocity: velocity.read, dt, decay: Math.pow(0.01, dt / (60 * 2.8)) });
    density.swap();
    render(passes.display, null, { density: density.read, time, aspect, ...MYCREDO_FLUID_RGB });
  }
  function dispose() {
    releaseTargets();
    Object.values(passes).forEach(pass => gl.deleteProgram(pass.program));
    gl.deleteBuffer(buffer);
    gl.deleteVertexArray(vao);
    // Lose detached contexts after cleanup, while preserving React's development effect replay.
    queueMicrotask(() => {
      if (!canvas.isConnected) gl.getExtension('WEBGL_lose_context')?.loseContext();
    });
  }
  return { resize, step, clear, dispose };
}

