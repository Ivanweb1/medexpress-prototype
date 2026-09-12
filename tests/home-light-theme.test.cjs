const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');

test('homepage alone uses the light sea-blue theme', () => {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const css = fs.readFileSync(path.join(root, 'home-design.css'), 'utf8');
  assert.match(html, /<body class="home-page">/);
  assert.match(html, /home-design\.css\?v=20260912-citilab-hero-colours/);
  for (const selector of [
    '.home-page .header-note',
    '.home-page .featured-service--massage .featured-service__visual',
    '.home-page .diagnostic-section',
    '.home-page .hours-card',
    '.home-page .site-footer'
  ]) assert.ok(css.includes(selector), selector);
  assert.match(css, /--home-sea:#dff3f7/);
  assert.match(css, /--home-heading-dark:#3b4b64/);
  assert.match(css, /\.home-page main :is\(h1,h2,h3,h4\)\{color:var\(--home-heading-dark\)\}/);
  assert.doesNotMatch(css, /home-heading-soft/);
  assert.match(css, /\.home-page \.diagnostic-section\{background:linear-gradient/);
  assert.match(css, /\.home-page \.site-footer\{background:linear-gradient/);
});

test('light theme selectors are scoped and do not recolor inner pages', () => {
  const css = fs.readFileSync(path.join(root, 'home-design.css'), 'utf8');
  const lightTheme = css.slice(css.indexOf('/* Homepage light theme'));
  const rules = lightTheme.match(/(?:^|\})\s*([^@{}][^{]*)\{/g) || [];
  assert.ok(rules.length >= 20);
  for (const rule of rules) assert.match(rule, /\.home-page/);
});

test('inner pages use the shared light theme and slate heading colour', () => {
  const css = fs.readFileSync(path.join(root, 'light-site.css'), 'utf8');
  const pages = [
    'about.html', 'contacts.html', 'doctors.html', 'documents.html', 'prices.html', 'services.html',
    'doctors/ekaterina-orekhova.html', 'doctors/profile.html', 'documents/document.html',
    'services/cardiology.html', 'services/category.html', 'services/general-ultrasound.html',
    'services/service.html', 'services/spine-massage.html'
  ];
  for (const file of pages) {
    const html = fs.readFileSync(path.join(root, file), 'utf8');
    const prefix = file.includes('/') ? '\\.\\./' : '';
    assert.match(html, new RegExp(`${prefix}light-site\\.css\\?v=20260912-equipment-video-balance`), file);
  }
  assert.match(css, /--site-heading:#3b4b64/);
  assert.match(css, /body:not\(\.home-page\) main :is\(h1,h2,h3,h4\)\{color:var\(--site-heading\)\}/);
  assert.match(css, /body:not\(\.home-page\) \.clinic-equipment p,[\s\S]*body:not\(\.home-page\) \.clinic-equipment \.clinic-lead\{color:#526d78!important\}/);
  assert.match(css, /body:not\(\.home-page\) \.clinic-media-slider--equipment figcaption,[\s\S]*body:not\(\.home-page\) \.clinic-media-slider--equipment \.clinic-gallery-count\{color:#526d78\}/);
  assert.match(css, /body:not\(\.home-page\) \.detail-booking,[\s\S]*background:var\(--blue\);color:white/);
  assert.match(css, /body:not\(\.home-page\) \.site-footer\{background:linear-gradient/);
});

test('visible CITILAB mentions use the shared two-colour wordmark', () => {
  const homepage = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const source = fs.readFileSync(path.join(root, 'script.js'), 'utf8');
  const css = fs.readFileSync(path.join(root, 'home-design.css'), 'utf8');
  assert.match(homepage, /class="hero-facts"[\s\S]*citilab-wordmark__city[^>]*>СИТИ<\/span><span class="citilab-wordmark__lab"[^>]*>ЛАБ<\/span>/);
  assert.match(source, /const styleCitilabName/);
  assert.match(source, /citilab-wordmark__city[^>]*>СИТИ/);
  assert.match(source, /citilab-wordmark__lab[^>]*>ЛАБ/);
  assert.doesNotMatch(source, /citilab-wordmark__lab[^>]*>лаб/);
  assert.match(source, /mark\.setAttribute\('role', 'img'\)/);
  assert.match(source, /mark\.setAttribute\('aria-label', 'СИТИЛАБ'\)/);
  assert.match(css, /\.citilab-wordmark \.citilab-wordmark__city\{color:#00a7d6\}/);
  assert.match(css, /\.citilab-wordmark \.citilab-wordmark__lab\{color:#e84b67\}/);
  for (const file of ['index.html', 'about.html', 'services.html', 'prices.html', 'services/category.html']) {
    const html = fs.readFileSync(path.join(root, file), 'utf8');
    const styleVersion = file === 'index.html' ? '20260912-citilab-hero-colours' : '20260911-footer-warning-inline';
    assert.match(html, new RegExp(`home-design\\.css\\?v=${styleVersion}`), file);
    assert.match(html, /script\.js\?v=20260911-footer-warning-inline/, file);
  }
});
