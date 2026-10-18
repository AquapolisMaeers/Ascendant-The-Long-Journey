'use strict';
(function(G, U) {
  // Cosmetic particles have their own randomness and never touch the character RNG.
  const canvas = document.createElement('canvas');
  canvas.id = 'atmosphere'; canvas.setAttribute('aria-hidden', 'true');
  document.body.append(canvas);
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  let width = 0, height = 0, particles = [], mode = '', last = 0, enabled = false;
  const seed = (fromTop = false) => ({x:Math.random() * width, y:fromTop ? -Math.random() * height : Math.random() * height,
    speed:.4 + Math.random(), size:1 + Math.random() * 1.7, phase:Math.random() * Math.PI * 2});
  const resize = () => {
    width = innerWidth; height = innerHeight;
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); mode = '';
  };
  window.addEventListener('resize', resize); resize();
  const frame = time => {
    requestAnimationFrame(frame);
    if (document.hidden || time - last < 33) return;
    const dt = Math.min(60, time - last || 33) / 1000; last = time;
    const active = !!G.character() && !G.runtime.selecting && G.state.settings.atmosphere !== false &&
      !G.state.settings.reduced && !matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!active) {
      if (enabled) ctx.clearRect(0, 0, width, height);
      enabled = false; canvas.hidden = true; return;
    }
    canvas.hidden = false; enabled = true;
    const weather = G.runtime.page === 'World' ? G.character()?.dungeon ? 'dungeon' : U.weather() : 'clear';
    if (mode !== weather) {
      mode = weather;
      particles = Array.from({length:width < 700 ? weather === 'rain' ? 38 : 24 : weather === 'rain' ? 90 : 60}, () => seed());
      canvas.dataset.weather = weather;
    }
    ctx.clearRect(0, 0, width, height);
    for (const p of particles) {
      if (weather === 'rain') {
        p.x -= dt * 90 * p.speed; p.y += dt * 620 * p.speed;
        ctx.strokeStyle = 'rgba(190,216,233,.20)'; ctx.lineWidth = .7;
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - 3, p.y + 15 * p.speed); ctx.stroke();
      } else if (weather === 'wind') {
        const gust = 1 + .4 * Math.sin(time / 2400);
        p.x += dt * 225 * p.speed * gust; p.y += dt * Math.sin(time / 1800 + p.phase) * 23;
        ctx.strokeStyle = 'rgba(231,222,190,.24)'; ctx.lineWidth = p.size * .5;
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.quadraticCurveTo(p.x + 40, p.y - 9, p.x + 78 * p.speed, p.y - 2); ctx.stroke();
        ctx.fillStyle = 'rgba(235,207,156,.32)';
        ctx.fillRect(p.x - 8, p.y + 5, p.size, p.size * .6);
      } else {
        p.x += dt * (6 + Math.sin(time / 3500 + p.phase) * 5); p.y -= dt * 7 * p.speed;
        const alpha = .23 + .10 * Math.sin(time / 2800 + p.phase);
        ctx.fillStyle = 'rgba(239,218,166,' + alpha + ')';
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
      }
      if (p.x > width + 45) p.x = -45;
      if (p.x < -45) p.x = width + 45;
      if (p.y > height + 30) { p.y = -30; p.x = Math.random() * width; }
      if (p.y < -40 && weather !== 'rain') p.y = height + 20;
    }
  };
  requestAnimationFrame(frame);
})(RPG, RPG.ui);
