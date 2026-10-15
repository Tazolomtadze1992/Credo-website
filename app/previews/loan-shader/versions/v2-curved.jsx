'use client';

import { Shader, CustomShader, FilmGrain } from 'shaders/react';
import { defineShader, wgsl, transformColor } from 'shaders/std';

// Gamut-checked OKLCH hues: coral 29.48°, blue 232.094°.
// The palette meets only across a narrow warped seam, rather than averaging
// complementary colors over the entire canvas.
const CredoSunrise = defineShader({
  name: 'CredoLoanSunrise',
  animatedTime: { speed: 'speed' },
  props: {
    coral: { default: '#fc6250', transform: transformColor }, // .692 .192 29.48
    warm: { default: '#faae6e', transform: transformColor }, // .81 .12 60
    blue: { default: '#1c8bb9', transform: transformColor }, // .6 .115 232.094
    sky: { default: '#47b1e3', transform: transformColor }, // .72 .12 232.094
    deepBlue: { default: '#1e6e91', transform: transformColor }, // Credo secondary
    peach: { default: '#fbc8ab', transform: transformColor }, // .87 .07 51
    speed: { default: 0.16 },
  },
  paint: wgsl`
    let t = time;
    let y = uv.y;
    let fold = 0.12 * sin(y * 5.1 + t * 0.6)
             + 0.055 * sin(y * 10.6 - t * 0.43)
             + 0.025 * sin(uv.x * 5.0 + y * 7.2 + t * 0.3);
    let seam = 0.49 + fold;
    let softness = 0.07 + 0.035 * (0.5 + 0.5 * sin(y * 6.3 + t * 0.4));
    let s = smoothstep(seam - softness, seam + softness, uv.x);
    let warmCenter = vec2f(-0.06 + 0.06 * sin(t * 0.3), 1.05);
    let warmDistance = (uv - warmCenter) * vec2f(1.7, 1.3);
    let warmLight = exp(-dot(warmDistance, warmDistance) * 2.1) * 0.92;
    let warmColor = mix(coral.rgb, warm.rgb, warmLight);
    let skyCenter = vec2f(1.02, 0.38 + 0.07 * sin(t * 0.24));
    let skyDistance = (uv - skyCenter) * vec2f(1.1, 1.5);
    let coolLight = exp(-dot(skyDistance, skyDistance) * 2.0) * 0.85;
    var coolColor = mix(blue.rgb, sky.rgb, coolLight);
    coolColor = mix(coolColor, deepBlue.rgb, smoothstep(0.65, 1.2, y + uv.x * 0.12) * 0.38);
    // A warm luminous shoulder keeps the complementary seam from turning brown.
    var color = mix(warmColor, peach.rgb, smoothstep(0.0, 0.46, s));
    color = mix(color, sky.rgb, smoothstep(0.42, 0.7, s));
    color = mix(color, coolColor, smoothstep(0.7, 1.0, s));
    let opening = 0.31 + 0.045 * sin(uv.x * 5.4 + 0.6 + t * 0.08);
    let reveal = smoothstep(opening, opening + 0.145, y);
    return vec4f(mix(vec3f(1.0), color, reveal), 1.0);
  `,
});

export default function LoanShader({ onReady, onUnavailable, className }) {
  return <Shader className={className} disableTelemetry colorSpace="srgb" onReady={onReady} onUnavailable={onUnavailable} aria-hidden="true">
    <FilmGrain strength={0.045} bias={0.3} animated={false}>
      <CustomShader src={CredoSunrise} />
    </FilmGrain>
  </Shader>;
}
