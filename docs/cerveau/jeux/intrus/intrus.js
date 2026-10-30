/* Trouve l'intrus — attention visuelle et recherche.
   12 grilles ; dans chacune un seul symbole diffère des autres. La grille grandit et l'intrus
   ressemble de plus en plus aux autres avec le niveau. Score = temps + 3 s par erreur. */
Gala.enregistrer({
  id: 'intrus',
  nom: 'Trouve l\'intrus',
  icone: '🔍',
  domaine: 'attention',
  consigne: 'Dans chaque grille, un seul symbole est différent des autres. Touche-le le plus vite possible. Chaque erreur ajoute 3 secondes.',
  niveaux: 5,
  adaptatif: true,
  mesure: { unite: 's', meilleur: 'bas' },

  demarrer(ctx) {
    Gala.outils.style('intrus', `
      .intrus { display: grid; gap: .3rem; width: min(92vw, 460px); }
      .intrus button { aspect-ratio: 1; min-height: 0; padding: 0; font-size: var(--taille-intrus); font-weight: 700; line-height: 1;
        font-family: "Segoe UI", Roboto, Arial, sans-serif; }
      .intrus button.faux { border-color: var(--erreur); background: var(--erreur); color: #fff; }
      .intrus button.bon { border-color: var(--ok); background: var(--ok); color: #fff; }
    `);
    const GRILLES = 12, PENALITE = 3;
    const COTE = [0, 3, 4, 5, 6, 7][ctx.niveau];
    const CIBLE = [0, 3, 3.5, 4, 5, 6][ctx.niveau]; // secondes par grille pour 100 %
    const PAIRES = {
      1: [['🍎', '🍌'], ['🐶', '🐱'], ['⭐', '🌙'], ['🚗', '🚲'], ['🌻', '🌵'], ['🎈', '🎁']],
      2: [['🍎', '🍅'], ['🐟', '🐠'], ['🌲', '🌳'], ['🍊', '🍑'], ['😀', '😃'], ['🐶', '🦊']],
      3: [['O', 'Q'], ['E', 'F'], ['P', 'R'], ['C', 'G'], ['M', 'N'], ['V', 'Y']],
      4: [['b', 'd'], ['p', 'q'], ['n', 'h'], ['u', 'v'], ['3', '8'], ['5', 'S']],
      5: [['b', 'd'], ['p', 'q'], ['6', '9'], ['E', 'F'], ['W', 'M'], ['Z', '2']]
    }[ctx.niveau];

    const grille = document.createElement('div');
    grille.className = 'intrus';
    grille.style.gridTemplateColumns = `repeat(${COTE}, 1fr)`;
    grille.style.setProperty('--taille-intrus', `clamp(1rem, ${Math.round(60 / COTE)}vw, ${(5.5 / COTE).toFixed(2)}rem)`);
    ctx.zone.appendChild(grille);

    let numero = 0, erreurs = 0, cible = -1, actif = false, debut = 0;
    const majStats = () => ctx.stats({ Grille: Math.min(numero + 1, GRILLES) + ' / ' + GRILLES, Erreurs: erreurs });

    function suivante() {
      if (numero >= GRILLES) return terminer();
      const paire = PAIRES[Math.floor(Math.random() * PAIRES.length)];
      const [commun, different] = Math.random() < 0.5 ? paire : [paire[1], paire[0]];
      cible = Math.floor(Math.random() * COTE * COTE);
      let html = '';
      for (let i = 0; i < COTE * COTE; i++) html += `<button data-i="${i}" aria-label="case ${i + 1}">${i === cible ? different : commun}</button>`;
      grille.innerHTML = html;
      majStats();
      actif = true;
    }

    function terminer() {
      const secondes = Math.round((performance.now() - debut) / 1000);
      const precision = GRILLES / (GRILLES + erreurs);
      const vitesse = Math.min(1, (CIBLE * GRILLES) / Math.max(1, secondes));
      grille.innerHTML = '';
      ctx.message(`${GRILLES} grilles en ${secondes} s, ${erreurs} erreur${erreurs > 1 ? 's' : ''}`);
      ctx.fin({ valeur: secondes + PENALITE * erreurs, reussite: precision * vitesse, reussi: true });
    }

    ctx.ecouter(grille, 'click', e => {
      const b = e.target.closest('button');
      if (!b || !actif) return;
      if (Number(b.dataset.i) === cible) {
        actif = false;
        b.classList.add('bon');
        ctx.son('ok');
        numero++;
        ctx.attendre(300, suivante);
      } else {
        erreurs++;
        b.classList.add('faux');
        ctx.son('erreur');
        majStats();
        ctx.attendre(400, () => b.classList.remove('faux'));
      }
    });

    ctx.message('Prêt ?');
    ctx.stats({ Grille: '0 / ' + GRILLES, Erreurs: 0 });
    ctx.attendre(900, () => {
      ctx.message('');
      debut = performance.now();
      suivante();
    });
  }
});
