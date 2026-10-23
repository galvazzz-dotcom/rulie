/* ══════════ LES 100 SUCCÈS (étape 8) ══════════
   Collection (30), élevage (16), courses (18), entraînement (4), Domaine (16), exploration (10), concours (4), défis (2).
   Chacun rapporte des plumes d'or ; ils se débloquent tout seuls (verifier() est appelé quand l'état change). */
import * as J from './etat.js';
import { ESPECES } from '../donnees/especes.js';
import { TYPES, ORDRE_TYPES } from '../donnees/types.js';
import { REGIONS } from '../donnees/regions.js';
import { courses } from './dindodrome.js';
import { concours, totalEtoiles, ETOILES_MAX, RANGS } from './concours.js';
import { nbFinies } from './grandesQuetes.js';
import { defis, compteurs } from './defis.js';

const E = () => J.etat();
const attrapes = () => E().livre.attrapes, nb = () => Object.keys(attrapes()).length;
const chromas = () => new Set([...Object.keys(E().livre.chromas || {}), ...E().dindies.filter(d => d.chroma).map(d => d.espece)]).size;
const P = k => E().production?.stats?.[k] || 0, EL = k => E().elevage[k] || 0, C = () => courses(), cpt = k => compteurs()[k] || 0;
const finie = q => E().quete.finies.includes(q), B = id => E().batiments[id] || {};
const ont = f => E().dindies.filter(f).length, niveauMax = () => Math.max(0, ...E().dindies.map(d => d.niveau || 0));
const mythiques = ESPECES.filter(x => x.rarete === 'mythique' && x.id !== 'ruuulius');
const BATIMENTS = [['clapier', 'repare'], ['montgolfiere', 'reparee'], ['couvoir', 'repare'], ['nurserie', 'repare'], ['dindodrome', 'ouvert'], ['entrainement', 'repare'], ['potager', 'repare'], ['moulin', 'repare'], ['atelier', 'repare'], ['missions', 'repare'], ['scene', 'repare']];

export const CATEGORIES = [['collection', '📖 Collection'], ['elevage', '🥚 Élevage'], ['courses', '🏁 Courses'], ['entrainement', '🏋️ Entraînement'], ['domaine', '🏡 Domaine'], ['exploration', '🎈 Exploration'], ['concours', '🎭 Concours'], ['defis', '📅 Défis']];
export const SUCCES = [];
const S = (cat, e, nom, desc, test, plumes = 1) => SUCCES.push({ id: 's' + (SUCCES.length + 1), n: SUCCES.length + 1, cat, e, nom, desc, test, plumes });

/* ── collection (1 à 30) ── */
S('collection', '🦃', 'Ma première dindie', 'Attrape ta première dindie', () => nb() >= 1);
[[5, 'Cinq copines'], [10, 'Dix au Grand Livre'], [20, 'Le Grand Livre se remplit'], [30, 'Trente espèces'], [40, 'Quarante espèces'], [50, 'Cinquante espèces'], [60, 'Soixante espèces']]
  .forEach(([n, nom], i) => S('collection', '📖', nom, `Attrape ${n} espèces différentes`, () => nb() >= n, i < 3 ? 1 : 2));
S('collection', '🌈', 'Le Grand Livre complet', `Attrape les ${ESPECES.length} espèces`, () => nb() >= ESPECES.length, 5);
for (const t of ORDRE_TYPES) {
  const L = ESPECES.filter(x => x.types[0] === t);
  S('collection', TYPES[t].e, `${TYPES[t].nom} au complet`, `Attrape les ${L.length} espèces de type ${TYPES[t].e} ${TYPES[t].nom}`, () => L.every(x => attrapes()[x.id]), 2);
}
[[1, 'Une chromatique', 1], [5, 'Cinq chromatiques', 2], [10, 'Dix chromatiques', 3], [25, 'Vingt-cinq chromatiques', 5]]
  .forEach(([n, nom, p]) => S('collection', '✨', nom, n === 1 ? 'Trouve une dindie chromatique (aux couleurs rares)' : `Trouve des chromatiques de ${n} espèces différentes`, () => chromas() >= n, p));
S('collection', '💙', 'Une rare !', 'Attrape une dindie rare', () => ESPECES.some(x => x.rarete === 'rare' && attrapes()[x.id]));
S('collection', '💜', 'Une épique !', 'Attrape une dindie épique', () => ESPECES.some(x => x.rarete === 'epique' && attrapes()[x.id]));
S('collection', '🧡', 'Une mythique !', 'Fais naître une dindie mythique', () => mythiques.some(x => attrapes()[x.id]), 2);
S('collection', '👑', 'Les sept mythiques', 'Fais naître les 7 dindies mythiques des grandes quêtes', () => mythiques.every(x => attrapes()[x.id]), 5);
S('collection', '🏡', 'Une grande famille', 'Aie 10 dindies', () => E().dindies.length >= 10);
S('collection', '🏘️', 'Une très grande famille', 'Aie 50 dindies', () => E().dindies.length >= 50, 2);
S('collection', '💯', 'Cent dindies !', 'Aie 100 dindies', () => E().dindies.length >= 100, 3);
S('collection', '🌟', 'Le Dindromakus', 'Fais naître la dindie de la légende', () => !!attrapes().ruuulius, 5);
S('collection', '🗺️', 'Une dindie de chaque île', 'Attrape une dindie sauvage sur chacune des 8 îles', () => Object.values(REGIONS).every(R => Object.keys(R.especes).some(x => attrapes()[x])), 2);

/* ── élevage (31 à 46) ── */
[[1, 'Le premier œuf', 1], [10, 'Dix éclosions', 1], [25, 'Vingt-cinq éclosions', 2], [50, 'Cinquante éclosions', 2], [100, 'Cent éclosions', 3]]
  .forEach(([n, nom, p]) => S('elevage', '🐣', nom, n === 1 ? 'Fais éclore ton premier œuf' : `Fais éclore ${n} œufs`, () => EL('eclosions') >= n, p));
S('elevage', '🧬', 'Le premier hybride', 'Fais naître une nouvelle espèce en croisant deux dindies', () => !!E().elevage.premierHybride);
S('elevage', '💕', 'Dix croisements', 'Croise 10 couples au Couvoir', () => EL('croisements') >= 10);
S('elevage', '💞', 'Cinquante croisements', 'Croise 50 couples au Couvoir', () => EL('croisements') >= 50, 3);
[[1, 'L’éveil', 1], [5, 'Cinq éveillées', 2], [20, 'Vingt éveillées', 3]]
  .forEach(([n, nom, p]) => S('elevage', '🌟', nom, n === 1 ? 'Éveille une dindie avec une pierre d’éveil' : `Aie ${n} dindies éveillées`, () => ont(d => d.stade === 'eveille') >= n, p));
S('elevage', '⬆️', 'Niveau 25', 'Fais monter une dindie au niveau 25', () => niveauMax() >= 25);
S('elevage', '🔝', 'Niveau 50', 'Fais monter une dindie au niveau 50', () => niveauMax() >= 50, 3);
S('elevage', '🎂', 'Le Gâteau d’amour', 'Croise deux dindies avec un Gâteau d’amour', () => P('gateaux') >= 1);
S('elevage', '🥚', 'Un Couvoir géant', 'Améliore le Couvoir jusqu’au niveau 3', () => (B('couvoir').niveau || 1) >= 3, 2);
S('elevage', '🍼', 'Une grande Nurserie', 'Améliore la Nurserie jusqu’au niveau 3', () => (B('nurserie').niveau || 1) >= 3, 2);

/* ── courses (47 à 64) ── */
S('courses', '🏁', 'Première course', 'Cours ta première course au Dindodrome', () => C().faites >= 1);
S('courses', '🥇', 'Première victoire', 'Gagne une course', () => C().victoires >= 1);
S('courses', '🏆', 'Dix victoires', 'Gagne 10 courses', () => C().victoires >= 10);
S('courses', '🏅', 'Cinquante victoires', 'Gagne 50 courses', () => C().victoires >= 50, 3);
S('courses', '💯', 'Cent courses', 'Cours 100 courses', () => C().faites >= 100, 3);
S('courses', '🎖️', 'Premier badge', 'Gagne la finale d’un championnat', () => C().badges.length >= 1);
S('courses', '🎖️', 'Quatre badges', 'Gagne 4 badges', () => C().badges.length >= 4, 2);
S('courses', '🎖️', 'Les huit badges', 'Gagne les 8 badges des championnats', () => C().badges.length >= 8, 3);
[['ligue1', 'Plumeline battue', 'la Baronne Plumeline'], ['ligue2', 'Le Grand Dindini battu', 'le Grand Dindini'], ['ligue3', 'Mamie Glouglou battue', 'Mamie Glouglou'], ['ligue4', 'Capitaine Rapido battu', 'le Capitaine Rapido']]
  .forEach(([id, nom, qui]) => S('courses', '🪶', nom, `Gagne contre ${qui}, dans la Ligue des Légendes`, () => C().ligue.includes(id), 2));
S('courses', '👑', 'La Ligue des Légendes', 'Gagne le grand défi de Gontran', () => C().ligue.includes('ligueGontran'), 5);
S('courses', '🏆', 'Une Coupe des Maîtres', 'Gagne une Coupe des Maîtres', () => C().maitres.length >= 1, 2);
S('courses', '🏆', 'Toutes les Coupes des Maîtres', 'Gagne les 8 Coupes des Maîtres', () => C().maitres.length >= 8, 5);
S('courses', '🔁', 'Le relais gagnant', 'Gagne une course de relais', () => C().relais >= 1, 2);
S('courses', '⏱️', 'L’or contre la montre', 'Gagne une médaille d’or contre la montre', () => Object.values(C().chronos).some(r => r.medaille === 'or'), 2);
S('courses', '♾️', 'Toujours plus loin', 'Cours 2 000 m dans la course sans fin', () => (C().sansFin?.distance || 0) >= 2000, 2);

/* ── entraînement (65 à 68) ── */
S('entrainement', '🏋️', 'Premier entraînement', 'Entraîne une dindie avec Coach Ginette', () => C().entrainements >= 1);
S('entrainement', '💪', 'Cinquante entraînements', 'Entraîne tes dindies 50 fois', () => C().entrainements >= 50, 2);
S('entrainement', '📚', 'Première leçon', 'Apprends une compétence à une dindie', () => C().lecons >= 1);
S('entrainement', '🎓', 'Dix leçons', 'Apprends 10 compétences', () => C().lecons >= 10, 2);

/* ── le Domaine (69 à 84) ── */
S('domaine', '🌽', 'Première récolte', 'Récolte au Potager', () => P('recoltes') >= 1);
S('domaine', '🧺', 'Cent récoltes', 'Récolte 100 fois au Potager', () => P('recoltes') >= 100, 3);
S('domaine', '🍪', 'Première friandise', 'Fabrique une friandise au Moulin', () => P('friandises') >= 1);
S('domaine', '🍰', 'Cent friandises', 'Fabrique 100 friandises au Moulin', () => P('friandises') >= 100, 3);
S('domaine', '🎩', 'Premier chapeau', 'Fabrique un chapeau à l’Atelier des plumes', () => P('chapeaux') >= 1);
S('domaine', '👒', 'Dix chapeaux', 'Fabrique 10 chapeaux', () => P('chapeaux') >= 10, 2);
S('domaine', '🎀', 'Une dindie coiffée', 'Mets un chapeau à une dindie', () => E().dindies.some(d => d.chapeau));
S('domaine', '🌷', 'Première décoration', 'Pose une décoration au Domaine', () => P('posees') >= 1);
S('domaine', '🏞️', 'Un Domaine tout beau', 'Aie 30 décorations posées au Domaine', () => (E().production?.deco?.length || 0) >= 30, 2);
S('domaine', '📮', 'Première mission', 'Accueille des dindies rentrées de mission', () => P('rapportees') >= 1);
S('domaine', '🧭', 'Vingt-cinq missions', 'Accueille 25 missions', () => P('rapportees') >= 25, 3);
S('domaine', '🐔', 'Les huit habitats', 'Construis les 8 enclos (un par type)', () => ORDRE_TYPES.every(t => (E().enclos[t]?.niveau || 0) >= 1), 3);
S('domaine', '🔨', 'Tout est réparé', 'Répare tous les bâtiments du Domaine', () => BATIMENTS.every(([id, k]) => B(id)[k]), 3);
S('domaine', '⬆️', 'Une amélioration', 'Améliore un bâtiment', () => P('ameliorations') >= 1);
S('domaine', '🪶', 'Mille plumes', 'Ramasse 1 000 plumes dans les enclos', () => P('plumes') >= 1000, 3);
S('domaine', '🪙', 'Cinq mille pièces', 'Aie 5 000 pièces', () => E().pieces >= 5000, 2);

/* ── exploration (85 à 94) ── */
const iles = () => Object.keys(REGIONS).filter(r => E().monde.positions?.[r]).length;
S('exploration', '🎈', 'Premier voyage', 'Pars en montgolfière vers une île', () => iles() >= 1 || cpt('voyages') >= 1);
S('exploration', '🌍', 'Le tour du monde', 'Visite les 8 îles', () => iles() >= 8, 3);
S('exploration', '🧰', 'Dix trésors', 'Trouve 10 trésors sur les îles', () => cpt('trouvailles') >= 10);
S('exploration', '💎', 'Cent trésors', 'Trouve 100 trésors sur les îles', () => cpt('trouvailles') >= 100, 3);
S('exploration', '🎉', 'Une fête au Royaume', 'Joue pendant une fête : Halloween, Noël, Pâques ou l’été', () => Object.keys(E().fetes?.vues || {}).length >= 1);
S('exploration', '🗝️', 'Les sept grandes quêtes', 'Finis les 7 grandes quêtes des mythiques', () => nbFinies() >= 7, 5);
S('exploration', '🌈', 'La plume arc-en-ciel', 'Rallume la plume, une nuit de pleine lune', () => finie('q55'), 3);
S('exploration', '📜', 'La fin de l’histoire', 'Finis les 8 chapitres de l’histoire', () => finie('q56'), 5);
S('exploration', '⏳', 'Une heure au Royaume', 'Joue une heure', () => (E().stats.tempsJeu || 0) >= 3600);
S('exploration', '⌛', 'Dix heures au Royaume', 'Joue dix heures', () => (E().stats.tempsJeu || 0) >= 36000, 3);

/* ── concours (95 à 98) ── */
S('concours', '💃', 'Premier défilé', 'Fais défiler une dindie sur la Scène des défilés', () => concours().defile.faits >= 1);
S('concours', '🌟', 'Une Étoile du défilé', `Gagne les ${RANGS.length} concours du défilé`, () => concours().defile.rang >= RANGS.length, 5);
S('concours', '🎶', 'Trois étoiles', 'Gagne 3 étoiles au concours de glouglou', () => Object.values(concours().glouglou.etoiles).some(n => n >= 3), 2);
S('concours', '🎼', 'Toutes les étoiles', `Gagne les ${ETOILES_MAX} étoiles du glouglou`, () => totalEtoiles() >= ETOILES_MAX, 5);

/* ── les défis (99 et 100) ── */
S('defis', '📅', 'Dix défis', 'Réussis 10 défis du jour ou de la semaine', () => (E().defis?.reussis || 0) >= 10, 2);
S('defis', '🏰', 'Le Royaume tout entier', 'Débloque les 99 autres succès', () => SUCCES.slice(0, 99).every(x => E().succes?.[x.id]), 10);
export const PAR_ID_SUCCES = Object.fromEntries(SUCCES.map(x => [x.id, x]));

export const obtenus = () => { const e = E(); e.succes = e.succes || {}; return e.succes; };
export const nbObtenus = () => Object.keys(obtenus()).length;
/* → la liste des succès qui viennent d'être débloqués (on gagne leurs plumes d'or) */
export function verifier() {
  const O = obtenus(), nouveaux = [];
  if (!E().defis) defis();
  for (const x of SUCCES) {
    if (O[x.id]) continue;
    let ok = false; try { ok = x.test(); } catch { ok = false; }
    if (ok) { O[x.id] = Date.now(); E().plumesOr += x.plumes; nouveaux.push(x); }
  }
  if (nouveaux.length) { J.changer('succes'); J.changer('pieces'); }
  return nouveaux;
}
