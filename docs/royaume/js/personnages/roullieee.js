/* Roullieee, l'exploratrice des dindies (même style que les dindies : rond, contours, gros yeux)
   API : const r = creerRoullieee() ; scene.add(r.racine) ; r.maj(dt, t) ;
         r.jouer('coucou' | 'presente' | 'saut') ; r.marcher(vitesse) */
import * as THREE from 'three';
import { sphere, demiSphere, cylindre, cone, tore, fusion } from '../moteur/formes.js';
import { toon, contour } from '../moteur/materiaux.js';

const PEAU = '#f6c9a0', CHEVEUX = '#7a3e16', GILET = '#ea580c', CHEMISE = '#fef3c7', SHORT = '#1e3a8a', BOTTES = '#6b3a1e', PAILLE = '#e9c46a', RUBAN = '#ef4444', SAC = '#8a5a3c';
const EP = .016;

export function creerRoullieee() {
  const racine = new THREE.Group(), aJeter = [];
  const poser = (parent, parts, ep = EP, mat = toon()) => {
    const g = fusion(parts); aJeter.push(g);
    const m = new THREE.Mesh(g, mat); m.castShadow = true; m.receiveShadow = true; parent.add(m);
    if (ep) parent.add(new THREE.Mesh(g, contour(ep)));
    return m;
  };
  /* les jambes et les bottes */
  const jambes = [-1, 1].map(s => {
    const g = new THREE.Group(); g.position.set(s * .1, .46, 0); racine.add(g);
    poser(g, [{ g: cylindre(1, 1, 1, 12), c: PEAU, p: [0, -.16, 0], s: [.05, .28, .05] },
      { g: cylindre(1, 1.05, 1, 14), c: BOTTES, p: [0, -.36, 0], s: [.072, .16, .072] }, { g: sphere(), c: BOTTES, p: [0, -.42, .06], s: [.07, .05, .1] },
      { g: cylindre(1, 1, 1, 14), c: '#a16207', p: [0, -.29, 0], s: [.076, .025, .076] }]);
    return g;
  });
  /* le buste : short, gilet, chemise, sac à dos */
  const buste = new THREE.Group(); buste.position.y = .46; racine.add(buste);
  poser(buste, [
    { g: cylindre(1, 1.1, 1, 18), c: SHORT, p: [0, .06, 0], s: [.2, .16, .17] },
    { g: sphere(24, 18), c: GILET, p: [0, .3, 0], s: [.24, .27, .2] },
    { g: sphere(16, 12), c: CHEMISE, p: [0, .3, .1], s: [.1, .22, .11] },
    { g: tore(1, .35), c: CHEMISE, p: [0, .52, .01], r: [Math.PI / 2, 0, 0], s: [.11, .11, .1] },
    { g: sphere(12, 8), c: '#c2410c', p: [-.13, .25, .16], s: [.055, .045, .03] }, { g: sphere(12, 8), c: '#c2410c', p: [.13, .25, .16], s: [.055, .045, .03] },
    { g: sphere(18, 14), c: SAC, p: [0, .32, -.22], s: [.19, .22, .12] }, { g: sphere(14, 10), c: '#a8743f', p: [0, .26, -.31], s: [.12, .1, .05] },
    { g: tore(1, .12, Math.PI), c: '#5b3a22', p: [-.13, .36, -.03], r: [0, Math.PI / 2, 0], s: [.2, .2, .2] }, { g: tore(1, .12, Math.PI), c: '#5b3a22', p: [.13, .36, -.03], r: [0, Math.PI / 2, 0], s: [.2, .2, .2] }
  ]);
  /* les bras (le droit tient le filet) */
  const bras = [-1, 1].map(s => {
    const g = new THREE.Group(); g.position.set(s * .23, .48, 0); g.rotation.z = s * .22; buste.add(g);
    poser(g, [{ g: sphere(14, 10), c: GILET, p: [0, -.02, 0], s: .085 }, { g: cylindre(1, 1, 1, 10), c: PEAU, p: [0, -.17, 0], s: [.045, .26, .045] }, { g: sphere(14, 10), c: PEAU, p: [0, -.32, .01], s: .06 }]);
    return g;
  });
  const filet = new THREE.Group(); filet.position.set(0, -.32, .02); filet.rotation.x = -.35; bras[1].add(filet);
  poser(filet, [{ g: cylindre(1, 1, 1, 8), c: SAC, p: [0, .22, 0], s: [.018, .85, .018] }, { g: tore(1, .1), c: '#9ca3af', p: [0, .7, 0], r: [Math.PI / 2, 0, 0], s: [.17, .17, .17] }], EP * .7);
  const voile = new THREE.Mesh(new THREE.ConeGeometry(.16, .3, 16, 1, true), toon('#f8fafc', { transparent: true, opacity: .55, side: THREE.DoubleSide }));
  voile.position.set(0, .55, 0); voile.rotation.x = Math.PI; filet.add(voile); aJeter.push(voile.geometry);
  /* la tête : visage, cheveux (deux couettes), chapeau d'exploratrice */
  const tete = new THREE.Group(); tete.position.y = .62; buste.add(tete);
  const H = [0, .26, 0];
  poser(tete, [
    { g: sphere(28, 20), c: PEAU, p: H, s: .29 },
    { g: sphere(24, 16), c: CHEVEUX, p: [0, .31, -.06], s: [.31, .29, .29] },
    { g: sphere(14, 10), c: CHEVEUX, p: [-.13, .44, .17], r: [0, 0, .5], s: [.13, .07, .08] }, { g: sphere(14, 10), c: CHEVEUX, p: [.09, .45, .19], r: [0, 0, -.4], s: [.13, .07, .08] },
    { g: sphere(18, 12), c: CHEVEUX, p: [-.31, .16, -.06], s: .11 }, { g: sphere(18, 12), c: CHEVEUX, p: [.31, .16, -.06], s: .11 },
    { g: sphere(12, 8), c: RUBAN, p: [-.27, .24, -.04], s: [.05, .04, .04] }, { g: sphere(12, 8), c: RUBAN, p: [.27, .24, -.04], s: [.05, .04, .04] },
    { g: sphere(12, 8), c: '#f9a8b4', p: [-.17, .18, .22], r: [0, -.6, 0], s: [.05, .03, .018] }, { g: sphere(12, 8), c: '#f9a8b4', p: [.17, .18, .22], r: [0, .6, 0], s: [.05, .03, .018] },
    { g: tore(1, .22, Math.PI), c: '#9a3412', p: [0, .14, .27], r: [Math.PI, 0, 0], s: [.05, .04, .04] },
    /* le chapeau */
    { g: cylindre(1, 1, 1, 26), c: PAILLE, p: [0, .5, -.02], r: [-.12, 0, 0], s: [.44, .028, .42] },
    { g: cylindre(.9, 1, 1, 22), c: PAILLE, p: [0, .6, -.03], r: [-.12, 0, 0], s: [.25, .2, .24] },
    { g: cylindre(1, 1, 1, 22), c: RUBAN, p: [0, .54, -.025], r: [-.12, 0, 0], s: [.258, .05, .248] },
    { g: demiSphere(), c: PAILLE, p: [0, .69, -.04], r: [-.12, 0, 0], s: [.22, .04, .21] }
  ]);
  const yeuxG = new THREE.Group(); yeuxG.position.set(0, .27, 0); tete.add(yeuxG);
  const pYeux = [];
  for (const s of [-1, 1]) {
    pYeux.push({ g: sphere(16, 12), c: '#3b2314', p: [s * .1, 0, .25], r: [0, s * .35, 0], s: [.045, .06, .03] });
    pYeux.push({ g: sphere(8, 6), c: '#ffffff', p: [s * .1 - .012, .02, .275], s: .015 });
    pYeux.push({ g: cylindre(1, 1, 1, 6), c: CHEVEUX, p: [s * .1, .085, .25], r: [Math.PI / 2, 0, s * .2], s: [.012, .07, .012] });
  }
  poser(yeuxG, pYeux, 0);

  /* ── les animations ── */
  let action = null, tA = 0, vitesse = 0, phase = 0, clin = 0, prochainClin = 1;
  const DUREES = { coucou: 2.2, presente: 2.4, saut: .8 };
  function maj(dt, t) {
    tA += dt;
    if (action && tA > DUREES[action]) action = null;
    const p = action ? tA / DUREES[action] : 0, env = action ? Math.sin(Math.min(1, p * 1.2) * Math.PI) : 0;
    let bond = Math.sin(t * 2) * .008, haut = 0;
    if (vitesse > 0) {
      phase += dt * (6 + vitesse * 3);
      jambes[0].rotation.x = Math.sin(phase) * .6; jambes[1].rotation.x = -Math.sin(phase) * .6;
      bras[0].rotation.x = -Math.sin(phase) * .5; bras[1].rotation.x = Math.sin(phase) * .3;
      bond = Math.abs(Math.sin(phase)) * .04;
    } else { jambes.forEach(g => { g.rotation.x *= .8; }); bras[0].rotation.x *= .85; }
    /* le bras gauche fait coucou, ou montre la dindie */
    bras[0].rotation.z = -.22 - (action === 'coucou' ? 2.5 * env : action === 'presente' ? 1.3 * env : 0) + (action === 'coucou' ? Math.sin(t * 14) * .25 * env : 0);
    bras[0].rotation.y = action === 'presente' ? -.6 * env : 0;
    bras[1].rotation.x = vitesse > 0 ? bras[1].rotation.x : -.15;
    if (action === 'saut') haut = Math.sin(p * Math.PI) * .35;
    buste.position.y = .46 + bond + haut; jambes.forEach(g => { g.position.y = .46 + haut; });
    buste.scale.y = 1 + Math.sin(t * 2) * .012;
    tete.rotation.z = Math.sin(t * .9) * .05 + (action === 'coucou' ? .12 * env : 0);
    tete.rotation.y = action === 'presente' ? -.35 * env : Math.sin(t * .5) * .12;
    if (t > prochainClin) { clin = .13; prochainClin = t + 2.2 + Math.random() * 3; }
    clin = Math.max(0, clin - dt); yeuxG.scale.y = clin > 0 ? .15 : 1;
  }
  return {
    racine, maj, jouer: n => { action = n; tA = 0; }, marcher: v => { vitesse = v; },
    liberer: () => { racine.parent && racine.parent.remove(racine); aJeter.forEach(g => g.dispose()); }
  };
}
