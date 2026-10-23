/* ══════════ LES DÉFIS DU JOUR ET DE LA SEMAINE (étape 8) ══════════
   Chaque jour, 3 petits défis ; chaque semaine (du lundi au dimanche), 3 grands défis. Ils sont tirés au sort selon la date,
   parmi ce qui est déjà ouvert dans la partie, et comptent à partir du moment où ils apparaissent.
   Réussis, on réclame la récompense au Panneau des quêtes : les 3 défis du jour → 1 plume d'or en plus,
   les 3 défis de la semaine → 3 plumes d'or et un œuf mystère. Ils s'ouvrent quand la montgolfière vole (chapitre 2). */
import * as J from './etat.js';
import { courses } from './dindodrome.js';
import { concours } from './concours.js';
import { jour } from './trouvailles.js';
import { hasard } from '../moteur/couleurs.js';

const E = () => J.etat();
/* les compteurs de ce qui n'était pas encore compté ailleurs (captures, repas, voyages, trésors) */
export const compteurs = () => { const s = E().stats; s.compteurs = s.compteurs || {}; return s.compteurs; };
export function compter(cle, n = 1) { const c = compteurs(); c[cle] = (c[cle] || 0) + n; }
const cpt = k => compteurs()[k] || 0, pst = k => E().production?.stats?.[k] || 0, B = id => E().batiments[id] || {};
const s = n => n > 1 ? 's' : '';
export const SORTES = {
  nourries: { e: '🍎', texte: n => `Donne à manger à tes dindies ${n} fois`, jour: [3, 5], semaine: [15, 25], val: () => cpt('nourries'), ouvert: () => true },
  captures: { e: '🦃', texte: n => `Attrape ${n} dindie${s(n)} sur les îles`, jour: [2, 4], semaine: [10, 15], val: () => cpt('captures'), ouvert: () => !!B('montgolfiere').reparee },
  voyages: { e: '🎈', texte: n => `Pars ${n} fois en montgolfière vers une île`, jour: [1, 2], semaine: [6, 10], val: () => cpt('voyages'), ouvert: () => !!B('montgolfiere').reparee },
  trouvailles: { e: '🧰', texte: n => `Trouve ${n} trésor${s(n)} sur les îles (coffres, œufs, pierres)`, jour: [1, 2], semaine: [5, 8], val: () => cpt('trouvailles'), ouvert: () => !!B('montgolfiere').reparee },
  eclosions: { e: '🐣', texte: n => `Fais éclore ${n} œuf${s(n)} au Couvoir`, jour: [1, 1], semaine: [3, 5], val: () => E().elevage.eclosions || 0, ouvert: () => !!B('couvoir').repare },
  croisements: { e: '💕', texte: n => `Croise ${n} couple${s(n)} de dindies au Couvoir`, jour: [1, 1], semaine: [3, 5], val: () => E().elevage.croisements || 0, ouvert: () => (E().elevage.croisements || 0) > 0 },
  courses: { e: '🏁', texte: n => `Cours ${n} course${s(n)} au Dindodrome`, jour: [2, 3], semaine: [8, 12], val: () => courses().faites, ouvert: () => !!B('dindodrome').ouvert },
  victoires: { e: '🥇', texte: n => `Gagne ${n} course${s(n)} au Dindodrome`, jour: [1, 2], semaine: [5, 8], val: () => courses().victoires, ouvert: () => !!B('dindodrome').ouvert },
  entrainements: { e: '🏋️', texte: n => `Entraîne tes dindies ${n} fois avec Coach Ginette`, jour: [2, 3], semaine: [8, 12], val: () => courses().entrainements, ouvert: () => !!B('entrainement').repare },
  recoltes: { e: '🌽', texte: n => `Récolte ${n} fois au Potager`, jour: [2, 3], semaine: [8, 12], val: () => pst('recoltes'), ouvert: () => !!B('potager').repare },
  friandises: { e: '🍪', texte: n => `Fabrique ${n} friandise${s(n)} au Moulin`, jour: [2, 3], semaine: [8, 12], val: () => pst('friandises'), ouvert: () => !!B('moulin').repare },
  missions: { e: '📮', texte: n => `Accueille ${n} mission${s(n)} au Bureau des missions`, jour: [1, 2], semaine: [4, 6], val: () => pst('rapportees'), ouvert: () => !!B('missions').repare },
  concours: { e: '🎭', texte: n => `Participe à ${n} concours sur la Scène des défilés`, jour: [1, 2], semaine: [4, 6], val: () => concours().defile.faits + concours().glouglou.faits, ouvert: () => !!B('scene').repare }
};
export const RECOMPENSES = { jour: { pieces: 60, bonus: { plumesOr: 1 } }, semaine: { pieces: 250, bonus: { plumesOr: 3, objets: { oeufMystere: 1 } } } };
export const ouverts = () => !!E().batiments.montgolfiere?.reparee;
/* la semaine commence le lundi : sa clé est la date de ce lundi */
export function cleSemaine(d = new Date()) {
  const l = new Date(d.getFullYear(), d.getMonth(), d.getDate() - ((d.getDay() + 6) % 7));
  return `${l.getFullYear()}-${String(l.getMonth() + 1).padStart(2, '0')}-${String(l.getDate()).padStart(2, '0')}`;
}
/* 3 défis tirés au sort (la même date donne les mêmes défis) parmi ce qui est ouvert */
function tirer(cle, periode) {
  const r = hasard('defis-' + periode + '-' + cle), L = Object.keys(SORTES).filter(k => SORTES[k].ouvert()), liste = [];
  while (liste.length < 3 && L.length) {
    const k = L.splice(Math.floor(r() * L.length), 1)[0], [a, b] = SORTES[k][periode];
    liste.push({ sorte: k, n: a + Math.floor(r() * (b - a + 1)), depart: SORTES[k].val(), reclame: false });
  }
  return { cle, liste, bonus: false };
}
export function defis() {
  const e = E();
  e.defis = e.defis || { jour: null, semaine: null, reussis: 0, bonus: 0 };
  const D = e.defis;
  if (ouverts()) {
    const cj = jour(), cs = cleSemaine();
    if (!D.jour || D.jour.cle !== cj) D.jour = tirer(cj, 'jour');
    if (!D.semaine || D.semaine.cle !== cs) D.semaine = tirer(cs, 'semaine');
  }
  return D;
}
export const progres = x => Math.max(0, Math.min(x.n, SORTES[x.sorte].val() - x.depart));
export const reussi = x => progres(x) >= x.n;
export const texteDefi = x => SORTES[x.sorte].texte(x.n);
/* combien de récompenses attendent au Panneau des quêtes */
export function aReclamer() {
  if (!ouverts()) return 0;
  const D = defis();
  return [D.jour, D.semaine].reduce((a, P) => a + (P ? P.liste.filter(x => !x.reclame && reussi(x)).length : 0), 0);
}
/* réclamer la récompense d'un défi réussi → { pieces, bonus } (ou null) */
export function reclamer(periode, i) {
  const D = defis(), P = D[periode], x = P && P.liste[i];
  if (!x || x.reclame || !reussi(x)) return null;
  x.reclame = true; D.reussis++;
  const R = RECOMPENSES[periode];
  J.gagnerPieces(R.pieces);
  let bonus = null;
  if (!P.bonus && P.liste.every(y => y.reclame)) {
    P.bonus = true; D.bonus++; bonus = R.bonus;
    E().plumesOr += bonus.plumesOr;
    for (const [o, n] of Object.entries(bonus.objets || {})) J.ajouterObjet(o, n);
    J.changer('pieces');
  }
  J.changer('defis');
  return { pieces: R.pieces, bonus };
}
