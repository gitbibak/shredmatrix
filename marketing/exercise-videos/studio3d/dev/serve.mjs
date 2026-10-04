// tiny static server rooted at exercise-videos/ (ES modules need http, not file://)
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.css': 'text/css' };
export function serve(port = 0) {
  return new Promise((res) => {
    const srv = http.createServer((req, rsp) => {
      const p = path.join(ROOT, decodeURIComponent(new URL(req.url, 'http://x').pathname));
      if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { rsp.writeHead(404); rsp.end(); return; }
      rsp.writeHead(200, { 'content-type': TYPES[path.extname(p)] || 'application/octet-stream', 'cache-control': 'no-store' });
      fs.createReadStream(p).pipe(rsp);
    });
    srv.listen(port, '127.0.0.1', () => res({ srv, base: `http://127.0.0.1:${srv.address().port}/${path.basename(path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'))}/` }));
  });
}
if (process.argv[1] === fileURLToPath(import.meta.url)) { const { base } = await serve(+process.argv[2] || 8765); console.log(base + 'player.html?ex=goblet_squat&play'); }
