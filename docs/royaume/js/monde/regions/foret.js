/* ══════════ RÉGION 7 : LA FORÊT DE LA LUNE ══════════
   Une forêt bleue où il fait toujours un peu nuit : des arbres aux feuilles violettes, des champignons géants qui brillent,
   l'étang de lune (une lune s'y reflète), la colline aux étoiles et son cercle de pierres, l'observatoire du Comte Hibou.
   La boîte à musique fait tomber la nuit. */
import * as THREE from 'three';
import { B, T, CY, CO, SP, TO, construire, pancarte, panneau, fenetre } from '../fabrique.js';
import { semer, autour, dessinerFeuillus, dessinerPins, dessinerBuissons, dessinerRochers, dessinerFleurs, dessinerHerbes, dessinerChampignons } from '../nature.js';
import { instances } from '../ile.js';
import { sphere } from '../../moteur/formes.js';
import { toon, texRonde } from '../../moteur/materiaux.js';
import { distSegment } from '../decor.js';

const lisse = x => { x = Math.min(1, Math.max(0, x)); return x * x * (3 - 2 * x); };
const CHEMINS = [[0, 28, 0, 8, 2.4], [0, 28, -7, 25, 2.2], [0, 8, 16, 2, 2.2], [0, 8, -14, 0, 2], [0, 8, 0, -12, 2.2], [0, -12, -10, -22, 2], [16, 2, 26, -10, 1.8]];
const PLATS = [[-7, 25, 6], [0, 8, 6], [17, 1, 6], [-12, -24, 7]];
const ETANG = [-18, 4, 5.5];
const COLLINE = [-12, -25, 6];
const ondule = (x, z) => .8 * Math.sin(x * .08 + 2) * Math.cos(z * .09 + .5) + .5 * Math.sin(x * .05 - z * .06 + 1) + .45;
function relief(x, z) {
  let h = Math.max(0, ondule(x, z)) * 1.2, k = 1;
  for (const [x1, z1, x2, z2, w] of CHEMINS) k = Math.min(k, lisse((distSegment(x, z, x1, z1, x2, z2) - w / 2) / 3));
  for (const [px, pz, pr] of PLATS) k = Math.min(k, lisse((Math.hypot(x - px, z - pz) - pr) / 4));
  h *= k;
  const dc = Math.hypot(x - COLLINE[0], z - COLLINE[1]); if (dc < COLLINE[2] + 6) h = Math.max(h, 1.6 * (1 - lisse((dc - COLLINE[2]) / 6)));
  const de = Math.hypot(x - ETANG[0], z - ETANG[1]); if (de < ETANG[2] + 2.5) h = h * lisse((de - ETANG[2]) / 2.5) - .7 * (1 - lisse((de - ETANG[2] + 1.4) / 1.4));
  return h;
}
const _c = new THREE.Color(), M1 = new THREE.Color('#3b6b8f'), M2 = new THREE.Color('#2f5878'), M3 = new THREE.Color('#4a7fa3'), CHEMIN = new THREE.Color('#9aa5c4'), MOUSSE = new THREE.Color('#5b4b9e'), PIERRE = new THREE.Color('#8b8fae');
function couleur(x, z, f, h) {
  const bruit = Math.sin(x * .22 + Math.sin(z * .14) * 2) * Math.cos(z * .18 - x * .06) * .5 + .5;
  _c.copy(M1).lerp(bruit > .6 ? M3 : M2, Math.abs(bruit - .5) * 1.4).lerp(MOUSSE, bruit * .2);
  if (Math.hypot(x - COLLINE[0], z - COLLINE[1]) < COLLINE[2] + 1) _c.lerp(PIERRE, .35);
  let dc = 9; for (const [x1, z1, x2, z2, w] of CHEMINS) dc = Math.min(dc, distSegment(x, z, x1, z1, x2, z2) - w / 2);
  if (dc < .4) _c.lerp(CHEMIN, lisse((.4 - dc) / .8));
  return _c;
}

/* ── l'observatoire du Comte Hibou : une tour ronde, une coupole et sa lunette ── */
function observatoire() {
  const p = [], f = [];
  p.push(CY('#cbd5e1', [0, 2.6, 0], [2.4, 5.2, 2.6], [0, 0, 0], 18), CY('#94a3b8', [0, .15, 0], [3, .3, 3], [0, 0, 0], 18));
  p.push({ g: sphere(20, 12), c: '#4338ca', p: [0, 5.3, 0], s: [2.5, 2.2, 2.5] }, B('#1e1b4b', [0, 6.2, .9], [.7, 1.8, 1.8], [-.5, 0, 0]), CY('#facc15', [0, 7.1, 1.7], [.22, 1.9, .22], [-1, 0, 0]));
  p.push(B('#1e1b4b', [0, 1.1, 2.48], [1.1, 2.2, .14]), SP('#facc15', [.35, 1.1, 2.58], .07));
  fenetre(p, f, -1.5, 3.2, 2, .6, .8, '#4338ca'); fenetre(p, f, 1.5, 3.2, 2, .6, .8, '#4338ca');
  for (let k = 0; k < 6; k++) p.push(SP('#facc15', [Math.cos(k) * 2.55, 4.7, Math.sin(k) * 2.55], .09));
  const g = construire(p, f);
  const t = pancarte('🔭 L’observatoire', 2.4, .5, { fond: '#eef2ff', encre: '#3730a3', bord: '#6366f1' }); t.position.set(0, 2.5, 2.62); g.add(t);
  return { g, obst: [[0, 0, 5.6, 5.6]], porte: [0, 3.6] };
}
/* ── le cercle de pierres de la colline aux étoiles ── */
function cercle() {
  const p = [];
  for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2; p.push(B(k % 2 ? '#a5b4fc' : '#c7d2fe', [Math.cos(a) * 4.2, 1.1, Math.sin(a) * 4.2], [.7, 2.2, .5], [0, -a, (k % 3 - 1) * .05])); }
  p.push(CY('#c7d2fe', [0, .3, 0], [1.2, .6, 1.2], [0, 0, 0], 12));
  return { g: construire(p, [], .03), obst: Array.from({ length: 8 }, (_, k) => [Math.cos(k / 8 * Math.PI * 2) * 4.2, Math.sin(k / 8 * Math.PI * 2) * 4.2, .9, .9]).concat([[0, 0, 2.5, 2.5]]) };
}
/* la boîte à musique : on tourne la manivelle… et la nuit tombe sur la Forêt */
function boiteMusique() {
  const couvercle = new THREE.Group();
  couvercle.add(construire([B('#7c3aed', [0, 0, .25], [.7, .08, .5]), SP('#facc15', [0, .08, .25], .06)], [], .02));
  couvercle.position.set(0, 1.12, -.25);
  const danseuse = construire([SP('#f9a8d4', [0, .2, 0], [.07, .14, .07]), CO('#f472b6', [0, .08, 0], [.12, .12, .12], [Math.PI, 0, 0], 10), SP('#fde68a', [0, .36, 0], .05)], [], .015);
  danseuse.position.set(0, 1.1, 0); danseuse.visible = false;
  const g = new THREE.Group(); g.add(construire([B('#6d28d9', [0, .55, 0], [.4, 1.1, .4]), B('#8b5cf6', [0, 1.02, 0], [.7, .2, .5]), CY('#facc15', [.4, 1, 0], [.02, .3, .02], [0, 0, Math.PI / 2])], [], .02), couvercle, danseuse);
  let joue = 0;
  return { g, obst: [[0, 0, .9, .9]], porte: [0, 1.3], anim: () => { joue = 4; }, maj: (dt, t) => { joue = Math.max(0, joue - dt); couvercle.rotation.x = -Math.min(1.4, joue * 2) * (joue > 0 ? 1 : 0); danseuse.visible = joue > 0; danseuse.rotation.y = t * 4; } };
}

export default {
  ile: { a: 45, b: 39, graine: 5.3, relief },
  sol: { couleur, plage: '#c7d2fe', fond: '#6366f1', eau: ['#818cf8', '#1e1b4b'] },
  brume: [45, 140], teinte: { haut: '#312e81', bas: '#a5b4fc', k: .55 },
  depart: [0, 28], ballon: [-8.5, 26], zephyr: [-4.4, 27.8, .5], guide: [13.5, 7.5, -.3],
  zones: { clairiere: [[0, 0, 5], [10, 16, 5], [-14, 16, 4]], bois: [[24, 12, 5], [-28, -8, 5], [22, -18, 5]], etang: [[ETANG[0], ETANG[1], ETANG[2] + 2.5]], colline: [[COLLINE[0], COLLINE[1] + 1, 3]] },
  cachettes: [[-36, -10], [34, -14], [36, 4], [-38, 14], [10, -30], [-30, -22], [26, 26], [-28, 26], [6, -22], [32, -2], [-6, 19], [16, 22]],
  quete: { eclatLune1: [30, -8], eclatLune2: [-30, 18], eclatLune3: [6, -24] },
  lampes: [[2.4, 20], [2.4, 13], [-5, 6], [8, 4], [2.6, -8], [-6, -18]],
  lieux: [
    { nom: 'La montgolfière', e: '🎈', x: -8.5, z: 26 }, { nom: 'L’observatoire du Comte Hibou', e: '🔭', x: 17, z: -1 }, { nom: 'L’étang de lune', e: '🌕', x: ETANG[0], z: ETANG[1] },
    { nom: 'La colline aux étoiles', e: '⭐', x: COLLINE[0], z: COLLINE[1] }, { nom: 'Les champignons géants', e: '🍄', x: 22, z: 16 }],
  construire(ctx) {
    const { placer, grille, ajouterInteractif, reserver, sol, ile, racine, majs } = ctx;
    placer(observatoire(), 17, -2); reserver(17, -1, 4.5);
    placer(cercle(), COLLINE[0], COLLINE[1] - 1); reserver(COLLINE[0], COLLINE[1], 6);
    /* l'étang de lune : une lune qui s'y reflète */
    sol.planEau(ETANG[0], ETANG[1], (ETANG[2] - .6) * 2, (ETANG[2] - .6) * 2, -.36, ['#a5b4fc', '#312e81'], 0, true);
    grille.boucherCercle(ETANG[0], ETANG[1], ETANG[2] - .4); reserver(ETANG[0], ETANG[1], ETANG[2] + .6);
    const reflet = new THREE.Mesh(new THREE.CircleGeometry(1.3, 24), new THREE.MeshBasicMaterial({ color: '#fef9c3', transparent: true, opacity: .8, depthWrite: false }));
    reflet.rotation.x = -Math.PI / 2; reflet.position.set(ETANG[0] + 1, -.3, ETANG[1] - 1); racine.add(reflet);
    /* une grande lune dans le ciel, au-dessus de la forêt */
    const lune = new THREE.Mesh(sphere(24, 16), new THREE.MeshBasicMaterial({ color: '#fef9c3' })); lune.scale.setScalar(4); lune.position.set(-30, 30, -60); racine.add(lune);
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: texRonde(), color: '#fde68a', transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: .5 })); halo.scale.setScalar(22); halo.position.copy(lune.position); racine.add(halo);
    placer(panneau('🌙 La Forêt de la Lune'), -2.6, 11.5);
    const bm = placer(boiteMusique(), -3.5, -12);
    ajouterInteractif({ id: 'gadget-boite', e: '🎵', texte: 'La boîte à musique', x: bm.porteMonde[0], z: bm.porteMonde[1], cible: bm.g, gadget: 'boite' });
    const surChemin = (x, z, m = 1.4) => CHEMINS.some(([x1, z1, x2, z2, w]) => distSegment(x, z, x1, z1, x2, z2) < w / 2 + m);
    const f = ile.forme;
    dessinerFeuillus(ctx, semer(ctx, 80, { rayon: 1.6, ecart: 2.6, bloque: .7, taille: [.9, 1.4], test: (x, z) => { const k = f(x, z); return k < .9 && (k > .6 || ctx.r() < .2) && !surChemin(x, z, 2); } }), ['#6d28d9', '#4f46e5', '#7c3aed', '#3730a3', '#2563eb'], '#1e1b4b');
    dessinerPins(ctx, semer(ctx, 24, { rayon: 1.4, ecart: 2.4, bloque: .6, taille: [.9, 1.4], test: (x, z) => f(x, z) > .6 && f(x, z) < .9 && !surChemin(x, z, 2) }), ['#312e81', '#3730a3', '#4338ca']);
    const lueur = dessinerChampignons(ctx, semer(ctx, 40, { rayon: .9, ecart: 1.5, bloque: .3, taille: [.8, 2.6], test: (x, z) => !surChemin(x, z, 1) }));
    majs.push((dt, t, nuit) => { lueur.emissiveIntensity = .35 + nuit * .6 + Math.sin(t * 1.5) * .08; });
    dessinerBuissons(ctx, semer(ctx, 40, { rayon: 1, ecart: 1.6, bloque: .5, taille: [.6, 1.1], test: (x, z) => !surChemin(x, z, 1.2) }), ['#4338ca', '#5b21b6', '#3730a3']);
    dessinerRochers(ctx, semer(ctx, 16, { rayon: .8, bloque: .4, taille: [.3, .7], test: (x, z) => !surChemin(x, z) }), '#8b8fae');
    dessinerFleurs(ctx, semer(ctx, 220, { rayon: .2, test: (x, z) => !surChemin(x, z, .3) }), ['#c4b5fd', '#f0abfc', '#ffffff', '#93c5fd', '#fde68a'], .1);
    dessinerHerbes(ctx, semer(ctx, 450, { rayon: .15, taille: [.6, 1.3], test: (x, z) => !surChemin(x, z, .2) }), '#4b6cb7');
    /* des lucioles qui dansent */
    const N = 60, pos = new Float32Array(N * 3), base = Array.from({ length: N }, () => [(ctx.r() - .5) * 70, .5 + ctx.r() * 2.5, (ctx.r() - .5) * 60, ctx.r() * 6]);
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({ color: '#fde68a', size: .35, map: texRonde(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
    const pts = new THREE.Points(geo, mat); pts.frustumCulled = false; racine.add(pts);
    majs.push((dt, t, nuit) => { mat.opacity = .45 + nuit * .55; base.forEach(([x, y, z, ph], i) => pos.set([x + Math.sin(t * .4 + ph) * 1.5, y + Math.sin(t * 1.3 + ph) * .4, z + Math.cos(t * .35 + ph) * 1.5], i * 3)); geo.attributes.position.needsUpdate = true; });
    void instances; void toon;
    return { gadgets: { boite: bm } };
  }
};
