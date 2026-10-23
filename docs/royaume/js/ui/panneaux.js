/* ══════════ LES FENÊTRES DU JEU ══════════
   Boutique, Labo, Grand Livre, Musée, Maison (sauvegarde, profils, réglages),
   Clapier et équipe, enclos, fiche d'une dindie, sac, journal, carte, choix de la première dindie. */
import { ESPECES, PAR_ID } from '../donnees/especes.js';
import { TYPES, RARETES, ORDRE_TYPES } from '../donnees/types.js';
import { variante } from '../dindies/adn.js';
import { portraitDindie } from '../dindies/portrait.js';
import { fenetre, toast, $, $$, el, echapper, barre, fermerTout, fenetreOuverte, enDialogue } from '../moteur/ui.js';
import { pop, tada, glouglou } from '../moteur/sons.js';
import * as J from '../jeu/etat.js';
import { OBJETS, enBoutique, meilleurFilet } from '../jeu/objets.js';
import { texteConditions, regleDe, REGIONS } from '../donnees/regions.js';
import * as EL from '../jeu/elevage.js';
import { ouvrirEveil, duree } from './elevage.js';
import { CARACTERES, NOMS_RIGOLOS, nomDe, stats, xpPourNiveau, vaDans, adnDe } from '../jeu/individus.js';
import * as S from '../jeu/scenario.js';
import { QUETES, CHAPITRES } from '../jeu/scenario.js';
import * as SAUVE from '../moteur/sauvegarde.js';
import { ORDRE_ENCLOS } from '../monde/domaine.js';
import * as PR from '../jeu/production.js';
import * as QD from '../jeu/quetesDomaine.js';
import * as GQ from '../jeu/grandesQuetes.js';
import { PERSONNAGES } from '../personnages/chibi.js';
import { CHAPEAUX, DECORATIONS } from '../donnees/production.js';
import { boutonsFiche, brancherFiche, boutonRelacher, blocAmeliorer, brancherAmeliorer, plumesHtml, proposerHabitat } from './production.js';
import * as DF from '../jeu/defis.js';
import * as SU from '../jeu/succes.js';
import { ouvrirPanneau } from './quotidien.js';

const E = () => J.etat();
const PASTILLE = { commune: '⚪', rare: '🔵', epique: '🟣', mythique: '🌈' };
let n = 0;
const portrait = (d, opts = {}) => portraitDindie(adnDe(d), { id: 'P' + (n++), ...opts });
const portraitEsp = (id, opts = {}) => portraitDindie(variante(PAR_ID[id]), { id: 'Q' + (n++), ...opts });
const etoiles = k => '⭐'.repeat(k) + '<i class="eteinte">' + '⭐'.repeat(5 - k) + '</i>';
const lieuTexte = l => l === 'equipe' ? '🎒 Dans ton équipe' : l === 'clapier' ? '🐾 Au Clapier' : l === 'nurserie' ? '🍼 À la Nurserie' : l === 'mission' ? '📮 En mission' : l.startsWith('enclos:') ? `${TYPES[l.slice(7)].e} ${TYPES[l.slice(7)].habitat}` : l;
/* d'où vient cette dindie ? */
const origineTexte = d => d.origine === 'premiere' ? '🎁 Ta toute première dindie' : d.origine === 'cadeau' ? '🎁 Un cadeau du Professeur'
  : d.origine.startsWith('sauvage:') ? `🧭 Attrapée : ${REGIONS[d.origine.slice(8)]?.nom || 'une île'}`
  : d.origine === 'croisement' ? `🥚 Née au Couvoir${d.parents ? ` (${d.parents.map(p => PAR_ID[p].nom).join(' × ')})` : ''}` : d.origine === 'tutoriel' ? '🥚 L’œuf du Professeur' : d.origine === 'oeuf' ? '🥚 Sortie d’un œuf mystère' : '';

/* ── la boutique de Mimi ── */
export function ouvrirBoutique() {
  const F = fenetre('🛒 Chez Mimi', '', { classe: 'boutique' });
  const dessiner = () => {
    const ids = Object.keys(OBJETS).filter(id => enBoutique(id, E()));
    F.contenu.innerHTML = `<p class="bourse">Tu as <b>${E().pieces} 🪙</b></p><div class="rayons">` + ids.map(id => {
      const O = OBJETS[id], q = id === 'friandise' || O.prefere || O.graine ? 5 : 1;
      return `<div class="article"><span class="em">${O.e}</span><div><b>${O.nom}</b><small>${O.desc}</small><small class="possede">Tu en as : ${J.combien(id)}</small></div>
        <button class="btn acheter" data-id="${id}" data-q="${q}" ${E().pieces < O.prix * q ? 'disabled' : ''}>${q > 1 ? q + ' pour ' : ''}${O.prix * q} 🪙</button></div>`;
    }).join('') + '</div>';
    $$('.acheter', F.contenu).forEach(b => b.onclick = () => {
      const id = b.dataset.id, q = +b.dataset.q;
      if (!J.depenser(OBJETS[id].prix * q)) { toast('Il te manque des pièces !'); return; }
      J.ajouterObjet(id, q); pop(); toast(`${OBJETS[id].e} ${OBJETS[id].nom}${q > 1 ? ' × ' + q : ''} : merci !`);
      S.evenement('achat', id); dessiner();
    });
  };
  dessiner();
}

/* ── le Labo : le Professeur, le Grand Livre, les talents, des conseils ── */
export function ouvrirLabo() {
  const F = fenetre('🔬 Le Labo du Professeur', `<div class="menuLabo">
    <button class="btn grand" id="lLivre">📖 Ouvrir le Grand Livre</button>
    <button class="btn grand jaune" id="lTalents">⭐ Lire les talents de mes dindies</button>
    ${S.etapeAtteinte('parlerPlumeau4') ? '<button class="btn grand" id="lEveil">🌟 L’éveil</button>' : ''}
    <button class="btn grand vert" id="lConseil">💡 Un conseil, Professeur ?</button></div>`);
  $('#lLivre', F.el).onclick = () => { pop(); ouvrirLivre(); };
  const ev = $('#lEveil', F.el); if (ev) ev.onclick = () => { pop(); F.fermer(); ouvrirEveil(); };
  $('#lTalents', F.el).onclick = () => {
    pop();
    const T = fenetre('⭐ Les talents', E().dindies.length ? `<p class="petitTexte">Chaque dindie a de 0 à 5 étoiles de talent par stat. Les bébés héritent des talents de leurs parents !</p>` +
      E().dindies.map(d => `<div class="ligneTalent"><div class="mini">${portrait(d)}</div><div><b>${echapper(nomDe(d))}</b><div>⚡ ${etoiles(d.talents[0])}</div><div>💪 ${etoiles(d.talents[1])}</div><div>🦘 ${etoiles(d.talents[2])}</div></div></div>`).join('') : '<p>Tu n’as pas encore de dindie !</p>');
    void T;
  };
  $('#lConseil', F.el).onclick = () => {
    pop();
    const C = ['Touche une dindie pour voir sa fiche : tu peux la nourrir, la caresser ou la déplacer.', 'Chaque habitat accueille les dindies de son type. Le Clapier, lui, accueille tout le monde !',
      'Le courrier arrive chaque jour dans la boîte aux lettres, près de ta maison.', 'La nuit, les dindies dorment. Chut !', 'Fais un vœu à la fontaine : on ne sait jamais…',
      'Glisse ton doigt sur l’écran pour te déplacer comme avec un joystick, ou touche l’endroit où aller.',
      'Pour attraper une dindie sauvage : des friandises d’abord (sa préférée compte double), puis le filet quand le cercle blanc passe dans la zone verte !',
      'Chaque jour, des coffres, des œufs mystère et des pierres d’éveil sont cachés dans les îles. Ouvre l’œil !',
      'Une dindie sur 64 naît chromatique ✨ : ses couleurs sont toutes différentes. Une vraie rareté !',
      'Dans la maison, le mode aide rend la capture plus facile.'];
    toast('💡 ' + C[Math.floor(Math.random() * C.length)], { duree: 4500 });
  };
}

/* ── le Grand Livre : 72 pages, avec les silhouettes des espèces pas encore trouvées ── */
export function ouvrirLivre() {
  const L = E().livre, vus = Object.keys(L.vus).length, att = Object.keys(L.attrapes).length;
  let filtre = 'toutes';
  const F = fenetre('📖 Le Grand Livre des Dindies', '', { classe: 'livreJeu', large: true });
  const dessiner = () => {
    const liste = ESPECES.filter(e => filtre === 'toutes' || e.rarete === filtre || e.types.includes(filtre));
    F.contenu.innerHTML = `<p class="compteLivre">👁️ Vues : <b>${vus}</b> · ✅ Attrapées : <b>${att}</b> / 72</p>
      <div class="filtres">${[['toutes', 'Toutes'], ...Object.keys(RARETES).map(k => [k, PASTILLE[k] + ' ' + RARETES[k].nom]), ...ORDRE_TYPES.map(t => [t, TYPES[t].e])].map(([k, t]) => `<button data-f="${k}" class="${k === filtre ? 'on' : ''}">${t}</button>`).join('')}</div>
      <div class="grille">${liste.map(e => {
        const a = L.attrapes[e.id], v = L.vus[e.id];
        return `<button class="case ${e.rarete} ${a ? '' : v ? 'vue' : 'inconnue'}" data-id="${e.id}" style="--rar:${RARETES[e.rarete].couleur}"><span>${e.n}</span>${a ? '<em>✅</em>' : ''}${L.chromas && L.chromas[e.id] ? '<em class="chromaL">✨</em>' : ''}${portraitEsp(e.id, { silhouette: !v })}</button>`;
      }).join('')}</div>`;
    $$('.filtres button', F.contenu).forEach(b => b.onclick = () => { pop(); filtre = b.dataset.f; dessiner(); });
    $$('.case', F.contenu).forEach(b => b.onclick = () => { pop(); pageLivre(b.dataset.id); });
  };
  dessiner();
}
const INDICES = { pres: 'les Prés', maroc: 'le Maroc imaginaire', belgique: 'la Belgique', jungle: 'la Jungle', banquise: 'la Banquise', volcan: 'le Volcan', foret: 'la Forêt de la Lune', nuages: 'le Royaume des Nuages' };
function indice(e) {
  const o = e.origine;
  if (o.sorte === 'sauvage') return `🧭 On la rencontre dans ${INDICES[o.region]}.`;
  if (o.sorte === 'croisement') return `🥚 Elle naît d’un croisement : un parent ${TYPES[o.types[0]].e} et un parent ${TYPES[o.types[1]].e}.`;
  if (o.sorte === 'recette') return `🥚 Une recette secrète : deux espèces précises… ${E().livre.vus[o.especes[0]] ? PAR_ID[o.especes[0]].nom : '???'} et ${E().livre.vus[o.especes[1]] ? PAR_ID[o.especes[1]].nom : '???'}.`;
  const G = Object.values(GQ.GRANDES).find(g => g.mythique === e.id), st = G && GQ.etatGrande(Object.keys(GQ.GRANDES).find(k => GQ.GRANDES[k] === G));
  if (G && (st || J.combien(G.objet))) {
    const cond = GQ.TEXTES_CONDITION[e.id], couple = `${PAR_ID[o.especes[0]].nom} × ${PAR_ID[o.especes[1]].nom}`;
    return st === 'fini' || J.combien(G.objet) ? `🌈 Au nid du Couvoir : ${couple}, avec ${OBJETS[G.objet].e} ${OBJETS[G.objet].nom}${cond ? ', ' + cond : ''}.`
      : `🌈 La légende « ${G.titre} » : ${PERSONNAGES[G.guide].nom} t’aidera à trouver ${OBJETS[G.objet].nom}. Puis, au Couvoir : ${couple}.`;
  }
  return `🌈 Une légende… On parle de « ${o.quete} ».${G && S.etapeAtteinte('parlerPlumeau9') ? ` Attrape ${PAR_ID[G.epique].nom} : ${PERSONNAGES[G.guide].nom} te la racontera.` : ''}`;
}
function pageLivre(id) {
  const e = PAR_ID[id], a = E().livre.attrapes[id], v = E().livre.vus[id], R = RARETES[e.rarete];
  fenetre(v ? e.nom : `N° ${e.n} : ???`, `<div class="pageLivre" style="--rar:${R.couleur}">
    <div class="grandPortrait">${portraitEsp(id, { silhouette: !v })}</div>
    <p><span class="pill rar">${PASTILLE[e.rarete]} ${R.nom}</span> ${v ? e.types.map(t => `<span class="pill">${TYPES[t].e} ${TYPES[t].nom}</span>`).join(' ') : ''}</p>
    ${a ? `<p>${e.desc}</p><p class="cri">« ${e.cri} »</p>${['⚡ Vitesse', '💪 Endurance', '🦘 Saut'].map((t, i) => `<div class="stat"><span>${t}</span>${barre(e.stats[i] / 10, R.couleur)}<b>${e.stats[i]}</b></div>`).join('')}`
      : v ? `<p>Tu l’as déjà vue, mais pas encore attrapée.</p>` : '<p>Tu ne l’as encore jamais vue…</p>'}
    <p class="indice">${indice(e)}</p>${v && regleDe(id) ? `<p class="indice">🔎 ${texteConditions(id, nomObjet)}.</p>` : ''}</div>`);
}

/* ── le Musée : les portraits des espèces attrapées, dans des cadres dorés ── */
export function ouvrirMusee() {
  const att = ESPECES.filter(e => E().livre.attrapes[e.id]);
  fenetre('📖 Le Musée du Grand Livre', `<p class="petitTexte">Chaque espèce que tu attrapes a son portrait ici. Il y a 72 cadres… Combien en rempliras-tu ?</p>
    <div class="musee">${ESPECES.map(e => E().livre.attrapes[e.id] ? `<figure class="cadre ${e.rarete}"><div>${portraitEsp(e.id)}</div><figcaption>${e.nom}</figcaption></figure>`
      : `<figure class="cadre vide"><div><b>?</b></div><figcaption>N° ${e.n}</figcaption></figure>`).join('')}</div>`, { classe: 'museeF', large: true });
  S.evenement('musee');
  if (att.length) toast(`🖼️ ${att.length} portrait${att.length > 1 ? 's' : ''} au Musée !`);
}

/* ── la fiche d'une dindie ── */
export function ouvrirFiche(d, { surChange } = {}) {
  const F = fenetre('', '', { classe: 'fiche' });
  const dessiner = () => {
    const e = PAR_ID[d.espece], R = RARETES[e.rarete], st = stats(d), C = CARACTERES[d.caractere], max = stats({ ...d, niveau: 50 });
    F.titre(`${e.types.map(t => TYPES[t].e).join('')} ${echapper(nomDe(d))}`);
    F.contenu.innerHTML = `<div class="ficheHaut" style="--rar:${R.couleur}"><div class="grandPortrait">${portrait(d)}</div>
      <div><p class="nomEsp">${e.nom} ${d.chroma ? '✨' : ''}</p><p><span class="pill rar">${PASTILLE[e.rarete]} ${R.nom}</span></p>
      <p class="niv">Niveau <b>${d.niveau}</b> <small>${d.niveau < 50 ? `${d.xp} / ${xpPourNiveau(d.niveau)} XP` : 'max'}</small></p>${barre(d.xp / xpPourNiveau(d.niveau), '#3b82f6')}
      <p class="coeurs" title="Bonheur">${'❤️'.repeat(Math.round(d.bonheur / 20))}<i class="eteinte">${'❤️'.repeat(5 - Math.round(d.bonheur / 20))}</i></p></div></div>
      ${['⚡ Vitesse', '💪 Endurance', '🦘 Saut'].map((t, i) => `<div class="stat"><span>${t}</span><div class="barreP double"><i style="width:${max[i]}%"></i><b style="width:${st[i]}%;background:${R.couleur}"></b></div><b>${st[i]}</b><small>${etoiles(d.talents[i])}</small></div>`).join('')}
      <p class="petitTexte">La barre claire : ce qu’elle peut atteindre au niveau 50. Les ⭐ : ses talents.</p>
      <p class="petitTexte">🎭 <b>${C.nom}</b> : ${C.desc}<br>📍 ${lieuTexte(d.lieu)}${E().compagnon === d.uid ? ' · 🐾 te suit partout' : ''}${origineTexte(d) ? '<br>' + origineTexte(d) : ''}
        ${EL.estBebe(d) && d.croissance ? `<br>${d.stade === 'poussin' ? '🐣 Poussin : jeune' : '🐥 Jeune : adulte'} dans <b>${duree(EL.tempsCroissance(d))}</b> (chaque repas : − 3 min)` : ''}
        ${d.stade === 'eveille' ? '<br>🌟 <b>Éveillée</b>' : !EL.peutEveiller(d) ? '<br>🌟 <b>Elle peut s’éveiller au Labo !</b>' : ''}</p>
      <div class="actionsFiche">
        <button class="btn" id="fCaresse">💗 Caresser</button>
        <button class="btn jaune" id="fMiam" ${EL.friandisePour(d) ? '' : 'disabled'}>${EL.friandisePour(d) ? OBJETS[EL.friandisePour(d)].e : '🍪'} Friandise</button>
        ${J.combien('biscuit') && d.niveau < 50 ? `<button class="btn" id="fBiscuit">🍘 Biscuit (${J.combien('biscuit')}) : + 150 XP</button>` : ''}
        <button class="btn" id="fNom">✏️ Renommer</button>
        ${d.lieu === 'equipe' ? `<button class="btn vert" id="fSuivre">${E().compagnon === d.uid ? '🛑 Ne plus suivre' : '🐾 Me suivre'}</button>` : ''}
        ${boutonsFiche(d)}
      </div>
      <p class="petitTitre">Déplacer vers…</p><div class="actionsFiche" id="fDest"></div>${boutonRelacher(d)}`;
    const dest = d.lieu === 'mission' ? [] : (EL.estBebe(d) ? [...(E().batiments.nurserie?.repare ? [['nurserie', '🍼 Nurserie']] : []), ...(E().batiments.clapier.repare ? [['clapier', '🐾 Clapier']] : [])]
      : [['equipe', '🎒 Équipe'], ...(E().batiments.clapier.repare ? [['clapier', '🐾 Clapier']] : []),
      ...ORDRE_ENCLOS.map(([t]) => t).filter(t => E().enclos[t]?.construit && vaDans(d, t)).map(t => ['enclos:' + t, `${TYPES[t].e} ${TYPES[t].habitat}`])]).filter(([l]) => l !== d.lieu);
    $('#fDest', F.el).innerHTML = dest.length ? dest.map(([l, t]) => `<button class="btn petit" data-l="${l}">${t}</button>`).join('') : d.lieu === 'mission' ? '<small>📮 Elle est en mission : elle reviendra au Bureau des missions.</small>' : '<small>Pas d’autre endroit pour l’instant.</small>';
    $$('#fDest button', F.el).forEach(b => b.onclick = () => {
      const err = J.deplacer(d, b.dataset.l);
      if (err) { toast('⚠️ ' + err); return; }
      pop(); toast(`${nomDe(d)} → ${lieuTexte(d.lieu)}`); S.evenement('deplacement', d.uid); surChange && surChange(); dessiner();
    });
    $('#fCaresse', F.el).onclick = () => {
      const t = Date.now();
      if (t - (d.derniereCaresse || 0) < 20000) { toast(`${nomDe(d)} a déjà eu plein de câlins. Reviens dans un moment !`); return; }
      d.derniereCaresse = t; d.bonheur = Math.min(100, d.bonheur + 5); glouglou(1.2); toast(`💗 ${nomDe(d)} adore les câlins !`); J.changer('dindies'); window.dispatchEvent(new CustomEvent('dindie-joie', { detail: d.uid })); dessiner();
    };
    $('#fMiam', F.el).onclick = () => {
      const r = EL.nourrir(d); if (!r) return;
      glouglou(1.1); tada();
      toast(`${OBJETS[r.id].e} Miam ! ${nomDe(d)} se régale${r.pref ? ' : sa friandise préférée !' : ''}${r.gourmande ? ' (deux fois plus, elle est gourmande !)' : ''}${r.bebe ? ' Elle grandit plus vite (− 3 min).' : ''}`, { cle: 'miam' });
      if (r.niv) niveauToast(d, r.niv);
      J.changer('dindies'); window.dispatchEvent(new CustomEvent('dindie-joie', { detail: d.uid }));
      S.evenement('nourrir', d.uid); if (r.bebe) { const ev = EL.majCroissance(); if (ev.length) S.evenement('grandir', ev[0]); } dessiner();
    };
    const bi = $('#fBiscuit', F.el); if (bi) bi.onclick = () => {
      if (!J.retirerObjet('biscuit')) return;
      const niv = EL.donnerXp(d, EL.XP.biscuit); tada(); glouglou(1.2);
      toast(`🍘 + 150 XP pour ${nomDe(d)} !`, { cle: 'biscuit' }); if (niv) niveauToast(d, niv);
      window.dispatchEvent(new CustomEvent('dindie-joie', { detail: d.uid })); dessiner();
    };
    $('#fNom', F.el).onclick = () => renommer(d, dessiner);
    const sv = $('#fSuivre', F.el); if (sv) sv.onclick = () => { pop(); J.choisirCompagnon(E().compagnon === d.uid ? null : d); surChange && surChange(); dessiner(); };
    brancherFiche(F, d, { dessiner, surChange, niveauToast, fermer: () => F.fermer() });
  };
  dessiner();
  return F;
}
function renommer(d, apres) {
  const F = fenetre('✏️ Un nouveau nom', `<div class="renommer"><input id="rNom" maxlength="14" value="${echapper(d.surnom || '')}" placeholder="${echapper(PAR_ID[d.espece].nom)}">
    <button class="btn jaune" id="rDe">🎲 Une idée</button><button class="btn vert" id="rOk">✅ C’est bon</button></div>`);
  const i = $('#rNom', F.el); setTimeout(() => i.focus(), 50);
  $('#rDe', F.el).onclick = () => { pop(); i.value = NOMS_RIGOLOS[Math.floor(Math.random() * NOMS_RIGOLOS.length)]; };
  $('#rOk', F.el).onclick = () => { d.surnom = i.value.trim().slice(0, 14) || null; pop(); J.changer('dindies'); F.fermer(); apres && apres(); };
}

/* ── le Clapier et l'équipe : toutes les dindies, rangées par endroit ── */
export function ouvrirClapier({ surChange } = {}) {
  const F = fenetre('🐾 Mes dindies', '', { classe: 'clapierF', large: true });
  const carte = d => `<button class="carteDindie" data-uid="${d.uid}" style="--rar:${RARETES[PAR_ID[d.espece].rarete].couleur}"><div class="mini">${portrait(d)}</div><b>${echapper(nomDe(d))}</b><small>Niv. ${d.niveau}${E().compagnon === d.uid ? ' · 🐾' : ''}</small></button>`;
  const dessiner = () => {
    const eq = J.equipe(), cl = J.dansClapier();
    let h = `<h3>🎒 Équipe <small>${eq.length}/6</small></h3><div class="rangee">${eq.map(carte).join('') || '<p class="petitTexte">Personne dans ton équipe.</p>'}</div>`;
    h += E().batiments.clapier.repare ? `<h3>🐾 Clapier <small>${cl.length}/${J.placesClapier()}</small></h3><div class="rangee">${cl.map(carte).join('') || '<p class="petitTexte">Le Clapier est vide.</p>'}</div>`
      : '<h3>🐾 Clapier</h3><p class="petitTexte">🚧 Le Clapier est en ruine.</p>';
    const nu = E().dindies.filter(d => d.lieu === 'nurserie');
    if (E().batiments.nurserie?.repare) h += `<h3>🍼 Nurserie <small>${nu.length}/${EL.placesNurserie()}</small></h3><div class="rangee">${nu.map(carte).join('') || '<p class="petitTexte">Pas de bébé.</p>'}</div>`;
    for (const [t] of ORDRE_ENCLOS) if (E().enclos[t]?.construit) h += `<h3>${TYPES[t].e} ${TYPES[t].habitat} <small>${J.dansEnclos(t).length}/${J.placesEnclos(t)}</small></h3><div class="rangee">${J.dansEnclos(t).map(carte).join('') || '<p class="petitTexte">Vide.</p>'}</div>`;
    const mi = E().dindies.filter(d => d.lieu === 'mission');
    if (mi.length) h += `<h3>📮 En mission <small>${mi.length}</small></h3><div class="rangee">${mi.map(carte).join('')}</div>`;
    if (E().batiments.clapier.repare) h += `<h3>⬆️ Le Clapier</h3>${blocAmeliorer('clapier')}`;
    F.contenu.innerHTML = h;
    brancherAmeliorer(F.contenu, () => { dessiner(); surChange && surChange(); });
    $$('.carteDindie', F.contenu).forEach(b => b.onclick = () => { pop(); ouvrirFiche(J.parUid(b.dataset.uid), { surChange: () => { dessiner(); surChange && surChange(); } }); });
  };
  dessiner();
  return F;
}
/* un enclos : ses habitantes, ranger une dindie ici, ramasser les plumes du jour, l'améliorer (ou le construire) */
export function ouvrirEnclos(type, { surChange } = {}) {
  const T = TYPES[type];
  const F = fenetre(`${T.e} ${T.habitat}`, '', { classe: 'enclosF' });
  const dessiner = () => {
    if (!E().enclos[type]?.construit) {
      F.contenu.innerHTML = `<p>🚧 Cet enclos est en ruine. Une fois construit, les dindies <b>${T.e} ${T.nom}</b> pourront y vivre.</p>
        ${PR.productionOuverte() ? `<div class="ligneBtn"><button class="btn grand vert" id="eConstruire">🔨 Le construire</button></div>` : '<p class="petitTexte">On le reconstruira plus tard dans l’histoire.</p>'}`;
      const c = $('#eConstruire', F.contenu); if (c) c.onclick = async () => { pop(); if (await proposerHabitat(type)) { tada(); toast(`🔨 ${T.habitat} est construit !`, { classe: 'grand' }); surChange && surChange('habitat', type); dessiner(); } };
      return;
    }
    const ici = J.dansEnclos(type), candidates = E().dindies.filter(d => d.lieu !== 'enclos:' + type && d.lieu !== 'mission' && vaDans(d, type));
    const pl = PR.plumesAPrendre(type), deja = PR.prod().ramassage[type] === jourJ();
    F.contenu.innerHTML = `<p class="petitTexte">L’habitat des dindies ${T.e} <b>${T.nom}</b>. Places : ${ici.length}/${J.placesEnclos(type)}.</p>
      ${PR.productionOuverte() ? `<div class="plumesEnclos">${pl ? `<span>🪶 <b>${pl} plume${pl > 1 ? 's' : ''} ${T.e}</b> à ramasser !</span><button class="btn jaune" id="ePlumes">🪶 Ramasser</button>`
        : deja ? '<span>✅ Plumes du jour ramassées. Reviens demain !</span>' : `<span>🪶 Installe des dindies adultes ici : chaque jour, elles laissent des plumes ${T.e}.</span>`}<small>Tu as ${PR.plumes(type)} plume${PR.plumes(type) > 1 ? 's' : ''} ${T.e}.</small></div>` : ''}
      <div class="rangee">${ici.map(d => `<button class="carteDindie" data-uid="${d.uid}"><div class="mini">${portrait(d)}</div><b>${echapper(nomDe(d))}</b><small>Niv. ${d.niveau}</small></button>`).join('') || '<p class="petitTexte">Personne n’y vit encore.</p>'}</div>
      ${candidates.length ? `<p class="petitTitre">Installer ici :</p><div class="rangee">${candidates.map(d => `<button class="carteDindie installer" data-uid="${d.uid}"><div class="mini">${portrait(d)}</div><b>${echapper(nomDe(d))}</b><small>➕ Installer</small></button>`).join('')}</div>` : ''}
      ${blocAmeliorer('enclos', type)}`;
    $$('.carteDindie:not(.installer)', F.contenu).forEach(b => b.onclick = () => { pop(); ouvrirFiche(J.parUid(b.dataset.uid), { surChange: () => { dessiner(); surChange && surChange(); } }); });
    $$('.installer', F.contenu).forEach(b => b.onclick = () => {
      const d = J.parUid(b.dataset.uid), err = J.deplacer(d, 'enclos:' + type);
      if (err) { toast('⚠️ ' + err); return; }
      tada(); toast(`🏡 ${nomDe(d)} s’installe dans ${T.habitat} !`); S.evenement('deplacement', d.uid); surChange && surChange(); dessiner();
    });
    const bp = $('#ePlumes', F.contenu); if (bp) bp.onclick = () => {
      const premiere = !PR.prod().stats.plumes, k = PR.ramasserPlumes(type); if (!k) return;
      tada(); toast(`🪶 + ${k} plume${k > 1 ? 's' : ''} ${T.e} ${T.nom} !${premiere ? ` (dont ${PR.BONUS_PREMIERES_PLUMES} en cadeau : tes premières plumes !)` : ''}`, { classe: 'grand', cle: 'plumes', duree: 3400 }); surChange && surChange('plumes', type); dessiner();
    };
    brancherAmeliorer(F.contenu, () => { surChange && surChange('enclos', type); dessiner(); });
  };
  dessiner();
  return F;
}
const jourJ = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };

/* ── le sac ── */
export function ouvrirSac({ decorer } = {}) {
  const inv = Object.entries(E().inventaire).filter(([id, q]) => q > 0 && OBJETS[id]);
  const imp = inv.filter(([id]) => OBJETS[id]?.important), autres = inv.filter(([id]) => !OBJETS[id]?.important);
  const filet = meilleurFilet(E().inventaire);
  const chap = Object.entries(PR.prod().chapeaux).filter(([id, k]) => k > 0 && CHAPEAUX[id]), decos = Object.entries(PR.prod().decorations).filter(([id, k]) => k > 0 && DECORATIONS[id]);
  const ligne = ([id, q]) => `<div class="article"><span class="em">${OBJETS[id].e}</span><div><b>${OBJETS[id].nom}${q > 1 ? ' × ' + q : ''}${id === filet ? ' · <i class="pill">utilisé</i>' : ''}</b><small>${OBJETS[id].desc}</small></div></div>`;
  const F = fenetre('🎒 Mon sac', `<p class="bourse">🪙 <b>${E().pieces}</b> pièces · 🪶 <b>${E().plumesOr}</b> plume${E().plumesOr > 1 ? 's' : ''} d’or</p>
    ${imp.length ? `<h3>⭐ Objets importants</h3>${imp.map(ligne).join('')}` : ''}<h3>🧺 Objets</h3>${autres.map(ligne).join('') || '<p class="petitTexte">Ton sac est vide.</p>'}
    ${PR.productionOuverte() ? `<h3>🪶 Les plumes</h3>${plumesHtml()}${chap.length ? `<h3>🎩 Les chapeaux (pas encore portés)</h3><p class="petitTexte">${chap.map(([id, k]) => `${CHAPEAUX[id].e} ${CHAPEAUX[id].nom}${k > 1 ? ' × ' + k : ''}`).join(' · ')}</p>` : ''}
      ${decos.length ? `<h3>🌷 Les décorations à poser</h3><p class="petitTexte">${decos.map(([id, k]) => `${DECORATIONS[id].e} ${DECORATIONS[id].nom}${k > 1 ? ' × ' + k : ''}`).join(' · ')}</p>${decorer ? '<div class="ligneBtn"><button class="btn jaune" id="sDecorer">🎨 Décorer le Domaine</button></div>' : ''}` : ''}` : ''}`);
  const sd = $('#sDecorer', F.el); if (sd) sd.onclick = () => { pop(); F.fermer(); decorer(); };
}

/* ── le journal des quêtes ── */
export function ouvrirJournal() {
  const e = E(), cur = S.queteDe(e.quete.etape);
  const chap = cur ? cur.chapitre : Math.max(...QUETES.map(q => q.chapitre)) + 1;
  let h = '';
  for (const [n, titre] of Object.entries(CHAPITRES)) {
    if (+n > chap) { h += `<p class="chapitre verrou">🔒 Chapitre ${n} : ${+n === chap + 1 ? titre + ' (bientôt !)' : '???'}</p>`; break; }
    const QQ = QUETES.filter(Q => Q.chapitre === +n), fini = QQ.length && QQ.every(Q => e.quete.finies.includes(Q.id));
    /* un chapitre fini se replie (on le rouvre d'un toucher) */
    h += (fini ? `<details class="chapFini"><summary class="chapitre">✅ Chapitre ${n} : ${titre} <small>(${QQ.length} quêtes)</small></summary>` : `<p class="chapitre">Chapitre ${n} : ${titre}</p>`) + QQ.map(Q => {
      const finie = e.quete.finies.includes(Q.id), active = cur && cur.id === Q.id;
      if (!finie && !active) return `<div class="quete verrou">🔒 ???</div>`;
      return `<div class="quete ${finie ? 'finie' : 'active'}"><b>${finie ? '✅' : '📜'} ${Q.titre}</b>${active ? `<p>➡️ ${S.texteEtape()}</p>` : ''}
        <small>Récompense : ${Q.recompense.pieces || 0} 🪙${Q.recompense.plumesOr ? ' + ' + Q.recompense.plumesOr + ' 🪶' : ''}${Object.keys(Q.recompense.objets || {}).map(o => ' + ' + OBJETS[o].e).join('')}</small></div>`;
    }).join('') + (fini ? '</details>' : '');
    if (!QQ.length) h += '<div class="quete active"><b>🏁 Bientôt !</b><p>Ce chapitre arrive à la prochaine étape du jeu.</p></div>';
  }
  if (S.etapeAtteinte('parlerPlumeau9')) h += `<p class="chapitre">🌈 Les grandes quêtes</p>` + GQ.ORDRE_GRANDES.map(id => {
    const G = GQ.GRANDES[id], st = GQ.etatGrande(id), R = REGIONS[G.region], O = OBJETS[G.objet];
    if (!GQ.grandeOuverte(id)) return `<div class="quete verrou">🔒 ${R.e} ${G.titre} : attrape d’abord ${PAR_ID[G.epique].nom}</div>`;
    const t = st === 'fini' ? `${O.e} ${O.nom} : au Couvoir, avec ${PAR_ID[PAR_ID[G.mythique].origine.especes[0]].nom} × ${PAR_ID[PAR_ID[G.mythique].origine.especes[1]].nom}`
      : st === 'rapporter' ? `Rapporte les 3 ${G.pluriel} à ${PERSONNAGES[G.guide].nom}`
      : st === 'fragments' ? `Les ${G.pluriel}, dans ${INDICES[G.region]} : ${GQ.fragmentsTrouves(id)}/3`
      : `Va écouter la légende de ${PERSONNAGES[G.guide].nom}, dans ${INDICES[G.region]}`;
    return `<div class="quete ${st === 'fini' ? 'finie' : 'active'}"><b>${st === 'fini' ? '✅' : '📜'} ${R.e} ${G.titre}</b><p>➡️ ${t}</p></div>`;
  }).join('');
  if (QD.qd().etape || QD.qd().finies.length) h += `<p class="chapitre">🏡 Les quêtes du Domaine</p>` + QD.QUETES_DOMAINE.map(Q => {
    const st = QD.etatQuete(Q), r = Q.recompense;
    if (st === 'verrou') return `<div class="quete verrou">🔒 ???</div>`;
    return `<div class="quete ${st}"><b>${st === 'finie' ? '✅' : '📜'} ${Q.titre}</b>${st === 'active' ? `<p>➡️ ${QD.texte(S.lieuActuelId())}</p>` : ''}
      <small>Récompense : ${r.pieces} 🪙${r.plumesOr ? ' + ' + r.plumesOr + ' 🪶' : ''}${Object.keys(r.objets || {}).map(o => ' + ' + OBJETS[o].e).join('')}${r.plumes ? ' + des plumes' : ''}</small></div>`;
  }).join('');
  /* en haut : les défis du jour et les succès (étape 8) */
  const nb = DF.aReclamer();
  h = `<div class="ligneBtn journalHaut"><button class="btn petit jaune" data-pan="defis">📅 Les défis${nb ? ` <i class="pastille">${nb}</i>` : ''}</button><button class="btn petit jaune" data-pan="succes">🏆 ${SU.nbObtenus()} / ${SU.SUCCES.length} succès</button></div>` + h;
  const F = fenetre('📜 Journal des quêtes', h);
  $$('[data-pan]', F.el).forEach(b => b.onclick = () => { pop(); F.fermer(); ouvrirPanneau({ onglet: b.dataset.pan, journal: ouvrirJournal }); });
}

/* ── la carte du lieu où l'on est (on peut toucher un endroit pour y aller) ── */
export function ouvrirCarte({ titre, forme, a, b, lieux, position, cible, allerA }) {
  const W = 120, H = Math.round(120 * b / a), X = x => (x + a * 1.18) / (a * 2.36) * W, Z = z => (z + b * 1.18) / (b * 2.36) * H;
  let contour = '';
  for (let k = 0; k <= 120; k++) { const th = k / 120 * Math.PI * 2; let lo = .3, hi = 1.6; for (let it = 0; it < 22; it++) { const m = (lo + hi) / 2; if (forme(Math.cos(th) * a * m, Math.sin(th) * b * m) < 1) lo = m; else hi = m; } contour += (k ? 'L' : 'M') + X(Math.cos(th) * a * lo).toFixed(1) + ' ' + Z(Math.sin(th) * b * lo).toFixed(1); }
  const pts = lieux.map((l, i) => `<g class="lieuCarte" data-i="${i}"><circle cx="${X(l.x)}" cy="${Z(l.z)}" r="5.2" fill="#fff" stroke="#b45309" stroke-width=".8"/><text x="${X(l.x)}" y="${Z(l.z) + 2}" font-size="6" text-anchor="middle">${l.e}</text></g>`).join('');
  const F = fenetre(titre, `<svg class="carteSvg" viewBox="0 0 ${W} ${H}"><rect width="${W}" height="${H}" fill="#5fd0f3"/><path d="${contour}Z" fill="#8fd16a" stroke="#f3dfa2" stroke-width="2"/>
    ${pts}${cible ? `<text x="${X(cible[0])}" y="${Z(cible[1]) - 5}" font-size="7" text-anchor="middle">⭐</text>` : ''}
    <circle cx="${X(position[0])}" cy="${Z(position[1])}" r="2.6" fill="#ea580c" stroke="#fff" stroke-width="1"/></svg>
    <p class="petitTexte">● C’est toi. ⭐ C’est là que t’attend ta quête. Touche un lieu pour y aller !</p><div id="cLieu" class="petitTexte"></div>`, { large: true });
  $$('.lieuCarte', F.el).forEach(g => g.onclick = () => {
    const l = lieux[+g.dataset.i]; pop();
    $('#cLieu', F.el).innerHTML = `<b>${l.e} ${l.nom}</b> <button class="btn petit vert" id="cAller">🚶 Y aller</button>`;
    $('#cAller', F.el).onclick = () => { F.fermer(); allerA(l.x, l.z + (l.x === 0 && l.z === 0 ? 4 : 0)); };
  });
}

/* ── la Maison : sauvegarde (code, fichier), profils, réglages ── */
export function ouvrirMaison({ appliquerReglages, changerProfil, idProfil }) {
  const r = E().reglages;
  const F = fenetre('🏠 Ma maison', `
    <h3>⚙️ Réglages</h3>
    <label class="reglage"><input type="checkbox" id="mSon" ${r.son ? 'checked' : ''}> 🔊 Les sons</label>
    <label class="reglage"><input type="checkbox" id="mMus" ${r.musique ? 'checked' : ''}> 🎵 La musique</label>
    <label class="reglage"><input type="checkbox" id="mVoix" ${r.voix ? 'checked' : ''}> 🗣️ La voix lit les dialogues</label>
    <label class="reglage"><input type="checkbox" id="mAide" ${r.aide ? 'checked' : ''}> 🧸 Mode aide : la capture est plus facile</label>
    <label class="reglage">🕐 L’heure du jeu :
      <select id="mHeure"><option value="vraie">la vraie heure</option><option value="jour">toujours le jour</option><option value="nuit">toujours la nuit</option></select></label>
    <h3>💾 Sauvegarde</h3>
    <p class="petitTexte">Le jeu se sauvegarde tout seul sur cet appareil. Pour ne jamais perdre ta partie (ou la continuer ailleurs), garde ton <b>code de sauvegarde</b>.</p>
    <div class="ligneBtn"><button class="btn" id="mCode">📋 Voir mon code</button><button class="btn jaune" id="mFichier">⬇️ Télécharger</button></div>
    <textarea id="mZone" class="cache" rows="4" readonly></textarea>
    <div class="ligneBtn"><button class="btn vert" id="mCharger">📥 Charger un code</button><label class="btn jaune">📂 Charger un fichier<input type="file" id="mFile" accept=".txt" hidden></label></div>
    <h3>👤 Profil</h3>
    <p class="petitTexte">Tu joues avec le profil <b>${echapper(E().profil.nom)}</b>.</p>
    <button class="btn" id="mProfil">👥 Changer de profil</button>
    <h3>🎵 Crédits</h3><div class="ligneBtn"><button class="btn petit" id="mCredits">🎶 Les musiques du jeu</button><button class="btn petit" id="mPrologue">🌙 Revoir le prologue</button>${S.etapeAtteinte('fin') ? '<button class="btn petit jaune" id="mGenerique">🌈 Revoir le générique</button>' : ''}</div>`);
  $('#mHeure', F.el).value = r.heure;
  const maj = () => { r.son = $('#mSon', F.el).checked; r.musique = $('#mMus', F.el).checked; r.voix = $('#mVoix', F.el).checked; r.aide = $('#mAide', F.el).checked; r.heure = $('#mHeure', F.el).value; appliquerReglages(); J.changer('reglages'); };
  ['#mSon', '#mMus', '#mVoix', '#mAide', '#mHeure'].forEach(s => $(s, F.el).onchange = maj);
  $('#mCredits', F.el).onclick = () => { pop(); credits(); };
  $('#mPrologue', F.el).onclick = () => { pop(); F.fermer(); import('../scenes/titre.js').then(m => m.prologue()); };
  const gen = $('#mGenerique', F.el); if (gen) gen.onclick = () => { pop(); F.fermer(); import('./generique.js').then(m => m.ouvrirGenerique()); };
  $('#mCode', F.el).onclick = () => {
    const z = $('#mZone', F.el), c = SAUVE.exporterCode(E());
    z.classList.remove('cache'); z.value = c; z.select();
    try { navigator.clipboard.writeText(c).then(() => toast('📋 Code copié !')); } catch { /* le texte reste à copier à la main */ }
  };
  $('#mFichier', F.el).onclick = () => { SAUVE.telecharger(E(), 'royaume-' + E().profil.nom); toast('⬇️ Fichier téléchargé !'); };
  const charger = texte => {
    try {
      const nouveau = J.migrer(SAUVE.importerCode(texte));
      if (!confirm(`Charger la partie de « ${nouveau.profil.nom} » (${nouveau.dindies.length} dindies) ? La partie actuelle de ce profil sera remplacée.`)) return;
      SAUVE.sauverProfil(idProfil(), nouveau); location.reload();
    } catch (err) { toast('⚠️ ' + err.message, { duree: 4000 }); }
  };
  $('#mCharger', F.el).onclick = () => { const c = prompt('Colle ton code de sauvegarde (il commence par RD1-) :'); if (c) charger(c); };
  $('#mFile', F.el).onchange = ev => { const f = ev.target.files[0]; if (!f) return; f.text().then(charger); };
  $('#mProfil', F.el).onclick = () => { fermerTout(); changerProfil(); };
}

/* ── le choix de la première dindie ── */
export function choisirStarter() {
  return new Promise(resoudre => {
    let choisie = null;
    const F = fenetre('🥚 Choisis ta première dindie !', `<p class="petitTexte">Elles ont toutes besoin d’une amie. Touche celle que tu préfères :</p>
      <div class="starters">${S.STARTERS.map(id => { const e = PAR_ID[id], T = TYPES[e.types[0]]; return `<button class="starter" data-id="${id}" style="--t:${T.couleur}">
        <div class="grandPortrait">${portraitEsp(id)}</div><b>${e.nom}</b><span class="pill">${T.e} ${T.nom}</span><small>${e.desc}</small>
        <small>⚡ ${e.stats[0]} · 💪 ${e.stats[1]} · 🦘 ${e.stats[2]}</small></button>`; }).join('')}</div>
      <div id="sNom" class="cache renommer"><p>Comment veux-tu l’appeler ?</p><input id="sInput" maxlength="14"><button class="btn jaune" id="sDe">🎲</button><button class="btn vert grand" id="sOk">✅ C’est elle !</button></div>`,
      { classe: 'starterF', large: true, surFermer: () => resoudre(choisie) });
    $$('.starter', F.el).forEach(b => b.onclick = () => {
      $$('.starter', F.el).forEach(x => x.classList.toggle('choisi', x === b)); glouglou(1.25);
      $('#sNom', F.el).classList.remove('cache'); const i = $('#sInput', F.el);
      if (!i.value) i.value = NOMS_RIGOLOS[Math.floor(Math.random() * NOMS_RIGOLOS.length)];
      F.el.dataset.choix = b.dataset.id;
    });
    $('#sDe', F.el).onclick = () => { pop(); $('#sInput', F.el).value = NOMS_RIGOLOS[Math.floor(Math.random() * NOMS_RIGOLOS.length)]; };
    $('#sOk', F.el).onclick = () => { choisie = { espece: F.el.dataset.choix, surnom: $('#sInput', F.el).value.trim().slice(0, 14) || null }; F.fermer(); };
  });
}

/* ── le courrier du jour et la fontaine aux vœux ── */
const aujourdhui = () => new Date().toISOString().slice(0, 10);
const LETTRES = [
  ['Professeur Plumeau', 'Savais-tu que les dindies font la roue pour dire « je suis contente » ? Voici un petit quelque chose pour ton Domaine !'],
  ['Mimi', 'Coucou ! J’ai trop de friandises à la boutique, je t’en envoie une. Bisous !'],
  ['Capitaine Zéphyr', 'Le vent m’a soufflé que tu faisais du bon travail. Continue, exploratrice !'],
  ['Coach Ginette', 'Une, deux ! Une dindie heureuse court plus vite. N’oublie pas les câlins !'],
  ['Gontran', 'Ha ! Moi j’ai déjà… bon, d’accord, je n’ai qu’une dindie aussi. Tiens, une pièce. Gloup gloup.']
];
export function courrier() {
  const e = E();
  if (e.quotidien.courrier === aujourdhui()) { fenetre('📬 Le courrier', '<p>La boîte aux lettres est vide. Le facteur repasse demain !</p>'); return; }
  e.quotidien.courrier = aujourdhui();
  const [de, msg] = LETTRES[Math.floor(Math.random() * LETTRES.length)];
  J.gagnerPieces(50); J.ajouterObjet('friandise');
  /* à partir du chapitre 3, parfois un sablier ou un biscuit en plus */
  const bonus = S.etapeAtteinte('parlerPlumeau3') ? (Math.random() < .3 ? 'sablier' : Math.random() < .4 ? 'biscuit' : null) : null;
  if (bonus) J.ajouterObjet(bonus);
  tada();
  fenetre('📬 Du courrier !', `<div class="lettre"><p>${msg}</p><p class="signature">— ${de}</p></div><p class="bourse">🎁 + 50 🪙 et 🍪 1 friandise${bonus ? ` et ${OBJETS[bonus].e} 1 ${OBJETS[bonus].nom.toLowerCase()}` : ''}</p>`);
}
export function voeu(effet) {
  const e = E();
  if (!J.depenser(1)) { toast('Il faut une pièce pour faire un vœu !'); return; }
  effet();
  if (e.quotidien.voeu !== aujourdhui()) { e.quotidien.voeu = aujourdhui(); e.plumesOr++; J.changer('pieces'); toast('✨ Ton vœu brille… Une <b>plume d’or</b> 🪶 tombe dans ta main !', { duree: 3500 }); return; }
  const V = ['Plouf ! Ton vœu est parti dans l’eau…', 'La fontaine fait des bulles. C’est bon signe !', 'Un poisson te fait un clin d’œil.', 'Tu entends un tout petit glouglou au fond de l’eau…'];
  toast('⛲ ' + V[Math.floor(Math.random() * V.length)]);
}

/* ── les crédits des musiques (toutes libres : voir musique/CREDITS.md) ── */
export function credits() {
  fenetre('🎶 Les musiques', `<p class="petitTexte">Toutes les musiques du jeu sont libres. Merci à leurs auteurs !</p>
    <h3>Domaine public</h3><p>• <b>Searchlight Rag</b> — Scott Joplin (1907)<br>• <b>Something Doing Rag</b> — Scott Joplin et Scott Hayden (1903)<br>• <b>Das Alpenhorn</b> (orgue de foire) — air traditionnel<br>• <b>El Capitan</b> (orgue de foire) — John Philip Sousa (1896)<br>• <b>Unter dem Doppeladler</b> (orgue de foire) — Josef Franz Wagner (1893)<br><small>Versions du projet libre <b>OpenRCT2 OpenMusic</b>.</small></p>
    <h3>CC BY-SA 3.0</h3><p>• <b>Harvest Festival</b>, <b>Albian Nocturne</b>, <b>Solstice Festival</b>, <b>Mountain Idyll</b>, <b>Peaks of Atlas</b>, <b>Mirage</b>, <b>Water’s Edge</b><br>
    <small>Musique d’<b>Omri Lahav</b> pour le jeu libre <b>0 A.D.</b>, © Wildfire Games (wildfiregames.com), licence Creative Commons Attribution - Partage dans les mêmes conditions 3.0. Converties en MP3, volume égalisé.</small></p>
    <p class="petitTexte">Le détail est dans le fichier <code>musique/CREDITS.md</code> du jeu.</p>`);
}
/* « un chapeau de soleil », « un parapluie »… */
export const nomObjet = id => ({ filet: 'un filet', chapeauSoleil: 'un chapeau de soleil 👒', parapluie: 'un parapluie ☂️' })[id] || (OBJETS[id] ? OBJETS[id].nom : id);

/* ── la fin d'un chapitre ── */
export function finChapitre(n) {
  /* on attend que la carte de la dindie attrapée (ou un dialogue) soit fermée */
  if (fenetreOuverte() || enDialogue()) { setTimeout(() => finChapitre(n), 600); return; }
  tada();
  const T = {
    1: ['🎉 Fin du chapitre 1 !', '🏡🦃🎈', 'Tu as réparé le Domaine, adopté tes premières dindies et réparé la montgolfière du Capitaine Zéphyr. Bravo, exploratrice !',
      '<b>Le chapitre 2 commence : l’expédition !</b> Va voir le Capitaine Zéphyr au port : direction les Prés, où vivent des dindies sauvages.'],
    2: ['🎉 Fin du chapitre 2 !', '🌿🏜️💧', `Les Prés, le Maroc imaginaire, la Belgique : tu as attrapé les dindies de 3 îles, et même le Coquelicot, la Dinde Dingue et l’Atomium !`,
      '<b>Le chapitre 3 commence : le premier œuf !</b> Va raconter ton expédition au Professeur Plumeau : le Couvoir, la Nurserie et les croisements t’attendent.'],
    3: ['🎉 Fin du chapitre 3 !', '🥚🐣🌟', 'Le Couvoir, la Nurserie, ton premier hybride et ta première dindie éveillée : tu es une vraie éleveuse !',
      '<b>Le chapitre 4 commence : le Dindodrome ouvre !</b> Va voir le Professeur Plumeau : il a une grande nouvelle.'],
    4: ['🎉 Fin du chapitre 4 !', '🍀☀️💧🌴', 'Quatre badges, et Gontran battu deux fois : tu es une vraie championne du Dindodrome !',
      '<b>Le chapitre 5 commence : la Jungle et la Banquise !</b> Va voir le Professeur Plumeau : une lettre est arrivée pour toi.'],
    5: ['🎉 Fin du chapitre 5 !', '🌴❄️🏆', 'La Jungle, la Banquise, le Dindojaguar, le Dindocristal… et le Badge Flocon ! Ton Grand Livre se remplit à toute vitesse.',
      '<b>Le chapitre 6 commence : le Volcan et la Forêt de la Lune !</b> Va voir le Professeur Plumeau : Madame Lava a besoin de toi.'],
    6: ['🎉 Fin du chapitre 6 !', '🔥🌙🏆', 'Le Volcan, la Forêt de la Lune, le Dindomagma, la Dindétoile… et deux badges de plus !',
      '<b>Le chapitre 7 commence : le Royaume des Nuages !</b> Va voir le Professeur Plumeau : il a vu une île au-dessus des nuages.'],
    7: ['🎉 Fin du chapitre 7 !', '☁️🌈🦃', 'Huit îles, huit badges… et ta première dindie mythique ! Tu es devenue une légende du Royaume.',
      '<b>Le chapitre 8 commence : la Légende !</b> Va voir le Professeur Plumeau : il a lu la dernière page du vieux livre…']
  }[n];
  if (!T) return;
  const F = fenetre(T[0], `<div class="finChap"><p class="grosEmoji">${T[1]}</p><p>${T[2]}</p><p>${T[3]}</p>
    <p class="petitTexte">${n === 7 ? 'En attendant : finis les 7 grandes quêtes pour faire naître toutes les mythiques, et complète ton Grand Livre (72 pages !).' : n === 5 || n === 6 ? 'Pense aux quêtes du Domaine 🏡 et aux missions : elles rapportent des plumes, des pièces et parfois un œuf épique !' : n === 4 ? 'En attendant : bats tes records, gagne des courses libres, entraîne tes dindies au maximum et apprends-leur de nouvelles compétences !' : n === 3 ? 'En attendant : croise tes dindies pour remplir le Grand Livre (28 hybrides et 4 recettes secrètes !), et cherche les chromatiques ✨.' : 'En attendant : explore les îles chaque jour (coffres, œufs mystère, pierres d’éveil), prends soin de tes dindies et cherche les chromatiques ✨ !'}</p>
    <button class="btn grand vert" id="finOk">Super !</button></div>`, { classe: 'finChapF' });
  $('#finOk', F.el).onclick = () => { pop(); F.fermer(); };
}

/* « Plumette passe au niveau 12 ! » */
export function niveauToast(d, niv) { toast(`⬆️ <b>${echapper(nomDe(d))}</b> passe au niveau <b>${niv.apres}</b> !`, { duree: 3200, classe: 'grand', cle: 'niveau' }); }
