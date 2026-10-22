/* ══════════ LE DINDODROME : UN LIEU, COMME LES ÎLES ══════════
   Au bout de la route de l'Est. Une piste en anneau de 200 m (6 couloirs), les tribunes et leur public,
   la ligne d'arrivée sous son portique, le tableau d'affichage, le podium, et sur la place :
   le Bureau des courses (Monsieur Chrono), la Salle des trophées et le portail pour rentrer au Domaine.
   construireDindodrome() → un « lieu » ({ racine, grille, interactifs, pnj, sol, maj, liberer, … })
   avec en plus : piste (preparer une course : sol, haies, zones), foule (le public qui s'agite), tableau, podium. */
import * as THREE from 'three';
import { creerGrille } from './carte.js';
import { creerIle, construireSol } from './ile.js';
import { construireLampes, construireNuit } from './decor.js';
import { B, CY, CO, SP, TO, construire, pancarte, panneau } from './fabrique.js';
import { sphere } from '../moteur/formes.js';
import { toon, TONS } from '../moteur/materiaux.js';
import { libererGroupe } from '../moteur/liberer.js';
import { matFenetres } from './batiments.js';
import { creerChibi, PERSONNAGES } from '../personnages/chibi.js';
import { hasard } from '../moteur/couleurs.js';
import { semer, dessinerFeuillus, dessinerPins, dessinerBuissons, dessinerFleurs, dessinerHerbes, dessinerPalmiers } from './nature.js';
import { TOUR, PISTES } from '../donnees/courses.js';
import { TYPES, ORDRE_TYPES } from '../donnees/types.js';

/* ── la piste : deux lignes droites et deux virages ── */
export const RAYON = 16, DROITE = (TOUR - 2 * Math.PI * RAYON) / 2, CZ = -6, LARGEUR = 8.2, COULOIR = 1.25;
export const couloir = k => (k - 2.5) * COULOIR;
/* le point de l'anneau à u mètres après la ligne d'arrivée (dans le sens de la course), décalé de o vers l'extérieur */
export function pointPiste(u, o = 0) {
  u = ((u % TOUR) + TOUR) % TOUR;
  const a = DROITE / 2, b = a + Math.PI * RAYON, c = b + DROITE, d = c + Math.PI * RAYON, r = RAYON + o;
  if (u < a) return { x: -u, z: CZ - r, dx: -1, dz: 0 };
  if (u < b) { const f = (u - a) / RAYON; return { x: -a - r * Math.sin(f), z: CZ - r * Math.cos(f), dx: -Math.cos(f), dz: Math.sin(f) }; }
  if (u < c) return { x: -a + (u - b), z: CZ + r, dx: 1, dz: 0 };
  if (u < d) { const f = (u - c) / RAYON; return { x: a + r * Math.sin(f), z: CZ + r * Math.cos(f), dx: Math.cos(f), dz: -Math.sin(f) }; }
  return { x: a - (u - d), z: CZ - r, dx: -1, dz: 0 };
}
/* est-on sur l'anneau (pour ne pas y planter d'arbre) ? */
function surAnneau(x, z, marge = 0) {
  const a = DROITE / 2, ax = Math.max(0, Math.abs(x) - a), d = Math.hypot(ax, z - CZ);
  return d > RAYON - LARGEUR / 2 - marge && d < RAYON + LARGEUR / 2 + marge;
}
const dansStade = (x, z) => Math.abs(x) < DROITE / 2 + RAYON + 9 && z > -40 && z < 23;

/* un ruban posé le long de l'anneau, entre les décalages o0 et o1 */
function ruban(o0, o1, y, u0 = 0, u1 = TOUR, pas = .5) {
  const n = Math.max(2, Math.ceil((u1 - u0) / pas)), pos = [], uv = [], idx = [];
  for (let i = 0; i <= n; i++) {
    const u = u0 + (u1 - u0) * i / n, A = pointPiste(u, o0), Bp = pointPiste(u, o1);
    pos.push(A.x, y, A.z, Bp.x, y, Bp.z); uv.push(u / 4, 0, u / 4, 1);
    if (i < n) { const k = i * 2; idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2); }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx); g.computeVertexNormals();
  return g;
}
/* la texture du damier (ligne d'arrivée) */
function texDamier() {
  const c = document.createElement('canvas'); c.width = 64; c.height = 512; const x = c.getContext('2d');
  for (let j = 0; j < 16; j++) for (let i = 0; i < 2; i++) { x.fillStyle = (i + j) % 2 ? '#111827' : '#ffffff'; x.fillRect(i * 32, j * 32, 32, 32); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

/* ── les obstacles d'une piste (dans le repère local : x en travers, z dans le sens de la course) ── */
function obstacle(sorte) {
  const p = [];
  if (sorte === 'haie') for (let k = 0; k < 6; k++) {
    const o = couloir(k);
    p.push(CY('#f8fafc', [o - .52, .3, 0], [.035, .6, .035]), CY('#f8fafc', [o + .52, .3, 0], [.035, .6, .035]), B('#d1d5db', [o, .03, 0], [1.1, .06, .18]));
    for (let s = 0; s < 4; s++) p.push(B(s % 2 ? '#ef4444' : '#ffffff', [o - .41 + s * .275, .58, 0], [.275, .13, .05]));
  }
  if (sorte === 'foin') for (let k = 0; k < 3; k++) {
    const o = -2.5 + k * 2.5;
    p.push(CY('#e9c46a', [o, .34, 0], [.36, 2.3, .36], [0, 0, Math.PI / 2], 14), CY('#c99a3b', [o - .6, .34, 0], [.37, .08, .37], [0, 0, Math.PI / 2], 14), CY('#c99a3b', [o + .6, .34, 0], [.37, .08, .37], [0, 0, Math.PI / 2], 14));
  }
  if (sorte === 'dune') {
    p.push(SP('#efd08f', [0, 0, 0], [LARGEUR / 2, .5, .9]));
    for (let k = 0; k < 5; k++) p.push(CO('#84a83b', [-3 + k * 1.5, .5, (k % 2 - .5) * .4], [.12, .3, .12], [0, 0, 0], 5));
  }
  if (sorte === 'tronc') {
    p.push(CY('#8a5a3c', [0, .32, 0], [.32, LARGEUR - .3, .32], [0, 0, Math.PI / 2], 14));
    for (const s of [-1, 1]) p.push(CY('#e2c08d', [s * (LARGEUR / 2 - .14), .32, 0], [.26, .03, .26], [0, 0, Math.PI / 2], 14));
    for (let k = 0; k < 4; k++) p.push(SP('#4d7c0f', [-2.8 + k * 1.9, .62, .05], [.22, .12, .2]));
  }
  if (sorte === 'congere') {
    p.push(SP('#f8fafc', [0, 0, 0], [LARGEUR / 2, .55, .85]));
    for (let k = 0; k < 4; k++) p.push(CO('#bae6fd', [-3 + k * 2, .45, (k % 2 - .5) * .5], [.18, .5, .18], [0, 0, 0], 6));
  }
  if (sorte === 'rocher') for (let k = 0; k < 4; k++) {
    const o = -2.7 + k * 1.8;
    p.push(SP(k % 2 ? '#292524' : '#44403c', [o, .3, 0], [.75, .45, .5]), SP('#f97316', [o + .2, .5, .3], [.12, .06, .04]));
  }
  if (sorte === 'champignons') for (let k = 0; k < 5; k++) {
    const o = -3 + k * 1.5;
    p.push(CY('#f5f3ff', [o, .25, 0], [.1, .5, .1]), SP(['#a78bfa', '#60a5fa', '#f472b6'][k % 3], [o, .55, 0], [.42, .22, .42]));
  }
  if (sorte === 'nuage') for (let k = 0; k < 6; k++) p.push(SP(k % 2 ? '#ffffff' : '#e0f2fe', [-3.2 + k * 1.3, .35 + (k % 2) * .15, (k % 3 - 1) * .2], [.75, .45, .6]));
  return construire(p, [], .025);
}

/* ── les tribunes et leur public (deux dessins pour tout le monde) ── */
const HABITS = ['#ef4444', '#f97316', '#facc15', '#22c55e', '#3b82f6', '#a855f7', '#ec4899', '#14b8a6', '#f8fafc', '#1f2937'];
const PEAUX = ['#f6c9a0', '#e8b48f', '#c98b65', '#8d5a3b', '#f2d0b5'];
function tribune(cx, cz, largeur, rangs, sens, r, places) {
  /* sens = 1 : les rangs montent vers le nord (tribune nord, elle regarde le sud) ; -1 : l'inverse */
  const p = [], prof = 1.8;
  for (let k = 0; k < rangs; k++) {
    const h = .7 * (k + 1), z = cz - sens * (k * prof + prof / 2);
    p.push(B('#d6d3d1', [cx, h / 2, z], [largeur, h, prof]), B('#a8a29e', [cx, h + .02, z + sens * prof * .42], [largeur, .06, .14]));
    const n = Math.floor(largeur / 6);
    for (let s = 0; s < n; s++) p.push(B(TYPES[ORDRE_TYPES[(s + k) % 8]].couleur, [cx - largeur / 2 + 3 + s * 6, h + .14, z - sens * .2], [5.6, .22, .7]));
    for (let x = cx - largeur / 2 + .8; x < cx + largeur / 2 - .5; x += 1.15) if (r() < .82) places.push([x + (r() - .5) * .2, h + .25, z - sens * .2, r() * 6.28]);
  }
  /* le mur du fond, les poteaux et le toit */
  const zf = cz - sens * rangs * prof, hf = .7 * rangs;
  p.push(B('#78716c', [cx, (hf + 1.2) / 2, zf - sens * .15], [largeur, hf + 1.2, .3]));
  for (let x = cx - largeur / 2 + 1; x <= cx + largeur / 2 - 1; x += (largeur - 2) / Math.max(1, Math.round(largeur / 12))) p.push(CY('#57534e', [x, hf + 2.3, zf - sens * .1], [.12, 2.4, .12]));
  p.push(B('#f8fafc', [cx, hf + 3.5, zf + sens * (rangs * prof * .35 - .2)], [largeur + .6, .18, rangs * prof * .78], [sens * .12, 0, 0]));
  for (let s = 0; s < Math.floor(largeur / 4); s++) p.push(B(s % 2 ? '#ef4444' : '#f8fafc', [cx - largeur / 2 + 2 + s * 4, hf + 3.38 - .45, zf + sens * (rangs * prof * .72)], [4, .5, .06]));
  return { g: construire(p, [], .03), obst: [[cx, cz - sens * rangs * prof / 2, largeur + .4, rangs * prof + .6]] };
}
function foule(places) {
  const n = places.length, corps = new THREE.InstancedMesh(sphere(10, 8), toon('#ffffff'), n), tetes = new THREE.InstancedMesh(sphere(10, 8), toon('#ffffff'), n);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), v = new THREE.Vector3(), s = new THREE.Vector3(), c = new THREE.Color(), r = hasard('foule');
  places.forEach((_, i) => { corps.setColorAt(i, c.set(HABITS[Math.floor(r() * HABITS.length)])); tetes.setColorAt(i, c.set(PEAUX[Math.floor(r() * PEAUX.length)])); });
  corps.castShadow = false; tetes.castShadow = false; corps.receiveShadow = tetes.receiveShadow = true;
  let ferveur = .1, voulue = .1;
  const poser = t => {
    places.forEach(([x, y, z, ph], i) => {
      const saut = Math.max(0, Math.sin(t * (6 + (ph % 2)) + ph)) * .32 * ferveur + Math.sin(t * 1.3 + ph) * .02;
      m.compose(v.set(x, y + .3 + saut, z), q, s.set(.3, .38, .26)); corps.setMatrixAt(i, m);
      m.compose(v.set(x, y + .82 + saut, z), q, s.set(.21, .21, .21)); tetes.setMatrixAt(i, m);
    });
    corps.instanceMatrix.needsUpdate = tetes.instanceMatrix.needsUpdate = true;
  };
  poser(0);
  const g = new THREE.Group(); g.add(corps, tetes);
  return { g, ferveur: k => { voulue = k; }, maj: (dt, t) => { ferveur += (voulue - ferveur) * Math.min(1, dt * 2); poser(t); } };
}

/* ── le tableau d'affichage (un écran qu'on peut réécrire) ── */
function tableau() {
  const c = document.createElement('canvas'); c.width = 1024; c.height = 512; const x = c.getContext('2d');
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
  const g = construire([B('#374151', [-5.4, 2.6, 0], [.4, 5.2, .4]), B('#374151', [5.4, 2.6, 0], [.4, 5.2, .4]), B('#1f2937', [0, 5.5, -.12], [11.6, 6, .3]), B('#facc15', [0, 8.65, -.12], [11.8, .3, .32])], [], .03);
  const ecran = new THREE.Mesh(new THREE.PlaneGeometry(11, 5.5), new THREE.MeshBasicMaterial({ map: tex })); ecran.position.set(0, 5.5, .05); g.add(ecran);
  function ecrire(titre, lignes = []) {
    x.fillStyle = '#0b1220'; x.fillRect(0, 0, 1024, 512);
    x.fillStyle = '#facc15'; x.font = '86px "Lilita One", sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.fillText(titre, 512, 80);
    x.font = '58px "Lilita One", sans-serif'; x.textAlign = 'left';
    lignes.slice(0, 5).forEach((l, i) => { x.fillStyle = l.couleur || '#f8fafc'; x.fillText(l.texte || l, 70, 182 + i * 70); });
    tex.needsUpdate = true;
  }
  ecrire('🏁 DINDODROME', ['Le Royaume des Dindies', 'Inscriptions au Bureau des courses']);
  document.fonts && document.fonts.load('60px "Lilita One"').then(() => ecrire('🏁 DINDODROME', ['Le Royaume des Dindies', 'Inscriptions au Bureau des courses'])).catch(() => {});
  return { g, ecrire, obst: [[0, 0, 11.6, .8]] };
}

/* ── le podium (1er au milieu, 2e à gauche, 3e à droite, vus du sud) ── */
export const PLACES_PODIUM = [[0, 1.2], [-1.7, .8], [1.7, .5]];
function podium() {
  const p = [];
  PLACES_PODIUM.forEach(([x, h], i) => { p.push(B(['#facc15', '#e5e7eb', '#f59e0b'][i], [x, h / 2, 0], [1.6, h, 1.6]), B('#f8fafc', [x, h * .55, .81], [.5, .45, .02])); });
  const g = construire(p, [], .03);
  PLACES_PODIUM.forEach(([x, h], i) => { const t = pancarte(String(i + 1), .44, .4, { fond: '#ffffff', encre: '#92400e', bord: '#ffffff', taille: 200 }); t.position.set(x, h * .55, .83); g.add(t); });
  return { g, obst: [[0, 0, 5.2, 1.8]] };
}

/* ── les bâtiments de la place ── */
function bureau() {
  const p = [B('#fef3c7', [0, 1.2, 0], [5, 2.4, 3.2]), B('#b45309', [0, 2.5, 0], [5.4, .2, 3.6]), B('#78350f', [0, 1.05, 1.75], [4.2, 1.1, .5])];
  for (let k = 0; k < 6; k++) p.push(B(k % 2 ? '#ffffff' : '#dc2626', [-2.25 + k * .9, 2.95, 1.25], [.9, .12, 1.6], [.35, 0, 0]));
  p.push(B('#dc2626', [0, 3.3, -.2], [5.2, .5, 2.6]));
  const g = construire(p, [B('#bfe3ff', [-1.4, 1.6, 1.62], [1.1, .8, .05]), B('#bfe3ff', [1.4, 1.6, 1.62], [1.1, .8, .05])]);
  const t = pancarte('📋 Bureau des courses', 3.6, .7, { fond: '#fef9c3', encre: '#991b1b', bord: '#dc2626' }); t.position.set(0, 3.32, 1.12); g.add(t);
  return { g, obst: [[0, 0, 5.6, 3.8]], porte: [0, 2.9] };
}
function trophees() {
  const p = [B('#f5f5f4', [0, .2, 0], [5.6, .4, 4.4]), B('#e7e5e4', [0, 1.7, -.4], [4.6, 2.6, 3.2]), B('#d6d3d1', [0, 3.15, 0], [5.4, .3, 4.2])];
  for (const x of [-2.2, -.75, .75, 2.2]) p.push(CY('#ffffff', [x, 1.7, 1.75], [.22, 2.6, .22]));
  p.push(B('#facc15', [0, 3.55, 0], [3.2, .5, 2.2]));
  p.push(CY('#facc15', [0, 4.1, 0], [.25, .6, .25]), CY('#fbbf24', [0, 4.85, 0], [.75, .9, .75], [0, 0, 0], 20), TO('#fbbf24', [-.85, 4.95, 0], [.3, .3, .3], [0, 0, Math.PI / 2], .25), TO('#fbbf24', [.85, 4.95, 0], [.3, .3, .3], [0, 0, Math.PI / 2], .25));
  p.push(B('#7c2d12', [0, 1.2, 1.25], [1.3, 2, .1]));
  const g = construire(p, []);
  const t = pancarte('🏆 Salle des trophées', 3.4, .62, { fond: '#fffbeb', encre: '#92400e', bord: '#f59e0b' }); t.position.set(0, 3.15, 2.15); g.add(t);
  return { g, obst: [[0, 0, 5.8, 4.6]], porte: [0, 3.1] };
}
function portail() {
  /* un portail bas (on le voit sans qu'il cache la place) */
  const p = [];
  for (const s of [-1, 1]) {
    for (let k = 0; k < 4; k++) p.push(B(k % 2 ? '#111827' : '#f8fafc', [s * 3.2, .4 + k * .7, 0], [1.1, .7, 1.1]));
    p.push(CO('#ef4444', [s * 3.2, 3.25, 0], [.8, .8, .8], [0, Math.PI / 4, 0], 4));
  }
  p.push(B('#f59e0b', [0, 2.75, 0], [5.4, .7, .7]));
  const g = construire(p, []);
  const t = pancarte('🏡 Vers le Domaine', 4.4, .55, { fond: '#111827', encre: '#facc15', bord: '#f59e0b' }); t.position.set(0, 2.75, -.38); t.rotation.y = Math.PI; g.add(t);
  return { g, obst: [[-3.2, 0, 1.4, 1.4], [3.2, 0, 1.4, 1.4]], porte: [0, -1.6] };
}
function portique() {
  /* le portique de l'arrivée, au-dessus de la piste (en travers de la ligne droite nord) */
  const p = [];
  for (const z of [-26.9, -17.1]) p.push(CY('#374151', [0, 2.3, z], [.18, 4.6, .18]), CY('#facc15', [0, 4.65, z], [.26, .12, .26]));
  p.push(B('#111827', [0, 4.75, -22], [.4, .9, 10.2]));
  const g = construire(p, [], .03);
  for (const s of [-1, 1]) { const t = pancarte('🏁 ARRIVÉE', 4.4, .8, { fond: '#111827', encre: '#facc15', bord: '#111827' }); t.position.set(s * .21, 4.75, -22); t.rotation.y = s * Math.PI / 2; g.add(t); }
  return { g, obst: [[0, -26.9, .5, .5], [0, -17.1, .5, .5]] };
}

export function construireDindodrome() {
  const racine = new THREE.Group(); racine.name = 'dindodrome';
  const r = hasard('dindodrome');
  const ile = creerIle({ a: 64, b: 52, graine: 2.2 });
  const grille = creerGrille(-ile.a * 1.15, -ile.b * 1.15, ile.a * 2.3, ile.b * 2.3, .5);
  grille.boucherSi((x, z) => ile.forme(x, z) > .985);
  const H1 = new THREE.Color('#86cf63'), H2 = new THREE.Color('#74bf55'), PL = new THREE.Color('#d9c4a0'), _c = new THREE.Color();
  const sol = construireSol(racine, ile, {
    couleur: (x, z) => {
      if (z > 21 && z < 46 && Math.abs(x) < 22) return _c.copy(PL);
      const k = Math.abs(x) < DROITE / 2 + RAYON && z > CZ - RAYON - 4 && z < CZ + RAYON + 4 ? .5 + .5 * Math.sin(x * .6) * Math.sin(z * .6) : .5 + .5 * Math.sin(x * .2 + z * .13);
      return _c.copy(H1).lerp(H2, k * .6);
    }
  });
  const interactifs = [], majs = [], pnj = {};
  const placer = (b, x, z, rot = 0) => {
    b.g.position.set(x, 0, z); b.g.rotation.y = rot; racine.add(b.g);
    const c = Math.cos(rot), s = Math.sin(rot), tourne = ([lx, lz]) => [x + lx * c + lz * s, z - lx * s + lz * c];
    for (const [ox, oz, w, d] of b.obst || []) { const [cx, cz] = tourne([ox, oz]); const swap = Math.abs(s) > .5; grille.boucherRect(cx, cz, swap ? d : w, swap ? w : d, 0, .2); }
    if (b.maj) majs.push(b.maj);
    b.porteMonde = b.porte ? tourne(b.porte) : null;
    return b;
  };
  const ajouterInteractif = o => { const I = { rayon: 1.8, ...o }; interactifs.push(I); return I; };

  /* ── la piste ── */
  const matPiste = new THREE.MeshToonMaterial({ color: PISTES.neutre.sol, gradientMap: TONS });
  const piste = new THREE.Mesh(ruban(-LARGEUR / 2, LARGEUR / 2, .03), matPiste); piste.receiveShadow = true; racine.add(piste);
  const matLignes = new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: .75, depthWrite: false });
  for (let k = 0; k <= 6; k++) { const o = (k - 3) * COULOIR; const l = new THREE.Mesh(ruban(o - .04, o + .04, .045), matLignes); racine.add(l); }
  /* les bordures rouges et blanches */
  const bord = ruban(-LARGEUR / 2 - .35, -LARGEUR / 2, .07), bord2 = ruban(LARGEUR / 2, LARGEUR / 2 + .35, .07);
  const texBord = (() => { const c = document.createElement('canvas'); c.width = 64; c.height = 8; const x = c.getContext('2d'); x.fillStyle = '#ef4444'; x.fillRect(0, 0, 32, 8); x.fillStyle = '#fff'; x.fillRect(32, 0, 32, 8); const t = new THREE.CanvasTexture(c); t.wrapS = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; return t; })();
  const matBord = new THREE.MeshToonMaterial({ map: texBord, gradientMap: TONS });
  racine.add(new THREE.Mesh(bord, matBord), new THREE.Mesh(bord2, matBord));
  /* la ligne d'arrivée (damier) */
  const arrivee = new THREE.Mesh(new THREE.PlaneGeometry(.7, LARGEUR), new THREE.MeshBasicMaterial({ map: texDamier() }));
  arrivee.rotation.x = -Math.PI / 2; arrivee.position.set(0, .05, CZ - RAYON); racine.add(arrivee);
  placer(portique(), 0, 0);
  /* les tribunes */
  const places = [];
  placer(tribune(0, CZ - RAYON - LARGEUR / 2 - 1.1, 70, 5, 1, r, places), 0, 0);
  placer(tribune(-21.5, CZ + RAYON + LARGEUR / 2 + 1.4, 31, 3, -1, r, places), 0, 0);
  placer(tribune(21.5, CZ + RAYON + LARGEUR / 2 + 1.4, 31, 3, -1, r, places), 0, 0);
  const public_ = foule(places); racine.add(public_.g); majs.push(public_.maj);
  /* des fanions le long de la piste */
  const fan = [];
  for (let u = 4; u < TOUR; u += 2.2) { const P = pointPiste(u, LARGEUR / 2 + .9); if (Math.abs(P.x) < 36 && P.z < -20) continue; fan.push(CY('#9ca3af', [P.x, .55, P.z], [.04, 1.1, .04]), CO(HABITS[Math.floor(u * 7) % 8], [P.x, 1.02, P.z], [.18, .3, .03], [Math.PI, Math.atan2(P.dx, P.dz) + Math.PI / 2, 0], 3)); }
  racine.add(construire(fan, [], 0));
  /* au milieu : le tableau, le podium, des massifs de fleurs */
  const tab = placer(tableau(), 0, -14);
  const pod = placer(podium(), 0, -3.2);
  /* ── la place : le Bureau des courses, la Salle des trophées, le portail ── */
  const bu = placer(bureau(), -14, 27, .25);
  ajouterInteractif({ id: 'bureau', e: '📋', texte: 'Le Bureau des courses', x: bu.porteMonde[0], z: bu.porteMonde[1], cible: bu.g, rayon: 2.4 });
  const tr = placer(trophees(), 14, 27, -.25);
  ajouterInteractif({ id: 'trophees', e: '🏆', texte: 'La Salle des trophées', x: tr.porteMonde[0], z: tr.porteMonde[1], cible: tr.g, rayon: 2.4 });
  const po = placer(portail(), 0, 44);
  ajouterInteractif({ id: 'sortie', e: '🏡', texte: 'Rentrer au Domaine', x: po.porteMonde[0], z: po.porteMonde[1], cible: po.g, rayon: 2.6 });
  for (const [x, z, t] of [[-6.2, 21.6, '🏟️ La piste'], [24, 34, '🏁 Le Dindodrome']]) placer(panneau(t, 2.4), x, z);
  const lampes = [[-8, 30], [8, 30], [-8, 38], [8, 38], [-20, 22.6], [20, 22.6], [-4.4, 22.6], [4.4, 22.6]];
  for (const [x, z] of lampes) grille.boucherCercle(x, z, .25);
  const lum = construireLampes(racine, lampes);
  const nuitCiel = construireNuit(racine);

  /* ── les habitants (Monsieur Chrono ; les champions et Gontran viennent quand l'histoire le veut) ── */
  function ajouterPnj(pid, x, z, rot = 0) {
    if (pnj[pid]) return pnj[pid];
    const c = creerChibi(PERSONNAGES[pid]); c.racine.position.set(x, 0, z); c.racine.rotation.y = rot; racine.add(c.racine);
    grille.boucherCercle(x, z, .45);
    pnj[pid] = { id: pid, c, x, z, r0: rot };
    ajouterInteractif({ id: 'pnj-' + pid, e: '💬', texte: PERSONNAGES[pid].nom, x, z: z + 1.2, cible: c.racine, pnj: pid, rayon: 2.2 });
    return pnj[pid];
  }
  function retirerPnj(pid) {
    const P = pnj[pid]; if (!P) return;
    P.c.liberer(); delete pnj[pid];
    const k = interactifs.findIndex(i => i.id === 'pnj-' + pid); if (k >= 0) interactifs.splice(k, 1);
    grille.libererRect(P.x, P.z, 1, 1);
  }
  ajouterPnj('chrono', -9.6, 25.4, -.5);

  /* ── la nature autour du stade ── */
  const ctx = {
    racine, grille, ile, r,
    peutPlanter: (x, z, rr) => {
      if (ile.forme(x, z) > .9 || dansStade(x, z) || surAnneau(x, z, 1)) return false;
      if (z > 18 && z < 49 && Math.abs(x) < 26) return false;
      for (const [dx, dz] of [[0, 0], [rr, 0], [-rr, 0], [0, rr], [0, -rr]]) if (!grille.libreEn(x + dx, z + dz)) return false;
      return true;
    }
  };
  dessinerFeuillus(ctx, semer(ctx, 70, { rayon: 1.6, ecart: 2.8, bloque: .7, taille: [.9, 1.4] }));
  dessinerPins(ctx, semer(ctx, 24, { rayon: 1.4, ecart: 2.6, bloque: .6, taille: [.9, 1.3] }));
  dessinerBuissons(ctx, semer(ctx, 40, { rayon: 1, ecart: 1.6, bloque: .5, taille: [.6, 1.1] }));
  dessinerHerbes(ctx, semer(ctx, 380, { rayon: .15, taille: [.6, 1.2] }));
  dessinerFleurs(ctx, semer(ctx, 160, { rayon: .2 }));
  /* des massifs de fleurs dans le pré du milieu */
  const fleurs = [];
  for (let k = 0; k < 220; k++) { const a = r() * 6.28, d = Math.sqrt(r()) * 3.2, cx = (k % 2 ? -1 : 1) * 15; fleurs.push({ x: cx + Math.cos(a) * d * 1.6, z: CZ + Math.sin(a) * d, s: .8 + r() * .5, r: r() * 6, y: 0 }); }
  dessinerFleurs(ctx, fleurs, ['#f472b6', '#facc15', '#ffffff', '#fb923c', '#a78bfa'], .12);

  /* ── préparer la piste pour une course : la couleur du sol, les haies, les zones, la ligne de départ, le décor ── */
  let course = null;
  const piste3D = {
    point: pointPiste, couloir, LARGEUR,
    preparer(pisteId, obst) {
      piste3D.nettoyer();
      const P = PISTES[pisteId], g = new THREE.Group(); g.name = 'course';
      matPiste.color.set(P.sol);
      /* les obstacles : un par position de l'anneau (on les retrouve à chaque tour) */
      const haies = new Map();
      for (const s of obst.haies) {
        const u = Math.round(((obst.depart + s) % TOUR + TOUR) % TOUR * 10) / 10;
        if (haies.has(u)) continue;
        const A = pointPiste(u, 0), o = obstacle(P.obstacle);
        o.position.set(A.x, .03, A.z); o.rotation.y = Math.atan2(A.dx, A.dz); g.add(o);
        haies.set(u, { g: o, choc: 0 });
      }
      /* les zones de sable ou de boue */
      for (const [a, b] of obst.zones) {
        const u0 = ((obst.depart + a) % TOUR + TOUR) % TOUR;
        const z = new THREE.Mesh(ruban(-LARGEUR / 2 + .1, LARGEUR / 2 - .1, .055, u0, u0 + (b - a), .4), toon({ sable: '#f3d38e', verglas: '#e0f7ff', cendre: '#3f3f46', brume: '#6366f1', nuage: '#ffffff' }[P.zone] || '#5b4630'));
        z.receiveShadow = true; g.add(z);
        if (P.zone === 'boue') for (let k = 0; k < 6; k++) { const Q = pointPiste(u0 + (b - a) * (k + .5) / 6, (r() - .5) * 6); const f = new THREE.Mesh(new THREE.CircleGeometry(.5 + r() * .5, 14), new THREE.MeshBasicMaterial({ color: '#8fb3c9', transparent: true, opacity: .55, depthWrite: false })); f.rotation.x = -Math.PI / 2; f.position.set(Q.x, .07, Q.z); g.add(f); }
      }
      /* la ligne de départ */
      if (obst.depart > .5) {
        const A = pointPiste(obst.depart, 0);
        const l = new THREE.Mesh(new THREE.PlaneGeometry(.25, LARGEUR), new THREE.MeshBasicMaterial({ color: '#ffffff' }));
        l.rotation.x = -Math.PI / 2; l.rotation.z = Math.atan2(A.dx, A.dz) + Math.PI / 2; l.position.set(A.x, .06, A.z); g.add(l);
      }
      /* le décor de la piste */
      const deco = [];
      if (P.deco === 'fleurs') for (let u = 2; u < TOUR; u += 1.6) { const Q = pointPiste(u, -LARGEUR / 2 - .9); deco.push(SP(['#f472b6', '#facc15', '#ffffff', '#fb923c'][Math.floor(u) % 4], [Q.x, .25, Q.z], [.28, .22, .28])); }
      if (P.deco === 'cactus') for (let u = 5; u < TOUR; u += 9) { const Q = pointPiste(u, -LARGEUR / 2 - 1.6); deco.push(CY('#4d7c0f', [Q.x, .7, Q.z], [.22, 1.4, .22], [0, 0, 0], 8), CY('#4d7c0f', [Q.x + .35, .8, Q.z], [.12, .5, .12], [0, 0, -.6], 6), SP('#efd08f', [Q.x, .05, Q.z], [.9, .12, .9])); }
      if (P.deco === 'flaques') for (let u = 7; u < TOUR; u += 13) { const Q = pointPiste(u, -LARGEUR / 2 - 2); deco.push(SP('#6b4f36', [Q.x, .02, Q.z], [1.3, .05, .9]), SP('#93c5fd', [Q.x, .05, Q.z], [.9, .04, .6])); }
      if (P.deco === 'palmiers') {
        const pal = []; for (let u = 6; u < TOUR; u += 12) { const Q = pointPiste(u, -LARGEUR / 2 - 2.2); pal.push({ x: Q.x, z: Q.z, s: .8 + r() * .3, r: r() * 6, y: 0 }); }
        dessinerPalmiers({ racine: g, r }, pal);
        for (let u = 3; u < TOUR; u += 3) { const Q = pointPiste(u, LARGEUR / 2 + .6); deco.push(CY('#4d7c0f', [Q.x, 2.4, Q.z], [.03, 1.6, .03]), SP('#65a30d', [Q.x, 1.55, Q.z], [.12, .12, .12])); }
      }
      if (P.deco === 'sapins') for (let u = 4; u < TOUR; u += 8) { const Q = pointPiste(u, -LARGEUR / 2 - 1.8); deco.push(CY('#6b4a2b', [Q.x, .4, Q.z], [.12, .8, .12]), CO('#1f6f4a', [Q.x, 1.4, Q.z], [.7, 1.4, .7]), CO('#f8fafc', [Q.x, 1.9, Q.z], [.42, .7, .42])); }
      if (P.deco === 'braseros') for (let u = 6; u < TOUR; u += 11) { const Q = pointPiste(u, -LARGEUR / 2 - 1.4); deco.push(CY('#292524', [Q.x, .45, Q.z], [.3, .9, .3], [0, 0, 0], 8), SP('#f97316', [Q.x, 1, Q.z], [.32, .4, .32]), SP('#facc15', [Q.x, 1.15, Q.z], [.16, .26, .16])); }
      if (P.deco === 'lanternes') for (let u = 3; u < TOUR; u += 7) { const Q = pointPiste(u, -LARGEUR / 2 - 1.2); deco.push(CY('#1e1b4b', [Q.x, .8, Q.z], [.05, 1.6, .05]), SP(['#fde68a', '#c4b5fd', '#f9a8d4'][Math.floor(u) % 3], [Q.x, 1.7, Q.z], [.22, .28, .22])); }
      if (P.deco === 'ballons') for (let u = 5; u < TOUR; u += 6) { const Q = pointPiste(u, -LARGEUR / 2 - 1.2); deco.push(CY('#e5e7eb', [Q.x, 1, Q.z], [.012, 2, .012]), SP(['#f472b6', '#60a5fa', '#facc15', '#a78bfa', '#4ade80'][Math.floor(u) % 5], [Q.x, 2.2, Q.z], [.32, .4, .32])); }
      if (deco.length) g.add(construire(deco, [], 0));
      racine.add(g);
      course = { g, haies };
      return course;
    },
    /* une dindie tombe sur l'obstacle : il tremble */
    choc(depart, s) { if (!course) return; const u = Math.round(((depart + s) % TOUR + TOUR) % TOUR * 10) / 10; const H = course.haies.get(u); if (H) H.choc = 1; },
    nettoyer() { if (course) { libererGroupe(course.g); course = null; } matPiste.color.set(PISTES.neutre.sol); }
  };
  majs.push(dt => { if (!course) return; for (const H of course.haies.values()) if (H.choc > 0) { H.choc = Math.max(0, H.choc - dt * 2.5); H.g.rotation.z = Math.sin(H.choc * 18) * .12 * H.choc; } });

  return {
    id: 'dindodrome', nom: 'Le Dindodrome', racine, grille, interactifs, pnj, ile, sol: ile.sol, zones: {}, depart: [0, 32],
    lieux: [{ nom: 'Le Bureau des courses', e: '📋', x: -14, z: 27 }, { nom: 'La Salle des trophées', e: '🏆', x: 14, z: 27 }, { nom: 'La piste', e: '🏟️', x: 0, z: CZ + RAYON },
      { nom: 'Le podium', e: '🥇', x: 0, z: -3.2 }, { nom: 'Le portail', e: '🏡', x: 0, z: 44 }],
    brume: [70, 190], teinte: null, ambiance: 'dindodrome',
    poserObjet() {}, retirerObjet() {}, objets: new Map(), trouvailles: new Map(), retirerTrouvaille() {}, gadgets: {},
    piste: piste3D, foule: public_, tableau: tab, podium: pod, ajouterPnj, retirerPnj,
    maj(dt, t, nuit, camPos) {
      sol.maj(dt, t, nuit); nuitCiel.maj(t, nuit, camPos); lum.majNuit(nuit);
      matFenetres.emissiveIntensity = nuit * 1.4;
      for (const f of majs) f(dt, t, nuit);
      for (const P of Object.values(pnj)) P.c.maj(dt, t);
    },
    liberer() { piste3D.nettoyer(); libererGroupe(racine); }
  };
}
