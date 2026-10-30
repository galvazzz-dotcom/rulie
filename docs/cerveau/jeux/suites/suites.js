/* Suites logiques — raisonnement inductif : trouver le nombre suivant.
   10 suites, 4 réponses proposées, sans chrono. Le niveau fixe le type de règles. */
Gala.enregistrer({
  id: 'suites',
  nom: 'Suites logiques',
  icone: '🔁',
  domaine: 'logique',
  consigne: 'Trouve la règle de chaque suite de nombres et choisis celui qui vient ensuite. Prends ton temps : il n\'y a pas de chrono.',
  niveaux: 5,
  adaptatif: true,
  mesure: { unite: 'bonnes réponses', meilleur: 'haut' },

  demarrer(ctx) {
    Gala.outils.style('suites', `
      .suites-ligne { display: flex; flex-wrap: wrap; gap: .35rem; justify-content: center; align-items: center; }
      .suites-ligne span { min-width: 2.7rem; padding: .55rem .35rem; border-radius: 12px; background: var(--carte); border: 2px solid var(--bord);
        font-size: 1.3rem; font-weight: 800; text-align: center; font-variant-numeric: tabular-nums; }
      .suites-ligne span.inconnu { border-style: dashed; border-color: var(--accent); color: var(--accent); }
      .suites-reponses { display: grid; grid-template-columns: 1fr 1fr; gap: .6rem; width: min(92vw, 420px); }
      .suites-reponses button { min-height: 68px; font-size: 1.5rem; font-weight: 700; }
      .suites-reponses button.bon { border-color: var(--ok); background: var(--ok); color: #fff; }
      .suites-reponses button.faux { border-color: var(--erreur); background: var(--erreur); color: #fff; }
      .suites-regle { min-height: 1.4em; color: var(--discret); text-align: center; }
    `);
    const QUESTIONS = 10, TERMES = 5;
    const h = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
    const pioche = t => t[Math.floor(Math.random() * t.length)];

    // Chaque règle renvoie { termes: [6 nombres], regle: 'explication' } ; le 6e est la réponse.
    const REGLES = {
      ajout() {
        const d = h(1, 5), a = h(1, 20);
        return { termes: [0, 1, 2, 3, 4, 5].map(k => a + k * d), regle: `On ajoute ${d} à chaque fois.` };
      },
      ajoutRetrait() {
        const d = pioche([-9, -7, -5, -4, -3, 6, 7, 8, 9, 11, 12]), a = d < 0 ? h(60, 90) : h(1, 30);
        return { termes: [0, 1, 2, 3, 4, 5].map(k => a + k * d), regle: d < 0 ? `On retire ${-d} à chaque fois.` : `On ajoute ${d} à chaque fois.` };
      },
      double() {
        const a = h(1, 5), f = pioche([2, 2, 3]);
        return { termes: [0, 1, 2, 3, 4, 5].map(k => a * f ** k), regle: `On multiplie par ${f}.` };
      },
      entrelacees() {
        const a = h(1, 10), b = h(20, 40), d1 = h(2, 5), d2 = pioche([-3, -2, 2, 3, 4]);
        const t = [];
        for (let k = 0; k < 6; k++) t.push(k % 2 ? b + ((k - 1) / 2) * d2 : a + (k / 2) * d1);
        return { termes: t, regle: `Deux suites mélangées : une case sur deux on ajoute ${d1}, l'autre ${d2 > 0 ? 'on ajoute ' + d2 : 'on retire ' + -d2}.` };
      },
      ecartCroissant() {
        const a = h(1, 15), d = h(1, 3), t = [a];
        for (let k = 1; k < 6; k++) t.push(t[k - 1] + d * k);
        return { termes: t, regle: `L'écart grandit de ${d} à chaque fois (+${d}, +${2 * d}, +${3 * d}…).` };
      },
      carres() {
        const a = h(1, 6);
        return { termes: [0, 1, 2, 3, 4, 5].map(k => (a + k) ** 2), regle: `Les carrés : ${a}×${a}, ${a + 1}×${a + 1}…` };
      },
      fibonacci() {
        const t = [h(1, 4), h(2, 6)];
        for (let k = 2; k < 6; k++) t.push(t[k - 1] + t[k - 2]);
        return { termes: t, regle: 'Chaque nombre est la somme des deux précédents.' };
      },
      doublePlus() {
        const a = h(1, 4), c = pioche([1, -1, 2]), t = [a];
        for (let k = 1; k < 6; k++) t.push(t[k - 1] * 2 + c);
        return { termes: t, regle: `On double puis on ${c > 0 ? 'ajoute ' + c : 'retire ' + -c}.` };
      },
      alterneOps() {
        const a = h(1, 6), p = h(2, 5), t = [a];
        for (let k = 1; k < 6; k++) t.push(k % 2 ? t[k - 1] + p : t[k - 1] * 2);
        return { termes: t, regle: `On alterne : +${p}, puis ×2.` };
      },
      ecartDouble() {
        const a = h(1, 10), t = [a];
        for (let k = 1; k < 6; k++) t.push(t[k - 1] + 2 ** (k - 1));
        return { termes: t, regle: "L'écart double à chaque fois (+1, +2, +4, +8…)." };
      }
    };
    const PAR_NIVEAU = {
      1: ['ajout'],
      2: ['ajout', 'ajoutRetrait', 'double'],
      3: ['ajoutRetrait', 'double', 'entrelacees', 'ecartCroissant'],
      4: ['entrelacees', 'ecartCroissant', 'carres', 'fibonacci'],
      5: ['fibonacci', 'doublePlus', 'alterneOps', 'ecartDouble', 'carres']
    }[ctx.niveau];

    function genererQuestion() {
      const { termes, regle } = REGLES[pioche(PAR_NIVEAU)]();
      const res = termes[TERMES], avant = termes[TERMES - 1], ecart = avant - termes[TERMES - 2];
      // Leurres : la réponse « naïve » (même écart que le dernier), et des voisins proches.
      const choix = new Set([res]);
      for (const v of Gala.outils.melanger([avant + ecart, res + 1, res - 1, res + 2, res - 2, res + ecart, res + 10])) {
        if (choix.size === 4) break;
        if (v !== res && v >= 0) choix.add(v);
      }
      while (choix.size < 4) choix.add(res + choix.size * 3);
      return { montres: termes.slice(0, TERMES), res, regle, choix: Gala.outils.melanger([...choix]) };
    }

    const ligne = document.createElement('div');
    ligne.className = 'suites-ligne';
    const reponses = document.createElement('div');
    reponses.className = 'suites-reponses';
    const explication = document.createElement('div');
    explication.className = 'suites-regle';
    ctx.zone.append(ligne, reponses, explication);

    let numero = 0, bonnes = 0, actuelle = null, actif = false;
    const majStats = () => ctx.stats({ Suite: Math.min(numero + 1, QUESTIONS) + ' / ' + QUESTIONS, Bonnes: bonnes });

    function suivante() {
      if (numero >= QUESTIONS) {
        ctx.fin({ valeur: bonnes, reussite: bonnes / QUESTIONS, reussi: bonnes >= QUESTIONS / 2 });
        return;
      }
      actuelle = genererQuestion();
      ligne.innerHTML = actuelle.montres.map(n => `<span>${n}</span>`).join('') + '<span class="inconnu">?</span>';
      reponses.innerHTML = actuelle.choix.map(v => `<button data-v="${v}">${v}</button>`).join('');
      explication.textContent = '';
      ctx.message('');
      majStats();
      actif = true;
    }

    ctx.ecouter(reponses, 'click', e => {
      const b = e.target.closest('button');
      if (!b) return;
      if (!actif) { // après une erreur, un appui passe à la suite
        if (b.dataset.suite) suivante();
        return;
      }
      actif = false;
      const inconnu = ligne.querySelector('.inconnu');
      inconnu.textContent = actuelle.res;
      inconnu.classList.remove('inconnu');
      numero++;
      if (Number(b.dataset.v) === actuelle.res) {
        bonnes++;
        b.classList.add('bon');
        ctx.son('ok');
        majStats();
        ctx.attendre(700, suivante);
      } else {
        b.classList.add('faux');
        reponses.querySelector(`[data-v="${actuelle.res}"]`).classList.add('bon');
        ctx.son('erreur');
        explication.textContent = actuelle.regle;
        majStats();
        // On laisse le temps de lire l'explication.
        const suite = document.createElement('button');
        suite.className = 'principal';
        suite.dataset.suite = '1';
        suite.textContent = numero >= QUESTIONS ? 'Voir le résultat' : 'Suite suivante →';
        suite.style.gridColumn = '1 / -1';
        reponses.appendChild(suite);
        suite.focus();
      }
    });

    suivante();
  }
});
