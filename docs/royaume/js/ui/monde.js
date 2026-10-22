/* ══════════ LA CARTE DU MONDE ET LE VOYAGE EN MONTGOLFIÈRE ══════════
   ouvrirMonde({ ici, ouverte(id), surChoix(id) }) : les 8 îles du Royaume et le Domaine ;
   voyager(destination, installer) : l'écran des nuages pendant que l'île se construit. */
import { REGIONS, DOMAINE_CARTE } from '../donnees/regions.js';
import { PAR_ID } from '../donnees/especes.js';
import { TYPES } from '../donnees/types.js';
import { variante } from '../dindies/adn.js';
import { portraitDindie } from '../dindies/portrait.js';
import { fenetre, $, $$, el } from '../moteur/ui.js';
import { pop, vent, tada } from '../moteur/sons.js';
import { hasard } from '../moteur/couleurs.js';
import * as J from '../jeu/etat.js';

/* une île dessinée à la main (un contour un peu bosselé) */
function ile(id, cx, cy, r) {
  const h = hasard('ile' + id), n = 14; let d = '';
  for (let k = 0; k <= n; k++) {
    const a = k / n * Math.PI * 2, rr = r * (.8 + h() * .35), x = cx + Math.cos(a) * rr * 1.25, y = cy + Math.sin(a) * rr * .85;
    d += (k ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1);
  }
  return d + 'Z';
}
export function ouvrirMonde({ ici, ouverte, surChoix }) {
  const [dx, dy] = DOMAINE_CARTE;
  const iles = Object.entries(REGIONS).map(([id, R]) => {
    const ok = !R.bientot && ouverte(id), [x, y] = R.carte, T = TYPES[R.type];
    return `<g class="ileMonde ${ok ? 'ouverte' : 'fermee'}" data-id="${id}">
      <path d="M${dx} ${dy} Q${(dx + x) / 2 + (y - dy) * .2} ${(dy + y) / 2 - (x - dx) * .2} ${x} ${y}" class="route ${ok ? '' : 'pale'}"/>
      <path d="${ile(id, x, y, 6.2)}" fill="${ok ? T.clair : '#cbd5e1'}" stroke="${ok ? T.couleur : '#94a3b8'}" stroke-width="1.1"/>
      <text x="${x}" y="${y + 1.6}" font-size="5.4" text-anchor="middle">${ok ? R.e : '🔒'}</text>
      <text x="${x}" y="${y + 9.6}" font-size="3" text-anchor="middle" class="nomIle">${R.nom}</text>
      ${ici === id ? `<text x="${x + 5}" y="${y - 4}" font-size="5" class="ballonIci">🎈</text>` : ''}</g>`;
  }).join('');
  const F = fenetre('🗺️ Le Royaume des Dindies', `<svg class="mondeSvg" viewBox="0 0 100 100">
      <defs><radialGradient id="merM" cx="50%" cy="50%" r="70%"><stop offset="0" stop-color="#7dd3fc"/><stop offset="1" stop-color="#0284c7"/></radialGradient></defs>
      <rect width="100" height="100" rx="4" fill="url(#merM)"/>
      ${[[12, 12], [86, 44], [40, 92], [64, 30], [8, 70]].map(([x, y]) => `<path d="M${x} ${y} q2 -1.5 4 0 q2 1.5 4 0" stroke="#e0f2fe" stroke-width=".5" fill="none" opacity=".7"/>`).join('')}
      ${iles}
      <g class="ileMonde ouverte" data-id="domaine"><path d="${ile('domaine', dx, dy, 7.4)}" fill="#bbf7d0" stroke="#16a34a" stroke-width="1.3"/>
        <text x="${dx}" y="${dy + 1.8}" font-size="6" text-anchor="middle">🏡</text><text x="${dx}" y="${dy + 11}" font-size="3.2" text-anchor="middle" class="nomIle">Le Domaine</text>
        ${ici === 'domaine' ? `<text x="${dx + 6}" y="${dy - 4.5}" font-size="5" class="ballonIci">🎈</text>` : ''}</g>
      <g transform="translate(91 91)" opacity=".8"><circle r="6" fill="#fef3c7" stroke="#b45309" stroke-width=".6"/><path d="M0 -5 L1.4 0 L0 5 L-1.4 0Z" fill="#dc2626"/><text y="-6.6" font-size="2.6" text-anchor="middle">N</text></g>
    </svg><div id="mInfo" class="mondeInfo"><p class="petitTexte">🎈 C’est là que tu es. Touche une île pour voir ce qui t’y attend.</p></div>`, { classe: 'mondeF', large: true });
  $$('.ileMonde', F.el).forEach(g => g.onclick = () => {
    pop();
    const id = g.dataset.id, info = $('#mInfo', F.el);
    if (id === 'domaine') {
      info.innerHTML = `<p><b>🏡 Le Domaine des Dindies</b> : ta maison, tes enclos, le Clapier, la boutique de Mimi.</p>${ici === 'domaine' ? '<p class="petitTexte">Tu y es !</p>' : '<button class="btn grand vert" id="mPartir">🎈 Rentrer au Domaine</button>'}`;
    } else {
      const R = REGIONS[id], ok = !R.bientot && ouverte(id);
      if (R.bientot) info.innerHTML = `<p><b>${R.e} ${R.nom}</b> : 🚧 cette île n’est pas encore sur les cartes du Capitaine… Elle arrive dans une prochaine étape !</p>`;
      else if (!ok) info.innerHTML = `<p><b>🔒 ${R.nom}</b> : le Capitaine Zéphyr ne connaît pas encore la route. Continue ta quête pour l’ouvrir !</p>`;
      else {
        const L = J.etat().livre, esp = Object.keys(R.especes);
        info.innerHTML = `<p><b>${R.e} ${R.nom}</b> · ${TYPES[R.type].e} ${TYPES[R.type].nom}</p><p class="petitTexte">${R.desc}</p>
          <div class="mondeEspeces">${esp.map(e => `<div class="${L.attrapes[e] ? 'ok' : ''}">${portraitDindie(variante(PAR_ID[e]), { id: 'm' + e, silhouette: !L.vus[e], fond: false })}<small>${L.attrapes[e] ? '✅' : L.vus[e] ? '👁️' : '?'}</small></div>`).join('')}</div>
          ${ici === id ? '<p class="petitTexte">Tu y es !</p>' : '<button class="btn grand vert" id="mPartir">🎈 S’envoler !</button>'}`;
      }
    }
    const b = $('#mPartir', F.el); if (b) b.onclick = () => { pop(); F.fermer(); surChoix(id); };
  });
  return F;
}

/* le voyage : un ciel de nuages, la montgolfière qui flotte, puis le nom de l'île */
export function voyager(dest, installer) {
  return new Promise(resoudre => {
    const V = el(`<div id="voyage"><div class="nuagesV"><i></i><i></i><i></i><i></i><i></i><i></i></div>
      <div class="ballonV">🎈</div><p class="texteV">En route vers <b>${dest.nom}</b>…</p><p class="titreV">${dest.e} ${dest.nom}</p></div>`);
    document.body.appendChild(V);
    vent();
    const t0 = performance.now();
    requestAnimationFrame(() => V.classList.add('visible'));
    setTimeout(() => {
      try { installer(); } catch (e) { console.error(e); }
      const reste = Math.max(0, 1500 - (performance.now() - t0));
      setTimeout(() => {
        V.classList.add('arrive'); tada();
        setTimeout(() => { V.classList.remove('visible'); setTimeout(() => { V.remove(); resoudre(); }, 550); }, 1100);
      }, reste);
    }, 480);
  });
}
