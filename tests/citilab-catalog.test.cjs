const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.join(__dirname, '..');
const context = { window: {} };
for (const file of ['services-catalog-data.js', 'citilab-catalog-data.js']) vm.runInNewContext(fs.readFileSync(path.join(root, file), 'utf8'), context);
const items = context.window.ME_SERVICE_CATALOG[0].items;
const rows = require('../data/citilab-price-source.json').rows;

test('CITILAB covers every priced source row, with three documented merges', () => {
  const covered = new Set(items.flatMap(item => item.sourceRows || []));
  const merged = new Set([83, 128, 268]);
  rows.forEach((row, index) => {
    if (/^\s*\d/.test(row[0])) assert.ok(covered.has(index) || merged.has(index), `Missing row ${index}`);
  });
  for (const service of items.filter(item => item.sourceRows)) {
    const row = rows[service.sourceRows[0]];
    assert.ok(row[2].match(/\d+/g).map(Number).includes(service.price), service.name);
    assert.ok(service.group);
  }
});

test('multiple tests in one source row keep separate prices, not the maximum of different tests', () => {
  const price = code => items.find(item => item.code === code).price;
  assert.equal(price('99-20-070'), 285);
  assert.equal(price('99-20-907'), 315);
  assert.equal(price('31-20-003'), 440);
  assert.equal(price('31-20-009'), 515);
  assert.equal(price('29-11-009'), 1115);
  assert.equal(price('29-11-025'), 1700);
});

test('duplicates are merged and uncertain codes are not published', () => {
  assert.equal(items.filter(item => item.name === 'Гомоцистеин').length, 1);
  assert.equal(items.filter(item => item.name === 'Гормональный статус женский').length, 1);
  assert.equal(items.filter(item => item.name === 'Кальций в суточной моче').length, 1);
  assert.equal(items.find(item => item.name === 'Кальций в суточной моче').price, 200);
  for (const row of [76,77,91,92,118,122,189,191,269]) assert.equal(items.find(item => item.sourceRows?.includes(row)).code, null);
  const codes = items.filter(item => item.code).map(item => item.code);
  assert.equal(new Set(codes).size, codes.length);
});

test('collection fees and PAP combination restrictions stay visible', () => {
  const item = code => items.find(entry => entry.code === code);
  assert.match(item('97-00-126').priceNote, /300/);
  assert.match(item('90-69-502').priceNote, /включён/);
  assert.match(item('63-94-078').priceNote, /включён/);
  assert.match(item('63-94-028').details[0], /только вместе.*90-69-502.*5 000/);
  assert.equal(Math.min(...items.map(item => item.price)), 160);
});
