'use client';

import { Shader, CustomShader, FilmGrain } from 'shaders/react';
import { defineShader, wgsl, transformColor } from 'shaders/std';

// Large color pools with independent changes of position, shape and direction.
// The low-frequency warp never folds the domain into ribbons. All color
// transitions come from overlapping smooth envelopes, without contour lights.
const OrganicFields = defineShader({
  name: 'CredoLoanOrganicFieldsV5',
  animatedTime: { speed: 'speed' },
  props: {
    coral: { default: '#fc6250', transform: transformColor },
    apricot: { default: '#faae6e', transform: transformColor },
    blue: { default: '#1c8bb9', transform: transformColor },
    sky: { default: '#47b1e3', transform: transformColor },
    coralShade: { default: '#fa8979', transform: transformColor },
    speed: { default: 0.17 },
  },
  paint: wgsl`
    let t = time;
    let q = uv + vec2f(
      0.10 * sin(uv.y * 3.2 + t * 0.45)
        + 0.045 * sin(uv.x * 2.5 + uv.y * 2.2 - t * 0.28),
      0.08 * sin(uv.x * 3.8 - t * 0.38)
        + 0.035 * cos(uv.y * 3.2 - uv.x * 2.0 + t * 0.22)
    );
    let coralCenter = vec2f(0.07 + 0.075 * sin(t * 0.51), 0.6 + 0.04 * cos(t * 0.39));
    let warmCenter = vec2f(0.25 + 0.09 * sin(t * 0.41 + 1.1), 1.04 + 0.06 * sin(t * 0.33 + 0.7));
    let blueCenter = vec2f(1.0 + 0.07 * sin(t * 0.37 + 2.0), 0.81 + 0.07 * cos(t * 0.43 + 1.6));
    let skyCenter = vec2f(0.8 + 0.08 * cos(t * 0.35 + 0.8), 0.36 + 0.06 * sin(t * 0.49 + 2.1));

    let coralAngle = 0.24 * sin(t * 0.47);
    let warmAngle = -0.26 * cos(t * 0.34 + 0.8);
    let blueAngle = 0.2 * sin(t * 0.31 + 1.9);
    let skyAngle = -0.18 * sin(t * 0.38 + 1.2);
    let dc = (mat2x2f(cos(coralAngle), -sin(coralAngle), sin(coralAngle), cos(coralAngle)) * (q - coralCenter)) * vec2f(1.13, 0.83);
    let dw = (mat2x2f(cos(warmAngle), -sin(warmAngle), sin(warmAngle), cos(warmAngle)) * (q - warmCenter)) * vec2f(0.94, 1.06);
    let db = (mat2x2f(cos(blueAngle), -sin(blueAngle), sin(blueAngle), cos(blueAngle)) * (q - blueCenter)) * vec2f(1.01, 0.91);
    let ds = (mat2x2f(cos(skyAngle), -sin(skyAngle), sin(skyAngle), cos(skyAngle)) * (q - skyCenter)) * vec2f(0.94, 1.08);
    let wc = exp(-dot(dc, dc) * (4.75 + 0.25 * sin(t * 0.33)));
    let ww = exp(-dot(dw, dw) * (4.3 + 0.25 * cos(t * 0.4))) * 1.06;
    let wb = exp(-dot(db, db) * (4.5 + 0.2 * sin(t * 0.37 + 1.0)));
    let ws = exp(-dot(ds, ds) * (4.6 + 0.25 * sin(t * 0.29 + 2.0))) * 0.9;
    let field = (coral.rgb * wc + apricot.rgb * ww + blue.rgb * wb + sky.rgb * ws)
              / max(wc + ww + wb + ws, 0.0001);
    let hi = max(field.r, max(field.g, field.b));
    let lo = min(field.r, min(field.g, field.b));
    let saturation = (hi - lo) / max(hi, 0.001);
    // Smoothly retain the primary hue in neutral overlap, without the flat
    // clipped plateau of a hard cap on the color correction.
    let neutral = 1.0 - exp(-4.0 * pow(1.0 - saturation, 6.0));
    let color = mix(field, coralShade.rgb, neutral);
    // Match V4's opening and its physical drift rate despite the livelier field.
    let opening = 0.31 + 0.045 * sin(uv.x * 5.4 + 0.6 + t * 0.047058824);
    let reveal = smoothstep(opening, opening + 0.145, uv.y);
    return vec4f(mix(vec3f(1.0), color, reveal), 1.0);
  `,
});

export default function OrganicFieldsShader({ onReady, onUnavailable, className }) {
  return <Shader className={className} disableTelemetry colorSpace="srgb" onReady={onReady} onUnavailable={onUnavailable} aria-hidden="true">
    <FilmGrain strength={0.04} bias={0.3} animated={false}>
      <CustomShader src={OrganicFields} />
    </FilmGrain>
  </Shader>;
}
