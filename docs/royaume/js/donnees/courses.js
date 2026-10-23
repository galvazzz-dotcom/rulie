/* ══════════ LES COURSES DU DINDODROME ══════════
   Les 20 compétences, les sortes de courses, les pistes (une par type) et les 4 premiers championnats.
   La piste du Dindodrome est un anneau de 200 m : 400 m = 2 tours, 500 m = 2 tours et demi, etc.
   Les haies et les zones (sable, boue) sont placées sur l'anneau (en mètres depuis la ligne d'arrivée). */
import { PAR_ID } from './especes.js';

export const TOUR = 200;

/* ── les compétences : recharge (en secondes), unique (une fois par course) ── */
export const COMPETENCES = {
  turbo: { nom: 'Turbo-Glou', e: '🚀', desc: 'Une grosse accélération pendant 2 secondes.', recharge: 12 },
  canon: { nom: 'Départ canon', e: '💥', desc: 'Un départ très rapide (seulement au tout début de la course).', unique: true },
  sprint: { nom: 'Sprint final', e: '🏁', desc: 'Plus rapide jusqu’à l’arrivée (dans les derniers 20 % de la course).', unique: true },
  souffle: { nom: 'Second souffle', e: '🌬️', desc: 'Récupère beaucoup d’endurance.', recharge: 25 },
  crapaud: { nom: 'Saut de crapaud', e: '🐸', desc: 'Les deux prochaines haies : des sauts parfaits, d’un seul bond.', recharge: 14 },
  planeur: { nom: 'Planeur', e: '🪁', desc: 'Plane pendant 3 s : plus vite, et rien ne l’arrête.', recharge: 15 },
  glissade: { nom: 'Glissade', e: '🛷', desc: 'Pas ralentie par le sable, la boue ou la glace pendant 6 s.', recharge: 12 },
  velours: { nom: 'Pattes de velours', e: '🐾', desc: 'Pas ralentie par le terrain (même la lave !) pendant 6 s.', recharge: 12 },
  aspiration: { nom: 'Aspiration', e: '🌀', desc: 'Juste derrière une adversaire ? Gros bonus de vitesse !', recharge: 10 },
  esquive: { nom: 'Esquive', e: '🤸', desc: 'Évite la prochaine chute.', recharge: 12 },
  cri: { nom: 'Cri d’encouragement', e: '📣', desc: 'Un grand glouglou qui donne du courage : plus vite pendant 3 s.', recharge: 12 },
  vent: { nom: 'Coup de vent', e: '💨', desc: 'Pousse en avant, encore plus sur les pistes ouvertes.', recharge: 12 },
  ombre: { nom: 'Ombre', e: '👤', desc: 'Invisible un instant : les dindies autour d’elle hésitent.', recharge: 14 },
  mirage: { nom: 'Mirage', e: '🌫️', desc: 'Toutes les autres ralentissent un instant.', recharge: 16 },
  racines: { nom: 'Racines', e: '🌱', desc: 'Ne trébuche jamais pendant 6 s.', recharge: 14 },
  etincelle: { nom: 'Étincelle', e: '✨', desc: 'Accélère, et encore plus à chaque fois qu’elle double.', recharge: 14 },
  carapace: { nom: 'Carapace de glace', e: '🧊', desc: 'Aucune fatigue pendant 3 s.', recharge: 12 },
  lune: { nom: 'Bond de lune', e: '🌙', desc: 'Des sauts parfaits pendant 5 s (et plus rapides la nuit).', recharge: 15 },
  plumes: { nom: 'Pluie de plumes', e: '🪶', desc: 'Gêne la dindie juste derrière.', recharge: 12 },
  arc: { nom: 'Arc-en-ciel', e: '🌈', desc: 'Un peu de tout : vitesse, endurance et un saut parfait.', recharge: 12 }
};
/* chaque espèce naît avec une compétence de son type (deux par type, selon l'espèce) */
const INNEES = { prairie: ['racines', 'souffle'], sable: ['mirage', 'canon'], pluie: ['glissade', 'aspiration'], jungle: ['crapaud', 'esquive'],
  glace: ['carapace', 'sprint'], feu: ['etincelle', 'turbo'], nuit: ['ombre', 'lune'], ciel: ['planeur', 'vent'] };
export function competenceInnee(espece) {
  const e = PAR_ID[espece];
  return e.rarete === 'mythique' ? 'arc' : INNEES[e.types[0]][e.n % 2];
}
/* ce que Coach Ginette sait enseigner */
export const ENSEIGNEES = ['turbo', 'canon', 'sprint', 'souffle', 'aspiration', 'esquive', 'cri', 'vent', 'plumes', 'crapaud'];
export const PRIX_LECON = 200;
/* les compétences d'une dindie : l'innée, puis celles apprises (2 places, 3 une fois éveillée) */
export const placesCompetences = d => d.stade === 'eveille' ? 3 : 2;
export const competencesDe = d => [...new Set([competenceInnee(d.espece), ...(d.competences || [])])].slice(0, placesCompetences(d));

/* ── les sortes de courses ── */
export const SORTES = {
  essai: { nom: 'Course d’essai', e: '🎌', distance: 300, desc: '300 m et deux haies, pour apprendre.' },
  sprint: { nom: 'Sprint', e: '⚡', distance: 400, desc: '2 tours de piste, à fond ! La vitesse compte le plus.' },
  haies: { nom: 'Haies', e: '🦘', distance: 600, desc: '3 tours et des haies à sauter. Le saut compte beaucoup.' },
  marathon: { nom: 'Marathon', e: '💪', distance: 1000, desc: '5 tours : il faut tenir ! L’endurance compte le plus.' },
  piste: { nom: 'Piste', e: '🏟️', distance: 500, desc: '2 tours et demi sur une piste spéciale.' },
  libre: { nom: 'Course libre', e: '🎽', distance: 400, desc: 'Pour s’entraîner contre des dindies de ton niveau.' },
  /* étape 8 : la Ligue des Légendes, et l'après-histoire */
  finale: { nom: 'La grande finale', e: '👑', distance: 800, desc: '4 tours avec des haies : la course des légendes !' },
  relais: { nom: 'Relais', e: '🔁', distance: 1200, desc: '3 dindies, 400 m chacune : la dernière franchit la ligne !' },
  chrono: { nom: 'Contre la montre', e: '⏱️', distance: 500, desc: 'Seule sur la piste : bats ton record !' },
  sansFin: { nom: 'La course sans fin', e: '♾️', distance: 99999, desc: 'Cours le plus loin possible : à la 3e chute, ou à bout de forces, c’est fini !' }
};

/* ── les pistes : la couleur du sol, les obstacles sur l'anneau, les zones qui ralentissent ── */
export const PISTES = {
  neutre: { nom: 'La piste du Dindodrome', court: 'Dindodrome', e: '🏟️', type: null, sol: '#c8553d', ligne: '#fff7ed', obstacle: 'haie', deco: 'fanions',
    haies: [], haiesCourse: [30, 70, 130, 170] },
  prairie: { nom: 'La piste des Prés', court: 'Prés', e: '🌿', type: 'prairie', sol: '#7cb342', ligne: '#f7fee7', obstacle: 'foin', deco: 'fleurs', haies: [40, 140, 175], zones: [] },
  sable: { nom: 'La piste des Dunes', court: 'Dunes', e: '🏜️', type: 'sable', sol: '#e6c27a', ligne: '#fff7ed', obstacle: 'dune', deco: 'cactus', haies: [35, 135], zones: [[62, 88], [162, 188]], zone: 'sable' },
  pluie: { nom: 'La piste de Boue', court: 'Boue', e: '💧', type: 'pluie', sol: '#8d6e4f', ligne: '#e7e5e4', obstacle: 'tronc', deco: 'flaques', haies: [25, 120], zones: [[45, 65], [140, 160]], zone: 'boue' },
  jungle: { nom: 'La piste des Lianes', court: 'Lianes', e: '🌴', type: 'jungle', sol: '#5b7f3a', ligne: '#ecfccb', obstacle: 'tronc', deco: 'palmiers', haies: [20, 50, 120, 150, 175], zones: [[80, 92]], zone: 'boue' },
  glace: { nom: 'La piste de Glace', court: 'Glace', e: '❄️', type: 'glace', sol: '#cfe8f3', ligne: '#ffffff', obstacle: 'congere', deco: 'sapins', haies: [30, 100, 160], zones: [[50, 72], [120, 142]], zone: 'verglas' },
  feu: { nom: 'La piste de Lave', court: 'Lave', e: '🔥', type: 'feu', sol: '#57534e', ligne: '#fdba74', obstacle: 'rocher', deco: 'braseros', haies: [25, 75, 125, 175], zones: [[90, 110]], zone: 'cendre' },
  nuit: { nom: 'La piste de Nuit', court: 'Nuit', e: '🌙', type: 'nuit', sol: '#3730a3', ligne: '#c7d2fe', obstacle: 'champignons', deco: 'lanternes', haies: [40, 90, 140, 190], zones: [[60, 75], [160, 175]], zone: 'brume' },
  ciel: { nom: 'La piste des Nuages', court: 'Nuages', e: '☁️', type: 'ciel', sol: '#dbeafe', ligne: '#60a5fa', obstacle: 'nuage', deco: 'ballons', haies: [20, 60, 100, 140, 180], zones: [[70, 85], [150, 165]], zone: 'nuage' }
};
/* les mètres de course où se trouvent les haies et les zones (la course part de « depart » sur l'anneau) */
export function obstaclesCourse(pisteId, sorte, distance) {
  const P = PISTES[pisteId], depart = ((-distance % TOUR) + TOUR) % TOUR;
  const boucle = ['haies', 'finale', 'sansFin'].includes(sorte) ? P.haiesCourse || P.haies : sorte === 'essai' ? [50, 150] : ['piste', 'chrono'].includes(sorte) ? P.haies : sorte === 'relais' ? [100] : [];
  const zonesB = ['piste', 'chrono', 'sansFin'].includes(sorte) ? P.zones || [] : [];
  const haies = [], zones = [];
  for (let tour = -1; tour <= distance / TOUR + 1; tour++) {
    for (const u of boucle) { const s = u - depart + tour * TOUR; if (s > 25 && s < distance - 12) haies.push(s); }
    for (const [a, b] of zonesB) { const s0 = a - depart + tour * TOUR, s1 = b - depart + tour * TOUR; if (s1 > 0 && s0 < distance) zones.push([Math.max(0, s0), Math.min(distance, s1)]); }
  }
  return { depart, haies: haies.sort((a, b) => a - b), zones: zones.sort((a, b) => a[0] - b[0]) };
}

/* ── les dresseurs des courses ── */
export const DRESSEURS = ['Lulu', 'Tom', 'Inès', 'Hugo', 'Zoé', 'Noah', 'Jade', 'Léo', 'Mila', 'Sacha', 'Nina', 'Arthur', 'Lina', 'Paul', 'Rose', 'Malo', 'Lou', 'Tim', 'Anna', 'Yanis'];

/* ── les championnats : 3 courses (il faut finir sur le podium), puis la finale contre le champion (il faut gagner) ── */
export const CHAMPIONNATS = [
  { n: 1, id: 'pres', nom: 'La Coupe des Prés', champion: 'gaston', type: 'prairie', badge: { nom: 'le Badge Trèfle', e: '🍀' },
    niveaux: [8, 11], especes: ['glouglou', 'paquerette', 'trefle', 'dindasable', 'gaufrette'],
    courses: [{ id: 'c1a', sorte: 'sprint', piste: 'neutre' }, { id: 'c1b', sorte: 'haies', piste: 'neutre' }, { id: 'c1c', sorte: 'piste', piste: 'prairie' }],
    finale: { id: 'c1f', sorte: 'piste', piste: 'prairie', star: { espece: 'trefle', nom: 'Clochette', niveau: 12, talents: [3, 3, 3], caractere: 'fonceuse', competences: ['turbo'] } },
    recompense: { pieces: 500, plumesOr: 1, objets: { biscuit: 3 } } },
  { n: 2, id: 'dunes', nom: 'La Coupe des Dunes', champion: 'leila', type: 'sable', badge: { nom: 'le Badge Soleil', e: '☀️' },
    niveaux: [11, 14], especes: ['dindasable', 'dromadaire', 'mirageus', 'oasis', 'glouglou'],
    courses: [{ id: 'c2a', sorte: 'sprint', piste: 'neutre' }, { id: 'c2b', sorte: 'marathon', piste: 'neutre' }, { id: 'c2c', sorte: 'piste', piste: 'sable' }],
    finale: { id: 'c2f', sorte: 'piste', piste: 'sable', star: { espece: 'dingue', nom: 'Sultane', niveau: 13, talents: [3, 2, 3], caractere: 'calme', competences: ['turbo'] } },
    recompense: { pieces: 700, plumesOr: 1, objets: { biscuit: 4 } } },
  { n: 3, id: 'pluie', nom: 'La Coupe de la Pluie', champion: 'waffel', type: 'pluie', badge: { nom: 'le Badge Goutte', e: '💧' },
    niveaux: [15, 18], especes: ['gaufrette', 'crachin', 'belgicus', 'rosee', 'cactus'],
    courses: [{ id: 'c3a', sorte: 'haies', piste: 'neutre' }, { id: 'c3b', sorte: 'sprint', piste: 'neutre' }, { id: 'c3c', sorte: 'piste', piste: 'pluie' }],
    finale: { id: 'c3f', sorte: 'piste', piste: 'pluie', star: { espece: 'belgicus', nom: 'Speculoos', niveau: 21, talents: [4, 4, 4], caractere: 'calme', competences: ['souffle'] } },
    recompense: { pieces: 900, plumesOr: 1, objets: { biscuit: 5 } } },
  { n: 4, id: 'lianes', nom: 'La Coupe des Lianes', champion: 'tarzanette', type: 'jungle', badge: { nom: 'le Badge Liane', e: '🌴' },
    niveaux: [18, 21], especes: ['perroquet', 'banane', 'liane', 'fougere', 'grenouille'],
    courses: [{ id: 'c4a', sorte: 'marathon', piste: 'neutre' }, { id: 'c4b', sorte: 'haies', piste: 'neutre' }, { id: 'c4c', sorte: 'piste', piste: 'jungle' }],
    finale: { id: 'c4f', sorte: 'piste', piste: 'jungle', star: { espece: 'jaguar', nom: 'Moustique', niveau: 20, talents: [2, 3, 3], caractere: 'calme', competences: ['sprint'] } },
    recompense: { pieces: 1200, plumesOr: 2, objets: { biscuit: 5 } } },
  { n: 5, id: 'glace', nom: 'La Coupe de Glace', champion: 'inuk', type: 'glace', badge: { nom: 'le Badge Flocon', e: '❄️' },
    niveaux: [23, 26], especes: ['dindingloo', 'pingouin', 'aurore', 'givre', 'flocon'],
    courses: [{ id: 'c5a', sorte: 'sprint', piste: 'neutre' }, { id: 'c5b', sorte: 'marathon', piste: 'neutre' }, { id: 'c5c', sorte: 'piste', piste: 'glace' }],
    finale: { id: 'c5f', sorte: 'piste', piste: 'glace', star: { espece: 'cristal', nom: 'Banquisette', niveau: 28, talents: [4, 4, 4], caractere: 'calme', competences: ['souffle'] } },
    recompense: { pieces: 1400, plumesOr: 2, objets: { biscuit: 6 } } },
  { n: 6, id: 'lave', nom: 'La Coupe de Lave', champion: 'lava', type: 'feu', badge: { nom: 'le Badge Braise', e: '🔥' },
    niveaux: [26, 29], especes: ['cendre', 'braise', 'dindofeu', 'tournesol', 'vapeur'],
    courses: [{ id: 'c6a', sorte: 'haies', piste: 'neutre' }, { id: 'c6b', sorte: 'sprint', piste: 'neutre' }, { id: 'c6c', sorte: 'piste', piste: 'feu' }],
    finale: { id: 'c6f', sorte: 'piste', piste: 'feu', star: { espece: 'magma', nom: 'Volcanix', niveau: 24, talents: [3, 3, 3], caractere: 'calme', competences: ['turbo'] } },
    recompense: { pieces: 1600, plumesOr: 2, objets: { biscuit: 6 } } },
  { n: 7, id: 'nuit', nom: 'La Coupe de la Nuit', champion: 'hibou', type: 'nuit', badge: { nom: 'le Badge Lune', e: '🌙' },
    niveaux: [29, 32], especes: ['lune', 'hibou', 'luciole', 'brume', 'amanite'],
    courses: [{ id: 'c7a', sorte: 'marathon', piste: 'neutre' }, { id: 'c7b', sorte: 'haies', piste: 'neutre' }, { id: 'c7c', sorte: 'piste', piste: 'nuit' }],
    finale: { id: 'c7f', sorte: 'piste', piste: 'nuit', star: { espece: 'etoile', nom: 'Minuit', niveau: 31, talents: [3, 3, 3], caractere: 'calme', competences: ['canon'] } },
    recompense: { pieces: 1800, plumesOr: 3, objets: { biscuit: 7 } } },
  { n: 8, id: 'nuages', nom: 'La Coupe des Nuages', champion: 'azur', type: 'ciel', badge: { nom: 'le Badge Nuage', e: '☁️' },
    niveaux: [32, 35], especes: ['nuage', 'zephyr', 'dindarc', 'nimbus', 'pissenlit'],
    courses: [{ id: 'c8a', sorte: 'sprint', piste: 'neutre' }, { id: 'c8b', sorte: 'marathon', piste: 'neutre' }, { id: 'c8c', sorte: 'piste', piste: 'ciel' }],
    finale: { id: 'c8f', sorte: 'piste', piste: 'ciel', star: { espece: 'orage', nom: 'Tonnerre', niveau: 34, talents: [3, 3, 3], caractere: 'calme', competences: ['turbo'] } },
    recompense: { pieces: 2200, plumesOr: 3, objets: { biscuit: 8 } } }
];
/* les courses de l'histoire (hors championnat) */
export const SPECIALES = {
  essai: { id: 'essai', sorte: 'essai', piste: 'neutre', nom: 'La course d’essai', niveaux: [4, 7], especes: ['glouglou', 'paquerette', 'gaufrette', 'dindasable', 'crachin'], podium: false },
  gontran1: { id: 'gontran1', sorte: 'haies', piste: 'neutre', nom: 'Le défi de Gontran', niveaux: [9, 12], especes: ['glouglou', 'dromadaire', 'gaufrette', 'paquerette', 'crachin'],
    rival: { espece: 'dindofeu', nom: 'Flamby', dresseur: 'Gontran', niveau: 11, talents: [2, 1, 2], caractere: 'fonceuse', competences: [] } },
  gontran2: { id: 'gontran2', sorte: 'haies', piste: 'neutre', nom: 'La revanche de Gontran', niveaux: [19, 22], especes: ['trefle', 'mirageus', 'belgicus', 'liane', 'oasis'],
    rival: { espece: 'dindofeu', nom: 'Flamby', dresseur: 'Gontran', niveau: 21, talents: [3, 2, 3], caractere: 'fonceuse', competences: ['sprint'] } }
};
/* ── la Ligue des Légendes (chapitre 8) : les Quatre Plumes, puis Gontran ── */
export const LIGUE = [
  { id: 'ligue1', plume: 'plumeline', sorte: 'haies', piste: 'neutre', nom: 'La Ligue · Baronne Plumeline', niveaux: [37, 40], force: 7, especes: ['panthere', 'galaxie', 'amanite', 'pirate', 'yeti'],
    rival: { espece: 'panthere', nom: 'Duchesse', dresseur: 'Baronne Plumeline', niveau: 41, talents: [3, 3, 3], caractere: 'calme', stade: 'eveille', competences: ['esquive', 'turbo'], entrainement: [8, 8, 8] } },
  { id: 'ligue2', plume: 'dindini', sorte: 'piste', piste: 'nuit', nom: 'La Ligue · le Grand Dindini', niveaux: [38, 41], force: 7, especes: ['galaxie', 'momie', 'dracula', 'yeti', 'amanite'],
    rival: { espece: 'galaxie', nom: 'Abracadabra', dresseur: 'le Grand Dindini', niveau: 42, talents: [3, 3, 3], caractere: 'calme', stade: 'eveille', competences: ['turbo', 'cri'], entrainement: [8, 8, 8] } },
  { id: 'ligue3', plume: 'mamie', sorte: 'marathon', piste: 'neutre', nom: 'La Ligue · Mamie Glouglou', niveaux: [41, 44], force: 7, especes: ['mammouth', 'dragon', 'yeti', 'pirate', 'fritesfluo'],
    rival: { espece: 'dragon', nom: 'Pépère', dresseur: 'Mamie Glouglou', niveau: 49, talents: [5, 5, 4], caractere: 'tetue', stade: 'eveille', competences: ['souffle', 'turbo'], entrainement: [15, 15, 12] } },
  { id: 'ligue4', plume: 'rapido', sorte: 'sprint', piste: 'neutre', nom: 'La Ligue · Capitaine Rapido', niveaux: [40, 43], force: 7, especes: ['comete', 'dracula', 'galaxie', 'dragon', 'panthere'],
    rival: { espece: 'comete', nom: 'Fusée', dresseur: 'Capitaine Rapido', niveau: 45, talents: [3, 3, 3], caractere: 'calme', stade: 'eveille', competences: ['turbo', 'sprint'], entrainement: [10, 8, 8] } },
  { id: 'ligueGontran', plume: 'gontran', sorte: 'finale', piste: 'neutre', nom: 'La grande finale de la Ligue', niveaux: [39, 43], force: 8, especes: ['dracula', 'comete', 'dragon', 'galaxie', 'mammouth'],
    rival: { espece: 'dindofeu', nom: 'Flamby', dresseur: 'Gontran', niveau: 45, talents: [4, 4, 4], caractere: 'calme', stade: 'eveille', competences: ['sprint', 'turbo'], entrainement: [10, 10, 10] } }
];
/* ── après l'histoire : les Coupes des Maîtres (le champion de chaque championnat, niveau 50, talents forts) ── */
export const MAITRES = CHAMPIONNATS.map(C => ({ id: 'maitre' + C.n, n: C.n, champion: C.champion, type: C.type, sorte: 'piste', piste: C.finale.piste, nom: `La Coupe des Maîtres · ${C.nom.replace(/^La Coupe (des |de la |de )/, '')}`,
  niveaux: [45, 49], force: 9, especes: C.especes, rival: { ...C.finale.star, niveau: 50, talents: [5, 5, 5], caractere: 'calme', stade: 'eveille', entrainement: [12, 12, 12], competences: [...new Set([...(C.finale.star.competences || []), 'turbo'])].filter(c => c !== 'canon') } }));
/* le relais : deux courses, et le contre la montre : une course par piste ; la course sans fin */
export const RELAIS = [
  { id: 'relais1', sorte: 'relais', piste: 'neutre', nom: 'Le relais du Dindodrome', niveaux: [30, 36], force: 7, especes: ['trefle', 'mirageus', 'belgicus', 'liane', 'aurore', 'dindofeu', 'luciole', 'dindarc'] },
  { id: 'relais2', sorte: 'relais', piste: 'neutre', nom: 'Le relais des légendes', niveaux: [42, 47], force: 9, especes: ['coquelicot', 'dingue', 'atomium', 'jaguar', 'cristal', 'magma', 'etoile', 'orage'] }
];
export const PISTES_CHRONO = Object.keys(PISTES);
/* les gains d'une course, selon la place (1 à 6) et le championnat (1 à 4 ; 0 pour une course libre) */
export const gainsCourse = (place, n) => ({
  pieces: Math.round([100, 70, 50, 35, 25, 20][place - 1] * (n ? 1 + .3 * (n - 1) : .6)),
  xp: Math.round([160, 120, 95, 80, 65, 55][place - 1] * (n ? 1 + .25 * (n - 1) : .8))
});
