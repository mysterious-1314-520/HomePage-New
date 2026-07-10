const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 4001;
const ADMIN_DIR = __dirname;
const API_HOST = process.env.API_HOST || '127.0.0.1';
const API_PORT = process.env.API_PORT || 4000;
const API_TARGET = { hostname: API_HOST, port: API_PORT };

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

function getFile(filePath) {
  try {
    const fullPath = path.join(ADMIN_DIR, filePath === '/' ? 'index.html' : filePath);
    const stat = fs.statSync(fullPath);
    if (stat.isFile()) {
      const ext = path.extname(fullPath).toLowerCase();
      return { content: fs.readFileSync(fullPath), mime: MIME[ext] || 'application/octet-stream' };
    }
    return null;
  } catch (e) {
    return null;
  }
}

function proxyApi(req, res) {
  const opt = {
    hostname: API_TARGET.hostname,
    port: API_TARGET.port,
    path: req.url,
    method: req.method,
    headers: { ...req.headers, host: `${API_HOST}:${API_PORT}` }
  };
  const pr = http.request(opt, (pRes) => {
    res.writeHead(pRes.statusCode, { 'content-type': pRes.headers['content-type'] || 'application/json' });
    pRes.pipe(res);
  });
  pr.on('error', () => { res.writeHead(502); res.end('Bad Gateway'); });
  req.pipe(pr);
}

const server = http.createServer((req, res) => {
  // API proxy
  if (req.url.startsWith('/api/')) {
    return proxyApi(req, res);
  }

  // Static file
  const file = getFile(req.url);
  if (file) {
    res.writeHead(200, { 'Content-Type': file.mime });
    return res.end(file.content);
  }

  // SPA fallback: serve index.html for any path without file extension
  if (!path.extname(req.url)) {
    const indexFile = getFile('/');
    if (indexFile) {
      res.writeHead(200, { 'Content-Type': indexFile.mime });
      return res.end(indexFile.content);
    }
  }

  res.writeHead(404);
  res.end('Not found');
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[Admin] http://0.0.0.0:${PORT}`);
});
