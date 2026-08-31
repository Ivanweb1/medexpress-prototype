(() => {
  const catalog = document.querySelector('[data-team-catalog]');
  if (!catalog) return;
  const filters = catalog.querySelector('[data-team-filters]');
  const buttons = [...catalog.querySelectorAll('[data-team-filter]')];
  const cards = [...catalog.querySelectorAll('[data-team-card]')];
  const count = catalog.querySelector('[data-team-count]');
  if (!filters || !count || !buttons.length) return;

  function selectSpecialty(specialty) {
    let visible = 0;
    cards.forEach((card) => {
      card.hidden = specialty !== 'all' && card.dataset.specialty !== specialty;
      if (!card.hidden) visible += 1;
    });
    buttons.forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.teamFilter === specialty));
    });
    count.textContent = 'Специалистов: ' + visible;
  }

  buttons.forEach((button) => {
    button.addEventListener('click', () => selectSpecialty(button.dataset.teamFilter));
  });
  selectSpecialty('all');
  filters.hidden = false;
})();
