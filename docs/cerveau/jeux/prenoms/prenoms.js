/* Visages et prénoms — mémoire associative.
   Des personnes s'affichent avec leur prénom ; ensuite on retrouve le prénom de chacune parmi 4.
   2 manches. Niveau : nombre de personnes à retenir (3 à 7) et prénoms qui se ressemblent au niveau 5. */
Gala.enregistrer({
  id: 'prenoms',
  nom: 'Visages et prénoms',
  icone: '🧑',
  domaine: 'memoire',
  consigne: 'Retiens le prénom de chaque personne. Quand elles réapparaissent une par une, choisis le bon prénom. Touche « J\'ai retenu » quand tu es prêt.',
  niveaux: 5,
  adaptatif: true,
  mesure: { unite: 'bonnes réponses', meilleur: 'haut' },

  demarrer(ctx) {
    Gala.outils.style('prenoms', `
      .pre-liste { display: grid; grid-template-columns: repeat(auto-fit, minmax(7.5rem, 1fr)); gap: .6rem; width: min(94vw, 560px); }
      .pre-carte { background: var(--carte); border: 1px solid var(--bord); border-radius: 14px; padding: .6rem; text-align: center; }
      .pre-carte .visage { font-size: 3rem; line-height: 1.1; }
      .pre-carte .nom { font-size: 1.25rem; font-weight: 800; }
      .pre-question { font-size: 5rem; line-height: 1.1; text-align: center; }
      .pre-choix { display: grid; grid-template-columns: 1fr 1fr; gap: .5rem; width: min(94vw, 460px); }
      .pre-choix button { min-height: 64px; font-size: 1.25rem; font-weight: 700; }
      .pre-choix button.bon { border-color: var(--ok); background: var(--ok); color: #fff; }
      .pre-choix button.faux { border-color: var(--erreur); background: var(--erreur); color: #fff; }
    `);
    const MANCHES = 2;
    const NB = [0, 3, 4, 5, 6, 7][ctx.niveau];
    const VUE = 4000 + NB * 3000;
    const VISAGES = {
      f: ['👵', '👩‍🦰', '👩‍🦳', '👱‍♀️', '👩‍🦱', '👮‍♀️', '👩‍⚕️', '👩‍🎨', '👩‍🔧', '👩‍🍳', '👩‍🌾', '🧕'],
      m: ['👴', '👨‍🦰', '👨‍🦳', '👱‍♂️', '🧔', '👨‍🦱', '👨‍🦲', '👷‍♂️', '👨‍🍳', '👨‍🌾', '👨‍🎨', '👨‍⚕️']
    };
    const PRENOMS = {
      f: ['Odette', 'Simone', 'Germaine', 'Paulette', 'Yvonne', 'Monique', 'Josette', 'Colette', 'Huguette', 'Ginette',
        'Lucie', 'Suzanne', 'Margot', 'Jeanne', 'Irène', 'Denise', 'Madeleine', 'Renée', 'Lucette', 'Pauline'],
      m: ['Marcel', 'Lucien', 'Albert', 'Henri', 'Robert', 'Gérard', 'Bernard', 'André', 'Fernand', 'Raymond',
        'Jacques', 'Émile', 'Victor', 'Léon', 'Gaston', 'Roger', 'Maurice', 'René', 'Gustave', 'Roland']
    };
    // Au niveau 5, deux prénoms proches dans la même manche pour corser l'affaire.
    const PROCHES = [['f', 'Lucie', 'Lucette'], ['f', 'Paulette', 'Pauline'], ['f', 'Renée', 'Irène'], ['f', 'Josette', 'Ginette'],
      ['m', 'Robert', 'Roger'], ['m', 'Lucien', 'Julien'], ['m', 'Gaston', 'Gustave'], ['m', 'Marcel', 'Maurice']];

    const zoneHaut = document.createElement('div');
    const choix = document.createElement('div');
    choix.className = 'pre-choix';
    const actions = document.createElement('div');
    actions.className = 'groupe';
    ctx.zone.append(zoneHaut, choix, actions);

    let manche = 0, bonnes = 0, personnes = [], demandes = [], actif = false, attente = null;
    const total = MANCHES * NB;
    const majStats = () => ctx.stats({ Manche: Math.min(manche + 1, MANCHES) + ' / ' + MANCHES, Bonnes: bonnes + ' / ' + total });

    function nouvelleManche() {
      if (manche >= MANCHES) {
        ctx.fin({ valeur: bonnes, reussite: bonnes / total, reussi: bonnes >= total / 2 });
        return;
      }
      majStats();
      // Chaque personne a un genre ; visage et prénom vont ensemble.
      const genres = Array.from({ length: NB }, () => (Math.random() < 0.5 ? 'f' : 'm'));
      const pioche = { f: Gala.outils.melanger(PRENOMS.f), m: Gala.outils.melanger(PRENOMS.m) };
      const faces = { f: Gala.outils.melanger(VISAGES.f), m: Gala.outils.melanger(VISAGES.m) };
      if (ctx.niveau >= 5) {
        const [g, a, b] = Gala.outils.melanger(PROCHES)[0];
        genres[0] = g; genres[1] = g;
        pioche[g] = [a, b, ...pioche[g].filter(n => n !== a && n !== b)];
      }
      personnes = Gala.outils.melanger(genres.map(g => ({ genre: g, visage: faces[g].shift(), nom: pioche[g].shift() })));
      zoneHaut.className = 'pre-liste';
      zoneHaut.innerHTML = personnes.map(p => `<div class="pre-carte"><div class="visage">${p.visage}</div><div class="nom">${p.nom}</div></div>`).join('');
      choix.innerHTML = '';
      actions.innerHTML = '<button class="principal" data-a="pret">J\'ai retenu</button>';
      ctx.message('Retiens bien les prénoms…');
      attente = ctx.attendre(VUE, commencerQuestions);
    }

    function commencerQuestions() {
      clearTimeout(attente);
      actions.innerHTML = '';
      demandes = Gala.outils.melanger(personnes);
      ctx.message('');
      demander();
    }

    function demander() {
      if (!demandes.length) {
        manche++;
        ctx.attendre(700, nouvelleManche);
        return;
      }
      const p = demandes[0];
      zoneHaut.className = 'pre-question';
      zoneHaut.textContent = p.visage;
      // Leurres du même genre : d'abord les autres prénoms de la manche, puis d'autres prénoms.
      const autres = Gala.outils.melanger(personnes.filter(x => x !== p && x.genre === p.genre).map(x => x.nom));
      const extra = Gala.outils.melanger(PRENOMS[p.genre].filter(n => !personnes.some(x => x.nom === n)));
      const leurres = [...autres, ...extra].slice(0, 3);
      choix.innerHTML = Gala.outils.melanger([p.nom, ...leurres]).map(n => `<button data-n="${n}">${n}</button>`).join('');
      actif = true;
    }

    ctx.ecouter(actions, 'click', e => {
      if (e.target.closest('[data-a="pret"]')) commencerQuestions();
    });

    ctx.ecouter(choix, 'click', e => {
      const b = e.target.closest('button');
      if (!b || !actif) return;
      actif = false;
      const p = demandes.shift();
      const juste = b.dataset.n === p.nom;
      [...choix.children].find(x => x.dataset.n === p.nom).classList.add('bon');
      if (juste) { bonnes++; ctx.son('ok'); } else { b.classList.add('faux'); ctx.son('erreur'); }
      majStats();
      ctx.attendre(juste ? 700 : 1500, demander);
    });

    nouvelleManche();
  }
});
