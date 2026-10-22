/* Les dindies débloquées (attrapées) : celles d'un profil, ou de tous les profils de l'appareil.
   Le défilé et l'écran titre ne montrent qu'elles (pas de « teaser » des espèces à découvrir). */
import * as SAUVE from '../moteur/sauvegarde.js';
import { ESPECES } from '../donnees/especes.js';

export function especesDe(idProfil) {
  const e = SAUVE.chargerProfil(idProfil);
  return new Set(e && e.livre ? Object.keys(e.livre.attrapes || {}) : []);
}
export function especesDeTous() {
  const s = new Set();
  for (const p of SAUVE.listeProfils()) for (const id of especesDe(p.id)) s.add(id);
  return s;
}
/* dans l'ordre du Grand Livre */
export const dansLOrdre = set => ESPECES.filter(e => set.has(e.id));
