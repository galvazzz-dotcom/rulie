/* ══════════ LES TROUVAILLES DU JOUR ══════════
   Dans chaque région, chaque jour : 3 coffres, parfois un œuf mystère, parfois une pierre d'éveil,
   cachés à des endroits tirés au sort d'après la date (les mêmes toute la journée). */
import { hasard } from '../moteur/couleurs.js';
import * as J from './etat.js';
import { OBJETS, friandisePreferee } from './objets.js';
import { REGIONS } from '../donnees/regions.js';

export const jour = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
function memoire() {
  const e = J.etat();
  if (!e.quotidien.trouvailles || e.quotidien.trouvailles.jour !== jour()) e.quotidien.trouvailles = { jour: jour(), pris: {} };
  return e.quotidien.trouvailles;
}
export function trouvaillesDuJour(region, cachettes) {
  const r = hasard(`trouvailles-${region}-${jour()}`), idx = cachettes.map((_, i) => i);
  for (let i = idx.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [idx[i], idx[j]] = [idx[j], idx[i]]; }
  const L = [0, 1, 2].map(k => ({ id: `coffre-${region}-${idx[k]}`, sorte: 'coffre', p: cachettes[idx[k]] }));
  if (r() < .6) L.push({ id: `oeuf-${region}-${idx[3]}`, sorte: 'oeuf', p: cachettes[idx[3]] });
  if (r() < .4) L.push({ id: `pierre-${region}-${idx[4]}`, sorte: 'pierre', p: cachettes[idx[4]] });
  const M = memoire();
  return L.filter(o => !M.pris[o.id]);
}
/* on ouvre / ramasse : la récompense, et le texte à montrer */
export function ramasser(o, region) {
  const M = memoire(); if (M.pris[o.id]) return null;
  M.pris[o.id] = true;
  if (o.sorte === 'oeuf') { J.ajouterObjet('oeufMystere'); return `🥚 Un <b>œuf mystère</b> ! Il est tout chaud… Il éclora au Couvoir.`; }
  if (o.sorte === 'pierre') { J.ajouterObjet('pierreEveil'); return `💎 Une <b>pierre d’éveil</b> ! Elle brille doucement…`; }
  const r = hasard(o.id + jour()), pieces = 25 + Math.floor(r() * 9) * 5;
  J.gagnerPieces(pieces);
  let t = `🧰 Un coffre ! <b>+ ${pieces} 🪙</b>`;
  const k = r();
  if (k < .1) { J.ajouterObjet('sablier'); t += ' et ⏳ un sablier'; }
  else if (k < .3) { J.ajouterObjet('friandise', 2); t += ' et 🍪 2 friandises'; }
  else if (k < .5) { const f = friandisePreferee(REGIONS[region].type); J.ajouterObjet(f, 2); t += ` et ${OBJETS[f].e} ${OBJETS[f].nom} × 2`; }
  return t;
}
