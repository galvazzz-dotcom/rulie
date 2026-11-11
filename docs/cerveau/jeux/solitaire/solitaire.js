/* Solitaire (Klondike) — réussite calme : pas de chrono, annulation illimitée, pioche sans limite.
   Toucher une carte la choisit, toucher une destination l'y pose ; toucher deux fois l'envoie au meilleur endroit. */
Gala.enregistrer({
  id: 'solitaire',
  nom: 'Solitaire',
  icone: '🂡',
  domaine: 'logique',
  consigne: 'Range toutes les cartes sur les 4 piles en haut à droite, de l\'as au roi par couleur. Dans les colonnes, pose une carte sur une carte de couleur opposée et d\'une valeur au-dessus. Touche une carte puis sa destination, ou touche-la deux fois. Niveau 1 : la pioche retourne 1 carte ; niveau 2 : 3 cartes.',
  detente: true, // jeu de détente : hors séance du jour
  niveaux: 2,
  mesure: { unite: 'coups', meilleur: 'bas' },

  demarrer(ctx) {
    const C = Gala.cartes;
    C.style();
    Gala.outils.style('solitaire', `
      .sol-haut { --gc-n: 7; }
      .sol-bas { --gc-n: 7; }
      .sol-defausse { grid-column: span 2; position: relative; height: calc(var(--gc-l) * 1.4); }
      .sol-defausse .gc-carte { position: absolute; top: 0; left: 0; }
      .sol-defausse .gc-pos1 { left: calc(var(--gc-l) * .4); }
      .sol-defausse .gc-pos2 { left: calc(var(--gc-l) * .8); }
      .sol-pioche .gc-dos { cursor: pointer; }
      .sol-pioche .gc-vide { font-size: calc(var(--gc-l) * .55); }
    `);
    const tirage = ctx.niveau >= 2 ? 3 : 1;

    const table = document.createElement('div');
    table.className = 'gc-table';
    const actions = document.createElement('div');
    actions.className = 'gc-actions';
    actions.innerHTML = '<button id="sol-annuler">↶ Annuler</button><button id="sol-ranger">⬆ Ranger</button><button id="sol-nouvelle">↻ Nouvelle donne</button>';
    ctx.zone.append(table, actions);
    const bAnnuler = actions.querySelector('#sol-annuler');

    let e, hist, choix, gagne;

    function donner() {
      const p = C.paquet();
      const t = [];
      for (let i = 0; i < 7; i++) {
        t.push(p.splice(0, i + 1));
        t[i][i].f = true;
      }
      return { pioche: p, defausse: [], f: [[], [], [], []], t, coups: 0 };
    }

    function initialiser(reprendre) {
      const sauve = reprendre && ctx.etat.lire();
      if (sauve && sauve.e && sauve.tirage === tirage) {
        e = sauve.e; hist = sauve.hist || [];
        ctx.message('Partie reprise là où tu l\'avais laissée');
      } else {
        e = donner(); hist = [];
        ctx.message('Prends ton temps. Touche la pioche pour retourner des cartes.');
      }
      choix = null; gagne = false;
      dessiner();
    }

    const pile = id => (id === 'pioche' ? e.pioche : id === 'defausse' ? e.defausse : id[0] === 'f' ? e.f[+id[1]] : e.t[+id[1]]);
    const rangees = () => e.f.reduce((s, f) => s + f.length, 0);

    // Les cartes qu'on déplacerait en prenant la carte i de la pile id (null si impossible).
    function prendre(id, i) {
      const p = pile(id);
      if (i < 0 || !p[i] || !p[i].f) return null;
      if (id[0] === 't') return p.slice(i);
      if ((id === 'defausse' || id[0] === 'f') && i === p.length - 1) return [p[i]];
      return null;
    }

    function possible(src, i, dest) {
      if (src === dest) return false;
      const cartes = prendre(src, i);
      if (!cartes) return false;
      const d = pile(dest);
      if (dest[0] === 'f') return cartes.length === 1 && C.surFondation(d, cartes[0]);
      if (dest[0] === 't') return d.length ? C.surColonne(d[d.length - 1], cartes[0]) : cartes[0].r === 13;
      return false;
    }

    function memoriser() {
      hist.push(C.copier(e));
      if (hist.length > 200) hist.shift();
    }

    function deplacer(src, i, dest) {
      memoriser();
      const cartes = pile(src).splice(i);
      pile(dest).push(...cartes);
      const reste = pile(src);
      if (src[0] === 't' && reste.length && !reste[reste.length - 1].f) reste[reste.length - 1].f = true;
      e.coups++;
      choix = null;
      ctx.son('clic');
      apres();
    }

    // Meilleure destination : fondation, puis une colonne non vide, puis une colonne vide.
    function meilleure(src, i) {
      const ids = ['f0', 'f1', 'f2', 'f3', 't0', 't1', 't2', 't3', 't4', 't5', 't6'];
      return ids.find(d => possible(src, i, d) && !(d[0] === 't' && !pile(d).length)) ||
        ids.find(d => possible(src, i, d) && !(src[0] === 't' && i === 0)) || null;
    }

    function piocher() {
      memoriser();
      if (!e.pioche.length) {
        if (!e.defausse.length) { hist.pop(); return; }
        e.pioche = e.defausse.reverse().map(c => ({ s: c.s, r: c.r, f: false }));
        e.defausse = [];
      } else {
        for (let k = 0; k < tirage && e.pioche.length; k++) {
          const c = e.pioche.pop();
          c.f = true;
          e.defausse.push(c);
        }
      }
      e.coups++;
      choix = null;
      ctx.son('clic');
      apres();
    }

    function ranger() {
      let n = 0, bouge = true;
      const avant = C.copier(e);
      while (bouge) {
        bouge = false;
        for (const src of ['defausse', 't0', 't1', 't2', 't3', 't4', 't5', 't6']) {
          const p = pile(src);
          if (!p.length) continue;
          const dest = ['f0', 'f1', 'f2', 'f3'].find(d => possible(src, p.length - 1, d));
          if (dest) {
            pile(dest).push(p.pop());
            if (src[0] === 't' && p.length && !p[p.length - 1].f) p[p.length - 1].f = true;
            e.coups++; n++; bouge = true;
          }
        }
      }
      choix = null;
      if (!n) { ctx.message('Aucune carte à ranger pour l\'instant'); dessiner(); return; }
      hist.push(avant);
      ctx.son('ok');
      apres();
    }

    function apres() {
      if (rangees() === 52) {
        gagne = true;
        ctx.etat.effacer();
        dessiner();
        ctx.message('🎉 Toutes les cartes sont rangées. Bravo !');
        ctx.attendre(900, () => ctx.fin({ valeur: e.coups, reussi: true }));
        return;
      }
      const toutVu = !e.pioche.length && !e.defausse.length && e.t.every(c => c.every(x => x.f));
      ctx.message(toutVu ? 'Tout est découvert : touche « Ranger » pour finir.' : '');
      ctx.etat.sauver({ e, hist: hist.slice(-50), tirage });
      dessiner();
    }

    function toucher(id, i) {
      if (gagne) return;
      if (id === 'pioche') { piocher(); return; }
      if (choix) {
        if (choix.p === id && (i === choix.i || (id === 'defausse' || id[0] === 'f'))) {
          const d = meilleure(choix.p, choix.i);
          if (d) deplacer(choix.p, choix.i, d);
          else { choix = null; ctx.message('Cette carte ne peut aller nulle part pour l\'instant'); dessiner(); }
          return;
        }
        if (possible(choix.p, choix.i, id)) { deplacer(choix.p, choix.i, id); return; }
      }
      if (i < 0) i = pile(id).length - 1;
      if (prendre(id, i)) {
        choix = { p: id, i };
        ctx.message('Touche une destination, ou la même carte pour la placer toute seule');
      } else {
        if (choix) ctx.message('Pas possible ici');
        choix = null;
      }
      dessiner();
    }

    function dessiner() {
      const cible = id => choix && possible(choix.p, choix.i, id);
      const sel = id => (choix && choix.p === id ? choix.i : -1);
      let h = '<div class="gc-rang sol-haut">';
      h += '<div class="sol-pioche">' + (e.pioche.length ? C.html(e.pioche[e.pioche.length - 1], 'pioche', 0) : C.vide('pioche', '↻')) + '</div>';
      const vis = e.defausse.slice(-(tirage === 3 ? 3 : 1));
      h += '<div class="sol-defausse">' + (vis.length
        ? vis.map((c, k) => {
          const i = e.defausse.length - vis.length + k;
          const cl = ['gc-pos' + k];
          if (sel('defausse') === i) cl.push('gc-choisie');
          return C.html(c, 'defausse', i, cl.join(' '));
        }).join('')
        : C.vide('defausse')) + '</div>';
      e.f.forEach((f, k) => {
        const id = 'f' + k;
        const cl = (cible(id) ? 'gc-cible ' : '') + (sel(id) >= 0 ? 'gc-choisie' : '');
        h += f.length ? C.html(f[f.length - 1], id, f.length - 1, cl) : C.vide(id, 'A').replace('gc-vide', 'gc-vide ' + cl);
      });
      h += '</div><div class="gc-rang sol-bas">';
      e.t.forEach((c, k) => { h += C.colonne(c, 't' + k, sel('t' + k), cible('t' + k)); });
      h += '</div>';
      table.innerHTML = h;
      bAnnuler.disabled = !hist.length;
      ctx.stats({ Coups: e.coups, Rangées: rangees() + ' / 52' });
    }

    C.ecouterTable(ctx, table, toucher);
    ctx.ecouter(bAnnuler, 'click', () => {
      if (!hist.length || gagne) return;
      e = hist.pop();
      choix = null;
      ctx.message('Coup annulé');
      ctx.etat.sauver({ e, hist: hist.slice(-50), tirage });
      dessiner();
    });
    ctx.ecouter(actions.querySelector('#sol-ranger'), 'click', () => { if (!gagne) ranger(); });
    ctx.ecouter(actions.querySelector('#sol-nouvelle'), 'click', () => {
      ctx.etat.effacer();
      initialiser(false);
    });
    initialiser(true);
  }
});
