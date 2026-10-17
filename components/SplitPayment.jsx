'use client';

import { useEffect, useState } from 'react';
import OriginalSplitPlan from './split-versions/v1-plan';
import DayaviParticleLogo from './split-versions/v2-particle-logo';

export default function SplitPayment({ version }) {
  const [selected, setSelected] = useState(version || 'particles');
  useEffect(() => {
    if (version) { setSelected(version); return; }
    const requested = new URLSearchParams(window.location.search).get('dayavi');
    if (requested === 'original' || requested === 'particles') setSelected(requested);
  }, [version]);
  return <div className="dayavi-artwork" data-dayavi-version={selected}>
    {selected === 'original' ? <OriginalSplitPlan /> : <DayaviParticleLogo />}
  </div>;
}
