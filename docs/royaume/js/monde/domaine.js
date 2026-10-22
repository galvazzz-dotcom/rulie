/* ══════════ LE DOMAINE DES DINDIES : la carte ══════════
   Centre : la place (fontaine), la Maison, le Labo, la Boutique, le Musée.
   Ouest : l'allée des enclos (8 habitats) et le Clapier. Nord : l'élevage (bientôt).
   Est : la route du Dindodrome. Sud : le port et la montgolfière.
   construireDomaine(scene, etat) → { grille, interactifs, lieux, pnj, enclosInfo, maj, … } */
import * as THREE from 'three';
import { creerGrille } from './carte.js';
import { construireTerrain, construireChemins, construireVegetation, construireLampes, construireNuit, distSegment, forme } from './decor.js';
import * as BAT from './batiments.js';
import { creerChibi, PERSONNAGES } from '../personnages/chibi.js';
import { TYPES } from '../donnees/types.js';

/* les lieux (coordonnées monde : x vers l'est, z vers le sud) */
export const LIEUX = {
  place: { nom: 'La place du village', e: '⛲', x: 0, z: 0 },
  maison: { nom: 'Ta maison', e: '🏠', x: -13, z: -11 },
  labo: { nom: 'Le Labo du Professeur', e: '🔬', x: 13, z: -12 },
  boutique: { nom: 'Chez Mimi', e: '🛒', x: 14, z: 8 },
  musee: { nom: 'Le Musée du Grand Livre', e: '📖', x: -14, z: 8 },
  enclos: { nom: 'L’allée des enclos', e: '🐔', x: -33.5, z: 0 },
  clapier: { nom: 'Le Clapier à dindes', e: '🐾', x: -33.5, z: 24 },
  elevage: { nom: 'Le Couvoir et la Nurserie', e: '🥚', x: 0, z: -27 },
  dindodrome: { nom: 'Le Dindodrome (bientôt)', e: '🏁', x: 44, z: 0 },
  port: { nom: 'Le port', e: '⛵', x: 0, z: 37 }
};
export const ORDRE_ENCLOS = [['prairie', -40.5, -12, 'e'], ['pluie', -40.5, -3.5, 'e'], ['feu', -40.5, 5, 'e'], ['sable', -40.5, 13.5, 'e'],
  ['jungle', -26.5, -12, 'o'], ['glace', -26.5, -3.5, 'o'], ['nuit', -26.5, 5, 'o'], ['ciel', -26.5, 13.5, 'o']];
/* où l'on trouve les objets des quêtes */
export const CACHETTES = { planche1: [-6, 15], planche2: [22, -3], planche3: [-22, -21], planche4: [27, 20], planche5: [-46, 22], planche6: [9, -24], corde: [-18, 30] };

const SEGMENTS = [
  [-9, 0, -33.5, 0, 2.6], [-33.5, -17, -33.5, 22, 3], [9, 0, 42, 0, 2.6], [0, 9, 0, 36, 2.6], [0, -9, 0, -24, 2.4], [0, -24, -21, -24, 2.2], [0, -24, 21, -24, 2.2],
  [-13, -6.2, -7.5, -3.6, 2], [13, -7.3, 7.5, -3.6, 2], [12.4, 12.3, 7, 6.3, 2], [-14, 12.4, -7, 6.3, 2], [-33.5, 22, -33.5, 26.6, 2.6], [21, -24, 30, -16, 2], [24, 0, 33, 12, 2], [0, 30, -13, 32, 2]
];

export function construireDomaine(scene, etat) {
  const grille = creerGrille(-62, -54, 124, 108, .5);
  /* la mer bouche tout ce qui n'est pas l'île */
  grille.boucherSi((x, z) => forme(x, z) > .985);
  const terrain = construireTerrain(scene);
  construireChemins(scene, SEGMENTS, [[0, 0, 10.5, '#c9ae86'], [0, 0, 9.6, '#dcc7a3'], [0, 0, 4.2, '#cfb68f']]);
  const interactifs = [], majs = [], fenetresDe = [];
  /* poser un bâtiment : position, rotation (0, ±π/2, π), ses obstacles */
  const placer = (b, x, z, rot = 0) => {
    b.g.position.set(x, 0, z); b.g.rotation.y = rot; scene.add(b.g);
    const c = Math.cos(rot), s = Math.sin(rot), tourne = ([lx, lz]) => [x + lx * c + lz * s, z - lx * s + lz * c];
    for (const [ox, oz, w, d] of b.obst || []) { const [cx, cz] = tourne([ox, oz]); const swap = Math.abs(s) > .5; grille.boucherRect(cx, cz, swap ? d : w, swap ? w : d, 0, .2); }
    if (b.maj) majs.push(b.maj);
    b.porteMonde = b.porte ? tourne(b.porte) : null;
    return b;
  };
  const ajouterInteractif = (o) => { const I = { rayon: 1.8, ...o }; interactifs.push(I); return I; };

  /* ── la place ── */
  const fontaine = placer(BAT.fontaine(), 0, 0);
  ajouterInteractif({ id: 'fontaine', e: '⛲', texte: 'Faire un vœu', x: 0, z: 2.9, cible: fontaine.g, rayon: 2.4 });
  const maison = placer(BAT.maison(), LIEUX.maison.x, LIEUX.maison.z);
  ajouterInteractif({ id: 'maison', e: '🏠', texte: 'Entrer', x: maison.porteMonde[0], z: maison.porteMonde[1], cible: maison.g });
  const labo = placer(BAT.labo(), LIEUX.labo.x, LIEUX.labo.z);
  ajouterInteractif({ id: 'labo', e: '🔬', texte: 'Le Labo', x: labo.porteMonde[0], z: labo.porteMonde[1], cible: labo.g });
  const boutique = placer(BAT.boutique(), LIEUX.boutique.x, LIEUX.boutique.z);
  ajouterInteractif({ id: 'boutique', e: '🛒', texte: 'La boutique', x: boutique.porteMonde[0], z: boutique.porteMonde[1], cible: boutique.g });
  const musee = placer(BAT.musee(), LIEUX.musee.x, LIEUX.musee.z);
  ajouterInteractif({ id: 'musee', e: '📖', texte: 'Le Musée', x: musee.porteMonde[0], z: musee.porteMonde[1], cible: musee.g });
  const quetes = placer(BAT.panneauQuetes(), 5.2, 5);
  ajouterInteractif({ id: 'quetes', e: '📜', texte: 'Les quêtes', x: 5.2, z: 6.2, cible: quetes.g });
  const lettres = placer(BAT.boiteAuxLettres(), -9, -6.6);
  ajouterInteractif({ id: 'lettres', e: '📬', texte: 'Le courrier', x: -9, z: -5.6, cible: lettres.g });
  [[-5.5, 6.5, 0], [5.5, -6.5, Math.PI], [-6.8, -4.4, Math.PI * .8]].forEach(([x, z, r]) => placer(BAT.banc(), x, z, r));
  [[-10.8, 1.9, [['🐔 Les enclos', 0], ['🐾 Le Clapier', 0]]], [10.8, -1.9, [['🏁 Dindodrome', 0]]], [1.9, 10.8, [['⛵ Le port', 0]]], [-1.9, -10.8, [['🥚 L’élevage', 0]]]].forEach(([x, z, f]) => placer(BAT.panneauIndicateur(f), x, z));

  /* ── les enclos ── */
  const enclosInfo = {};
  const majEnclos = type => {
    const I = enclosInfo[type];
    if (I.b) { scene.remove(I.b.g); }
    const construit = !!etat.enclos[type]?.construit;
    const b = BAT.enclos(type, construit, 10, 7.5, I.cote);
    b.g.position.set(I.x, 0, I.z); scene.add(b.g);
    grille.libererRect(I.x, I.z, 10.6, 8.1);
    for (const [ox, oz, w, d] of b.obst) grille.boucherRect(I.x + ox, I.z + oz, w, d, 0, .15);
    I.b = b; I.construit = construit;
  };
  for (const [type, x, z, cote] of ORDRE_ENCLOS) {
    enclosInfo[type] = { type, x, z, cote, w: 10, d: 7.5, porte: [x + (cote === 'e' ? 6.1 : -6.1), z] };
    majEnclos(type);
    ajouterInteractif({ id: 'enclos-' + type, e: TYPES[type].e, texte: TYPES[type].habitat, x: enclosInfo[type].porte[0], z: z, cible: null, enclos: type, rayon: 2.2 });
  }
  /* ── le Clapier ── */
  let clap = null;
  const majClapier = () => {
    if (clap) scene.remove(clap.g);
    clap = BAT.clapier(!!etat.batiments.clapier?.repare); placer(clap, LIEUX.clapier.x, LIEUX.clapier.z);
    const I = interactifs.find(i => i.id === 'clapier'); if (I) I.cible = clap.g;
  };
  majClapier();
  ajouterInteractif({ id: 'clapier', e: '🐾', texte: 'Le Clapier', x: clap.porteMonde[0], z: clap.porteMonde[1], cible: clap.g });

  /* ── le nord : l'élevage (le Couvoir et la Nurserie se réparent au chapitre 3) ── */
  const elevage = {};
  const majBatimentElevage = (id, nom, fab, x, z) => {
    const A = elevage[id];
    if (A && A.b) { scene.remove(A.b.g); grille.libererRect(x, z + 1.5, 9, 10); }
    const repare = !!etat.batiments[id]?.repare;
    const b = placer(repare ? fab() : BAT.ruine(nom, 6, 5), x, z);
    const I = interactifs.find(i => i.id === id);
    if (I) { I.cible = b.g; I.x = b.porteMonde[0]; I.z = b.porteMonde[1]; I.e = repare ? (id === 'couvoir' ? '🥚' : '🍼') : '🚧'; delete I.ruine; if (!repare) I.ruine = nom; }
    elevage[id] = { b, repare, x, z };
    if (id === 'nurserie' && repare) elevage[id].cour = { x: x + b.cour.x, z: z + b.cour.z, b: { interieur: [b.cour.w, b.cour.d] } };
    return b;
  };
  const majCouvoir = () => majBatimentElevage('couvoir', 'Le Couvoir', BAT.couvoir, -8, -31.5);
  const majNurserie = () => majBatimentElevage('nurserie', 'La Nurserie', BAT.nurserie, 8, -33);
  ajouterInteractif({ id: 'couvoir', e: '🚧', texte: 'Le Couvoir', x: 0, z: 0, cible: null, ruine: 'Le Couvoir' });
  ajouterInteractif({ id: 'nurserie', e: '🚧', texte: 'La Nurserie', x: 0, z: 0, cible: null, ruine: 'La Nurserie' });
  majCouvoir(); majNurserie();
  [['Le Potager', -21, -29, 'potager'], ['L’Atelier des plumes', 30, -18, 'atelier']].forEach(([n, x, z, id]) => {
    const b = placer(BAT.ruine(n, 6, 5), x, z);
    ajouterInteractif({ id: 'ruine-' + id, e: '🚧', texte: n, x: b.porteMonde[0], z: b.porteMonde[1], cible: b.g, ruine: n });
  });
  const moulin = placer(BAT.ruine('Le Moulin', 5, 5, true), 21, -29);
  ajouterInteractif({ id: 'ruine-moulin', e: '🚧', texte: 'Le Moulin', x: moulin.porteMonde[0], z: moulin.porteMonde[1], cible: moulin.g, ruine: 'Le Moulin à friandises' });
  /* ── l'est : le Dindodrome ── */
  const portail = placer(BAT.portailDindodrome(), 44, 0, -Math.PI / 2);
  ajouterInteractif({ id: 'dindodrome', e: '🏁', texte: 'Le Dindodrome', x: portail.porteMonde[0], z: portail.porteMonde[1], cible: portail.g, rayon: 2.6 });
  const entr = placer(BAT.ruine('Le terrain d’entraînement', 7, 5), 33, 14);
  ajouterInteractif({ id: 'ruine-entrainement', e: '🚧', texte: 'L’entraînement', x: entr.porteMonde[0], z: entr.porteMonde[1], cible: entr.g, ruine: 'Le terrain d’entraînement' });
  /* ── le sud : le port ── */
  const lePort = placer(BAT.port(), LIEUX.port.x, LIEUX.port.z);
  grille.libererRect(LIEUX.port.x, LIEUX.port.z + 4, 2.6, 11.4);   /* on peut marcher sur le ponton */
  lePort.setGonfle(!!etat.batiments.montgolfiere?.reparee);
  ajouterInteractif({ id: 'montgolfiere', e: '🎈', texte: 'La montgolfière', x: lePort.porteMonde[0], z: lePort.porteMonde[1], cible: lePort.g });
  const bureau = placer(BAT.ruine('Le Bureau des missions', 6, 4.5), -13, 33);
  ajouterInteractif({ id: 'ruine-missions', e: '🚧', texte: 'Les missions', x: bureau.porteMonde[0], z: bureau.porteMonde[1], cible: bureau.g, ruine: 'Le Bureau des missions' });

  /* ── les habitants ── */
  const pnj = {};
  const POS_PNJ = { plumeau: [15.6, -6.6, -.4], mimi: [18.6, 12.4, -.5], zephyr: [2.8, 34.2, .3], ginette: [40.2, 3.2, -1.2] };
  for (const [id, [x, z, r]] of Object.entries(POS_PNJ)) {
    const c = creerChibi(PERSONNAGES[id]); c.racine.position.set(x, 0, z); c.racine.rotation.y = r; scene.add(c.racine);
    grille.boucherCercle(x, z, .45);
    pnj[id] = { id, c, x, z, r0: r };
    ajouterInteractif({ id: 'pnj-' + id, e: '💬', texte: PERSONNAGES[id].nom, x, z: z + 1.2, cible: c.racine, pnj: id, rayon: 2.2 });
  }

  /* ── les lampadaires ── */
  const lampes = [];
  for (let k = 0; k < 8; k++) { const a = Math.PI / 8 + k * Math.PI / 4; lampes.push([Math.cos(a) * 11.2, Math.sin(a) * 11.2]); }
  for (const x of [-18, -27]) lampes.push([x, 2]);
  for (const x of [18, 27, 36]) lampes.push([x, -2]);
  for (const z of [18, 28]) lampes.push([2, z]);
  for (const z of [-8, 8, 18]) lampes.push([-31.4, z]);
  lampes.push([-2, -18], [3.4, 40]);
  for (const [x, z] of lampes) grille.boucherCercle(x, z, .25);
  const lum = construireLampes(scene, lampes);

  /* ── la végétation, là où il reste de la place ── */
  const peutPlanter = (x, z, r) => {
    if (Math.hypot(x, z) < 13.5) return false;
    for (const [cx, cz] of Object.values(CACHETTES)) if (Math.hypot(x - cx, z - cz) < r + 2.6) return false;
    if (Math.abs(x + 33.5) < 15 && z > -18 && z < 28) return false;
    /* la place du Couvoir et de la Nurserie, une fois réparés (ils sont plus grands que leurs ruines) */
    if (Math.abs(x) < 14.5 && z > -38 && z < -24.5) return false;
    if (Math.hypot(x - LIEUX.port.x, z - LIEUX.port.z) < 10) return false;
    for (const [x1, z1, x2, z2, w] of SEGMENTS) if (distSegment(x, z, x1, z1, x2, z2) < w / 2 + r + .6) return false;
    for (const [dx, dz] of [[0, 0], [r, 0], [-r, 0], [0, r], [0, -r]]) if (!grille.libreEn(x + dx, z + dz)) return false;
    return true;
  };
  construireVegetation(scene, grille, peutPlanter);
  const nuitCiel = construireNuit(scene);

  /* ── les objets de quête posés dans le monde ── */
  const objets = new Map();
  function poserObjet(id, sorte, x, z) {
    if (objets.has(id)) return;
    const o = BAT.objetQuete(sorte); o.g.position.set(x, 0, z); scene.add(o.g);
    const I = ajouterInteractif({ id: 'objet-' + id, e: sorte === 'corde' ? '🪢' : '🪵', texte: 'Ramasser', x, z, cible: o.g, objet: id, rayon: 1.6 });
    objets.set(id, { o, I });
  }
  function retirerObjet(id) {
    const O = objets.get(id); if (!O) return;
    scene.remove(O.o.g); const k = interactifs.indexOf(O.I); if (k >= 0) interactifs.splice(k, 1); objets.delete(id);
  }

  return {
    grille, interactifs, pnj, enclosInfo, lieux: LIEUX, fontaine, lampes: lum,
    majEnclos, majClapier, majCouvoir, majNurserie, elevage, gonflerBallon: v => lePort.setGonfle(v), poserObjet, retirerObjet, objets,
    maj(dt, t, nuit, camPos) {
      terrain.maj(dt, t, nuit); nuitCiel.maj(t, nuit, camPos); lum.majNuit(nuit);
      BAT.matFenetres.emissiveIntensity = nuit * 1.4;
      for (const f of majs) f(dt, t);
      for (const O of objets.values()) O.o.maj(dt, t);
      for (const P of Object.values(pnj)) P.c.maj(dt, t);
    }
  };
}
