/* Tests automatiques de l'étape 7 (le monde entier : 5 nouvelles îles, les championnats 5 à 8, les mythiques), avec Playwright.
   Usage : node royaume-outils/test-etape7.mjs [adresse] [largeur,hauteur,mobile] [dossier des captures]
   - adresse par défaut : http://localhost:8765/royaume/index.html
   - format par défaut : 390,844,1 (téléphone) ; CHROMIUM=/chemin/vers/chromium si besoin.
   1. Les règles : 71 espèces atteignables (le Dindromakus attend le chapitre 8), les 8 îles et leurs équipements,
      les objets des légendes et les fragments posés dans les îles, les 7 croisements mythiques (les bons parents,
      l'objet légendaire, la condition : matin, nuit, pluie sur la Belgique), l'œuf mythique (4 h), les championnats 5 à 8.
   2. Une sauvegarde de l'étape 6 (chapitre 4 fini) passe à la version 6 ; puis on joue les chapitres 5, 6 et 7 comme une joueuse :
      Mimi et ses équipements, la montgolfière, les 5 guides, les 20 espèces des nouvelles îles, les objets des légendes,
      les gadgets (pluie, matin, nuit), la Serre, les championnats 5 à 8 (badges), la grande quête du jardin oublié,
      l'œuf mythique au Couvoir (le temps avance) et son éclosion. Puis la grande quête du temple perdu, dans la Jungle.
   3. La mémoire (5 îles visitées), la sauvegarde (on reprend dans une île), et aucune erreur.
   DEPUIS=legendes : pour aller vite, on part du chapitre 7 juste avant le vieux livre des légendes (sans jouer les chapitres 5 et 6). */
import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
import { enPartie, reprendre, laisser } from './partie.mjs';
const URL = process.argv[2] || 'http://localhost:8765/royaume/index.html', LEGENDES = process.env.DEPUIS === 'legendes';
const [w, h, mob] = (process.argv[3] || '390,844,1').split(',').map(Number), OUT = process.argv[4] || 'captures-etape7';
mkdirSync(OUT, { recursive: true });
const b = await chromium.launch({ executablePath: process.env.CHROMIUM || undefined, args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
const pg = await b.newPage({ viewport: { width: w, height: h }, isMobile: !!mob, hasTouch: !!mob });
pg.on('dialog', d => d.accept());
const errs = []; pg.on('pageerror', e => errs.push(e.message + ' @ ' + (e.stack || '').split('\n').slice(1, 3).join(' | '))); pg.on('console', m => { if (m.type() === 'error' && !/CERT|404/.test(m.text())) errs.push('console: ' + m.text()); });
let echecs = 0;
const verifier = (ok, texte) => { console.log((ok ? '✅ ' : '❌ ') + texte); if (!ok) echecs++; };
const etape = () => pg.evaluate(() => window.__jeu.etat().quete.etape);
const log = async t => console.log(`[${await etape().catch(() => '?')}] ${t}`);
/* lire les dialogues (et choisir une réponse : la première, ou celle qu'on demande) */
const dialogues = async (choix = null) => {
  for (let k = 0; k < 160; k++) {
    const encore = await pg.evaluate(choix => {
      const d = document.querySelector('.dialogue'); if (!d) return false;
      const c = d.querySelector(choix ? `.dChoix button[data-c="${choix}"]` : '.dChoix button'); if (c) { c.click(); return true; }
      d.dispatchEvent(new PointerEvent('pointerup')); return true;
    }, choix);
    if (!encore) return; await pg.waitForTimeout(90);
  }
};
const fermer = () => pg.evaluate(() => { document.getElementById('finOk')?.click(); document.querySelectorAll('.voile .fermer').forEach(b => b.click()); });
const jusqua = async (e, ms = 90000) => { const fin = Date.now() + ms; while (await etape() !== e) { if (Date.now() > fin) throw new Error(`étape ${e} jamais atteinte (reste à ${await etape()})`); await dialogues(); await pg.evaluate(() => document.getElementById('finOk')?.click()); await pg.waitForTimeout(400); } };
const libre = () => pg.waitForFunction(() => !window.__jeu.occupe && !document.querySelector('.dialogue'), null, { timeout: 60000, polling: 200 }).catch(() => {});
async function agir(id, choix = null) {
  await dialogues(); await fermer(); await libre();
  const ok = await pg.evaluate(id => { const J = window.__jeu, I = J.interactifs.find(i => i.id === id); if (!I) return false; const p = J.monde.grille.plusProcheLibre(I.x, I.z + .5); J.moi.racine.position.set(p[0], J.monde.sol(p[0], p[1]), p[1]); J.agir(I); return true; }, id);
  if (!ok) throw new Error('pas d’interactif ' + id + ' (' + await pg.evaluate(() => window.__jeu.monde.id) + ')');
  await pg.waitForTimeout(600); await dialogues(choix); await pg.waitForTimeout(300);
}
const clic = sel => pg.evaluate(sel => { const b = document.querySelector(sel); if (!b || b.disabled) return false; b.click(); return true; }, sel);
const attendre = async (sel, ms = 20000) => { const fin = Date.now() + ms; while (!await pg.$(sel)) { if (Date.now() > fin) return false; await dialogues(); await pg.waitForTimeout(250); } return true; };
async function voyager(id) {
  if (await pg.evaluate(() => window.__jeu.monde.id) === 'dindodrome') await allerA('domaine');
  await agir('pnj-zephyr');
  await pg.waitForSelector('.mondeF', { timeout: 20000 });
  await pg.evaluate(id => document.querySelector(`.ileMonde[data-id="${id}"]`).dispatchEvent(new MouseEvent('click', { bubbles: true })), id);
  await pg.waitForTimeout(300);
  await pg.evaluate(() => document.getElementById('mPartir').click());
  await pg.waitForFunction(id => window.__jeu.monde.id === id && !document.getElementById('voyage') && !window.__jeu.occupe, id, { timeout: 120000 });
  await pg.waitForTimeout(600); await dialogues();
}
async function allerA(lieu) {
  const ici = await pg.evaluate(() => window.__jeu.monde.id);
  if (ici === lieu) return;
  if (ici !== 'domaine' && ici !== 'dindodrome') { await voyager('domaine'); if (lieu === 'domaine') return; }
  await agir(lieu === 'dindodrome' ? 'dindodrome' : 'sortie');
  await pg.waitForFunction(l => window.__jeu.monde.id === l && !window.__jeu.occupe, lieu, { timeout: 60000 });
  await pg.waitForTimeout(800); await dialogues();
}
async function acheter(id) {
  await agir('pnj-mimi');
  if (!await attendre(`.acheter[data-id="${id}"]`, 20000)) throw new Error(`Mimi ne vend pas ${id}`);
  await clic(`.acheter[data-id="${id}"]`); await pg.waitForTimeout(400); await fermer();
}
/* attraper une espèce : la faire venir si besoin, s'approcher, friandises, filet au bon moment */
async function attraper(esp) {
  for (let tour = 0; tour < 8; tour++) {
    const ok = await pg.evaluate(esp => {
      const J = window.__jeu; let s = J.sauvages.liste.find(x => x.espece === esp && !x.fantome && x.etat !== 'fuite');
      if (!s) s = J.sauvages.invoquer(esp);
      if (!s || s.fantome) return 'absente';
      const q = s.m.racine.position, d = J.monde.grille.plusProcheLibre(q.x + 2.4, q.z + 1.4);
      J.moi.racine.position.set(d[0], J.monde.sol(d[0], d[1]), d[1]);
      s.etat = 'erre'; J.capturer(s); return 'ok';
    }, esp);
    if (ok === 'absente') { await pg.waitForTimeout(1500); continue; }
    await pg.waitForSelector('#capture', { timeout: 15000 });
    const libreC = () => pg.waitForFunction(() => !window.__jeu.capture || !window.__jeu.capture.etat().occupe, null, { timeout: 60000 });
    for (let k = 0; k < 12; k++) {
      await libreC();
      const c = await pg.evaluate(() => window.__jeu.capture && window.__jeu.capture.etat().confiance);
      if (c === null || c === undefined || c >= .99) break;
      await pg.evaluate(() => { const b = document.querySelector('.friand.pref') || document.querySelector('.friand[data-id="superFriandise"]') || document.querySelector('.friand[data-id="friandise"]'); b && b.click(); });
      await pg.waitForTimeout(250);
    }
    for (let k = 0; k < 3; k++) {
      await libreC();
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
    await pg.evaluate(() => document.getElementById('aOk')?.click()); await pg.waitForTimeout(600); await dialogues();
    if (pris) return;
  }
  throw new Error('impossible d’attraper ' + esp);
}
/* une course : la coureuse choisie, courue d'un coup */
async function courir(declencher, uid) {
  await declencher();
  if (!await attendre('.coureuse', 15000)) throw new Error('pas de choix de coureuse');
  await pg.evaluate(uid => document.querySelector(`.coureuse[data-uid="${uid}"]`).click(), uid);
  await pg.waitForFunction(() => window.__jeu.course, null, { timeout: 15000 });
  await pg.evaluate(() => { window.__jeu.course.vitesseTest = 8; window.__jeu.course.podiumMs = 150; window.__jeu.course.finirVite(true); });
  if (!await attendre('.resultatsF #rOk', 90000)) throw new Error('pas de résultats');
  const r = await pg.evaluate(() => ({ place: window.__jeu.course ? window.__jeu.course.C.joueur().place : null }));
  await clic('.resultatsF #rOk'); await pg.waitForTimeout(700); await libre();
  await dialogues(); await fermer();
  return r;
}
const parBureau = id => async () => { await agir('bureau'); if (!await attendre(`[data-courir="${id}"]`, 10000)) throw new Error('pas de course ' + id + ' au Bureau'); await clic(`[data-courir="${id}"]`); };
async function championnat(n, uid) {
  await allerA('dindodrome');
  for (const c of ['a', 'b', 'c']) { let r = await courir(parBureau(`c${n}${c}`), uid); for (let k = 0; k < 2 && r.place > 3; k++) r = await courir(parBureau(`c${n}${c}`), uid); if (r.place > 3) throw new Error(`c${n}${c} : ${r.place}e place`); }
  let r = await courir(parBureau(`c${n}f`), uid);
  for (let k = 0; k < 3 && r.place !== 1; k++) r = await courir(parBureau(`c${n}f`), uid);
  verifier(r.place === 1 && await pg.evaluate(n => window.__jeu.DD.badge(n), n), `championnat ${n} : 3 podiums, puis la finale gagnée → le badge`);
}
/* les objets d'une île : posés là où la joueuse peut marcher (un chemin depuis la montgolfière) ;
   on vérifie aussi toutes les places des objets de quête de l'île (objets des légendes, fragments des grandes quêtes) */
const objetsAccessibles = () => pg.evaluate(async () => {
  const J = window.__jeu, M = J.monde, [x0, z0] = M.depart, a = M.grille.plusProcheLibre(x0, z0), mal = [];
  const ok = (x, z) => { const q = M.grille.plusProcheLibre(x, z); return q && Math.hypot(q[0] - x, q[1] - z) <= 1.4 && !!M.grille.trouverChemin(a[0], a[1], q[0], q[1]); };
  for (const [oid, O] of M.objets) if (!ok(O.o.g.position.x, O.o.g.position.z)) mal.push(oid);
  const D = (await import(`./js/monde/regions/${M.id}.js`)).default, places = Object.entries(D.quete || {});
  for (const [oid, [x, z]] of places) if (!ok(x, z)) mal.push('place:' + oid);
  return { n: M.objets.size, places: places.length, mal };
});
const memoire = () => pg.evaluate(() => { const i = window.__rendu.renderer.info; return [i.memory.geometries, i.memory.textures]; });
/* heure : l'heure pour attraper les espèces de la page ; contraire : le ciel avant le gadget (pour qu'il ait quelque chose à changer) */
async function ile(region, { guide, especes, objet, gadget, epique, verif, heure = 13, contraire }) {
  await voyager(region); await log(`arrivée : ${region}`);
  await pg.evaluate(h => window.__jeu.forcerHeure(h, 30 * 60000), heure);
  await pg.screenshot({ path: `${OUT}/${region}.png` });
  await agir('pnj-' + guide); await jusqua(region + '3');
  for (const x of especes) await attraper(x);
  await jusqua('parler' + guide.charAt(0).toUpperCase() + guide.slice(1) + '2'); await log(`la page : ${especes.join(', ')}`);
  await agir('pnj-' + guide);
  const A = await objetsAccessibles();
  verifier(A.n === 3 && !A.mal.length, `${region} : les 3 objets de la légende (et les ${A.places} places de quête de l’île) sont là où l’on peut marcher (${A.mal.join(' ') || 'tous accessibles'})`);
  for (const i of [1, 2, 3]) await agir(`objet-${objet}${i}`);
  await jusqua(epique);
  await pg.evaluate(contraire); await pg.evaluate(() => window.__jeu.majLumiere(true)); await pg.waitForTimeout(600);
  const avant = await pg.evaluate(() => document.getElementById('hHeure').textContent);
  await agir('gadget-' + gadget); await pg.waitForTimeout(2500);
  const apres = await pg.evaluate(() => document.getElementById('hHeure').textContent);
  verifier(!verif(avant) && verif(apres), `${region} : le gadget (${gadget}) change le ciel (${avant} → ${apres})`);
  await pg.screenshot({ path: `${OUT}/${region}-${gadget}.png` });
  await attraper(epique); await log(`l’épique : ${epique}`);
}

await pg.goto(URL);
await pg.evaluate(() => localStorage.clear()); await pg.reload(); await pg.waitForTimeout(1200);
await pg.evaluate(() => document.getElementById('tNouveau').click()); await pg.fill('#tNom', 'Test');
await pg.evaluate(() => document.getElementById('tGo').click()); await pg.waitForTimeout(500);
await pg.evaluate(() => document.querySelector('#prologue .passer').dispatchEvent(new PointerEvent('pointerup', { bubbles: true })));
await pg.waitForFunction(() => window.__jeu, null, { timeout: 60000 });
const t0 = Date.now();
try {
  /* ══════════ 1. les règles ══════════ */
  const R = await pg.evaluate(async () => {
    const W = window.__jeu, e = W.etat(), J = W.J, EL = W.EL, R = {};
    const { ESPECES, PAR_ID } = await import('./js/donnees/especes.js'), { REGIONS } = await import('./js/donnees/regions.js'), { OBJETS, enBoutique } = await import('./js/jeu/objets.js');
    const GQ = await import('./js/jeu/grandesQuetes.js'), { CHAMPIONNATS } = await import('./js/donnees/courses.js'), DD = await import('./js/jeu/dindodrome.js');
    const { nouvelleDindie } = await import('./js/jeu/individus.js'), T = await import('./js/moteur/temps.js'), M = await import('./js/moteur/meteo.js');
    const ILES = { jungle: 'jungle', banquise: 'banquise', volcan: 'volcan', foret: 'foret', nuages: 'nuages', pres: 'pres', maroc: 'maroc', belgique: 'belgique' };
    const defs = {}; for (const id of Object.keys(ILES)) defs[id] = (await import(`./js/monde/regions/${id}.js`)).default;
    /* les espèces atteignables */
    const sauvages = new Set(Object.values(REGIONS).flatMap(r => Object.keys(r.especes || {})));
    const atteignable = x => { const o = x.origine; if (o.sorte === 'sauvage') return sauvages.has(x.id); if (o.sorte === 'croisement') return true; if (o.sorte === 'recette') return o.especes.every(y => sauvages.has(y));
      return !!Object.values(GQ.GRANDES).find(g => g.mythique === x.id); };
    R.atteignables = ESPECES.filter(atteignable).length; R.pasEncore = ESPECES.filter(x => !atteignable(x)).map(x => x.id);
    R.sauvages = sauvages.size;
    R.regions = Object.keys(REGIONS).length;
    /* les objets des légendes et les fragments : chaque île a leurs 3 places */
    const besoin = { jungle: ['statuette', 'masqueJade'], banquise: ['etoileGlace', 'eclatGlace'], volcan: ['pierreLave', 'goutteFeu'], foret: ['eclatLune'], nuages: ['plumeEclair', 'noteMusique'],
      pres: ['graineAncienne', 'plumeRouge'], maroc: ['fragmentCarte'], belgique: ['cleCanal', 'bouleArgent'] };
    R.manquePlaces = Object.entries(besoin).flatMap(([id, L]) => L.flatMap(o => [1, 2, 3].filter(i => !defs[id].quete?.[o + i]).map(i => id + ':' + o + i)));
    const { creerIle } = await import('./js/monde/ile.js');
    R.horsIle = Object.entries(besoin).flatMap(([id, L]) => L.flatMap(o => [1, 2, 3].filter(i => { const p = defs[id].quete?.[o + i]; return p && creerIle(defs[id].ile).forme(p[0], p[1]) > .9; }).map(i => id + ':' + o + i)));
    /* les équipements : en boutique au bon moment */
    e.quete.finies = Array.from({ length: 30 }, (_, i) => 'q' + (i + 1));
    R.equipAvant = ['moufles', 'bottesLave', 'lanterne', 'ailes'].filter(o => enBoutique(o, e));
    R.jumelles = enBoutique('jumelles', e);
    e.quete.finies = Array.from({ length: 50 }, (_, i) => 'q' + (i + 1));
    R.equipApres = ['jumelles', 'moufles', 'bottesLave', 'lanterne', 'ailes'].filter(o => enBoutique(o, e));
    R.friandisesApres = ['banane', 'sorbet', 'piment', 'myrtille', 'barbeAPapa'].filter(o => enBoutique(o, e));
    /* les croisements mythiques */
    Object.assign(e.batiments, { couvoir: { repare: true, niveau: 3 }, nurserie: { repare: true, niveau: 1 }, clapier: { repare: true, rangees: 2 } });
    const mk = esp => { const d = nouvelleDindie(esp, { niveau: 25 }); d.lieu = 'clapier'; e.dindies.push(d); return d; };
    R.mythiques = [];
    for (const [id, G] of Object.entries(GQ.GRANDES)) {
      const M0 = PAR_ID[G.mythique], [a, b] = M0.origine.especes, p1 = mk(a), p2 = mk(b), r = { id };
      const cond = { florissima: ['matin', 'nuit'], borealis: ['nuit', 'matin'], phenix: ['matin', 'nuit'], belgarum: ['pluie', 'soleil'] }[M0.id];
      const regler = ok => { if (!cond) return; const c = ok ? cond[0] : cond[1]; if (c === 'matin') T.forcerHeure(8, 6e5); else if (c === 'nuit') T.forcerHeure(22, 6e5); else M.forcerMeteo('belgique', c, 6e5); };
      const vider = () => { EL.elevage().couveuses = EL.elevage().couveuses.map(() => null); p1.dernierCroisement = p2.dernierCroisement = 0; };
      r.sansObjet = !GQ.mythiquePour(p1, p2).ok;
      J.ajouterObjet(G.objet);
      regler(false); r.mauvaisMoment = !cond || !GQ.mythiquePour(p1, p2).ok;
      regler(true); r.ok = GQ.mythiquePour(p1, p2).ok;
      vider(); const o = EL.croiser(p1, p2);
      r.oeuf = typeof o === 'object' && o.espece === M0.id && o.rarete === 'mythique' && Math.abs((o.fin - o.debut) - 240 * 60000) < 1000;
      r.objetUtilise = !J.combien(G.objet);
      /* sans l'objet, le même couple ne donne pas de mythique */
      vider(); let mythique = false; for (let k = 0; k < 30; k++) { vider(); const o2 = EL.croiser(p1, p2); if (o2.rarete === 'mythique') mythique = true; }
      r.sansObjetJamais = !mythique;
      T.finForcage(); vider();
      R.mythiques.push(r);
    }
    /* le Dindromakus (étape 8) : le bon couple, mais il faut la plume arc-en-ciel du chapitre 8 */
    const md = GQ.mythiquePour(mk('etoile'), mk('celestia')); R.dindromakus = !!md && md.M.id === 'ruuulius' && !md.ok;
    /* les championnats 5 à 8 */
    R.champ = CHAMPIONNATS.slice(4).map(C => ({ n: C.n, courses: C.courses.length, finale: !!C.finale, badge: !!C.badge, star: C.finale.star.espece }));
    e.courses.badges = [1, 2, 3, 4]; e.quete.etape = 'coupe5';
    R.ouvert5 = DD.championnatOuvert(5, W.S.etapeAtteinte) && !DD.championnatOuvert(6, W.S.etapeAtteinte);
    /* on remet tout comme avant */
    e.dindies = []; e.inventaire = {}; e.quete.finies = []; e.quete.etape = 'arrivee'; e.courses.badges = [];
    return R;
  });
  verifier(R.atteignables === 71 && R.pasEncore.join() === 'ruuulius', `71 espèces sur 72 peuvent s’attraper ou naître (le Dindromakus attend le chapitre 8) : ${R.atteignables}`);
  verifier(R.regions === 8 && R.sauvages === 32, `8 îles, 32 espèces sauvages (${R.regions}, ${R.sauvages})`);
  verifier(!R.manquePlaces.length && !R.horsIle.length, `les objets des légendes et les fragments ont leurs 3 places dans chaque île${R.manquePlaces.length || R.horsIle.length ? ' : ' + [...R.manquePlaces, ...R.horsIle].join(' ') : ''}`);
  verifier(R.jumelles && !R.equipAvant.length && R.equipApres.length === 5 && R.friandisesApres.length === 5, `Mimi vend chaque équipement au bon moment (au chapitre 5 : jumelles seulement ; puis les 5, et les 5 friandises préférées)`);
  for (const r of R.mythiques) verifier(r.sansObjet && r.mauvaisMoment && r.ok && r.oeuf && r.objetUtilise && r.sansObjetJamais, `mythique ${r.id} : sans l’objet ou au mauvais moment, rien ; sinon un œuf mythique (4 h), et l’objet est utilisé ${JSON.stringify(r)}`);
  verifier(R.dindromakus, 'le Dindromakus ne peut pas encore naître (il faut la plume arc-en-ciel du chapitre 8)');
  verifier(R.champ.length === 4 && R.champ.every(c => c.courses === 3 && c.finale && c.badge) && R.ouvert5, `les championnats 5 à 8 : 3 courses, une finale, un badge, et ils s’ouvrent un par un (${R.champ.map(c => c.n + ':' + c.star).join(' ')})`);

  /* ══════════ 2. les chapitres 5 à 7 ══════════ */
  /* une sauvegarde de l'étape 6 : le chapitre 4 est fini, avec une belle équipe (les coureuses de l'étape 5) */
  /* (la partie complète : on reprend la vraie partie du test d'avant, avec un coup de pouce) */
  if (enPartie()) await reprendre(pg, () => {
    /* (les coureuses de l'étape 5, bien entraînées, dans l'équipe ; les parents du jardin oublié au Clapier) */
    const e = window.__jeu.etat(); window.__auMoins({ pieces: 3000, plumesOr: 10, inventaire: { filetDore: 1, friandise: 40, superFriandise: 30 } });
    for (const d of e.dindies) if (d.lieu === 'equipe') d.lieu = 'clapier';
    for (const x of ['cristal', 'comete', 'panthere', 'atomium']) window.__pouce(x, { niveau: 36, stade: 'eveille', talents: [5, 5, 5], entrainement: [15, 15, 15], lieu: 'equipe' });
    for (const x of ['coquelicot', 'amanite']) window.__pouce(x, { niveau: 36, stade: 'eveille', talents: [5, 5, 5], lieu: 'clapier' });
    /* (le temps a passé depuis les quêtes du Domaine : les œufs qui couvaient sont prêts) */
    for (const o of e.elevage.couveuses) if (o) o.fin = Math.min(o.fin, Date.now() - 1000);
  });
  else await pg.evaluate(async legendes => {
    const W = window.__jeu, e = W.etat(), { nouvelleDindie } = await import('./js/jeu/individus.js');
    e.version = 5; e.quete.etape = 'fin'; e.quete.finies = Array.from({ length: 30 }, (_, i) => 'q' + (i + 1)); e.pieces = 3000; e.plumesOr = 10;
    Object.assign(e.inventaire, { grandLivre: 1, filet: 1, filetDore: 1, billet: 1, chapeauSoleil: 1, parapluie: 1, friandise: 40, superFriandise: 30 });
    Object.assign(e.batiments, { clapier: { repare: true, rangees: 2 }, couvoir: { repare: true, niveau: 1 }, nurserie: { repare: true, niveau: 1 }, montgolfiere: { reparee: true }, dindodrome: { ouvert: true }, entrainement: { repare: true } });
    e.enclos.prairie = { construit: true, niveau: 1 }; e.enclos.pluie = { construit: true, niveau: 1 };
    e.courses.badges = [1, 2, 3, 4]; e.reglages.heure = 'jour';
    const mk = (esp, lieu, o = {}) => { const d = nouvelleDindie(esp, { niveau: 36, stade: 'eveille', talents: [5, 5, 5], ...o }); d.entrainement = [15, 15, 15]; d.lieu = lieu; d.origine = o.origine || 'sauvage:pres'; e.dindies.push(d); return d; };
    /* les coureuses (une par piste), et les deux parents du jardin oublié (le Coquelicot a été attrapé au chapitre 2) */
    mk('cristal', 'equipe', { origine: 'croisement' }); mk('comete', 'equipe', { origine: 'croisement' }); mk('panthere', 'equipe', { origine: 'croisement' }); mk('atomium', 'equipe', { origine: 'sauvage:belgique' });
    mk('coquelicot', 'clapier', { origine: 'sauvage:pres' }); mk('amanite', 'clapier', { origine: 'croisement' });
    for (const x of ['glouglou', 'paquerette', 'trefle', 'coquelicot', 'dindasable', 'dromadaire', 'mirageus', 'dingue', 'gaufrette', 'crachin', 'belgicus', 'atomium', 'amanite', 'cristal', 'comete', 'panthere']) e.livre.attrapes[x] = e.livre.vus[x] = Date.now();
    e.monde.lieu = 'domaine';
    if (legendes) {
      e.version = 6; e.quete.etape = 'parlerPlumeau9'; e.quete.finies = Array.from({ length: 50 }, (_, i) => 'q' + (i + 1)); e.courses.badges = [1, 2, 3, 4, 5, 6, 7, 8];
      Object.assign(e.inventaire, { jumelles: 1, moufles: 1, bottesLave: 1, lanterne: 1, ailes: 1 }); e.enclos.jungle = { construit: true, niveau: 1 };
      const R = { jungle: ['perroquet', 'banane', 'liane', 'jaguar'], banquise: ['dindingloo', 'pingouin', 'aurore', 'cristal'], volcan: ['cendre', 'braise', 'dindofeu', 'magma'], foret: ['lune', 'hibou', 'luciole', 'etoile'], nuages: ['nuage', 'zephyr', 'dindarc', 'orage'] };
      for (const [r, L] of Object.entries(R)) for (const x of L) { mk(x, 'clapier', { origine: 'sauvage:' + r, niveau: 25 }); e.livre.attrapes[x] = e.livre.vus[x] = Date.now(); }
      for (const r of Object.keys(R)) e.monde.positions[r] = [0, 0];
    }
    W.sauver();
  }, LEGENDES);
  await pg.reload(); await pg.waitForTimeout(1200);
  await pg.evaluate(() => document.querySelector('#profils .jouer').click());
  await pg.waitForFunction(() => window.__jeu && window.__jeu.monde, null, { timeout: 60000 }); await pg.waitForTimeout(1000); await dialogues(); await fermer();
  /* (dans la partie complète, le Professeur a peut-être déjà donné la lettre de Tarzanette pendant les quêtes du Domaine) */
  if (!LEGENDES) verifier(['parlerPlumeau6', 'jumelles'].includes(await etape()) && await pg.evaluate(() => window.__jeu.etat().version) >= 6, `une sauvegarde de l’étape 6 (chapitre 4 fini) reprend au début du chapitre 5 (version 6 ou plus) : ${await etape()}`);
  const coureuse = await pg.evaluate(() => Object.fromEntries(window.__jeu.etat().dindies.filter(d => d.lieu === 'equipe').map(d => [d.espece, d.uid])));
  const m0 = await memoire();

  if (!LEGENDES) {
  /* ── chapitre 5 : la Jungle et la Banquise ── */
  await agir('pnj-plumeau'); await fermer(); await jusqua('jumelles'); await log('la lettre de Tarzanette');
  await pg.screenshot({ path: `${OUT}/chapitre5.png` });
  await acheter('jumelles'); await jusqua('volJungle');
  const jour = () => pg.evaluate(() => { window.__jeu.etat().reglages.heure = 'jour'; window.__jeu.appliquerReglages(); });
  await ile('jungle', { guide: 'tarzanette', especes: ['perroquet', 'banane', 'liane'], objet: 'statuette', gadget: 'baton', epique: 'jaguar', verif: t => t.includes('🌧️'), contraire: () => window.__jeu.forcerMeteo('jungle', 'soleil', 60000) });
  await jusqua('serre'); await log('le Dindojaguar !');
  await voyager('domaine');
  await agir('enclos-jungle'); await clic('#eConstruire'); await pg.waitForTimeout(500); await dialogues('oui'); await fermer();
  await jusqua('moufles'); await log('la Serre est construite');
  verifier(await pg.evaluate(() => window.__jeu.etat().enclos.jungle?.construit), 'la Serre est construite au Domaine');
  await acheter('moufles'); await jusqua('volBanquise');
  await ile('banquise', { guide: 'inuk', especes: ['dindingloo', 'pingouin', 'aurore'], objet: 'etoileGlace', gadget: 'cor', epique: 'cristal', verif: t => /\b8h/.test(t), contraire: () => window.__jeu.forcerHeure(15, 30 * 60000) });
  await jusqua('coupe5');
  await championnat(5, coureuse.cristal); await jusqua('parlerPlumeau7');
  await pg.waitForTimeout(1200); await pg.screenshot({ path: `${OUT}/fin-chapitre5.png` }); await fermer();
  const pnjD = await pg.evaluate(() => Object.keys(window.__jeu.monde.pnj));
  verifier(['gaston', 'leila', 'waffel', 'tarzanette', 'inuk'].every(x => pnjD.includes(x)), `au Dindodrome, les champions attendent sur la place (${pnjD.join(', ')})`);
  await pg.evaluate(() => { const J = window.__jeu, p = J.monde.grille.plusProcheLibre(0, 34); J.moi.racine.position.set(p[0], 0, p[1]); }); await pg.waitForTimeout(1800);
  await pg.screenshot({ path: `${OUT}/dindodrome-champions.png` });

  /* ── chapitre 6 : le Volcan et la Forêt de la Lune ── */
  await allerA('domaine'); await agir('pnj-plumeau'); await fermer(); await jusqua('bottesLave');
  await acheter('bottesLave'); await jusqua('volVolcan');
  await ile('volcan', { guide: 'lava', especes: ['cendre', 'braise', 'dindofeu'], objet: 'pierreLave', gadget: 'sablierLave', epique: 'magma', verif: t => /\b22h/.test(t), contraire: () => window.__jeu.forcerHeure(14, 30 * 60000) });
  await jusqua('coupe6');
  await championnat(6, coureuse.comete); await jusqua('lanterne');
  await allerA('domaine'); await acheter('lanterne'); await jusqua('volForet');
  await ile('foret', { guide: 'hibou', especes: ['lune', 'hibou', 'luciole'], objet: 'eclatLune', gadget: 'boite', epique: 'etoile', heure: 23, verif: t => /\b22h/.test(t), contraire: () => window.__jeu.forcerHeure(14, 30 * 60000) });
  await jusqua('coupe7');
  await championnat(7, coureuse.panthere); await jusqua('parlerPlumeau8');
  await fermer();

  /* ── chapitre 7 : le Royaume des Nuages, et la première légende ── */
  await allerA('domaine'); await agir('pnj-plumeau'); await fermer(); await jusqua('ailes');
  await acheter('ailes'); await jusqua('volNuages');
  await ile('nuages', { guide: 'azur', especes: ['nuage', 'zephyr', 'dindarc'], objet: 'plumeEclair', gadget: 'tambour', epique: 'orage', verif: t => t.includes('🌧️'), contraire: () => window.__jeu.forcerMeteo('nuages', 'soleil', 60000) });
  await jusqua('coupe8');
  await championnat(8, coureuse.atomium); await jusqua('parlerPlumeau9');
  const pnjD2 = await pg.evaluate(() => Object.keys(window.__jeu.monde.pnj));
  verifier(['lava', 'hibou', 'azur'].every(x => pnjD2.includes(x)), `les 8 champions sont au Dindodrome (${pnjD2.join(', ')})`);
  const nouvelles = await pg.evaluate(() => ['perroquet', 'banane', 'liane', 'jaguar', 'dindingloo', 'pingouin', 'aurore', 'cristal', 'cendre', 'braise', 'dindofeu', 'magma', 'lune', 'hibou', 'luciole', 'etoile', 'nuage', 'zephyr', 'dindarc', 'orage'].filter(x => window.__jeu.etat().dindies.some(d => d.espece === x && d.origine.startsWith('sauvage:'))).length);
  verifier(nouvelles === 20, `les 20 espèces sauvages des 5 nouvelles îles sont attrapées (${nouvelles}/20)`);
  }
  await allerA('domaine'); await agir('pnj-plumeau'); await fermer(); await jusqua('grandeQuete'); await log('le vieux livre des légendes');
  /* la grande quête du jardin oublié (Gaston, les Prés) */
  await voyager('pres');
  await agir('pnj-gaston');
  verifier(await pg.evaluate(() => window.__jeu.etat().quete.grandes.jardin === 'fragments'), 'Gaston raconte la légende du jardin oublié : la grande quête commence');
  const A = await objetsAccessibles();
  verifier(A.mal.length === 0 && A.n >= 3, `les 3 graines anciennes sont posées dans les Prés, là où l’on peut marcher (${A.mal.join(' ') || 'ok'})`);
  await pg.screenshot({ path: `${OUT}/grande-quete.png` });
  for (const i of [1, 2, 3]) await agir('objet-graineAncienne' + i);
  verifier(await pg.evaluate(() => window.__jeu.etat().quete.grandes.jardin === 'rapporter'), 'les 3 graines anciennes trouvées : il faut les rapporter à Gaston');
  await agir('pnj-gaston'); await jusqua('mythique'); await log('la Graine d’or !');
  verifier(await pg.evaluate(() => window.__jeu.J.combien('graineOr') === 1 && !window.__jeu.J.combien('graineAncienne')), 'Gaston donne la Graine d’or (et garde les 3 graines anciennes)');
  /* l'œuf mythique, au Couvoir, le matin */
  await voyager('domaine');
  await pg.evaluate(() => window.__jeu.forcerHeure(8, 30 * 60000));
  /* (dans la partie complète, des œufs d'avant attendent peut-être d'éclore et prennent les couveuses : on les fait éclore, comme une joueuse) */
  for (let k = 0; k < 4; k++) {
    await agir('couvoir');
    if (!await pg.$('[data-eclore]')) { await fermer(); break; }
    await clic('[data-eclore]'); await pg.waitForSelector('#eclosion #eOk', { timeout: 20000 }); await pg.waitForTimeout(400);
    await clic('#eOk'); await pg.waitForTimeout(700); await dialogues(); await fermer(); await log('un œuf d’avant éclot');
  }
  const uids = await pg.evaluate(() => ['coquelicot', 'amanite'].map(x => window.__jeu.etat().dindies.find(d => d.espece === x && d.lieu === 'clapier').uid));
  await agir('couvoir'); await attendre('.couvoirF [data-choisir="0"]');
  for (const [i, u] of uids.entries()) { await clic(`[data-choisir="${i}"]`); await attendre(`.carteDindie[data-uid="${u}"]`); await clic(`.carteDindie[data-uid="${u}"]`); await pg.waitForTimeout(300); }
  const info = await pg.evaluate(() => document.querySelector('.infoCouple')?.textContent || '');
  verifier(/légende/.test(info) && /Florissima/.test(info), `au nid, le Couvoir annonce la légende (${info.trim().slice(0, 90)})`);
  await pg.screenshot({ path: `${OUT}/couvoir-legende.png` });
  await clic('#cCroiser'); await pg.waitForTimeout(600);
  const oeuf = await pg.evaluate(() => window.__jeu.EL.elevage().couveuses.find(o => o && o.rarete === 'mythique'));
  verifier(oeuf && oeuf.espece === 'florissima' && !await pg.evaluate(() => window.__jeu.J.combien('graineOr')), 'un œuf légendaire apparaît (la Graine d’or est utilisée)');
  await pg.screenshot({ path: `${OUT}/oeuf-legendaire.png` });
  /* 4 heures plus tard… */
  await pg.evaluate(() => { for (const o of window.__jeu.EL.elevage().couveuses) if (o) { o.debut -= 5 * 3600e3; o.fin -= 5 * 3600e3; } window.__jeu.verifierElevage?.(); });
  await fermer(); await agir('couvoir');
  if (!await attendre('[data-eclore]', 15000)) throw new Error('l’œuf légendaire n’est pas prêt');
  await pg.evaluate(() => { const i = window.__jeu.EL.elevage().couveuses.findIndex(o => o && o.rarete === 'mythique'); document.querySelector(`[data-eclore="${i}"]`).click(); });
  await attendre('#eOk', 20000); await pg.waitForTimeout(500); await pg.screenshot({ path: `${OUT}/eclosion-mythique.png` });
  await clic('#eOk'); await pg.waitForTimeout(800);
  await jusqua('parlerPlumeau10'); await log('Dindoréa Florissima est née ! (le chapitre 8 commence)');
  await pg.waitForTimeout(1200); await pg.screenshot({ path: `${OUT}/fin-chapitre7.png` }); await fermer();
  verifier(await pg.evaluate(() => window.__jeu.etat().quete.finies.length === 51 && !!window.__jeu.etat().livre.attrapes.florissima), 'le chapitre 7 est fini : 51 quêtes, et une mythique dans le Grand Livre');
  console.log(`chapitres 5 à 7 joués en ${((Date.now() - t0) / 1000).toFixed(0)} s`);
  /* une deuxième légende : le temple perdu (Tarzanette, la Jungle) */
  await voyager('jungle');
  await agir('pnj-tarzanette');
  for (const i of [1, 2, 3]) await agir('objet-masqueJade' + i);
  await agir('pnj-tarzanette');
  verifier(await pg.evaluate(() => window.__jeu.etat().quete.grandes.temple === 'fini' && window.__jeu.J.combien('plumeQuetzal') === 1), 'la grande quête du temple perdu : 3 masques de jade → la Plume de quetzal');
  /* le Journal : les grandes quêtes */
  await pg.evaluate(() => document.getElementById('hJournal').click()); await pg.waitForTimeout(500);
  const jr = await pg.evaluate(() => [...document.querySelectorAll('.voile')].map(v => v.textContent).join(' '));
  verifier(/Les grandes quêtes/.test(jr) && /Le jardin oublié/.test(jr) && /Le temple perdu/.test(jr), 'le Journal montre les grandes quêtes');
  await pg.screenshot({ path: `${OUT}/journal.png` }); await fermer();
  /* la mémoire : retour au Domaine après les 5 îles */
  await voyager('domaine'); const m1 = await memoire();
  for (const r of ['maroc', 'belgique']) { await voyager(r); const P = await objetsAccessibles(); verifier(!P.mal.length, `${r} : les ${P.places} places de quête sont là où l’on peut marcher (${P.mal.join(' ') || 'ok'})`); }
  await voyager('domaine'); const m2 = await memoire();
  verifier(m2[0] <= m1[0] + 3 && m2[1] <= m1[1] + 2, `la mémoire reste stable : géométries ${m0[0]} → ${m1[0]} → ${m2[0]}, textures ${m0[1]} → ${m1[1]} → ${m2[1]}`);
  /* la sauvegarde : on recharge dans une île */
  await voyager('banquise');
  await pg.evaluate(() => window.__jeu.sauver()); await pg.reload(); await pg.waitForTimeout(1200);
  await pg.evaluate(() => document.querySelector('#profils .jouer').click());
  await pg.waitForFunction(() => window.__jeu && window.__jeu.monde, null, { timeout: 90000 }); await pg.waitForTimeout(1500);
  const apres = await pg.evaluate(() => ({ lieu: window.__jeu.monde.id, etape: window.__jeu.etat().quete.etape, livre: Object.keys(window.__jeu.etat().livre.attrapes).length, badges: window.__jeu.etat().courses.badges.length }));
  verifier(apres.lieu === 'banquise' && apres.etape === 'parlerPlumeau10' && apres.badges === 8, `après rechargement : on reprend sur la Banquise, 8 badges (${JSON.stringify(apres)})`);
} catch (e) { console.log('❌', e.message); echecs++; await pg.screenshot({ path: `${OUT}/erreur.png` }); }
verifier(!errs.length, `aucune erreur dans le navigateur${errs.length ? ' : ' + errs.join(' / ') : ''}`);
console.log(echecs ? `\n❌ étape 7 : ${echecs} échec(s)` : '\n✅ étape 7 : les chapitres 5 à 7 sont jouables de bout en bout');
if (!echecs) await laisser(pg);
await b.close();
process.exit(echecs ? 1 : 0);
