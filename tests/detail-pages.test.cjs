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

  if (file.startsWith('services/')) test(file + ': native FAQ has four questions with meaningful answers and no script dependency', () => {
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

test('doctor page contains only the supplied professional information', () => {
  const html = fs.readFileSync(path.join(root, pages[0]), 'utf8');
  for (const id of ['about-doctor', 'experience', 'doctor-directions', 'services-doctor', 'doctor-schedule', 'booking']) {
    assert.ok(html.includes('id="' + id + '"'), id);
  }
  assert.equal([...html.matchAll(/<li><span>УЗИ/g)].length, 4);
  assert.match(html, /Более 30 лет/);
  assert.match(html, /Кандидат медицинских наук/);
  assert.match(html, /<h1><em>Екатерина Владимировна<\/em><br>Орехова<\/h1>/);
  assert.match(html, /По субботам, по предварительной записи/);
  assert.doesNotMatch(html, /id="visit"|На согласовании|data-pending-content/);
  assert.doesNotMatch(html, /class="detail-jumps"|← Все врачи центра/);
});

test('service page includes verified public sections and supplied landscape photograph', () => {
  const html = fs.readFileSync(path.join(root, pages[1]), 'utf8');
  for (const id of ['description', 'preparation', 'cost', 'specialists', 'questions', 'booking']) {
    assert.ok(html.includes('id="' + id + '"'), id);
  }
  for (const id of ['indications', 'included', 'procedure', 'results']) assert.ok(!html.includes('id="' + id + '"'), id);
  assert.match(html, /src="\.\.\/assets\/general-ultrasound-exam.png"/);
  assert.match(html, /service-hero-photo--landscape/);
  assert.doesNotMatch(html, /На согласовании|data-pending-content|Временное наполнение|Макет (?:состава|этапов)|не подтверждены/);
  assert.equal([...html.matchAll(/class="detail-price-item"/g)].length, 13);
  assert.match(html, /УЗИ органов брюшной полости/);
  assert.match(html, /1 400 ₽/);
  assert.doesNotMatch(html, /Цена не указана|— ₽/);
  assert.doesNotMatch(html, /class="detail-jumps"|← Все направления УЗИ/);
});

test('new sections include designed components and a refreshed stylesheet URL', () => {
  for (const file of pages) {
    const html = fs.readFileSync(path.join(root, file), 'utf8');
    assert.match(html, /detail-design.css\?v=(?:20260831-layout-v2|20260901-doctors|20260904-compact-profiles)/);
    const cards = [...html.matchAll(/<article class="detail-draft-card"[^>]*>([\s\S]*?)<\/article>/g)];
    if (file.startsWith('doctors/')) assert.ok(cards.length > 0);
    for (const [, card] of cards) {
      assert.match(card, /class="detail-block-icon"/);
    }
  }
  const service = fs.readFileSync(path.join(root, pages[1]), 'utf8');
  assert.equal([...service.matchAll(/class="detail-procedure-card"/g)].length, 0);
  const doctor = fs.readFileSync(path.join(root, pages[0]), 'utf8');
  assert.equal([...doctor.matchAll(/class="detail-timeline-marker"/g)].length, 8);
  assert.match(doctor, /detail-schedule-panel/);
  assert.match(service, /class="detail-price-heading"/);
});

test('Orekhova education, associations and award use public-facing copy', () => {
  const html = fs.readFileSync(path.join(root, pages[0]), 'utf8');
  for (const id of ['education-doctor', 'training-doctor', 'associations-doctor', 'award-doctor']) assert.ok(html.includes(`id="${id}"`));
  assert.ok(html.includes('id="doctor-reviews"'));
  for (const year of [1994, 1995, 2006, 2023, 2024, 2025, 2012]) assert.ok(html.includes(`class="detail-timeline-date">${year}</span>`));
  for (const year of [2013, 2014, 2016, 2018, 2019, 2020]) assert.ok(!html.includes(`class="detail-timeline-date">${year}</span>`));
  assert.match(html, /Уральская государственная медицинская академия дополнительного образования/);
  assert.match(html, /Ассоциация специалистов медицины плода/);
  assert.match(html, /ISUOG/);
  assert.match(html, /Участие в профессиональных медицинских сообществах/);
  assert.doesNotMatch(html, /сохранённой странице|актуальное членство отдельно не подтверждено/);
  assert.match(html, /Лучший врач года/);
  assert.match(html, /Победитель в номинации «Лучший врач-исследователь»/);
  assert.match(html, /Министерство здравоохранения Челябинской области/);
  assert.match(html, /Отличник здравоохранения/);
  assert.doesNotMatch(html, /указана в профиле|в источнике не названа/);
  assert.match(html, /Читать отзывы на ПроДокторов/);
  assert.match(html, /href="https:\/\/prodoctorov.ru\/chelyabinsk\/vrach\/122637-orehova\/" target="_blank" rel="noopener"/);
  assert.doesNotMatch(html, /Рейтинг 4,8|Открыть профиль/);
  assert.doesNotMatch(html, /Показатели приведены по сохранённой версии/);
});

test('Orekhova education and training use decorative site-style icons', () => {
  const html = fs.readFileSync(path.join(root, pages[0]), 'utf8');
  for (const [id, count] of [['education-doctor', 3], ['training-doctor', 3]]) {
    const section = html.split(`id="${id}"`)[1].split('</section>')[0];
    assert.equal([...section.matchAll(/class="detail-block-icon" aria-hidden="true"/g)].length, count);
    assert.equal([...section.matchAll(/<svg viewBox="0 0 24 24"/g)].length, count);
  }
});
