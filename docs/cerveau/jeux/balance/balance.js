/* La balance — raisonnement déductif (inférence transitive).
   Quelques balances montrent quel objet pèse plus que l'autre ; on en déduit le plus lourd,
   le plus léger, ou au niveau 5 le deuxième plus lourd. 8 questions, sans chrono.
   Niveau : nombre d'objets (3 à 5) et type de question. */
Gala.enregistrer({
  id: 'balance',
  nom: 'La balance',
  icone: '⚖️',
  domaine: 'logique',
  consigne: 'Sur chaque balance, l\'objet le plus lourd fait descendre son plateau. Regarde toutes les balances et réponds à la question.',
  niveaux: 5,
  adaptatif: true,
  mesure: { unite: 'bonnes réponses', meilleur: 'haut' },

  demarrer(ctx) {
    Gala.outils.style('balance', `
      .bal-liste { display: flex; flex-wrap: wrap; gap: .6rem; justify-content: center; width: min(96vw, 620px); }
      .bal { background: var(--carte); border: 1px solid var(--bord); border-radius: 14px; padding: .4rem .6rem .5rem; width: 9.5rem; }
      .bal-plateaux { display: flex; justify-content: space-between; align-items: flex-start; height: 3.6rem; }
      .bal-plateaux span { font-size: 2.1rem; line-height: 1; transition: transform .2s; }
      .bal-plateaux span.bas { transform: translateY(1.3rem); }
      .bal-fleau { height: 5px; background: var(--discret); border-radius: 3px; margin: -.3rem .2rem 0; }
      .bal-pied { width: 0; height: 0; margin: 0 auto; border-left: 12px solid transparent; border-right: 12px solid transparent;
        border-bottom: 18px solid var(--discret); }
      .bal-question { font-size: 1.35rem; font-weight: 700; text-align: center; }
      .bal-choix { display: flex; flex-wrap: wrap; gap: .5rem; justify-content: center; }
      .bal-choix button { width: 4.6rem; height: 4.6rem; min-height: 0; padding: 0; font-size: 2.4rem; }
      .bal-choix button.bon { border-color: var(--ok); background: var(--ok); }
      .bal-choix button.faux { border-color: var(--erreur); background: var(--erreur); }
    `);
    const QUESTIONS = 8;
    const NB = [0, 3, 3, 4, 5, 5][ctx.niveau];
    const OBJETS = ['🍎', '🍐', '🍋', '🍉', '🍇', '🥕', '🧀', '🍞', '🎁', '📦', '🧸', '⚽', '🔔', '🕯️', '☕'];

    const liste = document.createElement('div');
    liste.className = 'bal-liste';
    const question = document.createElement('div');
    question.className = 'bal-question';
    const choix = document.createElement('div');
    choix.className = 'bal-choix';
    ctx.zone.append(liste, question, choix);

    let numero = 0, bonnes = 0, attendu = '', actif = false;
    const majStats = () => ctx.stats({ Question: Math.min(numero + 1, QUESTIONS) + ' / ' + QUESTIONS, Bonnes: bonnes });

    function suivante() {
      if (numero >= QUESTIONS) {
        ctx.fin({ valeur: bonnes, reussite: bonnes / QUESTIONS, reussi: bonnes >= QUESTIONS / 2 });
        return;
      }
      // ordre[0] est le plus lourd. On montre seulement les comparaisons entre voisins, mélangées.
      const ordre = Gala.outils.melanger(OBJETS).slice(0, NB);
      const balances = [];
      for (let k = 0; k < NB - 1; k++) {
        const lourd = ordre[k], leger = ordre[k + 1];
        balances.push(Math.random() < 0.5 ? [lourd, leger, 0] : [leger, lourd, 1]); // dernier : côté qui descend
      }
      const types = { 1: ['lourd'], 2: ['lourd', 'leger'], 3: ['lourd', 'leger'], 4: ['lourd', 'leger'], 5: ['deuxieme', 'avantdernier'] }[ctx.niveau];
      const type = types[Math.floor(Math.random() * types.length)];
      attendu = { lourd: ordre[0], leger: ordre[NB - 1], deuxieme: ordre[1], avantdernier: ordre[NB - 2] }[type];
      const texte = {
        lourd: 'Lequel est le plus <b>lourd</b> ?',
        leger: 'Lequel est le plus <b>léger</b> ?',
        deuxieme: 'Lequel est le <b>deuxième</b> plus lourd ?',
        avantdernier: 'Lequel est le <b>deuxième</b> plus léger ?'
      }[type];
      liste.innerHTML = Gala.outils.melanger(balances).map(([g, d, bas]) => `
        <div class="bal" aria-label="${bas === 0 ? g + ' plus lourd que ' + d : d + ' plus lourd que ' + g}">
          <div class="bal-plateaux"><span class="${bas === 0 ? 'bas' : ''}">${g}</span><span class="${bas === 1 ? 'bas' : ''}">${d}</span></div>
          <div class="bal-fleau" style="transform: rotate(${bas === 0 ? -12 : 12}deg)"></div>
          <div class="bal-pied"></div>
        </div>`).join('');
      question.innerHTML = texte;
      choix.innerHTML = Gala.outils.melanger(ordre).map(o => `<button data-o="${o}">${o}</button>`).join('');
      ctx.message('');
      majStats();
      actif = true;
    }

    ctx.ecouter(choix, 'click', e => {
      const b = e.target.closest('button');
      if (!b || !actif) return;
      actif = false;
      numero++;
      [...choix.children].find(x => x.dataset.o === attendu).classList.add('bon');
      const juste = b.dataset.o === attendu;
      if (juste) { bonnes++; ctx.son('ok'); } else { b.classList.add('faux'); ctx.son('erreur'); ctx.message('La bonne réponse est en vert'); }
      majStats();
      ctx.attendre(juste ? 900 : 2200, suivante);
    });

    suivante();
  }
});
