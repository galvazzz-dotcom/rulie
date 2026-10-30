/* Gala Cerveau — difficulté adaptative et statistiques.
   Règle : on monte d'un niveau après 3 parties à 85 % ou plus,
   on redescend après 2 parties sous 60 %. Cible : environ 80 % de réussite. */
(function () {
  'use strict';
  const Gala = (window.Gala = window.Gala || {});
  const S = () => Gala.stockage;

  const SEUIL_HAUT = 0.85, PARTIES_HAUT = 3;
  const SEUIL_BAS = 0.6, PARTIES_BAS = 2;

  function niveauConseille(def) {
    const n = S().jeu(def.id).niveau || 1;
    return Math.min(Math.max(1, n), def.niveaux);
  }

  // Appelé après chaque partie d'un jeu adaptatif joué au niveau conseillé.
  // Renvoie +1, -1 ou 0.
  function apresPartie(def, reussite, niveauJoue) {
    const j = S().jeu(def.id);
    if (niveauJoue !== niveauConseille(def)) return 0; // partie libre à un autre niveau

    if (reussite >= SEUIL_HAUT) {
      j.compteurs.haut++;
      j.compteurs.bas = 0;
    } else if (reussite < SEUIL_BAS) {
      j.compteurs.bas++;
      j.compteurs.haut = 0;
    } else {
      j.compteurs.haut = 0;
      j.compteurs.bas = 0;
    }

    let changement = 0;
    if (j.compteurs.haut >= PARTIES_HAUT && j.niveau < def.niveaux) {
      j.niveau++;
      changement = 1;
    } else if (j.compteurs.bas >= PARTIES_BAS && j.niveau > 1) {
      j.niveau--;
      changement = -1;
    }
    if (changement) j.compteurs = { haut: 0, bas: 0 };
    S().sauver();
    return changement;
  }

  // Nombre de jours consécutifs joués, en comptant aujourd'hui (ou hier si
  // aujourd'hui n'est pas encore joué, pour ne pas casser la série le matin).
  function serieJours() {
    const jours = S().donnees.jours;
    const d = new Date();
    if (!jours[S().jourCle(d)]) d.setDate(d.getDate() - 1);
    let n = 0;
    while (jours[S().jourCle(d)]) {
      n++;
      d.setDate(d.getDate() - 1);
    }
    return n;
  }

  function secondesSur(nbJours) {
    const jours = S().donnees.jours;
    const d = new Date();
    let total = 0;
    for (let i = 0; i < nbJours; i++) {
      total += jours[S().jourCle(d)] || 0;
      d.setDate(d.getDate() - 1);
    }
    return total;
  }

  function totalParties() {
    return Object.values(S().donnees.jeux).reduce((n, j) => n + (j.parties ? j.parties.length : 0), 0);
  }

  /* ---------- Séance du jour ----------
     Jusqu'à 4 jeux de domaines différents, en priorité les domaines les moins
     travaillés ces 7 derniers jours. Tirée une fois par jour puis gardée. */
  const TAILLE_SEANCE = 4;

  function secondesRecentes(id) {
    const limite = Date.now() - 7 * 864e5;
    return S().jeu(id).parties.reduce((t, p) => t + (Date.parse(p.d) >= limite ? p.s || 0 : 0), 0);
  }

  function seanceDuJour() {
    const cle = S().jourCle();
    const seances = S().donnees.seances;
    const existante = seances[cle];
    if (existante && existante.jeux.every(id => Gala.trouverJeu(id))) return existante;

    const candidats = Gala.jeux.filter(j => !j.detente);
    const domaines = {};
    candidats.forEach(j => {
      const t = secondesRecentes(j.id) + Math.random(); // le hasard départage les égalités
      if (!domaines[j.domaine] || t < domaines[j.domaine].t) domaines[j.domaine] = { id: j.id, t };
    });
    const choix = Object.keys(domaines)
      .map(d => ({ id: domaines[d].id, t: Gala.jeux.filter(j => j.domaine === d && !j.detente).reduce((s, j) => s + secondesRecentes(j.id), 0) + Math.random() }))
      .sort((a, b) => a.t - b.t)
      .slice(0, TAILLE_SEANCE)
      .map(x => x.id);

    // On ne garde que les 30 dernières séances.
    Object.keys(seances).sort().slice(0, -30).forEach(k => delete seances[k]);
    seances[cle] = { jeux: choix, faits: [] };
    S().sauver();
    return seances[cle];
  }

  function marquerFait(id) {
    const s = seanceDuJour();
    if (s.jeux.includes(id) && !s.faits.includes(id)) {
      s.faits.push(id);
      S().sauver();
    }
    return s;
  }

  /* ---------- Bilan de départ ----------
     Un jeu par domaine, joué au niveau 2. Sa réussite règle le niveau de départ de tous les jeux
     du domaine qui n'ont pas encore été joués (et du jeu du bilan lui-même). */
  const JEUX_BILAN = ['empan', 'intrus', 'pareil', 'suites', 'proverbes', 'rotation'];
  const NIVEAU_BILAN = 2;

  function commencerBilan() {
    S().donnees.bilan = { jeux: JEUX_BILAN.filter(id => Gala.trouverJeu(id)), faits: [], niveaux: {}, fin: null, masque: false };
    S().sauver();
    return S().donnees.bilan;
  }

  function bilan() {
    return S().donnees.bilan || commencerBilan();
  }

  function noterBilan(def, reussite) {
    const b = bilan();
    if (!b.jeux.includes(def.id)) return b;
    const niveau = reussite >= 0.85 ? 3 : reussite >= 0.6 ? 2 : 1;
    b.niveaux[def.domaine] = niveau;
    if (!b.faits.includes(def.id)) b.faits.push(def.id);
    Gala.jeux.filter(j => j.domaine === def.domaine && j.adaptatif && !j.detente).forEach(j => {
      const info = S().jeu(j.id);
      if (j.id === def.id || !info.parties.length) {
        info.niveau = Math.min(niveau, j.niveaux);
        info.compteurs = { haut: 0, bas: 0 };
      }
    });
    if (b.faits.length >= b.jeux.length) b.fin = new Date().toISOString();
    S().sauver();
    return b;
  }

  Gala.progression = {
    niveauConseille, apresPartie, serieJours, secondesSur, totalParties, seanceDuJour, marquerFait,
    bilan, commencerBilan, noterBilan, NIVEAU_BILAN
  };
})();
