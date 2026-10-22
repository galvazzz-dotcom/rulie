/* Lancer tous les tests du Royaume des Dindies, l'un après l'autre, puis afficher un résumé.
   Usage : node royaume-outils/tous-les-tests.mjs [options]
     --etapes=1,2,3,4,5,6      les tests à lancer (par défaut : tous)
     --formats=tel             les formats pour les tests 2 à 6 : tel, paysage, tablette, ordi, ou « tous »
                               (par défaut : tel ; le test 1 essaie déjà les 4 formats tout seul)
     --adresse=URL             tester un site déjà en ligne, par exemple https://galvazzz-dotcom.github.io/rulie
                               (sans cette option, docs/ est servi par un petit serveur local)
     --three=chemin            avec le serveur local : utiliser ce fichier three.module.js au lieu du CDN
                               (pour tester sans Internet)
     --captures=dossier        où ranger les captures d'écran (par défaut : captures-tests)
   Il faut Playwright (npm i playwright) ; CHROMIUM=/chemin/vers/chromium si besoin.
   Chaque test joue son chapitre de bout en bout : la série complète prend environ une heure. */
import { spawn } from 'child_process';
import { createServer } from 'http';
import { readFile, stat } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join, extname, normalize } from 'path';

const ICI = dirname(fileURLToPath(import.meta.url)), DOCS = join(ICI, '..', 'docs');
const opt = Object.fromEntries(process.argv.slice(2).map(a => { const m = /^--([^=]+)=?(.*)$/.exec(a); return m ? [m[1], m[2]] : [a, '']; }));
const ETAPES = (opt.etapes || '1,2,3,4,5,6').split(',').map(Number);
const FORMATS = { tel: '390,844,1', paysage: '844,390,1', tablette: '820,1180,1', ordi: '1280,800,0' };
const formats = opt.formats === 'tous' ? Object.keys(FORMATS) : (opt.formats || 'tel').split(',');
for (const f of formats) if (!FORMATS[f]) { console.error(`format inconnu : ${f} (tel, paysage, tablette, ordi)`); process.exit(2); }
const CAPTURES = opt.captures || 'captures-tests';
const CDN = 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

/* ── le petit serveur local (docs/, avec three.module.js en local si on le demande) ── */
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json',
  '.mp3': 'audio/mpeg', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.mp4': 'video/mp4', '.ico': 'image/x-icon', '.md': 'text/markdown; charset=utf-8' };
async function serveur() {
  const S = createServer(async (req, res) => {
    try {
      const chemin = decodeURIComponent(new URL(req.url, 'http://x').pathname);
      if (opt.three && chemin === '/three.module.js') { res.writeHead(200, { 'Content-Type': TYPES['.js'] }); res.end(await readFile(opt.three)); return; }
      let f = normalize(join(DOCS, chemin)); if (!f.startsWith(DOCS)) { res.writeHead(403); res.end(); return; }
      if ((await stat(f)).isDirectory()) f = join(f, 'index.html');
      let corps = await readFile(f);
      if (opt.three && extname(f) === '.html') corps = Buffer.from(corps.toString().replaceAll(CDN, '/three.module.js'));
      res.writeHead(200, { 'Content-Type': TYPES[extname(f)] || 'application/octet-stream' }); res.end(corps);
    } catch { res.writeHead(404); res.end(); }
  });
  await new Promise(r => S.listen(0, '127.0.0.1', r));
  return { S, adresse: `http://127.0.0.1:${S.address().port}` };
}

/* ── lancer un test, en montrant ses lignes ✅ / ❌ ── */
function lancer(nom, fichier, args) {
  return new Promise(resoudre => {
    const t0 = Date.now(), lignes = [];
    console.log(`\n▶ ${nom}`);
    const P = spawn(process.execPath, [join(ICI, fichier), ...args], { stdio: ['ignore', 'pipe', 'pipe'], env: process.env });
    const lire = flux => { let reste = ''; flux.on('data', b => { const L = (reste + b).split('\n'); reste = L.pop(); for (const l of L) { lignes.push(l); if (/✅|❌|^\[|Error|erreur/i.test(l)) console.log('   ' + l); } }); };
    lire(P.stdout); lire(P.stderr);
    P.on('close', code => resoudre({ nom, ok: code === 0, duree: (Date.now() - t0) / 1000, echecs: lignes.filter(l => l.startsWith('❌')).length }));
  });
}

const { S, adresse } = opt.adresse ? { S: null, adresse: opt.adresse.replace(/\/$/, '') } : await serveur();
console.log(`Royaume des Dindies : les tests, sur ${adresse}/royaume/${S ? (opt.three ? ' (serveur local, three.js local)' : ' (serveur local)') : ''}`);
const resultats = [];
const J = `${adresse}/royaume/index.html`;
if (ETAPES.includes(1)) resultats.push(await lancer('étape 1 · le Grand Défilé (4 formats)', 'test-etape1.mjs', [`${adresse}/royaume/defile.html`, `${CAPTURES}/etape1`]));
for (const f of formats) {
  if (ETAPES.includes(2)) resultats.push(await lancer(`étape 2 · le Domaine, chapitre 1 (${f})`, 'test-etape2.mjs', [J, 'crachin', FORMATS[f], `${CAPTURES}/etape2-${f}`]));
  if (ETAPES.includes(3)) resultats.push(await lancer(`étape 3 · l’expédition, chapitre 2 (${f})`, 'test-etape3.mjs', [J, FORMATS[f], `${CAPTURES}/etape3-${f}`]));
  if (ETAPES.includes(4)) resultats.push(await lancer(`étape 4 · l’élevage, chapitre 3 (${f})`, 'test-etape4.mjs', [J, FORMATS[f], `${CAPTURES}/etape4-${f}`]));
  if (ETAPES.includes(5)) resultats.push(await lancer(`étape 5 · le Dindodrome, chapitre 4 (${f})`, 'test-etape5.mjs', [J, FORMATS[f], `${CAPTURES}/etape5-${f}`]));
  if (ETAPES.includes(6)) resultats.push(await lancer(`étape 6 · la production, les quêtes du Domaine (${f})`, 'test-etape6.mjs', [J, FORMATS[f], `${CAPTURES}/etape6-${f}`]));
}
S && S.close();
console.log('\n══════════ Résumé ══════════');
for (const r of resultats) console.log(`${r.ok ? '✅' : '❌'} ${r.nom} — ${Math.round(r.duree)} s${r.ok ? '' : ` (${r.echecs || 1} échec${r.echecs > 1 ? 's' : ''})`}`);
const ko = resultats.filter(r => !r.ok).length;
console.log(ko ? `\n❌ ${ko} test${ko > 1 ? 's' : ''} sur ${resultats.length} en échec` : `\n✅ les ${resultats.length} tests passent (${Math.round(resultats.reduce((a, r) => a + r.duree, 0) / 60)} min)`);
process.exit(ko ? 1 : 0);
