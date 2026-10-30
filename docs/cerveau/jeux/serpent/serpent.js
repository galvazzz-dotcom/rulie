/* Serpent (Snake) — repris de jeux-offline.html. Niveau = vitesse de départ. */
Gala.enregistrer({
  id: 'serpent',
  nom: 'Serpent',
  icone: '🐍',
  domaine: 'vitesse',
  consigne: 'Guide le serpent vers les pommes avec les flèches ou en glissant le doigt. Ne touche ni les bords ni ta queue.',
  detente: true, // jeu de détente : hors séance du jour
  niveaux: 3,
  mesure: { unite: 'pommes', meilleur: 'haut' },

  demarrer(ctx) {
    Gala.outils.style('serpent', `
      .serpent-plateau { background: #12141d; border-radius: 12px; touch-action: none; width: min(92vw, 440px); aspect-ratio: 1; }
      .serpent-pad { display: grid; grid-template-columns: repeat(3, 64px); grid-template-rows: repeat(2, 56px); gap: 8px; }
      .serpent-pad button { font-size: 1.4rem; padding: 0; }
    `);
    const N = 20, TAILLE = 440;
    const VITESSE = [0, 170, 140, 110][ctx.niveau];

    const plateau = document.createElement('canvas');
    plateau.width = plateau.height = TAILLE;
    plateau.className = 'serpent-plateau';
    const bouton = document.createElement('button');
    bouton.className = 'principal';
    const pad = document.createElement('div');
    pad.className = 'serpent-pad';
    pad.innerHTML = '<span></span><button data-d="0,-1" aria-label="Haut">▲</button><span></span>' +
      '<button data-d="-1,0" aria-label="Gauche">◀</button><button data-d="0,1" aria-label="Bas">▼</button><button data-d="1,0" aria-label="Droite">▶</button>';
    ctx.zone.append(plateau, bouton, pad);

    let corps = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
    let dir = { x: 1, y: 0 }, file = [], pommes = 0, vitesse = VITESSE, pomme;
    let etat = 'pret'; // pret | jeu | pause | mort
    let minuterie = null;

    function placerPomme() {
      do pomme = { x: Math.floor(Math.random() * N), y: Math.floor(Math.random() * N) };
      while (corps.some(p => p.x === pomme.x && p.y === pomme.y));
    }

    function majBouton() {
      bouton.textContent = { pret: '▶ Jouer', jeu: '⏸ Pause', pause: '▶ Reprendre', mort: '…' }[etat];
    }

    function boucle() {
      clearTimeout(minuterie);
      minuterie = ctx.attendre(vitesse, () => {
        if (etat !== 'jeu') return;
        pas();
        if (etat === 'jeu') boucle();
      });
    }

    function jouer() { etat = 'jeu'; ctx.message(''); majBouton(); boucle(); }
    function pause() {
      if (etat !== 'jeu') return;
      etat = 'pause'; clearTimeout(minuterie); ctx.message('En pause'); majBouton();
    }

    function tourner(x, y) {
      if (etat === 'mort') return;
      const dernier = file.length ? file[file.length - 1] : dir;
      if ((dernier.x === -x && dernier.y === -y) || (dernier.x === x && dernier.y === y)) {
        if (etat !== 'jeu') jouer();
        return;
      }
      if (file.length < 3) file.push({ x, y });
      if (etat !== 'jeu') jouer();
    }

    function pas() {
      if (file.length) dir = file.shift();
      const tete = { x: corps[0].x + dir.x, y: corps[0].y + dir.y };
      if (tete.x < 0 || tete.y < 0 || tete.x >= N || tete.y >= N ||
          corps.slice(0, -1).some(p => p.x === tete.x && p.y === tete.y)) {
        etat = 'mort';
        majBouton();
        dessiner(true);
        ctx.message('Perdu ! ' + pommes + ' pomme' + (pommes > 1 ? 's' : ''));
        ctx.fin({ valeur: pommes, reussi: pommes > 0 });
        return;
      }
      corps.unshift(tete);
      if (tete.x === pomme.x && tete.y === pomme.y) {
        pommes++;
        ctx.son('clic');
        vitesse = Math.max(60, vitesse - 3);
        placerPomme();
        ctx.stats({ Pommes: pommes });
      } else corps.pop();
      dessiner();
    }

    function dessiner(mort) {
      const c = plateau.getContext('2d'), z = TAILLE / N;
      c.fillStyle = '#12141d';
      c.fillRect(0, 0, TAILLE, TAILLE);
      c.fillStyle = '#ff6b6b';
      c.beginPath();
      c.arc((pomme.x + 0.5) * z, (pomme.y + 0.5) * z, z * 0.38, 0, 7);
      c.fill();
      corps.forEach((p, i) => {
        c.fillStyle = mort ? '#888' : i ? '#5ad19a' : '#9bf0c5';
        c.fillRect(p.x * z + 1, p.y * z + 1, z - 2, z - 2);
      });
    }

    ctx.ecouter(bouton, 'click', () => (etat === 'jeu' ? pause() : etat !== 'mort' && jouer()));
    pad.querySelectorAll('[data-d]').forEach(b => ctx.ecouter(b, 'pointerdown', e => {
      e.preventDefault();
      tourner(...b.dataset.d.split(',').map(Number));
    }));
    Gala.outils.fleches(ctx, tourner);
    Gala.outils.glisser(ctx, plateau, tourner);
    ctx.ecouter(document, 'visibilitychange', () => { if (document.hidden) pause(); });

    placerPomme();
    dessiner();
    majBouton();
    ctx.stats({ Pommes: 0 });
    ctx.message('Appuie sur Jouer ou sur une flèche pour commencer');
  }
});
