/* ══════════ LE TERRAIN D'ENTRAÎNEMENT DE COACH GINETTE ══════════
   Trois petits jeux, un par stat (des points d'entraînement : 15 au plus par stat, et de l'expérience) :
   ⚡ le sprint des petits pas (taper à gauche, à droite, le plus vite possible),
   💪 le souffle régulier (taper quand la bulle touche l'anneau),
   🦘 les haies de Ginette (sauter au bon moment).
   Et les leçons : apprendre une nouvelle compétence de course. */
import { PAR_ID } from '../donnees/especes.js';
import { RARETES } from '../donnees/types.js';
import { COMPETENCES, ENSEIGNEES, competenceInnee, competencesDe, placesCompetences } from '../donnees/courses.js';
import { variante } from '../dindies/adn.js';
import { portraitDindie } from '../dindies/portrait.js';
import { fenetre, toast, $, $$, el, echapper, barre } from '../moteur/ui.js';
import { pop, tada, glouglou, audio, sonActif } from '../moteur/sons.js';
import { dire } from '../moteur/voix.js';
import * as J from '../jeu/etat.js';
import * as DD from '../jeu/dindodrome.js';
import * as EL from '../jeu/elevage.js';
import { nomDe, stats } from '../jeu/individus.js';
import * as S from '../jeu/scenario.js';
import { niveauToast } from './panneaux.js';
import { pauseRendu } from '../moteur/rendu.js';
import { coureusesPossibles } from './dindodrome.js';

const E = () => J.etat();
let n = 0;
const portrait = d => portraitDindie(variante(PAR_ID[d.espece], { stade: d.stade, chroma: d.chroma }), { id: 'EN' + (n++) });
export const JEUX = [
  { stat: 0, id: 'sprint', e: '⚡', nom: 'Le sprint des petits pas', but: 'Tape à gauche, puis à droite, puis à gauche… le plus vite possible !' },
  { stat: 1, id: 'souffle', e: '💪', nom: 'Le souffle régulier', but: 'Tape quand la bulle touche l’anneau. Respire avec ta dindie !' },
  { stat: 2, id: 'haies', e: '🦘', nom: 'Les haies de Ginette', but: 'Tape pour sauter au-dessus des haies !' }
];
const bip = (f, d = .08, v = .07) => { if (!sonActif()) return; try { const A = audio(), t = A.currentTime, o = A.createOscillator(), g = A.createGain(); o.type = 'sine'; o.frequency.value = f; g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(.0005, t + d); o.connect(g); g.connect(A.destination); o.start(t); o.stop(t + d + .02); } catch { /* pas de son */ } };

/* ── la fenêtre du coach : entraîner, ou apprendre une compétence ── */
export function ouvrirEntrainement({ surChange } = {}) {
  const F = fenetre('🏋️ Le terrain d’entraînement', '', { classe: 'entrainementF', large: true });
  let onglet = 'entrainer', choisie = coureusesPossibles()[0] || null;
  const dessiner = () => {
    const L = coureusesPossibles();
    if (choisie && !L.includes(choisie)) choisie = L[0] || null;
    let h = `<div class="onglets"><button class="${onglet === 'entrainer' ? 'actif' : ''}" data-o="entrainer">🏋️ S’entraîner</button><button class="${onglet === 'lecons' ? 'actif' : ''}" data-o="lecons">📚 Les leçons</button></div>`;
    if (!L.length) { F.contenu.innerHTML = h + '<p class="vide">Il te faut une dindie adulte dans ton équipe 🎒 pour s’entraîner !</p>'; brancherOnglets(); return; }
    h += `<div class="rangee choixEnt">${L.map(d => `<button class="carteDindie ${d === choisie ? 'choisie' : ''}" data-uid="${d.uid}" style="--rar:${RARETES[PAR_ID[d.espece].rarete].couleur}"><div class="mini">${portrait(d)}</div><b>${echapper(nomDe(d))}</b><small>Niv. ${d.niveau}</small></button>`).join('')}</div>`;
    const d = choisie, st = stats(d), en = d.entrainement || [0, 0, 0];
    if (onglet === 'entrainer') {
      h += `<p class="petitTexte">Chaque entraînement donne <b>1 à 3 points</b> dans une stat (15 au plus) et de l’expérience.${J.combien('graineMais') ? ' 🌽 Un <b>maïs doré</b> donne 1 point de plus !' : ''}</p>
        <div class="jeuxEnt">${JEUX.map(Jx => `<div class="jeuEnt"><span class="em">${Jx.e}</span><div><b>${Jx.nom}</b><small>${Jx.but}</small>
          <div class="entBarre">${barre(en[Jx.stat] / DD.MAX_ENTRAINEMENT, ['#f59e0b', '#ef4444', '#22c55e'][Jx.stat])}<small>${en[Jx.stat]} / ${DD.MAX_ENTRAINEMENT} · stat ${st[Jx.stat]}</small></div></div>
          <button class="btn vert" data-jeu="${Jx.stat}" ${en[Jx.stat] >= DD.MAX_ENTRAINEMENT ? 'disabled' : ''}>${en[Jx.stat] >= DD.MAX_ENTRAINEMENT ? '✅ Au max' : '▶ Jouer'}</button></div>`).join('')}</div>
        ${J.combien('graineMais') ? `<label class="mais"><input type="checkbox" id="eMais"> 🌽 Donner un maïs doré avant (tu en as ${J.combien('graineMais')})</label>` : ''}`;
    } else {
      const comps = competencesDe(d), err = DD.peutApprendre(d), prix = DD.prixLecon();
      h += `<p class="petitTexte">${echapper(nomDe(d))} connaît : ${comps.map(id => `<b>${COMPETENCES[id].e} ${COMPETENCES[id].nom}</b>${id === competenceInnee(d.espece) ? ' <small>(de naissance)</small>' : ''}`).join(', ')}. Places : ${comps.length} / ${placesCompetences(d)}${d.stade !== 'eveille' ? ' (une dindie éveillée en a 3)' : ''}.</p>
        <p class="petitTexte">${prix ? `Une leçon coûte <b>${prix} 🪙</b> (tu as ${E().pieces} 🪙).` : '🎁 Ta <b>première leçon est offerte</b> par Coach Ginette !'}</p>
        ${err ? `<p class="infoCouple pale">${err}</p>${(d.competences || []).length ? `<div class="ligneBtn">${d.competences.map(id => `<button class="btn petit" data-oublie="${id}">🗑️ Oublier ${COMPETENCES[id].e} ${COMPETENCES[id].nom}</button>`).join('')}</div>` : ''}` : ''}
        <div class="lecons">${ENSEIGNEES.map(id => { const C = COMPETENCES[id], deja = comps.includes(id) || competenceInnee(d.espece) === id; return `<div class="lecon ${deja ? 'deja' : ''}"><span class="em">${C.e}</span><div><b>${C.nom}</b><small>${C.desc}${C.recharge ? ` · recharge ${C.recharge} s` : ' · une fois par course'}</small></div>
          <button class="btn petit ${deja ? '' : 'vert'}" data-apprendre="${id}" ${deja || err ? 'disabled' : ''}>${deja ? '✅ Connue' : prix ? `${prix} 🪙` : '🎁 Apprendre'}</button></div>`; }).join('')}</div>`;
    }
    F.contenu.innerHTML = h;
    brancherOnglets();
    $$('.choixEnt .carteDindie', F.el).forEach(b => b.onclick = () => { pop(); choisie = J.parUid(b.dataset.uid); dessiner(); });
    $$('[data-jeu]', F.el).forEach(b => b.onclick = async () => {
      pop();
      const mais = $('#eMais', F.el)?.checked && J.retirerObjet('graineMais');
      const stat = +b.dataset.jeu, score = await jouerMiniJeu(JEUX[stat], choisie);
      if (score === null) { if (mais) J.ajouterObjet('graineMais'); dessiner(); return; }
      const pts = score + (mais ? 1 : 0), gagne = DD.entrainer(choisie, stat, pts), niv = EL.donnerXp(choisie, 20 + 30 * pts);
      tada(); glouglou(1.15);
      toast(`${JEUX[stat].e} + ${gagne} point${gagne > 1 ? 's' : ''} d’entraînement pour ${echapper(nomDe(choisie))} (${choisie.entrainement[stat]}/${DD.MAX_ENTRAINEMENT}) · + ${20 + 30 * pts} XP`, { duree: 3400, classe: 'grand', cle: 'entr' });
      if (niv) niveauToast(choisie, niv);
      S.evenement('entrainement', { stat, d: choisie });
      surChange && surChange(); dessiner();
    });
    $$('[data-apprendre]', F.el).forEach(b => b.onclick = () => {
      const err = DD.apprendre(choisie, b.dataset.apprendre);
      if (err) { toast('⚠️ ' + err); return; }
      const C = COMPETENCES[b.dataset.apprendre]; tada();
      toast(`📚 ${echapper(nomDe(choisie))} apprend <b>${C.e} ${C.nom}</b> !`, { duree: 3200, classe: 'grand' });
      S.evenement('lecon', { id: b.dataset.apprendre, d: choisie }); dessiner();
    });
    $$('[data-oublie]', F.el).forEach(b => b.onclick = () => { if (!confirm(`Oublier ${COMPETENCES[b.dataset.oublie].nom} ? (Tu pourras la réapprendre plus tard.)`)) return; DD.oublier(choisie, b.dataset.oublie); pop(); dessiner(); });
  };
  const brancherOnglets = () => $$('.onglets button', F.el).forEach(b => b.onclick = () => { pop(); onglet = b.dataset.o; dessiner(); });
  dessiner();
  return F;
}

/* ── un mini-jeu : renvoie le score (1 à 3) ou null si on abandonne ── */
let miniActif = null;
export const miniJeuActif = () => miniActif;
export function jouerMiniJeu(Jx, d) {
  return new Promise(resoudre => {
    const aide = !!E().reglages.aide;
    const V = el(`<div id="miniJeu" class="mj-${Jx.id}"><div class="mjCarte">
      <div class="mjHaut"><div class="mini">${portrait(d)}</div><div><b>${Jx.e} ${Jx.nom}</b><small>${echapper(nomDe(d))} · ${Jx.but}</small></div><button class="fermer" aria-label="Arrêter">✖</button></div>
      <div class="mjInfo"><span class="mjTemps"></span><span class="mjScore"></span></div>
      <div class="mjZone"></div><div class="mjBas"></div><p class="mjMsg"></p></div></div>`);
    document.body.appendChild(V);
    pauseRendu(true);
    dire(Jx.but);
    let fini = false, arret = null;
    const finir = score => {
      if (fini) return; fini = true; arret && arret(); miniActif = null;
      if (score === null) { V.remove(); pauseRendu(false); resoudre(null); return; }
      const etoiles = '⭐'.repeat(score) + '<i class="eteinte">' + '⭐'.repeat(3 - score) + '</i>';
      $('.mjZone', V).innerHTML = `<div class="mjFin"><p class="grosEmoji">${score === 3 ? '🏆' : score === 2 ? '🎉' : '👍'}</p><p class="mjEtoiles">${etoiles}</p><p><b>${['', 'Pas mal !', 'Bravo !', 'Incroyable !'][score]}</b> ${score} point${score > 1 ? 's' : ''} d’entraînement.</p></div>`;
      $('.mjBas', V).innerHTML = '<button class="btn grand vert" id="mjOk">✅ Super !</button>';
      $('#mjOk', V).onclick = () => { pop(); V.remove(); pauseRendu(false); resoudre(score); };
      if (score >= 2) tada();
    };
    $('.fermer', V).onclick = () => { pop(); finir(null); };
    const zone = $('.mjZone', V), bas = $('.mjBas', V), msg = t => { $('.mjMsg', V).innerHTML = t; };
    const temps = t => { $('.mjTemps', V).textContent = t; }, score = t => { $('.mjScore', V).textContent = t; };
    /* un petit compte à rebours avant de commencer */
    let depart = 3;
    const go = f => { zone.classList.add('pret'); msg(`<b>${depart}</b>`); const it = setInterval(() => { depart--; bip(500); if (depart <= 0) { clearInterval(it); msg('<b>C’est parti !</b>'); bip(900, .2); setTimeout(() => msg(''), 700); f(); } else msg(`<b>${depart}</b>`); }, 650); bip(500); };
    const boucle = f => { let t0 = performance.now(), ok = true; const tic = now => { if (!ok) return; f((now - t0) / 1000); requestAnimationFrame(tic); }; requestAnimationFrame(tic); arret = () => { ok = false; }; };

    if (Jx.id === 'sprint') {
      const DUREE = 8, seuils = aide ? [16, 26] : [22, 34];
      zone.innerHTML = '<div class="mjPiste"><div class="mjArrivee">🏁</div><div class="mjCoureuse">' + portrait(d) + '</div></div>';
      bas.innerHTML = '<button class="btn grand mjPied" data-p="g">👣<small>Gauche</small></button><button class="btn grand mjPied" data-p="d">👣<small>Droite</small></button>';
      let pas = 0, dernier = null, enCours = false;
      const taper = p => {
        if (!enCours) return;
        if (p === dernier) { msg('Oups ! Alterne gauche et droite 😉'); $('.mjCoureuse', V).classList.add('glisse'); setTimeout(() => $('.mjCoureuse', V)?.classList.remove('glisse'), 200); return; }
        dernier = p; pas++; bip(440 + (pas % 8) * 40, .05, .04); score(`👣 ${pas}`);
        $('.mjCoureuse', V).style.left = Math.min(88, pas / (seuils[1] + 4) * 88) + '%';
      };
      $$('.mjPied', V).forEach(b => b.addEventListener('pointerdown', e => { e.preventDefault(); taper(b.dataset.p); }));
      const touche = e => { if (['ArrowLeft', 'KeyA', 'KeyQ'].includes(e.code)) taper('g'); if (['ArrowRight', 'KeyD'].includes(e.code)) taper('d'); };
      addEventListener('keydown', touche);
      score('👣 0'); temps(`⏱️ ${DUREE} s`);
      miniActif = { taper, sorte: 'sprint' };
      go(() => {
        enCours = true;
        boucle(t => {
          temps(`⏱️ ${Math.max(0, DUREE - t).toFixed(1)} s`);
          if (t >= DUREE && !fini) { enCours = false; removeEventListener('keydown', touche); finir(pas >= seuils[1] ? 3 : pas >= seuils[0] ? 2 : 1); }
        });
      });
    }

    if (Jx.id === 'souffle') {
      const N = 12, seuils = aide ? [5, 8] : [7, 10], fenetreOk = aide ? .13 : .09;
      zone.innerHTML = '<div class="mjSouffle"><div class="mjAnneau"></div><div class="mjBulle">' + portrait(d) + '</div></div>';
      bas.innerHTML = '<button class="btn grand vert mjTape">🫧 Maintenant !</button>';
      let bons = 0, souffle = -1, tente = false, enCours = false, phase = 0, tPrec = 0, periode = 1.7;
      const taper = () => {
        if (!enCours || tente) return;
        tente = true;
        if (Math.abs(phase - .5) < fenetreOk) { bons++; bip(700 + bons * 30, .1); msg('✨ Parfait !'); $('.mjAnneau', V).classList.add('ok'); setTimeout(() => $('.mjAnneau', V)?.classList.remove('ok'), 250); }
        else { msg(phase < .5 ? 'Un peu trop tôt…' : 'Un peu trop tard…'); bip(220, .1, .05); }
        score(`🫧 ${bons} / ${N}`);
      };
      $('.mjTape', V).addEventListener('pointerdown', e => { e.preventDefault(); taper(); });
      const touche = e => { if (e.code === 'Space' || e.code === 'Enter') { e.preventDefault(); taper(); } };
      addEventListener('keydown', touche);
      score(`🫧 0 / ${N}`); temps(`🫧 ${N} souffles`);
      miniActif = { taper, sorte: 'souffle', phase: () => phase, tente: () => tente };
      go(() => {
        enCours = true;
        boucle(t => {
          phase += (t - tPrec) / periode; tPrec = t;
          if (phase >= 1) { phase -= 1; souffle++; tente = false; periode = Math.max(1.05, periode - .05); if (souffle >= N - 1) { enCours = false; removeEventListener('keydown', touche); finir(bons >= seuils[1] ? 3 : bons >= seuils[0] ? 2 : 1); return; } }
          const k = Math.sin(Math.PI * phase);
          const b = $('.mjBulle', V); if (b) b.style.transform = `translate(-50%,-50%) scale(${.42 + .58 * k * k})`;
          temps(`🫧 souffle ${Math.max(1, souffle + 2)} / ${N}`);
        });
      });
    }

    if (Jx.id === 'haies') {
      const N = 12, seuils = aide ? [6, 9] : [8, 11];
      zone.innerHTML = '<canvas class="mjToile" width="640" height="260"></canvas>';
      bas.innerHTML = '<button class="btn grand vert mjSaute">🦘 Saute !</button>';
      const cv = $('.mjToile', V), x = cv.getContext('2d');
      const img = new Image(); img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(portrait(d));
      const SOL = 214, X0 = 110, G = 2400;
      let y = 0, vy = 0, haies = [], passees = 0, ratees = 0, vitesse = 260, enCours = false, tPrec = 0, choc = 0, prochaine = .8;
      const sauter = () => { if (!enCours) return; if (y === 0) { vy = aide ? 820 : 760; bip(600, .08, .05); } };
      $('.mjSaute', V).addEventListener('pointerdown', e => { e.preventDefault(); sauter(); });
      cv.addEventListener('pointerdown', e => { e.preventDefault(); sauter(); });
      const touche = e => { if (e.code === 'Space' || e.code === 'ArrowUp') { e.preventDefault(); sauter(); } };
      addEventListener('keydown', touche);
      score(`🦘 0 / ${N}`); temps(`🦘 ${N} haies`);
      miniActif = { taper: sauter, sorte: 'haies', prochaine: () => { const H = haies.find(h => !h.passee); return H ? (H.x - X0) / vitesse : 9; } };
      const dessiner = () => {
        x.clearRect(0, 0, 640, 260);
        x.fillStyle = '#bae6fd'; x.fillRect(0, 0, 640, 260);
        x.fillStyle = '#86cf63'; x.fillRect(0, SOL, 640, 46);
        x.fillStyle = '#c8553d'; x.fillRect(0, SOL - 6, 640, 10);
        for (const h of haies) { x.fillStyle = '#f8fafc'; x.fillRect(h.x - 3, SOL - 46, 6, 46); x.fillRect(h.x + 25, SOL - 46, 6, 46); for (let k = 0; k < 4; k++) { x.fillStyle = k % 2 ? '#ef4444' : '#ffffff'; x.fillRect(h.x - 3 + k * 8.5, SOL - 48, 8.5, 9); } }
        x.save(); x.translate(X0, SOL - 36 - y); if (choc > 0) x.rotate(Math.sin(choc * 30) * .3);
        if (img.complete) x.drawImage(img, -36, -36, 72, 72); x.restore();
      };
      go(() => {
        enCours = true;
        boucle(t => {
          const dt = Math.min(.05, t - tPrec); tPrec = t;
          prochaine -= dt; if (prochaine <= 0 && passees + ratees + haies.length < N) { haies.push({ x: 680, passee: false }); prochaine = 1.05 + Math.random() * .7 - Math.min(.35, (passees + ratees) * .03); }
          vitesse = 260 + (passees + ratees) * 9;
          for (const h of haies) h.x -= vitesse * dt;
          if (y > 0 || vy > 0) { vy -= G * dt; y = Math.max(0, y + vy * dt); if (y === 0) vy = 0; }
          choc = Math.max(0, choc - dt);
          for (const h of haies) if (!h.passee && h.x < X0 + 14 && h.x > X0 - 40) {
            if (y < 40) { h.passee = true; ratees++; choc = .4; msg('💥 Patatras !'); bip(160, .15, .06); }
            else if (h.x < X0 - 20) { h.passee = true; passees++; msg('✨ Hop !'); bip(800, .08); }
          }
          haies = haies.filter(h => h.x > -40);
          score(`🦘 ${passees} / ${N}`);
          dessiner();
          if (passees + ratees >= N && !haies.some(h => !h.passee) && !fini) { enCours = false; removeEventListener('keydown', touche); finir(passees >= seuils[1] ? 3 : passees >= seuils[0] ? 2 : 1); }
        });
      });
      dessiner();
    }
  });
}
