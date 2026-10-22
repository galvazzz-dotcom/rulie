/* ══════════ LE MODE « DÉCORER » DU DOMAINE ══════════
   En bas, les décorations fabriquées à l'Atelier. On en choisit une : son fantôme apparaît devant Roullieee
   (vert : on peut la poser là ; rouge : non). On touche le sol pour la placer, ↻ pour la tourner, ✅ pour la poser.
   On touche une décoration déjà posée pour la déplacer ou la ranger.
   creerDecorateur(H) → { ouvrir, fermer, actif(), toucher(x, y) } ;
   H : { domaine, scene, camera, ray, moi (la racine de Roullieee), surChange } */
import * as THREE from 'three';
import { el, $, $$, toast } from '../moteur/ui.js';
import { pop, tada } from '../moteur/sons.js';
import { DECORATIONS } from '../donnees/production.js';
import { fantome } from '../monde/decorations.js';
import * as PR from '../jeu/production.js';

export function creerDecorateur(H) {
  let U = null, sel = null;   /* sel : { id, k (si on déplace), ancienne, F (le fantôme), x, z, r } */
  const ndc = new THREE.Vector2(), plan = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), pt = new THREE.Vector3();
  const arrondi = v => Math.round(v * 4) / 4;
  const sol = (x, y) => { ndc.set(x / innerWidth * 2 - 1, -(y / innerHeight) * 2 + 1); H.ray.setFromCamera(ndc, H.camera); return H.ray.ray.intersectPlane(plan, pt) ? [pt.x, pt.z] : null; };

  function dessiner() {
    if (!U) return;
    const P = PR.prod(), stock = Object.entries(P.decorations).filter(([id, n]) => n > 0 && DECORATIONS[id]);
    if (sel) {
      const D = DECORATIONS[sel.id];
      U.innerHTML = `<div class="decoInfo"><b>${D.e} ${D.nom}</b><small>${sel.ok ? '✅ Touche le sol pour la déplacer, puis pose-la !' : '⛔ Pas ici : trop près d’un bâtiment, d’un arbre ou d’une porte.'}</small></div>
        <div class="decoBtns"><button class="btn" id="dTourner">↻ Tourner</button><button class="btn vert" id="dPoser" ${sel.ok ? '' : 'disabled'}>✅ ${sel.k ? 'Ici !' : 'Poser'}</button>
        ${sel.k ? '<button class="btn jaune" id="dRanger">📦 Ranger</button>' : ''}<button class="btn" id="dAnnuler">✖</button></div>`;
      $('#dTourner', U).onclick = () => { pop(); sel.r = (sel.r + Math.PI / 4) % (Math.PI * 2); placer(sel.x, sel.z); };
      $('#dPoser', U).onclick = poser;
      $('#dAnnuler', U).onclick = () => { pop(); annuler(); };
      const rg = $('#dRanger', U); if (rg) rg.onclick = ranger;
      return;
    }
    U.innerHTML = `<div class="decoInfo"><b>🎨 Décorer le Domaine</b><small>${P.deco.length}/${PR.MAX_DECO} posées · Choisis une décoration, ou touche une décoration posée pour la déplacer.</small></div>
      <div class="decoStock">${stock.map(([id, n]) => `<button class="btn decoChoix" data-id="${id}"><span>${DECORATIONS[id].e}</span><small>${DECORATIONS[id].nom}${n > 1 ? ' × ' + n : ''}</small></button>`).join('') || '<p class="petitTexte">Plus rien en stock : l’Atelier des plumes en fabrique !</p>'}</div>
      <div class="decoBtns"><button class="btn vert" id="dFini">✅ J’ai fini</button></div>`;
    $$('.decoChoix', U).forEach(b => b.onclick = () => { pop(); choisir(b.dataset.id); });
    $('#dFini', U).onclick = () => { pop(); fermer(); };
  }
  /* le fantôme suit la place choisie */
  function placer(x, z) {
    sel.x = arrondi(x); sel.z = arrondi(z);
    sel.F.g.position.set(sel.x, 0, sel.z); sel.F.g.rotation.y = sel.r;
    const p = H.moi.position, ok = H.domaine.peutPoserDeco(sel.id, sel.x, sel.z, { ignorer: sel.k, moi: { x: p.x, z: p.z } });
    if (ok !== sel.ok) { sel.ok = ok; sel.F.valide(ok); dessiner(); }
  }
  function nouveauFantome(id, x, z, r = 0, k = null, ancienne = null) {
    if (sel) sel.F.liberer();
    const F = fantome(id); H.scene.add(F.g);
    sel = { id, k, ancienne, F, r, ok: null, x, z };
    placer(x, z); dessiner();
  }
  function choisir(id) {
    const p = H.moi.position, a = H.moi.rotation.y;
    /* devant Roullieee ; si ça ne va pas, on cherche un peu autour */
    let best = [p.x + Math.sin(a) * 2.2, p.z + Math.cos(a) * 2.2];
    for (let k = 0; k < 16; k++) { const b = a + k * Math.PI / 8, d = 2.2 + (k % 3) * .8, x = p.x + Math.sin(b) * d, z = p.z + Math.cos(b) * d; if (H.domaine.peutPoserDeco(id, arrondi(x), arrondi(z), { moi: p })) { best = [x, z]; break; } }
    nouveauFantome(id, ...best);
  }
  function poser() {
    if (!sel || !sel.ok) return;
    if (sel.k) { PR.deplacerDeco(sel.k, sel.x, sel.z, sel.r); H.domaine.ajouterDeco(PR.prod().deco.find(d => d.k === sel.k)); }
    else {
      const D = PR.poserDeco(sel.id, sel.x, sel.z, sel.r);
      if (typeof D === 'string') { toast('⚠️ ' + D); return; }
      H.domaine.ajouterDeco(D);
    }
    tada(); toast(`${DECORATIONS[sel.id].e} ${sel.k ? 'Déplacée' : 'Posée'} !`, { cle: 'deco' });
    sel.F.liberer(); sel = null; dessiner(); H.surChange && H.surChange();
  }
  function ranger() {
    if (!sel || !sel.k) return;
    PR.rangerDeco(sel.k); pop(); toast(`📦 ${DECORATIONS[sel.id].nom} : rangée dans ton stock.`, { cle: 'deco' });
    sel.F.liberer(); sel = null; dessiner(); H.surChange && H.surChange();
  }
  function annuler() {
    if (!sel) return;
    if (sel.k && sel.ancienne) H.domaine.ajouterDeco(sel.ancienne);
    sel.F.liberer(); sel = null; dessiner();
  }
  /* toucher l'écran : une décoration posée (la déplacer), ou le sol (y mettre le fantôme) */
  function toucher(x, y) {
    if (!U) return false;
    ndc.set(x / innerWidth * 2 - 1, -(y / innerHeight) * 2 + 1); H.ray.setFromCamera(ndc, H.camera);
    if (!sel) {
      const liste = [...H.domaine.decos.values()], h = H.ray.intersectObjects(liste.map(A => A.R.g), true)[0];
      if (h) {
        let o = h.object; while (o && !liste.some(A => A.R.g === o)) o = o.parent;
        const A = liste.find(A => A.R.g === o);
        if (A) { pop(); const D = { ...A.D }; H.domaine.retirerDeco(D.k); nouveauFantome(D.id, D.x, D.z, D.r || 0, D.k, D); }
      }
      return true;
    }
    const s = sol(x, y); if (s) placer(...s);
    return true;
  }
  function ouvrir() {
    if (U) return;
    U = el('<div id="decorer"></div>'); document.body.appendChild(U); document.body.classList.add('enDeco');
    dessiner();
  }
  function fermer() {
    if (!U) return;
    annuler(); U.remove(); U = null; document.body.classList.remove('enDeco');
    H.surChange && H.surChange();
  }
  return { ouvrir, fermer, actif: () => !!U, toucher, choisir, poser, ranger, get selection() { return sel; } };
}
