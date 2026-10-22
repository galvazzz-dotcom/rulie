/* ══════════ LES BÂTIMENTS DU DOMAINE ══════════
   Chaque fabrique renvoie { g (le groupe 3D), obst ([[x, z, largeur, profondeur]] en local),
   porte ([x, z] local : où se placer pour entrer), maj?(dt, t) }.
   Les fenêtres ont leur propre matériau : elles s'allument la nuit. */
import * as THREE from 'three';
import { sphere, demiSphere, cylindre, cone, tore, boite, prisme, fusion } from '../moteur/formes.js';
import { toon, contourPour, TONS, texRonde, partager } from '../moteur/materiaux.js';
import { assombrir, eclaircir, hasard } from '../moteur/couleurs.js';
import { TYPES } from '../donnees/types.js';

const B = (c, p, s, r = [0, 0, 0]) => ({ g: boite(1, 1, 1), c, p, s, r });
const T = (c, p, s, r = [0, 0, 0]) => ({ g: prisme(), c, p, s, r });
const CY = (c, p, s, r = [0, 0, 0], n = 16) => ({ g: cylindre(1, 1, 1, n), c, p, s, r });
const CO = (c, p, s, r = [0, 0, 0], n = 12) => ({ g: cone(1, 1, n), c, p, s, r });
const SP = (c, p, s, r = [0, 0, 0]) => ({ g: sphere(16, 12), c, p, s, r });
const DS = (c, p, s, r = [0, 0, 0]) => ({ g: demiSphere(20, 10), c, p, s, r });
const TO = (c, p, s, r = [0, 0, 0], ep = .3, arc = Math.PI * 2) => ({ g: tore(1, ep, arc), c, p, s, r });

export const matFenetres = partager(new THREE.MeshToonMaterial({ gradientMap: TONS, vertexColors: true, emissive: '#ffc95c', emissiveIntensity: 0 }));
const aJeter = [];
function construire(parts, fen = [], ep = .035) {
  const g = new THREE.Group();
  if (parts.length) {
    const geo = fusion(parts); aJeter.push(geo);
    const m = new THREE.Mesh(geo, toon()); m.castShadow = true; m.receiveShadow = true; g.add(m);
    if (ep) g.add(new THREE.Mesh(geo, contourPour(geo, ep)));
  }
  if (fen.length) { const fg = fusion(fen); aJeter.push(fg); g.add(new THREE.Mesh(fg, matFenetres)); }
  return g;
}
/* une fenêtre : le cadre (dans les murs) et la vitre (qui s'allume) */
function fenetre(parts, fen, x, y, z, w = 1, h = 1, cadre = '#3b82f6', cote = 'z') {
  const r = cote === 'x' ? [0, Math.PI / 2, 0] : [0, 0, 0], dz = .06;
  const o = cote === 'x' ? [Math.sign(x) * dz, 0, 0] : [0, 0, Math.sign(z) * dz];
  parts.push(B(cadre, [x, y, z], [w + .2, h + .2, .12], r));
  fen.push(B('#bfe3ff', [x + o[0], y, z + o[2]], [w, h, .06], r));
  parts.push(B(cadre, [x + o[0] * 2, y, z + o[2] * 2], [.07, h, .05], r), B(cadre, [x + o[0] * 2, y, z + o[2] * 2], [w, .07, .05], r));
}
/* une pancarte avec du texte (et des émojis), toujours lisible */
export function pancarte(texte, w = 2, h = .7, { fond = '#fff8e7', encre = '#7c2d12', bord = '#b45309', taille = 120 } = {}) {
  const c = document.createElement('canvas'), ratio = w / h; c.width = 512; c.height = Math.round(512 / ratio);
  const x = c.getContext('2d');
  const dessiner = () => {
    x.clearRect(0, 0, c.width, c.height);
    x.fillStyle = fond; x.strokeStyle = bord; x.lineWidth = 18;
    x.beginPath(); x.roundRect(9, 9, c.width - 18, c.height - 18, 28); x.fill(); x.stroke();
    let t = taille; x.font = `${t}px "Lilita One", sans-serif`;
    while (x.measureText(texte).width > c.width - 50 && t > 20) { t -= 6; x.font = `${t}px "Lilita One", sans-serif`; }
    x.fillStyle = encre; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(texte, c.width / 2, c.height / 2 + t * .06);
    tex.needsUpdate = true;
  };
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
  dessiner(); document.fonts && document.fonts.load('60px "Lilita One"').then(dessiner).catch(() => {});
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, transparent: true }));
  aJeter.push(m.geometry);
  return m;
}

/* ── la maison de Roullieee ── */
export function maison() {
  const p = [], f = [];
  p.push(B('#b9a48a', [0, .15, 0], [6.4, .3, 5.4]), B('#fff3dc', [0, 1.75, 0], [6, 3.1, 5]));
  for (const x of [-2.95, 0, 2.95]) p.push(B('#8a5a3c', [x, 1.75, 2.5], [.25, 3.1, .22]));
  for (const x of [-2.95, 2.95]) p.push(B('#8a5a3c', [x, 1.75, -2.5], [.25, 3.1, .22]));
  p.push(B('#8a5a3c', [0, 3.2, 2.5], [6.1, .25, .22]), B('#8a5a3c', [0, 1.05, 2.5], [6.1, .14, .2]));
  p.push(T('#e76f51', [0, 3.25, 0], [6.4, 2.6, 7.2], [0, Math.PI / 2, 0]), T('#c2410c', [0, 3.15, 0], [6.6, .3, 7.4], [0, Math.PI / 2, 0]));
  p.push(B('#9ca3af', [1.8, 4.6, -1.2], [.75, 1.7, .75]), B('#6b7280', [1.8, 5.5, -1.2], [.95, .2, .95]));
  p.push(B('#8a5a3c', [0, 1.1, 2.55], [1.25, 2.2, .14]), SP('#facc15', [.42, 1.1, 2.66], .08), B('#d6d3d1', [0, .16, 3.05], [1.9, .32, .9]));
  p.push(DS('#8a5a3c', [0, 2.2, 2.55], [.62, .35, .07], [Math.PI / 2, 0, 0]));
  for (const x of [-1.85, 1.85]) {
    fenetre(p, f, x, 1.95, 2.52, .95, .95, '#3b82f6');
    p.push(B('#8a5a3c', [x, 1.32, 2.72], [1.25, .26, .36]));
    ['#f472b6', '#fde047', '#ef4444', '#c4b5fd'].forEach((c, i) => p.push(SP(c, [x - .45 + i * .3, 1.52, 2.74], .1)));
  }
  for (const s of [-1, 1]) fenetre(p, f, s * 3.02, 1.95, 0, .9, .9, '#3b82f6', 'x');
  /* la girouette : une petite dindie sur le toit */
  p.push(CY('#6b7280', [0, 6.1, 0], [.03, .9, .03]), SP('#374151', [0, 6.6, 0], [.2, .16, .14]), SP('#374151', [.18, 6.75, 0], .08), CO('#374151', [-.25, 6.68, 0], [.12, .22, .05], [0, 0, 1.2]));
  const g = construire(p, f);
  const ban = pancarte('🏠 Maison', 1.8, .55); ban.position.set(0, 3.55, 2.62); g.add(ban);
  return { g, obst: [[0, 0, 6.6, 5.6]], porte: [0, 4.1] };
}

/* ── le Labo du Professeur Plumeau (avec son observatoire) ── */
export function labo() {
  const p = [], f = [];
  p.push(B('#cbd5e1', [0, .2, 0], [8.6, .4, 6.6]), B('#eff6ff', [0, 2.2, 0], [8, 3.8, 6]), B('#2563eb', [0, 4.25, 0], [8.5, .35, 6.5]));
  p.push(B('#2563eb', [0, 2.2, 3.02], [8.05, .25, .1]), B('#93c5fd', [-4.02, 2.2, 0], [.12, 3.8, 6.1]), B('#93c5fd', [4.02, 2.2, 0], [.12, 3.8, 6.1]));
  /* l'observatoire */
  p.push(CY('#e2e8f0', [2, 4.8, -1], [1.9, .8, 1.9], [0, 0, 0], 24), DS('#cbd5e1', [2, 5.2, -1], [1.9, 1.9, 1.9]), B('#1e3a8a', [2, 6.2, -.2], [.55, 1.2, 1.7], [-.6, 0, 0]));
  p.push(CY('#64748b', [2, 6.6, .6], [.22, 1.8, .22], [-.9, 0, 0]), CY('#94a3b8', [2, 7.0, 1.4], [.3, .3, .3], [-.9, 0, 0]));
  /* l'antenne */
  p.push(CY('#6b7280', [-3, 5.6, -2], [.05, 2.6, .05]), SP('#ef4444', [-3, 6.95, -2], .14), TO('#6b7280', [-3, 6.2, -2], [.3, .3, .3], [Math.PI / 2, 0, 0], .1));
  /* la porte vitrée, le grand hublot, les fenêtres */
  p.push(B('#1e3a8a', [0, 1.4, 3.02], [1.9, 2.6, .14])); f.push(B('#bfe3ff', [-.46, 1.4, 3.1], [.8, 2.4, .05]), B('#bfe3ff', [.46, 1.4, 3.1], [.8, 2.4, .05]));
  p.push(B('#cbd5e1', [0, .18, 3.5], [2.4, .36, 1.1]));
  p.push(TO('#2563eb', [-2.7, 2.5, 3.04], [.85, .85, .6], [0, 0, 0], .16)); f.push(CY('#bfe3ff', [-2.7, 2.5, 3.04], [.82, .06, .82], [Math.PI / 2, 0, 0], 24));
  fenetre(p, f, 2.7, 2.5, 3.02, 1.3, 1.1, '#2563eb');
  for (const s of [-1, 1]) for (const z of [-1.5, 1.5]) fenetre(p, f, s * 4.05, 2.4, z, 1, 1, '#2563eb', 'x');
  /* des fioles sur le rebord */
  ['#22c55e', '#ec4899', '#facc15'].forEach((c, i) => p.push(CY('#e0f2fe', [2.3 + i * .4, 1.95, 3.25], [.09, .3, .09]), SP(c, [2.3 + i * .4, 1.85, 3.25], .1)));
  const g = construire(p, f);
  const ban = pancarte('🔬 Labo du Professeur', 4, .7, { fond: '#eff6ff', encre: '#1e3a8a', bord: '#2563eb' }); ban.position.set(0, 3.55, 3.1); g.add(ban);
  /* la lumière rouge de l'antenne clignote */
  const voyant = new THREE.Mesh(sphere(10, 8), new THREE.MeshBasicMaterial({ color: '#ff4d4d' })); voyant.position.set(-3, 6.95, -2); voyant.scale.setScalar(.16); g.add(voyant);
  return { g, obst: [[0, 0, 8.8, 6.8]], porte: [0, 4.4], maj: (dt, t) => { voyant.visible = Math.sin(t * 3) > 0; } };
}

/* ── la boutique de Mimi ── */
export function boutique() {
  const p = [], f = [];
  p.push(B('#b9a48a', [0, .15, 0], [7.4, .3, 5.4]), B('#fde68a', [0, 1.65, 0], [7, 2.9, 5]));
  p.push(T('#16a34a', [0, 3.1, 0], [6, 2.2, 7.8], [0, Math.PI / 2, 0]), T('#15803d', [0, 3.0, 0], [6.2, .25, 8], [0, Math.PI / 2, 0]));
  /* l'auvent rayé */
  for (let i = 0; i < 10; i++) p.push(B(i % 2 ? '#ffffff' : '#ef4444', [-3.15 + i * .7, 2.75, 3.05], [.7, .08, 1.3], [.35, 0, 0]));
  p.push(B('#b91c1c', [0, 2.52, 3.68], [7.05, .14, .08]));
  p.push(B('#8a5a3c', [-1.6, 1.1, 2.55], [1.2, 2.2, .14]), SP('#facc15', [-1.2, 1.1, 2.66], .08), B('#d6d3d1', [-1.6, .16, 3.05], [1.8, .32, .8]));
  fenetre(p, f, 1.4, 1.6, 2.52, 2.2, 1.2, '#16a34a');
  /* l'étal devant : des caisses de fruits */
  p.push(B('#8a5a3c', [2.2, .55, 3.6], [2.6, 1.1, .9]));
  [['#ef4444', 1.4], ['#fde047', 2.1], ['#22c55e', 2.8], ['#f97316', 3.4]].forEach(([c, x]) => { for (let k = 0; k < 4; k++) p.push(SP(c, [x - .15 + (k % 2) * .3, 1.2 + Math.floor(k / 2) * .14, 3.5 + (k % 2) * .15], .15)); });
  p.push(CY('#c2884e', [-3, .4, 3.5], [.42, .8, .42]), CY('#c2884e', [-3.9, .35, 3.1], [.35, .7, .35]));
  const g = construire(p, f);
  const ban = pancarte('🛒 Chez Mimi', 2.6, .7, { fond: '#fef9c3', encre: '#166534', bord: '#16a34a' }); ban.position.set(0, 3.25, 3.75); g.add(ban);
  return { g, obst: [[0, .3, 7.6, 6.2]], porte: [-1.6, 4.3] };
}

/* ── le Musée du Grand Livre : un petit temple ── */
export function musee() {
  const p = [], f = [];
  for (let k = 0; k < 3; k++) p.push(B('#e7e5e4', [0, .12 + k * .24, .3 - k * .15], [7.6 - k * .5, .24, 6.2 - k * .4]));
  p.push(B('#fef3c7', [0, 2.2, -.6], [5.8, 3.2, 4]));
  for (const x of [-2.6, -.9, .9, 2.6]) p.push(CY('#f8fafc', [x, 2.2, 2.1], [.3, 3.2, .3], [0, 0, 0], 14), CY('#e7e5e4', [x, 3.85, 2.1], [.42, .2, .42]), CY('#e7e5e4', [x, .78, 2.1], [.42, .2, .42]));
  p.push(B('#e7e5e4', [0, 4.05, .3], [7, .35, 5.2]), T('#fbbf24', [0, 4.2, .3], [7.2, 1.6, 5.4]), T('#f8fafc', [0, 4.3, 2.95], [5.2, 1.05, .1]));
  p.push(B('#7c2d12', [0, 1.6, 1.42], [1.4, 2.4, .12]));
  fenetre(p, f, -2, 2.4, 1.42, .8, 1.2, '#d97706'); fenetre(p, f, 2, 2.4, 1.42, .8, 1.2, '#d97706');
  /* une statue dorée de dindie devant */
  p.push(CY('#e7e5e4', [3.8, .5, 3.4], [.5, 1, .5]), SP('#facc15', [3.8, 1.45, 3.4], [.38, .36, .4]), SP('#facc15', [3.8, 1.98, 3.6], .2), CO('#fbbf24', [3.8, 1.9, 3.1], [.45, .55, .12], [-.8, 0, 0]));
  const g = construire(p, f);
  const ban = pancarte('📖 Musée du Grand Livre', 3.6, .62, { fond: '#fffbeb', encre: '#92400e', bord: '#d97706' }); ban.position.set(0, 4.65, 3.02); g.add(ban);
  return { g, obst: [[0, .2, 7.8, 6.4], [3.8, 3.4, 1.2, 1.2]], porte: [0, 4.4] };
}

/* ── le Clapier à dindes : en ruine, puis réparé ── */
export function clapier(repare) {
  const p = [], f = [];
  if (repare) {
    for (const x of [-3.7, -1.2, 1.2, 3.7]) for (const z of [-1.3, 1.3]) p.push(B('#7c4a22', [x, .4, z], [.25, .8, .25]));
    p.push(B('#c2884e', [0, 1.95, 0], [8, 2.3, 3]), B('#7c4a22', [0, .82, 0], [8.2, .14, 3.2]));
    for (let r = 0; r < 2; r++) for (let c = 0; c < 6; c++) {
      const x = -3.1 + c * 1.24, y = 1.4 + r * 1.05;
      p.push(B('#7c4a22', [x, y, 1.52], [1.06, .88, .08])); f.push(B('#fde68a', [x, y, 1.56], [.82, .66, .04]));
      for (let k = -1; k <= 1; k++) p.push(B('#a8a29e', [x + k * .26, y, 1.6], [.04, .66, .03]));
    }
    p.push(B('#7c4a22', [0, 3.35, .1], [8.6, .16, 3.8], [-.18, 0, 0]));
    p.push(B('#a16207', [4.6, .45, 1.6], [.9, .1, 2.4], [-.35, 0, 0]));
    for (const [x, z] of [[-5, 1.4], [-5.2, .2], [-4.8, -1]]) p.push(CY('#f2c14e', [x, .45, z], [.45, .9, .45], [0, 0, Math.PI / 2]));
  } else {
    /* la ruine : des planches tombées, un toit à moitié parti */
    const r = hasard('clapier');
    for (const x of [-3.7, 1.2, 3.7]) p.push(B('#6b4a2b', [x, .4, -1.3], [.25, .8, .25], [0, 0, (r() - .5) * .5]));
    p.push(B('#a0764a', [-1, 1.2, -1.2], [5, 1.4, .2], [0, 0, .12]), B('#a0764a', [2.8, .9, 0], [.2, 1.1, 2.6], [.2, 0, 0]));
    p.push(B('#6b4a2b', [-1.5, 2.3, -.4], [4.8, .14, 2.6], [-.3, .1, .2]));
    for (let k = 0; k < 7; k++) p.push(B('#a0764a', [(r() - .5) * 7, .06, (r() - .5) * 3 + 1.5], [1.6, .08, .26], [0, r() * 3, 0]));
    for (let k = 0; k < 6; k++) p.push(CO('#65a30d', [(r() - .5) * 8, .3, (r() - .5) * 3], [.2, .6, .2]));
  }
  const g = construire(p, f);
  const ban = pancarte(repare ? '🐾 Le Clapier à dindes' : '🚧 Le Clapier (en ruine)', 3.2, .62); ban.position.set(0, repare ? 3.6 : 1.9, repare ? 1.75 : .2); g.add(ban);
  return { g, obst: [[0, 0, 8.6, 3.6]], porte: [0, 2.9] };
}

/* ── un enclos d'habitat (construit ou en ruine) ──
   w × d, ouverture du côté « porte » ('e' ou 'o'), au milieu */
const HABITATS = {
  prairie: { sol: '#a3dc7c', barriere: '#fff3dc' }, pluie: { sol: '#9ec9a0', barriere: '#cbd5e1' }, feu: { sol: '#78716c', barriere: '#57534e' },
  sable: { sol: '#f3d38a', barriere: '#e9c27a' }, jungle: { sol: '#4ade80', barriere: '#a3e635' }, glace: { sol: '#f1f5f9', barriere: '#bae6fd' },
  nuit: { sol: '#5b21b6', barriere: '#7c3aed' }, ciel: { sol: '#e0f2fe', barriere: '#93c5fd' }
};
export function enclos(type, construit, w = 10, d = 7.5, cote = 'e') {
  const H = HABITATS[type], T0 = TYPES[type], p = [], f = [], r = hasard('enclos' + type);
  const sx = cote === 'e' ? 1 : -1;
  if (construit) {
    p.push(B(H.sol, [0, .03, 0], [w - .2, .06, d - .2]));
    /* la barrière, avec une ouverture côté allée */
    const poteau = (x, z) => p.push(B(assombrir(H.barriere, .15), [x, .6, z], [.18, 1.2, .18]), SP(H.barriere, [x, 1.25, z], .12));
    const rail = (x1, z1, x2, z2) => { const L = Math.hypot(x2 - x1, z2 - z1), an = Math.atan2(x2 - x1, z2 - z1); for (const y of [.45, .95]) p.push(B(H.barriere, [(x1 + x2) / 2, y, (z1 + z2) / 2], [.1, .12, L], [0, an, 0])); };
    const W = w / 2, D = d / 2, ouv = 1.2;
    [[-W, -D], [W, -D], [-W, D], [W, D], [sx * W, -ouv], [sx * W, ouv], [0, -D], [0, D], [-sx * W, 0]].forEach(([x, z]) => poteau(x, z));
    rail(-W, -D, W, -D); rail(-W, D, W, D); rail(-sx * W, -D, -sx * W, D); rail(sx * W, -D, sx * W, -ouv); rail(sx * W, ouv, sx * W, D);
    /* l'abri au fond, la mangeoire près de l'entrée */
    const ax = -sx * (W - 1.6), az = -D + 1.3;
    p.push(B(eclaircir(H.barriere, .1), [ax, .8, az], [2.2, 1.6, 1.8]), T(assombrir(T0.couleur, .15), [ax, 1.6, az], [2.6, 1.1, 2.2], [0, Math.PI / 2, 0]), B('#3f2a1d', [ax, .55, az + .91], [.8, 1.1, .06]));
    p.push(B('#8a5a3c', [sx * (W - 1.4), .3, D - 1.2], [1.6, .5, .6]), B('#f2c14e', [sx * (W - 1.4), .52, D - 1.2], [1.4, .1, .45]));
    /* le décor de l'habitat */
    const deco = {
      prairie: () => { for (let k = 0; k < 14; k++) p.push(SP(['#f472b6', '#fde047', '#ffffff'][k % 3], [(r() - .5) * (w - 2), .12, (r() - .5) * (d - 2)], .1)); },
      pluie: () => { p.push(CY('#60a5fa', [sx * 1, .05, -.5], [1.6, .06, 1.1], [0, 0, 0], 24), CY('#86efac', [sx * 1.6, .1, -.2], [.25, .04, .25])); },
      feu: () => { for (let k = 0; k < 6; k++) p.push(SP(k % 2 ? '#f97316' : '#292524', [(r() - .5) * (w - 3), .15, (r() - .5) * (d - 3)], [.3, .2, .3])); },
      sable: () => { p.push(CY('#4d7c0f', [sx * 1.5, .7, -1], [.22, 1.4, .22]), CY('#4d7c0f', [sx * 1.85, .9, -1], [.12, .6, .12], [0, 0, -.8])); for (let k = 0; k < 3; k++) p.push(SP('#fbbf24', [(r() - .5) * (w - 3), .05, (r() - .5) * (d - 3)], [1.1, .25, .9])); },
      jungle: () => { p.push(CY('#92400e', [sx * 1.6, 1.3, -1.2], [.15, 2.6, .15])); for (let k = 0; k < 5; k++) p.push(SP('#16a34a', [sx * 1.6 + Math.cos(k * 1.26) * .7, 2.6, -1.2 + Math.sin(k * 1.26) * .7], [.8, .12, .3], [0, k * 1.26, -.3])); },
      glace: () => { for (let k = 0; k < 4; k++) p.push(B('#bae6fd', [(r() - .5) * (w - 3), .3, (r() - .5) * (d - 3)], [.6, .6, .6], [0, r() * 3, 0])); },
      nuit: () => { for (let k = 0; k < 5; k++) { const x = (r() - .5) * (w - 3), z = (r() - .5) * (d - 3); p.push(CY('#f5f5f4', [x, .15, z], [.06, .3, .06])); f.push(DS('#a78bfa', [x, .3, z], [.2, .14, .2])); } },
      ciel: () => { for (let k = 0; k < 3; k++) { const x = (r() - .5) * (w - 3), z = (r() - .5) * (d - 3); p.push(SP('#ffffff', [x, .3, z], [.6, .3, .45]), SP('#ffffff', [x + .45, .35, z], .3)); } }
    }[type];
    deco && deco();
  } else {
    p.push(B('#c9b38f', [0, .02, 0], [w - 1, .04, d - 1]));
    for (let k = 0; k < 7; k++) { const an = k / 7 * Math.PI * 2; p.push(B('#8b7355', [Math.cos(an) * w * .45, .35, Math.sin(an) * d * .45], [.16, .7 * (.5 + r() * .5), .16], [(r() - .5) * .6, 0, (r() - .5) * .6])); }
    for (let k = 0; k < 4; k++) p.push(B('#a0764a', [(r() - .5) * w * .7, .05, (r() - .5) * d * .7], [1.4, .06, .14], [0, r() * 3, 0]));
    for (let k = 0; k < 10; k++) p.push(CO('#65a30d', [(r() - .5) * (w - 1), .25, (r() - .5) * (d - 1)], [.18, .5, .18]));
  }
  const g = construire(p, f, .03);
  /* la pancarte de l'habitat, à l'entrée */
  const pq = pancarte(construit ? `${T0.e} ${majuscule(T0.habitat)}` : `🚧 ${majuscule(T0.habitat)}`, 2.6, .6, construit ? {} : { fond: '#f5f5f4', encre: '#57534e', bord: '#a8a29e' });
  pq.position.set(sx * (w / 2 + .1), 1.6, -1.9); pq.rotation.y = sx * Math.PI / 2; g.add(pq);
  const poteaux = construire([B('#8a5a3c', [sx * (w / 2 + .1), .8, -1.9], [.12, 1.6, .12])], [], .02); g.add(poteaux);
  const obst = construit ? [[0, -d / 2, w, .4], [0, d / 2, w, .4], [-sx * w / 2, 0, .4, d], [sx * w / 2, -(d / 4 + .6), .4, d / 2 - 1.2], [sx * w / 2, d / 4 + .6, .4, d / 2 - 1.2]] : [];
  return { g, obst, porte: [sx * (w / 2 + 1.1), 0], interieur: [w - 1.4, d - 1.4] };
}
const majuscule = s => s.charAt(0).toUpperCase() + s.slice(1);

/* ── une ruine « bientôt » (Couvoir, Nurserie, Moulin…) ── */
export function ruine(texte, w = 6, d = 5, moulin = false) {
  const p = [], r = hasard(texte);
  p.push(B('#d6d3d1', [0, .1, 0], [w, .2, d]));
  for (let k = 0; k < 4; k++) { const cote = k % 2, s = k < 2 ? -1 : 1; p.push(B('#e7e5e4', cote ? [s * w / 2, .6 + r() * .4, 0] : [0, .6 + r() * .4, s * d / 2], cote ? [.3, 1 + r() * 1.6, d * (.5 + r() * .4)] : [w * (.4 + r() * .4), 1 + r() * 1.4, .3])); }
  for (let k = 0; k < 6; k++) p.push(B('#a8a29e', [(r() - .5) * w, .15, (r() - .5) * d], [.4 + r() * .4, .3, .3 + r() * .3], [0, r() * 3, 0]));
  /* un échafaudage */
  for (const [x, z] of [[-w / 2 - .5, d / 2 + .3], [-w / 2 - .5 + 1.6, d / 2 + .3]]) p.push(CY('#ca8a04', [x, 1.4, z], [.06, 2.8, .06]));
  p.push(B('#a16207', [-w / 2 + .3, 1.6, d / 2 + .3], [1.8, .08, .5]), B('#a16207', [-w / 2 + .3, 2.6, d / 2 + .3], [1.8, .08, .5]));
  if (moulin) { p.push(CY('#e7e5e4', [0, 2.5, 0], [1.4, 5, 1.6], [0, 0, 0], 12), CO('#92400e', [0, 5.6, 0], [1.6, 1.4, 1.6])); }
  const g = construire(p, [], .03);
  const pq = pancarte('🚧 ' + texte, 2.8, .7, { fond: '#fef3c7', encre: '#92400e', bord: '#f59e0b' }); pq.position.set(1.2, 1.4, d / 2 + .6); g.add(pq);
  g.add(construire([B('#8a5a3c', [1.2, .6, d / 2 + .55], [.12, 1.2, .12])], [], .02));
  return { g, obst: [[0, 0, w + .4, d + .4], [-w / 2 + .3, d / 2 + .3, 2.2, .8]], porte: [1.2, d / 2 + 1.6] };
}

/* ── le portail du Dindodrome (fermé pour l'instant) ── */
export function portailDindodrome() {
  const p = [];
  for (const s of [-1, 1]) {
    for (let k = 0; k < 6; k++) p.push(B(k % 2 ? '#111827' : '#f8fafc', [s * 3.2, .55 + k * .8, 0], [1.2, .8, 1.2]));
    p.push(CO('#ef4444', [s * 3.2, 5.4, 0], [.9, 1, .9], [0, Math.PI / 4, 0], 4), CY('#6b7280', [s * 3.2, 6.6, 0], [.04, 1.6, .04]), B('#ef4444', [s * 3.2 + .35, 7.1, 0], [.7, .45, .04]));
  }
  p.push(B('#f59e0b', [0, 4.6, 0], [5.4, .9, .9]));
  p.push(B('#8a5a3c', [-1.25, 1.5, 0], [2.4, 3, .2]), B('#8a5a3c', [1.25, 1.5, 0], [2.4, 3, .2]));
  for (const x of [-1.25, 1.25]) for (const y of [.6, 1.5, 2.4]) p.push(B('#6b3a1e', [x, y, .12], [2.3, .14, .06]));
  p.push(B('#facc15', [0, 1.6, .16], [.6, .5, .1]));
  for (const s of [-1, 1]) for (let k = 1; k < 5; k++) p.push(B('#fff3dc', [s * (3.2 + k * 1.6), .5, 0], [.15, 1, .15]), B('#fff3dc', [s * (3.2 + k * 1.6 - .8), .7, 0], [1.6, .12, .1]));
  const g = construire(p, []);
  const ban = pancarte('🏁 DINDODROME', 5, .8, { fond: '#111827', encre: '#facc15', bord: '#f59e0b' }); ban.position.set(0, 4.6, .48); g.add(ban);
  const bientot = pancarte('Ouverture bientôt !', 2.4, .5, { fond: '#fef3c7', encre: '#b91c1c', bord: '#ef4444' }); bientot.position.set(0, 2.5, .25); g.add(bientot);
  return { g, obst: [[0, 0, 19, 1.4]], porte: [0, 1.8] };
}

/* ── le port : le ponton, le phare et la montgolfière ── */
export function port() {
  const p = [], f = [];
  /* le ponton */
  p.push(B('#a0764a', [0, .15, 4], [3, .16, 12]));
  for (let k = 0; k < 12; k++) p.push(B(k % 2 ? '#8a5a3c' : '#a0764a', [0, .25, -1.5 + k], [3.1, .04, .9]));
  for (const x of [-1.5, 1.5]) for (let k = 0; k < 4; k++) p.push(CY('#6b3a1e', [x, .2, -1 + k * 3.4], [.16, 1.6, .16]));
  /* le phare */
  for (let k = 0; k < 5; k++) p.push(CY(k % 2 ? '#ffffff' : '#ef4444', [-7, .6 + k * 1.1, 4], [1.1 - k * .1, 1.1, 1.1 - k * .1], [0, 0, 0], 18));
  p.push(CY('#1f2937', [-7, 6.2, 4], [.75, .2, .75]), CO('#ef4444', [-7, 7.4, 4], [.75, .8, .75], [0, 0, 0], 18));
  f.push(CY('#fff7d6', [-7, 6.7, 4], [.55, .8, .55], [0, 0, 0], 14));
  /* la plateforme de la montgolfière */
  p.push(CY('#a0764a', [6, .2, -2], [2.6, .4, 2.6], [0, 0, 0], 24), CY('#8a5a3c', [6, .42, -2], [2.7, .06, 2.7], [0, 0, 0], 24));
  const g = construire(p, f);
  /* la montgolfière : dégonflée d'abord, puis gonflée */
  const ballon = new THREE.Group(); ballon.position.set(6, .45, -2); g.add(ballon);
  const panier = construire([CY('#b07a45', [0, .45, 0], [.85, .9, .85], [0, 0, 0], 16), TO('#8a5a3c', [0, .9, 0], [.86, .86, .86], [Math.PI / 2, 0, 0], .08)], []);
  ballon.add(panier);
  const gores = [];
  for (let k = 0; k < 10; k++) gores.push({ g: new THREE.SphereGeometry(1, 3, 16, k / 10 * Math.PI * 2, Math.PI * 2 / 10), c: k % 2 ? '#facc15' : '#ef4444', p: [0, 0, 0], s: 1 });
  const geoB = fusion(gores); aJeter.push(geoB);
  const enveloppe = new THREE.Mesh(geoB, toon()); enveloppe.castShadow = true;
  const envC = new THREE.Mesh(geoB, contourPour(geoB, .02));
  const env = new THREE.Group(); env.add(envC, enveloppe); ballon.add(env);
  const cordes = construire([0, 1, 2, 3].map(k => CY('#78716c', [Math.cos(k * 1.57) * .7, 2.2, Math.sin(k * 1.57) * .7], [.025, 2.7, .025], [Math.sin(k * 1.57) * .25, 0, -Math.cos(k * 1.57) * .25])), [], 0);
  ballon.add(cordes);
  let gonfle = false;
  const setGonfle = v => {
    gonfle = v; cordes.visible = v;
    if (v) { env.scale.set(2.3, 2.7, 2.3); env.position.set(0, 5.4, 0); env.rotation.set(0, 0, 0); }
    else { env.scale.set(1.9, .5, 1.6); env.position.set(.6, .35, .4); env.rotation.set(.2, 0, .3); }
  };
  setGonfle(false);
  return {
    g, obst: [[6, -2, 5.4, 5.4], [-7, 4, 2.4, 2.4]], porte: [3.2, -2.5], ponton: [[0, 4, 3, 12]],
    setGonfle, maj: (dt, t) => { if (gonfle) { ballon.position.y = .45 + Math.sin(t * 1.2) * .08; env.rotation.y = Math.sin(t * .4) * .05; } }
  };
}

/* ── la fontaine de la place (avec ses jets d'eau) ── */
export function fontaine() {
  const p = [];
  p.push(CY('#d6d3d1', [0, .3, 0], [2.1, .6, 2.1], [0, 0, 0], 28), CY('#e7e5e4', [0, .62, 0], [2.2, .08, 2.2], [0, 0, 0], 28));
  p.push(CY('#60a5fa', [0, .5, 0], [1.85, .1, 1.85], [0, 0, 0], 28));
  p.push(CY('#d6d3d1', [0, 1.2, 0], [.25, 1.4, .25]), CY('#e7e5e4', [0, 1.95, 0], [.9, .2, .9], [0, 0, 0], 20), CY('#60a5fa', [0, 2.02, 0], [.75, .06, .75], [0, 0, 0], 20));
  p.push(SP('#facc15', [0, 2.35, 0], [.24, .22, .26]), SP('#facc15', [0, 2.62, .12], .13));
  const g = construire(p, []);
  const n = 70, pos = new Float32Array(n * 3), etat = Array.from({ length: n }, (_, i) => [Math.random() * 1.2, i / n * Math.PI * 2]);
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const jets = new THREE.Points(geo, new THREE.PointsMaterial({ color: '#dbeafe', size: .13, map: texRonde(), transparent: true, depthWrite: false })); g.add(jets);
  return {
    g, obst: [[0, 0, 4.6, 4.6]], porte: [0, 3],
    maj: (dt) => {
      etat.forEach((e, i) => { e[0] += dt; if (e[0] > 1.2) e[0] -= 1.2; const k = e[0], r = .2 + k * .55; pos.set([Math.cos(e[1]) * r, 2.6 + k * 1.6 - k * k * 2.6, Math.sin(e[1]) * r], i * 3); });
      geo.attributes.position.needsUpdate = true;
    }
  };
}

/* ── les petits objets de la place ── */
export function panneauQuetes() {
  const g = construire([B('#8a5a3c', [-.9, .9, 0], [.14, 1.8, .14]), B('#8a5a3c', [.9, .9, 0], [.14, 1.8, .14]), B('#b07a45', [0, 1.45, 0], [2.2, 1.1, .12]),
    B('#fef9c3', [-.5, 1.5, .08], [.6, .7, .02], [0, 0, .08]), B('#fce7f3', [.35, 1.4, .08], [.55, .6, .02], [0, 0, -.1]), SP('#ef4444', [-.5, 1.8, .1], .04), SP('#ef4444', [.35, 1.68, .1], .04)], []);
  const t = pancarte('📜 Quêtes', 1.4, .4); t.position.set(0, 2.15, .08); g.add(t);
  return { g, obst: [[0, 0, 2.4, .6]], porte: [0, 1.2] };
}
export function boiteAuxLettres() {
  const g = construire([B('#8a5a3c', [0, .55, 0], [.12, 1.1, .12]), B('#ef4444', [0, 1.2, 0], [.45, .4, .6]), DS('#ef4444', [0, 1.4, 0], [.225, .15, .3], [0, 0, 0]),
    B('#facc15', [.26, 1.35, -.1], [.04, .35, .08]), B('#facc15', [.26, 1.5, -.2], [.04, .1, .2])], []);
  return { g, obst: [[0, 0, .6, .7]], porte: [0, .9] };
}
export function banc() {
  return { g: construire([B('#a0764a', [0, .5, 0], [1.8, .08, .5]), B('#a0764a', [0, .85, -.22], [1.8, .4, .08]), B('#374151', [-.75, .25, 0], [.08, .5, .45]), B('#374151', [.75, .25, 0], [.08, .5, .45])], []), obst: [[0, 0, 1.9, .7]] };
}
export function panneauIndicateur(fleches) {
  const g = construire([B('#8a5a3c', [0, 1.2, 0], [.14, 2.4, .14])], []);
  fleches.forEach(([texte, angle], i) => { const t = pancarte(texte, 1.8, .42, { taille: 90 }); t.position.set(0, 2.1 - i * .48, 0); t.rotation.y = angle; t.position.x = Math.sin(angle) * .02; g.add(t); });
  return { g, obst: [[0, 0, .4, .4]] };
}
/* une pile de planches à ramasser (elle brille et flotte) */
export function objetQuete(sorte) {
  const parts = sorte === 'corde' ? [TO('#d6a35a', [0, .3, 0], [.35, .35, .35], [Math.PI / 2, 0, 0], .3), TO('#c08a3e', [0, .45, 0], [.3, .3, .3], [Math.PI / 2, 0, 0], .3)]
    : [B('#c2884e', [0, .2, 0], [1.4, .14, .3], [0, .3, 0]), B('#a0764a', [0, .36, 0], [1.4, .14, .3], [0, -.2, 0]), B('#c2884e', [0, .52, 0], [1.4, .14, .3], [0, .1, 0])];
  const g = construire(parts, [], .025);
  const l = new THREE.Sprite(new THREE.SpriteMaterial({ map: texRonde(), color: '#fff3b0', transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: .8 }));
  l.scale.setScalar(2); l.position.y = .4; g.add(l);
  return { g, maj: (dt, t) => { g.children[0].position.y = Math.sin(t * 2.5) * .08; g.rotation.y = t * .6; l.material.opacity = .5 + Math.sin(t * 3) * .3; } };
}
export const libererBatiments = () => { aJeter.forEach(g => g.dispose()); aJeter.length = 0; };

/* ── le Couvoir : une hutte ronde au toit de paille, 2 couveuses (des cloches de verre chauffées) et le nid ── */
export function couvoir() {
  const p = [], f = [];
  p.push(CY('#fde7c4', [0, 1.3, 0], [2.6, 2.6, 2.6], [0, 0, 0], 24), CY('#e7c9a0', [0, .12, 0], [2.75, .24, 2.75], [0, 0, 0], 24));
  p.push(CO('#d4a24c', [0, 3.6, 0], [3.3, 2.4, 3.3], [0, 0, 0], 24), CY('#b45309', [0, 2.62, 0], [3.25, .14, 3.25], [0, 0, 0], 24));
  p.push(SP('#fef3c7', [0, 5.1, 0], [.42, .56, .42]), SP('#f472b6', [.2, 5.2, .32], .09), SP('#60a5fa', [-.25, 5, .28], .08), SP('#a3e635', [.05, 5.45, .3], .07));
  p.push(B('#7c4a22', [0, 1.05, 2.56], [1.3, 2.1, .12]), TO('#b45309', [0, 2.1, 2.58], [.65, .65, .65], [0, 0, 0], .14, Math.PI), SP('#facc15', [.4, 1, 2.65], .06));
  for (const a of [-1.1, 1.1]) { const x = Math.sin(a) * 2.6, z = Math.cos(a) * 2.6; p.push(TO('#b45309', [x, 1.6, z], [.42, .42, .42], [0, a, 0], .22)); f.push(CY('#bfe3ff', [x, 1.6, z], [.4, .06, .4], [Math.PI / 2, 0, -a], 18)); }
  const g = construire(p, f);
  const t = pancarte('🥚 Le Couvoir', 2.2, .5, { fond: '#fffbeb', encre: '#9a3412', bord: '#f59e0b' }); t.position.set(0, 2.55, 2.75); g.add(t);
  /* les deux couveuses, de chaque côté de la porte */
  const couveuses = [-2.4, 2.4].map(x => {
    const c = new THREE.Group(); c.position.set(x, 0, 3.1); g.add(c);
    c.add(construire([CY('#a0764a', [0, .35, 0], [.55, .7, .55], [0, 0, 0], 16), CY('#facc15', [0, .72, 0], [.6, .06, .6], [0, 0, 0], 16), CY('#fef3c7', [0, .76, 0], [.45, .04, .45], [0, 0, 0], 16),
      CY('#57534e', [.45, 1.3, -.3], [.03, 1.2, .03]), B('#57534e', [.25, 1.88, -.15], [.45, .04, .04], [0, -.5, 0]), CO('#dc2626', [0, 1.75, 0], [.2, .22, .2], [0, 0, 0], 12)], [], .02));
    const cloche = new THREE.Mesh(demiSphere(20, 10), new THREE.MeshToonMaterial({ gradientMap: TONS, color: '#e0f2fe', transparent: true, opacity: .32, depthWrite: false }));
    cloche.scale.set(.48, .62, .48); cloche.position.y = .76; c.add(cloche);
    const chaleur = new THREE.Sprite(new THREE.SpriteMaterial({ map: texRonde(), color: '#fb923c', transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: .5 }));
    chaleur.scale.setScalar(1.4); chaleur.position.y = 1.15; c.add(chaleur);
    const place = new THREE.Group(); place.position.y = .8; c.add(place);
    return { c, place, chaleur, oeuf: null, cle: null };
  });
  /* le nid */
  const brins = Array.from({ length: 9 }, (_, k) => B('#d6a35a', [Math.cos(k * .7) * .72, .32, Math.sin(k * .7) * .72], [.04, .04, .55], [0, k * .7 + .6, .2]));
  const nid = construire([TO('#c08a3e', [0, .18, 0], [.75, .75, .5], [Math.PI / 2, 0, 0], .4), CY('#a16207', [0, .1, 0], [.6, .1, .6], [0, 0, 0], 16), ...brins], [], .02);
  nid.position.set(3.9, 0, .8); g.add(nid);
  /* un œuf dans une couveuse (ses couleurs viennent de ses parents) ; pret = il brille et tremble */
  const majOeufs = (oeufs, pret) => couveuses.forEach((C, i) => {
    const o = oeufs[i], cle = o ? o.id : null;
    if (cle !== C.cle) {
      if (C.oeuf) { C.place.remove(C.oeuf); C.oeuf.traverse(m => m.geometry && !m.geometry.parameters && m.geometry.dispose()); }
      C.oeuf = o ? construire([SP('#fef9ec', [0, .28, 0], [.22, .29, .22]), SP(o.couleurs[0], [.12, .36, .13], .055), SP(o.couleurs[1], [-.13, .24, .12], .05), SP(o.couleurs[0], [.02, .45, -.15], .045), SP(o.couleurs[1], [-.1, .4, -.1], .04)], [], .015) : null;
      if (C.oeuf) C.place.add(C.oeuf);
      C.cle = cle;
    }
    C.pret = o && pret(o);
  });
  return {
    g, obst: [[0, 0, 5.6, 5.6], [-2.4, 3.1, 1.3, 1.3], [2.4, 3.1, 1.3, 1.3], [3.9, .8, 1.6, 1.6]], porte: [0, 4.6], majOeufs,
    maj: (dt, t) => couveuses.forEach((C, i) => {
      C.chaleur.material.opacity = C.oeuf ? (C.pret ? .55 + Math.sin(t * 6) * .3 : .45 + Math.sin(t * 2 + i) * .1) : .15;
      if (C.oeuf) C.oeuf.rotation.z = C.pret ? Math.sin(t * 14) * .12 * (Math.sin(t * 2) > 0 ? 1 : 0) : Math.sin(t * 1.5 + i) * .03;
    })
  };
}

/* ── la Nurserie : une maison toute douce, et sa petite cour où jouent les bébés ── */
export function nurserie() {
  const p = [], f = [];
  p.push(B('#fbcfe8', [0, 1.4, -1.6], [4.6, 2.8, 3.4]), T('#93c5fd', [0, 2.8, -1.6], [5.2, 1.9, 3.9]), B('#f9a8d4', [0, .12, -1.6], [4.8, .24, 3.6]));
  p.push(B('#fde68a', [0, 1.05, .12], [1.1, 2.1, .1]), SP('#f472b6', [0, 1.55, .19], [.16, .14, .05]), SP('#facc15', [.35, 1, .2], .05));
  for (const x of [-1.5, 1.5]) fenetre(p, f, x, 1.6, .12, .8, .8, '#f472b6');
  /* la petite cour : une barrière blanche (ouverte devant), un bac à sable, un toboggan, un ballon */
  const W = 6.4, D = 4.4, cz = 2.6;
  /* la barrière : une ouverture devant (pour entrer) et derrière (la porte de la maison) */
  for (let k = 0; k <= 12; k++) { const x = -W / 2 + k * W / 12; if (Math.abs(x) > .9) p.push(B('#fff7ed', [x, .35, cz + D / 2], [.1, .7, .1]), B('#fff7ed', [x, .35, cz - D / 2 + .05], [.1, .7, .1])); }
  for (let k = 0; k <= 8; k++) { const z = cz - D / 2 + k * D / 8; p.push(B('#fff7ed', [-W / 2, .35, z], [.1, .7, .1]), B('#fff7ed', [W / 2, .35, z], [.1, .7, .1])); }
  for (const s of [-1, 1]) p.push(B('#fde68a', [s * (W / 4 + .45), .5, cz + D / 2], [W / 2 - .9, .08, .05]), B('#fde68a', [s * (W / 4 + .45), .5, cz - D / 2 + .05], [W / 2 - .9, .08, .05]));
  p.push(B('#fde68a', [-W / 2, .5, cz], [.05, .08, D]), B('#fde68a', [W / 2, .5, cz], [.05, .08, D]));
  p.push(B('#fcd34d', [-2, .1, cz + 1], [1.6, .2, 1.2]), B('#a16207', [-2, .16, cz + 1], [1.8, .12, .08], [0, 0, 0]));
  p.push(B('#60a5fa', [2, .5, cz - .8], [.5, 1, .5]), B('#f472b6', [2, .45, cz + .1], [.45, .06, 1.6], [.55, 0, 0]), B('#fde047', [2, .75, cz - 1.15], [.08, .5, .08]));
  p.push(SP('#ef4444', [.9, .2, cz + 1.4], .2), SP('#ffffff', [.95, .25, cz + 1.5], .07));
  const g = construire(p, f, .03);
  const t = pancarte('🍼 La Nurserie', 2.4, .5, { fond: '#fdf2f8', encre: '#9d174d', bord: '#f472b6' }); t.position.set(0, 2.55, .2); g.add(t);
  return {
    g, porte: [0, cz + D / 2 + 1.4], cour: { x: 0, z: cz, w: W - 1, d: D - 1 },
    obst: [[0, -1.6, 5, 3.8], [-W / 2, cz, .3, D], [W / 2, cz, .3, D], [-W / 4 - .45, cz + D / 2, W / 2 - .9, .3], [W / 4 + .45, cz + D / 2, W / 2 - .9, .3],
      [-W / 4 - .45, cz - D / 2, W / 2 - .9, .3], [W / 4 + .45, cz - D / 2, W / 2 - .9, .3], [-2, cz + 1, 1.8, 1.4], [2, cz - .5, .8, 2.2]]
  };
}
