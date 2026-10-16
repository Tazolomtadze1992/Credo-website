// A single GPU draw call for the land points and their occasional outward drift.
export const pointVertex = /* glsl */`
  uniform float time;
  uniform float height;
  uniform float pixelRatio;
  uniform float projectionScale;
  uniform float dotSize;
  uniform float burst;
  attribute vec4 scatter;
  attribute float opacityVariation;
  varying float tone;
  varying float visibility;
  varying float facing;
  varying float mist;
  varying float pointOpacity;
  void main() {
    vec3 normal = normalize(position);
    float variance = mix(.667, 1.5, scatter.z);
    float flight = 8.86 * variance;
    float fade = 1.71 * variance;
    float period = max(flight + fade, 13.33 * mix(.7, 1.7, scatter.x));
    float phase = mod(time + scatter.y * period, period);
    float launchIndex = mod(floor((time + scatter.y * period) / period), 100.);
    float launchSeed = fract((scatter.y * 127.1 + launchIndex * 311.7) * .00001 + scatter.y);
    float progress = clamp(phase / flight, 0., 1.);
    float participation = step(scatter.w, .25) * step(launchSeed, .2 * burst);
    float lift = participation * (1. - step(flight, phase)) * smoothstep(0., 1., progress);
    vec3 tangent = normalize(cross(normal, vec3(.001, 1., 0.)));
    vec3 bitangent = cross(normal, tangent);
    float flowTime = (launchIndex + mod(time / variance, 6.283)) * .75 + scatter.y * 12.37;
    vec3 flow = tangent * sin(flowTime) + bitangent * cos(flowTime * .8);
    vec3 displaced = position + (normal * .6 * burst + flow * .252) * lift;
    vec4 world = modelMatrix * vec4(displaced, 1.);
    vec3 surfaceNormal = normalize(mat3(modelMatrix) * normal);
    facing = dot(normalize(cameraPosition - world.xyz), surfaceNormal);
    vec3 direction = normalize(world.xyz);
    tone = .5 + dot(direction.xy, vec2(-.70710678)) * .5;
    mist = lift;
    pointOpacity = opacityVariation;
    float outFade = 1. - smoothstep(.65, 1., progress);
    float returnFade = smoothstep(flight, flight + fade, phase);
    visibility = mix(1., mix(outFade, 1., returnFade), participation);
    vec4 view = modelViewMatrix * vec4(displaced, 1.);
    gl_Position = projectionMatrix * view;
    float size = dotSize * mix(.625, 1.375, scatter.z);
    float shrink = mix(1., .35, smoothstep(.15, .85, lift));
    // Camera zoom enlarges positions but not WebGL point sprites automatically.
    gl_PointSize = max(.5, size * (pixelRatio / 2.) * height * projectionScale / 800. * 300. / -view.z * shrink);
  }
`;
export const pointFragment = /* glsl */`
  uniform vec3 pointCoral;
  uniform vec3 pointMid;
  uniform vec3 pointBlue;
  varying float tone;
  varying float visibility;
  varying float facing;
  varying float mist;
  varying float pointOpacity;
  void main() {
    float radius = length(gl_PointCoord - .5);
    if (radius > .5) discard;
    // A blue brand shade carries the middle of the field instead of gray.
    vec3 color = mix(pointCoral, pointMid, clamp((tone - .024) / .3554, 0., 1.));
    color = mix(color, pointBlue, clamp((tone - .3794) / .4147, 0., 1.));
    float depth = pow(clamp((facing + .1) / .35, 0., 1.), 2.);
    float alpha = (1. - smoothstep(.4, .5, radius)) * .6 * pointOpacity
      * mix(.15, 1., depth) * mix(1., .5, mist) * visibility;
    gl_FragColor = vec4(mix(color, vec3(1.), mist * .45), alpha);
    #include <colorspace_fragment>
  }
`;

// Screen-oriented body shading and a quiet rim, independent of land rotation.
export const surfaceVertex = /* glsl */`
  varying float field;
  varying float rim;
  void main() {
    vec4 world = modelMatrix * vec4(position, 1.);
    vec3 worldNormal = normalize(mat3(modelMatrix) * normal);
    vec3 screenDirection = normalize(world.xyz) * vec3(1., 1., -1.);
    vec3 gradientDirection = normalize(vec3(-.51621879, -.73723684, .1));
    field = dot(screenDirection, gradientDirection) * .5 + .5;
    rim = 1. - max(dot(normalize(cameraPosition - world.xyz), worldNormal), 0.);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);
  }
`;
export const surfaceFragment = /* glsl */`
  uniform vec3 surfaceBlue;
  uniform vec3 surfaceRim;
  varying float field;
  varying float rim;
  void main() {
    float gradient = clamp(.5 + (clamp(field - .4, 0., 1.) - .5) * 2., 0., 1.);
    vec3 color = mix(vec3(1.), surfaceBlue, gradient);
    color = mix(color, surfaceRim, clamp(pow(clamp(rim, 0., 1.), .3) * .1, 0., 1.));
    gl_FragColor = vec4(color, .2);
    #include <colorspace_fragment>
  }
`;
