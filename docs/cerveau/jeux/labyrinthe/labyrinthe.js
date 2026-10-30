/* Labyrinthe — planification (domaine « Organisation »).
   Va du départ (en haut à gauche) à l'arrivée (en bas à droite) en faisant le moins de pas possible :
   repère le chemin avant de te lancer. Niveau : taille du labyrinthe ; au niveau 5, on ne voit
   plus que les alentours une fois parti. Score = nombre de pas ; réussite = pas minimum / pas joués. */
Gala.enregistrer({
  id: 'labyrinthe',
  nom: 'Labyrinthe',
  icone: '🌀',
  domaine: 'executif',
  consigne: 'Amène le point bleu jusqu\'au drapeau avec les flèches (clavier, boutons ou en glissant le doigt). Chaque pas compte : prends le temps de repérer le bon chemin avant de partir.',
  niveaux: 5,
  adaptatif: true,
  mesure: { unite: 'pas', meilleur: 'bas' },

  demarrer(ctx) {
    Gala.outils.style('labyrinthe', `
      .laby { width: min(94vw, 480px); background: var(--carte); border: 2px solid var(--bord); border-radius: 12px; touch-action: none; }
      .laby svg { display: block; width: 100%; height: auto; }
      .laby-pad { display: grid; grid-template-columns: repeat(3, 60px); grid-template-rows: repeat(2, 52px); gap: 6px; }
      .laby-pad button { font-size: 1.3rem; padding: 0; }
    `);
    const N = [0, 6, 8, 10, 12, 12][ctx.niveau];
    const BROUILLARD = ctx.niveau === 5;
    const U = 10; // taille d'une case dans le dessin

    // Labyrinthe parfait (un seul chemin entre deux cases) par exploration en profondeur.
    // murs[i] = [haut, droite, bas, gauche]
    const murs = Array.from({ length: N * N }, () => [true, true, true, true]);
    const vu = new Set([0]);
    const pile = [0];
    const DIRS = [[0, -1, 0, 2], [1, 0, 1, 3], [0, 1, 2, 0], [-1, 0, 3, 1]]; // dx, dy, mur ici, mur en face
    while (pile.length) {
      const i = pile[pile.length - 1], x = i % N, y = Math.floor(i / N);
      const options = DIRS.filter(([dx, dy]) => {
        const X = x + dx, Y = y + dy;
        return X >= 0 && Y >= 0 && X < N && Y < N && !vu.has(Y * N + X);
      });
      if (!options.length) { pile.pop(); continue; }
      const [dx, dy, ici, face] = options[Math.floor(Math.random() * options.length)];
      const j = (y + dy) * N + x + dx;
      murs[i][ici] = false;
      murs[j][face] = false;
      vu.add(j);
      pile.push(j);
    }

    // Plus court chemin (parcours en largeur).
    const distance = (() => {
      const d = new Map([[0, 0]]), file = [0];
      while (file.length) {
        const i = file.shift(), x = i % N, y = Math.floor(i / N);
        DIRS.forEach(([dx, dy, ici]) => {
          if (murs[i][ici]) return;
          const j = (y + dy) * N + x + dx;
          if (!d.has(j)) { d.set(j, d.get(i) + 1); file.push(j); }
        });
      }
      return d.get(N * N - 1);
    })();

    const boite = document.createElement('div');
    boite.className = 'laby';
    const pad = document.createElement('div');
    pad.className = 'laby-pad';
    pad.innerHTML = '<span></span><button data-d="0">▲</button><span></span><button data-d="3">◀</button><button data-d="2">▼</button><button data-d="1">▶</button>';
    ctx.zone.append(boite, pad);

    let pos = 0, pas = 0, finie = false;
    const chemin = [0];

    function dessiner() {
      const px = pos % N, py = Math.floor(pos / N);
      const visible = i => !BROUILLARD || !pas || Math.abs(i % N - px) + Math.abs(Math.floor(i / N) - py) <= 2;
      let traits = '';
      murs.forEach((m, i) => {
        if (!visible(i)) return;
        const x = (i % N) * U, y = Math.floor(i / N) * U;
        if (m[0]) traits += `M${x} ${y}h${U}`;
        if (m[1]) traits += `M${x + U} ${y}v${U}`;
        if (m[2]) traits += `M${x} ${y + U}h${U}`;
        if (m[3]) traits += `M${x} ${y}v${U}`;
      });
      const trace = chemin.map((i, k) => `${k ? 'L' : 'M'}${(i % N) * U + U / 2} ${Math.floor(i / N) * U + U / 2}`).join('');
      boite.innerHTML = `<svg viewBox="-1 -1 ${N * U + 2} ${N * U + 2}" role="img" aria-label="Labyrinthe">
        <rect x="${(N - 1) * U + 1}" y="${(N - 1) * U + 1}" width="${U - 2}" height="${U - 2}" fill="#13a34a" opacity=".25"/>
        <text x="${(N - 1) * U + U / 2}" y="${(N - 1) * U + U * 0.72}" font-size="${U * 0.6}" text-anchor="middle">🏁</text>
        <path d="${trace}" fill="none" stroke="#1f5fc8" stroke-opacity=".3" stroke-width="${U * 0.25}" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="${traits}" stroke="var(--texte)" stroke-width="1.2" stroke-linecap="round" fill="none"/>
        <circle cx="${px * U + U / 2}" cy="${py * U + U / 2}" r="${U * 0.3}" fill="#1f5fc8"/></svg>`;
      ctx.stats({ Pas: pas, Minimum: distance });
    }

    function bouger(d) {
      if (finie || murs[pos][d]) return;
      const [dx, dy] = DIRS[d];
      pos += dy * N + dx;
      pas++;
      if (chemin.length > 1 && chemin[chemin.length - 2] === pos) chemin.pop(); else chemin.push(pos);
      dessiner();
      if (pos === N * N - 1) {
        finie = true;
        ctx.son('ok');
        ctx.message(pas === distance ? 'Parfait, le chemin le plus court !' : 'Arrivé !');
        ctx.fin({ valeur: pas, reussite: Math.min(1, distance / pas), reussi: pas <= 2 * distance });
      }
    }

    pad.querySelectorAll('[data-d]').forEach(b => ctx.ecouter(b, 'pointerdown', e => { e.preventDefault(); bouger(Number(b.dataset.d)); }));
    Gala.outils.fleches(ctx, (dx, dy) => bouger(dy < 0 ? 0 : dx > 0 ? 1 : dy > 0 ? 2 : 3));
    Gala.outils.glisser(ctx, boite, (dx, dy) => bouger(dy < 0 ? 0 : dx > 0 ? 1 : dy > 0 ? 2 : 3));

    dessiner();
    ctx.message(BROUILLARD ? 'Observe bien : dès le premier pas, tu ne verras plus que les alentours' : 'Repère le chemin, puis lance-toi');
  }
});
