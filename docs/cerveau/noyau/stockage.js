/* Gala Cerveau — stockage local des progrès, export et import.
   Tout vit dans le navigateur (localStorage) : aucun serveur, aucun compte. */
(function () {
  'use strict';
  const Gala = (window.Gala = window.Gala || {});

  const CLE = 'gala_cerveau_v1';
  const MAX_PARTIES = 300; // par jeu, pour garder un fichier léger

  function vide() {
    return {
      version: 1,
      creeLe: new Date().toISOString(),
      profil: { prenom: '' },
      reglages: { taille: 1, theme: 'auto', sons: true, voix: true },
      jeux: {},
      jours: {}, // 'AAAA-MM-JJ' -> secondes jouées
      seances: {}, // 'AAAA-MM-JJ' -> { jeux: [ids], faits: [ids] }
      bilan: null // bilan de départ : { jeux, faits, niveaux: { domaine: niveau }, fin, masque }
    };
  }

  let donnees = vide();
  let disponible = true;

  function charger() {
    try {
      const texte = localStorage.getItem(CLE);
      if (texte) donnees = completer(JSON.parse(texte));
    } catch (e) {
      disponible = false;
    }
  }

  // Ajoute les champs manquants (fichier d'une ancienne version, import partiel).
  function completer(d) {
    const base = vide();
    if (!d || typeof d !== 'object') return base;
    return {
      version: 1,
      creeLe: d.creeLe || base.creeLe,
      profil: Object.assign(base.profil, d.profil),
      reglages: Object.assign(base.reglages, d.reglages),
      jeux: d.jeux && typeof d.jeux === 'object' ? d.jeux : {},
      jours: d.jours && typeof d.jours === 'object' ? d.jours : {},
      seances: d.seances && typeof d.seances === 'object' ? d.seances : {},
      bilan: d.bilan && typeof d.bilan === 'object' ? d.bilan : null
    };
  }

  function sauver() {
    if (!disponible) return;
    try {
      localStorage.setItem(CLE, JSON.stringify(donnees));
    } catch (e) {
      disponible = false;
    }
  }

  function jourCle(date) {
    const d = date || new Date();
    const p = n => String(n).padStart(2, '0');
    return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
  }

  function jeu(id) {
    if (!donnees.jeux[id]) {
      donnees.jeux[id] = { niveau: 1, compteurs: { haut: 0, bas: 0 }, records: {}, parties: [], etat: null };
    }
    return donnees.jeux[id];
  }

  function meilleur(def, a, b) {
    if (a == null) return true;
    return def.mesure.meilleur === 'bas' ? b < a : b > a;
  }

  // partie = { n: niveau, v: valeur ou null, r: réussite 0..1 ou null, s: durée en secondes }
  function enregistrerPartie(def, partie) {
    const j = jeu(def.id);
    const p = Object.assign({ d: new Date().toISOString() }, partie);
    j.parties.push(p);
    if (j.parties.length > MAX_PARTIES) j.parties.splice(0, j.parties.length - MAX_PARTIES);

    let nouveauRecord = false;
    if (p.v != null) {
      const ancien = j.records[p.n];
      if (meilleur(def, ancien, p.v)) {
        nouveauRecord = ancien != null; // le tout premier score n'est pas fêté comme un record
        j.records[p.n] = p.v;
      }
    }

    const cle = jourCle();
    donnees.jours[cle] = (donnees.jours[cle] || 0) + Math.round(p.s || 0);
    sauver();
    return { nouveauRecord, record: j.records[p.n] };
  }

  function exporter() {
    const blob = new Blob([JSON.stringify(donnees, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'gala-cerveau-progres-' + jourCle() + '.json';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      URL.revokeObjectURL(a.href);
      a.remove();
    }, 1000);
  }

  function importer(fichier) {
    return fichier.text().then(texte => {
      const d = JSON.parse(texte);
      if (!d || d.version !== 1 || typeof d.jeux !== 'object') {
        throw new Error("Ce fichier ne ressemble pas à une sauvegarde Gala Cerveau.");
      }
      donnees = completer(d);
      sauver();
    });
  }

  function reinitialiser() {
    donnees = vide();
    sauver();
  }

  charger();

  Gala.stockage = {
    get donnees() { return donnees; },
    get disponible() { return disponible; },
    jeu,
    sauver,
    jourCle,
    enregistrerPartie,
    exporter,
    importer,
    reinitialiser
  };
})();
