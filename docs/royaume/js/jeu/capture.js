/* ══════════ ATTRAPER UNE DINDIE SAUVAGE ══════════
   1. Les friandises font monter la confiance (deux fois plus avec sa friandise préférée).
   2. Le filet : un cercle blanc rétrécit ; il faut lancer quand il passe dans la zone verte.
      La zone verte est plus grande si la confiance est haute, si le filet est solide ou doré, en mode aide ;
      plus petite pour une rare, encore plus pour une épique.
   3. Raté : la dindie fait un bond et perd un peu confiance. 3 ratés : elle s'enfuit.
   lancerCapture(s, hooks) → Promise('attrapee' | 'enfuie' | 'partie') */
import * as THREE from 'three';
import { PAR_ID } from '../donnees/especes.js';
import { RARETES, TYPES } from '../donnees/types.js';
import { variante } from '../dindies/adn.js';
import { portraitDindie } from '../dindies/portrait.js';
import { el, $, $$, toast, barre, fenetre, echapper } from '../moteur/ui.js';
import { pop, tada, glouglou, audio, sonActif } from '../moteur/sons.js';
import { dire } from '../moteur/voix.js';
import { toon, contour } from '../moteur/materiaux.js';
import * as J from './etat.js';
import { OBJETS, friandisePreferee, meilleurFilet } from './objets.js';
import { nouvelleDindie, nomDe, NOMS_RIGOLOS } from './individus.js';

const PASTILLE = { commune: '⚪', rare: '🔵', epique: '🟣', mythique: '🌈' };
const K_RARETE = { commune: 1, rare: .8, epique: .62, mythique: .5 }, GAIN_RARETE = { commune: 1, rare: .8, epique: .62, mythique: .5 }, VITESSE = { commune: 1, rare: 1.08, epique: 1.17, mythique: 1.25 };
let active = null;
export const captureActive = () => active;

export function lancerCapture(s, H) {
  return new Promise(resoudre => {
    const esp = PAR_ID[s.espece], R = RARETES[esp.rarete], e = J.etat(), aide = !!e.reglages.aide;
    const pref = friandisePreferee(esp.types[0]);
    let confiance = 0, essais = 3, phase = 'friandises', rayon = 3, fini = false;
    s.etat = 'capture';
    H.cadrer(true, s);
    const q = s.m.racine.position;
    /* les anneaux au sol : la zone verte et le cercle qui rétrécit */
    const groupe = new THREE.Group(); groupe.position.set(q.x, (H.lieu.sol(q.x, q.z) || 0) + .06, q.z); H.lieu.racine.add(groupe);
    const matV = new THREE.MeshBasicMaterial({ color: '#22c55e', transparent: true, opacity: .55, depthWrite: false, side: THREE.DoubleSide });
    const matB = new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: .95, depthWrite: false, side: THREE.DoubleSide });
    const vert = new THREE.Mesh(new THREE.RingGeometry(1, 1.01, 48), matV); vert.rotation.x = -Math.PI / 2; groupe.add(vert);
    const cercle = new THREE.Mesh(new THREE.RingGeometry(.94, 1, 48), matB); cercle.rotation.x = -Math.PI / 2; groupe.add(cercle);
    groupe.visible = false;
    const centre = 1.2;
    const demiLargeur = () => Math.min(.8, .34 * K_RARETE[esp.rarete] * (OBJETS[meilleurFilet(J.etat().inventaire) || 'filet'].filet || 1) * (aide ? 1.5 : 1) * (.45 + .75 * confiance));
    const majZone = () => { const w = demiLargeur(); vert.geometry.dispose(); vert.geometry = new THREE.RingGeometry(Math.max(.2, centre - w), centre + w, 48); };

    /* l'interface */
    const vue = J.etat().livre.attrapes[s.espece];
    const U = el(`<div id="capture"><div class="capCarte" style="--rar:${R.couleur}">
        <div class="capPortrait">${portraitDindie(variante(esp, { chroma: s.chroma }), { id: 'cap' + s.id })}</div>
        <div><b>${esp.nom}${s.chroma ? ' ✨' : ''}</b><small><span class="pill rar">${PASTILLE[esp.rarete]} ${R.nom}</span> ${esp.types.map(t => TYPES[t].e).join('')} · niv. ${s.niveau}${vue ? ' · ✅ déjà dans ton Livre' : ''}</small>
        <div class="capJauge"><span>💗</span><div class="barreP"><b></b></div><em>0 %</em></div><div class="capEssais"></div></div></div>
      <p class="capConseil"></p><div class="capBas"></div></div>`);
    document.body.appendChild(U); document.body.classList.add('enCapture');
    active = { action: () => actionPrincipale(), etat: () => ({ phase, dans: phase === 'visee' && Math.abs(rayon - centre) <= demiLargeur(), confiance, essais, occupe, espece: s.espece }) };
    const conseil = t => { $('.capConseil', U).innerHTML = t; };
    const majJauge = () => {
      $('.capJauge b', U).style.width = Math.round(confiance * 100) + '%';
      $('.capJauge b', U).style.background = confiance >= .99 ? '#22c55e' : confiance > .5 ? '#84cc16' : '#f472b6';
      $('.capJauge em', U).textContent = Math.round(confiance * 100) + ' %';
      $('.capEssais', U).innerHTML = '🥅'.repeat(essais) + '<i class="eteinte">' + '🥅'.repeat(3 - essais) + '</i>';
    };
    const friandises = () => Object.keys(OBJETS).filter(id => (id === 'friandise' || id === 'superFriandise' || OBJETS[id].prefere) && J.combien(id) > 0);
    function boutons() {
      if (phase === 'visee') { $('.capBas', U).innerHTML = '<button class="btn grand vert" id="cLancer">🥅 MAINTENANT !</button>'; $('#cLancer', U).onclick = lancer; return; }
      const fr = friandises();
      $('.capBas', U).innerHTML = `<div class="capFriandises">${fr.map(id => `<button class="btn friand ${id === pref ? 'pref' : ''}" data-id="${id}">${OBJETS[id].e}<small>${J.combien(id)}</small>${id === pref ? '<i>❤️</i>' : ''}</button>`).join('')}
        <button class="btn friand" data-id="doux">🤲<small>doux</small></button></div>
        <div class="capActions"><button class="btn vert grand" id="cFilet">🥅 Lancer le filet</button><button class="btn petit" id="cPartir">🏃 Partir</button></div>`;
      $$('.friand', U).forEach(b => b.onclick = () => donner(b.dataset.id));
      $('#cFilet', U).onclick = viser; $('#cPartir', U).onclick = () => terminer('partie');
    }
    majJauge(); boutons();
    conseil(confiance < .3 ? `Donne-lui des friandises pour gagner sa confiance${pref ? ` (sa préférée : ${OBJETS[pref].e} ${OBJETS[pref].nom})` : ''}. Plus elle a confiance, plus la zone verte sera grande !` : '');
    dire(`${esp.nom} ! Donne-lui des friandises, puis lance le filet.`);
    glouglou(1 + Math.random() * .2); s.m.jouer('glouglou');

    let occupe = false;
    async function donner(id) {
      if (occupe || fini) return;
      if (id !== 'doux' && !J.retirerObjet(id)) return;
      occupe = true; U.classList.add('attente');
      const k = id === 'doux' ? .12 : id === pref ? .68 : id === 'superFriandise' ? .6 : OBJETS[id].prefere ? .24 : .34;
      await H.lancerObjet(id === 'doux' ? null : OBJETS[id].e, s);
      s.m.jouer(id === 'doux' ? 'glouglou' : 'picore');
      H.coeurs(s, id === pref ? 14 : 8);
      confiance = Math.min(1, confiance + k * GAIN_RARETE[esp.rarete] * (aide ? 1.25 : 1));
      if (id === pref) toast(`❤️ ${OBJETS[id].nom} : sa friandise préférée !`);
      pop(); majJauge(); boutons();
      conseil(confiance >= 1 ? '💚 Elle a toute confiance en toi ! Lance le filet !' : confiance > .5 ? 'Elle te fait confiance. Encore une friandise, ou tente le filet !' : 'Encore un peu…');
      occupe = false; U.classList.remove('attente');
    }
    function viser() {
      if (occupe || fini) return;
      phase = 'visee'; rayon = 3.1; majZone(); groupe.visible = true; boutons();
      conseil('Lance quand le cercle blanc est dans la zone verte !');
    }
    async function lancer() {
      if (phase !== 'visee' || occupe || fini) return;
      occupe = true; phase = 'vol';
      const w = demiLargeur(), r0 = rayon, ok = Math.abs(r0 - centre) <= w;
      $('.capBas', U).innerHTML = '';
      groupe.visible = false;
      const pris = await H.lancerFilet(s, ok);
      if (pris) { terminer('attrapee'); return; }
      essais--; confiance *= .7; majJauge();
      s.m.jouer('saut');
      if (essais <= 0) { toast(`💨 ${esp.nom} s’est enfuie ! Elle reviendra plus tard.`, { duree: 3200 }); H.sauvages.faireFuir(s); terminer('enfuie'); return; }
      conseil(r0 > centre + w ? 'Trop tôt ! Attends que le cercle soit plus petit.' : 'Trop tard ! Lance un peu plus tôt.');
      phase = 'friandises'; occupe = false; boutons();
    }
    function actionPrincipale() { if (phase === 'visee') lancer(); else if (phase === 'friandises') viser(); }
    /* le cercle rétrécit puis recommence (de plus en plus vite pour les plus rares) */
    const arret = H.chaqueImage(dt => {
      if (phase !== 'visee') return;
      rayon -= dt * 1.2 * VITESSE[esp.rarete];
      if (rayon < .35) rayon = 3.1;
      cercle.scale.setScalar(rayon);
      const dans = Math.abs(rayon - centre) <= demiLargeur();
      matB.color.set(dans ? '#facc15' : '#ffffff');
    });
    function terminer(resultat) {
      if (fini) return; fini = true; active = null;
      arret(); U.remove(); document.body.classList.remove('enCapture'); groupe.parent && groupe.parent.remove(groupe);
      vert.geometry.dispose(); cercle.geometry.dispose(); matV.dispose(); matB.dispose();
      H.cadrer(false, s);
      if (resultat === 'attrapee') {
        const d = attraper(s, H.lieu.id);
        H.sauvages.retirer(s);
        resoudre({ resultat, dindie: d });
        return;
      }
      if (resultat === 'partie' && s.etat === 'capture') s.etat = 'erre';
      resoudre({ resultat });
    }
  });
}

/* la dindie rejoint l'exploratrice : talents, prime du Grand Livre, et sa carte */
function attraper(s, region) {
  const esp = PAR_ID[s.espece], nouvelle = !J.etat().livre.attrapes[s.espece];
  const base = { commune: 0, rare: 1, epique: 2, mythique: 3 }[esp.rarete];
  const d = J.ajouterDindie(nouvelleDindie(s.espece, { niveau: s.niveau, chroma: s.chroma, origine: 'sauvage:' + region, talents: [0, 1, 2].map(() => Math.min(5, base + Math.floor(Math.random() * 3))) }));
  if (nouvelle) J.gagnerPieces(50);
  tada();
  const F = fenetre('🎉 Attrapée !', `<div class="carteCapture" style="--rar:${RARETES[esp.rarete].couleur}">
    <div class="grandPortrait">${portraitDindie(variante(esp, { chroma: s.chroma }), { id: 'att' + s.id })}</div>
    <p class="nomEsp">${esp.nom}${s.chroma ? ' ✨ <b>chromatique !</b>' : ''}</p>
    <p><span class="pill rar">${PASTILLE[esp.rarete]} ${RARETES[esp.rarete].nom}</span> ${esp.types.map(t => `<span class="pill">${TYPES[t].e} ${TYPES[t].nom}</span>`).join(' ')} <span class="pill">Niv. ${d.niveau}</span></p>
    <p class="cri">« ${esp.cri} »</p>
    ${nouvelle ? '<p class="bourse">📖 Nouvelle page du Grand Livre ! <b>+ 50 🪙</b> (la prime du Professeur)</p>' : ''}
    <p class="petitTexte">${d.lieu === 'equipe' ? '🎒 Elle rejoint ton équipe.' : '🐾 Ton équipe est pleine : elle part au Clapier.'}</p>
    <div class="renommer"><input id="aNom" maxlength="14" placeholder="${echapper(esp.nom)}"><button class="btn jaune" id="aDe">🎲</button></div>
    <button class="btn grand vert" id="aOk">✅ Super !</button></div>`, { classe: 'captureF' });
  const i = $('#aNom', F.el);
  $('#aDe', F.el).onclick = () => { pop(); i.value = NOMS_RIGOLOS[Math.floor(Math.random() * NOMS_RIGOLOS.length)]; };
  $('#aOk', F.el).onclick = () => { d.surnom = i.value.trim().slice(0, 14) || null; pop(); J.changer('dindies'); F.fermer(); };
  return d;
}
