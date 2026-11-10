/* Codes et numéros — mémoire de la vie de tous les jours.
   Quelques informations à retenir (code de porte, numéro de téléphone, place de parking…),
   puis on les retape de mémoire, dans le désordre. 2 manches.
   Niveau : 2 à 4 informations, de plus en plus longues. Une réponse à moitié juste rapporte une partie du point. */
Gala.enregistrer({
  id: 'numeros',
  nom: 'Codes et numéros',
  icone: '🔢',
  domaine: 'memoire',
  consigne: 'Retiens chaque code et chaque numéro avec ce à quoi il sert. Ensuite, on te demande de les retaper de mémoire, dans le désordre.',
  niveaux: 5,
  adaptatif: true,
  mesure: { unite: '% de justes', meilleur: 'haut' },

  demarrer(ctx) {
    Gala.outils.style('numeros', `
      .num-fiche { display: flex; flex-direction: column; gap: .5rem; width: min(94vw, 460px); }
      .num-fiche div { background: var(--carte); border: 1px solid var(--bord); border-radius: 12px; padding: .6rem .9rem; font-size: 1.15rem; }
      .num-fiche b { display: block; font-size: 1.7rem; letter-spacing: .08em; font-variant-numeric: tabular-nums; }
      .num-question { font-size: 1.3rem; font-weight: 700; text-align: center; }
      .num-saisie { display: flex; gap: .5rem; flex-wrap: wrap; justify-content: center; }
      .num-saisie input { font-size: 1.6rem; width: 13rem; padding: .45rem .6rem; border-radius: 10px; border: 2px solid var(--bord);
        background: var(--carte); color: var(--texte); letter-spacing: .08em; text-align: center; text-transform: uppercase; }
      .num-resultat { font-size: 1.15rem; text-align: center; min-height: 1.5em; }
    `);
    const h = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
    const chiffres = n => Array.from({ length: n }, () => h(0, 9)).join('');
    const PRENOMS = ['Sophie', 'Michel', 'Nadine', 'Jean-Pierre', 'Martine', 'Alain', 'Brigitte', 'Patrick'];
    // Chaque modèle renvoie [libellé, valeur à retenir, valeur affichée].
    const MODELES = {
      porte: () => { const v = chiffres(4); return ['Code de la porte d\'entrée', v, v.split('').join(' ')]; },
      porte2: () => { const v = chiffres(3) + String.fromCharCode(65 + h(0, 3)) + chiffres(2); return ['Code de l\'immeuble de ta sœur', v, v.split('').join(' ')]; },
      cadenas: () => { const v = chiffres(3); return ['Code du cadenas du vélo', v, v.split('').join(' ')]; },
      parking: () => { const v = String.fromCharCode(65 + h(0, 5)) + h(100, 399); return ['Place de parking', v, v[0] + ' ' + v.slice(1)]; },
      chambre: () => { const v = String(h(1, 6)) + String(h(0, 3)) + String(h(1, 9)); return ['Numéro de chambre à l\'hôtel', v, v]; },
      avion: () => { const v = h(2, 34) + 'ABCDEF'[h(0, 5)]; return ['Ta place dans l\'avion', v, v]; },
      tel: () => { const v = '06' + chiffres(8); return ['Téléphone de ' + PRENOMS[h(0, PRENOMS.length - 1)], v, v.match(/../g).join(' ')]; },
      telcourt: () => { const v = chiffres(4); return ['Fin du numéro du docteur : 04 76 12 …', v, v.match(/../g).join(' ')]; },
      pin: () => { const v = chiffres(4); return ['Code de la carte bancaire (pour jouer !)', v, v.split('').join(' ')]; },
      rdv: () => { const p = x => String(x).padStart(2, '0'); const j = h(1, 28), hh = h(8, 18), m = [0, 15, 30, 45][h(0, 3)]; return ['Rendez-vous chez le dentiste (jour et heure)', p(j) + p(hh) + p(m), `le ${j}, à ${hh} h ${p(m)}`]; }
    };
    const TIRAGE = {
      1: [['cadenas', 'chambre', 'porte'], 2],
      2: [['cadenas', 'chambre', 'porte', 'parking', 'telcourt'], 3],
      3: [['porte', 'parking', 'chambre', 'telcourt', 'pin', 'rdv'], 3],
      4: [['porte', 'parking', 'chambre', 'pin', 'rdv', 'tel', 'porte2'], 4],
      5: [['porte2', 'parking', 'pin', 'rdv', 'tel', 'avion', 'telcourt'], 4]
    }[ctx.niveau];
    const MANCHES = 2;
    const NB = TIRAGE[1];
    const VUE = 4000 + NB * 4000;
    // Le rendez-vous se retape sous une forme guidée.
    const AIDE = { rdv: 'en 6 chiffres : le 4 à 9 h 30 s\'écrit 040930', parking: 'la lettre puis les chiffres, par exemple B214', avion: 'par exemple 12C' };

    const haut = document.createElement('div');
    const actions = document.createElement('div');
    actions.className = 'groupe';
    ctx.zone.append(haut, actions);

    let manche = 0, points = 0, items = [], demandes = [], attente = null;
    const total = MANCHES * NB;
    const majStats = () => ctx.stats({ Manche: Math.min(manche + 1, MANCHES) + ' / ' + MANCHES, Points: String(Math.round(points * 10) / 10).replace('.', ',') + ' / ' + total });

    function nouvelleManche() {
      if (manche >= MANCHES) {
        ctx.fin({ valeur: Math.round((100 * points) / total), reussite: points / total, reussi: points >= total / 2 });
        return;
      }
      majStats();
      items = Gala.outils.melanger(TIRAGE[0]).slice(0, NB).map(k => { const [libelle, v, affiche] = MODELES[k](); return { k, libelle, v, affiche }; });
      haut.className = 'num-fiche';
      haut.innerHTML = items.map(it => `<div>${it.libelle}<b>${it.affiche}</b></div>`).join('');
      actions.innerHTML = '<button class="principal" data-a="pret">J\'ai retenu</button>';
      ctx.message('Retiens bien…');
      attente = ctx.attendre(VUE, commencer);
    }

    function commencer() {
      clearTimeout(attente);
      actions.innerHTML = '';
      demandes = Gala.outils.melanger(items);
      ctx.message('');
      demander();
    }

    function demander() {
      if (!demandes.length) {
        manche++;
        actions.innerHTML = `<button class="principal" data-a="suite">${manche < MANCHES ? 'Manche suivante →' : 'Voir le résultat'}</button>`;
        return;
      }
      const it = demandes[0];
      haut.className = 'pile';
      haut.innerHTML = `<div class="num-question">${it.libelle} ?</div>
        <form class="num-saisie"><input autocomplete="off" inputmode="${/[A-Z]/.test(it.v) ? 'text' : 'numeric'}" aria-label="${it.libelle}">
        <button class="principal">Valider</button></form>
        ${AIDE[it.k] ? `<div class="discret petit" style="text-align:center">${AIDE[it.k]}</div>` : ''}
        <div class="num-resultat"></div>`;
      const form = haut.querySelector('form'), input = haut.querySelector('input'), res = haut.querySelector('.num-resultat');
      input.focus();
      ctx.ecouter(form, 'submit', ev => {
        ev.preventDefault();
        const rep = input.value.toUpperCase().replace(/[^0-9A-Z]/g, '');
        if (!rep) return;
        // Part juste : chiffres bien placés, rapportée à la longueur attendue.
        let bien = 0;
        for (let i = 0; i < it.v.length; i++) if (rep[i] === it.v[i]) bien++;
        const part = rep === it.v ? 1 : (rep.length === it.v.length ? bien / it.v.length / 2 : 0);
        points += part;
        form.remove();
        if (part === 1) { ctx.son('ok'); res.innerHTML = '✔ Exact !'; }
        else { ctx.son('erreur'); res.innerHTML = `C'était <b>${it.affiche}</b>${part ? ' (presque : un demi-point au plus)' : ''}`; }
        majStats();
        demandes.shift();
        ctx.attendre(part === 1 ? 900 : 2200, demander);
      });
    }

    ctx.ecouter(actions, 'click', e => {
      const b = e.target.closest('button');
      if (!b) return;
      if (b.dataset.a === 'pret') commencer();
      else if (b.dataset.a === 'suite') nouvelleManche();
    });

    nouvelleManche();
  }
});
