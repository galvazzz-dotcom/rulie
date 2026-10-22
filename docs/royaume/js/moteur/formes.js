/* Les formes de base et la « fusion » : plusieurs formes colorées deviennent
   une seule géométrie (couleurs par sommet) = un seul appel de dessin. */
import * as THREE from 'three';

const cache = new Map(), partagees = new WeakSet();
export function geo(cle, fab) { let g = cache.get(cle); if (!g) { g = fab(); cache.set(cle, g); partagees.add(g); } return g; }
/* une géométrie du cache (sphère, boîte…) sert à tout le monde : on ne la libère jamais */
export const estGeoPartagee = g => partagees.has(g);
export const sphere = (l = 22, h = 16) => geo(`s${l}_${h}`, () => new THREE.SphereGeometry(1, l, h));
export const demiSphere = (l = 22, h = 10) => geo(`d${l}_${h}`, () => new THREE.SphereGeometry(1, l, h, 0, Math.PI * 2, 0, Math.PI / 2));
export const cylindre = (rh, rb, h, s = 16) => geo(`c${rh}_${rb}_${h}_${s}`, () => new THREE.CylinderGeometry(rh, rb, h, s));
export const cone = (r, h, s = 14) => geo(`o${r}_${h}_${s}`, () => new THREE.ConeGeometry(r, h, s));
export const tore = (R, r, a = Math.PI * 2, sr = 10, st = 28) => geo(`t${R}_${r}_${a}_${sr}_${st}`, () => new THREE.TorusGeometry(R, r, sr, st, a));
export const boite = (w, h, d) => geo(`b${w}_${h}_${d}`, () => new THREE.BoxGeometry(w, h, d));
/* un prisme (toit à deux pentes) : base 1 × profondeur 1, hauteur 1, faîte le long de z */
export const prisme = () => geo('prisme', () => {
  const s = new THREE.Shape(); s.moveTo(-.5, 0); s.lineTo(.5, 0); s.lineTo(0, 1); s.closePath();
  const g = new THREE.ExtrudeGeometry(s, { depth: 1, bevelEnabled: false }); g.translate(0, 0, -.5); g.computeVertexNormals(); return g;
});
export function etoile5(r = 1, e = .35) {
  return geo(`e${r}_${e}`, () => {
    const s = new THREE.Shape();
    for (let i = 0; i < 10; i++) { const a = Math.PI / 2 + i * Math.PI / 5, q = i % 2 ? r * .45 : r; i ? s.lineTo(Math.cos(a) * q, Math.sin(a) * q) : s.moveTo(Math.cos(a) * q, Math.sin(a) * q); }
    const g = new THREE.ExtrudeGeometry(s, { depth: e, bevelEnabled: true, bevelThickness: e * .25, bevelSize: r * .08, bevelSegments: 2 });
    g.translate(0, 0, -e / 2); g.computeVertexNormals(); return g;
  });
}

const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _p = new THREE.Vector3(), _s = new THREE.Vector3(), _c = new THREE.Color();
/* parts : [{ g, c, p:[x,y,z], r:[x,y,z], s: nombre | [x,y,z] }] */
export function fusion(parts) {
  const morceaux = [];
  let total = 0;
  for (const { g, c, p = [0, 0, 0], r = [0, 0, 0], s = 1 } of parts) {
    const x = g.index ? g.toNonIndexed() : g.clone();
    _m.compose(_p.set(...p), _q.setFromEuler(_e.set(...r)), typeof s === 'number' ? _s.set(s, s, s) : _s.set(...s));
    x.applyMatrix4(_m);
    _c.set(c);
    morceaux.push([x, _c.r, _c.g, _c.b]);
    total += x.attributes.position.count;
  }
  const pos = new Float32Array(total * 3), nor = new Float32Array(total * 3), col = new Float32Array(total * 3);
  let o = 0;
  for (const [x, r, g, b] of morceaux) {
    const n = x.attributes.position.count;
    pos.set(x.attributes.position.array, o * 3); nor.set(x.attributes.normal.array, o * 3);
    for (let i = 0; i < n; i++) { col[(o + i) * 3] = r; col[(o + i) * 3 + 1] = g; col[(o + i) * 3 + 2] = b; }
    o += n; x.dispose();
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  out.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
  out.setAttribute('color', new THREE.BufferAttribute(col, 3));
  out.setAttribute('nContour', new THREE.BufferAttribute(normalesLisses(pos, nor), 3));
  out.computeBoundingSphere();
  return out;
}
/* pour le contour : la moyenne des normales des sommets au même endroit
   (sinon le contour se fend aux arêtes des boîtes et des toits) */
export function normalesLisses(pos, nor) {
  /* une clé numérique par position (arrondie au dixième de millimètre) : bien plus rapide qu'un texte */
  const n = pos.length / 3, cles = new Float64Array(n), somme = new Map(), out = new Float32Array(pos.length);
  for (let i = 0; i < n; i++) {
    const k = (Math.round(pos[i * 3] * 1e4) * 73856093) ^ (Math.round(pos[i * 3 + 1] * 1e4) * 19349663) ^ (Math.round(pos[i * 3 + 2] * 1e4) * 83492791);
    cles[i] = k;
    let j = somme.get(k); if (j === undefined) { j = somme.size * 3; somme.set(k, j); }
  }
  const acc = new Float32Array(somme.size * 3);
  for (let i = 0; i < n; i++) { const j = somme.get(cles[i]); acc[j] += nor[i * 3]; acc[j + 1] += nor[i * 3 + 1]; acc[j + 2] += nor[i * 3 + 2]; }
  for (let i = 0; i < n; i++) { const j = somme.get(cles[i]), l = Math.hypot(acc[j], acc[j + 1], acc[j + 2]) || 1; out[i * 3] = acc[j] / l; out[i * 3 + 1] = acc[j + 1] / l; out[i * 3 + 2] = acc[j + 2] / l; }
  return out;
}
