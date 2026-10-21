/* Les sauvegardes : 3 profils sur l'appareil, et un « code de sauvegarde »
   (ou un fichier) pour ne jamais perdre sa partie ou changer d'appareil.
   Tout est protégé par try/catch : sans stockage (navigation privée),
   le jeu marche quand même, il ne garde simplement rien. */
const CLE = 'royaumeDindies.v1', MAX_PROFILS = 3;
const lire = (k, defaut) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : defaut; } catch { return defaut; } };
const ecrire = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch { return false; } };
const effacer = k => { try { localStorage.removeItem(k); } catch { /* rien */ } };

export function listeProfils() { return lire(CLE, { profils: [] }).profils; }
export function profilActif() { return lire(CLE, { actif: null }).actif; }
export const peutCreer = () => listeProfils().length < MAX_PROFILS;
function majIndex(f) { const idx = lire(CLE, { profils: [], actif: null }); f(idx); ecrire(CLE, idx); }

export function creerProfil(nom, couleur) {
  const id = 'p' + Date.now().toString(36);
  majIndex(idx => { idx.profils.push({ id, nom, couleur, maj: Date.now(), resume: '' }); idx.actif = id; });
  return id;
}
export function choisirProfil(id) { majIndex(idx => { idx.actif = id; }); }
export function supprimerProfil(id) {
  majIndex(idx => { idx.profils = idx.profils.filter(p => p.id !== id); if (idx.actif === id) idx.actif = null; });
  effacer(`${CLE}.${id}`);
}
export function chargerProfil(id) { return lire(`${CLE}.${id}`, null); }
export function sauverProfil(id, etat, resume = '') {
  const ok = ecrire(`${CLE}.${id}`, etat);
  majIndex(idx => { const p = idx.profils.find(x => x.id === id); if (p) { p.maj = Date.now(); p.resume = resume; p.nom = etat.profil?.nom || p.nom; } });
  return ok;
}

/* le code de sauvegarde : « RD1- » + les données en base64 + une petite somme de contrôle */
const somme = s => { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h.toString(36); };
export function exporterCode(etat) {
  const json = JSON.stringify(etat), b64 = btoa(unescape(encodeURIComponent(json)));
  return `RD1-${b64}-${somme(b64)}`;
}
export function importerCode(code) {
  const c = String(code).trim().replace(/\s+/g, '');
  const m = c.match(/^RD1-([A-Za-z0-9+/=]+)-([a-z0-9]+)$/);
  if (!m) throw new Error('Ce code ne ressemble pas à un code de sauvegarde.');
  if (somme(m[1]) !== m[2]) throw new Error('Ce code est abîmé (une lettre manque ?).');
  const etat = JSON.parse(decodeURIComponent(escape(atob(m[1]))));
  if (!etat || !etat.version) throw new Error('Ce code ne contient pas de partie.');
  return etat;
}
export function telecharger(etat, nom = 'royaume-des-dindies') {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([exporterCode(etat)], { type: 'text/plain' }));
  a.download = `${nom}.txt`; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}
