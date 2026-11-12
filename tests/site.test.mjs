import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
const fixture = [{ id:'example',name:'Example <script>',category:'Developer tools',status:'included',access:'All plans',cost:'Product usage applies',summary:'A & B',conditions:['A condition'],sources:[{title:'Official docs',url:'https://example.com/docs',evidence:'Access is included </script><script>alert(1)</script>'}],checked:'2026-11-10',delivery:'Vendor hosted',noTax:true }];
test('build renders names, evidence and safe JSON into a standalone relative-path site', async () => {
  const { build } = await import('../scripts/build.mjs');
  const out = await mkdtemp(join(tmpdir(),'mcp-tax-site-'));
  try {
    await build({ vendors:fixture,outDir:out });
    const html = await readFile(join(out,'index.html'),'utf8');
    assert.ok(html.includes('Example &lt;script&gt;'));
    assert.ok(html.includes('Access is included &lt;/script&gt;'));
    assert.ok(html.includes('href="#vendor-example"'));
    assert.ok(html.includes('src="./assets/site.js"'));
    assert.ok(html.includes('aria-controls="evidence-example"'));
    assert.ok(html.includes('id="evidence-example"'));
    assert.match(html, /class="inspector-jump" href="#inspector-body"/);
    assert.match(html, /id="inspector-body"[^>]*tabindex="-1"/);
    assert.ok(!html.includes('</script><script>alert(1)'));
    const data = JSON.parse(html.match(/<script id="vendor-data" type="application\/json">([\s\S]*?)<\/script>/)[1]);
    assert.deepEqual(data,fixture);
    assert.equal(await readFile(join(out,'CNAME'),'utf8'),'mcp-tax.com\n');
    assert.deepEqual(JSON.parse(await readFile(join(out,'vendors.json'),'utf8')),fixture);
    await readFile(join(out,'.nojekyll'));
  } finally { await rm(out,{recursive:true,force:true}); }
});
test('built HTML gives crawlers a canonical share card and a deployable raster image', async () => {
  const { build } = await import('../scripts/build.mjs');
  const out = await mkdtemp(join(tmpdir(),'mcp-tax-share-'));
  try {
    await build({vendors:fixture,outDir:out});
    const head = (await readFile(join(out,'index.html'),'utf8')).split('</head>')[0];
    const tags = [...head.matchAll(/<(?:meta|link)\s[^>]+>/g)].map(([tag])=>Object.fromEntries([...tag.matchAll(/([\w:]+)="([^"]*)"/g)].map(([,key,value])=>[key,value])));
    const meta = new Map(tags.map(t=>[t.property||t.name,t.content]));
    const canonical = tags.find(t=>t.rel==='canonical')?.href;
    assert.equal(canonical,'https://mcp-tax.com/');
    assert.equal(meta.get('og:url'),canonical);
    assert.equal(meta.get('og:type'),'website');
    assert.equal(meta.get('og:title'),head.match(/<title>(.*?)<\/title>/)[1]);
    assert.equal(meta.get('og:description'),meta.get('description'));
    assert.ok(meta.get('og:site_name'));
    assert.equal(meta.get('twitter:card'),'summary_large_image');
    for (const key of ['title','description','image','image:alt']) {
      assert.ok(meta.get(`og:${key}`),`missing og:${key}`);
      assert.equal(meta.get(`twitter:${key}`),meta.get(`og:${key}`));
    }
    const imageUrl = new URL(meta.get('og:image'));
    assert.equal(imageUrl.origin,new URL(canonical).origin);
    assert.equal(meta.get('og:image:type'),'image/png');
    const png = await readFile(join(out,imageUrl.pathname.slice(1)));
    assert.equal(png.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
    assert.equal(png.readUInt32BE(16),1200);
    assert.equal(png.readUInt32BE(20),630);
    assert.equal(meta.get('og:image:width'),'1200');
    assert.equal(meta.get('og:image:height'),'630');
  } finally { await rm(out,{recursive:true,force:true}); }
});
test('honor view requires explicit membership while preserving combined filters and sort', async () => {
  const { filterVendors } = await import('../assets/directory.mjs');
  const records = [
    {...fixture[0],id:'zulu',name:'Zulu',checked:'2026-11-11'},
    {...fixture[0],id:'alpha',name:'Alpha'},
    {...fixture[0],id:'not-honor',noTax:false},
    {...fixture[0],id:'gated',status:'gated',noTax:false},
    {...fixture[0],id:'other-category',category:'CRM'},
  ];
  assert.deepEqual(filterVendors(records,{honorOnly:true,query:'condition',category:'Developer tools',sort:'checked'}).map(v=>v.id),['zulu','alpha']);
  assert.deepEqual(filterVendors(records,{honorOnly:true,query:'missing'}),[]);
  assert.deepEqual(filterVendors(records,{honorOnly:true,status:'gated'}),[]);
  assert.equal(filterVendors(records).length,5);
  assert.deepEqual(records.map(v=>v.id),['zulu','alpha','not-honor','gated','other-category']);
});
test('gallery selects eligible featured brands and keeps every record in the directory', async () => {
  const { build } = await import('../scripts/build.mjs');
  const records = [
    {...fixture[0],id:'github',name:'GitHub'},
    {...fixture[0],id:'cloudflare',name:'Cloudflare',noTax:false},
    ...Array.from({length:14},(_,i)=>({...fixture[0],id:`extra-${i}`,name:`Extra ${i}`})),
  ];
  const out = await mkdtemp(join(tmpdir(),'mcp-tax-gallery-'));
  try {
    await build({vendors:records,outDir:out});
    const html = await readFile(join(out,'index.html'),'utf8');
    const gallery = html.match(/<div class="honor-names">([\s\S]*?)<\/div>/)[1];
    assert.match(gallery,/href="#vendor-github"/);
    assert.match(gallery,/<use href="\.\/assets\/honor-logos.svg#github"/);
    assert.doesNotMatch(gallery,/#vendor-cloudflare|#vendor-extra-/);
    assert.equal((gallery.match(/<a /g)||[]).length,1);
    assert.match(html,/data-view="honor"[^>]*>[\s\S]*?<span[^>]*>15<\/span>/);
    assert.match(html,/id="honor-explore"[^>]*href="#directory"/);
    assert.equal((html.match(/<details class="vendor"/g)||[]).length,16);
    assert.match(html,/id="evidence-github"/);
    await readFile(join(out,'assets/honor-logos.svg'));
  } finally { await rm(out,{recursive:true,force:true}); }
});
test('combined filters and sorting preserve dataset and search evidence', async () => {
  const { filterVendors } = await import('../assets/directory.mjs');
  const second = {...fixture[0],id:'another',name:'Another',status:'gated',category:'CRM',noTax:false};
  const records = [fixture[0],second];
  assert.deepEqual(filterVendors(records,{query:'condition',status:'included',category:'Developer tools',sort:'name'}).map(v=>v.id),['example']);
  assert.equal(filterVendors(records,{status:'gated',category:'Developer tools'}).length,0);
  assert.deepEqual(filterVendors(records,{sort:'name'}).map(v=>v.id),['another','example']);
  assert.equal(records[0].id,'example');
});
