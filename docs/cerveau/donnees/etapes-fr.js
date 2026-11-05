/* Étapes de la vie courante : [titre, [étapes dans l'ordre]].
   Utilisées par le jeu « Dans l'ordre ». L'ordre de chaque liste doit être le seul possible,
   y compris quand le jeu n'en garde que quelques étapes.
   Déclarées en JavaScript (et non en JSON) pour fonctionner aussi en file://. */
window.Gala = window.Gala || {};
Gala.donnees = Gala.donnees || {};
Gala.donnees.etapes = [
  ['Faire un gâteau', ['Lire la recette', 'Sortir les ingrédients', 'Mélanger la pâte', 'Verser la pâte dans le moule', 'Faire cuire au four', 'Laisser refroidir avant de démouler']],
  ['Envoyer une lettre', ['Écrire la lettre', 'Plier la lettre', 'La glisser dans l\'enveloppe', 'Fermer l\'enveloppe', 'Coller le timbre', 'Poster la lettre dans la boîte']],
  ['Planter un arbre', ['Choisir l\'emplacement', 'Creuser un trou', 'Placer l\'arbre dans le trou', 'Reboucher avec la terre', 'Tasser la terre au pied', 'Arroser généreusement']],
  ['Prendre le train', ['Acheter son billet', 'Aller à la gare', 'Regarder le tableau des départs', 'Se rendre sur le quai', 'Monter dans le wagon', 'S\'asseoir à sa place']],
  ['Se laver les mains', ['Ouvrir le robinet', 'Mouiller ses mains', 'Prendre du savon', 'Frotter les mains', 'Rincer le savon', 'S\'essuyer avec une serviette']],
  ['Faire une omelette', ['Sortir les œufs du frigo', 'Casser les œufs dans un bol', 'Battre les œufs', 'Verser les œufs dans la poêle chaude', 'Plier l\'omelette', 'La servir dans l\'assiette']],
  ['Laver le linge', ['Trier le linge par couleur', 'Remplir la machine', 'Ajouter la lessive', 'Lancer le programme', 'Sortir le linge mouillé', 'Étendre le linge']],
  ['Préparer un café', ['Sortir le paquet de café', 'Mettre le café dans le filtre', 'Allumer la cafetière', 'Attendre que le café coule', 'Verser le café dans la tasse', 'Boire le café']],
  ['Aller chez le médecin', ['Appeler pour prendre rendez-vous', 'Se rendre au cabinet', 'Patienter dans la salle d\'attente', 'Être examiné', 'Recevoir l\'ordonnance', 'Aller chercher les médicaments']],
  ['Peindre un mur', ['Acheter la peinture', 'Ouvrir le pot', 'Remuer la peinture', 'Passer la première couche', 'Laisser sécher', 'Passer la deuxième couche']],
  ['Faire les courses', ['Regarder ce qui manque dans le frigo', 'Écrire la liste', 'Aller au magasin', 'Remplir le chariot', 'Payer à la caisse', 'Ranger les courses à la maison']],
  ['Cuire des pâtes', ['Remplir une casserole d\'eau', 'Porter l\'eau à ébullition', 'Plonger les pâtes', 'Attendre le temps de cuisson', 'Égoutter les pâtes', 'Ajouter la sauce']],
  ['Partir en voyage', ['Réserver l\'hôtel', 'Préparer la valise', 'Fermer la maison à clé', 'Partir à l\'aéroport', 'Enregistrer ses bagages', 'Embarquer dans l\'avion']],
  ['Changer une ampoule', ['Éteindre la lumière', 'Installer l\'escabeau', 'Monter sur l\'escabeau', 'Dévisser l\'ancienne ampoule', 'Visser la nouvelle', 'Rallumer pour vérifier']],
  ['Se préparer le matin', ['Se réveiller', 'Se lever', 'Prendre sa douche', 'S\'habiller', 'Prendre le petit-déjeuner', 'Partir de la maison']],
  ['Faire un semis', ['Remplir le pot de terreau', 'Faire un petit trou', 'Déposer la graine', 'Recouvrir de terre', 'Arroser', 'Voir la pousse sortir']],
  ['Recevoir des amis à dîner', ['Inviter les amis', 'Faire les courses', 'Cuisiner le repas', 'Accueillir les invités', 'Servir le repas', 'Faire la vaisselle']],
  ['Retirer de l\'argent', ['Aller au distributeur', 'Insérer la carte', 'Taper le code', 'Choisir le montant', 'Prendre les billets', 'Ranger son portefeuille']],
  ['Faire un feu de cheminée', ['Ouvrir le conduit', 'Disposer du papier journal', 'Ajouter du petit bois', 'Allumer le papier', 'Poser une bûche', 'Fermer la vitre du foyer']],
  ['Écrire un courriel', ['Allumer l\'ordinateur', 'Ouvrir sa messagerie', 'Cliquer sur « Nouveau message »', 'Rédiger le message', 'Relire le message', 'Cliquer sur « Envoyer »']],
  ['Faire une confiture', ['Laver les fruits', 'Couper les fruits', 'Ajouter le sucre', 'Faire cuire en remuant', 'Verser dans les pots', 'Fermer les pots']],
  ['Coudre un bouton', ['Choisir le fil', 'Enfiler l\'aiguille', 'Faire un nœud au bout du fil', 'Piquer l\'aiguille dans le tissu', 'Passer le fil dans les trous du bouton', 'Couper le fil']],
  ['Laver la voiture', ['Sortir le tuyau', 'Mouiller la carrosserie', 'Savonner avec l\'éponge', 'Rincer au jet', 'Sécher avec une peau de chamois', 'Ranger le tuyau']],
  ['Aller au cinéma', ['Choisir le film', 'Regarder l\'horaire de la séance', 'Acheter les places', 'Entrer dans la salle', 'Regarder le film', 'Sortir à la fin']],
  ['Faire un bouquet', ['Prendre un sécateur', 'Cueillir les fleurs', 'Rentrer à la maison', 'Couper les tiges en biais', 'Mettre les fleurs dans le vase', 'Poser le vase sur la table']],
  ['Préparer une salade', ['Laver la salade', 'Essorer les feuilles', 'Mettre la salade dans le saladier', 'Verser la vinaigrette', 'Mélanger', 'Servir à table']]
];
