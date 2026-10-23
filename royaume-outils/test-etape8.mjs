/* Tests automatiques de l'étape 8 (le chapitre 8, la fin, l'après-histoire), avec Playwright.
   Usage : node royaume-outils/test-etape8.mjs [adresse] [largeur,hauteur,mobile] [dossier des captures]
   - adresse par défaut : http://localhost:8765/royaume/index.html
   - format par défaut : 390,844,1 (téléphone) ; CHROMIUM=/chemin/vers/chromium si besoin.
   1. Les règles : la Ligue des Légendes (une dindie très entraînée gagne souvent, une moyenne rarement), les 8 Coupes des Maîtres
      (chacune gagnable par une dindie au maximum du bon type), le relais (3 dindies, 2 passages), le contre la montre (seule,
      les médailles), la course sans fin (3 chutes ou à bout de forces), la note du défilé, les rangs, la partition du glouglou
      et ses étoiles, les défis (tirés selon la date, réclamés une fois, le bonus), les 100 succès, les fêtes selon la date
      (Halloween, Noël, Pâques, l'été) et leurs chapeaux, la sauvegarde version 7.
   2. Une sauvegarde de l'étape 7 (chapitre 7 fini) passe à la version 7 ; on joue le chapitre 8 : Plumeau, Ginette, les 5 courses
      de la Ligue, le Comte Hibou, le télescope et la pleine lune, la pierre de lune (la plume arc-en-ciel), le Couvoir,
      la naissance du Dindromakus, la cinématique, le générique, et la fin (56 quêtes).
   3. Après l'histoire : la quête de la Scène des défilés (Mimi, la réparation, un défilé et un glouglou joués), le relais,
      le contre la montre, la course sans fin, une Coupe des Maîtres, le Panneau des quêtes (défis réclamés, succès),
      l'Atelier pendant une fête, le générique depuis la Maison, et aucune erreur. */
import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
const URL = process.argv[2] || 'http://localhost:8765/royaume/index.html';
const [w, h, mob] = (process.argv[3] || '390,844,1').split(',').map(Number), OUT = process.argv[4] || 'captures-etape8';
mkdirSync(OUT, { recursive: true });
const b = await chromium.launch({ executablePath: process.env.CHROMIUM || undefined, args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
const pg = await b.newPage({ viewport: { width: w, height: h }, isMobile: !!mob, hasTouch: !!mob });
pg.on('dialog', d => d.accept());
const errs = []; pg.on('pageerror', e => errs.push(e.message + ' @ ' + (e.stack || '').split('\n').slice(1, 3).join(' | '))); pg.on('console', m => { if (m.type() === 'error' && !/CERT|404/.test(m.text())) errs.push('console: ' + m.text()); });
let echecs = 0;
const verifier = (ok, texte) => { console.log((ok ? '✅ ' : '❌ ') + texte); if (!ok) echecs++; };
const etape = () => pg.evaluate(() => window.__jeu.etat().quete.etape);
const log = async t => console.log(`[${await etape().catch(() => '?')}] ${t}`);
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
async function allerA(lieu) {
  const ici = await pg.evaluate(() => window.__jeu.monde.id);
  if (ici === lieu) return;
  await pg.evaluate(id => window.__jeu.partirVers(id), lieu);
  await pg.waitForFunction(l => window.__jeu.monde.id === l && !window.__jeu.occupe && !document.getElementById('voyage'), lieu, { timeout: 120000 });
  await pg.waitForTimeout(900); await dialogues(); await fermer();
}
/* une course : la (ou les 3) coureuse(s) choisie(s), courue d'un coup */
async function courir(declencher, uids) {
  await declencher();
  if (!await attendre('.coureuse', 15000)) throw new Error('pas de choix de coureuse');
  for (const u of [].concat(uids)) { await pg.evaluate(u => document.querySelector(`.coureuse[data-uid="${u}"]`).click(), u); await pg.waitForTimeout(150); }
  await pg.waitForFunction(() => window.__jeu.course, null, { timeout: 15000 });
  await pg.waitForTimeout(1500);
  await pg.evaluate(() => { window.__jeu.course.vitesseTest = 8; window.__jeu.course.podiumMs = 150; window.__jeu.course.finirVite(true); });
  if (!await attendre('.resultatsF #rOk', 120000)) throw new Error('pas de résultats');
  const r = await pg.evaluate(() => ({ place: window.__jeu.course ? window.__jeu.course.C.joueur().place : null, texte: document.querySelector('.resultatsF').textContent.replace(/\s+/g, ' ') }));
  await clic('.resultatsF #rOk'); await pg.waitForTimeout(900); await libre();
  await dialogues(); await fermer();
  return r;
}
const parBureau = id => async () => { await agir('bureau'); if (!await attendre(`[data-courir="${id}"]`, 10000)) throw new Error('pas de course ' + id + ' au Bureau'); await clic(`[data-courir="${id}"]`); };
/* le joueur automatique des petits jeux de la Scène (rate : la part des notes qu'il laisse passer) */
const joueurAuto = (rate = 0) => pg.evaluate(rate => {
  clearInterval(window.__auto);
  window.__auto = setInterval(() => {
    const M = window.__jeu.concours; if (!M) return;
    if (M.sorte === 'poses') { const S = M.suite().find(x => !x.fait); if (S && Math.abs(S.dans) < .05) M.taper(S.k); }
    else for (const N of M.notes()) if (!N.fait && Math.abs(N.dans) < .04 && !N.passe) { if (Math.random() >= rate) M.taper(N.touche); }
  }, 10);
}, rate);
const memoire = () => pg.evaluate(() => { const i = window.__rendu.renderer.info; return [i.memory.geometries, i.memory.textures]; });

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
    const W = window.__jeu, e = W.etat(), J = W.J, R = {};
    const { simuler } = await import('./js/jeu/course.js'), DD = await import('./js/jeu/dindodrome.js'), { nouvelleDindie } = await import('./js/jeu/individus.js');
    const { hasard } = await import('./js/moteur/couleurs.js'), { LIGUE, MAITRES, RELAIS, PISTES_CHRONO } = await import('./js/donnees/courses.js');
    const CO = await import('./js/jeu/concours.js'), { CHANSONS, DIFFICULTES } = await import('./js/donnees/chansons.js'), DF = await import('./js/jeu/defis.js');
    const SU = await import('./js/jeu/succes.js'), EV = await import('./js/jeu/evenements.js'), { CHAPEAUX, DECORATIONS, NB_CHAPEAUX, NB_DECORATIONS } = await import('./js/donnees/production.js');
    const PR = await import('./js/jeu/production.js'), { ESPECES, PAR_ID } = await import('./js/donnees/especes.js'), ET = await import('./js/jeu/etat.js');
    const P = (esp, niv, t, ent) => () => { const d = nouvelleDindie(esp, { niveau: niv, talents: [t, t, t], caractere: 'calme', stade: 'eveille' }); d.entrainement = [ent, ent, ent]; d.competences = ['turbo']; return d; };
    const gagne = (id, f, n = 30) => { const def = DD.defCourse(id); let k = 0; for (let i = 0; i < n; i++) { const o = DD.optionsCourse(def, f(), { equipe: def.relais ? [f(), f(), f()] : null }); o.rng = hasard(id + i); if (simuler(o, { joueuseIA: true }).coureurs.find(x => x.id === 'moi').place === 1) k++; } return k / n; };
    /* la Ligue des Légendes */
    R.ligue = LIGUE.map(L => ({ id: L.id, forte: gagne(L.id, P('panthere', 45, 4, 15)), moyenne: gagne(L.id, P('comete', 42, 3, 12)), gagner: !!DD.defCourse(L.id).gagner, canon: DD.adversaires(DD.defCourse(L.id)).some(x => (x.d.competences || []).includes('canon')) }));
    /* les Coupes des Maîtres : chacune gagnable par une dindie au maximum (du bon type) */
    R.maitres = MAITRES.map(M => { const id = 'maitre' + M.n, def = DD.defCourse(id); return { id, star: !!def && DD.adversaires(def).some(x => x.star && x.d.niveau === 50), meilleure: Math.max(...['jaguar', 'magma', 'panthere', 'orage', 'celestia', 'dingue'].map(x => gagne(id, P(x, 50, 5, 15), 16))), moyenne: gagne(id, P('orage', 42, 4, 15), 16) }; });
    /* le relais : 3 dindies, 2 passages de relais */
    { const def = DD.defCourse('relais1'), f = P('panthere', 45, 4, 15), eq = [f(), f(), f()], o = DD.optionsCourse(def, eq[0], { equipe: eq }); o.rng = hasard('relais');
      const C = simuler(o, { joueuseIA: true }), moi = C.coureurs.find(x => x.id === 'moi');
      R.relais = { n: RELAIS.length, passages: C.evenements.filter(v => v.type === 'relais' && C.coureurs[v.r] === moi).length, jambe: moi.jambe, d: moi.d === eq[2], distance: def.distance || 1200, place: moi.place }; }
    /* le contre la montre : seule sur la piste ; les médailles */
    { const def = DD.defCourse('chrono-neutre'), o = DD.optionsCourse(def, P('orage', 42, 4, 15)()), M = DD.tempsMedailles('neutre'); o.rng = hasard('chrono');
      const C = simuler(o, { joueuseIA: true, experte: true }), t = C.coureurs[0].temps;
      R.chrono = { pistes: PISTES_CHRONO.length, seule: C.coureurs.length === 1, ordre: M.or < M.argent && M.argent < M.bronze, medaille: DD.medailleChrono('neutre', t), lente: DD.medailleChrono('neutre', M.bronze + 1) }; }
    /* la course sans fin : jusqu'à 3 chutes ou à bout de forces */
    { const def = DD.defCourse('sansfin'), d = P('panthere', 50, 5, 15); const L = [];
      for (const experte of [false, true]) { const o = DD.optionsCourse(def, d()); o.rng = hasard('sf' + experte); const C = simuler(o, { joueuseIA: true, experte }), moi = C.coureurs[0], fin = C.evenements.find(v => v.type === 'arrivee'); L.push({ pos: Math.round(moi.pos), chutes: moi.chutes, raison: fin && fin.raison }); }
      R.sansFin = L; }
    /* la note du défilé */
    const g = nouvelleDindie('glouglou', { niveau: 5 }); g.bonheur = 60;
    R.noteCommune = CO.noteDindie(g).total;
    const C0 = Object.values(CHAPEAUX).find(C => !C.evenement && PAR_ID.glouglou.types.includes(C.type)), C1 = Object.values(CHAPEAUX).find(C => !C.evenement && !PAR_ID.glouglou.types.includes(C.type));
    g.chapeau = C0.id; R.noteAssorti = CO.noteDindie(g).total; g.chapeau = C1.id; R.noteChapeau = CO.noteDindie(g).total; g.chapeau = null;
    const m = nouvelleDindie('ruuulius', { niveau: 50, stade: 'eveille' }); m.bonheur = 90; m.chroma = true;
    R.noteMythique = CO.noteDindie(m, { ruban: true }).total;
    R.rangs = CO.RANGS.map(r => r.seuil).join(',');
    CO.concours().defile.rang = 0;
    const r1 = CO.finirDefile(g, 0), r2 = CO.finirDefile(m, 30), r3 = CO.finirDefile(m, 30);
    R.defile = { rate: !r1.reussi && !r1.gagne, gagne1: r2.gagne && r2.gagne.id === 'debutant', gagne2: r3.gagne && r3.gagne.id === 'confirme', rang: CO.concours().defile.rang, juges: r2.juges.every(j => j >= 1 && j <= 10) };
    /* le glouglou : la partition, les étoiles, les récompenses (seulement quand on fait mieux) */
    R.partitions = CHANSONS.flatMap(S => DIFFICULTES.map(D => { const p = CO.partition(S.id, D.id); return { ok: p.notes.length === S.notes.length && p.notes.every(n => n.touche >= 0 && n.touche < D.touches) && new Set(p.notes.map(n => n.touche)).size === D.touches && p.duree > 5 }; })).every(x => x.ok);
    R.etoiles = [.59, .6, .8, .95].map(CO.etoilesPour).join(',');
    const g1 = CO.finirGlouglou('lune', 'facile', 1), g2 = CO.finirGlouglou('lune', 'facile', 1), g3 = CO.finirGlouglou('vent', 'difficile', .96);
    R.glouglou = { g1: g1.pieces, g2: g2.pieces, g3: g3.pieces, or: g3.plumesOr, total: CO.totalEtoiles(), max: CO.ETOILES_MAX };
    /* les défis : selon la date (la même date donne les mêmes), réclamés une fois, le bonus des 3 */
    e.batiments.montgolfiere = { reparee: true };
    R.semaine = DF.cleSemaine(new Date(2026, 9, 22)) === '2026-10-19' && DF.cleSemaine(new Date(2026, 9, 25)) === '2026-10-19' && DF.cleSemaine(new Date(2026, 9, 26)) === '2026-10-26';
    const D1 = JSON.stringify(DF.defis().jour.liste.map(x => [x.sorte, x.n])); delete e.defis; const D2 = JSON.stringify(DF.defis().jour.liste.map(x => [x.sorte, x.n]));
    const LJ = DF.defis().jour.liste;
    R.defis = { meme: D1 === D2, trois: LJ.length === 3 && new Set(LJ.map(x => x.sorte)).size === 3, ouverts: LJ.every(x => DF.SORTES[x.sorte].ouvert()), semaine: DF.defis().semaine.liste.length === 3 };
    const o0 = e.plumesOr, q0 = e.pieces;
    R.defis.pasEncore = DF.reclamer('jour', 0) === null;
    for (const x of LJ) x.depart = DF.SORTES[x.sorte].val() - x.n;
    const c1 = DF.reclamer('jour', 0), c2 = DF.reclamer('jour', 0), c3 = DF.reclamer('jour', 1), c4 = DF.reclamer('jour', 2);
    R.defis.claims = { une: c1 && c1.pieces === 60 && !c1.bonus, deux: c2 === null, bonus: !!(c4 && c4.bonus), pieces: e.pieces - q0, or: e.plumesOr - o0, reussis: DF.defis().reussis };
    /* les compteurs des défis */
    const n0 = DF.SORTES.nourries.val(); W.S.evenement('nourrir', 'x'); R.defis.compteur = DF.SORTES.nourries.val() === n0 + 1;
    /* les 100 succès */
    R.succes = { n: SU.SUCCES.length, ids: new Set(SU.SUCCES.map(x => x.id)).size, cats: SU.CATEGORIES.map(([k]) => SU.SUCCES.filter(x => x.cat === k).length).join(','), plumes: SU.SUCCES.every(x => x.plumes >= 1) };
    const o1 = e.plumesOr; for (const x of ESPECES) e.livre.attrapes[x.id] = Date.now();
    const N1 = SU.verifier();
    R.succes.livre = N1.some(x => x.nom === 'Le Grand Livre complet') && N1.some(x => x.nom === 'Le Dindromakus') && e.plumesOr - o1 === N1.reduce((a, x) => a + x.plumes, 0);
    R.succes.deux = SU.verifier().length === 0;
    /* les fêtes selon la date */
    const F = s => EV.feteLe(new Date(s + 'T12:00'));
    R.fetes = ['2026-10-17', '2026-10-18', '2026-11-03', '2026-11-04', '2026-12-09', '2026-12-10', '2027-01-06', '2027-01-07', '2026-03-28', '2026-03-29', '2026-04-12', '2026-04-13', '2027-03-21', '2027-04-04', '2026-06-30', '2026-07-01', '2026-08-31', '2026-09-01'].map(F).join(',');
    R.paques = [2026, 2027, 2028].map(a => EV.dimanchePaques(a).toDateString()).join(' / ');
    R.fetesAtelier = { chapeaux: Object.values(CHAPEAUX).filter(C => C.evenement).length, decos: Object.values(DECORATIONS).filter(D => D.evenement).length, nb: NB_CHAPEAUX + '/' + NB_DECORATIONS, parFete: Object.keys(EV.FETES).every(f => Object.values(CHAPEAUX).filter(C => C.evenement === f).length === 2 && Object.values(DECORATIONS).filter(D => D.evenement === f).length === 2) };
    e.batiments.atelier = { repare: true }; e.production.plumes = { nuit: 50 }; e.pieces += 500;
    EV.forcerFete('noel'); R.fetesAtelier.refuse = typeof PR.fabriquerChapeau('sorciere-halloween') === 'string';
    EV.forcerFete('halloween'); R.fetesAtelier.fabrique = PR.fabriquerChapeau('sorciere-halloween') === null && EV.typeFete() === 'nuit';
    EV.forcerFete(undefined);
    /* la sauvegarde : version 7 (la fin du chapitre 7 devient le début du chapitre 8) */
    const v = ET.migrer({ version: 6, profil: { nom: 'X' }, quete: { etape: 'fin', finies: [] } });
    R.migration = v.version === 7 && v.quete.etape === 'parlerPlumeau10' && v.batiments.scene && v.batiments.scene.repare === false;
    /* on remet tout comme avant */
    e.livre.attrapes = {}; delete e.defis; delete e.concours; e.succes = {}; e.stats.compteurs = {};
    return R;
  });
  for (const L of R.ligue) verifier(L.forte >= .7 && L.moyenne <= .3 && L.gagner && !L.canon, `Ligue ${L.id} : une dindie très entraînée gagne souvent (${Math.round(L.forte * 100)} %), une moyenne rarement (${Math.round(L.moyenne * 100)} %), il faut la 1re place, pas de canon`);
  verifier(R.maitres.length === 8 && R.maitres.every(M => M.star && M.meilleure >= .5 && M.moyenne <= .4), `les 8 Coupes des Maîtres : une star niveau 50, chacune gagnable par une dindie au maximum du bon type, très dure sinon (Orage niv. 42) (${R.maitres.map(M => M.id.slice(6) + ':' + Math.round(M.meilleure * 100) + '/' + Math.round(M.moyenne * 100)).join(' ')})`);
  verifier(R.relais.n === 2 && R.relais.passages === 2 && R.relais.jambe === 2 && R.relais.d && R.relais.place === 1, `le relais : 3 dindies, 2 passages, la 3e finit la course (${JSON.stringify(R.relais)})`);
  verifier(R.chrono.pistes >= 8 && R.chrono.seule && R.chrono.ordre && R.chrono.medaille === 'or' && R.chrono.lente === null, `le contre la montre : seule sur la piste, les médailles or < argent < bronze (${JSON.stringify(R.chrono)})`);
  verifier(R.sansFin.every(x => x.pos > 300 && (x.chutes >= 3 ? x.raison === 'chutes' : x.raison !== 'chutes')), `la course sans fin s’arrête à la 3e chute ou à bout de forces (${JSON.stringify(R.sansFin)})`);
  verifier(R.noteCommune === 12 && R.noteAssorti === 22 && R.noteChapeau === 16 && R.noteMythique === 40 + 12 + 8 + 5 + 5 + 6, `la note du défilé : rareté, chapeau assorti (+10) ou non (+4), chromatique, éveil, bonheur, niveau, ruban (${R.noteCommune}, ${R.noteAssorti}, ${R.noteChapeau}, ${R.noteMythique})`);
  verifier(R.rangs === '35,50,65,80,95' && R.defile.rate && R.defile.gagne1 && R.defile.gagne2 && R.defile.rang === 2 && R.defile.juges, `les rangs du défilé se gagnent un par un (${JSON.stringify(R.defile)})`);
  verifier(R.partitions && R.etoiles === '0,1,2,3', 'le glouglou : chaque partition a ses notes dans les bonnes touches (1, 2 ou 3), et 60 / 80 / 95 % donnent 1 / 2 / 3 étoiles');
  verifier(R.glouglou.g1 === 120 && R.glouglou.g2 === 0 && R.glouglou.g3 === 390 && R.glouglou.or === 1 && R.glouglou.total === 6 && R.glouglou.max === 45, `le glouglou récompense seulement quand on fait mieux (${JSON.stringify(R.glouglou)})`);
  verifier(R.semaine && R.defis.meme && R.defis.trois && R.defis.ouverts && R.defis.semaine, `les défis : 3 par jour et 3 par semaine (du lundi), tirés selon la date, parmi ce qui est ouvert (${JSON.stringify(R.defis)})`);
  verifier(R.defis.pasEncore && R.defis.claims.une && R.defis.claims.deux && R.defis.claims.bonus && R.defis.claims.pieces === 180 && R.defis.claims.or === 1 && R.defis.claims.reussis === 3 && R.defis.compteur, `un défi se réclame une seule fois ; les 3 du jour : + 1 plume d’or (${JSON.stringify(R.defis.claims)})`);
  verifier(R.succes.n === 100 && R.succes.ids === 100 && R.succes.cats === '30,16,18,4,16,10,4,2' && R.succes.plumes && R.succes.livre && R.succes.deux, `les 100 succès (${R.succes.cats}) se débloquent une fois, avec leurs plumes d’or`);
  verifier(R.fetes === ',halloween,halloween,,,noel,noel,,,paques,paques,,paques,paques,,ete,ete,' && R.paques === 'Sun Apr 05 2026 / Sun Mar 28 2027 / Sun Apr 16 2028', `les fêtes selon la date (${R.fetes}) ; Pâques : ${R.paques}`);
  verifier(R.fetesAtelier.chapeaux === 8 && R.fetesAtelier.decos === 8 && R.fetesAtelier.nb === '30/50' && R.fetesAtelier.parFete && R.fetesAtelier.refuse && R.fetesAtelier.fabrique, `les fêtes : 2 chapeaux et 2 décorations chacune, seulement pendant leur fête (${JSON.stringify(R.fetesAtelier)})`);
  verifier(R.migration, 'une sauvegarde version 6 (chapitre 7 fini) passe à la version 7 et reprend au chapitre 8');

  /* ══════════ 2. le chapitre 8 ══════════ */
  await pg.evaluate(async () => {
    const W = window.__jeu, e = W.etat(), { nouvelleDindie } = await import('./js/jeu/individus.js');
    e.version = 6; e.quete.etape = 'fin'; e.quete.finies = Array.from({ length: 51 }, (_, i) => 'q' + (i + 1)); e.pieces = 9000; e.plumesOr = 0;
    Object.assign(e.inventaire, { grandLivre: 1, filet: 1, billet: 1, jumelles: 1, moufles: 1, bottesLave: 1, lanterne: 1, ailes: 1 });
    Object.assign(e.batiments, { clapier: { repare: true, rangees: 2 }, couvoir: { repare: true, niveau: 2 }, nurserie: { repare: true, niveau: 1 }, montgolfiere: { reparee: true }, dindodrome: { ouvert: true }, entrainement: { repare: true },
      potager: { repare: true, niveau: 1 }, moulin: { repare: true }, atelier: { repare: true }, missions: { repare: true, niveau: 1 } });
    e.quete.domaine = { etape: 'fin', finies: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'h7'], vus: { mimi: true, plumeau: true, zephyr: true } };
    e.courses.badges = [1, 2, 3, 4, 5, 6, 7, 8]; e.reglages.heure = 'jour';
    /* (un caractère calme : sans « rêveuse » ou « têtue », qui ralentissent un peu, les Coupes des Maîtres se gagnent à coup sûr) */
    const mk = (esp, lieu, niv = 50) => { const d = nouvelleDindie(esp, { niveau: niv, stade: 'eveille', talents: [5, 5, 5], caractere: 'calme' }); d.entrainement = [15, 15, 15]; d.lieu = lieu; d.origine = 'croisement'; d.bonheur = 90; e.dindies.push(d); e.livre.attrapes[esp] = e.livre.vus[esp] = Date.now(); return d; };
    mk('panthere', 'equipe'); mk('jaguar', 'equipe'); mk('orage', 'equipe'); mk('etoile', 'clapier'); mk('celestia', 'clapier');
    for (const r of ['pres', 'maroc', 'belgique', 'jungle', 'banquise', 'volcan', 'foret', 'nuages']) e.monde.positions[r] = [0, 0];
    W.sauver();
  });
  await pg.reload(); await pg.waitForTimeout(1200);
  await pg.evaluate(() => document.querySelector('#profils .jouer').click());
  await pg.waitForFunction(() => window.__jeu && window.__jeu.monde, null, { timeout: 60000 }); await pg.waitForTimeout(1500); await dialogues(); await fermer();
  verifier(await etape() === 'parlerPlumeau10' && await pg.evaluate(() => window.__jeu.etat().version) === 7, 'une sauvegarde de l’étape 7 (chapitre 7 fini) reprend au début du chapitre 8 (version 7)');
  const coureuses = await pg.evaluate(() => Object.fromEntries(window.__jeu.etat().dindies.map(d => [d.espece, d.uid])));
  await agir('pnj-plumeau'); await fermer(); await jusqua('parlerGinette2'); await log('la dernière page du livre');
  verifier(await pg.evaluate(() => window.__jeu.J.combien('plumeEteinte') === 1), 'Plumeau donne la plume éteinte');
  await agir('pnj-ginette'); await jusqua('ligue1'); await log('Ginette : la Ligue des Légendes');
  await allerA('dindodrome'); await pg.waitForTimeout(800);
  const pnj = await pg.evaluate(() => Object.keys(window.__jeu.monde.pnj));
  verifier(['plumeline', 'dindini', 'mamie', 'rapido'].every(x => pnj.includes(x)), `les Quatre Plumes attendent au Dindodrome (${pnj.join(', ')})`);
  await pg.screenshot({ path: `${OUT}/quatre-plumes.png` });
  for (const [id, plume] of [['ligue1', 'plumeline'], ['ligue2', 'dindini'], ['ligue3', 'mamie'], ['ligue4', 'rapido'], ['ligueGontran', 'gontran']]) {
    let r = null;
    for (let k = 0; k < 4 && await etape() === id; k++) r = await courir(() => agir('pnj-' + plume, 'oui'), coureuses.panthere);
    verifier(await etape() !== id && await pg.evaluate(id => window.__jeu.DD.ligueGagnee(id), id), `${id} gagnée (${r && r.place === 1 ? "1re" : (r && r.place) + "e"} place)`);
  }
  await jusqua('parlerHibou3'); await log('la Ligue des Légendes est gagnée');
  await allerA('foret'); await agir('pnj-hibou'); await jusqua('pleineLune'); await log('la légende du Dindromakus');
  await agir('gadget-telescope'); await pg.waitForTimeout(2500);
  verifier(await pg.evaluate(async () => (await import('./js/moteur/temps.js')).pleineLune() && /2[23]h/.test(document.getElementById('hHeure').textContent)), 'le télescope : la nuit et la pleine lune arrivent');
  await pg.screenshot({ path: `${OUT}/pleine-lune.png` });
  await agir('gadget-autel'); await jusqua('dindromakus'); await log('la plume arc-en-ciel (Célestia est déjà là)');
  verifier(await pg.evaluate(() => window.__jeu.J.combien('plumeArcEnCiel') === 1 && !window.__jeu.J.combien('plumeEteinte')), 'sur la pierre de lune, la plume éteinte devient la plume arc-en-ciel');
  await allerA('domaine');
  await agir('couvoir'); await attendre('.couvoirF [data-choisir="0"]');
  for (const [i, u] of [coureuses.etoile, coureuses.celestia].entries()) { await clic(`[data-choisir="${i}"]`); await attendre(`.carteDindie[data-uid="${u}"]`); await clic(`.carteDindie[data-uid="${u}"]`); await pg.waitForTimeout(300); }
  const info = await pg.evaluate(() => document.querySelector('.infoCouple')?.textContent || '');
  verifier(/Dindromakus|légende/i.test(info), `au nid, le Couvoir annonce la légende (${info.trim().slice(0, 80)})`);
  await clic('#cCroiser'); await pg.waitForTimeout(800);
  verifier(await pg.evaluate(() => window.__jeu.EL.elevage().couveuses.some(o => o && o.espece === 'ruuulius') && !window.__jeu.J.combien('plumeArcEnCiel')), 'l’œuf du Dindromakus est couvé (la plume est utilisée)');
  await pg.screenshot({ path: `${OUT}/oeuf-dindromakus.png` });
  await pg.evaluate(() => { for (const o of window.__jeu.EL.elevage().couveuses) if (o) { o.debut -= 5 * 3600e3; o.fin -= 5 * 3600e3; } });
  await fermer(); await agir('couvoir');
  if (!await attendre('[data-eclore]', 15000)) throw new Error('l’œuf du Dindromakus n’est pas prêt');
  await pg.evaluate(() => { const i = window.__jeu.EL.elevage().couveuses.findIndex(o => o && o.espece === 'ruuulius'); document.querySelector(`[data-eclore="${i}"]`).click(); });
  await attendre('#eOk', 20000); await pg.waitForTimeout(500); await clic('#eOk');
  await pg.waitForTimeout(8000); await pg.screenshot({ path: `${OUT}/dindromakus.png` });
  await dialogues();
  verifier(await attendre('#generique', 40000), 'la cinématique du Dindromakus, puis le générique');
  await pg.waitForTimeout(3000); await pg.screenshot({ path: `${OUT}/generique.png` });
  const gen = await pg.evaluate(() => document.getElementById('generique').textContent);
  verifier(/Merci d’avoir joué/.test(gen) && /Plumeline/.test(gen) && /OpenRCT2/.test(gen), 'le générique : les personnages, les dindies, les musiques, merci d’avoir joué');
  await clic('.genPasser'); await pg.waitForTimeout(600); await clic('.genFin'); await pg.waitForTimeout(1500); await dialogues(); await fermer();
  verifier(await etape() === 'fin' && await pg.evaluate(() => window.__jeu.etat().quete.finies.length === 56 && !!window.__jeu.etat().livre.attrapes.ruuulius), 'l’histoire est finie : 56 quêtes, et le Dindromakus dans le Grand Livre');
  console.log(`chapitre 8 joué en ${((Date.now() - t0) / 1000).toFixed(0)} s`);

  /* ══════════ 3. après l'histoire ══════════ */
  /* la Scène des défilés */
  await pg.waitForTimeout(2500); await dialogues(); await fermer();
  verifier(await pg.evaluate(() => window.__jeu.QD.qd().etape) === 'parlerMimiScene', 'une nouvelle quête du Domaine s’ouvre : la Scène des défilés');
  await agir('pnj-mimi'); await agir('scene', 'oui'); await pg.waitForTimeout(3500);
  verifier(await pg.evaluate(() => window.__jeu.etat().batiments.scene.repare), 'la Scène des défilés est réparée');
  await pg.screenshot({ path: `${OUT}/scene.png` }); await fermer(); await pg.waitForTimeout(500);
  await agir('scene');
  await clic(`.sceneF .carteDindie[data-uid="${coureuses.panthere}"]`); await pg.waitForTimeout(200);
  await joueurAuto(0); await clic('#sDefiler');
  await pg.waitForFunction(() => window.__jeu.concours, null, { timeout: 8000 }); await pg.waitForTimeout(3000); await pg.screenshot({ path: `${OUT}/defile.png` });
  await attendre('#jOk', 40000); await pg.waitForTimeout(500); await pg.screenshot({ path: `${OUT}/jury.png` });
  const jury = await pg.evaluate(() => document.querySelector('.juryF').textContent.replace(/\s+/g, ' '));
  verifier(/30 pour les poses/.test(jury) && /gagné/.test(jury), `le défilé : les poses jouées en rythme (30 / 30), le jury, le concours gagné (${jury.slice(0, 90)})`);
  await clic('#jOk'); await pg.waitForTimeout(400);
  await clic('.sceneF .onglets [data-o="glouglou"]'); await pg.waitForTimeout(300);
  await clic('[data-chanter="jacques"][data-diff="moyen"]');
  await pg.waitForFunction(() => window.__jeu.concours, null, { timeout: 8000 }); await pg.waitForTimeout(4000); await pg.screenshot({ path: `${OUT}/glouglou.png` });
  await pg.waitForFunction(() => !window.__jeu.concours, null, { timeout: 120000 }); await pg.waitForTimeout(600);
  verifier(await pg.evaluate(() => window.__jeu.CO.etoilesChanson('jacques', 'moyen')) === 3, 'le glouglou : Frère Jacques (moyen) joué sans faute → 3 étoiles');
  await fermer(); await pg.waitForTimeout(3000); await dialogues(); await fermer();
  verifier(await pg.evaluate(() => window.__jeu.QD.qd().finies.includes('h8') && window.__jeu.J.combien('rubanBleu') >= 2), 'la quête de la Scène est finie (avec ses rubans bleus)');
  /* le Panneau des quêtes : les défis, les succès */
  await agir('quetes'); await pg.waitForTimeout(400);
  verifier(await pg.$$eval('.panneauF .defi', L => L.length) === 6, 'le Panneau des quêtes montre 3 défis du jour et 3 de la semaine');
  await pg.evaluate(() => { const DF = window.__jeu.DF; for (const x of DF.defis().semaine.liste) x.depart = DF.SORTES[x.sorte].val() - x.n; window.__jeu.J.changer('defis'); });
  await fermer(); await agir('quetes');
  const o0 = await pg.evaluate(() => window.__jeu.etat().plumesOr);
  for (let i = 0; i < 3; i++) { await clic('[data-reclamer^="semaine"]'); await pg.waitForTimeout(300); }
  verifier(await pg.evaluate(o0 => window.__jeu.DF.defis().semaine.bonus && window.__jeu.etat().plumesOr >= o0 + 3, o0), 'les 3 défis de la semaine réclamés : + 3 plumes d’or et un œuf mystère');
  await pg.screenshot({ path: `${OUT}/defis.png` });
  await clic('.panneauF [data-o="succes"]'); await pg.waitForTimeout(300); await pg.screenshot({ path: `${OUT}/succes.png` });
  const su = await pg.evaluate(() => ({ n: window.__jeu.SU.nbObtenus(), dindromakus: !!window.__jeu.etat().succes.s29, fin: !!window.__jeu.etat().succes.s92, scene: !!window.__jeu.etat().succes.s95, cartes: document.querySelectorAll('.succes').length }));
  verifier(su.n >= 20 && su.dindromakus && su.fin && su.scene && su.cartes === 100, `les succès gagnés en jouant (le Dindromakus, la fin de l’histoire, le premier défilé…) : ${su.n} / 100`);
  await fermer();
  /* l'Atelier pendant une fête (Noël, pour le test) et le Domaine décoré */
  await pg.evaluate(() => { const W = window.__jeu; W.EV.forcerFete('noel'); W.domaine.majFete('noel'); W.etat().production.plumes = { glace: 40 }; });
  await agir('atelier'); await pg.waitForTimeout(300);
  const ouvert = await pg.evaluate(() => document.querySelector('.atelierF .formes [data-f].actif')?.dataset.f);
  await clic('.atelierF [data-f="fete:noel"]'); await pg.waitForTimeout(300);
  verifier(ouvert === 'fete:noel' && await pg.evaluate(() => [...document.querySelectorAll('.atelierF [data-chapeau]')].map(b => b.dataset.chapeau).join(' ')) === 'bonnet-noel renne-noel', `pendant Noël (et après un premier chapeau), l’Atelier ouvre sur les 2 chapeaux de Noël (${ouvert})`);
  await clic('[data-chapeau="bonnet-noel"]'); await pg.waitForTimeout(300);
  verifier(await pg.evaluate(() => window.__jeu.PR.nbChapeau('bonnet-noel')) === 1, 'on fabrique le bonnet de Noël');
  await pg.screenshot({ path: `${OUT}/atelier-noel.png` }); await fermer();
  await pg.evaluate(() => { const J = window.__jeu; J.moi.racine.position.set(0, 0, 12.5); }); await pg.waitForTimeout(1500);
  await pg.screenshot({ path: `${OUT}/place-noel.png` });
  await pg.evaluate(() => { const W = window.__jeu; W.EV.forcerFete(undefined); W.domaine.majFete(W.EV.feteDu()); });
  /* l'après-histoire au Dindodrome */
  await allerA('dindodrome');
  await agir('bureau');
  const ids = await pg.evaluate(() => [...document.querySelectorAll('[data-courir]')].map(b => b.dataset.courir));
  verifier(['relais1', 'relais2', 'chrono-neutre', 'sansfin', 'maitre1', 'maitre8'].every(x => ids.includes(x)), `au Bureau des courses : les relais, le contre la montre, la course sans fin, les Coupes des Maîtres (${ids.filter(x => !/^c\d/.test(x)).length} courses spéciales)`);
  await fermer();
  let r = await courir(parBureau('relais1'), [coureuses.panthere, coureuses.jaguar, coureuses.orage]);
  verifier(r.place === 1 && /→/.test(r.texte) && /chacune des 3/.test(r.texte), `le relais (3 dindies) est gagné (${r.texte.slice(0, 80)})`);
  r = await courir(parBureau('chrono-neutre'), coureuses.panthere);
  verifier(/Médaille d’or/.test(r.texte) && await pg.evaluate(() => window.__jeu.etat().courses.chronos.neutre?.medaille === 'or'), 'le contre la montre : médaille d’or et record');
  r = await courir(parBureau('sansfin'), coureuses.panthere);
  const sf = await pg.evaluate(() => window.__jeu.etat().courses.sansFin);
  verifier(sf && sf.distance > 1000 && /♾️/.test(r.texte), `la course sans fin : ${sf && sf.distance} m (record)`);
  r = await courir(parBureau('maitre1'), coureuses.jaguar);
  for (let k = 0; k < 3 && r.place !== 1; k++) r = await courir(parBureau('maitre1'), coureuses.jaguar);
  verifier(r.place === 1 && await pg.evaluate(() => window.__jeu.DD.maitreGagne(1)), 'la Coupe des Maîtres des Prés est gagnée');
  await agir('trophees'); await pg.waitForTimeout(400);
  const tr = await pg.evaluate(() => document.querySelector('.voile').textContent);
  verifier(/Ligue des Légendes/.test(tr) && /Coupes des Maîtres/.test(tr) && /Contre la montre/.test(tr) && /course sans fin/.test(tr), 'la Salle des trophées : la Ligue, les Coupes des Maîtres, les records');
  await pg.screenshot({ path: `${OUT}/trophees.png` }); await fermer();
  /* le générique depuis la Maison */
  await allerA('domaine'); const m0 = await memoire(); await agir('maison');
  verifier(await clic('#mGenerique'), 'la Maison propose de revoir le générique');
  verifier(await attendre('#generique', 10000), 'le générique se revoit');
  await clic('.genPasser'); await pg.waitForTimeout(500); await clic('.genFin'); await pg.waitForTimeout(800); await fermer();
  /* la mémoire : les allers-retours au Dindodrome (avec une course) ne laissent rien derrière eux
     (le premier remplit encore quelques caches partagés ; on compare donc le 2e au 1er) */
  const tour = async () => { await allerA('dindodrome'); await courir(parBureau('chrono-neutre'), coureuses.panthere); await allerA('domaine'); await pg.waitForTimeout(800); return memoire(); };
  const m1 = await tour(), m2 = await tour();
  verifier(m2[0] <= m1[0] + 3 && m2[1] <= m1[1] + 2, `la mémoire reste stable : géométries ${m0[0]} → ${m1[0]} → ${m2[0]}, textures ${m0[1]} → ${m1[1]} → ${m2[1]}`);
} catch (e) { console.log('❌', e.message); echecs++; await pg.screenshot({ path: `${OUT}/erreur.png` }); }
verifier(!errs.length, `aucune erreur dans le navigateur${errs.length ? ' : ' + errs.join(' / ') : ''}`);
console.log(echecs ? `\n❌ étape 8 : ${echecs} échec(s)` : '\n✅ étape 8 : le chapitre 8, la fin et l’après-histoire sont jouables');
await b.close();
process.exit(echecs ? 1 : 0);
