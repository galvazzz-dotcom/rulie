/* La qualité d'image qui s'adapte (étape 9) : la décision seule, sans rien dessiner (pour pouvoir la tester).
   Toutes les 2,5 s, avec le nombre d'images par seconde (fps) :
   - sous 38 : on baisse d'un cran (en sautant les crans qui ne changent rien sur cet écran) ;
   - si la baisse d'avant n'a presque rien changé (moins de 10 % de mieux), ce n'est pas le dessin qui ralentit
     (un téléphone en économie d'énergie, bloqué à 30 images par seconde, ou un processeur lent) : on remonte d'un cran
     et on ne baisse plus ;
   - au-dessus de 57 depuis longtemps (25 s), on remonte d'un cran.
   Q : la liste des crans ({ pr, ombre }) ; e : { niveau, min, depuis, fpsAvant, bloque } → { niveau, fpsAvant, bloque } */
export function decisionQualite(Q, e, fps, maintenant) {
  const r = { niveau: e.niveau, fpsAvant: e.fpsAvant, bloque: e.bloque };
  if (maintenant - e.depuis <= 4000) return r;
  if (e.fpsAvant && fps < 38 && fps < e.fpsAvant * 1.1) return { niveau: Math.max(e.min, e.niveau - 1), fpsAvant: 0, bloque: true };
  r.fpsAvant = 0;
  const pareil = (a, b) => Q[a].pr === Q[b].pr && Q[a].ombre === Q[b].ombre;
  if (fps < 38 && !e.bloque) {
    let n = e.niveau + 1;
    while (n < Q.length - 1 && pareil(n, e.niveau)) n++;
    if (n < Q.length && !pareil(n, e.niveau)) { r.niveau = n; r.fpsAvant = fps; }
  } else if (fps > 57 && e.niveau > e.min && maintenant - e.depuis > 25000) r.niveau = e.niveau - 1;
  return r;
}
