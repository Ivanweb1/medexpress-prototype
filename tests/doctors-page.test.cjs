const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'doctors.html'), 'utf8');
const source = fs.readFileSync(path.join(root, 'doctors.js'), 'utf8');
const articles = [...html.matchAll(/<article\b[^>]*data-team-card[^>]*>[\s\S]*?<\/article>/g)].map(m => m[0]);

function setup() {
  const cards = articles.map(article => ({ dataset: { specialty: article.match(/data-specialty="([^"]+)"/)[1] }, hidden: false }));
  const buttons = [...html.matchAll(/data-team-filter="([^"]+)"/g)].map(m => ({
    dataset: { teamFilter: m[1] }, attributes: {},
    setAttribute(key, value) { this.attributes[key] = value; },
    addEventListener(event, callback) { this[event] = callback; },
  }));
  const filters = { hidden: true };
  const count = { textContent: '' };
  const catalog = {
    querySelector: selector => selector === '[data-team-filters]' ? filters : count,
    querySelectorAll: selector => selector === '[data-team-filter]' ? buttons : cards,
  };
  vm.runInNewContext(source, { document: { querySelector: () => catalog } });
  return { cards, buttons, filters, count };
}

test('ten doctors preserved with Orekhova first and four real portraits', () => {
  assert.equal(articles.length, 10);
  assert.match(articles[0], /Екатерина<br>Владимировна<br>Орехова/);
  assert.equal([...html.matchAll(/src="assets\/doctor-[^"]+"/g)].length, 4);
  assert.equal([...html.matchAll(/class="team-portrait__neutral"/g)].length, 6);
  assert.doesNotMatch(html, /Фото врача|Фото позже/);
  for (const article of articles) {
    assert.match(article, />Записаться<\/a>/);
    assert.match(article, />О враче<\/a>/);
  }
});

test('filter enables progressively and shows everyone initially', () => {
  const { cards, buttons, filters, count } = setup();
  assert.equal(filters.hidden, false);
  assert.equal(cards.filter(card => !card.hidden).length, 10);
  assert.equal(count.textContent, 'Специалистов: 10');
  assert.equal(buttons[0].attributes['aria-pressed'], 'true');
});

test('each specialty filters cards and updates accessible pressed state and count', () => {
  const { cards, buttons, count } = setup();
  const expected = { all: 10, uzi: 5, gynecology: 2, cardiology: 1, neurology: 1, endocrinology: 1 };
  for (const button of buttons) {
    button.click();
    const specialty = button.dataset.teamFilter;
    const visible = cards.filter(card => !card.hidden);
    assert.equal(visible.length, expected[specialty]);
    assert.equal(count.textContent, 'Специалистов: ' + expected[specialty]);
    assert.equal(buttons.filter(b => b.attributes['aria-pressed'] === 'true').length, 1);
    assert.equal(button.attributes['aria-pressed'], 'true');
    assert.ok(visible.every(card => specialty === 'all' || card.dataset.specialty === specialty));
  }
  buttons[0].click();
  assert.equal(cards.filter(card => !card.hidden).length, 10);
});

test('script safely ignores pages without the directory', () => {
  assert.doesNotThrow(() => vm.runInNewContext(source, { document: { querySelector: () => null } }));
});

test('links, assets, headings and no-JS fallback are valid', () => {
  assert.equal([...html.matchAll(/<h1\b/g)].length, 1);
  assert.match(html, /href="doctors.html" aria-current="page"/);
  assert.match(html, /data-team-filters hidden/);
  assert.ok(articles.every(article => !/<article[^>]*\bhidden\b/.test(article)));
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
  assert.equal(new Set(ids).size, ids.length);
  for (const [, url] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    if (/^(https?:|tel:|mailto:)/.test(url)) continue;
    if (url.startsWith('#')) assert.ok(ids.includes(url.slice(1)), url);
    else assert.ok(fs.existsSync(path.join(root, url.split(/[?#]/)[0])), url);
  }
  for (const [, attributes] of html.matchAll(/<a\b([^>]*target="_blank"[^>]*)>/g)) {
    assert.match(attributes, /rel="[^"]*noopener/);
  }
});
