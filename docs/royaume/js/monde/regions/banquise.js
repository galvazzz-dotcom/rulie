/* ══════════ RÉGION 5 : LA BANQUISE ══════════
   Un village d'igloos (et la grande maison d'Inuk), le lac gelé, des sapins enneigés, le glacier bleu au nord
   et sa grotte de glace, des blocs de glace près de l'eau. Le cor des glaces fait venir le matin. Il y neige souvent. */
import * as THREE from 'three';
import { B, T, CY, CO, SP, DS, TO, construire, pancarte, panneau } from '../fabrique.js';
import { semer, autour, dessinerRochers, dessinerSapinsNeige, dessinerBuissons } from '../nature.js';
import { instances } from '../ile.js';
import { sphere } from '../../moteur/formes.js';
import { toon } from '../../moteur/materiaux.js';
import { distSegment } from '../decor.js';

const lisse = x => { x = Math.min(1, Math.max(0, x)); return x * x * (3 - 2 * x); };
const CHEMINS = [[0, 28, 0, 8, 2.4], [0, 28, -7, 25, 2.2], [0, 8, -16, 2, 2.2], [0, 8, 14, 10, 2], [0, 8, 2, -16, 2.2], [2, -16, 12, -24, 2], [-16, 2, -30, 8, 1.8]];
const PLATS = [[-7, 25, 6], [0, 8, 6], [-17, 2, 9], [12, -24, 5]];
const LAC = [18, 10, 7];
const VILLAGE = [-17, 2];
const bosses = (x, z) => .6 * Math.sin(x * .1 + 1.3) * Math.cos(z * .09) + .4 * Math.sin(x * .06 - z * .05 + 2) + .35;
function relief(x, z) {
  let h = Math.max(0, bosses(x, z)) * 1.1, k = 1;
  for (const [x1, z1, x2, z2, w] of CHEMINS) k = Math.min(k, lisse((distSegment(x, z, x1, z1, x2, z2) - w / 2) / 3));
  for (const [px, pz, pr] of PLATS) k = Math.min(k, lisse((Math.hypot(x - px, z - pz) - pr) / 4));
  h *= k;
  /* le glacier monte au nord */
  if (z < -22) h += lisse((-22 - z) / 8) * 2.2 * (1 - lisse((Math.abs(x - 12) - 8) / 6));
  const dl = Math.hypot(x - LAC[0], z - LAC[1]); if (dl < LAC[2] + 1) h *= lisse((dl - LAC[2]) / 1);
  return h;
}
const _c = new THREE.Color(), N1 = new THREE.Color('#e6edf5'), N2 = new THREE.Color('#d3dee9'), N3 = new THREE.Color('#f1f5f9'), GLACE = new THREE.Color('#a5d8f3'), CHEMIN = new THREE.Color('#cbd5e1'), BLEU = new THREE.Color('#93c5fd');
function couleur(x, z, f, h) {
  const bruit = Math.sin(x * .21 + Math.sin(z * .13) * 2) * Math.cos(z * .17 - x * .05) * .5 + .5;
  _c.copy(N1).lerp(bruit > .6 ? N3 : N2, Math.abs(bruit - .5) * 1.4);
  if (z < -20) _c.lerp(GLACE, lisse((-20 - z) / 6) * .8);
  if (Math.hypot(x - LAC[0], z - LAC[1]) < LAC[2] + 1.2) _c.lerp(BLEU, .5);
  if (f > .84) _c.lerp(GLACE, lisse((f - .84) / .06) * .5);
  let dc = 9; for (const [x1, z1, x2, z2, w] of CHEMINS) dc = Math.min(dc, distSegment(x, z, x1, z1, x2, z2) - w / 2);
  if (dc < .4) _c.lerp(CHEMIN, lisse((.4 - dc) / .8));
  return _c;
}

/* ── un igloo (blocs de neige, une entrée) ── */
function igloo(k = 1, drapeau = null) {
  const p = [{ g: sphere(20, 10), c: '#f8fafc', p: [0, 0, 0], s: [2 * k, 1.8 * k, 2 * k] }];
  for (let r = 0; r < 3; r++) for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2 + r * .26, y = (.4 + r * .5) * k, rr = Math.cos(Math.asin(Math.min(.95, y / (1.8 * k)))) * 2 * k + .01; p.push(B('#e2e8f0', [Math.cos(a) * rr, y, Math.sin(a) * rr], [.06, .04, .9 * k], [0, -a, 0])); }
  p.push(CY('#f1f5f9', [0, .55 * k, 2 * k], [.75 * k, 1.1 * k, .75 * k], [Math.PI / 2, 0, 0], 14), CY('#1e3a5f', [0, .5 * k, 2.4 * k], [.5 * k, .05, .55 * k], [Math.PI / 2, 0, 0], 14));
  if (drapeau) p.push(CY('#78716c', [.6 * k, 2.4 * k, 0], [.03, 1.4 * k, .03]), B(drapeau, [.95 * k, 2.85 * k, 0], [.7, .42, .03]));
  const g = construire(p, [], .03);
  return { g, obst: [[0, 0, 3.6 * k, 3.6 * k]], porte: [0, 3.4 * k] };
}
/* ── le glacier : de grands blocs bleus, et la grotte de glace ── */
function glacier() {
  const p = [];
  for (let k = 0; k < 11; k++) { const x = -11 + k * 2.2, h = 3 + (k * 37 % 5) * .8; p.push(B(k % 2 ? '#bae6fd' : '#93c5fd', [x, h / 2, (k % 3) * .6], [2.4, h, 2.6], [0, (k % 2 - .5) * .2, (k % 3 - 1) * .06])); p.push(B('#ffffff', [x, h + .1, (k % 3) * .6], [2.5, .3, 2.7], [0, (k % 2 - .5) * .2, 0])); }
  /* la grotte : une arche sombre et des cristaux */
  p.push(TO('#7dd3fc', [0, 0, 2.2], [2.2, 2.6, 1.6], [0, 0, 0], .32, Math.PI), B('#0c4a6e', [0, 1.3, 1.6], [3, 2.6, .3]));
  for (const [x, h, a] of [[-1.6, 1, .3], [-1.2, .7, -.2], [1.4, .9, -.3], [1.8, .6, .2]]) p.push(CO('#e0f2fe', [x, h / 2, 2.8], [.25, h, .25], [0, 0, a], 6));
  const g = construire(p, [], .035);
  const t = pancarte('🧊 La grotte de glace', 2.6, .5, { fond: '#f0f9ff', encre: '#075985', bord: '#38bdf8' }); t.position.set(0, 3.4, 2.3); g.add(t);
  return { g, obst: [[0, .6, 24.5, 3.4]] };
}
/* ── un banc de pingouins (de la glace pour décor) et le cor des glaces ── */
function corGlaces() {
  const cor = new THREE.Group();
  cor.add(construire([{ g: sphere(12, 8), c: '#f5f5f4', p: [0, 0, 0], s: [.16, .16, .5] }, CO('#e7e5e4', [0, 0, .55], [.22, .3, .22], [Math.PI / 2, 0, 0], 12), TO('#facc15', [0, 0, .1], [.17, .17, .17], [0, 0, 0], .2)], [], .02));
  cor.position.set(0, 1.25, 0); cor.rotation.y = .4;
  const g = new THREE.Group(); g.add(construire([B('#78716c', [0, .5, 0], [.5, 1, .5]), B('#bae6fd', [0, 1.05, 0], [.7, .1, .7])], [], .02), cor);
  let souffle = 0;
  return { g, obst: [[0, 0, .9, .9]], porte: [0, 1.3], anim: () => { souffle = 1.4; }, maj: (dt, t) => { souffle = Math.max(0, souffle - dt); cor.rotation.x = -Math.sin(souffle * 3) * .4; cor.position.y = 1.25 + (souffle > 0 ? Math.sin(t * 30) * .03 : 0); } };
}

export default {
  ile: { a: 45, b: 39, graine: .7, relief },
  sol: { couleur, plage: '#e2e8f0', fond: '#cbd5e1', eau: ['#7dd3fc', '#0369a1'] },
  neige: true, brume: [55, 150], teinte: { haut: '#bae6fd', bas: '#f0f9ff', k: .35 },
  depart: [0, 28], ballon: [-8.5, 26], zephyr: [-4.4, 27.8, .5], guide: [-13.5, 6.5, .3],
  zones: { igloos: [[-17, 8, 5], [-26, -2, 4]], banquise: [[30, 14, 5], [-30, 18, 5], [24, 26, 4]], glacier: [[-6, -18, 5], [20, -18, 4]], grotte: [[12, -21, 3.2]] },
  cachettes: [[-36, -8], [34, -12], [36, 4], [-38, 8], [-4, -30], [24, -30], [26, 26], [-30, 26], [-22, -18], [32, -2], [-6, 19], [8, 24]],
  quete: { etoileGlace1: [-32, 12], etoileGlace2: [33, -6], etoileGlace3: [-2, -21], eclatGlace1: [28, 20], eclatGlace2: [-24, -14], eclatGlace3: [6, 18] },
  lampes: [[2.4, 20], [2.4, 13], [-9, 4], [6, -6], [9, -18]],
  lieux: [
    { nom: 'La montgolfière', e: '🎈', x: -8.5, z: 26 }, { nom: 'Le village d’igloos', e: '🏠', x: -17, z: 2 }, { nom: 'Le lac gelé', e: '⛸️', x: 18, z: 10 },
    { nom: 'Le glacier', e: '🏔️', x: 0, z: -28 }, { nom: 'La grotte de glace', e: '🧊', x: 12, z: -24 }],
  construire(ctx) {
    const { placer, grille, ajouterInteractif, reserver, sol, ile, racine } = ctx;
    /* le village d'igloos, la maison d'Inuk au drapeau rouge */
    placer(igloo(1.3, '#ef4444'), -18, -2.5); placer(igloo(1), -24, 4, .8); placer(igloo(.9), -12, -4, -.6); placer(igloo(.8), -22, 10, 1.6);
    reserver(VILLAGE[0], VILLAGE[1], 9);
    placer(glacier(), 12, -27); reserver(12, -26, 13);
    /* le lac gelé (de la glace lisse, des patineurs pingouins) */
    const lac = sol.planEau(LAC[0], LAC[1], LAC[2] * 2, LAC[2] * 2, .02, ['#e0f2fe', '#bae6fd'], 0, true); void lac;
    reserver(LAC[0], LAC[1], LAC[2] + .5);
    const ping = autour(ctx, LAC[0], LAC[1], LAC[2] - 1.5, 5).map(a => [a.x, a.z, a.r]);
    const pp = [];
    for (const [x, z, r] of ping) pp.push({ g: sphere(12, 8), c: '#111827', p: [x, .5, z], s: [.32, .48, .3] }, { g: sphere(12, 8), c: '#f8fafc', p: [x + Math.sin(r) * .12, .45, z + Math.cos(r) * .12], s: [.22, .38, .2] }, { g: sphere(10, 8), c: '#facc15', p: [x + Math.sin(r) * .3, .78, z + Math.cos(r) * .3], s: [.08, .05, .1] });
    racine.add(construire(pp, [], .02));
    for (const [x, z] of ping) grille.boucherCercle(x, z, .4);
    placer(panneau('❄️ La Banquise'), -2.4, 11.5);
    const cor = placer(corGlaces(), 5.5, -12);
    ajouterInteractif({ id: 'gadget-cor', e: '📯', texte: 'Le cor des glaces', x: cor.porteMonde[0], z: cor.porteMonde[1], cible: cor.g, gadget: 'cor' });
    const surChemin = (x, z, m = 1.4) => CHEMINS.some(([x1, z1, x2, z2, w]) => distSegment(x, z, x1, z1, x2, z2) < w / 2 + m);
    const f = ile.forme;
    dessinerSapinsNeige(ctx, semer(ctx, 70, { rayon: 1.5, ecart: 2.6, bloque: .6, taille: [.85, 1.35], test: (x, z) => { const k = f(x, z); return k < .88 && (k > .62 || ctx.r() < .15) && !surChemin(x, z, 2) && z > -20; } }));
    dessinerRochers(ctx, semer(ctx, 34, { rayon: .9, bloque: .5, taille: [.5, 1.3], test: (x, z) => f(x, z) > .78 && !surChemin(x, z) }), '#bae6fd');
    dessinerRochers(ctx, semer(ctx, 14, { rayon: .8, bloque: .4, taille: [.3, .7], test: (x, z) => !surChemin(x, z) }), '#94a3b8');
    dessinerBuissons(ctx, semer(ctx, 26, { rayon: .9, ecart: 1.6, bloque: .4, taille: [.5, .9], test: (x, z) => !surChemin(x, z, 1.2) && z > -18 }), ['#f8fafc', '#e2e8f0', '#ffffff']);
    /* des petits tas de neige partout */
    const tas = semer(ctx, 120, { rayon: .3, taille: [.3, .8], test: (x, z) => !surChemin(x, z, .4) });
    racine.add(instances(sphere(10, 6), toon('#ffffff'), tas.map(a => ({ p: [a.x, a.y, a.z], s: [.5 * a.s, .22 * a.s, .45 * a.s], r: a.r })), false, 0, false));
    return { gadgets: { cor } };
  }
};
