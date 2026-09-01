const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const pages = [
  'index.html', 'services.html', 'doctors.html', 'about.html', 'contacts.html',
  'prices.html', 'documents.html', 'services/service.html', 'services/spine-massage.html',
  'services/general-ultrasound.html', 'services/cardiology.html', 'doctors/profile.html',
  'doctors/ekaterina-orekhova.html', 'documents/document.html'
];

test('price page uses the approved site chrome and supplied starting prices', () => {
  const html = fs.readFileSync(path.join(root, 'prices.html'), 'utf8');
  assert.match(html, /class="site-header"/);
  assert.match(html, /class="site-footer"/);
  assert.match(html, /href="prices\.html" aria-current="page"/);
  assert.equal([...html.matchAll(/class="price-row(?:\s[^"]*)?"/g)].length, 4);
  for (const value of ['от 185 ₽', 'от 900 ₽', 'от 1 500 ₽', 'от 500 ₽']) assert.match(html, new RegExp(value));
  assert.match(html, /Программа 36,5 минут<\/span><strong>1 000 ₽/);
  assert.match(html, /Программа 18 минут<\/span><strong>500 ₽/);
  assert.match(html, /Мужское здоровье №2/);
  assert.match(html, /6 200 ₽/);
  assert.match(html, /экономия 900 ₽/);
  assert.match(html, /Кардиологический комплекс/);
  assert.match(html, /services\/cardiology\.html#cardio-complex/);
  assert.match(html, /Гастроэнтерологический комплекс/);
  assert.match(html, /id="consultation-prices"/);
  assert.match(html, /Приём врача-кардиолога[\s\S]*?1 800 ₽[\s\S]*?повторный — 1 500 ₽/);
  assert.match(html, /И\. В\. Бойко[\s\S]*?2 200 ₽/);
  assert.match(html, /id="gynecology-prices"/);
  assert.match(html, /ЭХО-гистеросальпингография[\s\S]*?5 000 ₽/);
  assert.match(html, /Поддерживающий пессарий АРАБИН[\s\S]*?8 500 ₽/);
  assert.match(html, /id="functional-prices"/);
  assert.match(html, /Суточное холтеровское мониторирование ЭКГ[\s\S]*?2 500 ₽/);
  assert.match(html, /<span>ЭКГ<\/span><strong>600 ₽/);
  assert.match(html, /НГГ[\s\S]*?1 000 ₽/);
  assert.match(html, /НКТГ[\s\S]*?1 200 ₽/);
  assert.doesNotMatch(html, /На согласовании|Цена не указана|— ₽/);
});

test('every page uses either the current header and footer or the shared current renderer', () => {
  for (const file of pages) {
    const html = fs.readFileSync(path.join(root, file), 'utf8');
    const staticChrome = html.includes('class="site-header"') && html.includes('class="site-footer"');
    const renderedChrome = html.includes('data-site-header') && html.includes('data-site-footer') && html.includes('home-design.css');
    assert.ok(staticChrome || renderedChrome, file);
    assert.match(html, /home-design\.css\?v=20260901-chrome-unified/, file);
    assert.doesNotMatch(html, /index\.html#prices|href="#prices"/);
  }
  const source = fs.readFileSync(path.join(root, 'script.js'), 'utf8');
  assert.match(source, /class="site-header"/);
  assert.match(source, /class="site-footer"/);
  assert.match(source, /prices\.html/);
  assert.doesNotMatch(source, /class="header"|class="footer"|index\.html#prices/);
});

test('document pages use the exact homepage chrome classes', () => {
  for (const file of ['documents.html', 'documents/document.html']) {
    const html = fs.readFileSync(path.join(root, file), 'utf8');
    for (const marker of ['class="site-header"', 'class="header-note"', 'class="shell header-main"', 'class="navigation"', 'class="header-actions"', 'class="site-footer"', 'class="shell footer-grid"', 'class="shell footer-bottom"']) {
      assert.match(html, new RegExp(marker), `${file}: ${marker}`);
    }
    assert.doesNotMatch(html, /data-site-header|data-site-footer|class="header"|class="footer"/);
  }
  const css = fs.readFileSync(path.join(root, 'home-design.css'), 'utf8');
  assert.match(css, /\.site-header \.navigation\{margin-left:0\}/);
  assert.match(css, /\.floating-record\{min-height:0;height:auto;border:0\}/);
});

test('all local links and assets on the price page resolve', () => {
  const html = fs.readFileSync(path.join(root, 'prices.html'), 'utf8');
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
  for (const [, url] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    if (/^(https?:|tel:|mailto:)/.test(url)) continue;
    if (url.startsWith('#')) assert.ok(ids.includes(url.slice(1)), url);
    else {
      const [local, fragment] = url.split('#');
      const target = path.resolve(root, local.split('?')[0]);
      assert.ok(fs.existsSync(target), url);
      if (fragment) assert.ok(fs.readFileSync(target, 'utf8').includes('id="' + fragment + '"'), url);
    }
  }
});
