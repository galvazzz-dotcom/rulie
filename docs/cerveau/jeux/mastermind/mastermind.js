/* Code couleur (Mastermind) — raisonnement déductif.
   Trouve la combinaison secrète. Après chaque essai : ● = bonne couleur bien placée,
   ○ = bonne couleur mal placée. Niveau : nombre de cases et de couleurs. */
Gala.enregistrer({
  id: 'mastermind',
  nom: 'Code couleur',
  icone: '🎯',
  domaine: 'logique',
  consigne: 'Trouve la combinaison secrète de couleurs. Après chaque essai : ● noir = bonne couleur à la bonne place, ○ blanc = bonne couleur mais mal placée. Une couleur peut revenir plusieurs fois.',
  niveaux: 5,
  adaptatif: true,
  mesure: { unite: 'essais', meilleur: 'bas' },

  demarrer(ctx) {
    Gala.outils.style('mastermind', `
      .mm-essais { display: flex; flex-direction: column; gap: .35rem; width: min(94vw, 420px); }
      .mm-ligne { display: flex; align-items: center; gap: .4rem; background: var(--carte); border: 1px solid var(--bord); border-radius: 12px; padding: .35rem .6rem; }
      .mm-ligne.actuelle { border: 2px solid var(--accent); }
      .mm-ligne small { width: 1.6rem; color: var(--discret); }
      .mm-pion { width: 2.2rem; height: 2.2rem; border-radius: 50%; border: 2px solid var(--bord); background: var(--carte-2); flex: none; }
      .mm-ligne.actuelle .mm-pion { cursor: pointer; }
      .mm-indices { margin-left: auto; font-size: 1.1rem; letter-spacing: .1em; min-width: 5rem; text-align: right; }
      .mm-palette { display: flex; flex-wrap: wrap; gap: .4rem; justify-content: center; }
      .mm-palette button { width: 3rem; height: 3rem; min-height: 0; padding: 0; border-radius: 50%; }
    `);
    const CASES = [0, 3, 4, 4, 5, 5][ctx.niveau];
    const NB_COUL = [0, 4, 5, 6, 6, 7][ctx.niveau];
    const MAX_ESSAIS = [0, 8, 9, 10, 10, 10][ctx.niveau];
    const CIBLE = [0, 4, 5, 6, 6, 7][ctx.niveau]; // essais pour 100 %
    const COULEURS = [['#d0312d', 'rouge'], ['#1f5fc8', 'bleu'], ['#13a34a', 'vert'], ['#f2c200', 'jaune'], ['#7d3c98', 'violet'], ['#e67e22', 'orange'], ['#ff7eb6', 'rose']].slice(0, NB_COUL);
    const secret = Array.from({ length: CASES }, () => Math.floor(Math.random() * NB_COUL));

    const essaisZone = document.createElement('div');
    essaisZone.className = 'mm-essais';
    const palette = document.createElement('div');
    palette.className = 'mm-palette';
    palette.innerHTML = COULEURS.map(([c, n], i) => `<button data-c="${i}" style="background:${c};border-color:${c}" aria-label="${n}"></button>`).join('') +
      '<button data-c="eff" aria-label="Effacer">⌫</button>';
    const valider = document.createElement('button');
    valider.className = 'principal';
    valider.textContent = 'Valider l\'essai';
    ctx.zone.append(essaisZone, palette, valider);

    const historique = [];
    let saisie = [], finie = false;

    function indices(essai) {
      let noirs = 0;
      const restS = [], restE = [];
      essai.forEach((c, i) => (c === secret[i] ? noirs++ : (restS.push(secret[i]), restE.push(c))));
      let blancs = 0;
      restE.forEach(c => {
        const k = restS.indexOf(c);
        if (k >= 0) { blancs++; restS.splice(k, 1); }
      });
      return { noirs, blancs };
    }

    const pion = c => `<span class="mm-pion" style="${c == null ? '' : `background:${COULEURS[c][0]};border-color:${COULEURS[c][0]}`}"></span>`;

    function dessiner() {
      let html = historique.map((h, k) => `<div class="mm-ligne"><small>${k + 1}</small>${h.essai.map(pion).join('')}
        <span class="mm-indices" aria-label="${h.noirs} bien placés, ${h.blancs} mal placés">${'●'.repeat(h.noirs)}${'○'.repeat(h.blancs)}</span></div>`).join('');
      if (!finie) {
        html += `<div class="mm-ligne actuelle"><small>${historique.length + 1}</small>${Array.from({ length: CASES }, (_, i) => pion(saisie[i])).join('')}</div>`;
      }
      essaisZone.innerHTML = html;
      valider.disabled = saisie.length !== CASES || finie;
      ctx.stats({ Essai: Math.min(historique.length + 1, MAX_ESSAIS) + ' / ' + MAX_ESSAIS });
    }

    ctx.ecouter(palette, 'click', e => {
      const b = e.target.closest('button');
      if (!b || finie) return;
      if (b.dataset.c === 'eff') saisie.pop();
      else if (saisie.length < CASES) saisie.push(Number(b.dataset.c));
      ctx.son('clic');
      dessiner();
    });

    ctx.ecouter(valider, 'click', () => {
      if (saisie.length !== CASES || finie) return;
      const r = indices(saisie);
      historique.push({ essai: saisie, ...r });
      saisie = [];
      const n = historique.length;
      if (r.noirs === CASES) {
        finie = true;
        ctx.son('ok');
        ctx.message(`Trouvé en ${n} essai${n > 1 ? 's' : ''} !`);
        dessiner();
        ctx.fin({ valeur: n, reussite: Math.min(1, CIBLE / n), reussi: true });
      } else if (n >= MAX_ESSAIS) {
        finie = true;
        ctx.son('erreur');
        dessiner();
        essaisZone.insertAdjacentHTML('beforeend', `<div class="mm-ligne"><small>✗</small>${secret.map(pion).join('')}<span class="mm-indices">le code</span></div>`);
        ctx.message('Plus d\'essais : voici le code secret');
        ctx.fin({ valeur: null, reussite: 0.3, reussi: false });
      } else {
        ctx.son(r.noirs || r.blancs ? 'clic' : 'erreur');
        dessiner();
      }
    });

    dessiner();
  }
});
