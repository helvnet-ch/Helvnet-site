export const origin = 'https://helvnet.ch';
export const contactEmail = 'contact@helvnet.ch';
export const contactPath = '/contact/';
export const projectPath = (slug) => `/projets/${slug}/`;

const atelierPaths = [
  '/services',
  '/creation-site-web',
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
  ['/realisations', '/#realisations'],
  ['/realisations/', '/#realisations'],
  ['/realisations.html', '/#realisations'],
  ['/contact.html', contactPath],
  ['/merci.html', contactPath],
  ['/realisations/nh-installation', projectPath('nh-installation')],
  ['/realisations/nh-installation/', projectPath('nh-installation')],
  ['/realisations/kebab-paradise', projectPath('kebab-paradise')],
  ['/realisations/kebab-paradise/', projectPath('kebab-paradise')],
]);
