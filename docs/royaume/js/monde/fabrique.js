/* ══════════ DE QUOI FABRIQUER LES BÂTIMENTS DES RÉGIONS ══════════
   Comme pour le Domaine : des formes colorées fusionnées (un seul dessin par bâtiment),
   un contour, des vitres qui s'allument la nuit. Rien n'est gardé en mémoire ici :
   quand on quitte la région, tout est libéré avec elle (moteur/liberer.js). */
import * as THREE from 'three';
import { sphere, demiSphere, cylindre, cone, tore, boite, prisme, fusion } from '../moteur/formes.js';
import { toon, contourPour } from '../moteur/materiaux.js';
import { matFenetres } from './batiments.js';

export const B = (c, p, s, r = [0, 0, 0]) => ({ g: boite(1, 1, 1), c, p, s, r });
export const T = (c, p, s, r = [0, 0, 0]) => ({ g: prisme(), c, p, s, r });
export const CY = (c, p, s, r = [0, 0, 0], n = 16) => ({ g: cylindre(1, 1, 1, n), c, p, s, r });
export const CO = (c, p, s, r = [0, 0, 0], n = 12) => ({ g: cone(1, 1, n), c, p, s, r });
export const SP = (c, p, s, r = [0, 0, 0]) => ({ g: sphere(16, 12), c, p, s, r });
export const DS = (c, p, s, r = [0, 0, 0]) => ({ g: demiSphere(20, 10), c, p, s, r });
export const TO = (c, p, s, r = [0, 0, 0], ep = .3, arc = Math.PI * 2) => ({ g: tore(1, ep, arc), c, p, s, r });

/* parts : les formes ; fen : les vitres (elles s'allument la nuit) ; ep : l'épaisseur du contour */
export function construire(parts, fen = [], ep = .035) {
  const g = new THREE.Group();
  if (parts.length) {
    const geo = fusion(parts);
    const m = new THREE.Mesh(geo, toon()); m.castShadow = true; m.receiveShadow = true; g.add(m);
    if (ep) g.add(new THREE.Mesh(geo, contourPour(geo, ep)));
  }
  if (fen.length) g.add(new THREE.Mesh(fusion(fen), matFenetres));
  return g;
}
/* une fenêtre : le cadre (dans le mur) et la vitre */
export function fenetre(parts, fen, x, y, z, w = 1, h = 1, cadre = '#3b82f6', cote = 'z') {
  const r = cote === 'x' ? [0, Math.PI / 2, 0] : [0, 0, 0], dz = .06;
  const o = cote === 'x' ? [Math.sign(x) * dz, 0, 0] : [0, 0, Math.sign(z) * dz];
  parts.push(B(cadre, [x, y, z], [w + .2, h + .2, .12], r));
  fen.push(B('#bfe3ff', [x + o[0], y, z + o[2]], [w, h, .06], r));
  parts.push(B(cadre, [x + o[0] * 2, y, z + o[2] * 2], [.07, h, .05], r), B(cadre, [x + o[0] * 2, y, z + o[2] * 2], [w, .07, .05], r));
}
/* une pancarte avec du texte (et des émojis) */
export function pancarte(texte, w = 2, h = .7, { fond = '#fff8e7', encre = '#7c2d12', bord = '#b45309', taille = 120 } = {}) {
  const c = document.createElement('canvas'), ratio = w / h; c.width = 512; c.height = Math.round(512 / ratio);
  const x = c.getContext('2d');
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
  const dessiner = () => {
    x.clearRect(0, 0, c.width, c.height);
    x.fillStyle = fond; x.strokeStyle = bord; x.lineWidth = 18;
    x.beginPath(); x.roundRect(9, 9, c.width - 18, c.height - 18, 28); x.fill(); x.stroke();
    let t = taille; x.font = `${t}px "Lilita One", sans-serif`;
    while (x.measureText(texte).width > c.width - 50 && t > 20) { t -= 6; x.font = `${t}px "Lilita One", sans-serif`; }
    x.fillStyle = encre; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(texte, c.width / 2, c.height / 2 + t * .06);
    tex.needsUpdate = true;
  };
  dessiner(); document.fonts && document.fonts.load('60px "Lilita One"').then(dessiner).catch(() => {});
  return new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, transparent: true }));
}
/* un poteau avec une pancarte (pour nommer les lieux) */
export function panneau(texte, w = 2.2, opts) {
  const g = construire([B('#8a5a3c', [0, .9, 0], [.14, 1.8, .14])], [], .02);
  const p = pancarte(texte, w, .55, opts); p.position.set(0, 1.75, .09); g.add(p);
  return { g, obst: [[0, 0, .4, .4]] };
}
