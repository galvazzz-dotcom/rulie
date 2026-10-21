/* ══════════ LE JEU : ROULLIEEE DANS LE DOMAINE ══════════
   Marcher (toucher le sol, glisser comme un joystick, ou le clavier), parler aux habitants,
   s'occuper des dindies, suivre les quêtes. La lumière suit l'heure ; tout se sauvegarde. */
import * as THREE from 'three';
import { scene, camera, renderer, chaqueImage, soleil, ciel, couleursCiel, centrerImage, distancesBrume, redimensionner } from '../moteur/rendu.js';
import { entrees } from '../moteur/entrees.js';
import { lumiere, heure, texteHeure, regler as reglerHeure } from '../moteur/temps.js';
import { $, $$, el, toast, fenetreOuverte, enDialogue, fermerDerniere, dialogue } from '../moteur/ui.js';
import { pop, tada, glouglou, sonActif, musique, musiqueNuit, audio } from '../moteur/sons.js';
import { voixActive } from '../moteur/voix.js';
import { texRonde } from '../moteur/materiaux.js';
import * as SAUVE from '../moteur/sauvegarde.js';
import { construireDomaine, LIEUX } from '../monde/domaine.js';
import { sol } from '../monde/decor.js';
import { creerChibi, PERSONNAGES } from '../personnages/chibi.js';
import { creerDindie } from '../dindies/modele.js';
import { variante } from '../dindies/adn.js';
import { PAR_ID } from '../donnees/especes.js';
import * as J from '../jeu/etat.js';
import { nomDe } from '../jeu/individus.js';
import * as S from '../jeu/scenario.js';
import * as P from '../ui/panneaux.js';

const VITESSE = 4.6;

export function demarrerJeu({ idProfil, etat, changerProfil }) {
  J.utiliser(etat);
  const E = () => J.etat();
  const monde = construireDomaine(scene, etat);

  /* ── Roullieee, avec sa « silhouette » visible derrière les bâtiments ── */
  const moi = creerChibi(PERSONNAGES.roullieee);
  moi.racine.position.set(etat.monde.position[0], 0, etat.monde.position[1]);
  scene.add(moi.racine);
  /* opaque (sinon elle serait dessinée après Roullieee et se verrait sur elle-même) */
  const matSil = new THREE.MeshBasicMaterial({ color: '#f59e5b', depthFunc: THREE.GreaterDepth, depthWrite: false });
  /* l'ordre de dessin : le décor, puis la silhouette (seulement là où un mur la cache), puis Roullieee elle-même */
  const silhouettes = [];
  moi.racine.traverse(o => { if (o.isMesh) { o.renderOrder = 2; if (o.material.type !== 'MeshBasicMaterial') silhouettes.push(o); } });
  for (const o of silhouettes) { const s = new THREE.Mesh(o.geometry, matSil); s.renderOrder = 1; o.add(s); }
  const ombreRonde = new THREE.Mesh(new THREE.CircleGeometry(.45, 20), new THREE.MeshBasicMaterial({ color: '#000', transparent: true, opacity: .18, depthWrite: false }));
  ombreRonde.rotation.x = -Math.PI / 2; scene.add(ombreRonde);

  /* ── la caméra qui suit (vue de trois quarts, un peu plus large sur un écran en hauteur) ── */
  let zoom = 22;
  const objectifCamera = () => { camera.fov = innerWidth < innerHeight ? 50 : 38; redimensionner(); };
  objectifCamera(); addEventListener('resize', objectifCamera);
  distancesBrume(60, 170);
  const cible = new THREE.Vector3().copy(moi.racine.position);
  const placerCamera = (dt = 1) => {
    cible.lerp(moi.racine.position, Math.min(1, dt * 5));
    camera.position.set(cible.x, cible.y + zoom * .64, cible.z + zoom * .77);
    camera.lookAt(cible.x, cible.y + .8, cible.z);
    /* l'ombre du soleil suit Roullieee (sur une grille, pour ne pas trembler) */
    const g = 1;
    soleil.target.position.set(Math.round(cible.x / g) * g, 0, Math.round(cible.z / g) * g);
  };
  centrerImage(0, 0);
  Object.assign(soleil.shadow.camera, { left: -24, right: 24, top: 24, bottom: -24, near: 1, far: 90 }); soleil.shadow.camera.updateProjectionMatrix();
  soleil.shadow.bias = -.0015; soleil.shadow.normalBias = .06;
  placerCamera(1);

  /* ── l'interface (HUD) ── */
  const hud = el(`<div id="hud">
    <div class="hudHaut"><div class="bourse"><span id="hPieces">0</span> 🪙 <span class="sep"></span><span id="hPlumes">0</span> 🪶</div>
      <button id="hQuete" class="quete"></button><div class="heure" id="hHeure"></div></div>
    <div class="hudBas"><button class="rondHud" id="hCarte" aria-label="Carte">🗺️</button><button class="rondHud" id="hDindies" aria-label="Mes dindies">🐾</button>
      <button class="rondHud" id="hSac" aria-label="Sac">🎒</button><button class="rondHud" id="hLivre" aria-label="Grand Livre">📖</button><button class="rondHud" id="hJournal" aria-label="Journal">📜</button></div>
    <button id="hAction" class="action cache"></button><div id="hFleche" class="flecheBord cache">➤</div></div>`);
  document.body.appendChild(hud);
  const majHud = () => {
    $('#hPieces').textContent = E().pieces; $('#hPlumes').textContent = E().plumesOr;
    const q = S.queteDe(E().quete.etape);
    $('#hQuete').innerHTML = `<small>${q ? q.titre : 'Chapitre 1 terminé !'}</small>${S.texteEtape()}`;
    $('#hLivre').classList.toggle('cache', !J.combien('grandLivre'));
  };
  $('#hCarte').onclick = () => { pop(); P.ouvrirCarte({ position: [moi.racine.position.x, moi.racine.position.z], cible: positionCible(), allerA: (x, z) => allerVers(x, z) }); };
  $('#hDindies').onclick = () => { pop(); P.ouvrirClapier({ surChange: syncDindies }); };
  $('#hSac').onclick = () => { pop(); P.ouvrirSac(); };
  $('#hLivre').onclick = () => { pop(); P.ouvrirLivre(); };
  $('#hJournal').onclick = $('#hQuete').onclick = () => { pop(); P.ouvrirJournal(); };

  /* ── les réglages ── */
  const appliquerReglages = () => {
    const r = E().reglages;
    sonActif(r.son); voixActive(r.voix); reglerHeure(r.heure);
    musique(r.son && r.musique, lumiere().nuit > .5);
    majLumiere(true);
  };

  /* ── les dindies dans le monde : celles des enclos, et la compagne qui suit ── */
  const affichees = new Map();   /* uid → { d, m (modèle), ia } */
  function syncDindies() {
    const voulu = new Map();
    for (const d of E().dindies) {
      if (d.lieu.startsWith('enclos:') && E().enclos[d.lieu.slice(7)]?.construit) voulu.set(d.uid, 'enclos');
      else if (E().compagnon === d.uid) voulu.set(d.uid, 'compagnon');
    }
    for (const [uid, A] of affichees) if (voulu.get(uid) !== A.mode || A.cle !== cleDe(A.d)) { A.m.liberer(); affichees.delete(uid); }
    for (const [uid, mode] of voulu) {
      if (affichees.has(uid)) continue;
      const d = J.parUid(uid), m = creerDindie(variante(PAR_ID[d.espece], { stade: d.stade, chroma: d.chroma }));
      scene.add(m.racine);
      const A = { d, m, mode, cle: cleDe(d), cible: null, attente: Math.random() * 2, prochaineAction: 3 + Math.random() * 6 };
      if (mode === 'enclos') { const I = monde.enclosInfo[d.lieu.slice(7)]; A.I = I; const p = pointDansEnclos(I); m.racine.position.set(p[0], 0, p[1]); }
      else { const p = moi.racine.position; m.racine.position.set(p.x - 1.2, 0, p.z + .8); }
      m.racine.traverse(o => { o.userData.uid = uid; });
      affichees.set(uid, A);
    }
  }
  const cleDe = d => d.lieu + '|' + d.stade + '|' + d.chroma;
  const pointDansEnclos = I => { const [w, d] = I.b.interieur; return [I.x + (Math.random() - .5) * w, I.z + (Math.random() - .5) * d * .8 + .4]; };
  window.addEventListener('dindie-joie', ev => {
    const A = affichees.get(ev.detail); if (!A) return;
    A.m.jouer(Math.random() < .5 ? 'roue' : 'saut'); coeurs(A.m.racine.position, A.m.hauteur());
  });

  /* ── des cœurs, des étincelles, de la poussière ── */
  const effets = [];
  function particules(pos, { n = 12, couleur = '#ff6b9d', taille = .35, vitesse = 2, duree = 1.4, monte = 2, texture = texRonde() } = {}) {
    const g = new THREE.BufferGeometry(), p = new Float32Array(n * 3), v = [];
    for (let i = 0; i < n; i++) { p.set([pos.x, pos.y, pos.z], i * 3); v.push([(Math.random() - .5) * vitesse, monte * (.5 + Math.random()), (Math.random() - .5) * vitesse]); }
    g.setAttribute('position', new THREE.BufferAttribute(p, 3));
    const m = new THREE.Points(g, new THREE.PointsMaterial({ color: couleur, size: taille, map: texture, transparent: true, depthWrite: false }));
    scene.add(m); effets.push({ m, v, t: 0, duree });
  }
  const coeurs = (pos, h) => particules(new THREE.Vector3(pos.x, h, pos.z), { n: 10, couleur: '#ff5c8a', taille: .45 });
  const poussiere = (x, z) => particules(new THREE.Vector3(x, .3, z), { n: 40, couleur: '#e7d3b5', taille: .7, vitesse: 6, monte: 1.5, duree: 1.6 });
  const majEffets = dt => {
    for (let k = effets.length - 1; k >= 0; k--) {
      const F = effets[k]; F.t += dt; const a = F.m.geometry.attributes.position;
      for (let i = 0; i < F.v.length; i++) { a.array[i * 3] += F.v[i][0] * dt; a.array[i * 3 + 1] += F.v[i][1] * dt; a.array[i * 3 + 2] += F.v[i][2] * dt; F.v[i][1] -= dt * 1.5; }
      a.needsUpdate = true; F.m.material.opacity = 1 - F.t / F.duree;
      if (F.t > F.duree) { scene.remove(F.m); F.m.geometry.dispose(); F.m.material.dispose(); effets.splice(k, 1); }
    }
  };

  /* ── marcher : le chemin (A*) ou le joystick ── */
  let chemin = null, auBout = null;
  function allerVers(x, z, puis = null) {
    const c = monde.grille.trouverChemin(moi.racine.position.x, moi.racine.position.z, x, z);
    if (!c) { toast('On ne peut pas aller là !'); return; }
    chemin = c; auBout = puis;
    anneau.position.set(c[c.length - 1][0], .06, c[c.length - 1][1]); anneau.visible = true; anneau.userData.t = 0;
  }
  const anneau = new THREE.Mesh(new THREE.RingGeometry(.35, .5, 24), new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, depthWrite: false }));
  anneau.rotation.x = -Math.PI / 2; anneau.visible = false; scene.add(anneau);

  /* ── les choses avec lesquelles on peut agir ── */
  const interactifs = monde.interactifs;
  const positionDe = I => [I.x, I.z];
  function plusProche() {
    const p = moi.racine.position; let best = null, bd = 1e9;
    for (const I of interactifs) { const d = Math.hypot(I.x - p.x, I.z - p.z); if (d < I.rayon && d < bd) { bd = d; best = I; } }
    for (const A of affichees.values()) if (A.mode === 'enclos') { /* les dindies d'un enclos : on les touche, pas besoin de bouton */ }
    return best;
  }
  let occupe = false;
  async function agir(I) {
    if (occupe || !I) return;
    occupe = true; chemin = null;
    try {
      const p = moi.racine.position;
      const vers = I.pnj ? monde.pnj[I.pnj]?.c.racine.position || gontran?.racine.position : null;
      if (vers) { moi.racine.rotation.y = Math.atan2(vers.x - p.x, vers.z - p.z); const P0 = I.pnj === 'gontran' ? { c: gontran } : monde.pnj[I.pnj]; P0.c.racine.rotation.y = Math.atan2(p.x - vers.x, p.z - vers.z); P0.c.jouer('parle'); }
      const id = I.id;
      if (I.pnj) await S.parler(I.pnj);
      else if (id === 'maison') P.ouvrirMaison({ appliquerReglages, changerProfil: () => { sauver(); changerProfil(); }, idProfil: () => idProfil });
      else if (id === 'labo') await S.parler('plumeau');
      else if (id === 'boutique') await S.parler('mimi');
      else if (id === 'musee') P.ouvrirMusee();
      else if (id === 'quetes') P.ouvrirJournal();
      else if (id === 'lettres') P.courrier();
      else if (id === 'fontaine') P.voeu(() => { particules(new THREE.Vector3(0, 2.4, 0), { n: 30, couleur: '#fde68a', taille: .4, vitesse: 3, monte: 3 }); pop(); });
      else if (id === 'montgolfiere') await S.parler('zephyr');
      else if (id === 'dindodrome') await S.parler('ginette');
      else if (id.startsWith('ruine-')) toast(`🚧 ${I.ruine} : en travaux. Il ouvrira dans un prochain chapitre !`, { duree: 3200 });
      else if (id.startsWith('objet-')) await S.interagir(id);
      else if (id === 'clapier') { await S.interagir(id); if (E().batiments.clapier.repare) P.ouvrirClapier({ surChange: syncDindies }); else if (E().quete.etape !== 'reparerClapier') toast('🚧 Le Clapier est en ruine. Il faudrait des clous pour le réparer…'); else toast('Il faut une boîte de clous ! Mimi en vend.'); }
      else if (I.enclos) { const fait = await S.interagir(id); if (!fait) P.ouvrirEnclos(I.enclos, { surChange: syncDindies }); }
    } finally { occupe = false; majHud(); }
  }
  /* toucher l'écran : une dindie, un habitant, un bâtiment… ou le sol */
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), plan = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), pt = new THREE.Vector3();
  function toucher(x, y) {
    if (fenetreOuverte() || enDialogue() || occupe) return;
    audio();
    ndc.set(x / innerWidth * 2 - 1, -(y / innerHeight) * 2 + 1); ray.setFromCamera(ndc, camera);
    /* d'abord les dindies (ouvrir leur fiche) */
    const objs = [...affichees.values()].map(A => A.m.racine);
    const hd = ray.intersectObjects(objs, true)[0];
    if (hd) { const d = J.parUid(hd.object.userData.uid); if (d) { pop(); P.ouvrirFiche(d, { surChange: syncDindies }); return; } }
    /* puis les choses interactives (on y va, et on agit en arrivant) */
    const cibles = interactifs.map(I => (I.enclos ? monde.enclosInfo[I.enclos].b.g : I.cible)).filter(Boolean);
    const h = ray.intersectObjects(cibles, true)[0];
    if (h) {
      let o = h.object; while (o && !cibles.includes(o)) o = o.parent;
      const I = interactifs.find(I => (I.enclos ? monde.enclosInfo[I.enclos].b.g : I.cible) === o);
      if (I) { allerVers(I.x, I.z, () => agir(I)); return; }
    }
    if (ray.ray.intersectPlane(plan, pt)) allerVers(pt.x, pt.z);
  }
  const commandes = entrees(renderer.domElement, {
    surTap: toucher,
    surZoom: k => { zoom = Math.min(34, Math.max(10, zoom * k)); },
    surAction: () => { if (enDialogue()) return; if (fermerDerniere()) return; const I = plusProche(); if (I) agir(I); }
  });
  $('#hAction').onclick = () => { const I = plusProche(); if (I) { pop(); agir(I); } };

  /* ── la flèche de quête (au-dessus de l'objectif) ── */
  const marque = new THREE.Group(); scene.add(marque);
  const fl = new THREE.Mesh(new THREE.ConeGeometry(.45, .9, 4), new THREE.MeshBasicMaterial({ color: '#facc15' })); fl.rotation.x = Math.PI; marque.add(fl);
  const flc = new THREE.Mesh(new THREE.ConeGeometry(.55, 1.05, 4), new THREE.MeshBasicMaterial({ color: '#7c2d12', side: THREE.BackSide })); flc.rotation.x = Math.PI; marque.add(flc);
  const etoileSol = new THREE.Mesh(new THREE.RingGeometry(.9, 1.15, 32), new THREE.MeshBasicMaterial({ color: '#facc15', transparent: true, opacity: .8, depthWrite: false }));
  etoileSol.rotation.x = -Math.PI / 2; scene.add(etoileSol);
  function positionCible() {
    let ids = S.cibleEtape(); if (!ids) return null;
    if (!Array.isArray(ids)) ids = [ids];
    const p = moi.racine.position; let best = null, bd = 1e9;
    for (const id of ids) {
      const I = interactifs.find(i => i.id === id); if (!I) continue;
      const d = Math.hypot(I.x - p.x, I.z - p.z); if (d < bd) { bd = d; best = [I.x, I.z, I]; }
    }
    return best;
  }
  const v3 = new THREE.Vector3();
  function majMarque(t) {
    const c = positionCible();
    marque.visible = etoileSol.visible = !!c;
    $('#hFleche').classList.add('cache');
    if (!c) return;
    const [x, z, I] = c, h = I.pnj ? 2.9 : I.enclos ? 2.4 : I.objet ? 1.8 : 4.2;
    const cx = I.pnj ? (monde.pnj[I.pnj] ? monde.pnj[I.pnj].x : x) : x, cz = I.pnj ? (monde.pnj[I.pnj] ? monde.pnj[I.pnj].z : z) : z;
    marque.position.set(cx, h + Math.sin(t * 3) * .25, cz); marque.rotation.y = t * 1.5;
    etoileSol.position.set(x, .07, z); etoileSol.scale.setScalar(1 + Math.sin(t * 3) * .08);
    /* hors de l'écran : une flèche au bord */
    v3.set(cx, h, cz).project(camera);
    const dehors = Math.abs(v3.x) > .92 || Math.abs(v3.y) > .9 || v3.z > 1;
    if (dehors) {
      let dx = v3.x, dy = v3.y; if (v3.z > 1) { dx = -dx; dy = -dy; }
      const an = Math.atan2(-dy, dx), k = .9 / Math.max(Math.abs(Math.cos(an)), Math.abs(Math.sin(an)));
      const f = $('#hFleche'); f.classList.remove('cache');
      f.style.left = ((Math.cos(an) * k * .5 + .5) * innerWidth) + 'px'; f.style.top = ((Math.sin(an) * k * .5 + .5) * innerHeight) + 'px';
      f.style.transform = `translate(-50%,-50%) rotate(${an}rad)`;
    }
  }

  /* ── le jour et la nuit ── */
  let nuitK = 0, derniereLum = -99;
  function majLumiere(force) {
    const t = performance.now() / 1000;
    if (!force && t - derniereLum < 2) return;
    derniereLum = t;
    const L = lumiere(heure());
    nuitK = L.nuit;
    couleursCiel(L.haut, L.bas, L.sol);
    soleil.color.set(L.soleilCouleur); soleil.intensity = L.soleilForce; ciel.intensity = L.cielForce;
    ciel.color.set(nuitK > .5 ? '#a5b4fc' : '#fff8ec'); ciel.groundColor.set(nuitK > .5 ? '#2b3a55' : '#8fb86a');
    soleil.userData.dir = L.soleilDir;
    musiqueNuit(nuitK > .5);
    $('#hHeure').innerHTML = `${nuitK > .5 ? '🌙' : '☀️'} ${texteHeure()}`;
    for (const A of affichees.values()) if (A.mode === 'enclos') A.m.dormir(nuitK > .7);
  }

  /* ── les étapes spéciales demandées par le scénario ── */
  let gontran = null;
  const attendre = s => new Promise(r => setTimeout(r, s * 1000));
  S.brancher({
    poserObjet: monde.poserObjet, retirerObjet: monde.retirerObjet, gonflerBallon: monde.gonflerBallon,
    choisirStarter: P.choisirStarter, ouvrirLabo: P.ouvrirLabo, ouvrirBoutique: P.ouvrirBoutique,
    celebrer: () => { tada(); particules(new THREE.Vector3(moi.racine.position.x, 2, moi.racine.position.z), { n: 50, couleur: '#facc15', taille: .4, vitesse: 5, monte: 4, duree: 2 }); moi.jouer('content'); },
    async construireEnclosAnime(type) {
      const I = monde.enclosInfo[type];
      for (let k = 0; k < 4; k++) { poussiere(I.x + (Math.random() - .5) * 6, I.z + (Math.random() - .5) * 4); bruitMarteau(); await attendre(.35); }
      monde.majEnclos(type); grandir(monde.enclosInfo[type].b.g); tada(); syncDindies();
      await attendre(.6);
    },
    async reparerClapierAnime() {
      for (let k = 0; k < 4; k++) { poussiere(LIEUX.clapier.x + (Math.random() - .5) * 7, LIEUX.clapier.z + (Math.random() - .5) * 3); bruitMarteau(); await attendre(.35); }
      monde.majClapier(); tada(); await attendre(.5);
    },
    async gonflerBallonAnime() { monde.gonflerBallon(true); particules(new THREE.Vector3(6, 4, 35), { n: 40, couleur: '#ffffff', taille: .8, vitesse: 3, monte: 2, duree: 2 }); tada(); await attendre(1); },
    montrerGontran(v) {
      if (!v || gontran) return;
      gontran = creerChibi(PERSONNAGES.gontran); gontran.racine.position.set(9.5, 0, 34.5); gontran.racine.rotation.y = -1.2; scene.add(gontran.racine);
      monde.grille.boucherCercle(9.5, 34.5, .45);
      interactifs.push({ id: 'pnj-gontran', e: '💬', texte: 'Gontran', x: 9.5, z: 35.7, cible: gontran.racine, pnj: 'gontran', rayon: 2.2 });
    },
    finChapitre() {
      tada();
      const F = el(`<div class="voile"><div class="fenetre finChap"><div class="ruban">🎉 Fin du chapitre 1 !</div><div class="contenu">
        <p class="grosEmoji">🏡🦃🎈</p><p>Tu as réparé le Domaine, adopté tes premières dindies et réparé la montgolfière du Capitaine Zéphyr. Bravo, exploratrice !</p>
        <p><b>La suite :</b> le chapitre 2, <b>l’expédition aux Prés</b>, où tu attraperas des dindies sauvages… arrive bientôt !</p>
        <p class="petitTexte">En attendant, prends soin de tes dindies, relève le courrier chaque jour et fais un vœu à la fontaine.</p>
        <button class="btn grand vert" id="finOk">Super !</button></div></div></div>`);
      document.body.appendChild(F); $('#finOk', F).onclick = () => { pop(); F.remove(); };
    }
  });
  const bruitMarteau = () => { try { const A = audio(), o = A.createOscillator(), g = A.createGain(); o.type = 'square'; o.frequency.value = 180; g.gain.setValueAtTime(.08, A.currentTime); g.gain.exponentialRampToValueAtTime(.001, A.currentTime + .12); o.connect(g); g.connect(A.destination); o.start(); o.stop(A.currentTime + .13); } catch { /* pas de son */ } };
  function grandir(g) { const t0 = performance.now(); const f = () => { const k = Math.min(1, (performance.now() - t0) / 700); g.scale.set(1, .01 + .99 * (1 - Math.pow(1 - k, 3)) * (1 + Math.sin(k * Math.PI) * .12), 1); if (k < 1) requestAnimationFrame(f); }; f(); }

  /* ── la sauvegarde automatique ── */
  let sale = true;
  J.surChangement(quoi => { sale = true; majHud(); if (quoi === 'dindies' || quoi === 'compagnon') syncDindies(); });
  function sauver() { E().monde.position = [+moi.racine.position.x.toFixed(2), +moi.racine.position.z.toFixed(2)]; SAUVE.sauverProfil(idProfil, E(), J.resume()); sale = false; }
  setInterval(() => { if (sale) sauver(); }, 8000);
  addEventListener('visibilitychange', () => { if (document.hidden) sauver(); });
  addEventListener('pagehide', sauver);

  /* ── la boucle ── */
  syncDindies(); majHud(); appliquerReglages();
  if (E().quete.etape === 'arrivee') setTimeout(() => toast(matchMedia('(pointer: coarse)').matches ? '👆 Touche le sol pour marcher, ou glisse ton doigt comme un joystick. Touche un habitant pour lui parler !' : '🖱️ Clique pour marcher (ou les flèches / ZQSD). Clique sur un habitant pour lui parler ! E = agir.', { duree: 6500, classe: 'grand' }), 900);
  let tempsTotal = 0;
  chaqueImage((dt, t) => {
    tempsTotal += dt; E().stats.tempsJeu += dt;
    const p = moi.racine.position;
    /* le joystick (ou le clavier) a la priorité sur le chemin */
    const dir = fenetreOuverte() || enDialogue() || occupe ? { x: 0, y: 0 } : commandes.direction();
    let vitesse = 0;
    if (dir.x || dir.y) {
      chemin = null; auBout = null;
      const k = Math.hypot(dir.x, dir.y), dx = dir.x * VITESSE * dt, dz = dir.y * VITESSE * dt;
      const [nx, nz] = monde.grille.glisser(p.x, p.z, dx, dz, .3);
      if (nx !== p.x || nz !== p.z) { moi.racine.rotation.y = angle(moi.racine.rotation.y, Math.atan2(dir.x, dir.y), .25); p.x = nx; p.z = nz; vitesse = k; }
    } else if (chemin && chemin.length) {
      const [cx, cz] = chemin[0], dx = cx - p.x, dz = cz - p.z, d = Math.hypot(dx, dz), pas = VITESSE * dt;
      if (d <= pas) { p.x = cx; p.z = cz; chemin.shift(); if (!chemin.length) { chemin = null; anneau.visible = false; const f = auBout; auBout = null; f && f(); } }
      else { p.x += dx / d * pas; p.z += dz / d * pas; moi.racine.rotation.y = angle(moi.racine.rotation.y, Math.atan2(dx, dz), .25); }
      vitesse = 1;
    }
    p.y = sol(p.x, p.z);
    moi.marcher(vitesse); moi.maj(dt, t);
    ombreRonde.position.set(p.x, p.y + .03, p.z);
    if (anneau.visible) { anneau.userData.t += dt; anneau.scale.setScalar(1 + Math.sin(anneau.userData.t * 6) * .15); }
    placerCamera(dt);
    const sd = soleil.userData.dir || [.5, 1, .5];
    soleil.position.set(soleil.target.position.x + sd[0] * 30, sd[1] * 30, soleil.target.position.z + sd[2] * 30);
    /* le bouton d'action */
    const I = fenetreOuverte() || enDialogue() ? null : plusProche();
    const b = $('#hAction');
    if (I) { b.classList.remove('cache'); const t2 = `${I.e} ${I.texte}`; if (b.textContent !== t2) b.textContent = t2; } else b.classList.add('cache');
    /* les dindies */
    for (const A of affichees.values()) majDindie(A, dt, t);
    /* les habitants regardent Roullieee quand elle approche */
    for (const P0 of Object.values(monde.pnj)) { const d = Math.hypot(P0.x - p.x, P0.z - p.z); P0.c.racine.rotation.y = angle(P0.c.racine.rotation.y, d < 6 ? Math.atan2(p.x - P0.x, p.z - P0.z) : P0.r0, .05); }
    if (gontran) gontran.maj(dt, t);
    majLumiere(false);
    monde.maj(dt, t, nuitK, camera.position);
    majMarque(t); majEffets(dt);
  });

  function majDindie(A, dt, t) {
    const m = A.m, q = m.racine.position;
    const dc = Math.hypot(q.x - cible.x, q.z - cible.z);
    m.racine.visible = dc < 48; m.montrerContours(dc < 30);
    if (!m.racine.visible) return;
    if (A.mode === 'compagnon') {
      const p = moi.racine.position, ry = moi.racine.rotation.y;
      const bx = p.x - Math.sin(ry) * 1.4 + Math.cos(ry) * .6, bz = p.z - Math.cos(ry) * 1.4 - Math.sin(ry) * .6;
      const dx = bx - q.x, dz = bz - q.z, d = Math.hypot(dx, dz);
      if (d > 14) { q.x = bx; q.z = bz; }
      else if (d > .5) { const v = Math.min(d * 2.2, VITESSE * 1.15); q.x += dx / d * v * dt; q.z += dz / d * v * dt; m.racine.rotation.y = angle(m.racine.rotation.y, Math.atan2(dx, dz), .2); m.marcher(v / 2.2); }
      else { m.marcher(0); A.prochaineAction -= dt; if (A.prochaineAction < 0) { A.prochaineAction = 6 + Math.random() * 8; m.jouer(['picore', 'glouglou', 'roue'][Math.floor(Math.random() * 3)]); } }
      q.y = sol(q.x, q.z);
    } else {
      if (m.dortIl()) { m.marcher(0); m.maj(dt, t); return; }
      if (!A.cible) {
        A.attente -= dt; m.marcher(0);
        if (A.attente < 0) { A.cible = pointDansEnclos(A.I); }
        A.prochaineAction -= dt;
        if (A.prochaineAction < 0) {
          A.prochaineAction = 4 + Math.random() * 7;
          const r = Math.random(); m.jouer(r < .5 ? 'picore' : r < .8 ? 'glouglou' : 'roue');
          if (r >= .5 && r < .8 && Math.hypot(q.x - moi.racine.position.x, q.z - moi.racine.position.z) < 9) glouglou(1 + Math.random() * .3);
        }
      } else {
        const dx = A.cible[0] - q.x, dz = A.cible[1] - q.z, d = Math.hypot(dx, dz);
        if (d < .1) { A.cible = null; A.attente = 1.5 + Math.random() * 4; }
        else { const v = 1.3; q.x += dx / d * Math.min(d, v * dt); q.z += dz / d * Math.min(d, v * dt); m.racine.rotation.y = angle(m.racine.rotation.y, Math.atan2(dx, dz), .12); m.marcher(.8); }
      }
    }
    m.maj(dt, t);
  }

  /* pour les tests automatiques */
  window.__jeu = { appliquerReglages, moi, monde, allerVers, agir, interactifs, affichees, etat: E, S, P, J, sauver, toucher, positionCible, get chemin() { return chemin; }, get occupe() { return occupe; } };
  return { sauver };
}
const angle = (a, b, k) => { let d = ((b - a + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) - Math.PI; return a + d * k; };
