/* ══════════ LA SCÈNE DES DÉFILÉS : LES FENÊTRES ET LES DEUX PETITS JEUX ══════════
   Le défilé : choisir sa dindie (sa note s'affiche), un ruban bleu, puis les poses en rythme (toucher la bonne pose
   quand elle arrive dans le cercle), et le jury. Le glouglou : choisir une chanson et une difficulté, puis toucher
   la bonne touche quand la note arrive sur la ligne (la dindie chante avec son cri). */
import { PAR_ID } from '../donnees/especes.js';
import { RARETES } from '../donnees/types.js';
import { CHANSONS, DIFFICULTES } from '../donnees/chansons.js';
import { portraitDindie } from '../dindies/portrait.js';
import { PERSONNAGES, portraitChibi } from '../personnages/chibi.js';
import { fenetre, toast, $, $$, el, echapper } from '../moteur/ui.js';
import { pop, tada, audio, sonActif, glouglou } from '../moteur/sons.js';
import { dire } from '../moteur/voix.js';
import { pauseRendu } from '../moteur/rendu.js';
import * as J from '../jeu/etat.js';
import * as CO from '../jeu/concours.js';
import { nomDe, adnDe } from '../jeu/individus.js';

const E = () => J.etat();
let n = 0;
const portrait = d => portraitDindie(adnDe(d), { id: 'CO' + (n++) });
const JURY = ['plumeline', 'mimi', 'plumeau'];
const POSES = [{ id: 'roue', e: '🦚', nom: 'La roue' }, { id: 'tourne', e: '💃', nom: 'Je tourne' }, { id: 'salut', e: '🙇', nom: 'Le salut' }];
const etoiles = k => '⭐'.repeat(k) + '<i class="eteinte">' + '⭐'.repeat(3 - k) + '</i>';

/* le cri d'une dindie, à la hauteur d'une note (60 = do) : les grosses dindies chantent plus grave */
function chanter(d, h) {
  if (!sonActif()) return;
  const base = 1 / Math.max(.75, Math.min(1.35, PAR_ID[d.espece].adn.taille || 1)) * (d.stade === 'poussin' ? 1.5 : 1);
  glouglou(base * Math.pow(2, (h - 60) / 12) * .9);
}
function bip(f, d = .08, v = .06) { if (!sonActif()) return; try { const A = audio(), t = A.currentTime, o = A.createOscillator(), g = A.createGain(); o.type = 'sine'; o.frequency.value = f; g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(.0005, t + d); o.connect(g); g.connect(A.destination); o.start(t); o.stop(t + d + .02); } catch { /* pas de son */ } }

/* ── la fenêtre de la Scène ── */
export function ouvrirScene({ surChange } = {}) {
  const F = fenetre('🎭 La Scène des défilés', '', { classe: 'sceneF', large: true });
  let onglet = 'defile', choisie = CO.candidates()[0] || null, ruban = false;
  const dessiner = () => {
    const L = CO.candidates(), C = CO.concours();
    if (choisie && !L.includes(choisie)) choisie = L[0] || null;
    let h = `<div class="onglets"><button class="${onglet === 'defile' ? 'actif' : ''}" data-o="defile">💃 Le défilé</button><button class="${onglet === 'glouglou' ? 'actif' : ''}" data-o="glouglou">🎶 Le glouglou</button></div>`;
    if (!L.length) { F.contenu.innerHTML = h + '<p class="vide">Il faut une dindie adulte pour monter sur scène !</p>'; brancher(); return; }
    h += `<div class="rangee choixEnt">${L.map(d => `<button class="carteDindie ${d === choisie ? 'choisie' : ''}" data-uid="${d.uid}" style="--rar:${RARETES[PAR_ID[d.espece].rarete].couleur}"><div class="mini">${portrait(d)}</div><b>${echapper(nomDe(d))}</b><small>niv. ${d.niveau}${d.chroma ? ' ✨' : ''}</small></button>`).join('')}</div>`;
    if (onglet === 'defile') {
      const k = CO.rangActuel(), R = CO.RANGS[k], N = CO.noteDindie(choisie, { ruban });
      h += `<div class="rangs">${CO.RANGS.map((x, i) => `<div class="rang ${i < C.defile.rang ? 'gagne' : i === k ? 'actuel' : ''}"><span>${i < C.defile.rang ? x.e : i === k ? x.e : '🔒'}</span><small>${x.nom}</small></div>`).join('')}</div>
        <p class="petitTexte">${C.defile.rang >= CO.RANGS.length ? '🌟 Tu es une <b>Étoile</b> du défilé ! Tu peux défiler pour le plaisir (et battre ton record).' : `Concours <b>${R.e} ${R.nom}</b> : il faut <b>${R.seuil} points</b> pour gagner.`}${C.defile.meilleur ? ` Ton record : <b>${C.defile.meilleur}</b> points (${echapper(C.defile.meilleureDindie || '')}).` : ''}</p>
        <div class="noteDefile"><b>${echapper(nomDe(choisie))}</b> : ${N.lignes.map(x => `<span>${x.texte} <b>+ ${x.points}</b></span>`).join('')}<span class="pose">🎵 Les poses en rythme <b>+ 0 à ${CO.POSES_MAX}</b></span></div>
        ${J.combien('rubanBleu') ? `<label class="mais"><input type="checkbox" id="sRuban" ${ruban ? 'checked' : ''}> 🎀 Lui mettre un ruban bleu (+ 6 points, tu en as ${J.combien('rubanBleu')})</label>` : '<p class="petitTexte">💡 Un chapeau de son type, une dindie éveillée ou chromatique ✨, et un ruban bleu (chez Mimi) : de quoi impressionner le jury !</p>'}
        <div class="ligneBtn"><button class="btn grand vert" id="sDefiler">🎭 Monter sur scène !</button></div>`;
    } else {
      h += `<p class="petitTexte">${echapper(nomDe(choisie))} va chanter avec son cri ! Touche la bonne touche quand la note arrive sur la ligne. ⭐ ${CO.totalEtoiles()} / ${CO.ETOILES_MAX}</p>
        <div class="chansons">${CHANSONS.map(S => `<div class="chanson"><span class="em">${S.e}</span><b>${S.nom}</b><div class="diffs">${DIFFICULTES.map(D => `<button class="btn petit" data-chanter="${S.id}" data-diff="${D.id}">${D.e} ${D.nom}<small>${etoiles(CO.etoilesChanson(S.id, D.id))}</small></button>`).join('')}</div></div>`).join('')}</div>`;
    }
    F.contenu.innerHTML = h;
    brancher();
    $$('.choixEnt .carteDindie', F.el).forEach(b => b.onclick = () => { pop(); choisie = J.parUid(b.dataset.uid); dessiner(); });
    const rb = $('#sRuban', F.el); if (rb) rb.onchange = () => { ruban = rb.checked; dessiner(); };
    const dv = $('#sDefiler', F.el); if (dv) dv.onclick = async () => {
      pop();
      const poses = await jouerPoses(choisie);
      if (poses === null) { dessiner(); return; }
      const res = CO.finirDefile(choisie, poses, { ruban: ruban && J.combien('rubanBleu') > 0 }); ruban = false;
      await montrerJury(choisie, res);
      surChange && surChange('defile', res); dessiner();
    };
    $$('[data-chanter]', F.el).forEach(b => b.onclick = async () => {
      pop();
      const score = await jouerGlouglou(choisie, b.dataset.chanter, b.dataset.diff);
      if (score === null) { dessiner(); return; }
      const res = CO.finirGlouglou(b.dataset.chanter, b.dataset.diff, score);
      if (res.etoiles) tada();
      toast(`🎶 ${res.etoiles ? etoiles(res.etoiles) : 'Presque !'} ${Math.round(score * 100)} % des notes${res.pieces ? ` · + ${res.pieces} 🪙` : ''}${res.plumesOr ? ' · + 1 🪶 d’or' : ''}`, { duree: 3600, classe: 'grand' });
      surChange && surChange('glouglou', res); dessiner();
    });
  };
  const brancher = () => $$('.onglets button', F.el).forEach(b => b.onclick = () => { pop(); onglet = b.dataset.o; dessiner(); });
  dessiner();
  return F;
}

/* ── le jury ── */
function montrerJury(d, res) {
  return new Promise(resoudre => {
    const F = fenetre(res.gagne ? `${res.gagne.e} Concours ${res.gagne.nom} : gagné !` : res.reussi ? '👏 Bravo !' : '🎭 Le jury a parlé', `<div class="jury">
      <div class="juryDindie">${portrait(d)}</div>
      <div class="juges">${JURY.map((id, i) => `<div class="juge"><div class="jugeP">${portraitChibi(PERSONNAGES[id], 'ju' + id + (n++))}</div><b>${res.juges[i]}</b><small>/ 10</small></div>`).join('')}</div>
      <p class="totalJury"><b>${res.total}</b> points <small>(${res.base.total} pour ${echapper(nomDe(d))}, ${res.poses} pour les poses)</small></p>
      ${res.gagne ? `<p class="badgeGagne">${res.gagne.e} Tu passes au rang <b>${res.gagne.nom}</b> ! + ${res.gagne.recompense.pieces} 🪙${res.gagne.recompense.plumesOr ? ` + ${res.gagne.recompense.plumesOr} 🪶` : ''}</p>`
        : res.reussi ? '<p>Le public applaudit ! 👏</p>' : `<p class="petitTexte">Il fallait ${res.rang.seuil} points. Essaie une dindie plus rare, un chapeau assorti, ou des poses plus justes !</p>`}
      <button class="btn grand vert" id="jOk">Super !</button></div>`, { classe: 'juryF', surFermer: () => resoudre() });
    if (res.reussi) { tada(); glouglou(1.2); }
    dire(`${res.total} points`);
    $('#jOk', F.el).onclick = () => { pop(); F.fermer(); };
  });
}

/* ── le petit jeu des poses ── */
let miniActif = null;
export const concoursActif = () => miniActif;
function coque(titre, d, but) {
  const V = el(`<div id="miniJeu" class="mj-concours"><div class="mjCarte">
    <div class="mjHaut"><div class="mini">${portrait(d)}</div><div><b>${titre}</b><small>${echapper(nomDe(d))} · ${but}</small></div><button class="fermer" aria-label="Arrêter">✖</button></div>
    <div class="mjInfo"><span class="mjTemps"></span><span class="mjScore"></span></div><div class="mjZone"></div><div class="mjBas"></div><p class="mjMsg"></p></div></div>`);
  document.body.appendChild(V); pauseRendu(true); dire(but);
  return V;
}
export function jouerPoses(d) {
  return new Promise(resoudre => {
    const aide = !!E().reglages.aide, NB = 10, ECART = aide ? 1.45 : 1.15, VOYAGE = 2.2, FEN = aide ? 1.5 : 1;
    const V = coque('💃 Les poses en rythme', d, 'Touche la bonne pose quand elle arrive dans le cercle !');
    const zone = $('.mjZone', V);
    zone.innerHTML = `<div class="posesPiste"><div class="posesCible"></div></div><div class="posesDindie">${portrait(d)}</div>`;
    $('.mjBas', V).innerHTML = POSES.map((P, k) => `<button class="btn grand pose" data-k="${k}"><span>${P.e}</span><small>${P.nom}</small></button>`).join('');
    const r = (() => { let s = Date.now() % 9973; return () => (s = (s * 9301 + 49297) % 233280) / 233280; })();
    const suite = Array.from({ length: NB }, (_, i) => ({ k: Math.floor(r() * 3), t: VOYAGE + 1 + i * ECART, fait: false, el: null }));
    const piste = $('.posesPiste', zone);
    for (const S of suite) { S.el = el(`<span class="poseIcone">${POSES[S.k].e}</span>`); piste.appendChild(S.el); }
    let points = 0, t0 = performance.now(), fini = false, raf = 0;
    const msg = t => { $('.mjMsg', V).innerHTML = t; };
    const maj = () => { $('.mjScore', V).textContent = `⭐ ${points} / ${NB * 3}`; };
    const tps = () => (performance.now() - t0) / 1000;
    const terminer = v => { if (fini) return; fini = true; cancelAnimationFrame(raf); miniActif = null; V.remove(); pauseRendu(false); resoudre(v); };
    const taper = k => {
      const t = tps(), S = suite.filter(x => !x.fait && Math.abs(x.t - t) < .6 * FEN).sort((a, b) => Math.abs(a.t - t) - Math.abs(b.t - t))[0];
      const dindie = $('.posesDindie', zone); dindie.className = 'posesDindie ' + POSES[k].id; void dindie.offsetWidth;
      if (!S) { msg('Attends la pose suivante !'); return; }
      S.fait = true; S.el.classList.add('faite');
      const e = Math.abs(S.t - t);
      if (S.k !== k) { msg('😮 Pas cette pose !'); S.el.classList.add('ratee'); }
      else if (e < .18 * FEN) { points += 3; msg('✨ Parfait !'); chanter(d, 67); }
      else if (e < .35 * FEN) { points += 2; msg('👍 Bien !'); chanter(d, 64); }
      else { points += 1; msg('Presque…'); chanter(d, 60); }
      maj();
    };
    $$('.mjBas .pose', V).forEach(b => b.addEventListener('pointerdown', e => { e.preventDefault(); taper(+b.dataset.k); }));
    $('.fermer', V).onclick = () => { pop(); terminer(null); };
    const boucle = () => {
      const t = tps(), W = piste.clientWidth;
      for (const S of suite) { const k = (S.t - t) / VOYAGE; S.el.style.transform = `translateX(${Math.round(W * .12 + k * W * .8)}px)`; S.el.style.opacity = k > 1.05 || k < -.3 ? 0 : 1; if (!S.fait && t - S.t > .6 * FEN) { S.fait = true; S.el.classList.add('ratee'); msg('Oups, raté !'); } }
      if (Math.floor(t / ECART) !== Math.floor((t - .02) / ECART)) bip(440, .05, .03);
      if (t > suite[NB - 1].t + 1) { tada(); setTimeout(() => terminer(points), 700); return; }
      raf = requestAnimationFrame(boucle);
    };
    maj(); raf = requestAnimationFrame(boucle);
    miniActif = { sorte: 'poses', taper, suite: () => suite.map(S => ({ k: S.k, dans: S.t - tps(), fait: S.fait })), points: () => points };
  });
}

/* ── le petit jeu du glouglou : les notes tombent dans 1 à 3 couloirs ── */
export function jouerGlouglou(d, idChanson, idDiff) {
  return new Promise(resoudre => {
    const aide = !!E().reglages.aide, P = CO.partition(idChanson, idDiff), S = CHANSONS.find(c => c.id === idChanson), D = DIFFICULTES.find(x => x.id === idDiff);
    const CHUTE = idDiff === 'difficile' ? 1.6 : 2, FEN = aide ? 1.5 : 1, DEBUT = CHUTE + 1;
    const V = coque(`${S.e} ${S.nom}`, d, `${D.e} ${D.nom} : touche quand la note arrive sur la ligne !`);
    const zone = $('.mjZone', V);
    zone.innerHTML = `<div class="couloirs t${P.touches}">${Array.from({ length: P.touches }, (_, k) => `<div class="couloir" data-k="${k}"></div>`).join('')}<div class="ligneNotes"></div></div>`;
    $('.mjBas', V).innerHTML = Array.from({ length: P.touches }, (_, k) => `<button class="btn grand touche t${k}" data-k="${k}"><span>${['🎵', '🎶', '🎼'][k]}</span><small>${P.touches === 1 ? 'Chante !' : ['Grave', P.touches === 2 ? 'Aigu' : 'Moyen', 'Aigu'][k]}</small></button>`).join('');
    const notes = P.notes.map(x => ({ ...x, t: x.t + DEBUT, fait: false, el: null, pts: 0 }));
    const couloirs = $$('.couloir', zone);
    for (const N of notes) { N.el = el(`<span class="noteG t${N.touche}">●</span>`); couloirs[N.touche].appendChild(N.el); }
    let somme = 0, t0 = performance.now(), fini = false, raf = 0;
    const msg = t => { $('.mjMsg', V).innerHTML = t; };
    const tps = () => (performance.now() - t0) / 1000;
    const maj = () => { $('.mjScore', V).textContent = `🎵 ${Math.round(somme / notes.length * 100)} %`; };
    const terminer = v => { if (fini) return; fini = true; cancelAnimationFrame(raf); miniActif = null; V.remove(); pauseRendu(false); resoudre(v); };
    const taper = k => {
      const t = tps(), N = notes.filter(x => !x.fait && x.touche === k && Math.abs(x.t - t) < .3 * FEN).sort((a, b) => Math.abs(a.t - t) - Math.abs(b.t - t))[0];
      const bt = $(`.touche[data-k="${k}"]`, V); bt.classList.remove('frappe'); void bt.offsetWidth; bt.classList.add('frappe');
      if (!N) return;
      N.fait = true; const e = Math.abs(N.t - t);
      N.pts = e < .12 * FEN ? 1 : .6; somme += N.pts; N.el.classList.add(N.pts === 1 ? 'parfaite' : 'bonne');
      chanter(d, N.h); msg(N.pts === 1 ? '✨ Parfait !' : '👍'); maj();
    };
    $$('.mjBas .touche', V).forEach(b => b.addEventListener('pointerdown', e => { e.preventDefault(); taper(+b.dataset.k); }));
    couloirs.forEach(c => c.addEventListener('pointerdown', e => { e.preventDefault(); taper(+c.dataset.k); }));
    $('.fermer', V).onclick = () => { pop(); terminer(null); };
    const boucle = () => {
      const t = tps(), H = couloirs[0].clientHeight;
      for (const N of notes) {
        const k = (N.t - t) / CHUTE;
        N.el.style.transform = `translateY(${Math.round((1 - k) * H * .86)}px)`; N.el.style.opacity = k > 1.05 || (N.fait && k < -.05) ? 0 : 1;
        if (!N.fait && t - N.t > .3 * FEN) { N.fait = true; N.el.classList.add('ratee'); }
      }
      $('.mjTemps', V).textContent = t < DEBUT ? `⏳ ${Math.ceil(DEBUT - CHUTE - t) > 0 ? Math.ceil(DEBUT - CHUTE - t) : '🎵'}` : '';
      if (t > notes[notes.length - 1].t + 1.2) { setTimeout(() => terminer(somme / notes.length), 500); return; }
      raf = requestAnimationFrame(boucle);
    };
    maj(); raf = requestAnimationFrame(boucle);
    miniActif = { sorte: 'glouglou', taper, notes: () => notes.map(N => ({ touche: N.touche, dans: N.t - tps(), fait: N.fait })), score: () => somme / notes.length };
  });
}
