/* ══════════ LE CARNET D'ASTUCES (étape 9) ══════════
   Tout ce qu'il faut savoir pour jouer, en phrases courtes, avec un bouton 🔊 qui lit à voix haute.
   Les pages s'ouvrent au fil de l'histoire (on ne gâche pas la surprise). La première fois qu'on ouvre
   un lieu (le Couvoir, le Bureau des missions…), son astuce s'affiche en haut de la fenêtre, une seule fois. */
import { fenetre, toast, $, $$ } from '../moteur/ui.js';
import { pop } from '../moteur/sons.js';
import { lire, dire } from '../moteur/voix.js';
import * as J from '../jeu/etat.js';
import * as S from '../jeu/scenario.js';
import * as PR from '../jeu/production.js';
import * as DF from '../jeu/defis.js';

const chap = n => S.chapitreActuel() >= n;
export const ASTUCES = [
  { id: 'marcher', e: '🚶', titre: 'Se déplacer', ouvert: () => true, texte: [
    'Touche le sol : Roullieee y va toute seule. Tu peux aussi glisser le doigt sur le joystick, ou utiliser les flèches du clavier.',
    'Touche un personnage, un bâtiment ou une dindie pour agir. Le grand bouton vert, en bas à droite, fait la même chose.',
    'Pince l’écran (ou tourne la molette) pour voir de plus près ou de plus loin.'] },
  { id: 'quete', e: '📜', titre: 'Les quêtes', ouvert: () => true, texte: [
    'La bulle en haut dit ce qu’il faut faire. Touche-la pour ouvrir le Journal.',
    'La flèche jaune au bord de l’écran montre le chemin, et l’étoile ⭐ de la carte 🗺️ marque l’endroit.',
    'Perdu ? Va parler au Professeur Plumeau, au Labo : il sait toujours quoi faire.'] },
  { id: 'capture', e: '🥅', titre: 'Attraper une dindie', ouvert: () => chap(2), texte: [
    'Approche-toi d’une dindie sauvage et touche-la.',
    'Donne-lui des friandises : sa confiance monte. Sa friandise préférée marche encore mieux !',
    'Lance le filet quand le cercle blanc est dans la zone verte. Plus elle a confiance, plus la zone est grande.',
    'Tu as 3 essais. Si elle s’enfuit, elle reviendra plus tard.'] },
  { id: 'talents', e: '⭐', titre: 'Les talents et les doubles', ouvert: () => chap(2), texte: [
    'Chaque dindie a ses talents : de 0 à 5 étoiles en vitesse ⚡, en endurance 💪 et en saut 🦘. Deux dindies de la même espèce ne sont jamais pareilles !',
    'Quand tu attrapes une espèce que tu as déjà, la carte te dit si la nouvelle est plus douée que ta meilleure.',
    'Au Labo, le Professeur peut étudier un double : il le rend à la nature, et ta meilleure dindie de l’espèce gagne de l’expérience, et parfois une étoile de talent.'] },
  { id: 'iles', e: '🎈', titre: 'Les îles et la météo', ouvert: () => chap(2), texte: [
    'La montgolfière t’emmène sur les îles. Chaque île a ses dindies, son guide et son équipement.',
    'Certaines dindies ne sortent que la nuit, sous la pluie ou au soleil : lis les indices du Grand Livre 📖.',
    'Chaque jour, les îles cachent des coffres 🧰, et parfois un œuf mystère 🥚 ou une pierre d’éveil 💎.'] },
  { id: 'couvoir', e: '🥚', titre: 'Le Couvoir et les croisements', ouvert: () => chap(3), texte: [
    'Mets deux dindies adultes dans le nid : elles te donnent un œuf.',
    'Deux types différents peuvent donner une dindie hybride, par exemple 🌿 Prairie et 🏜️ Sable. Certaines recettes demandent deux espèces bien précises.',
    'L’œuf couve en vrai, même quand le jeu est fermé. Le sablier ⏳ fait gagner du temps.'] },
  { id: 'grandir', e: '🐣', titre: 'Grandir et s’éveiller', ouvert: () => chap(3), texte: [
    'Les poussins grandissent à la Nurserie. Chaque repas les fait grandir plus vite.',
    'Les dindies gagnent de l’expérience avec les friandises, les courses, l’entraînement et les biscuits de champion 🍘.',
    'Au niveau 20, avec une pierre d’éveil 💎, le Labo peut éveiller une dindie : + 1 à chaque stat, et une toute nouvelle allure.'] },
  { id: 'courses', e: '🏁', titre: 'Les courses', ouvert: () => chap(4), texte: [
    'Au Dindodrome, choisis ta coureuse, puis cours contre 5 dindies.',
    'Avant une haie, touche 🦘 quand l’anneau devient jaune : c’est un saut parfait. Trop tôt, et c’est la chute !',
    'Les boutons de compétences ont une recharge. « 🔥 Fonce ! » va plus vite, mais fatigue.',
    'Sur la piste de son type, une dindie va un peu plus vite. Le bouton ⏩ fait passer la course en accéléré.'] },
  { id: 'entrainement', e: '🏋️', titre: 'L’entraînement', ouvert: () => chap(4), texte: [
    'Coach Ginette a 3 mini-jeux, un pour chaque stat. Chaque partie donne des points d’entraînement et de l’expérience.',
    'Elle apprend aussi des compétences de course, contre quelques pièces.'] },
  { id: 'production', e: '🌽', titre: 'Le Potager, le Moulin et l’Atelier', ouvert: () => PR.productionOuverte(), texte: [
    'Au Potager, sème des graines et arrose-les : elles poussent en vrai temps.',
    'Au Moulin, les récoltes deviennent des friandises : pour l’entraînement, les captures et les œufs.',
    'Les dindies laissent des plumes dans les enclos : l’Atelier en fait des chapeaux et des décorations. Le bouton 🎨 sert à décorer le Domaine.'] },
  { id: 'missions', e: '🚀', titre: 'Les missions', ouvert: () => PR.productionOuverte(), texte: [
    'Au Bureau des missions, envoie 1 à 3 dindies en voyage. Elles reviennent avec des pièces, des plumes, et parfois une surprise.',
    'Leur chance de réussir dépend de leurs stats et de leur type.'] },
  { id: 'defis', e: '📅', titre: 'Les défis et les succès', ouvert: () => DF.ouverts(), texte: [
    'Chaque jour, 3 défis ; chaque semaine, 3 autres. Réclame leurs récompenses au Panneau des quêtes, sur la place du Domaine.',
    'Les 100 succès récompensent tout ce que tu fais, avec des plumes d’or 🪶.'] },
  { id: 'confort', e: '🧸', titre: 'Le mode aide et le confort', ouvert: () => true, texte: [
    'Dans la Maison 🏠 : le mode aide rend la capture et les courses plus faciles, et les minuteurs vont deux fois plus vite.',
    'La voix peut lire les dialogues et les messages. Tu peux aussi agrandir les textes, calmer les animations, ou choisir des couleurs plus faciles à distinguer.'] }
];
export const PAR_ID_ASTUCE = Object.fromEntries(ASTUCES.map(a => [a.id, a]));
const vues = () => J.etat().astuces || (J.etat().astuces = {});
export const dejaVue = id => !!vues()[id];
const marquer = id => { vues()[id] = Date.now(); J.changer('astuces'); };

/* une astuce, une seule fois : en haut de la fenêtre qui vient de s'ouvrir (ou en message s'il n'y a pas de fenêtre) */
export function astuce(id, F = null) {
  const A = PAR_ID_ASTUCE[id]; if (!A || dejaVue(id)) return false;
  marquer(id);
  const texte = A.texte.slice(0, 2).join(' ');
  if (!F) { toast(`💡 <b>${A.titre}</b> : ${texte}`, { duree: 7000, classe: 'grand astuceToast' }); dire(texte); return true; }
  const B = document.createElement('div');
  B.className = 'astuceBoite';
  B.innerHTML = `<span class="em">💡</span><div><b>Astuce : ${A.titre}</b><p>${texte}</p>
    <div class="ligneBtn"><button class="btn petit" data-astuce="ok">👍 Compris !</button><button class="btn petit jaune" data-astuce="plus">📖 Le carnet</button><button class="btn petit ecouter" data-astuce="lire" aria-label="Lire à voix haute">🔊</button></div></div>`;
  /* au-dessus du contenu (qui se redessine), pour qu'elle reste jusqu'à ce qu'on la ferme */
  F.contenu.before(B);
  $$('[data-astuce]', B).forEach(b => b.onclick = ev => {
    ev.stopPropagation(); pop();
    if (b.dataset.astuce === 'lire') { lire(texte); return; }
    B.remove();
    if (b.dataset.astuce === 'plus') ouvrirAstuces(id);
  });
  dire(texte);
  return true;
}

/* le carnet : toutes les astuces ouvertes, chacune se déplie d'un toucher */
export function ouvrirAstuces(ouverte = null) {
  const L = ASTUCES.filter(a => a.ouvert()), caches = ASTUCES.length - L.length;
  const F = fenetre('💡 Le carnet d’astuces', `<p class="petitTexte">Touche une astuce pour la lire. Le bouton 🔊 la lit à voix haute.</p>
    ${L.map(a => `<details class="astuce" data-id="${a.id}" ${a.id === ouverte ? 'open' : ''}><summary><span class="em">${a.e}</span> ${a.titre}</summary>
      <ul>${a.texte.map(t => `<li>${t}</li>`).join('')}</ul><button class="btn petit ecouter" data-lire="${a.id}" aria-label="Lire à voix haute">🔊 Écouter</button></details>`).join('')}
    ${caches ? `<p class="petitTexte">🔒 ${caches} autre${caches > 1 ? 's' : ''} astuce${caches > 1 ? 's' : ''} t’attend${caches > 1 ? 'ent' : ''} plus loin dans l’aventure.</p>` : ''}`, { classe: 'astucesF' });
  $$('[data-lire]', F.el).forEach(b => b.onclick = () => { const a = PAR_ID_ASTUCE[b.dataset.lire]; lire(a.titre + '. ' + a.texte.join(' ')); });
  $$('details.astuce', F.el).forEach(d => d.addEventListener('toggle', () => { if (d.open) { pop(); marquer(d.dataset.id); } }));
  const o = ouverte && $(`details[data-id="${ouverte}"]`, F.el); if (o) setTimeout(() => o.scrollIntoView({ block: 'nearest' }), 50);
  return F;
}
