/* Compte les formes — attention sélective et comptage.
   8 images de formes mélangées ; il faut compter celles qui sont demandées.
   Niveau : nombre de formes, puis forme ET couleur à combiner. */
Gala.enregistrer({
  id: 'compte',
  nom: 'Compte les formes',
  icone: '🔺',
  domaine: 'attention',
  consigne: 'Compte les formes demandées dans l\'image (par exemple « les triangles bleus ») et choisis le bon nombre.',
  niveaux: 5,
  adaptatif: true,
  mesure: { unite: 'bonnes réponses', meilleur: 'haut' },

  demarrer(ctx) {
    Gala.outils.style('compte', `
      .compte-question { font-size: 1.3rem; font-weight: 700; text-align: center; min-height: 1.6em; }
      .compte-scene { width: min(94vw, 520px); background: #fff; border: 2px solid var(--bord); border-radius: 14px; }
      .compte-scene svg { display: block; width: 100%; height: auto; }
      .compte-reponses { display: grid; grid-template-columns: repeat(4, 1fr); gap: .5rem; width: min(94vw, 520px); }
      .compte-reponses button { min-height: 64px; font-size: 1.5rem; font-weight: 700; }
      .compte-reponses button.bon { border-color: var(--ok); background: var(--ok); color: #fff; }
      .compte-reponses button.faux { border-color: var(--erreur); background: var(--erreur); color: #fff; }
    `);
    const QUESTIONS = 8;
    const [MIN, MAX] = [null, [6, 10], [10, 14], [12, 18], [16, 22], [20, 28]][ctx.niveau];
    const FORMES = [['rond', 'ronds'], ['carré', 'carrés'], ['triangle', 'triangles'], ['losange', 'losanges']];
    const NB_FORMES = [0, 2, 3, 3, 4, 4][ctx.niveau];
    const COULEURS = [['#d0312d', 'rouge', 'rouges'], ['#1f5fc8', 'bleu', 'bleus'], ['#13803f', 'vert', 'verts'], ['#d9822b', 'orange', 'orange']];
    const NB_COULEURS = [0, 1, 1, 2, 3, 4][ctx.niveau];
    const W = 100, H = 66, R = 4.2;

    const question = document.createElement('div');
    question.className = 'compte-question';
    const scene = document.createElement('div');
    scene.className = 'compte-scene';
    const reponses = document.createElement('div');
    reponses.className = 'compte-reponses';
    ctx.zone.append(question, scene, reponses);

    const dessiner = (f, x, y, c) => {
      if (f === 0) return `<circle cx="${x}" cy="${y}" r="${R}" fill="${c}"/>`;
      if (f === 1) return `<rect x="${x - R * 0.9}" y="${y - R * 0.9}" width="${R * 1.8}" height="${R * 1.8}" fill="${c}"/>`;
      if (f === 2) return `<polygon points="${x},${y - R} ${x + R},${y + R * 0.8} ${x - R},${y + R * 0.8}" fill="${c}"/>`;
      return `<polygon points="${x},${y - R * 1.1} ${x + R},${y} ${x},${y + R * 1.1} ${x - R},${y}" fill="${c}"/>`;
    };

    let numero = 0, bonnes = 0, reponse = 0, actif = false;
    const majStats = () => ctx.stats({ Image: Math.min(numero + 1, QUESTIONS) + ' / ' + QUESTIONS, Bonnes: bonnes });

    function suivante() {
      if (numero >= QUESTIONS) {
        ctx.fin({ valeur: bonnes, reussite: bonnes / QUESTIONS, reussi: bonnes >= QUESTIONS / 2 });
        return;
      }
      const n = MIN + Math.floor(Math.random() * (MAX - MIN + 1));
      const points = [];
      let essais = 0;
      while (points.length < n && essais++ < 2000) {
        const x = R + 1 + Math.random() * (W - 2 * R - 2), y = R + 1 + Math.random() * (H - 2 * R - 2);
        if (points.every(p => (p.x - x) ** 2 + (p.y - y) ** 2 > (2.4 * R) ** 2)) {
          points.push({ x, y, f: Math.floor(Math.random() * NB_FORMES), c: Math.floor(Math.random() * NB_COULEURS) });
        }
      }
      const cibleF = Math.floor(Math.random() * NB_FORMES), cibleC = Math.floor(Math.random() * NB_COULEURS);
      const avecCouleur = NB_COULEURS > 1;
      reponse = points.filter(p => p.f === cibleF && (!avecCouleur || p.c === cibleC)).length;

      scene.innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Formes à compter">${points.map(p => dessiner(p.f, p.x, p.y, COULEURS[p.c][0])).join('')}</svg>`;
      question.textContent = `Combien de ${FORMES[cibleF][1]}${avecCouleur ? ' ' + COULEURS[cibleC][2] : ''} ?`;
      const choix = new Set([reponse]);
      for (const e of Gala.outils.melanger([1, -1, 2, -2, 3])) {
        if (choix.size === 4) break;
        if (reponse + e >= 0) choix.add(reponse + e);
      }
      reponses.innerHTML = [...choix].sort((a, b) => a - b).map(v => `<button data-v="${v}">${v}</button>`).join('');
      majStats();
      actif = true;
    }

    ctx.ecouter(reponses, 'click', e => {
      const b = e.target.closest('button');
      if (!b || !actif) return;
      actif = false;
      numero++;
      reponses.querySelector(`[data-v="${reponse}"]`).classList.add('bon');
      const juste = Number(b.dataset.v) === reponse;
      if (juste) { bonnes++; ctx.son('ok'); } else { b.classList.add('faux'); ctx.son('erreur'); }
      majStats();
      ctx.attendre(juste ? 700 : 1500, suivante);
    });

    suivante();
  }
});
