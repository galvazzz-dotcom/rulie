/* ══════════ LE DINDODROME : LES COURSES DE LA PARTIE ══════════
   Quelles courses sont ouvertes, les adversaires (toujours les mêmes pour une course donnée),
   les résultats, les gains, les badges, les leçons de Coach Ginette et l'entraînement. */
import { PAR_ID } from '../donnees/especes.js';
import { CHAMPIONNATS, SPECIALES, SORTES, PISTES, DRESSEURS, obstaclesCourse, gainsCourse, competenceInnee, ENSEIGNEES, PRIX_LECON, placesCompetences } from '../donnees/courses.js';
import { nouvelleDindie, NOMS_RIGOLOS, CARACTERES, nomDe } from './individus.js';
import { hasard } from '../moteur/couleurs.js';
import * as J from './etat.js';

const E = () => J.etat();
export const MAX_ENTRAINEMENT = 15;

/* ── l'état des courses dans la sauvegarde ── */
export function courses() {
  const e = E();
  if (!e.courses) e.courses = { badges: [], places: {}, faites: 0, victoires: 0, records: {}, entrainements: 0, lecons: 0 };
  return e.courses;
}
export const badge = n => courses().badges.includes(n);
export const nbBadges = () => courses().badges.length;
export const meilleurePlace = id => courses().places[id] || null;

/* ── la définition complète d'une course (championnat, finale, course de l'histoire, course libre) ── */
export function defCourse(id) {
  for (const C of CHAMPIONNATS) {
    const c = C.courses.find(x => x.id === id);
    if (c) return { ...c, championnat: C.n, nom: `${C.nom} · ${c.sorte === 'piste' ? PISTES[c.piste].nom : SORTES[c.sorte].nom}`, niveaux: C.niveaux, especes: C.especes, podium: true, distance: SORTES[c.sorte].distance };
    if (C.finale.id === id) return { ...C.finale, championnat: C.n, finale: true, nom: `${C.nom} · la finale`, niveaux: [C.niveaux[0] + 1, C.niveaux[1] + 1], especes: C.especes, champion: C.champion, distance: SORTES[C.finale.sorte].distance };
  }
  if (SPECIALES[id]) return { ...SPECIALES[id], championnat: 0, distance: SORTES[SPECIALES[id].sorte].distance };
  /* course libre : « libre-sprint-14 » = un sprint contre des dindies de niveau 14 environ */
  const m = /^libre-(sprint|haies|marathon)-(\d+)$/.exec(id);
  if (m) { const niv = +m[2]; return { id, sorte: m[1], piste: 'neutre', championnat: 0, libre: true, nom: `Course libre · ${SORTES[m[1]].nom}`, niveaux: [Math.max(2, niv - 2), niv + 1], especes: null, distance: SORTES[m[1]].distance }; }
  return null;
}

/* ── les 5 adversaires d'une course (tirés d'après le nom de la course : toujours les mêmes) ── */
export function adversaires(def) {
  const r = hasard('course-' + def.id), pick = L => L[Math.floor(r() * L.length)];
  const vus = Object.keys(E()?.livre?.attrapes || {});
  const pool = def.especes || (vus.length >= 3 ? vus.filter(x => PAR_ID[x].rarete !== 'mythique') : ['glouglou', 'paquerette', 'dindasable', 'gaufrette', 'crachin']);
  const noms = [...NOMS_RIGOLOS], dresseurs = [...DRESSEURS], cars = Object.keys(CARACTERES);
  const tirer = L => L.splice(Math.floor(r() * L.length), 1)[0];
  const liste = [];
  const star = def.finale ? CHAMPIONNATS[def.championnat - 1].finale.star : def.rival;
  if (star) {
    const d = nouvelleDindie(star.espece, { niveau: star.niveau, talents: star.talents, caractere: star.caractere, stade: star.stade || 'adulte' });
    d.competences = star.competences || []; d.entrainement = [8, 8, 8];
    liste.push({ id: 'star', nom: star.nom, dresseur: star.dresseur || (def.champion ? CHAMPION_NOMS[def.champion] : ''), d, star: true });
  }
  while (liste.length < 5) {
    const esp = pick(pool), [n0, n1] = def.niveaux, niveau = n0 + Math.floor(r() * (n1 - n0 + 1));
    const d = nouvelleDindie(esp, { niveau, talents: [0, 1, 2].map(() => Math.floor(r() * (2 + def.championnat * .5))), caractere: pick(cars) });
    d.entrainement = [0, 1, 2].map(() => Math.floor(r() * def.championnat * 3));
    if (r() < .25 + def.championnat * .15) d.competences = [pick(ENSEIGNEES)];
    liste.push({ id: 'a' + liste.length, nom: tirer(noms), dresseur: tirer(dresseurs), d });
  }
  return liste;
}
export const CHAMPION_NOMS = { gaston: 'Gaston', leila: 'Leïla', waffel: 'Monsieur Waffel', tarzanette: 'Tarzanette', inuk: 'Inuk', lava: 'Madame Lava', hibou: 'le Comte Hibou', azur: 'Aurélie Azur' };

/* les options de la simulation pour une course, avec la dindie de la joueuse */
export function optionsCourse(def, d, { nom = 'Roullieee' } = {}) {
  const O = obstaclesCourse(def.piste, def.sorte, def.distance);
  const adv = adversaires(def);
  /* la joueuse au milieu de la grille (couloir 3), la star à côté */
  const coureurs = [...adv.slice(0, 2), { id: 'moi', nom: nomDe(d), dresseur: nom, d, joueur: true }, ...adv.slice(2)];
  return { piste: def.piste, distance: def.distance, haies: O.haies, zones: O.zones, depart: O.depart, coureurs, aide: !!E()?.reglages?.aide };
}

/* ── ce qui est ouvert ── */
export function championnatOuvert(n, etapeAtteinte) {
  if (n === 1) return etapeAtteinte('coupe1');
  return badge(n - 1) && etapeAtteinte('coupe' + n);
}
/* les 3 courses du championnat sur le podium ? → la finale s'ouvre */
export const finaleOuverte = n => CHAMPIONNATS[n - 1].courses.every(c => (meilleurePlace(c.id) || 9) <= 3);

/* ── enregistrer une course : renvoie { place, gains, nouveauRecord, badge, premiereFois } ── */
export function enregistrer(def, C, d) {
  const S = courses(), R = C.joueur() || C.coureurs.find(x => x.id === 'moi');
  const place = R.place, avant = S.places[def.id];
  S.faites++; if (place === 1) S.victoires++;
  if (!avant || place < avant) S.places[def.id] = place;
  const g = gainsCourse(place, def.championnat);
  /* la première fois qu'on finit sur le podium d'une course de championnat : un bonus */
  const premiereFois = !avant || avant > 3;
  if (def.championnat && place <= 3 && premiereFois) g.pieces += 60 * def.championnat;
  J.gagnerPieces(g.pieces);
  const cle = def.sorte + ':' + def.piste;
  const nouveauRecord = !S.records[cle] || R.temps < S.records[cle].temps;
  if (nouveauRecord) S.records[cle] = { temps: +R.temps.toFixed(2), qui: nomDe(d), espece: d.espece, quand: Date.now() };
  /* la finale gagnée : le badge */
  let badgeGagne = null;
  if (def.finale && place === 1 && !S.badges.includes(def.championnat)) { S.badges.push(def.championnat); badgeGagne = CHAMPIONNATS[def.championnat - 1]; const r = badgeGagne.recompense; J.gagnerPieces(r.pieces); if (r.plumesOr) { E().plumesOr += r.plumesOr; } for (const [o, n] of Object.entries(r.objets || {})) J.ajouterObjet(o, n); }
  /* on a vu les espèces des adversaires */
  for (const X of C.coureurs) if (!X.joueur) J.voir(X.d.espece);
  J.changer('courses');
  return { place, gains: g, nouveauRecord, badge: badgeGagne, premiereFois, temps: R.temps };
}

/* ── les leçons de Coach Ginette : une nouvelle compétence ── */
export function peutApprendre(d) {
  if (d.stade === 'poussin' || d.stade === 'jeune') return 'Elle est encore toute petite !';
  const deja = [competenceInnee(d.espece), ...(d.competences || [])];
  if (deja.length >= placesCompetences(d)) return d.stade === 'eveille' ? 'Elle connaît déjà 3 compétences : c’est le maximum !' : 'Elle connaît déjà 2 compétences. Une dindie éveillée peut en apprendre une troisième !';
  return null;
}
export const prixLecon = () => courses().lecons ? PRIX_LECON : 0;   /* la première leçon est offerte */
export function apprendre(d, id) {
  const err = peutApprendre(d); if (err) return err;
  if ([competenceInnee(d.espece), ...(d.competences || [])].includes(id)) return 'Elle connaît déjà cette compétence.';
  const prix = prixLecon();
  if (prix && !J.depenser(prix)) return `Il faut ${prix} 🪙 pour une leçon.`;
  d.competences = [...(d.competences || []), id];
  courses().lecons++;
  J.changer('dindies');
  return null;
}
/* oublier une compétence apprise (pour en apprendre une autre) */
export function oublier(d, id) { d.competences = (d.competences || []).filter(x => x !== id); J.changer('dindies'); }

/* ── l'entraînement : des points dans une stat (15 au plus par stat) et de l'expérience ── */
export function entrainer(d, stat, points) {
  d.entrainement = d.entrainement || [0, 0, 0];
  const avant = d.entrainement[stat];
  d.entrainement[stat] = Math.min(MAX_ENTRAINEMENT, avant + points);
  courses().entrainements++;
  J.changer('dindies');
  return d.entrainement[stat] - avant;
}
