/* La partie complète (étape 9) : les tests des étapes 2 à 8 s'enchaînent sur UNE seule partie.
   Avec PARTIE=fichier.json (voir « tous-les-tests.mjs --partie »), chaque test reprend la vraie sauvegarde laissée par
   le test d'avant, au lieu de fabriquer la sienne ; il ne reçoit qu'un « coup de pouce » : ce qu'une joueuse aurait
   gagné en jouant entre deux chapitres (des pièces, des friandises, de l'expérience et de l'entraînement pour les
   dindies dont le test a besoin). À la fin, il laisse sa sauvegarde au test suivant. */
import { existsSync, readFileSync, writeFileSync } from 'fs';

export const PARTIE = process.env.PARTIE || '';
/* le test reprend-il une partie ? (le test du chapitre 1, lui, la commence) */
export const enPartie = () => !!PARTIE && existsSync(PARTIE);

/* reprendre la partie : la sauvegarde remplace celle du profil de test, puis le coup de pouce (une fonction jouée dans la page,
   qui peut utiliser window.__pouce(espece, réglages) : la meilleure dindie de l'espèce monte jusque-là, ou une nouvelle arrive) */
export async function reprendre(pg, coupDePouce = null, arg = null) {
  const json = readFileSync(PARTIE, 'utf8');
  await pg.evaluate(async j => {
    const J = window.__jeu, e = J.etat(), x = JSON.parse(j), { nouvelleDindie } = await import('./js/jeu/individus.js');
    for (const k of Object.keys(e)) delete e[k];
    /* (on repart du Domaine, en plein jour) */
    Object.assign(e, x); e.reglages.heure = 'jour'; e.monde.lieu = 'domaine';
    window.__pouce = (espece, o = {}) => {
      const E = J.etat(), L = E.dindies.filter(d => d.espece === espece && d.lieu !== 'mission').sort((a, b) => b.niveau - a.niveau);
      let d = L[0];
      if (!d) { d = nouvelleDindie(espece, { niveau: o.niveau || 10, stade: o.stade || 'adulte', talents: o.talents, caractere: o.caractere, origine: o.origine || 'croisement' }); d.lieu = o.lieu || 'clapier'; E.dindies.push(d); }
      if (o.niveau && d.niveau < o.niveau) { d.niveau = o.niveau; d.xp = 0; }
      if (o.stade && (o.stade === 'eveille' || d.stade === 'poussin' || d.stade === 'jeune')) { d.stade = o.stade; d.croissance = null; }
      if (o.talents) d.talents = d.talents.map((t, i) => Math.max(t, o.talents[i]));
      if (o.entrainement) d.entrainement = (d.entrainement || [0, 0, 0]).map((t, i) => Math.max(t, o.entrainement[i]));
      if (o.caractere) d.caractere = o.caractere;
      /* (une équipe a 6 places : la moins avancée retourne au Clapier pour lui faire de la place) */
      if (o.lieu === 'equipe' && d.lieu !== 'equipe') {
        const Q = E.dindies.filter(x => x.lieu === 'equipe');
        if (Q.length >= 6) Q.sort((a, b) => a.niveau - b.niveau)[0].lieu = 'clapier';
      }
      if (o.lieu) d.lieu = o.lieu;
      /* (elle devient la première de son espèce dans la liste : c'est elle que les tests trouvent) */
      const i = E.dindies.findIndex(x => x.espece === espece), j = E.dindies.indexOf(d);
      if (i < j) [E.dindies[i], E.dindies[j]] = [E.dindies[j], E.dindies[i]];
      E.livre.attrapes[espece] = E.livre.attrapes[espece] || Date.now(); E.livre.vus[espece] = E.livre.vus[espece] || Date.now();
      return d.uid;
    };
    /* des ressources : au moins autant (on n'enlève jamais rien) */
    window.__auMoins = (o = {}) => {
      const E = J.etat();
      if (o.pieces) E.pieces = Math.max(E.pieces, o.pieces);
      if (o.plumesOr) E.plumesOr = Math.max(E.plumesOr || 0, o.plumesOr);
      for (const [k, n] of Object.entries(o.inventaire || {})) E.inventaire[k] = Math.max(E.inventaire[k] || 0, n);
    };
  }, json);
  if (coupDePouce) await pg.evaluate(coupDePouce, arg);
  await pg.evaluate(() => window.__jeu.sauver());
}

/* laisser la partie au test suivant */
export async function laisser(pg) {
  if (!PARTIE) return;
  writeFileSync(PARTIE, await pg.evaluate(() => JSON.stringify(window.__jeu.etat())));
}
