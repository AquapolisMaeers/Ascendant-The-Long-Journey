'use strict';
(function(G) {
  const reduced = () => G.state.settings.reduced || matchMedia('(prefers-reduced-motion: reduce)').matches;
  let pending = null;
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
    // Rewards keep their text and art without a panel-wide flash.
    if (effect.socket) G.notify('A new gem socket has opened.', 'success');
  }
  window.addEventListener('rpg:strike', ({
    detail: e
  }) => {
    if (reduced()) return;
    const attacker = document.getElementById(e.side + '-fighter'),
      defender = document.getElementById((e.side === 'player' ? 'enemy' : 'player') + '-fighter');
    if (attacker && !e.food && !e.recovery) attacker.animate([{
      transform: 'translateX(0)'
    }, {
      transform: 'translateX(' + (e.side === 'player' ? 6 : -6) + 'px)'
    }, {
      transform: 'translateX(0)'
    }], {
      duration: e.extra ? 130 : 230
    });
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
})(RPG);
