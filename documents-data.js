(() => {
  const mount = document.getElementById('document-content');
  if (!mount) return;
  const name = new URLSearchParams(window.location.search).get('name') || 'Документ';
  const intro = document.querySelector('[data-document-intro]');

  const licenceServicesLenina = [
    'Акушерское дело', 'Сестринское дело', 'Функциональная диагностика', 'Терапия',
    'Акушерство и гинекология', 'Кардиология', 'Неврология', 'Ультразвуковая диагностика',
    'Эндокринология', 'Медицинские осмотры: предсменные, предрейсовые, послесменные и послерейсовые'
  ];
  const list = (items) => `<ul class="document-list-clean">${items.map((item) => `<li>${item}</li>`).join('')}</ul>`;

  const pages = {
    'Лицензия': {
      intro: 'Действующая лицензия на осуществление медицинской деятельности и перечень лицензированных работ.',
      html: `<div class="document-content"><aside class="document-aside"><span>Статус лицензии</span><strong>Действует</strong><p>Выписка из реестра сформирована 25 августа 2025 года.</p><a class="button button--dark" href="../assets/documents/license-medexpress.pdf" target="_blank" rel="noopener">Открыть PDF</a></aside><div class="document-sections">
        <article class="document-card"><h2>Основные сведения</h2><dl class="document-kv"><div><dt>Регистрационный номер</dt><dd>Л041-01024-74/00355466</dd></div><div><dt>Дата предоставления</dt><dd>5 августа 2020 года</dd></div><div><dt>Лицензирующий орган</dt><dd>Министерство здравоохранения Челябинской области</dd></div><div><dt>Лицензиат</dt><dd>ООО «Мед-ЭКСПРЕСС»</dd></div><div><dt>ИНН</dt><dd>7451351660</dd></div><div><dt>ОГРН</dt><dd>1137451006824</dd></div><div><dt>Последний приказ</dt><dd>№ 1180-УЛ от 25.08.2025</dd></div></dl></article>
        <article class="document-card"><h2>Адрес: ул. Ленина, 50</h2><p>456880, Челябинская область, Аргаяшский район, село Аргаяш, улица Ленина, дом 50. Нежилые помещения № 19–25, этаж 2.</p><h3>Лицензированные работы и услуги</h3>${list(licenceServicesLenina)}</article>
      </div></div>`
    },
    'Реквизиты': {
      intro: 'Юридические, контактные и банковские реквизиты ООО «Мед-ЭКСПРЕСС».',
      html: `<div class="document-content"><aside class="document-aside"><span>Организация</span><strong>ООО «Мед-ЭКСПРЕСС»</strong><p>Директор — Орехов Алексей Владимирович.</p><a class="button button--dark" href="mailto:med-express2017@mail.ru">Написать по e-mail</a></aside><div class="document-sections">
        <article class="document-card"><h2>Юридические сведения</h2><dl class="document-kv"><div><dt>Полное наименование</dt><dd>Общество с ограниченной ответственностью «Мед-ЭКСПРЕСС»</dd></div><div><dt>Юридический адрес</dt><dd>454091, Челябинская область, г. Челябинск, ул. Цвиллинга, д. 59А, помещение 15</dd></div><div><dt>ИНН / КПП</dt><dd>7451351660 / 745101001</dd></div><div><dt>ОГРН</dt><dd>1137451006824</dd></div><div><dt>Директор</dt><dd>Орехов Алексей Владимирович</dd></div></dl></article>
        <article class="document-card"><h2>Адрес деятельности</h2><dl class="document-kv"><div><dt>Основной адрес центра</dt><dd>456880, Челябинская область, с. Аргаяш, ул. Ленина, д. 50, помещения № 19–25, этаж 2</dd></div></dl></article>
        <article class="document-card"><h2>Банковские реквизиты</h2><dl class="document-kv"><div><dt>Банк</dt><dd>Челябинское отделение № 8597 ПАО Сбербанк</dd></div><div><dt>ИНН / КПП банка</dt><dd>7707083893 / 745302001</dd></div><div><dt>БИК</dt><dd>047501602</dd></div><div><dt>Корреспондентский счёт</dt><dd>30101810700000000602</dd></div><div><dt>Расчётный счёт</dt><dd>40702810772000038313</dd></div></dl></article>
        <article class="document-card"><h2>Контакты</h2><dl class="document-kv"><div><dt>Рабочая почта</dt><dd><a href="mailto:med-express2017@mail.ru">med-express2017@mail.ru</a></dd></div><div><dt>Дополнительная почта</dt><dd><a href="mailto:dr.orekova@mail.ru">dr.orekova@mail.ru</a></dd></div><div><dt>Телефон из реквизитов</dt><dd><a href="tel:+79080853956">+7 (908) 085-39-56</a></dd></div><div><dt>Телефон центра</dt><dd><a href="tel:+79617958759">+7 (961) 795-87-59</a></dd></div></dl></article>
      </div></div>`
    },
    'Контролирующие органы': {
      intro: 'Адреса, телефоны и официальные сайты органов исполнительной власти в сфере охраны здоровья граждан.',
      html: `<div class="document-content"><aside class="document-aside"><span>Информация пациентам</span><strong>Контролирующие органы</strong><p>Контактные данные органов исполнительной власти и надзорных ведомств Челябинской области.</p></aside><div class="document-sections">
        <article class="document-card"><h2>Министерство здравоохранения Челябинской области</h2><dl class="document-kv"><div><dt>Адрес</dt><dd>454000, г. Челябинск, ул. Кирова, 165</dd></div><div><dt>Телефон</dt><dd><a href="tel:+73512402222">+7 (351) 240-22-22</a></dd></div><div><dt>Официальный сайт</dt><dd><a href="http://www.zdrav74.ru/" target="_blank" rel="noopener">zdrav74.ru</a></dd></div></dl></article>
        <article class="document-card"><h2>Управление Росздравнадзора по Челябинской области</h2><dl class="document-kv"><div><dt>Адрес</dt><dd>г. Челябинск, пл. МОПРа, 8а</dd></div><div><dt>Телефон</dt><dd><a href="tel:+73512632122">+7 (351) 263-21-22</a></dd></div><div><dt>По вопросам оказания медицинской помощи</dt><dd><a href="tel:+73512645008">+7 (351) 264-50-08</a><br><a href="tel:+73517278535">+7 (351) 727-85-35</a></dd></div><div><dt>Официальный сайт</dt><dd><a href="http://www.roszdravnadzor.ru/" target="_blank" rel="noopener">roszdravnadzor.ru</a></dd></div></dl></article>
        <article class="document-card"><h2>Управление Роспотребнадзора по Челябинской области</h2><dl class="document-kv"><div><dt>Адрес</dt><dd>454092, г. Челябинск, ул. Елькина, 73</dd></div><div><dt>Телефоны</dt><dd><a href="tel:+73512637807">+7 (351) 263-78-07</a><br><a href="tel:+73512636490">+7 (351) 263-64-90</a><br><a href="tel:+73512615465">+7 (351) 261-54-65</a></dd></div><div><dt>Факс</dt><dd>+7 (351) 263-64-90</dd></div><div><dt>Официальный сайт</dt><dd><a href="http://74.rospotrebnadzor.ru/" target="_blank" rel="noopener">74.rospotrebnadzor.ru</a></dd></div></dl></article>
        <article class="document-card"><h2>Официальные сайты</h2><ul class="document-list-clean document-links-list"><li><a href="http://www.minzdravsoc.ru/" target="_blank" rel="noopener">Министерство здравоохранения и социального развития Российской Федерации</a></li><li><a href="http://www.zdrav74.ru/" target="_blank" rel="noopener">Министерство здравоохранения Челябинской области</a></li><li><a href="http://www.miac74.ru/" target="_blank" rel="noopener">Челябинский областной медицинский информационно-аналитический центр</a></li><li><a href="https://sfr.gov.ru/branches/chelyabinsk/" target="_blank" rel="noopener">Отделение Социального фонда России по Челябинской области</a></li><li><a href="http://foms74.ru/" target="_blank" rel="noopener">Территориальный фонд обязательного медицинского страхования Челябинской области</a><span>454080, г. Челябинск, ул. Труда, 156 · <a href="tel:88003001003">8 800 300-10-03</a></span></li><li><a href="http://www.roszdravnadzor.ru/" target="_blank" rel="noopener">Федеральная служба по надзору в сфере здравоохранения</a><span>454091, г. Челябинск, пл. МОПРа, д. 8а, к. 31 · <a href="tel:+73512632122">+7 (351) 263-21-22</a></span></li><li><a href="http://74.rospotrebnadzor.ru/" target="_blank" rel="noopener">Управление Роспотребнадзора по Челябинской области</a><span>454092, г. Челябинск, ул. Елькина, 73 · <a href="tel:+73512615465">+7 (351) 261-54-65</a></span></li></ul></article>
      </div></div>`
    }
  };

  const page = pages[name];
  if (page) {
    if (intro) intro.textContent = page.intro;
    mount.innerHTML = page.html;
  } else {
    mount.innerHTML = '<div class="document-placeholder"><h2>Информация по запросу</h2><p>Обратитесь к администратору медицинского центра.</p></div>';
  }
})();
