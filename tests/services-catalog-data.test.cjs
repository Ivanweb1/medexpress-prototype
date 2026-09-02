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

test('services page loads the data and accessible directory renderer', () => {
  const html = fs.readFileSync(path.join(root, 'services.html'), 'utf8');
  assert.match(html, /data-service-directory/);
  assert.match(html, /role="tablist"/);
  assert.match(html, /role="tabpanel"/);
  assert.match(html, /services-catalog-data\.js/);
  assert.match(html, /services-catalog\.js/);
});
