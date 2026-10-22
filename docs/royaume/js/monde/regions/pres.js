/* ══════════ RÉGION 1 : LES PRÉS ══════════
   Des collines douces, la ferme de Gaston (grange rouge, meules de foin, Gustave le coq), le moulin,
   la mare aux nénuphars, le puits, le champ de coquelicots, le pré fleuri, les trèfles et le jardin oublié. */
import * as THREE from 'three';
import { B, T, CY, CO, SP, TO, construire, pancarte, panneau } from '../fabrique.js';
import { cylindre } from '../../moteur/formes.js';
import { toon } from '../../moteur/materiaux.js';
import { instances } from '../ile.js';
import { semer, autour, dessinerFeuillus, dessinerPins, dessinerBuissons, dessinerRochers, dessinerFleurs, dessinerHerbes, dessinerTrefles, dessinerRoseaux } from '../nature.js';
import { distSegment } from '../decor.js';

const lisse = x => { x = Math.min(1, Math.max(0, x)); return x * x * (3 - 2 * x); };
const CHEMINS = [[0, 30, 0, 8, 2.4], [0, 29, -6, 27, 2.2], [0, 8, -11, 6, 2.2], [0, 8, 12, -10, 2.2], [0, 8, 7, 11, 2], [-1, 4, -18, -13, 2], [3, 9, 25, 17, 1.8], [-11, 6, -29, 13, 1.8], [12, -10, 28, -18, 1.6], [-18, -13, -32, -6, 1.6]];
const PLATS = [[-8, 27, 6], [0, 29, 4], [0, 8, 6], [-14, 4, 8], [16, -14, 5], [-34, -6, 5], [4, 5, 3]];
const MARE = [14, 13, 5.5];
const COQUELICOTS = [-22, -16, 6], FLEURS = [-4, -12, 6.5], TREFLES = [[24, 18, 3.6], [-30, 14, 3.6]];

const collines = (x, z) => .9 * Math.sin(x * .085 + 1) * Math.cos(z * .075 - .4) + .55 * Math.sin(x * .05 - z * .06 + 2) + .45;
function relief(x, z) {
  let h = Math.max(0, collines(x, z)) * 1.25, k = 1;
  for (const [x1, z1, x2, z2, w] of CHEMINS) k = Math.min(k, lisse((distSegment(x, z, x1, z1, x2, z2) - w / 2) / 3.5));
  for (const [px, pz, pr] of PLATS) k = Math.min(k, lisse((Math.hypot(x - px, z - pz) - pr) / 4));
  h *= k;
  const dm = Math.hypot(x - MARE[0], z - MARE[1]);
  if (dm < MARE[2] + 2.5) h = h * lisse((dm - MARE[2]) / 2.5) - .75 * (1 - lisse((dm - MARE[2] + 1.4) / 1.4));
  return h;
}
const _c = new THREE.Color(), H1 = new THREE.Color('#8fd16a'), H2 = new THREE.Color('#7cc35a'), H3 = new THREE.Color('#a8e07e'), CHEMIN = new THREE.Color('#dcbf8e'),
  BOUE = new THREE.Color('#9b8a5c'), TREF = new THREE.Color('#5aa847'), POP = new THREE.Color('#93cf62'), FL = new THREE.Color('#a6d96a');
function couleur(x, z, f, h) {
  const bruit = Math.sin(x * .21 + Math.sin(z * .13) * 2) * Math.cos(z * .17 - x * .05) * .5 + .5;
  _c.copy(H1).lerp(bruit > .6 ? H3 : H2, Math.abs(bruit - .5) * 1.4).lerp(H3, Math.min(.5, Math.max(0, h) * .3));
  if (Math.hypot(x - COQUELICOTS[0], z - COQUELICOTS[1]) < COQUELICOTS[2] + 1) _c.lerp(POP, .6);
  if (Math.hypot(x - FLEURS[0], z - FLEURS[1]) < FLEURS[2] + 1) _c.lerp(FL, .5);
  for (const [tx, tz, tr] of TREFLES) if (Math.hypot(x - tx, z - tz) < tr + .8) _c.lerp(TREF, .7);
  const dm = Math.hypot(x - MARE[0], z - MARE[1]); if (dm < MARE[2] + .6) _c.lerp(BOUE, lisse((MARE[2] + .6 - dm) / 1.2));
  let dc = 9; for (const [x1, z1, x2, z2, w] of CHEMINS) dc = Math.min(dc, distSegment(x, z, x1, z1, x2, z2) - w / 2);
  if (dc < .4) _c.lerp(CHEMIN, lisse((.4 - dc) / .8));
  return _c;
}

/* ── les bâtiments ── */
function grange() {
  const p = [B('#b91c1c', [0, 1.6, 0], [7, 3.2, 5]), T('#7f1d1d', [0, 3.2, 0], [5.6, 2.3, 7.6], [0, Math.PI / 2, 0]), B('#fef3c7', [0, 3.22, 0], [7.3, .12, 5.3])];
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) p.push(B('#fef3c7', [sx * 3.5, 1.6, sz * 2.5], [.2, 3.2, .2]));
  p.push(B('#fef3c7', [0, 1.25, 2.52], [2.6, 2.5, .08]), B('#991b1b', [0, 1.2, 2.56], [2.3, 2.3, .06]));
  for (const s of [-1, 1]) p.push(B('#fef3c7', [0, 1.2, 2.6], [.16, 3.1, .05], [0, 0, s * .78]));
  p.push(B('#422006', [0, 3.85, 2.86], [1.1, .8, .08]), B('#fef3c7', [0, 3.85, 2.9], [1.3, .1, .05]), B('#fef3c7', [0, 3.85, 2.9], [.1, 1, .05]));
  p.push(B('#facc15', [0, 4.25, 2.9], [.9, .2, .1]));
  const g = construire(p, []);
  const t = pancarte('🧑‍🌾 La ferme de Gaston', 3.2, .6); t.position.set(0, 2.85, 2.56); g.add(t);
  return { g, obst: [[0, 0, 7.3, 5.3]] };
}
function moulin() {
  const p = [{ g: cylindre(.7, 1, 1, 14), c: '#f5f5f4', p: [0, 2.5, 0], s: [1.8, 5, 1.8] }, CO('#78350f', [0, 5.7, 0], [1.55, 1.6, 1.55], [0, 0, 0], 14),
    B('#57534e', [0, 1, 1.72], [.9, 1.7, .12]), CY('#a8a29e', [0, .15, 0], [2, .3, 2], [0, 0, 0], 16)];
  const f = [B('#bfe3ff', [0, 3.3, 1.42], [.5, .6, .06])];
  const g = construire(p, f);
  const ailes = new THREE.Group(); ailes.position.set(0, 4.9, 1.55); g.add(ailes);
  const pa = [SP('#57534e', [0, 0, .1], .28)];
  for (let k = 0; k < 4; k++) {
    const a = k * Math.PI / 2, cx = Math.sin(a), cy = Math.cos(a);
    pa.push(B('#78350f', [cx * 1.5, cy * 1.5, .15], [.12, 3, .08], [0, 0, -a]), B('#f5f5f4', [cx * 1.7 + cy * .3, cy * 1.7 - cx * .3, .2], [.6, 2.3, .05], [0, 0, -a]));
  }
  ailes.add(construire(pa, [], .025));
  return { g, obst: [[0, 0, 3.4, 3.4]], maj: dt => { ailes.rotation.z -= dt * .7; } };
}
function puits() {
  const g = construire([CY('#a8a29e', [0, .45, 0], [1, .9, 1], [0, 0, 0], 18), CY('#1e3a5f', [0, .86, 0], [.78, .06, .78], [0, 0, 0], 18), TO('#78716c', [0, .9, 0], [.98, .98, .98], [Math.PI / 2, 0, 0], .1),
    B('#8a5a3c', [-.9, 1.4, 0], [.14, 1.9, .14]), B('#8a5a3c', [.9, 1.4, 0], [.14, 1.9, .14]), CY('#8a5a3c', [0, 1.95, 0], [.07, 1.9, .07], [0, 0, Math.PI / 2]),
    T('#b45309', [0, 2.3, 0], [1.6, .7, 2.2], [0, Math.PI / 2, 0]), CY('#a16207', [.2, 1.3, 0], [.18, .26, .18]), CY('#57534e', [.2, 1.65, 0], [.01, .5, .01])], []);
  return { g, obst: [[0, 0, 2.1, 1.6]] };
}
function meule() {
  return { g: construire([CY('#eab308', [0, .55, 0], [.95, 1.1, .95], [0, 0, 0], 14), { g: cylindre(.2, 1, 1, 14), c: '#facc15', p: [0, 1.45, 0], s: [.95, .7, .95] }], [], .03), obst: [[0, 0, 1.8, 1.8]] };
}
function barriere(L) {
  const p = [];
  for (let k = 0; k <= L; k++) p.push(B('#a0764a', [k - L / 2, .45, 0], [.12, .9, .12]));
  p.push(B('#c2884e', [0, .62, 0], [L, .09, .06]), B('#c2884e', [0, .32, 0], [L, .09, .06]));
  return { g: construire(p, [], .02), obst: [[0, 0, L + .3, .4]] };
}
function jardinOublie() {
  const p = [];
  for (const s of [-1, 1]) p.push(B('#d6d3d1', [s * 1.5, 1.3, 0], [.6, 2.6, .6]), B('#a8a29e', [s * 1.5, 2.65, 0], [.8, .2, .8]));
  p.push(TO('#d6d3d1', [0, 2.6, 0], [1.5, 1.5, 1], [0, 0, 0], .2, Math.PI));
  for (const [x, z, w, h] of [[-3.2, -1.5, 2.2, .8], [3, -2, 1.6, .6], [-2.4, 2.2, 1.4, .5], [2.6, 1.6, 1.8, .7]]) p.push(B('#c8c5c0', [x, h / 2, z], [w, h, .4], [0, x * .3, 0]));
  for (let k = 0; k < 9; k++) p.push(SP(k % 2 ? '#86efac' : '#4ade80', [-1.5 + (k % 3) * .3 * (k % 2 ? 1 : -1), .6 + k * .25, .32], [.22, .18, .1]));
  p.push(SP('#f9a8d4', [-1.4, 1.4, .4], .1), SP('#f9a8d4', [1.6, 2, .4], .1), SP('#fde047', [1.3, 1.1, .38], .09));
  const g = construire(p, [], .03);
  const t = pancarte('🌸 Le jardin oublié', 2.6, .55, { fond: '#fdf2f8', encre: '#9d174d', bord: '#f472b6' }); t.position.set(0, .9, 1.2); t.rotation.x = -.2; g.add(t);
  return { g, obst: [[-1.5, 0, .9, .9], [1.5, 0, .9, .9], [-3.2, -1.5, 2.4, .7], [3, -2, 1.8, .7], [-2.4, 2.2, 1.6, .7], [2.6, 1.6, 2, .7]] };
}
/* Gustave, le coq de Gaston : il fait venir le matin ! */
function coq() {
  const corps = new THREE.Group();
  corps.add(construire([SP('#f8fafc', [0, .55, 0], [.3, .28, .38]), SP('#f8fafc', [0, .86, .24], [.16, .19, .16]), { g: cylindre(0, 1, 1, 6), c: '#facc15', p: [0, .83, .44], s: [.05, .14, .05], r: [Math.PI / 2, 0, 0] },
    SP('#ef4444', [0, 1.05, .23], [.05, .09, .14]), SP('#ef4444', [0, .72, .38], [.04, .07, .03]), SP('#111827', [-.1, .9, .36], .028), SP('#111827', [.1, .9, .36], .028),
    SP('#1e3a8a', [0, .85, -.36], [.08, .32, .14], [-.5, 0, 0]), SP('#15803d', [.09, .8, -.34], [.07, .28, .12], [-.7, 0, .3]), SP('#b45309', [-.09, .8, -.34], [.07, .28, .12], [-.7, 0, -.3]),
    SP('#d6d3d1', [-.24, .56, 0], [.08, .18, .26]), SP('#d6d3d1', [.24, .56, 0], [.08, .18, .26]),
    CY('#f59e0b', [-.1, .2, 0], [.03, .4, .03]), CY('#f59e0b', [.1, .2, 0], [.03, .4, .03])], [], .02));
  const g = new THREE.Group(); g.add(corps);
  g.add(construire([CY('#a0764a', [0, .15, 0], [.55, .3, .55], [0, 0, 0], 12)], [], .02));
  corps.position.y = .3;
  let saut = 0;
  return {
    g, obst: [[0, 0, 1, 1]], porte: [0, 1.3],
    anim: () => { saut = 1.6; },
    maj: (dt, t) => { saut = Math.max(0, saut - dt); corps.position.y = .3 + Math.abs(Math.sin(saut * 6)) * .4 * Math.min(1, saut); corps.rotation.x = saut > 0 ? -.4 * Math.sin(saut * 4) : Math.max(0, Math.sin(t * 2.3)) * .25; }
  };
}

export default {
  ile: { a: 46, b: 40, graine: 1.7, relief },
  sol: { couleur },
  depart: [0, 29], ballon: [-8.5, 27], zephyr: [-4.4, 28.8, .5], guide: [-9.5, 8.5, -.5],
  zones: { pre: [[6, 1, 6], [-24, 24, 5], [28, -2, 6], [-8, 20, 5], [8, -24, 5]], fleurs: [FLEURS], trefles: TREFLES, coquelicots: [COQUELICOTS] },
  cachettes: [[-36, -18], [30, -24], [36, 6], [-39, 6], [10, -30], [-12, -28], [22, 28], [-30, 27], [-24, -30], [38, -10], [-6, 21], [18, -30]],
  quete: { plumeRouge1: [-27, -8], plumeRouge2: [31, -17], plumeRouge3: [-35, 20] },
  lampes: [[2.4, 21], [2.4, 14], [-5, 6.5], [7, 4.5], [9, -5]],
  lieux: [
    { nom: 'La montgolfière', e: '🎈', x: -8.5, z: 27 }, { nom: 'La ferme de Gaston', e: '🧑‍🌾', x: -14, z: 4 }, { nom: 'Le moulin', e: '🌬️', x: 16, z: -14 },
    { nom: 'La mare', e: '🦆', x: 14, z: 13 }, { nom: 'Le champ de coquelicots', e: '🌺', x: -22, z: -16 }, { nom: 'Le pré fleuri', e: '🌼', x: -4, z: -12 },
    { nom: 'Les trèfles', e: '🍀', x: 24, z: 18 }, { nom: 'Le jardin oublié', e: '🌸', x: -34, z: -6 }],
  construire(ctx) {
    const { placer, grille, ajouterInteractif, reserver, sol } = ctx;
    /* la ferme, le moulin, le puits, les meules */
    placer(grange(), -14, 2);
    placer(moulin(), 16, -14);
    placer(puits(), 4.5, 5);
    for (const [x, z] of [[-21, -1], [-20.5, 7.5], [-8.8, -2.5]]) placer(meule(), x, z);
    placer(barriere(7), -14, -1.6);
    placer(barriere(5), -23.5, 3.2, Math.PI / 2);
    const j = placer(jardinOublie(), -34, -6); reserver(-34, -5, 5.5); reserver(-14, 6, 3);
    ajouterInteractif({ id: 'deco-jardin', e: '🌸', texte: 'Le jardin oublié', x: -34, z: -3.6, cible: j.g });
    const p = placer(panneau('🌿 Les Prés'), -2.2, 11); void p;
    const c = placer(coq(), -17.5, 8.5, .6);
    ajouterInteractif({ id: 'gadget-coq', e: '🐓', texte: 'Gustave le coq', x: c.porteMonde[0], z: c.porteMonde[1], cible: c.g, gadget: 'coq' });
    /* la mare : l'eau, les nénuphars, les roseaux */
    sol.planEau(MARE[0], MARE[1], (MARE[2] - .7) * 2, (MARE[2] - .7) * 2, -.36, ['#7dd3fc', '#38bdf8'], 0, true);
    grille.boucherCercle(MARE[0], MARE[1], MARE[2] - .4);
    const nen = autour(ctx, MARE[0], MARE[1], MARE[2] - 1.6, 14);
    ctx.racine.add(instances(cylindre(1, 1, 1, 12), toon('#4ade80'), nen.map(a => ({ p: [a.x, -.33, a.z], s: [.42 * a.s, .02, .42 * a.s] })), false, 0, false));
    ctx.racine.add(instances(cylindre(1, 1, 1, 6), toon('#f9a8d4'), nen.filter((_, i) => i % 3 === 0).map(a => ({ p: [a.x + .1, -.28, a.z], s: [.12, .08, .12] })), false, 0, false));
    const ros = []; for (let k = 0; k < 40; k++) { const an = ctx.r() * 6.28, d = MARE[2] - .2 + ctx.r() * .9; ros.push({ x: MARE[0] + Math.cos(an) * d, z: MARE[1] + Math.sin(an) * d, s: .7 + ctx.r() * .5, r: ctx.r() * 6, y: ctx.ile.sol(MARE[0] + Math.cos(an) * d, MARE[1] + Math.sin(an) * d) }); }
    dessinerRoseaux(ctx, ros);
    reserver(MARE[0], MARE[1], MARE[2] + .6);
    /* les champs : coquelicots, pré fleuri, trèfles */
    dessinerFleurs(ctx, autour(ctx, COQUELICOTS[0], COQUELICOTS[1], COQUELICOTS[2], 260).map((a, i) => ({ ...a, c: i % 9 ? (i % 2 ? '#dc2626' : '#ef4444') : '#111827' })), undefined, .12);
    dessinerFleurs(ctx, autour(ctx, FLEURS[0], FLEURS[1], FLEURS[2], 240), ['#fde047', '#ffffff', '#f472b6', '#c4b5fd', '#fb923c'], .11);
    for (const [tx, tz, tr] of TREFLES) dessinerTrefles(ctx, autour(ctx, tx, tz, tr, 90));
    reserver(COQUELICOTS[0], COQUELICOTS[1], COQUELICOTS[2]); reserver(FLEURS[0], FLEURS[1], FLEURS[2]); for (const [tx, tz, tr] of TREFLES) reserver(tx, tz, tr);
    /* les chemins restent libres */
    const surChemin = (x, z, m = 1.4) => CHEMINS.some(([x1, z1, x2, z2, w]) => distSegment(x, z, x1, z1, x2, z2) < w / 2 + m);
    /* les arbres, les buissons, les cailloux, l'herbe */
    const f = ctx.ile.forme;
    dessinerFeuillus(ctx, semer(ctx, 95, { rayon: 1.6, ecart: 2.7, bloque: .7, taille: [.85, 1.4], test: (x, z) => { const k = f(x, z); return k < .9 && (k > .68 || ctx.r() < .12) && !surChemin(x, z, 2); } }));
    dessinerPins(ctx, semer(ctx, 26, { rayon: 1.4, ecart: 2.4, bloque: .6, taille: [.9, 1.4], test: (x, z) => z < -10 && f(x, z) > .6 && f(x, z) < .9 && !surChemin(x, z, 2) }));
    dessinerBuissons(ctx, semer(ctx, 55, { rayon: 1, ecart: 1.6, bloque: .5, taille: [.6, 1.1], test: (x, z) => !surChemin(x, z, 1.2) }));
    dessinerRochers(ctx, semer(ctx, 18, { rayon: .8, bloque: .4, taille: [.3, .7], test: (x, z) => !surChemin(x, z) }));
    dessinerFleurs(ctx, semer(ctx, 320, { rayon: .2, test: (x, z) => !surChemin(x, z, .3) }));
    dessinerHerbes(ctx, semer(ctx, 650, { rayon: .15, taille: [.6, 1.3], test: (x, z) => !surChemin(x, z, .2) }));
    return { gadgets: { coq: c } };
  }
};
