/* Tests automatiques de l'étape 3 (l'expédition : chapitre 2), avec Playwright.
   Usage : node royaume-outils/test-etape3.mjs [adresse] [largeur,hauteur,mobile] [dossier des captures]
   - adresse par défaut : http://localhost:8765/royaume/index.html
     (servir une copie de docs/royaume où la carte d'import pointe vers un three.module.js local,
      ou utiliser directement https://galvazzz-dotcom.github.io/rulie/royaume/index.html)
   - format par défaut : 390,844,1 (téléphone) ; CHROMIUM=/chemin/vers/chromium si besoin.
   Part d'une sauvegarde « fin du chapitre 1 » de l'ancienne version (elle doit passer au chapitre 2),
   puis joue tout le chapitre 2 : la carte du monde et les voyages, Gaston, Leïla et Monsieur Waffel,
   les 12 espèces sauvages attrapées (friandises + filet au bon moment), les plumes rouges, les lanternes,
   les boules de l'Atomium, les gadgets (le coq, le cadran magique, la bouteille à nuages), un coffre,
   les achats chez Mimi ; vérifie la mémoire en changeant de lieu, la sauvegarde, et aucune erreur. */
import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
const URL = process.argv[2] || 'http://localhost:8765/royaume/index.html';
const [w, h, mob] = (process.argv[3] || '390,844,1').split(',').map(Number), OUT = process.argv[4] || 'captures-etape3';
mkdirSync(OUT, { recursive: true });
const b = await chromium.launch({ executablePath: process.env.CHROMIUM || undefined, args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
const pg = await b.newPage({ viewport: { width: w, height: h }, isMobile: !!mob, hasTouch: !!mob });
const errs = []; pg.on('pageerror', e => errs.push(e.message + ' @ ' + (e.stack || '').split('\n').slice(1, 3).join(' | '))); pg.on('console', m => { if (m.type() === 'error' && !/CERT|404/.test(m.text())) errs.push('console: ' + m.text()); });
let echecs = 0;
const verifier = (ok, texte) => { console.log((ok ? '✅ ' : '❌ ') + texte); if (!ok) echecs++; };
const etape = () => pg.evaluate(() => window.__jeu.etat().quete.etape);
const log = async t => console.log(`[${await etape().catch(() => '?')}] ${t}`);
const dialogues = async () => { for (let k = 0; k < 120; k++) { const encore = await pg.evaluate(() => { const d = document.querySelector('.dialogue'); if (!d) return false; d.dispatchEvent(new PointerEvent('pointerup')); return true; }); if (!encore) return; await pg.waitForTimeout(90); } };
const fermer = () => pg.evaluate(() => document.querySelectorAll('.voile .fermer').forEach(b => b.click()));
const jusqua = async (e, ms = 120000) => { const fin = Date.now() + ms; while (await etape() !== e) { if (Date.now() > fin) throw new Error(`étape ${e} jamais atteinte (reste à ${await etape()})`); await dialogues(); await pg.waitForTimeout(400); } };
/* se placer à côté d'un objet interactif, et agir */
async function agir(id) {
  const ok = await pg.evaluate(id => { const J = window.__jeu, I = J.interactifs.find(i => i.id === id); if (!I) return false; const p = J.monde.grille.plusProcheLibre(I.x, I.z + .5); J.moi.racine.position.set(p[0], J.monde.sol(p[0], p[1]), p[1]); J.agir(I); return true; }, id);
  if (!ok) throw new Error('pas d’interactif ' + id);
  await pg.waitForTimeout(500); await dialogues(); await pg.waitForTimeout(300);
}
async function voyager(id) {
  await agir('pnj-zephyr');
  await pg.waitForSelector('.mondeF', { timeout: 20000 });
  await pg.evaluate(id => document.querySelector(`.ileMonde[data-id="${id}"]`).dispatchEvent(new MouseEvent('click', { bubbles: true })), id);
  await pg.waitForTimeout(300);
  await pg.evaluate(() => document.getElementById('mPartir').click());
  await pg.waitForFunction(id => window.__jeu.monde.id === id && !document.getElementById('voyage') && !window.__jeu.occupe, id, { timeout: 120000 });
  await pg.waitForTimeout(600); await dialogues();
}
/* attraper une espèce : la faire venir si besoin, s'approcher, friandises, filet au bon moment */
async function attraper(esp) {
  for (let tour = 0; tour < 8; tour++) {
    const ok = await pg.evaluate(esp => {
      const J = window.__jeu; let s = J.sauvages.liste.find(x => x.espece === esp && !x.fantome && x.etat !== 'fuite');
      if (!s) s = J.sauvages.invoquer(esp);
      if (!s) return 'absente';
      const q = s.m.racine.position, d = J.monde.grille.plusProcheLibre(q.x + 2.4, q.z + 1.4);
      J.moi.racine.position.set(d[0], J.monde.sol(d[0], d[1]), d[1]);
      s.etat = 'erre'; J.capturer(s); return 'ok';
    }, esp);
    if (ok === 'absente') { await pg.waitForTimeout(1500); continue; }
    await pg.waitForSelector('#capture', { timeout: 15000 });
    const libre = () => pg.waitForFunction(() => !window.__jeu.capture || !window.__jeu.capture.etat().occupe, null, { timeout: 60000 });
    for (let k = 0; k < 10; k++) {
      await libre();
      const c = await pg.evaluate(() => window.__jeu.capture && window.__jeu.capture.etat().confiance);
      if (c === null || c === undefined || c >= .99) break;
      await pg.evaluate(() => { const b = document.querySelector('.friand.pref') || document.querySelector('.friand[data-id="friandise"]') || document.querySelector('.friand[data-id="doux"]'); b && b.click(); });
      await pg.waitForTimeout(250);
    }
    for (let k = 0; k < 3; k++) {
      await libre();
      if (!(await pg.evaluate(() => !!window.__jeu.capture))) break;
      await pg.evaluate(() => document.getElementById('cFilet')?.click());
      await pg.waitForFunction(() => !window.__jeu.capture || window.__jeu.capture.etat().dans, null, { timeout: 30000, polling: 'raf' });
      await pg.evaluate(() => window.__jeu.capture && window.__jeu.capture.action());
      await pg.waitForFunction(() => !window.__jeu.capture || window.__jeu.capture.etat().phase === 'friandises', null, { timeout: 30000 });
      await pg.waitForTimeout(300);
    }
    if (await pg.evaluate(() => !!window.__jeu.capture)) await pg.evaluate(() => document.getElementById('cPartir')?.click());
    await pg.waitForTimeout(500);
    const pris = await pg.evaluate(esp => !!document.querySelector('.captureF') && window.__jeu.etat().dindies.some(d => d.espece === esp && d.origine.startsWith('sauvage:')), esp);
    if (pris) {
      await pg.screenshot({ path: `${OUT}/attrapee-${esp}.png` });
      await pg.evaluate(() => document.getElementById('aOk')?.click()); await pg.waitForTimeout(600); await dialogues();
      return;
    }
    await pg.evaluate(() => document.getElementById('aOk')?.click());
  }
  throw new Error('impossible d’attraper ' + esp);
}
const memoire = () => pg.evaluate(() => { const i = window.__rendu.renderer.info; return [i.memory.geometries, i.memory.textures]; });

await pg.goto(URL);
await pg.evaluate(() => localStorage.clear()); await pg.reload(); await pg.waitForTimeout(1200);
await pg.evaluate(() => document.getElementById('tNouveau').click()); await pg.fill('#tNom', 'Test');
await pg.evaluate(() => document.getElementById('tGo').click()); await pg.waitForTimeout(500);
await pg.evaluate(() => document.querySelector('#prologue .passer').dispatchEvent(new PointerEvent('pointerup', { bubbles: true })));
await pg.waitForFunction(() => window.__jeu, null, { timeout: 60000 });
const t0 = Date.now();
try {
  /* une sauvegarde de l'étape 2, à la fin du chapitre 1 */
  await pg.evaluate(() => {
    const J = window.__jeu, e = J.etat();
    e.version = 1; e.quete.etape = 'fin'; e.quete.finies = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7']; e.pieces = 650;
    Object.assign(e.inventaire, { grandLivre: 1, filet: 1, billet: 1, friandise: 3 }); e.batiments.montgolfiere.reparee = true; e.batiments.clapier.repare = true;
    e.enclos.prairie = { construit: true, niveau: 1 }; e.reglages.heure = 'jour';
    J.sauver();
  });
  await pg.reload(); await pg.waitForTimeout(1200);
  await pg.evaluate(() => document.querySelector('#profils .jouer').click());
  await pg.waitForFunction(() => window.__jeu, null, { timeout: 60000 }); await pg.waitForTimeout(800);
  verifier(await etape() === 'decollage', 'une ancienne sauvegarde (fin du chapitre 1) reprend au départ du chapitre 2');
  const m0 = await memoire();
  /* Q8 : le départ */
  await voyager('pres'); await log('arrivée aux Prés');
  await pg.screenshot({ path: `${OUT}/pres.png` });
  await agir('pnj-gaston'); await jusqua('capture1'); await log('Gaston a tout expliqué');
  /* un coffre du jour */
  const avant = await pg.evaluate(() => window.__jeu.etat().pieces);
  const coffre = await pg.evaluate(() => window.__jeu.interactifs.find(i => i.trouvaille && i.trouvaille.sorte === 'coffre')?.id);
  if (coffre) { await agir(coffre); await fermer(); }
  verifier(!coffre || await pg.evaluate(() => window.__jeu.etat().pieces) > avant, 'un coffre donne des pièces');
  /* Q9, Q10 : les captures des Prés */
  await attraper('glouglou'); await jusqua('pres3'); await log('première capture !');
  await attraper('paquerette'); await attraper('trefle'); await jusqua('parlerGaston2'); await log('la page des Prés');
  /* Q11 : les plumes rouges et le Coquelicot (le matin) */
  await agir('pnj-gaston'); await jusqua('plumesRouges');
  for (const i of [1, 2, 3]) await agir('objet-plumeRouge' + i);
  await jusqua('coquelicot'); await log('3 plumes rouges');
  await attraper('coquelicot'); await jusqua('chapeau'); await log('le Grand Dindon Coquelicot !');
  /* Q12 : le chapeau de soleil chez Mimi, puis le Maroc */
  await voyager('domaine');
  await agir('pnj-mimi'); await pg.waitForSelector('.acheter[data-id="chapeauSoleil"]', { timeout: 20000 });
  await pg.evaluate(() => document.querySelector('.acheter[data-id="chapeauSoleil"]').click()); await pg.waitForTimeout(400); await fermer();
  await jusqua('volMaroc'); await log('chapeau de soleil acheté');
  await voyager('maroc'); await agir('pnj-leila'); await jusqua('maroc3');
  await pg.screenshot({ path: `${OUT}/maroc.png` });
  await pg.evaluate(() => window.__jeu.forcerMeteo('maroc', 'soleil', 30 * 60000));
  await attraper('dindasable'); await attraper('dromadaire'); await attraper('mirageus'); await jusqua('parlerLeila2'); await log('la page du Maroc');
  /* Q14 : les lanternes, puis la nuit grâce au cadran magique */
  await agir('pnj-leila'); await jusqua('lanternes');
  for (const i of [1, 2, 3]) await agir('gadget-lanterne' + i);
  await jusqua('dingue'); await log('les 3 lanternes');
  await agir('gadget-cadran'); await pg.waitForTimeout(2500);
  await pg.screenshot({ path: `${OUT}/maroc-nuit.png` });
  verifier(await pg.evaluate(() => window.__jeu.etat() && document.getElementById('hHeure').textContent.includes('22h')), 'le cadran magique fait tomber la nuit');
  await attraper('dingue'); await jusqua('parapluie'); await log('la Dinde D’Inde Dingue !');
  /* Q15 à Q17 : la Belgique */
  await voyager('domaine');
  await agir('pnj-mimi'); await pg.waitForSelector('.acheter[data-id="parapluie"]', { timeout: 20000 });
  await pg.evaluate(() => document.querySelector('.acheter[data-id="parapluie"]').click()); await pg.waitForTimeout(400); await fermer();
  await jusqua('volBelgique');
  await voyager('belgique'); await agir('pnj-waffel'); await jusqua('belgique3');
  await pg.screenshot({ path: `${OUT}/belgique.png` });
  await attraper('gaufrette'); await attraper('crachin'); await attraper('belgicus'); await jusqua('parlerWaffel2'); await log('la page de Belgique');
  await agir('pnj-waffel'); await jusqua('boules');
  for (const i of [1, 2, 3]) await agir('objet-bouleArgent' + i);
  await jusqua('atomium'); await log('les 3 boules d’argent');
  await pg.evaluate(() => window.__jeu.forcerMeteo('belgique', 'soleil', 1));
  await agir('gadget-nuage'); await pg.waitForTimeout(3000);
  await pg.screenshot({ path: `${OUT}/belgique-pluie.png` });
  verifier(await pg.evaluate(() => document.getElementById('hHeure').textContent.includes('🌧️')), 'la bouteille à nuages fait pleuvoir');
  await attraper('atomium'); await jusqua('parlerPlumeau3'); await log('le Dindonus Atomium !');
  await pg.waitForTimeout(1500); await pg.screenshot({ path: `${OUT}/fin.png` });
  await pg.evaluate(() => document.getElementById('finOk')?.click()); await pg.waitForTimeout(500);
  const sauvages12 = ['glouglou', 'paquerette', 'trefle', 'coquelicot', 'dindasable', 'dromadaire', 'mirageus', 'dingue', 'gaufrette', 'crachin', 'belgicus', 'atomium'];
  const pris = await pg.evaluate(L => L.filter(x => window.__jeu.etat().dindies.some(d => d.espece === x && d.origine.startsWith('sauvage:'))), sauvages12);
  verifier(pris.length === 12, `les 12 espèces sauvages des 3 premières îles sont attrapées (${pris.length}/12)`);
  /* la mémoire : retour au Domaine, puis encore un aller-retour */
  await voyager('domaine'); const m1 = await memoire();
  await voyager('pres'); await voyager('domaine'); const m2 = await memoire();
  verifier(m2[0] <= m1[0] + 3 && m2[1] <= m1[1] + 2, `la mémoire reste stable en voyageant : géométries ${m0[0]} → ${m1[0]} → ${m2[0]}, textures ${m0[1]} → ${m1[1]} → ${m2[1]}`);
  console.log(`chapitre 2 joué en ${((Date.now() - t0) / 1000).toFixed(0)} s`);
  /* la sauvegarde : on recharge dans une île, on reprend là */
  await voyager('maroc');
  await pg.evaluate(() => window.__jeu.sauver()); await pg.reload(); await pg.waitForTimeout(1200);
  await pg.evaluate(() => document.querySelector('#profils .jouer').click());
  await pg.waitForFunction(() => window.__jeu && window.__jeu.monde, null, { timeout: 90000 }); await pg.waitForTimeout(1500);
  const apres = await pg.evaluate(() => ({ lieu: window.__jeu.monde.id, etape: window.__jeu.etat().quete.etape, livre: Object.keys(window.__jeu.etat().livre.attrapes).length }));
  verifier(apres.lieu === 'maroc' && apres.etape === 'parlerPlumeau3', `après rechargement : on reprend au Maroc, au début du chapitre 3 (${JSON.stringify(apres)})`);
} catch (e) { console.log('❌', e.message); echecs++; await pg.screenshot({ path: `${OUT}/erreur.png` }); }
verifier(!errs.length, `aucune erreur dans le navigateur${errs.length ? ' : ' + errs.join(' / ') : ''}`);
console.log(echecs ? `\n❌ étape 3 : ${echecs} échec(s)` : '\n✅ étape 3 : le chapitre 2 est jouable de bout en bout');
await b.close();
process.exit(echecs ? 1 : 0);
