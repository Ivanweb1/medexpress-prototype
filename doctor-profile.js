(() => {
  const mount = document.querySelector('[data-doctor-profile]');
  if (!mount) return;
  const key = new URLSearchParams(window.location.search).get('name');
  const doctor = window.ME_DOCTORS?.[key];
  const booking = 'https://m.vk.ru/app53642491_-203789798?ref=group_menu';
  if (!doctor) {
    mount.innerHTML = '<section class="shell detail-section"><span class="eyebrow">Врачи Мед-ЭКСПРЕСС</span><h1>Врач не найден</h1><p class="detail-lead">Вернитесь к списку специалистов и выберите врача.</p><a class="btn" href="../doctors.html">Все врачи</a></section>';
    return;
  }

  const escape = (value) => String(value).replace(/[&<>"']/g, (symbol) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[symbol]);
  const list = (items) => items.map((item) => '<li>' + escape(item) + '</li>').join('');
  const firstSpace = doctor.name.indexOf(' ');
  const firstName = escape(doctor.name.slice(0, firstSpace));
  const restName = escape(doctor.name.slice(firstSpace + 1));
  const portrait = doctor.photo
    ? '<img src="../assets/' + escape(doctor.photo) + '" alt="' + escape(doctor.name) + '" width="600" height="700" fetchpriority="high">'
    : '<div class="profile-portrait__neutral" aria-hidden="true"><svg viewBox="0 0 120 120" fill="none" stroke="currentColor" stroke-width="2"><circle cx="60" cy="40" r="19"/><path d="M25 102V91a35 35 0 0 1 70 0v11M47 66l13 17 13-17M60 83v19"/></svg></div>';
  const facts = [['Специальность', doctor.role], ...(doctor.experience ? [['Стаж работы', doctor.experience]] : []), ['Место приёма', 'Аргаяш, ул. Ленина, 50']];
  const qualifications = doctor.qualifications?.length
    ? doctor.qualifications.map((item) => '<article class="detail-draft-card"><span class="detail-block-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="m9 12 2 2 4-4M12 2l8 3v7c0 5-8 10-8 10S4 17 4 12V5l8-3Z"/></svg></span><h3>' + escape(item) + '</h3></article>').join('')
    : '<article class="detail-draft-card" data-pending-content><span class="detail-draft-label">На согласовании</span><h3>Квалификационная категория</h3><p>Информация пока не предоставлена.</p></article>';
  const education = doctor.education?.length
    ? doctor.education.map(([year, title, copy]) => '<article><div class="detail-timeline-marker"><span class="detail-block-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="m2 8 10-5 10 5-10 5L2 8Zm4 3v6c4 3 8 3 12 0v-6M22 8v8"/></svg></span><span class="detail-timeline-date">' + escape(year) + '</span></div><div><h3>' + escape(title) + '</h3><p>' + escape(copy) + '</p></div></article>').join('')
    : '<article data-pending-content><div class="detail-timeline-marker"><span class="detail-timeline-date">На согласовании</span></div><div><span class="detail-draft-label">Информация уточняется</span><h3>Образование и повышение квалификации</h3><p>Учебные заведения, специальности и годы обучения пока не предоставлены.</p></div></article>';
  const concerns = doctor.concerns?.length ? `
    <section class="detail-section detail-pale">
      <div class="shell detail-editorial"><div><span class="eyebrow">Когда обратиться</span><h2>С какими вопросами<br>принимает врач</h2></div><div class="detail-list-panel"><ul>${list(doctor.concerns)}</ul></div></div>
    </section>` : '';
  const services = doctor.services.map((service) => '<li><span>' + escape(service) + '</span></li>').join('');

  document.title = doctor.name + ' — Мед-ЭКСПРЕСС';
  mount.innerHTML = `
    <section class="shell detail-hero detail-hero--profile">
      <nav class="detail-breadcrumbs" aria-label="Хлебные крошки"><a href="../index.html">Главная</a><span aria-hidden="true">/</span><a href="../doctors.html">Врачи</a><span aria-hidden="true">/</span><span aria-current="page">${escape(doctor.shortName)}</span></nav>
      <div class="profile-hero"><div class="profile-portrait">${portrait}</div><div class="profile-summary"><span class="eyebrow">${escape(doctor.role)}</span><h1>${firstName}<br><em>${restName}</em></h1><p class="detail-lead">${escape(doctor.specialty)}</p><div class="detail-actions"><a class="btn" href="${booking}" target="_blank" rel="noopener">Записаться к врачу <span aria-hidden="true">→</span></a><a class="btn btn--outline" href="#doctor-services">Услуги врача</a></div><dl class="profile-facts">${facts.map(([term, value]) => '<div><dt>' + escape(term) + '</dt><dd>' + escape(value) + '</dd></div>').join('')}</dl></div></div>
    </section>
    <section class="detail-section detail-cream"><div class="shell detail-editorial"><div><span class="eyebrow">О враче</span><h2>Опыт и<br><em>квалификация</em></h2></div><div class="detail-copy"><p class="detail-lead">${escape(doctor.specialty)}</p>${doctor.experience ? '<p>Стаж работы — ' + escape(doctor.experience) + '.</p>' : '<p><span class="detail-draft-label">Стаж уточняется</span></p>'}<p>${escape(doctor.schedule)}.</p></div></div></section>
    <section class="shell detail-section"><div class="detail-section-heading"><div><span class="eyebrow">Профессиональный уровень</span><h2>Квалификация</h2></div></div><div class="detail-draft-grid">${qualifications}</div></section>
    <section class="detail-section detail-pale"><div class="shell detail-editorial"><div><span class="eyebrow">Профессиональный путь</span><h2>Образование</h2></div><div class="detail-timeline">${education}</div></div></section>
    ${concerns}
    <section class="shell detail-section" id="doctor-services"><div class="detail-section-heading"><div><span class="eyebrow">Направления работы</span><h2>Услуги врача</h2></div><p>Стоимость конкретной услуги уточняйте при записи.</p></div><div class="detail-list-panel detail-list-panel--services"><ul>${services}</ul><div><a class="btn" href="${booking}" target="_blank" rel="noopener">Записаться</a><a href="tel:+79617958759">+7 (961) 795-87-59</a></div></div></section>
    <section class="detail-section detail-cream"><div class="shell detail-editorial"><div><span class="eyebrow">Расписание</span><h2>Приём по<br><em>предварительной записи</em></h2></div><div class="detail-schedule-panel"><span class="detail-block-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 11h18"/></svg></span><p class="detail-lead">${escape(doctor.schedule)}</p><a class="btn" href="${booking}" target="_blank" rel="noopener">Выбрать время</a></div></div></section>
    <section class="shell detail-section"><div class="detail-section-heading"><div><span class="eyebrow">Отзывы</span><h2>Отзывы о враче</h2></div><p>Публикуем только подтверждённые отзывы.</p></div><article class="detail-review-draft" data-pending-content><span class="detail-block-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M10 5H4v7h6v7H4M21 5h-6v7h6v7h-6"/></svg></span><h3>Отзывы готовятся к публикации</h3><p>Подтверждённые отзывы о специалисте будут добавлены после согласования.</p><span class="detail-draft-label">На согласовании</span></article></section>
    <section class="detail-booking"><div class="shell detail-booking__grid"><div><span class="eyebrow">Мед-ЭКСПРЕСС · Аргаяш</span><h2>Запишитесь<br>к специалисту</h2><p>с. Аргаяш, ул. Ленина, 50</p></div><div class="detail-booking__actions"><a class="btn" href="${booking}" target="_blank" rel="noopener">Записаться к врачу <span aria-hidden="true">→</span></a><a class="detail-phone" href="tel:+79617958759">+7 (961) 795-87-59</a><span>${escape(doctor.schedule)}</span></div></div></section>`;
})();
