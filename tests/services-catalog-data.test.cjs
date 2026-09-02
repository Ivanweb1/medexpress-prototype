const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.join(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'services-catalog-data.js'), 'utf8');
const context = { window: {} };
vm.runInNewContext(source, context);
const catalog = context.window.ME_SERVICE_CATALOG;

test('full service directory has nine supplied categories', () => {
  assert.equal(catalog.length, 9);
  assert.deepEqual(
    Array.from(catalog, category => category.title),
    ['Консультации врачей', 'УЗИ сердца, сосудов, суставов', 'Общее УЗИ', 'УЗИ для женщин', 'Комплексные УЗИ для женщин', 'УЗИ при беременности', 'Комплексные УЗИ для мужчин', 'УЗИ детям', 'Массаж позвоночника']
  );
  assert.equal(catalog.reduce((total, category) => total + category.items.length, 0), 102);
});

test('every service has a valid title, price and duration', () => {
  const ids = catalog.map(category => category.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const category of catalog) {
    assert.ok(category.items.length > 0, category.title);
    for (const service of category.items) {
      assert.ok(service.name.trim().length > 2, category.title);
      assert.ok(Number.isInteger(service.price) && service.price > 0, service.name);
      assert.ok(Number.isInteger(service.duration) && service.duration > 0, service.name);
    }
  }
});

test('catalog keeps neutral massage wording and preparation notes', () => {
  assert.doesNotMatch(source, /Серагем|лучше обычного массажа|5 мощных/i);
  const massage = catalog.find(category => category.id === 'spine-massage');
  assert.deepEqual(Array.from(massage.items, service => service.price), [1000, 500]);
  assert.deepEqual(Array.from(massage.items, service => service.duration), [55, 30]);
  assert.ok(catalog.find(category => category.id === 'heart-vessels-joints').items[0].details.length >= 4);
  assert.ok(catalog.find(category => category.id === 'women-ultrasound').items[0].details.length >= 3);
});

test('category page loads shared data and renders one selected direction', () => {
  const html = fs.readFileSync(path.join(root, 'services', 'category.html'), 'utf8');
  assert.match(html, /data-category-items/);
  assert.match(html, /data-category-title/);
  assert.match(html, /services-catalog-data\.js/);
  assert.match(html, /category\.js/);
  assert.doesNotMatch(html, /data-service-categories|role="tablist"/);
});

test('every catalog category has a card link and category assets resolve', () => {
  const hub = fs.readFileSync(path.join(root, 'services.html'), 'utf8');
  const linkedIds = [...hub.matchAll(/services\/category\.html\?category=([a-z-]+)/g)].map(match => match[1]);
  assert.deepEqual([...new Set(linkedIds)].sort(), Array.from(catalog, category => category.id).sort());

  const file = path.join(root, 'services', 'category.html');
  const html = fs.readFileSync(file, 'utf8');
  for (const [, url] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    if (/^(https?:|tel:|mailto:)/.test(url) || url.startsWith('#')) continue;
    assert.ok(fs.existsSync(path.resolve(path.dirname(file), url.split(/[?#]/)[0])), url);
  }
});
