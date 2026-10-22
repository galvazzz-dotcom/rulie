/* ══════════ UNE COURSE AU DINDODROME (la course qu'on regarde et qu'on joue) ══════════
   La simulation (jeu/course.js) avance ; ici on la dessine : 6 dindies sur l'anneau, la caméra qui suit la nôtre,
   le compte à rebours, le public, le commentateur, les boutons (sauter, compétences, foncer, ⏩), puis le podium.
   lancerCourse(def, dindie, hooks) → Promise({ C, nettoyer }) : on appelle nettoyer() quand les résultats sont lus. */
import * as THREE from 'three';
import { PAR_ID } from '../donnees/especes.js';
import { COMPETENCES, SORTES, PISTES } from '../donnees/courses.js';
import { variante } from '../dindies/adn.js';
import { creerDindie } from '../dindies/modele.js';
import { portraitDindie } from '../dindies/portrait.js';
import { creerCourse, COMPTE } from '../jeu/course.js';
import { optionsCourse } from '../jeu/dindodrome.js';
import { couloir, PLACES_PODIUM } from '../monde/dindodrome.js';
import { el, $, $$, echapper } from '../moteur/ui.js';
import { audio, sonActif, glouglou, tada, pop } from '../moteur/sons.js';
import { dire } from '../moteur/voix.js';
import { camera } from '../moteur/rendu.js';

let active = null;
export const courseActive = () => active;
const ORD = n => n === 1 ? '1re' : n + 'e';

/* ── les petits bruits de la course ── */
function bip(f, d = .12, v = .1, type = 'square') {
  if (!sonActif()) return;
  try { const A = audio(), t = A.currentTime, o = A.createOscillator(), g = A.createGain(); o.type = type; o.frequency.value = f; g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(.0005, t + d); o.connect(g); g.connect(A.destination); o.start(t); o.stop(t + d + .02); } catch { /* pas de son */ }
}
function sifflet() { if (!sonActif()) return; try { const A = audio(), t = A.currentTime, o = A.createOscillator(), l = A.createOscillator(), lg = A.createGain(), g = A.createGain(); o.type = 'sine'; o.frequency.value = 2600; l.frequency.value = 38; lg.gain.value = 180; l.connect(lg); lg.connect(o.frequency); g.gain.setValueAtTime(.0001, t); g.gain.linearRampToValueAtTime(.09, t + .03); g.gain.setValueAtTime(.09, t + .45); g.gain.exponentialRampToValueAtTime(.0005, t + .6); o.connect(g); g.connect(A.destination); o.start(t); l.start(t); o.stop(t + .62); l.stop(t + .62); } catch { /* pas de son */ } }
function boing() { if (!sonActif()) return; try { const A = audio(), t = A.currentTime, o = A.createOscillator(), g = A.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(320, t); o.frequency.exponentialRampToValueAtTime(760, t + .16); g.gain.setValueAtTime(.07, t); g.gain.exponentialRampToValueAtTime(.0005, t + .2); o.connect(g); g.connect(A.destination); o.start(t); o.stop(t + .22); } catch { /* pas de son */ } }
function plof() { if (!sonActif()) return; try { const A = audio(), t = A.currentTime, o = A.createOscillator(), g = A.createGain(); o.type = 'triangle'; o.frequency.setValueAtTime(180, t); o.frequency.exponentialRampToValueAtTime(60, t + .25); g.gain.setValueAtTime(.12, t); g.gain.exponentialRampToValueAtTime(.0005, t + .3); o.connect(g); g.connect(A.destination); o.start(t); o.stop(t + .32); } catch { /* pas de son */ } }
function whoosh() { if (!sonActif()) return; try { const A = audio(), t = A.currentTime, n = A.sampleRate * .4, b = A.createBuffer(1, n, A.sampleRate), d = b.getChannelData(0); for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.sin(i / n * Math.PI); const s = A.createBufferSource(), f = A.createBiquadFilter(), g = A.createGain(); s.buffer = b; f.type = 'bandpass'; f.frequency.setValueAtTime(400, t); f.frequency.exponentialRampToValueAtTime(2400, t + .35); g.gain.value = .14; s.connect(f); f.connect(g); g.connect(A.destination); s.start(t); } catch { /* pas de son */ } }
/* le public : un souffle filtré qui monte quand la course s'emballe */
function creerFoule() {
  if (!sonActif()) return { niveau() {}, hourra() {}, arreter() {} };
  try {
    const A = audio(), n = A.sampleRate * 2, b = A.createBuffer(1, n, A.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    const s = A.createBufferSource(), f = A.createBiquadFilter(), g = A.createGain(); s.buffer = b; s.loop = true; f.type = 'bandpass'; f.frequency.value = 900; f.Q.value = .7; g.gain.value = 0;
    s.connect(f); f.connect(g); g.connect(A.destination); s.start();
    return {
      niveau: k => g.gain.setTargetAtTime(.012 + k * .05, A.currentTime, .4),
      hourra: () => { g.gain.cancelScheduledValues(A.currentTime); g.gain.setTargetAtTime(.11, A.currentTime, .05); g.gain.setTargetAtTime(.03, A.currentTime + 1.4, .8); },
      arreter: () => { g.gain.setTargetAtTime(0, A.currentTime, .3); setTimeout(() => { try { s.stop(); } catch { /* déjà arrêté */ } }, 1200); }
    };
  } catch { return { niveau() {}, hourra() {}, arreter() {} }; }
}
/* une étiquette au-dessus d'une dindie */
function etiquette(texte, couleur) {
  const c = document.createElement('canvas'); c.width = 256; c.height = 64; const x = c.getContext('2d');
  x.fillStyle = couleur; x.beginPath(); x.roundRect(4, 6, 248, 52, 24); x.fill();
  let t = 34; x.font = `${t}px "Lilita One", sans-serif`;
  while (x.measureText(texte).width > 228 && t > 16) { t -= 2; x.font = `${t}px "Lilita One", sans-serif`; }
  x.fillStyle = '#ffffff'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(texte, 128, 34);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, depthTest: false }));
  s.scale.set(1.4, .35, 1); s.renderOrder = 5;
  return s;
}

/* H : { lieu, chaqueImage, cadrer(on), cacher(on), particules(pos, opts), nuit, nomJoueuse } */
export function lancerCourse(def, d, H) {
  return new Promise(resoudre => {
    const opts = optionsCourse(def, d, { nom: H.nomJoueuse || 'Roullieee' });
    const C = creerCourse({ ...opts, nuit: !!H.nuit });
    const L = H.lieu, P = L.piste, obst = { haies: opts.haies, zones: opts.zones, depart: opts.depart };
    P.preparer(def.piste, obst);
    H.cadrer(true); H.cacher(true);
    const foule = creerFoule(); foule.niveau(.3); L.foule.ferveur(.4);
    const S = SORTES[def.sorte], PI = PISTES[def.piste];

    /* ── les dindies sur la ligne de départ ── */
    const R3 = C.coureurs.map((R, k) => {
      const m = creerDindie(variante(PAR_ID[R.d.espece], { stade: R.d.stade, chroma: R.d.chroma }));
      L.racine.add(m.racine);
      /* une étiquette pour la nôtre et pour la star de la course (les autres : leur point sur la barre du haut) */
      const lab = etiquette(R.joueur ? '★ ' + R.nom : R.nom, R.joueur ? '#ea580c' : '#7c3aed');
      m.racine.add(lab); lab.position.y = m.hauteur() / m.adn.taille + .5; lab.visible = R.joueur || R.id === 'star';
      return { R, m, k, lab, chuteT: 0 };
    });
    const moi = R3.find(x => x.R.joueur);
    const placer = (X, dt, t) => {
      const R = X.R, Q = P.point(obst.depart + R.pos, couloir(X.k));
      let y = .03;
      if (R.saut && R.pos >= R.saut.p0 && R.pos <= R.saut.p1) { const k = (R.pos - R.saut.p0) / Math.max(.1, R.saut.p1 - R.saut.p0); y += Math.sin(Math.PI * k) * (R.saut.q === 'parfait' ? .9 : R.saut.q === 'tot' || R.saut.q === 'chute' ? .45 : R.saut.q === 'hop' ? .5 : .75); }
      X.m.racine.position.set(Q.x, y, Q.z);
      X.m.racine.rotation.y = Math.atan2(Q.dx, Q.dz);
      if (X.chuteT > 0) { X.chuteT = Math.max(0, X.chuteT - dt); const k = X.chuteT / .95; X.m.racine.rotation.x = Math.sin((1 - k) * Math.PI) * .9; X.m.racine.rotation.z = Math.sin((1 - k) * 12) * .25 * k; }
      else { X.m.racine.rotation.x = 0; X.m.racine.rotation.z = 0; }
      X.m.marcher(C.phase === 'compte' || !R.parti ? 0 : Math.min(6, R.v / 2.6));
      X.m.maj(dt, t);
    };
    R3.forEach(X => placer(X, 0, 0));

    /* ── l'interface ── */
    const comps = C.joueur().competences;
    const U = el(`<div id="course">
      <div class="cHaut"><div class="cPlace"><b>–</b><small>/ 6</small></div>
        <div class="cProgres"><div class="cBarre">${R3.map(X => `<i class="${X.R.joueur ? 'moi' : X.R.id === 'star' ? 'star' : ''}" data-i="${X.R.i}"></i>`).join('')}</div><small class="cDist">0 / ${def.distance} m</small></div>
        <button class="cVite" id="cVite" aria-label="Accélérer">⏩</button></div>
      <div class="cTitre">${S.e} ${echapper(def.nom)}<small>${PI.e} ${PI.nom}</small></div>
      <div class="cCom"></div><div class="cMsg"></div><div class="cCompte"></div>
      <div class="cEnergie" title="Endurance"><span>💪</span><div class="barreP"><b></b></div></div>
      <div class="cBas"><div class="cComps">${comps.map((id, k) => `<button class="cComp" data-k="${k}" title="${COMPETENCES[id].desc}"><span>${COMPETENCES[id].e}</span><small>${COMPETENCES[id].nom}</small><i></i></button>`).join('')}</div>
        <button class="cFonce" id="cFonce"><span>🔥</span><small>Fonce !</small></button>
        <button class="cSaut" id="cSaut"><i class="anneau"></i><span>🦘</span><small>Saute !</small></button></div></div>`);
    document.body.appendChild(U); document.body.classList.add('enCourse');
    let vitesse = 1, finiJoueuse = null, termine = false, tCom = 0, dernierPlace = 0, tourAnnonce = false, mi = false;
    const msg = (t, cls = '') => { const m = $('.cMsg', U); m.innerHTML = t; m.className = 'cMsg vu ' + cls; clearTimeout(m.fin); m.fin = setTimeout(() => { m.className = 'cMsg'; }, 1100); };
    const commenter = t => { const c = $('.cCom', U); c.innerHTML = '🎙️ ' + t; c.classList.add('vu'); tCom = 2.6; dire(t); };
    const sauter = () => {
      const q = C.sauter();
      if (q === 'attends') msg('⏳ Attends le signal !');
      else if (q === 'depart') { msg('🚀 Départ parfait !', 'or'); boing(); }
      else if (q === 'parfait' || q === 'bon') boing();
      else if (q === 'hop') boing();
    };
    const lancerComp = k => { if (C.competence(+k)) { pop(); } };
    $('#cSaut', U).addEventListener('pointerdown', e => { e.preventDefault(); sauter(); });
    $$('.cComp', U).forEach(b => b.addEventListener('pointerdown', e => { e.preventDefault(); lancerComp(b.dataset.k); }));
    const fonce = $('#cFonce', U);
    fonce.addEventListener('pointerdown', e => { e.preventDefault(); C.foncer(true); fonce.classList.add('appuye'); });
    for (const ev of ['pointerup', 'pointerleave', 'pointercancel']) fonce.addEventListener(ev, () => { C.foncer(false); fonce.classList.remove('appuye'); });
    $('#cVite', U).onclick = () => { vitesse = vitesse === 1 ? 2 : 1; $('#cVite', U).classList.toggle('actif', vitesse > 1); pop(); };
    const clavier = e => {
      if (e.repeat && e.code !== 'ShiftLeft') return;
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW' || e.code === 'KeyZ') { e.preventDefault(); sauter(); }
      if (/^Digit[1-3]$/.test(e.code)) lancerComp(+e.code.slice(5) - 1);
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight' || e.code === 'KeyF') { C.foncer(e.type === 'keydown'); fonce.classList.toggle('appuye', e.type === 'keydown'); }
    };
    addEventListener('keydown', clavier); addEventListener('keyup', clavier);
    /* toucher la piste = sauter (pour les plus petits) */
    const toile = document.getElementById('toile');
    const tape = e => { if (e.target === toile) sauter(); };
    addEventListener('pointerdown', tape);

    active = { C, sauter, competence: lancerComp, foncer: C.foncer, accelerer: v => { vitesse = v; }, etat: () => ({ phase: C.phase, t: C.t, place: C.classement().indexOf(C.joueur()) + 1 }),
      /* pour les tests : courir jusqu'à l'arrivée d'un coup (en sautant au bon moment, en lançant les compétences) */
      finirVite: (bien = true) => {
        const R = C.joueur(); let n = 0;
        while (!R.fini && n++ < 30000) {
          if (bien && C.phase === 'course') { const h = C.haies[R.prochaine]; if (h !== undefined && !R.saut && R.chute <= 0) { const tau = (h - R.pos) / Math.max(4, R.v); if (tau < .3 && tau > .16) C.sauter(); } R.competences.forEach((_, k) => C.competence(k)); }
          C.maj(1 / 60);
        }
      } };

    /* ── la caméra : de côté pendant le compte à rebours, puis derrière notre dindie ── */
    const cam = new THREE.Vector3(), vise = new THREE.Vector3(), camV = new THREE.Vector3(), viseV = new THREE.Vector3();
    /* au départ : de face, un peu devant la ligne (on voit les 6 dindies prêtes à partir) */
    const Q0 = P.point(obst.depart, 0), Qv = P.point(obst.depart + 12.5, -1.4);
    cam.set(Qv.x, 2.7, Qv.z); vise.set(Q0.x, .6, Q0.z);
    camera.position.copy(cam); camera.lookAt(vise);
    let tPodium = -1, orbite = 0;
    function majCamera(dt) {
      if (tPodium >= 0) return;
      const X = moi, p = X.m.racine.position, Q = P.point(obst.depart + X.R.pos, couloir(X.k));
      if (C.phase === 'compte' && C.t < -1.2) { camV.set(Qv.x, 2.7, Qv.z); viseV.set(Q0.x, .6, Q0.z); }
      else if (finiJoueuse !== null) { orbite += dt * .7; camV.set(p.x + Math.sin(orbite) * 6, 2.6, p.z + Math.cos(orbite) * 6); viseV.set(p.x, .9, p.z); }
      else {
        const inx = -Q.dz, inz = Q.dx;   /* vers l'intérieur de l'anneau */
        camV.set(p.x - Q.dx * 7.2 + inx * 1.6, 3.4, p.z - Q.dz * 7.2 + inz * 1.6); viseV.set(p.x + Q.dx * 6, .9, p.z + Q.dz * 6);
      }
      const k = Math.min(1, dt * (C.phase === 'compte' ? 2 : 3.2));
      cam.lerp(camV, k); vise.lerp(viseV, k);
      camera.position.copy(cam); camera.lookAt(vise);
    }

    /* ── les évènements de la simulation ── */
    let lu = 0;
    function lireEvenements() {
      for (; lu < C.evenements.length; lu++) {
        const ev = C.evenements[lu], X = ev.r >= 0 ? R3[ev.r] : null, R = X && X.R;
        if (ev.type === 'partez') { sifflet(); bip(880, .45, .1); foule.niveau(.55); L.foule.ferveur(1); commenter('Et c’est parti !'); $('.cCompte', U).innerHTML = '<b class="go">Partez !</b>'; setTimeout(() => { $('.cCompte', U).innerHTML = ''; }, 700); }
        if (ev.type === 'haie') {
          if (ev.q === 'chute' || ev.q === 'tot') {
            X.chuteT = .95; P.choc(obst.depart, ev.h);
            H.particules(new THREE.Vector3(X.m.racine.position.x, .4, X.m.racine.position.z), { n: 14, couleur: '#d6c6a5', taille: .4, vitesse: 3, monte: 1.5, duree: .9 });
            if (R.joueur) { msg(ev.q === 'tot' ? '😮 Trop tôt ! Patatras !' : '💥 Patatras !', 'rouge'); plof(); }
          } else if (R.joueur && ev.q === 'parfait') { msg('✨ Saut parfait !', 'or'); H.particules(new THREE.Vector3(X.m.racine.position.x, 1, X.m.racine.position.z), { n: 18, couleur: '#fde047', taille: .35, vitesse: 3, monte: 2, duree: .9 }); }
          else if (R.joueur) msg('👍 Hop !');
        }
        if (ev.type === 'esquive' && R.joueur) msg('🤸 Esquive !', 'or');
        if (ev.type === 'competence') {
          const Cp = COMPETENCES[ev.id];
          if (R.joueur) { msg(`${Cp.e} ${Cp.nom} !`, 'violet'); whoosh(); }
          else if (Math.abs(R.pos - C.joueur().pos) < 25) commenter(`${R.nom} lance ${Cp.nom} ${Cp.e} !`);
          H.particules(new THREE.Vector3(X.m.racine.position.x, 1, X.m.racine.position.z), { n: 16, couleur: '#c4b5fd', taille: .4, vitesse: 2.5, monte: 2, duree: .8 });
        }
        if (ev.type === 'double' && R.joueur) commenter(`${C.joueur().nom} double ${C.coureurs[ev.qui].nom} !`);
        if (ev.type === 'arrivee') {
          if (R.place === 1) { foule.hourra(); commenter(`${R.nom} gagne la course !`); }
          if (R.joueur) {
            finiJoueuse = C.t; tada(); glouglou(1.1);
            $('.cCompte', U).innerHTML = `<b class="arrivee p${Math.min(4, R.place)}">${R.place <= 3 ? ['🥇', '🥈', '🥉'][R.place - 1] : '🏁'} ${ORD(R.place)} place !</b>`;
            H.particules(new THREE.Vector3(X.m.racine.position.x, 1.5, X.m.racine.position.z), { n: 60, couleur: R.place === 1 ? '#facc15' : '#f472b6', taille: .45, vitesse: 5, monte: 4, duree: 2 });
          }
        }
      }
    }

    /* ── l'interface, à chaque image ── */
    function majUI() {
      const R = C.joueur(), cl = C.classement(), place = cl.indexOf(R) + 1;
      $('.cPlace b', U).textContent = C.phase === 'compte' ? '–' : ORD(R.place || place);
      $('.cDist', U).textContent = `${Math.min(def.distance, Math.round(R.pos))} / ${def.distance} m`;
      $$('.cBarre i', U).forEach(b => { const X = C.coureurs[+b.dataset.i]; b.style.left = (Math.min(1, X.pos / def.distance) * 100) + '%'; });
      $('.cEnergie b', U).style.width = Math.round(R.E / R.Emax * 100) + '%';
      $('.cEnergie b', U).style.background = R.E / R.Emax < .3 ? '#ef4444' : R.fonce ? '#f97316' : '#22c55e';
      $$('.cComp', U).forEach(b => { const k = +b.dataset.k, ok = C.peutLancer(k), rec = R.recharges[k] - C.t, Cp = COMPETENCES[comps[k]]; b.disabled = !ok; b.classList.toggle('prete', ok); b.querySelector('i').style.height = !ok && rec > 0 && Cp.recharge && !R.fini ? Math.min(100, rec / Cp.recharge * 100) + '%' : '0%'; });
      /* l'anneau du saut : il se resserre quand une haie approche (vert = le bon moment) */
      const h = C.haies[R.prochaine], tau = h === undefined || R.fini ? 9 : (h - R.pos) / Math.max(4, R.v), an = $('.cSaut .anneau', U);
      if (tau < 1.4 && !R.saut && R.chute <= 0) { an.style.opacity = 1; an.style.transform = `scale(${1 + Math.max(0, (tau - .26) / 1.14) * 1.25})`; an.classList.toggle('bon', tau >= .12 && tau <= .42); }
      else an.style.opacity = 0;
      if (place !== dernierPlace && C.phase === 'course' && !R.fini) { if (place === 1 && dernierPlace > 1) commenter(`${R.nom} passe en tête !`); dernierPlace = place; }
      if (!tourAnnonce && def.distance > 300 && R.pos > def.distance - 200 && !R.fini) { tourAnnonce = true; commenter('Dernier tour ! 🔔'); bip(1200, .1, .06, 'sine'); setTimeout(() => bip(1200, .1, .06, 'sine'), 160); }
      if (!mi && R.pos > def.distance / 2) { mi = true; const T = cl[0]; if (T !== R) commenter(`${T.nom} mène la course !`); }
    }

    /* ── la boucle ── */
    let compte = COMPTE + 1;
    const stop = H.chaqueImage((dt, t) => {
      const k = vitesse * (active.vitesseTest || 1);
      if (!termine) C.maj(dt * k);
      /* le compte à rebours */
      if (C.phase === 'compte') { const n = Math.ceil(-C.t); if (n !== compte && n >= 1 && n <= COMPTE) { compte = n; bip(520, .14, .1); $('.cCompte', U).innerHTML = `<b>${n}</b>`; } }
      lireEvenements();
      if (tPodium < 0) for (const X of R3) placer(X, dt * Math.min(2, k), t);
      else for (const X of surPodium) X.m.maj(dt, t);
      if (tCom > 0) { tCom -= dt; if (tCom <= 0) $('.cCom', U).classList.remove('vu'); }
      majCamera(dt);
      majUI();
      /* une fois arrivée : les autres finissent (ou on termine d'un coup au bout de 4 s) */
      if (finiJoueuse !== null && !termine && (C.fini || C.t - finiJoueuse > 4)) { if (!C.fini) C.terminer(); termine = true; setTimeout(podium, 900); }
      if (tPodium >= 0) majPodium(dt, t);
    });

    /* ── le podium : les 3 premières sur les marches, et on rend la main pour les résultats ── */
    let surPodium = [];
    function podium() {
      tPodium = 0;
      U.classList.add('fini');
      const pz = L.podium.g.position;
      surPodium = C.ordreArrivee.slice(0, 3).map((R, i) => {
        const X = R3[R.i], [x, h] = PLACES_PODIUM[i];
        X.lab.visible = true; X.m.racine.rotation.set(0, 0, 0);
        X.m.racine.position.set(pz.x + x, h + .02, pz.z + .1); X.m.marcher(0);
        X.m.jouer(i === 0 ? 'roue' : 'glouglou');
        return X;
      });
      for (const X of R3) if (!surPodium.includes(X)) X.m.racine.visible = false;
      const portrait = innerWidth < innerHeight;
      camera.position.set(pz.x, portrait ? 3.6 : 3.2, pz.z + (portrait ? 11.5 : 8.5)); camera.lookAt(pz.x, 1.3, pz.z);
      foule.hourra(); L.foule.ferveur(1);
      H.particules(new THREE.Vector3(pz.x, 3.5, pz.z), { n: 80, couleur: '#facc15', taille: .45, vitesse: 6, monte: 4, duree: 2.4 });
      L.tableau.ecrire('🏁 ' + S.nom.toUpperCase(), C.ordreArrivee.slice(0, 5).map((R, i) => ({ texte: `${i + 1}. ${R.nom} — ${R.temps.toFixed(2)} s`, couleur: R.joueur ? '#fdba74' : '#f8fafc' })));
      /* on regarde le podium un moment (touche l'écran pour passer) avant les résultats */
      let rendu = false;
      const rendre = () => { if (rendu) return; rendu = true; removeEventListener('pointerdown', passer); resoudre({ C, nettoyer }); };
      const passer = () => rendre();
      setTimeout(() => addEventListener('pointerdown', passer), 400);
      setTimeout(rendre, active?.podiumMs ?? 2800);
    }
    let tRoue = 0;
    function majPodium(dt, t) {
      tPodium += dt; tRoue -= dt;
      if (tRoue < 0) { tRoue = 2.2; surPodium.forEach((X, i) => X.m.jouer(i === 0 ? 'roue' : ['glouglou', 'saut'][Math.floor(Math.random() * 2)])); }
      if (Math.random() < dt * 3) H.particules(new THREE.Vector3(L.podium.g.position.x + (Math.random() - .5) * 5, 4, L.podium.g.position.z), { n: 10, couleur: ['#f472b6', '#facc15', '#60a5fa', '#4ade80'][Math.floor(Math.random() * 4)], taille: .35, vitesse: 3, monte: 1, duree: 1.6 });
    }
    function nettoyer() {
      stop(); foule.arreter(); L.foule.ferveur(.1);
      removeEventListener('keydown', clavier); removeEventListener('keyup', clavier); removeEventListener('pointerdown', tape);
      U.remove(); document.body.classList.remove('enCourse');
      for (const X of R3) { X.lab.material.map.dispose(); X.lab.material.dispose(); X.m.liberer(); }
      P.nettoyer(); L.tableau.ecrire('🏁 DINDODROME', ['Le Royaume des Dindies', 'Inscriptions au Bureau des courses']);
      H.cacher(false); H.cadrer(false);
      active = null;
    }
  });
}
/* le portrait d'une coureuse (pour les résultats) */
export const portraitCoureuse = (R, id) => portraitDindie(variante(PAR_ID[R.d.espece], { stade: R.d.stade, chroma: R.d.chroma }), { id });
