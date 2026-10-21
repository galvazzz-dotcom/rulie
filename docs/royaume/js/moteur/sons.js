/* Les sons : le glouglou (le fichier du site, joué plus ou moins aigu selon
   la dindie) et de petits bruits d'interface fabriqués à la volée. */
let AC = null, glou = null;
export function audio() {
  if (!AC) {
    AC = new (window.AudioContext || window.webkitAudioContext)();
    fetch('../glou.mp3').then(r => r.arrayBuffer()).then(b => AC.decodeAudioData(b)).then(d => { glou = d; }).catch(() => {});
  }
  if (AC.state === 'suspended') AC.resume();
  return AC;
}
let actif = true;
export const sonActif = v => { if (v !== undefined) actif = v; return actif; };

/* hauteur : 1 = normal, plus grand = plus aigu (les poussins !) */
export function glouglou(hauteur = 1) {
  if (!actif) return;
  const A = audio();
  if (glou) {
    const s = A.createBufferSource(), g = A.createGain();
    s.buffer = glou; s.playbackRate.value = hauteur; g.gain.value = .9;
    s.connect(g); g.connect(A.destination); s.start();
    return;
  }
  /* pas encore chargé : un glouglou synthétique */
  const t = A.currentTime;
  for (let i = 0; i < 4; i++) bip(A, 300 * hauteur + i * 40, t + i * .09, .08, 'square', .05);
}
function bip(A, f, t, d, type = 'sine', v = .08) {
  const o = A.createOscillator(), g = A.createGain();
  o.type = type; o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(f * 1.5, t + d);
  g.gain.setValueAtTime(.0001, t); g.gain.linearRampToValueAtTime(v, t + .01); g.gain.exponentialRampToValueAtTime(.0001, t + d);
  o.connect(g); g.connect(A.destination); o.start(t); o.stop(t + d + .02);
}
export function pop() { if (!actif) return; const A = audio(); bip(A, 520, A.currentTime, .09, 'sine', .09); }
export function tada() {
  if (!actif) return;
  const A = audio(), t = A.currentTime;
  [523, 659, 784, 1047].forEach((f, i) => bip(A, f, t + i * .09, .25, 'triangle', .07));
}
export function vent() {
  if (!actif) return;
  const A = audio(), t = A.currentTime;
  bip(A, 200, t, .35, 'sine', .04);
}

/* ── la musique du Domaine : une petite boucle douce (le jour), plus lente la nuit ── */
const N = { C4: 262, D4: 294, E4: 330, F4: 349, G4: 392, A4: 440, B4: 494, C5: 523, D5: 587, E5: 659, G5: 784, A3: 220, G3: 196, F3: 175, C3: 131, E3: 165 };
const AIR_JOUR = [['E4', 1], ['G4', 1], ['A4', 1], ['G4', 1], ['C5', 2], ['A4', 1], ['G4', 1], ['E4', 1], ['D4', 1], ['E4', 2], ['G4', 2],
  ['A4', 1], ['C5', 1], ['D5', 1], ['C5', 1], ['A4', 2], ['G4', 1], ['E4', 1], ['D4', 1], ['C4', 1], ['D4', 2], ['C4', 2]];
const BASSE_JOUR = ['C3', 'A3', 'F3', 'G3'];
const AIR_NUIT = [['E4', 2], ['G4', 2], ['B4', 4], ['A4', 2], ['G4', 2], ['E4', 4], ['D4', 2], ['E4', 2], ['G4', 4], ['E4', 4]];
const BASSE_NUIT = ['A3', 'E3', 'F3', 'C3'];
let musiqueOn = false, nuitMusique = false, tMus = 0, iMus = 0, minuteur = null;
export function musique(on, nuit = false) {
  musiqueOn = on; nuitMusique = nuit;
  clearInterval(minuteur);
  if (!on || !actif) return;
  const A = audio(); tMus = Math.max(tMus, A.currentTime + .1);
  minuteur = setInterval(planifier, 200);
}
export const musiqueNuit = n => { nuitMusique = n; };
function note(A, f, t, d, v, type) {
  const o = A.createOscillator(), g = A.createGain(); o.type = type; o.frequency.value = f;
  g.gain.setValueAtTime(.0001, t); g.gain.linearRampToValueAtTime(v, t + .03); g.gain.exponentialRampToValueAtTime(.0001, t + d);
  o.connect(g); g.connect(A.destination); o.start(t); o.stop(t + d + .05);
}
function planifier() {
  if (!musiqueOn || !actif || !AC) return;
  const A = AC, air = nuitMusique ? AIR_NUIT : AIR_JOUR, basse = nuitMusique ? BASSE_NUIT : BASSE_JOUR, temps = 60 / (nuitMusique ? 70 : 104);
  while (tMus < A.currentTime + .6) {
    const [n, d] = air[iMus % air.length];
    note(A, N[n], tMus, Math.min(d * temps * .9, 1.2), nuitMusique ? .028 : .032, 'triangle');
    if (iMus % 4 === 0) note(A, N[basse[Math.floor(iMus / 4) % basse.length]], tMus, temps * 3.5, .035, 'sine');
    tMus += d * temps; iMus++;
  }
}
