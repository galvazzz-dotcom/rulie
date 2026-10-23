/* Le simulateur d'une partie entière (étape 9), sans navigateur : combien de temps pour finir l'histoire, et pour tout avoir ?
   Usage : node --experimental-default-type=module royaume-outils/simulateur-partie.mjs [nombre de courses par estimation]
   Une joueuse « typique » suit l'histoire : à chaque course qui compte (podium des championnats, finales, défis de Gontran,
   la Ligue), elle prend sa meilleure coureuse ; si ses chances sont trop faibles, elle s'entraîne avec Coach Ginette et
   court des courses libres jusqu'à avoir une chance sur deux, puis elle tente sa chance (et recommence si elle perd).
   Les chances viennent du vrai moteur de course. Le reste (quêtes, captures, voyages, Domaine) a un temps moyen par action.
   Les attentes en temps réel (œufs, Nurserie) sont comptées à part : on les passe à jouer à autre chose, ou à faire une pause. */
import { simuler } from '../docs/royaume/js/jeu/course.js';
import { defCourse, optionsCourse } from '../docs/royaume/js/jeu/dindodrome.js';
import { nouvelleDindie, xpPourNiveau } from '../docs/royaume/js/jeu/individus.js';
import { hasard } from '../docs/royaume/js/moteur/couleurs.js';
import { gainsCourse } from '../docs/royaume/js/donnees/courses.js';

const N = +process.argv[2] || 30;
/* le temps moyen d'une action, en minutes (une enfant qui joue tranquillement) */
/* deux profils : « rapide » (elle va droit au but) et « typique » (une enfant qui prend son temps : le podium, les dialogues, la marche) */
const PROFILS = { rapide: { course: 1.6, entrainement: 1.1, capture: 1.8, voyage: 1.2, etape: .7, objet: .8, marche: .4 },
  typique: { course: 2.1, entrainement: 1.3, capture: 2.6, voyage: 1.5, etape: 1.1, objet: 1.1, marche: .7 } };
export const T = PROFILS[process.env.PROFIL || 'typique'];
/* ce que rapporte une minute « à gagner de l'expérience » (entraînement surtout : 20 + 30 × 2 points, en 1,1 min) */
const XP_MINUTE = 75 * 1.1 / T.entrainement, POINTS_MINUTE = 2 / T.entrainement;
const SEUIL = .5;   /* elle tente sa chance quand elle a au moins une chance sur deux */
/* les pièces : ce que rapportent les quêtes de chaque chapitre (et les quêtes du Domaine), ce qu'elle dépense (outils, kits,
   équipements, réparations, habitats, améliorations, friandises) ; quand elle bloque, elle dépense la moitié de ses
   économies en biscuits de champion (40 🪙 : 150 XP) */
const QUETES = { ch1: 1050, ch2: 2550, ch3: 950, ch4: 1950, ch5: 2850, ch6: 3800, ch7: 3200, ch8: 11200 };
const BADGES = { c1f: 500, c2f: 700, c3f: 900, c4f: 1200, c5f: 1400, c6f: 1600, c7f: 1800, c8f: 2200 };
const DEPENSES = { ch1: 450, ch2: 850, ch3: 400, ch4: 500, ch5: 1050 + 2000, ch6: 850 + 2500, ch7: 500 + 1500, ch8: 1200 };
const DOMAINE = { ch5: 700, ch6: 700, ch7: 700, ch8: 500 };
const BISCUIT = { prix: 40, xp: 150, temps: .15, parJour: 5 }, PART_BISCUITS = Number(process.env.BISCUITS ?? .5);
/* les biscuits offerts avec chaque badge ; et Mimi en vend 5 par jour (on compte une heure de jeu par jour) */
const BISCUITS_BADGE = { c1f: 3, c2f: 4, c3f: 5, c4f: 5, c5f: 6, c6f: 6, c7f: 7, c8f: 8 };

/* ── les coureuses que la joueuse peut avoir à chaque moment : l'épique de chaque île (niveau d'arrivée = celui de l'île + 3),
   avec des talents moyens (2 à 4 pour une épique : 3), et un caractère « calme » (moyen) ── */
const EPIQUES = [
  { espece: 'coquelicot', des: 'ch2', niveau: 8 }, { espece: 'dingue', des: 'ch2', niveau: 12 }, { espece: 'atomium', des: 'ch2', niveau: 15 },
  { espece: 'jaguar', des: 'ch5', niveau: 20 }, { espece: 'cristal', des: 'ch5', niveau: 23 }, { espece: 'magma', des: 'ch6', niveau: 26 },
  { espece: 'etoile', des: 'ch6', niveau: 29 }, { espece: 'orage', des: 'ch7', niveau: 32 }
];
const ORDRE_CH = ['ch1', 'ch2', 'ch3', 'ch4', 'ch5', 'ch6', 'ch7', 'ch8'];
/* les courses qui comptent, chapitre par chapitre, et ce qu'il faut : 'podium', 'gagner', ou 'battreStar' (finir devant la star) */
const COURSES = {
  ch4: [['essai', 'finir'], ['c1a', 'podium'], ['c1b', 'podium'], ['c1c', 'podium'], ['c1f', 'gagner'], ['gontran1', 'battreStar'],
    ['c2a', 'podium'], ['c2b', 'podium'], ['c2c', 'podium'], ['c2f', 'gagner'], ['c3a', 'podium'], ['c3b', 'podium'], ['c3c', 'podium'], ['c3f', 'gagner'],
    ['c4a', 'podium'], ['c4b', 'podium'], ['c4c', 'podium'], ['c4f', 'gagner'], ['gontran2', 'battreStar']],
  ch5: [['c5a', 'podium'], ['c5b', 'podium'], ['c5c', 'podium'], ['c5f', 'gagner']],
  ch6: [['c6a', 'podium'], ['c6b', 'podium'], ['c6c', 'podium'], ['c6f', 'gagner'], ['c7a', 'podium'], ['c7b', 'podium'], ['c7c', 'podium'], ['c7f', 'gagner']],
  ch7: [['c8a', 'podium'], ['c8b', 'podium'], ['c8c', 'podium'], ['c8f', 'gagner']],
  ch8: [['ligue1', 'gagner'], ['ligue2', 'gagner'], ['ligue3', 'gagner'], ['ligue4', 'gagner'], ['ligueGontran', 'gagner']]
};
/* le reste de chaque chapitre, en actions (étapes de quête, captures, voyages, objets à ramasser, marche) */
const RESTE = {
  ch1: { etape: 24, marche: 30, achat: 6 },
  ch2: { etape: 30, capture: 15, voyage: 7, objet: 9, marche: 30 },
  ch3: { etape: 14, marche: 14 },
  ch4: { etape: 22, marche: 16 },
  ch5: { etape: 24, capture: 8, voyage: 5, objet: 6, marche: 20 },
  ch6: { etape: 24, capture: 8, voyage: 5, objet: 6, marche: 20 },
  ch7: { etape: 16, capture: 4, voyage: 5, objet: 6, marche: 14 },
  ch8: { etape: 12, voyage: 3, marche: 10 },
  domaine: { etape: 26, marche: 26, objet: 10 }   /* les 8 quêtes du Domaine (Potager, Moulin, Atelier, missions, la Scène…) */
};
/* les attentes en temps réel de l'histoire (minutes) : l'œuf du Professeur et la Nurserie, le premier hybride,
   l'œuf mythique du chapitre 7, l'œuf du Dindromakus */
const ATTENTES = { ch3: .5 + 40 + 20 + 40, ch7: 240, ch8: 240 };

const cache = new Map();
function chance(id, but, c) {
  const cle = [id, but, c.espece, c.niveau, c.ent.join('.')].join('|');
  if (cache.has(cle)) return cache.get(cle);
  const def = defCourse(id); let ok = 0;
  for (let k = 0; k < N; k++) {
    const d = nouvelleDindie(c.espece, { niveau: c.niveau, talents: [3, 3, 3], caractere: 'calme', stade: c.niveau >= 20 ? 'eveille' : 'adulte' });
    d.entrainement = c.ent.slice(); d.competences = c.niveau >= 15 ? ['turbo'] : [];
    const o = optionsCourse(def, d); o.rng = hasard(cle + k);
    const C = simuler(o, { joueuseIA: true }), R = C.coureurs.find(x => x.id === 'moi'), S = C.coureurs.find(x => x.id === 'star');
    if (but === 'finir' || (but === 'podium' && R.place <= 3) || (but === 'gagner' && R.place === 1) || (but === 'battreStar' && (!S || R.place < S.place))) ok++;
  }
  const p = ok / N; cache.set(cle, p); return p;
}
/* gagner de l'expérience (et des points d'entraînement, tant qu'il en manque) pendant m minutes */
function travailler(c, m) {
  c.xp += XP_MINUTE * m;
  let pts = POINTS_MINUTE * m;
  for (let i = 0; i < 3 && pts > 0; i++) { const a = Math.min(15 - c.ent[i], pts); c.ent[i] += a; pts -= a; }
  c.ent = c.ent.map(v => Math.floor(v * 10) / 10);
  monter(c);
}
function monter(c) { while (c.niveau < 50 && c.xp >= xpPourNiveau(c.niveau)) { c.xp -= xpPourNiveau(c.niveau); c.niveau++; } }
const entier = c => ({ ...c, ent: c.ent.map(Math.floor) });

export function partie({ verbeux = true } = {}) {
  const ecurie = [], R = { chapitres: {}, total: 0, entrainement: 0, essais: 0, biscuits: 0, achetes: 0 };
  let pieces = 0, stock = 0, achetables = 0, joue = 0;
  /* au début du chapitre 4, Ginette ouvre son terrain : les épiques du chapitre 2 sont là */
  for (const ch of ORDRE_CH) {
    let t = 0, grind = 0;
    for (const E of EPIQUES) if (E.des === ch || (ch === 'ch4' && E.des === 'ch2')) if (!ecurie.some(x => x.espece === E.espece) && ORDRE_CH.indexOf(ch) >= 3) ecurie.push({ espece: E.espece, niveau: E.niveau, xp: 0, ent: [0, 0, 0] });
    const Rs = RESTE[ch] || {};
    pieces += (QUETES[ch] || 0) + (DOMAINE[ch] || 0) - (DEPENSES[ch] || 0);
    t += (Rs.etape || 0) * T.etape + (Rs.capture || 0) * T.capture + (Rs.voyage || 0) * T.voyage + (Rs.objet || 0) * T.objet + (Rs.marche || 0) * T.marche + (Rs.achat || 0) * .5;
    for (const [id, but] of COURSES[ch] || []) {
      /* sa coureuse pour cette course : celle qui a déjà une chance sur deux (la meilleure), sinon celle qu'il faut
         le moins entraîner pour y arriver (elle choisit la bonne espèce pour la bonne course) */
      const meilleure = () => {
        const pret = ecurie.map(c => [c, chance(id, but, entier(c))]).sort((a, b) => b[1] - a[1]);
        if (pret[0][1] >= SEUIL) return pret[0];
        const cout = c => {
          const manque = c.ent.reduce((a, v) => a + 15 - v, 0), m0 = manque / POINTS_MINUTE, k = { ...c, ent: [15, 15, 15] };
          k.xp += m0 * XP_MINUTE; monter(k);
          for (let L = k.niveau; L <= 50; L += 2) if (chance(id, but, { espece: c.espece, niveau: L, ent: [15, 15, 15] }) >= SEUIL) {
            let x = -k.xp; for (let n = k.niveau; n < L; n++) x += xpPourNiveau(n);
            return m0 + Math.max(0, x) / XP_MINUTE;
          }
          return Infinity;
        };
        const choix = ecurie.map(c => [c, cout(c)]).sort((a, b) => a[1] - b[1])[0][0];
        return [choix, chance(id, but, entier(choix))];
      };
      let [c, p] = meilleure();
      while (p < SEUIL && c.niveau < 50) {
        /* des biscuits d'abord (s'il lui reste des économies), sinon 5 minutes d'entraînement et de courses libres */
        achetables = Math.floor((joue + t + grind) / 60) * BISCUIT.parJour - R.achetes;
        const nb = PART_BISCUITS ? stock + Math.min(achetables, Math.floor(Math.max(0, pieces) * PART_BISCUITS / BISCUIT.prix)) : 0;
        if (nb >= 1 && c.ent.every(v => v >= 15)) {
          const k = Math.min(nb, 10), deStock = Math.min(stock, k), achat = k - deStock;
          stock -= deStock; pieces -= achat * BISCUIT.prix; R.achetes += achat; c.xp += k * BISCUIT.xp; monter(c); grind += k * BISCUIT.temps; R.biscuits += k;
        }
        else { travailler(c, 5); grind += 5; pieces += 5 / T.course * 25; }
        [c, p] = meilleure();
      }
      /* elle court jusqu'à réussir (en moyenne 1/p fois), et chaque course rapporte de l'expérience */
      const essais = 1 / Math.max(p, .05), def = defCourse(id), xp = gainsCourse(but === 'gagner' ? 1 : 2, def.championnat || 0).xp;
      t += essais * T.course; R.essais += essais; c.xp += xp * essais; monter(c);
      pieces += gainsCourse(but === 'gagner' ? 1 : 2, def.championnat || 0).pieces * essais + (BADGES[id] || 0); stock += BISCUITS_BADGE[id] || 0;
      if (verbeux) console.log(`${ch} ${id.padEnd(13)} ${c.espece.padEnd(10)} niv. ${String(c.niveau).padStart(2)} ent ${entier(c).ent.join('/').padEnd(8)} chance ${String(Math.round(p * 100)).padStart(3)} %  (${essais.toFixed(1)} essai${essais >= 1.5 ? 's' : ''})`);
    }
    t += grind; R.entrainement += grind; R.total += t; joue += t;
    R.chapitres[ch] = { t, grind, attente: ATTENTES[ch] || 0 };
  }
  const tD = RESTE.domaine.etape * T.etape + RESTE.domaine.marche * T.marche + RESTE.domaine.objet * T.objet;
  R.total += tD; R.chapitres.domaine = { t: tD, grind: 0, attente: 60 };
  R.ecurie = ecurie; R.pieces = Math.round(pieces);
  return R;
}

if (process.argv[1] && process.argv[1].endsWith('simulateur-partie.mjs')) {
  const R = partie();
  const h = m => `${Math.floor(m / 60)} h ${String(Math.round(m % 60)).padStart(2, '0')}`;
  console.log('\n══════════ La durée de l’histoire ══════════');
  for (const [ch, x] of Object.entries(R.chapitres)) console.log(`${ch.padEnd(8)} ${h(x.t).padStart(8)}  (dont ${h(x.grind)} à s’entraîner)${x.attente ? `  + ${h(x.attente)} d’attente en temps réel` : ''}`);
  console.log(`total    ${h(R.total).padStart(8)}  (dont ${h(R.entrainement)} à s’entraîner, ${Math.round(R.essais)} courses qui comptent)`);
  console.log('les coureuses à la fin :', R.ecurie.map(c => `${c.espece} niv. ${c.niveau}`).join(', '));
  console.log(`biscuits de champion mangés : ${R.biscuits} · pièces à la fin : ${R.pieces}`);
  /* ── le 100 % (une estimation) : les 32 espèces du Couvoir (3 min de jeu chacune, et leurs œufs en temps réel), les 6 autres
     légendes (25 min chacune, et un œuf de 4 h), 5 coureuses au maximum pour les 8 Coupes des Maîtres (niveau 50, talents
     montés par croisements et études : 1 h 30 de plus chacune), les 45 étoiles du glouglou et les rangs du défilé (3 h),
     les relais, le contre la montre et la course sans fin (1 h 30), les défis et les succès qui restent (4 h) ── */
  const xpVers50 = c => { let x = -c.xp; for (let n = c.niveau; n < 50; n++) x += xpPourNiveau(n); return Math.max(0, x); };
  const cinq = R.ecurie.slice().sort((a, b) => b.niveau - a.niveau).slice(0, 5);
  const maitres = cinq.reduce((a, c) => a + xpVers50(c) / XP_MINUTE + 90, 0);
  const plus = { couvoir: 32 * 3, legendes: 6 * 25, maitres, concours: 180, records: 90, defis: 240 };
  const tout = R.total + Object.values(plus).reduce((a, b) => a + b, 0);
  console.log(`\n══════════ Le 100 % (estimation) ══════════\n${Object.entries(plus).map(([k, v]) => `${k.padEnd(9)} ${h(v).padStart(8)}`).join('\n')}\ntotal     ${h(tout).padStart(8)}  (+ les œufs en temps réel : 32 œufs de 20 min à 1 h, 6 œufs mythiques de 4 h)`);
}
