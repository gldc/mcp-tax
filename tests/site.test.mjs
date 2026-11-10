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
    assert.ok(html.includes('access. <br>Ordinary'));
    assert.ok(!html.includes('</script><script>alert(1)'));
    const data = JSON.parse(html.match(/<script id="vendor-data" type="application\/json">([\s\S]*?)<\/script>/)[1]);
    assert.deepEqual(data,fixture);
    assert.equal(await readFile(join(out,'CNAME'),'utf8'),'mcp-tax.com\n');
    assert.deepEqual(JSON.parse(await readFile(join(out,'vendors.json'),'utf8')),fixture);
    await readFile(join(out,'.nojekyll'));
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
