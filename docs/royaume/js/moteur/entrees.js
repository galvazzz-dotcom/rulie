/* Les commandes : toucher (marcher là), glisser (joystick sous le doigt),
   pincer ou molette (zoom), clavier (flèches / ZQSD / WASD, E ou Espace pour agir). */
export function entrees(element, { surTap, surZoom, surAction } = {}) {
  const joy = { actif: false, x: 0, y: 0, ox: 0, oy: 0, px: 0, py: 0 };
  const doigts = new Map();
  let depart = null, pince = null;
  const RAYON = 60;
  const vue = document.createElement('div'); vue.className = 'joystick cache'; vue.innerHTML = '<i></i>';
  document.body.appendChild(vue);
  const majVue = () => {
    vue.classList.toggle('cache', !joy.actif);
    if (!joy.actif) return;
    vue.style.left = joy.ox + 'px'; vue.style.top = joy.oy + 'px';
    vue.firstChild.style.transform = `translate(${joy.x * RAYON}px, ${joy.y * RAYON}px)`;
  };
  element.addEventListener('pointerdown', ev => {
    element.setPointerCapture?.(ev.pointerId);
    doigts.set(ev.pointerId, [ev.clientX, ev.clientY]);
    if (doigts.size === 2) { const [a, b] = [...doigts.values()]; pince = Math.hypot(a[0] - b[0], a[1] - b[1]); joy.actif = false; majVue(); depart = null; return; }
    depart = { x: ev.clientX, y: ev.clientY, t: performance.now(), id: ev.pointerId };
  });
  element.addEventListener('pointermove', ev => {
    if (!doigts.has(ev.pointerId)) return;
    doigts.set(ev.pointerId, [ev.clientX, ev.clientY]);
    if (doigts.size === 2 && pince) {
      const [a, b] = [...doigts.values()], d = Math.hypot(a[0] - b[0], a[1] - b[1]);
      surZoom && surZoom(pince / d); pince = d; return;
    }
    if (!depart || ev.pointerId !== depart.id) return;
    const dx = ev.clientX - depart.x, dy = ev.clientY - depart.y;
    if (!joy.actif && Math.hypot(dx, dy) > 14) { joy.actif = true; joy.ox = depart.x; joy.oy = depart.y; }
    if (joy.actif) {
      const l = Math.hypot(dx, dy), k = Math.min(1, l / RAYON);
      joy.x = l ? dx / l * k : 0; joy.y = l ? dy / l * k : 0; majVue();
    }
  });
  const fin = ev => {
    doigts.delete(ev.pointerId);
    if (doigts.size < 2) pince = null;
    if (!depart || ev.pointerId !== depart.id) return;
    if (!joy.actif && performance.now() - depart.t < 600 && ev.type === 'pointerup') surTap && surTap(ev.clientX, ev.clientY);
    joy.actif = false; joy.x = joy.y = 0; majVue(); depart = null;
  };
  element.addEventListener('pointerup', fin);
  element.addEventListener('pointercancel', fin);
  element.addEventListener('wheel', ev => { ev.preventDefault(); surZoom && surZoom(ev.deltaY > 0 ? 1.1 : .9); }, { passive: false });

  const touches = new Set();
  addEventListener('keydown', ev => {
    if (ev.target.closest && ev.target.closest('input, textarea')) return;
    const k = ev.key.toLowerCase();
    touches.add(k);
    if ((k === 'e' || k === ' ' || k === 'enter') && surAction) { ev.preventDefault(); surAction(); }
  });
  addEventListener('keyup', ev => touches.delete(ev.key.toLowerCase()));
  addEventListener('blur', () => touches.clear());
  function direction() {
    if (joy.actif) return { x: joy.x, y: joy.y, joystick: true };
    let x = 0, y = 0;
    if (touches.has('arrowleft') || touches.has('q') || touches.has('a')) x -= 1;
    if (touches.has('arrowright') || touches.has('d')) x += 1;
    if (touches.has('arrowup') || touches.has('z') || touches.has('w')) y -= 1;
    if (touches.has('arrowdown') || touches.has('s')) y += 1;
    const l = Math.hypot(x, y);
    return l ? { x: x / l, y: y / l, clavier: true } : { x: 0, y: 0 };
  }
  return { direction, annuler: () => { joy.actif = false; depart = null; majVue(); } };
}
