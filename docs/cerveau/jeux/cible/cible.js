/* Atteindre la cible — calcul mental et planification (section « Problèmes »).
   Avec quelques nombres et les quatre opérations, il faut obtenir le nombre cible, ou s'en approcher.
   Chaque nombre sert au plus une fois ; le résultat d'un calcul peut resservir. 3 tirages.
   Niveau : 4 petits nombres et petite cible, jusqu'à 6 nombres et une cible à trois chiffres
   qui demande 5 nombres. La cible est toujours atteignable. 10 points si exact, 2 de moins par unité d'écart. */
(function () {
  const h = (a, b) => a + Math.floor(Math.random() * (b - a + 1));

  // Combine k nombres au hasard (dans l'ordre) pour fabriquer une cible atteignable.
  function fabriquer(plaques, k, min, max) {
    for (let essai = 0; essai < 3000; essai++) {
      const pris = Gala.outils.melanger(plaques).slice(0, k);
      let v = pris[0], expr = String(pris[0]), etapes = [];
      let ok = true;
      for (let i = 1; i < k && ok; i++) {
        const b = pris[i];
        const ops = ['+', '×', '−', '÷'].filter(o => (o === '−' ? v > b : o === '÷' ? b > 1 && v % b === 0 : o === '×' ? b > 1 && v > 1 : true));
        const o = ops[Math.floor(Math.random() * ops.length)];
        const r = o === '+' ? v + b : o === '−' ? v - b : o === '×' ? v * b : v / b;
        etapes.push(`${v} ${o} ${b} = ${r}`);
        v = r;
      }
      if (v >= min && v <= max && !plaques.includes(v)) return { cible: v, solution: etapes };
    }
    return null;
  }

  function tirage(n) {
    const conf = {
      1: { nb: 4, k: 3, min: 10, max: 60, grands: 0 },
      2: { nb: 5, k: 3, min: 20, max: 100, grands: 0 },
      3: { nb: 6, k: 4, min: 100, max: 300, grands: 1 },
      4: { nb: 6, k: 4, min: 101, max: 999, grands: 1 },
      5: { nb: 6, k: 5, min: 101, max: 999, grands: 2 }
    }[n];
    for (;;) {
      const grands = Gala.outils.melanger([25, 50, 75, 100]).slice(0, conf.grands);
      const petits = Array.from({ length: conf.nb - conf.grands }, () => h(1, 10));
      const plaques = [...petits, ...grands];
      const f = fabriquer(plaques, conf.k, conf.min, conf.max);
      if (f) return { plaques, ...f };
    }
  }

  Gala.enregistrer({
    id: 'cible',
    nom: 'Atteindre la cible',
    icone: '🎯',
    domaine: 'logique',
    probleme: true,
    consigne: 'Obtiens le nombre cible avec les nombres proposés et + − × ÷. Touche un nombre, une opération, puis un autre nombre : le résultat remplace les deux. Chaque nombre sert une seule fois. Si tu n\'y arrives pas, garde le nombre le plus proche.',
    niveaux: 5,
    adaptatif: true,
    mesure: { unite: 'points', meilleur: 'haut' },

    demarrer(ctx) {
      Gala.outils.style('cible', `
        .cib-cible { font-size: 3rem; font-weight: 800; color: var(--accent); line-height: 1; }
        .cib-plaques, .cib-ops { display: flex; flex-wrap: wrap; gap: .5rem; justify-content: center; max-width: 30rem; }
        .cib-plaques button { min-width: 4.4rem; height: 4rem; font-size: 1.6rem; font-weight: 800; }
        .cib-plaques button.choisi { background: var(--accent); border-color: var(--accent); color: var(--accent-texte); }
        .cib-ops button { width: 3.6rem; height: 3.4rem; min-height: 0; font-size: 1.7rem; font-weight: 800; }
        .cib-ops button.choisi { background: var(--accent); border-color: var(--accent); color: var(--accent-texte); }
        .cib-calculs { min-height: 1.5em; font-size: 1.1rem; color: var(--discret); text-align: center; }
      `);
      const TIRAGES = 3;
      const zoneCible = document.createElement('div');
      zoneCible.className = 'cib-cible';
      const plaques = document.createElement('div');
      plaques.className = 'cib-plaques';
      const ops = document.createElement('div');
      ops.className = 'cib-ops';
      ops.innerHTML = ['+', '−', '×', '÷'].map(o => `<button data-o="${o}" aria-label="${{ '+': 'plus', '−': 'moins', '×': 'fois', '÷': 'divisé par' }[o]}">${o}</button>`).join('');
      const calculs = document.createElement('div');
      calculs.className = 'cib-calculs';
      const actions = document.createElement('div');
      actions.className = 'groupe';
      actions.innerHTML = '<button data-a="annuler">↶ Annuler</button><button data-a="garder">Je garde le plus proche</button>';
      ctx.zone.append(zoneCible, plaques, ops, calculs, actions);

      let numero = 0, points = 0, t = null, nombres = [], historique = [], sel = null, op = null, meilleur = null, bloque = false;
      const majStats = () => ctx.stats({ Tirage: Math.min(numero + 1, TIRAGES) + ' / ' + TIRAGES, Points: points });

      function suivant() {
        if (numero >= TIRAGES) {
          ctx.fin({ valeur: points, reussite: points / (10 * TIRAGES), reussi: points >= 5 * TIRAGES });
          return;
        }
        t = tirage(ctx.niveau);
        nombres = t.plaques.map((v, i) => ({ v, id: i }));
        historique = [];
        sel = op = null;
        meilleur = null;
        bloque = false;
        zoneCible.textContent = t.cible;
        ctx.message('');
        dessiner();
        majStats();
      }

      function dessiner() {
        plaques.innerHTML = nombres.map((n, i) => `<button data-i="${i}" class="${sel === i ? 'choisi' : ''}">${n.v}</button>`).join('');
        [...ops.children].forEach(b => b.classList.toggle('choisi', b.dataset.o === op));
        calculs.textContent = historique.map(x => x.texte).join('  ·  ');
        nombres.forEach(n => { if (meilleur == null || Math.abs(n.v - t.cible) < Math.abs(meilleur - t.cible)) meilleur = n.v; });
      }

      function conclure(valeur) {
        bloque = true;
        const ecart = Math.abs(valeur - t.cible);
        const gain = Math.max(0, 10 - 2 * ecart);
        points += gain;
        if (ecart === 0) { ctx.son('ok'); ctx.message('Le compte est juste ! +10 points'); }
        else {
          ctx.son(gain ? 'clic' : 'erreur');
          ctx.message(`${valeur}, à ${ecart} de la cible : +${gain} point${gain > 1 ? 's' : ''}. Une solution : ${t.solution.join(' ; ')}`);
        }
        majStats();
        numero++;
        const b = document.createElement('button');
        b.className = 'principal';
        b.textContent = numero < TIRAGES ? 'Tirage suivant →' : 'Voir le résultat';
        actions.replaceChildren(b);
        ctx.ecouter(b, 'click', () => {
          actions.innerHTML = '<button data-a="annuler">↶ Annuler</button><button data-a="garder">Je garde le plus proche</button>';
          suivant();
        });
      }

      ctx.ecouter(plaques, 'click', e => {
        const b = e.target.closest('button');
        if (!b || bloque) return;
        const i = Number(b.dataset.i);
        if (sel == null || op == null || i === sel) {
          sel = sel === i ? null : i;
          ctx.son('clic');
          dessiner();
          return;
        }
        const a = nombres[sel].v, c = nombres[i].v;
        let r;
        if (op === '+') r = a + c;
        else if (op === '×') r = a * c;
        else if (op === '−') r = a - c;
        else r = a / c;
        if (op === '−' && r <= 0) { ctx.son('erreur'); ctx.message('Le résultat doit rester positif : prends le plus grand en premier.'); return; }
        if (op === '÷' && !Number.isInteger(r)) { ctx.son('erreur'); ctx.message('La division doit tomber juste.'); return; }
        ctx.message('');
        historique.push({ texte: `${a} ${op} ${c} = ${r}`, avant: nombres.slice() });
        const nouveau = { v: r, id: 'r' + historique.length };
        nombres = nombres.filter((_, k) => k !== sel && k !== i);
        nombres.push(nouveau);
        sel = nombres.length - 1;
        op = null;
        ctx.son('clic');
        dessiner();
        if (r === t.cible) conclure(r);
      });

      ctx.ecouter(ops, 'click', e => {
        const b = e.target.closest('button');
        if (!b || bloque || sel == null) return;
        op = op === b.dataset.o ? null : b.dataset.o;
        dessiner();
      });

      ctx.ecouter(actions, 'click', e => {
        const b = e.target.closest('button');
        if (!b || bloque || !b.dataset.a) return;
        if (b.dataset.a === 'annuler') {
          const h = historique.pop();
          if (!h) return;
          nombres = h.avant;
          sel = op = null;
          dessiner();
        } else if (b.dataset.a === 'garder') {
          conclure(meilleur);
        }
      });

      suivant();
    }
  });
})();
