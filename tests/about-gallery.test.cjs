const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '..', 'about.js'), 'utf8');

function setup({ count = 6, columns = 2, reduced = false } = {}) {
  const listeners = new Map();
  const element = (props = {}) => ({
    ...props,
    addEventListener(name, callback) { listeners.set(this.id + ':' + name, callback); },
  });
  const track = element({ id: 'track', scrollLeft: 0, clientWidth: columns * 320 - 20, scrollWidth: count * 320 - 20 });
  track.scrollTo = (options) => {
    track.scrollLeft = options.left;
    track.behavior = options.behavior;
    listeners.get('track:scroll')?.();
  };
  const previous = element({ id: 'previous' });
  const next = element({ id: 'next' });
  const counter = { textContent: '' };
  const controls = { hidden: true };
  const slides = Array.from({ length: count }, () => ({ getBoundingClientRect: () => ({ width: 300 }) }));
  const mapping = { '[data-gallery-track]': track, '[data-gallery-prev]': previous, '[data-gallery-next]': next, '[data-gallery-count]': counter, '[data-gallery-controls]': controls };
  const gallery = { querySelector: (selector) => mapping[selector], querySelectorAll: () => slides };
  const window = element({ id: 'window', matchMedia: () => ({ matches: reduced }), requestAnimationFrame: (callback) => callback() });
  vm.runInNewContext(source, { document: { querySelectorAll: () => [gallery] }, window, getComputedStyle: () => ({ gap: '20px' }) });
  const click = (name) => listeners.get(name + ':click')();
  const key = (name, target = track) => {
    let prevented = false;
    listeners.get('track:keydown')({ key: name, target, preventDefault() { prevented = true; } });
    return prevented;
  };
  return { track, previous, next, counter, controls, click, key, listeners };
}

test('desktop gallery shows two images and disables the initial previous arrow', () => {
  const state = setup();
  assert.equal(state.counter.textContent, '1–2 / 6');
  assert.equal(state.previous.disabled, true);
  assert.equal(state.next.disabled, false);
  assert.equal(state.controls.hidden, false);
});
test('arrows advance and stop at the last pair', () => {
  const state = setup();
  for (let i = 0; i < 8; i++) state.click('next');
  assert.equal(state.counter.textContent, '5–6 / 6');
  assert.equal(state.next.disabled, true);
  state.click('previous');
  assert.equal(state.counter.textContent, '4–5 / 6');
});
test('mobile equipment gallery has three single-image positions', () => {
  const state = setup({ count: 3, columns: 1 });
  assert.equal(state.counter.textContent, '1 / 3');
  state.click('next');
  assert.equal(state.counter.textContent, '2 / 3');
  state.click('next');
  assert.equal(state.counter.textContent, '3 / 3');
  assert.equal(state.next.disabled, true);
});
test('keyboard navigation and reduced motion', () => {
  const state = setup({ reduced: true });
  assert.equal(state.key('ArrowRight'), true);
  assert.equal(state.track.behavior, 'auto');
  state.key('End');
  assert.equal(state.next.disabled, true);
  state.key('Home');
  assert.equal(state.previous.disabled, true);
  assert.equal(state.key('ArrowRight', {}), false);
});
test('swipe scrolling updates the visible range', () => {
  const state = setup({ columns: 1 });
  state.track.scrollLeft = 960;
  state.listeners.get('track:scroll')();
  assert.equal(state.counter.textContent, '4 / 6');
});
test('resize updates the range without changing the photos', () => {
  const state = setup();
  state.track.clientWidth = 300;
  state.listeners.get('window:resize')();
  assert.equal(state.counter.textContent, '1 / 6');
});
test('all local about-page resources and page links exist', () => {
  const root = path.join(__dirname, '..');
  const html = fs.readFileSync(path.join(root, 'about.html'), 'utf8');
  for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    if (/^(https?:|tel:|mailto:|#)/.test(match[1])) continue;
    const file = match[1].split(/[?#]/)[0];
    assert.ok(fs.existsSync(path.join(root, file)), file);
  }
  assert.equal((html.match(/data-gallery-slide/g) || []).length, 9);
  assert.equal((html.match(/class="clinic-direction__icon"/g) || []).length, 6);
  for (const heading of html.matchAll(/<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/g)) {
    assert.ok(!heading[1].includes('.'), 'Heading should not contain a full stop');
  }
});

test('intro gallery uses the three supplied photos and advances every three seconds', () => {
  const root = path.join(__dirname, '..');
  const html = fs.readFileSync(path.join(root, 'about.html'), 'utf8');
  const css = fs.readFileSync(path.join(root, 'about-design.css'), 'utf8');
  assert.equal((html.match(/data-intro-slide/g) || []).length, 3);
  assert.equal((html.match(/data-intro-dots/g) || []).length, 1);
  for (const image of ['about-intro-1.jpg', 'about-intro-2.jpg', 'about-intro-3.jpg']) assert.match(html, new RegExp(image));
  assert.doesNotMatch(html.match(/<figure class="clinic-intro__photo"[\s\S]*?<\/figure>/)?.[0] || '', /about-team-new\.png/);
  assert.match(source, /setInterval\(\(\) => show\(active \+ 1\), 3000\)/);
  assert.match(source, /prefers-reduced-motion: reduce/);
  assert.match(css, /\.clinic-intro__photo img\.is-active\{opacity:1/);
});
