(function () {
  const catalog = window.ME_SERVICE_CATALOG;
  const list = document.querySelector('[data-category-items]');
  if (!Array.isArray(catalog) || !list) return;

  const descriptions = {
    'medical-analyses': 'Лабораторные исследования СИТИЛАБ и комплексные профили: найдите нужный анализ по названию, коду или разделу.',
    consultations: 'Первичные и повторные приёмы специалистов медицинского центра.',
    'gynecology-services': 'Диагностические и лечебные услуги по направлению гинекологии.',
    'functional-diagnostics': 'ЭКГ, холтеровское мониторирование и мониторирование артериального давления.',
    'heart-vessels-joints': 'Ультразвуковая диагностика сердца, сосудов и суставов для взрослых.',
    'general-ultrasound': 'Исследования внутренних органов и мягких тканей.',
    'women-ultrasound': 'Ультразвуковые исследования женского здоровья.',
    'women-complexes': 'Комплексные программы УЗИ для женщин за один визит.',
    pregnancy: 'Скрининги и дополнительные исследования во время беременности.',
    'men-complexes': 'Комплексные программы ультразвуковой диагностики для мужчин.',
    'children-ultrasound': 'Ультразвуковые исследования для детей.',
    'spine-massage': 'Программы аппаратного физиотерапевтического массажа позвоночника.'
  };
  const id = new URLSearchParams(location.search).get('category');
  const category = catalog.find(entry => entry.id === id) || catalog[0];
  const isAnalyses = category.id === 'medical-analyses';
  const hidesDuration = ['consultations', 'gynecology-services'].includes(category.id);
  const displayTitle = isAnalyses ? 'Медицинские анализы в лаборатории СИТИЛАБ' : category.title;
  const rubles = value => `${new Intl.NumberFormat('ru-RU').format(value)} ₽`;
  const plural = count => count % 10 === 1 && count % 100 !== 11 ? 'услуга' : count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 10 || count % 100 >= 20) ? 'услуги' : 'услуг';

  document.querySelectorAll('[data-category-title]').forEach(node => { node.textContent = displayTitle; });
  document.querySelector('[data-category-description]').textContent = descriptions[category.id];
  document.querySelector('[data-category-count]').textContent = `${category.items.length} ${plural(category.items.length)}`;
  document.title = `${displayTitle} — Мед-ЭКСПРЕСС`;

  if (hidesDuration) document.querySelector('#category-list-title').textContent = 'Стоимость';

  if (isAnalyses) {
    document.body.classList.add('category-page--analyses');
    const analysesPhone = '+7 (900) 093-06-86';
    const analysesHref = 'tel:+79000930686';
    const headingNote = document.querySelector('.category-list-heading p');
    headingNote.innerHTML = `Все вопросы по анализам и запись: <a class="category-analyses-phone" href="${analysesHref}">${analysesPhone}</a>`;
    const headerRecord = document.querySelector('.header-actions .btn');
    headerRecord.href = analysesHref;
    headerRecord.removeAttribute('target');
    headerRecord.removeAttribute('rel');
    headerRecord.textContent = analysesPhone;
    const floatingRecord = document.querySelector('.floating-record');
    floatingRecord.href = analysesHref;
    floatingRecord.removeAttribute('target');
    floatingRecord.removeAttribute('rel');
    floatingRecord.querySelector('span').textContent = 'Анализы';
  }

  const renderServices = services => list.replaceChildren(...services.map((service, index) => {
    const article = document.createElement('article');
    article.className = 'directory-service';
    article.style.setProperty('--item-order', index);
    if (service.group) {
      const group = document.createElement('span');
      group.className = 'directory-service__group';
      group.textContent = service.group;
      article.append(group);
    }
    if (service.code) {
      const code = document.createElement('span');
      code.className = 'directory-service__code';
      code.textContent = `Код ${service.code}`;
      article.append(code);
    }
    const heading = document.createElement('h3');
    heading.textContent = service.name;
    const meta = document.createElement('div');
    meta.className = 'directory-service__meta';
    const timing = service.term || (service.duration ? `${service.duration} мин.` : '');
    meta.innerHTML = `<div class="directory-service__price"><strong>${rubles(service.price)}</strong>${service.saving ? `<small>${service.saving}</small>` : ''}</div>${timing ? `<span><i aria-hidden="true"></i>${timing}</span>` : ''}`;
    article.append(heading, meta);
    if (service.priceNote) {
      const note = document.createElement('p');
      note.className = 'directory-service__price-note';
      note.textContent = service.priceNote;
      article.append(note);
    }
    const disclosures = [
      ...(service.preparation?.length ? [['Подготовка', service.preparation]] : []),
      ...(service.procedure?.length ? [['Как проходит исследование', service.procedure]] : []),
      ...(service.details?.length ? [[category.id === 'medical-analyses' ? 'Подробнее об исследовании' : 'Дополнительная информация', service.details]] : [])
    ];
    if (disclosures.length) {
      const information = document.createElement('div');
      information.className = 'directory-service__information';
      disclosures.forEach(([label, paragraphs]) => {
        const details = document.createElement('details');
        details.className = 'directory-service__details';
        const summary = document.createElement('summary');
        summary.textContent = label;
        const body = document.createElement('div');
        paragraphs.forEach(text => {
          const paragraph = document.createElement('p');
          paragraph.textContent = text;
          body.append(paragraph);
        });
        details.append(summary, body);
        information.append(details);
      });
      article.append(information);
    }
    return article;
  }));

  renderServices(category.items);
  if (isAnalyses) {
    document.querySelector('#category-list-title').textContent = 'Анализы и цены';
    document.querySelector('[data-lab-tools]').hidden = false;
    const search = document.querySelector('#lab-search');
    const group = document.querySelector('#lab-group');
    const results = document.querySelector('[data-lab-results]');
    const normalize = value => value.toLocaleLowerCase('ru').replace(/ё/g, 'е').replace(/[‐‑–—]/g, '-');
    [...new Set(category.items.map(service => service.group))].forEach(name => {
      const option = document.createElement('option');
      option.value = name;
      option.textContent = name;
      group.append(option);
    });
    const filter = () => {
      const words = normalize(search.value).trim().split(/\s+/).filter(Boolean);
      const filtered = category.items.filter(service => {
        const text = normalize([service.name, service.code || '', service.group, ...(service.details || [])].join(' '));
        return (!group.value || service.group === group.value) && words.every(word => text.includes(word));
      });
      renderServices(filtered);
      results.textContent = `Показано: ${filtered.length} из ${category.items.length}`;
      document.querySelector('[data-lab-empty]').hidden = filtered.length !== 0;
    };
    search.addEventListener('input', filter);
    group.addEventListener('change', filter);
    document.querySelector('[data-lab-reset]').addEventListener('click', () => {
      search.value = '';
      group.value = '';
      filter();
      search.focus();
    });
    filter();
  }

  const links = document.querySelector('[data-category-links]');
  links.replaceChildren(...catalog.filter(entry => entry.id !== category.id).slice(0, 5).map(entry => {
    const anchor = document.createElement('a');
    anchor.href = `category.html?category=${entry.id}`;
    anchor.innerHTML = `<span>${entry.title}</span><b aria-hidden="true">→</b>`;
    return anchor;
  }));
}());
