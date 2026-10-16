'use client';

import { useEffect, useState } from 'react';
import SavingsIllustration from './savings-versions/v1-illustration';
import SavingsPhotoGoal from './savings-versions/v2-photo-goal';
import SavingsBalancedGoal from './savings-versions/v3-balanced';
import SavingsParticleGoal from './savings-versions/v4-particles';
import SavingsLogoParticleGoal from './savings-versions/v5-logo-particles';
import CredoFamilyParticles from './savings-versions/v6-family-particles';
import CredoFamilyWash from './savings-versions/v7-family-wash';
import CredoFamilyAiry from './savings-versions/v8-family-airy';
import ProductCard from './ProductCard';

export default function SavingsGoal({ onExploreSavings, onJoinFamily }) {
  const [version, setVersion] = useState('family-airy');
  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get('savings');
    if (['original', 'photo', 'balanced', 'particles', 'logo', 'family', 'family-soft', 'family-airy'].includes(requested)) setVersion(requested);
  }, []);
  const family = ['family', 'family-soft', 'family-airy'].includes(version);
  const visual = version === 'original' ? <SavingsIllustration />
    : version === 'photo' ? <SavingsPhotoGoal />
    : version === 'balanced' ? <SavingsBalancedGoal />
    : version === 'particles' ? <SavingsParticleGoal />
    : version === 'logo' ? <SavingsLogoParticleGoal />
    : version === 'family' ? <CredoFamilyParticles />
    : version === 'family-soft' ? <CredoFamilyWash /> : <CredoFamilyAiry />;
  return <ProductCard kind="savings"
    title={family ? 'გახდი კრედოს ოჯახის წევრი' : 'დააგროვე მნიშვნელოვანი მიზნისთვის'}
    onExplore={family ? onJoinFamily : onExploreSavings}>{visual}</ProductCard>;
}
