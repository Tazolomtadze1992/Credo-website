// A single GPU draw call for the land points and their occasional outward drift.
export const pointVertex = /* glsl */`
  uniform float time;
  uniform float height;
  uniform float pixelRatio;
  uniform float burst;
  attribute vec4 scatter;
  varying float tone;
  varying float visibility;
  varying float facing;
  varying float mist;
  void main() {
    vec3 normal = normalize(position);
    float period = 13.33 * mix(.7, 1.7, scatter.x);
    float phase = mod(time + scatter.y * period, period);
    float flight = 8.86 * mix(.667, 1.5, scatter.z);
    float progress = clamp(phase / flight, 0., 1.);
    float participation = step(scatter.w, .05 * burst);
    float lift = participation * (1. - step(flight, phase)) * smoothstep(0., 1., progress);
    vec3 tangent = normalize(cross(normal, vec3(.001, 1., 0.)));
    vec3 bitangent = cross(normal, tangent);
    float flowTime = time * .75 + scatter.y * 12.37;
    vec3 flow = tangent * sin(flowTime) + bitangent * cos(flowTime * .8);
    vec3 displaced = position + (normal * .6 * burst + flow * .252) * lift;
    vec4 world = modelMatrix * vec4(displaced, 1.);
    vec3 surfaceNormal = normalize(mat3(modelMatrix) * normal);
    facing = dot(normalize(cameraPosition - world.xyz), surfaceNormal);
    vec3 direction = normalize(world.xyz);
    tone = .5 + dot(direction.xy, vec2(-.70710678)) * .5;
    mist = lift;
    float outFade = 1. - smoothstep(.65, 1., progress);
    float returnFade = smoothstep(flight, flight + 1.71, phase);
    visibility = mix(1., mix(outFade, 1., returnFade), participation);
    vec4 view = modelViewMatrix * vec4(displaced, 1.);
    gl_Position = projectionMatrix * view;
    float size = .12 * mix(.625, 1.375, scatter.z);
    float shrink = mix(1., .35, smoothstep(.15, .85, lift));
    gl_PointSize = max(.5, size * (pixelRatio / 2.) * height / 800. * 300. / -view.z * shrink);
  }
`;
export const pointFragment = /* glsl */`
  uniform vec3 pointCoral;
  uniform vec3 pointNeutral;
  uniform vec3 pointBlue;
  varying float tone;
  varying float visibility;
  varying float facing;
  varying float mist;
  void main() {
    float radius = length(gl_PointCoord - .5);
    if (radius > .5) discard;
    // A pale neutral bridge keeps the brand's warm and cool hues distinct.
    vec3 color = mix(pointCoral, pointNeutral, clamp((tone - .024) / .3554, 0., 1.));
    color = mix(color, pointBlue, clamp((tone - .3794) / .4147, 0., 1.));
    float depth = pow(clamp((facing + .1) / .35, 0., 1.), 2.);
    float alpha = (1. - smoothstep(.4, .5, radius)) * .6 * mix(.15, 1., depth) * visibility;
    gl_FragColor = vec4(mix(color, vec3(1.), mist * .45), alpha);
    #include <colorspace_fragment>
  }
`;
