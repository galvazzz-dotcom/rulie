/* ══════════ RÉGION 8 : LE ROYAUME DES NUAGES ══════════
   Une île posée sur une mer de nuages : le sol est doux comme du coton, des nuages partout, des moulinets qui chantent,
   un grand arc-en-ciel, la tour d'Aurélie Azur (et son planeur), et au sommet, le palais des nuages.
   Le tambour d'orage fait pleuvoir. */
import * as THREE from 'three';
import { B, T, CY, CO, SP, TO, construire, pancarte, panneau, fenetre } from '../fabrique.js';
import { semer, autour, dessinerFleurs, dessinerHerbes, dessinerNuagesSol, dessinerBuissons, dessinerRochers } from '../nature.js';
import { sphere } from '../../moteur/formes.js';
import { toon, texRonde } from '../../moteur/materiaux.js';
import { ARC } from '../../moteur/couleurs.js';
import { distSegment } from '../decor.js';

const lisse = x => { x = Math.min(1, Math.max(0, x)); return x * x * (3 - 2 * x); };
const CHEMINS = [[0, 28, 0, 8, 2.4], [0, 28, -7, 25, 2.2], [0, 8, 0, -14, 2.4], [0, 8, -18, 4, 2.2], [0, 8, 18, 6, 2.2], [18, 6, 26, -8, 1.8], [-18, 4, -26, -10, 1.8]];
const PLATS = [[-7, 25, 6], [0, 8, 6], [0, -22, 9], [18, 6, 5], [-18, 4, 5]];
const ARC_C = [-18, -12];
const coton = (x, z) => .7 * Math.sin(x * .12 + .7) * Math.cos(z * .11 - .3) + .5 * Math.sin(x * .07 + z * .08 + 2) + .45;
function relief(x, z) {
  let h = Math.max(0, coton(x, z)) * 1.3, k = 1;
  for (const [x1, z1, x2, z2, w] of CHEMINS) k = Math.min(k, lisse((distSegment(x, z, x1, z1, x2, z2) - w / 2) / 3));
  for (const [px, pz, pr] of PLATS) k = Math.min(k, lisse((Math.hypot(x - px, z - pz) - pr) / 4));
  h *= k;
  /* le sommet (le palais) au nord */
  const ds = Math.hypot(x, z + 24); if (ds < 14) h = Math.max(h, 1.4 * (1 - lisse((ds - 8) / 6)));
  return h;
}
const _c = new THREE.Color(), C1 = new THREE.Color('#f8fafc'), C2 = new THREE.Color('#e0f2fe'), C3 = new THREE.Color('#fdf4ff'), CHEMIN = new THREE.Color('#fde68a'), ROSE = new THREE.Color('#fbcfe8');
function couleur(x, z, f, h) {
  const bruit = Math.sin(x * .2 + Math.sin(z * .12) * 2) * Math.cos(z * .16 - x * .05) * .5 + .5;
  _c.copy(C1).lerp(bruit > .6 ? C3 : C2, Math.abs(bruit - .5) * 1.6);
  if (Math.hypot(x - ARC_C[0], z - ARC_C[1]) < 7) _c.lerp(ROSE, .3);
  let dc = 9; for (const [x1, z1, x2, z2, w] of CHEMINS) dc = Math.min(dc, distSegment(x, z, x1, z1, x2, z2) - w / 2);
  if (dc < .4) _c.lerp(CHEMIN, lisse((.4 - dc) / .8));
  return _c;
}

/* ── le palais des nuages : des tours blanches et dorées, des toits bleus, des drapeaux ── */
function palais() {
  const p = [], f = [];
  p.push(B('#f8fafc', [0, 2, 0], [9, 4, 5]), B('#facc15', [0, 4.1, 0], [9.2, .25, 5.2]));
  for (const [x, z, h] of [[-4.6, -1.6, 7], [4.6, -1.6, 7], [-4.6, 2, 5.5], [4.6, 2, 5.5], [0, -1.5, 9]]) {
    p.push(CY('#ffffff', [x, h / 2, z], [1.2, h, 1.2], [0, 0, 0], 16), CO('#60a5fa', [x, h + 1.1, z], [1.5, 2.2, 1.5], [0, 0, 0], 16), CY('#facc15', [x, h + .05, z], [1.28, .2, 1.28], [0, 0, 0], 16));
    p.push(CY('#9ca3af', [x, h + 2.8, z], [.03, 1.2, .03]), B(ARC[Math.abs(Math.round(x + z)) % 8], [x + .3, h + 3.2, z], [.6, .36, .03]));
  }
  p.push(B('#1d4ed8', [0, 1.4, 2.52], [1.6, 2.8, .12]), { g: sphere(16, 10), c: '#1d4ed8', p: [0, 2.8, 2.52], s: [.8, .6, .08] });
  for (const x of [-2.8, 2.8]) fenetre(p, f, x, 2.4, 2.52, .9, 1.2, '#facc15');
  for (let k = 0; k < 12; k++) p.push(SP('#ffffff', [-5 + k * .9, .4, 3.2 + (k % 2) * .4], [.8, .5, .6]));
  const g = construire(p, f);
  const t = pancarte('🏰 Le palais des nuages', 3.4, .6, { fond: '#eff6ff', encre: '#1e3a8a', bord: '#60a5fa' }); t.position.set(0, 4.75, 2.65); g.add(t);
  return { g, obst: [[0, 0, 11, 5.6], [0, 3.4, 11, 1]], porte: [0, 4.6] };
}
/* ── la tour d'Aurélie Azur, son manche à air et son planeur ── */
function tour() {
  const p = [CY('#e0f2fe', [0, 2.2, 0], [1.8, 4.4, 1.8], [0, 0, 0], 16), CO('#f472b6', [0, 5.2, 0], [2.2, 1.8, 2.2], [0, 0, 0], 16), B('#1d4ed8', [0, 1, 1.78], [.9, 2, .1])];
  p.push(CY('#9ca3af', [2.4, 2, 0], [.04, 4, .04]), CO('#f97316', [2.85, 3.85, 0], [.25, 1, .25], [0, 0, -Math.PI / 2], 10));
  /* le planeur posé à côté */
  p.push(SP('#f8fafc', [-3.2, .6, 1], [.4, .3, 1.4]), B('#38bdf8', [-3.2, .75, 1.1], [4.2, .06, .7]), B('#38bdf8', [-3.2, .8, -.2], [1.2, .05, .3]), B('#f472b6', [-3.2, 1.05, -.25], [.05, .45, .3]));
  const g = construire(p, []);
  const t = pancarte('🪁 Chez Aurélie Azur', 2.6, .5, { fond: '#fdf2f8', encre: '#9d174d', bord: '#f472b6' }); t.position.set(0, 3.1, 1.85); g.add(t);
  return { g, obst: [[0, 0, 3.8, 3.8], [-3.2, 1, 4.4, 2.4]], porte: [0, 3] };
}
/* ── un grand arc-en-ciel (on passe dessous) ── */
function arcEnCiel() {
  const p = ARC.slice(0, 7).map((c, i) => ({ g: new THREE.TorusGeometry(7 - i * .35, .17, 8, 40, Math.PI), c, p: [0, 0, 0], s: 1 }));
  const g = construire(p, [], 0);
  for (const s of [-1, 1]) g.add(construire([SP('#ffffff', [s * 5.8, .5, 0], [1.6, .9, 1.2]), SP('#f8fafc', [s * 6.6, .8, .3], [1.1, .8, 1])], [], .03));
  return { g, obst: [[-6.2, 0, 2.4, 1.6], [6.2, 0, 2.4, 1.6]] };
}
/* ── un moulinet qui chante dans le vent ── */
function moulinet(c) {
  const ailes = construire([0, 1, 2, 3].map(k => B(k % 2 ? '#ffffff' : c, [Math.cos(k * Math.PI / 2) * .45, Math.sin(k * Math.PI / 2) * .45, 0], [.85, .2, .03], [0, 0, k * Math.PI / 2])), [], .015);
  ailes.position.set(0, 2.2, .1);
  const g = new THREE.Group(); g.add(construire([CY('#e5e7eb', [0, 1.1, 0], [.05, 2.2, .05])], [], .015), ailes);
  const v = .8 + Math.random() * 1.2;
  return { g, obst: [[0, 0, .3, .3]], maj: dt => { ailes.rotation.z -= dt * v * 2; } };
}
/* le tambour d'orage : on tape dessus… et il pleut sur les Nuages ! */
function tambour() {
  const peau = construire([CY('#f8fafc', [0, 0, 0], [.55, .06, .55], [0, 0, 0], 18)], [], .015);
  peau.position.y = .98;
  const g = new THREE.Group(); g.add(construire([CY('#1d4ed8', [0, .5, 0], [.55, .9, .55], [0, 0, 0], 18), CY('#facc15', [0, .5, 0], [.57, .1, .57], [0, 0, 0], 18), B('#facc15', [0, .5, .56], [.08, .7, .03], [0, 0, .5])], [], .02), peau);
  let coup = 0;
  return { g, obst: [[0, 0, 1.2, 1.2]], porte: [0, 1.4], anim: () => { coup = 1.5; }, maj: (dt, t) => { coup = Math.max(0, coup - dt); peau.position.y = .98 + (coup > 0 ? Math.abs(Math.sin(t * 25)) * .05 : 0); } };
}

export default {
  ile: { a: 44, b: 38, graine: 3.3, relief },
  sol: { couleur, plage: '#e0f2fe', fond: '#bfdbfe', eau: ['#f8fafc', '#bfdbfe'] },
  brume: [60, 170], teinte: { haut: '#93c5fd', bas: '#fdf4ff', k: .35 },
  depart: [0, 28], ballon: [-8.5, 26], zephyr: [-4.4, 27.8, .5], guide: [16, 9.5, -.3],
  zones: { nuages: [[0, 2, 6], [10, 18, 5], [-12, 18, 5]], vents: [[24, -2, 5], [-26, 2, 5]], arc: [[ARC_C[0], ARC_C[1] + 2.5, 3]], sommet: [[0, -16, 3.5]] },
  cachettes: [[-34, -10], [33, -14], [35, 4], [-37, 10], [10, -28], [-12, -28], [24, 25], [-28, 24], [-28, -16], [30, 14], [-6, 19], [14, 22]],
  quete: { plumeEclair1: [30, -10], plumeEclair2: [-32, 8], plumeEclair3: [12, -24], noteMusique1: [-24, 20], noteMusique2: [26, 20], noteMusique3: [-10, -26] },
  lampes: [[2.4, 20], [2.4, 13], [-6, 6], [6, 6], [2.6, -10]],
  lieux: [
    { nom: 'La montgolfière', e: '🎈', x: -8.5, z: 26 }, { nom: 'Chez Aurélie Azur', e: '🪁', x: 19, z: 5 }, { nom: 'Le palais des nuages', e: '🏰', x: 0, z: -24 },
    { nom: 'L’arc-en-ciel', e: '🌈', x: ARC_C[0], z: ARC_C[1] }, { nom: 'Les moulinets', e: '🎐', x: 24, z: -2 }],
  construire(ctx) {
    const { placer, grille, ajouterInteractif, reserver, ile, racine } = ctx;
    placer(palais(), 0, -25); reserver(0, -24, 8);
    placer(tour(), 19, 3, -.3); reserver(19, 4, 5);
    placer(arcEnCiel(), ARC_C[0], ARC_C[1], .5); reserver(ARC_C[0], ARC_C[1], 7.5);
    for (const [x, z, c] of [[22, -4, '#f472b6'], [26, 0, '#38bdf8'], [24, 4, '#facc15'], [-24, 0, '#a78bfa'], [-28, 4, '#4ade80'], [-26, -4, '#fb923c']]) { placer(moulinet(c), x, z); reserver(x, z, 1); }
    placer(panneau('☁️ Le Royaume des Nuages', 2.8), -2.6, 11.5);
    const tb = placer(tambour(), 4, -15);
    ajouterInteractif({ id: 'gadget-tambour', e: '🥁', texte: 'Le tambour d’orage', x: tb.porteMonde[0], z: tb.porteMonde[1], cible: tb.g, gadget: 'tambour' });
    /* des nuages qui flottent au loin, au-dessus de la mer de nuages */
    const loin = [];
    for (let k = 0; k < 16; k++) { const a = k / 16 * Math.PI * 2 + ctx.r(), d = 58 + ctx.r() * 20; loin.push({ x: Math.cos(a) * d, z: Math.sin(a) * d * .9, s: 2.5 + ctx.r() * 2.5, r: ctx.r() * 6, y: -1 + ctx.r() * 6 }); }
    const nuagesLoin = new THREE.Group(); racine.add(nuagesLoin);
    dessinerNuagesSol({ ...ctx, racine: nuagesLoin }, loin);
    ctx.majs.push((dt, t) => { nuagesLoin.rotation.y = t * .01; });
    const surChemin = (x, z, m = 1.4) => CHEMINS.some(([x1, z1, x2, z2, w]) => distSegment(x, z, x1, z1, x2, z2) < w / 2 + m);
    dessinerNuagesSol(ctx, semer(ctx, 70, { rayon: 1.2, ecart: 2.4, bloque: .7, taille: [.7, 1.6], test: (x, z) => !surChemin(x, z, 1.6) }));
    dessinerBuissons(ctx, semer(ctx, 26, { rayon: .9, ecart: 1.6, bloque: .4, taille: [.5, .9], test: (x, z) => !surChemin(x, z, 1.2) }), ['#fbcfe8', '#bfdbfe', '#ddd6fe']);
    dessinerRochers(ctx, semer(ctx, 10, { rayon: .8, bloque: .4, taille: [.3, .6], test: (x, z) => !surChemin(x, z) }), '#e0e7ff');
    dessinerFleurs(ctx, semer(ctx, 240, { rayon: .2, test: (x, z) => !surChemin(x, z, .3) }), ['#f472b6', '#a78bfa', '#60a5fa', '#facc15', '#ffffff'], .1);
    dessinerHerbes(ctx, semer(ctx, 260, { rayon: .15, taille: [.5, 1], test: (x, z) => !surChemin(x, z, .2) }), '#bae6fd');
    void grille; void ile; void sphere; void toon; void texRonde; void autour;
    return { gadgets: { tambour: tb } };
  }
};
