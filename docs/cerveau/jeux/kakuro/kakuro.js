/* Kakuro — logique et calcul (section « Problèmes »).
   Des mots croisés de chiffres : chaque suite de cases blanches doit faire la somme indiquée
   dans la case noire à sa gauche (horizontal) ou au-dessus (vertical), avec des chiffres de 1 à 9
   qui ne se répètent pas dans une même suite.
   Grilles générées à la volée, solution unique (au besoin, quelques chiffres sont donnés).
   Niveau 1 : 3×3 cases utiles ; niveau 5 : 7×7. La partie en cours est sauvegardée. */
(function () {
  const melanger = t => Gala.outils.melanger(t);
  const bits = m => { let n = 0; while (m) { n += m & 1; m >>= 1; } return n; };
  const chiffresDe = m => [1, 2, 3, 4, 5, 6, 7, 8, 9].filter(d => m & (1 << d));

  // Pour chaque (longueur, somme) : la liste des ensembles de chiffres possibles (masques de bits).
  const COMBOS = {};
  for (let m = 0; m < 1024; m += 2) {
    const k = bits(m);
    let s = 0;
    chiffresDe(m).forEach(d => { s += d; });
    (COMBOS[k + ':' + s] = COMBOS[k + ':' + s] || []).push(m);
  }

  // Forme de la grille : true = case blanche. Ligne 0 et colonne 0 toujours noires.
  function forme(H, W, noircir) {
    for (let essai = 0; essai < 400; essai++) {
      const b = Array.from({ length: H }, (_, r) => Array.from({ length: W }, (_, c) => r > 0 && c > 0));
      const sym = (r, c) => [H - r, W - c]; // symétrie centrale sur la partie utile
      for (let r = 1; r < H; r++) for (let c = 1; c < W; c++) {
        if (Math.random() < noircir) { b[r][c] = false; const [y, x] = sym(r, c); b[y][x] = false; }
      }
      // Pas de suite d'une seule case : on noircit jusqu'à stabilité.
      let change = true;
      while (change) {
        change = false;
        for (let r = 1; r < H; r++) for (let c = 1; c < W; c++) {
          if (!b[r][c]) continue;
          const seulH = !b[r][c - 1] && (c + 1 >= W || !b[r][c + 1]);
          const seulV = !b[r - 1][c] && (r + 1 >= H || !b[r + 1][c]);
          if (seulH || seulV) { b[r][c] = false; const [y, x] = sym(r, c); b[y][x] = false; change = true; }
        }
      }
      const blanches = [];
      for (let r = 1; r < H; r++) for (let c = 1; c < W; c++) if (b[r][c]) blanches.push([r, c]);
      if (blanches.length < 0.6 * (H - 1) * (W - 1)) continue;
      // Toutes les cases blanches doivent se toucher.
      const vu = new Set([blanches[0].join()]), pile = [blanches[0]];
      while (pile.length) {
        const [r, c] = pile.pop();
        [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]].forEach(([y, x]) => {
          if (y > 0 && x > 0 && y < H && x < W && b[y][x] && !vu.has(y + ',' + x)) { vu.add(y + ',' + x); pile.push([y, x]); }
        });
      }
      if (vu.size === blanches.length) return b;
    }
    return null;
  }

  // Suites horizontales et verticales. Chaque case blanche appartient à une de chaque.
  function suites(b, H, W) {
    const runs = [], parCase = {};
    const ajouter = (cases, sens, tete) => {
      const k = runs.length;
      runs.push({ cases, sens, tete });
      cases.forEach(i => { (parCase[i] = parCase[i] || [])[sens === 'h' ? 0 : 1] = k; });
    };
    for (let r = 1; r < H; r++) for (let c = 1; c < W; c++) {
      if (b[r][c] && !b[r][c - 1]) {
        const cases = [];
        for (let x = c; x < W && b[r][x]; x++) cases.push(r * W + x);
        ajouter(cases, 'h', r * W + c - 1);
      }
      if (b[r][c] && !b[r - 1][c]) {
        const cases = [];
        for (let y = r; y < H && b[y][c]; y++) cases.push(y * W + c);
        ajouter(cases, 'v', (r - 1) * W + c);
      }
    }
    return { runs, parCase };
  }

  // Remplissage au hasard : chiffres sans répétition dans chaque suite.
  function remplir(runs, parCase, cases) {
    const val = {}, utilise = runs.map(() => 0);
    const ordre = melanger(cases);
    return (function poser(k) {
      if (k === ordre.length) return true;
      const i = ordre[k], [h, v] = parCase[i];
      for (const d of melanger([1, 2, 3, 4, 5, 6, 7, 8, 9])) {
        const bit = 1 << d;
        if ((utilise[h] | utilise[v]) & bit) continue;
        val[i] = d; utilise[h] |= bit; utilise[v] |= bit;
        if (poser(k + 1)) return true;
        utilise[h] &= ~bit; utilise[v] &= ~bit; delete val[i];
      }
      return false;
    })(0) ? val : null;
  }

  // Compte les solutions (arrêt à 2). Renvoie { total, autre } où autre est une 2e solution.
  function resoudre(runs, parCase, cases, sommes, donnes) {
    const combos = runs.map((r, k) => COMBOS[r.cases.length + ':' + sommes[k]] || []);
    const place = runs.map(() => 0), val = {};
    let total = 0, premiere = null, autre = null, noeuds = 0;
    const possibles = k => {
      let m = 0;
      for (const c of combos[k]) if ((c & place[k]) === place[k]) m |= c;
      return m & ~place[k];
    };
    const mettre = (i, d) => { const [h, v] = parCase[i]; val[i] = d; place[h] |= 1 << d; place[v] |= 1 << d; };
    const oter = (i, d) => { const [h, v] = parCase[i]; delete val[i]; place[h] &= ~(1 << d); place[v] &= ~(1 << d); };
    for (const i in donnes) mettre(Number(i), donnes[i]);
    const libres = cases.filter(i => !(i in donnes));
    (function chercher(n) {
      if (total > 1) return;
      // Garde-fou : une recherche trop longue compte comme « pas unique » (la grille est écartée).
      if (++noeuds > 60000) { total = 2; return; }
      if (n === libres.length) {
        // Toutes les sommes doivent être exactes (garanti par les combos dès que la suite est pleine).
        total++;
        if (total === 1) premiere = Object.assign({}, val); else autre = Object.assign({}, val);
        return;
      }
      let meilleure = -1, cand = 0, nb = 99;
      for (const i of libres) {
        if (i in val) continue;
        const [h, v] = parCase[i];
        const m = possibles(h) & possibles(v);
        const c = bits(m);
        if (c < nb) { nb = c; meilleure = i; cand = m; if (c <= 1) break; }
      }
      if (nb === 0) return;
      for (const d of chiffresDe(cand)) {
        mettre(meilleure, d);
        chercher(n + 1);
        oter(meilleure, d);
        if (total > 1) return;
      }
    })(0);
    return { total, premiere, autre, abandon: noeuds > 60000 };
  }

  function generer(niveau) {
    const T = [0, 4, 5, 6, 7, 8][niveau];
    const NOIRCIR = [0, 0, 0.1, 0.16, 0.2, 0.22][niveau];
    for (let essai = 0; essai < 30; essai++) {
      const b = forme(T, T, NOIRCIR);
      if (!b) continue;
      const { runs, parCase } = suites(b, T, T);
      const cases = Object.keys(parCase).map(Number);
      let meilleur = null;
      for (let e = 0; e < 6; e++) {
        const sol = remplir(runs, parCase, cases);
        if (!sol) continue;
        const sommes = runs.map(r => r.cases.reduce((s, i) => s + sol[i], 0));
        // On ajoute des chiffres donnés tant que la solution n'est pas unique.
        const donnes = {};
        let res = resoudre(runs, parCase, cases, sommes, donnes);
        while (res.total > 1 && !res.abandon) {
          const diff = cases.filter(i => !(i in donnes) && res.premiere[i] !== res.autre[i]);
          const i = diff[Math.floor(Math.random() * diff.length)];
          donnes[i] = sol[i];
          res = resoudre(runs, parCase, cases, sommes, donnes);
        }
        if (res.abandon) continue;
        const n = Object.keys(donnes).length;
        if (!meilleur || n < meilleur.n) meilleur = { n, sol, sommes, donnes };
        if (n === 0) break;
      }
      if (!meilleur) continue;
      // Trop de chiffres donnés : on tente une autre forme.
      if (meilleur.n > Math.max(1, cases.length / 8) && essai < 20) continue;
      const grille = Array(T * T).fill(null);
      cases.forEach(i => { grille[i] = 0; });
      return {
        T,
        sol: cases.reduce((o, i) => { o[i] = meilleur.sol[i]; return o; }, {}),
        donnes: meilleur.donnes,
        indices: runs.map((r, k) => ({ tete: r.tete, sens: r.sens, somme: meilleur.sommes[k], cases: r.cases })),
        blanches: cases.sort((a, c) => a - c)
      };
    }
    return null;
  }

  Gala.kakuro = { generer, resoudre, COMBOS }; // pour les tests

  Gala.enregistrer({
    id: 'kakuro',
    nom: 'Kakuro',
    icone: '➕',
    domaine: 'logique',
    probleme: true,
    consigne: 'Des mots croisés de chiffres. Chaque suite de cases blanches doit faire la somme écrite dans la case noire à sa gauche (→) ou au-dessus (↓), avec des chiffres de 1 à 9 qui ne se répètent pas dans la suite. Touche une case puis un chiffre ; les erreurs s\'affichent en rouge.',
    niveaux: 5,
    adaptatif: true,
    mesure: { unite: 's', meilleur: 'bas' },

    demarrer(ctx) {
      Gala.outils.style('kakuro', `
        .kakuro { display: grid; width: min(96vw, 480px); aspect-ratio: 1; gap: 2px; background: var(--texte); border: 2px solid var(--texte); border-radius: 6px; overflow: hidden; }
        .kakuro > * { position: relative; min-height: 0; min-width: 0; }
        .kakuro .noir { background: var(--texte); }
        .kakuro .indice { background: linear-gradient(to top right, var(--texte) calc(50% - 1px), var(--fond) 50%, var(--texte) calc(50% + 1px)); }
        .kakuro .indice span { position: absolute; color: var(--fond); font-weight: 700; font-size: var(--t-indice); line-height: 1; }
        .kakuro .indice .h { top: 8%; right: 10%; }
        .kakuro .indice .v { bottom: 8%; left: 10%; }
        .kakuro button { padding: 0; border: 0; border-radius: 0; font-size: var(--t-kakuro); font-weight: 600; color: var(--accent); background: var(--carte); }
        .kakuro button.donne { color: var(--texte); font-weight: 800; background: var(--carte-2); cursor: default; }
        .kakuro button.suite { background: color-mix(in srgb, var(--accent) 10%, var(--carte)); }
        .kakuro button.choisie { background: color-mix(in srgb, var(--accent) 32%, var(--carte)); outline: none; }
        .kakuro button.faux { color: var(--erreur); }
        .kakuro-aide { text-align: center; color: var(--discret); min-height: 1.4em; }
        .kakuro-pave { display: flex; flex-wrap: wrap; gap: .4rem; justify-content: center; max-width: 480px; }
        .kakuro-pave button { width: 3.2rem; min-height: 52px; padding: 0; font-size: 1.4rem; font-weight: 700; }
      `);

      let p = ctx.etat.lire();
      if (!p || p.niveau !== ctx.niveau || !p.indices) {
        const g = generer(ctx.niveau);
        p = { niveau: ctx.niveau, T: g.T, sol: g.sol, donnes: g.donnes, indices: g.indices, blanches: g.blanches, valeurs: {}, erreurs: 0, secondes: 0 };
        for (const i in g.donnes) p.valeurs[i] = g.donnes[i];
        ctx.etat.sauver(p);
      }
      const T = p.T;

      const plateau = document.createElement('div');
      plateau.className = 'kakuro';
      plateau.style.gridTemplateColumns = `repeat(${T}, 1fr)`;
      plateau.style.gridTemplateRows = `repeat(${T}, 1fr)`;
      plateau.style.setProperty('--t-kakuro', T >= 7 ? 'clamp(1.1rem, 5.6vw, 1.7rem)' : 'clamp(1.4rem, 8vw, 2.3rem)');
      plateau.style.setProperty('--t-indice', T >= 7 ? 'clamp(.6rem, 2.6vw, .85rem)' : 'clamp(.75rem, 3.4vw, 1.05rem)');
      const aide = document.createElement('div');
      aide.className = 'kakuro-aide';
      const pave = document.createElement('div');
      pave.className = 'kakuro-pave';
      pave.innerHTML = [1, 2, 3, 4, 5, 6, 7, 8, 9].map(v => `<button data-v="${v}">${v}</button>`).join('') + '<button data-v="0" aria-label="Effacer">⌫</button>';
      const actions = document.createElement('div');
      actions.className = 'groupe';
      actions.innerHTML = '<button data-a="solution">Voir la solution</button>';
      ctx.zone.append(plateau, aide, pave, actions);

      // Indices par case noire, et suites de chaque case blanche.
      const parTete = {}, suitesDe = {};
      p.indices.forEach(ind => {
        (parTete[ind.tete] = parTete[ind.tete] || {})[ind.sens] = ind.somme;
        ind.cases.forEach(i => { (suitesDe[i] = suitesDe[i] || []).push(ind); });
      });
      const estBlanche = new Set(p.blanches);
      let choisie = null, finie = false;
      const debut = performance.now() - p.secondes * 1000;
      const secondes = () => Math.round((performance.now() - debut) / 1000);
      ctx.repeter(5000, () => { if (!finie) { p.secondes = secondes(); ctx.etat.sauver(p); } });

      function texteAide() {
        if (choisie == null) return 'Touche une case blanche.';
        return suitesDe[choisie].map(ind => {
          const n = ind.cases.length;
          const combos = (Gala.kakuro.COMBOS[n + ':' + ind.somme] || []);
          let t = `${ind.sens === 'h' ? '→' : '↓'} ${n} cases pour ${ind.somme}`;
          // Aux premiers niveaux, on montre les combinaisons quand il y en a peu.
          if (ctx.niveau <= 2 && combos.length <= 3) {
            t += ' (' + combos.map(m => [1, 2, 3, 4, 5, 6, 7, 8, 9].filter(d => m & (1 << d)).join('+')).join(' ou ') + ')';
          }
          return t;
        }).join('   ·   ');
      }

      function dessiner() {
        const dansSuite = new Set(choisie == null ? [] : suitesDe[choisie].flatMap(ind => ind.cases));
        let html = '';
        for (let i = 0; i < T * T; i++) {
          const r = Math.floor(i / T), c = i % T;
          if (estBlanche.has(i)) {
            const v = p.valeurs[i], cls = [];
            if (i in p.donnes) cls.push('donne');
            else if (v && v !== p.sol[i]) cls.push('faux');
            if (choisie === i) cls.push('choisie');
            else if (dansSuite.has(i)) cls.push('suite');
            html += `<button data-i="${i}" class="${cls.join(' ')}" aria-label="ligne ${r} colonne ${c}${v ? ', ' + v : ', vide'}">${v || ''}</button>`;
          } else if (parTete[i]) {
            const t = parTete[i];
            const lib = [t.h ? `${t.h} vers la droite` : '', t.v ? `${t.v} vers le bas` : ''].filter(Boolean).join(', ');
            html += `<div class="indice" role="img" aria-label="${lib}">${t.h ? `<span class="h">${t.h}</span>` : ''}${t.v ? `<span class="v">${t.v}</span>` : ''}</div>`;
          } else html += '<div class="noir"></div>';
        }
        plateau.innerHTML = html;
        aide.textContent = finie ? '' : texteAide();
        ctx.stats({ 'Cases vides': p.blanches.filter(i => !p.valeurs[i]).length, Erreurs: p.erreurs });
      }

      function terminer(resolu) {
        finie = true;
        choisie = null;
        ctx.etat.effacer();
        actions.innerHTML = '';
        if (!resolu) {
          p.blanches.forEach(i => { p.valeurs[i] = p.sol[i]; });
          dessiner();
          ctx.message('Voici la solution.');
          ctx.attendre(3500, () => ctx.fin({ valeur: null, reussite: 0, reussi: false }));
          return;
        }
        dessiner();
        ctx.son('ok');
        ctx.message('Grille terminée, bravo !');
        ctx.attendre(1200, () => ctx.fin({ valeur: secondes(), reussite: Math.max(0.2, 1 - 0.1 * p.erreurs), reussi: true }));
      }

      function poser(v) {
        if (finie || choisie == null || choisie in p.donnes) return;
        p.valeurs[choisie] = v;
        if (v && v !== p.sol[choisie]) { p.erreurs++; ctx.son('erreur'); } else if (v) ctx.son('clic');
        ctx.etat.sauver(p);
        dessiner();
        if (p.blanches.every(i => p.valeurs[i] === p.sol[i])) terminer(true);
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
        if (e.key >= '1' && e.key <= '9') poser(v);
        else if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') poser(0);
        else if (e.key.startsWith('Arrow')) {
          e.preventDefault();
          const d = { ArrowUp: -T, ArrowDown: T, ArrowLeft: -1, ArrowRight: 1 }[e.key];
          let i = choisie == null ? p.blanches[0] - d : choisie;
          for (let n = 0; n < T * T; n++) {
            i = (i + d + T * T) % (T * T);
            if (estBlanche.has(i)) break;
          }
          choisie = i;
          dessiner();
        }
      });

      dessiner();
      ctx.message('Touche une case, puis un chiffre.');
    }
  });
})();
