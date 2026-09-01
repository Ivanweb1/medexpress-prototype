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
  const licenceServicesNaberezhnaya = [
    'Акушерское дело', 'Сестринское дело', 'Функциональная диагностика',
    'Организация здравоохранения и общественное здоровье, эпидемиология', 'Терапия',
    'Акушерство и гинекология', 'Генетика', 'Кардиология', 'Неврология',
    'Ультразвуковая диагностика', 'Эндокринология'
  ];
  const list = (items) => `<ul class="document-list-clean">${items.map((item) => `<li>${item}</li>`).join('')}</ul>`;

  const pages = {
    'Лицензия': {
      intro: 'Действующая лицензия на осуществление медицинской деятельности и перечень лицензированных работ.',
      html: `<div class="document-content"><aside class="document-aside"><span>Статус лицензии</span><strong>Действует</strong><p>Выписка из реестра сформирована 25 августа 2025 года.</p><a class="button button--dark" href="../assets/documents/license-medexpress.pdf" target="_blank" rel="noopener">Открыть PDF</a></aside><div class="document-sections">
        <article class="document-card"><h2>Основные сведения</h2><dl class="document-kv"><div><dt>Регистрационный номер</dt><dd>Л041-01024-74/00355466</dd></div><div><dt>Дата предоставления</dt><dd>5 августа 2020 года</dd></div><div><dt>Лицензирующий орган</dt><dd>Министерство здравоохранения Челябинской области</dd></div><div><dt>Лицензиат</dt><dd>ООО «Мед-ЭКСПРЕСС»</dd></div><div><dt>ИНН</dt><dd>7451351660</dd></div><div><dt>ОГРН</dt><dd>1137451006824</dd></div><div><dt>Последний приказ</dt><dd>№ 1180-УЛ от 25.08.2025</dd></div></dl></article>
        <article class="document-card"><h2>Адрес: ул. Ленина, 50</h2><p>456880, Челябинская область, Аргаяшский район, село Аргаяш, улица Ленина, дом 50. Нежилые помещения № 19–25, этаж 2.</p><h3>Лицензированные работы и услуги</h3>${list(licenceServicesLenina)}</article>
        <article class="document-card"><h2>Адрес: ул. Набережная, 1А</h2><p>456880, Челябинская область, Аргаяшский район, село Аргаяш, улица Набережная, дом 1А. Помещения № 36, 37, 44–49.</p><h3>Лицензированные работы и услуги</h3>${list(licenceServicesNaberezhnaya)}</article>
      </div></div>`
    },
    'Реквизиты': {
      intro: 'Юридические, контактные и банковские реквизиты ООО «Мед-ЭКСПРЕСС».',
      html: `<div class="document-content"><aside class="document-aside"><span>Организация</span><strong>ООО «Мед-ЭКСПРЕСС»</strong><p>Директор — Орехов Алексей Владимирович.</p><a class="button button--dark" href="mailto:med-express2017@mail.ru">Написать по e-mail</a></aside><div class="document-sections">
        <article class="document-card"><h2>Юридические сведения</h2><dl class="document-kv"><div><dt>Полное наименование</dt><dd>Общество с ограниченной ответственностью «Мед-ЭКСПРЕСС»</dd></div><div><dt>Юридический адрес</dt><dd>454091, Челябинская область, г. Челябинск, ул. Цвиллинга, д. 59А, помещение 15</dd></div><div><dt>ИНН / КПП</dt><dd>7451351660 / 745101001</dd></div><div><dt>ОГРН</dt><dd>1137451006824</dd></div><div><dt>Директор</dt><dd>Орехов Алексей Владимирович</dd></div></dl></article>
        <article class="document-card"><h2>Адреса деятельности</h2><dl class="document-kv"><div><dt>Основной адрес центра</dt><dd>456880, Челябинская область, с. Аргаяш, ул. Ленина, д. 50, помещения № 19–25, этаж 2</dd></div><div><dt>Лицензированный адрес</dt><dd>456880, Челябинская область, с. Аргаяш, ул. Набережная, д. 1А, помещения № 36, 37, 44–49</dd></div></dl></article>
        <article class="document-card"><h2>Банковские реквизиты</h2><dl class="document-kv"><div><dt>Банк</dt><dd>Челябинское отделение № 8597 ПАО Сбербанк</dd></div><div><dt>ИНН / КПП банка</dt><dd>7707083893 / 745302001</dd></div><div><dt>БИК</dt><dd>047501602</dd></div><div><dt>Корреспондентский счёт</dt><dd>30101810700000000602</dd></div><div><dt>Расчётный счёт</dt><dd>40702810772000038313</dd></div></dl></article>
        <article class="document-card"><h2>Контакты</h2><dl class="document-kv"><div><dt>Рабочая почта</dt><dd><a href="mailto:med-express2017@mail.ru">med-express2017@mail.ru</a></dd></div><div><dt>Дополнительная почта</dt><dd><a href="mailto:dr.orekova@mail.ru">dr.orekova@mail.ru</a></dd></div><div><dt>Телефон из реквизитов</dt><dd><a href="tel:+79080853956">+7 (908) 085-39-56</a></dd></div><div><dt>Телефон центра</dt><dd><a href="tel:+79617958759">+7 (961) 795-87-59</a></dd></div></dl></article>
      </div></div>`
    }
  };

  const page = pages[name];
  if (page) {
    if (intro) intro.textContent = page.intro;
    mount.innerHTML = page.html;
  } else {
    mount.innerHTML = '<div class="document-placeholder"><h2>Документ готовится к публикации</h2><p>Содержание этого документа пока не было предоставлено медицинским центром. Уточнить информацию можно у администратора.</p></div>';
  }
})();
