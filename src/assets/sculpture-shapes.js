const turn = 2 * Math.PI;

const cursorOutline = [
  [-.61, -1.04], [.86, .22], [.24, .24], [.53, .82],
  [.19, .98], [-.09, .40], [-.57, .82],
];

function roundedSquare(half, radius) {
  return Array.from({ length: 36 }, (_, index) => {
    const corner = Math.floor(index / 9);
    const start = corner * Math.PI / 2;
    const angle = start + (index % 9) * Math.PI / 16;
    const centre = start + Math.PI / 4;
    return [
      Math.sign(Math.cos(centre)) * (half - radius) + radius * Math.cos(angle),
      Math.sign(Math.sin(centre)) * (half - radius) + radius * Math.sin(angle),
    ];
  });
}

function sampleOutline(outline) {
  return outline.flatMap(([x, y], index) => {
    const [nextX, nextY] = outline[(index + 1) % outline.length];
    const segments = Math.max(1, Math.ceil(Math.hypot(nextX - x, nextY - y) / .075));
    return Array.from({ length: segments }, (_, segment) => [
      x + (nextX - x) * segment / segments, y + (nextY - y) * segment / segments,
    ]);
  });
}

const cursorContour = sampleOutline(cursorOutline);
const appOutline = sampleOutline(roundedSquare(.83, .27));
const tileOutline = sampleOutline(roundedSquare(.222, .078));
const solarAngles = Array.from({ length: 240 }, (_, index) => {
  const angle = index / 240 * turn;
  return [Math.cos(angle), Math.sin(angle)];
});

function edge(trace, outline, scale, depth, accent, x = 0, y = 0) {
  trace(outline.length + 1, (point, index) => {
    const [u, v] = outline[index % outline.length];
    point[0] = x + u * scale;
    point[1] = y + v * scale;
    point[2] = depth;
  }, accent);
}

function rim(trace, outline, count, depth) {
  for (let layer = 0; layer < count; layer++) {
    const t = 2 * layer / (count - 1) - 1;
    const radius = 1 - .055 * t ** 4;
    edge(trace, outline, radius, depth * t, layer === count - 1 || layer === 0);
  }
  edge(trace, outline, .89, depth + .009, false);
}

export function drawCursor({ trace, face, count, phase, opening }) {
  const depth = .255;
  rim(trace, cursorContour, Math.max(7, Math.round(count * .46)), depth);
  face(cursorContour, .945, depth, .19);

  const slope = .33;
  const levels = cursorOutline.map(([x, y]) => .932 * (y - slope * x));
  const start = Math.min(...levels);
  const span = Math.max(...levels) - start;
  for (let row = 1; row <= count; row++) {
    const t = row / (count + 1);
    const offset = start + span * (t + .012 * Math.sin(phase + t * 6) * Math.sin(Math.PI * t));
    const crossings = [];
    for (let i = 0; i < cursorOutline.length; i++) {
      const next = (i + 1) % cursorOutline.length;
      const a = levels[i], b = levels[next];
      if ((a < offset) === (b < offset)) continue;
      const x = cursorOutline[i][0], nx = cursorOutline[next][0];
      crossings.push(.932 * (x + (nx - x) * (offset - a) / (b - a)));
    }
    crossings.sort((a, b) => a - b);
    for (let i = 0; i + 1 < crossings.length; i += 2) {
      const left = crossings[i], right = crossings[i + 1];
      trace(12, (point, index) => {
        const u = index / 11;
        point[0] = left + (right - left) * u;
        point[1] = offset + slope * point[0];
        point[2] = depth + .011 + .022 * opening * Math.sin(Math.PI * u) * Math.sin(t * 5 + phase);
      }, row % 7 === 3);
    }
  }
}

export function drawApp({ trace, face, count, phase, opening }) {
  const depth = .235;
  rim(trace, appOutline, Math.max(8, Math.round(count * .51)), depth);
  face(appOutline, .945, depth, .16);
  edge(trace, appOutline, .82, depth + .019, false);
  const raised = Math.max(3, Math.round(count * .16));
  for (let tile = 0; tile < 4; tile++) {
    const x = tile % 2 === 0 ? -.327 : .327;
    const y = tile < 2 ? -.327 : .327;
    const lift = .046 + .042 * opening * (.5 + .5 * Math.sin(phase * 1.34 - tile * .91));
    const cap = depth + lift;
    for (let ring = 0; ring < raised; ring++) {
      edge(trace, tileOutline, 1 - .055 * ring / (raised - 1), depth + lift * ring / (raised - 1),
        ring === raised - 1, x, y);
    }
    face(tileOutline, .945, cap, .28, x, y);
    edge(trace, tileOutline, .76, cap + .012, false, x, y);
  }
}

function solarProfile(phase, opening, energy, stride) {
  const rays = Array.from({ length: 11 }, (_, index) => {
    const offset = index * 2.31;
    const tick = phase * 2.68 - index * 1.73 + .31 * Math.sin(phase * .83 + offset);
    const breathe = .5 + .5 * Math.sin(tick);
    const direction = index / 11 * turn + .073 * Math.sin(offset) + .07 * Math.sin(phase * .75 + offset);
    const length = .687 + (.752 + .17 * opening) * (.045 + .337 * breathe) + .027 * energy;
    const width = .089 + .030 * (.5 + .5 * Math.cos(offset));
    return { x: Math.cos(direction), y: Math.sin(direction), length, width };
  });
  const spin = phase * .114;
  const c = Math.cos(spin), s = Math.sin(spin);
  const breath = .047 * Math.sin(phase * 2.12);
  const squeeze = Math.cos(phase * 1.74), spread = Math.sin(phase * 1.74);
  return Array.from({ length: solarAngles.length / stride }, (_, index) => {
    const [u, v] = solarAngles[index * stride];
    const x = u * c - v * s, y = u * s + v * c;
    const stretch = squeeze * (x * x - y * y) + spread * 2 * x * y;
    const core = .639 + breath + .060 * stretch + .030 * Math.sin(phase * 2.62 + 5 * x - 2.6 * y);
    let radius = core;
    for (const ray of rays) {
      const parallel = x * ray.x + y * ray.y;
      if (parallel < .93) continue;
      const normal = Math.abs(x * ray.y - y * ray.x);
      const side = ray.width / Math.max(normal, .0001);
      const tip = side * parallel <= ray.length ? side
        : ray.length * parallel + Math.sqrt(ray.width ** 2 - (ray.length * normal) ** 2);
      // Smooth the junction where a rounded ray rises out of the same surface as the sphere.
      const blend = Math.max(0, .13 - Math.abs(radius - tip));
      radius = Math.max(radius, tip) + blend * blend / .52;
    }
    return { x, y, core, flare: radius - core };
  });
}

function solarPoint(out, { x, y, core, flare }, latitude, ring, phase) {
  const ripple = 1 + .20 * latitude * Math.sin(phase * 2.31 - 4.9 * latitude + 2.3 * x - 1.7 * y);
  const radius = ring * core * ripple + ring ** 5 * flare;
  const twist = latitude * (.17 * Math.sin(phase * 1.16 + 2.3 * x - 1.4 * y) + .12 * Math.sin(phase * 1.84 - 4.1 * latitude));
  out[0] = radius * (x - y * twist);
  out[1] = radius * (y + x * twist);
  out[2] = .715 * latitude + .094 * ring * Math.sin(3 * x - 3.1 * y + phase * 1.35);
}

export function drawSun({ trace, face, count, phase, opening, step, energy }) {
  const profile = solarProfile(phase, opening, energy, step === 3 ? 2 : 1);
  const sweep = profile.length;
  const equator = profile.map(({ x, y, core, flare }) => [x * (core + flare), y * (core + flare)]);
  face(equator, 1, -.025, .53);

  const bands = 2 * Math.ceil(count * .22) + 1;
  for (let band = 0; band < bands; band++) {
    const latitude = (band / (bands - 1) - .5) * 1.93;
    const ring = Math.sqrt(1 - latitude ** 2);
    const stride = ring > .82 ? 1 : 2;
    trace(sweep / stride + 1, (point, index) => {
      solarPoint(point, profile[(index * stride) % sweep], latitude, ring, phase);
    }, band === (bands - 1) / 2 || band === bands - 3);
  }

  const crossing = Math.max(3, Math.round(count * .18));
  const tilt = -.61 + .27 * Math.sin(phase * 1.38);
  const ct = Math.cos(tilt), st = Math.sin(tilt);
  for (let band = 0; band < crossing; band++) {
    const lane = ((band + .43) / crossing - .5) * 1.42;
    const pathRadius = Math.sqrt(1 - lane * lane);
    trace(85, (point, index) => {
      const angle = index / 84 * turn;
      const u = pathRadius * Math.cos(angle);
      const x = u * ct - lane * st, y = u * st + lane * ct;
      const ring = Math.hypot(x, y);
      const revolutions = (Math.atan2(y, x) - phase * .114) / turn;
      const section = (revolutions - Math.floor(revolutions)) * sweep;
      const first = Math.floor(section);
      const alpha = section - first;
      const a = profile[first % sweep], b = profile[(first + 1) % sweep];
      solarPoint(point, {
        x: x / ring, y: y / ring,
        core: a.core + (b.core - a.core) * alpha,
        flare: a.flare + (b.flare - a.flare) * alpha,
      }, pathRadius * Math.sin(angle), ring, phase);
    });
  }
}
