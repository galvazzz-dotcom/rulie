/* ══════════ LES QUÊTES DU DOMAINE (après le chapitre 4) ══════════
   Une petite suite de 7 quêtes des habitants, à côté de l'histoire, qui fait découvrir la production :
   le Potager, le Moulin, l'Atelier des plumes, la décoration, le Bureau des missions, les améliorations,
   le Gâteau d'amour. Chaque étape est « faite » quand l'état du jeu le montre (on peut donc s'avancer :
   l'étape passe toute seule). Le bandeau et la flèche la montrent quand l'histoire n'a rien d'autre à faire. */
import * as J from './etat.js';
import * as PR from './production.js';
import { OBJETS } from './objets.js';
import { TYPES, ORDRE_TYPES } from '../donnees/types.js';
import { PERSONNAGES, portraitChibi } from '../personnages/chibi.js';
import { dialogue, toast } from '../moteur/ui.js';
import { tada } from '../moteur/sons.js';

export const QUETES_DOMAINE = [
  { id: 'h1', titre: 'Le Potager', etapes: ['parlerMimi', 'reparerPotager', 'planter', 'recolter'], recompense: { pieces: 150, objets: { grainesBle: 5, grainesHaricot: 5 } } },
  { id: 'h2', titre: 'Le Moulin à friandises', etapes: ['reparerMoulin', 'fabriquer'], recompense: { pieces: 150, objets: { grainesBaie: 3 } } },
  { id: 'h3', titre: 'L’Atelier des plumes', etapes: ['parlerPlumeau', 'plumes', 'reparerAtelier', 'chapeau', 'coiffer'], recompense: { pieces: 200, plumes: 4 } },
  { id: 'h4', titre: 'Un Domaine tout beau', etapes: ['deco', 'poser'], recompense: { pieces: 200, plumesOr: 1 } },
  { id: 'h5', titre: 'Le Bureau des missions', etapes: ['parlerZephyr', 'reparerMissions', 'envoyer', 'rapporter'], recompense: { pieces: 250, objets: { oeufMystere: 1 } } },
  { id: 'h6', titre: 'Toujours plus grand', etapes: ['ameliorer'], recompense: { pieces: 300, plumesOr: 1 } },
  { id: 'h7', titre: 'Le Gâteau d’amour', etapes: ['gateau', 'gateauNid'], recompense: { pieces: 400, plumesOr: 2 } }
];
const ORDRE_H = [...QUETES_DOMAINE.flatMap(q => q.etapes), 'fin'];
const E = () => J.etat();
export function qd() { const q = E().quete; q.domaine = q.domaine || { etape: null, finies: [] }; q.domaine.vus = q.domaine.vus || {}; return q.domaine; }
export const queteDomaineDe = s => QUETES_DOMAINE.find(q => q.etapes.includes(s));
export const active = () => !!qd().etape && qd().etape !== 'fin';
export const queteActuelle = () => queteDomaineDe(qd().etape);
const stat = k => PR.prod().stats[k] || 0;
const enclosConstruits = () => ORDRE_TYPES.filter(t => E().enclos[t]?.construit);

/* ── quand une étape est-elle faite ? ── */
const FAIT = {
  parlerMimi: () => qd().vus.mimi, reparerPotager: () => !!E().batiments.potager?.repare, planter: () => stat('plantees') > 0, recolter: () => stat('recoltes') > 0,
  reparerMoulin: () => !!E().batiments.moulin?.repare, fabriquer: () => stat('friandises') > 0,
  parlerPlumeau: () => qd().vus.plumeau, plumes: () => stat('plumes') > 0, reparerAtelier: () => !!E().batiments.atelier?.repare, chapeau: () => stat('chapeaux') > 0, coiffer: () => E().dindies.some(d => d.chapeau),
  deco: () => stat('decos') > 0, poser: () => stat('posees') > 0,
  parlerZephyr: () => qd().vus.zephyr, reparerMissions: () => !!E().batiments.missions?.repare, envoyer: () => stat('envoyees') > 0, rapporter: () => stat('rapportees') > 0,
  ameliorer: () => stat('ameliorations') > 0, gateau: () => J.combien('gateauAmour') > 0 || stat('gateaux') > 0, gateauNid: () => stat('gateaux') > 0
};

/* ── le bandeau et la flèche ── */
export function texte(ici = 'domaine') {
  const s = qd().etape, P = PR.prod();
  const t = ({
    parlerMimi: 'Mimi a une idée pour le vieux Potager ! Va lui parler 🛒',
    reparerPotager: 'Répare le Potager, au nord-ouest du Domaine (300 🪙) 🥕',
    planter: 'Plante une graine au Potager 🌱',
    recolter: `Récolte ta première plante au Potager : un peu de patience… 🌽${P.parcelles.some(PR.mure) ? ' (elle est prête !)' : ''}`,
    reparerMoulin: 'Répare le Moulin à friandises, au nord-est du Domaine (400 🪙) 🌬️',
    fabriquer: 'Fabrique une friandise au Moulin (2 épis de maïs = une galette) 🫓',
    parlerPlumeau: 'Le Professeur Plumeau veut te parler des plumes 🔬',
    plumes: enclosConstruits().some(t => PR.plumesAPrendre(t)) ? 'Ramasse les plumes dans un enclos : touche l’enclos 🪶' : 'Installe une dindie adulte dans un enclos : elle y lâchera des plumes 🪶',
    reparerAtelier: 'Répare l’Atelier des plumes, à l’est du Labo (500 🪙) 🪶',
    chapeau: 'Fabrique un chapeau à l’Atelier des plumes 🎩',
    coiffer: 'Mets ce chapeau à une dindie : touche-la, puis 🎩 🥳',
    deco: 'Fabrique une décoration à l’Atelier des plumes 🌷',
    poser: 'Pose ta décoration dans le Domaine : touche le bouton 🎨, en bas 🎨',
    parlerZephyr: 'Le Capitaine Zéphyr a besoin de toi, au port ⛵',
    reparerMissions: 'Répare le Bureau des missions, près du port (400 🪙) 📮',
    envoyer: 'Envoie des dindies en mission, au Bureau des missions 📮',
    rapporter: 'Quand elles rentrent, accueille tes dindies au Bureau des missions 📮',
    ameliorer: 'Améliore un bâtiment : un enclos, le Clapier, le Couvoir, la Nurserie, le Potager ou le Bureau ⬆️',
    gateau: 'Fabrique un Gâteau d’amour au Moulin (2 baies, 1 blé, 1 maïs) 🎂',
    gateauNid: 'Au Couvoir, croise deux dindies avec le Gâteau d’amour 💕'
  })[s] || '';
  if (ici === 'dindodrome') return t + ' <i>(au Domaine : par le portail 🏡)</i>';
  if (ici !== 'domaine') return t + ' <i>(au Domaine : en montgolfière 🎈)</i>';
  return t;
}
export function cible(ici = 'domaine') {
  const s = qd().etape;
  if (ici === 'dindodrome') return 'sortie';
  if (ici !== 'domaine') return 'pnj-zephyr';
  if (s === 'plumes') { const L = enclosConstruits().filter(t => PR.plumesAPrendre(t)); return (L.length ? L : enclosConstruits()).map(t => 'enclos-' + t); }
  return ({ parlerMimi: 'pnj-mimi', reparerPotager: 'potager', planter: 'potager', recolter: 'potager', reparerMoulin: 'moulin', fabriquer: 'moulin', gateau: 'moulin',
    parlerPlumeau: 'pnj-plumeau', reparerAtelier: 'atelier', chapeau: 'atelier', deco: 'atelier', parlerZephyr: 'pnj-zephyr', reparerMissions: 'missions', envoyer: 'missions', rapporter: 'missions', gateauNid: 'couvoir' })[s] || null;
}

/* ── avancer ── */
function recompenser(Q) {
  const r = Q.recompense, D = qd();
  D.finies.push(Q.id);
  if (r.pieces) J.gagnerPieces(r.pieces);
  if (r.plumesOr) { E().plumesOr += r.plumesOr; J.changer('pieces'); }
  for (const [o, k] of Object.entries(r.objets || {})) J.ajouterObjet(o, k);
  const types = r.plumes ? (enclosConstruits().length ? enclosConstruits() : ['prairie']).slice(0, 2) : [];
  for (const t of types) PR.gagnerPlumes(t, r.plumes);
  tada();
  toast(`✅ Quête du Domaine : <b>${Q.titre}</b><br>+ ${r.pieces} 🪙${r.plumesOr ? ` + ${r.plumesOr} 🪶 d’or` : ''}${Object.entries(r.objets || {}).map(([o, k]) => ` + ${OBJETS[o].e}${k > 1 ? ' × ' + k : ''}`).join('')}${types.map(t => ` + ${r.plumes} 🪶${TYPES[t].e}`).join('')}`, { duree: 4000, classe: 'grand' });
}
let enCours = false;
export function verifier() {
  if (enCours) return false;
  const D = qd(); let bouge = false;
  enCours = true;
  try {
    if (!D.etape && !D.finies.length && PR.productionOuverte()) { D.etape = ORDRE_H[0]; bouge = true; setTimeout(() => toast(`📜 Nouvelle quête du Domaine : <b>${QUETES_DOMAINE[0].titre}</b>`, { duree: 3400 }), 1600); }
    while (active() && FAIT[D.etape]()) {
      const Q = queteDomaineDe(D.etape), i = ORDRE_H.indexOf(D.etape);
      if (Q.etapes[Q.etapes.length - 1] === D.etape) recompenser(Q);
      D.etape = ORDRE_H[i + 1]; bouge = true;
      const N = queteDomaineDe(D.etape);
      if (N && N !== Q) setTimeout(() => toast(`📜 Nouvelle quête du Domaine : <b>${N.titre}</b>`, { duree: 3200 }), 2600);
    }
  } finally { enCours = false; }
  if (bouge) J.changer('quete');
  return bouge;
}

/* ── parler aux habitants (renvoie true si la quête du Domaine avait quelque chose à dire) ── */
const L = (id, t, choix) => id === 'moi' ? { qui: { nom: 'Roullieee', portrait: portraitChibi(PERSONNAGES.roullieee, 'dlgmoi'), couleur: PERSONNAGES.roullieee.couleur }, texte: t, choix }
  : { qui: { nom: PERSONNAGES[id].nom, portrait: portraitChibi(PERSONNAGES[id], 'dlg' + id), couleur: PERSONNAGES[id].couleur }, texte: t, choix };
export async function parler(id) {
  const s = qd().etape;
  if (id === 'mimi' && s === 'parlerMimi') {
    await dialogue([L('mimi', 'Roullieee ! Tu as vu le vieux <b>Potager</b>, au nord-ouest ? Autrefois, on y cultivait du maïs, du blé, des haricots sauteurs… et même des <b>baies arc-en-ciel</b> !'),
      L('mimi', 'Si tu le répares, je te vendrai des graines. Et avec tes récoltes, le <b>Moulin à friandises</b> fera des merveilles pour tes dindies !'),
      L('mimi', 'Tiens : 5 graines de maïs, pour commencer. Le maïs pousse en 5 minutes à peine !')]);
    J.ajouterObjet('grainesMais', 5); qd().vus.mimi = true; verifier();
    return true;
  }
  if (id === 'plumeau' && s === 'parlerPlumeau') {
    await dialogue([L('plumeau', 'Roullieee ! As-tu remarqué ? Les dindies qui vivent dans un <b>enclos</b> perdent des plumes… de la couleur de leur type !'),
      L('plumeau', 'Ramasse-les <b>une fois par jour</b> : touche l’enclos. Plus une dindie est rare ou heureuse, plus elle en laisse.'),
      L('plumeau', 'Avec ces plumes, l’<b>Atelier des plumes</b> fabrique des chapeaux et des décorations ! Il est en ruine, à l’est du Labo…')]);
    qd().vus.plumeau = true; verifier();
    return true;
  }
  if (id === 'zephyr' && s === 'parlerZephyr') {
    await dialogue([L('zephyr', 'Ahoy, exploratrice ! Mes amis des îles ont souvent besoin d’aide : livrer des œufs, ramasser des coquillages, chercher des trésors…'),
      L('zephyr', 'Le vieux <b>Bureau des missions</b>, à côté du port, pourrait leur envoyer tes dindies ! Elles reviendraient avec des pièces, des plumes… et des surprises.'),
      L('moi', 'Je vais le réparer, Capitaine !')]);
    qd().vus.zephyr = true; verifier();
    return true;
  }
  return false;
}

/* ── pour le journal ── */
export const etatQuete = Q => qd().finies.includes(Q.id) ? 'finie' : queteActuelle() === Q ? 'active' : 'verrou';
