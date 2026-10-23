/* ══════════ LES PERSONNAGES (style « chibi » : grosse tête, contours) ══════════
   Un seul modèle réglable pour Roullieee et tous les habitants du Royaume.
   creerChibi(p) → { racine, maj(dt, t), jouer('coucou'|'presente'|'saut'|'parle'), marcher(v), liberer(), hauteur }
   portraitChibi(p) → le portrait SVG (tête et épaules) pour les dialogues. */
import * as THREE from 'three';
import { sphere, demiSphere, cylindre, cone, tore, boite, fusion } from '../moteur/formes.js';
import { toon, contour, contourPour } from '../moteur/materiaux.js';
import { assombrir, eclaircir } from '../moteur/couleurs.js';

const EP = .016;
export const PERSONNAGES = {
  roullieee: { nom: 'Roullieee', peau: '#f6c9a0', cheveux: '#7a3e16', coiffure: 'couettes', haut: '#fef3c7', gilet: '#ea580c', bas: '#1e3a8a', chaussures: '#6b3a1e',
    chapeau: 'exploratrice', ruban: '#ef4444', sac: true, filet: true, couleur: '#ea580c' },
  plumeau: { nom: 'Professeur Plumeau', peau: '#f2c6a0', cheveux: '#f1f5f9', coiffure: 'savant', haut: '#bfdbfe', blouse: '#ffffff', bas: '#57534e', longBas: true, chaussures: '#3f2a1d',
    lunettes: '#1f2937', moustache: '#e5e7eb', taille: 1.04, couleur: '#2563eb' },
  mimi: { nom: 'Mimi', peau: '#e8b48f', cheveux: '#b45309', coiffure: 'chignon', haut: '#fde047', bas: '#be185d', jupe: true, tablier: '#22c55e', chaussures: '#7c2d12',
    ruban: '#f472b6', couleur: '#16a34a' },
  zephyr: { nom: 'Capitaine Zéphyr', peau: '#d9a37e', cheveux: '#57534e', coiffure: 'court', haut: '#f8fafc', gilet: '#1d4ed8', bas: '#78350f', longBas: true, chaussures: '#292524',
    chapeau: 'aviateur', echarpe: '#ef4444', barbe: '#57534e', taille: 1.06, couleur: '#1d4ed8' },
  ginette: { nom: 'Coach Ginette', peau: '#c98b65', cheveux: '#111827', coiffure: 'queue', haut: '#ec4899', gilet: '#7c3aed', bas: '#7c3aed', longBas: true, chaussures: '#f8fafc',
    bandeau: '#f8fafc', sifflet: true, couleur: '#7c3aed' },
  gaston: { nom: 'Gaston le berger', peau: '#e7b08a', cheveux: '#9a6b3c', coiffure: 'court', haut: '#fef3c7', gilet: '#16a34a', bas: '#1d4ed8', longBas: true, chaussures: '#5b3a22',
    chapeau: 'paille', ruban: '#ef4444', moustache: '#9a6b3c', taille: 1.05, couleur: '#16a34a' },
  leila: { nom: 'Leïla des Dunes', peau: '#c68a5e', cheveux: '#1c1917', coiffure: 'queue', haut: '#fde68a', gilet: '#ea580c', bas: '#7c2d12', longBas: true, chaussures: '#a16207',
    chapeau: 'foulard', foulard: '#0d9488', echarpe: '#facc15', couleur: '#f59e0b' },
  waffel: { nom: 'Monsieur Waffel', peau: '#f5cba7', cheveux: '#a8a29e', coiffure: 'court', haut: '#ffffff', tablier: '#facc15', bas: '#1f2937', longBas: true, chaussures: '#111827',
    chapeau: 'toque', moustache: '#78716c', taille: 1.02, couleur: '#3b82f6' },
  chrono: { nom: 'Monsieur Chrono', peau: '#e8b48f', cheveux: '#44403c', coiffure: 'court', haut: '#f8fafc', gilet: '#dc2626', bas: '#111827', longBas: true, chaussures: '#111827',
    chapeau: 'melon', ruban: '#facc15', moustache: '#44403c', taille: 1.03, couleur: '#dc2626' },
  tarzanette: { nom: 'Tarzanette', peau: '#b07a52', cheveux: '#7c2d12', coiffure: 'queue', haut: '#a3e635', gilet: '#15803d', bas: '#a16207', chaussures: '#78350f',
    bandeau: '#f97316', couleur: '#10b981' },
  inuk: { nom: 'Inuk', peau: '#c98b65', cheveux: '#111827', coiffure: 'court', haut: '#e0f2fe', gilet: '#0ea5e9', bas: '#1e3a8a', longBas: true, chaussures: '#78350f',
    chapeau: 'chapka', fourrure: '#f5f5f4', chapka: '#0284c7', echarpe: '#ef4444', couleur: '#0ea5e9' },
  lava: { nom: 'Madame Lava', peau: '#e8b48f', cheveux: '#dc2626', coiffure: 'chignon', haut: '#fde68a', bas: '#7f1d1d', jupe: true, tablier: '#57534e', chaussures: '#292524',
    lunettes: '#f97316', bandeau: '#facc15', taille: 1.02, couleur: '#dc2626' },
  hibou: { nom: 'Comte Hibou', peau: '#f2d0b5', cheveux: '#e5e7eb', coiffure: 'court', haut: '#f8fafc', gilet: '#4c1d95', bas: '#1e1b4b', longBas: true, chaussures: '#111827',
    chapeau: 'hautForme', ruban: '#a78bfa', moustache: '#e5e7eb', lunettes: '#facc15', taille: 1.05, couleur: '#6366f1' },
  azur: { nom: 'Aurélie Azur', peau: '#f6c9a0', cheveux: '#fbbf24', coiffure: 'queue', haut: '#f8fafc', gilet: '#38bdf8', bas: '#1d4ed8', longBas: true, chaussures: '#f8fafc',
    chapeau: 'aviateur', echarpe: '#f472b6', couleur: '#38bdf8' },
  /* les Quatre Plumes, de la Ligue des Légendes (chapitre 8) */
  plumeline: { nom: 'Baronne Plumeline', peau: '#f3d2b9', cheveux: '#4c1d95', coiffure: 'chignon', haut: '#fdf4ff', bas: '#a21caf', jupe: true, chaussures: '#4a044e',
    chapeau: 'capeline', capeline: '#f0abfc', plume: '#a855f7', ruban: '#facc15', taille: 1.03, couleur: '#c026d3' },
  dindini: { nom: 'Le Grand Dindini', peau: '#e8b48f', cheveux: '#111827', coiffure: 'court', haut: '#f8fafc', gilet: '#312e81', bas: '#111827', longBas: true, chaussures: '#111827',
    chapeau: 'magicien', magicien: '#4338ca', moustache: '#111827', echarpe: '#dc2626', taille: 1.07, couleur: '#4338ca' },
  mamie: { nom: 'Mamie Glouglou', peau: '#f2c6a0', cheveux: '#e7e5e4', coiffure: 'chignon', haut: '#fde68a', bas: '#9a3412', jupe: true, tablier: '#fb7185', chaussures: '#57534e',
    lunettes: '#78350f', ruban: '#84cc16', echarpe: '#c2410c', taille: .95, couleur: '#f97316' },
  rapido: { nom: 'Capitaine Rapido', peau: '#c68a5e', cheveux: '#1c1917', coiffure: 'court', haut: '#f8fafc', gilet: '#dc2626', bas: '#111827', longBas: true, chaussures: '#f8fafc',
    chapeau: 'casque', casque: '#dc2626', echarpe: '#facc15', taille: 1.04, couleur: '#dc2626' },
  gontran: { nom: 'Gontran Gloupi', peau: '#f5cba7', cheveux: '#facc15', coiffure: 'herisse', haut: '#f8fafc', gilet: '#0ea5e9', bas: '#334155', longBas: true, chaussures: '#ef4444',
    malin: true, couleur: '#0284c7' }
};

export function creerChibi(p) {
  const racine = new THREE.Group(), aJeter = [];
  const poser = (parent, parts, ep = EP, mat = toon()) => {
    const g = fusion(parts); aJeter.push(g);
    const m = new THREE.Mesh(g, mat); m.castShadow = true; m.receiveShadow = true; parent.add(m);
    if (ep) parent.add(new THREE.Mesh(g, contourPour(g, ep)));
    return m;
  };
  const PEAU = p.peau, HAUT_C = p.gilet || p.haut;
  /* les jambes */
  const jambes = [-1, 1].map(s => {
    const g = new THREE.Group(); g.position.set(s * .1, .46, 0); racine.add(g);
    const parts = [{ g: cylindre(1, 1, 1, 12), c: p.longBas ? p.bas : PEAU, p: [0, -.16, 0], s: [p.longBas ? .062 : .05, .3, p.longBas ? .062 : .05] },
      { g: cylindre(1, 1.05, 1, 14), c: p.chaussures, p: [0, -.38, 0], s: [.068, .1, .068] }, { g: sphere(), c: p.chaussures, p: [0, -.42, .06], s: [.07, .05, .1] }];
    if (p.chapeau === 'exploratrice') parts.push({ g: cylindre(1, 1, 1, 14), c: '#a16207', p: [0, -.31, 0], s: [.072, .03, .072] }, { g: cylindre(1, 1.05, 1, 14), c: p.chaussures, p: [0, -.34, 0], s: [.072, .14, .072] });
    poser(g, parts);
    return g;
  });
  /* le buste */
  const buste = new THREE.Group(); buste.position.y = .46; racine.add(buste);
  const pb = [{ g: cylindre(1, p.jupe ? 1.45 : 1.1, 1, 18), c: p.blouse || p.bas, p: [0, p.jupe ? .02 : .06, 0], s: [.2, p.jupe ? .24 : .16, .17] },
    { g: sphere(24, 18), c: HAUT_C, p: [0, .3, 0], s: [.24, .27, .2] }];
  if (p.gilet) pb.push({ g: sphere(16, 12), c: p.haut, p: [0, .3, .1], s: [.1, .22, .11] }, { g: sphere(12, 8), c: assombrir(p.gilet, .15), p: [-.13, .25, .16], s: [.055, .045, .03] }, { g: sphere(12, 8), c: assombrir(p.gilet, .15), p: [.13, .25, .16], s: [.055, .045, .03] });
  if (p.blouse) {
    pb.push({ g: sphere(24, 18), c: p.blouse, p: [0, .3, 0], s: [.245, .275, .205] }, { g: sphere(14, 10), c: p.haut, p: [0, .37, .13], s: [.07, .13, .08] });
    pb.push({ g: cylindre(1, 1.3, 1, 18, true), c: p.blouse, p: [0, -.04, 0], s: [.22, .3, .19] });
    pb.push({ g: sphere(10, 8), c: '#ef4444', p: [-.12, .3, .18], s: [.025, .05, .015] }, { g: sphere(10, 8), c: '#3b82f6', p: [-.09, .31, .185], s: [.02, .045, .015] });
  }
  if (p.tablier) pb.push({ g: sphere(16, 12), c: p.tablier, p: [0, .18, .12], s: [.2, .3, .1] }, { g: sphere(12, 8), c: eclaircir(p.tablier, .3), p: [0, .12, .2], s: [.08, .06, .03] });
  pb.push({ g: tore(1, .35), c: p.blouse || p.haut, p: [0, .52, .01], r: [Math.PI / 2, 0, 0], s: [.11, .11, .1] });
  if (p.echarpe) pb.push({ g: tore(1, .4), c: p.echarpe, p: [0, .53, .01], r: [Math.PI / 2, 0, 0], s: [.13, .13, .12] }, { g: sphere(), c: p.echarpe, p: [.1, .42, .14], r: [.3, 0, .4], s: [.05, .13, .03] });
  if (p.sifflet) pb.push({ g: tore(1, .08), c: '#f8fafc', p: [0, .45, .08], r: [Math.PI / 2 - .4, 0, 0], s: [.13, .13, .13] }, { g: cylindre(1, 1, 1, 10), c: '#facc15', p: [0, .33, .19], r: [Math.PI / 2, 0, 0], s: [.025, .06, .025] });
  if (p.sac) pb.push({ g: sphere(18, 14), c: '#8a5a3c', p: [0, .32, -.22], s: [.19, .22, .12] }, { g: sphere(14, 10), c: '#a8743f', p: [0, .26, -.31], s: [.12, .1, .05] },
    { g: tore(1, .12, Math.PI), c: '#5b3a22', p: [-.13, .36, -.03], r: [0, Math.PI / 2, 0], s: [.2, .2, .2] }, { g: tore(1, .12, Math.PI), c: '#5b3a22', p: [.13, .36, -.03], r: [0, Math.PI / 2, 0], s: [.2, .2, .2] });
  poser(buste, pb);
  /* les bras */
  const manche = p.blouse || HAUT_C, longues = !!(p.blouse || p.longBas && p.gilet);
  const bras = [-1, 1].map(s => {
    const g = new THREE.Group(); g.position.set(s * .23, .48, 0); g.rotation.z = s * .22; buste.add(g);
    poser(g, [{ g: sphere(14, 10), c: manche, p: [0, -.02, 0], s: .085 }, { g: cylindre(1, 1, 1, 10), c: longues ? manche : PEAU, p: [0, -.17, 0], s: [longues ? .055 : .045, .26, longues ? .055 : .045] }, { g: sphere(14, 10), c: PEAU, p: [0, -.32, .01], s: .06 }]);
    return g;
  });
  if (p.filet) {
    const filet = new THREE.Group(); filet.position.set(0, -.32, .02); filet.rotation.x = -.35; bras[1].add(filet);
    poser(filet, [{ g: cylindre(1, 1, 1, 8), c: '#8a5a3c', p: [0, .22, 0], s: [.018, .85, .018] }, { g: tore(1, .1), c: '#9ca3af', p: [0, .7, 0], r: [Math.PI / 2, 0, 0], s: [.17, .17, .17] }], EP * .7);
    const voile = new THREE.Mesh(new THREE.ConeGeometry(.16, .3, 16, 1, true), toon('#f8fafc', { transparent: true, opacity: .55, side: THREE.DoubleSide }));
    voile.position.set(0, .55, 0); voile.rotation.x = Math.PI; filet.add(voile); aJeter.push(voile.geometry);
  }
  /* la tête */
  const tete = new THREE.Group(); tete.position.y = .62; buste.add(tete);
  const C = p.cheveux, pt = [{ g: sphere(28, 20), c: PEAU, p: [0, .26, 0], s: .29 }];
  const cz = p.coiffure;
  if (cz !== 'herisse') pt.push({ g: sphere(24, 16), c: C, p: [0, .31, -.06], s: [.31, .29, .29] });
  if (cz === 'couettes') pt.push({ g: sphere(18, 12), c: C, p: [-.31, .16, -.06], s: .11 }, { g: sphere(18, 12), c: C, p: [.31, .16, -.06], s: .11 },
    { g: sphere(12, 8), c: p.ruban || '#ef4444', p: [-.27, .24, -.04], s: [.05, .04, .04] }, { g: sphere(12, 8), c: p.ruban || '#ef4444', p: [.27, .24, -.04], s: [.05, .04, .04] });
  if (cz === 'couettes' || cz === 'chignon' || cz === 'queue') pt.push({ g: sphere(14, 10), c: C, p: [-.13, .44, .17], r: [0, 0, .5], s: [.13, .07, .08] }, { g: sphere(14, 10), c: C, p: [.09, .45, .19], r: [0, 0, -.4], s: [.13, .07, .08] });
  if (cz === 'chignon') pt.push({ g: sphere(18, 12), c: C, p: [0, .6, -.08], s: .14 }, { g: tore(1, .3), c: p.ruban || '#f472b6', p: [0, .53, -.07], r: [Math.PI / 2, 0, 0], s: [.1, .1, .1] });
  if (cz === 'queue') pt.push({ g: sphere(16, 12), c: C, p: [0, .3, -.33], r: [.5, 0, 0], s: [.08, .2, .08] });
  if (cz === 'court') pt.push({ g: sphere(14, 10), c: C, p: [0, .45, .16], r: [-.3, 0, 0], s: [.22, .06, .1] });
  if (cz === 'savant') pt.push({ g: sphere(14, 10), c: C, p: [-.3, .3, -.02], s: [.1, .12, .14] }, { g: sphere(14, 10), c: C, p: [.3, .3, -.02], s: [.1, .12, .14] }, { g: sphere(12, 8), c: C, p: [-.2, .52, -.05], s: .09 }, { g: sphere(12, 8), c: C, p: [.2, .52, -.05], s: .09 });
  if (cz === 'herisse') { pt.push({ g: sphere(24, 16), c: C, p: [0, .33, -.05], s: [.3, .26, .28] }); for (let i = 0; i < 7; i++) { const a = -1.2 + i * .4; pt.push({ g: cone(1, 1, 8), c: C, p: [Math.sin(a) * .2, .5 + Math.cos(a) * .08, -.02 + Math.cos(a) * .05], r: [-.3, 0, -a * .9], s: [.07, .2, .07] }); } }
  /* le visage */
  pt.push({ g: sphere(12, 8), c: '#f9a8b4', p: [-.17, .18, .22], r: [0, -.6, 0], s: [.05, .03, .018] }, { g: sphere(12, 8), c: '#f9a8b4', p: [.17, .18, .22], r: [0, .6, 0], s: [.05, .03, .018] });
  pt.push({ g: tore(1, .22, Math.PI), c: '#9a3412', p: [0, .14, .27], r: [Math.PI, 0, 0], s: [.05, .04, .04] });
  if (p.moustache) pt.push({ g: sphere(12, 8), c: p.moustache, p: [-.05, .17, .275], r: [0, 0, .3], s: [.06, .025, .03] }, { g: sphere(12, 8), c: p.moustache, p: [.05, .17, .275], r: [0, 0, -.3], s: [.06, .025, .03] });
  if (p.barbe) pt.push({ g: sphere(16, 12), c: p.barbe, p: [0, .06, .18], s: [.17, .11, .12] });
  if (p.lunettes) for (const s of [-1, 1]) pt.push({ g: tore(1, .12), c: p.lunettes, p: [s * .1, .27, .27], s: [.07, .07, .07] });
  if (p.bandeau) pt.push({ g: tore(1, .12), c: p.bandeau, p: [0, .4, .0], r: [Math.PI / 2 - .25, 0, 0], s: [.3, .3, .3] });
  /* les chapeaux */
  if (p.chapeau === 'exploratrice') pt.push({ g: cylindre(1, 1, 1, 26), c: '#e9c46a', p: [0, .5, -.02], r: [-.12, 0, 0], s: [.44, .028, .42] },
    { g: cylindre(.9, 1, 1, 22), c: '#e9c46a', p: [0, .6, -.03], r: [-.12, 0, 0], s: [.25, .2, .24] },
    { g: cylindre(1, 1, 1, 22), c: p.ruban || '#ef4444', p: [0, .54, -.025], r: [-.12, 0, 0], s: [.258, .05, .248] },
    { g: demiSphere(), c: '#e9c46a', p: [0, .69, -.04], r: [-.12, 0, 0], s: [.22, .04, .21] });
  if (p.chapeau === 'aviateur') pt.push({ g: demiSphere(), c: '#7c4a22', p: [0, .34, -.02], s: [.32, .3, .31] },
    { g: sphere(12, 8), c: '#7c4a22', p: [-.29, .2, 0], s: [.07, .12, .1] }, { g: sphere(12, 8), c: '#7c4a22', p: [.29, .2, 0], s: [.07, .12, .1] },
    { g: tore(1, .3), c: '#94a3b8', p: [-.09, .52, .2], r: [-.6, 0, 0], s: [.075, .075, .075] }, { g: tore(1, .3), c: '#94a3b8', p: [.09, .52, .2], r: [-.6, 0, 0], s: [.075, .075, .075] },
    { g: sphere(10, 8), c: '#bae6fd', p: [-.09, .52, .2], r: [-.6, 0, 0], s: [.055, .055, .02] }, { g: sphere(10, 8), c: '#bae6fd', p: [.09, .52, .2], r: [-.6, 0, 0], s: [.055, .055, .02] });
  if (p.chapeau === 'paille') pt.push({ g: cylindre(1, 1, 1, 26), c: '#f2d27a', p: [0, .5, -.02], r: [-.1, 0, 0], s: [.52, .026, .5] },
    { g: cylindre(.92, 1, 1, 22), c: '#f2d27a', p: [0, .58, -.03], r: [-.1, 0, 0], s: [.25, .15, .24] },
    { g: cylindre(1, 1, 1, 22), c: p.ruban || '#ef4444', p: [0, .53, -.025], r: [-.1, 0, 0], s: [.258, .045, .248] });
  if (p.chapeau === 'foulard') pt.push({ g: sphere(24, 16), c: p.foulard, p: [0, .34, -.04], s: [.33, .27, .32] },
    { g: sphere(16, 12), c: p.foulard, p: [.2, .14, -.2], r: [.3, 0, -.4], s: [.09, .2, .08] }, { g: sphere(10, 8), c: '#facc15', p: [0, .42, .27], s: .04 });
  if (p.chapeau === 'toque') pt.push({ g: cylindre(1, 1, 1, 22), c: '#ffffff', p: [0, .6, -.03], s: [.22, .2, .22] },
    { g: sphere(18, 12), c: '#ffffff', p: [0, .76, -.03], s: [.28, .14, .27] }, { g: sphere(12, 8), c: '#ffffff', p: [-.14, .74, -.03], s: .13 }, { g: sphere(12, 8), c: '#ffffff', p: [.14, .74, -.03], s: .13 });
  if (p.chapeau === 'melon') pt.push({ g: cylindre(1, 1, 1, 26), c: '#1f2937', p: [0, .5, -.02], r: [-.1, 0, 0], s: [.36, .024, .35] },
    { g: demiSphere(), c: '#1f2937', p: [0, .51, -.03], r: [-.1, 0, 0], s: [.24, .2, .23] }, { g: cylindre(1, 1, 1, 22), c: p.ruban || '#facc15', p: [0, .54, -.025], r: [-.1, 0, 0], s: [.245, .04, .235] });
  if (p.chapeau === 'chapka') pt.push({ g: demiSphere(), c: p.chapka || '#0284c7', p: [0, .36, -.02], s: [.32, .29, .31] },
    { g: tore(1, .35), c: p.fourrure || '#f5f5f4', p: [0, .38, -.02], r: [Math.PI / 2 - .12, 0, 0], s: [.31, .31, .3] },
    { g: sphere(12, 8), c: p.fourrure || '#f5f5f4', p: [-.29, .22, 0], s: [.08, .14, .11] }, { g: sphere(12, 8), c: p.fourrure || '#f5f5f4', p: [.29, .22, 0], s: [.08, .14, .11] },
    { g: sphere(12, 8), c: p.fourrure || '#f5f5f4', p: [0, .66, -.04], s: .07 });
  if (p.chapeau === 'hautForme') pt.push({ g: cylindre(1, 1, 1, 26), c: '#111827', p: [0, .5, -.02], r: [-.1, 0, 0], s: [.36, .024, .35] },
    { g: cylindre(1, 1, 1, 22), c: '#111827', p: [0, .68, -.04], r: [-.1, 0, 0], s: [.21, .34, .2] }, { g: cylindre(1, 1, 1, 22), c: p.ruban || '#a78bfa', p: [0, .56, -.03], r: [-.1, 0, 0], s: [.215, .06, .205] });
  if (p.chapeau === 'capeline') pt.push({ g: cylindre(1, 1, 1, 28), c: p.capeline, p: [0, .5, -.02], r: [-.14, 0, .06], s: [.58, .022, .56] },
    { g: demiSphere(), c: p.capeline, p: [0, .5, -.03], r: [-.14, 0, .06], s: [.24, .16, .23] }, { g: cylindre(1, 1, 1, 22), c: p.ruban || '#facc15', p: [0, .53, -.025], r: [-.14, 0, .06], s: [.245, .045, .235] },
    { g: sphere(14, 10), c: p.plume, p: [.18, .72, -.12], r: [.2, 0, -.6], s: [.05, .24, .03] }, { g: sphere(14, 10), c: eclaircir(p.plume, .3), p: [.24, .66, -.08], r: [.3, 0, -.9], s: [.04, .18, .025] });
  if (p.chapeau === 'magicien') pt.push({ g: cylindre(1, 1, 1, 26), c: p.magicien, p: [0, .5, -.02], r: [-.1, 0, 0], s: [.4, .024, .38] },
    { g: cone(1, 1, 16), c: p.magicien, p: [0, .78, -.06], r: [-.18, 0, .08], s: [.24, .56, .24] },
    { g: sphere(8, 6), c: '#facc15', p: [-.08, .7, .1], s: .035 }, { g: sphere(8, 6), c: '#facc15', p: [.09, .86, .04], s: .03 }, { g: sphere(8, 6), c: '#fde68a', p: [.02, 1.02, -.04], s: .045 });
  if (p.chapeau === 'casque') pt.push({ g: demiSphere(), c: p.casque, p: [0, .33, -.02], s: [.345, .33, .335] },
    { g: tore(1, .18), c: '#f8fafc', p: [0, .45, -.02], r: [Math.PI / 2, 0, 0], s: [.3, .3, .3] },
    { g: sphere(16, 10), c: '#1e293b', p: [0, .45, .22], r: [-.3, 0, 0], s: [.22, .07, .08] }, { g: sphere(10, 8), c: '#facc15', p: [0, .68, -.02], s: [.05, .05, .2] });
  poser(tete, pt);
  const yeuxG = new THREE.Group(); yeuxG.position.set(0, .27, 0); tete.add(yeuxG);
  const pY = [];
  for (const s of [-1, 1]) {
    pY.push({ g: sphere(16, 12), c: '#3b2314', p: [s * .1, 0, .25], r: [0, s * .35, 0], s: [.045, p.malin ? .045 : .06, .03] });
    pY.push({ g: sphere(8, 6), c: '#ffffff', p: [s * .1 - .012, .02, .275], s: .015 });
    pY.push({ g: cylindre(1, 1, 1, 6), c: p.coiffure === 'savant' ? '#d6d3d1' : p.cheveux, p: [s * .1, p.malin ? .06 : .085, .25], r: [Math.PI / 2, 0, s * (p.malin ? -.35 : .2)], s: [.012, .07, .012] });
  }
  poser(yeuxG, pY, 0);
  racine.scale.setScalar(p.taille || 1);

  /* ── les animations ── */
  let action = null, tA = 0, vitesse = 0, phase = 0, clin = 0, prochainClin = 1 + Math.random() * 2, regard = 0;
  const DUREES = { coucou: 2.2, presente: 2.4, saut: .8, parle: 1.6, content: 1.2 };
  function maj(dt, t) {
    tA += dt;
    if (action && tA > DUREES[action]) action = null;
    const q = action ? tA / DUREES[action] : 0, env = action ? Math.sin(Math.min(1, q * 1.2) * Math.PI) : 0;
    let bond = Math.sin(t * 2) * .008, haut = 0;
    if (vitesse > 0) {
      phase += dt * (6 + vitesse * 3);
      jambes[0].rotation.x = Math.sin(phase) * .6; jambes[1].rotation.x = -Math.sin(phase) * .6;
      bras[0].rotation.x = -Math.sin(phase) * .5; bras[1].rotation.x = p.filet ? Math.sin(phase) * .3 : Math.sin(phase) * .5;
      bond = Math.abs(Math.sin(phase)) * .04;
    } else { jambes.forEach(g => { g.rotation.x *= .8; }); bras[0].rotation.x *= .85; bras[1].rotation.x = p.filet ? -.15 : bras[1].rotation.x * .85; }
    bras[0].rotation.z = -.22 - (action === 'coucou' ? 2.5 * env : action === 'presente' ? 1.3 * env : action === 'parle' ? .5 * env : 0) + (action === 'coucou' ? Math.sin(t * 14) * .25 * env : action === 'parle' ? Math.sin(t * 7) * .15 * env : 0);
    bras[0].rotation.y = action === 'presente' ? -.6 * env : 0;
    if (action === 'content') { bras[0].rotation.z -= 2.2 * env; bras[1].rotation.z += 2.2 * env; }
    if (action === 'saut' || action === 'content') haut = Math.sin(q * Math.PI) * (action === 'saut' ? .35 : .2);
    buste.position.y = .46 + bond + haut; jambes.forEach(g => { g.position.y = .46 + haut; });
    buste.scale.y = 1 + Math.sin(t * 2) * .012;
    tete.rotation.z = Math.sin(t * .9) * .05 + (action === 'coucou' ? .12 * env : 0);
    tete.rotation.y = action === 'presente' ? -.35 * env : regard + Math.sin(t * .5) * .1;
    tete.rotation.x = action === 'parle' ? Math.sin(t * 9) * .06 * env : 0;
    if (t > prochainClin) { clin = .13; prochainClin = t + 2.2 + Math.random() * 3; }
    clin = Math.max(0, clin - dt); yeuxG.scale.y = clin > 0 ? .15 : 1;
  }
  return {
    racine, maj, jouer: n => { action = n; tA = 0; }, marcher: v => { vitesse = v; }, regarder: r => { regard = r; },
    hauteur: 1.75 * (p.taille || 1),
    liberer: () => { racine.parent && racine.parent.remove(racine); aJeter.forEach(g => g.dispose()); }
  };
}

/* ── le portrait SVG (tête et épaules), pour les dialogues ── */
export function portraitChibi(p, id = 'c' + Math.random().toString(36).slice(2, 7)) {
  const o = [], C = p.cheveux, cz = p.coiffure;
  const vol = (c, extra = '') => `fill="${c}" stroke="${assombrir(c, .45)}" stroke-width="2.4" ${extra}`;
  o.push(`<defs><radialGradient id="${id}f" cx="50%" cy="35%" r="70%"><stop offset="0" stop-color="${eclaircir(p.couleur || '#f59e0b', .55)}"/><stop offset="1" stop-color="${p.couleur || '#f59e0b'}"/></radialGradient></defs>`);
  o.push(`<rect width="120" height="120" fill="url(#${id}f)"/>`);
  /* les épaules */
  o.push(`<path d="M14 124 Q16 92 60 88 Q104 92 106 124Z" ${vol(p.blouse || p.gilet || p.haut)}/>`);
  if (p.gilet && !p.blouse) o.push(`<path d="M48 90 L60 120 L72 90 Q60 96 48 90Z" fill="${p.haut}"/>`);
  if (p.tablier) o.push(`<path d="M40 100 Q60 94 80 100 L82 124 L38 124Z" ${vol(p.tablier)}/>`);
  if (p.echarpe) o.push(`<path d="M40 88 Q60 100 80 88 L82 96 Q60 108 38 96Z" ${vol(p.echarpe)}/>`);
  if (p.sifflet) o.push(`<path d="M50 90 Q60 106 70 90" stroke="#f8fafc" stroke-width="2" fill="none"/><rect x="56" y="100" width="9" height="6" rx="2" ${vol('#facc15')}/>`);
  /* les cheveux derrière */
  if (cz !== 'herisse') o.push(`<ellipse cx="60" cy="52" rx="37" ry="36" ${vol(C)}/>`);
  if (cz === 'couettes') o.push(`<circle cx="22" cy="66" r="12" ${vol(C)}/><circle cx="98" cy="66" r="12" ${vol(C)}/><circle cx="27" cy="57" r="5" fill="${p.ruban || '#ef4444'}"/><circle cx="93" cy="57" r="5" fill="${p.ruban || '#ef4444'}"/>`);
  if (cz === 'chignon') o.push(`<circle cx="60" cy="14" r="14" ${vol(C)}/>`);
  if (cz === 'queue') o.push(`<path d="M86 50 Q104 60 98 86 Q90 70 84 62Z" ${vol(C)}/>`);
  if (cz === 'savant') o.push(`<circle cx="24" cy="54" r="13" ${vol(C)}/><circle cx="96" cy="54" r="13" ${vol(C)}/><circle cx="34" cy="30" r="10" ${vol(C)}/><circle cx="86" cy="30" r="10" ${vol(C)}/>`);
  /* le visage */
  o.push(`<ellipse cx="60" cy="62" rx="31" ry="30" ${vol(p.peau)}/>`);
  if (cz === 'couettes' || cz === 'chignon' || cz === 'queue') o.push(`<path d="M30 52 Q40 28 62 30 Q86 30 90 52 Q76 40 62 44 Q46 40 30 52Z" ${vol(C)}/>`);
  if (cz === 'court') o.push(`<path d="M32 50 Q44 30 62 32 Q82 32 88 50 Q72 42 60 44 Q46 42 32 50Z" ${vol(C)}/>`);
  if (cz === 'herisse') o.push(`<path d="M28 56 L30 30 L40 40 L44 18 L54 34 L62 12 L68 32 L80 18 L80 40 L92 30 L92 56 Q76 42 60 44 Q44 42 28 56Z" ${vol(C)}/>`);
  if (p.bandeau) o.push(`<path d="M30 46 Q60 34 90 46 L90 52 Q60 40 30 52Z" ${vol(p.bandeau)}/>`);
  for (const s of [-1, 1]) o.push(`<ellipse cx="${60 + s * 18}" cy="72" rx="6" ry="3.5" fill="#f9a8b4" opacity=".8"/>`);
  for (const s of [-1, 1]) {
    const x = 60 + s * 11, y = 62;
    o.push(p.malin ? `<path d="M${x - 5} ${y} Q${x} ${y - 4} ${x + 5} ${y}" stroke="#3b2314" stroke-width="3.2" fill="none" stroke-linecap="round"/>` :
      `<ellipse cx="${x}" cy="${y}" rx="4.4" ry="6" fill="#3b2314"/><circle cx="${x - 1.4}" cy="${y - 2}" r="1.6" fill="#fff"/>`);
    o.push(`<path d="M${x - 5} ${y - 10} Q${x} ${y - (p.malin ? 9 : 13)} ${x + 5} ${y - 10}" stroke="${cz === 'savant' ? '#a8a29e' : assombrir(C, .1)}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`);
  }
  if (p.lunettes) o.push(`<circle cx="49" cy="62" r="9" fill="none" stroke="${p.lunettes}" stroke-width="2.4"/><circle cx="71" cy="62" r="9" fill="none" stroke="${p.lunettes}" stroke-width="2.4"/><path d="M58 62 H62" stroke="${p.lunettes}" stroke-width="2.4"/>`);
  if (p.barbe) o.push(`<path d="M36 70 Q40 96 60 96 Q80 96 84 70 Q72 84 60 82 Q48 84 36 70Z" ${vol(p.barbe)}/>`);
  o.push(`<path d="M52 78 Q60 ${p.malin ? 82 : 85} 68 78" stroke="#9a3412" stroke-width="2.6" fill="none" stroke-linecap="round"/>`);
  if (p.moustache) o.push(`<path d="M48 76 Q54 70 60 75 Q66 70 72 76 Q66 79 60 77 Q54 79 48 76Z" ${vol(p.moustache)}/>`);
  /* les chapeaux */
  if (p.chapeau === 'exploratrice') o.push(`<ellipse cx="60" cy="34" rx="46" ry="9" ${vol('#e9c46a')}/><path d="M36 34 Q36 10 60 10 Q84 10 84 34Z" ${vol('#e9c46a')}/><path d="M36 28 H84 V34 H36Z" fill="${p.ruban || '#ef4444'}"/>`);
  if (p.chapeau === 'aviateur') o.push(`<path d="M28 54 Q28 18 60 18 Q92 18 92 54 L86 60 Q84 34 60 32 Q36 34 34 60Z" ${vol('#7c4a22')}/><circle cx="50" cy="32" r="8" fill="#bae6fd" stroke="#94a3b8" stroke-width="3"/><circle cx="70" cy="32" r="8" fill="#bae6fd" stroke="#94a3b8" stroke-width="3"/>`);
  if (p.chapeau === 'paille') o.push(`<ellipse cx="60" cy="36" rx="52" ry="10" ${vol('#f2d27a')}/><path d="M38 36 Q38 14 60 14 Q82 14 82 36Z" ${vol('#f2d27a')}/><path d="M38 30 H82 V36 H38Z" fill="${p.ruban || '#ef4444'}"/>`);
  if (p.chapeau === 'foulard') o.push(`<path d="M24 62 Q22 16 60 14 Q98 16 96 62 Q86 34 60 32 Q34 34 24 62Z" ${vol(p.foulard)}/><path d="M90 52 Q106 74 98 100 Q88 80 82 66Z" ${vol(p.foulard)}/><circle cx="60" cy="24" r="4.5" fill="#facc15" stroke="#a16207" stroke-width="1.5"/>`);
  if (p.chapeau === 'toque') o.push(`<rect x="38" y="14" width="44" height="26" rx="4" ${vol('#ffffff')}/><circle cx="44" cy="14" r="12" ${vol('#ffffff')}/><circle cx="60" cy="9" r="14" ${vol('#ffffff')}/><circle cx="76" cy="14" r="12" ${vol('#ffffff')}/>`);
  if (p.chapeau === 'melon') o.push(`<ellipse cx="60" cy="34" rx="36" ry="7" ${vol('#1f2937')}/><path d="M40 34 Q40 8 60 8 Q80 8 80 34Z" ${vol('#1f2937')}/><path d="M40 28 H80 V33 H40Z" fill="${p.ruban || '#facc15'}"/>`);
  if (p.chapeau === 'chapka') o.push(`<path d="M30 60 Q28 16 60 14 Q92 16 90 60 Q84 36 60 34 Q36 36 30 60Z" ${vol(p.chapka || '#0284c7')}/><rect x="27" y="30" width="66" height="12" rx="6" ${vol(p.fourrure || '#f5f5f4')}/><ellipse cx="29" cy="58" rx="8" ry="14" ${vol(p.fourrure || '#f5f5f4')}/><ellipse cx="91" cy="58" rx="8" ry="14" ${vol(p.fourrure || '#f5f5f4')}/><circle cx="60" cy="13" r="7" ${vol(p.fourrure || '#f5f5f4')}/>`);
  if (p.chapeau === 'hautForme') o.push(`<ellipse cx="60" cy="34" rx="38" ry="7" ${vol('#111827')}/><rect x="42" y="0" width="36" height="34" rx="3" ${vol('#111827')}/><rect x="42" y="25" width="36" height="7" fill="${p.ruban || '#a78bfa'}"/>`);
  if (p.chapeau === 'capeline') o.push(`<ellipse cx="60" cy="34" rx="56" ry="10" ${vol(p.capeline)} transform="rotate(-5 60 34)"/><path d="M40 34 Q40 16 60 16 Q80 16 80 34Z" ${vol(p.capeline)}/><path d="M40 28 H80 V34 H40Z" fill="${p.ruban || '#facc15'}"/><path d="M76 24 Q96 -4 104 6 Q92 14 80 28Z" ${vol(p.plume)}/><path d="M80 26 Q100 8 108 18 Q94 24 82 30Z" ${vol(eclaircir(p.plume, .3))}/>`);
  if (p.chapeau === 'magicien') o.push(`<ellipse cx="60" cy="36" rx="40" ry="8" ${vol(p.magicien)}/><path d="M38 36 L66 -6 L84 36Z" ${vol(p.magicien)}/><circle cx="56" cy="22" r="3.5" fill="#facc15"/><circle cx="68" cy="12" r="3" fill="#facc15"/><circle cx="64" cy="-2" r="4" fill="#fde68a"/>`);
  if (p.chapeau === 'casque') o.push(`<path d="M26 62 Q24 14 60 12 Q96 14 94 62 Q86 40 60 38 Q34 40 26 62Z" ${vol(p.casque)}/><path d="M30 44 Q60 30 90 44" stroke="#f8fafc" stroke-width="5" fill="none"/><path d="M36 48 Q60 40 84 48 L82 56 Q60 50 38 56Z" fill="#1e293b" stroke="#0f172a" stroke-width="2"/><path d="M58 12 L62 12 L62 38 L58 38Z" fill="#facc15"/>`);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">${o.join('')}</svg>`;
}
