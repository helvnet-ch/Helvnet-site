export function settleAxis(value, speed, target, response, seconds) {
  const distance = value - target;
  const decay = Math.exp(-response * seconds);
  const impulse = speed + response * distance;
  const position = target + (distance + impulse * seconds) * decay;
  const velocity = (speed - response * impulse * seconds) * decay;

  if (Math.abs(position - target) < .0006 && Math.abs(velocity) < .009) return [target, 0];
  return [position, velocity];
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
const atRest = { x: 0, y: 0, radius: 0, position: 0, orbit: 0 };

export function sculpturePoses({ x, y, radius, position, orbit, visibility }, width, count, velocity = atRest) {
  const gallery = Math.max(0, Math.min(1, orbit));
  const orbitSpeed = gallery === orbit ? velocity.orbit : 0;
  const mobile = width <= 688;
  const reach = Math.min(width * (mobile ? .368 : .325), 433);
  const rise = mobile ? .91 : .76;
  const spacing = 2 * Math.PI / count;
  const angularSpeed = -velocity.position * spacing;
  return Array.from({ length: count }, (_, index) => {
    const offset = ((index - position + count / 2) % count + count) % count - count / 2;
    const angle = offset * spacing;
    const sine = Math.sin(angle);
    const cosine = Math.cos(angle);
    const front = .5 + .5 * cosine;
    const depth = 1 - front;
    const alone = 1 - Math.min(1, Math.abs(offset));
    const participation = alone * alone * (3 - 2 * alone);
    const size = radius * mix(1, .475 + .525 * front ** 1.66, gallery);
    return {
      index, front, size,
      x: x + sine * reach * gallery,
      y: y - radius * rise * depth * gallery,
      vx: velocity.x + reach * (cosine * angularSpeed * gallery + sine * orbitSpeed),
      vy: velocity.y - rise * ((velocity.radius * gallery + radius * orbitSpeed) * depth +
        radius * gallery * .5 * sine * angularSpeed),
      opacity: visibility * mix(participation, .75 + .25 * front, gallery),
    };
  }).sort((a, b) => a.front - b.front);
}
