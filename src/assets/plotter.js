const plotter = document.querySelector('[data-plotter]');
const svg = plotter.querySelector('[data-plotter-scene]');
const controls = plotter.querySelector('[data-plotter-controls]');
const slider = controls.querySelector('input[type=range]');
const toggle = controls.querySelector('button');
const index = controls.querySelector('output');
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
const links = [...plotter.querySelectorAll('.service-index a')];
const { sole, rise, trail } = JSON.parse(plotter.querySelector('[data-terrain]').textContent);
const pen = svg.querySelector('[data-plotter-pen]');
const rod = svg.querySelector('[data-plotter-rod]');
const penShadow = svg.querySelector('[data-pen-shadow]');
const reliefShadow = svg.querySelector('[data-relief-shadow]');
const drawnTrail = svg.querySelector('[data-ink-trail]');
const [tipX, tipY] = trail.at(-1);
const slices = [...svg.querySelectorAll('[data-slice]')].map((layer) => ({
  layer,
  level: Number(layer.dataset.slice),
  face: layer.querySelector('[data-slice-face]'),
  edge: layer.querySelector('[data-slice-edge]'),
  shadow: layer.querySelector('[data-slice-shadow]'),
}));

let frame = 0;
let displayed = 0;
let destination = 0;
let visible = true;

const round = (n) => Math.round(n * 10) / 10;
const elevation = (level, lift) => Math.max(0, level - sole) * rise * lift;
const translate = (element, x, y) => element.setAttribute('transform', `translate(${round(x)} ${round(y)})`);

function paint(value) {
  displayed = value;
  const lift = Math.max(0, (value - 0.1) / 0.9);
  const penLift = Math.min(1, value * 10) * 34;
  translate(pen, 0, tipY - penLift);
  rod.setAttribute('height', round(tipY - 218 - penLift));
  penShadow.setAttribute('cx', round(tipX + 10 + penLift * 0.5));
  penShadow.setAttribute('cy', round(tipY + 5 + penLift * 0.23));
  penShadow.setAttribute('rx', round(11 + penLift * 0.19));
  translate(reliefShadow, lift * 61, lift * 40);
  reliefShadow.setAttribute('opacity', lift * 0.42);

  for (const { layer, level, face, edge, shadow } of slices) {
    translate(layer, 0, -elevation(level, lift));
    translate(edge, lift * 0.75, lift * 6.8);
    translate(shadow, lift * 4.8, lift * 7.5);
    face.setAttribute('fill-opacity', Math.min(1, lift * 2.4));
    edge.setAttribute('opacity', Math.min(0.95, lift * 2.6));
    shadow.setAttribute('opacity', lift * 0.29);
  }
  drawnTrail.setAttribute('d', `M${trail.map(([x, y, level]) => `${x} ${round(y - elevation(level, lift))}`).join(' ')}`);

  const percent = Math.round(value * 100);
  slider.value = percent;
  slider.setAttribute('aria-valuetext', percent === 0 ? 'À plat' : percent === 100 ? 'En relief' : `${percent} % de relief`);
  index.value = `${String(percent).padStart(2, '0')} %`;
  toggle.textContent = value === 1 ? 'Remettre à plat' : 'Soulever le dessin';
}

function savedValue() {
  try { return Math.max(0, Math.min(1, Number(sessionStorage.getItem('helvnet.relief')) || 0)); }
  catch { return 0; }
}

function save(value) {
  try { sessionStorage.setItem('helvnet.relief', String(value)); }
  catch { /* Le dessin reste manipulable dans la page. */ }
}

function setValue(value, animate = false) {
  cancelAnimationFrame(frame);
  frame = 0;
  destination = value;
  save(value);
  if (!animate || reduceMotion.matches || !visible || value === displayed) {
    paint(value);
    return;
  }
  const from = displayed;
  const start = performance.now();
  function step(now) {
    const time = Math.min(1, (now - start) / 630);
    const eased = time * time * (3 - 2 * time);
    paint(time === 1 ? value : from + (value - from) * eased);
    frame = time < 1 ? requestAnimationFrame(step) : 0;
  }
  frame = requestAnimationFrame(step);
}

function restore() {
  const value = savedValue();
  slider.step = reduceMotion.matches ? '100' : '1';
  setValue(reduceMotion.matches ? Math.round(value) : value);
}

slider.addEventListener('input', () => setValue(Number(slider.value) / 100));
toggle.addEventListener('click', () => setValue(destination === 1 ? 0 : 1, true));
reduceMotion.addEventListener('change', restore);

for (const link of links) {
  link.addEventListener('click', (event) => {
    if (reduceMotion.matches || !CSS.supports('view-transition-name', 'thread-web') || event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const matrix = svg.getScreenCTM();
    if (!matrix) return;
    const tip = new DOMPoint(tipX, tipY).matrixTransform(matrix);
    const line = link.querySelector('.thread-line');
    const bounds = line.getBoundingClientRect();
    line.style.transition = 'none';
    line.style.transform = `translate(${round(tip.x - bounds.left)}px, ${round(tip.y - bounds.top)}px)`;
  });
}

window.addEventListener('pageshow', (event) => {
  if (!event.persisted) return;
  for (const link of links) link.querySelector('.thread-line').removeAttribute('style');
  restore();
});

if ('IntersectionObserver' in window) {
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (!visible && frame) setValue(destination);
  }).observe(svg);
}

restore();
controls.hidden = false;
