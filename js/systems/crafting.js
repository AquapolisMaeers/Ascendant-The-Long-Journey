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
          for (let i = 0; i < yieldCount; i++) rewards.push(S.items.create(r.tier, r.piece));
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
        if (r.skill === 'Cooking') c.stats.cooked += yieldCount;
        S.inventory.reward(rewards);
        G.runtime.recent = rewards;
      } else G.notify('Fusion failed. Exactly one gem broke; the other two remain. +1 percentage point fail protection.', 'warning');
      if (r.skill === 'Faceting') c.stats.facets++;
      S.xp.add(c.skills[r.skill], this.xp(r, c) * (1 + S.items.toolBonus(c, r.skill, 'Knowledge')));
      a.rewards = S.loot.merge(a.rewards || [], rewards);
      S.tutorial?.crafted(r, success, rewards);
      a.remaining--;
      if (a.remaining <= 0) {
        c.activity = null;
        S.loot.present(a.rewards, 'Crafting complete');
      }
      G.commit();
    }
  };
})(RPG, RPG.data, RPG.systems);
