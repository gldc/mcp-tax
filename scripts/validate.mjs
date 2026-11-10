import { readFileSync, realpathSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const statuses = new Set(['included', 'limited', 'gated', 'metered', 'unclear']);
const text = value => typeof value === 'string' && value.trim().length > 0;
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);

// Structural checks only: source accuracy and classifications still require editorial review.
export function validateVendors(records) {
  if (!Array.isArray(records) || records.length === 0) return ['vendors must be a nonempty array'];
  const errors = [];
  const ids = new Set();
  const today = new Date().toISOString().slice(0, 10);
  for (const [index, record] of records.entries()) {
    const label = `vendors[${index}]`;
    const fail = message => errors.push(`${label}: ${message}`);
    if (!object(record)) { fail('record must be an object'); continue; }
    if (!text(record.id) || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(record.id)) fail('id must be a lowercase slug');
    if (ids.has(record.id)) fail(`duplicate id ${record.id}`);
    ids.add(record.id);
    for (const field of ['name', 'category', 'access', 'cost', 'summary']) {
      if (!text(record[field])) fail(`${field} must be nonempty text`);
    }
    if (!statuses.has(record.status)) fail('status must be included, limited, gated, metered or unclear');
    const date = typeof record.checked === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(record.checked)
      ? new Date(`${record.checked}T00:00:00Z`) : new Date(NaN);
    if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== record.checked || record.checked > today) {
      fail('checked must be a real calendar date no later than today (YYYY-MM-DD)');
    }
    if (!Array.isArray(record.conditions) || record.conditions.some(condition => !text(condition))) {
      fail('conditions must be an array of nonempty text');
    }
    if (!Array.isArray(record.sources) || record.sources.length === 0) fail('sources must contain official evidence');
    else for (const [sourceIndex, source] of record.sources.entries()) {
      if (!object(source)) { fail(`sources[${sourceIndex}] must be an object`); continue; }
      for (const field of ['title', 'url', 'evidence']) {
        if (!text(source[field])) fail(`sources[${sourceIndex}].${field} must be nonempty text`);
      }
      try {
        const url = new URL(source.url);
        if (url.protocol !== 'https:' || url.username || url.password) throw new Error('unsafe URL');
      } catch { fail(`sources[${sourceIndex}].url must be HTTPS without credentials`); }
    }
    for (const field of ['delivery', 'notice']) {
      if (Object.hasOwn(record, field) && !text(record[field])) fail(`${field} must be nonempty text when present`);
    }
    for (const field of ['noTax', 'preview']) {
      if (Object.hasOwn(record, field) && typeof record[field] !== 'boolean') fail(`${field} must be boolean when present`);
    }
    if (record.noTax === true && record.status !== 'included') fail('noTax requires included status');
  }
  return errors;
}

if (process.argv[1] && import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href) {
  try {
    const records = JSON.parse(readFileSync(new URL('../data/vendors.json', import.meta.url), 'utf8'));
    const errors = validateVendors(records);
    console.log(`Checked ${Array.isArray(records) ? records.length : 0} vendor records; ${errors.length} structural errors.`);
    for (const error of errors) console.error(error);
    process.exitCode = errors.length ? 1 : 0;
  } catch (error) {
    console.error(`Vendor validation failed: ${error.message}`);
    process.exitCode = 1;
  }
}
