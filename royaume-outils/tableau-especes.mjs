/* Régénère le tableau des 72 espèces dans PLAN-royaume-des-dindies.md
   à partir de docs/royaume/js/donnees/especes.js (qui fait foi).
   Usage : node royaume-outils/tableau-especes.mjs */
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
const ici = dirname(fileURLToPath(import.meta.url)), racine = join(ici, '..');
const { ESPECES, PAR_ID } = await import(join(racine, 'docs/royaume/js/donnees/especes.js'));
const { TYPES, RARETES } = await import(join(racine, 'docs/royaume/js/donnees/types.js'));
const REGIONS = { pres: 'les Prés', maroc: 'le Maroc imaginaire', belgique: 'la Belgique', jungle: 'la Jungle', banquise: 'la Banquise', volcan: 'le Volcan', foret: 'la Forêt de la Lune', nuages: 'le Royaume des Nuages' };
const PASTILLE = { commune: '⚪', rare: '🔵', epique: '🟣', mythique: '🌈' };
const types = l => l.map(t => TYPES[t].e + ' ' + TYPES[t].nom).join(' / ');
const origine = o => {
  if (o.sorte === 'sauvage') return 'sauvage, ' + REGIONS[o.region];
  if (o.sorte === 'croisement') return `croisement ${TYPES[o.types[0]].e} × ${TYPES[o.types[1]].e}`;
  if (o.sorte === 'recette') return `recette : ${PAR_ID[o.especes[0]].nom} × ${PAR_ID[o.especes[1]].nom}`;
  return `${PAR_ID[o.especes[0]].nom} × ${PAR_ID[o.especes[1]].nom} + ${o.objet} (quête « ${o.quete} »${o.condition ? ', ' + o.condition : ''})`;
};
const lignes = ['| N° | Espèce | Rareté | Type | Comment l’obtenir | ⚡ 💪 🦘 | Cri |', '|---|---|---|---|---|---|---|',
  ...ESPECES.map(e => `| ${e.n} | **${e.nom}** | ${PASTILLE[e.rarete]} ${RARETES[e.rarete].nom} | ${types(e.types)} | ${origine(e.origine)} | ${e.stats.join(' · ')} | ${e.cri} |`)];
const f = join(racine, 'PLAN-royaume-des-dindies.md'), s = readFileSync(f, 'utf8');
const a = '<!-- TABLEAU-ESPECES:DEBUT -->', b = '<!-- TABLEAU-ESPECES:FIN -->';
writeFileSync(f, s.slice(0, s.indexOf(a) + a.length) + '\n' + lignes.join('\n') + '\n' + s.slice(s.indexOf(b)));
console.log('tableau régénéré :', ESPECES.length, 'espèces');
