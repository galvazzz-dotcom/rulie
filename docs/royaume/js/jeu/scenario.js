/* ══════════ L'HISTOIRE : LES CHAPITRES 1 À 8 ══════════
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
import { forcerHeure, estMatin, estNuit, pleineLune, forcerPleineLune, joursAvantPleineLune } from '../moteur/temps.js';
import { forcerMeteo, meteo } from '../moteur/meteo.js';
import { jour } from './trouvailles.js';
import { CACHETTES } from '../monde/domaine.js';
import * as DD from './dindodrome.js';
import { CHAMPIONNATS, LIGUE } from '../donnees/courses.js';
import * as QD from './quetesDomaine.js';
import * as GQ from './grandesQuetes.js';
import { compter } from './defis.js';

export const STARTERS = ['paquerette', 'crachin', 'braise'];
export const CHAPITRES = { 1: 'Le Domaine en ruine', 2: 'L’expédition', 3: 'Le premier œuf', 4: 'Le Dindodrome ouvre', 5: 'Jungle et Banquise', 6: 'Volcan et Forêt de la Lune', 7: 'Le Royaume des Nuages', 8: 'La Légende' };
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
  { id: 'q22', chapitre: 3, titre: 'L’éveil', etapes: ['parlerPlumeau4', 'eveil'], recompense: { pieces: 300, plumesOr: 2 } },
  { id: 'q23', chapitre: 4, titre: 'Le Dindodrome ouvre', etapes: ['parlerPlumeau5', 'parlerGinette', 'entrerDindodrome', 'courseEssai'], recompense: { pieces: 200, objets: { biscuit: 2 } } },
  { id: 'q24', chapitre: 4, titre: 'Le terrain d’entraînement', etapes: ['kitEntrainement', 'reparerEntrainement', 'entrainement3'], recompense: { pieces: 200, objets: { graineMais: 3 } } },
  { id: 'q25', chapitre: 4, titre: 'La Coupe des Prés', etapes: ['coupe1'], recompense: { pieces: 150 } },
  { id: 'q26', chapitre: 4, titre: 'Le défi de Gontran', etapes: ['gontran1'], recompense: { pieces: 300, objets: { biscuit: 2 } } },
  { id: 'q27', chapitre: 4, titre: 'Une nouvelle compétence', etapes: ['lecon'], recompense: { pieces: 150 } },
  { id: 'q28', chapitre: 4, titre: 'La Coupe des Dunes', etapes: ['coupe2'], recompense: { pieces: 200 } },
  { id: 'q29', chapitre: 4, titre: 'La Coupe de la Pluie', etapes: ['coupe3'], recompense: { pieces: 250 } },
  { id: 'q30', chapitre: 4, titre: 'La Coupe des Lianes', etapes: ['coupe4', 'gontran2'], recompense: { pieces: 500, plumesOr: 2 } },
  { id: 'q31', chapitre: 5, titre: 'Une lettre de Tarzanette', etapes: ['parlerPlumeau6', 'jumelles', 'volJungle', 'tarzanette'], recompense: { pieces: 200, objets: { banane: 3 } } },
  { id: 'q32', chapitre: 5, titre: 'La page de la Jungle', etapes: ['jungle3'], recompense: { pieces: 300 } },
  { id: 'q33', chapitre: 5, titre: 'Les statuettes d’or', etapes: ['parlerTarzanette2', 'statuettes', 'jaguar'], recompense: { pieces: 450, plumesOr: 2 } },
  { id: 'q34', chapitre: 5, titre: 'Une Serre au Domaine', etapes: ['serre'], recompense: { pieces: 250, objets: { banane: 5 } } },
  { id: 'q35', chapitre: 5, titre: 'Cap sur la Banquise', etapes: ['moufles', 'volBanquise', 'inuk'], recompense: { pieces: 200, objets: { sorbet: 3 } } },
  { id: 'q36', chapitre: 5, titre: 'La page de la Banquise', etapes: ['banquise3'], recompense: { pieces: 350 } },
  { id: 'q37', chapitre: 5, titre: 'Les étoiles de glace', etapes: ['parlerInuk2', 'etoilesGlace', 'cristal'], recompense: { pieces: 500, plumesOr: 2 } },
  { id: 'q38', chapitre: 5, titre: 'La Coupe de Glace', etapes: ['coupe5'], recompense: { pieces: 600, plumesOr: 2 } },
  { id: 'q39', chapitre: 6, titre: 'Cap sur le Volcan', etapes: ['parlerPlumeau7', 'bottesLave', 'volVolcan', 'lava'], recompense: { pieces: 250, objets: { piment: 3 } } },
  { id: 'q40', chapitre: 6, titre: 'La page du Volcan', etapes: ['volcan3'], recompense: { pieces: 400 } },
  { id: 'q41', chapitre: 6, titre: 'Les pierres de lave', etapes: ['parlerLava2', 'pierresLave', 'magma'], recompense: { pieces: 550, plumesOr: 2 } },
  { id: 'q42', chapitre: 6, titre: 'La Coupe de Lave', etapes: ['coupe6'], recompense: { pieces: 650, plumesOr: 2 } },
  { id: 'q43', chapitre: 6, titre: 'Cap sur la Forêt de la Lune', etapes: ['lanterne', 'volForet', 'hibou'], recompense: { pieces: 250, objets: { myrtille: 3 } } },
  { id: 'q44', chapitre: 6, titre: 'La page de la Forêt', etapes: ['foret3'], recompense: { pieces: 400 } },
  { id: 'q45', chapitre: 6, titre: 'Les éclats de lune', etapes: ['parlerHibou2', 'eclatsLune', 'etoile'], recompense: { pieces: 600, plumesOr: 2 } },
  { id: 'q46', chapitre: 6, titre: 'La Coupe de la Nuit', etapes: ['coupe7'], recompense: { pieces: 700, plumesOr: 2 } },
  { id: 'q47', chapitre: 7, titre: 'Cap sur les Nuages', etapes: ['parlerPlumeau8', 'ailes', 'volNuages', 'azur'], recompense: { pieces: 300, objets: { barbeAPapa: 3 } } },
  { id: 'q48', chapitre: 7, titre: 'La page des Nuages', etapes: ['nuages3'], recompense: { pieces: 450 } },
  { id: 'q49', chapitre: 7, titre: 'Les plumes d’éclair', etapes: ['parlerAzur2', 'plumesEclair', 'orage'], recompense: { pieces: 650, plumesOr: 3 } },
  { id: 'q50', chapitre: 7, titre: 'La Coupe des Nuages', etapes: ['coupe8'], recompense: { pieces: 800, plumesOr: 3 } },
  { id: 'q51', chapitre: 7, titre: 'Les légendes mythiques', etapes: ['parlerPlumeau9', 'grandeQuete', 'mythique'], recompense: { pieces: 1000, plumesOr: 5 } },
  { id: 'q52', chapitre: 8, titre: 'La dernière page', etapes: ['parlerPlumeau10', 'parlerGinette2'], recompense: { pieces: 400, objets: { biscuit: 5 } } },
  { id: 'q53', chapitre: 8, titre: 'La Ligue des Légendes', etapes: ['ligue1', 'ligue2', 'ligue3', 'ligue4'], recompense: { pieces: 2000, plumesOr: 5 } },
  { id: 'q54', chapitre: 8, titre: 'Le grand défi de Gontran', etapes: ['ligueGontran'], recompense: { pieces: 3000, plumesOr: 5 } },
  { id: 'q55', chapitre: 8, titre: 'La plume arc-en-ciel', etapes: ['parlerHibou3', 'pleineLune'], recompense: { pieces: 800, objets: { sablier: 6 } } },
  { id: 'q56', chapitre: 8, titre: 'Le Dindromakus', etapes: ['celestia', 'dindromakus'], recompense: { pieces: 5000, plumesOr: 10 } }
];
const ORDRE = [...QUETES.flatMap(q => q.etapes), 'fin'];
export const queteDe = etape => QUETES.find(q => q.etapes.includes(etape));
/* le titre du bandeau : la quête de l'histoire, ou (quand l'histoire attend la suite) une quête du Domaine */
export function titreQuete() {
  const q = queteDe(E().quete.etape);
  if (q) return q.titre;
  if (QD.active()) return '🏡 ' + QD.queteActuelle().titre;
  return `Chapitre ${QUETES[QUETES.length - 1].chapitre} terminé !`;
}
export const chapitreActuel = () => { const Q = queteDe(E().quete.etape); return Q ? Q.chapitre : QUETES[QUETES.length - 1].chapitre; };
/* l'histoire en est-elle arrivée à cette étape (ou plus loin) ? */
export const etapeAtteinte = s => ORDRE.indexOf(E().quete.etape) >= ORDRE.indexOf(s);
GQ.brancherHistoire(etapeAtteinte);
const OUVERTURE = { pres: 'decollage', maroc: 'volMaroc', belgique: 'volBelgique', jungle: 'volJungle', banquise: 'volBanquise', volcan: 'volVolcan', foret: 'volForet', nuages: 'volNuages' };
/* l'étape « envole-toi vers… » → l'île */
const VOLS = Object.fromEntries(Object.entries(OUVERTURE).map(([r, v]) => [v, r]));
export const regionOuverte = id => id === 'domaine' || (id === 'dindodrome' ? etapeAtteinte('entrerDindodrome') : !!OUVERTURE[id] && etapeAtteinte(OUVERTURE[id]));

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
const BESOIN = { pres: ['glouglou', 'paquerette', 'trefle'], maroc: ['dindasable', 'dromadaire', 'mirageus'], belgique: ['gaufrette', 'crachin', 'belgicus'],
  jungle: ['perroquet', 'banane', 'liane'], banquise: ['dindingloo', 'pingouin', 'aurore'], volcan: ['cendre', 'braise', 'dindofeu'], foret: ['lune', 'hibou', 'luciole'], nuages: ['nuage', 'zephyr', 'dindarc'] };
export const attrapeesDans = region => new Set(E().dindies.filter(d => d.origine === 'sauvage:' + region).map(d => d.espece));
const manquantes = region => BESOIN[region].filter(x => !attrapeesDans(region).has(x));
const compte = region => BESOIN[region].length - manquantes(region).length;
const ramasses = (prefixe, n = 3) => Array.from({ length: n }, (_, i) => prefixe + (i + 1)).filter(id => E().monde.ramasses[id]).length;
/* l'étape « attrape 3 espèces de l'île » : jungle3 → jungle */
const ilePage = s => /3$/.test(s) && BESOIN[s.slice(0, -1)] ? s.slice(0, -1) : null;
const EQUIPEMENTS = ['jumelles', 'moufles', 'bottesLave', 'lanterne', 'ailes'];

/* ── les îles 4 à 8 : le guide, la page du Grand Livre, les 3 objets de la légende, l'épique et son gadget ── */
const ILES = {
  jungle: { guide: 'tarzanette', parler2: 'parlerTarzanette2', etapeObjets: 'statuettes', objet: 'statuette', epique: 'jaguar', zone: 'temple', gadget: 'baton', cadeau: 'banane',
    ok: () => meteo('jungle') === 'pluie', apres: 'serre',
    accueil: ['Ohééé ! Te voilà enfin, l’exploratrice ! Bienvenue dans <b>ma Jungle</b> ! Je suis Tarzanette, la reine des lianes.',
      'Ici vivent le <b>Dindoperroquet</b>, qui jacasse à l’orée de la jungle (le jour !), et le <b>Dindobanane</b>, dans la bananeraie.',
      'Et tout en haut des arbres géants se cache la <b>Dindoliane</b>. Sans <b>jumelles</b>, impossible de la voir !', ['moi', 'J’ai mes jumelles !'],
      'Super ! Et si une dindie 🌴 Jungle fait la timide, offre-lui une <b>banane fondante</b> 🍌. Effet garanti !'],
    page: { perroquet: 'Le Dindoperroquet jacasse à l’orée de la jungle… mais seulement <b>le jour</b> !', banane: 'Le Dindobanane se cache dans la <b>bananeraie</b>, près de ma cabane.', liane: 'La Dindoliane se balance sous les <b>arbres géants</b>. Sors tes jumelles 🔭 !' },
    legende: ['Trois nouvelles amies ! Bravo ! Maintenant, écoute bien… Tu vois le <b>temple perdu</b>, tout au nord ?',
      'Son gardien, le <b>Dindojaguar</b>, ne revient que si ses <b>3 statuettes d’or</b> sont retrouvées. Les singes farceurs les ont cachées dans toute la Jungle !'],
    objets: n => `${n} statuette${n > 1 ? 's' : ''} d’or sur 3. Les singes les ont bien cachées !`,
    trouve: 'Les 3 statuettes d’or ! Le Dindojaguar va revenir… sous la pluie, devant le temple !',
    indice: ['Le Dindojaguar n’aime que <b>la pluie</b> 🌧️. Il rôde devant le temple perdu.', 'Il fait beau ? Secoue le <b>bâton de pluie</b>, devant le temple : la pluie tombera… pour un moment !'],
    bavard: ['Ohééé ! La Jungle est à toi, l’exploratrice !', 'Les dindies 🌴 Jungle adorent les bananes fondantes.', 'La cascade, c’est ma douche du matin. Brrr !'] },
  banquise: { guide: 'inuk', parler2: 'parlerInuk2', etapeObjets: 'etoilesGlace', objet: 'etoileGlace', epique: 'cristal', zone: 'grotte', gadget: 'cor', cadeau: 'sorbet',
    ok: () => estMatin(), apres: 'coupe5',
    accueil: ['Bienvenue sur la <b>Banquise</b>, Roullieee ! Je m’appelle Inuk. Ici, le vent est froid, mais les dindies ont le cœur chaud.',
      'Le <b>Dindingloo</b> vit près de notre village d’igloos, et le <b>Dindopingouin</b> glisse sur la banquise, au bord de l’eau.',
      'Au pied du glacier vit la <b>Dindaurore</b>. Elle ne se laisse approcher que par des mains bien au chaud : garde tes <b>moufles</b> !', ['moi', 'Mes moufles sont prêtes !'],
      'Et pour les dindies ❄️ Glace, rien ne vaut un <b>sorbet givré</b> 🍧. Bonne glisse !'],
    page: { dindingloo: 'Le Dindingloo se promène près du <b>village d’igloos</b>, à l’ouest.', pingouin: 'Le Dindopingouin glisse sur la <b>banquise</b>, au bord de l’eau.', aurore: 'La Dindaurore brille au pied du <b>glacier</b>. Tes moufles 🧤 la rassurent !' },
    legende: ['Trois nouvelles amies ! Alors je vais te raconter l’histoire de la <b>grotte de glace</b>…',
      'Le <b>Dindocristal</b> y dort depuis l’hiver dernier. Pour le réveiller, il faut ses <b>3 étoiles de glace</b>, tombées un peu partout sur la Banquise.'],
    objets: n => `${n} étoile${n > 1 ? 's' : ''} de glace sur 3. Elles brillent dans la neige !`,
    trouve: 'Les 3 étoiles de glace ! Le Dindocristal va se réveiller… le matin, devant la grotte de glace !',
    indice: ['Le Dindocristal ne sort de sa grotte que <b>le matin</b> 🌅, quand le soleil fait briller la glace.', 'Tu ne veux pas attendre ? Souffle dans le <b>cor des glaces</b>, près de la grotte : le soleil se lèvera… pour un moment !'],
    bavard: ['Le lac gelé est parfait pour glisser. Les Dindopingouins adorent !', 'Les dindies ❄️ Glace raffolent du sorbet givré.', 'Quand il neige, la Banquise devient toute silencieuse… Écoute !'] },
  volcan: { guide: 'lava', parler2: 'parlerLava2', etapeObjets: 'pierresLave', objet: 'pierreLave', epique: 'magma', zone: 'cratere', gadget: 'sablierLave', cadeau: 'piment',
    ok: () => estNuit(), apres: 'coupe6',
    accueil: ['Par mes braises ! Une visiteuse ! Bienvenue au <b>Volcan</b>, petite. Je suis Madame Lava, forgeronne et amie des dindies de feu.',
      'Dans les champs de cendre vit le <b>Dindocendre</b>. Près des pierres chaudes, le <b>Dindobraise</b> fait sa sieste.',
      'Le <b>Dindofeu</b>, lui, se baigne au bord de la <b>coulée de lave</b>. Avec tes <b>bottes de lave</b>, tu pourras t’en approcher sans te brûler les pieds !', ['moi', 'J’ai mes bottes !'],
      'Et un <b>piment doux</b> 🌶️ pour les dindies 🔥 Feu : elles adorent ça !'],
    page: { cendre: 'Le Dindocendre se roule dans les <b>champs de cendre</b>, à l’ouest.', braise: 'Le Dindobraise dort près des <b>pierres chaudes</b>, au sud.', dindofeu: 'Le Dindofeu se baigne au bord de la <b>coulée de lave</b>. Mets tes bottes de lave 🥾 !' },
    legende: ['Bien joué, petite ! Tu as l’étoffe d’une forgeronne. Alors écoute…',
      'Au cœur du cratère dort le <b>Dindomagma</b>. Il ne sort que si on lui rapporte ses <b>3 pierres de lave</b>, crachées par le volcan lors de la dernière éruption.'],
    objets: n => `${n} pierre${n > 1 ? 's' : ''} de lave sur 3. Elles sont encore toutes chaudes !`,
    trouve: 'Les 3 pierres de lave ! Le Dindomagma va sortir… la nuit, en haut, près du cratère !',
    indice: ['Le Dindomagma ne sort que <b>la nuit</b> 🌙, quand le cratère brille dans le noir.', 'Pressée ? Retourne le <b>sablier de lave</b>, sur le chemin du cratère : la nuit tombera… pour un moment !'],
    bavard: ['Les sources chaudes, c’est bon pour les plumes !', 'Les dindies 🔥 Feu adorent les piments doux.', 'Ma forge ne s’éteint jamais. Jamais !'] },
  foret: { guide: 'hibou', parler2: 'parlerHibou2', etapeObjets: 'eclatsLune', objet: 'eclatLune', epique: 'etoile', zone: 'colline', gadget: 'boite', cadeau: 'myrtille',
    ok: () => estNuit(), apres: 'coupe7',
    accueil: ['Hou hou ! Bonsoir, chère exploratrice. Je suis le <b>Comte Hibou</b>, astronome. Bienvenue dans la <b>Forêt de la Lune</b>.',
      'Dans la clairière se promène le <b>Dindon Lune</b>. Dans les bois bleus, le <b>Dindhibou</b> ne se réveille que <b>la nuit</b>… comme moi.',
      'Autour de l’étang de lune danse la <b>Dindoluciole</b>. Elle n’approche que ceux qui portent une <b>lanterne</b>.', ['moi', 'J’ai ma lanterne !'],
      'Parfait. Et une <b>myrtille de lune</b> 🫐 rendra toute dindie 🌙 Nuit plus confiante. Hou hou !'],
    page: { lune: 'Le Dindon Lune se promène dans la <b>clairière</b>.', hibou: 'Le Dindhibou se réveille <b>la nuit</b>, dans les bois bleus.', luciole: 'La Dindoluciole danse autour de l’<b>étang de lune</b>. Ta lanterne 🏮 l’attire !' },
    legende: ['Remarquable ! Hou hou. Alors je vais vous confier une observation…',
      'Chaque nuit, la <b>Dindétoile</b> descendait sur la colline aux étoiles. Mais <b>3 éclats de lune</b> sont tombés dans la forêt, et depuis, elle ne vient plus…'],
    objets: n => `${n} éclat${n > 1 ? 's' : ''} de lune sur 3. Ils brillent doucement dans le noir.`,
    trouve: 'Les 3 éclats de lune ! La Dindétoile va revenir… la nuit, sur la colline aux étoiles !',
    indice: ['La Dindétoile ne descend que <b>la nuit</b> 🌙, sur la colline aux étoiles.', 'Il fait jour ? Remontez la <b>boîte à musique</b>, près de la colline : sa berceuse fait tomber la nuit… pour un moment.'],
    bavard: ['Hou hou ! Les champignons brillent plus fort quand il fait nuit.', 'Les dindies 🌙 Nuit adorent les myrtilles de lune.', 'Avec mon télescope, je vois même les cratères de la lune !'] },
  nuages: { guide: 'azur', parler2: 'parlerAzur2', etapeObjets: 'plumesEclair', objet: 'plumeEclair', epique: 'orage', zone: 'sommet', gadget: 'tambour', cadeau: 'barbeAPapa',
    ok: () => meteo('nuages') === 'pluie', apres: 'coupe8',
    accueil: ['Paré au décollage ! Salut, Roullieee ! Je suis <b>Aurélie Azur</b>, aviatrice. Bienvenue au <b>Royaume des Nuages</b> !',
      'Le <b>Dindinuage</b> rebondit sur les nuages, et le <b>Dindozéphyr</b> joue avec le vent près des moulinets… le jour seulement.',
      'Le <b>Dindarc</b> vole sous l’arc-en-ciel. Pour le rejoindre, il faut planer : heureusement, tu as tes <b>ailes de planeur</b> !', ['moi', 'Mes ailes sont prêtes !'],
      'Et de la <b>barbe à papa</b> 🍭 pour les dindies ☁️ Ciel : elles en raffolent !'],
    page: { nuage: 'Le Dindinuage rebondit <b>sur les nuages</b>, au milieu de l’île.', zephyr: 'Le Dindozéphyr joue près des <b>moulinets</b>, mais seulement <b>le jour</b>.', dindarc: 'Le Dindarc vole sous l’<b>arc-en-ciel</b>. Déploie tes ailes 🪁 !' },
    legende: ['Wouah ! Tu voles presque aussi bien que moi ! Écoute ça…',
      'Quand l’orage gronde, le <b>Dindorage</b> se pose au sommet, près du palais. Mais il a perdu ses <b>3 plumes d’éclair</b> dans le vent. Sans elles, il n’ose plus se montrer !'],
    objets: n => `${n} plume${n > 1 ? 's' : ''} d’éclair sur 3. Elles crépitent : écoute bien !`,
    trouve: 'Les 3 plumes d’éclair ! Le Dindorage va revenir… sous la pluie, au sommet, près du palais !',
    indice: ['Le Dindorage n’arrive qu’avec <b>la pluie</b> ⛈️, au sommet, près du palais.', 'Il fait beau ? Tape sur le <b>tambour d’orage</b>, sur le chemin du palais : la pluie arrivera… pour un moment !'],
    bavard: ['Le vent est bon aujourd’hui ! Parfait pour planer.', 'Les dindies ☁️ Ciel adorent la barbe à papa.', 'Un jour, je volerai jusqu’à la lune. Promis !'] }
};
const ILE_DE_GUIDE = Object.fromEntries(Object.entries(ILES).map(([r, I]) => [I.guide, r]));
/* l'étape d'une île → l'île (accueil, page, légende, objets, épique) */
const ILE_ETAPE = Object.fromEntries(Object.entries(ILES).flatMap(([r, I]) => [[I.guide, r], [r + '3', r], [I.parler2, r], [I.etapeObjets, r], [I.epique, r]]));
const mythiqueNee = () => Object.keys(E().livre.attrapes).some(x => PAR_ID[x]?.rarete === 'mythique');
const oeufLegendaire = () => (E().elevage?.couveuses || []).some(o => o && o.rarete === 'mythique');
const objetLegendaire = () => Object.keys(E().inventaire).some(o => OBJETS[o]?.legendaire);

/* ── où se passe l'étape (null = partout) ── */
const LIEU = { gaston: 'pres', capture1: 'pres', pres3: 'pres', parlerGaston2: 'pres', plumesRouges: 'pres', coquelicot: 'pres', chapeau: 'domaine',
  leila: 'maroc', maroc3: 'maroc', parlerLeila2: 'maroc', lanternes: 'maroc', dingue: 'maroc', parapluie: 'domaine', waffel: 'belgique', belgique3: 'belgique',
  parlerWaffel2: 'belgique', boules: 'belgique', atomium: 'belgique', volMaroc: 'zephyr', volBelgique: 'zephyr', decollage: 'domaine',
  parlerPlumeau3: 'domaine', kitCouvoir: 'domaine', reparerCouvoir: 'domaine', oeufTuto: 'domaine', eclosion: 'domaine', kitNurserie: 'domaine', reparerNurserie: 'domaine',
  grandir: 'domaine', nid: 'domaine', oeufCroise: 'domaine', parlerPlumeau4: 'domaine', eveil: 'domaine',
  parlerPlumeau5: 'domaine', parlerGinette: 'domaine', entrerDindodrome: 'domaine', courseEssai: 'dindodrome', kitEntrainement: 'domaine', reparerEntrainement: 'domaine',
  entrainement3: 'domaine', coupe1: 'dindodrome', gontran1: 'dindodrome', lecon: 'domaine', coupe2: 'dindodrome', coupe3: 'dindodrome', coupe4: 'dindodrome', gontran2: 'dindodrome',
  parlerPlumeau6: 'domaine', parlerPlumeau7: 'domaine', parlerPlumeau8: 'domaine', parlerPlumeau9: 'domaine', serre: 'domaine',
  coupe5: 'dindodrome', coupe6: 'dindodrome', coupe7: 'dindodrome', coupe8: 'dindodrome',
  ...Object.fromEntries(EQUIPEMENTS.map(x => [x, 'domaine'])), ...Object.fromEntries(Object.keys(VOLS).map(x => [x, 'zephyr'])), ...ILE_ETAPE,
  parlerPlumeau10: 'domaine', parlerGinette2: 'domaine', ...Object.fromEntries(LIGUE.map(x => [x.id, 'dindodrome'])), parlerHibou3: 'foret', pleineLune: 'foret', dindromakus: 'domaine' };
/* la Ligue : l'étape → la course, et qui la propose */
const LIGUE_ETAPE = Object.fromEntries(LIGUE.map(L => [L.id, L]));
export const lieuEtape = () => { const s = E().quete.etape; return ORDRE.indexOf(s) < ORDRE.indexOf('decollage') ? 'domaine' : LIEU[s] || null; };
/* VOLS contient aussi 'decollage', qui reste au Domaine */
LIEU.decollage = 'domaine';
let lieuActuel = () => 'domaine';
export const lieuActuelId = () => lieuActuel();
const nomLieu = id => id === 'domaine' ? 'au Domaine' : id === 'dindodrome' ? 'au Dindodrome' : REGIONS[id] ? `${REGIONS[id].nom.replace(/^(Le |La |Les )/, m => ({ 'Le ': 'au ', 'La ': 'en ', 'Les ': 'aux ' })[m])}` : '';

/* ── le texte de l'étape (le bandeau en haut) et ce que montre la flèche ── */
export function texteEtape() {
  const e = E(), s = e.quete.etape, ici = lieuActuel(), la = lieuEtape();
  if (s === 'fin' && QD.active()) return QD.texte(ici);
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
    parlerPlumeau5: 'Va voir le Professeur Plumeau : il a une grande nouvelle ! 🔬',
    parlerGinette: 'Va voir Coach Ginette, devant le portail du Dindodrome, à l’est 🏁',
    entrerDindodrome: 'Entre au Dindodrome : touche le portail, au bout de la route de l’est 🏁',
    courseEssai: 'Parle à Monsieur Chrono, devant le Bureau des courses : ta première course ! 🎙️',
    kitEntrainement: 'Achète un kit de construction chez Mimi, pour le terrain d’entraînement 🧰',
    reparerEntrainement: 'Répare le terrain d’entraînement, au bord de la route du Dindodrome 🏋️',
    entrainement3: `Joue aux 3 jeux d’entraînement de Coach Ginette (${(e.quete.jeux || []).length}/3) 🏋️`,
    coupe1: `La Coupe des Prés 🍀 : 3 courses sur le podium, puis la finale contre Gaston ! (${coupeTexte(1)})`,
    gontran1: 'Gontran te lance un défi au Dindodrome ! Va lui parler 😤',
    lecon: 'Apprends une nouvelle compétence à une dindie, chez Coach Ginette (la 1re leçon est offerte !) 📚',
    coupe2: `La Coupe des Dunes ☀️ : 3 podiums, puis la finale contre Leïla ! (${coupeTexte(2)})`,
    coupe3: `La Coupe de la Pluie 💧 : 3 podiums, puis la finale contre Monsieur Waffel ! (${coupeTexte(3)})`,
    coupe4: `La Coupe des Lianes 🌴 : 3 podiums, puis la finale contre Tarzanette ! (${coupeTexte(4)})`,
    gontran2: 'Gontran veut sa revanche ! Va lui parler au Dindodrome 😤',
    parlerPlumeau6: 'Une lettre est arrivée pour toi ! Va voir le Professeur Plumeau 🔬',
    jumelles: 'Achète des jumelles chez Mimi, pour la Jungle 🔭',
    volJungle: 'Envole-toi vers la Jungle avec le Capitaine Zéphyr 🎈',
    tarzanette: 'Va voir Tarzanette, devant sa cabane 🌴',
    jungle3: page('jungle', 'de la Jungle'),
    parlerTarzanette2: 'Raconte tes captures à Tarzanette 🌴',
    statuettes: `Trouve les 3 statuettes d’or de la Jungle 🏺 (${ramasses('statuette')}/3)`,
    jaguar: 'Attrape le Dindojaguar : sous la pluie, devant le temple perdu 🌧️',
    serre: `Construis la Serre 🌴 dans l’allée des enclos, au Domaine (${PRIX_SERRE} 🪙)`,
    moufles: 'Inuk t’invite sur la Banquise ! Achète d’abord des moufles chez Mimi 🧤',
    volBanquise: 'Envole-toi vers la Banquise avec le Capitaine Zéphyr 🎈',
    inuk: 'Va voir Inuk, au village d’igloos ❄️',
    banquise3: page('banquise', 'de la Banquise'),
    parlerInuk2: 'Raconte tes captures à Inuk ❄️',
    etoilesGlace: `Trouve les 3 étoiles de glace de la Banquise ❄️ (${ramasses('etoileGlace')}/3)`,
    cristal: 'Attrape le Dindocristal : le matin, devant la grotte de glace 🌅',
    coupe5: `La Coupe de Glace ❄️ : 3 podiums, puis la finale contre Inuk ! (${coupeTexte(5)})`,
    parlerPlumeau7: 'Le Professeur Plumeau a une nouvelle mission pour toi 🔬',
    bottesLave: 'Achète des bottes de lave chez Mimi, pour le Volcan 🥾',
    volVolcan: 'Envole-toi vers le Volcan avec le Capitaine Zéphyr 🎈',
    lava: 'Va voir Madame Lava, devant sa forge 🔨',
    volcan3: page('volcan', 'du Volcan'),
    parlerLava2: 'Raconte tes captures à Madame Lava 🔥',
    pierresLave: `Trouve les 3 pierres de lave du Volcan 🪨 (${ramasses('pierreLave')}/3)`,
    magma: 'Attrape le Dindomagma : la nuit, en haut, près du cratère 🌋',
    coupe6: `La Coupe de Lave 🔥 : 3 podiums, puis la finale contre Madame Lava ! (${coupeTexte(6)})`,
    lanterne: 'Le Comte Hibou t’invite dans la Forêt de la Lune ! Achète d’abord une lanterne chez Mimi 🏮',
    volForet: 'Envole-toi vers la Forêt de la Lune avec le Capitaine Zéphyr 🎈',
    hibou: 'Va voir le Comte Hibou, devant son observatoire 🔭',
    foret3: page('foret', 'de la Forêt'),
    parlerHibou2: 'Raconte tes captures au Comte Hibou 🌙',
    eclatsLune: `Trouve les 3 éclats de lune de la Forêt 🌙 (${ramasses('eclatLune')}/3)`,
    etoile: 'Attrape la Dindétoile : la nuit, sur la colline aux étoiles ⭐',
    coupe7: `La Coupe de la Nuit 🌙 : 3 podiums, puis la finale contre le Comte Hibou ! (${coupeTexte(7)})`,
    parlerPlumeau8: 'Le Professeur Plumeau a vu quelque chose dans le ciel ! Va le voir 🔬',
    ailes: 'Achète des ailes de planeur chez Mimi, pour le Royaume des Nuages 🪁',
    volNuages: 'Envole-toi vers le Royaume des Nuages avec le Capitaine Zéphyr 🎈',
    azur: 'Va voir Aurélie Azur, devant sa tour 🪁',
    nuages3: page('nuages', 'des Nuages'),
    parlerAzur2: 'Raconte tes captures à Aurélie Azur ☁️',
    plumesEclair: `Trouve les 3 plumes d’éclair des Nuages ⚡ (${ramasses('plumeEclair')}/3)`,
    orage: 'Attrape le Dindorage : sous la pluie, au sommet, près du palais ⛈️',
    coupe8: `La Coupe des Nuages ☁️ : 3 podiums, puis la finale contre Aurélie Azur ! (${coupeTexte(8)})`,
    parlerPlumeau9: 'Le Professeur Plumeau a trouvé un très vieux livre… Va le voir 🔬',
    grandeQuete: '🌈 ' + GQ.texteGrandes(),
    mythique: oeufLegendaire() ? 'Ton œuf légendaire couve au Couvoir… Fais-le éclore ! 🥚🌈'
      : objetLegendaire() ? 'Au nid du Couvoir, mets les deux bons parents avec ton objet légendaire : une dindie mythique va naître ! 🌈'
      : '🌈 ' + GQ.texteGrandes(),
    parlerPlumeau10: 'Le Professeur Plumeau a lu la dernière page du vieux livre… Va le voir 🔬',
    parlerGinette2: 'Coach Ginette a une grande nouvelle : la Ligue des Légendes ! Va la voir, devant le portail du Dindodrome 🏁',
    ligue1: 'La Ligue des Légendes 👑 : bats la Baronne Plumeline (haies). Elle t’attend au Dindodrome !',
    ligue2: 'La Ligue des Légendes 👑 : bats le Grand Dindini (piste de Nuit 🌙) !',
    ligue3: 'La Ligue des Légendes 👑 : bats Mamie Glouglou (marathon : 1 000 m !)',
    ligue4: 'La Ligue des Légendes 👑 : bats le Capitaine Rapido (sprint ⚡) !',
    ligueGontran: 'La grande finale de la Ligue : Gontran t’attend au Dindodrome ! 😤👑',
    parlerHibou3: 'La plume brille un peu… Le Comte Hibou, dans la Forêt de la Lune, connaît sa légende 🌙',
    pleineLune: pleineLune() ? 'C’est la pleine lune ! Pose la plume sur la pierre de lune, au milieu du cercle de la colline aux étoiles 🌕'
      : `Il faut la pleine lune (dans ${joursAvantPleineLune()} jours)… ou le grand télescope du Comte Hibou 🔭, puis la pierre de lune de la colline 🌕`,
    celestia: E().livre.attrapes.celestia ? 'Célestia Dindissima est là ! 🌈' : 'Il faut une Célestia Dindissima : la grande quête « Le palais des nuages » (Aurélie Azur, au Royaume des Nuages), puis le Couvoir ☁️🌈',
    dindromakus: oeufLegendaire() ? 'L’œuf du Dindromakus couve au Couvoir… Fais-le éclore ! 🥚🌈'
      : 'Au nid du Couvoir : une Dindétoile, Célestia Dindissima et la plume arc-en-ciel. La légende des légendes t’attend ! 🌈',
    fin: '🌈 L’histoire est finie… mais le Royaume continue : les Coupes des Maîtres, la Scène des défilés, les défis du jour, les succès ! ✨'
  })[s] || '';
  if (la === 'dindodrome' && ici === 'domaine') return t + ' <i>(au Dindodrome : par le portail de l’est 🏁)</i>';
  if (la && la !== 'domaine' && la !== 'dindodrome' && ici === 'dindodrome') return t + ' <i>(rentre d’abord au Domaine 🏡, puis en montgolfière 🎈)</i>';
  if (la === 'domaine' && ici === 'dindodrome') return t + ' <i>(au Domaine : par le portail 🏡)</i>';
  if (la === 'dindodrome' && ici !== 'dindodrome') return t + ' <i>(au Dindodrome : rentre d’abord au Domaine en montgolfière 🎈)</i>';
  if (la && la !== 'zephyr' && la !== ici) return t + ` <i>(${nomLieu(la)} : en montgolfière 🎈)</i>`;
  return t;
}
/* l'identifiant de l'objet interactif à montrer (ou une liste : le plus proche) ;
   'sauvage:espece' = une dindie sauvage ; 'zone:nom' = un coin de la région */
/* les courses déjà réussies d'un championnat : « 2/3 podiums » ou « la finale ! » */
const page = (r, de) => `Attrape 3 espèces ${de} : ${BESOIN[r].map(x => PAR_ID[x].nom).join(', ')} (${compte(r)}/3)`;
const PRIX_SERRE = 400;
const SORTES_TXT = { haies: 'Une course de haies, 600 m.', piste: 'La piste de Nuit, 500 m, avec ses champignons et sa brume.', marathon: 'Un marathon : 1 000 m, 5 tours !', sprint: 'Un sprint : 400 m, à fond !' };
const coupeTexte = n => { const C = CHAMPIONNATS[n - 1], k = C.courses.filter(c => (DD.meilleurePlace(c.id) || 9) <= 3).length; return k < 3 ? `${k}/3 podiums` : 'la finale !'; };
export function cibleEtape() {
  const e = E(), s = e.quete.etape, ici = lieuActuel(), la = lieuEtape();
  if (s === 'fin' && QD.active()) return QD.cible(ici);
  if (la === 'dindodrome' && ici === 'domaine') return 'dindodrome';
  if (la === 'domaine' && ici === 'dindodrome') return 'sortie';
  if (la && la !== 'dindodrome' && ici === 'dindodrome') return 'sortie';
  if (la && la !== 'zephyr' && la !== ici) return 'pnj-zephyr';
  if (s === 'planches') return ['planche1', 'planche2', 'planche3'].filter(p => !e.monde.ramasses[p]).map(p => 'objet-' + p);
  if (s === 'nourrir') {
    const pas = e.dindies.filter(d => !e.quete.nourries.includes(d.uid));
    return pas.map(d => d.lieu.startsWith('enclos:') ? 'enclos-' + d.lieu.slice(7) : d.lieu === 'clapier' ? 'clapier' : 'moi');
  }
  if (s === 'capture1') return ['sauvage'];
  if (ilePage(s)) { const r = ilePage(s), m = manquantes(r); return [...m.map(x => 'sauvage:' + x), ...m.map(x => 'zone:' + REGIONS[r].especes[x].zone)]; }
  const I = ILES[ILE_ETAPE[s]];
  if (I && s === I.etapeObjets) return [1, 2, 3].filter(i => !e.monde.ramasses[I.objet + i]).map(i => 'objet-' + I.objet + i);
  if (I && s === I.epique) return ['sauvage:' + s, I.ok() ? 'zone:' + I.zone : 'gadget-' + I.gadget];
  if (I && (s === I.guide || s === I.parler2)) return 'pnj-' + I.guide;
  if (s === 'grandeQuete') return GQ.cible(ici);
  if (LIGUE_ETAPE[s]) return 'pnj-' + LIGUE_ETAPE[s].plume;
  if (s === 'pleineLune') return pleineLune() ? 'gadget-autel' : 'gadget-telescope';
  if (s === 'celestia') { const c = GQ.etatGrande('palais') === 'fini' || objetLegendaire() || oeufLegendaire() ? null : GQ.cible(ici); return c || (ici === 'domaine' ? 'couvoir' : ici === 'dindodrome' ? 'sortie' : 'ballon'); }
  if (s === 'dindromakus') return ici === 'domaine' ? 'couvoir' : ici === 'dindodrome' ? 'sortie' : 'ballon';
  if (s === 'mythique') return (oeufLegendaire() || objetLegendaire()) ? (ici === 'domaine' ? 'couvoir' : ici === 'dindodrome' ? 'sortie' : 'ballon') : GQ.cible(ici);
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
    reparerNurserie: 'nurserie', grandir: 'nurserie', nid: 'couvoir', oeufCroise: 'couvoir', parlerPlumeau4: 'pnj-plumeau', eveil: 'labo',
    parlerPlumeau5: 'pnj-plumeau', parlerGinette: 'pnj-ginette', entrerDindodrome: 'dindodrome', courseEssai: 'pnj-chrono', kitEntrainement: 'pnj-mimi',
    reparerEntrainement: 'entrainement', entrainement3: 'entrainement', lecon: 'entrainement', coupe1: 'bureau', coupe2: 'bureau', coupe3: 'bureau', coupe4: 'bureau',
    gontran1: 'pnj-gontran', gontran2: 'pnj-gontran',
    parlerPlumeau6: 'pnj-plumeau', parlerPlumeau7: 'pnj-plumeau', parlerPlumeau8: 'pnj-plumeau', parlerPlumeau9: 'pnj-plumeau', serre: 'enclos-jungle',
    coupe5: 'bureau', coupe6: 'bureau', coupe7: 'bureau', coupe8: 'bureau', parlerPlumeau10: 'pnj-plumeau', parlerGinette2: 'pnj-ginette', parlerHibou3: 'pnj-hibou',
    ...Object.fromEntries(EQUIPEMENTS.map(x => [x, 'pnj-mimi'])), ...Object.fromEntries(Object.keys(VOLS).map(x => [x, 'pnj-zephyr']))
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
    else if (suivante === 'fin' && Q.chapitre === 8) setTimeout(() => monde && monde.finHistoire && monde.finHistoire(), 1200);
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
  if (ici === 'dindodrome' && monde.ajouterPnj) {
    const PLACES = { gaston: [-19, 32.5, .6], leila: [-11.5, 34.2, .3], waffel: [11.5, 34.2, -.3], tarzanette: [19, 32.5, -.6],
      inuk: [-19, 39, .6], lava: [-12, 40.5, .3], hibou: [12, 40.5, -.3], azur: [19, 39, -.6] };
    for (const C of CHAMPIONNATS) if (etapeAtteinte('coupe' + C.n)) monde.ajouterPnj(C.champion, ...PLACES[C.champion]);
    if (etapeAtteinte('gontran1')) monde.ajouterPnj('gontran', 6.5, 27.5, -.4);
    /* les Quatre Plumes de la Ligue des Légendes, devant le portail */
    if (etapeAtteinte('ligue1')) for (const [id, x, z, r] of [['plumeline', -5, 37, .4], ['dindini', -1.9, 38, .15], ['mamie', 1.9, 38, -.15], ['rapido', 5, 37, -.4]]) monde.ajouterPnj(id, x, z, r);
  }
  if (ici === 'domaine' && e.batiments.dindodrome?.ouvert && monde.ouvrirPortail) monde.ouvrirPortail(false);
  if (ici === 'pres' && s === 'plumesRouges') for (const i of [1, 2, 3]) if (!e.monde.ramasses['plumeRouge' + i]) monde.poserObjet('plumeRouge' + i, 'plume');
  if (ici === 'belgique' && s === 'boules') for (const i of [1, 2, 3]) if (!e.monde.ramasses['bouleArgent' + i]) monde.poserObjet('bouleArgent' + i, 'boule');
  if (ici === 'maroc' && monde.allumerLanterne) for (const i of [1, 2, 3]) monde.allumerLanterne(i, !!e.monde.ramasses['lanterne' + i]);
  const I = ILES[ici];
  if (I && s === I.etapeObjets && monde.poserObjet) for (const i of [1, 2, 3]) if (!e.monde.ramasses[I.objet + i]) monde.poserObjet(I.objet + i, I.objet);
  if (monde.poserObjet && ici !== 'domaine' && ici !== 'dindodrome') GQ.preparer(ici, monde);
  /* déjà fait avant d'y arriver (des captures en avance) : on passe à la suite */
  if (s === 'grandir' && e.dindies.some(d => d.stade === 'jeune' && d.lieu === 'nurserie')) setTimeout(() => { if (E().quete.etape === s) avancer(); }, 600);
  if ((LIGUE_ETAPE[s] && DD.ligueGagnee(s)) || (/^coupe[1-8]$/.test(s) && DD.badge(+s.slice(5))) || (s === 'entrainement3' && (e.quete.jeux || []).length >= 3) || (s === 'lecon' && DD.courses().lecons > 0)) setTimeout(() => { if (E().quete.etape === s) avancer(); }, 600);
  if ((s === 'capture1' && attrapeesDans('pres').size) || (ilePage(s) && !manquantes(ilePage(s)).length)) setTimeout(() => { if (E().quete.etape === s) avancer(); }, 600);
  if ((EQUIPEMENTS.includes(s) && J.combien(s)) || (ILES[ILE_ETAPE[s]]?.epique === s && E().livre.attrapes[s] && attrapeesDans(ILE_ETAPE[s]).has(s))) setTimeout(() => { if (E().quete.etape === s) avancer(); }, 600);
  setTimeout(verifierEtat, 400);
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
  /* les quêtes du Domaine (si l'histoire n'attend rien de cet habitant) */
  if (QD.active() && (s === 'fin' || cibleEtape() !== 'pnj-' + id) && await QD.parler(id)) return;
  if (lieuActuel() === 'dindodrome' && ['chrono', 'gontran', ...CHAMPIONNATS.map(C => C.champion), ...LIGUE.map(L => L.plume)].includes(id)) return parlerDindodrome(id);
  /* la légende d'une île (chapitre 7), si l'histoire n'attend rien de ce guide */
  if (cibleEtape() !== 'pnj-' + id && await GQ.parler(id, lieuActuel(), monde)) return;
  if (ILE_DE_GUIDE[id]) return parlerGuide(id);
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
    if (s === 'parlerPlumeau5') {
      await dialogue([L('plumeau', 'Roullieee ! Grande nouvelle : <b>le Dindodrome rouvre ses portes</b> ! C’est Coach Ginette qui me l’a dit.'),
        L('plumeau', 'Le Dindodrome, c’est là que les dindies font la course : vitesse ⚡, endurance 💪 et saut 🦘. Et il y a des <b>championnats</b>, avec des badges !'),
        L('plumeau', 'Ginette t’attend devant le portail, au bout de la route de l’est. File !')]);
      avancer();
      return;
    }
    if (s === 'parlerPlumeau6') {
      await dialogue([L('plumeau', 'Roullieee ! Quatre badges, bravo ! Et regarde : une lettre est arrivée pour toi… de la <b>Jungle</b> !'),
        L('plumeau', 'C’est <b>Tarzanette</b> : « Ohééé ! Viens voir ma Jungle ! Il y a des dindies partout dans les arbres ! »'),
        L('plumeau', 'Pour la Jungle, il te faudra des <b>jumelles</b> 🔭 : certaines dindies se cachent tout en haut des arbres. Mimi en vend.'),
        ...(QD.active() ? [L('plumeau', 'Et entre deux voyages, le Domaine a besoin de toi : les <b>quêtes du Domaine</b> 🏡 t’attendent dans ton Journal 📜 !')] : [])]);
      avancer();
      return;
    }
    if (s === 'parlerPlumeau7') {
      await dialogue([L('plumeau', 'Le Badge Flocon ! Tu es incroyable, Roullieee !'),
        L('plumeau', 'J’ai des nouvelles de <b>Madame Lava</b>, la forgeronne du <b>Volcan</b>. Elle cherche une exploratrice courageuse… Il paraît qu’un Dindomagma dort dans son cratère !'),
        L('plumeau', 'Au Volcan, le sol est brûlant : il te faut des <b>bottes de lave</b> 🥾. Mimi en vend !')]);
      avancer();
      return;
    }
    if (s === 'parlerPlumeau8') {
      await dialogue([L('plumeau', 'Roullieee ! Cette nuit, dans le télescope du Comte Hibou, j’ai vu une île… <b>au-dessus des nuages</b> !'),
        L('plumeau', 'C’est le <b>Royaume des Nuages</b>, où vit l’aviatrice <b>Aurélie Azur</b>. Les dindies les plus rapides du Royaume y volent !'),
        L('plumeau', 'Pour aller là-haut, il faut savoir planer : des <b>ailes de planeur</b> 🪁, chez Mimi !')]);
      avancer();
      return;
    }
    if (s === 'parlerPlumeau9') {
      await dialogue([L('plumeau', 'Huit badges ! Tu es la plus grande championne du Royaume, Roullieee !'),
        L('plumeau', 'Et regarde ce que j’ai trouvé au fond du Labo : un très vieux livre… <b>Les légendes des dindies mythiques</b> 🌈.'),
        L('plumeau', 'Chaque île garde une légende. Quand tu as attrapé l’<b>épique</b> d’une île, son guide te la raconte. Au bout de la quête : un <b>objet légendaire</b>.'),
        L('plumeau', 'Avec cet objet et les deux bons parents, au nid du Couvoir, une <b>dindie mythique</b> peut naître ! Commence par Gaston, dans les Prés : il connaît la légende du jardin oublié.'),
        L('moi', 'Une dindie mythique… Et le Dindromakus, Professeur ?'),
        L('plumeau', 'Ah… Le Dindromakus est la légende des légendes. Fais d’abord naître une mythique. Ensuite… on verra !')]);
      avancer();
      return;
    }
    if (s === 'parlerPlumeau10') {
      await dialogue([L('plumeau', 'Roullieee… Une dindie mythique ! Je n’en croyais pas mes yeux. Tu es devenue une vraie légende !'),
        L('plumeau', 'J’ai lu la dernière page du vieux livre. Elle parle du <b>Dindromakus RUUULIUSSS Maximus</b>… et d’une <b>plume arc-en-ciel</b>.'),
        L('moi', 'La plume ! Le soir où j’ai vu le Dindromakus, il en a laissé tomber une. Je l’ai gardée… mais elle s’est éteinte.'),
        L('plumeau', 'Fais voir ! Toute grise… Le livre dit : « La plume se rallume pour <b>la plus grande championne du Royaume</b>, sous la pleine lune. »'),
        L('plumeau', 'La plus grande championne… c’est celle qui gagne la <b>Ligue des Légendes</b> ! Va voir Coach Ginette : elle en sait plus que moi.')]);
      J.ajouterObjet('plumeEteinte');
      toast('🪶 Tu as la <b>plume éteinte</b> du Dindromakus (dans ton sac).', { duree: 3400 });
      avancer();
      return;
    }
    if (s === 'pleineLune' && J.combien('plumeEteinte')) { await dialogue([L('plumeau', 'Le Comte Hibou connaît les secrets de la lune. Écoute-le bien : la plume a besoin de la <b>pleine lune</b>, sur la colline aux étoiles !')]); return monde.ouvrirLabo(); }
    if (s === 'celestia' || s === 'dindromakus') {
      await dialogue([L('plumeau', s === 'celestia' && !E().livre.attrapes.celestia ? 'Le livre dit que le Dindromakus naît d’une <b>Dindétoile</b> et de <b>Célestia Dindissima</b>. Célestia, c’est la légende du palais des nuages : demande à Aurélie Azur !'
        : 'Une Dindétoile, Célestia Dindissima et la plume arc-en-ciel, au nid du Couvoir… La plume fera venir la nuit de pleine lune. Je n’ose pas y croire !')]);
      return monde.ouvrirLabo();
    }
    if (s === 'grandeQuete' || s === 'mythique') {
      await dialogue([L('plumeau', s === 'mythique' && (objetLegendaire() || oeufLegendaire()) ? 'Un objet légendaire ! Au nid du Couvoir, mets les deux parents de la légende : le Grand Livre te dit lesquels (page des mythiques). Parfois, il faut aussi le bon moment !'
        : 'Le vieux livre dit : « Attrape l’épique d’une île, et son guide te contera sa légende. » Le Grand Dindon Coquelicot, tu l’as déjà ! Va voir Gaston, dans les Prés.')]);
      return monde.ouvrirLabo();
    }
    if (etapeAtteinte('capture1') && !e.quete.plumeauCapture && e.dindies.some(d => d.origine.startsWith('sauvage:'))) {
      e.quete.plumeauCapture = true;
      await dialogue([L('plumeau', 'Ho ho ! Une dindie sauvage ! Chaque nouvelle espèce attrapée te rapporte une prime de 50 pièces. C’est le règlement du Grand Livre !'),
        L('plumeau', 'Un conseil : les dindies rares ont besoin d’un équipement spécial. Les épiques, elles, sont liées à une vieille légende de leur région…')]);
    }
    return monde.ouvrirLabo();
  }
  if (id === 'mimi') {
    const besoin = { clous: 'clous', kit: 'kitPlanches', friandises: 'friandise', toile: 'toile', chapeau: 'chapeauSoleil', parapluie: 'parapluie', kitCouvoir: 'kitConstruction', kitNurserie: 'kitConstruction', kitEntrainement: 'kitConstruction' }[s] || (s === 'corde' ? 'toile' : EQUIPEMENTS.includes(s) ? s : null);
    if (besoin && !J.combien(besoin) && E().pieces < OBJETS[besoin].prix * (besoin === 'friandise' ? 2 : 1)) {
      await dialogue([L('mimi', `Oh, il te manque des pièces ? Ce n’est pas grave : je te l’offre ! Les amis des dindies sont mes amis.`)]);
      J.ajouterObjet(besoin, besoin === 'friandise' ? 2 : 1);
      evenement('achat', besoin);
      return;
    }
    if (!e.quete.mimiVue) { e.quete.mimiVue = true; await dialogue([L('mimi', 'Bonjour ! Moi c’est Mimi. Graines, friandises, outils… j’ai tout ce qu’il faut pour tes dindies !')]); }
    if (s === 'chapeau' && !e.quete.mimiChapeau) { e.quete.mimiChapeau = true; await dialogue([L('mimi', 'Le Maroc imaginaire ? Il y fait un soleil de plomb ! Il te faut absolument un <b>chapeau de soleil</b> 👒. J’en ai un pour toi !')]); }
    if ((s === 'kitCouvoir' || s === 'kitNurserie' || s === 'kitEntrainement') && !e.quete['mimi' + s]) { e.quete['mimi' + s] = true; await dialogue([L('mimi', 'Un kit de construction ? Planches, clous, peinture… et même un petit marteau ! Le voilà !')]); }
    if (EQUIPEMENTS.includes(s) && !e.quete['mimi' + s]) {
      e.quete['mimi' + s] = true;
      await dialogue([L('mimi', { jumelles: 'La Jungle ? Ses arbres sont si hauts ! Avec ces <b>jumelles</b> 🔭, tu verras jusqu’à la cime.', moufles: 'La Banquise ? Brrr ! Des <b>moufles</b> 🧤 bien chaudes, tricotées par ma grand-mère !',
        bottesLave: 'Le Volcan ? Ces <b>bottes de lave</b> 🥾 ne craignent pas la chaleur. Garanti sans brûlure !', lanterne: 'La Forêt de la Lune ? Il y fait si sombre… Cette <b>lanterne</b> 🏮 ne s’éteint jamais.',
        ailes: 'Le Royaume des Nuages ?! Avec ces <b>ailes de planeur</b> 🪁, tu voleras comme un oiseau !' }[s])]);
    }
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
    await dialogue([L('zephyr', ici === 'domaine' ? (s === 'decollage' ? 'Le vent est parfait aujourd’hui ! Direction les Prés ? Monte dans la nacelle, exploratrice !' : VOLS[s] && VOLS[s] !== 'pres' ? `Cap sur ${REGIONS[VOLS[s]].nom.replace(/^Le /, 'le ').replace(/^La /, 'la ')} ? Le vent est avec nous : monte dans la nacelle !` : 'Où allons-nous aujourd’hui, exploratrice ?')
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
    if (!etapeAtteinte('parlerGinette')) {
      await dialogue([L('ginette', 'Une, deux ! Une, deux ! Salut ! Je suis Coach Ginette. Le Dindodrome ouvre bientôt !'),
        L('ginette', 'Ici, les dindies font la course : vitesse ⚡, endurance 💪 et saut 🦘. Élève-les bien, et reviens me voir !')]);
      return;
    }
    if (s === 'parlerGinette') {
      await dialogue([L('ginette', 'Te voilà, Roullieee ! Une, deux ! Le grand jour est arrivé : <b>le Dindodrome rouvre</b> !'),
        L('ginette', 'Quatre championnats t’attendent pour commencer : la Coupe des Prés 🍀, des Dunes ☀️, de la Pluie 💧 et des Lianes 🌴. Chaque champion a son badge !'),
        L('ginette', 'Pour courir, une dindie doit être <b>adulte</b> et dans ton <b>équipe</b> 🎒. Allez, j’ouvre le portail !')]);
      e.batiments.dindodrome.ouvert = true;
      monde.ouvrirPortail && await monde.ouvrirPortail(true);
      avancer();
      await dialogue([L('ginette', 'Entre, et va voir Monsieur Chrono, le présentateur. Il t’inscrira à ta première course !')]);
      return;
    }
    if (s === 'parlerGinette2') {
      await dialogue([L('ginette', 'Une, deux ! Roullieee ! Tu as les 8 badges… alors la <b>Ligue des Légendes</b> t’ouvre ses portes !'),
        L('ginette', 'Quatre grands champions t’attendent au Dindodrome : <b>les Quatre Plumes</b>. La Baronne Plumeline, le Grand Dindini, Mamie Glouglou et le Capitaine Rapido !'),
        L('ginette', 'Il faut les battre tous les quatre, l’un après l’autre. Et ensuite… quelqu’un t’attend pour la grande finale. Tu devines qui ?'),
        L('moi', 'Gontran !'),
        L('ginette', 'Exactement ! Entraîne bien tes dindies : ce sont les courses les plus dures du Royaume. Une, deux !')]);
      avancer();
      return;
    }
    if (s === 'kitEntrainement' || s === 'reparerEntrainement') {
      await dialogue([L('ginette', 'Pour progresser, rien ne vaut l’entraînement ! Mais mon vieux <b>terrain d’entraînement</b> est en ruine…'),
        L('ginette', s === 'kitEntrainement' ? 'Mimi vend des <b>kits de construction</b> 🧰. Rapporte-m’en un, et on le répare ensemble !' : 'Tu as le kit ? Touche le terrain, juste à côté, pour le réparer !')]);
      return;
    }
    if (E().batiments.entrainement?.repare) {
      await dialogue([L('ginette', ['Une, deux ! Prête pour l’entraînement ?', 'Une dindie bien entraînée court plus vite, plus longtemps, et saute plus haut !', 'Les compétences, ça change tout dans une course. Viens prendre une leçon !'][Math.floor(Math.random() * 3)])]);
      monde.ouvrirEntrainement && monde.ouvrirEntrainement();
      return;
    }
    await dialogue([L('ginette', 'Le Dindodrome est ouvert ! Va courir, et reviens me voir !')]);
    return;
  }
  if (id === 'gontran') {
    if (etapeAtteinte('gontran1') && !etapeAtteinte('parlerPlumeau6')) { await dialogue([L('gontran', 'Je t’attends au Dindodrome, Roullieee ! Flamby et moi, on s’entraîne. Gloup gloup !')]); return; }
    const n = Object.keys(E().livre.attrapes).length;
    await dialogue([L('gontran', n >= 8 ? `Quoi ?! ${n} espèces dans ton Grand Livre ?! Bon… moi j’en ai… beaucoup aussi. Gloup gloup !` : 'Tu verras, Roullieee : ma dindie sera la plus rapide du Royaume ! Gloup gloup !')]);
    return;
  }
}

/* ── les guides des îles 4 à 8 : Tarzanette, Inuk, Madame Lava, le Comte Hibou, Aurélie Azur ── */
async function parlerGuide(id) {
  const s = E().quete.etape, r = ILE_DE_GUIDE[id], I = ILES[r];
  const Lg = t => Array.isArray(t) ? L(t[0], t[1]) : L(id, t);
  if (s === I.guide) { await dialogue(I.accueil.map(Lg)); avancer(); return; }
  if (s === r + '3') {
    const m = manquantes(r);
    await dialogue([L(id, `Il te manque : ${m.map(x => '<b>' + PAR_ID[x].nom + '</b>').join(', ')}.`), L(id, I.page[m.includes(BESOIN[r][2]) ? BESOIN[r][2] : m[0]] || I.bavard[0])]);
    return;
  }
  if (s === I.parler2) { await dialogue(I.legende.map(Lg)); avancer(); return; }
  if (s === I.etapeObjets) { await dialogue([L(id, I.objets(ramasses(I.objet)))]); return; }
  if (s === I.epique) { await dialogue(I.indice.map(Lg)); return; }
  if (id === 'hibou' && s === 'parlerHibou3') {
    await dialogue([L('hibou', 'Hou hou… Chère exploratrice, cette plume ! Je la reconnais : c’est une plume du <b>Dindromakus</b>. Elle brille encore un tout petit peu.'),
      L('hibou', 'Mes vieilles cartes du ciel le disent : une plume du Dindromakus se rallume <b>sous la pleine lune</b>, posée sur la <b>pierre de lune</b>, au milieu du cercle de la colline aux étoiles.'),
      L('hibou', pleineLune() ? 'Et justement… regardez le ciel : c’est la pleine lune, ce soir ! Allez vite sur la colline !' : `La prochaine pleine lune est dans <b>${joursAvantPleineLune()} jours</b>… Mais mon <b>grand télescope</b>, devant l’observatoire, sait l’attirer pour un moment. Hou hou !`)]);
    avancer();
    return;
  }
  if (id === 'hibou' && s === 'pleineLune') { await dialogue([L('hibou', pleineLune() ? 'La pleine lune brille ! Vite, la pierre de lune, sur la colline aux étoiles !' : 'Tournez mon grand télescope vers le ciel : la pleine lune viendra, pour un moment. Puis la pierre de lune !')]); return; }
  if (etapeAtteinte(I.apres)) cadeauDuJour(id, I.cadeau);
  await dialogue([L(id, I.bavard[Math.floor(Math.random() * I.bavard.length)])]);
}

/* ── au Dindodrome : Monsieur Chrono, les champions et Gontran ── */
async function parlerDindodrome(id) {
  const e = E(), s = e.quete.etape;
  if (id === 'chrono') {
    if (s === 'courseEssai') {
      await dialogue([L('chrono', 'Mesdames et messieurs… bienvenue au <b>Dindodrome</b> ! Je suis Monsieur Chrono, le présentateur !'),
        L('chrono', 'Une course, c’est simple : ta dindie court toute seule. Toi, tu l’aides !'),
        L('chrono', 'Quand une <b>haie</b> arrive, un anneau se resserre autour du bouton 🦘. Touche quand il devient <b>vert</b> : saut parfait ! Trop tôt… patatras ! (Et si tu ne touches rien, elle saute toute seule.)'),
        L('chrono', 'En bas, ses <b>compétences</b> : un coup de pouce, dès qu’elles sont prêtes. Et 🔥 <b>Fonce !</b> la fait aller plus vite… mais elle se fatigue plus : surveille sa barre 💪 !'),
        L('chrono', 'Pour la course d’essai, pas de pression : 300 mètres et deux haies. Choisis ta coureuse !')]);
      await monde.courir('essai');
      return;
    }
    if (/^coupe[1-8]$/.test(s) && !e.quete['chrono' + s]) {
      e.quete['chrono' + s] = true;
      const C = CHAMPIONNATS[+s.slice(5) - 1];
      await dialogue([L('chrono', `${C.badge.e} <b>${C.nom}</b> est ouverte ! Trois courses, puis la grande finale contre ${PERSONNAGES[C.champion].nom} !`),
        L('chrono', 'Les inscriptions, c’est au <b>Bureau des courses</b>, juste à côté. Bonne chance !')]);
    } else await dialogue([L('chrono', ['Les inscriptions sont ouvertes ! Le Bureau des courses est juste là.', 'Un record ? La Salle des trophées les garde tous !', 'Sur la piste de son type, une dindie court plus vite. Choisis bien ta coureuse !', 'Une dindie fatiguée ralentit. En 🔥 Fonce !, garde un œil sur sa barre 💪 !'][Math.floor(Math.random() * 4)])]);
    monde.ouvrirBureau && monde.ouvrirBureau();
    return;
  }
  if (id === 'gontran') {
    if (s === 'gontran1' || s === 'gontran2') {
      const re = s === 'gontran2';
      const choix = await dialogue([L('gontran', re ? 'Quatre badges ?! Bon… c’est pas mal. MAIS ! Flamby s’est entraîné jour et nuit. Je veux ma <b>revanche</b> !' : 'Ha ! Roullieee ! Le Badge Trèfle ? Un coup de chance ! Mon <b>Flamby</b> 🔥 est le plus rapide du Royaume !'),
        L('gontran', re ? 'Une course de haies, toi contre moi. Si tu gagnes, je… je t’applaudis. Promis !' : 'Une course de haies, toi contre moi. Tu as peur ? Gloup gloup !', [['oui', '🏁 C’est parti !'], ['non', '⏳ Plus tard']])]);
      if (choix !== 'oui') return;
      await monde.courir(s);
      return;
    }
    if (s === 'ligueGontran') {
      const choix = await dialogue([L('gontran', 'Roullieee… Tu as battu les Quatre Plumes. Toutes les quatre ! Bon. Alors c’est moi, ton dernier adversaire.'),
        L('gontran', 'Depuis notre toute première course, Flamby s’entraîne tous les jours. Il est devenu le Dindofeu le plus rapide du Royaume.'),
        L('gontran', 'La <b>grande finale de la Ligue</b> : 800 m, avec des haies. Que la meilleure gagne. (Ce sera moi. Gloup gloup !)', [['oui', '🏁 C’est parti !'], ['non', '⏳ Plus tard']])]);
      if (choix === 'oui') await monde.courir('ligueGontran');
      return;
    }
    if (etapeAtteinte('parlerHibou3')) { await dialogue([L('gontran', ['Grande championne… Ça te va bien, Roullieee. Mais je reviendrai ! Les Coupes des Maîtres, ça te dit ? Gloup gloup !', 'Flamby et moi, on court tous les matins. Un jour, on te battra. Peut-être. Gloup gloup !'][Math.floor(Math.random() * 2)])]); return; }
    if (etapeAtteinte('parlerPlumeau6')) { await dialogue([L('gontran', 'Tu es vraiment forte, Roullieee. Mais la prochaine fois… tu verras ! Gloup gloup !')]); return; }
    await dialogue([L('gontran', 'Flamby et moi, on s’entraîne. La prochaine fois, c’est nous qui gagnons !')]);
    return;
  }
  /* les Quatre Plumes */
  const Lp = LIGUE.find(x => x.plume === id);
  if (Lp) {
    const TP = {
      plumeline: ['Enchantée, très chère. Je suis la <b>Baronne Plumeline</b>. Ma Duchesse, une Dindopanthère, saute les haies avec une élégance… inégalable.', 'Quelle grâce ! Vous méritez votre place dans la Ligue, très chère.'],
      dindini: ['Abracadabra ! Je suis <b>le Grand Dindini</b> ! Sur la piste de Nuit, ma Dindogalaxie disparaît… et réapparaît devant tout le monde !', 'Incroyable ! Même la magie n’a rien pu faire contre toi. Abracadabra… bravo !'],
      mamie: ['Bonjour, ma petite ! <b>Mamie Glouglou</b>, pour te servir. Mon Pépère est un Dindodragon : il ne se fatigue jamais. Mille mètres, ça ne lui fait pas peur !', 'Bravo, ma chérie ! Tiens, un biscuit. Tu l’as bien mérité.'],
      rapido: ['<b>Capitaine Rapido</b>, le plus rapide du Royaume ! Ma Fusée, une Dindocomète, fait le sprint en un clin d’œil. Prête ?', 'Wouah ! Tu as battu Fusée ! Tu es plus rapide que l’éclair !']
    }[id];
    if (s === Lp.id) {
      const choix = await dialogue([L(id, TP[0]), L(id, `${SORTES_TXT[Lp.sorte]} Il faut <b>gagner</b> pour continuer la Ligue. On y va ?`, [['oui', '🏁 C’est parti !'], ['non', '⏳ Plus tard']])]);
      if (choix === 'oui') await monde.courir(Lp.id);
      return;
    }
    await dialogue([L(id, DD.ligueGagnee(Lp.id) ? TP[1] : TP[0])]);
    if (!DD.ligueGagnee(Lp.id) && etapeAtteinte(Lp.id)) await dialogue([L(id, 'Bats d’abord les autres membres de la Ligue, dans l’ordre. Je t’attends !')]);
    return;
  }
  /* les champions */
  const C = CHAMPIONNATS.find(x => x.champion === id);
  if (!C) return;
  const gagne = DD.badge(C.n);
  const T = {
    gaston: ['Salut l’exploratrice ! Au Dindodrome, je suis le champion des Prés 🍀. Ma Clochette (un Dindon Trèfle !) adore la piste des Prés…', 'Bravo pour le Badge Trèfle ! Mes dindies parlent encore de ta course !'],
    leila: ['Salam ! Sur la piste des Dunes ☀️, le sable ralentit tout le monde… sauf celles qui savent glisser ! Ma Sultane t’attend.', 'Le Badge Soleil te va bien ! Que les dunes te portent chance.'],
    waffel: ['Une fois ! La piste de Boue 💧, c’est la spécialité belge. Mon Speculoos est un vrai champion, sapristi !', 'Le Badge Goutte ! Tu mérites une gaufre, une fois !'],
    tarzanette: ['Ohééé ! Je suis Tarzanette, de la Jungle 🌴 ! Sur la piste des Lianes, il y a des troncs partout. Mon jaguar Moustique saute comme personne !', etapeAtteinte('tarzanette') ? 'Le Badge Liane ! Et maintenant, tu connais ma Jungle. Ohééé !' : 'Le Badge Liane ! Un jour, viens voir la Jungle, l’exploratrice !'],
    inuk: ['Bienvenue sur la piste de Glace ❄️ ! Ici, on glisse… Ma Banquisette, un Dindocristal, connaît chaque virage par cœur.', 'Le Badge Flocon ! Tu glisses comme une vraie fille du Grand Nord.'],
    lava: ['Par mes braises ! La piste de Lave 🔥 est brûlante ! Mon Volcanix, un Dindomagma, adore la chaleur.', 'Le Badge Braise ! Tu as le feu sacré, petite !'],
    hibou: ['Hou hou ! La piste de Nuit 🌙 est sombre et pleine de champignons. Ma Minuit, une Dindétoile, y voit comme en plein jour.', 'Le Badge Lune ! Une performance… astronomique. Hou hou !'],
    azur: ['Paré au décollage ! La piste des Nuages ☁️ est la plus haute du Royaume. Mon Tonnerre, un Dindorage, court plus vite que le vent !', 'Le Badge Nuage ! Tu es la reine du ciel, Roullieee !']
  }[id];
  if (!gagne && s === 'coupe' + C.n) await dialogue([L(id, T[0]), L(id, DD.finaleOuverte(C.n) ? 'Tu as fini les 3 courses ? Alors on se retrouve <b>en finale</b> ! Inscris-toi au Bureau.' : 'D’abord, monte sur le podium des 3 courses de la Coupe. Je t’attends en finale !')]);
  else await dialogue([L(id, gagne ? T[1] : T[0])]);
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
    const I = Object.values(ILES).find(x => o.startsWith(x.objet));
    if (I) { J.ajouterObjet(I.objet); const n = ramasses(I.objet); toast(`${OBJETS[I.objet].e} ${OBJETS[I.objet].nom} ! (${n}/3)`); J.changer('quete'); if (n >= 3 && s === I.etapeObjets) { await dialogue([L('moi', I.trouve)]); avancer(); } }
    else GQ.ramasser(o);
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
  if (id === 'entrainement' && s === 'reparerEntrainement') {
    if (!J.retirerObjet('kitConstruction')) { toast('Il faut un kit de construction ! Mimi en vend.'); return true; }
    e.batiments.entrainement.repare = true;
    await monde.reparerAnime('entrainement');
    toast('🔨 Le terrain d’entraînement est réparé !');
    avancer();
    await dialogue([L('ginette', 'Magnifique ! Une, deux ! Voici mes <b>3 jeux d’entraînement</b> : un pour la vitesse ⚡, un pour l’endurance 💪, un pour le saut 🦘. Essaie-les tous !')]);
    return false;     /* on ouvre ensuite le terrain */
  }
  if (id === 'deco-jardin') { toast(GQ.grandeOuverte('jardin') ? '🌸 Le jardin oublié… Gaston connaît sa légende !' : '🌸 Un jardin oublié, envahi de fleurs… Une grande quête t’y attendra un jour !', { duree: 3600 }); return true; }
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
  if (id === 'telescope') {
    if (!etapeAtteinte('parlerHibou3')) { toast('🔭 Le grand télescope du Comte Hibou. On y voit des milliers d’étoiles !'); return false; }
    if (pleineLune() && estNuit()) { toast('🌕 C’est déjà la pleine lune ! Elle brille au-dessus de la colline aux étoiles.'); return false; }
    forcerHeure(23, DIX_MINUTES); forcerPleineLune(DIX_MINUTES);
    toast('🔭 Tu tournes le grand télescope vers le ciel… <b>La nuit tombe, et la pleine lune se lève</b>, pour 10 minutes !', { duree: 4000, classe: 'grand' });
    J.changer('quete');
    return true;
  }
  if (id === 'autel') {
    if (s !== 'pleineLune' || !J.combien('plumeEteinte')) { toast('🌕 La pierre de lune : elle est douce et toute froide.'); return false; }
    if (!pleineLune() || !estNuit()) { toast('🌕 La pierre de lune attend la pleine lune… (le grand télescope du Comte Hibou peut la faire venir !)', { duree: 3600 }); return false; }
    J.retirerObjet('plumeEteinte'); J.ajouterObjet('plumeArcEnCiel'); tada();
    await dialogue([L('moi', 'Je pose la plume sur la pierre de lune… Oh ! Elle brille ! Rouge, orange, jaune, vert, bleu, violet… Elle est toute arc-en-ciel !'),
      L('hibou', '(le Comte Hibou arrive, essoufflé) Hou hou ! La plume arc-en-ciel ! Avec une <b>Dindétoile</b> et <b>Célestia Dindissima</b>, au nid du Couvoir, elle fera venir une nuit de pleine lune… et le Dindromakus !')]);
    avancer();
    return true;
  }
  if (id === 'baton' || id === 'tambour') {
    const r = id === 'baton' ? 'jungle' : 'nuages';
    if (meteo(r) === 'pluie') { toast('🌧️ Il pleut déjà ! Écoute les gouttes…'); return false; }
    forcerMeteo(r, 'pluie', DIX_MINUTES);
    toast(id === 'baton' ? '🎋 Tu secoues le bâton de pluie… <b>Chhhh… la pluie tombe sur la Jungle</b>, pour 10 minutes !' : '🥁 BOUM, BOUM ! <b>L’orage gronde sur le Royaume des Nuages</b>, pour 10 minutes !', { duree: 3600, classe: 'grand' });
    return true;
  }
  if (id === 'cor') {
    if (estMatin()) { toast('📯 C’est déjà le matin : la glace brille au soleil.'); return false; }
    forcerHeure(8, DIX_MINUTES); toast('📯 Tu souffles dans le cor… <b>Le soleil se lève sur la Banquise</b>, pour 10 minutes !', { duree: 3600, classe: 'grand' });
    return true;
  }
  if (id === 'sablierLave' || id === 'boite') {
    if (estNuit()) { toast(id === 'boite' ? '🎵 Il fait déjà nuit. Les lucioles dansent…' : '⏳ Il fait déjà nuit. Le cratère brille dans le noir…'); return false; }
    forcerHeure(22, DIX_MINUTES);
    toast(id === 'boite' ? '🎵 La boîte à musique joue sa berceuse… <b>La nuit tombe sur la Forêt</b>, pour 10 minutes !' : '⏳ Tu retournes le sablier de lave… <b>La nuit tombe sur le Volcan</b>, pour 10 minutes !', { duree: 3600, classe: 'grand' });
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
  /* les compteurs des défis du jour */
  if (type === 'capture') compter('captures');
  if (type === 'nourrir') compter('nourries');
  if (type === 'arrivee' && REGIONS[valeur]) compter('voyages');
  if (type === 'achat') {
    if ((s === 'clous' && valeur === 'clous') || (s === 'kit' && valeur === 'kitPlanches') || (s === 'friandises' && valeur === 'friandise') || (s === 'chapeau' && valeur === 'chapeauSoleil') || (s === 'parapluie' && valeur === 'parapluie') || (EQUIPEMENTS.includes(s) && valeur === s)) avancer();
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
  if (type === 'achat' && valeur === 'kitConstruction' && (s === 'kitCouvoir' || s === 'kitNurserie' || s === 'kitEntrainement')) avancer();
  if (type === 'oeufPose' && s === 'oeufTuto' && valeur.origine === 'tutoriel') avancer();
  if (type === 'eclosion' && s === 'mythique' && PAR_ID[valeur.dindie.espece].rarete === 'mythique') avancer();
  if (type === 'eclosion' && s === 'dindromakus' && valeur.dindie.espece === 'ruuulius') avancer();
  if (type === 'eclosion') {
    if (s === 'eclosion' && valeur.oeuf.origine === 'tutoriel') { avancer(); setTimeout(() => dialogue([L('moi', 'Un poussin ! Il lui faudrait un endroit douillet pour grandir… La Nurserie, à côté du Couvoir, est en ruine. Encore un kit !')]), 1200); }
    if (s === 'oeufCroise' && valeur.oeuf.origine === 'croisement' && ['croisement', 'recette'].includes(PAR_ID[valeur.oeuf.espece].origine.sorte)) avancer();
  }
  if (type === 'grandir' && s === 'grandir' && valeur.stade !== 'poussin') avancer();
  if (type === 'croisement' && s === 'nid' && ['croisement', 'recette'].includes(PAR_ID[valeur.espece].origine.sorte)) avancer();
  if (type === 'eveil' && s === 'eveil') avancer();
  if (type === 'course' || type === 'entrainement' || type === 'lecon') evenementCourse(type, valeur);
  if (type === 'arrivee') {
    if ((VOLS[s] && VOLS[s] === valeur) || (s === 'entrerDindodrome' && valeur === 'dindodrome')) avancer();
    preparerEtape();
  }
  if (type === 'capture') {
    if (s === 'capture1') avancer();
    const s2 = E().quete.etape;
    if (ilePage(s2) && !manquantes(ilePage(s2)).length) avancer();
    if (['coquelicot', 'dingue', 'atomium', ...Object.values(ILES).map(I => I.epique)].includes(s2) && valeur === s2) avancer();
    J.changer('quete');
  }
}
/* ── les courses, l'entraînement, les leçons ── */
export function evenementCourse(type, v) {
  const e = E(), s = e.quete.etape;
  if (type === 'course') {
    if (s === 'courseEssai' && v.id === 'essai') {
      avancer();
      setTimeout(() => dialogue([L('chrono', `${v.place === 1 ? 'Victoire pour ta première course ! Quelle entrée !' : 'Bravo pour ta première course !'} Le public est ravi !`),
        L('chrono', 'Pour gagner les championnats, il faudra des dindies bien entraînées. Coach Ginette a un <b>terrain d’entraînement</b> au Domaine… mais il est en ruine.'),
        L('chrono', 'Un <b>kit de construction</b> de chez Mimi, et le tour est joué ! Reviens vite au Dindodrome !')]), 500);
    }
    if ((s === 'gontran1' || s === 'gontran2') && v.id === s) {
      if (v.place < v.placeRival) {
        avancer();
        setTimeout(() => dialogue([L('gontran', s === 'gontran2' ? 'Encore toi devant ?! Bon… bravo, Roullieee. Tu es vraiment une championne. (Mais je reviendrai !) Gloup gloup.' : 'Quoi ?! Flamby… battu ?! Hmpf. La prochaine fois, je gagne. Gloup gloup !'),
          L('moi', s === 'gontran2' ? 'Merci, Gontran ! Flamby a très bien couru, lui aussi.' : 'Bien couru, Gontran ! À la prochaine !')]), 500);
      } else setTimeout(() => dialogue([L('gontran', 'Ha ha ! Flamby est le plus rapide ! Reviens quand tu veux… si tu oses ! Gloup gloup !')]), 500);
    }
    if (LIGUE_ETAPE[s] && v.id === s && DD.ligueGagnee(s)) {
      const Lp = LIGUE_ETAPE[s];
      avancer();
      if (s === 'ligueGontran') setTimeout(() => dialogue([L('gontran', 'Tu as… gagné. Bravo, Roullieee. Tu es la meilleure. Vraiment. Et… merci. Grâce à toi, Flamby et moi, on est devenus bien plus forts.'),
        L('chrono', 'Mesdames et messieurs… <b>Roullieee est la grande championne de la Ligue des Légendes</b> ! 👑'),
        L('moi', 'Oh ! Dans mon sac… la plume ! Elle brille un tout petit peu !'),
        L('chrono', 'Une plume du Dindromakus ?! Le Comte Hibou, l’astronome de la Forêt de la Lune, connaît sa légende. Va le voir !')]), 600);
      else setTimeout(() => dialogue([L(Lp.plume, `Bravo, Roullieee ! Tu as battu ${DD.LIGUE_NOMS[Lp.plume]} !`), L('chrono', s === 'ligue4' ? 'Les Quatre Plumes sont battues ! Il ne reste plus que… la grande finale. Gontran t’attend !' : 'La Ligue continue ! La prochaine Plume t’attend devant le portail.')]), 600);
    }
    const m = /^coupe([1-8])$/.exec(s);
    if (m && DD.badge(+m[1])) {
      const C = CHAMPIONNATS[+m[1] - 1];
      avancer();
      const suite = { 5: 'Le Professeur Plumeau te cherchait, je crois… Il a une nouvelle mission pour toi !',
        6: 'Mon vieil ami le <b>Comte Hibou</b> voudrait te rencontrer, dans la <b>Forêt de la Lune</b>. Il y fait sombre : achète une <b>lanterne</b> 🏮 chez Mimi !',
        7: 'Le Professeur Plumeau a regardé dans mon télescope… Il a quelque chose à vous montrer. Hou hou !',
        8: 'Le Professeur Plumeau t’attend au Labo. Il avait l’air tout excité !' }[m[1]];
      setTimeout(() => dialogue([L(C.champion, `Bravo, Roullieee ! Tu as gagné <b>${C.badge.nom}</b> ${C.badge.e} ! C’était une course magnifique.`), ...(suite ? [L(C.champion, suite)] : [])]), 500);
    }
  }
  if (type === 'entrainement') {
    e.quete.jeux = [...new Set([...(e.quete.jeux || []), v.stat])];
    J.changer('quete');
    if (s === 'entrainement3' && e.quete.jeux.length >= 3) avancer();
  }
  if (type === 'lecon' && s === 'lecon') avancer();
}
export const etapeActuelle = () => E().quete.etape;
/* ── la fin de l'histoire : tout le monde est là pour le Dindromakus ── */
export async function dialoguesFin() {
  await dialogue([L('moi', 'Il est là… Le Dindromakus RUUULIUSSS Maximus ! Comme la nuit où tout a commencé !'),
    L('plumeau', 'Le plus grand mystère du Royaume… né au Domaine des Dindies ! Roullieee, tu as réussi l’impossible.'),
    L('gontran', 'Wouah… Bon, d’accord : tu es la plus grande éleveuse de dindies du Royaume. Je le dis. Une fois. Gloup gloup !'),
    L('mimi', 'Le Domaine n’a jamais été aussi beau ! Et toutes ces dindies… quelle famille !'),
    L('zephyr', 'Ahoy ! Huit îles, mille aventures… Ma montgolfière n’a jamais autant volé !'),
    L('ginette', 'Une, deux ! La meilleure élève que j’aie jamais eue !'),
    L('plumeau', 'Le Grand Livre est presque plein… Et le Royaume a encore plein de surprises pour toi. Merci, Roullieee !')]);
}
/* au Domaine, sous l'histoire : la quête du Domaine en cours (une petite ligne dans le bandeau) */
export const texteDomaine = () => E().quete.etape !== 'fin' && QD.active() && lieuActuel() === 'domaine' ? `<span class="qd">🏡 ${QD.texte('domaine')}</span>` : '';
/* les étapes qui dépendent de l'état du jeu (appelé quand quelque chose change) */
export function verifierEtat() {
  const e = E(), s = e.quete.etape;
  if (s === 'serre' && e.enclos.jungle?.construit) {
    avancer();
    setTimeout(() => dialogue([L('plumeau', '(le Professeur arrive en courant) Une Serre ! Tes dindies 🌴 Jungle vont adorer. Oh, et une carte postale est arrivée… de la <b>Banquise</b> !'),
      L('plumeau', 'C’est <b>Inuk</b> : « Viens nous voir ! Mais couvre-toi bien ! » Il te faut des <b>moufles</b> 🧤 : Mimi en a.')]), 1200);
  }
  if (s === 'grandeQuete' && GQ.nbFinies() > 0) avancer();
  if (s === 'mythique' && mythiqueNee()) avancer();
  if (s === 'celestia' && e.livre.attrapes.celestia) avancer();
  if (s === 'dindromakus' && e.livre.attrapes.ruuulius) avancer();
}
