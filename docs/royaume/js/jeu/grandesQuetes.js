/* ══════════ LES GRANDES QUÊTES DES MYTHIQUES (chapitre 7) ══════════
   Dans chaque île, le guide raconte une vieille légende. Il faut retrouver 3 fragments cachés dans l'île,
   puis le guide confie l'objet légendaire. Au nid du Couvoir, avec les deux bons parents (deux épiques),
   l'objet et parfois une condition (le matin, la nuit, la pluie sur la Belgique), un œuf mythique apparaît.
   Le Dindromakus (la Forêt de la Lune, « La légende ») arrive avec le chapitre 8. */
import * as J from './etat.js';
import { OBJETS } from './objets.js';
import { PAR_ID, ESPECES } from '../donnees/especes.js';
import { REGIONS } from '../donnees/regions.js';
import { PERSONNAGES, portraitChibi } from '../personnages/chibi.js';
import { dialogue, toast } from '../moteur/ui.js';
import { tada } from '../moteur/sons.js';
import { estMatin, estNuit } from '../moteur/temps.js';
import { meteo } from '../moteur/meteo.js';

export const GRANDES = {
  jardin: { region: 'pres', guide: 'gaston', titre: 'Le jardin oublié', fragment: 'graineAncienne', pluriel: 'graines anciennes', objet: 'graineOr', mythique: 'florissima', epique: 'coquelicot',
    histoire: ['Tu vois le vieux <b>jardin oublié</b>, à l’ouest ? Mon grand-père disait qu’une reine des prés y vivait autrefois : <b>Dindoréa Florissima</b>. Là où elle marchait, les fleurs poussaient.',
      'Pour qu’elle revienne, il faudrait planter la <b>Graine d’or</b>. Mais elle ne pousse qu’avec <b>3 graines anciennes</b>, perdues dans les Prés…'],
    fin: 'Les 3 graines anciennes ! Regarde : dans ma main, elles deviennent… une <b>Graine d’or</b> ! Au nid du Couvoir, <b>le matin</b>, avec un <b>Grand Dindon Coquelicot</b> et une <b>Dindamanite</b>, la légende pourra renaître.' },
  dunes: { region: 'maroc', guide: 'leila', titre: 'Les mille et une dunes', fragment: 'fragmentCarte', pluriel: 'morceaux de carte', objet: 'lampe', mythique: 'dindabad', epique: 'dingue',
    histoire: ['On raconte qu’un sultan dindie, <b>Sultan Dindabad</b>, volait sur un tapis au-dessus des mille et une dunes.', 'Sa <b>lampe merveilleuse</b> est cachée quelque part… La carte du trésor a été déchirée en <b>3 morceaux</b>, emportés par le vent du désert.'],
    fin: 'La carte est complète ! Elle mène… sous ce palmier ! Voici la <b>Lampe merveilleuse</b>. Au nid du Couvoir, avec une <b>Dinde D’Inde Dingue</b> et un <b>Dindotapis Volant</b>, un sultan pourrait naître !' },
  canaux: { region: 'belgique', guide: 'waffel', titre: 'Le trésor des canaux', fragment: 'cleCanal', pluriel: 'clés rouillées', objet: 'couronne', mythique: 'belgarum', epique: 'atomium',
    histoire: ['Une fois, il y avait un roi des dindies belges : <b>Dindonus Rex Belgarum</b>. Sa <b>couronne</b> est enfermée dans un coffre au fond des canaux.', 'Le coffre a <b>3 serrures</b>, et les <b>3 clés rouillées</b> sont tombées dans la ville. Tu m’aides à les retrouver, sapristi ?'],
    fin: 'Les 3 clés ! Clic, clac, cloc… La <b>Couronne des canaux</b> ! Au nid du Couvoir, <b>quand il pleut sur la Belgique</b>, avec un <b>Dindonus Atomium</b> et un <b>Dindonus Frites-Fluo</b>, le roi reviendra, une fois !' },
  temple: { region: 'jungle', guide: 'tarzanette', titre: 'Le temple perdu', fragment: 'masqueJade', pluriel: 'masques de jade', objet: 'plumeQuetzal', mythique: 'quetzaldinde', epique: 'jaguar',
    histoire: ['Ohééé ! Tu sais qui gardait le temple perdu ? <b>Quetzaldinde</b>, le serpent à plumes ! Ses plumes ont toutes les couleurs de la Jungle et du ciel.', 'La porte du temple ne s’ouvre qu’avec <b>3 masques de jade</b>, cachés dans la Jungle par les singes farceurs.'],
    fin: 'Les 3 masques ! La porte s’ouvre… et voilà une <b>Plume de quetzal</b> ! Au nid du Couvoir, avec un <b>Dindojaguar</b> et un <b>Dindodragon</b>, Quetzaldinde pourra renaître !' },
  polaire: { region: 'banquise', guide: 'inuk', titre: 'La nuit polaire', fragment: 'eclatGlace', pluriel: 'éclats de glace bleue', objet: 'eclatAurore', mythique: 'borealis', epique: 'cristal',
    histoire: ['Pendant la grande nuit polaire, les anciens voyaient passer <b>Borealis Glacius Maximus</b>, une dindie faite d’aurore boréale.', 'Elle a laissé tomber <b>3 éclats de glace bleue</b> sur la Banquise. Réunis, ils forment un <b>éclat d’aurore</b>.'],
    fin: 'Les 3 éclats ! Ils brillent comme le ciel du nord… Voici l’<b>Éclat d’aurore</b>. Au nid du Couvoir, <b>la nuit</b>, avec un <b>Dindocristal</b> et un <b>Dindoyéti</b>, l’aurore reviendra.' },
  volcan: { region: 'volcan', guide: 'lava', titre: 'Le cœur du volcan', fragment: 'goutteFeu', pluriel: 'gouttes de feu', objet: 'braiseEternelle', mythique: 'phenix', epique: 'magma',
    histoire: ['Au cœur du volcan dort le <b>Dindophénix</b>. Il renaît de ses cendres… mais seulement avec la <b>Braise éternelle</b>.', 'Je peux la forger dans ma forge, avec <b>3 gouttes de feu</b> tombées du cratère. Rapporte-les-moi !'],
    fin: 'Les 3 gouttes de feu ! Hop, dans la forge… Voilà la <b>Braise éternelle</b> ! Au nid du Couvoir, <b>au lever du soleil</b> (le matin), avec un <b>Dindomagma</b> et un <b>Dindocomète</b>, le Phénix renaîtra !' },
  palais: { region: 'nuages', guide: 'azur', titre: 'Le palais des nuages', fragment: 'noteMusique', pluriel: 'notes de musique', objet: 'harpe', mythique: 'celestia', epique: 'orage',
    histoire: ['Dans le palais des nuages, une harpe jouait autrefois toute seule. Sa musique faisait danser <b>Célestia Dindissima</b>, la plus douce des dindies du ciel.', 'Un jour d’orage, <b>3 notes de musique</b> se sont envolées. Retrouve-les, et la harpe chantera de nouveau !'],
    fin: 'Les 3 notes ! Écoute… la <b>Harpe des nuages</b> chante ! Au nid du Couvoir, avec un <b>Dindorage</b> et une <b>Dindogalaxie</b>, Célestia reviendra danser.' }
};
export const ORDRE_GRANDES = Object.keys(GRANDES);
const E = () => J.etat();
const etat = () => { const q = E().quete; q.grandes = q.grandes || {}; return q.grandes; };
export const etatGrande = id => etat()[id] || null;   /* null, 'fragments', 'rapporter', 'fini' */
let etapeAtteinte = () => false;
export const brancherHistoire = f => { etapeAtteinte = f; };
/* une grande quête s'ouvre au chapitre 7, quand on a attrapé l'épique de l'île */
export const grandeOuverte = id => etapeAtteinte('parlerPlumeau9') && !!E().livre.attrapes[GRANDES[id].epique];
export const grandesOuvertes = () => ORDRE_GRANDES.filter(grandeOuverte);
export const fragmentsTrouves = id => [1, 2, 3].filter(i => E().monde.ramasses[GRANDES[id].fragment + i]).length;
export const nbFinies = () => ORDRE_GRANDES.filter(id => etatGrande(id) === 'fini').length;

/* ── la condition d'un croisement mythique ── */
const CONDITIONS = { florissima: () => estMatin(), belgarum: () => meteo('belgique') === 'pluie', borealis: () => estNuit(), phenix: () => estMatin() };
export const TEXTES_CONDITION = { florissima: 'le matin', belgarum: 'quand il pleut sur la Belgique', borealis: 'la nuit', phenix: 'au lever du soleil (le matin)' };
const memePaire = (a, b) => (a[0] === b[0] && a[1] === b[1]) || (a[0] === b[1] && a[1] === b[0]);
/* deux parents → la légende possible (ou null) : { M (l'espèce), G (la grande quête), aObjet, condition, ok } */
export function mythiquePour(p1, p2) {
  const M = ESPECES.find(e => e.origine.sorte === 'mythique' && memePaire(e.origine.especes, [p1.espece, p2.espece]));
  if (!M) return null;
  const G = Object.values(GRANDES).find(g => g.mythique === M.id);
  if (!G) return null;   /* le Dindromakus : au chapitre 8 */
  const aObjet = J.combien(G.objet) > 0, cond = !CONDITIONS[M.id] || CONDITIONS[M.id]();
  return { M, G, aObjet, condition: TEXTES_CONDITION[M.id] || null, conditionOk: cond, ok: aObjet && cond };
}

/* ── ce que dit le guide de l'île ── */
const L = (id, t) => ({ qui: { nom: PERSONNAGES[id].nom, portrait: portraitChibi(PERSONNAGES[id], 'dlg' + id), couleur: PERSONNAGES[id].couleur }, texte: t });
export async function parler(guide, ici, monde) {
  const id = ORDRE_GRANDES.find(g => GRANDES[g].guide === guide && GRANDES[g].region === ici);
  if (!id || !grandeOuverte(id)) return false;
  const G = GRANDES[id], s = etatGrande(id);
  if (!s) {
    await dialogue([...G.histoire.map(t => L(guide, t)), L(guide, `🌈 C’est une <b>grande quête</b> : « ${G.titre} ». Les ${G.pluriel} brillent un peu : ouvre l’œil !`)]);
    etat()[id] = 'fragments'; J.changer('quete');
    monde && monde.poserObjet && preparer(ici, monde);
    toast(`🌈 Grande quête : <b>${G.titre}</b>`, { duree: 3400, classe: 'grand' });
    return true;
  }
  if (s === 'fragments') { const n = fragmentsTrouves(id); await dialogue([L(guide, `${n > 1 ? n + ' ' + G.pluriel : n + ' ' + OBJETS[G.fragment].nom.toLowerCase()} sur 3… Les autres sont quelque part dans l’île !`)]); return true; }
  if (s === 'rapporter') {
    await dialogue([L(guide, G.fin)]);
    for (let k = 0; k < 3; k++) J.retirerObjet(G.fragment);
    J.ajouterObjet(G.objet); etat()[id] = 'fini'; tada();
    toast(`${OBJETS[G.objet].e} <b>${OBJETS[G.objet].nom}</b> ! (grande quête « ${G.titre} » finie)`, { duree: 4200, classe: 'grand' });
    J.changer('quete');
    return true;
  }
  return false;
}
/* un fragment ramassé (objet-graineAncienne2…) : renvoie true si c'en était un */
export function ramasser(oid) {
  const id = ORDRE_GRANDES.find(g => oid.startsWith(GRANDES[g].fragment)); if (!id) return false;
  const G = GRANDES[id];
  J.ajouterObjet(G.fragment);
  const n = fragmentsTrouves(id);
  toast(`${OBJETS[G.fragment].e} ${OBJETS[G.fragment].nom} ! (${n}/3)`, { cle: 'fragment' });
  if (n >= 3 && etatGrande(id) === 'fragments') { etat()[id] = 'rapporter'; toast(`🌈 Les 3 ${G.pluriel} ! Rapporte-les à ${PERSONNAGES[G.guide].nom}.`, { duree: 3600, classe: 'grand' }); }
  J.changer('quete');
  return true;
}
/* poser les fragments pas encore trouvés dans l'île où l'on est */
export function preparer(ici, monde) {
  for (const id of ORDRE_GRANDES) {
    const G = GRANDES[id];
    if (G.region !== ici || etatGrande(id) !== 'fragments') continue;
    for (const i of [1, 2, 3]) if (!E().monde.ramasses[G.fragment + i]) monde.poserObjet(G.fragment + i, G.fragment);
  }
}
/* pour la flèche : où aller pour avancer dans une grande quête (la plus avancée d'abord) */
export function cible(ici) {
  const ouvertes = grandesOuvertes().filter(id => etatGrande(id) !== 'fini');
  if (!ouvertes.length) return null;
  const ordre = [...ouvertes].sort((a, b) => ['rapporter', 'fragments', null].indexOf(etatGrande(a)) - ['rapporter', 'fragments', null].indexOf(etatGrande(b)));
  const ici1 = ordre.filter(id => GRANDES[id].region === ici);
  if (!ici1.length) return ici === 'domaine' ? 'pnj-zephyr' : ici === 'dindodrome' ? 'sortie' : 'ballon';
  const out = [];
  for (const id of ici1) {
    const G = GRANDES[id], s = etatGrande(id);
    if (s === 'fragments') for (const i of [1, 2, 3]) { if (!E().monde.ramasses[G.fragment + i]) out.push('objet-' + G.fragment + i); }
    else out.push('pnj-' + G.guide);
  }
  return out;
}
export const texteGrandes = () => {
  const o = grandesOuvertes(), en = o.filter(id => etatGrande(id) && etatGrande(id) !== 'fini');
  if (en.length) { const G = GRANDES[en[0]]; return etatGrande(en[0]) === 'rapporter' ? `Rapporte les ${G.pluriel} à ${PERSONNAGES[G.guide].nom} (${REGIONS[G.region].nom})` : `« ${G.titre} » : trouve les 3 ${G.pluriel} (${fragmentsTrouves(en[0])}/3), ${REGIONS[G.region].nom}`; }
  return o.length ? `Parle au guide d’une île dont tu as attrapé l’épique : ${o.map(id => REGIONS[GRANDES[id].region].e).join(' ')}` : 'Attrape l’épique d’une île : son guide te racontera sa légende';
};
void PAR_ID;
