const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');

test('massage page contains the supplied programmes, apparatus description and contact', () => {
  const html = fs.readFileSync(path.join(root, 'services/spine-massage.html'), 'utf8');
  for (const value of ['Аппарат для физиотерапевтического массажа', 'Сканирование позвоночника', 'Инфракрасное воздействие', '18 минут', '500 ₽', '36,5 минут', '1 000 ₽', '4 500 ₽', '8 500 ₽', '2 200 ₽', 'Экономия 500 ₽', 'Экономия 1 500 ₽', 'Экономия 300 ₽', '+7 (961) 795-87-59']) {
    assert.match(html, new RegExp(value.replace(/[+()]/g, '\\$&')));
  }
  assert.match(html, /src="\.\.\/assets\/massage-bed.png"/);
  assert.match(html, /имеются противопоказания/i);
  assert.doesNotMatch(html, /Серагем|Ceragem/i);
  assert.doesNotMatch(html, /\+79000930686|\+7 \(900\) 093-06-86/);
  assert.equal([...html.matchAll(/tel:\+79617958759/g)].length, 5);
  assert.equal([...html.matchAll(/class="directory-service"/g)].length, 6);
  assert.equal([...html.matchAll(/<summary>Дополнительная информация<\/summary>/g)].length, 6);
  assert.match(html, /class="service-directory__list massage-tariff-list"/);
  assert.doesNotMatch(html, /class="massage-course-grid"/);
});

test('document pages publish the current licence and supplied requisites', () => {
  const data = fs.readFileSync(path.join(root, 'documents-data.js'), 'utf8');
  for (const value of ['Л041-01024-74/00355466', '25 августа 2025', '№ 1180-УЛ', 'ул. Ленина, д. 50', '7451351660', '1137451006824', '40702810772000038313']) {
    assert.match(data, new RegExp(value.replace(/[.+?^${}()|[\]\\]/g, '\\$&')));
  }
  assert.doesNotMatch(data, /ЛО-74-01-005595/);
  assert.doesNotMatch(data, /Набережн/);
  assert.ok(fs.existsSync(path.join(root, 'assets/documents/license-medexpress.pdf')));
});

test('controlling authorities page publishes supplied contacts and official links', () => {
  const data = fs.readFileSync(path.join(root, 'documents-data.js'), 'utf8');
  for (const text of [
    'Министерство здравоохранения Челябинской области',
    'Управление Росздравнадзора по Челябинской области',
    'Управление Роспотребнадзора по Челябинской области',
    '+7 (351) 240-22-22', '+7 (351) 263-21-22', '+7 (351) 261-54-65',
    'http://www.zdrav74.ru/', 'https://sfr.gov.ru/branches/chelyabinsk/', 'http://foms74.ru/'
  ]) assert.ok(data.includes(text), text);
  assert.match(data, /'Контролирующие органы':\s*\{/);
});

test('privacy policy covers the operator, website processing, user rights and external services', () => {
  const html = fs.readFileSync(path.join(root, 'documents.html'), 'utf8');
  const detail = fs.readFileSync(path.join(root, 'documents/document.html'), 'utf8');
  const data = fs.readFileSync(path.join(root, 'documents-data.js'), 'utf8');
  assert.match(html, /document\.html\?name=Политика%20конфиденциальности/);
  assert.match(detail, /documents-data\.js\?v=20260911-privacy-policy/);
  for (const value of [
    "'Политика конфиденциальности'", '11 сентября 2026 года', 'ООО «Мед-ЭКСПРЕСС»',
    '7451351660', '1137451006824', 'IP-адрес', 'Сайт не предназначен для передачи медицинских документов',
    'Права субъекта персональных данных', 'Защита персональных данных',
    'privacy.vk.com/policy', 'yandex.ru/legal/confidential/', 'Федерального закона № 152-ФЗ'
  ]) assert.ok(data.includes(value), value);
  assert.doesNotMatch(data, /Яндекс\.Метрик|Google Analytics|рекламные cookie используются/);
});

test('documents page publishes all supplied personal data forms as PDF files', () => {
  const html = fs.readFileSync(path.join(root, 'documents.html'), 'utf8');
  const documents = [
    ['consent-personal-data.pdf', 'Согласие на обработку персональных данных'],
    ['consent-personal-data-legal-representative.pdf', 'Согласие законного представителя на обработку персональных данных несовершеннолетнего'],
    ['explanation-refusal-personal-data.pdf', 'Разъяснение юридических последствий отказа предоставить персональные данные'],
    ['consent-personal-data-website.pdf', 'Согласие на обработку персональных данных на сайте']
  ];

  for (const [filename, title] of documents) {
    assert.ok(html.includes(`assets/documents/${filename}`), filename);
    assert.ok(html.includes(title), title);
    assert.ok(fs.existsSync(path.join(root, 'assets/documents', filename)), filename);
  }
});

test('all local links and assets on the massage and document detail pages resolve', () => {
  for (const file of ['services/spine-massage.html', 'services/cardiology.html', 'documents/document.html']) {
    const html = fs.readFileSync(path.join(root, file), 'utf8');
    for (const [, url] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
      if (/^(https?:|tel:|mailto:)/.test(url) || url.startsWith('#')) continue;
      const target = path.resolve(root, path.dirname(file), url.split('?')[0]);
      assert.ok(fs.existsSync(target), `${file}: ${url}`);
    }
  }
});

test('cardiology page and doctor profile preserve the supplied cardiology facts', () => {
  const html = fs.readFileSync(path.join(root, 'services/cardiology.html'), 'utf8');
  const data = fs.readFileSync(path.join(root, 'doctors-data.js'), 'utf8');
  for (const value of ['8 700 ₽', '2 400 ₽', 'PROздоровье', 'ЭКГ', 'ЭХОКГ', 'суточный мониторинг ЭКГ', 'консультация кардиолога']) {
    assert.match(html, new RegExp(value));
  }
  for (const value of ['2005', '2006', '2013', '2017', '20 лет', 'По понедельникам и четвергам, по предварительной записи', 'Ультразвуковая диагностика', 'Терапия', 'Функциональная диагностика', 'Кардиология', 'Ишемическая болезнь сердца', 'Сосудистые патологии']) {
    assert.match(data, new RegExp(value));
  }
});
