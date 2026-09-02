(function () {
  const root = document.querySelector('[data-service-directory]');
  const catalog = window.ME_SERVICE_CATALOG;
  if (!root || !Array.isArray(catalog) || !catalog.length) return;

  const nav = root.querySelector('[data-service-categories]');
  const list = root.querySelector('[data-service-items]');
  const title = root.querySelector('[data-service-title]');
  const count = root.querySelector('[data-service-count]');
  const rubles = value => `${new Intl.NumberFormat('ru-RU').format(value)} ₽`;

  function renderItems(category) {
    title.textContent = category.title;
    count.textContent = `${category.items.length} ${category.items.length === 1 ? 'услуга' : category.items.length < 5 ? 'услуги' : 'услуг'}`;
    list.replaceChildren(...category.items.map((service, index) => {
      const article = document.createElement('article');
      article.className = 'directory-service';
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
      article.style.setProperty('--item-order', index);
      return article;
    }));
  }

  function selectCategory(category, updateHash) {
    nav.querySelectorAll('button').forEach(button => {
      const active = button.dataset.category === category.id;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-selected', String(active));
      if (active) button.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    });
    renderItems(category);
    if (updateHash && history.replaceState) history.replaceState(null, '', `#catalog-${category.id}`);
  }

  catalog.forEach(category => {
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.category = category.id;
    button.setAttribute('role', 'tab');
    button.setAttribute('aria-controls', 'service-directory-list');
    button.textContent = category.title;
    button.addEventListener('click', () => selectCategory(category, true));
    nav.append(button);
  });

  const requested = location.hash.replace('#catalog-', '');
  selectCategory(catalog.find(category => category.id === requested) || catalog[0], false);
}());
