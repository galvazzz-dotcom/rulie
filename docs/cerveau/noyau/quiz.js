/* Gala Cerveau — moteur commun des quiz à choix multiples (Culture générale, Géographie).
   Gala.quiz(ctx, idJeu, questions, { nombre, choix })
     questions : [{ theme, q, bonne, faux: [...] }]  (au moins `nombre`)
   Évite de reposer les questions vues dans les dernières parties, affiche la bonne réponse
   après chaque choix, et termine par ctx.fin({ valeur: bonnes, reussite }). */
(function () {
  'use strict';
  const Gala = (window.Gala = window.Gala || {});
  const echapper = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  Gala.majuscule = t => t.charAt(0).toUpperCase() + t.slice(1);

  Gala.quiz = function (ctx, idJeu, questions, options) {
    const NOMBRE = (options && options.nombre) || 10;
    const CHOIX = (options && options.choix) || 4;
    Gala.outils.style('quiz', `
      .quiz-theme { font-size: .85rem; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; color: var(--discret); }
      .quiz-question { font-size: clamp(1.2rem, 5.2vw, 1.55rem); font-weight: 650; text-align: center; max-width: 34rem; line-height: 1.35; min-height: 2.7em; }
      .quiz-choix { display: grid; grid-template-columns: 1fr; gap: .5rem; width: min(94vw, 520px); }
      .quiz-choix button { min-height: 58px; font-size: 1.15rem; font-weight: 650; justify-content: flex-start; text-align: left; padding: .5rem 1rem; }
      .quiz-choix button .lettre { flex: none; width: 1.8rem; height: 1.8rem; border-radius: 50%; background: var(--carte-2); display: inline-flex;
        align-items: center; justify-content: center; font-size: .9rem; margin-right: .3rem; }
      .quiz-choix button.bon { border-color: var(--ok); background: var(--ok); color: #fff; }
      .quiz-choix button.faux { border-color: var(--erreur); background: var(--erreur); color: #fff; }
      .quiz-choix button.bon .lettre, .quiz-choix button.faux .lettre { background: rgba(255, 255, 255, .25); }
      .quiz-suite { min-height: 48px; }
    `);

    // Questions récentes mises de côté (mémorisées avec les progrès du jeu).
    const memo = Gala.stockage.jeu(idJeu);
    const deja = new Set(memo.deja || []);
    const neuves = Gala.outils.melanger(questions.filter(q => !deja.has(q.q)));
    const vieilles = Gala.outils.melanger(questions.filter(q => deja.has(q.q)));
    const serie = neuves.concat(vieilles).slice(0, NOMBRE);
    const garder = Math.max(0, Math.min(questions.length - NOMBRE * 2, 120));
    memo.deja = (memo.deja || []).concat(serie.map(q => q.q)).slice(-garder);
    if (!garder) memo.deja = [];
    Gala.stockage.sauver();

    const theme = document.createElement('div');
    theme.className = 'quiz-theme';
    const texte = document.createElement('div');
    texte.className = 'quiz-question';
    const choix = document.createElement('div');
    choix.className = 'quiz-choix';
    const suite = document.createElement('div');
    suite.className = 'quiz-suite';
    ctx.zone.append(theme, texte, choix, suite);

    let numero = 0, bonnes = 0, actuelle = null, actif = false;
    const majStats = () => ctx.stats({ Question: Math.min(numero + 1, serie.length) + ' / ' + serie.length, Bonnes: bonnes });

    function suivante() {
      suite.innerHTML = '';
      if (numero >= serie.length) {
        theme.textContent = '';
        texte.textContent = `${bonnes} bonne${bonnes > 1 ? 's' : ''} réponse${bonnes > 1 ? 's' : ''} sur ${serie.length}`;
        choix.innerHTML = '';
        ctx.son('fin');
        ctx.attendre(900, () => ctx.fin({ valeur: bonnes, reussite: bonnes / serie.length, reussi: bonnes >= serie.length / 2 }));
        return;
      }
      actuelle = serie[numero];
      const reponses = Gala.outils.melanger([actuelle.bonne].concat(Gala.outils.melanger(actuelle.faux).slice(0, CHOIX - 1)));
      theme.textContent = actuelle.theme || '';
      texte.textContent = actuelle.q;
      choix.innerHTML = reponses.map((r, i) =>
        `<button data-r="${echapper(r)}"><span class="lettre" aria-hidden="true">${'ABCD'[i]}</span>${echapper(r)}</button>`).join('');
      ctx.message('');
      majStats();
      actif = true;
    }

    function repondre(b) {
      if (!b || !actif) return;
      actif = false;
      numero++;
      const juste = b.dataset.r === actuelle.bonne;
      [...choix.children].forEach(x => { if (x.dataset.r === actuelle.bonne) x.classList.add('bon'); });
      if (juste) { bonnes++; ctx.son('ok'); ctx.message('Bonne réponse !'); }
      else { b.classList.add('faux'); ctx.son('erreur'); ctx.message('La bonne réponse : ' + actuelle.bonne); }
      majStats();
      // Bonne réponse : on enchaîne. Erreur : on laisse le temps de lire, avec un bouton pour continuer.
      if (juste) ctx.attendre(1000, suivante);
      else suite.innerHTML = '<button class="principal">Question suivante →</button>';
    }

    ctx.ecouter(choix, 'click', e => repondre(e.target.closest('button')));
    ctx.ecouter(suite, 'click', e => { if (e.target.closest('button')) suivante(); });
    ctx.ecouter(document, 'keydown', e => {
      const i = 'abcd'.indexOf(e.key.toLowerCase());
      if (actif && i >= 0 && choix.children[i]) repondre(choix.children[i]);
      else if (!actif && e.key === 'Enter' && suite.firstChild) suivante();
    });

    suivante();
  };
})();
