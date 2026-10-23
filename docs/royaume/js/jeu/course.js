/* ══════════ LA SIMULATION D'UNE COURSE (sans dessin) ══════════
   6 dindies, pas à pas (maj(dt)). Ce qui compte (plan, 8.1) :
   - ⚡ la vitesse de pointe ; 💪 l'endurance (sous 30 %, on ralentit) ; 🦘 le saut (les haies : saut parfait, bon, ou chute = ~1 s perdue) ;
   - le terrain : + 8 % sur la piste de son type, − 8 % sur celle du type opposé (pas de malus en mode aide) ; les zones de sable ou de boue (− 15 %) ;
   - les compétences, avec leur recharge.
   La joueuse peut : sauter au bon moment (sinon le saut se fait tout seul, selon le 🦘), lancer ses compétences, foncer (plus vite, plus fatigant).
   Après l'histoire (étape 8) : le relais (3 dindies par équipe, chacune court un tiers de la distance), le contre la montre
   (seule sur la piste) et la course sans fin (sans arrivée : on s'arrête à la 3e chute, ou quand il ne reste plus de forces).
   creerCourse(options) → { t, phase, coureurs, maj(dt), sauter(), competence(i), foncer(v), evenements, classement() } */
import { PAR_ID } from '../donnees/especes.js';
import { TYPES } from '../donnees/types.js';
import { COMPETENCES, competencesDe, PISTES } from '../donnees/courses.js';
import { stats } from './individus.js';

export const COMPTE = 3;                 /* le compte à rebours : 3, 2, 1, partez ! */
const K_FATIGUE = 1.9, ACC = 5.5, FREIN = 9;
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));

/* les qualités d'une dindie pour la course */
export function qualites(d, pisteType, aide) {
  const [sv, se, sj] = stats(d), types = PAR_ID[d.espece].types;
  let terrain = 1;
  if (pisteType) {
    if (types.includes(pisteType)) terrain = 1.08;
    else if (!aide && types.some(t => TYPES[t].oppose === pisteType)) terrain = .92;
  }
  return { vMax: 9 + .2 * sv, Emax: 55 + 1.8 * se, sj, terrain, chezElle: !!pisteType && types.includes(pisteType), stats: [sv, se, sj] };
}

/* options : { piste, distance, haies, zones, coureurs: [{ id, nom, dresseur, d, joueur, equipe? }], aide, nuit, rng, relais, sansFin } */
export const CHUTES_SANS_FIN = 3;
export function creerCourse({ piste = 'neutre', distance, haies = [], zones = [], coureurs, aide = false, nuit = false, rng = Math.random, relais = false, sansFin = false }) {
  const P = PISTES[piste], ouverte = !P.type || ['prairie', 'sable', 'ciel'].includes(P.type);
  const evenements = [];
  const emettre = (type, R, extra = {}) => evenements.push({ type, r: R ? R.i : -1, ...extra });
  const C = { t: -COMPTE, phase: 'compte', distance, haies, zones, piste, evenements, coureurs: [], fini: false, tFin: null, ordreArrivee: [], relais, sansFin, jambe: relais ? distance / 3 : 0 };

  C.coureurs = coureurs.map((c, i) => {
    const Q = qualites(c.d, P.type, aide && c.joueur);
    const comp = competencesDe(c.d);
    return {
      i, id: c.id, nom: c.nom, dresseur: c.dresseur, d: c.d, joueur: !!c.joueur, experte: !!c.experte, ...Q,
      vMax: Q.vMax * (.975 + rng() * .05),   /* la forme du jour : ± 2,5 % */
      pos: 0, v: 0, E: Q.Emax, allure: 1, fonce: false, reaction: c.joueur ? .18 : .08 + rng() * .22, parti: false,
      fini: false, temps: null, place: null, prochaine: 0, saut: null, chute: 0, effets: [], charges: { parfait: 0, esquive: 0 },
      competences: comp, recharges: comp.map(() => 0), utilisees: comp.map(() => false), tIA: rng() * .25,
      perso: .9 + rng() * .2,     /* chaque adversaire lance ses compétences à sa façon */
      equipe: relais ? (c.equipe || [c.d, c.d, c.d]) : null, jambe: 0, chutes: 0
    };
  });
  /* le relais : la dindie suivante de l'équipe prend le relais (fraîche, avec ses compétences) */
  function passerRelais(R) {
    R.jambe++; R.d = R.equipe[R.jambe];
    const Q = qualites(R.d, P.type, aide && R.joueur), comp = competencesDe(R.d);
    Object.assign(R, Q, { vMax: Q.vMax * (.975 + rng() * .05), E: Q.Emax, competences: comp, recharges: comp.map(() => 0), utilisees: comp.map(() => false), saut: null, chute: 0, effets: [], charges: { parfait: 0, esquive: 0 } });
    emettre('relais', R, { jambe: R.jambe });
  }
  const joueur = () => C.coureurs.find(R => R.joueur);

  /* ── les effets (boosts, ralentissements, immunités) ── */
  const ajouter = (R, sorte, duree, k = 1) => { R.effets.push({ sorte, fin: C.t + duree, k }); };
  const actif = (R, sorte) => R.effets.some(e => e.sorte === sorte && e.fin > C.t);
  const produit = (R, sorte) => R.effets.reduce((m, e) => e.sorte === sorte && e.fin > C.t ? m * e.k : m, 1);
  const dansZone = s => zones.some(([a, b]) => s >= a && s <= b);
  const prochaineHaie = R => haies[R.prochaine];
  const devant = R => C.coureurs.filter(X => X !== R && !X.fini && X.pos > R.pos).sort((a, b) => a.pos - b.pos)[0];
  const derriere = R => C.coureurs.filter(X => X !== R && !X.fini && X.pos < R.pos).sort((a, b) => b.pos - a.pos)[0];

  /* ── les compétences ── */
  function peutLancer(R, k) {
    const id = R.competences[k], Cp = COMPETENCES[id];
    if (!id || R.fini || C.phase !== 'course' || !R.parti) return false;
    if (Cp.unique && R.utilisees[k]) return false;
    if (R.recharges[k] > C.t) return false;
    if (id === 'canon' && C.t > 3) return false;
    if (id === 'sprint' && R.pos < distance * .8) return false;
    return true;
  }
  function lancer(R, k) {
    if (!peutLancer(R, k)) return false;
    const id = R.competences[k], Cp = COMPETENCES[id];
    R.utilisees[k] = true; R.recharges[k] = C.t + (Cp.recharge || 999);
    switch (id) {
      case 'turbo': ajouter(R, 'boost', 2, 1.25); break;
      case 'canon': R.v = Math.max(R.v, R.vMax * 1.05); ajouter(R, 'boost', 2.2, 1.15); break;
      case 'sprint': ajouter(R, 'boost', 99, 1.12); break;
      case 'souffle': R.E = Math.min(R.Emax, R.E + R.Emax * .4); break;
      case 'crapaud': R.charges.parfait = Math.max(R.charges.parfait, 2); break;
      case 'planeur': ajouter(R, 'boost', 3, 1.12); ajouter(R, 'glisse', 3); ajouter(R, 'parfait', 3); break;
      case 'glissade': case 'velours': ajouter(R, 'glisse', 6); ajouter(R, 'boost', 6, 1.04); break;
      case 'aspiration': { const D = devant(R); ajouter(R, 'boost', 3, D && D.pos - R.pos < 9 ? 1.2 : 1.06); break; }
      case 'esquive': R.charges.esquive = 1; break;
      case 'cri': ajouter(R, 'boost', 3, 1.12); break;
      case 'vent': ajouter(R, 'boost', 3, ouverte ? 1.2 : 1.13); break;
      case 'ombre': for (const X of C.coureurs) if (X !== R && !X.fini && Math.abs(X.pos - R.pos) < 11) ajouter(X, 'lent', 1.6, .86); break;
      case 'mirage': for (const X of C.coureurs) if (X !== R && !X.fini) ajouter(X, 'lent', 2, .93); break;
      case 'racines': ajouter(R, 'solide', 6); break;
      case 'etincelle': ajouter(R, 'boost', 4, 1.1); ajouter(R, 'etincelle', 4); break;
      case 'carapace': ajouter(R, 'carapace', 3); ajouter(R, 'boost', 3, 1.05); break;
      case 'lune': ajouter(R, 'parfait', 5); if (nuit) ajouter(R, 'boost', 5, 1.08); break;
      case 'plumes': { const D = derriere(R); if (D && R.pos - D.pos < 11) ajouter(D, 'lent', 2, .8); break; }
      case 'arc': ajouter(R, 'boost', 2, 1.12); R.E = Math.min(R.Emax, R.E + R.Emax * .15); R.charges.parfait = Math.max(R.charges.parfait, 1); break;
    }
    emettre('competence', R, { id });
    return true;
  }
  /* quand une adversaire (ou la joueuse en mode aide) lance-t-elle une compétence ? */
  function envieDe(R, id) {
    const h = prochaineHaie(R), dh = h === undefined ? 1e9 : h - R.pos, D = devant(R), B = derriere(R), fin = R.pos > distance * .8;
    switch (id) {
      case 'canon': return true;
      case 'sprint': return true;
      case 'souffle': return R.E < R.Emax * .32;
      case 'crapaud': case 'esquive': case 'lune': return dh < 22;
      case 'planeur': return dh < 30 || zones.some(([a]) => a - R.pos > 0 && a - R.pos < 20) || fin;
      case 'glissade': case 'velours': return zones.some(([a, b]) => a - R.pos < 14 && b > R.pos) || (!zones.length && fin);
      case 'aspiration': return D && D.pos - R.pos < 8;
      case 'ombre': return C.coureurs.some(X => X !== R && !X.fini && Math.abs(X.pos - R.pos) < 10);
      case 'plumes': return B && R.pos - B.pos < 10;
      case 'carapace': return R.E < R.Emax * .5 || fin;
      default: return C.t > 2 * R.perso;   /* turbo, cri, vent, mirage, racines, étincelle, arc */
    }
  }

  /* ── le saut d'une haie : décidé un peu avant, appliqué en passant la haie ── */
  function decider(R, qualite, tau) {
    const h = prochaineHaie(R);
    const vol = clamp(2 * tau, .35, .8) * Math.max(4, R.v);
    R.saut = { h, q: qualite, p0: R.pos, p1: qualite === 'tot' ? Math.min(h - .4, R.pos + .55 * Math.max(4, R.v)) : qualite === 'chute' ? h : Math.max(h + .6, R.pos + vol) };
  }
  function sautAuto(R) {
    if (actif(R, 'parfait') || R.charges.parfait > 0) { if (!actif(R, 'parfait')) R.charges.parfait--; return 'parfait'; }
    if (R.joueur && aide) return rng() < .35 ? 'parfait' : 'bon';
    if (R.experte) return rng() < .7 ? 'parfait' : 'bon';     /* (simulation : une joueuse qui saute toujours au bon moment) */
    const ok = clamp(.62 + R.sj * .011, .62, .97), parf = clamp(.08 + R.sj * .008, .08, .5);
    const r = rng();
    return r < ok * parf ? 'parfait' : r < ok ? 'bon' : 'chute';
  }
  function passerHaie(R) {
    let q = R.saut ? R.saut.q : 'chute';
    if (q === 'hop') q = R.saut.p1 > haies[R.prochaine] ? 'bon' : 'chute';
    if ((q === 'chute' || q === 'tot') && (actif(R, 'solide') || actif(R, 'parfait'))) q = 'bon';
    if ((q === 'chute' || q === 'tot') && R.charges.esquive) { R.charges.esquive = 0; q = 'bon'; emettre('esquive', R); }
    if (q === 'parfait') ajouter(R, 'boost', 1, 1.12);
    if (q === 'chute' || q === 'tot') { R.chute = .95; R.saut = null; R.chutes++; }
    emettre('haie', R, { q, h: haies[R.prochaine], n: R.prochaine });
    R.prochaine++;
  }

  /* ── la joueuse ── */
  C.sauter = () => {
    const R = joueur(); if (!R || R.fini) return null;
    if (C.phase === 'compte') { emettre('tropTot', R); return 'attends'; }
    if (!R.parti && C.t < .4) { R.parti = true; R.reaction = 0; ajouter(R, 'boost', 1.5, 1.1); emettre('departParfait', R); return 'depart'; }
    if (R.chute > 0 || R.saut) return null;
    const h = prochaineHaie(R), tau = h === undefined ? 9 : (h - R.pos) / Math.max(4, R.v);
    if (tau > 1.3) { R.saut = { h: null, q: 'hop', p0: R.pos, p1: R.pos + .45 * Math.max(4, R.v) }; return 'hop'; }
    let q = tau >= .12 && tau <= .42 ? 'parfait' : tau <= .78 ? 'bon' : 'tot';
    if (q === 'tot' && aide) q = 'bon';
    if (q !== 'parfait' && (actif(R, 'parfait') || R.charges.parfait > 0)) { if (!actif(R, 'parfait')) R.charges.parfait--; q = 'parfait'; }
    decider(R, q, tau);
    return q;
  };
  C.competence = k => { const R = joueur(); return R ? lancer(R, k) : false; };
  C.peutLancer = k => { const R = joueur(); return R ? peutLancer(R, k) : false; };
  C.foncer = v => { const R = joueur(); if (R) R.fonce = !!v; };

  /* ── un pas de simulation ── */
  function pas(dt) {
    C.t += dt;
    if (C.phase === 'compte') { if (C.t >= 0) { C.phase = 'course'; emettre('partez', null); } else return; }
    for (const R of C.coureurs) {
      if (!R.parti) { if (C.t >= R.reaction) R.parti = true; else continue; }
      /* les compétences des adversaires (et de la joueuse en mode aide) */
      if ((!R.joueur || aide) && !R.fini) {
        R.tIA -= dt;
        if (R.tIA <= 0) { R.tIA = .25; R.competences.forEach((id, k) => { if (peutLancer(R, k) && envieDe(R, id) && rng() < .55 * R.perso + (R.joueur ? .3 : 0)) lancer(R, k); }); }
      }
      /* l'allure : on règle son effort pour tenir jusqu'au bout (et on fonce à la fin s'il reste des forces) */
      const finJambe = relais ? Math.min(distance, (R.jambe + 1) * C.jambe) : distance, reste = Math.max(1, finJambe - R.pos);
      if (R.fini) R.allure = .45;
      else if (sansFin) R.allure = R.fonce ? 1.13 : 1;
      else {
        const permis = (R.E - R.Emax * .08) / (reste / (R.vMax * .95));
        let a = clamp(Math.pow(Math.max(0, permis) / K_FATIGUE, .25), .8, 1.04);
        if (reste < (relais ? C.jambe : distance) * .15 && R.E > R.Emax * .22) a = 1.07;
        if (R.fonce) a = 1.13;
        R.allure = a;
      }
      /* la vitesse visée */
      const fatigue = R.E < R.Emax * .3 ? .78 + .22 * (R.E / (R.Emax * .3)) : 1;
      const zone = !R.fini && dansZone(R.pos) && !actif(R, 'glisse') ? (aide && R.joueur ? .92 : .85) : 1;
      let vise = R.vMax * R.allure * R.terrain * fatigue * zone * produit(R, 'boost') * produit(R, 'lent');
      if (R.chute > 0) { R.chute -= dt; vise = R.vMax * .15; }
      if (R.fini) vise = Math.min(vise, R.vMax * .45);
      R.v += vise > R.v ? Math.min(vise - R.v, ACC * dt) : -Math.min(R.v - vise, FREIN * dt);
      /* la fatigue */
      if (!R.fini && !actif(R, 'carapace')) R.E = Math.max(0, R.E - K_FATIGUE * Math.pow(R.allure, 4) * (R.v / R.vMax) * dt);
      /* on avance */
      const avant = R.pos;
      R.pos += R.v * dt;
      /* la haie : décision un peu avant (si la joueuse n'a pas sauté), puis passage */
      const h = prochaineHaie(R);
      if (h !== undefined && !R.fini) {
        const tau = (h - R.pos) / Math.max(4, R.v);
        if (!R.saut && R.chute <= 0 && tau <= .28) decider(R, sautAuto(R), Math.max(.1, tau));
        if (R.pos >= h) passerHaie(R);
      }
      /* un saut raté (« trop tôt ») reste raté jusqu'à la haie */
      if (R.saut && R.pos >= R.saut.p1 && (R.saut.q !== 'tot' || R.pos >= R.saut.h)) R.saut = null;
      /* les dépassements (pour l'Étincelle, et le commentateur) */
      if (!R.fini) for (const X of C.coureurs) if (X !== R && !X.fini && avant <= X.pos && R.pos > X.pos) {
        if (actif(R, 'etincelle')) ajouter(R, 'boost', 1.5, 1.1);
        if (R.joueur || X.joueur) emettre('double', R, { qui: X.i });
      }
      /* le relais : on passe le témoin */
      if (relais && !R.fini && R.jambe < 2 && R.pos >= (R.jambe + 1) * C.jambe) passerRelais(R);
      /* la course sans fin : elle s'arrête à la 3e chute, ou à bout de forces */
      if (sansFin && !R.fini && (R.chutes >= CHUTES_SANS_FIN || R.E <= .5)) {
        R.fini = true; R.temps = C.t; C.ordreArrivee.push(R); R.place = C.ordreArrivee.length;
        emettre('arrivee', R, { place: R.place, raison: R.chutes >= CHUTES_SANS_FIN ? 'chutes' : 'forces' });
      }
      /* l'arrivée */
      if (!R.fini && R.pos >= distance) {
        R.fini = true; R.temps = C.t - (R.pos - distance) / Math.max(1, R.v);
        C.ordreArrivee.push(R); R.place = C.ordreArrivee.length;
        emettre('arrivee', R, { place: R.place });
      }
    }
    if (C.ordreArrivee.length === C.coureurs.length && !C.fini) { C.fini = true; C.tFin = C.t; C.phase = 'fini'; emettre('fin', null); }
  }
  C.maj = dt => { let reste = dt; while (reste > 1e-6) { const d = Math.min(reste, 1 / 60); pas(d); reste -= d; } };
  /* le classement en cours (les arrivées d'abord, puis la position) */
  C.classement = () => [...C.coureurs].sort((a, b) => (a.fini && b.fini) ? a.place - b.place : a.fini ? -1 : b.fini ? 1 : b.pos - a.pos);
  /* finir la course d'un coup (les dernières dindies, une fois la joueuse arrivée) */
  C.terminer = () => {
    for (const R of C.classement()) if (!R.fini) {
      R.fini = true; R.temps = C.t + (distance - R.pos) / Math.max(4, R.v, R.vMax * R.allure * .95);
      C.ordreArrivee.push(R); R.place = C.ordreArrivee.length;
    }
    C.ordreArrivee.sort((a, b) => a.temps - b.temps).forEach((R, k) => { R.place = k + 1; });
    C.fini = true; C.phase = 'fini'; C.tFin = C.t;
  };
  C.joueur = joueur;
  C.actif = actif;
  return C;
}

/* une course entière d'un coup (pour l'équilibrage, et les tests) : la joueuse ne fait rien de spécial */
export function simuler(options, { pasDt = 1 / 30, maxT = 400, joueuseIA = false, experte = false } = {}) {
  const C = creerCourse({ ...options, coureurs: options.coureurs.map(c => c.joueur && experte ? { ...c, experte: true } : c) });
  if (joueuseIA || experte) C.coureurs.forEach(R => { if (R.joueur) R.joueur = false; });
  while (!C.fini && C.t < maxT) C.maj(pasDt);
  return C;
}
