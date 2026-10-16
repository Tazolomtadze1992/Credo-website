'use client';

import { useEffect } from 'react';
import { DialRoot, useDialKitController } from 'dialkit';
import 'dialkit/styles.css';

// Authoring controls are loaded only at /?globeControls=1#transfer-globe.
const config = {
  zoom: [1.18, .65, 1.8, .01],
  vertical: [-2, -20, 25, .5],
  reset: { type: 'action', label: 'Reset framing' },
};

export default function GlobeDialKit({ onFramingChange }) {
  const dial = useDialKitController('Globe framing', config, {
    id: 'credo-transfer-globe-framing',
    persist: true,
    onAction(action) {
      if (action === 'reset') dial.resetValues();
    },
  });
  const { zoom, vertical } = dial.values;

  useEffect(() => {
    onFramingChange({ zoom, y: vertical / 100 });
  }, [zoom, vertical, onFramingChange]);

  // DialRoot portals to the body. Stop React's portal events reaching the card.
  return <div onClick={event => event.stopPropagation()}>
    <DialRoot position="bottom-left" theme="light" defaultOpen productionEnabled />
  </div>;
}
