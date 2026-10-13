'use strict';
(function(G) {
  const reduced = () => G.state.settings.reduced || matchMedia('(prefers-reduced-motion: reduce)').matches;
  let pending = null,
    previousCoins = null,
    previousId = null;
  window.addEventListener('rpg:effect', ({
    detail
  }) => {
    pending = detail;
    setTimeout(apply, 30);
  });

  function apply() {
    if (!pending || reduced()) {
      pending = null;
      return;
    }
    const effect = pending;
    pending = null;
    const target = document.querySelector('.modal') || document.querySelector('.encounter');
    if (!target) return;
    const colors = {
      enhance: '#c5a465',
      ascend: '#cbb5df',
      socket: '#9bd1cb',
      failure: '#b95448',
      victory: '#92b49d',
      death: '#a33138',
      fusion: '#b8b0d8',
      boss: '#aa4746',
      room: '#899590'
    };
    const color = colors[effect.kind] || colors.enhance;
    target.animate([{
      boxShadow: 'inset 0 0 0 ' + color + '00'
    }, {
      boxShadow: 'inset 0 0 45px ' + color + '50'
    }, {
      boxShadow: 'inset 0 0 0 ' + color + '00'
    }], {
      duration: 650,
      easing: 'ease-out'
    });
    if (effect.socket) G.notify('A new gem socket has opened.', 'success');
  }
  window.addEventListener('rpg:strike', ({
    detail: e
  }) => {
    if (reduced()) return;
    const attacker = document.getElementById(e.side + '-fighter'),
      defender = document.getElementById((e.side === 'player' ? 'enemy' : 'player') + '-fighter');
    if (attacker && !e.food) attacker.animate([{
      transform: 'translateX(0)'
    }, {
      transform: 'translateX(' + (e.side === 'player' ? 6 : -6) + 'px)'
    }, {
      transform: 'translateX(0)'
    }], {
      duration: e.extra ? 130 : 230
    });
    if (defender && !e.miss && !e.food) defender.animate([{
      filter: 'brightness(1)'
    }, {
      filter: 'brightness(1.8)'
    }, {
      filter: 'brightness(1)'
    }], {
      duration: 210
    });
    if (e.healing > 0 && !e.food && G.state.settings.damage) {
      const el = document.createElement('span');
      el.className = 'damage-float ' + e.side + ' heal';
      el.style.top = '53%';
      el.textContent = '+' + G.number(e.healing, 1);
      document.getElementById('floating').append(el);
      setTimeout(() => el.remove(), 1100);
    }
    if (e.mitigated && defender) {
      defender.classList.add('mitigated');
      setTimeout(() => defender.classList.remove('mitigated'), 300);
    }
  });
  window.addEventListener('rpg:loot', ({
    detail
  }) => {
    const rarity = Math.max(-1, ...detail.rewards.filter(r => r.kind === 'gear' || r.kind === 'tool').map(r => r.rarity));
    const el = document.getElementById('loot-popup');
    el.className = 'loot-popup' + (rarity >= 0 ? ' rarity-' + rarity : '') + (rarity >= 2 ? ' rare-reveal' : '');
    if (rarity >= 4) G.audio.play('rare');
  });
  window.addEventListener('rpg:prestige', ({
    detail
  }) => {
    const el = document.createElement('div');
    el.className = 'prestige-banner';
    el.innerHTML = '<div class="eyebrow">A TITLE EARNED</div><strong>' + G.escape(detail.title) + '</strong>';
    document.body.append(el);
    setTimeout(() => el.remove(), 4500);
  });
  window.addEventListener('rpg:rendered', () => {
    const c = G.character();
    if (!c) return;
    const current = c.coins,
      from = previousId === c.id ? (previousCoins ?? current) : current;
    previousCoins = current;
    previousId = c.id;
    if (from === current || reduced()) return;
    const start = performance.now();
    const step = now => {
      const p = Math.min(1, (now - start) / 350),
        n = Math.round(from + (current - from) * (1 - Math.pow(1 - p, 3)));
      for (const [cls, v] of [
          ['g', Math.floor(n / 10000)],
          ['s', Math.floor(n % 10000 / 100)],
          ['b', n % 100]
        ]) {
        const el = document.querySelector('.currency-' + cls);
        if (el) el.innerHTML = '<i class="coin"></i>' + v;
      }
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
})(RPG);
