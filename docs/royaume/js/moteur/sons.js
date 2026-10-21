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
