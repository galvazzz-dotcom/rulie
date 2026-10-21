/* Petits outils de couleur (textes « #rrggbb »), partagés par la 3D et les portraits */
export const hexVersRgb = c => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16));
export const rgbVersHex = rgb => '#' + rgb.map(v => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('');
export const melanger = (a, b, k) => { const A = hexVersRgb(a), B = hexVersRgb(b); return rgbVersHex(A.map((v, i) => v + (B[i] - v) * k)); };
export const eclaircir = (c, k) => melanger(c, '#ffffff', k);
export const assombrir = (c, k) => melanger(c, '#000000', k);

export function versHsl(c) {
  const [r, g, b] = hexVersRgb(c).map(v => v / 255), max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min, s = l > .5 ? d / (2 - max - min) : d / (max + min);
  const h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [h * 60, s, l];
}
export function depuisHsl(h, s, l) {
  h = ((h % 360) + 360) % 360;
  const k = n => (n + h / 30) % 12, a = s * Math.min(l, 1 - l);
  const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return rgbVersHex([f(0), f(8), f(4)].map(v => v * 255));
}
/* la couleur « chromatique » : la teinte tourne ; les gris deviennent dorés */
export function chromatique(c) {
  const [h, s, l] = versHsl(c);
  if (s < .15) return depuisHsl(42, .75, Math.min(.85, Math.max(.22, l)));
  return depuisHsl(h + 150, Math.min(1, s * 1.05), l);
}
/* l'arc-en-ciel des queues « arc » */
export const ARC = ['#ef4444', '#f97316', '#facc15', '#22c55e', '#06b6d4', '#3b82f6', '#a855f7', '#ec4899'];

/* un hasard qui donne toujours la même suite pour une même graine (motifs, taches…) */
export function hasard(graine) {
  let h = 2166136261;
  for (const ch of String(graine)) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return () => { h += 0x6D2B79F5; let t = h; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
