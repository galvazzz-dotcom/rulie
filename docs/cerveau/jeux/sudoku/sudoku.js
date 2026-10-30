/* Sudoku — logique et planification. Grilles générées à la volée, avec une solution unique.
   Niveau 1-2 : 4×4 ; niveau 3 : 6×6 ; niveau 4-5 : 9×9. Pas de chrono imposé :
   la réussite dépend des erreurs, le temps sert seulement de record. */
Gala.enregistrer({
  id: 'sudoku',
  nom: 'Sudoku',
  icone: '🔲',
  domaine: 'logique',
  consigne: 'Remplis la grille : chaque chiffre doit apparaître une seule fois par ligne, par colonne et par bloc. Touche une case vide, puis un chiffre. Les erreurs s\'affichent en rouge.',
  niveaux: 5,
  adaptatif: true,
  mesure: { unite: 's', meilleur: 'bas' },

  demarrer(ctx) {
    Gala.outils.style('sudoku', `
      .sudoku { display: grid; width: min(94vw, 470px); aspect-ratio: 1; border: 3px solid var(--texte); border-radius: 6px; overflow: hidden; }
      .sudoku button { min-height: 0; padding: 0; border-radius: 0; border: 1px solid var(--bord); font-size: var(--taille-sudoku);
        font-weight: 600; color: var(--accent); background: var(--carte); }
      .sudoku button.donne { color: var(--texte); font-weight: 800; background: var(--carte-2); cursor: default; }
      .sudoku button.meme { background: var(--carte-2); background: color-mix(in srgb, var(--accent) 12%, var(--carte)); }
      .sudoku button.choisie { background: var(--bord); background: color-mix(in srgb, var(--accent) 30%, var(--carte)); outline: none; }
      .sudoku button.faux { color: var(--erreur); }
      .sudoku button.bord-d { border-right: 3px solid var(--texte); }
      .sudoku button.bord-b { border-bottom: 3px solid var(--texte); }
      .sudoku-pave { display: flex; flex-wrap: wrap; gap: .4rem; justify-content: center; max-width: 470px; }
      .sudoku-pave button { width: 3.2rem; min-height: 52px; padding: 0; font-size: 1.4rem; font-weight: 700; }
    `);
    const N = [0, 4, 4, 6, 9, 9][ctx.niveau];
    const BH = N === 4 ? 2 : N === 6 ? 2 : 3; // hauteur d'un bloc
    const BL = N === 4 ? 2 : 3;               // largeur d'un bloc
    const DONNEES = [0, 10, 7, 18, 38, 30][ctx.niveau]; // cases données visées

    const melanger = Gala.outils.melanger;
    const indices = n => [...Array(n).keys()];

    // 1. Une grille complète : motif de base puis mélanges qui préservent les règles.
    function grillePleine() {
      const motif = (r, c) => (BL * (r % BH) + Math.floor(r / BH) + c) % N;
      const lignes = melanger(indices(N / BH)).flatMap(b => melanger(indices(BH)).map(r => b * BH + r));
      const colonnes = melanger(indices(N / BL)).flatMap(b => melanger(indices(BL)).map(c => b * BL + c));
      const chiffres = melanger(indices(N).map(x => x + 1));
      return lignes.map(r => colonnes.map(c => chiffres[motif(r, c)]));
    }

    // 2. Compte les solutions (s'arrête à 2) : sert à garder une solution unique.
    function compterSolutions(g) {
      const vide = [];
      for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (!g[r][c]) vide.push([r, c]);
      let total = 0;
      const possible = (r, c, v) => {
        for (let k = 0; k < N; k++) if (g[r][k] === v || g[k][c] === v) return false;
        const r0 = r - (r % BH), c0 = c - (c % BL);
        for (let i = 0; i < BH; i++) for (let j = 0; j < BL; j++) if (g[r0 + i][c0 + j] === v) return false;
        return true;
      };
      (function chercher(k) {
        if (total > 1) return;
        if (k === vide.length) { total++; return; }
        const [r, c] = vide[k];
        for (let v = 1; v <= N; v++) {
          if (possible(r, c, v)) {
            g[r][c] = v;
            chercher(k + 1);
            g[r][c] = 0;
          }
        }
      })(0);
      return total;
    }

    // 3. On retire des cases tant que la solution reste unique.
    const solution = grillePleine();
    const depart = solution.map(l => l.slice());
    let restantes = N * N;
    for (const i of melanger(indices(N * N))) {
      if (restantes <= DONNEES) break;
      const r = Math.floor(i / N), c = i % N, v = depart[r][c];
      depart[r][c] = 0;
      if (compterSolutions(depart.map(l => l.slice())) !== 1) depart[r][c] = v;
      else restantes--;
    }

    const plateau = document.createElement('div');
    plateau.className = 'sudoku';
    plateau.style.gridTemplateColumns = `repeat(${N}, 1fr)`;
    plateau.style.setProperty('--taille-sudoku', N === 9 ? 'clamp(1rem, 5.5vw, 1.6rem)' : 'clamp(1.4rem, 8vw, 2.2rem)');
    const pave = document.createElement('div');
    pave.className = 'sudoku-pave';
    pave.innerHTML = indices(N).map(v => `<button data-v="${v + 1}">${v + 1}</button>`).join('') + '<button data-v="0" aria-label="Effacer">⌫</button>';
    ctx.zone.append(plateau, pave);

    const valeurs = depart.map(l => l.slice());
    let choisie = null, erreurs = 0, finie = false;
    const debut = performance.now();

    function dessiner() {
      const vChoisie = choisie ? valeurs[choisie[0]][choisie[1]] : 0;
      let html = '';
      for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
        const v = valeurs[r][c], cls = [];
        if (depart[r][c]) cls.push('donne');
        else if (v && v !== solution[r][c]) cls.push('faux');
        if (choisie && choisie[0] === r && choisie[1] === c) cls.push('choisie');
        else if (vChoisie && v === vChoisie) cls.push('meme');
        if (c % BL === BL - 1 && c < N - 1) cls.push('bord-d');
        if (r % BH === BH - 1 && r < N - 1) cls.push('bord-b');
        html += `<button data-r="${r}" data-c="${c}" class="${cls.join(' ')}" aria-label="ligne ${r + 1} colonne ${c + 1}${v ? ', ' + v : ', vide'}">${v || ''}</button>`;
      }
      plateau.innerHTML = html;
      const vides = valeurs.flat().filter(v => !v).length;
      ctx.stats({ 'Cases vides': vides, Erreurs: erreurs });
    }

    function poser(v) {
      if (finie || !choisie) return;
      const [r, c] = choisie;
      if (depart[r][c]) return;
      valeurs[r][c] = v;
      if (v && v !== solution[r][c]) {
        erreurs++;
        ctx.son('erreur');
      } else if (v) ctx.son('clic');
      dessiner();
      if (valeurs.every((l, i) => l.every((x, j) => x === solution[i][j]))) {
        finie = true;
        ctx.son('ok');
        ctx.message('Grille terminée !');
        const secondes = Math.round((performance.now() - debut) / 1000);
        ctx.fin({ valeur: secondes, reussite: Math.max(0, 1 - 0.15 * erreurs), reussi: true });
      }
    }

    ctx.ecouter(plateau, 'click', e => {
      const b = e.target.closest('button');
      if (!b || finie) return;
      choisie = [Number(b.dataset.r), Number(b.dataset.c)];
      dessiner();
    });
    ctx.ecouter(pave, 'click', e => {
      const b = e.target.closest('button');
      if (b) poser(Number(b.dataset.v));
    });
    ctx.ecouter(document, 'keydown', e => {
      const v = Number(e.key);
      if (e.key >= '1' && v <= N) poser(v);
      else if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') poser(0);
      else if (e.key.startsWith('Arrow')) {
        e.preventDefault();
        const [r, c] = choisie || [0, 0];
        const d = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] }[e.key];
        choisie = [(r + d[0] + N) % N, (c + d[1] + N) % N];
        dessiner();
      }
    });

    dessiner();
    ctx.message('Touche une case vide, puis un chiffre');
  }
});
