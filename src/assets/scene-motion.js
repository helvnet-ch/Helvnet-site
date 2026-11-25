export function smoothStep(start, end, value) {
  const t = Math.max(0, Math.min(1, (value - start) / (end - start)));
  return t * t * (3 - 2 * t);
}

export function settleAxis(value, speed, target, response, seconds) {
  const distance = value - target;
  const decay = Math.exp(-response * seconds);
  const impulse = speed + response * distance;
  const position = target + (distance + impulse * seconds) * decay;
  const velocity = (speed - response * impulse * seconds) * decay;

  if (Math.abs(position - target) < .0006 && Math.abs(velocity) < .009) return [target, 0];
  return [position, velocity];
}

export function glideAxis(value, speed, target, duration, elapsed) {
  if (elapsed >= duration) return [target, 0];
  const progress = elapsed / duration;
  const remaining = 1 - progress;
  const distance = target - value;
  const momentum = speed * duration;
  const acceleration = .22;
  const braking = .42;
  const travel = 1 - (acceleration + braking) * .5;
  const t = Math.min(1, progress / acceleration, remaining / braking);
  // Integrate a quintic speed ramp so velocity, acceleration and jerk fade at rest.
  const rampDistance = t ** 4 * (2.5 - 3 * t + t * t);
  const blend = (progress < acceleration ? acceleration * rampDistance
    : remaining < braking ? travel - braking * rampDistance : progress - acceleration * .5) / travel;
  const blendRate = t ** 3 * (10 - 15 * t + 6 * t * t) / travel;
  // Keep the incoming momentum through a brief reversal without interrupting the glide.
  const carryTime = Math.min(.34, (.40 + .34 * Math.abs(distance)) / Math.max(.001, Math.abs(momentum)));
  const inherited = Math.min(1, progress / carryTime);
  const tail = 1 - inherited;
  const tangent = progress * tail ** 4 * (1 + 4 * inherited);
  const tangentRate = tail ** 3 * (1 + 3 * inherited - 24 * inherited ** 2);
  return [value + distance * blend + momentum * tangent, (distance * blendRate + momentum * tangentRate) / duration];
}

const roomPoses = {
  service: { desktop: [.756, .397, .185, .247, 218], mobile: [.5, .237, .286, .21, 138], visibility: 1 },
  demo: { desktop: [.827, .153, .087, .105, 99], mobile: [.72, .125, .153, .092, 72], visibility: .83 },
  capabilities: { desktop: [.824, .188, .101, .112, 118], mobile: [.73, .144, .157, .099, 79], visibility: .73 },
  atelier: { desktop: [.79, .37, .151, .20, 178], mobile: [.61, .25, .219, .184, 120], visibility: .5 },
  quote: { desktop: [.79, .31, .134, .17, 156], mobile: [.71, .22, .18, .149, 94], visibility: .2 },
};

export function stagePose(kind, { width, height, mobile }, gallery) {
  if (kind === 'gallery') {
    const area = Math.min(gallery?.height || height * .60, 608);
    return {
      x: width * .5,
      y: gallery ? gallery.top + gallery.height * (mobile ? .50 : .47) : height * .37,
      radius: Math.min(width * (mobile ? .267 : .22), area * (mobile ? .325 : .346), 202),
      orbit: 1,
      visibility: 1,
    };
  }

  const room = roomPoses[kind];
  const [x, y, breadth, depth, maxRadius] = mobile ? room.mobile : room.desktop;
  return { x: x * width, y: y * height, radius: Math.min(width * breadth, height * depth, maxRadius), orbit: 0, visibility: room.visibility };
}

const mix = (from, to, amount) => from + (to - from) * amount;
const atRest = { position: 0 };
const quarter = Math.PI / 2;
const arcSteps = 48;
const quarterPoints = Array.from({ length: arcSteps + 1 }, (_, index) => {
  const angle = index / arcSteps * quarter;
  return [Math.sin(angle), Math.cos(angle)];
});
let track;

function orbitTrack(aspect) {
  if (track?.aspect === aspect) return track;
  const distances = [0];
  for (let index = 1; index <= arcSteps; index++) {
    const [x, y] = quarterPoints[index];
    const [px, py] = quarterPoints[index - 1];
    distances.push(distances[index - 1] + Math.hypot(x - px, (y - py) * aspect));
  }
  track = { aspect, distances };
  return track;
}

function orbitAngle(revolutions, { distances }) {
  const phase = (revolutions < 0 ? revolutions + 1 : revolutions) * 4;
  const quadrant = Math.floor(phase);
  const reverse = quadrant % 2 === 1;
  const fraction = phase - quadrant;
  const distance = distances[arcSteps] * (reverse ? 1 - fraction : fraction);
  let lower = 0, upper = arcSteps;
  while (upper - lower > 1) {
    const middle = (lower + upper) >> 1;
    if (distances[middle] < distance) lower = middle;
    else upper = middle;
  }
  const weight = (distance - distances[lower]) / (distances[upper] - distances[lower]);
  const angle = (lower + weight) / arcSteps * quarter;
  return quadrant * quarter + (reverse ? quarter - angle : angle);
}

export function sculpturePoses({ x, y, radius, position, orbit, visibility }, width, count, velocity = atRest) {
  const gallery = Math.max(0, Math.min(1, orbit));
  const mobile = width <= 688;
  const travel = smoothStep(.025, 1.34, Math.abs(velocity.position)) * gallery ** 4;
  const direction = -Math.sign(velocity.position);
  const reach = Math.min(width * (mobile ? .36 : .354), 482);
  const rise = radius * (mobile ? .458 : .476);
  const metric = gallery > 0 && orbitTrack(Math.max(.08, rise / Math.max(1, reach)));
  const spacing = 2 * Math.PI / count;
  return Array.from({ length: count }, (_, index) => {
    const offset = ((index - position + count / 2) % count + count) % count - count / 2;
    const angle = metric ? orbitAngle(offset / count, metric) : offset * spacing;
    const sine = Math.sin(angle);
    const cosine = Math.cos(angle);
    const front = .5 + .5 * Math.cos(offset * spacing);
    const alone = 1 - Math.min(1, Math.abs(offset));
    const participation = alone * alone * (3 - 2 * alone);
    const size = radius * mix(1, .45 + .55 * front ** 1.66, gallery);
    return {
      index, front, travel, size,
      x: x + sine * reach * gallery,
      y: y - rise * (1 - cosine) * gallery,
      heading: Math.atan2(-direction * rise * sine, direction * reach * cosine),
      opacity: visibility * mix(participation, .75 + .25 * front, gallery),
    };
  }).sort((a, b) => a.front - b.front);
}
