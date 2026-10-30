export const FILTER_GROUPS = [
  { id: 'statuses', label: 'სტატუსი', options: [
    { id: 'online', label: 'ონლაინ' },
    { id: 'offline', label: 'ოფლაინ' },
  ] },
  { id: 'categories', label: 'კატეგორია', options: [
    { id: 'tech', label: 'ტექნიკა', icon: 'tech' },
    { id: 'home', label: 'სახლი და ინტერიერი', icon: 'home' },
    { id: 'fashion', label: 'მოდა და აქსესუარები', icon: 'fashion' },
  ] },
  { id: 'locations', label: 'ლოკაცია', options: [
    { id: 'tbilisi', label: 'თბილისი' },
    { id: 'kutaisi', label: 'ქუთაისი' },
    { id: 'batumi', label: 'ბათუმი' },
    { id: 'rustavi', label: 'რუსთავი' },
    { id: 'zugdidi', label: 'ზუგდიდი' },
    { id: 'gori', label: 'გორი' },
    { id: 'poti', label: 'ფოთი' },
    { id: 'telavi', label: 'თელავი' },
    { id: 'akhaltsikhe', label: 'ახალციხე' },
  ] },
];

// Presentation fixtures only, not a verified partner acceptance/branch directory.
// Replace this metadata with the partner API; existing card assets/content stay intact.
export const PREVIEW_AVAILABILITY = {
  elite: { statuses: ['online', 'offline'], locations: ['tbilisi', 'kutaisi', 'batumi', 'zugdidi'] },
  zoommer: { statuses: ['online', 'offline'], locations: ['tbilisi', 'kutaisi', 'batumi', 'rustavi', 'gori', 'telavi', 'zugdidi', 'poti', 'akhaltsikhe'] },
  ispace: { statuses: ['online', 'offline'], locations: ['tbilisi', 'batumi', 'kutaisi'] },
  dressup: { statuses: ['offline'], locations: ['tbilisi', 'batumi', 'kutaisi', 'zugdidi'] },
  embawood: { statuses: ['offline'], locations: ['tbilisi', 'kutaisi', 'batumi', 'rustavi', 'gori', 'telavi', 'zugdidi', 'akhaltsikhe'] },
  domino: { statuses: ['online', 'offline'], locations: ['tbilisi', 'batumi'] },
};

export function emptyFilters() {
  return { statuses: [], categories: [], locations: [] };
}

export function copyFilters(filters) {
  return Object.fromEntries(FILTER_GROUPS.map(group => [group.id, [...filters[group.id]]]));
}

export function filterCount(filters) {
  return FILTER_GROUPS.reduce((count, group) => count + filters[group.id].length, 0);
}

export function toggleFilter(filters, group, value) {
  const values = filters[group];
  return { ...filters, [group]: values.includes(value) ? values.filter(item => item !== value) : [...values, value] };
}

// Choices within a group are OR; different groups are AND. No choice means all.
export function matchesFilters(shop, filters) {
  return (!filters.categories.length || filters.categories.includes(shop.category))
    && (!filters.statuses.length || filters.statuses.some(value => shop.statuses.includes(value)))
    && (!filters.locations.length || filters.locations.some(value => shop.locations.includes(value)));
}

export function selectedFilters(filters) {
  return FILTER_GROUPS.flatMap(group => group.options
    .filter(option => filters[group.id].includes(option.id))
    .map(option => ({ ...option, group: group.id })));
}
