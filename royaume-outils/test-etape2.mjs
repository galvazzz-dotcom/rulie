/* Tests automatiques de l'étape 2 (le Domaine et le chapitre 1), avec Playwright.
   Usage : node royaume-outils/test-etape2.mjs [adresse] [starter] [largeur,hauteur,mobile] [dossier des captures]
   - adresse par défaut : http://localhost:8765/royaume/index.html
     (servir une copie de docs/royaume où la carte d'import pointe vers un three.module.js local,
      ou utiliser directement https://galvazzz-dotcom.github.io/rulie/royaume/index.html)
   - starter : paquerette, crachin ou braise (crachin par défaut) ; format par défaut : 390,844,1 (téléphone)
   - CHROMIUM=/chemin/vers/chromium si Playwright ne trouve pas son navigateur.
   Joue tout le chapitre 1 en marchant (A*) d'un point à l'autre : profil, prologue, starter, planches,
   enclos, Clapier, boutique, nourrir, Musée, Grand Livre, montgolfière ; puis recharge la page et vérifie
   que la sauvegarde reprend au bon endroit. Fait des captures à chaque grand moment. */
import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
const URL = process.argv[2] || 'http://localhost:8765/royaume/index.html', STARTER = process.argv[3] || 'crachin';
const [w, h, mob] = (process.argv[4] || '390,844,1').split(',').map(Number), OUT = process.argv[5] || 'captures-etape2';
mkdirSync(OUT, { recursive: true });
const b = await chromium.launch({ executablePath: process.env.CHROMIUM || undefined, args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
const pg = await b.newPage({ viewport: { width: w, height: h }, isMobile: !!mob, hasTouch: !!mob });
const errs = []; pg.on('pageerror', e => errs.push(e.message + ' @ ' + (e.stack || '').split('\n').slice(1, 3).join(' | '))); pg.on('console', m => { if (m.type() === 'error' && !/CERT|404/.test(m.text())) errs.push('console: ' + m.text()); });
const etape = () => pg.evaluate(() => window.__jeu.etat().quete.etape);
const log = async t => console.log(`[${await etape().catch(() => '?')}] ${t}`);
const dialogues = async () => { for (let k = 0; k < 80; k++) { const encore = await pg.evaluate(() => { const d = document.querySelector('.dialogue'); if (!d) return false; d.dispatchEvent(new PointerEvent('pointerup')); return true; }); if (!encore) return; await pg.waitForTimeout(90); } };
const fermer = () => pg.evaluate(() => document.querySelectorAll('.voile .fermer').forEach(b => b.click()));
async function aller(id, marcher = true) {
  const pt = await pg.evaluate(id => { const I = window.__jeu.interactifs.find(i => i.id === id); return I ? [I.x, I.z] : null; }, id);
  if (!pt) throw new Error('pas d’interactif ' + id);
  if (marcher) {
    await pg.evaluate(([x, z]) => window.__jeu.allerVers(x, z), pt);
    /* on attend tant qu'elle avance (le rendu logiciel peut être très lent) ; bloquée = immobile 20 s */
    let avant = null, immobile = 0;
    while (await pg.evaluate(() => !!window.__jeu.chemin)) {
      const p = await pg.evaluate(() => [window.__jeu.moi.racine.position.x, window.__jeu.moi.racine.position.z]);
      immobile = avant && Math.hypot(p[0] - avant[0], p[1] - avant[1]) < .05 ? immobile + 1 : 0; avant = p;
      if (immobile >= 20) throw new Error(`bloqué en allant à ${id} : ${p}`);
      await pg.waitForTimeout(1000);
    }
  } else await pg.evaluate(([x, z]) => { const p = window.__jeu.moi.racine.position; p.x = x; p.z = z; }, pt);
  const p = await pg.evaluate(() => [window.__jeu.moi.racine.position.x, window.__jeu.moi.racine.position.z]);
  if (Math.hypot(p[0] - pt[0], p[1] - pt[1]) > 1.6) throw new Error(`arrivée trop loin de ${id} : ${p} vs ${pt}`);
}
const agir = id => pg.evaluate(id => { const I = window.__jeu.interactifs.find(i => i.id === id); window.__jeu.agir(I); }, id);
/* lit les dialogues qui arrivent (parfois après une animation) jusqu'à la bonne étape de quête */
const jusqua = async (e, ms = 180000) => { const fin = Date.now() + ms; while (await etape() !== e) { if (Date.now() > fin) throw new Error(`étape ${e} jamais atteinte (reste à ${await etape()})`); await dialogues(); await pg.waitForTimeout(500); } };
const attendreEtape = (e, ms = 120000) => pg.waitForFunction(e => window.__jeu.etat().quete.etape === e, e, { timeout: ms, polling: 150 });
const acheter = async id => { await pg.waitForSelector(`.acheter[data-id="${id}"]`, { timeout: 60000 }); await pg.evaluate(id => document.querySelector(`.acheter[data-id="${id}"]`).click(), id); await pg.waitForTimeout(300); };
const parlerMimi = async (achat, marcher = true) => { await aller('pnj-mimi', marcher); await agir('pnj-mimi'); await pg.waitForTimeout(400); await dialogues(); await pg.waitForTimeout(300); if (achat) await acheter(achat); };

await pg.goto(URL);
await pg.evaluate(() => localStorage.clear()); await pg.reload(); await pg.waitForTimeout(1200);
await pg.evaluate(() => document.getElementById('tNouveau').click()); await pg.fill('#tNom', 'Test');
await pg.evaluate(() => document.getElementById('tGo').click()); await pg.waitForTimeout(500);
await pg.evaluate(() => document.querySelector('#prologue .passer').dispatchEvent(new PointerEvent('pointerup', { bubbles: true })));
await pg.waitForFunction(() => window.__jeu, null, { timeout: 60000 });
await pg.evaluate(() => { window.__jeu.etat().reglages.heure = 'jour'; window.__jeu.appliquerReglages(); });
await pg.waitForTimeout(800);
const t0 = Date.now();
let echec = false;
try {
  /* Q1 */
  await aller('pnj-plumeau'); await log('arrivée au Professeur (à pied depuis le port)');
  await agir('pnj-plumeau'); await pg.waitForTimeout(300); await dialogues();
  await pg.waitForSelector('.starter', { timeout: 60000 }); await pg.waitForTimeout(400);
  await pg.screenshot({ path: `${OUT}/starter.png` });
  await pg.evaluate(s => document.querySelector(`.starter[data-id="${s}"]`).click(), STARTER); await pg.waitForTimeout(200);
  await pg.evaluate(() => document.getElementById('sOk').click()); await pg.waitForTimeout(500); await dialogues();
  await attendreEtape('planches'); await log('starter choisi : ' + STARTER);
  /* Q2 : les planches */
  for (const p of ['planche1', 'planche2', 'planche3']) { await aller('objet-' + p); await agir('objet-' + p); await pg.waitForTimeout(400); }
  await attendreEtape('reparer1'); await log('3 planches ramassées');
  const typeS = { paquerette: 'prairie', crachin: 'pluie', braise: 'feu' }[STARTER], type2 = typeS === 'prairie' ? 'pluie' : 'prairie';
  await aller('enclos-' + typeS); await agir('enclos-' + typeS); await attendreEtape('installer1'); await pg.waitForTimeout(800);
  await pg.screenshot({ path: `${OUT}/enclos_construit.png` });
  await agir('enclos-' + typeS); await pg.waitForSelector('.installer', { timeout: 60000 });
  await pg.evaluate(() => document.querySelector('.installer').click()); await attendreEtape('cadeau'); await fermer(); await log('starter installé dans son enclos');
  await pg.waitForTimeout(1500); await pg.screenshot({ path: `${OUT}/dindie_enclos.png` });
  /* Q3 : le Clapier */
  await aller('pnj-plumeau'); await agir('pnj-plumeau'); await pg.waitForTimeout(300); await dialogues(); await attendreEtape('clous');
  await parlerMimi('clous'); await attendreEtape('reparerClapier'); await pg.screenshot({ path: `${OUT}/boutique.png` }); await fermer(); await log('clous achetés');
  await aller('clapier'); await agir('clapier'); await attendreEtape('ranger'); await pg.waitForSelector('.carteDindie', { timeout: 60000 });
  await pg.screenshot({ path: `${OUT}/clapier.png` });
  const uidG = await pg.evaluate(() => window.__jeu.etat().dindies.find(d => d.origine === 'cadeau').uid);
  await pg.evaluate(u => document.querySelector(`.carteDindie[data-uid="${u}"]`).click(), uidG); await pg.waitForSelector('#fDest button[data-l="clapier"]');
  await pg.screenshot({ path: `${OUT}/fiche.png` });
  await pg.evaluate(() => document.querySelector('#fDest button[data-l="clapier"]').click()); await attendreEtape('kit'); await fermer(); await log('Glouglou rangé au Clapier');
  /* Q4 : le deuxième enclos */
  await parlerMimi('kitPlanches'); await attendreEtape('reparer2'); await fermer();
  await aller('enclos-' + type2); await agir('enclos-' + type2); await jusqua('friandises'); await log('deuxième enclos : ' + type2);
  /* Q5 : nourrir */
  await parlerMimi('friandise'); await attendreEtape('nourrir'); await fermer();
  for (const uid of await pg.evaluate(() => window.__jeu.etat().dindies.map(d => d.uid))) {
    await pg.evaluate(u => window.__jeu.P.ouvrirFiche(window.__jeu.J.parUid(u)), uid); await pg.waitForTimeout(300);
    await pg.evaluate(() => document.getElementById('fMiam').click()); await pg.waitForTimeout(300); await fermer();
  }
  await attendreEtape('musee'); await log('les 2 dindies ont mangé');
  /* Q6 : le Musée et le Grand Livre */
  await aller('musee'); await agir('musee'); await attendreEtape('livre'); await pg.waitForTimeout(500); await pg.screenshot({ path: `${OUT}/musee.png` }); await fermer();
  await aller('pnj-plumeau'); await agir('pnj-plumeau'); await pg.waitForTimeout(300); await dialogues(); await attendreEtape('zephyr'); await log('filet reçu');
  await pg.evaluate(() => window.__jeu.P.ouvrirLivre()); await pg.waitForTimeout(600); await pg.screenshot({ path: `${OUT}/livre.png` }); await fermer();
  /* Q7 : la montgolfière */
  await aller('pnj-zephyr'); await agir('pnj-zephyr'); await pg.waitForTimeout(300); await dialogues(); await attendreEtape('corde');
  await aller('objet-corde'); await agir('objet-corde'); await attendreEtape('toile'); await log('corde trouvée');
  await parlerMimi('toile', false); await attendreEtape('ballon'); await fermer();
  await aller('pnj-zephyr', false); await agir('pnj-zephyr'); await pg.waitForTimeout(400);
  await jusqua('fin'); await pg.waitForTimeout(600); await pg.screenshot({ path: `${OUT}/fin.png` });
  await pg.evaluate(() => document.getElementById('finOk')?.click()); await pg.waitForTimeout(1200);
  await pg.screenshot({ path: `${OUT}/ballon.png` });
  await log(`chapitre 1 fini en ${((Date.now() - t0) / 1000).toFixed(0)} s`);
} catch (e) { console.log('❌', e.message); echec = true; await pg.screenshot({ path: `${OUT}/erreur.png` }); }
const bilan = await pg.evaluate(() => { const e = window.__jeu.etat(); return { etape: e.quete.etape, finies: e.quete.finies.length, pieces: e.pieces, dindies: e.dindies.map(d => d.espece + '@' + d.lieu), enclos: Object.keys(e.enclos), clapier: e.batiments.clapier.repare, ballon: e.batiments.montgolfiere.reparee, inv: e.inventaire, livre: Object.keys(e.livre.attrapes).length }; });
console.log('bilan', JSON.stringify(bilan));
/* la sauvegarde : on recharge, on reprend */
await pg.evaluate(() => window.__jeu.sauver()); await pg.reload(); await pg.waitForTimeout(1200);
await pg.evaluate(() => document.querySelector('#profils .jouer').click());
await pg.waitForFunction(() => window.__jeu, null, { timeout: 60000 }); await pg.waitForTimeout(800);
const apres = await pg.evaluate(() => { const e = window.__jeu.etat(); return { etape: e.quete.etape, dindies: e.dindies.length, pieces: e.pieces, affichees: window.__jeu.affichees.size }; });
console.log('après rechargement :', JSON.stringify(apres));
if (apres.etape !== bilan.etape || apres.dindies !== bilan.dindies.length) { console.log('❌ la sauvegarde ne reprend pas au bon endroit'); echec = true; }
if (errs.length) { console.log('❌ erreurs :', errs); echec = true; }
console.log(echec ? '❌ étape 2 : échec' : '✅ étape 2 : chapitre 1 joué de bout en bout, sauvegarde OK, aucune erreur');
await b.close();
process.exit(echec ? 1 : 0);
