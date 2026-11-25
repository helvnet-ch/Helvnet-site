import { copyFile, cp, lstat, mkdir, mkdtemp, realpath, rename, rm, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { origin, pages, redirects } from './config.mjs';
import { experiencePage, layout, notFoundPage } from './pages.mjs';

const root = await realpath(fileURLToPath(new URL('../', import.meta.url)));
const sourceAssets = join(root, 'src', 'assets');
const output = join(root, 'dist');
const staging = await mkdtemp(join(root, '.helvnet-build-'));

const assets = [
  'styles.css', 'navigation.js', 'experience.js', 'scene-motion.js', 'energy-orb.js', 'sculpture-shapes.js',
  'examples.js', 'site.js',
  'logo.png', 'logo-320.png', 'logo-square.png', 'favicon.png',
  'partage/helvnet.jpg',
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

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages.map((page) => `  <url><loc>${origin}${page.path}</loc></url>`).join('\n')}\n</urlset>\n`;
  const redirectLines = [...redirects]
    .filter(([from]) => !from.endsWith('/index.html'))
    .map(([from, to]) => `${from} ${to} 301`);
  await Promise.all([
    writeFile(join(staging, '404.html'), notFoundPage()),
    writeFile(join(staging, '_redirects'), `https://www.helvnet.ch/* ${origin}/:splat 301!\n${redirectLines.join('\n')}\n`),
    writeFile(join(staging, 'sitemap.xml'), sitemap),
    writeFile(join(staging, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`),
  ]);
  await removeGeneratedDirectory(output);
  try {
    await rename(staging, output);
  } catch (error) {
    if (process.platform !== 'win32' || error.code !== 'EPERM') throw error;
    await mkdir(output);
    try {
      await cp(staging, output, { recursive: true, force: false, errorOnExist: true });
    } catch (copyError) {
      await removeGeneratedDirectory(output);
      throw copyError;
    }
  }
} finally {
  await removeGeneratedDirectory(staging);
}

console.log(`${pages.length} pages Helvnet générées dans dist.`);
