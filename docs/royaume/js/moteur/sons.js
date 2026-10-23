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
const glouBuffer = () => glou;
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

/* ── le cri de chaque espèce (étape 9) : il suit son cri écrit dans le Grand Livre.
   Chaque syllabe est un morceau du vrai glouglou, plus ou moins aigu selon sa voyelle (« i » aigu, « o » grave) ;
   les voyelles répétées s'étirent (GLOOOOOUUU…), « ? » fait monter la voix, « ! » crier plus fort, « … » faire une pause ;
   rrr grogne, zzz bourdonne, sss, fff et pff soufflent ; « (en chuchotant) », « (de loin) », « (tout doux) » baissent la voix.
   Puis le type colore le son : l'écho de la nuit et du ciel, les clochettes de la glace, les crépitements du feu,
   l'eau qui tremble pour la pluie ; les épiques et les mythiques finissent sur des notes magiques, les chromatiques scintillent. ── */
const VOY = 'aàâeéèêëiîïoôuùûüyœ', estV = c => VOY.includes(c);
const ATTAQUES = ['gl', 'bl', 'pl', 'fl', 'cl', 'gr', 'br', 'tr', 'cr', 'fr', 'pr', 'dr', 'ch', 'qu', 'gu'];
function decouper(mot) {
  /* « glouli » → [{ a: 'gl', v: 'ou' }, { a: 'l', v: 'i' }] ; les consonnes de la fin vont à la dernière syllabe */
  const S = []; let a = '', i = 0;
  while (i < mot.length) {
    if (!estV(mot[i])) { a += mot[i++]; continue; }
    let v = ''; while (i < mot.length && estV(mot[i])) v += mot[i++];
    let c = ''; while (i < mot.length && !estV(mot[i])) c += mot[i++];
    if (i < mot.length && c.length) {
      /* entre deux voyelles : la dernière consonne (ou « gl », « ch »…) commence la syllabe suivante */
      const k = c.length >= 2 && ATTAQUES.includes(c.slice(-2)) ? 2 : 1;
      S.push({ a, v, c: c.slice(0, c.length - k) }); a = c.slice(c.length - k);
    } else S.push({ a, v, c });
  }
  if (!S.length) return a ? [{ a, v: '', c: '' }] : [];
  /* le « e » muet de la fin (dingue, belge, flamme) */
  if (S.length > 1 && /^u?e$/.test(S[S.length - 1].v) && /^s?$/.test(S[S.length - 1].c)) { const d = S.pop(); S[S.length - 1].c += d.a; }
  return S;
}
const tonVoyelle = v => /^o[uù]|^oo+u/.test(v) ? 1 : /^[iîïy]/.test(v) ? 1.3 : /^[uùûü]/.test(v) ? 1.2 : /^(ai|ei|[eéèêë])/.test(v) ? 1.14 : /^[aàâ]/.test(v) ? 1.07 : /^[oô]/.test(v) ? .9 : 1;
const etirement = v => { let n = 0; for (let i = 1; i < v.length; i++) if (v[i] === v[i - 1]) n++; return n; };
export function lireCri(texte) {
  const t = texte.toLowerCase();
  const voix = /chuchot/.test(t) ? 'chuchote' : /de loin/.test(t) ? 'loin' : /tout doux|juste comme/.test(t) ? 'doux' : /aucun bruit/.test(t) ? 'muet' : /mille ans/.test(t) ? 'lent' : 'normale';
  const sans = texte.replace(/\([^)]*\)/g, ' '), S = [], re = /([A-Za-zÀ-ÿœŒ]+)|([!?…♪.,])/g;
  let m;
  while ((m = re.exec(sans)) && S.length < 7) {
    const der = S[S.length - 1];
    if (m[2]) {
      if (!der) continue;
      const p = m[2];
      if (p === '!') der.fort = (der.fort || 0) + 1; else if (p === '?') der.question = true;
      else if (p === '…' || p === '.') der.pause = .26; else if (p === ',') der.pause = Math.max(der.pause || 0, .1); else S.forEach(x => { x.chante = true; });
      continue;
    }
    const mot = m[1], maj = mot.length > 1 && mot === mot.toUpperCase();
    for (const x of decouper(mot.toLowerCase())) if (S.length < 7) S.push({ ...x, maj, long: etirement(x.v) });
  }
  return { voix, syllabes: S };
}
let bruitBlanc = null;
function blanc(A) {
  if (!bruitBlanc) { const n = A.sampleRate, b = A.createBuffer(1, n, A.sampleRate), d = b.getChannelData(0); for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1; bruitBlanc = b; }
  return bruitBlanc;
}
/* un souffle de bruit filtré (sss, fff, pff, les crépitements) */
function souffle(A, sortie, t, d, f, q, v, type = 'bandpass') {
  const s = A.createBufferSource(), fi = A.createBiquadFilter(), g = A.createGain();
  s.buffer = blanc(A); fi.type = type; fi.frequency.value = f; fi.Q.value = q;
  g.gain.setValueAtTime(.0001, t); g.gain.linearRampToValueAtTime(v, t + Math.min(.03, d / 3)); g.gain.setValueAtTime(v, t + d * .6); g.gain.exponentialRampToValueAtTime(.0001, t + d);
  s.connect(fi); fi.connect(g); g.connect(sortie); s.start(t, Math.random() * .5); s.stop(t + d + .02);
}
/* un bourdonnement ou un grognement (zzz, rrr) : une dent de scie qui tremble */
function vibre(A, sortie, t, d, f, trem, v, filtre) {
  const o = A.createOscillator(), l = A.createOscillator(), lg = A.createGain(), fi = A.createBiquadFilter(), g = A.createGain(), e = A.createGain();
  o.type = 'sawtooth'; o.frequency.value = f; l.type = 'square'; l.frequency.value = trem; lg.gain.value = .5; e.gain.value = .5;
  l.connect(lg); lg.connect(e.gain); fi.type = 'lowpass'; fi.frequency.value = filtre;
  g.gain.setValueAtTime(.0001, t); g.gain.linearRampToValueAtTime(v, t + .03); g.gain.setValueAtTime(v, t + d * .7); g.gain.exponentialRampToValueAtTime(.0001, t + d);
  o.connect(fi); fi.connect(e); e.connect(g); g.connect(sortie); o.start(t); l.start(t); o.stop(t + d + .02); l.stop(t + d + .02);
}
/* les deux syllabes du vrai glouglou (en secondes dans glou.mp3) et la partie de la voyelle qu'on peut étirer */
const GRAINS = [{ s: .06, e: .4, vs: .2, ve: .36 }, { s: .54, e: .75, vs: .57, ve: .66 }];
/* une syllabe : un morceau du glouglou, à la hauteur r (et r × fin à la fin), étiré jusqu'à « duree » */
function syllabe(A, sortie, t, G, r, duree, v, fin = 1, vibrato = null, glou = null) {
  const nat = (G.e - G.s) / r;
  const morceau = (t0, de, a, r0, r1, v0, fondu) => {
    const s = A.createBufferSource(), g = A.createGain(), d = (a - de) / ((r0 + r1) / 2);
    s.buffer = glou; s.playbackRate.setValueAtTime(r0, t0); s.playbackRate.linearRampToValueAtTime(r1, t0 + d);
    if (vibrato) vibrato.connect(s.detune);
    g.gain.setValueAtTime(.0001, t0); g.gain.linearRampToValueAtTime(v0, t0 + fondu); g.gain.setValueAtTime(v0, Math.max(t0 + fondu, t0 + d - fondu)); g.gain.linearRampToValueAtTime(.0001, t0 + d);
    s.connect(g); g.connect(sortie); s.start(t0, de, a - de); s.stop(t0 + d + .02);
    return d;
  };
  if (duree <= nat * 1.08) { morceau(t, G.s, G.e, r, r * fin, v, .012); return nat; }
  /* plus long : l'attaque, puis la voyelle en petits grains qui se chevauchent, puis la fin */
  const rr = k => r * (1 + (fin - 1) * k);
  const dA = morceau(t, G.s, G.vs + .02, r, r, v, .012);
  const dFin = (G.e - G.ve) / r, sustain = Math.max(.05, duree - dA - dFin), L = .07, pas = L / r / 2;
  let x = t + dA - pas, n = 0;
  while (x < t + dA + sustain - pas && n < 24) {
    const k = (x - t) / duree, p = G.vs + ((n * .023) % (G.ve - G.vs - L));
    morceau(x, p, p + L, rr(k), rr(k), v * .95, L / r / 2);
    x += pas; n++;
  }
  morceau(x, G.ve - .02, G.e, rr(.9), r * fin, v, .02);
  return x - t + dFin;
}
/* les couleurs de chaque type : un filtre, un écho, et ce qui vient après le cri */
const COULEURS_TYPE = {
  prairie: {}, sable: { filtre: ['lowpass', 3200] }, pluie: { vibrato: [7.5, 45] }, jungle: { echo: [.11, .18, .28] },
  glace: { filtre: ['highpass', 380], clochettes: true }, feu: { crepite: true, filtre: ['lowpass', 4200] },
  nuit: { filtre: ['lowpass', 2300], echo: [.32, .38, .4] }, ciel: { filtre: ['highpass', 260], echo: [.17, .42, .32], hauteur: 1.05 }
};
let dernierCri = 0;
/* (contexte : un OfflineAudioContext, pour les tests ; on y passe aussi le glouglou décodé) */
export function cri(texte, { hauteur = 1, type = 'prairie', rarete = 'commune', chroma = false, volume = 1, contexte = null, echantillon = null } = {}) {
  if (!actif && !contexte) return 0;
  const A = contexte || audio();
  if (!contexte && A.currentTime - dernierCri < .12) return 0;
  if (!contexte) dernierCri = A.currentTime;
  const glou = echantillon || glouBuffer();
  const { voix, syllabes: S } = lireCri(texte), T = COULEURS_TYPE[type] || {};
  const h = hauteur * (T.hauteur || 1) * (voix === 'lent' ? .9 : 1);
  /* la chaîne : le cri → (le filtre du type) → la sortie, avec l'écho à côté */
  const entree = A.createGain(), sortie = A.createGain(), noeuds = [entree, sortie];
  sortie.gain.value = volume * { chuchote: .4, loin: .38, doux: .6, muet: .15 }[voix] || volume;
  let fin = entree;
  const filtre = (type2, f) => { const F = A.createBiquadFilter(); F.type = type2; F.frequency.value = f; fin.connect(F); fin = F; noeuds.push(F); };
  if (T.filtre) filtre(...T.filtre);
  if (voix === 'chuchote') filtre('highpass', 1300);
  if (voix === 'loin') filtre('lowpass', 1100);
  if (voix === 'doux') filtre('lowpass', 2200);
  fin.connect(sortie); sortie.connect(A.destination);
  const echo = T.echo || (voix === 'loin' ? [.28, .3, .45] : null);
  if (echo) {
    const D = A.createDelay(1), fb = A.createGain(), w = A.createGain();
    D.delayTime.value = echo[0]; fb.gain.value = echo[1]; w.gain.value = echo[2];
    fin.connect(D); D.connect(fb); fb.connect(D); D.connect(w); w.connect(sortie); noeuds.push(D, fb, w);
  }
  let vibrato = null;
  if (T.vibrato) { const o = A.createOscillator(), g = A.createGain(); o.frequency.value = T.vibrato[0]; g.gain.value = T.vibrato[1]; o.connect(g); o.start(); vibrato = g; noeuds.push(o, g); }
  let t = A.currentTime + .02;
  const t0 = t, GAMME = [1, 1.122, 1.26, 1.335, 1.498, 1.682];
  if (voix === 'muet' || !S.length) souffle(A, entree, t, .25, 1800, .6, .2);
  S.forEach((x, i) => {
    const fort = Math.min(1.35, (x.maj ? 1 : .78) * (1 + .12 * (x.fort || 0)));
    /* d'abord les bruits de la consonne : rrr, zzz, sss, fff, pff, ch, tch, kof */
    const a = x.a, reps = Math.max(0, a.length - 1);
    if (/rr/.test(a)) { const d = .12 + .05 * reps; vibre(A, entree, t, d, 95 * h, 26, .22 * fort, 700); t += d * .8; }
    else if (/zz/.test(a)) { const d = .12 + .05 * reps; vibre(A, entree, t, d, 190 * h, 45, .16 * fort, 2400); t += d * .9; }
    else if (/ss|ff|pf|ch|sh/.test(a) || (!x.v && /[sf]/.test(a))) { const d = .1 + .05 * reps; souffle(A, entree, t, d, /s/.test(a) ? 5200 : /ch|sh/.test(a) ? 3000 : 1500, .8, .3 * fort); t += d * .85; }
    else if (/^[kt]/.test(a) && i === 0 && !x.maj) souffle(A, entree, t, .05, 2600, 1, .2 * fort);
    if (!x.v) { t += x.pause || .04; return; }
    /* puis la voyelle : un morceau du vrai glouglou */
    let r = h * tonVoyelle(x.v) * (x.maj ? .96 : 1.03) * (x.chante ? GAMME[i % GAMME.length] : 1);
    const G = GRAINS[i === 0 || x.maj || x.long ? 0 : 1];
    const nat = (G.e - G.s) / r, duree = nat + Math.min(.8, x.long * .085) * (voix === 'lent' ? 1.4 : 1);
    const finK = x.question ? 1.3 : x.pause ? .88 : 1;
    if (glou) t += syllabe(A, entree, t, G, r, duree, .9 * fort, finK, vibrato, glou);
    else { for (let k = 0; k < 2; k++) bip(A, 300 * r + k * 40, t + k * .09, .08, 'square', .05 * fort); t += .2; }
    if (/^[rlfsp]/.test(x.c)) { souffle(A, entree, t - .03, .06, 2000, 1, .1 * fort); }
    t += (x.pause || 0) + .02;
  });
  /* après le cri : les clochettes de la glace, les étincelles du feu, les notes magiques */
  if (T.crepite) for (let k = 0; k < 7; k++) souffle(A, sortie, t0 + Math.random() * (t - t0 + .2), .012, 3500, .7, .25, 'highpass');
  if (T.clochettes) [2093, 2637, 3136].forEach((f, k) => bip(A, f * Math.pow(h, .3), t + k * .07, .35, 'sine', .035));
  const notes = rarete === 'mythique' ? [1, 1.26, 1.498, 2, 2.52] : rarete === 'epique' ? [1, 1.498] : [];
  notes.forEach((k, j) => bip(A, 660 * k * Math.pow(h, .5), t + .05 + j * .08, .3, 'triangle', .045));
  if (chroma) [2.5, 3, 3.75].forEach((k, j) => bip(A, 880 * k, t + .1 + notes.length * .08 + j * .06, .18, 'sine', .03));
  const total = t - t0 + .6 + (echo ? 1.2 : 0);
  setTimeout(() => noeuds.forEach(n => { try { if (n.stop) n.stop(); n.disconnect(); } catch { /* déjà fini */ } }), total * 1000 + 400);
  return t - t0;
}

/* ── les bruitages (étape 9) : le filet, la dindie qui file, les pièces, le coffre, l'œuf qui craque, l'arrosoir, la page ── */
let dernierBruit = {};
export function bruit(nom) {
  if (!actif) return;
  const A = audio(), t = A.currentTime + .01, D = A.destination;
  if (t - (dernierBruit[nom] || 0) < .09) return;
  dernierBruit[nom] = t;
  const glisse = (f0, f1, d, type, v, t0 = t) => {
    const o = A.createOscillator(), g = A.createGain();
    o.type = type; o.frequency.setValueAtTime(f0, t0); o.frequency.exponentialRampToValueAtTime(f1, t0 + d);
    g.gain.setValueAtTime(.0001, t0); g.gain.linearRampToValueAtTime(v, t0 + .015); g.gain.exponentialRampToValueAtTime(.0001, t0 + d);
    o.connect(g); g.connect(D); o.start(t0); o.stop(t0 + d + .02);
  };
  const vague = (f0, f1, d, v, t0 = t, type = 'bandpass') => {
    const s = A.createBufferSource(), fi = A.createBiquadFilter(), g = A.createGain();
    s.buffer = blanc(A); fi.type = type; fi.Q.value = .8; fi.frequency.setValueAtTime(f0, t0); fi.frequency.exponentialRampToValueAtTime(f1, t0 + d);
    g.gain.setValueAtTime(.0001, t0); g.gain.linearRampToValueAtTime(v, t0 + d * .35); g.gain.exponentialRampToValueAtTime(.0001, t0 + d);
    s.connect(fi); fi.connect(g); g.connect(D); s.start(t0, Math.random() * .5); s.stop(t0 + d + .02);
  };
  if (nom === 'filet') vague(500, 2600, .38, .2);
  else if (nom === 'rate') { glisse(620, 260, .28, 'sine', .08); vague(1800, 600, .3, .1, t + .05); }
  else if (nom === 'pieces') { glisse(1975, 1990, .12, 'triangle', .05); glisse(2637, 2650, .22, 'triangle', .05, t + .07); }
  else if (nom === 'coffre') { glisse(140, 95, .3, 'sawtooth', .03); [784, 988, 1175, 1568].forEach((f, k) => glisse(f, f * 1.01, .3, 'triangle', .05, t + .25 + k * .07)); }
  else if (nom === 'craque') { vague(3500, 2500, .05, .3, t, 'highpass'); vague(2800, 2000, .04, .2, t + .06, 'highpass'); }
  else if (nom === 'eau') { vague(2600, 500, .45, .14, t, 'lowpass'); for (let k = 0; k < 4; k++) glisse(380 + Math.random() * 300, 900 + Math.random() * 400, .07, 'sine', .04, t + .08 + k * .08); }
  else if (nom === 'page') vague(1800, 4200, .16, .12);
  else if (nom === 'pierre') [1568, 2093, 2637].forEach((f, k) => glisse(f, f * 1.02, .4, 'sine', .04, t + k * .06));
}

/* ── la musique : de vrais morceaux libres (voir musique/CREDITS.md), un par ambiance,
   enchaînés avec un fondu. Le son passe par l'AudioContext (le volume d'un <audio> ne se règle pas sur iPhone). ── */
export const AMBIANCES = {
  titre: { jour: ['ragtime-searchlight'], nuit: ['ragtime-searchlight'] },
  domaine: { jour: ['0ad-harvest-festival', 'ragtime-searchlight', 'ragtime-something-doing'], nuit: ['0ad-albian-nocturne'] },
  dindodrome: { jour: ['orgue-doppeladler', 'ragtime-something-doing', 'orgue-slavonic-dance'], nuit: ['orgue-doppeladler', '0ad-albian-nocturne'] },
  course: { jour: ['orgue-el-capitan'], nuit: ['orgue-el-capitan'] },
  /* les finales, la Ligue et les Coupes des Maîtres */
  grandeCourse: { jour: ['orgue-slavonic-dance'], nuit: ['orgue-slavonic-dance'] },
  pres: { jour: ['0ad-solstice-festival', '0ad-harvest-festival'], nuit: ['0ad-mountain-idyll', '0ad-albian-nocturne'] },
  maroc: { jour: ['0ad-peaks-of-atlas'], nuit: ['0ad-mirage', '0ad-peaks-of-atlas'] },
  belgique: { jour: ['orgue-das-alpenhorn', '0ad-waters-edge'], nuit: ['0ad-waters-edge'] },
  jungle: { jour: ['rct-ancient-lands', '0ad-eastern-dreams'], nuit: ['0ad-eastern-dreams', '0ad-waters-edge'] },
  banquise: { jour: ['rct-snowbound', '0ad-mountain-idyll'], nuit: ['0ad-albian-nocturne', 'rct-snowbound'] },
  volcan: { jour: ['0ad-sands-of-time', 'rct-ancient-lands'], nuit: ['0ad-sands-of-time', '0ad-mirage'] },
  foret: { jour: ['rct-mystic-winds', '0ad-sunrise'], nuit: ['0ad-harvest-moon', 'rct-mystic-winds', '0ad-albian-nocturne'] },
  nuages: { jour: ['0ad-elysian-fields', '0ad-solstice-festival'], nuit: ['0ad-elysian-fields', '0ad-mountain-idyll'] }
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
