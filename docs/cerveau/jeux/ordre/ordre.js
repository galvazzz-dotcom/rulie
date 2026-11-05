/* Dans l'ordre — planification (domaine « Organisation »).
   Les étapes d'une tâche de tous les jours sont mélangées : touche-les dans l'ordre où on les fait.
   6 tâches. Niveau : nombre d'étapes (3 à 6) ; au niveau 5, les étapes déjà placées sont masquées.
   Réussite = étapes placées du premier coup / étapes au total. */
Gala.enregistrer({
  id: 'ordre',
  nom: 'Dans l\'ordre',
  icone: '📋',
  domaine: 'executif',
  consigne: 'Les étapes d\'une tâche sont mélangées. Touche-les dans l\'ordre où on les fait, de la première à la dernière.',
  niveaux: 5,
  adaptatif: true,
  mesure: { unite: 'tâches sans faute', meilleur: 'haut' },

  demarrer(ctx) {
    Gala.outils.style('ordre', `
      .ord-titre { font-size: 1.45rem; font-weight: 800; text-align: center; }
      .ord-fait { display: flex; flex-direction: column; gap: .3rem; width: min(94vw, 480px); counter-reset: etape; }
      .ord-fait div { padding: .45rem .7rem; border-radius: 10px; background: color-mix(in srgb, var(--ok) 22%, var(--carte));
        border: 1px solid var(--ok); font-size: 1.05rem; }
      .ord-fait div::before { counter-increment: etape; content: counter(etape) ". "; font-weight: 800; }
      .ord-fait div.masque { color: transparent; }
      .ord-fait div.masque::before { color: var(--texte); }
      .ord-choix { display: flex; flex-direction: column; gap: .45rem; width: min(94vw, 480px); }
      .ord-choix button { justify-content: flex-start; text-align: left; min-height: 56px; font-size: 1.1rem; }
      .ord-choix button.faux { border-color: var(--erreur); background: var(--erreur); color: #fff; }
    `);
    const TACHES = 6;
    const NB = [0, 3, 4, 5, 6, 6][ctx.niveau];
    const MASQUER = ctx.niveau >= 5;
    const reserve = Gala.outils.melanger(Gala.donnees.etapes).slice(0, TACHES);
    const echapper = t => t.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

    const titre = document.createElement('div');
    titre.className = 'ord-titre';
    const fait = document.createElement('div');
    fait.className = 'ord-fait';
    const choix = document.createElement('div');
    choix.className = 'ord-choix';
    ctx.zone.append(titre, fait, choix);

    let numero = 0, sansFaute = 0, justes = 0, etapes = [], prochaine = 0, fautes = 0, actif = false;
    const total = TACHES * NB;
    const majStats = () => ctx.stats({ Tâche: Math.min(numero + 1, TACHES) + ' / ' + TACHES, 'Sans faute': sansFaute });

    function suivante() {
      if (numero >= TACHES) {
        ctx.fin({ valeur: sansFaute, reussite: justes / total, reussi: justes >= total / 2 });
        return;
      }
      const [nom, toutes] = reserve[numero];
      // On garde NB étapes, dans leur ordre d'origine (la première et la dernière toujours).
      const milieu = Gala.outils.melanger([1, 2, 3, 4]).slice(0, NB - 2).sort((a, b) => a - b);
      etapes = [0, ...milieu, 5].map(i => toutes[i]);
      prochaine = 0;
      fautes = 0;
      titre.textContent = nom;
      fait.innerHTML = '';
      let melange;
      do melange = Gala.outils.melanger(etapes);
      while (melange.every((e, i) => e === etapes[i]));
      choix.innerHTML = melange.map(e => `<button data-e="${echapper(e)}">${echapper(e)}</button>`).join('');
      ctx.message('Par quoi commence-t-on ?');
      majStats();
      actif = true;
    }

    ctx.ecouter(choix, 'click', e => {
      const b = e.target.closest('button');
      if (!b || !actif) return;
      if (b.dataset.e === etapes[prochaine]) {
        ctx.son('clic');
        if (!b.dataset.rate) justes++;
        const ligne = document.createElement('div');
        ligne.textContent = etapes[prochaine];
        fait.appendChild(ligne);
        if (MASQUER) [...fait.children].slice(0, -1).forEach(d => d.classList.add('masque'));
        b.remove();
        prochaine++;
        ctx.message(prochaine < etapes.length ? 'Et ensuite ?' : '');
        if (prochaine >= etapes.length) {
          actif = false;
          if (!fautes) { sansFaute++; ctx.son('ok'); ctx.message('Parfait !'); } else ctx.message('Terminé');
          numero++;
          majStats();
          ctx.attendre(1300, suivante);
        }
      } else {
        fautes++;
        // L'étape attendue ne compte plus comme « du premier coup ».
        const attendue = [...choix.children].find(x => x.dataset.e === etapes[prochaine]);
        if (attendue) attendue.dataset.rate = '1';
        b.classList.add('faux');
        ctx.son('erreur');
        ctx.message('Pas encore, cherche ce qui vient avant');
        ctx.attendre(600, () => b.classList.remove('faux'));
      }
    });

    suivante();
  }
});
