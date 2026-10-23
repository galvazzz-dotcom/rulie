/* ══════════ LA DINDIE EN 3D, FABRIQUÉE DEPUIS SON ADN ══════════
   Morceaux qui bougent : le corps (avec son motif peint), les ailes, la tête
   (yeux, bec, crête, chapeau), les barbillons, les pattes, et la queue en
   éventail (une seule « instance » pour toutes les plumes) qui fait la roue.
   API : const d = creerDindie(adn) ; scene.add(d.racine) ;
         d.maj(dt, t) à chaque image ; d.jouer('roue' | 'glouglou' | 'saut') ;
         d.marcher(vitesse) (0 = s'arrêter) ; d.liberer() pour la retirer. */
import * as THREE from 'three';
import { sphere, demiSphere, cylindre, cone, tore, boite, etoile5, geo, fusion } from '../moteur/formes.js';
import { toon, toonTexture, contour, contourPour, texRonde, texEtoile } from '../moteur/materiaux.js';
import { assombrir, eclaircir, ARC, hasard } from '../moteur/couleurs.js';
import { formeQueue } from './adn.js';

const EP = .016;                       /* épaisseur du contour */
const ORANGE_PATTES = '#f59e0b', BEC = '#fbbf24';

/* ── le motif du corps, peint sur une texture (enroulée autour de la sphère) ;
   chaque dindie a la sienne et la libère quand elle part ── */
function texCorps(a) {
  const W = 512, H = 256, c = document.createElement('canvas'); c.width = W; c.height = H;
  const x = c.getContext('2d'), r = hasard(a.id + a.motifCorps);
  x.fillStyle = a.corps; x.fillRect(0, 0, W, H);
  x.fillStyle = x.strokeStyle = a.couleurMotif; x.lineCap = x.lineJoin = 'round';
  /* près des pôles, la texture est « serrée » : on élargit les formes pour qu'elles restent rondes */
  const large = y => 1 / Math.max(.35, Math.sin(Math.PI * y / H));
  const partout = (px, f) => { f(px); if (px < 60) f(px + W); if (px > W - 60) f(px - W); };
  const ovale = (px, py, rr) => partout(px, X => { x.beginPath(); x.ellipse(X, py, rr * large(py), rr, 0, 0, Math.PI * 2); x.fill(); });
  const m = a.motifCorps;
  if (m === 'pois') { for (let l = 0; l < 6; l++) for (let k = 0; k < 9; k++) ovale(k * 57 + (l % 2) * 28 + 10, 24 + l * 42, 11); }
  else if (m === 'taches') { for (let i = 0; i < 26; i++) { const py = 25 + r() * (H - 50), px = r() * W, rr = 9 + r() * 14; partout(px, X => { x.beginPath(); for (let j = 0; j < 9; j++) { const an = j / 9 * Math.PI * 2, q = rr * (.75 + r() * .45); x.lineTo(X + Math.cos(an) * q * large(py), py + Math.sin(an) * q); } x.fill(); }); } }
  else if (m === 'rayures') { x.lineWidth = 13; for (let k = 0; k < 12; k++) { x.beginPath(); for (let y = -10; y <= H + 10; y += 8) x.lineTo(k * W / 12 + Math.sin(y / 26 + k) * 12 + y * .25, y); x.stroke(); } }
  else if (m === 'gaufre') { x.lineWidth = 7; for (let k = 0; k <= W; k += 34) { x.beginPath(); x.moveTo(k, 0); x.lineTo(k, H); x.stroke(); } for (let y = 18; y < H; y += 34) { x.beginPath(); x.moveTo(0, y); x.lineTo(W, y); x.stroke(); } }
  else if (m === 'losanges') { x.lineWidth = 6; for (let k = -H; k < W + H; k += 44) { x.beginPath(); x.moveTo(k, 0); x.lineTo(k + H, H); x.stroke(); x.beginPath(); x.moveTo(k + H, 0); x.lineTo(k, H); x.stroke(); } }
  else if (m === 'flocons' || m === 'etoiles') {
    for (let i = 0; i < 22; i++) {
      const py = 25 + r() * (H - 50), px = r() * W, rr = 9 + r() * 6, lg = large(py);
      partout(px, X => {
        if (m === 'flocons') { x.lineWidth = 3; for (let j = 0; j < 3; j++) { const an = j * Math.PI / 3; x.beginPath(); x.moveTo(X - Math.cos(an) * rr * lg, py - Math.sin(an) * rr); x.lineTo(X + Math.cos(an) * rr * lg, py + Math.sin(an) * rr); x.stroke(); } }
        else { x.beginPath(); for (let j = 0; j < 10; j++) { const an = -Math.PI / 2 + j * Math.PI / 5, q = j % 2 ? rr * .45 : rr; x.lineTo(X + Math.cos(an) * q * lg, py + Math.sin(an) * q); } x.fill(); }
      });
    }
  } else if (m === 'eclairs') { x.lineWidth = 7; for (let k = 0; k < 7; k++) { const x0 = k * W / 7 + 20; x.beginPath(); x.moveTo(x0, 30); x.lineTo(x0 + 22, 90); x.lineTo(x0 - 6, 110); x.lineTo(x0 + 18, 190); x.stroke(); } }
  /* le ventre, plus clair, devant et en bas (le devant de la sphère est à u = 0,25) */
  const g = x.createRadialGradient(W * .25, H * .74, 10, W * .25, H * .74, 110);
  g.addColorStop(0, a.ventre); g.addColorStop(.62, a.ventre + 'dd'); g.addColorStop(1, a.ventre + '00');
  x.fillStyle = g; x.beginPath(); x.ellipse(W * .25, H * .74, 120, 100, 0, 0, Math.PI * 2); x.fill();
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  return t;
}

/* ── les morceaux de la tête (crête, chapeau, yeux…) : des listes de formes à fusionner ── */
function partiesCrete(a, H, R) {
  const p = [], c = a.couleurCrete, haut = H[1] + R;
  if (a.crete === 'touffe') for (const s of [-1, 0, 1]) p.push({ g: sphere(), c: c || a.queue, p: [H[0] + s * .065, haut + .05, H[2] - .03], r: [0, 0, -s * .45], s: [.034, .1, .034] });
  if (a.crete === 'punk') for (let i = 0; i < 5; i++) { const z = .1 - i * .055, an = -.5 + i * .25; p.push({ g: cone(1, 1, 10), c: c || a.bande, p: [H[0], H[1] + Math.cos(an) * R + .04, H[2] + Math.sin(an) * R * .95], r: [an, 0, 0], s: [.04, .13 - Math.abs(i - 1.5) * .015, .04] }); void z; }
  if (a.crete === 'couronne') {
    p.push({ g: cylindre(1, .92, 1, 18), c: '#facc15', p: [H[0], haut - .01, H[2] - .02], s: [.12, .07, .12] });
    for (let i = 0; i < 5; i++) { const an = i / 5 * Math.PI * 2; p.push({ g: cone(1, 1, 8), c: '#facc15', p: [H[0] + Math.sin(an) * .1, haut + .06, H[2] - .02 + Math.cos(an) * .1], s: [.025, .07, .025] }); }
    p.push({ g: sphere(10, 8), c: '#ef4444', p: [H[0], haut, H[2] + .105], s: .025 }, { g: sphere(10, 8), c: '#3b82f6', p: [H[0] - .085, haut, H[2] + .06], s: .018 }, { g: sphere(10, 8), c: '#22c55e', p: [H[0] + .085, haut, H[2] + .06], s: .018 });
  }
  if (a.crete === 'fleurs') {
    const CF = ['#f9a8d4', '#ffffff', '#fde047', '#f472b6', '#c4b5fd'];
    for (let i = 0; i < 5; i++) {
      const an = -1.1 + i * .55, fx = H[0] + Math.sin(an) * R * .82, fy = H[1] + Math.cos(an) * R * .82 + .02, fz = H[2] - .04;
      for (let k = 0; k < 5; k++) { const b = k / 5 * Math.PI * 2; p.push({ g: sphere(10, 8), c: CF[i], p: [fx + Math.cos(b) * .028, fy + Math.sin(b) * .028, fz + .01], s: [.024, .024, .014] }); }
      p.push({ g: sphere(10, 8), c: '#facc15', p: [fx, fy, fz + .02], s: .017 });
    }
  }
  if (a.crete === 'cornes') for (const s of [-1, 1]) p.push({ g: cone(1, 1, 12), c: c || '#f5f5f4', p: [H[0] + s * .11, haut - .02, H[2] - .03], r: [-.25, 0, -s * .55], s: [.035, .16, .035] });
  if (a.crete === 'flamme') {
    const c1 = c || '#f97316';
    [[0, .2, .06], [-.06, .14, .045], [.06, .14, .045]].forEach(([dx, h, rr]) => {
      p.push({ g: cone(1, 1, 12), c: c1, p: [H[0] + dx, haut + h / 2 - .02, H[2] - .02], r: [-.15, 0, -dx * 4], s: [rr, h, rr] });
      p.push({ g: cone(1, 1, 10), c: '#fde047', p: [H[0] + dx, haut + h / 2 - .04, H[2] + .012], r: [-.15, 0, -dx * 4], s: [rr * .55, h * .6, rr * .55] });
    });
  }
  if (a.crete === 'antennes') for (const s of [-1, 1]) {
    p.push({ g: cylindre(1, 1, 1, 6), c: assombrir(a.corps, .3), p: [H[0] + s * .07, haut + .06, H[2]], r: [0, 0, -s * .35], s: [.009, .16, .009] });
    p.push({ g: sphere(12, 10), c: a.bande, p: [H[0] + s * .1, haut + .14, H[2]], s: .032 });
  }
  if (a.crete === 'etoile') p.push({ g: etoile5(1, .4), c: '#fde047', p: [H[0], haut + .1, H[2] - .02], s: [.1, .1, .1] });
  if (a.crete === 'cristaux') [[-.08, .13, .5], [-.03, .18, .15], [.03, .2, -.15], [.08, .14, -.5]].forEach(([dx, h, an]) =>
    p.push({ g: cone(1, 1, 6), c: c || '#e0f2fe', p: [H[0] + dx, haut + h / 2 - .03, H[2] - .03], r: [-.2, 0, an], s: [.035, h, .035] }));
  return p;
}
function partiesChapeau(a, H, R) {
  const p = [], haut = H[1] + R;
  if (a.chapeau === 'fez') {
    p.push({ g: cylindre(.78, 1, 1, 18), c: '#dc2626', p: [H[0], haut + .02, H[2] - .02], r: [-.12, 0, .08], s: [.13, .15, .13] });
    p.push({ g: cylindre(1, 1, 1, 6), c: '#111827', p: [H[0] + .07, haut + .03, H[2] - .03], r: [0, 0, -.5], s: [.007, .12, .007] }, { g: sphere(10, 8), c: '#facc15', p: [H[0] + .11, haut - .02, H[2] - .03], s: .022 });
  }
  if (a.chapeau === 'turban') {
    p.push({ g: tore(1, .42), c: '#f8fafc', p: [H[0], haut - .04, H[2] - .02], r: [Math.PI / 2, 0, 0], s: [.14, .14, .12] });
    p.push({ g: sphere(), c: '#fef3c7', p: [H[0], haut + .02, H[2] - .02], s: [.15, .1, .15] }, { g: sphere(10, 8), c: '#dc2626', p: [H[0], haut - .02, H[2] + .14], s: .032 });
    p.push({ g: sphere(10, 8), c: '#a855f7', p: [H[0], haut + .09, H[2] + .1], r: [.5, 0, 0], s: [.025, .09, .02] });
  }
  if (a.chapeau === 'toque') p.push({ g: cylindre(1, 1, 1, 18), c: '#ffffff', p: [H[0], haut + .05, H[2] - .02], s: [.11, .16, .11] }, { g: sphere(), c: '#ffffff', p: [H[0], haut + .15, H[2] - .02], s: [.16, .09, .16] });
  if (a.chapeau === 'pirate') {
    p.push({ g: sphere(), c: '#111827', p: [H[0], haut + .02, H[2] - .02], s: [.24, .09, .12] }, { g: sphere(), c: '#111827', p: [H[0], haut + .07, H[2] - .02], s: [.12, .07, .1] });
    p.push({ g: sphere(10, 8), c: '#f8fafc', p: [H[0], haut + .05, H[2] + .1], s: [.03, .03, .01] }, { g: tore(1, .2), c: '#facc15', p: [H[0], haut + .0, H[2] - .02], r: [Math.PI / 2, 0, 0], s: [.2, .1, .1] });
  }
  /* les chapeaux de l'Atelier des plumes (deux couleurs : couleurChapeau, couleurChapeau2), un peu plus grands que nature pour bien les voir */
  const c1 = a.couleurChapeau || '#ef4444', c2 = a.couleurChapeau2 || '#fde68a', X = H[0], Z = H[2] - .02, n0 = p.length;
  if (a.chapeau === 'fete') {
    p.push({ g: cone(1, 1, 16), c: c1, p: [X, haut + .1, Z], s: [.1, .22, .1] }, { g: sphere(12, 10), c: c2, p: [X, haut + .215, Z], s: .036 });
    p.push({ g: tore(1, .22), c: c2, p: [X, haut - .005, Z], r: [Math.PI / 2, 0, 0], s: [.1, .1, .08] });
    [[0, .03, .08], [-.055, .09, 0], [.034, .14, .01]].forEach(([dx, dy, dz]) => p.push({ g: sphere(10, 8), c: c2, p: [X + dx, haut + dy, Z + dz], s: .02 }));
  }
  if (a.chapeau === 'noeud') {
    for (const s of [-1, 1]) p.push({ g: sphere(), c: c1, p: [X + s * .085, haut + .03, Z], r: [0, 0, s * .45], s: [.09, .06, .04] });
    p.push({ g: sphere(12, 10), c: c2, p: [X, haut + .02, Z + .01], s: [.04, .04, .035] });
  }
  if (a.chapeau === 'beret') p.push({ g: sphere(), c: c1, p: [X + .03, haut - .015, Z], r: [0, 0, -.2], s: [.21, .065, .2] }, { g: cylindre(1, 1, 1, 8), c: c2, p: [X + .045, haut + .055, Z], s: [.014, .05, .014] });
  if (a.chapeau === 'bonnet') {
    p.push({ g: demiSphere(), c: c1, p: [X, haut - .09, Z], s: [.218, .2, .218] }, { g: cylindre(1, 1, 1, 22), c: c2, p: [X, haut - .085, Z], s: [.226, .055, .226] });
    p.push({ g: sphere(12, 10), c: c2, p: [X, haut + .13, Z], s: .056 });
  }
  if (a.chapeau === 'casquette') {
    p.push({ g: demiSphere(), c: c1, p: [X, haut - .075, Z - .01], s: [.205, .16, .205] }, { g: sphere(), c: c2, p: [X, haut - .065, Z + .17], s: [.125, .018, .11] });
    p.push({ g: sphere(10, 8), c: c2, p: [X, haut + .085, Z - .01], s: .022 });
  }
  if (a.chapeau === 'fleurs') {
    p.push({ g: tore(1, .16), c: c1, p: [X, haut - .045, Z], r: [Math.PI / 2, 0, 0], s: [.175, .175, .13] });
    for (let i = 0; i < 6; i++) {
      const an = i / 6 * Math.PI * 2, fx = X + Math.sin(an) * .175, fz = Z + Math.cos(an) * .175, cf = i % 2 ? '#ffffff' : c2;
      for (let k = 0; k < 4; k++) { const b = k / 4 * Math.PI * 2; p.push({ g: sphere(10, 8), c: cf, p: [fx + Math.cos(b) * .026, haut - .02, fz + Math.sin(b) * .026], s: [.024, .016, .024] }); }
      p.push({ g: sphere(8, 6), c: '#facc15', p: [fx, haut - .01, fz], s: .016 });
    }
  }
  if (a.chapeau === 'hautForme') {
    p.push({ g: cylindre(1, 1, 1, 22), c: c1, p: [X, haut - .005, Z], s: [.2, .016, .2] }, { g: cylindre(1, 1, 1, 22), c: c1, p: [X, haut + .1, Z], s: [.12, .2, .12] });
    p.push({ g: cylindre(1, 1, 1, 22), c: c2, p: [X, haut + .03, Z], s: [.124, .045, .124] });
  }
  if (a.chapeau === 'sombrero') {
    p.push({ g: cylindre(1, 1, 1, 26), c: c1, p: [X, haut - .01, Z], s: [.34, .02, .34] }, { g: cylindre(.6, 1, 1, 20), c: c1, p: [X, haut + .07, Z], s: [.13, .15, .13] });
    p.push({ g: cylindre(1, 1, 1, 20), c: c2, p: [X, haut + .015, Z], s: [.128, .03, .128] });
    for (let i = 0; i < 8; i++) { const an = i / 8 * Math.PI * 2; p.push({ g: sphere(8, 6), c: c2, p: [X + Math.sin(an) * .33, haut - .03, Z + Math.cos(an) * .33], s: .025 }); }
  }
  if (a.chapeau === 'cowboy') {
    p.push({ g: sphere(), c: c1, p: [X, haut, Z], s: [.31, .03, .26] }, { g: cylindre(.8, 1, 1, 18), c: c1, p: [X, haut + .07, Z], s: [.13, .13, .115] });
    p.push({ g: sphere(), c: assombrir(c1, .15), p: [X, haut + .135, Z], s: [.1, .02, .09] }, { g: cylindre(1, 1, 1, 18), c: c2, p: [X, haut + .02, Z], s: [.133, .03, .118] });
    for (const s of [-1, 1]) p.push({ g: tore(1, .25, Math.PI), c: c1, p: [X + s * .27, haut + .02, Z], r: [Math.PI / 2, s > 0 ? 0 : Math.PI, Math.PI / 2], s: [.05, .05, .05] });
  }
  if (a.chapeau === 'viking') {
    p.push({ g: demiSphere(), c: c1, p: [X, haut - .085, Z], s: [.222, .2, .222] }, { g: cylindre(1, 1, 1, 22), c: assombrir(c1, .25), p: [X, haut - .075, Z], s: [.228, .045, .228] });
    for (const s of [-1, 1]) p.push({ g: cone(1, 1, 12), c: c2, p: [X + s * .22, haut + .04, Z], r: [0, 0, -s * .75], s: [.045, .17, .045] });
    p.push({ g: sphere(10, 8), c: assombrir(c1, .25), p: [X, haut + .11, Z], s: .03 });
  }
  /* les chapeaux de fête (étape 8) */
  if (a.chapeau === 'sorciere') {
    p.push({ g: cylindre(1, 1, 1, 24), c: c1, p: [X, haut - .005, Z], s: [.3, .018, .3] }, { g: cone(1, 1, 16), c: c1, p: [X - .01, haut + .15, Z - .02], r: [-.2, 0, .14], s: [.14, .3, .14] });
    p.push({ g: cylindre(1, 1, 1, 20), c: c2, p: [X, haut + .03, Z], s: [.13, .04, .13] }, { g: boite(1, 1, 1), c: '#facc15', p: [X, haut + .03, Z + .13], s: [.05, .04, .012] });
  }
  if (a.chapeau === 'renne') {
    p.push({ g: tore(1, .12, Math.PI), c: c2, p: [X, haut - .1, Z], s: [.2, .2, .2] });
    for (const s of [-1, 1]) {
      p.push({ g: cylindre(1, 1, 1, 8), c: c1, p: [X + s * .14, haut + .1, Z], r: [0, 0, -s * .25], s: [.022, .2, .022] }, { g: cylindre(1, 1, 1, 8), c: c1, p: [X + s * .2, haut + .13, Z], r: [0, 0, -s * 1.1], s: [.018, .1, .018] });
      p.push({ g: cylindre(1, 1, 1, 8), c: c1, p: [X + s * .19, haut + .2, Z], r: [0, 0, -s * .8], s: [.016, .08, .016] }, { g: sphere(8, 6), c: c1, p: [X + s * .165, haut + .2, Z], s: .021 });
    }
  }
  if (a.chapeau === 'lapin') {
    p.push({ g: tore(1, .14, Math.PI), c: c1, p: [X, haut - .1, Z], s: [.2, .2, .2] });
    for (const s of [-1, 1]) p.push({ g: sphere(), c: c1, p: [X + s * .08, haut + .17, Z], r: [0, 0, -s * .15], s: [.055, .19, .04] }, { g: sphere(), c: c2, p: [X + s * .08, haut + .17, Z + .022], r: [0, 0, -s * .15], s: [.032, .14, .025] });
  }
  if (a.chapeau === 'paille') {
    p.push({ g: cylindre(1, 1, 1, 26), c: c1, p: [X, haut - .005, Z], s: [.3, .018, .3] }, { g: cylindre(.85, 1, 1, 20), c: c1, p: [X, haut + .06, Z], s: [.13, .12, .13] });
    p.push({ g: cylindre(1, 1, 1, 20), c: c2, p: [X, haut + .025, Z], s: [.133, .035, .133] }, { g: sphere(10, 8), c: c2, p: [X + .12, haut + .03, Z + .06], s: [.035, .025, .02] });
  }
  const K = 1.3;
  for (let i = n0; i < p.length; i++) { const q = p[i], s = typeof q.s === 'number' ? [q.s, q.s, q.s] : q.s; q.p = [X + (q.p[0] - X) * K, haut + (q.p[1] - haut) * K, Z + (q.p[2] - Z) * K]; q.s = s.map(v => v * K); }
  if (a.chapeau === 'champignon') {
    p.push({ g: demiSphere(), c: '#dc2626', p: [H[0], haut - .07, H[2] - .02], s: [.3, .2, .3] });
    [[0, .12, .19], [.17, .06, .14], [-.17, .06, .14], [.1, .16, .02], [-.1, .16, .02], [0, .1, -.2], [.2, .04, -.05], [-.2, .04, -.05]].forEach(([dx, dy, dz]) =>
      p.push({ g: sphere(10, 8), c: '#ffffff', p: [H[0] + dx, haut - .07 + dy, H[2] - .02 + dz], s: [.035, .02, .035] }));
  }
  return p;
}
function partiesYeux(a, H, R) {
  const p = [], gros = a.yeux === 'hibou' ? 1.25 : 1, poussin = a.stade === 'poussin';
  for (const s of [-1, 1]) {
    const ex = H[0] + s * R * .4, ey = H[1] + R * .16, ez = H[2] + R * .82, ry = s * .45;
    p.push({ g: sphere(18, 14), c: '#ffffff', p: [ex, ey, ez], r: [0, ry, 0], s: [.07 * gros, .082 * gros, .045] });
    if (a.yeux === 'hibou') p.push({ g: sphere(16, 12), c: '#facc15', p: [ex + s * .008, ey - .004, ez + .022], r: [0, ry, 0], s: [.058, .062, .03] });
    p.push({ g: sphere(16, 12), c: '#1f2937', p: [ex + s * .01, ey - .006, ez + .03], r: [0, ry, 0], s: [.045 * (poussin ? 1.1 : 1), .05 * (poussin ? 1.1 : 1), .03] });
    p.push({ g: sphere(10, 8), c: '#ffffff', p: [ex + s * .002 - .014, ey + .016, ez + .056], s: .016 }, { g: sphere(8, 6), c: '#ffffff', p: [ex + s * .016 + .01, ey - .022, ez + .052], s: .008 });
    if (a.yeux === 'malins') p.push({ g: demiSphere(), c: a.tete, p: [ex, ey + .004, ez + .005], r: [-.35, ry, 0], s: [.076, .06, .05] });
  }
  return p;
}

/* ── les plumes de la queue : formes partagées ── */
const plumeGeo = () => geo('plume', () => { const g = new THREE.SphereGeometry(1, 16, 12); g.scale(.5, .5, .09); g.translate(0, .5, 0); return g; });
const marqueGeo = () => geo('marque', () => { const g = new THREE.SphereGeometry(1, 14, 10); g.scale(.5, .5, .1); return g; });
const etoileMarqueGeo = () => geo('marqueEtoile', () => etoile5(1, .3).clone());

export function creerDindie(a) {
  const racine = new THREE.Group(), aJeter = [], lesContours = [];
  const poussin = a.stade === 'poussin', jeune = a.stade === 'jeune';
  /* une forme et son contour, dans un groupe (c'est le groupe qu'on agrandit) */
  const ajouter = (parent, geometrie, materiau, ep = EP, ombre = true) => {
    const grp = new THREE.Group(); parent.add(grp);
    const m = new THREE.Mesh(geometrie, materiau); m.castShadow = ombre; m.receiveShadow = true; grp.add(m);
    if (ep) { const c = new THREE.Mesh(geometrie, contourPour(geometrie, ep)); grp.add(c); lesContours.push(c); }
    return grp;
  };
  const fus = parts => { const g = fusion(parts); aJeter.push(g); return g; };

  const corpsG = new THREE.Group(); corpsG.position.y = poussin ? .5 : .62; racine.add(corpsG);
  /* le corps, avec son motif */
  const rc = poussin ? [.42, .42, .42] : [.42, .4, .46];
  const matCorps = toonTexture(texCorps(a));
  const corps = ajouter(corpsG, sphere(32, 22), matCorps, EP / .42); corps.scale.set(...rc);
  /* les ailes */
  const ailes = [-1, 1].map(s => {
    const g = new THREE.Group(); g.position.set(s * (rc[0] - .05), .02, -.02); g.rotation.z = s * .12; corpsG.add(g);
    const parts = [{ g: sphere(), c: a.aile, p: [0, -.05, 0], s: poussin ? [.06, .14, .18] : [.075, .22, .3] }];
    if (!poussin) [[-.1, -.24, .05], [.02, -.22, .05], [-.2, -.25, .045]].forEach(([z, y, r]) => parts.push({ g: sphere(), c: assombrir(a.aile, .12), p: [0, y, z], s: [r, .09, .07] }));
    ajouter(g, fus(parts), toon());
    return g;
  });
  /* les pattes (accrochées à la racine : le corps peut rebondir sans elles) */
  const pattes = [-1, 1].map(s => {
    const g = new THREE.Group(); g.position.set(s * .14, poussin ? .26 : .34, .03); racine.add(g);
    const lg = poussin ? .2 : .3;
    const parts = [{ g: cylindre(1, 1, 1, 8), c: ORANGE_PATTES, p: [0, -lg / 2, 0], s: [.032, lg, .032] }];
    for (const an of [-.5, 0, .5]) parts.push({ g: cylindre(1, .7, 1, 6), c: ORANGE_PATTES, p: [Math.sin(an) * .05, -lg, .05 * Math.cos(an)], r: [Math.PI / 2, 0, -an], s: [.02, .12, .02] });
    parts.push({ g: cylindre(1, .7, 1, 6), c: ORANGE_PATTES, p: [0, -lg, -.04], r: [-Math.PI / 2, 0, 0], s: [.018, .07, .018] });
    ajouter(g, fus(parts), toon(), EP * .8);
    return g;
  });

  /* la queue en éventail */
  const Q = formeQueue(a), queueG = new THREE.Group(); queueG.position.set(0, .1, -rc[2] + .1); corpsG.add(queueG);
  let plumes = null, marques = [], contourPlumes = null;
  const couleurPlume = i => a.motifQueue === 'arc' ? ARC[i % ARC.length] : a.motifQueue === 'flammes' && i % 2 ? eclaircir(a.queue, .15) : a.queue;
  const couches = { bandes: [['e', .84, .92, .16, a.bande]], ocelles: [['d', .8, .62, 0, a.bande], ['d', .8, .32, 0, assombrir(a.queue, .55)]],
    belge: [['e', .9, .9, .11, '#111111'], ['e', .76, .92, .11, '#facc15']], arc: [['e', .86, .9, .14, null]],
    flammes: [['e', .82, .7, .3, a.bande], ['e', .9, .4, .16, eclaircir(a.bande, .45)]], etoiles: [['s', .8, .34, 0, a.bande]], uni: [] }[a.motifQueue] || [];
  if (Q.n) {
    plumes = new THREE.InstancedMesh(plumeGeo(), toon('#ffffff'), Q.n); plumes.castShadow = true;
    contourPlumes = new THREE.InstancedMesh(plumeGeo(), contour(.05), Q.n); contourPlumes.instanceMatrix = plumes.instanceMatrix; lesContours.push(contourPlumes);
    for (let i = 0; i < Q.n; i++) plumes.setColorAt(i, new THREE.Color(couleurPlume(i)));
    queueG.add(contourPlumes, plumes);
    marques = couches.map(([forme, y, sx, sy, coul]) => {
      const im = new THREE.InstancedMesh(forme === 's' ? etoileMarqueGeo() : marqueGeo(), toon('#ffffff'), Q.n);
      for (let i = 0; i < Q.n; i++) im.setColorAt(i, new THREE.Color(coul || eclaircir(couleurPlume(i), .6)));
      im.userData = { forme, y, sx, sy }; queueG.add(im);
      return im;
    });
  } else {
    /* le poussin : une petite touffe */
    const t = fus([-1, 0, 1].map(s => ({ g: sphere(), c: a.aile, p: [s * .05, .05, 0], r: [-.6, 0, -s * .4], s: [.03, .08, .03] })));
    ajouter(queueG, t, toon(), EP * .8);
  }
  const _m = new THREE.Matrix4(), _f = new THREE.Matrix4(), _l = new THREE.Matrix4(), _q = new THREE.Quaternion(), _v = new THREE.Vector3(), _s = new THREE.Vector3(), _z = new THREE.Vector3(0, 0, 1);
  let kPose = -1;
  function poserQueue(k) {
    if (!plumes || Math.abs(k - kPose) < .002) return;
    kPose = k;
    const ouvre = .62 + (1.5 - .62) * k;
    queueG.rotation.x = -1.05 + .97 * k;
    for (let i = 0; i < Q.n; i++) {
      const th = -ouvre + 2 * ouvre * i / (Q.n - 1), L = Q.L * (1 - .08 * Math.abs(th) / ouvre);
      _f.compose(_v.set(0, 0, -Math.abs(th) * .02), _q.setFromAxisAngle(_z, th), _s.set(Q.w, L, Q.w));
      plumes.setMatrixAt(i, _f);
      for (const im of marques) {
        const { forme, y, sx, sy } = im.userData;
        const syv = forme === 'e' ? sy : sx * Q.w / L;
        _l.compose(_v.set(0, y, forme === 's' ? .1 : .06), _q.identity(), _s.set(sx, syv, forme === 's' ? .25 : 1));
        _m.multiplyMatrices(_f, _l); im.setMatrixAt(i, _m);
      }
    }
    plumes.instanceMatrix.needsUpdate = true;
    for (const im of marques) im.instanceMatrix.needsUpdate = true;
  }

  /* la tête : cou, crâne, bec, joues, crête, chapeau ; les yeux à part (ils clignent) */
  const teteG = new THREE.Group(); teteG.position.set(0, poussin ? .26 : .3, poussin ? .14 : .26); corpsG.add(teteG);
  const R = poussin ? .27 : .21, H = poussin ? [0, .12, .06] : [0, .26, .07];
  const couleurTete = poussin ? a.corps : a.tete;
  const pt = [{ g: sphere(26, 18), c: couleurTete, p: H, s: R }];
  if (!poussin) pt.push({ g: cylindre(1, 1.2, 1, 16), c: couleurTete, p: [0, .1, .02], r: [.25, 0, 0], s: [.1, .28, .1] });
  pt.push({ g: cone(1, 1, 14), c: BEC, p: [H[0], H[1] - R * .12, H[2] + R * 1.02], r: [Math.PI / 2 + .25, 0, 0], s: poussin ? [.05, .1, .05] : [.052, .13, .052] });
  for (const s of [-1, 1]) pt.push({ g: sphere(12, 8), c: '#fb7185', p: [H[0] + s * R * .7, H[1] - R * .22, H[2] + R * .62], r: [0, s * .75, 0], s: [.05, .03, .018] });
  const vraie = { ...a, tete: couleurTete };
  pt.push(...partiesCrete(vraie, H, R), ...partiesChapeau(vraie, H, R));
  if (a.accessoire === 'echarpe') pt.push({ g: tore(1, .3), c: a.couleurAccessoire, p: [0, .04, .04], r: [Math.PI / 2 + .25, 0, 0], s: [.14, .14, .13] }, { g: sphere(), c: a.couleurAccessoire, p: [.08, -.06, .14], r: [.2, 0, .3], s: [.05, .11, .025] });
  ajouter(teteG, fus(pt), toon());
  const yeuxG = new THREE.Group(); yeuxG.position.set(0, H[1] + R * .16, 0); teteG.add(yeuxG);
  const yeux = fus(partiesYeux(vraie, [H[0], -R * .16, H[2]], R));
  ajouter(yeuxG, yeux, toon(), 0, false);
  /* les barbillons (la caroncule sur le bec, le barbillon dessous) : ils tremblent au glouglou */
  let barbG = null;
  if (!poussin) {
    barbG = new THREE.Group(); barbG.position.set(H[0], H[1] - R * .2, H[2] + R * .95); teteG.add(barbG);
    const k = jeune ? .75 : 1;
    ajouter(barbG, fus([{ g: sphere(14, 10), c: a.caroncule, p: [.035 * k, -.035 * k, .03], r: [0, 0, -.25], s: [.028 * k, .085 * k, .028 * k] },
      { g: sphere(14, 10), c: assombrir(a.caroncule, .1), p: [-.02 * k, -.1 * k, -.05], s: [.048 * k, .072 * k, .042 * k] }]), toon(), EP * .8);
  }
  /* la cape (derrière le corps) */
  if (a.accessoire === 'cape') {
    const g = new THREE.CylinderGeometry(.46, .56, .62, 22, 1, true, Math.PI / 2 + .25, Math.PI - .5); aJeter.push(g);
    const cape = new THREE.Mesh(g, toon(a.couleurAccessoire, { side: THREE.DoubleSide })); cape.position.set(0, .02, -.04); cape.castShadow = true; corpsG.add(cape);
    ajouter(corpsG, fus([{ g: tore(1, .25, Math.PI), c: assombrir(a.couleurAccessoire, .2), p: [0, .3, .02], r: [-.3, 0, 0], s: [.2, .2, .16] }]), toon());
  }

  /* l'aura (épiques, mythiques, éveillées, chromatiques) : des lumières qui tournent */
  let aura = null, sol = null, etincelles = [];
  if (a.aura) {
    const n = 26, pos = new Float32Array(n * 3), col = new Float32Array(n * 3), c = new THREE.Color(), rr = hasard(a.id + 'aura');
    for (let i = 0; i < n; i++) {
      const an = i / n * Math.PI * 2, r = .6 + rr() * .3;
      pos.set([Math.cos(an) * r, .25 + rr() * 1.05, Math.sin(an) * r], i * 3);
      c.set(a.aura === 'arc' ? ARC[i % ARC.length] : a.aura); col.set([c.r, c.g, c.b], i * 3);
    }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.BufferAttribute(col, 3)); aJeter.push(g);
    const pm = new THREE.PointsMaterial({ size: .13, map: texRonde(), vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: .95 });
    aura = new THREE.Points(g, pm); racine.add(aura);
    const sm = new THREE.MeshBasicMaterial({ map: texRonde(), color: a.aura === 'arc' ? '#f0abfc' : a.aura, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: .55 });
    sol = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 2.2), sm); sol.rotation.x = -Math.PI / 2; sol.position.y = .02; racine.add(sol); aJeter.push(sol.geometry);
  }
  if (a.chroma) {
    const sm = new THREE.SpriteMaterial({ map: texEtoile(), color: '#fff7c2', transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
    const rr = hasard(a.id + 'chroma');
    for (let i = 0; i < 7; i++) { const s = new THREE.Sprite(sm); s.position.set((rr() - .5) * 1.3, .3 + rr() * 1.2, (rr() - .5) * 1.0); s.userData.ph = rr() * 6; racine.add(s); etincelles.push(s); }
  }

  racine.scale.setScalar(a.taille);
  poserQueue(.3);

  /* ── les animations ── */
  let action = null, tAction = 0, vitesse = 0, phase = 0, roueK = .3, regard = 0, regardCible = 0, prochainRegard = 2, prochainClin = 1.5, clin = 0, dort = false, sommeil = 0;
  const DUREES = { roue: 2.8, glouglou: 1.4, saut: .9, picore: 1.3 };
  function jouer(nom) { action = nom; tAction = 0; }
  function marcher(v) { vitesse = v; }
  function maj(dt, t) {
    tAction += dt;
    const fin = action && tAction >= DUREES[action];
    if (fin) action = null;
    const p = action ? tAction / DUREES[action] : 0, env = action ? Math.sin(Math.min(1, p * 1.15) * Math.PI) : 0;
    /* la roue */
    sommeil += ((dort ? 1 : 0) - sommeil) * Math.min(1, dt * 2.5);
    const roueCible = action === 'roue' && p < .82 ? 1 : vitesse > 1.5 || dort ? .05 : .3;
    roueK += (roueCible - roueK) * Math.min(1, dt * (roueCible > roueK ? 7 : 4));
    poserQueue(roueK);
    const gonfle = (roueK - .3) / .7;
    corps.scale.set(rc[0] * (1 + .06 * gonfle), rc[1] * (1 + .04 * gonfle), rc[2]);
    ailes.forEach((g, i) => { const s = i ? 1 : -1; g.rotation.z = s * (.12 + .45 * Math.max(0, gonfle)); g.rotation.x = .25 * Math.max(0, gonfle); });
    /* la marche (en se dandinant) */
    let roulis = 0, bond = 0, tangage = 0;
    if (vitesse > 0) {
      phase += dt * (5 + vitesse * 4);
      const amp = Math.min(1, .45 + vitesse * .3);
      pattes[0].rotation.x = Math.sin(phase) * .7 * amp; pattes[1].rotation.x = -Math.sin(phase) * .7 * amp;
      roulis = Math.sin(phase) * .11 * amp; bond = Math.abs(Math.sin(phase)) * .045 * amp; tangage = Math.min(.3, vitesse * .08);
      teteG.position.z = (poussin ? .14 : .26) + Math.sin(phase * 2) * .025;
      if (vitesse > 2) ailes.forEach((g, i) => { g.rotation.z = (i ? 1 : -1) * (.3 + Math.sin(t * 24) * .25); });
    } else {
      pattes.forEach(g => { g.rotation.x *= .8; });
      bond = Math.sin(t * 2.2) * .012;
    }
    /* le saut */
    let haut = 0, ecrase = 1;
    if (action === 'saut') {
      if (p < .22) ecrase = 1 - .16 * Math.sin(p / .22 * Math.PI / 2);
      else if (p < .72) { const q = (p - .22) / .5; haut = Math.sin(q * Math.PI) * .5; ecrase = 1 + .08 * Math.sin(q * Math.PI); ailes.forEach((g, i) => { g.rotation.z = (i ? 1 : -1) * (.4 + Math.sin(t * 30) * .4); }); }
      else ecrase = 1 - .1 * Math.sin((p - .72) / .28 * Math.PI);
    }
    corpsG.position.y = (poussin ? .5 : .62) + bond + haut - sommeil * (poussin ? .16 : .24);
    pattes.forEach(g => { g.visible = sommeil < .6; });
    corpsG.scale.set(1 / Math.sqrt(ecrase), ecrase, 1 / Math.sqrt(ecrase));
    pattes.forEach(g => { g.position.y = (poussin ? .26 : .34) + haut; });
    corpsG.rotation.z = roulis; corpsG.rotation.x = tangage;
    /* la tête : elle regarde autour d'elle, et tremble au glouglou */
    if (t > prochainRegard) { regardCible = vitesse > 0 ? 0 : (Math.random() - .5) * 1.1; prochainRegard = t + 1.8 + Math.random() * 3; }
    regard += (regardCible - regard) * Math.min(1, dt * 3);
    teteG.rotation.y = action === 'glouglou' ? 0 : regard;
    teteG.rotation.z = action === 'glouglou' ? Math.sin(t * 32) * .22 * env : 0;
    teteG.rotation.x = action === 'glouglou' ? -.25 * env : action === 'roue' ? -.12 * env : action === 'picore' ? Math.max(0, Math.sin(p * Math.PI * 4)) * .9 * env + .3 * env : sommeil * .35;
    if (barbG) barbG.rotation.x = action === 'glouglou' ? Math.sin(t * 26) * .5 * env : Math.sin(t * 3) * .05;
    /* les yeux clignent */
    if (t > prochainClin) { clin = .14; prochainClin = t + 2 + Math.random() * 3.5; }
    clin = Math.max(0, clin - dt);
    yeuxG.scale.y = clin > 0 || sommeil > .5 ? .12 : 1;
    /* l'aura tourne, les étincelles scintillent */
    if (aura) { aura.rotation.y = t * .6; aura.position.y = Math.sin(t * 1.4) * .04; sol.material.opacity = .4 + Math.sin(t * 2) * .12; }
    etincelles.forEach(s => { const k = Math.max(0, Math.sin(t * 3 + s.userData.ph)); s.scale.setScalar(.06 + k * .2); s.material.opacity = k; });
  }
  function liberer() {
    racine.parent && racine.parent.remove(racine);
    aJeter.forEach(g => g.dispose());
    matCorps.map.dispose(); matCorps.dispose();
    [plumes, contourPlumes, ...marques].forEach(m => m && m.dispose());
    if (aura) aura.material.dispose();
    if (sol) sol.material.dispose();
  }
  /* où mettre une bulle au-dessus d'elle */
  const hauteur = () => (poussin ? 1.0 : 1.45) * a.taille;
  const dormir = v => { dort = v; if (v) action = null; };
  const montrerContours = v => lesContours.forEach(c => { c.visible = v; });
  return { racine, maj, jouer: n => { if (!dort) jouer(n); }, marcher, liberer, hauteur, dormir, montrerContours, dortIl: () => dort, adn: a };
}
