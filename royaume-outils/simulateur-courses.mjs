/* Le simulateur d'équilibrage des courses du Dindodrome (sans navigateur).
   Usage : node --experimental-default-type=module royaume-outils/simulateur-courses.mjs [nombre de courses] [experte] [chapitres]
   chapitres : « 4 » (par défaut : les championnats 1 à 4) ou « 5-7 » (les championnats 5 à 8).
   Pour quelques profils de joueuse typiques de ces chapitres, il fait courir chaque course des championnats
   (la joueuse ne fait rien de spécial, ou, avec « experte », elle saute toujours au bon moment)
   et affiche le pourcentage de victoires et de podiums, le temps moyen, et si la star de la course est devant. */
import { simuler } from '../docs/royaume/js/jeu/course.js';
import { defCourse, optionsCourse } from '../docs/royaume/js/jeu/dindodrome.js';
import { nouvelleDindie, stats } from '../docs/royaume/js/jeu/individus.js';
import { hasard } from '../docs/royaume/js/moteur/couleurs.js';

const entraine = (esp, niveau, talents, ent, comp = 'turbo') => () => { const d = nouvelleDindie(esp, { niveau, talents, caractere: 'calme', stade: 'eveille' }); d.entrainement = ent; d.competences = [comp]; return d; };
const PROFILS_57 = {
  'Cristal niv. 26 entraîné (8)': entraine('cristal', 26, [3, 3, 3], [8, 8, 8]),
  'Atomium niv. 30 entraîné (12)': entraine('atomium', 30, [3, 3, 3], [12, 12, 12]),
  'Jaguar niv. 30 entraîné (12)': entraine('jaguar', 30, [3, 3, 3], [12, 12, 12]),
  'Panthère niv. 32 entraînée (15)': entraine('panthere', 32, [4, 4, 4], [15, 15, 15]),
  'Orage niv. 35 entraîné (15)': entraine('orage', 35, [4, 4, 4], [15, 15, 15])
};
const COURSES_57 = ['c5a', 'c5b', 'c5c', 'c5f', 'c6a', 'c6b', 'c6c', 'c6f', 'c7a', 'c7b', 'c7c', 'c7f', 'c8a', 'c8b', 'c8c', 'c8f'];
const PROFILS_4 = {
  'Atomium niv. 20 éveillé': () => nouvelleDindie('atomium', { niveau: 20, talents: [2, 2, 2], caractere: 'calme', stade: 'eveille' }),
  'Glouglou niv. 20 éveillé': () => nouvelleDindie('glouglou', { niveau: 20, talents: [2, 2, 2], caractere: 'calme', stade: 'eveille' }),
  'Crachin niv. 14': () => nouvelleDindie('crachin', { niveau: 14, talents: [2, 3, 2], caractere: 'calme' }),
  'Atomium niv. 24 entraîné': () => { const d = nouvelleDindie('atomium', { niveau: 24, talents: [2, 2, 2], caractere: 'calme', stade: 'eveille' }); d.entrainement = [12, 10, 10]; d.competences = ['turbo']; return d; },
  'Belgicus niv. 22 entraîné': () => { const d = nouvelleDindie('belgicus', { niveau: 22, talents: [3, 3, 3], caractere: 'calme' }); d.entrainement = [10, 10, 10]; d.competences = ['turbo']; return d; }
};
const COURSES_4 = ['essai', 'c1a', 'c1b', 'c1c', 'c1f', 'gontran1', 'c2a', 'c2b', 'c2c', 'c2f', 'c3a', 'c3b', 'c3c', 'c3f', 'c4a', 'c4b', 'c4c', 'c4f', 'gontran2'];
const N = +process.argv[2] || 200, experte = process.argv.includes('experte'), ch57 = process.argv.includes('5-7');
const PROFILS = ch57 ? PROFILS_57 : PROFILS_4, COURSES = ch57 ? COURSES_57 : COURSES_4;
for (const [nom, f] of Object.entries(PROFILS)) {
  console.log(`\n== ${nom} (⚡/💪/🦘 ${stats(f()).join('/')})${experte ? ' · joueuse experte' : ''}`);
  for (const id of COURSES) {
    const def = defCourse(id); let p1 = 0, pod = 0, tps = 0, star = 0;
    for (let k = 0; k < N; k++) {
      const o = optionsCourse(def, f()); o.rng = hasard(id + k + nom);
      const C = simuler(o, { joueuseIA: true, experte });
      const R = C.coureurs.find(x => x.id === 'moi'), S = C.coureurs.find(x => x.id === 'star');
      if (R.place === 1) p1++; if (R.place <= 3) pod++; tps += R.temps; if (S && S.place < R.place) star++;
    }
    console.log(`${id.padEnd(9)} 1re ${String(Math.round(p1 / N * 100)).padStart(3)} %   podium ${String(Math.round(pod / N * 100)).padStart(3)} %   ${(tps / N).toFixed(1)} s${def.finale || def.rival ? `   la star devant : ${Math.round(star / N * 100)} %` : ''}`);
  }
}
