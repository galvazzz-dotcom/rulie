/* ══════════ LES DOUBLES (étape 9) ══════════
   Attraper plusieurs fois la même espèce sert à quelque chose :
   - chaque dindie a ses propres talents (0 à 5 ⭐ par stat) : la carte de capture dit si c'est ta meilleure de l'espèce ;
   - au Labo, le Professeur « étudie » un double : il le rend à la nature, et ta meilleure dindie de la même espèce
     apprend de lui : de l'expérience, et une étoile de talent si le double en avait plus qu'elle sur une stat
     (on ne dépasse donc jamais les talents qu'on a vraiment attrapés). */
import * as J from './etat.js';
import { PAR_ID } from '../donnees/especes.js';
import { donnerXp } from './elevage.js';
import { CHAPEAUX } from '../donnees/production.js';

const E = () => J.etat();
export const total = d => d.talents.reduce((a, b) => a + b, 0);
export const memeEspece = espece => E().dindies.filter(d => d.espece === espece);
/* la meilleure : la plus douée (le total des talents), puis la plus haut niveau ; on peut en écarter une */
export function meilleure(espece, sauf = null) {
  return memeEspece(espece).filter(d => d !== sauf).sort((a, b) => total(b) - total(a) || b.niveau - a.niveau)[0] || null;
}
/* pour la carte de capture : la nouvelle venue, comparée aux autres de son espèce */
export function comparer(d) {
  const M = meilleure(d.espece, d);
  if (!M) return { autres: 0 };
  const plus = [0, 1, 2].filter(i => d.talents[i] > M.talents[i]);
  return { autres: memeEspece(d.espece).length - 1, M, mieux: total(d) > total(M), egale: total(d) === total(M), plus };
}
export const RAISONS = { premiere: 'C’est ta toute première dindie : elle reste avec toi !', cadeau: 'C’est la dindie que t’a offerte le Professeur : elle reste avec toi !' };
export function peutEtudier(d) {
  if (RAISONS[d.origine]) return RAISONS[d.origine];
  if (d.lieu === 'mission') return 'Elle est partie en mission.';
  if (memeEspece(d.espece).length < 2) return 'Il faut au moins deux dindies de la même espèce.';
  if (meilleure(d.espece) === d) return 'C’est ta meilleure : le Professeur en étudie une autre, pour qu’elle apprenne !';
  return null;
}
/* l'expérience que donne l'étude : selon la rareté et le niveau du double (le double chromatique en donne deux fois plus) */
export const xpEtude = d => Math.round((30 + 6 * d.niveau) * { commune: 1, rare: 1.5, epique: 2, mythique: 3 }[PAR_ID[d.espece].rarete] * (d.chroma ? 2 : 1));
/* ce qu'apprendrait la meilleure (pour l'annoncer avant) */
export function apercu(d) {
  const M = meilleure(d.espece); if (!M || M === d) return null;
  const i = [0, 1, 2].find(k => d.talents[k] > M.talents[k] && M.talents[k] < 5);
  return { M, xp: xpEtude(d), talent: i === undefined ? null : i };
}
export function etudier(d) {
  const err = peutEtudier(d); if (err) return err;
  const A = apercu(d), M = A.M;
  if (A.talent !== null) M.talents[A.talent]++;
  /* le chapeau revient dans l'armoire, et la compagne reste à la maison */
  if (d.chapeau && CHAPEAUX[d.chapeau]) { const P = E().production; P.chapeaux[d.chapeau] = (P.chapeaux[d.chapeau] || 0) + 1; }
  if (E().compagnon === d.uid) E().compagnon = null;
  E().dindies = E().dindies.filter(x => x !== d);
  E().elevage.etudes = (E().elevage.etudes || 0) + 1;
  const niv = donnerXp(M, A.xp);
  J.changer('dindies');
  return { M, xp: A.xp, talent: A.talent, niv };
}
/* les espèces dont on a des doubles à étudier */
export function especesAvecDoubles() {
  const n = {};
  for (const d of E().dindies) n[d.espece] = (n[d.espece] || 0) + 1;
  return Object.keys(n).filter(e => n[e] > 1 && memeEspece(e).some(d => !peutEtudier(d)));
}
