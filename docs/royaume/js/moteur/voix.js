/* La voix (mode aide) : lit les dialogues et les consignes à voix haute */
let active = false;
export const voixActive = v => { if (v !== undefined) { active = v; if (!v) speechSynthesis?.cancel(); } return active; };
export function dire(texte) { if (active) lire(texte); }
/* lire à voix haute, même quand la voix est coupée (le bouton 🔊 des astuces) */
export function lire(texte) {
  if (!window.speechSynthesis) return;
  const t = String(texte).replace(/<[^>]+>/g, ' ').replace(/[^\p{L}\p{N}\s'’!?.,:;…-]/gu, ' ').replace(/\s+/g, ' ').trim();
  if (!t) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(t); u.lang = 'fr-FR'; u.rate = .95; u.pitch = 1.05;
  const v = speechSynthesis.getVoices().find(x => /^fr/i.test(x.lang)); if (v) u.voice = v;
  speechSynthesis.speak(u);
}
