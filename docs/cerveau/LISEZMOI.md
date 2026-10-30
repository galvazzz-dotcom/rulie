# Gala Cerveau

Plateforme de jeux pour entraîner et entretenir le cerveau. Version : phase 3 (24 jeux d'entraînement + 3 de détente, bilan de départ).

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
  interface.css        thème clair/sombre, gros caractères
manifest.json, sw.js   installation sur téléphone et cache hors ligne (version en ligne seulement)
icones/                icônes de l'application
donnees/
  mots-fr.js           listes de mots (anagrammes, mots mêlés)
  proverbes-fr.js      proverbes à compléter
  synonymes-fr.js      synonymes et contraires
jeux/
  paires/  simon/  empan/  objets/                 mémoire
  stroop/  intrus/  barrage/  compte/              attention
  calcul/  pareil/  reflexes/  code/               vitesse
  suites/  sudoku/  hanoi/  mastermind/            logique
  anagrammes/  proverbes/  synonymes/  motsmeles/  langage
  rotation/  regle/  monnaie/  labyrinthe/         organisation
  2048/  serpent/  demineur/                       détente, repris de jeux-offline.html
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
3. Ajoute le fichier à la liste `FICHIERS` de `sw.js` et change `VERSION` (par ex. `gala-cerveau-v4`),
   pour que la version en ligne le garde hors connexion.

Règles pour que tout marche aussi en local (`file://`) : pas de `import`/`export`, pas de `fetch`.
Les données (listes de mots…) se déclarent dans un fichier `.js`.

Un jeu marqué `detente: true` est rangé dans « Détente » et n'entre pas dans la séance du jour.

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
