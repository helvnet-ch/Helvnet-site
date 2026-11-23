const turn = 2 * Math.PI;
const sampleCount = 96;
const waveSamples = Array.from({ length: sampleCount + 1 }, (_, index) => {
  const angle = index * turn / sampleCount;
  return [Math.cos(angle), Math.sin(angle), Math.cos(2 * angle), Math.sin(2 * angle),
    Math.cos(3 * angle), Math.sin(3 * angle), Math.cos(5 * angle), Math.sin(5 * angle)];
});

const palettes = [
  { glow: [255, 96, 81], body: [161, 37, 92], light: [255, 211, 175] },
  { glow: [64, 237, 206], body: [26, 95, 154], light: [189, 255, 231] },
  { glow: [172, 117, 255], body: [82, 46, 190], light: [243, 210, 255] },
];

const limit = (value, low, high) => Math.max(low, Math.min(high, value));
const mix = (a, b, weight) => a + (b - a) * weight;
const tint = (a, b, weight) => a.map((channel, index) => mix(channel, b[index], weight));
const wrap = (index) => (index % palettes.length + palettes.length) % palettes.length;
const color = (rgb, alpha) => `rgba(${rgb.map(Math.round).join(',')},${alpha})`;

function ease(edge0, edge1, value) {
  const t = limit((value - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

function paletteAt(position, tone) {
  const index = Math.floor(position);
  const from = palettes[wrap(index)];
  const to = palettes[wrap(index + 1)];
  const amount = ease(.26, .74, position - index);
  if (tone) {
    const glow = [1, 3, 5].map((offset) => parseInt(tone.slice(offset, offset + 2), 16));
    return { glow, body: tint(glow, [37, 13, 66], .55), light: tint(glow, [255, 244, 243], .69) };
  }
  return { glow: tint(from.glow, to.glow, amount), body: tint(from.body, to.body, amount), light: tint(from.light, to.light, amount) };
}

function placeOrb(width, height, { x, y, position, orbit }) {
  const phase = position * turn;
  const arc = Math.sin(phase * .5) ** 2;
  const weight = limit(orbit, 0, 1);
  return {
    x: x - Math.sin(phase) * Math.min(width * .333, 275) * weight,
    y: y - arc * Math.min(height * .145, 110) * weight,
    scale: 1 - .932 * ease(.027, .96, Math.sqrt(arc)) * weight,
  };
}

function drawAura(context, palette, spark) {
  const haze = context.createRadialGradient(-.12, -.14, .05, 0, 0, 1.49);
  haze.addColorStop(0, color(palette.glow, .36 + spark * .42));
  haze.addColorStop(.47, color(palette.body, .40));
  haze.addColorStop(.66, color(palette.glow, .13));
  haze.addColorStop(1, color(palette.glow, 0));
  context.fillStyle = haze;
  context.fillRect(-1.5, -1.5, 3, 3);

  const core = context.createRadialGradient(-.24, -.27, .04, -.02, .01, .99);
  core.addColorStop(0, color(palette.light, .24 + spark * .76));
  core.addColorStop(.36, color(palette.glow, .24 + spark * .55));
  core.addColorStop(.72, color(palette.body, .24));
  core.addColorStop(1, color(palette.body, 0));
  context.fillStyle = core;
  context.fillRect(-1.05, -1.05, 2.1, 2.1);
}

function weavePaths(time, position, shape, pointer) {
  const layers = Array.from({ length: 8 }, () => new Path2D());
  const rhythm = position * turn / palettes.length;
  const tilt = -.26 + .09 * Math.sin(time * .48 + rhythm) + pointer[1] * .16;
  const ct = Math.cos(tilt);
  const st = Math.sin(tilt);
  const lines = Math.round(shape.lines);
  const space = .77 + shape.opening * .009;
  const crossLines = Math.ceil(lines * .26);

  for (let line = 0; line < lines + crossLines; line++) {
    const crossing = line >= lines;
    const fraction = crossing ? (line - lines + .5) / crossLines : (line + .38) / (lines - .24);
    const latitude = (fraction - .5) * 2.80;
    const height = Math.sin(latitude);
    const spread = Math.cos(latitude);
    const roll = (crossing ? .86 : -.25) + .09 * Math.sin(time * .61 + rhythm) + pointer[0] * .12;
    const cr = Math.cos(roll);
    const sr = Math.sin(roll);
    const fold = height * 2.36 + time * .91 + rhythm;
    const fold2 = height * 3.46 - time * .68 - rhythm;
    const fold3 = height * 7.6 - time * 1.32 + rhythm;
    const s1 = Math.sin(fold), c1 = Math.cos(fold);
    const s2 = Math.sin(fold2), c2 = Math.cos(fold2);
    const s3 = Math.sin(fold3), c3 = Math.cos(fold3);
    const accent = !crossing && line % 5 === 1;
    let previousX, previousY, previousDepth;
    let previousLayer = -1;
    for (const [c, s, cTwo, sTwo, cThree, sThree, cFive, sFive] of waveSamples) {
      const swell = cTwo * s1 + sTwo * c1;
      const curl = cThree * s2 + sThree * c2;
      const ripple = cFive * s3 + sFive * c3;
      const radius = spread * (1 + space * (.108 * swell + .058 * curl + .024 * ripple));
      const level = height * .94 + spread * space * (
        .146 * (sTwo * s1 - cTwo * c1) + .071 * curl + .022 * ripple + .071 * (c * s2 + s * c2)
      );
      const localX = c * radius;
      const localZ = s * radius;
      const y = level * ct - localZ * st;
      const depth = level * st + localZ * ct;
      const perspective = 1 / (1 - depth * .17);
      const x = (localX * cr - y * sr) * perspective;
      const screenY = (localX * sr + y * cr) * perspective;
      if (previousDepth !== undefined) {
        const meanDepth = (depth + previousDepth) * .5;
        const band = meanDepth < -.27 ? 0 : meanDepth < .08 ? 1 : meanDepth < .58 ? 2 : 3;
        const layer = 2 * band + Number(accent);
        const path = layers[layer];
        if (layer !== previousLayer) path.moveTo(previousX, previousY);
        path.lineTo(x, screenY);
        previousLayer = layer;
      }
      previousX = x;
      previousY = screenY;
      previousDepth = depth;
    }
  }
  return layers;
}

function drawWeave(context, paths, palette, size, opacity) {
  context.globalAlpha = opacity;
  const strengths = [.16, .28, .53, .9];
  for (const [index, path] of paths.entries()) {
    const weight = strengths[Math.floor(index / 2)];
    const accent = index % 2;
    const filament = context.createLinearGradient(-.83, -.77, .86, .73);
    filament.addColorStop(0, color(palette.light, weight * (.68 + accent * .23)));
    filament.addColorStop(.39, color(tint(palette.glow, palette.light, .56), weight * (.82 + accent * .18)));
    filament.addColorStop(.69, color(palette.glow, weight * (.79 + accent * .15)));
    filament.addColorStop(1, color(palette.light, weight * (.53 + accent * .24)));
    if (index >= 4) {
      context.strokeStyle = color(palette.glow, weight * (.06 + accent * .045));
      context.lineWidth = (accent ? 5 : 3) / size;
      context.stroke(path);
    }
    context.strokeStyle = filament;
    context.lineWidth = (accent ? 1.32 : .82) / size;
    context.stroke(path);
  }
  context.globalAlpha = 1;
}

const trailLife = 390;

function drawTrail(context, samples, now, radius) {
  if (samples.length < 2) return;
  const points = samples.map((point, index) => {
    const before = samples[Math.max(0, index - 1)];
    const after = samples[Math.min(samples.length - 1, index + 1)];
    const dx = after.x - before.x;
    const dy = after.y - before.y;
    const length = Math.hypot(dx, dy) || 1;
    const age = limit(1 - (now - point.time) / trailLife, 0, 1);
    const taper = ease(0, 6, index);
    return {
      nx: -dy / length, ny: dx / length,
      width: radius * .066 * age ** 1.45 * (1 - point.scale) ** 1.21 * taper,
    };
  });
  const first = samples[0];
  const last = samples.at(-1);
  const end = Math.hypot(last.x - first.x, last.y - first.y) >= 1 ? last : samples[Math.floor(samples.length / 2)];

  for (const [thickness, opacity, hue, drift] of [
    [1.6, .07, 'glow', 0], [.75, .16, 'glow', 0], [.115, .73, 'light', 0], [.064, .43, 'glow', .69],
  ]) {
    const strip = new Path2D();
    for (const side of [1, -1]) {
      for (let i = 0; i < points.length; i++) {
        const index = side === 1 ? i : points.length - 1 - i;
        const { x, y } = samples[index];
        const { nx, ny, width } = points[index];
        const offset = width * (thickness * side + drift * Math.sin(index * .29));
        if (i === 0 && side === 1) strip.moveTo(x + nx * offset, y + ny * offset);
        else strip.lineTo(x + nx * offset, y + ny * offset);
      }
    }
    const light = context.createLinearGradient(first.x, first.y, end.x, end.y);
    light.addColorStop(0, color(first[hue], opacity * .42));
    light.addColorStop(.43, color(tint(first[hue], last[hue], .38), opacity * .83));
    light.addColorStop(1, color(last[hue], opacity));
    context.fillStyle = light;
    context.fill(strip);
  }
}

function drawReflection(context, image, width, height, { x, plane, radius, scale, visibility, palette }) {
  const compression = .49;
  context.save();
  context.beginPath();
  context.rect(0, plane - 2, width, height - plane + 2);
  context.clip();
  context.globalAlpha = .86 * visibility;
  context.transform(1, 0, -.012, -compression, plane * .012, plane * (1 + compression));
  context.drawImage(image, 0, 0, width, height);
  context.restore();

  const fade = context.createLinearGradient(0, plane - 2, 0, plane + radius * 1.23);
  fade.addColorStop(0, '#000e');
  fade.addColorStop(.24, '#000c');
  fade.addColorStop(.62, '#0005');
  fade.addColorStop(1, '#0000');
  context.globalCompositeOperation = 'destination-in';
  context.fillStyle = fade;
  context.fillRect(0, 0, width, height);

  const sheen = tint([58, 173, 112], palette.glow, .29);
  const strength = visibility * (.32 + scale * .68);
  context.save();
  context.globalCompositeOperation = 'destination-over';
  context.translate(x, plane + radius * .18);
  context.scale(radius * 1.98, radius * .34);
  const light = context.createRadialGradient(0, 0, 0, 0, 0, 1);
  light.addColorStop(0, color(sheen, strength * .28));
  light.addColorStop(.37, color(sheen, strength * .13));
  light.addColorStop(1, color(sheen, 0));
  context.fillStyle = light;
  context.fillRect(-1, -1, 2, 2);
  context.restore();
  context.globalCompositeOperation = 'source-over';
}

export function createEnergyOrb(canvas) {
  const stage = canvas.getContext('2d', { alpha: true });
  if (!stage) return;
  const image = document.createElement('canvas');
  const context = image.getContext('2d', { alpha: true });
  if (!context) return;
  let width = 0;
  let height = 0;
  let previous;
  let trail = [];

  function clearTrail() {
    previous = undefined;
    trail = [];
  }

  function resize() {
    const w = canvas.parentElement.clientWidth;
    const h = canvas.parentElement.clientHeight;
    if (!w || !h) return;
    const density = Math.min(devicePixelRatio || 1, 1.65, 1440 / w, 1100 / h);
    const resolution = [Math.round(w * density), Math.round(h * density)];
    if (w === width && h === height && canvas.width === resolution[0] && canvas.height === resolution[1]) return;
    width = w;
    height = h;
    [canvas.width, canvas.height] = resolution;
    [image.width, image.height] = resolution;
    for (const layer of [stage, context]) {
      layer.setTransform(canvas.width / width, 0, 0, canvas.height / height, 0, 0);
    }
    clearTrail();
  }

  function rememberTrail(state, tone, now) {
    while (trail.length && now - trail[0].time > trailLife) trail.shift();
    if (previous && state.orbit > .03) {
      const from = previous.state;
      const distance = Math.abs(state.position - from.position);
      if (distance > .001) {
        const steps = limit(Math.ceil(distance * 24), 1, 20);
        for (let index = 1; index <= steps; index++) {
          const weight = index / steps;
          const position = mix(from.position, state.position, weight);
          const point = placeOrb(width, height, {
            position, orbit: mix(from.orbit, state.orbit, weight),
            x: mix(from.x, state.x, weight), y: mix(from.y, state.y, weight),
          });
          if (point.scale > .985 && !trail.length) continue;
          trail.push({ ...point, ...paletteAt(position, tone), time: mix(previous.time, now, weight) });
        }
      }
    }
    previous = { state: { ...state }, time: now };
  }

  function draw(state, shape, pointer, time, now, animated) {
    if (!width || !height || state.radius <= 0) return;
    const { position, radius } = state;
    const visibility = limit(state.visibility, 0, 1);
    const { x, y, scale } = placeOrb(width, height, state);
    const palette = paletteAt(position, shape.tone);
    const size = radius * scale;
    const spark = 1 - ease(.073, .32, scale);
    if (animated && (state.orbit > .03 || trail.length)) rememberTrail(state, shape.tone, now);
    else clearTrail();

    context.clearRect(0, 0, width, height);
    drawTrail(context, trail, now, radius);
    context.save();
    context.translate(x, y);
    context.scale(size, size);
    drawAura(context, palette, spark);
    if (spark < .98) drawWeave(context, weavePaths(time, position, shape, pointer), palette, size, 1 - spark);
    context.restore();

    stage.clearRect(0, 0, width, height);
    const plane = Math.min(height, state.y + radius * 1.095 + 7);
    drawReflection(stage, image, width, height, { x, plane, radius, scale, visibility, palette });
    stage.save();
    stage.globalAlpha = visibility;
    stage.drawImage(image, 0, 0, width, height);
    stage.restore();
  }

  return { draw, resize, clearTrail };
}
