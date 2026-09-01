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

test('all nine generic profiles contain approved names, schedule and services', () => {
  assert.equal(Object.keys(doctors).length, 9);
  for (const doctor of Object.values(doctors)) {
    assert.match(doctor.name, /^[А-ЯЁ][а-яё-]+ [А-ЯЁ][а-яё-]+ [А-ЯЁ][а-яё-]+$/);
    assert.ok(doctor.role);
    assert.ok(doctor.specialty);
    assert.ok(doctor.schedule);
    assert.ok(doctor.services.length);
  }
});

test('key professional facts are preserved from supplied doctor information', () => {
  assert.equal(doctors['Екатерина Мыжевских'].experience, '29 лет');
  assert.equal(doctors['Ирина Павличук'].experience, 'Более 35 лет');
  assert.equal(doctors['Елена Денисова'].experience, 'Более 40 лет');
  assert.equal(doctors['Лилия Назмутдинова'].education.length, 2);
  assert.equal(doctors['Елена Федоркина'].experience, '19 лет');
  assert.equal(doctors['Юлия Пинаева'].experience, '12 лет');
  assert.ok(doctors['Ирина Бойко'].qualifications.includes('Заслуженный врач Российской Федерации'));
  assert.equal(doctors['Мария Маковецкая'].experience, '13 лет');
});

test('generic profile renderer builds a complete page for every doctor', () => {
  for (const [key, doctor] of Object.entries(doctors)) {
    const mount = { innerHTML: '' };
    const local = {
      window: { ME_DOCTORS: doctors, location: { search: '?name=' + encodeURIComponent(key) } },
      document: { querySelector: () => mount, title: '' },
      URLSearchParams,
    };
    vm.runInNewContext(profileSource, local);
    assert.match(mount.innerHTML, new RegExp(doctor.name.split(' ')[0]));
    assert.ok(mount.innerHTML.includes(doctor.services[0]));
    assert.ok(mount.innerHTML.includes(doctor.schedule));
    assert.match(mount.innerHTML, /Квалификация/);
    assert.match(mount.innerHTML, /Образование/);
    assert.match(mount.innerHTML, /Услуги врача/);
    assert.match(mount.innerHTML, /Отзывы о враче/);
    assert.doesNotMatch(mount.innerHTML, /undefined|null/);
  }
});

test('generic profile template loads shared design, data and renderer', () => {
  const html = fs.readFileSync(path.join(root, 'doctors', 'profile.html'), 'utf8');
  assert.match(html, /\.\.\/home-design.css/);
  assert.match(html, /\.\.\/detail-design.css/);
  assert.match(html, /\.\.\/doctors-data.js/);
  assert.match(html, /\.\.\/doctor-profile.js/);
});

test('every generic doctor link in the catalog resolves to profile data', () => {
  const html = fs.readFileSync(path.join(root, 'doctors.html'), 'utf8');
  const links = [...html.matchAll(/href="doctors\/profile\.html\?name=([^"]+)"/g)].map((match) => decodeURIComponent(match[1]));
  assert.equal(links.length, 9);
  assert.equal(new Set(links).size, 9);
  for (const name of links) assert.ok(doctors[name], name);
});
