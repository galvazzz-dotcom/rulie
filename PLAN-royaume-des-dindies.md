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
- Les rares demandent l’équipement de la région. Sans lui, elles ne sont qu’un **mirage** : elles clignotent et s’effacent quand on approche.
- Les épiques apparaissent après la **piste de leur légende** (une petite quête du guide de l’île : 3 plumes rouges, 3 lanternes, 3 boules d’argent…), et sous une condition : le matin, la nuit, la pluie…
- Le **jour et la nuit suivent l’heure réelle**. La **météo** change toutes les heures, calculée d’après la date pour être la même pour tout le monde.
- Pour que personne ne reste bloqué, chaque île a son **gadget** qui fait venir la condition pendant 10 minutes : le coq de Gaston (le matin), le cadran magique (la nuit), la bouteille à nuages (la pluie).
- Chaque île a son **guide** : Gaston le berger (les Prés), Leïla des Dunes (le Maroc imaginaire), Monsieur Waffel (la Belgique). Une fois sa quête finie, il offre chaque jour 2 friandises préférées de son type.

**Attraper une dindie :**
1. On touche la dindie : Roullieee s’approche toute seule, sur la pointe des pieds. La dindie, curieuse, la regarde.
2. On lance des friandises : la **jauge de confiance** se remplit, deux fois plus vite avec sa friandise préférée (une par type : trèfle sucré 🌿, miel des dunes 🏜️, gaufre de Liège 💧…). Sans friandise, on peut toujours lui parler doucement (🤲), plus lentement.
3. On lance le **filet** quand le cercle qui rétrécit est dans la zone verte.

- **La zone verte** grandit avec la confiance, et dépend de la rareté (commune ×1, rare ×0,8, épique ×0,62) et du filet (simple ×1, solide ×1,3, doré ×1,7). En mode aide, elle est 1,5 fois plus grande. Le cercle va un peu plus vite pour les rares et les épiques.
- **La prime du Grand Livre :** chaque nouvelle espèce attrapée rapporte 50 pièces.
- **Si on rate,** la dindie fait un bond, la confiance baisse de 30 %, et on réessaie. Après 3 ratés, elle part, et revient plus tard.

**Trouvés en chemin :** chaque jour, dans chaque île, 3 coffres (pièces, parfois des friandises), souvent un œuf mystère, parfois une pierre d’éveil, cachés à des endroits tirés d’après la date ; et les objets de quête.

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
On met **deux adultes** dans le nid du Couvoir. Un œuf apparaît et part dans une des **2 couveuses**. Ensuite, les deux parents se reposent **10 minutes**.

| Résultat | Chance |
|---|---|
| Hybride de **mélange de types** (un type de chaque parent) | rare 30 %, épique 15 % ; l’épique demande un parent épique, ou deux parents de niveau 20 ou plus |
| **Recette spéciale** (deux espèces précises) | 25 % |
| **Mythique** (deux espèces précises, l’objet de la grande quête et la condition remplie) | 100 %, c’est une récompense de quête |
| Sinon | l’espèce de la mère ou du père, à 50/50 |

- **Le tout premier croisement de deux types différents** donne toujours un hybride (pour que la découverte arrive tout de suite).
- **Les bonus :** le Gâteau d’amour (+10 %) et le Couvoir de niveau 3 ou plus (+5 %).
- **Les chromatiques ✨ :** 1 chance sur 64 à chaque œuf ; elles ont leur marque dans le Grand Livre.
- **Le Grand Livre aide :** les espèces pas encore trouvées sont des silhouettes « ? » avec un indice, par exemple « un parent 🔥, un parent ❄️ ».

### 7.2 Les minuteurs (en temps réel, même jeu fermé)

| Œuf | Durée |
|---|---|
| Commune | 5 min |
| Rare | 20 min |
| Épique | 1 h |
| Mythique | 4 h |
| Le premier œuf du tutoriel | 30 s |

- **La Nurserie** (6 places) : de poussin à jeune en 10 min, de jeune à adulte en 30 min. Chaque repas fait gagner 3 minutes. Les bébés ne vont ni en équipe ni dans les enclos.
- **Le Sablier**, un objet gagné en jouant, fait gagner 30 minutes. En mode aide, les durées sont divisées par 2.

### 7.3 Les niveaux, les talents, les caractères
- **Le niveau** va de 1 à 50. L’expérience vient des friandises (20, ou 35 pour la friandise préférée), des **biscuits de champion** 🍘 (150), des captures (25 pour l’équipe, 50 pour la compagne), des promenades avec la compagne (10 tous les 40 m), et plus tard des courses, de l’entraînement et des missions.
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
- **L’éveil :** au niveau 20, au Labo, avec une pierre d’éveil 💎 (une seule sorte de pierre, trouvée dans les îles). La dindie gagne +1 à chaque stat de base (10 au maximum) et une nouvelle apparence ; la place de compétence en plus arrivera avec les compétences (étape 5).

### 7.4 Les compétences de course (20)
Chaque espèce a une compétence liée à son type (deux possibles par type, selon l’espèce ; les mythiques ont l’Arc-en-ciel). Coach Ginette en apprend une deuxième (la première leçon est offerte, puis 200 🪙), et une troisième après l’éveil. On peut en oublier une pour en apprendre une autre.

**Ce que Ginette enseigne :** Turbo-Glou, Départ canon, Sprint final, Second souffle, Aspiration, Esquive, Cri d’encouragement, Coup de vent, Pluie de plumes, Saut de crapaud.

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
- **le terrain :** +8 % sur la piste de son type, −8 % sur la piste du type opposé (pas de malus en mode aide) ; les zones de sable ou de boue ralentissent tout le monde (− 15 %), sauf avec une compétence de glisse ;
- **les compétences**, avec un temps de recharge.

**Les règles (étape 5, réglées avec le simulateur) :**
- vitesse de pointe `9 + 0,2 × ⚡` m/s, endurance `55 + 1,8 × 💪`, « forme du jour » ± 2,5 % ;
- la fatigue dépend de l’allure (puissance 4) : chaque dindie règle son effort pour tenir jusqu’au bout, et accélère dans les derniers 15 % s’il lui reste des forces ;
- les haies : la joueuse touche 🦘 quand l’anneau devient vert (saut parfait : un petit élan) ; trop tôt, c’est la chute (environ 1 s perdue) ; si elle ne touche rien, la dindie saute toute seule, avec une chance de réussite qui dépend de son 🦘 ;
- « 🔥 Fonce ! » : plus vite, mais beaucoup plus fatigant ; ⏩ accélère l’affichage ;
- en mode aide : pas de chute, les compétences partent toutes seules, pas de malus de terrain.

**La piste du Dindodrome** est un anneau de 200 m (6 couloirs, deux lignes droites et deux virages), avec la ligne d’arrivée sous un portique devant la grande tribune. Les pistes de type changent la couleur du sol, les obstacles (haies, bottes de foin, dunes, troncs) et le décor.

**Les sortes de courses :** essai (300 m), sprint (400 m), haies (600 m), marathon (1 000 m, 5 tours), piste de type (500 m), relais à 3 dindies (3 × 400 m, plus tard), et les 8 pistes de type (Prés, Dunes, Boue, Lianes, Glace, Lave, Nuit, Nuages). Les courses libres, contre des dindies de son niveau, rapportent de l’expérience et des pièces.

**Les 8 championnats :** chacun a 3 courses (il faut finir sur le podium), puis une finale contre le champion (il faut gagner), qui donne le badge, des pièces, des plumes d’or et des biscuits. Les adversaires vont du niveau 8 (championnat 1) au niveau 40 (championnat 8). Les 4 premiers (étape 5) : la Coupe des Prés (Gaston, son Trèfle Clochette, niv. 12), la Coupe des Dunes (Leïla, sa Dinde Dingue Sultane, niv. 13), la Coupe de la Pluie (Monsieur Waffel, son Belgicus Speculoos, niv. 21) et la Coupe des Lianes (Tarzanette, venue de la Jungle avec son jaguar Moustique, niv. 20). La finale se court sur la piste du type du champion.

**Le terrain d’entraînement** (Coach Ginette, au Domaine) : 3 petits jeux, un par stat — le sprint des petits pas ⚡ (taper à gauche et à droite le plus vite possible), le souffle régulier 💪 (taper quand la bulle touche l’anneau), les haies de Ginette 🦘 (sauter au bon moment). Chaque partie donne 1 à 3 points d’entraînement (15 au plus par stat ; un maïs doré en donne 1 de plus) et de l’expérience.

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

**Ce qui est en place (étape 6) :**
- **Les réparations :** le Potager (300 🪙), le Moulin (400 🪙), l’Atelier des plumes (500 🪙), le Bureau des missions (400 🪙) ; un nouvel habitat coûte 400 🪙. Tout s’ouvre quand le chapitre 4 est fini.
- **Le Potager :** 4 parcelles (jusqu’à 12 en l’améliorant). Les graines se vendent par 5 chez Mimi (maïs 5 🪙, blé 8 🪙, haricot 10 🪙, baie 25 🪙). On peut **arroser** une fois : la plante pousse un quart plus vite et donne une récolte de plus. Une récolte donne 2 à 3 épis, gerbes ou haricots (1 à 2 baies), et parfois une graine en plus. Tout pousse en temps réel, même jeu fermé.
- **Le Moulin :** galette de maïs (2 🌽), petit pain (2 🌾), croquant sauteur (2 🫘) : + 1 point d’entraînement dans une stat (15 au plus) ; tarte aux baies (1 🍇 + 1 🌾) : + 300 XP ; super-friandise (🌽 🌾 🫘) : la confiance monte presque comme avec la friandise préférée ; Gâteau d’amour (2 🍇, 1 🌾, 1 🌽) : au nid, la recette secrète passe à 50 % et les hybrides deux fois plus souvent.
- **Les plumes :** chaque adulte d’un enclos en laisse une fois par jour (1 commune, 2 rare, 3 épique, 5 mythique, + 1 si son bonheur dépasse 80) ; la toute première fois, 6 plumes en cadeau. On les voit en petit tas dans l’enclos.
- **L’Atelier :** 30 chapeaux (10 formes : fête, nœud, béret, bonnet, casquette, couronne de fleurs, haut-de-forme, sombrero, cowboy, viking ; 3 coloris chacun, payés en plumes d’un type) et 50 décorations (massifs, fanions et statues des 8 types, arbres, bancs, lampadaire, lampions, fontaine, puits, kiosque, arche, balançoire, nichoir, épouvantail, petit moulin, ballons, citrouilles, bonhomme de neige, rocher, mare, parasol, haies, barrières, dalles). Une dindie adulte porte un chapeau (on le voit en 3D et sur son portrait).
- **La décoration :** le mode 🎨 Décorer pose jusqu’à 60 décorations librement (pas dans un bâtiment, un enclos, l’eau, ni devant une porte) ; on les tourne, les déplace ou les range. Celles qui « bloquent » bouchent la carte, et la libèrent quand on les range.
- **Le Bureau des missions :** 4 missions proposées (12 modèles, de 15 min à 8 h), 1 à 3 adultes par mission. La chance de réussite = la stat demandée (+ 12 avec le bon type), comparée à ce que demande la mission (10 % à 97 %). Réussie : des pièces (40 à 550), des plumes, une surprise (friandises, graines, sablier, biscuit, œuf mystère, et parfois un **œuf épique** au-delà de 4 h). Ratée : 30 % des pièces, la moitié de l’expérience. Les dindies parties ne peuvent pas être déplacées, et rentrent chez elles.
- **Les améliorations :** enclos (2 → 10 places, niveaux 1 à 5), Clapier (1 → 10 rangées), Couvoir (2 → 4 couveuses), Nurserie (6 → 10 places), Potager (4 → 12 parcelles), Bureau (1 → 3 missions à la fois). Les plus grandes demandent des plumes d’or.
- **Rendre à la nature :** jamais la toute première dindie ; une commune laisse 3 plumes, une rare 6, une épique 12, une mythique 20 (+ 10 si elle est chromatique) ; son chapeau revient au stock, et elle reste dans le Grand Livre.

## 10. Les quêtes et la durée de vie

**L’histoire en 8 chapitres** (environ 60 quêtes) :
1. *Le Domaine en ruine* (7 quêtes) : tutoriel, le premier enclos, le Clapier, la montgolfière.
2. *L’expédition* (10 quêtes) : la carte du monde, les Prés, le Maroc imaginaire et la Belgique, les 12 premières espèces sauvages, le chapeau de soleil et le parapluie, les légendes du Coquelicot, de la Dinde Dingue et de l’Atomium.
3. *Le premier œuf* (5 quêtes) : le Couvoir (kit de construction), l’œuf du Professeur, la Nurserie, le premier croisement (un hybride), l’éveil au Labo.
4. *Le Dindodrome ouvre* (8 quêtes) : le portail, la course d’essai avec Monsieur Chrono, le terrain d’entraînement, les championnats 1 à 4 (Tarzanette vient de la Jungle pour le 4e), deux défis de Gontran, une première leçon de compétence.
5. *Jungle et Banquise* : les régions 4 et 5, les championnats 5 et 6, l’Atelier des plumes, les missions.
6. *Volcan et Forêt de la Lune* : les régions 6 et 7, les championnats 6 et 7, l’éveil.
7. *Le Royaume des Nuages* : la région 8, le championnat 8, les mythiques.
8. *La Légende* : la Ligue des Légendes, la plume arc-en-ciel, le Dindromakus, la fin et le générique.

**Les autres activités :**
- environ 40 quêtes des habitants (les 7 premières, les « quêtes du Domaine », arrivent avec l’étape 6 : le Potager, le Moulin, l’Atelier des plumes, la décoration, le Bureau des missions, une amélioration, le Gâteau d’amour) ;
- 8 grandes quêtes de région, une par mythique ;
- 3 défis par jour et 3 par semaine ;
- **100 succès** ;
- la **collection** : 72 espèces, chacune en forme adulte et en forme éveillée, plus toutes les chromatiques ✨.

**Les événements selon la date :** Halloween, Noël, Pâques, l’été. Ils donnent des chapeaux et des décorations exclusives, et font apparaître plus souvent certaines espèces.

## 11. L’interface et les réglages

- **Le style :** bulles et boutons comme dans la ferme, polices *Lilita One* et *Fredoka*, cartes de couleur selon la rareté, et des retours vivants (rebonds, étincelles, confettis).
- **Le toucher :** on touche le sol pour marcher et on touche un bâtiment ou une dindie pour agir. Ça marche aussi à la souris et au clavier.
- **Le mode aide** (réglable par profil) : la voix lit tout, la capture est plus facile, les compétences sont automatiques, les minuteurs sont divisés par 2 et il n’y a pas de malus de terrain.
- **La musique :** de vrais morceaux libres (domaine public et CC BY-SA), un par lieu, le jour et la nuit, enchaînés avec un fondu. Les auteurs et les licences sont dans `docs/royaume/musique/CREDITS.md` et dans la maison (🎶 Crédits).
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
  index.html              la page du jeu (écran titre, puis le Domaine)
  defile.html             le Défilé des dindies débloquées d’un profil (étape 1, limité à l’étape 4)
  style.css, jeu.css
  js/main.js              démarrage, boucle, passage d'une scène à l'autre
  js/moteur/              rendu (toon, contours, ciel), formes, caméra, entrées, interface,
                          sons, voix, sauvegarde, temps (jour/nuit, météo, lune)
  js/dindies/             adn, modele (3D), portrait (SVG), elevage, stats
  js/donnees/             types, especes, regions (les 8 îles, qui y vit et quand),
                          courses, production (graines, recettes, 30 chapeaux, 50 décorations,
                          missions, améliorations)
  js/personnages/         chibi (modèle commun), roullieee, pnj
  js/monde/               carte (grille + A*), decor (île, eau, végétation, nuit),
                          batiments, domaine, ile (le sol des régions), nature, fabrique,
                          region (ce qui est commun aux îles), regions/pres, maroc, belgique
  js/jeu/                 etat, individus, objets, scenario (quêtes et dialogues),
                          sauvages (les apparitions), capture, trouvailles (coffres, œufs…),
                          elevage (œufs, croisements, minuteurs, croissance, expérience, éveil),
                          collection (les espèces débloquées de chaque profil),
                          course (la simulation d'une course), dindodrome (courses, gains, badges, leçons),
                          production (Potager, Moulin, plumes, Atelier, décoration, missions, améliorations,
                          rendre à la nature), quetesDomaine (les 7 quêtes du Domaine)
  js/ui/                  panneaux (Boutique, Labo, Livre, Musée, Fiche, Clapier…),
                          monde (la carte du monde, le voyage en montgolfière),
                          elevage (le Couvoir, la Nurserie, l’éclosion, l’éveil),
                          dindodrome (Bureau des courses, résultats, trophées),
                          entrainement (le terrain de Coach Ginette et ses 3 mini-jeux),
                          production (Potager, Moulin, Atelier, Bureau des missions, améliorations, chapeau)
  musique/                les musiques libres (MP3) et leurs crédits
  js/scenes/              titre, jeu (le Domaine et tous les lieux), defile (étape 1),
                          course (la course en 3D : caméra, interface, podium), decorer (le mode Décorer)
  js/monde/dindodrome.js  le Dindodrome (piste, tribunes, public, tableau, podium)
  js/monde/decorations.js les 50 décorations en 3D (et leur « fantôme » pour les poser)
royaume-outils/           les tests Playwright (test-etape1 à 6, et tous-les-tests.mjs qui les lance
                          tous avec un résumé), le simulateur d'équilibrage des courses
                          (simulateur-courses.mjs), le générateur du tableau des espèces
```

- **Des modules ES sans outil de construction :** Three.js 0.160.0 par carte d’import (jsdelivr), mis en ligne tel quel par GitHub Pages.
- **La sauvegarde :** `localStorage`, sous la clé `royaumeDindies.v1`, avec un numéro de version pour la migration.
- **Les tests :**
  - des parties jouées automatiquement par Playwright (comme pour la ferme), sur téléphone, téléphone couché, tablette et ordinateur ;
  - une vérification qu’il n’y a aucune erreur et que la mémoire reste stable ;
  - un **simulateur** qui joue des milliers de croisements et de courses pour régler la progression ;
  - **une seule commande** pour tout lancer : `node royaume-outils/tous-les-tests.mjs` (options : `--etapes=1,2,3,4,5,6`, `--formats=tel,paysage,tablette,ordi` ou `tous`, `--adresse=` pour tester le site en ligne, `--three=` pour un three.js local sans Internet). Elle sert `docs/` sur un petit serveur local, lance les tests l’un après l’autre et affiche un résumé (environ une heure pour tout).

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

### Étape 2 — Le Domaine ✅
- [x] La carte 3D du Domaine : zones, chemins, décors, jour et nuit.
- [x] Les déplacements de Roullieee et la caméra qui la suit.
- [x] La Maison (profils, sauvegarde, code), la Boutique, le Labo, 2 enclos et le Clapier.
- [x] Les PNJ, les dialogues, le journal des quêtes, et le chapitre 1 jusqu’au départ en montgolfière.
- [x] Le Grand Livre du jeu (silhouettes « ? », indices) et le Musée.
- [x] Des dindies de départ, offertes par le Professeur, qui vivent dans les enclos.
- **Fini quand :** on peut se promener dans le Domaine, ranger ses dindies, sauvegarder et reprendre.

### Étape 3 — L’expédition ✅
- [x] Le port, la montgolfière et la carte du monde.
- [x] Les régions 1 à 3 en 3D (Prés, Maroc imaginaire, Belgique).
- [x] Les apparitions (heure, météo), la capture (confiance et filet) et les équipements.
- [x] Les coffres, les œufs mystère et les pierres d’éveil.
- [x] En plus : le chapitre 2 (10 quêtes), les 3 guides, les gadgets des îles, et de vraies musiques libres.
- **Fini quand :** on peut attraper les 12 espèces sauvages des 3 premières régions.

### Étape 4 — L’élevage et l’évolution ✅
- [x] Le Couvoir (nid, 2 couveuses), les minuteurs en temps réel, la Nurserie.
- [x] Les niveaux, l’expérience, les talents, les caractères, la fiche complète.
- [x] Les croisements : mélanges de types, recettes spéciales, indices du Livre.
- [x] L’éveil au Labo et les chromatiques.
- [x] En plus : le chapitre 3 (5 quêtes), l’éclosion animée, les sabliers et les biscuits de champion, et le Défilé limité aux dindies débloquées (pas de « teaser » des 72).
- **Fini quand :** on peut obtenir des hybrides et faire évoluer une dindie.

### Étape 5 — Le Dindodrome ✅
- [x] La piste 3D, la simulation de course, les actions du joueur, les compétences.
- [x] Le terrain d’entraînement et ses 3 mini-jeux, et l’apprentissage des compétences.
- [x] Les championnats 1 à 4, les badges et Gontran.
- [x] En plus : le chapitre 4 (8 quêtes), Monsieur Chrono le présentateur, le public et le podium, la Salle des trophées et les records, les courses libres, deux musiques de course libres (orgue de foire), et le simulateur d’équilibrage dans les tests.
- **Fini quand :** on peut élever un champion et gagner 4 badges.

### Étape 6 — La production ✅
- [x] Le Potager, le Moulin, l’Atelier des plumes (chapeaux).
- [x] La décoration du Domaine et les améliorations des bâtiments.
- [x] Le Bureau des missions.
- [x] En plus : 7 « quêtes du Domaine » (des habitants) qui font découvrir tout cela après le chapitre 4, le mode 🎨 Décorer (poser, tourner, déplacer, ranger), les 10 formes de chapeaux en 3D et en portrait, le Gâteau d’amour au Couvoir, l’œuf épique, la super-friandise pour attraper, construire les 6 autres habitats, et « rendre à la nature ».
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
- [ ] La musique (les morceaux libres sont là depuis l’étape 3 ; il reste les pistes du Dindodrome et des îles 4 à 8), les cris de chaque espèce, les sons.
- [ ] Les tutoriels, le mode aide, l’accessibilité.
- [ ] Les performances sur téléphone, une partie complète testée automatiquement, et les 4 formats.
- [ ] Le site : la page publique « Le Grand Livre des Dindies » (le bouton sur l’accueil existe depuis l’étape 2, avec la mention « en développement »).
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
| 2026-10-21 | 2 | Le Domaine est jouable (`docs/royaume/index.html`) : écran titre avec 3 profils, prologue illustré, île 3D (eau, écume, chemins, arbres, fleurs, lampadaires, lucioles), jour et nuit à l’heure réelle (ou réglés), déplacements au toucher (A*), au joystick et au clavier, caméra qui suit, silhouette derrière les murs. Bâtiments : Maison, Labo, Boutique, Musée, 8 enclos (2 à réparer au chapitre 1), Clapier, porte du Dindodrome, port et montgolfière. 5 PNJ en chibi avec portraits SVG, dialogues, journal, carte, sac, fiche des dindies (stats et potentiel), Grand Livre avec silhouettes et indices. Chapitre 1 en 7 quêtes, jusqu’à la montgolfière réparée. Sauvegarde automatique, code de sauvegarde et fichier. Le Défilé passe sur `defile.html`. Bouton sur l’accueil du site, sous la ferme, avec « 🚧 En développement ». Tests : `royaume-outils/test-etape2.mjs` (chapitre 1 joué de bout en bout avec chaque starter, rechargement de la sauvegarde, aucune erreur) et `test-etape1.mjs` (toujours vert). |
| 2026-10-22 | 3 | L’expédition est jouable : le chapitre 2 en 10 quêtes. La carte du monde (8 îles, 3 ouvertes) et le voyage en montgolfière ; 3 îles en 3D construites à la demande et libérées au départ (mémoire stable) : les Prés (ferme de Gaston, moulin, mare, champ de coquelicots, jardin oublié), le Maroc imaginaire (dunes, ksar, souk et ses lanternes, oasis), la Belgique (canaux et ponts, Grand-Place, beffroi, maisons à pignons, Atomium). La météo par île et par heure (pluie, nuages, soleil). Les dindies sauvages (zones, heure, météo, équipement, mirages), la capture (friandises préférées, jauge de confiance, cercle et zone verte, 3 essais), la carte d’une dindie attrapée et la prime du Grand Livre. Les guides Gaston, Leïla et Monsieur Waffel ; les gadgets (le coq, le cadran magique, la bouteille à nuages) ; les coffres, œufs mystère et pierres d’éveil du jour ; filets solide et doré, chapeau de soleil, parapluie. De vraies musiques libres (0 A.D., OpenRCT2) à la place de la mélodie synthétisée. Les épiques ne dépendent plus des champions mais d’une petite quête de leur île. Les anciennes sauvegardes passent au chapitre 2. Tests : `royaume-outils/test-etape3.mjs` (les 12 espèces attrapées, gadgets, voyages, mémoire, sauvegarde) ; `test-etape1.mjs` et `test-etape2.mjs` toujours verts. |
| 2026-10-22 | 4 | L’élevage est jouable : le chapitre 3 en 5 quêtes. Le Couvoir (une hutte ronde, le nid et 2 couveuses sous cloche, les œufs visibles en 3D) et la Nurserie (une maison pastel, sa cour clôturée, son bac à sable et son toboggan, où jouent les bébés le jour) se réparent avec un kit de construction de Mimi. Les croisements (hybrides 30 % / 15 %, recettes 25 %, le premier hybride garanti), les minuteurs en temps réel même jeu fermé, le sablier, l’éclosion animée avec le prénom du bébé, les 3 stades (poussin, jeune, adulte) et les repas qui font grandir plus vite. L’expérience (friandises, biscuits de champion, captures, promenades) et les niveaux ; l’éveil au Labo au niveau 20 avec une pierre d’éveil ; les chromatiques (1 sur 64). Les œufs mystère trouvés dans les îles éclosent enfin. Le Défilé (écran titre et page du Défilé) ne montre plus que les dindies débloquées du profil. Les sauvegardes de l’étape 3 passent au chapitre 3. Tests : `royaume-outils/test-etape4.mjs` (chapitre 3 joué de bout en bout, 300 croisements, minuteurs, rechargement) ; `test-etape1.mjs` (avec le Défilé limité), `test-etape2.mjs` et `test-etape3.mjs` toujours verts. |
| 2026-10-22 | 5 | Le Dindodrome est ouvert : le chapitre 4 en 8 quêtes. Un nouveau lieu au bout de la route de l’est (on y entre par le portail, avec un fondu en damier) : une piste en anneau de 200 m à 6 couloirs, la grande tribune et son public qui s’agite, le portique de l’arrivée, le tableau d’affichage, le podium, le Bureau des courses de Monsieur Chrono (le présentateur) et la Salle des trophées. Les courses en 3D : 6 dindies, la caméra derrière la nôtre, le compte à rebours, le commentateur, les haies (l’anneau vert du bouton 🦘 pour un saut parfait), 20 compétences avec leur recharge, « 🔥 Fonce ! », ⏩, puis le podium et les résultats (gains, expérience, records). La simulation (vitesse, endurance et fatigue, sauts, terrain, zones de sable et de boue, compétences) est réglée avec un simulateur. Les 4 premiers championnats (Prés, Dunes, Pluie, Lianes : 3 courses sur le podium puis la finale), leurs badges, deux défis de Gontran, les courses libres. Le terrain d’entraînement de Coach Ginette au Domaine (3 mini-jeux, un par stat, et les leçons de compétences). Deux nouveaux personnages (Monsieur Chrono, Tarzanette) et trois musiques libres de plus (orgue de foire et ragtime, domaine public). La 3D se met en pause pendant les mini-jeux. Les sauvegardes de l’étape 4 passent au chapitre 4. Tests : `royaume-outils/test-etape5.mjs` (l’équilibre sur des centaines de courses simulées, puis les règles une par une — chute si l’on saute trop tôt, saut parfait, mode aide, « Fonce ! », les 20 compétences, leçon payante, finale perdue —, puis le chapitre 4 joué de bout en bout : 19 courses, les 3 mini-jeux, une leçon, la mémoire du Dindodrome, le rechargement), vert sur les 4 formats ; `test-etape1.mjs` à `test-etape4.mjs` toujours verts. Toute la série se lance avec `royaume-outils/tous-les-tests.mjs`. |
| 2026-10-22 | 6 | La production : le Domaine produit, se décore, et les missions rapportent. Quand le chapitre 4 est fini, 7 « quêtes du Domaine » (Mimi, le Professeur, le Capitaine) font découvrir : le **Potager** réparé (4 à 12 parcelles, maïs, blé, haricot sauteur et baie arc-en-ciel qui poussent en temps réel, l’arrosage, les plantes visibles en 3D), le **Moulin** et ses ailes qui tournent (6 recettes : galette, petit pain et croquant pour l’entraînement, tarte aux baies, super-friandise pour attraper, Gâteau d’amour pour les hybrides), les **plumes du jour** en petit tas dans les enclos, l’**Atelier des plumes** (30 chapeaux en 10 formes, portés en 3D et sur les portraits ; 50 décorations), le mode **🎨 Décorer** (poser, tourner, déplacer, ranger ; la carte se bouche et se libère), le **Bureau des missions** (12 modèles de 15 min à 8 h, 1 à 3 dindies, la chance selon les stats et le type, pièces, plumes, surprises, œuf épique ; le drapeau se lève, un « ! » quand elles rentrent), les **améliorations** (enclos, Clapier, Couvoir jusqu’à 4 couveuses, Nurserie, Potager, Bureau), les 6 autres habitats à construire, et **rendre à la nature**. Sauvegarde en version 5. Tests : `royaume-outils/test-etape6.mjs` (les règles une par une, les 7 quêtes jouées avec les fenêtres, la mémoire, la sauvegarde) sur les 4 formats ; la série complète (`tous-les-tests.mjs`, étapes 1 à 6) reste verte. |
