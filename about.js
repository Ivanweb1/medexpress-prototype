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
  const stride = () => slides[0].getBoundingClientRect().width
    + (Number.parseFloat(getComputedStyle(track).gap) || 0);
  const update = () => {
    const position = Math.max(0, Math.min(track.scrollLeft, limit()));
    const step = stride();
    if (!step) return;
    const first = Math.min(slides.length, Math.round(position / step) + 1);
    const visible = Math.max(1, Math.round(track.clientWidth / step));
    const last = Math.min(slides.length, first + visible - 1);
    const label = (last > first ? first + '–' + last : first) + ' / ' + slides.length;
    previous.disabled = position <= 2;
    next.disabled = position >= limit() - 2;
    if (counter.textContent !== label) counter.textContent = label;
  };
  const move = (direction) => {
    track.scrollTo({
      left: Math.max(0, Math.min(limit(), track.scrollLeft + stride() * direction)),
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
