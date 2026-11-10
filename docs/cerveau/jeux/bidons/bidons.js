/* Bidons — planification (section « Problèmes »).
   Avec des bidons sans graduation, obtenir exactement la quantité demandée dans l'un d'eux.
   On peut remplir un bidon au robinet, le vider, ou verser d'un bidon dans un autre
   (on verse jusqu'à ce que l'un soit vide ou l'autre plein). Aux niveaux 4 et 5, pas de robinet :
   il faut partager l'eau d'un grand bidon plein. 2 énigmes ; réussite = coups minimum / coups joués. */
(function () {
  function voisins(etat, caps, robinet) {
    const res = [];
    const n = caps.length;
    for (let i = 0; i < n; i++) {
      if (robinet && etat[i] < caps[i]) { const e = etat.slice(); e[i] = caps[i]; res.push(e); }
      if (robinet && etat[i] > 0) { const e = etat.slice(); e[i] = 0; res.push(e); }
      for (let j = 0; j < n; j++) {
        if (i === j || !etat[i] || etat[j] === caps[j]) continue;
        const q = Math.min(etat[i], caps[j] - etat[j]);
        const e = etat.slice(); e[i] -= q; e[j] += q; res.push(e);
      }
    }
    return res;
  }

  // Distance minimale (en coups) pour voir apparaître chaque quantité dans un bidon.
  function distances(depart, caps, robinet) {
    const vu = new Map([[depart.join(), 0]]);
    const file = [depart];
    const meilleur = {};
    while (file.length) {
      const e = file.shift();
      const d = vu.get(e.join());
      e.forEach(q => { if (q > 0 && meilleur[q] == null) meilleur[q] = d; });
      for (const v of voisins(e, caps, robinet)) if (!vu.has(v.join())) { vu.set(v.join(), d + 1); file.push(v); }
    }
    return meilleur;
  }

  function generer(n) {
    const conf = {
      1: { jarres: 2, robinet: true, min: 2, max: 4, caps: [[3, 5], [2, 5], [4, 7], [3, 7]] },
      2: { jarres: 2, robinet: true, min: 5, max: 7, caps: [[3, 5], [4, 9], [5, 7], [3, 8], [5, 8], [4, 11]] },
      3: { jarres: 2, robinet: true, min: 7, max: 12, caps: [[5, 9], [7, 11], [5, 13], [6, 11], [7, 9], [9, 13]] },
      4: { jarres: 3, robinet: false, min: 5, max: 8, caps: [[8, 5, 3], [10, 7, 3], [12, 7, 5], [10, 6, 4]] },
      5: { jarres: 3, robinet: false, min: 8, max: 16, caps: [[12, 7, 5], [14, 9, 5], [16, 11, 7], [13, 9, 4], [19, 13, 7]] }
    }[n];
    for (let essai = 0; essai < 200; essai++) {
      const caps = conf.caps[Math.floor(Math.random() * conf.caps.length)];
      const depart = conf.robinet ? caps.map(() => 0) : caps.map((c, i) => (i === 0 ? c : 0));
      const d = distances(depart, caps, conf.robinet);
      const cibles = Object.keys(d).map(Number).filter(q => d[q] >= conf.min && d[q] <= conf.max && !caps.includes(q));
      if (cibles.length) {
        const cible = cibles[Math.floor(Math.random() * cibles.length)];
        return { caps, depart, robinet: conf.robinet, cible, min: d[cible] };
      }
    }
    return null;
  }

  Gala.bidons = { generer, distances }; // pour les tests

  Gala.enregistrer({
    id: 'bidons',
    nom: 'Bidons',
    icone: '🪣',
    domaine: 'executif',
    probleme: true,
    consigne: 'Obtiens exactement la quantité d\'eau demandée dans un des bidons. Touche un bidon puis un autre pour verser le premier dans le second. Les bidons n\'ont pas de graduation : on verse jusqu\'à ce que le premier soit vide ou le second plein.',
    niveaux: 5,
    adaptatif: true,
    mesure: { unite: 'coups', meilleur: 'bas' },

    demarrer(ctx) {
      Gala.outils.style('bidons', `
        .bid-cible { font-size: 1.4rem; font-weight: 700; text-align: center; }
        .bid-cible b { color: var(--accent); font-size: 1.8rem; }
        .bid-rangee { display: flex; gap: 1rem; align-items: flex-end; justify-content: center; }
        .bid { display: flex; flex-direction: column; align-items: center; gap: .3rem; }
        .bid-cuve { width: 4.6rem; border: 3px solid var(--texte); border-top: none; border-radius: 0 0 12px 12px; position: relative;
          background: var(--carte); cursor: pointer; overflow: hidden; }
        .bid-cuve.choisi { outline: 4px solid var(--accent); outline-offset: 3px; }
        .bid-eau { position: absolute; left: 0; right: 0; bottom: 0; background: #4a9be8; transition: height .35s; }
        .bid-q { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; font-weight: 800;
          color: var(--texte); text-shadow: 0 0 3px var(--carte); }
        .bid small { color: var(--discret); font-weight: 600; }
        .bid .groupe button { min-height: 40px; padding: .2rem .5rem; font-size: .95rem; }
      `);
      const ENIGMES = 2;
      const titre = document.createElement('div');
      titre.className = 'bid-cible';
      const rangee = document.createElement('div');
      rangee.className = 'bid-rangee';
      const actions = document.createElement('div');
      actions.className = 'groupe';
      actions.innerHTML = '<button data-a="annuler">↶ Annuler</button><button data-a="recommencer">↺ Recommencer</button>';
      ctx.zone.append(titre, rangee, actions);

      let numero = 0, coupsTotal = 0, minTotal = 0, enigme = null, etat = [], pile = [], choisi = null, bloque = false;
      const majStats = () => ctx.stats({ Énigme: Math.min(numero + 1, ENIGMES) + ' / ' + ENIGMES, Coups: pile.length, Minimum: enigme ? enigme.min : '' });

      function nouvelle() {
        if (numero >= ENIGMES) {
          ctx.fin({ valeur: coupsTotal, reussite: Math.min(1, minTotal / Math.max(1, coupsTotal)), reussi: true });
          return;
        }
        enigme = generer(ctx.niveau);
        etat = enigme.depart.slice();
        pile = [];
        choisi = null;
        bloque = false;
        titre.innerHTML = `Obtiens exactement <b>${enigme.cible} litres</b> dans un bidon`;
        ctx.message(enigme.robinet ? 'Le robinet est à volonté : « Remplir » et « Vider » sous chaque bidon.' : `Pas de robinet : partage les ${enigme.caps[0]} litres du grand bidon.`);
        dessiner();
      }

      function dessiner() {
        const haut = 0.42 * 16; // px par litre, avec un minimum
        rangee.innerHTML = enigme.caps.map((c, i) => `
          <div class="bid">
            <div class="bid-cuve${choisi === i ? ' choisi' : ''}" data-i="${i}" style="height:${Math.max(70, c * 18)}px" aria-label="bidon de ${c} litres, ${etat[i]} litres dedans">
              <div class="bid-eau" style="height:${(etat[i] / c) * 100}%"></div><div class="bid-q">${etat[i]}</div>
            </div>
            <small>${c} L</small>
            ${enigme.robinet ? `<div class="groupe"><button data-r="${i}">Remplir</button><button data-v="${i}">Vider</button></div>` : ''}
          </div>`).join('');
        majStats();
      }

      function jouer(nouvelEtat) {
        if (nouvelEtat.join() === etat.join()) return;
        pile.push(etat);
        etat = nouvelEtat;
        choisi = null;
        ctx.son('clic');
        dessiner();
        if (etat.includes(enigme.cible)) {
          bloque = true;
          coupsTotal += pile.length;
          minTotal += enigme.min;
          ctx.son('ok');
          ctx.message(pile.length === enigme.min ? `Parfait, en ${pile.length} coups : le minimum !` : `Réussi en ${pile.length} coups (le minimum était ${enigme.min}).`);
          numero++;
          const b = document.createElement('button');
          b.className = 'principal';
          b.textContent = numero < ENIGMES ? 'Énigme suivante →' : 'Voir le résultat';
          ctx.ecouter(b, 'click', () => { b.remove(); nouvelle(); });
          actions.appendChild(b);
        }
      }

      ctx.ecouter(rangee, 'click', e => {
        if (bloque) return;
        const r = e.target.closest('[data-r]'), v = e.target.closest('[data-v]'), cuve = e.target.closest('.bid-cuve');
        if (r) { const n = etat.slice(); n[r.dataset.r] = enigme.caps[r.dataset.r]; return jouer(n); }
        if (v) { const n = etat.slice(); n[v.dataset.v] = 0; return jouer(n); }
        if (!cuve) return;
        const i = Number(cuve.dataset.i);
        if (choisi == null || choisi === i) {
          choisi = choisi === i ? null : i;
          if (choisi != null && !etat[i]) { choisi = null; ctx.message('Ce bidon est vide : choisis-en un qui contient de l\'eau.'); }
          dessiner();
          return;
        }
        const q = Math.min(etat[choisi], enigme.caps[i] - etat[i]);
        if (!q) { ctx.message('Impossible de verser : le bidon d\'arrivée est déjà plein.'); choisi = null; dessiner(); return; }
        const n = etat.slice();
        n[choisi] -= q; n[i] += q;
        ctx.message(`Versé : ${q} litre${q > 1 ? 's' : ''}.`);
        jouer(n);
      });

      ctx.ecouter(actions, 'click', e => {
        const b = e.target.closest('button');
        if (!b || bloque || !b.dataset.a) return;
        if (b.dataset.a === 'annuler' && pile.length) { etat = pile.pop(); choisi = null; dessiner(); }
        if (b.dataset.a === 'recommencer') { etat = enigme.depart.slice(); pile = []; choisi = null; dessiner(); }
      });

      nouvelle();
    }
  });
})();
