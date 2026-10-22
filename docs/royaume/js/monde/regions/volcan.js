/* ══════════ RÉGION 6 : LE VOLCAN ══════════
   Au nord, la grande montagne qui fume et sa lueur rouge ; à ses pieds, le cratère où bout la lave.
   Une coulée de lave descend vers l'est (on ne marche pas dedans !), des colonnes de basalte, des champs de cendre,
   des sources chaudes, et la forge de Madame Lava. Le sablier de lave fait tomber la nuit. */
import * as THREE from 'three';
import { B, T, CY, CO, SP, TO, construire, pancarte, panneau } from '../fabrique.js';
import { semer, autour, dessinerRochers, dessinerBuissons, dessinerHerbes, dessinerColonnes, dessinerPalmiers } from '../nature.js';
import { instances } from '../ile.js';
import { sphere, cone } from '../../moteur/formes.js';
import { toon, texRonde } from '../../moteur/materiaux.js';
import { distSegment } from '../decor.js';

const lisse = x => { x = Math.min(1, Math.max(0, x)); return x * x * (3 - 2 * x); };
const CHEMINS = [[0, 28, 0, 8, 2.4], [0, 28, -7, 25, 2.2], [0, 8, -16, 4, 2.2], [0, 8, 0, -14, 2.4], [0, 8, 16, 10, 2], [-16, 4, -28, -6, 1.8]];
const PLATS = [[-7, 25, 6], [0, 8, 6], [-16, 4, 6], [0, -17, 7]];
const COULEE = [[6, -22], [12, -14], [20, -8], [28, -2], [40, 2]];
const CRATERE = [0, -19, 5];
const SOURCES = [[-22, 16, 2.4], [-28, 10, 1.8]];
const surCoulee = (x, z, m = 0) => { let d = 99; for (let k = 0; k < COULEE.length - 1; k++) d = Math.min(d, distSegment(x, z, ...COULEE[k], ...COULEE[k + 1])); return d < 1.6 + m; };
const roches = (x, z) => .7 * Math.sin(x * .11 + .2) * Math.cos(z * .1 - .7) + .45 * Math.sin(x * .07 - z * .05) + .4;
function relief(x, z) {
  let h = Math.max(0, roches(x, z)) * 1.2, k = 1;
  for (const [x1, z1, x2, z2, w] of CHEMINS) k = Math.min(k, lisse((distSegment(x, z, x1, z1, x2, z2) - w / 2) / 3));
  for (const [px, pz, pr] of PLATS) k = Math.min(k, lisse((Math.hypot(x - px, z - pz) - pr) / 4));
  h *= k;
  /* la pente du volcan, au nord */
  if (z < -10) h += lisse((-10 - z) / 18) * 3.5 * (1 - lisse((Math.abs(x) - 14) / 10));
  const dc = Math.hypot(x - CRATERE[0], z - CRATERE[1]); if (dc < CRATERE[2] + 4) h = h * lisse((dc - CRATERE[2]) / 4) + (1 - lisse((dc - CRATERE[2]) / 4)) * .6;
  let dl = 99; for (let i = 0; i < COULEE.length - 1; i++) dl = Math.min(dl, distSegment(x, z, ...COULEE[i], ...COULEE[i + 1]));
  if (dl < 3) h = h * lisse((dl - 1.4) / 1.6) - .3 * (1 - lisse((dl - .4) / 1.2));
  return h;
}
const _c = new THREE.Color(), R1 = new THREE.Color('#57534e'), R2 = new THREE.Color('#44403c'), R3 = new THREE.Color('#6b6560'), CENDRE = new THREE.Color('#a8a29e'), CHEMIN = new THREE.Color('#d6b98c'),
  BRAISE = new THREE.Color('#9a3412'), HERBE = new THREE.Color('#65743a');
function couleur(x, z, f, h) {
  const bruit = Math.sin(x * .25 + Math.sin(z * .14) * 2) * Math.cos(z * .2 - x * .07) * .5 + .5;
  _c.copy(R1).lerp(bruit > .6 ? R3 : R2, Math.abs(bruit - .5) * 1.4);
  if (z > 6 && f < .8) _c.lerp(HERBE, .35 * lisse((z - 6) / 10));
  if (x < -6 && z < 4 && z > -16) _c.lerp(CENDRE, .55);
  if (surCoulee(x, z, 1.4)) _c.lerp(BRAISE, .6);
  let dc = 9; for (const [x1, z1, x2, z2, w] of CHEMINS) dc = Math.min(dc, distSegment(x, z, x1, z1, x2, z2) - w / 2);
  if (dc < .4) _c.lerp(CHEMIN, lisse((.4 - dc) / .8));
  return _c;
}

/* ── la grande montagne (un décor : on n'y monte pas) avec sa fumée et sa lueur ── */
function montagne() {
  const p = [CO('#44403c', [0, 7, 0], [15, 14, 11], [0, 0, 0], 18), CO('#57534e', [-9, 4, 2], [8, 8, 6], [0, .4, 0], 14), CO('#57534e', [10, 4.5, 1], [8, 9, 6], [0, -.3, 0], 14)];
  for (let k = 0; k < 5; k++) p.push(B('#ea580c', [-1 + k * .5, 9 - k * 1.4, 5.2 - k * .2], [.6, 1.6, .2], [-.6, 0, (k % 2 - .5) * .3]));
  p.push(CY('#1c1917', [0, 14.1, 0], [2.6, .3, 2], [0, 0, 0], 16));
  const g = construire(p, [], .05);
  const lueur = new THREE.Sprite(new THREE.SpriteMaterial({ map: texRonde(), color: '#fb923c', transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: .8 }));
  lueur.scale.set(9, 6, 1); lueur.position.set(0, 15, 0); g.add(lueur);
  /* la fumée : des boules grises qui montent */
  const fumees = [];
  for (let k = 0; k < 7; k++) { const m = new THREE.Mesh(sphere(10, 8), new THREE.MeshToonMaterial({ color: '#a8a29e', transparent: true, opacity: .55 })); m.userData.t = k / 7; g.add(m); fumees.push(m); }
  return {
    g, obst: [[0, 0, 32, 12]],
    maj: (dt, t, nuit) => {
      lueur.material.opacity = .45 + nuit * .4 + Math.sin(t * 2) * .1;
      for (const m of fumees) { m.userData.t = (m.userData.t + dt * .06) % 1; const u = m.userData.t; m.position.set(Math.sin(u * 5) * 1.5 + u * 3, 15 + u * 12, Math.cos(u * 4) * 1.2); m.scale.setScalar(1.2 + u * 3); m.material.opacity = .55 * (1 - u); }
    }
  };
}
/* ── la forge de Madame Lava ── */
function forge() {
  const p = [B('#78716c', [0, 1.6, 0], [6, 3.2, 4.6]), T('#7f1d1d', [0, 3.2, 0], [5, 1.6, 6.6], [0, Math.PI / 2, 0]), B('#292524', [0, 1.1, 2.32], [1.4, 2.2, .12])];
  p.push(CY('#57534e', [2.2, 4.4, -1], [.5, 2.6, .5], [0, 0, 0], 10), B('#1c1917', [-2.4, .5, 3.1], [1.2, 1, .9]), CY('#292524', [-2.4, 1.15, 3.1], [.3, .3, .3], [0, 0, 0], 10));
  p.push(B('#57534e', [2.4, .45, 3.2], [1, .9, .7]), B('#1c1917', [2.4, .95, 3.2], [1.3, .12, .4]));
  const f = [B('#fdba74', [-1.8, 1.8, 2.32], [.9, .8, .06]), B('#fdba74', [1.8, 1.8, 2.32], [.9, .8, .06])];
  const g = construire(p, f);
  const t = pancarte('🔨 La forge de Madame Lava', 3.6, .55, { fond: '#fff7ed', encre: '#7c2d12', bord: '#ea580c' }); t.position.set(0, 2.85, 2.35); g.add(t);
  const feu = new THREE.Sprite(new THREE.SpriteMaterial({ map: texRonde(), color: '#f97316', transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: .8 }));
  feu.scale.setScalar(1.6); feu.position.set(-2.4, 1.6, 3.1); g.add(feu);
  return { g, obst: [[0, 0, 6.2, 4.8], [-2.4, 3.1, 1.3, 1], [2.4, 3.2, 1.4, .8]], porte: [0, 3.4], maj: (dt, t) => { feu.material.opacity = .6 + Math.sin(t * 9) * .2 + Math.sin(t * 13) * .1; } };
}
/* le sablier de lave : on le retourne… et la nuit tombe sur le Volcan */
function sablierLave() {
  const corps = new THREE.Group();
  corps.add(construire([CO('#fdba74', [0, .32, 0], [.3, .55, .3], [Math.PI, 0, 0], 12), CO('#fdba74', [0, -.32, 0], [.3, .55, .3], [0, 0, 0], 12), CY('#7c2d12', [0, .62, 0], [.38, .08, .38]), CY('#7c2d12', [0, -.62, 0], [.38, .08, .38]),
    SP('#ef4444', [0, -.4, 0], [.2, .14, .2])], [], .02));
  corps.position.y = 1.5;
  const g = new THREE.Group(); g.add(construire([B('#292524', [0, .4, 0], [.6, .8, .6])], [], .02), corps);
  let tour = 0;
  return { g, obst: [[0, 0, .9, .9]], porte: [0, 1.3], anim: () => { tour = 1.2; }, maj: (dt, t) => { if (tour > 0) { tour = Math.max(0, tour - dt); corps.rotation.z = Math.PI * (1 - tour / 1.2); } else corps.rotation.z = 0; corps.position.y = 1.5 + Math.sin(t * 2) * .04; } };
}

export default {
  ile: { a: 45, b: 40, graine: 4.1, relief },
  sol: { couleur, plage: '#57534e', fond: '#292524', eau: ['#38bdf8', '#1e3a8a'] },
  brume: [55, 150], teinte: { haut: '#fb923c', bas: '#fed7aa', k: .3 },
  depart: [0, 28], ballon: [-8.5, 26], zephyr: [-4.4, 27.8, .5], guide: [-13, 9, .3],
  zones: { cendres: [[-16, -8, 5], [-24, 0, 4]], braises: [[16, 14, 5], [-6, 16, 4], [24, 22, 4]], coulee: [[16, -6, 3.5], [30, 4, 3]], cratere: [[0, -16, 1.8]] },
  cachettes: [[-36, -8], [34, -16], [37, 10], [-38, 8], [-24, -20], [24, -24], [26, 27], [-30, 26], [-20, 24], [32, 18], [-6, 20], [10, 22]],
  quete: { pierreLave1: [-30, -4], pierreLave2: [26, 12], pierreLave3: [-8, -10], goutteFeu1: [9, -9], goutteFeu2: [-26, 18], goutteFeu3: [34, -6] },
  lampes: [[2.4, 20], [2.4, 13], [-6, 6], [6, 4], [3, -8]],
  lieux: [
    { nom: 'La montgolfière', e: '🎈', x: -8.5, z: 26 }, { nom: 'La forge de Madame Lava', e: '🔨', x: -16, z: 2 }, { nom: 'Le cratère', e: '🌋', x: 0, z: -18 },
    { nom: 'La coulée de lave', e: '🔥', x: 20, z: -8 }, { nom: 'Les sources chaudes', e: '♨️', x: -24, z: 14 }, { nom: 'Les champs de cendre', e: '🌫️', x: -18, z: -6 }],
  construire(ctx) {
    const { placer, grille, ajouterInteractif, reserver, sol, ile, racine } = ctx;
    const mont = placer(montagne(), 0, -33, 0, ile.sol(0, -30) - .4); void mont; reserver(0, -32, 14);
    placer(forge(), -16, -1); reserver(-16, 1, 5);
    /* le cratère : un anneau de roches noires et un lac de lave qui bouillonne */
    const p = [];
    for (let k = 0; k < 14; k++) { const a = k / 14 * Math.PI * 2; if (Math.abs(a - Math.PI / 2) < .45) continue; p.push(SP(k % 2 ? '#292524' : '#44403c', [Math.cos(a) * CRATERE[2], .3, Math.sin(a) * CRATERE[2]], [1.1, .7, 1])); }
    const anneau = construire(p, [], .03); anneau.position.set(CRATERE[0], ile.sol(CRATERE[0], CRATERE[1]), CRATERE[1]); racine.add(anneau);
    for (let k = 0; k < 14; k++) { const a = k / 14 * Math.PI * 2; if (Math.abs(a - Math.PI / 2) < .45) continue; grille.boucherCercle(CRATERE[0] + Math.cos(a) * CRATERE[2], CRATERE[1] + Math.sin(a) * CRATERE[2], .9); }
    const lave = sol.planEau(CRATERE[0], CRATERE[1] - 1.5, 5, 4, ile.sol(0, -20.5) + .05, ['#fb923c', '#dc2626'], 0, true); void lave;
    grille.boucherCercle(CRATERE[0], CRATERE[1] - 1.5, 2.3);
    reserver(CRATERE[0], CRATERE[1], CRATERE[2] + 2);
    /* la coulée de lave */
    for (let k = 0; k < COULEE.length - 1; k++) {
      const [x1, z1] = COULEE[k], [x2, z2] = COULEE[k + 1], L = Math.hypot(x2 - x1, z2 - z1), an = Math.atan2(z2 - z1, x2 - x1);
      sol.planEau((x1 + x2) / 2, (z1 + z2) / 2, L + 1.5, 2.6, -.2, ['#fdba74', '#ea580c'], -an);
      for (let t = 0; t <= 1; t += .02) grille.boucherCercle(x1 + (x2 - x1) * t, z1 + (z2 - z1) * t, 1.4);
    }
    /* les sources chaudes (de l'eau bleue qui fume) */
    for (const [x, z, r] of SOURCES) { sol.planEau(x, z, r * 2, r * 2, -.25, ['#67e8f9', '#0891b2'], 0, true); grille.boucherCercle(x, z, r - .3); reserver(x, z, r + .6); }
    placer(panneau('🔥 Le Volcan'), -2.4, 11.5);
    const sb = placer(sablierLave(), 4.5, -9.5);
    ajouterInteractif({ id: 'gadget-sablierLave', e: '⏳', texte: 'Le sablier de lave', x: sb.porteMonde[0], z: sb.porteMonde[1], cible: sb.g, gadget: 'sablierLave' });
    const surChemin = (x, z, m = 1.4) => CHEMINS.some(([x1, z1, x2, z2, w]) => distSegment(x, z, x1, z1, x2, z2) < w / 2 + m);
    const f = ile.forme;
    dessinerColonnes(ctx, semer(ctx, 26, { rayon: 1.4, ecart: 3, bloque: .8, taille: [.8, 1.4], test: (x, z) => !surChemin(x, z, 1.8) && !surCoulee(x, z, 1.5) && z < 18 }));
    dessinerRochers(ctx, semer(ctx, 50, { rayon: .9, bloque: .5, taille: [.4, 1.2], test: (x, z) => !surChemin(x, z) && !surCoulee(x, z, .8) }), '#292524');
    dessinerRochers(ctx, semer(ctx, 20, { rayon: .7, bloque: .35, taille: [.3, .6], test: (x, z) => surCoulee(x, z, 3) && !surCoulee(x, z, 1) }), '#7c2d12');
    dessinerPalmiers(ctx, semer(ctx, 12, { rayon: 1.4, ecart: 3, bloque: .35, taille: [.7, 1], test: (x, z) => f(x, z) > .74 && f(x, z) < .9 && z > 6 && !surChemin(x, z) }));
    dessinerBuissons(ctx, semer(ctx, 26, { rayon: .9, ecart: 1.6, bloque: .4, taille: [.5, .9], test: (x, z) => z > 4 && !surChemin(x, z, 1.2) && !surCoulee(x, z, 1) }), ['#65743a', '#4d5b2a', '#7c8a45']);
    dessinerHerbes(ctx, semer(ctx, 260, { rayon: .15, taille: [.6, 1.2], test: (x, z) => z > 6 && !surChemin(x, z, .2) }), '#7c8a45');
    /* des braises qui rougeoient près de la coulée */
    const br = semer(ctx, 60, { rayon: .2, taille: [.6, 1.2], test: (x, z) => surCoulee(x, z, 3.5) && !surCoulee(x, z, 1.2) });
    racine.add(instances(sphere(8, 6), new THREE.MeshBasicMaterial({ color: '#fb923c' }), br.map(a => ({ p: [a.x, a.y + .05, a.z], s: [.12 * a.s, .06, .12 * a.s] })), false, 0, false));
    void cone;
    return { gadgets: { sablierLave: sb } };
  }
};
