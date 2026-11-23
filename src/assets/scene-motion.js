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
      y: gallery ? gallery.top + gallery.height * (mobile ? .52 : .46) : height * .37,
      radius: Math.min(width * .30, area * (mobile ? .324 : .341), 192),
      orbit: 1,
      visibility: 1,
    };
  }

  const room = roomPoses[kind];
  const [x, y, breadth, depth, maxRadius] = mobile ? room.mobile : room.desktop;
  return { x: x * width, y: y * height, radius: Math.min(width * breadth, height * depth, maxRadius), orbit: 0, visibility: room.visibility };
}

export function floorHorizon({ y, radius }, height) {
  return Math.min(y + radius * .96, Math.max(height * .45, y + radius * .57));
}
