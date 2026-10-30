/* Gala Cerveau — application : écrans d'accueil, de jeu, de progrès et de réglages.
   Navigation par #ancre pour fonctionner aussi en file:// (bouton retour du navigateur compris). */
(function () {
  'use strict';
  const Gala = window.Gala;
  const S = Gala.stockage, P = Gala.progression;
  const $ = (sel, racine) => (racine || document).querySelector(sel);
  const main = $('#principal');

  const echapper = t => String(t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const duree = s => (s < 60 ? s + ' s' : s < 3600 ? Math.round(s / 60) + ' min' : (s / 3600).toFixed(1).replace('.', ',') + ' h');
  const pluriel = (n, mot) => n + ' ' + mot + (n > 1 ? 's' : '');

  // Record à afficher : celui du niveau conseillé, sinon celui du plus haut niveau joué.
  function recordAffiche(def) {
    const records = S.jeu(def.id).records;
    const niv = P.niveauConseille(def);
    if (records[niv] != null) return { niv, val: records[niv], ailleurs: false };
    const niveaux = Object.keys(records).map(Number).filter(n => records[n] != null).sort((a, b) => b - a);
    return niveaux.length ? { niv: niveaux[0], val: records[niveaux[0]], ailleurs: true } : null;
  }
  const texteRecord = (def, r) => r.val + ' ' + def.mesure.unite + (r.ailleurs ? ' (niv. ' + r.niv + ')' : '');

  let partieEnCours = null; // contexte de la partie affichée, à nettoyer en quittant

  function arreterPartie() {
    if (partieEnCours) {
      partieEnCours._nettoyer();
      partieEnCours = null;
    }
    const voile = $('.voile');
    if (voile) voile.remove();
    if (Gala.voixDisponible) speechSynthesis.cancel();
  }

  /* ---------- Réglages appliqués à la page ---------- */
  function appliquerReglages() {
    const r = S.donnees.reglages;
    document.documentElement.style.setProperty('--echelle', r.taille);
    if (r.theme === 'auto') document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', r.theme);
  }

  /* ---------- Navigation ---------- */
  function route() {
    arreterPartie();
    const [ecran, param] = (location.hash.slice(1) || 'accueil').split('/');
    document.querySelectorAll('.nav a').forEach(a => a.classList.toggle('actif', a.getAttribute('href') === '#' + ecran));
    window.scrollTo(0, 0);
    if (ecran === 'jeu' && Gala.trouverJeu(param)) ecranJeu(Gala.trouverJeu(param), null);
    else if ((ecran === 'seance' || ecran === 'bilan') && Gala.trouverJeu(param)) ecranJeu(Gala.trouverJeu(param), ecran);
    else if (ecran === 'seance') ecranSeance();
    else if (ecran === 'bilan') ecranBilan();
    else if (ecran === 'progres') ecranProgres();
    else if (ecran === 'reglages') ecranReglages();
    else ecranAccueil();
  }

  function titre(html) {
    $('#titre').innerHTML = html;
  }

  // Un parcours enchaîne plusieurs jeux : la séance du jour ou le bilan de départ.
  const PARCOURS = { seance: 'Séance du jour', bilan: 'Bilan de départ' };
  const parcours = mode => (mode === 'seance' ? P.seanceDuJour() : mode === 'bilan' ? P.bilan() : null);
  const retour = mode => (mode ? '#' + mode : '#accueil');

  /* ---------- Accueil ---------- */
  function ecranAccueil() {
    titre('<span>🌿 Gala Cerveau</span>');
    const prenom = S.donnees.profil.prenom;
    const serie = P.serieJours();
    const domainesAvecJeux = Gala.DOMAINES.filter(d => Gala.jeux.some(j => j.domaine === d.id && !j.detente));
    const domainesAVenir = Gala.DOMAINES.filter(d => !domainesAvecJeux.includes(d));

    let html = '<div class="pile">';
    if (!S.disponible) {
      html += '<div class="carte alerte">⚠️ Ce navigateur bloque la sauvegarde : tes progrès seront perdus en fermant la page. Essaie un autre navigateur, ou la version en ligne.</div>';
    }
    html += `<h1>${prenom ? 'Bonjour ' + echapper(prenom) + ' !' : 'Bonjour !'}</h1>
      <div class="bandeau">
        <div class="chiffre"><b>${serie}</b><span>${serie > 1 ? 'jours de suite' : 'jour de suite'}</span></div>
        <div class="chiffre"><b>${duree(P.secondesSur(1))}</b><span>aujourd'hui</span></div>
        <div class="chiffre"><b>${duree(P.secondesSur(7))}</b><span>sur 7 jours</span></div>
      </div>`;

    const b = S.donnees.bilan;
    if (!b || (!b.fin && !b.masque)) {
      const faits = b ? b.faits.length : 0, total = b ? b.jeux.length : 6;
      html += `<a class="carte carte-seance" href="#bilan">
          <span class="icone" aria-hidden="true">🧪</span>
          <span><b>Bilan de départ</b><br><small>${faits ? faits + ' / ' + total + ' jeux faits' : total + ' jeux, un par domaine, environ 12 min'} · règle ton niveau de départ partout</small></span>
          <span class="bouton principal">${faits ? 'Continuer' : 'Faire le bilan'}</span>
        </a>
        <div style="margin-top:-.6rem;text-align:right"><button class="petit" id="masquer-bilan" style="min-height:36px;padding:.2rem .7rem">Ne plus proposer</button></div>`;
    }

    const seance = P.seanceDuJour();
    if (seance.jeux.length) {
      const faits = seance.faits.length, total = seance.jeux.length;
      const fini = faits >= total;
      html += `<a class="carte carte-seance" href="#seance">
          <span class="icone" aria-hidden="true">${fini ? '✅' : '☀️'}</span>
          <span><b>Séance du jour</b><br><small>${fini ? 'Terminée, bravo ! Reviens demain.' : faits + ' / ' + total + ' jeux · environ ' + (total - faits) * 2 + ' min'}</small></span>
          <span class="bouton ${fini ? '' : 'principal'}">${fini ? 'Revoir' : faits ? 'Continuer' : 'Commencer'}</span>
        </a>`;
    }

    const tuile = j => {
      const info = S.jeu(j.id);
      const niv = P.niveauConseille(j);
      const rec = recordAffiche(j);
      const details = [];
      if (j.niveaux > 1) details.push('Niveau ' + niv);
      if (rec) details.push('Record ' + texteRecord(j, rec));
      else if (!info.parties.length) details.push('Pas encore joué');
      return `<a class="tuile-jeu" href="#jeu/${j.id}">
          <span class="icone" aria-hidden="true">${j.icone}</span><b>${echapper(j.nom)}</b>
          <small>${details.join(' · ')}</small></a>`;
    };

    domainesAvecJeux.forEach(d => {
      html += `<section class="domaine"><h2><span aria-hidden="true">${d.icone}</span> ${d.nom}</h2><div class="grille-jeux">`;
      Gala.jeux.filter(j => j.domaine === d.id && !j.detente).forEach(j => { html += tuile(j); });
      html += '</div></section>';
    });

    const detente = Gala.jeux.filter(j => j.detente);
    if (detente.length) {
      html += `<section class="domaine"><h2><span aria-hidden="true">🎮</span> Détente</h2><div class="grille-jeux">${detente.map(tuile).join('')}</div></section>`;
    }

    if (domainesAVenir.length) {
      html += `<p class="discret petit">Bientôt : ${domainesAVenir.map(d => d.nom.toLowerCase()).join(', ')}.</p>`;
    }
    html += '</div>';
    main.innerHTML = html;
    const masquer = $('#masquer-bilan');
    if (masquer) masquer.addEventListener('click', () => {
      P.bilan().masque = true;
      S.sauver();
      ecranAccueil();
    });
  }

  /* ---------- Bilan de départ ---------- */
  function ecranBilan() {
    titre('<span>🧪 Bilan de départ</span>');
    const b = P.bilan();
    const prochain = b.jeux.find(id => !b.faits.includes(id));
    const lignes = b.jeux.map((id, k) => {
      const j = Gala.trouverJeu(id), fait = b.faits.includes(id);
      const domaine = Gala.DOMAINES.find(d => d.id === j.domaine);
      const niv = b.niveaux[j.domaine];
      return `<li class="${fait ? 'fait' : id === prochain ? 'prochain' : ''}">
          <span class="etape" aria-hidden="true">${fait ? '✓' : k + 1}</span>
          <span class="icone" aria-hidden="true">${j.icone}</span>
          <span><b>${domaine ? domaine.nom : ''}</b> · ${echapper(j.nom)}<br><small class="discret">${fait ? 'niveau de départ réglé sur ' + niv : 'à faire'}</small></span>
        </li>`;
    }).join('');
    main.innerHTML = `<div class="pile">
      <p class="discret" style="margin:0">Un jeu par domaine, joué au niveau ${P.NIVEAU_BILAN}. Ton résultat règle le niveau de départ de tous les jeux du domaine que tu n'as pas encore joués. Ensuite, chaque jeu s'adapte tout seul.</p>
      <ol class="liste-seance">${lignes}</ol>
      <div class="groupe">
        ${prochain ? `<a class="bouton principal-lien" href="#bilan/${prochain}">▶ ${b.faits.length ? 'Continuer' : 'Commencer'} le bilan</a>`
                   : '<div class="carte">✅ Bilan terminé : tes niveaux de départ sont réglés. Bon entraînement !</div>'}
        <a class="bouton" href="#accueil">Accueil</a>
        ${prochain ? '' : '<button id="refaire-bilan">↻ Refaire le bilan</button>'}
      </div></div>`;
    const refaire = $('#refaire-bilan');
    if (refaire) refaire.addEventListener('click', () => { P.commencerBilan(); ecranBilan(); });
  }

  /* ---------- Séance du jour ---------- */
  function ecranSeance() {
    titre('<span>☀️ Séance du jour</span>');
    const seance = P.seanceDuJour();
    const prochain = seance.jeux.find(id => !seance.faits.includes(id));
    const lignes = seance.jeux.map((id, k) => {
      const j = Gala.trouverJeu(id), fait = seance.faits.includes(id);
      const domaine = Gala.DOMAINES.find(d => d.id === j.domaine);
      return `<li class="${fait ? 'fait' : id === prochain ? 'prochain' : ''}">
          <span class="etape" aria-hidden="true">${fait ? '✓' : k + 1}</span>
          <span class="icone" aria-hidden="true">${j.icone}</span>
          <span><b>${echapper(j.nom)}</b><br><small class="discret">${domaine ? domaine.nom : ''}${j.niveaux > 1 ? ' · niveau ' + P.niveauConseille(j) : ''}${fait ? ' · fait' : ''}</small></span>
        </li>`;
    }).join('');
    main.innerHTML = `<div class="pile">
      <p class="discret" style="margin:0">${seance.jeux.length} jeux de domaines différents, choisis parmi ceux que tu as le moins travaillés cette semaine. Compte 8 à 12 minutes.</p>
      <ol class="liste-seance">${lignes}</ol>
      <div class="groupe">
        ${prochain ? `<a class="bouton principal-lien" href="#seance/${prochain}">▶ ${seance.faits.length ? 'Continuer' : 'Commencer'} la séance</a>`
                   : '<div class="carte">✅ Séance terminée pour aujourd\'hui. Bravo ! Une nouvelle séance t\'attend demain.</div>'}
        <a class="bouton" href="#accueil">Accueil</a>
      </div></div>`;
  }

  /* ---------- Écran de jeu ---------- */
  function ecranJeu(def, mode) {
    titre(`<span aria-hidden="true">${def.icone}</span><span>${echapper(def.nom)}</span>`);
    let niveau = mode === 'bilan' ? Math.min(P.NIVEAU_BILAN, def.niveaux) : P.niveauConseille(def);
    const conseille = niveau;
    const suite = parcours(mode);
    const etape = suite ? `<p class="discret petit" style="margin:0">${PARCOURS[mode]} · jeu ${suite.jeux.indexOf(def.id) + 1} sur ${suite.jeux.length}${mode === 'bilan' ? ' · niveau ' + niveau : ''}</p>` : '';

    const choix = def.niveaux > 1 && mode !== 'bilan' ? `
      <div class="choix-niveau">
        <span>Niveau</span>
        <button data-niv="-1" aria-label="Niveau inférieur">−</button>
        <output id="niv">${niveau}</output>
        <button data-niv="1" aria-label="Niveau supérieur">+</button>
        <span class="discret petit">sur ${def.niveaux}${def.adaptatif ? ' · conseillé : ' + conseille : ''}</span>
      </div>` : '';

    main.innerHTML = `<div class="pile">
      <div class="carte pile">
        ${etape}
        <p class="consigne" style="margin:0">${echapper(def.consigne)}</p>
        ${choix}
        <div class="groupe">
          <button class="principal" id="go">▶ Commencer</button>
          ${Gala.voixDisponible && S.donnees.reglages.voix ? '<button id="voix">🔊 Lire la consigne</button>' : ''}
          <a class="bouton" href="${retour(mode)}">Retour</a>
        </div>
      </div></div>`;

    main.querySelectorAll('[data-niv]').forEach(b => b.addEventListener('click', () => {
      niveau = Math.min(def.niveaux, Math.max(1, niveau + Number(b.dataset.niv)));
      $('#niv').textContent = niveau;
    }));
    const voix = $('#voix');
    if (voix) voix.addEventListener('click', () => Gala.lire(def.consigne));
    $('#go').addEventListener('click', () => lancer(def, niveau, mode));
    $('#go').focus();
  }

  function lancer(def, niveau, mode) {
    arreterPartie();
    main.innerHTML = `<div class="pile">
      <div class="barre-jeu">
        <div class="stats" id="stats"></div>
        <div class="groupe">
          ${def.niveaux > 1 ? `<span class="stat"><span>Niveau</span><b>${niveau}</b></span>` : ''}
          <a class="bouton" href="${retour(mode)}">Quitter</a>
        </div>
      </div>
      <div class="message" id="message" role="status" aria-live="polite"></div>
      <div class="zone-jeu" id="zone"></div>
    </div>`;

    const ui = {
      message: t => { $('#message').textContent = t; },
      stats: obj => {
        $('#stats').innerHTML = Object.entries(obj)
          .map(([k, v]) => `<div class="stat"><span>${echapper(k)}</span><b>${echapper(v)}</b></div>`).join('');
      },
      fin: r => terminer(def, niveau, r, mode)
    };
    partieEnCours = Gala.creerContexte(def, niveau, $('#zone'), ui);
    try {
      def.demarrer(partieEnCours);
    } catch (e) {
      console.error(e);
      ui.message('Ce jeu a rencontré une erreur. Reviens à l\'accueil et réessaie.');
    }
  }

  function terminer(def, niveau, r, mode) {
    const info = S.enregistrerPartie(def, { n: niveau, v: r.valeur, r: r.reussite, s: r.duree });
    let suite = null, changement = 0;
    if (mode === 'seance') suite = P.marquerFait(def.id);
    if (mode === 'bilan') suite = P.noterBilan(def, r.reussite || 0);
    else if (def.adaptatif && r.reussite != null) changement = P.apresPartie(def, r.reussite, niveau);
    const prochain = suite ? suite.jeux.find(id => !suite.faits.includes(id)) : null;
    const nouveauNiveau = P.niveauConseille(def);
    Gala.son(r.reussi ? 'fin' : 'erreur');

    setTimeout(() => {
      if (!partieEnCours) return; // le joueur a quitté entre-temps
      let lignes = '';
      if (r.valeur != null) {
        lignes += `<div class="grand">${r.valeur} <span style="font-size:1.1rem">${echapper(def.mesure.unite)}</span></div>`;
        if (info.nouveauRecord) lignes += '<div class="record">🏆 Nouveau record !</div>';
        else if (info.record != null && def.niveaux > 1) lignes += `<div class="discret">Record au niveau ${niveau} : ${info.record} ${echapper(def.mesure.unite)}</div>`;
        else if (info.record != null) lignes += `<div class="discret">Record : ${info.record} ${echapper(def.mesure.unite)}</div>`;
      }
      if (r.reussite != null) lignes += `<div class="discret">Réussite : ${Math.round(r.reussite * 100)} %</div>`;
      lignes += `<div class="discret petit">Durée : ${duree(r.duree)}</div>`;
      if (changement > 0) lignes += `<div class="record">⬆️ Bravo, tu passes au niveau ${nouveauNiveau} !</div>`;
      if (changement < 0) lignes += `<div class="discret">On revient au niveau ${nouveauNiveau} pour consolider.</div>`;
      if (mode === 'bilan') {
        const domaine = Gala.DOMAINES.find(d => d.id === def.domaine);
        lignes += `<div class="record">Niveau de départ en ${domaine ? domaine.nom.toLowerCase() : 'ce domaine'} : ${suite.niveaux[def.domaine]}</div>`;
      }

      const voile = document.createElement('div');
      voile.className = 'voile';
      voile.innerHTML = `<div class="carte" role="dialog" aria-modal="true" aria-labelledby="titre-res">
          <h2 id="titre-res">${r.reussi ? 'Bien joué !' : 'Partie terminée'}</h2>
          ${lignes}
          ${suite ? `<div class="discret petit">${PARCOURS[mode]} : ${suite.faits.length} / ${suite.jeux.length}</div>` : ''}
          <div class="actions">
            ${suite ? `<a class="bouton principal-lien" id="suite" href="${prochain ? '#' + mode + '/' + prochain : '#' + mode}">${prochain ? 'Jeu suivant →' : mode === 'bilan' ? '✅ Voir le bilan' : '✅ Terminer la séance'}</a>` : ''}
            ${mode === 'bilan' ? '' : `<button class="${suite ? '' : 'principal'}" id="rejouer">↻ Rejouer${changement ? ' (niveau ' + nouveauNiveau + ')' : ''}</button>`}
            ${suite ? '' : '<a class="bouton" href="#accueil">Accueil</a>'}
          </div></div>`;
      document.body.appendChild(voile);
      (suite ? $('#suite') : $('#rejouer')).focus();
      const rejouer = $('#rejouer');
      if (rejouer) rejouer.addEventListener('click', () => lancer(def, def.adaptatif ? nouveauNiveau : niveau, mode));
    }, 700);
  }

  /* ---------- Progrès ---------- */
  function ecranProgres() {
    titre('<span>📈 Mes progrès</span>');
    const joues = Gala.jeux.filter(j => S.jeu(j.id).parties.length);
    let html = `<div class="pile">
      <div class="bandeau">
        <div class="chiffre"><b>${P.serieJours()}</b><span>jours de suite</span></div>
        <div class="chiffre"><b>${P.totalParties()}</b><span>parties</span></div>
        <div class="chiffre"><b>${duree(P.secondesSur(30))}</b><span>sur 30 jours</span></div>
      </div>`;

    if (joues.length) html += tableauDomaines();

    if (!joues.length) {
      html += '<div class="carte">Joue une première partie et tes progrès apparaîtront ici.</div>';
    } else {
      html += `<div class="carte"><table>
        <thead><tr><th>Jeu</th><th>Niveau</th><th>Record</th><th class="masquer-mobile">Parties</th><th>10 dernières</th></tr></thead><tbody>`;
      joues.forEach(j => {
        const info = S.jeu(j.id), niv = P.niveauConseille(j);
        const rec = recordAffiche(j);
        const dernieres = info.parties.slice(-10);
        // Hauteur : la réussite si le jeu la mesure, sinon la valeur rapportée au meilleur score.
        const valeurs = dernieres.map(p => p.v).filter(v => v != null);
        const max = Math.max(1, ...valeurs), min = Math.min(...valeurs);
        const courbe = dernieres.map(p => {
          let h = 0;
          if (p.r != null) h = p.r;
          else if (p.v != null) h = j.mesure.meilleur === 'bas' ? (p.v > 0 ? min / p.v : 1) : p.v / max;
          const bulle = p.r != null ? Math.round(p.r * 100) + ' %' : p.v != null ? p.v + ' ' + j.mesure.unite : 'perdu';
          return `<i style="height:${Math.round(4 + h * 24)}px" title="${echapper(bulle)}"></i>`;
        }).join('');
        html += `<tr><td>${j.icone} ${echapper(j.nom)}</td><td>${j.niveaux > 1 ? niv + '/' + j.niveaux : '–'}</td>
          <td>${rec ? echapper(texteRecord(j, rec)) : '–'}</td><td class="masquer-mobile">${info.parties.length}</td>
          <td><div class="mini-courbe">${courbe}</div></td></tr>`;
      });
      html += '</tbody></table></div>';
    }
    html += `<p class="discret petit">On se compare à soi-même : les courbes montrent tes 10 dernières parties (réussite pour les jeux qui la mesurent).</p></div>`;
    main.innerHTML = html;
  }

  // Une carte par domaine : niveau moyen et réussite moyenne de chaque jour sur 30 jours.
  function tableauDomaines() {
    const JOURS = 30;
    const jours = [];
    for (let i = JOURS - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      jours.push(S.jourCle(d));
    }
    let html = '<h2>Par domaine</h2><div class="domaines">';
    Gala.DOMAINES.forEach(d => {
      const jeux = Gala.jeux.filter(j => j.domaine === d.id && !j.detente);
      if (!jeux.length) return;
      const parJour = {};
      let parties = 0;
      jeux.forEach(j => S.jeu(j.id).parties.forEach(p => {
        const cleJour = S.jourCle(new Date(p.d));
        if (!jours.includes(cleJour)) return;
        parties++;
        if (p.r == null) return;
        (parJour[cleJour] = parJour[cleJour] || []).push(p.r);
      }));
      const niveaux = jeux.filter(j => S.jeu(j.id).parties.length).map(j => P.niveauConseille(j));
      const niveauMoyen = niveaux.length ? (niveaux.reduce((a, b) => a + b, 0) / niveaux.length).toFixed(1).replace('.', ',') : '–';
      const barres = jours.map(k => {
        const r = parJour[k];
        if (!r) return '<i class="vide"></i>';
        const moy = r.reduce((a, b) => a + b, 0) / r.length;
        return `<i style="height:${Math.round(6 + moy * 42)}px" title="${k.slice(8)}/${k.slice(5, 7)} : ${Math.round(moy * 100)} %"></i>`;
      }).join('');
      html += `<div class="carte domaine-carte">
          <div class="domaine-tete"><b>${d.icone} ${d.nom}</b><span class="discret petit">niveau moyen ${niveauMoyen}</span></div>
          <div class="barres-30">${barres}</div>
          <div class="discret petit">${parties ? parties + ' partie' + (parties > 1 ? 's' : '') + ' sur 30 jours' : 'Pas encore joué ce mois-ci'}</div>
        </div>`;
    });
    return html + '</div><p class="discret petit" style="margin:0">Chaque barre = un jour, sa hauteur = ta réussite moyenne ce jour-là.</p><h2>Par jeu</h2>';
  }

  /* ---------- Réglages ---------- */
  function ecranReglages() {
    titre('<span>⚙️ Réglages</span>');
    const r = S.donnees.reglages;
    const groupe = (nom, options, valeur) => `<span class="groupe" data-reglage="${nom}">${options
      .map(([v, lib]) => `<button data-val="${v}" class="${String(v) === String(valeur) ? 'actif' : ''}" aria-pressed="${String(v) === String(valeur)}">${lib}</button>`).join('')}</span>`;

    main.innerHTML = `<div class="pile">
      <div class="carte">
        <div class="ligne-reglage"><label for="prenom">Ton prénom</label>
          <input type="text" id="prenom" maxlength="30" value="${echapper(S.donnees.profil.prenom)}" placeholder="Facultatif"></div>
        <div class="ligne-reglage"><span>Taille du texte</span>${groupe('taille', [[1, 'Normal'], [1.15, 'Grand'], [1.3, 'Très grand']], r.taille)}</div>
        <div class="ligne-reglage"><span>Apparence</span>${groupe('theme', [['auto', 'Auto'], ['clair', 'Clair'], ['sombre', 'Sombre']], r.theme)}</div>
        <div class="ligne-reglage"><span>Sons</span>${groupe('sons', [[true, 'Oui'], [false, 'Non']], r.sons)}</div>
        ${Gala.voixDisponible ? `<div class="ligne-reglage"><span>Bouton de lecture des consignes</span>${groupe('voix', [[true, 'Oui'], [false, 'Non']], r.voix)}</div>` : ''}
      </div>
      <div class="carte pile">
        <h2>Sauvegarde</h2>
        <p class="discret" style="margin:0">Tes progrès restent dans ce navigateur. Exporte-les de temps en temps pour ne rien perdre, ou pour les passer sur un autre appareil.</p>
        <div class="groupe">
          <button id="exporter">⬇️ Exporter mes progrès</button>
          <button id="importer">⬆️ Importer un fichier</button>
          <input type="file" id="fichier" accept=".json,application/json" hidden>
        </div>
        <div class="message" id="info-sauvegarde" role="status"></div>
      </div>
      ${enLigne ? `<div class="carte pile">
        <h2>Version hors ligne</h2>
        <p class="discret" style="margin:0">Télécharge l'application complète dans un fichier zip : une fois dézippée, ouvre <code>index.html</code>, elle marche sans Internet. Les progrès ne passent pas d'une version à l'autre tout seuls : utilise l'export et l'import ci-dessus.</p>
        <div><a class="bouton" href="gala-cerveau.zip" download>⬇️ Télécharger le zip</a></div>
      </div>` : ''}
      <div class="carte pile">
        <h2>Bilan de départ</h2>
        <p class="discret" style="margin:0">Un jeu par domaine pour régler le niveau de départ des jeux que tu n'as pas encore essayés.</p>
        <div><button id="refaire-bilan">🧪 ${S.donnees.bilan && S.donnees.bilan.fin ? 'Refaire' : 'Faire'} le bilan</button></div>
      </div>
      <div class="carte pile">
        <h2>Tout effacer</h2>
        <div><button id="effacer">🗑️ Remettre à zéro</button></div>
      </div>
    </div>`;

    $('#prenom').addEventListener('input', e => {
      S.donnees.profil.prenom = e.target.value.trim();
      S.sauver();
    });
    main.querySelectorAll('[data-reglage] button').forEach(b => b.addEventListener('click', () => {
      const nom = b.parentElement.dataset.reglage;
      const brut = b.dataset.val;
      r[nom] = brut === 'true' ? true : brut === 'false' ? false : isNaN(Number(brut)) ? brut : Number(brut);
      S.sauver();
      appliquerReglages();
      b.parentElement.querySelectorAll('button').forEach(x => {
        x.classList.toggle('actif', x === b);
        x.setAttribute('aria-pressed', x === b);
      });
      if (nom === 'sons' && r.sons) Gala.son('ok');
      if (nom === 'voix') ecranReglages();
    }));
    $('#refaire-bilan').addEventListener('click', () => {
      P.commencerBilan();
      location.hash = '#bilan';
    });
    $('#exporter').addEventListener('click', () => {
      S.exporter();
      $('#info-sauvegarde').textContent = 'Fichier enregistré dans tes téléchargements.';
    });
    $('#importer').addEventListener('click', () => $('#fichier').click());
    $('#fichier').addEventListener('change', e => {
      const f = e.target.files[0];
      if (!f) return;
      S.importer(f)
        .then(() => {
          appliquerReglages();
          ecranReglages();
          $('#info-sauvegarde').textContent = 'Progrès importés.';
        })
        .catch(err => { $('#info-sauvegarde').textContent = '⚠️ ' + err.message; });
    });
    $('#effacer').addEventListener('click', () => {
      if (!confirm('Effacer tous les progrès, records et réglages ? Pense à exporter avant.')) return;
      S.reinitialiser();
      appliquerReglages();
      location.hash = '#accueil';
    });
  }

  /* ---------- Version en ligne : installation sur téléphone et cache hors ligne ----------
     En fichier local (file://), ces deux fonctions n'existent pas : on ne les active qu'en http(s). */
  const enLigne = location.protocol === 'https:' || location.hostname === 'localhost';
  if (enLigne) {
    const lien = document.createElement('link');
    lien.rel = 'manifest';
    lien.href = 'manifest.json';
    document.head.appendChild(lien);
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => navigator.serviceWorker.register('sw.js', { scope: './' }).catch(() => {}));
    }
  }

  appliquerReglages();
  window.addEventListener('hashchange', route);
  route();
})();
