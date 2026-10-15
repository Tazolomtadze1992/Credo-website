export const sharedBentoVersions = Object.freeze([
  { id: 'soft', number: 'V1', name: 'Soft flow', detail: 'The original shared flow: pale coral, sky blue and warm white.' },
  { id: 'rich', number: 'V2', name: 'Rich flow', detail: 'The same movement, with deeper ocean blue and terracotta inside the soft color areas.' },
]);
export const latestSharedVersion = 'rich';
export const sharedVersionById = id => sharedBentoVersions.find(version => version.id === id) || sharedBentoVersions.at(-1);
export const loadSharedBentoVersion = id => id === 'soft' ? import('./v1-soft.mjs') : import('./v2-rich.mjs');
