/* ══════════ LES OBJETS ══════════
   boutique : vendu chez Mimi (true), ou seulement à partir d'un moment de l'histoire (fonction)
   prefere  : la friandise préférée des dindies de ce type (leur confiance monte deux fois plus vite)
   filet    : la force d'un filet (la zone verte est plus grande) */
const fini = (e, q) => e.quete.finies.includes(q);
export const OBJETS = {
  friandise: { nom: 'Friandise', e: '🍪', desc: 'Une petite douceur : ta dindie est contente (+ 15 de bonheur), et une dindie sauvage te fait un peu plus confiance.', prix: 10, boutique: true },
  trefleSucre: { nom: 'Trèfle sucré', e: '🍀', desc: 'Le régal des dindies 🌿 Prairie : leur confiance monte deux fois plus vite.', prix: 15, prefere: 'prairie', boutique: e => fini(e, 'q8') },
  miel: { nom: 'Miel des dunes', e: '🍯', desc: 'Le régal des dindies 🏜️ Sable : leur confiance monte deux fois plus vite.', prix: 15, prefere: 'sable', boutique: e => fini(e, 'q12') },
  gaufre: { nom: 'Gaufre de Liège', e: '🧇', desc: 'Le régal des dindies 💧 Pluie : leur confiance monte deux fois plus vite.', prix: 15, prefere: 'pluie', boutique: e => fini(e, 'q15') },
  banane: { nom: 'Banane fondante', e: '🍌', desc: 'Le régal des dindies 🌴 Jungle : leur confiance monte deux fois plus vite.', prix: 15, prefere: 'jungle', boutique: e => fini(e, 'q31') },
  sorbet: { nom: 'Sorbet givré', e: '🍧', desc: 'Le régal des dindies ❄️ Glace : leur confiance monte deux fois plus vite.', prix: 15, prefere: 'glace', boutique: e => fini(e, 'q35') },
  piment: { nom: 'Piment doux', e: '🌶️', desc: 'Le régal des dindies 🔥 Feu : leur confiance monte deux fois plus vite.', prix: 15, prefere: 'feu', boutique: e => fini(e, 'q39') },
  myrtille: { nom: 'Myrtille de lune', e: '🫐', desc: 'Le régal des dindies 🌙 Nuit : leur confiance monte deux fois plus vite.', prix: 15, prefere: 'nuit', boutique: e => fini(e, 'q43') },
  barbeAPapa: { nom: 'Barbe à papa', e: '🍭', desc: 'Le régal des dindies ☁️ Ciel : leur confiance monte deux fois plus vite.', prix: 15, prefere: 'ciel', boutique: e => fini(e, 'q47') },
  graineMais: { nom: 'Maïs doré', e: '🌽', desc: 'Donné avant un entraînement chez Coach Ginette : 1 point d’entraînement en plus !', prix: 40, boutique: true },
  /* ── le Potager (les graines chez Mimi, une fois le Potager réparé) et ses récoltes ── */
  grainesMais: { nom: 'Graines de maïs', e: '🌱', desc: 'À planter au Potager : du maïs en 5 minutes.', prix: 5, boutique: e => !!e.batiments.potager?.repare, graine: 'mais' },
  grainesBle: { nom: 'Graines de blé', e: '🌱', desc: 'À planter au Potager : du blé en 10 minutes.', prix: 8, boutique: e => !!e.batiments.potager?.repare, graine: 'ble' },
  grainesHaricot: { nom: 'Haricots sauteurs', e: '🌱', desc: 'À planter au Potager : des haricots en 15 minutes.', prix: 10, boutique: e => !!e.batiments.potager?.repare, graine: 'haricot' },
  grainesBaie: { nom: 'Graines de baie arc-en-ciel', e: '🌱', desc: 'À planter au Potager : des baies magiques en 1 heure.', prix: 25, boutique: e => !!e.batiments.potager?.repare, graine: 'baie' },
  mais: { nom: 'Épi de maïs', e: '🌽', desc: 'Une récolte du Potager. Au Moulin, il devient une galette de maïs ⚡.', recolte: true },
  ble: { nom: 'Gerbe de blé', e: '🌾', desc: 'Une récolte du Potager. Au Moulin, il devient du pain ou de la pâte à tarte.', recolte: true },
  haricot: { nom: 'Haricot sauteur', e: '🫘', desc: 'Une récolte du Potager : il saute tout seul ! Au Moulin, il devient un croquant 🦘.', recolte: true },
  baie: { nom: 'Baie arc-en-ciel', e: '🍇', desc: 'Une récolte rare du Potager. Au Moulin : tarte aux baies, ou gâteau d’amour.', recolte: true },
  /* ── les friandises du Moulin ── */
  galetteMais: { nom: 'Galette de maïs', e: '🫓', desc: 'Une friandise du Moulin : + 1 point d’entraînement ⚡ Vitesse (15 au plus), et de l’expérience.', moulin: { stat: 0 } },
  painBle: { nom: 'Petit pain au blé', e: '🥖', desc: 'Une friandise du Moulin : + 1 point d’entraînement 💪 Endurance (15 au plus), et de l’expérience.', moulin: { stat: 1 } },
  croquantHaricot: { nom: 'Croquant sauteur', e: '🥠', desc: 'Une friandise du Moulin : + 1 point d’entraînement 🦘 Saut (15 au plus), et de l’expérience.', moulin: { stat: 2 } },
  tarteBaies: { nom: 'Tarte aux baies', e: '🥧', desc: 'Une friandise du Moulin pleine de magie : + 300 points d’expérience !', moulin: { xp: 300 } },
  superFriandise: { nom: 'Super-friandise', e: '🍬', desc: 'Pour attraper une dindie sauvage : sa confiance monte presque autant qu’avec sa friandise préférée.' },
  gateauAmour: { nom: 'Gâteau d’amour', e: '🎂', desc: 'Au nid du Couvoir : un hybride (ou une recette secrète) a beaucoup plus de chances de naître !' },
  oeufEpique: { nom: 'Œuf épique', e: '🥚', desc: 'Un œuf violet tout brillant, rapporté d’une mission. Une dindie épique en sortira !' },
  rubanBleu: { nom: 'Ruban bleu', e: '🎀', desc: 'Un joli ruban. Pour les défilés (bientôt !).', prix: 60, boutique: true },
  filetSolide: { nom: 'Filet solide', e: '🥅', desc: 'Un filet renforcé : la zone verte est 30 % plus grande.', prix: 250, filet: 1.3, important: true, boutique: e => fini(e, 'q10') && !e.inventaire.filetSolide },
  filetDore: { nom: 'Filet doré', e: '🥅', desc: 'Le filet des grandes exploratrices : la zone verte est 70 % plus grande !', prix: 600, filet: 1.7, important: true, boutique: e => fini(e, 'q13') && !e.inventaire.filetDore },
  chapeauSoleil: { nom: 'Chapeau de soleil', e: '👒', desc: 'Pour le Maroc imaginaire : sans lui, le Dindonus Mirageus n’est qu’un mirage !', prix: 180, important: true, boutique: e => fini(e, 'q11') && !e.inventaire.chapeauSoleil },
  parapluie: { nom: 'Parapluie', e: '☂️', desc: 'Pour la Belgique : le Dindonus Belgicus adore les parapluies.', prix: 220, important: true, boutique: e => fini(e, 'q14') && !e.inventaire.parapluie },
  /* ── les équipements des îles 4 à 8 ── */
  jumelles: { nom: 'Jumelles', e: '🔭', desc: 'Pour la Jungle : avec elles, on repère la Dindoliane tout en haut des arbres.', prix: 300, important: true, boutique: e => fini(e, 'q30') && !e.inventaire.jumelles },
  moufles: { nom: 'Moufles', e: '🧤', desc: 'Pour la Banquise : la Dindaurore ne se laisse approcher que par des mains bien au chaud.', prix: 350, important: true, boutique: e => fini(e, 'q34') && !e.inventaire.moufles },
  bottesLave: { nom: 'Bottes de lave', e: '🥾', desc: 'Pour le Volcan : on peut marcher près de la coulée, là où vit le Dindofeu.', prix: 400, important: true, boutique: e => fini(e, 'q38') && !e.inventaire.bottesLave },
  lanterne: { nom: 'Lanterne', e: '🏮', desc: 'Pour la Forêt de la Lune : sa lumière attire la Dindoluciole.', prix: 450, important: true, boutique: e => fini(e, 'q42') && !e.inventaire.lanterne },
  ailes: { nom: 'Ailes de planeur', e: '🪁', desc: 'Pour le Royaume des Nuages : on plane jusqu’à l’arc-en-ciel, où vole le Dindarc.', prix: 500, important: true, boutique: e => fini(e, 'q46') && !e.inventaire.ailes },
  oeufMystere: { nom: 'Œuf mystère', e: '🥚', desc: 'Il est tout chaud ! Mets-le dans une couveuse du Couvoir : qui sait ce qui en sortira ?' },
  oeufProfesseur: { nom: 'Œuf du Professeur', e: '🥚', desc: 'Un œuf tout doux, prêt à éclore. Mets-le dans une couveuse du Couvoir !', important: true },
  sablier: { nom: 'Sablier', e: '⏳', desc: 'Fait gagner 30 minutes à un œuf dans sa couveuse.' },
  biscuit: { nom: 'Biscuit de champion', e: '🍘', desc: 'Plein d’énergie : + 150 points d’expérience pour une dindie.', prix: 40, boutique: e => e.quete.finies.includes('q17') },
  kitConstruction: { nom: 'Kit de construction', e: '🧰', desc: 'Des planches, des clous, de la peinture : de quoi réparer un bâtiment du Domaine.', prix: 200, boutique: e => ['kitCouvoir', 'kitNurserie', 'kitEntrainement'].includes(e.quete.etape) && !e.inventaire.kitConstruction },
  pierreEveil: { nom: 'Pierre d’éveil', e: '💎', desc: 'Au Labo, elle éveille une dindie de niveau 20 : plus forte, et une toute nouvelle apparence !' },
  clous: { nom: 'Boîte de clous', e: '🔩', desc: 'De quoi réparer le Clapier à dindes.', prix: 80, boutique: e => e.quete.etape === 'clous' && !e.inventaire.clous },
  kitPlanches: { nom: 'Kit de planches', e: '🪵', desc: 'Tout ce qu’il faut pour construire un enclos.', prix: 150, boutique: e => e.quete.etape === 'kit' && !e.inventaire.kitPlanches },
  toile: { nom: 'Toile de montgolfière', e: '🧵', desc: 'Une toile solide pour réparer le ballon du Capitaine.', prix: 120, boutique: e => ['corde', 'toile'].includes(e.quete.etape) && !e.inventaire.toile },
  planche: { nom: 'Planche', e: '🪵', desc: 'Une planche trouvée dans le Domaine.', quete: true },
  corde: { nom: 'Grosse corde', e: '🪢', desc: 'La corde de la montgolfière.', quete: true },
  plumeRouge: { nom: 'Plume rouge', e: '🪶', desc: 'Une plume du Grand Dindon Coquelicot.', quete: true },
  bouleArgent: { nom: 'Boule d’argent', e: '🔘', desc: 'Une boule tombée de l’Atomium.', quete: true },
  /* les objets des légendes des îles 4 à 8 (3 par île, pour que l'épique se montre) */
  statuette: { nom: 'Statuette d’or', e: '🏺', desc: 'Une statuette du temple perdu de la Jungle.', quete: true },
  etoileGlace: { nom: 'Étoile de glace', e: '❄️', desc: 'Une étoile qui ne fond jamais, tombée sur la Banquise.', quete: true },
  pierreLave: { nom: 'Pierre de lave', e: '🪨', desc: 'Une pierre encore toute chaude, venue du Volcan.', quete: true },
  eclatLune: { nom: 'Éclat de lune', e: '🌙', desc: 'Un petit morceau de lune, tombé dans la Forêt.', quete: true },
  plumeEclair: { nom: 'Plume d’éclair', e: '⚡', desc: 'Une plume qui crépite, venue d’un nuage d’orage.', quete: true },
  /* les grandes quêtes des mythiques : 3 fragments, puis l'objet légendaire */
  graineAncienne: { nom: 'Graine ancienne', e: '🌾', desc: 'Une graine du jardin oublié, vieille de mille ans.', quete: true },
  fragmentCarte: { nom: 'Morceau de carte', e: '🗺️', desc: 'Un morceau de la carte des mille et une dunes.', quete: true },
  cleCanal: { nom: 'Clé rouillée', e: '🗝️', desc: 'Une vieille clé repêchée dans les canaux.', quete: true },
  masqueJade: { nom: 'Masque de jade', e: '🎭', desc: 'Un masque vert du temple perdu.', quete: true },
  eclatGlace: { nom: 'Éclat de glace bleue', e: '🧊', desc: 'Un éclat de la nuit polaire, bleu comme une aurore.', quete: true },
  goutteFeu: { nom: 'Goutte de feu', e: '🔶', desc: 'Une goutte du cœur du volcan : elle brille sans brûler.', quete: true },
  noteMusique: { nom: 'Note de musique', e: '🎶', desc: 'Une note envolée de la harpe du palais des nuages.', quete: true },
  graineOr: { nom: 'Graine d’or', e: '🌰', desc: 'Au nid du Couvoir, le matin, avec un Grand Dindon Coquelicot et une Dindamanite… une légende peut naître !', important: true, legendaire: 'florissima' },
  lampe: { nom: 'Lampe merveilleuse', e: '🪔', desc: 'Au nid du Couvoir, avec une Dinde D’Inde Dingue et un Dindotapis Volant… une légende peut naître !', important: true, legendaire: 'dindabad' },
  couronne: { nom: 'Couronne des canaux', e: '👑', desc: 'Au nid du Couvoir, quand il pleut sur la Belgique, avec un Dindonus Atomium et un Dindonus Frites-Fluo… une légende peut naître !', important: true, legendaire: 'belgarum' },
  plumeQuetzal: { nom: 'Plume de quetzal', e: '🦚', desc: 'Au nid du Couvoir, avec un Dindojaguar et un Dindodragon… une légende peut naître !', important: true, legendaire: 'quetzaldinde' },
  eclatAurore: { nom: 'Éclat d’aurore', e: '💠', desc: 'Au nid du Couvoir, la nuit, avec un Dindocristal et un Dindoyéti… une légende peut naître !', important: true, legendaire: 'borealis' },
  braiseEternelle: { nom: 'Braise éternelle', e: '🔥', desc: 'Au nid du Couvoir, au lever du soleil (le matin), avec un Dindomagma et un Dindocomète… une légende peut naître !', important: true, legendaire: 'phenix' },
  harpe: { nom: 'Harpe des nuages', e: '🎼', desc: 'Au nid du Couvoir, avec un Dindorage et une Dindogalaxie… une légende peut naître !', important: true, legendaire: 'celestia' },
  /* le chapitre 8 : la plume du Dindromakus (éteinte depuis le prologue), puis rallumée à la pleine lune */
  plumeEteinte: { nom: 'Plume éteinte', e: '🪶', desc: 'La plume que le Dindromakus a laissée tomber, la nuit de pleine lune. Elle est toute grise… On dit qu’elle se rallume pour une grande championne, sous la pleine lune.', important: true },
  plumeArcEnCiel: { nom: 'Plume arc-en-ciel', e: '🌈', desc: 'Elle brille de toutes les couleurs ! Au nid du Couvoir, avec une Dindétoile et Célestia Dindissima, elle fait venir une nuit de pleine lune… et la légende des légendes.', important: true, legendaire: 'ruuulius' },
  grandLivre: { nom: 'Le Grand Livre', e: '📖', desc: 'Les 72 pages des dindies du Royaume. Touche 📖 pour l’ouvrir.', important: true },
  filet: { nom: 'Filet d’exploratrice', e: '🥅', desc: 'Pour attraper les dindies sauvages : gagne leur confiance, puis lance-le au bon moment !', filet: 1, important: true },
  billet: { nom: 'Billet de montgolfière', e: '🎫', desc: 'Le Capitaine Zéphyr t’emmène où tu veux, autant de fois que tu veux !', important: true }
};
export const enBoutique = (id, etat) => { const b = OBJETS[id].boutique; return typeof b === 'function' ? b(etat) : !!b; };
/* la friandise préférée d'un type */
export const friandisePreferee = type => Object.keys(OBJETS).find(id => OBJETS[id].prefere === type);
/* le meilleur filet du sac */
export const meilleurFilet = inv => ['filetDore', 'filetSolide', 'filet'].find(id => inv[id]) || null;
