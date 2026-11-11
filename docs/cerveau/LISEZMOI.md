# Gala Cerveau

Plateforme de jeux pour entraîner et entretenir le cerveau. Version : phase 10 (37 jeux d'entraînement, 8 problèmes longs, 5 jeux de détente, bilan de départ).

En ligne : https://galvazzz-dotcom.github.io/rulie/cerveau/

## Utiliser

- **En local :** ouvre `index.html` dans ton navigateur (double-clic). Pas d'Internet, pas d'installation.
- **En ligne :** dépose le dossier entier tel quel sur un hébergement statique (GitHub Pages, Netlify, Cloudflare Pages).
  En ligne, l'appli s'installe sur téléphone (« Ajouter à l'écran d'accueil ») et reste jouable sans réseau.

Les progrès sont gardés dans le navigateur utilisé. Pour changer d'appareil ou faire une copie de secours :
Réglages, puis « Exporter mes progrès » et « Importer un fichier ».

## Contenu

```
index.html             page unique de l'application
noyau/
  stockage.js          sauvegarde locale, export et import
  moteur.js            registre des jeux, contexte de partie, sons, voix
  progression.js       difficulté adaptative, série de jours, temps de jeu
  app.js               écrans : accueil, jeu, progrès, réglages
  quiz.js              moteur commun des quiz (Culture générale, Géographie)
  interface.css        thème clair/sombre, gros caractères
manifest.json, sw.js   installation sur téléphone et cache hors ligne (version en ligne seulement)
icones/                icônes de l'application
donnees/
  mots-fr.js           listes de mots (anagrammes, mots mêlés)
  proverbes-fr.js      proverbes à compléter
  synonymes-fr.js      synonymes et contraires
  definitions-fr.js    définitions (jeu Définitions)
  etapes-fr.js         étapes des tâches courantes (jeu Dans l'ordre)
  histoires-fr.js      petites histoires et leurs questions (jeu Histoire à retenir)
  tueur-grilles.js     grilles 9×9 de sudoku tueur préparées à l'avance
  motscroises-fr.js    mots et définitions des mots croisés
  culture-fr.js        questions de culture générale (dont beaucoup sur la Belgique)
  geographie-fr.js     provinces belges, pays et capitales, questions de géographie
jeux/
  paires/  simon/  empan/  objets/  prenoms/                    mémoire
  courses/  histoire/  numeros/                                 mémoire de la vie courante
  culture/  geographie/                                         mémoire des connaissances (quiz)
  stroop/  intrus/  barrage/  compte/  differences/               attention
  calcul/  pareil/  reflexes/  code/  plusgrand/                  vitesse
  suites/  sudoku/  hanoi/  mastermind/  balance/                 logique
  des/                                                          logique (raisonnement abstrait)
  anagrammes/  proverbes/  synonymes/  motsmeles/  definitions/   langage
  motscroises/                                                  langage
  rotation/  regle/  monnaie/  labyrinthe/  ordre/                organisation
  deduction/  enonces/  cible/  nonogramme/        problèmes (plus longs, hors séance)
  pesees/  bidons/  tueur/  kakuro/                problèmes (suite)
  2048/  serpent/  demineur/                       détente, repris de jeux-offline.html
  cartes/  solitaire/  freecell/                   détente, réussites (cartes.js : dessin des cartes partagé)
```

## Ajouter un jeu

1. Crée `jeux/mon-jeu/mon-jeu.js` sur ce modèle :

```js
Gala.enregistrer({
  id: 'mon-jeu',                 // unique, sans espace
  nom: 'Mon jeu',
  icone: '🧩',
  domaine: 'logique',            // memoire, attention, vitesse, logique, langage, executif
  consigne: 'Une ou deux phrases claires.',
  niveaux: 5,                    // 1 si le jeu n'a pas de niveaux
  adaptatif: true,               // le niveau suit la réussite du joueur
  mesure: { unite: 'points', meilleur: 'haut' },   // 'bas' si moins = mieux (temps, coups)

  demarrer(ctx) {
    // ctx.niveau        niveau choisi (1 à niveaux)
    // ctx.zone          élément où dessiner le jeu
    // ctx.stats({...})  petites cases de score en haut
    // ctx.message(txt)  ligne de message
    // ctx.son('ok' | 'erreur' | 'clic' | 'fin')
    // ctx.ecouter(el, 'click', fn), ctx.attendre(ms, fn), ctx.repeter(ms, fn)
    //                   retirés automatiquement quand on quitte le jeu
    // ctx.etat.lire() / sauver(v) / effacer()   reprise d'une partie interrompue
    // Fin de partie :
    // ctx.fin({ valeur: 42, reussite: 0.8, reussi: true })
    //   valeur   : le score (null si perdu, sans record)
    //   reussite : 0 à 1, obligatoire pour un jeu adaptatif
  }
});
```

2. Ajoute une ligne dans `index.html`, avant `noyau/app.js` :
   `<script src="jeux/mon-jeu/mon-jeu.js"></script>`
3. Ajoute le fichier à la liste `FICHIERS` de `sw.js` et change `VERSION` (par ex. `gala-cerveau-v10`),
   pour que la version en ligne le garde hors connexion.

Règles pour que tout marche aussi en local (`file://`) : pas de `import`/`export`, pas de `fetch`.
Les données (listes de mots…) se déclarent dans un fichier `.js`.

Un jeu marqué `detente: true` est rangé dans « Détente », un jeu marqué `probleme: true` dans « Problèmes » :
ni l'un ni l'autre n'entre dans la séance du jour, le bilan ou les courbes par domaine.

## Calcul éclair : avec ou sans chrono

Au début de chaque partie, on choisit « Avec chrono » (score en secondes, record, la vitesse compte
pour le niveau) ou « Sans chrono » (à son rythme, sans record ; seules les bonnes réponses comptent).
Le dernier choix est proposé par défaut.

## Séance du jour

Chaque jour, 4 jeux de domaines différents sont tirés, en priorité dans les domaines les moins
travaillés ces 7 derniers jours. On les enchaîne depuis la carte « Séance du jour » de l'accueil.

## Bilan de départ

Six jeux, un par domaine (empan, intrus, pareil, suites, proverbes, rotation), joués au niveau 2.
Le résultat règle le niveau de départ de tous les jeux du domaine pas encore joués :
85 % ou plus donne le niveau 3, 60 % ou plus le niveau 2, en dessous le niveau 1.
Proposé sur l'accueil tant qu'il n'est pas fini ; on peut le refaire depuis les Réglages.

## Difficulté adaptative

Un jeu adaptatif monte d'un niveau après 3 parties à 85 % de réussite ou plus, et redescend après
2 parties sous 60 %. Seules les parties jouées au niveau conseillé comptent.

## Dés et figures (raisonnement abstrait)

Le genre d'exercice des tests de sélection (Selor, Défense, police). Chaque face de dé applique un
effet caché à une figure : inverser la couleur, changer la taille, échanger carré et cercle, tourner,
ajouter ou enlever un trait, un petit point… Les dés agissent de gauche à droite. On devine l'effet de
chaque dé dans les exemples, puis on choisit le résultat de la tâche. Après chaque réponse, l'effet des
dés de la tâche est expliqué.

Les exercices sont tirés au hasard. Un exercice n'est gardé que si une seule réponse est possible :
le programme essaie toutes les règles qui collent aux exemples et vérifie qu'elles donnent toutes le
même résultat. Niveau 1 : 3 dés, un seul dé par exemple. Niveau 3 : 5 dés, 3 dés par ligne.
Niveaux 4 et 5 : gris, triangle, effets en cycle (blanc → gris → noir), 4 réponses au choix.
