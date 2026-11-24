import { readFile } from 'node:fs/promises';
import { origin, pages, redirects } from '../src/config.mjs';

const [part, release] = process.argv.slice(2);

if (part === 'redirects') {
  for (const [from, to] of redirects) {
    const { pathname, hash } = new URL(to, origin);
    console.log(`location = ${from} { return 301 "${origin}${pathname}$is_args$args${hash}"; }`);
  }
} else if (part === 'site' && /^\/var\/www\/helvnet\/releases\/[a-f0-9]{40}$/.test(release)) {
  const template = await readFile(new URL('../deploy/nginx/helvnet.conf', import.meta.url), 'utf8');
  const locations = pages.map(({ path }) => `    location = ${path} { try_files ${path}index.html =404; }`);
  process.stdout.write(template
    .replace('@RELEASE_ROOT@', release)
    .replace('@CANONICAL_LOCATIONS@', locations.join('\n')));
} else {
  console.error('Usage : node scripts/nginx-config.mjs redirects | site /var/www/helvnet/releases/<révision Git>');
  process.exitCode = 1;
}
