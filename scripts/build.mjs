import { readFile, writeFile, mkdir, cp } from 'node:fs/promises';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const labels = {included:'Included',limited:'Limited free',gated:'Plan gated',metered:'Metered',unclear:'Unclear'};
const featuredHonor = ['github','cloudflare','datadog','stripe','linear','supabase','gitlab','vercel','sentry','neon','hugging-face','clickhouse'];
function evidence(v) {
  return `<div class="evidence-content" id="evidence-${escape(v.id)}"><div class="detail-heading"><span class="eyebrow">${escape(v.category)}</span><h3>${escape(v.name)}</h3><span class="badge ${escape(v.status)}">${labels[v.status]}</span>${v.preview ? '<span class="preview">Preview</span>':''}</div><p class="detail-summary">${escape(v.summary)}</p>${v.notice ? `<p class="notice">${escape(v.notice)}</p>`:''}<dl><dt>Access requirement</dt><dd>${escape(v.access)}</dd><dt>Cost & billing</dt><dd>${escape(v.cost)}</dd><dt>Delivery</dt><dd>${escape(v.delivery)}</dd></dl><h4>Read the fine print</h4><ul class="conditions">${v.conditions.map(c=>`<li>${escape(c)}</li>`).join('')}</ul><h4>Official evidence <span>${String(v.sources.length).padStart(2,'0')}</span></h4><ol class="sources">${v.sources.map(s=>`<li><a href="${escape(s.url)}" target="_blank" rel="noopener noreferrer">${escape(s.title)} <span aria-hidden="true">↗</span></a><p>${escape(s.evidence)}</p></li>`).join('')}</ol><div class="detail-footer"><span>Checked ${escape(v.checked)}</span><a href="#vendor-${escape(v.id)}">Permalink ↗</a></div><a class="correction" href="https://github.com/gldc/mcp-tax/issues/new?template=vendor.yml">Suggest a correction ↗</a></div>`;
}
export async function build({ vendors, outDir = join(root,'dist') } = {}) {
  vendors ??= JSON.parse(await readFile(join(root,'data/vendors.json'),'utf8'));
  const sorted = [...vendors].sort((a,b)=>a.name.localeCompare(b.name));
  const categories = [...new Set(vendors.map(v=>v.category))].sort();
  const rows = sorted.map((v,i)=>`<details class="vendor" id="vendor-${escape(v.id)}" data-id="${escape(v.id)}"><summary aria-controls="evidence-${escape(v.id)}"><span class="vendor-name"><span class="row-number">${String(i+1).padStart(2,'0')}</span><span>${escape(v.name)}${v.preview?'<small>Preview</small>':''}</span></span><span class="vendor-category">${escape(v.category)}</span><span class="badge ${escape(v.status)}">${labels[v.status]}</span><span class="row-arrow" aria-hidden="true">↗</span></summary><a class="inspector-jump" href="#inspector-body">Read ${escape(v.name)} evidence →</a>${evidence(v)}</details>`).join('\n');
  const honor = featuredHonor.map(id=>vendors.find(v=>v.id===id && v.noTax===true)).filter(Boolean).map(v=>`<a href="#vendor-${escape(v.id)}"><svg viewBox="0 0 24 24" aria-hidden="true"><use href="./assets/honor-logos.svg#${escape(v.id)}"/></svg><span>${escape(v.name)}</span></a>`).join('');
  const filters = Object.entries(labels).map(([status,label])=>`<button type="button" data-status="${status}" aria-pressed="false"><span class="status-dot ${status}"></span>${label}<span class="filter-count">${vendors.filter(v=>v.status===status).length}</span></button>`).join('');
  let html = await readFile(join(root,'index.html'),'utf8');
  const values = {ROWS:rows,HONOR:honor,FILTERS:filters,COUNT:vendors.length,HONOR_COUNT:vendors.filter(v=>v.noTax===true).length,CATEGORIES:categories.map(c=>`<option value="${escape(c)}">${escape(c)}</option>`).join(''),CHECKED:vendors.map(v=>v.checked).sort().at(-1) || 'Not checked',DATA:JSON.stringify(vendors).replace(/</g,'\\u003c')};
  html = html.replace(/\{\{(\w+)\}\}/g,(_,key)=>values[key] ?? '');
  await mkdir(outDir,{recursive:true});
  await Promise.all([writeFile(join(outDir,'index.html'),html),cp(join(root,'assets'),join(outDir,'assets'),{recursive:true}),cp(join(root,'favicon.svg'),join(outDir,'favicon.svg')),writeFile(join(outDir,'vendors.json'),JSON.stringify(vendors,null,2)+'\n'),writeFile(join(outDir,'.nojekyll'),''),writeFile(join(outDir,'CNAME'),'mcp-tax.com\n')]);
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) { await build(); console.log('Built dist/'); }
