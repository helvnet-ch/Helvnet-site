import { sculpturePoses, settleAxis, smoothStep as ease } from './scene-motion.js';
import { drawApp, drawCursor, drawSun } from './sculpture-shapes.js';

const extent = 1.86;

const forms = [
  {
    tone: '#c6ff5c', shape: drawCursor, yaw: -.32, tilt: -.22, roll: -.055, tempo: .58, phase: .8,
    core: .065, wave: .073, roundness: .07, elasticity: .66, reflection: .34,
  },
  {
    tone: '#74a4bc', shape: drawApp, yaw: -.35, tilt: -.29, roll: .065, tempo: .68, phase: 2.36,
    core: .073, wave: .065, roundness: .05, elasticity: .60, reflection: .36,
  },
  {
    tone: '#f005d8', shape: drawSun, yaw: .04, tilt: -.19, roll: -.06, tempo: .83, phase: 4.35,
    core: .43, coreSize: .81, corePulse: .19, floor: 1.13, roundness: .19, elasticity: .93, reflection: .31,
  },
];

const rgb = (channels, alpha = 1) => 'rgba(' + channels.map(Math.round).join(',') + ',' + alpha + ')';
const mix = (a, b, weight) => a.map((value, index) => value + (b[index] - value) * weight);

function softEdge(overrun, softness) {
  if (overrun <= -softness) return 0;
  if (overrun >= softness) return overrun;
  return (overrun + softness) ** 2 / (4 * softness);
}

export function sculptureTone(index) {
  return forms[index].tone;
}

const channels = (hex) => [1, 3, 5].map((offset) => parseInt(hex.slice(offset, offset + 2), 16));
const pigments = forms.map(({ tone }) => channels(tone));

function lightPalette(index, custom, weight) {
  const base = pigments[index];
  const pigment = custom ? mix(base, custom, weight) : base;
  return { pigment, shine: mix(pigment, [240, 245, 255], .66) };
}

function projector(form, phase, opening, pointer, { xx, xy, yy, depthScale, roundness, energy, light }) {
  const bank = .16 * light;
  const yaw = form.yaw + .067 * Math.sin(phase * .69) + bank * .67;
  const tilt = form.tilt + .095 * Math.sin(phase * .58) + pointer[1] * .13 + .34 * bank;
  const roll = form.roll + .12 * Math.sin(phase * .64) + pointer[0] * .10 + .51 * bank;
  const ct = Math.cos(tilt), st = Math.sin(tilt);
  const cr = Math.cos(roll), sr = Math.sin(roll);
  const cy = Math.cos(yaw), sy = Math.sin(yaw);
  const wave = (form.wave ?? 0) * (.78 + .24 * opening + .17 * energy);
  const flow = phase * 2.03;

  return (point, screen) => {
    let [u, v, w] = point;
    if (wave) {
      const x = .73 * Math.sin(3.8 * v + flow) + .31 * Math.sin(5.4 * v - .72 * flow + 1.5 * w);
      const y = .51 * Math.sin(3.65 * u - .85 * flow + .62 * w) + .22 * Math.sin(2.6 * v + u + flow);
      const z = .49 * Math.cos(3.6 * u + 2.1 * v + .81 * flow) + .19 * Math.sin(4.4 * v - .63 * flow);
      u += wave * x;
      v += wave * y;
      w += wave * z;
    }
    const horizontal = u * cy + w * sy;
    const back = w * cy - u * sy;
    const vertical = v * ct - back * st;
    const depth = (v * st + back * ct) * depthScale;
    const perspective = 1 / (1 - depth * .148);
    const x = (horizontal * cr - vertical * sr) * perspective / roundness;
    const y = (horizontal * sr + vertical * cr) * perspective * roundness;
    screen[0] = xx * x + xy * y;
    screen[1] = xy * x + yy * y;
    screen[2] = depth;
  };
}

function threadGeometry(form, time, controls, pointer, elastic, step) {
  const layers = Array.from({ length: 8 }, () => new Path2D());
  const faces = [];
  const phase = form.phase + time * form.tempo;
  const opening = .73 + controls.opening * .009;
  const project = projector(form, phase, opening, pointer, elastic);
  const point = [0, 0, 0];
  const screen = [0, 0, 0];
  let left = 0, right = 0, top = 0, bottom = 0;

  function trace(count, sample, accent = false) {
    let previousLayer = -1;
    let previousX, previousY, previousZ;
    for (let segment = 0; segment < count; segment++) {
      sample(point, segment);
      project(point, screen);
      const [x, y, z] = screen;
      left = Math.min(left, x);
      right = Math.max(right, x);
      top = Math.min(top, y);
      bottom = Math.max(bottom, y);
      if (segment) {
        const mid = (z + previousZ) * .5;
        const band = mid < -.29 ? 0 : mid < .04 ? 1 : mid < .52 ? 2 : 3;
        const layer = 2 * band + Number(accent);
        const path = layers[layer];
        if (layer !== previousLayer) path.moveTo(previousX, previousY);
        path.lineTo(x, y);
        previousLayer = layer;
      }
      previousX = x;
      previousY = y;
      previousZ = z;
    }
  }

  function face(outline, scale, depth, opacity, centreX = 0, centreY = 0) {
    const path = new Path2D();
    for (const [x, y] of outline) {
      point[0] = centreX + x * scale;
      point[1] = centreY + y * scale;
      point[2] = depth;
      project(point, screen);
      path.lineTo(screen[0], screen[1]);
    }
    path.closePath();
    faces.push({ path, opacity });
  }

  form.shape({
    trace, face, phase, step, energy: elastic.energy, count: Math.round(controls.lines), opening,
  });
  const bounds = Math.max(extent, .06 + Math.max(-left, right, -top, bottom));
  return { layers, faces, left, right, top, bottom, bounds };
}

function drawFaces(context, faces, palette) {
  if (!faces.length) return;
  const light = context.createLinearGradient(-.83, -.8, .84, .92);
  light.addColorStop(0, rgb(palette.shine, .77));
  light.addColorStop(.48, rgb(palette.pigment, .46));
  light.addColorStop(1, rgb(palette.pigment, .15));
  context.fillStyle = light;
  for (const { path, opacity } of faces) {
    context.globalAlpha = opacity;
    context.fill(path);
  }
  context.globalAlpha = 1;
}

function drawCore(context, form, palette, time, { xx, xy, yy, energy, roundness }, outline) {
  const core = form.core + energy * .045;
  const current = time * form.tempo + form.phase;
  const pulse = form.corePulse ?? 0;
  const breath = pulse * Math.sin(current * 2.12);
  const intensity = core * (.91 + .09 * Math.sin(current * .78) + breath);
  const size = (form.coreSize ?? 1) * (1 + .62 * breath);
  context.save();
  if (outline) context.clip(outline);
  context.transform(xx, xy, xy, yy, 0, 0);
  context.translate(-.055 + .12 * Math.sin(current * .72) + pulse * .75 * Math.sin(current * 1.58),
    -.06 + pulse * .60 * Math.cos(current * 1.79));
  context.scale(size / roundness, size * roundness);
  const inner = context.createRadialGradient(-.19, -.22, .018, -.04, -.02, .94);
  inner.addColorStop(0, rgb(palette.shine, intensity));
  inner.addColorStop(.28, rgb(palette.pigment, intensity * .71));
  inner.addColorStop(.67, rgb(palette.pigment, intensity * .18));
  inner.addColorStop(1, rgb(palette.pigment, 0));
  context.fillStyle = inner;
  context.fillRect(-1.02, -1.02, 2.04, 2.04);
  context.restore();
}

function drawFilaments(context, layers, palette, size, { energy, light }, phase) {
  const strengths = [.23, .42, .76, 1];
  const sway = .14 * Math.sin(phase);
  const halo = 1 - .18 * energy;
  const beam = context.createLinearGradient(-.89 + sway, -.81, .80, .81 - sway);
  beam.addColorStop(0, rgb(mix(palette.pigment, palette.shine, .44), .66));
  beam.addColorStop(.26 + light * .17, rgb(mix(palette.shine, [255, 255, 255], energy * .47)));
  beam.addColorStop(.53, rgb(mix(palette.pigment, palette.shine, .22 + .26 * energy), .96));
  beam.addColorStop(.74, rgb(palette.pigment, .87));
  beam.addColorStop(1, rgb(mix(palette.pigment, palette.shine, .26), .67));

  for (let index = 0; index < layers.length; index++) {
    const accent = index % 2;
    const strength = strengths[Math.floor(index / 2)];
    if (index >= 4 && halo > .03) {
      context.globalAlpha = halo * strength * (accent ? .17 : .093);
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

function drawReflection(stage, mirror, fade, source, piece, plane, span, compression) {
  const width = mirror.canvas.width, height = mirror.canvas.height;
  mirror.clearRect(0, 0, width, height);
  mirror.save();
  mirror.translate(0, height);
  mirror.scale(width / source.width, -height / source.height);
  mirror.drawImage(source, 0, 0);
  mirror.restore();
  mirror.globalCompositeOperation = 'destination-in';
  mirror.fillStyle = fade;
  mirror.fillRect(0, 0, width, height);
  mirror.globalCompositeOperation = 'source-over';

  const top = plane + (plane - piece.y - span) * compression;
  stage.save();
  stage.globalAlpha = piece.opacity * .55;
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

export function createEnergyOrb(canvas) {
  const stage = canvas.getContext('2d', { alpha: true });
  if (!stage) return;
  const shapeLayer = document.createElement('canvas').getContext('2d', { alpha: true });
  const mirror = document.createElement('canvas').getContext('2d', { alpha: true });
  if (!shapeLayer || !mirror) return;
  const elasticBodies = forms.map(() => ({ extension: 0, speed: 0, angle: 0, light: 0 }));
  const tint = Array(forms.length);
  const hitTargets = [];
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
    hitTargets.length = 0;
    [canvas.width, canvas.height] = nextSize;
    stage.setTransform(canvas.width / width, 0, 0, canvas.height / height, 0, 0);

    const tile = Math.round(Math.max(364, Math.min(width * .64, height * .85, 675 / density) * density));
    shapeLayer.canvas.width = shapeLayer.canvas.height = tile;
    mirror.canvas.width = Math.ceil(tile * .70);
    mirror.canvas.height = Math.ceil(tile * .35);
    reflectionFade = mirror.createLinearGradient(0, 0, 0, mirror.canvas.height);
    reflectionFade.addColorStop(0, '#000f');
    reflectionFade.addColorStop(.26, '#000e');
    reflectionFade.addColorStop(.65, '#0006');
    reflectionFade.addColorStop(.96, '#0000');
    shapeLayer.lineCap = 'round';
    shapeLayer.lineJoin = 'round';
  }

  function draw(state, controls, { pointer, time, elapsed, velocity, active, animated }) {
    if (!width || !height || state.radius <= 0) return false;
    const response = animated ? 1 - Math.exp(-19 * elapsed) : 1;
    const compact = width <= 688;
    const step = width <= 480 ? 3 : 2;
    const custom = controls.tone ? channels(controls.tone) : undefined;
    const margin = compact ? 9 : 18;
    const softness = compact ? 12 : 20;
    const keepInside = ease(.18, .97, state.orbit);
    let settling = false;

    stage.clearRect(0, 0, width, height);
    hitTargets.length = 0;
    for (const piece of sculpturePoses(state, width, forms.length, velocity)) {
      const form = forms[piece.index];
      const body = elasticBodies[piece.index];
      const target = piece.travel * (.11 + .078 * piece.front) * form.elasticity;
      [body.extension, body.speed] = animated
        ? settleAxis(body.extension, body.speed, target, 22, elapsed) : [0, 0];
      const bearing = piece.heading - body.angle;
      if (piece.travel > .008) {
        body.angle += .5 * Math.atan2(Math.sin(2 * bearing), Math.cos(2 * bearing)) * response;
      }
      body.light += (Math.cos(piece.heading) * piece.travel - body.light) * response;
      settling ||= animated && (body.extension !== target || Math.abs(body.light) > .004);

      const selected = Number(piece.index === active);
      const oldTint = tint[piece.index] ?? selected;
      tint[piece.index] = custom ? oldTint + (selected - oldTint) * response : selected;
      settling ||= animated && Math.abs(tint[piece.index] - selected) > .003;
      if (piece.opacity < .009 || piece.size <= 0) continue;

      const focus = .34 + .66 * piece.front;
      const palette = lightPalette(piece.index, custom, tint[piece.index]);
      const sine = Math.sin(body.angle), cosine = Math.cos(body.angle);
      const along = 1 + body.extension;
      const across = 1 / Math.sqrt(along);
      const difference = along - across;
      const energy = ease(.006, .175, body.extension);
      // Stretch the entire volume along its tangent, with equal contraction on the other axes.
      const elastic = {
        xx: across + difference * cosine * cosine,
        xy: difference * sine * cosine,
        yy: across + difference * sine * sine,
        depthScale: across,
        energy,
        roundness: Math.sqrt(1 + energy * form.roundness),
        light: body.light,
      };
      const geometry = threadGeometry(form, time, controls, [pointer[0] * focus, pointer[1] * focus], elastic, step);
      const { bounds, left, right, top, bottom } = geometry;
      piece.x += keepInside * (softEdge(margin - piece.x - left * piece.size, softness) -
        softEdge(piece.x + right * piece.size + margin - width, softness));
      piece.y += keepInside * (softEdge(margin - piece.y - top * piece.size, softness) -
        softEdge(piece.y + bottom * piece.size + margin - height, softness));
      const halfTile = shapeLayer.canvas.width * .5;
      const scale = halfTile / bounds;
      shapeLayer.setTransform(scale, 0, 0, scale, halfTile, halfTile);
      shapeLayer.clearRect(-bounds, -bounds, 2 * bounds, 2 * bounds);
      const outline = geometry.faces[0]?.path;
      drawFaces(shapeLayer, geometry.faces, palette);
      drawCore(shapeLayer, form, palette, time, elastic, outline);
      drawFilaments(shapeLayer, geometry.layers, palette, piece.size, elastic, form.phase + time * .41);
      const floor = form.floor === undefined ? bottom : form.floor + softEdge(bottom - form.floor, .06);
      const plane = piece.y + piece.size * (floor + .045) + 4;
      const span = piece.size * bounds;
      drawReflection(stage, mirror, reflectionFade, shapeLayer.canvas, piece, plane, span, form.reflection);
      stage.save();
      stage.globalAlpha = Math.min(1, piece.opacity);
      stage.drawImage(shapeLayer.canvas, piece.x - span, piece.y - span, 2 * span, 2 * span);
      stage.restore();
      hitTargets.push({ x: piece.x, y: piece.y, size: piece.size, index: piece.index, outline });
    }

    return settling;
  }

  function pick(x, y) {
    stage.save();
    stage.resetTransform();
    const hit = hitTargets.findLast((piece) => {
      const u = (x - piece.x) / piece.size;
      const v = (y - piece.y) / piece.size;
      return piece.outline ? stage.isPointInPath(piece.outline, u, v) : Math.hypot(u, v) < .98;
    });
    stage.restore();
    return hit?.index;
  }

  return { draw, resize, pick };
}
