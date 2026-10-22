/* ══════════ UNE ÎLE DES RÉGIONS : le sol (avec son relief), la mer, l'écume, l'eau douce ══════════
   creerIle({ a, b, relief }) → { forme(x, z), sol(x, z) } : forme < 1 sur l'île, entre 0,93 et 1 la plage.
   relief(x, z) : la hauteur en plus (des dunes, des collines) ou en moins (un canal, une mare). */
import * as THREE from 'three';
import { toon, contour } from '../moteur/materiaux.js';

const lisse = x => { x = Math.min(1, Math.max(0, x)); return x * x * (3 - 2 * x); };
export function creerIle({ a, b, n = 4, graine = 0, relief = null }) {
  const forme = (x, z) => {
    const th = Math.atan2(z, x);
    const r = Math.pow(Math.pow(Math.abs(x / a), n) + Math.pow(Math.abs(z / b), n), 1 / n);
    return r * (1 + .025 * Math.sin(5 * th + graine) + .018 * Math.sin(9 * th + 1.3 + graine * 2) + .012 * Math.sin(14 * th + .4 + graine));
  };
  const sol = (x, z) => {
    const f = forme(x, z);
    if (f >= .93) return f < 1 ? -(f - .93) / .07 * .14 : -.14 - Math.min(2.4, (f - 1) * 14);
    return relief ? relief(x, z) * (1 - lisse((f - .72) / .2)) : 0;
  };
  return { a, b, forme, sol };
}

/* l'eau qui bouge (la mer, ou une mare) : un reflet animé, plus foncé au large */
function matEau(clair, fonce, a, b, opacite = .96) {
  return new THREE.ShaderMaterial({
    fog: true, transparent: true,
    uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog, { t: { value: 0 }, clair: { value: new THREE.Color(clair) }, fonce: { value: new THREE.Color(fonce) }, nuit: { value: 0 }, taille: { value: new THREE.Vector2(a, b) }, opa: { value: opacite } }]),
    vertexShader: [
      'varying vec3 vP;',
      '#include <fog_pars_vertex>',
      'void main() {',
      '  vP = (modelMatrix * vec4(position, 1.)).xyz;',
      '  vec4 mvPosition = viewMatrix * vec4(vP, 1.);',
      '  gl_Position = projectionMatrix * mvPosition;',
      '  #include <fog_vertex>',
      '}'].join('\n'),
    fragmentShader: [
      'uniform float t, nuit, opa; uniform vec3 clair, fonce; uniform vec2 taille; varying vec3 vP;',
      '#include <common>',
      '#include <fog_pars_fragment>',
      'void main() {',
      '  float d = length(vP.xz / taille);',
      '  vec3 c = mix(clair, fonce, smoothstep(1.05, 1.9, d));',
      '  float w = sin(vP.x * .45 + t * 1.1 + sin(vP.z * .3 + t * .7) * 1.5) * sin(vP.z * .38 - t * .9);',
      '  c += vec3(.35) * smoothstep(.82, .97, w) * (1. - smoothstep(1.4, 2.6, d));',
      '  c = mix(c, c * vec3(.25, .3, .55), nuit);',
      '  gl_FragColor = vec4(c, opa);',
      '  #include <colorspace_fragment>',
      '  #include <fog_fragment>',
      '}'].join('\n')
  });
}

/* couleur(x, z, f, h) → '#rrggbb' : la couleur du sol en ce point (f : la forme, h : la hauteur) */
export function construireSol(racine, ile, { couleur, plage = '#f3dfa2', fond = '#d9c088', eau = ['#5fd0f3', '#1e88c8'], pas = .75 }) {
  const W = ile.a * 2.45, D = ile.b * 2.45;
  const g = new THREE.PlaneGeometry(W, D, Math.round(W / pas), Math.round(D / pas)); g.rotateX(-Math.PI / 2);
  const pos = g.attributes.position, col = new Float32Array(pos.count * 3), c = new THREE.Color(), P = new THREE.Color(plage), F = new THREE.Color(fond);
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i), f = ile.forme(x, z), h = ile.sol(x, z);
    pos.setY(i, h);
    if (f < .915) c.set(couleur(x, z, f, h));
    else if (f < .935) c.set(couleur(x, z, f, h)).lerp(P, (f - .915) / .02);
    else if (f < 1.02) c.copy(P);
    else c.copy(P).lerp(F, Math.min(1, (f - 1.02) * 8));
    col.set([c.r, c.g, c.b], i * 3);
  }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3)); g.computeVertexNormals();
  const terre = new THREE.Mesh(g, toon()); terre.receiveShadow = true; racine.add(terre);
  /* la mer */
  const mEau = matEau(eau[0], eau[1], ile.a, ile.b);
  const mer = new THREE.Mesh(new THREE.PlaneGeometry(700, 700, 1, 1), mEau); mer.rotation.x = -Math.PI / 2; mer.position.y = -.34; racine.add(mer);
  /* l'écume le long de la plage */
  const pts = [];
  for (let k = 0; k <= 320; k++) {
    const th = k / 320 * Math.PI * 2;
    let lo = .5, hi = 1.6; for (let it = 0; it < 30; it++) { const m = (lo + hi) / 2; if (ile.forme(Math.cos(th) * ile.a * m, Math.sin(th) * ile.b * m) < 1.012) lo = m; else hi = m; }
    pts.push([Math.cos(th) * ile.a * lo, Math.sin(th) * ile.b * lo]);
  }
  const ep = new Float32Array(pts.length * 2 * 3), idx = [];
  pts.forEach(([x, z], k) => {
    const [px, pz] = pts[(k + 1) % pts.length], [qx, qz] = pts[(k - 1 + pts.length) % pts.length];
    let nx = pz - qz, nz = -(px - qx); const l = Math.hypot(nx, nz) || 1; nx /= l; nz /= l;
    ep.set([x - nx * .25, -.33, z - nz * .25, x + nx * .45, -.33, z + nz * .45], k * 6);
    if (k < pts.length - 1) idx.push(k * 2, k * 2 + 1, k * 2 + 2, k * 2 + 1, k * 2 + 3, k * 2 + 2);
  });
  const ge = new THREE.BufferGeometry(); ge.setAttribute('position', new THREE.BufferAttribute(ep, 3)); ge.setIndex(idx);
  const ecume = new THREE.Mesh(ge, new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: .75, side: THREE.DoubleSide, depthWrite: false }));
  racine.add(ecume);
  const eaux = [mEau];
  return {
    terre,
    /* une étendue d'eau douce (mare, canal, bassin) : un plan d'eau animé, posé dans un creux du relief */
    planEau(x, z, w, d, y = -.12, couleurs = ['#7dd3fc', '#38bdf8'], rot = 0, rond = false) {
      const m = matEau(couleurs[0], couleurs[1], 400, 400, .92); eaux.push(m);
      const geo = rond ? new THREE.CircleGeometry(.5, 40) : new THREE.PlaneGeometry(1, 1);
      const e = new THREE.Mesh(geo, m); e.rotation.x = -Math.PI / 2; e.rotation.z = rot; e.scale.set(w, d, 1); e.position.set(x, y, z); racine.add(e);
      return e;
    },
    maj(dt, t, nuit) {
      for (const m of eaux) { m.uniforms.t.value = t; m.uniforms.nuit.value = nuit * .8; }
      ecume.position.y = Math.sin(t * 1.2) * .03; ecume.material.opacity = .55 + Math.sin(t * 1.2) * .2;
    }
  };
}

/* beaucoup d'exemplaires d'une même forme en un seul dessin (arbres, fleurs, cailloux…) */
export function instances(geo, mat, liste, avecContour, ep = .06, ombre = true) {
  const im = new THREE.InstancedMesh(geo, mat, Math.max(1, liste.length)), m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), c = new THREE.Color();
  im.count = liste.length;
  liste.forEach(({ p, s, r = 0, rx = 0, rz = 0, c: coul }, i) => {
    m.compose(new THREE.Vector3(...p), q.setFromEuler(e.set(rx, r, rz)), new THREE.Vector3(...(typeof s === 'number' ? [s, s, s] : s)));
    im.setMatrixAt(i, m); if (coul) im.setColorAt(i, c.set(coul));
  });
  im.castShadow = ombre; im.receiveShadow = true;
  const g = new THREE.Group(); g.add(im);
  if (avecContour) { const o = new THREE.InstancedMesh(geo, contour(ep), Math.max(1, liste.length)); o.count = liste.length; o.instanceMatrix = im.instanceMatrix; g.add(o); }
  return g;
}
