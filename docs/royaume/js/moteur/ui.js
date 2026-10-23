/* L'interface en HTML par-dessus la 3D : fenêtres, notifications, dialogues */
import { pop } from './sons.js';
import { dire } from './voix.js';

export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => [...r.querySelectorAll(s)];
export function el(html) { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; }
export const echapper = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

/* ── les fenêtres (elles peuvent s'empiler : la fiche d'une dindie par-dessus le Clapier) ── */
const pile = [];
export const fenetreOuverte = () => pile.length > 0;
export function fenetre(titre, contenu, { classe = '', surFermer = null, large = false } = {}) {
  const f = el(`<div class="voile"><div class="fenetre ${classe}${large ? ' large' : ''}" role="dialog" aria-label="${echapper(titre)}">
    <div class="ruban">${titre}</div><button class="fermer" aria-label="Fermer">✖</button><div class="contenu"></div></div></div>`);
  const c = $('.contenu', f);
  if (typeof contenu === 'string') c.innerHTML = contenu; else c.appendChild(contenu);
  document.body.appendChild(f);
  const F = { el: f, contenu: c, fermer: () => {
    const i = pile.indexOf(F); if (i < 0) return;
    pile.splice(i, 1); f.remove(); if (!pile.length) document.body.classList.remove('fenetreOuverte'); surFermer && surFermer();
  }, titre: t => { $('.ruban', f).innerHTML = t; } };
  $('.fermer', f).onclick = () => { pop(); F.fermer(); };
  f.addEventListener('pointerdown', ev => { if (ev.target === f) { pop(); F.fermer(); } });
  pile.push(F); document.body.classList.add('fenetreOuverte');
  return F;
}
/* la touche Échap ferme la dernière fenêtre ouverte */
addEventListener('keydown', ev => { if (ev.key === 'Escape' && pile.length && !dialogueEnCours) { ev.preventDefault(); fermerDerniere(); } });
export function fermerTout() { while (pile.length) pile[pile.length - 1].fermer(); }
export function fermerDerniere() { if (pile.length) { pile[pile.length - 1].fermer(); return true; } return false; }

/* ── les petites notifications ── */
/* cle : un nouveau message avec la même clé remplace l'ancien (au lieu de s'empiler) ; 4 messages au plus à l'écran */
export function toast(texte, { duree = 2600, classe = '', cle = '' } = {}) {
  let z = $('#toasts'); if (!z) { z = el('<div id="toasts" role="status" aria-live="polite"></div>'); document.body.appendChild(z); }
  let t = cle ? [...z.children].find(x => x.dataset.cle === cle && !x.classList.contains('part')) : null;
  if (t) { t.innerHTML = texte; clearTimeout(t.fin); t.style.animation = 'none'; void t.offsetWidth; t.style.animation = ''; }
  else { t = el(`<div class="toast ${classe}">${texte}</div>`); if (cle) t.dataset.cle = cle; z.appendChild(t); }
  const partir = x => { x.classList.add('part'); setTimeout(() => x.remove(), 400); };
  t.fin = setTimeout(() => partir(t), duree);
  /* la voix lit aussi les grands messages (pas pendant un dialogue : elle lit déjà le dialogue) */
  if (/\bgrand\b/.test(classe) && !dialogueEnCours) dire(texte);
  const restent = [...z.children].filter(x => !x.classList.contains('part'));
  for (const x of restent.slice(0, Math.max(0, restent.length - 4))) { clearTimeout(x.fin); partir(x); }
}

/* ── les dialogues : une boîte en bas, avec le portrait de celui qui parle ──
   lignes : [{ qui: { nom, portrait }, texte, choix: [[id, texte], …] }] → Promise(dernier choix) */
let dialogueEnCours = null;
export const enDialogue = () => !!dialogueEnCours;
export function dialogue(lignes) {
  return new Promise(resoudre => {
    const b = el(`<div class="dialogue" role="dialog" aria-live="polite"><div class="dPortrait"></div><div class="dBulle"><div class="dNom"></div><div class="dTexte"></div><div class="dChoix"></div><div class="dSuite">▶</div></div></div>`);
    document.body.appendChild(b);
    let i = -1, ecrit = 0, plein = '', minuteur = null, choixFait = null;
    const suivante = () => {
      i++;
      if (i >= lignes.length) { clearInterval(minuteur); b.remove(); dialogueEnCours = null; resoudre(choixFait); return; }
      const L = lignes[i];
      $('.dPortrait', b).innerHTML = L.qui.portrait || '';
      $('.dPortrait', b).classList.toggle('cache', !L.qui.portrait);
      $('.dNom', b).textContent = L.qui.nom; $('.dNom', b).style.background = L.qui.couleur || '';
      plein = L.texte; ecrit = 0; $('.dTexte', b).innerHTML = '';
      $('.dChoix', b).innerHTML = ''; $('.dSuite', b).classList.add('cache');
      dire(plein);
      clearInterval(minuteur);
      minuteur = setInterval(() => {
        ecrit = Math.min(plein.length, ecrit + 2);
        $('.dTexte', b).innerHTML = plein.slice(0, ecrit);
        if (ecrit >= plein.length) { clearInterval(minuteur); finLigne(); }
      }, 22);
    };
    const finLigne = () => {
      const L = lignes[i];
      $('.dTexte', b).innerHTML = plein;
      if (L.choix) {
        $('.dChoix', b).innerHTML = L.choix.map(([id, t]) => `<button data-c="${id}">${t}</button>`).join('');
        $$('.dChoix button', b).forEach(x => x.onclick = ev => { ev.stopPropagation(); pop(); choixFait = x.dataset.c; L.surChoix && L.surChoix(choixFait); suivante(); });
      } else $('.dSuite', b).classList.remove('cache');
    };
    b.addEventListener('pointerup', ev => {
      if (ev.target.closest('.dChoix')) return;
      if (ecrit < plein.length) { clearInterval(minuteur); ecrit = plein.length; finLigne(); return; }
      if (lignes[i].choix) return;
      pop(); suivante();
    });
    dialogueEnCours = { avancer: () => b.dispatchEvent(new PointerEvent('pointerup')) };
    suivante();
  });
}
export const avancerDialogue = () => dialogueEnCours && dialogueEnCours.avancer();

/* ── une barre de progression ── */
export const barre = (k, couleur = '#22c55e') => `<div class="barreP"><b style="width:${Math.round(Math.max(0, Math.min(1, k)) * 100)}%;background:${couleur}"></b></div>`;
