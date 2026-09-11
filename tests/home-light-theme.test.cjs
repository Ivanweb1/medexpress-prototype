const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');

test('homepage alone uses the light sea-blue theme', () => {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const css = fs.readFileSync(path.join(root, 'home-design.css'), 'utf8');
  assert.match(html, /<body class="home-page">/);
  assert.match(html, /home-design\.css\?v=20260911-citilab-wordmark/);
  for (const selector of [
    '.home-page .header-note',
    '.home-page .featured-service--massage .featured-service__visual',
    '.home-page .diagnostic-section',
    '.home-page .hours-card',
    '.home-page .site-footer'
  ]) assert.ok(css.includes(selector), selector);
  assert.match(css, /--home-sea:#dff3f7/);
  assert.match(css, /--home-heading-soft:#2f6f80/);
  assert.match(css, /\.home-page #services \.section-title h2,\.home-page \.doctors-section \.section-title h2\{color:var\(--home-heading-soft\)\}/);
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

test('visible CITILAB mentions use the shared two-colour wordmark', () => {
  const source = fs.readFileSync(path.join(root, 'script.js'), 'utf8');
  const css = fs.readFileSync(path.join(root, 'home-design.css'), 'utf8');
  assert.match(source, /const styleCitilabName/);
  assert.match(source, /citilab-wordmark__city[^>]*>СИТИ/);
  assert.match(source, /citilab-wordmark__lab[^>]*>лаб/);
  assert.match(source, /mark\.setAttribute\('role', 'img'\)/);
  assert.match(source, /mark\.setAttribute\('aria-label', 'СИТИЛАБ'\)/);
  assert.match(css, /\.citilab-wordmark__city\{color:#00a7d6\}/);
  assert.match(css, /\.citilab-wordmark__lab\{color:#e84b67\}/);
  for (const file of ['index.html', 'about.html', 'services.html', 'prices.html', 'services/category.html']) {
    const html = fs.readFileSync(path.join(root, file), 'utf8');
    assert.match(html, /home-design\.css\?v=20260911-citilab-wordmark/, file);
    assert.match(html, /script\.js\?v=20260911-citilab-wordmark/, file);
  }
});
