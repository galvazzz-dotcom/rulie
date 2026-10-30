/* Pareil ou différent — vitesse de comparaison visuelle.
   20 paires de séries de symboles : sont-elles identiques ? Les séries s'allongent avec le niveau,
   et à partir du niveau 3 la différence peut être un simple échange de deux symboles voisins.
   Score = temps total + 3 s par erreur. */
Gala.enregistrer({
  id: 'pareil',
  nom: 'Pareil ou différent',
  icone: '⚖️',
  domaine: 'vitesse',
  consigne: 'Compare les deux lignes de symboles et réponds le plus vite possible : sont-elles pareilles ou différentes ? Flèche gauche = pareil, flèche droite = différent.',
  niveaux: 5,
  adaptatif: true,
  mesure: { unite: 's', meilleur: 'bas' },

  demarrer(ctx) {
    Gala.outils.style('pareil', `
      .pareil-lignes { display: flex; flex-direction: column; gap: .6rem; align-items: center; background: var(--carte);
        border: 2px solid var(--bord); border-radius: 16px; padding: 1rem 1.2rem; min-width: min(92vw, 360px); }
      .pareil-lignes div { font-size: clamp(1.6rem, 8vw, 2.4rem); letter-spacing: .25em; font-family: "Segoe UI Symbol", "Segoe UI", Arial, sans-serif; min-height: 1.3em; }
      .pareil-lignes hr { width: 100%; border: 0; border-top: 1px dashed var(--bord); margin: 0; }
      .pareil-reponses { display: grid; grid-template-columns: 1fr 1fr; gap: .6rem; width: min(92vw, 420px); }
      .pareil-reponses button { min-height: 72px; font-size: 1.3rem; font-weight: 700; }
    `);
    const ESSAIS = 20, PENALITE = 3;
    const LONGUEUR = [0, 3, 4, 5, 6, 7][ctx.niveau];
    const CIBLE = [0, 2, 2.2, 2.5, 2.8, 3.2][ctx.niveau]; // secondes par essai pour 100 %
    const ECHANGES = ctx.niveau >= 3;
    const SYMBOLES = ['●', '▲', '■', '◆', '★', '♥', '✚', '◐'];

    const lignes = document.createElement('div');
    lignes.className = 'pareil-lignes';
    lignes.innerHTML = '<div id="pareil-a"></div><hr><div id="pareil-b"></div>';
    const reponses = document.createElement('div');
    reponses.className = 'pareil-reponses';
    reponses.innerHTML = '<button data-r="pareil">← Pareil</button><button data-r="different">Différent →</button>';
    ctx.zone.append(lignes, reponses);
    const ligneA = lignes.querySelector('#pareil-a'), ligneB = lignes.querySelector('#pareil-b');

    let essai = 0, erreurs = 0, pareil = true, actif = false, debut = 0;
    const majStats = () => ctx.stats({ Essai: Math.min(essai + 1, ESSAIS) + ' / ' + ESSAIS, Erreurs: erreurs });
    const pioche = () => SYMBOLES[Math.floor(Math.random() * SYMBOLES.length)];

    function suivant() {
      if (essai >= ESSAIS) return terminer();
      const a = [];
      while (a.length < LONGUEUR) {
        const s = pioche();
        if (s !== a[a.length - 1]) a.push(s);
      }
      const b = a.slice();
      pareil = Math.random() < 0.5;
      if (!pareil) {
        const k = Math.floor(Math.random() * LONGUEUR);
        if (ECHANGES && Math.random() < 0.5) {
          const j = k < LONGUEUR - 1 ? k + 1 : k - 1; // a ne contient jamais deux symboles identiques voisins
          [b[k], b[j]] = [b[j], b[k]];
        } else {
          let s;
          do s = pioche(); while (s === a[k]);
          b[k] = s;
        }
      }
      ligneA.textContent = a.join('');
      ligneB.textContent = b.join('');
      majStats();
      actif = true;
    }

    function repondre(r) {
      if (!actif) return;
      actif = false;
      const juste = (r === 'pareil') === pareil;
      if (juste) {
        ctx.son('ok');
        ctx.message('✓');
      } else {
        erreurs++;
        ctx.son('erreur');
        ctx.message(pareil ? '✗ Elles étaient pareilles' : '✗ Elles étaient différentes');
      }
      essai++;
      majStats();
      ctx.attendre(juste ? 250 : 900, suivant);
    }

    function terminer() {
      const secondes = Math.round((performance.now() - debut) / 1000);
      const bonnes = ESSAIS - erreurs;
      const vitesse = Math.min(1, (CIBLE * ESSAIS) / Math.max(1, secondes));
      ligneA.textContent = ligneB.textContent = '';
      ctx.message(`${bonnes} bonnes réponses sur ${ESSAIS} en ${secondes} s`);
      ctx.fin({ valeur: secondes + PENALITE * erreurs, reussite: (bonnes / ESSAIS) * vitesse, reussi: bonnes >= ESSAIS / 2 });
    }

    ctx.ecouter(reponses, 'click', e => {
      const b = e.target.closest('button');
      if (b) repondre(b.dataset.r);
    });
    ctx.ecouter(document, 'keydown', e => {
      if (e.key === 'ArrowLeft') { e.preventDefault(); repondre('pareil'); }
      if (e.key === 'ArrowRight') { e.preventDefault(); repondre('different'); }
    });

    ctx.message('Prêt ?');
    ctx.stats({ Essai: '0 / ' + ESSAIS, Erreurs: 0 });
    ctx.attendre(900, () => {
      ctx.message('');
      debut = performance.now();
      suivant();
    });
  }
});
