/* Rendre la monnaie — calcul pratique et planification (domaine « Organisation »).
   Un achat, un billet donné : compose la monnaie à rendre avec les pièces et billets.
   Niveau : euros ronds, puis centimes ; au niveau 5, avec le moins de pièces possible. 8 achats. */
Gala.enregistrer({
  id: 'monnaie',
  nom: 'Rendre la monnaie',
  icone: '💶',
  domaine: 'executif',
  consigne: 'Le client paie avec un billet. Touche les pièces et billets pour composer la monnaie exacte à lui rendre, puis « Rendre ». Au niveau 5, utilise le moins de pièces possible.',
  niveaux: 5,
  adaptatif: true,
  mesure: { unite: 'bonnes réponses', meilleur: 'haut' },

  demarrer(ctx) {
    Gala.outils.style('monnaie', `
      .mon-ticket { background: #fffdf5; color: #1f2430; border: 2px dashed #b9a97a; border-radius: 10px; padding: .6rem 1.2rem; font-size: 1.15rem;
        font-variant-numeric: tabular-nums; min-width: 16rem; }
      .mon-ticket div { display: flex; justify-content: space-between; gap: 1.5rem; }
      .mon-rendu { font-size: 1.3rem; font-weight: 700; font-variant-numeric: tabular-nums; min-height: 1.4em; }
      .mon-plateau { display: flex; flex-wrap: wrap; gap: .3rem; justify-content: center; min-height: 3.2rem; max-width: 30rem; }
      .mon-caisse { display: flex; flex-wrap: wrap; gap: .4rem; justify-content: center; max-width: 34rem; }
      .mon-caisse button, .mon-plateau span { font-weight: 800; font-variant-numeric: tabular-nums; }
      .mon-caisse button.piece, .mon-plateau span.piece { width: 3.3rem; height: 3.3rem; min-height: 0; border-radius: 50%; padding: 0; font-size: .95rem;
        background: #e8c766; border: 3px solid #b8932c; color: #3b2f0b; display: inline-flex; align-items: center; justify-content: center; }
      .mon-caisse button.piece.cuivre, .mon-plateau span.piece.cuivre { background: #d08a52; border-color: #9c5a2c; color: #fff; }
      .mon-caisse button.billet, .mon-plateau span.billet { width: 4.6rem; height: 2.8rem; min-height: 0; border-radius: 6px; padding: 0;
        background: #7fb48a; border: 2px solid #4c7f57; color: #10301a; display: inline-flex; align-items: center; justify-content: center; }
      .mon-plateau span { cursor: pointer; }
    `);
    const QUESTIONS = 8;
    const MINIMUM = ctx.niveau === 5;
    // Valeurs en centimes.
    const PIECES = {
      1: [100, 200, 500, 1000],
      2: [100, 200, 500, 1000, 2000],
      3: [10, 20, 50, 100, 200, 500, 1000],
      4: [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000],
      5: [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000]
    }[ctx.niveau];
    const euros = c => (c / 100).toFixed(2).replace('.', ',') + ' €';
    const libelle = c => (c >= 100 ? c / 100 + ' €' : c + ' c');

    function achat() {
      const h = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
      if (ctx.niveau === 1) return { prix: h(1, 18) * 100, paye: 2000 };
      if (ctx.niveau === 2) return { prix: h(5, 45) * 100, paye: 5000 };
      if (ctx.niveau === 3) { const prix = h(15, 190) * 10; return { prix, paye: prix < 1000 ? 1000 : 2000 }; }
      const prix = h(150, 4800);
      return { prix, paye: prix < 2000 ? 2000 : 5000 };
    }
    // Nombre minimal de pièces (le rendu glouton est optimal pour les euros).
    const minPieces = montant => {
      let n = 0;
      for (const v of PIECES.slice().sort((a, b) => b - a)) { n += Math.floor(montant / v); montant %= v; }
      return n;
    };

    const ticket = document.createElement('div');
    ticket.className = 'mon-ticket';
    const rendu = document.createElement('div');
    rendu.className = 'mon-rendu';
    const plateau = document.createElement('div');
    plateau.className = 'mon-plateau';
    plateau.setAttribute('aria-label', 'Monnaie préparée (touche une pièce pour la retirer)');
    const caisse = document.createElement('div');
    caisse.className = 'mon-caisse';
    caisse.innerHTML = PIECES.map(v => `<button data-v="${v}" class="${v >= 500 ? 'billet' : 'piece'}${v < 10 ? ' cuivre' : ''}">${libelle(v)}</button>`).join('');
    const actions = document.createElement('div');
    actions.className = 'groupe';
    actions.innerHTML = '<button data-a="effacer">↺ Tout reprendre</button><button data-a="rendre" class="principal">Rendre</button>';
    ctx.zone.append(ticket, rendu, plateau, caisse, actions);

    let numero = 0, bonnes = 0, courant = null, posees = [], actif = false;
    const majStats = () => ctx.stats({ Client: Math.min(numero + 1, QUESTIONS) + ' / ' + QUESTIONS, Bonnes: bonnes });
    const total = () => posees.reduce((a, b) => a + b, 0);

    function dessiner() {
      plateau.innerHTML = posees.map((v, k) => `<span data-k="${k}" class="${v >= 500 ? 'billet' : 'piece'}${v < 10 ? ' cuivre' : ''}">${libelle(v)}</span>`).join('');
      rendu.textContent = 'Tu rends : ' + euros(total());
    }

    function suivant() {
      if (numero >= QUESTIONS) {
        ctx.fin({ valeur: bonnes, reussite: bonnes / QUESTIONS, reussi: bonnes >= QUESTIONS / 2 });
        return;
      }
      courant = achat();
      posees = [];
      ticket.innerHTML = `<div><span>Achat</span><b>${euros(courant.prix)}</b></div><div><span>Le client donne</span><b>${euros(courant.paye)}</b></div>`;
      ctx.message('');
      dessiner();
      majStats();
      actif = true;
    }

    ctx.ecouter(caisse, 'click', e => {
      const b = e.target.closest('button');
      if (!b || !actif) return;
      posees.push(Number(b.dataset.v));
      posees.sort((a, c) => c - a);
      ctx.son('clic');
      dessiner();
    });
    ctx.ecouter(plateau, 'click', e => {
      const s = e.target.closest('span');
      if (!s || !actif) return;
      posees.splice(Number(s.dataset.k), 1);
      dessiner();
    });
    ctx.ecouter(actions, 'click', e => {
      const b = e.target.closest('button');
      if (!b || !actif) return;
      if (b.dataset.a === 'effacer') { posees = []; dessiner(); return; }
      const attendu = courant.paye - courant.prix;
      const montantJuste = total() === attendu;
      const assezCourt = !MINIMUM || posees.length === minPieces(attendu);
      actif = false;
      numero++;
      if (montantJuste && assezCourt) {
        bonnes++;
        ctx.son('ok');
        ctx.message('✓ Le compte est bon');
      } else {
        ctx.son('erreur');
        ctx.message(!montantJuste
          ? `✗ Il fallait rendre ${euros(attendu)}`
          : `✗ Bon montant, mais possible avec ${minPieces(attendu)} pièces et billets au lieu de ${posees.length}`);
      }
      majStats();
      ctx.attendre(montantJuste && assezCourt ? 900 : 2200, suivant);
    });

    suivant();
  }
});
