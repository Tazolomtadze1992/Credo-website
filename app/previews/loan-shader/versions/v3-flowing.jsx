'use client';

import { Shader, CustomShader, FlowingGradient, FilmGrain } from 'shaders/react';
import { defineShader, wgsl, transformColor } from 'shaders/std';

// Keep the white opening independent of the color field. The library's flowing
// field handles the domain warp and varying transition softness. Adjacent
// palette corners belong to the same family so the two blend axes stay clear.
const WhiteOpening = defineShader({
  name: 'CredoLoanWhiteOpening',
  animatedTime: { speed: 'speed' },
  props: {
    speed: { default: 0.16 },
    coralShade: { default: '#fa8979', transform: transformColor }, // oklch(.75 .14 29.48)
  },
  effect: wgsl`
    let opening = 0.31 + 0.045 * sin(uv.x * 5.4 + 0.6 + time * 0.08);
    let reveal = smoothstep(opening, opening + 0.145, uv.y);
    let hi = max(child.r, max(child.g, child.b));
    let lo = min(child.r, min(child.g, child.b));
    let saturation = (hi - lo) / max(hi, 0.001);
    // Restore the primary hue in neutral overlap. This continuous response has
    // no threshold that could draw a contour around a color field.
    let neutral = clamp(3.0 * pow(1.0 - saturation, 6.0), 0.0, 1.0);
    let color = mix(child.rgb, coralShade.rgb, neutral);
    return vec4f(mix(vec3f(1.0), color, reveal), child.a);
  `,
});

export default function LoanShader({ onReady, onUnavailable, className }) {
  return <Shader className={className} disableTelemetry colorSpace="srgb" onReady={onReady} onUnavailable={onUnavailable} aria-hidden="true">
    <FilmGrain strength={0.045} bias={0.3} animated={false}>
      <CustomShader src={WhiteOpening}>
        <FlowingGradient
          colorA="#fc6250"
          colorB="#faae6e"
          colorC="#1c8bb9"
          colorD="#47b1e3"
          colorSpace="linear"
          distortion={0.3}
          speed={0.14}
          seed={0}
        />
      </CustomShader>
    </FilmGrain>
  </Shader>;
}
