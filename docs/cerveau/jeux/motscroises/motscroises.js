/* Mots croisés — langage et vocabulaire.
   Petite grille générée à la volée à partir de donnees/motscroises-fr.js : 5 mots au niveau 1,
   9 mots au niveau 5, avec des mots de plus en plus rares. Sans chrono imposé.
   « Vérifier » montre les lettres fausses, « Une lettre » en dévoile une : chaque aide baisse un peu la réussite.
   La partie en cours est sauvegardée. */
(function () {
  const sansAccent = m => m.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/œ/gi, 'OE').toUpperCase();
  const MAX = 11; // taille maximale de la grille

  // Construit une grille : { mots: [{ mot, indice, r, c, sens }] } ou null.
  function construire(reserve, cible) {
    const cases = new Map(); // "r,c" -> { l, h, v }
    const mots = [];
    let rMin = 0, rMax = 0, cMin = 0, cMax = 0;
    const lire = (r, c) => cases.get(r + ',' + c);

    function essai(m, r, c, sens) {
      const dr = sens === 'v' ? 1 : 0, dc = sens === 'h' ? 1 : 0;
      if (lire(r - dr, c - dc) || lire(r + dr * m.length, c + dc * m.length)) return -1;
      let croise = 0;
      for (let k = 0; k < m.length; k++) {
        const y = r + dr * k, x = c + dc * k, cel = lire(y, x);
        if (cel) {
          if (cel.l !== m[k] || cel[sens]) return -1;
          croise++;
        } else if (lire(y + dc, x + dr) || lire(y - dc, x - dr)) return -1; // voisin collé sur le côté
      }
      const r2 = r + dr * (m.length - 1), c2 = c + dc * (m.length - 1);
      if (Math.max(rMax, r2) - Math.min(rMin, r) >= MAX || Math.max(cMax, c2) - Math.min(cMin, c) >= MAX) return -1;
      return croise;
    }

    function poser(entree, r, c, sens) {
      const m = entree.m, dr = sens === 'v' ? 1 : 0, dc = sens === 'h' ? 1 : 0;
      for (let k = 0; k < m.length; k++) {
        const y = r + dr * k, x = c + dc * k, cle = y + ',' + x;
        const cel = cases.get(cle) || { l: m[k] };
        cel[sens] = true;
        cases.set(cle, cel);
      }
      rMin = Math.min(rMin, r); cMin = Math.min(cMin, c);
      rMax = Math.max(rMax, r + dr * (m.length - 1)); cMax = Math.max(cMax, c + dc * (m.length - 1));
      mots.push({ mot: m, indice: entree.indice, r, c, sens });
    }

    const premier = reserve.find(e => e.m.length >= 5 && e.m.length <= 8);
    if (!premier) return null;
    poser(premier, 0, 0, Math.random() < 0.5 ? 'h' : 'v');
    const utilises = new Set([premier.m]);

    for (let tour = 0; tour < 3 && mots.length < cible; tour++) {
      for (const e of reserve) {
        if (mots.length >= cible) break;
        if (utilises.has(e.m)) continue;
        let meilleurs = [], top = 0;
        for (const [cle, cel] of cases) {
          const [y, x] = cle.split(',').map(Number);
          for (let k = 0; k < e.m.length; k++) {
            if (e.m[k] !== cel.l) continue;
            for (const sens of ['h', 'v']) {
              if (cel[sens]) continue;
              const r = sens === 'v' ? y - k : y, c = sens === 'h' ? x - k : x;
              const n = essai(e.m, r, c, sens);
              if (n > top) { top = n; meilleurs = []; }
              if (n === top && n > 0) meilleurs.push([r, c, sens]);
            }
          }
        }
        if (!meilleurs.length) continue;
        const [r, c, sens] = meilleurs[Math.floor(Math.random() * meilleurs.length)];
        poser(e, r, c, sens);
        utilises.add(e.m);
      }
    }
    if (mots.length < cible) return null;
    mots.forEach(m => { m.r -= rMin; m.c -= cMin; });
    const croisements = [...cases.values()].filter(c => c.h && c.v).length;
    return { mots, H: rMax - rMin + 1, W: cMax - cMin + 1, croisements };
  }

  function generer(niveau) {
    const CIBLE = [0, 5, 6, 7, 8, 9][niveau];
    const DIFF = { 1: [1], 2: [1, 2], 3: [2], 4: [2, 3], 5: [3, 2] }[niveau];
    const vus = new Set();
    const tous = Gala.donnees.motsCroises
      .map(([mot, indice, d]) => ({ m: sansAccent(mot), indice, d }))
      .filter(e => e.m.length >= 3 && /^[A-Z]+$/.test(e.m) && !vus.has(e.m) && vus.add(e.m));
    let meilleure = null;
    for (let n = 0; n < 40; n++) {
      // Surtout des mots de la difficulté du niveau, quelques-uns plus faciles pour amorcer.
      const principaux = Gala.outils.melanger(tous.filter(e => DIFF.includes(e.d)));
      const appoint = Gala.outils.melanger(tous.filter(e => !DIFF.includes(e.d) && e.d < Math.max(...DIFF)));
      const g = construire(principaux.concat(appoint.slice(0, 15)), CIBLE);
      if (g && (!meilleure || g.croisements > meilleure.croisements)) meilleure = g;
      if (meilleure && meilleure.croisements >= CIBLE) break;
    }
    return meilleure;
  }

  // Numéros des définitions, dans l'ordre de lecture.
  function numeroter(g) {
    const departs = [...new Set(g.mots.map(m => m.r * g.W + m.c))].sort((a, b) => a - b);
    g.mots.forEach(m => { m.num = departs.indexOf(m.r * g.W + m.c) + 1; });
    g.mots.sort((a, b) => a.num - b.num);
    return g;
  }

  Gala.motsCroises = { generer, construire, sansAccent }; // pour les tests

  Gala.enregistrer({
    id: 'motscroises',
    nom: 'Mots croisés',
    icone: '✏️',
    domaine: 'langage',
    consigne: 'Retrouve les mots à partir des définitions. Touche une case (deux fois pour changer de sens) ou une définition, puis tape les lettres. Les accents ne comptent pas.',
    niveaux: 5,
    adaptatif: true,
    mesure: { unite: 's', meilleur: 'bas' },

    demarrer(ctx) {
      Gala.outils.style('motscroises', `
        .mc-grille { display: grid; gap: 2px; width: min(94vw, var(--mc-l)); background: transparent; }
        .mc-grille > * { aspect-ratio: 1; min-width: 0; min-height: 0; }
        .mc-grille button { position: relative; padding: 0; border-radius: 4px; border: 2px solid var(--texte); background: var(--carte);
          font-size: var(--mc-t); font-weight: 700; color: var(--texte); text-transform: uppercase; }
        .mc-grille button .num { position: absolute; top: 1px; left: 3px; font-size: var(--mc-n); font-weight: 600; color: var(--discret); line-height: 1; }
        .mc-grille button.mot { background: color-mix(in srgb, var(--accent) 14%, var(--carte)); }
        .mc-grille button.choisie { background: color-mix(in srgb, var(--accent) 38%, var(--carte)); outline: none; }
        .mc-grille button.faux { color: var(--erreur); }
        .mc-grille button.donnee { color: var(--accent); }
        .mc-indice { width: min(94vw, 560px); min-height: 3.2em; padding: .5rem .8rem; border-radius: 12px; background: var(--carte-2);
          font-size: 1.1rem; font-weight: 600; text-align: center; display: flex; align-items: center; justify-content: center; }
        .mc-clavier { display: flex; flex-direction: column; gap: .3rem; width: min(98vw, 560px); }
        .mc-clavier div { display: flex; gap: .25rem; justify-content: center; }
        .mc-clavier button { flex: 1; min-width: 0; max-width: 3rem; min-height: 48px; padding: 0; font-size: 1.15rem; font-weight: 700; }
        .mc-clavier button.large { max-width: 4.5rem; flex: 1.5; }
        .mc-listes { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: .6rem 1.2rem; width: min(94vw, 640px); }
        .mc-listes h3 { font-size: 1rem; margin: 0 0 .3rem; }
        .mc-listes ol { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: .15rem; }
        .mc-listes li { padding: .3rem .5rem; border-radius: 8px; cursor: pointer; }
        .mc-listes li.actif { background: color-mix(in srgb, var(--accent) 18%, var(--carte)); }
        .mc-listes li.fini { color: var(--discret); text-decoration: line-through; }
      `);

      let p = ctx.etat.lire();
      if (!p || p.niveau !== ctx.niveau || !p.mots) {
        const g = numeroter(generer(ctx.niveau));
        p = { niveau: ctx.niveau, H: g.H, W: g.W, mots: g.mots, saisie: {}, donnees: {}, aides: 0, verifs: 0, secondes: 0 };
        ctx.etat.sauver(p);
      }
      const { H, W } = p;

      // Lettre attendue par case, et mots qui passent par chaque case.
      const sol = {}, motsDe = {};
      p.mots.forEach((m, k) => {
        for (let i = 0; i < m.mot.length; i++) {
          const idx = (m.r + (m.sens === 'v' ? i : 0)) * W + m.c + (m.sens === 'h' ? i : 0);
          sol[idx] = m.mot[i];
          (motsDe[idx] = motsDe[idx] || []).push(k);
        }
      });
      const casesDu = k => {
        const m = p.mots[k];
        return [...m.mot].map((_, i) => (m.r + (m.sens === 'v' ? i : 0)) * W + m.c + (m.sens === 'h' ? i : 0));
      };
      const numeros = {};
      p.mots.forEach(m => { numeros[m.r * W + m.c] = m.num; });

      const grille = document.createElement('div');
      grille.className = 'mc-grille';
      grille.style.gridTemplateColumns = `repeat(${W}, 1fr)`;
      grille.style.setProperty('--mc-l', Math.min(560, W * 52) + 'px');
      const t = Math.max(W, 6);
      grille.style.setProperty('--mc-t', `clamp(.9rem, ${(60 / t).toFixed(1)}vw, 1.6rem)`);
      grille.style.setProperty('--mc-n', `clamp(.5rem, ${(22 / t).toFixed(1)}vw, .75rem)`);
      const indice = document.createElement('div');
      indice.className = 'mc-indice';
      indice.setAttribute('aria-live', 'polite');
      const clavier = document.createElement('div');
      clavier.className = 'mc-clavier';
      clavier.innerHTML = ['AZERTYUIOP', 'QSDFGHJKLM', 'WXCVBN'].map((ligne, n) =>
        '<div>' + [...ligne].map(l => `<button data-l="${l}">${l}</button>`).join('') +
        (n === 2 ? '<button class="large" data-l="⌫" aria-label="Effacer">⌫</button>' : '') + '</div>').join('');
      const actions = document.createElement('div');
      actions.className = 'groupe';
      actions.innerHTML = '<button data-a="verifier">✔️ Vérifier</button><button data-a="lettre">💡 Une lettre</button><button data-a="solution">Voir la solution</button>';
      const listes = document.createElement('div');
      listes.className = 'mc-listes';
      ctx.zone.append(grille, indice, clavier, actions, listes);

      let motChoisi = 0, caseChoisie = casesDu(0)[0], finie = false, montrerFaux = false;
      const debut = performance.now() - p.secondes * 1000;
      const secondes = () => Math.round((performance.now() - debut) / 1000);
      ctx.repeter(5000, () => { if (!finie) { p.secondes = secondes(); ctx.etat.sauver(p); } });
      const motFini = k => casesDu(k).every(i => p.saisie[i] === sol[i]);

      function dessiner() {
        const dansMot = new Set(casesDu(motChoisi));
        let html = '';
        for (let i = 0; i < H * W; i++) {
          if (!sol[i]) { html += '<div></div>'; continue; }
          const v = p.saisie[i] || '', cls = [];
          if (i === caseChoisie && !finie) cls.push('choisie');
          else if (dansMot.has(i) && !finie) cls.push('mot');
          if (p.donnees[i]) cls.push('donnee');
          else if (montrerFaux && v && v !== sol[i]) cls.push('faux');
          const n = numeros[i] ? `<span class="num">${numeros[i]}</span>` : '';
          html += `<button data-i="${i}" class="${cls.join(' ')}" aria-label="case${numeros[i] ? ' ' + numeros[i] : ''}, ${v || 'vide'}">${n}${v}</button>`;
        }
        grille.innerHTML = html;
        const m = p.mots[motChoisi];
        indice.textContent = finie ? '' : `${m.num} ${m.sens === 'h' ? '→' : '↓'}  ${m.indice} (${m.mot.length} lettres)`;
        const liste = sens => p.mots.map((m, k) => m.sens !== sens ? '' :
          `<li data-k="${k}" class="${k === motChoisi ? 'actif' : ''} ${motFini(k) ? 'fini' : ''}"><b>${m.num}.</b> ${m.indice} (${m.mot.length})</li>`).join('');
        listes.innerHTML = `<div><h3>→ Horizontalement</h3><ol>${liste('h')}</ol></div><div><h3>↓ Verticalement</h3><ol>${liste('v')}</ol></div>`;
        const restantes = Object.keys(sol).filter(i => !p.saisie[i]).length;
        ctx.stats({ 'Mots trouvés': p.mots.filter((_, k) => motFini(k)).length + ' / ' + p.mots.length, 'Cases vides': restantes, Aides: p.aides });
      }

      function terminer(resolu) {
        finie = true;
        ctx.etat.effacer();
        actions.innerHTML = '';
        clavier.remove();
        if (!resolu) {
          Object.keys(sol).forEach(i => { p.saisie[i] = sol[i]; });
          dessiner();
          ctx.message('Voici la solution.');
          ctx.attendre(4000, () => ctx.fin({ valeur: null, reussite: 0, reussi: false }));
          return;
        }
        dessiner();
        ctx.son('fin');
        ctx.message('Grille terminée, bravo !');
        ctx.attendre(1500, () => ctx.fin({ valeur: secondes(), reussite: Math.max(0.2, 1 - 0.08 * p.aides - 0.04 * p.verifs), reussi: true }));
      }

      function choisirCase(i, basculer) {
        const ks = motsDe[i];
        if (basculer && i === caseChoisie && ks.length > 1) motChoisi = ks.find(k => k !== motChoisi);
        else if (!ks.includes(motChoisi)) motChoisi = ks[0];
        caseChoisie = i;
        dessiner();
      }

      function taper(l) {
        if (finie) return;
        const cs = casesDu(motChoisi), pos = cs.indexOf(caseChoisie);
        if (l === '⌫') {
          if (!p.saisie[caseChoisie] && pos > 0) caseChoisie = cs[pos - 1];
          if (!p.donnees[caseChoisie]) delete p.saisie[caseChoisie];
        } else {
          if (!p.donnees[caseChoisie]) p.saisie[caseChoisie] = l;
          ctx.son('clic');
          // Case suivante du mot ; à la fin du mot, on passe au mot suivant pas encore fini.
          const vide = cs.slice(pos + 1).find(i => !p.saisie[i]);
          if (vide != null) caseChoisie = vide;
          else if (pos < cs.length - 1) caseChoisie = cs[pos + 1];
          else if (cs.every(i => p.saisie[i])) {
            const k = p.mots.findIndex((_, k) => k !== motChoisi && casesDu(k).some(i => !p.saisie[i]));
            if (k >= 0) { motChoisi = k; caseChoisie = casesDu(k).find(i => !p.saisie[i]); }
          }
        }
        montrerFaux = false;
        ctx.etat.sauver(p);
        dessiner();
        if (Object.keys(sol).every(i => p.saisie[i] === sol[i])) terminer(true);
        else if (Object.keys(sol).every(i => p.saisie[i])) ctx.message('La grille est pleine mais il reste des erreurs. Touche « Vérifier ».');
      }

      ctx.ecouter(grille, 'click', e => {
        const b = e.target.closest('button');
        if (b && !finie) choisirCase(Number(b.dataset.i), true);
      });
      ctx.ecouter(listes, 'click', e => {
        const li = e.target.closest('li');
        if (!li || finie) return;
        motChoisi = Number(li.dataset.k);
        const cs = casesDu(motChoisi);
        caseChoisie = cs.find(i => !p.saisie[i]) ?? cs[0];
        dessiner();
      });
      ctx.ecouter(clavier, 'click', e => {
        const b = e.target.closest('button');
        if (b) taper(b.dataset.l);
      });
      ctx.ecouter(actions, 'click', e => {
        const b = e.target.closest('button');
        if (!b || finie) return;
        if (b.dataset.a === 'verifier') {
          const fausses = Object.keys(sol).filter(i => p.saisie[i] && p.saisie[i] !== sol[i]).length;
          if (fausses) { p.verifs++; ctx.son('erreur'); }
          montrerFaux = true;
          ctx.message(fausses ? `${fausses} lettre${fausses > 1 ? 's' : ''} fausse${fausses > 1 ? 's' : ''}, en rouge.` : 'Pas d\'erreur pour l\'instant.');
          ctx.etat.sauver(p);
          dessiner();
        } else if (b.dataset.a === 'lettre') {
          if (p.saisie[caseChoisie] === sol[caseChoisie]) {
            ctx.message('Cette case est déjà juste : choisis-en une autre.');
            return;
          }
          p.saisie[caseChoisie] = sol[caseChoisie];
          p.donnees[caseChoisie] = true;
          p.aides++;
          ctx.message('');
          ctx.etat.sauver(p);
          dessiner();
          if (Object.keys(sol).every(i => p.saisie[i] === sol[i])) terminer(true);
        } else if (b.dataset.a === 'solution') terminer(false);
      });
      ctx.ecouter(document, 'keydown', e => {
        if (e.ctrlKey || e.metaKey || e.altKey) return;
        if (/^[a-zA-Zàâäéèêëîïôöùûüç]$/.test(e.key)) { e.preventDefault(); taper(sansAccent(e.key)); }
        else if (e.key === 'Backspace' || e.key === 'Delete') { e.preventDefault(); taper('⌫'); }
        else if (e.key.startsWith('Arrow')) {
          e.preventDefault();
          const d = { ArrowUp: -W, ArrowDown: W, ArrowLeft: -1, ArrowRight: 1 }[e.key];
          let i = caseChoisie;
          for (let n = 0; n < H * W; n++) { i = (i + d + H * W) % (H * W); if (sol[i]) break; }
          choisirCase(i, false);
        }
      });

      dessiner();
      ctx.message('Touche une case ou une définition, puis tape les lettres.');
    }
  });
})();
