import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const rootDirectory = path.resolve(scriptDirectory, '..', 'dist');
const port = Number(process.env.PORT || 4173);

const contentTypes = new Map([
  ['.css', 'text/css; charset=utf-8'],
  ['.html', 'text/html; charset=utf-8'],
  ['.ico', 'image/x-icon'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.png', 'image/png'],
  ['.svg', 'image/svg+xml'],
  ['.webp', 'image/webp']
]);

function safePath(urlPath) {
  const decodedPath = decodeURIComponent(urlPath.split('?')[0]);
  const requestedPath = decodedPath.endsWith('/')
    ? `${decodedPath}index.html`
    : decodedPath;
  const filePath = path.resolve(rootDirectory, `.${requestedPath}`);
  return filePath.startsWith(rootDirectory) ? filePath : null;
}

const server = http.createServer(async (request, response) => {
  let filePath = safePath(request.url || '/');

  if (!filePath) {
    response.writeHead(400);
    response.end('Bad request');
    return;
  }

  try {
    const fileStat = await stat(filePath);
    if (fileStat.isDirectory()) {
      filePath = path.join(filePath, 'index.html');
    }
    await stat(filePath);
  } catch {
    filePath = path.join(rootDirectory, '404.html');
    response.statusCode = 404;
  }

  response.setHeader(
    'Content-Type',
    contentTypes.get(path.extname(filePath)) || 'application/octet-stream'
  );
  response.setHeader('Cache-Control', 'no-store');
  createReadStream(filePath).pipe(response);
});

server.listen(port, '127.0.0.1', () => {
  console.log(`DAILY TEST LAB: http://localhost:${port}`);
});
