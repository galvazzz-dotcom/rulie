/* Le plus grand — vitesse de comparaison des nombres.
   20 paires : touche le plus grand des deux le plus vite possible (flèches ← → au clavier).
   Niveau : chiffres, puis nombres à deux et trois chiffres de plus en plus proches,
   puis petits calculs à comparer au niveau 5. Score = temps total + 3 s par erreur. */
Gala.enregistrer({
  id: 'plusgrand',
  nom: 'Le plus grand',
  icone: '🔢',
  domaine: 'vitesse',
  consigne: 'Deux nombres s\'affichent. Touche le plus grand, le plus vite possible. Chaque erreur ajoute 3 secondes.',
  niveaux: 5,
  adaptatif: true,
  mesure: { unite: 's', meilleur: 'bas' },

  demarrer(ctx) {
    Gala.outils.style('plusgrand', `
      .pg-duo { display: grid; grid-template-columns: 1fr 1fr; gap: .8rem; width: min(94vw, 480px); }
      .pg-duo button { min-height: 140px; font-size: clamp(2rem, 11vw, 3.4rem); font-weight: 800; font-variant-numeric: tabular-nums; }
      .pg-duo button.calc { font-size: clamp(1.6rem, 8vw, 2.4rem); }
      .pg-duo button.bon { border-color: var(--ok); background: var(--ok); color: #fff; }
      .pg-duo button.faux { border-color: var(--erreur); background: var(--erreur); color: #fff; }
    `);
    const ESSAIS = 20, PENALITE = 3;
    const CIBLE = [0, 1.2, 1.4, 1.7, 2, 3][ctx.niveau]; // secondes par paire pour 100 %
    const hasard = (a, b) => a + Math.floor(Math.random() * (b - a + 1));

    // Renvoie deux propositions { texte, valeur } de valeurs différentes.
    function paire() {
      const n = ctx.niveau;
      if (n === 5) {
        const calc = () => {
          const t = hasard(0, 2);
          if (t === 0) { const a = hasard(2, 19), b = hasard(2, 19); return { texte: `${a} + ${b}`, valeur: a + b }; }
          if (t === 1) { const a = hasard(2, 9), b = hasard(2, 6); return { texte: `${a} × ${b}`, valeur: a * b }; }
          const a = hasard(15, 40), b = hasard(2, 14); return { texte: `${a} − ${b}`, valeur: a - b };
        };
        let x, y;
        do { x = calc(); y = calc(); } while (x.valeur === y.valeur || Math.abs(x.valeur - y.valeur) > 8);
        return [x, y];
      }
      const [min, max, ecart] = [null, [1, 9, 8], [10, 99, 40], [10, 99, 9], [100, 999, 30]][n];
      let a, b;
      do { a = hasard(min, max); b = a + (Math.random() < 0.5 ? -1 : 1) * hasard(1, ecart); } while (b < min || b > max);
      return [{ texte: String(a), valeur: a }, { texte: String(b), valeur: b }];
    }

    const duo = document.createElement('div');
    duo.className = 'pg-duo';
    duo.innerHTML = '<button data-c="0"></button><button data-c="1"></button>';
    ctx.zone.appendChild(duo);
    const boutons = [...duo.children];

    let numero = 0, erreurs = 0, actuelle = null, actif = false, debut = 0;
    const majStats = () => ctx.stats({ Paire: Math.min(numero + 1, ESSAIS) + ' / ' + ESSAIS, Erreurs: erreurs });

    function suivante() {
      if (numero >= ESSAIS) return terminer();
      actuelle = paire();
      boutons.forEach((b, k) => {
        b.className = ctx.niveau === 5 ? 'calc' : '';
        b.textContent = actuelle[k].texte;
      });
      majStats();
      actif = true;
    }

    function terminer() {
      const secondes = Math.round((performance.now() - debut) / 1000);
      const precision = (ESSAIS - erreurs) / ESSAIS;
      const vitesse = Math.min(1, (CIBLE * ESSAIS) / Math.max(1, secondes));
      boutons.forEach(b => { b.textContent = ''; b.className = ''; });
      ctx.message(`${ESSAIS} paires en ${secondes} s, ${erreurs} erreur${erreurs > 1 ? 's' : ''}`);
      ctx.fin({ valeur: secondes + PENALITE * erreurs, reussite: precision * vitesse, reussi: true });
    }

    function choisir(k) {
      if (!actif) return;
      actif = false;
      const bon = actuelle[0].valeur > actuelle[1].valeur ? 0 : 1;
      boutons[bon].classList.add('bon');
      if (k === bon) {
        ctx.son('ok');
      } else {
        erreurs++;
        boutons[k].classList.add('faux');
        ctx.son('erreur');
      }
      numero++;
      majStats();
      ctx.attendre(k === bon ? 250 : 800, suivante);
    }

    ctx.ecouter(duo, 'click', e => {
      const b = e.target.closest('button');
      if (b) choisir(Number(b.dataset.c));
    });
    ctx.ecouter(document, 'keydown', e => {
      if (e.key === 'ArrowLeft') { e.preventDefault(); choisir(0); }
      if (e.key === 'ArrowRight') { e.preventDefault(); choisir(1); }
    });

    ctx.message('Prêt ?');
    ctx.attendre(900, () => {
      ctx.message('');
      debut = performance.now();
      suivante();
    });
  }
});
