/* Problèmes de calcul — énoncés de la vie courante, résolus en plusieurs étapes (section « Problèmes »).
   4 problèmes par partie. Chaque problème pose 2 à 4 questions qui s'enchaînent ; une erreur
   affiche le calcul attendu, puis on continue. Niveau : nombres plus grands, plus d'étapes,
   puis pourcentages, décimales et durées. Papier et crayon autorisés ! */
(function () {
  const h = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const choisir = t => t[Math.floor(Math.random() * t.length)];
  const euros = x => (Number.isInteger(x) ? String(x) : x.toFixed(2).replace('.', ',')) + ' €';
  const nb = x => (Number.isInteger(x) ? String(x) : String(Math.round(x * 100) / 100).replace('.', ','));
  const heure = m => `${Math.floor(m / 60) % 24} h ${String(m % 60).padStart(2, '0')}`;

  /* Chaque modèle reçoit le niveau et renvoie { texte, etapes: [{ q, r, unite, calcul, type? }] }.
     type 'heure' : réponse attendue en minutes depuis minuit, saisie « 14h35 » ou « 14:35 ». */
  const MODELES = [
    function courses(n) {
      const art = choisir([['baguettes', 1], ['litres de lait', 1], ['paquets de café', 4], ['kilos de pommes', 3], ['pots de confiture', 3]]);
      const art2 = choisir([['fromages', 5], ['poulets', 9], ['bouteilles de vin', 7], ['melons', 3]].filter(a => a[0] !== art[0]));
      const q1 = h(2, n >= 3 ? 6 : 4), p1 = art[1] + (n >= 4 ? h(0, 9) / 10 + 0.5 : h(0, 1));
      const q2 = h(2, 4), p2 = art2[1] + (n >= 4 ? h(1, 9) / 10 : h(0, 2));
      const t1 = q1 * p1, t2 = q2 * p2, tot = t1 + t2;
      const billet = [20, 50, 100].find(b => b > tot) || 200;
      const etapes = [
        { q: `Combien coûtent les ${art[0]} ?`, r: t1, unite: '€', calcul: `${q1} × ${euros(p1)} = ${euros(t1)}` },
        { q: 'Combien Martine paie-t-elle en tout ?', r: tot, unite: '€', calcul: `${euros(t1)} + ${euros(t2)} = ${euros(tot)}` },
        { q: 'Combien lui rend-on ?', r: billet - tot, unite: '€', calcul: `${billet} − ${euros(tot)} = ${euros(billet - tot)}` }
      ];
      return {
        texte: `Au marché, Martine achète ${q1} ${art[0]} à ${euros(p1)} l'unité et ${q2} ${art2[0]} à ${euros(p2)} pièce. Elle paie avec un billet de ${billet} €.`,
        etapes
      };
    },
    function recette(n) {
      const base = 4, pers = choisir(n >= 3 ? [6, 10, 12, 14] : [8, 12]);
      const farine = choisir([200, 240, 300]), oeufs = 2, sucre = choisir([100, 120, 160]);
      const k = pers / base;
      return {
        texte: `Une recette de gâteau pour ${base} personnes demande ${farine} g de farine, ${oeufs} œufs et ${sucre} g de sucre. Jacques veut faire ce gâteau pour ${pers} personnes.`,
        etapes: [
          { q: 'Combien de grammes de farine lui faut-il ?', r: farine * k, unite: 'g', calcul: `${farine} ÷ ${base} × ${pers} = ${nb(farine * k)} g` },
          { q: 'Combien d\'œufs ?', r: oeufs * k, unite: 'œufs', calcul: `${oeufs} ÷ ${base} × ${pers} = ${nb(oeufs * k)}` },
          { q: 'Le sucre est vendu en paquets de 500 g. Combien de grammes restera-t-il dans le paquet ?', r: 500 - sucre * k, unite: 'g', calcul: `500 − ${sucre} ÷ ${base} × ${pers} = 500 − ${nb(sucre * k)} = ${nb(500 - sucre * k)} g` }
        ].filter(e => e.r >= 0)
      };
    },
    function trajet(n) {
      const dep = h(7, 16) * 60 + choisir([0, 10, 15, 20, 30, 40, 45, 50]);
      const d1 = h(4, 9) * 10 + (n >= 3 ? 5 : 0), pause = choisir([10, 15, 20, 25]), d2 = h(3, 8) * 10 + (n >= 4 ? choisir([5, 15]) : 0);
      const tot = d1 + pause + d2;
      return {
        texte: `Gérard part de chez lui à ${heure(dep)}. Il roule ${d1} minutes, fait une pause de ${pause} minutes, puis roule encore ${d2} minutes.`,
        etapes: [
          { q: 'Combien de minutes roule-t-il en tout ?', r: d1 + d2, unite: 'min', calcul: `${d1} + ${d2} = ${d1 + d2} min` },
          { q: 'Combien de temps dure le voyage, pause comprise ?', r: tot, unite: 'min', calcul: `${d1 + d2} + ${pause} = ${tot} min` },
          { q: 'À quelle heure arrive-t-il ? (par exemple 14h35)', r: dep + tot, type: 'heure', calcul: `${heure(dep)} + ${tot} min = ${heure(dep + tot)}` }
        ]
      };
    },
    function vitesse(n) {
      const v1 = choisir([60, 80, 90, 120]), t1 = n >= 3 ? choisir([1.5, 2, 2.5]) : h(1, 3);
      const v2 = choisir([50, 70, 90, 110].filter(v => v !== v1)), t2 = n >= 4 ? choisir([0.5, 1, 1.5]) : h(1, 2);
      const d1 = v1 * t1, d2 = v2 * t2;
      const etapes = [
        { q: 'Quelle distance parcourt-elle sur l\'autoroute ?', r: d1, unite: 'km', calcul: `${v1} × ${nb(t1)} = ${nb(d1)} km` },
        { q: 'Quelle distance parcourt-elle sur la route ?', r: d2, unite: 'km', calcul: `${v2} × ${nb(t2)} = ${nb(d2)} km` },
        { q: 'Quelle distance parcourt-elle en tout ?', r: d1 + d2, unite: 'km', calcul: `${nb(d1)} + ${nb(d2)} = ${nb(d1 + d2)} km` }
      ];
      if (n >= 3) {
        const conso = choisir([5, 6, 7]);
        etapes.push({ q: `Sa voiture consomme ${conso} litres aux 100 km. Combien de litres a-t-elle utilisés ?`, r: (d1 + d2) * conso / 100, unite: 'L',
          calcul: `${nb(d1 + d2)} ÷ 100 × ${conso} = ${nb((d1 + d2) * conso / 100)} L` });
      }
      return { texte: `Sylvie roule ${nb(t1)} heure${t1 > 1 ? 's' : ''} sur l'autoroute à ${v1} km/h, puis ${nb(t2)} heure${t2 > 1 ? 's' : ''} sur une route à ${v2} km/h.`, etapes };
    },
    function ages(n) {
      const fille = h(6, 14), k = choisir([3, 4]), dans = h(5, 12);
      const pere = fille * k;
      return {
        texte: `Henri a ${k} fois l'âge de sa petite-fille Léa. Léa a ${fille} ans.`,
        etapes: [
          { q: 'Quel âge a Henri ?', r: pere, unite: 'ans', calcul: `${k} × ${fille} = ${pere} ans` },
          { q: `Quel âge aura Henri dans ${dans} ans ?`, r: pere + dans, unite: 'ans', calcul: `${pere} + ${dans} = ${pere + dans} ans` },
          { q: `Dans ${dans} ans, quelle sera la somme de leurs deux âges ?`, r: pere + fille + 2 * dans, unite: 'ans', calcul: `${pere + dans} + ${fille + dans} = ${pere + fille + 2 * dans} ans` },
          { q: 'Quelle est leur différence d\'âge ?', r: pere - fille, unite: 'ans', calcul: `${pere} − ${fille} = ${pere - fille} ans (elle ne change jamais)` }
        ]
      };
    },
    function epargne(n) {
      const prix = h(n >= 3 ? 30 : 15, n >= 3 ? 90 : 40) * 10, deja = h(3, Math.floor(prix / 30)) * 10, sem = choisir([15, 20, 25, 30, 40]);
      const reste = prix - deja, semaines = Math.ceil(reste / sem);
      return {
        texte: `Paul veut acheter un vélo à ${prix} €. Il a déjà ${deja} € et met ${sem} € de côté chaque semaine.`,
        etapes: [
          { q: 'Combien lui manque-t-il ?', r: reste, unite: '€', calcul: `${prix} − ${deja} = ${reste} €` },
          { q: 'Combien de semaines lui faut-il au minimum pour pouvoir l\'acheter ?', r: semaines, unite: 'semaines', calcul: `${reste} ÷ ${sem} = ${nb(reste / sem)}, donc ${semaines} semaines` },
          { q: 'Combien d\'argent lui restera-t-il après l\'achat ?', r: deja + semaines * sem - prix, unite: '€', calcul: `${deja} + ${semaines} × ${sem} − ${prix} = ${deja + semaines * sem - prix} €` }
        ]
      };
    },
    function partage(n) {
      const frac = n >= 3 ? choisir([[1, 4], [1, 3], [2, 5]]) : [1, 4];
      const total = h(2, 9) * frac[1] * 3 * (n >= 4 ? 500 : 100); // tombe juste à chaque étape
      const p1 = total * frac[0] / frac[1], reste = total - p1, autres = 3;
      return {
        texte: `Quatre amis gagnent ${total} € au loto. Gisèle, qui a payé le billet, reçoit les ${frac[0] === 1 ? '' : frac[0] + ' '}${['', '', 'moitié', 'tiers', 'quart', 'cinquièmes'][frac[1]]} de la somme. Les trois autres se partagent le reste à parts égales.`.replace('les tiers', 'le tiers').replace('les quart', 'le quart'),
        etapes: [
          { q: 'Combien reçoit Gisèle ?', r: p1, unite: '€', calcul: `${total} × ${frac[0]} ÷ ${frac[1]} = ${nb(p1)} €` },
          { q: 'Combien reste-t-il pour les trois autres ?', r: reste, unite: '€', calcul: `${total} − ${nb(p1)} = ${nb(reste)} €` },
          { q: 'Combien reçoit chacun des trois autres ?', r: reste / autres, unite: '€', calcul: `${nb(reste)} ÷ 3 = ${nb(reste / autres)} €` }
        ]
      };
    },
    function soldes(n) {
      const prix = h(4, 20) * 10, taux = choisir(n >= 3 ? [15, 20, 25, 30, 40] : [10, 20, 50]), bon = choisir([5, 10]);
      const remise = prix * taux / 100, solde = prix - remise;
      const etapes = [
        { q: 'De combien d\'euros est la remise ?', r: remise, unite: '€', calcul: `${prix} × ${taux} ÷ 100 = ${euros(remise)}` },
        { q: 'Quel est le prix soldé ?', r: solde, unite: '€', calcul: `${prix} − ${euros(remise)} = ${euros(solde)}` }
      ];
      if (n >= 2) etapes.push({ q: `Elle a en plus un bon d'achat de ${bon} €. Combien paie-t-elle ?`, r: solde - bon, unite: '€', calcul: `${euros(solde)} − ${bon} = ${euros(solde - bon)}` });
      if (n >= 4) etapes.push({ q: 'Combien a-t-elle économisé en tout par rapport au prix de départ ?', r: prix - (solde - bon), unite: '€', calcul: `${prix} − ${euros(solde - bon)} = ${euros(prix - solde + bon)}` });
      return { texte: `Un manteau coûte ${prix} €. Pendant les soldes, il est à −${taux} %. Odette l'achète.`, etapes };
    },
    function jardin(n) {
      const L = h(6, n >= 3 ? 25 : 12), l = h(3, L - 1), prixM = choisir([4, 5, 8, 12]), portail = choisir([2, 3, 4]);
      const per = 2 * (L + l);
      const etapes = [
        { q: 'Quel est le périmètre du jardin ?', r: per, unite: 'm', calcul: `2 × (${L} + ${l}) = ${per} m` },
        { q: `On laisse ${portail} m pour le portail. Combien de mètres de grillage faut-il ?`, r: per - portail, unite: 'm', calcul: `${per} − ${portail} = ${per - portail} m` },
        { q: `Le grillage coûte ${prixM} € le mètre. Quel est le prix du grillage ?`, r: (per - portail) * prixM, unite: '€', calcul: `${per - portail} × ${prixM} = ${(per - portail) * prixM} €` }
      ];
      if (n >= 3) etapes.push({ q: 'Quelle est l\'aire du jardin ?', r: L * l, unite: 'm²', calcul: `${L} × ${l} = ${L * l} m²` });
      return { texte: `Un jardin rectangulaire mesure ${L} m de long et ${l} m de large. Roger veut l'entourer de grillage.`, etapes };
    },
    function cinema(n) {
      const adultes = h(2, 4), enfants = h(1, 4), pa = choisir([9, 10, 11, 12]) + (n >= 4 ? 0.5 : 0), pe = choisir([5, 6, 7]);
      const pop = choisir([4, 5, 6]), seance = h(14, 20) * 60 + choisir([0, 15, 30, 45]), duree = h(95, 150);
      return {
        texte: `${adultes} adultes et ${enfants} enfants vont au cinéma. La place adulte coûte ${euros(pa)}, la place enfant ${euros(pe)}. Chaque enfant reçoit un pop-corn à ${pop} €. La séance commence à ${heure(seance)} et le film dure ${duree} minutes.`,
        etapes: [
          { q: 'Combien coûtent toutes les places ?', r: adultes * pa + enfants * pe, unite: '€', calcul: `${adultes} × ${euros(pa)} + ${enfants} × ${pe} = ${euros(adultes * pa + enfants * pe)}` },
          { q: 'Combien la sortie coûte-t-elle en tout, pop-corn compris ?', r: adultes * pa + enfants * (pe + pop), unite: '€', calcul: `${euros(adultes * pa + enfants * pe)} + ${enfants} × ${pop} = ${euros(adultes * pa + enfants * (pe + pop))}` },
          { q: 'À quelle heure le film se termine-t-il ? (par exemple 17h20)', r: seance + duree, type: 'heure', calcul: `${heure(seance)} + ${duree} min = ${heure(seance + duree)}` }
        ]
      };
    }
  ];

  function lire(txt, type) {
    const t = txt.trim().toLowerCase().replace(/\s/g, '');
    if (type === 'heure') {
      const m = t.match(/^(\d{1,2})(?:h|:)(\d{0,2})$/);
      if (!m) return NaN;
      return Number(m[1]) * 60 + Number(m[2] || 0);
    }
    const n = t.replace(',', '.').replace(/[€a-zœ²]+$/, '');
    return /^\d+(\.\d+)?$/.test(n) ? Number(n) : NaN;
  }

  Gala.enregistrer({
    id: 'enonces',
    nom: 'Problèmes de calcul',
    icone: '📝',
    domaine: 'logique',
    probleme: true,
    consigne: 'Lis bien l\'énoncé, puis réponds aux questions une par une : chacune aide pour la suivante. Prends un papier et un crayon si tu veux. Écris les nombres décimaux avec une virgule (12,5).',
    niveaux: 5,
    adaptatif: true,
    mesure: { unite: 'bonnes réponses', meilleur: 'haut' },

    demarrer(ctx) {
      Gala.outils.style('enonces', `
        .eno-texte { width: min(96vw, 620px); font-size: 1.2rem; line-height: 1.45; background: var(--carte); border: 1px solid var(--bord);
          border-radius: 14px; padding: .8rem 1rem; }
        .eno-etapes { width: min(96vw, 620px); display: flex; flex-direction: column; gap: .5rem; }
        .eno-etape { font-size: 1.1rem; }
        .eno-etape .q { font-weight: 700; }
        .eno-etape .res { margin-top: .2rem; }
        .eno-etape .res.ok { color: var(--ok); font-weight: 700; }
        .eno-etape .res.ko { color: var(--erreur); }
        .eno-saisie { display: flex; gap: .4rem; align-items: center; flex-wrap: wrap; margin-top: .3rem; }
        .eno-saisie input { font-size: 1.3rem; width: 9rem; padding: .45rem .6rem; border-radius: 10px; border: 2px solid var(--bord);
          background: var(--carte); color: var(--texte); }
      `);
      const PROBLEMES = 4;
      const NB_ETAPES = [0, 2, 3, 3, 4, 4][ctx.niveau];
      const modeles = Gala.outils.melanger(MODELES).slice(0, PROBLEMES);

      const texte = document.createElement('div');
      texte.className = 'eno-texte';
      const etapes = document.createElement('div');
      etapes.className = 'eno-etapes';
      ctx.zone.append(texte, etapes);

      let numero = 0, bonnes = 0, total = 0, prob = null, etape = 0;
      const majStats = () => ctx.stats({ Problème: Math.min(numero + 1, PROBLEMES) + ' / ' + PROBLEMES, Bonnes: bonnes + ' / ' + total });

      function suivant() {
        if (numero >= PROBLEMES) {
          ctx.fin({ valeur: bonnes, reussite: bonnes / total, reussi: bonnes >= total / 2 });
          return;
        }
        prob = modeles[numero](ctx.niveau);
        prob.etapes = prob.etapes.slice(0, NB_ETAPES);
        etape = 0;
        texte.textContent = prob.texte;
        etapes.innerHTML = '';
        ctx.message('');
        poser();
      }

      function poser() {
        majStats();
        if (etape >= prob.etapes.length) {
          const b = document.createElement('button');
          b.className = 'principal';
          b.textContent = numero + 1 < PROBLEMES ? 'Problème suivant →' : 'Voir le résultat';
          etapes.appendChild(b);
          b.focus();
          ctx.ecouter(b, 'click', () => { numero++; suivant(); });
          return;
        }
        const e = prob.etapes[etape];
        const bloc = document.createElement('div');
        bloc.className = 'eno-etape';
        bloc.innerHTML = `<div class="q">${etape + 1}. ${e.q}</div>
          <form class="eno-saisie"><input inputmode="${e.type === 'heure' ? 'text' : 'decimal'}" autocomplete="off" aria-label="Réponse">
          <span>${e.unite || ''}</span><button class="principal">Valider</button></form><div class="res"></div>`;
        etapes.appendChild(bloc);
        const form = bloc.querySelector('form'), input = bloc.querySelector('input'), res = bloc.querySelector('.res');
        input.focus();
        ctx.ecouter(form, 'submit', ev => {
          ev.preventDefault();
          const v = lire(input.value, e.type);
          if (input.value.trim() === '' || Number.isNaN(v)) { ctx.message(e.type === 'heure' ? 'Écris une heure, par exemple 14h35.' : 'Écris un nombre.'); return; }
          ctx.message('');
          const juste = Math.abs(v - e.r) < 0.011;
          total++;
          if (juste) { bonnes++; ctx.son('ok'); res.className = 'res ok'; res.textContent = '✔ Juste : ' + e.calcul; }
          else { ctx.son('erreur'); res.className = 'res ko'; res.textContent = '✘ Il fallait : ' + e.calcul; }
          form.remove();
          const r = document.createElement('div');
          r.innerHTML = `Ta réponse : <b>${input.value.replace(/[&<>]/g, '')}</b>`;
          bloc.insertBefore(r, res);
          etape++;
          poser();
        });
      }

      suivant();
    }
  });
})();
