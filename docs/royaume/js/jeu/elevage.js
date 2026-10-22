/* ══════════ L'ÉLEVAGE : LE COUVOIR, LA NURSERIE, L'EXPÉRIENCE, L'ÉVEIL ══════════
   Tout est en temps réel (avec Date.now()) : un œuf continue de couver, et un poussin de grandir,
   même quand le jeu est fermé.
   - Croiser deux adultes (plan, 7.1) : recette spéciale 25 %, hybride (un type de chaque parent)
     rare 30 % ou épique 15 % (épique : un parent épique, ou deux parents de niveau 20 ou plus),
     sinon l'espèce de l'un des parents. Le tout premier croisement de types différents donne toujours un hybride.
   - Les œufs (plan, 7.2) : commune 5 min, rare 20 min, épique 1 h ; l'œuf du Professeur 30 s ; mode aide : ÷ 2.
   - La Nurserie : poussin → jeune en 10 min, jeune → adulte en 30 min ; chaque repas fait gagner 3 minutes.
   - L'éveil : au niveau 20, au Labo, avec une pierre d'éveil (+ 1 à chaque stat de base, nouvelle apparence).
   - Les mythiques (étape 7) : les deux bons parents, l'objet de la grande quête (il est utilisé) et parfois une condition :
     l'œuf mythique est alors sûr (4 h de couvaison). */
import { ESPECES, PAR_ID } from '../donnees/especes.js';
import { REGIONS } from '../donnees/regions.js';
import { TYPES } from '../donnees/types.js';
import * as J from './etat.js';
import { nouvelleDindie, gagnerXp, nomDe, CARACTERES } from './individus.js';
import { OBJETS } from './objets.js';
import { mythiquePour } from './grandesQuetes.js';

export const MINUTE = 60000;
export const NIVEAU_EVEIL = 20, REPOS_PARENT = 10;
/* le Couvoir et la Nurserie s'améliorent (étape 6) : 2 à 4 couveuses, 6 à 10 places */
export const nbCouveuses = () => 1 + (J.etat().batiments.couvoir?.niveau || 1);
export const placesNurserie = () => J.placesNurserie();
const PLEIN = 'Toutes les couveuses sont occupées. Fais d’abord éclore un œuf !';
const DUREES = { commune: 5, rare: 20, epique: 60, mythique: 240, tutoriel: .5 };
const E = () => J.etat();
const aide = () => !!E().reglages.aide;
const maintenant = () => Date.now();
const auHasard = L => L[Math.floor(Math.random() * L.length)];
const memePaire = (a, b) => (a[0] === b[0] && a[1] === b[1]) || (a[0] === b[1] && a[1] === b[0]);

export function elevage() {
  const e = E();
  if (!e.elevage) e.elevage = { couveuses: [null, null], croisements: 0, eclosions: 0, premierHybride: false, compteur: 0 };
  while (e.elevage.couveuses.length < nbCouveuses()) e.elevage.couveuses.push(null);
  return e.elevage;
}
export const estBebe = d => d.stade === 'poussin' || d.stade === 'jeune';
export const estAdulte = d => d.stade === 'adulte' || d.stade === 'eveille';
export const dureeOeuf = r => DUREES[r] * MINUTE / (aide() ? 2 : 1);

/* ── les croisements ── */
export const hybrideDe = (a, b) => ESPECES.find(e => e.origine.sorte === 'croisement' && memePaire(e.origine.types, [a, b])) || null;
export const recetteDe = (x, y) => ESPECES.find(e => e.origine.sorte === 'recette' && memePaire(e.origine.especes, [x, y])) || null;
const epiquePermise = (p1, p2) => [p1, p2].some(d => ['epique', 'mythique'].includes(PAR_ID[d.espece].rarete)) || (p1.niveau >= NIVEAU_EVEIL && p2.niveau >= NIVEAU_EVEIL);
/* ce qu'un couple peut donner (pour aider l'exploratrice, sans tout dévoiler) */
export function possibilites(p1, p2) {
  const e1 = PAR_ID[p1.espece], e2 = PAR_ID[p2.espece], hybrides = [];
  for (const a of e1.types) for (const b of e2.types) if (a !== b) { const h = hybrideDe(a, b); if (h && !hybrides.includes(h) && (h.rarete !== 'epique' || epiquePermise(p1, p2))) hybrides.push(h); }
  return { hybrides, recette: recetteDe(p1.espece, p2.espece), typesDifferents: e1.types.some(a => e2.types.some(b => a !== b)) };
}
/* gateau : le Gâteau d'amour du Moulin (recette secrète 50 %, hybrides deux fois plus probables) */
export function resultatCroisement(p1, p2, premier = false, gateau = false) {
  const e1 = PAR_ID[p1.espece], e2 = PAR_ID[p2.espece], P = possibilites(p1, p2), k = gateau ? 2 : 1;
  if (P.recette && Math.random() < .25 * k) return P.recette.id;
  if (premier && P.hybrides.length) return (P.hybrides.find(h => h.rarete === 'rare') || P.hybrides[0]).id;
  const t1 = auHasard(e1.types), t2 = auHasard(e2.types);
  if (t1 !== t2) {
    const h = hybrideDe(t1, t2);
    if (h) { const chance = (h.rarete === 'epique' ? (epiquePermise(p1, p2) ? .15 : 0) : .3) * k; if (Math.random() < chance) return h.id; }
  }
  return Math.random() < .5 ? e1.id : e2.id;
}
/* les bébés héritent des talents (celui du père ou de la mère, puis 20 % de chance d'avoir + 1) */
const talentsDe = (p1, p2) => [0, 1, 2].map(i => Math.min(5, (Math.random() < .5 ? p1.talents[i] : p2.talents[i]) + (Math.random() < .2 ? 1 : 0)));
const caractereDe = (p1, p2) => { const r = Math.random(); return r < .4 ? p1.caractere : r < .8 ? p2.caractere : auHasard(Object.keys(CARACTERES)); };
export function fatigue(d) { const reste = (d.dernierCroisement || 0) + REPOS_PARENT * MINUTE / (aide() ? 2 : 1) - maintenant(); return Math.max(0, reste); }
export const couveuseLibre = () => elevage().couveuses.findIndex(c => !c);

function nouvelOeuf(espece, extra) {
  const L = elevage(), esp = PAR_ID[espece];
  return { id: 'o' + maintenant().toString(36) + (L.compteur++), espece, chroma: Math.random() < 1 / 64, talents: [0, 1, 2].map(() => Math.floor(Math.random() * 4)),
    caractere: auHasard(Object.keys(CARACTERES)), parents: null, origine: 'oeuf', couleurs: [TYPES[esp.types[0]].couleur, '#fef3c7'], rarete: esp.rarete, ...extra };
}
/* poser un œuf dans la première couveuse libre : renvoie l'œuf, ou un message d'erreur */
function couver(oeuf) {
  const i = couveuseLibre(); if (i < 0) return PLEIN;
  oeuf.debut = maintenant(); oeuf.fin = oeuf.debut + dureeOeuf(oeuf.origine === 'tutoriel' ? 'tutoriel' : oeuf.rarete);
  elevage().couveuses[i] = oeuf; J.changer('elevage');
  return oeuf;
}
export function croiser(p1, p2, { gateau = false } = {}) {
  if (!p1 || !p2 || p1 === p2) return 'Il faut deux dindies différentes.';
  if (!estAdulte(p1) || !estAdulte(p2)) return 'Seules les dindies adultes peuvent avoir un œuf.';
  for (const d of [p1, p2]) if (fatigue(d)) return `${nomDe(d)} se repose encore (${Math.ceil(fatigue(d) / MINUTE)} min).`;
  if (couveuseLibre() < 0) return PLEIN;
  if (gateau && !J.retirerObjet('gateauAmour')) return 'Tu n’as pas de Gâteau d’amour (il se fait au Moulin).';
  const L = elevage(), P = possibilites(p1, p2), premier = !L.premierHybride && P.hybrides.length > 0, M = mythiquePour(p1, p2);
  if (M && M.ok) J.retirerObjet(M.G.objet);
  const espece = M && M.ok ? M.M.id : resultatCroisement(p1, p2, premier, gateau), esp = PAR_ID[espece];
  if (gateau) { const pr = E().production; if (pr) pr.stats.gateaux = (pr.stats.gateaux || 0) + 1; }
  if (['croisement', 'recette'].includes(esp.origine.sorte)) L.premierHybride = true;
  if (esp.rarete === 'mythique') L.mythiques = (L.mythiques || 0) + 1;
  const oeuf = nouvelOeuf(espece, { origine: 'croisement', parents: [p1.espece, p2.espece], talents: talentsDe(p1, p2), caractere: caractereDe(p1, p2),
    couleurs: esp.rarete === 'mythique' ? ['#f472b6', '#facc15'] : [TYPES[PAR_ID[p1.espece].types[0]].couleur, TYPES[PAR_ID[p2.espece].types[0]].couleur] });
  p1.dernierCroisement = p2.dernierCroisement = maintenant();
  L.croisements++;
  return couver(oeuf);
}
/* un œuf mystère : une espèce sauvage des îles déjà visitées (souvent commune, parfois rare, rarement épique) */
export function couverOeufMystere() {
  if (!J.combien('oeufMystere')) return 'Tu n’as pas d’œuf mystère. On en trouve dans les îles !';
  if (couveuseLibre() < 0) return PLEIN;
  const vues = Object.keys(E().monde.positions || {}).filter(id => REGIONS[id]?.especes);
  const regions = vues.length ? vues : ['pres'];
  const r = Math.random(), rarete = r < .7 ? 'commune' : r < .95 ? 'rare' : 'epique';
  const pool = regions.flatMap(id => Object.keys(REGIONS[id].especes)).filter(x => PAR_ID[x].rarete === rarete);
  const espece = auHasard(pool.length ? pool : ['glouglou']);
  J.retirerObjet('oeufMystere');
  return couver(nouvelOeuf(espece, { origine: 'mystere', couleurs: ['#f472b6', '#60a5fa'] }));
}
/* un œuf épique (rapporté d'une mission) : une espèce épique des îles déjà visitées */
export function couverOeufEpique() {
  if (!J.combien('oeufEpique')) return 'Tu n’as pas d’œuf épique. Les longues missions en rapportent parfois !';
  if (couveuseLibre() < 0) return PLEIN;
  const vues = Object.keys(E().monde.positions || {}).filter(id => REGIONS[id]?.especes);
  const pool = (vues.length ? vues : ['pres']).flatMap(id => Object.keys(REGIONS[id].especes)).filter(x => PAR_ID[x].rarete === 'epique');
  J.retirerObjet('oeufEpique');
  return couver(nouvelOeuf(auHasard(pool.length ? pool : ['coquelicot']), { origine: 'mystere', couleurs: ['#a855f7', '#f0abfc'] }));
}
export function couverOeufProfesseur() {
  if (!J.combien('oeufProfesseur')) return 'Tu n’as pas l’œuf du Professeur.';
  if (couveuseLibre() < 0) return PLEIN;
  J.retirerObjet('oeufProfesseur');
  return couver(nouvelOeuf(Math.random() < .5 ? 'paquerette' : 'glouglou', { origine: 'tutoriel', rarete: 'commune', couleurs: ['#facc15', '#fef3c7'] }));
}
export const restant = o => Math.max(0, o.fin - maintenant());
export const pret = o => !!o && maintenant() >= o.fin;
export function sablier(i) {
  const o = elevage().couveuses[i]; if (!o || pret(o) || !J.retirerObjet('sablier')) return false;
  o.fin -= 30 * MINUTE; J.changer('elevage'); return true;
}
/* l'éclosion : le poussin rejoint la Nurserie (ou le Clapier) */
export function eclore(i) {
  const L = elevage(), o = L.couveuses[i]; if (!pret(o)) return null;
  L.couveuses[i] = null; L.eclosions++;
  const d = nouvelleDindie(o.espece, { niveau: 1, stade: 'poussin', chroma: o.chroma, talents: o.talents, caractere: o.caractere, origine: o.origine === 'croisement' ? 'croisement' : o.origine === 'tutoriel' ? 'tutoriel' : 'oeuf' });
  d.parents = o.parents; d.naissance = maintenant(); d.croissance = { fin: maintenant() + 10 * MINUTE / (aide() ? 2 : 1) };
  J.ajouterDindie(d);
  if (o.chroma) { E().livre.chromas = E().livre.chromas || {}; E().livre.chromas[o.espece] = maintenant(); }
  d.lieu = E().batiments.nurserie?.repare && J.etat().dindies.filter(x => x.lieu === 'nurserie').length < placesNurserie() ? 'nurserie' : E().batiments.clapier.repare ? 'clapier' : 'equipe';
  if (E().compagnon === d.uid) E().compagnon = null;
  J.changer('dindies'); J.changer('elevage');
  return d;
}

/* ── la Nurserie : les bébés grandissent (en temps réel) ── */
export const tempsCroissance = d => (d.croissance ? Math.max(0, d.croissance.fin - maintenant()) : 0);
export function majCroissance() {
  const evts = [];
  for (const d of E().dindies) {
    if (!estBebe(d) || !d.croissance) continue;
    if (maintenant() < d.croissance.fin) continue;
    if (d.stade === 'poussin') { d.stade = 'jeune'; d.croissance = { fin: maintenant() + 30 * MINUTE / (aide() ? 2 : 1) }; }
    else {
      d.stade = 'adulte'; d.croissance = null;
      if (d.lieu === 'nurserie') d.lieu = J.equipe().length < 6 ? 'equipe' : E().batiments.clapier.repare ? 'clapier' : 'equipe';
    }
    evts.push(d);
  }
  if (evts.length) J.changer('dindies');
  return evts;
}
/* un repas : 3 minutes de moins (et un peu d'expérience) */
export function nourrirBebe(d) {
  if (!estBebe(d) || !d.croissance) return false;
  d.croissance.fin -= 3 * MINUTE; return true;
}

/* ── l'expérience ── */
export const XP = { friandise: 20, preferee: 35, biscuit: 150, capture: 25, compagnonCapture: 50 };
export function donnerXp(d, n) {
  const avant = d.niveau, monte = gagnerXp(d, n);
  J.changer('dindies');
  return monte ? { avant, apres: d.niveau } : null;
}
/* une friandise (la bonne, si c'est sa préférée) : bonheur, expérience, et 3 minutes de moins pour un bébé */
export function friandisePour(d) {
  const t = PAR_ID[d.espece].types, ids = Object.keys(OBJETS).filter(id => (id === 'friandise' || OBJETS[id].prefere) && J.combien(id) > 0);
  return ids.find(id => t.includes(OBJETS[id].prefere)) || (ids.includes('friandise') ? 'friandise' : ids[0]) || null;
}
export function nourrir(d, id = friandisePour(d)) {
  if (!id || !J.retirerObjet(id)) return null;
  const pref = !!OBJETS[id].prefere && PAR_ID[d.espece].types.includes(OBJETS[id].prefere), k = d.caractere === 'gourmande' ? 2 : 1;
  d.bonheur = Math.min(100, d.bonheur + (pref ? 25 : 15) * k);
  const niv = donnerXp(d, (pref ? XP.preferee : XP.friandise) * k);
  const bebe = nourrirBebe(d);
  return { id, pref, gourmande: k > 1, niv, bebe };
}

/* ── l'éveil ── */
export function peutEveiller(d) {
  if (d.stade === 'eveille') return 'Elle est déjà éveillée !';
  if (!estAdulte(d)) return 'Elle doit d’abord devenir adulte.';
  if (d.niveau < NIVEAU_EVEIL) return `Il lui faut le niveau ${NIVEAU_EVEIL} (elle est niveau ${d.niveau}).`;
  if (!J.combien('pierreEveil')) return 'Il faut une pierre d’éveil 💎 (on en trouve dans les îles).';
  return null;
}
export function eveiller(d) {
  if (peutEveiller(d) || !J.retirerObjet('pierreEveil')) return false;
  d.stade = 'eveille'; d.bonheur = 100; d.eveil = maintenant();
  J.changer('dindies');
  return true;
}
