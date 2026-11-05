/* Les différences — attention visuelle et comparaison.
   Deux grilles presque identiques : touche dans la grille du bas les cases qui ont changé.
   4 manches. Niveau : taille des grilles (3×3 à 6×6) et nombre de différences (2 à 5).
   Score = temps total + 3 s par erreur. */
Gala.enregistrer({
  id: 'differences',
  nom: 'Les différences',
  icone: '👀',
  domaine: 'attention',
  consigne: 'Compare les deux grilles. Dans la grille du bas, touche chaque case qui n\'est pas pareille qu\'en haut. Chaque erreur ajoute 3 secondes.',
  niveaux: 5,
  adaptatif: true,
  mesure: { unite: 's', meilleur: 'bas' },

  demarrer(ctx) {
    Gala.outils.style('differences', `
      .dif-bloc { display: flex; flex-direction: column; align-items: center; gap: .15rem; }
      .dif-bloc small { color: var(--discret); font-weight: 600; }
      .dif-grille { display: grid; gap: .2rem; width: min(84vw, 320px, 29vh); min-width: 200px; }
      .dif-grille > * { aspect-ratio: 1; min-height: 0; padding: 0; display: flex; align-items: center; justify-content: center;
        font-size: var(--taille-dif); line-height: 1; border-radius: 10px; }
      .dif-grille.modele > div { background: var(--carte); border: 1px solid var(--bord); }
      .dif-grille button.trouve { border-color: var(--ok); background: color-mix(in srgb, var(--ok) 35%, var(--carte)); }
      .dif-grille button.faux { border-color: var(--erreur); background: var(--erreur); }
      @media (min-width: 700px) { .dif-duo { display: flex; gap: 1.5rem; } }
    `);
    const MANCHES = 4, PENALITE = 3;
    const COTE = [0, 3, 4, 4, 5, 6][ctx.niveau];
    const NB_DIF = [0, 2, 2, 3, 4, 5][ctx.niveau];
    const CIBLE = [0, 6, 8, 10, 13, 16][ctx.niveau]; // secondes par manche pour 100 %
    const SYMBOLES = ctx.niveau <= 2
      ? ['🍎', '🌙', '⭐', '🐟', '🌻', '🚗', '🎈', '🔑', '⚽', '🍄']
      : ['🍎', '🍅', '🍒', '🌙', '⭐', '☀️', '🐟', '🐠', '🌻', '🌼', '🚗', '🚕', '🎈', '🔑', '⚽', '🏀'];

    const duo = document.createElement('div');
    duo.className = 'dif-duo';
    duo.innerHTML = `<div class="dif-bloc"><small>Modèle</small><div class="dif-grille modele"></div></div>
      <div class="dif-bloc"><small>Touche les différences ici</small><div class="dif-grille jeu"></div></div>`;
    ctx.zone.appendChild(duo);
    const modele = duo.querySelector('.modele'), jeu = duo.querySelector('.jeu');
    [modele, jeu].forEach(g => {
      g.style.gridTemplateColumns = `repeat(${COTE}, 1fr)`;
      g.style.setProperty('--taille-dif', `clamp(1rem, ${Math.round(40 / COTE)}vw, ${(5 / COTE).toFixed(2)}rem)`);
    });

    let manche = 0, erreurs = 0, restantes = new Set(), actif = false, debut = 0;
    const majStats = () => ctx.stats({ Manche: Math.min(manche + 1, MANCHES) + ' / ' + MANCHES, 'À trouver': restantes.size, Erreurs: erreurs });

    function nouvelleManche() {
      if (manche >= MANCHES) return terminer();
      const n = COTE * COTE;
      const haut = Array.from({ length: n }, () => SYMBOLES[Math.floor(Math.random() * SYMBOLES.length)]);
      const bas = haut.slice();
      const cases = Gala.outils.melanger([...Array(n).keys()]).slice(0, NB_DIF);
      cases.forEach(i => {
        const autres = SYMBOLES.filter(s => s !== haut[i]);
        bas[i] = autres[Math.floor(Math.random() * autres.length)];
      });
      restantes = new Set(cases);
      modele.innerHTML = haut.map(s => `<div>${s}</div>`).join('');
      jeu.innerHTML = bas.map((s, i) => `<button data-i="${i}" aria-label="case ${i + 1}">${s}</button>`).join('');
      majStats();
      actif = true;
    }

    function terminer() {
      const secondes = Math.round((performance.now() - debut) / 1000);
      const total = MANCHES * NB_DIF;
      const precision = total / (total + erreurs);
      const vitesse = Math.min(1, (CIBLE * MANCHES) / Math.max(1, secondes));
      ctx.message(`${total} différences en ${secondes} s, ${erreurs} erreur${erreurs > 1 ? 's' : ''}`);
      ctx.fin({ valeur: secondes + PENALITE * erreurs, reussite: precision * vitesse, reussi: true });
    }

    ctx.ecouter(jeu, 'click', e => {
      const b = e.target.closest('button');
      if (!b || !actif || b.classList.contains('trouve')) return;
      const i = Number(b.dataset.i);
      if (restantes.has(i)) {
        restantes.delete(i);
        b.classList.add('trouve');
        ctx.son('ok');
        majStats();
        if (!restantes.size) {
          actif = false;
          manche++;
          ctx.attendre(600, nouvelleManche);
        }
      } else {
        erreurs++;
        b.classList.add('faux');
        ctx.son('erreur');
        majStats();
        ctx.attendre(400, () => b.classList.remove('faux'));
      }
    });

    ctx.message('Prêt ?');
    ctx.attendre(900, () => {
      ctx.message('');
      debut = performance.now();
      nouvelleManche();
    });
  }
});
