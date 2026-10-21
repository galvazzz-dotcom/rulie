/* ══════════ LA GRILLE OÙ L'ON PEUT MARCHER, ET LE CHEMIN LE PLUS COURT (A*) ══════════
   Le monde est découpé en cases de 0,5 m. Chaque obstacle (bâtiment, arbre,
   barrière, eau…) bouche des cases. trouverChemin() donne une suite de
   points à suivre, lissée (on coupe en ligne droite quand on voit le bout). */
export function creerGrille(x0, z0, largeur, profondeur, pas = .5) {
  const L = Math.ceil(largeur / pas), P = Math.ceil(profondeur / pas);
  const libre = new Uint8Array(L * P).fill(1);
  const versCase = (x, z) => [Math.floor((x - x0) / pas), Math.floor((z - z0) / pas)];
  const centre = (i, j) => [x0 + (i + .5) * pas, z0 + (j + .5) * pas];
  const dedans = (i, j) => i >= 0 && j >= 0 && i < L && j < P;
  const estLibre = (i, j) => dedans(i, j) && libre[j * L + i] === 1;
  const libreEn = (x, z) => { const [i, j] = versCase(x, z); return estLibre(i, j); };

  /* les obstacles : rectangle (tourné ou non), cercle, ou une fonction « bouché ? » */
  function boucherRect(cx, cz, w, d, angle = 0, marge = .25) {
    const c = Math.cos(angle), s = Math.sin(angle), R = Math.hypot(w, d) / 2 + marge;
    const [i0, j0] = versCase(cx - R, cz - R), [i1, j1] = versCase(cx + R, cz + R);
    for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
      if (!dedans(i, j)) continue;
      const [x, z] = centre(i, j), dx = x - cx, dz = z - cz;
      const lx = dx * c - dz * s, lz = dx * s + dz * c;
      if (Math.abs(lx) <= w / 2 + marge && Math.abs(lz) <= d / 2 + marge) libre[j * L + i] = 0;
    }
  }
  function boucherCercle(cx, cz, r) {
    const [i0, j0] = versCase(cx - r, cz - r), [i1, j1] = versCase(cx + r, cz + r);
    for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) { if (!dedans(i, j)) continue; const [x, z] = centre(i, j); if (Math.hypot(x - cx, z - cz) <= r) libre[j * L + i] = 0; }
  }
  function boucherSi(f) { for (let j = 0; j < P; j++) for (let i = 0; i < L; i++) { const [x, z] = centre(i, j); if (f(x, z)) libre[j * L + i] = 0; } }
  function libererRect(cx, cz, w, d) {
    const [i0, j0] = versCase(cx - w / 2, cz - d / 2), [i1, j1] = versCase(cx + w / 2, cz + d / 2);
    for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) if (dedans(i, j)) libre[j * L + i] = 1;
  }
  /* la case libre la plus proche (si on touche un arbre, on va à côté) */
  function plusProcheLibre(x, z) {
    const [ci, cj] = versCase(x, z);
    if (estLibre(ci, cj)) return [x, z];
    for (let r = 1; r < 40; r++) {
      let best = null, bd = 1e9;
      for (let j = cj - r; j <= cj + r; j++) for (let i = ci - r; i <= ci + r; i++) {
        if (Math.max(Math.abs(i - ci), Math.abs(j - cj)) !== r || !estLibre(i, j)) continue;
        const [cx, cz] = centre(i, j), d = Math.hypot(cx - x, cz - z); if (d < bd) { bd = d; best = [cx, cz]; }
      }
      if (best) return best;
    }
    return null;
  }
  /* voit-on en ligne droite d'un point à l'autre ? */
  function vue(ax, az, bx, bz) {
    const d = Math.hypot(bx - ax, bz - az), n = Math.ceil(d / (pas * .5));
    for (let k = 1; k < n; k++) { const t = k / n; if (!libreEn(ax + (bx - ax) * t, az + (bz - az) * t)) return false; }
    return true;
  }
  /* A* sur 8 directions (sans couper les coins) */
  const gScore = new Float32Array(L * P), venu = new Int32Array(L * P), ferme = new Uint8Array(L * P), vu = new Uint32Array(L * P);
  let tour = 0;
  function trouverChemin(ax, az, bx, bz) {
    const fin = plusProcheLibre(bx, bz); if (!fin) return null;
    const debut = plusProcheLibre(ax, az); if (!debut) return null;
    [bx, bz] = fin;
    if (vue(ax, az, bx, bz)) return [[bx, bz]];
    const [si, sj] = versCase(...debut), [ei, ej] = versCase(bx, bz);
    tour++;
    const tas = [], pousser = (n, f) => { tas.push([f, n]); let k = tas.length - 1; while (k) { const p = (k - 1) >> 1; if (tas[p][0] <= tas[k][0]) break; [tas[p], tas[k]] = [tas[k], tas[p]]; k = p; } };
    const tirer = () => { const h = tas[0], last = tas.pop(); if (tas.length) { tas[0] = last; let k = 0; for (;;) { const a = 2 * k + 1, b = a + 1; let m = k; if (a < tas.length && tas[a][0] < tas[m][0]) m = a; if (b < tas.length && tas[b][0] < tas[m][0]) m = b; if (m === k) break; [tas[m], tas[k]] = [tas[k], tas[m]]; k = m; } } return h; };
    const h = (i, j) => { const dx = Math.abs(i - ei), dz = Math.abs(j - ej); return (dx + dz) + (Math.SQRT2 - 2) * Math.min(dx, dz); };
    const s0 = sj * L + si; vu[s0] = tour; gScore[s0] = 0; ferme[s0] = 0; venu[s0] = -1; pousser(s0, h(si, sj));
    let trouve = false, n = 0;
    while (tas.length && n++ < 60000) {
      const [, c] = tirer();
      if (ferme[c] === tour % 255 + 1 && vu[c] === tour) continue;
      ferme[c] = tour % 255 + 1;
      const ci = c % L, cj = (c / L) | 0;
      if (ci === ei && cj === ej) { trouve = true; break; }
      for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) {
        if (!di && !dj) continue;
        const ni = ci + di, nj = cj + dj;
        if (!estLibre(ni, nj) || (di && dj && (!estLibre(ci + di, cj) || !estLibre(ci, cj + dj)))) continue;
        const nc = nj * L + ni, g = gScore[c] + (di && dj ? Math.SQRT2 : 1);
        if (vu[nc] === tour && (g >= gScore[nc] || ferme[nc] === tour % 255 + 1)) continue;
        vu[nc] = tour; ferme[nc] = 0; gScore[nc] = g; venu[nc] = c; pousser(nc, g + h(ni, nj));
      }
    }
    if (!trouve) return null;
    const brut = [];
    for (let c = ej * L + ei; c !== -1; c = venu[c]) brut.push(centre(c % L, (c / L) | 0));
    brut.reverse(); brut[brut.length - 1] = [bx, bz];
    /* on lisse : depuis chaque point, on saute au plus loin qu'on voit */
    const lisse = []; let cur = [ax, az], k = 0;
    while (k < brut.length) {
      let loin = k;
      for (let m = brut.length - 1; m > k; m--) if (vue(cur[0], cur[1], brut[m][0], brut[m][1])) { loin = m; break; }
      lisse.push(brut[loin]); cur = brut[loin]; k = loin + 1;
    }
    return lisse;
  }
  /* avancer en glissant le long des obstacles (pour le joystick) */
  function glisser(x, z, dx, dz, r = .3) {
    const ok = (X, Z) => libreEn(X, Z) && libreEn(X + r, Z) && libreEn(X - r, Z) && libreEn(X, Z + r) && libreEn(X, Z - r);
    if (ok(x + dx, z + dz)) return [x + dx, z + dz];
    if (ok(x + dx, z)) return [x + dx, z];
    if (ok(x, z + dz)) return [x, z + dz];
    return [x, z];
  }
  return { boucherRect, boucherCercle, boucherSi, libererRect, trouverChemin, plusProcheLibre, libreEn, vue, glisser, L, P, pas, x0, z0, libre };
}
