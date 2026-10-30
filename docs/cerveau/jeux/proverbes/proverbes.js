/* Proverbes à compléter — langage et mémoire sémantique.
   10 proverbes ; on choisit la bonne fin parmi 3 ou 4. Le niveau fait passer des proverbes
   les plus connus aux moins courants, avec plus de propositions. Sans chrono. */
Gala.enregistrer({
  id: 'proverbes',
  nom: 'Proverbes',
  icone: '💬',
  domaine: 'langage',
  consigne: 'Le début d\'un proverbe s\'affiche. Choisis la bonne fin parmi les propositions. Prends ton temps.',
  niveaux: 5,
  adaptatif: true,
  mesure: { unite: 'bonnes réponses', meilleur: 'haut' },

  demarrer(ctx) {
    Gala.outils.style('proverbes', `
      .prov-debut { font-size: clamp(1.4rem, 6vw, 1.9rem); font-weight: 700; text-align: center; max-width: 30rem; line-height: 1.3; }
      .prov-debut span { color: var(--accent); }
      .prov-choix { display: flex; flex-direction: column; gap: .5rem; width: min(92vw, 480px); }
      .prov-choix button { justify-content: flex-start; text-align: left; min-height: 60px; font-size: 1.1rem; }
      .prov-choix button.bon { border-color: var(--ok); background: var(--ok); color: #fff; }
      .prov-choix button.faux { border-color: var(--erreur); background: var(--erreur); color: #fff; }
    `);
    const QUESTIONS = 10;
    const RARETES = { 1: [1], 2: [1], 3: [1, 2], 4: [2, 3], 5: [3] }[ctx.niveau];
    const CHOIX = ctx.niveau === 1 ? 3 : 4;
    const tous = Gala.donnees.proverbes;
    const reserve = Gala.outils.melanger(tous.filter(p => RARETES.includes(p[2]))).slice(0, QUESTIONS);

    const debut = document.createElement('div');
    debut.className = 'prov-debut';
    const choix = document.createElement('div');
    choix.className = 'prov-choix';
    ctx.zone.append(debut, choix);

    let numero = 0, bonnes = 0, actuel = null, actif = false;
    const majStats = () => ctx.stats({ Proverbe: Math.min(numero + 1, QUESTIONS) + ' / ' + QUESTIONS, Bonnes: bonnes });
    const echapper = t => t.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

    function suivant() {
      if (numero >= reserve.length) {
        ctx.fin({ valeur: bonnes, reussite: bonnes / reserve.length, reussi: bonnes >= reserve.length / 2 });
        return;
      }
      actuel = reserve[numero];
      // Leurres : des fins d'autres proverbes, de préférence de la même rareté.
      const autres = Gala.outils.melanger(tous.filter(p => p !== actuel))
        .sort((a, b) => (a[2] === actuel[2] ? 0 : 1) - (b[2] === actuel[2] ? 0 : 1));
      const propositions = Gala.outils.melanger([actuel[1], ...autres.slice(0, CHOIX - 1).map(p => p[1])]);
      debut.innerHTML = `${echapper(actuel[0])}… <span>?</span>`;
      choix.innerHTML = propositions.map((t, i) => `<button data-t="${echapper(t)}"><b>${i + 1}.</b>&nbsp;${echapper(t)}</button>`).join('');
      ctx.message('');
      majStats();
      actif = true;
    }

    function repondre(b) {
      if (!actif) return;
      actif = false;
      numero++;
      const juste = b.dataset.t === actuel[1];
      [...choix.children].find(x => x.dataset.t === actuel[1]).classList.add('bon');
      debut.innerHTML = `${echapper(actuel[0])}, <span>${echapper(actuel[1])}</span>.`;
      if (juste) {
        bonnes++;
        ctx.son('ok');
      } else {
        b.classList.add('faux');
        ctx.son('erreur');
      }
      majStats();
      ctx.attendre(juste ? 1100 : 2200, suivant);
    }

    ctx.ecouter(choix, 'click', e => {
      const b = e.target.closest('button');
      if (b) repondre(b);
    });
    ctx.ecouter(document, 'keydown', e => {
      const n = Number(e.key);
      if (n >= 1 && n <= choix.children.length) repondre(choix.children[n - 1]);
    });

    suivant();
  }
});
