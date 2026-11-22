import { cp, mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { contactPath, origin, projectPath, redirects } from './config.mjs';
import { contactPage, homePage, layout, projectPage, servicePage } from './pages.mjs';
import { printSvg } from './engraving.mjs';
import { offerings } from './offerings.mjs';
import { projects } from './projects.mjs';

const sourceAssets = fileURLToPath(new URL('./assets/', import.meta.url));
const output = fileURLToPath(new URL('../dist/', import.meta.url));

const pages = [
  {
    path: '/', title: 'Helvnet — Atelier informatique en Suisse romande',
    description: 'Je suis Diego. Je crée des sites web, des applications sur mesure et des automatisations IA en Suisse romande.',
    body: 'home', scripts: ['plotter'], render: homePage,
  },
  ...offerings.map((offer) => ({
    path: offer.path, title: `${offer.name} — Helvnet`, description: offer.description,
    offer: offer.id, body: `interior offer-page offer-page--${offer.id}`, scripts: ['demo'], render: () => servicePage(offer),
  })),
  ...projects.map((project) => ({
    path: projectPath(project.slug), title: `${project.name} — Réalisation Helvnet`,
    description: project.description, share: project.slug, shareAlt: `${project.name}, réalisation Helvnet`,
    body: `interior project-page project-page--${project.slug}`, render: () => projectPage(project),
  })),
  {
    path: contactPath, title: 'Demander un devis — Helvnet',
    description: 'Décrivez votre projet web, votre application ou votre besoin d’automatisation à Diego pour un devis sur mesure.',
    body: 'interior contact-page', scripts: ['site'], render: contactPage,
  },
];

await mkdir(output, { recursive: true });
await cp(sourceAssets, join(output, 'assets'), { recursive: true });

for (const page of pages) {
  const directory = join(output, page.path);
  await mkdir(directory, { recursive: true });
  await writeFile(join(directory, 'index.html'), layout(page, page.render()));
}

const notFound = { path: '/404.html', title: 'Page introuvable — Helvnet', description: 'Retrouvez l’atelier et les réalisations Helvnet.', noindex: true };
await writeFile(join(output, '404.html'), layout(notFound, `<main class="wrap not-found" id="contenu" tabindex="-1"><h1>Page introuvable</h1><p>Retrouvez la sélection de sites créés par l’atelier.</p><a class="button" href="/#realisations">Voir les réalisations</a></main>`));

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages.map((page) => `  <url><loc>${origin}${page.path}</loc></url>`).join('\n')}\n</urlset>\n`;
const redirectLines = [...redirects].map(([from, to]) => `${from} ${to} 301`);
await Promise.all([
  writeFile(join(output, 'assets', 'estampe-helvnet.svg'), printSvg()),
  writeFile(join(output, '_redirects'), `https://www.helvnet.ch/* ${origin}/:splat 301!\n${redirectLines.join('\n')}\n`),
  writeFile(join(output, 'sitemap.xml'), sitemap),
  writeFile(join(output, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`),
]);

console.log(`${pages.length} pages Helvnet générées dans dist.`);
