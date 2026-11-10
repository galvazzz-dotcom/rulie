/* Liste de courses — mémoire de la vie de tous les jours.
   On lit une liste de courses, elle disparaît, puis on retrouve ses articles parmi d'autres.
   2 listes. Niveau : 4 à 12 articles ; dessins aux premiers niveaux, puis les mots seuls,
   et des leurres de la même famille (pommes / poires). Score = bons articles − articles en trop. */
Gala.enregistrer({
  id: 'courses',
  nom: 'Liste de courses',
  icone: '🛒',
  domaine: 'memoire',
  consigne: 'Lis bien la liste de courses. Quand elle disparaît, touche tous les articles qui étaient dessus, puis « Valider ». Attention aux articles en trop.',
  niveaux: 5,
  adaptatif: true,
  mesure: { unite: 'points', meilleur: 'haut' },

  demarrer(ctx) {
    Gala.outils.style('courses', `
      .cou-liste { background: var(--carte); border: 1px solid var(--bord); border-radius: 6px; padding: .8rem 1.2rem;
        width: min(90vw, 340px); font-size: 1.35rem; line-height: 1.7; box-shadow: var(--ombre); }
      .cou-liste div { border-bottom: 1px solid var(--bord); }
      .cou-liste div:last-child { border-bottom: none; }
      .cou-liste div::before { content: '☐ '; color: var(--discret); }
      .cou-choix { display: grid; grid-template-columns: repeat(auto-fill, minmax(8.5rem, 1fr)); gap: .45rem; width: min(96vw, 620px); }
      .cou-choix button { min-height: 58px; font-size: 1.1rem; justify-content: flex-start; text-align: left; gap: .4rem; }
      .cou-choix button.pris { background: var(--accent); border-color: var(--accent); color: var(--accent-texte); }
      .cou-choix button.bon { background: var(--ok); border-color: var(--ok); color: #fff; }
      .cou-choix button.trop { background: var(--erreur); border-color: var(--erreur); color: #fff; }
      .cou-choix button.oubli { border: 3px dashed var(--ok); }
    `);
    // Articles groupés par famille : les leurres viennent de préférence des mêmes familles.
    const FAMILLES = [
      [['🍎', 'pommes'], ['🍐', 'poires'], ['🍌', 'bananes'], ['🍊', 'oranges'], ['🍇', 'raisin'], ['🍓', 'fraises'], ['🍋', 'citrons'], ['🍑', 'pêches']],
      [['🥕', 'carottes'], ['🥔', 'pommes de terre'], ['🧅', 'oignons'], ['🥒', 'concombre'], ['🍅', 'tomates'], ['🥬', 'salade'], ['🧄', 'ail'], ['🥦', 'brocoli']],
      [['🥛', 'lait'], ['🧀', 'fromage'], ['🧈', 'beurre'], ['🥚', 'œufs'], ['🍦', 'glace'], ['🥣', 'yaourts'], ['🍶', 'crème fraîche']],
      [['🥖', 'baguette'], ['🥐', 'croissants'], ['🍪', 'biscuits'], ['🍰', 'gâteau'], ['🍫', 'chocolat'], ['🍯', 'miel'], ['🥞', 'crêpes']],
      [['🍗', 'poulet'], ['🥩', 'steak'], ['🐟', 'poisson'], ['🥓', 'jambon'], ['🌭', 'saucisses'], ['🦐', 'crevettes']],
      [['☕', 'café'], ['🍵', 'thé'], ['🧃', 'jus de fruits'], ['🍷', 'vin'], ['💧', 'eau'], ['🍺', 'bière']],
      [['🍚', 'riz'], ['🍝', 'pâtes'], ['🥫', 'conserves'], ['🧂', 'sel'], ['🫒', 'huile d\'olive'], ['🥜', 'cacahuètes']],
      [['🧻', 'papier toilette'], ['🧼', 'savon'], ['🪥', 'dentifrice'], ['🧽', 'éponges'], ['🧴', 'shampoing'], ['🗑️', 'sacs poubelle'], ['🔋', 'piles'], ['💡', 'ampoule']]
    ];
    const MANCHES = 2;
    const NB = [0, 4, 6, 8, 10, 12][ctx.niveau];
    const DESSINS = ctx.niveau <= 3;
    const VUE = 3000 + NB * 2500;

    const haut = document.createElement('div');
    const actions = document.createElement('div');
    actions.className = 'groupe';
    ctx.zone.append(haut, actions);

    let manche = 0, points = 0, liste = [], choix = [], pris = new Set(), attente = null;
    const total = MANCHES * NB;
    const majStats = () => ctx.stats({ Liste: Math.min(manche + 1, MANCHES) + ' / ' + MANCHES, Points: points + ' / ' + total });
    const etiquette = a => (DESSINS ? a[0] + ' ' : '') + a[1];

    function nouvelleManche() {
      if (manche >= MANCHES) {
        ctx.fin({ valeur: points, reussite: Math.max(0, points) / total, reussi: points >= total / 2 });
        return;
      }
      majStats();
      // On pioche dans quelques familles, et les leurres dans les mêmes familles.
      const familles = Gala.outils.melanger(FAMILLES).slice(0, Math.min(FAMILLES.length, Math.ceil(NB / 2) + 1));
      const reserve = Gala.outils.melanger(familles.flat());
      liste = reserve.slice(0, NB);
      const leurres = reserve.slice(NB, NB * 2);
      if (leurres.length < NB) leurres.push(...Gala.outils.melanger(FAMILLES.flat().filter(a => !reserve.includes(a))).slice(0, NB - leurres.length));
      choix = Gala.outils.melanger([...liste, ...leurres]);
      pris = new Set();
      haut.className = 'cou-liste';
      haut.innerHTML = liste.map(a => `<div>${etiquette(a)}</div>`).join('');
      actions.innerHTML = '<button class="principal" data-a="pret">J\'ai retenu</button>';
      ctx.message('Mémorise la liste…');
      attente = ctx.attendre(VUE, montrerChoix);
    }

    function montrerChoix() {
      clearTimeout(attente);
      ctx.message(`Touche les ${NB} articles de la liste.`);
      haut.className = 'cou-choix';
      haut.innerHTML = choix.map((a, i) => `<button data-i="${i}">${etiquette(a)}</button>`).join('');
      actions.innerHTML = '<button class="principal" data-a="valider">✔ Valider</button>';
    }

    function valider() {
      let bons = 0, trop = 0;
      [...haut.children].forEach((b, i) => {
        const surListe = liste.includes(choix[i]);
        if (pris.has(i) && surListe) { bons++; b.className = 'bon'; }
        else if (pris.has(i)) { trop++; b.className = 'trop'; }
        else if (surListe) b.className = 'oubli';
        b.disabled = true;
      });
      const gain = Math.max(0, bons - trop);
      points += gain;
      ctx.son(gain === NB ? 'ok' : 'clic');
      ctx.message(`${bons} sur ${NB} retrouvé${bons > 1 ? 's' : ''}${trop ? `, ${trop} en trop` : ''}. Les oubliés sont entourés en pointillés.`);
      majStats();
      manche++;
      actions.innerHTML = `<button class="principal" data-a="suite">${manche < MANCHES ? 'Liste suivante →' : 'Voir le résultat'}</button>`;
    }

    ctx.ecouter(haut, 'click', e => {
      const b = e.target.closest('button');
      if (!b || b.disabled) return;
      const i = Number(b.dataset.i);
      if (pris.has(i)) { pris.delete(i); b.className = ''; }
      else { pris.add(i); b.className = 'pris'; }
      ctx.son('clic');
    });

    ctx.ecouter(actions, 'click', e => {
      const b = e.target.closest('button');
      if (!b) return;
      if (b.dataset.a === 'pret') montrerChoix();
      else if (b.dataset.a === 'valider') valider();
      else if (b.dataset.a === 'suite') nouvelleManche();
    });

    nouvelleManche();
  }
});
