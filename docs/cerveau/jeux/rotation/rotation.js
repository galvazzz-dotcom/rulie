/* Rotation mentale — représentation dans l'espace (domaine « Organisation »).
   Une forme modèle ; parmi les propositions, une seule est la même forme tournée,
   les autres sont son reflet dans un miroir (tourné lui aussi). 12 questions, sans chrono. */
Gala.enregistrer({
  id: 'rotation',
  nom: 'Rotation mentale',
  icone: '🔄',
  domaine: 'executif',
  consigne: 'Quelle forme est la même que le modèle, simplement tournée ? Les autres sont retournées comme dans un miroir. Il n\'y a pas de chrono.',
  niveaux: 5,
  adaptatif: true,
  mesure: { unite: 'bonnes réponses', meilleur: 'haut' },

  demarrer(ctx) {
    Gala.outils.style('rotation', `
      .rot-modele { background: var(--carte); border: 2px solid var(--bord); border-radius: 16px; padding: .5rem; width: 9rem; text-align: center; }
      .rot-modele small { color: var(--discret); font-weight: 600; }
      .rot-choix { display: grid; gap: .6rem; width: min(92vw, 460px); }
      .rot-choix button { aspect-ratio: 1; min-height: 0; padding: .4rem; }
      .rot-choix button.bon { border-color: var(--ok); border-width: 4px; }
      .rot-choix button.faux { border-color: var(--erreur); border-width: 4px; }
      .rot-choix svg, .rot-modele svg { width: 100%; height: auto; display: block; }
    `);
    const QUESTIONS = 12;
    const CASES = [0, 4, 5, 5, 6, 7][ctx.niveau];
    const CHOIX = [0, 2, 3, 4, 4, 4][ctx.niveau];

    // Formes : listes de cases [x, y].
    const normaliser = f => {
      const mx = Math.min(...f.map(p => p[0])), my = Math.min(...f.map(p => p[1]));
      return f.map(([x, y]) => [x - mx, y - my]).sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    };
    const cle = f => normaliser(f).map(p => p.join(',')).join(';');
    const tourner = f => normaliser(f.map(([x, y]) => [y, -x]));
    const miroir = f => normaliser(f.map(([x, y]) => [-x, y]));
    const rotations = f => {
      const r = [normaliser(f)];
      for (let k = 1; k < 4; k++) r.push(tourner(r[k - 1]));
      return r;
    };

    // Une forme « chirale » (différente de son reflet) et sans symétrie de rotation.
    function nouvelleForme() {
      for (;;) {
        const f = [[0, 0]];
        while (f.length < CASES) {
          const [x, y] = f[Math.floor(Math.random() * f.length)];
          const [dx, dy] = [[1, 0], [-1, 0], [0, 1], [0, -1]][Math.floor(Math.random() * 4)];
          if (!f.some(p => p[0] === x + dx && p[1] === y + dy)) f.push([x + dx, y + dy]);
        }
        const rots = rotations(f).map(cle);
        if (new Set(rots).size < 4) continue;
        if (rots.includes(cle(miroir(f)))) continue;
        return normaliser(f);
      }
    }

    function dessin(f, couleur) {
      const t = Math.max(...f.map(p => Math.max(p[0], p[1]))) + 1;
      const cote = Math.max(t, 4), u = 100 / (cote + 1);
      const ox = (100 - (Math.max(...f.map(p => p[0])) + 1) * u) / 2, oy = (100 - (Math.max(...f.map(p => p[1])) + 1) * u) / 2;
      return `<svg viewBox="0 0 100 100" aria-hidden="true">${f.map(([x, y]) =>
        `<rect x="${ox + x * u}" y="${oy + y * u}" width="${u}" height="${u}" rx="${u * 0.12}" fill="${couleur}" stroke="var(--carte)" stroke-width="1.5"/>`).join('')}</svg>`;
    }

    const modele = document.createElement('div');
    modele.className = 'rot-modele';
    const choix = document.createElement('div');
    choix.className = 'rot-choix';
    choix.style.gridTemplateColumns = `repeat(${CHOIX === 3 ? 3 : 2}, 1fr)`;
    ctx.zone.append(modele, choix);

    let numero = 0, bonnes = 0, bonne = -1, actif = false;
    const majStats = () => ctx.stats({ Question: Math.min(numero + 1, QUESTIONS) + ' / ' + QUESTIONS, Bonnes: bonnes });

    function suivante() {
      if (numero >= QUESTIONS) {
        ctx.fin({ valeur: bonnes, reussite: bonnes / QUESTIONS, reussi: bonnes >= QUESTIONS / 2 });
        return;
      }
      const forme = nouvelleForme();
      const rots = rotations(forme), mirs = rotations(miroir(forme));
      const depart = Math.floor(Math.random() * 4);
      const juste = rots[(depart + 1 + Math.floor(Math.random() * 3)) % 4]; // jamais la même orientation
      const leurres = Gala.outils.melanger(mirs).slice(0, CHOIX - 1);
      const propositions = Gala.outils.melanger([juste, ...leurres]);
      bonne = propositions.indexOf(juste);

      modele.innerHTML = `<small>Modèle</small>${dessin(rots[depart], 'var(--texte)')}`;
      choix.innerHTML = propositions.map((f, i) => `<button data-i="${i}" aria-label="Proposition ${i + 1}">${dessin(f, 'var(--accent)')}</button>`).join('');
      ctx.message('');
      majStats();
      actif = true;
    }

    ctx.ecouter(choix, 'click', e => {
      const b = e.target.closest('button');
      if (!b || !actif) return;
      actif = false;
      numero++;
      const i = Number(b.dataset.i);
      choix.querySelector(`[data-i="${bonne}"]`).classList.add('bon');
      if (i === bonne) {
        bonnes++;
        ctx.son('ok');
        ctx.message('✓ Bien vu');
      } else {
        b.classList.add('faux');
        ctx.son('erreur');
        ctx.message('✗ La bonne forme est entourée en vert');
      }
      majStats();
      ctx.attendre(i === bonne ? 700 : 1800, suivante);
    });
    ctx.ecouter(document, 'keydown', e => {
      const n = Number(e.key);
      if (n >= 1 && n <= CHOIX) choix.querySelector(`[data-i="${n - 1}"]`).click();
    });

    suivante();
  }
});
