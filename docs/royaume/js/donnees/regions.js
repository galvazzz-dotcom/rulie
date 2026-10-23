/* ══════════ LES 8 RÉGIONS DU ROYAUME ══════════
   On y va en montgolfière, depuis le port du Domaine. Les 3 premières s'ouvrent au chapitre 2, les 5 autres aux chapitres 5 à 7.
   especes : qui vit là, et à quelles conditions elle se montre
     zone        : le coin de la région où elle apparaît
     poids       : plus c'est grand, plus on la croise souvent
     quand       : 'jour' | 'nuit' | 'matin' (de 6 h à midi) — sinon, à toute heure
     meteo       : 'soleil' | 'pluie' — sinon, par tous les temps
     equipement  : l'objet qu'il faut avoir sur soi (les rares)
     quete       : l'étape de quête à partir de laquelle elle existe (les épiques) */
export const REGIONS = {
  pres: {
    n: 1, nom: 'Les Prés', e: '🌿', type: 'prairie', equipement: 'filet', guide: 'gaston', ambiance: 'pres', carte: [27, 60],
    niveaux: [3, 7], meteo: { soleil: 55, nuages: 30, pluie: 15 },
    desc: 'Des collines fleuries, un moulin et une mare. Le pays des dindies paisibles.',
    especes: {
      glouglou: { zone: 'pre', poids: 1 },
      paquerette: { zone: 'fleurs', poids: 1, quand: 'jour' },
      trefle: { zone: 'trefles', poids: .45, equipement: 'filet' },
      coquelicot: { zone: 'coquelicots', poids: 1, quand: 'matin', quete: 'coquelicot' }
    }
  },
  maroc: {
    n: 2, nom: 'Le Maroc imaginaire', e: '🏜️', type: 'sable', equipement: 'chapeauSoleil', guide: 'leila', ambiance: 'maroc', carte: [15, 33],
    niveaux: [7, 12], meteo: { soleil: 72, nuages: 24, pluie: 4 },
    desc: 'Des dunes dorées, une oasis, un ksar et un souk plein de lanternes.',
    especes: {
      dindasable: { zone: 'dunes', poids: 1 },
      dromadaire: { zone: 'oasis', poids: 1, quand: 'jour' },
      mirageus: { zone: 'dunes', poids: .45, equipement: 'chapeauSoleil', meteo: 'soleil' },
      dingue: { zone: 'souk', poids: 1, quand: 'nuit', quete: 'dingue' }
    }
  },
  belgique: {
    n: 3, nom: 'La Belgique', e: '💧', type: 'pluie', equipement: 'parapluie', guide: 'waffel', ambiance: 'belgique', carte: [47, 16],
    niveaux: [10, 15], meteo: { pluie: 50, nuages: 35, soleil: 15 },
    desc: 'Des canaux, des maisons à pignons, un beffroi… et l’Atomium !',
    especes: {
      gaufrette: { zone: 'place', poids: 1 },
      crachin: { zone: 'canaux', poids: 1 },
      belgicus: { zone: 'beffroi', poids: .45, equipement: 'parapluie' },
      atomium: { zone: 'atomium', poids: 1, meteo: 'pluie', quete: 'atomium' }
    }
  },
  jungle: {
    n: 4, nom: 'La Jungle', e: '🌴', type: 'jungle', equipement: 'jumelles', guide: 'tarzanette', ambiance: 'jungle', carte: [80, 30],
    niveaux: [15, 20], meteo: { pluie: 40, nuages: 35, soleil: 25 },
    desc: 'Des arbres géants, des lianes, une cascade… et un vieux temple caché sous la mousse.',
    especes: {
      perroquet: { zone: 'canopee', poids: 1, quand: 'jour' },
      banane: { zone: 'bananeraie', poids: 1 },
      liane: { zone: 'lianes', poids: .45, equipement: 'jumelles' },
      jaguar: { zone: 'temple', poids: 1, meteo: 'pluie', quete: 'jaguar' }
    }
  },
  banquise: {
    n: 5, nom: 'La Banquise', e: '❄️', type: 'glace', equipement: 'moufles', guide: 'inuk', ambiance: 'banquise', carte: [87, 60],
    niveaux: [18, 23], meteo: { soleil: 40, nuages: 35, neige: 25 },
    desc: 'Un village d’igloos, un lac gelé, un glacier bleu et une grotte de glace qui scintille.',
    especes: {
      dindingloo: { zone: 'igloos', poids: 1 },
      pingouin: { zone: 'banquise', poids: 1 },
      aurore: { zone: 'glacier', poids: .45, equipement: 'moufles' },
      cristal: { zone: 'grotte', poids: 1, quand: 'matin', quete: 'cristal' }
    }
  },
  volcan: {
    n: 6, nom: 'Le Volcan', e: '🔥', type: 'feu', equipement: 'bottesLave', guide: 'lava', ambiance: 'volcan', carte: [70, 84],
    niveaux: [21, 26], meteo: { soleil: 50, nuages: 40, pluie: 10 },
    desc: 'Une montagne qui fume, des rivières de lave, des colonnes de basalte et la forge de Madame Lava.',
    especes: {
      cendre: { zone: 'cendres', poids: 1 },
      braise: { zone: 'braises', poids: 1 },
      dindofeu: { zone: 'coulee', poids: .45, equipement: 'bottesLave' },
      magma: { zone: 'cratere', poids: 1, quand: 'nuit', quete: 'magma' }
    }
  },
  foret: {
    n: 7, nom: 'La Forêt de la Lune', e: '🌙', type: 'nuit', equipement: 'lanterne', guide: 'hibou', ambiance: 'foret', carte: [26, 86],
    niveaux: [24, 29], meteo: { soleil: 45, nuages: 40, pluie: 15 },
    desc: 'Une forêt bleue où il fait toujours un peu nuit : des champignons qui brillent, un étang de lune, l’observatoire du Comte Hibou.',
    especes: {
      lune: { zone: 'clairiere', poids: 1 },
      hibou: { zone: 'bois', poids: 1, quand: 'nuit' },
      luciole: { zone: 'etang', poids: .45, equipement: 'lanterne' },
      etoile: { zone: 'colline', poids: 1, quand: 'nuit', quete: 'etoile' }
    }
  },
  nuages: {
    n: 8, nom: 'Le Royaume des Nuages', e: '☁️', type: 'ciel', equipement: 'ailes', guide: 'azur', ambiance: 'nuages', carte: [76, 8],
    niveaux: [27, 32], meteo: { soleil: 55, nuages: 30, pluie: 15 },
    desc: 'Une île posée sur une mer de nuages, un arc-en-ciel, des moulinets qui chantent et le palais des nuages.',
    especes: {
      nuage: { zone: 'nuages', poids: 1 },
      zephyr: { zone: 'vents', poids: 1, quand: 'jour' },
      dindarc: { zone: 'arc', poids: .45, equipement: 'ailes' },
      orage: { zone: 'sommet', poids: 1, meteo: 'pluie', quete: 'orage' }
    }
  }
};
export const ORDRE_REGIONS = Object.keys(REGIONS);
/* le Domaine, sur la carte du monde */
export const DOMAINE_CARTE = [50, 52];

/* la région d'une espèce sauvage, et ses conditions d'apparition */
export function regleDe(espece) {
  for (const [id, R] of Object.entries(REGIONS)) if (R.especes && R.especes[espece]) return { region: id, ...R.especes[espece] };
  return null;
}
const QUAND = { jour: '🌞 le jour', nuit: '🌙 la nuit', matin: '🌅 le matin' }, METEO = { soleil: '☀️ quand il fait beau', pluie: '🌧️ quand il pleut', neige: '❄️ quand il neige' };
const ZONES = {
  pre: 'dans l’herbe des Prés', fleurs: 'au milieu des fleurs', trefles: 'près des trèfles', coquelicots: 'dans le champ de coquelicots',
  dunes: 'dans les dunes', oasis: 'près de l’oasis', souk: 'près des lanternes du souk',
  place: 'sur la Grand-Place', canaux: 'au bord des canaux', beffroi: 'au pied du beffroi', atomium: 'près de l’Atomium',
  canopee: 'à l’orée de la jungle', bananeraie: 'dans la bananeraie', lianes: 'sous les arbres géants', temple: 'devant le temple perdu',
  igloos: 'près du village d’igloos', banquise: 'sur la banquise, au bord de l’eau', glacier: 'au pied du glacier', grotte: 'devant la grotte de glace',
  cendres: 'dans les champs de cendre', braises: 'près des pierres chaudes', coulee: 'au bord de la coulée de lave', cratere: 'en haut, près du cratère',
  clairiere: 'dans la clairière', bois: 'dans les bois bleus', etang: 'autour de l’étang de lune', colline: 'sur la colline aux étoiles',
  nuages: 'sur les nuages', vents: 'près des moulinets', arc: 'sous l’arc-en-ciel', sommet: 'au sommet, près du palais'
};
/* le texte des conditions (pour le Grand Livre) ; nomObjet : (id) → « un chapeau de soleil » */
export function texteConditions(espece, nomObjet = id => id) {
  const r = regleDe(espece); if (!r) return '';
  const t = [ZONES[r.zone] || ''];
  if (r.quand) t.push(QUAND[r.quand]);
  if (r.meteo) t.push(METEO[r.meteo]);
  if (r.equipement) t.push('il faut ' + nomObjet(r.equipement));
  /* (« des Prés », « du Maroc imaginaire », « de la Belgique ») */
  if (r.quete) t.push('après une quête ' + REGIONS[r.region].nom.replace(/^(Les |Le |La )/, m => ({ 'Les ': 'des ', 'Le ': 'du ', 'La ': 'de la ' })[m]));
  return t.filter(Boolean).join(' · ');
}
