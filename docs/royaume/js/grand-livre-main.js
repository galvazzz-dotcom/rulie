/* Le Grand Livre des Dindies (la page publique, étape 9) : les 72 espèces, dessinées par le jeu à partir de leur ADN.
   Des filtres (type, rareté, île, recherche), une fiche par dindie (ses 4 stades, ses stats de base, où la trouver)
   et son cri 🔊, le même que dans le jeu. Les légendes (les mythiques) restent cachées, sauf si on le demande. */
import { ESPECES, PAR_ID } from './donnees/especes.js';
import { TYPES, ORDRE_TYPES, RARETES } from './donnees/types.js';
import { REGIONS, ORDRE_REGIONS, texteConditions } from './donnees/regions.js';
import { OBJETS } from './jeu/objets.js';
import { variante } from './dindies/adn.js';
import { portraitDindie } from './dindies/portrait.js';
import { crier } from './jeu/cris.js';
import { audio } from './moteur/sons.js';

const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const echapper = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const ORIGINES = [...ORDRE_REGIONS.map(id => [id, `${REGIONS[id].e} ${REGIONS[id].nom}`]), ['croisement', '🥚 Croisements'], ['recette', '📜 Recettes'], ['mythique', '🌈 Légendes']];
const origineDe = e => e.origine.sorte === 'sauvage' ? e.origine.region : e.origine.sorte;
const PASTILLE = { commune: '⚪', rare: '🔵', epique: '🟣', mythique: '🌟' };
const STADES = [['poussin', '🐣 Poussin'], ['jeune', '🐥 Jeune'], ['adulte', '🦃 Adulte'], ['eveille', '🌟 Éveillée']];
const nomObjet = id => OBJETS[id] ? `${OBJETS[id].e} « ${OBJETS[id].nom} »` : id;
let n = 0;
const dessin = (e, o = {}) => portraitDindie(variante(e, { stade: o.stade || 'adulte', chroma: !!o.chroma }), { id: 'gl' + (n++), silhouette: !!o.silhouette });

const F = { type: 'tout', rarete: 'tout', origine: 'tout', nom: '', chroma: false, legendes: false };
/* les filtres et l'onglet restent d'une visite à l'autre (si le navigateur le permet) */
try { Object.assign(F, JSON.parse(localStorage.getItem('grandLivrePublic') || '{}'), { nom: '' }); } catch { /* pas de mémoire : tant pis */ }
const garder = () => { try { localStorage.setItem('grandLivrePublic', JSON.stringify({ ...F, nom: '' })); } catch { /* idem */ } };
const cachee = e => e.rarete === 'mythique' && !F.legendes;

/* ── le résumé et les puces des filtres ── */
const compter = f => ESPECES.filter(f).length;
$('#resume').innerHTML = [`🦃 ${ESPECES.length} espèces`, `🧭 ${compter(e => e.origine.sorte === 'sauvage')} sauvages, sur 8 îles`, `🥚 ${compter(e => e.origine.sorte === 'croisement')} hybrides`, `📜 ${compter(e => e.origine.sorte === 'recette')} recettes`, `🌈 ${compter(e => e.rarete === 'mythique')} légendes`].map(t => `<span>${t}</span>`).join('');
function puces(id, cle, liste) {
  const z = $(id);
  z.innerHTML = [['tout', 'Toutes'], ...liste].map(([v, t]) => `<button class="puce ${F[cle] === v ? 'actif' : ''}" data-v="${v}" aria-pressed="${F[cle] === v}">${t}</button>`).join('');
  $$('.puce', z).forEach(b => b.onclick = () => { F[cle] = b.dataset.v; garder(); puces(id, cle, liste); dessiner(); });
}
puces('#fType', 'type', ORDRE_TYPES.map(t => [t, `${TYPES[t].e} ${TYPES[t].nom}`]));
puces('#fRarete', 'rarete', Object.keys(RARETES).map(r => [r, `${PASTILLE[r]} ${RARETES[r].nom}`]));
puces('#fOrigine', 'origine', ORIGINES);
$('#fChroma').checked = F.chroma; $('#fLegendes').checked = F.legendes;
$('#fChroma').onchange = ev => { F.chroma = ev.target.checked; garder(); dessiner(); };
$('#fLegendes').onchange = ev => { F.legendes = ev.target.checked; garder(); dessiner(); };
$('#fNom').oninput = ev => { F.nom = ev.target.value.trim().toLowerCase(); dessiner(); };

/* ── la grille ── */
const sansAccents = t => t.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
function dessiner() {
  const L = ESPECES.filter(e => (F.type === 'tout' || e.types.includes(F.type)) && (F.rarete === 'tout' || e.rarete === F.rarete) && (F.origine === 'tout' || origineDe(e) === F.origine)
    && (!F.nom || (!cachee(e) && sansAccents(e.nom).includes(sansAccents(F.nom))) || String(e.n) === F.nom));
  $('#compte').textContent = L.length === ESPECES.length ? `Les ${L.length} dindies` : `${L.length} dindie${L.length > 1 ? 's' : ''} sur ${ESPECES.length}`;
  $('#grille').innerHTML = L.length ? L.map(e => {
    const s = cachee(e), R = RARETES[e.rarete];
    return `<button class="dindie ${s ? 'secret' : ''}" data-id="${e.id}" style="--rar:${R.couleur}" aria-label="${s ? 'Une légende cachée, numéro ' + e.n : echapper(e.nom)}">
      <span class="haut"><span class="num">N° ${e.n}</span><span class="types">${s ? '' : e.types.map(t => TYPES[t].e).join('')}</span></span>
      <div class="portrait">${dessin(e, { chroma: F.chroma, silhouette: s })}</div>
      <b>${s ? '???' : echapper(e.nom)}</b><span class="rar">${PASTILLE[e.rarete]} ${R.nom}</span></button>`;
  }).join('') : '<p class="vide">Aucune dindie ne correspond… Essaie un autre filtre !</p>';
  $$('.dindie', $('#grille')).forEach(b => b.onclick = () => ouvrir(b.dataset.id));
}

/* ── la fiche d'une espèce ── */
function ouTrouver(e) {
  const o = e.origine;
  if (o.sorte === 'sauvage') { const R = REGIONS[o.region]; return `🧭 Elle vit dans <b>${R.e} ${R.nom}</b> : ${texteConditions(e.id, nomObjet)}.`; }
  if (o.sorte === 'croisement') return `🥚 Elle naît au Couvoir, d’un croisement entre un parent <b>${TYPES[o.types[0]].e} ${TYPES[o.types[0]].nom}</b> et un parent <b>${TYPES[o.types[1]].e} ${TYPES[o.types[1]].nom}</b> (une fois sur trois environ).`;
  if (o.sorte === 'recette') return `📜 Une recette secrète du Couvoir : <b>${PAR_ID[o.especes[0]].nom}</b> × <b>${PAR_ID[o.especes[1]].nom}</b>.`;
  return `🌈 Une légende : « <b>${o.quete}</b> ». Au bout de cette grande quête, elle naît de <b>${PAR_ID[o.especes[0]].nom}</b> × <b>${PAR_ID[o.especes[1]].nom}</b>, avec ${nomObjet(o.objet)}${o.condition ? ' (' + o.condition + ')' : ''}.`;
}
const fiche = $('#fiche');
let avant = null;
function ouvrir(id) {
  const e = PAR_ID[id], R = RARETES[e.rarete], s = cachee(e);
  avant = document.activeElement;
  fiche.style.setProperty('--rar', R.couleur); $('.fiche', fiche).style.setProperty('--rar', R.couleur);
  $('#ficheContenu').innerHTML = s
    ? `<div class="secretFiche"><div class="ficheHaut" style="justify-content:center"><div class="grand">${dessin(e, { silhouette: true })}</div></div>
        <h2 id="ficheNom">N° ${e.n} : une légende…</h2><p class="desc">Cette dindie mythique est l’un des grands secrets du Royaume. Pour la rencontrer, il faut jouer !<br>(Ou coche « 🌈 Montrer les légendes ».)</p></div>`
    : `<div class="ficheHaut"><div class="grand">${dessin(e, { chroma: F.chroma })}</div>
        <div><h2 id="ficheNom">${echapper(e.nom)}</h2>
          <div class="pills"><span class="pill">N° ${e.n}</span><span class="pill rar">${PASTILLE[e.rarete]} ${R.nom}</span>${e.types.map(t => `<span class="pill" style="background:${TYPES[t].clair}">${TYPES[t].e} ${TYPES[t].nom}</span>`).join('')}</div>
          <p class="criFiche">« ${echapper(e.cri)} » <button class="ecouter" id="ficheCri" aria-label="Écouter son cri">🔊 Son cri</button></p></div></div>
      <p class="desc">${echapper(e.desc)}</p>
      ${['⚡ Vitesse', '💪 Endurance', '🦘 Saut'].map((t, i) => `<div class="stat"><span>${t}</span><div class="barre"><i style="width:${e.stats[i] * 10}%"></i></div><b>${e.stats[i]}</b></div>`).join('')}
      <p class="ou">${ouTrouver(e)}</p>
      <h3>Ses 4 stades${F.chroma ? ' (en chromatique ✨)' : ''}</h3>
      <div class="stades">${STADES.map(([st, t]) => `<figure><div class="p">${dessin(e, { stade: st, chroma: F.chroma })}</div><figcaption>${t}</figcaption></figure>`).join('')}</div>
      <p class="petit" style="font-size:13px;color:#7c4a1d;margin-top:10px">Les stats de l’espèce, de 1 à 10. Chaque dindie a en plus ses propres talents (de 0 à 5 ⭐) : deux dindies de la même espèce ne sont jamais pareilles !</p>`;
  fiche.classList.remove('cache');
  const c = $('#ficheCri'); if (c) c.onclick = () => crier(e.id);
  $('#ficheFermer').focus();
}
function fermer() { fiche.classList.add('cache'); if (avant) avant.focus(); }
$('#ficheFermer').onclick = fermer;
fiche.addEventListener('pointerdown', ev => { if (ev.target === fiche) fermer(); });
addEventListener('keydown', ev => { if (ev.key === 'Escape' && !fiche.classList.contains('cache')) fermer(); });
/* le son se prépare au premier toucher (les navigateurs l'exigent) */
addEventListener('pointerdown', () => { try { audio(); } catch { /* pas de son */ } }, { once: true });

dessiner();
/* un lien direct vers une dindie : grand-livre.html#glouglou */
const ancre = decodeURIComponent(location.hash.slice(1)); if (PAR_ID[ancre]) ouvrir(ancre);
window.__grandLivre = { F, dessiner, ouvrir };   /* pour les tests automatiques */
