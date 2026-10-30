/* 2048 — repris de jeux-offline.html. La partie en cours est sauvegardée et reprise. */
Gala.enregistrer({
  id: '2048',
  nom: '2048',
  icone: '🔢',
  domaine: 'logique',
  consigne: 'Fais glisser les tuiles (flèches ou doigt). Deux tuiles identiques fusionnent : vise la tuile 2048.',
  detente: true, // jeu de détente : hors séance du jour
  niveaux: 1,
  mesure: { unite: 'points', meilleur: 'haut' },

  demarrer(ctx) {
    Gala.outils.style('2048', `
      .g2048 { width: min(92vw, 440px); aspect-ratio: 1; background: #8f8577; border-radius: 12px; padding: 8px;
        display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; touch-action: none; }
      .g2048 div { border-radius: 8px; background: #b5aa9b; display: flex; align-items: center; justify-content: center;
        font-weight: 800; font-size: clamp(1.1rem, 7vw, 2rem); }
    `);
    const COULEURS = { 2: '#eee4da', 4: '#ede0c8', 8: '#f2b179', 16: '#f59563', 32: '#f67c5f', 64: '#f65e3b',
      128: '#edcf72', 256: '#edcc61', 512: '#edc850', 1024: '#edc53f', 2048: '#edc22e' };

    const grille = document.createElement('div');
    grille.className = 'g2048';
    const nouvelle = document.createElement('button');
    nouvelle.textContent = '↻ Nouvelle partie';
    ctx.zone.append(grille, nouvelle);

    let b, score, finie, gagnee;

    function initialiser(reprendre) {
      const sauve = reprendre && ctx.etat.lire();
      if (sauve && sauve.b) {
        b = sauve.b; score = sauve.score; gagnee = !!sauve.gagnee;
        ctx.message('Partie reprise là où tu l\'avais laissée');
      } else {
        b = Array(16).fill(0); score = 0; gagnee = false;
        ajouter(); ajouter();
        ctx.message('Glisse pour déplacer les tuiles');
      }
      finie = false;
      dessiner();
    }

    function ajouter() {
      const vides = b.map((v, i) => (v ? -1 : i)).filter(i => i >= 0);
      if (vides.length) b[vides[Math.floor(Math.random() * vides.length)]] = Math.random() < 0.9 ? 2 : 4;
    }

    function peutBouger() {
      for (let i = 0; i < 16; i++) {
        if (!b[i]) return true;
        if (i % 4 < 3 && b[i] === b[i + 1]) return true;
        if (i < 12 && b[i] === b[i + 4]) return true;
      }
      return false;
    }

    function bouger(dx, dy) {
      if (finie) return;
      const nb = b.slice();
      let bouge = false;
      for (let l = 0; l < 4; l++) {
        const idx = [];
        for (let k = 0; k < 4; k++) {
          const p = dx === 1 || dy === 1 ? 3 - k : k;
          idx.push(dx ? l * 4 + p : p * 4 + l);
        }
        const vals = idx.map(i => nb[i]).filter(v => v), sortie = [];
        for (let i = 0; i < vals.length; i++) {
          if (vals[i] === vals[i + 1]) {
            sortie.push(vals[i] * 2);
            score += vals[i] * 2;
            if (vals[i] * 2 === 2048 && !gagnee) {
              gagnee = true;
              ctx.son('fin');
              ctx.message('🎉 2048 ! Continue si tu veux');
            }
            i++;
          } else sortie.push(vals[i]);
        }
        while (sortie.length < 4) sortie.push(0);
        idx.forEach((i, k) => {
          if (nb[i] !== sortie[k]) bouge = true;
          nb[i] = sortie[k];
        });
      }
      if (!bouge) return;
      b = nb;
      ajouter();
      dessiner();
      if (!peutBouger()) {
        finie = true;
        ctx.etat.effacer();
        ctx.message('Plus aucun mouvement possible');
        ctx.fin({ valeur: score, reussi: gagnee || score > 0 });
      } else {
        ctx.etat.sauver({ b, score, gagnee });
      }
    }

    function dessiner() {
      grille.innerHTML = b.map(v => `<div style="background:${v ? COULEURS[v] || '#3c3a32' : ''};color:${v > 4 ? '#fff' : '#776e65'}${v >= 1024 ? ';font-size:clamp(.9rem,5vw,1.5rem)' : ''}">${v || ''}</div>`).join('');
      ctx.stats({ Score: score });
    }

    Gala.outils.fleches(ctx, bouger);
    Gala.outils.glisser(ctx, grille, bouger);
    ctx.ecouter(nouvelle, 'click', () => {
      ctx.etat.effacer();
      initialiser(false);
    });
    initialiser(true);
  }
});
