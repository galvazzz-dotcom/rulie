/* ══════════ LES OBJETS ══════════
   boutique : vendu chez Mimi (true), ou seulement pendant une étape de quête (fonction) */
export const OBJETS = {
  friandise: { nom: 'Friandise', e: '🍪', desc: 'Une petite douceur. Ta dindie est contente (+ 15 de bonheur).', prix: 10, boutique: true },
  graineMais: { nom: 'Maïs doré', e: '🌽', desc: 'Le régal des dindies rapides. Il servira à l’entraînement (bientôt !).', prix: 40, boutique: true },
  rubanBleu: { nom: 'Ruban bleu', e: '🎀', desc: 'Un joli ruban. Pour les défilés (bientôt !).', prix: 60, boutique: true },
  clous: { nom: 'Boîte de clous', e: '🔩', desc: 'De quoi réparer le Clapier à dindes.', prix: 80, boutique: e => e.quete.etape === 'clous' && !e.inventaire.clous },
  kitPlanches: { nom: 'Kit de planches', e: '🪵', desc: 'Tout ce qu’il faut pour construire un enclos.', prix: 150, boutique: e => e.quete.etape === 'kit' && !e.inventaire.kitPlanches },
  toile: { nom: 'Toile de montgolfière', e: '🧵', desc: 'Une toile solide pour réparer le ballon du Capitaine.', prix: 120, boutique: e => ['corde', 'toile'].includes(e.quete.etape) && !e.inventaire.toile },
  planche: { nom: 'Planche', e: '🪵', desc: 'Une planche trouvée dans le Domaine.', quete: true },
  corde: { nom: 'Grosse corde', e: '🪢', desc: 'La corde de la montgolfière.', quete: true },
  grandLivre: { nom: 'Le Grand Livre', e: '📖', desc: 'Les 72 pages des dindies du Royaume. Touche 📖 pour l’ouvrir.', important: true },
  filet: { nom: 'Filet d’exploratrice', e: '🥅', desc: 'Pour attraper les dindies sauvages (au prochain chapitre !).', important: true },
  billet: { nom: 'Billet pour les Prés', e: '🎫', desc: 'Un voyage en montgolfière vers les Prés. Départ… bientôt !', important: true }
};
export const enBoutique = (id, etat) => { const b = OBJETS[id].boutique; return typeof b === 'function' ? b(etat) : !!b; };
