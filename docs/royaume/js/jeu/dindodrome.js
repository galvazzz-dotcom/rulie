/* ══════════ LE DINDODROME : LES COURSES DE LA PARTIE ══════════
   Quelles courses sont ouvertes, les adversaires (toujours les mêmes pour une course donnée),
   les résultats, les gains, les badges, les leçons de Coach Ginette et l'entraînement. */
import { PAR_ID } from '../donnees/especes.js';
import { CHAMPIONNATS, SPECIALES, SORTES, PISTES, DRESSEURS, obstaclesCourse, gainsCourse, competenceInnee, ENSEIGNEES, PRIX_LECON, placesCompetences, LIGUE, MAITRES, RELAIS } from '../donnees/courses.js';
import { nouvelleDindie, NOMS_RIGOLOS, CARACTERES, nomDe } from './individus.js';
import { hasard } from '../moteur/couleurs.js';
import * as J from './etat.js';
import { simuler } from './course.js';

const E = () => J.etat();
export const MAX_ENTRAINEMENT = 15;

/* ── l'état des courses dans la sauvegarde ── */
export function courses() {
  const e = E();
  if (!e.courses) e.courses = { badges: [], places: {}, faites: 0, victoires: 0, records: {}, entrainements: 0, lecons: 0 };
  const C = e.courses; C.chronos = C.chronos || {}; C.ligue = C.ligue || []; C.maitres = C.maitres || []; C.sansFin = C.sansFin || null; C.relais = C.relais || 0;
  return C;
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
  /* étape 8 : la Ligue, les Coupes des Maîtres, les relais (il faut gagner), le contre la montre et la course sans fin (seule sur la piste) */
  const L = LIGUE.find(x => x.id === id) || MAITRES.find(x => x.id === id);
  if (L) return { ...L, championnat: L.force, ligue: !!L.plume, maitre: !!L.champion && !L.plume, gagner: true, distance: SORTES[L.sorte].distance };
  const Rl = RELAIS.find(x => x.id === id);
  if (Rl) return { ...Rl, championnat: Rl.force, relais: true, gagner: true, distance: SORTES.relais.distance };
  const ch = /^chrono-(\w+)$/.exec(id);
  if (ch && PISTES[ch[1]]) return { id, sorte: 'chrono', piste: ch[1], championnat: 0, solo: true, nom: `Contre la montre · ${PISTES[ch[1]].nom}`, niveaux: [1, 1], especes: null, distance: SORTES.chrono.distance };
  if (id === 'sansfin') return { id, sorte: 'sansFin', piste: 'neutre', championnat: 0, solo: true, sansFin: true, nom: 'La course sans fin', niveaux: [1, 1], especes: null, distance: SORTES.sansFin.distance };
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
    d.competences = star.competences || []; d.entrainement = star.entrainement || [8, 8, 8];
    liste.push({ id: 'star', nom: star.nom, dresseur: star.dresseur || (def.champion ? CHAMPION_NOMS[def.champion] : ''), d, star: true });
  }
  /* une adversaire de la course (les plus fortes à partir de la Ligue : talents jusqu'à 5, entraînement jusqu'à 15) */
  const une = () => {
    const esp = pick(pool), [n0, n1] = def.niveaux, niveau = n0 + Math.floor(r() * (n1 - n0 + 1));
    const d = nouvelleDindie(esp, { niveau, talents: [0, 1, 2].map(() => Math.min(5, Math.floor(r() * (2 + def.championnat * .5)))), caractere: pick(cars), stade: def.championnat >= 9 && r() < .5 ? 'eveille' : 'adulte' });
    d.entrainement = [0, 1, 2].map(() => Math.min(15, Math.floor(r() * def.championnat * 3)));
    /* (pas de départ canon dans la Ligue, les Coupes des Maîtres et les relais : la course se gagne sur la piste) */
    if (r() < .25 + def.championnat * .15) d.competences = [pick(def.gagner ? ENSEIGNEES.filter(c => c !== 'canon') : ENSEIGNEES)];
    return d;
  };
  while (liste.length < 5) {
    const d = une(), C = { id: 'a' + liste.length, nom: tirer(noms), dresseur: tirer(dresseurs), d };
    /* au relais, chaque équipe a 3 dindies */
    if (def.relais) C.equipe = [d, une(), une()];
    liste.push(C);
  }
  return liste;
}
export const LIGUE_NOMS = { plumeline: 'la Baronne Plumeline', dindini: 'le Grand Dindini', mamie: 'Mamie Glouglou', rapido: 'le Capitaine Rapido', gontran: 'Gontran' };
export const CHAMPION_NOMS = { gaston: 'Gaston', leila: 'Leïla', waffel: 'Monsieur Waffel', tarzanette: 'Tarzanette', inuk: 'Inuk', lava: 'Madame Lava', hibou: 'le Comte Hibou', azur: 'Aurélie Azur' };

/* les options de la simulation pour une course, avec la dindie de la joueuse (au relais : son équipe de 3) */
export function optionsCourse(def, d, { nom = 'Roullieee', equipe = null } = {}) {
  const O = obstaclesCourse(def.piste, def.sorte, def.distance);
  const moi = { id: 'moi', nom: nomDe(d), dresseur: nom, d, joueur: true, equipe: def.relais ? equipe || [d, d, d] : null };
  if (def.relais) moi.nom = 'Équipe ' + nom;
  /* seule sur la piste (contre la montre, course sans fin) ; sinon la joueuse au milieu de la grille (couloir 3), la star à côté */
  const adv = def.solo ? [] : adversaires(def);
  const coureurs = def.solo ? [moi] : [...adv.slice(0, 2), moi, ...adv.slice(2)];
  return { piste: def.piste, distance: def.distance, haies: O.haies, zones: O.zones, depart: O.depart, coureurs, aide: !!E()?.reglages?.aide, relais: !!def.relais, sansFin: !!def.sansFin };
}
/* ── le contre la montre : les temps des médailles (une coureuse de référence, toujours la même, fait la course) ── */
const MEDAILLES = {};
export function tempsMedailles(piste) {
  if (MEDAILLES[piste]) return MEDAILLES[piste];
  const def = defCourse('chrono-' + piste), ref = nouvelleDindie('atomium', { niveau: 40, talents: [3, 3, 3], caractere: 'calme', stade: 'eveille' });
  ref.entrainement = [10, 10, 10];
  const O = obstaclesCourse(piste, 'chrono', def.distance), C = simuler({ piste, distance: def.distance, haies: O.haies, zones: O.zones, coureurs: [{ id: 'ref', nom: 'ref', d: ref }], rng: hasard('chrono-' + piste) });
  const T = C.coureurs[0].temps;
  return (MEDAILLES[piste] = { or: +(T * .95).toFixed(2), argent: +(T * 1.02).toFixed(2), bronze: +(T * 1.1).toFixed(2) });
}
export const medailleChrono = (piste, t) => { const M = tempsMedailles(piste); return t <= M.or ? 'or' : t <= M.argent ? 'argent' : t <= M.bronze ? 'bronze' : null; };

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
  S.faites++; if (place === 1 && !def.solo) S.victoires++;
  if (!avant || place < avant) S.places[def.id] = place;
  /* seule sur la piste : on gagne selon la médaille (contre la montre) ou la distance (course sans fin) */
  const placeGains = !def.solo ? place : def.sansFin ? (R.pos >= 3000 ? 1 : R.pos >= 2000 ? 2 : R.pos >= 1200 ? 3 : 5)
    : ({ or: 1, argent: 2, bronze: 3 })[medailleChrono(def.piste, R.temps)] || 5;
  const g = gainsCourse(placeGains, def.championnat);
  /* la première fois qu'on finit sur le podium d'une course de championnat : un bonus */
  const premiereFois = !avant || avant > 3;
  if (def.championnat && place <= 3 && premiereFois) g.pieces += 60 * def.championnat;
  J.gagnerPieces(g.pieces);
  const cle = def.sorte + ':' + def.piste;
  let nouveauRecord = false, medaille = null;
  if (def.sansFin) {
    nouveauRecord = !S.sansFin || R.pos > S.sansFin.distance;
    if (nouveauRecord) S.sansFin = { distance: Math.round(R.pos), temps: +R.temps.toFixed(1), qui: nomDe(d), espece: d.espece, quand: Date.now() };
  } else if (def.solo) {
    medaille = medailleChrono(def.piste, R.temps);
    const av = S.chronos[def.piste];
    nouveauRecord = !av || R.temps < av.temps;
    if (nouveauRecord) S.chronos[def.piste] = { temps: +R.temps.toFixed(2), qui: nomDe(d), espece: d.espece, quand: Date.now(), medaille: meilleureMedaille(av?.medaille, medaille) };
    else if (medaille) av.medaille = meilleureMedaille(av.medaille, medaille);
  } else {
    nouveauRecord = !S.records[cle] || R.temps < S.records[cle].temps;
    if (nouveauRecord) S.records[cle] = { temps: +R.temps.toFixed(2), qui: def.relais ? 'Ton équipe' : nomDe(d), espece: d.espece, quand: Date.now() };
  }
  if (def.ligue && place === 1 && !S.ligue.includes(def.id)) S.ligue.push(def.id);
  if (def.maitre && place === 1 && !S.maitres.includes(def.n)) S.maitres.push(def.n);
  if (def.relais && place === 1) S.relais++;
  /* la finale gagnée : le badge */
  let badgeGagne = null;
  if (def.finale && place === 1 && !S.badges.includes(def.championnat)) { S.badges.push(def.championnat); badgeGagne = CHAMPIONNATS[def.championnat - 1]; const r = badgeGagne.recompense; J.gagnerPieces(r.pieces); if (r.plumesOr) { E().plumesOr += r.plumesOr; } for (const [o, n] of Object.entries(r.objets || {})) J.ajouterObjet(o, n); }
  /* on a vu les espèces des adversaires */
  for (const X of C.coureurs) if (!X.joueur) J.voir(X.d.espece);
  J.changer('courses');
  return { place, gains: g, nouveauRecord, badge: badgeGagne, premiereFois, temps: R.temps, medaille, distance: Math.round(R.pos) };
}
const RANG_MEDAILLE = { or: 3, argent: 2, bronze: 1 };
const meilleureMedaille = (a, b) => (RANG_MEDAILLE[a] || 0) >= (RANG_MEDAILLE[b] || 0) ? a || null : b;
/* ── ce qui est ouvert après l'histoire ── */
export const ligueGagnee = id => courses().ligue.includes(id);
export const maitreGagne = n => courses().maitres.includes(n);

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
