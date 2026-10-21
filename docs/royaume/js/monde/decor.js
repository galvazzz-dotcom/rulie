/* ══════════ LE DÉCOR DU DOMAINE : l'île, la mer, les chemins, la végétation, les lampes ══════════ */
import * as THREE from 'three';
import { sphere, cylindre, cone, boite, fusion } from '../moteur/formes.js';
import { toon, contour, contourPour, TONS, texRonde } from '../moteur/materiaux.js';
import { hasard } from '../moteur/couleurs.js';

/* ── la forme de l'île : un « super-ovale » un peu irrégulier ──
   f(x, z) < 1 : sur l'île ; entre 0,93 et 1 : la plage */
export const ILE = { a: 54, b: 46, n: 4 };
export function forme(x, z) {
  const { a, b, n } = ILE, th = Math.atan2(z, x);
  const r = Math.pow(Math.pow(Math.abs(x / a), n) + Math.pow(Math.abs(z / b), n), 1 / n);
  return r * (1 + .025 * Math.sin(5 * th) + .018 * Math.sin(9 * th + 1.3) + .012 * Math.sin(14 * th + .4));
}
/* la hauteur du sol (la plage descend doucement vers la mer) */
export function sol(x, z) {
  const f = forme(x, z);
  if (f < .93) return 0;
  if (f < 1) return -(f - .93) / .07 * .14;
  return -.14 - Math.min(2.4, (f - 1) * 14);
}

export function construireTerrain(scene) {
  /* le sol : une grande plaque dont les bords plongent sous l'eau ; couleurs par sommet */
  const g = new THREE.PlaneGeometry(132, 116, 176, 154); g.rotateX(-Math.PI / 2);
  const pos = g.attributes.position, col = new Float32Array(pos.count * 3), c = new THREE.Color(), r = hasard('sol');
  const H1 = new THREE.Color('#8fd16a'), H2 = new THREE.Color('#7cc35a'), H3 = new THREE.Color('#a3dc7c'), SABLE = new THREE.Color('#f3dfa2'), FOND = new THREE.Color('#d9c088');
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i), f = forme(x, z);
    pos.setY(i, sol(x, z));
    const bruit = Math.sin(x * .21 + Math.sin(z * .13) * 2) * Math.cos(z * .17 - x * .05) * .5 + .5;
    if (f < .915) c.copy(H1).lerp(bruit > .62 ? H3 : H2, Math.abs(bruit - .5) * 1.4);
    else if (f < .935) c.copy(H1).lerp(SABLE, (f - .915) / .02);
    else if (f < 1.02) c.copy(SABLE);
    else c.copy(SABLE).lerp(FOND, Math.min(1, (f - 1.02) * 8));
    col.set([c.r, c.g, c.b], i * 3);
    void r;
  }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3)); g.computeVertexNormals();
  const terre = new THREE.Mesh(g, toon()); terre.receiveShadow = true; scene.add(terre);

  /* la mer : des reflets qui bougent, plus foncée au large */
  const eau = new THREE.ShaderMaterial({
    fog: true, transparent: true,
    uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog, { t: { value: 0 }, clair: { value: new THREE.Color('#5fd0f3') }, fonce: { value: new THREE.Color('#1e88c8') }, nuit: { value: 0 } }]),
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
      'uniform float t, nuit; uniform vec3 clair, fonce; varying vec3 vP;',
      '#include <common>',
      '#include <fog_pars_fragment>',
      'void main() {',
      '  float d = length(vP.xz / vec2(54., 46.));',
      '  vec3 c = mix(clair, fonce, smoothstep(1.05, 1.9, d));',
      '  float w = sin(vP.x * .45 + t * 1.1 + sin(vP.z * .3 + t * .7) * 1.5) * sin(vP.z * .38 - t * .9);',
      '  c += vec3(.35) * smoothstep(.82, .97, w) * (1. - smoothstep(1.4, 2.6, d));',
      '  c = mix(c, c * vec3(.25, .3, .55), nuit);',
      '  gl_FragColor = vec4(c, .96);',
      '  #include <colorspace_fragment>',
      '  #include <fog_fragment>',
      '}'].join('\n')
  });
  const mer = new THREE.Mesh(new THREE.PlaneGeometry(700, 700, 1, 1), eau); mer.rotation.x = -Math.PI / 2; mer.position.y = -.34; scene.add(mer);
  /* l'écume le long de la plage */
  const pts = [];
  for (let k = 0; k <= 320; k++) {
    const th = k / 320 * Math.PI * 2;
    let lo = .5, hi = 1.6; for (let it = 0; it < 30; it++) { const m = (lo + hi) / 2; const x = Math.cos(th) * ILE.a * m, z = Math.sin(th) * ILE.b * m; if (forme(x, z) < 1.012) lo = m; else hi = m; }
    pts.push([Math.cos(th) * ILE.a * lo, Math.sin(th) * ILE.b * lo]);
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
  scene.add(ecume);
  return {
    maj(dt, t, nuit) { eau.uniforms.t.value = t; eau.uniforms.nuit.value = nuit * .8; ecume.position.y = Math.sin(t * 1.2) * .03; ecume.material.opacity = .55 + Math.sin(t * 1.2) * .2; }
  };
}

/* ── les chemins : des rubans de terre battue (segments + ronds aux jonctions) ── */
export function construireChemins(scene, segments, ronds = []) {
  const parts = [];
  for (const [x1, z1, x2, z2, w = 2.2] of segments) {
    const L = Math.hypot(x2 - x1, z2 - z1), an = Math.atan2(x2 - x1, z2 - z1);
    parts.push({ g: boite(1, 1, 1), c: '#dfbd8a', p: [(x1 + x2) / 2, .02, (z1 + z2) / 2], r: [0, an, 0], s: [w, .04, L] });
    parts.push({ g: cylindre(1, 1, 1, 20), c: '#dfbd8a', p: [x2, .02, z2], s: [w / 2, .04, w / 2] }, { g: cylindre(1, 1, 1, 20), c: '#dfbd8a', p: [x1, .02, z1], s: [w / 2, .04, w / 2] });
  }
  /* les ronds (la place) : chacun un peu plus haut que le précédent, sinon ils « se battent » à l'écran */
  ronds.forEach(([x, z, r, c = '#e7dcc8'], i) => parts.push({ g: cylindre(1, 1, 1, 40), c, p: [x, .03 + i * .015, z], s: [r, .05, r] }));
  const m = new THREE.Mesh(fusion(parts), toon()); m.receiveShadow = true; scene.add(m);
  /* des cailloux plats sur la place */
  return m;
}
export const distSegment = (px, pz, x1, z1, x2, z2) => {
  const dx = x2 - x1, dz = z2 - z1, l2 = dx * dx + dz * dz, t = l2 ? Math.max(0, Math.min(1, ((px - x1) * dx + (pz - z1) * dz) / l2)) : 0;
  return Math.hypot(px - x1 - dx * t, pz - z1 - dz * t);
};

/* ── la végétation, en « instances » (des centaines d'arbres pour quelques appels de dessin) ── */
function instances(geo, mat, liste, avecContour, ep = .06) {
  const im = new THREE.InstancedMesh(geo, mat, liste.length), m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), c = new THREE.Color();
  liste.forEach(({ p, s, r = 0, c: coul }, i) => {
    m.compose(new THREE.Vector3(...p), q.setFromEuler(e.set(0, r, 0)), new THREE.Vector3(...(typeof s === 'number' ? [s, s, s] : s)));
    im.setMatrixAt(i, m); if (coul) im.setColorAt(i, c.set(coul));
  });
  im.castShadow = true; im.receiveShadow = true;
  const g = new THREE.Group(); g.add(im);
  if (avecContour) { const o = new THREE.InstancedMesh(geo, contour(ep), liste.length); o.instanceMatrix = im.instanceMatrix; g.add(o); }
  return g;
}
/* peutPlanter(x, z, rayon) : la place est libre ? */
export function construireVegetation(scene, grille, peutPlanter) {
  const r = hasard('foret'), arbres = [], pins = [], buissons = [], fleurs = [], herbes = [], rochers = [];
  /* d'abord « y a-t-il la place ? », ensuite seulement on plante (et on bouche la grille) */
  const essayer = (liste, n, rayon, f) => { let k = 0; for (let t = 0; t < n * 40 && k < n; t++) { const x = (r() - .5) * 112, z = (r() - .5) * 96; if (!peutPlanter(x, z, rayon)) continue; const v = f(x, z); if (v === false) continue; liste.push(v); k++; } };
  /* les arbres : une ceinture de forêt près des bords, et quelques bosquets */
  const pres = [];
  const loinDesAutres = (x, z, d) => pres.every(([a, b]) => Math.hypot(a - x, b - z) > d);
  essayer(arbres, 115, 1.6, (x, z) => {
    const f = forme(x, z); if (f > .9 || (f < .7 && r() > .25) || !loinDesAutres(x, z, 2.6)) return false;
    pres.push([x, z]); const s = .85 + r() * .55; grille.boucherCercle(x, z, .7 * s); return { x, z, s, r: r() * 6 };
  });
  essayer(pins, 45, 1.4, (x, z) => {
    const f = forme(x, z); if (f > .9 || f < .62 || z > 10 || !loinDesAutres(x, z, 2.4)) return false;
    pres.push([x, z]); const s = .9 + r() * .5; grille.boucherCercle(x, z, .6 * s); return { x, z, s, r: r() * 6 };
  });
  essayer(buissons, 70, 1.0, (x, z) => { const f = forme(x, z); if (f > .92 || !loinDesAutres(x, z, 1.6)) return false; pres.push([x, z]); grille.boucherCercle(x, z, .5); return { x, z, s: .6 + r() * .5 }; });
  essayer(rochers, 30, .8, (x, z) => { const f = forme(x, z); if (f > .96) return false; grille.boucherCercle(x, z, .4); return { x, z, s: .3 + r() * .45, r: r() * 6 }; });
  const COUL_F = ['#f472b6', '#fde047', '#ffffff', '#c4b5fd', '#fb7185', '#60a5fa'];
  essayer(fleurs, 520, .2, (x, z) => forme(x, z) < .9 ? { x, z, c: COUL_F[Math.floor(r() * COUL_F.length)] } : false);
  essayer(herbes, 700, .15, (x, z) => forme(x, z) < .92 ? { x, z, s: .6 + r() * .7, r: r() * 6 } : false);
  const V = ['#4caf50', '#43a047', '#66bb6a', '#5cb85c', '#3f9b46'];
  const g = new THREE.Group();
  g.add(instances(cylindre(.7, 1, 1, 9), toon('#8a5a3c'), arbres.map(a => ({ p: [a.x, .8 * a.s, a.z], s: [.2 * a.s, 1.6 * a.s, .2 * a.s] })), true, .09));
  [[0, 1.95, 0, .95], [.5, 1.6, .2, .66], [-.45, 1.65, -.12, .7], [.08, 2.55, 0, .52]].forEach(([dx, dy, dz, k], j) =>
    g.add(instances(sphere(11, 8), toon('#ffffff'), arbres.map(a => ({ p: [a.x + (dx * Math.cos(a.r) - dz * Math.sin(a.r)) * a.s, dy * a.s, a.z + (dx * Math.sin(a.r) + dz * Math.cos(a.r)) * a.s], s: k * a.s, c: V[(j + Math.floor(a.r * 3)) % V.length] })), true, .045)));
  g.add(instances(cylindre(.7, 1, 1, 8), toon('#7c4a22'), pins.map(a => ({ p: [a.x, .5 * a.s, a.z], s: [.16 * a.s, 1 * a.s, .16 * a.s] })), true, .09));
  [[1.4, 1.3, .9], [2.2, 1.1, .72], [2.9, .9, .52]].forEach(([y, h, rr], j) =>
    g.add(instances(cone(1, 1, 10), toon('#ffffff'), pins.map(a => ({ p: [a.x, y * a.s, a.z], s: [rr * 1.25 * a.s, h * 1.3 * a.s, rr * 1.25 * a.s], r: a.r, c: ['#2f855a', '#38a169', '#48bb78'][j] })), true, .05)));
  g.add(instances(sphere(11, 8), toon('#ffffff'), buissons.map(a => ({ p: [a.x, .35 * a.s, a.z], s: [.75 * a.s, .55 * a.s, .7 * a.s], c: V[Math.floor(a.s * 7) % V.length] })), true, .06));
  g.add(instances(new THREE.IcosahedronGeometry(1, 0), toon('#a8a29e'), rochers.map(a => ({ p: [a.x, a.s * .35, a.z], s: [a.s, a.s * .7, a.s * .85], r: a.r })), true, .06));
  g.add(instances(sphere(6, 4), toon('#ffffff'), fleurs.map(a => ({ p: [a.x, .12, a.z], s: .09, c: a.c })), false));
  g.add(instances(cone(1, 1, 5), toon('#5fb34a'), herbes.map(a => ({ p: [a.x, .12 * a.s, a.z], s: [.08 * a.s, .26 * a.s, .08 * a.s], r: a.r })), false));
  scene.add(g);
  return { arbres: arbres.length + pins.length };
}

/* ── les lampadaires : allumés la nuit (une lueur, pas une vraie lumière : c'est léger) ── */
export const matLampe = new THREE.MeshToonMaterial({ gradientMap: TONS, color: '#fff7d6', emissive: '#ffd27a', emissiveIntensity: 0 });
export function construireLampes(scene, positions) {
  const parts = [], tetes = [];
  for (const [x, z] of positions) {
    parts.push({ g: cylindre(1, 1.3, 1, 10), c: '#374151', p: [x, 1.4, z], s: [.07, 2.8, .07] }, { g: cylindre(1, 1, 1, 10), c: '#374151', p: [x, .12, z], s: [.2, .24, .2] },
      { g: cone(1, 1, 8), c: '#1f2937', p: [x, 3.25, z], s: [.32, .25, .32] });
    tetes.push({ g: sphere(12, 10), c: '#fff7d6', p: [x, 2.95, z], s: .2 });
  }
  const m = new THREE.Mesh(fusion(parts), toon()); m.castShadow = true; scene.add(m);
  const geoT = fusion(tetes); scene.add(new THREE.Mesh(geoT, matLampe));
  const sm = new THREE.SpriteMaterial({ map: texRonde(), color: '#ffcf7a', transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 });
  const lueurs = positions.map(([x, z]) => { const s = new THREE.Sprite(sm); s.position.set(x, 2.95, z); s.scale.setScalar(2.6); scene.add(s); return s; });
  const halo = new THREE.MeshBasicMaterial({ map: texRonde(), color: '#ffcf7a', transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 });
  const geoSol = new THREE.PlaneGeometry(5, 5);
  positions.forEach(([x, z]) => { const p = new THREE.Mesh(geoSol, halo); p.rotation.x = -Math.PI / 2; p.position.set(x, .05, z); scene.add(p); });
  return { majNuit(k) { matLampe.emissiveIntensity = k * 1.8; sm.opacity = k * .9; halo.opacity = k * .45; } };
}

/* ── le ciel de nuit : étoiles et lucioles ── */
export function construireNuit(scene) {
  const r = hasard('etoiles'), n = 500, p = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { const th = r() * Math.PI * 2, ph = Math.acos(r() * .9 + .08); p.set([Math.sin(ph) * Math.cos(th) * 140, Math.cos(ph) * 140, Math.sin(ph) * Math.sin(th) * 140], i * 3); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(p, 3));
  const m = new THREE.PointsMaterial({ color: '#ffffff', size: 1.4, sizeAttenuation: true, transparent: true, opacity: 0, fog: false, depthWrite: false });
  const etoiles = new THREE.Points(g, m); scene.add(etoiles);
  const lune = new THREE.Mesh(new THREE.SphereGeometry(6, 24, 16), new THREE.MeshBasicMaterial({ color: '#fef9c3', fog: false, transparent: true, opacity: 0 }));
  lune.position.set(-60, 70, -100); scene.add(lune);
  const nl = 60, pl = new Float32Array(nl * 3), base = [];
  for (let i = 0; i < nl; i++) { const x = (r() - .5) * 90, z = (r() - .5) * 76; base.push([x, .6 + r() * 1.6, z, r() * 6]); }
  const gl = new THREE.BufferGeometry(); gl.setAttribute('position', new THREE.BufferAttribute(pl, 3));
  const ml = new THREE.PointsMaterial({ color: '#d9f99d', size: .22, map: texRonde(), transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
  const lucioles = new THREE.Points(gl, ml); scene.add(lucioles);
  return {
    maj(t, nuit, camPos) {
      m.opacity = nuit; lune.material.opacity = nuit; ml.opacity = nuit;
      etoiles.position.copy(camPos); lune.position.set(camPos.x - 60, 70, camPos.z - 100);
      if (nuit > 0) { base.forEach(([x, y, z, ph], i) => pl.set([x + Math.sin(t * .5 + ph) * 1.2, y + Math.sin(t * 1.3 + ph) * .3, z + Math.cos(t * .4 + ph) * 1.2], i * 3)); gl.attributes.position.needsUpdate = true; }
    }
  };
}
