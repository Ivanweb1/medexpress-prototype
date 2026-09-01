const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');

test('massage page contains the supplied programmes, apparatus description and contact', () => {
  const html = fs.readFileSync(path.join(root, 'services/spine-massage.html'), 'utf8');
  for (const value of ['Серагем', 'Сканирование позвоночника', 'Инфракрасное воздействие', '18 минут', '500 ₽', '36,5 минут', '1 000 ₽', '+7 (900) 093-06-86']) {
    assert.match(html, new RegExp(value.replace(/[+()]/g, '\\$&')));
  }
  assert.match(html, /src="\.\.\/assets\/massage-bed.png"/);
  assert.match(html, /имеются противопоказания/i);
});

test('document pages publish the current licence and supplied requisites', () => {
  const data = fs.readFileSync(path.join(root, 'documents-data.js'), 'utf8');
  for (const value of ['Л041-01024-74/00355466', '25 августа 2025', '№ 1180-УЛ', 'ул. Ленина, д. 50', 'ул. Набережная, д. 1А', '7451351660', '1137451006824', '40702810772000038313']) {
    assert.match(data, new RegExp(value.replace(/[.+?^${}()|[\]\\]/g, '\\$&')));
  }
  assert.doesNotMatch(data, /ЛО-74-01-005595/);
  assert.ok(fs.existsSync(path.join(root, 'assets/documents/license-medexpress.pdf')));
});

test('all local links and assets on the massage and document detail pages resolve', () => {
  for (const file of ['services/spine-massage.html', 'documents/document.html']) {
    const html = fs.readFileSync(path.join(root, file), 'utf8');
    for (const [, url] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
      if (/^(https?:|tel:|mailto:)/.test(url) || url.startsWith('#')) continue;
      const target = path.resolve(root, path.dirname(file), url.split('?')[0]);
      assert.ok(fs.existsSync(target), `${file}: ${url}`);
    }
  }
});
