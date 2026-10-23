/* ══════════ LES CONCOURS DE LA SCÈNE DES DÉFILÉS (étape 8) ══════════
   Le défilé : la note dépend de la dindie (rareté, chromatique, forme éveillée, chapeau assorti à son type, bonheur, niveau,
   un ruban bleu) et du petit jeu des poses en rythme. On monte de rang : Débutant, Confirmé, Expert, Maître, Étoile.
   Le glouglou : un jeu de rythme avec le cri de la dindie, sur 5 chansons et 3 difficultés (de 1 à 3 étoiles). */
import * as J from './etat.js';
import { PAR_ID } from '../donnees/especes.js';
import { CHAPEAUX } from '../donnees/production.js';
import { CHANSONS, DIFFICULTES } from '../donnees/chansons.js';
import { nomDe } from './individus.js';

const E = () => J.etat();
export const RANGS = [
  { id: 'debutant', nom: 'Débutant', e: '🎀', seuil: 35, recompense: { pieces: 150 } },
  { id: 'confirme', nom: 'Confirmé', e: '🥉', seuil: 50, recompense: { pieces: 300 } },
  { id: 'expert', nom: 'Expert', e: '🥈', seuil: 65, recompense: { pieces: 500, plumesOr: 1 } },
  { id: 'maitre', nom: 'Maître', e: '🥇', seuil: 80, recompense: { pieces: 800, plumesOr: 2 } },
  { id: 'etoile', nom: 'Étoile', e: '🌟', seuil: 95, recompense: { pieces: 1200, plumesOr: 3, objets: { rubanBleu: 3 } } }
];
export const POSES_MAX = 30;
export function concours() {
  const e = E();
  e.concours = e.concours || {};
  const C = e.concours;
  C.defile = C.defile || { rang: 0, meilleur: 0, faits: 0, meilleureDindie: null };
  C.glouglou = C.glouglou || { etoiles: {}, faits: 0 };
  return C;
}
/* les dindies qui peuvent monter sur scène : adultes ou éveillées, pas en mission */
export const candidates = () => E().dindies.filter(d => (d.stade === 'adulte' || d.stade === 'eveille') && d.lieu !== 'mission');

/* ── la note du défilé (sans les poses) : le détail, pour l'afficher ── */
const PTS_RARETE = { commune: 10, rare: 18, epique: 28, mythique: 40 };
export function noteDindie(d, { ruban = false } = {}) {
  const esp = PAR_ID[d.espece], L = [];
  L.push({ texte: `Rareté : ${{ commune: 'commune', rare: 'rare', epique: 'épique', mythique: 'mythique' }[esp.rarete]}`, points: PTS_RARETE[esp.rarete] });
  if (d.chroma) L.push({ texte: '✨ Chromatique', points: 12 });
  if (d.stade === 'eveille') L.push({ texte: '🌟 Forme éveillée', points: 8 });
  const C = d.chapeau && CHAPEAUX[d.chapeau];
  if (C) L.push(esp.types.includes(C.type) ? { texte: `🎩 Un chapeau assorti à son type`, points: 10 } : { texte: '🎩 Un joli chapeau', points: 4 });
  if (d.bonheur >= 80) L.push({ texte: '💕 Très heureuse', points: 5 }); else if (d.bonheur >= 50) L.push({ texte: '🙂 Heureuse', points: 2 });
  const niv = Math.floor(d.niveau / 10); if (niv) L.push({ texte: `⬆️ Niveau ${d.niveau}`, points: niv });
  if (ruban) L.push({ texte: '🎀 Un ruban bleu', points: 6 });
  return { lignes: L, total: L.reduce((a, x) => a + x.points, 0) };
}
/* le rang à tenter : le prochain pas encore gagné (ou le dernier) */
export const rangActuel = () => Math.min(RANGS.length - 1, concours().defile.rang);
/* ── le défilé : base + poses → la note du jury (3 juges, sur 10 chacun, pour l'histoire) ── */
export function finirDefile(d, poses, { ruban = false } = {}) {
  const C = concours().defile, base = noteDindie(d, { ruban }), total = Math.round(base.total + Math.max(0, Math.min(POSES_MAX, poses)));
  if (ruban) J.retirerObjet('rubanBleu');
  const k = rangActuel(), R = RANGS[k], reussi = total >= R.seuil;
  C.faits++;
  if (total > C.meilleur) { C.meilleur = total; C.meilleureDindie = nomDe(d); }
  let gagne = null;
  if (reussi && C.rang === k && k < RANGS.length) {
    C.rang = k + 1; gagne = R;
    const r = R.recompense; if (r.pieces) J.gagnerPieces(r.pieces); if (r.plumesOr) { E().plumesOr += r.plumesOr; J.changer('pieces'); }
    for (const [o, n] of Object.entries(r.objets || {})) J.ajouterObjet(o, n);
  }
  /* les trois juges : une note sur 10 chacun (un peu différente, pour l'histoire) */
  const sur10 = Math.min(10, total / 11.6);
  const juges = [-.4, .2, .5].map(dk => Math.max(1, Math.min(10, Math.round((sur10 + dk) * 2) / 2)));
  J.changer('concours');
  return { base, poses, total, rang: R, reussi, gagne, juges };
}

/* ── le glouglou : les notes de la chanson, en temps (secondes) et en touches (1 à 3) ── */
export function partition(idChanson, idDiff) {
  const S = CHANSONS.find(c => c.id === idChanson), D = DIFFICULTES.find(x => x.id === idDiff), temps = 60 / D.tempo;
  const hauteurs = [...new Set(S.notes.map(n => n[0]))].sort((a, b) => a - b);
  const touche = h => D.touches === 1 ? 0 : D.touches === 2 ? (h <= hauteurs[Math.floor((hauteurs.length - 1) / 2)] ? 0 : 1) : Math.min(2, Math.floor(hauteurs.indexOf(h) / hauteurs.length * 3));
  let t = 0;
  const notes = S.notes.map(([h, b]) => { const n = { t, h, touche: touche(h), duree: b * temps }; t += b * temps; return n; });
  return { notes, duree: t, touches: D.touches };
}
/* le score (0 à 1) → les étoiles */
export const etoilesPour = score => score >= .95 ? 3 : score >= .8 ? 2 : score >= .6 ? 1 : 0;
export const etoilesChanson = (c, d) => concours().glouglou.etoiles[c + ':' + d] || 0;
export const RECOMPENSE_GLOUGLOU = { facile: 40, moyen: 80, difficile: 130 };
export function finirGlouglou(idChanson, idDiff, score) {
  const G = concours().glouglou, cle = idChanson + ':' + idDiff, et = etoilesPour(score), avant = G.etoiles[cle] || 0;
  G.faits++;
  let pieces = 0, plumesOr = 0;
  if (et > avant) {
    G.etoiles[cle] = et;
    pieces = RECOMPENSE_GLOUGLOU[idDiff] * (et - avant);
    if (et === 3 && idDiff === 'difficile') plumesOr = 1;
    J.gagnerPieces(pieces); if (plumesOr) { E().plumesOr += plumesOr; J.changer('pieces'); }
  }
  J.changer('concours');
  return { etoiles: et, avant, pieces, plumesOr, score };
}
export const totalEtoiles = () => Object.values(concours().glouglou.etoiles).reduce((a, b) => a + b, 0);
export const ETOILES_MAX = CHANSONS.length * DIFFICULTES.length * 3;
