import { sculpturePoses, settleAxis } from './scene-motion.js';

const turn = 2 * Math.PI;
const extent = 1.86;
const samples = Array.from({ length: 97 }, (_, index) => {
  const angle = index * turn / 96;
  return { angle, sine: Math.sin(angle), cosine: Math.cos(angle) };
});

const forms = [
  {
    tone: '#c6ff5c', tilt: -.29, roll: -.24, aspect: [1.03, .95], tempo: .77, phase: .36,
    wave: .119, pinch: .065, crossing: .25, core: .36, elasticity: .47,
  },
  {
    tone: '#74a4bc', tilt: -.48, roll: -.44, aspect: [.94, 1.08], tempo: .63, phase: 2.36,
    loop: true, crossing: .24, core: 0, elasticity: .39,
  },
  {
    tone: '#f005d8', tilt: .16, roll: -.51, aspect: [1.05, .93], tempo: .86, phase: 4.35,
    wave: .131, pinch: .43, crossing: .23, core: .27, elasticity: .49,
  },
];

const rgb = (channels, alpha = 1) => 'rgba(' + channels.map(Math.round).join(',') + ',' + alpha + ')';
const mix = (a, b, weight) => a.map((value, index) => value + (b[index] - value) * weight);

export function sculptureTone(index) {
  return forms[index].tone;
}

function lightPalette(index, tone) {
  const hex = tone || sculptureTone(index);
  const pigment = [1, 3, 5].map((offset) => parseInt(hex.slice(offset, offset + 2), 16));
  return { pigment, shine: mix(pigment, [240, 245, 255], .66) };
}

function curvedShell(out, radial, vertical, sample, crossing, form, phase, opening) {
  const u = radial * sample.cosine;
  const z = radial * sample.sine;
  // Both filament families travel across the same deforming surface.
  const x = crossing ? u * .47 - vertical * .883 : u;
  const y = crossing ? u * .883 + vertical * .47 : vertical;
  const swell = Math.sin(y * 3.83 + z * 2.9 + phase);
  const curl = Math.sin(x * 3.7 - z * 3.1 - phase * .72);
  const fold = Math.sin(x * 4.1 + z * 1.95 - phase * .84);
  const waist = y - .074 * Math.sin(phase * .66 + x * 2.9);
  const pinch = form.pinch * Math.exp(-waist * waist * 15);
  const spread = (1 - pinch) * (1 + opening * (form.wave * swell + .072 * curl));
  out[0] = spread * x + .083 * Math.sin(3.1 * y + phase);
  out[1] = .957 * y + .13 * opening * (1 - y * y) * fold;
  out[2] = spread * z + .072 * Math.sin(y * 4.6 - phase);
}

function openLoop(out, ring, tube, phase, opening) {
  const angle = ring.angle;
  const fold = Math.sin(2 * angle + phase * .77);
  const twist = .47 * phase + .87 * Math.sin(angle - phase * .62);
  const ca = Math.cos(twist), sa = Math.sin(twist);
  const section = .293 + .040 * opening * Math.cos(angle * 3 - phase * .62);
  const shell = .715 + opening * (.081 * fold + .051 * Math.sin(3 * angle - phase));
  const radius = shell + section * (tube.cosine * ca - tube.sine * sa);
  out[0] = radius * ring.cosine + .057 * Math.sin(3 * angle + phase);
  out[1] = radius * ring.sine + .053 * fold;
  out[2] = .92 * section * (tube.sine * ca + tube.cosine * sa) + .185 * fold;
}

function projector(form, phase, pointer, stretch) {
  const tilt = form.tilt + .095 * Math.sin(phase * .58) + pointer[1] * .13;
  const roll = form.roll + .12 * Math.sin(phase * .64) + pointer[0] * .10;
  const ct = Math.cos(tilt), st = Math.sin(tilt);
  const cr = Math.cos(roll), sr = Math.sin(roll);
  const [aspectX, aspectY] = form.aspect;
  const extension = Math.hypot(stretch.x, stretch.y);
  const ax = extension > .001 ? stretch.x / extension : 1;
  const ay = extension > .001 ? stretch.y / extension : 0;

  return (point, screen) => {
    const [u, v, w] = point;
    const vertical = v * ct - w * st;
    const depth = v * st + w * ct;
    const perspective = 1 / (1 - depth * .148);
    const x = (u * cr - vertical * sr) * perspective * aspectX;
    const y = (u * sr + vertical * cr) * perspective * aspectY;

    const along = x * ax + y * ay;
    const across = y * ax - x * ay;
    const pulled = along + extension * (along * (1 - .25 * along) + .048 * depth);
    const compressed = across * (1 - extension * (.45 + .11 * along)) +
      extension * .12 * (1 - along * along) * (1 - depth * .35);
    screen[0] = pulled * ax - compressed * ay;
    screen[1] = pulled * ay + compressed * ax;
    screen[2] = depth * (form.loop ? 1.45 : 1);
  };
}

function threadGeometry(form, time, controls, pointer, piece, stretch) {
  const layers = Array.from({ length: 8 }, () => new Path2D());
  const phase = form.phase + time * form.tempo;
  const project = projector(form, phase, pointer, stretch);
  const count = Math.round(controls.lines);
  const crossCount = Math.ceil(count * form.crossing);
  const opening = .73 + controls.opening * .009;
  const step = piece.size < 96 ? 2 : 1;
  const point = [0, 0, 0];
  const screen = [0, 0, 0];
  let bottom = 0;

  for (let line = 0; line < count + crossCount; line++) {
    const crossing = line >= count;
    const fraction = crossing ? (line - count + .45) / crossCount : (line + .35) / count;
    const fixed = samples[Math.round(fraction * (samples.length - 1))];
    const latitude = (fraction - .5) * 2.89;
    const radial = Math.cos(latitude), vertical = Math.sin(latitude);
    const accent = !crossing && line % 5 === 1;
    let previousX = 0, previousY = 0, previousDepth = 0;
    let previousLayer = -1;

    for (let segment = 0; segment < samples.length; segment += step) {
      const sample = samples[segment];
      if (form.loop) openLoop(point, crossing ? fixed : sample, crossing ? sample : fixed, phase, opening);
      else curvedShell(point, radial, vertical, sample, crossing, form, phase, opening);
      project(point, screen);
      const [x, y, depth] = screen;
      bottom = Math.max(bottom, y);

      if (segment) {
        const mid = (depth + previousDepth) * .5;
        const band = mid < -.29 ? 0 : mid < .04 ? 1 : mid < .52 ? 2 : 3;
        const layer = 2 * band + Number(accent);
        const path = layers[layer];
        if (layer !== previousLayer) path.moveTo(previousX, previousY);
        path.lineTo(x, y);
        previousLayer = layer;
      }
      previousX = x;
      previousY = y;
      previousDepth = depth;
    }
  }
  return { layers, bottom };
}

function drawCore(context, form, palette, stretch, time) {
  if (!form.core) return;
  const current = time * form.tempo + form.phase;
  const intensity = form.core * (.91 + .09 * Math.sin(current * .78));
  context.save();
  context.translate(-.055 + .12 * Math.sin(current * .72) + .34 * stretch.x, -.06 + .34 * stretch.y);
  context.scale(form.pinch > .30 ? .80 : 1, 1);
  const inner = context.createRadialGradient(-.19, -.22, .018, -.04, -.02, .94);
  inner.addColorStop(0, rgb(palette.shine, intensity));
  inner.addColorStop(.28, rgb(palette.pigment, intensity * .71));
  inner.addColorStop(.67, rgb(palette.pigment, intensity * .18));
  inner.addColorStop(1, rgb(palette.pigment, 0));
  context.fillStyle = inner;
  context.fillRect(-1.02, -1.02, 2.04, 2.04);
  context.restore();
}

function drawFilaments(context, layers, palette, size, phase) {
  const strengths = [.23, .42, .76, 1];
  const sway = .14 * Math.sin(phase);
  const beam = context.createLinearGradient(-.89 + sway, -.81, .80, .81 - sway);
  beam.addColorStop(0, rgb(mix(palette.pigment, palette.shine, .44), .66));
  beam.addColorStop(.26, rgb(palette.shine, 1));
  beam.addColorStop(.53, rgb(mix(palette.pigment, palette.shine, .22), .96));
  beam.addColorStop(.74, rgb(palette.pigment, .87));
  beam.addColorStop(1, rgb(mix(palette.pigment, palette.shine, .26), .67));

  for (let index = 0; index < layers.length; index++) {
    const accent = index % 2;
    const strength = strengths[Math.floor(index / 2)];
    if (index >= 4) {
      context.globalAlpha = strength * (accent ? .17 : .093);
      context.lineWidth = accent ? .024 : .017;
      context.strokeStyle = rgb(palette.pigment);
      context.stroke(layers[index]);
    }
    context.globalAlpha = strength * (accent ? 1 : .89);
    context.lineWidth = Math.max(accent ? .0102 : .0072, (accent ? 1.0 : .69) / size);
    context.strokeStyle = beam;
    context.stroke(layers[index]);
  }
  context.globalAlpha = 1;
}

function drawReflection(stage, mirror, fade, source, piece, bottom) {
  const width = mirror.canvas.width, height = mirror.canvas.height;
  mirror.clearRect(0, 0, width, height);
  mirror.save();
  mirror.translate(0, height);
  mirror.scale(1, -height / source.height);
  mirror.drawImage(source, 0, 0);
  mirror.restore();
  mirror.globalCompositeOperation = 'destination-in';
  mirror.fillStyle = fade;
  mirror.fillRect(0, 0, width, height);
  mirror.globalCompositeOperation = 'source-over';

  const span = piece.size * extent;
  const plane = piece.y + piece.size * (bottom + .045) + 4;
  const compression = .49;
  const top = plane + (plane - piece.y - span) * compression;
  stage.save();
  stage.globalCompositeOperation = 'screen';
  stage.globalAlpha = piece.opacity * .66;
  stage.drawImage(mirror.canvas, piece.x - span, top, 2 * span, 2 * span * compression);
  stage.restore();

  stage.save();
  stage.globalAlpha = piece.opacity;
  stage.translate(piece.x, plane);
  stage.scale(piece.size * .94, Math.max(2, piece.size * .028));
  const contact = stage.createRadialGradient(0, 0, 0, 0, 0, 1);
  contact.addColorStop(0, 'rgba(218,221,240,.075)');
  contact.addColorStop(1, 'rgba(218,221,240,0)');
  stage.fillStyle = contact;
  stage.fillRect(-1, -1, 2, 2);
  stage.restore();
}

const relaxed = () => ({ x: 0, y: 0, vx: 0, vy: 0 });

function stretchAlong(stretch, form, piece, elapsed) {
  const speed = Math.hypot(piece.vx, piece.vy);
  const tension = form.elasticity * (.76 + .24 * piece.front) *
    Math.tanh(speed / Math.max(72, piece.size) * .24);
  const weight = speed > 0 ? tension / speed : 0;
  [stretch.x, stretch.vx] = settleAxis(stretch.x, stretch.vx, piece.vx * weight, 24, elapsed);
  [stretch.y, stretch.vy] = settleAxis(stretch.y, stretch.vy, piece.vy * weight, 24, elapsed);
}

export function createEnergyOrb(canvas) {
  const stage = canvas.getContext('2d', { alpha: true });
  if (!stage) return;
  const shapeLayer = document.createElement('canvas').getContext('2d', { alpha: true });
  const mirror = document.createElement('canvas').getContext('2d', { alpha: true });
  if (!shapeLayer || !mirror) return;
  const strains = forms.map(relaxed);
  let width = 0;
  let height = 0;
  let reflectionFade;

  function resize() {
    const nextWidth = canvas.parentElement.clientWidth;
    const nextHeight = canvas.parentElement.clientHeight;
    if (!nextWidth || !nextHeight) return;
    const density = Math.min(devicePixelRatio || 1, 1.7, 1580 / nextWidth, 1180 / nextHeight);
    const nextSize = [Math.round(nextWidth * density), Math.round(nextHeight * density)];
    if (width === nextWidth && height === nextHeight && canvas.width === nextSize[0] && canvas.height === nextSize[1]) return;
    width = nextWidth;
    height = nextHeight;
    [canvas.width, canvas.height] = nextSize;
    stage.setTransform(canvas.width / width, 0, 0, canvas.height / height, 0, 0);

    const tile = Math.round(Math.max(400, Math.min(width * .73, height * .89, 790 / density) * density));
    shapeLayer.canvas.width = shapeLayer.canvas.height = tile;
    mirror.canvas.width = tile;
    mirror.canvas.height = Math.ceil(tile * .5);
    reflectionFade = mirror.createLinearGradient(0, 0, 0, mirror.canvas.height);
    reflectionFade.addColorStop(0, '#000f');
    reflectionFade.addColorStop(.26, '#000e');
    reflectionFade.addColorStop(.65, '#0006');
    reflectionFade.addColorStop(.96, '#0000');
    const scale = tile / (2 * extent);
    shapeLayer.setTransform(scale, 0, 0, scale, tile / 2, tile / 2);
    shapeLayer.lineCap = 'round';
    shapeLayer.lineJoin = 'round';
  }

  function draw(state, controls, { pointer, time, elapsed, velocity, active, animated }) {
    if (!width || !height || state.radius <= 0) return;
    stage.clearRect(0, 0, width, height);
    for (const piece of sculpturePoses(state, width, forms.length, velocity)) {
      const form = forms[piece.index];
      if (!animated) strains[piece.index] = relaxed();
      const strain = strains[piece.index];
      if (animated && elapsed) stretchAlong(strain, form, piece, elapsed);
      if (piece.opacity < .009 || piece.size <= 0) continue;

      const palette = lightPalette(piece.index, piece.index === active ? controls.tone : '');
      const focus = .34 + .66 * piece.front;
      const geometry = threadGeometry(form, time, controls, [pointer[0] * focus, pointer[1] * focus], piece, strain);
      shapeLayer.clearRect(-extent, -extent, 2 * extent, 2 * extent);
      drawCore(shapeLayer, form, palette, strain, time);
      drawFilaments(shapeLayer, geometry.layers, palette, piece.size, form.phase + time * .41);
      drawReflection(stage, mirror, reflectionFade, shapeLayer.canvas, piece, geometry.bottom);

      const span = piece.size * extent;
      stage.save();
      stage.globalCompositeOperation = 'screen';
      stage.globalAlpha = Math.min(1, piece.opacity);
      stage.drawImage(shapeLayer.canvas, piece.x - span, piece.y - span, 2 * span, 2 * span);
      stage.restore();
    }
  }

  return { draw, resize };
}
