/* Géographie — mémoire des connaissances : France et monde, capitales, fleuves, montagnes.
   10 questions, 3 réponses proposées au niveau 1 puis 4. Une partie des questions est fabriquée
   à partir de la liste des pays et de leurs capitales. Sans chrono. Données dans donnees/geographie-fr.js. */
Gala.enregistrer({
  id: 'geographie',
  nom: 'Géographie',
  icone: '🌍',
  domaine: 'memoire',
  consigne: 'Dix questions de géographie, en France et dans le monde : choisis la bonne réponse. Pas de chrono.',
  niveaux: 5,
  adaptatif: true,
  mesure: { unite: 'bonnes réponses', meilleur: 'haut' },

  demarrer(ctx) {
    const DIFF = { 1: [1], 2: [1, 2], 3: [2], 4: [2, 3], 5: [3] }[ctx.niveau];
    const G = Gala.donnees.geographie;
    const M = Gala.majuscule;
    // « de » + article : du Japon, des Pays-Bas, de la France, de l'Inde, de Cuba.
    const de = pays => pays.replace(/^le /, 'du ').replace(/^les /, 'des ').replace(/^(la |l')/, 'de $1').replace(/^(?!du |des |de )/, 'de ');
    const questions = G.questions
      .filter(q => DIFF.includes(q[4]))
      .map(([theme, q, bonne, faux]) => ({ theme, q, bonne, faux }));

    // Questions de capitales. Les leurres viennent de préférence du même continent.
    const proches = p => {
      const memes = Gala.outils.melanger(G.pays.filter(x => x !== p && x[2] === p[2]));
      const autres = Gala.outils.melanger(G.pays.filter(x => x !== p && x[2] !== p[2]));
      return memes.concat(autres).slice(0, 3);
    };
    G.pays.filter(p => DIFF.includes(p[3])).forEach(p => {
      const [pays, capitale] = p;
      if (Math.random() < 0.6) {
        questions.push({ theme: 'Capitales', q: `Quelle est la capitale ${de(pays)} ?`, bonne: capitale, faux: proches(p).map(x => x[1]) });
      } else {
        questions.push({ theme: 'Capitales', q: `${capitale} est la capitale de quel pays ?`, bonne: M(pays), faux: proches(p).map(x => M(x[0])) });
      }
    });
    Gala.quiz(ctx, 'geographie', questions, { nombre: 10, choix: ctx.niveau === 1 ? 3 : 4 });
  }
});
