/* ══════════ LES DINDIES SAUVAGES D'UNE RÉGION ══════════
   Elles apparaissent dans leur coin (zone), selon l'heure, la météo, l'équipement et l'histoire.
   Sans l'équipement de la région, une rare n'est qu'un « mirage » : elle clignote et s'efface quand on approche.
   creerSauvages(lieu, { etapeAtteinte, particules, quandVue }) → { liste, maj, sauvageDe, retirer, faireFuir, liberer } */
import * as THREE from 'three';
import { creerDindie } from '../dindies/modele.js';
import { variante } from '../dindies/adn.js';
import { PAR_ID } from '../donnees/especes.js';
import { REGIONS } from '../donnees/regions.js';
import { TYPES } from '../donnees/types.js';
import { estJour, estNuit, estMatin } from '../moteur/temps.js';
import { meteo } from '../moteur/meteo.js';
import { crier } from './cris.js';
import * as J from './etat.js';
import { typeFete } from './evenements.js';

const MAX = 6;
let compteur = 0;
export function conditionsOk(region, espece, etapeAtteinte) {
  const r = REGIONS[region].especes[espece];
  if (r.quete && !etapeAtteinte(r.quete)) return false;
  if (r.quand === 'jour' && !estJour()) return false;
  if (r.quand === 'nuit' && !estNuit()) return false;
  if (r.quand === 'matin' && !estMatin()) return false;
  if (r.meteo && meteo(region) !== r.meteo) return false;
  return true;
}
export function creerSauvages(lieu, { etapeAtteinte, particules, quandVue }) {
  const R = REGIONS[lieu.id], liste = [];
  let prochain = 0, premiers = 4;

  function candidates() {
    const e = J.etat(), out = [], tf = typeFete();
    for (const [esp, r] of Object.entries(R.especes)) {
      if (!conditionsOk(lieu.id, esp, etapeAtteinte)) continue;
      const epique = PAR_ID[esp].rarete === 'epique';
      if (epique && liste.some(s => s.espece === esp)) continue;
      const fantome = !!(r.equipement && !e.inventaire[r.equipement]);
      if (fantome && liste.some(s => s.fantome)) continue;
      /* pendant une fête, les dindies de son type sortent deux fois plus */
      out.push({ esp, r, poids: (r.poids || 1) * (fantome ? .6 : 1) * (epique ? 1.6 : 1) * (tf && PAR_ID[esp].types.includes(tf) ? 2 : 1), fantome });
    }
    return out;
  }
  function pointDans([cx, cz, rr], loinDe) {
    for (let k = 0; k < 20; k++) {
      const a = Math.random() * 6.28, d = Math.sqrt(Math.random()) * rr, x = cx + Math.cos(a) * d, z = cz + Math.sin(a) * d;
      if (!lieu.grille.libreEn(x, z) || !lieu.grille.libreEn(x + .4, z) || !lieu.grille.libreEn(x - .4, z)) continue;
      if (loinDe && Math.hypot(x - loinDe.x, z - loinDe.z) < 7) continue;
      return [x, z];
    }
    return null;
  }
  function apparaitre(joueur, force = null) {
    const C = candidates().filter(c => !force || c.esp === force); if (!C.length) return null;
    const tot = C.reduce((a, c) => a + c.poids, 0); let t = Math.random() * tot, c = C[0];
    for (const x of C) { t -= x.poids; if (t <= 0) { c = x; break; } }
    const zones = lieu.zones[c.r.zone]; if (!zones) return null;
    const zone = zones[Math.floor(Math.random() * zones.length)], p = pointDans(zone, force ? null : joueur); if (!p) return null;
    const esp = PAR_ID[c.esp], chroma = !c.fantome && Math.random() < 1 / 64;
    const m = creerDindie(variante(esp, { chroma }));
    m.racine.position.set(p[0], lieu.sol(p[0], p[1]), p[1]); m.racine.rotation.y = Math.random() * 6.28;
    m.racine.scale.multiplyScalar(.01);
    lieu.racine.add(m.racine);
    const [n0, n1] = R.niveaux, niveau = n0 + Math.floor(Math.random() * (n1 - n0 + 1)) + (esp.rarete === 'epique' ? 3 : 0);
    const s = { id: 's' + (compteur++), espece: c.esp, chroma, niveau, m, zone, fantome: c.fantome, etat: 'apparait', t: 0, cible: null, attente: 1 + Math.random() * 2,
      action: 2 + Math.random() * 5, vie: 140 + Math.random() * 120, vu: false, taille: m.adn.taille };
    m.racine.traverse(o => { o.userData.sauvage = s.id; });
    liste.push(s);
    particules && particules(new THREE.Vector3(p[0], .4, p[1]), { n: 16, couleur: TYPES[esp.types[0]].couleur, taille: .35, vitesse: 3, monte: 1.6, duree: 1 });
    return s;
  }
  function retirer(s, pouf = true) {
    const k = liste.indexOf(s); if (k < 0) return;
    liste.splice(k, 1);
    if (pouf && particules) { const q = s.m.racine.position; particules(new THREE.Vector3(q.x, .5, q.z), { n: 18, couleur: '#ffffff', taille: .45, vitesse: 3.5, monte: 1.4, duree: 1 }); }
    s.m.liberer();
  }
  function faireFuir(s) { s.etat = 'fuite'; s.t = 0; }

  function maj(dt, t, joueur, nuit, enCapture) {
    if (premiers > 0) { premiers--; apparaitre(premiers > 1 ? null : joueur); }
    prochain -= dt;
    if (prochain <= 0) { prochain = 5 + Math.random() * 6; if (liste.length < MAX) apparaitre(joueur); }
    for (const s of [...liste]) {
      const m = s.m, q = m.racine.position, d = Math.hypot(q.x - joueur.x, q.z - joueur.z);
      m.racine.visible = d < 50; m.montrerContours(d < 30);
      s.t += dt;
      if (s.etat === 'apparait') { const k = Math.min(1, s.t / .5); m.racine.scale.setScalar(s.taille * (.01 + .99 * k)); if (k >= 1) s.etat = 'erre'; }
      /* on l'a vue ! */
      if (!s.vu && d < 15 && !s.fantome) { s.vu = true; const nouvelle = !J.etat().livre.vus[s.espece]; J.voir(s.espece); quandVue && quandVue(s, nouvelle); }
      if (s.fantome) {
        m.racine.visible = d < 50 && (Math.sin(t * 9 + q.x) > -.3 || Math.sin(t * 2.3) > .6);
        q.y = lieu.sol(q.x, q.z) + .25 + Math.sin(t * 2) * .15;
        if (d < 5.5 && s.etat !== 'fuite') { s.etat = 'fuite'; s.t = 0; s.raison = 'mirage'; quandVue && quandVue(s, false, 'mirage'); }
      }
      if (s.etat === 'fuite') {
        const dx = q.x - joueur.x, dz = q.z - joueur.z, l = Math.hypot(dx, dz) || 1;
        const [nx, nz] = lieu.grille.glisser(q.x, q.z, dx / l * 5 * dt, dz / l * 5 * dt, .3);
        q.x = nx; q.z = nz; m.racine.rotation.y = Math.atan2(dx, dz); m.marcher(3);
        m.racine.scale.setScalar(s.taille * Math.max(.01, 1 - Math.max(0, s.t - .8) * 1.5));
        if (s.t > 1.5) { retirer(s); continue; }
      } else if (s.etat === 'capture') {
        m.marcher(0);
        m.racine.rotation.y = angle(m.racine.rotation.y, Math.atan2(joueur.x - q.x, joueur.z - q.z), .1);
      } else if (s.etat === 'erre') {
        s.vie -= dt;
        const encorePossible = conditionsOk(lieu.id, s.espece, etapeAtteinte);
        if ((s.vie < 0 || !encorePossible) && d > 14 && !enCapture) { retirer(s); continue; }
        if (d < 7 && !s.fantome) {
          /* elle regarde Roullieee, un peu curieuse */
          m.marcher(0); s.cible = null;
          m.racine.rotation.y = angle(m.racine.rotation.y, Math.atan2(joueur.x - q.x, joueur.z - q.z), .06);
        } else if (!s.cible) {
          m.marcher(0); s.attente -= dt;
          if (s.attente < 0) { const p = pointDans(s.zone, null); s.cible = p; s.attente = 1.5 + Math.random() * 4; }
        } else {
          const dx = s.cible[0] - q.x, dz = s.cible[1] - q.z, l = Math.hypot(dx, dz);
          if (l < .15) s.cible = null;
          else {
            const v = 1.2, [nx, nz] = lieu.grille.glisser(q.x, q.z, dx / l * Math.min(l, v * dt), dz / l * Math.min(l, v * dt), .25);
            if (nx === q.x && nz === q.z) s.cible = null;
            q.x = nx; q.z = nz; m.racine.rotation.y = angle(m.racine.rotation.y, Math.atan2(dx, dz), .12); m.marcher(.8);
          }
        }
        s.action -= dt;
        if (s.action < 0) { s.action = 4 + Math.random() * 6; const r = Math.random(); m.jouer(r < .5 ? 'picore' : r < .8 ? 'glouglou' : 'roue'); if (r >= .5 && r < .8 && d < 10) crier(s, { volume: d < 5 ? .8 : .55 }); }
      }
      if (!s.fantome) q.y = lieu.sol(q.x, q.z);
      m.maj(dt, t);
    }
  }
  const sauvageDe = obj => { let o = obj; while (o && !o.userData.sauvage) o = o.parent; return o ? liste.find(s => s.id === o.userData.sauvage) : null; };
  return {
    liste, maj, sauvageDe, retirer, faireFuir, objets: () => liste.map(s => s.m.racine), liberer: () => { for (const s of [...liste]) retirer(s, false); },
    /* pour les tests automatiques : faire apparaître une espèce précise (si ses conditions sont réunies) */
    invoquer: esp => apparaitre(null, esp)
  };
}
const angle = (a, b, k) => { let d = ((b - a + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) - Math.PI; return a + d * k; };
