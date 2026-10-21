/* Le Royaume des Dindies — démarrage.
   Étape 1 : le jeu s'ouvre sur le Grand Défilé (la vitrine des 72 dindies). */
import { chaqueImage, renderer } from './moteur/rendu.js';
import { demarrerDefile } from './scenes/defile.js';

demarrerDefile();
window.__rendu = { renderer };   /* pour les tests automatiques */
/* on enlève l'écran de chargement après la première image */
let fait = false;
chaqueImage(() => {
  if (fait) return;
  fait = true;
  requestAnimationFrame(() => { document.getElementById('chargement').remove(); document.getElementById('ui').classList.remove('cache'); });
});
