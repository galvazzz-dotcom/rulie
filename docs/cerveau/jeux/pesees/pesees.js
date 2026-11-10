/* Pesées — trouver la fausse pièce avec une balance (section « Problèmes »).
   Une pièce est fausse : elle pèse plus lourd (ou, au niveau 5, on ne sait pas si elle est plus lourde
   ou plus légère). On a droit à un nombre limité de pesées. La balance est « maligne » : la fausse pièce
   n'est fixée qu'à la fin, en restant cohérente avec toutes les pesées. Impossible donc de gagner
   par chance : il faut une stratégie qui marche à coup sûr.
   Niveau : 3 pièces / 1 pesée, 9 / 2, 8 / 2, 27 / 3, 12 / 3 (lourde ou légère). 2 énigmes par partie. */
(function () {
  const CONF = { 1: [3, 1, false], 2: [9, 2, false], 3: [8, 2, false], 4: [27, 3, false], 5: [12, 3, true] };

  Gala.enregistrer({
    id: 'pesees',
    nom: 'Pesées',
    icone: '🪙',
    domaine: 'logique',
    probleme: true,
    consigne: 'Une des pièces est fausse. Pose des pièces sur les deux plateaux, puis « Peser » pour voir quel côté est le plus lourd. Avec le nombre de pesées permis, trouve la fausse pièce à coup sûr. Astuce : on n\'est pas obligé de peser toutes les pièces.',
    niveaux: 5,
    adaptatif: true,
    mesure: { unite: 'énigmes réussies', meilleur: 'haut' },

    demarrer(ctx) {
      Gala.outils.style('pesees', `
        .pes-pieces { display: flex; flex-wrap: wrap; gap: .35rem; justify-content: center; width: min(96vw, 620px); }
        .pes-pieces button { width: 3rem; height: 3rem; min-height: 0; padding: 0; border-radius: 50%; font-weight: 800; font-size: 1.05rem;
          background: #e8c14d; border: 3px solid #b8902a; color: #4a3a0a; }
        .pes-pieces button.g { box-shadow: 0 0 0 4px #1f5fc8; }
        .pes-pieces button.d { box-shadow: 0 0 0 4px #d0312d; }
        .pes-pieces button.ecartee { opacity: .35; }
        .pes-pieces button.choisie { outline: 4px solid var(--ok); outline-offset: 2px; }
        .pes-balance { display: flex; gap: .8rem; align-items: flex-end; justify-content: center; width: min(96vw, 560px); }
        .pes-plateau { flex: 1; min-height: 4.5rem; border-bottom: 5px solid var(--discret); display: flex; flex-wrap: wrap; gap: .2rem;
          align-content: flex-end; justify-content: center; padding: .2rem; transition: transform .3s; font-weight: 800; }
        .pes-plateau span { background: #e8c14d; border-radius: 50%; width: 1.9rem; height: 1.9rem; display: flex; align-items: center; justify-content: center; font-size: .8rem; color: #4a3a0a; }
        .pes-plateau.bas { transform: translateY(1rem); }
        .pes-plateau.haut { transform: translateY(-1rem); }
        .pes-pied { font-size: 2rem; }
        .pes-journal { width: min(96vw, 560px); font-size: 1.05rem; display: flex; flex-direction: column; gap: .2rem; }
        .pes-modes button.actif { background: var(--accent); border-color: var(--accent); color: var(--accent-texte); }
      `);
      const [NB, PESEES, DOUBLE] = CONF[ctx.niveau];
      const ENIGMES = 2;

      const modes = document.createElement('div');
      modes.className = 'groupe pes-modes';
      const pieces = document.createElement('div');
      pieces.className = 'pes-pieces';
      const balance = document.createElement('div');
      balance.className = 'pes-balance';
      balance.innerHTML = '<div class="pes-plateau" data-p="g"></div><div class="pes-pied">⚖️</div><div class="pes-plateau" data-p="d"></div>';
      const actions = document.createElement('div');
      actions.className = 'groupe';
      const journal = document.createElement('div');
      journal.className = 'pes-journal';
      ctx.zone.append(pieces, modes, balance, actions, journal);
      const [platG, platD] = balance.querySelectorAll('.pes-plateau');

      let numero = 0, reussies = 0, cotes = [], candidats = [], restantes = 0, mode = 'g', phase = 'peser', fini = false;
      const majStats = () => ctx.stats({ Énigme: Math.min(numero + 1, ENIGMES) + ' / ' + ENIGMES, 'Pesées restantes': restantes, Réussies: reussies });

      function nouvelle() {
        if (numero >= ENIGMES) {
          ctx.fin({ valeur: reussies, reussite: reussies / ENIGMES, reussi: reussies >= 1 });
          return;
        }
        cotes = Array(NB).fill('');
        // Candidats : [pièce, +1 plus lourde / −1 plus légère].
        candidats = [];
        for (let i = 0; i < NB; i++) { candidats.push([i, 1]); if (DOUBLE) candidats.push([i, -1]); }
        restantes = PESEES;
        phase = 'peser';
        mode = 'g';
        journal.innerHTML = '';
        ctx.message(`${NB} pièces, ${PESEES} pesée${PESEES > 1 ? 's' : ''}. La fausse est ${DOUBLE ? 'plus lourde OU plus légère : il faudra dire laquelle' : 'plus lourde'}.`);
        dessiner();
        majStats();
      }

      function dessiner() {
        pieces.innerHTML = cotes.map((c, i) => `<button data-i="${i}" class="${c}" aria-label="pièce ${i + 1}">${i + 1}</button>`).join('');
        platG.className = 'pes-plateau';
        platD.className = 'pes-plateau';
        platG.innerHTML = cotes.map((c, i) => (c === 'g' ? `<span>${i + 1}</span>` : '')).join('');
        platD.innerHTML = cotes.map((c, i) => (c === 'd' ? `<span>${i + 1}</span>` : '')).join('');
        if (phase === 'peser') {
          modes.innerHTML = `<button data-m="g" class="${mode === 'g' ? 'actif' : ''}" style="border-color:#1f5fc8">◀ Plateau gauche</button>
            <button data-m="d" class="${mode === 'd' ? 'actif' : ''}" style="border-color:#d0312d">Plateau droit ▶</button>`;
          actions.innerHTML = `<button class="principal" data-a="peser" ${restantes ? '' : 'disabled'}>⚖️ Peser</button><button data-a="vider">Vider la balance</button><button data-a="designer">J'ai trouvé →</button>`;
        }
      }

      function peser() {
        const g = cotes.map((c, i) => (c === 'g' ? i : -1)).filter(i => i >= 0);
        const d = cotes.map((c, i) => (c === 'd' ? i : -1)).filter(i => i >= 0);
        if (!g.length || !d.length) { ctx.message('Mets au moins une pièce sur chaque plateau.'); return; }
        if (g.length !== d.length) { ctx.message('Mets autant de pièces de chaque côté, sinon la pesée ne dit rien.'); return; }
        // La balance choisit le résultat qui laisse le plus de possibilités (à égalité : au hasard).
        const issue = ([p, s]) => (g.includes(p) ? (s > 0 ? 'g' : 'd') : d.includes(p) ? (s > 0 ? 'd' : 'g') : '=');
        const groupes = { g: [], d: [], '=': [] };
        candidats.forEach(c => groupes[issue(c)].push(c));
        const max = Math.max(...Object.values(groupes).map(x => x.length));
        const res = Gala.outils.melanger(Object.keys(groupes).filter(k => groupes[k].length === max))[0];
        candidats = groupes[res];
        restantes--;
        ctx.son('clic');
        const txt = res === '=' ? 'équilibre' : res === 'g' ? 'le plateau GAUCHE est plus lourd' : 'le plateau DROIT est plus lourd';
        journal.insertAdjacentHTML('beforeend', `<div>Pesée ${PESEES - restantes} : ${g.map(i => i + 1).join(', ')} contre ${d.map(i => i + 1).join(', ')} → <b>${txt}</b></div>`);
        dessiner();
        platG.classList.add(res === 'g' ? 'bas' : res === 'd' ? 'haut' : 'x');
        platD.classList.add(res === 'd' ? 'bas' : res === 'g' ? 'haut' : 'x');
        majStats();
        ctx.message(restantes ? 'Vide la balance ou déplace les pièces pour la pesée suivante.' : 'Plus de pesée : désigne la fausse pièce.');
      }

      function designer() {
        phase = 'designer';
        modes.innerHTML = '';
        actions.innerHTML = '<button data-a="retour">← Revenir aux pesées</button>';
        ctx.message('Touche la fausse pièce.');
      }

      function conclure(i, sens) {
        // Gagné seulement si la réponse est la SEULE encore possible.
        const ok = candidats.length === 1 && candidats[0][0] === i && (!DOUBLE || candidats[0][1] === sens);
        const vraie = ok ? candidats[0] : (candidats.find(c => c[0] !== i || (DOUBLE && c[1] !== sens)) || candidats[0]);
        if (ok) { reussies++; ctx.son('ok'); ctx.message(`Bravo, c'est bien la pièce ${i + 1}${DOUBLE ? (sens > 0 ? ', plus lourde' : ', plus légère') : ''} !`); }
        else {
          ctx.son('erreur');
          ctx.message(`Perdu : avec ces pesées, ce pouvait aussi être la pièce ${vraie[0] + 1}${DOUBLE ? (vraie[1] > 0 ? ' (plus lourde)' : ' (plus légère)') : ''}. Elle était fausse !`);
        }
        cotes = cotes.map(() => '');
        pieces.querySelectorAll('button').forEach(b => { b.disabled = true; });
        pieces.children[(ok ? i : vraie[0])].classList.add('choisie');
        numero++;
        majStats();
        actions.innerHTML = `<button class="principal" data-a="suite">${numero < ENIGMES ? 'Énigme suivante →' : 'Voir le résultat'}</button>`;
        phase = 'fini';
      }

      ctx.ecouter(pieces, 'click', e => {
        const b = e.target.closest('button');
        if (!b || b.disabled) return;
        const i = Number(b.dataset.i);
        if (phase === 'peser') {
          cotes[i] = cotes[i] === mode ? '' : mode;
          ctx.son('clic');
          dessiner();
        } else if (phase === 'designer') {
          if (!DOUBLE) return conclure(i, 1);
          actions.innerHTML = `<span>Pièce ${i + 1} :</span><button data-a="lourde" data-i="${i}">plus lourde</button><button data-a="legere" data-i="${i}">plus légère</button><button data-a="retour">← Retour</button>`;
        }
      });

      ctx.ecouter(modes, 'click', e => {
        const b = e.target.closest('button');
        if (!b) return;
        mode = b.dataset.m;
        dessiner();
      });

      ctx.ecouter(actions, 'click', e => {
        const b = e.target.closest('button');
        if (!b) return;
        const a = b.dataset.a;
        if (a === 'peser') peser();
        else if (a === 'vider') { cotes = cotes.map(() => ''); dessiner(); }
        else if (a === 'designer') designer();
        else if (a === 'retour') { phase = 'peser'; dessiner(); ctx.message(''); }
        else if (a === 'lourde' || a === 'legere') conclure(Number(b.dataset.i), a === 'lourde' ? 1 : -1);
        else if (a === 'suite') nouvelle();
      });

      nouvelle();
    }
  });
})();
