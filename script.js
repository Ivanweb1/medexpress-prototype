const headerMount = document.querySelector('[data-site-header]');
const footerMount = document.querySelector('[data-site-footer]');
const pageDepth = document.body.dataset.depth === '1' ? '../' : '';
const recordUrl = 'https://m.vk.ru/app53642491_-203789798?ref=group_menu';

if (headerMount) {
  headerMount.outerHTML = `<header class="header" id="top"><div class="top-line"><div class="container top-line__inner"><span>с Аргаяш ул Ленина 50</span><span>Ежедневно 8:00–16:00 · Вс 9:00–13:00</span></div></div><div class="container header__inner"><a class="logo" href="${pageDepth}index.html"><strong>Мед-ЭКСПРЕСС</strong><span>Медицинский центр</span></a><button class="menu-button" type="button" aria-expanded="false">Меню</button><nav class="navigation" aria-label="Основная навигация"><a href="${pageDepth}services.html">Услуги</a><a href="${pageDepth}doctors.html">Врачи</a><a href="${pageDepth}about.html">О клинике</a><a href="${pageDepth}index.html#prices">Цены</a><a href="${pageDepth}contacts.html">Контакты</a></nav><a class="header-phone" href="tel:+79617958759">+7 (961) 795-87-59</a><a class="button button--dark" href="${recordUrl}" target="_blank" rel="noopener">Записаться</a></div></header>`;
}

if (footerMount) {
  footerMount.outerHTML = `<footer class="footer"><div class="container footer__main"><div class="footer__brand"><a class="logo logo--footer" href="${pageDepth}index.html"><strong>Мед-ЭКСПРЕСС</strong><span>Медицинский центр</span></a><p>Медицинская помощь для жителей Аргаяшского района</p></div><nav class="footer__column"><strong>Разделы сайта</strong><a href="${pageDepth}services.html">Услуги</a><a href="${pageDepth}doctors.html">Врачи</a><a href="${pageDepth}about.html">О клинике</a><a href="${pageDepth}contacts.html">Контакты</a></nav><nav class="footer__column"><strong>Пациентам</strong><a href="${pageDepth}documents.html">Все документы</a><a href="${pageDepth}documents/document.html?name=Прейскурант">Прейскурант</a><a href="${pageDepth}documents/document.html?name=Лицензия">Лицензия</a><a href="${pageDepth}documents/document.html?name=Правила%20платных%20медицинских%20услуг">Правила платных услуг</a></nav><div class="footer__column footer__contacts"><strong>Контакты</strong><a href="tel:+79617958759">+7 (961) 795-87-59</a><span>с Аргаяш ул Ленина д 50</span><span>Ежедневно 8:00–16:00</span><a class="button" href="${recordUrl}" target="_blank" rel="noopener">Записаться</a></div></div><div class="container footer__bottom"><span>Мед-ЭКСПРЕСС</span><a href="${pageDepth}documents/document.html?name=Политика%20конфиденциальности">Политика конфиденциальности</a><a href="${pageDepth}documents/document.html?name=Согласие%20на%20обработку%20персональных%20данных">Согласие на обработку персональных данных</a><span>Информация на сайте не является публичной офертой</span></div></footer>`;
}

if ((headerMount || footerMount) && !document.querySelector('.floating-record')) {
  document.body.insertAdjacentHTML('beforeend', `<a class="floating-record" href="${recordUrl}" target="_blank" rel="noopener">Записаться</a>`);
}

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

