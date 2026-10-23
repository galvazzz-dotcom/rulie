/* Tests automatiques de l'étape 6 (la production : le Domaine produit, se décore, et les missions rapportent), avec Playwright.
   Usage : node royaume-outils/test-etape6.mjs [adresse] [largeur,hauteur,mobile] [dossier des captures]
   - adresse par défaut : http://localhost:8765/royaume/index.html
   - format par défaut : 390,844,1 (téléphone) ; CHROMIUM=/chemin/vers/chromium si besoin.
   1. Les règles, une par une : le Potager (planter, arroser, récolter), le Moulin, les friandises du Moulin, les plumes du jour,
      l'Atelier (30 chapeaux, 50 décorations, toutes dessinables en 3D), coiffer, poser et ranger une décoration (la carte se bouche
      puis se libère), le Bureau des missions (chance, départ, retour, réussite et échec), les améliorations, construire un habitat,
      rendre à la nature, le Gâteau d'amour, l'œuf épique.
   2. Une sauvegarde de l'étape 5 (chapitre 4 fini) passe à la version 5 ; puis on joue les 7 quêtes du Domaine comme une joueuse,
      avec les fenêtres : Mimi, le Potager, le Moulin, les plumes, l'Atelier, un chapeau, une décoration posée avec le mode « Décorer »,
      le Bureau des missions, une amélioration, le Gâteau d'amour au Couvoir. Puis : rendre une dindie à la nature.
   3. La mémoire (le mode Décorer, les reconstructions, un aller-retour dans les Prés), la sauvegarde, et aucune erreur. */
import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
const URL = process.argv[2] || 'http://localhost:8765/royaume/index.html';
const [w, h, mob] = (process.argv[3] || '390,844,1').split(',').map(Number), OUT = process.argv[4] || 'captures-etape6';
mkdirSync(OUT, { recursive: true });
const b = await chromium.launch({ executablePath: process.env.CHROMIUM || undefined, args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
const pg = await b.newPage({ viewport: { width: w, height: h }, isMobile: !!mob, hasTouch: !!mob });
pg.on('dialog', d => d.accept());
const errs = []; pg.on('pageerror', e => errs.push(e.message + ' @ ' + (e.stack || '').split('\n').slice(1, 3).join(' | '))); pg.on('console', m => { if (m.type() === 'error' && !/CERT|404/.test(m.text())) errs.push('console: ' + m.text()); });
let echecs = 0;
const verifier = (ok, texte) => { console.log((ok ? '✅ ' : '❌ ') + texte); if (!ok) echecs++; };
const qd = () => pg.evaluate(() => window.__jeu.etat().quete.domaine.etape);
const log = async t => console.log(`[${await qd().catch(() => '?')}] ${t}`);
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
const fermer = () => pg.evaluate(() => document.querySelectorAll('.voile .fermer').forEach(b => b.click()));
const jusqua = async (e, ms = 30000) => { const fin = Date.now() + ms; while (await qd() !== e) { if (Date.now() > fin) throw new Error(`étape du Domaine ${e} jamais atteinte (reste à ${await qd()})`); await dialogues(); await pg.waitForTimeout(300); } };
const libre = () => pg.waitForFunction(() => !window.__jeu.occupe && !document.querySelector('.dialogue'), null, { timeout: 60000, polling: 200 }).catch(() => {});
async function agir(id, choix = null) {
  await dialogues(); await fermer(); await libre();
  const ok = await pg.evaluate(id => { const J = window.__jeu, I = J.interactifs.find(i => i.id === id); if (!I) return false; const p = J.monde.grille.plusProcheLibre(I.x, I.z + .5); J.moi.racine.position.set(p[0], J.monde.sol(p[0], p[1]), p[1]); J.agir(I); return true; }, id);
  if (!ok) throw new Error('pas d’interactif ' + id);
  await pg.waitForTimeout(600); await dialogues(choix); await pg.waitForTimeout(300);
}
const clic = sel => pg.evaluate(sel => { const b = document.querySelector(sel); if (!b || b.disabled) return false; b.click(); return true; }, sel);
const attendre = async (sel, ms = 20000) => { const fin = Date.now() + ms; while (!await pg.$(sel)) { if (Date.now() > fin) return false; await dialogues(); await pg.waitForTimeout(250); } return true; };
const vers = async (x, z, ms = 1800) => { await pg.evaluate(([x, z]) => { const J = window.__jeu, p = J.monde.grille.plusProcheLibre(x, z); J.moi.racine.position.set(p[0], 0, p[1]); }, [x, z]); await pg.waitForTimeout(ms); };
/* le temps passe : les plantes poussent, les missions finissent */
const avancerTemps = () => pg.evaluate(() => { const J = window.__jeu, P = J.PR.prod(); for (const q of P.parcelles) if (q) { q.debut -= 4e6; q.fin -= 4e6; } for (const m of J.PR.missions().encours) { m.debut -= 4e7; m.fin -= 4e7; } J.verifierProduction(); });

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
    const W = window.__jeu, e = W.etat(), PR = W.PR, J = W.J, EL = W.EL, D = W.domaine, R = {};
    const { nouvelleDindie, adnDe } = await import('./js/jeu/individus.js'), DON = await import('./js/donnees/production.js'), { PAR_ID } = await import('./js/donnees/especes.js');
    const { creerDindie } = await import('./js/dindies/modele.js'), { portraitDindie } = await import('./js/dindies/portrait.js'), { fabDeco } = await import('./js/monde/decorations.js');
    e.quete.finies = Array.from({ length: 30 }, (_, i) => 'q' + (i + 1)); e.quete.etape = 'fin'; e.pieces = 100; e.plumesOr = 50;
    Object.assign(e.batiments, { clapier: { repare: true, rangees: 1 }, couvoir: { repare: true, niveau: 1 }, nurserie: { repare: true, niveau: 1 } });
    e.enclos.prairie = { construit: true, niveau: 1 };
    const mk = (esp, lieu, o = {}) => { const d = nouvelleDindie(esp, { niveau: 20, ...o }); d.lieu = lieu; e.dindies.push(d); return d; };
    const a = mk('glouglou', 'enclos:prairie'), b = mk('trefle', 'enclos:prairie'), c = mk('atomium', 'equipe', { stade: 'eveille' }), bebe = mk('paquerette', 'clapier', { stade: 'poussin' });
    const pluie = mk('crachin', 'clapier'), sable = mk('dindasable', 'clapier'), starter = mk('braise', 'equipe', { origine: 'premiere' });
    /* réparer */
    R.reparerPauvre = typeof PR.reparer('potager') === 'string' && !e.batiments.potager.repare;
    e.pieces = 100000;
    R.reparer = PR.reparer('potager') === null && e.batiments.potager.repare && e.pieces === 100000 - DON.PRIX_REPARATION.potager;
    /* le Potager */
    R.parcelles = PR.prod().parcelles.length;
    R.sansGraine = typeof PR.planter(0, 'mais') === 'string';
    J.ajouterObjet('grainesMais', 3);
    PR.planter(0, 'mais'); const p = PR.prod().parcelles[0];
    R.deuxFois = typeof PR.planter(0, 'mais') === 'string';
    R.duree = Math.round((p.fin - p.debut) / 1000); R.stade1 = PR.stadeParcelle(p);
    R.arroser = PR.arroser(0) && Math.round((p.fin - p.debut) / 1000) === 225 && PR.arroser(0) === false;
    R.tropTot = PR.recolter(0) === null;
    p.fin = Date.now() - 1; R.stade3 = PR.stadeParcelle(p);
    const m0 = J.combien('mais'), rec = PR.recolter(0); R.recolte = rec && rec.n >= 3 && rec.n <= 4 && J.combien('mais') === m0 + rec.n && !PR.prod().parcelles[0];
    /* le Moulin et ses friandises */
    R.moulinFerme = typeof PR.fabriquer('galetteMais') === 'string';
    PR.reparer('moulin'); const mais0 = J.combien('mais');
    R.galette = PR.fabriquer('galetteMais') === null && J.combien('galetteMais') === 1 && J.combien('mais') === mais0 - 2;
    R.manque = typeof PR.fabriquer('tarteBaies') === 'string';
    R.recettes = Object.keys(DON.RECETTES).length;
    c.entrainement = [14, 0, 0]; J.ajouterObjet('galetteMais', 1);
    const f1 = PR.donnerFriandiseMoulin(c, 'galetteMais'); R.entrainement = typeof f1 === 'object' && c.entrainement[0] === 15 && typeof PR.donnerFriandiseMoulin(c, 'galetteMais') === 'string';
    J.ajouterObjet('tarteBaies', 2); const niv0 = c.niveau, xp0 = c.xp; PR.donnerFriandiseMoulin(c, 'tarteBaies'); R.tarte = c.niveau > niv0 || c.xp >= xp0 + 300;
    R.bebeTarte = typeof PR.donnerFriandiseMoulin(bebe, 'tarteBaies') === 'string';
    /* les plumes du jour */
    R.aPrendre = PR.plumesAPrendre('prairie');
    R.ramasse = PR.ramasserPlumes('prairie'); R.encore = PR.ramasserPlumes('prairie'); R.plumes = PR.plumes('prairie');
    R.sansEnclos = PR.plumesAPrendre('nuit');
    /* l'Atelier : 30 chapeaux (10 formes), 50 décorations (sans ceux des fêtes de l'étape 8) */
    const H0 = Object.values(DON.CHAPEAUX).filter(x => !x.evenement);
    R.nb = [H0.length, new Set(H0.map(x => x.forme)).size, Object.values(DON.DECORATIONS).filter(x => !x.evenement).length];
    R.nbTout = [new Set(Object.values(DON.CHAPEAUX).map(x => x.forme)).size, Object.keys(DON.DECORATIONS).length];
    R.atelierFerme = typeof PR.fabriquerChapeau('fete-prairie') === 'string';
    PR.reparer('atelier'); const pl0 = PR.plumes('prairie');
    R.chapeau = PR.fabriquerChapeau('fete-prairie') === null && PR.plumes('prairie') === pl0 - DON.CHAPEAUX['fete-prairie'].cout.plumes.prairie;
    R.chapeauTrop = typeof PR.fabriquerChapeau('viking-ciel') === 'string';
    R.coiffeBebe = typeof PR.coiffer(bebe, 'fete-prairie') === 'string';
    PR.coiffer(c, 'fete-prairie'); R.porte = c.chapeau === 'fete-prairie' && !PR.prod().chapeaux['fete-prairie'] && adnDe(c).chapeau === 'fete';
    PR.coiffer(c, null); R.enleve = !c.chapeau && PR.prod().chapeaux['fete-prairie'] === 1;
    /* chaque forme de chapeau se dessine en 3D et en portrait ; chaque décoration se construit en 3D */
    R.formesOk = [...new Set(Object.values(DON.CHAPEAUX).map(x => x.forme))].filter(f => { const A = { ...adnDe(c), chapeau: f, couleurChapeau: '#ef4444', couleurChapeau2: '#fde047', crete: 'aucune' }; const m = creerDindie(A); const ok = !!m.racine; m.liberer(); return ok && portraitDindie(A).length > 2000; }).length;
    R.decosOk = Object.keys(DON.DECORATIONS).filter(id => { const F = fabDeco(id); return F && F.g.children.length > 0; }).length;
    /* poser une décoration : où c'est permis, la carte se bouche, et se libère quand on la range */
    const Lb = W.interactifs.find(i => i.id === 'labo'), Ma = W.interactifs.find(i => i.id === 'maison');
    R.interdits = [D.peutPoserDeco('banc-bois', 13, -12), D.peutPoserDeco('banc-bois', 0, 70), D.peutPoserDeco('banc-bois', Ma.x, Ma.z), D.peutPoserDeco('banc-bois', -40.5, -12)];
    let place = null;
    for (let r = 0; r < 12 && !place; r++) for (let k = 0; k < 16 && !place; k++) { const x = 8 + Math.cos(k * .39) * r, z = 22 + Math.sin(k * .39) * r; if (D.peutPoserDeco('statue-prairie', x, z)) place = [x, z]; }
    void Lb;
    PR.prod().plumes.prairie = 40; R.place = !!place;
    PR.fabriquerDeco('statue-prairie');
    const Dp = PR.poserDeco('statue-prairie', place[0], place[1], 0); D.ajouterDeco(Dp);
    R.bouche = !D.grille.libreEn(Dp.x, Dp.z) && !D.peutPoserDeco('banc-bois', Dp.x, Dp.z) && D.decos.has(Dp.k);
    PR.rangerDeco(Dp.k); D.retirerDeco(Dp.k);
    R.libere = D.grille.libreEn(Dp.x, Dp.z) && PR.prod().decorations['statue-prairie'] === 1 && !PR.prod().deco.length;
    const vieux = PR.prod().deco; PR.prod().deco = Array.from({ length: PR.MAX_DECO }, (_, i) => ({ k: 'f' + i, id: 'rocher', x: 0, z: 0, r: 0 }));
    R.max = typeof PR.poserDeco('statue-prairie', 1, 1) === 'string'; PR.prod().deco = vieux;
    /* le Bureau des missions */
    R.missionFerme = typeof PR.envoyer('x', [a.uid]) === 'string';
    PR.reparer('missions'); const o = PR.missions().offertes[0];
    R.offres = PR.missions().offertes.length;
    R.chances = [PR.chanceMission(o, [sable]), PR.chanceMission(o, [a, b, c])];
    R.bebeMission = typeof PR.envoyer(o.id, [bebe.uid]) === 'string';
    R.quatre = typeof PR.envoyer(o.id, [a.uid, b.uid, c.uid, pluie.uid]) === 'string';
    R.envoi = PR.envoyer(o.id, [a.uid, c.uid]) === null && a.lieu === 'mission' && c.lieu === 'mission' && e.compagnon !== c.uid;
    R.bloquee = typeof J.deplacer(a, 'clapier') === 'string';
    R.uneSeule = typeof PR.envoyer(PR.missions().offertes[0].id, [b.uid]) === 'string' && PR.missions().offertes.length === 4;
    const M1 = PR.missions().encours[0]; R.tropTotMission = PR.rapporter(M1.id) === null;
    M1.fin = Date.now() - 1; M1.reussite = true; let p0 = e.pieces;
    const res = PR.rapporter(M1.id);
    R.retour = a.lieu === 'enclos:prairie' && c.lieu === 'equipe' && e.pieces - p0 === M1.pieces && Object.keys(res.plumes).length === 1 && Object.keys(res.objets).length >= 1;
    PR.envoyer(PR.missions().offertes[0].id, [sable.uid]); const M2 = PR.missions().encours[0]; M2.fin = Date.now() - 1; M2.reussite = false; p0 = e.pieces;
    const res2 = PR.rapporter(M2.id); R.echec = !res2.reussite && e.pieces - p0 === Math.round(M2.pieces * .3) && !Object.keys(res2.plumes).length && sable.lieu === 'clapier';
    /* les améliorations */
    R.places = [J.placesEnclos('prairie')]; PR.ameliorer('enclos', 'prairie'); R.places.push(J.placesEnclos('prairie'));
    PR.ameliorer('couvoir'); R.couveuses = EL.elevage().couveuses.length;
    PR.ameliorer('nurserie'); R.nurserie = J.placesNurserie();
    PR.ameliorer('potager'); R.parcelles2 = PR.prod().parcelles.length;
    PR.ameliorer('missions'); R.missionsMax = PR.nbMissionsMax();
    PR.ameliorer('clapier'); R.clapier = J.placesClapier();
    e.plumesOr = 0; R.sansOr = typeof PR.ameliorer('enclos', 'prairie') === 'string'; e.plumesOr = 50;
    for (let k = 0; k < 6; k++) PR.ameliorer('enclos', 'prairie');
    R.enclosMax = PR.niveauDe('enclos', 'prairie') === 5 && J.placesEnclos('prairie') === 10 && typeof PR.ameliorer('enclos', 'prairie') === 'string';
    R.habitat = PR.construireHabitat('feu') === null && e.enclos.feu.construit;
    /* rendre à la nature */
    R.premiere = typeof PR.relacher(starter) === 'string';
    PR.prod().plumes.pluie = 30; PR.fabriquerChapeau('noeud-pluie'); PR.coiffer(b, 'noeud-pluie');
    const pr0 = PR.plumes('prairie'), rr = PR.relacher(b);
    R.relache = !e.dindies.includes(b) && rr.type === 'prairie' && PR.plumes('prairie') === pr0 + DON.PLUMES_RELACHER.rare && PR.prod().chapeaux['noeud-pluie'] === 1;
    /* le Gâteau d'amour : beaucoup plus d'hybrides */
    const hyb = gateau => { let n = 0; for (let k = 0; k < 3000; k++) { const id = EL.resultatCroisement(a, pluie, false, gateau); if (['croisement', 'recette'].includes(PAR_ID[id].origine.sorte)) n++; } return n / 3000; };
    R.hybrides = [hyb(false), hyb(true)];
    EL.elevage().couveuses.fill(null); J.ajouterObjet('gateauAmour');
    const g0 = PR.prod().stats.gateaux || 0, oeuf = EL.croiser(a, pluie, { gateau: true });
    R.gateau = typeof oeuf === 'object' && !J.combien('gateauAmour') && PR.prod().stats.gateaux === g0 + 1;
    R.sansGateau = typeof EL.croiser(c, sable, { gateau: true }) === 'string';
    /* l'œuf épique */
    /* (une mission plus haut a pu rapporter un œuf épique : on compte) */
    e.monde.positions = { pres: [0, 0], maroc: [0, 0] }; const ep0 = J.combien('oeufEpique'); J.ajouterObjet('oeufEpique');
    const oe = EL.couverOeufEpique(); R.epique = typeof oe === 'object' && PAR_ID[oe.espece].rarete === 'epique' && J.combien('oeufEpique') === ep0;
    return R;
  });
  verifier(R.reparerPauvre && R.reparer, 'réparer un bâtiment de la production coûte des pièces (sans assez de pièces : pas de réparation)');
  verifier(R.parcelles === 4 && R.sansGraine && R.deuxFois, 'le Potager a 4 parcelles ; il faut une graine, et une parcelle plantée ne se replante pas');
  verifier(R.duree === 300 && R.stade1 === 1 && R.arroser, `le maïs pousse en 5 minutes (${R.duree} s) ; arrosé, un quart plus vite (une seule fois)`);
  verifier(R.tropTot && R.stade3 === 3 && R.recolte, 'on ne récolte qu’une plante mûre : 2 à 3 épis, + 1 si elle a été arrosée');
  verifier(R.moulinFerme && R.galette && R.manque && R.recettes === 6, 'le Moulin : 6 recettes ; 2 épis de maïs → une galette ; sans les ingrédients, rien');
  verifier(R.entrainement && R.tarte && R.bebeTarte, 'les friandises du Moulin : + 1 point d’entraînement (15 au plus), la tarte + 300 XP, pas pour les bébés');
  verifier(R.aPrendre === 3 && R.ramasse === 3 + 6 && R.encore === 0 && R.plumes === 9 && R.sansEnclos === 0, `les plumes du jour : 1 par commune, 2 par rare, une fois par jour (+ 6 en cadeau la première fois) → ${R.ramasse}`);
  verifier(R.nb[0] === 30 && R.nb[1] === 10 && R.nb[2] === 50, `l’Atelier : ${R.nb[0]} chapeaux (${R.nb[1]} formes) et ${R.nb[2]} décorations`);
  verifier(R.atelierFerme && R.chapeau && R.chapeauTrop, 'un chapeau se paie en plumes de son type (et en pièces) ; sans les plumes, rien');
  verifier(R.coiffeBebe && R.porte && R.enleve, 'coiffer une dindie adulte (le chapeau quitte le stock, et se voit), l’enlever (il y retourne) ; pas les bébés');
  verifier(R.formesOk === R.nbTout[0] && R.decosOk === R.nbTout[1], `les ${R.nbTout[0]} formes de chapeaux (avec celles des fêtes) se dessinent en 3D et en portrait (${R.formesOk}) ; les ${R.nbTout[1]} décorations en 3D (${R.decosOk})`);
  verifier(R.interdits.every(x => !x) && R.place, 'on ne pose pas une décoration dans un bâtiment, dans l’eau, devant une porte, ni dans un enclos');
  verifier(R.bouche && R.libere && R.max, 'une décoration posée bouche la carte ; rangée, elle libère la place et revient dans le stock ; 60 au plus');
  verifier(R.missionFerme && R.offres === 4 && R.chances[1] > R.chances[0], `le Bureau des missions : 4 missions proposées ; plus de dindies (et les bons types) = plus de chances (${R.chances.map(x => Math.round(x * 100) + ' %').join(' → ')})`);
  verifier(R.bebeMission && R.quatre && R.envoi && R.bloquee && R.uneSeule, 'en mission : 1 à 3 adultes, qu’on ne peut plus déplacer ; une seule mission à la fois au niveau 1');
  verifier(R.tropTotMission && R.retour, 'au retour (pas avant) : les dindies rentrent chez elles, avec des pièces, des plumes et une surprise');
  verifier(R.echec, 'une mission ratée rapporte quand même un peu (30 % des pièces), et les dindies rentrent');
  verifier(R.places.join() === '2,4' && R.couveuses === 3 && R.nurserie === 8 && R.parcelles2 === 6 && R.missionsMax === 2 && R.clapier === 60,
    `les améliorations : enclos ${R.places.join(' → ')} places, ${R.couveuses} couveuses, Nurserie ${R.nurserie}, ${R.parcelles2} parcelles, ${R.missionsMax} missions, Clapier ${R.clapier}`);
  verifier(R.sansOr && R.enclosMax, 'les grandes améliorations demandent des plumes d’or ; un enclos s’arrête au niveau 5 (10 places)');
  verifier(R.habitat, 'on peut construire un nouvel habitat (400 🪙)');
  verifier(R.premiere && R.relache, 'rendre à la nature : jamais la toute première dindie ; une rare laisse 6 plumes, et son chapeau revient au stock');
  verifier(R.hybrides[1] > R.hybrides[0] * 1.5, `le Gâteau d’amour : beaucoup plus d’hybrides (${Math.round(R.hybrides[0] * 100)} % → ${Math.round(R.hybrides[1] * 100)} %)`);
  verifier(R.gateau && R.sansGateau, 'le Gâteau d’amour se mange au croisement (sans gâteau : pas de croisement « au gâteau »)');
  verifier(R.epique, 'un œuf épique donne une dindie épique');

  /* ══════════ 2. une sauvegarde de l'étape 5, puis les quêtes du Domaine ══════════ */
  /* (la sauvegarde est écrite juste avant le rechargement : la partie en cours, elle, se sauve en partant) */
  const [cle, json] = await pg.evaluate(async () => {
    const J = window.__jeu, e = structuredClone(J.etat()), { nouvelleDindie } = await import('./js/jeu/individus.js'), SAUVE = await import('./js/moteur/sauvegarde.js');
    for (const k of Object.keys(e)) if (!['profil', 'reglages', 'stats', 'quotidien'].includes(k)) delete e[k];
    Object.assign(e, { version: 4, pieces: 2500, plumesOr: 2, inventaire: { grandLivre: 1, filet: 1, billet: 1, friandise: 12, chapeauSoleil: 1, parapluie: 1 }, dindies: [], compagnon: null,
      enclos: { prairie: { construit: true, niveau: 1 }, pluie: { construit: true, niveau: 1 } },
      batiments: { clapier: { repare: true, rangees: 1 }, montgolfiere: { reparee: true }, couvoir: { repare: true }, nurserie: { repare: true }, dindodrome: { ouvert: true }, entrainement: { repare: true } },
      elevage: { couveuses: [null, null], croisements: 3, eclosions: 3, premierHybride: true, compteur: 3 }, livre: { vus: {}, attrapes: {}, chromas: {} },
      courses: { badges: [1, 2, 3, 4], places: {}, faites: 20, victoires: 8, records: {}, entrainements: 5, lecons: 1 },
      quete: { etape: 'fin', compteur: 0, finies: Array.from({ length: 30 }, (_, i) => 'q' + (i + 1)), nourries: [] },
      monde: { position: [0, 30], ramasses: {}, lieu: 'domaine', positions: { pres: [0, 0], maroc: [0, 0], belgique: [0, 0] } } });
    const D = [['paquerette', 'enclos:prairie', 'premiere'], ['glouglou', 'enclos:prairie', 'cadeau'], ['crachin', 'enclos:pluie', 'sauvage:belgique'], ['atomium', 'equipe', 'sauvage:belgique'], ['dindasable', 'equipe', 'sauvage:maroc'], ['trefle', 'clapier', 'sauvage:pres']];
    for (const [esp, lieu, origine] of D) { const d = nouvelleDindie(esp, { niveau: esp === 'atomium' ? 30 : 15, stade: esp === 'atomium' ? 'eveille' : 'adulte', origine }); d.lieu = lieu; e.dindies.push(d); e.livre.attrapes[esp] = 1; e.livre.vus[esp] = 1; }
    e.compagnon = e.dindies[3].uid; e.reglages.heure = 'jour';
    return [`royaumeDindies.v1.${SAUVE.profilActif()}`, JSON.stringify(e)];
  });
  await pg.addInitScript(([cle, json]) => { if (!sessionStorage.getItem('sauvegardeV4')) { localStorage.setItem(cle, json); sessionStorage.setItem('sauvegardeV4', '1'); } }, [cle, json]);
  await pg.reload(); await pg.waitForTimeout(1200);
  await pg.evaluate(() => document.querySelector('#profils .jouer').click());
  await pg.waitForFunction(() => window.__jeu, null, { timeout: 60000 }); await pg.waitForTimeout(1500);
  const mig = await pg.evaluate(() => { const e = window.__jeu.etat(); return { v: e.version, p: !!e.production && Array.isArray(e.production.deco), b: e.batiments.potager && !e.batiments.potager.repare && e.batiments.couvoir.niveau === 1, q: e.quete.domaine.etape, hud: document.querySelector('#hQuete').textContent }; });
  verifier(mig.v >= 5 && mig.p && mig.b, `une sauvegarde de l’étape 5 passe à la version ${mig.v} (la production est prête, ses bâtiments en ruine)`);
  verifier(mig.q === 'parlerMimi' && /Potager/.test(mig.hud), `la première quête du Domaine commence : « ${mig.hud.slice(0, 60)}… »`);
  await pg.screenshot({ path: `${OUT}/hud.png` });

  /* H1 : le Potager */
  await vers(-21, -22); await pg.screenshot({ path: `${OUT}/ruine-potager.png` });
  await agir('pnj-mimi'); await jusqua('reparerPotager'); await fermer();
  verifier(await pg.evaluate(() => window.__jeu.J.combien('grainesMais')) === 5, 'Mimi offre 5 graines de maïs');
  await agir('potager', 'oui');
  verifier(await attendre('.potagerF'), 'réparer le Potager (après la question), puis sa fenêtre s’ouvre'); await jusqua('planter');
  await clic('[data-planter="0"]'); await pg.waitForTimeout(200); await clic('[data-graine="mais"]'); await pg.waitForTimeout(200);
  await clic('[data-graine="mais"]'); await pg.waitForTimeout(200); await clic('[data-arroser="0"]'); await pg.waitForTimeout(300);
  await pg.screenshot({ path: `${OUT}/potager.png` });
  await jusqua('recolter'); await log('deux graines de maïs plantées');
  await fermer(); await avancerTemps(); await pg.waitForTimeout(600);
  await vers(-21, -22); await pg.screenshot({ path: `${OUT}/potager-3d.png` });
  await agir('potager'); await attendre('#pTout'); await clic('#pTout'); await pg.waitForTimeout(400);
  await jusqua('reparerMoulin'); await log('la première récolte');
  verifier(await pg.evaluate(() => window.__jeu.J.combien('mais') >= 5 && window.__jeu.J.combien('grainesBle') === 5), 'la récolte donne du maïs ; la quête « Le Potager » donne des graines de blé et de haricot');
  /* H2 : le Moulin */
  await agir('moulin', 'oui'); verifier(await attendre('.moulinF'), 'le Moulin se répare, et sa fenêtre s’ouvre');
  await clic('[data-faire="galetteMais"]'); await pg.waitForTimeout(400); await pg.screenshot({ path: `${OUT}/moulin.png` });
  await jusqua('parlerPlumeau'); await log('une galette de maïs');
  await fermer(); await vers(21, -24); await pg.screenshot({ path: `${OUT}/moulin-3d.png` });
  /* H3 : l'Atelier des plumes */
  /* (le Professeur a aussi une lettre pour le chapitre 5 : on lui parle une deuxième fois pour les plumes) */
  await agir('pnj-plumeau'); if (await qd() === 'parlerPlumeau') await agir('pnj-plumeau'); await jusqua('plumes');
  await agir('enclos-prairie'); await attendre('#ePlumes'); await pg.screenshot({ path: `${OUT}/enclos-plumes.png` });
  await clic('#ePlumes'); await pg.waitForTimeout(300); await jusqua('reparerAtelier'); await log('les plumes du jour ramassées');
  await agir('atelier', 'oui'); verifier(await attendre('.atelierF'), 'l’Atelier des plumes se répare, et sa fenêtre s’ouvre');
  await pg.waitForTimeout(400); await pg.screenshot({ path: `${OUT}/atelier.png` });
  verifier(await clic('[data-chapeau="fete-prairie"]'), 'le premier chapeau se fabrique avec les plumes du jour');
  await jusqua('coiffer'); await fermer();
  await pg.evaluate(() => { const J = window.__jeu, d = J.etat().dindies.find(x => x.espece === 'atomium'); J.P.ouvrirFiche(d, { surChange: J.syncDindies }); });
  await attendre('#fChapeau'); await clic('#fChapeau'); await attendre('[data-mettre]'); await pg.screenshot({ path: `${OUT}/choix-chapeau.png` });
  await clic('[data-mettre]'); await pg.waitForTimeout(500); await pg.screenshot({ path: `${OUT}/fiche-chapeau.png` });
  await jusqua('deco'); await fermer(); await log('l’Atomium porte un chapeau de fête');
  await pg.waitForTimeout(800); await pg.screenshot({ path: `${OUT}/chapeau-3d.png` });
  /* H4 : une décoration */
  await agir('atelier'); await attendre('[data-o="decos"]'); await clic('[data-o="decos"]'); await pg.waitForTimeout(300);
  verifier(await clic('[data-deco="massif-rose"]'), 'une décoration se fabrique à l’Atelier');
  await pg.screenshot({ path: `${OUT}/atelier-decos.png` });
  await jusqua('poser'); await fermer();
  await vers(6, 18, 1200);
  verifier(await clic('#hDeco'), 'le bouton 🎨 Décorer apparaît'); await attendre('.decoChoix');
  await clic('.decoChoix'); await pg.waitForTimeout(400);
  let ok = await pg.evaluate(() => window.__jeu.decorateur.selection?.ok);
  for (let k = 0; k < 20 && !ok; k++) { await pg.evaluate(k => window.__jeu.decorateur.toucher(innerWidth * (.3 + (k % 5) * .1), innerHeight * (.35 + Math.floor(k / 5) * .08)), k); ok = await pg.evaluate(() => window.__jeu.decorateur.selection?.ok); }
  await clic('#dTourner'); await pg.waitForTimeout(200);
  await pg.screenshot({ path: `${OUT}/decorer.png` });
  verifier(await clic('#dPoser'), 'le fantôme vert se pose ici'); await pg.waitForTimeout(300);
  await clic('#dFini'); await jusqua('parlerZephyr'); await log('le massif de roses est posé');
  verifier(await pg.evaluate(() => window.__jeu.domaine.decos.size === 1 && window.__jeu.PR.prod().deco.length === 1), 'la décoration est dans le Domaine (et dans la sauvegarde)');
  await pg.screenshot({ path: `${OUT}/deco-posee.png` });
  /* H5 : le Bureau des missions */
  await agir('pnj-zephyr'); await jusqua('reparerMissions');
  await agir('missions', 'oui'); verifier(await attendre('.missionsF [data-choisir]'), 'le Bureau des missions se répare, et propose des missions');
  await pg.screenshot({ path: `${OUT}/missions.png` });
  await clic('.missionsF [data-choisir]'); await attendre('.equipeF .carteDindie');
  await pg.evaluate(() => { const L = [...document.querySelectorAll('.equipeF .carteDindie')]; L[0].click(); });
  await pg.waitForTimeout(200); await pg.evaluate(() => { const L = [...document.querySelectorAll('.equipeF .carteDindie')]; L[1].click(); }); await pg.waitForTimeout(200);
  await pg.screenshot({ path: `${OUT}/equipe-mission.png` });
  const chance = await pg.evaluate(() => document.querySelector('.chanceMission > b').textContent);
  await clic('#mPartir'); await pg.waitForTimeout(400); await jusqua('rapporter'); await log(`deux dindies parties en mission (${chance})`);
  verifier(await pg.evaluate(() => window.__jeu.etat().dindies.filter(d => d.lieu === 'mission').length === 2), 'deux dindies sont en mission');
  await fermer(); await avancerTemps(); await pg.waitForTimeout(2600);
  await vers(-13, 37); await pg.screenshot({ path: `${OUT}/bureau-3d.png` });
  await agir('missions'); await attendre('[data-rapporter]'); await clic('[data-rapporter]'); await pg.waitForTimeout(500);
  await pg.screenshot({ path: `${OUT}/mission-retour.png` });
  await jusqua('ameliorer'); await fermer(); await log('les dindies sont rentrées');
  verifier(await pg.evaluate(() => !window.__jeu.etat().dindies.some(d => d.lieu === 'mission')), 'au retour, plus personne n’est en mission');
  /* H6 : une amélioration */
  await agir('enclos-prairie'); await attendre('[data-ameliorer]'); await clic('[data-ameliorer]'); await pg.waitForTimeout(400);
  await jusqua('gateau'); await fermer(); await log('le Pré fleuri passe au niveau 2');
  verifier(await pg.evaluate(() => window.__jeu.etat().enclos.prairie.niveau === 2 && window.__jeu.J.placesEnclos('prairie') === 4), 'l’enclos amélioré a 4 places');
  /* H7 : le Gâteau d'amour (baies, blé et maïs du Potager) */
  await agir('potager'); await attendre('.potagerF');
  for (const [i, g] of [[0, 'baie'], [1, 'baie'], [2, 'ble'], [3, 'mais']]) { await clic(`[data-planter="${i}"]`); await pg.waitForTimeout(150); await clic(`[data-graine="${g}"]`); await pg.waitForTimeout(150); }
  await clic('#pArroser'); await pg.waitForTimeout(200); await fermer(); await avancerTemps(); await pg.waitForTimeout(400);
  await agir('potager'); await attendre('#pTout'); await clic('#pTout'); await pg.waitForTimeout(300); await fermer();
  await agir('moulin'); await attendre('[data-faire="gateauAmour"]'); verifier(await clic('[data-faire="gateauAmour"]'), 'le Moulin fait un Gâteau d’amour (2 baies, 1 blé, 1 maïs)');
  await jusqua('gateauNid'); await fermer();
  await agir('couvoir'); await attendre('[data-choisir="0"]');
  for (const [k, esp] of [[0, 'glouglou'], [1, 'crachin']]) { await clic(`[data-choisir="${k}"]`); await attendre('.voile:last-child .carteDindie'); await pg.evaluate(esp => { const uid = window.__jeu.etat().dindies.find(d => d.espece === esp).uid; document.querySelector(`.voile:last-child .carteDindie[data-uid="${uid}"]`).click(); }, esp); await pg.waitForTimeout(300); }
  await pg.evaluate(() => { const c = document.querySelector('#cGateau'); c.checked = true; c.dispatchEvent(new Event('change')); });
  await pg.screenshot({ path: `${OUT}/couvoir-gateau.png` });
  await clic('#cCroiser'); await pg.waitForTimeout(500);
  await jusqua('fin'); await fermer(); await log('le Gâteau d’amour est mangé au Couvoir');
  const fin = await pg.evaluate(() => ({ finies: window.__jeu.etat().quete.domaine.finies.length, hud: document.querySelector('#hQuete').textContent, oeufs: window.__jeu.EL.elevage().couveuses.filter(Boolean).length }));
  verifier(fin.finies === 7 && fin.oeufs === 1, `les 7 quêtes du Domaine sont finies (un œuf couve au Couvoir) ; le bandeau : « ${fin.hud.slice(0, 50)}… »`);
  await pg.evaluate(() => window.__jeu.P.ouvrirJournal()); await pg.waitForTimeout(400); await pg.screenshot({ path: `${OUT}/journal.png` });
  verifier(await pg.evaluate(() => [...document.querySelectorAll('.quete.finie')].some(q => /Gâteau d’amour/.test(q.textContent))), 'le journal montre les quêtes du Domaine'); await fermer();
  /* rendre une dindie à la nature (avec la fiche) */
  const nb0 = await pg.evaluate(() => window.__jeu.etat().dindies.length);
  await pg.evaluate(() => { const J = window.__jeu, d = J.etat().dindies.find(x => x.espece === 'trefle'); J.P.ouvrirFiche(d, { surChange: J.syncDindies }); });
  await attendre('#fRelacher'); await clic('#fRelacher'); await pg.waitForTimeout(500); await pg.screenshot({ path: `${OUT}/relacher.png` }); await dialogues('oui'); await pg.waitForTimeout(400);
  verifier(await pg.evaluate(n => window.__jeu.etat().dindies.length === n - 1 && !window.__jeu.etat().dindies.some(d => d.espece === 'trefle') && !document.querySelector('.fiche'), nb0), 'rendre une dindie à la nature (elle part, la fiche se ferme)');
  await pg.evaluate(() => window.__jeu.P.ouvrirSac({ decorer: window.__jeu.ouvrirDecorer })); await pg.waitForTimeout(300); await pg.screenshot({ path: `${OUT}/sac.png` }); await fermer();
  console.log(`quêtes du Domaine jouées en ${((Date.now() - t0) / 1000).toFixed(0)} s`);

  /* ══════════ 3. la mémoire et la sauvegarde ══════════ */
  const info = () => pg.evaluate(async () => { const { renderer } = await import('./js/moteur/rendu.js'); return { ...renderer.info.memory }; });
  const m0 = await info();
  for (let k = 0; k < 4; k++) {
    await pg.evaluate(() => { window.__jeu.PR.prod().decorations['massif-rose'] = 1; window.__jeu.ouvrirDecorer(); }); await pg.waitForTimeout(150);
    await clic('.decoChoix'); await pg.waitForTimeout(250); await clic('#dAnnuler'); await clic('#dFini'); await pg.waitForTimeout(150);
    await pg.evaluate(() => window.__jeu.domaine.majProduction('potager')); await pg.waitForTimeout(150);
  }
  const m1 = await info();
  verifier(m1.geometries <= m0.geometries + 2 && m1.textures <= m0.textures + 1, `la mémoire reste stable (mode Décorer, Potager reconstruit) : ${m0.geometries} → ${m1.geometries} géo, ${m0.textures} → ${m1.textures} tex`);
  /* la sauvegarde : tout est là après rechargement */
  const avant = await pg.evaluate(() => { const e = window.__jeu.etat(); return JSON.stringify([e.production.deco.length, e.batiments.potager.repare, e.batiments.missions.repare, e.enclos.prairie.niveau, e.quete.domaine.finies.length, e.dindies.find(d => d.espece === 'atomium').chapeau]); });
  await pg.evaluate(() => window.__jeu.sauver()); await pg.reload(); await pg.waitForTimeout(1200);
  await pg.evaluate(() => document.querySelector('#profils .jouer').click());
  await pg.waitForFunction(() => window.__jeu, null, { timeout: 60000 }); await pg.waitForTimeout(1500);
  const apres = await pg.evaluate(() => { const e = window.__jeu.etat(); return JSON.stringify([e.production.deco.length, e.batiments.potager.repare, e.batiments.missions.repare, e.enclos.prairie.niveau, e.quete.domaine.finies.length, e.dindies.find(d => d.espece === 'atomium').chapeau]); });
  const deco3d = await pg.evaluate(() => window.__jeu.domaine.decos.size);
  verifier(avant === apres && deco3d === 1, `après rechargement : décoration, bâtiments, enclos, quêtes et chapeau sont là (${apres})`);
  await vers(-21, -22); await pg.screenshot({ path: `${OUT}/domaine-apres.png` });
} catch (e) { console.log('❌', e.message); echecs++; await pg.screenshot({ path: `${OUT}/erreur.png` }); }
verifier(!errs.length, `aucune erreur dans le navigateur${errs.length ? ' : ' + errs.join(' / ') : ''}`);
console.log(echecs ? `\n❌ étape 6 : ${echecs} échec(s)` : '\n✅ étape 6 : le Domaine produit, se décore, et les missions rapportent');
await b.close();
process.exit(echecs ? 1 : 0);
