/* ══════════ L'ADN D'UNE DINDIE ══════════
   Tout ce qui décrit son apparence. Le modèle 3D (modele.js) et le
   portrait SVG (portrait.js) lisent exactement les mêmes valeurs.

   corps, aile, ventre, tete, queue, bande, caroncule : couleurs « #rrggbb »
   motifQueue   : uni | bandes | ocelles | belge | arc | flammes | etoiles
   motifCorps   : uni | pois | rayures | taches | gaufre | flocons | etoiles | eclairs | losanges
   couleurMotif : couleur du motif du corps
   crete        : aucune | touffe | punk | couronne | fleurs | cornes | flamme | antennes | etoile | cristaux
   couleurCrete : (facultatif) couleur de la crête
   chapeau      : null | fez | turban | toque | pirate | champignon
   accessoire   : null | echarpe | cape   (couleurAccessoire)
   yeux         : normaux | malins | hibou
   taille       : 1 = une dindie adulte normale
   aura         : null | '#rrggbb' | 'arc'
   + ce que calcule variante() : stade (poussin | jeune | adulte | eveille), chroma, fond (le type) */
import { assombrir, eclaircir, melanger, chromatique } from '../moteur/couleurs.js';
import { TYPES } from '../donnees/types.js';

const COULEURS = ['corps', 'aile', 'ventre', 'tete', 'queue', 'bande', 'couleurMotif', 'couleurCrete', 'couleurAccessoire'];
/* la couleur de la tête (la peau) quand l'espèce n'en donne pas : elle dépend du type */
const TETES = { prairie: '#9ec5f8', sable: '#f8d3b0', pluie: '#c7d7fe', jungle: '#fecaca', glace: '#d6f1ff', feu: '#fca5a5', nuit: '#c4b5fd', ciel: '#dbeafe' };

export function completer(adn) {
  const corps = adn.corps || '#8b5a2b';
  return {
    corps, aile: assombrir(corps, .25), ventre: eclaircir(corps, .35), tete: '#9ec5f8', queue: corps, bande: '#fde68a',
    motifQueue: 'bandes', motifCorps: 'uni', couleurMotif: assombrir(corps, .3), crete: 'aucune', couleurCrete: null,
    chapeau: null, accessoire: null, couleurAccessoire: '#ef4444', yeux: 'normaux', caroncule: '#ef4444', taille: 1, aura: null,
    ...adn
  };
}

/* l'ADN prêt à dessiner pour une espèce, à un stade, chromatique ou non */
export function variante(espece, { stade = 'adulte', chroma = false } = {}) {
  const a = completer({ tete: TETES[espece.types[0]], ...espece.adn });
  a.stade = stade; a.chroma = chroma; a.fond = espece.types[0]; a.id = espece.id;
  a.couleurType = TYPES[espece.types[0]].couleur;
  if (chroma) {
    for (const k of COULEURS) if (a[k]) a[k] = chromatique(a[k]);
    a.aura = a.aura === 'arc' ? 'arc' : '#fef08a';
  }
  if (stade === 'poussin') {
    /* tout rond et jaune, avec un peu de la couleur de l'espèce */
    a.corps = melanger(a.corps, '#fde68a', .72); a.aile = melanger(a.aile, '#fcd34d', .65); a.ventre = eclaircir(a.corps, .4);
    a.motifCorps = 'uni'; a.crete = 'aucune'; a.chapeau = null; a.accessoire = null; a.aura = chroma ? a.aura : null; a.taille *= .55;
  } else if (stade === 'jeune') {
    a.crete = a.crete === 'couronne' ? 'aucune' : a.crete; a.chapeau = null; a.aura = chroma ? a.aura : null; a.taille *= .78;
  } else if (stade === 'eveille') {
    a.taille *= 1.15;
    if (a.crete === 'aucune' && !a.chapeau) a.crete = 'touffe';
    a.aura = a.aura || a.couleurType;
    a.bande = eclaircir(a.bande, .12);
  }
  return a;
}

/* ce que la queue montre, selon le stade : nombre de plumes, longueur, ouverture */
export function formeQueue(a) {
  if (a.stade === 'poussin') return { n: 0, L: 0, w: 0 };
  if (a.stade === 'jeune') return { n: 7, L: .5, w: .17 };
  if (a.stade === 'eveille') return { n: 13, L: .92, w: .21 };
  return { n: 11, L: .78, w: .2 };
}
