/* ══════════ LES FÊTES DE L'ANNÉE (étape 8) ══════════
   Selon la vraie date : Halloween (du 18 octobre au 3 novembre), Noël (du 10 décembre au 6 janvier),
   Pâques (une semaine avant et après le dimanche de Pâques), la fête de l'été (juillet et août).
   Pendant une fête : les dindies de son type sortent deux fois plus, l'Atelier a 2 chapeaux et 2 décorations de fête
   (on ne peut les fabriquer que pendant la fête ; on les garde après), et le Domaine se décore. */
export const FETES = {
  halloween: { nom: 'Halloween', e: '🎃', type: 'nuit', couleurs: ['#f97316', '#7c3aed'],
    texte: 'Les dindies 🌙 Nuit sortent deux fois plus, et l’Atelier a des chapeaux et des décorations qui font (un peu) peur !' },
  noel: { nom: 'Noël', e: '🎄', type: 'glace', couleurs: ['#dc2626', '#16a34a'],
    texte: 'Les dindies ❄️ Glace sortent deux fois plus, et l’Atelier a un bonnet de Noël, des bois de renne et des cadeaux !' },
  paques: { nom: 'Pâques', e: '🥚', type: 'prairie', couleurs: ['#f9a8d4', '#86efac'],
    texte: 'Les dindies 🌿 Prairie sortent deux fois plus, et l’Atelier a des oreilles de lapin et des paniers d’œufs !' },
  ete: { nom: 'la fête de l’été', e: '☀️', type: 'sable', couleurs: ['#38bdf8', '#facc15'],
    texte: 'Les dindies 🏜️ Sable sortent deux fois plus, et l’Atelier a des chapeaux de paille et des châteaux de sable !' }
};
/* le dimanche de Pâques (le calcul grégorien « anonyme ») */
export function dimanchePaques(an) {
  const a = an % 19, b = Math.floor(an / 100), c = an % 100, d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
  const x = h + l - 7 * m + 114;
  return new Date(an, Math.floor(x / 31) - 1, (x % 31) + 1);
}
/* la fête d'un jour (sans le forçage des tests) */
export function feteLe(d) {
  const m = d.getMonth() + 1, j = d.getDate(), md = m * 100 + j;
  if (md >= 1018 && md <= 1103) return 'halloween';
  if (md >= 1210 || md <= 106) return 'noel';
  if (m === 7 || m === 8) return 'ete';
  const jourJ = new Date(d.getFullYear(), m - 1, j), P = dimanchePaques(d.getFullYear());
  if (Math.abs(Math.round((jourJ - P) / 864e5)) <= 7) return 'paques';
  return null;
}
/* pour les tests (et les captures) : forcer une fête ; null = aucune fête ; undefined = la vraie date */
let forcee;
export const forcerFete = id => { forcee = id; };
export const feteDu = (d = new Date()) => forcee !== undefined ? forcee : feteLe(d);
export const fete = () => { const id = feteDu(); return id ? { id, ...FETES[id] } : null; };
export const typeFete = () => { const id = feteDu(); return id ? FETES[id].type : null; };
/* un chapeau ou une décoration de fête : seulement pendant sa fête */
export const disponible = obj => !obj.evenement || obj.evenement === feteDu();
/* la prochaine fête (et dans combien de jours) */
export function prochaineFete(d = new Date()) {
  const ici = feteLe(d);
  for (let k = 1; k < 370; k++) {
    const x = new Date(d.getFullYear(), d.getMonth(), d.getDate() + k), f = feteLe(x);
    if (f && f !== ici) return { id: f, ...FETES[f], dans: k };
  }
  return null;
}
