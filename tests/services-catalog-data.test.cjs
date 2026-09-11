const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.join(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'services-catalog-data.js'), 'utf8');
const guidesSource = fs.readFileSync(path.join(root, 'ultrasound-guides-data.js'), 'utf8');
const context = { window: {} };
vm.runInNewContext(guidesSource, context);
vm.runInNewContext(source, context);
vm.runInNewContext(fs.readFileSync(path.join(root, 'citilab-catalog-data.js'), 'utf8'), context);
const catalog = context.window.ME_SERVICE_CATALOG;

test('full service directory separates consultations, gynecology and functional diagnostics', () => {
  assert.equal(catalog.length, 12);
  assert.deepEqual(
    Array.from(catalog, category => category.title),
    ['Медицинские анализы', 'Консультации врачей', 'Гинекологические услуги', 'ЭКГ и суточный мониторинг', 'УЗИ сердца, сосудов, суставов', 'Общее УЗИ', 'УЗИ для женщин', 'Комплексные УЗИ для женщин', 'УЗИ при беременности', 'Комплексные УЗИ для мужчин', 'УЗИ детям', 'Массаж позвоночника']
  );
  assert.equal(catalog.reduce((total, category) => total + category.items.length, 0), 339);
});

test('consultations contain only doctor appointments', () => {
  const consultations = catalog.find(category => category.id === 'consultations');
  const gynecology = catalog.find(category => category.id === 'gynecology-services');
  const diagnostics = catalog.find(category => category.id === 'functional-diagnostics');
  assert.equal(consultations.items.length, 11);
  assert.ok(consultations.items.every(service => /Приём|консультация/i.test(service.name)));
  assert.ok(consultations.items.every(service => !service.details?.length));
  assert.ok(consultations.items.every(service => service.duration === undefined));
  assert.equal(gynecology.items.length, 14);
  assert.ok(gynecology.items.every(service => service.duration === undefined));
  assert.match(gynecology.items.map(service => service.name).join(' '), /Кольпоскопия.*ВМС/);
  assert.equal(gynecology.items.find(service => service.name === 'Фемофлор II').price, 5500);
  assert.equal(diagnostics.items.length, 4);
  assert.ok(diagnostics.items.every(service => /ЭКГ/i.test(service.name)));
});

test('ultrasound services include preparation and procedure guides from the supplied document', () => {
  const guides = context.window.ME_ULTRASOUND_GUIDES;
  assert.equal(Object.keys(guides).length, 30);
  for (const guide of Object.values(guides)) {
    assert.ok(guide.preparation.length > 0, guide.title);
    assert.ok(guide.procedure.length > 0, guide.title);
  }
  const guidedServices = catalog.flatMap(category => category.items).filter(service => service.preparation && service.procedure);
  assert.equal(guidedServices.length, 31);
  assert.ok(guidedServices.every(service => service.preparation.length && service.procedure.length));
});

test('every service has a valid title, price and applicable timing', () => {
  const ids = catalog.map(category => category.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const category of catalog) {
    assert.ok(category.items.length > 0, category.title);
    for (const service of category.items) {
      assert.ok(service.name.trim().length > 2, category.title);
      assert.ok(Number.isInteger(service.price) && service.price > 0, service.name);
      if (!['medical-analyses', 'consultations', 'gynecology-services'].includes(category.id)) assert.ok(Number.isInteger(service.duration) && service.duration > 0, service.name);
    }
  }
});

test('laboratory profiles use the approved higher prices and only complete codes', () => {
  const analyses = catalog.find(category => category.id === 'medical-analyses');
  assert.equal(analyses.items.length, 236);
  const prices = Object.fromEntries(Array.from(analyses.items, service => [service.name, service.price]));
  assert.equal(prices['PROздоровье: Базовый'], 2075);
  assert.equal(prices['PROздоровье: Стандарт'], 3940);
  assert.equal(prices['PROздоровье: Максимум'], 5035);
  assert.equal(prices['Энергия и иммунитет: углублённый скрининг в крови'], 5125);
  assert.equal(analyses.items.find(service => service.name.includes('Оптимум')).code, null);
});

test('four highlighted laboratory profiles show full composition, purpose and savings', () => {
  const analyses = catalog.find(category => category.id === 'medical-analyses');
  const profiles = Object.fromEntries(Array.from(analyses.items.filter(service => /^99-00-73[1-4]$/.test(service.code)), service => [service.code, service]));
  assert.deepEqual(Object.keys(profiles).sort(), ['99-00-731', '99-00-732', '99-00-733', '99-00-734']);
  assert.deepEqual([profiles['99-00-733'].details.length - 2, profiles['99-00-734'].details.length - 2, profiles['99-00-732'].details.length - 2, profiles['99-00-731'].details.length - 2], [5, 16, 19, 13]);
  assert.deepEqual([profiles['99-00-733'].saving, profiles['99-00-734'].saving, profiles['99-00-732'].saving, profiles['99-00-731'].saving], ['Экономия 270 ₽', 'Экономия 330 ₽', 'Экономия 455 ₽', 'Экономия 510 ₽']);
  assert.equal(analyses.items.find(service => service.name === 'Отличное самочувствие').saving, 'Экономия 695 ₽');
  assert.equal(analyses.items.find(service => service.name === 'Гормональный статус женский').saving, 'Экономия 660 ₽');
  for (const profile of Object.values(profiles)) {
    assert.match(profile.details[0], /оцен|комплекс|здоров|усталост/i);
    assert.match(profile.details[1], /В состав входят/);
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
  assert.match(html, /ultrasound-guides-data\.js/);
  assert.match(html, /category\.js/);
  assert.match(html, /О клинике[\s\S]*Врачи[\s\S]*Услуги[\s\S]*Цены[\s\S]*Контакты/);
  assert.doesNotMatch(html, /data-service-categories|role="tablist"/);
});

test('analyses page uses its direct phone instead of online booking', () => {
  const html = fs.readFileSync(path.join(root, 'services', 'category.html'), 'utf8');
  const renderer = fs.readFileSync(path.join(root, 'services', 'category.js'), 'utf8');
  const styles = fs.readFileSync(path.join(root, 'services', 'category-design.css'), 'utf8');
  assert.match(renderer, /\+7 \(900\) 093-06-86/);
  assert.match(renderer, /tel:\+79000930686/);
  assert.match(renderer, /Все вопросы по анализам и запись/);
  assert.match(renderer, /Медицинские анализы в лаборатории СИТИЛАБ/);
  assert.match(renderer, /removeAttribute\('target'\)/);
  assert.match(html, /data-analyses-contact hidden/);
  assert.match(html, /Все вопросы по анализам и запись:/);
  assert.match(html, /href="tel:\+79000930686">\+7 \(900\) 093-06-86/);
  assert.match(renderer, /querySelector\('\[data-analyses-contact\]'\)\.hidden = false/);
  assert.match(styles, /\.analyses-contact-card\{position:fixed/);
  assert.match(styles, /\.analyses-contact-card\{[^}]*right:24px;bottom:24px/);
  assert.match(styles, /\.category-page--analyses \.floating-record\{display:none\}/);
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
