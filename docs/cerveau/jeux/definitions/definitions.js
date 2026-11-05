/* Définitions — langage et vocabulaire : trouver le mot qui correspond à la définition.
   10 définitions, 4 mots proposés (3 au niveau 1). Le niveau fait passer des mots courants
   aux mots plus rares. Sans chrono. */
Gala.enregistrer({
  id: 'definitions',
  nom: 'Définitions',
  icone: '📚',
  domaine: 'langage',
  consigne: 'Lis la définition et choisis le mot qui lui correspond. Prends ton temps.',
  niveaux: 5,
  adaptatif: true,
  mesure: { unite: 'bonnes réponses', meilleur: 'haut' },

  demarrer(ctx) {
    Gala.outils.style('definitions', `
      .def-texte { font-size: clamp(1.25rem, 5.5vw, 1.6rem); font-weight: 600; text-align: center; max-width: 32rem; line-height: 1.35; }
      .def-choix { display: grid; grid-template-columns: 1fr 1fr; gap: .5rem; width: min(94vw, 480px); }
      .def-choix button { min-height: 64px; font-size: 1.2rem; font-weight: 700; }
      .def-choix button.bon { border-color: var(--ok); background: var(--ok); color: #fff; }
      .def-choix button.faux { border-color: var(--erreur); background: var(--erreur); color: #fff; }
    `);
    const QUESTIONS = 10;
    const RARETES = { 1: [1], 2: [1, 2], 3: [2], 4: [2, 3], 5: [3] }[ctx.niveau];
    const CHOIX = ctx.niveau === 1 ? 3 : 4;
    const tous = Gala.donnees.definitions;
    const reserve = Gala.outils.melanger(tous.filter(d => RARETES.includes(d[2]))).slice(0, QUESTIONS);
    const echapper = t => t.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

    const texte = document.createElement('div');
    texte.className = 'def-texte';
    const choix = document.createElement('div');
    choix.className = 'def-choix';
    ctx.zone.append(texte, choix);

    let numero = 0, bonnes = 0, actuel = null, actif = false;
    const majStats = () => ctx.stats({ Définition: Math.min(numero + 1, QUESTIONS) + ' / ' + QUESTIONS, Bonnes: bonnes });

    function suivante() {
      if (numero >= reserve.length) {
        ctx.fin({ valeur: bonnes, reussite: bonnes / reserve.length, reussi: bonnes >= reserve.length / 2 });
        return;
      }
      actuel = reserve[numero];
      // Leurres : d'autres mots, de préférence de la même rareté.
      const autres = Gala.outils.melanger(tous.filter(d => d !== actuel))
        .sort((a, b) => (a[2] === actuel[2] ? 0 : 1) - (b[2] === actuel[2] ? 0 : 1));
      const mots = Gala.outils.melanger([actuel[0], ...autres.slice(0, CHOIX - 1).map(d => d[0])]);
      texte.textContent = actuel[1];
      choix.innerHTML = mots.map(m => `<button data-m="${echapper(m)}">${echapper(m)}</button>`).join('');
      ctx.message('');
      majStats();
      actif = true;
    }

    ctx.ecouter(choix, 'click', e => {
      const b = e.target.closest('button');
      if (!b || !actif) return;
      actif = false;
      numero++;
      [...choix.children].find(x => x.dataset.m === actuel[0]).classList.add('bon');
      const juste = b.dataset.m === actuel[0];
      if (juste) { bonnes++; ctx.son('ok'); } else { b.classList.add('faux'); ctx.son('erreur'); }
      majStats();
      ctx.attendre(juste ? 900 : 2000, suivante);
    });

    suivante();
  }
});
