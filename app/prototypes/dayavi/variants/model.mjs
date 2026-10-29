export const PAYMENT_MODEL = Object.freeze({ total: 1200, count: 8, payment: 150 });
const clamp = x => Math.max(0, Math.min(1, x));
export const smooth = (a, b, value) => { const x = clamp((value - a) / (b - a)); return x * x * (3 - 2 * x); };
export function mechanismPose(progress) {
  const t = clamp(progress);
  return {
    press: t < .24 ? Math.sin(t / .24 * Math.PI) : 0,
    spread: smooth(.30, .78, t),
    paymentInk: smooth(.32, .68, t),
    totalInk: 1 - smooth(.29, .44, t),
  };
}
export function tourAt(seconds) {
  const t = seconds % 14;
  if (t < 1.5) return 0;
  if (t < 5.7) return smooth(1.5, 5.7, t);
  if (t < 9) return 1;
  if (t < 12) return 1 - smooth(9, 12, t);
  return 0;
}
