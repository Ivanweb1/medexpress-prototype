// Native scrolling also keeps the photographs accessible without JavaScript.
document.querySelectorAll('[data-clinic-gallery]').forEach((gallery) => {
  const track = gallery.querySelector('[data-gallery-track]');
  const slides = [...gallery.querySelectorAll('[data-gallery-slide]')];
  const previous = gallery.querySelector('[data-gallery-prev]');
  const next = gallery.querySelector('[data-gallery-next]');
  const counter = gallery.querySelector('[data-gallery-count]');
  const controls = gallery.querySelector('[data-gallery-controls]');
  if (!track || !slides.length || !previous || !next || !counter || !controls) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const limit = () => Math.max(0, track.scrollWidth - track.clientWidth);
  const metrics = () => {
    const gap = Number.parseFloat(getComputedStyle(track).gap) || 0;
    let cursor = 0;
    return slides.map((slide) => {
      const width = slide.getBoundingClientRect().width;
      const metric = { left: cursor, right: cursor + width };
      cursor += width + gap;
      return metric;
    });
  };
  const update = () => {
    const position = Math.max(0, Math.min(track.scrollLeft, limit()));
    const slideMetrics = metrics();
    const firstIndex = Math.max(0, slideMetrics.findIndex((metric) => metric.right > position + 2));
    let lastIndex = firstIndex;
    const viewportEnd = position + track.clientWidth - 2;
    while (lastIndex + 1 < slideMetrics.length && slideMetrics[lastIndex + 1].left < viewportEnd) lastIndex += 1;
    const first = firstIndex + 1;
    const last = lastIndex + 1;
    const label = (last > first ? first + '–' + last : first) + ' / ' + slides.length;
    previous.disabled = position <= 2;
    next.disabled = position >= limit() - 2;
    if (counter.textContent !== label) counter.textContent = label;
  };
  const move = (direction) => {
    const position = Math.max(0, Math.min(track.scrollLeft, limit()));
    const slideMetrics = metrics();
    const targetIndex = direction > 0
      ? slideMetrics.findIndex((metric) => metric.left > position + 2)
      : slideMetrics.reduce((result, metric, index) => metric.left < position - 2 ? index : result, 0);
    const target = targetIndex < 0 ? limit() : slideMetrics[targetIndex].left;
    track.scrollTo({
      left: Math.max(0, Math.min(limit(), target)),
      behavior: reducedMotion.matches ? 'auto' : 'smooth',
    });
  };
  previous.addEventListener('click', () => move(-1));
  next.addEventListener('click', () => move(1));
  track.addEventListener('keydown', (event) => {
    if (event.target !== track) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      move(event.key === 'ArrowLeft' ? -1 : 1);
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      track.scrollTo({ left: event.key === 'Home' ? 0 : limit(), behavior: 'auto' });
    }
  });
  let scheduled = false;
  const scheduleUpdate = () => {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(() => { scheduled = false; update(); });
  };
  track.addEventListener('scroll', scheduleUpdate, { passive: true });
  window.addEventListener('resize', scheduleUpdate);
  if ('ResizeObserver' in window) new ResizeObserver(scheduleUpdate).observe(track);
  controls.hidden = false;
  update();
});

document.querySelectorAll('[data-intro-gallery]').forEach((gallery) => {
  const slides = [...gallery.querySelectorAll('[data-intro-slide]')];
  const dots = [...gallery.querySelectorAll('[data-intro-dots] button')];
  if (slides.length < 2 || dots.length !== slides.length || !gallery.addEventListener) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let active = 0;
  let timer;
  const show = (index) => {
    active = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => slide.classList.toggle('is-active', slideIndex === active));
    dots.forEach((dot, dotIndex) => {
      const selected = dotIndex === active;
      dot.classList.toggle('is-active', selected);
      dot.setAttribute('aria-current', String(selected));
    });
  };
  const stop = () => window.clearInterval(timer);
  const start = () => {
    stop();
    if (!reducedMotion) timer = window.setInterval(() => show(active + 1), 3000);
  };

  dots.forEach((dot, index) => dot.addEventListener('click', () => {
    show(index);
    start();
  }));
  gallery.addEventListener('mouseenter', stop);
  gallery.addEventListener('mouseleave', start);
  gallery.addEventListener('focusin', stop);
  gallery.addEventListener('focusout', start);
  show(0);
  start();
});
