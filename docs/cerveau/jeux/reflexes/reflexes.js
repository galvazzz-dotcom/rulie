/* Réflexes — vitesse de réaction et inhibition (go / no-go).
   25 essais : quand le rond VERT apparaît, touche vite ; quand il est ROUGE, ne touche pas.
   Niveau : part de ronds rouges et délai d'attente plus imprévisible. Score = temps de réaction moyen. */
Gala.enregistrer({
  id: 'reflexes',
  nom: 'Réflexes',
  icone: '🟢',
  domaine: 'vitesse',
  consigne: 'Touche la zone (ou la barre d\'espace) dès qu\'un rond VERT apparaît. Si le rond est ROUGE, ne touche surtout pas ! Toucher trop tôt compte comme une erreur.',
  niveaux: 5,
  adaptatif: true,
  mesure: { unite: 'ms', meilleur: 'bas' },

  demarrer(ctx) {
    Gala.outils.style('reflexes', `
      .reflexes { width: min(94vw, 480px); height: min(60vh, 380px); border-radius: 18px; background: var(--carte);
        border: 2px solid var(--bord); display: flex; align-items: center; justify-content: center; cursor: pointer; touch-action: manipulation;
        user-select: none; -webkit-user-select: none; font-size: 1.2rem; color: var(--discret); text-align: center; padding: 1rem; }
      .reflexes i { width: 40%; aspect-ratio: 1; border-radius: 50%; display: block; }
    `);
    const ESSAIS = 25;
    const PART_NOGO = [0, 0, 0.2, 0.3, 0.35, 0.4][ctx.niveau];
    const [ATTENTE_MIN, ATTENTE_MAX] = [null, [900, 1800], [800, 2000], [700, 2300], [600, 2600], [500, 2800]][ctx.niveau];
    const NOGO_DUREE = 1100;
    const CIBLE_MS = [0, 600, 560, 520, 490, 460][ctx.niveau];

    const zone = document.createElement('div');
    zone.className = 'reflexes';
    zone.setAttribute('role', 'button');
    zone.textContent = 'Attends le rond…';
    ctx.zone.appendChild(zone);

    let essai = 0, temps = [], erreurs = 0, etat = 'attente', apparition = 0, go = true, minuterie = null;
    const majStats = () => ctx.stats({ Essai: Math.min(essai + 1, ESSAIS) + ' / ' + ESSAIS, Erreurs: erreurs });

    function prochain() {
      if (essai >= ESSAIS) return terminer();
      majStats();
      etat = 'attente';
      zone.innerHTML = '';
      const delai = ATTENTE_MIN + Math.random() * (ATTENTE_MAX - ATTENTE_MIN);
      minuterie = ctx.attendre(delai, () => {
        go = Math.random() >= PART_NOGO;
        zone.innerHTML = `<i style="background:${go ? '#13a34a' : '#d0312d'}"></i>`;
        apparition = performance.now();
        etat = 'visible';
        // Un rond rouge disparaît seul : c'est réussi si on n'a pas touché.
        if (!go) minuterie = ctx.attendre(NOGO_DUREE, () => resultat(true, 'Bien retenu !'));
        else minuterie = ctx.attendre(2000, () => resultat(false, 'Trop lent'));
      });
    }

    function resultat(ok, texte) {
      clearTimeout(minuterie);
      etat = 'pause';
      if (!ok) erreurs++;
      ctx.son(ok ? 'ok' : 'erreur');
      ctx.message(texte);
      zone.innerHTML = '';
      essai++;
      majStats();
      ctx.attendre(ok ? 500 : 900, prochain);
    }

    function appui() {
      if (etat === 'pause') return;
      if (etat === 'attente') return resultat(false, 'Trop tôt !');
      if (!go) return resultat(false, 'Le rond était rouge !');
      const t = Math.round(performance.now() - apparition);
      temps.push(t);
      resultat(true, t + ' ms');
    }

    function terminer() {
      etat = 'pause';
      zone.textContent = 'Terminé';
      const moyenne = temps.length ? Math.round(temps.reduce((a, b) => a + b, 0) / temps.length) : null;
      const precision = (ESSAIS - erreurs) / ESSAIS;
      const vitesse = moyenne ? Math.min(1, CIBLE_MS / moyenne) : 0;
      ctx.fin({ valeur: moyenne, reussite: precision * vitesse, reussi: precision >= 0.5 });
    }

    ctx.ecouter(zone, 'pointerdown', e => { e.preventDefault(); appui(); });
    ctx.ecouter(document, 'keydown', e => {
      if (e.code === 'Space' || e.key === ' ') { e.preventDefault(); appui(); }
    });

    ctx.message('Prêt ?');
    etat = 'pause';
    ctx.attendre(1200, () => { ctx.message(''); prochain(); });
  }
});
