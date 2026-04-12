const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3222;

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.ttf': 'font/ttf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
};

const server = http.createServer((req, res) => {
  const url = req.url;
  const method = req.method;

  if (method !== 'GET') {
    res.writeHead(405, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Method Not Allowed');
    return;
  }

  // API routes
  if (url === '/api/questions') {
    serveJsonFile(res, 'json/question.json');
    return;
  }

  if (url === '/api/personalities') {
    serveJsonFile(res, 'json/personality.json');
    return;
  }

  if (url === '/api/announcement') {
    serveJsonFile(res, 'json/announcement.json');
    return;
  }

  // Static file routes
  let filePath;

  if (url === '/' || url === '/index.html') {
    filePath = 'public/index.html';
  } else if (url.startsWith('/css/')) {
    filePath = path.join('public', url);
  } else if (url.startsWith('/js/')) {
    filePath = path.join('public', url);
  } else if (url.startsWith('/icon/')) {
    // 去除查询字符串，只保留路径部分
    const urlWithoutQuery = url.split('?')[0];
    filePath = urlWithoutQuery.slice(1); // remove leading slash, icon is at root
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('404 Not Found');
    return;
  }

  serveStaticFile(res, filePath);
});

function serveJsonFile(res, filePath) {
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('500 Internal Server Error');
      return;
    }
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(data);
  });
}

function serveStaticFile(res, filePath) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('404 Not Found');
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('500 Internal Server Error');
      }
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
}

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
