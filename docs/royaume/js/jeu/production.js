/* ══════════ LA PRODUCTION DU DOMAINE : LA LOGIQUE ══════════
   Le Potager (planter, arroser, récolter, en temps réel même jeu fermé), le Moulin (les recettes),
   les plumes des enclos (une fois par jour), l'Atelier (chapeaux et décorations), la décoration du Domaine,
   le Bureau des missions, les réparations et les améliorations, et « rendre à la nature ».
   Les actions renvoient un message d'erreur (une chaîne), ou null / un résultat quand c'est fait. */
import * as J from './etat.js';
import { PAR_ID } from '../donnees/especes.js';
import { TYPES } from '../donnees/types.js';
import { GRAINES, RECETTES, CHAPEAUX, DECORATIONS, MISSIONS, DUREES_MISSIONS, AMELIORATIONS, PRIX_REPARATION, PRIX_HABITAT, PLUMES_RELACHER } from '../donnees/production.js';
import { OBJETS } from './objets.js';
import { jour } from './trouvailles.js';
import { nomDe, stats } from './individus.js';
import { estAdulte, donnerXp } from './elevage.js';
import { MAX_ENTRAINEMENT } from './dindodrome.js';

export const MINUTE = 60000;
export const MAX_DECO = 60, NB_OFFRES = 4;
const E = () => J.etat();
const maintenant = () => Date.now();
const aide = () => !!E().reglages.aide;
const auHasard = L => L[Math.floor(Math.random() * L.length)];
const entre = ([a, b]) => a + Math.floor(Math.random() * (b - a + 1));

/* la production s'ouvre quand le chapitre 4 est fini (la dernière quête du Dindodrome) */
export const productionOuverte = () => E().quete.finies.includes('q30');
export function prod() {
  const P = E().production;
  for (const k of ['plumes', 'ramassage', 'chapeaux', 'decorations']) P[k] = P[k] || {};
  P.parcelles = P.parcelles || []; P.deco = P.deco || [];
  while (P.parcelles.length < nbParcelles()) P.parcelles.push(null);
  return P;
}
const compter = (k, n = 1) => { const S = prod().stats; S[k] = (S[k] || 0) + n; };

/* ── le Potager ── */
export const nbParcelles = () => 2 + 2 * (E().batiments.potager?.niveau || 1);
export const dureeGraine = g => GRAINES[g].minutes * MINUTE / (aide() ? 2 : 1);
export const mure = p => !!p && maintenant() >= p.fin;
export const restantParcelle = p => Math.max(0, p.fin - maintenant());
/* 0 : vide, 1 : une pousse, 2 : elle grandit, 3 : prête à récolter */
export const stadeParcelle = p => !p ? 0 : mure(p) ? 3 : (maintenant() - p.debut) / (p.fin - p.debut) < .45 ? 1 : 2;
export function planter(i, g) {
  const G = GRAINES[g], P = prod();
  if (!E().batiments.potager?.repare) return 'Le Potager est encore en ruine.';
  if (!G || i < 0 || i >= P.parcelles.length) return 'Cette parcelle n’existe pas.';
  if (P.parcelles[i]) return 'Cette parcelle est déjà plantée.';
  if (!J.retirerObjet(G.graine)) return `Il te faut des ${OBJETS[G.graine].nom.toLowerCase()} : Mimi en vend !`;
  const t = maintenant();
  P.parcelles[i] = { g, debut: t, fin: t + dureeGraine(g), arrosee: false };
  compter('plantees'); J.changer('potager');
  return null;
}
/* arroser : la plante pousse plus vite (un quart du temps en moins) et donne une récolte de plus */
export function arroser(i) {
  const p = prod().parcelles[i];
  if (!p || mure(p) || p.arrosee) return false;
  p.arrosee = true; p.fin -= (p.fin - p.debut) * .25;
  compter('arrosees'); J.changer('potager');
  return true;
}
export function recolter(i) {
  const P = prod(), p = P.parcelles[i];
  if (!mure(p)) return null;
  const G = GRAINES[p.g], n = entre(G.donne) + (p.arrosee ? 1 : 0), graine = Math.random() < .3;
  P.parcelles[i] = null;
  J.ajouterObjet(G.recolte, n); if (graine) J.ajouterObjet(G.graine);
  compter('recoltes'); J.changer('potager');
  return { g: p.g, n, graine };
}
export const parcellesMures = () => prod().parcelles.filter(mure).length;

/* ── le Moulin ── */
export const ingredientsOk = id => Object.entries(RECETTES[id].ingredients).every(([o, n]) => J.combien(o) >= n);
export function fabriquer(id) {
  if (!E().batiments.moulin?.repare) return 'Le Moulin est encore en ruine.';
  if (!RECETTES[id]) return 'Cette recette n’existe pas.';
  if (!ingredientsOk(id)) return 'Il manque des ingrédients ! Ils poussent au Potager.';
  for (const [o, n] of Object.entries(RECETTES[id].ingredients)) J.retirerObjet(o, n);
  J.ajouterObjet(id); compter('friandises');
  return null;
}
/* une friandise du Moulin pour une dindie : un point d'entraînement, ou beaucoup d'expérience */
export function donnerFriandiseMoulin(d, id) {
  const M = OBJETS[id]?.moulin;
  if (!M) return 'Ce n’est pas une friandise du Moulin.';
  if (!estAdulte(d)) return 'Les friandises du Moulin, c’est pour les grandes dindies !';
  d.entrainement = d.entrainement || [0, 0, 0];
  if (M.stat !== undefined && d.entrainement[M.stat] >= MAX_ENTRAINEMENT) return `${nomDe(d)} a déjà 15 points d’entraînement dans cette stat : c’est le maximum !`;
  if (!J.retirerObjet(id)) return 'Tu n’en as plus.';
  if (M.stat !== undefined) d.entrainement[M.stat]++;
  d.bonheur = Math.min(100, d.bonheur + 10);
  return { stat: M.stat, niv: donnerXp(d, M.xp || 30) };
}

/* ── les plumes : chaque adulte d'un enclos en lâche chaque jour (plus si elle est rare, ou très heureuse) ── */
const PLUMES_PAR = { commune: 1, rare: 2, epique: 3, mythique: 5 };
export const plumes = t => prod().plumes[t] || 0;
export function plumesAPrendre(type) {
  if (!E().enclos[type]?.construit || prod().ramassage[type] === jour()) return 0;
  return J.dansEnclos(type).filter(estAdulte).reduce((a, d) => a + PLUMES_PAR[PAR_ID[d.espece].rarete] + (d.bonheur >= 80 ? 1 : 0), 0);
}
/* la toute première fois, 6 plumes de plus en cadeau (de quoi faire un premier chapeau) */
export const BONUS_PREMIERES_PLUMES = 6;
export function ramasserPlumes(type) {
  let n = plumesAPrendre(type); if (!n) return 0;
  if (!prod().stats.plumes) n += BONUS_PREMIERES_PLUMES;
  prod().ramassage[type] = jour(); gagnerPlumes(type, n); compter('plumes', n);
  return n;
}
export function gagnerPlumes(type, n) { const P = prod(); P.plumes[type] = (P.plumes[type] || 0) + n; J.changer('plumes'); }

/* ── l'Atelier : un prix en pièces et en plumes ── */
export const coutOk = c => E().pieces >= (c.pieces || 0) && Object.entries(c.plumes || {}).every(([t, n]) => plumes(t) >= n);
export function manque(c) {
  const m = Object.entries(c.plumes || {}).filter(([t, n]) => plumes(t) < n).map(([t, n]) => `${n - plumes(t)} plume${n - plumes(t) > 1 ? 's' : ''} ${TYPES[t].e}`);
  if (E().pieces < (c.pieces || 0)) m.push(`${c.pieces - E().pieces} 🪙`);
  return m.length ? 'Il te manque ' + m.join(', ') + '.' : null;
}
function payer(c) {
  if (!coutOk(c)) return false;
  for (const [t, n] of Object.entries(c.plumes || {})) prod().plumes[t] -= n;
  if (c.pieces) J.depenser(c.pieces);
  J.changer('plumes');
  return true;
}
export function fabriquerChapeau(id) {
  const C = CHAPEAUX[id];
  if (!E().batiments.atelier?.repare) return 'L’Atelier des plumes est encore en ruine.';
  if (!C) return 'Ce chapeau n’existe pas.';
  if (!payer(C.cout)) return manque(C.cout);
  const P = prod(); P.chapeaux[id] = (P.chapeaux[id] || 0) + 1; compter('chapeaux');
  return null;
}
export function fabriquerDeco(id) {
  const D = DECORATIONS[id];
  if (!E().batiments.atelier?.repare) return 'L’Atelier des plumes est encore en ruine.';
  if (!D) return 'Cette décoration n’existe pas.';
  if (!payer(D.cout)) return manque(D.cout);
  const P = prod(); P.decorations[id] = (P.decorations[id] || 0) + 1; compter('decos');
  return null;
}
/* les chapeaux déjà faits (en stock, et portés) */
export const chapeauxPortes = () => E().dindies.filter(d => d.chapeau).map(d => d.chapeau);
export const nbChapeau = id => (prod().chapeaux[id] || 0) + chapeauxPortes().filter(x => x === id).length;
export const nbDeco = id => (prod().decorations[id] || 0) + prod().deco.filter(x => x.id === id).length;
/* mettre un chapeau (id) ou l'enlever (null) */
export function coiffer(d, id) {
  if (!estAdulte(d)) return 'Les bébés ne portent pas encore de chapeau.';
  const P = prod();
  if (id && !(P.chapeaux[id] > 0)) return 'Tu n’as pas ce chapeau.';
  if (d.chapeau) P.chapeaux[d.chapeau] = (P.chapeaux[d.chapeau] || 0) + 1;
  if (id) { P.chapeaux[id]--; if (!P.chapeaux[id]) delete P.chapeaux[id]; }
  d.chapeau = id || null;
  J.changer('dindies');
  return null;
}

/* ── la décoration du Domaine : poser, déplacer, ranger ── */
export function poserDeco(id, x, z, r = 0) {
  const P = prod();
  if (!(P.decorations[id] > 0)) return 'Tu n’as pas cette décoration : fabrique-la à l’Atelier !';
  if (P.deco.length >= MAX_DECO) return `Le Domaine est déjà bien décoré (${MAX_DECO} décorations au plus) ! Range-en une d’abord.`;
  P.decorations[id]--; if (!P.decorations[id]) delete P.decorations[id];
  const D = { k: 'k' + maintenant().toString(36) + Math.floor(Math.random() * 1296).toString(36), id, x: +x.toFixed(2), z: +z.toFixed(2), r: +r.toFixed(3) };
  P.deco.push(D); compter('posees'); J.changer('deco');
  return D;
}
export function deplacerDeco(k, x, z, r) {
  const D = prod().deco.find(d => d.k === k); if (!D) return null;
  Object.assign(D, { x: +x.toFixed(2), z: +z.toFixed(2), r: +r.toFixed(3) }); J.changer('deco');
  return D;
}
export function rangerDeco(k) {
  const P = prod(), D = P.deco.find(d => d.k === k); if (!D) return null;
  P.deco = P.deco.filter(d => d !== D); P.decorations[D.id] = (P.decorations[D.id] || 0) + 1; J.changer('deco');
  return D;
}

/* ── le Bureau des missions ── */
export const nbMissionsMax = () => E().batiments.missions?.niveau || 1;
export const modeleDe = o => MISSIONS.find(m => m.id === o.modele);
const TYPES_ILES = ['prairie', 'sable', 'pluie'];
function nouvelleOffre() {
  const M = auHasard(MISSIONS), k = auHasard([0, 0, 1, 1, 2, 2, 3, 3, 4, 5]), duree = DUREES_MISSIONS[k];
  const P = prod(); P.missions.compteur = (P.missions.compteur || 0) + 1;
  return {
    id: 'm' + P.missions.compteur + maintenant().toString(36).slice(-3), modele: M.id, k, duree, cible: 40 + 20 * k,
    pieces: Math.round(40 * Math.pow(duree / 15, .75) / 5) * 5, plumes: { [M.type || auHasard(TYPES_ILES)]: 2 + 2 * k }
  };
}
export function missions() {
  const M = prod().missions;
  M.offertes = M.offertes || []; M.encours = M.encours || [];
  while (M.offertes.length < NB_OFFRES) M.offertes.push(nouvelleOffre());
  return M;
}
/* la chance de réussir : la stat demandée (+ 12 si la dindie a le bon type), comparée à ce que demande la mission */
export function chanceMission(o, equipe) {
  const M = modeleDe(o);
  const s = equipe.reduce((a, d) => a + stats(d)[M.stat] + (M.type && PAR_ID[d.espece].types.includes(M.type) ? 12 : 0), 0);
  return Math.max(.1, Math.min(.97, s / o.cible));
}
export const texteChance = c => c >= .9 ? '😄 Presque sûr' : c >= .7 ? '🙂 Bien parti' : c >= .45 ? '😐 Possible' : '😟 Risqué';
export function peutPartir(d) {
  if (!estAdulte(d)) return `${nomDe(d)} est trop petite pour partir en mission.`;
  if (d.lieu === 'mission') return `${nomDe(d)} est déjà en mission.`;
  return null;
}
export function envoyer(idOffre, uids) {
  if (!E().batiments.missions?.repare) return 'Le Bureau des missions est encore en ruine.';
  const M = missions();
  if (M.encours.length >= nbMissionsMax()) return `Le Bureau ne gère que ${nbMissionsMax()} mission${nbMissionsMax() > 1 ? 's' : ''} à la fois. Améliore-le !`;
  const o = M.offertes.find(x => x.id === idOffre); if (!o) return 'Cette mission n’existe plus.';
  const eq = [...new Set(uids)].map(J.parUid).filter(Boolean);
  if (!eq.length || eq.length > 3) return 'Choisis 1 à 3 dindies.';
  for (const d of eq) { const err = peutPartir(d); if (err) return err; }
  const chance = chanceMission(o, eq), t = maintenant();
  M.encours.push({ ...o, uids: eq.map(d => d.uid), debut: t, fin: t + o.duree * MINUTE / (aide() ? 2 : 1), chance, reussite: Math.random() < chance });
  M.offertes = M.offertes.filter(x => x !== o); missions();
  for (const d of eq) { d.lieuAvant = d.lieu; d.lieu = 'mission'; if (E().compagnon === d.uid) E().compagnon = null; }
  compter('envoyees'); J.changer('dindies'); J.changer('missions');
  return null;
}
export const missionFinie = m => maintenant() >= m.fin;
export const restantMission = m => Math.max(0, m.fin - maintenant());
export const missionsFinies = () => missions().encours.filter(missionFinie).length;
/* le retour : les dindies rentrent chez elles (ou au Clapier, ou dans l'équipe s'il n'y a plus de place) */
function rentrer(d) {
  const avant = d.lieuAvant || 'equipe';
  d.lieu = 'retour'; delete d.lieuAvant;
  for (const l of [avant, 'clapier', 'equipe']) if (!J.deplacer(d, l)) return;
  d.lieu = 'equipe';
}
export function rapporter(id) {
  const M = missions(), m = M.encours.find(x => x.id === id);
  if (!m || !missionFinie(m)) return null;
  M.encours = M.encours.filter(x => x !== m);
  const eq = m.uids.map(J.parUid).filter(Boolean);
  eq.forEach(rentrer);
  const R = { reussite: m.reussite, modele: m.modele, pieces: Math.round(m.pieces * (m.reussite ? 1 : .3)), plumes: {}, objets: {}, plumesOr: 0, niveaux: [] };
  J.gagnerPieces(R.pieces);
  if (m.reussite) {
    for (const [t, n] of Object.entries(m.plumes)) { gagnerPlumes(t, n); R.plumes[t] = n; }
    const objet = (id, n = 1) => { J.ajouterObjet(id, n); R.objets[id] = (R.objets[id] || 0) + n; };
    const [o, n] = auHasard([['friandise', 3], ['grainesMais', 3], ['grainesBle', 3], ['grainesHaricot', 2]]); objet(o, n);
    if (m.k >= 1 && Math.random() < .3) objet('sablier');
    if (m.k >= 1 && Math.random() < .25) objet('biscuit');
    if (m.k >= 2 && Math.random() < .35) objet('oeufMystere');
    if (m.k >= 2 && Math.random() < .2) objet('grainesBaie', 2);
    if (m.k >= 4 && Math.random() < (m.k >= 5 ? .25 : .12)) objet('oeufEpique');
    if (m.k >= 5 && Math.random() < .3) { E().plumesOr += 1; R.plumesOr = 1; }
  }
  const xp = Math.round(15 * Math.sqrt(m.duree) * (m.reussite ? 1 : .5));
  for (const d of eq) { const niv = donnerXp(d, xp); if (niv) R.niveaux.push([d, niv]); }
  R.xp = xp; R.dindies = eq;
  compter('rapportees'); J.changer('dindies'); J.changer('missions');
  return R;
}

/* ── réparer les bâtiments de la production, construire un habitat, améliorer ── */
export const PRODUCTION = { potager: 'le Potager', moulin: 'le Moulin à friandises', atelier: 'l’Atelier des plumes', missions: 'le Bureau des missions' };
export function reparer(id) {
  if (!productionOuverte()) return 'Il ouvrira plus tard dans l’histoire !';
  const B = E().batiments[id]; if (!B) return 'Ce bâtiment n’existe pas.';
  if (B.repare) return null;
  if (!J.depenser(PRIX_REPARATION[id])) return `Il te faut ${PRIX_REPARATION[id]} 🪙 pour réparer ${PRODUCTION[id]}.`;
  B.repare = true; J.changer('batiments');
  return null;
}
export function construireHabitat(type) {
  if (!productionOuverte()) return 'On le reconstruira plus tard dans l’histoire !';
  if (E().enclos[type]?.construit) return null;
  if (!J.depenser(PRIX_HABITAT)) return `Il te faut ${PRIX_HABITAT} 🪙 pour construire ${TYPES[type].habitat}.`;
  E().enclos[type] = { construit: true, niveau: 1 }; compter('habitats'); J.changer('batiments');
  return null;
}
/* le niveau d'un bâtiment (cle : enclos, clapier, couvoir, nurserie, potager, missions) */
export function niveauDe(cle, type) {
  if (cle === 'enclos') return E().enclos[type]?.niveau || 0;
  if (cle === 'clapier') return E().batiments.clapier.rangees || 1;
  return E().batiments[cle]?.niveau || 1;
}
export function prochaineAmelioration(cle, type) {
  const A = AMELIORATIONS[cle], n = niveauDe(cle, type);
  if (n >= A.max) return null;
  return { niveau: n + 1, cout: { pieces: 0, plumesOr: 0, ...A.cout(n + 1) }, effet: A.effet(n + 1), avant: A.effet(n), nom: A.nom };
}
export function peutAmeliorer(cle, type) {
  if (!productionOuverte()) return 'Les améliorations arriveront plus tard dans l’histoire !';
  if (cle === 'enclos' ? !E().enclos[type]?.construit : cle === 'clapier' ? !E().batiments.clapier.repare : !E().batiments[cle]?.repare) return 'Il faut d’abord le réparer.';
  const A = prochaineAmelioration(cle, type); if (!A) return 'Il est déjà au niveau maximum !';
  if (E().pieces < A.cout.pieces) return `Il te faut ${A.cout.pieces} 🪙.`;
  if (E().plumesOr < A.cout.plumesOr) return `Il te faut ${A.cout.plumesOr} plume${A.cout.plumesOr > 1 ? 's' : ''} d’or 🪶.`;
  return null;
}
export function ameliorer(cle, type) {
  const err = peutAmeliorer(cle, type); if (err) return err;
  const A = prochaineAmelioration(cle, type);
  J.depenser(A.cout.pieces); E().plumesOr -= A.cout.plumesOr;
  if (cle === 'enclos') E().enclos[type].niveau = A.niveau;
  else if (cle === 'clapier') E().batiments.clapier.rangees = A.niveau;
  else E().batiments[cle].niveau = A.niveau;
  if (cle === 'potager') prod();
  compter('ameliorations'); J.changer('batiments'); J.changer('pieces');
  return null;
}

/* ── rendre à la nature : un petit au revoir, contre des plumes de son type ── */
export function peutRelacher(d) {
  if (d.origine === 'premiere') return 'C’est ta toute première dindie : elle reste avec toi pour toujours !';
  if (d.lieu === 'mission') return 'Elle est partie en mission.';
  if (E().dindies.length <= 1) return 'C’est ta seule dindie !';
  return null;
}
export const plumesRelacher = d => { const esp = PAR_ID[d.espece]; return { type: esp.types[0], n: PLUMES_RELACHER[esp.rarete] + (d.chroma ? 10 : 0) }; };
export function relacher(d) {
  const err = peutRelacher(d); if (err) return err;
  const R = plumesRelacher(d);
  if (d.chapeau) { const P = prod(); P.chapeaux[d.chapeau] = (P.chapeaux[d.chapeau] || 0) + 1; }
  if (E().compagnon === d.uid) E().compagnon = null;
  E().dindies = E().dindies.filter(x => x !== d);
  gagnerPlumes(R.type, R.n); compter('relachees');
  J.changer('dindies');
  return R;
}
