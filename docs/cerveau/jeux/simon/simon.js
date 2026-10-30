/* Suite de Simon — mémoire de travail (séquences visuelles et sonores).
   La suite s'allonge d'une case à chaque réussite. Deux erreurs et la partie s'arrête.
   Niveau : longueur de départ (3 à 7) et vitesse d'affichage. */
Gala.enregistrer({
  id: 'simon',
  nom: 'Suite de Simon',
  icone: '🔴',
  domaine: 'memoire',
  consigne: 'Regarde les cases s\'allumer, puis touche-les dans le même ordre. La suite s\'allonge à chaque réussite. Tu as droit à une erreur.',
  niveaux: 5,
  adaptatif: true,
  mesure: { unite: 'cases', meilleur: 'haut' },

  demarrer(ctx) {
    Gala.outils.style('simon', `
      .simon { display: grid; grid-template-columns: 1fr 1fr; gap: .8rem; width: min(86vw, 380px); }
      .simon button { aspect-ratio: 1; min-height: 0; font-size: 2.4rem; border-width: 4px; color: #fff;
        filter: saturate(.55) brightness(.8); transition: filter .12s, transform .12s; }
      .simon button.allume { filter: none; transform: scale(1.05); border-color: var(--texte); }
      .simon.attente button { cursor: default; }
    `);
    const DEPART = [0, 3, 4, 5, 6, 7][ctx.niveau];
    const VITESSE = [0, 700, 620, 560, 500, 440][ctx.niveau];
    const OBJECTIF = DEPART + 6; // longueur qui donne 100 %
    const CASES = [
      { coul: '#d64541', sym: '●', nom: 'rouge', note: 330 },
      { coul: '#2f6fd6', sym: '▲', nom: 'bleu', note: 392 },
      { coul: '#1f8a4c', sym: '■', nom: 'vert', note: 494 },
      { coul: '#c98a00', sym: '◆', nom: 'jaune', note: 587 }
    ];

    const plateau = document.createElement('div');
    plateau.className = 'simon attente';
    const boutons = CASES.map((c, i) => {
      const b = document.createElement('button');
      b.style.background = c.coul;
      b.style.borderColor = c.coul;
      b.textContent = c.sym;
      b.setAttribute('aria-label', c.nom);
      b.dataset.i = i;
      plateau.appendChild(b);
      return b;
    });
    ctx.zone.appendChild(plateau);

    let suite = [], saisie = 0, aMoi = false, vies = 2, meilleure = 0;

    const majStats = () => ctx.stats({ Longueur: suite.length, Record: meilleure, Vies: '♥'.repeat(vies) || '–' });

    function allumer(i, duree) {
      boutons[i].classList.add('allume');
      Gala.note(CASES[i].note, duree / 1000);
      ctx.attendre(duree, () => boutons[i].classList.remove('allume'));
    }

    function nouvelleSuite(longueur) {
      suite = [];
      for (let k = 0; k < longueur; k++) suite.push(Math.floor(Math.random() * 4));
    }

    function montrer() {
      aMoi = false;
      saisie = 0;
      plateau.classList.add('attente');
      majStats();
      ctx.message('Regarde bien…');
      suite.forEach((i, k) => ctx.attendre(600 + k * VITESSE, () => allumer(i, VITESSE * 0.7)));
      ctx.attendre(600 + suite.length * VITESSE, () => {
        aMoi = true;
        plateau.classList.remove('attente');
        ctx.message('À toi !');
      });
    }

    function terminer() {
      aMoi = false;
      plateau.classList.add('attente');
      const reussite = Math.max(0, Math.min(1, (meilleure - DEPART + 1) / (OBJECTIF - DEPART + 1)));
      ctx.fin({ valeur: meilleure || null, reussite, reussi: meilleure >= DEPART });
    }

    ctx.ecouter(plateau, 'click', e => {
      const b = e.target.closest('button');
      if (!b || !aMoi) return;
      const i = Number(b.dataset.i);
      allumer(i, 220);
      if (i !== suite[saisie]) {
        aMoi = false;
        vies--;
        ctx.son('erreur');
        majStats();
        if (!vies) {
          ctx.message('Raté ! La partie est finie.');
          ctx.attendre(600, terminer);
        } else {
          ctx.message('Raté ! Nouvelle suite de même longueur.');
          nouvelleSuite(suite.length);
          ctx.attendre(1200, montrer);
        }
        return;
      }
      saisie++;
      if (saisie === suite.length) {
        aMoi = false;
        meilleure = Math.max(meilleure, suite.length);
        ctx.son('ok');
        if (suite.length >= OBJECTIF) {
          majStats();
          ctx.message('Incroyable, suite maximale atteinte !');
          ctx.attendre(600, terminer);
          return;
        }
        ctx.message('Bravo ! Une case de plus.');
        suite.push(Math.floor(Math.random() * 4));
        ctx.attendre(900, montrer);
      }
    });

    nouvelleSuite(DEPART);
    montrer();
  }
});
