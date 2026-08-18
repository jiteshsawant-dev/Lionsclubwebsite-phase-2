/* Minimal static file server for local preview of the Lions Club site.
   Run via start-server.bat (double-click) or: node server.js
   PDF viewing (bulletin page) needs http:// — it will NOT work from file://. */
var http = require('http');
var fs = require('fs');
var path = require('path');
var url = require('url');

var root = __dirname;
var port = process.env.PORT || 5501;

var mime = {
  html: 'text/html', css: 'text/css', js: 'application/javascript', mjs: 'application/javascript',
  json: 'application/json', png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg',
  gif: 'image/gif', webp: 'image/webp', avif: 'image/avif', jfif: 'image/jpeg',
  svg: 'image/svg+xml', ico: 'image/x-icon', woff2: 'font/woff2', woff: 'font/woff',
  ttf: 'font/ttf', pdf: 'application/pdf'
};

http.createServer(function (req, res) {
  var p = decodeURIComponent(url.parse(req.url).pathname);
  if (p === '/') p = '/index.html';
  var file = path.join(root, p);
  var ext = path.extname(file).slice(1).toLowerCase();
  fs.readFile(file, function (err, data) {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found: ' + p);
    } else {
      res.writeHead(200, { 'Content-Type': mime[ext] || 'application/octet-stream' });
      res.end(data);
    }
  });
}).listen(port, function () {
  console.log('');
  console.log('  Lions Club site is being served at:');
  console.log('    http://localhost:' + port + '/');
  console.log('    http://localhost:' + port + '/news.html#bulletin');
  console.log('');
  console.log('  Keep this window open. Close it to stop the server.');
});
