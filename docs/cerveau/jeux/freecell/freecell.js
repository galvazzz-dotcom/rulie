/* FreeCell — réussite où toutes les cartes sont visibles : on peut tout réfléchir à l'avance.
   Pas de chrono, annulation illimitée. Même maniement que le Solitaire. */
Gala.enregistrer({
  id: 'freecell',
  nom: 'FreeCell',
  icone: '🃏',
  domaine: 'logique',
  consigne: 'Range toutes les cartes sur les 4 piles en haut à droite, de l\'as au roi par couleur. Les 4 cases en haut à gauche gardent chacune une carte de côté. Dans les colonnes, pose une carte sur une carte de couleur opposée et d\'une valeur au-dessus. Touche une carte puis sa destination, ou touche-la deux fois.',
  detente: true, // jeu de détente : hors séance du jour
  niveaux: 1,
  mesure: { unite: 'coups', meilleur: 'bas' },

  demarrer(ctx) {
    const C = Gala.cartes;
    C.style();
    Gala.outils.style('freecell', `.fc-rang { --gc-n: 8; } .fc-sep { box-shadow: -6px 0 0 -3px var(--bord); }`);

    const table = document.createElement('div');
    table.className = 'gc-table';
    const actions = document.createElement('div');
    actions.className = 'gc-actions';
    actions.innerHTML = '<button id="fc-annuler">↶ Annuler</button><button id="fc-ranger">⬆ Ranger</button><button id="fc-nouvelle">↻ Nouvelle donne</button>';
    ctx.zone.append(table, actions);
    const bAnnuler = actions.querySelector('#fc-annuler');

    let e, hist, choix, gagne;

    function donner() {
      const p = C.paquet();
      p.forEach(c => { c.f = true; });
      const t = [[], [], [], [], [], [], [], []];
      p.forEach((c, i) => t[i % 8].push(c));
      return { c: [null, null, null, null], f: [[], [], [], []], t, coups: 0 };
    }

    function initialiser(reprendre) {
      const sauve = reprendre && ctx.etat.lire();
      if (sauve && sauve.e) {
        e = sauve.e; hist = sauve.hist || [];
        ctx.message('Partie reprise là où tu l\'avais laissée');
      } else {
        e = donner(); hist = [];
        ctx.message('Toutes les cartes sont visibles : prends le temps de regarder avant de jouer.');
      }
      choix = null; gagne = false;
      dessiner();
    }

    // Les cases libres sont des piles de 0 ou 1 carte, pour traiter tout pareil.
    const pile = id => (id[0] === 'c' ? (e.c[+id[1]] ? [e.c[+id[1]]] : []) : id[0] === 'f' ? e.f[+id[1]] : e.t[+id[1]]);
    const rangees = () => e.f.reduce((s, f) => s + f.length, 0);
    const casesLibres = () => e.c.filter(x => !x).length;
    const colonnesVides = () => e.t.filter(x => !x.length).length;

    // Une suite bien rangée (couleurs alternées, valeurs qui descendent) à partir de i.
    function prendre(id, i) {
      const p = pile(id);
      if (i < 0 || !p[i]) return null;
      if (id[0] !== 't') return i === p.length - 1 ? [p[i]] : null;
      for (let k = i + 1; k < p.length; k++) if (!C.surColonne(p[k - 1], p[k])) return null;
      return p.slice(i);
    }

    function possible(src, i, dest) {
      if (src === dest) return false;
      const cartes = prendre(src, i);
      if (!cartes) return false;
      const d = pile(dest);
      if (dest[0] === 'c') return cartes.length === 1 && !d.length;
      if (dest[0] === 'f') return cartes.length === 1 && C.surFondation(d, cartes[0]);
      // Nombre de cartes déplaçables d'un coup : (cases libres + 1) × 2 ^ colonnes vides (sans compter la destination).
      const vides = colonnesVides() - (d.length ? 0 : 1);
      if (cartes.length > (casesLibres() + 1) * Math.pow(2, vides)) return false;
      return d.length ? C.surColonne(d[d.length - 1], cartes[0]) : true;
    }

    function retirer(id, i) {
      if (id[0] === 'c') { const c = e.c[+id[1]]; e.c[+id[1]] = null; return [c]; }
      return pile(id).splice(i);
    }
    function poser(id, cartes) {
      if (id[0] === 'c') e.c[+id[1]] = cartes[0];
      else pile(id).push(...cartes);
    }

    function memoriser() {
      hist.push(C.copier(e));
      if (hist.length > 200) hist.shift();
    }

    function deplacer(src, i, dest) {
      memoriser();
      poser(dest, retirer(src, i));
      e.coups++;
      choix = null;
      ctx.son('clic');
      apres();
    }

    const TOUS = ['f0', 'f1', 'f2', 'f3', 't0', 't1', 't2', 't3', 't4', 't5', 't6', 't7', 'c0', 'c1', 'c2', 'c3'];
    // Meilleure destination : fondation, colonne non vide, colonne vide, puis case libre.
    function meilleure(src, i) {
      const ok = d => possible(src, i, d);
      return TOUS.find(d => d[0] !== 'c' && ok(d) && !(d[0] === 't' && !pile(d).length)) ||
        TOUS.find(d => d[0] === 't' && ok(d) && !(src[0] === 't' && i === 0)) ||
        (src[0] === 't' ? TOUS.find(d => d[0] === 'c' && ok(d)) : null) || null;
    }

    function ranger() {
      let n = 0, bouge = true;
      const avant = C.copier(e);
      while (bouge) {
        bouge = false;
        for (const src of ['c0', 'c1', 'c2', 'c3', 't0', 't1', 't2', 't3', 't4', 't5', 't6', 't7']) {
          const p = pile(src);
          if (!p.length) continue;
          const dest = ['f0', 'f1', 'f2', 'f3'].find(d => possible(src, p.length - 1, d));
          if (dest) { poser(dest, retirer(src, p.length - 1)); e.coups++; n++; bouge = true; }
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
      const enOrdre = e.t.every(col => col.every((c, k) => !k || col[k - 1].r > c.r));
      ctx.message(enOrdre ? 'Plus rien ne bloque : touche « Ranger » pour finir.' : '');
      ctx.etat.sauver({ e, hist: hist.slice(-50) });
      dessiner();
    }

    function toucher(id, i) {
      if (gagne) return;
      if (choix) {
        if (choix.p === id && (i === choix.i || id[0] !== 't')) {
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
        else if (id[0] === 't' && i >= 0) ctx.message('On ne déplace ensemble que des cartes déjà rangées en suite');
        choix = null;
      }
      dessiner();
    }

    function dessiner() {
      const cible = id => choix && possible(choix.p, choix.i, id);
      const sel = id => (choix && choix.p === id ? choix.i : -1);
      const unique = (id, carte, idx, vide) => {
        const cl = (cible(id) ? 'gc-cible ' : '') + (sel(id) >= 0 ? 'gc-choisie' : '');
        return carte ? C.html(carte, id, idx, cl) : C.vide(id, vide).replace('gc-vide', 'gc-vide ' + cl);
      };
      let h = '<div class="gc-rang fc-rang">';
      e.c.forEach((c, k) => { h += unique('c' + k, c, 0, ''); });
      e.f.forEach((f, k) => { h += '<div' + (k === 0 ? ' class="fc-sep"' : '') + '>' + unique('f' + k, f[f.length - 1], f.length - 1, 'A') + '</div>'; });
      h += '</div><div class="gc-rang fc-rang">';
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
      ctx.etat.sauver({ e, hist: hist.slice(-50) });
      dessiner();
    });
    ctx.ecouter(actions.querySelector('#fc-ranger'), 'click', () => { if (!gagne) ranger(); });
    ctx.ecouter(actions.querySelector('#fc-nouvelle'), 'click', () => {
      ctx.etat.effacer();
      initialiser(false);
    });
    initialiser(true);
  }
});
