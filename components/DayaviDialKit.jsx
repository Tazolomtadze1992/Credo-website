'use client';

import { useEffect } from 'react';
import { DialRoot, useDialKitController } from 'dialkit';
import 'dialkit/styles.css';

// Authoring only: /?dayaviControls=1#products. The ordinary card uses code defaults.
const config = {
  zoom: [1, .6, 1.25, .01],
  dotWeight: [.83, .4, 1.1, .01],
  cursorRadius: [16, 12, 40, 1],
  push: [95, 20, 150, 1],
  opacity: [95, 40, 100, 1],
  reset: { type: 'action', label: 'Reset logo' },
};

export default function DayaviDialKit({ onSettingsChange, mountRoot = true }) {
  const dial = useDialKitController('და-ყა-ვი · particles', config, {
    id: 'credo-dayavi-particles-v2',
    persist: true,
    onAction(action) { if (action === 'reset') dial.resetValues(); },
  });
  const { zoom, dotWeight, cursorRadius, push, opacity } = dial.values;
  useEffect(() => {
    onSettingsChange({ zoom, dotScale: dotWeight, radius: cursorRadius / 100, force: push / 100, opacity: opacity / 100 });
  }, [zoom, dotWeight, cursorRadius, push, opacity, onSettingsChange]);

  // When both editors are requested, the existing globe root displays both panels.
  return mountRoot ? <div onClick={event => event.stopPropagation()}>
    <DialRoot position="bottom-left" theme="light" defaultOpen productionEnabled />
  </div> : null;
}
