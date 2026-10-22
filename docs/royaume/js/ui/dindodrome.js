/* ══════════ LES FENÊTRES DU DINDODROME ══════════
   Le Bureau des courses (les championnats, la finale, les courses libres), le choix de la coureuse,
   les résultats d'une course, et la Salle des trophées (badges et records). */
import { PAR_ID } from '../donnees/especes.js';
import { TYPES, RARETES } from '../donnees/types.js';
import { CHAMPIONNATS, SORTES, PISTES, COMPETENCES, competencesDe, gainsCourse } from '../donnees/courses.js';
import { portraitDindie } from '../dindies/portrait.js';
import { PERSONNAGES, portraitChibi } from '../personnages/chibi.js';
import { fenetre, toast, $, $$, echapper } from '../moteur/ui.js';
import { pop, tada } from '../moteur/sons.js';
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
        <div><b>${C.badge.e} ${C.nom}</b><small>${['leila', 'tarzanette'].includes(C.champion) ? 'Championne' : 'Champion'} : ${Pc.nom} · ${TYPES[C.type].e} ${TYPES[C.type].nom} · niv. ${C.niveaux[0]} à ${C.finale.star.niveau}</small>
        ${b ? `<small class="badgeOk">${C.badge.e} Tu as ${C.badge.nom} !</small>` : ''}</div></div>
        <div class="champCourses">${C.courses.map(c => ligne(c.id, c.sorte, c.piste, C.n)).join('')}
        ${fo ? ligne(C.finale.id, C.finale.sorte, C.finale.piste, C.n, true) : `<div class="ligneCourse verrou"><span class="lcE">🔒</span><div><b>La finale contre ${Pc.nom}</b><small>Finis d’abord les 3 courses sur le podium.</small></div></div>`}</div></div>`;
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

/* ── choisir la dindie qui va courir (avec ce qui l'aide ou la gêne sur cette piste) ── */
export function choisirCoureuse(def) {
  return new Promise(resoudre => {
    const L = coureusesPossibles();
    const P = PISTES[def.piste];
    let choisie = null;
    const F = fenetre(`${SORTES[def.sorte].e} Qui va courir ?`, '', { classe: 'choixCoureuseF', surFermer: () => resoudre(choisie) });
    if (!L.length) { F.contenu.innerHTML = '<p class="vide">Il te faut une dindie adulte dans ton équipe 🎒 pour courir ! Range-en une dans ton équipe (touche 🐾).</p>'; return; }
    F.contenu.innerHTML = `<p class="petitTexte"><b>${echapper(def.nom)}</b> · ${SORTES[def.sorte].distance} m · ${P.e} ${P.nom}. ${SORTES[def.sorte].desc}</p>
      <div class="coureuses">${L.map(d => {
        const Q = qualites(d, P.type, !!E().reglages.aide), st = stats(d), e = PAR_ID[d.espece];
        const terrain = Q.terrain > 1 ? `<span class="tBon">${TYPES[P.type].e} Elle court chez elle : + 8 %</span>` : Q.terrain < 1 ? `<span class="tMal">${TYPES[P.type].e} Cette piste ne lui plaît pas : − 8 %</span>` : '';
        return `<button class="coureuse" data-uid="${d.uid}" style="--rar:${RARETES[e.rarete].couleur}"><div class="mini">${portrait(d)}</div>
          <div><b>${echapper(nomDe(d))}</b> <small>niv. ${d.niveau}${d.stade === 'eveille' ? ' · 🌟' : ''}</small>
          <div class="statsMini"><span>⚡ ${st[0]}</span><span>💪 ${st[1]}</span><span>🦘 ${st[2]}</span></div>
          <div class="compsMini">${competencesDe(d).map(id => `<span title="${COMPETENCES[id].desc}">${COMPETENCES[id].e} ${COMPETENCES[id].nom}</span>`).join('')}</div>${terrain}</div></button>`;
      }).join('')}</div>`;
    $$('.coureuse', F.el).forEach(b => b.onclick = () => { pop(); choisie = J.parUid(b.dataset.uid); F.fermer(); });
  });
}

/* ── les résultats ── */
export function ouvrirResultats(def, C, res, niveau) {
  return new Promise(resoudre => {
    const R = C.joueur(), place = res.place;
    const titre = place === 1 ? '🥇 Victoire !' : place <= 3 ? `${MEDAILLE(place)} ${ORD(place)} place !` : `🏁 ${ORD(place)} place`;
    const reussi = def.finale ? place === 1 : def.podium ? place <= 3 : true;
    const conseil = reussi ? '' : def.finale ? 'Pour gagner la finale, il faut la 1re place. Entraîne ta dindie chez Coach Ginette (au Domaine), fais-lui gagner des niveaux, ou essaie une dindie qui court chez elle sur cette piste !'
      : 'Il faut finir sur le podium (3 premières). Tu peux recommencer : saute au bon moment (l’anneau devient vert !) et lance tes compétences.';
    const F = fenetre(titre, `<div class="resultats">
      <ol class="classementF">${C.ordreArrivee.map(X => `<li class="${X.joueur ? 'moi' : ''} ${X.id === 'star' ? 'star' : ''}"><span class="pl">${MEDAILLE(X.place)}</span><div class="mini">${portrait(X.d)}</div>
        <div><b>${echapper(X.nom)}</b><small>${echapper(X.dresseur || '')}${X.id === 'star' ? ' · ⭐' : ''} · niv. ${X.d.niveau}</small></div><span class="tps">${X.temps.toFixed(2)} s</span></li>`).join('')}</ol>
      <div class="gains"><span>+ ${res.gains.pieces} 🪙</span><span>+ ${res.gains.xp} XP pour ${echapper(R.nom)}</span>${niveau ? `<span class="niv">⬆️ Niveau ${niveau.apres} !</span>` : ''}${res.nouveauRecord ? '<span class="rec">⏱️ Nouveau record !</span>' : ''}</div>
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
  fenetre('🏆 La Salle des trophées', `<div class="badges">${[...CHAMPIONNATS, ...[5, 6, 7, 8].map(n => ({ n }))].map(C => C.badge && DD.badge(C.n)
      ? `<div class="badgeCase ok"><span>${C.badge.e}</span><small>${C.badge.nom.replace(/^le /, '')}</small></div>` : `<div class="badgeCase"><span>?</span><small>Badge ${C.n}</small></div>`).join('')}</div>
    <p class="petitTexte">🏁 ${Sc.faites} course${Sc.faites > 1 ? 's' : ''} · 🥇 ${Sc.victoires} victoire${Sc.victoires > 1 ? 's' : ''} · 🏋️ ${Sc.entrainements} entraînement${Sc.entrainements > 1 ? 's' : ''}</p>
    <h3>⏱️ Tes records</h3>${recs.length ? `<div class="records">${recs.map(([cle, r]) => { const [so, pi] = cle.split(':'); return `<div class="record"><span>${SORTES[so].e} ${SORTES[so].nom} · ${PISTES[pi].e} ${PISTES[pi].court}</span><small>${echapper(r.qui)}</small><b>${r.temps.toFixed(2)} s</b></div>`; }).join('')}</div>` : '<p class="vide">Pas encore de record. Cours une première course !</p>'}`, { classe: 'tropheesF' });
}
