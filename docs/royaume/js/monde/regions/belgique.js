/* ══════════ RÉGION 3 : LA BELGIQUE ══════════
   Des canaux (avec leurs ponts de pierre et leurs barques), la Grand-Place pavée et ses maisons à pignons
   à gradins, le beffroi et son horloge, l'échoppe de gaufres de Monsieur Waffel, la baraque à frites,
   un champ de tulipes, l'Atomium, et la bouteille à nuages qui fait pleuvoir. */
import * as THREE from 'three';
import { B, CY, CO, SP, TO, construire, fenetre, pancarte, panneau } from '../fabrique.js';
import { toon, texRonde } from '../../moteur/materiaux.js';
import { cylindre, sphere, boite } from '../../moteur/formes.js';
import { instances } from '../ile.js';
import { semer, autour, dessinerFeuillus, dessinerPins, dessinerBuissons, dessinerFleurs, dessinerHerbes } from '../nature.js';
import { distSegment } from '../decor.js';

const lisse = x => { x = Math.min(1, Math.max(0, x)); return x * x * (3 - 2 * x); };
const CANAUX = [[-34, 12, 34, 12, 2], [-18, -30, -18, 12, 1.8]];
const PONTS = [[-4, 12, 2.8, 6.6], [18, 12, 2.8, 6.6], [-18, -6, 6.4, 2.8]];
const CHEMINS = [[-4, 29.5, -4, 15.4, 2.6], [-4, 28, -9, 27, 2.2], [-4, 8.6, -4, 4, 2.6], [12, -9, 22, -15, 2.2], [-9, -6, -14.8, -6, 2.2], [-21.2, -6, -30, -10, 2], [13, 3, 18, 8.6, 2], [18, 15.4, 18, 23, 2], [-4, 18, -26, 22, 1.8]];
const PLACE = { x0: -9, x1: 13, z0: -10, z1: 5 };
const TULIPES = [-32, -12, 4.5];
const distCanal = (x, z) => Math.min(...CANAUX.map(([x1, z1, x2, z2, hw]) => distSegment(x, z, x1, z1, x2, z2) - hw));
const surPont = (x, z) => PONTS.some(([px, pz, w, d]) => Math.abs(x - px) < w / 2 && Math.abs(z - pz) < d / 2);

function relief(x, z) {
  if (surPont(x, z)) return 0;
  const d = distCanal(x, z);
  return d < .5 ? -1.1 * (1 - lisse((d + .35) / .85)) : 0;
}
const _c = new THREE.Color(), H1 = new THREE.Color('#86c46a'), H2 = new THREE.Color('#74b35d'), P1 = new THREE.Color('#a8a29e'), P2 = new THREE.Color('#bcb5ab'), P3 = new THREE.Color('#8f8a84'),
  QUAI = new THREE.Color('#9ca3af'), FOND = new THREE.Color('#57534e'), CHEMIN = new THREE.Color('#b9b2a7'), TERRE = new THREE.Color('#7c5a3a');
function couleur(x, z, f, h) {
  const b = Math.sin(x * .19 + Math.sin(z * .15) * 2) * Math.cos(z * .2 - x * .07) * .5 + .5;
  _c.copy(H1).lerp(H2, b);
  let dc = 9; for (const [x1, z1, x2, z2, w] of CHEMINS) dc = Math.min(dc, distSegment(x, z, x1, z1, x2, z2) - w / 2);
  if (dc < .3) _c.lerp(CHEMIN, lisse((.3 - dc) / .6));
  if (x > PLACE.x0 && x < PLACE.x1 && z > PLACE.z0 && z < PLACE.z1) {
    const q = (Math.floor(x * 1.6) + Math.floor(z * 1.6)) & 1, bord = Math.min(x - PLACE.x0, PLACE.x1 - x, z - PLACE.z0, PLACE.z1 - z);
    _c.copy(bord < .6 ? P3 : q ? P1 : P2);
    if (Math.hypot(x - 2, z + 2.5) < 3 && Math.hypot(x - 2, z + 2.5) > 2.4) _c.copy(P3);
  }
  if (Math.abs(x - TULIPES[0]) < TULIPES[2] && Math.abs(z - TULIPES[1]) < TULIPES[2]) _c.copy(TERRE);
  const d = distCanal(x, z);
  if (d < .6 && !surPont(x, z)) _c.copy(d < -.2 ? FOND : QUAI);
  return _c;
}

/* ── une maison à pignon à gradins ── */
function maisonPignon(couleur, w = 3.2, d = 4, h = 5, accent = '#f8fafc') {
  const p = [B(couleur, [0, h / 2, 0], [w, h, d])], f = [];
  for (let k = 0; k < 4; k++) { const ww = w * (1 - k * .21), hh = .72; p.push(B(couleur, [0, h + hh * k + hh / 2, 0], [ww, hh, d]), B(accent, [0, h + hh * (k + 1) + .04, 0], [ww + .08, .1, d + .08])); }
  p.push(B(accent, [0, h + .05, 0], [w + .1, .14, d + .1]), B(accent, [0, 2.2, d / 2 + .02], [w + .04, .1, .06]));
  for (const y of [3.3, h + .9]) for (const s of [-1, 1]) if (y < h || s < 0) fenetre(p, f, y < h ? s * w * .24 : 0, y, d / 2 + .02, .62, .9, accent);
  p.push(B('#7c2d12', [0, .9, d / 2 + .03], [.85, 1.8, .06]), B(accent, [0, 1.85, d / 2 + .05], [1.05, .12, .06]), SP('#facc15', [.25, .9, d / 2 + .08], .04));
  return { g: construire(p, f, .03), obst: [[0, 0, w + .2, d + .2]] };
}
function beffroi() {
  const p = [], f = [], BR = '#b45309', CL = '#fde68a';
  p.push(B(BR, [0, 4.5, 0], [4.2, 9, 4.2]), B(CL, [0, 9.05, 0], [4.5, .2, 4.5]));
  for (let k = 0; k < 5; k++) for (const s of [-1, 1]) { p.push(B(BR, [-1.8 + k * .9, 9.45, s * 2.1], [.45, .6, .3]), B(BR, [s * 2.1, 9.45, -1.8 + k * .9], [.3, .6, .45])); }
  p.push(B('#c2410c', [0, 10.8, 0], [3.2, 3.2, 3.2]), { g: cylindre(1, 1, 1, 8), c: '#e7e5e4', p: [0, 13.4, 0], s: [1.35, 2, 1.35] }, CO('#334155', [0, 16, 0], [1.5, 3.2, 1.5], [0, 0, 0], 8), SP('#facc15', [0, 17.7, 0], .22), B('#facc15', [.35, 18.1, 0], [.7, .25, .04]));
  for (const s of [-1, 1]) for (const y of [3, 6]) fenetre(p, f, s * .9, y, 2.12, .5, 1.3, CL);
  for (const y of [10.8]) fenetre(p, f, 0, y, 1.62, .8, 1.4, CL);
  p.push(CY('#f8fafc', [0, 7.6, 2.13], [1.05, .08, 1.05], [Math.PI / 2, 0, 0], 28), TO('#1f2937', [0, 7.6, 2.18], [1.05, 1.05, 1.05], [0, 0, 0], .06),
    B('#1f2937', [0, 7.9, 2.2], [.08, .65, .04]), B('#1f2937', [.2, 7.6, 2.2], [.45, .07, .04]));
  p.push(B('#422006', [0, 1.2, 2.13], [1.4, 2.4, .08]), TO(CL, [0, 2.4, 2.15], [.75, .75, .75], [0, 0, 0], .12, Math.PI));
  const g = construire(p, f, .035);
  return { g, obst: [[0, 0, 4.6, 4.6]] };
}
function echoppe(texte, c1, c2, marchandise) {
  const p = [B('#a0764a', [0, .55, 0], [3, 1.1, 1.4]), B('#fef3c7', [0, 1.12, 0], [3.1, .08, 1.5])];
  for (const [x, z] of [[-1.4, -.6], [1.4, -.6], [-1.4, .6], [1.4, .6]]) p.push(B('#7c4a22', [x, 1.5, z], [.1, 3, .1]));
  for (let i = 0; i < 6; i++) p.push(B(i % 2 ? c1 : c2, [-1.25 + i * .5, 3.05, .25], [.5, .08, 2.1], [.25, 0, 0]));
  if (marchandise === 'gaufres') for (let i = 0; i < 6; i++) { const x = -1 + (i % 3) * .5, z = i < 3 ? -.2 : .25; p.push(B('#d97706', [x, 1.22, z], [.4, .1, .3]), B('#b45309', [x, 1.28, z], [.3, .02, .22])); }
  if (marchandise === 'frites') for (let i = 0; i < 4; i++) { const x = -.9 + i * .6; p.push(CO('#f8fafc', [x, 1.35, 0], [.16, .45, .16], [Math.PI, 0, 0], 8)); for (let j = 0; j < 5; j++) p.push(B('#facc15', [x + (j - 2) * .04, 1.62, (j % 2) * .04], [.035, .3, .035], [0, 0, (j - 2) * .1])); }
  const g = construire(p, [], .03);
  const t = pancarte(texte, 2.4, .55, { fond: '#fffbeb', encre: '#92400e', bord: c1 }); t.position.set(0, 2.55, .78); g.add(t);
  return { g, obst: [[0, 0, 3.1, 1.6]] };
}
function pont(long, larg, axeX) {
  const p = [B('#a8a29e', [0, .12, 0], axeX ? [long, .3, larg] : [larg, .3, long])];
  for (const s of [-1, 1]) p.push(B('#d6d3d1', axeX ? [0, .5, s * (larg / 2 - .12)] : [s * (larg / 2 - .12), .5, 0], axeX ? [long, .5, .24] : [.24, .5, long]));
  return { g: construire(p, [], .03), obst: [] };
}
function barque(c) {
  const g = construire([SP(c, [0, 0, 0], [.7, .25, 1.6]), B('#a0764a', [0, .18, 0], [1, .06, 2.4]), B('#8a5a3c', [0, .25, .3], [1.1, .08, .2])], [], .025);
  return g;
}
/* l'Atomium : 9 boules sur les sommets et au centre d'un cube posé sur une pointe */
function atomium() {
  const S = 2.4, base = 1.5, q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(1, 1, 1).normalize(), new THREE.Vector3(0, 1, 0));
  const pts = [], p = [];
  for (const x of [-1, 1]) for (const y of [-1, 1]) for (const z of [-1, 1]) pts.push(new THREE.Vector3(x, y, z).multiplyScalar(S).applyQuaternion(q));
  const haut = S * Math.sqrt(3) + base + .9, centre = new THREE.Vector3(0, haut, 0);
  pts.forEach(v => v.y += haut);
  const tube = (a, b, r = .17) => {
    const d = new THREE.Vector3().subVectors(b, a), L = d.length(), m = a.clone().add(b).multiplyScalar(.5);
    const e = new THREE.Euler().setFromQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()));
    p.push({ g: cylindre(1, 1, 1, 10), c: '#d1d5db', p: [m.x, m.y, m.z], r: [e.x, e.y, e.z], s: [r, L, r] });
  };
  for (let i = 0; i < 8; i++) for (let j = i + 1; j < 8; j++) { const n = (i ^ j); if (n === 1 || n === 2 || n === 4) tube(pts[i], pts[j]); }
  for (const v of pts) tube(v, centre, .15);
  const bas = pts.reduce((a, v) => (v.y < a.y ? v : a), pts[0]);
  for (let k = 0; k < 3; k++) { const a = k / 3 * Math.PI * 2; tube(bas, new THREE.Vector3(Math.cos(a) * 2.4, 0, Math.sin(a) * 2.4), .22); }
  for (const v of [...pts, centre]) {
    p.push({ g: sphere(22, 16), c: '#e5e7eb', p: [v.x, v.y, v.z], s: .9 });
    for (let k = 0; k < 4; k++) p.push({ g: sphere(8, 6), c: '#1f2937', p: [v.x + Math.cos(k * 1.57) * .84, v.y + .15, v.z + Math.sin(k * 1.57) * .84], s: .13 });
  }
  const g = construire(p, [], .03);
  const t = pancarte('⚛️ L’Atomium', 2.4, .55, { fond: '#f1f5f9', encre: '#1e3a8a', bord: '#94a3b8' }); t.position.set(0, 1.1, 3.4); g.add(t);
  return { g, obst: [[0, 0, 5.4, 5.4]] };
}
/* la bouteille à nuages : on la débouche, et il pleut ! */
function bouteille() {
  const p = [B('#a0764a', [0, .55, 0], [1.6, .35, 1.1]), TO('#57534e', [-.55, .3, .6], [.3, .3, .3], [0, 0, 0], .25), TO('#57534e', [.55, .3, .6], [.3, .3, .3], [0, 0, 0], .25),
    TO('#57534e', [-.55, .3, -.6], [.3, .3, .3], [0, 0, 0], .25), TO('#57534e', [.55, .3, -.6], [.3, .3, .3], [0, 0, 0], .25), B('#8a5a3c', [1.1, .7, 0], [.8, .07, .07])];
  const g = construire(p, [], .025);
  const verre = new THREE.Mesh(new THREE.CylinderGeometry(.5, .55, 1.3, 20), new THREE.MeshToonMaterial({ color: '#bae6fd', transparent: true, opacity: .38, depthWrite: false }));
  verre.position.y = 1.4; g.add(verre);
  const col = new THREE.Mesh(new THREE.CylinderGeometry(.18, .38, .4, 16), verre.material); col.position.y = 2.25; g.add(col);
  g.add(construire([CY('#b45309', [0, 2.55, 0], [.17, .25, .17])], [], .02));
  const nuage = new THREE.Group(); nuage.position.y = 1.45; g.add(nuage);
  nuage.add(construire([SP('#e5e7eb', [0, 0, 0], .28), SP('#d1d5db', [.2, -.05, .05], .2), SP('#f3f4f6', [-.18, .02, -.04], .22)], [], .015));
  let pluie = 0;
  return { g, obst: [[0, 0, 1.8, 1.4]], porte: [0, 1.3], anim: () => { pluie = 2.5; }, maj: (dt, t) => { pluie = Math.max(0, pluie - dt); nuage.position.y = 1.45 + Math.sin(t * 1.5) * .1 + pluie * .2; nuage.rotation.y = t * .5; nuage.scale.setScalar(1 + pluie * .35); } };
}

export default {
  ile: { a: 46, b: 40, graine: 5.2, relief },
  sol: { couleur, eau: ['#7cc9e8', '#2a7fb0'] },
  depart: [-4, 28.5], ballon: [-12, 27], zephyr: [-7.8, 28.6, .5], guide: [6.5, 4.4, .1],
  teinte: { haut: '#8fb8e0', bas: '#dbe7f3', k: .2 }, brume: [55, 160],
  zones: { place: [[2, -2, 5]], canaux: [[6, 8.6, 4], [-24, 4, 3.5], [24, 16.5, 4], [-14, -18, 3.5]], beffroi: [[2, -9, 2.5]], atomium: [[20, -12, 4]] },
  cachettes: [[-36, -18], [-34, 6], [-26, 25], [-20, 30], [10, 26], [30, 26], [37, 4], [36, -14], [10, -27], [-8, -28], [28, -30], [-28, -25]],
  quete: { bouleArgent1: [-31, -21], bouleArgent2: [34, 21], bouleArgent3: [-23, 18.5] },
  lampes: [[-1.6, 19], [-1.6, 8.4], [12, 4.6], [-8, -9.6], [15, -11], [-15, -8.4]],
  lieux: [
    { nom: 'La montgolfière', e: '🎈', x: -12, z: 27 }, { nom: 'La Grand-Place', e: '🏛️', x: 2, z: -2 }, { nom: 'Le beffroi', e: '🔔', x: 2, z: -13 },
    { nom: 'Les gaufres de Monsieur Waffel', e: '🧇', x: 6.5, z: 2 }, { nom: 'L’Atomium', e: '⚛️', x: 25, z: -19 }, { nom: 'Les tulipes', e: '🌷', x: -32, z: -12 },
    { nom: 'Les canaux', e: '🚣', x: 24, z: 12 }],
  construire(ctx) {
    const { placer, grille, ajouterInteractif, reserver, sol, racine } = ctx;
    /* les canaux : l'eau, les obstacles (sauf les ponts), les bords de pierre, les ponts, les barques */
    grille.boucherSi((x, z) => distCanal(x, z) < .4 && !surPont(x, z));
    sol.planEau(0, 12, 72, 4.2, -.62, ['#7cc9e8', '#3b82c4']);
    sol.planEau(-18, -9, 3.8, 42.4, -.62, ['#7cc9e8', '#3b82c4']);
    const bords = [];
    for (const [x1, z1, x2, z2, hw] of CANAUX) {
      const L = Math.hypot(x2 - x1, z2 - z1), n = Math.floor(L / 1.6), horiz = z1 === z2;
      for (let k = 0; k <= n; k++) for (const s of [-1, 1]) {
        const t = k / n, x = x1 + (x2 - x1) * t + (horiz ? 0 : s * (hw + .2)), z = z1 + (z2 - z1) * t + (horiz ? s * (hw + .2) : 0);
        if (surPont(x, z) || distCanal(x, z) < 0 || ctx.ile.forme(x, z) > .92) continue;
        bords.push({ p: [x, .1, z], s: horiz ? [1.5, .22, .32] : [.32, .22, 1.5] });
        if (k % 4 === 0) bords.push({ p: [x, .35, z], s: [.12, .5, .12], c: '#1f2937' });
      }
    }
    racine.add(instances(boite(1, 1, 1), toon('#ffffff'), bords.map(b => ({ ...b, c: b.c || '#a8a29e' })), true, .03));
    placer(pont(2.8, 6.6, false), -4, 12, 0, 0); placer(pont(2.8, 6.6, false), 18, 12, 0, 0); placer(pont(6.4, 2.8, true), -18, -6, 0, 0);
    const barques = [[8, 12, '#2563eb'], [-26, 12.3, '#dc2626'], [-18, -20, '#16a34a']].map(([x, z, c]) => { const b = barque(c); b.position.set(x, -.58, z); b.rotation.y = x === -18 ? 0 : Math.PI / 2; racine.add(b); return b; });
    ctx.majs.push((dt, t) => barques.forEach((b, i) => { b.position.y = -.58 + Math.sin(t * 1.3 + i) * .04; b.rotation.z = Math.sin(t * .9 + i) * .04; }));
    /* la Grand-Place : le beffroi, les maisons, les échoppes */
    placer(beffroi(), 2, -13, 0, 0);
    const COUL = ['#b45309', '#fde68a', '#9a3412', '#f8fafc', '#94a3b8', '#fdba74', '#a7f3d0', '#c2410c'];
    let ci = 0; const prochaine = () => COUL[ci++ % COUL.length];
    for (const x of [-7.5, -4.2, 7.6, 10.9]) placer(maisonPignon(prochaine(), 3.2, 4, 4.6 + (ci % 3) * .5), x, -12.5, 0, 0);
    for (const z of [-7, -3.6, -.2, 3.2]) placer(maisonPignon(prochaine(), 3.2, 4, 4.4 + (ci % 2) * .6), -11.5, z, Math.PI / 2, 0);
    for (const z of [-4.6, -1.2, 2.2]) placer(maisonPignon(prochaine(), 3.2, 4, 4.6 + (ci % 3) * .4), 15.5, z, -Math.PI / 2, 0);
    for (const x of [-30, -26.8, -23.6, 22, 25.2, 28.4]) placer(maisonPignon(prochaine(), 3.2, 3.6, 4.2 + (ci % 3) * .5), x, 7.6, 0, 0);
    placer(echoppe('🧇 Gaufres de Waffel', '#facc15', '#92400e', 'gaufres'), 6.5, 2);
    placer(echoppe('🍟 Frites', '#dc2626', '#fef3c7', 'frites'), -4.5, 1.6);
    placer(panneau('💧 La Belgique', 2.2, { fond: '#eff6ff', encre: '#1e3a8a', bord: '#3b82f6' }), -1.4, 16);
    const at = placer(atomium(), 25, -19, 0, 0);
    ajouterInteractif({ id: 'deco-atomium', e: '⚛️', texte: 'L’Atomium', x: 25, z: -15.4, cible: at.g, rayon: 2.6 });
    const bo = placer(bouteille(), -6.5, -5.5);
    ajouterInteractif({ id: 'gadget-nuage', e: '☁️', texte: 'La bouteille à nuages', x: bo.porteMonde[0], z: bo.porteMonde[1], cible: bo.g, gadget: 'nuage' });
    reserver(-6.5, -5.5, 2);
    /* le champ de tulipes */
    const tul = [];
    for (let i = 0; i < 9; i++) for (let j = 0; j < 14; j++) tul.push({ x: TULIPES[0] - 4 + i * 1, y: 0, z: TULIPES[1] - 4 + j * .6, s: .9 + ctx.r() * .3, r: 0, c: ['#ef4444', '#facc15', '#ec4899', '#f97316', '#a855f7'][i % 5] });
    dessinerFleurs(ctx, tul, undefined, .15);
    reserver(TULIPES[0], TULIPES[1], TULIPES[2] + 1.5);
    /* les arbres : des tilleuls le long des canaux, des peupliers au bord de l'île */
    const surChemin = (x, z, m = 1.4) => CHEMINS.some(([x1, z1, x2, z2, w]) => distSegment(x, z, x1, z1, x2, z2) < w / 2 + m);
    const dansPlace = (x, z, m = 1.5) => x > PLACE.x0 - m && x < PLACE.x1 + m && z > PLACE.z0 - 6 && z < PLACE.z1 + m;
    const f = ctx.ile.forme;
    dessinerFeuillus(ctx, semer(ctx, 70, { rayon: 1.5, ecart: 2.8, bloque: .6, taille: [.8, 1.2], test: (x, z) => f(x, z) < .9 && distCanal(x, z) > 1.6 && !surChemin(x, z, 2) && !dansPlace(x, z) }), ['#65a30d', '#4d7c0f', '#84cc16', '#5a9e2a']);
    dessinerPins(ctx, semer(ctx, 30, { rayon: 1, ecart: 2.2, bloque: .5, taille: [1.1, 1.5], test: (x, z) => f(x, z) > .7 && f(x, z) < .9 && !surChemin(x, z) }), ['#3f6212', '#4d7c0f', '#65a30d']);
    dessinerBuissons(ctx, semer(ctx, 40, { rayon: .9, ecart: 1.5, bloque: .45, taille: [.55, .9], test: (x, z) => distCanal(x, z) > 1 && !surChemin(x, z, 1) && !dansPlace(x, z, .5) }));
    dessinerFleurs(ctx, semer(ctx, 200, { rayon: .2, test: (x, z) => !surChemin(x, z, .3) && !dansPlace(x, z, 0) && distCanal(x, z) > .8 }));
    dessinerHerbes(ctx, semer(ctx, 450, { rayon: .15, taille: [.6, 1.2], test: (x, z) => !surChemin(x, z, .2) && !dansPlace(x, z, 0) && distCanal(x, z) > .7 }), '#5ea548');
    return { gadgets: { nuage: bo } };
  }
};
