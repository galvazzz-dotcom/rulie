/* Culture générale — mémoire des connaissances (histoire, sciences, nature, arts, vie courante, sport).
   10 questions, 3 réponses proposées au niveau 1 puis 4. Le niveau fait passer des questions
   les plus connues aux plus pointues. Sans chrono. Questions dans donnees/culture-fr.js. */
Gala.enregistrer({
  id: 'culture',
  nom: 'Culture générale',
  icone: '🎓',
  domaine: 'memoire',
  consigne: 'Dix questions de culture générale : choisis la bonne réponse. Prends ton temps, il n\'y a pas de chrono.',
  niveaux: 5,
  adaptatif: true,
  mesure: { unite: 'bonnes réponses', meilleur: 'haut' },

  demarrer(ctx) {
    const DIFF = { 1: [1], 2: [1, 2], 3: [2], 4: [2, 3], 5: [3] }[ctx.niveau];
    const questions = Gala.donnees.culture
      .filter(q => DIFF.includes(q[4]))
      .map(([theme, q, bonne, faux]) => ({ theme, q, bonne, faux }));
    Gala.quiz(ctx, 'culture', questions, { nombre: 10, choix: ctx.niveau === 1 ? 3 : 4 });
  }
});
