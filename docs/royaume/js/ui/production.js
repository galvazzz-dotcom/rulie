/* ══════════ LES FENÊTRES DE LA PRODUCTION ══════════
   Le Potager, le Moulin, l'Atelier des plumes (chapeaux, décorations), le Bureau des missions,
   les réparations, les améliorations, et les petits morceaux de la fiche d'une dindie
   (son chapeau, les friandises du Moulin, rendre à la nature). */
import { PAR_ID } from '../donnees/especes.js';
import { TYPES, RARETES, ORDRE_TYPES } from '../donnees/types.js';
import { GRAINES, ORDRE_GRAINES, RECETTES, CHAPEAUX, FORMES_CHAPEAUX, DECORATIONS, PRIX_REPARATION, PRIX_HABITAT } from '../donnees/production.js';
import { portraitDindie } from '../dindies/portrait.js';
import { PERSONNAGES, portraitChibi } from '../personnages/chibi.js';
import { fenetre, toast, $, $$, echapper, barre, dialogue } from '../moteur/ui.js';
import { pop, tada, glouglou } from '../moteur/sons.js';
import * as J from '../jeu/etat.js';
import * as PR from '../jeu/production.js';
import { OBJETS } from '../jeu/objets.js';
import { nomDe, adnDe, stats } from '../jeu/individus.js';
import { estAdulte } from '../jeu/elevage.js';
import { duree } from './elevage.js';

const E = () => J.etat();
let n = 0;
const portrait = (d, opts = {}) => portraitDindie(adnDe(d), { id: 'PR' + (n++), ...opts });
const STATS = ['⚡ Vitesse', '💪 Endurance', '🦘 Saut'];
const moi = () => ({ nom: 'Roullieee', portrait: portraitChibi(PERSONNAGES.roullieee, 'dlgmoi'), couleur: PERSONNAGES.roullieee.couleur });
/* un prix : « 4 🌿 + 20 🪙 » (en rouge ce qui manque) */
export const prixTexte = c => [...Object.entries(c.plumes || {}).map(([t, k]) => `<span class="${PR.plumes(t) < k ? 'manque' : ''}">${k}&nbsp;🪶${TYPES[t].e}</span>`),
  c.pieces ? `<span class="${E().pieces < c.pieces ? 'manque' : ''}">${c.pieces}&nbsp;🪙</span>` : '', c.plumesOr ? `<span class="${E().plumesOr < c.plumesOr ? 'manque' : ''}">${c.plumesOr}&nbsp;🪶 d’or</span>` : ''].filter(Boolean).join(' + ');
/* les plumes qu'on a, type par type */
export const plumesHtml = () => `<div class="plumesBarre">${ORDRE_TYPES.map(t => `<span class="${PR.plumes(t) ? '' : 'zero'}" title="Plumes ${TYPES[t].nom}">🪶${TYPES[t].e}<b>${PR.plumes(t)}</b></span>`).join('')}</div>`;

/* ── réparer un bâtiment de la production (on demande d'abord) ── */
export async function proposerReparation(id) {
  const prix = PRIX_REPARATION[id], nom = PR.PRODUCTION[id];
  const c = await dialogue([{ qui: moi(), texte: `${nom.charAt(0).toUpperCase() + nom.slice(1)} est en ruine… Avec ${prix} 🪙 de planches et de peinture, on pourrait le réparer !`, choix: [['oui', `🔨 Réparer (${prix} 🪙)`], ['non', '⏳ Plus tard']] }]);
  if (c !== 'oui') return false;
  const err = PR.reparer(id);
  if (err) { toast('⚠️ ' + err, { duree: 3200 }); return false; }
  return true;
}
/* construire un habitat (un enclos en ruine) */
export async function proposerHabitat(type) {
  const T = TYPES[type];
  const c = await dialogue([{ qui: moi(), texte: `${T.habitat.charAt(0).toUpperCase() + T.habitat.slice(1)} est en ruine. Le construire pour ${PRIX_HABITAT} 🪙 ? Les dindies ${T.e} ${T.nom} pourront y vivre !`, choix: [['oui', `🔨 Construire (${PRIX_HABITAT} 🪙)`], ['non', '⏳ Plus tard']] }]);
  if (c !== 'oui') return false;
  const err = PR.construireHabitat(type);
  if (err) { toast('⚠️ ' + err, { duree: 3200 }); return false; }
  return true;
}

/* ── le bloc « améliorer » d'un bâtiment (cle : enclos, clapier, couvoir, nurserie, potager, missions) ── */
export function blocAmeliorer(cle, type = null) {
  if (!PR.productionOuverte()) return '';
  const A = PR.prochaineAmelioration(cle, type), niv = PR.niveauDe(cle, type);
  if (!A) return `<div class="ameliorer max">⭐ Niveau ${niv} : le maximum !</div>`;
  const err = PR.peutAmeliorer(cle, type);
  return `<div class="ameliorer"><div><b>⬆️ Niveau ${niv} → ${A.niveau}</b><small>${A.avant} → <b>${A.effet}</b></small></div>
    <button class="btn petit jaune" data-ameliorer="${cle}" data-type="${type || ''}" ${err ? 'disabled' : ''}>⬆️ ${prixTexte(A.cout)}</button></div>`;
}
export function brancherAmeliorer(racine, apres) {
  $$('[data-ameliorer]', racine).forEach(b => b.onclick = () => {
    const cle = b.dataset.ameliorer, type = b.dataset.type || null, err = PR.ameliorer(cle, type);
    if (err) { toast('⚠️ ' + err); return; }
    tada(); toast(`⬆️ Amélioré : ${PR.prochaineAmelioration(cle, type) ? '' : '(niveau max !) '}${AMEL_TEXTE(cle, type)}`, { duree: 3000, classe: 'grand' });
    apres && apres(cle, type);
  });
}
const AMEL_TEXTE = (cle, type) => { const n = PR.niveauDe(cle, type); return ({ enclos: `${TYPES[type]?.habitat} : niveau ${n}`, clapier: `le Clapier : ${n} rangée${n > 1 ? 's' : ''}`, couvoir: `le Couvoir : ${n + 1} couveuses`, nurserie: `la Nurserie : ${4 + 2 * n} places`, potager: `le Potager : ${2 + 2 * n} parcelles`, missions: `le Bureau : ${n} missions à la fois` })[cle]; };

/* ══════════ le Potager ══════════ */
export function ouvrirPotager({ surChange } = {}) {
  let minuteur = null, choix = null;
  const F = fenetre('🥕 Le Potager', '', { classe: 'potagerF', large: true, surFermer: () => clearInterval(minuteur) });
  const dessiner = () => {
    const P = PR.prod(), graines = ORDRE_GRAINES.filter(g => J.combien(GRAINES[g].graine) > 0);
    F.contenu.innerHTML = `<p class="petitTexte">Plante une graine : elle pousse <b>même quand le jeu est fermé</b>. 💧 Arrosée, elle pousse plus vite et donne une récolte de plus !</p>
      <div class="ligneBtn"><button class="btn vert petit" id="pTout" ${PR.parcellesMures() ? '' : 'disabled'}>🧺 Tout récolter</button><button class="btn petit" id="pArroser">💧 Tout arroser</button>
      ${J.combien('mais') + J.combien('ble') + J.combien('haricot') + J.combien('baie') ? `<span class="recoltes">${['mais', 'ble', 'haricot', 'baie'].filter(o => J.combien(o)).map(o => `${OBJETS[o].e}&nbsp;${J.combien(o)}`).join(' · ')}</span>` : ''}</div>
      <div class="parcelles">${P.parcelles.map((q, i) => {
        if (!q) return `<button class="parcelle vide" data-planter="${i}"><span>🟫</span><small>${choix === i ? 'Quelle graine ?' : '🌱 Planter'}</small></button>`;
        const G = GRAINES[q.g], st = PR.stadeParcelle(q);
        if (st === 3) return `<button class="parcelle mure" data-recolter="${i}"><span>${G.e}</span><small>🧺 Récolter !</small></button>`;
        return `<div class="parcelle"><span>${st === 1 ? '🌱' : '🌿'}</span><small>${G.nom}</small>${barre(1 - PR.restantParcelle(q) / (q.fin - q.debut), '#22c55e')}<small data-reste="${i}">⏳ ${duree(PR.restantParcelle(q))}</small>
          ${q.arrosee ? '<small class="arrose">💧 arrosée</small>' : `<button class="btn petit" data-arroser="${i}">💧 Arroser</button>`}</div>`;
      }).join('')}</div>
      ${choix !== null ? `<div class="choixGraine"><p class="petitTitre">🌱 Que planter ?</p>${graines.length ? graines.map(g => `<button class="btn" data-graine="${g}">${GRAINES[g].e} ${GRAINES[g].nom} <small>(${J.combien(GRAINES[g].graine)}) · ${GRAINES[g].minutes < 60 ? GRAINES[g].minutes + ' min' : '1 h'}</small></button>`).join('')
        : '<p class="petitTexte">Tu n’as plus de graines : Mimi en vend 🛒 !</p>'}</div>` : ''}
      <p class="petitTexte">🌽 Maïs : 5 min · 🌾 Blé : 10 min · 🫘 Haricot sauteur : 15 min · 🍇 Baie arc-en-ciel : 1 h. Au Moulin, les récoltes deviennent des friandises !</p>
      ${blocAmeliorer('potager')}`;
    $$('[data-planter]', F.contenu).forEach(b => b.onclick = () => { pop(); choix = +b.dataset.planter; dessiner(); });
    $$('[data-graine]', F.contenu).forEach(b => b.onclick = () => {
      const err = PR.planter(choix, b.dataset.graine); if (err) { toast('⚠️ ' + err); return; }
      pop(); toast(`🌱 ${GRAINES[b.dataset.graine].nom} : planté !`, { cle: 'potager' });
      const libre = PR.prod().parcelles.findIndex(x => !x); choix = libre >= 0 && J.combien(GRAINES[b.dataset.graine].graine) ? libre : null;
      surChange && surChange(); dessiner();
    });
    $$('[data-arroser]', F.contenu).forEach(b => b.onclick = () => { if (PR.arroser(+b.dataset.arroser)) { pop(); toast('💧 Glouglou… la plante a bien bu !', { cle: 'potager' }); surChange && surChange(); dessiner(); } });
    $$('[data-recolter]', F.contenu).forEach(b => b.onclick = () => recolter([+b.dataset.recolter]));
    $('#pTout', F.contenu).onclick = () => recolter(PR.prod().parcelles.map((q, i) => PR.mure(q) ? i : -1).filter(i => i >= 0));
    $('#pArroser', F.contenu).onclick = () => { let k = 0; PR.prod().parcelles.forEach((q, i) => { if (PR.arroser(i)) k++; }); if (k) { pop(); toast(`💧 ${k} plante${k > 1 ? 's' : ''} arrosée${k > 1 ? 's' : ''} !`, { cle: 'potager' }); surChange && surChange(); } else toast('Rien à arroser pour l’instant.'); dessiner(); };
    brancherAmeliorer(F.contenu, () => { surChange && surChange('potager'); dessiner(); });
  };
  const recolter = liste => {
    const tot = {}; let graine = 0;
    for (const i of liste) { const R = PR.recolter(i); if (R) { const o = GRAINES[R.g].recolte; tot[o] = (tot[o] || 0) + R.n; if (R.graine) graine++; } }
    if (!Object.keys(tot).length) return;
    tada(); toast(`🧺 Récolte : ${Object.entries(tot).map(([o, k]) => `${OBJETS[o].e} × ${k}`).join(', ')}${graine ? ` (+ ${graine} graine${graine > 1 ? 's' : ''} 🌱)` : ''}`, { duree: 3000, classe: 'grand', cle: 'recolte' });
    surChange && surChange(); dessiner();
  };
  dessiner();
  /* les minuteurs : on redessine quand une plante est prête */
  minuteur = setInterval(() => {
    let pret = false;
    PR.prod().parcelles.forEach((q, i) => { const s = $(`[data-reste="${i}"]`, F.el); if (q && s) { if (PR.mure(q)) pret = true; else s.textContent = '⏳ ' + duree(PR.restantParcelle(q)); } });
    if (pret) { dessiner(); surChange && surChange(); }
  }, 1000);
  return F;
}

/* ══════════ le Moulin à friandises ══════════ */
export function ouvrirMoulin({ surChange } = {}) {
  const F = fenetre('🌬️ Le Moulin à friandises', '', { classe: 'moulinF' });
  const dessiner = () => {
    F.contenu.innerHTML = `<p class="petitTexte">Les récoltes du Potager deviennent des friandises. Donne-les à tes dindies depuis leur fiche (touche une dindie) !</p>
      <p class="recoltes centre">${['mais', 'ble', 'haricot', 'baie'].map(o => `${OBJETS[o].e}&nbsp;<b>${J.combien(o)}</b>`).join(' · ')}</p>
      <div class="recettes">${Object.keys(RECETTES).map(id => {
        const O = OBJETS[id], ok = PR.ingredientsOk(id);
        return `<div class="article recette"><span class="em">${O.e}</span><div><b>${O.nom} <small class="possede">(tu en as ${J.combien(id)})</small></b><small>${O.desc}</small>
          <small class="ingr">${Object.entries(RECETTES[id].ingredients).map(([o, k]) => `<span class="${J.combien(o) < k ? 'manque' : ''}">${k} ${OBJETS[o].e}</span>`).join(' + ')}</small></div>
          <button class="btn vert" data-faire="${id}" ${ok ? '' : 'disabled'}>⚙️ Faire</button></div>`;
      }).join('')}</div>`;
    $$('[data-faire]', F.contenu).forEach(b => b.onclick = () => {
      const err = PR.fabriquer(b.dataset.faire); if (err) { toast('⚠️ ' + err); return; }
      tada(); toast(`${OBJETS[b.dataset.faire].e} ${OBJETS[b.dataset.faire].nom} : tout chaud, tout frais !`, { cle: 'moulin' });
      surChange && surChange('moulin'); dessiner();
    });
  };
  dessiner();
  return F;
}

/* ══════════ l'Atelier des plumes ══════════ */
const GROUPES_DECO = [['jardin', '🌷 Jardin', ['massif', 'arbre', 'haie', 'rocher', 'mare', 'dalles']], ['fete', '🎈 Fête', ['fanions', 'lampions', 'ballons', 'citrouilles', 'bonhomme', 'kiosque']],
  ['statues', '🗿 Statues', ['statue']], ['mobilier', '🪑 Mobilier', ['banc', 'lampadaire', 'fontaine', 'puits', 'arche', 'balancoire', 'nichoir', 'epouvantail', 'moulinet', 'parasol', 'barriere']]];
export function ouvrirAtelier({ surChange, decorer } = {}) {
  let onglet = 'chapeaux', forme = FORMES_CHAPEAUX[0].forme, groupe = 'jardin';
  const F = fenetre('🪶 L’Atelier des plumes', '', { classe: 'atelierF', large: true });
  /* le mannequin : la compagne, ou une dindie adulte, ou un Glouglou */
  const modele = () => J.parUid(E().compagnon) || E().dindies.find(estAdulte) || { espece: 'glouglou', stade: 'adulte', chroma: false };
  const dessiner = () => {
    let h = `<p class="petitTexte">Chaque dindie installée dans un <b>enclos</b> lâche des plumes de son type : ramasse-les une fois par jour (touche l’enclos) ! Les missions en rapportent aussi.</p>${plumesHtml()}
      <div class="onglets"><button data-o="chapeaux" class="${onglet === 'chapeaux' ? 'actif' : ''}">🎩 Chapeaux</button><button data-o="decos" class="${onglet === 'decos' ? 'actif' : ''}">🌷 Décorations</button></div>`;
    if (onglet === 'chapeaux') {
      const m = modele();
      h += `<div class="formes">${FORMES_CHAPEAUX.map(Fo => `<button data-f="${Fo.forme}" class="${Fo.forme === forme ? 'actif' : ''}" title="${Fo.nom}">${Fo.e}</button>`).join('')}</div>
        <div class="chapeaux">${Object.values(CHAPEAUX).filter(C => C.forme === forme).map(C => `<div class="chapeau"><div class="mini">${portraitDindie({ ...adnDe(m), chapeau: C.forme, couleurChapeau: C.c1, couleurChapeau2: C.c2, crete: 'aucune' }, { id: 'AT' + (n++) })}</div>
          <b>${C.nom}</b><small>${prixTexte(C.cout)}</small>${PR.nbChapeau(C.id) ? `<small class="possede">Tu en as : ${PR.nbChapeau(C.id)}</small>` : ''}
          <button class="btn petit vert" data-chapeau="${C.id}" ${PR.coutOk(C.cout) ? '' : 'disabled'}>🧵 Fabriquer</button></div>`).join('')}</div>
        <p class="petitTexte">Pour coiffer une dindie : touche-la, puis 🎩. (${Object.keys(CHAPEAUX).length} chapeaux à fabriquer !)</p>`;
    } else {
      const fams = GROUPES_DECO.find(g => g[0] === groupe)[2];
      h += `<div class="formes">${GROUPES_DECO.map(([k, t]) => `<button data-g="${k}" class="large ${k === groupe ? 'actif' : ''}">${t}</button>`).join('')}</div>
        ${Object.values(DECORATIONS).filter(D => fams.includes(D.famille)).map(D => `<div class="article deco"><span class="em">${D.e}</span><div><b>${D.nom}</b><small>${prixTexte(D.cout)}</small>${PR.nbDeco(D.id) ? `<small class="possede">Tu en as : ${PR.nbDeco(D.id)} (${PR.prod().decorations[D.id] || 0} à poser)</small>` : ''}</div>
          <button class="btn petit vert" data-deco="${D.id}" ${PR.coutOk(D.cout) ? '' : 'disabled'}>🔨 Fabriquer</button></div>`).join('')}
        <p class="petitTexte">${Object.keys(DECORATIONS).length} décorations à fabriquer. Pour les poser : le bouton 🎨 en bas de l’écran !</p>
        ${decorer && Object.values(PR.prod().decorations).some(k => k > 0) ? '<div class="ligneBtn"><button class="btn grand jaune" id="aDecorer">🎨 Décorer le Domaine</button></div>' : ''}`;
    }
    F.contenu.innerHTML = h;
    $$('[data-o]', F.contenu).forEach(b => b.onclick = () => { pop(); onglet = b.dataset.o; dessiner(); });
    $$('[data-f]', F.contenu).forEach(b => b.onclick = () => { pop(); forme = b.dataset.f; dessiner(); });
    $$('[data-g]', F.contenu).forEach(b => b.onclick = () => { pop(); groupe = b.dataset.g; dessiner(); });
    $$('[data-chapeau]', F.contenu).forEach(b => b.onclick = () => {
      const err = PR.fabriquerChapeau(b.dataset.chapeau); if (err) { toast('⚠️ ' + err); return; }
      tada(); toast(`🎩 ${CHAPEAUX[b.dataset.chapeau].nom} : fabriqué ! Touche une dindie pour le lui mettre.`, { duree: 3200, cle: 'atelier' }); surChange && surChange(); dessiner();
    });
    $$('[data-deco]', F.contenu).forEach(b => b.onclick = () => {
      const err = PR.fabriquerDeco(b.dataset.deco); if (err) { toast('⚠️ ' + err); return; }
      tada(); toast(`${DECORATIONS[b.dataset.deco].e} ${DECORATIONS[b.dataset.deco].nom} : fabriqué ! Pose-le avec 🎨.`, { duree: 3200, cle: 'atelier' }); surChange && surChange(); dessiner();
    });
    const d = $('#aDecorer', F.contenu); if (d) d.onclick = () => { pop(); F.fermer(); decorer(); };
  };
  dessiner();
  return F;
}

/* ══════════ le Bureau des missions ══════════ */
export function ouvrirMissions({ surChange } = {}) {
  let minuteur = null;
  const F = fenetre('📮 Le Bureau des missions', '', { classe: 'missionsF', large: true, surFermer: () => clearInterval(minuteur) });
  const dessiner = () => {
    const M = PR.missions(), max = PR.nbMissionsMax();
    let h = `<p class="petitTexte">Envoie <b>1 à 3 dindies adultes</b> en mission. Elles reviennent avec des pièces, des plumes et des surprises (parfois même un œuf épique !). La réussite dépend de leurs stats et de leur type.</p>
      <h3>🚀 En mission <small>${M.encours.length}/${max}</small></h3>`;
    h += M.encours.map(m => {
      const Mo = PR.modeleDe(m), fini = PR.missionFinie(m), eq = m.uids.map(J.parUid).filter(Boolean);
      return `<div class="mission enCours ${fini ? 'finie' : ''}"><span class="em">${Mo.e}</span><div><b>${Mo.titre}</b>
        <div class="equipeMission">${eq.map(d => `<div class="mini">${portrait(d, { fond: false })}</div>`).join('')}</div>
        ${fini ? '<small>🎉 Elles sont rentrées !</small>' : `${barre(1 - PR.restantMission(m) / (m.fin - m.debut), '#3b82f6')}<small data-reste="${m.id}">⏳ ${duree(PR.restantMission(m))}</small>`}</div>
        ${fini ? `<button class="btn grand jaune" data-rapporter="${m.id}">🎉 Accueillir</button>` : ''}</div>`;
    }).join('') || '<p class="petitTexte">Personne n’est en mission.</p>';
    h += `<h3>📜 Les missions proposées</h3>` + M.offertes.map(o => {
      const Mo = PR.modeleDe(o);
      return `<div class="mission"><span class="em">${Mo.e}</span><div><b>${Mo.titre}</b><small>${Mo.desc}</small>
        <small>⏱️ <b>${o.duree < 60 ? o.duree + ' min' : o.duree / 60 + ' h'}</b> · il faut du <b>${STATS[Mo.stat]}</b>${Mo.type ? ` · bonus ${TYPES[Mo.type].e} ${TYPES[Mo.type].nom}` : ''}</small>
        <small>🎁 ${o.pieces} 🪙 + ${Object.entries(o.plumes).map(([t, k]) => `${k} 🪶${TYPES[t].e}`).join('')} + une surprise${o.k >= 4 ? ' (peut-être un œuf épique 🟣 !)' : o.k >= 2 ? ' (peut-être un œuf mystère 🥚)' : ''}</small></div>
        <button class="btn vert" data-choisir="${o.id}" ${M.encours.length >= max ? 'disabled' : ''}>👉 Choisir l’équipe</button></div>`;
    }).join('');
    if (M.encours.length >= max) h += `<p class="petitTexte">Le Bureau ne gère que ${max} mission${max > 1 ? 's' : ''} à la fois. Améliore-le pour en envoyer plus !</p>`;
    h += blocAmeliorer('missions');
    F.contenu.innerHTML = h;
    $$('[data-choisir]', F.contenu).forEach(b => b.onclick = () => { pop(); choisirEquipe(b.dataset.choisir, () => { surChange && surChange(); dessiner(); }); });
    $$('[data-rapporter]', F.contenu).forEach(b => b.onclick = () => { const R = PR.rapporter(b.dataset.rapporter); if (R) { resultatMission(R); surChange && surChange(); dessiner(); } });
    brancherAmeliorer(F.contenu, () => { surChange && surChange(); dessiner(); });
  };
  dessiner();
  minuteur = setInterval(() => {
    let fini = false;
    for (const m of PR.missions().encours) { const s = $(`[data-reste="${m.id}"]`, F.el); if (s) { if (PR.missionFinie(m)) fini = true; else s.textContent = '⏳ ' + duree(PR.restantMission(m)); } }
    if (fini) { dessiner(); surChange && surChange(); }
  }, 1000);
  return F;
}
/* choisir 1 à 3 dindies pour une mission (la chance s'affiche en direct) */
function choisirEquipe(idOffre, apres) {
  const o = PR.missions().offertes.find(x => x.id === idOffre); if (!o) return;
  const Mo = PR.modeleDe(o), choisies = [];
  const possibles = E().dindies.filter(d => !PR.peutPartir(d)).sort((a, b) => stats(b)[Mo.stat] - stats(a)[Mo.stat]);
  const F = fenetre(`${Mo.e} ${Mo.titre}`, '', { classe: 'equipeF', large: true });
  const dessiner = () => {
    const eq = choisies.map(J.parUid), c = eq.length ? PR.chanceMission(o, eq) : 0;
    F.contenu.innerHTML = `<p class="petitTexte">Choisis jusqu’à 3 dindies. Il faut du <b>${STATS[Mo.stat]}</b>${Mo.type ? `, et les dindies ${TYPES[Mo.type].e} ${TYPES[Mo.type].nom} ont un bonus` : ''}.</p>
      <div class="chanceMission"><span>Chance de réussite :</span>${barre(c, c >= .7 ? '#22c55e' : c >= .45 ? '#f59e0b' : '#ef4444')}<b>${eq.length ? Math.round(c * 100) + ' % · ' + PR.texteChance(c) : '—'}</b></div>
      <div class="rangee choixEnt">${possibles.map(d => `<button class="carteDindie ${choisies.includes(d.uid) ? 'choisie' : ''}" data-uid="${d.uid}" style="--rar:${RARETES[PAR_ID[d.espece].rarete].couleur}"><div class="mini">${portrait(d)}</div>
        <b>${echapper(nomDe(d))}</b><small>${STATS[Mo.stat].split(' ')[0]} ${stats(d)[Mo.stat]}${Mo.type && PAR_ID[d.espece].types.includes(Mo.type) ? ' ' + TYPES[Mo.type].e + '+' : ''}${d.lieu === 'equipe' ? ' · 🎒' : ''}</small></button>`).join('') || '<p class="petitTexte">Aucune dindie adulte disponible.</p>'}</div>
      <div class="ligneBtn"><button class="btn grand vert" id="mPartir" ${eq.length ? '' : 'disabled'}>🚀 En route ! (${o.duree < 60 ? o.duree + ' min' : o.duree / 60 + ' h'})</button></div>`;
    $$('.carteDindie', F.contenu).forEach(b => b.onclick = () => {
      const u = b.dataset.uid, i = choisies.indexOf(u);
      if (i >= 0) choisies.splice(i, 1); else if (choisies.length < 3) choisies.push(u); else { toast('3 dindies au plus !'); return; }
      pop(); dessiner();
    });
    $('#mPartir', F.contenu).onclick = () => {
      const err = PR.envoyer(idOffre, choisies); if (err) { toast('⚠️ ' + err); return; }
      tada(); glouglou(1.1); toast(`🚀 ${choisies.length > 1 ? 'Elles sont parties' : 'Elle est partie'} : ${Mo.titre} !`, { duree: 3000, classe: 'grand' });
      F.fermer(); apres && apres();
    };
  };
  dessiner();
}
function resultatMission(R) {
  const Mo = PR.modeleDe(R);
  tada();
  fenetre(R.reussite ? '🎉 Mission réussie !' : '🙂 De retour !', `<div class="resultatMission"><p class="grosEmoji">${R.reussite ? Mo.e : '🫶'}</p>
    <div class="equipeMission">${R.dindies.map(d => `<div class="mini">${portrait(d, { fond: false })}</div>`).join('')}</div>
    <p>${R.reussite ? `<b>${Mo.titre}</b> : c’est réussi ! Bravo l’équipe !` : `<b>${Mo.titre}</b> : c’était trop difficile cette fois… Elles ont fait de leur mieux, et rapportent quand même un petit quelque chose.`}</p>
    <p class="gains">+ ${R.pieces} 🪙${Object.entries(R.plumes).map(([t, k]) => ` + ${k} 🪶${TYPES[t].e}`).join('')}${Object.entries(R.objets).map(([o, k]) => ` + ${OBJETS[o].e}${k > 1 ? ' × ' + k : ''}`).join('')}${R.plumesOr ? ' + 1 🪶 d’or' : ''}</p>
    <p class="petitTexte">+ ${R.xp} XP pour chacune${R.niveaux.length ? ' · ' + R.niveaux.map(([d, v]) => `${echapper(nomDe(d))} passe au niveau ${v.apres} !`).join(' ') : ''}</p>
    ${R.objets.oeufEpique ? '<p class="infoCouple">🟣 Un <b>œuf épique</b> ! Mets-le vite dans une couveuse du Couvoir !</p>' : ''}</div>`, { classe: 'resultatsF' });
}

/* ══════════ dans la fiche d'une dindie ══════════ */
/* les boutons : chapeau, friandises du Moulin, rendre à la nature */
export function boutonsFiche(d) {
  if (!estAdulte(d)) return '';
  const P = PR.prod(), aChapeaux = Object.values(P.chapeaux).some(k => k > 0);
  const moulin = Object.keys(OBJETS).filter(id => OBJETS[id].moulin && J.combien(id) > 0);
  return `${aChapeaux || d.chapeau ? `<button class="btn" id="fChapeau">🎩 Chapeau</button>` : ''}
    ${moulin.map(id => `<button class="btn jaune" data-moulin="${id}" title="${OBJETS[id].nom}">${OBJETS[id].e} ${OBJETS[id].nom.split(' ')[0]} (${J.combien(id)})</button>`).join('')}`;
}
export function brancherFiche(F, d, { dessiner, surChange, niveauToast, fermer }) {
  const c = $('#fChapeau', F.el); if (c) c.onclick = () => { pop(); choisirChapeau(d, () => { surChange && surChange(); dessiner(); }); };
  $$('[data-moulin]', F.el).forEach(b => b.onclick = () => {
    const id = b.dataset.moulin, R = PR.donnerFriandiseMoulin(d, id);
    if (typeof R === 'string') { toast('⚠️ ' + R); return; }
    glouglou(1.1); tada();
    toast(`${OBJETS[id].e} Miam ! ${R.stat !== undefined ? `+ 1 point d’entraînement ${STATS[R.stat]}` : `+ ${OBJETS[id].moulin.xp} XP`} pour ${nomDe(d)} !`, { cle: 'moulin' });
    window.dispatchEvent(new CustomEvent('dindie-joie', { detail: d.uid }));
    if (R.niv && niveauToast) niveauToast(d, R.niv);
    surChange && surChange(); dessiner();
  });
  const r = $('#fRelacher', F.el); if (r) r.onclick = async () => {
    const err = PR.peutRelacher(d); if (err) { toast('⚠️ ' + err); return; }
    const P = PR.plumesRelacher(d);
    const ch = await dialogue([{ qui: moi(), texte: `Rendre ${echapper(nomDe(d))} à la nature ? Elle retournera vivre en liberté, dans les prés et les bois. En souvenir, elle te laissera ${P.n} plumes ${TYPES[P.type].e}. (Elle restera dans ton Grand Livre.)`,
      choix: [['non', '💗 Non, elle reste !'], ['oui', '🍃 Oui, au revoir…']] }]);
    if (ch !== 'oui') return;
    const R = PR.relacher(d); if (typeof R === 'string') { toast('⚠️ ' + R); return; }
    glouglou(.9); toast(`🍃 Au revoir, ${echapper(nomDe(d))} ! Elle s’éloigne en faisant « glouglou »… + ${R.n} 🪶${TYPES[R.type].e}`, { duree: 4200, classe: 'grand' });
    fermer(); surChange && surChange();
  };
}
export const boutonRelacher = d => PR.productionOuverte() && !PR.peutRelacher(d) ? '<button class="btn petit relacher" id="fRelacher">🍃 Rendre à la nature</button>' : '';
function choisirChapeau(d, apres) {
  const F = fenetre(`🎩 Un chapeau pour ${echapper(nomDe(d))}`, '', { classe: 'chapeauF', large: true });
  const dessiner = () => {
    const P = PR.prod(), stock = Object.entries(P.chapeaux).filter(([id, k]) => k > 0 && CHAPEAUX[id]);
    F.contenu.innerHTML = `<div class="chapeaux">${d.chapeau ? `<div class="chapeau porte"><div class="mini">${portrait(d)}</div><b>${CHAPEAUX[d.chapeau]?.nom || ''}</b><button class="btn petit" id="cEnlever">✖ L’enlever</button></div>` : ''}
      ${stock.map(([id, k]) => `<div class="chapeau"><div class="mini">${portraitDindie({ ...adnDe({ ...d, chapeau: null }), chapeau: CHAPEAUX[id].forme, couleurChapeau: CHAPEAUX[id].c1, couleurChapeau2: CHAPEAUX[id].c2, crete: 'aucune' }, { id: 'CH' + (n++) })}</div>
        <b>${CHAPEAUX[id].nom}</b>${k > 1 ? `<small>× ${k}</small>` : ''}<button class="btn petit vert" data-mettre="${id}">🎩 Le mettre</button></div>`).join('')}</div>
      ${stock.length ? '' : '<p class="petitTexte">Pas d’autre chapeau : l’Atelier des plumes en fabrique !</p>'}`;
    const en = $('#cEnlever', F.contenu); if (en) en.onclick = () => { PR.coiffer(d, null); pop(); toast(`${nomDe(d)} enlève son chapeau.`); apres && apres(); dessiner(); };
    $$('[data-mettre]', F.contenu).forEach(b => b.onclick = () => {
      const err = PR.coiffer(d, b.dataset.mettre); if (err) { toast('⚠️ ' + err); return; }
      tada(); glouglou(1.2); toast(`🎩 ${nomDe(d)} adore son ${CHAPEAUX[b.dataset.mettre].nom.replace(/ \S+$/, '').toLowerCase()} !`, { cle: 'chapeau' });
      window.dispatchEvent(new CustomEvent('dindie-joie', { detail: d.uid }));
      apres && apres(); F.fermer();
    });
  };
  dessiner();
}
