import { offerings } from './offerings.mjs';

export const origin = 'https://helvnet.ch';
export const contactEmail = 'contact@helvnet.ch';
export const contactPath = '/contact/';
const webPath = offerings.find(({ id }) => id === 'web').path;

export const pages = [
  {
    path: '/', home: true,
    title: 'Sites web, applications et automatisation en Suisse romande | Helvnet',
    description: 'À Fribourg et en Suisse romande, Diego Vicente crée des sites web, développe des applications et automatise des tâches pour les PME. Sur devis.',
  },
  ...offerings.map(({ id, path, seoTitle, metaDescription }) => ({
    path, title: seoTitle, description: metaDescription, offer: id,
  })),
  {
    path: contactPath,
    title: 'Demander un devis pour votre projet informatique | Helvnet',
    description: 'Décrivez votre projet de site, d’application ou d’automatisation à Diego Vicente. Vous définissez ensemble le périmètre avant de recevoir un devis.',
  },
];

export const pagesByPath = new Map(pages.map((page) => [page.path, page]));

function legacyAliases(paths, destination) {
  return paths.flatMap((path) => ['', '/', '.html'].map((suffix) => [path + suffix, destination]));
}

export const redirects = new Map([
  ...legacyAliases(['/services', '/creation-site-web', '/approche'], webPath),
  ...legacyAliases(['/a-propos'], '/#atelier'),
  ['/contact.html', contactPath],
  ...pages.filter(({ path }) => path !== '/').map(({ path }) => [path.slice(0, -1), path]),
  ...pages.map(({ path }) => [`${path}index.html`, path]),
]);
