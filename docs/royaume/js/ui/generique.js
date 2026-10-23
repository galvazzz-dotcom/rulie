/* ══════════ LE GÉNÉRIQUE DE FIN ══════════
   Après la naissance du Dindromakus (chapitre 8) : le générique défile tout seul (on peut le passer).
   Les personnages, les dindies du Grand Livre, la partie de la joueuse, les musiques libres, et ce qui reste à faire.
   ouvrirGenerique() → Promise (quand on le ferme). On peut le revoir depuis la Maison. */
import { ESPECES, PAR_ID } from '../donnees/especes.js';
import { variante } from '../dindies/adn.js';
import { portraitDindie } from '../dindies/portrait.js';
import { PERSONNAGES, portraitChibi } from '../personnages/chibi.js';
import { el, $, echapper } from '../moteur/ui.js';
import { pop, tada, glouglou, ambianceMusique } from '../moteur/sons.js';
import * as J from '../jeu/etat.js';

const ROLES = [
  ['roullieee', 'l’exploratrice'], ['plumeau', 'le savant du Labo'], ['mimi', 'la marchande'], ['zephyr', 'le pilote de la montgolfière'], ['ginette', 'la coach'],
  ['chrono', 'le présentateur'], ['gontran', 'le rival (et l’ami)'],
  ['gaston', 'les Prés'], ['leila', 'le Maroc imaginaire'], ['waffel', 'la Belgique'], ['tarzanette', 'la Jungle'], ['inuk', 'la Banquise'], ['lava', 'le Volcan'], ['hibou', 'la Forêt de la Lune'], ['azur', 'le Royaume des Nuages'],
  ['plumeline', 'les Quatre Plumes'], ['dindini', 'les Quatre Plumes'], ['mamie', 'les Quatre Plumes'], ['rapido', 'les Quatre Plumes']
];
const MUSIQUES = [
  ['Searchlight Rag', 'Scott Joplin (1907)'], ['Something Doing Rag', 'Scott Joplin et Scott Hayden (1903)'], ['El Capitan', 'John Philip Sousa (1896)'],
  ['Unter dem Doppeladler', 'Josef Franz Wagner (1893)'], ['Das Alpenhorn', 'air traditionnel'],
  ['(versions du projet OpenRCT2 OpenMusic, domaine public)', ''],
  ['Harvest Festival, Albian Nocturne, Solstice Festival, Mountain Idyll, Peaks of Atlas, Mirage, Water’s Edge', 'Omri Lahav, pour le jeu libre 0 A.D. (© Wildfire Games, licence CC BY-SA 3.0)']
];

let n = 0;
export function ouvrirGenerique() {
  return new Promise(resoudre => {
    const e = J.etat(), A = e.livre.attrapes, L = ESPECES.filter(x => A[x.id]);
    const duree = Math.round((e.stats?.tempsJeu || 0) / 60);
    const D = portraitDindie(variante(PAR_ID.ruuulius), { id: 'genD' + (n++) });
    const V = el(`<div id="generique"><div class="genCiel"></div><div class="genDefile">
      <div class="genBloc genTitre"><div class="genLegende">${D}</div><h1>🌈 Le Royaume des Dindies 🌈</h1><p>Une aventure de <b>${echapper(e.profil?.nom || 'Roullieee')}</b> et de Roullieee, l’exploratrice des dindies imaginaires</p></div>
      <div class="genBloc"><h2>Avec</h2><div class="genPersos">${ROLES.map(([id, role]) => `<div class="genPerso"><div class="genPortrait">${portraitChibi(PERSONNAGES[id], 'gen' + id + (n++))}</div><b>${PERSONNAGES[id].nom}</b><small>${role}</small></div>`).join('')}</div></div>
      <div class="genBloc"><h2>Les dindies de ton Grand Livre</h2><p>${L.length} espèce${L.length > 1 ? 's' : ''} sur 72</p>
        <div class="genDindies">${L.map(x => `<div class="genDindie" title="${x.nom}">${portraitDindie(variante(x), { id: 'genE' + x.id + (n++) })}</div>`).join('')}</div></div>
      <div class="genBloc"><h2>Ta partie</h2><p>🏆 ${e.courses?.badges?.length || 0} badges · 🏁 ${e.courses?.faites || 0} courses · 🥚 ${e.elevage?.eclosions || 0} éclosions · 🦃 ${e.dindies.length} dindies${duree ? ` · ⏱️ ${duree >= 60 ? Math.floor(duree / 60) + ' h ' + String(duree % 60).padStart(2, '0') : duree + ' min'} de jeu` : ''}</p></div>
      <div class="genBloc"><h2>Les musiques</h2>${MUSIQUES.map(([m, a]) => `<p><b>${m}</b>${a ? `<br><small>${a}</small>` : ''}</p>`).join('')}</div>
      <div class="genBloc"><h2>Fabriqué avec</h2><p>Three.js, du code, beaucoup de glouglous… et le cri du dindon du site de Roullieee.</p></div>
      <div class="genBloc genMerci"><h1>Merci d’avoir joué !</h1>
        <p>Et maintenant ? Le Royaume continue : les <b>Coupes des Maîtres</b>, les relais et la course sans fin au Dindodrome, la <b>Scène des défilés</b>, les <b>défis du jour</b>, les <b>100 succès</b>, les chromatiques ✨, et les fêtes de l’année (Halloween, Noël, Pâques, l’été) !</p>
        <p class="grosEmoji">🦃💕</p></div>
    </div><button class="btn petit genPasser">⏭ Passer</button><button class="btn grand vert genFin cache">🏡 Retour au Domaine</button></div>`);
    document.body.appendChild(V);
    ambianceMusique('titre', false);
    const defile = $('.genDefile', V);
    let fini = false;
    const finir = () => { if (fini) return; fini = true; pop(); V.classList.add('part'); setTimeout(() => { V.remove(); resoudre(); }, 400); };
    const montrerFin = () => { $('.genFin', V).classList.remove('cache'); $('.genPasser', V).classList.add('cache'); };
    defile.addEventListener('animationend', () => { montrerFin(); tada(); glouglou(.8); });
    $('.genPasser', V).onclick = ev => { ev.stopPropagation(); defile.style.animation = 'none'; defile.classList.add('fige'); montrerFin(); };
    $('.genFin', V).onclick = ev => { ev.stopPropagation(); finir(); };
    /* toucher l'écran : le générique va plus vite */
    V.addEventListener('pointerdown', ev => { if (ev.target.closest('button')) return; defile.style.animationDuration = '12s'; });
    tada();
  });
}
