export const versions = [
  { id: 'curved', number: 'V2', name: 'Curved blend', detail: 'Earlier version · curved boundary', saved: true },
  { id: 'flowing', number: 'V3', name: 'Flowing blend', detail: 'Saved version · the direction you liked', saved: true },
  { id: 'soft', number: 'V4', name: 'Soft fields', detail: 'Saved version · large soft areas, very calm drift', saved: true },
  { id: 'organic', number: 'V5', name: 'Organic fields', detail: 'New version · broad soft areas with more organic movement', saved: false },
];

export const latestVersion = versions.at(-1);
export const versionById = id => versions.find(version => version.id === id) || latestVersion;

export const comparisonById = (selected, requested) => {
  const candidate = versionById(requested);
  return candidate.id !== selected ? candidate : selected === latestVersion.id ? versions.at(-2) : latestVersion;
};

// Comparison links created before V5 did not specify their second version.
export const legacyComparisonId = id => id === 'soft' ? 'flowing' : ['curved', 'flowing'].includes(id) ? 'soft' : undefined;
