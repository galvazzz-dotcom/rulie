/* Tours de Hanoï — planification et logique.
   Déplace toute la pile de gauche vers la tige de droite, un disque à la fois,
   sans jamais poser un grand disque sur un plus petit. Niveau : 3 à 5 disques.
   Réussite = coups minimum / coups joués. */
Gala.enregistrer({
  id: 'hanoi',
  nom: 'Tours de Hanoï',
  icone: '🗼',
  domaine: 'logique',
  consigne: 'Déplace toute la pile sur la tige de droite. Touche une tige pour prendre son disque du dessus, puis une autre tige pour le poser. Un disque ne va jamais sur un plus petit.',
  niveaux: 5,
  adaptatif: true,
  mesure: { unite: 'coups', meilleur: 'bas' },

  demarrer(ctx) {
    Gala.outils.style('hanoi', `
      .hanoi { display: grid; grid-template-columns: repeat(3, 1fr); gap: .5rem; width: min(94vw, 560px); }
      .hanoi button { height: 15rem; min-height: 0; padding: 0 0 .6rem; display: flex; flex-direction: column-reverse;
        align-items: center; justify-content: flex-start; gap: 3px; position: relative; background: var(--carte); }
      .hanoi button::before { content: ''; position: absolute; bottom: .6rem; top: 1.2rem; width: 8px; border-radius: 4px; background: var(--bord); z-index: 0; }
      .hanoi button.choisie { border-color: var(--accent); border-width: 3px; }
      .hanoi i { display: block; height: 1.6rem; border-radius: 8px; z-index: 1; border: 2px solid rgba(0,0,0,.15); }
      .hanoi i.leve { transform: translateY(-1.2rem); box-shadow: 0 4px 8px rgba(0,0,0,.25); }
    `);
    const DISQUES = [0, 3, 4, 4, 5, 5][ctx.niveau];
    const VERS = ctx.niveau === 3 || ctx.niveau === 5 ? 1 : 2; // aux niveaux 3 et 5, la cible est la tige du milieu
    const MIN = 2 ** DISQUES - 1;
    const COULEURS = ['#d0312d', '#d9822b', '#c9a400', '#13803f', '#1f5fc8', '#7d3c98'];

    const plateau = document.createElement('div');
    plateau.className = 'hanoi';
    ctx.zone.appendChild(plateau);

    const tiges = [[], [], []];
    for (let d = DISQUES; d >= 1; d--) tiges[0].push(d);
    let choisie = -1, coups = 0, finie = false;
    const NOMS = ['gauche', 'milieu', 'droite'];
    ctx.message('Objectif : tout mettre sur la tige ' + (VERS === 1 ? 'du milieu' : 'de droite') + ' (minimum ' + MIN + ' coups)');

    function dessiner() {
      plateau.innerHTML = tiges.map((t, i) => `<button data-t="${i}" class="${i === choisie ? 'choisie' : ''}" aria-label="tige ${NOMS[i]}, ${t.length} disque${t.length > 1 ? 's' : ''}${i === VERS ? ', objectif' : ''}">${
        t.map((d, k) => `<i class="${i === choisie && k === t.length - 1 ? 'leve' : ''}" style="width:${25 + d * (70 / DISQUES)}%;background:${COULEURS[d - 1]}"></i>`).join('')}</button>`).join('');
      plateau.children[VERS].style.outline = '3px dashed var(--ok)';
      plateau.children[VERS].style.outlineOffset = '-6px';
      ctx.stats({ Coups: coups, Minimum: MIN });
    }

    ctx.ecouter(plateau, 'click', e => {
      const b = e.target.closest('button');
      if (!b || finie) return;
      const i = Number(b.dataset.t);
      if (choisie < 0) {
        if (!tiges[i].length) return;
        choisie = i;
        ctx.son('clic');
      } else if (i === choisie) {
        choisie = -1;
      } else {
        const d = tiges[choisie][tiges[choisie].length - 1];
        const dessus = tiges[i][tiges[i].length - 1];
        if (dessus && dessus < d) {
          ctx.son('erreur');
          ctx.message('Impossible : un grand disque ne va pas sur un petit');
          choisie = -1;
        } else {
          tiges[i].push(tiges[choisie].pop());
          coups++;
          choisie = -1;
          ctx.message('');
          if (tiges[VERS].length === DISQUES) {
            finie = true;
            dessiner();
            ctx.son('ok');
            ctx.message(coups === MIN ? 'Parfait, en un minimum de coups !' : 'Réussi !');
            ctx.fin({ valeur: coups, reussite: Math.min(1, MIN / coups), reussi: true });
            return;
          }
        }
      }
      dessiner();
    });

    dessiner();
  }
});
