/* Histoire à retenir — mémoire de récit (comme se souvenir d'une conversation ou d'un article).
   On lit une petite histoire, elle disparaît, puis on répond à des questions sur les détails.
   Niveau : histoires courtes puis longues, 3 puis 4 propositions ; au niveau 5, temps de lecture limité.
   Les histoires déjà lues reviennent le plus tard possible. */
Gala.enregistrer({
  id: 'histoire',
  nom: 'Histoire à retenir',
  icone: '📖',
  domaine: 'memoire',
  consigne: 'Lis l\'histoire attentivement, en retenant les détails : noms, nombres, lieux. Quand tu es prêt, elle disparaît et on te pose des questions.',
  niveaux: 5,
  adaptatif: true,
  mesure: { unite: 'bonnes réponses', meilleur: 'haut' },

  demarrer(ctx) {
    Gala.outils.style('histoire', `
      .his-texte { width: min(96vw, 620px); font-size: 1.25rem; line-height: 1.6; background: var(--carte); border: 1px solid var(--bord);
        border-radius: 14px; padding: 1rem 1.2rem; }
      .his-texte h3 { margin: 0 0 .4rem; }
      .his-question { font-size: 1.3rem; font-weight: 700; text-align: center; max-width: 32rem; }
      .his-choix { display: flex; flex-direction: column; gap: .5rem; width: min(94vw, 480px); }
      .his-choix button { justify-content: flex-start; text-align: left; min-height: 58px; font-size: 1.15rem; }
      .his-choix button.bon { border-color: var(--ok); background: var(--ok); color: #fff; }
      .his-choix button.faux { border-color: var(--erreur); background: var(--erreur); color: #fff; }
    `);
    const NIVEAU_TEXTE = [0, 1, 2, 2, 3, 3][ctx.niveau];
    const CHOIX = ctx.niveau <= 2 ? 3 : 4;
    const LIMITE = ctx.niveau >= 5; // temps de lecture compté
    const echapper = t => t.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

    // Choix de l'histoire : parmi celles du bon niveau, la moins récemment lue.
    const info = Gala.stockage.jeu('histoire');
    const vues = info.vues || [];
    const candidates = Gala.outils.melanger(Gala.donnees.histoires.filter(h => h.niveau === NIVEAU_TEXTE))
      .sort((a, b) => vues.indexOf(a.titre) - vues.indexOf(b.titre));
    const hist = candidates[0];
    info.vues = [...vues.filter(t => t !== hist.titre), hist.titre];
    Gala.stockage.sauver();
    const questions = hist.questions;

    const zone = document.createElement('div');
    zone.className = 'pile';
    zone.style.alignItems = 'center';
    const actions = document.createElement('div');
    actions.className = 'groupe';
    ctx.zone.append(zone, actions);

    let numero = 0, bonnes = 0, actuelle = null, actif = false;
    const majStats = () => ctx.stats({ Question: Math.min(numero + 1, questions.length) + ' / ' + questions.length, Bonnes: bonnes });

    zone.innerHTML = `<div class="his-texte"><h3>${echapper(hist.titre)}</h3>${echapper(hist.texte)}</div>`;
    actions.innerHTML = '<button class="principal" data-a="lu">J\'ai lu, aux questions</button>';
    ctx.stats({ Histoire: hist.titre });
    if (LIMITE) {
      const secondes = Math.round(hist.texte.split(/\s+/).length * 0.45) + 10;
      let reste = secondes;
      ctx.message(`Temps de lecture : ${reste} s`);
      const t = ctx.repeter(1000, () => {
        reste--;
        if (reste > 0) ctx.message(`Temps de lecture : ${reste} s`);
        else { clearInterval(t); commencer(); }
      });
      actions.dataset.t = t;
    } else {
      ctx.message('Prends le temps qu\'il te faut.');
    }

    function commencer() {
      if (actions.dataset.fait) return;
      actions.dataset.fait = '1';
      clearInterval(Number(actions.dataset.t));
      actions.innerHTML = '';
      ctx.message('');
      suivante();
    }

    function suivante() {
      if (numero >= questions.length) {
        ctx.fin({ valeur: bonnes, reussite: bonnes / questions.length, reussi: bonnes >= questions.length / 2 });
        return;
      }
      actuelle = questions[numero];
      const propositions = Gala.outils.melanger([actuelle[1], ...Gala.outils.melanger(actuelle.slice(2)).slice(0, CHOIX - 1)]);
      zone.innerHTML = `<div class="his-question">${echapper(actuelle[0])}</div>
        <div class="his-choix">${propositions.map(p => `<button data-p="${echapper(p)}">${echapper(p)}</button>`).join('')}</div>`;
      majStats();
      actif = true;
    }

    ctx.ecouter(zone, 'click', e => {
      const b = e.target.closest('.his-choix button');
      if (!b || !actif) return;
      actif = false;
      numero++;
      const boutons = [...zone.querySelectorAll('.his-choix button')];
      boutons.find(x => x.dataset.p === actuelle[1]).classList.add('bon');
      const juste = b.dataset.p === actuelle[1];
      if (juste) { bonnes++; ctx.son('ok'); } else { b.classList.add('faux'); ctx.son('erreur'); }
      majStats();
      ctx.attendre(juste ? 900 : 1900, suivante);
    });

    ctx.ecouter(actions, 'click', e => {
      if (e.target.closest('[data-a="lu"]')) commencer();
    });
  }
});
