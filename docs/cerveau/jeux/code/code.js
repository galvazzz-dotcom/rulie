/* Code secret — vitesse de traitement (épreuve « symboles-chiffres »).
   Une légende associe chaque symbole à un chiffre ; on traduit 20 symboles le plus vite possible.
   Niveau : nombre de symboles dans la légende (4 à 9), puis légende mélangée à chaque partie.
   Score = temps total + 3 s par erreur. */
Gala.enregistrer({
  id: 'code',
  nom: 'Code secret',
  icone: '🔣',
  domaine: 'vitesse',
  consigne: 'Regarde la légende : chaque symbole correspond à un chiffre. Pour chaque symbole affiché, touche son chiffre le plus vite possible.',
  niveaux: 5,
  adaptatif: true,
  mesure: { unite: 's', meilleur: 'bas' },

  demarrer(ctx) {
    Gala.outils.style('code', `
      .code-legende { display: flex; flex-wrap: wrap; justify-content: center; gap: .3rem; }
      .code-legende div { display: flex; flex-direction: column; align-items: center; border: 2px solid var(--bord); border-radius: 10px;
        background: var(--carte); min-width: 2.8rem; padding: .2rem .3rem; }
      .code-legende span { font-size: 1.5rem; line-height: 1.2; font-family: "Segoe UI Symbol", Arial, sans-serif; }
      .code-legende b { border-top: 1px solid var(--bord); width: 100%; text-align: center; }
      .code-symbole { font-size: clamp(3.4rem, 18vw, 5rem); line-height: 1.1; font-family: "Segoe UI Symbol", Arial, sans-serif; min-height: 1.2em; }
      .code-pave { display: grid; grid-template-columns: repeat(5, 1fr); gap: .4rem; width: min(94vw, 440px); }
      .code-pave button { min-height: 58px; font-size: 1.5rem; font-weight: 700; }
    `);
    const ESSAIS = 20, PENALITE = 3;
    const NB = [0, 4, 5, 6, 8, 9][ctx.niveau];
    const CIBLE = [0, 1.6, 1.8, 2, 2.2, 2.4][ctx.niveau]; // secondes par symbole pour 100 %
    const SYMBOLES = ['◐', '✚', '▲', '◆', '★', '♥', '☾', '⌘', '✿', '♣', '☀', '⚑'];
    const choisis = Gala.outils.melanger(SYMBOLES).slice(0, NB);
    const chiffres = Gala.outils.melanger([1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, NB).sort((a, b) => a - b);
    const legende = choisis.map((s, k) => ({ s, c: chiffres[k] }));

    const blocLegende = document.createElement('div');
    blocLegende.className = 'code-legende';
    blocLegende.innerHTML = legende.map(l => `<div><span>${l.s}</span><b>${l.c}</b></div>`).join('');
    const symbole = document.createElement('div');
    symbole.className = 'code-symbole';
    const pave = document.createElement('div');
    pave.className = 'code-pave';
    pave.innerHTML = [1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => `<button data-n="${n}">${n}</button>`).join('');
    ctx.zone.append(blocLegende, symbole, pave);

    let essai = 0, erreurs = 0, attendu = 0, actif = false, debut = 0, precedent = -1;
    const majStats = () => ctx.stats({ Symbole: Math.min(essai + 1, ESSAIS) + ' / ' + ESSAIS, Erreurs: erreurs });

    function suivant() {
      if (essai >= ESSAIS) return terminer();
      let k;
      do k = Math.floor(Math.random() * NB); while (k === precedent);
      precedent = k;
      symbole.textContent = legende[k].s;
      attendu = legende[k].c;
      majStats();
      actif = true;
    }

    function repondre(n) {
      if (!actif) return;
      actif = false;
      essai++;
      if (n === attendu) {
        ctx.son('clic');
        ctx.message('');
        suivant();
      } else {
        erreurs++;
        ctx.son('erreur');
        ctx.message('✗ C\'était ' + attendu);
        majStats();
        ctx.attendre(700, suivant);
      }
    }

    function terminer() {
      const secondes = Math.round((performance.now() - debut) / 1000);
      symbole.textContent = '✓';
      const precision = (ESSAIS - erreurs) / ESSAIS;
      const vitesse = Math.min(1, (CIBLE * ESSAIS) / Math.max(1, secondes));
      ctx.fin({ valeur: precision >= 0.5 ? secondes + PENALITE * erreurs : null, reussite: precision * vitesse, reussi: precision >= 0.5 });
    }

    ctx.ecouter(pave, 'click', e => {
      const b = e.target.closest('button');
      if (b) repondre(Number(b.dataset.n));
    });
    ctx.ecouter(document, 'keydown', e => {
      if (e.key >= '1' && e.key <= '9') repondre(Number(e.key));
    });

    ctx.message('Prends 5 secondes pour lire la légende…');
    ctx.stats({ Symbole: '0 / ' + ESSAIS, Erreurs: 0 });
    ctx.attendre(5000, () => {
      ctx.message('');
      debut = performance.now();
      suivant();
    });
  }
});
