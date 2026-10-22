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
  banane: { nom: 'Banane fondante', e: '🍌', desc: 'Le régal des dindies 🌴 Jungle.', prix: 15, prefere: 'jungle' },
  sorbet: { nom: 'Sorbet givré', e: '🍧', desc: 'Le régal des dindies ❄️ Glace.', prix: 15, prefere: 'glace' },
  piment: { nom: 'Piment doux', e: '🌶️', desc: 'Le régal des dindies 🔥 Feu.', prix: 15, prefere: 'feu' },
  myrtille: { nom: 'Myrtille de lune', e: '🫐', desc: 'Le régal des dindies 🌙 Nuit.', prix: 15, prefere: 'nuit' },
  barbeAPapa: { nom: 'Barbe à papa', e: '🍭', desc: 'Le régal des dindies ☁️ Ciel.', prix: 15, prefere: 'ciel' },
  graineMais: { nom: 'Maïs doré', e: '🌽', desc: 'Le régal des dindies rapides. Il servira à l’entraînement (bientôt !).', prix: 40, boutique: true },
  rubanBleu: { nom: 'Ruban bleu', e: '🎀', desc: 'Un joli ruban. Pour les défilés (bientôt !).', prix: 60, boutique: true },
  filetSolide: { nom: 'Filet solide', e: '🥅', desc: 'Un filet renforcé : la zone verte est 30 % plus grande.', prix: 250, filet: 1.3, important: true, boutique: e => fini(e, 'q10') && !e.inventaire.filetSolide },
  filetDore: { nom: 'Filet doré', e: '🥅', desc: 'Le filet des grandes exploratrices : la zone verte est 70 % plus grande !', prix: 600, filet: 1.7, important: true, boutique: e => fini(e, 'q13') && !e.inventaire.filetDore },
  chapeauSoleil: { nom: 'Chapeau de soleil', e: '👒', desc: 'Pour le Maroc imaginaire : sans lui, le Dindonus Mirageus n’est qu’un mirage !', prix: 180, important: true, boutique: e => fini(e, 'q11') && !e.inventaire.chapeauSoleil },
  parapluie: { nom: 'Parapluie', e: '☂️', desc: 'Pour la Belgique : le Dindonus Belgicus adore les parapluies.', prix: 220, important: true, boutique: e => fini(e, 'q14') && !e.inventaire.parapluie },
  oeufMystere: { nom: 'Œuf mystère', e: '🥚', desc: 'Il est tout chaud ! Mets-le dans une couveuse du Couvoir : qui sait ce qui en sortira ?' },
  oeufProfesseur: { nom: 'Œuf du Professeur', e: '🥚', desc: 'Un œuf tout doux, prêt à éclore. Mets-le dans une couveuse du Couvoir !', important: true },
  sablier: { nom: 'Sablier', e: '⏳', desc: 'Fait gagner 30 minutes à un œuf dans sa couveuse.' },
  biscuit: { nom: 'Biscuit de champion', e: '🍘', desc: 'Plein d’énergie : + 150 points d’expérience pour une dindie.', prix: 40, boutique: e => e.quete.finies.includes('q17') },
  kitConstruction: { nom: 'Kit de construction', e: '🧰', desc: 'Des planches, des clous, de la peinture : de quoi réparer un bâtiment du Domaine.', prix: 200, boutique: e => ['kitCouvoir', 'kitNurserie'].includes(e.quete.etape) && !e.inventaire.kitConstruction },
  pierreEveil: { nom: 'Pierre d’éveil', e: '💎', desc: 'Au Labo, elle éveille une dindie de niveau 20 : plus forte, et une toute nouvelle apparence !' },
  clous: { nom: 'Boîte de clous', e: '🔩', desc: 'De quoi réparer le Clapier à dindes.', prix: 80, boutique: e => e.quete.etape === 'clous' && !e.inventaire.clous },
  kitPlanches: { nom: 'Kit de planches', e: '🪵', desc: 'Tout ce qu’il faut pour construire un enclos.', prix: 150, boutique: e => e.quete.etape === 'kit' && !e.inventaire.kitPlanches },
  toile: { nom: 'Toile de montgolfière', e: '🧵', desc: 'Une toile solide pour réparer le ballon du Capitaine.', prix: 120, boutique: e => ['corde', 'toile'].includes(e.quete.etape) && !e.inventaire.toile },
  planche: { nom: 'Planche', e: '🪵', desc: 'Une planche trouvée dans le Domaine.', quete: true },
  corde: { nom: 'Grosse corde', e: '🪢', desc: 'La corde de la montgolfière.', quete: true },
  plumeRouge: { nom: 'Plume rouge', e: '🪶', desc: 'Une plume du Grand Dindon Coquelicot.', quete: true },
  bouleArgent: { nom: 'Boule d’argent', e: '🔘', desc: 'Une boule tombée de l’Atomium.', quete: true },
  grandLivre: { nom: 'Le Grand Livre', e: '📖', desc: 'Les 72 pages des dindies du Royaume. Touche 📖 pour l’ouvrir.', important: true },
  filet: { nom: 'Filet d’exploratrice', e: '🥅', desc: 'Pour attraper les dindies sauvages : gagne leur confiance, puis lance-le au bon moment !', filet: 1, important: true },
  billet: { nom: 'Billet de montgolfière', e: '🎫', desc: 'Le Capitaine Zéphyr t’emmène où tu veux, autant de fois que tu veux !', important: true }
};
export const enBoutique = (id, etat) => { const b = OBJETS[id].boutique; return typeof b === 'function' ? b(etat) : !!b; };
/* la friandise préférée d'un type */
export const friandisePreferee = type => Object.keys(OBJETS).find(id => OBJETS[id].prefere === type);
/* le meilleur filet du sac */
export const meilleurFilet = inv => ['filetDore', 'filetSolide', 'filet'].find(id => inv[id]) || null;
