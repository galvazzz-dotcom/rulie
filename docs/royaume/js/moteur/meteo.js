/* La météo de chaque région : elle change toutes les heures, calculée d'après la date
   (la même pour tout le monde). Un gadget peut la forcer un moment (le nuage en bouteille). */
import { REGIONS } from '../donnees/regions.js';
import { hasard } from './couleurs.js';

export const METEOS = {
  soleil: { e: '☀️', nom: 'Grand soleil' },
  nuages: { e: '⛅', nom: 'Nuageux' },
  pluie: { e: '🌧️', nom: 'Pluie' },
  neige: { e: '❄️', nom: 'Neige' }
};
const forcees = {};
export function forcerMeteo(region, type, ms) { forcees[region] = { type, fin: Date.now() + ms }; }
export const meteoForcee = region => (forcees[region] && Date.now() < forcees[region].fin ? forcees[region] : null);
export function meteo(region, d = new Date()) {
  const f = meteoForcee(region); if (f) return f.type;
  const R = REGIONS[region]; if (!R || !R.meteo) return 'soleil';
  const r = hasard(`meteo-${region}-${d.getFullYear()}-${d.getMonth()}-${d.getDate()}-${d.getHours()}`)();
  const tot = Object.values(R.meteo).reduce((a, b) => a + b, 0);
  let acc = 0;
  for (const [t, p] of Object.entries(R.meteo)) { acc += p / tot; if (r < acc) return t; }
  return 'soleil';
}
