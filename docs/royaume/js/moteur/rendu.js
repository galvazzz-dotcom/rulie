/* Le rendu : la toile, la scène, la caméra, les lumières, le ciel et la boucle */
import * as THREE from 'three';
import { decisionQualite } from './qualite.js';

export const tactile = matchMedia('(pointer: coarse)').matches;
export const toile = document.getElementById('toile');
export const renderer = new THREE.WebGLRenderer({ canvas: toile, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, tactile ? 1.75 : 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;

export const scene = new THREE.Scene();
export const camera = new THREE.PerspectiveCamera(36, 1, .1, 300);

/* la lumière : un ciel doux + un soleil qui fait les ombres */
export const ciel = new THREE.HemisphereLight('#fff8ec', '#8fb86a', 1.25);
export const soleil = new THREE.DirectionalLight('#fff2dc', 2.1);
soleil.position.set(6, 12, 8);
soleil.castShadow = true;
soleil.shadow.mapSize.set(tactile ? 1024 : 2048, tactile ? 1024 : 2048);
Object.assign(soleil.shadow.camera, { left: -8, right: 8, top: 8, bottom: -8, near: 1, far: 40 });
soleil.shadow.bias = -.0006; soleil.shadow.normalBias = .02; soleil.shadow.radius = 3;
scene.add(ciel, soleil, soleil.target);

/* le ciel : un grand dôme en dégradé (haut, horizon) */
const domeMat = new THREE.ShaderMaterial({
  side: THREE.BackSide, depthWrite: false, fog: false,
  uniforms: { haut: { value: new THREE.Color('#5ec4f5') }, bas: { value: new THREE.Color('#d9f3ff') }, sol: { value: new THREE.Color('#bfe9fb') } },
  vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }',
  fragmentShader: `uniform vec3 haut, bas, sol; varying vec3 vP;
    void main(){ float h = vP.y; vec3 c = h > 0. ? mix(bas, haut, pow(min(1., h * 1.6), .8)) : mix(bas, sol, min(1., -h * 4.));
      gl_FragColor = vec4(c, 1.);
      #include <colorspace_fragment>
    }`
});
export const dome = new THREE.Mesh(new THREE.SphereGeometry(150, 32, 16), domeMat);
scene.add(dome);
let brume = [30, 120];
export const distancesBrume = (pres, loin) => { brume = [pres, loin]; if (scene.fog) { scene.fog.near = pres; scene.fog.far = loin; } };
export function couleursCiel(haut, bas, sol = bas) {
  domeMat.uniforms.haut.value.set(haut); domeMat.uniforms.bas.value.set(bas); domeMat.uniforms.sol.value.set(sol);
  if (!scene.fog) scene.fog = new THREE.Fog(bas, ...brume); else { scene.fog.color.set(bas); scene.fog.near = brume[0]; scene.fog.far = brume[1]; }
}
couleursCiel('#5ec4f5', '#d9f3ff', '#bfe9fb');

/* la taille de l'écran ; « decalage » déplace le centre de l'image (pour laisser
   de la place à l'interface) : [dx, dy] en fraction de l'écran */
let decalage = [0, 0];
export function centrerImage(dx, dy) { decalage = [dx, dy]; redimensionner(); }
export function redimensionner() {
  const W = innerWidth, H = innerHeight;
  renderer.setSize(W, H, false);
  camera.aspect = W / H;
  camera.setViewOffset(W, H, -decalage[0] * W, -decalage[1] * H, W, H);
  camera.updateProjectionMatrix();
}
addEventListener('resize', redimensionner);
redimensionner();

/* ── la qualité s'adapte à l'appareil (étape 9) : si l'image rame (moins de 38 images par seconde pendant
   quelques secondes), on dessine moins de pixels, puis des ombres plus simples, puis plus d'ombres du tout ;
   quand tout va bien depuis longtemps, on remonte d'un cran ; si baisser ne sert à rien (un téléphone bloqué à 30 images
   par seconde en économie d'énergie), on revient et on ne baisse plus (voir qualite.js). « Image légère » (dans la Maison) part du 3e cran.
   (Pas pendant les tests automatiques : leur navigateur dessine sans carte graphique, donc toujours lentement.) ── */
const PR0 = renderer.getPixelRatio();
export const QUALITES = [
  { nom: 'belle', pr: PR0, ombre: tactile ? 1024 : 2048 },
  { nom: 'moyenne', pr: Math.min(PR0, 1.35), ombre: 1024 },
  { nom: 'légère', pr: Math.min(PR0, 1), ombre: 512 },
  { nom: 'très légère', pr: Math.min(PR0, .8), ombre: 0 }
];
let niveauQ = 0, minQ = 0, depuisQ = 0, mesureN = 0, mesureT = 0, debutMesure = 0, fpsAvant = 0, bloque = false;
const automatique = !navigator.webdriver;
export function regler(n) {
  n = Math.max(minQ, Math.min(QUALITES.length - 1, n));
  const Q = QUALITES[n]; niveauQ = n; depuisQ = performance.now();
  if (renderer.getPixelRatio() !== Q.pr) { renderer.setPixelRatio(Q.pr); redimensionner(); }
  soleil.castShadow = Q.ombre > 0;
  if (Q.ombre && soleil.shadow.mapSize.x !== Q.ombre) { soleil.shadow.map?.dispose(); soleil.shadow.map = null; soleil.shadow.mapSize.set(Q.ombre, Q.ombre); }
}
export const imageLegere = v => { minQ = v ? 2 : 0; regler(Math.max(niveauQ, minQ)); };
export const qualite = () => ({ niveau: niveauQ, ...QUALITES[niveauQ], automatique });
function surveillerQualite(maintenant, dtVrai) {
  if (!automatique || document.hidden) { mesureN = 0; mesureT = 0; return; }
  if (!debutMesure) debutMesure = maintenant;
  /* les premières secondes (les ombres et les matériaux se préparent) et les à-coups (un onglet caché) ne comptent pas */
  if (maintenant - debutMesure < 6000 || dtVrai > 1) return;
  mesureN++; mesureT += dtVrai;
  if (mesureT < 2.5) return;
  const fps = mesureN / mesureT; mesureN = 0; mesureT = 0;
  const D = decisionQualite(QUALITES, { niveau: niveauQ, min: minQ, depuis: depuisQ, fpsAvant, bloque }, fps, maintenant);
  fpsAvant = D.fpsAvant; bloque = D.bloque;
  if (D.niveau !== niveauQ) regler(D.niveau);
}

/* la boucle : chaque fonction inscrite reçoit (dt, t) */
const abonnes = new Set();
export const chaqueImage = f => { abonnes.add(f); return () => abonnes.delete(f); };
let avant = performance.now(), t = 0, enPause = false, nImage = 0;
export const horloge = () => t;
/* en pause (pendant un mini-jeu en plein écran) : la 3D ne bouge plus et ne se redessine plus */
export const pauseRendu = v => { enPause = !!v; };
function image(maintenant) {
  const dtVrai = (maintenant - avant) / 1000, dt = Math.min(.05, dtVrai); avant = maintenant;
  if (!enPause) {
    t += dt;
    for (const f of abonnes) f(dt, t);
    /* derrière une fenêtre, la 3D se redessine une image sur deux (la batterie dit merci) */
    if (!(document.body.classList.contains('fenetreOuverte') && (nImage++ & 1))) renderer.render(scene, camera);
    surveillerQualite(maintenant, dtVrai);
  }
  requestAnimationFrame(image);
}
requestAnimationFrame(image);
