/* ══════════ L'ÉTAT DE LA PARTIE ══════════
   Tout ce qui est sauvegardé. Les changements préviennent l'interface (surChangement). */
import { PAR_ID } from '../donnees/especes.js';
import { vaDans } from './individus.js';

export const VERSION = 6;
export function nouvelEtat(nom, couleur) {
  return {
    version: VERSION, profil: { nom, couleur, cree: Date.now() },
    pieces: 0, plumesOr: 0, inventaire: {},
    dindies: [], compagnon: null,
    enclos: {}, batiments: { clapier: { repare: false, rangees: 1 }, montgolfiere: { reparee: false }, couvoir: { repare: false, niveau: 1 }, nurserie: { repare: false, niveau: 1 }, dindodrome: { ouvert: false }, entrainement: { repare: false },
      potager: { repare: false, niveau: 1 }, moulin: { repare: false }, atelier: { repare: false }, missions: { repare: false, niveau: 1 } },
    elevage: { couveuses: [null, null], croisements: 0, eclosions: 0, premierHybride: false, compteur: 0 },
    livre: { vus: {}, attrapes: {}, chromas: {} },
    courses: { badges: [], places: {}, faites: 0, victoires: 0, records: {}, entrainements: 0, lecons: 0 },
    /* la production du Domaine (étape 6) : le Potager, les plumes, l'Atelier, la décoration, les missions */
    production: { parcelles: [], plumes: {}, ramassage: {}, chapeaux: {}, decorations: {}, deco: [], missions: { offertes: [], encours: [], compteur: 0 },
      stats: { plantees: 0, arrosees: 0, recoltes: 0, friandises: 0, plumes: 0, chapeaux: 0, decos: 0, posees: 0, envoyees: 0, rapportees: 0, ameliorations: 0, relachees: 0, gateaux: 0, habitats: 0 } },
    quete: { etape: 'arrivee', compteur: 0, finies: [], nourries: [], domaine: { etape: null, finies: [] }, grandes: {} },
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
  /* version 3 : la fin du chapitre 2 devient le début du chapitre 3 */
  else if (avant < 3 && e.quete.etape === 'fin') e.quete.etape = 'parlerPlumeau3';
  /* version 4 : la fin du chapitre 3 devient le début du chapitre 4 */
  else if (avant < 4 && e.quete.etape === 'fin') e.quete.etape = 'parlerPlumeau5';
  /* version 5 : la production (rien à déplacer : les nouveaux bâtiments sont encore en ruine) */
  /* version 6 : la fin du chapitre 4 devient le début du chapitre 5 */
  else if (avant < 6 && e.quete.etape === 'fin') e.quete.etape = 'parlerPlumeau6';
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
export const placesNurserie = () => 4 + 2 * (E.batiments.nurserie?.niveau || 1);
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
  if (d.lieu === 'mission') return 'Elle est partie en mission ! Elle reviendra au Bureau des missions.';
  const bebe = d.stade === 'poussin' || d.stade === 'jeune';
  if (bebe && (lieu === 'equipe' || lieu.startsWith('enclos:'))) return 'Elle est encore toute petite : elle grandit à la Nurserie (ou au Clapier).';
  if (lieu === 'nurserie') { if (!E.batiments.nurserie?.repare) return 'La Nurserie est encore en ruine.'; if (!bebe) return 'La Nurserie, c’est pour les bébés !'; if (E.dindies.filter(x => x.lieu === 'nurserie').length >= placesNurserie()) return `La Nurserie est pleine (${placesNurserie()} bébés).`; }
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
