/* Tests automatiques de l'étape 4 (l'élevage : chapitre 3), avec Playwright.
   Usage : node royaume-outils/test-etape4.mjs [adresse] [largeur,hauteur,mobile] [dossier des captures]
   - adresse par défaut : http://localhost:8765/royaume/index.html
     (servir une copie de docs/royaume où la carte d'import pointe vers un three.module.js local,
      ou utiliser directement https://galvazzz-dotcom.github.io/rulie/royaume/index.html)
   - format par défaut : 390,844,1 (téléphone) ; CHROMIUM=/chemin/vers/chromium si besoin.
   Part d'une sauvegarde « fin du chapitre 2 » de l'étape 3 (elle doit passer au chapitre 3), puis joue
   tout le chapitre 3 : le Couvoir (kit chez Mimi, réparation), l'œuf du Professeur (couveuse, éclosion animée),
   la Nurserie (réparation, repas, croissance), le premier croisement (un hybride !), l'éveil au Labo.
   Vérifie aussi les règles des croisements (300 tirages), les minuteurs en temps réel, un œuf mystère,
   le sablier, la sauvegarde, et qu'il n'y a aucune erreur. */
import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
const URL = process.argv[2] || 'http://localhost:8765/royaume/index.html';
const [w, h, mob] = (process.argv[3] || '390,844,1').split(',').map(Number), OUT = process.argv[4] || 'captures-etape4';
mkdirSync(OUT, { recursive: true });
const b = await chromium.launch({ executablePath: process.env.CHROMIUM || undefined, args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
const pg = await b.newPage({ viewport: { width: w, height: h }, isMobile: !!mob, hasTouch: !!mob });
pg.on('dialog', d => d.accept());
const errs = []; pg.on('pageerror', e => errs.push(e.message + ' @ ' + (e.stack || '').split('\n').slice(1, 3).join(' | '))); pg.on('console', m => { if (m.type() === 'error' && !/CERT|404/.test(m.text())) errs.push('console: ' + m.text()); });
let echecs = 0;
const verifier = (ok, texte) => { console.log((ok ? '✅ ' : '❌ ') + texte); if (!ok) echecs++; };
const etape = () => pg.evaluate(() => window.__jeu.etat().quete.etape);
const log = async t => console.log(`[${await etape().catch(() => '?')}] ${t}`);
const dialogues = async () => { for (let k = 0; k < 120; k++) { const encore = await pg.evaluate(() => { const d = document.querySelector('.dialogue'); if (!d) return false; d.dispatchEvent(new PointerEvent('pointerup')); return true; }); if (!encore) return; await pg.waitForTimeout(90); } };
const fermer = () => pg.evaluate(() => document.querySelectorAll('.voile .fermer').forEach(b => b.click()));
const jusqua = async (e, ms = 90000) => { const fin = Date.now() + ms; while (await etape() !== e) { if (Date.now() > fin) throw new Error(`étape ${e} jamais atteinte (reste à ${await etape()})`); await dialogues(); await pg.waitForTimeout(400); } };
async function agir(id) {
  await dialogues(); await fermer(); await pg.waitForFunction(() => !window.__jeu.occupe && !document.querySelector('.dialogue'), null, { timeout: 60000, polling: 200 }).catch(() => dialogues());
  const ok = await pg.evaluate(id => { const J = window.__jeu, I = J.interactifs.find(i => i.id === id); if (!I) return false; const p = J.monde.grille.plusProcheLibre(I.x, I.z + .5); J.moi.racine.position.set(p[0], J.monde.sol(p[0], p[1]), p[1]); J.agir(I); return true; }, id);
  if (!ok) throw new Error('pas d’interactif ' + id);
  await pg.waitForTimeout(600); await dialogues(); await pg.waitForTimeout(300);
}
/* attendre un élément en fermant les dialogues qui s'intercalent */
const attendre = async (sel, ms = 20000) => { const fin = Date.now() + ms; while (!await pg.$(sel)) { if (Date.now() > fin) return false; await dialogues(); await pg.waitForTimeout(300); } return true; };
const clic = sel => pg.evaluate(sel => { const b = document.querySelector(sel); if (!b) return false; b.click(); return true; }, sel);
/* faire avancer le temps des œufs et des bébés (comme si on avait attendu) */
const avancerTemps = min => pg.evaluate(min => { const J = window.__jeu, E = J.etat(); for (const o of E.elevage.couveuses) if (o) { o.fin -= min * 60000; o.debut -= min * 60000; } for (const d of E.dindies) if (d.croissance) d.croissance.fin -= min * 60000; J.verifierElevage(); }, min);
async function eclore() {
  await agir('couvoir'); await pg.waitForSelector('[data-eclore]', { timeout: 15000 });
  await clic('[data-eclore]'); await pg.waitForSelector('#eclosion #eOk', { timeout: 15000 });
  await pg.waitForTimeout(500); await pg.screenshot({ path: `${OUT}/eclosion-${Date.now() % 1000}.png` });
  await clic('#eOk'); await pg.waitForTimeout(700); await dialogues();
}

await pg.goto(URL);
await pg.evaluate(() => localStorage.clear()); await pg.reload(); await pg.waitForTimeout(1200);
await pg.evaluate(() => document.getElementById('tNouveau').click()); await pg.fill('#tNom', 'Test');
await pg.evaluate(() => document.getElementById('tGo').click()); await pg.waitForTimeout(500);
await pg.evaluate(() => document.querySelector('#prologue .passer').dispatchEvent(new PointerEvent('pointerup', { bubbles: true })));
await pg.waitForFunction(() => window.__jeu, null, { timeout: 60000 });
const t0 = Date.now();
try {
  /* une sauvegarde de l'étape 3, à la fin du chapitre 2, avec des dindies de plusieurs types */
  await pg.evaluate(async () => {
    const J = window.__jeu, e = J.etat(), { nouvelleDindie } = await import('./js/jeu/individus.js');
    e.version = 2; e.quete.etape = 'fin'; e.quete.finies = Array.from({ length: 17 }, (_, i) => 'q' + (i + 1)); e.pieces = 900; delete e.elevage; delete e.batiments.couvoir; delete e.batiments.nurserie;
    Object.assign(e.inventaire, { grandLivre: 1, filet: 1, billet: 1, friandise: 12, chapeauSoleil: 1, parapluie: 1, oeufMystere: 1 }); e.batiments.montgolfiere.reparee = true; e.batiments.clapier.repare = true;
    for (const [esp, niv, region] of [['glouglou', 6, 'pres'], ['crachin', 12, 'belgique'], ['dindasable', 9, 'maroc'], ['atomium', 17, 'belgique']]) {
      const d = nouvelleDindie(esp, { niveau: niv, origine: 'sauvage:' + region }); e.dindies.push(d); e.livre.attrapes[esp] = 1; e.livre.vus[esp] = 1;
    }
    e.monde.positions = { pres: [0, 0], maroc: [0, 0], belgique: [0, 0] }; e.reglages.heure = 'jour';
    J.sauver();
  });
  await pg.reload(); await pg.waitForTimeout(1200);
  await pg.evaluate(() => document.querySelector('#profils .jouer').click());
  await pg.waitForFunction(() => window.__jeu, null, { timeout: 60000 }); await pg.waitForTimeout(800);
  verifier(await etape() === 'parlerPlumeau3', 'une sauvegarde de l’étape 3 (fin du chapitre 2) reprend au début du chapitre 3');

  /* les règles des croisements, sur 300 tirages */
  const R = await pg.evaluate(async () => {
    const L = window.__jeu.EL, { PAR_ID } = await import('./js/donnees/especes.js'), D = window.__jeu.etat().dindies;
    const g = D.find(d => d.espece === 'glouglou'), c = D.find(d => d.espece === 'crachin'), s = D.find(d => d.espece === 'dindasable');
    const compte = (a, b2) => { const n = {}; for (let k = 0; k < 300; k++) { const r = L.resultatCroisement(a, b2); n[r] = (n[r] || 0) + 1; } return n; };
    const n1 = compte(g, c), n2 = compte(g, { ...g, uid: 'x' });
    return { n1, n2, premier: L.resultatCroisement(g, c, true), hybride: PAR_ID[L.resultatCroisement(g, c, true)].origine.sorte, sable: L.possibilites(c, s).hybrides.map(h => h.id) };
  });
  verifier(R.premier === 'rosee' && R.n1.rosee > 50 && R.n1.rosee < 140 && (R.n1.glouglou || 0) + (R.n1.crachin || 0) + R.n1.rosee === 300,
    `Glouglou 🌿 × Crachin 💧 : le Dindon Rosée (hybride) ~30 % des fois (${R.n1.rosee}/300), sinon un des parents ; le premier croisement donne toujours l’hybride`);
  verifier(Object.keys(R.n2).length === 1 && R.n2.glouglou === 300, 'deux parents de même type : le bébé est de leur espèce');
  verifier(R.sable.includes('cactus'), `Crachin 💧 × Dindasable 🏜️ peut donner le Dindocactus (${R.sable.join(', ')})`);

  /* Q18 : le Couvoir */
  await agir('pnj-plumeau'); await jusqua('kitCouvoir'); await log('le Professeur parle des œufs');
  await agir('pnj-mimi'); await pg.waitForSelector('.acheter[data-id="kitConstruction"]', { timeout: 20000 });
  await clic('.acheter[data-id="kitConstruction"]'); await pg.waitForTimeout(400); await fermer(); await jusqua('reparerCouvoir');
  await agir('couvoir'); await jusqua('oeufTuto'); await log('le Couvoir est réparé');
  verifier(await attendre('#cProf'), 'après la réparation et le mot du Professeur, le Couvoir s’ouvre avec son œuf');
  await fermer(); await pg.waitForTimeout(600);
  await pg.evaluate(() => { const J = window.__jeu, I = J.interactifs.find(i => i.id === 'couvoir'); J.moi.racine.position.set(I.x, 0, I.z + 4); }); await pg.waitForTimeout(1500);
  await pg.screenshot({ path: `${OUT}/couvoir-3d.png` });
  /* Q19 : l'œuf du Professeur (30 s en vrai) */
  await agir('couvoir'); await pg.waitForSelector('#cProf', { timeout: 10000 }); await clic('#cProf'); await pg.waitForTimeout(600);
  await pg.screenshot({ path: `${OUT}/couvoir.png` }); await fermer(); await jusqua('eclosion');
  const avant = Date.now();
  await pg.waitForFunction(() => window.__jeu.EL.elevage().couveuses.some(o => o && window.__jeu.EL.pret(o)), null, { timeout: 60000, polling: 500 });
  verifier((Date.now() - avant) / 1000 > 20, `l’œuf du Professeur couve en temps réel (${((Date.now() - avant) / 1000).toFixed(0)} s)`);
  await eclore(); await jusqua('kitNurserie'); await log('le premier poussin est né');
  /* Q20 : la Nurserie */
  await agir('pnj-mimi'); await pg.waitForSelector('.acheter[data-id="kitConstruction"]', { timeout: 20000 });
  await clic('.acheter[data-id="kitConstruction"]'); await pg.waitForTimeout(400); await fermer(); await jusqua('reparerNurserie');
  await agir('nurserie'); await jusqua('grandir');
  verifier(await attendre('[data-nourrir]'), 'après la réparation, la Nurserie s’ouvre');
  verifier(await pg.evaluate(() => window.__jeu.etat().dindies.some(d => d.stade === 'poussin' && d.lieu === 'nurserie')), 'le poussin s’installe à la Nurserie');
  await agir('nurserie'); await pg.waitForSelector('[data-nourrir]', { timeout: 10000 });
  for (let k = 0; k < 4; k++) { await clic('[data-nourrir]'); await pg.waitForTimeout(500); }
  await pg.screenshot({ path: `${OUT}/nurserie.png` }); await fermer();
  await jusqua('nid'); await log('le poussin a grandi (4 repas : − 12 min)');
  await pg.evaluate(() => { const J = window.__jeu, I = J.interactifs.find(i => i.id === 'nurserie'); J.moi.racine.position.set(I.x, 0, I.z + 3); }); await pg.waitForTimeout(1500);
  await pg.screenshot({ path: `${OUT}/nurserie-3d.png` });
  /* Q21 : le premier croisement */
  await agir('couvoir');
  for (const [i, esp] of [[0, 'glouglou'], [1, 'crachin']]) {
    await clic(`[data-choisir="${i}"]`); await pg.waitForSelector('.voile:last-child .carteDindie', { timeout: 10000 });
    await pg.evaluate(esp => { const uid = window.__jeu.etat().dindies.find(d => d.espece === esp).uid; [...document.querySelectorAll('.voile:last-child .carteDindie')].find(b => b.dataset.uid === uid).click(); }, esp);
    await pg.waitForTimeout(400);
  }
  await pg.screenshot({ path: `${OUT}/nid.png` });
  await clic('#cCroiser'); await pg.waitForTimeout(800); await fermer(); await jusqua('oeufCroise'); await log('un œuf de croisement !');
  verifier(await pg.evaluate(() => window.__jeu.EL.elevage().couveuses.some(o => o && o.espece === 'rosee' && o.origine === 'croisement')), 'le premier croisement Glouglou × Crachin couve un Dindon Rosée');
  await agir('couvoir'); await pg.waitForSelector('[data-sablier]', { timeout: 10000 }); const r0 = await pg.evaluate(() => window.__jeu.EL.restant(window.__jeu.EL.elevage().couveuses.find(o => o && o.origine === 'croisement')));
  await clic('[data-sablier]'); await pg.waitForTimeout(400); await fermer();
  verifier(await pg.evaluate(() => window.__jeu.EL.restant(window.__jeu.EL.elevage().couveuses.find(o => o && o.origine === 'croisement'))) < r0 - 25 * 60000 + 60000 || r0 < 30 * 60000, 'le sablier fait gagner 30 minutes');
  await avancerTemps(25); await eclore(); await jusqua('parlerPlumeau4'); await log('le Dindon Rosée est né !');
  verifier(await pg.evaluate(() => !!window.__jeu.etat().livre.attrapes.rosee), 'l’hybride entre dans le Grand Livre');
  /* un œuf mystère */
  await agir('couvoir'); await clic('#cMystere'); await pg.waitForTimeout(400); await fermer();
  verifier(await pg.evaluate(() => window.__jeu.EL.elevage().couveuses.some(o => o && o.origine === 'mystere') && !window.__jeu.etat().inventaire.oeufMystere), 'un œuf mystère part en couveuse');
  /* Q22 : l'éveil (biscuits pour monter au niveau 20) */
  await agir('pnj-plumeau'); await jusqua('eveil');
  const uidA = await pg.evaluate(() => window.__jeu.etat().dindies.find(d => d.espece === 'atomium').uid);
  await pg.evaluate(uid => window.__jeu.P.ouvrirFiche(window.__jeu.J.parUid(uid)), uidA); await pg.waitForTimeout(400);
  for (let k = 0; k < 12 && await pg.evaluate(uid => window.__jeu.J.parUid(uid).niveau < 20, uidA); k++) { await clic('#fBiscuit'); await pg.waitForTimeout(250); }
  await pg.screenshot({ path: `${OUT}/fiche.png` }); await fermer();
  verifier(await pg.evaluate(uid => window.__jeu.J.parUid(uid).niveau >= 20, uidA), 'les biscuits de champion font monter l’Atomium au niveau 20');
  await agir('labo'); await pg.waitForSelector('#lEveil', { timeout: 10000 }); await clic('#lEveil'); await pg.waitForTimeout(400);
  await pg.evaluate(uid => [...document.querySelectorAll('.eveilF .carteDindie')].find(b => b.dataset.uid === uid).click(), uidA);
  await pg.waitForSelector('#vOk', { timeout: 15000 }); await pg.waitForTimeout(400); await pg.screenshot({ path: `${OUT}/eveil.png` });
  await clic('#vOk'); await pg.waitForTimeout(800);
  await jusqua('fin'); await log('l’Atomium est éveillé !');
  verifier(await pg.evaluate(uid => window.__jeu.J.parUid(uid).stade === 'eveille', uidA), 'l’éveil change le stade de la dindie');
  await pg.waitForTimeout(1500); await pg.screenshot({ path: `${OUT}/fin.png` }); await clic('#finOk');
  console.log(`chapitre 3 joué en ${((Date.now() - t0) / 1000).toFixed(0)} s`);
  /* la sauvegarde : les œufs et les bébés continuent de vivre */
  await pg.evaluate(() => window.__jeu.sauver()); await pg.reload(); await pg.waitForTimeout(1200);
  await pg.evaluate(() => document.querySelector('#profils .jouer').click());
  await pg.waitForFunction(() => window.__jeu, null, { timeout: 60000 }); await pg.waitForTimeout(1200);
  const apres = await pg.evaluate(() => ({ etape: window.__jeu.etat().quete.etape, couvoir: window.__jeu.etat().batiments.couvoir.repare, oeufs: window.__jeu.EL.elevage().couveuses.filter(Boolean).length, bebes: window.__jeu.etat().dindies.filter(d => d.stade !== 'adulte' && d.stade !== 'eveille').length }));
  verifier(apres.etape === 'fin' && apres.couvoir && apres.oeufs === 1, `après rechargement : chapitre 3 fini, le Couvoir réparé, l’œuf mystère toujours en couveuse (${JSON.stringify(apres)})`);
} catch (e) { console.log('❌', e.message); echecs++; await pg.screenshot({ path: `${OUT}/erreur.png` }); }
verifier(!errs.length, `aucune erreur dans le navigateur${errs.length ? ' : ' + errs.join(' / ') : ''}`);
console.log(echecs ? `\n❌ étape 4 : ${echecs} échec(s)` : '\n✅ étape 4 : le chapitre 3 est jouable de bout en bout');
await b.close();
process.exit(echecs ? 1 : 0);
