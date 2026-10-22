/* ══════════ LE JEU : ROULLIEEE DANS LE ROYAUME ══════════
   Marcher (toucher le sol, glisser comme un joystick, ou le clavier), parler aux habitants,
   s'occuper des dindies, suivre les quêtes, voyager en montgolfière et attraper des dindies sauvages.
   Le lieu change : le Domaine reste en mémoire, une région est construite quand on y arrive et libérée quand on part.
   La lumière suit l'heure (et la météo dans les régions) ; tout se sauvegarde. */
import * as THREE from 'three';
import { scene, camera, renderer, chaqueImage, soleil, ciel, couleursCiel, centrerImage, distancesBrume, redimensionner } from '../moteur/rendu.js';
import { entrees } from '../moteur/entrees.js';
import { lumiere, heure, texteHeure, regler as reglerHeure, finForcage, forcerHeure } from '../moteur/temps.js';
import { meteo, METEOS, forcerMeteo } from '../moteur/meteo.js';
import { $, el, toast, fenetreOuverte, enDialogue, fermerDerniere } from '../moteur/ui.js';
import { pop, tada, glouglou, sonActif, musique, musiqueNuit, ambianceMusique, audio, pluieSon } from '../moteur/sons.js';
import { voixActive } from '../moteur/voix.js';
import { texRonde, partager } from '../moteur/materiaux.js';
import { melanger } from '../moteur/couleurs.js';
import * as SAUVE from '../moteur/sauvegarde.js';
import { construireDomaine, LIEUX } from '../monde/domaine.js';
import { sol as solDomaine, ILE, forme as formeDomaine } from '../monde/decor.js';
import { construireRegion } from '../monde/region.js';
import { creerChibi, PERSONNAGES } from '../personnages/chibi.js';
import { creerDindie } from '../dindies/modele.js';
import { variante } from '../dindies/adn.js';
import { PAR_ID } from '../donnees/especes.js';
import { REGIONS } from '../donnees/regions.js';
import * as J from '../jeu/etat.js';
import * as S from '../jeu/scenario.js';
import * as P from '../ui/panneaux.js';
import { creerSauvages } from '../jeu/sauvages.js';
import { lancerCapture, captureActive } from '../jeu/capture.js';
import { ramasser } from '../jeu/trouvailles.js';
import { ouvrirMonde, voyager } from '../ui/monde.js';

const VITESSE = 4.6;

export function demarrerJeu({ idProfil, etat, changerProfil }) {
  J.utiliser(etat);
  const E = () => J.etat();
  /* ── les lieux ── */
  const racineDomaine = new THREE.Group();
  const domaine = construireDomaine(racineDomaine, etat);
  Object.assign(domaine, {
    id: 'domaine', nom: 'Le Domaine', sol: solDomaine, depart: [1.5, 30], brume: [60, 170], ambiance: 'domaine', teinte: null,
    racine: racineDomaine, carte: { forme: formeDomaine, a: ILE.a, b: ILE.b, lieux: Object.values(LIEUX) }
  });
  let monde = domaine, sauvages = null;

  /* ── Roullieee, avec sa « silhouette » visible derrière les bâtiments ── */
  const moi = creerChibi(PERSONNAGES.roullieee);
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
  let zoom = 22, cadre = null;
  const objectifCamera = () => { camera.fov = innerWidth < innerHeight ? 50 : 38; redimensionner(); };
  objectifCamera(); addEventListener('resize', objectifCamera);
  const cible = new THREE.Vector3();
  const vC = new THREE.Vector3();
  const placerCamera = (dt = 1) => {
    /* pendant une capture, la caméra cadre Roullieee et la dindie */
    const visee = cadre ? vC.copy(moi.racine.position).lerp(cadre.s.m.racine.position, .55) : moi.racine.position;
    cible.lerp(visee, Math.min(1, dt * (cadre ? 3 : 5)));
    const z = cadre ? Math.min(zoom, 12.5) : zoom;
    camera.position.set(cible.x, cible.y + z * .64, cible.z + z * .77);
    camera.lookAt(cible.x, cible.y + .8, cible.z);
    /* l'ombre du soleil suit Roullieee (sur une grille, pour ne pas trembler) */
    soleil.target.position.set(Math.round(cible.x), 0, Math.round(cible.z));
  };
  centrerImage(0, 0);
  Object.assign(soleil.shadow.camera, { left: -24, right: 24, top: 24, bottom: -24, near: 1, far: 90 }); soleil.shadow.camera.updateProjectionMatrix();
  soleil.shadow.bias = -.0015; soleil.shadow.normalBias = .06;

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
    $('#hQuete').innerHTML = `<small>${q ? q.titre : 'Chapitre 2 terminé !'}</small>${S.texteEtape()}`;
    $('#hLivre').classList.toggle('cache', !J.combien('grandLivre'));
  };
  $('#hCarte').onclick = () => { pop(); P.ouvrirCarte({ titre: monde.id === 'domaine' ? '🗺️ La carte du Domaine' : `🗺️ ${monde.nom}`, ...carteDe(monde), position: [moi.racine.position.x, moi.racine.position.z], cible: positionCible(), allerA: (x, z) => allerVers(x, z) }); };
  $('#hDindies').onclick = () => { pop(); P.ouvrirClapier({ surChange: syncDindies }); };
  $('#hSac').onclick = () => { pop(); P.ouvrirSac(); };
  $('#hLivre').onclick = () => { pop(); P.ouvrirLivre(); };
  $('#hJournal').onclick = $('#hQuete').onclick = () => { pop(); P.ouvrirJournal(); };
  const carteDe = L => L.carte || { forme: L.ile.forme, a: L.ile.a, b: L.ile.b, lieux: L.lieux };

  /* ── les réglages ── */
  const appliquerReglages = () => {
    const r = E().reglages;
    sonActif(r.son); voixActive(r.voix); reglerHeure(r.heure);
    ambianceMusique(monde.ambiance, lumiere().nuit > .5);
    musique(r.son && r.musique);
    majLumiere(true);
  };

  /* ── les dindies dans le monde : celles des enclos (au Domaine), et la compagne qui suit ── */
  const affichees = new Map();   /* uid → { d, m (modèle), ia } */
  function syncDindies() {
    const voulu = new Map();
    for (const d of E().dindies) {
      if (monde === domaine && d.lieu.startsWith('enclos:') && E().enclos[d.lieu.slice(7)]?.construit) voulu.set(d.uid, 'enclos');
      else if (E().compagnon === d.uid) voulu.set(d.uid, 'compagnon');
    }
    for (const [uid, A] of affichees) if (voulu.get(uid) !== A.mode || A.cle !== cleDe(A.d)) { A.m.liberer(); affichees.delete(uid); }
    for (const [uid, mode] of voulu) {
      if (affichees.has(uid)) continue;
      const d = J.parUid(uid), m = creerDindie(variante(PAR_ID[d.espece], { stade: d.stade, chroma: d.chroma }));
      scene.add(m.racine);
      const A = { d, m, mode, cle: cleDe(d), cible: null, attente: Math.random() * 2, prochaineAction: 3 + Math.random() * 6 };
      if (mode === 'enclos') { const I = domaine.enclosInfo[d.lieu.slice(7)]; A.I = I; const p = pointDansEnclos(I); m.racine.position.set(p[0], 0, p[1]); }
      else { const p = moi.racine.position; m.racine.position.set(p.x - 1.2, p.y, p.z + .8); }
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
  const coeurs = (pos, h) => particules(new THREE.Vector3(pos.x, pos.y + h, pos.z), { n: 10, couleur: '#ff5c8a', taille: .45 });
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
    const [fx, fz] = c[c.length - 1];
    anneau.position.set(fx, monde.sol(fx, fz) + .06, fz); anneau.visible = true; anneau.userData.t = 0;
  }
  const anneau = new THREE.Mesh(new THREE.RingGeometry(.35, .5, 24), new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, depthWrite: false }));
  anneau.rotation.x = -Math.PI / 2; anneau.visible = false; scene.add(anneau);

  /* ── les choses avec lesquelles on peut agir ── */
  function plusProche() {
    const p = moi.racine.position; let best = null, bd = 1e9;
    for (const I of monde.interactifs) { const d = Math.hypot(I.x - p.x, I.z - p.z); if (d < I.rayon && d < bd) { bd = d; best = I; } }
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
      else if (id === 'montgolfiere' || id === 'ballon') await S.parler('zephyr');
      else if (id === 'dindodrome') await S.parler('ginette');
      else if (id.startsWith('ruine-')) toast(`🚧 ${I.ruine} : en travaux. Il ouvrira dans un prochain chapitre !`, { duree: 3200 });
      else if (id.startsWith('objet-') || id.startsWith('deco-')) await S.interagir(id);
      else if (I.trouvaille) {
        const t = ramasser(I.trouvaille, monde.id);
        if (t) { tada(); toast(t, { duree: 3400, classe: 'grand' }); particules(new THREE.Vector3(I.x, monde.sol(I.x, I.z) + 1, I.z), { n: 34, couleur: I.trouvaille.sorte === 'coffre' ? '#facc15' : I.trouvaille.sorte === 'oeuf' ? '#fef3c7' : '#d8b4fe', taille: .4, vitesse: 4, monte: 3.5, duree: 1.6 }); J.changer('inventaire'); }
        monde.retirerTrouvaille(I.trouvaille.id);
      }
      else if (I.gadget) { const fait = await S.gadget(I.gadget); if (fait) { monde.gadgets[I.gadget]?.anim?.(); majLumiere(true); } }
      else if (id === 'clapier') { await S.interagir(id); if (E().batiments.clapier.repare) P.ouvrirClapier({ surChange: syncDindies }); else if (E().quete.etape !== 'reparerClapier') toast('🚧 Le Clapier est en ruine. Il faudrait des clous pour le réparer…'); else toast('Il faut une boîte de clous ! Mimi en vend.'); }
      else if (I.enclos) { const fait = await S.interagir(id); if (!fait) P.ouvrirEnclos(I.enclos, { surChange: syncDindies }); }
    } finally { occupe = false; majHud(); }
  }

  /* ── attraper une dindie sauvage : on s'approche, puis le petit jeu de la capture ── */
  function approcher(s) {
    const q = s.m.racine.position, p = moi.racine.position, dx = p.x - q.x, dz = p.z - q.z, d = Math.hypot(dx, dz) || 1;
    if (d < 3.6) { capturer(s); return; }
    allerVers(q.x + dx / d * 3, q.z + dz / d * 3, () => capturer(s));
  }
  async function capturer(s) {
    if (occupe || !sauvages || !sauvages.liste.includes(s) || s.etat === 'fuite') return;
    if (s.fantome) { toast('✨ Un mirage ! Il s’efface quand tu approches…'); return; }
    if (!J.combien('filet')) { toast('Il te faut un filet ! Le Professeur Plumeau en a un pour toi.'); return; }
    occupe = true; chemin = null;
    const q = s.m.racine.position; moi.racine.rotation.y = Math.atan2(q.x - moi.racine.position.x, q.z - moi.racine.position.z);
    try {
      const R = await lancerCapture(s, {
        lieu: monde, sauvages, chaqueImage, coeurs: (x, n) => particules(new THREE.Vector3(x.m.racine.position.x, x.m.racine.position.y + x.m.hauteur(), x.m.racine.position.z), { n, couleur: '#ff5c8a', taille: .45 }),
        cadrer: (on, x) => { cadre = on ? { s: x } : null; },
        lancerObjet, lancerFilet
      });
      if (R.resultat === 'attrapee') {
        moi.jouer('content');
        particules(new THREE.Vector3(q.x, q.y + 1, q.z), { n: 50, couleur: '#facc15', taille: .45, vitesse: 5, monte: 4, duree: 2 });
        S.evenement('capture', R.dindie.espece);
      }
    } finally { occupe = false; cadre = null; majHud(); }
  }
  /* une friandise lancée en cloche (un émoji), ou une main tendue */
  const texEmoji = new Map();
  function textureEmoji(e) {
    if (!texEmoji.has(e)) {
      const c = document.createElement('canvas'); c.width = c.height = 96; const x = c.getContext('2d');
      x.font = '76px serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(e, 48, 54);
      const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; texEmoji.set(e, partager(t));
    }
    return texEmoji.get(e);
  }
  function trajectoire(objet, de, vers, duree, haut) {
    return new Promise(r => {
      let t = 0;
      const stop = chaqueImage(dt => {
        t += dt; const k = Math.min(1, t / duree);
        objet.position.lerpVectors(de, vers, k); objet.position.y += Math.sin(k * Math.PI) * haut;
        if (k >= 1) { stop(); r(); }
      });
    });
  }
  async function lancerObjet(e, s) {
    moi.jouer('presente');
    if (!e) { await attendre(.5); return; }
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: textureEmoji(e), transparent: true, depthWrite: false }));
    sp.scale.setScalar(.7); scene.add(sp);
    const de = moi.racine.position.clone(); de.y += 1.3;
    const vers = s.m.racine.position.clone(); vers.y += .4;
    await trajectoire(sp, de, vers, .55, 1.6);
    scene.remove(sp); sp.material.dispose();
  }
  /* le filet : il vole, tombe sur la dindie… et tremble 3 fois (ou elle s'échappe) */
  async function lancerFilet(s, reussi) {
    moi.jouer('saut');
    const g = new THREE.Group();
    const voile = new THREE.Mesh(new THREE.ConeGeometry(.95, 1.25, 18, 1, true), new THREE.MeshBasicMaterial({ color: '#f8fafc', transparent: true, opacity: .55, side: THREE.DoubleSide, depthWrite: false }));
    voile.rotation.x = Math.PI; voile.position.y = .62; g.add(voile);
    const bord = new THREE.Mesh(new THREE.TorusGeometry(.95, .06, 8, 28), new THREE.MeshBasicMaterial({ color: '#9ca3af' })); bord.rotation.x = Math.PI / 2; g.add(bord);
    scene.add(g);
    const q = s.m.racine.position, de = moi.racine.position.clone(); de.y += 1.4;
    const vers = new THREE.Vector3(q.x, q.y + .1, q.z);
    g.scale.setScalar(.4);
    await trajectoire(g, de, vers.clone().setY(q.y + 2.2), .45, 1.2);
    const t0 = performance.now();
    await new Promise(r => { const stop = chaqueImage(() => { const k = Math.min(1, (performance.now() - t0) / 220); g.position.y = q.y + 2.2 - k * 2.1; g.scale.setScalar(.4 + k * .6 * s.taille); if (k >= 1) { stop(); r(); } }); });
    let ok = reussi;
    if (reussi) {
      s.m.racine.visible = false;
      for (let k = 0; k < 3; k++) {
        await new Promise(r => { const t1 = performance.now(); const stop = chaqueImage(() => { const u = (performance.now() - t1) / 420; g.rotation.z = Math.sin(u * Math.PI * 2) * .25 * (1 - u); if (u >= 1) { g.rotation.z = 0; stop(); r(); } }); });
        pop(); await attendre(.18);
      }
      particules(new THREE.Vector3(q.x, q.y + 1.2, q.z), { n: 30, couleur: '#fde68a', taille: .4, vitesse: 3, monte: 3, duree: 1.4 });
    } else {
      s.m.jouer('saut');
      await new Promise(r => { const t1 = performance.now(); const stop = chaqueImage(() => { const u = (performance.now() - t1) / 600; g.position.x = q.x + u * 1.2; voile.material.opacity = .55 * (1 - u); if (u >= 1) { stop(); r(); } }); });
    }
    scene.remove(g); voile.geometry.dispose(); voile.material.dispose(); bord.geometry.dispose(); bord.material.dispose();
    return ok;
  }

  /* toucher l'écran : une dindie sauvage, une de nos dindies, un habitant, un bâtiment… ou le sol */
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), plan = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), pt = new THREE.Vector3();
  function toucher(x, y) {
    if (captureActive()) { captureActive().action(); return; }
    if (fenetreOuverte() || enDialogue() || occupe) return;
    audio();
    ndc.set(x / innerWidth * 2 - 1, -(y / innerHeight) * 2 + 1); ray.setFromCamera(ndc, camera);
    /* les dindies sauvages (on s'approche pour l'attraper) */
    if (sauvages) {
      const h = ray.intersectObjects(sauvages.objets(), true)[0];
      if (h) { const s = sauvages.sauvageDe(h.object); if (s) { pop(); approcher(s); return; } }
    }
    /* nos dindies (ouvrir leur fiche) */
    const objs = [...affichees.values()].map(A => A.m.racine);
    const hd = ray.intersectObjects(objs, true)[0];
    if (hd) { const d = J.parUid(hd.object.userData.uid); if (d) { pop(); P.ouvrirFiche(d, { surChange: syncDindies }); return; } }
    /* puis les choses interactives (on y va, et on agit en arrivant) */
    const interactifs = monde.interactifs, cibleDe = I => (I.enclos ? domaine.enclosInfo[I.enclos].b.g : I.cible);
    const cibles = interactifs.map(cibleDe).filter(Boolean);
    const h = ray.intersectObjects(cibles, true)[0];
    if (h) {
      let o = h.object; while (o && !cibles.includes(o)) o = o.parent;
      const I = interactifs.find(I => cibleDe(I) === o);
      if (I) { allerVers(I.x, I.z, () => agir(I)); return; }
    }
    /* le sol (dans une région, il a du relief : on vise à la hauteur de Roullieee) */
    plan.constant = -moi.racine.position.y;
    if (ray.ray.intersectPlane(plan, pt)) allerVers(pt.x, pt.z);
  }
  const commandes = entrees(renderer.domElement, {
    surTap: toucher,
    surZoom: k => { zoom = Math.min(34, Math.max(10, zoom * k)); },
    surAction: () => { if (captureActive()) { captureActive().action(); return; } if (enDialogue()) return; if (fermerDerniere()) return; const I = plusProche(); if (I) agir(I); }
  });
  $('#hAction').onclick = () => { const I = plusProche(); if (I) { pop(); agir(I); } };

  /* ── la flèche de quête (au-dessus de l'objectif) ── */
  const marque = new THREE.Group(); scene.add(marque);
  const fl = new THREE.Mesh(new THREE.ConeGeometry(.45, .9, 4), new THREE.MeshBasicMaterial({ color: '#facc15' })); fl.rotation.x = Math.PI; marque.add(fl);
  const flc = new THREE.Mesh(new THREE.ConeGeometry(.55, 1.05, 4), new THREE.MeshBasicMaterial({ color: '#7c2d12', side: THREE.BackSide })); flc.rotation.x = Math.PI; marque.add(flc);
  const etoileSol = new THREE.Mesh(new THREE.RingGeometry(.9, 1.15, 32), new THREE.MeshBasicMaterial({ color: '#facc15', transparent: true, opacity: .8, depthWrite: false }));
  etoileSol.rotation.x = -Math.PI / 2; scene.add(etoileSol);
  /* une cible : un objet interactif, une dindie sauvage (« sauvage:espece ») ou un coin de la région (« zone:nom ») */
  function positionCible() {
    let ids = S.cibleEtape(); if (!ids) return null;
    if (!Array.isArray(ids)) ids = [ids];
    const p = moi.racine.position; let best = null, bd = 1e9;
    const essayer = (x, z, h, quoi) => { const d = Math.hypot(x - p.x, z - p.z); if (d < bd) { bd = d; best = [x, z, h, quoi]; } };
    for (const id of ids) {
      if (id.startsWith('sauvage')) {
        if (!sauvages) continue;
        const esp = id.split(':')[1];
        for (const s of sauvages.liste) if ((!esp || s.espece === esp) && !s.fantome && s.etat !== 'fuite') { const q = s.m.racine.position; essayer(q.x, q.z, 1.7 * s.taille + .9, s); }
        if (best && esp) return best;
        continue;
      }
      if (id.startsWith('zone:')) { if (best) continue; for (const [x, z] of (monde.zones || {})[id.slice(5)] || []) essayer(x, z, 3, null); continue; }
      const I = monde.interactifs.find(i => i.id === id); if (!I) continue;
      const P0 = I.pnj && monde.pnj[I.pnj];
      essayer(P0 ? P0.x : I.x, P0 ? P0.z : I.z, I.pnj ? 2.9 : I.enclos ? 2.4 : I.objet ? 1.8 : I.gadget ? 2.6 : 4.2, I);
    }
    return best;
  }
  const v3 = new THREE.Vector3();
  function majMarque(t) {
    const c = cadre ? null : positionCible();
    marque.visible = etoileSol.visible = !!c;
    $('#hFleche').classList.add('cache');
    if (!c) return;
    const [x, z, h] = c, y0 = monde.sol(x, z);
    marque.position.set(x, y0 + h + Math.sin(t * 3) * .25, z); marque.rotation.y = t * 1.5;
    etoileSol.position.set(x, y0 + .07, z); etoileSol.scale.setScalar(1 + Math.sin(t * 3) * .08);
    /* hors de l'écran : une flèche au bord */
    v3.set(x, y0 + h, z).project(camera);
    const dehors = Math.abs(v3.x) > .92 || Math.abs(v3.y) > .9 || v3.z > 1;
    if (dehors) {
      let dx = v3.x, dy = v3.y; if (v3.z > 1) { dx = -dx; dy = -dy; }
      const an = Math.atan2(-dy, dx), k = .9 / Math.max(Math.abs(Math.cos(an)), Math.abs(Math.sin(an)));
      const f = $('#hFleche'); f.classList.remove('cache');
      f.style.left = ((Math.cos(an) * k * .5 + .5) * innerWidth) + 'px'; f.style.top = ((Math.sin(an) * k * .5 + .5) * innerHeight) + 'px';
      f.style.transform = `translate(-50%,-50%) rotate(${an}rad)`;
    }
  }

  /* ── le jour et la nuit (et, dans les régions, la météo et la couleur du ciel) ── */
  let nuitK = 0, derniereLum = -99, pluieVoulue = 0;
  function majLumiere(force) {
    const t = performance.now() / 1000;
    if (!force && t - derniereLum < 2) return;
    derniereLum = t;
    const L = lumiere(heure());
    nuitK = L.nuit;
    let { haut, bas, sol } = L, sF = L.soleilForce, cF = L.cielForce;
    if (monde.teinte) { const k = monde.teinte.k * (1 - nuitK); haut = melanger(haut, monde.teinte.haut, k); bas = melanger(bas, monde.teinte.bas, k); }
    const m = monde.region ? meteo(monde.id) : 'soleil';
    if (m === 'nuages') { haut = melanger(haut, '#9fb3c8', .35); bas = melanger(bas, '#e2e8f0', .3); sF *= .72; }
    if (m === 'pluie') { haut = melanger(haut, '#64748b', .62); bas = melanger(bas, '#b6c2d1', .55); sol = melanger(sol, '#94a3b8', .5); sF *= .45; cF *= .9; }
    distancesBrume(...(m === 'pluie' ? [36, 125] : monde.brume));
    pluieVoulue = m === 'pluie' ? 1 : 0; pluieSon(pluieVoulue);
    couleursCiel(haut, bas, sol);
    soleil.color.set(L.soleilCouleur); soleil.intensity = sF; ciel.intensity = cF;
    ciel.color.set(nuitK > .5 ? '#a5b4fc' : '#fff8ec'); ciel.groundColor.set(nuitK > .5 ? '#2b3a55' : monde.id === 'maroc' ? '#d6b37a' : '#8fb86a');
    soleil.userData.dir = L.soleilDir;
    musiqueNuit(nuitK > .5);
    $('#hHeure').innerHTML = `${monde.region ? monde.region.e + ' ' : ''}${nuitK > .5 ? (m === 'soleil' ? '🌙' : METEOS[m].e) : METEOS[m].e} ${texteHeure()}`;
    $('#hHeure').title = monde.nom + (monde.region ? ' · ' + METEOS[m].nom : '');
    for (const A of affichees.values()) if (A.mode === 'enclos') A.m.dormir(nuitK > .7);
  }

  /* ── les étapes spéciales demandées par le scénario ── */
  let gontran = null;
  const attendre = s => new Promise(r => setTimeout(r, s * 1000));
  const apiScenario = () => ({
    lieu: () => monde.id,
    poserObjet: (...a) => monde.poserObjet(...a), retirerObjet: id => monde.retirerObjet(id), gonflerBallon: v => domaine.gonflerBallon(v),
    allumerLanterne: (i, v) => monde.gadgets?.['lanterne' + i]?.allumer(v),
    choisirStarter: P.choisirStarter, ouvrirLabo: P.ouvrirLabo, ouvrirBoutique: P.ouvrirBoutique,
    ouvrirMonde: () => ouvrirMonde({ ici: monde.id, ouverte: S.regionOuverte, surChoix: id => partirVers(id) }),
    celebrer: () => { tada(); particules(new THREE.Vector3(moi.racine.position.x, moi.racine.position.y + 2, moi.racine.position.z), { n: 50, couleur: '#facc15', taille: .4, vitesse: 5, monte: 4, duree: 2 }); moi.jouer('content'); },
    async construireEnclosAnime(type) {
      const I = domaine.enclosInfo[type];
      for (let k = 0; k < 4; k++) { poussiere(I.x + (Math.random() - .5) * 6, I.z + (Math.random() - .5) * 4); bruitMarteau(); await attendre(.35); }
      domaine.majEnclos(type); grandir(domaine.enclosInfo[type].b.g); tada(); syncDindies();
      await attendre(.6);
    },
    async reparerClapierAnime() {
      for (let k = 0; k < 4; k++) { poussiere(LIEUX.clapier.x + (Math.random() - .5) * 7, LIEUX.clapier.z + (Math.random() - .5) * 3); bruitMarteau(); await attendre(.35); }
      domaine.majClapier(); tada(); await attendre(.5);
    },
    async gonflerBallonAnime() { domaine.gonflerBallon(true); particules(new THREE.Vector3(6, 4, 35), { n: 40, couleur: '#ffffff', taille: .8, vitesse: 3, monte: 2, duree: 2 }); tada(); await attendre(1); },
    montrerGontran(v) {
      if (!v || gontran) return;
      gontran = creerChibi(PERSONNAGES.gontran); gontran.racine.position.set(9.5, 0, 34.5); gontran.racine.rotation.y = -1.2; domaine.racine.add(gontran.racine);
      domaine.grille.boucherCercle(9.5, 34.5, .45);
      domaine.interactifs.push({ id: 'pnj-gontran', e: '💬', texte: 'Gontran', x: 9.5, z: 35.7, cible: gontran.racine, pnj: 'gontran', rayon: 2.2 });
    },
    finChapitre(n) { P.finChapitre(n); }
  });
  const bruitMarteau = () => { try { const A = audio(), o = A.createOscillator(), g = A.createGain(); o.type = 'square'; o.frequency.value = 180; g.gain.setValueAtTime(.08, A.currentTime); g.gain.exponentialRampToValueAtTime(.001, A.currentTime + .12); o.connect(g); g.connect(A.destination); o.start(); o.stop(A.currentTime + .13); } catch { /* pas de son */ } };
  function grandir(g) { const t0 = performance.now(); const f = () => { const k = Math.min(1, (performance.now() - t0) / 700); g.scale.set(1, .01 + .99 * (1 - Math.pow(1 - k, 3)) * (1 + Math.sin(k * Math.PI) * .12), 1); if (k < 1) requestAnimationFrame(f); }; f(); }

  /* ── changer de lieu : on range l'ancien (on libère une région), on installe le nouveau ── */
  function installerLieu(id, position = null) {
    chemin = null; auBout = null; anneau.visible = false; cadre = null;
    if (sauvages) { sauvages.liberer(); sauvages = null; }
    for (const A of affichees.values()) A.m.liberer(); affichees.clear();
    if (monde.racine.parent) scene.remove(monde.racine);
    if (monde !== domaine) monde.liberer();
    monde = id === 'domaine' ? domaine : construireRegion(id);
    scene.add(monde.racine);
    const [x, z] = position || monde.depart;
    moi.racine.position.set(x, monde.sol(x, z), z); moi.racine.rotation.y = Math.PI;
    cible.copy(moi.racine.position); placerCamera(1);
    E().monde.lieu = id;
    if (monde.region) sauvages = creerSauvages(monde, { etapeAtteinte: S.etapeAtteinte, particules, quandVue: (s, nouvelle, raison) => {
      if (raison === 'mirage') toast(PAR_ID[s.espece].rarete === 'rare' && REGIONS[monde.id].equipement ? `✨ Un mirage ? Avec ${P.nomObjet(REGIONS[monde.id].especes[s.espece].equipement)}, tu y verrais plus clair…` : '✨ Un mirage…', { duree: 3600 });
      else if (nouvelle) toast(`👁️ Nouvelle espèce aperçue : <b>${PAR_ID[s.espece].nom}</b> !`, { duree: 2800 });
    } });
    syncDindies();
    S.brancher(apiScenario());
    ambianceMusique(monde.ambiance, lumiere().nuit > .5);
    majLumiere(true); majHud();
  }
  async function partirVers(id) {
    if (id === monde.id) { toast('Tu y es déjà !'); return; }
    occupe = true;
    try {
      sauver();
      await voyager(id === 'domaine' ? { nom: 'Le Domaine', e: '🏡' } : REGIONS[id], () => { finForcage(); installerLieu(id); });
      S.evenement('arrivee', id);
      majHud(); sale = true;
    } finally { occupe = false; }
  }

  /* ── la sauvegarde automatique ── */
  let sale = true;
  J.surChangement(quoi => { sale = true; majHud(); if (quoi === 'dindies' || quoi === 'compagnon') syncDindies(); });
  function sauver() {
    const pos = [+moi.racine.position.x.toFixed(2), +moi.racine.position.z.toFixed(2)];
    E().monde.lieu = monde.id; E().monde.positions[monde.id] = pos;
    if (monde === domaine) E().monde.position = pos;
    SAUVE.sauverProfil(idProfil, E(), J.resume()); sale = false;
  }
  setInterval(() => { if (sale) sauver(); }, 8000);
  addEventListener('visibilitychange', () => { if (document.hidden) sauver(); });
  addEventListener('pagehide', sauver);

  /* ── la boucle ── */
  const lieuDepart = S.regionOuverte(E().monde.lieu) && (E().monde.lieu === 'domaine' || REGIONS[E().monde.lieu]?.especes) ? E().monde.lieu : 'domaine';
  installerLieu(lieuDepart, lieuDepart === 'domaine' ? etat.monde.position : E().monde.positions[lieuDepart]);
  appliquerReglages();
  if (E().quete.etape === 'arrivee') setTimeout(() => toast(matchMedia('(pointer: coarse)').matches ? '👆 Touche le sol pour marcher, ou glisse ton doigt comme un joystick. Touche un habitant pour lui parler !' : '🖱️ Clique pour marcher (ou les flèches / ZQSD). Clique sur un habitant pour lui parler ! E = agir.', { duree: 6500, classe: 'grand' }), 900);
  chaqueImage((dt, t) => {
    E().stats.tempsJeu += dt;
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
    p.y = monde.sol(p.x, p.z);
    moi.marcher(vitesse); moi.maj(dt, t);
    ombreRonde.position.set(p.x, p.y + .03, p.z);
    if (anneau.visible) { anneau.userData.t += dt; anneau.scale.setScalar(1 + Math.sin(anneau.userData.t * 6) * .15); }
    placerCamera(dt);
    const sd = soleil.userData.dir || [.5, 1, .5];
    soleil.position.set(soleil.target.position.x + sd[0] * 30, sd[1] * 30, soleil.target.position.z + sd[2] * 30);
    /* le bouton d'action */
    const I = fenetreOuverte() || enDialogue() || captureActive() ? null : plusProche();
    const b = $('#hAction');
    if (I) { b.classList.remove('cache'); const t2 = `${I.e} ${I.texte}`; if (b.textContent !== t2) b.textContent = t2; } else b.classList.add('cache');
    /* les dindies */
    for (const A of affichees.values()) majDindie(A, dt, t);
    if (sauvages) sauvages.maj(dt, t, p, nuitK, !!captureActive());
    /* les habitants regardent Roullieee quand elle approche */
    for (const P0 of Object.values(monde.pnj)) { const d = Math.hypot(P0.x - p.x, P0.z - p.z); P0.c.racine.rotation.y = angle(P0.c.racine.rotation.y, d < 6 ? Math.atan2(p.x - P0.x, p.z - P0.z) : P0.r0, .05); }
    if (gontran && monde === domaine) gontran.maj(dt, t);
    majLumiere(false);
    if (monde === domaine) domaine.maj(dt, t, nuitK, camera.position);
    else monde.maj(dt, t, nuitK, camera.position, pluieVoulue, cible);
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
      q.y = monde.sol(q.x, q.z);
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
  window.__jeu = {
    appliquerReglages, moi, allerVers, agir, affichees, etat: E, S, P, J, sauver, toucher, positionCible, partirVers, capturer, approcher,
    get monde() { return monde; }, get interactifs() { return monde.interactifs; }, get sauvages() { return sauvages; },
    get chemin() { return chemin; }, get occupe() { return occupe; }, get capture() { return captureActive(); }, domaine,
    forcerMeteo, forcerHeure, majLumiere
  };
  return { sauver };
}
const angle = (a, b, k) => { let d = ((b - a + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) - Math.PI; return a + d * k; };
