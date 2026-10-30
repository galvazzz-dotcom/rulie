/* Empan de chiffres — mémoire de travail verbale.
   Des chiffres s'affichent un par un ; on les retape dans l'ordre (ou à l'envers aux niveaux 4 et 5).
   Chaque réussite ajoute un chiffre ; deux erreurs arrêtent la partie. */
Gala.enregistrer({
  id: 'empan',
  nom: 'Empan de chiffres',
  icone: '🔟',
  domaine: 'memoire',
  consigne: 'Des chiffres apparaissent un par un. Retiens-les puis tape-les dans le même ordre (à l\'envers aux niveaux 4 et 5). Tu as droit à une erreur.',
  niveaux: 5,
  adaptatif: true,
  mesure: { unite: 'chiffres', meilleur: 'haut' },

  demarrer(ctx) {
    Gala.outils.style('empan', `
      .empan-ecran { font-size: clamp(3rem, 18vw, 5rem); font-weight: 800; min-height: 1.3em; text-align: center; font-variant-numeric: tabular-nums; }
      .empan-saisie { font-size: 1.8rem; font-weight: 700; letter-spacing: .3em; min-height: 1.5em; text-align: center; font-variant-numeric: tabular-nums;
        border-bottom: 3px solid var(--bord); min-width: 10rem; padding: 0 .5rem; }
      .empan-sens { font-weight: 700; color: var(--accent); }
      .empan-pave { display: grid; grid-template-columns: repeat(3, 1fr); gap: .5rem; width: min(86vw, 320px); }
      .empan-pave button { min-height: 60px; font-size: 1.5rem; font-weight: 700; }
      .empan-pave.attente { visibility: hidden; }
    `);
    const ENVERS = ctx.niveau >= 4;
    const DEPART = [0, 3, 4, 5, 3, 4][ctx.niveau];
    const OBJECTIF = DEPART + 5;
    const AFFICHAGE = 900, PAUSE = 250;

    const sens = document.createElement('div');
    sens.className = 'empan-sens';
    sens.textContent = ENVERS ? '↩ À taper à l\'envers' : '→ À taper dans l\'ordre';
    const ecran = document.createElement('div');
    ecran.className = 'empan-ecran';
    const saisie = document.createElement('div');
    saisie.className = 'empan-saisie';
    const pave = document.createElement('div');
    pave.className = 'empan-pave attente';
    pave.innerHTML = [1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => `<button data-n="${n}">${n}</button>`).join('') +
      '<button data-n="eff" aria-label="Effacer">⌫</button><button data-n="0">0</button><button data-n="ok" class="principal">OK</button>';
    ctx.zone.append(sens, ecran, saisie, pave);

    let suite = [], tape = [], aMoi = false, vies = 2, meilleur = 0;
    const majStats = () => ctx.stats({ Chiffres: suite.length, Record: meilleur, Vies: '♥'.repeat(vies) || '–' });

    function nouvelleSuite(n) {
      suite = [];
      while (suite.length < n) {
        const c = Math.floor(Math.random() * 10);
        if (c !== suite[suite.length - 1]) suite.push(c); // pas deux fois le même chiffre de suite
      }
    }

    function montrer() {
      aMoi = false;
      tape = [];
      saisie.textContent = '';
      pave.classList.add('attente');
      majStats();
      ctx.message('Retiens bien…');
      suite.forEach((c, k) => {
        ctx.attendre(500 + k * (AFFICHAGE + PAUSE), () => { ecran.textContent = c; });
        ctx.attendre(500 + k * (AFFICHAGE + PAUSE) + AFFICHAGE, () => { ecran.textContent = ''; });
      });
      ctx.attendre(500 + suite.length * (AFFICHAGE + PAUSE), () => {
        aMoi = true;
        ecran.textContent = '?';
        pave.classList.remove('attente');
        ctx.message(ENVERS ? 'À toi, à l\'envers !' : 'À toi !');
      });
    }

    function valider() {
      if (!aMoi || tape.length !== suite.length) return;
      aMoi = false;
      const attendu = ENVERS ? suite.slice().reverse() : suite;
      const juste = tape.every((c, k) => c === attendu[k]);
      ecran.textContent = attendu.join('');
      if (juste) {
        meilleur = Math.max(meilleur, suite.length);
        ctx.son('ok');
        if (suite.length >= OBJECTIF) {
          majStats();
          ctx.message('Bravo, longueur maximale atteinte !');
          return ctx.attendre(800, terminer);
        }
        ctx.message('Bravo ! Un chiffre de plus.');
        nouvelleSuite(suite.length + 1);
      } else {
        vies--;
        ctx.son('erreur');
        majStats();
        if (!vies) {
          ctx.message('Raté. La bonne suite est affichée.');
          return ctx.attendre(1500, terminer);
        }
        ctx.message('Raté. Nouvelle suite de même longueur.');
        nouvelleSuite(suite.length);
      }
      ctx.attendre(1500, montrer);
    }

    function terminer() {
      const reussite = Math.max(0, Math.min(1, (meilleur - DEPART + 1) / (OBJECTIF - DEPART + 1)));
      ctx.fin({ valeur: meilleur || null, reussite, reussi: meilleur >= DEPART });
    }

    function touche(n) {
      if (!aMoi) return;
      if (n === 'eff') tape.pop();
      else if (n === 'ok') return valider();
      else if (tape.length < suite.length) tape.push(Number(n));
      saisie.textContent = tape.join('');
      ctx.son('clic');
      if (tape.length === suite.length) valider();
    }

    ctx.ecouter(pave, 'click', e => {
      const b = e.target.closest('button');
      if (b) touche(b.dataset.n);
    });
    ctx.ecouter(document, 'keydown', e => {
      if (e.key >= '0' && e.key <= '9') touche(e.key);
      else if (e.key === 'Backspace') touche('eff');
      else if (e.key === 'Enter') touche('ok');
    });

    nouvelleSuite(DEPART);
    montrer();
  }
});
