/* ══════════ LA NATURE DES ÎLES ══════════
   semer() choisit des places libres (et bouche la grille si on ne peut pas traverser) ;
   les fonctions dessiner…() posent des centaines d'exemplaires en quelques dessins (instances). */
import * as THREE from 'three';
import { sphere, cylindre, cone } from '../moteur/formes.js';
import { toon } from '../moteur/materiaux.js';
import { instances } from './ile.js';

/* n places dans le rectangle [x0, x1] × [z0, z1] où test(x, z) est vrai ; bloque : rayon d'obstacle (0 = on traverse) */
export function semer(ctx, n, { rayon = 1, ecart = 0, test = () => true, bloque = 0, zone = null, essais = 40, taille = [1, 1] } = {}) {
  const L = [], { r, ile } = ctx, [x0, x1, z0, z1] = zone || [-ile.a, ile.a, -ile.b, ile.b];
  for (let t = 0; t < n * essais && L.length < n; t++) {
    const x = x0 + r() * (x1 - x0), z = z0 + r() * (z1 - z0);
    if (!test(x, z) || !ctx.peutPlanter(x, z, rayon)) continue;
    if (ecart && L.some(p => Math.hypot(p.x - x, p.z - z) < ecart)) continue;
    const s = taille[0] + r() * (taille[1] - taille[0]);
    if (bloque) ctx.grille.boucherCercle(x, z, bloque * s);
    L.push({ x, z, s, r: r() * 6.28, y: ile.sol(x, z) });
  }
  return L;
}
/* un rond de places autour d'un point (un champ de fleurs, un massif) */
export function autour(ctx, cx, cz, rayon, n, { test = () => true } = {}) {
  const L = [], { r, ile } = ctx;
  for (let t = 0; t < n * 6 && L.length < n; t++) {
    const a = r() * 6.28, d = Math.sqrt(r()) * rayon, x = cx + Math.cos(a) * d, z = cz + Math.sin(a) * d;
    if (ile.forme(x, z) > .9 || !test(x, z)) continue;
    L.push({ x, z, s: .7 + r() * .6, r: r() * 6.28, y: ile.sol(x, z) });
  }
  return L;
}

const V = ['#4caf50', '#43a047', '#66bb6a', '#5cb85c', '#3f9b46'];
export function dessinerFeuillus(ctx, L, palette = V, tronc = '#8a5a3c') {
  const g = new THREE.Group();
  g.add(instances(cylindre(.7, 1, 1, 9), toon(tronc), L.map(a => ({ p: [a.x, a.y + .8 * a.s, a.z], s: [.2 * a.s, 1.6 * a.s, .2 * a.s] })), true, .09));
  [[0, 1.95, 0, .95], [.5, 1.6, .2, .66], [-.45, 1.65, -.12, .7], [.08, 2.55, 0, .52]].forEach(([dx, dy, dz, k], j) =>
    g.add(instances(sphere(11, 8), toon('#ffffff'), L.map(a => ({ p: [a.x + (dx * Math.cos(a.r) - dz * Math.sin(a.r)) * a.s, a.y + dy * a.s, a.z + (dx * Math.sin(a.r) + dz * Math.cos(a.r)) * a.s], s: k * a.s, c: palette[(j + Math.floor(a.r * 3)) % palette.length] })), true, .045)));
  ctx.racine.add(g);
}
export function dessinerPins(ctx, L, palette = ['#2f855a', '#38a169', '#48bb78']) {
  const g = new THREE.Group();
  g.add(instances(cylindre(.7, 1, 1, 8), toon('#7c4a22'), L.map(a => ({ p: [a.x, a.y + .5 * a.s, a.z], s: [.16 * a.s, 1 * a.s, .16 * a.s] })), true, .09));
  [[1.4, 1.3, .9], [2.2, 1.1, .72], [2.9, .9, .52]].forEach(([y, h, rr], j) =>
    g.add(instances(cone(1, 1, 10), toon('#ffffff'), L.map(a => ({ p: [a.x, a.y + y * a.s, a.z], s: [rr * 1.25 * a.s, h * 1.3 * a.s, rr * 1.25 * a.s], r: a.r, c: palette[j % palette.length] })), true, .05)));
  ctx.racine.add(g);
}
/* le palmier : un tronc penché en anneaux, une couronne de palmes, des dattes */
export function dessinerPalmiers(ctx, L) {
  const g = new THREE.Group(), anneaux = [], palmes = [], dattes = [];
  for (const a of L) {
    const pench = .25 + (a.r % 1) * .25, dir = a.r;
    let x = a.x, z = a.z, y = a.y;
    for (let k = 0; k < 7; k++) {
      const t = k / 7, rr = (.24 - t * .08) * a.s;
      anneaux.push({ p: [x, y + .25 * a.s, z], s: [rr, .5 * a.s, rr], r: 0, rx: Math.sin(dir) * pench * t, rz: -Math.cos(dir) * pench * t, c: k % 2 ? '#a16207' : '#92400e' });
      x += Math.cos(dir) * pench * .45 * a.s * t; z += Math.sin(dir) * pench * .45 * a.s * t; y += .52 * a.s;
    }
    for (let k = 0; k < 7; k++) {
      const an = k / 7 * 6.28 + a.r;
      palmes.push({ p: [x + Math.cos(an) * .9 * a.s, y + .05, z + Math.sin(an) * .9 * a.s], s: [1.15 * a.s, .07 * a.s, .3 * a.s], r: -an, rz: -.35, c: k % 2 ? '#16a34a' : '#22c55e' });
    }
    for (let k = 0; k < 3; k++) dattes.push({ p: [x + Math.cos(k * 2.1) * .18, y - .15, z + Math.sin(k * 2.1) * .18], s: .12 * a.s, c: '#b45309' });
  }
  g.add(instances(cylindre(.8, 1, 1, 8), toon('#ffffff'), anneaux, true, .05));
  g.add(instances(sphere(10, 6), toon('#ffffff'), palmes, true, .03));
  g.add(instances(sphere(8, 6), toon('#ffffff'), dattes, false));
  ctx.racine.add(g);
}
export function dessinerBuissons(ctx, L, palette = V) {
  ctx.racine.add(instances(sphere(11, 8), toon('#ffffff'), L.map(a => ({ p: [a.x, a.y + .35 * a.s, a.z], s: [.75 * a.s, .55 * a.s, .7 * a.s], c: palette[Math.floor(a.r * 7) % palette.length] })), true, .06));
}
export function dessinerRochers(ctx, L, couleur = '#a8a29e') {
  ctx.racine.add(instances(new THREE.IcosahedronGeometry(1, 0), toon(couleur), L.map(a => ({ p: [a.x, a.y + a.s * .3, a.z], s: [a.s, a.s * .7, a.s * .85], r: a.r })), true, .06));
}
export function dessinerFleurs(ctx, L, couleurs = ['#f472b6', '#fde047', '#ffffff', '#c4b5fd', '#fb7185', '#60a5fa'], taille = .09) {
  ctx.racine.add(instances(sphere(6, 4), toon('#ffffff'), L.map(a => ({ p: [a.x, a.y + .13, a.z], s: taille * a.s, c: a.c || couleurs[Math.floor(a.r * 10) % couleurs.length] })), false, 0, false));
  ctx.racine.add(instances(cylindre(1, 1, 1, 4), toon('#4d9b3a'), L.map(a => ({ p: [a.x, a.y + .06, a.z], s: [.012, .12, .012] })), false, 0, false));
}
export function dessinerHerbes(ctx, L, couleur = '#5fb34a') {
  ctx.racine.add(instances(cone(1, 1, 5), toon(couleur), L.map(a => ({ p: [a.x, a.y + .12 * a.s, a.z], s: [.08 * a.s, .26 * a.s, .08 * a.s], r: a.r })), false, 0, false));
}
/* les trèfles : trois petites feuilles rondes */
export function dessinerTrefles(ctx, L) {
  const f = [];
  for (const a of L) for (let k = 0; k < 3; k++) { const an = a.r + k * 2.09; f.push({ p: [a.x + Math.cos(an) * .09 * a.s, a.y + .09, a.z + Math.sin(an) * .09 * a.s], s: [.1 * a.s, .03, .1 * a.s], c: k ? '#15803d' : '#16a34a' }); }
  ctx.racine.add(instances(sphere(8, 5), toon('#ffffff'), f, false, 0, false));
}
export function dessinerRoseaux(ctx, L) {
  ctx.racine.add(instances(cylindre(.5, 1, 1, 5), toon('#65a30d'), L.map(a => ({ p: [a.x, a.y + .45 * a.s, a.z], s: [.03, .9 * a.s, .03], rx: (a.r % 1 - .5) * .3 })), false, 0, false));
  ctx.racine.add(instances(cylindre(1, 1, 1, 6), toon('#78350f'), L.filter((_, i) => i % 2).map(a => ({ p: [a.x, a.y + .85 * a.s, a.z], s: [.05, .2 * a.s, .05] })), false, 0, false));
}
