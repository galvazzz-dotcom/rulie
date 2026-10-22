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

/* ── la musique : de vrais morceaux libres (voir musique/CREDITS.md), un par ambiance,
   enchaînés avec un fondu. Le son passe par l'AudioContext (le volume d'un <audio> ne se règle pas sur iPhone). ── */
export const AMBIANCES = {
  titre: { jour: ['ragtime-searchlight'], nuit: ['ragtime-searchlight'] },
  domaine: { jour: ['0ad-harvest-festival', 'ragtime-searchlight', 'ragtime-something-doing'], nuit: ['0ad-albian-nocturne'] },
  dindodrome: { jour: ['orgue-doppeladler', 'ragtime-something-doing'], nuit: ['orgue-doppeladler', '0ad-albian-nocturne'] },
  course: { jour: ['orgue-el-capitan'], nuit: ['orgue-el-capitan'] },
  pres: { jour: ['0ad-solstice-festival', '0ad-harvest-festival'], nuit: ['0ad-mountain-idyll', '0ad-albian-nocturne'] },
  maroc: { jour: ['0ad-peaks-of-atlas'], nuit: ['0ad-mirage', '0ad-peaks-of-atlas'] },
  belgique: { jour: ['orgue-das-alpenhorn', '0ad-waters-edge'], nuit: ['0ad-waters-edge'] }
};
const VOLUME = .42, FONDU = 2.5;
let musiqueOn = false, ambianceNom = 'titre', nuitMusique = false, pistes = [], courante = null, iListe = 0, verifie = null;
function nouvellePiste(nom) {
  const A = audio(), el = new Audio(`musique/${nom}.mp3`);
  el.preload = 'auto'; el.crossOrigin = 'anonymous';
  const g = A.createGain(); g.gain.value = 0;
  try { A.createMediaElementSource(el).connect(g); } catch { return null; }
  g.connect(A.destination);
  return { nom, el, g };
}
function fondu(P, vers, duree = FONDU) {
  const A = audio(), t = A.currentTime;
  P.g.gain.cancelScheduledValues(t); P.g.gain.setValueAtTime(P.g.gain.value, t); P.g.gain.linearRampToValueAtTime(vers, t + duree);
}
function arreter(P, duree = FONDU) {
  if (!P) return;
  fondu(P, 0, duree);
  setTimeout(() => { P.el.pause(); P.el.removeAttribute('src'); P.el.load(); P.g.disconnect(); pistes = pistes.filter(x => x !== P); }, duree * 1000 + 100);
}
function liste() { const L = AMBIANCES[ambianceNom] || AMBIANCES.domaine; return nuitMusique ? L.nuit : L.jour; }
function jouerSuivante(dureeFondu = FONDU) {
  const L = liste(), nom = L[iListe % L.length]; iListe++;
  const avant = courante;
  const P = nouvellePiste(nom); if (!P) return;
  pistes.push(P); courante = P;
  P.el.play().then(() => fondu(P, VOLUME, dureeFondu)).catch(() => {});
  arreter(avant, dureeFondu);
}
/* toutes les secondes : la piste se termine-t-elle ? on enchaîne avec la suivante */
function surveiller() {
  if (!musiqueOn || !courante) return;
  const el = courante.el;
  if (el.duration && el.currentTime > el.duration - FONDU - .3) jouerSuivante();
}
export function musique(on) {
  musiqueOn = on && actif;
  clearInterval(verifie);
  if (!musiqueOn) { for (const P of [...pistes]) arreter(P, .6); courante = null; return; }
  verifie = setInterval(surveiller, 1000);
  if (!courante) jouerSuivante(1.2);
}
/* changer d'ambiance (lieu, jour ou nuit) : on ne coupe que si la liste change */
export function ambianceMusique(nom, nuit = nuitMusique) {
  const avant = liste().join();
  ambianceNom = nom; nuitMusique = nuit;
  if (liste().join() === avant && courante) return;
  iListe = 0;
  if (musiqueOn) jouerSuivante();
}
export const musiqueNuit = n => ambianceMusique(ambianceNom, n);
export const pisteEnCours = () => courante && { nom: courante.nom, t: courante.el.currentTime, volume: courante.g.gain.value };

/* ── le bruit de la pluie : un souffle filtré, qui monte et descend doucement ── */
let pluieG = null;
export function pluieSon(k) {
  if (!AC) { if (!k) return; audio(); }
  if (!pluieG) {
    if (!k) return;
    const A = AC, n = A.sampleRate * 2, buf = A.createBuffer(1, n, A.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    const src = A.createBufferSource(); src.buffer = buf; src.loop = true;
    const f = A.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 1400;
    pluieG = A.createGain(); pluieG.gain.value = 0;
    src.connect(f); f.connect(pluieG); pluieG.connect(A.destination); src.start();
  }
  pluieG.gain.setTargetAtTime(actif ? k * .05 : 0, AC.currentTime, 1.2);
}
