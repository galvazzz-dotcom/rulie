/* Libérer un lieu qu'on quitte : retirer son groupe de la scène et rendre à la carte graphique
   les géométries, matériaux et textures qui lui sont propres (jamais ce qui est partagé). */
import { estGeoPartagee } from './formes.js';
import { estPartage } from './materiaux.js';

export function libererGroupe(racine) {
  racine.parent && racine.parent.remove(racine);
  const geos = new Set(), mats = new Set(), texs = new Set();
  const tex = t => { if (t && t.isTexture && !estPartage(t)) texs.add(t); };
  racine.traverse(o => {
    if (o.geometry && !estGeoPartagee(o.geometry)) geos.add(o.geometry);
    const ms = Array.isArray(o.material) ? o.material : o.material ? [o.material] : [];
    for (const m of ms) {
      if (estPartage(m)) continue;
      mats.add(m); tex(m.map); tex(m.alphaMap); tex(m.emissiveMap);
      if (m.uniforms) for (const u of Object.values(m.uniforms)) tex(u.value);
    }
    if (o.isInstancedMesh) o.dispose();
  });
  geos.forEach(g => g.dispose()); mats.forEach(m => m.dispose()); texs.forEach(t => t.dispose());
  return { geometries: geos.size, materiaux: mats.size, textures: texs.size };
}
