/* Barrage de symboles — attention soutenue et sélective.
   Touche tous les symboles cibles d'une grille, puis « J'ai fini ». 2 grilles.
   Niveau : taille de la grille, ressemblance des leurres, puis deux cibles à la fois. */
Gala.enregistrer({
  id: 'barrage',
  nom: 'Barrage de symboles',
  icone: '✏️',
  domaine: 'attention',
  consigne: 'Touche tous les symboles identiques au modèle affiché en haut, sans toucher les autres. Quand tu penses les avoir tous, appuie sur « J\'ai fini ».',
  niveaux: 5,
  adaptatif: true,
  mesure: { unite: 's', meilleur: 'bas' },

  demarrer(ctx) {
    Gala.outils.style('barrage', `
      .barrage-cible { font-size: 1.2rem; font-weight: 700; display: flex; align-items: center; gap: .6rem; }
      .barrage-cible b { font-size: 2rem; padding: 0 .5rem; border: 2px solid var(--accent); border-radius: 10px; font-family: "Segoe UI Symbol", Arial, sans-serif; }
      .barrage { display: grid; gap: 2px; width: min(94vw, 520px); }
      .barrage button { aspect-ratio: 1; min-height: 0; padding: 0; border-radius: 6px; border-width: 1px;
        font-size: var(--taille-barrage); font-family: "Segoe UI Symbol", Arial, sans-serif; }
      .barrage button.coche { background: var(--accent); border-color: var(--accent); color: var(--accent-texte); }
      .barrage button.oubli { background: var(--erreur); border-color: var(--erreur); color: #fff; }
    `);
    const GRILLES = 2, PENALITE = 3;
    const COLS = [0, 6, 7, 8, 8, 9][ctx.niveau];
    const LIGNES = [0, 5, 6, 7, 8, 8][ctx.niveau];
    const JEUX = {
      1: [['★', ['●', '■', '▲', '♥']], ['♥', ['●', '■', '◆', '✚']]],
      2: [['▲', ['▼', '◆', '■', '●']], ['◆', ['■', '●', '▲', '★']]],
      3: [['b', ['d', 'p', 'q', 'h']], ['E', ['F', 'B', 'P', 'L']], ['6', ['9', '8', '5', '0']]],
      4: [['b', ['d', 'p', 'q']], ['M', ['N', 'W', 'H']], ['3', ['8', '5', '9']]],
      5: [['p', ['q', 'b', 'd']], ['C', ['G', 'O', 'Q']], ['2', ['Z', '5', '7']]]
    }[ctx.niveau];
    const DEUX_CIBLES = ctx.niveau >= 4;
    const PART = 0.18; // part de cibles dans la grille

    const cibleZone = document.createElement('div');
    cibleZone.className = 'barrage-cible';
    const grille = document.createElement('div');
    grille.className = 'barrage';
    grille.style.gridTemplateColumns = `repeat(${COLS}, 1fr)`;
    grille.style.setProperty('--taille-barrage', `clamp(1rem, ${Math.floor(70 / COLS)}vw, ${(4.6 / COLS * 1.6).toFixed(2)}rem)`);
    const fini = document.createElement('button');
    fini.className = 'principal';
    fini.textContent = '✓ J\'ai fini';
    ctx.zone.append(cibleZone, grille, fini);

    let numero = 0, cibles = new Set(), modeles = [], bilan = { touches: 0, fausses: 0, total: 0 }, actif = false;
    const debut = performance.now();

    function nouvelleGrille() {
      const [modele, leurres] = JEUX[Math.floor(Math.random() * JEUX.length)];
      modeles = [modele];
      if (DEUX_CIBLES) modeles.push(leurres[leurres.length - 1]);
      const autres = leurres.filter(l => !modeles.includes(l));
      const n = COLS * LIGNES;
      const symboles = [];
      for (let i = 0; i < n; i++) {
        symboles.push(Math.random() < PART * modeles.length ? modeles[Math.floor(Math.random() * modeles.length)] : autres[Math.floor(Math.random() * autres.length)]);
      }
      cibles = new Set(symboles.map((s, i) => (modeles.includes(s) ? i : -1)).filter(i => i >= 0));
      if (!cibles.size) { symboles[0] = modele; cibles.add(0); }
      grille.innerHTML = symboles.map((s, i) => `<button data-i="${i}">${s}</button>`).join('');
      cibleZone.innerHTML = 'Cherche : ' + modeles.map(m => `<b>${m}</b>`).join(' et ');
      ctx.stats({ Grille: (numero + 1) + ' / ' + GRILLES });
      ctx.message('');
      actif = true;
    }

    ctx.ecouter(grille, 'click', e => {
      const b = e.target.closest('button');
      if (!b || !actif) return;
      b.classList.toggle('coche');
      ctx.son('clic');
    });

    ctx.ecouter(fini, 'click', () => {
      if (!actif) return;
      actif = false;
      let touches = 0, fausses = 0;
      [...grille.children].forEach((b, i) => {
        const coche = b.classList.contains('coche');
        if (coche && cibles.has(i)) touches++;
        else if (coche) fausses++;
        else if (cibles.has(i)) b.classList.add('oubli');
      });
      bilan.touches += touches;
      bilan.fausses += fausses;
      bilan.total += cibles.size;
      const oublis = cibles.size - touches;
      ctx.son(oublis || fausses ? 'erreur' : 'ok');
      ctx.message(oublis || fausses ? `${oublis} oubli${oublis > 1 ? 's' : ''} (en rouge), ${fausses} erreur${fausses > 1 ? 's' : ''}` : 'Parfait !');
      numero++;
      ctx.attendre(oublis ? 2200 : 900, () => (numero >= GRILLES ? terminer() : nouvelleGrille()));
    });

    function terminer() {
      const secondes = Math.round((performance.now() - debut) / 1000);
      const erreurs = (bilan.total - bilan.touches) + bilan.fausses;
      const precision = Math.max(0, (bilan.touches - bilan.fausses) / bilan.total);
      const vitesse = Math.min(1, (GRILLES * COLS * LIGNES * 0.3) / Math.max(1, secondes));
      grille.innerHTML = '';
      ctx.fin({ valeur: precision >= 0.5 ? secondes + PENALITE * erreurs : null, reussite: precision * vitesse, reussi: precision >= 0.5 });
    }

    nouvelleGrille();
  }
});
