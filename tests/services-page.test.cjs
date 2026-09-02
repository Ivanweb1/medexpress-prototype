const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'services.html'), 'utf8');
const cards = [...html.matchAll(/<article\b[^>]*data-service-card[^>]*>([\s\S]*?)<\/article>/g)].map(match => match[1]);

test('catalog preserves four primary directions without duplicated ultrasound cards', () => {
  assert.equal(cards.length, 4);
  const names = ['Медицинские анализы', 'УЗИ', 'Консультации врачей', 'Массаж позвоночника'];
  assert.deepEqual(cards.map(card => card.match(/<h3>(.*?)<\/h3>/)[1]), names);
});

test('every service has booking and detail buttons', () => {
  for (const card of cards) {
    assert.match(card, /class="btn" href="https:\/\/m\.vk\.ru\/app53642491_-203789798\?ref=group_menu"/);
    assert.match(card, /class="btn btn--outline" href="services\/[^\"]+">Подробнее<\/a>/);
  }
  assert.equal(new Set([...html.matchAll(/href="(services\/[^\"]+)"/g)].map(match => match[1])).size, 4);
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
  assert.match(html, /href="home-design.css\?/);
  assert.match(html, /src="assets\/citilab-transparent.png"/);
  assert.doesNotMatch(html, /class="number"|Изображение направления|Изображение услуги/);
  for (const [, heading] of html.matchAll(/<h[123][^>]*>([\s\S]*?)<\/h[123]>/g)) {
    assert.ok(!heading.replace(/<[^>]+>/g, '').trim().endsWith('.'));
  }
  for (const [, attributes] of html.matchAll(/<a\b([^>]*target="_blank"[^>]*)>/g)) {
    assert.match(attributes, /rel="[^"]*noopener/);
  }
});
