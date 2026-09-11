const headerMount = document.querySelector('[data-site-header]');
const footerMount = document.querySelector('[data-site-footer]');
const pageDepth = document.body.dataset.depth === '1' ? '../' : '';
const recordUrl = 'https://m.vk.ru/app53642491_-203789798?ref=group_menu';
const currentPath = window.location.pathname.replace(/\\/g, '/');
const currentSection = currentPath.includes('/services/') ? 'services' : currentPath.includes('/doctors/') ? 'doctors' : currentPath.split('/').pop()?.replace('.html', '') || 'index';
const navItem = (file, label, section) => `<a href="${pageDepth}${file}"${currentSection === section ? ' aria-current="page"' : ''}>${label}</a>`;
const footerSectionLinks = `<strong>Разделы</strong><a href="${pageDepth}index.html">Главная</a><a href="${pageDepth}services.html">Услуги</a><a href="${pageDepth}doctors.html">Врачи</a><a href="${pageDepth}about.html">О клинике</a><a href="${pageDepth}prices.html">Цены</a><a href="${pageDepth}contacts.html">Контакты</a>`;
const footerPatientLinks = `<strong>Пациентам</strong><a href="${pageDepth}documents.html">Документы</a><a href="${pageDepth}prices.html">Прейскурант</a><a href="${pageDepth}documents/document.html?name=Лицензия">Лицензия</a><a href="${pageDepth}documents/document.html?name=Контролирующие%20органы">Контролирующие органы</a><a href="${pageDepth}documents/document.html?name=Политика%20конфиденциальности">Политика конфиденциальности</a>`;

if (headerMount) {
  headerMount.outerHTML = `<header class="site-header" id="top"><div class="header-note"><div class="shell"><span>с. Аргаяш, ул. Ленина, 50</span><span>Ежедневно 8:00–16:00 · вс 9:00–13:00</span></div></div><div class="shell header-main"><a class="brand" href="${pageDepth}index.html" aria-label="Мед-ЭКСПРЕСС, главная"><img src="${pageDepth}assets/medexpress-mark-blue.png" alt=""><span><strong>Мед-ЭКСПРЕСС</strong><small>медицинский центр</small></span></a><button class="menu-button" type="button" aria-expanded="false">Меню</button><nav class="navigation" aria-label="Основная навигация">${navItem('services.html', 'Услуги', 'services')}${navItem('doctors.html', 'Врачи', 'doctors')}${navItem('about.html', 'О клинике', 'about')}${navItem('prices.html', 'Цены', 'prices')}${navItem('contacts.html', 'Контакты', 'contacts')}</nav><div class="header-actions"><a class="phone" href="tel:+79617958759">+7 (961) 795-87-59</a><a class="btn btn--small" href="${recordUrl}" target="_blank" rel="noopener">Записаться</a></div></div></header>`;
}

if (footerMount) {
  footerMount.outerHTML = `<footer class="site-footer"><div class="shell footer-grid"><div><a class="brand brand--footer" href="${pageDepth}index.html"><img src="${pageDepth}assets/medexpress-mark-blue.png" alt=""><span><strong>Мед-ЭКСПРЕСС</strong><small>медицинский центр</small></span></a><p>Профессиональная медицинская помощь для жителей Аргаяшского района.</p></div><nav>${footerSectionLinks}</nav><nav>${footerPatientLinks}</nav><div><strong>Связаться</strong><a href="tel:+79617958759">+7 (961) 795-87-59</a><span>с. Аргаяш, ул. Ленина, 50</span><span>Ежедневно с 8:00</span></div></div><p class="shell footer-medical-warning">ИМЕЮТСЯ ПРОТИВОПОКАЗАНИЯ. НЕОБХОДИМА КОНСУЛЬТАЦИЯ СПЕЦИАЛИСТА</p><div class="shell footer-bottom"><span>© Мед-ЭКСПРЕСС</span><a href="${pageDepth}documents/document.html?name=Политика%20конфиденциальности">Политика конфиденциальности</a><span>Информация на сайте не является публичной офертой</span></div></footer>`;
}

const siteFooter = document.querySelector('.site-footer');
if (siteFooter) {
  const footerNavs = siteFooter.querySelectorAll('.footer-grid nav');
  if (footerNavs[0]) footerNavs[0].innerHTML = footerSectionLinks;
  if (footerNavs[1]) footerNavs[1].innerHTML = footerPatientLinks;
  if (!siteFooter.querySelector('.footer-medical-warning')) {
    const warning = document.createElement('p');
    warning.className = 'shell footer-medical-warning';
    warning.textContent = 'ИМЕЮТСЯ ПРОТИВОПОКАЗАНИЯ. НЕОБХОДИМА КОНСУЛЬТАЦИЯ СПЕЦИАЛИСТА';
    siteFooter.querySelector('.footer-bottom')?.before(warning);
  }
}

if ((headerMount || footerMount) && !document.querySelector('.floating-record')) {
  document.body.insertAdjacentHTML('beforeend', `<a class="floating-record" href="${recordUrl}" target="_blank" rel="noopener"><span>Записаться</span><b aria-hidden="true">→</b></a>`);
}

const preserveBrandNameCase = () => {
  const brandName = 'Мед-ЭКСПРЕСС';
  const alternateBrandName = 'Мед‑ЭКСПРЕСС';
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const textNodes = [];
  let node;

  while ((node = walker.nextNode())) {
    const parent = node.parentElement;
    if ((node.nodeValue.includes(brandName) || node.nodeValue.includes(alternateBrandName)) && parent && !parent.closest('script, style, textarea, .brand-name')) textNodes.push(node);
  }

  textNodes.forEach((textNode) => {
    const fragment = document.createDocumentFragment();
    const normalizedText = textNode.nodeValue.replaceAll(alternateBrandName, brandName);
    normalizedText.split(brandName).forEach((part, index) => {
      if (index) {
        const mark = document.createElement('span');
        mark.className = 'brand-name';
        mark.style.textTransform = 'none';
        mark.textContent = brandName;
        fragment.append(mark);
      }
      if (part) fragment.append(document.createTextNode(part));
    });
    textNode.replaceWith(fragment);
  });
};

preserveBrandNameCase();

const styleCitilabName = () => {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const textNodes = [];
  let node;

  while ((node = walker.nextNode())) {
    const parent = node.parentElement;
    if (/СИТИЛАБ|Ситилаб/u.test(node.nodeValue) && parent && !parent.closest('script, style, textarea, .citilab-wordmark')) textNodes.push(node);
  }

  textNodes.forEach((textNode) => {
    const fragment = document.createDocumentFragment();
    const parts = textNode.nodeValue.split(/(СИТИЛАБ|Ситилаб)/u);
    parts.forEach((part) => {
      if (/^(СИТИЛАБ|Ситилаб)$/u.test(part)) {
        const mark = document.createElement('span');
        mark.className = 'citilab-wordmark';
        mark.setAttribute('role', 'img');
        mark.setAttribute('aria-label', 'СИТИЛАБ');
        mark.innerHTML = '<span class="citilab-wordmark__city" aria-hidden="true">СИТИ</span><span class="citilab-wordmark__lab" aria-hidden="true">ЛАБ</span>';
        fragment.append(mark);
      } else if (part) {
        fragment.append(document.createTextNode(part));
      }
    });
    textNode.replaceWith(fragment);
  });
};

styleCitilabName();

const menuButton = document.querySelector('.menu-button');
const navigation = document.querySelector('.navigation');

menuButton?.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!open));
  menuButton.textContent = open ? 'Меню' : 'Закрыть';
  navigation.classList.toggle('is-open', !open);
});

navigation?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    menuButton?.setAttribute('aria-expanded', 'false');
    if (menuButton) menuButton.textContent = 'Меню';
    navigation.classList.remove('is-open');
  });
});

const heroGallery = document.querySelector('[data-hero-gallery]');

if (heroGallery) {
  const slides = [...heroGallery.querySelectorAll('[data-hero-slide]')];
  const dots = [...heroGallery.querySelectorAll('[data-hero-dots] button')];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let activeHeroSlide = 0;
  let heroGalleryTimer;

  const showHeroSlide = (index) => {
    activeHeroSlide = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => slide.classList.toggle('is-active', slideIndex === activeHeroSlide));
    dots.forEach((dot, dotIndex) => {
      const isActive = dotIndex === activeHeroSlide;
      dot.classList.toggle('is-active', isActive);
      dot.setAttribute('aria-current', isActive ? 'true' : 'false');
    });
  };

  const stopHeroGallery = () => window.clearInterval(heroGalleryTimer);
  const startHeroGallery = () => {
    stopHeroGallery();
    if (!reduceMotion) heroGalleryTimer = window.setInterval(() => showHeroSlide(activeHeroSlide + 1), 3000);
  };

  dots.forEach((dot, index) => dot.addEventListener('click', () => {
    showHeroSlide(index);
    startHeroGallery();
  }));
  heroGallery.addEventListener('mouseenter', stopHeroGallery);
  heroGallery.addEventListener('mouseleave', startHeroGallery);
  heroGallery.addEventListener('focusin', stopHeroGallery);
  heroGallery.addEventListener('focusout', startHeroGallery);
  startHeroGallery();
}

const equipmentGallery = document.querySelector('[data-equipment-gallery]');

if (equipmentGallery) {
  const slides = [...equipmentGallery.querySelectorAll('.diagnostic-slides img')];
  const dots = [...equipmentGallery.querySelectorAll('.diagnostic-dots button')];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let activeSlide = 0;
  let galleryTimer;

  const showSlide = (index) => {
    activeSlide = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => slide.classList.toggle('is-active', slideIndex === activeSlide));
    dots.forEach((dot, dotIndex) => {
      const isActive = dotIndex === activeSlide;
      dot.classList.toggle('is-active', isActive);
      dot.setAttribute('aria-current', isActive ? 'true' : 'false');
    });
  };

  const stopGallery = () => window.clearInterval(galleryTimer);
  const startGallery = () => {
    stopGallery();
    if (!reduceMotion) galleryTimer = window.setInterval(() => showSlide(activeSlide + 1), 3000);
  };

  dots.forEach((dot, index) => dot.addEventListener('click', () => {
    showSlide(index);
    startGallery();
  }));

  equipmentGallery.addEventListener('mouseenter', stopGallery);
  equipmentGallery.addEventListener('mouseleave', startGallery);
  equipmentGallery.addEventListener('focusin', stopGallery);
  equipmentGallery.addEventListener('focusout', startGallery);
  document.addEventListener('visibilitychange', () => document.hidden ? stopGallery() : startGallery());
  startGallery();
}

const doctorsSlider = document.querySelector('[data-doctors-slider]');

if (doctorsSlider) {
  const track = doctorsSlider.querySelector('[data-doctors-track]');
  const previousButton = doctorsSlider.querySelector('[data-doctors-prev]');
  const nextButton = doctorsSlider.querySelector('[data-doctors-next]');

  const updateDoctorControls = () => {
    const maxScroll = Math.max(0, track.scrollWidth - track.clientWidth);
    previousButton.disabled = track.scrollLeft <= 2;
    nextButton.disabled = track.scrollLeft >= maxScroll - 2;
  };

  const moveDoctors = (direction) => {
    const firstCard = track.querySelector('.doctor');
    if (!firstCard) return;
    const gap = Number.parseFloat(getComputedStyle(track).gap) || 0;
    track.scrollBy({ left: direction * (firstCard.getBoundingClientRect().width + gap), behavior: 'smooth' });
  };

  previousButton.addEventListener('click', () => moveDoctors(-1));
  nextButton.addEventListener('click', () => moveDoctors(1));
  track.addEventListener('scroll', updateDoctorControls, { passive: true });
  window.addEventListener('resize', updateDoctorControls);
  updateDoctorControls();
}

