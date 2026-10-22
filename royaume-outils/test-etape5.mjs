/* Tests automatiques de l'étape 5 (le Dindodrome : chapitre 4), avec Playwright.
   Usage : node royaume-outils/test-etape5.mjs [adresse] [largeur,hauteur,mobile] [dossier des captures]
   - adresse par défaut : http://localhost:8765/royaume/index.html
     (servir une copie de docs/royaume où la carte d'import pointe vers un three.module.js local,
      ou utiliser directement https://galvazzz-dotcom.github.io/rulie/royaume/index.html)
   - format par défaut : 390,844,1 (téléphone) ; CHROMIUM=/chemin/vers/chromium si besoin.
   Part d'une sauvegarde « fin du chapitre 3 » de l'étape 4 (elle doit passer au chapitre 4), puis joue
   tout le chapitre 4 : le portail, la course d'essai, le terrain d'entraînement et ses 3 jeux, les 4 championnats
   (3 courses + la finale), les 2 défis de Gontran, une leçon de compétence. Vérifie aussi l'équilibre des courses
   (des milliers de courses simulées), les gains, les badges, la mémoire du Dindodrome, la sauvegarde, et qu'il n'y a aucune erreur. */
import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
const URL = process.argv[2] || 'http://localhost:8765/royaume/index.html';
const [w, h, mob] = (process.argv[3] || '390,844,1').split(',').map(Number), OUT = process.argv[4] || 'captures-etape5';
mkdirSync(OUT, { recursive: true });
const b = await chromium.launch({ executablePath: process.env.CHROMIUM || undefined, args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
const pg = await b.newPage({ viewport: { width: w, height: h }, isMobile: !!mob, hasTouch: !!mob });
pg.on('dialog', d => d.accept());
const errs = []; pg.on('pageerror', e => errs.push(e.message + ' @ ' + (e.stack || '').split('\n').slice(1, 3).join(' | '))); pg.on('console', m => { if (m.type() === 'error' && !/CERT|404/.test(m.text())) errs.push('console: ' + m.text()); });
let echecs = 0;
const verifier = (ok, texte) => { console.log((ok ? '✅ ' : '❌ ') + texte); if (!ok) echecs++; };
const etape = () => pg.evaluate(() => window.__jeu.etat().quete.etape);
const log = async t => console.log(`[${await etape().catch(() => '?')}] ${t}`);
/* lire les dialogues (et répondre « oui » aux questions) */
const dialogues = async () => {
  for (let k = 0; k < 160; k++) {
    const encore = await pg.evaluate(() => {
      const d = document.querySelector('.dialogue'); if (!d) return false;
      const c = d.querySelector('.dChoix button'); if (c) { c.click(); return true; }
      d.dispatchEvent(new PointerEvent('pointerup')); return true;
    });
    if (!encore) return; await pg.waitForTimeout(90);
  }
};
const fermer = () => pg.evaluate(() => document.querySelectorAll('.voile .fermer').forEach(b => b.click()));
const jusqua = async (e, ms = 90000) => { const fin = Date.now() + ms; while (await etape() !== e) { if (Date.now() > fin) throw new Error(`étape ${e} jamais atteinte (reste à ${await etape()})`); await dialogues(); await pg.waitForTimeout(400); } };
const libre = () => pg.waitForFunction(() => !window.__jeu.occupe && !document.querySelector('.dialogue'), null, { timeout: 60000, polling: 200 }).catch(() => {});
async function agir(id) {
  await dialogues(); await fermer(); await libre();
  const ok = await pg.evaluate(id => { const J = window.__jeu, I = J.interactifs.find(i => i.id === id); if (!I) return false; const p = J.monde.grille.plusProcheLibre(I.x, I.z + .5); J.moi.racine.position.set(p[0], J.monde.sol(p[0], p[1]), p[1]); J.agir(I); return true; }, id);
  if (!ok) throw new Error('pas d’interactif ' + id);
  await pg.waitForTimeout(600); await dialogues(); await pg.waitForTimeout(300);
}
const clic = sel => pg.evaluate(sel => { const b = document.querySelector(sel); if (!b) return false; b.click(); return true; }, sel);
const attendre = async (sel, ms = 20000) => { const fin = Date.now() + ms; while (!await pg.$(sel)) { if (Date.now() > fin) return false; await dialogues(); await pg.waitForTimeout(250); } return true; };
async function allerA(lieu) {
  if (await pg.evaluate(() => window.__jeu.monde.id) === lieu) return;
  await agir(lieu === 'dindodrome' ? 'dindodrome' : 'sortie');
  await pg.waitForFunction(l => window.__jeu.monde.id === l && !window.__jeu.occupe, lieu, { timeout: 30000 });
  await pg.waitForTimeout(800); await dialogues();
}
/* une course : choisir la coureuse (l'Atomium), courir (d'un coup, ou en regardant), lire les résultats */
let captures = 0;
async function courir(declencher, { regarder = false } = {}) {
  await declencher();
  if (!await attendre('.coureuse', 15000)) throw new Error('pas de choix de coureuse');
  if (!captures) await pg.screenshot({ path: `${OUT}/choix.png` });
  await pg.evaluate(() => { const uid = window.__jeu.etat().dindies.find(d => d.espece === 'atomium').uid; document.querySelector(`.coureuse[data-uid="${uid}"]`).click(); });
  await pg.waitForFunction(() => window.__jeu.course, null, { timeout: 15000 });
  if (regarder) {
    await pg.waitForTimeout(1500); await pg.screenshot({ path: `${OUT}/depart.png` });
    await pg.waitForFunction(() => window.__jeu.course.C.t > .3, null, { timeout: 60000, polling: 100 });
    await pg.evaluate(() => { window.__jeu.course.vitesseTest = 3; });
    /* on saute au bon moment (l'anneau est vert) */
    const auto = setInterval(() => pg.evaluate(() => { const A = window.__jeu.course; if (!A) return; const R = A.C.joueur(), h = A.C.haies[R.prochaine]; if (h !== undefined && (h - R.pos) / R.v < .32 && (h - R.pos) / R.v > .16) A.sauter(); }).catch(() => {}), 30);
    await pg.waitForFunction(() => window.__jeu.course && window.__jeu.course.C.t > 7, null, { timeout: 120000, polling: 100 });
    await pg.evaluate(() => { window.__jeu.course.vitesseTest = 1; }); await pg.waitForTimeout(250);
    await pg.screenshot({ path: `${OUT}/course.png` });
    await pg.evaluate(() => { window.__jeu.course.vitesseTest = 6; });
    await pg.waitForFunction(() => !window.__jeu.course || window.__jeu.course.C.joueur().fini, null, { timeout: 180000, polling: 100 });
    clearInterval(auto);
    /* le podium (il dure un moment) */
    if (await attendre('#course.fini', 60000)) { await pg.waitForTimeout(600); await pg.screenshot({ path: `${OUT}/podium.png` }); }
  } else {
    await pg.evaluate(() => { window.__jeu.course.vitesseTest = 8; window.__jeu.course.podiumMs = 150; window.__jeu.course.finirVite(true); });
  }
  if (!await attendre('.resultatsF #rOk', 90000)) throw new Error('pas de résultats');
  const r = await pg.evaluate(() => ({ place: window.__jeu.course ? window.__jeu.course.C.joueur().place : null, titre: document.querySelector('.resultatsF .ruban').textContent }));
  if (!captures++) { await pg.waitForTimeout(400); await pg.screenshot({ path: `${OUT}/resultats.png` }); }
  await clic('.resultatsF #rOk'); await pg.waitForTimeout(700); await libre();
  return r;
}
const parBureau = id => async () => { await agir('bureau'); if (!await attendre(`[data-courir="${id}"]`, 10000)) throw new Error('pas de course ' + id + ' au Bureau'); await clic(`[data-courir="${id}"]`); };
/* un mini-jeu d'entraînement, joué comme une très bonne joueuse */
async function miniJeu(stat) {
  await clic(`[data-jeu="${stat}"]`);
  await pg.waitForFunction(() => window.__jeu.miniJeu, null, { timeout: 10000 });
  const sorte = await pg.evaluate(() => window.__jeu.miniJeu.sorte);
  const fin = Date.now() + 120000;
  while (!await pg.$('#mjOk')) {
    if (Date.now() > fin) throw new Error('mini-jeu ' + sorte + ' jamais fini');
    await pg.evaluate(s => {
      const M = window.__jeu.miniJeu; if (!M) return;
      if (s === 'sprint') { M.taper('g'); M.taper('d'); }
      if (s === 'souffle' && !M.tente() && Math.abs(M.phase() - .5) < .05) M.taper();
      if (s === 'haies') { const t = M.prochaine(); if (t > .16 && t < .34) M.taper(); }
    }, sorte);
    await pg.waitForTimeout(sorte === 'sprint' ? 90 : 20);
  }
  if (stat === 2) await pg.screenshot({ path: `${OUT}/minijeu-haies.png` });
  await clic('#mjOk'); await pg.waitForTimeout(500);
}

await pg.goto(URL);
await pg.evaluate(() => localStorage.clear()); await pg.reload(); await pg.waitForTimeout(1200);
await pg.evaluate(() => document.getElementById('tNouveau').click()); await pg.fill('#tNom', 'Test');
await pg.evaluate(() => document.getElementById('tGo').click()); await pg.waitForTimeout(500);
await pg.evaluate(() => document.querySelector('#prologue .passer').dispatchEvent(new PointerEvent('pointerup', { bubbles: true })));
await pg.waitForFunction(() => window.__jeu, null, { timeout: 60000 });
const t0 = Date.now();
try {
  /* l'équilibre des courses : des milliers de courses simulées (la joueuse ne saute pas mieux que les autres) */
  const E = await pg.evaluate(async () => {
    const { simuler } = await import('./js/jeu/course.js'), DD = await import('./js/jeu/dindodrome.js'), { nouvelleDindie } = await import('./js/jeu/individus.js'), { hasard } = await import('./js/moteur/couleurs.js');
    const profil = (esp, niv, stade, entr = [0, 0, 0], comp = []) => () => { const d = nouvelleDindie(esp, { niveau: niv, stade, talents: [2, 2, 2], caractere: 'calme' }); d.entrainement = entr; d.competences = comp; return d; };
    const taux = (id, f, n, experte = false) => { let p1 = 0, pod = 0; for (let k = 0; k < n; k++) { const o = DD.optionsCourse(DD.defCourse(id), f()); o.rng = hasard(id + k); const C = simuler(o, { joueuseIA: true, experte }); const R = C.coureurs.find(x => x.id === 'moi'); if (R.place === 1) p1++; if (R.place <= 3) pod++; } return { p1: p1 / n, pod: pod / n }; };
    const atomium20 = profil('atomium', 20, 'eveille'), glouglou20 = profil('glouglou', 20, 'eveille'), atomium24 = profil('atomium', 24, 'eveille', [12, 10, 10], ['turbo']);
    return {
      c1a: taux('c1a', atomium20, 120), c1f: taux('c1f', glouglou20, 120, true), c3f: taux('c3f', atomium20, 120),
      c4f20: taux('c4f', atomium20, 120, true), c4f24: taux('c4f', atomium24, 120, true), g2: taux('gontran2', atomium24, 120, true)
    };
  });
  verifier(E.c1a.pod > .9, `une dindie éveillée de niveau 20 monte presque toujours sur le podium de la Coupe des Prés (${Math.round(E.c1a.pod * 100)} %)`);
  verifier(E.c1f.p1 > .1 && E.c1f.p1 < .98, `un simple Glouglou éveillé peut battre Gaston en finale, s'il saute bien (${Math.round(E.c1f.p1 * 100)} %)`);
  verifier(E.c3f.p1 < .7, `la finale de la Pluie demande un peu d’entraînement (${Math.round(E.c3f.p1 * 100)} % sans)`);
  verifier(E.c4f20.p1 < .3 && E.c4f24.p1 > .4, `la finale des Lianes : difficile au niveau 20 (${Math.round(E.c4f20.p1 * 100)} %), faisable après l’entraînement (${Math.round(E.c4f24.p1 * 100)} %)`);
  verifier(E.g2.p1 > .4, `la revanche de Gontran se gagne avec une dindie entraînée (${Math.round(E.g2.p1 * 100)} %)`);

  /* les règles d'une course, une par une (sans dessin) */
  const RG = await pg.evaluate(async () => {
    const { creerCourse } = await import('./js/jeu/course.js'), DD = await import('./js/jeu/dindodrome.js'), { nouvelleDindie } = await import('./js/jeu/individus.js');
    const { COMPETENCES, competencesDe } = await import('./js/donnees/courses.js'), { hasard } = await import('./js/moteur/couleurs.js');
    const course = ({ id = 'c1b', comps = [], aide = false, stade = 'adulte', espece = 'glouglou', niveau = 15 } = {}) => {
      const d = nouvelleDindie(espece, { niveau, stade, talents: [2, 2, 2], caractere: 'calme' }); d.competences = comps;
      const o = DD.optionsCourse(DD.defCourse(id), d); o.aide = aide; o.rng = hasard('regles' + id); return creerCourse(o);
    };
    /* sauter toujours au même moment (tau = le temps avant la haie) */
    const sauts = (aide, tau) => {
      const C = course({ aide }), R = C.joueur();
      while (!R.fini && C.t < 200) { const h = C.haies[R.prochaine]; if (C.phase === 'course' && h !== undefined && !R.saut && R.chute <= 0) { const t = (h - R.pos) / Math.max(4, R.v); if (t <= tau && t > tau - .06) C.sauter(); } C.maj(1 / 60); }
      const H = C.evenements.filter(e => e.type === 'haie' && e.r === R.i);
      return { haies: H.length, chutes: H.filter(e => e.q === 'chute' || e.q === 'tot').length, parfaits: H.filter(e => e.q === 'parfait').length };
    };
    const tot = sauts(false, 1.05), bien = sauts(false, .3), aideTot = sauts(true, 1.05);
    /* « Fonce ! » : plus de fatigue */
    const fatigue = f => { const C = course({ id: 'c1a' }); C.foncer(f); while (C.t < 12) C.maj(1 / 60); return C.joueur().E / C.joueur().Emax; };
    /* chacune des 20 compétences se lance (pour une dindie éveillée qui la connaît) */
    const lancees = Object.keys(COMPETENCES).filter(id => {
      const C = course({ id: id === 'glissade' || id === 'velours' ? 'c2c' : 'c1b', comps: [id], stade: 'eveille' }), R = C.joueur(), k = competencesDe(R.d).indexOf(id);
      if (k < 0) return false;
      while (!R.fini && C.t < 200) { C.competence(k); C.maj(1 / 30); if (C.evenements.some(e => e.type === 'competence' && e.r === R.i && e.id === id)) return true; }
      return false;
    });
    /* le Turbo-Glou fait vraiment aller plus vite */
    const apres = turbo => { const C = course({ id: 'c1a', comps: turbo ? ['turbo'] : [] }), k = C.joueur().competences.indexOf('turbo'); while (C.t < 8) { if (turbo && C.t > 2) C.competence(k); C.maj(1 / 60); } return C.joueur().pos; };
    /* une finale perdue : pas de badge (et un conseil dans les résultats) */
    const Cf = course({ id: 'c1f', espece: 'crachin', niveau: 5 }); while (!Cf.fini && Cf.t < 300) Cf.maj(1 / 30);
    const res = DD.enregistrer(DD.defCourse('c1f'), Cf, Cf.joueur().d);
    const UI = await import('./js/ui/dindodrome.js');
    const fen = UI.ouvrirResultats(DD.defCourse('c1f'), Cf, res, null);
    const conseil = !!document.querySelector('.resultatsF .conseilC');
    document.querySelector('.resultatsF #rOk').click(); await fen;
    return { tot, bien, aideTot, fonce: fatigue(true), normal: fatigue(false), lancees, total: Object.keys(COMPETENCES).length, turbo: apres(true) - apres(false), perdue: { place: res.place, badge: DD.badge(1), conseil } };
  });
  verifier(RG.tot.chutes === RG.tot.haies && RG.tot.haies > 5, `sauter trop tôt, c’est la chute à chaque haie (${RG.tot.chutes}/${RG.tot.haies})`);
  verifier(RG.bien.parfaits === RG.bien.haies && !RG.bien.chutes, `sauter quand l’anneau est vert : que des sauts parfaits (${RG.bien.parfaits}/${RG.bien.haies})`);
  verifier(RG.aideTot.chutes === 0, 'en mode aide, on ne tombe jamais, même en sautant trop tôt');
  verifier(RG.fonce < RG.normal - .1, `« Fonce ! » fatigue beaucoup plus (endurance après 12 s : ${Math.round(RG.fonce * 100)} % au lieu de ${Math.round(RG.normal * 100)} %)`);
  verifier(RG.lancees.length === RG.total, `les ${RG.total} compétences se lancent en course (${RG.lancees.length}/${RG.total})`);
  verifier(RG.turbo > 2, `le Turbo-Glou fait gagner du terrain (+ ${RG.turbo.toFixed(1)} m en 8 s)`);
  verifier(RG.perdue.place > 1 && !RG.perdue.badge && RG.perdue.conseil, `une finale perdue ne donne pas de badge, et les résultats donnent un conseil (${RG.perdue.place}e place)`);

  /* une sauvegarde de l'étape 4, à la fin du chapitre 3 : une dindie éveillée bien entraînée, et deux autres */
  await pg.evaluate(async () => {
    const J = window.__jeu, e = J.etat(), { nouvelleDindie } = await import('./js/jeu/individus.js');
    e.version = 3; e.quete.etape = 'fin'; e.quete.finies = Array.from({ length: 22 }, (_, i) => 'q' + (i + 1)); e.pieces = 900;
    delete e.courses; delete e.batiments.dindodrome; delete e.batiments.entrainement;
    Object.assign(e.inventaire, { grandLivre: 1, filet: 1, billet: 1, friandise: 12, chapeauSoleil: 1, parapluie: 1, biscuit: 2 });
    Object.assign(e.batiments, { clapier: { repare: true, rangees: 1 }, montgolfiere: { reparee: true }, couvoir: { repare: true }, nurserie: { repare: true } });
    for (const [esp, niv, stade] of [['atomium', 30, 'eveille'], ['glouglou', 12, 'adulte'], ['dindasable', 11, 'adulte']]) {
      const d = nouvelleDindie(esp, { niveau: niv, stade, talents: esp === 'atomium' ? [4, 4, 4] : [1, 2, 1], caractere: 'calme', origine: 'sauvage:pres' });
      e.dindies.push(d); e.livre.attrapes[esp] = 1; e.livre.vus[esp] = 1;
    }
    e.reglages.heure = 'jour'; e.monde.lieu = 'domaine';
    J.sauver();
  });
  await pg.reload(); await pg.waitForTimeout(1200);
  await pg.evaluate(() => document.querySelector('#profils .jouer').click());
  await pg.waitForFunction(() => window.__jeu, null, { timeout: 60000 }); await pg.waitForTimeout(800);
  verifier(await etape() === 'parlerPlumeau5', 'une sauvegarde de l’étape 4 (fin du chapitre 3) reprend au début du chapitre 4');

  /* Q23 : le Dindodrome ouvre */
  await agir('pnj-plumeau'); await jusqua('parlerGinette'); await log('le Professeur annonce le Dindodrome');
  await agir('pnj-ginette'); await jusqua('entrerDindodrome');
  verifier(await pg.evaluate(() => window.__jeu.etat().batiments.dindodrome.ouvert), 'Coach Ginette ouvre le portail du Dindodrome');
  await pg.evaluate(() => { const J = window.__jeu, I = J.interactifs.find(i => i.id === 'dindodrome'); J.moi.racine.position.set(I.x - 3, 0, I.z + 1); }); await pg.waitForTimeout(1400);
  await pg.screenshot({ path: `${OUT}/portail.png` });
  await allerA('dindodrome'); await jusqua('courseEssai'); await log('arrivée au Dindodrome');
  await pg.screenshot({ path: `${OUT}/dindodrome.png` });
  const r0 = await courir(() => agir('pnj-chrono'), { regarder: true });
  await jusqua('kitEntrainement'); await log(`la course d’essai : ${r0.place}e place`);
  verifier(r0.place >= 1 && r0.place <= 6, `la course d’essai se court jusqu’au bout (${r0.titre})`);

  /* Q24 : le terrain d'entraînement */
  await allerA('domaine');
  await agir('pnj-mimi'); await pg.waitForSelector('.acheter[data-id="kitConstruction"]', { timeout: 20000 });
  await clic('.acheter[data-id="kitConstruction"]'); await pg.waitForTimeout(400); await fermer(); await jusqua('reparerEntrainement');
  await agir('entrainement'); await jusqua('entrainement3');
  verifier(await attendre('.entrainementF [data-jeu]'), 'après la réparation, le terrain d’entraînement s’ouvre');
  await pg.evaluate(() => { const uid = window.__jeu.etat().dindies.find(d => d.espece === 'atomium').uid; document.querySelector(`.choixEnt .carteDindie[data-uid="${uid}"]`)?.click(); }); await pg.waitForTimeout(300);
  await pg.screenshot({ path: `${OUT}/entrainement.png` });
  const e0 = await pg.evaluate(() => window.__jeu.etat().dindies.find(d => d.espece === 'atomium').entrainement.slice());
  for (const st of [0, 1, 2]) await miniJeu(st);
  const e1 = await pg.evaluate(() => window.__jeu.etat().dindies.find(d => d.espece === 'atomium').entrainement.slice());
  verifier(e1.every((v, i) => v >= e0[i] + 2), `les 3 jeux d’entraînement donnent des points (${e0.join('/')} → ${e1.join('/')})`);
  await fermer(); await jusqua('coupe1'); await log('le terrain d’entraînement est réparé, les 3 jeux sont joués');
  await pg.evaluate(() => { const J = window.__jeu, I = J.interactifs.find(i => i.id === 'entrainement'); J.moi.racine.position.set(I.x, 0, I.z + 1.5); }); await pg.waitForTimeout(1400);
  await pg.screenshot({ path: `${OUT}/entrainement-3d.png` });

  /* les championnats : 3 courses sur le podium, puis la finale */
  const coupe = async n => {
    await allerA('dindodrome');
    for (const c of ['a', 'b', 'c']) { const r = await courir(parBureau(`c${n}${c}`)); if (r.place > 3) { const r2 = await courir(parBureau(`c${n}${c}`)); if (r2.place > 3) throw new Error(`c${n}${c} : ${r2.place}e place`); } }
    if (n === 1) { await agir('bureau'); await pg.waitForTimeout(400); await pg.screenshot({ path: `${OUT}/bureau.png` }); await fermer(); }
    let r = await courir(parBureau(`c${n}f`)); if (r.place !== 1) r = await courir(parBureau(`c${n}f`));
    verifier(r.place === 1 && await pg.evaluate(n => window.__jeu.DD.badge(n), n), `championnat ${n} : 3 podiums, puis la finale gagnée → le badge`);
  };
  await coupe(1); await jusqua('gontran1'); await log('la Coupe des Prés est gagnée');
  /* Q26 : Gontran */
  await courir(() => agir('pnj-gontran')); await jusqua('lecon'); await log('Gontran est battu');
  /* Q27 : une leçon chez Coach Ginette (la première est offerte) */
  await allerA('domaine');
  const p0 = await pg.evaluate(() => window.__jeu.etat().pieces);
  await agir('entrainement'); await attendre('.onglets'); await clic('.onglets [data-o="lecons"]'); await pg.waitForTimeout(300);
  await pg.evaluate(() => { const uid = window.__jeu.etat().dindies.find(d => d.espece === 'atomium').uid; document.querySelector(`.choixEnt .carteDindie[data-uid="${uid}"]`)?.click(); }); await pg.waitForTimeout(300);
  await pg.screenshot({ path: `${OUT}/lecons.png` });
  await clic('[data-apprendre="turbo"]'); await pg.waitForTimeout(400); await fermer();
  await jusqua('coupe2');
  /* (la quête « Une nouvelle compétence » rapporte 150 pièces : la leçon, elle, n'a rien coûté) */
  verifier(await pg.evaluate(p0 => { const d = window.__jeu.etat().dindies.find(d => d.espece === 'atomium'); return d.competences.includes('turbo') && window.__jeu.etat().pieces === p0 + 150; }, p0), 'l’Atomium apprend Turbo-Glou (la première leçon est offerte)');
  await coupe(2); await jusqua('coupe3'); await log('la Coupe des Dunes est gagnée');
  await coupe(3); await jusqua('coupe4'); await log('la Coupe de la Pluie est gagnée');
  await coupe(4); await jusqua('gontran2'); await log('la Coupe des Lianes est gagnée');
  await courir(() => agir('pnj-gontran')); await jusqua('fin'); await log('la revanche de Gontran est gagnée');
  /* une deuxième leçon coûte 200 pièces ; on peut oublier une compétence */
  const L2 = await pg.evaluate(() => {
    const D = window.__jeu.DD, d = window.__jeu.etat().dindies.find(x => x.espece === 'glouglou'), p = window.__jeu.etat().pieces;
    const err = D.apprendre(d, 'sprint'), paye = p - window.__jeu.etat().pieces, appris = d.competences.includes('sprint');
    D.oublier(d, 'sprint');
    return { err, paye, appris, oubliee: !d.competences.includes('sprint') };
  });
  verifier(!L2.err && L2.paye === 200 && L2.appris && L2.oubliee, `une deuxième leçon coûte 200 🪙, et on peut oublier une compétence (${JSON.stringify(L2)})`);
  verifier(await pg.evaluate(() => window.__jeu.DD.nbBadges()) === 4, '4 badges dans la Salle des trophées');
  verifier(await attendre('#finOk', 20000), 'la fin du chapitre 4 s’affiche');
  await pg.waitForTimeout(500); await pg.screenshot({ path: `${OUT}/fin.png` }); await clic('#finOk');
  await agir('trophees'); await pg.waitForTimeout(400); await pg.screenshot({ path: `${OUT}/trophees.png` }); await fermer();
  console.log(`chapitre 4 joué en ${((Date.now() - t0) / 1000).toFixed(0)} s (${await pg.evaluate(() => window.__jeu.DD.courses().faites)} courses)`);
  /* la mémoire : aller et revenir 2 fois du Dindodrome */
  const mem = [];
  for (let k = 0; k < 2; k++) { await allerA('domaine'); await allerA('dindodrome'); await pg.waitForTimeout(600); mem.push(await pg.evaluate(async () => { const { renderer } = await import('./js/moteur/rendu.js'); return renderer.info.memory; })); }
  verifier(mem[1].geometries <= mem[0].geometries + 2 && mem[1].textures <= mem[0].textures + 1, `la mémoire reste stable en allant au Dindodrome (${mem.map(m => m.geometries + ' géo / ' + m.textures + ' tex').join(' → ')})`);
  /* la sauvegarde : on reprend au Dindodrome, chapitre 4 fini */
  await pg.evaluate(() => window.__jeu.sauver()); await pg.reload(); await pg.waitForTimeout(1200);
  await pg.evaluate(() => document.querySelector('#profils .jouer').click());
  await pg.waitForFunction(() => window.__jeu, null, { timeout: 60000 }); await pg.waitForTimeout(1200);
  const apres = await pg.evaluate(() => ({ lieu: window.__jeu.monde.id, etape: window.__jeu.etat().quete.etape, badges: window.__jeu.DD.nbBadges(), records: Object.keys(window.__jeu.DD.courses().records).length }));
  verifier(apres.lieu === 'dindodrome' && apres.etape === 'fin' && apres.badges === 4 && apres.records >= 3, `après rechargement : au Dindodrome, chapitre 4 fini, 4 badges, des records (${JSON.stringify(apres)})`);
} catch (e) { console.log('❌', e.message); echecs++; await pg.screenshot({ path: `${OUT}/erreur.png` }); }
verifier(!errs.length, `aucune erreur dans le navigateur${errs.length ? ' : ' + errs.join(' / ') : ''}`);
console.log(echecs ? `\n❌ étape 5 : ${echecs} échec(s)` : '\n✅ étape 5 : le chapitre 4 est jouable de bout en bout');
await b.close();
process.exit(echecs ? 1 : 0);
