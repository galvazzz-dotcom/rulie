/* Le rendu : la toile, la scène, la caméra, les lumières, le ciel et la boucle */
import * as THREE from 'three';

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

/* la boucle : chaque fonction inscrite reçoit (dt, t) */
const abonnes = new Set();
export const chaqueImage = f => { abonnes.add(f); return () => abonnes.delete(f); };
let avant = performance.now(), t = 0;
export const horloge = () => t;
function image(maintenant) {
  const dt = Math.min(.05, (maintenant - avant) / 1000); avant = maintenant; t += dt;
  for (const f of abonnes) f(dt, t);
  renderer.render(scene, camera);
  requestAnimationFrame(image);
}
requestAnimationFrame(image);
