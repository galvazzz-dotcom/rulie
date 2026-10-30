/* Paires — jeu de référence du contrat de jeu (mémoire de travail visuelle).
   Niveau 1 : 4 paires … niveau 5 : 12 paires. Réussite = coups idéaux / coups joués. */
Gala.enregistrer({
  id: 'paires',
  nom: 'Paires',
  icone: '🃏',
  domaine: 'memoire',
  consigne: 'Retourne deux cartes à la fois et retrouve toutes les paires en un minimum de coups.',
  niveaux: 5,
  adaptatif: true,
  mesure: { unite: 'coups', meilleur: 'bas' },

  demarrer(ctx) {
    Gala.outils.style('paires', `
      .paires { display: grid; gap: .5rem; width: min(92vw, 560px); }
      .paires button { aspect-ratio: 3 / 4; min-height: 0; padding: 0; font-size: clamp(1.6rem, 7vw, 2.6rem);
        background: var(--accent); border-color: var(--accent); border-radius: 12px; }
      .paires button.visible { background: var(--carte); border-color: var(--bord); }
      .paires button.trouvee { background: var(--carte-2); border-color: var(--ok); }
      .paires button .face { visibility: hidden; }
      .paires button.visible .face, .paires button.trouvee .face { visibility: visible; }
    `);

    const PAIRES = [0, 4, 6, 8, 10, 12][ctx.niveau];
    const COLONNES = [0, 4, 4, 4, 5, 6][ctx.niveau];
    const SYMBOLES = ['🍎', '🌻', '🐟', '🎈', '⭐', '🚲', '🎵', '🍄', '🦋', '⚓', '🔑', '🌙'];
    const cartes = Gala.outils.melanger(Gala.outils.melanger(SYMBOLES).slice(0, PAIRES).flatMap(s => [s, s]));

    let coups = 0, trouvees = 0, retournees = [], bloque = false;

    const grille = document.createElement('div');
    grille.className = 'paires';
    grille.style.gridTemplateColumns = `repeat(${COLONNES}, 1fr)`;
    cartes.forEach((symbole, i) => {
      const b = document.createElement('button');
      b.innerHTML = `<span class="face">${symbole}</span>`;
      b.setAttribute('aria-label', 'Carte ' + (i + 1));
      b.dataset.i = i;
      grille.appendChild(b);
    });
    ctx.zone.appendChild(grille);

    const majStats = () => ctx.stats({ Coups: coups, Paires: trouvees + ' / ' + PAIRES });
    majStats();
    ctx.message('Retourne une première carte');

    ctx.ecouter(grille, 'click', e => {
      const b = e.target.closest('button');
      if (!b || bloque || b.classList.contains('visible') || b.classList.contains('trouvee')) return;
      b.classList.add('visible');
      b.setAttribute('aria-label', cartes[b.dataset.i]);
      retournees.push(b);
      ctx.son('clic');
      if (retournees.length < 2) {
        ctx.message('');
        return;
      }

      coups++;
      const [a, c] = retournees;
      retournees = [];
      if (cartes[a.dataset.i] === cartes[c.dataset.i]) {
        a.classList.replace('visible', 'trouvee');
        c.classList.replace('visible', 'trouvee');
        trouvees++;
        ctx.son('ok');
        majStats();
        if (trouvees === PAIRES) {
          ctx.message('Toutes les paires sont trouvées !');
          // Une mémoire parfaite avec un peu de chance tourne autour de 1,6 coup par paire.
          ctx.fin({ valeur: coups, reussite: Math.min(1, (PAIRES * 1.6) / coups), reussi: true });
        }
      } else {
        bloque = true;
        majStats();
        ctx.attendre(900, () => {
          [a, c].forEach(x => {
            x.classList.remove('visible');
            x.setAttribute('aria-label', 'Carte ' + (Number(x.dataset.i) + 1));
          });
          bloque = false;
        });
      }
    });
  }
});
