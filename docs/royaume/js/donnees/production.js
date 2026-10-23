/* ══════════ LA PRODUCTION DU DOMAINE (plan, 9) ══════════
   Le Potager (graines → récoltes, en temps réel), le Moulin (les recettes de friandises),
   l'Atelier des plumes (30 chapeaux et 50 décorations, payés en plumes des 8 types),
   le Bureau des missions, et les améliorations des bâtiments (niveaux 1 à 5). */
import { TYPES, ORDRE_TYPES } from './types.js';
import { assombrir, eclaircir } from '../moteur/couleurs.js';

/* ── le Potager : une graine pousse en temps réel, puis donne sa récolte ── */
export const GRAINES = {
  mais: { nom: 'Maïs', e: '🌽', graine: 'grainesMais', recolte: 'mais', minutes: 5, donne: [2, 3], sert: '⚡' },
  ble: { nom: 'Blé', e: '🌾', graine: 'grainesBle', recolte: 'ble', minutes: 10, donne: [2, 3], sert: '💪' },
  haricot: { nom: 'Haricot sauteur', e: '🫘', graine: 'grainesHaricot', recolte: 'haricot', minutes: 15, donne: [2, 3], sert: '🦘' },
  baie: { nom: 'Baie arc-en-ciel', e: '🍇', graine: 'grainesBaie', recolte: 'baie', minutes: 60, donne: [1, 2], sert: '✨' }
};
export const ORDRE_GRAINES = Object.keys(GRAINES);
export const grainePour = idObjet => ORDRE_GRAINES.find(g => GRAINES[g].graine === idObjet);

/* ── le Moulin : les recettes (ingrédients du Potager → friandises) ── */
export const RECETTES = {
  galetteMais: { ingredients: { mais: 2 } },
  painBle: { ingredients: { ble: 2 } },
  croquantHaricot: { ingredients: { haricot: 2 } },
  tarteBaies: { ingredients: { baie: 1, ble: 1 } },
  superFriandise: { ingredients: { mais: 1, ble: 1, haricot: 1 } },
  gateauAmour: { ingredients: { baie: 2, ble: 1, mais: 1 } }
};

/* ── les plumes : chaque dindie d'un enclos en lâche chaque jour ; on peut aussi en gagner ── */
export const PLUMES_RELACHER = { commune: 3, rare: 6, epique: 12, mythique: 20 };

/* ── l'Atelier : 10 formes de chapeaux × 3 coloris (un coloris = les plumes d'un type) ── */
export const FORMES_CHAPEAUX = [
  { forme: 'fete', nom: 'Chapeau de fête', e: '🥳' }, { forme: 'noeud', nom: 'Gros nœud', e: '🎀' }, { forme: 'beret', nom: 'Béret', e: '🎨' },
  { forme: 'bonnet', nom: 'Bonnet à pompon', e: '🧶' }, { forme: 'casquette', nom: 'Casquette', e: '🧢' }, { forme: 'fleurs', nom: 'Couronne de fleurs', e: '🌼' },
  { forme: 'hautForme', nom: 'Haut-de-forme', e: '🎩' }, { forme: 'sombrero', nom: 'Sombrero', e: '🌵' }, { forme: 'cowboy', nom: 'Chapeau de cowboy', e: '🤠' },
  { forme: 'viking', nom: 'Casque viking', e: '⚔️' }
];
export const CHAPEAUX = {};
FORMES_CHAPEAUX.forEach((F, i) => {
  /* les premiers chapeaux se font avec les plumes des premières îles (Prairie, Pluie, Sable, Feu) */
  const types = i < 6 ? [ORDRE_TYPES[[0, 2, 1, 5, 0, 1][i]], ORDRE_TYPES[[1, 5, 2, 0, 2, 5][i]], ORDRE_TYPES[[3, 4, 6, 7, 6, 3][i]]] : [ORDRE_TYPES[[1, 0, 5, 7][i - 6]], ORDRE_TYPES[[5, 2, 3, 6][i - 6]], ORDRE_TYPES[[7, 4, 4, 3][i - 6]]];
  types.forEach((t, k) => {
    const T = TYPES[t], fonce = F.forme === 'hautForme' || F.forme === 'cowboy';
    CHAPEAUX[`${F.forme}-${t}`] = {
      id: `${F.forme}-${t}`, forme: F.forme, type: t, nom: `${F.nom} ${T.e}`, e: F.e,
      c1: fonce ? assombrir(T.couleur, .4) : T.couleur, c2: F.forme === 'viking' ? '#f5f5f4' : fonce ? T.clair : eclaircir(T.clair, .2),
      cout: { plumes: { [t]: 4 + i + k * 2 }, pieces: 20 + i * 8 + k * 10 }
    };
  });
});

/* ── les chapeaux de fête (étape 8) : on ne peut les fabriquer que pendant leur fête (Halloween, Noël, Pâques, l'été) ── */
export const FORMES_FETE = { sorciere: 'Chapeau de sorcière', renne: 'Bois de renne', lapin: 'Oreilles de lapin', paille: 'Chapeau de paille' };
[['sorciere-halloween', 'sorciere', 'halloween', 'nuit', 'Chapeau de sorcière 🎃', '🧙', '#4c1d95', '#f97316'],
  ['hautForme-halloween', 'hautForme', 'halloween', 'nuit', 'Haut-de-forme citrouille 🎃', '🎩', '#1f2937', '#f97316'],
  ['bonnet-noel', 'bonnet', 'noel', 'glace', 'Bonnet de Noël 🎄', '🎅', '#dc2626', '#ffffff'],
  ['renne-noel', 'renne', 'noel', 'glace', 'Bois de renne 🎄', '🦌', '#92400e', '#16a34a'],
  ['lapin-paques', 'lapin', 'paques', 'prairie', 'Oreilles de lapin 🥚', '🐰', '#fdf2f8', '#f9a8d4'],
  ['fleurs-paques', 'fleurs', 'paques', 'prairie', 'Couronne de printemps 🥚', '🌷', '#86efac', '#fbcfe8'],
  ['paille-ete', 'paille', 'ete', 'sable', 'Chapeau de paille ☀️', '👒', '#fde68a', '#38bdf8'],
  ['casquette-ete', 'casquette', 'ete', 'sable', 'Casquette de plage ☀️', '🧢', '#38bdf8', '#fde047']]
  .forEach(([id, forme, evenement, type, nom, e, c1, c2], i) => { CHAPEAUX[id] = { id, forme, type, nom, e, c1, c2, evenement, cout: { plumes: { [type]: 6 + (i % 2) * 2 }, pieces: 60 + (i % 2) * 20 } }; });

/* ── l'Atelier : les 50 décorations (familles × variantes) ; rayon = la place qu'elles prennent, bloque = on ne passe pas à travers ── */
export const DECORATIONS = {};
const deco = (id, nom, e, famille, cout, { rayon = .6, bloque = true, ...params } = {}) => { DECORATIONS[id] = { id, nom, e, famille, cout, rayon, bloque, ...params }; };
[['rose', 'roses', '#f472b6'], ['jaune', 'jaunes', '#facc15'], ['blanc', 'blanches', '#ffffff'], ['violet', 'violettes', '#a78bfa'], ['rouge', 'rouges', '#ef4444'], ['arc', 'arc-en-ciel', 'arc']]
  .forEach(([k, n, c], i) => deco('massif-' + k, `Massif de fleurs ${n}`, '🌷', 'massif', { plumes: { prairie: 2 + i }, pieces: 15 + i * 5 }, { couleur: c, rayon: .9, bloque: false }));
ORDRE_TYPES.forEach((t, i) => deco('fanions-' + t, `Fanions ${TYPES[t].e} ${TYPES[t].nom}`, '🎏', 'fanions', { plumes: { [t]: 3 } , pieces: 20 }, { type: t, rayon: .4 }));
ORDRE_TYPES.forEach((t, i) => deco('statue-' + t, `Statue de dindie ${TYPES[t].e}`, '🗿', 'statue', { plumes: { [t]: 10 }, pieces: 120 }, { type: t, rayon: .8 }));
[['cerisier', 'Cerisier en fleurs', '🌸'], ['pommier', 'Pommier', '🍎'], ['sapin', 'Sapin décoré', '🎄'], ['palmier', 'Palmier', '🌴']]
  .forEach(([k, n, e], i) => deco('arbre-' + k, n, e, 'arbre', { plumes: { prairie: 4, [['pluie', 'feu', 'glace', 'sable'][i]]: 3 }, pieces: 50 }, { sorte: k, rayon: .9 }));
deco('banc-bois', 'Banc en bois', '🪑', 'banc', { plumes: { prairie: 3 }, pieces: 30 }, { couleur: '#a16207', rayon: .9 });
deco('banc-blanc', 'Banc blanc', '🪑', 'banc', { plumes: { pluie: 3 }, pieces: 40 }, { couleur: '#f8fafc', rayon: .9 });
deco('lampadaire', 'Lampadaire', '💡', 'lampadaire', { plumes: { feu: 3 }, pieces: 60 }, { rayon: .4 });
deco('lampions', 'Guirlande de lampions', '🏮', 'lampions', { plumes: { feu: 3, sable: 3 }, pieces: 60 }, { rayon: .5 });
deco('fontaine', 'Petite fontaine', '⛲', 'fontaine', { plumes: { pluie: 8 }, pieces: 150 }, { rayon: 1.2 });
deco('puits', 'Puits fleuri', '🪣', 'puits', { plumes: { pluie: 5, prairie: 3 }, pieces: 100 }, { rayon: .9 });
deco('kiosque', 'Kiosque à musique', '🎶', 'kiosque', { plumes: { prairie: 6, pluie: 6, sable: 6 }, pieces: 300 }, { rayon: 2.1 });
deco('arche', 'Arche fleurie', '💐', 'arche', { plumes: { prairie: 6 }, pieces: 80 }, { rayon: .7 });
deco('balancoire', 'Balançoire', '🎠', 'balancoire', { plumes: { sable: 5 }, pieces: 90 }, { rayon: 1.1 });
deco('nichoir', 'Nichoir à oiseaux', '🐦', 'nichoir', { plumes: { prairie: 3, ciel: 2 }, pieces: 40 }, { rayon: .4 });
deco('epouvantail', 'Épouvantail rigolo', '🧑‍🌾', 'epouvantail', { plumes: { prairie: 4 }, pieces: 50 }, { rayon: .5 });
deco('moulinet', 'Petit moulin à vent', '🌬️', 'moulinet', { plumes: { ciel: 4, prairie: 2 }, pieces: 80 }, { rayon: .7 });
deco('ballons', 'Bouquet de ballons', '🎈', 'ballons', { plumes: { ciel: 3, feu: 2 }, pieces: 40 }, { rayon: .4 });
deco('citrouilles', 'Tas de citrouilles', '🎃', 'citrouilles', { plumes: { feu: 4 }, pieces: 40 }, { rayon: .8 });
deco('bonhomme', 'Bonhomme de neige', '⛄', 'bonhomme', { plumes: { glace: 5 }, pieces: 50 }, { rayon: .6 });
deco('rocher', 'Rocher moussu', '🪨', 'rocher', { plumes: { jungle: 3 }, pieces: 20 }, { rayon: .8 });
deco('mare', 'Petite mare', '🦆', 'mare', { plumes: { pluie: 6 }, pieces: 90 }, { rayon: 1.5, bloque: false });
deco('parasol', 'Table et parasol', '⛱️', 'parasol', { plumes: { sable: 4 }, pieces: 70 }, { rayon: 1 });
deco('haie-verte', 'Haie taillée', '🌳', 'haie', { plumes: { prairie: 2 }, pieces: 15 }, { couleur: '#3f9b46', rayon: .6 });
deco('haie-fleurie', 'Haie fleurie', '🌺', 'haie', { plumes: { prairie: 3 }, pieces: 25 }, { couleur: '#3f9b46', fleurs: true, rayon: .6 });
deco('barriere-blanche', 'Barrière blanche', '🚧', 'barriere', { plumes: { pluie: 2 }, pieces: 15 }, { couleur: '#f8fafc', rayon: .5 });
deco('barriere-bois', 'Barrière en bois', '🪵', 'barriere', { plumes: { prairie: 2 }, pieces: 15 }, { couleur: '#a16207', rayon: .5 });
deco('dalles-pierre', 'Dalles de pierre', '⬜', 'dalles', { plumes: { glace: 1, prairie: 1 }, pieces: 10 }, { couleur: '#d6d3d1', rayon: .7, bloque: false });
deco('dalles-briques', 'Dalles de briques', '🟧', 'dalles', { plumes: { feu: 1, sable: 1 }, pieces: 10 }, { couleur: '#c2410c', rayon: .7, bloque: false });
/* les décorations de fête (étape 8) : seulement pendant leur fête */
deco('fantomes', 'Petits fantômes', '👻', 'fantomes', { plumes: { nuit: 4 }, pieces: 60 }, { rayon: .7, evenement: 'halloween' });
deco('lampions-halloween', 'Lampions d’Halloween', '🏮', 'lampions', { plumes: { nuit: 3, feu: 2 }, pieces: 60 }, { couleurs: ['#f97316', '#7c3aed', '#22c55e', '#f97316'], rayon: .5, evenement: 'halloween' });
deco('cadeaux', 'Pile de cadeaux', '🎁', 'cadeaux', { plumes: { glace: 4 }, pieces: 60 }, { rayon: .7, evenement: 'noel' });
deco('lampions-noel', 'Guirlande de Noël', '🎄', 'lampions', { plumes: { glace: 3, feu: 2 }, pieces: 60 }, { couleurs: ['#dc2626', '#16a34a', '#facc15', '#ffffff'], rayon: .5, evenement: 'noel' });
deco('oeufs', 'Panier d’œufs peints', '🧺', 'oeufs', { plumes: { prairie: 4 }, pieces: 60 }, { rayon: .6, evenement: 'paques' });
deco('parasol-paques', 'Parasol de printemps', '🌷', 'parasol', { plumes: { prairie: 3, pluie: 2 }, pieces: 70 }, { couleurs: ['#f9a8d4', '#fef9c3'], rayon: 1, evenement: 'paques' });
deco('chateauSable', 'Château de sable', '🏰', 'chateauSable', { plumes: { sable: 5 }, pieces: 70 }, { rayon: .9, evenement: 'ete' });
deco('parasol-ete', 'Parasol de plage', '⛱️', 'parasol', { plumes: { sable: 3, pluie: 2 }, pieces: 70 }, { couleurs: ['#38bdf8', '#fde047'], rayon: 1, evenement: 'ete' });
/* (les chapeaux et décorations de fête ne comptent pas dans les 30 chapeaux et les 50 décorations de l'Atelier) */
export const NB_DECORATIONS = Object.values(DECORATIONS).filter(D => !D.evenement).length;
export const NB_CHAPEAUX = Object.values(CHAPEAUX).filter(C => !C.evenement).length;

/* ── le Bureau des missions ── */
export const DUREES_MISSIONS = [15, 30, 60, 120, 240, 480];
export const MISSIONS = [
  { id: 'gaston', titre: 'Livrer les œufs de Gaston', e: '🥚', type: 'prairie', stat: 0, desc: 'Gaston a besoin de coureuses rapides pour livrer ses œufs avant midi.' },
  { id: 'coquillages', titre: 'Ramasser des coquillages', e: '🐚', type: 'pluie', stat: 1, desc: 'La plage est grande : il faut de l’endurance pour tout ramasser !' },
  { id: 'facteur', titre: 'Aider le facteur', e: '📮', type: null, stat: 0, desc: 'Le facteur est enrhumé. Qui veut distribuer les lettres du Royaume ?' },
  { id: 'caravane', titre: 'Escorter la caravane des dunes', e: '🐪', type: 'sable', stat: 1, desc: 'Leïla accompagne une caravane jusqu’à l’oasis. Elle cherche des dindies solides.' },
  { id: 'canaux', titre: 'Nettoyer les canaux de Belgique', e: '🧹', type: 'pluie', stat: 2, desc: 'Monsieur Waffel a laissé tomber des gaufres dans les canaux. Il faut sauter de barque en barque !' },
  { id: 'phare', titre: 'Garder le phare du port', e: '🗼', type: 'nuit', stat: 1, desc: 'Toute la nuit, il faut veiller à ce que la lumière reste allumée.' },
  { id: 'ballon', titre: 'Rattraper un ballon envolé', e: '🎈', type: 'ciel', stat: 2, desc: 'Un ballon de fête s’est envolé au-dessus des arbres. Hop, il faut sauter haut !' },
  { id: 'cerises', titre: 'Cueillir des cerises', e: '🍒', type: 'prairie', stat: 2, desc: 'Les cerises sont tout en haut. Il faut de bonnes sauteuses !' },
  { id: 'forge', titre: 'Aider à la forge', e: '🔨', type: 'feu', stat: 1, desc: 'Le forgeron a besoin de dindies qui n’ont pas peur de la chaleur.' },
  { id: 'tresor', titre: 'Chercher un trésor dans les dunes', e: '🗺️', type: 'sable', stat: 2, desc: 'Une vieille carte parle d’un trésor caché sous une dune. Une longue expédition !' },
  { id: 'course', titre: 'Faire la course avec le vent', e: '💨', type: 'ciel', stat: 0, desc: 'Le vent du nord se croit le plus rapide. Montrez-lui !' },
  { id: 'jardin', titre: 'Arroser le jardin oublié', e: '🌸', type: 'prairie', stat: 1, desc: 'Le jardin oublié, dans les Prés, a très soif.' }
];

/* ── les améliorations des bâtiments : niveau → ce que ça donne, et le prix pour y arriver ── */
export const AMELIORATIONS = {
  enclos: { nom: 'l’enclos', max: 5, effet: n => `${[0, 2, 4, 6, 8, 10][n]} places`, cout: n => [null, null, { pieces: 300 }, { pieces: 600, plumesOr: 1 }, { pieces: 1000, plumesOr: 2 }, { pieces: 1500, plumesOr: 3 }][n] },
  clapier: { nom: 'le Clapier', max: 10, effet: n => `${30 * n} places`, cout: n => ({ pieces: 200 + 100 * n, plumesOr: n > 5 ? 1 : 0 }) },
  couvoir: { nom: 'le Couvoir', max: 3, effet: n => `${n + 1} couveuses`, cout: n => [null, null, { pieces: 800, plumesOr: 2 }, { pieces: 1500, plumesOr: 3 }][n] },
  nurserie: { nom: 'la Nurserie', max: 3, effet: n => `${4 + 2 * n} places`, cout: n => [null, null, { pieces: 500 }, { pieces: 1000, plumesOr: 1 }][n] },
  potager: { nom: 'le Potager', max: 5, effet: n => `${2 + 2 * n} parcelles`, cout: n => [null, null, { pieces: 300 }, { pieces: 600 }, { pieces: 1000, plumesOr: 1 }, { pieces: 1500, plumesOr: 2 }][n] },
  missions: { nom: 'le Bureau des missions', max: 3, effet: n => `${n} mission${n > 1 ? 's' : ''} à la fois`, cout: n => [null, null, { pieces: 600 }, { pieces: 1200, plumesOr: 2 }][n] }
};
export const PRIX_REPARATION = { potager: 300, moulin: 400, atelier: 500, missions: 400, scene: 600 };
export const PRIX_HABITAT = 400;
