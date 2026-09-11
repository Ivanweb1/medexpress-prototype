const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'services.html'), 'utf8');
const cards = [...html.matchAll(/<article\b[^>]*data-service-card[^>]*>([\s\S]*?)<\/article>/g)].map(match => match[1]);

test('catalog presents twelve directions as navigation cards', () => {
  assert.equal(cards.length, 12);
  const names = ['Медицинские анализы', 'Консультации врачей', 'Гинекологические услуги', 'ЭКГ и суточный мониторинг', 'УЗИ сердца, сосудов и суставов', 'Общее УЗИ', 'УЗИ для женщин', 'Комплексные УЗИ для женщин', 'УЗИ при беременности', 'Комплексные УЗИ для мужчин', 'УЗИ детям', 'Массаж позвоночника'];
  assert.deepEqual(cards.map(card => card.match(/<h3>(.*?)<\/h3>/)[1]), names);
  assert.equal(cards.filter(card => /class="service-hub-card__icon"/.test(card)).length, 12);
});

test('each direction card opens a detail page without repeated booking buttons', () => {
  for (const card of cards) {
    assert.match(card, /<a href="services\/[^"]+">/);
    assert.doesNotMatch(card, /Записаться/);
  }
  assert.equal([...html.matchAll(/href="services\/category\.html\?category=/g)].length, 12);
  assert.equal([...html.matchAll(/class="floating-record"/g)].length, 1);
});

test('local assets, pages, and jump-link targets exist', () => {
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
  assert.equal(new Set(ids).size, ids.length, 'duplicate ids');
  for (const [, url] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    if (/^(https?:|tel:|mailto:)/.test(url)) continue;
    if (url.startsWith('#')) assert.ok(ids.includes(url.slice(1)), url);
    else {
      const [file, fragment] = url.split('#');
      const target = path.join(root, file.split('?')[0]);
      assert.ok(fs.existsSync(target), url);
      if (fragment) assert.ok(fs.readFileSync(target, 'utf8').includes(`id="${fragment}"`), url);
    }
  }
});

test('page has shared branding, active navigation, and no prototype placeholders', () => {
  assert.equal([...html.matchAll(/<h1\b/g)].length, 1);
  assert.match(html, /href="services.html" aria-current="page"/);
  assert.match(html, /О клинике[\s\S]*Врачи[\s\S]*Услуги[\s\S]*Цены[\s\S]*Контакты/);
  assert.match(html, /href="home-design.css\?/);
  assert.match(html, /Медицинские анализы/);
  assert.doesNotMatch(html, /class="number"|Изображение направления|Изображение услуги/);
  for (const [, heading] of html.matchAll(/<h[123][^>]*>([\s\S]*?)<\/h[123]>/g)) {
    assert.ok(!heading.replace(/<[^>]+>/g, '').trim().endsWith('.'));
  }
  for (const [, attributes] of html.matchAll(/<a\b([^>]*target="_blank"[^>]*)>/g)) {
    assert.match(attributes, /rel="[^"]*noopener/);
  }
});

test('category renderer provides preparation and procedure disclosures', () => {
  const renderer = fs.readFileSync(path.join(root, 'services', 'category.js'), 'utf8');
  assert.match(renderer, /\['Подготовка', service\.preparation\]/);
  assert.match(renderer, /\['Как проходит исследование', service\.procedure\]/);
  assert.match(renderer, /directory-service__information/);
  assert.match(renderer, /directory-service__price/);
  assert.match(renderer, /service\.saving/);
});

test('homepage consultation and massage links open populated catalog categories', () => {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  assert.equal([...html.matchAll(/href="services\/category\.html\?category=consultations"/g)].length, 2);
  assert.equal([...html.matchAll(/href="services\/category\.html\?category=spine-massage"/g)].length, 2);
  assert.doesNotMatch(html, /services\/service\.html\?name=Консультации/);
});
