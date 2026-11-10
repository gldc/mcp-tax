export function filterVendors(vendors, { query = '', status = 'all', category = 'all', sort = 'name' } = {}) {
  const needle = query.trim().toLocaleLowerCase();
  return vendors.filter(v => (status === 'all' || v.status === status) && (category === 'all' || v.category === category) && (!needle || [v.name,v.category,v.access,v.cost,v.summary,...v.conditions,...v.sources.map(s=>s.evidence)].join(' ').toLocaleLowerCase().includes(needle)))
    .sort((a,b) => sort === 'checked' ? b.checked.localeCompare(a.checked) || a.name.localeCompare(b.name) : sort === 'status' ? a.status.localeCompare(b.status) || a.name.localeCompare(b.name) : a.name.localeCompare(b.name));
}
