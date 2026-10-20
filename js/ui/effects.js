'use strict';
(function(G) {
  G.ui.combatEffectsVisible=()=>G.runtime.page==='World'&&!G.runtime.selecting&&!document.hidden&&!document.querySelector('.modal')&&!!document.getElementById('player-fighter')&&!!document.getElementById('enemy-fighter');
  const clearCombatFloats=()=>{if(!G.ui.combatEffectsVisible()||!G.state.settings.damage)document.getElementById('floating').replaceChildren();};
  window.addEventListener('rpg:rendered',clearCombatFloats);
  window.addEventListener('rpg:dialog-opened',clearCombatFloats);
  document.addEventListener('visibilitychange',clearCombatFloats);
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
    if (reduced()||!G.ui.combatEffectsVisible()) return;
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
    const rarity = Math.max(-1, ...detail.rewards.map(r => r.kind === 'gear' || r.kind === 'tool' ? r.rarity : r.key === 'stone' ? 7 : -1));
    const el = document.getElementById('loot-popup');
    el.className = 'loot-popup' + (rarity >= 0 ? ' rarity-' + rarity : '') + (rarity >= 2 ? ' rare-reveal' : '');
    if (rarity >= 4) G.audio.play('rare');
  });
  let prestige = null, prestigeTimer = 0;
  const prestigeQueue = [];
  const showPrestige = () => {
    const id = G.character()?.id;
    while (prestigeQueue.length && prestigeQueue[0].characterId !== id) prestigeQueue.shift();
    if (prestige || !prestigeQueue.length || document.hidden || G.runtime.selecting || document.querySelector('.modal')) return;
    prestige = prestigeQueue.shift();
    const el = document.createElement('div');
    el.className = 'prestige-banner';
    el.innerHTML = '<div class="eyebrow">A TITLE EARNED</div><strong>' + G.escape(prestige.title) + '</strong>';
    document.body.append(el);
    prestigeTimer = setTimeout(() => { el.remove(); prestige = null; showPrestige(); }, 4500);
  };
  const pausePrestige = () => {
    if (!prestige) return;
    clearTimeout(prestigeTimer);
    document.querySelector('.prestige-banner')?.remove();
    prestigeQueue.unshift(prestige); prestige = null;
  };
  window.addEventListener('rpg:prestige', ({detail}) => {
    prestigeQueue.push({...detail, characterId:G.character()?.id});
    showPrestige();
  });
  window.addEventListener('rpg:dialog-opened', pausePrestige);
  window.addEventListener('rpg:dialog-closed', () => setTimeout(showPrestige, 0));
  document.addEventListener('visibilitychange', () => document.hidden ? pausePrestige() : showPrestige());
  window.addEventListener('rpg:rendered', () => {
    if (prestige && (prestige.characterId !== G.character()?.id || G.runtime.selecting)) pausePrestige();
    showPrestige();
  });
})(RPG);
