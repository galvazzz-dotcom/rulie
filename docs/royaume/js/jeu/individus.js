/* ══════════ LES DINDIES DU JOUEUR (une par une) ══════════
   Chaque dindie a son espèce, son surnom, son niveau, ses talents (0 à 5 étoiles
   par stat), son caractère, son bonheur, et l'endroit où elle vit. */
import { PAR_ID } from '../donnees/especes.js';

export const CARACTERES = {
  fonceuse: { nom: 'Fonceuse', plus: 0, moins: 1, desc: 'Elle fonce ! Plus rapide, moins endurante.' },
  tetue: { nom: 'Têtue', plus: 1, moins: 0, desc: 'Elle ne lâche rien. Plus endurante, moins rapide.' },
  sauteuse: { nom: 'Sauteuse', plus: 2, moins: 1, desc: 'Elle bondit partout. Saute mieux, se fatigue plus vite.' },
  reveuse: { nom: 'Rêveuse', plus: 2, moins: 0, desc: 'Toujours dans les nuages. Saute mieux, part moins vite.' },
  costaude: { nom: 'Costaude', plus: 1, moins: 2, desc: 'Solide comme un rocher. Endurante, mais saute moins.' },
  pressee: { nom: 'Pressée', plus: 0, moins: 2, desc: 'Toujours en avance. Rapide, mais saute moins.' },
  gourmande: { nom: 'Gourmande', plus: -1, moins: -1, desc: 'Elle adore les friandises : elles comptent double.' },
  calme: { nom: 'Calme', plus: -1, moins: -1, desc: 'Tranquille et équilibrée.' }
};
export const NOMS_RIGOLOS = ['Plumette', 'Caramel', 'Pompon', 'Biscotte', 'Noisette', 'Paprika', 'Brioche', 'Chouquette', 'Patapouf', 'Pépite', 'Gribouille',
  'Praline', 'Cacahuète', 'Galette', 'Crumble', 'Bouboule', 'Tornade', 'Câlin', 'Myrtille', 'Bigoudi', 'Croquette', 'Frisette', 'Zigzag', 'Pistache', 'Glouton'];

let compteur = 0;
export function nouvelleDindie(espece, { niveau = 1, talents = null, caractere = null, chroma = false, stade = 'adulte', origine = '', surnom = null } = {}) {
  const t = talents || [0, 1, 2].map(() => Math.floor(Math.random() * 4));
  const cars = Object.keys(CARACTERES);
  return {
    uid: 'd' + Date.now().toString(36) + (compteur++).toString(36) + Math.floor(Math.random() * 1296).toString(36),
    espece, surnom, niveau, xp: 0, talents: t, caractere: caractere || cars[Math.floor(Math.random() * cars.length)],
    chroma, stade, bonheur: 60, entrainement: [0, 0, 0], lieu: 'equipe', obtenue: Date.now(), origine, derniereCaresse: 0
  };
}
export const espece = d => PAR_ID[d.espece];
export const nomDe = d => d.surnom || PAR_ID[d.espece].nom;

/* les stats affichées (de 5 à 100), selon le plan : 5 + (6 × base + 4 × talent + entraînement) × niveau / 50,
   puis ± 10 % selon le caractère ; l'éveil donne + 1 à chaque base */
export function stats(d) {
  const e = PAR_ID[d.espece], C = CARACTERES[d.caractere], eveil = d.stade === 'eveille' ? 1 : 0;
  return e.stats.map((b, i) => {
    let v = 5 + Math.floor((6 * Math.min(10, b + eveil) + 4 * d.talents[i] + (d.entrainement[i] || 0)) * d.niveau / 50);
    if (C.plus === i) v = Math.round(v * 1.1); if (C.moins === i) v = Math.round(v * .9);
    return Math.min(100, Math.max(1, v));
  });
}
export const xpPourNiveau = n => Math.round(10 * Math.pow(n, 1.4));
export function gagnerXp(d, n) {
  d.xp += n; let monte = 0;
  while (d.niveau < 50 && d.xp >= xpPourNiveau(d.niveau)) { d.xp -= xpPourNiveau(d.niveau); d.niveau++; monte++; }
  return monte;
}
/* peut-elle vivre dans cet habitat ? (un de ses types) */
export const vaDans = (d, type) => PAR_ID[d.espece].types.includes(type);
