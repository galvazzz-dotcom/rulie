/* ══════════ RÉGION 2 : LE MAROC IMAGINAIRE ══════════
   Des dunes dorées, le ksar (remparts, tours crénelées, la porte en fer à cheval, la fontaine du riad),
   le souk (étals à rayures, tapis, épices, poteries, les 3 lanternes de la quête), l'oasis et ses palmiers,
   une tente berbère, et le cadran solaire magique qui fait tomber la nuit. */
import * as THREE from 'three';
import { B, CY, CO, SP, DS, TO, construire, pancarte, panneau } from '../fabrique.js';
import { cylindre } from '../../moteur/formes.js';
import { toon, texRonde } from '../../moteur/materiaux.js';
import { semer, autour, dessinerPalmiers, dessinerBuissons, dessinerRochers, dessinerRoseaux, dessinerHerbes } from '../nature.js';
import { distSegment } from '../decor.js';

const lisse = x => { x = Math.min(1, Math.max(0, x)); return x * x * (3 - 2 * x); };
const CHEMINS = [[21, 25, 6, 12, 2.4], [21, 25, 26, 22, 2.2], [6, 12, -6, 6, 2.4], [-6, 6, -25, 6, 2.6], [6, 12, 0, -14, 2.4], [8, 6, 13, 0, 2]];
const KSAR = { x: 0, z: -21, w: 22, d: 12 };
const PLATS = [[28, 20.5, 6], [21, 25, 4], [6, 12, 5], [-15, 6, 10], [KSAR.x, KSAR.z, 14], [18, -2, 9], [26, 7, 4], [4, 7, 3]];
const OASIS = [18, -2, 5];
const LANTERNES = [[-21.5, 3.6], [-12.5, 9.2], [-8.5, 3.6]];

function relief(x, z) {
  let h = 2.3 * Math.max(0, Math.sin(x * .11 + Math.sin(z * .07) * 1.5) * Math.cos(z * .09 - x * .03)) + .7 * Math.max(0, Math.sin(x * .05 + z * .045 + 1)), k = 1;
  for (const [x1, z1, x2, z2, w] of CHEMINS) k = Math.min(k, lisse((distSegment(x, z, x1, z1, x2, z2) - w / 2) / 4));
  for (const [px, pz, pr] of PLATS) k = Math.min(k, lisse((Math.hypot(x - px, z - pz) - pr) / 5));
  h *= k;
  const dm = Math.hypot(x - OASIS[0], z - OASIS[1]);
  if (dm < OASIS[2] + 2) h = h * lisse((dm - OASIS[2]) / 2) - .8 * (1 - lisse((dm - OASIS[2] + 1.4) / 1.4));
  return h;
}
const _c = new THREE.Color(), S1 = new THREE.Color('#efcf8b'), S2 = new THREE.Color('#f8e3aa'), S3 = new THREE.Color('#e0b468'), PAVE = new THREE.Color('#d39a62'),
  VERT = new THREE.Color('#b7c46e'), ZEL1 = new THREE.Color('#0f766e'), ZEL2 = new THREE.Color('#f8fafc'), ZEL3 = new THREE.Color('#1d4ed8'), CHEMIN = new THREE.Color('#d9ab70');
function couleur(x, z, f, h) {
  const b = Math.sin(x * .3 + z * .1) * .5 + .5;
  _c.copy(S1).lerp(h > 1 ? S2 : S3, Math.min(1, Math.abs(h - 1) * .45)).lerp(S2, b * .15);
  const dm = Math.hypot(x - OASIS[0], z - OASIS[1]); if (dm < OASIS[2] + 4) _c.lerp(VERT, lisse((OASIS[2] + 4 - dm) / 3) * .8);
  let dc = 9; for (const [x1, z1, x2, z2, w] of CHEMINS) dc = Math.min(dc, distSegment(x, z, x1, z1, x2, z2) - w / 2);
  if (dc < .4) _c.lerp(CHEMIN, lisse((.4 - dc) / .8));
  /* l'intérieur du ksar : un pavement, et des zelliges autour de la fontaine */
  if (Math.abs(x - KSAR.x) < KSAR.w / 2 - .4 && Math.abs(z - KSAR.z) < KSAR.d / 2 - .4) {
    _c.copy(PAVE);
    const r = Math.hypot(x - KSAR.x, z - KSAR.z);
    if (r < 4.2) { const q = (Math.floor(x * 1.3) + Math.floor(z * 1.3)) & 3; _c.copy(q === 0 ? ZEL1 : q === 2 ? ZEL3 : ZEL2); }
  }
  if (Math.abs(x + 15) < 10 && Math.abs(z - 6) < 1.7) _c.lerp(PAVE, .7);
  return _c;
}

/* ── le ksar : remparts en terre, tours crénelées, la porte ── */
function ksar() {
  const p = [], { w, d } = KSAR, H = 3.2, TERRE = '#c97c4a', CLAIR = '#d99060';
  const mur = (cx, cz, L, horiz) => {
    p.push(B(TERRE, [cx, H / 2, cz], horiz ? [L, H, .8] : [.8, H, L]));
    for (let k = 0; k < Math.floor(L / 1.1); k++) { const o = -L / 2 + .55 + k * 1.1; p.push(B(CLAIR, horiz ? [cx + o, H + .3, cz] : [cx, H + .3, cz + o], [.55, .6, .85])); }
  };
  mur(0, -d / 2, w, true); mur(-w / 2, 0, d, false); mur(w / 2, 0, d, false);
  mur(-w / 4 - .9, d / 2, w / 2 - 1.8, true); mur(w / 4 + .9, d / 2, w / 2 - 1.8, true);
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
    p.push(B(TERRE, [sx * w / 2, 2.6, sz * d / 2], [2.6, 5.2, 2.6]), B(CLAIR, [sx * w / 2, 5.3, sz * d / 2], [2.9, .25, 2.9]));
    for (const [mx, mz] of [[-1, -1], [1, -1], [-1, 1], [1, 1], [0, -1], [0, 1], [-1, 0], [1, 0]]) p.push(B(CLAIR, [sx * w / 2 + mx * 1.15, 5.75, sz * d / 2 + mz * 1.15], [.5, .7, .5]));
    p.push(B('#1f2937', [sx * w / 2, 3.6, sz * d / 2 + 1.32], [.35, .7, .05]));
  }
  /* la porte en fer à cheval */
  for (const s of [-1, 1]) p.push(B(TERRE, [s * 1.9, 2.3, d / 2], [1, 4.6, 1.1]));
  p.push(B(TERRE, [0, 4.1, d / 2], [4.8, 1.1, 1.1]), TO('#e7b089', [0, 2.8, d / 2 + .56], [1.45, 1.45, 1], [0, 0, 0], .14, Math.PI * 1.25), B('#e7b089', [0, 4.75, d / 2], [4.9, .2, 1.2]));
  for (let k = -2; k <= 2; k++) p.push(B(CLAIR, [k * .95, 5.1, d / 2], [.5, .6, 1.15]));
  /* la fontaine du riad, des orangers en pot */
  p.push(CY('#f8fafc', [0, .3, 0], [1.8, .6, 1.8], [0, 0, 0], 8), CY('#0ea5e9', [0, .58, 0], [1.55, .06, 1.55], [0, 0, 0], 8), CY('#f8fafc', [0, .9, 0], [.25, .8, .25], [0, 0, 0], 8), CY('#0f766e', [0, 1.35, 0], [.6, .15, .6], [0, 0, 0], 8));
  for (const [x, z] of [[-6, -3], [6, -3], [-6, 3], [6, 3]]) p.push(CY('#b45309', [x, .4, z], [.45, .8, .45], [0, 0, 0], 10), CY('#7c4a22', [x, 1.1, z], [.06, .8, .06]), SP('#15803d', [x, 1.8, z], [.65, .6, .65]), SP('#fb923c', [x + .3, 1.9, z + .35], .1), SP('#fb923c', [x - .35, 1.7, z + .2], .1));
  const g = construire(p, [], .035);
  const t = pancarte('🏰 Le ksar', 2, .5, { fond: '#fff7ed', encre: '#9a3412', bord: '#ea580c' }); t.position.set(0, 3.55, d / 2 + .58); g.add(t);
  const o = [[0, -d / 2, w + .4, 1], [-w / 2, 0, 1, d + .4], [w / 2, 0, 1, d + .4], [-w / 4 - .9, d / 2, w / 2 - 1.4, 1.1], [w / 4 + .9, d / 2, w / 2 - 1.4, 1.1], [0, 0, 3.8, 3.8]];
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) o.push([sx * w / 2, sz * d / 2, 2.8, 2.8]);
  for (const [x, z] of [[-6, -3], [6, -3], [-6, 3], [6, 3]]) o.push([x, z, 1, 1]);
  return { g, obst: o };
}
/* ── un étal du souk (l'auvent à rayures, et ce qu'on y vend) ── */
function etal(couleurs, marchandise, k) {
  const [c1, c2] = couleurs, p = [];
  for (const [x, z] of [[-1.3, -.9], [1.3, -.9], [-1.3, .9], [1.3, .9]]) p.push(B('#7c4a22', [x, 1.15, z], [.12, 2.3, .12]));
  for (let i = 0; i < 6; i++) p.push(B(i % 2 ? c1 : c2, [-1.25 + i * .5, 2.42, .1], [.5, .07, 2.3], [.22, 0, 0]));
  p.push(B('#a0764a', [0, .85, -.3], [2.6, .12, 1.1]), B('#8a5a3c', [0, .4, -.3], [2.5, .8, 1]));
  if (marchandise === 'epices') ['#ea580c', '#dc2626', '#facc15', '#a16207', '#16a34a'].forEach((c, i) => p.push(CO(c, [-1 + i * .5, 1.08, -.3], [.2, .3, .2], [0, 0, 0], 10), CY('#d6d3d1', [-1 + i * .5, .95, -.3], [.24, .08, .24])));
  if (marchandise === 'poteries') [0, 1, 2, 3].forEach(i => p.push(CY(['#b45309', '#0f766e', '#1d4ed8', '#be123c'][i], [-.9 + i * .6, 1, -.3], [.27, .07, .27], [0, 0, 0], 12), CO(['#c2410c', '#14b8a6', '#3b82f6', '#e11d48'][i], [-.9 + i * .6, 1.25, -.3], [.24, .38, .24], [0, 0, 0], 12)));
  if (marchandise === 'tapis') ['#b91c1c', '#1d4ed8', '#047857'].forEach((c, i) => p.push(B(c, [-.9 + i * .9, 1.6, -.95], [.75, 1.4, .04]), B('#facc15', [-.9 + i * .9, 1.6, -.93], [.4, .9, .02]), B(c, [-.9 + i * .9, 1, -.3], [.7, .06, .5])));
  if (marchandise === 'lanternes') [0, 1, 2].forEach(i => p.push(CY('#a16207', [-.8 + i * .8, 2.05, .3], [.01, .3, .01])));
  if (marchandise === 'fruits') ['#fb923c', '#facc15', '#84cc16', '#b45309'].forEach((c, i) => { for (let j = 0; j < 4; j++) p.push(SP(c, [-1 + i * .6 + (j % 2) * .15, 1.0 + Math.floor(j / 2) * .12, -.4 + (j % 2) * .15], .1)); });
  const g = construire(p, [], .025);
  return { g, obst: [[0, -.3, 2.8, 1.3]], k };
}
/* une lanterne marocaine sur son poteau (elle s'allume pour la quête) */
function lanterne() {
  const g = construire([CY('#57534e', [0, 1.2, 0], [.06, 2.4, .06]), B('#57534e', [.25, 2.35, 0], [.5, .05, .05]), CO('#a16207', [.5, 2.25, 0], [.16, .14, .16], [0, 0, 0], 6)], [], .02);
  const verre = new THREE.Mesh(new THREE.OctahedronGeometry(.2, 0), new THREE.MeshToonMaterial({ color: '#fde68a', emissive: '#f59e0b', emissiveIntensity: 0 }));
  verre.scale.set(1, 1.3, 1); verre.position.set(.5, 1.95, 0); g.add(verre);
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: texRonde(), color: '#fbbf24', transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 }));
  halo.scale.setScalar(2.4); halo.position.copy(verre.position); g.add(halo);
  let allumee = false;
  return { g, obst: [[0, 0, .5, .5]], porte: [0, 1.1], allumer: v => { allumee = v; }, maj: (dt, t, nuit) => { const k = allumee ? .75 + Math.sin(t * 6) * .08 : nuit * .25; verre.material.emissiveIntensity = k * 2; halo.material.opacity = k * .8; } };
}
function tente() {
  const p = [CO('#a16207', [0, 1.3, 0], [3.2, 2.6, 2.6], [0, 0, 0], 6), CO('#fef3c7', [0, 1.35, 0], [3.0, 2.4, 2.45], [0, .5, 0], 6), CY('#7c4a22', [0, 1.5, 0], [.06, 3, .06]),
    B('#7f1d1d', [0, .45, 2.1], [1.3, .9, .1]), B('#b91c1c', [-3, .03, 1], [1.8, .04, 1.2], [0, .3, 0]), B('#facc15', [-3, .05, 1], [1, .03, .6], [0, .3, 0])];
  return { g: construire(p, [], .03), obst: [[0, 0, 5, 4.4]] };
}
function cadran() {
  const p = [CY('#d6d3d1', [0, .35, 0], [1.1, .7, 1.1], [0, 0, 0], 20), CY('#f8fafc', [0, .72, 0], [1.05, .05, 1.05], [0, 0, 0], 20)];
  for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2; p.push(B(k % 3 ? '#a8a29e' : '#1d4ed8', [Math.cos(a) * .85, .76, Math.sin(a) * .85], [.06, .03, .18], [0, -a, 0])); }
  p.push(SP('#facc15', [0, .78, 0], .1));
  const g = construire(p, [], .025);
  const aiguille = construire([B('#1e3a8a', [0, .55, 0], [.05, 1.1, .3], [0, 0, 0]), SP('#6366f1', [0, 1.1, .12], .1)], [], .02);
  aiguille.position.y = .7; aiguille.rotation.x = -.6; g.add(aiguille);
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: texRonde(), color: '#a5b4fc', transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: .4 }));
  s.scale.setScalar(2.2); s.position.y = 1.3; g.add(s);
  let tour = 0;
  return { g, obst: [[0, 0, 2.2, 2.2]], porte: [0, 1.6], anim: () => { tour = 2; }, maj: (dt, t) => { tour = Math.max(0, tour - dt); aiguille.rotation.y += dt * (tour > 0 ? 9 : .3); s.material.opacity = .3 + Math.sin(t * 2) * .15 + tour * .3; } };
}

export default {
  ile: { a: 46, b: 40, graine: 3.1, relief },
  sol: { couleur, plage: '#f6e3b0', eau: ['#4fd1c5', '#0e7490'] },
  depart: [21, 25.5], ballon: [28.5, 20.5], zephyr: [24.6, 23.4, .6], guide: [-15, 4.2, .2],
  teinte: { haut: '#7cc8f0', bas: '#ffe2b0', k: .35 }, brume: [60, 170],
  zones: { dunes: [[-30, 18, 7], [-32, -12, 6], [6, 26, 5], [-12, 25, 6], [34, -14, 5]], oasis: [[18, -2, 7]], souk: [[-15, 6, 5]] },
  cachettes: [[-36, -16], [-38, 10], [-24, -28], [30, -22], [36, 12], [10, -32], [-8, 30], [30, 26], [-28, 28], [12, 20], [38, -6], [-20, -30]],
  quete: { fragmentCarte1: [-34, 20], fragmentCarte2: [24, -28], fragmentCarte3: [20, 22] },
  lampes: [[13, 19], [6.5, 14.5], [-1, 8.6], [3.4, -2], [2.4, -11]],
  lieux: [
    { nom: 'La montgolfière', e: '🎈', x: 28.5, z: 20.5 }, { nom: 'Le souk de Leïla', e: '🏮', x: -15, z: 6 }, { nom: 'Le ksar', e: '🏰', x: 0, z: -21 },
    { nom: 'L’oasis', e: '🌴', x: 18, z: -2 }, { nom: 'La tente berbère', e: '⛺', x: 26, z: 7 }, { nom: 'Le cadran magique', e: '🌙', x: 4, z: 7 }, { nom: 'Les grandes dunes', e: '🏜️', x: -30, z: 18 }],
  construire(ctx) {
    const { placer, grille, ajouterInteractif, reserver, sol } = ctx;
    placer(ksar(), KSAR.x, KSAR.z, 0, 0);
    /* le souk : deux rangées d'étals le long de l'allée */
    const M = [[['#dc2626', '#fef3c7'], 'epices'], [['#1d4ed8', '#f8fafc'], 'poteries'], [['#16a34a', '#facc15'], 'tapis'], [['#7c3aed', '#fef3c7'], 'fruits'], [['#ea580c', '#fef3c7'], 'lanternes'], [['#0f766e', '#f8fafc'], 'tapis']];
    M.forEach(([c, m], i) => { const x = -23 + (i % 3) * 7, nord = i < 3; placer(etal(c, m, i), x, nord ? 2.4 : 9.8, nord ? 0 : Math.PI); });
    const lant = LANTERNES.map(([x, z], i) => {
      const L = placer(lanterne(), x, z, 0, 0);
      ajouterInteractif({ id: 'gadget-lanterne' + (i + 1), e: '🏮', texte: 'La lanterne', x: L.porteMonde[0], z: L.porteMonde[1], cible: L.g, gadget: 'lanterne' + (i + 1) });
      return L;
    });
    placer(panneau('🏮 Le souk', 2, { fond: '#fff7ed', encre: '#9a3412', bord: '#ea580c' }), -4.6, 8.6);
    /* l'oasis */
    sol.planEau(OASIS[0], OASIS[1], (OASIS[2] - .1) * 2, (OASIS[2] - .1) * 2, -.42, ['#5eead4', '#0d9488'], 0, true);
    grille.boucherCercle(OASIS[0], OASIS[1], OASIS[2] - .4);
    const autourOasis = []; for (let k = 0; k < 9; k++) { const a = k / 9 * 6.28 + .3, d = OASIS[2] + 1.4 + ctx.r() * 1.4, x = OASIS[0] + Math.cos(a) * d, z = OASIS[1] + Math.sin(a) * d; if (!ctx.peutPlanter(x, z, .8)) continue; grille.boucherCercle(x, z, .5); autourOasis.push({ x, z, s: .9 + ctx.r() * .4, r: a + 3.14 + (ctx.r() - .5), y: ctx.ile.sol(x, z) }); }
    dessinerPalmiers(ctx, autourOasis);
    const ros = []; for (let k = 0; k < 36; k++) { const an = ctx.r() * 6.28, d = OASIS[2] - .1 + ctx.r() * .8, x = OASIS[0] + Math.cos(an) * d, z = OASIS[1] + Math.sin(an) * d; ros.push({ x, z, s: .7 + ctx.r() * .5, r: ctx.r() * 6, y: ctx.ile.sol(x, z) }); }
    dessinerRoseaux(ctx, ros);
    dessinerHerbes(ctx, autour(ctx, OASIS[0], OASIS[1], OASIS[2] + 4, 160, { test: (x, z) => Math.hypot(x - OASIS[0], z - OASIS[1]) > OASIS[2] + .3 }), '#84a33b');
    reserver(OASIS[0], OASIS[1], OASIS[2] + 3);
    placer(tente(), 26, 7, -.5);
    const c = placer(cadran(), 4, 7);
    ajouterInteractif({ id: 'gadget-cadran', e: '🌙', texte: 'Le cadran magique', x: c.porteMonde[0], z: c.porteMonde[1], cible: c.g, gadget: 'cadran' });
    /* le désert : quelques palmiers, des buissons secs, des rochers de grès */
    const surChemin = (x, z, m = 1.4) => CHEMINS.some(([x1, z1, x2, z2, w]) => distSegment(x, z, x1, z1, x2, z2) < w / 2 + m);
    const f = ctx.ile.forme;
    dessinerPalmiers(ctx, semer(ctx, 22, { rayon: 1.4, ecart: 3, bloque: .5, taille: [.85, 1.25], test: (x, z) => f(x, z) < .85 && !surChemin(x, z, 2) }));
    dessinerBuissons(ctx, semer(ctx, 40, { rayon: .8, ecart: 2, bloque: .4, taille: [.4, .75], test: (x, z) => !surChemin(x, z) }), ['#9aa05a', '#a3a35f', '#8c8c4f']);
    dessinerRochers(ctx, semer(ctx, 34, { rayon: .9, bloque: .5, taille: [.4, 1.1], test: (x, z) => !surChemin(x, z) }), '#d6a36a');
    dessinerHerbes(ctx, semer(ctx, 200, { rayon: .15, taille: [.5, 1], test: (x, z) => !surChemin(x, z, .2) }), '#b5a14f');
    return { gadgets: { cadran: c, ...Object.fromEntries(lant.map((L, i) => ['lanterne' + (i + 1), L])) }, lanternes: lant };
  }
};
