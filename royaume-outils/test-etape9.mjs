/* Tests automatiques de l'étape 9 (la version 1.0), avec Playwright.
   Usage : node royaume-outils/test-etape9.mjs [adresse] [largeur,hauteur,mobile] [dossier des captures]
   - adresse par défaut : http://localhost:8765/royaume/index.html
   - format par défaut : 390,844,1 (téléphone) ; CHROMIUM=/chemin/vers/chromium si besoin.
   1. Les règles : les 72 cris (lus depuis le Grand Livre, puis « enregistrés » hors ligne : ni muets, ni saturés, ni trop longs),
      les musiques (chaque morceau existe et a ses crédits ; les îles 4 à 8 et les grandes courses ont les leurs),
      les doubles (la meilleure de l'espèce, ce que le Professeur refuse d'étudier, l'étoile de talent jamais au-delà de 5,
      le chapeau rendu), les biscuits (5 par jour chez Mimi), les astuces (une seule fois ; le carnet s'ouvre au fil des chapitres),
      la qualité d'image qui s'adapte (les 4 crans, l'image légère), et la durée d'une partie avec le simulateur.
   2. Le jeu : une capture d'un double (la carte dit ses talents et la compare), le Grand Livre (combien on en a, le cri 🔊),
      l'étude au Labo (avec son astuce), les biscuits chez Mimi, la Maison (le confort, l'image légère, Échap), le carnet
      d'astuces depuis le Journal, l'astuce du Couvoir (une seule fois), la zone de capture bleue, et plus de scintillement
      (la fontaine, le hublot du Labo, le fronton du Musée). Aucune erreur. */
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'fs';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
const URL = process.argv[2] || 'http://localhost:8765/royaume/index.html';
const [w, h, mob] = (process.argv[3] || '390,844,1').split(',').map(Number), OUT = process.argv[4] || 'captures-etape9';
mkdirSync(OUT, { recursive: true });
const ICI = dirname(fileURLToPath(import.meta.url));
const b = await chromium.launch({ executablePath: process.env.CHROMIUM || undefined, args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
const pg = await b.newPage({ viewport: { width: w, height: h }, isMobile: !!mob, hasTouch: !!mob });
pg.on('dialog', d => d.accept());
const errs = []; pg.on('pageerror', e => errs.push(e.message + ' @ ' + (e.stack || '').split('\n').slice(1, 3).join(' | '))); pg.on('console', m => { if (m.type() === 'error' && !/CERT|404/.test(m.text())) errs.push('console : ' + m.text()); });
let echecs = 0;
const verifier = (ok, texte) => { console.log((ok ? '✅ ' : '❌ ') + texte); if (!ok) echecs++; };
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
const libre = () => pg.waitForFunction(() => !window.__jeu.occupe && !document.querySelector('.dialogue'), null, { timeout: 60000, polling: 200 }).catch(() => {});
async function agir(id, choix = null) {
  await dialogues(); await fermer(); await libre();
  const ok = await pg.evaluate(id => { const J = window.__jeu, I = J.interactifs.find(i => i.id === id); if (!I) return false; const p = J.monde.grille.plusProcheLibre(I.x, I.z + .5); J.moi.racine.position.set(p[0], J.monde.sol(p[0], p[1]), p[1]); J.agir(I); return true; }, id);
  if (!ok) throw new Error('pas d’interactif ' + id + ' (' + await pg.evaluate(() => window.__jeu.monde.id) + ')');
  await pg.waitForTimeout(600); await dialogues(choix); await pg.waitForTimeout(300);
}
const clic = sel => pg.evaluate(sel => { const b = document.querySelector(sel); if (!b || b.disabled) return false; b.click(); return true; }, sel);
const texte = sel => pg.evaluate(sel => document.querySelector(sel)?.textContent.replace(/\s+/g, ' ').trim() || '', sel);
async function allerA(lieu) {
  if (await pg.evaluate(() => window.__jeu.monde.id) === lieu) return;
  await pg.evaluate(id => window.__jeu.partirVers(id), lieu);
  for (let k = 0; k < 120; k++) { if (await pg.evaluate(l => window.__jeu.monde.id === l && !window.__jeu.occupe && !document.getElementById('voyage'), lieu)) break; await dialogues(); await fermer(); await pg.waitForTimeout(1000); }
  await pg.waitForTimeout(900); await dialogues(); await fermer();
}
const t0 = Date.now();

await pg.goto(URL);
await pg.evaluate(() => localStorage.clear()); await pg.reload(); await pg.waitForTimeout(1200);
await pg.evaluate(() => document.getElementById('tNouveau').click()); await pg.fill('#tNom', 'Test');
await pg.evaluate(() => document.getElementById('tGo').click()); await pg.waitForTimeout(500);
await pg.evaluate(() => document.querySelector('#prologue .passer').dispatchEvent(new PointerEvent('pointerup', { bubbles: true })));
await pg.waitForFunction(() => window.__jeu && window.__jeu.monde, null, { timeout: 60000 }); await pg.waitForTimeout(800);
try {
  /* ══════════ 1. les règles ══════════ */
  const R = await pg.evaluate(async () => {
    const S = await import('./js/moteur/sons.js'), C = await import('./js/jeu/cris.js'), { ESPECES } = await import('./js/donnees/especes.js');
    const out = {};
    /* les cris : chacun suit son texte du Grand Livre, et s'enregistre hors ligne */
    const buf = await new OfflineAudioContext(1, 44100, 44100).decodeAudioData(await (await fetch('../glou.mp3')).arrayBuffer());
    out.cris = [];
    for (const e of ESPECES) {
      const L = S.lireCri(e.cri), A = new OfflineAudioContext(1, 44100 * 4, 44100);
      S.cri(e.cri, { hauteur: C.hauteurCri(e.id, 'adulte', 'x'), type: e.types[0], rarete: e.rarete, contexte: A, echantillon: buf });
      const x = (await A.startRendering()).getChannelData(0);
      let pic = 0, fin = 0, nan = 0; for (let i = 0; i < x.length; i++) { if (!Number.isFinite(x[i])) nan++; const a = Math.abs(x[i]); if (a > pic) pic = a; if (a > .01) fin = i; }
      out.cris.push({ id: e.id, syl: L.syllabes.length, voix: L.voix, pic, duree: fin / 44100, nan });
    }
    out.hauteurs = { poussin: C.hauteurCri('glouglou', 'poussin', 'a'), adulte: C.hauteurCri('glouglou', 'adulte', 'a'), mammouth: C.hauteurCri('mammouth', 'adulte', 'a'), colibri: C.hauteurCri('colibri', 'adulte', 'a') };
    out.sensDuCri = { long: S.lireCri('GLOOOOOUUU…').syllabes[0].long, question: S.lireCri('Glou ? … Glou !').syllabes[0].question, chuchote: S.lireCri('Glouuu… (en chuchotant)').voix, chante: S.lireCri('Glouuu-lalaaa ♪').syllabes.every(s => s.chante) };
    /* les musiques : chaque morceau existe, et a ses crédits */
    const credits = await (await fetch('musique/CREDITS.md')).text(), morceaux = new Set(Object.values(S.AMBIANCES).flatMap(a => [...a.jour, ...a.nuit]));
    out.musiques = [];
    for (const m of morceaux) { const r = await fetch(`musique/${m}.mp3`, { method: 'HEAD' }); out.musiques.push({ m, ok: r.ok, credit: credits.includes('`' + m + '.mp3`') }); }
    const anciens = new Set(['pres', 'maroc', 'belgique', 'domaine', 'titre'].flatMap(k => [...S.AMBIANCES[k].jour, ...S.AMBIANCES[k].nuit]));
    out.nouvelles = ['jungle', 'banquise', 'volcan', 'foret', 'nuages'].map(k => [k, [...S.AMBIANCES[k].jour, ...S.AMBIANCES[k].nuit].filter(m => !anciens.has(m)).length]);
    out.grandeCourse = S.AMBIANCES.grandeCourse && S.AMBIANCES.grandeCourse.jour.join() !== S.AMBIANCES.course.jour.join();
    return out;
  });
  const ratés = R.cris.filter(c => c.nan || c.pic >= 1 || c.duree > 3.2 || (c.id === 'panthere' ? c.pic > .15 : c.pic < .1 || c.syl < 1 || c.duree < .2));
  verifier(!ratés.length, `les 72 cris s’enregistrent : ni muets, ni saturés, de ${Math.min(...R.cris.map(c => c.duree)).toFixed(2)} à ${Math.max(...R.cris.map(c => c.duree)).toFixed(2)} s ; la Panthère ne fait (presque) aucun bruit${ratés.length ? ' ' + JSON.stringify(ratés) : ''}`);
  verifier(R.hauteurs.poussin > R.hauteurs.adulte && R.hauteurs.mammouth < R.hauteurs.adulte && R.hauteurs.colibri > R.hauteurs.adulte, `les poussins crient plus aigu, le Mammouth plus grave, le Colibri plus aigu ${JSON.stringify(R.hauteurs)}`);
  verifier(R.sensDuCri.long >= 5 && R.sensDuCri.question && R.sensDuCri.chuchote === 'chuchote' && R.sensDuCri.chante, `le cri suit son texte : les voyelles qui s’étirent, la question, le chuchotement, la chanson ${JSON.stringify(R.sensDuCri)}`);
  verifier(R.musiques.every(m => m.ok && m.credit), `les ${R.musiques.length} morceaux existent et sont tous dans les crédits${R.musiques.filter(m => !m.ok || !m.credit).map(m => ' ' + m.m).join('')}`);
  verifier(R.nouvelles.every(([, n]) => n >= 1) && R.grandeCourse, `les îles 4 à 8 ont leurs propres musiques (${R.nouvelles.map(([k, n]) => k + ' ' + n).join(', ')}) et les grandes courses aussi`);

  const D = await pg.evaluate(async () => {
    const W = window.__jeu, e = W.etat(), DB = await import('./js/jeu/doublons.js'), { nouvelleDindie } = await import('./js/jeu/individus.js');
    const O = await import('./js/jeu/objets.js'), AS = await import('./js/ui/astuces.js'), RD = await import('./js/moteur/rendu.js');
    const out = {}, garde = e.dindies.slice();
    const mk = (esp, t, niv = 10, o = {}) => { const d = nouvelleDindie(esp, { niveau: niv, talents: t, origine: 'sauvage:pres', ...o }); d.lieu = 'clapier'; e.dindies.push(d); return d; };
    e.dindies = e.dindies.filter(d => d.espece !== 'trefle');
    const a = mk('trefle', [2, 4, 1], 12), bb = mk('trefle', [3, 1, 1], 6), c = mk('trefle', [2, 4, 1], 3);
    out.meilleure = DB.meilleure('trefle') === a;
    const cmp = DB.comparer(bb); out.compare = { autres: cmp.autres, plus: cmp.plus, mieux: cmp.mieux };
    out.refus = { meilleure: !!DB.peutEtudier(a), double: DB.peutEtudier(bb) };
    const premiere = mk('trefle', [5, 5, 5], 2, { origine: 'premiere' }); out.refus.premiere = !!DB.peutEtudier(premiere); e.dindies = e.dindies.filter(d => d !== premiere);
    bb.lieu = 'mission'; out.refus.mission = !!DB.peutEtudier(bb); bb.lieu = 'clapier';
    const { CHAPEAUX } = await import('./js/donnees/production.js'), ch = Object.keys(CHAPEAUX)[0]; bb.chapeau = ch; const chap0 = e.production.chapeaux[ch] || 0;
    const xpAttendu = DB.xpEtude(bb), r = DB.etudier(bb);
    out.etude = { talent: r.talent, talents: a.talents.join(''), xp: r.xp === xpAttendu && xpAttendu === Math.round((30 + 6 * 6) * 1.5), parti: !e.dindies.includes(bb), chapeau: (e.production.chapeaux[ch] || 0) - chap0, etudes: e.elevage.etudes };
    const r2 = DB.etudier(c); out.etude2 = { talent: r2.talent, talents: a.talents.join('') };
    a.talents = [5, 5, 5]; const d5 = mk('trefle', [5, 5, 5], 4); out.max5 = DB.apercu(d5).talent === null; DB.etudier(d5); out.max5 = out.max5 && a.talents.every(t => t === 5);
    e.dindies = garde;
    /* les biscuits : 5 par jour chez Mimi */
    delete e.quotidien.achats;
    out.biscuits = [O.resteDuJour('biscuit', e)]; O.noterAchat('biscuit', 5, e); out.biscuits.push(O.resteDuJour('biscuit', e));
    e.quotidien.achats.jour = '2000-01-01'; out.biscuits.push(O.resteDuJour('biscuit', e)); delete e.quotidien.achats;
    /* les astuces : une seule fois ; le carnet suit l'histoire */
    const sauve = { ...e.astuces }, qe = e.quete.etape; e.astuces = {};
    out.astuce = [AS.astuce('couvoir'), AS.astuce('couvoir')];
    e.quete.etape = 'decollage'; out.carnet2 = AS.ASTUCES.filter(x => x.ouvert()).length;
    e.quete.etape = 'parlerPlumeau5'; out.carnet4 = AS.ASTUCES.filter(x => x.ouvert()).length;
    e.quete.etape = qe; e.astuces = sauve;
    /* la qualité d'image : les 4 crans, et l'image légère */
    out.qualite = [];
    for (const n of [0, 1, 2, 3, 0]) { RD.regler(n); out.qualite.push([RD.qualite().niveau, RD.soleil.castShadow, RD.renderer.getPixelRatio()]); }
    RD.imageLegere(true); out.legere = RD.qualite().niveau; RD.regler(0); out.legere2 = RD.qualite().niveau; RD.imageLegere(false); RD.regler(0);
    return out;
  });
  verifier(D.meilleure && D.compare.autres === 2 && D.compare.plus.join() === '0' && !D.compare.mieux, `les doubles : la meilleure de l’espèce est la plus douée ; la carte compare (${JSON.stringify(D.compare)})`);
  verifier(D.refus.meilleure && D.refus.premiere && D.refus.mission && D.refus.double === null, `le Professeur n’étudie ni la meilleure, ni la première dindie, ni une dindie en mission ${JSON.stringify(D.refus)}`);
  verifier(D.etude.talent === 0 && D.etude.talents === '341' && D.etude.xp && D.etude.parti && D.etude.chapeau === 1 && D.etude.etudes === 1, `l’étude : la meilleure gagne une étoile là où le double était plus doué, de l’expérience, et le chapeau revient dans l’armoire ${JSON.stringify(D.etude)}`);
  verifier(D.etude2.talent === null && D.etude2.talents === '341' && D.max5, `un double moins doué n’apporte que de l’expérience, et on ne dépasse jamais 5 étoiles ${JSON.stringify(D.etude2)}`);
  verifier(D.biscuits.join() === '5,0,5', `les biscuits de champion : 5 par jour chez Mimi (${D.biscuits.join(' → ')})`);
  verifier(D.astuce[0] === true && D.astuce[1] === false, 'une astuce ne s’affiche qu’une fois');
  verifier(D.carnet2 < D.carnet4 && D.carnet2 >= 5, `le carnet d’astuces s’ouvre au fil de l’histoire (${D.carnet2} astuces au chapitre 2, ${D.carnet4} au chapitre 4)`);
  verifier(D.qualite.map(q => q[0]).join() === '0,1,2,3,0' && D.qualite[3][1] === false && D.qualite[2][1] === true && D.qualite[4][1] === true && D.qualite[3][2] <= .8 && D.legere === 2 && D.legere2 === 2,
    `la qualité d’image : 4 crans (le dernier sans ombres), et l’image légère ne remonte pas au-dessus du 3e ${JSON.stringify(D.qualite)}`);

  /* la durée d'une partie, avec le simulateur (le vrai moteur de course) */
  const sim = spawnSync(process.execPath, ['--experimental-default-type=module', join(ICI, 'simulateur-partie.mjs'), '8'], { encoding: 'utf8', env: { ...process.env, PROFIL: 'typique' }, timeout: 300000 });
  const totaux = [...(sim.stdout || '').matchAll(/^total\s+(\d+) h (\d+)/gm)].map(m => +m[1] + +m[2] / 60);
  verifier(totaux.length >= 2 && totaux[0] >= 10 && totaux[0] <= 25 && totaux[totaux.length - 1] >= 60, `la durée d’une partie (simulateur) : l’histoire en ${totaux[0]?.toFixed(1)} h (visé : 15 à 25 h avec l’exploration), le 100 % en ${totaux[totaux.length - 1]?.toFixed(0)} h (visé : plus de 60 h)`);

  /* ══════════ 2. le jeu ══════════ */
  await pg.evaluate(async () => {
    const W = window.__jeu, e = W.etat(), { nouvelleDindie } = await import('./js/jeu/individus.js');
    e.quete.etape = 'fin'; e.quete.finies = Array.from({ length: 56 }, (_, i) => 'q' + (i + 1)); e.reglages.heure = 'jour'; e.pieces = 3000;
    Object.assign(e.inventaire, { grandLivre: 1, filet: 1, billet: 1, friandise: 30, superFriandise: 20 });
    Object.assign(e.batiments, { montgolfiere: { reparee: true }, clapier: { repare: true, rangees: 1 }, couvoir: { repare: true, niveau: 1 }, nurserie: { repare: true, niveau: 1 }, dindodrome: { ouvert: true } });
    e.astuces = {};
    const mk = (esp, t, niv = 8) => { const d = nouvelleDindie(esp, { niveau: niv, talents: t }); d.lieu = 'clapier'; d.origine = 'sauvage:pres'; e.dindies.push(d); e.livre.attrapes[esp] = e.livre.vus[esp] = Date.now(); return d; };
    mk('glouglou', [1, 1, 1], 12); mk('glouglou', [0, 3, 0], 5); mk('paquerette', [2, 2, 2]);
    W.sauver();
  });
  await pg.reload(); await pg.waitForTimeout(1200); await pg.evaluate(() => document.querySelector('#profils .jouer').click());
  await pg.waitForFunction(() => window.__jeu && window.__jeu.monde, null, { timeout: 60000 }); await pg.waitForTimeout(2000); await dialogues(); await fermer();

  /* le Labo : l'astuce des doubles, puis l'étude */
  await agir('labo');
  verifier(/doubles/.test(await texte('.astuceBoite')), 'au Labo, l’astuce des doubles s’affiche (une fois)');
  await clic('#lEtude'); await pg.waitForTimeout(500);
  await pg.screenshot({ path: `${OUT}/etude.png` });
  const avant = await pg.evaluate(() => window.__jeu.etat().dindies.filter(d => d.espece === 'glouglou').map(d => d.talents.join('') + ':' + d.niveau + ':' + d.xp));
  await clic('[data-etudier]'); await pg.waitForTimeout(500); await dialogues('oui'); await pg.waitForTimeout(600);
  const apres = await pg.evaluate(() => window.__jeu.etat().dindies.filter(d => d.espece === 'glouglou').map(d => d.talents.join('') + ':' + d.niveau + ':' + d.xp));
  verifier(avant.length === 2 && apres.length === 1 && apres[0].startsWith('121:') && /apprend/.test(await texte('#toasts')), `l’étude au Labo : le double s’en va, la meilleure passe de ${avant[0]} à ${apres[0]} (une étoile en 💪)`);
  await fermer();

  /* chez Mimi : 5 biscuits par jour */
  /* (la première fois, Mimi parle peut-être d'abord de la quête du Domaine) */
  await agir('boutique'); if (!await pg.$('.boutique')) await agir('boutique');
  await pg.screenshot({ path: `${OUT}/boutique.png` });
  for (let k = 0; k < 6; k++) await clic('.acheter[data-id="biscuit"]');
  await pg.waitForTimeout(300);
  const bis = await pg.evaluate(() => ({ n: window.__jeu.etat().inventaire.biscuit || 0, off: document.querySelector('.acheter[data-id="biscuit"]')?.disabled, txt: [...document.querySelectorAll('.article')].find(a => a.querySelector('[data-id="biscuit"]'))?.textContent.replace(/\s+/g, ' ') }));
  verifier(bis.n === 5 && bis.off && /encore 0/.test(bis.txt || ''), `chez Mimi : 5 biscuits par jour, puis le bouton s’éteint (« ${(bis.txt || '').match(/Mimi en a encore \d+/)?.[0] || bis.txt?.slice(0, 60)} »)`);
  await fermer();

  /* la Maison : le confort, l'image légère, Échap */
  await agir('maison');
  await pg.evaluate(() => { for (const id of ['mGrands', 'mCalme', 'mDalto', 'mLegere']) { const c = document.getElementById(id); c.checked = true; c.dispatchEvent(new Event('change')); } });
  await pg.waitForTimeout(300);
  const conf = await pg.evaluate(() => ({ cl: document.body.className, r: window.__jeu.etat().reglages, q: window.__rendu.qualite().niveau }));
  verifier(/grandsTextes/.test(conf.cl) && /calme/.test(conf.cl) && /daltonien/.test(conf.cl) && conf.r.legere && conf.q >= 2, `le confort : les textes en grand, moins d’animations, les couleurs pour daltoniens, l’image légère (cran ${conf.q})`);
  await pg.evaluate(() => document.querySelector('#mGrands').scrollIntoView()); await pg.screenshot({ path: `${OUT}/maison-confort.png` });
  await pg.keyboard.press('Escape'); await pg.waitForTimeout(250);
  verifier(await pg.evaluate(() => !document.querySelector('.voile')), 'la touche Échap ferme la fenêtre');
  await agir('maison');
  await pg.evaluate(() => { for (const id of ['mGrands', 'mCalme', 'mLegere']) { const c = document.getElementById(id); c.checked = false; c.dispatchEvent(new Event('change')); } });
  await fermer();

  /* le carnet d'astuces, depuis le Journal */
  await clic('#hJournal'); await pg.waitForTimeout(300); await clic('[data-pan="astuces"]'); await pg.waitForTimeout(300);
  const nbA = await pg.evaluate(() => document.querySelectorAll('.astucesF details.astuce').length);
  await pg.evaluate(() => { const d = document.querySelector('details.astuce[data-id="courses"]'); if (d) d.open = true; }); await pg.waitForTimeout(200);
  await clic('[data-lire="courses"]');
  await pg.screenshot({ path: `${OUT}/carnet.png` });
  verifier(nbA >= 12, `le carnet d’astuces s’ouvre depuis le Journal (${nbA} astuces, avec 🔊)`);
  await fermer();

  /* le Couvoir : son astuce, une seule fois */
  await agir('couvoir');
  const a1 = await texte('.astuceBoite');
  await pg.screenshot({ path: `${OUT}/couvoir-astuce.png` });
  await clic('.astuceBoite [data-astuce="ok"]'); await fermer();
  await agir('couvoir'); const a2 = await pg.evaluate(() => !!document.querySelector('.astuceBoite')); await fermer();
  verifier(/Couvoir/.test(a1) && !a2, 'l’astuce du Couvoir s’affiche la première fois, puis plus');

  /* une capture dans les Prés : un double ; la carte compare ses talents ; la zone est bleue (couleurs pour daltoniens) */
  await allerA('pres');
  let carte = '', conseil = '';
  for (let tour = 0; tour < 6 && !carte; tour++) {
    const ok = await pg.evaluate(() => { const J = window.__jeu; const s = J.sauvages.liste.find(x => x.espece === 'glouglou' && !x.fantome) || J.sauvages.invoquer('glouglou'); if (!s) return false; const q = s.m.racine.position, d = J.monde.grille.plusProcheLibre(q.x + 2.4, q.z + 1.4); J.moi.racine.position.set(d[0], J.monde.sol(d[0], d[1]), d[1]); s.etat = 'erre'; J.capturer(s); return true; });
    if (!ok) { await pg.waitForTimeout(1000); continue; }
    await pg.waitForSelector('#capture', { timeout: 15000 });
    for (let k = 0; k < 12; k++) { await pg.waitForFunction(() => !window.__jeu.capture || !window.__jeu.capture.etat().occupe, null, { timeout: 60000 }); const c = await pg.evaluate(() => window.__jeu.capture && window.__jeu.capture.etat().confiance); if (c == null || c >= .99) break; await pg.evaluate(() => (document.querySelector('.friand[data-id="superFriandise"]') || document.querySelector('.friand'))?.click()); await pg.waitForTimeout(250); }
    for (let k = 0; k < 3; k++) {
      if (!await pg.evaluate(() => !!window.__jeu.capture)) break;
      await clic('#cFilet'); await pg.waitForTimeout(300); if (!conseil) conseil = await texte('#capture');
      await pg.waitForFunction(() => !window.__jeu.capture || window.__jeu.capture.etat().dans, null, { timeout: 30000, polling: 'raf' });
      await pg.evaluate(() => window.__jeu.capture && window.__jeu.capture.action());
      await pg.waitForFunction(() => !window.__jeu.capture || window.__jeu.capture.etat().phase === 'friandises', null, { timeout: 30000 }); await pg.waitForTimeout(300);
    }
    await pg.waitForTimeout(800);
    if (await pg.$('.captureF')) { await pg.screenshot({ path: `${OUT}/capture-double.png` }); carte = await texte('.captureF'); await clic('#aOk'); }
  }
  verifier(/zone bleue/.test(conseil), 'avec les couleurs pour daltoniens, la zone de capture est bleue');
  verifier(/[⚡💪🦘]/u.test(carte) && /(meilleure|déjà une|Plus de)/.test(carte), `la carte d’un double montre ses talents et la compare : « ${carte.slice(0, 140)}… »`);
  await fermer();

  /* le Grand Livre : combien on en a, et le cri 🔊 */
  await pg.evaluate(async () => { (await import('./js/ui/panneaux.js')).ouvrirLivre(); }); await pg.waitForTimeout(400);
  const nb = await texte('.case[data-id="glouglou"] .nbLivre');
  await clic('.case[data-id="glouglou"]'); await pg.waitForTimeout(400);
  const cri = await clic('#lCri'); await pg.waitForTimeout(600);
  await pg.screenshot({ path: `${OUT}/livre-cri.png` });
  verifier(/× 2/.test(nb) && cri, `le Grand Livre : « ${nb} » sur la case du Glouglou, et le bouton 🔊 fait entendre son cri`);
  await fermer();
  await pg.evaluate(async () => { (await import('./js/ui/panneaux.js')).ouvrirFiche(window.__jeu.etat().dindies[0]); }); await pg.waitForTimeout(400);
  verifier(await clic('#fCri'), 'la fiche d’une dindie a aussi son bouton 🔊');
  await fermer(); await pg.waitForTimeout(300);

  /* plus de scintillement au Domaine : la fontaine, le hublot du Labo, le fronton du Musée */
  await allerA('domaine');
  await pg.evaluate(() => { window.__jeu.forcerHeure(13, 30 * 60000); window.__jeu.majLumiere(true); });
  const SC = await pg.evaluate(async () => {
    const R = await import('./js/moteur/rendu.js'), J = window.__jeu, vues = [];
    for (const id of ['fontaine', 'labo', 'musee']) { const I = J.interactifs.find(i => i.id === id); vues.push([id + ' de près', [I.x + 1.5, 2.6, I.z + 4.5], [I.x, 2, I.z - 2]], [id + ' de loin', [I.x + 3, 5.5, I.z + 11], [I.x, 1.8, I.z - 2]]); }
    R.pauseRendu(true);
    const lire = () => { const c = R.renderer.domElement, o = document.createElement('canvas'); o.width = c.width; o.height = c.height; const x = o.getContext('2d'); x.drawImage(c, 0, 0); return x.getImageData(0, 0, c.width, c.height).data; };
    const out = [];
    for (const [nom, p, v] of vues) {
      const imgs = []; for (let k = 0; k < 5; k++) { const j = k * .0007; R.camera.position.set(p[0] + j, p[1] + j * .5, p[2] - j * .3); R.camera.lookAt(v[0], v[1], v[2]); R.camera.updateMatrixWorld(); R.renderer.render(R.scene, R.camera); imgs.push(lire()); }
      const W = R.renderer.domElement.width, H = R.renderer.domElement.height, m = new Uint8Array(W * H);
      for (let k = 1; k < 5; k++) for (let i = 0; i < W * H; i++) { const d = Math.abs(imgs[k - 1][4 * i] - imgs[k][4 * i]) + Math.abs(imgs[k - 1][4 * i + 1] - imgs[k][4 * i + 1]) + Math.abs(imgs[k - 1][4 * i + 2] - imgs[k][4 * i + 2]); if (d > 60) m[i]++; }
      /* une face qui scintille fait une tache pleine ; un contour qui bouge d'un pixel n'est qu'une ligne (on ne compte que les taches) */
      let n = 0; for (let y = 2; y < H - 2; y++) for (let x = 2; x < W - 2; x++) { const i = y * W + x; if (m[i] < 2) continue; let s = 0; for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) s += m[i + dy * W + dx] >= 2 ? 1 : 0; if (s >= 14) n++; }
      out.push([nom, n]);
    }
    R.pauseRendu(false);
    return out;
  });
  verifier(SC.every(([, n]) => n < 250), `plus de scintillement : ${SC.map(([v, n]) => `${v} ${n}`).join(', ')} pixels qui clignotent (moins de 250)`);
  await pg.screenshot({ path: `${OUT}/domaine.png` });

  /* ══════════ 3. la page publique : le Grand Livre des Dindies ══════════ */
  const GL = await b.newPage({ viewport: { width: w, height: h }, isMobile: !!mob, hasTouch: !!mob });
  GL.on('pageerror', e => errs.push('Grand Livre : ' + e.message)); GL.on('console', m => { if (m.type() === 'error' && !/CERT|404|fonts/.test(m.text())) errs.push('Grand Livre, console : ' + m.text()); });
  await GL.goto(URL.replace(/index\.html$/, 'grand-livre.html')); await GL.waitForTimeout(1000);
  const g0 = await GL.evaluate(() => ({ n: document.querySelectorAll('.dindie').length, secrets: [...document.querySelectorAll('.dindie.secret')].map(b => b.dataset.id), large: document.documentElement.scrollWidth <= innerWidth + 1, svg: document.querySelectorAll('.dindie svg').length }));
  await GL.screenshot({ path: `${OUT}/grand-livre.png` });
  verifier(g0.n === 72 && g0.svg === 72 && g0.secrets.length === 8 && g0.large, `la page du Grand Livre : les 72 portraits, les 8 légendes cachées, sans défilement de côté (${g0.n} cartes, ${g0.secrets.length} secrets)`);
  await GL.evaluate(() => document.querySelector('.dindie[data-id="dromadaire"]').click()); await GL.waitForTimeout(300);
  const g1 = await GL.evaluate(() => ({ nom: document.getElementById('ficheNom')?.textContent, stades: document.querySelectorAll('.stades svg').length, ou: document.querySelector('.ou')?.textContent }));
  await GL.evaluate(() => document.getElementById('ficheCri').click()); await GL.waitForTimeout(500);
  await GL.screenshot({ path: `${OUT}/grand-livre-fiche.png` });
  await GL.keyboard.press('Escape'); await GL.waitForTimeout(200);
  verifier(g1.nom === 'Dindromadaire' && g1.stades === 4 && /Maroc/.test(g1.ou) && await GL.evaluate(() => document.getElementById('fiche').classList.contains('cache')), `une fiche : ${g1.nom}, ses 4 stades, où la trouver (« ${g1.ou?.slice(0, 50)}… »), son cri 🔊 ; Échap la ferme`);
  await GL.evaluate(() => { document.querySelector('#fType .puce[data-v="glace"]').click(); document.querySelector('#fRarete .puce[data-v="epique"]').click(); });
  const g2 = await GL.evaluate(() => [...document.querySelectorAll('.dindie')].map(b => b.dataset.id).join());
  await GL.evaluate(() => { document.querySelector('#fType .puce[data-v="tout"]').click(); document.querySelector('#fRarete .puce[data-v="tout"]').click(); const c = document.getElementById('fLegendes'); c.checked = true; c.dispatchEvent(new Event('change')); const i = document.getElementById('fNom'); i.value = 'phenix'; i.dispatchEvent(new Event('input')); });
  const g3 = await GL.evaluate(() => [...document.querySelectorAll('.dindie b')].map(b => b.textContent).join());
  const attendu = await GL.evaluate(async () => (await import('./js/donnees/especes.js')).ESPECES.filter(e => e.types.includes('glace') && e.rarete === 'epique').map(e => e.id).join());
  verifier(g2 === attendu && attendu.length > 0, `les filtres : Glace et Épique → ${g2}`);
  verifier(g3 === 'Dindophénix', `la recherche (sans accents) avec les légendes montrées : « phenix » → ${g3}`);
  await GL.close();
} catch (e) {
  verifier(false, 'le test s’est arrêté : ' + e.message.split('\n')[0]);
  await pg.screenshot({ path: `${OUT}/erreur.png` }).catch(() => {});
}
verifier(!errs.length, errs.length ? `${errs.length} erreur(s) dans le navigateur :\n   ${errs.slice(0, 8).join('\n   ')}` : 'aucune erreur dans le navigateur');
console.log(`(${Math.round((Date.now() - t0) / 1000)} s)`);
await b.close();
process.exit(echecs ? 1 : 0);
