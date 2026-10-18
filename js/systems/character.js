'use strict';
(function(G, D, S) {
  S.character = {
    resetPerks() {
      G.ensureIdle(); const c=G.character();
      G.assert(!c.dungeon,'Leave the dungeon before resetting perks.');
      G.assert(!S.tutorial.active(),'Finish the tutorial before resetting perks.');
      G.assert(Object.keys(c.perks).length>0,'No selected perks to reset.');
      S.inventory.take('perk-reset',1,c);
      c.perks={}; c.hp=Math.min(c.hp,this.stats(c).health);
      G.runtime.estimate=null; G.commit();
    },
    customize(value) {
      const c = G.character();
      G.assert(c, 'Choose a character.');
      const appearance = {portrait:D.appearanceKind(c.class), look:value.look, color:value.color,...(value.outfit?{outfit:value.outfit}:{})};
      G.assert(value.outfit===undefined || c.regalia?.outfit===value.outfit&&c.regalia.owned.includes(value.outfit)&&D.regalia.some(r=>r.id===value.outfit&&r.kind==='outfit'),'Equip an owned outfit to select its portrait.');
      G.assert(Number.isInteger(value.look) && D.validAppearance(appearance), 'Choose a valid class portrait and accent colour.');
      c.appearance = appearance;
      G.commit();
    },
    stats(c) {
      const s = {
        level: c.level,
        damage: c.level,
        health: D.config.playerHealth + D.config.playerHealthPerLevel * (c.level - 1),
        defence: 0,
        crit: D.config.baseCrit,
        critDamage: D.config.baseCritDamage,
        speed: 0,
        penetration: 0,
        double: 0,
        dodge: 0,
        reduction: 0,
        resistance: 0,
        lifeSteal: 0,
        damagePct: 0,
        healthPct: 0,
        defencePct: 0
      };
      const add = (key, val) => s[key] = typeof val === 'boolean' ? val : (s[key] || 0) + val;
      for (const item of Object.values(c.equipment).filter(Boolean)) {
        Object.entries(S.items.stats(item)).forEach(([k, v]) => add(k, v));
        Object.entries(item.prefixes).forEach(([k, v]) => add(k, v));
        item.gems.filter(Boolean).forEach(id => {
          const gem = D.catalog[id],
            def = D.gems[gem.type];
          if (def.style === undefined || def.style === D.classes.indexOf(c.class)) add(def.stat, def.value * gem.rank);
        });
      }
      for (const [level, choice] of Object.entries(c.perks)) {
        const index = D.perkLevels.indexOf(+level);
        Object.entries(D.perkEffects[index][choice]).forEach(([k, v]) => add(k, v));
      }
      Object.entries(S.talents?.effects(c) || {}).forEach(([key, value]) => add(key, value));
      Object.entries(S.companions?.bonus(c) || {}).forEach(([key, value]) => add(key, value));
      Object.entries(S.emporium?.bonus(c) || {}).forEach(([key, value]) => add(key, value));
      for (const stat of ['damage', 'defence', 'health']) s[stat] *= 1 + s[stat + 'Pct'];
      s.raw = {
        ...s
      };
      for (const [key, cap] of Object.entries(D.caps))
        if (s[key] !== undefined) s[key] = G.clamp(s[key], 0, cap);
      s.interval = D.config.attackSeconds / (1 + s.speed);
      return s;
    },
    choose(level, choice) {
      G.ensureIdle();
      const c = G.character();
      G.assert(D.perkLevels.includes(level) && c.level >= level, 'Perk milestone is locked.');
      G.assert(c.perks[level] === undefined, 'This milestone already has a selected perk.');
      G.assert([0, 1, 2].includes(choice), 'Invalid perk.');
      const previousHealth=this.stats(c).health;
      c.perks[level] = choice;
      const health=this.stats(c).health;
      c.hp=Math.min(health,c.hp+Math.max(0,health-previousHealth));
      S.tutorial?.perkChosen();
      G.runtime.estimate = null;
      G.commit();
    }
  };
})(RPG, RPG.data, RPG.systems);
