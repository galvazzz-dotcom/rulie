/* Le petit serveur local des tests : il sert docs/ (le site, avec le jeu dans docs/royaume/).
   three : un fichier three.module.js à servir à la place du CDN (pour tester sans Internet). */
import { createServer } from 'http';
import { readFile, stat } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join, extname, normalize } from 'path';

export const DOCS = join(dirname(fileURLToPath(import.meta.url)), '..', 'docs');
const CDN = 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json',
  '.mp3': 'audio/mpeg', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.mp4': 'video/mp4', '.ico': 'image/x-icon', '.md': 'text/markdown; charset=utf-8' };

export async function serveur({ three = '' } = {}) {
  const S = createServer(async (req, res) => {
    try {
      const chemin = decodeURIComponent(new URL(req.url, 'http://x').pathname);
      if (three && chemin === '/three.module.js') { res.writeHead(200, { 'Content-Type': TYPES['.js'] }); res.end(await readFile(three)); return; }
      let f = normalize(join(DOCS, chemin)); if (!f.startsWith(DOCS)) { res.writeHead(403); res.end(); return; }
      if ((await stat(f)).isDirectory()) f = join(f, 'index.html');
      let corps = await readFile(f);
      if (three && extname(f) === '.html') corps = Buffer.from(corps.toString().replaceAll(CDN, '/three.module.js'));
      res.writeHead(200, { 'Content-Type': TYPES[extname(f)] || 'application/octet-stream' }); res.end(corps);
    } catch { res.writeHead(404); res.end(); }
  });
  await new Promise(r => S.listen(0, '127.0.0.1', r));
  return { S, adresse: `http://127.0.0.1:${S.address().port}` };
}
