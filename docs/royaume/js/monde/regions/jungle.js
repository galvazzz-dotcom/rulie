/* ══════════ RÉGION 4 : LA JUNGLE ══════════
   Des arbres géants et leurs lianes, la cabane de Tarzanette perchée dans un arbre, une rivière et sa cascade,
   la bananeraie, et au nord le temple perdu (ses marches couvertes de mousse). Le bâton de pluie fait pleuvoir. */
import * as THREE from 'three';
import { B, T, CY, CO, SP, TO, construire, pancarte, panneau } from '../fabrique.js';
import { semer, autour, dessinerFeuillus, dessinerPalmiers, dessinerBuissons, dessinerRochers, dessinerFleurs, dessinerHerbes, dessinerGeants, dessinerFougeres, dessinerBananiers } from '../nature.js';
import { distSegment } from '../decor.js';

const lisse = x => { x = Math.min(1, Math.max(0, x)); return x * x * (3 - 2 * x); };
const CHEMINS = [[0, 29, 0, 10, 2.4], [0, 29, -7, 26, 2.2], [0, 10, -14, 2, 2], [0, 10, 14, 4, 2], [0, 10, 0, -14, 2.2], [0, -14, -2, -24, 2.4], [14, 4, 26, -6, 1.8], [-14, 2, -28, -8, 1.8]];
const PLATS = [[-7, 26, 6], [0, 10, 6], [0, -27, 9], [-15, 3, 5], [17, 6, 5]];
const RIVIERE = [[-40, 12], [-26, 14], [-12, 18], [4, 17], [18, 20], [40, 16]];
const BASSIN = [24, 18, 4.5], BANANES = [-24, 14, 6];
const surRiviere = (x, z, m = 0) => { let d = 99; for (let k = 0; k < RIVIERE.length - 1; k++) d = Math.min(d, distSegment(x, z, ...RIVIERE[k], ...RIVIERE[k + 1])); return d < 1.8 + m; };
const collines = (x, z) => .8 * Math.sin(x * .09 + .4) * Math.cos(z * .08 - 1) + .5 * Math.sin(x * .05 + z * .07) + .5;
function relief(x, z) {
  let h = Math.max(0, collines(x, z)) * 1.3, k = 1;
  for (const [x1, z1, x2, z2, w] of CHEMINS) k = Math.min(k, lisse((distSegment(x, z, x1, z1, x2, z2) - w / 2) / 3));
  for (const [px, pz, pr] of PLATS) k = Math.min(k, lisse((Math.hypot(x - px, z - pz) - pr) / 4));
  h *= k;
  /* le temple sur sa butte */
  const dt = Math.hypot(x, z + 27); if (dt < 9) h = Math.max(h, .5 * (1 - lisse((dt - 6) / 3)));
  /* la rivière creuse son lit */
  let dr = 99; for (let i = 0; i < RIVIERE.length - 1; i++) dr = Math.min(dr, distSegment(x, z, ...RIVIERE[i], ...RIVIERE[i + 1]));
  if (dr < 3.5) h = h * lisse((dr - 1.6) / 1.9) - .7 * (1 - lisse((dr - .4) / 1.4));
  const db = Math.hypot(x - BASSIN[0], z - BASSIN[1]); if (db < BASSIN[2] + 2) h = Math.min(h, -.7 * (1 - lisse((db - BASSIN[2] + 1.2) / 1.6)));
  return h;
}
const _c = new THREE.Color(), H1 = new THREE.Color('#4caf50'), H2 = new THREE.Color('#3a9a45'), H3 = new THREE.Color('#62b955'), CHEMIN = new THREE.Color('#b58a5a'),
  BOUE = new THREE.Color('#7c6a3f'), MOUSSE = new THREE.Color('#65a30d'), PIERRE = new THREE.Color('#9ca38f');
function couleur(x, z, f, h) {
  const bruit = Math.sin(x * .23 + Math.sin(z * .15) * 2) * Math.cos(z * .19 - x * .06) * .5 + .5;
  _c.copy(H1).lerp(bruit > .6 ? H3 : H2, Math.abs(bruit - .5) * 1.5);
  if (Math.hypot(x, z + 27) < 8) _c.lerp(PIERRE, .55).lerp(MOUSSE, bruit * .35);
  if (surRiviere(x, z, .9)) _c.lerp(BOUE, .6);
  let dc = 9; for (const [x1, z1, x2, z2, w] of CHEMINS) dc = Math.min(dc, distSegment(x, z, x1, z1, x2, z2) - w / 2);
  if (dc < .4) _c.lerp(CHEMIN, lisse((.4 - dc) / .8));
  return _c;
}

/* ── le temple perdu : une pyramide à degrés, son escalier, ses statues de jaguar ── */
function temple() {
  const p = [];
  for (let k = 0; k < 4; k++) { const w = 9 - k * 2, h = 1.1; p.push(B(k % 2 ? '#a8a29e' : '#9ca38f', [0, .55 + k * h, -k * .3], [w, h, w - 1])); p.push(B('#65a30d', [0, 1.1 + k * h, -k * .3 + (w - 1) / 2 - .05], [w + .05, .14, .2])); }
  p.push(B('#78716c', [0, 2.3, 4.2], [2.4, 4.6, .5], [-.95, 0, 0]));
  for (let k = 0; k < 7; k++) p.push(B('#d6d3d1', [0, .35 + k * .6, 4.4 - k * .55], [2.3, .12, .5]));
  p.push(B('#57534e', [0, 5.1, -.9], [2.4, 1.6, 2]), B('#1c1917', [0, 4.9, .12], [.9, 1.1, .06]), T('#57534e', [0, 5.9, -.9], [2.8, .9, 2.4], [0, Math.PI / 2, 0]));
  for (const s of [-1, 1]) {
    p.push(B('#a8a29e', [s * 2.2, .55, 5.3], [.9, 1.1, .9]), SP('#facc15', [s * 2.2, 1.45, 5.3], [.42, .38, .5]), SP('#facc15', [s * 2.2, 1.85, 5.55], .24), SP('#111827', [s * 2.2 - .08, 1.9, 5.76], .04), SP('#111827', [s * 2.2 + .08, 1.9, 5.76], .04));
    for (let k = 0; k < 5; k++) p.push(SP('#4d7c0f', [s * (3.5 - k * .5), 1.2 + k * .9, 2.5 - k * .6], [.5, .25, .4]));
  }
  const g = construire(p, [], .035);
  const t = pancarte('🏛️ Le temple perdu', 2.8, .55, { fond: '#ecfccb', encre: '#365314', bord: '#65a30d' }); t.position.set(0, 1.6, 6.05); g.add(t);
  return { g, obst: [[0, 0, 9.2, 8.2], [-2.2, 5.3, 1.1, 1.1], [2.2, 5.3, 1.1, 1.1]] };
}
/* ── la cabane de Tarzanette, perchée dans un arbre géant, avec son échelle de corde ── */
function cabane() {
  const p = [CY('#6b4423', [0, 2.4, 0], [.6, 4.8, .6], [0, 0, 0], 10), CY('#a16207', [0, 3.3, 0], [2.4, .2, 2.4], [0, 0, 0], 10)];
  p.push(B('#c2884e', [0, 4.2, 0], [2.6, 1.6, 2.2]), T('#4d7c0f', [0, 5, 0], [3.2, 1.3, 2.8], [0, Math.PI / 2, 0]), B('#3f2a1d', [0, 3.95, 1.12], [.7, 1.1, .06]));
  for (let k = 0; k < 6; k++) p.push(B('#a16207', [0, .3 + k * .52, 1.35], [.6, .06, .08]));
  for (const s of [-1, 1]) p.push(CY('#78716c', [s * .3, 1.6, 1.35], [.02, 3.2, .02]));
  for (let k = 0; k < 6; k++) p.push(SP('#16a34a', [Math.cos(k) * 1.6, 6 + (k % 2) * .4, Math.sin(k) * 1.6], [1.2, .5, 1.1]));
  p.push(SP('#facc15', [1.25, 4.1, .9], .12), B('#f97316', [-1.1, 4.8, 1.12], [.5, .4, .04]));
  const g = construire(p, [], .03);
  const t = pancarte('🌴 Chez Tarzanette', 2.4, .5, { fond: '#ecfccb', encre: '#14532d', bord: '#16a34a' }); t.position.set(0, 2.6, .5); g.add(t);
  return { g, obst: [[0, 0, 1.2, 1.2]], porte: [0, 2.2] };
}
/* ── la cascade : une falaise, un rideau d'eau qui coule, un bassin ── */
function cascade() {
  const p = [];
  for (let k = 0; k < 7; k++) p.push(B(k % 2 ? '#78716c' : '#8a8a80', [-3 + k, 1.8 + (k % 3) * .4, -1.2], [1.2, 3.6 + (k % 3) * .8, 1.4], [0, (k - 3) * .08, 0]));
  for (let k = 0; k < 8; k++) p.push(SP('#16a34a', [-3.2 + k * .9, 4.2 + (k % 2) * .5, -1.1], [.7, .35, .6]));
  const g = construire(p, [], .03);
  const eau = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 3.6, 1, 8), new THREE.MeshBasicMaterial({ color: '#bae6fd', transparent: true, opacity: .75 }));
  eau.position.set(0, 1.9, -.45); g.add(eau);
  const ecume = new THREE.Mesh(new THREE.CircleGeometry(1.3, 20), new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: .6, depthWrite: false }));
  ecume.rotation.x = -Math.PI / 2; ecume.position.set(0, -.3, .2); g.add(ecume);
  return { g, obst: [[0, -1.2, 7.4, 1.6]], maj: (dt, t) => { eau.material.opacity = .62 + Math.sin(t * 6) * .12; ecume.scale.setScalar(1 + Math.sin(t * 5) * .08); } };
}
/* ── un pont de bois sur la rivière ── */
function pont() {
  const p = [];
  for (let k = 0; k < 9; k++) p.push(B(k % 2 ? '#a16207' : '#b07a45', [0, .25, -2 + k * .5], [2.4, .1, .44]));
  for (const s of [-1, 1]) { p.push(CY('#78716c', [s * 1.15, .7, 0], [.025, 4.4, .025], [Math.PI / 2, 0, 0])); for (const z of [-2, 2]) p.push(B('#6b4423', [s * 1.15, .45, z], [.14, .9, .14])); }
  return { g: construire(p, [], .02) };
}
/* le bâton de pluie : on le retourne… et il pleut sur la Jungle ! */
function batonPluie() {
  const corps = new THREE.Group();
  corps.add(construire([CY('#a16207', [0, 1, 0], [.12, 1.6, .12], [0, 0, 0], 10), CY('#f97316', [0, .5, 0], [.13, .1, .13]), CY('#22c55e', [0, 1, 0], [.13, .1, .13]), CY('#facc15', [0, 1.5, 0], [.13, .1, .13]),
    SP('#facc15', [0, 1.85, 0], [.1, .14, .1])], [], .02));
  const g = new THREE.Group(); g.add(construire([CY('#78716c', [0, .2, 0], [.45, .4, .45], [0, 0, 0], 10), B('#57534e', [0, .45, 0], [.5, .1, .5])], [], .02), corps);
  corps.position.y = .3;
  let tour = 0;
  return { g, obst: [[0, 0, .9, .9]], porte: [0, 1.3], anim: () => { tour = 1.5; }, maj: dt => { if (tour > 0) { tour = Math.max(0, tour - dt); corps.rotation.z = Math.PI * (1 - tour / 1.5) * 2; } } };
}

export default {
  ile: { a: 46, b: 40, graine: 2.3, relief },
  sol: { couleur, plage: '#f3dfa2', eau: ['#4fd1c5', '#0e7490'] },
  depart: [0, 29], ballon: [-8.5, 27], zephyr: [-4.4, 28.8, .5], guide: [-14.5, 5.5, .3],
  brume: [55, 150], teinte: { haut: '#5eead4', bas: '#bbf7d0', k: .25 },
  zones: { canopee: [[16, 6, 6], [-18, 6, 5], [10, -8, 5], [-26, 22, 5]], bananeraie: [BANANES], lianes: [[22, -14, 5], [-22, -14, 5]], temple: [[0, -19, 4.5]] },
  cachettes: [[-36, -10], [34, -16], [36, 4], [-38, 6], [12, -30], [-14, -30], [26, 27], [-30, 26], [-20, -24], [32, -2], [-6, 20], [20, -26]],
  quete: { statuette1: [-30, -6], statuette2: [28, -20], statuette3: [-8, 21], masqueJade1: [-17, -28], masqueJade2: [33, 10], masqueJade3: [-36, 18] },
  lampes: [[2.4, 21], [2.4, 14], [-4, 6], [6, -5], [2.6, -18]],
  lieux: [
    { nom: 'La montgolfière', e: '🎈', x: -8.5, z: 27 }, { nom: 'Chez Tarzanette', e: '🌴', x: -16, z: 2 }, { nom: 'Le temple perdu', e: '🏛️', x: 0, z: -27 },
    { nom: 'La cascade', e: '💦', x: 24, z: 14 }, { nom: 'La bananeraie', e: '🍌', x: -24, z: 14 }, { nom: 'Les arbres géants', e: '🌳', x: 22, z: -14 }],
  construire(ctx) {
    const { placer, grille, ajouterInteractif, reserver, sol, ile } = ctx;
    placer(temple(), 0, -28.5); reserver(0, -27, 9);
    placer(cabane(), -16.5, 2); reserver(-16.5, 2, 3.5);
    const c = placer(cascade(), BASSIN[0], BASSIN[1] - 3.6); reserver(BASSIN[0], BASSIN[1], BASSIN[2] + 2);
    sol.planEau(BASSIN[0], BASSIN[1], BASSIN[2] * 1.7, BASSIN[2] * 1.7, -.38, ['#5eead4', '#0e7490'], 0, true);
    grille.boucherCercle(BASSIN[0], BASSIN[1], BASSIN[2] - .4); void c;
    /* la rivière (sauf sous les ponts) */
    for (let k = 0; k < RIVIERE.length - 1; k++) {
      const [x1, z1] = RIVIERE[k], [x2, z2] = RIVIERE[k + 1], L = Math.hypot(x2 - x1, z2 - z1), an = Math.atan2(z2 - z1, x2 - x1);
      sol.planEau((x1 + x2) / 2, (z1 + z2) / 2, L + 1.5, 3, -.42, ['#5eead4', '#0f766e'], -an);
      for (let t = 0; t <= 1; t += .02) { const x = x1 + (x2 - x1) * t, z = z1 + (z2 - z1) * t; if (Math.abs(x) > 1.6) grille.boucherCercle(x, z, 1.3); }
    }
    placer(pont(), 0, 17.4, .06); grille.libererRect(0, 17.4, 2.2, 5);
    placer(panneau('🌴 La Jungle'), -2.4, 11.5);
    const bp = placer(batonPluie(), 3.4, -19.5, -.3);
    ajouterInteractif({ id: 'gadget-baton', e: '🎋', texte: 'Le bâton de pluie', x: bp.porteMonde[0], z: bp.porteMonde[1], cible: bp.g, gadget: 'baton' });
    /* les chemins restent libres */
    const surChemin = (x, z, m = 1.4) => CHEMINS.some(([x1, z1, x2, z2, w]) => distSegment(x, z, x1, z1, x2, z2) < w / 2 + m);
    const f = ile.forme;
    dessinerBananiers(ctx, semer(ctx, 22, { rayon: 1, ecart: 2, bloque: .35, zone: [BANANES[0] - BANANES[2], BANANES[0] + BANANES[2], BANANES[1] - BANANES[2], BANANES[1] + BANANES[2]], taille: [.85, 1.2], test: (x, z) => Math.hypot(x - BANANES[0], z - BANANES[1]) < BANANES[2] && !surChemin(x, z, 1) && !surRiviere(x, z, .8) }));
    reserver(BANANES[0], BANANES[1], BANANES[2]);
    dessinerGeants(ctx, semer(ctx, 30, { rayon: 2.6, ecart: 5.5, bloque: .6, taille: [.9, 1.25], test: (x, z) => f(x, z) < .88 && !surChemin(x, z, 2.2) && !surRiviere(x, z, 2) }));
    dessinerPalmiers(ctx, semer(ctx, 18, { rayon: 1.4, ecart: 3, bloque: .35, taille: [.8, 1.2], test: (x, z) => f(x, z) > .74 && f(x, z) < .9 && !surChemin(x, z) }));
    dessinerFeuillus(ctx, semer(ctx, 45, { rayon: 1.5, ecart: 2.6, bloque: .6, taille: [.8, 1.2], test: (x, z) => !surChemin(x, z, 2) && !surRiviere(x, z, 1.4) }), ['#15803d', '#16a34a', '#22c55e', '#166534'], '#6b4423');
    dessinerFougeres(ctx, semer(ctx, 90, { rayon: .8, taille: [.7, 1.3], test: (x, z) => !surChemin(x, z, .6) && !surRiviere(x, z, .3) }));
    dessinerBuissons(ctx, semer(ctx, 40, { rayon: 1, ecart: 1.6, bloque: .45, taille: [.6, 1.1], test: (x, z) => !surChemin(x, z, 1.2) && !surRiviere(x, z, .6) }), ['#166534', '#15803d', '#4d7c0f']);
    dessinerRochers(ctx, semer(ctx, 16, { rayon: .8, bloque: .4, taille: [.3, .8], test: (x, z) => !surChemin(x, z) }), '#8a8a80');
    dessinerFleurs(ctx, semer(ctx, 220, { rayon: .2, test: (x, z) => !surChemin(x, z, .3) && !surRiviere(x, z, .3) }), ['#f97316', '#ec4899', '#facc15', '#ef4444', '#a855f7'], .12);
    dessinerHerbes(ctx, semer(ctx, 500, { rayon: .15, taille: [.7, 1.5], test: (x, z) => !surChemin(x, z, .2) && !surRiviere(x, z, .2) }), '#3f9b46');
    return { gadgets: { baton: bp } };
  }
};
