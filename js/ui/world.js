'use strict';
(function(G, D, S, U) {
  U.journeyPanel = () => {
    const c = G.character();
    return '<section class="panel journey-panel"><div class="panel-head"><h3>The journey so far</h3>' + U.icon('Achievements') + '</div><div class="journey-stats">' + [
      ['Advances', G.number(c.stats.advance)],
      ['Creatures defeated', G.number(c.stats.regular + c.stats.elite + c.stats.boss)],
      ['Elite creatures defeated', G.number(c.stats.elite)],
      ['Quests completed', G.number(c.questCompletions ?? 0)],
      ['Dungeons conquered', G.number(c.stats.dungeons)],
      ['Deaths', G.number(c.stats.deaths)],
      ['Inventory', c.inventory.length + ' / ' + c.capacity],
      ['Selected title', c.title || 'No title']
    ].map(([k, v]) => '<div class="meta-row"><span>' + k + '</span><strong>' + U.e(v) + '</strong></div>').join('') + '</div><details class="recent-discoveries"><summary>Recent discoveries</summary><div class="notes spacer">' + (G.runtime.recent.length ? G.runtime.recent.map(r => '<p>' + U.rewardText(r) + '</p>').join('') : 'Your story is still unwritten.') + '</div></details></section>';
  };
  U.screens.World = () => {
    const c = G.character(), loc = D.locations[c.location], penalty = S.combat.deathPenalty(c);
    return '<div class="world-screen' + (c.combat ? ' combat-view' : '') + '">' + U.heading('CHAPTER ' + String(c.location + 1).padStart(2, '0'), 'The world awaits.', 'Choose your next encounter.', U.btn(U.icon('World') + ' Change location', 'locations', S.tutorial.active() ? 'disabled' : '')) + '<div class="world-grid"><div class="world-main">' + U.encounter() + (c.encounter?.enemy && !c.combat ? U.preview(c.encounter.enemy) : '') + '<section class="location-scene" style="filter:hue-rotate(' + (c.location * 7) + 'deg)"><div class="ambient-particles" aria-hidden="true"><i></i><i></i><i></i></div><div class="scene-top"><div><div class="eyebrow">CURRENT LOCATION</div><h2 class="scene-title">' + loc.name + '</h2><div class="scene-coords">THE REALM / ' + String(c.location + 1).padStart(2, '0') + '</div></div><span class="badge">LV ' + loc.level + (loc.max !== loc.level ? '&ndash;' + loc.max : '') + '</span></div><p class="scene-caption">' + loc.description + '</p></section><p class="notes death-risk">' + (c.mode === 'Hardcore' ? 'Defeat permanently deletes this Hardcore character.' : 'On defeat here: lose ' + penalty.items + ' random inventory item' + (penalty.items === 1 ? '' : 's') + ' and ' + penalty.percent + '% of coins (rounded up). Equipped items stay protected.') + '</p></div><aside class="world-side">' + U.foodPanel() + '</aside></div></div>';
  };
  U.rewardText = r => r.coins ? G.money(r.coins) : r.kind === 'gear' ? '<span class="rarity-' + r.rarity + ' rarity-text">' + D.rarity[r.rarity] + ' ' + U.e(S.items.name(r)) + '</span>' : U.e(D.catalog[r.key]?.name || r.key) + ' ×' + (r.quantity || 1);
  U.foodPanel = () => {
    const c = G.character(),
      foods = c.inventory.filter(i => i.kind === 'stack' && D.catalog[i.key].category === 'Food');
    return '<section class="panel food-panel"><div class="panel-head"><h3>Provisions</h3>' + U.icon('food') + '</div><label>Assigned food<select id="food-select" ' + (c.combat ? 'disabled' : '') + '><option value="">No food assigned</option>' + foods.map(i => '<option value="' + i.key + '" ' + (c.food === i.key ? 'selected' : '') + '>' + U.e(D.catalog[i.key].name) + ' · ' + i.quantity + '</option>').join('') + '</select></label><label>Auto-Eat threshold<select id="eat-select" ' + (c.combat ? 'disabled' : '') + '>' + [0, .25, .5, .75].map(n => '<option value="' + n + '" ' + (c.eat === n ? 'selected' : '') + ' ' + (!c.eatUnlocks.includes(n) ? 'disabled' : '') + '>' + (n === 0 ? 'Off' : G.percent(n, 0) + ' HP') + (!c.eatUnlocks.includes(n) ? ' · Shop unlock' : '') + '</option>').join('') + '</select></label><div class="meta-row"><span>Food remaining</span><strong id="food-count">' + (c.food ? S.inventory.count(c.food) : 0) + '</strong></div><div class="meta-row"><span>Shared cooldown</span><strong id="food-cooldown">Ready</strong></div>' + '<div class="provision-actions">' + U.btn('Eat food', 'eat', 'id="eat-button"', 'wide') + (!c.combat?(c.batchEatUnlocks||[]).map(n=>U.btn('Eat '+n,'eat','data-quantity="'+n+'"','quiet small')).join(''):'') + (!c.eatUnlocks.includes(.25) ? U.btn('Shop Auto-Eat', 'provisionsShop', '', 'quiet small') : '') + '</div><details class="provision-help"><summary>Food timing</summary>' + (!c.eatUnlocks.includes(.25) ? '<p class="notes">Auto-Eat 25%: level 10 / 25 Silver.</p>' : '') + '<p class="notes">Eat every 0.5s outside combat; Manual and Auto-Eat share a 10s cooldown in combat.</p></details></section>';
  };
  U.encounter = () => {
    const c = G.character(),
      e = c.encounter,
      a = c.activity;
    let out = '';
    if (c.dungeon) {
      const d = D.dungeons[c.dungeon.id];
      out = '<section class="panel"><div class="row between"><h3>' + d.name + '</h3>' + U.btn('Leave dungeon', 'leaveDungeon', c.combat ? 'disabled' : '', 'small danger') + '</div><div class="room-track">' + ['Creature', 'Creature', 'Sanctuary', 'Elite', 'Boss'].map((n, i) => '<div class="room-step ' + (c.dungeon.room === i + 1 ? 'current' : c.dungeon.room > i + 1 ? 'done' : '') + '">' + (i + 1) + ' · ' + n + '</div>').join('') + '</div><small class="muted">Continuous run · no checkpoints' + (c.dungeon.interrupted ? ' · interrupted run ends after this fight' : '') + '</small></section>';
    }
    if (c.combat) return out + U.fight(c.combat);
    if (a?.type === 'advance') return out + '<section class="panel encounter inline-advance"><div class="encounter-idle"><h2>Following the old road\u2026</h2><p>One encounter waits beyond the mist.</p><div class="travel-track"><i id="activity-bar" style="width:' + G.clamp(a.elapsed/a.duration*100,0,100) + '%"></i></div><small id="activity-time">' + ((a.duration-a.elapsed)/1000).toFixed(1) + ' seconds</small><strong id="activity-percent">' + Math.floor(a.elapsed/a.duration*100) + '%</strong></div></section>';
    if (a) return out;
    if (c.dungeon?.cleared) return out + '<section class="panel encounter"><div class="encounter-idle">' + U.icon('dungeon') + '<h2>Room cleared</h2><p>Prepare your equipment and provisions before continuing.</p>' + U.btn('Enter next room ' + U.icon('arrow'), 'nextRoom', '', 'primary advance-btn') + '</div></section>';
    if (!e) return out + '<section class="panel encounter"><div class="encounter-idle">' + U.icon('World') + '<div class="eyebrow">BEYOND THE LANTERN LIGHT</div><h2 class="spacer">Take the next step.</h2><p>Travel deeper into ' + D.locations[c.location].name + '. Discover creatures, resources, and the unexpected.</p>' + U.btn('ADVANCE ' + U.icon('arrow'), 'advance', c.pending.length || (S.tutorial.active() && ![...D.gatheringSkills, 'fight'].includes(S.tutorial.current().id)) ? 'disabled' : '', 'primary advance-btn') + '<div class="footer-note">4 SECOND JOURNEY &nbsp; · &nbsp; ONE DISCOVERY</div></div></section>';
    const fight = !!e.enemy,
      gather = D.gatheringSkills.includes(e.type),
      loc = D.locations[c.location],
      title = fight ? e.enemy.name : gather ? D.catalog[(e.resource || D.gatherResources[e.type]) + ':' + e.tier].name : e.type === 'dungeon' ? D.dungeons[loc.dungeon].name : e.type === 'fountain' ? 'Fountain of Youth' : 'The Spoils Chamber';
    const desc = fight ? 'Level ' + e.enemy.level + ' · ' + e.enemy.archetype : gather ? e.type + ' level ' + D.tiers[e.tier] + ' · 5 charges · 4 seconds per action' : e.type === 'dungeon' ? 'Five rooms. One formidable foe. Enter when you are prepared.' : e.type === 'fountain' ? 'Its ancient waters restore your health completely.' : 'A forgotten chest holds one creature loot roll.';
    const action = fight ? 'fight' : gather ? 'gather' : e.type === 'dungeon' ? 'enterDungeon' : 'roomEvent';
    return out + '<section class="panel encounter ' + e.type + '"><div class="encounter-content"><div class="encounter-emblem">' + U.icon(fight ? 'creature' : gather ? e.type : e.type === 'fountain' ? 'fountain' : 'dungeon') + '</div><div><span class="badge ' + (e.type === 'elite' || e.type === 'boss' ? 'elite' : '') + '">' + (e.type === 'regular' ? 'CREATURE' : e.type) + '</span><h2 class="encounter-title">' + title + '</h2><p class="notes">' + desc + '</p><div class="encounter-actions">' + U.btn(fight ? 'Fight' : gather ? ({
      Mining: 'Mine',
      Woodcutting: e.resource==='fiber'?'Forage':'Chop',
      Fishing: 'Fish',
      Hunting: 'Hunt',
      Farming: 'Harvest'
    } [e.type]) : e.type === 'dungeon' ? 'Enter dungeon' : 'Interact', action, c.pending.length ? 'disabled' : '', 'primary') + (!c.dungeon ? U.btn('Move on', 'moveOn', '', 'quiet') : '') + '</div></div></div></section>';
  };
  U.preview = enemy => {
    const c = G.character(),
      p = S.character.stats(c);
    p.hp = c.hp;
    const key = JSON.stringify([p, enemy, c.food, c.eat, S.inventory.count(c.food), Math.max(0, Math.ceil((c.foodReady - Date.now()) / 1000))]);
    if (G.runtime.estimate?.key !== key) G.runtime.estimate = {
      key,
      ...S.kernel.simulate(c, enemy)
    };
    const sim = G.runtime.estimate,
      odds = sim.chance < .01 ? '&lt;1%' : sim.chance > .99 ? '&gt;99%' : G.percent(sim.chance, 0);
    const row = (name, a, b, hint = '') => '<tr><td title="' + U.e(hint) + '">' + name + '</td><td>' + a + '</td><td>' + b + '</td></tr>';
    const levelNotice=S.kernel.levelFactor(p,enemy)<1?'<p class="notes warning">Level disadvantage: this enemy takes less damage from you and hits harder. Opponents within three levels avoid this penalty.</p>':'';
    return '<details class="panel preview" open><summary><h3>Before you draw your weapon</h3></summary><div class="odds"><strong>' + odds + '</strong><div>Estimated Victory Chance<small>Estimated — RNG can change the outcome.</small><small>' + sim.count.toLocaleString() + ' simulated fights · current HP, perks, food and cooldown included</small></div></div>'+levelNotice+'<details><summary>Detailed Combat Breakdown</summary><table class="data-table"><thead><tr><th>Combat stat</th><th>You</th><th>' + U.e(enemy.name) + '</th></tr></thead><tbody>' + row('Health', G.number(c.hp, 1) + ' / ' + G.number(p.health, 1), G.number(enemy.health, 1)) + ['damage', 'defence'].map(k => row(D.labels[k], U.statValue(k, p[k]), U.statValue(k, enemy[k]))).join('') +
      row('Defence mitigation', G.percent(S.kernel.mitigation(enemy, p)), G.percent(S.kernel.mitigation(p, enemy)), 'Defence × (1 − penetration) / (effective defence + 3 × attacker level); 70% cap') +
      row('Hit chance', G.percent(S.kernel.hit(p, enemy)), G.percent(S.kernel.hit(enemy, p)), '100% + 0.5 percentage points × level difference − dodge; clamped 50–100%') +
      row('Level damage multiplier', '×'+G.number(S.kernel.levelFactor(p,enemy),2), '×'+G.number(S.kernel.levelFactor(enemy,p),2), 'Three levels of grace; larger level differences reduce the weaker actor’s damage and boost the stronger actor. Effective levels cap at 100.') +
      row('Miss chance', G.percent(1 - S.kernel.hit(p, enemy)), G.percent(1 - S.kernel.hit(enemy, p))) +
      row('Effective Crit', G.percent(S.kernel.crit(p, enemy)), G.percent(S.kernel.crit(enemy, p)), 'Crit chance − defender Critical Resistance; cap 75%') +
      row('Attack interval', G.number(p.interval, 2) + 's', G.number(enemy.interval, 2) + 's', '2 / (1 + Attack Speed Bonus)') +
      row('Attacks / second', G.number(1 / p.interval, 2), G.number(1 / enemy.interval, 2)) + ['crit', 'critDamage', 'penetration', 'dodge', 'reduction', 'resistance', 'lifeSteal', 'double', 'speed'].map(k => row(D.labels[k], G.percent(p[k]), G.percent(enemy[k]))).join('') +
      row('Expected damage / turn', G.number(S.kernel.average(p, enemy), 2), G.number(S.kernel.average(enemy, p), 2)) +
      row('Estimated DPS', G.number(S.kernel.average(p, enemy) / p.interval, 2), G.number(S.kernel.average(enemy, p) / enemy.interval, 2)) +
      row('Assigned food', c.food ? U.e(D.catalog[c.food].name) : 'None', 'None') + row('Auto-Eat', c.eat ? G.percent(c.eat) + ' HP' : 'Off', 'Off') + '</tbody></table><p class="notes spacer">Enemy traits: ' + enemy.archetype + '. Average simulated duration ' + G.number(sim.seconds, 1) + 's; food used ' + G.number(sim.foods, 2) + '. Conditional perks and class talents are resolved by the simulation.</p></details></details>';
  };
  U.fight = f => '<section class="panel encounter ' + f.enemy.type + '"><div class="panel-head"><span class="eyebrow">COMBAT IN PROGRESS</span><span class="badge" id="fight-time">0.0s</span></div><div class="fight-row"><div class="fighter" id="player-fighter">' + U.characterPortrait(G.character().class, G.character().appearance) + '<h3>' + U.e(G.character().name) + '</h3>' + U.bar(f.player.hp, f.player.health, 'hp', 'player-hp') + '<div id="player-health" class="fight-meta">' + G.number(f.player.hp, 1) + ' / ' + G.number(f.player.health, 1) + '</div>' + U.bar(0, 1, 'thin', 'player-timer') + '</div><div class="versus">vs</div><div class="fighter" id="enemy-fighter">' + U.icon('creature') + '<h3>' + U.e(f.enemy.name) + '</h3>' + U.bar(f.enemy.hp, f.enemy.health, 'hp', 'enemy-hp') + '<div id="enemy-health" class="fight-meta">' + G.number(f.enemy.hp, 1) + ' / ' + G.number(f.enemy.health, 1) + '</div>' + U.bar(0, 1, 'thin', 'enemy-timer') + '</div></div><div class="meta-row"><span>Damage per second</span><strong id="fight-dps">0.0</strong></div>' + (G.state.settings.combatLog ? '<div class="combat-log" id="combat-log"></div>' : '') + '<p class="footer-note">Combat resolves automatically. Closing the game preserves this committed fight.</p></section>';
  U.live = () => {
    const c = G.character();
    if (!c) return;
    const set = (id, text) => {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
      },
      width = (id, n) => {
        const el = document.getElementById(id);
        if (el) { el.style.width = G.clamp(n * 100, 0, 100) + '%'; if (el.parentElement.classList.contains('hp')) el.style.background = U.healthColor(n); }
      };
    if (c.activity) {
      width('activity-bar', c.activity.elapsed / c.activity.duration);
      set('activity-time', ((c.activity.duration - c.activity.elapsed) / 1000).toFixed(1) + ' seconds');
      set('activity-percent', Math.floor(G.clamp(c.activity.elapsed/c.activity.duration,0,1)*100) + '%');
    }
    const f = c.combat;
    if (f) {
      for (const who of ['player', 'enemy']) {
        width(who + '-hp', f[who].hp / f[who].health);
        set(who + '-health', G.number(f[who].hp, 1) + ' / ' + G.number(f[who].health, 1));
        width(who + '-timer', 1 - ((who === 'player' ? f.nextPlayer : f.nextEnemy) - f.time) / f[who].interval);
      }
      set('fight-time', f.time.toFixed(1) + 's');
      set('fight-dps', G.number((c.stats.damage - (G.runtime.fightStartDamage || 0)) / Math.max(1, f.time), 1));
      const log = document.getElementById('combat-log');
      if (log) log.innerHTML = G.runtime.log.map(t => '<p>' + U.e(t) + '</p>').join('');
    }
    const max = c.combat?.player.health || S.character.stats(c).health;
    set('top-hp-label', G.number(c.hp, 1) + ' / ' + G.number(max, 1));
    width('top-hp', c.hp / max);
    set('food-count', c.food ? S.inventory.available(c.food) : 0);
    const cooldown = S.combat.foodCooldown(c);
    set('food-cooldown', cooldown ? cooldown.toFixed(1) + 's' : 'Ready');
    const eat = document.getElementById('eat-button');
    if (eat) eat.disabled = !c.food || !S.inventory.available(c.food) || cooldown > 0 || c.hp >= max;
    document.querySelectorAll('[data-action="eat"][data-quantity]').forEach(button=>{button.disabled=!!c.combat||!c.food||!S.inventory.available(c.food)||cooldown>0||c.hp>=max;});
    document.querySelector('.shell')?.classList.toggle('low-hp', c.hp / max < .25);
  };
})(RPG, RPG.data, RPG.systems, RPG.ui);
