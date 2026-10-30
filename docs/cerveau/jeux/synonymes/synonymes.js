/* Synonymes et contraires — langage et vocabulaire.
   10 questions : trouver le mot de même sens, ou de sens contraire, parmi 4.
   Niveau 1 : synonymes de mots courants ; 2 : contraires ; 3 à 5 : les deux mélangés,
   mots plus rares, et le piège du mot de sens opposé parmi les propositions. */
Gala.enregistrer({
  id: 'synonymes',
  nom: 'Synonymes et contraires',
  icone: '🔀',
  domaine: 'langage',
  consigne: 'Lis bien la question : trouve le mot qui veut dire la MÊME chose (synonyme) ou le CONTRAIRE, selon ce qui est demandé.',
  niveaux: 5,
  adaptatif: true,
  mesure: { unite: 'bonnes réponses', meilleur: 'haut' },

  demarrer(ctx) {
    Gala.outils.style('synonymes', `
      .syn-question { text-align: center; }
      .syn-question .type { font-weight: 800; padding: .1rem .6rem; border-radius: 999px; color: #fff; }
      .syn-question .mot { display: block; font-size: clamp(1.8rem, 9vw, 2.6rem); font-weight: 800; margin-top: .3rem; }
      .syn-choix { display: grid; grid-template-columns: 1fr 1fr; gap: .5rem; width: min(94vw, 460px); }
      .syn-choix button { min-height: 64px; font-size: 1.2rem; font-weight: 600; }
      .syn-choix button.bon { border-color: var(--ok); background: var(--ok); color: #fff; }
      .syn-choix button.faux { border-color: var(--erreur); background: var(--erreur); color: #fff; }
    `);
    const QUESTIONS = 10;
    const RARETES = { 1: [1], 2: [1], 3: [1, 2], 4: [2, 3], 5: [3] }[ctx.niveau];
    const TYPES = { 1: ['syn'], 2: ['con'], 3: ['syn', 'con'], 4: ['syn', 'con'], 5: ['syn', 'con'] }[ctx.niveau];
    const PIEGE = ctx.niveau >= 3;
    const tous = Gala.donnees.synonymes;
    const reserve = Gala.outils.melanger(tous.filter(e => RARETES.includes(e[4]))).slice(0, QUESTIONS);

    const question = document.createElement('div');
    question.className = 'syn-question';
    const choix = document.createElement('div');
    choix.className = 'syn-choix';
    ctx.zone.append(question, choix);

    let numero = 0, bonnes = 0, attendu = '', actif = false;
    const majStats = () => ctx.stats({ Question: Math.min(numero + 1, QUESTIONS) + ' / ' + QUESTIONS, Bonnes: bonnes });

    function suivante() {
      if (numero >= reserve.length) {
        ctx.fin({ valeur: bonnes, reussite: bonnes / reserve.length, reussi: bonnes >= reserve.length / 2 });
        return;
      }
      const [mot, syn, con, famille] = reserve[numero];
      const type = TYPES[Math.floor(Math.random() * TYPES.length)];
      attendu = type === 'syn' ? syn : con;
      const autres = Gala.outils.melanger(tous.filter(e => e[3] !== famille).flatMap(e => [e[0], e[1], e[2]]));
      const leurres = [];
      if (PIEGE) leurres.push(type === 'syn' ? con : syn);
      for (const w of autres) {
        if (leurres.length >= 3) break;
        if (!leurres.includes(w) && w !== attendu && w !== mot) leurres.push(w);
      }
      question.innerHTML = `<span class="type" style="background:${type === 'syn' ? '#1f5fc8' : '#d0312d'}">${type === 'syn' ? 'Même sens que' : 'Contraire de'}</span><span class="mot">${mot}</span>`;
      choix.innerHTML = Gala.outils.melanger([attendu, ...leurres]).map(w => `<button data-w="${w}">${w}</button>`).join('');
      ctx.message('');
      majStats();
      actif = true;
    }

    ctx.ecouter(choix, 'click', e => {
      const b = e.target.closest('button');
      if (!b || !actif) return;
      actif = false;
      numero++;
      [...choix.children].find(x => x.dataset.w === attendu).classList.add('bon');
      const juste = b.dataset.w === attendu;
      if (juste) { bonnes++; ctx.son('ok'); } else { b.classList.add('faux'); ctx.son('erreur'); }
      majStats();
      ctx.attendre(juste ? 700 : 1600, suivante);
    });

    suivante();
  }
});
