/* Où était-ce ? — mémoire visuo-spatiale.
   Des objets s'affichent dans une grille puis disparaissent ; il faut retrouver la case de chacun.
   3 manches. Niveau : taille de la grille (3×3 à 5×5) et nombre d'objets (3 à 7). */
Gala.enregistrer({
  id: 'objets',
  nom: 'Où était-ce ?',
  icone: '📍',
  domaine: 'memoire',
  consigne: 'Mémorise la place de chaque objet dans la grille. Quand ils disparaissent, touche la case où se trouvait l\'objet demandé.',
  niveaux: 5,
  adaptatif: true,
  mesure: { unite: 'bonnes réponses', meilleur: 'haut' },

  demarrer(ctx) {
    Gala.outils.style('objets', `
      .objets-question { font-size: 1.4rem; font-weight: 700; min-height: 2.2em; display: flex; align-items: center; gap: .5rem; }
      .objets-question span { font-size: 2.4rem; }
      .objets { display: grid; gap: .4rem; width: min(90vw, 420px); }
      .objets button { aspect-ratio: 1; min-height: 0; padding: 0; font-size: clamp(1.6rem, 9vw, 2.6rem); }
      .objets button.bon { border-color: var(--ok); background: var(--ok); }
      .objets button.faux { border-color: var(--erreur); background: var(--erreur); }
    `);
    const MANCHES = 3;
    const COTE = [0, 3, 4, 4, 5, 5][ctx.niveau];
    const NB = [0, 3, 4, 5, 6, 7][ctx.niveau];
    const VUE = 1500 + NB * 900; // temps d'observation en ms
    const OBJETS = ['🍎', '🔑', '⚓', '🎈', '🌻', '🐟', '⭐', '🎵', '🚲', '🍄', '🦋', '🌙', '☂️', '🎁'];

    const question = document.createElement('div');
    question.className = 'objets-question';
    const grille = document.createElement('div');
    grille.className = 'objets';
    grille.style.gridTemplateColumns = `repeat(${COTE}, 1fr)`;
    for (let i = 0; i < COTE * COTE; i++) grille.insertAdjacentHTML('beforeend', `<button data-i="${i}" aria-label="case ${i + 1}"></button>`);
    ctx.zone.append(question, grille);
    const cases = [...grille.children];

    let manche = 0, bonnes = 0, places = [], demandes = [], actif = false;
    const total = MANCHES * NB;
    const majStats = () => ctx.stats({ Manche: Math.min(manche + 1, MANCHES) + ' / ' + MANCHES, Bonnes: bonnes + ' / ' + total });

    function nouvelleManche() {
      if (manche >= MANCHES) {
        ctx.fin({ valeur: bonnes, reussite: bonnes / total, reussi: bonnes >= total / 2 });
        return;
      }
      majStats();
      const objets = Gala.outils.melanger(OBJETS).slice(0, NB);
      const positions = Gala.outils.melanger([...Array(COTE * COTE).keys()]).slice(0, NB);
      places = objets.map((o, k) => ({ objet: o, i: positions[k] }));
      cases.forEach(c => { c.textContent = ''; c.className = ''; });
      places.forEach(p => { cases[p.i].textContent = p.objet; });
      question.textContent = 'Mémorise…';
      ctx.message('');
      ctx.attendre(VUE, () => {
        cases.forEach(c => { c.textContent = ''; });
        demandes = Gala.outils.melanger(places);
        demander();
      });
    }

    function demander() {
      if (!demandes.length) {
        manche++;
        ctx.attendre(900, nouvelleManche);
        return;
      }
      cases.forEach(c => { if (!c.classList.contains('bon')) { c.className = ''; c.textContent = ''; } });
      question.innerHTML = `Où était <span>${demandes[0].objet}</span> ?`;
      actif = true;
    }

    ctx.ecouter(grille, 'click', e => {
      const b = e.target.closest('button');
      if (!b || !actif) return;
      actif = false;
      const attendu = demandes.shift();
      const juste = Number(b.dataset.i) === attendu.i;
      cases[attendu.i].textContent = attendu.objet;
      cases[attendu.i].classList.add('bon');
      if (juste) {
        bonnes++;
        ctx.son('ok');
      } else {
        b.classList.add('faux');
        ctx.son('erreur');
      }
      majStats();
      ctx.attendre(juste ? 500 : 1200, demander);
    });

    nouvelleManche();
  }
});
