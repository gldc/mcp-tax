import { filterVendors } from './directory.mjs';
const vendors = JSON.parse(document.getElementById('vendor-data').textContent);
const list = document.getElementById('vendor-list');
const rows = new Map([...list.children].map(row => [row.dataset.id,row]));
const search = document.getElementById('search');
const category = document.getElementById('category');
const sort = document.getElementById('sort');
const statusButtons = [...document.querySelectorAll('[data-status]')];
const desktop = matchMedia('(min-width: 1001px)');
let status = 'all';
let selected = null;
function syncViewport() { document.documentElement.classList.toggle('js-desktop',desktop.matches); }
syncViewport();
desktop.addEventListener('change',syncViewport);
function selectVendor(id, { navigate = false, scroll = false } = {}) {
  const row = rows.get(id);
  if (!row) return;
  rows.forEach(other=>other.classList.toggle('selected',other === row));
  selected = id;
  const clone = row.querySelector('.evidence-content').cloneNode(true);
  document.getElementById('inspector-body').replaceChildren(clone);
  if (!desktop.matches && (navigate || scroll)) row.open = true;
  if (navigate) history.replaceState(null,'',`#vendor-${id}`);
  if (scroll) row.scrollIntoView({block:'nearest'});
}
function render() {
  const found = filterVendors(vendors,{query:search.value,status,category:category.value,sort:sort.value});
  const ids = new Set(found.map(v=>v.id));
  rows.forEach((row,id)=> { row.hidden = !ids.has(id); });
  found.forEach(v=>list.append(rows.get(v.id)));
  document.getElementById('result-count').textContent = `${found.length} of ${vendors.length} vendors`;
  document.getElementById('empty').hidden = found.length !== 0;
  statusButtons.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.status===status)));
  // Keep the inspector consistent with the visible result set.
  if (!ids.has(selected)) {
    if (found.length) selectVendor(found[0].id);
    else { selected = null; document.getElementById('inspector-body').replaceChildren(); rows.forEach(row=>row.classList.remove('selected')); }
  }
}
function reset() { search.value=''; category.value='all'; status='all'; sort.value='name'; render(); }
statusButtons.forEach(button=>button.addEventListener('click',()=>{ status=button.dataset.status; render(); }));
search.addEventListener('input',render);
category.addEventListener('change',render);
sort.addEventListener('change',render);
document.getElementById('clear').addEventListener('click',reset);
document.getElementById('empty-reset').addEventListener('click',reset);
rows.forEach((row,id)=>row.querySelector('summary').addEventListener('click',event=>{
  event.preventDefault();
  const nextOpen = !row.open;
  selectVendor(id,{navigate:true});
  if (!desktop.matches) row.open = nextOpen;
}));
function fromHash({ scroll = false } = {}) {
  const id = location.hash.slice(1).replace(/^vendor-/,'');
  if (!rows.has(id)) return;
  reset();
  selectVendor(id,{scroll});
}
window.addEventListener('hashchange',()=>fromHash({scroll:true}));
document.addEventListener('click',event=>{
  const link=event.target.closest('a[href^="#vendor-"]');
  if (!link) return;
  const id=link.getAttribute('href').slice(8);
  if (rows.has(id)) { event.preventDefault(); reset(); selectVendor(id,{navigate:true,scroll:true}); rows.get(id).querySelector('summary').focus({preventScroll:true}); }
});
document.addEventListener('keydown',event=>{ if(event.key==='/'&&!event.metaKey&&!event.ctrlKey&&!event.altKey&&!['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName)){event.preventDefault();search.focus();} });
const themes = [...document.querySelectorAll('button[data-theme]')];
function setTheme(theme) {
  if (!['light','dark'].includes(theme)) theme='dark';
  document.documentElement.dataset.theme=theme;
  themes.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.theme===theme)));
  document.querySelector('meta[name="theme-color"]').content=theme==='dark'?'#191615':'#F5F3EF';
}
try { setTheme(localStorage.getItem('mcp-tax-theme')); } catch { setTheme('dark'); }
themes.forEach(button=>button.addEventListener('click',()=>{setTheme(button.dataset.theme);try{localStorage.setItem('mcp-tax-theme',button.dataset.theme);}catch{/* Theme still works when storage is disabled. */}}));
render();
fromHash({scroll:true});
