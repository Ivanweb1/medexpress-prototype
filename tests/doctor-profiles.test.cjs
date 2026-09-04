const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.join(__dirname, '..');
const dataSource = fs.readFileSync(path.join(root, 'doctors-data.js'), 'utf8');
const profileSource = fs.readFileSync(path.join(root, 'doctor-profile.js'), 'utf8');
const context = { window: {} };
vm.runInNewContext(dataSource, context);
const doctors = context.window.ME_DOCTORS;

test('all nine generic profiles contain approved names and services', () => {
  assert.equal(Object.keys(doctors).length, 9);
  for (const doctor of Object.values(doctors)) {
    assert.match(doctor.name, /^[А-ЯЁ][а-яё-]+ [А-ЯЁ][а-яё-]+ [А-ЯЁ][а-яё-]+$/);
    assert.ok(doctor.role);
    assert.ok(doctor.specialty);
    assert.ok(doctor.services.length);
  }
  assert.equal(doctors['Разина Якупова'].schedule, 'Ежедневно, по предварительной записи');
  assert.equal(doctors['Елена Федоркина'].schedule, undefined);
});

test('Myzhevskikh training and external profile use supplied facts and do not alter other profiles', () => {
  const doctor = doctors['Екатерина Мыжевских'];
  assert.equal(doctor.education[0][0], '1997');
  assert.equal(doctor.education[0][1], 'Челябинская государственная медицинская академия');
  assert.deepEqual(Array.from(doctor.training, row => row[0]), ['1999', '2005', '2008', '2008', '2009']);
  assert.doesNotMatch(doctor.services.join(' '), /Озонотерапия|Фиброгастроскопия/);
  for (const [key, profile] of Object.entries(doctors)) {
    const mount = { innerHTML: '' };
    vm.runInNewContext(profileSource, {
      window: { ME_DOCTORS: doctors, location: { search: '?name=' + encodeURIComponent(key) } },
      document: { querySelector: () => mount, title: '' }, URLSearchParams
    });
    assert.equal(mount.innerHTML.includes('id="doctor-training"'), Boolean(profile.training?.length));
    assert.equal(mount.innerHTML.includes('id="doctor-external-profile"'), Boolean(profile.prodoctorovUrl));
    if (profile.training) {
      const section = mount.innerHTML.split('id="doctor-training"')[1].split('</section>')[0];
      assert.equal([...section.matchAll(/class="detail-block-icon" aria-hidden="true"/g)].length, profile.training.length);
      for (const row of profile.training) for (const value of row) assert.ok(section.includes(value));
      if (profile.prodoctorovUrl) assert.ok(mount.innerHTML.includes(`href="${profile.prodoctorovUrl}" target="_blank" rel="noopener"`));
      if (!profile.prodoctorovReviews) assert.doesNotMatch(mount.innerHTML, /Рейтинг/);
      assert.doesNotMatch(mount.innerHTML, /33 отзыва|ISUOG|Лучший врач-исследователь/);
    }
  }
});

test('key professional facts are preserved from supplied doctor information', () => {
  assert.equal(doctors['Екатерина Мыжевских'].experience, '29 лет');
  assert.equal(doctors['Ирина Павличук'].experience, 'Более 35 лет');
  assert.equal(doctors['Ирина Павличук'].photo, 'doctor-pavlichuk.png');
  assert.equal(doctors['Елена Денисова'].experience, 'Более 40 лет');
  assert.equal(doctors['Лилия Назмутдинова'].education.length, 2);
  assert.equal(doctors['Елена Федоркина'].experience, '19 лет');
  assert.equal(doctors['Разина Якупова'].photo, 'doctor-yakupova.png');
  assert.equal(doctors['Разина Якупова'].experience, '20 лет');
  assert.equal(doctors['Разина Якупова'].education.length, 4);
  assert.equal(doctors['Елена Федоркина'].photo, 'doctor-fedorkina.png');
  assert.equal(doctors['Юлия Пинаева'].experience, '12 лет');
  assert.equal(doctors['Юлия Пинаева'].photo, 'doctor-pinaeva.png');
  assert.ok(doctors['Ирина Бойко'].qualifications.includes('Заслуженный врач Российской Федерации'));
  assert.equal(doctors['Ирина Бойко'].photo, 'doctor-boyko.png');
  assert.equal(doctors['Мария Маковецкая'].experience, '13 лет');
  assert.equal(doctors['Мария Маковецкая'].photo, 'doctor-makovetskaya.png');
});

test('generic profile renderer shows only supplied doctor information', () => {
  for (const [key, doctor] of Object.entries(doctors)) {
    const mount = { innerHTML: '' };
    const local = {
      window: { ME_DOCTORS: doctors, location: { search: '?name=' + encodeURIComponent(key) } },
      document: { querySelector: () => mount, title: '' },
      URLSearchParams,
    };
    vm.runInNewContext(profileSource, local);
    assert.match(mount.innerHTML, new RegExp(doctor.name.split(' ')[0]));
    const [givenName, patronymic, surname] = doctor.name.split(' ');
    assert.ok(mount.innerHTML.includes(`<h1><em>${givenName} ${patronymic}</em><br>${surname}</h1>`));
    for (const service of doctor.services) assert.ok(mount.innerHTML.includes(service), `${key}: ${service}`);
    if (doctor.schedule) assert.ok(mount.innerHTML.includes(doctor.schedule));
    else assert.doesNotMatch(mount.innerHTML, /Расписание/);
    if (doctor.qualifications?.length) assert.match(mount.innerHTML, /Квалификация/);
    else assert.doesNotMatch(mount.innerHTML, /Профессиональный уровень|<h2>Квалификация<\/h2>/);
    if (doctor.education?.length) assert.match(mount.innerHTML, /<h2>Образование<\/h2>/);
    else assert.doesNotMatch(mount.innerHTML, /<h2>Образование<\/h2>/);
    assert.match(mount.innerHTML, /Услуги врача/);
    assert.doesNotMatch(mount.innerHTML, /На согласовании|Информация уточняется|Стаж уточняется|data-pending-content/);
    assert.doesNotMatch(mount.innerHTML, /undefined|null/);
  }
});

test('education and symptom blocks appear only for doctors with supplied facts', () => {
  for (const [key, doctor] of Object.entries(doctors)) {
    const mount = { innerHTML: '' };
    vm.runInNewContext(profileSource, {
      window: { ME_DOCTORS: doctors, location: { search: '?name=' + encodeURIComponent(key) } },
      document: { querySelector: () => mount, title: '' },
      URLSearchParams,
    });
    assert.equal(mount.innerHTML.includes('<h2>Образование</h2>'), Boolean(doctor.education?.length));
    assert.equal(mount.innerHTML.includes('С какими вопросами'), ['Разина Якупова', 'Лилия Назмутдинова', 'Ирина Бойко'].includes(key));
  }
});

test('generic profile template loads shared design, data and renderer', () => {
  const html = fs.readFileSync(path.join(root, 'doctors', 'profile.html'), 'utf8');
  assert.match(html, /\.\.\/home-design.css/);
  assert.match(html, /\.\.\/detail-design.css/);
  assert.match(html, /\.\.\/doctors-data.js/);
  assert.match(html, /\.\.\/doctor-profile.js/);
});

test('six supplied profiles preserve education, courses, ratings and doctor-specific links', () => {
  const expected = [
    ['Мария Маковецкая', 2, 1, null, null, null],
    ['Ирина Бойко', 2, 3, null, null, null],
    ['Юлия Пинаева', 2, 1, '4,0', 4, '752854-pinaeva'],
    ['Елена Федоркина', 4, 4, null, null, null],
    ['Разина Якупова', 4, 1, null, null, '957163-yakupova'],
    ['Лилия Назмутдинова', 2, 0, null, null, '1184548-nazmutdinova']
  ];
  for (const [key, educationCount, trainingCount, rating, count, slug] of expected) {
    const doctor = doctors[key];
    assert.equal(doctor.education.length, educationCount);
    assert.equal(doctor.training?.length || 0, trainingCount);
    if (slug) assert.ok(doctor.prodoctorovUrl.endsWith(`/${slug}/`));
    else assert.equal(doctor.prodoctorovUrl, undefined);
    const mount = { innerHTML: '' };
    vm.runInNewContext(profileSource, {
      window: { ME_DOCTORS: doctors, location: { search: '?name=' + encodeURIComponent(key) } },
      document: { querySelector: () => mount, title: '' }, URLSearchParams
    });
    for (const row of doctor.education) for (const value of row) assert.ok(mount.innerHTML.includes(value));
    if (rating) {
      assert.equal(doctor.prodoctorovReviews.rating, rating);
      assert.equal(doctor.prodoctorovReviews.count, count);
      assert.ok(mount.innerHTML.includes(`Рейтинг ${rating} · ${count}`));
      assert.match(mount.innerHTML, />Читать отзывы <span/);
    } else {
      assert.equal(doctor.prodoctorovReviews, undefined);
      assert.doesNotMatch(mount.innerHTML, /Рейтинг/);
      if (slug) assert.match(mount.innerHTML, />Открыть профиль <span/);
      else assert.doesNotMatch(mount.innerHTML, /doctor-external-profile|ПроДокторов|Читать отзывы|Открыть профиль/);
    }
  }
});

test('every generic doctor link in the catalog resolves to profile data', () => {
  const html = fs.readFileSync(path.join(root, 'doctors.html'), 'utf8');
  const links = [...html.matchAll(/href="doctors\/profile\.html\?name=([^"]+)"/g)].map((match) => decodeURIComponent(match[1]));
  assert.equal(links.length, 9);
  assert.equal(new Set(links).size, 9);
  for (const name of links) assert.ok(doctors[name], name);
});

test('MIS screenshots add confirmed services without assigning unchecked procedures', () => {
  const services = name => Array.from(doctors[name].services);
  const myzhevskikh = services('Екатерина Мыжевских');
  for (const title of ['УЗИ детям', 'УЗИ для женщин', 'Комплексные УЗИ для женщин', 'Комплексные УЗИ для мужчин', 'УЗИ при беременности на раннем сроке — до 10 недель']) assert.ok(myzhevskikh.includes(title));
  assert.doesNotMatch(myzhevskikh.join(' '), /НКТГ|НГГ|Третий УЗ-скрининг/);
  const pavlichuk = services('Ирина Павличук').join(' ');
  assert.match(pavlichuk, /Цервикометрия.*лонного сочленения.*26–28.*31–34/);
  assert.doesNotMatch(pavlichuk, /НКТГ|НГГ|УЗИ детям|Комплексные УЗИ для мужчин/);
  const fedorkina = services('Елена Федоркина').join(' ');
  assert.match(fedorkina, /Комплексные УЗИ для женщин.*Комплексные УЗИ для мужчин/);
  assert.doesNotMatch(fedorkina, /УЗИ сердца|суставов|при беременности|УЗИ детям/);
  const makovetskaya = services('Мария Маковецкая').join(' ');
  assert.match(makovetskaya, /31–34.*двойню/);
  assert.match(makovetskaya, /Цервикометрия.*лонного сочленения.*НГГ.*НКТГ/);
  assert.match(services('Елена Денисова').join(' '), /Скрининг ВПЧ.*Бакпосев.*мазка на микрофлору/);
  for (const doctor of Object.values(doctors)) assert.equal(new Set(doctor.services).size, doctor.services.length);
  const orekhova = fs.readFileSync(path.join(root, 'doctors', 'ekaterina-orekhova.html'), 'utf8');
  assert.match(orekhova, /<li><span>Комплексные УЗИ для женщин<\/span><\/li>/);
});
