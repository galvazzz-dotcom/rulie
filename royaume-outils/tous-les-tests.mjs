/* Lancer tous les tests du Royaume des Dindies, l'un après l'autre, puis afficher un résumé.
   Usage : node royaume-outils/tous-les-tests.mjs [options]
     --etapes=1,2,3,4,5,6,7,8,9  les tests à lancer (par défaut : tous)
     --partie                  la partie complète : les étapes 2 à 8 jouées l'une après l'autre sur UNE seule partie
                               (chaque test reprend la vraie sauvegarde du précédent ; voir partie.mjs), au premier format ;
                               on s'arrête au premier échec
     --depuis=5                avec --partie : reprendre à l'étape 5, avec la sauvegarde laissée par l'étape 4
     --formats=tel             les formats pour les tests 2 à 8 : tel, paysage, tablette, ordi, ou « tous »
                               (par défaut : tel ; le test 1 essaie déjà les 4 formats tout seul)
     --adresse=URL             tester un site déjà en ligne, par exemple https://galvazzz-dotcom.github.io/rulie
                               (sans cette option, docs/ est servi par un petit serveur local)
     --three=chemin            avec le serveur local : utiliser ce fichier three.module.js au lieu du CDN
                               (pour tester sans Internet)
     --captures=dossier        où ranger les captures d'écran (par défaut : captures-tests)
     --sans-express            ne pas commencer par le test express (test-express.mjs, 1 à 2 minutes)
   Il faut Playwright (npm i playwright) ; CHROMIUM=/chemin/vers/chromium si besoin.
   On commence toujours par le test express (syntaxe, imports, les 3 pages) ; puis chaque test joue son chapitre de bout en bout :
   la série complète prend plusieurs heures (sans carte graphique, environ 1 h 20 par format). */
import { spawn } from 'child_process';
import { mkdir, rm } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { serveur } from './serveur.mjs';

const ICI = dirname(fileURLToPath(import.meta.url));
const opt = Object.fromEntries(process.argv.slice(2).map(a => { const m = /^--([^=]+)=?(.*)$/.exec(a); return m ? [m[1], m[2]] : [a, '']; }));
const PARTIE = 'partie' in opt;
const ETAPES = PARTIE ? [2, 3, 4, 5, 6, 7, 8].filter(n => n >= (+opt.depuis || 2)) : (opt.etapes || '1,2,3,4,5,6,7,8,9').split(',').map(Number);
const FORMATS = { tel: '390,844,1', paysage: '844,390,1', tablette: '820,1180,1', ordi: '1280,800,0' };
const formats = (opt.formats === 'tous' ? Object.keys(FORMATS) : (opt.formats || 'tel').split(',')).slice(0, PARTIE ? 1 : 9);
for (const f of formats) if (!FORMATS[f]) { console.error(`format inconnu : ${f} (tel, paysage, tablette, ordi)`); process.exit(2); }
const CAPTURES = opt.captures || 'captures-tests';

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

const { S, adresse } = opt.adresse ? { S: null, adresse: opt.adresse.replace(/\/$/, '') } : await serveur({ three: opt.three });
console.log(`Royaume des Dindies : les tests, sur ${adresse}/royaume/${S ? (opt.three ? ' (serveur local, three.js local)' : ' (serveur local)') : ''}`);
const resultats = [];
const J = `${adresse}/royaume/index.html`;
/* d'abord le test express (1 à 2 minutes) : s'il trouve une erreur, inutile de jouer des heures */
if (!('sans-express' in opt)) {
  const X = await lancer('le test express · syntaxe, imports, les 3 pages (téléphone et ordinateur)', 'test-express.mjs', [adresse]);
  if (!X.ok) { console.log('\n❌ le test express a trouvé un problème : on s’arrête là (corrige-le, puis relance)'); S && S.close(); process.exit(1); }
  console.log(`✅ test express (${Math.round(X.duree)} s)`);
}
if (ETAPES.includes(1)) resultats.push(await lancer('étape 1 · le Grand Défilé (4 formats)', 'test-etape1.mjs', [`${adresse}/royaume/defile.html`, `${CAPTURES}/etape1`]));
/* la partie complète : une seule sauvegarde, qui passe d'un test à l'autre */
if (PARTIE) { await mkdir(CAPTURES, { recursive: true }); process.env.PARTIE = join(CAPTURES, 'partie.json'); if (!opt.depuis) await rm(process.env.PARTIE, { force: true }); console.log(`la partie complète, d'un seul tenant (sauvegarde : ${process.env.PARTIE})`); }
const fini = () => PARTIE && resultats.length && !resultats[resultats.length - 1].ok;
for (const f of formats) {
  if (ETAPES.includes(2)) resultats.push(await lancer(`étape 2 · le Domaine, chapitre 1 (${f})`, 'test-etape2.mjs', [J, 'crachin', FORMATS[f], `${CAPTURES}/etape2-${f}`]));
  if (fini()) break;
  if (ETAPES.includes(3)) resultats.push(await lancer(`étape 3 · l’expédition, chapitre 2 (${f})`, 'test-etape3.mjs', [J, FORMATS[f], `${CAPTURES}/etape3-${f}`]));
  if (fini()) break;
  if (ETAPES.includes(4)) resultats.push(await lancer(`étape 4 · l’élevage, chapitre 3 (${f})`, 'test-etape4.mjs', [J, FORMATS[f], `${CAPTURES}/etape4-${f}`]));
  if (fini()) break;
  if (ETAPES.includes(5)) resultats.push(await lancer(`étape 5 · le Dindodrome, chapitre 4 (${f})`, 'test-etape5.mjs', [J, FORMATS[f], `${CAPTURES}/etape5-${f}`]));
  if (fini()) break;
  if (ETAPES.includes(6)) resultats.push(await lancer(`étape 6 · la production, les quêtes du Domaine (${f})`, 'test-etape6.mjs', [J, FORMATS[f], `${CAPTURES}/etape6-${f}`]));
  if (fini()) break;
  if (ETAPES.includes(7)) resultats.push(await lancer(`étape 7 · le monde entier, chapitres 5 à 7 (${f})`, 'test-etape7.mjs', [J, FORMATS[f], `${CAPTURES}/etape7-${f}`]));
  if (fini()) break;
  if (ETAPES.includes(8)) resultats.push(await lancer(`étape 8 · la Ligue, la fin, l’après-histoire (${f})`, 'test-etape8.mjs', [J, FORMATS[f], `${CAPTURES}/etape8-${f}`]));
  if (ETAPES.includes(9)) resultats.push(await lancer(`étape 9 · la version 1.0 : cris, musiques, doubles, astuces, confort (${f})`, 'test-etape9.mjs', [J, FORMATS[f], `${CAPTURES}/etape9-${f}`]));
}
S && S.close();
console.log('\n══════════ Résumé ══════════');
for (const r of resultats) console.log(`${r.ok ? '✅' : '❌'} ${r.nom} — ${Math.round(r.duree)} s${r.ok ? '' : ` (${r.echecs || 1} échec${r.echecs > 1 ? 's' : ''})`}`);
const ko = resultats.filter(r => !r.ok).length;
console.log(ko ? `\n❌ ${ko} test${ko > 1 ? 's' : ''} sur ${resultats.length} en échec` : `\n✅ les ${resultats.length} tests passent (${Math.round(resultats.reduce((a, r) => a + r.duree, 0) / 60)} min)`);
process.exit(ko ? 1 : 0);
