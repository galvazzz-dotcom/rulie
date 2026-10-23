/* ══════════ LES 50 DÉCORATIONS DU DOMAINE, EN 3D ══════════
   fabDeco(id) → { g, maj?(dt, t) }. Chaque décoration est fusionnée en une seule géométrie, gardée en cache :
   dix copies du même massif de fleurs ne coûtent qu'une géométrie. Les vitres des lampes s'allument la nuit. */
import * as THREE from 'three';
import { sphere, demiSphere, cylindre, cone, tore, boite, prisme, fusion, geo } from '../moteur/formes.js';
import { toon, contourPour } from '../moteur/materiaux.js';
import { assombrir, eclaircir, hasard, ARC } from '../moteur/couleurs.js';
import { TYPES } from '../donnees/types.js';
import { DECORATIONS } from '../donnees/production.js';
import { matFenetres } from './batiments.js';

const B = (c, p, s, r = [0, 0, 0]) => ({ g: boite(1, 1, 1), c, p, s, r });
const CY = (c, p, s, r = [0, 0, 0], n = 14) => ({ g: cylindre(1, 1, 1, n), c, p, s, r });
const CO = (c, p, s, r = [0, 0, 0], n = 12) => ({ g: cone(1, 1, n), c, p, s, r });
const SP = (c, p, s, r = [0, 0, 0]) => ({ g: sphere(14, 10), c, p, s, r });
const DS = (c, p, s, r = [0, 0, 0]) => ({ g: demiSphere(18, 8), c, p, s, r });
const TO = (c, p, s, r = [0, 0, 0], ep = .3, arc = Math.PI * 2) => ({ g: tore(1, ep, arc), c, p, s, r });
const T = (c, p, s, r = [0, 0, 0]) => ({ g: prisme(), c, p, s, r });

/* une géométrie en cache (partagée : on ne la libère jamais) */
const g$ = (cle, parts) => geo('deco-' + cle, () => fusion(parts()));
function maillage(gp, ep = .025, fen = null) {
  const g = new THREE.Group();
  const m = new THREE.Mesh(gp, toon()); m.castShadow = true; m.receiveShadow = true;
  g.add(m, new THREE.Mesh(gp, contourPour(gp, ep)));
  if (fen) g.add(new THREE.Mesh(fen, matFenetres));
  return g;
}
/* une fleur : la tige, 5 pétales, le cœur */
function fleur(p, x, z, c, h = .35, k = 1) {
  p.push(CY('#16a34a', [x, h / 2, z], [.02, h, .02]));
  for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2; p.push(SP(c, [x + Math.cos(a) * .06 * k, h, z + Math.sin(a) * .06 * k], [.05 * k, .025, .05 * k])); }
  p.push(SP('#facc15', [x, h + .02, z], .035 * k));
}
/* une petite dindie de pierre (ou de couleur) : pour les statues */
function dindie(p, c, y, k = 1) {
  const f = assombrir(c, .2);
  p.push(SP(c, [0, y + .45 * k, 0], [.36 * k, .34 * k, .4 * k]), SP(c, [0, y + .9 * k, .22 * k], .17 * k), CO('#facc15', [0, y + .9 * k, .42 * k], [.05 * k, .14 * k, .05 * k], [Math.PI / 2, 0, 0]));
  for (let i = 0; i < 7; i++) { const a = -1.1 + i * .37; p.push(SP(i % 2 ? f : c, [Math.sin(a) * .42 * k, y + .55 * k + Math.cos(a) * .4 * k, -.32 * k], [.1 * k, .3 * k, .04 * k], [-.35, 0, -a])); }
  p.push(SP('#ef4444', [.05 * k, y + .8 * k, .36 * k], [.03 * k, .07 * k, .03 * k]));
}

/* ── les familles ── */
const FAB = {
  massif(D) {
    return { g: maillage(g$(D.id, () => {
      const p = [SP('#7c4a22', [0, .02, 0], [.85, .08, .7])], r = hasard(D.id);
      for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2 + r(), d = i ? .25 + r() * .4 : 0; fleur(p, Math.cos(a) * d, Math.sin(a) * d * .8, D.couleur === 'arc' ? ARC[i % 8] : D.couleur, .25 + r() * .2); }
      for (let i = 0; i < 6; i++) p.push(SP('#22c55e', [(r() - .5) * 1.2, .08, (r() - .5) * .9], [.12, .08, .12]));
      return p;
    }), .02) };
  },
  fanions(D) {
    const T0 = TYPES[D.type];
    const g = maillage(g$(D.id, () => {
      const p = [CY('#8a5a3c', [-1, .9, 0], [.05, 1.8, .05]), CY('#8a5a3c', [1, .9, 0], [.05, 1.8, .05]), SP(T0.couleur, [-1, 1.82, 0], .07), SP(T0.couleur, [1, 1.82, 0], .07)];
      for (let i = 0; i < 6; i++) { const x = -.85 + i * .34, y = 1.68 - Math.sin((i + .5) / 6 * Math.PI) * .18; p.push(CO([T0.couleur, '#ffffff', T0.clair][i % 3], [x, y - .1, 0], [.12, .24, .02], [Math.PI, 0, 0], 3)); }
      p.push(CY('#78716c', [0, 1.62, 0], [.01, 2, .01], [0, 0, Math.PI / 2]));
      return p;
    }), .02);
    return { g };
  },
  statue(D) {
    const T0 = TYPES[D.type];
    return { g: maillage(g$(D.id, () => {
      const p = [CY('#d6d3d1', [0, .25, 0], [.6, .5, .6], [0, 0, 0], 8), CY('#e7e5e4', [0, .55, 0], [.5, .1, .5], [0, 0, 0], 8)];
      dindie(p, eclaircir(T0.couleur, .1), .6, 1);
      return p;
    })) };
  },
  arbre(D) {
    return { g: maillage(g$(D.id, () => {
      const p = [], r = hasard(D.id);
      if (D.sorte === 'sapin') {
        p.push(CY('#78350f', [0, .4, 0], [.15, .8, .15]));
        for (let k = 0; k < 3; k++) p.push(CO('#15803d', [0, 1.1 + k * .6, 0], [.9 - k * .22, 1, .9 - k * .22]));
        for (let i = 0; i < 10; i++) { const a = i * 2.4, h = .9 + r() * 1.5, rr = (2.2 - h) * .38 + .1; p.push(SP(ARC[i % 8], [Math.cos(a) * rr, h, Math.sin(a) * rr], .07)); }
        p.push(SP('#facc15', [0, 2.75, 0], .13));
      } else if (D.sorte === 'palmier') {
        for (let k = 0; k < 6; k++) p.push(CY('#a16207', [k * .05, .25 + k * .45, 0], [.16 - k * .012, .48, .16 - k * .012], [0, 0, -.06]));
        for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; p.push(SP('#16a34a', [.3 + Math.cos(a) * .7, 2.75, Math.sin(a) * .7], [.75, .06, .2], [0, -a, -.35])); }
        p.push(SP('#78350f', [.32, 2.65, .12], .1), SP('#78350f', [.22, 2.65, -.1], .1));
      } else {
        p.push(CY('#78350f', [0, .6, 0], [.16, 1.2, .16]));
        const c = D.sorte === 'cerisier' ? '#f9a8d4' : '#22c55e';
        [[0, 1.75, 0, .8], [.5, 1.5, .2, .55], [-.45, 1.55, -.15, .55], [.1, 1.55, -.5, .5], [-.1, 1.5, .5, .5]].forEach(([x, y, z, s]) => p.push(SP(c, [x, y, z], s)));
        if (D.sorte === 'cerisier') for (let i = 0; i < 8; i++) p.push(SP('#ffffff', [(r() - .5) * 1.4, 1.4 + r() * .7, (r() - .5) * 1.4], .07));
        else for (let i = 0; i < 9; i++) { const a = i * 2.1, h = 1.3 + r() * .7; p.push(SP('#ef4444', [Math.cos(a) * .72, h, Math.sin(a) * .72], .09)); }
      }
      return p;
    })) };
  },
  banc(D) {
    return { g: maillage(g$(D.id, () => [B(D.couleur, [0, .5, 0], [1.6, .08, .5]), B(D.couleur, [0, .85, -.22], [1.6, .4, .08]), B('#374151', [-.65, .25, 0], [.08, .5, .45]), B('#374151', [.65, .25, 0], [.08, .5, .45])])) };
  },
  lampadaire(D) {
    const fen = g$(D.id + '-vitre', () => [B('#fff3c4', [0, 2.15, 0], [.3, .38, .3])]);
    return { g: maillage(g$(D.id, () => [CY('#1f2937', [0, .08, 0], [.22, .16, .22]), CY('#374151', [0, 1.05, 0], [.05, 2, .05]), B('#1f2937', [0, 1.94, 0], [.38, .06, .38]), CO('#1f2937', [0, 2.48, 0], [.3, .25, .3], [0, Math.PI / 4, 0], 4), SP('#facc15', [0, 2.66, 0], .05)]), .02, fen) };
  },
  lampions(D) {
    const fen = g$(D.id + '-vitre', () => [-.6, -.2, .2, .6].map((x, i) => SP((D.couleurs || ['#ef4444', '#facc15', '#22c55e', '#3b82f6'])[i], [x, 1.55 - Math.abs(x) * -.1 - .1, 0], [.14, .17, .14])));
    return { g: maillage(g$(D.id, () => [CY('#8a5a3c', [-1, .9, 0], [.05, 1.8, .05]), CY('#8a5a3c', [1, .9, 0], [.05, 1.8, .05]), CY('#57534e', [0, 1.75, 0], [.01, 2, .01], [0, 0, Math.PI / 2])]), .02, fen) };
  },
  fontaine(D) {
    return { g: maillage(g$(D.id, () => [CY('#d6d3d1', [0, .25, 0], [1.1, .5, 1.1], [0, 0, 0], 20), CY('#60a5fa', [0, .46, 0], [.95, .06, .95], [0, 0, 0], 20), CY('#e7e5e4', [0, .8, 0], [.14, .8, .14]),
      CY('#e7e5e4', [0, 1.2, 0], [.45, .12, .45], [0, 0, 0], 16), SP('#93c5fd', [0, 1.38, 0], [.16, .3, .16]), SP('#bfdbfe', [0, 1.65, 0], .08)])) };
  },
  puits(D) {
    return { g: maillage(g$(D.id, () => {
      const p = [CY('#a8a29e', [0, .4, 0], [.6, .8, .6], [0, 0, 0], 12), CY('#1e3a8a', [0, .78, 0], [.5, .04, .5], [0, 0, 0], 12)];
      for (const s of [-1, 1]) p.push(CY('#8a5a3c', [s * .55, 1.1, 0], [.05, 1.4, .05]));
      p.push(T('#b45309', [0, 1.75, 0], [1.5, .55, 1], [0, 0, 0]), CY('#8a5a3c', [0, 1.4, 0], [.05, 1.1, .05], [0, 0, Math.PI / 2]), CY('#a16207', [0, 1.05, 0], [.12, .18, .12]));
      for (let i = 0; i < 5; i++) fleur(p, Math.cos(i * 1.3) * .75, Math.sin(i * 1.3) * .75, ['#f472b6', '#facc15', '#a78bfa'][i % 3], .25);
      return p;
    })) };
  },
  kiosque(D) {
    return { g: maillage(g$(D.id, () => {
      const p = [CY('#e7e5e4', [0, .15, 0], [2, .3, 2], [0, 0, 0], 8), CY('#f8fafc', [0, .32, 0], [1.9, .04, 1.9], [0, 0, 0], 8)];
      for (let i = 0; i < 8; i++) { const a = (i + .5) / 8 * Math.PI * 2; p.push(CY('#ffffff', [Math.cos(a) * 1.75, 1.3, Math.sin(a) * 1.75], [.07, 2, .07])); }
      p.push(CO('#ef4444', [0, 2.75, 0], [2.3, 1.1, 2.3], [0, Math.PI / 8, 0], 8), SP('#facc15', [0, 3.35, 0], .14));
      for (let i = 0; i < 8; i++) { const a = (i + .5) / 8 * Math.PI * 2; p.push(CY('#ffffff', [Math.cos(a) * 1.75, .6, Math.sin(a) * 1.75], [.03, .5, .03])); }
      p.push(CY('#facc15', [-.4, .75, -.3], [.08, .7, .08]), SP('#facc15', [-.4, 1.15, -.3], [.2, .12, .2]), CY('#1f2937', [.5, .7, .2], [.03, .7, .03]), B('#1f2937', [.5, 1.05, .2], [.4, .3, .03], [-.3, 0, 0]));
      return p;
    })) };
  },
  arche(D) {
    return { g: maillage(g$(D.id, () => {
      const p = [TO('#a16207', [0, .1, 0], [1.1, 1.8, 1], [0, 0, 0], .06, Math.PI)], r = hasard(D.id);
      for (let i = 0; i < 14; i++) { const a = i / 13 * Math.PI; p.push(SP('#22c55e', [Math.cos(a) * 1.1, .1 + Math.sin(a) * 1.8, 0], .13)); if (i % 2) p.push(SP(['#f472b6', '#ffffff', '#facc15'][i % 3], [Math.cos(a) * 1.1, .1 + Math.sin(a) * 1.8, .1], .07)); }
      void r; return p;
    }), .02) };
  },
  balancoire(D) {
    const g = maillage(g$(D.id, () => [CY('#a16207', [-1, 1.1, -.35], [.06, 2.3, .06], [.3, 0, 0]), CY('#a16207', [-1, 1.1, .35], [.06, 2.3, .06], [-.3, 0, 0]),
      CY('#a16207', [1, 1.1, -.35], [.06, 2.3, .06], [.3, 0, 0]), CY('#a16207', [1, 1.1, .35], [.06, 2.3, .06], [-.3, 0, 0]), CY('#78350f', [0, 2.15, 0], [.07, 2.1, .07], [0, 0, Math.PI / 2])]), .02);
    const siege = maillage(g$(D.id + '-siege', () => [CY('#78716c', [-.3, -.7, 0], [.012, 1.4, .012]), CY('#78716c', [.3, -.7, 0], [.012, 1.4, .012]), B('#ef4444', [0, -1.42, 0], [.75, .06, .3])]), .015);
    siege.position.y = 2.15; g.add(siege);
    return { g, maj: (dt, t) => { siege.rotation.x = Math.sin(t * 1.6) * .35; } };
  },
  nichoir(D) {
    return { g: maillage(g$(D.id, () => [CY('#8a5a3c', [0, .8, 0], [.05, 1.6, .05]), B('#fde68a', [0, 1.75, 0], [.36, .4, .36]), T('#ef4444', [0, 1.95, 0], [.5, .25, .46], [0, Math.PI / 2, 0]),
      CY('#3f2a1d', [0, 1.78, .18], [.07, .02, .07], [Math.PI / 2, 0, 0]), SP('#60a5fa', [.12, 2.12, .05], [.07, .06, .09]), SP('#60a5fa', [.12, 2.18, .1], .045)]), .02) };
  },
  epouvantail(D) {
    return { g: maillage(g$(D.id, () => [CY('#8a5a3c', [0, .9, 0], [.05, 1.8, .05]), CY('#8a5a3c', [0, 1.3, 0], [.04, 1.2, .04], [0, 0, Math.PI / 2]), B('#3b82f6', [0, 1.15, 0], [.5, .55, .25]),
      B('#ef4444', [0, 1.3, .13], [.5, .2, .02]), SP('#fde68a', [0, 1.65, 0], .2), CY('#a16207', [0, 1.83, 0], [.32, .03, .32]), CO('#a16207', [0, 1.95, 0], [.16, .22, .16]),
      SP('#facc15', [-.62, 1.3, 0], [.08, .12, .08]), SP('#facc15', [.62, 1.3, 0], [.08, .12, .08]), SP('#111827', [-.07, 1.68, .18], .025), SP('#111827', [.07, 1.68, .18], .025)]), .02) };
  },
  moulinet(D) {
    const g = maillage(g$(D.id, () => [CY('#e7e5e4', [0, .7, 0], [.25, 1.4, .35], [0, 0, 0], 8), CO('#3b82f6', [0, 1.6, 0], [.4, .4, .4], [0, 0, 0], 8)]), .02);
    const ailes = maillage(g$(D.id + '-ailes', () => [0, 1, 2, 3].map(k => B(k % 2 ? '#ffffff' : '#60a5fa', [Math.cos(k * Math.PI / 2) * .42, Math.sin(k * Math.PI / 2) * .42, 0], [.8, .16, .02], [0, 0, k * Math.PI / 2]))), .015);
    ailes.position.set(0, 1.35, .3); g.add(ailes);
    return { g, maj: (dt) => { ailes.rotation.z -= dt * 1.2; } };
  },
  ballons(D) {
    const g = new THREE.Group();
    g.add(maillage(g$(D.id + '-poids', () => [B('#a16207', [0, .1, 0], [.25, .2, .25])]), .015));
    const b = maillage(g$(D.id, () => {
      const p = [];
      [[0, 2, 0, '#ef4444'], [.35, 1.8, .1, '#facc15'], [-.3, 1.85, .15, '#3b82f6'], [.1, 1.7, -.32, '#22c55e'], [-.15, 2.2, -.2, '#ec4899']].forEach(([x, y, z, c]) => {
        p.push(SP(c, [x, y, z], [.22, .27, .22]), CY('#d6d3d1', [x / 2, y / 2, z / 2], [.006, Math.hypot(x, y - .2, z), .006], [Math.atan2(z, y) * .5, 0, -Math.atan2(x, y) * .9]));
      });
      return p;
    }), .015);
    g.add(b);
    return { g, maj: (dt, t) => { b.position.y = Math.sin(t * 1.3) * .06; b.rotation.y = Math.sin(t * .7) * .2; } };
  },
  citrouilles(D) {
    return { g: maillage(g$(D.id, () => {
      const p = [];
      [[0, 0, .38], [.5, .2, .26], [-.42, .25, .3]].forEach(([x, z, s]) => { for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2; p.push(SP('#f97316', [x + Math.cos(a) * s * .35, s * .8, z + Math.sin(a) * s * .35], [s * .55, s * .8, s * .55])); } p.push(CY('#65a30d', [x, s * 1.55, z], [.04, .14, .04])); });
      return p;
    })) };
  },
  bonhomme(D) {
    return { g: maillage(g$(D.id, () => [SP('#ffffff', [0, .45, 0], .45), SP('#ffffff', [0, 1.05, 0], .33), SP('#ffffff', [0, 1.5, 0], .23), CO('#f97316', [0, 1.5, .3], [.05, .2, .05], [Math.PI / 2, 0, 0]),
      SP('#111827', [-.08, 1.58, .2], .03), SP('#111827', [.08, 1.58, .2], .03), TO('#ef4444', [0, 1.3, 0], [.25, .25, .25], [Math.PI / 2, 0, 0], .35), B('#ef4444', [.15, 1.12, .2], [.1, .3, .04], [0, 0, .2]),
      CY('#111827', [0, 1.72, 0], [.2, .03, .2]), CY('#111827', [0, 1.86, 0], [.13, .26, .13]), SP('#111827', [0, 1.1, .32], .03), SP('#111827', [0, .95, .32], .03)])) };
  },
  rocher(D) {
    return { g: maillage(g$(D.id, () => [SP('#9ca3af', [0, .3, 0], [.75, .45, .6], [0, .4, .1]), SP('#a8a29e', [.45, .2, .25], [.35, .25, .3]), SP('#65a30d', [-.1, .66, -.05], [.45, .08, .38]), SP('#84cc16', [.35, .4, .35], [.2, .05, .15])])) };
  },
  mare(D) {
    return { g: maillage(g$(D.id, () => {
      const p = [CY('#3b82f6', [0, .03, 0], [1.4, .04, 1.1], [0, 0, 0], 22), CY('#60a5fa', [0, .05, 0], [1.2, .04, .95], [0, 0, 0], 22)];
      for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; p.push(SP('#a8a29e', [Math.cos(a) * 1.45, .06, Math.sin(a) * 1.15], [.2, .1, .16])); }
      [[.4, .3], [-.5, -.2], [.1, -.5]].forEach(([x, z]) => p.push(CY('#22c55e', [x, .08, z], [.2, .02, .2])));
      p.push(SP('#facc15', [-.2, .2, .2], [.16, .12, .22]), SP('#facc15', [-.2, .33, .36], .09), CO('#f97316', [-.2, .32, .47], [.03, .08, .03], [Math.PI / 2, 0, 0]));
      fleur(p, .42, .3, '#f9a8d4', .12, .8);
      return p;
    }), .02) };
  },
  parasol(D) {
    return { g: maillage(g$(D.id, () => {
      const p = [CY('#ffffff', [0, .5, 0], [.45, .05, .45]), CY('#9ca3af', [0, .25, 0], [.04, .5, .04]), CY('#9ca3af', [0, 1.1, 0], [.03, 2.2, .03])];
      for (let i = 0; i < 8; i++) p.push(CO(i % 2 ? (D.couleurs ? D.couleurs[1] : '#ffffff') : (D.couleurs ? D.couleurs[0] : '#ef4444'), [0, 2.1, 0], [1.1, .4, 1.1], [0, i * Math.PI / 4, 0], 3));
      for (const s of [-1, 1]) p.push(B('#facc15', [s * .75, .3, 0], [.3, .05, .3]), B('#facc15', [s * .88, .5, 0], [.05, .4, .3]));
      return p;
    })) };
  },
  haie(D) {
    return { g: maillage(g$(D.id, () => {
      const p = [B(D.couleur, [0, .4, 0], [1.6, .8, .6]), SP(D.couleur, [-.55, .75, 0], [.3, .15, .3]), SP(D.couleur, [0, .8, 0], [.35, .15, .3]), SP(D.couleur, [.55, .75, 0], [.3, .15, .3])];
      if (D.fleurs) for (let i = 0; i < 8; i++) p.push(SP(['#f472b6', '#ffffff', '#facc15'][i % 3], [-.65 + i * .19, .5 + (i % 2) * .2, .31], .06));
      return p;
    })) };
  },
  barriere(D) {
    return { g: maillage(g$(D.id, () => [B(D.couleur, [-.8, .4, 0], [.1, .8, .1]), B(D.couleur, [0, .4, 0], [.1, .8, .1]), B(D.couleur, [.8, .4, 0], [.1, .8, .1]), B(D.couleur, [0, .55, 0], [1.7, .1, .05]), B(D.couleur, [0, .3, 0], [1.7, .1, .05])]), .02) };
  },
  /* ── les décorations de fête (étape 8) ── */
  fantomes(D) {
    const b = maillage(g$(D.id, () => {
      const p = [];
      [[0, 0, 1], [.55, .25, .75], [-.5, .3, .7]].forEach(([x, z, k]) => {
        p.push(SP('#f8fafc', [x, .62 * k, z], [.32 * k, .42 * k, .32 * k]), CO('#f8fafc', [x, .28 * k, z], [.34 * k, .36 * k, .34 * k], [0, 0, 0], 10));
        for (const s of [-1, 1]) p.push(SP('#111827', [x + s * .1 * k, .7 * k, z + .27 * k], [.05 * k, .08 * k, .03 * k]));
        p.push(SP('#111827', [x, .55 * k, z + .29 * k], [.06 * k, .05 * k, .03 * k]));
      });
      p.push(SP('#f97316', [.1, .14, .55], [.16, .13, .16]), CY('#65a30d', [.1, .28, .55], [.025, .06, .025]));
      return p;
    }), .02), g = new THREE.Group();
    g.add(b);
    return { g, maj: (dt, t) => { b.position.y = .08 + Math.sin(t * 1.6) * .08; } };
  },
  cadeaux(D) {
    return { g: maillage(g$(D.id, () => {
      const p = [];
      [[0, 0, .5, '#dc2626', '#facc15'], [.5, .15, .36, '#16a34a', '#ffffff'], [-.42, .2, .4, '#2563eb', '#f472b6'], [.05, .05, .3, '#facc15', '#dc2626', .5]].forEach(([x, z, c, c1, c2, y = 0]) => {
        p.push(B(c1, [x, y + c / 2, z], [c, c, c]), B(c2, [x, y + c / 2, z], [c + .02, c + .02, c * .18]), B(c2, [x, y + c / 2, z], [c * .18, c + .02, c + .02]));
        for (const s of [-1, 1]) p.push(SP(c2, [x + s * c * .14, y + c + .04, z], [c * .16, c * .1, c * .1], [0, 0, s * .5]));
      });
      return p;
    }), .02) };
  },
  oeufs(D) {
    return { g: maillage(g$(D.id, () => {
      const p = [CY('#b45309', [0, .18, 0], [.55, .36, .45], [0, 0, 0], 16), TO('#92400e', [0, .62, 0], [.5, .5, .5], [0, 0, 0], .06, Math.PI)];
      [[-.25, .1, '#f9a8d4'], [.05, .2, '#93c5fd'], [.28, -.05, '#fde047'], [-.05, -.18, '#86efac'], [.22, .2, '#c4b5fd']].forEach(([x, z, c]) => p.push(SP(c, [x, .42, z], [.13, .17, .13], [.2, 0, .3])));
      [[.75, .3, '#f9a8d4'], [-.7, .35, '#fde047']].forEach(([x, z, c]) => p.push(SP(c, [x, .14, z], [.11, .15, .11])));
      return p;
    }), .02) };
  },
  chateauSable(D) {
    return { g: maillage(g$(D.id, () => {
      const p = [B('#fcd34d', [0, .25, 0], [1.1, .5, .9]), CY('#fbbf24', [0, .02, 0], [.9, .04, .8], [0, 0, 0], 18)];
      for (const [x, z] of [[-.5, -.4], [.5, -.4], [-.5, .4], [.5, .4]]) p.push(CY('#fcd34d', [x, .42, z], [.2, .84, .2], [0, 0, 0], 10), CO('#f59e0b', [x, .98, z], [.23, .28, .23], [0, 0, 0], 10));
      p.push(CY('#fcd34d', [0, .75, 0], [.28, .5, .28], [0, 0, 0], 10), CO('#f59e0b', [0, 1.14, 0], [.3, .3, .3], [0, 0, 0], 10), CY('#78350f', [0, 1.4, 0], [.012, .3, .012]), B('#38bdf8', [.09, 1.48, 0], [.18, .1, .01]));
      p.push(B('#a16207', [0, .2, .46], [.25, .32, .03]), SP('#fca5a5', [.75, .06, .5], [.12, .05, .1]), CY('#ef4444', [-.8, .2, .4], [.1, .26, .1]));
      return p;
    }), .02) };
  },
  dalles(D) {
    return { g: maillage(g$(D.id, () => {
      const p = [], r = hasard(D.id);
      for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) p.push(B(i === j ? assombrir(D.couleur, .08) : D.couleur, [i * .46 + (r() - .5) * .05, .03, j * .46 + (r() - .5) * .05], [.42, .06, .42], [0, (r() - .5) * .15, 0]));
      return p;
    }), .015) };
  }
};

export function fabDeco(id) {
  const D = DECORATIONS[id], f = D && FAB[D.famille];
  if (!f) return null;
  const R = f(D); R.D = D;
  return R;
}
/* un aperçu (le « fantôme ») pendant qu'on cherche où poser : transparent, vert ou rouge */
export function fantome(id) {
  const R = fabDeco(id); if (!R) return null;
  const mats = [new THREE.MeshBasicMaterial({ color: '#4ade80', transparent: true, opacity: .55, depthWrite: false }), new THREE.MeshBasicMaterial({ color: '#f87171', transparent: true, opacity: .55, depthWrite: false })];
  const meshes = [];
  R.g.traverse(o => { if (o.isMesh) meshes.push(o); });
  for (const o of meshes) if (o.material.side === THREE.BackSide) o.visible = false; else o.material = mats[0];
  const anneau = new THREE.Mesh(new THREE.RingGeometry(Math.max(.3, R.D.rayon) - .08, Math.max(.3, R.D.rayon) + .06, 32), mats[0]);
  anneau.rotation.x = -Math.PI / 2; anneau.position.y = .05; R.g.add(anneau);
  R.valide = v => { const m = mats[v ? 0 : 1]; for (const o of meshes) if (o.visible) o.material = m; anneau.material = m; };
  R.liberer = () => { R.g.parent && R.g.parent.remove(R.g); mats.forEach(m => m.dispose()); anneau.geometry.dispose(); };
  return R;
}
