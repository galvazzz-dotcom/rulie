/* ══════════ UNE RÉGION DU ROYAUME ══════════
   Ce qui est commun à toutes les îles : le sol, la mer, la montgolfière du Capitaine Zéphyr,
   le guide de la région, les lampes, la nuit, la pluie, les trouvailles du jour et les objets de quête.
   Ce qui est propre à chaque île (bâtiments, végétation, coins des dindies) est dans regions/*.js.
   construireRegion(id) → un « lieu » : { racine, grille, interactifs, pnj, sol, zones, maj, liberer, … } */
import * as THREE from 'three';
import { creerGrille } from './carte.js';
import { creerIle, construireSol } from './ile.js';
import { construireLampes, construireNuit } from './decor.js';
import { B, CY, CO, SP, TO, construire } from './fabrique.js';
import { fusion, sphere } from '../moteur/formes.js';
import { toon, contourPour, texRonde } from '../moteur/materiaux.js';
import { libererGroupe } from '../moteur/liberer.js';
import { matFenetres } from './batiments.js';
import { creerChibi, PERSONNAGES } from '../personnages/chibi.js';
import { REGIONS } from '../donnees/regions.js';
import { trouvaillesDuJour } from '../jeu/trouvailles.js';
import { hasard } from '../moteur/couleurs.js';
import PRES from './regions/pres.js';
import MAROC from './regions/maroc.js';
import BELGIQUE from './regions/belgique.js';
import JUNGLE from './regions/jungle.js';
import BANQUISE from './regions/banquise.js';
import VOLCAN from './regions/volcan.js';
import FORET from './regions/foret.js';
import NUAGES from './regions/nuages.js';

const DEFS = { pres: PRES, maroc: MAROC, belgique: BELGIQUE, jungle: JUNGLE, banquise: BANQUISE, volcan: VOLCAN, foret: FORET, nuages: NUAGES };
export const regionConstruite = id => !!DEFS[id];

export function construireRegion(id) {
  const R = REGIONS[id], D = DEFS[id], racine = new THREE.Group(); racine.name = 'region-' + id;
  const ile = creerIle(D.ile);
  const grille = creerGrille(-ile.a * 1.15, -ile.b * 1.15, ile.a * 2.3, ile.b * 2.3, .5);
  grille.boucherSi((x, z) => ile.forme(x, z) > .985);
  const sol = construireSol(racine, ile, D.sol);
  const interactifs = [], majs = [], reserves = [], pnj = {};
  const r = hasard('region-' + id);

  /* poser un bâtiment (à la hauteur du sol), avec ses obstacles */
  const placer = (b, x, z, rot = 0, y = ile.sol(x, z)) => {
    b.g.position.set(x, y, z); b.g.rotation.y = rot; racine.add(b.g);
    const c = Math.cos(rot), s = Math.sin(rot), tourne = ([lx, lz]) => [x + lx * c + lz * s, z - lx * s + lz * c];
    for (const [ox, oz, w, d] of b.obst || []) { const [cx, cz] = tourne([ox, oz]); const swap = Math.abs(s) > .5; grille.boucherRect(cx, cz, swap ? d : w, swap ? w : d, 0, .2); }
    if (b.maj) majs.push(b.maj);
    b.porteMonde = b.porte ? tourne(b.porte) : null;
    return b;
  };
  const ajouterInteractif = o => { const I = { rayon: 1.8, ...o }; interactifs.push(I); return I; };
  const reserver = (x, z, rr) => reserves.push([x, z, rr]);
  const ajouterPnj = (pid, x, z, rot) => {
    const c = creerChibi(PERSONNAGES[pid]); c.racine.position.set(x, ile.sol(x, z), z); c.racine.rotation.y = rot; racine.add(c.racine);
    grille.boucherCercle(x, z, .45);
    pnj[pid] = { id: pid, c, x, z, r0: rot };
    ajouterInteractif({ id: 'pnj-' + pid, e: '💬', texte: PERSONNAGES[pid].nom, x, z: z + 1.2, cible: c.racine, pnj: pid, rayon: 2.2 });
    reserver(x, z, 2.6);
  };

  /* ── la montgolfière (pour rentrer, ou aller ailleurs) et le Capitaine ── */
  const [bx, bz] = D.ballon;
  const ballon = placer(ballonPose(), bx, bz);
  ajouterInteractif({ id: 'ballon', e: '🎈', texte: 'La montgolfière', x: ballon.porteMonde[0], z: ballon.porteMonde[1], cible: ballon.g, rayon: 2.6 });
  reserver(bx, bz, 6); reserver(...D.depart, 3);
  ajouterPnj('zephyr', ...D.zephyr);
  ajouterPnj(R.guide, ...D.guide);
  for (const p of D.cachettes) reserver(p[0], p[1], 1.4);
  for (const p of Object.values(D.quete || {})) reserver(p[0], p[1], 1.8);

  /* ── ce qui est propre à l'île : bâtiments, végétation, gadgets ── */
  const ctx = {
    racine, grille, ile, sol, r, placer, ajouterInteractif, reserver, majs, pnj,
    peutPlanter: (x, z, rr) => {
      if (ile.forme(x, z) > .9) return false;
      for (const [cx, cz, cr] of reserves) if (Math.hypot(x - cx, z - cz) < cr + rr) return false;
      for (const [dx, dz] of [[0, 0], [rr, 0], [-rr, 0], [0, rr], [0, -rr]]) if (!grille.libreEn(x + dx, z + dz)) return false;
      return true;
    }
  };
  const extra = D.construire(ctx) || {};

  /* ── les lampes, la nuit, la pluie ── */
  for (const [x, z] of D.lampes || []) grille.boucherCercle(x, z, .25);
  const lum = construireLampes(racine, D.lampes || []);
  const nuitCiel = construireNuit(racine);
  const pluie = creerPluie(racine, !!D.neige);

  /* ── les trouvailles du jour ── */
  const trouvailles = new Map();
  for (const o of trouvaillesDuJour(id, D.cachettes)) {
    const m = modeleTrouvaille(o.sorte); m.g.position.set(o.p[0], ile.sol(o.p[0], o.p[1]), o.p[1]); m.g.rotation.y = r() * 6; racine.add(m.g);
    const I = ajouterInteractif({ id: 'trouv-' + o.id, e: o.sorte === 'coffre' ? '🧰' : o.sorte === 'oeuf' ? '🥚' : '💎', texte: o.sorte === 'coffre' ? 'Ouvrir' : 'Ramasser', x: o.p[0], z: o.p[1], cible: m.g, trouvaille: o, rayon: 1.7 });
    grille.boucherCercle(o.p[0], o.p[1], .4);
    trouvailles.set(o.id, { o, m, I });
  }
  function retirerTrouvaille(oid) {
    const T = trouvailles.get(oid); if (!T) return;
    const k = interactifs.indexOf(T.I); if (k >= 0) interactifs.splice(k, 1);
    trouvailles.delete(oid);
    T.m.ouvrir(() => racine.remove(T.m.g));
  }

  /* ── les objets de quête (plumes, boules…) ── */
  const objets = new Map();
  function poserObjet(oid, sorte) {
    if (objets.has(oid) || !D.quete || !D.quete[oid]) return;
    const [x, z] = D.quete[oid], o = modeleObjet(sorte); o.g.position.set(x, ile.sol(x, z), z); racine.add(o.g);
    const I = ajouterInteractif({ id: 'objet-' + oid, e: (MODELES_OBJETS[sorte] || {}).e || (sorte === 'plume' ? '🪶' : '🔘'), texte: 'Ramasser', x, z, cible: o.g, objet: oid, rayon: 1.6 });
    objets.set(oid, { o, I });
  }
  function retirerObjet(oid) {
    const O = objets.get(oid); if (!O) return;
    racine.remove(O.o.g); const k = interactifs.indexOf(O.I); if (k >= 0) interactifs.splice(k, 1); objets.delete(oid);
  }

  return {
    id, nom: R.nom, region: R, racine, grille, interactifs, pnj, ile, sol: ile.sol, zones: D.zones, depart: D.depart, lieux: D.lieux,
    brume: D.brume || [60, 170], teinte: D.teinte || null, ambiance: R.ambiance, poserObjet, retirerObjet, objets, trouvailles, retirerTrouvaille,
    gadgets: extra.gadgets || {}, extra, pluie,
    maj(dt, t, nuit, camPos, pluieK, cible) {
      sol.maj(dt, t, nuit); nuitCiel.maj(t, nuit, camPos); lum.majNuit(nuit);
      matFenetres.emissiveIntensity = nuit * 1.4;
      pluie.maj(dt, cible || camPos, pluieK);
      for (const f of majs) f(dt, t, nuit);
      for (const O of objets.values()) O.o.maj(dt, t);
      for (const T of trouvailles.values()) T.m.maj(dt, t);
      for (const P of Object.values(pnj)) P.c.maj(dt, t);
    },
    liberer() { libererGroupe(racine); }
  };
}

/* ── la montgolfière posée (toujours gonflée ici) ── */
function ballonPose() {
  const p = [CY('#a0764a', [0, .2, 0], [2.6, .4, 2.6], [0, 0, 0], 24), CY('#8a5a3c', [0, .42, 0], [2.7, .06, 2.7], [0, 0, 0], 24)];
  for (let k = 0; k < 4; k++) p.push(B('#d6c6a5', [Math.cos(k * 1.57 + .4) * 2.2, .62, Math.sin(k * 1.57 + .4) * 2.2], [.45, .35, .35], [0, k, 0]));
  const g = construire(p, []);
  const ballon = new THREE.Group(); ballon.position.set(0, .45, 0); g.add(ballon);
  ballon.add(construire([CY('#b07a45', [0, .45, 0], [.85, .9, .85], [0, 0, 0], 16), TO('#8a5a3c', [0, .9, 0], [.86, .86, .86], [Math.PI / 2, 0, 0], .08)], []));
  const gores = [];
  for (let k = 0; k < 10; k++) gores.push({ g: new THREE.SphereGeometry(1, 3, 16, k / 10 * Math.PI * 2, Math.PI * 2 / 10), c: k % 2 ? '#facc15' : '#ef4444', p: [0, 0, 0], s: 1 });
  const geoB = fusion(gores);
  const env = new THREE.Group(); env.add(new THREE.Mesh(geoB, contourPour(geoB, .02)), Object.assign(new THREE.Mesh(geoB, toon()), { castShadow: true }));
  env.scale.set(2.3, 2.7, 2.3); env.position.set(0, 5.4, 0); ballon.add(env);
  ballon.add(construire([0, 1, 2, 3].map(k => CY('#78716c', [Math.cos(k * 1.57) * .7, 2.2, Math.sin(k * 1.57) * .7], [.025, 2.7, .025], [Math.sin(k * 1.57) * .25, 0, -Math.cos(k * 1.57) * .25])), [], 0));
  return { g, obst: [[0, 0, 5.4, 5.4]], porte: [0, 3.4], maj: (dt, t) => { ballon.position.y = .45 + Math.sin(t * 1.2) * .08; env.rotation.y = Math.sin(t * .4) * .05; } };
}

/* ── la pluie : des traits qui tombent autour de Roullieee (ou, sur la Banquise, de gros flocons qui tombent doucement) ── */
function creerPluie(racine, neige = false) {
  const N = neige ? 700 : 900, pos = new Float32Array(N * 6), base = [], v = [];
  for (let i = 0; i < N; i++) { base.push([(Math.random() - .5) * 56, Math.random() * 24, (Math.random() - .5) * 56]); v.push(neige ? 1.6 + Math.random() * 1.4 : 15 + Math.random() * 7); }
  if (neige) {
    const gN = new THREE.BufferGeometry(), pN = new Float32Array(N * 3); gN.setAttribute('position', new THREE.BufferAttribute(pN, 3));
    const mN = new THREE.PointsMaterial({ color: '#ffffff', size: .22, map: texRonde(), transparent: true, opacity: 0, depthWrite: false });
    const P = new THREE.Points(gN, mN); P.frustumCulled = false; P.visible = false; racine.add(P);
    let kN = 0, t = 0;
    return {
      force: () => kN,
      maj(dt, cible, voulu) {
        kN += (voulu - kN) * Math.min(1, dt * .7); t += dt;
        mN.opacity = .9 * kN; P.visible = kN > .02;
        if (!P.visible) return;
        for (let i = 0; i < N; i++) {
          const b = base[i]; b[1] -= v[i] * dt; if (b[1] < 0) b[1] += 24;
          pN[i * 3] = cible.x + b[0] + Math.sin(t * .8 + i) * .6; pN[i * 3 + 1] = b[1]; pN[i * 3 + 2] = cible.z + b[2] + Math.cos(t * .7 + i * 1.3) * .6;
        }
        gN.attributes.position.needsUpdate = true;
      }
    };
  }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const m = new THREE.LineBasicMaterial({ color: '#dbeafe', transparent: true, opacity: 0, depthWrite: false });
  const L = new THREE.LineSegments(g, m); L.frustumCulled = false; L.visible = false; racine.add(L);
  let k = 0;
  return {
    force: () => k,
    maj(dt, cible, voulu) {
      k += (voulu - k) * Math.min(1, dt * .7);
      m.opacity = .55 * k; L.visible = k > .02;
      if (!L.visible) return;
      for (let i = 0; i < N; i++) {
        const b = base[i]; b[1] -= v[i] * dt; if (b[1] < 0) b[1] += 24;
        const x = cible.x + b[0], y = b[1], z = cible.z + b[2];
        pos[i * 6] = x; pos[i * 6 + 1] = y; pos[i * 6 + 2] = z; pos[i * 6 + 3] = x + .06; pos[i * 6 + 4] = y + .75; pos[i * 6 + 5] = z + .04;
      }
      g.attributes.position.needsUpdate = true;
    }
  };
}

/* ── les trouvailles : coffre (qui s'ouvre), œuf mystère, pierre d'éveil ── */
function lueur(couleur, taille = 1.8) {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: texRonde(), color: couleur, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: .7 }));
  s.scale.setScalar(taille); return s;
}
function modeleTrouvaille(sorte) {
  const g = new THREE.Group();
  if (sorte === 'coffre') {
    g.add(construire([B('#8a5a3c', [0, .3, 0], [1.1, .6, .72]), B('#facc15', [-.4, .3, 0], [.08, .62, .74]), B('#facc15', [.4, .3, 0], [.08, .62, .74]), B('#facc15', [0, .42, .37], [.18, .18, .04])], [], .03));
    const couv = new THREE.Group(); couv.position.set(0, .6, -.36); g.add(couv);
    couv.add(construire([CY('#a0764a', [0, 0, .36], [.36, 1.1, .36], [0, 0, Math.PI / 2], 14), B('#facc15', [-.4, .05, .36], [.08, .4, .76]), B('#facc15', [.4, .05, .36], [.08, .4, .76])], [], .03));
    couv.children[0].scale.set(1, 1, 1);
    const l = lueur('#fde68a', 2.2); l.position.y = .7; g.add(l);
    let ouvert = -1, fin = null;
    return {
      g, ouvrir: f => { ouvert = 0; fin = f; },
      maj: (dt, t) => {
        l.material.opacity = ouvert < 0 ? .35 + Math.sin(t * 3) * .2 : Math.max(0, .9 - ouvert);
        if (ouvert >= 0) { ouvert += dt; couv.rotation.x = -Math.min(1.9, ouvert * 4); if (ouvert > 1.4) { g.scale.setScalar(Math.max(.01, 1 - (ouvert - 1.4) * 3)); } if (ouvert > 1.75 && fin) { fin(); fin = null; } }
      }
    };
  }
  if (sorte === 'oeuf') {
    g.add(construire([TO('#c08a3e', [0, .12, 0], [.42, .42, .3], [Math.PI / 2, 0, 0], .45), SP('#a16207', [0, .08, 0], [.36, .08, .36])], [], .02));
    const oeuf = construire([SP('#fef3c7', [0, 0, 0], [.27, .36, .27]), SP('#f472b6', [.12, .1, .2], .06), SP('#60a5fa', [-.15, -.02, .18], .05), SP('#a3e635', [.02, .2, -.22], .05), SP('#f59e0b', [-.2, .12, -.08], .045)], [], .02);
    oeuf.position.y = .48; g.add(oeuf);
    const l = lueur('#fef9c3', 1.6); l.position.y = .5; g.add(l);
    return { g, ouvrir: f => { g.visible = false; f(); }, maj: (dt, t) => { oeuf.rotation.z = Math.sin(t * 4) * .12 * (Math.sin(t * .9) > .6 ? 1 : 0); l.material.opacity = .35 + Math.sin(t * 2.5) * .2; } };
  }
  const cristal = new THREE.Mesh(new THREE.OctahedronGeometry(.32, 0), toon('#c084fc'));
  cristal.scale.set(1, 1.5, 1); cristal.castShadow = true;
  const c2 = new THREE.Mesh(cristal.geometry, contourPour(cristal.geometry, .025)); cristal.add(c2);
  const pied = construire([SP('#a8a29e', [0, .1, 0], [.45, .18, .4])], [], .02);
  g.add(pied, cristal);
  const l = lueur('#d8b4fe', 2); l.position.y = .8; g.add(l);
  return { g, ouvrir: f => { g.visible = false; f(); }, maj: (dt, t) => { cristal.position.y = .8 + Math.sin(t * 2) * .1; cristal.rotation.y = t * 1.2; l.material.opacity = .4 + Math.sin(t * 3) * .25; } };
}
/* les objets des légendes et des grandes quêtes : une petite forme, une couleur, une lueur */
const MODELES_OBJETS = {
  statuette: { e: '🏺', l: '#fde68a', p: () => [SP('#facc15', [0, .42, 0], [.18, .22, .16]), SP('#facc15', [0, .7, .04], .12), B('#ca8a04', [0, .2, 0], [.26, .14, .26])] },
  etoileGlace: { e: '❄️', l: '#e0f2fe', p: () => [0, 1, 2].map(k => B('#bae6fd', [0, .5, 0], [.08, .7, .08], [0, 0, k * Math.PI / 3])).concat([SP('#ffffff', [0, .5, 0], .1)]) },
  pierreLave: { e: '🪨', l: '#fb923c', p: () => [SP('#292524', [0, .45, 0], [.28, .22, .25]), SP('#f97316', [.1, .52, .18], [.08, .05, .04]), SP('#ef4444', [-.12, .48, .16], [.06, .04, .04])] },
  eclatLune: { e: '🌙', l: '#fef9c3', p: () => [TO('#fde68a', [0, .5, 0], [.28, .28, .28], [0, 0, .6], .28, Math.PI * 1.2)] },
  plumeEclair: { e: '⚡', l: '#fde047', p: () => [SP('#facc15', [0, .5, 0], [.13, .42, .035]), SP('#ffffff', [0, .6, .02], [.06, .22, .02]), CY('#fef3c7', [0, .18, 0], [.015, .3, .015])] },
  graineAncienne: { e: '🌾', l: '#bbf7d0', p: () => [SP('#a16207', [0, .45, 0], [.16, .24, .16]), SP('#4ade80', [0, .72, 0], [.05, .12, .05])] },
  fragmentCarte: { e: '🗺️', l: '#fef3c7', p: () => [CY('#fef3c7', [0, .45, 0], [.1, .55, .1], [0, 0, Math.PI / 2]), CY('#b45309', [.29, .45, 0], [.12, .04, .12], [0, 0, Math.PI / 2]), CY('#b45309', [-.29, .45, 0], [.12, .04, .12], [0, 0, Math.PI / 2])] },
  cleCanal: { e: '🗝️', l: '#e7e5e4', p: () => [TO('#a8a29e', [0, .7, 0], [.13, .13, .13], [0, 0, 0], .3), CY('#a8a29e', [0, .4, 0], [.04, .45, .04]), B('#a8a29e', [.07, .25, 0], [.12, .06, .04])] },
  masqueJade: { e: '🎭', l: '#86efac', p: () => [SP('#22c55e', [0, .5, 0], [.26, .32, .1]), SP('#14532d', [-.09, .56, .08], .04), SP('#14532d', [.09, .56, .08], .04), B('#facc15', [0, .38, .08], [.12, .03, .02])] },
  eclatGlace: { e: '🧊', l: '#93c5fd', p: () => [CO('#60a5fa', [0, .55, 0], [.18, .5, .18], [0, 0, 0], 6), CO('#93c5fd', [0, .3, 0], [.18, .25, .18], [Math.PI, 0, 0], 6)] },
  goutteFeu: { e: '🔶', l: '#fdba74', p: () => [SP('#f97316', [0, .42, 0], [.2, .2, .2]), CO('#f97316', [0, .65, 0], [.15, .3, .15], [0, 0, 0], 10)] },
  noteMusique: { e: '🎶', l: '#c4b5fd', p: () => [SP('#7c3aed', [0, .32, 0], [.15, .11, .11], [0, 0, .4]), CY('#7c3aed', [.12, .6, 0], [.025, .55, .025]), B('#7c3aed', [.2, .84, 0], [.18, .07, .03], [0, 0, -.4])] }
};
/* une plume rouge, une boule d'argent, ou un objet de légende à ramasser (il brille et flotte) */
function modeleObjet(sorte) {
  const g = new THREE.Group(), cont = new THREE.Group(); g.add(cont);
  const M = MODELES_OBJETS[sorte];
  if (M) {
    cont.add(construire(M.p(), [], .02));
    const l = lueur(M.l, 2); l.position.y = .5; g.add(l);
    return { g, maj: (dt, t) => { cont.position.y = Math.sin(t * 2.5) * .1; cont.rotation.y = t * .8; l.material.opacity = .45 + Math.sin(t * 3) * .25; } };
  }
  if (sorte === 'plume') {
    cont.add(construire([SP('#dc2626', [0, .5, 0], [.13, .42, .035]), SP('#f87171', [0, .62, .02], [.07, .25, .02]), CY('#fef3c7', [0, .18, 0], [.015, .3, .015])], [], .02));
    cont.rotation.z = .5;
  } else {
    const b = new THREE.Mesh(sphere(20, 14), toon('#e5e7eb')); b.scale.setScalar(.36); b.position.y = .5; b.castShadow = true; cont.add(b);
    const c = new THREE.Mesh(sphere(20, 14), contourPour(sphere(20, 14), .03)); c.scale.setScalar(.36); c.position.y = .5; cont.add(c);
  }
  const l = lueur(sorte === 'plume' ? '#fca5a5' : '#f8fafc', 2); l.position.y = .5; g.add(l);
  return { g, maj: (dt, t) => { cont.position.y = Math.sin(t * 2.5) * .1; cont.rotation.y = t * .8; l.material.opacity = .45 + Math.sin(t * 3) * .25; } };
}
