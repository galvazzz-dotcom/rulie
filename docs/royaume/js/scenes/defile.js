/* ══════════ ÉTAPE 1 : LE GRAND DÉFILÉ ══════════
   Une petite île avec un podium : les dindies débloquées y défilent une par une,
   en 3D, avec leur carte et le Grand Livre (portraits SVG, filtres).
   Sert de vitrine au style 3D et de banc d'essai pour les modèles. */
import * as THREE from 'three';
import { scene, camera, renderer, chaqueImage, centrerImage, soleil } from '../moteur/rendu.js';
import { sphere, cylindre, cone, tore, boite, fusion } from '../moteur/formes.js';
import { toon, contour, contourPour } from '../moteur/materiaux.js';
import { hasard } from '../moteur/couleurs.js';
import { glouglou, pop, tada, audio } from '../moteur/sons.js';
import { crier as crierDindie } from '../jeu/cris.js';
import { ESPECES } from '../donnees/especes.js';
import { TYPES, RARETES, ORDRE_TYPES } from '../donnees/types.js';
import { variante } from '../dindies/adn.js';
import { creerDindie } from '../dindies/modele.js';
import { portraitDindie } from '../dindies/portrait.js';
import { creerRoullieee } from '../personnages/roullieee.js';
import * as SAUVE from '../moteur/sauvegarde.js';
import { especesDe, especesDeTous } from '../jeu/collection.js';

const $ = s => document.querySelector(s);
const REGIONS = { pres: 'les Prés', maroc: 'le Maroc imaginaire', belgique: 'la Belgique', jungle: 'la Jungle', banquise: 'la Banquise', volcan: 'le Volcan', foret: 'la Forêt de la Lune', nuages: 'le Royaume des Nuages' };
const STADES = [['poussin', '🐣', 'Poussin'], ['jeune', '🐥', 'Jeune'], ['adulte', '🦃', 'Adulte'], ['eveille', '🌟', 'Éveillé']];
const POS_DINDIE = new THREE.Vector3(.2, 0, 0);

/* ── le décor : l'île, le podium, l'arche, les arbres, les nuages ── */
function poser(parts, ep = .02, ombre = true) {
  const g = fusion(parts), grp = new THREE.Group();
  const m = new THREE.Mesh(g, toon()); m.castShadow = ombre; m.receiveShadow = true; grp.add(m);
  if (ep) grp.add(new THREE.Mesh(g, contourPour(g, ep)));
  scene.add(grp);
  return grp;
}
function arbre(x, z, s, r) {
  const v = ['#4caf50', '#43a047', '#66bb6a'];
  poser([{ g: cylindre(.7, 1, 1, 10), c: '#8a5a3c', p: [x, .7 * s, z], s: [.18 * s, 1.4 * s, .18 * s] },
    { g: sphere(18, 14), c: v[0], p: [x, 1.9 * s, z], s: .9 * s }, { g: sphere(18, 14), c: v[1], p: [x + .5 * s, 1.55 * s, z + .2 * s], s: .62 * s },
    { g: sphere(18, 14), c: v[2], p: [x - .45 * s, 1.6 * s, z - .1 * s], s: .66 * s }, { g: sphere(14, 10), c: v[2], p: [x + .1 * s, 2.5 * s, z], s: .5 * s * (.8 + r * .4) }], .03);
}
function buisson(x, z, s, fleurs) {
  const p = [{ g: sphere(16, 12), c: '#5cb85c', p: [x, .3 * s, z], s: [.55 * s, .4 * s, .5 * s] }, { g: sphere(14, 10), c: '#4caf50', p: [x + .35 * s, .22 * s, z + .1], s: .32 * s }];
  if (fleurs) for (let i = 0; i < 5; i++) p.push({ g: sphere(8, 6), c: fleurs[i % fleurs.length], p: [x + (i - 2) * .17 * s, .55 * s + (i % 2) * .08, z + .3 * s], s: .07 * s });
  poser(p, .025);
}
function banderole() {
  const c = document.createElement('canvas'); c.width = 1024; c.height = 200;
  const x = c.getContext('2d');
  const g = x.createLinearGradient(0, 0, 0, 200); g.addColorStop(0, '#fb923c'); g.addColorStop(1, '#ea580c');
  x.fillStyle = g; x.beginPath(); x.roundRect(8, 8, 1008, 184, 40); x.fill();
  x.lineWidth = 10; x.strokeStyle = '#fde68a'; x.stroke();
  x.font = '110px "Lilita One", sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
  x.fillStyle = '#7c2d12'; x.fillText('LE GRAND DÉFILÉ', 516, 112); x.fillStyle = '#fff'; x.fillText('LE GRAND DÉFILÉ', 512, 104);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  return t;
}
const nuages = [];
function construireDecor() {
  /* l'île : terre, sable, herbe ; l'eau tout autour */
  poser([{ g: cylindre(1, .85, 1, 56), c: '#c8955a', p: [0, -.62, 0], s: [9.2, 1.1, 9.2] }], 0);
  poser([{ g: cylindre(1, 1, 1, 56), c: '#f3dfa2', p: [0, -.22, 0], s: [9.6, .3, 9.6] }], 0);
  poser([{ g: cylindre(1, 1, 1, 56), c: '#8fd16a', p: [0, -.07, 0], s: [8.4, .14, 8.4] }], 0);
  const eau = new THREE.Mesh(new THREE.CircleGeometry(140, 48), toon('#4cc3ef')); eau.rotation.x = -Math.PI / 2; eau.position.y = -.3; eau.receiveShadow = true; scene.add(eau);
  const ecume = new THREE.Mesh(tore(1, .012, Math.PI * 2, 8, 80), toon('#ffffff')); ecume.rotation.x = Math.PI / 2; ecume.scale.setScalar(9.85); ecume.position.y = -.29; scene.add(ecume);
  chaqueImage((dt, t) => { ecume.position.y = -.3 + Math.sin(t * 1.3) * .03; ecume.scale.setScalar(9.85 + Math.sin(t * 1.3) * .06); });
  /* des taches d'herbe plus claire */
  const r = hasard('herbe');
  for (let i = 0; i < 18; i++) { const an = r() * 6.28, d = 2.6 + r() * 5; poser([{ g: cylindre(1, 1, 1, 18), c: '#a3dc7c', p: [Math.cos(an) * d, .005, Math.sin(an) * d], s: [.5 + r() * .7, .01, .4 + r() * .5] }], 0, false); }
  /* le podium et le tapis rouge */
  poser([{ g: cylindre(1, 1.05, 1, 48), c: '#e7dcc8', p: [0, .05, 0], s: [2.1, .1, 2.1] }, { g: cylindre(1, 1, 1, 48), c: '#fbf6ec', p: [0, .14, 0], s: [1.75, .1, 1.75] },
    { g: tore(1, .03, Math.PI * 2, 8, 64), c: '#facc15', p: [0, .19, 0], r: [Math.PI / 2, 0, 0], s: [1.75, 1.75, 1.2] }], .02);
  poser([{ g: boite(1, 1, 1), c: '#dc2626', p: [0, .02, .02], s: [13, .03, 1.05] }, { g: boite(1, 1, 1), c: '#facc15', p: [0, .025, .55], s: [13, .03, .06] }, { g: boite(1, 1, 1), c: '#facc15', p: [0, .025, -.51], s: [13, .03, .06] }], 0);
  /* l'arche et sa banderole */
  for (const s of [-1, 1]) poser([{ g: cylindre(1, 1, 1, 16), c: '#fef3c7', p: [s * 2.6, 1.35, -2.4], s: [.16, 2.7, .16] }, { g: sphere(16, 12), c: '#facc15', p: [s * 2.6, 2.78, -2.4], s: .24 },
    { g: cylindre(1, 1.2, 1, 16), c: '#facc15', p: [s * 2.6, .1, -2.4], s: [.26, .2, .26] }], .025);
  const ban = new THREE.Mesh(new THREE.PlaneGeometry(4.6, .9), new THREE.MeshBasicMaterial({ map: banderole(), transparent: true }));
  ban.position.set(0, 2.45, -2.38); scene.add(ban);
  document.fonts && document.fonts.load('110px "Lilita One"').then(() => { ban.material.map = banderole(); }).catch(() => {});
  /* les fanions */
  const COUL = ['#ef4444', '#facc15', '#3b82f6', '#22c55e', '#a855f7'], fan = [];
  for (let i = 0; i < 11; i++) { const x = -2.4 + i * .48, y = 2.0 - Math.sin(i / 10 * Math.PI) * .25; fan.push({ g: cone(1, 1, 3), c: COUL[i % 5], p: [x, y - .14, -2.3], r: [0, 0, Math.PI], s: [.15, .3, .03] }); }
  poser(fan, .012, false);
  /* les arbres, les buissons, des rochers */
  [[-6.2, -3.2, 1.1], [6.4, -2.6, 1.2], [-4.6, -5.6, .9], [4.4, -5.8, 1], [-7, 1.6, .85], [7.1, 2.0, .9], [0, -6.6, 1.15]].forEach(([x, z, s], i) => arbre(x, z, s, (i * .37) % 1));
  [[-3.6, -1.4, 1, ['#f472b6', '#fde047']], [3.8, -1.2, 1.1, ['#ffffff', '#f9a8d4']], [-5.6, 4, .9, ['#fde047']], [5.4, 4.2, 1, ['#c4b5fd', '#fff']], [-2.8, 4.8, .8], [2.6, 5.2, .7, ['#f87171']]].forEach(a => buisson(...a));
  [[-4.4, 2.6, .5], [4.8, 1.0, .4], [1.8, -4.4, .35]].forEach(([x, z, s]) => poser([{ g: sphere(10, 8), c: '#a8a29e', p: [x, s * .4, z], s: [s, s * .7, s * .85] }], .02));
  /* les nuages */
  const rn = hasard('nuages');
  for (let i = 0; i < 9; i++) {
    const g = new THREE.Group(), n = 4 + Math.floor(rn() * 3);
    for (let k = 0; k < n; k++) { const m = new THREE.Mesh(sphere(14, 10), toon('#ffffff')); m.position.set(k * 1.1 - n * .5, Math.sin(k) * .4, rn() * .6); m.scale.setScalar(1 + rn() * .9); g.add(m); }
    const an = -1.2 - rn() * 3.6 + Math.PI, d = 38 + rn() * 30;
    g.position.set(Math.cos(an) * d, 9 + rn() * 12, -Math.abs(Math.sin(an)) * d - 10); g.scale.setScalar(1.6 + rn() * 1.4);
    scene.add(g); nuages.push(g);
  }
  chaqueImage(dt => nuages.forEach((g, i) => { g.position.x += dt * (.25 + i * .04); if (g.position.x > 70) g.position.x = -70; }));
}

/* ── la caméra : cadrer le podium dans la place libre de l'écran ── */
const CIBLE = new THREE.Vector3(-.15, 1.05, 0), DIR = new THREE.Vector3(0, .24, 1).normalize();
function cadrer() {
  const W = innerWidth, H = innerHeight, large = W >= H;
  const carteW = large ? Math.min(W * .4, 460) + 20 : 0;
  const zone = large ? { x0: 0, x1: W - carteW, y0: 64, y1: H - (H < 500 ? 64 : 84) } : { x0: 0, x1: W, y0: 70, y1: H - H * .42 - 86 };
  const zw = Math.max(40, zone.x1 - zone.x0), zh = Math.max(40, zone.y1 - zone.y0);
  const tf = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
  /* la place à montrer : la dindie qui fait la roue et Roullieee (derrière elle sur un écran en hauteur) */
  const Lb = large ? 4.5 : 2.9, Hb = large ? 3.2 : 2.45;
  CIBLE.set(large ? -.3 : -.05, large ? 1.45 : 1.1, 0);
  if (roullieee) { roullieee.racine.position.set(large ? -1.6 : -1.15, 0, large ? .45 : -.75); roullieee.racine.rotation.y = large ? .55 : .35; }
  const d = Math.max(Hb / (2 * tf * zh / H), Lb / (2 * tf * (W / H) * zw / W)) * 1.05;
  camera.position.copy(CIBLE).addScaledVector(DIR, d);
  camera.lookAt(CIBLE);
  centrerImage(((zone.x0 + zone.x1) / 2) / W - .5, ((zone.y0 + zone.y1) / 2) / H - .5);
  soleil.position.set(6, 12, 8); soleil.target.position.set(0, 0, 0);
}

/* ── l'état du défilé ── */
const etat = { i: 0, stade: 'adulte', chroma: false, filtre: 'toutes', auto: false };
let courante = null, roullieee = null;
const sortantes = [];
let arrivee = null;     /* la dindie qui entre et va au centre */
/* seulement les dindies déjà attrapées : celles du profil choisi (?profil=…), sinon du dernier profil joué (sans profil : celles de tous) */
const PROFIL = new URLSearchParams(location.search).get('profil') || SAUVE.profilActif();
const NOM = (SAUVE.listeProfils().find(p => p.id === PROFIL) || {}).nom;
const OK = PROFIL ? especesDe(PROFIL) : especesDeTous();
const debloquee = e => OK.has(e.id);
const liste = () => ESPECES.filter(e => debloquee(e) && (etat.filtre === 'toutes' || e.rarete === etat.filtre || e.types.includes(etat.filtre)));

function construireDindie(e) {
  const a = variante(e, { stade: etat.stade, chroma: etat.chroma });
  const d = creerDindie(a);
  d.espece = e;
  scene.add(d.racine);
  return d;
}
function choisir(i, sens = 1, instantane = false) {
  i = (i + ESPECES.length) % ESPECES.length;
  if (!debloquee(ESPECES[i])) { const L = liste().length ? liste() : ESPECES.filter(debloquee); if (!L.length) return; i = L[0].n - 1; }
  etat.i = i;
  const e = ESPECES[etat.i];
  criJusqua = 0; $('#cri').classList.add('cache');
  if (courante) {
    if (instantane) courante.liberer();
    else { courante.marcher(1.6); courante.racine.rotation.y = sens * Math.PI / 2; sortantes.push({ d: courante, v: sens * 2.4 }); }
  }
  courante = construireDindie(e);
  if (instantane) { courante.racine.position.copy(POS_DINDIE); courante.racine.rotation.y = -.2; arrivee = null; plusTard(.25, () => courante && courante.jouer('saut')); }
  else {
    courante.racine.position.set(POS_DINDIE.x - sens * 4.8, 0, 0);
    courante.racine.rotation.y = sens * Math.PI / 2; courante.marcher(1.6);
    arrivee = { d: courante, v: sens * 2.4 };
  }
  majCarte(e);
  majGrille();
  history.replaceState(null, '', '#' + e.id + (etat.stade !== 'adulte' ? '&' + etat.stade : '') + (etat.chroma ? '&chroma' : ''));
}
/* une dindie qui arrive au centre : elle se tourne vers nous et se montre */
function presenter(d) {
  d.marcher(0);
  const r = RARETES[d.espece.rarete].rang;
  plusTard(.35, () => {
    if (d !== courante) return;
    if (r >= 2 || Math.random() < .45) { d.jouer('roue'); if (r >= 2) tada(); }
    else crier();
    roullieee.jouer('presente');
  });
}
function crier() {
  if (!courante) return;
  courante.jouer('glouglou');
  crierDindie(courante.adn);
  const c = $('#cri'); c.textContent = courante.espece.cri; c.classList.remove('cache'); c.style.animation = 'none'; void c.offsetWidth; c.style.animation = '';
  criJusqua = temps + 2.2;
}

/* ── la carte ── */
function texteOrigine(o) {
  const nom = id => ESPECES.find(x => x.id === id).nom;
  if (o.sorte === 'sauvage') return `🧭 Sauvage : ${REGIONS[o.region]}`;
  if (o.sorte === 'croisement') return `🥚 Croisement : un parent ${TYPES[o.types[0]].e} ${TYPES[o.types[0]].nom} × un parent ${TYPES[o.types[1]].e} ${TYPES[o.types[1]].nom}`;
  if (o.sorte === 'recette') return `🥚 Recette : ${nom(o.especes[0])} × ${nom(o.especes[1])}`;
  return `🌈 Mythique : ${nom(o.especes[0])} × ${nom(o.especes[1])}, avec ${o.objet} (quête « ${o.quete} »${o.condition ? ', ' + o.condition : ''})`;
}
function majCarte(e) {
  const a = variante(e, { stade: etat.stade, chroma: etat.chroma }), R = RARETES[e.rarete];
  const st = e.stats.map(v => etat.stade === 'eveille' ? Math.min(10, v + 1) : v);
  const c = $('#carte');
  c.className = 'carte ' + e.rarete; c.style.setProperty('--rar', R.couleur);
  const stade = STADES.find(s => s[0] === etat.stade);
  c.innerHTML = `<div class="por">${portraitDindie(a, { id: 'carte' })}</div>
    <div class="tete"><div class="num">N° ${String(e.n).padStart(3, '0')}</div><h2>${e.nom}</h2>
      <div class="etiq"><span class="pill rar">${R.nom.toUpperCase()}</span>${e.types.map(t => `<span class="pill">${TYPES[t].e} ${TYPES[t].nom}</span>`).join('')}
      ${etat.stade !== 'adulte' ? `<span class="pill">${stade[1]} ${stade[2]}</span>` : ''}${etat.chroma ? '<span class="pill">✨ Chromatique</span>' : ''}</div></div>
    <div class="corpsCarte">${[['⚡', 'Vitesse'], ['💪', 'Endurance'], ['🦘', 'Saut']].map(([ic, n], k) => `<div class="stat" title="${n}"><i>${ic}</i><div class="barre"><b style="width:${st[k] * 10}%"></b></div><em>${st[k]}</em></div>`).join('')}
      <div class="criCarte">« ${e.cri} »</div><p>${e.desc}</p><div class="orig">${texteOrigine(e.origine)}</div></div>`;
}

/* ── le Grand Livre ── */
function construireLivre() {
  const D = ESPECES.filter(debloquee);
  const F = [['toutes', `Toutes (${D.length})`], ...Object.entries(RARETES).filter(([k]) => D.some(e => e.rarete === k)).map(([k, r]) => [k, { commune: '⚪', rare: '🔵', epique: '🟣', mythique: '🌈' }[k] + ' ' + r.nom]),
    ...ORDRE_TYPES.filter(t => D.some(e => e.types.includes(t))).map(t => [t, TYPES[t].e + ' ' + TYPES[t].nom])];
  $('#filtres').innerHTML = F.map(([k, n]) => `<button data-f="${k}">${n}</button>`).join('');
  $('#filtres').onclick = ev => { const b = ev.target.closest('button'); if (!b) return; pop(); etat.filtre = b.dataset.f; majGrille(); };
  $('#grille').innerHTML = D.map(e => `<button class="case ${e.rarete}" data-i="${e.n - 1}" style="--rar:${RARETES[e.rarete].couleur}" aria-label="${e.nom}"><span>${e.n}</span>${portraitDindie(variante(e), { id: 'L' + e.n })}</button>`).join('');
  $('#grille').onclick = ev => {
    const b = ev.target.closest('.case'); if (!b) return;
    pop(); fermerLivre();
    const i = +b.dataset.i; choisir(i, i >= etat.i ? 1 : -1);
  };
}
function majGrille() {
  document.querySelectorAll('#filtres button').forEach(b => b.classList.toggle('on', b.dataset.f === etat.filtre));
  const ok = new Set(liste().map(e => e.n - 1));
  document.querySelectorAll('#grille .case').forEach(b => { const i = +b.dataset.i; b.classList.toggle('cache', !ok.has(i)); b.classList.toggle('choisie', i === etat.i); });
}
function ouvrirLivre() { $('#livre').classList.remove('cache'); majGrille(); const b = document.querySelector('#grille .choisie'); b && b.scrollIntoView({ block: 'center' }); }
function fermerLivre() { $('#livre').classList.add('cache'); }

/* ── voisins dans la liste filtrée ── */
function voisin(sens) {
  const l = liste(); if (!l.length) return etat.i;
  const k = l.findIndex(e => e.n - 1 === etat.i);
  return l[((k < 0 ? 0 : k + sens) + l.length) % l.length].n - 1;
}

/* ── petits minuteurs liés au temps du jeu ── */
let temps = 0, criJusqua = 0, prochainAuto = 0;
const taches = [];
const plusTard = (s, f) => taches.push([temps + s, f]);

export function demarrerDefile() {
  construireDecor();
  roullieee = creerRoullieee(); scene.add(roullieee.racine);
  construireLivre();
  const n = ESPECES.filter(debloquee).length;
  $('.titre span').innerHTML = `<b>${NOM ? 'Le défilé de ' + NOM.replace(/[&<>"]/g, '') : 'Le Grand Défilé'}</b><small>${n} dindie${n > 1 ? 's' : ''} débloquée${n > 1 ? 's' : ''} · le Royaume des Dindies</small>`;
  if (!n) {
    $('#carte').innerHTML = '<div class="vide"><p class="grosEmoji">🥚</p><h2>Ton défilé est vide</h2><p>Attrape des dindies dans le Royaume : elles viendront défiler ici, une par une !</p><a class="btn" href="index.html">🎈 Jouer</a></div>';
    ['#bPrec', '#bSuiv', '#bDefile', '#actions', '#bLivre'].forEach(s => $(s).classList.add('cache'));
    cadrer(); addEventListener('resize', cadrer);
    chaqueImage((dt, t) => roullieee.maj(dt, t));
    window.__defile = { etat, choisir, ESPECES, vide: true };
    return;
  }
  cadrer(); addEventListener('resize', cadrer);
  /* au départ : l'espèce de l'adresse (#belgicus&eveille&chroma), sinon le Dindon Glouglou */
  const h = decodeURIComponent(location.hash.slice(1)).split('&');
  const e = ESPECES.find(x => x.id === h[0] || String(x.n) === h[0]);
  if (h.includes('chroma')) etat.chroma = true;
  const s = STADES.find(x => h.includes(x[0])); if (s) etat.stade = s[0];
  majBoutons();
  choisir(e ? e.n - 1 : 0, 1, true);
  addEventListener('hashchange', () => {
    const h = decodeURIComponent(location.hash.slice(1)).split('&'), e = ESPECES.find(x => x.id === h[0] || String(x.n) === h[0]);
    if (!e) return;
    etat.chroma = h.includes('chroma'); const s = STADES.find(x => h.includes(x[0])); etat.stade = s ? s[0] : 'adulte';
    majBoutons(); choisir(e.n - 1, 1, true);
  });

  $('#bPrec').onclick = () => { audio(); pop(); choisir(voisin(-1), -1); };
  $('#bSuiv').onclick = () => { audio(); pop(); choisir(voisin(1), 1); };
  $('#bLivre').onclick = () => { audio(); pop(); ouvrirLivre(); };
  $('#bFermerLivre').onclick = () => { pop(); fermerLivre(); };
  $('#bDefile').onclick = () => { audio(); pop(); etat.auto = !etat.auto; prochainAuto = temps + 1; majBoutons(); };
  $('#bStade').onclick = () => { audio(); pop(); const k = STADES.findIndex(x => x[0] === etat.stade); etat.stade = STADES[(k + 1) % 4][0]; majBoutons(); choisir(etat.i, 1, true); };
  $('#bChroma').onclick = () => { audio(); etat.chroma = !etat.chroma; etat.chroma ? tada() : pop(); majBoutons(); choisir(etat.i, 1, true); };
  document.querySelectorAll('#actions [data-a]').forEach(b => b.onclick = () => {
    audio(); if (!courante || arrivee) return;
    if (b.dataset.a === 'glouglou') crier(); else { courante.jouer(b.dataset.a); if (b.dataset.a === 'roue') glouglou(.9); }
  });
  addEventListener('keydown', ev => {
    if (ev.key === 'ArrowRight') $('#bSuiv').click(); else if (ev.key === 'ArrowLeft') $('#bPrec').click();
    else if (ev.key === ' ') { ev.preventDefault(); crier(); } else if (ev.key === 'Escape') fermerLivre();
  });
  /* toucher la dindie = glouglou ; glisser = changer de dindie */
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  let x0 = null, y0 = null;
  renderer.domElement.addEventListener('pointerdown', ev => { x0 = ev.clientX; y0 = ev.clientY; audio(); });
  renderer.domElement.addEventListener('pointerup', ev => {
    if (x0 === null) return;
    const dx = ev.clientX - x0, dy = ev.clientY - y0; x0 = null;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) { (dx < 0 ? $('#bSuiv') : $('#bPrec')).click(); return; }
    if (!courante || arrivee) return;
    ndc.set(ev.clientX / innerWidth * 2 - 1, -(ev.clientY / innerHeight) * 2 + 1); ray.setFromCamera(ndc, camera);
    if (ray.intersectObject(courante.racine, true).length) crier();
    else if (ray.intersectObject(roullieee.racine, true).length) roullieee.jouer('coucou');
  });

  const v = new THREE.Vector3();
  chaqueImage((dt, t) => {
    temps = t;
    for (let k = taches.length - 1; k >= 0; k--) if (taches[k][0] <= t) { const f = taches[k][1]; taches.splice(k, 1); f(); }
    if (courante) courante.maj(dt, t);
    roullieee.maj(dt, t);
    if (arrivee) {
      const d = arrivee.d, p = d.racine.position, reste = POS_DINDIE.x - p.x;
      if (Math.abs(reste) < Math.abs(arrivee.v * dt) + .01) { p.x = POS_DINDIE.x; arrivee = null; presenter(d); }
      else p.x += arrivee.v * dt;
    } else if (courante) {
      courante.racine.rotation.y += (-.2 - courante.racine.rotation.y) * Math.min(1, dt * 6);
    }
    for (let k = sortantes.length - 1; k >= 0; k--) {
      const s = sortantes[k]; s.d.maj(dt, t); s.d.racine.position.x += s.v * dt;
      if (Math.abs(s.d.racine.position.x) > 6.5) { s.d.liberer(); sortantes.splice(k, 1); }
    }
    /* le cri suit la tête */
    const c = $('#cri');
    if (t > criJusqua) c.classList.add('cache');
    else if (courante) {
      v.copy(courante.racine.position); v.y += courante.hauteur() + .15; v.project(camera);
      c.style.left = ((v.x * .5 + .5) * innerWidth) + 'px'; c.style.top = ((-v.y * .5 + .5) * innerHeight) + 'px';
    }
    if (etat.auto && !arrivee && t > prochainAuto) { prochainAuto = t + 7; choisir(voisin(1), 1); }
  });
  window.__defile = { etat, choisir, ESPECES, debloquees: n, get courante() { return courante; }, get arrivee() { return arrivee; }, crier, ouvrirLivre, fermerLivre };
}
function majBoutons() {
  const s = STADES.find(x => x[0] === etat.stade);
  $('#bStade').innerHTML = `<i>${s[1]}</i><span>${s[2]}</span>`;
  $('#bChroma').classList.toggle('on', etat.chroma);
  $('#bDefile').classList.toggle('on', etat.auto); $('#bDefile').textContent = etat.auto ? '⏸' : '▶';
}
