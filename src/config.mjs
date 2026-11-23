export const origin = 'https://helvnet.ch';
export const contactEmail = 'contact@helvnet.ch';
export const contactPath = '/contact/';

const atelierPaths = [
  '/reseaux-sociaux',
  '/identite-visuelle',
  '/photo-video',
  '/a-propos',
  '/approche',
];

export const redirects = new Map([
  ...atelierPaths.flatMap((path) => [
    [path, '/#atelier'],
    [`${path}/`, '/#atelier'],
    [`${path}.html`, '/#atelier'],
  ]),
  ...['/services', '/realisations'].flatMap((path) => [[path, '/#metiers'], [`${path}/`, '/#metiers'], [`${path}.html`, '/#metiers']]),
  ...['/creation-site-web', '/realisations/nh-installation', '/realisations/kebab-paradise', '/projets/nh-installation', '/projets/kebab-paradise'].flatMap((path) => [
    [path, '/developpement-web/'], [`${path}/`, '/developpement-web/'], [`${path}.html`, '/developpement-web/'],
  ]),
  ['/contact.html', contactPath],
  ['/merci.html', contactPath],
]);
