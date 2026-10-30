/* Stroop — attention sélective : nommer la couleur de l'encre sans se laisser piéger par le mot.
   20 essais. Niveau : part de pièges, temps limite, puis changement de consigne au niveau 5. */
Gala.enregistrer({
  id: 'stroop',
  nom: 'Couleurs piégées',
  icone: '🎨',
  domaine: 'attention',
  consigne: 'Un nom de couleur s\'affiche, écrit dans une encre de couleur. Touche la couleur de l\'ENCRE, pas le mot écrit.',
  niveaux: 5,
  adaptatif: true,
  mesure: { unite: 'bonnes réponses', meilleur: 'haut' },

  demarrer(ctx) {
    Gala.outils.style('stroop', `
      .stroop-carte { width: min(92vw, 440px); min-height: 9rem; background: #fff; border: 2px solid var(--bord); border-radius: 16px;
        display: flex; flex-direction: column; align-items: center; justify-content: center; gap: .3rem; }
      .stroop-mot { font-size: clamp(2.4rem, 12vw, 3.6rem); font-weight: 800; letter-spacing: .04em; }
      .stroop-regle { font-size: .95rem; font-weight: 700; padding: .15rem .7rem; border-radius: 999px; background: #1f2430; color: #fff; }
      .stroop-reponses { display: grid; grid-template-columns: 1fr 1fr; gap: .6rem; width: min(92vw, 440px); }
      .stroop-reponses button { min-height: 64px; font-size: 1.2rem; font-weight: 700; }
      .stroop-temps { height: 6px; width: min(92vw, 440px); background: var(--carte-2); border-radius: 3px; overflow: hidden; }
      .stroop-temps i { display: block; height: 100%; background: var(--accent); }
    `);
    const ESSAIS = 20;
    const PIEGES = [0, 0.25, 0.5, 0.7, 0.85, 0.8][ctx.niveau];
    const LIMITE = [0, 0, 0, 4000, 3000, 3500][ctx.niveau]; // ms, 0 = pas de chrono
    const ALTERNANCE = ctx.niveau === 5; // parfois il faut répondre le MOT
    const COULEURS = [
      { nom: 'ROUGE', code: '#d0312d' },
      { nom: 'BLEU', code: '#1f5fc8' },
      { nom: 'VERT', code: '#13803f' },
      { nom: 'VIOLET', code: '#7d3c98' }
    ];

    const temps = document.createElement('div');
    temps.className = 'stroop-temps';
    temps.innerHTML = '<i></i>';
    const carte = document.createElement('div');
    carte.className = 'stroop-carte';
    const reponses = document.createElement('div');
    reponses.className = 'stroop-reponses';
    COULEURS.forEach((c, i) => {
      const b = document.createElement('button');
      b.textContent = c.nom.charAt(0) + c.nom.slice(1).toLowerCase();
      b.dataset.i = i;
      reponses.appendChild(b);
    });
    ctx.zone.append(...(LIMITE ? [temps] : []), carte, reponses);

    let essai = 0, bonnes = 0, attendue = -1, actif = false, chrono = null;
    const majStats = () => ctx.stats({ Essai: Math.min(essai + 1, ESSAIS) + ' / ' + ESSAIS, Bonnes: bonnes });

    function suivant() {
      if (essai >= ESSAIS) {
        ctx.message('Terminé !');
        ctx.fin({ valeur: bonnes, reussite: bonnes / ESSAIS, reussi: bonnes >= ESSAIS / 2 });
        return;
      }
      majStats();
      const encre = Math.floor(Math.random() * 4);
      let mot = encre;
      if (Math.random() < PIEGES) mot = (encre + 1 + Math.floor(Math.random() * 3)) % 4;
      const regleMot = ALTERNANCE && Math.random() < 0.3;
      attendue = regleMot ? mot : encre;

      carte.innerHTML = (ALTERNANCE ? `<span class="stroop-regle">${regleMot ? 'Lis le MOT' : 'Couleur de l\'ENCRE'}</span>` : '') +
        `<span class="stroop-mot" style="color:${COULEURS[encre].code}">${COULEURS[mot].nom}</span>`;
      actif = true;

      if (LIMITE) {
        const barre = temps.firstChild;
        barre.style.transition = 'none';
        barre.style.width = '100%';
        void barre.offsetWidth; // relance l'animation
        barre.style.transition = `width ${LIMITE}ms linear`;
        barre.style.width = '0%';
        chrono = ctx.attendre(LIMITE, () => repondre(-1));
      }
    }

    function repondre(i) {
      if (!actif) return;
      actif = false;
      clearTimeout(chrono);
      if (i === attendue) {
        bonnes++;
        ctx.son('ok');
        ctx.message('✓');
      } else {
        ctx.son('erreur');
        ctx.message(i === -1 ? 'Trop tard' : '✗ C\'était ' + COULEURS[attendue].nom.toLowerCase());
      }
      essai++;
      majStats();
      ctx.attendre(i === attendue ? 350 : 900, suivant);
    }

    ctx.ecouter(reponses, 'click', e => {
      const b = e.target.closest('button');
      if (b) repondre(Number(b.dataset.i));
    });
    // Raccourcis clavier 1 à 4.
    ctx.ecouter(document, 'keydown', e => {
      if (e.key >= '1' && e.key <= '4') repondre(Number(e.key) - 1);
    });

    ctx.message('Prêt ?');
    ctx.attendre(800, () => { ctx.message(''); suivant(); });
  }
});
