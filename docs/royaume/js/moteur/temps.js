/* L'heure du jeu et la lumière qui va avec.
   Par défaut, le jeu suit la vraie heure (la nuit, le Domaine dort !).
   Réglage : 'vraie' | 'jour' | 'nuit'. */
import * as THREE from 'three';

let mode = 'vraie';
export const regler = m => { mode = m; };
export const modeHeure = () => mode;

/* l'heure (de 0 à 24, avec les minutes) */
export function heure() {
  if (mode === 'jour') return 11;
  if (mode === 'nuit') return 23;
  const d = new Date();
  return d.getHours() + d.getMinutes() / 60 + d.getSeconds() / 3600;
}
export function texteHeure(h = heure()) { const H = Math.floor(h), M = Math.floor((h - H) * 60); return `${H}h${String(M).padStart(2, '0')}`; }

/* les moments de la journée : [heure, ciel haut, ciel bas (horizon), sol, soleil couleur, soleil force, ciel force] */
const MOMENTS = [
  [0, '#0b1340', '#26346a', '#141c3c', '#9fb4ff', .55, .5],
  [5.2, '#0f1a4d', '#2e3d75', '#18214a', '#9fb4ff', .5, .5],
  [6.3, '#5b8bd6', '#ffc7a1', '#a7b8d8', '#ffb27a', 1.2, .9],
  [8, '#5ec4f5', '#d9f3ff', '#bfe9fb', '#fff2dc', 2.1, 1.25],
  [17, '#5ec4f5', '#d9f3ff', '#bfe9fb', '#fff2dc', 2.1, 1.25],
  [18.6, '#6d7fd6', '#ffb38a', '#c9a8c8', '#ff9e6b', 1.4, 1.0],
  [20, '#23306b', '#5b4b8a', '#2c2a55', '#c7b8ff', .7, .65],
  [21.5, '#0b1340', '#26346a', '#141c3c', '#9fb4ff', .55, .5],
  [24, '#0b1340', '#26346a', '#141c3c', '#9fb4ff', .55, .5]
];
const _a = new THREE.Color(), _b = new THREE.Color();
const mel = (x, y, k) => '#' + _a.set(x).lerp(_b.set(y), k).getHexString();
export function lumiere(h = heure()) {
  let i = 0; while (i < MOMENTS.length - 2 && MOMENTS[i + 1][0] <= h) i++;
  const A = MOMENTS[i], B = MOMENTS[i + 1], k = Math.min(1, Math.max(0, (h - A[0]) / (B[0] - A[0] || 1)));
  /* la nuit : 0 en plein jour, 1 en pleine nuit (pour les lampes, les étoiles, le sommeil) */
  const nuit = h < 6 ? 1 - smooth((h - 5.4) / 1.1) : h > 19 ? smooth((h - 19.3) / 1.6) : 0;
  /* le soleil tourne de l'est (matin) à l'ouest (soir) ; la nuit, la lune est en haut au sud */
  const jourK = Math.min(1, Math.max(0, (h - 6) / 13));
  const angle = Math.PI * (.08 + .84 * jourK);
  return {
    nuit, haut: mel(A[1], B[1], k), bas: mel(A[2], B[2], k), sol: mel(A[3], B[3], k),
    soleilCouleur: mel(A[4], B[4], k), soleilForce: A[5] + (B[5] - A[5]) * k, cielForce: A[6] + (B[6] - A[6]) * k,
    soleilDir: nuit > .5 ? [-.3, 1, .6] : [Math.cos(angle) * .9, Math.max(.35, Math.sin(angle)), .55]
  };
}
const smooth = x => { x = Math.min(1, Math.max(0, x)); return x * x * (3 - 2 * x); };
export const estNuit = (h = heure()) => lumiere(h).nuit > .5;
