/* ══════════ LES FENÊTRES DU DINDODROME ══════════
   Le Bureau des courses (les championnats, la finale, les courses libres), le choix de la coureuse,
   les résultats d'une course, et la Salle des trophées (badges et records). */
import { PAR_ID } from '../donnees/especes.js';
import { TYPES, RARETES } from '../donnees/types.js';
import { CHAMPIONNATS, SORTES, PISTES, COMPETENCES, competencesDe, gainsCourse, LIGUE, MAITRES, RELAIS, PISTES_CHRONO } from '../donnees/courses.js';
import { portraitDindie } from '../dindies/portrait.js';
import { PERSONNAGES, portraitChibi } from '../personnages/chibi.js';
import { fenetre, toast, $, $$, echapper } from '../moteur/ui.js';
import { pop, tada } from '../moteur/sons.js';
import { astuce } from './astuces.js';
import * as J from '../jeu/etat.js';
import * as DD from '../jeu/dindodrome.js';
import { qualites } from '../jeu/course.js';
import { nomDe, stats, adnDe } from '../jeu/individus.js';
import * as S from '../jeu/scenario.js';

const E = () => J.etat();
let n = 0;
const portrait = d => portraitDindie(adnDe(d), { id: 'DD' + (n++) });
const MEDAILLE = p => p === 1 ? '🥇' : p === 2 ? '🥈' : p === 3 ? '🥉' : p ? `${p}e` : '–';
const ORD = p => p === 1 ? '1re' : p + 'e';
export const coureusesPossibles = () => J.equipe().filter(d => d.stade === 'adulte' || d.stade === 'eveille');

/* ── le Bureau des courses ── */
export function ouvrirBureau({ courir }) {
  const F = fenetre('📋 Bureau des courses', '', { classe: 'bureauF', large: true });
  const dessiner = () => {
    const ouverts = CHAMPIONNATS.filter(C => DD.championnatOuvert(C.n, S.etapeAtteinte));
    const meilleure = Math.max(5, ...coureusesPossibles().map(d => d.niveau));
    let h = `<p class="petitTexte">Pour chaque championnat : finis les <b>3 courses sur le podium</b> (1re, 2e ou 3e place), puis gagne <b>la finale</b> contre le champion pour remporter son badge. Tu peux recommencer autant que tu veux !</p>`;
    if (!ouverts.length) h += '<p class="vide">🏁 Les championnats ne sont pas encore ouverts. Monsieur Chrono t’attend devant le Bureau !</p>';
    for (const C of ouverts) {
      const fo = DD.finaleOuverte(C.n), b = DD.badge(C.n), Pc = PERSONNAGES[C.champion];
      h += `<div class="champ ${b ? 'gagne' : ''}" style="--type:${TYPES[C.type].couleur}"><div class="champHaut"><div class="champPortrait">${portraitChibi(Pc, 'bur' + C.champion)}</div>
        <div><b>${C.badge.e} ${C.nom}</b><small>${['leila', 'tarzanette', 'lava', 'azur'].includes(C.champion) ? 'Championne' : 'Champion'} : ${Pc.nom} · ${TYPES[C.type].e} ${TYPES[C.type].nom} · niv. ${C.niveaux[0]} à ${C.finale.star.niveau}</small>
        ${b ? `<small class="badgeOk">${C.badge.e} Tu as ${C.badge.nom} !</small>` : ''}</div></div>
        <div class="champCourses">${C.courses.map(c => ligne(c.id, c.sorte, c.piste, C.n)).join('')}
        ${fo ? ligne(C.finale.id, C.finale.sorte, C.finale.piste, C.n, true) : `<div class="ligneCourse verrou"><span class="lcE">🔒</span><div><b>La finale contre ${Pc.nom}</b><small>Finis d’abord les 3 courses sur le podium.</small></div></div>`}</div></div>`;
    }
    /* ── la Ligue des Légendes (chapitre 8) : les courses s'ouvrent une par une ── */
    if (S.etapeAtteinte('ligue1')) {
      h += `<div class="champ ligue" style="--type:#a855f7"><div class="champHaut"><div class="champPortrait">👑</div><div><b>La Ligue des Légendes</b><small>Les Quatre Plumes, puis Gontran. Il faut <b>gagner</b> chaque course (1re place) !</small></div></div><div class="champCourses">`
        + LIGUE.map((L, k) => {
          const ouverte = !k || DD.ligueGagnee(LIGUE[k - 1].id), g = DD.ligueGagnee(L.id), Pp = PERSONNAGES[L.plume];
          return ouverte ? `<div class="ligneCourse finale ${g ? 'reussie' : ''}"><span class="lcE lcP">${portraitChibi(Pp, 'lg' + L.plume)}</span><div><b>${Pp.nom}</b><small>${SORTES[L.sorte].e} ${SORTES[L.sorte].nom} · ${SORTES[L.sorte].distance} m · ${PISTES[L.piste].e} ${PISTES[L.piste].court} · ⭐ ${echapper(L.rival.nom)}, niv. ${L.rival.niveau}</small></div>
            <span class="lcMed">${g ? '👑' : MEDAILLE(DD.meilleurePlace(L.id))}</span><button class="btn vert petit" data-courir="${L.id}">🏁 Courir</button></div>`
            : `<div class="ligneCourse verrou"><span class="lcE">🔒</span><div><b>${k === LIGUE.length - 1 ? 'La grande finale' : 'Une des Quatre Plumes'}</b><small>Gagne d’abord la course d’avant.</small></div></div>`;
        }).join('') + '</div></div>';
    }
    /* ── après la Ligue : les relais, le contre la montre, la course sans fin ; après l'histoire : les Coupes des Maîtres ── */
    if (DD.ligueGagnee('ligueGontran')) {
      const Sc = DD.courses();
      h += `<h3>🔁 Les relais</h3><p class="petitTexte">Choisis <b>3 dindies</b> : chacune court 400 m, puis passe le relais à la suivante !</p>
        <div class="champCourses">${RELAIS.map(R => `<div class="ligneCourse"><span class="lcE">🔁</span><div><b>${R.nom}</b><small>3 × 400 m · niv. ${R.niveaux[0]} à ${R.niveaux[1]}</small></div><span class="lcMed">${MEDAILLE(DD.meilleurePlace(R.id))}</span><button class="btn vert petit" data-courir="${R.id}">🏁 Courir</button></div>`).join('')}</div>
        <h3>⏱️ Contre la montre</h3><p class="petitTexte">Seule sur la piste, 500 m : bats ton record, et gagne les médailles 🥉 🥈 🥇 !</p>
        <div class="chronos">${PISTES_CHRONO.map(pi => { const r = Sc.chronos[pi], M = DD.tempsMedailles(pi); return `<button class="chrono" data-courir="chrono-${pi}"><span>${PISTES[pi].e}</span><b>${PISTES[pi].court}</b><small>${r ? `${r.temps.toFixed(2)} s ${{ or: '🥇', argent: '🥈', bronze: '🥉' }[r.medaille] || ''}` : `🥇 ${M.or.toFixed(1)} s`}</small></button>`; }).join('')}</div>
        <h3>♾️ La course sans fin</h3><div class="ligneCourse"><span class="lcE">♾️</span><div><b>Cours le plus loin possible !</b><small>À la 3e chute, ou à bout de forces, c’est fini.${Sc.sansFin ? ` Ton record : <b>${Sc.sansFin.distance} m</b> (${echapper(Sc.sansFin.qui)})` : ''}</small></div><button class="btn vert petit" data-courir="sansfin">🏁 Courir</button></div>`;
    }
    if (S.etapeAtteinte('fin')) {
      h += `<div class="champ maitres" style="--type:#eab308"><div class="champHaut"><div class="champPortrait">🏆</div><div><b>Les Coupes des Maîtres</b><small>Les 8 champions reviennent, au niveau 50 ! Une course chacun, sur sa piste : il faut gagner.</small></div></div><div class="champCourses">`
        + MAITRES.map(M => { const g = DD.maitreGagne(M.n), Pc = PERSONNAGES[M.champion]; return `<div class="ligneCourse finale ${g ? 'reussie' : ''}"><span class="lcE lcP">${portraitChibi(Pc, 'mt' + M.champion)}</span><div><b>${Pc.nom}</b><small>${PISTES[M.piste].e} ${PISTES[M.piste].nom} · ⭐ ${echapper(M.rival.nom)}, niv. 50</small></div><span class="lcMed">${g ? '🏆' : MEDAILLE(DD.meilleurePlace(M.id))}</span><button class="btn vert petit" data-courir="${M.id}">🏁 Courir</button></div>`; }).join('') + '</div></div>';
    }
    if (S.etapeAtteinte('coupe1')) {
      h += `<h3>🎽 Les courses libres</h3><p class="petitTexte">Pour gagner de l’expérience et des pièces, contre des dindies de ton niveau (environ ${meilleure}).</p>
        <div class="libres">${['sprint', 'haies', 'marathon'].map(s => `<button class="btn" data-courir="libre-${s}-${meilleure}">${SORTES[s].e} ${SORTES[s].nom}<small>${SORTES[s].distance} m</small></button>`).join('')}</div>`;
    }
    F.contenu.innerHTML = h;
    $$('[data-courir]', F.el).forEach(b => b.onclick = () => { pop(); F.fermer(); courir(b.dataset.courir); });
  };
  const ligne = (id, sorte, piste, nc, finale = false) => {
    const p = DD.meilleurePlace(id), S0 = SORTES[sorte], P = PISTES[piste], g = gainsCourse(1, nc);
    return `<div class="ligneCourse ${finale ? 'finale' : ''} ${p && (finale ? p === 1 : p <= 3) ? 'reussie' : ''}"><span class="lcE">${finale ? '🏆' : S0.e}</span>
      <div><b>${finale ? 'La finale' : S0.nom} · ${S0.distance} m</b><small>${P.e} ${P.court}${P.zone ? (P.zone === 'sable' ? ' · sable' : ' · boue') : ''} · ${g.pieces} 🪙</small></div>
      <span class="lcMed" title="Ta meilleure place">${MEDAILLE(p)}</span><button class="btn vert petit" data-courir="${id}">🏁 Courir</button></div>`;
  };
  dessiner();
  return F;
}

/* ── choisir la dindie qui va courir (avec ce qui l'aide ou la gêne sur cette piste) ; au relais : 3 dindies, dans l'ordre ── */
export function choisirCoureuse(def) {
  return new Promise(resoudre => {
    const L = coureusesPossibles();
    const P = PISTES[def.piste];
    let choisie = null;
    const equipe = [];
    const F = fenetre(`${SORTES[def.sorte].e} ${def.relais ? 'Ton équipe de relais' : 'Qui va courir ?'}`, '', { classe: 'choixCoureuseF', surFermer: () => resoudre(def.relais ? (choisie ? equipe : null) : choisie) });
    if (!L.length || (def.relais && L.length < 3)) { F.contenu.innerHTML = `<p class="vide">Il te faut ${def.relais ? '<b>3 dindies adultes</b>' : 'une dindie adulte'} dans ton équipe 🎒 pour courir ! Range-${def.relais ? 'les' : 'en une'} dans ton équipe (touche 🐾).</p>`; return; }
    astuce('courses', F);
    F.contenu.innerHTML = `<p class="petitTexte"><b>${echapper(def.nom)}</b> · ${def.sansFin ? 'aussi loin que possible' : SORTES[def.sorte].distance + ' m'} · ${P.e} ${P.nom}. ${SORTES[def.sorte].desc}${def.relais ? ' <b>Touche 3 dindies, dans l’ordre du relais.</b>' : ''}</p>
      <div class="coureuses">${L.map(d => {
        const Q = qualites(d, P.type, !!E().reglages.aide), st = stats(d), e = PAR_ID[d.espece];
        const terrain = Q.terrain > 1 ? `<span class="tBon">${TYPES[P.type].e} Elle court chez elle : + 8 %</span>` : Q.terrain < 1 ? `<span class="tMal">${TYPES[P.type].e} Cette piste ne lui plaît pas : − 8 %</span>` : '';
        return `<button class="coureuse" data-uid="${d.uid}" style="--rar:${RARETES[e.rarete].couleur}"><div class="mini">${portrait(d)}</div>
          <div><b>${echapper(nomDe(d))}</b> <small>niv. ${d.niveau}${d.stade === 'eveille' ? ' · 🌟' : ''}</small>
          <div class="statsMini"><span>⚡ ${st[0]}</span><span>💪 ${st[1]}</span><span>🦘 ${st[2]}</span></div>
          <div class="compsMini">${competencesDe(d).map(id => `<span title="${COMPETENCES[id].desc}">${COMPETENCES[id].e} ${COMPETENCES[id].nom}</span>`).join('')}</div>${terrain}</div></button>`;
      }).join('')}</div>`;
    $$('.coureuse', F.el).forEach(b => b.onclick = () => {
      pop();
      const d = J.parUid(b.dataset.uid);
      if (!def.relais) { choisie = d; F.fermer(); return; }
      const k = equipe.indexOf(d);
      if (k >= 0) equipe.splice(k, 1); else if (equipe.length < 3) equipe.push(d);
      $$('.coureuse', F.el).forEach(x => { const i = equipe.indexOf(J.parUid(x.dataset.uid)); x.dataset.ordre = i >= 0 ? i + 1 : ''; x.classList.toggle('choisie', i >= 0); });
      if (equipe.length === 3) { choisie = equipe[0]; setTimeout(() => F.fermer(), 350); }
    });
  });
}

/* ── les résultats ── */
export function ouvrirResultats(def, C, res, niveau) {
  return new Promise(resoudre => {
    const R = C.joueur(), place = res.place;
    const MED = { or: '🥇 Médaille d’or', argent: '🥈 Médaille d’argent', bronze: '🥉 Médaille de bronze' };
    const titre = def.sansFin ? `♾️ ${res.distance} m !` : def.solo ? `⏱️ ${res.temps.toFixed(2)} s` : place === 1 ? '🥇 Victoire !' : place <= 3 ? `${MEDAILLE(place)} ${ORD(place)} place !` : `🏁 ${ORD(place)} place`;
    const reussi = def.finale || def.gagner ? place === 1 : def.podium ? place <= 3 : true;
    const conseil = reussi ? '' : def.finale || def.gagner ? 'Pour gagner, il faut la 1re place. Entraîne ta dindie chez Coach Ginette (au Domaine), fais-lui gagner des niveaux, apprends-lui une compétence, ou essaie une dindie qui court chez elle sur cette piste !'
      : 'Il faut finir sur le podium (3 premières). Tu peux recommencer : saute au bon moment (l’anneau devient vert !) et lance tes compétences.';
    const solo = def.solo ? `<div class="soloRes"><p class="grosEmoji">${def.sansFin ? '♾️' : { or: '🥇', argent: '🥈', bronze: '🥉' }[res.medaille] || '⏱️'}</p>
      <p>${def.sansFin ? `${echapper(R.nom)} a couru <b>${res.distance} m</b> en ${res.temps.toFixed(1)} s${R.chutes >= 3 ? ' (3 chutes)' : ' (à bout de forces)'}.` : `${echapper(R.nom)} : <b>${res.temps.toFixed(2)} s</b>${res.medaille ? ` · ${MED[res.medaille]} !` : ''}`}</p>
      ${def.sansFin ? '' : `<small>🥉 ${DD.tempsMedailles(def.piste).bronze.toFixed(2)} s · 🥈 ${DD.tempsMedailles(def.piste).argent.toFixed(2)} s · 🥇 ${DD.tempsMedailles(def.piste).or.toFixed(2)} s</small>`}</div>` : '';
    const F = fenetre(titre, `<div class="resultats">${solo}
      <ol class="classementF ${def.solo ? 'cache' : ''}">${C.ordreArrivee.map(X => `<li class="${X.joueur ? 'moi' : ''} ${X.id === 'star' ? 'star' : ''}"><span class="pl">${MEDAILLE(X.place)}</span><div class="mini">${portrait(X.d)}</div>
        <div><b>${echapper(X.nom)}</b><small>${echapper(X.dresseur || '')}${X.id === 'star' ? ' · ⭐' : ''}${def.relais && X.equipe ? ` · ${X.equipe.map(x => echapper(nomDe(x))).join(' → ')}` : ` · niv. ${X.d.niveau}`}</small></div><span class="tps">${X.temps.toFixed(2)} s</span></li>`).join('')}</ol>
      <div class="gains"><span>+ ${res.gains.pieces} 🪙</span><span>${def.relais ? `+ ${Math.round(res.gains.xp / 2)} XP pour chacune des 3 dindies` : `+ ${res.gains.xp} XP pour ${echapper(R.nom)}`}</span>${niveau ? `<span class="niv">⬆️ Niveau ${niveau.apres} !</span>` : ''}${res.nouveauRecord ? '<span class="rec">⏱️ Nouveau record !</span>' : ''}</div>
      ${res.badge ? `<div class="badgeGagne"><span class="grosEmoji">${res.badge.badge.e}</span><p>Tu gagnes <b>${res.badge.badge.nom}</b> !</p><small>+ ${res.badge.recompense.pieces} 🪙${res.badge.recompense.plumesOr ? ` + ${res.badge.recompense.plumesOr} 🪶` : ''}</small></div>` : ''}
      ${conseil ? `<p class="petitTexte conseilC">💡 ${conseil}</p>` : ''}
      <button class="btn grand vert" id="rOk">Continuer</button></div>`, { classe: 'resultatsF', surFermer: () => resoudre() });
    if (res.badge || place === 1) tada();
    $('#rOk', F.el).onclick = () => { pop(); F.fermer(); };
  });
}

/* ── la Salle des trophées ── */
export function ouvrirTrophees() {
  const Sc = DD.courses();
  const recs = Object.entries(Sc.records);
  fenetre('🏆 La Salle des trophées', `<div class="badges">${CHAMPIONNATS.map(C => C.badge && DD.badge(C.n)
      ? `<div class="badgeCase ok"><span>${C.badge.e}</span><small>${C.badge.nom.replace(/^le /, '')}</small></div>` : `<div class="badgeCase"><span>?</span><small>Badge ${C.n}</small></div>`).join('')}</div>
    <p class="petitTexte">🏁 ${Sc.faites} course${Sc.faites > 1 ? 's' : ''} · 🥇 ${Sc.victoires} victoire${Sc.victoires > 1 ? 's' : ''} · 🏋️ ${Sc.entrainements} entraînement${Sc.entrainements > 1 ? 's' : ''}</p>
    ${Sc.ligue.includes('ligueGontran') ? '<div class="grandTrophee">👑<b>Grande championne de la Ligue des Légendes</b></div>' : ''}
    ${Sc.maitres.length ? `<h3>🏆 Les Coupes des Maîtres (${Sc.maitres.length}/8)</h3><div class="badges">${MAITRES.map(M => `<div class="badgeCase ${Sc.maitres.includes(M.n) ? 'ok or' : ''}"><span>${Sc.maitres.includes(M.n) ? '🏆' : '?'}</span><small>${PISTES[M.piste].court}</small></div>`).join('')}</div>` : ''}
    ${Object.keys(Sc.chronos).length ? `<h3>⏱️ Contre la montre</h3><div class="records">${Object.entries(Sc.chronos).map(([pi, r]) => `<div class="record"><span>${PISTES[pi].e} ${PISTES[pi].court} ${{ or: '🥇', argent: '🥈', bronze: '🥉' }[r.medaille] || ''}</span><small>${echapper(r.qui)}</small><b>${r.temps.toFixed(2)} s</b></div>`).join('')}</div>` : ''}
    ${Sc.sansFin ? `<h3>♾️ La course sans fin</h3><div class="records"><div class="record"><span>♾️ ${Sc.sansFin.distance} m</span><small>${echapper(Sc.sansFin.qui)}</small><b>${Sc.sansFin.temps.toFixed(1)} s</b></div></div>` : ''}
    <h3>⏱️ Tes records</h3>${recs.length ? `<div class="records">${recs.map(([cle, r]) => { const [so, pi] = cle.split(':'); return `<div class="record"><span>${SORTES[so].e} ${SORTES[so].nom} · ${PISTES[pi].e} ${PISTES[pi].court}</span><small>${echapper(r.qui)}</small><b>${r.temps.toFixed(2)} s</b></div>`; }).join('')}</div>` : '<p class="vide">Pas encore de record. Cours une première course !</p>'}`, { classe: 'tropheesF' });
}
