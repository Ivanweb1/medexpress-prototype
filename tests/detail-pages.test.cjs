const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const pages = ['doctors/ekaterina-orekhova.html', 'services/general-ultrasound.html'];

for (const file of pages) {
  const html = fs.readFileSync(path.join(root, file), 'utf8');
  test(file + ': shared design without legacy prototype injection or invented prices', () => {
    assert.equal([...html.matchAll(/<h1\b/g)].length, 1);
    assert.match(html, /href="\.\.\/home-design.css\?/);
    assert.match(html, /href="\.\.\/detail-design.css\?/);
    assert.match(html, /src="\.\.\/script.js\?/);
    assert.doesNotMatch(html, /prototype-sections.js|Здесь будет|от 0 ₽|placeholder/);
    assert.match(html, /id="booking"/);
    assert.match(html, /href="https:\/\/m.vk.ru\/app53642491_-203789798\?ref=group_menu"/);
    for (const [, heading] of html.matchAll(/<h[123][^>]*>([\s\S]*?)<\/h[123]>/g)) {
      assert.ok(!heading.replace(/<[^>]+>/g, '').trim().endsWith('.'));
    }
  });

  test(file + ': every asset, local page and anchor resolves from the nested directory', () => {
    const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
    assert.equal(new Set(ids).size, ids.length);
    for (const [, url] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
      if (/^(https?:|tel:|mailto:)/.test(url)) continue;
      if (url.startsWith('#')) assert.ok(ids.includes(url.slice(1)), url);
      else {
        const [local, fragment] = url.split('#');
        const target = path.resolve(root, path.dirname(file), local.split('?')[0]);
        assert.ok(fs.existsSync(target), url);
        if (fragment) assert.ok(fs.readFileSync(target, 'utf8').includes('id="' + fragment + '"'), url);
      }
    }
    for (const [, attributes] of html.matchAll(/<a\b([^>]*target="_blank"[^>]*)>/g)) {
      assert.match(attributes, /rel="[^"]*noopener/);
    }
  });

  test(file + ': native FAQ has four questions with meaningful answers and no script dependency', () => {
    const details = [...html.matchAll(/<details(?: open)?>([\s\S]*?)<\/details>/g)];
    assert.equal(details.length, 4);
    details.forEach(([, body]) => {
      assert.match(body, /<summary>[^<]+<\/summary>/);
      assert.match(body, /<div><p>[\s\S]{30,}<\/p><\/div>/);
    });
  });
}

test('mobile styles keep photos separate from text and collapse page grids', () => {
  const css = fs.readFileSync(path.join(root, 'detail-design.css'), 'utf8');
  assert.match(css, /\.profile-portrait img\{[^}]*object-fit:cover/);
  assert.match(css, /@media\(max-width:620px\)/);
  assert.match(css, /\.profile-hero,\.service-hero\{grid-template-columns:1fr/);
});

test('doctor page includes the complete review structure with labeled pending content', () => {
  const html = fs.readFileSync(path.join(root, pages[0]), 'utf8');
  for (const id of ['about-doctor', 'experience', 'education', 'doctor-directions', 'services-doctor', 'doctor-reviews', 'doctor-schedule', 'visit', 'booking']) {
    assert.ok(html.includes('id="' + id + '"'), id);
  }
  assert.equal([...html.matchAll(/class="detail-review-draft"/g)].length, 2);
  assert.equal([...html.matchAll(/class="detail-price-item"/g)].length, 3);
  assert.match(html, /На согласовании/);
  assert.match(html, /Текст пока не предоставлен/);
  assert.doesNotMatch(html, /class="detail-jumps"|← Все врачи центра/);
});

test('service page includes full study structure and supplied landscape photograph', () => {
  const html = fs.readFileSync(path.join(root, pages[1]), 'utf8');
  for (const id of ['description', 'indications', 'included', 'preparation', 'procedure', 'results', 'cost', 'specialists', 'questions', 'booking']) {
    assert.ok(html.includes('id="' + id + '"'), id);
  }
  assert.match(html, /src="\.\.\/assets\/general-ultrasound-exam.png"/);
  assert.match(html, /service-hero-photo--landscape/);
  assert.match(html, /Ниже нет действующих медицинских рекомендаций/);
  assert.equal([...html.matchAll(/class="detail-price-item"/g)].length, 3);
  assert.doesNotMatch(html, /class="detail-jumps"|← Все направления УЗИ/);
});
