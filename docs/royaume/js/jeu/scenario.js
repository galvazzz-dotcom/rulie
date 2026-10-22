/* ══════════ L'HISTOIRE : CHAPITRE 1 (LE DOMAINE EN RUINE) ET CHAPITRE 2 (L'EXPÉDITION) ══════════
   Une suite d'étapes (une seule à la fois, pour que ce soit clair) regroupées en quêtes.
   La scène appelle : parler(pnj), interagir(id), gadget(id), evenement(type, valeur) ;
   et lit : texteEtape(), cibleEtape() (pour la flèche qui guide), lieuEtape(). */
import { PAR_ID } from '../donnees/especes.js';
import { TYPES } from '../donnees/types.js';
import { REGIONS } from '../donnees/regions.js';
import { PERSONNAGES, portraitChibi } from '../personnages/chibi.js';
import * as J from './etat.js';
import { nouvelleDindie, nomDe } from './individus.js';
import { OBJETS } from './objets.js';
import { dialogue, toast } from '../moteur/ui.js';
import { tada, pop } from '../moteur/sons.js';
import { forcerHeure, estMatin, estNuit } from '../moteur/temps.js';
import { forcerMeteo, meteo } from '../moteur/meteo.js';
import { jour } from './trouvailles.js';
import { CACHETTES } from '../monde/domaine.js';

export const STARTERS = ['paquerette', 'crachin', 'braise'];
export const CHAPITRES = { 1: 'Le Domaine en ruine', 2: 'L’expédition', 3: 'Le premier œuf', 4: 'Le Dindodrome ouvre' };
export const QUETES = [
  { id: 'q1', chapitre: 1, titre: 'Bienvenue au Domaine', etapes: ['arrivee', 'choix'], recompense: { pieces: 300 } },
  { id: 'q2', chapitre: 1, titre: 'Un abri pour ta dindie', etapes: ['planches', 'reparer1', 'installer1'], recompense: { pieces: 100 } },
  { id: 'q3', chapitre: 1, titre: 'Le Clapier à dindes', etapes: ['cadeau', 'clous', 'reparerClapier', 'ranger'], recompense: { pieces: 100 } },
  { id: 'q4', chapitre: 1, titre: 'Un deuxième enclos', etapes: ['kit', 'reparer2'], recompense: { pieces: 100 } },
  { id: 'q5', chapitre: 1, titre: 'Les friandises de Mimi', etapes: ['friandises', 'nourrir'], recompense: { pieces: 150 } },
  { id: 'q6', chapitre: 1, titre: 'Le Grand Livre', etapes: ['musee', 'livre'], recompense: { pieces: 100, objets: { filet: 1 } } },
  { id: 'q7', chapitre: 1, titre: 'La montgolfière', etapes: ['zephyr', 'corde', 'toile', 'ballon'], recompense: { pieces: 200, objets: { billet: 1 } } },
  { id: 'q8', chapitre: 2, titre: 'Le grand départ', etapes: ['decollage', 'gaston'], recompense: { pieces: 100, objets: { friandise: 5 } } },
  { id: 'q9', chapitre: 2, titre: 'Ta première capture', etapes: ['capture1'], recompense: { pieces: 100, objets: { trefleSucre: 3 } } },
  { id: 'q10', chapitre: 2, titre: 'La page des Prés', etapes: ['pres3'], recompense: { pieces: 200 } },
  { id: 'q11', chapitre: 2, titre: 'Le champ de coquelicots', etapes: ['parlerGaston2', 'plumesRouges', 'coquelicot'], recompense: { pieces: 300, plumesOr: 1 } },
  { id: 'q12', chapitre: 2, titre: 'Cap sur le Maroc imaginaire', etapes: ['chapeau', 'volMaroc', 'leila'], recompense: { pieces: 150, objets: { miel: 3 } } },
  { id: 'q13', chapitre: 2, titre: 'Les secrets des dunes', etapes: ['maroc3'], recompense: { pieces: 250 } },
  { id: 'q14', chapitre: 2, titre: 'Les lanternes du souk', etapes: ['parlerLeila2', 'lanternes', 'dingue'], recompense: { pieces: 350, plumesOr: 1 } },
  { id: 'q15', chapitre: 2, titre: 'Cap sur la Belgique', etapes: ['parapluie', 'volBelgique', 'waffel'], recompense: { pieces: 150, objets: { gaufre: 3 } } },
  { id: 'q16', chapitre: 2, titre: 'Les canaux de Monsieur Waffel', etapes: ['belgique3'], recompense: { pieces: 250 } },
  { id: 'q17', chapitre: 2, titre: 'Le mystère de l’Atomium', etapes: ['parlerWaffel2', 'boules', 'atomium'], recompense: { pieces: 400, plumesOr: 2 } },
  { id: 'q18', chapitre: 3, titre: 'Le Couvoir', etapes: ['parlerPlumeau3', 'kitCouvoir', 'reparerCouvoir'], recompense: { pieces: 150 } },
  { id: 'q19', chapitre: 3, titre: 'Le premier œuf', etapes: ['oeufTuto', 'eclosion'], recompense: { pieces: 100, objets: { sablier: 2 } } },
  { id: 'q20', chapitre: 3, titre: 'La Nurserie', etapes: ['kitNurserie', 'reparerNurserie', 'grandir'], recompense: { pieces: 150, objets: { biscuit: 3 } } },
  { id: 'q21', chapitre: 3, titre: 'Le premier croisement', etapes: ['nid', 'oeufCroise'], recompense: { pieces: 250, objets: { biscuit: 5 } } },
  { id: 'q22', chapitre: 3, titre: 'L’éveil', etapes: ['parlerPlumeau4', 'eveil'], recompense: { pieces: 300, plumesOr: 2 } }
];
const ORDRE = [...QUETES.flatMap(q => q.etapes), 'fin'];
export const queteDe = etape => QUETES.find(q => q.etapes.includes(etape));
export const chapitreActuel = () => { const Q = queteDe(E().quete.etape); return Q ? Q.chapitre : 3; };
/* l'histoire en est-elle arrivée à cette étape (ou plus loin) ? */
export const etapeAtteinte = s => ORDRE.indexOf(E().quete.etape) >= ORDRE.indexOf(s);
const OUVERTURE = { pres: 'decollage', maroc: 'volMaroc', belgique: 'volBelgique' };
export const regionOuverte = id => id === 'domaine' || (!!OUVERTURE[id] && etapeAtteinte(OUVERTURE[id]));

const E = () => J.etat();
const qui = id => ({ nom: PERSONNAGES[id].nom, portrait: portraitChibi(PERSONNAGES[id], 'dlg' + id), couleur: PERSONNAGES[id].couleur });
const moi = () => ({ nom: 'Roullieee', portrait: portraitChibi(PERSONNAGES.roullieee, 'dlgmoi'), couleur: PERSONNAGES.roullieee.couleur });
const L = (id, texte, choix) => ({ qui: id === 'moi' ? moi() : qui(id), texte, choix });
const starter = () => E().dindies.find(d => STARTERS.includes(d.espece) && d.origine === 'premiere');
export const typeStarter = () => { const s = starter(); return s ? PAR_ID[s.espece].types[0] : 'prairie'; };
export const type2 = () => typeStarter() === 'prairie' ? 'pluie' : 'prairie';
const glouglou = () => E().dindies.find(d => d.origine === 'cadeau');
const habitat = t => TYPES[t].habitat;
/* les espèces (non épiques) d'une région, et celles déjà attrapées là-bas */
const BESOIN = { pres: ['glouglou', 'paquerette', 'trefle'], maroc: ['dindasable', 'dromadaire', 'mirageus'], belgique: ['gaufrette', 'crachin', 'belgicus'] };
export const attrapeesDans = region => new Set(E().dindies.filter(d => d.origine === 'sauvage:' + region).map(d => d.espece));
const manquantes = region => BESOIN[region].filter(x => !attrapeesDans(region).has(x));
const compte = region => BESOIN[region].length - manquantes(region).length;
const ramasses = (prefixe, n = 3) => Array.from({ length: n }, (_, i) => prefixe + (i + 1)).filter(id => E().monde.ramasses[id]).length;

/* ── où se passe l'étape (null = partout) ── */
const LIEU = { gaston: 'pres', capture1: 'pres', pres3: 'pres', parlerGaston2: 'pres', plumesRouges: 'pres', coquelicot: 'pres', chapeau: 'domaine',
  leila: 'maroc', maroc3: 'maroc', parlerLeila2: 'maroc', lanternes: 'maroc', dingue: 'maroc', parapluie: 'domaine', waffel: 'belgique', belgique3: 'belgique',
  parlerWaffel2: 'belgique', boules: 'belgique', atomium: 'belgique', volMaroc: 'zephyr', volBelgique: 'zephyr', decollage: 'domaine',
  parlerPlumeau3: 'domaine', kitCouvoir: 'domaine', reparerCouvoir: 'domaine', oeufTuto: 'domaine', eclosion: 'domaine', kitNurserie: 'domaine', reparerNurserie: 'domaine',
  grandir: 'domaine', nid: 'domaine', oeufCroise: 'domaine', parlerPlumeau4: 'domaine', eveil: 'domaine' };
export const lieuEtape = () => { const s = E().quete.etape; return ORDRE.indexOf(s) < ORDRE.indexOf('decollage') ? 'domaine' : LIEU[s] || null; };
let lieuActuel = () => 'domaine';
const nomLieu = id => id === 'domaine' ? 'au Domaine' : REGIONS[id] ? `${REGIONS[id].nom.replace(/^(Le |La |Les )/, m => ({ 'Le ': 'au ', 'La ': 'en ', 'Les ': 'aux ' })[m])}` : '';

/* ── le texte de l'étape (le bandeau en haut) et ce que montre la flèche ── */
export function texteEtape() {
  const e = E(), s = e.quete.etape, ici = lieuActuel(), la = lieuEtape();
  const t = ({
    arrivee: 'Va voir le Professeur Plumeau, devant le Labo 🔬',
    choix: 'Choisis ta première dindie !',
    planches: `Ramasse 3 planches dans le Domaine 🪵 (${e.quete.compteur}/3)`,
    reparer1: `Construis ${habitat(typeStarter())} dans l’allée des enclos`,
    installer1: `Installe ${starter() ? nomDe(starter()) : 'ta dindie'} dans ${habitat(typeStarter())}`,
    cadeau: 'Retourne voir le Professeur Plumeau',
    clous: 'Achète une boîte de clous chez Mimi 🛒',
    reparerClapier: 'Répare le Clapier à dindes 🐾',
    ranger: `Range ${glouglou() ? nomDe(glouglou()) : 'le Dindon Glouglou'} dans le Clapier 🐾`,
    kit: 'Achète un kit de planches chez Mimi 🛒',
    reparer2: `Construis ${habitat(type2())} dans l’allée des enclos`,
    friandises: 'Achète des friandises chez Mimi 🍪',
    nourrir: `Donne une friandise à tes 2 dindies (${e.quete.nourries.length}/2)`,
    musee: 'Visite le Musée du Grand Livre 📖',
    livre: 'Raconte ta visite au Professeur Plumeau',
    zephyr: 'Va voir le Capitaine Zéphyr, au port ⛵',
    corde: 'Trouve la grosse corde près du Bureau des missions 🪢',
    toile: 'Achète une toile de montgolfière chez Mimi 🧵',
    ballon: 'Rapporte la corde et la toile au Capitaine Zéphyr',
    decollage: 'Monte dans la montgolfière avec le Capitaine Zéphyr 🎈',
    gaston: 'Va voir Gaston le berger, près de sa ferme 🧑‍🌾',
    capture1: 'Attrape ta première dindie sauvage ! Touche-la pour t’approcher 🥅',
    pres3: `Attrape 3 espèces des Prés : Glouglou, Pâquerette, Trèfle (${compte('pres')}/3)`,
    parlerGaston2: 'Raconte tes captures à Gaston 🧑‍🌾',
    plumesRouges: `Trouve les 3 plumes rouges dans les Prés 🪶 (${ramasses('plumeRouge')}/3)`,
    coquelicot: 'Attrape le Grand Dindon Coquelicot : le matin, dans le champ de coquelicots 🌺',
    chapeau: 'Achète un chapeau de soleil chez Mimi, au Domaine 👒',
    volMaroc: 'Envole-toi vers le Maroc imaginaire avec le Capitaine Zéphyr 🎈',
    leila: 'Va voir Leïla des Dunes, au souk 🏮',
    maroc3: `Attrape 3 espèces du Maroc : Dindasable, Dindromadaire, Mirageus (${compte('maroc')}/3)`,
    parlerLeila2: 'Raconte tes captures à Leïla 🏮',
    lanternes: `Allume les 3 lanternes du souk 🏮 (${ramasses('lanterne')}/3)`,
    dingue: 'Attrape la Dinde D’Inde Dingue : la nuit, près des lanternes du souk 🌙',
    parapluie: 'Achète un parapluie chez Mimi, au Domaine ☂️',
    volBelgique: 'Envole-toi vers la Belgique avec le Capitaine Zéphyr 🎈',
    waffel: 'Va voir Monsieur Waffel, sur la Grand-Place 🧇',
    belgique3: `Attrape 3 espèces de Belgique : Gaufrette, Crachin, Belgicus (${compte('belgique')}/3)`,
    parlerWaffel2: 'Raconte tes captures à Monsieur Waffel 🧇',
    boules: `Retrouve les 3 boules perdues de l’Atomium 🔘 (${ramasses('bouleArgent')}/3)`,
    atomium: 'Attrape le Dindonus Atomium : sous la pluie, près de l’Atomium ☔',
    parlerPlumeau3: 'Raconte ton expédition au Professeur Plumeau 🔬',
    kitCouvoir: 'Achète un kit de construction chez Mimi 🧰',
    reparerCouvoir: 'Répare le Couvoir, au nord du Domaine 🥚',
    oeufTuto: 'Mets l’œuf du Professeur dans une couveuse du Couvoir 🥚',
    eclosion: 'Attends un peu, puis fais éclore l’œuf au Couvoir 🐣',
    kitNurserie: 'Achète un autre kit de construction chez Mimi 🧰',
    reparerNurserie: 'Répare la Nurserie, à côté du Couvoir 🍼',
    grandir: 'Nourris ton poussin à la Nurserie : il deviendra une jeune dindie 🐥',
    nid: 'Mets deux dindies adultes de types différents dans le nid du Couvoir 💕',
    oeufCroise: 'Fais éclore l’œuf du croisement au Couvoir (⏳ un sablier aide !) 🥚',
    parlerPlumeau4: 'Montre ton hybride au Professeur Plumeau 🔬',
    eveil: 'Éveille une dindie au Labo : niveau 20 et une pierre d’éveil 🌟',
    fin: 'Chapitre 4 bientôt : le Dindodrome ouvre ! 🏁'
  })[s] || '';
  if (la && la !== 'zephyr' && la !== ici) return t + ` <i>(${nomLieu(la)} : en montgolfière 🎈)</i>`;
  return t;
}
/* l'identifiant de l'objet interactif à montrer (ou une liste : le plus proche) ;
   'sauvage:espece' = une dindie sauvage ; 'zone:nom' = un coin de la région */
export function cibleEtape() {
  const e = E(), s = e.quete.etape, ici = lieuActuel(), la = lieuEtape();
  if (la && la !== 'zephyr' && la !== ici) return 'pnj-zephyr';
  if (s === 'planches') return ['planche1', 'planche2', 'planche3'].filter(p => !e.monde.ramasses[p]).map(p => 'objet-' + p);
  if (s === 'nourrir') {
    const pas = e.dindies.filter(d => !e.quete.nourries.includes(d.uid));
    return pas.map(d => d.lieu.startsWith('enclos:') ? 'enclos-' + d.lieu.slice(7) : d.lieu === 'clapier' ? 'clapier' : 'moi');
  }
  if (s === 'capture1') return ['sauvage'];
  if (s === 'pres3' || s === 'maroc3' || s === 'belgique3') { const r = s.replace('3', ''), m = manquantes(r); return [...m.map(x => 'sauvage:' + x), ...m.map(x => 'zone:' + REGIONS[r].especes[x].zone)]; }
  if (s === 'plumesRouges') return [1, 2, 3].filter(i => !e.monde.ramasses['plumeRouge' + i]).map(i => 'objet-plumeRouge' + i);
  if (s === 'lanternes') return [1, 2, 3].filter(i => !e.monde.ramasses['lanterne' + i]).map(i => 'gadget-lanterne' + i);
  if (s === 'boules') return [1, 2, 3].filter(i => !e.monde.ramasses['bouleArgent' + i]).map(i => 'objet-bouleArgent' + i);
  if (s === 'coquelicot') return ['sauvage:coquelicot', estMatin() ? 'zone:coquelicots' : 'gadget-coq'];
  if (s === 'dingue') return ['sauvage:dingue', estNuit() ? 'zone:souk' : 'gadget-cadran'];
  if (s === 'atomium') return ['sauvage:atomium', meteo('belgique') === 'pluie' ? 'zone:atomium' : 'gadget-nuage'];
  return ({
    arrivee: 'pnj-plumeau', choix: 'pnj-plumeau', reparer1: 'enclos-' + typeStarter(), installer1: 'enclos-' + typeStarter(), cadeau: 'pnj-plumeau',
    clous: 'pnj-mimi', reparerClapier: 'clapier', ranger: 'clapier', kit: 'pnj-mimi', reparer2: 'enclos-' + type2(), friandises: 'pnj-mimi',
    musee: 'musee', livre: 'pnj-plumeau', zephyr: 'pnj-zephyr', corde: 'objet-corde', toile: 'pnj-mimi', ballon: 'pnj-zephyr',
    decollage: 'pnj-zephyr', gaston: 'pnj-gaston', parlerGaston2: 'pnj-gaston', chapeau: 'pnj-mimi', volMaroc: 'pnj-zephyr', leila: 'pnj-leila',
    parlerLeila2: 'pnj-leila', parapluie: 'pnj-mimi', volBelgique: 'pnj-zephyr', waffel: 'pnj-waffel', parlerWaffel2: 'pnj-waffel',
    parlerPlumeau3: 'pnj-plumeau', kitCouvoir: 'pnj-mimi', reparerCouvoir: 'couvoir', oeufTuto: 'couvoir', eclosion: 'couvoir', kitNurserie: 'pnj-mimi',
    reparerNurserie: 'nurserie', grandir: 'nurserie', nid: 'couvoir', oeufCroise: 'couvoir', parlerPlumeau4: 'pnj-plumeau', eveil: 'labo'
  })[s] || null;
}

/* ── avancer d'une étape (et donner la récompense quand une quête se termine) ── */
let monde = null;   /* les fonctions de la scène : construire un enclos, ouvrir la carte du monde, etc. */
export function brancher(m) { monde = m; if (m.lieu) lieuActuel = m.lieu; preparerEtape(); }
export const preparer = () => preparerEtape();
function avancer() {
  const e = E(), i = ORDRE.indexOf(e.quete.etape), Q = queteDe(e.quete.etape), suivante = ORDRE[i + 1];
  if (Q && Q.etapes[Q.etapes.length - 1] === e.quete.etape) {
    e.quete.finies.push(Q.id);
    const r = Q.recompense || {};
    if (r.pieces) J.gagnerPieces(r.pieces);
    if (r.plumesOr) { e.plumesOr += r.plumesOr; J.changer('pieces'); }
    for (const [o, n] of Object.entries(r.objets || {})) J.ajouterObjet(o, n);
    tada();
    toast(`✅ Quête terminée : <b>${Q.titre}</b>` + (r.pieces ? `<br>+ ${r.pieces} 🪙` : '') + (r.plumesOr ? ` + ${r.plumesOr} 🪶` : '') + Object.entries(r.objets || {}).map(([o, n]) => ` + ${OBJETS[o].e}${n > 1 ? ' × ' + n : ''}`).join(''), { duree: 3800, classe: 'grand' });
    const N = queteDe(suivante);
    if (N && N.chapitre !== Q.chapitre) setTimeout(() => monde && monde.finChapitre && monde.finChapitre(Q.chapitre), 900);
    else if (N) setTimeout(() => toast(`📜 Nouvelle quête : <b>${N.titre}</b>`, { duree: 3200 }), 1400);
    else if (suivante === 'fin') setTimeout(() => monde && monde.finChapitre && monde.finChapitre(Q.chapitre), 900);
  }
  e.quete.etape = suivante; e.quete.compteur = 0;
  preparerEtape();
  J.changer('quete');
}
/* ce qu'il faut poser dans le lieu où l'on est, pour l'étape (planches, corde, plumes, boules) */
function preparerEtape() {
  if (!monde) return;
  const e = E(), s = e.quete.etape, ici = lieuActuel();
  if (ici === 'domaine') {
    if (s === 'planches') for (const p of ['planche1', 'planche2', 'planche3']) if (!e.monde.ramasses[p]) monde.poserObjet(p, 'planche', ...CACHETTES[p]);
    if (s === 'corde' && !e.monde.ramasses.corde) monde.poserObjet('corde', 'corde', ...CACHETTES.corde);
    if (['ballon', 'fin'].includes(s) || e.batiments.montgolfiere.reparee) monde.gonflerBallon(e.batiments.montgolfiere.reparee);
    if (e.batiments.montgolfiere.reparee) monde.montrerGontran && monde.montrerGontran(true);
  }
  if (ici === 'pres' && s === 'plumesRouges') for (const i of [1, 2, 3]) if (!e.monde.ramasses['plumeRouge' + i]) monde.poserObjet('plumeRouge' + i, 'plume');
  if (ici === 'belgique' && s === 'boules') for (const i of [1, 2, 3]) if (!e.monde.ramasses['bouleArgent' + i]) monde.poserObjet('bouleArgent' + i, 'boule');
  if (ici === 'maroc' && monde.allumerLanterne) for (const i of [1, 2, 3]) monde.allumerLanterne(i, !!e.monde.ramasses['lanterne' + i]);
  /* déjà fait avant d'y arriver (des captures en avance) : on passe à la suite */
  if (s === 'grandir' && e.dindies.some(d => d.stade === 'jeune' && d.lieu === 'nurserie')) setTimeout(() => { if (E().quete.etape === s) avancer(); }, 600);
  if ((s === 'capture1' && attrapeesDans('pres').size) || (s === 'pres3' && !manquantes('pres').length) || (s === 'maroc3' && !manquantes('maroc').length) || (s === 'belgique3' && !manquantes('belgique').length)) setTimeout(() => { if (E().quete.etape === s) avancer(); }, 600);
}

/* ── un petit cadeau du guide, une fois par jour ── */
function cadeauDuJour(id, objet) {
  const e = E(); e.quotidien.cadeaux = e.quotidien.cadeaux || {};
  if (e.quotidien.cadeaux[id] === jour()) return false;
  e.quotidien.cadeaux[id] = jour(); J.ajouterObjet(objet, 2); toast(`🎁 ${PERSONNAGES[id].nom} t’offre ${OBJETS[objet].e} ${OBJETS[objet].nom} × 2 !`); return true;
}

/* ── parler à un habitant ── */
export async function parler(id) {
  const e = E(), s = e.quete.etape;
  if (id === 'plumeau') {
    if (s === 'arrivee') {
      await dialogue([
        L('plumeau', 'Ah ! Te voilà enfin, Roullieee ! Bienvenue au <b>Domaine des Dindies</b> !'),
        L('moi', 'Bonjour, Professeur ! J’ai reçu votre lettre. Cette nuit, j’ai vu le Dindromakus RUUULIUSSS Maximus !'),
        L('plumeau', 'Le Dindromakus ? Le plus grand mystère du Royaume ! On dit qu’il ne revient que pour les plus grands éleveurs de dindies…'),
        L('plumeau', 'Ce Domaine appartenait autrefois aux meilleurs éleveurs. Aujourd’hui, tout est en ruine… Je te le confie !'),
        L('plumeau', 'Et voici le <b>Grand Livre des Dindies</b> : 72 pages, une par espèce. Il est vide. À toi de le remplir !'),
        L('plumeau', 'Tiens, voilà aussi 300 pièces pour commencer. Mais d’abord… il te faut une dindie !')
      ]);
      J.ajouterObjet('grandLivre');
      STARTERS.forEach(J.voir);
      avancer();
      return parler('plumeau');
    }
    if (s === 'choix') {
      await dialogue([L('plumeau', 'J’ai trois jeunes dindies qui cherchent une amie. Laquelle choisis-tu ? Regarde-les bien !')]);
      const choix = await monde.choisirStarter();
      if (!choix) return;
      const d = J.ajouterDindie(nouvelleDindie(choix.espece, { niveau: 5, origine: 'premiere', surnom: choix.surnom, talents: [2, 2, 2].map(t => t + Math.floor(Math.random() * 2)) }));
      J.choisirCompagnon(d);
      monde.celebrer();
      await dialogue([L('plumeau', `${nomDe(d)}, ${PAR_ID[d.espece].nom} ! Un excellent choix. Elle va te suivre partout, regarde !`),
        L('plumeau', `Il lui faudra une maison : <b>${habitat(typeStarter())}</b>, dans l’allée des enclos, à l’ouest. Ramasse 3 planches et répare-le !`)]);
      avancer();
      return;
    }
    if (s === 'cadeau') {
      const g = J.ajouterDindie(nouvelleDindie('glouglou', { niveau: 3, origine: 'cadeau' }));
      await dialogue([L('plumeau', 'Bravo pour l’enclos ! Tes dindies vont adorer cet endroit.'),
        L('plumeau', `J’ai une surprise : ce ${PAR_ID.glouglou.nom} se promenait tout seul près du Labo. Il est un peu timide… Tu veux bien t’en occuper ?`),
        L('moi', 'Oh oui ! Bienvenue, petit glouglou !'),
        L('plumeau', 'Il lui faut une place pour dormir. Le <b>Clapier à dindes</b> est en ruine, mais Mimi vend des clous pour le réparer.')]);
      J.choisirCompagnon(g.lieu === 'equipe' ? g : null);
      avancer();
      return;
    }
    if (s === 'livre') {
      await dialogue([L('plumeau', 'Alors, ce Musée ? Chaque dindie que tu ajoutes au Grand Livre y aura son portrait.'),
        L('plumeau', 'Les dindies ont 4 raretés : <b>commune</b> ⚪, <b>rare</b> 🔵, <b>épique</b> 🟣 et <b>mythique</b> 🌈. Les mythiques… sont des légendes.'),
        L('plumeau', 'Certaines espèces naissent seulement d’un <b>croisement</b> ! Le Grand Livre te donnera des indices.'),
        L('plumeau', 'Prends ce <b>filet d’exploratrice</b>. Le Capitaine Zéphyr t’attend au port : il peut t’emmener dans les Prés, où vivent des dindies sauvages !')]);
      avancer();
      return;
    }
    if (s === 'parlerPlumeau3') {
      await dialogue([L('plumeau', 'Roullieee ! Les Prés, le Maroc, la Belgique… et même l’Atomium ! Quelle exploratrice !'),
        L('plumeau', 'Maintenant, place au cœur du métier d’éleveuse : <b>les œufs</b>. Deux dindies adultes qui s’aiment bien… et hop, un œuf !'),
        L('plumeau', 'Et les <b>œufs mystère</b> que tu as trouvés dans les îles ? Il leur faut un <b>Couvoir</b> bien chaud.'),
        L('plumeau', 'Le vieux Couvoir, au nord du Domaine, est en ruine. Mimi vend des <b>kits de construction</b> : à toi de jouer !')]);
      avancer();
      return;
    }
    if (s === 'eclosion' || s === 'oeufTuto') { await dialogue([L('plumeau', s === 'oeufTuto' ? 'Mets mon œuf dans une couveuse du Couvoir. Il éclora en un rien de temps !' : 'Patience… Un œuf, ça ne se presse pas ! Enfin, celui-là, c’est l’affaire de quelques secondes.')]); return; }
    if (s === 'nid') {
      await dialogue([L('plumeau', 'Pour un <b>hybride</b>, choisis deux parents de <b>types différents</b> : par exemple une dindie 🌿 Prairie et une dindie 💧 Pluie.'),
        L('plumeau', 'Leur bébé peut prendre un type de chaque parent ! Le Grand Livre te donne des indices : « un parent 🔥, un parent ❄️ »…')]);
      return;
    }
    if (s === 'parlerPlumeau4') {
      await dialogue([L('plumeau', 'Un hybride ! Fantastique ! Tu es une vraie éleveuse, maintenant.'),
        L('plumeau', 'Dernière leçon : <b>l’éveil</b>. Une dindie de <b>niveau 20</b> peut s’éveiller avec une <b>pierre d’éveil</b> 💎 : elle devient plus forte, et change d’allure !'),
        L('plumeau', 'Pour gagner des niveaux : des friandises, des <b>biscuits de champion</b> 🍘, des captures, et des promenades avec ta compagne. Tiens, voici de quoi commencer.')]);
      const pierre = !J.combien('pierreEveil');
      J.ajouterObjet('biscuit', 5); if (pierre) J.ajouterObjet('pierreEveil');
      toast('🎁 Le Professeur t’offre 🍘 5 biscuits de champion' + (pierre ? ' et 💎 une pierre d’éveil' : '') + ' !', { duree: 3500 });
      avancer();
      return;
    }
    if (etapeAtteinte('capture1') && !e.quete.plumeauCapture && e.dindies.some(d => d.origine.startsWith('sauvage:'))) {
      e.quete.plumeauCapture = true;
      await dialogue([L('plumeau', 'Ho ho ! Une dindie sauvage ! Chaque nouvelle espèce attrapée te rapporte une prime de 50 pièces. C’est le règlement du Grand Livre !'),
        L('plumeau', 'Un conseil : les dindies rares ont besoin d’un équipement spécial. Les épiques, elles, sont liées à une vieille légende de leur région…')]);
    }
    return monde.ouvrirLabo();
  }
  if (id === 'mimi') {
    const besoin = { clous: 'clous', kit: 'kitPlanches', friandises: 'friandise', toile: 'toile', chapeau: 'chapeauSoleil', parapluie: 'parapluie', kitCouvoir: 'kitConstruction', kitNurserie: 'kitConstruction' }[s] || (s === 'corde' ? 'toile' : null);
    if (besoin && !J.combien(besoin) && E().pieces < OBJETS[besoin].prix * (besoin === 'friandise' ? 2 : 1)) {
      await dialogue([L('mimi', `Oh, il te manque des pièces ? Ce n’est pas grave : je te l’offre ! Les amis des dindies sont mes amis.`)]);
      J.ajouterObjet(besoin, besoin === 'friandise' ? 2 : 1);
      evenement('achat', besoin);
      return;
    }
    if (!e.quete.mimiVue) { e.quete.mimiVue = true; await dialogue([L('mimi', 'Bonjour ! Moi c’est Mimi. Graines, friandises, outils… j’ai tout ce qu’il faut pour tes dindies !')]); }
    if (s === 'chapeau' && !e.quete.mimiChapeau) { e.quete.mimiChapeau = true; await dialogue([L('mimi', 'Le Maroc imaginaire ? Il y fait un soleil de plomb ! Il te faut absolument un <b>chapeau de soleil</b> 👒. J’en ai un pour toi !')]); }
    if ((s === 'kitCouvoir' || s === 'kitNurserie') && !e.quete['mimi' + s]) { e.quete['mimi' + s] = true; await dialogue([L('mimi', 'Un kit de construction ? Planches, clous, peinture… et même un petit marteau ! Le voilà !')]); }
    if (s === 'parapluie' && !e.quete.mimiParapluie) { e.quete.mimiParapluie = true; await dialogue([L('mimi', 'La Belgique ? Là-bas, il pleut souvent… Prends un <b>parapluie</b> ☂️ ! Et rapporte-moi une gaufre, hi hi !')]); }
    return monde.ouvrirBoutique();
  }
  if (id === 'zephyr') {
    if (s === 'zephyr') {
      await dialogue([L('zephyr', 'Ahoy, exploratrice ! Capitaine Zéphyr, pilote de montgolfière. Le vent m’a dit que tu voulais voir les Prés ?'),
        L('zephyr', 'Malheureusement, mon ballon est déchiré… Il me faudrait une <b>toile neuve</b> (Mimi en vend) et ma <b>grosse corde</b>.'),
        L('zephyr', 'Cette corde, je l’ai perdue près du vieux Bureau des missions, à l’ouest du port. Tu m’aides ?'),
        L('moi', 'Bien sûr, Capitaine !')]);
      avancer();
      return;
    }
    if (s === 'ballon' || ((s === 'corde' || s === 'toile') && J.combien('corde') && J.combien('toile'))) {
      if (!J.combien('corde') || !J.combien('toile')) { await dialogue([L('zephyr', 'Il me faut encore la grosse corde et la toile !')]); return; }
      J.retirerObjet('corde'); J.retirerObjet('toile');
      await dialogue([L('zephyr', 'La toile ET la corde ! Hop, hop, je recouds… je noue… et je gonfle !')]);
      E().batiments.montgolfiere.reparee = true;
      await monde.gonflerBallonAnime();
      monde.montrerGontran(true);
      await dialogue([
        L('gontran', 'Hé ! Pas si vite ! C’est MA montgolfière qui va partir la première !'),
        L('moi', 'Euh… bonjour ? Qui es-tu ?'),
        L('gontran', 'Gontran Gloupi, le plus grand dresseur de dindies du Royaume ! Enfin… bientôt. Moi aussi, je vais remplir le Grand Livre. Et je serai le premier !'),
        L('gontran', 'On se reverra au Dindodrome, Roullieee ! Gloup gloup !'),
        L('zephyr', 'Ha ha ! Un rival ! Garde ce billet, exploratrice : il est valable pour toutes les îles du Royaume. On décolle quand tu veux !')]);
      e.quete.etape = 'ballon'; avancer();
      return;
    }
    if (!etapeAtteinte('decollage')) { await dialogue([L('zephyr', 'Le ciel est bleu, le vent est doux… Un jour parfait pour voler ! Enfin, presque.')]); return; }
    /* la montgolfière marche : on choisit où aller */
    const ici = lieuActuel();
    await dialogue([L('zephyr', ici === 'domaine' ? (s === 'decollage' ? 'Le vent est parfait aujourd’hui ! Direction les Prés ? Monte dans la nacelle, exploratrice !' : 'Où allons-nous aujourd’hui, exploratrice ?')
      : 'On rentre au Domaine, ou on s’envole vers une autre île ?')]);
    monde.ouvrirMonde && monde.ouvrirMonde();
    return;
  }
  if (id === 'gaston') {
    if (s === 'gaston') {
      await dialogue([L('gaston', 'Salut, l’exploratrice ! Moi, c’est Gaston, le berger des Prés. Ici, les dindies vivent en liberté, comme mes moutons… enfin, si j’avais des moutons !'),
        L('gaston', 'Pour en attraper une, approche-toi tout doucement et <b>touche-la</b>.'),
        L('gaston', 'Donne-lui des <b>friandises</b> : sa <b>confiance</b> monte. Plus elle te fait confiance, plus la <b>zone verte</b> est grande.'),
        L('gaston', 'Puis lance ton <b>filet</b> quand le cercle blanc passe dans la zone verte. Hop ! Tiens, voilà 5 friandises pour commencer.'),
        L('moi', 'Merci, Gaston ! J’y vais !')]);
      avancer();
      return;
    }
    if (s === 'capture1') { await dialogue([L('gaston', 'Regarde dans l’herbe, il y en a partout ! Touche une dindie pour t’approcher. Et pas de panique si tu rates : tu as 3 essais !')]); return; }
    if (s === 'pres3') {
      const m = manquantes('pres');
      await dialogue([L('gaston', `Il te manque encore : ${m.map(x => '<b>' + PAR_ID[x].nom + '</b>').join(', ')}.`),
        L('gaston', m.includes('trefle') ? 'Le Dindon Trèfle se cache près des <b>trèfles</b> 🍀, à l’est. Il est rare : sois patiente !' : m.includes('paquerette') ? 'La Pâquerette se promène dans le <b>pré fleuri</b>… mais seulement le jour : la nuit, elle dort !' : 'Le Glouglou ? Il y en a partout dans l’herbe !')]);
      return;
    }
    if (s === 'parlerGaston2') {
      await dialogue([L('gaston', 'Bravo ! Glouglou, Pâquerette et Trèfle : tu as rempli la page des Prés… ou presque !'),
        L('gaston', 'On raconte qu’un <b>Grand Dindon Coquelicot</b> vit dans le champ de coquelicots. Il ne se montre qu’à ceux qui ont trouvé ses <b>3 plumes rouges</b>.'),
        L('gaston', 'Elles sont tombées quelque part dans les Prés… Ouvre l’œil !')]);
      avancer();
      return;
    }
    if (s === 'plumesRouges') { await dialogue([L('gaston', `Tu as trouvé ${ramasses('plumeRouge')} plume${ramasses('plumeRouge') > 1 ? 's' : ''} rouge${ramasses('plumeRouge') > 1 ? 's' : ''} sur 3. La flèche jaune va t’aider !`)]); return; }
    if (s === 'coquelicot') {
      await dialogue([L('gaston', 'Le Coquelicot ne sort que <b>le matin</b>, entre 6 heures et midi, dans le champ de coquelicots 🌺.'),
        L('gaston', 'Tu es pressée ? Demande à <b>Gustave</b>, mon coq ! Son cocorico fait venir le matin… pour un petit moment. Hé hé !')]);
      return;
    }
    if (etapeAtteinte('chapeau')) cadeauDuJour('gaston', 'trefleSucre');
    await dialogue([L('gaston', ['Les Prés sont toujours là pour toi ! Reviens quand tu veux.', 'Tu sais que les dindies 🌿 Prairie adorent le trèfle sucré ? Leur confiance monte deux fois plus vite !', 'Le jardin oublié, à l’ouest… Personne ne sait ce qui s’y cache. Une grande quête, peut-être, un jour…'][Math.floor(Math.random() * 3)])]);
    return;
  }
  if (id === 'leila') {
    if (s === 'leila') {
      await dialogue([L('leila', 'Salam, voyageuse ! Je suis Leïla des Dunes. Bienvenue au <b>Maroc imaginaire</b>, le pays des mille et une dindies !'),
        L('leila', 'Ici vivent le <b>Dindasable</b> dans les dunes, le <b>Dindromadaire</b> près de l’oasis… et le <b>Dindonus Mirageus</b>.'),
        L('leila', 'Le Mirageus ne se laisse voir qu’en plein soleil, par ceux qui portent un <b>chapeau de soleil</b>. Sinon… ce n’est qu’un mirage !'),
        L('moi', 'Ça tombe bien, Mimi m’a donné un chapeau !'),
        L('leila', 'Alors bonne chasse ! Et goûte notre <b>miel des dunes</b> : les dindies 🏜️ Sable en raffolent.')]);
      avancer();
      return;
    }
    if (s === 'maroc3') {
      const m = manquantes('maroc');
      await dialogue([L('leila', `Il te manque : ${m.map(x => '<b>' + PAR_ID[x].nom + '</b>').join(', ')}.`),
        L('leila', m.includes('mirageus') ? 'Le Mirageus aime le grand soleil ☀️ des dunes. S’il pleut ou s’il y a des nuages, il se cache !' : m.includes('dromadaire') ? 'Le Dindromadaire boit à l’oasis, le jour.' : 'Le Dindasable se roule dans les grandes dunes, à l’ouest.')]);
      return;
    }
    if (s === 'parlerLeila2') {
      await dialogue([L('leila', 'Incroyable ! Tu as trouvé le Mirageus ! Alors je vais te confier un secret…'),
        L('leila', 'La nuit, quand les <b>3 lanternes du souk</b> sont allumées, la <b>Dinde D’Inde Dingue</b> vient danser sous leur lumière !'),
        L('leila', 'Allume-les toutes les trois, et reviens la nuit.')]);
      avancer();
      return;
    }
    if (s === 'lanternes') { await dialogue([L('leila', `${ramasses('lanterne')} lanterne${ramasses('lanterne') > 1 ? 's' : ''} sur 3. Elles sont dans l’allée du souk !`)]); return; }
    if (s === 'dingue') {
      await dialogue([L('leila', 'La Dinde Dingue ne vient que <b>la nuit</b>, près des lanternes 🌙.'),
        L('leila', 'Tu ne veux pas attendre ? Tourne l’aiguille du <b>cadran magique</b>, au milieu du village : il fait tomber la nuit… pour un moment !')]);
      return;
    }
    if (etapeAtteinte('parapluie')) cadeauDuJour('leila', 'miel');
    await dialogue([L('leila', ['Le désert est grand, mais les dunes connaissent ton nom, exploratrice !', 'Les dindies 🏜️ Sable adorent le miel des dunes.', 'Le ksar abrite une fontaine magnifique. Va voir ses zelliges !'][Math.floor(Math.random() * 3)])]);
    return;
  }
  if (id === 'waffel') {
    if (s === 'waffel') {
      await dialogue([L('waffel', 'Bienvenue en <b>Belgique</b>, une fois ! Je suis Monsieur Waffel, roi des gaufres et ami des dindies.'),
        L('waffel', 'Ici, on trouve le <b>Dindon Gaufrette</b> sur la Grand-Place, le <b>Dindon Crachin</b> au bord des canaux…'),
        L('waffel', '…et le <b>Dindonus Belgicus</b>, au pied du beffroi. Il adore les <b>parapluies</b> : sans parapluie, il reste caché !'),
        L('moi', 'J’ai mon parapluie !'),
        L('waffel', 'Parfait ! Et si une dindie 💧 Pluie fait la difficile, offre-lui une <b>gaufre de Liège</b> : effet garanti !')]);
      avancer();
      return;
    }
    if (s === 'belgique3') {
      const m = manquantes('belgique');
      await dialogue([L('waffel', `Il te manque : ${m.map(x => '<b>' + PAR_ID[x].nom + '</b>').join(', ')}. Courage !`),
        L('waffel', m.includes('belgicus') ? 'Le Belgicus se promène près du beffroi 🔔 : ouvre ton parapluie !' : m.includes('crachin') ? 'Le Crachin flâne au bord des canaux, plic, ploc !' : 'Le Gaufrette ? Sur la Grand-Place, il sent l’odeur de mes gaufres !')]);
      return;
    }
    if (s === 'parlerWaffel2') {
      await dialogue([L('waffel', 'Sapristi ! Tu as trouvé le Belgicus ! Alors écoute bien…'),
        L('waffel', 'Hier, pendant l’orage, <b>3 boules d’argent</b> sont tombées de l’<b>Atomium</b> ! Elles ont roulé partout…'),
        L('waffel', 'Si tu les retrouves, le <b>Dindonus Atomium</b> reviendra : il ne se montre que <b>sous la pluie</b>, près de l’Atomium.')]);
      avancer();
      return;
    }
    if (s === 'boules') { await dialogue([L('waffel', `${ramasses('bouleArgent')} boule${ramasses('bouleArgent') > 1 ? 's' : ''} sur 3 ! Elles ont roulé loin, au-delà des canaux.`)]); return; }
    if (s === 'atomium') {
      await dialogue([L('waffel', 'L’Atomium… il lui faut de la <b>pluie</b> ☔ !'),
        L('waffel', 'Il fait beau ? Débouche ma <b>bouteille à nuages</b>, sur la Grand-Place : elle fait pleuvoir… pour un moment !')]);
      return;
    }
    if (etapeAtteinte('fin')) cadeauDuJour('waffel', 'gaufre');
    await dialogue([L('waffel', ['Une gaufre, ça fait toujours plaisir, une fois !', 'Le beffroi sonne les heures depuis des siècles…', 'Quand il pleut, les dindies 💧 Pluie sont de bonne humeur !'][Math.floor(Math.random() * 3)])]);
    return;
  }
  if (id === 'ginette') {
    await dialogue([L('ginette', 'Une, deux ! Une, deux ! Salut ! Je suis Coach Ginette. Le Dindodrome ouvre bientôt !'),
      L('ginette', 'Ici, les dindies font la course : vitesse ⚡, endurance 💪 et saut 🦘. Élève-les bien, et reviens me voir !')]);
    return;
  }
  if (id === 'gontran') {
    const n = Object.keys(E().livre.attrapes).length;
    await dialogue([L('gontran', n >= 8 ? `Quoi ?! ${n} espèces dans ton Grand Livre ?! Bon… moi j’en ai… beaucoup aussi. Gloup gloup !` : 'Tu verras, Roullieee : ma dindie sera la plus rapide du Royaume ! Gloup gloup !')]);
    return;
  }
}

/* ── les autres interactions qui comptent pour les quêtes ── */
export async function interagir(id) {
  const e = E(), s = e.quete.etape;
  if (id.startsWith('objet-')) {
    const o = id.slice(6);
    e.monde.ramasses[o] = true; monde.retirerObjet(o); pop();
    if (o.startsWith('planche')) { J.ajouterObjet('planche'); e.quete.compteur = ['planche1', 'planche2', 'planche3'].filter(p => e.monde.ramasses[p]).length; toast(`🪵 Une planche ! (${e.quete.compteur}/3)`); J.changer('quete'); if (e.quete.compteur >= 3) avancer(); }
    if (o === 'corde') { J.ajouterObjet('corde'); toast('🪢 La grosse corde du Capitaine !'); if (s === 'corde') avancer(); if (E().quete.etape === 'toile' && J.combien('toile')) avancer(); }
    if (o.startsWith('plumeRouge')) { J.ajouterObjet('plumeRouge'); const n = ramasses('plumeRouge'); toast(`🪶 Une plume rouge ! (${n}/3)`); J.changer('quete'); if (n >= 3 && s === 'plumesRouges') { await dialogue([L('moi', 'Les 3 plumes rouges ! Le Grand Dindon Coquelicot va se montrer… le matin, dans le champ de coquelicots !')]); avancer(); } }
    if (o.startsWith('bouleArgent')) { J.ajouterObjet('bouleArgent'); const n = ramasses('bouleArgent'); toast(`🔘 Une boule d’argent ! (${n}/3)`); J.changer('quete'); if (n >= 3 && s === 'boules') { await dialogue([L('moi', 'Les 3 boules de l’Atomium ! Maintenant, il faut de la pluie…')]); avancer(); } }
    return true;
  }
  if (id === 'enclos-' + typeStarter() && s === 'reparer1') {
    J.retirerObjet('planche', 3);
    e.enclos[typeStarter()] = { construit: true, niveau: 1 };
    await monde.construireEnclosAnime(typeStarter());
    toast(`🔨 ${habitat(typeStarter())} est construit !`);
    avancer();
    return true;
  }
  if (id === 'enclos-' + type2() && s === 'reparer2') {
    J.retirerObjet('kitPlanches');
    e.enclos[type2()] = { construit: true, niveau: 1 };
    await monde.construireEnclosAnime(type2());
    toast(`🔨 ${habitat(type2())} est construit !`);
    const g = glouglou();
    if (g && type2() === 'prairie') await dialogue([L('moi', `${habitat('prairie')} est prêt ! ${nomDe(g)} pourra y vivre : touche l’enclos pour l’installer.`)]);
    avancer();
    return true;
  }
  if (id === 'clapier' && s === 'reparerClapier') {
    J.retirerObjet('clous');
    e.batiments.clapier.repare = true;
    await monde.reparerClapierAnime();
    toast('🔨 Le Clapier à dindes est réparé !');
    avancer();
    return false;     /* on ouvre ensuite le Clapier */
  }
  if (id === 'couvoir' && s === 'reparerCouvoir') {
    if (!J.retirerObjet('kitConstruction')) { toast('Il faut un kit de construction ! Mimi en vend.'); return true; }
    e.batiments.couvoir.repare = true;
    await monde.reparerAnime('couvoir');
    toast('🔨 Le Couvoir est réparé !');
    avancer();
    J.ajouterObjet('oeufProfesseur');
    await dialogue([L('plumeau', '(le Professeur arrive en courant) Magnifique, ce Couvoir ! Tiens : voici un œuf de mon Labo. Mets-le dans une couveuse, il éclora en quelques secondes !')]);
    return false;     /* on ouvre ensuite le Couvoir */
  }
  if (id === 'nurserie' && s === 'reparerNurserie') {
    if (!J.retirerObjet('kitConstruction')) { toast('Il faut un kit de construction ! Mimi en vend.'); return true; }
    e.batiments.nurserie.repare = true;
    for (const d of e.dindies) if ((d.stade === 'poussin' || d.stade === 'jeune') && d.lieu !== 'nurserie') d.lieu = 'nurserie';
    J.changer('dindies');
    await monde.reparerAnime('nurserie');
    toast('🔨 La Nurserie est réparée ! Ton poussin s’y installe.');
    avancer();
    return false;     /* on ouvre ensuite la Nurserie */
  }
  if (id === 'deco-jardin') { toast('🌸 Un jardin oublié, envahi de fleurs… Une grande quête t’y attendra un jour !', { duree: 3600 }); return true; }
  if (id === 'deco-atomium') { toast('⚛️ L’Atomium : 9 boules d’argent, hautes comme un immeuble ! Il paraît qu’une dindie y vit…', { duree: 3600 }); return true; }
  return false;
}
/* ── les gadgets des régions : le coq, le cadran magique, la bouteille à nuages, les lanternes ── */
const DIX_MINUTES = 10 * 60 * 1000;
export async function gadget(id) {
  const e = E(), s = e.quete.etape;
  if (id === 'coq') {
    if (estMatin()) { toast('🐓 Gustave picore tranquillement. C’est déjà le matin !'); return false; }
    forcerHeure(8, DIX_MINUTES); toast('🐓 <b>COCORICOOOO !</b> Le soleil se lève sur les Prés… pour 10 minutes !', { duree: 3600, classe: 'grand' });
    return true;
  }
  if (id === 'cadran') {
    if (estNuit()) { toast('🌙 Il fait déjà nuit. Les étoiles brillent sur le désert…'); return false; }
    forcerHeure(22, DIX_MINUTES); toast('🌙 Tu tournes l’aiguille du cadran… <b>La nuit tombe sur le désert</b>, pour 10 minutes !', { duree: 3600, classe: 'grand' });
    return true;
  }
  if (id === 'nuage') {
    if (meteo('belgique') === 'pluie') { toast('☔ Il pleut déjà ! La bouteille reste bouchée.'); return false; }
    forcerMeteo('belgique', 'pluie', DIX_MINUTES); toast('☁️ Tu débouches la bouteille… <b>Plic, ploc : il pleut sur la Belgique</b>, pour 10 minutes !', { duree: 3600, classe: 'grand' });
    return true;
  }
  if (id.startsWith('lanterne')) {
    const k = id.slice(8);
    if (e.monde.ramasses[id]) { toast('🏮 Cette lanterne brille déjà.'); return false; }
    if (s !== 'lanternes') { toast('🏮 Une jolie lanterne… éteinte.'); return false; }
    e.monde.ramasses[id] = true; monde.allumerLanterne && monde.allumerLanterne(+k, true); pop();
    const n = ramasses('lanterne'); toast(`🏮 La lanterne s’allume ! (${n}/3)`); J.changer('quete');
    if (n >= 3) { await dialogue([L('moi', 'Les 3 lanternes brillent ! La Dinde D’Inde Dingue viendra danser… cette nuit !')]); avancer(); }
    return true;
  }
  return false;
}
/* ── les évènements : achats, dindie installée, nourrie, Musée ouvert, arrivée dans une île, capture… ── */
export function evenement(type, valeur) {
  const e = E(), s = e.quete.etape;
  if (type === 'achat') {
    if ((s === 'clous' && valeur === 'clous') || (s === 'kit' && valeur === 'kitPlanches') || (s === 'friandises' && valeur === 'friandise') || (s === 'chapeau' && valeur === 'chapeauSoleil') || (s === 'parapluie' && valeur === 'parapluie')) avancer();
    else if (valeur === 'toile' && (s === 'toile' || s === 'corde')) { if (J.combien('corde')) { if (s === 'corde') avancer(); avancer(); } }
  }
  if (type === 'deplacement') {
    const st = starter(), g = glouglou();
    if (s === 'installer1' && st && st.lieu === 'enclos:' + typeStarter()) avancer();
    if (s === 'ranger' && g && g.lieu === 'clapier') avancer();
  }
  if (type === 'nourrir' && s === 'nourrir') {
    if (!e.quete.nourries.includes(valeur)) e.quete.nourries.push(valeur);
    J.changer('quete');
    if (e.quete.nourries.length >= Math.min(2, e.dindies.length)) avancer();
  }
  if (type === 'musee' && s === 'musee') avancer();
  if (type === 'achat' && valeur === 'kitConstruction' && (s === 'kitCouvoir' || s === 'kitNurserie')) avancer();
  if (type === 'oeufPose' && s === 'oeufTuto' && valeur.origine === 'tutoriel') avancer();
  if (type === 'eclosion') {
    if (s === 'eclosion' && valeur.oeuf.origine === 'tutoriel') { avancer(); setTimeout(() => dialogue([L('moi', 'Un poussin ! Il lui faudrait un endroit douillet pour grandir… La Nurserie, à côté du Couvoir, est en ruine. Encore un kit !')]), 1200); }
    if (s === 'oeufCroise' && valeur.oeuf.origine === 'croisement' && ['croisement', 'recette'].includes(PAR_ID[valeur.oeuf.espece].origine.sorte)) avancer();
  }
  if (type === 'grandir' && s === 'grandir' && valeur.stade !== 'poussin') avancer();
  if (type === 'croisement' && s === 'nid' && ['croisement', 'recette'].includes(PAR_ID[valeur.espece].origine.sorte)) avancer();
  if (type === 'eveil' && s === 'eveil') avancer();
  if (type === 'arrivee') {
    if ((s === 'decollage' && valeur === 'pres') || (s === 'volMaroc' && valeur === 'maroc') || (s === 'volBelgique' && valeur === 'belgique')) avancer();
    preparerEtape();
  }
  if (type === 'capture') {
    if (s === 'capture1') avancer();
    const s2 = E().quete.etape;
    if (s2 === 'pres3' && !manquantes('pres').length) avancer();
    if (s2 === 'maroc3' && !manquantes('maroc').length) avancer();
    if (s2 === 'belgique3' && !manquantes('belgique').length) avancer();
    if ((s2 === 'coquelicot' && valeur === 'coquelicot') || (s2 === 'dingue' && valeur === 'dingue') || (s2 === 'atomium' && valeur === 'atomium')) avancer();
    J.changer('quete');
  }
}
export const etapeActuelle = () => E().quete.etape;
