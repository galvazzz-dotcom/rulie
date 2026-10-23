/* Le test express (1 à 2 minutes), à lancer avant la série complète : il attrape les erreurs bêtes avant de jouer des heures.
   Usage : node royaume-outils/test-express.mjs [adresse du site] [--three=chemin]
   - sans adresse, docs/ est servi par le petit serveur local (serveur.mjs) ;
   - --three=chemin : servir ce three.module.js au lieu du CDN (pour tester sans Internet).
   1. La syntaxe de chaque module du jeu (lu comme un module ES : un nom déclaré deux fois, par exemple).
   2. Chaque module s'importe dans la page (un import qui n'existe pas, une erreur au chargement).
   3. Les 3 pages s'ouvrent sans erreur, sur téléphone et sur ordinateur : le jeu (nouvelle partie jusqu'au Domaine),
      le Grand Défilé et la page publique du Grand Livre. */
import { chromium } from 'playwright';
import { spawnSync } from 'child_process';
import { readdirSync, statSync } from 'fs';
import { join, relative } from 'path';
import { serveur, DOCS } from './serveur.mjs';

const args = process.argv.slice(2), opt = Object.fromEntries(args.filter(a => a.startsWith('--')).map(a => { const m = /^--([^=]+)=?(.*)$/.exec(a); return [m[1], m[2]]; }));
const adresseDonnee = args.find(a => !a.startsWith('--'));
let echecs = 0;
const verifier = (ok, texte) => { console.log((ok ? '✅ ' : '❌ ') + texte); if (!ok) echecs++; };
const t0 = Date.now();

/* ── 1. la syntaxe ── */
const JS = join(DOCS, 'royaume', 'js'), fichiers = [];
const parcourir = d => { for (const n of readdirSync(d)) { const f = join(d, n); if (statSync(f).isDirectory()) parcourir(f); else if (n.endsWith('.js')) fichiers.push(f); } };
parcourir(JS);
const fautes = fichiers.map(f => [f, spawnSync(process.execPath, ['--experimental-default-type=module', '--check', f], { encoding: 'utf8' })]).filter(([, r]) => r.status !== 0);
verifier(!fautes.length, `la syntaxe des ${fichiers.length} modules du jeu${fautes.map(([f, r]) => `\n   ${relative(DOCS, f)} : ${(r.stderr || '').split('\n').find(l => /Error/.test(l)) || (r.stderr || '').trim().split('\n')[0]}`).join('')}`);

/* ── 2 et 3. dans le navigateur ── */
const { S, adresse } = adresseDonnee ? { S: null, adresse: adresseDonnee.replace(/\/$/, '') } : await serveur({ three: opt.three });
const R = `${adresse}/royaume`;
/* les pages qui démarrent toutes seules ne s'importent pas à part : on les ouvre */
const ENTREES = new Set(['main.js', 'defile-main.js', 'grand-livre-main.js']);
const modules = fichiers.map(f => './' + relative(join(DOCS, 'royaume'), f).split('\\').join('/')).filter(m => !ENTREES.has(m.split('/').pop()));
const b = await chromium.launch({ executablePath: process.env.CHROMIUM || undefined, args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
try {
  for (const [nom, w, h, mob] of [['téléphone', 390, 844, true], ['ordinateur', 1280, 800, false]]) {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, isMobile: mob, hasTouch: mob });
    const pg = await ctx.newPage(), errs = [];
    pg.on('pageerror', e => errs.push(e.message)); pg.on('console', m => { if (m.type() === 'error' && !/CERT|404|ERR_|fonts|net::/.test(m.text())) errs.push('console : ' + m.text()); });
    const sansErreur = (texte, ok = true) => { verifier(ok && !errs.length, `${nom} : ${texte}${errs.length ? ' — erreurs : ' + errs.splice(0).slice(0, 4).join(' | ') : ''}`); errs.length = 0; };

    /* le jeu : chaque module s'importe, puis une nouvelle partie jusqu'au Domaine */
    await pg.goto(`${R}/index.html`); await pg.evaluate(() => localStorage.clear()); await pg.reload(); await pg.waitForTimeout(800);
    if (nom === 'téléphone') {
      const rates = await pg.evaluate(async L => { const r = []; for (const m of L) { try { await import(m); } catch (e) { r.push(m + ' : ' + e.message); } } return r; }, modules);
      verifier(!rates.length, `les ${modules.length} modules s’importent dans la page${rates.map(x => '\n   ' + x).join('')}`);
      await pg.reload(); await pg.waitForTimeout(800);
    }
    await pg.waitForSelector('#tNouveau', { timeout: 30000 });
    await pg.evaluate(() => document.getElementById('tNouveau').click()); await pg.fill('#tNom', 'Express');
    await pg.evaluate(() => document.getElementById('tGo').click()); await pg.waitForTimeout(400);
    await pg.evaluate(() => document.querySelector('#prologue .passer')?.dispatchEvent(new PointerEvent('pointerup', { bubbles: true })));
    const jeu = await pg.waitForFunction(() => window.__jeu && window.__jeu.monde && document.getElementById('hud'), null, { timeout: 60000 }).then(() => true, () => false);
    await pg.waitForTimeout(1500);
    const dessins = jeu ? await pg.evaluate(() => window.__rendu.renderer.info.render.calls) : 0;
    sansErreur(`le jeu s’ouvre : écran titre, nouvelle partie, prologue, le Domaine en 3D (${dessins} dessins par image)`, jeu && dessins > 10);

    /* le Grand Défilé */
    await pg.goto(`${R}/defile.html`);
    const defile = await pg.waitForFunction(() => window.__defile && !document.getElementById('chargement'), null, { timeout: 30000 }).then(() => true, () => false);
    sansErreur('le Grand Défilé s’ouvre', defile);

    /* la page publique du Grand Livre */
    await pg.goto(`${R}/grand-livre.html`); await pg.waitForTimeout(600);
    const g = await pg.evaluate(() => ({ cartes: document.querySelectorAll('.dindie').length, large: document.documentElement.scrollWidth <= innerWidth + 1 }));
    await pg.evaluate(() => document.querySelector('.dindie')?.click()); await pg.waitForTimeout(200);
    const fiche = await pg.evaluate(() => !document.getElementById('fiche').classList.contains('cache'));
    sansErreur(`le Grand Livre public s’ouvre : ${g.cartes} dindies, une fiche${g.large ? '' : ' (⚠️ la page déborde sur le côté)'}`, g.cartes === 72 && fiche && g.large);
    await ctx.close();
  }
} catch (e) { verifier(false, 'le test s’est arrêté : ' + e.message.split('\n')[0]); }
await b.close(); S && S.close();
console.log(echecs ? `\n❌ test express : ${echecs} échec(s) (${Math.round((Date.now() - t0) / 1000)} s)` : `\n✅ test express : tout s’ouvre, aucune erreur (${Math.round((Date.now() - t0) / 1000)} s)`);
process.exit(echecs ? 1 : 0);
