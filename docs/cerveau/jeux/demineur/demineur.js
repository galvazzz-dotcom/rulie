/* Démineur — repris de jeux-offline.html. Niveau 1 : 9×9, 10 mines ; 2 : 10×14, 22 ; 3 : 12×18, 40. */
Gala.enregistrer({
  id: 'demineur',
  nom: 'Démineur',
  icone: '💣',
  domaine: 'logique',
  consigne: 'Ouvre toutes les cases sans mine. Chaque chiffre indique combien de mines touchent la case. Appui long, clic droit ou mode drapeau pour marquer une mine.',
  detente: true, // jeu de détente : hors séance du jour
  niveaux: 3,
  mesure: { unite: 's', meilleur: 'bas' },

  demarrer(ctx) {
    Gala.outils.style('demineur', `
      .mines { display: grid; gap: 3px; touch-action: manipulation; }
      .mines div { background: var(--accent); opacity: .85; border-radius: 5px; display: flex; align-items: center; justify-content: center;
        font-weight: 800; aspect-ratio: 1; font-size: clamp(.75rem, 4.5vw, 1.15rem); cursor: pointer; user-select: none; -webkit-user-select: none; }
      .mines div.o { background: var(--carte-2); opacity: 1; cursor: default; }
      .mines div.boum { background: var(--erreur); opacity: 1; }
    `);
    const [L, H, NB] = [null, [9, 9, 10], [10, 14, 22], [12, 18, 40]][ctx.niveau];
    const COULEURS = ['', '#2f6fd6', '#1f8a4c', '#c0392b', '#8e44ad', '#b9770e', '#16a085', '#555', '#888'];

    const grille = document.createElement('div');
    grille.className = 'mines';
    grille.style.gridTemplateColumns = `repeat(${L}, 1fr)`;
    grille.style.width = `min(92vw, ${L * 40}px)`;
    const drapeau = document.createElement('button');
    drapeau.textContent = '🚩 Mode drapeau';
    drapeau.setAttribute('aria-pressed', 'false');
    ctx.zone.append(grille, drapeau);

    const cases = [];
    let premier = true, finie = false, drapeaux = 0, temps = 0, modeDrapeau = false, chrono = null;

    const voisins = i => {
      const x = i % L, y = Math.floor(i / L), r = [];
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        if (!dx && !dy) continue;
        const X = x + dx, Y = y + dy;
        if (X >= 0 && Y >= 0 && X < L && Y < H) r.push(Y * L + X);
      }
      return r;
    };
    const majStats = () => ctx.stats({ Mines: NB - drapeaux, Temps: temps + ' s' });

    for (let i = 0; i < L * H; i++) {
      const el = document.createElement('div');
      el.setAttribute('role', 'button');
      cases.push({ m: false, o: false, f: false, a: 0, el });
      grille.appendChild(el);

      let appui = null, long = false;
      ctx.ecouter(el, 'pointerdown', e => {
        if (e.button === 2) return;
        long = false;
        appui = setTimeout(() => { long = true; marquer(i); if (navigator.vibrate) navigator.vibrate(30); }, 400);
      });
      const annuler = () => clearTimeout(appui);
      ctx.ecouter(el, 'pointerup', e => {
        annuler();
        if (e.button === 2 || long) return;
        modeDrapeau ? marquer(i) : ouvrir(i);
      });
      ctx.ecouter(el, 'pointerleave', annuler);
      ctx.ecouter(el, 'contextmenu', e => { e.preventDefault(); marquer(i); });
    }
    ctx.surNettoyage(() => clearInterval(chrono));

    function placer(sauf) {
      const interdit = new Set([sauf, ...voisins(sauf)]);
      let k = 0;
      while (k < NB) {
        const i = Math.floor(Math.random() * cases.length);
        if (cases[i].m || interdit.has(i)) continue;
        cases[i].m = true;
        k++;
      }
      cases.forEach((c, i) => { c.a = voisins(i).filter(j => cases[j].m).length; });
    }

    function ouvrir(i) {
      if (finie) return;
      const c = cases[i];
      if (c.f) return;
      if (premier) {
        premier = false;
        ctx.message('');
        placer(i);
        chrono = setInterval(() => { temps++; majStats(); }, 1000);
      }
      if (c.o) {
        // Ouverture rapide autour d'un chiffre dont toutes les mines sont marquées.
        const marques = voisins(i).filter(j => cases[j].f).length;
        if (c.a && marques === c.a) voisins(i).forEach(j => { if (!cases[j].o && !cases[j].f) devoiler(j); });
      } else devoiler(i);
      verifier();
    }

    function devoiler(i) {
      const pile = [i];
      while (pile.length) {
        const j = pile.pop(), c = cases[j];
        if (c.o || c.f || finie) continue;
        c.o = true;
        if (c.m) { perdre(j); return; }
        peindre(j);
        if (!c.a) voisins(j).forEach(k => { if (!cases[k].o) pile.push(k); });
      }
    }

    function marquer(i) {
      if (finie) return;
      const c = cases[i];
      if (c.o) return;
      c.f = !c.f;
      drapeaux += c.f ? 1 : -1;
      peindre(i);
      majStats();
    }

    function peindre(i) {
      const c = cases[i], e = c.el;
      if (c.o) {
        e.className = 'o';
        e.textContent = c.m ? '💣' : c.a || '';
        e.style.color = COULEURS[c.a];
      } else {
        e.className = '';
        e.textContent = c.f ? '🚩' : '';
      }
    }

    function perdre(j) {
      finie = true;
      clearInterval(chrono);
      cases.forEach((c, i) => { if (c.m) { c.o = true; peindre(i); } });
      cases[j].el.classList.add('boum');
      ctx.message('💥 Boum !');
      ctx.fin({ valeur: null, reussi: false });
    }

    function verifier() {
      if (finie || !cases.every(c => c.m || c.o)) return;
      finie = true;
      clearInterval(chrono);
      cases.forEach((c, i) => { if (c.m && !c.f) { c.f = true; peindre(i); } });
      drapeaux = NB;
      majStats();
      ctx.message('🏆 Grille terminée !');
      ctx.fin({ valeur: temps, reussi: true });
    }

    ctx.ecouter(drapeau, 'click', () => {
      modeDrapeau = !modeDrapeau;
      drapeau.classList.toggle('actif', modeDrapeau);
      drapeau.setAttribute('aria-pressed', String(modeDrapeau));
    });
    majStats();
    ctx.message('Touche une case pour commencer');
  }
});
