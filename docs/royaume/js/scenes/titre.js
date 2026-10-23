/* ══════════ L'ÉCRAN TITRE ET LE PROLOGUE ══════════ */
import { $, $$, el, echapper } from '../moteur/ui.js';
import { pop, tada, audio, glouglou, musique, ambianceMusique } from '../moteur/sons.js';
import { dire } from '../moteur/voix.js';
import * as SAUVE from '../moteur/sauvegarde.js';
import { nouvelEtat, migrer } from '../jeu/etat.js';
import { PAR_ID } from '../donnees/especes.js';
import { variante } from '../dindies/adn.js';
import { portraitDindie } from '../dindies/portrait.js';
import { portraitChibi, PERSONNAGES } from '../personnages/chibi.js';

import { especesDe, especesDeTous, dansLOrdre } from '../jeu/collection.js';
import { hasard } from '../moteur/couleurs.js';
import { fete } from '../jeu/evenements.js';

const COULEURS = ['#ea580c', '#2563eb', '#16a34a', '#db2777', '#7c3aed', '#0891b2'];
/* les dindies qui flottent autour du titre : seulement celles qu'on a déjà attrapées
   (au tout début : les 3 dindies que le Professeur propose) */
function defilantes() {
  const L = dansLOrdre(especesDeTous()).map(e => e.id);
  if (!L.length) return ['paquerette', 'crachin', 'braise'];
  const r = hasard('titre' + L.length);
  for (let i = L.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [L[i], L[j]] = [L[j], L[i]]; }
  return L.slice(0, 8);
}

export function ecranTitre({ surJouer }) {
  /* les dindies qui flottent autour du titre (en haut et en bas, pour ne pas cacher la boîte) */
  const POS = [[4, 4], [80, 82], [58, 5], [6, 78], [30, 2], [56, 80], [80, 3], [30, 84]];
  const FT = fete();
  const T = el(`<div id="titre"><div class="titreFond">${defilantes().map((id, i) => `<div class="flotte" style="--i:${i};left:${POS[i][0]}%;top:${POS[i][1]}%">${portraitDindie(variante(PAR_ID[id]), { id: 'T' + i, fond: false })}</div>`).join('')}</div>
    <div class="titreBoite"><h1><small>Le</small> Royaume <small>des</small> Dindies</h1><p class="sous">Attrape-les, élève-les, fais-les courir !</p>${FT ? `<p class="titreFete">${FT.e} C’est ${FT.nom} au Royaume ! ${FT.e}</p>` : ''}
    <div id="profils"></div>
    <p class="liensTitre"><a href="../index.html">🏠 Le site</a></p>
    <p class="enDev">🚧 Jeu en développement : les 8 chapitres jouables, de la première dindie au Dindromakus</p></div></div>`);
  document.body.appendChild(T);
  /* la musique démarre au premier toucher (les navigateurs l'exigent) */
  T.addEventListener('pointerdown', () => { audio(); ambianceMusique('titre'); musique(true); }, { once: true });
  const dessiner = () => {
    const P = SAUVE.listeProfils();
    $('#profils', T).innerHTML = P.map(p => `<div class="profil" style="--c:${p.couleur}"><button class="jouer" data-id="${p.id}"><b>${echapper(p.nom)}</b><small>${p.resume || 'Nouvelle partie'}</small></button>
      ${especesDe(p.id).size ? `<a class="defileProfil" href="defile.html?profil=${p.id}" aria-label="Le défilé de ${echapper(p.nom)}" title="Le défilé de ${echapper(p.nom)}">🦃</a>` : ''}
      <button class="supprimer" data-id="${p.id}" aria-label="Effacer">🗑️</button></div>`).join('') +
      (SAUVE.peutCreer() ? `<button class="btn grand vert" id="tNouveau">➕ Nouvelle partie</button>` : '<p class="petitTexte">3 profils au maximum : efface-en un pour recommencer.</p>');
    $$('.jouer', T).forEach(b => b.onclick = () => {
      audio(); pop();
      const id = b.dataset.id, e = SAUVE.chargerProfil(id);
      SAUVE.choisirProfil(id);
      T.remove(); surJouer(id, e ? migrer(e) : nouvelEtat(SAUVE.listeProfils().find(p => p.id === id).nom, '#ea580c'), !e);
    });
    $$('.supprimer', T).forEach(b => b.onclick = () => {
      const p = SAUVE.listeProfils().find(x => x.id === b.dataset.id);
      if (confirm(`Effacer la partie de « ${p.nom} » ? On ne pourra pas la récupérer (sauf avec un code de sauvegarde).`)) { SAUVE.supprimerProfil(p.id); dessiner(); }
    });
    const N = $('#tNouveau', T); if (N) N.onclick = () => { audio(); pop(); nouveauProfil(); };
  };
  const nouveauProfil = () => {
    let couleur = COULEURS[SAUVE.listeProfils().length % COULEURS.length];
    $('#profils', T).innerHTML = `<div class="nouveauProfil"><p>Comment t’appelles-tu ?</p><input id="tNom" maxlength="14" placeholder="Ton prénom">
      <div class="couleurs">${COULEURS.map(c => `<button data-c="${c}" style="background:${c}" class="${c === couleur ? 'on' : ''}" aria-label="Couleur"></button>`).join('')}</div>
      <button class="btn grand vert" id="tGo">🦃 C’est parti !</button><button class="btn petit" id="tRetour">↩ Retour</button></div>`;
    setTimeout(() => $('#tNom', T).focus(), 50);
    $$('.couleurs button', T).forEach(b => b.onclick = () => { couleur = b.dataset.c; $$('.couleurs button', T).forEach(x => x.classList.toggle('on', x === b)); pop(); });
    $('#tRetour', T).onclick = () => { pop(); dessiner(); };
    $('#tGo', T).onclick = async () => {
      const nom = $('#tNom', T).value.trim().slice(0, 14) || 'Exploratrice';
      const id = SAUVE.creerProfil(nom, couleur), e = nouvelEtat(nom, couleur);
      SAUVE.sauverProfil(id, e, 'Nouvelle partie');
      tada(); T.remove();
      await prologue();
      surJouer(id, e, true);
    };
  };
  dessiner();
}

/* ── le prologue : la nuit de la grande découverte ── */
export function prologue() {
  return new Promise(resoudre => {
    const R = portraitChibi(PERSONNAGES.roullieee, 'proR'), D = portraitDindie(variante(PAR_ID.ruuulius), { id: 'proD' }), Pr = portraitChibi(PERSONNAGES.plumeau, 'proP');
    const CARTES = [
      { fond: 'nuit', image: `<div class="lune"></div><div class="perso">${R}</div>`, texte: 'Une nuit de pleine lune, dans son jardin, Roullieee entend un énorme <b>GLOUGLOU</b> venu des buissons…' },
      { fond: 'nuit', image: `<div class="legende">${D}</div>`, texte: 'C’est le légendaire <b>Dindromakus RUUULIUSSS Maximus</b> ! « RUUUULIIIIIIEEEEEEE !!! » Il laisse tomber une plume arc-en-ciel… et s’envole dans la nuit.' },
      { fond: 'matin', image: `<div class="lettreP"><div class="perso petit">${Pr}</div><p>« Chère Roullieee, viens vite au <b>Domaine des Dindies</b> ! J’ai besoin de toi. — Professeur Plumeau »</p></div>`, texte: 'Le lendemain matin, une lettre arrive… L’aventure commence !' }
    ];
    const P = el(`<div id="prologue"><div class="carteP"></div><div class="texteP"></div><button class="btn petit passer">⏭ Passer</button><p class="toucheP">Touche pour continuer ▶</p></div>`);
    document.body.appendChild(P);
    let i = -1;
    const suite = () => {
      i++;
      if (i >= CARTES.length) { P.remove(); resoudre(); return; }
      const C = CARTES[i]; P.className = C.fond;
      $('.carteP', P).innerHTML = C.image; $('.texteP', P).innerHTML = C.texte;
      $('.carteP', P).classList.remove('entre'); void P.offsetWidth; $('.carteP', P).classList.add('entre');
      dire(C.texte); if (i === 1) glouglou(.85); else pop();
    };
    P.addEventListener('pointerup', ev => { if (ev.target.closest('.passer')) { P.remove(); resoudre(); return; } suite(); });
    suite();
  });
}
