/* ══════════ L'ÉTAT DE LA PARTIE ══════════
   Tout ce qui est sauvegardé. Les changements préviennent l'interface (surChangement). */
import { PAR_ID } from '../donnees/especes.js';
import { vaDans } from './individus.js';

export const VERSION = 2;
export function nouvelEtat(nom, couleur) {
  return {
    version: VERSION, profil: { nom, couleur, cree: Date.now() },
    pieces: 0, plumesOr: 0, inventaire: {},
    dindies: [], compagnon: null,
    enclos: {}, batiments: { clapier: { repare: false, rangees: 1 }, montgolfiere: { reparee: false } },
    livre: { vus: {}, attrapes: {} },
    quete: { etape: 'arrivee', compteur: 0, finies: [], nourries: [] },
    monde: { position: [0, 33.5], ramasses: {}, lieu: 'domaine', positions: {} },
    reglages: { son: true, musique: true, voix: false, aide: false, heure: 'vraie' },
    quotidien: { courrier: '', voeu: '', trouvailles: null, cadeaux: {} },
    stats: { tempsJeu: 0, pas: 0 }
  };
}
/* une sauvegarde ancienne : on complète ce qui manque */
export function migrer(e) {
  const n = nouvelEtat(e.profil?.nom || 'Joueur', e.profil?.couleur || '#ea580c');
  const fus = (a, b) => { for (const k in b) { if (a[k] === undefined) a[k] = b[k]; else if (b[k] && typeof b[k] === 'object' && !Array.isArray(b[k])) fus(a[k], b[k]); } return a; };
  const avant = e.version || 1;
  fus(e, n);
  /* version 2 : la fin du chapitre 1 devient le départ du chapitre 2 */
  if (avant < 2 && e.quete.etape === 'fin') e.quete.etape = 'decollage';
  e.version = VERSION;
  return e;
}

let E = null;
const ecouteurs = new Set();
export const etat = () => E;
export function utiliser(e) { E = e; changer(); }
export const surChangement = f => { ecouteurs.add(f); return () => ecouteurs.delete(f); };
export function changer(quoi = '') { for (const f of ecouteurs) f(quoi); }

/* ── l'argent et les objets ── */
export function gagnerPieces(n) { E.pieces += n; changer('pieces'); }
export function depenser(n) { if (E.pieces < n) return false; E.pieces -= n; changer('pieces'); return true; }
export const combien = id => E.inventaire[id] || 0;
export function ajouterObjet(id, n = 1) { E.inventaire[id] = (E.inventaire[id] || 0) + n; changer('inventaire'); }
export function retirerObjet(id, n = 1) { if (combien(id) < n) return false; E.inventaire[id] -= n; if (!E.inventaire[id]) delete E.inventaire[id]; changer('inventaire'); return true; }

/* ── les dindies ── */
export const parUid = uid => E.dindies.find(d => d.uid === uid);
export const equipe = () => E.dindies.filter(d => d.lieu === 'equipe');
export const dansEnclos = type => E.dindies.filter(d => d.lieu === 'enclos:' + type);
export const dansClapier = () => E.dindies.filter(d => d.lieu === 'clapier');
export const placesEnclos = type => [0, 2, 4, 6, 8, 10][E.enclos[type]?.niveau || 0];
export const placesClapier = () => E.batiments.clapier.repare ? 30 * (E.batiments.clapier.rangees || 1) : 0;
export function voir(espece) { if (!E.livre.vus[espece]) { E.livre.vus[espece] = Date.now(); changer('livre'); } }
export function ajouterDindie(d) {
  E.dindies.push(d); voir(d.espece);
  if (!E.livre.attrapes[d.espece]) E.livre.attrapes[d.espece] = Date.now();
  if (equipe().length > 6) d.lieu = E.batiments.clapier.repare ? 'clapier' : 'equipe';
  changer('dindies');
  return d;
}
/* déplacer une dindie : renvoie un message d'erreur, ou null si c'est fait */
export function deplacer(d, lieu) {
  if (d.lieu === lieu) return null;
  if (lieu === 'equipe' && equipe().length >= 6) return 'Ton équipe est pleine (6 dindies).';
  if (lieu === 'clapier') { if (!E.batiments.clapier.repare) return 'Le Clapier est encore en ruine.'; if (dansClapier().length >= placesClapier()) return 'Le Clapier est plein.'; }
  if (lieu.startsWith('enclos:')) {
    const t = lieu.slice(7);
    if (!E.enclos[t]?.construit) return 'Cet enclos n’est pas encore construit.';
    if (!vaDans(d, t)) return `Cette dindie ne peut pas vivre ici : il lui faut un habitat ${PAR_ID[d.espece].types.map(x => x).join(' ou ')}.`;
    if (dansEnclos(t).length >= placesEnclos(t)) return 'Cet enclos est plein.';
  }
  d.lieu = lieu;
  if (lieu !== 'equipe' && E.compagnon === d.uid) E.compagnon = null;
  changer('dindies');
  return null;
}
export function choisirCompagnon(d) { if (d && d.lieu !== 'equipe') return 'Seule une dindie de ton équipe peut te suivre.'; E.compagnon = d ? d.uid : null; changer('compagnon'); return null; }
export const resume = () => `${E.dindies.length} dindie${E.dindies.length > 1 ? 's' : ''} · ${Object.keys(E.livre.attrapes).length}/72 · ${E.pieces} 🪙`;
