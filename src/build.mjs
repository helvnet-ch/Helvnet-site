import { copyFile, lstat, mkdir, mkdtemp, realpath, rename, rm, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { contactPath, origin, redirects } from './config.mjs';
import { experiencePage, layout } from './pages.mjs';
import { offerings } from './offerings.mjs';

const root = await realpath(fileURLToPath(new URL('../', import.meta.url)));
const sourceAssets = join(root, 'src', 'assets');
const output = join(root, 'dist');
const staging = await mkdtemp(join(root, '.helvnet-build-'));

const assets = [
  'styles.css', 'navigation.js', 'experience.js', 'scene-motion.js', 'energy-orb.js', 'examples.js', 'site.js',
  'logo.png', 'logo-320.png', 'favicon.png',
  'fonts/instrument-sans.woff2', 'fonts/OFL-instrument-sans.txt',
  'partage/helvnet.jpg',
];

const pages = [
  {
    path: '/', title: 'Helvnet — Sites web, applications et intégrations IA',
    description: 'Diego Vicente développe des sites web, des applications et des intégrations IA sur mesure en Suisse romande.',
    home: true,
  },
  ...offerings.map((offer) => ({
    path: offer.path, title: `${offer.name} sur mesure — Helvnet`, description: offer.summary,
    offer: offer.id,
  })),
  {
    path: contactPath, title: 'Demander un devis — Helvnet',
    description: 'Décrivez votre projet web, votre application ou votre besoin d’intégration IA à Diego Vicente pour un devis sur mesure.',
  },
];

async function removeGeneratedDirectory(directory) {
  const status = await lstat(directory).catch((error) => {
    if (error.code !== 'ENOENT') throw error;
    return null;
  });
  if (!status) return;
  const physical = await realpath(directory);
  if (!status.isDirectory() || status.isSymbolicLink() || dirname(physical) !== root) {
    throw new Error(`Répertoire généré inattendu : ${directory}`);
  }
  await rm(directory, { recursive: true });
}

try {
  for (const name of assets) {
    const file = join(staging, 'assets', name);
    await mkdir(dirname(file), { recursive: true });
    await copyFile(join(sourceAssets, name), file);
  }

  for (const page of pages) {
    const directory = resolve(staging, `.${page.path}`);
    await mkdir(directory, { recursive: true });
    await writeFile(join(directory, 'index.html'), layout(page, experiencePage(page)));
  }

  const notFound = { path: '/404.html', title: 'Page introuvable — Helvnet', description: 'Retrouvez les trois services Helvnet.', noindex: true };
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages.map((page) => `  <url><loc>${origin}${page.path}</loc></url>`).join('\n')}\n</urlset>\n`;
  const redirectLines = [...redirects].map(([from, to]) => `${from} ${to} 301`);
  await Promise.all([
    writeFile(join(staging, '404.html'), layout(notFound, '<main class="shell not-found" id="contenu" tabindex="-1"><h1 class="display-heading">Page introuvable</h1><p>Retrouvez les services de l’atelier Helvnet.</p><a class="text-link" href="/">Revenir à l’accueil</a></main>')),
    writeFile(join(staging, '_redirects'), `https://www.helvnet.ch/* ${origin}/:splat 301!\n${redirectLines.join('\n')}\n`),
    writeFile(join(staging, 'sitemap.xml'), sitemap),
    writeFile(join(staging, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`),
  ]);
  await removeGeneratedDirectory(output);
  await rename(staging, output);
} finally {
  await removeGeneratedDirectory(staging);
}

console.log(`${pages.length} pages Helvnet générées dans dist.`);
