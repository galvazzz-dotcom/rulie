/* Calcul éclair — vitesse de traitement et calcul mental.
   15 calculs, 4 réponses proposées. Score = temps total + 3 s par erreur (moins = mieux). */
Gala.enregistrer({
  id: 'calcul',
  nom: 'Calcul éclair',
  icone: '➗',
  domaine: 'vitesse',
  consigne: 'Résous les 15 calculs le plus vite possible en touchant la bonne réponse. Chaque erreur ajoute 3 secondes.',
  niveaux: 5,
  adaptatif: true,
  mesure: { unite: 's', meilleur: 'bas' },

  demarrer(ctx) {
    Gala.outils.style('calcul', `
      .calcul-question { font-size: clamp(2.2rem, 11vw, 3.4rem); font-weight: 800; min-height: 1.4em; text-align: center; font-variant-numeric: tabular-nums; }
      .calcul-reponses { display: grid; grid-template-columns: 1fr 1fr; gap: .6rem; width: min(92vw, 420px); }
      .calcul-reponses button { min-height: 72px; font-size: 1.6rem; font-weight: 700; font-variant-numeric: tabular-nums; }
      .calcul-reponses button.bon { border-color: var(--ok); background: var(--ok); color: #fff; }
      .calcul-reponses button.faux { border-color: var(--erreur); background: var(--erreur); color: #fff; }
    `);
    const QUESTIONS = 15, PENALITE = 3;
    const CIBLE = [0, 5, 6, 7, 8, 9][ctx.niveau]; // secondes par calcul pour 100 %
    const hasard = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
    const pioche = t => t[Math.floor(Math.random() * t.length)];

    function genererQuestion() {
      const n = ctx.niveau;
      const op = pioche({ 1: ['+'], 2: ['+', '-'], 3: ['+', '-', '×'], 4: ['+', '-', '×'], 5: ['+-', '×', '÷', '-'] }[n]);
      let a, b, c, texte, res;
      if (op === '+') {
        const max = [0, 10, 30, 50, 99, 99][n];
        a = hasard(1, max); b = hasard(1, max);
        texte = `${a} + ${b}`; res = a + b;
      } else if (op === '-') {
        const max = [0, 10, 30, 50, 99, 150][n];
        a = hasard(2, max); b = hasard(1, a);
        texte = `${a} − ${b}`; res = a - b;
      } else if (op === '×') {
        const max = n === 3 ? 9 : 12;
        a = hasard(2, max); b = hasard(2, max);
        texte = `${a} × ${b}`; res = a * b;
      } else if (op === '÷') {
        b = hasard(2, 12); res = hasard(2, 12); a = b * res;
        texte = `${a} ÷ ${b}`;
      } else { // a + b − c
        a = hasard(10, 60); b = hasard(5, 40); c = hasard(1, a + b - 1);
        texte = `${a} + ${b} − ${c}`; res = a + b - c;
      }
      // Leurres plausibles : erreurs d'une unité, d'une dizaine, ou d'une table.
      const ecarts = op === '×' || op === '÷' ? [1, -1, b || 2, -(b || 2), 10, -10, 2] : [1, -1, 2, -2, 10, -10, 3];
      const choix = new Set([res]);
      for (const e of Gala.outils.melanger(ecarts)) {
        if (choix.size === 4) break;
        if (res + e >= 0) choix.add(res + e);
      }
      while (choix.size < 4) choix.add(res + choix.size + 4);
      return { texte, res, choix: Gala.outils.melanger([...choix]) };
    }

    const question = document.createElement('div');
    question.className = 'calcul-question';
    const reponses = document.createElement('div');
    reponses.className = 'calcul-reponses';
    ctx.zone.append(question, reponses);

    let numero = 0, erreurs = 0, actuelle = null, actif = false, debut = 0;
    const majStats = () => ctx.stats({ Calcul: Math.min(numero + 1, QUESTIONS) + ' / ' + QUESTIONS, Erreurs: erreurs });

    function suivante() {
      if (numero >= QUESTIONS) return terminer();
      actuelle = genererQuestion();
      question.textContent = actuelle.texte + ' = ?';
      reponses.innerHTML = actuelle.choix.map(v => `<button data-v="${v}">${v}</button>`).join('');
      majStats();
      actif = true;
    }

    function terminer() {
      const secondes = Math.round((performance.now() - debut) / 1000);
      const bonnes = QUESTIONS - erreurs;
      const vitesse = Math.min(1, (CIBLE * QUESTIONS) / Math.max(1, secondes));
      question.textContent = '✓';
      reponses.innerHTML = '';
      ctx.message(`${bonnes} bonnes réponses en ${secondes} s`);
      ctx.fin({ valeur: secondes + PENALITE * erreurs, reussite: (bonnes / QUESTIONS) * vitesse, reussi: bonnes >= QUESTIONS / 2 });
    }

    ctx.ecouter(reponses, 'click', e => {
      const b = e.target.closest('button');
      if (!b || !actif) return;
      actif = false;
      const bon = Number(b.dataset.v) === actuelle.res;
      if (bon) {
        b.classList.add('bon');
        ctx.son('ok');
      } else {
        erreurs++;
        b.classList.add('faux');
        reponses.querySelector(`[data-v="${actuelle.res}"]`).classList.add('bon');
        ctx.son('erreur');
      }
      numero++;
      ctx.attendre(bon ? 250 : 900, suivante);
    });

    // Petit compte à rebours avant de lancer le chrono.
    let compte = 3;
    question.textContent = compte;
    ctx.stats({ Calcul: '0 / ' + QUESTIONS, Erreurs: 0 });
    const decompte = ctx.repeter(700, () => {
      compte--;
      if (compte > 0) {
        question.textContent = compte;
        return;
      }
      clearInterval(decompte);
      debut = performance.now();
      suivante();
    });
  }
});
