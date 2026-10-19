'use strict';
(function(G, D, S) {
  S.crafting = {
    xp(recipe, c = G.character()) {
      return recipe.skill === 'Faceting' ? D.config.skillXp * D.config.facetingXp * Math.max(recipe.level, c.skills.Faceting.level) : recipe.xp;
    },
    chance(recipe, c = G.character()) {
      if (recipe.skill !== 'Faceting' || recipe.rank === 0) return 1;
      return Math.min(1, D.facet.chance[recipe.rank] + Math.max(0, c.tools.Faceting.rarity - D.facet.chisel[recipe.rank]) * D.facet.extraRarity + (c.facetFails[recipe.rank] || 0));
    },
    max(recipe) {
      return Math.min(...Object.entries(recipe.cost).map(([k, n]) => Math.floor(S.inventory.available(k) / n)));
    },
    hasRoom(r, c = G.character()) {
      // Reserve possible bonuses, counting only ingredient slots certain to be freed.
      const yieldMax = 1 + (S.items.toolBonus(c, r.skill, 'Yield') > 0 ? 1 : 0);
      let slots = r.piece !== undefined ? yieldMax : c.inventory.some(i => i.kind === 'stack' && i.key === r.output) ? 0 : 1;
      if (r.skill !== 'Faceting' && r.piece === undefined && r.tier < 11 && S.items.toolBonus(c, r.skill, 'Fortune') > 0 &&
          !c.inventory.some(i => i.kind === 'stack' && i.key === r.output.split(':')[0] + ':' + (r.tier + 1))) slots++;
      const freed = S.items.toolBonus(c, r.skill, 'Conservation') > 0 ? 0 : Object.entries(r.cost).filter(([key, n]) =>
        c.inventory.some(i => i.kind === 'stack' && !i.locked && i.key === key && i.quantity === (r.skill === 'Faceting' && r.rank > 0 ? 1 : n))).length;
      return !c.pending.length && c.inventory.length - freed + slots <= c.capacity;
    },
    start(id, quantity) {
      G.ensureProgress();
      const c = G.character(),
        r = D.recipes.find(r => r.id === id);
      G.assert(r, 'Unknown recipe.');
      S.tutorial?.guard('craft', id);
      G.assert(!c.dungeon, 'Leave the dungeon before crafting.');
      G.assert(c.skills[r.skill].level >= r.level, 'Requires ' + r.skill + ' level ' + r.level + '.');
      G.assert(S.items.usableTool(c, r.skill), 'Your skill level cannot use the current tool.');
      if (r.skill === 'Faceting') G.assert(c.tools.Faceting.rarity >= D.facet.chisel[r.rank], 'Requires at least a ' + D.rarity[D.facet.chisel[r.rank]] + ' Chisel.');
      quantity = quantity === 'max' ? this.max(r) : Number(quantity);
      G.assert(Number.isInteger(quantity) && quantity > 0 && quantity <= 1000000, 'Choose a valid quantity.');
      G.assert(S.inventory.has(r.cost), 'Missing unlocked ingredients.');
      c.activity = {
        type: 'craft',
        recipe: id,
        remaining: quantity,
        total: quantity,
        elapsed: 0,
        duration: D.config.actionMs / (1 + S.items.toolBonus(c, r.skill, 'Efficiency')),
        rewards: []
      };
      G.commit();
    },
    complete() {
      const c = G.character(),
        a = c.activity,
        r = D.recipes.find(r => r.id === a.recipe);
      if (!this.hasRoom(r, c)) {
        c.activity = null;
        S.loot.present(a.rewards || [], 'Crafting stopped: inventory full');
        G.notify('Crafting stopped: make room in your bag. Unstarted crafts used no ingredients.', 'warning');
        G.commit();
        return;
      }
      if (!S.inventory.has(r.cost)) {
        c.activity = null;
        G.notify('Crafting stopped: missing unlocked ingredients.', 'warning');
        G.commit();
        return;
      }
      G.audio?.play(r.skill.toLowerCase());
      const success = G.rng() < this.chance(r),
        conservation = S.items.toolBonus(c, r.skill, 'Conservation');
      const cost = {};
      if (r.skill === 'Faceting' && r.rank > 0 && !success) {
        cost[Object.keys(r.cost)[0]] = 1;
        c.facetFails[r.rank] = Math.min(1, (c.facetFails[r.rank] || 0) + D.config.failIncrement);
      } else
        for (const [key, n] of Object.entries(r.cost)) {
          let used = 0;
          for (let i = 0; i < n; i++)
            if (G.rng() >= conservation) used++;
          if (used) cost[key] = used;
        }
      S.inventory.pay(cost);
      const rewards = [];
      if (success) {
        const yieldCount = 1 + (G.rng() < S.items.toolBonus(c, r.skill, 'Yield') ? 1 : 0);
        if (r.piece !== undefined)
          for (let i = 0; i < yieldCount; i++) rewards.push(S.items.create(r.tier, r.piece, 0, null, r.armorClass));
        else rewards.push({
          key: r.output,
          quantity: yieldCount
        });
        if (r.skill !== 'Faceting' && r.piece === undefined && r.tier < 11 && G.rng() < S.items.toolBonus(c, r.skill, 'Fortune')) rewards.push({
          key: r.output.split(':')[0] + ':' + (r.tier + 1),
          quantity: 1
        });
        if (r.skill === 'Faceting') {
          G.emit('effect', {
            kind: 'fusion',
            rank: r.rank + 1
          });
          c.facetFails[r.rank] = 0;
          c.stats.gemCreated = [...new Set([...c.stats.gemCreated, r.rank + 1])];
        }
        if (r.id.startsWith('bar:')) c.stats.bars += yieldCount;
        if (r.category==='Secondaries') c.stats.secondaries=(c.stats.secondaries||0)+yieldCount;
        if (['cloth','leather'].includes(r.output?.split(':')[0])) c.stats.textiles=(c.stats.textiles||0)+yieldCount;
        if (r.skill === 'Cooking') c.stats.cooked += yieldCount;
        S.inventory.reward(rewards);
        S.quests.crafted(r,rewards,c);
        S.guilds.progress(c,'craft');
        G.runtime.recent = rewards;
      } else G.notify('Fusion failed. Exactly one gem broke; the other two remain. +1 percentage point fail protection.', 'warning');
      if (r.skill === 'Faceting') c.stats.facets++;
      S.companions.gain(c, D.companionRules.actionXp);
      S.xp.add(c.skills[r.skill], this.xp(r, c) * (1 + S.items.toolBonus(c, r.skill, 'Knowledge')));
      a.rewards = S.loot.merge(a.rewards || [], rewards);
      const lesson = S.tutorial?.current()?.id;
      S.tutorial?.crafted(r, success, rewards);
      if (lesson && lesson !== S.tutorial?.current()?.id) a.remaining = 1;
      a.remaining--;
      const full = a.remaining > 0 && !this.hasRoom(r, c);
      if (a.remaining <= 0 || full) {
        c.activity = null;
        S.loot.present(a.rewards, full ? 'Crafting stopped: inventory full' : 'Crafting complete');
        if (full) G.notify('Crafting stopped: make room in your bag. Unstarted crafts used no ingredients.', 'warning');
      }
      G.commit();
    }
  };
})(RPG, RPG.data, RPG.systems);
