// Reference measurements from Stripe's money-movement bento, October 2026.
export const GLOBE = Object.freeze({
  radius: 2,
  cameraFov: 25,
  cameraZ: 11.7,
  rotationSpeed: .069,
  initialRotation: 70 * Math.PI / 180,
  tiltX: -2 * Math.PI / 180,
  tiltZ: 8 * Math.PI / 180,
  maxRoutes: 4,
  spawnMin: 1.5,
  spawnMax: 4,
  markerA: .6,
  markerB: .55,
  labelEnter: .8,
  labelExit: .6,
  retreat: 2.2,
});
export const clamp01 = n => Math.min(1, Math.max(0, n));
export const easeOut = n => 1 - (1 - clamp01(n)) ** 3;
export const easeInOut = n => {
  const t = clamp01(n);
  return t < .5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
};
export function routeTiming(distanceKm, simple = false) {
  const line = simple ? 1.2 : Math.max(1.8, Math.min(4.5, 2.8 * distanceKm / 8000));
  const markerA = simple ? .3 : GLOBE.markerA;
  const markerB = simple ? .25 : GLOBE.markerB;
  const drawn = markerA + markerB + line;
  const labelEnter = simple ? 0 : GLOBE.labelEnter;
  const travel = simple ? 0 : 5 * Math.min(1.2, 1 + distanceKm / 10000 * .12);
  const arrived = drawn + labelEnter + travel;
  const retreat = simple ? .8 : GLOBE.retreat;
  return { markerA, markerB, line, drawn, labelEnter, travel, arrived, retreat, end: arrived + retreat + .6 };
}
export function routeFrame(age, timing, simple = false) {
  const retreat = easeInOut((age - timing.arrived) / timing.retreat);
  const markerFade = 1 - easeOut((age - timing.arrived - timing.retreat * .8) / .6);
  const intro = easeOut((age - timing.drawn) / Math.max(.001, timing.labelEnter));
  const travel = easeInOut((age - timing.drawn - timing.labelEnter) / Math.max(.001, timing.travel));
  const outro = clamp01((age - timing.arrived) / GLOBE.labelExit);
  return {
    startMarker: easeOut(age / timing.markerA) * markerFade,
    endMarker: easeOut((age - timing.markerA) / timing.markerB) * markerFade,
    head: easeOut((age - timing.markerA - timing.markerB) / timing.line),
    tail: retreat,
    opacity: (1 - retreat),
    labelProgress: .01 + .98 * travel,
    labelOpacity: simple ? 0 : intro * (1 - outro ** 3),
    labelScale: simple ? 0 : intro * (1 - outro ** 3),
    done: age >= timing.end,
  };
}
export function cityDistance(a, b) {
  const rad = Math.PI / 180;
  const dlat = (b.lat - a.lat) * rad, dlon = (b.lon - a.lon) * rad;
  const h = Math.sin(dlat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dlon / 2) ** 2;
  return 12742 * Math.atan2(Math.sqrt(h), Math.sqrt(Math.max(0, 1 - h)));
}
export const CITIES = [
  { name: 'Tbilisi', lat: 41.7151, lon: 44.8271, flag: 'ge', currency: 'GEL', symbol: '₾' },
  { name: 'London', lat: 51.5074, lon: -.1278, flag: 'gb', currency: 'GBP', symbol: '£' },
  { name: 'Amsterdam', lat: 52.3676, lon: 4.9041, flag: 'nl', currency: 'EUR', symbol: '€' },
  { name: 'Paris', lat: 48.8566, lon: 2.3522, flag: 'fr', currency: 'EUR', symbol: '€' },
  { name: 'Berlin', lat: 52.52, lon: 13.405, flag: 'de', currency: 'EUR', symbol: '€' },
  { name: 'Rome', lat: 41.9028, lon: 12.4964, flag: 'it', currency: 'EUR', symbol: '€' },
  { name: 'Madrid', lat: 40.4168, lon: -3.7038, flag: 'es', currency: 'EUR', symbol: '€' },
  { name: 'Istanbul', lat: 41.0082, lon: 28.9784, flag: 'tr', currency: 'TRY', symbol: '₺' },
  { name: 'New York', lat: 40.7128, lon: -74.006, flag: 'us', currency: 'USD', symbol: '$' },
  { name: 'Los Angeles', lat: 34.0522, lon: -118.2437, flag: 'us', currency: 'USD', symbol: '$' },
  { name: 'Toronto', lat: 43.6532, lon: -79.3832, flag: 'ca', currency: 'CAD', symbol: '$' },
  { name: 'Mexico City', lat: 19.4326, lon: -99.1332, flag: 'mx', currency: 'MXN', symbol: '$' },
  { name: 'São Paulo', lat: -23.5505, lon: -46.6333, flag: 'br', currency: 'BRL', symbol: 'R$' },
  { name: 'Cape Town', lat: -33.9249, lon: 18.4241, flag: 'za', currency: 'ZAR', symbol: 'R' },
  { name: 'Dubai', lat: 25.2048, lon: 55.2708, flag: 'ae', currency: 'AED', symbol: '' },
  { name: 'Mumbai', lat: 19.076, lon: 72.8777, flag: 'in', currency: 'INR', symbol: '₹' },
  { name: 'Singapore', lat: 1.3521, lon: 103.8198, flag: 'sg', currency: 'SGD', symbol: '$' },
  { name: 'Tokyo', lat: 35.6762, lon: 139.6503, flag: 'jp', currency: 'JPY', symbol: '¥' },
  { name: 'Seoul', lat: 37.5665, lon: 126.978, flag: 'kr', currency: 'KRW', symbol: '₩' },
  { name: 'Shanghai', lat: 31.2304, lon: 121.4737, flag: 'cn', currency: 'CNY', symbol: '¥' },
  { name: 'Sydney', lat: -33.8688, lon: 151.2093, flag: 'au', currency: 'AUD', symbol: '$' },
];
