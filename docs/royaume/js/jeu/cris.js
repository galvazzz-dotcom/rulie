/* ══════════ LE CRI DE CHAQUE DINDIE (étape 9) ══════════
   Le cri suit celui que le Grand Livre écrit pour son espèce (voir moteur/sons.js) ;
   les poussins crient plus aigu, les grandes dindies plus grave, et chacune a sa petite voix à elle. */
import { PAR_ID } from '../donnees/especes.js';
import { cri } from '../moteur/sons.js';

/* un petit nombre entre 0 et 1, toujours le même pour une même dindie */
const voixPropre = cle => { let h = 7; for (const c of String(cle)) h = (h * 31 + c.charCodeAt(0)) % 9973; return h / 9973; };
export function hauteurCri(espece, stade = 'adulte', cle = '') {
  const E = PAR_ID[espece]; if (!E) return 1;
  if (stade === 'poussin') return 1.55 + voixPropre(cle) * .15;
  if (stade === 'jeune') return 1.25 + voixPropre(cle) * .1;
  return 1.04 / Math.sqrt((E.adn.taille || 1) * (stade === 'eveille' ? 1.15 : 1)) * (.93 + voixPropre(cle) * .14);
}
/* x : une dindie de la partie ({ espece, stade, chroma, uid }), l'ADN d'un modèle 3D ({ id, stade, chroma }) ou un id d'espèce */
export function crier(x, { volume = 1, hauteur = 1 } = {}) {
  const espece = typeof x === 'string' ? x : x.espece || x.id, E = PAR_ID[espece];
  if (!E) return 0;
  const stade = typeof x === 'string' ? 'adulte' : x.stade || 'adulte';
  return cri(E.cri, { hauteur: hauteur * hauteurCri(espece, stade, x.uid || espece), type: E.types[0], rarete: E.rarete, chroma: !!x.chroma, volume });
}
