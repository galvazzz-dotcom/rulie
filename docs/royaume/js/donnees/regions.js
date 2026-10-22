/* ══════════ LES 8 RÉGIONS DU ROYAUME ══════════
   On y va en montgolfière, depuis le port du Domaine. Les 3 premières sont ouvertes à l'étape 3.
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
  jungle: { n: 4, nom: 'La Jungle', e: '🌴', type: 'jungle', equipement: 'jumelles', carte: [80, 30], bientot: true },
  banquise: { n: 5, nom: 'La Banquise', e: '❄️', type: 'glace', equipement: 'moufles', carte: [87, 60], bientot: true },
  volcan: { n: 6, nom: 'Le Volcan', e: '🔥', type: 'feu', equipement: 'bottesLave', carte: [70, 84], bientot: true },
  foret: { n: 7, nom: 'La Forêt de la Lune', e: '🌙', type: 'nuit', equipement: 'lanterne', carte: [26, 86], bientot: true },
  nuages: { n: 8, nom: 'Le Royaume des Nuages', e: '☁️', type: 'ciel', equipement: 'ailes', carte: [76, 8], bientot: true }
};
export const ORDRE_REGIONS = Object.keys(REGIONS);
/* le Domaine, sur la carte du monde */
export const DOMAINE_CARTE = [50, 52];

/* la région d'une espèce sauvage, et ses conditions d'apparition */
export function regleDe(espece) {
  for (const [id, R] of Object.entries(REGIONS)) if (R.especes && R.especes[espece]) return { region: id, ...R.especes[espece] };
  return null;
}
const QUAND = { jour: '🌞 le jour', nuit: '🌙 la nuit', matin: '🌅 le matin' }, METEO = { soleil: '☀️ quand il fait beau', pluie: '🌧️ quand il pleut' };
const ZONES = {
  pre: 'dans l’herbe des Prés', fleurs: 'au milieu des fleurs', trefles: 'près des trèfles', coquelicots: 'dans le champ de coquelicots',
  dunes: 'dans les dunes', oasis: 'près de l’oasis', souk: 'près des lanternes du souk',
  place: 'sur la Grand-Place', canaux: 'au bord des canaux', beffroi: 'au pied du beffroi', atomium: 'près de l’Atomium'
};
/* le texte des conditions (pour le Grand Livre) ; nomObjet : (id) → « un chapeau de soleil » */
export function texteConditions(espece, nomObjet = id => id) {
  const r = regleDe(espece); if (!r) return '';
  const t = [ZONES[r.zone] || ''];
  if (r.quand) t.push(QUAND[r.quand]);
  if (r.meteo) t.push(METEO[r.meteo]);
  if (r.equipement) t.push('il faut ' + nomObjet(r.equipement));
  if (r.quete) t.push('après une quête de ' + REGIONS[r.region].nom.replace(/^(Le |La |Les )/, m => m.toLowerCase()));
  return t.filter(Boolean).join(' · ');
}
