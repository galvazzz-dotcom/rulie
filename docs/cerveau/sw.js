/* Gala Cerveau — cache hors ligne de la version en ligne.
   Ignoré quand on ouvre index.html en fichier local. Portée limitée au dossier de l'application.
   Stratégie : on répond depuis le cache tout de suite, et on met le cache à jour en arrière-plan. */
const VERSION = 'gala-cerveau-v10';
const FICHIERS = [
  './', 'index.html', 'manifest.json',
  'noyau/interface.css', 'noyau/stockage.js', 'noyau/moteur.js', 'noyau/progression.js', 'noyau/app.js', 'noyau/quiz.js',
  'donnees/mots-fr.js', 'donnees/proverbes-fr.js', 'donnees/synonymes-fr.js', 'donnees/definitions-fr.js', 'donnees/etapes-fr.js', 'donnees/histoires-fr.js', 'donnees/tueur-grilles.js', 'donnees/motscroises-fr.js', 'donnees/culture-fr.js', 'donnees/geographie-fr.js',
  'jeux/paires/paires.js', 'jeux/simon/simon.js', 'jeux/empan/empan.js',
  'jeux/stroop/stroop.js', 'jeux/intrus/intrus.js',
  'jeux/calcul/calcul.js', 'jeux/pareil/pareil.js',
  'jeux/suites/suites.js', 'jeux/sudoku/sudoku.js',
  'jeux/anagrammes/anagrammes.js', 'jeux/proverbes/proverbes.js', 'jeux/rotation/rotation.js',
  'jeux/2048/2048.js', 'jeux/serpent/serpent.js', 'jeux/demineur/demineur.js', 'jeux/cartes/cartes.js', 'jeux/solitaire/solitaire.js', 'jeux/freecell/freecell.js',
  'jeux/objets/objets.js', 'jeux/barrage/barrage.js', 'jeux/compte/compte.js', 'jeux/reflexes/reflexes.js', 'jeux/code/code.js', 'jeux/hanoi/hanoi.js', 'jeux/mastermind/mastermind.js', 'jeux/synonymes/synonymes.js', 'jeux/motsmeles/motsmeles.js', 'jeux/regle/regle.js', 'jeux/monnaie/monnaie.js', 'jeux/labyrinthe/labyrinthe.js',
  'jeux/prenoms/prenoms.js', 'jeux/differences/differences.js', 'jeux/plusgrand/plusgrand.js', 'jeux/balance/balance.js', 'jeux/des/des.js', 'jeux/definitions/definitions.js', 'jeux/ordre/ordre.js',
  'jeux/deduction/deduction.js', 'jeux/enonces/enonces.js', 'jeux/cible/cible.js', 'jeux/nonogramme/nonogramme.js',
  'jeux/courses/courses.js', 'jeux/histoire/histoire.js', 'jeux/numeros/numeros.js', 'jeux/pesees/pesees.js', 'jeux/bidons/bidons.js', 'jeux/tueur/tueur.js',
  'jeux/culture/culture.js', 'jeux/geographie/geographie.js', 'jeux/motscroises/motscroises.js', 'jeux/kakuro/kakuro.js',
  'icones/icone-192.png', 'icones/icone-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FICHIERS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(cles => Promise.all(cles.filter(k => k.startsWith('gala-cerveau-') && k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || !req.url.startsWith(self.registration.scope)) return;
  e.respondWith(
    caches.open(VERSION).then(cache =>
      cache.match(req, { ignoreSearch: true }).then(enCache => {
        const reseau = fetch(req)
          .then(rep => {
            if (rep.ok) cache.put(req, rep.clone());
            return rep;
          })
          .catch(() => enCache);
        return enCache || reseau;
      })
    )
  );
});
