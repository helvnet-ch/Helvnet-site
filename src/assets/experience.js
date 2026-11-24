import { sculpturePoses, settleAxis, stagePose } from './scene-motion.js';
import { createEnergyOrb, sculptureTone } from './energy-orb.js';

const experience = document.querySelector('[data-experience]');
const screens = [...experience.querySelectorAll('[data-screen]')];
const routes = new Map(screens.map((screen) => [screen.dataset.route, screen]));
const choices = [...experience.querySelectorAll('[data-choice]')];
const captions = [...experience.querySelectorAll('[data-caption]')];
const worlds = choices.map((choice) => choice.dataset.choice);
const quotes = [...document.querySelectorAll('[data-active-quote]')];
const menu = document.querySelector('.site-menu');
const surface = experience.querySelector('[data-swipe-surface]');
const orbCanvas = experience.querySelector('[data-energy-orb]');
const orbFallback = experience.querySelector('[data-energy-fallback]');
const fallbackSculptures = [...orbFallback.children];
const orb = createEnergyOrb(orbCanvas);
const status = experience.querySelector('[data-selection-status]');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const canonical = document.querySelector('link[rel="canonical"]');
const siteOrigin = new URL(canonical.href).origin;
const pageDescription = document.querySelector('meta[name="description"]');
const socialTitle = document.querySelector('meta[property="og:title"]');
const socialDescription = document.querySelector('meta[property="og:description"]');
const socialUrl = document.querySelector('meta[property="og:url"]');
let galleryTitle = document.getElementById('gallery-title');

const wrap = (value) => (value % worlds.length + worlds.length) % worlds.length;
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const relative = (from, to) => wrap(to - from + worlds.length / 2) - worlds.length / 2;
const currentAddress = () => new URL(location.href);
const pagePath = ({ pathname }) => pathname.endsWith('/') ? pathname : `${pathname}/`;
const responses = { position: 11.3, x: 8.8, y: 8.8, radius: 8.5, orbit: 9.3, visibility: 9.8 };
const axes = Object.keys(responses);
const zeroSpeed = Object.fromEntries(axes.map((axis) => [axis, 0]));
const sceneTime = 990;
const orbitTime = 1060;

let current;
let selected = -1;
let drag;
let orbFrame = 0;
let orbLastDraw = 0;
let orbTime = 0;
let motion;
let screenMotion = [];
let viewport = { width: 1, height: 1, mobile: false };
let toneControl;
let pointer = [0, 0];
let shape = { tone: '', lines: 28, opening: 22 };
let appearance = { position: 0, ...stagePose('gallery', viewport) };
let goal = { ...appearance };
const speeds = { ...zeroSpeed };

function reflectSelection(index, remember) {
  const world = worlds[index];
  if (remember && current?.dataset.kind === 'gallery' && history.state?.helvnetWorld !== world) {
    history.replaceState({ ...history.state, helvnetWorld: world }, '');
  }
  if (selected === index) return;
  selected = index;
  experience.dataset.world = world;
  reflectTone();
  for (const [i, choice] of choices.entries()) {
    choice.toggleAttribute('data-active', i === index);
    choice.setAttribute('aria-pressed', String(i === index));
    captions[i].hidden = false;
    captions[i].inert = i !== index;
    captions[i].setAttribute('aria-hidden', String(i !== index));
  }
  for (const quote of quotes) quote.href = `/contact/?axe=${world}`;
  if (current?.dataset.kind === 'gallery') {
    status.textContent = choices[index].textContent.trim();
  }
}

function reflectTone() {
  if (toneControl) toneControl.value = shape.tone || sculptureTone(selected);
}

function paintFallback(state) {
  for (const piece of sculpturePoses(state, viewport.width, worlds.length)) {
    const node = fallbackSculptures[piece.index];
    node.style.left = `${piece.x}px`;
    node.style.top = `${piece.y}px`;
    node.style.inlineSize = `${2 * piece.size}px`;
    node.style.opacity = piece.opacity;
    node.style.zIndex = Math.round(piece.front * 100);
  }
}

function orbVisible() {
  return orb && current && !document.hidden;
}

function updateOrb(redraw = false) {
  if (redraw) orbLastDraw = 0;
  if (orbVisible()) {
    orbFrame ||= requestAnimationFrame(drawOrb);
  } else {
    cancelAnimationFrame(orbFrame);
    orbFrame = orbLastDraw = 0;
  }
}

function drawOrb(now) {
  orbFrame = 0;
  if (!orbVisible()) return;
  const animate = !reducedMotion.matches;
  if (!orbLastDraw || !animate || motion || drag?.kind || now - orbLastDraw >= 30) {
    const elapsed = animate && orbLastDraw ? clamp(now - orbLastDraw, 0, 65) / 1000 : 0;
    orbTime += elapsed;
    let state = appearance;
    let velocity = speeds;
    if (motion) {
      const travel = motionElapsed(motion, now);
      ({ state, velocity } = sample(motion, travel));
      if (travel >= motion.duration) {
        appearance = state;
        Object.assign(speeds, zeroSpeed);
        motion = undefined;
      }
    }
    orb.draw(state, shape, {
      pointer: animate ? pointer : [0, 0], time: orbTime, elapsed,
      velocity: animate ? velocity : zeroSpeed, active: selected, animated: animate,
    });
    orbLastDraw = now;
    if (orbCanvas.hidden) {
      orbCanvas.hidden = false;
      orbFallback.hidden = true;
    }
  }
  if (animate && (motion || appearance.visibility > .24)) orbFrame = requestAnimationFrame(drawOrb);
}

function sample({ from, speed, to, duration, galleryTurn }, elapsed) {
  if (elapsed >= duration) return { state: { ...to }, velocity: zeroSpeed };
  const state = {};
  const velocity = {};
  for (const axis of axes) {
    const response = galleryTurn && axis === 'position' ? 7.9 : responses[axis];
    [state[axis], velocity[axis]] = settleAxis(from[axis], speed[axis], to[axis], response, elapsed / 1000);
  }
  return { state, velocity };
}

function motionElapsed(scene, now = performance.now()) {
  return clamp((scene.pausedAt ?? now) - scene.started, 0, scene.duration);
}

function freezeMotion() {
  if (!motion) return;
  const { state, velocity } = sample(motion, motionElapsed(motion));
  appearance = state;
  Object.assign(speeds, velocity);
  motion = undefined;
}

function moveArt(next, immediate = false, approach = false) {
  freezeMotion();
  goal = { ...goal, ...next };
  const stationary = axes.every((axis) => appearance[axis] === goal[axis] && speeds[axis] === 0);
  if (reducedMotion.matches || immediate || stationary || !orb) {
    appearance = { ...goal };
    for (const axis of axes) speeds[axis] = 0;
    if (!orb) paintFallback(goal);
    updateOrb(true);
    return;
  }

  if (approach) speeds.radius += Math.min(appearance.radius * 5.7, 1050);
  const galleryTurn = appearance.orbit === 1 && goal.orbit === 1;
  const duration = galleryTurn ? orbitTime : sceneTime;
  const started = performance.now();
  motion = { from: appearance, speed: { ...speeds }, to: goal, started, duration, galleryTurn };
  if (document.hidden) motion.pausedAt = started;
  updateOrb();
}

function readRoute(path, hash) {
  if (path === '/' && hash === '#essayer') return screens.find((screen) => screen.dataset.screen === `${worlds[Math.max(selected, 0)]}-demo`);
  return routes.get(path + hash) ?? routes.get(path);
}

function updatePageMetadata(path) {
  const { pageTitle, pageDescription: description } = routes.get(path).dataset;
  document.title = pageTitle;
  pageDescription.content = description;
  socialTitle.content = pageTitle;
  socialDescription.content = description;
  canonical.href = siteOrigin + path;
  socialUrl.content = canonical.href;

  const headingTag = path === '/' ? 'h1' : 'p';
  if (galleryTitle.localName !== headingTag) {
    const replacement = document.createElement(headingTag);
    replacement.id = galleryTitle.id;
    replacement.className = galleryTitle.className;
    replacement.textContent = galleryTitle.textContent;
    if (headingTag === 'h1') replacement.tabIndex = -1;
    galleryTitle.replaceWith(replacement);
    galleryTitle = replacement;
  }
}

function focusScreen(screen) {
  const heading = screen.dataset.kind === 'gallery' ? galleryTitle : screen.querySelector('h1, h2');
  if (!heading) return;
  heading.tabIndex = -1;
  heading.focus({ preventScroll: true });
}

function changeScreen(screen, { direction = 1, focus = true } = {}) {
  if (screen === current) return;
  const previous = current;
  current = screen;
  for (const animation of screenMotion) animation.cancel();
  screenMotion = [];
  for (const panel of screens) {
    panel.hidden = panel !== screen && panel !== previous;
    panel.inert = panel !== screen;
  }
  screen.scrollTop = 0;
  if (focus) focusScreen(screen);

  if (previous && !reducedMotion.matches) {
    const slide = direction * 19;
    const enteringService = previous.dataset.kind === 'gallery' && screen.dataset.kind === 'service';
    const leaving = previous.animate([{ opacity: 1, transform: 'translateX(0)' }, { opacity: 0, transform: `translateX(${-slide}px)` }], {
      duration: 215, easing: 'ease-out', fill: 'forwards',
    });
    screenMotion = [leaving, screen.animate([{ opacity: 0, transform: `translateX(${slide}px)` }, { opacity: 1, transform: 'translateX(0)' }], {
      duration: 440, delay: enteringService ? 85 : 30, easing: 'cubic-bezier(.22,.71,.27,1)', fill: 'backwards',
    })];
    leaving.finished.then(() => {
      if (previous !== current) previous.hidden = true;
    }).catch(() => {});
  } else if (previous) {
    previous.hidden = true;
  }
}

function open(url, { push = true, focus = true, direction = 1, immediate = false } = {}) {
  const path = pagePath(url);
  const screen = readRoute(path, url.hash);
  if (!screen) return false;
  const kind = screen.dataset.kind;
  const approach = current?.dataset.kind === 'gallery' && kind === 'service';
  const linkWorld = kind === 'quote' ? url.searchParams.get('axe') : screen.dataset.world;
  const restored = !push ? history.state?.helvnetWorld : null;
  const index = [linkWorld, restored, worlds[selected], 'web'].map((item) => worlds.indexOf(item)).find((item) => item !== -1);
  const address = url.pathname + url.search + url.hash;
  if (push && address !== location.pathname + location.search + location.hash) {
    history.pushState({ helvnetWorld: worlds[index] }, '', address);
  }
  if (kind === 'demo') import('./examples.js').catch(console.error);
  if (kind === 'quote') {
    import('./site.js').catch(console.error);
    window.dispatchEvent(new Event('helvnet:quote'));
  }

  updatePageMetadata(path);
  experience.dataset.current = screen.dataset.screen;
  experience.dataset.mode = kind;
  reflectSelection(index, false);
  for (const link of menu.querySelectorAll('[data-menu-link]')) {
    const active = link.dataset.menuLink === (screen.dataset.world ?? kind);
    if (active) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  }
  changeScreen(screen, { direction, focus });

  moveArt({
    position: goal.position + relative(goal.position, index),
    ...roomPose(kind),
  }, immediate, approach);
  return true;
}

function choose(index) {
  if (current.dataset.kind !== 'gallery') return;
  turnTo(goal.position + relative(goal.position, index));
}

function turnTo(position) {
  const previous = selected;
  const direction = Math.sign(position - goal.position);
  reflectSelection(wrap(Math.round(position)), true);
  if (previous !== selected && !reducedMotion.matches) {
    const caption = captions[selected];
    caption.getAnimations().forEach((animation) => animation.cancel());
    caption.animate([{ opacity: .42, transform: `translateX(${direction * 12}px) translateY(4px)` }, { opacity: 1, transform: 'translate(0, 0)' }], {
      duration: 410, easing: 'cubic-bezier(.25,.71,.24,1)',
    });
  }
  moveArt({ position });
}

function stepScreen(direction) {
  const kind = current.dataset.kind;
  if (kind === 'gallery') {
    if (direction > 0) open(new URL(choices[selected].href), { direction });
    return;
  }
  if (!current.dataset.servicePath) return;
  const path = current.dataset.servicePath;
  const stages = screens.filter((screen) => screen.dataset.servicePath === path);
  const index = stages.indexOf(current) + direction;
  if (stages[index]) open(new URL(stages[index].dataset.route, location.origin), { direction });
  else if (index < 0) open(new URL('/', location.origin), { direction });
}

document.addEventListener('click', (event) => {
  const link = event.target.closest('a[href]');
  if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const url = new URL(link.href);
  if (url.origin !== location.origin || link.target || link.hasAttribute('download')) return;
  if (link.dataset.choice) {
    event.preventDefault();
    choose(worlds.indexOf(link.dataset.choice));
    return;
  }
  if (url.hash === '#contenu') return;
  const screen = readRoute(pagePath(url), url.hash);
  if (!screen) return;
  event.preventDefault();
  const order = ['gallery', 'service', 'demo', 'capabilities', 'atelier', 'quote'];
  const direction = order.indexOf(screen.dataset.kind) < order.indexOf(current.dataset.kind) ? -1 : 1;
  open(url, { direction });
});

for (const choice of choices) {
  choice.setAttribute('role', 'button');
  choice.addEventListener('keydown', (event) => {
    if (event.key !== ' ') return;
    event.preventDefault();
    choose(worlds.indexOf(choice.dataset.choice));
  });
}

for (const button of experience.querySelectorAll('[data-step]')) {
  button.hidden = false;
  button.addEventListener('click', () => turnTo(Math.round(goal.position) + Number(button.dataset.step)));
}

window.addEventListener('popstate', () => open(currentAddress(), { push: false, direction: -1 }));

function canScroll(screen, delta) {
  if (screen.scrollHeight <= screen.clientHeight + 2) return false;
  return delta < 0 ? screen.scrollTop > 1 : screen.scrollTop + screen.clientHeight < screen.scrollHeight - 2;
}

const consumesKeys = (element) => element.closest('input, textarea, select, [contenteditable], .site-menu');
document.addEventListener('keydown', (event) => {
  if (event.defaultPrevented || event.ctrlKey || event.altKey || event.metaKey || consumesKeys(event.target)) return;
  const kind = current.dataset.kind;
  if (kind === 'gallery' && ['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
    event.preventDefault();
    if (event.key === 'Home' || event.key === 'End') choose(event.key === 'Home' ? 0 : worlds.length - 1);
    else turnTo(Math.round(goal.position) + (event.key === 'ArrowRight' ? 1 : -1));
    return;
  }
  if (event.key === 'Escape' && kind !== 'gallery') {
    open(new URL('/', location.origin), { direction: -1 });
    return;
  }
  if (kind === 'quote' || kind === 'atelier' || !['PageDown', 'PageUp'].includes(event.key)) return;
  const direction = event.key === 'PageDown' ? 1 : -1;
  if (canScroll(current, direction)) return;
  event.preventDefault();
  stepScreen(direction);
});

let wheelTime = 0;
let wheelDistance = 0;
let wheelAxis;
let wheelTriggered = false;
experience.addEventListener('wheel', (event) => {
  if (event.ctrlKey || event.target.closest('form, input, textarea, select') || menu.open) return;
  const kind = current.dataset.kind;
  if (kind === 'quote' || kind === 'atelier') return;
  const horizontal = kind === 'gallery' && (Math.abs(event.deltaX) > Math.abs(event.deltaY) || event.shiftKey);
  const delta = horizontal ? (event.deltaX || event.deltaY) : event.deltaY;
  if (!delta || (!horizontal && canScroll(current, delta))) return;
  if (event.cancelable) event.preventDefault();
  const now = performance.now();
  if (now - wheelTime > 190 || wheelAxis !== horizontal) {
    wheelDistance = 0;
    wheelTriggered = false;
  }
  wheelTime = now;
  wheelAxis = horizontal;
  if (wheelTriggered) return;
  wheelDistance += delta * (event.deltaMode === 1 ? 17 : 1);
  if (Math.abs(wheelDistance) < 38) return;
  wheelTriggered = true;
  const direction = Math.sign(wheelDistance);
  if (horizontal) turnTo(Math.round(goal.position) + direction);
  else stepScreen(direction);
}, { passive: false });

surface.addEventListener('pointerdown', (event) => {
  if (!event.isPrimary || event.button !== 0 || event.target.closest('button')) return;
  drag = {
    id: event.pointerId, x: event.clientX, y: event.clientY,
    position: appearance.position, sampleTime: event.timeStamp, kind: null,
  };
  surface.setPointerCapture(event.pointerId);
});

surface.addEventListener('pointermove', (event) => {
  if (drag?.id !== event.pointerId) {
    if (event.pointerType === 'mouse' && !reducedMotion.matches) {
      pointer = [(event.clientX / viewport.width - .5) * 1.2, (.5 - event.clientY / viewport.height) * 1.2];
    }
    return;
  }
  const dx = event.clientX - drag.x;
  const dy = event.clientY - drag.y;
  if (!drag.kind && Math.max(Math.abs(dx), Math.abs(dy)) > 9) {
    drag.kind = Math.abs(dx) >= Math.abs(dy) ? 'horizontal' : 'vertical';
    surface.dataset.dragging = '';
    freezeMotion();
    drag.position = appearance.position;
    speeds.position = 0;
    updateOrb();
  }
  if (drag.kind === 'horizontal' && !reducedMotion.matches) {
    const next = drag.position - dx / clamp(viewport.width * .28, 115, 335);
    const seconds = Math.max(.016, (event.timeStamp - drag.sampleTime) / 1000);
    const newSpeed = clamp((next - appearance.position) / seconds, -5.5, 5.5);
    speeds.position = speeds.position * .45 + newSpeed * .55;
    appearance.position = next;
    drag.sampleTime = event.timeStamp;
    reflectSelection(wrap(Math.round(appearance.position)), false);
    if (!orb) paintFallback(appearance);
  }
});

function finishDrag(event) {
  if (event.pointerId !== drag?.id) return;
  const gesture = drag;
  drag = undefined;
  delete surface.dataset.dragging;
  if (!gesture.kind) {
    if (event.type !== 'pointerup') return;
    const rect = experience.getBoundingClientRect();
    const state = motion ? sample(motion, motionElapsed(motion)).state : appearance;
    const piece = sculpturePoses(state, viewport.width, worlds.length).findLast(({ x, y, size }) => (
      Math.hypot(event.clientX - rect.left - x, event.clientY - rect.top - y) < size * .92
    ));
    if (piece && piece.index !== selected) choose(piece.index);
    return;
  }
  if (event.type === 'pointercancel' || event.timeStamp - gesture.sampleTime > 80) speeds.position = 0;
  if (event.type !== 'pointercancel') {
    if (gesture.kind === 'horizontal') {
      const delta = gesture.x - event.clientX;
      if (Math.abs(delta) > 33) {
        const step = Math.max(1, Math.round(Math.abs(delta) / clamp(viewport.width * .28, 115, 335)));
        turnTo(Math.round(gesture.position) + step * Math.sign(delta));
        return;
      }
    }
    if (gesture.kind === 'vertical' && gesture.y - event.clientY > 45) {
      stepScreen(1);
      return;
    }
  }
  turnTo(Math.round(appearance.position));
}
surface.addEventListener('pointerup', finishDrag);
surface.addEventListener('pointercancel', finishDrag);
surface.addEventListener('pointerleave', () => { pointer = [0, 0]; });

function loadObjectSettings() {
  try {
    const stored = JSON.parse(sessionStorage.getItem('helvnet.ribbon.v1'));
    if (stored && /^$|^#[a-f\d]{6}$/i.test(stored.tone) && Number.isFinite(stored.lines) && Number.isFinite(stored.opening)) {
      shape = { tone: stored.tone, lines: clamp(stored.lines, 12, 42), opening: clamp(stored.opening, 0, 100) };
    }
  } catch { /* The object remains adjustable without browser storage. */ }
}

function connectObjectSettings() {
  const controls = menu.querySelector('[data-object-settings]');
  toneControl = controls.querySelector('[data-shade]');
  const lines = controls.querySelector('#shape-lines');
  const opening = controls.querySelector('#shape-opening');
  function update() {
    reflectTone();
    lines.value = shape.lines;
    opening.value = shape.opening;
    controls.querySelector('output[for="shape-lines"]').value = lines.value;
    controls.querySelector('output[for="shape-opening"]').value = `${opening.value} %`;
    try { sessionStorage.setItem('helvnet.ribbon.v1', JSON.stringify(shape)); } catch { /* Keep current values. */ }
    updateOrb(true);
  }
  toneControl.addEventListener('input', () => { shape.tone = toneControl.value; update(); });
  lines.addEventListener('input', () => { shape.lines = lines.valueAsNumber; update(); });
  opening.addEventListener('input', () => { shape.opening = opening.valueAsNumber; update(); });
  controls.querySelector('[data-reset-shade]').addEventListener('click', () => { shape.tone = ''; update(); });
  controls.hidden = false;
  update();
}

function roomPose(kind) {
  const gallery = kind === 'gallery' ? { top: surface.offsetTop, height: surface.clientHeight } : undefined;
  return stagePose(kind, viewport, gallery);
}

function measure() {
  const width = experience.clientWidth;
  const height = experience.clientHeight;
  if (width !== viewport.width || height !== viewport.height) {
    viewport = { width, height, mobile: width <= 688 };
    orb?.resize();
  }
  if (!current) return;
  const next = roomPose(current.dataset.kind);
  if (Object.entries(next).some(([axis, value]) => goal[axis] !== value)) moveArt(next, !motion);
}

loadObjectSettings();
document.documentElement.dataset.stageReady = '';
history.scrollRestoration = 'manual';
window.scrollTo(0, 0);
experience.querySelector('[data-gesture-help]').hidden = false;
measure();
open(currentAddress(), { push: false, focus: false, immediate: true });
if (orb) connectObjectSettings();
if ('ResizeObserver' in window) {
  const resize = new ResizeObserver(measure);
  resize.observe(experience);
  resize.observe(surface);
}
window.addEventListener('resize', measure);
reducedMotion.addEventListener('change', () => {
  moveArt(goal, true);
});
document.addEventListener('visibilitychange', () => {
  if (motion) {
    const now = performance.now();
    if (document.hidden) motion.pausedAt ??= now;
    else if (motion.pausedAt !== undefined) {
      motion.started += now - motion.pausedAt;
      delete motion.pausedAt;
    }
  }
  updateOrb();
});
