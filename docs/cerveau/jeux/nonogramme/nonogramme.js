/* Nonogramme (picross) — logique et déduction pas à pas (section « Problèmes »).
   Les nombres au bord de chaque ligne et colonne donnent la longueur des blocs de cases à noircir,
   dans l'ordre. Chaque grille se résout par déduction seule, sans deviner, et n'a qu'une solution.
   Niveau : grille de 5×5 à 10×10. La partie en cours est sauvegardée. */
(function () {
  // Toutes les façons de poser les blocs sur une ligne de n cases compatibles avec ce qu'on sait déjà.
  // connu[i] : 1 noir, 0 blanc, -1 inconnu. Renvoie la ligne déduite (mêmes codes) ou null si impossible.
  function deduireLigne(blocs, connu) {
    const n = connu.length;
    let noir = Array(n).fill(true), blanc = Array(n).fill(true), trouve = false;
    // bonnoir[i] : on peut avoir du noir en i ; on accumule les cases toujours noires / toujours blanches.
    const toujoursNoir = Array(n).fill(true), toujoursBlanc = Array(n).fill(true);
    const ligne = Array(n).fill(0);
    const memo = new Map();
    // possible(k, pos) : peut-on placer les blocs k.. à partir de pos (cases avant pos déjà fixées) ?
    function possible(k, pos) {
      const cle = k * 100 + pos;
      if (memo.has(cle)) return memo.get(cle);
      let r = false;
      if (k === blocs.length) {
        r = true;
        for (let i = pos; i < n; i++) if (connu[i] === 1) { r = false; break; }
      } else {
        for (let d = pos; d + blocs[k] <= n; d++) {
          if (d > pos && connu[d - 1] === 1) break; // une case noire sautée
          let ok = true;
          for (let i = d; i < d + blocs[k]; i++) if (connu[i] === 0) { ok = false; break; }
          if (ok && d + blocs[k] < n && connu[d + blocs[k]] === 1) ok = false;
          if (ok && possible(k + 1, Math.min(n, d + blocs[k] + 1))) { r = true; break; }
        }
      }
      memo.set(cle, r);
      return r;
    }
    function parcourir(k, pos) {
      if (k === blocs.length) {
        for (let i = pos; i < n; i++) if (connu[i] === 1) return;
        trouve = true;
        for (let i = 0; i < n; i++) { if (ligne[i]) toujoursBlanc[i] = false; else toujoursNoir[i] = false; }
        return;
      }
      for (let d = pos; d + blocs[k] <= n; d++) {
        if (d > pos && connu[d - 1] === 1) break;
        let ok = true;
        for (let i = d; i < d + blocs[k]; i++) if (connu[i] === 0) { ok = false; break; }
        if (ok && d + blocs[k] < n && connu[d + blocs[k]] === 1) ok = false;
        if (!ok || !possible(k + 1, Math.min(n, d + blocs[k] + 1))) continue;
        for (let i = d; i < d + blocs[k]; i++) ligne[i] = 1;
        parcourir(k + 1, Math.min(n, d + blocs[k] + 1));
        for (let i = d; i < d + blocs[k]; i++) ligne[i] = 0;
      }
    }
    parcourir(0, 0);
    if (!trouve) return null;
    return connu.map((c, i) => (toujoursNoir[i] ? 1 : toujoursBlanc[i] ? 0 : c));
  }

  const blocsDe = cases => {
    const b = [];
    let c = 0;
    cases.forEach(x => { if (x) c++; else if (c) { b.push(c); c = 0; } });
    if (c) b.push(c);
    return b;
  };

  // Résout ligne par ligne ; vrai si toute la grille est déduite (donc solution unique, sans deviner).
  function resolubleParLignes(lignes, colonnes, N) {
    const g = Array.from({ length: N }, () => Array(N).fill(-1));
    let change = true;
    while (change) {
      change = false;
      for (let y = 0; y < N; y++) {
        const r = deduireLigne(lignes[y], g[y]);
        if (!r) return false;
        r.forEach((v, x) => { if (g[y][x] !== v) { g[y][x] = v; change = true; } });
      }
      for (let x = 0; x < N; x++) {
        const r = deduireLigne(colonnes[x], g.map(l => l[x]));
        if (!r) return false;
        r.forEach((v, y) => { if (g[y][x] !== v) { g[y][x] = v; change = true; } });
      }
    }
    return g.every(l => l.every(v => v !== -1));
  }

  function generer(N) {
    for (let essai = 0; essai < 500; essai++) {
      const dens = 0.52 + Math.random() * 0.12;
      const sol = Array.from({ length: N }, () => Array.from({ length: N }, () => (Math.random() < dens ? 1 : 0)));
      const lignes = sol.map(blocsDe);
      const colonnes = [...Array(N).keys()].map(x => blocsDe(sol.map(l => l[x])));
      if (lignes.some(b => !b.length) || colonnes.some(b => !b.length)) continue;
      if (resolubleParLignes(lignes, colonnes, N)) return { sol, lignes, colonnes };
    }
    return null;
  }

  Gala.nonogramme = { generer, resolubleParLignes, blocsDe }; // pour les tests

  Gala.enregistrer({
    id: 'nonogramme',
    nom: 'Nonogramme',
    icone: '🔳',
    domaine: 'logique',
    probleme: true,
    consigne: 'Les nombres de chaque ligne et colonne donnent, dans l\'ordre, la longueur des blocs de cases noires, séparés par au moins une case blanche. Noircis les bonnes cases. Le mode ✕ sert à marquer les cases que tu sais blanches. Tout se trouve par déduction, sans deviner.',
    niveaux: 5,
    adaptatif: true,
    mesure: { unite: 's', meilleur: 'bas' },

    demarrer(ctx) {
      Gala.outils.style('nonogramme', `
        .nono { display: grid; gap: 0; user-select: none; touch-action: manipulation; }
        .nono .ind { display: flex; align-items: flex-end; justify-content: flex-end; font-size: var(--t-ind); font-weight: 700;
          color: var(--texte); padding: 2px 4px; line-height: 1.15; }
        .nono .ind.col { flex-direction: column; align-items: center; justify-content: flex-end; }
        .nono .ind.ligne { gap: .35em; align-items: center; }
        .nono .ind.fait { color: var(--discret); opacity: .55; }
        .nono .c { width: var(--t-case); height: var(--t-case); border: 1px solid var(--bord); background: var(--carte); cursor: pointer;
          display: flex; align-items: center; justify-content: center; font-size: calc(var(--t-case) * .6); color: var(--discret);
          padding: 0; min-height: 0; border-radius: 0; box-sizing: border-box; transform: none !important; }
        .nono .c.noir { background: var(--texte); }
        .nono .c.faux { background: var(--erreur); }
        .nono .c.b5 { border-right: 2px solid var(--discret); }
        .nono .c.h5 { border-bottom: 2px solid var(--discret); }
        .nono-modes button.actif { background: var(--accent); border-color: var(--accent); color: var(--accent-texte); }
      `);
      const N = [0, 5, 6, 7, 8, 10][ctx.niveau];
      const CIBLE = [0, 90, 150, 240, 360, 600][ctx.niveau];

      let partie = ctx.etat.lire();
      if (!partie || partie.N !== N) {
        const g = generer(N);
        partie = { N, sol: g.sol, lignes: g.lignes, colonnes: g.colonnes, etat: Array(N * N).fill(0), verifs: 0, secondes: 0 };
        ctx.etat.sauver(partie);
      }
      const maxL = Math.max(...partie.lignes.map(b => b.length));
      const maxC = Math.max(...partie.colonnes.map(b => b.length));
      const taille = Math.floor(Math.min(46, (Math.min(window.innerWidth, 640) - 24) / (N + maxL * 0.62)));

      const grille = document.createElement('div');
      grille.className = 'nono';
      grille.style.setProperty('--t-case', taille + 'px');
      grille.style.setProperty('--t-ind', Math.max(12, Math.round(taille * 0.5)) + 'px');
      grille.style.gridTemplateColumns = `auto repeat(${N}, ${taille}px)`;
      let html = '<div></div>';
      partie.colonnes.forEach((b, x) => { html += `<div class="ind col" data-col="${x}" style="min-height:${maxC * 1.2}em">${b.map(v => `<span>${v}</span>`).join('')}</div>`; });
      for (let y = 0; y < N; y++) {
        html += `<div class="ind ligne" data-lig="${y}">${partie.lignes[y].map(v => `<span>${v}</span>`).join('')}</div>`;
        for (let x = 0; x < N; x++) {
          html += `<button class="c${(x + 1) % 5 === 0 && x < N - 1 ? ' b5' : ''}${(y + 1) % 5 === 0 && y < N - 1 ? ' h5' : ''}" data-i="${y * N + x}" aria-label="ligne ${y + 1}, colonne ${x + 1}"></button>`;
        }
      }
      grille.innerHTML = html;
      const modes = document.createElement('div');
      modes.className = 'groupe nono-modes';
      modes.innerHTML = '<button data-m="1" class="actif">⬛ Noircir</button><button data-m="2">✕ Marquer blanc</button>';
      const actions = document.createElement('div');
      actions.className = 'groupe';
      actions.innerHTML = '<button data-a="verifier">✔ Vérifier</button><button data-a="solution">Voir la solution</button>';
      ctx.zone.append(grille, modes, actions);
      const cases = [...grille.querySelectorAll('.c')];

      let mode = 1, fini = false;
      const debut = performance.now() - partie.secondes * 1000;
      const secondes = () => Math.round((performance.now() - debut) / 1000);
      ctx.repeter(5000, () => { if (!fini) { partie.secondes = secondes(); ctx.etat.sauver(partie); } });

      function dessinerCase(i) {
        const c = cases[i], v = partie.etat[i];
        c.classList.toggle('noir', v === 1);
        c.classList.remove('faux');
        c.textContent = v === 2 ? '✕' : '';
      }
      function majIndices() {
        for (let y = 0; y < N; y++) {
          const l = partie.etat.slice(y * N, y * N + N).map(v => (v === 1 ? 1 : 0));
          grille.querySelector(`[data-lig="${y}"]`).classList.toggle('fait', blocsDe(l).join() === partie.lignes[y].join());
        }
        for (let x = 0; x < N; x++) {
          const c = [...Array(N).keys()].map(y => (partie.etat[y * N + x] === 1 ? 1 : 0));
          grille.querySelector(`[data-col="${x}"]`).classList.toggle('fait', blocsDe(c).join() === partie.colonnes[x].join());
        }
      }
      const juste = () => partie.etat.every((v, i) => (v === 1) === (partie.sol[Math.floor(i / N)][i % N] === 1));
      const majStats = () => ctx.stats({ Grille: N + ' × ' + N, Vérifications: partie.verifs });

      cases.forEach((_, i) => dessinerCase(i));
      majIndices();
      majStats();

      function terminer(resolu) {
        fini = true;
        ctx.etat.effacer();
        partie.etat = partie.sol.flat().map(v => (v ? 1 : 2));
        cases.forEach((_, i) => dessinerCase(i));
        actions.innerHTML = '';
        if (!resolu) {
          ctx.message('Voici la solution.');
          ctx.attendre(3500, () => ctx.fin({ valeur: null, reussite: 0, reussi: false }));
          return;
        }
        const t = secondes();
        ctx.son('ok');
        ctx.message('Grille terminée, bravo !');
        const reussite = Math.max(0.3, 1 - 0.15 * partie.verifs) * (t <= CIBLE ? 1 : 0.9);
        ctx.attendre(1500, () => ctx.fin({ valeur: t, reussite, reussi: true }));
      }

      // Toucher une case ; on peut aussi glisser le doigt ou la souris pour en remplir plusieurs.
      let geste = null;
      function appliquer(i) {
        if (fini || i == null) return;
        if (geste.vus.has(i)) return;
        geste.vus.add(i);
        partie.etat[i] = geste.valeur;
        dessinerCase(i);
      }
      ctx.ecouter(grille, 'pointerdown', e => {
        const c = e.target.closest('.c');
        if (!c || fini) return;
        e.preventDefault();
        const i = Number(c.dataset.i);
        geste = { valeur: partie.etat[i] === mode ? 0 : mode, vus: new Set() };
        appliquer(i);
        ctx.son('clic');
      });
      ctx.ecouter(grille, 'pointermove', e => {
        if (!geste) return;
        const el = document.elementFromPoint(e.clientX, e.clientY);
        const c = el && el.closest && el.closest('.c');
        if (c && grille.contains(c)) appliquer(Number(c.dataset.i));
      });
      ctx.ecouter(document, 'pointerup', () => {
        if (!geste) return;
        geste = null;
        majIndices();
        ctx.etat.sauver(partie);
        if (juste()) terminer(true);
      });

      ctx.ecouter(modes, 'click', e => {
        const b = e.target.closest('button');
        if (!b) return;
        mode = Number(b.dataset.m);
        [...modes.children].forEach(x => x.classList.toggle('actif', x === b));
      });

      ctx.ecouter(actions, 'click', e => {
        const b = e.target.closest('button');
        if (!b || fini) return;
        if (b.dataset.a === 'solution') return terminer(false);
        partie.verifs++;
        majStats();
        let fautes = 0;
        partie.etat.forEach((v, i) => {
          const noir = partie.sol[Math.floor(i / N)][i % N] === 1;
          if ((v === 1 && !noir) || (v === 2 && noir)) { fautes++; cases[i].classList.add('faux'); }
        });
        ctx.etat.sauver(partie);
        ctx.message(fautes ? `${fautes} case${fautes > 1 ? 's' : ''} en erreur, en rouge.` : 'Aucune erreur pour l\'instant, continue !');
        ctx.son(fautes ? 'erreur' : 'ok');
      });
    }
  });
})();
