/* Calcul éclair — vitesse de traitement et calcul mental.
   15 calculs, 4 réponses proposées. Deux façons de jouer, choisies au début de la partie
   (le dernier choix est retenu) :
   - avec chrono : score = temps total + 3 s par erreur (moins = mieux), la réussite tient compte de la vitesse ;
   - sans chrono : pas de temps, pas de record ; la réussite ne dépend que des bonnes réponses. */
Gala.enregistrer({
  id: 'calcul',
  nom: 'Calcul éclair',
  icone: '➗',
  domaine: 'vitesse',
  consigne: 'Résous les 15 calculs en touchant la bonne réponse. Avec chrono : va le plus vite possible, chaque erreur ajoute 3 secondes. Sans chrono : prends ton temps.',
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
      .calcul-modes { display: grid; grid-template-columns: 1fr 1fr; gap: .6rem; width: min(92vw, 420px); }
      .calcul-modes button { min-height: 96px; flex-direction: column; gap: .2rem; font-size: 1.15rem; font-weight: 700; }
      .calcul-modes button small { font-weight: 400; font-size: .85rem; color: inherit; opacity: .85; }
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
    const memo = Gala.stockage.jeu('calcul');
    let chrono = memo.chrono !== false;
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
      question.textContent = '✓';
      reponses.innerHTML = '';
      if (!chrono) {
        ctx.message(`${bonnes} bonnes réponses sur ${QUESTIONS}`);
        ctx.fin({ valeur: null, reussite: bonnes / QUESTIONS, reussi: bonnes >= QUESTIONS / 2 });
        return;
      }
      const vitesse = Math.min(1, (CIBLE * QUESTIONS) / Math.max(1, secondes));
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

    // Choix du mode, puis petit compte à rebours avant de lancer le chrono.
    function lancer() {
      if (!chrono) {
        ctx.message('Sans chrono : prends ton temps.');
        debut = performance.now();
        suivante();
        return;
      }
      let compte = 3;
      question.textContent = compte;
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
    ctx.stats({ Calcul: '0 / ' + QUESTIONS, Erreurs: 0 });
    const modes = document.createElement('div');
    modes.className = 'calcul-modes';
    modes.innerHTML =
      `<button data-chrono="1" class="${chrono ? 'principal' : ''}">⏱️ Avec chrono<small>le plus vite possible</small></button>` +
      `<button data-chrono="0" class="${chrono ? '' : 'principal'}">🧘 Sans chrono<small>à ton rythme</small></button>`;
    question.textContent = 'Comment veux-tu jouer ?';
    question.style.fontSize = '1.4rem';
    ctx.zone.insertBefore(modes, reponses);
    ctx.ecouter(modes, 'click', e => {
      const b = e.target.closest('button');
      if (!b) return;
      chrono = b.dataset.chrono === '1';
      memo.chrono = chrono;
      Gala.stockage.sauver();
      modes.remove();
      question.style.fontSize = '';
      lancer();
    });
  }
});
