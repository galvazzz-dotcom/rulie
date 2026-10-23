/* Le Royaume des Dindies — démarrage : l'écran titre, puis le Domaine.
   (Le Grand Défilé de l'étape 1 est sur defile.html.) */
import { renderer, qualite, regler } from './moteur/rendu.js';
import { ecranTitre } from './scenes/titre.js';
import { demarrerJeu } from './scenes/jeu.js';

window.__rendu = { renderer, qualite, regler };   /* pour les tests automatiques */
document.getElementById('chargement')?.remove();
ecranTitre({
  surJouer: (idProfil, etat) => {
    document.body.classList.add('enJeu');
    demarrerJeu({ idProfil, etat, changerProfil: () => location.reload() });
  }
});
