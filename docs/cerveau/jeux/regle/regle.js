/* Changement de règle — flexibilité mentale (fonctions exécutives).
   Une forme s'affiche avec une consigne : FORME ou COULEUR. Bouton gauche = rond / bleu,
   bouton droit = carré / orange. Niveau : la règle change de plus en plus souvent et sans prévenir,
   puis un temps limite. 24 essais, score = temps + 3 s par erreur. */
Gala.enregistrer({
  id: 'regle',
  nom: 'Changement de règle',
  icone: '🧭',
  domaine: 'executif',
  consigne: 'Regarde la consigne au-dessus de la forme. FORME : gauche si c\'est un rond, droite si c\'est un carré. COULEUR : gauche si c\'est bleu, droite si c\'est orange. Flèches gauche et droite au clavier.',
  niveaux: 5,
  adaptatif: true,
  mesure: { unite: 's', meilleur: 'bas' },

  demarrer(ctx) {
    Gala.outils.style('regle', `
      .regle-carte { width: min(92vw, 380px); background: var(--carte); border: 2px solid var(--bord); border-radius: 16px;
        display: flex; flex-direction: column; align-items: center; gap: .8rem; padding: 1rem; }
      .regle-consigne { font-size: 1.4rem; font-weight: 800; letter-spacing: .08em; padding: .2rem 1rem; border-radius: 999px; color: #fff; }
      .regle-forme { width: 7rem; height: 7rem; }
      .regle-boutons { display: grid; grid-template-columns: 1fr 1fr; gap: .6rem; width: min(92vw, 380px); }
      .regle-boutons button { min-height: 80px; flex-direction: column; gap: .1rem; font-size: 1.05rem; }
      .regle-boutons b { font-size: 1.2rem; }
    `);
    const ESSAIS = 24, PENALITE = 3;
    const BLOC = [0, 4, 2, 0, 0, 0][ctx.niveau]; // 0 = règle tirée au hasard à chaque essai
    const LIMITE = [0, 0, 0, 0, 3000, 2200][ctx.niveau];
    const CIBLE = [0, 1.8, 1.9, 2.1, 2, 1.8][ctx.niveau];
    const BLEU = '#1f5fc8', ORANGE = '#e67e22';

    const carte = document.createElement('div');
    carte.className = 'regle-carte';
    const boutons = document.createElement('div');
    boutons.className = 'regle-boutons';
    boutons.innerHTML = '<button data-c="g"><b>←</b>rond · bleu</button><button data-c="d"><b>→</b>carré · orange</button>';
    ctx.zone.append(carte, boutons);

    let essai = 0, erreurs = 0, attendu = '', actif = false, regle = 'FORME', debut = 0, chrono = null;
    const majStats = () => ctx.stats({ Essai: Math.min(essai + 1, ESSAIS) + ' / ' + ESSAIS, Erreurs: erreurs });

    function suivant() {
      if (essai >= ESSAIS) return terminer();
      if (BLOC) { if (essai % BLOC === 0 && essai) regle = regle === 'FORME' ? 'COULEUR' : 'FORME'; }
      else regle = Math.random() < 0.5 ? 'FORME' : 'COULEUR';
      const rond = Math.random() < 0.5, bleu = Math.random() < 0.5;
      attendu = regle === 'FORME' ? (rond ? 'g' : 'd') : (bleu ? 'g' : 'd');
      const c = bleu ? BLEU : ORANGE;
      const forme = rond ? `<circle cx="50" cy="50" r="42" fill="${c}"/>` : `<rect x="10" y="10" width="80" height="80" rx="6" fill="${c}"/>`;
      carte.innerHTML = `<span class="regle-consigne" style="background:${regle === 'FORME' ? '#1f2430' : '#7d3c98'}">${regle}</span>
        <svg class="regle-forme" viewBox="0 0 100 100" aria-label="${rond ? 'rond' : 'carré'} ${bleu ? 'bleu' : 'orange'}">${forme}</svg>`;
      majStats();
      actif = true;
      if (LIMITE) chrono = ctx.attendre(LIMITE, () => repondre(null));
    }

    function repondre(c) {
      if (!actif) return;
      actif = false;
      clearTimeout(chrono);
      essai++;
      if (c === attendu) {
        ctx.son('clic');
        ctx.message('');
        ctx.attendre(200, suivant);
      } else {
        erreurs++;
        ctx.son('erreur');
        ctx.message(c === null ? 'Trop tard' : `✗ La règle était ${regle}`);
        majStats();
        ctx.attendre(900, suivant);
      }
    }

    function terminer() {
      const secondes = Math.round((performance.now() - debut) / 1000);
      carte.innerHTML = '<span class="regle-consigne" style="background:var(--ok)">TERMINÉ</span>';
      const precision = (ESSAIS - erreurs) / ESSAIS;
      const vitesse = Math.min(1, (CIBLE * ESSAIS) / Math.max(1, secondes));
      ctx.fin({ valeur: precision >= 0.5 ? secondes + PENALITE * erreurs : null, reussite: precision * vitesse, reussi: precision >= 0.5 });
    }

    ctx.ecouter(boutons, 'click', e => {
      const b = e.target.closest('button');
      if (b) repondre(b.dataset.c);
    });
    ctx.ecouter(document, 'keydown', e => {
      if (e.key === 'ArrowLeft') { e.preventDefault(); repondre('g'); }
      if (e.key === 'ArrowRight') { e.preventDefault(); repondre('d'); }
    });

    ctx.message('Prêt ?');
    ctx.stats({ Essai: '0 / ' + ESSAIS, Erreurs: 0 });
    ctx.attendre(1000, () => { ctx.message(''); debut = performance.now(); suivant(); });
  }
});
