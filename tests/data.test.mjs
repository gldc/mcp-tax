import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync, mkdirSync, copyFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { validateVendors } from '../scripts/validate.mjs';

const sample = {
  id: 'sample-vendor', name: 'Sample vendor', category: 'Developer tools',
  status: 'included', access: 'All plans', cost: 'Included', summary: 'Explicit included access.',
  conditions: [], sources: [{ title: 'Official terms', url: 'https://example.com/mcp', evidence: 'Access is included.' }],
  checked: '2026-01-01', noTax: true,
};
const records = JSON.parse(readFileSync(new URL('../data/vendors.json', import.meta.url)));
const changed = (change) => { const record = structuredClone(records[0]); change(record); return record; };
const rejects = (records, field) => assert.ok(validateVendors(records).some(error => error.includes(field)));

test('accepts a complete synthetic record', () => {
  assert.deepEqual(validateVendors([sample]), []);
});

test('requires a nonempty list of objects', () => {
  for (const invalid of [null, {}, [], [null], ['vendor']]) assert.ok(validateVendors(invalid).length);
});

test('rejects duplicate IDs and IDs unsuitable for URL fragments', () => {
  rejects([sample, structuredClone(sample)], 'duplicate');
  for (const id of ['Bad ID', '-vendor', 'vendor-', '']) rejects([changed(record => { record.id = id; })], 'id');
});

test('requires meaningful editorial text', () => {
  for (const field of ['name', 'category', 'access', 'cost', 'summary']) {
    rejects([changed(record => { record[field] = ' '; })], field);
  }
});

test('rejects unsupported classifications and misleading honor-roll eligibility', () => {
  rejects([changed(record => { record.status = 'free'; })], 'status');
  rejects([changed(record => { record.status = 'gated'; record.noTax = true; })], 'noTax');
});

test('requires source evidence, title and secure credential-free URLs', () => {
  rejects([changed(record => { record.sources = []; })], 'sources');
  for (const field of ['title', 'url', 'evidence']) {
    rejects([changed(record => { delete record.sources[0][field]; })], field);
  }
  for (const url of ['http://example.com', 'https://user:pass@example.com', 'javascript:alert(1)', 'not a URL']) {
    rejects([changed(record => { record.sources[0].url = url; })], 'url');
  }
});

test('rejects impossible and future calendar dates', () => {
  for (const checked of ['2026-02-30', '2025-02-29', '2026-13-01', '2026-1-01', '2999-01-01', null]) {
    rejects([changed(record => { record.checked = checked; })], 'checked');
  }
  assert.deepEqual(validateVendors([changed(record => { record.checked = '2024-02-29'; })]), []);
});

test('checks condition entries and optional field types', () => {
  for (const conditions of ['terms', [null], [' ']]) rejects([changed(record => { record.conditions = conditions; })], 'conditions');
  for (const [field, value] of [['delivery', []], ['notice', null], ['noTax', 'yes'], ['preview', 'beta']]) {
    rejects([changed(record => { record[field] = value; })], field);
  }
});

test('validates the shipped research dataset', () => {
  assert.deepEqual(validateVendors(records), []);
});

test('CLI reports success for shipped data and import has no output', () => {
  const cli = spawnSync(process.execPath, ['scripts/validate.mjs'], { encoding: 'utf8' });
  assert.equal(cli.status, 0, cli.stderr);
  assert.match(cli.stdout, /vendor records; 0 structural errors/);
  const imported = spawnSync(process.execPath, ['--input-type=module', '-e', "await import('./scripts/validate.mjs')"], { encoding: 'utf8' });
  assert.equal(imported.status, 0, imported.stderr);
  assert.equal(imported.stdout + imported.stderr, '');
});

test('CLI rejects invalid data with an actionable error and exit 1', () => {
  const directory = mkdtempSync(join(tmpdir(), 'mcp-tax-validation-'));
  try {
    mkdirSync(join(directory, 'scripts'));
    mkdirSync(join(directory, 'data'));
    copyFileSync(new URL('../scripts/validate.mjs', import.meta.url), join(directory, 'scripts/validate.mjs'));
    writeFileSync(join(directory, 'data/vendors.json'), JSON.stringify([changed(record => { record.sources = []; })]));
    const cli = spawnSync(process.execPath, [join(directory, 'scripts/validate.mjs')], { encoding: 'utf8' });
    assert.equal(cli.status, 1);
    assert.match(cli.stderr, /sources/);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
