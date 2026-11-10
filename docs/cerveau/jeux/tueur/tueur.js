/* Sudoku tueur — logique et calcul (section « Problèmes »).
   Les règles du sudoku, plus des « cages » en pointillés : les chiffres d'une cage font la somme
   indiquée dans son coin, et ne se répètent pas dans la cage. Peu ou pas de chiffres donnés au départ.
   Grilles générées avec une solution unique. Niveau : 4×4, 6×6, puis 9×9 avec de moins en moins d'aide.
   La partie en cours est sauvegardée. */
(function () {
  const melanger = t => Gala.outils.melanger(t);
  const indices = n => [...Array(n).keys()];
  const blocs = N => (N === 4 ? [2, 2] : N === 6 ? [2, 3] : [3, 3]); // [hauteur, largeur]

  function grillePleine(N) {
    const [BH, BL] = blocs(N);
    const motif = (r, c) => (BL * (r % BH) + Math.floor(r / BH) + c) % N;
    const lignes = melanger(indices(N / BH)).flatMap(b => melanger(indices(BH)).map(r => b * BH + r));
    const colonnes = melanger(indices(N / BL)).flatMap(b => melanger(indices(BL)).map(c => b * BL + c));
    const chiffres = melanger(indices(N).map(x => x + 1));
    return lignes.map(r => colonnes.map(c => chiffres[motif(r, c)])).flat();
  }

  // Découpe la grille en cages de 1 à 4 cases (2 ou 3 le plus souvent), sans chiffre répété dans une cage.
  function decouper(N, sol) {
    const cage = Array(N * N).fill(-1);
    const cages = [];
    for (const depart of melanger(indices(N * N))) {
      if (cage[depart] >= 0) continue;
      const taille = [1, 2, 2, 2, 3, 3, 3, 4][Math.floor(Math.random() * 8)];
      const cases = [depart];
      cage[depart] = cages.length;
      while (cases.length < taille) {
        const voisins = [];
        cases.forEach(i => {
          const r = Math.floor(i / N), c = i % N;
          [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]].forEach(([y, x]) => {
            if (y < 0 || x < 0 || y >= N || x >= N) return;
            const j = y * N + x;
            if (cage[j] < 0 && !cases.some(k => sol[k] === sol[j])) voisins.push(j);
          });
        });
        if (!voisins.length) break;
        const j = voisins[Math.floor(Math.random() * voisins.length)];
        cage[j] = cages.length;
        cases.push(j);
      }
      cages.push({ cases, somme: cases.reduce((s, i) => s + sol[i], 0) });
    }
    return { cage, cages };
  }

  // Résout (s'arrête à 2 solutions). Renvoie { n, autre } : autre = une 2e solution si elle existe.
  function resoudre(N, cage, cages, donnees) {
    const [BH, BL] = blocs(N);
    const g = donnees.slice();
    const ligne = Array(N).fill(0), col = Array(N).fill(0), bloc = Array(N).fill(0), dansCage = cages.map(() => 0), sommeCage = cages.map(() => 0), restCage = cages.map(c => c.cases.length);
    const b = i => Math.floor(Math.floor(i / N) / BH) * (N / BL) + Math.floor((i % N) / BL);
    const poser = (i, v, s) => {
      const m = 1 << v, r = Math.floor(i / N), c = i % N, k = cage[i];
      ligne[r] ^= m; col[c] ^= m; bloc[b(i)] ^= m; dansCage[k] ^= m; sommeCage[k] += s * v; restCage[k] -= s;
    };
    for (let i = 0; i < N * N; i++) if (g[i]) poser(i, g[i], 1);
    let n = 0, premiere = null, autre = null;
    // Bornes de la somme de k chiffres distincts encore libres dans la cage.
    function faisable(k) {
      const reste = cages[k].somme - sommeCage[k], q = restCage[k];
      if (q === 0) return reste === 0;
      const libres = [];
      for (let v = 1; v <= N; v++) if (!(dansCage[k] & (1 << v))) libres.push(v);
      if (libres.length < q) return false;
      let mn = 0, mx = 0;
      for (let t = 0; t < q; t++) { mn += libres[t]; mx += libres[libres.length - 1 - t]; }
      return reste >= mn && reste <= mx;
    }
    (function chercher() {
      if (n >= 2) return;
      // Case la plus contrainte.
      let meilleure = -1, cand = null, nb = 99;
      for (let i = 0; i < N * N; i++) {
        if (g[i]) continue;
        const pris = ligne[Math.floor(i / N)] | col[i % N] | bloc[b(i)] | dansCage[cage[i]];
        const liste = [];
        for (let v = 1; v <= N; v++) if (!(pris & (1 << v))) liste.push(v);
        if (liste.length < nb) { nb = liste.length; meilleure = i; cand = liste; if (nb <= 1) break; }
      }
      if (meilleure < 0) { n++; if (n === 1) premiere = g.slice(); else autre = g.slice(); return; }
      for (const v of cand) {
        g[meilleure] = v;
        poser(meilleure, v, 1);
        if (faisable(cage[meilleure])) chercher();
        poser(meilleure, v, -1);
        g[meilleure] = 0;
        if (n >= 2) return;
      }
    })();
    return { n, premiere, autre };
  }

  function generer(N, aideMax) {
    for (;;) {
      const sol = grillePleine(N);
      const { cage, cages } = decouper(N, sol);
      const donnees = Array(N * N).fill(0);
      let r = resoudre(N, cage, cages, donnees), ajouts = 0;
      // Tant qu'il reste plusieurs solutions, on donne un chiffre là où elles diffèrent.
      while (r.n > 1 && ajouts < aideMax) {
        const diff = indices(N * N).filter(i => r.premiere[i] !== r.autre[i]);
        const i = diff[Math.floor(Math.random() * diff.length)];
        donnees[i] = sol[i];
        ajouts++;
        r = resoudre(N, cage, cages, donnees);
      }
      if (r.n === 1) return { N, sol, cage, cages, donnees };
    }
  }

  // Les grilles 9×9 sont trop longues à fabriquer sur un téléphone : elles viennent de donnees/tueur-grilles.js
  // (fabriquées avec generer ci-dessus), puis sont retournées ou tournées pour varier :
  // ces transformations gardent la grille valide et les cages d'un seul tenant.
  function depuisReserve(niveau) {
    const liste = (Gala.donnees.tueur || {})[niveau];
    if (!liste || !liste.length) return null;
    const g = liste[Math.floor(Math.random() * liste.length)];
    const sol0 = g.s.split('').map(Number), d0 = g.d.split('').map(Number);
    const cage0 = g.c.match(/../g).map(x => parseInt(x, 36));
    // Une des 8 symétries du carré (retournements, quarts de tour).
    const transposer = Math.random() < 0.5, inverserL = Math.random() < 0.5, inverserC = Math.random() < 0.5;
    const src = i => {
      let r = Math.floor(i / 9), c = i % 9;
      if (inverserL) r = 8 - r;
      if (inverserC) c = 8 - c;
      if (transposer) [r, c] = [c, r];
      return r * 9 + c;
    };
    const sol = indices(81).map(i => sol0[src(i)]);
    const donnees = indices(81).map(i => d0[src(i)]);
    const cage = indices(81).map(i => cage0[src(i)]);
    const nbCages = Math.max(...cage) + 1;
    const cages = indices(nbCages).map(() => ({ cases: [], somme: 0 }));
    cage.forEach((k, i) => { cages[k].cases.push(i); cages[k].somme += sol[i]; });
    return { N: 9, sol, cage, cages, donnees };
  }

  Gala.tueur = { generer, resoudre, depuisReserve }; // pour les tests

  Gala.enregistrer({
    id: 'tueur',
    nom: 'Sudoku tueur',
    icone: '🧮',
    domaine: 'logique',
    probleme: true,
    consigne: 'Règles du sudoku (chaque chiffre une fois par ligne, colonne et bloc), plus les cages en pointillés : leurs chiffres font la somme écrite dans le coin, sans se répéter. Touche une case puis un chiffre ; les erreurs s\'affichent en rouge.',
    niveaux: 5,
    adaptatif: true,
    mesure: { unite: 's', meilleur: 'bas' },

    demarrer(ctx) {
      Gala.outils.style('tueur', `
        .tueur { display: grid; width: min(96vw, 500px); aspect-ratio: 1; border: 3px solid var(--texte); border-radius: 6px; overflow: hidden; }
        .tueur button { position: relative; min-height: 0; padding: 0; border-radius: 0; border: 1px solid var(--bord); font-size: var(--t-tueur);
          font-weight: 600; color: var(--accent); background: var(--carte); }
        .tueur button .cage { position: absolute; inset: 3px; pointer-events: none; border: 0 dashed var(--discret); }
        .tueur button .somme { position: absolute; top: 2px; left: 4px; font-size: var(--t-somme); font-weight: 700; color: var(--texte); line-height: 1; }
        .tueur button.donne { color: var(--texte); font-weight: 800; background: var(--carte-2); cursor: default; }
        .tueur button.meme { background: color-mix(in srgb, var(--accent) 12%, var(--carte)); }
        .tueur button.memecage { background: color-mix(in srgb, var(--accent) 7%, var(--carte)); }
        .tueur button.choisie { background: color-mix(in srgb, var(--accent) 30%, var(--carte)); outline: none; }
        .tueur button.faux { color: var(--erreur); }
        .tueur button.bord-d { border-right: 3px solid var(--texte); }
        .tueur button.bord-b { border-bottom: 3px solid var(--texte); }
        .tueur-pave { display: flex; flex-wrap: wrap; gap: .4rem; justify-content: center; max-width: 500px; }
        .tueur-pave button { width: 3.2rem; min-height: 52px; padding: 0; font-size: 1.4rem; font-weight: 700; }
      `);
      const N = [0, 4, 6, 6, 9, 9][ctx.niveau];
      const EXTRA = [0, 2, 6, 0, 8, 0][ctx.niveau]; // chiffres donnés en plus, pour les niveaux plus faciles
      const [BH, BL] = blocs(N);

      let p = ctx.etat.lire();
      if (!p || p.niveau !== ctx.niveau) {
        const g = (N === 9 && depuisReserve(ctx.niveau)) || generer(N, 12);
        melanger(indices(N * N).filter(i => !g.donnees[i])).slice(0, EXTRA).forEach(i => { g.donnees[i] = g.sol[i]; });
        p = { niveau: ctx.niveau, sol: g.sol, cage: g.cage, cages: g.cages, donnees: g.donnees, valeurs: g.donnees.slice(), erreurs: 0, secondes: 0 };
        ctx.etat.sauver(p);
      }

      const plateau = document.createElement('div');
      plateau.className = 'tueur';
      plateau.style.gridTemplateColumns = `repeat(${N}, 1fr)`;
      plateau.style.setProperty('--t-tueur', N === 9 ? 'clamp(1rem, 5.2vw, 1.6rem)' : 'clamp(1.4rem, 7vw, 2.2rem)');
      plateau.style.setProperty('--t-somme', N === 9 ? 'clamp(.55rem, 2.4vw, .8rem)' : 'clamp(.75rem, 3vw, 1rem)');
      const pave = document.createElement('div');
      pave.className = 'tueur-pave';
      pave.innerHTML = indices(N).map(v => `<button data-v="${v + 1}">${v + 1}</button>`).join('') + '<button data-v="0" aria-label="Effacer">⌫</button>';
      const actions = document.createElement('div');
      actions.className = 'groupe';
      actions.innerHTML = '<button data-a="solution">Voir la solution</button>';
      ctx.zone.append(plateau, pave, actions);

      // Coin de chaque cage : sa première case (en haut à gauche).
      const coin = p.cages.map(c => Math.min(...c.cases));
      let choisie = null, finie = false;
      const debut = performance.now() - p.secondes * 1000;
      const secondes = () => Math.round((performance.now() - debut) / 1000);
      ctx.repeter(5000, () => { if (!finie) { p.secondes = secondes(); ctx.etat.sauver(p); } });

      function dessiner() {
        const vChoisie = choisie != null ? p.valeurs[choisie] : 0;
        let html = '';
        for (let i = 0; i < N * N; i++) {
          const r = Math.floor(i / N), c = i % N, v = p.valeurs[i], k = p.cage[i], cls = [];
          if (p.donnees[i]) cls.push('donne');
          else if (v && v !== p.sol[i]) cls.push('faux');
          if (choisie === i) cls.push('choisie');
          else if (vChoisie && v === vChoisie) cls.push('meme');
          else if (choisie != null && p.cage[choisie] === k) cls.push('memecage');
          if (c % BL === BL - 1 && c < N - 1) cls.push('bord-d');
          if (r % BH === BH - 1 && r < N - 1) cls.push('bord-b');
          const autre = (y, x) => y < 0 || x < 0 || y >= N || x >= N || p.cage[y * N + x] !== k;
          const bords = `border-top-width:${autre(r - 1, c) ? 2 : 0}px;border-bottom-width:${autre(r + 1, c) ? 2 : 0}px;border-left-width:${autre(r, c - 1) ? 2 : 0}px;border-right-width:${autre(r, c + 1) ? 2 : 0}px;` +
            `${autre(r - 1, c) ? '' : 'top:-1px;'}${autre(r + 1, c) ? '' : 'bottom:-1px;'}${autre(r, c - 1) ? '' : 'left:-1px;'}${autre(r, c + 1) ? '' : 'right:-1px;'}`;
          const somme = coin[k] === i ? `<span class="somme">${p.cages[k].somme}</span>` : '';
          html += `<button data-i="${i}" class="${cls.join(' ')}" aria-label="ligne ${r + 1} colonne ${c + 1}${v ? ', ' + v : ', vide'}${somme ? ', cage de somme ' + p.cages[k].somme : ''}"><span class="cage" style="${bords}"></span>${somme}${v || ''}</button>`;
        }
        plateau.innerHTML = html;
        ctx.stats({ 'Cases vides': p.valeurs.filter(v => !v).length, Erreurs: p.erreurs });
      }

      function terminer(resolu) {
        finie = true;
        ctx.etat.effacer();
        actions.innerHTML = '';
        if (!resolu) {
          p.valeurs = p.sol.slice();
          choisie = null;
          dessiner();
          ctx.message('Voici la solution.');
          ctx.attendre(3500, () => ctx.fin({ valeur: null, reussite: 0, reussi: false }));
          return;
        }
        ctx.son('ok');
        ctx.message('Grille terminée, bravo !');
        ctx.attendre(1200, () => ctx.fin({ valeur: secondes(), reussite: Math.max(0.2, 1 - 0.1 * p.erreurs), reussi: true }));
      }

      function poser(v) {
        if (finie || choisie == null || p.donnees[choisie]) return;
        p.valeurs[choisie] = v;
        if (v && v !== p.sol[choisie]) { p.erreurs++; ctx.son('erreur'); } else if (v) ctx.son('clic');
        ctx.etat.sauver(p);
        dessiner();
        if (p.valeurs.every((x, i) => x === p.sol[i])) terminer(true);
      }

      ctx.ecouter(plateau, 'click', e => {
        const b = e.target.closest('button');
        if (!b || finie) return;
        choisie = Number(b.dataset.i);
        dessiner();
      });
      ctx.ecouter(pave, 'click', e => {
        const b = e.target.closest('button');
        if (b) poser(Number(b.dataset.v));
      });
      ctx.ecouter(actions, 'click', e => {
        if (e.target.closest('[data-a="solution"]') && !finie) terminer(false);
      });
      ctx.ecouter(document, 'keydown', e => {
        const v = Number(e.key);
        if (e.key >= '1' && v <= N) poser(v);
        else if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') poser(0);
        else if (e.key.startsWith('Arrow')) {
          e.preventDefault();
          const i = choisie == null ? 0 : choisie;
          const d = { ArrowUp: -N, ArrowDown: N, ArrowLeft: -1, ArrowRight: 1 }[e.key];
          choisie = (i + d + N * N) % (N * N);
          dessiner();
        }
      });

      dessiner();
      ctx.message('Touche une case, puis un chiffre.');
    }
  });
})();
