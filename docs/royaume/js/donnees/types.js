/* Les 8 types de dindies : chacun a sa couleur, son habitat au Domaine,
   sa région et sa piste au Dindodrome (une dindie court mieux sur la
   piste de son type, moins bien sur celle du type « opposé »). */
export const TYPES = {
  prairie: { nom: 'Prairie', e: '🌿', couleur: '#22c55e', clair: '#bbf7d0', habitat: 'le Pré fleuri', piste: 'la piste des Prés', oppose: 'feu' },
  sable:   { nom: 'Sable',   e: '🏜️', couleur: '#f59e0b', clair: '#fde68a', habitat: 'la Dune', piste: 'la piste des Dunes', oppose: 'pluie' },
  pluie:   { nom: 'Pluie',   e: '💧', couleur: '#3b82f6', clair: '#bfdbfe', habitat: 'la Mare', piste: 'la piste de Boue', oppose: 'sable' },
  jungle:  { nom: 'Jungle',  e: '🌴', couleur: '#10b981', clair: '#a7f3d0', habitat: 'la Serre', piste: 'la piste des Lianes', oppose: 'glace' },
  glace:   { nom: 'Glace',   e: '❄️', couleur: '#22d3ee', clair: '#cffafe', habitat: 'l’Igloo', piste: 'la piste de Glace', oppose: 'feu' },
  feu:     { nom: 'Feu',     e: '🔥', couleur: '#ef4444', clair: '#fecaca', habitat: 'la Forge', piste: 'la piste de Lave', oppose: 'glace' },
  nuit:    { nom: 'Nuit',    e: '🌙', couleur: '#6366f1', clair: '#c7d2fe', habitat: 'le Bosquet de lune', piste: 'la piste de Nuit', oppose: 'ciel' },
  ciel:    { nom: 'Ciel',    e: '☁️', couleur: '#60a5fa', clair: '#e0f2fe', habitat: 'le Nid des nuages', piste: 'la piste des Nuages', oppose: 'nuit' }
};
export const ORDRE_TYPES = Object.keys(TYPES);

/* Les 4 raretés */
export const RARETES = {
  commune:  { nom: 'Commune',  couleur: '#9ca3af', rang: 0 },
  rare:     { nom: 'Rare',     couleur: '#3b82f6', rang: 1 },
  epique:   { nom: 'Épique',   couleur: '#a855f7', rang: 2 },
  mythique: { nom: 'Mythique', couleur: '#f59e0b', rang: 3 }
};
