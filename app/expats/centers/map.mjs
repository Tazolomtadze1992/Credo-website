/* MapLibre on OpenFreeMap vector tiles (no key, OSM data), restyled in the
   Credo palette. The library is loaded on demand, the first time a map is
   about to scroll into view. */

const STYLE_URL = 'https://tiles.openfreemap.org/styles/positron';
const WORKER_URL = '/vendor/maplibre-gl-worker-6.16.0.mjs';

let lib;
export function loadMaplibre() {
  lib ??= import('maplibre-gl').then(mod => {
    const m = mod.default ?? mod;
    m.setWorkerUrl(WORKER_URL);
    return m;
  });
  return lib;
}

const THEMES = {
  light: {
    bg: '#eef3f5', park: '#e2ebe5', water: '#cddfe8', residential: '#e9eff2', wood: '#e0e9e3', building: '#e2e8eb', buildingLine: '#d6dee3',
    minor: '#ffffff', major: '#ffffff', casing: '#d7e0e5', rail: '#dbe3e7', boundary: '#b4c2ca',
    text: '#7d8a93', halo: '#eef3f5', place: '#2c4553', extrude: '#f7f9fa',
  },
  dark: {
    bg: '#0e171d', park: '#102019', water: '#08121a', residential: '#111c23', wood: '#0f1c19', building: '#16232b', buildingLine: '#1b2a33',
    minor: '#1c2b34', major: '#283c48', casing: '#0e171d', rail: '#1a262e', boundary: '#2f414c',
    text: '#5d717c', halo: '#0e171d', place: '#b9c8d0', extrude: '#1a2a34',
  },
};

const NAME = ['coalesce', ['get', 'name:en'], ['get', 'name_en'], ['get', 'name:latin'], ['get', 'name_int'], ['get', 'name']];
const styles = {};

/* Fetches the base style once and recolors every layer by what it draws. */
export function loadStyle(theme = 'light', { extrude = false } = {}) {
  const key = `${theme}${extrude ? '3d' : ''}`;
  styles[key] ??= fetch(STYLE_URL).then(r => r.json()).then(style => {
    const c = THEMES[theme];
    const paint = (l, k, v) => { l.paint = { ...l.paint, [k]: v }; };
    style.layers = style.layers.filter(l => !/shield|aeroway|railway_.*dashline|ice_shelf|glacier/.test(l.id) && l.type !== 'raster' && l.type !== 'hillshade');
    for (const l of style.layers) {
      const id = l.id;
      if (l.type === 'background') paint(l, 'background-color', c.bg);
      else if (id === 'park') paint(l, 'fill-color', c.park);
      else if (id === 'water') paint(l, 'fill-color', c.water);
      else if (id === 'waterway') paint(l, 'line-color', c.water);
      else if (id.startsWith('landuse')) paint(l, 'fill-color', c.residential);
      else if (id.startsWith('landcover')) paint(l, 'fill-color', c.wood);
      else if (id === 'building') { paint(l, 'fill-color', c.building); paint(l, 'fill-outline-color', c.buildingLine); }
      else if (l.type === 'line' && /casing/.test(id)) paint(l, 'line-color', c.casing);
      else if (l.type === 'line' && /rail/.test(id)) paint(l, 'line-color', c.rail);
      else if (l.type === 'line' && /boundary/.test(id)) paint(l, 'line-color', c.boundary);
      else if (l.type === 'line' && /highway_(major|motorway)|road/.test(id)) paint(l, 'line-color', c.major);
      else if (l.type === 'line' && /highway|path/.test(id)) paint(l, 'line-color', c.minor);
      else if (l.type === 'fill' && /road|pier/.test(id)) paint(l, 'fill-color', c.bg);
      if (l.type === 'symbol') {
        l.layout = { ...l.layout, 'text-field': NAME };
        const place = /label_(city|town|country|state)/.test(id);
        paint(l, 'text-color', place ? c.place : c.text);
        paint(l, 'text-halo-color', c.halo);
        paint(l, 'text-halo-width', 1.2);
        paint(l, 'text-halo-blur', 0);
        if (l.layout['icon-image']) l.layout = { ...l.layout, 'icon-image': '' };
      }
    }
    if (extrude) {
      const at = style.layers.findIndex(l => l.type === 'symbol');
      style.layers.splice(at, 0, {
        id: 'building-3d', type: 'fill-extrusion', source: 'openmaptiles', 'source-layer': 'building', minzoom: 13,
        paint: {
          'fill-extrusion-color': c.extrude,
          'fill-extrusion-height': ['interpolate', ['linear'], ['zoom'], 13, 0, 14.5, ['coalesce', ['get', 'render_height'], 8]],
          'fill-extrusion-base': ['coalesce', ['get', 'render_min_height'], 0],
          'fill-extrusion-opacity': .92,
          'fill-extrusion-vertical-gradient': true,
        },
      });
    }
    return style;
  });
  return styles[key];
}

/* Creates a map in `container`; resolves with { map, lib }. */
export async function createMap(container, { theme = 'light', extrude = false, interactive = true, ...options } = {}) {
  const [m, style] = await Promise.all([loadMaplibre(), loadStyle(theme, { extrude })]);
  const map = new m.Map({
    container, style, interactive,
    attributionControl: { compact: true },
    cooperativeGestures: interactive,
    dragRotate: false, pitchWithRotate: false, touchPitch: false,
    fadeDuration: 0,
    ...options,
  });
  if (interactive) map.addControl(new m.NavigationControl({ showCompass: false }), 'bottom-right');
  return { map, lib: m };
}

export const toLngLat = c => [c.lng, c.lat];
