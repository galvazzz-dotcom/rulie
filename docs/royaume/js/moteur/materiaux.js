/* Les matériaux « dessin animé » : 3 tons de lumière, et le contour sombre
   (la technique de la « coque inversée » : la même forme, un peu gonflée,
   dessinée par l'arrière en couleur foncée). */
import * as THREE from 'three';

const tons = new THREE.DataTexture(new Uint8Array([110, 190, 255]), 3, 1, THREE.RedFormat);
tons.minFilter = tons.magFilter = THREE.NearestFilter; tons.generateMipmaps = false; tons.needsUpdate = true;
export const TONS = tons;

/* un matériau par couleur (ou couleurs par sommet si pas de couleur) */
const cache = new Map();
export function toon(couleur = null, options = {}) {
  const cle = (couleur || 'sommets') + JSON.stringify(options);
  let m = cache.get(cle);
  if (!m) {
    m = new THREE.MeshToonMaterial({ gradientMap: tons, ...(couleur ? { color: couleur } : { vertexColors: true }), ...options });
    cache.set(cle, m);
  }
  return m;
}
export function toonTexture(texture) { return new THREE.MeshToonMaterial({ gradientMap: tons, map: texture }); }

const contours = new Map();
export function contour(epaisseur = .018, couleur = '#2a1a10') {
  const cle = epaisseur + couleur;
  let m = contours.get(cle);
  if (!m) {
    m = new THREE.MeshBasicMaterial({ color: couleur, side: THREE.BackSide });
    m.onBeforeCompile = s => {
      s.vertexShader = s.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>\n  transformed += normalize(normal) * ${epaisseur.toFixed(4)};`);
    };
    m.customProgramCacheKey = () => 'contour' + epaisseur;
    contours.set(cle, m);
  }
  return m;
}

/* une forme + son contour, prêts à poser */
export function avecContour(geometrie, materiau, epaisseur = .018, ombre = true) {
  const g = new THREE.Group();
  const m = new THREE.Mesh(geometrie, materiau); m.castShadow = ombre; m.receiveShadow = true;
  const c = new THREE.Mesh(geometrie, contour(epaisseur));
  g.add(c, m);
  g.userData.mesh = m; g.userData.contour = c;
  return g;
}

/* une petite tache de lumière ronde (aura, étincelles) */
let rond = null;
export function texRonde() {
  if (rond) return rond;
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const x = c.getContext('2d'), g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.35, 'rgba(255,255,255,.55)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = g; x.fillRect(0, 0, 64, 64);
  rond = new THREE.CanvasTexture(c); rond.colorSpace = THREE.SRGBColorSpace;
  return rond;
}
let etoileTex = null;
export function texEtoile() {
  if (etoileTex) return etoileTex;
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const x = c.getContext('2d');
  const g = x.createRadialGradient(32, 32, 0, 32, 32, 30); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = g;
  x.beginPath(); x.moveTo(32, 0); x.quadraticCurveTo(36, 28, 64, 32); x.quadraticCurveTo(36, 36, 32, 64); x.quadraticCurveTo(28, 36, 0, 32); x.quadraticCurveTo(28, 28, 32, 0); x.fill();
  etoileTex = new THREE.CanvasTexture(c); etoileTex.colorSpace = THREE.SRGBColorSpace;
  return etoileTex;
}
