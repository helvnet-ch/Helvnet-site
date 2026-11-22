const columns = 120;
const rows = 94;
const sole = 0.082;

function bell(x, y, cx, cy, sx, sy, angle = 0) {
  const dx = x - cx;
  const dy = y - cy;
  const u = Math.cos(angle) * dx + Math.sin(angle) * dy;
  const v = -Math.sin(angle) * dx + Math.cos(angle) * dy;
  return Math.exp(-0.5 * ((u / sx) ** 2 + (v / sy) ** 2));
}

function height(x, y) {
  const u = x + 0.049 * Math.sin(y * 9 + x * 5) + 0.035 * Math.sin(y * 19 - x * 9);
  const v = y + 0.043 * Math.sin(x * 10 - y * 6) + 0.025 * Math.sin(x * 18 + y * 15);
  return 1.03 * bell(u, v, -0.49, -0.18, 0.28, 0.22, -0.38)
    + 0.76 * bell(u, v, 0.48, -0.12, 0.28, 0.216, 0.58)
    + 0.21 * bell(x, y, -0.04, -0.04, 0.71, 0.23, 0.04)
    + 0.17 * bell(x, y, -0.57, 0.28, 0.47, 0.25, -0.52)
    + 0.105 * bell(x, y, 0.39, 0.42, 0.49, 0.19, 0.23);
}

const grid = Array.from({ length: rows + 1 }, (_, j) =>
  Array.from({ length: columns + 1 }, (_, i) => {
    const x = -1.60 + 3.2 * i / columns;
    const y = -1.10 + 2.2 * j / rows;
    return { x, y, h: height(x, y) };
  }));
const peak = Math.max(...grid.flat().map(({ h }) => h));

function project(x, y) {
  return [437 + 252 * x + 66 * y, 323 + 194 * y + 12 * x];
}

function linesAt(level) {
  const threshold = level * peak;
  const points = new Map();
  const neighbours = new Map();

  function connect(a, b) {
    for (const [key, next] of [[a, b], [b, a]]) {
      if (!neighbours.has(key)) neighbours.set(key, []);
      neighbours.get(key).push(next);
    }
  }

  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < columns; i++) {
      const corners = [grid[j][i], grid[j][i + 1], grid[j + 1][i + 1], grid[j + 1][i]];
      const above = corners.map(({ h }) => h >= threshold);
      const keys = [`h${i},${j}`, `v${i + 1},${j}`, `h${i},${j + 1}`, `v${i},${j}`];
      const intersections = [];
      for (let k = 0; k < 4; k++) {
        const other = (k + 1) % 4;
        if (above[k] === above[other]) continue;
        const key = keys[k];
        intersections.push(key);
        if (!points.has(key)) {
          const a = corners[k];
          const b = corners[other];
          const u = (threshold - a.h) / (b.h - a.h);
          points.set(key, project(a.x + u * (b.x - a.x), a.y + u * (b.y - a.y)));
        }
      }
      if (intersections.length === 2) connect(...intersections);
      if (intersections.length === 4) {
        const [a, b, c, d] = intersections;
        const centreAbove = corners.reduce((sum, point) => sum + point.h, 0) / 4 >= threshold;
        if (centreAbove === above[0]) { connect(a, b); connect(c, d); }
        else { connect(a, d); connect(b, c); }
      }
    }
  }

  const visited = new Set();
  const lines = [];
  for (const start of neighbours.keys()) {
    if (visited.has(start)) continue;
    const line = [];
    let previous;
    let key = start;
    while (key && !visited.has(key)) {
      visited.add(key);
      line.push(points.get(key));
      const next = neighbours.get(key).find((candidate) => candidate !== previous);
      previous = key;
      key = next;
    }
    if (key === start && line.length > 5) lines.push(line.filter((_, i) => i % 2 === 0));
  }
  return lines;
}

const fixed = (value) => Number(value.toFixed(1));

function path(points, close = false) {
  return `M${points.map(([x, y]) => `${fixed(x)} ${fixed(y)}`).join(' ')}${close ? 'Z' : ''}`;
}

const contours = Array.from({ length: 28 }, (_, index) => {
  const level = sole + index * 0.0334;
  return { level: Number(level.toFixed(4)), d: linesAt(level).map((line) => path(line, true)).join(' ') };
});

const trailAnchors = [[0.03, -0.08], [0.29, -0.025], [0.48, 0.125], [0.68, 0.21], [0.89, 0.29], [1.08, 0.37], [1.32, 0.42]];

function inkTrail() {
  const points = [];
  for (let i = 0; i < trailAnchors.length - 1; i++) {
    const before = trailAnchors[Math.max(i - 1, 0)];
    const from = trailAnchors[i];
    const to = trailAnchors[i + 1];
    const after = trailAnchors[Math.min(i + 2, trailAnchors.length - 1)];
    for (let sample = 0; sample < 10; sample++) {
      const t = sample / 10;
      points.push(from.map((p, axis) => {
        const a = before[axis];
        const q = to[axis];
        const b = after[axis];
        return (2 * p + (q - a) * t + (2 * a - 5 * p + 4 * q - b) * t ** 2 + (3 * p - a - 3 * q + b) * t ** 3) / 2;
      }));
    }
  }
  points.push(trailAnchors.at(-1));
  return points.map(([x, y]) => [...project(x, y).map(fixed), Number((height(x, y) / peak).toFixed(4))]);
}

const trail = inkTrail();
export const terrain = { width: 920, height: 540, sole, rise: 182, contours, trail, ink: path(trail) };
