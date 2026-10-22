/* ══════════ LE PORTRAIT SVG D'UNE DINDIE ══════════
   Fabriqué depuis le même ADN que le modèle 3D (voir adn.js / variante()).
   portraitDindie(adn, { id, silhouette, fond }) → texte SVG (viewBox 200 × 200) */
import { assombrir, eclaircir, ARC, hasard } from '../moteur/couleurs.js';

const FONDS = {
  prairie: ['#d9f99d', '#65a30d'], sable: ['#fde68a', '#d97706'], pluie: ['#bfdbfe', '#475569'], jungle: ['#a7f3d0', '#047857'],
  glace: ['#ecfeff', '#38bdf8'], feu: ['#fed7aa', '#b91c1c'], nuit: ['#4338ca', '#0b1026'], ciel: ['#e0f2fe', '#60a5fa']
};

export function portraitDindie(adn, { id = 'p' + Math.random().toString(36).slice(2, 8), silhouette = false, fond = true } = {}) {
  const a = silhouette ? { ...adn, aura: null, chroma: false } : adn;
  const N = silhouette ? '#334155' : null;           /* en silhouette, tout est d'une seule couleur */
  const C = c => N || c;
  const defs = [], d = [];
  let k = 0;
  const vol = c => {
    if (N) return `fill="${N}" stroke="#1e293b" stroke-width="2"`;
    const g = `${id}g${k++}`;
    defs.push(`<radialGradient id="${g}" cx="35%" cy="28%" r="80%"><stop offset="0" stop-color="${eclaircir(c, .35)}"/><stop offset=".55" stop-color="${c}"/><stop offset="1" stop-color="${assombrir(c, .22)}"/></radialGradient>`);
    return `fill="url(#${g})" stroke="${assombrir(c, .45)}" stroke-width="2.2"`;
  };
  const poussin = a.stade === 'poussin', jeune = a.stade === 'jeune', eveille = a.stade === 'eveille';
  const ech = poussin ? .74 : jeune ? .88 : 1;
  const rr = hasard(a.id || 'x');

  /* ── le fond, selon le type ── */
  if (fond) {
    const [f1, f2] = silhouette ? ['#cbd5e1', '#64748b'] : FONDS[a.fond] || FONDS.prairie;
    defs.push(`<radialGradient id="${id}f" cx="50%" cy="38%" r="75%"><stop offset="0" stop-color="${f1}"/><stop offset="1" stop-color="${f2}"/></radialGradient>`);
    d.push(`<rect width="200" height="200" fill="url(#${id}f)"/>`);
    if (!silhouette) {
      if (a.fond === 'nuit') { for (let i = 0; i < 26; i++) d.push(`<circle cx="${(i * 73) % 197}" cy="${(i * 41) % 120}" r="${i % 3 ? .9 : 1.6}" fill="#fff" opacity="${.5 + (i % 4) * .12}"/>`); d.push('<circle cx="160" cy="34" r="16" fill="#fef9c3"/>'); }
      else if (a.fond === 'pluie') for (let i = 0; i < 18; i++) d.push(`<path d="M${(i * 37) % 200} ${(i * 53) % 150} l-4 10" stroke="#e0f2fe" stroke-width="2" stroke-linecap="round" opacity=".7"/>`);
      else if (a.fond === 'sable') d.push('<path d="M0 150 Q50 120 100 145 T200 135 V200 H0Z" fill="#fbbf24" opacity=".6"/><circle cx="40" cy="38" r="16" fill="#fff7ae" opacity=".8"/>');
      else if (a.fond === 'glace') d.push('<path d="M0 160 L40 120 L70 150 L110 110 L150 150 L200 125 V200 H0Z" fill="#f0f9ff" opacity=".7"/>');
      else if (a.fond === 'feu') d.push('<path d="M60 200 L95 120 L105 120 L140 200Z" fill="#7f1d1d" opacity=".5"/><circle cx="100" cy="118" r="10" fill="#fb923c" opacity=".7"/>');
      else if (a.fond === 'ciel') d.push('<g fill="#fff" opacity=".85"><circle cx="35" cy="150" r="20"/><circle cx="60" cy="155" r="16"/><circle cx="160" cy="45" r="15"/><circle cx="178" cy="50" r="11"/></g>');
      else if (a.fond === 'jungle') d.push('<g fill="#065f46" opacity=".45"><path d="M0 60 q30 10 40 40 q-30 -5 -40 -20z"/><path d="M200 40 q-35 15 -40 45 q30 -5 40 -25z"/></g>');
      else d.push('<path d="M0 160 Q60 140 120 158 T200 150 V200 H0Z" fill="#4d7c0f" opacity=".35"/>');
    }
  }
  d.push(`<ellipse cx="100" cy="178" rx="${58 * ech}" ry="9" fill="#000" opacity=".22"/>`);
  /* ── l'aura ── */
  if (a.aura) {
    const cs = a.aura === 'arc' ? ARC : [a.aura];
    defs.push(`<filter id="${id}b" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="7"/></filter>`);
    cs.forEach((c, i) => { const an = i / cs.length * Math.PI * 2, r = cs.length > 1 ? 22 : 0; d.push(`<circle cx="${100 + Math.cos(an) * r}" cy="${108 + Math.sin(an) * r}" r="${cs.length > 1 ? 52 : 72}" fill="${c}" opacity="${cs.length > 1 ? .42 : .5}" filter="url(#${id}b)"/>`); });
  }
  d.push(`<g transform="translate(100 112) scale(${ech}) translate(-100 -112)">`);

  /* ── la cape, derrière tout ── */
  if (a.accessoire === 'cape') d.push(`<path d="M52 108 Q100 92 148 108 L162 178 Q100 190 38 178 Z" ${vol(a.couleurAccessoire)}/>`);
  /* ── la queue en éventail ── */
  if (!poussin) {
    const n = eveille ? 13 : jeune ? 7 : 11, L = eveille ? 96 : jeune ? 52 : 80, w = eveille ? 26 : jeune ? 18 : 23, ouvre = eveille ? 92 : jeune ? 60 : 80;
    for (let i = 0; i < n; i++) {
      const an = -ouvre + 2 * ouvre * i / (n - 1), c = a.motifQueue === 'arc' ? ARC[i % ARC.length] : a.motifQueue === 'flammes' && i % 2 ? eclaircir(a.queue, .15) : a.queue;
      let p = `<g transform="translate(100 118) rotate(${an})"><ellipse cx="0" cy="${-L / 2}" rx="${w / 2}" ry="${L / 2}" ${vol(c)}/>`;
      if (!N) {
        p += `<path d="M0 -6 V${-L + 10}" stroke="${assombrir(c, .35)}" stroke-width="1.4" opacity=".6"/>`;
        const m = a.motifQueue;
        if (m === 'bandes') p += `<ellipse cx="0" cy="${-L * .84}" rx="${w / 2 - 2}" ry="${L * .08}" fill="${a.bande}"/>`;
        if (m === 'arc') p += `<ellipse cx="0" cy="${-L * .86}" rx="${w / 2 - 2}" ry="${L * .07}" fill="${eclaircir(c, .6)}"/>`;
        if (m === 'ocelles') p += `<circle cx="0" cy="${-L * .8}" r="${w * .31}" fill="${a.bande}"/><circle cx="0" cy="${-L * .8}" r="${w * .16}" fill="${assombrir(c, .55)}"/>`;
        if (m === 'belge') p += `<ellipse cx="0" cy="${-L * .9}" rx="${w / 2 - 2}" ry="${L * .055}" fill="#111"/><ellipse cx="0" cy="${-L * .76}" rx="${w / 2 - 1.5}" ry="${L * .055}" fill="#facc15"/>`;
        if (m === 'flammes') p += `<path d="M${-w * .32} ${-L * .74} Q0 ${-L * 1.06} ${w * .32} ${-L * .74} Q0 ${-L * .84} ${-w * .32} ${-L * .74}Z" fill="${a.bande}"/>`;
        if (m === 'etoiles') p += etoileSvg(0, -L * .8, w * .3, a.bande);
      }
      d.push(p + '</g>');
    }
  }
  /* ── le corps, son motif, le ventre, les ailes, les pattes ── */
  const rx = poussin ? 44 : 47, ry = poussin ? 42 : 44;
  d.push(`<ellipse cx="100" cy="134" rx="${rx}" ry="${ry}" ${vol(a.corps)}/>`);
  if (!N && a.motifCorps && a.motifCorps !== 'uni') {
    defs.push(`<clipPath id="${id}c"><ellipse cx="100" cy="134" rx="${rx - 1.5}" ry="${ry - 1.5}"/></clipPath>`);
    d.push(`<g clip-path="url(#${id}c)" opacity=".9">${motifCorps(a, rx, ry, rr)}</g>`);
  }
  d.push(`<ellipse cx="100" cy="148" rx="${rx * .56}" ry="${ry * .52}" fill="${C(a.ventre)}" opacity="${N ? 0 : .6}"/>`);
  for (const s of [-1, 1]) {
    d.push(`<g transform="translate(${100 + s * (rx - 6)} 136) rotate(${s * 18})"><ellipse cx="0" cy="0" rx="${poussin ? 11 : 15}" ry="${poussin ? 20 : 28}" ${vol(a.aile)}/>` +
      (poussin || N ? '' : `<path d="M${-s * 4} -10 q${s * 6} 14 0 26 M${s * 3} -14 q${s * 6} 14 0 28" stroke="${assombrir(a.aile, .4)}" stroke-width="1.5" fill="none" opacity=".6"/>`) + '</g>');
  }
  for (const s of [-1, 1]) d.push(`<path d="M${100 + s * 13} 174 l-6 7 m6 -7 l0 9 m0 -9 l6 7" stroke="${C('#f59e0b')}" stroke-width="4" stroke-linecap="round" fill="none"/>`);
  /* ── le cou, la crête (derrière), la tête ── */
  const tY = poussin ? 92 : 80, tR = poussin ? 30 : 26, peau = poussin ? a.corps : a.tete;
  if (!poussin) d.push(`<ellipse cx="100" cy="104" rx="15" ry="14" ${vol(peau)}/>`);
  if (a.accessoire === 'echarpe') d.push(`<path d="M82 100 Q100 112 118 100 L120 108 Q100 120 80 108Z" ${vol(a.couleurAccessoire)}/><path d="M110 106 l6 18 l-8 2 l-4 -16z" ${vol(a.couleurAccessoire)}/>`);
  d.push(...creteSvg(a, tY, tR, vol, C));
  d.push(`<circle cx="100" cy="${tY}" r="${tR}" ${vol(peau)}/>`);
  if (poussin && !N) d.push(`<path d="M94 ${tY - tR + 2} q6 -12 10 -2 q4 -8 6 4" stroke="${assombrir(a.corps, .35)}" stroke-width="2.5" fill="none" stroke-linecap="round"/>`);
  if (!N) {
    /* les joues, les yeux (gros, avec des reflets) */
    for (const s of [-1, 1]) d.push(`<ellipse cx="${100 + s * 17}" cy="${tY + 9}" rx="6.5" ry="3.8" fill="#fb7185" opacity=".55"/>`);
    const g = a.yeux === 'hibou' ? 1.2 : 1;
    for (const s of [-1, 1]) {
      const x = 100 + s * 10.5, y = tY - 2;
      d.push(`<ellipse cx="${x}" cy="${y}" rx="${8.2 * g}" ry="${9.8 * g}" fill="#fff" stroke="#1f2937" stroke-width="1.6"/>`);
      if (a.yeux === 'hibou') d.push(`<circle cx="${x + s * .8}" cy="${y + .6}" r="7.4" fill="#facc15"/>`);
      d.push(`<circle cx="${x + s * .8}" cy="${y + 1.2}" r="5.6" fill="#1f2937"/><circle cx="${x + s * .8 - 1.8}" cy="${y - 1.6}" r="2.2" fill="#fff"/><circle cx="${x + s * .8 + 1.8}" cy="${y + 3}" r="1" fill="#fff"/>`);
      if (a.yeux === 'malins') d.push(`<path d="M${x - 9} ${y - 3} Q${x} ${y - 13} ${x + 9} ${y - 3} L${x + 9} ${y - 12} L${x - 9} ${y - 12}Z" fill="${peau}"/><path d="M${x - 9} ${y - 3} Q${x} ${y - 7 + s} ${x + 9} ${y - 3}" stroke="#1f2937" stroke-width="1.6" fill="none"/>`);
    }
    /* le barbillon, la caroncule sur le côté, le bec par-dessus */
    if (!poussin) {
      d.push(`<ellipse cx="94" cy="${tY + 24}" rx="5.5" ry="7.5" ${vol(assombrir(a.caroncule, .1))}/>`);
      d.push(`<path d="M103 ${tY + 6} q7 0 7 8 q0 8 3 14 q-4 3 -7 -1 q-3 -6 -4 -12 z" ${vol(a.caroncule)}/>`);
    }
    d.push(`<path d="M93.5 ${tY + 9} L106.5 ${tY + 9} L100 ${tY + 19} Z" fill="#fbbf24" stroke="#b45309" stroke-width="1.6" stroke-linejoin="round"/>`);
  }
  d.push(...chapeauSvg(a, tY, vol, C));
  d.push('</g>');
  /* ── les étincelles ── */
  if (a.aura || a.chroma) {
    [[30, 60, 7], [172, 76, 9], [40, 140, 5], [164, 150, 6], [148, 30, 4], [58, 26, 5]].forEach(([x, y, r], i) =>
      d.push(etoile4(x, y, r, a.chroma ? '#fff7c2' : a.aura === 'arc' ? ARC[i * 3 % 8] : '#ffffff')));
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><defs>${defs.join('')}</defs>${d.join('')}</svg>`;
}

const etoile4 = (x, y, r, c) => `<path d="M${x} ${y - r} Q${x + r * .18} ${y - r * .18} ${x + r} ${y} Q${x + r * .18} ${y + r * .18} ${x} ${y + r} Q${x - r * .18} ${y + r * .18} ${x - r} ${y} Q${x - r * .18} ${y - r * .18} ${x} ${y - r}Z" fill="${c}"/>`;
function etoileSvg(x, y, r, c) {
  let p = '';
  for (let i = 0; i < 10; i++) { const an = -Math.PI / 2 + i * Math.PI / 5, q = i % 2 ? r * .45 : r; p += (i ? 'L' : 'M') + (x + Math.cos(an) * q).toFixed(1) + ' ' + (y + Math.sin(an) * q).toFixed(1); }
  return `<path d="${p}Z" fill="${c}"/>`;
}
function motifCorps(a, rx, ry, rr) {
  const c = a.couleurMotif, m = a.motifCorps, o = [];
  const x0 = 100 - rx, y0 = 134 - ry;
  if (m === 'pois') for (let l = 0; l < 5; l++) for (let k = 0; k < 6; k++) o.push(`<circle cx="${x0 + 8 + k * 17 + (l % 2) * 8}" cy="${y0 + 10 + l * 18}" r="4.6" fill="${c}"/>`);
  if (m === 'taches') for (let i = 0; i < 12; i++) { const x = x0 + rr() * rx * 2, y = y0 + rr() * ry * 2; o.push(`<ellipse cx="${x}" cy="${y}" rx="${4 + rr() * 5}" ry="${3.5 + rr() * 4}" transform="rotate(${rr() * 90} ${x} ${y})" fill="${c}"/>`); }
  if (m === 'rayures') for (let k = 0; k < 8; k++) o.push(`<path d="M${x0 + k * 14} ${y0 - 5} q8 25 0 50 q-8 25 0 50" stroke="${c}" stroke-width="5" fill="none"/>`);
  if (m === 'gaufre') { for (let k = 0; k < 9; k++) o.push(`<path d="M${x0 + k * 12} ${y0} V${y0 + ry * 2}" stroke="${c}" stroke-width="2.6"/>`); for (let k = 0; k < 8; k++) o.push(`<path d="M${x0} ${y0 + 4 + k * 12} H${x0 + rx * 2}" stroke="${c}" stroke-width="2.6"/>`); }
  if (m === 'losanges') for (let k = -6; k < 12; k++) o.push(`<path d="M${x0 + k * 14} ${y0} l${ry * 2} ${ry * 2} M${x0 + k * 14 + ry * 2} ${y0} l${-ry * 2} ${ry * 2}" stroke="${c}" stroke-width="2.4"/>`);
  if (m === 'flocons') for (let i = 0; i < 9; i++) { const x = x0 + 10 + rr() * (rx * 2 - 20), y = y0 + 10 + rr() * (ry * 2 - 20); for (let j = 0; j < 3; j++) { const an = j * Math.PI / 3; o.push(`<path d="M${x - Math.cos(an) * 5} ${y - Math.sin(an) * 5} L${x + Math.cos(an) * 5} ${y + Math.sin(an) * 5}" stroke="${c}" stroke-width="1.6" stroke-linecap="round"/>`); } }
  if (m === 'etoiles') for (let i = 0; i < 9; i++) o.push(etoileSvg(x0 + 10 + rr() * (rx * 2 - 20), y0 + 10 + rr() * (ry * 2 - 20), 4.5, c));
  if (m === 'eclairs') for (let k = 0; k < 5; k++) { const x = x0 + 10 + k * 19; o.push(`<path d="M${x} ${y0 + 10} l8 22 l-6 4 l8 26" stroke="${c}" stroke-width="3" fill="none" stroke-linejoin="round"/>`); }
  return o.join('');
}
function creteSvg(a, tY, tR, vol, C) {
  const o = [], c = a.couleurCrete, top = tY - tR;
  if (a.crete === 'touffe') for (const an of [-22, 0, 22]) o.push(`<g transform="translate(100 ${top + 4}) rotate(${an})"><ellipse cx="0" cy="-10" rx="4" ry="12" ${vol(c || a.queue)}/></g>`);
  if (a.crete === 'punk') o.push(`<path d="M80 ${tY - 18} l6 -22 l6 16 l8 -24 l7 22 l8 -18 l5 24 z" ${vol(c || a.bande)}/>`);
  if (a.crete === 'cornes') for (const s of [-1, 1]) o.push(`<path d="M${100 + s * 14} ${top + 8} q${s * 4} -14 ${s * 14} -20 q${-s * 2} 12 ${-s * 6} 24z" ${vol(c || '#f5f5f4')}/>`);
  if (a.crete === 'flamme') { o.push(`<path d="M86 ${top + 6} Q84 ${top - 14} 92 ${top - 20} Q92 ${top - 8} 98 ${top - 6} Q96 ${top - 26} 104 ${top - 32} Q106 ${top - 14} 112 ${top - 14} Q118 ${top - 4} 114 ${top + 6}Z" ${vol(c || '#f97316')}/>`); if (!a.couleurCrete) o.push(`<path d="M95 ${top + 4} Q96 ${top - 8} 103 ${top - 14} Q104 ${top - 4} 108 ${top + 4}Z" fill="#fde047"/>`); }
  if (a.crete === 'antennes') for (const s of [-1, 1]) o.push(`<path d="M${100 + s * 6} ${top + 4} q${s * 4} -14 ${s * 12} -20" stroke="${C(assombrir(a.corps, .3))}" stroke-width="2" fill="none"/><circle cx="${100 + s * 18}" cy="${top - 16}" r="4.5" ${vol(a.bande)}/>`);
  if (a.crete === 'cristaux') [[-12, 14, -25], [-4, 22, -8], [5, 24, 8], [13, 16, 25]].forEach(([dx, h, an]) => o.push(`<g transform="translate(${100 + dx} ${top + 6}) rotate(${an})"><path d="M-4 0 L0 ${-h} L4 0Z" ${vol(c || '#e0f2fe')}/></g>`));
  return o;
}
function chapeauSvg(a, tY, vol, C) {
  const o = [], top = tY - 26;
  if (a.crete === 'couronne') o.push(`<path d="M82 ${tY - 20} l5 -18 l7 12 l6 -16 l6 16 l7 -12 l5 18 z" ${vol('#facc15')}/>` + (C('#ef4444') === '#ef4444' ? `<circle cx="100" cy="${tY - 27}" r="3" fill="#ef4444"/><circle cx="88" cy="${tY - 24}" r="2.2" fill="#3b82f6"/><circle cx="112" cy="${tY - 24}" r="2.2" fill="#22c55e"/>` : ''));
  if (a.crete === 'fleurs') ['#f9a8d4', '#ffffff', '#fde047', '#f472b6', '#c4b5fd'].forEach((c, i) => {
    const an = -1.1 + i * .55, x = 100 + Math.sin(an) * 22, y = tY - Math.cos(an) * 22;
    for (let k = 0; k < 5; k++) { const b = k / 5 * Math.PI * 2; o.push(`<circle cx="${x + Math.cos(b) * 3.6}" cy="${y + Math.sin(b) * 3.6}" r="3" fill="${C(c)}"/>`); }
    o.push(`<circle cx="${x}" cy="${y}" r="2.2" fill="${C('#facc15')}"/>`);
  });
  if (a.crete === 'etoile') o.push(etoileSvg(100, top - 10, 11, C('#fde047')));
  if (a.chapeau === 'fez') o.push(`<path d="M86 ${tY - 20} L90 ${tY - 40} L110 ${tY - 40} L114 ${tY - 20} Z" ${vol('#dc2626')}/><path d="M100 ${tY - 40} q10 2 12 14" stroke="${C('#111')}" stroke-width="2" fill="none"/><circle cx="112" cy="${tY - 25}" r="3" fill="${C('#facc15')}"/>`);
  if (a.chapeau === 'turban') o.push(`<ellipse cx="100" cy="${tY - 24}" rx="25" ry="13" ${vol('#f8fafc')}/><ellipse cx="100" cy="${tY - 32}" rx="18" ry="10" ${vol('#fef3c7')}/><circle cx="100" cy="${tY - 22}" r="4" fill="${C('#dc2626')}"/><path d="M100 ${tY - 26} q4 -16 -2 -22" stroke="${C('#a855f7')}" stroke-width="4" fill="none" stroke-linecap="round"/>`);
  if (a.chapeau === 'toque') o.push(`<rect x="86" y="${tY - 44}" width="28" height="22" rx="3" ${vol('#ffffff')}/><ellipse cx="100" cy="${tY - 46}" rx="20" ry="11" ${vol('#ffffff')}/>`);
  if (a.chapeau === 'pirate') o.push(`<path d="M68 ${tY - 18} Q100 ${tY - 50} 132 ${tY - 18} Q100 ${tY - 26} 68 ${tY - 18}Z" ${vol('#111827')}/><circle cx="100" cy="${tY - 30}" r="4" fill="${C('#f8fafc')}"/>`);
  /* les chapeaux de l'Atelier des plumes */
  const c1 = a.couleurChapeau || '#ef4444', c2 = a.couleurChapeau2 || '#fde68a', y = tY;
  if (a.chapeau === 'fete') o.push(`<path d="M86 ${y - 21} L100 ${y - 62} L114 ${y - 21} Z" ${vol(c1)}/><circle cx="95" cy="${y - 30}" r="3" fill="${C(c2)}"/><circle cx="104" cy="${y - 40}" r="2.6" fill="${C(c2)}"/><circle cx="98" cy="${y - 50}" r="2.2" fill="${C(c2)}"/><ellipse cx="100" cy="${y - 21}" rx="16" ry="4.5" ${vol(c2)}/><circle cx="100" cy="${y - 63}" r="6" ${vol(c2)}/>`);
  if (a.chapeau === 'noeud') o.push(`<path d="M100 ${y - 28} Q80 ${y - 50} 72 ${y - 32} Q76 ${y - 14} 100 ${y - 28}Z" ${vol(c1)}/><path d="M100 ${y - 28} Q120 ${y - 50} 128 ${y - 32} Q124 ${y - 14} 100 ${y - 28}Z" ${vol(c1)}/><circle cx="100" cy="${y - 28}" r="6.5" ${vol(c2)}/>`);
  if (a.chapeau === 'beret') o.push(`<ellipse cx="104" cy="${y - 25}" rx="31" ry="11" transform="rotate(-8 104 ${y - 25})" ${vol(c1)}/><rect x="106" y="${y - 42}" width="4.5" height="9" rx="2" fill="${C(c2)}"/>`);
  if (a.chapeau === 'bonnet') o.push(`<path d="M73 ${y - 14} Q73 ${y - 52} 100 ${y - 52} Q127 ${y - 52} 127 ${y - 14}Z" ${vol(c1)}/><rect x="71" y="${y - 21}" width="58" height="11" rx="5" ${vol(c2)}/><circle cx="100" cy="${y - 54}" r="9" ${vol(c2)}/>`);
  if (a.chapeau === 'casquette') o.push(`<path d="M76 ${y - 17} Q76 ${y - 48} 100 ${y - 48} Q124 ${y - 48} 124 ${y - 17}Z" ${vol(c1)}/><path d="M100 ${y - 19} Q132 ${y - 24} 144 ${y - 13} Q122 ${y - 8} 100 ${y - 15}Z" ${vol(c2)}/><circle cx="100" cy="${y - 48}" r="3.5" fill="${C(c2)}"/>`);
  if (a.chapeau === 'fleurs') {
    o.push(`<path d="M75 ${y - 15} Q100 ${y - 36} 125 ${y - 15}" stroke="${C(c1)}" stroke-width="6" fill="none" stroke-linecap="round"/>`);
    [[78, -19], [88, -26], [100, -29], [112, -26], [122, -19]].forEach(([x, dy], i) => {
      const cf = i % 2 ? '#ffffff' : c2;
      for (let k = 0; k < 5; k++) { const b = k / 5 * Math.PI * 2; o.push(`<circle cx="${x + Math.cos(b) * 4}" cy="${y + dy + Math.sin(b) * 4}" r="3.4" fill="${C(cf)}"/>`); }
      o.push(`<circle cx="${x}" cy="${y + dy}" r="2.4" fill="${C('#facc15')}"/>`);
    });
  }
  if (a.chapeau === 'hautForme') o.push(`<ellipse cx="100" cy="${y - 20}" rx="27" ry="5.5" ${vol(c1)}/><rect x="84" y="${y - 64}" width="32" height="44" rx="3" ${vol(c1)}/><rect x="84" y="${y - 31}" width="32" height="7" fill="${C(c2)}"/><ellipse cx="100" cy="${y - 64}" rx="16" ry="3.5" fill="${C(assombrir(c1, .15))}"/>`);
  if (a.chapeau === 'sombrero') {
    o.push(`<ellipse cx="100" cy="${y - 19}" rx="46" ry="9" ${vol(c1)}/><path d="M84 ${y - 21} Q86 ${y - 54} 100 ${y - 54} Q114 ${y - 54} 116 ${y - 21}Z" ${vol(c1)}/><rect x="84.5" y="${y - 30}" width="31" height="6" fill="${C(c2)}"/>`);
    for (const x of [60, 74, 126, 140]) o.push(`<circle cx="${x}" cy="${y - 13}" r="3.6" fill="${C(c2)}"/>`);
  }
  if (a.chapeau === 'cowboy') o.push(`<path d="M80 ${y - 20} Q77 ${y - 52} 92 ${y - 50} Q100 ${y - 44} 108 ${y - 50} Q123 ${y - 52} 120 ${y - 20}Z" ${vol(c1)}/><path d="M56 ${y - 30} Q66 ${y - 13} 100 ${y - 15} Q134 ${y - 13} 144 ${y - 30} Q134 ${y - 21} 100 ${y - 23} Q66 ${y - 21} 56 ${y - 30}Z" ${vol(c1)}/><rect x="80" y="${y - 30}" width="40" height="6" fill="${C(c2)}"/>`);
  if (a.chapeau === 'viking') o.push(`<path d="M74 ${y - 27} Q55 ${y - 34} 54 ${y - 60} Q66 ${y - 42} 82 ${y - 38}Z" ${vol(c2)}/><path d="M126 ${y - 27} Q145 ${y - 34} 146 ${y - 60} Q134 ${y - 42} 118 ${y - 38}Z" ${vol(c2)}/><path d="M72 ${y - 12} Q72 ${y - 52} 100 ${y - 52} Q128 ${y - 52} 128 ${y - 12}Z" ${vol(c1)}/><rect x="70" y="${y - 20}" width="60" height="9" rx="3" ${vol(assombrir(c1, .25))}/><circle cx="100" cy="${y - 52}" r="4" fill="${C(assombrir(c1, .25))}"/>`);
  if (a.chapeau === 'champignon') {
    o.push(`<path d="M64 ${tY - 12} Q64 ${tY - 50} 100 ${tY - 50} Q136 ${tY - 50} 136 ${tY - 12} Q100 ${tY - 20} 64 ${tY - 12}Z" ${vol('#dc2626')}/>`);
    if (C('#fff') === '#fff') [[82, -30, 5], [100, -40, 5.5], [118, -30, 5], [74, -18, 3.5], [126, -18, 3.5], [100, -24, 3.5]].forEach(([x, dy, r]) => o.push(`<circle cx="${x}" cy="${tY + dy}" r="${r}" fill="#fff"/>`));
  }
  return o;
}
