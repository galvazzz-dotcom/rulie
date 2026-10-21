/* ══════════ LE CHAPITRE 1 : LE DOMAINE EN RUINE ══════════
   Une suite d'étapes (une seule à la fois, pour que ce soit clair) regroupées en quêtes.
   La scène appelle : parler(pnj), interagir(id), evenement(type, valeur) ;
   et lit : texteEtape(), cibleEtape() (pour la flèche qui guide). */
import { PAR_ID } from '../donnees/especes.js';
import { TYPES } from '../donnees/types.js';
import { PERSONNAGES, portraitChibi } from '../personnages/chibi.js';
import * as J from './etat.js';
import { nouvelleDindie, nomDe } from './individus.js';
import { OBJETS } from './objets.js';
import { dialogue, toast } from '../moteur/ui.js';
import { tada, pop } from '../moteur/sons.js';
import { CACHETTES } from '../monde/domaine.js';

export const STARTERS = ['paquerette', 'crachin', 'braise'];
export const QUETES = [
  { id: 'q1', titre: 'Bienvenue au Domaine', etapes: ['arrivee', 'choix'], recompense: { pieces: 300 } },
  { id: 'q2', titre: 'Un abri pour ta dindie', etapes: ['planches', 'reparer1', 'installer1'], recompense: { pieces: 100 } },
  { id: 'q3', titre: 'Le Clapier à dindes', etapes: ['cadeau', 'clous', 'reparerClapier', 'ranger'], recompense: { pieces: 100 } },
  { id: 'q4', titre: 'Un deuxième enclos', etapes: ['kit', 'reparer2'], recompense: { pieces: 100 } },
  { id: 'q5', titre: 'Les friandises de Mimi', etapes: ['friandises', 'nourrir'], recompense: { pieces: 150 } },
  { id: 'q6', titre: 'Le Grand Livre', etapes: ['musee', 'livre'], recompense: { pieces: 100, objets: { filet: 1 } } },
  { id: 'q7', titre: 'Cap sur les Prés !', etapes: ['zephyr', 'corde', 'toile', 'ballon'], recompense: { pieces: 200, objets: { billet: 1 } } }
];
const ORDRE = [...QUETES.flatMap(q => q.etapes), 'fin'];
export const queteDe = etape => QUETES.find(q => q.etapes.includes(etape));

const E = () => J.etat();
const qui = id => ({ nom: PERSONNAGES[id].nom, portrait: portraitChibi(PERSONNAGES[id], 'dlg' + id), couleur: PERSONNAGES[id].couleur });
const moi = () => ({ nom: 'Roullieee', portrait: portraitChibi(PERSONNAGES.roullieee, 'dlgmoi'), couleur: PERSONNAGES.roullieee.couleur });
const L = (id, texte, choix) => ({ qui: id === 'moi' ? moi() : qui(id), texte, choix });
const starter = () => E().dindies.find(d => STARTERS.includes(d.espece) && d.origine === 'premiere');
export const typeStarter = () => { const s = starter(); return s ? PAR_ID[s.espece].types[0] : 'prairie'; };
export const type2 = () => typeStarter() === 'prairie' ? 'pluie' : 'prairie';
const glouglou = () => E().dindies.find(d => d.origine === 'cadeau');
const habitat = t => TYPES[t].habitat;

/* ── le texte de l'étape (le bandeau en haut) et ce que montre la flèche ── */
export function texteEtape() {
  const e = E(), s = e.quete.etape;
  return ({
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
    fin: 'Chapitre 2 bientôt : l’expédition aux Prés ! 🎈'
  })[s] || '';
}
/* l'identifiant de l'objet interactif à montrer (ou une liste : le plus proche) */
export function cibleEtape() {
  const e = E(), s = e.quete.etape;
  if (s === 'planches') return ['planche1', 'planche2', 'planche3'].filter(p => !e.monde.ramasses[p]).map(p => 'objet-' + p);
  if (s === 'nourrir') {
    const pas = e.dindies.filter(d => !e.quete.nourries.includes(d.uid));
    return pas.map(d => d.lieu.startsWith('enclos:') ? 'enclos-' + d.lieu.slice(7) : d.lieu === 'clapier' ? 'clapier' : 'moi');
  }
  return ({
    arrivee: 'pnj-plumeau', choix: 'pnj-plumeau', reparer1: 'enclos-' + typeStarter(), installer1: 'enclos-' + typeStarter(), cadeau: 'pnj-plumeau',
    clous: 'pnj-mimi', reparerClapier: 'clapier', ranger: 'clapier', kit: 'pnj-mimi', reparer2: 'enclos-' + type2(), friandises: 'pnj-mimi',
    musee: 'musee', livre: 'pnj-plumeau', zephyr: 'pnj-zephyr', corde: 'objet-corde', toile: 'pnj-mimi', ballon: 'pnj-zephyr', fin: 'montgolfiere'
  })[s];
}

/* ── avancer d'une étape (et donner la récompense quand une quête se termine) ── */
let monde = null;   /* les fonctions de la scène : construire un enclos, réparer le Clapier, etc. */
export function brancher(m) { monde = m; preparerEtape(); }
function avancer() {
  const e = E(), i = ORDRE.indexOf(e.quete.etape), Q = queteDe(e.quete.etape), suivante = ORDRE[i + 1];
  if (Q && Q.etapes[Q.etapes.length - 1] === e.quete.etape) {
    e.quete.finies.push(Q.id);
    const r = Q.recompense || {};
    if (r.pieces) J.gagnerPieces(r.pieces);
    for (const [o, n] of Object.entries(r.objets || {})) J.ajouterObjet(o, n);
    tada();
    toast(`✅ Quête terminée : <b>${Q.titre}</b>` + (r.pieces ? `<br>+ ${r.pieces} 🪙` : '') + Object.keys(r.objets || {}).map(o => ` + ${OBJETS[o].e} ${OBJETS[o].nom}`).join(''), { duree: 3800, classe: 'grand' });
    const N = queteDe(suivante);
    if (N) setTimeout(() => toast(`📜 Nouvelle quête : <b>${N.titre}</b>`, { duree: 3200 }), 1400);
  }
  e.quete.etape = suivante; e.quete.compteur = 0;
  preparerEtape();
  J.changer('quete');
}
/* ce qu'il faut poser dans le monde pour l'étape (les planches, la corde) */
function preparerEtape() {
  if (!monde) return;
  const e = E(), s = e.quete.etape;
  if (s === 'planches') for (const p of ['planche1', 'planche2', 'planche3']) if (!e.monde.ramasses[p]) monde.poserObjet(p, 'planche', ...CACHETTES[p]);
  if (s === 'corde' && !e.monde.ramasses.corde) monde.poserObjet('corde', 'corde', ...CACHETTES.corde);
  if (['ballon', 'fin'].includes(s) || e.batiments.montgolfiere.reparee) monde.gonflerBallon(e.batiments.montgolfiere.reparee);
  if (s === 'fin') monde.montrerGontran(true);
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
    return monde.ouvrirLabo();
  }
  if (id === 'mimi') {
    const besoin = { clous: 'clous', kit: 'kitPlanches', friandises: 'friandise', toile: 'toile' }[s] || (s === 'corde' ? 'toile' : null);
    if (besoin && !J.combien(besoin) && E().pieces < OBJETS[besoin].prix * (besoin === 'friandise' ? 2 : 1)) {
      await dialogue([L('mimi', `Oh, il te manque des pièces ? Ce n’est pas grave : je te l’offre ! Les amis des dindies sont mes amis.`)]);
      J.ajouterObjet(besoin, besoin === 'friandise' ? 2 : 1);
      evenement('achat', besoin);
      return;
    }
    if (!e.quete.mimiVue) { e.quete.mimiVue = true; await dialogue([L('mimi', 'Bonjour ! Moi c’est Mimi. Graines, friandises, outils… j’ai tout ce qu’il faut pour tes dindies !')]); }
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
        L('zephyr', 'Ha ha ! Un rival ! Bon, le vent n’est pas encore bon pour partir. Garde ce billet, on part dès qu’il se lève !')]);
      e.quete.etape = 'ballon'; avancer();
      monde.finChapitre();
      return;
    }
    if (s === 'fin') { await dialogue([L('zephyr', 'Le vent se lève bientôt ! Prépare tes dindies : les Prés t’attendent au prochain chapitre.')]); return; }
    await dialogue([L('zephyr', 'Le ciel est bleu, le vent est doux… Un jour parfait pour voler ! Enfin, presque.')]);
    return;
  }
  if (id === 'ginette') {
    await dialogue([L('ginette', 'Une, deux ! Une, deux ! Salut ! Je suis Coach Ginette. Le Dindodrome ouvre bientôt !'),
      L('ginette', 'Ici, les dindies font la course : vitesse ⚡, endurance 💪 et saut 🦘. Élève-les bien, et reviens me voir !')]);
    return;
  }
  if (id === 'gontran') { await dialogue([L('gontran', 'Tu verras, Roullieee : ma dindie sera la plus rapide du Royaume ! Gloup gloup !')]); return; }
}

/* ── les autres interactions qui comptent pour les quêtes ── */
export async function interagir(id) {
  const e = E(), s = e.quete.etape;
  if (id.startsWith('objet-')) {
    const o = id.slice(6);
    e.monde.ramasses[o] = true; monde.retirerObjet(o); pop();
    if (o.startsWith('planche')) { J.ajouterObjet('planche'); e.quete.compteur = ['planche1', 'planche2', 'planche3'].filter(p => e.monde.ramasses[p]).length; toast(`🪵 Une planche ! (${e.quete.compteur}/3)`); J.changer('quete'); if (e.quete.compteur >= 3) avancer(); }
    if (o === 'corde') { J.ajouterObjet('corde'); toast('🪢 La grosse corde du Capitaine !'); if (s === 'corde') avancer(); if (E().quete.etape === 'toile' && J.combien('toile')) avancer(); }
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
  return false;
}
/* ── les évènements : achats, dindie installée, nourrie, Musée ouvert… ── */
export function evenement(type, valeur) {
  const e = E(), s = e.quete.etape;
  if (type === 'achat') {
    if ((s === 'clous' && valeur === 'clous') || (s === 'kit' && valeur === 'kitPlanches') || (s === 'friandises' && valeur === 'friandise')) avancer();
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
}
export const etapeActuelle = () => E().quete.etape;
