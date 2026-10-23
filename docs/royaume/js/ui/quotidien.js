/* ══════════ LE PANNEAU DES QUÊTES : LES DÉFIS, LES SUCCÈS (étape 8) ══════════
   Au Panneau des quêtes (sur la place du Domaine) ou depuis le Journal : les défis du jour et de la semaine
   (on réclame leurs récompenses ici), les 100 succès, et la fête du moment (ou la prochaine). */
import { fenetre, toast, $, $$, barre } from '../moteur/ui.js';
import { pop, tada } from '../moteur/sons.js';
import * as DF from '../jeu/defis.js';
import * as SU from '../jeu/succes.js';
import * as EV from '../jeu/evenements.js';
import { OBJETS } from '../jeu/objets.js';
import { astuce } from './astuces.js';

export function ouvrirPanneau({ onglet = 'defis', journal = null, surChange = null } = {}) {
  const F = fenetre('📜 Le Panneau des quêtes', '', { classe: 'panneauF', large: true });
  let cat = 'tout';
  const recompense = R => [R.pieces ? `${R.pieces} 🪙` : '', R.plumesOr ? `${R.plumesOr} 🪶` : '', ...Object.entries(R.objets || {}).map(([o, n]) => `${n > 1 ? n + ' ' : ''}${OBJETS[o].e}`)].filter(Boolean).join(' + ');
  const ligneFete = () => {
    const f = EV.fete();
    if (f) return `<div class="feteBandeau"><span>${f.e}</span><div><b>C’est ${f.nom} au Royaume !</b><small>${f.texte}</small></div></div>`;
    const p = EV.prochaineFete();
    return p ? `<p class="petitTexte">🎉 Prochaine fête : <b>${p.e} ${p.nom}</b>, dans ${p.dans} jour${p.dans > 1 ? 's' : ''}.</p>` : '';
  };
  const bloc = (periode, titre, fin) => {
    const P = DF.defis()[periode]; if (!P) return '';
    const R = DF.RECOMPENSES[periode];
    return `<h3>${titre} <small>${fin}</small></h3>${P.liste.map((x, i) => {
      const k = DF.progres(x), ok = DF.reussi(x);
      return `<div class="defi ${x.reclame ? 'fait' : ok ? 'pret' : ''}"><span class="em">${DF.SORTES[x.sorte].e}</span>
        <div><b>${DF.texteDefi(x)}</b>${barre(k / x.n, ok ? '#22c55e' : '#f59e0b')}<small>${k} / ${x.n} · ${recompense({ pieces: R.pieces })}</small></div>
        ${x.reclame ? '<span class="coche">✅</span>' : ok ? `<button class="btn petit vert" data-reclamer="${periode}:${i}">🎁 Réclamer</button>` : ''}</div>`;
    }).join('')}<p class="petitTexte bonusDefi ${P.bonus ? 'fait' : ''}">${P.bonus ? '✅' : '🎁'} Les 3 défis réussis : <b>+ ${recompense(R.bonus)}</b></p>`;
  };
  const dessiner = () => {
    let h = `<div class="onglets"><button data-o="defis" class="${onglet === 'defis' ? 'actif' : ''}">📅 Les défis${DF.aReclamer() ? ` <i class="pastille">${DF.aReclamer()}</i>` : ''}</button>
      <button data-o="succes" class="${onglet === 'succes' ? 'actif' : ''}">🏆 Les succès</button>${journal ? '<button data-o="journal">📜 Le journal</button>' : ''}</div>`;
    if (onglet === 'defis') {
      h += ligneFete();
      if (!DF.ouverts()) h += '<p class="vide">🎈 Les défis du jour arrivent quand la montgolfière pourra voler !</p>';
      else h += bloc('jour', '☀️ Les défis du jour', '(nouveaux demain)') + bloc('semaine', '📅 Les défis de la semaine', '(jusqu’à dimanche)')
        + `<p class="petitTexte">🏅 Défis réussis : <b>${DF.defis().reussis}</b></p>`;
    } else {
      const O = SU.obtenus(), L = SU.SUCCES.filter(x => cat === 'tout' || x.cat === cat);
      h += `<p class="totalSucces">🏆 <b>${SU.nbObtenus()}</b> / ${SU.SUCCES.length} succès</p>${barre(SU.nbObtenus() / SU.SUCCES.length, '#f59e0b')}
        <div class="formes cats"><button data-c="tout" class="large ${cat === 'tout' ? 'actif' : ''}">Tous</button>${SU.CATEGORIES.map(([k, t]) => `<button data-c="${k}" class="large ${cat === k ? 'actif' : ''}" title="${t}">${t.split(' ')[0]} <small>${SU.SUCCES.filter(x => x.cat === k && O[x.id]).length}/${SU.SUCCES.filter(x => x.cat === k).length}</small></button>`).join('')}</div>
        ${cat !== 'tout' ? `<h3>${SU.CATEGORIES.find(c => c[0] === cat)[1]}</h3>` : ''}
        <div class="succesGrille">${L.map(x => `<div class="succes ${O[x.id] ? 'obtenu' : ''}"><span class="em">${O[x.id] ? x.e : '🔒'}</span><b>${x.n}. ${x.nom}</b><small>${x.desc}</small><i>${O[x.id] ? '✅' : `+ ${x.plumes} 🪶`}</i></div>`).join('')}</div>`;
    }
    F.contenu.innerHTML = h;
    $$('[data-o]', F.contenu).forEach(b => b.onclick = () => { pop(); if (b.dataset.o === 'journal') { F.fermer(); journal(); return; } onglet = b.dataset.o; dessiner(); });
    $$('[data-c]', F.contenu).forEach(b => b.onclick = () => { pop(); cat = b.dataset.c; dessiner(); });
    $$('[data-reclamer]', F.contenu).forEach(b => b.onclick = () => {
      const [periode, i] = b.dataset.reclamer.split(':'), r = DF.reclamer(periode, +i);
      if (!r) return;
      tada(); toast(`🎁 Défi réussi ! + ${r.pieces} 🪙${r.bonus ? ` · 🌟 Les 3 défis ${periode === 'jour' ? 'du jour' : 'de la semaine'} : + ${recompense(r.bonus)} !` : ''}`, { duree: 3600, classe: 'grand', cle: 'defi' });
      surChange && surChange(); dessiner();
    });
  };
  dessiner(); astuce('defis', F);
  return F;
}
