# 🦃 Le Royaume des Dindies — le plan complet

Ce fichier est **la référence du projet**. On le suit étape par étape et on le tient à jour (voir le *Journal d’avancement* tout en bas). Chaque étape doit être jouable, testée sur téléphone, tablette et ordinateur, puis mise en ligne.

- **Le jeu :** `docs/royaume/`, en ligne sur https://galvazzz-dotcom.github.io/rulie/royaume/
- **Les données des espèces :** `docs/royaume/js/donnees/especes.js` fait foi. Le tableau de la section 5 en est une copie, régénérée par `royaume-outils/tableau-especes.mjs`.

---

## 1. La vision

Un jeu de collection et d’élevage **à la Pokémon**, en **3D style jeu mobile**, dans l’univers du site : Roullieee, l’exploratrice des dindies imaginaires.

- **Public :** de 5 à 16 ans. Tout est lisible avec des icônes et une voix qui peut tout lire (mode aide), et il y a de la profondeur pour les plus grands (talents, caractères, stratégie de course). Une **version Petits** (5-7 ans) viendra après la 1.0.
- **Pas de combats :** on gagne par les **courses**, les **concours** et la **collection**.
- **Pas d’argent réel, pas de publicité.** On ne perd jamais une dindie et aucune règle ne punit.
- **Les piliers :**
  1. **Attraper** les dindies sauvages dans 8 régions.
  2. **Élever** : niveaux, talents, caractères, évolutions.
  3. **Croiser** : 72 espèces à découvrir dans le Grand Livre.
  4. **Courir** : 8 championnats, puis la Ligue des Légendes.
  5. **Construire** : le Domaine, ses bâtiments et sa décoration.
- **La durée de vie visée :**
  - 15 à 25 heures pour l’histoire ;
  - plus de 60 heures pour tout finir à 100 % ;
  - puis le quotidien : défis du jour, missions, événements selon la date.

## 2. L’histoire et les personnages

**Le prologue :** une nuit de pleine lune, dans son jardin, Roullieee aperçoit le légendaire **Dindromakus RUUULIUSSS Maximus**. Il pousse son cri (« RUUUULIIIIIIEEEEEEE !!! »), laisse tomber une plume arc-en-ciel qui s’éteint aussitôt, et s’envole. Le lendemain, le **Professeur Plumeau** lui confie le vieux **Domaine des Dindies**, en ruine, et le **Grand Livre** : 72 pages vides.

**Le but :** reconstruire le Domaine, remplir le Grand Livre, gagner les 8 badges du Dindodrome, battre la Ligue des Légendes et le rival Gontran, rallumer la plume arc-en-ciel et faire renaître le Dindromakus.

| Personnage | Rôle |
|---|---|
| **Roullieee** | l’héroïne, exploratrice : chapeau, gilet orange, sac à dos et filet |
| **Professeur Plumeau** | le Labo : évolutions, talents, quêtes de l’histoire |
| **Coach Ginette** | le terrain d’entraînement : stats et compétences |
| **Mimi la marchande** | la Boutique |
| **Capitaine Zéphyr** | le pilote de la montgolfière, vers les régions |
| **Gontran Gloupi** | le rival, vantard mais pas méchant ; il revient à plusieurs moments |
| **Les 8 champions** | Gaston (Prairie), Leïla des Dunes (Sable), Monsieur Waffel (Pluie), Tarzanette (Jungle), Inuk (Glace), Madame Lava (Feu), Comte Hibou (Nuit), Aurélie Azur (Ciel) |
| **Les Quatre Plumes** (la Ligue) | Baronne Plumeline, le Grand Dindini, Mamie Glouglou, Capitaine Rapido |

## 3. Le Domaine (la carte de base)

C’est **une nouvelle carte 3D** qu’on parcourt avec Roullieee, sans lien avec la ferme. Les bâtiments se réparent, puis s’améliorent du niveau 1 au niveau 5.

| Zone | Bâtiment | À quoi il sert |
|---|---|---|
| Centre | **Maison de Roullieee** | sauvegarde, profils, réglages, journal des quêtes |
| Centre | **Boutique** (Mimi) | graines, friandises, filets, équipements, billets, chapeaux |
| Centre | **Labo du Professeur** | évolutions (éveil), lecture des talents, quêtes |
| Centre | **Panneau des quêtes** | défis du jour et de la semaine |
| Ouest | **Les Enclos** (8 habitats) | les dindies y vivent selon leur type ; elles y lâchent des plumes et y gagnent en bonheur. Capacité par habitat : 2, 4, 6, 8 puis 10 places |
| Ouest | **Le Clapier à dindes** | le dortoir des dindies qui ne sont pas dans un enclos, comme les boîtes du PC dans Pokémon : 30 places par rangée, de 1 à 10 rangées |
| Nord | **Le Couvoir** | les nids (1 à 3) où l’on met deux adultes, et les couveuses où l’œuf éclot |
| Nord | **La Nurserie** | les poussins y grandissent jusqu’à l’âge adulte |
| Nord | **Le Potager** | on y cultive maïs, blé, haricot sauteur et baies arc-en-ciel |
| Nord | **Le Moulin à friandises** | on y fabrique les friandises |
| Nord | **L’Atelier des plumes** | les plumes servent à fabriquer chapeaux et décorations |
| Est, par la route | **Le Dindodrome** | les courses, les championnats, la salle des trophées |
| Est | **Le terrain d’entraînement** (Coach Ginette) | les 3 mini-jeux d’entraînement, les compétences |
| Sud | **Le port des montgolfières** | la carte du monde et les voyages |
| Sud | **Le Bureau des missions** | on y envoie des équipes chercher des objets |
| En plus | **La Scène des défilés** | les concours de défilé et de glouglou |
| En plus | **Le Musée du Grand Livre** | les portraits des espèces trouvées, exposés |

- **L’équipe :** jusqu’à 6 dindies, utilisées pour les courses, les missions et les concours. Une dindie de l’équipe peut **suivre Roullieee** partout.
- **La décoration :** on place librement chemins, fleurs, statues et fanions (50 décorations).

## 4. Les 8 régions

On y va en montgolfière. Chaque région est une île 3D à explorer, avec ses dindies sauvages, ses trésors, son équipement et sa grande quête mythique.

| # | Région | Type | Équipement | Grande quête (mythique) |
|---|---|---|---|---|
| 1 | Les Prés | 🌿 Prairie | le filet | « Le jardin oublié » |
| 2 | Le Maroc imaginaire | 🏜️ Sable | le chapeau de soleil | « Les mille et une dunes » |
| 3 | La Belgique | 💧 Pluie | le parapluie | « Le trésor des canaux » |
| 4 | La Jungle | 🌴 Jungle | les jumelles | « Le temple perdu » |
| 5 | La Banquise | ❄️ Glace | les moufles | « La nuit polaire » |
| 6 | Le Volcan | 🔥 Feu | les bottes de lave | « Le cœur du volcan » |
| 7 | La Forêt de la Lune | 🌙 Nuit | la lanterne | « La légende » |
| 8 | Le Royaume des Nuages | ☁️ Ciel | les ailes de planeur | « Le palais des nuages » |

**Les apparitions :**
- Les communes se voient tout le temps.
- Les rares demandent l’équipement de la région.
- Les épiques apparaissent seulement après avoir battu le champion de la région, et sous une condition : la nuit, la pluie, le matin…
- Le **jour et la nuit suivent l’heure réelle**. La **météo** change toutes les heures, calculée d’après la date pour être la même pour tout le monde.

**Attraper une dindie :**
1. On s’approche. Si on court, elle se méfie.
2. On lance des friandises : la **jauge de confiance** se remplit, deux fois plus vite avec sa friandise préférée.
3. On lance le **filet** quand le cercle qui rétrécit est dans la zone verte.

- **La zone verte** dépend de la rareté (commune ×1, rare ×0,7, épique ×0,45) et du filet (simple ×1, solide ×1,3, doré ×1,7). En mode aide, elle est 1,5 fois plus grande.
- **Si on rate,** la dindie fait un bond, la confiance baisse de 30 %, et on réessaie. Après 3 ratés, elle part, et revient plus tard.

**Trouvés en chemin :** coffres (pièces), œufs mystère, pierres d’éveil, objets de quête.

## 5. Les 4 raretés et les 72 espèces

**Les raretés :** ⚪ commune · 🔵 rare · 🟣 épique · 🌈 mythique.

- **Chromatique ✨** : 1 chance sur 64 à chaque éclosion ou apparition, pour toutes les espèces. Ses couleurs changent et elle scintille. La Breloque chromatique, après l’histoire, passe la chance à 1 sur 32.
- **Les nombres :** 32 sauvages (4 par région), 32 nées de croisements (28 mélanges de types et 4 recettes spéciales), 8 mythiques.
- **Les stats de base** vont de 1 à 10 : ⚡ vitesse, 💪 endurance, 🦘 saut. Le total dépend de la rareté :

| Rareté | Total des stats de base |
|---|---|
| Commune | 12 ou 13 |
| Rare | 16 à 18 |
| Épique | 20 à 23 |
| Mythique | 26 à 30 |

<!-- TABLEAU-ESPECES:DEBUT -->
| N° | Espèce | Rareté | Type | Comment l’obtenir | ⚡ 💪 🦘 | Cri |
|---|---|---|---|---|---|---|
| 1 | **Dindon Glouglou** | ⚪ Commune | 🌿 Prairie | sauvage, les Prés | 4 · 5 · 3 | GLOU GLOU ! |
| 2 | **Dindinette Pâquerette** | ⚪ Commune | 🌿 Prairie | sauvage, les Prés | 4 · 3 · 5 | Glouli glouli ! |
| 3 | **Dindon Trèfle** | 🔵 Rare | 🌿 Prairie | sauvage, les Prés | 6 · 5 · 6 | Glou-chance ! |
| 4 | **Grand Dindon Coquelicot** | 🟣 Épique | 🌿 Prairie | sauvage, les Prés | 7 · 7 · 7 | GLOUUU-LIIICOT ! |
| 5 | **Dindasable** | ⚪ Commune | 🏜️ Sable | sauvage, le Maroc imaginaire | 5 · 5 · 3 | Glouuu… (en chuchotant) |
| 6 | **Dindromadaire** | ⚪ Commune | 🏜️ Sable | sauvage, le Maroc imaginaire | 3 · 7 · 3 | GLOOOOOUUU… |
| 7 | **Dindonus Mirageus** | 🔵 Rare | 🏜️ Sable | sauvage, le Maroc imaginaire | 6 · 5 · 6 | Glou ? … Glou ! |
| 8 | **Dinde D’Inde Dingue** | 🟣 Épique | 🏜️ Sable | sauvage, le Maroc imaginaire | 8 · 5 · 8 | GLOU GLOU DINGUE ! |
| 9 | **Dindon Gaufrette** | ⚪ Commune | 💧 Pluie | sauvage, la Belgique | 4 · 5 · 4 | Glouf glouf ! |
| 10 | **Dindon Crachin** | ⚪ Commune | 💧 Pluie | sauvage, la Belgique | 4 · 6 · 3 | Plic, ploc, glou ! |
| 11 | **Dindonus Belgicus** | 🔵 Rare | 💧 Pluie | sauvage, la Belgique | 6 · 7 · 5 | GOULOU BELGE ! |
| 12 | **Dindonus Atomium** | 🟣 Épique | 💧 Pluie / ☁️ Ciel | sauvage, la Belgique | 7 · 7 · 8 | GLOU-TOMIUM ! |
| 13 | **Dindoperroquet** | ⚪ Commune | 🌴 Jungle | sauvage, la Jungle | 5 · 3 · 5 | Glou ! Glou ! Bonjour ! Glou ! |
| 14 | **Dindobanane** | ⚪ Commune | 🌴 Jungle | sauvage, la Jungle | 4 · 4 · 5 | Glou-nana ! |
| 15 | **Dindoliane** | 🔵 Rare | 🌴 Jungle | sauvage, la Jungle | 6 · 5 · 7 | Glouuuu-iiiii ! |
| 16 | **Dindojaguar** | 🟣 Épique | 🌴 Jungle | sauvage, la Jungle | 9 · 6 · 7 | GRRR-GLOU ! |
| 17 | **Dindingloo** | ⚪ Commune | ❄️ Glace | sauvage, la Banquise | 3 · 6 · 4 | Glou… brrr… glou ! |
| 18 | **Dindopingouin** | ⚪ Commune | ❄️ Glace | sauvage, la Banquise | 4 · 5 · 3 | Glou-glou, monsieur. |
| 19 | **Dindaurore** | 🔵 Rare | ❄️ Glace / 🌙 Nuit | sauvage, la Banquise | 5 · 7 · 6 | Glouuu-ooooh… |
| 20 | **Dindocristal** | 🟣 Épique | ❄️ Glace | sauvage, la Banquise | 6 · 9 · 6 | Gling-glou ! |
| 21 | **Dindocendre** | ⚪ Commune | 🔥 Feu | sauvage, le Volcan | 5 · 5 · 3 | Kof kof… glou ! |
| 22 | **Dindobraise** | ⚪ Commune | 🔥 Feu | sauvage, le Volcan | 6 · 3 · 4 | Grésille-glou ! |
| 23 | **Dindofeu** | 🔵 Rare | 🔥 Feu | sauvage, le Volcan | 8 · 4 · 6 | FLAMBI-GLOU ! |
| 24 | **Dindomagma** | 🟣 Épique | 🔥 Feu | sauvage, le Volcan | 8 · 8 · 5 | BLOUB-BLOUB-GLOU ! |
| 25 | **Dindon Lune** | ⚪ Commune | 🌙 Nuit | sauvage, la Forêt de la Lune | 4 · 4 · 5 | Glouuu… (sous la lune) |
| 26 | **Dindhibou** | ⚪ Commune | 🌙 Nuit | sauvage, la Forêt de la Lune | 3 · 5 · 5 | Hou-glou ! Hou-glou ! |
| 27 | **Dindoluciole** | 🔵 Rare | 🌙 Nuit | sauvage, la Forêt de la Lune | 6 · 5 · 6 | Bzzz-glou ! |
| 28 | **Dindétoile** | 🟣 Épique | 🌙 Nuit / ☁️ Ciel | sauvage, la Forêt de la Lune | 7 · 6 · 9 | Twinkle-glou ! |
| 29 | **Dindinuage** | ⚪ Commune | ☁️ Ciel | sauvage, le Royaume des Nuages | 4 · 3 · 6 | Pfffou-glou… |
| 30 | **Dindozéphyr** | ⚪ Commune | ☁️ Ciel | sauvage, le Royaume des Nuages | 5 · 3 · 5 | Fiouuu-glou ! |
| 31 | **Dindarc** | 🔵 Rare | ☁️ Ciel / 💧 Pluie | sauvage, le Royaume des Nuages | 6 · 5 · 7 | Glou-lalala ! |
| 32 | **Dindorage** | 🟣 Épique | ☁️ Ciel | sauvage, le Royaume des Nuages | 9 · 5 · 8 | BRRRAOUM-GLOU ! |
| 33 | **Dindoasis** | 🔵 Rare | 🌿 Prairie / 🏜️ Sable | croisement 🌿 × 🏜️ | 5 · 6 · 5 | Glou-glou-glou (comme une fontaine) |
| 34 | **Dindon Rosée** | 🔵 Rare | 🌿 Prairie / 💧 Pluie | croisement 🌿 × 💧 | 5 · 6 · 6 | Glou… plic ! |
| 35 | **Dindofougère** | 🔵 Rare | 🌿 Prairie / 🌴 Jungle | croisement 🌿 × 🌴 | 6 · 5 · 6 | Frrrou-glou ! |
| 36 | **Dindon Givré** | 🔵 Rare | 🌿 Prairie / ❄️ Glace | croisement 🌿 × ❄️ | 4 · 7 · 5 | Glou… atchoum ! |
| 37 | **Dindotournesol** | 🔵 Rare | 🌿 Prairie / 🔥 Feu | croisement 🌿 × 🔥 | 7 · 5 · 5 | Glou-soleil ! |
| 38 | **Dindamanite** | 🟣 Épique | 🌿 Prairie / 🌙 Nuit | croisement 🌿 × 🌙 | 6 · 8 · 7 | Glou-pouf ! |
| 39 | **Dindopissenlit** | 🔵 Rare | 🌿 Prairie / ☁️ Ciel | croisement 🌿 × ☁️ | 5 · 4 · 8 | Pffff… glou ! |
| 40 | **Dindocactus** | 🔵 Rare | 🏜️ Sable / 💧 Pluie | croisement 🏜️ × 💧 | 4 · 8 · 4 | Glou… aïe ! |
| 41 | **Dindobra** | 🟣 Épique | 🏜️ Sable / 🌴 Jungle | croisement 🏜️ × 🌴 | 8 · 6 · 7 | Ssssss-glou… |
| 42 | **Dindosel** | 🔵 Rare | 🏜️ Sable / ❄️ Glace | croisement 🏜️ × ❄️ | 5 · 7 · 4 | Glou… j’ai soif. |
| 43 | **Dindosirocco** | 🟣 Épique | 🏜️ Sable / 🔥 Feu | croisement 🏜️ × 🔥 | 9 · 7 · 5 | FOUUUUH-GLOU ! |
| 44 | **Dindomomie** | 🟣 Épique | 🏜️ Sable / 🌙 Nuit | croisement 🏜️ × 🌙 | 5 · 9 · 6 | Glouuuuu… (depuis mille ans) |
| 45 | **Dindotapis Volant** | 🟣 Épique | 🏜️ Sable / ☁️ Ciel | croisement 🏜️ × ☁️ | 7 · 6 · 8 | Glou-la-la, ça vole ! |
| 46 | **Dindogrenouille** | 🔵 Rare | 💧 Pluie / 🌴 Jungle | croisement 💧 × 🌴 | 5 · 5 · 8 | Croâ-glou ! |
| 47 | **Dindoflocon** | 🔵 Rare | 💧 Pluie / ❄️ Glace | croisement 💧 × ❄️ | 5 · 6 · 6 | Glou… (tout doux) |
| 48 | **Dindovapeur** | 🔵 Rare | 💧 Pluie / 🔥 Feu | croisement 💧 × 🔥 | 7 · 6 · 4 | Tchouuu-glou ! |
| 49 | **Dindobrume** | 🔵 Rare | 💧 Pluie / 🌙 Nuit | croisement 💧 × 🌙 | 5 · 6 · 6 | Glouuu (de loin)… |
| 50 | **Dindo-Nimbus** | 🔵 Rare | 💧 Pluie / ☁️ Ciel | croisement 💧 × ☁️ | 5 · 5 · 8 | Glou-plouf ! |
| 51 | **Dindomammouth** | 🟣 Épique | 🌴 Jungle / ❄️ Glace | croisement 🌴 × ❄️ | 5 · 10 · 5 | BROOOUM-GLOU ! |
| 52 | **Dindodragon** | 🟣 Épique | 🌴 Jungle / 🔥 Feu | croisement 🌴 × 🔥 | 8 · 8 · 6 | GRAOU-GLOU ! |
| 53 | **Dindopanthère** | 🟣 Épique | 🌴 Jungle / 🌙 Nuit | croisement 🌴 × 🌙 | 9 · 6 · 8 | … (elle ne fait aucun bruit) |
| 54 | **Dindocolibri** | 🔵 Rare | 🌴 Jungle / ☁️ Ciel | croisement 🌴 × ☁️ | 8 · 3 · 7 | Bzzzzz-glou ! |
| 55 | **Dindo Tiède** | 🔵 Rare | ❄️ Glace / 🔥 Feu | croisement ❄️ × 🔥 | 6 · 6 · 5 | Glou… (juste comme il faut) |
| 56 | **Dindoyéti** | 🟣 Épique | ❄️ Glace / 🌙 Nuit | croisement ❄️ × 🌙 | 6 · 9 · 7 | HOUUUUUGLOU ! |
| 57 | **Dindogrêle** | 🔵 Rare | ❄️ Glace / ☁️ Ciel | croisement ❄️ × ☁️ | 6 · 5 · 7 | Tac-tac-glou ! |
| 58 | **Dindracula** | 🟣 Épique | 🔥 Feu / 🌙 Nuit | croisement 🔥 × 🌙 | 8 · 7 · 7 | Glou-ha-ha-ha ! |
| 59 | **Dindocomète** | 🟣 Épique | 🔥 Feu / ☁️ Ciel | croisement 🔥 × ☁️ | 10 · 5 · 7 | FIIIIIOU-GLOU ! |
| 60 | **Dindogalaxie** | 🟣 Épique | 🌙 Nuit / ☁️ Ciel | croisement 🌙 × ☁️ | 7 · 7 · 9 | Glouuu-niveeers… |
| 61 | **Dindonus Frites-Fluo** | 🟣 Épique | 💧 Pluie / 🏜️ Sable | recette : Dindonus Belgicus × Dinde D’Inde Dingue | 8 · 7 · 7 | GOULOU DINGUE ! |
| 62 | **Dindopirate** | 🟣 Épique | ❄️ Glace / 🌴 Jungle | recette : Dindopingouin × Dindoperroquet | 7 · 8 · 6 | Glou-glou, moussaillon ! |
| 63 | **Dindoflambée** | 🟣 Épique | 🌴 Jungle / 🔥 Feu | recette : Dindobanane × Dindofeu | 9 · 5 · 7 | Glou-caramel ! |
| 64 | **Dindo-Pâtissier** | 🟣 Épique | 💧 Pluie / 🌴 Jungle | recette : Dindon Gaufrette × Dindobanane | 6 · 8 · 7 | Glou ! C’est prêt ! |
| 65 | **Dindoréa Florissima** | 🌈 Mythique | 🌿 Prairie | Grand Dindon Coquelicot × Dindamanite + la Graine d’or (quête « Le jardin oublié », le matin) | 8 · 9 · 9 | Glouuu-flooora ! |
| 66 | **Sultan Dindabad** | 🌈 Mythique | 🏜️ Sable | Dinde D’Inde Dingue × Dindotapis Volant + la Lampe merveilleuse (quête « Les mille et une dunes ») | 9 · 9 · 8 | GLOU-SALAM ! |
| 67 | **Dindonus Rex Belgarum** | 🌈 Mythique | 💧 Pluie | Dindonus Atomium × Dindonus Frites-Fluo + la Couronne des canaux (quête « Le trésor des canaux », un jour de pluie) | 9 · 10 · 8 | GOULOU ROYAL ! |
| 68 | **Quetzaldinde** | 🌈 Mythique | 🌴 Jungle / ☁️ Ciel | Dindojaguar × Dindodragon + la Plume de quetzal (quête « Le temple perdu ») | 9 · 8 · 10 | KWEEEET-GLOU ! |
| 69 | **Borealis Glacius Maximus** | 🌈 Mythique | ❄️ Glace / 🌙 Nuit | Dindocristal × Dindoyéti + l’Éclat d’aurore (quête « La nuit polaire », la nuit) | 8 · 10 · 9 | GLOUUUUU-REALIS ! |
| 70 | **Dindophénix** | 🌈 Mythique | 🔥 Feu / ☁️ Ciel | Dindomagma × Dindocomète + la Braise éternelle (quête « Le cœur du volcan », au lever du soleil) | 10 · 8 · 9 | FLAAAAMME-GLOU ! |
| 71 | **Célestia Dindissima** | 🌈 Mythique | ☁️ Ciel | Dindorage × Dindogalaxie + la Harpe des nuages (quête « Le palais des nuages ») | 9 · 9 · 10 | Glouuu-lalaaa ♪ |
| 72 | **Dindromakus RUUULIUSSS Maximus** | 🌈 Mythique | 🌙 Nuit | Dindétoile × Célestia Dindissima + la Plume arc-en-ciel (quête « La légende », une nuit de pleine lune) | 10 · 10 · 10 | RUUUULIIIIIIEEEEEEE !!! |
<!-- TABLEAU-ESPECES:FIN -->

## 6. L’apparence : un seul ADN pour la 3D et les portraits

Chaque espèce a un **ADN** : couleurs du corps, des ailes, du ventre, de la tête, de la queue ; motif de la queue (bandes, ocelles, belge, arc-en-ciel, flammes, étoiles) ; motif du corps (pois, rayures, taches, gaufre, flocons, étoiles, éclairs, losanges) ; crête ; chapeau ; accessoire ; yeux ; taille ; aura.

- Le **modèle 3D** (`dindies/modele.js`) et le **portrait SVG** (`dindies/portrait.js`) sont fabriqués à partir du même ADN.
- Les variantes viennent de l’ADN lui-même :
  - **poussin** : rond, jaune, sans queue ;
  - **jeune** : petite queue ;
  - **adulte** ;
  - **éveillé** : 15 % plus grand, queue plus grande, aura de son type, crête ;
  - **chromatique** : les couleurs changent de teinte et la dindie scintille.
- Les portraits servent dans le Grand Livre, sur les fiches et les cartes, au Musée, et sur une page publique du site (« Le Grand Livre des Dindies »). On pourra aussi **imprimer des cartes**.

## 7. L’élevage

### 7.1 Les croisements (au Couvoir)
On met **deux adultes** dans un nid. Un œuf apparaît.

| Résultat | Chance |
|---|---|
| Hybride de **mélange de types** (un type de chaque parent) | rare 30 %, épique 15 % ; l’épique demande un parent épique, ou deux parents de niveau 20 ou plus |
| **Recette spéciale** (deux espèces précises) | 25 % |
| **Mythique** (deux espèces précises, l’objet de la grande quête et la condition remplie) | 100 %, c’est une récompense de quête |
| Sinon | l’espèce de la mère ou du père, à 50/50 |

- **Les bonus :** le Gâteau d’amour (+10 %) et le Couvoir de niveau 3 ou plus (+5 %).
- **Le Grand Livre aide :** les espèces pas encore trouvées sont des silhouettes « ? » avec un indice, par exemple « un parent 🔥, un parent ❄️ ».

### 7.2 Les minuteurs (en temps réel, même jeu fermé)

| Œuf | Durée |
|---|---|
| Commune | 5 min |
| Rare | 20 min |
| Épique | 1 h |
| Mythique | 4 h |
| Le premier œuf du tutoriel | 30 s |

- **La Nurserie :** de poussin à jeune en 10 min, de jeune à adulte en 30 min. Chaque repas fait gagner 3 minutes.
- **Le Sablier**, un objet gagné en jouant, fait gagner 30 minutes. En mode aide, les durées sont divisées par 2.

### 7.3 Les niveaux, les talents, les caractères
- **Le niveau** va de 1 à 50. L’expérience vient des courses, de l’entraînement, des missions et des baies.
- **Le temps pour monter :** passer du niveau *n* au niveau *n+1* demande `10 × n^1,4` points d’expérience (à régler avec le simulateur).
- **Les stats affichées**, de 5 à 100 : `stat = 5 + ⌊(6 × base + 4 × talent + entraînement) × niveau / 50⌋`
  - *base* : celle de l’espèce, de 1 à 10 ;
  - *talent* : 0 à 5 étoiles ;
  - *entraînement* : 0 à 15 par stat.
- **Les talents :**
  - sauvage : 0 à 3 étoiles au hasard ;
  - bébé : pour chaque stat, le talent du père ou de la mère, puis 20 % de chance d’avoir +1 (5 au maximum) ;
  - « talent parfait » 5/5/5 : un objectif de fin de jeu.
- **Les 8 caractères** changent une stat de ±10 % :
  - Fonceuse (+⚡ −💪) ;
  - Têtue (+💪 −⚡) ;
  - Sauteuse (+🦘 −💪) ;
  - Rêveuse (+🦘 −⚡) ;
  - Costaude (+💪 −🦘) ;
  - Pressée (+⚡ −🦘) ;
  - Gourmande (expérience des friandises ×2) ;
  - Calme (neutre).
- **L’éveil :** au niveau 25, au Labo, avec la pierre d’éveil de son type. La dindie gagne +1 à chaque stat de base (10 au maximum), une nouvelle apparence et une place de compétence en plus.

### 7.4 Les compétences de course (20)
Chaque espèce a une compétence liée à son type. Le coach en apprend une deuxième, et une troisième après l’éveil.

| Compétence | Effet |
|---|---|
| Turbo-Glou | grosse accélération pendant 2 s |
| Départ canon | départ très rapide |
| Sprint final | plus rapide dans les derniers 20 % |
| Second souffle | récupère de l’endurance |
| Saut de crapaud | franchit deux haies d’un coup |
| Planeur | longs sauts sur la piste des Nuages |
| Glissade | pas ralentie par la glace ni la boue |
| Pattes de velours | pas ralentie par la lave |
| Aspiration | bonus derrière une adversaire |
| Esquive | évite une chute |
| Cri d’encouragement | en relais, boost pour l’équipière |
| Coup de vent | pousse en avant sur les pistes ouvertes |
| Ombre | invisible un instant : les autres hésitent |
| Mirage | les autres ralentissent un instant |
| Racines | ne glisse jamais |
| Étincelle | la dindie accélère quand elle double |
| Carapace de glace | pas de fatigue pendant 3 s |
| Bond de lune | les sauts sont plus hauts la nuit |
| Pluie de plumes | gêne la dindie juste derrière |
| Arc-en-ciel | un peu de tout, en moins fort (mythiques) |

En mode aide, les compétences se déclenchent toutes seules.

## 8. Les compétitions

### 8.1 Le Dindodrome
**La course :** 6 dindies sur une piste 3D, la caméra suit la nôtre. Ce qui compte :
- ⚡ **la vitesse :** la vitesse de pointe ;
- 💪 **l’endurance :** la fatigue (en dessous de 30 % d’endurance, on ralentit) ;
- 🦘 **le saut :** les haies (on peut sauter, trébucher et perdre 1 s, ou faire un saut parfait si on touche au bon moment) ;
- **le terrain :** +10 % sur la piste de son type, −10 % sur la piste du type opposé (pas de malus en mode aide) ;
- **les compétences**, avec un temps de recharge.

**Les sortes de courses :** sprint (400 m), haies (600 m), marathon (1 200 m), relais à 3 dindies (3 × 400 m), et les 8 pistes de type (Prés, Dunes, Boue, Lianes, Glace, Lave, Nuit, Nuages).

**Les 8 championnats :** chacun a 3 courses, puis une finale contre le champion, qui donne le badge, des pièces, un objet et ouvre la région suivante. Les adversaires vont du niveau 8 (championnat 1) au niveau 40 (championnat 8).

**La Ligue des Légendes :** 4 courses contre les Quatre Plumes, puis Gontran (niveau 45 à 50). C’est la fin de l’histoire.

**Après l’histoire :** les Coupes des Maîtres (niveau 50, talents forts), les records contre la montre sur chaque piste, et une course sans fin.

### 8.2 Les concours (à la Scène)
- **Défilé :** la note dépend de la rareté, de la chromatique, de la forme éveillée et d’un chapeau assorti au type, plus un petit jeu de poses en rythme. On passe de Débutant à Étoile.
- **Glouglou :** un jeu de rythme avec le cri de la dindie, sur 5 chansons et 3 difficultés.

## 9. La production, l’économie, les missions

- **Le Potager :**

  | Graine | Pousse en | Sert à |
  |---|---|---|
  | Maïs | 5 min | ⚡ |
  | Blé | 10 min | 💪 |
  | Haricot sauteur | 15 min | 🦘 |
  | Baie arc-en-ciel | 1 h | expérience |

- **Le Moulin :**
  - les friandises ⚡, 💪, 🦘 : de l’entraînement en plus ;
  - la friandise d’expérience ;
  - la super-friandise, qui aide à attraper ;
  - le Gâteau d’amour, pour les croisements.
- **L’Atelier des plumes :** chaque dindie dans son enclos lâche des plumes de son type (à ramasser une fois par jour). On en fabrique **30 chapeaux** et **50 décorations**.
- **Les monnaies :**
  - les **pièces** 🪙, gagnées aux courses, aux missions, dans les coffres et avec les quêtes ;
  - les **plumes d’or** 🪶, plus rares, gagnées avec les succès, les défis et les mythiques, pour les objets spéciaux.
- **Le Bureau des missions :** on envoie 1 à 3 dindies pendant 15 min à 8 h. La réussite dépend des stats et des types demandés. Elles rapportent pièces, objets, œufs mystère, et parfois un œuf épique.
- **Rendre à la nature :** on peut relâcher une dindie avec un petit au revoir, contre des plumes. Il n’y a pas de vente.

## 10. Les quêtes et la durée de vie

**L’histoire en 9 chapitres** (environ 60 quêtes) :
1. *Le Domaine en ruine* : tutoriel, les Prés, le premier enclos, le Clapier.
2. *Le premier œuf* : le Couvoir, la Nurserie, le premier croisement.
3. *Le Dindodrome ouvre* : l’entraînement, le championnat 1, Gontran.
4. *Le Maroc imaginaire* : la région 2, le championnat 2.
5. *La Belgique* : la région 3, le championnat 3, l’Atelier des plumes.
6. *Jungle et Banquise* : les régions 4 et 5, les championnats 4 et 5, les missions.
7. *Volcan et Forêt de la Lune* : les régions 6 et 7, les championnats 6 et 7, l’éveil.
8. *Le Royaume des Nuages* : la région 8, le championnat 8, les mythiques.
9. *La Légende* : la Ligue des Légendes, la plume arc-en-ciel, le Dindromakus, la fin et le générique.

**Les autres activités :**
- environ 40 quêtes des habitants ;
- 8 grandes quêtes de région, une par mythique ;
- 3 défis par jour et 3 par semaine ;
- **100 succès** ;
- la **collection** : 72 espèces, chacune en forme adulte et en forme éveillée, plus toutes les chromatiques ✨.

**Les événements selon la date :** Halloween, Noël, Pâques, l’été. Ils donnent des chapeaux et des décorations exclusives, et font apparaître plus souvent certaines espèces.

## 11. L’interface et les réglages

- **Le style :** bulles et boutons comme dans la ferme, polices *Lilita One* et *Fredoka*, cartes de couleur selon la rareté, et des retours vivants (rebonds, étincelles, confettis).
- **Le toucher :** on touche le sol pour marcher et on touche un bâtiment ou une dindie pour agir. Ça marche aussi à la souris et au clavier.
- **Le mode aide** (réglable par profil) : la voix lit tout, la capture est plus facile, les compétences sont automatiques, les minuteurs sont divisés par 2 et il n’y a pas de malus de terrain.
- **La sauvegarde :**
  - **3 profils**, pour les frères et sœurs ;
  - une sauvegarde automatique ;
  - un **code de sauvegarde** à copier ou un fichier à télécharger, pour ne rien perdre et changer d’appareil ;
  - les nouvelles versions du jeu reprennent les anciennes sauvegardes.

## 12. La direction artistique (3D « jeu mobile »)

- **Le rendu :** un rendu cartoon (MeshToonMaterial à 3 tons) avec des **contours** autour des personnages, des ombres douces, un ciel en dégradé, du brouillard léger, de l’eau animée, de l’herbe et des arbres qui bougent avec le vent, des étincelles et de la poussière.
- **Les personnages :** formes rondes, **gros yeux brillants**, animations qui écrasent et étirent (marche en dandinant, glouglou, « roue » de la queue, sauts).
- **La lumière** change avec le jour et la nuit. Chaque région a sa propre ambiance.
- **Les performances :**
  - viser 60 images par seconde sur un téléphone moyen ;
  - chaque dindie est regroupée en quelques morceaux (environ 8 appels de dessin) ;
  - les contours ne sont dessinés que pour les dindies proches ;
  - la résolution est limitée sur téléphone et les ombres ne sont calculées que près de la caméra.
- **Tout est fabriqué par le code.** On pourra ajouter des modèles 3D libres (CC0 : Kenney, Quaternius) pour certains décors.

## 13. Côté technique

```
docs/royaume/
  index.html              la page du jeu
  style.css
  js/main.js              démarrage, boucle, passage d'une scène à l'autre
  js/moteur/              rendu (toon, contours, ciel), formes, caméra, entrées, interface,
                          sons, voix, sauvegarde, temps (jour/nuit, météo, lune)
  js/dindies/             adn, modele (3D), portrait (SVG), elevage, stats
  js/donnees/             types, especes, regions, batiments, objets, competences,
                          courses, quetes, pnj
  js/personnages/         roullieee, pnj
  js/scenes/              defile (étape 1), domaine, region, capture, couvoir,
                          dindodrome, course, concours
royaume-outils/           les tests Playwright, le simulateur d'équilibrage,
                          le générateur du tableau des espèces
```

- **Des modules ES sans outil de construction :** Three.js 0.160.0 par carte d’import (jsdelivr), mis en ligne tel quel par GitHub Pages.
- **La sauvegarde :** `localStorage`, sous la clé `royaumeDindies.v1`, avec un numéro de version pour la migration.
- **Les tests :**
  - des parties jouées automatiquement par Playwright (comme pour la ferme), sur téléphone, téléphone couché, tablette et ordinateur ;
  - une vérification qu’il n’y a aucune erreur et que la mémoire reste stable ;
  - un **simulateur** qui joue des milliers de croisements et de courses pour régler la progression.

## 14. Les étapes jusqu’à la version 1.0

Chaque étape se termine par : les tests passent, des captures sur les 4 formats, la mise en ligne, et une ligne dans le journal ci-dessous.

### Étape 1 — Le style 3D et les dindies ✅
- [x] Le moteur en modules : rendu toon, contours, lumières, ombres douces, ciel, île et podium.
- [x] L’ADN et ses variantes (poussin, jeune, adulte, éveillé, chromatique), et les 72 espèces.
- [x] Le modèle 3D de dindie fabriqué depuis l’ADN, avec ses animations (repos, marche, glouglou, roue, saut, course).
- [x] Les portraits SVG fabriqués depuis le même ADN.
- [x] La nouvelle Roullieee, l’exploratrice.
- [x] L’écran « Le Grand Défilé » :
  - la dindie en 3D sur le podium, avec les boutons ◀ ▶, stade, chromatique, roue et glouglou ;
  - sa carte ;
  - le Grand Livre (72 portraits, filtres par rareté et par type) ;
  - le défilé automatique.
- **Fini quand :** les 72 espèces s’affichent en 3D et en portrait sur les 4 formats, sans erreur, et le rendu est fluide sur téléphone.

### Étape 2 — Le Domaine
- [ ] La carte 3D du Domaine : zones, chemins, décors, jour et nuit.
- [ ] Les déplacements de Roullieee et la caméra qui la suit.
- [ ] La Maison (profils, sauvegarde, code), la Boutique, le Labo, 2 enclos et le Clapier.
- [ ] Les PNJ, les dialogues, le journal des quêtes, et le chapitre 1 jusqu’au départ en montgolfière.
- [ ] Le Grand Livre du jeu (silhouettes « ? », indices) et le Musée.
- [ ] Des dindies de départ, offertes par le Professeur, qui vivent dans les enclos.
- **Fini quand :** on peut se promener dans le Domaine, ranger ses dindies, sauvegarder et reprendre.

### Étape 3 — L’expédition
- [ ] Le port, la montgolfière et la carte du monde.
- [ ] Les régions 1 à 3 en 3D (Prés, Maroc imaginaire, Belgique).
- [ ] Les apparitions (heure, météo), la capture (confiance et filet) et les équipements.
- [ ] Les coffres, les œufs mystère et les pierres d’éveil.
- **Fini quand :** on peut attraper les 12 espèces sauvages des 3 premières régions.

### Étape 4 — L’élevage et l’évolution
- [ ] Le Couvoir (nids, couveuses), les minuteurs en temps réel, la Nurserie.
- [ ] Les niveaux, l’expérience, les talents, les caractères, la fiche complète.
- [ ] Les croisements : mélanges de types, recettes spéciales, indices du Livre.
- [ ] L’éveil au Labo et les chromatiques.
- **Fini quand :** on peut obtenir des hybrides et faire évoluer une dindie.

### Étape 5 — Le Dindodrome
- [ ] La piste 3D, la simulation de course, les actions du joueur, les compétences.
- [ ] Le terrain d’entraînement et ses 3 mini-jeux, et l’apprentissage des compétences.
- [ ] Les championnats 1 à 4, les badges et Gontran.
- **Fini quand :** on peut élever un champion et gagner 4 badges.

### Étape 6 — La production
- [ ] Le Potager, le Moulin, l’Atelier des plumes (chapeaux).
- [ ] La décoration du Domaine et les améliorations des bâtiments.
- [ ] Le Bureau des missions.
- **Fini quand :** le Domaine produit et se décore, et les missions rapportent.

### Étape 7 — Le monde entier
- [ ] Les régions 4 à 8, tous les habitats, tous les équipements.
- [ ] Les 72 espèces atteignables, les 8 grandes quêtes mythiques.
- [ ] Les championnats 5 à 8.
- **Fini quand :** toute la collection peut être obtenue.

### Étape 8 — La fin et l’après-histoire
- [ ] La Ligue des Légendes, la plume arc-en-ciel, le Dindromakus.
- [ ] Le prologue, la fin et le générique.
- [ ] Les concours (défilé, glouglou), les relais, les Coupes des Maîtres, les records.
- [ ] Les défis du jour et de la semaine, les 100 succès, les événements selon la date.
- **Fini quand :** le jeu se finit du début à la fin, avec de quoi continuer après.

### Étape 9 — La version 1.0
- [ ] L’équilibrage avec le simulateur (durées visées : 15 à 25 h, et plus de 60 h à 100 %).
- [ ] La musique, les cris de chaque espèce, les sons.
- [ ] Les tutoriels, le mode aide, l’accessibilité.
- [ ] Les performances sur téléphone, une partie complète testée automatiquement, et les 4 formats.
- [ ] Le site : un bouton sur l’accueil et la page publique « Le Grand Livre des Dindies ».
- **Fini quand :** la version 1.0 est en ligne.

**Après la 1.0 :** la version Petits (5-7 ans) et un mode Apprendre.

## 15. Les règles du projet

- Les données (espèces, régions, objets…) vivent dans `js/donnees/`. **On ne change pas la liste des 72 espèces avant la fin de l’étape 7.**
- Chaque nouvelle version du jeu reprend les sauvegardes existantes.
- On ne pousse que du code testé, avec aucune erreur dans le navigateur.
- On met à jour ce plan (cases cochées et journal) à chaque étape.

## 16. Journal d’avancement

| Date | Étape | Ce qui est fait |
|---|---|---|
| 2026-10-21 | — | Le plan est écrit, et les données des 72 espèces aussi (`especes.js`). |
| 2026-10-21 | 1 | Le Grand Défilé est en ligne (`docs/royaume/`) : moteur toon avec contours, modèle 3D de dindie et portrait SVG depuis le même ADN, 72 espèces × 4 stades × chromatique, nouvelle Roullieee, Grand Livre avec filtres, défilé automatique. Tests : `royaume-outils/test-etape1.mjs` (576 dindies sans erreur, mémoire stable, 4 formats). Pas encore de bouton sur l’accueil du site (prévu à l’étape 9). |
