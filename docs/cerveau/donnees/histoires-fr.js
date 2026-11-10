/* Petites histoires à retenir : { titre, niveau 1 (court) à 3 (long et détaillé), texte, questions }.
   Chaque question : [question, bonne réponse, trois mauvaises réponses plausibles].
   Utilisées par le jeu « Histoire à retenir ». Déclarées en JavaScript (et non en JSON) pour fonctionner aussi en file://. */
window.Gala = window.Gala || {};
Gala.donnees = Gala.donnees || {};
Gala.donnees.histoires = [
  {
    titre: 'Au marché', niveau: 1,
    texte: 'Samedi matin, Monique est allée au marché avec son petit-fils Lucas. Elle a acheté un kilo de cerises et deux melons. Lucas a choisi un bouquet de tournesols pour sa maman. En rentrant, il a commencé à pleuvoir.',
    questions: [
      ['Quel jour Monique est-elle allée au marché ?', 'Samedi', 'Dimanche', 'Mercredi', 'Vendredi'],
      ['Qui l\'accompagnait ?', 'Son petit-fils', 'Sa sœur', 'Sa voisine', 'Son mari'],
      ['Quels fruits a-t-elle achetés ?', 'Des cerises et des melons', 'Des pommes et des poires', 'Des fraises et des melons', 'Des cerises et des pêches'],
      ['Quelles fleurs Lucas a-t-il choisies ?', 'Des tournesols', 'Des roses', 'Des tulipes', 'Des marguerites'],
      ['Que s\'est-il passé en rentrant ?', 'Il a commencé à pleuvoir', 'Ils ont perdu les clés', 'Ils ont croisé un ami', 'Le bus était en retard']
    ]
  },
  {
    titre: 'Le chat perdu', niveau: 1,
    texte: 'Hier soir, le chat de Bernard, un gros matou roux appelé Caramel, n\'est pas rentré. Bernard l\'a cherché dans tout le quartier avec une lampe de poche. Ce matin, la boulangère l\'a trouvé endormi dans sa réserve, sur un sac de farine.',
    questions: [
      ['Comment s\'appelle le chat ?', 'Caramel', 'Pompon', 'Biscuit', 'Moustache'],
      ['De quelle couleur est-il ?', 'Roux', 'Noir', 'Gris', 'Blanc'],
      ['Avec quoi Bernard l\'a-t-il cherché ?', 'Une lampe de poche', 'Une bougie', 'Ses jumelles', 'Une lanterne'],
      ['Qui a trouvé le chat ?', 'La boulangère', 'Le facteur', 'La voisine', 'Le pharmacien'],
      ['Où dormait-il ?', 'Sur un sac de farine', 'Dans un carton', 'Sous un banc', 'Dans une voiture']
    ]
  },
  {
    titre: 'Le pique-nique', niveau: 1,
    texte: 'Dimanche, la famille Martin a pique-niqué au bord du lac. Papa avait préparé des sandwichs au jambon, et la grand-mère une tarte aux abricots. Les enfants ont fait voler un cerf-volant rouge. Vers quatre heures, un orage les a obligés à rentrer.',
    questions: [
      ['Où la famille a-t-elle pique-niqué ?', 'Au bord du lac', 'Dans la forêt', 'À la plage', 'Dans un parc'],
      ['Qu\'avait préparé le papa ?', 'Des sandwichs au jambon', 'Une salade de riz', 'Des œufs durs', 'Une quiche'],
      ['Quelle tarte la grand-mère avait-elle faite ?', 'Aux abricots', 'Aux pommes', 'Aux fraises', 'Au citron'],
      ['De quelle couleur était le cerf-volant ?', 'Rouge', 'Bleu', 'Jaune', 'Vert'],
      ['Pourquoi sont-ils rentrés ?', 'À cause d\'un orage', 'Il faisait trop chaud', 'Un enfant était malade', 'Il était trop tard']
    ]
  },
  {
    titre: 'Le colis', niveau: 1,
    texte: 'Mardi, le facteur a sonné chez Paulette pour lui remettre un colis. C\'était un cadeau de sa fille qui vit à Lyon : une écharpe bleue et une boîte de chocolats. Paulette a aussitôt téléphoné pour la remercier.',
    questions: [
      ['Quel jour le colis est-il arrivé ?', 'Mardi', 'Lundi', 'Jeudi', 'Samedi'],
      ['Qui a envoyé le colis ?', 'Sa fille', 'Son fils', 'Sa sœur', 'Une amie'],
      ['Dans quelle ville vit l\'expéditrice ?', 'Lyon', 'Marseille', 'Lille', 'Bordeaux'],
      ['Que contenait le colis ?', 'Une écharpe et des chocolats', 'Un livre et des biscuits', 'Des gants et du thé', 'Une photo et des fleurs'],
      ['De quelle couleur était l\'écharpe ?', 'Bleue', 'Rouge', 'Verte', 'Grise']
    ]
  },
  {
    titre: 'La panne', niveau: 1,
    texte: 'En allant chez le médecin, la voiture de Gérard est tombée en panne près de l\'église. Un jeune homme à vélo s\'est arrêté pour l\'aider. Il a appelé son oncle, qui est garagiste. Gérard est arrivé avec une demi-heure de retard.',
    questions: [
      ['Où allait Gérard ?', 'Chez le médecin', 'À la banque', 'Au supermarché', 'Chez le coiffeur'],
      ['Où la voiture est-elle tombée en panne ?', 'Près de l\'église', 'Devant la mairie', 'Sur l\'autoroute', 'Au rond-point'],
      ['Qui s\'est arrêté pour l\'aider ?', 'Un jeune homme à vélo', 'Un policier', 'Une voisine', 'Un chauffeur de bus'],
      ['Quel est le métier de l\'oncle ?', 'Garagiste', 'Boulanger', 'Pompier', 'Plombier'],
      ['Combien de retard Gérard a-t-il eu ?', 'Une demi-heure', 'Dix minutes', 'Une heure', 'Deux heures']
    ]
  },
  {
    titre: 'Le voyage en train', niveau: 2,
    texte: 'Le 12 juin, Colette a pris le train de 8 h 40 pour rendre visite à son frère Henri, à Bordeaux. Dans le wagon, elle a discuté avec une dame qui tricotait un pull vert pour son petit-fils. Le train a eu vingt minutes de retard à cause d\'un arbre tombé sur la voie. Henri l\'attendait sur le quai avec un parapluie, car il pleuvait à verse.',
    questions: [
      ['À quelle heure partait le train ?', '8 h 40', '7 h 15', '9 h 30', '10 h 40'],
      ['Comment s\'appelle le frère de Colette ?', 'Henri', 'Robert', 'Marcel', 'Louis'],
      ['Dans quelle ville habite-t-il ?', 'Bordeaux', 'Toulouse', 'Nantes', 'Lyon'],
      ['Que tricotait la dame du wagon ?', 'Un pull vert', 'Une écharpe rouge', 'Des chaussettes', 'Un bonnet bleu'],
      ['Pourquoi le train était-il en retard ?', 'Un arbre sur la voie', 'Une grève', 'Une panne électrique', 'Un passager malade'],
      ['Que tenait Henri sur le quai ?', 'Un parapluie', 'Un bouquet', 'Un journal', 'Une pancarte']
    ]
  },
  {
    titre: 'La fête des voisins', niveau: 2,
    texte: 'Pour la fête des voisins, les habitants de la rue des Lilas ont installé de grandes tables dans la cour. Madame Petit a apporté sa fameuse quiche aux poireaux, et Monsieur Garcia a joué de l\'accordéon. Vers vingt-deux heures, le petit Hugo, six ans, s\'est endormi sur un banc. On a compté trente-cinq personnes, un record.',
    questions: [
      ['Dans quelle rue se passe la fête ?', 'Rue des Lilas', 'Rue des Roses', 'Rue du Moulin', 'Rue de la Gare'],
      ['Qu\'a apporté Madame Petit ?', 'Une quiche aux poireaux', 'Une tarte aux pommes', 'Un gratin', 'Une salade composée'],
      ['De quel instrument a joué Monsieur Garcia ?', 'De l\'accordéon', 'De la guitare', 'Du violon', 'De l\'harmonica'],
      ['Quel âge a Hugo ?', 'Six ans', 'Quatre ans', 'Huit ans', 'Dix ans'],
      ['Où Hugo s\'est-il endormi ?', 'Sur un banc', 'Dans un hamac', 'Sur les genoux de sa mère', 'Sous une table'],
      ['Combien de personnes y avait-il ?', 'Trente-cinq', 'Vingt-cinq', 'Cinquante', 'Quarante-deux']
    ]
  },
  {
    titre: 'Le jardin d\'Albert', niveau: 2,
    texte: 'Albert cultive un petit potager derrière sa maison. Cette année, il a planté douze pieds de tomates, des haricots verts et trois rangs de pommes de terre. En juillet, des limaces ont mangé une partie de ses salades. Sa voisine Josette lui a conseillé de mettre des coquilles d\'œufs écrasées autour des plants. En août, il a récolté plus de vingt kilos de tomates.',
    questions: [
      ['Combien de pieds de tomates Albert a-t-il plantés ?', 'Douze', 'Huit', 'Vingt', 'Quinze'],
      ['Combien de rangs de pommes de terre ?', 'Trois', 'Deux', 'Cinq', 'Quatre'],
      ['Qu\'est-ce qui a abîmé les salades ?', 'Des limaces', 'La grêle', 'Des lapins', 'La sécheresse'],
      ['Quand ont-elles été abîmées ?', 'En juillet', 'En mai', 'En juin', 'En septembre'],
      ['Quel conseil la voisine a-t-elle donné ?', 'Des coquilles d\'œufs écrasées', 'Du sel', 'De la cendre', 'Du marc de café'],
      ['Combien de kilos de tomates a-t-il récoltés ?', 'Plus de vingt', 'Plus de cinquante', 'Environ dix', 'Environ cinq']
    ]
  },
  {
    titre: 'Le concours de cuisine', niveau: 2,
    texte: 'Au concours de cuisine du village, il y avait neuf participants. Le jury était présidé par un ancien chef venu de Dijon. Germaine a présenté un bœuf bourguignon, Lucien une soupe de potiron et Odile un clafoutis aux cerises. C\'est Lucien qui a gagné le premier prix : un panier garni et un tablier brodé à son nom.',
    questions: [
      ['Combien y avait-il de participants ?', 'Neuf', 'Sept', 'Douze', 'Cinq'],
      ['D\'où venait le président du jury ?', 'De Dijon', 'De Lyon', 'De Paris', 'De Reims'],
      ['Qu\'a présenté Germaine ?', 'Un bœuf bourguignon', 'Une blanquette', 'Un pot-au-feu', 'Un coq au vin'],
      ['Quel dessert a présenté Odile ?', 'Un clafoutis aux cerises', 'Une tarte Tatin', 'Une mousse au chocolat', 'Un flan'],
      ['Qui a gagné ?', 'Lucien', 'Germaine', 'Odile', 'Le président du jury'],
      ['Qu\'a-t-il reçu en plus du panier garni ?', 'Un tablier brodé', 'Une casserole', 'Un livre de recettes', 'Une médaille']
    ]
  },
  {
    titre: 'La randonnée', niveau: 2,
    texte: 'Un groupe de onze marcheurs est parti à sept heures du parking du col. Après deux heures de montée, ils ont fait une pause près d\'une cascade. Raymond a aperçu un chamois sur un rocher. Au sommet, à 1 850 mètres, ils ont mangé du saucisson et des pommes. Au retour, Simone s\'est tordu la cheville, et deux hommes ont porté son sac.',
    questions: [
      ['Combien de marcheurs y avait-il ?', 'Onze', 'Neuf', 'Quinze', 'Huit'],
      ['À quelle heure sont-ils partis ?', 'Sept heures', 'Six heures', 'Huit heures', 'Neuf heures'],
      ['Où ont-ils fait la pause ?', 'Près d\'une cascade', 'Dans un refuge', 'Au bord d\'un lac', 'Près d\'une chapelle'],
      ['Quel animal Raymond a-t-il vu ?', 'Un chamois', 'Une marmotte', 'Un aigle', 'Un renard'],
      ['À quelle altitude est le sommet ?', '1 850 mètres', '2 400 mètres', '1 200 mètres', '3 000 mètres'],
      ['Qu\'est-il arrivé à Simone ?', 'Elle s\'est tordu la cheville', 'Elle a perdu son chapeau', 'Elle a eu un malaise', 'Elle s\'est piquée à des orties']
    ]
  },
  {
    titre: 'Le déménagement', niveau: 3,
    texte: 'Après quarante ans passés à Rennes, Jacques et Huguette ont déménagé dans une petite maison au bord de la mer, à Concarneau. Le camion est arrivé un jeudi, avec deux heures d\'avance. Les déménageurs ont cassé un vase chinois, cadeau de mariage de la tante Yvonne, mais l\'assurance a remboursé cent vingt euros. Le soir même, leurs nouveaux voisins, un couple de retraités anglais, leur ont apporté une soupe de poisson. Huguette a choisi la chambre qui donne sur le port, et Jacques a installé son établi dans le garage. Leur chien, un vieux labrador appelé Pirate, a passé la première nuit à aboyer contre les mouettes.',
    questions: [
      ['Combien de temps ont-ils vécu à Rennes ?', 'Quarante ans', 'Trente ans', 'Vingt-cinq ans', 'Cinquante ans'],
      ['Dans quelle ville ont-ils emménagé ?', 'Concarneau', 'Saint-Malo', 'Quimper', 'Brest'],
      ['Quel jour le camion est-il arrivé ?', 'Un jeudi', 'Un lundi', 'Un samedi', 'Un mardi'],
      ['Quel objet a été cassé ?', 'Un vase chinois', 'Un miroir', 'Une horloge', 'Une lampe'],
      ['Combien l\'assurance a-t-elle remboursé ?', '120 euros', '200 euros', '80 euros', '150 euros'],
      ['D\'où viennent les nouveaux voisins ?', 'D\'Angleterre', 'D\'Allemagne', 'De Belgique', 'D\'Irlande'],
      ['Comment s\'appelle le chien ?', 'Pirate', 'Corsaire', 'Marin', 'Capitaine']
    ]
  },
  {
    titre: 'L\'anniversaire surprise', niveau: 3,
    texte: 'Pour les soixante-dix ans de Robert, sa femme Ginette a organisé une fête surprise dans la salle des fêtes de Saint-Jean. Elle avait invité quarante-deux personnes, dont son ami d\'enfance Maurice, venu exprès du Canada. Pour éloigner Robert, leur fils l\'a emmené à la pêche à l\'étang des Saules toute l\'après-midi. Le gâteau, un fraisier en trois étages, venait de la pâtisserie Lemoine. Quand Robert est entré, l\'orchestre a joué « Le temps des cerises », sa chanson préférée. Il a reçu une canne à pêche neuve et un album de photos de sa jeunesse.',
    questions: [
      ['Quel âge fêtait Robert ?', 'Soixante-dix ans', 'Quatre-vingts ans', 'Soixante ans', 'Soixante-quinze ans'],
      ['Combien de personnes étaient invitées ?', 'Quarante-deux', 'Trente-deux', 'Cinquante', 'Vingt-quatre'],
      ['D\'où venait Maurice ?', 'Du Canada', 'De Suisse', 'D\'Espagne', 'Des États-Unis'],
      ['Où le fils a-t-il emmené Robert ?', 'À la pêche', 'Au cinéma', 'Au restaurant', 'En promenade en forêt'],
      ['Quel gâteau y avait-il ?', 'Un fraisier', 'Une forêt-noire', 'Un mille-feuille', 'Une pièce montée'],
      ['Quelle chanson l\'orchestre a-t-il jouée ?', 'Le temps des cerises', 'La vie en rose', 'Douce France', 'Les feuilles mortes'],
      ['Quels cadeaux a-t-il reçus ?', 'Une canne à pêche et un album photo', 'Une montre et un livre', 'Un pull et une bouteille de vin', 'Un voyage et un chapeau']
    ]
  },
  {
    titre: 'La brocante', niveau: 3,
    texte: 'Le premier dimanche d\'octobre, Fernand tenait un stand à la brocante de son quartier. Il vendait de vieux outils, des disques en vinyle et une collection de cartes postales des années cinquante. Une jeune femme a acheté une lampe à pétrole pour quinze euros. Un collectionneur belge lui a proposé deux cents euros pour les cartes postales, mais Fernand a refusé car elles venaient de son père. À midi, il a partagé une omelette aux champignons avec son voisin de stand, un horloger à la retraite. Le soir, il avait gagné quatre-vingt-sept euros et vendu presque tous ses disques.',
    questions: [
      ['Quand avait lieu la brocante ?', 'Le premier dimanche d\'octobre', 'Le dernier samedi de mai', 'Le 14 juillet', 'Le premier dimanche de septembre'],
      ['De quand datent les cartes postales ?', 'Des années cinquante', 'Des années trente', 'Des années soixante-dix', 'D\'avant la guerre de 14'],
      ['Combien a coûté la lampe à pétrole ?', '15 euros', '25 euros', '8 euros', '40 euros'],
      ['D\'où venait le collectionneur ?', 'De Belgique', 'De Suisse', 'D\'Italie', 'De Paris'],
      ['Pourquoi Fernand a-t-il refusé de vendre les cartes ?', 'Elles venaient de son père', 'Le prix était trop bas', 'Elles étaient déjà promises', 'Il voulait les vendre aux enchères'],
      ['Quel était le métier du voisin de stand ?', 'Horloger', 'Cordonnier', 'Instituteur', 'Menuisier'],
      ['Combien Fernand a-t-il gagné ?', '87 euros', '78 euros', '200 euros', '115 euros']
    ]
  },
  {
    titre: 'La sortie au musée', niveau: 3,
    texte: 'Le club des aînés de Montbrison a organisé une sortie au musée des Beaux-Arts de Lyon. Le car est parti à huit heures quinze avec vingt-huit personnes à bord. La guide, une étudiante prénommée Clara, a présenté des tableaux de Monet et une grande sculpture en bronze représentant un cheval. Pendant la visite, Madame Roux a perdu ses lunettes ; un gardien les a retrouvées dans la salle des peintures italiennes. Le déjeuner a eu lieu dans un bouchon lyonnais, où presque tout le monde a pris une quenelle sauce Nantua. Au retour, le chauffeur a fait un détour pour leur montrer la basilique de Fourvière illuminée.',
    questions: [
      ['De quelle ville venait le club ?', 'Montbrison', 'Roanne', 'Vienne', 'Villefranche'],
      ['À quelle heure le car est-il parti ?', '8 h 15', '7 h 45', '9 h 00', '8 h 45'],
      ['Combien de personnes y avait-il ?', 'Vingt-huit', 'Trente-huit', 'Dix-huit', 'Quarante'],
      ['Comment s\'appelait la guide ?', 'Clara', 'Chloé', 'Camille', 'Céline'],
      ['Que représentait la sculpture ?', 'Un cheval', 'Un lion', 'Une danseuse', 'Un soldat'],
      ['Où les lunettes ont-elles été retrouvées ?', 'Dans la salle des peintures italiennes', 'Au vestiaire', 'Dans le car', 'À la boutique du musée'],
      ['Qu\'ont-ils mangé pour la plupart ?', 'Une quenelle sauce Nantua', 'Un tablier de sapeur', 'Une andouillette', 'Un gratin dauphinois']
    ]
  },
  {
    titre: 'La tempête', niveau: 3,
    texte: 'Dans la nuit du 3 au 4 février, une forte tempête a frappé le village de Saint-Aubin. Les vents ont soufflé jusqu\'à cent trente kilomètres à l\'heure. Le vieux tilleul de la place est tombé sur l\'abribus, heureusement vide. Le courant a été coupé pendant dix-huit heures, et la mairie a ouvert la salle polyvalente pour accueillir les personnes âgées, où l\'on a servi du vin chaud et de la soupe à l\'oignon. Le lendemain, une trentaine de bénévoles ont dégagé les routes à la tronçonneuse. Le maire a promis de replanter un tilleul au printemps.',
    questions: [
      ['Quelle nuit la tempête a-t-elle eu lieu ?', 'Du 3 au 4 février', 'Du 13 au 14 février', 'Du 3 au 4 mars', 'Du 30 au 31 janvier'],
      ['Quelle était la vitesse du vent ?', '130 km/h', '90 km/h', '160 km/h', '110 km/h'],
      ['Quel arbre est tombé ?', 'Un tilleul', 'Un chêne', 'Un platane', 'Un marronnier'],
      ['Sur quoi est-il tombé ?', 'L\'abribus', 'L\'école', 'Une voiture', 'La fontaine'],
      ['Combien de temps le courant a-t-il été coupé ?', 'Dix-huit heures', 'Huit heures', 'Deux jours', 'Douze heures'],
      ['Qu\'a-t-on servi dans la salle polyvalente ?', 'Du vin chaud et de la soupe à l\'oignon', 'Du café et des croissants', 'Du chocolat chaud et des crêpes', 'Du thé et des biscuits'],
      ['Que va faire le maire au printemps ?', 'Replanter un tilleul', 'Construire un nouvel abribus', 'Organiser une fête', 'Refaire la place']
    ]
  }
];
