'use client';

import { Shader, CustomShader, FilmGrain } from 'shaders/react';
import { defineShader, wgsl, transformColor } from 'shaders/std';

// Broad, overlapping color envelopes. There is no periodic palette, fold
// highlight, or threshold that can produce ribbons or outlined bands.
const SoftFields = defineShader({
  name: 'CredoLoanSoftFieldsV4',
  animatedTime: { speed: 'speed' },
  props: {
    coral: { default: '#fc6250', transform: transformColor },
    apricot: { default: '#faae6e', transform: transformColor },
    blue: { default: '#1c8bb9', transform: transformColor },
    sky: { default: '#47b1e3', transform: transformColor },
    coralShade: { default: '#fa8979', transform: transformColor },
    speed: { default: 0.1 },
  },
  paint: wgsl`
    let t = time;
    let q = uv + vec2f(
      0.035 * sin(uv.y * 3.2 + t * 0.45),
      0.028 * sin(uv.x * 3.6 - t * 0.38)
    );
    let coralCenter = vec2f(0.02 + 0.03 * sin(t * 0.52), 0.59);
    let warmCenter = vec2f(0.12, 1.14 + 0.025 * sin(t * 0.43));
    let blueCenter = vec2f(1.08, 0.89 + 0.035 * sin(t * 0.4));
    let skyCenter = vec2f(0.88 + 0.025 * sin(t * 0.48), 0.3);
    let dc = (q - coralCenter) * vec2f(1.08, 0.94);
    let dw = (q - warmCenter) * vec2f(1.0, 0.9);
    let db = (q - blueCenter) * vec2f(0.98, 0.95);
    let ds = (q - skyCenter) * vec2f(1.0, 1.1);
    let wc = exp(-dot(dc, dc) * 4.1);
    let ww = exp(-dot(dw, dw) * 4.0) * 1.1;
    let wb = exp(-dot(db, db) * 4.2);
    let ws = exp(-dot(ds, ds) * 4.0) * 0.85;
    let field = (coral.rgb * wc + apricot.rgb * ww + blue.rgb * wb + sky.rgb * ws)
              / max(wc + ww + wb + ws, 0.0001);
    let hi = max(field.r, max(field.g, field.b));
    let lo = min(field.r, min(field.g, field.b));
    let saturation = (hi - lo) / max(hi, 0.001);
    let neutral = clamp(3.0 * pow(1.0 - saturation, 6.0), 0.0, 1.0);
    let color = mix(field, coralShade.rgb, neutral);
    let opening = 0.31 + 0.045 * sin(uv.x * 5.4 + 0.6 + t * 0.08);
    let reveal = smoothstep(opening, opening + 0.145, uv.y);
    return vec4f(mix(vec3f(1.0), color, reveal), 1.0);
  `,
});

export default function SoftFieldsShader({ onReady, onUnavailable, className }) {
  return <Shader className={className} disableTelemetry colorSpace="srgb" onReady={onReady} onUnavailable={onUnavailable} aria-hidden="true">
    <FilmGrain strength={0.035} bias={0.3} animated={false}>
      <CustomShader src={SoftFields} />
    </FilmGrain>
  </Shader>;
}
