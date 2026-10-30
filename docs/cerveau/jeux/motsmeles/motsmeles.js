/* Mots mêlés — langage et balayage visuel.
   Retrouve les mots de la liste cachés dans la grille : touche la première puis la dernière lettre.
   Niveau : taille de la grille, nombre de mots, puis diagonales et mots à l'envers. */
Gala.enregistrer({
  id: 'motsmeles',
  nom: 'Mots mêlés',
  icone: '🔠',
  domaine: 'langage',
  consigne: 'Les mots de la liste sont cachés dans la grille. Touche la première lettre d\'un mot, puis sa dernière lettre. Ils peuvent être en ligne, en colonne, puis en diagonale ou à l\'envers aux niveaux plus difficiles.',
  niveaux: 5,
  adaptatif: true,
  mesure: { unite: 's', meilleur: 'bas' },

  demarrer(ctx) {
    Gala.outils.style('motsmeles', `
      .mm-liste { display: flex; flex-wrap: wrap; gap: .3rem .8rem; justify-content: center; font-weight: 700; letter-spacing: .05em; }
      .mm-liste span.trouve { text-decoration: line-through; color: var(--ok); }
      .mm-grille { display: grid; gap: 2px; width: min(94vw, 520px); touch-action: manipulation; }
      .mm-grille button { aspect-ratio: 1; min-height: 0; padding: 0; border-radius: 6px; border-width: 1px; font-weight: 700;
        font-size: var(--taille-mm); }
      .mm-grille button.depart { background: var(--accent); color: var(--accent-texte); border-color: var(--accent); }
      .mm-grille button.trouve { background: var(--carte-2); background: color-mix(in srgb, var(--ok) 30%, var(--carte)); border-color: var(--ok); }
    `);
    const N = [0, 8, 9, 10, 11, 12][ctx.niveau];
    const NB_MOTS = [0, 4, 5, 6, 6, 7][ctx.niveau];
    const LONGUEURS = { 1: [4, 5], 2: [4, 5, 6], 3: [5, 6, 7], 4: [5, 6, 7, 8], 5: [6, 7, 8, 9] }[ctx.niveau];
    const DIRS = {
      1: [[1, 0], [0, 1]],
      2: [[1, 0], [0, 1]],
      3: [[1, 0], [0, 1], [1, 1]],
      4: [[1, 0], [0, 1], [1, 1], [-1, 0], [0, -1]],
      5: [[1, 0], [0, 1], [1, 1], [-1, 0], [0, -1], [-1, -1], [1, -1], [-1, 1]]
    }[ctx.niveau];
    const CIBLE = 30; // secondes par mot pour 100 %

    // Placement des mots, puis lettres au hasard dans les cases vides.
    let grille, mots;
    for (let tentative = 0; tentative < 50; tentative++) {
      grille = Array(N * N).fill('');
      mots = [];
      const candidats = Gala.outils.melanger(LONGUEURS.flatMap(n => (Gala.donnees.mots[n] || []).filter(m => m.length <= N)));
      for (const mot of candidats) {
        if (mots.length >= NB_MOTS) break;
        if (mots.some(m => m.mot === mot)) continue;
        let place = null;
        for (let essai = 0; essai < 80 && !place; essai++) {
          const [dx, dy] = DIRS[Math.floor(Math.random() * DIRS.length)];
          const x = Math.floor(Math.random() * N), y = Math.floor(Math.random() * N);
          const xf = x + dx * (mot.length - 1), yf = y + dy * (mot.length - 1);
          if (xf < 0 || yf < 0 || xf >= N || yf >= N) continue;
          let ok = true;
          for (let k = 0; k < mot.length && ok; k++) {
            const c = grille[(y + dy * k) * N + x + dx * k];
            if (c && c !== mot[k]) ok = false;
          }
          if (ok) place = { x, y, dx, dy };
        }
        if (!place) continue;
        for (let k = 0; k < mot.length; k++) grille[(place.y + place.dy * k) * N + place.x + place.dx * k] = mot[k];
        mots.push({ mot, debut: place.y * N + place.x, fin: (place.y + place.dy * (mot.length - 1)) * N + place.x + place.dx * (mot.length - 1), trouve: false });
      }
      if (mots.length === NB_MOTS) break;
    }
    const ALPHABET = 'AAABCDEEEEFGHIIIJLLMNNOOPRRSSSTTTUUV';
    grille = grille.map(c => c || ALPHABET[Math.floor(Math.random() * ALPHABET.length)]);

    const liste = document.createElement('div');
    liste.className = 'mm-liste';
    const plateau = document.createElement('div');
    plateau.className = 'mm-grille';
    plateau.style.gridTemplateColumns = `repeat(${N}, 1fr)`;
    plateau.style.setProperty('--taille-mm', `clamp(.85rem, ${Math.floor(60 / N)}vw, ${(1.6 * 8 / N).toFixed(2)}rem)`);
    plateau.innerHTML = grille.map((c, i) => `<button data-i="${i}">${c}</button>`).join('');
    const abandon = document.createElement('button');
    abandon.textContent = 'J\'abandonne';
    ctx.zone.append(liste, plateau, abandon);
    const cases = [...plateau.children];

    let depart = -1, finie = false;
    const debut = performance.now();
    const trouves = () => mots.filter(m => m.trouve).length;

    function majListe() {
      liste.innerHTML = mots.map(m => `<span class="${m.trouve ? 'trouve' : ''}">${m.mot}</span>`).join('');
      ctx.stats({ Mots: trouves() + ' / ' + mots.length });
    }

    function marquer(m) {
      const x0 = m.debut % N, y0 = Math.floor(m.debut / N), x1 = m.fin % N, y1 = Math.floor(m.fin / N);
      const dx = Math.sign(x1 - x0), dy = Math.sign(y1 - y0);
      for (let k = 0; k < m.mot.length; k++) cases[(y0 + dy * k) * N + x0 + dx * k].classList.add('trouve');
    }

    function terminer(abandonne) {
      finie = true;
      const secondes = Math.round((performance.now() - debut) / 1000);
      const t = trouves();
      mots.forEach(m => { if (!m.trouve) marquer(m); });
      const vitesse = Math.min(1, (CIBLE * mots.length) / Math.max(1, secondes));
      ctx.fin({ valeur: abandonne ? null : secondes, reussite: (t / mots.length) * vitesse, reussi: !abandonne });
    }

    ctx.ecouter(plateau, 'click', e => {
      const b = e.target.closest('button');
      if (!b || finie) return;
      const i = Number(b.dataset.i);
      if (depart < 0) {
        depart = i;
        b.classList.add('depart');
        ctx.son('clic');
        return;
      }
      cases[depart].classList.remove('depart');
      if (i === depart) { depart = -1; return; } // second appui sur la même lettre : on annule
      const m = mots.find(w => !w.trouve && ((w.debut === depart && w.fin === i) || (w.debut === i && w.fin === depart)));
      depart = -1;
      if (!m) {
        ctx.son('erreur');
        ctx.message('Pas de mot de la liste ici');
        return;
      }
      m.trouve = true;
      marquer(m);
      ctx.son('ok');
      ctx.message(m.mot + ' trouvé !');
      majListe();
      if (trouves() === mots.length) terminer(false);
    });

    ctx.ecouter(abandon, 'click', () => {
      if (finie) return;
      ctx.message('Les mots restants sont surlignés');
      terminer(true);
    });

    majListe();
  }
});
