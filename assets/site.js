import { filterVendors } from './directory.mjs';
const vendors = JSON.parse(document.getElementById('vendor-data').textContent);
const list = document.getElementById('vendor-list');
const rows = new Map([...list.children].map(row => [row.dataset.id,row]));
const search = document.getElementById('search');
const category = document.getElementById('category');
const sort = document.getElementById('sort');
const statusButtons = [...document.querySelectorAll('[data-status]')];
const viewButtons = [...document.querySelectorAll('[data-view]')];
const desktop = matchMedia('(min-width: 1001px)');
let status = 'all';
let view = 'all';
let selected = null;
function syncViewport() {
  const active = document.activeElement;
  const inlineFocused = [...rows.values()].some(row=>row.querySelector('.evidence-content').contains(active));
  const inspectorFocused = document.getElementById('inspector-body').contains(active);
  document.documentElement.classList.toggle('js-desktop',desktop.matches);
  rows.forEach((row,id)=>{
    const summary = row.querySelector('summary');
    summary.setAttribute('aria-controls',desktop.matches ? 'inspector-body' : `evidence-${id}`);
    if (desktop.matches) {
      row.open = id === selected;
      summary.setAttribute('aria-expanded',String(row.open));
    } else {
      summary.removeAttribute('aria-expanded');
      if (id === selected) row.open = true;
    }
  });
  if (desktop.matches && inlineFocused) document.getElementById('inspector-body').focus();
  if (!desktop.matches && inspectorFocused && selected) rows.get(selected).querySelector('summary').focus();
}
syncViewport();
desktop.addEventListener('change',syncViewport);
function selectVendor(id, { navigate = false, scroll = false, expand = true } = {}) {
  const row = rows.get(id);
  if (!row) return;
  rows.forEach(other=>{
    other.classList.toggle('selected',other === row);
    if (desktop.matches) {
      other.open = other === row;
      other.querySelector('summary').setAttribute('aria-expanded',String(other.open));
    }
  });
  selected = id;
  const clone = row.querySelector('.evidence-content').cloneNode(true);
  clone.removeAttribute('id');
  document.getElementById('inspector-body').replaceChildren(clone);
  document.getElementById('inspector-body').setAttribute('aria-label',`${vendors.find(v=>v.id===id).name} evidence`);
  if (navigate) document.getElementById('selection-announcement').textContent = `${vendors.find(v=>v.id===id).name} evidence selected.`;
  if (!desktop.matches && expand && (navigate || scroll)) row.open = true;
  if (navigate) history.replaceState(null,'',`#vendor-${id}`);
  if (scroll) row.scrollIntoView({block:'nearest'});
}
function render() {
  const found = filterVendors(vendors,{honorOnly:view==='honor',query:search.value,status,category:category.value,sort:sort.value});
  const ids = new Set(found.map(v=>v.id));
  rows.forEach((row,id)=> { row.hidden = !ids.has(id); });
  found.forEach(v=>list.append(rows.get(v.id)));
  const total = view === 'honor' ? vendors.filter(v=>v.noTax===true).length : vendors.length;
  document.getElementById('result-count').textContent = `${found.length} of ${total} ${view==='honor'?'honor-roll ':''}vendors`;
  document.getElementById('empty').hidden = found.length !== 0;
  statusButtons.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.status===status)));
  viewButtons.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.view===view)));
  // Keep the inspector consistent with the visible result set.
  if (!ids.has(selected)) {
    if (found.length) selectVendor(found[0].id);
    else { selected = null; document.getElementById('inspector-body').replaceChildren(); rows.forEach(row=>row.classList.remove('selected')); syncViewport(); }
  }
}
function reset(nextView = 'all') { search.value=''; category.value='all'; status='all'; sort.value='name'; view=nextView; render(); }
viewButtons.forEach(button=>button.addEventListener('click',()=>{ view=button.dataset.view; status='all'; render(); }));
statusButtons.forEach(button=>button.addEventListener('click',()=>{
  status=button.dataset.status;
  if (!['all','included'].includes(status)) view='all';
  render();
}));
document.getElementById('honor-explore').addEventListener('click',event=>{
  event.preventDefault();
  reset('honor');
  viewButtons.find(button=>button.dataset.view==='honor').focus({preventScroll:true});
  document.getElementById('directory').scrollIntoView({block:'start'});
});
search.addEventListener('input',render);
category.addEventListener('change',render);
sort.addEventListener('change',render);
document.getElementById('clear').addEventListener('click',()=>reset());
document.getElementById('empty-reset').addEventListener('click',()=>reset());
rows.forEach((row,id)=>row.querySelector('summary').addEventListener('click',event=>{
  if (desktop.matches) event.preventDefault();
  selectVendor(id,{navigate:true,expand:false});
}));
function fromHash({ scroll = false } = {}) {
  const id = location.hash.slice(1).replace(/^vendor-/,'');
  if (!rows.has(id)) return;
  reset();
  selectVendor(id,{scroll});
}
window.addEventListener('hashchange',()=>fromHash({scroll:true}));
document.addEventListener('click',event=>{
  if (event.target.closest('.inspector-jump')) {
    event.preventDefault();
    document.getElementById('inspector-body').focus();
    return;
  }
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
