/* Dés et figures — raisonnement abstrait (domaine « Logique »).
   Inspiré des tests de raisonnement abstrait des sélections (Selor, Défense, police) :
   chaque face de dé applique un effet caché à une figure (couleur, forme, taille, ligne horizontale ou verticale…).
   On devine l'effet de chaque dé à partir des exemples, puis on l'applique à la tâche.
   Exercices tirés au hasard ; un exercice n'est gardé que si sa réponse est la seule possible
   d'après les exemples (vérifié en essayant toutes les règles imaginables). 6 questions, sans chrono. */
(function () {
  /* ---------- Figures ----------
     forme 0 carré, 1 cercle, 2 triangle · couleur 0 blanc, 1 gris, 2 noir · taille 0 petite, 1 grande
     traits : bit 1 = trait horizontal, bit 2 = trait vertical · point : 0 ou 1 (petit point à côté) */
  const code = f => f.forme * 48 + f.couleur * 16 + f.taille * 8 + f.traits * 2 + f.point;
  const copie = f => ({ forme: f.forme, couleur: f.couleur, taille: f.taille, traits: f.traits, point: f.point });

  /* ---------- Effets des dés ---------- */
  const EFFETS = {
    rien:      { attr: [],      texte: 'ne change rien', f: f => f },
    couleur:   { attr: ['couleur'], texte: 'inverse la couleur (blanc ↔ noir)', f: f => ({ ...f, couleur: 2 - f.couleur }) },
    couleur3:  { attr: ['couleur'], texte: 'fonce la couleur (blanc → gris → noir → blanc)', f: f => ({ ...f, couleur: (f.couleur + 1) % 3 }) },
    taille:    { attr: ['taille'],  texte: 'change la taille (grand ↔ petit)', f: f => ({ ...f, taille: 1 - f.taille }) },
    forme:     { attr: ['forme'],   texte: 'échange carré et cercle', f: f => ({ ...f, forme: f.forme === 2 ? 2 : 1 - f.forme }) },
    forme3:    { attr: ['forme'],   texte: 'change la forme (carré → cercle → triangle → carré)', f: f => ({ ...f, forme: (f.forme + 1) % 3 }) },
    tourner:   { attr: ['H', 'V'], texte: 'tourne d\'un quart de tour (ligne horizontale ↔ ligne verticale)', f: f => ({ ...f, traits: ((f.traits & 1) << 1) | ((f.traits & 2) >> 1) }) },
    traitH:    { attr: ['H'],     texte: 'ajoute ou enlève la ligne horizontale', f: f => ({ ...f, traits: f.traits ^ 1 }) },
    traitV:    { attr: ['V'],     texte: 'ajoute ou enlève la ligne verticale', f: f => ({ ...f, traits: f.traits ^ 2 }) },
    point:     { attr: ['point'],   texte: 'ajoute ou enlève le petit point', f: f => ({ ...f, point: 1 - f.point }) }
  };

  /* ---------- Réglages par niveau ---------- */
  /* Comme au Selor : 5 réponses au choix (A à E), et des effets sur la couleur, la forme, la taille
     et les lignes horizontale et verticale. Les niveaux 3 à 5 reprennent le format du test :
     3 exemples de 3 dés, puis la tâche. */
  const BASE = ['rien', 'couleur', 'taille', 'forme', 'traitH', 'traitV'];
  const NIVEAUX = [null,
    { des: 3, parLigne: 1, tache: 2, exemples: 3, choix: 5, effets: BASE, formes: 2, couleurs: [0, 2], point: false },
    { des: 4, parLigne: 2, exemples: 4, choix: 5, effets: BASE, formes: 2, couleurs: [0, 2], point: false },
    { des: 5, parLigne: 3, exemples: 3, choix: 5, effets: BASE, formes: 2, couleurs: [0, 2], point: false },
    { des: 6, parLigne: 3, exemples: 3, choix: 5, effets: BASE, formes: 2, couleurs: [0, 2], point: false },
    { des: 6, parLigne: 3, exemples: 3, choix: 5, effets: [...BASE, 'tourner'], formes: 2, couleurs: [0, 2], point: false }
  ];

  const hasard = n => Math.floor(Math.random() * n);
  const pioche = t => t[hasard(t.length)];
  const melanger = t => {
    const a = t.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = hasard(i + 1); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  };

  function figureAuHasard(N) {
    return { forme: hasard(N.formes), couleur: pioche(N.couleurs), taille: hasard(2), traits: hasard(4), point: N.point ? hasard(2) : 0 };
  }

  // Applique les dés de gauche à droite.
  const appliquer = (f, des, regle) => des.reduce((g, d) => EFFETS[regle[d]].f(g), f);

  /* Toutes les règles possibles (chaque dé = un effet de la liste du niveau, doublons permis)
     qui expliquent les exemples ; renvoie l'ensemble des résultats possibles pour la tâche. */
  function resultatsPossibles(N, faces, exemples, tache) {
    const ordre = faces.slice();
    const regle = {};
    const res = new Set();
    // Une ligne est vérifiée dès que tous ses dés ont reçu un effet.
    const lignesPretes = ordre.map((_, k) => exemples.filter(ex =>
      ex.des.every(d => ordre.indexOf(d) <= k) && ex.des.some(d => ordre.indexOf(d) === k)));
    (function essayer(k) {
      if (res.size > 1) return;
      if (k === ordre.length) { res.add(code(appliquer(tache.entree, tache.des, regle))); return; }
      for (const e of N.effets) {
        regle[ordre[k]] = e;
        if (lignesPretes[k].every(ex => code(appliquer(ex.entree, ex.des, regle)) === code(ex.sortie))) essayer(k + 1);
      }
    })(0);
    return res;
  }

  function nouvelExercice(niveau) {
    const N = NIVEAUX[niveau];
    for (let essai = 0; essai < 400; essai++) {
      // Dés utilisés et leurs effets (un effet par sorte de changement, au plus un « rien »).
      const faces = melanger([1, 2, 3, 4, 5, 6]).slice(0, N.des).sort((a, b) => a - b);
      const regle = {};
      const pris = new Set();
      let ok = true;
      for (const d of faces) {
        const libres = N.effets.filter(e => (e === 'rien' ? !pris.has('rien') : EFFETS[e].attr.every(a => !pris.has(a))));
        if (!libres.length) { ok = false; break; }
        const e = pioche(libres);
        regle[d] = e;
        (e === 'rien' ? ['rien'] : EFFETS[e].attr).forEach(a => pris.add(a));
      }
      if (!ok) continue;

      // Exemples : chaque dé apparaît au moins une fois.
      const exemples = [];
      for (let i = 0; i < N.exemples; i++) {
        const manquants = faces.filter(d => !exemples.some(ex => ex.des.includes(d)));
        const restants = melanger(faces.filter(d => !manquants.includes(d)));
        const des = melanger(manquants).slice(0, N.parLigne);
        while (des.length < N.parLigne) des.push(restants.pop());
        const entree = figureAuHasard(N);
        exemples.push({ entree, des, sortie: appliquer(entree, des, regle) });
      }
      if (faces.some(d => !exemples.some(ex => ex.des.includes(d)))) continue;
      const cles = exemples.map(ex => ex.des.slice().sort().join());
      if (new Set(cles).size < cles.length) continue;

      // Tâche : une combinaison de dés jamais vue telle quelle.
      let desTache;
      for (let t = 0; t < 20; t++) {
        const d = melanger(faces).slice(0, N.tache || N.parLigne);
        if (!cles.includes(d.slice().sort().join())) { desTache = d; break; }
      }
      if (!desTache) continue;
      const tache = { entree: figureAuHasard(N), des: desTache };
      const juste = appliquer(tache.entree, tache.des, regle);
      if (code(juste) === code(tache.entree)) continue; // la tâche doit changer quelque chose

      // La réponse doit être la seule possible d'après les exemples.
      const possibles = resultatsPossibles(N, faces, exemples, tache);
      if (possibles.size !== 1) continue;

      // Mauvaises réponses : erreurs plausibles (un dé oublié ou mal compris).
      const leurres = new Map();
      const ajouter = f => { const c = code(f); if (c !== code(juste) && !leurres.has(c)) leurres.set(c, f); };
      tache.des.forEach((d, i) => ajouter(appliquer(tache.entree, tache.des.filter((_, j) => j !== i), regle)));
      tache.des.forEach(d => N.effets.forEach(e => ajouter(appliquer(tache.entree, tache.des, { ...regle, [d]: e }))));
      ajouter(tache.entree);
      const choisis = melanger([...leurres.values()]);
      // Garder des leurres qui ressemblent à la bonne réponse : on préfère ceux qui en diffèrent peu.
      const ecart = f => ['forme', 'couleur', 'taille', 'traits', 'point'].filter(k => f[k] !== juste[k]).length;
      choisis.sort((a, b) => ecart(a) - ecart(b));
      // Au besoin, compléter par des figures qui ne diffèrent de la bonne réponse que d'un détail.
      const voisins = [f => ({ ...f, couleur: 2 - f.couleur }), f => ({ ...f, taille: 1 - f.taille }), f => ({ ...f, forme: 1 - f.forme }),
        f => ({ ...f, traits: f.traits ^ 1 }), f => ({ ...f, traits: f.traits ^ 2 }), f => ({ ...f, traits: f.traits ^ 3 })];
      for (const v of melanger(voisins)) {
        if (choisis.length >= N.choix - 1) break;
        const g = v(juste);
        if (code(g) !== code(juste) && !choisis.some(c => code(c) === code(g))) choisis.push(g);
      }
      if (choisis.length < N.choix - 1) continue;
      const propositions = melanger([juste, ...choisis.slice(0, N.choix - 1)]);
      return { faces, regle, exemples, tache, juste, propositions, bonne: propositions.indexOf(juste) };
    }
    return null;
  }

  /* ---------- Dessins ---------- */
  // Couleurs fixes (blanc, gris, noir) sur fond clair, même en thème sombre : « blanc » doit rester blanc.
  const ENCRE = '#1f2430', PAPIER = '#fbfaf7';
  const TEINTE = ['#ffffff', '#9aa0aa', ENCRE];
  let idClip = 0;
  function dessinFigure(f) {
    const r = f.taille ? 36 : 22, c = 50;
    const id = 'des-clip-' + (idClip++);
    let forme;
    if (f.forme === 0) forme = `<rect x="${c - r}" y="${c - r}" width="${2 * r}" height="${2 * r}"/>`;
    else if (f.forme === 1) forme = `<circle cx="${c}" cy="${c}" r="${r}"/>`;
    else {
      const h = r * 1.15;
      forme = `<polygon points="${c},${c - h} ${c + h},${c + h * 0.75} ${c - h},${c + h * 0.75}"/>`;
    }
    const trait = f.couleur === 2 ? '#ffffff' : ENCRE;
    const ty = f.forme === 2 ? c + r * 0.25 : c; // le trait couché du triangle passe à mi-hauteur
    let traits = '';
    if (f.traits & 1) traits += `<line x1="0" y1="${ty}" x2="100" y2="${ty}"/>`;
    if (f.traits & 2) traits += `<line x1="${c}" y1="0" x2="${c}" y2="100"/>`;
    const point = f.point ? `<circle cx="88" cy="12" r="7" fill="${ENCRE}"/>` : '';
    return `<svg viewBox="0 0 100 100" aria-hidden="true">
      <defs><clipPath id="${id}">${forme}</clipPath></defs>
      <g fill="${TEINTE[f.couleur]}" stroke="${ENCRE}" stroke-width="3">${forme}</g>
      <g stroke="${trait}" stroke-width="3" clip-path="url(#${id})">${traits}</g>
      ${point}</svg>`;
  }

  const POINTS = {
    1: [[50, 50]], 2: [[27, 27], [73, 73]], 3: [[25, 25], [50, 50], [75, 75]],
    4: [[27, 27], [73, 27], [27, 73], [73, 73]], 5: [[25, 25], [75, 25], [50, 50], [25, 75], [75, 75]],
    6: [[27, 22], [73, 22], [27, 50], [73, 50], [27, 78], [73, 78]]
  };
  const dessinDe = n => `<svg viewBox="0 0 100 100" class="des-de" role="img" aria-label="dé ${n}">
    <rect x="5" y="5" width="90" height="90" rx="12" fill="#ffffff" stroke="${ENCRE}" stroke-width="5"/>
    ${POINTS[n].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="9" fill="${ENCRE}"/>`).join('')}</svg>`;

  // Exposé pour les tests automatiques.
  Gala.desOutils = { nouvelExercice, resultatsPossibles, appliquer, code, NIVEAUX, EFFETS };

  Gala.enregistrer({
    id: 'des',
    nom: 'Dés et figures',
    icone: '🎲',
    domaine: 'logique',
    consigne: 'Chaque dé change la figure d\'une façon cachée (couleur, forme, taille, ligne horizontale ou verticale…). Les dés agissent de gauche à droite. Regarde les exemples pour deviner ce que fait chaque dé, puis choisis le bon résultat pour la tâche parmi les 5 réponses, comme au Selor. Il n\'y a pas de chrono.',
    niveaux: 5,
    adaptatif: true,
    mesure: { unite: 'bonnes réponses', meilleur: 'haut' },

    demarrer(ctx) {
      Gala.outils.style('des', `
        .des-jeu { width: min(96vw, 560px); display: grid; gap: .7rem; }
        .des-bloc { background: ${PAPIER}; color: ${ENCRE}; border: 2px solid var(--bord); border-radius: 14px; padding: .4rem .6rem; }
        .des-bloc h3 { font-size: .85rem; color: #5b6170; font-weight: 600; margin: .1rem 0 .2rem; }
        .des-ligne { display: grid; grid-template-columns: 3.4rem 1fr 3.4rem; align-items: center; gap: .4rem; padding: .25rem 0; }
        .des-ligne + .des-ligne { border-top: 1px dashed var(--bord); }
        .des-ligne > svg, .des-inconnu { width: 3.4rem; height: 3.4rem; display: block; }
        .des-inconnu { display: grid; place-items: center; font-size: 1.8rem; font-weight: 700; color: var(--accent);
          border: 2px dashed var(--accent); border-radius: 10px; }
        .des-rangee { display: flex; justify-content: center; align-items: center; gap: .3rem; }
        .des-rangee .des-de { width: 2rem; height: 2rem; }
        .des-rangee .fleche { color: #5b6170; font-size: 1.1rem; margin-left: .2rem; }
        .des-choix { display: grid; gap: .35rem; }
        .des-choix button { background: ${PAPIER}; color: ${ENCRE}; display: flex; flex-direction: column; align-items: center; padding: .25rem; min-height: 0; min-width: 0; }
        .des-choix button b { font-size: 1rem; }
        .des-choix button svg { width: 100%; max-width: 3.6rem; height: auto; aspect-ratio: 1; display: block; }
        .des-choix button.bon { border-color: var(--ok); border-width: 4px; }
        .des-choix button.faux { border-color: var(--erreur); border-width: 4px; }
        .des-explication { font-size: .95rem; }
        .des-explication ul { margin: .2rem 0 .4rem; padding-left: 0; list-style: none; }
        .des-explication li { display: flex; align-items: center; gap: .5rem; margin: .2rem 0; }
        .des-explication .des-de { width: 1.6rem; height: 1.6rem; flex: none; }
      `);
      const QUESTIONS = 6;
      const N = NIVEAUX[ctx.niveau];
      const LETTRES = 'ABCDE';

      const jeu = document.createElement('div');
      jeu.className = 'des-jeu';
      ctx.zone.appendChild(jeu);

      let numero = 0, bonnes = 0, ex = null, actif = false;
      const majStats = () => ctx.stats({ Question: Math.min(numero + 1, QUESTIONS) + ' / ' + QUESTIONS, Bonnes: bonnes });
      const rangee = des => `<div class="des-rangee">${des.map(dessinDe).join('')}<span class="fleche" aria-hidden="true">→</span></div>`;

      function suivante() {
        if (numero >= QUESTIONS) {
          ctx.fin({ valeur: bonnes, reussite: bonnes / QUESTIONS, reussi: bonnes >= QUESTIONS / 2 });
          return;
        }
        ex = nouvelExercice(ctx.niveau);
        jeu.innerHTML = `
          <div class="des-bloc"><h3>Exemples</h3>
            ${ex.exemples.map(e => `<div class="des-ligne">${dessinFigure(e.entree)}${rangee(e.des)}${dessinFigure(e.sortie)}</div>`).join('')}
          </div>
          <div class="des-bloc"><h3>Tâche</h3>
            <div class="des-ligne">${dessinFigure(ex.tache.entree)}${rangee(ex.tache.des)}<div class="des-inconnu">?</div></div>
          </div>
          <div class="des-choix" style="grid-template-columns: repeat(${N.choix}, 1fr)">
            ${ex.propositions.map((f, i) => `<button data-i="${i}" aria-label="Réponse ${LETTRES[i]}"><b>${LETTRES[i]}</b>${dessinFigure(f)}</button>`).join('')}
          </div>
          <div class="des-explication" aria-live="polite"></div>`;
        ctx.message('');
        majStats();
        actif = true;
      }

      function expliquer(bien) {
        const zone = jeu.querySelector('.des-explication');
        const utiles = ex.faces.filter(d => ex.tache.des.includes(d));
        zone.innerHTML = `<ul>${utiles.map(d => `<li>${dessinDe(d)}<span>${EFFETS[ex.regle[d]].texte}</span></li>`).join('')}</ul>`;
        const suite = document.createElement('button');
        suite.className = 'principal';
        suite.textContent = numero >= QUESTIONS ? 'Voir le résultat' : 'Question suivante →';
        suite.style.width = '100%';
        ctx.ecouter(suite, 'click', suivante);
        zone.appendChild(suite);
        if (!bien) suite.focus({ preventScroll: true });
        zone.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }

      ctx.ecouter(jeu, 'click', e => {
        const b = e.target.closest('.des-choix button');
        if (!b || !actif) return;
        actif = false;
        numero++;
        const i = Number(b.dataset.i);
        jeu.querySelector(`.des-choix [data-i="${ex.bonne}"]`).classList.add('bon');
        jeu.querySelector('.des-inconnu').outerHTML = dessinFigure(ex.juste);
        if (i === ex.bonne) {
          bonnes++;
          ctx.son('ok');
          ctx.message('✓ Bien vu ! Voici ce que font ces dés :');
        } else {
          b.classList.add('faux');
          ctx.son('erreur');
          ctx.message(`✗ C'était la réponse ${LETTRES[ex.bonne]}. Voici ce que font ces dés :`);
        }
        majStats();
        expliquer(i === ex.bonne);
      });
      ctx.ecouter(document, 'keydown', e => {
        const k = e.key.toUpperCase();
        const i = LETTRES.indexOf(k) >= 0 ? LETTRES.indexOf(k) : Number(e.key) - 1;
        if (actif && i >= 0 && i < N.choix) jeu.querySelector(`.des-choix [data-i="${i}"]`).click();
      });

      suivante();
    }
  });
})();
