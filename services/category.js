(function () {
  const catalog = window.ME_SERVICE_CATALOG;
  const list = document.querySelector('[data-category-items]');
  if (!Array.isArray(catalog) || !list) return;

  const descriptions = {
    consultations: 'Приёмы специалистов и диагностические процедуры врачебного профиля.',
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
  const rubles = value => `${new Intl.NumberFormat('ru-RU').format(value)} ₽`;
  const plural = count => count % 10 === 1 && count % 100 !== 11 ? 'услуга' : count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 10 || count % 100 >= 20) ? 'услуги' : 'услуг';

  document.querySelectorAll('[data-category-title]').forEach(node => { node.textContent = category.title; });
  document.querySelector('[data-category-description]').textContent = descriptions[category.id];
  document.querySelector('[data-category-count]').textContent = `${category.items.length} ${plural(category.items.length)}`;
  document.title = `${category.title} — Мед-ЭКСПРЕСС`;

  list.replaceChildren(...category.items.map((service, index) => {
    const article = document.createElement('article');
    article.className = 'directory-service';
    article.style.setProperty('--item-order', index);
    const heading = document.createElement('h3');
    heading.textContent = service.name;
    const meta = document.createElement('div');
    meta.className = 'directory-service__meta';
    meta.innerHTML = `<strong>${rubles(service.price)}</strong><span><i aria-hidden="true"></i>${service.duration} мин.</span>`;
    article.append(heading, meta);
    if (service.details) {
      const details = document.createElement('details');
      details.className = 'directory-service__details';
      const summary = document.createElement('summary');
      summary.textContent = service.name.includes('ЭХОКГ') || service.name.includes('Трансвагинальное') ? 'Как подготовиться' : 'Что входит';
      const body = document.createElement('div');
      service.details.forEach(text => {
        const paragraph = document.createElement('p');
        paragraph.textContent = text;
        body.append(paragraph);
      });
      details.append(summary, body);
      article.append(details);
    }
    return article;
  }));

  const links = document.querySelector('[data-category-links]');
  links.replaceChildren(...catalog.filter(entry => entry.id !== category.id).slice(0, 5).map(entry => {
    const anchor = document.createElement('a');
    anchor.href = `category.html?category=${entry.id}`;
    anchor.innerHTML = `<span>${entry.title}</span><b aria-hidden="true">→</b>`;
    return anchor;
  }));
}());
