/* Le simulateur d'équilibrage des courses du Dindodrome (sans navigateur).
   Usage : node --experimental-default-type=module royaume-outils/simulateur-courses.mjs [nombre de courses] [experte]
   Pour quelques profils de joueuse typiques du chapitre 4, il fait courir chaque course des championnats
   (la joueuse ne fait rien de spécial, ou, avec « experte », elle saute toujours au bon moment)
   et affiche le pourcentage de victoires et de podiums, le temps moyen, et si la star de la course est devant. */
import { simuler } from '../docs/royaume/js/jeu/course.js';
import { defCourse, optionsCourse } from '../docs/royaume/js/jeu/dindodrome.js';
import { nouvelleDindie, stats } from '../docs/royaume/js/jeu/individus.js';
import { hasard } from '../docs/royaume/js/moteur/couleurs.js';

const PROFILS = {
  'Atomium niv. 20 éveillé': () => nouvelleDindie('atomium', { niveau: 20, talents: [2, 2, 2], caractere: 'calme', stade: 'eveille' }),
  'Glouglou niv. 20 éveillé': () => nouvelleDindie('glouglou', { niveau: 20, talents: [2, 2, 2], caractere: 'calme', stade: 'eveille' }),
  'Crachin niv. 14': () => nouvelleDindie('crachin', { niveau: 14, talents: [2, 3, 2], caractere: 'calme' }),
  'Atomium niv. 24 entraîné': () => { const d = nouvelleDindie('atomium', { niveau: 24, talents: [2, 2, 2], caractere: 'calme', stade: 'eveille' }); d.entrainement = [12, 10, 10]; d.competences = ['turbo']; return d; },
  'Belgicus niv. 22 entraîné': () => { const d = nouvelleDindie('belgicus', { niveau: 22, talents: [3, 3, 3], caractere: 'calme' }); d.entrainement = [10, 10, 10]; d.competences = ['turbo']; return d; }
};
const COURSES = ['essai', 'c1a', 'c1b', 'c1c', 'c1f', 'gontran1', 'c2a', 'c2b', 'c2c', 'c2f', 'c3a', 'c3b', 'c3c', 'c3f', 'c4a', 'c4b', 'c4c', 'c4f', 'gontran2'];
const N = +process.argv[2] || 200, experte = process.argv[3] === 'experte';
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
