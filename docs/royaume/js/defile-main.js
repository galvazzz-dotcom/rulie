/* Le Grand Défilé (étape 1) : la vitrine des 72 dindies */
import { chaqueImage, renderer } from './moteur/rendu.js';
import { demarrerDefile } from './scenes/defile.js';

demarrerDefile();
window.__rendu = { renderer };   /* pour les tests automatiques */
let fait = false;
chaqueImage(() => {
  if (fait) return;
  fait = true;
  requestAnimationFrame(() => { document.getElementById('chargement').remove(); document.getElementById('ui').classList.remove('cache'); });
});
