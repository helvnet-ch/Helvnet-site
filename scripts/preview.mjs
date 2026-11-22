import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { redirects } from '../src/config.mjs';

const root = fileURLToPath(new URL('../dist', import.meta.url));
const port = Number(process.env.PORT || 4173);
const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
};

const notFound = await readFile(join(root, '404.html'));

createServer(async (request, response) => {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.writeHead(405, { Allow: 'GET, HEAD' }).end();
    return;
  }

  let path;
  try {
    path = decodeURIComponent(new URL(request.url, 'http://127.0.0.1').pathname);
  } catch {
    response.writeHead(400).end();
    return;
  }

  if (redirects.has(path)) {
    response.writeHead(301, { Location: redirects.get(path) }).end();
    return;
  }

  const file = resolve(root, `.${extname(path) ? path : `${path}/index.html`}`);
  if (!file.startsWith(root + sep) || !types[extname(file)]) {
    response.writeHead(404, { 'Content-Type': types['.html'] }).end(request.method === 'HEAD' ? undefined : notFound);
    return;
  }

  try {
    const body = await readFile(file);
    response.writeHead(200, { 'Content-Type': types[extname(file)], 'Cache-Control': 'no-store' });
    response.end(request.method === 'HEAD' ? undefined : body);
  } catch (error) {
    const status = ['ENOENT', 'ENOTDIR'].includes(error.code) ? 404 : 500;
    response.writeHead(status, { 'Content-Type': types['.html'] }).end(request.method === 'HEAD' ? undefined : notFound);
  }
}).listen(port, '127.0.0.1', () => console.log(`Prévisualisation locale : http://127.0.0.1:${port}/`));
