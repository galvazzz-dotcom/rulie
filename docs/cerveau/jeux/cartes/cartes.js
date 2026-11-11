/* Gala Cerveau — outils partagés par les réussites (Solitaire, FreeCell).
   Cartes dessinées en HTML/CSS, aucune image à charger.
   Une carte : { s: couleur 0..3, r: valeur 1..13, f: true si face visible }. */
(function () {
  'use strict';
  const Gala = (window.Gala = window.Gala || {});

  const ENSEIGNES = ['♠', '♥', '♦', '♣'];
  const VALEURS = ['', 'A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'V', 'D', 'R'];
  const NOMS = ['', 'as', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'valet', 'dame', 'roi'];
  const NOMS_ENS = ['pique', 'cœur', 'carreau', 'trèfle'];

  const C = (Gala.cartes = {
    ENSEIGNES,
    rouge: c => c.s === 1 || c.s === 2,
    nom: c => NOMS[c.r] + ' de ' + NOMS_ENS[c.s],

    // 52 cartes mélangées, faces cachées.
    paquet() {
      const p = [];
      for (let s = 0; s < 4; s++) for (let r = 1; r <= 13; r++) p.push({ s, r, f: false });
      return Gala.outils.melanger(p);
    },

    // b peut se poser sur a dans une colonne : couleur alternée, une valeur de moins.
    surColonne: (a, b) => a.f && C.rouge(a) !== C.rouge(b) && b.r === a.r - 1,
    // c peut monter sur la pile de fondation f.
    surFondation: (f, c) => (f.length ? f[f.length - 1].s === c.s && c.r === f[f.length - 1].r + 1 : c.r === 1),

    // HTML d'une carte. attrs : data-* pour retrouver la pile, classes en plus.
    html(c, p, i, classes) {
      const cls = 'gc-carte' + (classes ? ' ' + classes : '');
      const data = `data-p="${p}" data-i="${i}"`;
      if (!c.f) return `<div class="${cls} gc-dos" ${data} aria-label="carte cachée"></div>`;
      const e = ENSEIGNES[c.s], v = VALEURS[c.r];
      const centre = c.r > 10 ? `<span class="gc-figure">${v}<small>${e}</small></span>` : `<span class="gc-centre">${e}</span>`;
      return `<div class="${cls}${C.rouge(c) ? ' gc-rouge' : ''}" ${data} role="button" tabindex="0" aria-label="${C.nom(c)}">` +
        `<span class="gc-coin"><b>${v}</b>${e}</span>${centre}</div>`;
    },
    // Emplacement vide (colonne, fondation, cellule).
    vide(p, texte) {
      return `<div class="gc-vide" data-p="${p}" data-i="-1" role="button" tabindex="0" aria-label="emplacement vide">${texte || ''}</div>`;
    },

    // Une colonne de cartes en cascade. selection = index de la première carte choisie ou -1.
    colonne(pile, p, selection, cible) {
      let h = `<div class="gc-col${cible ? ' gc-cible' : ''}" data-p="${p}" data-i="-1">`;
      if (!pile.length) h += C.vide(p);
      pile.forEach((c, i) => {
        const cl = [];
        if (i > 0) cl.push(pile[i - 1].f ? 'gc-apres-face' : 'gc-apres-dos');
        if (selection >= 0 && i >= selection) cl.push('gc-choisie');
        h += C.html(c, p, i, cl.join(' '));
      });
      return h + '</div>';
    },

    style() {
      Gala.outils.style('cartes', `
        .gc-table { width: min(100%, 640px); container-type: inline-size; user-select: none; -webkit-user-select: none; }
        .gc-rang { display: grid; gap: var(--gc-g, 6px); align-items: start; }
        .gc-rang + .gc-rang { margin-top: .8rem; }
        .gc-table .gc-rang { --gc-l: calc((100cqw - (var(--gc-n) - 1) * 6px) / var(--gc-n)); grid-template-columns: repeat(var(--gc-n), 1fr); }
        .gc-carte, .gc-vide { width: var(--gc-l); height: calc(var(--gc-l) * 1.4); border-radius: calc(var(--gc-l) * .1);
          position: relative; cursor: pointer; flex: none; }
        .gc-carte { background: #fffdf8; color: #1d2230; border: 1px solid #b9b2a3; box-shadow: 0 1px 2px rgba(0,0,0,.18);
          transition: transform .12s ease, box-shadow .12s ease; }
        .gc-rouge { color: #c23b2e; }
        .gc-coin { position: absolute; top: calc(var(--gc-l) * .05); left: calc(var(--gc-l) * .07);
          font-size: calc(var(--gc-l) * .3); line-height: 1; white-space: nowrap; letter-spacing: -.04em; }
        .gc-coin b { font-size: calc(var(--gc-l) * .36); margin-right: .06em; }
        .gc-centre { position: absolute; inset: 35% 0 0 0; display: flex; align-items: center; justify-content: center;
          font-size: calc(var(--gc-l) * .62); line-height: 1; }
        .gc-figure { position: absolute; left: 14%; right: 14%; top: 36%; bottom: 8%; display: flex; flex-direction: column;
          align-items: center; justify-content: center; border: 2px solid currentColor; border-radius: calc(var(--gc-l) * .08);
          font-weight: 800; font-size: calc(var(--gc-l) * .38); line-height: 1; background: rgba(214, 180, 90, .14); }
        .gc-figure small { font-size: calc(var(--gc-l) * .26); font-weight: 400; }
        .gc-dos { background: #2f7a52; border: 2px solid #f4efe2;
          background-image: radial-gradient(circle at 50% 50%, rgba(255,255,255,.22) 18%, transparent 19%),
            repeating-linear-gradient(45deg, rgba(255,255,255,.12) 0 4px, transparent 4px 9px);
          background-size: 40% 28%, auto; cursor: default; }
        .gc-vide { border: 2px dashed var(--bord); background: var(--carte-2); display: flex; align-items: center;
          justify-content: center; color: var(--discret); font-size: calc(var(--gc-l) * .4); }
        .gc-col { display: flex; flex-direction: column; min-height: calc(var(--gc-l) * 1.4); border-radius: calc(var(--gc-l) * .1); }
        .gc-apres-face { margin-top: calc(var(--gc-l) * -0.92); }
        .gc-apres-dos { margin-top: calc(var(--gc-l) * -1.18); }
        .gc-choisie { transform: translateY(-4px); box-shadow: 0 0 0 3px var(--accent), 0 4px 10px rgba(0,0,0,.25); z-index: 1; }
        .gc-cible > .gc-carte:last-child, .gc-cible.gc-carte, .gc-cible > .gc-vide, .gc-cible.gc-vide {
          box-shadow: 0 0 0 3px var(--ok); }
        .gc-actions { display: flex; flex-wrap: wrap; gap: .5rem; justify-content: center; }
        @media (prefers-reduced-motion: reduce) { .gc-carte { transition: none; } }
      `);
    },

    // Annuler : copies profondes de l'état, 200 au plus.
    copier: e => JSON.parse(JSON.stringify(e)),

    // Clic ou touche Entrée sur une carte / un emplacement : cb(pile, index).
    ecouterTable(ctx, el, cb) {
      const viser = cible => {
        const t = cible.closest('[data-p]');
        if (t && el.contains(t)) cb(t.dataset.p, Number(t.dataset.i));
      };
      ctx.ecouter(el, 'click', e => viser(e.target));
      ctx.ecouter(el, 'keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); viser(e.target); }
      });
    }
  });
})();
