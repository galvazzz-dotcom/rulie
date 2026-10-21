/* Tests automatiques de l'étape 1 (le Grand Défilé), avec Playwright.
   Usage : node royaume-outils/test-etape1.mjs [adresse] [dossier des captures]
   - adresse par défaut : http://localhost:8765/royaume/defile.html
     (servir une copie de docs/royaume où la carte d'import pointe vers un three.module.js local,
      ou utiliser directement https://galvazzz-dotcom.github.io/rulie/royaume/defile.html)
   - CHROMIUM=/chemin/vers/chromium si Playwright ne trouve pas son navigateur.
   Vérifie : les 72 espèces × 4 stades × chromatique se construisent sans erreur ; le défilé
   automatique avance ; glisser du doigt change de dindie ; la mémoire reste stable ;
   et fait des captures (roue, glouglou, Grand Livre) sur 4 formats d'écran. */
import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
const URL = process.argv[2] || 'http://localhost:8765/royaume/defile.html', OUT = process.argv[3] || 'captures-etape1';
mkdirSync(OUT, { recursive: true });
const b = await chromium.launch({ executablePath: process.env.CHROMIUM || undefined, args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
let echecs = 0;
const verifier = (ok, texte) => { console.log((ok ? '✅ ' : '❌ ') + texte); if (!ok) echecs++; };
const ouvrir = async (w, h, mob, hash = '') => {
  const pg = await b.newPage({ viewport: { width: w, height: h }, isMobile: mob, hasTouch: mob });
  pg.erreurs = []; pg.on('pageerror', e => pg.erreurs.push(e.message));
  await pg.goto(URL + hash);
  await pg.waitForFunction(() => window.__defile && !document.getElementById('chargement'), null, { timeout: 30000 });
  return pg;
};
/* 1. toutes les espèces, tous les stades */
{
  const pg = await ouvrir(390, 844, true);
  const r = await pg.evaluate(async () => {
    const D = window.__defile, ms = [];
    for (const stade of ['adulte', 'poussin', 'jeune', 'eveille']) for (const chroma of [false, true]) {
      D.etat.stade = stade; D.etat.chroma = chroma;
      for (let i = 0; i < 72; i++) { const t0 = performance.now(); D.choisir(i, 1, true); ms.push(performance.now() - t0); await new Promise(r => requestAnimationFrame(r)); }
    }
    return { moy: ms.reduce((a, b) => a + b) / ms.length };
  });
  verifier(!pg.erreurs.length, `576 dindies construites (72 × 4 stades × chromatique), ${r.moy.toFixed(1)} ms chacune, erreurs : ${pg.erreurs.length}`);
  /* 2. mémoire stable */
  const info = () => pg.evaluate(() => { const i = window.__rendu.renderer.info; return [i.memory.geometries, i.memory.textures]; });
  const m1 = await info();
  await pg.evaluate(async () => { for (let k = 0; k < 100; k++) { window.__defile.choisir((k * 7) % 72, 1, true); await new Promise(r => requestAnimationFrame(r)); } });
  const m2 = await info();
  verifier(m2[0] <= m1[0] + 2 && m2[1] <= m1[1] + 2, `mémoire stable : géométries ${m1[0]} → ${m2[0]}, textures ${m1[1]} → ${m2[1]}`);
  /* 3. défilé automatique et glisser */
  const n0 = await pg.evaluate(() => window.__defile.etat.i);
  await pg.evaluate(() => document.getElementById('bDefile').click());
  const avance = await pg.waitForFunction(n0 => window.__defile.etat.i !== n0, n0, { timeout: 20000 }).then(() => true, () => false);
  verifier(avance, 'le défilé automatique passe à la dindie suivante');
  await pg.evaluate(() => document.getElementById('bDefile').click());
  await pg.waitForFunction(() => !window.__defile.arrivee, null, { timeout: 90000 });
  const avant = await pg.evaluate(() => window.__defile.etat.i);
  await pg.mouse.move(300, 250); await pg.mouse.down(); await pg.mouse.move(120, 255, { steps: 6 }); await pg.mouse.up();
  await pg.waitForTimeout(300);
  verifier(await pg.evaluate(a => window.__defile.etat.i !== a, avant), 'glisser du doigt change de dindie');
  await pg.close();
}
/* 4. les 4 formats d'écran */
for (const [nom, w, h, mob] of [['tel', 390, 844, true], ['paysage', 844, 390, true], ['tablette', 1024, 768, true], ['ordi', 1366, 768, false]]) {
  const pg = await ouvrir(w, h, mob, '#coquelicot');
  await pg.waitForTimeout(1500);
  const clic = s => pg.evaluate(s => document.querySelector(s).click(), s);
  await clic('#actions [data-a="roue"]'); await pg.waitForTimeout(1300); await pg.screenshot({ path: `${OUT}/${nom}_roue.png` });
  await pg.waitForTimeout(2200);
  await clic('#actions [data-a="glouglou"]'); await pg.waitForTimeout(500); await pg.screenshot({ path: `${OUT}/${nom}_glouglou.png` });
  await clic('#bLivre'); await pg.waitForTimeout(600);
  await pg.evaluate(() => document.querySelector('#filtres [data-f="mythique"]').click()); await pg.waitForTimeout(300);
  const nb = await pg.evaluate(() => document.querySelectorAll('#grille .case:not(.cache)').length);
  await pg.screenshot({ path: `${OUT}/${nom}_livre.png` });
  verifier(nb === 8 && !pg.erreurs.length, `${nom} : filtre « mythique » = ${nb} cases, erreurs : ${pg.erreurs.length}`);
  await pg.close();
}
await b.close();
console.log(echecs ? `\n${echecs} échec(s)` : '\nTout est bon.');
process.exit(echecs ? 1 : 0);
