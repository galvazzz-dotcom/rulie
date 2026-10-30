/* Anagrammes — langage et flexibilité : remettre les lettres d'un mot dans l'ordre.
   8 mots. 1 point par mot trouvé seul, ½ point avec indice, 0 si on passe.
   Niveau : longueur des mots (4 lettres au niveau 1, 8 à 10 au niveau 5). */
Gala.enregistrer({
  id: 'anagrammes',
  nom: 'Anagrammes',
  icone: '🔤',
  domaine: 'langage',
  consigne: 'Les lettres d\'un mot sont mélangées. Touche-les dans le bon ordre pour retrouver le mot. Un indice coûte un demi-point.',
  niveaux: 5,
  adaptatif: true,
  mesure: { unite: 'points', meilleur: 'haut' },

  demarrer(ctx) {
    Gala.outils.style('anagrammes', `
      .ana-cases, .ana-lettres { display: flex; flex-wrap: wrap; gap: .4rem; justify-content: center; }
      .ana-cases span { width: 2.6rem; height: 3rem; border-bottom: 4px solid var(--bord); display: flex; align-items: center;
        justify-content: center; font-size: 1.7rem; font-weight: 800; cursor: pointer; }
      .ana-cases span.indice { color: var(--accent); cursor: default; }
      .ana-cases.juste span { border-color: var(--ok); color: var(--ok); }
      .ana-cases.faux span { border-color: var(--erreur); }
      .ana-lettres button { width: 3rem; height: 3.2rem; min-height: 0; padding: 0; font-size: 1.6rem; font-weight: 800; }
      .ana-lettres button:disabled { visibility: hidden; }
      @media (max-width: 420px) { .ana-cases span { width: 2.1rem; } .ana-lettres button { width: 2.5rem; } }
    `);
    const MOTS = 8;
    const LONGUEURS = { 1: [4], 2: [5], 3: [6], 4: [7], 5: [8, 9, 10] }[ctx.niveau];
    const reserve = Gala.outils.melanger(LONGUEURS.flatMap(n => Gala.donnees.mots[n] || []));
    const liste = reserve.slice(0, MOTS);

    const cases = document.createElement('div');
    cases.className = 'ana-cases';
    const lettres = document.createElement('div');
    lettres.className = 'ana-lettres';
    const actions = document.createElement('div');
    actions.className = 'groupe';
    actions.innerHTML = '<button data-a="effacer">↺ Effacer</button><button data-a="indice">💡 Indice</button><button data-a="passer">Passer →</button>';
    ctx.zone.append(cases, lettres, actions);

    let numero = 0, points = 0, mot = '', melange = [], pose = [], indices = 0, bloque = false;
    // pose[k] = index de la tuile placée dans la case k (ou null) ; les premières cases peuvent être des indices.

    const majStats = () => ctx.stats({ Mot: Math.min(numero + 1, MOTS) + ' / ' + MOTS, Points: String(points).replace('.', ',') });

    function suivant() {
      if (numero >= MOTS || numero >= liste.length) {
        ctx.fin({ valeur: points, reussite: points / MOTS, reussi: points >= MOTS / 2 });
        return;
      }
      mot = liste[numero];
      do melange = Gala.outils.melanger(mot.split(''));
      while (melange.join('') === mot && new Set(mot).size > 1);
      pose = Array(mot.length).fill(null);
      indices = 0;
      bloque = false;
      cases.className = 'ana-cases';
      ctx.message('');
      dessiner();
      majStats();
    }

    function dessiner() {
      cases.innerHTML = pose.map((t, k) => `<span data-k="${k}" class="${k < indices ? 'indice' : ''}">${t == null ? '' : melange[t]}</span>`).join('');
      const utilisees = new Set(pose.filter(t => t != null));
      lettres.innerHTML = melange.map((l, i) => `<button data-t="${i}" ${utilisees.has(i) ? 'disabled' : ''}>${l}</button>`).join('');
    }

    function verifier() {
      if (pose.some(t => t == null)) return;
      const propose = pose.map(t => melange[t]).join('');
      if (propose === mot) {
        bloque = true;
        const gain = indices ? 0.5 : 1;
        points += gain;
        cases.className = 'ana-cases juste';
        ctx.son('ok');
        ctx.message(gain === 1 ? 'Bravo !' : 'Trouvé (avec indice)');
        numero++;
        majStats();
        ctx.attendre(1000, suivant);
      } else {
        cases.className = 'ana-cases faux';
        ctx.son('erreur');
        ctx.message('Ce n\'est pas le mot attendu, touche une lettre pour la retirer');
      }
    }

    ctx.ecouter(lettres, 'click', e => {
      const b = e.target.closest('button');
      if (!b || bloque) return;
      const k = pose.indexOf(null);
      if (k < 0) return;
      pose[k] = Number(b.dataset.t);
      ctx.son('clic');
      dessiner();
      verifier();
    });

    ctx.ecouter(cases, 'click', e => {
      const c = e.target.closest('span');
      if (!c || bloque) return;
      const k = Number(c.dataset.k);
      if (k < indices || pose[k] == null) return;
      pose[k] = null;
      cases.className = 'ana-cases';
      ctx.message('');
      dessiner();
    });

    ctx.ecouter(actions, 'click', e => {
      const b = e.target.closest('button');
      if (!b || bloque) return;
      const a = b.dataset.a;
      if (a === 'effacer') {
        for (let k = indices; k < pose.length; k++) pose[k] = null;
      } else if (a === 'indice') {
        if (indices >= mot.length - 1) return;
        // On repart des lettres déjà sûres et on place la suivante.
        pose = Array(mot.length).fill(null);
        const prises = new Set();
        for (let k = 0; k <= indices; k++) {
          const t = melange.findIndex((l, i) => l === mot[k] && !prises.has(i));
          prises.add(t);
          pose[k] = t;
        }
        indices++;
      } else if (a === 'passer') {
        bloque = true;
        ctx.son('erreur');
        cases.innerHTML = mot.split('').map(l => `<span class="indice">${l}</span>`).join('');
        ctx.message('C\'était ' + mot);
        numero++;
        majStats();
        ctx.attendre(1600, suivant);
        return;
      }
      cases.className = 'ana-cases';
      ctx.message('');
      dessiner();
      verifier();
    });

    // Clavier : taper les lettres, Retour arrière pour effacer la dernière.
    ctx.ecouter(document, 'keydown', e => {
      if (bloque) return;
      if (e.key === 'Backspace') {
        for (let k = pose.length - 1; k >= indices; k--) {
          if (pose[k] != null) { pose[k] = null; break; }
        }
        cases.className = 'ana-cases';
        dessiner();
        return;
      }
      const l = e.key.toUpperCase();
      if (l.length !== 1 || l < 'A' || l > 'Z') return;
      const utilisees = new Set(pose.filter(t => t != null));
      const t = melange.findIndex((x, i) => x === l && !utilisees.has(i));
      const k = pose.indexOf(null);
      if (t < 0 || k < 0) return;
      pose[k] = t;
      dessiner();
      verifier();
    });

    suivant();
  }
});
