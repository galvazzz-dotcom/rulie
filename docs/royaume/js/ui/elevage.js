/* ══════════ LES FENÊTRES DE L'ÉLEVAGE ══════════
   Le Couvoir (le nid pour croiser deux adultes, les couveuses (2 à 4) et leurs minuteurs), l'éclosion animée,
   la Nurserie (les bébés qui grandissent), et l'éveil au Labo. */
import { PAR_ID } from '../donnees/especes.js';
import { TYPES, RARETES } from '../donnees/types.js';
import { portraitDindie } from '../dindies/portrait.js';
import { fenetre, toast, $, $$, el, echapper, barre } from '../moteur/ui.js';
import { pop, tada, glouglou } from '../moteur/sons.js';
import { dire } from '../moteur/voix.js';
import * as J from '../jeu/etat.js';
import * as L from '../jeu/elevage.js';
import { OBJETS } from '../jeu/objets.js';
import { nomDe, NOMS_RIGOLOS, xpPourNiveau, adnDe } from '../jeu/individus.js';
import * as S from '../jeu/scenario.js';
import * as GQ from '../jeu/grandesQuetes.js';
import { forcerHeure, forcerPleineLune } from '../moteur/temps.js';
import { blocAmeliorer, brancherAmeliorer } from './production.js';

const E = () => J.etat();
let n = 0;
const portrait = d => portraitDindie(adnDe(d), { id: 'E' + (n++) });
/* « 4 min 05 s », « 1 h 12 » */
export function duree(ms) {
  const s = Math.ceil(ms / 1000);
  if (s >= 3600) return `${Math.floor(s / 3600)} h ${String(Math.floor(s % 3600 / 60)).padStart(2, '0')}`;
  if (s >= 60) return `${Math.floor(s / 60)} min ${String(s % 60).padStart(2, '0')} s`;
  return `${s} s`;
}
/* un œuf dessiné (ses taches ont les couleurs de ses parents) ; fissures : 0 à 3 */
export function oeufSvg(couleurs = ['#f472b6', '#60a5fa'], fissures = 0, id = 'oe' + (n++)) {
  const [a, b] = couleurs;
  return `<svg viewBox="0 0 100 120" class="oeufSvg"><defs><radialGradient id="${id}" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="#fffdf5"/><stop offset="1" stop-color="#f3e3c3"/></radialGradient></defs>
    <path d="M50 6 C78 6 92 52 92 76 C92 100 74 114 50 114 C26 114 8 100 8 76 C8 52 22 6 50 6Z" fill="url(#${id})" stroke="#b08a5a" stroke-width="3"/>
    <circle cx="34" cy="44" r="9" fill="${a}" opacity=".85"/><circle cx="64" cy="70" r="11" fill="${b}" opacity=".85"/><circle cx="40" cy="90" r="6" fill="${a}" opacity=".8"/><circle cx="68" cy="36" r="5" fill="${b}" opacity=".8"/>
    ${fissures > 0 ? '<path d="M30 60 L40 54 L46 64 L56 56 L62 66" stroke="#7c5a3a" stroke-width="3" fill="none" stroke-linecap="round"/>' : ''}
    ${fissures > 1 ? '<path d="M56 56 L58 44 L66 40" stroke="#7c5a3a" stroke-width="3" fill="none" stroke-linecap="round"/>' : ''}
    ${fissures > 2 ? '<path d="M40 54 L36 42 M46 64 L44 78 L52 84" stroke="#7c5a3a" stroke-width="3" fill="none" stroke-linecap="round"/>' : ''}</svg>`;
}
const carteMini = (d, extra = '') => `<button class="carteDindie" data-uid="${d.uid}" style="--rar:${RARETES[PAR_ID[d.espece].rarete].couleur}"><div class="mini">${portrait(d)}</div><b>${echapper(nomDe(d))}</b><small>${PAR_ID[d.espece].types.map(t => TYPES[t].e).join('')} Niv. ${d.niveau}${extra}</small></button>`;

/* ── le Couvoir ── */
export function ouvrirCouvoir({ surChange, surEclosion } = {}) {
  const nid = [null, null];
  let minuteur = null, gateau = false;
  const F = fenetre('🥚 Le Couvoir', '', { classe: 'couvoirF', large: true, surFermer: () => clearInterval(minuteur) });
  const dessiner = () => {
    const C = L.elevage().couveuses, P = nid[0] && nid[1] ? L.possibilites(nid[0], nid[1]) : null, M = P && GQ.mythiquePour(nid[0], nid[1]);
    const O = M && OBJETS[M.G.objet];
    const infoCouple = !P ? '<p class="petitTexte">Choisis deux dindies adultes. Avec deux types différents, un <b>hybride</b> peut naître !</p>'
      : M && M.ok ? `<p class="infoCouple legende">🌈 Une <b>légende</b> peut naître : <b>${M.M.nom}</b>&nbsp;! (${O.e} ${O.nom} : l’objet légendaire va servir)</p>`
      : M && M.aObjet ? `<p class="infoCouple legende">🌈 Tu as ${O.e} ${O.nom}… mais la légende ne naît que <b>${M.condition}</b>. Reviens à ce moment-là !</p>`
      : M ? `<p class="infoCouple legende">🌈 Ce couple pourrait faire naître une <b>légende</b>… Il manque un objet légendaire (grande quête « ${M.G.titre} »).</p>`
      : P.recette && E().livre.vus[P.recette.id] ? `<p class="infoCouple">✨ Une <b>recette secrète</b> est possible : ${P.recette.nom}&nbsp;!</p>`
      : P.recette ? '<p class="infoCouple">✨ Ce couple cache une <b>recette secrète</b>…</p>'
      : P.hybrides.length ? `<p class="infoCouple">🧬 Un hybride est possible : ${[...new Set(P.hybrides.map(h => h.types.map(t => TYPES[t].e).join(' × ')))].join(' ou ')}&nbsp;!</p>`
      : '<p class="infoCouple pale">Ces deux dindies ont le même type : leur bébé leur ressemblera. Choisis deux types différents pour un hybride !</p>';
    F.contenu.innerHTML = `<h3>💕 Le nid</h3><div class="nid">${nid.map((d, i) => d ? `<div class="placeNid">${carteMini(d)}<button class="btn petit" data-retire="${i}">✖</button></div>`
        : `<button class="placeNid vide" data-choisir="${i}"><span>➕</span><small>Parent ${i + 1}</small></button>`).join('<span class="coeurNid">💕</span>')}</div>
      ${infoCouple}${J.combien('gateauAmour') ? `<label class="mais"><input type="checkbox" id="cGateau" ${gateau ? 'checked' : ''}> 🎂 Avec un Gâteau d’amour (tu en as ${J.combien('gateauAmour')}) : un hybride ou une recette secrète, bien plus souvent !</label>` : ''}
      <div class="ligneBtn"><button class="btn grand vert" id="cCroiser" ${P ? '' : 'disabled'}>💕 Croiser</button></div>
      <h3>🔥 Les couveuses</h3><div class="couveuses">${C.map((o, i) => o ? `<div class="couveuse ${L.pret(o) ? 'prete' : ''}">
        <div class="oeufBox">${oeufSvg(o.couleurs, L.pret(o) ? 2 : 0)}</div>
        <b>${o.rarete === 'mythique' ? '🌈 Un œuf légendaire !' : o.origine === 'croisement' ? (o.parents?.length ? 'Œuf de ' + o.parents.map(p => PAR_ID[p]?.nom.split(' ').pop() || '?').join(' × ') : 'Un œuf de croisement') : o.origine === 'tutoriel' ? 'L’œuf du Professeur' : 'Un œuf mystère'}</b>
        ${L.pret(o) ? `<button class="btn grand jaune" data-eclore="${i}">🐣 Éclore !</button>`
          : `<div class="minuteur">${barre(1 - L.restant(o) / (o.fin - o.debut), '#f59e0b')}<span data-reste="${i}">⏳ ${duree(L.restant(o))}</span></div>
             ${J.combien('sablier') ? `<button class="btn petit" data-sablier="${i}">⏳ Sablier (${J.combien('sablier')}) : − 30 min</button>` : ''}`}</div>`
        : `<div class="couveuse vide"><div class="oeufBox vide">🪺</div><small>Libre</small></div>`).join('')}</div>
      ${J.combien('oeufProfesseur') ? '<div class="ligneBtn"><button class="btn jaune" id="cProf">🥚 Mettre l’œuf du Professeur en couveuse</button></div>' : ''}
      ${J.combien('oeufEpique') ? `<div class="ligneBtn"><button class="btn jaune" id="cEpique">🟣 Mettre un œuf épique en couveuse (tu en as ${J.combien('oeufEpique')})</button></div>` : ''}
      ${J.combien('oeufMystere') ? `<div class="ligneBtn"><button class="btn" id="cMystere">🥚 Mettre un œuf mystère en couveuse (tu en as ${J.combien('oeufMystere')})</button></div>` : ''}
      <p class="petitTexte">⏱️ Les œufs couvent même quand le jeu est fermé : commune 5 min, rare 20 min, épique 1 h${GQ.nbFinies() || C.some(o => o?.rarete === 'mythique') ? ', légendaire 4 h' : ''}${E().reglages.aide ? ' (deux fois moins en mode aide)' : ''}.</p>
      ${blocAmeliorer('couvoir')}`;
    brancherAmeliorer(F.el, () => { L.elevage(); surChange && surChange('couvoir'); dessiner(); });
    const gt = $('#cGateau', F.el); if (gt) gt.onchange = () => { gateau = gt.checked; };
    $$('[data-choisir]', F.el).forEach(b => b.onclick = () => { pop(); choisirParent(nid.filter(Boolean), d => { nid[+b.dataset.choisir] = d; dessiner(); }); });
    $$('[data-retire]', F.el).forEach(b => b.onclick = () => { pop(); nid[+b.dataset.retire] = null; dessiner(); });
    const c = $('#cCroiser', F.el); if (c) c.onclick = () => {
      const r = L.croiser(nid[0], nid[1], { gateau: gateau && J.combien('gateauAmour') > 0 });
      if (typeof r !== 'string') gateau = false;
      if (typeof r === 'string') { toast('⚠️ ' + r, { duree: 3200 }); return; }
      tada(); glouglou(1.1);
      if (r.espece === 'ruuulius') { forcerHeure(23, 3 * 60000); forcerPleineLune(3 * 60000); toast('🌈 La plume arc-en-ciel s’illumine… <b>La nuit tombe, et la pleine lune se lève !</b> Un œuf aux mille couleurs apparaît dans le nid. Il couvera 4 heures.', { duree: 5200, classe: 'grand' }); }
      else if (r.rarete === 'mythique') toast(`🌈 ${O ? O.e + ' ' + O.nom + ' brille' : 'Tout brille'}… Un <b>œuf légendaire</b> apparaît dans le nid ! Il couvera 4 heures.`, { duree: 4600, classe: 'grand' });
      else toast('💕 Un œuf apparaît dans le nid ! Il part au chaud dans une couveuse.', { duree: 3200 });
      window.dispatchEvent(new CustomEvent('dindie-joie', { detail: nid[0].uid })); window.dispatchEvent(new CustomEvent('dindie-joie', { detail: nid[1].uid }));
      nid[0] = nid[1] = null; S.evenement('croisement', r); surChange && surChange(); dessiner();
    };
    $$('[data-eclore]', F.el).forEach(b => b.onclick = async () => {
      const i = +b.dataset.eclore, o = L.elevage().couveuses[i];
      const d = L.eclore(i); if (!d) return;
      F.fermer();
      await eclosionAnimee(o, d);
      S.evenement('eclosion', { oeuf: o, dindie: d }); surEclosion && surEclosion(d); surChange && surChange();
    });
    $$('[data-sablier]', F.el).forEach(b => b.onclick = () => { if (L.sablier(+b.dataset.sablier)) { pop(); toast('⏳ Hop ! 30 minutes de gagnées.'); } dessiner(); });
    const pr = $('#cProf', F.el); if (pr) pr.onclick = () => { const r = L.couverOeufProfesseur(); if (typeof r === 'string') toast('⚠️ ' + r); else { pop(); S.evenement('oeufPose', r); } dessiner(); };
    const ep = $('#cEpique', F.el); if (ep) ep.onclick = () => { const r = L.couverOeufEpique(); if (typeof r === 'string') toast('⚠️ ' + r); else { tada(); toast('🟣 L’œuf épique brille dans sa couveuse… Il éclora dans 1 heure !', { duree: 3200 }); S.evenement('oeufPose', r); } dessiner(); };
    const m = $('#cMystere', F.el); if (m) m.onclick = () => { const r = L.couverOeufMystere(); if (typeof r === 'string') toast('⚠️ ' + r); else { pop(); toast('🥚 L’œuf mystère est au chaud…'); S.evenement('oeufPose', r); } dessiner(); };
  };
  dessiner();
  /* les minuteurs avancent sous nos yeux ; quand un œuf est prêt, on redessine */
  minuteur = setInterval(() => {
    const C = L.elevage().couveuses;
    if (C.some((o, i) => o && L.pret(o) && !$(`[data-eclore="${i}"]`, F.el))) { dessiner(); return; }
    C.forEach((o, i) => { const s = $(`[data-reste="${i}"]`, F.el); if (o && s) { s.textContent = '⏳ ' + duree(L.restant(o)); s.parentElement.querySelector('.barreP b').style.width = Math.round((1 - L.restant(o) / (o.fin - o.debut)) * 100) + '%'; } });
  }, 1000);
  return F;
}
function choisirParent(deja, surChoix) {
  const A = E().dindies.filter(d => L.estAdulte(d) && !deja.includes(d) && d.lieu !== 'mission');
  const F = fenetre('💕 Choisis un parent', A.length ? `<p class="petitTexte">Seules les dindies adultes (et pas en mission) peuvent avoir un œuf. Une dindie qui vient d’avoir un œuf se repose ${L.REPOS_PARENT} minutes.</p>
    <div class="rangee">${A.map(d => carteMini(d, L.fatigue(d) ? ' · 💤' : '')).join('')}</div>` : '<p>Aucune dindie adulte disponible…</p>');
  $$('.carteDindie', F.el).forEach(b => b.onclick = () => {
    const d = J.parUid(b.dataset.uid);
    if (L.fatigue(d)) { toast(`💤 ${nomDe(d)} se repose encore (${duree(L.fatigue(d))}).`); return; }
    pop(); F.fermer(); surChoix(d);
  });
}

/* ── l'éclosion : l'œuf tremble, se fissure… et hop ! ── */
export function eclosionAnimee(o, d) {
  return new Promise(resoudre => {
    const esp = PAR_ID[d.espece];
    const V = el(`<div id="eclosion"><div class="scene"><div class="oeufAnime">${oeufSvg(o.couleurs, 0, 'ecl')}</div></div><p class="texteE">Crac… crac…</p></div>`);
    document.body.appendChild(V);
    const box = $('.oeufAnime', V);
    let k = 0;
    const etapes = setInterval(() => {
      k++;
      if (k <= 3) { box.innerHTML = oeufSvg(o.couleurs, k, 'ecl' + k); box.classList.remove('secoue'); void box.offsetWidth; box.classList.add('secoue'); pop(); return; }
      clearInterval(etapes);
      tada(); glouglou(1.6);
      const R = RARETES[esp.rarete];
      $('.scene', V).innerHTML = `<div class="bebe" style="--rar:${R.couleur}">${portrait(d)}</div>`;
      $('.texteE', V).innerHTML = `<b>C’est… ${esp.nom}${d.chroma ? ' ✨ chromatique' : ''}&nbsp;!</b>
        <span><span class="pill rar" style="--rar:${R.couleur}">${R.nom}</span> ${esp.types.map(t => `<span class="pill">${TYPES[t].e} ${TYPES[t].nom}</span>`).join(' ')}</span>
        ${esp.rarete === 'mythique' ? '<span class="nouv">🌈 Une légende est née !</span>' : ['croisement', 'recette'].includes(esp.origine.sorte) ? '<span class="nouv">🧬 Une espèce née d’un croisement !</span>' : ''}
        <span class="renommer"><input id="eNom" maxlength="14" placeholder="Son prénom"><button class="btn jaune" id="eDe">🎲</button></span>
        <button class="btn grand vert" id="eOk">✅ Bienvenue !</button>`;
      dire(`C’est ${esp.nom} !`);
      const i = $('#eNom', V);
      $('#eDe', V).onclick = () => { pop(); i.value = NOMS_RIGOLOS[Math.floor(Math.random() * NOMS_RIGOLOS.length)]; };
      $('#eOk', V).onclick = () => { d.surnom = i.value.trim().slice(0, 14) || null; pop(); J.changer('dindies'); V.classList.add('part'); setTimeout(() => { V.remove(); resoudre(); }, 350); };
    }, 700);
  });
}

/* ── la Nurserie ── */
export function ouvrirNurserie({ surChange } = {}) {
  let minuteur = null;
  const F = fenetre('🍼 La Nurserie', '', { classe: 'nurserieF', large: true, surFermer: () => clearInterval(minuteur) });
  const dessiner = () => {
    const B = E().dindies.filter(L.estBebe);
    F.contenu.innerHTML = `<p class="petitTexte">Les bébés grandissent tout seuls, même quand le jeu est fermé : 🐣 poussin → 🐥 jeune en 10 min, puis 🦃 adulte en 30 min. <b>Chaque repas fait gagner 3 minutes !</b></p>
      ${B.length ? B.map(d => `<div class="bebeLigne"><div class="mini">${portrait(d)}</div><div class="infoBebe"><b>${echapper(nomDe(d))}</b>
        <small>${d.stade === 'poussin' ? '🐣 Poussin' : '🐥 Jeune'} · ${PAR_ID[d.espece].nom}${d.lieu === 'nurserie' ? '' : ' · 🐾 au Clapier'}</small>
        <div class="minuteur">${barre(1 - L.tempsCroissance(d) / ((d.stade === 'poussin' ? 10 : 30) * L.MINUTE / (E().reglages.aide ? 2 : 1)), '#f472b6')}<span data-croit="${d.uid}">${d.stade === 'poussin' ? '🐥' : '🦃'} dans ${duree(L.tempsCroissance(d))}</span></div></div>
        <button class="btn jaune" data-nourrir="${d.uid}" ${L.friandisePour(d) ? '' : 'disabled'}>🍪 Nourrir</button></div>`).join('')
        : '<p class="vide">🍼 Pas de bébé pour l’instant. Les poussins arrivent ici en sortant de l’œuf !</p>'}
      <p class="petitTexte">Places : ${E().dindies.filter(d => d.lieu === 'nurserie').length}/${L.placesNurserie()}</p>${blocAmeliorer('nurserie')}`;
    brancherAmeliorer(F.el, () => { surChange && surChange(); dessiner(); });
    $$('[data-nourrir]', F.el).forEach(b => b.onclick = () => {
      const d = J.parUid(b.dataset.nourrir), r = L.nourrir(d);
      if (!r) { toast('Il te faut une friandise !'); return; }
      glouglou(1.6); pop(); toast(`${OBJETS[r.id].e} Miam ! ${nomDe(d)} grandit plus vite (− 3 min)${r.pref ? ' : sa friandise préférée !' : ''}`, { cle: 'miam' });
      window.dispatchEvent(new CustomEvent('dindie-joie', { detail: d.uid }));
      const evts = L.majCroissance(); evts.forEach(x => grandiToast(x)); if (evts.length) S.evenement('grandir', evts[0]);
      surChange && surChange(); dessiner();
    });
  };
  dessiner();
  minuteur = setInterval(() => {
    const evts = L.majCroissance(); if (evts.length) { evts.forEach(x => grandiToast(x)); S.evenement('grandir', evts[0]); surChange && surChange(); dessiner(); return; }
    $$('[data-croit]', F.el).forEach(s => { const d = J.parUid(s.dataset.croit); if (d) s.textContent = `${d.stade === 'poussin' ? '🐥' : '🦃'} dans ${duree(L.tempsCroissance(d))}`; });
  }, 1000);
  return F;
}
export function grandiToast(d) {
  tada();
  toast(d.stade === 'jeune' ? `🐥 ${nomDe(d)} a grandi : c’est maintenant une jeune dindie !` : `🦃 ${nomDe(d)} est adulte ! Elle quitte la Nurserie${d.lieu === 'equipe' ? ' et rejoint ton équipe' : ''}.`, { duree: 3600, classe: 'grand' });
}

/* ── l'éveil, au Labo ── */
export function ouvrirEveil({ surChange } = {}) {
  const F = fenetre('🌟 L’éveil', '', { classe: 'eveilF', large: true });
  const dessiner = () => {
    const A = E().dindies.filter(d => L.estAdulte(d) && d.lieu !== 'mission').sort((a, b) => b.niveau - a.niveau);
    F.contenu.innerHTML = `<p class="petitTexte">Une dindie de <b>niveau ${L.NIVEAU_EVEIL}</b> peut s’éveiller avec une <b>pierre d’éveil</b> 💎 (tu en as ${J.combien('pierreEveil')}).
      Elle gagne + 1 à chaque stat de base et une toute nouvelle apparence !</p>
      <div class="rangee">${A.map(d => { const non = L.peutEveiller(d); return `<button class="carteDindie ${non ? 'pale' : 'prete'}" data-uid="${d.uid}"><div class="mini">${portrait(d)}</div><b>${echapper(nomDe(d))}</b>
        <small>${d.stade === 'eveille' ? '🌟 Éveillée' : `Niv. ${d.niveau}/${L.NIVEAU_EVEIL}`}</small>${d.stade !== 'eveille' ? barre(Math.min(1, (d.niveau - 1 + d.xp / xpPourNiveau(d.niveau)) / (L.NIVEAU_EVEIL - 1)), '#a855f7') : ''}</button>`; }).join('') || '<p>Pas encore de dindie adulte.</p>'}</div>`;
    $$('.carteDindie', F.el).forEach(b => b.onclick = async () => {
      const d = J.parUid(b.dataset.uid), non = L.peutEveiller(d);
      if (non) { toast('🌟 ' + non, { duree: 3200 }); return; }
      if (!confirm(`Éveiller ${nomDe(d)} avec une pierre d’éveil ?`)) return;
      const avant = portrait(d);
      L.eveiller(d);
      F.fermer();
      await eveilAnime(d, avant);
      S.evenement('eveil', d); surChange && surChange();
    });
  };
  dessiner();
}
function eveilAnime(d, avant) {
  return new Promise(resoudre => {
    const V = el(`<div id="eclosion" class="eveil"><div class="scene"><div class="bebe">${avant}</div></div><p class="texteE">✨ La pierre d’éveil brille…</p></div>`);
    document.body.appendChild(V); pop();
    setTimeout(() => { $('.scene', V).classList.add('flash'); tada(); }, 900);
    setTimeout(() => {
      $('.scene', V).innerHTML = `<div class="bebe eveillee">${portrait(d)}</div>`; glouglou(.9);
      $('.texteE', V).innerHTML = `<b>🌟 ${echapper(nomDe(d))} est éveillée&nbsp;!</b><span>+ 1 à chaque stat de base, et une toute nouvelle allure.</span><button class="btn grand vert" id="vOk">✨ Magnifique !</button>`;
      dire(`${nomDe(d)} est éveillée !`);
      $('#vOk', V).onclick = () => { pop(); V.classList.add('part'); setTimeout(() => { V.remove(); resoudre(); }, 350); };
    }, 1700);
  });
}
