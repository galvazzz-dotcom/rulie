/* Gala Cerveau — moteur : registre des jeux, contexte de partie, sons et voix.
   Chaque jeu est un simple <script> qui appelle Gala.enregistrer({...}).
   Pas de modules ES ni de fetch : tout doit marcher en ouvrant index.html en file://. */
(function () {
  'use strict';
  const Gala = (window.Gala = window.Gala || {});

  Gala.DOMAINES = [
    { id: 'memoire', nom: 'Mémoire', icone: '🧠' },
    { id: 'attention', nom: 'Attention', icone: '🎯' },
    { id: 'vitesse', nom: 'Vitesse', icone: '⚡' },
    { id: 'logique', nom: 'Logique', icone: '🧩' },
    { id: 'langage', nom: 'Langage', icone: '📖' },
    { id: 'executif', nom: 'Organisation', icone: '🗺️' }
  ];

  Gala.jeux = [];

  /* ---------- Contrat de jeu ----------
     {
       id: 'paires',                      identifiant unique, sans espace
       nom: 'Paires', icone: '🃏',
       domaine: 'memoire',                un id de Gala.DOMAINES
       consigne: 'Une ou deux phrases.',
       niveaux: 5,                        nombre de niveaux (1 si aucun)
       adaptatif: true,                   le niveau suit la réussite (ctx.fin doit fournir reussite)
       mesure: { unite: 'coups', meilleur: 'bas' },   'bas' ou 'haut' pour les records
       demarrer(ctx) { ... }              dessine le jeu dans ctx.zone et appelle ctx.fin(...)
     }
  */
  Gala.enregistrer = function (def) {
    const manque = ['id', 'nom', 'domaine', 'consigne', 'demarrer'].filter(k => !def[k]);
    if (manque.length) {
      console.error('[Gala] Jeu ignoré, champs manquants :', manque.join(', '), def);
      return;
    }
    if (Gala.jeux.some(j => j.id === def.id)) {
      console.error('[Gala] Jeu en double ignoré :', def.id);
      return;
    }
    Gala.jeux.push(Object.assign({ icone: '🎲', niveaux: 1, adaptatif: false, mesure: { unite: 'points', meilleur: 'haut' } }, def));
  };

  Gala.trouverJeu = id => Gala.jeux.find(j => j.id === id);

  /* ---------- Sons (générés, aucun fichier à charger) ---------- */
  let audio = null;
  const NOTES = {
    clic: [[660, 0.04]],
    ok: [[660, 0.08], [880, 0.12]],
    erreur: [[220, 0.18]],
    fin: [[523, 0.1], [659, 0.1], [784, 0.2]]
  };
  Gala.son = function (type) {
    if (NOTES[type]) jouerNotes(NOTES[type]);
  };
  // Une note libre (fréquence en Hz, durée en secondes), pour les jeux musicaux.
  Gala.note = function (freq, duree) {
    jouerNotes([[freq, duree]]);
  };
  function jouerNotes(notes) {
    if (!Gala.stockage.donnees.reglages.sons) return;
    try {
      audio = audio || new (window.AudioContext || window.webkitAudioContext)();
      let t = audio.currentTime;
      notes.forEach(([freq, duree]) => {
        const osc = audio.createOscillator(), gain = audio.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.15, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + duree);
        osc.connect(gain).connect(audio.destination);
        osc.start(t);
        osc.stop(t + duree);
        t += duree;
      });
    } catch (e) { /* pas de son, tant pis */ }
  }

  /* ---------- Voix : lecture des consignes par le navigateur ---------- */
  Gala.voixDisponible = 'speechSynthesis' in window;
  Gala.lire = function (texte) {
    if (!Gala.voixDisponible) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(texte);
    u.lang = 'fr-FR';
    u.rate = 0.95;
    const fr = speechSynthesis.getVoices().find(v => v.lang && v.lang.startsWith('fr'));
    if (fr) u.voice = fr;
    speechSynthesis.speak(u);
  };

  /* ---------- Contexte donné à chaque partie ----------
     ui = { message(txt), stats(obj), fin(resultat) } fourni par l'application. */
  Gala.creerContexte = function (def, niveau, zone, ui) {
    const nettoyages = [];
    const debut = performance.now();
    let fini = false;

    const ctx = {
      niveau,
      zone,
      son: Gala.son,

      // Écouteurs et minuteries retirés automatiquement quand on quitte le jeu.
      ecouter(cible, type, fn, opts) {
        cible.addEventListener(type, fn, opts);
        nettoyages.push(() => cible.removeEventListener(type, fn, opts));
      },
      attendre(ms, fn) {
        const t = setTimeout(fn, ms);
        nettoyages.push(() => clearTimeout(t));
        return t;
      },
      repeter(ms, fn) {
        const t = setInterval(fn, ms);
        nettoyages.push(() => clearInterval(t));
        return t;
      },
      surNettoyage(fn) { nettoyages.push(fn); },

      message(texte) { ui.message(texte || ''); },
      stats(obj) { ui.stats(obj || {}); },

      // État sauvegardé d'une partie en cours (reprise après fermeture).
      etat: {
        lire() { return Gala.stockage.jeu(def.id).etat; },
        sauver(v) { Gala.stockage.jeu(def.id).etat = v; Gala.stockage.sauver(); },
        effacer() { Gala.stockage.jeu(def.id).etat = null; Gala.stockage.sauver(); }
      },

      // resultat = { valeur: nombre ou null, reussite: 0..1 (jeux adaptatifs), reussi: bool }
      fin(resultat) {
        if (fini) return;
        fini = true;
        const r = Object.assign({ valeur: null, reussite: null, reussi: true }, resultat);
        r.duree = Math.round((performance.now() - debut) / 1000);
        ui.fin(r);
      },
      get estFini() { return fini; }
    };

    ctx._nettoyer = function () {
      nettoyages.splice(0).forEach(f => {
        try { f(); } catch (e) { console.error(e); }
      });
    };
    return ctx;
  };

  /* ---------- Petits utilitaires pour les jeux ---------- */
  Gala.outils = {
    // Styles propres à un jeu, ajoutés une seule fois à la page.
    style(id, css) {
      if (document.getElementById('style-' + id)) return;
      const el = document.createElement('style');
      el.id = 'style-' + id;
      el.textContent = css;
      document.head.appendChild(el);
    },
    melanger(t) {
      const a = t.slice();
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    },
    // Glissement au doigt : cb(dx, dy) avec dx, dy dans {-1, 0, 1}.
    glisser(ctx, el, cb) {
      let x0 = null, y0 = null;
      ctx.ecouter(el, 'touchstart', e => { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive: true });
      ctx.ecouter(el, 'touchmove', e => e.preventDefault(), { passive: false });
      ctx.ecouter(el, 'touchend', e => {
        if (x0 == null) return;
        const dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0;
        x0 = null;
        if (Math.max(Math.abs(dx), Math.abs(dy)) < 25) return;
        if (Math.abs(dx) > Math.abs(dy)) cb(dx > 0 ? 1 : -1, 0);
        else cb(0, dy > 0 ? 1 : -1);
      });
    },
    // Flèches du clavier : cb(dx, dy).
    fleches(ctx, cb) {
      const DIR = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] };
      ctx.ecouter(document, 'keydown', e => {
        const d = DIR[e.key];
        if (!d) return;
        e.preventDefault();
        cb(d[0], d[1]);
      });
    }
  };
})();
