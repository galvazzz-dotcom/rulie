/* Énigme de déduction — problème de logique en plusieurs étapes (section « Problèmes »).
   Quelques personnes, quelques caractéristiques (maison, boisson, animal, voiture) et une liste d'indices.
   Il faut retrouver qui a quoi. Chaque énigme est générée avec une solution unique.
   Niveau : 3 à 5 personnes, 2 ou 3 caractéristiques. Réussite selon le nombre de vérifications. */
(function () {
  const PRENOMS = ['Anne', 'Bruno', 'Claire', 'Denis', 'Élise'];
  const CATEGORIES = {
    maison: {
      titre: 'Maison', court: n => 'n° ' + (n + 1),
      sujet: n => `La personne de la maison ${n + 1}`, objet: n => `la personne de la maison ${n + 1}`,
      oui: n => `habite la maison ${n + 1}`, non: n => `n'habite pas la maison ${n + 1}`
    },
    boisson: {
      titre: 'Boisson', valeurs: ['thé', 'café', 'jus', 'lait', 'eau'],
      du: ['du thé', 'du café', 'du jus d\'orange', 'du lait', 'de l\'eau'], de: ['de thé', 'de café', 'de jus d\'orange', 'de lait', 'd\'eau'],
      sujet(n) { return `La personne qui boit ${this.du[n]}`; }, objet(n) { return `la personne qui boit ${this.du[n]}`; },
      oui(n) { return `boit ${this.du[n]}`; }, non(n) { return `ne boit pas ${this.de[n]}`; }
    },
    animal: {
      titre: 'Animal', valeurs: ['chat', 'chien', 'lapin', 'poisson', 'perroquet'],
      sujet(n) { return `La personne qui a un ${this.valeurs[n]}`; }, objet(n) { return `la personne qui a un ${this.valeurs[n]}`; },
      oui(n) { return `a un ${this.valeurs[n]}`; }, non(n) { return `n'a pas de ${this.valeurs[n]}`; }
    },
    voiture: {
      titre: 'Voiture', valeurs: ['rouge', 'bleue', 'verte', 'jaune', 'blanche'],
      sujet(n) { return `La personne à la voiture ${this.valeurs[n]}`; }, objet(n) { return `la personne à la voiture ${this.valeurs[n]}`; },
      oui(n) { return `a la voiture ${this.valeurs[n]}`; }, non(n) { return `n'a pas la voiture ${this.valeurs[n]}`; }
    },
    nom: {
      sujet: n => PRENOMS[n], objet: n => PRENOMS[n],
      oui: n => `s'appelle ${PRENOMS[n]}`, non: n => `ne s'appelle pas ${PRENOMS[n]}`
    }
  };

  function permutations(n) {
    const res = [];
    const p = [...Array(n).keys()];
    (function perm(k) {
      if (k === n) { res.push(p.slice()); return; }
      for (let i = k; i < n; i++) { [p[k], p[i]] = [p[i], p[k]]; perm(k + 1); [p[k], p[i]] = [p[i], p[k]]; }
    })(0);
    return res;
  }

  // sol[cat][personne] = valeur. Une entité est { c: catégorie, v: valeur } ; pour 'nom', la valeur est la personne.
  function qui(sol, e) { return e.c === 'nom' ? e.v : sol[e.c].indexOf(e.v); }

  function verifie(sol, ind) {
    const a = qui(sol, ind.a), b = qui(sol, ind.b);
    if (ind.t === 'eq') return a === b;
    if (ind.t === 'ne') return a !== b;
    const pa = sol.maison[a], pb = sol.maison[b];
    if (ind.t === 'gauche') return pa === pb - 1;
    if (ind.t === 'cote') return Math.abs(pa - pb) === 1;
    if (ind.t === 'avant') return pa < pb;
    return false;
  }
  const catsDe = ind => [ind.a.c, ind.b.c, ...(['gauche', 'cote', 'avant'].includes(ind.t) ? ['maison'] : [])].filter(c => c !== 'nom');

  // Nombre de solutions (on s'arrête à 2).
  function compter(cats, N, indices, perms) {
    let n = 0;
    const sol = {};
    const prets = cats.map((c, k) => indices.filter(ind => { const cs = catsDe(ind); return cs.includes(c) && cs.every(x => cats.indexOf(x) <= k); }));
    (function essai(k) {
      if (n >= 2) return;
      if (k === cats.length) { n++; return; }
      for (const p of perms) {
        sol[cats[k]] = p;
        if (prets[k].every(ind => verifie(sol, ind))) essai(k + 1);
        if (n >= 2) return;
      }
    })(0);
    return n;
  }

  function generer(N, cats) {
    const M = Gala.outils.melanger;
    const perms = permutations(N);
    const sol = {};
    cats.forEach(c => { sol[c] = M([...Array(N).keys()]); });
    const entites = [];
    ['nom', ...cats].forEach(c => { for (let v = 0; v < N; v++) entites.push({ c, v }); });
    const pool = [];
    for (const a of entites) for (const b of entites) {
      if (a.c === b.c || a.c === 'maison') continue;
      const pa = qui(sol, a), pb = qui(sol, b);
      if (pa === pb) pool.push({ t: 'eq', a, b });
      else {
        if (Math.random() < 0.35) pool.push({ t: 'ne', a, b });
        if (cats.includes('maison') && b.c !== 'maison') {
          if (sol.maison[pa] === sol.maison[pb] - 1) pool.push({ t: 'gauche', a, b }, { t: 'gauche', a, b });
          if (Math.abs(sol.maison[pa] - sol.maison[pb]) === 1 && Math.random() < 0.5) pool.push({ t: 'cote', a, b });
          if (sol.maison[pa] < sol.maison[pb] - 1 && Math.random() < 0.4) pool.push({ t: 'avant', a, b });
        }
      }
    }
    // Moins d'indices directs « Anne boit du thé » : ils rendent l'énigme trop facile.
    const melange = M(pool).sort((x, y) => (x.t === 'eq' && (x.a.c === 'nom' || x.b.c === 'nom') ? 1 : 0) - (y.t === 'eq' && (y.a.c === 'nom' || y.b.c === 'nom') ? 1 : 0));
    const choisis = [];
    for (const ind of melange) {
      choisis.push(ind);
      if (choisis.length >= N && compter(cats, N, choisis, perms) === 1) break;
    }
    // On retire les indices inutiles, pour que chacun compte.
    for (let i = choisis.length - 1; i >= 0; i--) {
      const sans = choisis.filter((_, k) => k !== i);
      if (compter(cats, N, sans, perms) === 1) choisis.splice(i, 1);
    }
    return { sol, indices: M(choisis) };
  }

  function texte(ind) {
    const A = CATEGORIES[ind.a.c], B = CATEGORIES[ind.b.c];
    const s = A.sujet(ind.a.v);
    if (ind.t === 'eq') return `${s} ${B.oui(ind.b.v)}.`;
    if (ind.t === 'ne') return `${s} ${B.non(ind.b.v)}.`;
    if (ind.t === 'gauche') return `${s} habite juste à gauche de ${B.objet(ind.b.v)}.`;
    if (ind.t === 'cote') return `${s} habite à côté de ${B.objet(ind.b.v)}.`;
    return `${s} habite plus à gauche que ${B.objet(ind.b.v)}.`;
  }

  Gala.deduction = { generer, compter, permutations, texte }; // pour les tests

  Gala.enregistrer({
    id: 'deduction',
    nom: 'Énigme de déduction',
    icone: '🕵️',
    domaine: 'logique',
    probleme: true,
    consigne: 'Lis les indices et retrouve, pour chaque personne, sa maison, sa boisson, son animal… Les maisons sont alignées de gauche à droite (la n° 1 est tout à gauche). Touche un indice pour le barrer une fois utilisé, puis « Vérifier ».',
    niveaux: 5,
    adaptatif: true,
    mesure: { unite: 's', meilleur: 'bas' },

    demarrer(ctx) {
      Gala.outils.style('deduction', `
        .ded-indices { width: min(96vw, 640px); margin: 0; padding-left: 1.6rem; display: flex; flex-direction: column; gap: .35rem; }
        .ded-indices li { font-size: 1.1rem; line-height: 1.35; cursor: pointer; padding: .15rem .2rem; border-radius: 6px; }
        .ded-indices li.barre { text-decoration: line-through; color: var(--discret); }
        .ded-table { border-collapse: separate; border-spacing: .25rem; width: min(98vw, 560px); table-layout: fixed; }
        .ded-table th:first-child, .ded-table td:first-child { width: 4.6rem; }
        .ded-table th { text-align: left; font-size: 1rem; color: var(--discret); }
        .ded-table td:first-child { font-weight: 800; font-size: 1.05rem; overflow-wrap: anywhere; }
        .ded-table select { font-size: 1.05rem; padding: .45rem .3rem; border-radius: 10px; border: 2px solid var(--bord);
          background: var(--carte); color: var(--texte); width: 100%; min-width: 0; }
        .ded-table select.faux { border-color: var(--erreur); }
        .ded-table select.bon { border-color: var(--ok); }
      `);
      const N = [0, 3, 4, 4, 5, 5][ctx.niveau];
      const CATS = {
        1: ['maison', 'boisson'], 2: ['maison', 'animal'], 3: ['maison', 'boisson', 'animal'],
        4: ['maison', 'animal'], 5: ['maison', 'boisson', 'voiture']
      }[ctx.niveau];
      const CIBLE = [0, 120, 240, 420, 360, 720][ctx.niveau]; // secondes pour une réussite pleine (indicatif)

      let enigme = ctx.etat.lire();
      if (!enigme || enigme.niveau !== ctx.niveau) {
        const g = generer(N, CATS);
        enigme = { niveau: ctx.niveau, sol: g.sol, indices: g.indices, barres: [], choix: {}, verifs: 0, secondes: 0 };
        ctx.etat.sauver(enigme);
      }

      const liste = document.createElement('ol');
      liste.className = 'ded-indices';
      liste.innerHTML = enigme.indices.map((ind, i) => `<li data-i="${i}" class="${enigme.barres.includes(i) ? 'barre' : ''}">${texte(ind)}</li>`).join('');
      const table = document.createElement('table');
      table.className = 'ded-table';
      const libelle = (c, v) => (c === 'maison' ? 'n° ' + (v + 1) : CATEGORIES[c].valeurs[v]);
      table.innerHTML = `<tr><th></th>${CATS.map(c => `<th>${CATEGORIES[c].titre}</th>`).join('')}</tr>` +
        PRENOMS.slice(0, N).map((nom, p) => `<tr><td>${nom}</td>${CATS.map(c => `<td><select data-c="${c}" data-p="${p}" aria-label="${CATEGORIES[c].titre} de ${nom}">
          <option value="">?</option>${[...Array(N).keys()].map(v => `<option value="${v}">${libelle(c, v)}</option>`).join('')}</select></td>`).join('')}</tr>`).join('');
      const actions = document.createElement('div');
      actions.className = 'groupe';
      actions.innerHTML = '<button class="principal" data-a="verifier">✔ Vérifier</button><button data-a="effacer">↺ Tout effacer</button><button data-a="solution">Voir la solution</button>';
      ctx.zone.append(liste, table, actions);
      const selects = [...table.querySelectorAll('select')];
      selects.forEach(s => { const k = s.dataset.c + s.dataset.p; if (enigme.choix[k] != null) s.value = enigme.choix[k]; });

      const debut = performance.now() - enigme.secondes * 1000;
      const secondes = () => Math.round((performance.now() - debut) / 1000);
      const majStats = () => ctx.stats({ Indices: enigme.indices.length, Vérifications: enigme.verifs });
      majStats();
      ctx.message('');
      ctx.repeter(5000, () => { enigme.secondes = secondes(); ctx.etat.sauver(enigme); });

      ctx.ecouter(liste, 'click', e => {
        const li = e.target.closest('li');
        if (!li) return;
        li.classList.toggle('barre');
        const i = Number(li.dataset.i);
        enigme.barres = li.classList.contains('barre') ? [...enigme.barres, i] : enigme.barres.filter(x => x !== i);
        ctx.etat.sauver(enigme);
      });

      ctx.ecouter(table, 'change', e => {
        const s = e.target;
        s.classList.remove('faux', 'bon');
        enigme.choix[s.dataset.c + s.dataset.p] = s.value === '' ? null : Number(s.value);
        ctx.etat.sauver(enigme);
      });

      function finir(resolu) {
        const t = secondes();
        ctx.etat.effacer();
        selects.forEach(s => { s.value = enigme.sol[s.dataset.c][s.dataset.p]; s.disabled = true; s.classList.add('bon'); });
        actions.innerHTML = '';
        if (!resolu) {
          ctx.message('Voici la solution.');
          ctx.attendre(4000, () => ctx.fin({ valeur: null, reussite: 0, reussi: false }));
          return;
        }
        const reussite = Math.max(0.3, 1 - 0.2 * (enigme.verifs - 1)) * (t <= CIBLE ? 1 : 0.9);
        ctx.son('ok');
        ctx.message('Bravo, tout est juste !');
        ctx.attendre(1800, () => ctx.fin({ valeur: t, reussite, reussi: true }));
      }

      ctx.ecouter(actions, 'click', e => {
        const b = e.target.closest('button');
        if (!b) return;
        if (b.dataset.a === 'effacer') {
          selects.forEach(s => { s.value = ''; s.classList.remove('faux', 'bon'); });
          enigme.choix = {};
          ctx.etat.sauver(enigme);
        } else if (b.dataset.a === 'solution') {
          finir(false);
        } else {
          const vides = selects.filter(s => s.value === '').length;
          if (vides) { ctx.message(`Il reste ${vides} case${vides > 1 ? 's' : ''} à remplir.`); return; }
          enigme.verifs++;
          majStats();
          let fautes = 0;
          selects.forEach(s => {
            const juste = Number(s.value) === enigme.sol[s.dataset.c][s.dataset.p];
            if (!juste) fautes++;
          });
          if (!fautes) return finir(true);
          ctx.son('erreur');
          // On dit combien de cases sont fausses, sans dire lesquelles (sauf à partir de la 3e vérification).
          if (enigme.verifs >= 3) selects.forEach(s => s.classList.toggle('faux', Number(s.value) !== enigme.sol[s.dataset.c][s.dataset.p]));
          ctx.message(`${fautes} case${fautes > 1 ? 's sont fausses' : ' est fausse'}.${enigme.verifs >= 3 ? ' Elles sont entourées en rouge.' : ' Relis les indices.'}`);
          ctx.etat.sauver(enigme);
        }
      });
    }
  });
})();
